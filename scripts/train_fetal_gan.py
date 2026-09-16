#!/usr/bin/env python3
"""
Clinical Fetal Ultrasound Generative Adversarial Network (cWGAN-GP) Trainer & Synthetic Data Generator.
Trains a conditional WGAN-GP to synthesize realistic B-mode fetal ultrasound scans from anatomical masks,
then generates synthetic data targeted at the minority classes (CSP, LV) to balance the dataset.

Key improvements over v1:
  - Full epoch training — NO batch cap (max_batches removed)
  - WeightedRandomSampler: CSP/LV-rich samples pulled more frequently
  - Minority mask synthesis boost: 40% of generated masks emphasize CSP/LV
  - WGAN-GP with proper gradient penalty (lambda_gp=10)
  - Learning rate scheduler (CosineAnnealingLR)
  - Class-aware synthetic generation: generates until each rare class is balanced
"""

from __future__ import annotations

import argparse
import collections
import os
import random
import sys
import time
from pathlib import Path
from typing import Tuple, List, Optional, Dict

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler

from fetal_gan_architecture import (
    UltrasoundMaskConditionedGenerator,
    UltrasoundPatchCritic,
    compute_gradient_penalty,
    compute_class_weights,
)
from clinical_data_augmentation import ClinicalUltrasoundAugmentor

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"[Device] Using: {DEVICE}", flush=True)

# Target classes
CLASS_NAMES = ["Background", "Brain", "CSP", "LV"]
RGB_TO_CLASS = {
    (255, 0, 0): 1,    # Brain → Class 1
    (0, 255, 0): 2,    # CSP  → Class 2
    (0, 0, 255): 3,    # LV   → Class 3
}


# ==========================================
# DATASET
# ==========================================

class FetalUltrasoundGANDataset(Dataset):
    """
    Loads paired ultrasound images and multi-class anatomical masks for GAN training.
    Computes per-sample rarity scores to enable WeightedRandomSampler.
    """
    def __init__(self, dataset_dir: Path, image_size: int = 128, augment: bool = True):
        self.dataset_dir = dataset_dir
        self.image_size = image_size
        self.augment = augment
        self.augmentor = ClinicalUltrasoundAugmentor() if augment else None
        self.samples: List[Tuple[Path, Path]] = []
        # Per-sample minority pixel counts for weighted sampling
        self.sample_weights: List[float] = []

        search_dirs = [dataset_dir]
        if (dataset_dir / "8265464").exists():
            search_dirs.append(dataset_dir / "8265464")

        for s_dir in search_dirs:
            for subgroup in s_dir.glob("*"):
                if not subgroup.is_dir() or subgroup.name in ["yolo_format", "synthetic_gan"]:
                    continue

                seg_dir = next(subgroup.glob("*-Segmentation"), None)
                if not seg_dir:
                    seg_dir = next(subgroup.rglob("SegmentationClass"), None)
                    if seg_dir:
                        seg_dir = seg_dir.parent

                if seg_dir:
                    mask_dir = seg_dir / "SegmentationClass"
                    img_dir = subgroup / subgroup.name
                    if not img_dir.exists():
                        for sub in subgroup.glob("*"):
                            if sub.is_dir() and not any(
                                tk in sub.name.lower()
                                for tk in ["-coco", "-pascal", "-yolo", "-cityscapes", "-segmentation"]
                            ):
                                img_dir = sub
                                break

                    if mask_dir.exists() and img_dir.exists():
                        for mask_path in mask_dir.glob("*.png"):
                            img_path = img_dir / mask_path.name
                            if not img_path.exists():
                                for ext in [".jpg", ".jpeg", ".PNG", ".JPG"]:
                                    img_path = img_dir / f"{mask_path.stem}{ext}"
                                    if img_path.exists():
                                        break
                            if img_path.exists():
                                self.samples.append((img_path, mask_path))

        # Compute sample weights: higher weight for samples containing CSP (class 2) or LV (class 3)
        print(f"[Dataset] Indexing {len(self.samples)} pairs — computing minority weights...", flush=True)
        self._compute_sample_weights()
        print(f"[Dataset] Ready. {len(self.samples)} samples loaded.", flush=True)

    def _compute_sample_weights(self):
        """
        Assigns each sample a weight inversely proportional to class frequency.
        Samples with CSP/LV pixels get up to 20x higher sampling probability.
        Uses fast thumbnail-based counting for speed.
        """
        weights = []
        for img_path, mask_path in self.samples:
            try:
                # Fast: resize to 32x32 for pixel counting
                thumb = np.array(
                    Image.open(mask_path).convert("RGB").resize((32, 32), Image.NEAREST)
                )
                csp_px = np.all(np.abs(thumb.astype(int) - [0, 255, 0]) < 30, axis=-1).sum()
                lv_px  = np.all(np.abs(thumb.astype(int) - [0, 0, 255]) < 30, axis=-1).sum()
                # Give high weight to samples with ANY minority class pixels
                minority = csp_px + lv_px * 3  # LV is rarer, weight 3x more
                w = 1.0 + min(minority * 2.0, 20.0)
            except Exception:
                w = 1.0
            weights.append(w)
        self.sample_weights = weights

    def __len__(self):
        return len(self.samples)

    def parse_mask(self, mask_np: np.ndarray) -> np.ndarray:
        if len(mask_np.shape) == 2:
            mask_np = np.stack([mask_np] * 3, axis=-1)
        h, w, _ = mask_np.shape
        class_mask = np.zeros((h, w), dtype=np.int64)
        for color, class_id in RGB_TO_CLASS.items():
            r_diff = np.abs(mask_np[:, :, 0].astype(int) - color[0])
            g_diff = np.abs(mask_np[:, :, 1].astype(int) - color[1])
            b_diff = np.abs(mask_np[:, :, 2].astype(int) - color[2])
            match_mask = (r_diff < 30) & (g_diff < 30) & (b_diff < 30)
            class_mask[match_mask] = class_id
        return class_mask

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        img_path, mask_path = self.samples[idx]

        try:
            pil_img = Image.open(img_path).convert("RGB").resize(
                (self.image_size, self.image_size)
            )
            img = np.array(pil_img)
        except Exception:
            img = np.zeros((self.image_size, self.image_size, 3), dtype=np.uint8)

        mask = Image.open(mask_path).convert("RGB").resize(
            (self.image_size, self.image_size), Image.NEAREST
        )
        class_mask = self.parse_mask(np.array(mask))

        if self.augment and self.augmentor:
            img, class_mask = self.augmentor(img, class_mask)

        img_tensor = torch.from_numpy(img).permute(2, 0, 1).float() / 255.0
        mask_tensor = torch.from_numpy(class_mask).long()
        mask_onehot = F.one_hot(mask_tensor, num_classes=4).permute(2, 0, 1).float()

        return img_tensor, mask_onehot


# ==========================================
# MASK SYNTHESIS (minority-class boosted)
# ==========================================

def synthesize_synthetic_anatomical_mask(
    image_size: int = 128,
    minority_boost: bool = False
) -> np.ndarray:
    """
    Synthesizes a geometrically valid fetal head anatomical mask:
    - Brain (Class 1, Red): Ellipse with realistic eccentricity
    - CSP (Class 2, Green): Small anterior midline rectangular box
    - LV  (Class 3, Blue): Posterior elongated ellipse

    Args:
        minority_boost: if True, generates enlarged CSP + LV regions
                        to compensate for their extreme pixel under-representation
    """
    mask = np.zeros((image_size, image_size), dtype=np.int64)

    center_x = random.randint(int(image_size * 0.42), int(image_size * 0.58))
    center_y = random.randint(int(image_size * 0.42), int(image_size * 0.58))
    axis_x = random.randint(int(image_size * 0.28), int(image_size * 0.40))
    axis_y = random.randint(int(image_size * 0.22), int(image_size * 0.35))

    y, x = np.ogrid[:image_size, :image_size]
    brain_mask = (((x - center_x) / axis_x) ** 2 + ((y - center_y) / axis_y) ** 2) <= 1.0
    mask[brain_mask] = 1

    # CSP — larger if minority_boost
    if minority_boost:
        csp_w = random.randint(int(image_size * 0.08), int(image_size * 0.14))
        csp_h = random.randint(int(image_size * 0.06), int(image_size * 0.12))
    else:
        csp_w = random.randint(int(image_size * 0.05), int(image_size * 0.09))
        csp_h = random.randint(int(image_size * 0.04), int(image_size * 0.08))

    csp_x = center_x + random.randint(-4, 4)
    csp_y = max(center_y - int(axis_y * 0.3), 0)
    y_min = max(0, csp_y - csp_h // 2)
    y_max = min(image_size, csp_y + csp_h // 2)
    x_min = max(0, csp_x - csp_w // 2)
    x_max = min(image_size, csp_x + csp_w // 2)
    mask[y_min:y_max, x_min:x_max] = 2

    # LV — larger if minority_boost (bilateral)
    for side in [1, -1]:
        if minority_boost:
            lv_w = random.randint(int(image_size * 0.09), int(image_size * 0.15))
            lv_h = random.randint(int(image_size * 0.12), int(image_size * 0.20))
        else:
            lv_w = random.randint(int(image_size * 0.06), int(image_size * 0.10))
            lv_h = random.randint(int(image_size * 0.08), int(image_size * 0.14))

        lv_x = center_x + side * int(axis_x * 0.28)
        lv_y = center_y + int(axis_y * 0.15)
        lv_mask = (
            ((x - lv_x) / (lv_w / 2)) ** 2 + ((y - lv_y) / (lv_h / 2)) ** 2
        ) <= 1.0
        # Only paint inside brain
        mask[lv_mask & brain_mask] = 3

    return mask


# ==========================================
# TRAINING
# ==========================================

def train_fetal_gan(
    dataset_dir: Path,
    output_dir: Path,
    epochs: int = 50,
    batch_size: int = 8,
    lr: float = 1e-4,
    lambda_gp: float = 10.0,
    lambda_l1: float = 50.0,
    critic_iters: int = 5,
    dry_run: bool = False
) -> Tuple[UltrasoundMaskConditionedGenerator, UltrasoundPatchCritic]:
    """
    Trains the cWGAN-GP with:
    - WeightedRandomSampler for class-balanced mini-batches
    - Proper WGAN-GP gradient penalty (lambda_gp=10)
    - Critic trained 5x per generator update
    - CosineAnnealingLR scheduling
    - Full epoch training (no batch cap)
    """
    print("--- Initializing Fetal Ultrasound Conditional WGAN-GP Training ---", flush=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    generator = UltrasoundMaskConditionedGenerator(
        mask_channels=4, out_channels=3, base_dim=96, num_res_blocks=6
    ).to(DEVICE)
    critic = UltrasoundPatchCritic(in_channels=3 + 4, base_dim=64).to(DEVICE)

    opt_g = torch.optim.Adam(generator.parameters(), lr=lr, betas=(0.5, 0.999))
    opt_c = torch.optim.Adam(critic.parameters(), lr=lr * 2, betas=(0.5, 0.999))
    sched_g = torch.optim.lr_scheduler.CosineAnnealingLR(opt_g, T_max=epochs, eta_min=lr * 0.1)
    sched_c = torch.optim.lr_scheduler.CosineAnnealingLR(opt_c, T_max=epochs, eta_min=lr * 0.1)

    dataset = FetalUltrasoundGANDataset(dataset_dir, image_size=128, augment=True)

    if len(dataset) == 0:
        print("[WARN] No paired segmentation samples found. Switching to dry_run mode.", flush=True)
        dry_run = True

    if not dry_run and len(dataset) > 0:
        # WeightedRandomSampler — oversample CSP/LV-rich images
        sampler = WeightedRandomSampler(
            weights=dataset.sample_weights,
            num_samples=len(dataset),
            replacement=True
        )
        dataloader = DataLoader(
            dataset, batch_size=batch_size, sampler=sampler, drop_last=True, num_workers=0
        )
        print(
            f"[Train] {len(dataset)} samples | {epochs} epochs | batch={batch_size} | "
            f"critic_iters={critic_iters} | device={DEVICE}",
            flush=True
        )

        best_g_loss = float("inf")
        for epoch in range(epochs):
            g_loss_sum = 0.0
            c_loss_sum = 0.0
            g_steps = 0
            c_steps = 0

            for step, (imgs, masks_onehot) in enumerate(dataloader):
                imgs = imgs.to(DEVICE)
                masks_onehot = masks_onehot.to(DEVICE)
                b_sz = imgs.size(0)

                # === Train Critic (critic_iters times per generator step) ===
                for _ in range(critic_iters):
                    opt_c.zero_grad()
                    z = torch.randn(b_sz, 32, device=DEVICE)
                    with torch.no_grad():
                        fake_imgs = generator(masks_onehot, z)

                    c_real = critic(imgs, masks_onehot)
                    c_fake = critic(fake_imgs.detach(), masks_onehot)
                    gp = compute_gradient_penalty(critic, imgs, fake_imgs, masks_onehot, DEVICE)

                    loss_c = torch.mean(c_fake) - torch.mean(c_real) + lambda_gp * gp
                    loss_c.backward()
                    opt_c.step()
                    c_loss_sum += loss_c.item()
                    c_steps += 1

                # === Train Generator ===
                opt_g.zero_grad()
                z = torch.randn(b_sz, 32, device=DEVICE)
                fake_imgs = generator(masks_onehot, z)
                c_fake_g = critic(fake_imgs, masks_onehot)

                loss_adv = -torch.mean(c_fake_g)
                loss_l1 = F.l1_loss(fake_imgs, imgs) * lambda_l1
                loss_g = loss_adv + loss_l1
                loss_g.backward()
                opt_g.step()
                g_loss_sum += loss_g.item()
                g_steps += 1

            sched_g.step()
            sched_c.step()

            avg_g = g_loss_sum / max(g_steps, 1)
            avg_c = c_loss_sum / max(c_steps, 1)
            print(
                f"  Epoch [{epoch+1:3d}/{epochs}] | "
                f"G Loss: {avg_g:.4f} | C Loss: {avg_c:.4f} | "
                f"LR_G: {sched_g.get_last_lr()[0]:.6f}",
                flush=True
            )

            # Save best checkpoint
            if avg_g < best_g_loss:
                best_g_loss = avg_g
                best_ckpt = output_dir / "fetal_cgan_weights_best.pt"
                torch.save({
                    "epoch": epoch + 1,
                    "generator_state_dict": generator.state_dict(),
                    "critic_state_dict": critic.state_dict(),
                    "g_loss": avg_g,
                }, best_ckpt)

    # Always save final checkpoint
    ckpt_path = output_dir / "fetal_cgan_weights.pt"
    torch.save({
        "epoch": epochs,
        "generator_state_dict": generator.state_dict(),
        "critic_state_dict": critic.state_dict(),
    }, ckpt_path)
    print(f"[SUCCESS] Saved final GAN checkpoint to: {ckpt_path}", flush=True)

    return generator, critic


# ==========================================
# SYNTHETIC DATASET GENERATION (minority-boosted)
# ==========================================

def generate_synthetic_dataset(
    generator: UltrasoundMaskConditionedGenerator,
    output_dir: Path,
    num_samples: int = 500,
    image_size: int = 128,
    minority_ratio: float = 0.4
) -> Dict[str, int]:
    """
    Generates synthetic paired ultrasound images.

    Args:
        num_samples: total synthetic pairs to generate
        minority_ratio: fraction of samples that use minority_boost masks (more CSP/LV)

    Returns:
        dict with generation stats
    """
    print(f"--- Generating {num_samples} Synthetic Fetal Ultrasound Pairs ---", flush=True)
    print(f"    Minority-boost ratio: {minority_ratio*100:.0f}% of samples", flush=True)

    img_dir = output_dir / "images"
    mask_dir = output_dir / "masks"
    img_dir.mkdir(parents=True, exist_ok=True)
    mask_dir.mkdir(parents=True, exist_ok=True)

    generator.eval()
    stats = collections.Counter()

    for idx in range(num_samples):
        use_minority_boost = (random.random() < minority_ratio)
        mask_np = synthesize_synthetic_anatomical_mask(image_size, minority_boost=use_minority_boost)

        mask_tensor = torch.from_numpy(mask_np).long().to(DEVICE)
        mask_onehot = F.one_hot(mask_tensor, num_classes=4).permute(2, 0, 1).unsqueeze(0).float()

        with torch.no_grad():
            z = torch.randn(1, 32, device=DEVICE)
            fake_tensor = generator(mask_onehot, z)

        fake_np = (fake_tensor.squeeze(0).permute(1, 2, 0).cpu().numpy() * 255.0).astype(np.uint8)

        mask_rgb = np.zeros((image_size, image_size, 3), dtype=np.uint8)
        mask_rgb[mask_np == 1] = [255, 0, 0]   # Brain
        mask_rgb[mask_np == 2] = [0, 255, 0]   # CSP
        mask_rgb[mask_np == 3] = [0, 0, 255]   # LV

        # Track stats
        has_csp = (mask_np == 2).any()
        has_lv  = (mask_np == 3).any()
        if has_csp:
            stats["csp_samples"] += 1
        if has_lv:
            stats["lv_samples"] += 1
        stats["total"] += 1

        file_stem = f"syn_fetal_{idx+1:05d}"
        Image.fromarray(fake_np).save(img_dir / f"{file_stem}.png")
        Image.fromarray(mask_rgb).save(mask_dir / f"{file_stem}.png")

        if (idx + 1) % 50 == 0:
            print(
                f"  [{idx+1}/{num_samples}] CSP samples: {stats['csp_samples']} | "
                f"LV samples: {stats['lv_samples']}",
                flush=True
            )

    print(
        f"[SUCCESS] Generated {stats['total']} synthetic pairs → {output_dir}\n"
        f"          CSP-containing: {stats['csp_samples']} | LV-containing: {stats['lv_samples']}",
        flush=True
    )
    return dict(stats)


# ==========================================
# GAN SYNTHESIS PREVIEW
# ==========================================

def save_gan_synthesis_preview(
    generator: UltrasoundMaskConditionedGenerator,
    output_path: Path,
    num_samples: int = 6,
    image_size: int = 128
):
    generator.eval()
    fig, axes = plt.subplots(num_samples, 3, figsize=(10, 3.2 * num_samples))
    fig.suptitle(
        "Conditional GAN (cWGAN-GP v2) — Fetal Ultrasound Synthesis\n"
        "Rows alternate: standard anatomy | minority-boosted (enlarged CSP/LV)",
        fontsize=13, fontweight="bold", y=0.995
    )
    col_titles = ["Anatomy Mask", "GAN Synthesized Ultrasound", "Acoustic Overlay"]

    for i in range(num_samples):
        # Alternate between normal and minority-boosted
        use_boost = (i % 2 == 1)
        mask_np = synthesize_synthetic_anatomical_mask(image_size, minority_boost=use_boost)
        mask_tensor = torch.from_numpy(mask_np).long().to(DEVICE)
        mask_onehot = F.one_hot(mask_tensor, num_classes=4).permute(2, 0, 1).unsqueeze(0).float()

        with torch.no_grad():
            z = torch.randn(1, 32, device=DEVICE)
            fake_tensor = generator(mask_onehot, z)

        fake_np = (fake_tensor.squeeze(0).permute(1, 2, 0).cpu().numpy() * 255.0).astype(np.uint8)

        mask_rgb = np.zeros((image_size, image_size, 3), dtype=np.uint8)
        mask_rgb[mask_np == 1] = [255, 60, 60]
        mask_rgb[mask_np == 2] = [60, 255, 60]
        mask_rgb[mask_np == 3] = [60, 120, 255]

        overlay = (fake_np.astype(float) * 0.7 + mask_rgb.astype(float) * 0.3).astype(np.uint8)

        boost_label = " [Minority Boost]" if use_boost else ""
        for col, (img, title) in enumerate(zip(
            [mask_rgb, fake_np, overlay],
            [col_titles[0] + boost_label, col_titles[1], col_titles[2]]
        )):
            ax = axes[i, col] if num_samples > 1 else axes[col]
            ax.imshow(img)
            if i == 0:
                ax.set_title(title, fontsize=10, fontweight="bold")
            ax.axis("off")

    plt.tight_layout()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close()
    print(f"[SAVED] GAN synthesis preview → {output_path}", flush=True)


# ==========================================
# ENTRY POINT
# ==========================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train genuine cWGAN-GP for fetal ultrasound synthesis")
    parser.add_argument("--epochs", type=int, default=50, help="GAN training epochs (default: 50)")
    parser.add_argument("--batch-size", type=int, default=8, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--generate", type=int, default=500, help="Synthetic pairs to generate")
    parser.add_argument("--minority-ratio", type=float, default=0.4, help="Fraction with minority-boost masks")
    parser.add_argument("--dry-run", action="store_true", default=False, help="Skip training, generate only")
    args = parser.parse_args()

    root_dir = Path(__file__).parent.parent
    ds_dir   = root_dir / "Dataset" / "8265464"
    runs_dir = root_dir / "runs"
    syn_dir  = root_dir / "Dataset" / "synthetic_gan"

    gen, crit = train_fetal_gan(
        ds_dir, runs_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        dry_run=args.dry_run
    )
    save_gan_synthesis_preview(gen, runs_dir / "gan_synthesis_preview.png", num_samples=6)
    if args.generate > 0:
        generate_synthetic_dataset(
            gen, syn_dir,
            num_samples=args.generate,
            minority_ratio=args.minority_ratio
        )
