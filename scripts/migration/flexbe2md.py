"""Flexbe sahifa HTML'ini toza Markdown'ga o'girish.

Faqat sahifaning o'ziga xos bloklari (BUNDLE va til tugmasidan boshqa HEADER) olinadi;
global bloklar (menyu, kontakt, footer) sozlamalarga alohida ko'chiriladi.
"""
import re
from bs4 import BeautifulSoup, NavigableString, Tag

SENT_END = tuple('.!?;:…»")')
BULLETS = re.compile(r'^\s*(?:[•●▪◦·\-–—*✓✔✅➤►→]\s*|\d{1,2}[.)]\s+|\d{1,2}\s+[–—-]\s+)')
NUM = r'^\s*(?:\*+)?(\d{1,2})(?:[.)]|\s+[–—-])\s+'
DROPPED = []
LANG_SWITCH = re.compile(r'НА РУССКОМ ЯЗЫКЕ|IN ENGLISH|TÜRKÇE', re.I)


def img_ref(el):
    i = el.get('data-img-id')
    if i and i.isdigit():
        return f"{i}.{(el.get('data-img-ext') or 'jpg').lower()}"
    return None


# ---------------------------------------------------------------- inline
class Line:
    def __init__(self):
        self.runs = []  # (text, bold, italic, href)

    def add(self, text, bold, italic, href):
        if text:
            self.runs.append((text, bold, italic, href))

    @property
    def plain(self):
        return re.sub(r'[ \t ]+', ' ', ''.join(r[0] for r in self.runs)).strip()

    @property
    def all_bold(self):
        vis = [r for r in self.runs if r[0].strip()]
        return bool(vis) and all(r[1] for r in vis)

    def md(self, drop_bold=False):
        out = []
        # merge adjacent runs with identical formatting
        merged = []
        runs = []
        for r in self.runs:
            if runs and re.fullmatch(r'[\s:;,.!?()\-–—*]*', r[0]):
                r = (r[0],) + runs[-1][1:3] + (r[3],)
            runs.append(r)
        for r in runs:
            if merged and merged[-1][1:] == r[1:]:
                merged[-1] = (merged[-1][0] + r[0],) + r[1:]
            else:
                merged.append(r)
        for text, bold, italic, href in merged:
            t = re.sub(r'[ \t ]+', ' ', text)
            if not t.strip():
                out.append(t)
                continue
            lead = ' ' if t[0] == ' ' else ''
            trail = ' ' if t[-1] == ' ' else ''
            core = esc(t.strip())
            if italic:
                core = f'*{core}*'
            if bold and not drop_bold:
                core = f'**{core}**'
            if href:
                core = f'[{core}]({href})'
            out.append(lead + core + trail)
        s = ''.join(out)
        s = re.sub(r'\*\*\s*\*\*', ' ', s)
        return re.sub(r' {2,}', ' ', s).strip()


def esc(t):
    # minimal escaping so ordinary text never turns into markdown syntax
    t = t.replace('\\', '\\\\').replace('*', '\\*').replace('_', '\\_').replace('`', '\\`')
    t = re.sub(r'^(#+)', r'\\\1', t)
    t = t.replace('[', '\\[').replace(']', '\\]').replace('<', '&lt;')
    return t


class Flow:
    """Collects a sequence of paragraphs (list of Line) and special blocks."""

    def __init__(self):
        self.items = []  # ('para', [Line]) | ('table', md) | ('image', ref) | ('raw', md)
        self.cur = [Line()]

    def text(self, t, b, i, h):
        parts = t.split('\n')
        for k, p in enumerate(parts):
            if k:
                self.br()
            self.cur[-1].add(p, b, i, h)

    def br(self):
        self.cur.append(Line())

    def para_break(self):
        group = []
        for l in self.cur + [None]:
            if l is None or not l.plain:
                if group:
                    self.items.append(('para', group))
                group = []
            else:
                group.append(l)
        self.cur = [Line()]

    def block(self, kind, value):
        self.para_break()
        self.items.append((kind, value))


BLOCK_TAGS = {'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'section', 'figure'}


def walk_inline(node, flow, bold=False, italic=False, href=None, ctx=None):
    for ch in node.children:
        if isinstance(ch, NavigableString):
            if ch.__class__.__name__ in ('Comment', 'Doctype'):
                continue
            flow.text(str(ch).replace('\n', ' '), bold, italic, href)
            continue
        if not isinstance(ch, Tag) or ch.name in ('script', 'style', 'noscript', 'svg', 'button'):
            continue
        n = ch.name
        if n == 'br':
            flow.br()
        elif n == 'table':
            md = table_md(ch, ctx)
            if md:
                flow.block('table', md)
        elif n == 'img':
            ref = img_ref(ch) or src_ref(ch.get('data-src') or ch.get('src'))
            if ref:
                flow.block('image', ref)
        elif n == 'iframe':
            flow.block('embed', ch.get('src'))
        elif n == 'a':
            h = (ch.get('href') or '').strip()
            if h.startswith('javascript:') or h == '#':
                h = None
            walk_inline(ch, flow, bold, italic, h or href, ctx)
        elif n in ('strong', 'b'):
            walk_inline(ch, flow, True, italic, href, ctx)
        elif n in ('em', 'i'):
            walk_inline(ch, flow, bold, True, href, ctx)
        elif n == 'li':
            flow.br()
            if ch.find('br') is None:
                flow.text('• ', bold, italic, None)
            walk_inline(ch, flow, bold, italic, href, ctx)
            flow.br()
        elif n in BLOCK_TAGS:
            flow.br()
            walk_inline(ch, flow, bold or n[0] == 'h' and len(n) == 2, italic, href, ctx)
            flow.br()
        else:
            walk_inline(ch, flow, bold, italic, href, ctx)


def src_ref(src):
    if not src:
        return None
    m = re.search(r'/img/(\d+)[^"\']*?\.(\w+)', src)
    return f'{m.group(1)}.{m.group(2).lower()}' if m else None


# ---------------------------------------------------------------- tables
def cell_text(td, ctx):
    f = Flow()
    walk_inline(td, f, ctx=ctx)
    f.para_break()
    parts = []
    for kind, v in f.items:
        if kind == 'para':
            parts += [l.md() for l in v]
        elif kind == 'image':
            parts.append(f'![]({v})')
    return ' '.join(p for p in parts if p).replace('|', '\\|').strip()


def cell_lines(td):
    f = Flow()
    walk_inline(td, f)
    f.para_break()
    return sum(len(v) for k, v in f.items if k == 'para')


def table_md(table, ctx):
    rows = table.find_all('tr')
    tds = table.find_all(['td', 'th'])
    if tds and max(cell_lines(td) for td in tds) >= 3 and max(len(r.find_all(['td', 'th'], recursive=False)) for r in rows) <= 3:
        # layout table (columns of text) -> render each cell as its own flow
        parts = []
        for td in tds:
            f = Flow()
            walk_inline(td, f, ctx=ctx)
            md = flow_md(f)
            if md.strip():
                parts.append(md)
        return '\n\n'.join(parts)
    grid, spans = [], {}
    for r_i, tr in enumerate(rows):
        row, c = [], 0
        cells = tr.find_all(['td', 'th'], recursive=False)
        ci = 0
        while ci < len(cells) or (r_i, c) in spans:
            if (r_i, c) in spans:
                row.append(spans.pop((r_i, c)))
                c += 1
                continue
            td = cells[ci]
            ci += 1
            t = cell_text(td, ctx)
            cs = int(td.get('colspan') or 1)
            rs = int(td.get('rowspan') or 1)
            for k in range(cs):
                row.append(t if k == 0 else ('\x00' + t))  # \x00 marks colspan continuation
                for rr in range(1, rs):
                    spans[(r_i + rr, c + k)] = t
            c += cs
        grid.append(row)
    grid = [r for r in grid if any(x.strip('\x00').strip() for x in r)]
    if not grid:
        return None
    width = max(len(r) for r in grid)
    # drop columns that are empty everywhere
    keep = [j for j in range(width) if any(j < len(r) and r[j].strip('\x00').strip() for r in grid)]
    grid = [[(r[j] if j < len(r) else '') for j in keep] for r in grid]
    width = len(keep)
    if width == 1:
        return '\n'.join(f'- {r[0]}' for r in grid if r[0])
    if width == 2:
        firsts = [r[0] for r in grid if r[0]]
        if firsts and sum(1 for x in firsts if strip_bold(x).rstrip().endswith(':')) >= 0.6 * len(firsts):
            # key : value table -> list
            out = []
            for k, v in grid:
                k = strip_bold(k).strip().rstrip(':').strip()
                v = v.replace('\x00', '').strip()
                out.append(f'- **{k}:** {v}' if k else f'- {v}')
            return '\n'.join(out)
    out, header = [], None

    def is_group(r):
        vals = [x for x in r if x and not x.startswith('\x00')]
        return len(vals) == 1 and r[0] == vals[0] and all((not x) or x.startswith('\x00') for x in r[1:]) and width > 2

    def clean(r):
        return [('' if x.startswith('\x00') else x) for x in r]

    cells = [x for r in grid for x in r if x and not x.startswith('\x00')]
    if cells and all(x.startswith('**') and x.endswith('**') for x in cells):
        grid = [[strip_bold(x) for x in r] for r in grid]
    header = clean(grid[0])
    body = grid[1:]
    sect = []

    def flush():
        if not sect and out:
            return
        out.append('| ' + ' | '.join(header) + ' |')
        out.append('|' + '|'.join(['---'] * width) + '|')
        for r in sect:
            out.append('| ' + ' | '.join(clean(r)) + ' |')
        out.append('')
        sect.clear()

    for r in body:
        if is_group(r):
            if sect:
                flush()
            out.append(f'**{strip_bold(r[0])}**')
            out.append('')
        else:
            sect.append(r)
    if sect or not out:
        flush()
    return '\n'.join(out).strip()


# ---------------------------------------------------------------- paragraphs -> md
def starts_lower(s):
    s = s.lstrip('«"\'(')
    return bool(s) and (s[0].islower() or s[0] in ',)')


BOILER = re.compile(r"^(?:batafsil ma.?lumot|батафсил маълумот|подробная информация|more information|detayl[ıi] bilgi)\s*:?$|ijtimoiy tarmoqlarda|ижтимоий тармоқларда|социальных сетях|social (?:media|networks)|sosyal (?:medya|a[ğg])|^[+\d\s()-]{9,}$", re.I)


def fix_links(md):
    # blogger editor links that were pasted instead of the real video URL
    return re.sub(r'\[(https?://[^\]\s]+)\]\(https://www\.blogger\.com/[^)]*\)', lambda m: '[' + m.group(1) + '](' + m.group(1).replace('\\_', '_') + ')', md)


def strip_bold(md):
    return re.sub(r'(?<!\\)\*\*', '', md)


def para_md(lines, title_style=False, dropped=None):
    joined = []
    for l in lines:
        if joined and starts_lower(l.plain) and not joined[-1][-1].plain.endswith(SENT_END) and not BULLETS.match(l.plain):
            joined[-1].append(l)
        else:
            joined.append([l])
    items = []
    for grp in joined:
        md = ' '.join(x.md() for x in grp)
        plain = ' '.join(x.plain for x in grp)
        if BOILER.search(plain) and len(plain) < 120:
            if dropped is not None:
                dropped.append(plain)
            continue
        items.append({'md': md, 'bold': all(x.all_bold for x in grp), 'plain': plain})
    if not items:
        return ''
    all_bold = all(i['bold'] for i in items)
    for i in items:
        if all_bold:
            i['md'] = strip_bold(i['md'])
        i['bullet'] = bool(BULLETS.match(i['plain']))
        i['short'] = len(i['plain']) <= 90 and not i['plain'].rstrip('*').endswith(('.', ','))

    def heading(i):
        return ('## ' if title_style else '### ') + strip_bold(i['md']).rstrip(':').strip()

    def li(i):
        body = re.sub(r'^\s*(\**)\s*(?:\\\*|[•●▪◦·\-–—✓✔✅➤►→])\s*', r'\1', i['md'])
        m = re.match(NUM, i['plain'])
        if m:
            body = re.sub(r'^\s*(\**)\d{1,2}(?:[.)]|\s+[–—-])\s+', r'\1', i['md'])
            return f"{m.group(1)}. {body}"
        if body.count('**') % 2:
            body = body.replace('**', '', 1)
        return '- ' + body

    if len(items) == 1:
        i = items[0]
        if i['bullet']:
            return li(i)
        if title_style or (i['bold'] and len(i['plain']) <= 120 and not i['plain'].endswith(('.', ','))):
            return heading(i)
        return i['md']

    out = []
    k = 0
    n = len(items)
    while k < n:
        # collect a run of list-like lines
        j = k
        while j < n and (items[j]['bullet'] or items[j]['short']):
            j += 1
        run = items[k:j]
        if len(run) >= 2:
            first = run[0]
            if len(run) >= 3 and not first['bullet'] and (first['plain'].endswith(':') or (first['bold'] and not all_bold)):
                out.append(heading(first))
                run = run[1:]
            lis = [li(i) for i in run]
            for mark in ('***', '**', '*'):
                bodies = [re.sub(r'^(- |\d+\. )', '', x) for x in lis]
                if all(b.startswith(mark) and b.endswith(mark) and len(b) > 2 * len(mark) for b in bodies):
                    lis = [re.match(r'^(- |\d+\. )', x).group(1) + re.sub(r'^(- |\d+\. )', '', x)[len(mark):-len(mark)] for x in lis]
                    break
            nested, prev_num_colon = [], False
            for x in lis:
                if x.startswith('- ') and prev_num_colon:
                    nested.append('   ' + x)
                    continue
                prev_num_colon = bool(re.match(r'^\d+\. ', x)) and x.rstrip('*').endswith(':')
                nested.append(x)
            out.append('\n'.join(nested))
            k = j
            continue
        if len(run) == 1:
            i = run[0]
            nxt = items[j] if j < n else None
            if i['bullet']:
                out.append(li(i))
            elif (i['bold'] and not all_bold) or i['plain'].endswith(':'):
                out.append(heading(i))
            else:
                out.append(i['md'])
            k = j
            continue
        # long line
        i = items[k]
        out.append(li(i) if i['bullet'] else i['md'])
        k += 1
    # merge adjacent list chunks
    res = []
    for o in out:
        if res and re.match(r'^(- |\d+\. )', o) and re.match(r'^(- |\d+\. )', res[-1].split('\n')[-1]):
            res[-1] += '\n' + o
        else:
            res.append(o)
    return '\n\n'.join(res)


def flow_md(flow, title_style=False):
    flow.para_break()
    out = []
    for kind, v in flow.items:
        if kind == 'para':
            out.append(para_md(v, title_style, DROPPED))
        elif kind == 'table':
            out.append(v)
        elif kind == 'image':
            out.append(f'![]({v})')
        elif kind == 'embed':
            out.append(f'::embed[{v}]')
    return fix_links('\n\n'.join(x for x in out if x.strip()))


# ---------------------------------------------------------------- elements / blocks
def element_md(el, ctx):
    eid = re.sub(r'\d+$', '', el.get('data-e-id', ''))
    if eid in ('text',):
        out = []
        for t in el.select('.element-text'):
            f = Flow()
            walk_inline(t, f, ctx=ctx)
            out.append(flow_md(f, 'text-style-title' in t.get('class', [])))
        return '\n\n'.join(out)
    if eid == 'media':
        out = []
        for fig in el.select('[data-img-id]'):
            r = img_ref(fig)
            if r:
                out.append(f'![]({r})')
        v = el.select_one('iframe, video')
        if v is not None and v.get('src'):
            out.append(f'::embed[{v.get("src")}]')
        for t in el.select('.element-text'):
            f = Flow()
            walk_inline(t, f, ctx=ctx)
            out.append(flow_md(f))
        return '\n\n'.join(out)
    if eid == 'spoiler':
        out = []
        for it in el.select('.spoiler-list-item'):
            title = it.select_one('.spoiler-text-title')
            desc = it.select_one('.spoiler-text-desc')
            dmd = ''
            if desc is not None:
                f = Flow()
                walk_inline(desc, f, ctx=ctx)
                dmd = flow_md(f)
            f = Flow()
            if title is not None:
                walk_inline(title, f, ctx=ctx)
            tmd = flow_md(f)
            if dmd:
                out.append('### ' + re.sub(r'^#+\s*', '', tmd.split('\n')[0]) + ('\n\n' + '\n'.join(tmd.split('\n')[1:]) if '\n' in tmd else ''))
                out.append(dmd)
            else:
                out.append(tmd)
        return '\n\n'.join(x for x in out if x.strip())
    if eid in ('table',):
        t = el.find('table')
        if t is not None:
            return table_md(t, ctx) or ''
        # Flexbe "table" element made of table_cell elements
        return ''
    if eid == 'table_cell':
        f = Flow()
        walk_inline(el, f, ctx=ctx)
        return flow_md(f)
    if eid == 'button':
        a = el.find('a')
        txt = el.get_text(' ', strip=True)
        href = (a.get('href') if a else '') or ''
        if href and not href.startswith('#') and txt:
            return f'[{esc(txt)}]({href})'
        return f'::cta[{esc(txt)}]' if txt else ''
    if eid == 'hr':
        return '---'
    if eid in ('html', 'map'):
        fr = el.find('iframe')
        return f'::embed[{fr.get("src")}]' if fr is not None and fr.get('src') else ''
    if eid in ('social', 'form'):
        return ''  # handled site-wide (settings / contact form)
    # unknown element: fall back to inline text
    f = Flow()
    walk_inline(el, f, ctx=ctx)
    return flow_md(f)


def block_md(block, ctx):
    parts = []
    els = block.select('[data-is=element]')
    for el in els:
        # skip elements nested inside another element (handled by parent)
        if el.find_parent(attrs={'data-is': 'element'}) is not None:
            continue
        eid = el.get('data-e-id', '')
        if eid.startswith('table') and not eid.startswith('table_cell'):
            pass
        md = element_md(el, ctx)
        if md.strip():
            parts.append(md.strip())
    return '\n\n'.join(parts)


def table_cells_as_table(block, ctx):
    """Flexbe 'table' element built from many table_cell elements in a grid zone."""
    return None


def page_parts(html, url):
    s = BeautifulSoup(html, 'lxml')
    meta = {}
    for m in s.find_all('meta'):
        k = m.get('name') or m.get('property')
        if k and m.get('content') and (k in ('description', 'keywords') or k.startswith('og:')):
            meta[k] = m['content'].strip()
    title = s.title.get_text(strip=True) if s.title else ''
    blocks = []
    lang_links = {}
    for b in s.select('.b_block'):
        if b.find_parent(class_='b_block'):
            continue
        kind = b.get('data-b-id')
        if 'b_block--global' in (b.get('class') or []) or kind == 'FOOTER':
            continue
        txt = b.get_text(' ', strip=True)
        if kind == 'HEADER' and LANG_SWITCH.search(txt):
            for a in b.find_all('a', href=True):
                lang_links[a.get_text(' ', strip=True)] = a['href']
            continue
        bg = b.select_one(':scope > .component-bg[data-img-id]')
        md = block_md(b, {'url': url})
        blocks.append({'id': b.get('data-id'), 'kind': kind, 'bg': img_ref(bg) if bg is not None else None, 'md': md})
    modals = []
    for m in s.select('.m_modal'):
        modals.append({'id': m.get('data-id') or (m.get('class') or [''])[-1], 'md': block_md(m, {'url': url})})
    return {'title': title, 'meta': meta, 'blocks': blocks, 'modals': modals, 'lang_links': lang_links}
