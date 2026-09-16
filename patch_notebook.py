import json
from pathlib import Path

notebook_path = Path(r'd:\oldCoding\Projects\YumiCare\Yumi-Care-Credibility\notebooks\Genuine_GAN_Training_Colab.ipynb')
with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code' and 'drive.mount' in ''.join(cell['source']):
        new_source = [
            "# ============================================================\n",
            "# CELL 2: Mount Google Drive + Setup Workspace\n",
            "# ============================================================\n",
            "from google.colab import drive\n",
            "import os\n",
            "import sys\n",
            "from pathlib import Path\n",
            "\n",
            "drive.mount('/content/drive')\n",
            "\n",
            "# Since GitHub cloning gave a 403 error, let's load directly from Google Drive.\n",
            "# 1. Upload the entire project folder (Yumi-Care-Credibility) to your Google Drive.\n",
            "# 2. Update the path below to match where you uploaded it.\n",
            "# Example: if you uploaded it directly to the root of your drive, it will be:\n",
            "WORK_DIR = Path('/content/drive/MyDrive/Yumi-Care-Credibility')\n",
            "\n",
            "if not WORK_DIR.exists():\n",
            "    print(f'❌ Cannot find {WORK_DIR}')\n",
            "    print('Please check your Google Drive and ensure the folder name/path is correct.')\n",
            "else:\n",
            "    sys.path.insert(0, str(WORK_DIR / 'scripts'))\n",
            "    os.chdir(WORK_DIR / 'scripts')\n",
            "    print(f'✅ Working dir: {os.getcwd()}')\n"
        ]
        cell['source'] = new_source

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
print('Notebook updated successfully!')
