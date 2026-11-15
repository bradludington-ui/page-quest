// Page Quest celebrations: short, drawn sports scenes that pop up when a child finishes something.
// Everything is vector art built here (no images to download), animated frame by frame, and it
// works offline. Window.Cheer.play(kind, {name, look, title, sub}) shows one; tap anywhere to close.
(function(){
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const W = 800, H = 500;
const el = (tag, at, parent) => { const e = document.createElementNS(NS, tag); if (at) for (const k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const easeO = k => 1 - Math.pow(1 - k, 3), easeI = k => k * k * k, easeIO = k => k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3) / 2;
const back = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const rnd = (a, b) => a + Math.random() * (b - a);
function shade(hex, f){ const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255, p = Math.abs(f); r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }

// ---------------------------------------------------------------- the look a child picks
const SKINS = ['#f8d5bb', '#ebb893', '#cf9469', '#a06a45', '#6e4630'];
const HAIRS = ['#2a1b12', '#5b3a1f', '#9c5f2a', '#e0b45e', '#121214'];
const KITS = {
  blue:   {kit:'#2459d8', trim:'#ffffff', shorts:'#14265f', socks:'#2459d8', name:'Blue'},
  red:    {kit:'#d6352b', trim:'#ffffff', shorts:'#ffffff', socks:'#d6352b', name:'Red'},
  green:  {kit:'#139a59', trim:'#ffe066', shorts:'#0d3d29', socks:'#139a59', name:'Green'},
  orange: {kit:'#f2851b', trim:'#1b1b2a', shorts:'#1b1b2a', socks:'#f2851b', name:'Orange'},
  purple: {kit:'#7546d6', trim:'#ffd43b', shorts:'#2e1a63', socks:'#7546d6', name:'Purple'},
  sky:    {kit:'#5cc2f2', trim:'#ffffff', shorts:'#ffffff', socks:'#5cc2f2', name:'Sky'},
};
const STYLES = ['short', 'spiky', 'curly', 'pony', 'long'];
function lookOf(o){ o = o || {}; const k = KITS[o.kit] || KITS.blue;
  return Object.assign({}, k, {skin: SKINS[o.skin|0] || SKINS[1], hair: HAIRS[o.hairC == null ? 0 : o.hairC] || HAIRS[0], style: STYLES.includes(o.style) ? o.style : 'short', num: String(o.num || 10)}); }

// ---------------------------------------------------------------- a kid, drawn as a jointed figure
// Angles are in degrees measured from straight down; 90 points the way the kid faces, 180 points up.
// Elbows bend forward (positive), knees bend back (negative).
const STAND = {x:0, y:0, tor:180, head:0, aF:15, eF:25, aB:-15, eB:25, lF:4, kF:-4, lB:-4, kB:-4, fF:0, fB:0, mouth:0, pony:0};
function Kid(layer, look, dir, s, keeper){
  this.dir = dir || 1; this.s = s || 1; this.look = look; this.keeper = !!keeper;
  const L = look, g = el('g', {}, layer); this.g = g;
  const line = (stroke, w, extra) => el('line', Object.assign({stroke, 'stroke-width': w * this.s, 'stroke-linecap':'round'}, extra || {}), g);
  const darkSkin = shade(L.skin, -.14), darkKit = shade(L.kit, -.2), glove = '#ffb703';
  this.shadow = el('ellipse', {fill:'rgba(0,0,0,.22)'}, g);
  // back arm and back leg are a shade darker, so the figure reads in depth
  this.aBu = line(darkSkin, 12); this.aBs = line(darkKit, 17.5); this.aBl = line(darkSkin, 11.5);
  this.aBh = el('circle', {fill: keeper ? shade(glove, -.15) : darkSkin}, g);
  this.lBt = line(darkSkin, 14); this.lBk = line(shade(L.socks, -.2), 14.5); this.lBsh = line(shade(L.shorts, -.18), 22, {'stroke-linecap':'butt'});
  this.lBf = el('path', {fill: '#1d1e2c', stroke:'#1d1e2c', 'stroke-width': 1.5, 'stroke-linejoin':'round'}, g);
  // torso: one drawing in its own frame (hip at the origin, up is -y, forward is +x), turned as a whole
  this.tg = el('g', {}, g);
  const T = (d, at) => el('path', Object.assign({d}, at), this.tg);
  T('M-15,4 C-16,-8 -17,-26 -15,-40 C-14,-48 -8,-52 0,-52 C10,-52 16,-48 17,-40 C18,-30 17,-12 15,4 Z', {fill: L.shorts});
  T('M-15,-2 C-17,-16 -18,-32 -15,-42 C-13,-50 -7,-53 1,-53 C11,-53 17,-49 18,-41 C20,-28 18,-12 16,-2 C6,1 -6,1 -15,-2 Z', {fill: L.kit});
  T('M-15,-2 C-17,-16 -18,-32 -15,-42 C-13,-50 -9,-52 -4,-53 C-8,-40 -9,-16 -6,0 Z', {fill:'rgba(0,0,0,.14)'});
  T('M12,-48 C16,-40 17,-24 15,-6', {fill:'none', stroke:'rgba(255,255,255,.22)', 'stroke-width':3, 'stroke-linecap':'round'});
  T('M-15,-2 C-6,1 6,1 16,-2', {fill:'none', stroke: L.trim, 'stroke-width':2.4, opacity:.85});
  T('M-4,-53 C0,-48 6,-48 9,-53', {fill:'none', stroke: L.trim, 'stroke-width':3, 'stroke-linecap':'round'});
  this.num = el('text', {x: 2, y: -24, fill: L.trim, 'font-family':'"Arial Black", Arial, sans-serif', 'font-weight':900, 'font-size': 17, 'text-anchor':'middle', 'dominant-baseline':'central', stroke: shade(L.kit, -.35), 'stroke-width':1.2, 'paint-order':'stroke'}, this.tg); this.num.textContent = L.num;
  // front leg
  this.lFt = line(L.skin, 14.5); this.lFk = line(L.socks, 15); this.lFband = line(L.trim, 15, {'stroke-linecap':'butt'});
  this.lFsh = line(L.shorts, 23, {'stroke-linecap':'butt'});
  this.lFf = el('path', {fill: '#262838', stroke:'#262838', 'stroke-width': 1.5, 'stroke-linejoin':'round'}, g); this.lFsole = el('path', {fill: '#ffd43b'}, g);
  this.neck = line(darkSkin, 12);
  this.head = el('g', {}, g); this.drawHead();
  // front arm on top
  this.aFu = line(L.skin, 12.5); this.aFs = line(L.kit, 18.5); this.aFl = line(L.skin, 12);
  this.aFh = el('circle', {fill: keeper ? glove : L.skin}, g);
  this.set(STAND);
}
Kid.prototype.drawHead = function(){
  const L = this.look, h = this.head, s = this.s, sk = L.skin, hc = L.hair; h.innerHTML = '';
  const inner = el('g', {transform: `scale(${s})`}, h);
  const Q = (d, at) => el('path', Object.assign({d}, at), inner);
  if (L.style === 'pony'){ this.pony = el('g', {}, inner); el('path', {d:'M-16,-14 C-36,-18 -46,2 -42,20 C-40,30 -31,33 -30,25 C-34,11 -29,-1 -15,-3 Z', fill: hc}, this.pony); el('path', {d:'M-36,0 C-38,8 -37,16 -34,22', stroke: shade(hc, .22), 'stroke-width':2, fill:'none', 'stroke-linecap':'round'}, this.pony); el('circle', {cx:-18, cy:-9, r:4.6, fill:L.kit}, inner); }
  if (L.style === 'long') Q('M-22,-10 C-31,10 -30,32 -17,42 C-8,47 3,42 5,30 L5,8 Z', {fill: hc});
  el('circle', {cx:0, cy:0, r:24, fill: sk}, inner);
  Q('M-24,2 A24,24 0 0 0 12,21 A28,28 0 0 1 -24,2 Z', {fill:'rgba(0,0,0,.07)'});
  el('ellipse', {cx:-5, cy:3, rx:5.5, ry:7, fill: shade(sk, -.08)}, inner);
  el('path', {d:'M-6,0 q3,3 0,7', stroke: shade(sk, -.28), 'stroke-width':1.6, fill:'none', 'stroke-linecap':'round'}, inner);
  const hairs = {
    short: 'M-25,5 C-28,-18 -10,-31 8,-27 C18,-25 26,-17 25,-8 C20,-14 14,-15 9,-12 C6,-17 0,-18 -4,-14 C-8,-17 -14,-14 -15,-8 C-18,-6 -20,0 -19,6 Z',
    spiky: 'M-25,5 L-28,-10 L-20,-14 L-22,-26 L-11,-22 L-6,-34 L3,-25 L12,-33 L15,-22 L27,-20 L23,-10 C18,-14 13,-14 9,-11 C5,-16 -1,-16 -4,-12 C-9,-14 -14,-12 -15,-6 L-19,6 Z',
    pony: 'M-25,6 C-28,-18 -10,-30 8,-27 C20,-25 27,-15 25,-6 C17,-15 6,-17 -4,-13 C-12,-10 -17,-2 -18,8 Z',
    long: 'M-25,12 C-29,-18 -10,-30 8,-27 C20,-25 27,-15 25,-5 C17,-14 6,-16 -4,-12 C-12,-9 -17,0 -17,14 Z',
  };
  if (L.style === 'curly'){ [[-20,-6,9],[-17,-17,9],[-8,-23,9],[3,-25,9],[13,-22,8],[20,-14,7],[-22,4,7]].forEach(c => el('circle', {cx:c[0], cy:c[1], r:c[2], fill:hc}, inner));
    [[-14,-14,3],[-2,-20,3],[10,-19,2.6]].forEach(c => el('circle', {cx:c[0], cy:c[1], r:c[2], fill: shade(hc, .18)}, inner)); }
  else { Q(hairs[L.style], {fill: hc}); Q('M-14,-20 C-6,-26 6,-26 14,-21', {stroke: shade(hc, .25), 'stroke-width':2.4, fill:'none', 'stroke-linecap':'round', opacity:.8}); }
  el('ellipse', {cx:8, cy:9, rx:4.6, ry:2.9, fill:'#ff6f6f', opacity:.32}, inner);
  Q('M7,-9 q5,-3.5 10,-.5', {stroke: shade(hc, -.1), 'stroke-width':2.4, fill:'none', 'stroke-linecap':'round'});
  el('ellipse', {cx:12.5, cy:-1, rx:3.2, ry:4.4, fill:'#1b1b29'}, inner);
  el('circle', {cx:13.7, cy:-2.7, r:1.35, fill:'#fff'}, inner);
  Q('M23,-2 q4.5,4.5 -.5,7', {stroke: shade(sk, -.25), 'stroke-width':2, fill:'none', 'stroke-linecap':'round'});
  this.mouthC = Q('M11,10 q5,5.5 11,-.5', {stroke:'#7b2a22', 'stroke-width':2.4, fill:'none', 'stroke-linecap':'round'});
  this.mouthO = Q('M10,8.5 q6,11 13.5,-1 q-6.5,2.2 -13.5,1 Z', {fill:'#7b2a22', stroke:'#7b2a22', 'stroke-width':1.2, 'stroke-linejoin':'round', opacity:0});
  this.tongue = el('ellipse', {cx:16.5, cy:13.2, rx:3.4, ry:1.9, fill:'#ef7b7b', opacity:0}, inner);
};
Kid.prototype.set = function(P){
  const d = this.dir, s = this.s, R = Math.PI / 180;
  const v = (a, len) => [d * Math.sin(a * R) * len * s, Math.cos(a * R) * len * s];
  const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const hip = [P.x, P.y];
  const sh = add(hip, v(P.tor, 44)), neck = add(hip, v(P.tor, 52));
  const ln = (e, a, b) => { e.setAttribute('x1', a[0]); e.setAttribute('y1', a[1]); e.setAttribute('x2', b[0]); e.setAttribute('y2', b[1]); };
  const part = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const arm = (aU, eL, u, sl, lo, hand) => { const el1 = add(sh, v(aU, 25)), wr = add(el1, v(aU + eL, 23)); ln(u, sh, el1); ln(sl, sh, part(sh, el1, .45)); ln(lo, el1, wr); hand.setAttribute('cx', wr[0]); hand.setAttribute('cy', wr[1]); hand.setAttribute('r', (this.keeper ? 9.5 : 7) * s); return wr; };
  this.handB = arm(P.aB, P.eB, this.aBu, this.aBs, this.aBl, this.aBh);
  this.handF = arm(P.aF, P.eF, this.aFu, this.aFs, this.aFl, this.aFh);
  const leg = (aT, kn, fx, t, k, sh2, foot, band, sole) => {
    const h0 = add(hip, v(P.tor, 2)), knee = add(h0, v(aT, 33)), ank = add(knee, v(aT + kn, 33));
    ln(t, h0, knee); ln(sh2, h0, part(h0, knee, .48)); ln(k, part(knee, ank, .26), ank);
    if (band) ln(band, part(knee, ank, .26), part(knee, ank, .36));
    const fa = aT + kn + 90 + (fx || 0), f = v(fa, 1), up = v(fa - 90, 1);
    const pt = (a, b) => [ank[0] + f[0] * a + up[0] * b, ank[1] + f[1] * a + up[1] * b].map(n => +n.toFixed(2));
    foot.setAttribute('d', `M${pt(-7, 3)} L${pt(-8, -5)} C${pt(-6, -9)} ${pt(2, -9)} ${pt(5, -6)} C${pt(10, -5)} ${pt(18, -4)} ${pt(20, 0)} C${pt(21, 3)} ${pt(19, 4)} ${pt(16, 4)} Z`);
    if (sole) sole.setAttribute('d', `M${pt(-7, 2.6)} L${pt(17, 2.6)} L${pt(17, 4.6)} L${pt(-7, 4.6)} Z`);
    return {knee, ank};
  };
  this.footB = leg(P.lB, P.kB, P.fB, this.lBt, this.lBk, this.lBsh, this.lBf, null, null);
  this.footF = leg(P.lF, P.kF, P.fF, this.lFt, this.lFk, this.lFsh, this.lFf, this.lFband, this.lFsole);
  this.tg.setAttribute('transform', `translate(${hip[0]} ${hip[1]}) rotate(${(180 - P.tor) * d}) scale(${d * s} ${s})`);
  this.num.setAttribute('transform', d < 0 ? 'translate(4 0) scale(-1 1)' : '');
  const hc = add(neck, v(P.tor + (P.head || 0) * .3, 20));
  ln(this.neck, sh, hc);
  this.head.setAttribute('transform', `translate(${hc[0]} ${hc[1]}) rotate(${(180 - P.tor) * d - (P.head || 0) * d}) scale(${d} 1)`);
  if (this.pony) this.pony.setAttribute('transform', `rotate(${(P.pony || 0)} -18 -9)`);
  const m = P.mouth || 0; this.mouthC.setAttribute('opacity', m > .5 ? 0 : 1); this.mouthO.setAttribute('opacity', m > .5 ? 1 : 0); this.tongue.setAttribute('opacity', m > .5 ? 1 : 0);
  const gy = P.ground == null ? P.y + 72 * s : P.ground, lift = clamp((gy - (P.y + 72 * s)) / 120, 0, 1);
  this.shadow.setAttribute('cx', P.x + d * 6 * s); this.shadow.setAttribute('cy', gy + 4 * s); this.shadow.setAttribute('rx', (32 - lift * 14) * s); this.shadow.setAttribute('ry', (7 - lift * 3) * s);
  this.shadow.setAttribute('opacity', 1 - lift * .5);
  this.hip = hip; this.headAt = hc;
};
const mixPose = (A, B, k) => { const o = {}; for (const key in A) o[key] = lerp(A[key], B[key] == null ? A[key] : B[key], k); for (const key in B) if (!(key in o)) o[key] = B[key]; return o; };
const pose = o => Object.assign({}, STAND, o);
function run(phase, extra){ const sn = Math.sin(phase), cs = Math.cos(phase);
  return pose(Object.assign({tor:166, lF: 38 * sn, kF: -18 - 52 * Math.max(0, -cs) - 10, lB: -38 * sn, kB: -18 - 52 * Math.max(0, cs) - 10, aF: -48 * sn, eF: 80, aB: 48 * sn, eB: 80, head:6}, extra || {})); }

// ---------------------------------------------------------------- shared scenery
function defs(svg){
  const d = el('defs', {}, svg);
  d.innerHTML = `
  <linearGradient id="chSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1b4a"/><stop offset=".55" stop-color="#28529e"/><stop offset="1" stop-color="#5d9be0"/></linearGradient>
  <linearGradient id="chGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fa34d"/><stop offset="1" stop-color="#1f7a35"/></linearGradient>
  <radialGradient id="chGlow"><stop offset="0" stop-color="#fffbe0" stop-opacity="1"/><stop offset=".25" stop-color="#fff3b0" stop-opacity=".55"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient>
  <radialGradient id="chBall" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e9ecf1"/><stop offset="1" stop-color="#b6bcc8"/></radialGradient>
  <radialGradient id="chBball" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#ffab5c"/><stop offset=".75" stop-color="#e8711d"/><stop offset="1" stop-color="#a84a0c"/></radialGradient>
  <linearGradient id="chGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".35" stop-color="#ffd23f"/><stop offset=".7" stop-color="#e09b0e"/><stop offset="1" stop-color="#a86a00"/></linearGradient>
  <linearGradient id="chText" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c2"/><stop offset=".5" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff9f1c"/></linearGradient>
  <linearGradient id="chWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9b26d"/><stop offset="1" stop-color="#c27a35"/></linearGradient>
  <linearGradient id="chArena" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1440"/><stop offset="1" stop-color="#3b2a7a"/></linearGradient>
  <clipPath id="chBallClip"><circle r="1"/></clipPath>
  <filter id="chSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>
  <filter id="chDrop" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#000" flood-opacity=".45"/></filter>`;
}
const CROWD = ['#ff5d5d', '#ffd23f', '#2459d8', '#ffffff', '#13a35c', '#ff8a3d', '#b07cff', '#5cc2f2', '#ff7eb6'];
function stadium(svg, o){
  o = o || {};
  el('rect', {x:0, y:0, width:W, height:H, fill:'url(#chSky)'}, svg);
  // a few stars
  for (let i = 0; i < 22; i++) el('circle', {cx: rnd(0, W), cy: rnd(4, 90), r: rnd(.6, 1.6), fill:'#fff', opacity: rnd(.3, .8)}, svg);
  // floodlight towers
  [[70, 30], [730, 30]].forEach(([x, y]) => { el('rect', {x: x - 3, y, width: 6, height: 160, fill:'#1a2240'}, svg);
    el('rect', {x: x - 34, y: y - 18, width: 68, height: 26, rx: 4, fill:'#202a4d'}, svg);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) el('circle', {cx: x - 24 + i * 16, cy: y - 10 + j * 11, r: 4.4, fill:'#fffbe0'}, svg);
    el('circle', {cx: x, cy: y - 6, r: 110, fill:'url(#chGlow)', opacity:.75}, svg); });
  // stands
  el('path', {d:'M0,120 L800,120 L800,300 L0,300 Z', fill:'#162045'}, svg);
  el('path', {d:'M0,112 L800,112 L800,126 L0,126 Z', fill:'#0c1430'}, svg);
  const crowd = el('g', {}, svg), heads = [];
  for (let row = 0; row < 6; row++){ const y = 140 + row * 25;
    el('rect', {x:0, y: y + 10, width: W, height: 4, fill: row % 2 ? '#1e2a58' : '#243266'}, svg);
    for (let x = 6 + (row % 2) * 9; x < W; x += 17 + Math.random() * 3){
      const c = CROWD[(Math.random() * CROWD.length) | 0], g = el('g', {}, crowd);
      el('path', {d:`M${x - 7},${y + 14} Q${x},${y - 1} ${x + 7},${y + 14} Z`, fill: c, opacity:.9}, g);
      el('circle', {cx: x, cy: y - 3, r: 5, fill: SKINS[(Math.random() * 5) | 0]}, g);
      const arm = Math.random() < .5; if (arm) el('line', {x1: x + 5, y1: y + 4, x2: x + 9, y2: y - 9, stroke: c, 'stroke-width': 3, 'stroke-linecap':'round', opacity:0}, g);
      heads.push({g, ph: Math.random() * 6.3, sp: rnd(9, 14), arm: arm ? g.lastChild : null}); } }
  // advertising boards
  const boards = ['PAGE QUEST', 'READ • PLAY • WIN', 'BRAIN POWER', 'PAGE QUEST', 'GO TEAM!'], bw = W / boards.length;
  boards.forEach((t, i) => { el('rect', {x: i * bw, y: 288, width: bw, height: 26, fill: i % 2 ? '#0f3d91' : '#e8312a'}, svg);
    const tx = el('text', {x: i * bw + bw / 2, y: 306, fill:'#fff', 'font-family':'Arial Black, Arial, sans-serif', 'font-size': 14, 'font-weight': 900, 'text-anchor':'middle', 'letter-spacing':1}, svg); tx.textContent = t; });
  // pitch with mowing stripes in perspective
  el('rect', {x:0, y:314, width:W, height:H - 314, fill:'url(#chGrass)'}, svg);
  for (let i = -6; i < 14; i += 2){ const x0 = i * 70, x1 = (i + 1) * 70, sk = 1.5;
    el('path', {d:`M${x0},314 L${x1},314 L${400 + (x1 - 400) * sk},${H} L${400 + (x0 - 400) * sk},${H} Z`, fill:'#ffffff', opacity:.06}, svg); }
  el('rect', {x:0, y:314, width:W, height:8, fill:'rgba(0,0,0,.18)'}, svg);
  return {heads};
}
function cheerCrowd(heads, t, on){ heads.forEach(h => { const j = on ? Math.max(0, Math.sin(t * h.sp + h.ph)) * 6 * on : 0; h.g.setAttribute('transform', `translate(0 ${-j})`); if (h.arm) h.arm.setAttribute('opacity', on ? 1 : 0); }); }

function SoccerBall(layer, r){
  const g = el('g', {}, layer), inner = el('g', {}, g);
  el('circle', {r, fill:'url(#chBall)', stroke:'#2b2d3a', 'stroke-width':1.2}, inner);
  const spin = el('g', {}, inner), pent = (cx, cy, rr, rot) => { let d = ''; for (let i = 0; i < 5; i++){ const a = (rot + i * 72) * Math.PI / 180; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(2) + ',' + (cy + Math.sin(a) * rr).toFixed(2); } return d + 'Z'; };
  const clip = el('clipPath', {id: 'chBC' + Math.random().toString(36).slice(2, 7)}, g); el('circle', {r: r - .6}, clip);
  spin.setAttribute('clip-path', `url(#${clip.id})`);
  el('path', {d: pent(0, 0, r * .36, -90), fill:'#22232f'}, spin);
  for (let i = 0; i < 5; i++){ const a = (-90 + i * 72) * Math.PI / 180, cx = Math.cos(a) * r * .95, cy = Math.sin(a) * r * .95;
    el('path', {d: pent(cx, cy, r * .34, -90 + i * 72 + 36), fill:'#22232f'}, spin);
    el('line', {x1: Math.cos(a) * r * .36, y1: Math.sin(a) * r * .36, x2: Math.cos(a) * r * .66, y2: Math.sin(a) * r * .66, stroke:'#22232f', 'stroke-width': 1.1}, spin); }
  el('ellipse', {cx: -r * .35, cy: -r * .42, rx: r * .32, ry: r * .2, fill:'#fff', opacity:.7, transform:`rotate(-30 ${-r * .35} ${-r * .42})`}, inner);
  this.g = g; this.spin = spin; this.r = r;
}
SoccerBall.prototype.at = function(x, y, rot, sc){ this.g.setAttribute('transform', `translate(${x} ${y}) scale(${sc || 1})`); this.spin.setAttribute('transform', `rotate(${rot || 0})`); };

function Confetti(layer, n, o){ o = o || {}; this.ps = []; const cols = o.cols || ['#ffd23f', '#ff5d5d', '#2459d8', '#13a35c', '#ffffff', '#b07cff', '#ff8a3d'];
  for (let i = 0; i < n; i++){ const e = el('rect', {width: rnd(6, 11), height: rnd(9, 16), rx: 1.5, fill: cols[i % cols.length], opacity: 0}, layer);
    this.ps.push({e, x: o.x == null ? rnd(60, W - 60) : o.x + rnd(-30, 30), y: o.y == null ? rnd(-80, -10) : o.y, vx: rnd(-1, 1) * (o.burst ? 7 : 1.6), vy: o.burst ? rnd(-13, -4) : rnd(1.5, 4), r: rnd(0, 360), vr: rnd(-12, 12), sw: rnd(0, 6.3)}); }
  this.t0 = null; }
Confetti.prototype.step = function(on){ if (!on) return; this.ps.forEach(p => { p.vy = Math.min(p.vy + .22, 4.5); p.x += p.vx + Math.sin(p.sw += .12) * 1.4; p.vx *= .985; p.y += p.vy; p.r += p.vr;
  p.e.setAttribute('opacity', p.y < H + 20 ? 1 : 0); p.e.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${p.r}) scale(1 ${Math.cos(p.sw * 1.7).toFixed(2)})`); }); };

function Firework(layer, x, y, col){ this.g = el('g', {}, layer); this.x = x; this.y = y; this.rays = [];
  for (let i = 0; i < 18; i++){ const a = i / 18 * Math.PI * 2; this.rays.push({a, e: el('circle', {r: 3.2, fill: i % 3 ? col : '#fff'}, this.g)}); }
  this.g.setAttribute('opacity', 0); }
Firework.prototype.at = function(k){ if (k <= 0 || k >= 1){ this.g.setAttribute('opacity', 0); return; } const r = easeO(k) * 70;
  this.g.setAttribute('opacity', 1 - easeI(k)); this.rays.forEach(p => { p.e.setAttribute('cx', this.x + Math.cos(p.a) * r); p.e.setAttribute('cy', this.y + Math.sin(p.a) * r + k * k * 30); p.e.setAttribute('r', 3.4 * (1 - k * .6)); }); };

function Banner(layer, text, y, size){ const g = el('g', {opacity: 0}, layer);
  const t = el('text', {x: 0, y: 0, 'text-anchor':'middle', 'dominant-baseline':'central', 'font-family':'"Arial Black", "Arial Rounded MT Bold", Arial, sans-serif', 'font-weight': 900, 'font-size': size || 92, fill:'url(#chText)', stroke:'#7a2e00', 'stroke-width': 7, 'paint-order':'stroke', 'stroke-linejoin':'round', 'letter-spacing': 2, filter:'url(#chDrop)'}, g);
  t.textContent = text; this.g = g; this.y = y; }
Banner.prototype.at = function(k, wob){ if (k <= 0){ this.g.setAttribute('opacity', 0); return; } const sc = k < 1 ? lerp(2.6, 1, back(k)) : 1 + Math.sin(wob || 0) * .03;
  this.g.setAttribute('opacity', clamp(k * 3, 0, 1)); this.g.setAttribute('transform', `translate(${W / 2} ${this.y}) scale(${sc}) rotate(${-4 + (k < 1 ? (1 - k) * 8 : 0)})`); };

// ---------------------------------------------------------------- scene: shot, keeper dives, back of the net
function sceneGoal(svg, look, name){
  const S = stadium(svg), fx = el('g', {}, svg);
  const top = Math.random() < .5; // top corner or low corner, keeper always goes the wrong way
  // the goal: front frame, back net seen through it, side net
  const gx0 = 470, gx1 = 650, gyT = 238, gyB = 398, dx = 30, dy = -20;
  const goal = el('g', {}, svg);
  el('ellipse', {cx: (gx0 + gx1) / 2 + 18, cy: gyB + 4, rx: 120, ry: 10, fill:'rgba(0,0,0,.18)'}, goal);
  const netG = el('g', {stroke:'#e8eef7', 'stroke-width':1.3, fill:'none', opacity:.85}, goal);
  const backPost = (x, y1, y2) => el('line', {x1: x, y1, x2: x, y2, stroke:'#cfd6e2', 'stroke-width': 5, 'stroke-linecap':'round'}, goal);
  backPost(gx0 + dx, gyT + dy, gyB + dy * .2); backPost(gx1 + dx, gyT + dy, gyB + dy * .2);
  el('line', {x1: gx0 + dx, y1: gyT + dy, x2: gx1 + dx, y2: gyT + dy, stroke:'#cfd6e2', 'stroke-width':5, 'stroke-linecap':'round'}, goal);
  el('line', {x1: gx0, y1: gyB, x2: gx0 + dx, y2: gyB + dy * .2, stroke:'#cfd6e2', 'stroke-width':3}, goal);
  el('line', {x1: gx1, y1: gyB, x2: gx1 + dx, y2: gyB + dy * .2, stroke:'#cfd6e2', 'stroke-width':3}, goal);
  const lines = [], NX = 15, NY = 11;
  for (let i = 0; i <= NX; i++) lines.push({e: el('polyline', {}, netG), v: true, k: i / NX});
  for (let j = 0; j <= NY; j++) lines.push({e: el('polyline', {}, netG), v: false, k: j / NY});
  // side and roof net, static
  for (let i = 0; i <= 6; i++){ const k = i / 6; el('line', {x1: gx1 + dx * k, y1: gyT + dy * k, x2: gx1 + dx * k, y2: gyB + dy * .2 * k, stroke:'#e8eef7', 'stroke-width':1, opacity:.55}, goal);
    el('line', {x1: lerp(gx0, gx1, k), y1: gyT, x2: lerp(gx0, gx1, k) + dx, y2: gyT + dy, stroke:'#e8eef7', 'stroke-width':1, opacity:.5}, goal); }
  const front = el('g', {}, svg);
  const BX = x => lerp(gx0 + dx, gx1 + dx, x), BY = y => lerp(gyT + dy, gyB + dy * .2, y);
  let bulge = null;
  const drawNet = t => { lines.forEach(L => { let pts = ''; for (let q = 0; q <= 18; q++){ const u = q / 18, xk = L.v ? L.k : u, yk = L.v ? u : L.k; let x = BX(xk), y = BY(yk);
      if (bulge){ const ax = x - bulge.x, ay = y - bulge.y, dd = Math.hypot(ax, ay) || 1, age = t - bulge.t, amp = 26 * Math.exp(-age * 2.4) * Math.cos(age * 13);
        const f = Math.exp(-(dd * dd) / 2600) * amp; x += ax / dd * f * .55 + 10 * Math.exp(-(dd * dd) / 2600) * Math.exp(-age * 2.4); y += ay / dd * f * .55; }
      pts += x.toFixed(1) + ',' + y.toFixed(1) + ' '; } L.e.setAttribute('points', pts); }); };
  // front posts drawn last so they sit in front of the net and keeper
  const posts = () => { el('path', {d:`M${gx0},${gyB + 2} L${gx0},${gyT} L${gx1},${gyT} L${gx1},${gyB + 2}`, fill:'none', stroke:'rgba(0,0,0,.25)', 'stroke-width':11, 'stroke-linejoin':'round', transform:'translate(3 3)'}, svg);
    el('path', {d:`M${gx0},${gyB + 2} L${gx0},${gyT} L${gx1},${gyT} L${gx1},${gyB + 2}`, fill:'none', stroke:'#ffffff', 'stroke-width':9, 'stroke-linejoin':'round'}, svg);
    el('path', {d:`M${gx0 - 2},${gyB} L${gx0 - 2},${gyT - 2} L${gx1 - 2},${gyT - 2}`, fill:'none', stroke:'#dfe5ee', 'stroke-width':3}, svg); };
  // pitch markings
  el('path', {d:`M365,${gyB + 2} L800,${gyB + 2}`, stroke:'#fff', 'stroke-width':3, opacity:.8}, front);
  el('path', {d:`M330,${gyB + 2} L250,486 L800,486`, stroke:'#fff', 'stroke-width':3.4, fill:'none', opacity:.75}, front);
  el('ellipse', {cx:240, cy:470, rx:5, ry:2.2, fill:'#fff', opacity:.8}, front);
  // keeper
  const kLook = {kit:'#1d1d2b', trim:'#c6ff3d', shorts:'#1d1d2b', socks:'#1d1d2b', skin: SKINS[(Math.random() * 5) | 0], hair: HAIRS[(Math.random() * 5) | 0], style: ['short', 'curly', 'spiky'][(Math.random() * 3) | 0], num:'1'};
  const keeperL = el('g', {}, svg), keeper = new Kid(keeperL, kLook, -1, .82, true);
  posts();
  const kidL = el('g', {}, svg), kid = new Kid(kidL, look, 1, 1.12);
  const ballL = el('g', {}, svg), ball = new SoccerBall(ballL, 13), shadow = el('ellipse', {fill:'rgba(0,0,0,.25)'}, ballL);
  ballL.insertBefore(shadow, ball.g);
  const banner = new Banner(fx, 'GOAL!', 120, 104), conf = new Confetti(fx, 70);
  const flash = el('rect', {x:0, y:0, width:W, height:H, fill:'#fff', opacity:0}, fx);
  const kGround = gyB - 6, kStand = pose({x: 562, y: kGround - 64, tor:178, aF:60, eF:20, aB:-60, eB:-20, lF:14, kF:-24, lB:-14, kB:-24, head:6});
  const target = top ? {x: gx0 + 30, y: 262} : {x: gx0 + 40, y: 372}, impact = {x: target.x + dx * .7, y: target.y + dy * .5};
  const dive = top ? pose({x: 636, y: 352, tor:258, aF:226, eF:0, aB:212, eB:0, lF:-70, kF:-10, lB:-88, kB:-14, head:-6, ground: kGround})
                   : pose({x: 612, y: 268, tor:228, aF:206, eF:0, aB:198, eB:0, lF:-28, kF:-10, lB:-44, kB:-20, head:12, ground: kGround});
  const ground = 482, start = 40, foot = 260;
  return {dur: 5.6, frame(t){
    // run up
    let P;
    if (t < 1.0){ const k = t / 1.0; P = run(k * 13, {x: lerp(start, foot - 70, easeO(k * .9 + .1) * (k)), y: ground - 88 - Math.abs(Math.sin(k * 13)) * 6}); }
    else if (t < 1.25){ const k = seg(t, 1.0, 1.25); P = mixPose(run(13, {x: foot - 70 * .9 * 1, y: ground - 88}), pose({x: foot - 52, y: ground - 90, tor:172, lF:-48, kF:-95, lB:6, kB:-10, aF:-60, eF:30, aB:70, eB:20, head:-4}), easeO(k)); }
    else if (t < 1.42){ const k = seg(t, 1.25, 1.42); P = mixPose(pose({x: foot - 52, y: ground - 90, tor:172, lF:-48, kF:-95, lB:6, kB:-10, aF:-60, eF:30, aB:70, eB:20, head:-4}), pose({x: foot - 44, y: ground - 90, tor:190, lF:78, kF:-6, lB:8, kB:-12, aF:-80, eF:10, aB:95, eB:10, head:-2}), easeIO(k)); }
    else if (t < 2.4){ const k = seg(t, 1.42, 2.4); P = mixPose(pose({x: foot - 44, y: ground - 90, tor:190, lF:78, kF:-6, lB:8, kB:-12, aF:-80, eF:10, aB:95, eB:10, head:-2}), pose({x: foot - 34, y: ground - 88, tor:184, lF:30, kF:-30, lB:-6, kB:-10, aF:-30, eF:40, aB:40, eB:40, head:4, mouth:1}), easeO(k)); }
    else { const k = (t - 2.4), j = Math.abs(Math.sin(k * 5.2)); P = pose({x: foot - 30 + Math.min(k, .4) * 50, y: ground - 88 - j * 42, tor:186, aF:128 + Math.sin(k * 10.4) * 12, eF:-20, aB:238 - Math.sin(k * 10.4) * 12, eB:18, lF:12 + j * 14, kF:-30 - j * 40, lB:-10 - j * 8, kB:-36 - j * 40, head:22, mouth:1, ground: ground - 10}); }
    if (P.ground == null) P.ground = ground - 10;
    kid.set(P);
    // ball
    const tk = 1.36, tf = .62, ti = tk + tf;
    let bx, by, br = 0, bs = 1, sx, sy;
    if (t < tk){ bx = foot; by = ground - 12; sx = bx; sy = ground; }
    else if (t < ti){ const k = seg(t, tk, ti), e = easeO(k * .85 + .15) * 1; const c = {x: (foot + target.x) / 2, y: top ? 150 : 360};
      const u = k; bx = (1-u)*(1-u)*foot + 2*(1-u)*u*c.x + u*u*target.x; by = (1-u)*(1-u)*(ground - 12) + 2*(1-u)*u*c.y + u*u*target.y; br = k * 900; bs = lerp(1, .78, k); sx = lerp(foot, target.x, k); sy = lerp(ground, gyB, k); void e; }
    else { const k = t - ti, drop = clamp(k / .55, 0, 1); bx = impact.x + 4 * Math.min(k, .3); by = lerp(impact.y, gyB - 10, easeI(drop)); if (drop >= 1){ const b2 = (k - .55); by = gyB - 10 - Math.abs(Math.sin(b2 * 7)) * 18 * Math.exp(-b2 * 3); }
      br = 900 + k * 120; bs = .76; sx = bx; sy = gyB; }
    ball.at(bx, by, br, bs * 1.0);
    shadow.setAttribute('cx', sx); shadow.setAttribute('cy', sy + 3); shadow.setAttribute('rx', 11 * bs); shadow.setAttribute('ry', 3.5 * bs);
    // keeper
    let K;
    if (t < 1.1) K = mixPose(kStand, pose(Object.assign({}, kStand, {y: kStand.y + 3})), Math.abs(Math.sin(t * 6)));
    else if (t < 1.75){ const k = easeO(seg(t, 1.1, 1.75)); K = mixPose(kStand, dive, k); K.y -= Math.sin(k * Math.PI) * (top ? 34 : 50); }
    else { const k = easeI(seg(t, 1.75, 2.15)); K = mixPose(dive, Object.assign({}, dive, {y: kGround - (top ? 34 : 30), x: dive.x + 8, tor: top ? 262 : 262, lF:-84, lB:-96}), k); }
    K.ground = kGround; keeper.set(K);
    // net and crowd
    if (t >= ti && !bulge) bulge = {x: impact.x, y: impact.y, t: ti};
    drawNet(t);
    const party = t >= ti ? clamp((t - ti) * 3, 0, 1) : 0;
    cheerCrowd(S.heads, t, party);
    flash.setAttribute('opacity', t >= ti ? Math.max(0, .55 - (t - ti) * 2.2) : 0);
    banner.at(seg(t, ti + .05, ti + .55), t * 3);
    conf.step(t > ti + .1);
  }};
}

// ---------------------------------------------------------------- scene: the knee slide
function sceneSlide(svg, look){
  const S = stadium(svg);
  // a goal far behind with the ball in it
  const g = el('g', {opacity:.9}, svg);
  el('path', {d:'M620,322 L620,262 L740,262 L740,322', fill:'none', stroke:'#fff', 'stroke-width':6}, g);
  for (let i = 0; i <= 10; i++) el('line', {x1: 620 + i * 12, y1: 262, x2: 632 + i * 12, y2: 250, stroke:'#e8eef7', 'stroke-width':1, opacity:.6}, g);
  for (let i = 0; i <= 6; i++) el('line', {x1: 632, y1: 250 + i * 11, x2: 752, y2: 250 + i * 11, stroke:'#e8eef7', 'stroke-width':1, opacity:.6}, g);
  for (let i = 0; i <= 10; i++) el('line', {x1: 632 + i * 12, y1: 250, x2: 632 + i * 12, y2: 316, stroke:'#e8eef7', 'stroke-width':1, opacity:.6}, g);
  const b = new SoccerBall(g, 7); b.at(700, 310, 30);
  el('path', {d:'M0,420 L800,420', stroke:'#fff', 'stroke-width':3, opacity:.35}, svg);
  const spray = el('g', {}, svg), drops = [];
  for (let i = 0; i < 34; i++) drops.push({e: el('ellipse', {rx: rnd(2, 4), ry: rnd(1.4, 2.6), fill: i % 3 ? '#4fb35b' : '#d6f5c7', opacity:0}, spray), t0: rnd(.3, 1.5), vx: rnd(-5, -1.5), vy: rnd(-6, -2)});
  const trail = el('path', {fill:'none', stroke:'#2a8a3c', 'stroke-width':12, 'stroke-linecap':'round', opacity:.5}, svg);
  const kid = new Kid(el('g', {}, svg), look, 1, 1.18);
  const fx = el('g', {}, svg), banner = new Banner(fx, 'WHAT A GOAL!', 110, 74), conf = new Confetti(fx, 70);
  const gy = 470;
  const runP = (t) => run(t * 13, {x: lerp(-60, 170, t / .7), y: gy - 92});
  const slideP = x => pose({x, y: gy - 52, tor:198, head:26, aF:142, eF:-16, aB:218, eB:16, lF:14, kF:-100, lB:4, kB:-104, fF:-10, fB:-10, mouth:1, ground: gy - 6});
  return {dur: 5.4, frame(t){
    let P, x = 0;
    if (t < .7) P = runP(t);
    else if (t < .95){ const k = easeIO(seg(t, .7, .95)); P = mixPose(runP(.7), slideP(lerp(170, 220, k)), k); x = 220; }
    else { const k = seg(t, .95, 2.4); x = lerp(220, 520, easeO(k)); P = slideP(x);
      if (t > 2.4){ const k2 = t - 2.4, pump = Math.sin(k2 * 9); P.aF = 146 + pump * 14; P.aB = 214 - pump * 14; P.tor = 196 + Math.sin(k2 * 4.5) * 3; P.head = 28; } }
    if (P.ground == null) P.ground = gy - 6;
    kid.set(P);
    const sx = t > .95 ? lerp(220, 520, easeO(seg(t, .95, 2.4))) : null;
    trail.setAttribute('d', sx ? `M210,${gy - 2} L${sx - 20},${gy - 2}` : 'M0,0');
    trail.setAttribute('opacity', sx ? .45 : 0);
    drops.forEach(d => { const age = t - d.t0; if (age < 0 || age > .9 || t > 2.5){ d.e.setAttribute('opacity', 0); return; }
      const x0 = lerp(220, 520, easeO(seg(d.t0 + .25, .95, 2.4))) - 10; d.e.setAttribute('opacity', 1 - age);
      d.e.setAttribute('cx', x0 + d.vx * age * 40); d.e.setAttribute('cy', gy - 4 + d.vy * age * 40 + age * age * 260); });
    const party = clamp((t - .4) * 2, 0, 1); cheerCrowd(S.heads, t, party);
    banner.at(seg(t, 1.6, 2.1), t * 3); conf.step(t > 1.7);
  }};
}

// ---------------------------------------------------------------- scene: lifting the trophy
function Trophy(layer){ const g = el('g', {}, layer);
  el('path', {d:'M-20,-46 C-40,-46 -40,-20 -16,-16', fill:'none', stroke:'url(#chGold)', 'stroke-width':6, 'stroke-linecap':'round'}, g);
  el('path', {d:'M20,-46 C40,-46 40,-20 16,-16', fill:'none', stroke:'url(#chGold)', 'stroke-width':6, 'stroke-linecap':'round'}, g);
  el('path', {d:'M-24,-54 L24,-54 C24,-24 14,-10 4,-6 L4,6 L-4,6 L-4,-6 C-14,-10 -24,-24 -24,-54 Z', fill:'url(#chGold)', stroke:'#9b6200', 'stroke-width':1.5}, g);
  el('ellipse', {cx:0, cy:-54, rx:24, ry:5, fill:'#fff3b0', stroke:'#9b6200', 'stroke-width':1.2}, g);
  el('path', {d:'M-12,6 L12,6 L16,18 L-16,18 Z', fill:'url(#chGold)', stroke:'#9b6200', 'stroke-width':1.2}, g);
  el('rect', {x:-20, y:18, width:40, height:9, rx:2, fill:'#5b3a1f'}, g);
  el('path', {d:'M-14,-48 C-14,-30 -8,-20 -2,-16', stroke:'#fffbe0', 'stroke-width':3, fill:'none', 'stroke-linecap':'round', opacity:.8}, g);
  const star = el('path', {d:'M0,-40 L3,-33 L10,-33 L4.5,-28.5 L6.5,-21.5 L0,-25.5 L-6.5,-21.5 L-4.5,-28.5 L-10,-33 L-3,-33 Z', fill:'#fff7c2'}, g); void star;
  this.g = g; }
function sceneTrophy(svg, look){
  el('rect', {x:0, y:0, width:W, height:H, fill:'url(#chSky)'}, svg);
  for (let i = 0; i < 40; i++) el('circle', {cx: rnd(0, W), cy: rnd(4, 260), r: rnd(.6, 1.8), fill:'#fff', opacity: rnd(.3, .9)}, svg);
  const fwL = el('g', {}, svg), fws = [[180, 120, '#ff5d5d', .5], [620, 100, '#ffd23f', .9], [400, 70, '#5cc2f2', 1.3], [260, 170, '#b07cff', 1.8], [560, 180, '#13a35c', 2.3], [140, 80, '#ff8a3d', 2.9], [680, 150, '#ff7eb6', 3.3], [420, 140, '#ffd23f', 3.8]].map(f => ({fw: new Firework(fwL, f[0], f[1], f[2]), t: f[3]}));
  // stage with spotlights
  const S = stadium(svg); S.heads.forEach(h => h.g.parentNode && 0); // reuse the crowd
  el('path', {d:'M310,0 L250,470 L550,470 L490,0 Z', fill:'#fff6c8', opacity:.12}, svg);
  el('path', {d:'M260,440 L540,440 L560,470 L240,470 Z', fill:'#d93a2f'}, svg);
  el('rect', {x:240, y:470, width:320, height:30, fill:'#a8241c'}, svg);
  el('path', {d:'M275,428 L525,428 L540,440 L260,440 Z', fill:'#ffd23f'}, svg);
  const fx2 = fwL; void fx2;
  const kidL = el('g', {}, svg), kid = new Kid(kidL, look, 1, 1.18), tr = new Trophy(kidL);
  const fx = el('g', {}, svg), banner = new Banner(fx, 'CHAMPION!', 78, 80), conf = new Confetti(fx, 90, {cols:['#ffd23f', '#fff3b0', '#ffb703', '#ffffff', '#ff5d5d', '#2459d8']});
  const gy = 430;
  return {dur: 5.6, frame(t){
    let P;
    const hold = pose({x: 392, y: gy - 92, tor:184, head:16, aF:158, eF:6, aB:150, eB:10, lF:6, kF:-6, lB:-8, kB:-6, mouth:1, ground: gy});
    if (t < .7){ const k = easeO(seg(t, 0, .7)); P = mixPose(pose({x: 400, y: gy - 84, tor:172, aF:40, eF:90, aB:30, eB:90, lF:24, kF:-50, lB:-12, kB:-40, head:-4, ground: gy}), hold, k); P.y += (1 - k) * 8; }
    else { const k = t - .7, j = Math.max(0, Math.sin(k * 5)); P = Object.assign({}, hold, {y: gy - 92 - j * 40, lF: 6 + j * 22, kF: -6 - j * 46, lB: -8 - j * 6, kB: -6 - j * 46, aF: 158 + Math.sin(k * 5) * 4}); }
    kid.set(P);
    const hx = (kid.handF[0] + kid.handB[0]) / 2, hy = Math.min(kid.handF[1], kid.handB[1]);
    tr.g.setAttribute('transform', `translate(${hx + 2} ${hy - 4}) rotate(${Math.sin(t * 5) * 4}) scale(1.05)`);
    fws.forEach(f => f.fw.at((t - f.t) / 1.1));
    cheerCrowd(S.heads, t, clamp(t * 2, 0, 1));
    banner.at(seg(t, .55, 1.05), t * 3); conf.step(t > .4);
  }};
}

// ---------------------------------------------------------------- scene: basketball swish
function sceneSwish(svg, look){
  el('rect', {x:0, y:0, width:W, height:H, fill:'url(#chArena)'}, svg);
  // arena lights and crowd
  for (let i = 0; i < 7; i++) el('circle', {cx: 60 + i * 115, cy: 30, r: 70, fill:'url(#chGlow)', opacity:.35}, svg);
  const heads = [];
  for (let row = 0; row < 5; row++) for (let x = 6 + (row % 2) * 9; x < W; x += 18){ const y = 110 + row * 26, c = CROWD[(Math.random() * CROWD.length) | 0], gg = el('g', {}, svg);
    el('path', {d:`M${x - 7},${y + 14} Q${x},${y - 1} ${x + 7},${y + 14} Z`, fill: c, opacity:.85}, gg); el('circle', {cx: x, cy: y - 3, r: 5, fill: SKINS[(Math.random() * 5) | 0]}, gg); heads.push({g: gg, ph: Math.random() * 6.3, sp: rnd(9, 14)}); }
  el('rect', {x:0, y:240, width:W, height:22, fill:'#e8312a'}, svg);
  const tb = el('text', {x:400, y:256, fill:'#fff', 'font-family':'Arial Black, Arial', 'font-size':14, 'font-weight':900, 'text-anchor':'middle', 'letter-spacing':3}, svg); tb.textContent = 'PAGE QUEST ARENA  •  READ  •  PLAY  •  WIN';
  // court floor in perspective
  el('path', {d:'M0,262 L800,262 L800,500 L0,500 Z', fill:'url(#chWood)'}, svg);
  for (let i = -8; i < 20; i++) el('line', {x1: 400 + (i * 44 - 400), y1: 262, x2: 400 + (i * 44 - 400) * 1.6, y2: 500, stroke:'#a8642a', 'stroke-width':1, opacity:.35}, svg);
  el('path', {d:'M800,300 C620,300 560,360 580,420 C600,470 700,480 800,480', fill:'none', stroke:'#fff', 'stroke-width':3.5, opacity:.85}, svg);
  el('path', {d:'M800,332 L690,332 L690,450 L800,450', fill:'#2459d8', opacity:.35, stroke:'#fff', 'stroke-width':3}, svg);
  // hoop
  const hx = 676, hy = 214;
  el('rect', {x:760, y:120, width:14, height:330, fill:'#2a2d3e'}, svg);
  el('path', {d:'M700,130 L770,130 L770,150 L716,150 Z', fill:'#2a2d3e'}, svg);
  el('rect', {x:704, y:120, width:14, height:140, rx:3, fill:'#e9f3ff', stroke:'#2a2d3e', 'stroke-width':3, transform:'skewY(-6) translate(0 76)'}, svg);
  el('rect', {x:706, y:160, width:8, height:46, fill:'none', stroke:'#e8312a', 'stroke-width':2.5, transform:'skewY(-6) translate(0 76)'}, svg);
  const netG = el('g', {stroke:'#fff', 'stroke-width':1.6, fill:'none'}, svg), netL = [];
  for (let i = 0; i <= 8; i++) netL.push(el('polyline', {}, netG));
  const rimBack = el('ellipse', {cx: hx, cy: hy, rx: 32, ry: 8, fill:'none', stroke:'#c4400f', 'stroke-width':4}, svg); void rimBack;
  const ballL = el('g', {}, svg), bb = el('g', {}, ballL);
  el('circle', {r:15, fill:'url(#chBball)', stroke:'#5a2a06', 'stroke-width':1.2}, bb);
  const seams = el('g', {stroke:'#4a2208', 'stroke-width':1.4, fill:'none'}, bb);
  el('line', {x1:-15, y1:0, x2:15, y2:0}, seams); el('line', {x1:0, y1:-15, x2:0, y2:15}, seams);
  el('path', {d:'M-10,-11 C-4,-4 -4,4 -10,11'}, seams); el('path', {d:'M10,-11 C4,-4 4,4 10,11'}, seams);
  el('path', {d:`M${hx - 32},${hy} A32,8 0 0 0 ${hx + 32},${hy}`, fill:'none', stroke:'#e8571d', 'stroke-width':4.5, 'stroke-linecap':'round'}, svg);
  const kid = new Kid(el('g', {}, svg), look, 1, 1.12);
  const fx = el('g', {}, svg), banner = new Banner(fx, 'SWISH!', 110, 104), conf = new Confetti(fx, 70);
  const gy = 470, sx0 = 250;
  let swish = null;
  return {dur: 5.2, frame(t){
    let P;
    const set = pose({x: sx0, y: gy - 84, tor:176, aF:150, eF:-110, aB:140, eB:-100, lF:22, kF:-48, lB:-8, kB:-44, head:14, ground: gy});
    const up = pose({x: sx0 + 6, y: gy - 150, tor:184, aF:188, eF:-8, aB:176, eB:-14, lF:4, kF:-10, lB:-10, kB:-16, fF:30, fB:30, head:18, ground: gy});
    if (t < .5) P = mixPose(pose({x: sx0, y: gy - 88, tor:178, aF:40, eF:80, aB:30, eB:80, head:4, ground: gy}), set, easeO(t / .5));
    else if (t < .8) P = mixPose(set, up, easeO(seg(t, .5, .8)));
    else if (t < 1.25) { P = Object.assign({}, up, {y: up.y + easeI(seg(t, .8, 1.25)) * 66, eF: -8 + seg(t, .8, 1.1) * 60}); P.eF = Math.min(P.eF, 40); P.aF = 188 - seg(t, .8, 1.1) * 30; }
    else { const k = t - 1.25, j = t > 2.3 ? Math.abs(Math.sin((t - 2.3) * 5.2)) : 0; P = pose({x: sx0 + 6, y: gy - 84 - j * 38, tor:182, aF: t > 2.3 ? 172 : 158, eF: t > 2.3 ? -6 : 40, aB: t > 2.3 ? 196 : 140, eB:-10, lF: 8 + j * 18, kF: -10 - j * 40, lB: -8, kB: -10 - j * 40, head: t > 2.3 ? 22 : 16, mouth: t > 2.3 ? 1 : 0, ground: gy}); void k; }
    kid.set(P);
    // ball leaves the hands at .78s and arcs in; drops through at 1.95s
    const tr = .78, ta = 1.95;
    let bx, by, rot = 0;
    if (t < tr){ bx = (kid.handF[0] + kid.handB[0]) / 2 + 6; by = Math.min(kid.handF[1], kid.handB[1]) - 14; }
    else if (t < ta){ const k = seg(t, tr, ta), x0 = sx0 + 26, y0 = gy - 150 - 112 + 6; bx = lerp(x0, hx, k); by = lerp(y0, hy - 14, k) - Math.sin(k * Math.PI) * 120; rot = -k * 540; }
    else { const k = t - ta; bx = hx + Math.min(k, .2) * 10; by = hy - 14 + k * 380 + k * k * 400; if (by > gy - 14){ const b = (k - .3); by = gy - 14 - Math.abs(Math.sin(b * 8)) * 60 * Math.exp(-b * 2.5); } bx = hx + 2 + k * 30; rot = -540 - k * 200; }
    bb.setAttribute('transform', `translate(${bx} ${by}) rotate(${rot})`);
    // ball is behind the front of the rim only while it passes through
    if (t >= ta && !swish) swish = t;
    netL.forEach((e, i) => { const a = i / 8 * Math.PI, xt = hx + Math.cos(a + Math.PI) * 32, yt = hy + Math.sin(a) * 6;
      const sw = swish ? Math.exp(-(t - swish) * 4) * Math.sin((t - swish) * 18) : 0, len = 50 + (swish ? Math.max(0, Math.exp(-(t - swish) * 5)) * 16 : 0);
      const xb = hx + Math.cos(a + Math.PI) * (16 + sw * 4), yb = hy + len + Math.sin(a) * 3;
      e.setAttribute('points', `${xt},${yt} ${lerp(xt, xb, .5) + sw * 6},${lerp(yt, yb, .5)} ${xb},${yb}`); });
    heads.forEach(h => h.g.setAttribute('transform', `translate(0 ${t > ta ? -Math.max(0, Math.sin(t * h.sp + h.ph)) * 6 : 0})`));
    banner.at(seg(t, ta + .05, ta + .55), t * 3); conf.step(t > ta + .1);
  }};
}

const SCENES = {goal: sceneGoal, slide: sceneSlide, trophy: sceneTrophy, swish: sceneSwish};

// ---------------------------------------------------------------- the pop-up
const CSS = `.cheer-ov{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(8,14,34,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:chFade .25s ease-out}
.cheer-card{width:min(720px,100%);border-radius:28px;overflow:hidden;background:#10183a;box-shadow:0 24px 60px rgba(0,0,0,.45),0 0 0 4px #ffd23f;animation:chPop .45s cubic-bezier(.2,1.4,.4,1)}
.cheer-card svg{display:block;width:100%;height:auto;aspect-ratio:8/5;background:#0d1b4a}
.cheer-cap{display:flex;align-items:center;gap:14px;padding:14px 18px 16px;background:linear-gradient(180deg,#1b2a66,#121c48);color:#fff}
.cheer-cap b{display:block;font-family:var(--display,system-ui);font-size:1.45rem;line-height:1.15}
.cheer-cap span{display:block;opacity:.85;font-size:1rem;margin-top:2px}
.cheer-cap div{flex:1;min-width:0}
.cheer-cap button{flex:0 0 auto;border:0;border-radius:999px;padding:12px 20px;font:inherit;font-weight:800;font-size:1.05rem;background:#ffd23f;color:#3a2600;box-shadow:0 4px 0 #c99a00;cursor:pointer}
@keyframes chFade{from{opacity:0}}@keyframes chPop{from{transform:scale(.6) rotate(-3deg);opacity:0}}
@media (max-width:520px){.cheer-cap b{font-size:1.15rem}.cheer-cap span{font-size:.9rem}}`;
let open = null;
function play(kind, o){
  o = o || {};
  if (open) return false; // one at a time; the first one wins
  if (!document.getElementById('cheerCss')){ const st = document.createElement('style'); st.id = 'cheerCss'; st.textContent = CSS; document.head.appendChild(st); }
  const look = lookOf(o.look), fn = SCENES[kind] || sceneGoal;
  const ov = document.createElement('div'); ov.className = 'cheer-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', o.title || 'Celebration');
  const card = document.createElement('div'); card.className = 'cheer-card'; ov.appendChild(card);
  const svg = el('svg', {viewBox:`0 0 ${W} ${H}`, 'aria-hidden':'true'}); card.appendChild(svg); defs(svg);
  const cap = document.createElement('div'); cap.className = 'cheer-cap';
  const tx = document.createElement('div'); const b = document.createElement('b'); b.textContent = o.title || 'Great job!'; const sp = document.createElement('span'); sp.textContent = o.sub || ''; tx.append(b, sp);
  const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = o.button || 'Keep going ▶';
  cap.append(tx, btn); card.appendChild(cap);
  document.body.appendChild(ov);
  const sc = fn(svg, look, o.name || '');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t0 = null, raf = 0, done = false;
  const close = () => { if (done) return; done = true; cancelAnimationFrame(raf); clearTimeout(auto); ov.style.transition = 'opacity .2s'; ov.style.opacity = '0'; setTimeout(() => { ov.remove(); open = null; if (o.onClose) o.onClose(); }, 200); };
  const step = now => { if (done) return; if (t0 == null) t0 = now; const t = Math.min((now - t0) / 1000, sc.dur + 30); try { sc.frame(t); } catch (e) { close(); return; } raf = requestAnimationFrame(step); };
  if (o.at != null){ for (let q = 0; q <= o.at; q += 1/60) sc.frame(q); } else if (still) sc.frame(sc.dur - .4); else raf = requestAnimationFrame(step);
  ov.addEventListener('click', close); btn.focus({preventScroll: true});
  const auto = setTimeout(close, (o.hold || 9) * 1000);
  open = {close};
  return true;
}
// for the "My player" picker: draw a still kid in a small svg
function portrait(o, size){
  const svg = el('svg', {viewBox:'0 0 160 200', width: size || 120, height: (size || 120) * 1.25, 'aria-hidden':'true'}); defs(svg);
  el('circle', {cx:80, cy:104, r:76, fill:'#e6efff'}, svg);
  const k = new Kid(el('g', {}, svg), lookOf(o), 1, .98); k.set(pose({x: 72, y: 112, tor:182, head:8, aF:-24, eF:40, aB:28, eB:30, lF:10, kF:-8, lB:-8, kB:-6, ground: 183}));
  const b = new SoccerBall(svg, 10); b.at(116, 176, 20);
  return svg;
}
window.Cheer = {play, portrait, KITS, SKINS, HAIRS, STYLES, isOpen: () => !!open, close: () => open && open.close()};
})();
