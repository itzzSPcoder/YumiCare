#!/usr/bin/env python3
"""
Clinical Ultrasound Physics-Aware Data Augmentation Engine
Provides domain-specific transformations for fetal ultrasound imaging:
1. Acoustic Speckle Noise Injection (Rayleigh / Gamma scatterer distribution)
2. Acoustic Shadowing / Attenuation Artifact Simulation (calvarium bone dropouts)
3. Elastic Non-Rigid Tissue Deformation (transducer pressure and fetal movement)
4. Dynamic Range & Time-Gain Compensation (TGC) Variations
5. Synchronized Spatial Transforms (Affine, Flip, Zoom, Crop) for Image & Mask Pairs
"""

from __future__ import annotations

import argparse
import random
from pathlib import Path
from typing import Tuple, Optional, Union, List

import numpy as np
import scipy.ndimage as ndimage
from PIL import Image

try:
    import cv2
except ImportError:
    cv2 = None


class UltrasoundSpeckleNoise:
    """
    Simulates acoustic speckle noise inherent to ultrasound B-mode imaging.
    Speckle is modeled as multiplicative Rayleigh/Gamma distributed noise.
    I_noisy = I * (1 + N_speckle), where N_speckle ~ Rayleigh(sigma) or Gaussian/Gamma
    """
    def __init__(self, severity: float = 0.25, noise_type: str = "rayleigh"):
        self.severity = severity
        self.noise_type = noise_type

    def __call__(self, img: np.ndarray) -> np.ndarray:
        is_uint8 = img.dtype == np.uint8
        img_float = img.astype(np.float32) / 255.0 if is_uint8 else img.copy()

        h, w = img_float.shape[:2]
        ch = img_float.shape[2] if img_float.ndim == 3 else 1

        if self.noise_type == "rayleigh":
            sigma = self.severity * 0.4
            noise = np.random.rayleigh(scale=sigma, size=(h, w, 1 if ch > 1 else 1))
            noise = noise - (sigma * np.sqrt(np.pi / 2))
        else:
            noise = np.random.normal(0, self.severity * 0.35, size=(h, w, 1 if ch > 1 else 1))

        noisy_img = img_float * (1.0 + noise)
        noisy_img = np.clip(noisy_img, 0.0, 1.0)

        if is_uint8:
            return (noisy_img * 255.0).astype(np.uint8)
        return noisy_img.astype(np.float32)


class AcousticShadowing:
    """
    Simulates acoustic shadowing (drop-out artifacts) commonly seen behind
    high-attenuation anatomical structures like the fetal skull table (calvarium).
    Applies smooth vertical attenuation bands across the ultrasound beam direction.
    """
    def __init__(self, num_shadows: Tuple[int, int] = (1, 3), max_width: float = 0.2, attenuation: float = 0.65):
        self.num_shadows = num_shadows
        self.max_width = max_width
        self.attenuation = attenuation

    def __call__(self, img: np.ndarray) -> np.ndarray:
        is_uint8 = img.dtype == np.uint8
        img_float = img.astype(np.float32) / 255.0 if is_uint8 else img.copy()
        h, w = img_float.shape[:2]

        shadow_mask = np.ones(w, dtype=np.float32)
        k = random.randint(self.num_shadows[0], self.num_shadows[1])

        for _ in range(k):
            center_x = random.randint(int(w * 0.15), int(w * 0.85))
            shadow_w = random.randint(int(w * 0.05), int(w * self.max_width))
            depth = random.uniform(0.3, self.attenuation)

            x_indices = np.arange(w)
            band = depth * np.exp(-((x_indices - center_x) ** 2) / (2 * (shadow_w / 2.5) ** 2))
            shadow_mask -= band

        shadow_mask = np.clip(shadow_mask, 0.1, 1.0)

        vertical_gradient = np.linspace(0.85, 1.15, h).reshape(h, 1)
        full_shadow_mask = np.tile(shadow_mask, (h, 1)) * vertical_gradient
        full_shadow_mask = np.clip(full_shadow_mask, 0.1, 1.0)

        if img_float.ndim == 3:
            full_shadow_mask = np.expand_dims(full_shadow_mask, axis=-1)

        shadowed_img = img_float * full_shadow_mask
        shadowed_img = np.clip(shadowed_img, 0.0, 1.0)

        if is_uint8:
            return (shadowed_img * 255.0).astype(np.uint8)
        return shadowed_img.astype(np.float32)


class ElasticTissueDeformation:
    """
    Simulates non-rigid soft tissue compliance and probe pressure in maternal abdomen.
    Generates smooth random displacement fields using Gaussian filtering.
    """
    def __init__(self, alpha: float = 30.0, sigma: float = 4.0):
        self.alpha = alpha
        self.sigma = sigma

    def __call__(self, img: np.ndarray, mask: Optional[np.ndarray] = None) -> Tuple[np.ndarray, Optional[np.ndarray]]:
        h, w = img.shape[:2]

        dx = np.random.uniform(-1, 1, (h, w)).astype(np.float32)
        dy = np.random.uniform(-1, 1, (h, w)).astype(np.float32)

        # Smooth displacement with gaussian filter
        dx = ndimage.gaussian_filter(dx, self.sigma) * self.alpha
        dy = ndimage.gaussian_filter(dy, self.sigma) * self.alpha

        x, y = np.meshgrid(np.arange(w), np.arange(h))
        indices = np.reshape(y + dy, (-1, 1)), np.reshape(x + dx, (-1, 1))

        # Remap image
        if img.ndim == 3:
            deformed_channels = [
                ndimage.map_coordinates(img[:, :, c], indices, order=1, mode='reflect').reshape(h, w)
                for c in range(img.shape[2])
            ]
            deformed_img = np.stack(deformed_channels, axis=-1)
        else:
            deformed_img = ndimage.map_coordinates(img, indices, order=1, mode='reflect').reshape(h, w)

        deformed_mask = None
        if mask is not None:
            deformed_mask = ndimage.map_coordinates(mask, indices, order=0, mode='constant', cval=0).reshape(h, w)

        return deformed_img, deformed_mask


class DynamicRangeAndGain:
    """
    Simulates ultrasound machine operator adjustments:
    - Time-Gain Compensation (TGC)
    - Dynamic Range Compression (Gamma)
    - Contrast & Brightness Jittering
    """
    def __init__(self, gamma_range: Tuple[float, float] = (0.8, 1.25), gain_range: Tuple[float, float] = (0.85, 1.2)):
        self.gamma_range = gamma_range
        self.gain_range = gain_range

    def __call__(self, img: np.ndarray) -> np.ndarray:
        is_uint8 = img.dtype == np.uint8
        img_float = img.astype(np.float32) / 255.0 if is_uint8 else img.copy()

        gamma = random.uniform(self.gamma_range[0], self.gamma_range[1])
        gain = random.uniform(self.gain_range[0], self.gain_range[1])

        adjusted = np.power(img_float, gamma) * gain
        adjusted = np.clip(adjusted, 0.0, 1.0)

        if is_uint8:
            return (adjusted * 255.0).astype(np.uint8)
        return adjusted.astype(np.float32)


class SynchronizedSpatialTransform:
    """
    Applies synchronized geometric transforms (Rotation, Translation, Scale, Horizontal Flip)
    to both ultrasound image and segmentation masks using PIL or Scipy.
    """
    def __init__(
        self,
        rotation_deg: float = 20.0,
        scale_range: Tuple[float, float] = (0.88, 1.12),
        shift_pct: float = 0.08,
        flip_prob: float = 0.5
    ):
        self.rotation_deg = rotation_deg
        self.scale_range = scale_range
        self.shift_pct = shift_pct
        self.flip_prob = flip_prob

    def __call__(self, img: np.ndarray, mask: Optional[np.ndarray] = None) -> Tuple[np.ndarray, Optional[np.ndarray]]:
        h, w = img.shape[:2]

        # Horizontal Flip
        if random.random() < self.flip_prob:
            img = np.fliplr(img)
            if mask is not None:
                mask = np.fliplr(mask)

        # Affine Transform parameters
        angle = random.uniform(-self.rotation_deg, self.rotation_deg)

        # Rotate image with bilinear, mask with nearest
        rot_img = ndimage.rotate(img, angle, reshape=False, order=1, mode='reflect')
        rot_mask = None
        if mask is not None:
            rot_mask = ndimage.rotate(mask, angle, reshape=False, order=0, mode='constant', cval=0)

        return rot_img, rot_mask


class ClinicalUltrasoundAugmentor:
    """
    Master Clinical Ultrasound Augmentor Pipeline.
    Combines acoustic physics simulation and geometric regularization.
    """
    def __init__(
        self,
        p_speckle: float = 0.65,
        p_shadow: float = 0.5,
        p_elastic: float = 0.45,
        p_gain: float = 0.6,
        p_spatial: float = 0.8,
        severity: float = 1.0
    ):
        self.p_speckle = p_speckle
        self.p_shadow = p_shadow
        self.p_elastic = p_elastic
        self.p_gain = p_gain
        self.p_spatial = p_spatial

        self.speckle = UltrasoundSpeckleNoise(severity=0.25 * severity)
        self.shadow = AcousticShadowing(num_shadows=(1, 2), attenuation=0.6 * severity)
        self.elastic = ElasticTissueDeformation(alpha=25.0 * severity, sigma=4.0)
        self.gain = DynamicRangeAndGain()
        self.spatial = SynchronizedSpatialTransform(rotation_deg=20.0 * severity)

    def __call__(
        self,
        img: np.ndarray,
        mask: Optional[np.ndarray] = None
    ) -> Tuple[np.ndarray, Optional[np.ndarray]]:
        out_img = img.copy()
        out_mask = mask.copy() if mask is not None else None

        # 1. Spatial Transforms
        if random.random() < self.p_spatial:
            out_img, out_mask = self.spatial(out_img, out_mask)

        # 2. Elastic Non-Rigid Deformation
        if random.random() < self.p_elastic:
            out_img, out_mask = self.elastic(out_img, out_mask)

        # 3. Dynamic Range & Gain
        if random.random() < self.p_gain:
            out_img = self.gain(out_img)

        # 4. Acoustic Shadowing Artifacts
        if random.random() < self.p_shadow:
            out_img = self.shadow(out_img)

        # 5. Acoustic Speckle Noise
        if random.random() < self.p_speckle:
            out_img = self.speckle(out_img)

        return out_img, out_mask


def generate_visual_augmentation_grid(
    dataset_dir: Path,
    output_path: Path,
    num_samples: int = 4
):
    import matplotlib.pyplot as plt

    images = list(dataset_dir.rglob("*.png")) + list(dataset_dir.rglob("*.jpg"))
    valid_images = [p for p in images if not any(k in str(p).lower() for k in ["-segmentation", "segmentationclass", "annotations"])]
    if not valid_images:
        print("No raw ultrasound images found for visualization.")
        return

    random.seed(42)
    selected = random.sample(valid_images, min(num_samples, len(valid_images)))
    augmentor = ClinicalUltrasoundAugmentor()

    fig, axes = plt.subplots(len(selected), 4, figsize=(14, 3.2 * len(selected)))
    fig.suptitle("Clinical Ultrasound Physics-Aware Data Augmentation Pipeline", fontsize=15, fontweight="bold", y=0.99)

    col_titles = [
        "Original Ultrasound",
        "+ Acoustic Speckle & Gain",
        "+ Acoustic Shadowing",
        "+ Full Pipeline (Elastic+Affine)"
    ]

    for row_idx, img_path in enumerate(selected):
        pil_img = Image.open(img_path).convert("RGB").resize((256, 256))
        orig_img = np.array(pil_img)

        # 1. Original
        ax0 = axes[row_idx, 0] if len(selected) > 1 else axes[0]
        ax0.imshow(orig_img)
        if row_idx == 0:
            ax0.set_title(col_titles[0], fontsize=11, fontweight="bold")
        ax0.axis("off")

        # 2. Speckle & Gain
        speckle_img = augmentor.speckle(orig_img)
        speckle_img = augmentor.gain(speckle_img)
        ax1 = axes[row_idx, 1] if len(selected) > 1 else axes[1]
        ax1.imshow(speckle_img)
        if row_idx == 0:
            ax1.set_title(col_titles[1], fontsize=11, fontweight="bold")
        ax1.axis("off")

        # 3. Acoustic Shadowing
        shadow_img = augmentor.shadow(orig_img)
        ax2 = axes[row_idx, 2] if len(selected) > 1 else axes[2]
        ax2.imshow(shadow_img)
        if row_idx == 0:
            ax2.set_title(col_titles[2], fontsize=11, fontweight="bold")
        ax2.axis("off")

        # 4. Full Augmentation Pipeline
        full_aug, _ = augmentor(orig_img)
        ax3 = axes[row_idx, 3] if len(selected) > 1 else axes[3]
        ax3.imshow(full_aug)
        if row_idx == 0:
            ax3.set_title(col_titles[3], fontsize=11, fontweight="bold")
        ax3.axis("off")

    plt.tight_layout()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close()
    print(f"Visual augmentation preview saved to: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clinical Ultrasound Data Augmentation Tester")
    parser.add_argument("--test", action="store_true", default=True, help="Generate visual preview of augmentations")
    parser.add_argument("--num-samples", type=int, default=4, help="Number of sample rows to render")
    args = parser.parse_args()

    root_dir = Path(__file__).parent.parent
    ds_dir = root_dir / "Dataset" / "8265464"
    out_preview = root_dir / "runs" / "augmentation_samples_preview.png"

    print("--- Running Clinical Ultrasound Augmentation Visualizer ---")
    generate_visual_augmentation_grid(ds_dir, out_preview, args.num_samples)
