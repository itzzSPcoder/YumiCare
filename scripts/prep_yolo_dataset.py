import json
import random
import shutil
import time
from collections import defaultdict
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).parent.parent
RAW_DATA_DIR = ROOT_DIR / "Dataset" / "8265464"
OUTPUT_DIR = ROOT_DIR / "Dataset" / "yolo_format"

# COCO labels are 1-based in this dataset.
COCO_TO_TARGET_CLASS = {1: 0, 2: 1, 3: 2}
TARGET_CLASS_NAMES = ["Brain", "CSP", "LV"]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Exclude annotation or derived-mask folders when resolving source image files.
EXCLUDED_PATH_TOKENS = (
    "-yolo",
    "-coco",
    "-pascal",
    "-segmentation",
    "-labelme",
    "annotations",
    "obj_train_data",
    "segmentationclass",
    "segmentationobject",
)

# Desired structure
STRUCTURE = {
    "images/train": OUTPUT_DIR / "images" / "train",
    "images/val": OUTPUT_DIR / "images" / "val",
    "labels/train": OUTPUT_DIR / "labels" / "train",
    "labels/val": OUTPUT_DIR / "labels" / "val",
}

def create_structure():
    if OUTPUT_DIR.exists():
        print(f"Cleaning up existing {OUTPUT_DIR}...")
        for attempt in range(1, 6):
            try:
                shutil.rmtree(OUTPUT_DIR)
                break
            except OSError as exc:
                if attempt == 5:
                    raise
                print(f"Retrying cleanup ({attempt}/5) due to: {exc}")
                time.sleep(1.0)
    for path in STRUCTURE.values():
        path.mkdir(parents=True, exist_ok=True)


def sanitize_prefix(text):
    return "".join(ch if ch.isalnum() else "-" for ch in text).strip("-")


def is_source_image_path(path):
    lower = str(path).lower().replace("\\", "/")
    return not any(token in lower for token in EXCLUDED_PATH_TOKENS)


def build_image_index(directory):
    index = defaultdict(list)
    print(f"Indexing source images under {directory}...")

    for p in Path(directory).rglob("*"):
        if not p.is_file() or p.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        if not is_source_image_path(p):
            continue
        index[p.name].append(p)

    print(f"Indexed {sum(len(v) for v in index.values())} usable image files")
    return index


def resolve_image_path(file_name, group_root, image_index):
    candidates = image_index.get(file_name, [])
    if not candidates:
        return None

    for candidate in candidates:
        try:
            candidate.relative_to(group_root)
            return candidate
        except ValueError:
            continue

    return candidates[0]


def coco_bbox_to_yolo_line(class_id, bbox, width, height):
    x, y, w, h = bbox
    if w <= 0 or h <= 0 or width <= 0 or height <= 0:
        return None

    x_center = (x + w / 2.0) / width
    y_center = (y + h / 2.0) / height
    bw = w / width
    bh = h / height

    if (
        x_center < 0
        or x_center > 1
        or y_center < 0
        or y_center > 1
        or bw <= 0
        or bw > 1
        or bh <= 0
        or bh > 1
    ):
        return None

    return f"{class_id} {x_center:.6f} {y_center:.6f} {bw:.6f} {bh:.6f}"


def find_image_label_pairs(directory):
    pairs = []
    image_index = build_image_index(directory)
    coco_files = sorted(Path(directory).rglob("annotations/instances_default.json"))

    print(f"Scanning {len(coco_files)} COCO annotation files...")
    missing_images = 0

    for coco_path in coco_files:
        with open(coco_path, "r", encoding="utf-8") as f:
            coco = json.load(f)

        group_root = coco_path.parents[2]
        group_name = group_root.name

        annotations_by_image = defaultdict(list)
        for ann in coco.get("annotations", []):
            raw_category = ann.get("category_id")
            if raw_category not in COCO_TO_TARGET_CLASS:
                continue
            bbox = ann.get("bbox")
            if not isinstance(bbox, list) or len(bbox) < 4:
                continue
            annotations_by_image[ann.get("image_id")].append(
                (COCO_TO_TARGET_CLASS[raw_category], bbox[:4])
            )

        for image in coco.get("images", []):
            image_id = image.get("id")
            file_name = Path(image.get("file_name", "")).name
            width = image.get("width", 0)
            height = image.get("height", 0)

            image_path = resolve_image_path(file_name, group_root, image_index)
            if image_path is None:
                missing_images += 1
                continue

            yolo_lines = []
            for class_id, bbox in annotations_by_image.get(image_id, []):
                line = coco_bbox_to_yolo_line(class_id, bbox, width, height)
                if line is not None:
                    yolo_lines.append(line)

            pairs.append((image_path, group_name, yolo_lines))

    if missing_images:
        print(f"⚠️ Missing {missing_images} images referenced by COCO files")
    print(f"Resolved {len(pairs)} image/label pairs from COCO annotations")
    return pairs


def split_and_copy(pairs, split_ratio=0.8):
    random.seed(42)  # For reproducibility
    random.shuffle(pairs)
    
    split_idx = int(len(pairs) * split_ratio)
    train_pairs = pairs[:split_idx]
    val_pairs = pairs[split_idx:]
    
    print(f"Total pairs found: {len(pairs)}")
    print(f"Training set: {len(train_pairs)}")
    print(f"Validation set: {len(val_pairs)}")
    
    def copy_files(subset_pairs, subset_name):
        images_dir = STRUCTURE[f"images/{subset_name}"]
        labels_dir = STRUCTURE[f"labels/{subset_name}"]

        for img_path, group_name, yolo_lines in subset_pairs:
            prefix = sanitize_prefix(group_name)
            new_name = f"{prefix}_{img_path.name}"
            new_txt_name = f"{Path(new_name).stem}.txt"

            new_name = new_name.replace(' ', '-')
            new_txt_name = new_txt_name.replace(' ', '-')

            shutil.copy2(img_path, images_dir / new_name)
            out_label_path = labels_dir / new_txt_name
            with open(out_label_path, "w", encoding="utf-8") as f:
                if yolo_lines:
                    f.write("\n".join(yolo_lines) + "\n")

    # Copy files while showing some progress
    print("Copying training files...")
    copy_files(train_pairs, "train")
    print("Copying validation files...")
    copy_files(val_pairs, "val")

def create_yaml():
    names_lines = "\n".join(
        f"  {idx}: {name}" for idx, name in enumerate(TARGET_CLASS_NAMES)
    )

    yaml_content = f"""path: {OUTPUT_DIR.resolve().as_posix()}
train: images/train
val: images/val

names:
{names_lines}
"""
    yaml_path = OUTPUT_DIR / "dataset.yaml"
    with open(yaml_path, "w") as f:
        f.write(yaml_content)
    print(f"Created {yaml_path}")

if __name__ == "__main__":
    print("--- Prepping YOLOv8 Dataset ---")
    create_structure()
    pairs = find_image_label_pairs(RAW_DATA_DIR)
    if not pairs:
        print("No image/label pairs found in the raw dataset. Please check folder paths.")
        exit(1)
    split_and_copy(pairs)
    create_yaml()
    print("Dataset formatting complete.")
