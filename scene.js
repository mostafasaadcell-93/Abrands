/* Abrands 3D: the four products (Acup cup, Abar bar, Abites box, Abutter jar) built in Three.js
   and wrapped in Abrands' real packaging art, on a neon turntable.
   API: window.ABScene.show(brandId, product?)  window.ABScene.setLid(lidImageName)
        window.ABScene.peel(0..1)  (scroll story: lid peels off the cup) */
import * as THREE from 'three';
import { RoomEnvironment } from './assets/vendor/RoomEnvironment.js';

const host = document.getElementById('stage3d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fail = () => document.documentElement.classList.add('no3d');

let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { fail(); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.7));
const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 6, 6); scene.add(key);
const rimA = new THREE.PointLight(0x2ec4c6, 30, 14); rimA.position.set(-3.2, 2.2, -2.2); scene.add(rimA);
const rimB = new THREE.PointLight(0xff3355, 18, 14); rimB.position.set(3.4, 1.2, -2.6); scene.add(rimB);

const loader = new THREE.TextureLoader();
const texCache = {};
function tex(name, ext = 'webp') {
  const k = name + '.' + ext;
  if (!texCache[k]) { const t = loader.load('assets/img/' + k); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; texCache[k] = t; }
  return texCache[k];
}
const world = new THREE.Group(); scene.add(world);
const stage = new THREE.Group(); world.add(stage);

/* ---------- neon podium ---------- */
const podium = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.05, 0.28, 96), new THREE.MeshStandardMaterial({ color: 0x0b0b0e, roughness: .3, metalness: .7, envMapIntensity: .3 }));
podium.position.y = -0.14; world.add(podium);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x2ec4c6 });
const ring = new THREE.Mesh(new THREE.TorusGeometry(1.96, 0.022, 12, 160), ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = 0.005; world.add(ring);
const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.06, 0.012, 12, 160), ringMat); ring2.rotation.x = Math.PI / 2; ring2.position.y = -0.28; world.add(ring2);
// glow disc
const gC = document.createElement('canvas'); gC.width = gC.height = 256; const gx = gC.getContext('2d');
const gr = gx.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.4, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
gx.fillStyle = gr; gx.fillRect(0, 0, 256, 256);
const glowMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gC), color: 0x2ec4c6, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .55 });
const glow = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 6.5), glowMat); glow.rotation.x = -Math.PI / 2; glow.position.y = -0.29; world.add(glow);

const base = new THREE.Group(); [podium, ring, ring2, glow].forEach(m => base.add(m)); world.add(base);

/* ---------- products ---------- */
const products = {};
function holder() { const g = new THREE.Group(); g.visible = false; stage.add(g); return g; }

// ACUP: squat transparent tub, protein cream + crumble, printed lid on top
{
  const g = holder(), R0 = 1.02, R1 = 1.16, H = 0.92;
  const prof = [new THREE.Vector2(0.001, 0), new THREE.Vector2(R0 - .05, 0), new THREE.Vector2(R0, .05), new THREE.Vector2(R1, H), new THREE.Vector2(R1 + .05, H + .03), new THREE.Vector2(R1 + .05, H + .07)];
  const tub = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .1, transparent: true, opacity: .25, envMapIntensity: 2, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1 }));
  tub.renderOrder = 3; g.add(tub);
  const rAt = y => R0 + (R1 - R0) * (y / H);
  const fill = (y0, y1, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rAt(y1) - .03, rAt(y0) - .03, y1 - y0, 72), mat); m.position.y = (y0 + y1) / 2; m.renderOrder = 1; g.add(m); return m; };
  const crumbC = document.createElement('canvas'); crumbC.width = 512; crumbC.height = 128; const cc = crumbC.getContext('2d');
  cc.fillStyle = '#C79B62'; cc.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 1600; i++) { cc.fillStyle = ['#E3C08A', '#9E7240', '#F2D9AA', '#87592F'][i % 4]; cc.globalAlpha = Math.random() * .6 + .2; cc.beginPath(); cc.arc(Math.random() * 512, Math.random() * 128, Math.random() * 2.4 + .5, 0, 7); cc.fill(); }
  const ct = new THREE.CanvasTexture(crumbC); ct.colorSpace = THREE.SRGBColorSpace; ct.wrapS = THREE.RepeatWrapping; ct.repeat.set(3, 1);
  fill(.03, .34, new THREE.MeshStandardMaterial({ map: ct, roughness: .95 }));
  const cream = fill(.34, .86, new THREE.MeshPhysicalMaterial({ color: 0xf0e2c8, roughness: .45, clearcoat: .3 }));
  // foil seal (silver) + printed lid
  const foil = new THREE.Mesh(new THREE.CylinderGeometry(R1 + .05, R1 + .05, .012, 96), new THREE.MeshStandardMaterial({ color: 0xd9dde3, metalness: .9, roughness: .25 }));
  foil.position.y = H + .075; g.add(foil);
  const lidPivot = new THREE.Group(); lidPivot.position.set(-(R1 + .1), H + .085, 0); g.add(lidPivot);
  const lidMat = new THREE.MeshStandardMaterial({ map: tex('lid-coffee', 'png'), roughness: .55, metalness: .05, transparent: true });
  const lidEdge = new THREE.MeshStandardMaterial({ color: 0xd9dde3, metalness: .85, roughness: .3 });
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(R1 + .1, R1 + .1, .035, 96), [lidEdge, lidMat, lidEdge]);
  lid.position.set(R1 + .1, .018, 0); lid.rotation.y = Math.PI / 2 - .5; lidPivot.add(lid);
  // spoon
  const spoon = new THREE.Group();
  const sm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .35 });
  const handle = new THREE.Mesh(new THREE.BoxGeometry(.08, .02, .9), sm); handle.position.z = .45; spoon.add(handle);
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(.13, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), sm); bowl.scale.set(1, .35, 1.3); bowl.rotation.x = Math.PI; spoon.add(bowl);
  spoon.position.set(.25, H + .02, .1); spoon.rotation.set(.18, .6, 0); spoon.visible = false; g.add(spoon);
  products.acup = { g, lid, lidMat, lidPivot, cream, spoon, scale: 1.08, y: .4, tilt: 0, lean: .6 };
}

// ABAR: wrapped bar with crimped ends, front art = real wrapper
{
  const g = holder(), W = 3.1, Hh = .94, D = .42;
  const front = new THREE.MeshStandardMaterial({ map: tex('tex-bar-dark'), roughness: .38, metalness: .25 });
  const back = new THREE.MeshStandardMaterial({ color: 0x2a1b14, roughness: .4, metalness: .35 });
  const side = new THREE.MeshStandardMaterial({ color: 0xcfd3d8, roughness: .3, metalness: .75 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, Hh, D, 1, 1, 1), [side, side, side, side, front, back]); g.add(body);
  // pillow bulge: slight rounding via scaled sphere caps
  [-1, 1].forEach(s => {
    const crimp = new THREE.Mesh(new THREE.BoxGeometry(.16, Hh * 1.04, .08, 6, 1, 1), side);
    const pos = crimp.geometry.attributes.position; for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) + Math.sin(pos.getY(i) * 40) * .012);
    crimp.position.x = s * (W / 2 + .07); g.add(crimp);
  });
  products.abar = { g, front, back, scale: .9, y: .85, tilt: .15 };
}

// ABITES: box with the real front, red/cream sides
{
  const g = holder(), s = 1.75, d = .62;
  const front = new THREE.MeshStandardMaterial({ map: tex('tex-bites'), roughness: .6 });
  const sideM = new THREE.MeshStandardMaterial({ color: 0xf1e8dc, roughness: .7 });
  const topM = new THREE.MeshStandardMaterial({ color: 0xf1e8dc, roughness: .7 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(s, s * 1.12, d), [sideM, sideM, topM, topM, front, sideM]); box.position.y = s * .56; g.add(box);
  // a few protein bites around it
  const bc = document.createElement('canvas'); bc.width = 256; bc.height = 128; const bx = bc.getContext('2d');
  bx.fillStyle = '#6E4129'; bx.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 900; i++) { bx.fillStyle = ['#8A5636', '#4E2B1A', '#7FA34A', '#A0683F'][i % 4]; bx.globalAlpha = Math.random() * .7 + .2; bx.beginPath(); bx.arc(Math.random() * 256, Math.random() * 128, Math.random() * 2.2 + .4, 0, 7); bx.fill(); }
  const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace;
  const biteM = new THREE.MeshStandardMaterial({ map: bt, roughness: .9 });
  const noise = (x, y, z) => Math.sin(x * 17.1 + y * 3.3) * .5 + Math.sin(y * 13.7 + z * 5.1) * .3 + Math.sin(z * 19.3 + x * 7.7) * .2;
  [[1.3, .22, .6, .24], [-1.25, .2, .75, .22], [1.1, .19, -.62, .2]].forEach(([x, y, z, r]) => {
    const geo = new THREE.SphereGeometry(r, 40, 28), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i), k = 1 + noise(vx / r, vy / r, vz / r) * .06; p.setXYZ(i, vx * k, vy * k * .94, vz * k); }
    geo.computeVertexNormals(); const b = new THREE.Mesh(geo, biteM); b.position.set(x, y, z); g.add(b);
  });
  products.abites = { g, front, scale: 1, y: 0, tilt: -.2 };
}

// ABUTTER: glass jar of peanut butter + blue label + white lid
{
  const g = holder(), R = .82, H = 1.85;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 72), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .08, transparent: true, opacity: .18, envMapIntensity: 2, depthWrite: false, clearcoat: 1 }));
  glass.position.y = H / 2; glass.renderOrder = 3; g.add(glass);
  const pb = new THREE.Mesh(new THREE.CylinderGeometry(R - .03, R - .03, H - .25, 72), new THREE.MeshPhysicalMaterial({ color: 0x9a5e2a, roughness: .45, clearcoat: .5, clearcoatRoughness: .25 }));
  pb.position.y = (H - .25) / 2 + .02; pb.renderOrder = 1; g.add(pb);
  // label drawn in Abutter's style: sky blue, chunky white "Peanut Butter", peanuts
  const lc = document.createElement('canvas'); lc.width = 2048; lc.height = 640; const l = lc.getContext('2d');
  const drawLabel = () => {
    l.fillStyle = '#2F9FDB'; l.fillRect(0, 0, 2048, 640);
    l.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 14; i++) l.fillRect(i * 160 - 40, 0, 60, 640);
    const peanut = (x, y, s, a) => { l.save(); l.translate(x, y); l.rotate(a); l.fillStyle = '#E3B272'; l.strokeStyle = '#A8733A'; l.lineWidth = 4 * s;
      l.beginPath(); l.ellipse(-22 * s, 0, 30 * s, 24 * s, 0, 0, 7); l.ellipse(22 * s, 0, 28 * s, 22 * s, 0, 0, 7); l.fill(); l.stroke();
      l.strokeStyle = 'rgba(140,90,40,.5)'; l.lineWidth = 2 * s; for (let k = -40; k <= 40; k += 14) { l.beginPath(); l.moveTo(k * s, -16 * s); l.lineTo(k * s, 16 * s); l.stroke(); } l.restore(); };
    const C = 1024;
    l.fillStyle = '#fff'; l.textAlign = 'center'; l.textBaseline = 'middle';
    l.font = 'italic 900 64px Archivo, sans-serif'; l.fillText('ABUTTER', C, 96);
    l.font = '700 22px Archivo, sans-serif'; l.globalAlpha = .9; l.fillText('BOOST • GAIN • RECOVER', C, 140); l.globalAlpha = 1;
    l.font = '900 190px Archivo, sans-serif'; l.fillText('Peanut', C - 20, 300);
    l.font = '900 190px Archivo, sans-serif'; l.fillText('Butter', C + 40, 480);
    l.font = 'italic 800 34px Archivo, sans-serif'; l.fillStyle = '#0E3A57'; l.fillText('only peanuts', C - 420, 470);
    peanut(C + 360, 210, 1.5, .5); peanut(C - 380, 330, 1.2, -.4); peanut(C + 420, 470, 1.1, .2);
    l.fillStyle = '#fff'; l.font = '700 26px Archivo, sans-serif'; l.fillText('NET WT 340g', C + 640, 120); l.fillText('100% NATURAL', C - 640, 560);
    labelTex.needsUpdate = true;
  };
  const labelTex = new THREE.CanvasTexture(lc); labelTex.colorSpace = THREE.SRGBColorSpace; labelTex.anisotropy = 8;
  drawLabel(); document.fonts && document.fonts.ready.then(drawLabel);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(R + .012, R + .012, H * .56, 96, 1, true), new THREE.MeshStandardMaterial({ map: labelTex, color: 0xd8d8d8, roughness: .5, side: THREE.DoubleSide }));
  label.position.y = H * .46; label.rotation.y = Math.PI; label.renderOrder = 2; g.add(label);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(R + .06, R + .06, .36, 72), new THREE.MeshStandardMaterial({ color: 0xf6f6f4, roughness: .35 }));
  cap.position.y = H + .16; g.add(cap);
  const ridges = new THREE.Mesh(new THREE.CylinderGeometry(R + .075, R + .075, .3, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3, wireframe: false, transparent: true, opacity: .0 }));
  ridges.position.y = cap.position.y; g.add(ridges);
  products.abutter = { g, scale: .95, y: 0, tilt: -.18 };
}

/* ---------- particles (flavour bits) ---------- */
const N = 46, bitGeo = new THREE.OctahedronGeometry(.05, 0), bitMat = new THREE.MeshStandardMaterial({ color: 0x2ec4c6, roughness: .35, metalness: .3, emissive: 0x2ec4c6, emissiveIntensity: .5 });
const bits = new THREE.InstancedMesh(bitGeo, bitMat, N); world.add(bits);
const bd = Array.from({ length: N }, () => ({ a: Math.random() * 6.28, r: 2.3 + Math.random() * 2.2, y: Math.random() * 4.2 - .3, v: .15 + Math.random() * .35, s: .5 + Math.random() * 1.6, ph: Math.random() * 6 }));
const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), E = new THREE.Euler();

/* ---------- layout ---------- */
let narrow = false;
function layout() {
  const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; narrow = w / h < 0.95;
  base.scale.setScalar(narrow ? .7 : 1); stage.scale.setScalar(narrow ? .95 : 1);
  if (narrow) { camera.position.set(0, 2.9, 10.4); camera.lookAt(0, 1.05, 0); camera.clearViewOffset(); }
  else { camera.position.set(0, 2.8, 10); camera.lookAt(0, 1.05, 0); camera.setViewOffset(w, h, -w * Math.min(.22, (w / h - .95) * .3), 0, w, h); }
  camera.updateProjectionMatrix();
}
layout(); addEventListener('resize', layout);
new ResizeObserver(layout).observe(host);

/* ---------- switching ---------- */
let cur = null, next = null, swap = 0, spinBoost = 0, peel = 0, peelT = 0;
const accent = new THREE.Color(0x2ec4c6), accentT = new THREE.Color(0x2ec4c6);
function applyProduct(id, p) {
  const P = products[id]; if (!P || !p) return;
  if (id === 'acup' && p.lid) P.lidMat.map = tex(p.lid, 'png'), P.lidMat.needsUpdate = true;
  if (id === 'acup') P.cream.material.color.set(p.cream || '#EAD8B8');
  if (id === 'abar' && p.tex) { P.front.map = tex(p.tex); P.front.needsUpdate = true; P.back.color.set(p.color); }
}
window.ABScene = {
  show(id, p, color) {
    if (color) accentT.set(color);
    if (!cur) { cur = id; products[id].g.visible = true; applyProduct(id, p); return; }
    if (swap > 0 && swap < .5) { next = { id, p }; return; }            // still shrinking: just retarget
    if (id === cur) { next = null; applyProduct(id, p); spinBoost = 1; return; }
    next = { id, p }; swap = reduce ? 1 : .0001;
    if (reduce) { products[cur].g.visible = false; cur = id; products[id].g.visible = true; applyProduct(id, p); next = null; swap = 0; }
  },
  peel(v) { peelT = Math.max(0, Math.min(1, v)); },
  _state() { const P = products[cur]; /* debug helper used by tests */ return { cur, swap, next: next && next.id, scale: +P.g.scale.x.toFixed(3), rot: [P.g.rotation.x, P.g.rotation.y].map(v => +v.toFixed(2)), y: +P.g.position.y.toFixed(2), lid: P.lidPivot ? +P.lidPivot.rotation.z.toFixed(2) : null }; },
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
  // swap: shrink+spin out, swap, grow+spin in
  let k = 1, extraSpin = 0;
  if (swap > 0) {
    swap += dt / .75;
    if (swap < .5) { k = 1 - ease(swap * 2); extraSpin = ease(swap * 2) * Math.PI; }
    else {
      if (next) { products[cur].g.visible = false; cur = next.id; products[cur].g.visible = true; applyProduct(cur, next.p); next = null; }
      k = ease((swap - .5) * 2); extraSpin = -(1 - ease((swap - .5) * 2)) * Math.PI;
    }
    if (swap >= 1) swap = 0;
  }
  if (spinBoost > 0) { extraSpin += Math.sin(spinBoost * Math.PI) * .9; spinBoost = Math.max(0, spinBoost - dt * 1.4); }
  // sway around the front; after a drag, ease back to the nearest front-facing turn
  if (!dragging) { spin += vel; vel *= .93; if (Math.abs(vel) < .002) { const home = Math.round(spin / (Math.PI * 2)) * Math.PI * 2; spin += (home - spin) * .03; } }
  const P = products[cur];
  if (P) {
    P.g.scale.setScalar(P.scale * (.6 + .4 * intro) * Math.max(.001, k));
    P.g.position.y = P.y + (1 - intro) * -1.5 + (reduce ? 0 : Math.sin(t * 1.3) * .05);
    P.g.rotation.set(P.lean || 0, spin + extraSpin + (reduce ? 0 : Math.sin(t * .55) * .55), 0, P.lean ? 'YXZ' : 'XYZ');
    if (P.lean) P.g.rotation.set(P.lean, spin + extraSpin + (reduce ? 0 : Math.sin(t * .55) * .4), 0, 'YXZ');
    stage.rotation.x = P.tilt * .35;
    if (cur === 'abar') P.g.rotation.x = .25 + Math.sin(t * .8) * .05;
    if (cur === 'acup') {
      peel += (peelT - peel) * .12;
      P.lidPivot.rotation.z = -ease(Math.min(1, peel * 1.3)) * 2.2;
      P.lidPivot.position.y = .92 + .085 + ease(peel) * .1;
      P.spoon.visible = peel > .55;
      P.spoon.position.y = .92 + .02 + (1 - Math.min(1, (peel - .55) * 3)) * 1.2;
    }
  }
  accent.lerp(accentT, .06); ringMat.color.copy(accent); glowMat.color.copy(accent); rimA.color.copy(accent); bitMat.emissive.copy(accent); bitMat.color.copy(accent);
  tx += (px - tx) * .05; ty += (py - ty) * .05;
  world.rotation.y = tx * .16; world.rotation.x = ty * .05;
  for (let i = 0; i < N; i++) {
    const d = bd[i], a = d.a + t * d.v * .25, y = ((d.y + t * d.v * .3) % 4.6) - .3;
    V.set(Math.cos(a) * d.r, y, Math.sin(a) * d.r - .5); Q.setFromEuler(E.set(t * d.v + d.ph, d.ph, t * .2)); S.setScalar(d.s * .7 * intro);
    bits.setMatrixAt(i, M.compose(V, Q, S));
  }
  bits.instanceMatrix.needsUpdate = true;
  renderer.render(scene, camera);
  raf = requestAnimationFrame(tick);
}
document.documentElement.classList.add('has3d');
raf = requestAnimationFrame(tick);
