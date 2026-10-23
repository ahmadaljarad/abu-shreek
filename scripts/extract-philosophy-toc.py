#!/usr/bin/env python3
"""Extract unverified philosophy TOC candidates from the actual uploaded page images.
Never promote OCR guesses to verified lesson ranges."""
import json, re, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data'/'toc-candidates'
OUT.mkdir(parents=True,exist_ok=True)
for volume in (1,2):
    name=f'bac-lit-philosophy-{volume}'
    folder=ROOT/'book-pages'/name
    images=sorted(folder.glob('*.webp'))[:18]
    pages=[]
    for img in images:
        result=subprocess.run(['tesseract',str(img),'stdout','-l','ara+eng','--psm','3'],
                              text=True,capture_output=True,check=False)
        raw=result.stdout.strip()
        candidates=[]
        for line in raw.splitlines():
            clean=' '.join(line.split())
            m=re.search(r'([0-9٠-٩۰-۹]{1,3})\s*$',clean)
            if not m:continue
            num=m.group(1).translate(str.maketrans('٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹','01234567890123456789'))
            title=clean[:m.start()].strip(' .ـ…-:')
            if len(title)>=5:
                candidates.append({'title_ocr':title,'printed_page_ocr':int(num),'verified':False})
        pages.append({'image_page':int(img.stem),'raw_ocr':raw,'candidates':candidates})
    payload={'book':name+'.pdf','status':'OCR_DRAFT_NOT_VERIFIED','pages_scanned':len(images),
             'notice':'OCR candidates only. Do not expose as verified lessons until titles and image page ranges are checked.',
             'pages':pages}
    (OUT/(name+'.json')).write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(name, len(images),'pages scanned',sum(len(p['candidates']) for p in pages),'candidates')
