// Page Quest celebrations: short, drawn sports scenes that pop up when a child finishes something.
// Everything is vector art built here (no images to download), animated frame by frame with a moving
// camera, slow motion and synthesized sound, and it works offline.
// Window.Cheer.play(kind, {look, title, sub, sound}) shows one; tap anywhere to close.
(function(){
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const W = 800, H = 500, M = 90;              // the world is drawn M past every edge so the camera can move
const OUT = '#1a1d3a';                        // the outline colour every character shares
const el = (tag, at, parent) => { const e = document.createElementNS(NS, tag); if (at) for (const k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const easeO = k => 1 - Math.pow(1 - k, 3), easeI = k => k * k * k, easeIO = k => k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3) / 2;
const smooth = k => k * k * (3 - 2 * k);
const back = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const f2 = p => p[0].toFixed(1) + ',' + p[1].toFixed(1);
function shade(hex, f){ const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255, p = Math.abs(f); r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
let UID = 0; const uid = p => 'ch' + p + (++UID);

// ================================================================ sound (synthesized, no files)
const SND = {ctx: null, on: true, noise: null};
function actx(){ try { if (!SND.ctx){ const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; SND.ctx = new C(); }
  if (SND.ctx.state === 'suspended') SND.ctx.resume(); return SND.ctx; } catch (e) { return null; } }
// iPads only let a page make sound after a tap, so the first tap anywhere wakes the audio up
['pointerdown', 'touchend', 'keydown'].forEach(ev => document.addEventListener(ev, () => { const c = actx(); if (c && c.state === 'running' && !SND.warm){ SND.warm = true; const o = c.createOscillator(), g = c.createGain(); g.gain.value = 0; o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + .02); } }, {capture: true, passive: true}));
function noiseBuf(c){ if (SND.noise) return SND.noise; const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0); let last = 0;
  for (let i = 0; i < d.length; i++){ const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = w * .6 + last * 3.2; } return SND.noise = b; }
function master(c){ if (!SND.out){ SND.out = c.createDynamicsCompressor(); SND.out.threshold.value = -14; SND.out.ratio.value = 4; const g = c.createGain(); g.gain.value = .8; SND.out.connect(g).connect(c.destination); } return SND.out; }
function nz(c, at, dur, type, freq, q, gain, att, rel, sweepTo){
  const s = c.createBufferSource(); s.buffer = noiseBuf(c); s.loop = true; const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, at); f.Q.value = q;
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, at + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(gain, at + att); g.gain.setValueAtTime(gain, at + Math.max(att, dur - rel)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  s.connect(f).connect(g).connect(master(c)); s.start(at, Math.random()); s.stop(at + dur + .05); return g; }
function tone(c, at, dur, type, f0, f1, gain, att, opt){
  const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, at); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(gain, at + (att || .005)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  let node = o; if (opt && opt.lp){ const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opt.lp; o.connect(f); node = f; }
  if (opt && opt.vib){ const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = opt.vib[0]; lg.gain.value = opt.vib[1]; l.connect(lg).connect(o.frequency); l.start(at); l.stop(at + dur + .05); }
  node.connect(g).connect(master(c)); o.start(at); o.stop(at + dur + .05); }
const SFX = {
  kick(c, t){ tone(c, t, .2, 'sine', 170, 42, .9, .003); nz(c, t, .06, 'highpass', 1800, .7, .35, .002, .05); },
  net(c, t){ nz(c, t, .5, 'bandpass', 2400, .8, .4, .01, .4, 900); nz(c, t, .25, 'lowpass', 500, .7, .3, .005, .2); },
  roar(c, t, dur){ const d = dur || 3.6; const g = nz(c, t, d, 'bandpass', 950, .45, .5, .5, 1.8);
    nz(c, t + .05, d - .2, 'bandpass', 2300, .6, .14, .7, 1.6); const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 2.2; lg.gain.value = .08; l.connect(lg).connect(g.gain); l.start(t); l.stop(t + d);
    [0, .5, 1.1].forEach(k => nz(c, t + .2 + k, .5, 'bandpass', 1500 + Math.random() * 600, 2.5, .08, .05, .3)); },
  whistle(c, t){ [0, .2].forEach(k => tone(c, t + k, k ? .55 : .14, 'sine', 2950, 2950, .22, .01, {vib: [34, 140]})); },
  swish(c, t){ nz(c, t, .35, 'highpass', 2500, .5, .45, .03, .28, 6000); },
  whoosh(c, t){ nz(c, t, .45, 'bandpass', 500, 1.2, .28, .08, .3, 2600); },
  slide(c, t){ nz(c, t, 1.2, 'lowpass', 900, .5, .32, .03, .9, 300); },
  bounce(c, t){ tone(c, t, .16, 'sine', 95, 58, .5, .003); },
  pop(c, t){ nz(c, t, .35, 'lowpass', 1600, .5, .45, .002, .3, 300); tone(c, t, .3, 'sine', 300, 80, .2, .002); nz(c, t + .05, .8, 'highpass', 4000, .5, .06, .02, .7); },
  fanfare(c, t){ const N = [[523.3, 0, .18], [659.3, .16, .18], [784, .32, .18], [1046.5, .5, .9]];
    N.forEach(([f, k, d]) => { tone(c, t + k, d + .12, 'sawtooth', f, f, .13, .02, {lp: 2600}); tone(c, t + k, d + .12, 'square', f / 2, f / 2, .05, .02, {lp: 1200}); });
    [523.3, 659.3, 784].forEach(f => tone(c, t + .5, 1.1, 'triangle', f, f, .09, .03)); },
  chime(c, t){ [1318.5, 1568, 2093].forEach((f, i) => tone(c, t + i * .07, .7, 'sine', f, f, .12, .005)); },
};
function playSfx(name, at, arg){ if (!SND.on) return; const c = actx(); if (!c || c.state !== 'running') return; try { SFX[name](c, c.currentTime + (at || 0) + .01, arg); } catch (e) {} }

// ================================================================ the look a child picks
const SKINS = ['#fbd9c0', '#efbb93', '#d29669', '#a46b44', '#6f452d'];
const HAIRS = ['#2a1b12', '#5b3a1f', '#9c5f2a', '#e3b75d', '#121214'];
const KITS = {
  blue:   {kit:'#2459d8', trim:'#ffffff', shorts:'#13235a', socks:'#2459d8', name:'Blue'},
  red:    {kit:'#d6352b', trim:'#ffffff', shorts:'#ffffff', socks:'#d6352b', name:'Red'},
  green:  {kit:'#139a59', trim:'#ffe066', shorts:'#0d3d29', socks:'#139a59', name:'Green'},
  orange: {kit:'#f2851b', trim:'#1b1b2a', shorts:'#1b1b2a', socks:'#f2851b', name:'Orange'},
  purple: {kit:'#7546d6', trim:'#ffd43b', shorts:'#2e1a63', socks:'#7546d6', name:'Purple'},
  sky:    {kit:'#5cc2f2', trim:'#ffffff', shorts:'#ffffff', socks:'#5cc2f2', name:'Sky'},
};
const STYLES = ['short', 'spiky', 'curly', 'pony', 'long'];
const BOOTS = ['#ff4f6d', '#ffd23f', '#3ee0b0', '#ffffff', '#ff8a3d', '#62a8ff'];
function lookOf(o){ o = o || {}; const k = KITS[o.kit] || KITS.blue;
  return Object.assign({}, k, {skin: SKINS[o.skin == null ? 1 : o.skin] || SKINS[1], hair: HAIRS[o.hairC == null ? 0 : o.hairC] || HAIRS[0],
    style: STYLES.includes(o.style) ? o.style : 'short', num: String(o.num || 10), boot: BOOTS[(+o.num || 10) % BOOTS.length]}); }

// ================================================================ drawing helpers
// a tapered limb: two circles joined by straight sides
function capsule(a, b, ra, rb){
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || .001, nx = -dy / L, ny = dx / L;
  const p1 = [a[0] + nx * ra, a[1] + ny * ra], p2 = [b[0] + nx * rb, b[1] + ny * rb], p3 = [b[0] - nx * rb, b[1] - ny * rb], p4 = [a[0] - nx * ra, a[1] - ny * ra];
  return `M${f2(p1)}L${f2(p2)}A${rb.toFixed(1)},${rb.toFixed(1)} 0 0 0 ${f2(p3)}L${f2(p4)}A${ra.toFixed(1)},${ra.toFixed(1)} 0 0 0 ${f2(p1)}Z`;
}
const circ = (x, y, r) => `M${(x - r).toFixed(1)},${y.toFixed(1)}a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 ${-2 * r},0Z`;
// A Part draws every shape twice: once fat and dark underneath (the outline), once in colour on top,
// so one part reads as a single outlined sticker with no lines inside it.
function Part(parent, ow){ this.g = el('g', {}, parent); this.ol = el('g', {}, this.g); this.fi = el('g', {}, this.g); this.ow = ow; }
Part.prototype.shape = function(fill, d, extra){
  const o = el('path', {fill: OUT, stroke: OUT, 'stroke-width': this.ow * 2, 'stroke-linejoin':'round'}, this.ol), f = el('path', Object.assign({fill}, extra || {}), this.fi);
  const s = {o, f, set(dd){ o.setAttribute('d', dd); f.setAttribute('d', dd); return s; }, tf(t){ o.setAttribute('transform', t); f.setAttribute('transform', t); return s; }};
  if (d) s.set(d); return s; };
Part.prototype.detail = function(at){ return el('path', at, this.fi); };

// ================================================================ a kid, drawn as a jointed figure
// Angles are degrees from straight down; 90 points the way the kid faces, 180 points up.
// Elbows bend forward (positive), knees bend back (negative). face: 0 focused, 1 smiling, 2 shouting.
const STAND = {x:0, y:0, tor:180, head:0, aF:15, eF:25, aB:-15, eB:25, lF:4, kF:-4, lB:-4, kB:-4, fF:0, fB:0, face:1, pony:0};
const pose = o => Object.assign({}, STAND, o);
const mixPose = (A, B, k) => { const o = {}; for (const key in A) o[key] = lerp(A[key], B[key] == null ? A[key] : B[key], k); for (const key in B) if (!(key in o)) o[key] = B[key]; return o; };
function run(phase, extra){ const sn = Math.sin(phase);
  const knee = ph => -14 - 78 * Math.max(0, Math.sin(ph - .9));
  return pose(Object.assign({tor:164, lF: 40 * sn, kF: knee(phase), lB: -40 * sn, kB: knee(phase + Math.PI), aF: -52 * sn, eF: 86, aB: 52 * sn, eB: 86, head:4, face:0}, extra || {})); }

function Kid(layer, look, dir, s, keeper){
  this.dir = dir || 1; this.s = s || 1; this.look = look; this.keeper = !!keeper;
  const L = look, ow = 2.4 * this.s, g = el('g', {}, layer); this.g = g;
  const dS = shade(L.skin, -.16), dK = shade(L.kit, -.24), glove = '#c6ff3d';
  this.shadow = el('ellipse', {fill:'rgba(10,20,10,.32)'}, g);
  const mkArm = back => { const P = new Part(g, ow), sk = back ? dS : L.skin, kit = back ? dK : L.kit;
    return {P, up: P.shape(sk), lo: P.shape(sk), sl: P.shape(kit), cuff: P.detail({fill:'none', stroke: back ? shade(L.trim, -.2) : L.trim, 'stroke-width': 2.4 * this.s, 'stroke-linecap':'round'}),
      sh: P.detail({fill:'rgba(0,0,0,.12)'}), hand: P.shape(keeper ? (back ? shade(glove, -.2) : glove) : sk), knuck: P.detail({fill:'none', stroke: keeper ? '#6a8f00' : 'rgba(0,0,0,.18)', 'stroke-width': 1.4 * this.s})}; };
  const mkLeg = back => { const P = new Part(g, ow), sk = back ? dS : L.skin, so = back ? shade(L.socks, -.22) : L.socks;
    return {P, th: P.shape(sk), sh: P.shape(sk), sock: P.shape(so), shorts: P.shape(back ? shade(L.shorts, -.2) : L.shorts),
      boot: P.shape(back ? '#20223a' : '#272a45'), sole: P.shape(back ? shade(L.boot, -.25) : L.boot), stripe: P.detail({fill: back ? shade(L.boot, -.25) : L.boot}),
      band: P.detail({fill:'none', stroke: back ? shade(L.trim, -.25) : L.trim, 'stroke-width': 3 * this.s}), shade: P.detail({fill:'rgba(0,0,0,.13)'}), hl: P.detail({fill:'rgba(255,255,255,.18)'})}; };
  this.armB = mkArm(true); this.legB = mkLeg(true);
  // torso, drawn once in its own frame (hip at origin, up is -y, forward is +x) and turned as a whole
  const T = new Part(g, ow); this.T = T;
  T.shape(L.shorts, 'M-16,6 C-17,-4 -17,-14 -16,-20 L17,-20 C18,-12 18,-2 16,6 C6,10 -6,10 -16,6 Z');
  T.detail({d:'M-16,6 C-17,-4 -17,-12 -16,-18 L-6,-18 C-7,-8 -7,2 -6,8 Z', fill:'rgba(0,0,0,.16)'});
  T.shape(L.kit, 'M-16,-2 C-18,-16 -19,-32 -17,-42 C-15,-50 -8,-54 1,-54 C11,-54 18,-50 19,-42 C21,-30 19,-14 17,-2 C7,2 -6,2 -16,-2 Z');
  T.detail({d:'M-16,-2 C-18,-16 -19,-32 -17,-42 C-15,-50 -10,-53 -5,-54 C-10,-42 -10,-18 -6,1 Z', fill:'rgba(0,0,0,.16)'});
  T.detail({d:'M13,-49 C17,-41 18,-26 16,-8', fill:'none', stroke:'rgba(255,255,255,.28)', 'stroke-width':3.2, 'stroke-linecap':'round'});
  T.detail({d:'M-17,-30 C-14,-28 -12,-12 -15,-2', fill:'none', stroke: L.trim, 'stroke-width':2.6, opacity:.85});
  T.detail({d:'M-4,-54 L3,-46 L10,-54', fill:'none', stroke: L.trim, 'stroke-width':3.4, 'stroke-linejoin':'round', 'stroke-linecap':'round'});
  T.detail({d:'M-16,-1 C-6,3 7,3 17,-1', fill:'none', stroke: L.trim, 'stroke-width':2.4, opacity:.9});
  this.num = el('text', {x: 2, y: -25, fill: L.trim, 'font-family':'"Baloo 2", "Futura", "Arial Black", sans-serif', 'font-weight':800, 'font-size': 19, 'text-anchor':'middle', 'dominant-baseline':'central', stroke: shade(L.kit, -.45), 'stroke-width':2.2, 'paint-order':'stroke', 'stroke-linejoin':'round'}, T.fi); this.num.textContent = L.num;
  this.legF = mkLeg(false);
  this.H = new Part(g, ow); this.drawHead();
  this.armF = mkArm(false);
  this.set(STAND);
}
Kid.prototype.drawHead = function(){
  const L = this.look, P = this.H, sk = L.skin, hc = L.hair, hl = shade(hc, .28), hd = shade(hc, -.25);
  if (L.style === 'pony'){ this.pony = P.shape(hc, 'M-15,-16 C-38,-22 -50,0 -44,22 C-41,34 -30,37 -29,27 C-34,12 -29,-2 -14,-3 Z');
    this.ponyHl = P.detail({d:'M-37,-4 C-40,6 -39,16 -35,24', stroke: hl, 'stroke-width':2.4, fill:'none', 'stroke-linecap':'round'}); }
  if (L.style === 'long') P.shape(hc, 'M-22,-12 C-33,10 -32,34 -18,46 C-8,52 4,47 6,34 L6,8 Z');
  P.shape(sk, circ(0, 0, 26));
  P.detail({d:'M-26,2 A26,26 0 0 0 12,23 A30,30 0 0 1 -26,2 Z', fill:'rgba(0,0,0,.08)'});
  P.shape(sk, 'M-11,-1 C-15,-8 -2,-10 -2,2 C-2,10 -12,11 -11,4 Z');
  P.detail({d:'M-7,-2 q3,3 0,6', stroke: shade(sk, -.3), 'stroke-width':1.6, fill:'none', 'stroke-linecap':'round'});
  const hairs = {
    short: 'M-27,6 C-31,-20 -11,-34 9,-30 C21,-28 29,-18 27,-8 C22,-14 16,-15 11,-12 C8,-18 1,-19 -3,-15 C-8,-18 -15,-15 -16,-9 C-19,-6 -21,0 -20,7 Z',
    spiky: 'M-27,6 L-31,-10 L-22,-14 L-25,-28 L-12,-24 L-7,-38 L3,-28 L13,-37 L16,-25 L30,-23 L25,-11 C20,-15 14,-15 10,-12 C6,-17 0,-17 -4,-13 C-9,-15 -15,-13 -16,-7 L-20,7 Z',
    pony: 'M-27,8 C-31,-20 -11,-33 9,-30 C22,-28 30,-17 27,-6 C19,-16 7,-18 -4,-14 C-13,-11 -18,-2 -19,9 Z',
    long: 'M-27,14 C-32,-20 -11,-33 9,-30 C22,-28 30,-17 27,-5 C19,-15 7,-17 -4,-13 C-13,-10 -18,1 -18,16 Z',
  };
  if (L.style === 'curly'){ [[-22,-6,10],[-19,-18,10],[-9,-26,10],[3,-28,10],[14,-24,9],[22,-15,7.5],[-24,6,8],[-14,-12,7]].forEach(c => P.shape(hc, circ(c[0], c[1], c[2])));
    [[-16,-18,3.2],[-4,-24,3.2],[9,-23,2.8],[-21,-4,2.6]].forEach(c => P.detail({d: circ(c[0], c[1], c[2]), fill: hl})); }
  else { P.shape(hc, hairs[L.style]); P.detail({d:'M-16,-22 C-8,-28 5,-28 15,-23', stroke: hl, 'stroke-width':2.8, fill:'none', 'stroke-linecap':'round'});
    P.detail({d:'M-22,-8 C-20,-16 -14,-20 -8,-22', stroke: hl, 'stroke-width':2, fill:'none', 'stroke-linecap':'round', opacity:.7}); }
  if (L.style === 'pony') P.shape(L.kit, circ(-17, -11, 4.6));
  P.detail({d: 'M3,9 a5,3 0 1 0 10,0 a5,3 0 1 0 -10,0', fill:'#ff6f6f', opacity:.35});
  this.eyeO = el('g', {}, P.fi);
  el('path', {d:'M8,-2 C8,-9 19,-9 19,-2 C19,5 8,5 8,-2 Z', fill:'#fff', stroke: OUT, 'stroke-width':1.4}, this.eyeO);
  el('circle', {cx:15.4, cy:-1.6, r:3.6, fill:'#3b2a1e'}, this.eyeO); el('circle', {cx:15.8, cy:-1.4, r:2, fill:'#101018'}, this.eyeO);
  el('circle', {cx:16.8, cy:-3.4, r:1.3, fill:'#fff'}, this.eyeO); el('circle', {cx:14.2, cy:.4, r:.6, fill:'#fff'}, this.eyeO);
  this.eyeC = P.detail({d:'M8,-1 C10,-7 17,-7 19,-1', stroke: OUT, 'stroke-width':2.4, fill:'none', 'stroke-linecap':'round'});
  this.brow = P.detail({stroke: hd, 'stroke-width':3, fill:'none', 'stroke-linecap':'round'});
  P.detail({d:'M25,-3 q5,4 -.5,7', stroke: shade(sk, -.28), 'stroke-width':2, fill:'none', 'stroke-linecap':'round'});
  this.mSmile = P.detail({d:'M12,10 q6,6.5 12,-.5', stroke: '#6b2420', 'stroke-width':2.6, fill:'none', 'stroke-linecap':'round'});
  this.mFocus = P.detail({d:'M13,12 q5,-1.5 10,0', stroke: '#6b2420', 'stroke-width':2.4, fill:'none', 'stroke-linecap':'round'});
  this.mShout = el('g', {}, P.fi);
  el('path', {d:'M10,8 C11,22 24,22 25,7 C20,10 15,10 10,8 Z', fill:'#5b1717', stroke: OUT, 'stroke-width':1.6, 'stroke-linejoin':'round'}, this.mShout);
  el('path', {d:'M11.5,9 C16,10.6 20,10.4 24,8.4 L23.6,11 C19,12.4 15,12.4 11.8,11 Z', fill:'#fff'}, this.mShout);
  el('path', {d:'M13.5,18 C16,15 21,15 23,17.5 C20,20 16,20 13.5,18 Z', fill:'#ef6f72'}, this.mShout);
};
Kid.prototype.set = function(P){
  const d = this.dir, s = this.s, R = Math.PI / 180;
  const v = (a, len) => [d * Math.sin(a * R) * len * s, Math.cos(a * R) * len * s];
  const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const part = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const hip = [P.x, P.y], sh = add(hip, v(P.tor, 44)), neck = add(hip, v(P.tor, 50));
  const arm = (A, aU, eL) => { const e1 = add(sh, v(aU, 23)), wr = add(e1, v(aU + eL, 21)), hr = (this.keeper ? 9.5 : 6.6) * s;
    A.up.set(capsule(sh, e1, 6.4 * s, 5.8 * s)); A.lo.set(capsule(e1, wr, 5.8 * s, 5 * s)); const sm = part(sh, e1, .52); A.sl.set(capsule(sh, sm, 9 * s, 7.6 * s));
    const n = v(aU + 90, 1); A.cuff.setAttribute('d', `M${f2([sm[0] + n[0] * 7 * s, sm[1] + n[1] * 7 * s])}L${f2([sm[0] - n[0] * 7 * s, sm[1] - n[1] * 7 * s])}`);
    A.sh.setAttribute('d', capsule(add(e1, v(aU + eL - 90, 2.4)), add(wr, v(aU + eL - 90, 2)), 2.8 * s, 2.4 * s));
    const hc = add(wr, v(aU + eL, 3)); A.hand.set(circ(hc[0], hc[1], hr)); const k = v(aU + eL + 90, hr * .55 / s), q = v(aU + eL, 3);
    A.knuck.setAttribute('d', `M${f2(add(hc, k))}q${q[0].toFixed(1)},${q[1].toFixed(1)} ${(-2 * k[0]).toFixed(1)},${(-2 * k[1]).toFixed(1)}`); return hc; };
  this.handB = arm(this.armB, P.aB, P.eB); this.handF = arm(this.armF, P.aF, P.eF);
  // an arm thrown straight up goes behind the head, so it never covers the face
  const behind = P.aF > 150 && P.aF < 215; if (behind !== this.behind){ this.behind = behind; this.g.insertBefore(this.armF.P.g, behind ? this.H.g : null); }
  const leg = (Lg, aT, kn, fx) => {
    const h0 = add(hip, v(P.tor, 3)), knee = add(h0, v(aT, 31)), ank = add(knee, v(aT + kn, 31));
    Lg.th.set(capsule(h0, knee, 8.4 * s, 7 * s)); Lg.sh.set(capsule(knee, ank, 7 * s, 5.4 * s));
    Lg.shorts.set(capsule(h0, part(h0, knee, .52), 11.5 * s, 10.2 * s));
    const s0 = part(knee, ank, .3); Lg.sock.set(capsule(s0, ank, 7.2 * s, 5.8 * s));
    const nn = v(aT + kn + 90, 1), b1 = part(knee, ank, .36), b2 = part(knee, ank, .48);
    Lg.band.setAttribute('d', `M${f2([b1[0] + nn[0] * 6.8 * s, b1[1] + nn[1] * 6.8 * s])}L${f2([b1[0] - nn[0] * 6.8 * s, b1[1] - nn[1] * 6.8 * s])}M${f2([b2[0] + nn[0] * 6.6 * s, b2[1] + nn[1] * 6.6 * s])}L${f2([b2[0] - nn[0] * 6.6 * s, b2[1] - nn[1] * 6.6 * s])}`);
    Lg.shade.setAttribute('d', capsule(add(knee, v(aT + kn - 90, 2.6)), add(s0, v(aT + kn - 90, 2.4)), 3 * s, 2.8 * s));
    Lg.hl.setAttribute('d', capsule(add(h0, v(aT + 90, 3.6)), add(knee, v(aT + 90, 3)), 2.4 * s, 2 * s));
    const fa = aT + kn + 90 + (fx || 0);
    const tfm = `translate(${ank[0].toFixed(1)} ${ank[1].toFixed(1)}) rotate(${(d > 0 ? -(fa - 90) : (fa - 90)).toFixed(1)}) scale(${d * s} ${s})`;
    Lg.boot.set('M-8,4 L-9,-5 C-8,-10 1,-10 5,-6 C11,-5 19,-4 22,0 C23,3 21,5 18,5 Z').tf(tfm);
    Lg.sole.set('M-9,3.6 L21,3.6 C21,6 19,7 17,7 L-7,7 C-9,7 -9,5 -9,3.6 Z').tf(tfm);
    Lg.stripe.setAttribute('d', 'M-3,-5 L6,0 L4,2 L-4,-2 Z'); Lg.stripe.setAttribute('transform', tfm);
    return {knee, ank};
  };
  this.footB = leg(this.legB, P.lB, P.kB, P.fB); this.footF = leg(this.legF, P.lF, P.kF, P.fF);
  this.T.g.setAttribute('transform', `translate(${hip[0].toFixed(1)} ${hip[1].toFixed(1)}) rotate(${((180 - P.tor) * d).toFixed(1)}) scale(${d * s} ${s})`);
  this.num.setAttribute('transform', d < 0 ? 'translate(4 0) scale(-1 1)' : '');
  const hc = add(neck, v(P.tor + (P.head || 0) * .3, 22)); this.headAt = hc;
  this.H.g.setAttribute('transform', `translate(${hc[0].toFixed(1)} ${hc[1].toFixed(1)}) rotate(${(((180 - P.tor) - (P.head || 0)) * d).toFixed(1)}) scale(${d * s} ${s})`);
  if (this.pony){ const t = `rotate(${(P.pony || 0).toFixed(1)} -16 -10)`; this.pony.tf(t); this.ponyHl.setAttribute('transform', t); }
  const face = P.face == null ? 1 : P.face, shout = face > 1.5;
  this.eyeO.style.display = shout ? 'none' : ''; this.eyeC.style.display = shout ? '' : 'none';
  this.brow.setAttribute('d', face < .5 ? 'M7,-11 L19,-8' : shout ? 'M7,-13 q6,-4 12,-1' : 'M7,-11 q6,-4 12,-1');
  this.mSmile.style.display = face >= .5 && !shout ? '' : 'none'; this.mFocus.style.display = face < .5 ? '' : 'none'; this.mShout.style.display = shout ? '' : 'none';
  const gy = P.ground == null ? P.y + 70 * s : P.ground, lift = clamp((gy - (P.y + 70 * s)) / 110, 0, 1);
  this.shadow.setAttribute('cx', P.x + d * 4 * s); this.shadow.setAttribute('cy', gy + 4 * s); this.shadow.setAttribute('rx', (34 - lift * 16) * s); this.shadow.setAttribute('ry', (7.5 - lift * 3.5) * s);
  this.shadow.setAttribute('opacity', 1 - lift * .55);
  this.hip = hip;
};

// ================================================================ shared scenery and effects
function defs(svg){
  const d = el('defs', {}, svg);
  d.innerHTML = `
  <linearGradient id="chSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070f33"/><stop offset=".5" stop-color="#1b3a86"/><stop offset="1" stop-color="#3f79c9"/></linearGradient>
  <linearGradient id="chGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a9e4a"/><stop offset=".5" stop-color="#2f8f3f"/><stop offset="1" stop-color="#1c6e30"/></linearGradient>
  <linearGradient id="chHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8d4ff" stop-opacity=".0"/><stop offset="1" stop-color="#cfe6ff" stop-opacity=".22"/></linearGradient>
  <linearGradient id="chStand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1233"/><stop offset="1" stop-color="#1c2a5e"/></linearGradient>
  <radialGradient id="chGlow"><stop offset="0" stop-color="#ffffff" stop-opacity="1"/><stop offset=".18" stop-color="#fff7c9" stop-opacity=".7"/><stop offset="1" stop-color="#fff2b0" stop-opacity="0"/></radialGradient>
  <radialGradient id="chPool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  <radialGradient id="chVig" cx=".5" cy=".46" r=".72"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#03061a" stop-opacity=".62"/></radialGradient>
  <radialGradient id="chBall" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef1f6"/><stop offset="1" stop-color="#9aa3b5"/></radialGradient>
  <radialGradient id="chBball" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#ffb46b"/><stop offset=".7" stop-color="#ec7521"/><stop offset="1" stop-color="#9b430b"/></radialGradient>
  <linearGradient id="chGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c4"/><stop offset=".3" stop-color="#ffd84a"/><stop offset=".62" stop-color="#e8a412"/><stop offset=".8" stop-color="#ffd84a"/><stop offset="1" stop-color="#a86a00"/></linearGradient>
  <linearGradient id="chText" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset=".45" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff8a1c"/></linearGradient>
  <linearGradient id="chShine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="chWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0bd78"/><stop offset="1" stop-color="#b9702f"/></linearGradient>
  <linearGradient id="chArena" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e0a2b"/><stop offset="1" stop-color="#2d2166"/></linearGradient>
  <linearGradient id="chBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff8d6" stop-opacity="0"/></linearGradient>
  <pattern id="chTex" width="14" height="10" patternUnits="userSpaceOnUse"><path d="M2,9 l1,-4 M7,8 l-1,-4 M11,9 l1,-3" stroke="#1a5e2a" stroke-width="1" opacity=".35"/><path d="M4,4 l1,-3 M10,3 l-1,-2" stroke="#7fd08a" stroke-width="1" opacity=".25"/></pattern>`;
}
const CROWD = ['#ff5d5d', '#ffd23f', '#2f6bff', '#ffffff', '#13a35c', '#ff8a3d', '#b07cff', '#5cc2f2', '#ff7eb6', '#e8312a'];
// People in the stands. Each stretch of a row is painted once onto a small canvas (arms down and arms
// up) and placed as one image, so a stadium of hundreds of fans costs the iPad a few dozen pictures.
function crowd(world, y0, rows, gap, r, tone, blockW){
  const blocks = [], Q = 2, hgt = r * 7;
  for (let row = 0; row < rows; row++){ const y = y0 + row * gap, dim = row / rows * .25;
    el('rect', {x: -M, y: y + r * 2.2, width: W + 2 * M, height: Math.max(2, r * .7), fill: shade(tone, row % 2 ? .06 : -.04)}, world);
    for (let bx = -M; bx < W + M; bx += blockW){
      const ppl = []; for (let x = bx + 4 + (row % 2) * r * 1.7; x < bx + blockW; x += r * 3.3 + Math.random() * r * .7)
        ppl.push({x: x - bx + r * 2, c: pick(CROWD), sk: pick(SKINS), hair: Math.random() < .3 ? pick(HAIRS) : null, arm: Math.random() < .5, sign: Math.random() < .05 ? pick(['#ffd23f', '#ffffff', '#ff5d5d']) : null});
      const paint = up => { const cv = document.createElement('canvas'); cv.width = (blockW + r * 4) * Q; cv.height = hgt * Q; const c = cv.getContext('2d'); c.scale(Q, Q); const yy = r * 4;
        ppl.forEach(p => { c.fillStyle = shade(p.c, -.25 - dim); c.beginPath(); c.moveTo(p.x - r * 1.45, yy + r * 2.6); c.bezierCurveTo(p.x - r * 1.4, yy + r * .4, p.x + r * 1.4, yy + r * .4, p.x + r * 1.45, yy + r * 2.6); c.fill();
          if (up && p.arm){ c.strokeStyle = shade(p.c, -.2 - dim); c.lineWidth = r * .8; c.lineCap = 'round'; c.beginPath(); c.moveTo(p.x + r, yy + r); c.lineTo(p.x + r * 1.8, yy - r * 1.6); c.stroke(); c.beginPath(); c.moveTo(p.x - r, yy + r); c.lineTo(p.x - r * 1.6, yy - r * 1.4); c.stroke(); }
          c.fillStyle = shade(p.sk, -.15 - dim); c.beginPath(); c.arc(p.x, yy - r * .1, r, 0, Math.PI * 2); c.fill();
          if (p.hair){ c.fillStyle = shade(p.hair, -.1); c.beginPath(); c.arc(p.x, yy - r * .3, r * 1.02, Math.PI * 1.05, Math.PI * 1.95); c.fill(); }
          if (up && p.sign){ c.fillStyle = p.sign; c.fillRect(p.x - r * 2.2, yy - r * 3.6, r * 4.4, r * 1.8); } });
        try { return cv.toDataURL(); } catch (e) { return ''; } };
      const down = paint(false), upI = paint(true);
      const img = el('image', {x: bx - r * 2, y: y - r * 4, width: blockW + r * 4, height: hgt, href: down, preserveAspectRatio:'none'}, world);
      blocks.push({g: img, ph: Math.random() * 6.3, sp: rnd(8, 13), down, up: upI});
    } }
  return blocks;
}
function cheerCrowd(blocks, t, on){ blocks.forEach(b => { const j = on ? Math.max(0, Math.sin(t * b.sp + b.ph)) * 5.5 * on : 0; b.g.setAttribute('transform', `translate(0 ${(-j).toFixed(1)})`);
  const u = on > .3; if (b.armsOn !== u){ b.armsOn = u; b.g.setAttribute('href', u ? b.up : b.down); } }); }
// camera flashes popping in the stands
function Flashes(world, n, y0, y1){ this.ps = []; for (let i = 0; i < n; i++){ const g = el('g', {opacity: 0}, world);
  el('circle', {r: 9, fill:'url(#chGlow)'}, g); el('path', {d:'M0,-7 L1.2,-1.2 L7,0 L1.2,1.2 L0,7 L-1.2,1.2 L-7,0 L-1.2,-1.2 Z', fill:'#fff'}, g);
  this.ps.push({g, x: rnd(-40, W + 40), y: rnd(y0, y1), t0: rnd(0, 3), p: rnd(.25, .7)}); } }
Flashes.prototype.at = function(t, on){ this.ps.forEach(p => { const k = ((t + p.t0) % p.p) / p.p, a = on ? Math.max(0, 1 - k * 5) : 0; if (a <= 0 && p.vis === 0) return;
  if (k < .02) p.x = rnd(-40, W + 40); p.vis = a; p.g.setAttribute('opacity', a.toFixed(2)); p.g.setAttribute('transform', `translate(${p.x.toFixed(0)} ${p.y.toFixed(0)}) scale(${(.6 + a * .6).toFixed(2)})`); }); };

function stadium(world){
  el('rect', {x: -M, y: -M, width: W + 2 * M, height: H + 2 * M, fill:'url(#chSky)'}, world);
  for (let i = 0; i < 40; i++) el('circle', {cx: rnd(-M, W + M), cy: rnd(-M, 40), r: rnd(.5, 1.5), fill:'#fff', opacity: rnd(.3, .85)}, world);
  // the roof sweeping across the top, with its lights
  el('path', {d:`M${-M},${-M} L${W + M},${-M} L${W + M},46 C560,64 240,64 ${-M},46 Z`, fill:'#060a22'}, world);
  for (let x = -M; x < W + M; x += 26) el('path', {d:`M${x},${-M} L${x + 13},${50 + 8 * Math.sin((x + M) / (W + 2 * M) * Math.PI)}`, stroke:'#141d47', 'stroke-width':2}, world);
  el('path', {d:`M${-M},46 C240,64 560,64 ${W + M},46`, stroke:'#2a3870', 'stroke-width':3, fill:'none'}, world);
  for (let x = -40; x < W + 40; x += 55){ const y = 50 + 10 * Math.sin((x + M) / (W + 2 * M) * Math.PI); el('circle', {cx: x, cy: y, r: 32, fill:'url(#chGlow)', opacity:.5}, world); el('ellipse', {cx: x, cy: y, rx: 6, ry: 2.6, fill:'#fffbe6'}, world); }
  // upper tier
  el('path', {d:`M${-M},56 C240,74 560,74 ${W + M},56 L${W + M},170 L${-M},170 Z`, fill:'url(#chStand)'}, world);
  const up = crowd(world, 78, 5, 17, 3.6, '#18235a', 60);
  el('rect', {x: -M, y: 166, width: W + 2 * M, height: 14, fill:'#0d1538'}, world);
  el('rect', {x: -M, y: 170, width: W + 2 * M, height: 4, fill:'#ffd23f', opacity:.75}, world);
  // lower tier
  el('rect', {x: -M, y: 180, width: W + 2 * M, height: 110, fill:'#1a2660'}, world);
  const lo = crowd(world, 196, 4, 23, 5.4, '#1f2d6c', 70);
  el('rect', {x: -M, y: 56, width: W + 2 * M, height: 234, fill:'url(#chHaze)'}, world);
  // LED boards
  const boards = el('g', {}, world), boardTxt = [];
  el('rect', {x: -M, y: 284, width: W + 2 * M, height: 28, fill:'#05081a'}, boards);
  const words = ['PAGE QUEST', 'READ • PLAY • WIN', 'BRAIN POWER', 'PAGE QUEST', 'GO TEAM!', 'READ MORE'], bw = (W + 2 * M) / words.length;
  words.forEach((t, i) => { const c = i % 2 ? '#1f5bff' : '#ff3b30';
    el('rect', {x: -M + i * bw + 2, y: 287, width: bw - 4, height: 22, rx: 2, fill: c, opacity:.92}, boards);
    el('rect', {x: -M + i * bw + 2, y: 287, width: bw - 4, height: 8, rx: 2, fill:'#fff', opacity:.12}, boards);
    const tx = el('text', {x: -M + i * bw + bw / 2, y: 303, fill:'#fff', 'font-family':'"Baloo 2", "Futura", "Arial Black", sans-serif', 'font-weight':800, 'font-size': 15, 'text-anchor':'middle', 'letter-spacing':1.5}, boards); tx.textContent = t; boardTxt.push(tx); });
  // pitch
  el('rect', {x: -M, y: 312, width: W + 2 * M, height: H - 312 + M, fill:'url(#chGrass)'}, world);
  for (let i = -10; i < 16; i += 2){ const x0 = i * 64, x1 = (i + 1) * 64, sk = 1.9;
    el('path', {d:`M${x0},312 L${x1},312 L${400 + (x1 - 400) * sk},${H + M} L${400 + (x0 - 400) * sk},${H + M} Z`, fill:'#ffffff', opacity:.055}, world); }
  el('rect', {x: -M, y: 312, width: W + 2 * M, height: H - 312 + M, fill:'url(#chTex)'}, world);
  el('rect', {x: -M, y: 312, width: W + 2 * M, height: 10, fill:'rgba(0,0,0,.22)'}, world);
  el('ellipse', {cx: 400, cy: 430, rx: 520, ry: 120, fill:'url(#chPool)'}, world);
  return {up, lo, boardTxt, all: up.concat(lo)};
}
function boardsGoal(S, t, on){ if (!on) return; const k = Math.floor(t * 4) % 2; S.boardTxt.forEach((tx, i) => { const w = (i + k) % 2 ? 'GOAL!' : '★ ★ ★'; if (tx.textContent !== w) tx.textContent = w; }); }

function SoccerBall(layer, r){
  const g = el('g', {}, layer), inner = el('g', {}, g);
  el('circle', {r: r + 1.2, fill: OUT}, inner);
  el('circle', {r, fill:'url(#chBall)'}, inner);
  const spin = el('g', {}, inner), pent = (cx, cy, rr, rot) => { let d = ''; for (let i = 0; i < 5; i++){ const a = (rot + i * 72) * Math.PI / 180; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(2) + ',' + (cy + Math.sin(a) * rr).toFixed(2); } return d + 'Z'; };
  const clip = el('clipPath', {id: uid('bc')}, g); el('circle', {r: r - .4}, clip);
  spin.setAttribute('clip-path', `url(#${clip.id})`);
  el('path', {d: pent(0, 0, r * .36, -90), fill:'#22243a'}, spin);
  for (let i = 0; i < 5; i++){ const a = (-90 + i * 72) * Math.PI / 180, cx = Math.cos(a) * r * .98, cy = Math.sin(a) * r * .98;
    el('path', {d: pent(cx, cy, r * .36, -90 + i * 72 + 36), fill:'#22243a'}, spin);
    el('line', {x1: Math.cos(a) * r * .36, y1: Math.sin(a) * r * .36, x2: Math.cos(a) * r * .64, y2: Math.sin(a) * r * .64, stroke:'#22243a', 'stroke-width': 1}, spin); }
  el('ellipse', {cx: -r * .36, cy: -r * .42, rx: r * .3, ry: r * .17, fill:'#fff', opacity:.85, transform:`rotate(-32 ${-r * .36} ${-r * .42})`}, inner);
  this.g = g; this.spin = spin; this.r = r;
}
SoccerBall.prototype.at = function(x, y, rot, sc){ this.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(sc || 1).toFixed(3)})`); this.spin.setAttribute('transform', `rotate(${(rot || 0).toFixed(0)})`); };

// a fading streak behind a fast ball
function Trail(layer, col, w){ this.g = el('g', {}, layer); this.pts = []; this.p = el('path', {fill: col || '#fff', opacity: 0}, this.g); this.w = w || 10; }
Trail.prototype.push = function(x, y, on){ if (!on){ this.pts.length = 0; this.p.setAttribute('opacity', 0); return; }
  this.pts.push([x, y]); if (this.pts.length > 9) this.pts.shift(); if (this.pts.length < 3){ this.p.setAttribute('opacity', 0); return; }
  const L = [], R = [], n = this.pts.length;
  for (let i = 0; i < n; i++){ const a = this.pts[Math.max(0, i - 1)], b = this.pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = this.w * (i / (n - 1));
    L.push([this.pts[i][0] - dy / l * w, this.pts[i][1] + dx / l * w]); R.push([this.pts[i][0] + dy / l * w, this.pts[i][1] - dx / l * w]); }
  this.p.setAttribute('d', 'M' + L.map(f2).join('L') + 'L' + R.reverse().map(f2).join('L') + 'Z'); this.p.setAttribute('opacity', .55); };

// a starburst where a foot meets a ball, and a ring that spreads out from it
function Burst(layer, col){ this.g = el('g', {opacity: 0}, layer); let d = ''; for (let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2, r = i % 2 ? 12 : 30; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1); }
  el('path', {d: d + 'Z', fill: col || '#fff7c2', stroke:'#fff', 'stroke-width':2}, this.g); this.ring = el('circle', {r: 10, fill:'none', stroke:'#fff', 'stroke-width':4, opacity: 0}, layer); }
Burst.prototype.at = function(x, y, k){ if (k <= 0 || k >= 1){ this.g.setAttribute('opacity', 0); this.ring.setAttribute('opacity', 0); return; }
  this.g.setAttribute('opacity', (1 - k).toFixed(2)); this.g.setAttribute('transform', `translate(${x} ${y}) scale(${(.4 + easeO(k) * 1.3).toFixed(2)}) rotate(${(k * 40).toFixed(0)})`);
  this.ring.setAttribute('cx', x); this.ring.setAttribute('cy', y); this.ring.setAttribute('r', (8 + easeO(k) * 60).toFixed(1)); this.ring.setAttribute('opacity', ((1 - k) * .9).toFixed(2)); this.ring.setAttribute('stroke-width', (6 * (1 - k) + .5).toFixed(1)); };

// puffs of dust and grass
function Puffs(layer, col){ this.ps = []; this.layer = layer; this.col = col || '#d9f2c8'; }
Puffs.prototype.emit = function(x, y, n, spread){ for (let i = 0; i < n; i++){ const e = el('circle', {fill: i % 3 ? this.col : '#7ccf7f', opacity: 0}, this.layer);
  this.ps.push({e, x, y, vx: rnd(-1, 1) * (spread || 3), vy: rnd(-3.5, -1), r: rnd(2.5, 6), life: 0, max: rnd(22, 40)}); } };
Puffs.prototype.step = function(){ this.ps = this.ps.filter(p => { p.life++; p.x += p.vx; p.y += p.vy; p.vy += .18; p.vx *= .96; const k = p.life / p.max;
  if (k >= 1){ p.e.remove(); return false; } p.e.setAttribute('cx', p.x.toFixed(1)); p.e.setAttribute('cy', p.y.toFixed(1)); p.e.setAttribute('r', (p.r * (1 + k)).toFixed(1)); p.e.setAttribute('opacity', ((1 - k) * .8).toFixed(2)); return true; }); };

function Confetti(layer, n, o){ o = o || {}; this.ps = []; const cols = o.cols || ['#ffd23f', '#ff5d5d', '#2f6bff', '#13a35c', '#ffffff', '#b07cff', '#ff8a3d'];
  for (let i = 0; i < n; i++){ const c = cols[i % cols.length], shp = i % 4 === 0 ? el('circle', {r: rnd(3, 5), fill: c, opacity: 0}, layer) : i % 5 === 1 ? el('path', {d:'M-6,0 q3,-5 6,0 t6,0', stroke: c, 'stroke-width': 2.6, fill:'none', opacity: 0}, layer) : el('rect', {x: -4, y: -6, width: rnd(6, 10), height: rnd(10, 15), rx: 1.5, fill: c, opacity: 0}, layer);
    this.ps.push({e: shp, x: rnd(-20, W + 20), y: rnd(-160, -10), vx: rnd(-1.4, 1.4), vy: rnd(1.5, 4), r: rnd(0, 360), vr: rnd(-14, 14), sw: rnd(0, 6.3)}); } }
Confetti.prototype.step = function(on){ if (!on) return; this.ps.forEach(p => { p.vy = Math.min(p.vy + .25, 4.2); p.x += p.vx + Math.sin(p.sw += .11) * 1.3; p.vx *= .98; p.y += p.vy; p.r += p.vr;
  if (p.y > H + 30) return; p.e.setAttribute('opacity', 1); p.e.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.r.toFixed(0)}) scale(1 ${Math.cos(p.sw * 1.7).toFixed(2)})`); }); };

function Firework(layer, x, y, col){ this.g = el('g', {}, layer); this.x = x; this.y = y; this.rays = [];
  for (let i = 0; i < 26; i++){ const a = i / 26 * Math.PI * 2; this.rays.push({a, sp: rnd(.85, 1.1), e: el('path', {stroke: i % 4 ? col : '#ffffff', 'stroke-width': 3, 'stroke-linecap':'round', fill:'none'}, this.g)}); }
  this.core = el('circle', {cx: x, cy: y, r: 30, fill:'url(#chGlow)'}, this.g); this.g.setAttribute('opacity', 0); }
Firework.prototype.at = function(k){ if (k <= 0 || k >= 1){ this.g.setAttribute('opacity', 0); return; } const r = easeO(k) * 92, drop = k * k * 34;
  this.g.setAttribute('opacity', (1 - easeI(k)).toFixed(2)); this.core.setAttribute('opacity', Math.max(0, 1 - k * 4).toFixed(2));
  this.rays.forEach(p => { const r1 = r * p.sp, r0 = Math.max(0, r1 - 18 * (1 - k) - 3); p.e.setAttribute('d', `M${(this.x + Math.cos(p.a) * r0).toFixed(1)},${(this.y + Math.sin(p.a) * r0 + drop).toFixed(1)}L${(this.x + Math.cos(p.a) * r1).toFixed(1)},${(this.y + Math.sin(p.a) * r1 + drop).toFixed(1)}`); }); };

// rotating rays of light behind the big word
function Rays(layer, x, y, col){ this.g = el('g', {opacity: 0}, layer); let d = ''; for (let i = 0; i < 18; i++){ const a0 = i / 18 * Math.PI * 2, a1 = a0 + Math.PI / 30; d += `M0,0L${(Math.cos(a0) * 700).toFixed(0)},${(Math.sin(a0) * 700).toFixed(0)}L${(Math.cos(a1) * 700).toFixed(0)},${(Math.sin(a1) * 700).toFixed(0)}Z`; }
  el('path', {d, fill: col || '#fff6c4'}, this.g); this.x = x; this.y = y; }
Rays.prototype.at = function(k, t){ this.g.setAttribute('opacity', (clamp(k, 0, 1) * .16).toFixed(3)); this.g.setAttribute('transform', `translate(${this.x} ${this.y}) rotate(${(t * 14).toFixed(1)})`); };

// the big word: extruded, outlined, with a shine sweeping across it
function Banner(layer, text, y, size){ const g = el('g', {opacity: 0}, layer), font = '"Baloo 2", "Futura", "Arial Black", Impact, sans-serif';
  const T = at => { const t = el('text', Object.assign({x: 0, y: 0, 'text-anchor':'middle', 'dominant-baseline':'central', 'font-family': font, 'font-weight': 800, 'font-size': size, 'letter-spacing': 1}, at), g); t.textContent = text; return t; };
  for (let i = 8; i >= 1; i--) T({fill: '#5a1600', stroke:'#5a1600', 'stroke-width': 14, 'stroke-linejoin':'round', transform:`translate(0 ${i * 1.1})`});
  T({fill:'none', stroke: OUT, 'stroke-width': 15, 'stroke-linejoin':'round'});
  T({fill:'url(#chText)', stroke:'#fff', 'stroke-width': 4, 'paint-order':'stroke', 'stroke-linejoin':'round'});
  const clip = el('clipPath', {id: uid('tx')}, g); const ct = el('text', {x: 0, y: 0, 'text-anchor':'middle', 'dominant-baseline':'central', 'font-family': font, 'font-weight': 800, 'font-size': size, 'letter-spacing': 1}, clip); ct.textContent = text;
  const sg = el('g', {'clip-path': `url(#${clip.id})`}, g); this.shine = el('rect', {x: -60, y: -size, width: 90, height: size * 2, fill:'url(#chShine)', transform:'skewX(-24)'}, sg);
  this.g = g; this.y = y; }
Banner.prototype.at = function(k, t){ if (k <= 0){ this.g.setAttribute('opacity', 0); return; } const sc = k < 1 ? lerp(3.2, 1, back(k)) : 1 + Math.sin(t * 3) * .025;
  this.g.setAttribute('opacity', clamp(k * 4, 0, 1)); this.g.setAttribute('transform', `translate(${W / 2} ${this.y}) scale(${sc.toFixed(3)}) rotate(${(-3 + (k < 1 ? (1 - k) * 10 : Math.sin(t * 2))).toFixed(2)})`);
  this.shine.setAttribute('x', (((t * 520) % 1500) - 520).toFixed(0)); };

// ================================================================ the camera
// keys: [[time, x, y, zoom]], eased smoothly between
function Cam(keys){ this.keys = keys; }
Cam.prototype.at = function(t){ const K = this.keys; if (t <= K[0][0]) return K[0].slice(1); for (let i = 1; i < K.length; i++) if (t <= K[i][0]){ const a = K[i - 1], b = K[i], k = smooth(seg(t, a[0], b[0])); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)]; } return K[K.length - 1].slice(1); };
// real time -> scene time, so a scene can drop into slow motion and back. slow: [[real time, speed from then on]]
function warp(t, slow){ let tau = 0, prev = 0, sp = 1; for (const [at, s] of slow){ if (t <= at) return tau + (t - prev) * sp; tau += (at - prev) * sp; prev = at; sp = s; } return tau + (t - prev) * sp; }

// ================================================================ scene: run up, slow-motion strike, the net bulges
function sceneGoal(world, ui, look){
  const S = stadium(world), flashes = new Flashes(world, 26, 80, 270);
  const top = Math.random() < .55;
  const gx0 = 470, gx1 = 652, gyT = 236, gyB = 398, dx = 32, dy = -22;
  // pitch markings
  el('path', {d:`M${-M},${gyB + 2} L${W + M},${gyB + 2}`, stroke:'#fff', 'stroke-width':3, opacity:.85}, world);
  el('path', {d:`M${gx0 - 140},${gyB + 2} L${gx0 - 230},${H + M}`, stroke:'#fff', 'stroke-width':3.6, opacity:.8}, world);
  el('path', {d:`M${gx0 - 40},${gyB + 2} L${gx0 - 70},${gyB + 30} L${W + M},${gyB + 30}`, stroke:'#fff', 'stroke-width':3, fill:'none', opacity:.8}, world);
  el('path', {d:`M120,${H + M} C170,470 300,452 ${gx0 - 175},452`, stroke:'#fff', 'stroke-width':3.4, fill:'none', opacity:.7}, world);
  // the goal
  const goal = el('g', {}, world);
  el('path', {d:`M${gx0 - 6},${gyB + 6} L${gx1 + dx + 30},${gyB + dy * .2 + 6} L${gx1 + dx + 60},${gyB + 18} L${gx0 + 10},${gyB + 22} Z`, fill:'rgba(0,0,0,.2)'}, goal);
  el('path', {d:`M${gx0 + dx},${gyB + dy * .2} L${gx0 + dx},${gyT + dy} L${gx1 + dx},${gyT + dy} L${gx1 + dx},${gyB + dy * .2}`, fill:'none', stroke:'#b9c3d6', 'stroke-width':4, 'stroke-linejoin':'round'}, goal);
  const netG = el('g', {stroke:'#eef3fb', 'stroke-width':1.25, fill:'none', opacity:.9}, goal), lines = [], NX = 16, NY = 11;
  for (let i = 0; i <= NX; i++) lines.push({e: el('polyline', {}, netG), v: true, k: i / NX});
  for (let j = 0; j <= NY; j++) lines.push({e: el('polyline', {}, netG), v: false, k: j / NY});
  for (let i = 0; i <= 7; i++){ const k = i / 7; el('line', {x1: gx1 + dx * k, y1: gyT + dy * k, x2: gx1 + dx * k, y2: gyB + dy * .2 * k, stroke:'#eef3fb', 'stroke-width':1, opacity:.55}, goal);
    el('line', {x1: lerp(gx0, gx1, k), y1: gyT, x2: lerp(gx0, gx1, k) + dx, y2: gyT + dy, stroke:'#eef3fb', 'stroke-width':1, opacity:.5}, goal); }
  for (let j = 1; j <= 5; j++){ const k = j / 6; el('line', {x1: gx1, y1: lerp(gyT, gyB, k), x2: gx1 + dx, y2: lerp(gyT + dy, gyB + dy * .2, k), stroke:'#eef3fb', 'stroke-width':1, opacity:.5}, goal); }
  const BX = x => lerp(gx0 + dx, gx1 + dx, x), BY = y => lerp(gyT + dy, gyB + dy * .2, y);
  let bulge = null;
  const drawNet = t => lines.forEach(L => { let pts = ''; for (let q = 0; q <= 20; q++){ const u = q / 20, xk = L.v ? L.k : u, yk = L.v ? u : L.k; let x = BX(xk), y = BY(yk);
    if (bulge){ const ax = x - bulge.x, ay = y - bulge.y, dd = Math.hypot(ax, ay) || 1, age = t - bulge.t, fall = Math.exp(-(dd * dd) / 3200), env = Math.exp(-age * 2.2);
      const wob = Math.cos(age * 12) * env; x += ax / dd * fall * 18 * wob * .6 + fall * 14 * env; y += ay / dd * fall * 18 * wob * .6 - fall * 6 * env; }
    pts += x.toFixed(1) + ',' + y.toFixed(1) + ' '; } L.e.setAttribute('points', pts); });
  // keeper, then the front of the goal in front of the keeper
  const kLook = {kit:'#151827', trim:'#c6ff3d', shorts:'#151827', socks:'#151827', skin: pick(SKINS), hair: pick(HAIRS), style: pick(['short', 'curly', 'spiky']), num:'1', boot:'#c6ff3d'};
  const keeper = new Kid(el('g', {}, world), kLook, -1, .84, true);
  const fr = `M${gx0},${gyB + 3} L${gx0},${gyT} L${gx1},${gyT} L${gx1},${gyB + 3}`;
  el('path', {d: fr, fill:'none', stroke: OUT, 'stroke-width': 13, 'stroke-linejoin':'round'}, world);
  el('path', {d: fr, fill:'none', stroke:'#ffffff', 'stroke-width': 8.5, 'stroke-linejoin':'round'}, world);
  el('path', {d:`M${gx0 + 2.5},${gyB} L${gx0 + 2.5},${gyT + 2.5} L${gx1 + 2.5},${gyT + 2.5} L${gx1 + 2.5},${gyB}`, fill:'none', stroke:'#c3cbdb', 'stroke-width': 2.6, 'stroke-linejoin':'round'}, world);
  const puffs = new Puffs(el('g', {}, world));
  const kid = new Kid(el('g', {}, world), look, 1, 1.14);
  const ballL = el('g', {}, world), trail = new Trail(ballL, '#ffffff', 9), bshadow = el('ellipse', {fill:'rgba(0,0,0,.3)'}, ballL), ball = new SoccerBall(ballL, 13);
  const burst = new Burst(el('g', {}, world)), hit = new Burst(el('g', {}, world), '#ffffff');
  const kGround = gyB - 4, kStand = pose({x: 562, y: kGround - 62, tor:174, aF:64, eF:24, aB:-58, eB:-24, lF:16, kF:-30, lB:-16, kB:-30, head:8, face:0});
  const target = top ? {x: gx0 + 34, y: 262} : {x: gx0 + 42, y: 372}, impact = {x: target.x + dx * .75, y: target.y + dy * .55};
  const dive = top ? pose({x: 640, y: 350, tor:262, aF:228, eF:0, aB:214, eB:0, lF:-72, kF:-12, lB:-92, kB:-18, head:-4, face:2})
                   : pose({x: 612, y: 262, tor:230, aF:208, eF:0, aB:198, eB:0, lF:-30, kF:-12, lB:-46, kB:-22, head:14, face:2});
  const ground = 484, foot = 262, start = -40;
  const rays = new Rays(ui, W / 2, 120), banner = new Banner(ui, 'GOAL!', 118, 112), conf = new Confetti(ui, 80);
  const flash = el('rect', {x:0, y:0, width:W, height:H, fill:'#fff', opacity:0}, ui);
  const tk = 1.36, ti = 1.98; // scene time of contact, and of the ball reaching the net
  const cam = new Cam([[0, 330, 300, 1.08], [.9, 230, 360, 1.3], [1.28, 262, 400, 1.62], [1.4, 280, 380, 1.5], [1.98, impact.x, impact.y + 20, 1.75], [2.35, impact.x - 40, impact.y + 10, 1.5], [2.9, 300, 310, 1.22], [4.2, 360, 268, 1.06]]);
  const slow = [[1.12, .3], [1.62, .55], [1.9, 1]];
  let lastT = -1, lastPuff = 0;
  const run0 = t => run(t * 12.5, {x: lerp(start, foot - 66, Math.min(1, t)), y: ground - 84 - Math.abs(Math.sin(t * 12.5)) * 5});
  const wind = pose({x: foot - 50, y: ground - 86, tor:170, lF:-50, kF:-100, lB:8, kB:-14, aF:-62, eF:34, aB:74, eB:20, head:-6, face:0});
  const strike = pose({x: foot - 42, y: ground - 86, tor:192, lF:82, kF:-6, lB:10, kB:-14, aF:-84, eF:12, aB:98, eB:10, head:-2, face:0});
  const follow = pose({x: foot - 30, y: ground - 84, tor:186, lF:34, kF:-34, lB:-4, kB:-12, aF:-34, eF:40, aB:44, eB:40, head:6, face:2});
  // sounds are on the real clock; the strike lands at about 1.25s real, the net at about 2.1s
  const realOf = tau => { let lo = 0, hi = 10; for (let i = 0; i < 40; i++){ const m = (lo + hi) / 2; if (warp(m, slow) < tau) lo = m; else hi = m; } return lo; };
  return {dur: 6.8, sounds: [[realOf(tk) - .02, 'kick'], [realOf(ti) - .02, 'net'], [realOf(ti), 'roar', 4.4], [realOf(ti) + .15, 'whistle']], frame(rt){
    const t = warp(rt, slow), dt = lastT < 0 ? 0 : t - lastT; lastT = t;
    let P;
    if (t < 1.0) P = run0(t);
    else if (t < 1.25) P = mixPose(Object.assign(run0(1.0), {x: foot - 66}), wind, easeO(seg(t, 1.0, 1.25)));
    else if (t < 1.42) P = mixPose(wind, strike, easeIO(seg(t, 1.25, 1.42)));
    else if (t < 2.3) P = mixPose(strike, follow, easeO(seg(t, 1.42, 2.3)));
    else { const k = t - 2.3, j = Math.abs(Math.sin(k * 5.4)); P = pose({x: foot - 26 + Math.min(k, .5) * 40, y: ground - 84 - j * 46, tor:186, aF:126 + Math.sin(k * 10.8) * 12, eF:-20, aB:240 - Math.sin(k * 10.8) * 12, eB:18, lF:14 + j * 16, kF:-28 - j * 46, lB:-10 - j * 10, kB:-36 - j * 44, head:24, face:2}); }
    P.ground = ground - 8; kid.set(P);
    if (t < 1.0 && t - lastPuff > .16){ lastPuff = t; puffs.emit(P.x - 6, ground - 6, 3, 2); }
    // the ball
    let bx, by, br = 0, bs = 1, sx, sy, flying = false;
    if (t < tk){ bx = foot; by = ground - 13; sx = bx; sy = ground - 2; }
    else if (t < ti){ const u = seg(t, tk, ti), c = {x: (foot + target.x) / 2 + 20, y: top ? 130 : 360}; flying = true;
      bx = (1-u)*(1-u)*foot + 2*(1-u)*u*c.x + u*u*target.x; by = (1-u)*(1-u)*(ground - 13) + 2*(1-u)*u*c.y + u*u*target.y; br = u * 1100; bs = lerp(1, .78, u); sx = lerp(foot, target.x, u); sy = lerp(ground, gyB, u); }
    else { const k = t - ti, drop = clamp(k / .5, 0, 1); bx = lerp(target.x, impact.x, Math.min(1, k * 8)); by = lerp(lerp(target.y, impact.y, Math.min(1, k * 8)), gyB - 12, easeI(drop));
      if (drop >= 1){ const b2 = k - .5; by = gyB - 12 - Math.abs(Math.sin(b2 * 7)) * 20 * Math.exp(-b2 * 3); } br = 1100 + k * 160; bs = .76; sx = bx; sy = gyB; }
    ball.at(bx, by, br, bs); trail.push(bx, by, flying && t > tk + .02);
    bshadow.setAttribute('cx', sx.toFixed(1)); bshadow.setAttribute('cy', (sy + 3).toFixed(1)); bshadow.setAttribute('rx', (11 * bs).toFixed(1)); bshadow.setAttribute('ry', (3.6 * bs).toFixed(1));
    burst.at(foot + 6, ground - 14, seg(t, tk - .02, tk + .3));
    if (dt > 0 && t >= tk && t - dt < tk) puffs.emit(foot - 4, ground - 4, 10, 4);
    // the keeper
    let K;
    if (t < 1.25) K = Object.assign({}, kStand, {y: kStand.y + Math.abs(Math.sin(t * 7)) * 3, x: kStand.x + Math.sin(t * 3) * 6});
    else if (t < 1.85){ const k = easeO(seg(t, 1.25, 1.85)); K = mixPose(kStand, dive, k); K.y -= Math.sin(k * Math.PI) * (top ? 36 : 54); }
    else { const k = easeI(seg(t, 1.85, 2.25)); K = mixPose(dive, Object.assign({}, dive, {y: kGround - 30, x: dive.x + 10, tor: 264, lF:-86, lB:-98, face:1}), k); }
    K.ground = kGround; keeper.set(K);
    if (dt > 0 && t >= 2.25 && t - dt < 2.25) puffs.emit(dive.x + 16, kGround, 12, 4);
    if (t >= ti && !bulge) bulge = {x: impact.x, y: impact.y, t: ti};
    drawNet(t); hit.at(impact.x, impact.y, seg(t, ti, ti + .4)); puffs.step();
    const party = t >= ti ? clamp((t - ti) * 3, 0, 1) : 0;
    cheerCrowd(S.all, rt, party); flashes.at(rt, party); boardsGoal(S, rt, party > 0);
    flash.setAttribute('opacity', (t >= ti ? Math.max(0, .7 - (t - ti) * 2.6) : 0).toFixed(2));
    rays.at(seg(t, ti + .05, ti + .6), rt); banner.at(seg(t, ti + .05, ti + .6), rt); conf.step(t > ti + .1);
    // the camera follows the ball while it flies and shakes when the net bulges
    let [cx, cy, z] = cam.at(t);
    if (t > 1.42 && t < ti){ const k = smooth(seg(t, 1.42, 1.7)); cx = lerp(cx, bx, k * .7); cy = lerp(cy, by + 40, k * .5); }
    const sh = t >= ti ? Math.exp(-(t - ti) * 5) * 9 : 0;
    return {x: cx + Math.sin(rt * 61) * sh, y: cy + Math.cos(rt * 47) * sh, z};
  }};
}

// ================================================================ scene: the knee slide
function sceneSlide(world, ui, look){
  const S = stadium(world), flashes = new Flashes(world, 24, 80, 270);
  const g = el('g', {}, world);
  el('path', {d:'M600,320 L600,250 L742,250 L742,320', fill:'none', stroke: OUT, 'stroke-width':9, 'stroke-linejoin':'round'}, g);
  for (let i = 0; i <= 12; i++) el('line', {x1: 600 + i * 11.8, y1: 250, x2: 616 + i * 11.8, y2: 238, stroke:'#eef3fb', 'stroke-width':1, opacity:.6}, g);
  for (let i = 0; i <= 6; i++) el('line', {x1: 616, y1: 238 + i * 12, x2: 758, y2: 238 + i * 12, stroke:'#eef3fb', 'stroke-width':1, opacity:.6}, g);
  for (let i = 0; i <= 12; i++) el('line', {x1: 616 + i * 11.8, y1: 238, x2: 616 + i * 11.8, y2: 312, stroke:'#eef3fb', 'stroke-width':1, opacity:.6}, g);
  el('path', {d:'M600,320 L600,250 L742,250 L742,320', fill:'none', stroke:'#fff', 'stroke-width':5.5, 'stroke-linejoin':'round'}, g);
  new SoccerBall(g, 7).at(690, 308, 30);
  el('path', {d:`M${-M},420 L${W + M},420`, stroke:'#fff', 'stroke-width':3, opacity:.4}, world);
  const trail = el('path', {fill:'#145a26', opacity:0}, world), spray = el('g', {}, world), drops = [];
  for (let i = 0; i < 46; i++) drops.push({e: el('path', {d: i % 2 ? 'M0,-3 L1.5,3 L-1.5,3 Z' : circ(0, 0, rnd(1.6, 3.2)), fill: pick(['#4fb35b', '#2f8f3f', '#d6f5c7', '#ffffff']), opacity:0}, spray), t0: rnd(.95, 2.3), vx: rnd(-5.5, -1.5), vy: rnd(-6.5, -2), rot: rnd(0, 360)});
  const kid = new Kid(el('g', {}, world), look, 1, 1.2);
  const rays = new Rays(ui, W / 2, 110), banner = new Banner(ui, 'WHAT A GOAL!', 104, 82), conf = new Confetti(ui, 80);
  const gy = 470, sx = t => lerp(200, 520, easeO(seg(t, .95, 2.5)));
  const runP = t => run(t * 13, {x: lerp(-60, 160, t / .75), y: gy - 88 - Math.abs(Math.sin(t * 13)) * 5});
  const slideP = x => pose({x, y: gy - 50, tor:198, head:28, aF:140, eF:-18, aB:220, eB:18, lF:14, kF:-102, lB:4, kB:-106, fF:-12, fB:-12, face:2, ground: gy - 4});
  const cam = new Cam([[0, 260, 330, 1.15], [.9, 230, 360, 1.3], [2.5, 520, 360, 1.45], [3.4, 500, 330, 1.3], [4.6, 420, 300, 1.08]]);
  return {dur: 6.2, sounds: [[.95, 'slide'], [1.15, 'roar', 4.6], [1.6, 'whistle']], frame(t){
    let P;
    if (t < .75) P = runP(t);
    else if (t < .95){ const k = easeIO(seg(t, .75, .95)); P = mixPose(runP(.75), slideP(lerp(160, 200, k)), k); P.face = 2; }
    else { P = slideP(sx(t)); if (t > 2.5){ const k2 = t - 2.5, pump = Math.sin(k2 * 9); P.aF = 140 + pump * 16; P.aB = 220 - pump * 16; P.tor = 197 + Math.sin(k2 * 4.5) * 3; } }
    if (P.ground == null) P.ground = gy - 4; kid.set(P);
    const s2 = t > .95 ? sx(t) : null;
    trail.setAttribute('d', s2 ? `M196,${gy - 6} L${s2 - 24},${gy - 7} L${s2 - 24},${gy + 1} L196,${gy + 2} Z` : 'M0,0'); trail.setAttribute('opacity', s2 ? .4 : 0);
    drops.forEach(d => { const age = t - d.t0; if (age < 0 || age > .9){ d.e.setAttribute('opacity', 0); return; }
      const x0 = sx(d.t0) - 8; d.e.setAttribute('opacity', (1 - age).toFixed(2));
      d.e.setAttribute('transform', `translate(${(x0 + d.vx * age * 42).toFixed(1)} ${(gy - 4 + d.vy * age * 42 + age * age * 280).toFixed(1)}) rotate(${(d.rot + age * 400).toFixed(0)})`); });
    const party = clamp((t - .9) * 2, 0, 1); cheerCrowd(S.all, t, party); flashes.at(t, party); boardsGoal(S, t, party > 0);
    rays.at(seg(t, 1.5, 2.1), t); banner.at(seg(t, 1.5, 2.1), t); conf.step(t > 1.6);
    const [cx, cy, z] = cam.at(t); return {x: cx, y: cy, z};
  }};
}

// ================================================================ scene: lifting the trophy
function Trophy(layer){ const P = new Part(el('g', {}, layer), 2.4); this.g = P.g;
  P.shape('url(#chGold)', 'M-22,-46 C-46,-48 -44,-16 -16,-15 L-16,-21 C-34,-22 -36,-40 -22,-40 Z');
  P.shape('url(#chGold)', 'M22,-46 C46,-48 44,-16 16,-15 L16,-21 C34,-22 36,-40 22,-40 Z');
  P.shape('url(#chGold)', 'M-26,-56 L26,-56 C26,-26 15,-11 5,-7 L5,6 L-5,6 L-5,-7 C-15,-11 -26,-26 -26,-56 Z');
  P.shape('#ffe680', 'M-26,-56 C-26,-61 26,-61 26,-56 C26,-52 -26,-52 -26,-56 Z');
  P.shape('url(#chGold)', 'M-14,6 L14,6 L18,18 L-18,18 Z');
  P.shape('#5b3a1f', 'M-22,18 L22,18 L22,30 L-22,30 Z');
  P.detail({d:'M-15,22 L15,22 L15,26 L-15,26 Z', fill:'#ffd84a'});
  P.detail({d:'M-16,-50 C-16,-32 -10,-21 -3,-16', stroke:'#fffbe0', 'stroke-width':3.4, fill:'none', 'stroke-linecap':'round', opacity:.85});
  P.detail({d:'M0,-44 L3.4,-36.6 L11.4,-36.4 L5.2,-31.2 L7.4,-23.4 L0,-27.8 L-7.4,-23.4 L-5.2,-31.2 L-11.4,-36.4 L-3.4,-36.6 Z', fill:'#fff7c2', stroke:'#c98a00', 'stroke-width':1});
  this.glint = el('path', {d:'M0,-9 L2,-2 L9,0 L2,2 L0,9 L-2,2 L-9,0 L-2,-2 Z', fill:'#fff'}, P.g); }
function sceneTrophy(world, ui, look){
  const S = stadium(world), flashes = new Flashes(world, 30, 80, 270);
  const beams = [0, 1, 2, 3].map(() => el('path', {d:'M0,0 L-70,560 L70,560 Z', fill:'url(#chBeam)', opacity:.45}, world));
  const fwL = el('g', {}, world), fws = [[160, 110, '#ff5d5d', .45], [640, 90, '#ffd23f', .85], [400, 60, '#5cc2f2', 1.25], [250, 150, '#b07cff', 1.75], [560, 160, '#3ee07a', 2.25], [120, 70, '#ff8a3d', 2.85], [690, 140, '#ff7eb6', 3.3], [420, 120, '#ffd23f', 3.8], [300, 80, '#ffffff', 4.3]].map(f => ({fw: new Firework(fwL, f[0], f[1], f[2]), t: f[3]}));
  const pod = new Part(el('g', {}, world), 2.4);
  pod.shape('#c62a22', 'M228,436 L572,436 L590,470 L210,470 Z'); pod.shape('#8f1b15', 'M210,470 L590,470 L590,560 L210,560 Z');
  pod.shape('#ffd23f', 'M262,422 L538,422 L556,436 L244,436 Z');
  pod.detail({d:'M250,480 L550,480', stroke:'#ffd23f', 'stroke-width':3, opacity:.8});
  const tx = el('text', {x: 400, y: 503, fill:'#ffd23f', 'font-family':'"Baloo 2", "Futura", sans-serif', 'font-weight':800, 'font-size':20, 'text-anchor':'middle', 'letter-spacing':4}, pod.fi); tx.textContent = 'CHAMPION';
  const flames = [];
  [210, 590].forEach(x => { const g = el('g', {}, world); for (let i = 0; i < 9; i++) flames.push({x, e: el('path', {d:'M-9,0 C-9,-14 -3,-22 0,-34 C3,-22 9,-14 9,0 C9,6 -9,6 -9,0 Z', fill: i % 2 ? '#ffd23f' : '#ff7a1c', opacity:0}, g), ph: i / 9}); });
  const kidL = el('g', {}, world), kid = new Kid(kidL, look, 1, 1.22), tr = new Trophy(kidL);
  const rays = new Rays(ui, W / 2, 84, '#fff3b0'), banner = new Banner(ui, 'CHAMPION!', 62, 78), conf = new Confetti(ui, 110, {cols:['#ffd23f', '#fff3b0', '#ffb703', '#ffffff', '#ff5d5d', '#2f6bff']});
  const gy = 424;
  const cam = new Cam([[0, 400, 340, 1.45], [.8, 400, 300, 1.25], [2.2, 400, 250, 1.05], [5, 400, 236, 1]]);
  return {dur: 6.2, sounds: [[.05, 'fanfare'], [.3, 'roar', 5], [.45, 'pop'], [.85, 'pop'], [1.25, 'pop'], [1.75, 'pop'], [2.25, 'pop'], [2.85, 'pop'], [3.3, 'pop'], [3.8, 'pop']], frame(t){
    const hold = pose({x: 372, y: gy - 94, tor:178, head:24, aF:124, eF:-14, aB:118, eB:-8, lF:6, kF:-6, lB:-8, kB:-6, face:2, ground: gy});
    let P;
    if (t < .7) P = mixPose(pose({x: 372, y: gy - 80, tor:170, aF:40, eF:96, aB:30, eB:96, lF:30, kF:-60, lB:-14, kB:-50, head:-6, face:1, ground: gy}), hold, easeO(seg(t, 0, .7)));
    else { const k = t - .7, j = Math.max(0, Math.sin(k * 5)); P = Object.assign({}, hold, {y: gy - 94 - j * 44, lF: 6 + j * 24, kF: -6 - j * 50, lB: -8 - j * 8, kB: -6 - j * 50, aF: 124 + Math.sin(k * 5) * 6, aB: 118 + Math.sin(k * 5) * 6}); }
    kid.set(P);
    const hx = (kid.handF[0] + kid.handB[0]) / 2, hy = Math.min(kid.handF[1], kid.handB[1]);
    tr.g.setAttribute('transform', `translate(${(hx + 8).toFixed(1)} ${(hy + 4).toFixed(1)}) rotate(${(8 + Math.sin(t * 5) * 4).toFixed(1)}) scale(1.12)`);
    const gk = (t * 1.3) % 1; tr.glint.setAttribute('transform', `translate(${(-20 + gk * 40).toFixed(1)} ${(-50 + gk * 30).toFixed(1)}) scale(${(Math.sin(gk * Math.PI) * 1.2).toFixed(2)})`);
    beams.forEach((b, i) => b.setAttribute('transform', `translate(${120 + i * 190} -40) rotate(${(Math.sin(t * .9 + i * 1.7) * 26).toFixed(1)})`));
    fws.forEach(f => f.fw.at((t - f.t) / 1.2));
    flames.forEach(f => { const k = (t * 2.2 + f.ph) % 1, on = t > .3 && t < 3.5; f.e.setAttribute('opacity', on ? (1 - k).toFixed(2) : 0); f.e.setAttribute('transform', `translate(${(f.x + Math.sin(f.ph * 20 + t * 9) * 6).toFixed(1)} ${(436 - k * 120).toFixed(1)}) scale(${(1.4 - k * .8).toFixed(2)})`); });
    cheerCrowd(S.all, t, clamp(t * 2, 0, 1)); flashes.at(t, 1);
    rays.at(seg(t, .5, 1.1), t); banner.at(seg(t, .5, 1.1), t); conf.step(t > .35);
    const [cx, cy, z] = cam.at(t); return {x: cx, y: cy, z};
  }};
}

// ================================================================ scene: jump shot, swish
function sceneSwish(world, ui, look){
  el('rect', {x: -M, y: -M, width: W + 2 * M, height: H + 2 * M, fill:'url(#chArena)'}, world);
  for (let i = 0; i < 8; i++) el('circle', {cx: -20 + i * 120, cy: 14, r: 80, fill:'url(#chGlow)', opacity:.3}, world);
  const jb = new Part(el('g', {}, world), 2);
  jb.shape('#0b0b1a', 'M290,-6 L510,-6 L510,72 L290,72 Z'); jb.shape('#11163a', 'M298,2 L502,2 L502,64 L298,64 Z');
  const jt = el('text', {x: 400, y: 34, fill:'#ffd23f', 'font-family':'"Baloo 2", "Futura", sans-serif', 'font-weight':800, 'font-size':28, 'text-anchor':'middle', 'dominant-baseline':'central'}, jb.fi); jt.textContent = 'HOME 98 – 98 AWAY';
  el('rect', {x: -M, y: 62, width: W + 2 * M, height: 190, fill:'#1d1650'}, world);
  const blocks = crowd(world, 80, 6, 26, 5.2, '#241c5e', 64);
  world.appendChild(jb.g); // the scoreboard hangs in front of the crowd
  el('rect', {x: -M, y: 238, width: W + 2 * M, height: 24, fill:'#e8312a'}, world);
  const tb = el('text', {x: 400, y: 255, fill:'#fff', 'font-family':'"Baloo 2", "Futura", sans-serif', 'font-weight':800, 'font-size':15, 'text-anchor':'middle', 'letter-spacing':3}, world); tb.textContent = 'PAGE QUEST ARENA  •  READ  •  PLAY  •  WIN';
  const flashes = new Flashes(world, 22, 80, 230);
  el('path', {d:`M${-M},262 L${W + M},262 L${W + M},${H + M} L${-M},${H + M} Z`, fill:'url(#chWood)'}, world);
  for (let i = -10; i < 24; i++) el('line', {x1: 400 + (i * 42 - 400), y1: 262, x2: 400 + (i * 42 - 400) * 1.7, y2: H + M, stroke:'#a8642a', 'stroke-width':1, opacity:.35}, world);
  el('ellipse', {cx: 400, cy: 400, rx: 520, ry: 110, fill:'url(#chPool)'}, world);
  el('path', {d:`M${W + M},300 C640,300 560,360 578,420 C598,474 700,486 ${W + M},486`, fill:'none', stroke:'#fff', 'stroke-width':3.5, opacity:.85}, world);
  el('path', {d:`M${W + M},334 L690,334 L690,452 L${W + M},452`, fill:'#2459d8', opacity:.4, stroke:'#fff', 'stroke-width':3}, world);
  const hx = 676, hy = 214;
  const pole = new Part(el('g', {}, world), 2.2);
  pole.shape('#2a2d3e', 'M756,120 L772,120 L772,460 L756,460 Z'); pole.shape('#2a2d3e', 'M702,130 L772,130 L772,148 L718,148 Z');
  pole.shape('#eaf4ff', 'M696,112 L722,100 L722,236 L696,248 Z'); pole.detail({d:'M701,150 L716,143 L716,186 L701,193 Z', fill:'none', stroke:'#e8312a', 'stroke-width':2.6});
  pole.shape('#d9531b', `M${hx + 30},${hy - 2} L700,${hy - 6} L700,${hy + 2} L${hx + 30},${hy + 4} Z`);
  el('ellipse', {cx: hx, cy: hy, rx: 32, ry: 8, fill:'none', stroke:'#a8380d', 'stroke-width':4.5}, world);
  const netG = el('g', {stroke:'#fff', 'stroke-width':1.7, fill:'none'}, world), netV = [], netH = [];
  for (let i = 0; i <= 10; i++) netV.push(el('polyline', {}, netG)); for (let j = 1; j <= 3; j++) netH.push(el('polyline', {}, netG));
  const ballL = el('g', {}, world), trail = new Trail(ballL, '#ffd2a8', 11), bb = el('g', {}, ballL);
  el('circle', {r: 16.2, fill: OUT}, bb); el('circle', {r: 15, fill:'url(#chBball)'}, bb);
  el('path', {d:'M-15,0 L15,0 M0,-15 L0,15 M-10,-11 C-4,-4 -4,4 -10,11 M10,-11 C4,-4 4,4 10,11', stroke:'#3d1c06', 'stroke-width':1.5, fill:'none'}, bb);
  el('ellipse', {cx:-5, cy:-7, rx:4.5, ry:2.6, fill:'#fff', opacity:.55, transform:'rotate(-30 -5 -7)'}, bb);
  el('path', {d:`M${hx - 32},${hy} A32,8 0 0 0 ${hx + 32},${hy}`, fill:'none', stroke: OUT, 'stroke-width':7, 'stroke-linecap':'round'}, world);
  el('path', {d:`M${hx - 32},${hy} A32,8 0 0 0 ${hx + 32},${hy}`, fill:'none', stroke:'#ff6a26', 'stroke-width':4.4, 'stroke-linecap':'round'}, world);
  const kid = new Kid(el('g', {}, world), look, 1, 1.14), puffs = new Puffs(el('g', {}, world), '#f7d9b0');
  const rays = new Rays(ui, W / 2, 110), banner = new Banner(ui, 'SWISH!', 112, 112), conf = new Confetti(ui, 80);
  const flash = el('rect', {x:0, y:0, width:W, height:H, fill:'#fff', opacity:0}, ui);
  const gy = 472, sx0 = 250, tr0 = .8, ta = 1.95;
  const cam = new Cam([[0, 300, 360, 1.35], [.8, 300, 300, 1.25], [1.4, 500, 250, 1.15], [1.95, hx - 30, hy + 20, 1.6], [2.4, 520, 280, 1.3], [3.4, 400, 280, 1.06]]);
  const slow = [[1.55, .4], [2.15, 1]];
  const realOf = tau => { let lo = 0, hi = 10; for (let i = 0; i < 40; i++){ const m = (lo + hi) / 2; if (warp(m, slow) < tau) lo = m; else hi = m; } return lo; };
  let swish = null, last = -1;
  return {dur: 6.0, sounds: [[.2, 'bounce'], [.85, 'whoosh'], [realOf(ta + .12), 'swish'], [realOf(ta + .14), 'roar', 3.8], [realOf(ta + .3), 'chime']], frame(rt){
    const t = warp(rt, slow), dt = last < 0 ? 0 : t - last; last = t;
    let P;
    const set = pose({x: sx0, y: gy - 80, tor:174, aF:150, eF:-112, aB:140, eB:-102, lF:24, kF:-52, lB:-8, kB:-48, head:14, face:0, ground: gy});
    const up = pose({x: sx0 + 6, y: gy - 152, tor:184, aF:190, eF:-6, aB:178, eB:-12, lF:4, kF:-10, lB:-10, kB:-16, fF:30, fB:30, head:18, face:0, ground: gy});
    if (t < .5) P = mixPose(pose({x: sx0, y: gy - 86, tor:178, aF:40, eF:84, aB:30, eB:84, head:4, face:0, ground: gy}), set, easeO(t / .5));
    else if (t < tr0) P = mixPose(set, up, easeO(seg(t, .5, tr0)));
    else if (t < 1.3){ const k = seg(t, tr0, 1.3); P = Object.assign({}, up, {y: up.y + easeI(k) * 68, eF: Math.min(40, -6 + k * 80), aF: 190 - k * 34}); }
    else { const on = t > 2.2, j = on ? Math.abs(Math.sin((t - 2.2) * 5.4)) : 0; P = pose({x: sx0 + 6, y: gy - 82 - j * 40, tor:182, aF: on ? 128 : 156, eF: on ? -18 : 40, aB: on ? 238 : 140, eB: on ? 16 : -10, lF: 8 + j * 18, kF: -10 - j * 44, lB: -8, kB: -10 - j * 44, head: on ? 24 : 16, face: on ? 2 : 1, ground: gy}); }
    kid.set(P);
    if (dt > 0 && t >= 1.3 && t - dt < 1.3) puffs.emit(sx0 + 10, gy, 8, 3);
    let bx, by, rot = 0, fl = false;
    if (t < .5){ bx = sx0 + 30; by = gy - 24 - Math.abs(Math.cos(t * 9)) * 70; }
    else if (t < tr0){ bx = (kid.handF[0] + kid.handB[0]) / 2 + 6; by = Math.min(kid.handF[1], kid.handB[1]) - 14; }
    else if (t < ta){ const k = seg(t, tr0, ta), x0 = sx0 + 28, y0 = gy - 152 - 106; bx = lerp(x0, hx, k); by = lerp(y0, hy - 16, k) - Math.sin(k * Math.PI) * 130; rot = -k * 560; fl = true; }
    else { const k = t - ta; by = hy - 16 + k * 360 + k * k * 420; if (by > gy - 16){ const b = k - .32; by = gy - 16 - Math.abs(Math.sin(b * 8)) * 64 * Math.exp(-b * 2.6); } bx = hx + 2 + k * 34; rot = -560 - k * 220; }
    bb.setAttribute('transform', `translate(${bx.toFixed(1)} ${by.toFixed(1)}) rotate(${rot.toFixed(0)})`); trail.push(bx, by, fl && t > tr0 + .05);
    if (t >= ta + .12 && !swish) swish = t;
    const sw = swish ? Math.exp(-(t - swish) * 4) * Math.sin((t - swish) * 18) : 0, stretch = swish ? Math.exp(-(t - swish) * 5) * 18 : 0;
    const top = i => [hx + Math.cos(i / 10 * Math.PI + Math.PI) * 32, hy + Math.sin(i / 10 * Math.PI) * 7], bot = (i, len) => [hx + Math.cos(i / 10 * Math.PI + Math.PI) * (17 + sw * 4) + sw * 6, hy + len + Math.sin(i / 10 * Math.PI) * 3];
    netV.forEach((e, i) => { const a = top(i), b = bot(i, 52 + stretch), m = [lerp(a[0], b[0], .5) + sw * 5 * (i % 2 ? 1 : -1), lerp(a[1], b[1], .5)]; e.setAttribute('points', `${f2(a)} ${f2(m)} ${f2(b)}`); });
    netH.forEach((e, j) => { const k = (j + 1) / 4, pts = []; for (let i = 0; i <= 10; i++){ const a = top(i), b = bot(i, 52 + stretch); pts.push(f2([lerp(a[0], b[0], k), lerp(a[1], b[1], k)])); } e.setAttribute('points', pts.join(' ')); });
    if (swish && jt.textContent !== 'HOME 100 – 98 AWAY') jt.textContent = 'HOME 100 – 98 AWAY';
    puffs.step();
    const party = swish ? clamp((t - swish) * 3, 0, 1) : 0;
    cheerCrowd(blocks, rt, party); flashes.at(rt, party);
    flash.setAttribute('opacity', (swish ? Math.max(0, .5 - (t - swish) * 2.4) : 0).toFixed(2));
    rays.at(seg(t, ta + .15, ta + .7), rt); banner.at(seg(t, ta + .15, ta + .7), rt); conf.step(t > ta + .2);
    let [cx, cy, z] = cam.at(t); if (fl){ const k = smooth(seg(t, tr0, tr0 + .3)); cx = lerp(cx, bx, k * .5); cy = lerp(cy, by + 60, k * .4); }
    const shk = swish ? Math.exp(-(t - swish) * 6) * 5 : 0;
    return {x: cx + Math.sin(rt * 57) * shk, y: cy + Math.cos(rt * 43) * shk, z};
  }};
}

const SCENES = {goal: sceneGoal, slide: sceneSlide, trophy: sceneTrophy, swish: sceneSwish};

// ================================================================ the pop-up
const CSS = `.cheer-ov{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(5,9,26,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:chFade .25s ease-out}
.cheer-card{position:relative;width:min(780px,100%);border-radius:30px;overflow:hidden;background:#0a1233;box-shadow:0 30px 70px rgba(0,0,0,.55),0 0 0 3px #ffd23f,0 0 0 7px rgba(255,210,63,.25);animation:chPop .5s cubic-bezier(.2,1.35,.4,1)}
.cheer-card svg{display:block;width:100%;height:auto;aspect-ratio:8/5;background:#0a1233}
.cheer-cap{display:flex;align-items:center;gap:14px;padding:14px 18px 16px;background:linear-gradient(180deg,#1c2c70,#0f1844);color:#fff;border-top:2px solid rgba(255,210,63,.55)}
.cheer-cap b{display:block;font-family:var(--display,system-ui);font-size:1.5rem;line-height:1.15;letter-spacing:.2px}
.cheer-cap span{display:block;opacity:.88;font-size:1rem;margin-top:3px}
.cheer-cap div{flex:1;min-width:0;animation:chUp .5s .9s both}
.cheer-cap button{flex:0 0 auto;border:0;border-radius:999px;padding:12px 22px;font:inherit;font-family:var(--display,system-ui);font-weight:800;font-size:1.1rem;background:linear-gradient(180deg,#ffe36a,#ffc61a);color:#3a2600;box-shadow:0 4px 0 #b88a00,0 8px 18px rgba(0,0,0,.35);cursor:pointer}
.cheer-snd{position:absolute;top:10px;right:10px;width:42px;height:42px;border-radius:50%;border:0;background:rgba(0,0,0,.38);color:#fff;font-size:1.15rem;cursor:pointer;z-index:2}
@keyframes chFade{from{opacity:0}}@keyframes chPop{from{transform:scale(.55) rotate(-4deg);opacity:0}}@keyframes chUp{from{transform:translateY(12px);opacity:0}}
@media (max-width:520px){.cheer-cap{padding:12px 14px 14px}.cheer-cap b{font-size:1.15rem}.cheer-cap span{font-size:.9rem}.cheer-cap button{padding:10px 16px;font-size:1rem}}`;
let open = null;
function build(kind, o){
  const svg = el('svg', {viewBox:`0 0 ${W} ${H}`, 'aria-hidden':'true'}); defs(svg);
  const camG = el('g', {}, svg), world = el('g', {}, camG), ui = el('g', {});
  el('rect', {x:0, y:0, width:W, height:H, fill:'url(#chVig)', 'pointer-events':'none'}, svg);
  svg.appendChild(ui);
  const sc = (SCENES[kind] || sceneGoal)(world, ui, lookOf(o.look));
  const frame = t => { const c = sc.frame(t) || {x: W / 2, y: H / 2, z: 1}; const z = Math.max(1, c.z || 1), hw = W / 2 / z, hh = H / 2 / z;
    const x = clamp(c.x, hw - M * .9, W - hw + M * .9), y = clamp(c.y, hh - M * .9, H - hh + M * .9);
    camG.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${z.toFixed(4)}) translate(${(-x).toFixed(2)} ${(-y).toFixed(2)})`); };
  return {svg, sc, frame};
}
function play(kind, o){
  o = o || {};
  if (open) return false; // one at a time; the first one wins
  if (!document.getElementById('cheerCss')){ const st = document.createElement('style'); st.id = 'cheerCss'; st.textContent = CSS; document.head.appendChild(st); }
  const ov = document.createElement('div'); ov.className = 'cheer-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', o.title || 'Celebration');
  const card = document.createElement('div'); card.className = 'cheer-card'; ov.appendChild(card);
  const B = build(kind, o); card.appendChild(B.svg);
  SND.on = o.sound !== false;
  const snd = document.createElement('button'); snd.type = 'button'; snd.className = 'cheer-snd'; snd.setAttribute('aria-label', 'Sound on or off'); snd.textContent = SND.on ? '🔊' : '🔇';
  snd.addEventListener('click', e => { e.stopPropagation(); SND.on = !SND.on; snd.textContent = SND.on ? '🔊' : '🔇'; if (o.onSound) o.onSound(SND.on); });
  card.appendChild(snd);
  const cap = document.createElement('div'); cap.className = 'cheer-cap';
  const tx = document.createElement('div'); const b = document.createElement('b'); b.textContent = o.title || 'Great job!'; const sp = document.createElement('span'); sp.textContent = o.sub || ''; tx.append(b, sp);
  const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = o.button || 'Keep going ▶';
  cap.append(tx, btn); card.appendChild(cap);
  document.body.appendChild(ov);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sounds = (B.sc.sounds || []).slice().sort((a, b) => a[0] - b[0]);
  let t0 = null, raf = 0, done = false, si = 0;
  const close = () => { if (done) return; done = true; cancelAnimationFrame(raf); clearTimeout(auto); ov.style.transition = 'opacity .22s'; ov.style.opacity = '0'; setTimeout(() => { ov.remove(); open = null; if (o.onClose) o.onClose(); }, 220); };
  const step = now => { if (done) return; if (t0 == null) t0 = now; const t = Math.min((now - t0) / 1000, B.sc.dur + 30);
    while (si < sounds.length && sounds[si][0] <= t){ const s = sounds[si++]; playSfx(s[1], 0, s[2]); }
    try { B.frame(t); } catch (e) { close(); return; } raf = requestAnimationFrame(step); };
  if (o.at != null){ for (let q = 0; q <= o.at; q += 1 / 60) B.frame(q); }
  else if (still){ for (let q = 0; q <= B.sc.dur - .5; q += 1 / 30) B.frame(q); }
  else raf = requestAnimationFrame(step);
  ov.addEventListener('click', e => { if (e.target === snd) return; close(); }); btn.focus({preventScroll: true});
  const auto = setTimeout(close, (o.hold || 10) * 1000);
  open = {close};
  return true;
}
// for the "My player" picker: draw a still kid in a small svg
function portrait(o, size){
  const svg = el('svg', {viewBox:'0 0 160 200', width: size || 120, height: (size || 120) * 1.25, 'aria-hidden':'true'}); defs(svg);
  el('circle', {cx:80, cy:104, r:76, fill:'#e6efff'}, svg);
  el('ellipse', {cx:80, cy:186, rx:60, ry:9, fill:'#cfe0ff'}, svg);
  const k = new Kid(el('g', {}, svg), lookOf(o), 1, .98); k.set(pose({x: 72, y: 114, tor:182, head:8, aF:-24, eF:40, aB:28, eB:30, lF:10, kF:-8, lB:-8, kB:-6, face:1, ground: 184}));
  new SoccerBall(svg, 10).at(118, 177, 20);
  return svg;
}
window.Cheer = {play, portrait, KITS, SKINS, HAIRS, STYLES, isOpen: () => !!open, close: () => open && open.close()};
})();
