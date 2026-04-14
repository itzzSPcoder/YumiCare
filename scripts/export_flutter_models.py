from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from ultralytics import YOLO


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export trained YOLO model to Flutter-friendly formats"
    )
    parser.add_argument(
        "--weights",
        default="runs/detect/yumicare_fetal_v3_3class_lowmem/weights/best.pt",
        help="Path to trained .pt checkpoint",
    )
    parser.add_argument(
        "--outdir",
        default="artifacts/flutter-ready/model_bundle",
        help="Output directory for exported model files",
    )
    parser.add_argument("--imgsz", type=int, default=640, help="Export image size")
    parser.add_argument(
        "--tflite",
        action="store_true",
        help="Attempt TensorFlow Lite export (requires TensorFlow deps)",
    )
    parser.add_argument(
        "--int8",
        action="store_true",
        help="Use int8 quantization for tflite export",
    )
    return parser.parse_args()


def write_labels(names: dict[int, str], outdir: Path) -> Path:
    labels_path = outdir / "labels.txt"
    ordered = [names[idx] for idx in sorted(names)]
    labels_path.write_text("\n".join(ordered) + "\n", encoding="utf-8")
    return labels_path


def write_flutter_config(names: dict[int, str], outdir: Path, imgsz: int) -> Path:
    config = {
        "model_type": "yolo",
        "task": "detect",
        "input_size": [imgsz, imgsz],
        "channels": 3,
        "class_names": [names[idx] for idx in sorted(names)],
        "num_classes": len(names),
        "notes": [
            "Use letterbox resize to keep aspect ratio",
            "Apply confidence and IoU thresholding in postprocess",
        ],
    }
    config_path = outdir / "flutter_model_config.json"
    config_path.write_text(json.dumps(config, indent=2), encoding="utf-8")
    return config_path


def try_export(model: YOLO, fmt: str, **kwargs) -> Path | None:
    try:
        result = model.export(format=fmt, **kwargs)
        return Path(result)
    except Exception as exc:  # noqa: BLE001
        print(f"Export failed for format={fmt}: {exc}")
        return None


def main() -> None:
    args = parse_args()
    weights = Path(args.weights)
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    if not weights.exists():
        raise FileNotFoundError(f"Weights file not found: {weights}")

    print(f"Loading model from: {weights}")
    model = YOLO(str(weights))

    # Save original checkpoint inside bundle for traceability.
    bundled_pt = outdir / "model.pt"
    shutil.copy2(weights, bundled_pt)
    print(f"Copied checkpoint: {bundled_pt}")

    names_obj = model.names
    names = (
        names_obj
        if isinstance(names_obj, dict)
        else {idx: name for idx, name in enumerate(names_obj)}
    )

    labels_path = write_labels(names, outdir)
    config_path = write_flutter_config(names, outdir, args.imgsz)
    print(f"Wrote labels: {labels_path}")
    print(f"Wrote config: {config_path}")

    onnx_path = try_export(
        model,
        "onnx",
        imgsz=args.imgsz,
        simplify=True,
        opset=12,
        dynamic=False,
        half=False,
        device="cpu",
    )
    if onnx_path and onnx_path.exists():
        bundled_onnx = outdir / "model.onnx"
        shutil.copy2(onnx_path, bundled_onnx)
        print(f"Exported ONNX: {bundled_onnx}")
    else:
        print("ONNX export did not produce a file.")

    if args.tflite:
        tflite_path = try_export(
            model,
            "tflite",
            imgsz=args.imgsz,
            int8=args.int8,
            device="cpu",
        )
        if tflite_path and tflite_path.exists():
            bundled_tflite = outdir / "model.tflite"
            shutil.copy2(tflite_path, bundled_tflite)
            print(f"Exported TFLite: {bundled_tflite}")
        else:
            print("TFLite export skipped or failed.")

    print("Flutter model bundle is ready.")


if __name__ == "__main__":
    main()
