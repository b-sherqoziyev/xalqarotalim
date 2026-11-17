"""Eski sahifalar kontent bloklaridagi har bir so'z yangi .md fayllarda borligini tekshiradi.
python3 check_migration.py <export_dir> <site_content_dir>"""
import json, re, sys, collections
from bs4 import BeautifulSoup
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from registry import TEMPLATE_PAGES
EXPORT, SITE = sys.argv[1], sys.argv[2]
man = json.load(open(f'{EXPORT}/raw/manifest.json'))
red = {r['source']: r['destination'] for r in json.load(open(f'{SITE}/redirects.json'))}
W = lambda t: [w.lower() for w in re.findall(r"[^\W_]{2,}", t)]
BOILER = re.compile(r"(batafsil ma.?lumot|батафсил маълумот|подробная информация)\s*:?|"
                    r"(bizni ijtimoiy|бизни ижтимоий|найдите нас|подписывайтесь|подпишитесь|следуйте за)[^\n.]*|\+?998[\d\s]{9,}", re.I)
total = 0; rows = []; glued = set()
for p in man['pages']:
    path = p['url'].split('.uz', 1)[1]
    new = red.get(path)
    if not new or path in TEMPLATE_PAGES:
        continue
    parts = new.strip('/').split('/')
    loc = parts[0]
    f = (f'{SITE}/pages/home/{loc}.md' if len(parts) == 1 else
         f'{SITE}/pages/{parts[1]}/{loc}.md' if len(parts) == 2 else f'{SITE}/{parts[1]}/{parts[2]}/{loc}.md')
    newtxt = re.sub(r'\\(.)', r'\1', open(f, encoding='utf-8').read())
    s = BeautifulSoup(open(f'{EXPORT}/raw/' + p['file'], encoding='utf-8').read(), 'lxml')
    for t in s(['script', 'style', 'noscript']):
        t.decompose()
    for br in s.find_all('br'):
        br.replace_with('\n')
    src = []
    for b in s.select('.b_block'):
        if b.find_parent(class_='b_block') or 'b_block--global' in b.get('class', []) or b.get('data-b-id') == 'HEADER':
            continue
        for x in b.select('[data-e-id^=button], [data-e-id^=form], [data-e-id^=social]'):
            x.decompose()
        for el in b.select('[data-is=element]'):
            if el.find_parent(attrs={'data-is': 'element'}) is None:
                src.append(el.get_text(''))
    txt = BOILER.sub(' ', '\n'.join(src))
    sw, nw = collections.Counter(W(txt)), collections.Counter(W(newtxt))
    miss = {w: c - nw[w] for w, c in sw.items() if nw[w] < c}
    glued |= {w for w in sw if len(w) > 28}
    n = sum(miss.values()); total += n
    if n:
        rows.append((n, path, sorted(miss.items())[:10]))
rows.sort(reverse=True)
print('missing word occurrences:', total, '| pages with gaps:', len(rows))
for r in rows[:15]:
    print(r)
print('source words glued without spaces (typos in the old site):', len(glued))
