"""Download publicly linked brochures for local research; never redistribute originals."""
import concurrent.futures
import json
import re
import urllib.request
from pathlib import Path
from urllib.parse import urljoin, unquote
from pypdf import PdfReader

URL = "https://www.hirslanden.ch/de/klinik-birshof/centers/physiotherapie-und-sportphysiotherapie/broschueren.html"
ROOT = Path("tmp/research/hirslanden")
ROOT.mkdir(parents=True, exist_ok=True)

def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()

html = (ROOT / "index.html").read_text(encoding="utf-8-sig") if (ROOT / "index.html").exists() else fetch(URL).decode("utf-8")
urls = sorted(set(urljoin(URL, u) for u in re.findall(r'[^\s"<>]*?/content/dam/[^\s"<>]+?\.[pP][dD][fF]', html)))
urls = [u for u in urls if "klinik-birshof" in u]
# Retain established IDs when refreshing the same source inventory.
if (ROOT / "manifest.json").exists():
    urls = [entry["url"] for entry in json.loads((ROOT / "manifest.json").read_text(encoding="utf-8-sig"))]

def read_brochure(item):
    index, url = item
    filename = ROOT / f"{index:02}.pdf"
    if not filename.exists(): filename.write_bytes(fetch(url))
    reader = PdfReader(filename)
    pages = [page.extract_text() for page in reader.pages]
    (ROOT / f"{index:02}.txt").write_text("\n\n".join(f"PAGE {i+1}\n{p}" for i,p in enumerate(pages)), encoding="utf-8")
    return {"id": f"birshof-{index:02}", "url": url, "filename": unquote(url.rsplit("/", 1)[-1]), "pages": len(pages), "textFile": f"{index:02}.txt"}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    result = list(pool.map(read_brochure, enumerate(urls, 1)))
(ROOT / "manifest.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(result, ensure_ascii=True, indent=2))
