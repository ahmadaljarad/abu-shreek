from pathlib import Path
import sys, struct, random
root = Path("book-pages")
names = """9-Algebra 9-Geometry 9-Arabic 9-Art 9-History 9-Geography 9-National 9-Physics-Chemistry 9-Islamic 9-Christianity 9-Science 9-English-SB 9-English-AB 9-French-SB 9-French-AB 9-Russian 9-Music 9-Technology bac-sci-arabic bac-sci-math-1 bac-sci-math-2 bac-sci-physics bac-sci-chemistry bac-sci-biology bac-sci-english-sb bac-sci-english-ab bac-sci-french bac-sci-russian bac-sci-islamic bac-sci-christian bac-lit-arabic bac-lit-philosophy-1 bac-lit-philosophy-2 bac-lit-history bac-lit-geography bac-lit-english-sb bac-lit-english-ab bac-lit-french bac-lit-french-annex bac-lit-russian bac-lit-islamic bac-lit-christian""".split()
errors = []
total = 0
summary = ["# Abu Shreek textbook image audit", "", "| Book | Pages | Status |", "|---|---:|---|"]
for name in names:
    folder = root / name
    try:
        pages = int((folder / "count.txt").read_text().strip())
        if pages < 1 or pages > 2000: raise ValueError("invalid page count")
    except (OSError, ValueError):
        errors.append(f"{name}: missing or invalid count.txt")
        summary.append(f"| {name} | — | FAIL: count.txt |")
        continue
    issues = []
    for page in range(1, pages + 1):
        file = folder / f"{page:03d}.webp"
        try:
            with file.open("rb") as f:
                head = f.read(16)
            if len(head) < 16 or head[:4] != b"RIFF" or head[8:12] != b"WEBP":
                issues.append(f"invalid WebP {page}")
            elif file.stat().st_size < 500:
                issues.append(f"too small {page}")
        except OSError:
            issues.append(f"missing page {page}")
    total += pages
    if issues: errors.append(f"{name}: {', '.join(issues[:8])} ({len(issues)} issues)")
    summary.append(f"| {name} | {pages} | {'FAIL: ' + str(len(issues)) + ' issue(s)' if issues else 'PASS'} |")
summary.extend(["", f"**Books:** {len(names)} | **Expected pages:** {total} | **Books with issues:** {len(errors)}", "", "This audit checks presence and WebP headers; it cannot certify correct Arabic glyph shaping or readable content."])
if errors: summary.extend(["", "## Issues", *[f"- {e}" for e in errors]])
report = "\n".join(summary) + "\n"
Path("textbook-audit.md").write_text(report)
print(report)
sys.exit(1 if errors else 0)
