#!/usr/bin/env python3
"""
REAL Fetal Ultrasound Segmentation Benchmark
=============================================
This script ACTUALLY trains models on real data and computes genuine metrics.
No dry-run, no hardcoded numbers, no SOTA estimates.

Optimized for CPU training:
  - Image size: 64x64 (fast forward/backward pass)
  - Lightweight feature maps
  - 10 epochs per run, full dataset
  - 80/20 train/val split with seed=42

Produces: runs/real_benchmark_results.csv
"""

from __future__ import annotations
import argparse, csv, os, sys, time, math
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torch.utils.data import Dataset, DataLoader, random_split

# Import clinical augmentation
sys.path.insert(0, str(Path(__file__).parent))
try:
    from clinical_data_augmentation import ClinicalUltrasoundAugmentor
except ImportError:
    ClinicalUltrasoundAugmentor = None

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
IMG_SIZE = 64  # Small for CPU speed
NUM_CLASSES = 4  # background + Brain + CSP + LV
CLASS_NAMES = ["Brain", "CSP", "LV"]
SEED = 42

RGB_TO_CLASS = {
    (255, 0, 0): 1,  # Brain
    (0, 255, 0): 2,   # CSP
    (0, 0, 255): 3,   # LV
}

torch.manual_seed(SEED)
np.random.seed(SEED)

# ============================================================
# MODEL ARCHITECTURES (lightweight for CPU)
# ============================================================

class ConvBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )
    def forward(self, x):
        return self.conv(x)


class UNet(nn.Module):
    def __init__(self, in_ch=3, out_ch=4, features=None):
        super().__init__()
        if features is None:
            features = [32, 64, 128, 256]
        self.downs = nn.ModuleList()
        self.ups = nn.ModuleList()
        self.pool = nn.MaxPool2d(2, 2)

        c = in_ch
        for f in features:
            self.downs.append(ConvBlock(c, f))
            c = f
        self.bottleneck = ConvBlock(features[-1], features[-1] * 2)
        for f in reversed(features):
            self.ups.append(nn.ConvTranspose2d(f * 2, f, 2, 2))
            self.ups.append(ConvBlock(f * 2, f))
        self.final = nn.Conv2d(features[0], out_ch, 1)

    def forward(self, x):
        skips = []
        for d in self.downs:
            x = d(x)
            skips.append(x)
            x = self.pool(x)
        x = self.bottleneck(x)
        skips = skips[::-1]
        for i in range(0, len(self.ups), 2):
            x = self.ups[i](x)
            s = skips[i // 2]
            if x.shape != s.shape:
                x = F.interpolate(x, size=s.shape[2:], mode="bilinear", align_corners=True)
            x = self.ups[i + 1](torch.cat([s, x], dim=1))
        return self.final(x)


class AttentionGate(nn.Module):
    def __init__(self, Fg, Fl, Fint):
        super().__init__()
        self.Wg = nn.Sequential(nn.Conv2d(Fg, Fint, 1, bias=False), nn.BatchNorm2d(Fint))
        self.Wx = nn.Sequential(nn.Conv2d(Fl, Fint, 1, bias=False), nn.BatchNorm2d(Fint))
        self.psi = nn.Sequential(nn.Conv2d(Fint, 1, 1, bias=False), nn.BatchNorm2d(1), nn.Sigmoid())
        self.relu = nn.ReLU(inplace=True)

    def forward(self, g, x):
        g1 = self.Wg(g)
        x1 = self.Wx(x)
        if g1.shape != x1.shape:
            g1 = F.interpolate(g1, size=x1.shape[2:], mode="bilinear", align_corners=True)
        return x * self.psi(self.relu(g1 + x1))


class AttentionUNet(nn.Module):
    def __init__(self, in_ch=3, out_ch=4, features=None):
        super().__init__()
        if features is None:
            features = [32, 64, 128, 256]
        self.downs = nn.ModuleList()
        self.ups = nn.ModuleList()
        self.attns = nn.ModuleList()
        self.pool = nn.MaxPool2d(2, 2)

        c = in_ch
        for f in features:
            self.downs.append(ConvBlock(c, f))
            c = f
        self.bottleneck = ConvBlock(features[-1], features[-1] * 2)
        for f in reversed(features):
            self.ups.append(nn.ConvTranspose2d(f * 2, f, 2, 2))
            self.attns.append(AttentionGate(f, f, f // 2))
            self.ups.append(ConvBlock(f * 2, f))
        self.final = nn.Conv2d(features[0], out_ch, 1)

    def forward(self, x):
        skips = []
        for d in self.downs:
            x = d(x)
            skips.append(x)
            x = self.pool(x)
        x = self.bottleneck(x)
        skips = skips[::-1]
        for i in range(len(skips)):
            x = self.ups[i * 2](x)
            s = skips[i]
            if x.shape != s.shape:
                x = F.interpolate(x, size=s.shape[2:], mode="bilinear", align_corners=True)
            s = self.attns[i](g=x, x=s)
            x = self.ups[i * 2 + 1](torch.cat([s, x], dim=1))
        return self.final(x)


class DoubleUNet(nn.Module):
    def __init__(self, in_ch=3, out_ch=4):
        super().__init__()
        self.unet1 = UNet(in_ch, out_ch, [16, 32, 64, 128])
        self.unet2 = UNet(in_ch + out_ch, out_ch, [16, 32, 64, 128])
        self.fuse = nn.Conv2d(out_ch * 2, out_ch, 1)

    def forward(self, x):
        out1 = self.unet1(x)
        x2 = torch.cat([x, F.softmax(out1, dim=1)], dim=1)
        out2 = self.unet2(x2)
        return self.fuse(torch.cat([out1, out2], dim=1))


class UNet3Plus(nn.Module):
    def __init__(self, in_ch=3, out_ch=4, features=None):
        super().__init__()
        if features is None:
            features = [16, 32, 64, 128, 256]
        self.encs = nn.ModuleList()
        self.pool = nn.MaxPool2d(2, 2)
        c = in_ch
        for f in features:
            self.encs.append(ConvBlock(c, f))
            c = f

        cat_ch = features[0] * 5
        self.dec4 = ConvBlock(cat_ch, cat_ch)
        self.dec3 = ConvBlock(cat_ch, cat_ch)
        self.dec2 = ConvBlock(cat_ch, cat_ch)
        self.dec1 = ConvBlock(cat_ch, cat_ch)
        self.final = nn.Conv2d(cat_ch, out_ch, 1)
        self.n_f0 = features[0]

    def _resize(self, x, size):
        return F.interpolate(x, size=size, mode="bilinear", align_corners=True)

    def _pad_cat(self, tensors, target_ch):
        """Concatenate and pad/trim to target_ch channels."""
        cat = torch.cat(tensors, dim=1)
        if cat.shape[1] > target_ch:
            cat = cat[:, :target_ch]
        elif cat.shape[1] < target_ch:
            pad = torch.zeros(cat.shape[0], target_ch - cat.shape[1], cat.shape[2], cat.shape[3], device=cat.device)
            cat = torch.cat([cat, pad], dim=1)
        return cat

    def forward(self, x):
        es = []
        for i, enc in enumerate(self.encs):
            x = enc(x) if i == 0 else enc(self.pool(x))
            es.append(x)

        tch = self.n_f0 * 5
        sz4 = es[3].shape[2:]
        d4 = self.dec4(self._pad_cat([
            self._resize(F.max_pool2d(es[0], 8), sz4),
            self._resize(F.max_pool2d(es[1], 4), sz4),
            self._resize(F.max_pool2d(es[2], 2), sz4),
            es[3],
            self._resize(es[4], sz4),
        ], tch))

        sz3 = es[2].shape[2:]
        d3 = self.dec3(self._pad_cat([
            self._resize(F.max_pool2d(es[0], 4), sz3),
            self._resize(F.max_pool2d(es[1], 2), sz3),
            es[2],
            self._resize(d4, sz3),
            self._resize(es[4], sz3),
        ], tch))

        sz2 = es[1].shape[2:]
        d2 = self.dec2(self._pad_cat([
            self._resize(F.max_pool2d(es[0], 2), sz2),
            es[1],
            self._resize(d3, sz2),
            self._resize(d4, sz2),
            self._resize(es[4], sz2),
        ], tch))

        sz1 = es[0].shape[2:]
        d1 = self.dec1(self._pad_cat([
            es[0],
            self._resize(d2, sz1),
            self._resize(d3, sz1),
            self._resize(d4, sz1),
            self._resize(es[4], sz1),
        ], tch))

        return self.final(d1)


class SwinBlock(nn.Module):
    def __init__(self, dim, num_heads=4, sr_ratio=4):
        super().__init__()
        self.num_heads = num_heads
        self.scale = (dim // num_heads) ** -0.5
        self.q = nn.Linear(dim, dim, bias=False)
        self.k = nn.Linear(dim, dim, bias=False)
        self.v = nn.Linear(dim, dim, bias=False)
        self.proj = nn.Linear(dim, dim)
        self.norm = nn.LayerNorm(dim)
        self.sr_ratio = sr_ratio
        if sr_ratio > 1:
            self.sr = nn.Conv2d(dim, dim, sr_ratio, stride=sr_ratio)
            self.sr_norm = nn.LayerNorm(dim)

    def forward(self, x):
        b, c, h, w = x.shape
        xf = x.permute(0, 2, 3, 1).reshape(b, h * w, c)
        xn = self.norm(xf)
        q = self.q(xn).reshape(b, h * w, self.num_heads, c // self.num_heads).permute(0, 2, 1, 3)
        if self.sr_ratio > 1:
            xs = self.sr(x).permute(0, 2, 3, 1).reshape(b, -1, c)
            xs = self.sr_norm(xs)
            k = self.k(xs).reshape(b, -1, self.num_heads, c // self.num_heads).permute(0, 2, 1, 3)
            v = self.v(xs).reshape(b, -1, self.num_heads, c // self.num_heads).permute(0, 2, 1, 3)
        else:
            k = self.k(xn).reshape(b, h * w, self.num_heads, c // self.num_heads).permute(0, 2, 1, 3)
            v = self.v(xn).reshape(b, h * w, self.num_heads, c // self.num_heads).permute(0, 2, 1, 3)
        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = attn.softmax(dim=-1)
        out = (attn @ v).transpose(1, 2).reshape(b, h * w, c)
        out = self.proj(out).reshape(b, h, w, c).permute(0, 3, 1, 2)
        return x + out


class SwinUNet(nn.Module):
    def __init__(self, in_ch=3, out_ch=4, dim=32):
        super().__init__()
        self.proj = nn.Conv2d(in_ch, dim, 3, padding=1)
        self.enc1 = SwinBlock(dim, num_heads=4, sr_ratio=8)
        self.down1 = nn.Conv2d(dim, dim * 2, 2, stride=2)
        self.enc2 = SwinBlock(dim * 2, num_heads=4, sr_ratio=4)
        self.down2 = nn.Conv2d(dim * 2, dim * 4, 2, stride=2)
        self.enc3 = SwinBlock(dim * 4, num_heads=4, sr_ratio=2)
        self.bottleneck = SwinBlock(dim * 4, num_heads=4, sr_ratio=1)
        self.up2 = nn.ConvTranspose2d(dim * 4, dim * 2, 2, stride=2)
        self.dec2 = SwinBlock(dim * 2, num_heads=4, sr_ratio=4)
        self.up1 = nn.ConvTranspose2d(dim * 2, dim, 2, stride=2)
        self.dec1 = SwinBlock(dim, num_heads=4, sr_ratio=8)
        self.final = nn.Conv2d(dim, out_ch, 1)

    def forward(self, x):
        h, w = x.shape[2:]
        x = self.proj(x)
        e1 = self.enc1(x)
        e2 = self.enc2(self.down1(e1))
        e3 = self.enc3(self.down2(e2))
        b = self.bottleneck(e3)
        d2 = self.up2(b)
        if d2.shape != e2.shape:
            d2 = F.interpolate(d2, size=e2.shape[2:], mode="bilinear", align_corners=True)
        d2 = self.dec2(d2 + e2)
        d1 = self.up1(d2)
        if d1.shape != e1.shape:
            d1 = F.interpolate(d1, size=e1.shape[2:], mode="bilinear", align_corners=True)
        d1 = self.dec1(d1 + e1)
        out = self.final(d1)
        if out.shape[2:] != (h, w):
            out = F.interpolate(out, size=(h, w), mode="bilinear", align_corners=True)
        return out


# ============================================================
# DATASET
# ============================================================

class FetalDataset(Dataset):
    def __init__(self, dataset_dir: Path, augment=False, synthetic_dir=None):
        self.samples = []
        self.augment = augment
        self.augmentor = None
        if augment and ClinicalUltrasoundAugmentor is not None:
            try:
                self.augmentor = ClinicalUltrasoundAugmentor()
            except Exception:
                self.augmentor = None

        # Index all image/mask pairs
        search_dirs = [dataset_dir]
        if (dataset_dir / "8265464").exists():
            search_dirs.append(dataset_dir / "8265464")

        for s_dir in search_dirs:
            for subgroup in s_dir.glob("*"):
                if not subgroup.is_dir() or subgroup.name in ["yolo_format", "synthetic_gan"]:
                    continue
                seg_dir = next(subgroup.glob("*-Segmentation"), None)
                if not seg_dir:
                    seg_dir_candidate = next(subgroup.rglob("SegmentationClass"), None)
                    if seg_dir_candidate:
                        seg_dir = seg_dir_candidate.parent

                if seg_dir:
                    mask_dir = seg_dir / "SegmentationClass"
                    img_dir = subgroup / subgroup.name
                    if not img_dir.exists():
                        for sub in subgroup.glob("*"):
                            if sub.is_dir() and not any(t in sub.name.lower() for t in ["-coco", "-pascal", "-yolo", "-cityscapes", "-segmentation", "imagesets"]):
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

        # Add synthetic GAN data
        if synthetic_dir and synthetic_dir.exists():
            syn_imgs = synthetic_dir / "images"
            syn_masks = synthetic_dir / "masks"
            if syn_imgs.exists() and syn_masks.exists():
                syn_count = 0
                for si in syn_imgs.glob("*.png"):
                    sm = syn_masks / si.name
                    if sm.exists():
                        self.samples.append((si, sm))
                        syn_count += 1
                if syn_count > 0:
                    print(f"    + {syn_count} GAN-synthesized pairs added")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, mask_path = self.samples[idx]

        try:
            img = np.array(Image.open(img_path).convert("RGB").resize((IMG_SIZE, IMG_SIZE)))
        except Exception:
            img = np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.uint8)

        mask_rgb = np.array(Image.open(mask_path).convert("RGB").resize((IMG_SIZE, IMG_SIZE), Image.NEAREST))
        class_mask = np.zeros((IMG_SIZE, IMG_SIZE), dtype=np.int64)
        for color, cls_id in RGB_TO_CLASS.items():
            match = (
                (np.abs(mask_rgb[:, :, 0].astype(int) - color[0]) < 30) &
                (np.abs(mask_rgb[:, :, 1].astype(int) - color[1]) < 30) &
                (np.abs(mask_rgb[:, :, 2].astype(int) - color[2]) < 30)
            )
            class_mask[match] = cls_id

        if self.augment and self.augmentor is not None:
            try:
                img, class_mask = self.augmentor(img, class_mask)
            except Exception:
                pass

        img_t = torch.from_numpy(img).permute(2, 0, 1).float() / 255.0
        mask_t = torch.from_numpy(class_mask).long()
        return img_t, mask_t


# ============================================================
# METRICS (computed on real predictions)
# ============================================================

def compute_metrics(pred: torch.Tensor, target: torch.Tensor):
    """Compute per-class IoU, Dice, Precision, Recall on real predictions."""
    pred_cls = torch.argmax(pred, dim=1)
    ious, dices, precs, recs = [], [], [], []

    for c in range(1, NUM_CLASSES):
        pc = (pred_cls == c)
        tc = (target == c)
        tp = (pc & tc).sum().item()
        fp = (pc & ~tc).sum().item()
        fn = (~pc & tc).sum().item()

        iou = tp / (tp + fp + fn + 1e-8)
        dice = (2 * tp) / (2 * tp + fp + fn + 1e-8)
        prec = tp / (tp + fp + 1e-8)
        rec = tp / (tp + fn + 1e-8)

        ious.append(iou)
        dices.append(dice)
        precs.append(prec)
        recs.append(rec)

    return {
        "class_ious": ious,
        "class_dices": dices,
        "class_precs": precs,
        "class_recs": recs,
        "mean_iou": np.mean(ious),
        "mean_dice": np.mean(dices),
        "mean_prec": np.mean(precs),
        "mean_rec": np.mean(recs),
    }


# ============================================================
# TRAINING + EVALUATION
# ============================================================

def train_and_evaluate(
    model_name: str,
    model: nn.Module,
    train_loader: DataLoader,
    val_loader: DataLoader,
    epochs: int,
    lr: float = 1e-3,
):
    """Actually train and evaluate. Returns real metrics dict."""
    model = model.to(DEVICE)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.CrossEntropyLoss()
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    print(f"    Training {model_name} for {epochs} epochs "
          f"({len(train_loader)} batches/epoch)...")

    for epoch in range(epochs):
        model.train()
        total_loss = 0
        n_batches = 0
        for imgs, masks in train_loader:
            imgs, masks = imgs.to(DEVICE), masks.to(DEVICE)
            optimizer.zero_grad()
            preds = model(imgs)
            loss = criterion(preds, masks)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            n_batches += 1

        scheduler.step()
        avg_loss = total_loss / max(n_batches, 1)
        if (epoch + 1) % 3 == 0 or epoch == 0 or epoch == epochs - 1:
            print(f"      Epoch [{epoch+1}/{epochs}] Loss: {avg_loss:.4f}")

    # Evaluate on FULL validation set
    model.eval()
    all_metrics = {"class_ious": [], "class_dices": [], "class_precs": [], "class_recs": []}
    with torch.no_grad():
        for imgs, masks in val_loader:
            imgs, masks = imgs.to(DEVICE), masks.to(DEVICE)
            preds = model(imgs)
            m = compute_metrics(preds, masks)
            for k in all_metrics:
                all_metrics[k].append(m[k])

    # Average across all val batches
    result = {
        "mean_iou": float(np.mean([np.mean(x) for x in all_metrics["class_ious"]])),
        "mean_dice": float(np.mean([np.mean(x) for x in all_metrics["class_dices"]])),
        "precision": float(np.mean([np.mean(x) for x in all_metrics["class_precs"]])),
        "recall": float(np.mean([np.mean(x) for x in all_metrics["class_recs"]])),
    }

    # Per-class averages
    per_class_ious = np.mean(all_metrics["class_ious"], axis=0).tolist()
    per_class_dices = np.mean(all_metrics["class_dices"], axis=0).tolist()
    result["per_class_ious"] = per_class_ious
    result["per_class_dices"] = per_class_dices

    print(f"    => IoU: {result['mean_iou']:.4f} | Dice: {result['mean_dice']:.4f} | "
          f"Prec: {result['precision']:.4f} | Rec: {result['recall']:.4f}")

    return result


# ============================================================
# MAIN BENCHMARK
# ============================================================

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=10, help="Epochs per training run")
    parser.add_argument("--batch-size", type=int, default=8, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")
    args = parser.parse_args()

    root = Path(__file__).parent.parent
    dataset_dir = root / "Dataset" / "8265464"
    syn_dir = root / "Dataset" / "synthetic_gan"
    runs_dir = root / "runs"
    runs_dir.mkdir(exist_ok=True)

    if not dataset_dir.exists():
        print(f"ERROR: Dataset not found at {dataset_dir}")
        sys.exit(1)

    model_factories = {
        "UNet": lambda: UNet(features=[32, 64, 128, 256]),
        "Double U-Net": lambda: DoubleUNet(),
        "Attention U-Net": lambda: AttentionUNet(features=[32, 64, 128, 256]),
        "UNet 3+": lambda: UNet3Plus(features=[16, 32, 64, 128, 256]),
        "Swin U-Net": lambda: SwinUNet(dim=32),
    }

    regimes = [
        ("Baseline (Raw)", False, None),
        ("Clinical Augmentation", True, None),
        ("GAN-Augmented Synthesis", True, syn_dir),
    ]

    all_results = []
    per_class_results = []

    total_runs = len(model_factories) * len(regimes)
    run_idx = 0

    print("=" * 65)
    print("  REAL BENCHMARK: Training on actual fetal ultrasound data")
    print(f"  Device: {DEVICE} | Image: {IMG_SIZE}x{IMG_SIZE} | Epochs: {args.epochs}")
    print(f"  Models: {len(model_factories)} | Regimes: {len(regimes)} | Total runs: {total_runs}")
    print("=" * 65)

    for model_name, factory in model_factories.items():
        print(f"\n{'=' * 55}")
        print(f"  MODEL: {model_name}")
        print(f"{'=' * 55}")

        # Count params
        tmp_model = factory()
        n_params = sum(p.numel() for p in tmp_model.parameters())
        print(f"  Parameters: {n_params:,}")
        del tmp_model

        baseline_iou = None

        for regime_name, use_aug, s_dir in regimes:
            run_idx += 1
            print(f"\n  [{run_idx}/{total_runs}] Regime: {regime_name}")

            # Build dataset for this regime
            ds = FetalDataset(dataset_dir, augment=use_aug, synthetic_dir=s_dir)
            print(f"    Dataset size: {len(ds)} samples")

            if len(ds) == 0:
                print("    SKIPPED: No data found!")
                continue

            # 80/20 split
            n_train = int(0.8 * len(ds))
            n_val = len(ds) - n_train
            train_ds, val_ds = random_split(ds, [n_train, n_val],
                                            generator=torch.Generator().manual_seed(SEED))

            train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True,
                                      num_workers=0, pin_memory=False)
            val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False,
                                    num_workers=0, pin_memory=False)

            # Train fresh model
            model = factory()
            t_start = time.time()
            metrics = train_and_evaluate(
                model_name, model, train_loader, val_loader,
                epochs=args.epochs, lr=args.lr
            )
            t_elapsed = time.time() - t_start
            print(f"    Training time: {t_elapsed:.1f}s")

            if baseline_iou is None:
                baseline_iou = metrics["mean_iou"]

            delta = metrics["mean_iou"] - baseline_iou

            all_results.append({
                "model": model_name,
                "regime": regime_name,
                "mean_iou": round(metrics["mean_iou"], 6),
                "mean_dice": round(metrics["mean_dice"], 6),
                "precision": round(metrics["precision"], 6),
                "recall": round(metrics["recall"], 6),
                "delta_iou_vs_baseline": round(delta, 6),
                "train_time_sec": round(t_elapsed, 1),
                "dataset_size": len(ds),
            })

            for ci, cname in enumerate(CLASS_NAMES):
                per_class_results.append({
                    "model": model_name,
                    "regime": regime_name,
                    "class": cname,
                    "iou": round(metrics["per_class_ious"][ci], 6),
                    "dice": round(metrics["per_class_dices"][ci], 6),
                })

            del model
            torch.cuda.empty_cache() if DEVICE.type == "cuda" else None

    # Save results
    csv_path = runs_dir / "real_benchmark_results.csv"
    with open(csv_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=all_results[0].keys())
        w.writeheader()
        w.writerows(all_results)
    print(f"\n[SAVED] Main results: {csv_path}")

    pc_csv = runs_dir / "real_benchmark_per_class.csv"
    with open(pc_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=per_class_results[0].keys())
        w.writeheader()
        w.writerows(per_class_results)
    print(f"[SAVED] Per-class results: {pc_csv}")

    # Print summary table
    print("\n" + "=" * 80)
    print("  REAL BENCHMARK RESULTS SUMMARY")
    print("=" * 80)
    print(f"{'Model':<20} {'Regime':<28} {'IoU':>8} {'Dice':>8} {'Prec':>8} {'Rec':>8} {'Delta':>8}")
    print("-" * 80)
    for r in all_results:
        d_str = f"+{r['delta_iou_vs_baseline']:.4f}" if r['delta_iou_vs_baseline'] > 0 else f"{r['delta_iou_vs_baseline']:.4f}"
        print(f"{r['model']:<20} {r['regime']:<28} {r['mean_iou']:>8.4f} {r['mean_dice']:>8.4f} {r['precision']:>8.4f} {r['recall']:>8.4f} {d_str:>8}")
    print("=" * 80)


if __name__ == "__main__":
    main()
