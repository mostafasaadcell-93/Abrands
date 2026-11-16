"""Bundle the Abrands site into ONE html file (double-click to open, no server)."""
import base64, os, re, sys
S, OUT = sys.argv[1], sys.argv[2]
MIME = {'.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.js': 'text/javascript'}
def uri(p): return f"data:{MIME[os.path.splitext(p)[1]]};base64," + base64.b64encode(open(os.path.join(S, p), 'rb').read()).decode()
def rd(p): return open(os.path.join(S, p), encoding='utf-8').read()
html, app, data, scene = rd('index.html'), rd('app.js'), rd('data.js'), rd('scene.js')
imgs = sorted(f for f in os.listdir(os.path.join(S, 'assets/img')) if f.endswith(('.webp', '.png')))
amap = 'window.__IMG={' + ','.join(f'"{f}":"{uri("assets/img/" + f)}"' for f in imgs) + '};'
fix = "const __A=s=>s.replace(/assets\\/img\\/([\\w.-]+)/g,(m,f)=>window.__IMG[f]||m);"
app = fix + app.replace("const img = p => `assets/img/${p.img}.webp`;", "const img = p => window.__IMG[p.img + '.webp'];") \
              .replace("$('#storyLidImg').src = `assets/img/${b.dataset.lid}.png`;", "$('#storyLidImg').src = window.__IMG[b.dataset.lid + '.png'];")
scene = scene.replace("from './assets/vendor/RoomEnvironment.js'", "from 'roomenv'").replace("t = loader.load('assets/img/' + k);", "t = loader.load(window.__IMG[k]);")
imap = '{"imports":{"three":"' + uri('assets/vendor/three.module.min.js') + '","roomenv":"' + uri('assets/vendor/RoomEnvironment.js') + '"}}'
html = re.sub(r'<script type="importmap">.*?</script>', lambda m: f'<script type="importmap">{imap}</script>', html, flags=re.S)
html = re.sub(r'<link rel="preload"[^>]*>\n?', '', html)
for p in sorted(set(re.findall(r'assets/(?:img|fonts)/[\w.-]+\.(?:webp|png|woff2)', html))): html = html.replace(p, uri(p))
html = html.replace('<script src="data.js"></script>', '<script>' + data + '\n' + amap + '</script>')
html = html.replace('<script src="app.js"></script>', '<script>' + app.replace('</script>', '<\\/script>') + '</script>')
html = html.replace('<script type="module" src="scene.js"></script>', '<script type="module">' + scene + '</script>')
assert 'src="assets' not in html and 'url(assets' not in html and "loader.load('assets" not in html
open(OUT, 'w', encoding='utf-8').write(html); print(OUT, round(os.path.getsize(OUT) / 1e6, 2), 'MB')
