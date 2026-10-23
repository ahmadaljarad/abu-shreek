#!/usr/bin/env python3
"""Extract verifiable metadata and the opening pages of all scientific baccalaureate books.
Runs on GitHub Actions, where the GitHub Release assets can be downloaded.
No lesson names or page offsets are invented.
"""
import json
import pathlib
import subprocess
import urllib.request

ROOT=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'data/bac-sci-release-assets.json').read_text())
out=ROOT/'data/bac-sci-extracted'
out.mkdir(parents=True,exist_ok=True)
results=[]
for item in manifest['assets']:
    name=item['name']
    print('Processing',name,flush=True)
    url='https://github.com/ahmadaljarad/abu-shreek/releases/download/books-v1/'+name
    target=pathlib.Path('/tmp')/name
    try:
        urllib.request.urlretrieve(url,target)
        if target.stat().st_size!=item['size']:
            raise ValueError('Downloaded file size differs from release manifest')
        info=subprocess.run(['pdfinfo',str(target)],capture_output=True,text=True,check=True).stdout
        count=int(next(x.split(':',1)[1].strip() for x in info.splitlines() if x.startswith('Pages:')))
        pages=min(count,15)
        text=subprocess.run(['pdftotext','-f','1','-l',str(pages),'-layout',str(target),'-'],
                            capture_output=True,text=True,check=True).stdout
        # A page break in pdftotext corresponds to a PDF page boundary.
        page_text=text.split('\f')[:pages]
        if len(page_text)<pages: page_text+=['']*(pages-len(page_text))
        record={'file':name,'pdf_pages':count,'toc_candidates':[],
                'opening_pages':[{'pdf_page':i+1,'text':t.strip()[:15000]} for i,t in enumerate(page_text)],
                'extraction_note':'Raw PDF text only. Titles and offsets require human review.'}
        # pdfinfo metadata and embedded bookmarks are useful independent signals.
        try:
            import fitz
            doc=fitz.open(str(target))
            record['toc_candidates']=[{'level':level,'title':title,'pdf_page':page}
                                      for level,title,page in doc.get_toc()]
            doc.close()
        except ImportError:
            pass
        (out/(name+'.json')).write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
        results.append({'file':name,'status':'extracted','pdf_pages':count,
                        'bookmarks':len(record['toc_candidates']),
                        'opening_pages_with_text':sum(bool(p['text']) for p in record['opening_pages'])})
    except Exception as e:
        results.append({'file':name,'status':'error','error':str(e)})
    finally:
        target.unlink(missing_ok=True)
(out/'summary.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(results,ensure_ascii=False,indent=2))
if any(x['status']=='error' for x in results):raise SystemExit(1)
