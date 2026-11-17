/* Abrands 3D: product studio. Four products (Acup cup, Abar bar, Abites box, Abutter jar)
   modelled in Three.js with Abrands' real packaging art, studio lighting and real soft shadows.
   API: window.ABScene.show(brandId, product, color) */
import * as THREE from 'three';
import { RoomEnvironment } from './assets/vendor/RoomEnvironment.js';

const host = document.getElementById('stage3d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fail = () => document.documentElement.classList.add('no3d');

let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { fail(); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;
const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

/* studio lights: soft key with shadow, fill, and a faint brand-coloured rim */
scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a1f, .55));
const key = new THREE.DirectionalLight(0xfff4e8, 2.6);
key.position.set(-3.5, 7, 4.5); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 9; key.shadow.blurSamples = 16; key.shadow.bias = -.0004;
Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 20 });
scene.add(key);
const fill = new THREE.DirectionalLight(0xdfe8ff, .7); fill.position.set(5, 2.5, 3); scene.add(fill);
const rim = new THREE.SpotLight(0x2ec4c6, 26, 16, .5, .8); rim.position.set(1.5, 4.5, -5); scene.add(rim); scene.add(rim.target);

const loader = new THREE.TextureLoader(), texCache = {};
function tex(name, ext = 'webp') {
  const k = name + '.' + ext;
  if (!texCache[k]) { const t = loader.load('assets/img/' + k); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; texCache[k] = t; }
  return texCache[k];
}
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function noise(ctx, w, h, n, cols, rmin, rmax, a0 = .25, a1 = .8) {
  for (let i = 0; i < n; i++) { ctx.globalAlpha = a0 + Math.random() * (a1 - a0); ctx.fillStyle = cols[i % cols.length]; ctx.beginPath(); ctx.ellipse(Math.random() * w, Math.random() * h, rmin + Math.random() * (rmax - rmin), rmin + Math.random() * (rmax - rmin) * .7, Math.random() * 3, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
}

const world = new THREE.Group(); scene.add(world);
const stage = new THREE.Group(); world.add(stage);

/* floor: invisible except for real shadows + a soft contact shadow */
const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .42 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; world.add(floor);
const blobTex = canvasTex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(0,0,0,.75)'); g.addColorStop(.45, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
blob.rotation.x = -Math.PI / 2; blob.position.y = .002; world.add(blob);

const products = {};
const holder = () => { const g = new THREE.Group(); g.visible = false; stage.add(g); return g; };
const shadowAll = g => g.traverse(o => { if (o.isMesh && !o.material.transparent) o.castShadow = true; });
const fresnel = color => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
  uniforms: { uColor: { value: new THREE.Color(color) }, uStr: { value: .55 } },
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'uniform vec3 uColor; uniform float uStr; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0-abs(dot(normalize(vN),normalize(vV))), 3.0); gl_FragColor = vec4(uColor*f*uStr, f*uStr); }',
});
const plastic = () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .06, metalness: 0, transparent: true, opacity: .16, envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: .05, side: THREE.DoubleSide, depthWrite: false });

/* ---------- ACUP: clear tub, crumble base, protein cream, foil + printed lid with pull tab ---------- */
{
  const g = holder(), R0 = .95, R1 = 1.1, H = .95;
  const rAt = y => R0 + (R1 - R0) * (y / H);
  // tub profile: stacking ring at the base, straight tapered wall, flange lip
  const prof = [[0.001, .04], [R0 - .12, .04], [R0 - .1, 0], [R0 - .02, 0], [R0, .05]];
  for (let i = 1; i <= 16; i++) { const y = .05 + (H - .05) * i / 16; prof.push([rAt(y), y]); }
  prof.push([R1 + .1, H + .01], [R1 + .12, H + .03], [R1 + .11, H + .05], [R1, H + .045]);
  const tubGeo = new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), 128);
  const tub = new THREE.Mesh(tubGeo, plastic()); tub.renderOrder = 3; g.add(tub);
  const edge = new THREE.Mesh(tubGeo, fresnel(0xffffff)); edge.renderOrder = 4; g.add(edge);
  // fill layers (inset so the plastic shows in front)
  const crumbTex = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#B8902F'; c.fillRect(0, 0, w, h); noise(c, w, h, 2600, ['#D9B04A', '#8C6A1C', '#E8C76A', '#A27C27', '#6E5216'], .8, 3.4); });
  crumbTex.wrapS = THREE.RepeatWrapping; crumbTex.repeat.set(3, 1);
  const creamTex = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); noise(c, w, h, 900, ['#e9e2d6', '#f7f2ea', '#d8cfbf'], 2, 9, .15, .4); }, true);
  creamTex.wrapS = THREE.RepeatWrapping; creamTex.repeat.set(4, 1);
  const layer = (y0, y1, mat, wobble) => {
    const geo = new THREE.CylinderGeometry(rAt(y1) - .045, rAt(y0) - .045, y1 - y0, 96, 6, false);
    if (wobble) { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i); if (y > (y1 - y0) / 2 - .001) continue; const a = Math.atan2(z, x); p.setY(i, y + Math.sin(a * 7) * wobble + Math.sin(a * 13 + 1) * wobble * .6); } geo.computeVertexNormals(); }
    const m = new THREE.Mesh(geo, mat); m.position.y = (y0 + y1) / 2; m.renderOrder = 1; g.add(m); return m;
  };
  const crumbMat = new THREE.MeshStandardMaterial({ map: crumbTex, roughness: .95 });
  const creamMat = new THREE.MeshPhysicalMaterial({ map: creamTex, color: 0xB99B6C, roughness: .55, clearcoat: .15, sheen: .3, sheenColor: new THREE.Color(0xffffff) });
  layer(.05, .33, crumbMat, .025);
  const cream = layer(.31, H - .03, creamMat, 0);
  // foil seal + printed lid (overhangs the flange) + pull tab
  const foilMat = new THREE.MeshStandardMaterial({ color: 0xd7dade, metalness: .9, roughness: .28 });
  const lidMat = new THREE.MeshStandardMaterial({ map: tex('lid-trio'), roughness: .45, metalness: .15 });
  const lidR = R1 + .12;
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(lidR, lidR, .018, 128), [foilMat, lidMat, foilMat]);
  lid.position.y = H + .065; lid.rotation.y = Math.PI / 2 - .35; g.add(lid);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(.3, .016, .22), foilMat); tab.position.set(lidR + .08, H + .065, 0); tab.rotation.y = .35; g.add(tab);
  shadowAll(g);
  products.acup = { g, lidMat, creamMat, scale: 1.12, y: .62, lean: .34, blob: 2.7 };
}

/* ---------- ABAR: pillow-shaped foil wrapper with crimped seals ---------- */
{
  const g = holder(), W = 3.2, Hh = .92, D = .46;
  const geo = new THREE.BoxGeometry(W, Hh, D, 64, 18, 4), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const fx = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * x / W), 12)), .35);
    const fy = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * y / Hh), 4)), .5);
    p.setZ(i, z * fx * (.35 + .65 * fy));
    p.setY(i, y * (.92 + .08 * fx));
  }
  geo.computeVertexNormals();
  const front = new THREE.MeshPhysicalMaterial({ map: tex('tex-bar-dark'), roughness: .32, metalness: .25, clearcoat: .7, clearcoatRoughness: .2 });
  const back = new THREE.MeshPhysicalMaterial({ color: 0x3a2418, roughness: .35, metalness: .4, clearcoat: .6 });
  const foil = new THREE.MeshStandardMaterial({ color: 0xc9ccd1, roughness: .3, metalness: .85 });
  const bar = new THREE.Mesh(geo, [foil, foil, foil, foil, front, back]); g.add(bar);
  [-1, 1].forEach(s => {
    const cg = new THREE.PlaneGeometry(.22, Hh * .96, 12, 24), cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getY(i) * 46) * .012);
    cg.computeVertexNormals();
    const crimp = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ color: 0xc9ccd1, roughness: .3, metalness: .85, side: THREE.DoubleSide }));
    crimp.position.x = s * (W / 2 + .09); g.add(crimp);
  });
  shadowAll(g);
  products.abar = { g, front, back, scale: .92, y: .95, lean: 0, roll: .22, blob: 3.6 };
}

/* ---------- ABITES: carton with real front, printed sides; protein bites ---------- */
{
  const g = holder(), s = 1.7, d = .6, h = s * 1.12;
  const side = canvasTex(256, 512, (c, w, hh) => { c.fillStyle = '#F2EADF'; c.fillRect(0, 0, w, hh); c.fillStyle = '#B3202C'; c.fillRect(0, 0, w, 70); c.save(); c.translate(w / 2, hh / 2 + 30); c.rotate(-Math.PI / 2); c.fillStyle = '#1b1b1b'; c.font = '900 70px Archivo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PROTEIN BITES', 0, 0); c.restore(); });
  const top = canvasTex(256, 128, (c, w, hh) => { c.fillStyle = '#F2EADF'; c.fillRect(0, 0, w, hh); c.fillStyle = '#B3202C'; c.font = 'italic 900 40px Archivo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ABITES', w / 2, hh / 2); });
  const card = o => new THREE.MeshStandardMaterial({ roughness: .78, ...o });
  const front = card({ map: tex('tex-bites') });
  const box = new THREE.Mesh(new THREE.BoxGeometry(s, h, d), [card({ map: side }), card({ map: side }), card({ map: top }), card({ color: 0xe9e0d3 }), front, card({ color: 0xf2eadf })]);
  box.position.y = h / 2; g.add(box);
  const bt = canvasTex(256, 128, (c, w, hh) => { c.fillStyle = '#6E4129'; c.fillRect(0, 0, w, hh); noise(c, w, hh, 1100, ['#8A5636', '#4E2B1A', '#7FA34A', '#A0683F', '#5b331f'], .5, 2.4); });
  const biteM = new THREE.MeshStandardMaterial({ map: bt, roughness: .92 });
  const n3 = (x, y, z) => Math.sin(x * 17.1 + y * 3.3) * .5 + Math.sin(y * 13.7 + z * 5.1) * .3 + Math.sin(z * 19.3 + x * 7.7) * .2;
  [[1.25, .22, .62, .24], [-1.2, .2, .72, .22], [1.12, .19, -.5, .2]].forEach(([x, y, z, r]) => {
    const geo = new THREE.SphereGeometry(r, 48, 32), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i), k = 1 + n3(vx / r, vy / r, vz / r) * .06; p.setXYZ(i, vx * k, vy * k * .93, vz * k); }
    geo.computeVertexNormals(); const b = new THREE.Mesh(geo, biteM); b.position.set(x, r * .93, z); g.add(b);
  });
  shadowAll(g);
  products.abites = { g, front, scale: 1, y: .05, lean: 0, blob: 3.2 };
}

/* ---------- ABUTTER: PET jar with shoulders, peanut butter, label, ridged cap ---------- */
{
  const g = holder(), R = .82, H = 1.75;
  const jp = [[0.001, 0], [R - .1, 0], [R, .08], [R, H - .22], [R - .06, H - .1], [R - .14, H - .04], [R - .14, H + .02]].map(p => new THREE.Vector2(p[0], p[1]));
  const jarGeo = new THREE.LatheGeometry(jp, 128);
  const jar = new THREE.Mesh(jarGeo, plastic()); jar.renderOrder = 3; g.add(jar);
  const jedge = new THREE.Mesh(jarGeo, fresnel(0xffffff)); jedge.renderOrder = 4; g.add(jedge);
  const pbTex = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); noise(c, w, h, 600, ['#efe6dc', '#f8f3ec'], 3, 12, .2, .5); });
  const pbp = jp.map(v => new THREE.Vector2(Math.max(.001, v.x - .03), Math.min(v.y, H - .16)));
  const pb = new THREE.Mesh(new THREE.LatheGeometry(pbp, 96), new THREE.MeshPhysicalMaterial({ map: pbTex, color: 0x9a5e2a, roughness: .42, clearcoat: .5, clearcoatRoughness: .25 }));
  pb.renderOrder = 1; g.add(pb);
  const lc = document.createElement('canvas'); lc.width = 2048; lc.height = 640; const l = lc.getContext('2d');
  const labelTex = new THREE.CanvasTexture(lc); labelTex.colorSpace = THREE.SRGBColorSpace; labelTex.anisotropy = 8;
  const drawLabel = () => {
    l.fillStyle = '#2F9FDB'; l.fillRect(0, 0, 2048, 640);
    const peanut = (x, y, s, a) => { l.save(); l.translate(x, y); l.rotate(a); l.fillStyle = '#E3B272'; l.strokeStyle = '#A8733A'; l.lineWidth = 4 * s;
      l.beginPath(); l.ellipse(-22 * s, 0, 30 * s, 24 * s, 0, 0, 7); l.ellipse(22 * s, 0, 28 * s, 22 * s, 0, 0, 7); l.fill(); l.stroke(); l.restore(); };
    const C = 1024; l.fillStyle = '#fff'; l.textAlign = 'center'; l.textBaseline = 'middle';
    l.font = 'italic 900 64px Archivo, sans-serif'; l.fillText('ABUTTER', C, 96);
    l.font = '700 22px Archivo, sans-serif'; l.globalAlpha = .9; l.fillText('BOOST • GAIN • RECOVER', C, 140); l.globalAlpha = 1;
    l.font = '900 190px Archivo, sans-serif'; l.fillText('Peanut', C - 20, 300); l.fillText('Butter', C + 40, 480);
    l.font = 'italic 800 34px Archivo, sans-serif'; l.fillStyle = '#0E3A57'; l.fillText('only peanuts', C - 420, 470);
    peanut(C + 360, 210, 1.5, .5); peanut(C - 380, 330, 1.2, -.4); peanut(C + 420, 470, 1.1, .2);
    l.fillStyle = '#fff'; l.font = '700 26px Archivo, sans-serif'; l.fillText('NET WT 340g', C + 640, 120); l.fillText('100% NATURAL', C - 640, 560);
    labelTex.needsUpdate = true;
  };
  drawLabel(); document.fonts && document.fonts.ready.then(drawLabel);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(R + .008, R + .008, H * .55, 128, 1, true), new THREE.MeshPhysicalMaterial({ map: labelTex, color: 0xdedede, roughness: .38, clearcoat: .5, side: THREE.DoubleSide }));
  label.position.y = H * .45; label.rotation.y = Math.PI; label.renderOrder = 2; g.add(label);
  const capGeo = new THREE.CylinderGeometry(R - .06, R - .06, .34, 160, 1), cp = capGeo.attributes.position;
  for (let i = 0; i < cp.count; i++) { const x = cp.getX(i), z = cp.getZ(i), rr = Math.hypot(x, z); if (rr > R - .08) { const a = Math.atan2(z, x), k = 1 + Math.cos(a * 80) * .006; cp.setX(i, x * k); cp.setZ(i, z * k); } }
  capGeo.computeVertexNormals();
  const cap = new THREE.Mesh(capGeo, new THREE.MeshPhysicalMaterial({ color: 0xf4f4f2, roughness: .38, clearcoat: .3 })); cap.position.y = H + .17; g.add(cap);
  shadowAll(g); label.castShadow = true;
  products.abutter = { g, scale: .95, y: .12, lean: 0, blob: 2.6 };
}

/* ---------- layout ---------- */
let narrow = false;
function layout() {
  const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; narrow = w / h < .95;
  stage.scale.setScalar(narrow ? 1.12 : 1);
  if (narrow) { camera.position.set(0, 3.7, 10.2); camera.lookAt(0, 1.5, 0); camera.clearViewOffset(); }
  else { camera.position.set(0, 3.9, 10.6); camera.lookAt(0, 1.55, 0); camera.setViewOffset(w, h, -w * Math.min(.22, (w / h - .95) * .3), 0, w, h); }
  camera.updateProjectionMatrix();
}
layout(); addEventListener('resize', layout); new ResizeObserver(layout).observe(host);

/* ---------- switching ---------- */
let cur = null, next = null, swap = 0, spinBoost = 0;
const accent = new THREE.Color(0x2ec4c6), accentT = new THREE.Color(0x2ec4c6);
function applyProduct(id, p) {
  const P = products[id]; if (!P || !p) return;
  if (id === 'acup') { if (p.lid) { P.lidMat.map = tex(p.lid); P.lidMat.needsUpdate = true; } P.creamMat.color.set(p.cream || '#B99B6C'); }
  if (id === 'abar' && p.tex) { P.front.map = tex(p.tex); P.front.needsUpdate = true; P.back.color.set(p.color); }
}
window.ABScene = {
  show(id, p, color) {
    if (color) accentT.set(color);
    if (!cur) { cur = id; products[id].g.visible = true; applyProduct(id, p); return; }
    if (swap > 0 && swap < .5) { next = { id, p }; return; }
    if (id === cur) { next = null; applyProduct(id, p); spinBoost = 1; return; }
    next = { id, p }; swap = reduce ? 1 : .0001;
    if (reduce) { products[cur].g.visible = false; cur = id; products[id].g.visible = true; applyProduct(id, p); next = null; swap = 0; }
  },
  _state() { const P = products[cur]; /* debug helper used by tests */ return { cur, swap, next: next && next.id, scale: +P.g.scale.x.toFixed(3), y: +P.g.position.y.toFixed(2) }; },
};

/* ---------- input ---------- */
let spin = 0, vel = 0, dragging = false, lastX = 0, px = 0, py = 0;
host.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; host.setPointerCapture(e.pointerId); host.classList.add('grab'); });
host.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; vel = dx * .007; spin += vel; });
const up = () => { dragging = false; host.classList.remove('grab'); };
host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);
addEventListener('pointermove', e => { px = e.clientX / innerWidth * 2 - 1; py = e.clientY / innerHeight * 2 - 1; }, { passive: true });

/* ---------- loop ---------- */
let visible = true, raf = 0, last = performance.now(); const t0 = last; let tx = 0, ty = 0;
new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }).observe(host);
document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } });
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function tick(now) {
  raf = 0; if (!visible || document.hidden) return;
  const dt = Math.min(.05, (now - last) / 1000); last = now; const t = (now - t0) / 1000;
  const intro = reduce ? 1 : ease(Math.min(1, Math.max(0, (t - .2) / 1.3)));
  let k = 1, extraSpin = 0, lift = 0;
  if (swap > 0) {
    swap += dt / .8;
    if (swap < .5) { const e = ease(swap * 2); k = 1 - e; extraSpin = e * Math.PI * .8; lift = e * .8; }
    else {
      if (next) { products[cur].g.visible = false; cur = next.id; products[cur].g.visible = true; applyProduct(cur, next.p); next = null; }
      const e = ease((swap - .5) * 2); k = e; extraSpin = -(1 - e) * Math.PI * .8; lift = (1 - e) * .8;
    }
    if (swap >= 1) swap = 0;
  }
  if (spinBoost > 0) { extraSpin += Math.sin(spinBoost * Math.PI) * .9; spinBoost = Math.max(0, spinBoost - dt * 1.4); }
  if (!dragging) { spin += vel; vel *= .93; if (Math.abs(vel) < .002) { const home = Math.round(spin / (Math.PI * 2)) * Math.PI * 2; spin += (home - spin) * .03; } }
  const P = products[cur];
  if (P) {
    const bob = reduce ? 0 : Math.sin(t * 1.2) * .06;
    const y = P.y + bob + lift + (1 - intro) * 1.2;
    P.g.scale.setScalar(P.scale * (.75 + .25 * intro) * Math.max(.001, k));
    P.g.position.y = y;
    P.g.rotation.set(P.lean || 0, spin + extraSpin + (reduce ? 0 : Math.sin(t * .5) * .45), P.roll ? P.roll + Math.sin(t * .8) * .03 : 0, 'YXZ');
    // contact shadow grows/fades with height
    const s = P.blob * P.scale * Math.max(.001, k) * (1 + (y - P.y) * .3);
    blob.scale.set(s, s, 1); blob.material.opacity = Math.max(0, .9 - (y - P.y) * .9) * k;
  }
  accent.lerp(accentT, .06); rim.color.copy(accent);
  tx += (px - tx) * .05; ty += (py - ty) * .05;
  world.rotation.y = tx * .12; world.rotation.x = ty * .04;
  renderer.render(scene, camera);
  raf = requestAnimationFrame(tick);
}
document.documentElement.classList.add('has3d');
raf = requestAnimationFrame(tick);
