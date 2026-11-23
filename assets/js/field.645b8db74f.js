/* Particle field: one THREE.Points cloud that morphs between project shapes.
   Home: shapes follow the sections marked [data-shape] as you scroll. Case pages: one shape in the header.
   Every shape is built from the project's own facts (7% bad rows, 9.0% readmitted, the real 32-pizza revenue Pareto,
   the 8-stop redirect path). Reduced motion: still frames, instant swaps. WebGL failure: html.no-gl, CSS fallback stays. */
import * as THREE from 'three';

const TAU = Math.PI * 2;
THREE.ColorManagement.enabled = false;   /* CSS hex values pass straight through: the canvas matches the page tokens */
const rng = seed => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/* codes per particle: 0 ink, 1 accent, 2 static ink, 3 accent signal (moves inside its shape) */
const SCALE = { nr: 1.12, pages: 1.4, streams: .82, hub: .95, braid: .9, roc: 1.05, pareto: 1.05, print: 1.6, room: 1.0, ring: 1.0, sphere: 1.25 };
const SHAPE_IDS = { nr: 0, pages: 1, streams: 2, hub: 3, braid: 4, roc: 5, pareto: 6, print: 7, room: 8, ring: 9, sphere: 10 };

/* real data: sql-analytics results/10_menu_pareto.csv, revenue by rank; cut candidates are ranks 25-30 and 32 */
const PARETO = [43434.25, 42768, 41409.5, 38180.5, 34831.25, 34705.75, 33476.75, 32273.25, 32265.7, 30940.5, 30161.75, 28454.1, 26780.75, 26066.5, 25529, 25094, 24374.75, 24193.25, 24087, 23271.25, 22968, 18834.5, 16900.25, 16701.75, 16425.75, 16019.25, 15934.25, 15596, 15360.5, 15277.75, 13955.75, 11588.5];
const CUT = new Set([24, 25, 26, 27, 28, 29, 31]);

function sampleText(text, weight) {
  const W = 560, H = 280, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); g.fillStyle = '#000'; g.font = `${weight} 250px Outfit, "Segoe UI", Arial, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, H / 2 + 10);
  const d = g.getImageData(0, 0, W, H).data, on = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 128) on.push([x / W - .5, .5 - y / H]);
  return on.length ? on : [[0, 0]];
}

function build(name, N, seed) {
  const r = rng(seed), P = new Float32Array(N * 3), C = new Float32Array(N);
  const set = (i, x, y, z, c = 0) => { P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = z; C[i] = c; };
  if (name === 'nr') {
    const on = sampleText('NR', 800);
    for (let i = 0; i < N; i++) { const s = on[(r() * on.length) | 0]; set(i, s[0] * 22 + (r() - .5) * .06, s[1] * 11, (r() - .5) * 2.6, r() < .015 ? 1 : 0); }
  } else if (name === 'pages') {
    /* truthlens: 6 fanned pages of text lines; one sentence on the front page is the unsupported one (accent) */
    for (let i = 0; i < N; i++) {
      const k = i % 6, u = r(), v = r(), line = Math.floor(v * 14), front = k === 5;
      const onLine = r() < .86, yy = onLine ? 4.6 - line * .68 + (r() - .5) * .08 : (v - .5) * 10.4;
      const xx = onLine ? (u - .5) * (line % 4 === 3 ? 4.2 : 6.4) - (line % 4 === 3 ? 1.1 : 0) : (r() < .5 ? -3.4 : 3.4) + (r() - .5) * .05;
      const ang = (k - 2.5) * .16, x0 = xx * Math.cos(ang), z0 = xx * Math.sin(ang) - (5 - k) * .9;
      const bad = front && onLine && line === 6;
      set(i, x0 + (k - 2.5) * .5, yy - (k - 2.5) * .18, z0, bad ? 3 : 0);
    }
  } else if (name === 'streams') {
    /* haulpulse: three trip streams flow through a validation gate; 7% dirty rows (accent) drop into quarantine */
    for (let i = 0; i < N; i++) {
      if (i % 11 === 0) { const a = r() * TAU; set(i, 1 + (r() - .5) * .15, Math.sin(a) * 5.6, Math.cos(a) * 2.2, 2); continue; }
      const st = i % 3, bad = r() < .07;
      set(i, r() * 26 - 13, (st - 1) * 3 + (r() - .5) * .7, (r() - .5) * 1.4 + (st - 1) * .6, bad ? 1 : 0);
    }
  } else if (name === 'hub') {
    /* url-shortener: client, rate limiter, controller, service, Redis hub, PostgreSQL, Kafka, consumer; pulses run the path */
    const nodes = [[-11, 2.5, 0], [-7, -1.5, 1.5], [-3, 3, -1], [0, -.5, 0], [3.8, 3.6, 1], [4.4, -4, -1.2], [8.8, .8, 1.6], [11, -3.4, -.6]];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5], [2, 6], [6, 7], [7, 5], [1, 4]];
    for (let i = 0; i < N; i++) {
      const q = r();
      if (q < .5) { const n = nodes[i % 8], s = new THREE.Vector3().randomDirection().multiplyScalar((i % 8 === 4 ? 1.5 : 1) * Math.cbrt(r()) * 1.1); set(i, n[0] + s.x, n[1] + s.y, n[2] + s.z, 0); }
      else if (q < .93) { const e = edges[i % edges.length], a = nodes[e[0]], b = nodes[e[1]], f = r(); set(i, a[0] + (b[0] - a[0]) * f + (r() - .5) * .12, a[1] + (b[1] - a[1]) * f + (r() - .5) * .12, a[2] + (b[2] - a[2]) * f, 2); }
      else { const e = i % edges.length; set(i, e, r(), 0, 3); } /* pulse: x = edge index, y = phase, decoded in the shader */
    }
  } else if (name === 'braid') {
    /* code-collaborator: two edit histories braided into one document; two cursor heads ride the strands */
    for (let i = 0; i < N; i++) {
      const strand = i % 2, ph = strand * Math.PI, rr = 2.5 + (r() - .5) * .55;
      if (r() < .03) { set(i, r() * 26 - 13, ph, rr, 3); continue; }
      const u = r() * 2 - 1; set(i, u * 13, Math.sin(u * 9 + ph) * rr, Math.cos(u * 9 + ph) * rr, strand ? 2 : 0);
    }
  } else if (name === 'roc') {
    /* readmission: 10,499 held-out patients as a field of dots, 9.0% readmitted (accent), under a lifted ROC curve */
    for (let i = 0; i < N; i++) {
      if (r() < .16) { const f = r(), x = f, y = 1 - Math.pow(1 - f, 2.1); set(i, -9 + x * 18, -5 + y * 11 + (r() - .5) * .08, 2.5 + (r() - .5) * .3, 2); continue; }
      const gx = r(), gz = r(); set(i, -10 + gx * 20, -5.2 + (r() - .5) * .12, -4 + gz * 6, r() < .09 ? 1 : 0);
    }
  } else if (name === 'pareto') {
    /* sql-analytics: the real revenue Pareto of 32 pizzas; 7 cut candidates in accent; cumulative line above */
    const max = PARETO[0], total = PARETO.reduce((a, b) => a + b, 0);
    for (let i = 0; i < N; i++) {
      if (r() < .14) { const f = r() * 32, k = Math.min(31, Math.floor(f)); let cum = 0; for (let j = 0; j <= k; j++) cum += PARETO[j];
        set(i, -12 + f * .75, -6 + (cum / total) * 12.5, 0, 2); continue; }
      const k = (r() * 32) | 0, h = PARETO[k] / max * 10.5;
      set(i, -12 + k * .75 + r() * .5, -6 + r() * h, (r() - .5) * .8, CUT.has(k) ? 1 : 0);
    }
  } else if (name === 'print') {
    /* blood-group: fingerprint ridges; a scan line (accent) sweeps it */
    for (let i = 0; i < N; i++) {
      if (r() < .05) { set(i, (r() - .5) * 11, 0, (r() - .5) * .4, 3); continue; }
      const ridge = (r() * 22) | 0, a = r() * TAU, rad = .35 + ridge * .27, warp = 1 + .12 * Math.sin(a * 2 + ridge * .4);
      const x = Math.cos(a) * rad * warp * .82, y = Math.sin(a) * rad * 1.08 + (a > Math.PI ? -ridge * .05 : 0);
      set(i, x, y, (r() - .5) * .5 - Math.hypot(x, y) * .12, 0);
    }
  } else if (name === 'room') {
    /* leftover item detection: a classroom of desks; one item left behind (accent) inside a detection box (accent signal) */
    for (let i = 0; i < N; i++) {
      const q = r();
      if (q < .06) { const s = (r() < .5 ? -1 : 1), side = r(); const L = 1.3; const t = (r() - .5) * 2 * L;
        const [bx, bz] = side < .5 ? [t, s * L] : [s * L, t]; set(i, 3 + bx, -1 + (r() - .5) * 1.6, 1.5 + bz, 3); continue; }
      if (q < .1) { const s = new THREE.Vector3().randomDirection().multiplyScalar(.45 * Math.cbrt(r())); set(i, 3 + s.x, -1.3 + s.y * .6, 1.5 + s.z, 1); continue; }
      const dx = i % 5, dz = (i / 5 | 0) % 4, cx = -8 + dx * 4, cz = -5 + dz * 3.3;
      const e = r(), w = 2.8, d = 1.5, per = r();
      const [ox, oz] = per < .5 ? [(e - .5) * w, (per < .25 ? -1 : 1) * d / 2] : [(per < .75 ? -1 : 1) * w / 2, (e - .5) * d];
      set(i, cx + ox, -1.6 + (r() - .5) * .06, cz + oz, 0);
    }
  } else if (name === 'ring') {
    for (let i = 0; i < N; i++) { const a = r() * TAU, b = r() * TAU, R = 10 + Math.cos(b) * 1.1; const zz = Math.sin(a) * R * .9; set(i, Math.cos(a) * R * 1.25, Math.sin(b) * 1.1 + (r() - .5) * .3 - zz * .32 - 2.5, zz - 4, r() < .04 ? 1 : 0); }
  } else {
    for (let i = 0; i < N; i++) { const yy = 1 - (i / (N - 1)) * 2, r0 = Math.sqrt(1 - yy * yy), th = i * 2.39996, R = 6.4 + (r() - .5) * .5; set(i, Math.cos(th) * r0 * R, yy * R, Math.sin(th) * r0 * R, r() < .04 ? 1 : 0); }
  }
  return { P, C, id: SHAPE_IDS[name] ?? 10 };
}

const vertex = /* glsl */`
attribute vec3 pA; attribute vec3 pB; attribute float cA; attribute float cB; attribute float aR;
uniform float uMix, uT, uIdA, uIdB, uPix, uScatter, uSize, uGlow;
uniform vec4 uXfA, uXfB; /* x, y offset, y rotation, scale */
uniform vec3 uMouse; uniform float uSway;
varying float vAcc; varying float vFade; varying float vSig;
vec3 hubNode(float k){ if(k<.5) return vec3(-11.,2.5,0.); if(k<1.5) return vec3(-7.,-1.5,1.5); if(k<2.5) return vec3(-3.,3.,-1.); if(k<3.5) return vec3(0.,-.5,0.);
  if(k<4.5) return vec3(3.8,3.6,1.); if(k<5.5) return vec3(4.4,-4.,-1.2); if(k<6.5) return vec3(8.8,.8,1.6); return vec3(11.,-3.4,-.6); }
vec3 anim(vec3 p, float id, float c, float r, float t){
  if(id < .5){ p.z += sin(t*.6 + p.x*.25)*.25; }
  else if(id < 1.5){ if(c > 2.5){ float f = .5+.5*sin(t*.7); p.x += f*5.5; p.z += f*2.2; p.y += sin(t*.7+r*6.)*.08; } p.x += sin(t*.35 + p.z)*.08; }
  else if(id < 2.5){ if(c < 1.5){ float st = floor((p.y+4.5)/3.); p.x = mod(p.x + 13. + t*(1.3+.6*r), 26.) - 13.; p.y += sin(p.x*.45 + st*2.)*.9;
      if(c > .5 && p.x > 1.){ float d = p.x - 1.; p.y -= min(d*d*.16, 6.5 + r*1.2); p.z += d*.15; } } }
  else if(id < 3.5){ if(c > 2.5){ float e = p.x; vec3 a, b;
      if(e<.5){a=hubNode(0.);b=hubNode(1.);} else if(e<1.5){a=hubNode(1.);b=hubNode(2.);} else if(e<2.5){a=hubNode(2.);b=hubNode(3.);} else if(e<3.5){a=hubNode(3.);b=hubNode(4.);}
      else if(e<4.5){a=hubNode(3.);b=hubNode(5.);} else if(e<5.5){a=hubNode(2.);b=hubNode(6.);} else if(e<6.5){a=hubNode(6.);b=hubNode(7.);} else if(e<7.5){a=hubNode(7.);b=hubNode(5.);} else {a=hubNode(1.);b=hubNode(4.);}
      float f = fract(t*.32 + p.y + e*.11); p = mix(a, b, f); } }
  else if(id < 4.5){ if(c > 2.5){ float x = mod(p.x + 13. + t*2.2*(p.y > 1. ? -1. : 1.), 26.) - 13.; float u = x/13.; p = vec3(x, sin(u*9.+p.y)*p.z, cos(u*9.+p.y)*p.z); }
    float a = t*.35; p = vec3(p.x, p.y*cos(a) - p.z*sin(a), p.y*sin(a) + p.z*cos(a)); }
  else if(id < 5.5){ if(c < 1.5) p.y += sin(p.x*.5 + p.z*.6 + t*.9)*.18; }
  else if(id < 6.5){ p.z += sin(p.x*.4 + t*.6)*.12; }
  else if(id < 7.5){ if(c > 2.5){ p.y = mod(t*2.2 + r*.6, 13.) - 6.5; p.x *= .9 + .1*sin(t); } else { float l = length(p.xy); p.xy *= 1. + sin(l*1.6 - t*1.2)*.012; } }
  else if(id < 8.5){ if(c > 2.5){ vec3 o = vec3(3.,-1.,1.5); p = o + (p - o)*(1. + .07*sin(t*3.)); } }
  else if(id < 9.5){ float a = t*.12; p = vec3(p.x*cos(a) - (p.z+4.)*sin(a), p.y, p.x*sin(a) + (p.z+4.)*cos(a) - 4.); }
  else { float a = t*.1; p = vec3(p.x*cos(a) - p.z*sin(a), p.y, p.x*sin(a) + p.z*cos(a)); }
  return p;
}
vec3 xf(vec3 p, vec4 x){ float c = cos(x.z + uSway), s = sin(x.z + uSway); p = vec3(p.x*c + p.z*s, p.y, -p.x*s + p.z*c) * x.w; return p + vec3(x.x, x.y, 0.); }
void main(){
  float m = smoothstep(0., 1., uMix);
  vec3 a = xf(anim(pA, uIdA, cA, aR, uT), uXfA), b = xf(anim(pB, uIdB, cB, aR, uT), uXfB);
  vec3 p = mix(a, b, m);
  float mid = 1. - abs(2.*uMix - 1.);
  p += vec3(sin(aR*61. + uT*.8), cos(aR*37. + uT*.7), sin(aR*23. - uT*.6)) * (.04 + mid*uScatter*(.4 + aR));
  vec3 d = p - uMouse; float dist = length(d.xy); p.xy += normalize(d.xy + 1e-4) * max(0., 2.8 - dist) * .9;
  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
  float accA = step(.5, cA) * (1. - step(1.5, cA) * step(cA, 2.5)), accB = step(.5, cB) * (1. - step(1.5, cB) * step(cB, 2.5));
  vAcc = mix(accA, accB, m); vSig = mix(step(2.5, cA), step(2.5, cB), m);
  gl_PointSize = uPix * uSize * (1.7 + aR*1.7) * (1. + vSig*.9 + vAcc*.5) * mix(1.18, .78, uGlow) * 26. / -mv.z;
  vFade = smoothstep(36., 24., -mv.z);
}`;
const fragment = /* glsl */`
uniform vec3 uInk; uniform vec3 uAcc; uniform vec3 uDeep; uniform float uGlow;
varying float vAcc; varying float vFade; varying float vSig;
void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard;
  vec3 ink = mix(uDeep, uInk, vFade);                 /* depth: far points fade toward a cooler mid tone */
  vec3 col = mix(ink, uAcc, vAcc);
  float core = 1. - smoothstep(.2, .34, d);
  float halo = exp(-d*d*22.) * vAcc;                  /* accent points carry a soft halo in light theme */
  float glow = exp(-d*d*16.);
  float a = mix(max(core * (.86 + .14*vFade), halo * .6), glow * (.2 + .14*vFade + vSig*.45 + vAcc*.3), uGlow);
  gl_FragColor = vec4(col, a); }`;

const POST = {
  uniforms: { tDiffuse: { value: null }, uAmt: { value: .0012 }, uGrain: { value: .03 }, uT: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uAmt; uniform float uGrain; uniform float uT; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uT) * 43758.5453); }
    void main(){ vec2 o = (vUv - .5) * uAmt; vec4 c = texture2D(tDiffuse, vUv);
      c.r = texture2D(tDiffuse, vUv + o).r; c.b = texture2D(tDiffuse, vUv - o).b;
      c.rgb += (h(vUv * 900.) - .5) * uGrain; gl_FragColor = c; }`,
};

function cssColor(name, fallback) { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return new THREE.Color(v || fallback); }
const isDark = () => getComputedStyle(document.documentElement).getPropertyValue('--scheme').trim() === 'dark';

export async function createField({ canvas, mode = 'scroll', shape = 'nr', side = 'right', host = null }) {
  const NR = window.NR || (window.NR = { paused: false, mx: 0, my: 0, push: 0, reduced: () => false });
  const coarse = matchMedia('(pointer: coarse)').matches, narrow = () => innerWidth < 768;
  const mobile = coarse || narrow();
  const N = mode === 'scroll' ? (mobile ? 12000 : 36000) : (mobile ? 9000 : 22000);
  const opaque = mode === 'scroll';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: !opaque, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1 : 1.5)); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  const size = () => host ? [host.clientWidth, host.clientHeight] : [innerWidth, innerHeight];
  renderer.setSize(...size(), false);
  /* an opaque canvas whose GPU context is lost paints black behind ink text: hide it and fall back to the page background */
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); if (opaque) document.documentElement.classList.add('no-gl'); else canvas.style.visibility = 'hidden'; });
  canvas.addEventListener('webglcontextrestored', () => { document.documentElement.classList.remove('no-gl'); canvas.style.visibility = ''; dirty = true; kick(); });
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, size()[0] / size()[1], .1, 400);
  try { await Promise.race([document.fonts.load('800 200px Outfit'), new Promise(r => setTimeout(r, 1500))]); } catch (e) {}

  /* the shape sequence */
  const sections = mode === 'scroll' ? [...document.querySelectorAll('[data-shape]')] : [];
  const seq = mode === 'scroll' ? sections.map(s => ({ name: s.dataset.shape, side: s.dataset.side || 'right' })) : [{ name: shape, side }];
  const cache = {}; const get = n => cache[n] || (cache[n] = build(n, N, 7 + Object.keys(SHAPE_IDS).indexOf(n)));
  const aR = new Float32Array(N); { const r = rng(3); for (let i = 0; i < N; i++) aR[i] = r(); }
  const geo = new THREE.BufferGeometry();
  const first = get(seq[0].name), second = get((seq[1] || seq[0]).name);
  const pA = new THREE.BufferAttribute(first.P.slice(), 3), pB = new THREE.BufferAttribute(second.P.slice(), 3);
  const cA = new THREE.BufferAttribute(first.C.slice(), 1), cB = new THREE.BufferAttribute(second.C.slice(), 1);
  [pA, pB, cA, cB].forEach(a => a.setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute('pA', pA); geo.setAttribute('pB', pB); geo.setAttribute('cA', cA); geo.setAttribute('cB', cB); geo.setAttribute('aR', new THREE.BufferAttribute(aR, 1));
  const U = { uMix: { value: 0 }, uT: { value: 0 }, uIdA: { value: first.id }, uIdB: { value: second.id }, uPix: { value: renderer.getPixelRatio() },
    uScatter: { value: 4.5 }, uSize: { value: mode === 'scroll' ? 1.55 : 1.6 }, uXfA: { value: new THREE.Vector4() }, uXfB: { value: new THREE.Vector4() },
    uSway: { value: 0 }, uMouse: { value: new THREE.Vector3(99, 99, 0) }, uDeep: { value: new THREE.Color() }, uInk: { value: new THREE.Color() }, uAcc: { value: new THREE.Color() }, uGlow: { value: 0 } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);

  /* placement per station: shapes sit beside the caption, alternate sides, turn a little per station */
  const xform = (st, i, out) => {
    const w = size()[0], h = size()[1], halfW = Math.tan(25 * Math.PI / 180) * camera.position.z * (w / h);
    const k = SCALE[st.name] || 1;
    if (narrow() || mode !== 'scroll' && w < 760) { out.set(0, mode === 'scroll' ? 3.6 : 5.6, (i % 2 ? -.3 : .3), (mode === 'scroll' ? .56 : .5) * k); return out; }
    const off = Math.min(halfW * .54, 15) * (st.side === 'left' ? -1 : 1);
    out.set(mode === 'scroll' ? off : halfW * .56, mode === 'scroll' ? 0 : .6, (i % 2 ? -.35 : .35), (mode === 'scroll' ? 1 : .86) * k);
    if (st.name === 'ring' || st.name === 'sphere' && mode === 'scroll' && st.side === 'center') out.x = 0;
    return out;
  };
  let curK = -1;
  const load = k => {
    if (k === curK) return; curK = k;
    const A = get(seq[k].name), B = get((seq[k + 1] || seq[k]).name);
    pA.array.set(A.P); pB.array.set(B.P); cA.array.set(A.C); cB.array.set(B.C);
    pA.needsUpdate = pB.needsUpdate = cA.needsUpdate = cB.needsUpdate = true;
    U.uIdA.value = A.id; U.uIdB.value = B.id;
  };
  load(0);

  /* theme colours from CSS tokens */
  let composer = null, bloom = null, post = null, trail = null;
  const theme = () => {
    const dark = isDark();
    U.uInk.value.copy(cssColor('--p-ink', dark ? '#DCE0E7' : '#1A1D24')); U.uDeep.value.copy(cssColor('--p-deep', dark ? '#5B6474' : '#5E6574')); U.uAcc.value.copy(cssColor('--p-acc', dark ? '#EE8A70' : '#C4472B'));
    U.uGlow.value = dark ? 1 : 0; mat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending; mat.needsUpdate = true;
    if (opaque) renderer.setClearColor(cssColor('--bg', dark ? '#121418' : '#EEF0F3'), 1); else renderer.setClearColor(0x000000, 0);
    if (bloom) bloom.enabled = dark; if (post) post.uniforms.uGrain.value = dark ? .028 : .02;
    dirty = true;
  };
  let dirty = true; theme();
  new MutationObserver(theme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', theme);

  /* desktop post: bloom (dark theme only, A's glow) + subtle chromatic aberration and grain (C) */
  if (opaque && !mobile && !NR.reduced()) {
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { ShaderPass }, { OutputPass }, { AfterimagePass }] = await Promise.all([
        import('three/addons/postprocessing/EffectComposer.js'), import('three/addons/postprocessing/RenderPass.js'),
        import('three/addons/postprocessing/UnrealBloomPass.js'), import('three/addons/postprocessing/ShaderPass.js'), import('three/addons/postprocessing/OutputPass.js'), import('three/addons/postprocessing/AfterimagePass.js')]);
      composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
      trail = new AfterimagePass(0); composer.addPass(trail);
      bloom = new UnrealBloomPass(new THREE.Vector2(...size()), .55, .45, .35); composer.addPass(bloom);
      post = new ShaderPass(POST); composer.addPass(post);
      theme();
    } catch (e) { composer = null; }
  }

  /* scroll anchors */
  let anchors = [];
  const refresh = () => { anchors = sections.map(s => { const b = s.getBoundingClientRect(); return b.top + scrollY + Math.min(b.height, innerHeight) * .5; }); dirty = true; };
  refresh(); addEventListener('load', refresh);
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3(), v2 = new THREE.Vector2();
  let t = 0, last = performance.now(), mx = 0, my = 0, lastY = scrollY, vel = 0, mixS = 0, raf = 0, visible = true, lastSig = '';
  const xa = new THREE.Vector4(), xb = new THREE.Vector4();
  const frame = now => {
    raf = 0;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const reduced = NR.reduced(), animOn = !NR.paused && !reduced;
    if (animOn) t += dt;
    let k = 0, mix = 0;
    if (mode === 'scroll' && anchors.length > 1) {
      const yc = scrollY + innerHeight * .5;
      if (yc <= anchors[0]) { k = 0; mix = 0; }
      else if (yc >= anchors[anchors.length - 1]) { k = anchors.length - 2; mix = 1; }
      else { while (k < anchors.length - 2 && yc > anchors[k + 1]) k++; const f = (yc - anchors[k]) / (anchors[k + 1] - anchors[k]); mix = Math.min(1, Math.max(0, (f - .22) / .56)); }
      if (reduced) mix = mix < .5 ? 0 : 1;
    }
    load(k);
    mixS += (mix - mixS) * (reduced ? 1 : Math.min(1, dt * 6)); if (Math.abs(mix - mixS) < 1e-4) mixS = mix;
    const speed = Math.abs(mix - mixS);
    if (trail) trail.uniforms.damp.value = reduced ? 0 : Math.min(.86, speed * 9);
    U.uMix.value = mixS; U.uScatter.value = reduced ? 0 : 4.5; U.uSway.value = Math.sin(t * .22) * .2;
    U.uXfA.value.copy(xform(seq[k], k, xa)); U.uXfB.value.copy(xform(seq[k + 1] || seq[k], k + 1, xb));
    const tm = reduced ? 0 : 1; mx += ((NR.mx || 0) * tm - mx) * .06; my += ((NR.my || 0) * tm - my) * .06;
    const z = narrow() ? 31 : 28;
    camera.position.set(mx * 4.2, my * 2.4, z); camera.lookAt(0, 0, 0);
    const fov = 50 - 18 * (NR.push || 0); if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    U.uT.value = t;
    v2.set(mx * 2, my * 2); ray.setFromCamera(v2, camera);
    if (!reduced && (NR.mx || NR.my) && ray.ray.intersectPlane(plane, hit)) U.uMouse.value.copy(hit); else U.uMouse.value.set(99, 99, 0);
    const dy = scrollY - lastY; lastY = scrollY; vel += (Math.abs(dy) / Math.max(dt, .001) - vel) * .15;
    if (post) { post.uniforms.uAmt.value = .0008 + Math.min(vel / 5000, 1) * .0045; post.uniforms.uT.value = animOn ? t : 0; }
    const sig = `${k}|${mixS.toFixed(4)}|${mx.toFixed(3)}|${my.toFixed(3)}|${camera.fov.toFixed(2)}|${size()}`;
    if (animOn || dirty || sig !== lastSig) { composer ? composer.render(dt) : renderer.render(scene, camera); dirty = false; lastSig = sig; }
    if (!document.hidden && visible) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  addEventListener('resize', () => { const [w, h] = size(); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); composer?.setSize(w, h); bloom?.setSize?.(w, h); refresh(); kick(); });
  document.addEventListener('visibilitychange', kick);
  if (host) new IntersectionObserver(es => { visible = es[0].isIntersecting; kick(); }).observe(host);
  kick();
  document.documentElement.classList.add('gl-ready');
  return { refresh, kick, redraw: () => { dirty = true; kick(); } };
}
