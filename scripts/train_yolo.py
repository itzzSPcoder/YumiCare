from ultralytics import YOLO
from pathlib import Path
import platform
import argparse
import torch

ROOT_DIR = Path(__file__).parent.parent
YAML_PATH = ROOT_DIR / "Dataset" / "yolo_format" / "dataset.yaml"

def parse_args():
    parser = argparse.ArgumentParser(description="Train YOLOv8 on YumiCare dataset")
    parser.add_argument("--model", default="yolov8m.pt", help="Base model weights")
    parser.add_argument("--epochs", type=int, default=90, help="Training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size")
    parser.add_argument("--patience", type=int, default=40, help="Early stop patience")
    parser.add_argument("--workers", type=int, default=0, help="Dataloader workers")
    parser.add_argument("--name", default="yumicare_fetal_v2", help="Run name")
    return parser.parse_args()


def main():
    args = parse_args()

    print("--- Starting YOLOv8 Training ---")
    
    # Check GPU availability
    if torch.cuda.is_available():
        print(f"✅ GPU detected: {torch.cuda.get_device_name(torch.cuda.current_device())}")
    else:
        print("⚠️ No GPU detected. Training will fall back to CPU and may take a VERY long time.")
        
    if not YAML_PATH.exists():
         print(f"❌ Cannot find {YAML_PATH}. Did you run prep_yolo_dataset.py first?")
         return
         
    # Load model
    print(f"Loading base yolo model: {args.model}...")
    model = YOLO(args.model)
    
    # Train
    print(
        f"Training for {args.epochs} epochs with run '{args.name}' using dataset {YAML_PATH}..."
    )
    results = model.train(
        data=str(YAML_PATH.resolve().as_posix()),  # Fix for windows paths in YOLO
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        workers=args.workers,
        device=0 if torch.cuda.is_available() else 'cpu', # Use GPU 0
        name=args.name,
        patience=args.patience,
        save=True               # Save model weights
    )
    
    print(f"✅ Training complete. Check runs/detect/{args.name} for weights.")

if __name__ == '__main__':
    # Required for Windows multiprocessing compatibility in some torch versions
    if platform.system() == 'Windows':
        import multiprocessing
        multiprocessing.freeze_support()
        
    main()
