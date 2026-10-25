#!/usr/bin/env python3
"""Extract Arabic text from scanned ninth-grade textbook pages 101-200.
Requires Tesseract with Arabic language data (ara). OCR is unreviewed.
"""
import json
from pathlib import Path
import subprocess

root = Path("book-pages/9-Arabic")
target = Path("data/ninth-extracted/9-Arabic-pages-101-200.json")
pages = []
for page in range(101, 201):
    image = root / f"{page:03}.webp"
    if not image.is_file():
        print(f"Missing: {image}")
        continue
    process = subprocess.run(
        ["tesseract", str(image), "stdout", "-l", "ara", "--psm", "3"],
        capture_output=True, text=True, check=True
    )
    pages.append({"image_page": page, "text": process.stdout.strip()})
    print(f"Page {page}: {len(process.stdout.strip())} characters")
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(
    json.dumps({
        "book": "9-Arabic",
        "ocr_engine": "tesseract-ara",
        "review_status": "unverified",
        "pages": pages,
    }, ensure_ascii=False, indent=2),
    encoding="utf-8",
)
print(f"Saved {len(pages)} pages to {target}")
