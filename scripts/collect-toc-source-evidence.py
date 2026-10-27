#!/usr/bin/env python3
"""Collect ORIGINAL PDF evidence, never claim OCR guesses are verified TOC entries."""
import hashlib,json,os,re,subprocess,tempfile,urllib.request
from pathlib import Path
R=Path(__file__).resolve().parents[1]
OUT=R/'data/toc-source-evidence'; OUT.mkdir(parents=True,exist_ok=True)
BASE='https://github.com/ahmadaljarad/abu-shreek/releases/download/books-v1/'
API='https://api.github.com/repos/ahmadaljarad/abu-shreek/releases/tags/books-v1'
def get(url,path=None,auth=False):
    h={'User-Agent':'Abu-Shreek-original-book-evidence'}
    if auth and os.getenv('GITHUB_TOKEN'):h['Authorization']='Bearer '+os.environ['GITHUB_TOKEN']
    with urllib.request.urlopen(urllib.request.Request(url,headers=h),timeout=180) as r:
        if path is None:return r.read()
        with open(path,'wb') as f:
            while True:
                chunk=r.read(1048576)
                if not chunk:break
                f.write(chunk)
def command(*args):return subprocess.run(args,check=True,capture_output=True,text=True).stdout
def collect(name,asset):
    with tempfile.TemporaryDirectory() as tmp:
        pdf=Path(tmp)/name;get(BASE+name,pdf)
        digest=hashlib.file_digest(open(pdf,'rb'),'sha256').hexdigest()
        if asset.get('digest') and asset['digest']!='sha256:'+digest:raise ValueError('SHA-256 mismatch')
        if pdf.stat().st_size!=asset['size']:raise ValueError('Release asset size mismatch')
        info=command('pdfinfo',str(pdf))
        total=int(next(line.split(':',1)[1].strip() for line in info.splitlines() if line.startswith('Pages:')))
        n=min(total,12)
        raw=command('pdftotext','-f','1','-l',str(n),'-layout',str(pdf),'-')
        parts=raw.split('\f')[:n];parts+=['']*(n-len(parts))
        pages=[]
        for i,t in enumerate(parts,1):
            p={'pdf_page':i,'pdf_text':t.strip()[:6500]}
            if i<=8 and sum(c.isalpha() for c in t)<80:
                prefix=Path(tmp)/'page'
                subprocess.run(['pdftoppm','-f',str(i),'-l',str(i),'-scale-to','1600','-png','-singlefile',str(pdf),str(prefix)],check=True,capture_output=True)
                o=subprocess.run(['tesseract',str(prefix)+'.png','stdout','-l','ara+eng+fra+rus','--psm','3'],capture_output=True,text=True)
                if o.returncode==0:p['ocr_text_unverified']=o.stdout.strip()[:6500]
                else:p['ocr_error']=o.stderr[-300:]
                Path(str(prefix)+'.png').unlink(missing_ok=True)
            pages.append(p)
        # Some original textbooks place their contents at the back, not the front.
        tail_start=max(n+1,total-5)
        if tail_start<=total:
            tail_raw=command('pdftotext','-f',str(tail_start),'-l',str(total),'-layout',str(pdf),'-')
            tail_parts=tail_raw.split('\f')[:total-tail_start+1]
            tail_parts+=['']*(total-tail_start+1-len(tail_parts))
            for i,t in enumerate(tail_parts,tail_start):
                p={'pdf_page':i,'pdf_text':t.strip()[:6500]}
                if sum(c.isalpha() for c in t)<80:
                    prefix=Path(tmp)/'tail'
                    subprocess.run(['pdftoppm','-f',str(i),'-l',str(i),'-scale-to','1600','-png','-singlefile',str(pdf),str(prefix)],check=True,capture_output=True)
                    o=subprocess.run(['tesseract',str(prefix)+'.png','stdout','-l','ara+eng+fra+rus','--psm','3'],capture_output=True,text=True)
                    if o.returncode==0:p['ocr_text_unverified']=o.stdout.strip()[:6500]
                    else:p['ocr_error']=o.stderr[-300:]
                    Path(str(prefix)+'.png').unlink(missing_ok=True)
                pages.append(p)
        possible=[p['pdf_page'] for p in pages if re.search('الفهرس|المحتويات|contents|sommaire|содержание',p['pdf_text']+'\n'+p.get('ocr_text_unverified',''),re.I)]
        return {'schema_version':1,'book':name,'status':'SOURCE_EVIDENCE_UNVERIFIED','fully_verified':False,
                'original_pdf':BASE+name,'original_pdf_sha256':digest,'release_asset_size':asset['size'],
                'pdf_pages':total,'sampled_pdf_pages':n,'possible_contents_pages_unverified':possible,
                'page_image_mapping_verified':False,'lesson_titles_verified':False,'lesson_page_ranges_verified':False,
                'note':'Raw original release PDF text/OCR only. Every title and page boundary needs independent verification before a verified lesson index is published.',
                'pages':pages}
def main():
    books=json.loads((R/'books.json').read_text())['books']
    names=sorted({n for b in books.values() for n in [b['file'],*b.get('extra',[])]})
    audit=json.loads((R/'data/toc-verification-progress.json').read_text())
    verified={b['book'] for b in audit['books'] if b.get('fully_verified')}
    assets={a['name']:a for a in json.loads(get(API,auth=True))['assets']}
    missing=[n for n in names if n not in assets]
    if missing:raise ValueError('Missing release assets: '+', '.join(missing))
    pending=[n for n in names if n not in verified and not (OUT/(n+'.json')).exists()]
    pending.sort(key=lambda n:(assets[n]['size'],n))
    results=[]
    for name in pending[:max(1,min(12,int(os.getenv('TOC_EVIDENCE_BATCH_SIZE','4'))))]:
        try:
            d=collect(name,assets[name])
            (OUT/(name+'.json')).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
            results.append({'book':name,'result':'source_evidence_saved','pdf_pages':d['pdf_pages']})
        except Exception as e:results.append({'book':name,'result':'error','detail':str(e)})
    available={n for n in names if (OUT/(n+'.json')).exists()}
    report={'schema_version':1,'catalogue_book_files':len(names),'fully_verified_book_files_from_audit':len(verified),
            'source_evidence_files_available':len(available),'source_evidence_is_not_verification':True,
            'pending_source_evidence':[n for n in names if n not in verified and n not in available],'this_batch':results}
    (OUT/'summary.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2),flush=True)
    if any(r['result']=='error' for r in results):raise SystemExit(1)
if __name__=='__main__':main()
