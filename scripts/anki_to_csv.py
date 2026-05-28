#!/usr/bin/env python3
import os
import sys
import sqlite3
import csv
import zipfile
import tempfile
import subprocess
import shutil
import re
import html

def print_err(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

def clean_html(raw_html):
    # Replace HTML line breaks with space
    clean = re.sub(r'<br\s*/?>', ' ', raw_html)
    # Strip other HTML tags
    clean = re.sub(r'<[^>]+>', '', clean)
    # Unescape HTML entities
    clean = html.unescape(clean)
    return clean.strip()

def decompress_zstd_python(src, dst):
    try:
        import zstandard as zstd
        with open(src, 'rb') as sf, open(dst, 'wb') as df:
            dctx = zstd.ZstdDecompressor()
            dctx.copy_stream(sf, df)
        return True
    except ImportError:
        return False

def decompress_zstd_system(src, dst):
    try:
        # Run zstd command line tool
        result = subprocess.run(["zstd", "-d", "-o", dst, src], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def decompress_zstd_anki_mac(src, dst, temp_dir):
    try:
        # On macOS, check if Anki's virtualenv is installed and has the backend
        home = os.path.expanduser("~")
        anki_venv = os.path.join(home, "Library/Application Support/AnkiProgramFiles/.venv")
        anki_python = os.path.join(anki_venv, "bin", "python")
        
        if not os.path.exists(anki_python):
            return False
            
        # We need to run a small inline script in Anki's python to decompress using import_collection_package
        # 1. Create a minimal zip container of the folder containing the compressed database
        compressed_dir = os.path.dirname(src)
        temp_zip = os.path.join(temp_dir, "temp_deck.colpkg")
        
        with zipfile.ZipFile(temp_zip, 'w') as zf:
            for fname in os.listdir(compressed_dir):
                fpath = os.path.join(compressed_dir, fname)
                if os.path.isfile(fpath):
                    zf.write(fpath, fname)
                    
        # 2. Run Python subprocess in Anki's venv to do the import
        # The script creates a dummy collection, calls import_collection_package to decompress, and closes
        dummy_col = os.path.join(temp_dir, "dummy_col.anki2")
        temp_media_dir = os.path.join(temp_dir, "temp_media")
        temp_media_db = os.path.join(temp_dir, "temp_media.db")
        
        inline_script = f"""
import os
from anki.collection import Collection

dummy_col = {repr(dummy_col)}
dst_col = {repr(dst)}
temp_zip = {repr(temp_zip)}
temp_media_dir = {repr(temp_media_dir)}
temp_media_db = {repr(temp_media_db)}

if not os.path.exists(temp_media_dir):
    os.makedirs(temp_media_dir)

col = Collection(dummy_col)
backend = col._backend
col.close()

backend.import_collection_package(
    col_path=dst_col,
    backup_path=temp_zip,
    media_folder=temp_media_dir,
    media_db=temp_media_db
)
"""
        result = subprocess.run([anki_python, "-c", inline_script], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0:
            print_err(f"Anki Python execution failed: {result.stderr}")
            return False
        return os.path.exists(dst)
    except Exception as e:
        print_err(f"Anki Mac fallback error: {e}")
        return False

def process_sqlite_db(db_path, csv_path, clean):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if cards and notes tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('cards', 'notes')")
    tables = [r[0] for r in cursor.fetchall()]
    if 'cards' not in tables or 'notes' not in tables:
        print_err("Error: Database is missing 'cards' or 'notes' tables.")
        conn.close()
        return False
        
    # Query cards and notes
    cursor.execute("""
        SELECT 
            n.flds AS fields,
            c.ivl AS interval,
            c.factor AS ease_factor,
            c.reps AS reps,
            n.tags AS tags
        FROM notes n
        JOIN cards c ON c.nid = n.id
        ORDER BY n.id
    """)
    rows = cursor.fetchall()
    
    # Filter out dummy cards
    cards_written = 0
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['front', 'back', 'interval', 'ease_factor', 'reps', 'tags'])
        
        for fields, ivl, factor, reps, tags in rows:
            # Check for dummy card
            if "Please update to the latest Anki version" in fields:
                continue
                
            fields_list = fields.split('\x1f')
            front = fields_list[0] if len(fields_list) > 0 else ""
            back = "\n\n".join(fields_list[1:]) if len(fields_list) > 1 else ""
            
            if clean:
                front = clean_html(front)
                back = clean_html(back)
                
            # Clean tags
            # Anki tags are stored space-separated: e.g. " tag1 tag2 "
            tag_list = [t for t in tags.strip().split(' ') if t]
            tags_str = ", ".join(tag_list) if tag_list else ""
            
            # Map ease factor from Anki's integer (e.g. 2500) to float (e.g. 2.5)
            ease = float(factor) / 1000.0 if factor else 2.5
            
            writer.writerow([front, back, ivl, ease, reps, tags_str])
            cards_written += 1
            
    conn.close()
    print(f"Success! Extracted {cards_written} cards and wrote them to: {csv_path}")
    return True

def main():
    if len(sys.argv) < 2:
        print("Anki Package Parser Utility")
        print("Usage:")
        print("  python3 anki_to_csv.py <input_path> [output_csv_path] [--clean]")
        print("\nArguments:")
        print("  input_path: Path to a .apkg/.colpkg file OR an extracted directory.")
        print("  output_csv_path: Optional path for output CSV. Defaults to '<input_name>.csv' in current directory.")
        print("  --clean: Optional flag to strip HTML tags from front and back card fields.")
        sys.exit(1)
        
    input_path = os.path.abspath(sys.argv[1])
    
    # Check flags
    clean = "--clean" in sys.argv
    
    # Determine output path
    output_path = None
    for arg in sys.argv[2:]:
        if not arg.startswith("--"):
            output_path = os.path.abspath(arg)
            break
            
    if not output_path:
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        output_path = os.path.join(os.getcwd(), f"{base_name}.csv")
        
    if not os.path.exists(input_path):
        print_err(f"Error: Input path '{input_path}' does not exist.")
        sys.exit(1)
        
    # Setup temporary directory for processing
    temp_dir = tempfile.mkdtemp(prefix="anki_parser_")
    
    try:
        work_dir = None
        
        # 1. Handle zip/apkg file extraction
        if os.path.isfile(input_path):
            if not zipfile.is_zipfile(input_path):
                print_err("Error: Input file is not a valid zip archive (.apkg / .colpkg).")
                sys.exit(1)
                
            print(f"Extracting package '{os.path.basename(input_path)}'...")
            work_dir = os.path.join(temp_dir, "extracted")
            os.makedirs(work_dir)
            with zipfile.ZipFile(input_path, 'r') as zf:
                zf.extractall(work_dir)
        else:
            work_dir = input_path
            
        # 2. Locate database file
        # We check in order: collection.anki21b, collection.anki21, collection.anki2
        db21b = os.path.join(work_dir, "collection.anki21b")
        db21 = os.path.join(work_dir, "collection.anki21")
        db2 = os.path.join(work_dir, "collection.anki2")
        
        db_to_use = None
        compressed = False
        
        if os.path.exists(db21b):
            db_to_use = db21b
            compressed = True
        elif os.path.exists(db21):
            db_to_use = db21
            compressed = True
        elif os.path.exists(db2):
            db_to_use = db2
            
        if not db_to_use:
            print_err("Error: No Anki database found (collection.anki2, collection.anki21, or collection.anki21b).")
            sys.exit(1)
            
        # 3. Decompress if needed
        final_db = db_to_use
        if compressed:
            decompressed_db = os.path.join(temp_dir, "collection_decompressed.anki2")
            print("Decompressing database...")
            
            # Decompression pipeline:
            # A. Try python zstandard
            success = decompress_zstd_python(db_to_use, decompressed_db)
            
            # B. Try system zstd binary
            if not success:
                success = decompress_zstd_system(db_to_use, decompressed_db)
                
            # C. Try Anki macOS python virtualenv
            if not success:
                success = decompress_zstd_anki_mac(db_to_use, decompressed_db, temp_dir)
                
            if not success:
                print_err("\nError: The Anki database is zstd-compressed.")
                print_err("Please install the 'zstandard' python package or 'zstd' CLI:")
                print_err("  - Install via python:  pip install zstandard")
                print_err("  - Install via Homebrew: brew install zstd")
                print_err("Or ensure you run this script in an environment where 'zstd' is available.")
                sys.exit(1)
                
            final_db = decompressed_db
            
        # 4. Extract data to CSV
        success = process_sqlite_db(final_db, output_path, clean)
        if not success:
            sys.exit(1)
            
    finally:
        # Clean up all temp files
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    main()
