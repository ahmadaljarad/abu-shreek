#!/usr/bin/env python3
"""Check 9-English-AB original PDF headings and WebP-to-PDF page correspondence.
Never promote to verified automatically; report failures and candidates for review.
"""
import hashlib,json,re,subprocess,tempfile,urllib.request
from pathlib import Path
import fitz
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[1]
BOOK='9-English-AB.pdf'
TOC=json.loads((ROOT/'data/verified-toc'/ (BOOK+'.json')).read_text())
EVIDENCE=json.loads((ROOT/'data/toc-source-evidence'/(BOOK+'.json')).read_text())
OUT=ROOT/'data/toc-candidates'
OUT.mkdir(parents=True,exist_ok=True)
def norm(s):return ' '.join(re.findall('[a-z0-9]+',s.lower()))
def dhash(im):
    p=list(ImageOps.grayscale(im).resize((9,8)).getdata())
    return sum((p[y*9+x]>p[y*9+x+1]) << (y*8+x) for y in range(8) for x in range(8))
def dist(a,b):return (a^b).bit_count()
def main():
    with tempfile.TemporaryDirectory() as td:
        pdf=Path(td)/BOOK
        urllib.request.urlretrieve(EVIDENCE['original_pdf'],pdf)
        sha=hashlib.file_digest(open(pdf,'rb'),'sha256').hexdigest()
        if sha!=EVIDENCE['original_pdf_sha256']:raise ValueError('Original PDF digest mismatch')
        doc=fitz.open(pdf)
        count=int((ROOT/'book-pages/9-English-AB/count.txt').read_text())
        if len(doc)!=count:raise ValueError('PDF/image page count mismatch')
        headings=[];all_ok=True
        for entry in TOC['entries']:
            p=entry['printed_page'];page=doc[p-1]
            text=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'-layout',str(pdf),'-'],capture_output=True,text=True,check=True).stdout
            header=norm(text[:2400])
            title=norm(entry['title'])
            if entry['kind']=='unit':
                words=[w for w in title.split() if w not in {'the','to','a','it','for','no','yet','up','and','in','on'}]
                unit_ok=bool(re.search(r'\bunit\s+'+str(entry['unit_number'])+r'\b',header)) or ('unit' in header.split()[:80] and str(entry['unit_number']) in header.split()[:80])
                title_ok=all(w in header.split()[:140] for w in words)
                ok=unit_ok and title_ok
            else:
                test_number=1 if p==27 else 2
                roman='i' if test_number==1 else 'ii'
                ok=bool(re.search(r'progress\s+test\s+(?:'+str(test_number)+'|'+roman+r')\b',header))
            headings.append({'title':entry['title'],'expected_pdf_page':p,'heading_text_match':ok,'page_header_excerpt':text[:500]})
            if not ok:all_ok=False
        # The printed TOC lists "Tape scripts" without a page number.
        # Locate its actual heading instead of assuming the final test runs to PDF end.
        appendix_start=None
        tail_excerpts=[]
        for p in range(61,count+1):
            page_text=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'-layout',str(pdf),'-'],capture_output=True,text=True,check=True).stdout
            tail_excerpts.append({'pdf_page':p,'text':page_text[:1800]})
            if appendix_start is None and re.search(r'\btape\s*scripts?\b|\baudio\s+scripts?\b',norm(page_text[:1200])):
                appendix_start=p
        hashes=[];distances=[]
        for i in range(count):
            page=doc[i]
            pix=page.get_pixmap(matrix=fitz.Matrix(1,1),alpha=False)
            from io import BytesIO
            rendered=Image.open(BytesIO(pix.tobytes('png'))).convert('RGB')
            source=Image.open(ROOT/'book-pages/9-English-AB'/f'{i+1:03}.webp').convert('RGB')
            a=dhash(rendered);b=dhash(source)
            distances.append(dist(a,b));hashes.append((a,b))
        image_matches=sum(x<=16 for x in distances)
        report={'schema_version':1,'book':BOOK,'status':'CHECKED_CANDIDATE_NOT_YET_CERTIFIED',
                'original_pdf_sha256':sha,'pdf_pages':len(doc),'webp_pages':count,
                'heading_checks_passed':sum(x['heading_text_match'] for x in headings),
                'heading_checks_total':len(headings),'headings':headings,
                'webp_page_dhash_distance':distances,'webp_pages_with_distance_le_16':image_matches,
                'image_page_match_threshold':16,
                'all_headings_checked':all_ok,'all_image_pages_within_threshold':image_matches==count,
                'tape_scripts_heading_page':appendix_start,'tail_page_text_excerpts':tail_excerpts,
                'note':'dHash compares original PDF raster to GitHub WebP pages. Similarity is supporting evidence, not proof of exact pixel identity; human review required before full certification.'}
        if all_ok:
            entries=[]
            for i,e in enumerate(TOC['entries']):
                next_exists=i+1<len(TOC['entries'])
                end=TOC['entries'][i+1]['printed_page']-1 if next_exists else (appendix_start-1 if appendix_start else None)
                entries.append({'kind':e['kind'],'title':e['title'],'start':e['printed_page'],'end':end,
                                'heading_pdf_page_text_checked':True,'range_derived_from_next_verified_heading':next_exists})
            if appendix_start:
                entries.append({'kind':'appendix','title':'Tape scripts','start':appendix_start,'end':count,
                                'heading_pdf_page_text_checked':True,'range_derived_from_pdf_end':True})
            report['range_candidates']=entries
        target=OUT/'9-English-AB-full-check.json'
        target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps({'book':BOOK,'headings':f"{report['heading_checks_passed']}/{len(headings)}",
                          'webp_matches':f'{image_matches}/{count}','report':str(target)}))
if __name__=='__main__':main()
