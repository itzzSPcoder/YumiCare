#!/usr/bin/env python3
"""
Conditional Generative Adversarial Network (cWGAN-GP) Architecture for Medical Ultrasound Synthesis.
Enables synthesis of realistic B-mode fetal ultrasound scans conditioned on anatomical segmentation masks
(Brain, CSP, Lateral Ventricles).

Upgrades over v1:
  - Generator: base_dim 64→96, num_res_blocks 4→6 for richer texture synthesis
  - Critic: Spectral Normalization on all conv layers (SNGAN-style) for stable WGAN-GP
  - Multi-scale PatchGAN Critic (two scale heads) for sharper minority-class structure details
  - compute_class_weights() utility for imbalanced pixel-level CE training
"""

from __future__ import annotations

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.nn.utils import spectral_norm
from typing import Tuple, List, Optional


# ==========================================
# BUILDING BLOCKS
# ==========================================

class ResBlock(nn.Module):
    """Residual Convolutional Block with InstanceNorm for medical texture synthesis."""
    def __init__(self, channels: int):
        super().__init__()
        self.block = nn.Sequential(
            nn.ReflectionPad2d(1),
            nn.Conv2d(channels, channels, kernel_size=3, bias=False),
            nn.InstanceNorm2d(channels, affine=True),
            nn.LeakyReLU(0.2, inplace=True),
            nn.ReflectionPad2d(1),
            nn.Conv2d(channels, channels, kernel_size=3, bias=False),
            nn.InstanceNorm2d(channels, affine=True)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x + self.block(x)


class CBAM(nn.Module):
    """
    Convolutional Block Attention Module — helps focus on CSP/LV minority regions.
    Channel + Spatial attention applied at bottleneck.
    """
    def __init__(self, channels: int, reduction: int = 8):
        super().__init__()
        self.channel_att = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(channels, channels // reduction, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(channels // reduction, channels, bias=False),
            nn.Sigmoid()
        )
        self.spatial_att = nn.Sequential(
            nn.Conv2d(2, 1, kernel_size=7, padding=3, bias=False),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Channel attention
        b, c, h, w = x.shape
        ca = self.channel_att(x).view(b, c, 1, 1)
        x = x * ca
        # Spatial attention
        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        sa = self.spatial_att(torch.cat([avg_out, max_out], dim=1))
        return x * sa


# ==========================================
# GENERATOR (upgraded: base_dim=96, 6 res blocks, CBAM bottleneck)
# ==========================================

class UltrasoundMaskConditionedGenerator(nn.Module):
    """
    Generator (G): Synthesizes realistic 3-channel (RGB/Grayscale replicated) fetal ultrasound
    images conditioned on multi-class anatomical segmentation masks (num_classes=4: BG, Brain, CSP, LV)
    and an optional stochastic latent noise vector z.

    Upgrade v2: base_dim=96, 6 residual blocks, CBAM attention at bottleneck.
    """
    def __init__(
        self,
        mask_channels: int = 4,
        out_channels: int = 3,
        base_dim: int = 96,
        num_res_blocks: int = 6,
        latent_dim: int = 32
    ):
        super().__init__()
        self.latent_dim = latent_dim
        self.in_dim = mask_channels + (latent_dim if latent_dim > 0 else 0)

        # Initial Feature Extraction
        self.initial = nn.Sequential(
            nn.ReflectionPad2d(3),
            nn.Conv2d(self.in_dim, base_dim, kernel_size=7, bias=False),
            nn.InstanceNorm2d(base_dim, affine=True),
            nn.LeakyReLU(0.2, inplace=True)
        )

        # Downsampling Stages
        self.down1 = nn.Sequential(
            nn.Conv2d(base_dim, base_dim * 2, kernel_size=4, stride=2, padding=1, bias=False),
            nn.InstanceNorm2d(base_dim * 2, affine=True),
            nn.LeakyReLU(0.2, inplace=True)
        )
        self.down2 = nn.Sequential(
            nn.Conv2d(base_dim * 2, base_dim * 4, kernel_size=4, stride=2, padding=1, bias=False),
            nn.InstanceNorm2d(base_dim * 4, affine=True),
            nn.LeakyReLU(0.2, inplace=True)
        )

        # Bottleneck: Residual Blocks + CBAM Attention
        res_blocks = [ResBlock(base_dim * 4) for _ in range(num_res_blocks)]
        self.bottleneck = nn.Sequential(*res_blocks)
        self.cbam = CBAM(base_dim * 4)

        # Upsampling Stages with Skip Connections
        self.up2 = nn.Sequential(
            nn.ConvTranspose2d(base_dim * 4, base_dim * 2, kernel_size=4, stride=2, padding=1, bias=False),
            nn.InstanceNorm2d(base_dim * 2, affine=True),
            nn.LeakyReLU(0.2, inplace=True)
        )
        # skip concat doubles channels → base_dim*4
        self.up1 = nn.Sequential(
            nn.ConvTranspose2d(base_dim * 4, base_dim, kernel_size=4, stride=2, padding=1, bias=False),
            nn.InstanceNorm2d(base_dim, affine=True),
            nn.LeakyReLU(0.2, inplace=True)
        )

        # Final Synthesis Output Layer (skip concat again → base_dim*2)
        self.final = nn.Sequential(
            nn.ReflectionPad2d(3),
            nn.Conv2d(base_dim * 2, out_channels, kernel_size=7),
            nn.Sigmoid()  # normalized image output [0, 1]
        )

    def forward(self, mask_onehot: torch.Tensor, z: Optional[torch.Tensor] = None) -> torch.Tensor:
        """
        mask_onehot: [B, 4, H, W]
        z: [B, latent_dim] or None
        """
        b, _, h, w = mask_onehot.shape
        if self.latent_dim > 0:
            if z is None:
                z = torch.randn(b, self.latent_dim, device=mask_onehot.device)
            z_spatial = z.view(b, self.latent_dim, 1, 1).expand(b, self.latent_dim, h, w)
            x_in = torch.cat([mask_onehot, z_spatial], dim=1)
        else:
            x_in = mask_onehot

        d0 = self.initial(x_in)     # [B, 96, H, W]
        d1 = self.down1(d0)         # [B, 192, H/2, W/2]
        d2 = self.down2(d1)         # [B, 384, H/4, W/4]

        bn = self.bottleneck(d2)    # [B, 384, H/4, W/4]
        bn = self.cbam(bn)          # attention on minority structures

        u2 = self.up2(bn)           # [B, 192, H/2, W/2]
        u2 = torch.cat([u2, d1], dim=1)  # [B, 384, H/2, W/2]

        u1 = self.up1(u2)           # [B, 96, H, W]
        u1 = torch.cat([u1, d0], dim=1)  # [B, 192, H, W]

        out = self.final(u1)        # [B, 3, H, W]
        return out


# ==========================================
# CRITIC (Spectral Norm + Multi-scale PatchGAN)
# ==========================================

class _PatchCriticHead(nn.Module):
    """Single-scale PatchGAN Critic head with Spectral Normalization."""
    def __init__(self, in_channels: int = 7, base_dim: int = 64):
        super().__init__()
        self.model = nn.Sequential(
            # Stage 1
            spectral_norm(nn.Conv2d(in_channels, base_dim, kernel_size=4, stride=2, padding=1)),
            nn.LeakyReLU(0.2, inplace=True),
            # Stage 2
            spectral_norm(nn.Conv2d(base_dim, base_dim * 2, kernel_size=4, stride=2, padding=1)),
            nn.InstanceNorm2d(base_dim * 2, affine=True),
            nn.LeakyReLU(0.2, inplace=True),
            # Stage 3
            spectral_norm(nn.Conv2d(base_dim * 2, base_dim * 4, kernel_size=4, stride=2, padding=1)),
            nn.InstanceNorm2d(base_dim * 4, affine=True),
            nn.LeakyReLU(0.2, inplace=True),
            # Stage 4
            spectral_norm(nn.Conv2d(base_dim * 4, base_dim * 8, kernel_size=4, stride=2, padding=1)),
            nn.InstanceNorm2d(base_dim * 8, affine=True),
            nn.LeakyReLU(0.2, inplace=True),
            # Output patch score
            spectral_norm(nn.Conv2d(base_dim * 8, 1, kernel_size=4, stride=1, padding=1))
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model(x)


class UltrasoundPatchCritic(nn.Module):
    """
    Multi-Scale PatchGAN Critic (D) for WGAN-GP with Spectral Normalization.
    Evaluates real vs synthetic ultrasound scan fidelity conditioned on anatomical mask.

    Two scales:
    - Scale 1: full resolution (128x128) → captures fine CSP/LV details
    - Scale 2: downsampled 2x (64x64) → captures global brain structure
    """
    def __init__(self, in_channels: int = 3 + 4, base_dim: int = 64):
        super().__init__()
        self.head1 = _PatchCriticHead(in_channels=in_channels, base_dim=base_dim)
        self.head2 = _PatchCriticHead(in_channels=in_channels, base_dim=base_dim)
        self.downsample = nn.AvgPool2d(kernel_size=2, stride=2, padding=0)

    def forward(self, img: torch.Tensor, mask_onehot: torch.Tensor) -> torch.Tensor:
        """Returns mean of multi-scale critic scores."""
        x_full = torch.cat([img, mask_onehot], dim=1)
        x_half = torch.cat([
            self.downsample(img),
            self.downsample(mask_onehot)
        ], dim=1)

        score1 = self.head1(x_full)
        score2 = self.head2(x_half)

        # Upsample score2 to match score1 spatial dims before averaging
        score2_up = F.interpolate(score2, size=score1.shape[2:], mode="bilinear", align_corners=False)
        return (score1 + score2_up) * 0.5


# ==========================================
# GRADIENT PENALTY
# ==========================================

def compute_gradient_penalty(
    critic: nn.Module,
    real_imgs: torch.Tensor,
    fake_imgs: torch.Tensor,
    mask_onehot: torch.Tensor,
    device: torch.device
) -> torch.Tensor:
    """
    Computes Gradient Penalty to enforce 1-Lipschitz continuity for WGAN-GP.
    GP = E[(||grad(D(x_hat))||_2 - 1)^2]
    """
    batch_size = real_imgs.size(0)
    alpha = torch.rand(batch_size, 1, 1, 1, device=device)
    interpolated = (alpha * real_imgs + ((1 - alpha) * fake_imgs)).requires_grad_(True)

    critic_interpolated = critic(interpolated, mask_onehot)

    grad_outputs = torch.ones_like(critic_interpolated, device=device, requires_grad=False)
    gradients = torch.autograd.grad(
        outputs=critic_interpolated,
        inputs=interpolated,
        grad_outputs=grad_outputs,
        create_graph=True,
        retain_graph=True,
        only_inputs=True
    )[0]

    gradients = gradients.view(batch_size, -1)
    gradient_norm = gradients.norm(2, dim=1)
    gradient_penalty = torch.mean((gradient_norm - 1.0) ** 2)
    return gradient_penalty


# ==========================================
# CLASS WEIGHT UTILITY
# ==========================================

def compute_class_weights(
    pixel_counts: dict,
    num_classes: int = 4,
    cap: float = 100.0,
    device: torch.device = torch.device("cpu")
) -> torch.Tensor:
    """
    Computes inverse-frequency class weights for CrossEntropyLoss.

    Args:
        pixel_counts: {class_idx: pixel_count} from dataset analysis
        num_classes: total number of classes (4: BG, Brain, CSP, LV)
        cap: maximum weight allowed (prevents extreme upweighting)
        device: target torch device

    Returns:
        weights tensor of shape [num_classes]

    Example (from dataset analysis):
        pixel_counts = {0: 40_489_605, 1: 16_502_230, 2: 56_738, 3: 2_337}
        => weights ≈ [1.41, 3.46, 50.0, 100.0]  (capped)
    """
    total = sum(pixel_counts.values())
    weights = []
    for i in range(num_classes):
        count = pixel_counts.get(i, 1)
        freq = count / total
        w = 1.0 / (freq + 1e-8)
        weights.append(min(w, cap))

    # Normalize so mean weight = 1.0
    weights = np.array(weights, dtype=np.float32)
    weights = weights / weights.mean()
    return torch.tensor(weights, dtype=torch.float32, device=device)


# ==========================================
# DICE LOSS (for minority class boosting)
# ==========================================

class DiceLoss(nn.Module):
    """
    Soft Dice Loss for multi-class segmentation.
    Especially effective for imbalanced classes like CSP and LV.
    Total loss = mean Dice across all foreground classes (excluding background).
    """
    def __init__(self, num_classes: int = 4, smooth: float = 1e-6, ignore_bg: bool = True):
        super().__init__()
        self.num_classes = num_classes
        self.smooth = smooth
        self.ignore_bg = ignore_bg

    def forward(self, pred_logits: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        """
        pred_logits: [B, C, H, W] raw logits
        target: [B, H, W] long class indices
        """
        pred_softmax = F.softmax(pred_logits, dim=1)
        target_onehot = F.one_hot(target, num_classes=self.num_classes)  # [B, H, W, C]
        target_onehot = target_onehot.permute(0, 3, 1, 2).float()        # [B, C, H, W]

        start_cls = 1 if self.ignore_bg else 0
        dice_losses = []
        for cls in range(start_cls, self.num_classes):
            pred_cls = pred_softmax[:, cls]
            target_cls = target_onehot[:, cls]
            intersection = (pred_cls * target_cls).sum()
            dice = (2.0 * intersection + self.smooth) / (
                pred_cls.sum() + target_cls.sum() + self.smooth
            )
            dice_losses.append(1.0 - dice)

        return torch.stack(dice_losses).mean()
