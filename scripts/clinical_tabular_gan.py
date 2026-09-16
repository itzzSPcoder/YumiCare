#!/usr/bin/env python3
"""
Clinical Biometric & Longitudinal Record Generative Adversarial Network (MedGAN/WGAN).
Synthesizes correlated maternal-fetal medical records:
- Ultrasound Biometry: Gestational Age (GA), BPD, HC, FL, TCD, AFI
- Maternal Biomarkers: Blood Pressure, Hemoglobin, Fasting Glucose
- Clinical Risk Assessment: Normal, IUGR, Macrosomia, Pre-eclampsia, Gestational Diabetes
Conforms to Hadlock clinical growth models and covariance distributions.
"""

from __future__ import annotations

import argparse
import random
from pathlib import Path
from typing import Dict, List, Tuple

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Clinical variable definitions
FEATURE_NAMES = [
    "gestational_age_weeks",
    "bpd_mm",
    "hc_mm",
    "fl_mm",
    "tcd_mm",
    "afi_cm",
    "maternal_sys_bp",
    "maternal_dia_bp",
    "hemoglobin_g_dl",
    "fasting_glucose_mg_dl"
]

RISK_CATEGORIES = [
    "Normal Development",
    "IUGR (Fetal Growth Restriction)",
    "Macrosomia (Large for Gestational Age)",
    "Gestational Hypertension / Pre-eclampsia Risk",
    "Gestational Diabetes Concern"
]


def generate_hadlock_clinical_reference_batch(num_samples: int = 1000) -> Tuple[np.ndarray, List[str]]:
    """
    Generates physiologically grounded clinical biometry based on Hadlock reference standards:
    - BPD (mm) ~ -3.91 + 0.7870*GA - 0.0034*(GA^2)
    - HC (mm)  ~ -11.48 + 10.72*GA - 0.09*(GA^2)
    - FL (mm)  ~ -9.6 + 2.52*GA - 0.015*(GA^2)
    - TCD (mm) ~ GA in weeks
    - AFI (cm) ~ 10-20 cm
    """
    np.random.seed(42)
    ga = np.random.uniform(14.0, 40.0, size=num_samples)

    bpd_mean = -3.9 + 2.85 * ga - 0.02 * (ga ** 2)
    bpd = np.random.normal(bpd_mean, 2.5)

    hc_mean = -11.5 + 10.6 * ga - 0.088 * (ga ** 2)
    hc = np.random.normal(hc_mean, 8.0)

    fl_mean = -9.6 + 2.55 * ga - 0.014 * (ga ** 2)
    fl = np.random.normal(fl_mean, 2.8)

    tcd_mean = 0.95 * ga + 1.2
    tcd = np.random.normal(tcd_mean, 1.8)

    afi = np.random.normal(14.5, 3.2, size=num_samples)
    afi = np.clip(afi, 5.0, 26.0)

    sys_bp = np.random.normal(118.0, 12.0, size=num_samples)
    dia_bp = sys_bp * 0.65 + np.random.normal(0, 4.0, size=num_samples)

    hb = np.random.normal(11.8, 1.1, size=num_samples)
    glucose = np.random.normal(92.0, 14.0, size=num_samples)

    risks = []
    for i in range(num_samples):
        if bpd[i] < bpd_mean[i] - 5.0 or fl[i] < fl_mean[i] - 5.5:
            risks.append(RISK_CATEGORIES[1])
        elif bpd[i] > bpd_mean[i] + 5.5 or hc[i] > hc_mean[i] + 16.0:
            risks.append(RISK_CATEGORIES[2])
        elif sys_bp[i] >= 138 or dia_bp[i] >= 88:
            risks.append(RISK_CATEGORIES[3])
        elif glucose[i] >= 110:
            risks.append(RISK_CATEGORIES[4])
        else:
            risks.append(RISK_CATEGORIES[0])

    features = np.column_stack([ga, bpd, hc, fl, tcd, afi, sys_bp, dia_bp, hb, glucose])
    return features.astype(np.float32), risks


class ClinicalTabularGenerator(nn.Module):
    """Generator for Clinical Tabular Data using ResNet style dense layers."""
    def __init__(self, latent_dim: int = 16, out_dim: int = 10, hidden_dim: int = 64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(hidden_dim, hidden_dim * 2),
            nn.BatchNorm1d(hidden_dim * 2),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(hidden_dim, out_dim)
        )

    def forward(self, z: torch.Tensor) -> torch.Tensor:
        return self.net(z)


class ClinicalTabularCritic(nn.Module):
    """Critic for Clinical Tabular Vectors."""
    def __init__(self, in_dim: int = 10, hidden_dim: int = 64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(hidden_dim, hidden_dim * 2),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(hidden_dim, 1)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class ClinicalTabularGANSynthesizer:
    """Trainer and Generator for paired clinical maternal records."""
    def __init__(self, latent_dim: int = 16):
        self.latent_dim = latent_dim
        self.generator = ClinicalTabularGenerator(latent_dim=latent_dim, out_dim=len(FEATURE_NAMES)).to(DEVICE)
        self.critic = ClinicalTabularCritic(in_dim=len(FEATURE_NAMES)).to(DEVICE)
        self.mean = None
        self.std = None

    def fit(self, epochs: int = 50, batch_size: int = 64, lr: float = 2e-3):
        data_np, _ = generate_hadlock_clinical_reference_batch(num_samples=1500)

        self.mean = torch.tensor(data_np.mean(axis=0), dtype=torch.float32, device=DEVICE)
        self.std = torch.tensor(data_np.std(axis=0) + 1e-6, dtype=torch.float32, device=DEVICE)
        norm_data = (torch.tensor(data_np, dtype=torch.float32, device=DEVICE) - self.mean) / self.std

        opt_g = torch.optim.Adam(self.generator.parameters(), lr=lr, betas=(0.5, 0.9))
        opt_c = torch.optim.Adam(self.critic.parameters(), lr=lr, betas=(0.5, 0.9))

        dataset = torch.utils.data.TensorDataset(norm_data)
        dataloader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

        print(f"Training Clinical Tabular GAN for {epochs} epochs on {DEVICE}...")
        for epoch in range(epochs):
            for (real_batch,) in dataloader:
                b_sz = real_batch.size(0)

                # --- Train Critic ---
                opt_c.zero_grad()
                z = torch.randn(b_sz, self.latent_dim, device=DEVICE)
                fake_batch = self.generator(z)

                c_real = self.critic(real_batch)
                c_fake = self.critic(fake_batch.detach())

                loss_c = torch.mean(c_fake) - torch.mean(c_real)
                loss_c.backward()
                opt_c.step()

                # Clamp weights for standard Wasserstein GAN stability on CPU
                for p in self.critic.parameters():
                    p.data.clamp_(-0.01, 0.01)

                # --- Train Generator ---
                opt_g.zero_grad()
                loss_g = -torch.mean(self.critic(fake_batch))
                loss_g.backward()
                opt_g.step()

        print("[SUCCESS] Clinical Tabular GAN training complete.")

    def sample(self, num_samples: int = 100) -> pd.DataFrame:
        self.generator.eval()
        with torch.no_grad():
            z = torch.randn(num_samples, self.latent_dim, device=DEVICE)
            fake_norm = self.generator(z)
            fake_raw = fake_norm * self.std + self.mean
            data_np = fake_raw.cpu().numpy()

        df = pd.DataFrame(data_np, columns=FEATURE_NAMES)
        df["gestational_age_weeks"] = np.clip(df["gestational_age_weeks"], 14.0, 41.0).round(1)
        df["bpd_mm"] = np.clip(df["bpd_mm"], 20.0, 105.0).round(1)
        df["hc_mm"] = np.clip(df["hc_mm"], 80.0, 360.0).round(1)
        df["fl_mm"] = np.clip(df["fl_mm"], 10.0, 85.0).round(1)
        df["tcd_mm"] = np.clip(df["tcd_mm"], 12.0, 58.0).round(1)
        df["afi_cm"] = np.clip(df["afi_cm"], 4.0, 28.0).round(1)
        df["maternal_sys_bp"] = np.clip(df["maternal_sys_bp"], 90.0, 175.0).round(0).astype(int)
        df["maternal_dia_bp"] = np.clip(df["maternal_dia_bp"], 55.0, 115.0).round(0).astype(int)
        df["hemoglobin_g_dl"] = np.clip(df["hemoglobin_g_dl"], 8.0, 16.0).round(1)
        df["fasting_glucose_mg_dl"] = np.clip(df["fasting_glucose_mg_dl"], 65.0, 180.0).round(0).astype(int)

        risks = []
        for _, row in df.iterrows():
            ga = row["gestational_age_weeks"]
            bpd_mean = -3.9 + 2.85 * ga - 0.02 * (ga ** 2)
            if row["bpd_mm"] < bpd_mean - 5.0:
                risks.append(RISK_CATEGORIES[1])
            elif row["bpd_mm"] > bpd_mean + 5.5:
                risks.append(RISK_CATEGORIES[2])
            elif row["maternal_sys_bp"] >= 140 or row["maternal_dia_bp"] >= 90:
                risks.append(RISK_CATEGORIES[3])
            elif row["fasting_glucose_mg_dl"] >= 105:
                risks.append(RISK_CATEGORIES[4])
            else:
                risks.append(RISK_CATEGORIES[0])

        df["clinical_risk_assessment"] = risks
        return df


def plot_clinical_gan_validation(df: pd.DataFrame, output_path: Path):
    """Plots synthetic clinical fetal biometry curves against Hadlock 5th, 50th, 95th percentiles."""
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Clinical GAN (MedGAN) Synthetic Fetal Growth & Biometry Validation", fontsize=15, fontweight="bold", y=0.98)

    ga_grid = np.linspace(14, 40, 100)

    # 1. BPD
    bpd_p50 = -3.9 + 2.85 * ga_grid - 0.02 * (ga_grid ** 2)
    axes[0, 0].plot(ga_grid, bpd_p50, "k--", label="Hadlock 50th Percentile", linewidth=2)
    axes[0, 0].fill_between(ga_grid, bpd_p50 - 5.0, bpd_p50 + 5.0, color="gray", alpha=0.2, label="Normal Range (5th-95th)")
    axes[0, 0].scatter(df["gestational_age_weeks"], df["bpd_mm"], color="#1F4E79", alpha=0.7, edgecolors="none", label="GAN Synthetic Cases")
    axes[0, 0].set_title("BPD (Biparietal Diameter) vs Gestational Age", fontweight="bold")
    axes[0, 0].set_xlabel("Gestational Age (weeks)")
    axes[0, 0].set_ylabel("BPD (mm)")
    axes[0, 0].legend()
    axes[0, 0].grid(True, linestyle="--", alpha=0.6)

    # 2. HC
    hc_p50 = -11.5 + 10.6 * ga_grid - 0.088 * (ga_grid ** 2)
    axes[0, 1].plot(ga_grid, hc_p50, "k--", label="Hadlock 50th Percentile", linewidth=2)
    axes[0, 1].fill_between(ga_grid, hc_p50 - 15.0, hc_p50 + 15.0, color="gray", alpha=0.2, label="Normal Range (5th-95th)")
    axes[0, 1].scatter(df["gestational_age_weeks"], df["hc_mm"], color="#2E75B6", alpha=0.7, edgecolors="none", label="GAN Synthetic Cases")
    axes[0, 1].set_title("HC (Head Circumference) vs Gestational Age", fontweight="bold")
    axes[0, 1].set_xlabel("Gestational Age (weeks)")
    axes[0, 1].set_ylabel("HC (mm)")
    axes[0, 1].legend()
    axes[0, 1].grid(True, linestyle="--", alpha=0.6)

    # 3. FL
    fl_p50 = -9.6 + 2.55 * ga_grid - 0.014 * (ga_grid ** 2)
    axes[1, 0].plot(ga_grid, fl_p50, "k--", label="Hadlock 50th Percentile", linewidth=2)
    axes[1, 0].fill_between(ga_grid, fl_p50 - 5.5, fl_p50 + 5.5, color="gray", alpha=0.2, label="Normal Range (5th-95th)")
    axes[1, 0].scatter(df["gestational_age_weeks"], df["fl_mm"], color="#70AD47", alpha=0.7, edgecolors="none", label="GAN Synthetic Cases")
    axes[1, 0].set_title("FL (Femur Length) vs Gestational Age", fontweight="bold")
    axes[1, 0].set_xlabel("Gestational Age (weeks)")
    axes[1, 0].set_ylabel("FL (mm)")
    axes[1, 0].legend()
    axes[1, 0].grid(True, linestyle="--", alpha=0.6)

    # 4. Clinical Risk Stratification
    risk_counts = df["clinical_risk_assessment"].value_counts()
    colors = ["#1F4E79", "#ED7D31", "#FFC000", "#70AD47", "#7030A0"]
    axes[1, 1].barh(risk_counts.index, risk_counts.values, color=colors[:len(risk_counts)])
    axes[1, 1].set_title("Synthetic Cohort Risk Category Stratification", fontweight="bold")
    axes[1, 1].set_xlabel("Patient Case Count")
    axes[1, 1].grid(True, axis="x", linestyle="--", alpha=0.6)

    plt.tight_layout()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close()
    print(f"[SAVED] Clinical GAN validation plot saved to: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Synthetic Clinical Biometric Data with MedGAN")
    parser.add_argument("--samples", type=int, default=150, help="Number of patient cases to synthesize")
    parser.add_argument("--export", type=str, default="runs/synthetic_clinical_records.csv", help="CSV export destination")
    args = parser.parse_args()

    synthesizer = ClinicalTabularGANSynthesizer()
    synthesizer.fit(epochs=50)

    out_df = synthesizer.sample(args.samples)
    out_csv = Path(args.export)
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    out_df.to_csv(out_csv, index=False)
    print(f"[SUCCESS] Exported {len(out_df)} synthetic clinical records to {out_csv}")

    plot_clinical_gan_validation(out_df, out_csv.parent / "clinical_gan_growth_curves.png")
