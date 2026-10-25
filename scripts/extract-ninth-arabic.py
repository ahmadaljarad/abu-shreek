#!/usr/bin/env python3
"""Extract ninth-grade Arabic textbook page text from the repository's actual images.
OCR is reference material only; questions require human verification against images.
"""
import json, pathlib, subprocess
root=pathlib.Path(__file__).resolve().parents[1]
images=root/"book-pages"/"9-Arabic"
out=root/"data"/"ninth-extracted"/"9-Arabic.json"
out.parent.mkdir(parents=True,exist_ok=True)
pages=[]
if not images.is_dir():
    raise SystemExit(f"Missing textbook image directory: {images}")
for file in sorted(images.glob("*.webp"),key=lambda p:int(p.stem) if p.stem.isdigit() else 9999):
    if not file.stem.isdigit() or int(file.stem)>50:continue
    result=subprocess.run(["tesseract",str(file),"stdout","-l","ara","--psm","3"],capture_output=True,text=True)
    pages.append({"image_page":int(file.stem),"image":str(file.relative_to(root)),"text":result.stdout.strip(),"ocr_ok":result.returncode==0})
    print(f"Page {file.stem}: {len(result.stdout)} chars",flush=True)
if not pages:
    raise SystemExit("No numbered textbook page images found; refusing to publish empty OCR.")
out.write_text(json.dumps({"source":"Repository page images of Syrian ninth-grade Arabic textbook","ocr_note":"Automatic OCR can contain errors; verify each question visually against the original image before publishing.","pages":pages},ensure_ascii=False,indent=2)+"\n")
print(f"Saved {len(pages)} page records")
