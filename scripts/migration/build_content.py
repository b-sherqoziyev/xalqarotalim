"""Eksport qilingan Flexbe sahifalaridan yangi saytning kontent papkasini quradi.

python3 build_content.py <export_dir> <site_dir>
"""
import json, os, re, sys, shutil, collections
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
import flexbe2md as F
from registry import LOCALES, LEGACY_LANG, COUNTRIES, UNIVERSITIES, SCHOLARSHIPS, NEWS, TEMPLATE_PAGES

EXPORT, SITE = sys.argv[1], sys.argv[2]
CONTENT = os.path.join(SITE, 'content')
PUBLIC_IMG = os.path.join(SITE, 'public', 'images')
REPORT = collections.defaultdict(list)

manifest = json.load(open(os.path.join(EXPORT, 'raw', 'manifest.json'), encoding='utf-8'))
labels = json.load(open(os.path.join(os.path.dirname(__file__), 'data', 'menu_labels.json'), encoding='utf-8'))


def path_of(url):
    p = url.split('xalqarotalim.uz', 1)[1] if 'xalqarotalim.uz' in url else url
    return p if p.endswith('/') else p + '/'


# ------------------------------------------------------------------ classify legacy pages
def classify(path):
    """-> (collection, id, locale) or None"""
    if path in TEMPLATE_PAGES:
        return ('template', None, None)
    if path == '/':
        return ('page', 'home', 'ru')
    m = re.match(r'^/(uzl|uzk|tr|en|ru)/$', path)
    if m:
        return ('page', 'home', LEGACY_LANG[m.group(1)])
    m = re.match(r'^/contacts_(uzl|uzk|tr|en|ru)/$', path)
    if m:
        return ('page', 'contacts', LEGACY_LANG[m.group(1)])
    m = re.match(r'^/translations/(uzl|uzk|tr|en|ru)/$', path)
    if m:
        return ('page', 'translations', LEGACY_LANG[m.group(1)])
    m = re.match(r'^/(uzl|uzk|tr|en|ru)/announcements/$', path)
    if m:
        return ('news', NEWS['announcements'], LEGACY_LANG[m.group(1)])
    m = re.match(r'^/(uzl|uzk|tr|en|ru)/(20\d\d_\d+)', path)
    if m:
        loc, key = LEGACY_LANG[m.group(1)], m.group(2)
        if key in UNIVERSITIES:
            return ('universities', UNIVERSITIES[key][0], loc)
        if key in SCHOLARSHIPS:
            return ('scholarships', SCHOLARSHIPS[key][0], loc)
        if key in NEWS:
            return ('news', NEWS[key], loc)
    return None


def new_url(col, id_, loc):
    if col == 'page':
        return f'/{loc}' if id_ == 'home' else f'/{loc}/{id_}'
    if col == 'universities':
        return f'/{loc}/universities/{id_}'
    if col == 'scholarships':
        return f'/{loc}/scholarships/{id_}'
    if col == 'news':
        return f'/{loc}/news/{id_}'
    raise ValueError(col)


pages = []
for p in manifest['pages']:
    path = path_of(p['url'])
    c = classify(path)
    if c is None:
        REPORT['unclassified'].append(path)
        continue
    pages.append((path, c, p['file']))

# legacy url -> new url (for links and redirects)
LEGACY_MAP = {}
for path, (col, id_, loc), _ in pages:
    if col == 'template':
        LEGACY_MAP[path] = '/ru'
    else:
        LEGACY_MAP[path] = new_url(col, id_, loc)
# known broken legacy links (404 on the old site) -> nearest existing content
for path, err in manifest['errors'].items():
    path = path_of(path)
    m = re.match(r'^/en/(20\d\d_\d+)', path)
    if m and m.group(1) in UNIVERSITIES:
        LEGACY_MAP[path] = new_url('universities', UNIVERSITIES[m.group(1)][0], 'en')
    elif path == '/06/':
        LEGACY_MAP[path] = new_url('scholarships', 'turkiye-burslari', 'ru')


def map_link(href, loc):
    h = href.strip()
    if h.startswith('#') or not h:
        return None
    if re.match(r'^https?://(www\.)?xalqarotalim\.uz', h):
        h = re.sub(r'^https?://(www\.)?xalqarotalim\.uz', '', h) or '/'
    if h.startswith('/'):
        p = path_of(h.split('?')[0].split('#')[0])
        if p in LEGACY_MAP:
            return LEGACY_MAP[p]
        REPORT['unmapped_internal_links'].append(h)
        return None
    return h


# ------------------------------------------------------------------ images
IMG_USE = collections.defaultdict(set)   # flexbe ref -> {(col,id)}
DOCS = []  # collected docs before image rewrite


def short_name(label):
    label = label.replace('​', '').strip()
    label = re.sub(r'\s+Ҳақида Маълумот', '', label)
    if ' / ' in label:
        label = label.split(' / ')[0]
    else:
        label = re.sub(r'\s*\((?:[^()]|\([^()]*\))*\)\s*$', '', label)
    label = re.sub(r'^The ', '', label)
    return label.strip()


def clean_desc(s):
    s = re.sub(r'^\s*[-•]\s*', '', s or '', flags=re.M)
    parts = [x.strip() for x in s.strip().split('\n') if x.strip()]
    s = ''
    for x in parts:
        s += (x if not s else ((' ' if s.endswith(('.', '!', '?', ':', ';', ',')) else '; ') + x))
    return re.sub(r'\s{2,}', ' ', s).strip('; ')


def process_body(md, loc):
    lines = md.split('\n')
    out = []
    for ln in lines:
        if ln.startswith('<!--'):
            continue
        if re.match(r'^::cta\[', ln):
            REPORT['removed_modal_buttons'].append(ln)
            continue
        m = re.match(r'^::embed\[(.*)\]$', ln)
        if m and 'google.com/maps' in m.group(1):
            continue
        out.append(ln)
    md = '\n'.join(out)

    def link(m):
        text, href = m.group(1), m.group(2)
        new = map_link(href, loc)
        return f'[{text}]({new})' if new else text
    md = re.sub(r'(?<!!)\[((?:[^\[\]]|\\\[|\\\])*)\]\(([^)\s]*)\)', link, md)
    md = md.replace('\\`', '’')
    # tighten lists: consecutive list items separated by blank lines
    md = re.sub(r'(?m)^((?:- |\d+\. ).*)\n\n(?=(?:- |\d+\. ))', r'\1\n', md)
    md = re.sub(r'(?m)^((?:- |\d+\. ).*)\n\n(?=(?:- |\d+\. ))', r'\1\n', md)
    md = re.sub(r'\n{3,}', '\n\n', md).strip()
    return md


def split_title_cover(md):
    title, cover = None, None
    lines = md.split('\n')
    seen = 0
    for i, ln in enumerate(lines):
        s = ln.strip()
        if not s:
            continue
        seen += 1
        m = re.match(r'^!\[[^\]]*\]\(([^)]+)\)$', s)
        if s.startswith('## ') and title is None:
            title = s[3:].strip(); lines[i] = ''
        elif m and cover is None:
            cover = m.group(1); lines[i] = ''
        else:
            break
        if seen >= 2:
            break
    body = re.sub(r'\n{3,}', '\n\n', '\n'.join(lines)).strip()
    return title, cover, body


for path, (col, id_, loc), file in pages:
    if col == 'template':
        continue
    pp = F.page_parts(open(os.path.join(EXPORT, 'raw', file), encoding='utf-8').read(), path)
    md = '\n\n'.join(b['md'] for b in pp['blocks'] if b['md'].strip())
    md = process_body(md, loc)
    title, cover, body = split_title_cover(md)
    if not title:
        REPORT['no_title'].append(path)
    meta = pp['meta']
    DOCS.append({
        'col': col, 'id': id_, 'loc': loc, 'path': path,
        'title': (title or '').replace('\\', ''), 'cover': cover, 'body': body,
        'seoTitle': pp['title'],
        'description': clean_desc(meta.get('og:description') or meta.get('description') or ''),
        'keywords': re.sub(r'\s*\n\s*', ' ', meta.get('keywords', '')).strip(),
        'bg': [b['bg'] for b in pp['blocks'] if b['bg']],
    })
    for ref in re.findall(r'!\[[^\]]*\]\((\d+\.\w+)\)', body) + ([cover] if cover else []):
        IMG_USE[ref].add((col, id_))

if F.DROPPED:
    REPORT['dropped_boilerplate_lines'] = sorted(set(F.DROPPED))


def img_target(ref, col, id_):
    users = IMG_USE.get(ref, set())
    stem = ref.split('.')[0]
    if len(users) > 1:
        return f'/images/shared/{stem}.webp'
    folder = 'pages' if col == 'page' else col
    return f'/images/{folder}/{id_}/{stem}.webp'


MEDIA = {}  # public path -> {width,height,legacy}


def convert(ref, target):
    src = os.path.join(EXPORT, 'images', ref)
    dst = os.path.join(SITE, 'public', target.lstrip('/'))
    if target in MEDIA:
        return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if ref.endswith('.svg'):
        dst = dst[:-5] + '.svg'
        shutil.copy(src, dst)
        MEDIA[target[:-5] + '.svg'] = {'width': 0, 'height': 0, 'legacyId': ref}
        return
    im = Image.open(src)
    if im.mode in ('P', 'LA'):
        im = im.convert('RGBA')
    elif im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGB')
    if im.mode == 'RGBA' and im.getextrema()[3][0] == 255:
        im = im.convert('RGB')
    if im.width > 1600:
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=82, method=6)
    MEDIA[target] = {'width': im.width, 'height': im.height, 'legacyId': ref}


def rewrite_images(md, col, id_):
    def r(m):
        alt, ref = m.group(1), m.group(2)
        t = img_target(ref, col, id_)
        convert(ref, t)
        return f'![{alt}]({t})'
    return re.sub(r'!\[([^\]]*)\]\((\d+\.\w+)\)', r, md)


# ------------------------------------------------------------------ write
def fm(d):
    lines = ['---']
    for k, v in d.items():
        if v in (None, '', [], {}):
            continue
        lines.append(f'{k}: {json.dumps(v, ensure_ascii=False)}')
    lines.append('---')
    return '\n'.join(lines) + '\n\n'


for sub in ('universities', 'scholarships', 'news', 'pages'):
    if os.path.exists(os.path.join(CONTENT, sub)):
        shutil.rmtree(os.path.join(CONTENT, sub))
    if os.path.exists(os.path.join(PUBLIC_IMG, sub)):
        shutil.rmtree(os.path.join(PUBLIC_IMG, sub))
if os.path.exists(os.path.join(PUBLIC_IMG, 'shared')):
    shutil.rmtree(os.path.join(PUBLIC_IMG, 'shared'))
os.makedirs(CONTENT, exist_ok=True)

by_entity = collections.defaultdict(dict)
for d in DOCS:
    by_entity[(d['col'], d['id'])][d['loc']] = d

# countries
for order, (cid, names) in enumerate(COUNTRIES, 1):
    os.makedirs(os.path.join(CONTENT, 'countries'), exist_ok=True)
    json.dump({'id': cid, 'order': order, 'name': names, 'cover': f'/images/countries/{cid}.webp'},
              open(os.path.join(CONTENT, 'countries', f'{cid}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

legacy_key_of = {}
for k, v in UNIVERSITIES.items():
    legacy_key_of[('universities', v[0])] = k
for k, v in SCHOLARSHIPS.items():
    legacy_key_of[('scholarships', v[0])] = k
for k, v in NEWS.items():
    legacy_key_of[('news', v)] = k

order_counter = collections.Counter()
for (col, id_), docs in by_entity.items():
    folder = os.path.join(CONTENT, 'pages' if col == 'page' else col, id_)
    os.makedirs(folder, exist_ok=True)
    cover = None
    for loc in LOCALES:
        if loc in docs and docs[loc]['cover']:
            cover = rewrite_images(f"![]({docs[loc]['cover']})", col, id_)[4:-1]
            break
    key = legacy_key_of.get((col, id_))
    names = {}
    for loc, d in docs.items():
        legacy_lang = {v: k for k, v in LEGACY_LANG.items()}[loc]
        lbl = labels.get(key, {}).get(legacy_lang) if key else None
        names[loc] = short_name(lbl) if (lbl and col == 'universities') else (lbl or d['title'] or '').replace('​', '').strip()
        if col == 'universities' and not lbl and d['title']:
            names[loc] = short_name(d['title'])
    legacy = {loc: d['path'] for loc, d in docs.items()}
    if col != 'page':
        meta = {'id': id_}
        if col == 'universities':
            _, country, city, native = UNIVERSITIES[key]
            same = [k for k, v in UNIVERSITIES.items() if v[1] == country]
            meta.update({'country': country, 'city': city, 'nativeName': native, 'order': same.index(key) + 1})
        elif col == 'scholarships':
            meta.update({'country': SCHOLARSHIPS[key][1], 'order': list(SCHOLARSHIPS).index(key) + 1})
        else:
            meta.update({'order': list(NEWS).index(key) + 1})
        meta.update({'name': {l: names[l] for l in LOCALES if l in names}, 'cover': cover, 'legacy': {l: legacy[l] for l in LOCALES if l in legacy}})
        json.dump(meta, open(os.path.join(folder, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    for loc, d in docs.items():
        body = rewrite_images(d['body'], col, id_)
        front = {'title': d['title'], 'seoTitle': d['seoTitle'], 'description': d['description'],
                 'keywords': d['keywords'], 'legacyUrl': d['path']}
        if col == 'page':
            front['cover'] = cover
        open(os.path.join(folder, f'{loc}.md'), 'w', encoding='utf-8').write(fm(front) + body + '\n')

# redirects
redir = []
for old, new in sorted(LEGACY_MAP.items()):
    redir.append({'source': old, 'destination': new})
    if old != '/' and old.endswith('/'):
        pass
json.dump(redir, open(os.path.join(CONTENT, 'redirects.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
json.dump(MEDIA, open(os.path.join(CONTENT, 'media.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2, sort_keys=True)
json.dump(REPORT, open(os.path.join(os.path.dirname(__file__), 'data', 'migration_report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('docs', len(DOCS), 'entities', len(by_entity), 'images', len(MEDIA), 'redirects', len(redir))
print({k: len(v) for k, v in REPORT.items()})
