# Anki Package to CSV Parser Utility

This directory contains a script to extract flashcard data from Anki package (`.apkg`/`.colpkg`) files or extracted directories and convert them into a CSV format compatible with VibeCard's schema.

## Features
* Unpacks `.apkg` and `.colpkg` zip archives automatically.
* Detects and decompresses modern `zstd`-compressed Anki databases (`collection.anki21b` / `collection.anki21`).
* Automatically filters out the legacy dummy cards that Anki inserts for backward compatibility.
* Extracts front, back, scheduling stats (intervals, ease factors, repetitions), and tags.
* Optionally cleans HTML tags from front/back fields.

## Dependencies

Since modern Anki exports compress their internal database with **Zstandard (zstd)**, you must have a way to decompress it. The script tries three fallbacks in order:
1. **Python `zstandard` module** (Recommended):
   ```bash
   pip install zstandard
   ```
2. **System `zstd` CLI tool**:
   ```bash
   brew install zstd
   ```
3. **Anki macOS Virtual Environment**: If you have Anki installed on macOS at `/Applications/Anki.app`, the script will automatically detect and run decompression inside its python virtualenv.

## How to Execute

### Basic Usage
To convert an Anki deck file to a CSV file (created in your current working directory):
```bash
python3 scripts/anki_to_csv.py path/to/deck.apkg
```

### Specifying Output Path
To specify where the CSV should be saved:
```bash
python3 scripts/anki_to_csv.py path/to/deck.apkg path/to/output.csv
```

### Extracting from a Folder
If you have already extracted/unzipped the `.apkg` file:
```bash
python3 scripts/anki_to_csv.py path/to/extracted_folder/
```

### Cleaning HTML Tags
If your Anki cards contain formatting HTML (like `<span ...>` or `<div>`) and you want them stripped to plain text (while keeping LaTeX formulas intact):
```bash
python3 scripts/anki_to_csv.py path/to/deck.apkg --clean
```

---

## Output CSV Columns
The output CSV will contain the following fields:
* `front`: The question text (first field of the note).
* `back`: The answer text (second field and any remaining fields joined).
* `interval`: Current review interval in days.
* `ease_factor`: Ease factor as a decimal float (e.g. `2.5` represents 250% ease).
* `reps`: Total number of review repetitions.
* `tags`: Comma-separated list of tags.
