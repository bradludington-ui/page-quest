// Brain Break game: Ring Toss. Self-contained: canvas + DOM overlay, no images or libraries.
// A night-time fair booth seen in perspective: flick a ring; it flies in an arc and rings a bottle neck, clinks off, or misses.
(function(){
  'use strict';
  window.BreakGames = window.BreakGames || {};
  // ---------- Brain Break frame: the shared glass HUD, title card, result card and game-feel helpers ----------
  function bbFrame(el, api){
    const RM = !!api.reducedMotion, HF = "'Baloo 2','Trebuchet MS',system-ui,sans-serif", TF = "Lexend,Verdana,system-ui,sans-serif";
    const EMO = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';
    const st = document.createElement('style');
    st.textContent = `
.bbf-ov{position:absolute;inset:0;z-index:30;display:none;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;touch-action:none;
  background:radial-gradient(ellipse at 50% 38%,rgba(15,23,42,.30),rgba(15,23,42,.74));font-family:${TF};-webkit-user-select:none;user-select:none}
.bbf-ov.on{display:flex}
.bbf-card{position:relative;width:min(500px,100%);max-height:100%;overflow:auto;box-sizing:border-box;padding:24px 22px 22px;border-radius:30px;color:#fff;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:12px;background:linear-gradient(180deg,rgba(36,48,86,.93),rgba(15,23,42,.95));
  border:1px solid rgba(255,255,255,.15);box-shadow:0 26px 70px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.14)}
.bbf-card.bbf-up{animation:bbfUp .55s cubic-bezier(.2,1.3,.4,1) both}
.bbf-card.bbf-pop{animation:bbfPop .45s cubic-bezier(.2,1.4,.4,1) both}
.bbf-icon{width:96px;height:96px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:60px/1 ${EMO};
  background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.35),rgba(255,255,255,.06) 60%);box-shadow:0 0 0 1px rgba(255,255,255,.15),0 0 40px rgba(255,214,90,.35);animation:bbfBob 2.6s ease-in-out infinite}
.bbf-title{font:800 46px/1 ${HF};letter-spacing:.5px;text-shadow:0 3px 0 rgba(0,0,0,.35),0 0 24px rgba(255,214,90,.35);margin-top:2px}
.bbf-how{display:flex;align-items:center;gap:10px;font:500 17px/1.3 ${TF};color:rgba(255,255,255,.88);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:8px 14px}
.bbf-how b{font:28px/1 ${EMO}}
.bbf-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;width:100%}
.bbf-chip{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:4px 14px;border-radius:999px;background:rgba(15,23,42,.55);border:1px solid rgba(255,255,255,.15);font:700 18px ${HF};color:#fff}
.bbf-chip i{font:normal 22px/1 ${EMO}}
.bbf-av{width:52px;height:52px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font:32px/1 ${EMO};background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.3)}
.bbf-choice{flex:1 1 150px;max-width:210px;min-height:96px;border-radius:22px;cursor:pointer;color:#fff;font:800 21px/1.15 ${HF};padding:10px 8px;
  background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.18);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;transition:transform .15s,background .15s,border-color .15s}
.bbf-choice span{font:40px/1 ${EMO}}
.bbf-choice small{font:500 13px ${TF};color:rgba(255,255,255,.7)}
.bbf-choice.sel{background:linear-gradient(180deg,rgba(255,206,74,.28),rgba(255,160,40,.16));border-color:#ffcf4a;box-shadow:0 0 22px rgba(255,200,60,.35);transform:translateY(-2px)}
.bbf-seg{display:flex;gap:6px;padding:5px;border-radius:999px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12)}
.bbf-seg button{min-height:48px;min-width:84px;border-radius:999px;border:0;cursor:pointer;background:transparent;color:rgba(255,255,255,.8);font:700 18px ${HF}}
.bbf-seg button.sel{background:#fff;color:#1e293b;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.bbf-play{min-height:68px;min-width:min(300px,100%);padding:8px 34px;border-radius:999px;border:0;cursor:pointer;font:800 30px ${HF};color:#3a2200;
  background:linear-gradient(180deg,#ffe27a,#ffb21f 55%,#f59a0b);box-shadow:0 6px 0 #b86a00,0 12px 26px rgba(255,170,30,.45),inset 0 2px 0 rgba(255,255,255,.6);animation:bbfPulse 1.6s ease-in-out infinite}
.bbf-play:active{transform:translateY(4px);box-shadow:0 2px 0 #b86a00,0 6px 14px rgba(255,170,30,.4)}
.bbf-sec{min-height:52px;padding:6px 22px;border-radius:999px;cursor:pointer;font:700 20px ${HF};color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25)}
.bbf-big{font:800 72px/1 ${HF};text-shadow:0 4px 0 rgba(0,0,0,.35),0 0 30px rgba(255,214,90,.45);color:#ffe27a}
.bbf-unit{font:600 15px ${TF};color:rgba(255,255,255,.7);margin-top:-6px}
.bbf-head{font:800 34px/1.1 ${HF};text-shadow:0 3px 0 rgba(0,0,0,.35)}
.bbf-stars{display:flex;gap:10px;justify-content:center}
.bbf-stars b{font:46px/1 ${EMO};filter:grayscale(1) brightness(.45);opacity:.6}
.bbf-stars b.on{filter:none;opacity:1;animation:bbfStar .5s cubic-bezier(.2,1.6,.4,1) both}
.bbf-ribbon{position:absolute;top:16px;right:-38px;transform:rotate(35deg);background:linear-gradient(90deg,#ff5a7a,#ff9a3c);color:#fff;font:800 15px ${HF};padding:5px 44px;box-shadow:0 4px 12px rgba(0,0,0,.35)}
.bbf-new{font:800 24px ${HF};color:#7dffb0;text-shadow:0 0 18px rgba(80,255,150,.5)}
.bbf-note{font:500 15px/1.35 ${TF};color:rgba(255,255,255,.75)}
.bbf-rm *{animation:none!important;transition:none!important}
@keyframes bbfUp{from{transform:translateY(80px) scale(.94);opacity:0}to{transform:none;opacity:1}}
@keyframes bbfPop{from{transform:scale(.85);opacity:0}to{transform:none;opacity:1}}
@keyframes bbfBob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-6px) rotate(4deg)}}
@keyframes bbfPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes bbfStar{from{transform:scale(0) rotate(-60deg);opacity:0}to{transform:none;opacity:1}}`;
    el.appendChild(st);
    const ov = document.createElement('div'); ov.className = 'bbf-ov' + (RM ? ' bbf-rm' : ''); el.appendChild(ov);
    let H = {}, count = null;
    const onClick = e => {
      const b = e.target.closest('[data-bbf]'); if (!b) return; e.preventDefault();
      const k = b.dataset.bbf, v = b.dataset.v;
      if (k === 'pick' && H.onPick){ H.onPick(v); return; }
      if (k === 'seg' && H.onSeg){ H.onSeg(v); return; }
      if (k === 'play' && H.onPlay){ H.onPlay(); return; }
      if (k === 'btn' && H.onBtn){ H.onBtn(v); return; }
    };
    ov.addEventListener('click', onClick);
    const F = {RM, HF, TF, EMO, esc, ov};
    F.isOpen = () => ov.classList.contains('on');
    F.hide = () => { ov.classList.remove('on'); ov.innerHTML = ''; ov.style.padding = ''; count = null; H = {}; };
    // any card in the shared style (o: {onPlay, onBtn}); raw = full-bleed panel without the card
    F.card = (html, o, raw) => { H = o || {}; count = null; ov.style.padding = raw ? '0' : ''; ov.innerHTML = raw ? html : `<div class="bbf-card bbf-pop">${html}</div>`; ov.classList.add('on'); };
    // o: {icon, title, how, howIcon, best, bestUnit, choices:[{id,icon,label,sub}], choice, seg:{options:[{id,label}], value}, buttons:[{id,label}], note, onPick, onSeg, onPlay, onBtn}
    F.title = o => {
      H = o; count = null;
      const bestChip = o.best != null ? `<span class="bbf-chip"><i>🏆</i>Best ${esc(o.best)}${o.bestUnit ? ' ' + esc(o.bestUnit) : ''}</span>` : `<span class="bbf-chip"><i>✨</i>First game!</span>`;
      ov.innerHTML = `<div class="bbf-card bbf-pop">
        <div class="bbf-icon">${o.icon}</div>
        <div class="bbf-title">${esc(o.title)}</div>
        <div class="bbf-how"><b>${o.howIcon || '👆'}</b><span>${esc(o.how)}</span></div>
        <div class="bbf-row"><span class="bbf-av">${esc(api.avatar || '🙂')}</span>${bestChip}</div>
        ${o.choices ? `<div class="bbf-row">${o.choices.map(c => `<button class="bbf-choice${c.id === o.choice ? ' sel' : ''}" data-bbf="pick" data-v="${esc(c.id)}"><span>${c.icon}</span>${esc(c.label)}${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</button>`).join('')}</div>` : ''}
        ${o.seg ? `<div class="bbf-seg">${o.seg.options.map(s => `<button data-bbf="seg" data-v="${esc(s.id)}" class="${s.id === o.seg.value ? 'sel' : ''}">${esc(s.label)}</button>`).join('')}</div>` : ''}
        <button class="bbf-play" data-bbf="play">▶ Play</button>
        ${o.buttons ? `<div class="bbf-row">${o.buttons.map(b => `<button class="bbf-sec" data-bbf="btn" data-v="${esc(b.id)}">${b.label}</button>`).join('')}</div>` : ''}
        ${o.note ? `<div class="bbf-note">${o.note}</div>` : ''}</div>`;
      ov.classList.add('on');
    };
    // o: {head, score, unit, stars (0-3), best, isBest, lines:[html], buttons:[{id,label}], again ('Play again'), onPlay, onBtn, noScore}
    F.end = o => {
      H = o;
      const st3 = [0, 1, 2].map(i => `<b class="${i < (o.stars || 0) ? 'on' : ''}" style="animation-delay:${0.45 + i*0.22}s">⭐</b>`).join('');
      ov.innerHTML = `<div class="bbf-card bbf-up">
        ${o.isBest ? '<div class="bbf-ribbon">🏆 NEW BEST</div>' : ''}
        <div class="bbf-head">${o.head}</div>
        ${o.noScore ? '' : `<div class="bbf-big" data-count>0</div>${o.unit ? `<div class="bbf-unit">${esc(o.unit)}</div>` : ''}`}
        ${o.stars != null ? `<div class="bbf-stars">${st3}</div>` : ''}
        ${o.isBest ? '<div class="bbf-new">🏆 New best!</div>' : o.best != null ? `<span class="bbf-chip"><i>🏆</i>Best ${esc(o.best)}</span>` : ''}
        ${(o.lines || []).map(l => `<div class="bbf-note">${l}</div>`).join('')}
        <button class="bbf-play" data-bbf="play">▶ ${esc(o.again || 'Play again')}</button>
        ${o.buttons ? `<div class="bbf-row">${o.buttons.map(b => `<button class="bbf-sec" data-bbf="btn" data-v="${esc(b.id)}">${b.label}</button>`).join('')}</div>` : ''}</div>`;
      ov.classList.add('on');
      const n = ov.querySelector('[data-count]');
      if (n){ const to = Number(o.score) || 0; if (RM || !isFinite(to)){ n.textContent = String(o.score); } else count = {n, to, t: 0, dur: Math.min(1.4, 0.5 + Math.abs(to)/120), delay: 0.25}; }
    };
    // ---- canvas FX: particles, fly-to-HUD pops, callouts, shake, flash, hit pause ----
    const MAXP = 150, parts = [], flies = [], pills = {}, bumps = {};
    let shake = 0, flash = 0, flashCol = '255,255,255', pause = 0, call = null;
    F.burst = (x, y, o) => {
      o = o || {}; const n = o.n || 12;
      for (let i = 0; i < n; i++){
        if (parts.length >= MAXP) parts.shift();
        const a = o.dir != null ? o.dir + (Math.random() - 0.5)*(o.spread || 1.2) : Math.random()*6.283, v = (o.speed || 220)*(0.35 + Math.random()*0.75);
        parts.push({x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, life: (o.life || 0.7)*(0.6 + Math.random()*0.6), max: 0, s: (o.size || 4)*(0.6 + Math.random()*0.8), col: Array.isArray(o.color) ? o.color[i % o.color.length] : (o.color || '#fff'), g: o.grav || 0, drag: o.drag == null ? 2.2 : o.drag, glow: !!o.glow, kind: o.kind || 'dot', rot: Math.random()*6, vr: (Math.random() - 0.5)*10});
        parts[parts.length - 1].max = parts[parts.length - 1].life;
      }
    };
    F.shake = a => { if (!RM) shake = Math.max(shake, a); };
    F.flash = (a, rgb) => { if (!RM){ flash = Math.max(flash, a); flashCol = rgb || '255,255,255'; } };
    F.hitPause = s => { if (!RM) pause = Math.max(pause, s); };
    F.paused = () => pause > 0;
    F.callout = (text, color, size, life) => { call = {text, color: color || '#ffe27a', size: size || 64, t: 0, life: life || 1.2}; };
    F.bump = k => { bumps[k] = 1; };
    F.fly = (text, x, y, key, color) => { flies.push({text, x, y, sx: x, sy: y, key, color: color || '#ffe27a', t: 0}); if (flies.length > 12) flies.shift(); };
    F.shakeXY = () => shake > 0 ? {x: (Math.random() - 0.5)*28*shake, y: (Math.random() - 0.5)*28*shake} : {x: 0, y: 0};
    F.tick = dt => {
      shake = Math.max(0, shake - dt*1.8); flash = Math.max(0, flash - dt*2.6); pause = Math.max(0, pause - dt);
      for (const k in bumps){ bumps[k] = Math.max(0, bumps[k] - dt*4); }
      for (let i = parts.length - 1; i >= 0; i--){ const p = parts[i]; p.life -= dt; if (p.life <= 0){ parts.splice(i, 1); continue; }
        const f = Math.exp(-p.drag*dt); p.vx *= f; p.vy = p.vy*f + p.g*dt; p.x += p.vx*dt; p.y += p.vy*dt; p.rot += p.vr*dt; }
      for (let i = flies.length - 1; i >= 0; i--){ const q = flies[i]; q.t += dt/0.8; if (q.t >= 1){ if (q.key) F.bump(q.key); flies.splice(i, 1); } }
      if (call){ call.t += dt; if (call.t > call.life) call = null; }
      if (count){ count.t += dt; const k = Math.max(0, Math.min(1, (count.t - count.delay)/count.dur)), e = 1 - Math.pow(1 - k, 3); count.n.textContent = String(Math.round(count.to*e)); if (k >= 1) count = null; }
    };
    const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
    F.rr = rr;
    F.drawParts = c => {
      for (const p of parts){
        const a = Math.max(0, Math.min(1, p.life/p.max*1.4));
        c.globalAlpha = a;
        if (p.glow) c.globalCompositeOperation = 'lighter';
        c.fillStyle = p.col;
        if (p.kind === 'spark'){ c.strokeStyle = p.col; c.lineWidth = p.s*0.6; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx*0.04, p.y - p.vy*0.04); c.stroke(); }
        else if (p.kind === 'confetti'){ c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillRect(-p.s, -p.s*0.45, p.s*2, p.s*0.9); c.restore(); }
        else if (p.kind === 'ring'){ c.strokeStyle = p.col; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, p.s*(1.6 - a)*3, 0, 6.283); c.stroke(); }
        else { c.beginPath(); c.arc(p.x, p.y, p.s*(0.4 + a*0.6), 0, 6.283); c.fill(); }
        c.globalCompositeOperation = 'source-over';
      }
      c.globalAlpha = 1;
    };
    // a glass HUD pill. o: {key, icon, label, value, align:'left'|'right'|'center', h, accent}
    F.pill = (c, x, y, o) => {
      const h = o.h || 48, b = 1 + (bumps[o.key] || 0)*0.18, val = String(o.value);
      c.font = `800 ${Math.round(h*0.5)}px ${HF}`; const vw = c.measureText(val).width;
      c.font = `700 ${Math.round(h*0.24)}px ${TF}`; const lw = o.label ? c.measureText(o.label).width : 0;
      const iw = o.icon ? h*0.62 : 0, w = Math.round(14 + iw + Math.max(vw, lw) + 16);
      const left = o.align === 'right' ? x - w : o.align === 'center' ? x - w/2 : x;
      pills[o.key] = {x: left + w/2, y: y + h/2};
      c.save(); c.translate(left + w/2, y + h/2); c.scale(b, b); c.translate(-w/2, -h/2);
      rr(c, 0, 0, w, h, h/2); c.fillStyle = 'rgba(15,23,42,.55)'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(255,255,255,.15)'; c.stroke();
      if (o.accent){ c.fillStyle = o.accent; rr(c, 5, h*0.28, 4, h*0.44, 2); c.fill(); }
      c.textBaseline = 'middle'; c.textAlign = 'left';
      if (o.icon){ c.font = `${Math.round(h*0.46)}px ${EMO}`; c.fillStyle = '#fff'; c.fillText(o.icon, 13, h/2 + 1); }
      const tx = 14 + iw;
      if (o.label){ c.font = `700 ${Math.round(h*0.22)}px ${TF}`; c.fillStyle = 'rgba(255,255,255,.72)'; c.fillText(o.label.toUpperCase(), tx, h*0.27); c.font = `800 ${Math.round(h*0.48)}px ${HF}`; c.fillStyle = '#fff'; c.fillText(val, tx, h*0.64); }
      else { c.font = `800 ${Math.round(h*0.5)}px ${HF}`; c.fillStyle = '#fff'; c.fillText(val, tx, h/2 + 2); }
      c.restore();
      return w;
    };
    F.text = (c, s, x, y, size, color, o) => {
      o = o || {}; c.font = `800 ${size}px ${HF}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
      c.lineWidth = Math.max(3, size/6); c.strokeStyle = o.stroke || 'rgba(10,15,35,.85)'; c.strokeText(s, x, y);
      if (o.glow && !RM){ c.shadowColor = o.glow; c.shadowBlur = size*0.3; }
      c.fillStyle = color; c.fillText(s, x, y); c.shadowBlur = 0;
    };
    // draws fly-to-HUD pops, the callout, and the flash. cxW/cyH: the area to centre the callout and flash on.
    F.drawFx = (c, W, Hh, cy) => {
      for (const q of flies){
        const tgt = q.key && pills[q.key], e = q.t < 0.25 ? 0 : (q.t - 0.25)/0.75, k = e*e*(3 - 2*e);
        const x = tgt ? q.sx + (tgt.x - q.sx)*k : q.sx, y = tgt ? q.sy + (tgt.y - q.sy)*k - Math.sin(k*Math.PI)*40 : q.sy - q.t*60;
        const s = (q.t < 0.25 ? 0.6 + q.t*2.4 : 1.2 - k*0.5);
        c.globalAlpha = tgt ? 1 : Math.max(0, 1 - q.t);
        F.text(c, q.text, x, y, Math.round(30*s), q.color);
      }
      c.globalAlpha = 1;
      if (call){
        const t = call.t, k = Math.min(1, t/0.25), sc = RM ? 1 : (k < 1 ? 0.4 + 0.75*(1 - Math.pow(1 - k, 3)) + Math.sin(k*Math.PI)*0.12 : 1 + Math.max(0, 0.05 - (t - 0.25)*0.1));
        c.globalAlpha = Math.max(0, Math.min(1, (call.life - t)*3));
        c.save(); c.translate(W/2, cy == null ? Hh*0.42 : cy); c.scale(sc, sc);
        F.text(c, call.text, 0, 0, Math.round(Math.min(call.size, W/Math.max(4, call.text.length)*1.7)), call.color, {glow: call.color});
        c.restore(); c.globalAlpha = 1;
      }
      if (flash > 0){ c.fillStyle = `rgba(${flashCol},${flash*0.5})`; c.fillRect(0, 0, W, Hh); }
    };
    F.cleanup = () => { ov.removeEventListener('click', onClick); count = null; parts.length = 0; flies.length = 0; };
    return F;
  }
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
  function kit(el, api){
    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden'; el.style.userSelect = 'none'; el.style.webkitUserSelect = 'none';
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none';
    el.insertBefore(cv, el.firstChild);
    const cx = cv.getContext('2d');
    const k = {cv, cx, on, W:1, H:1, D:1, onResize:null};
    const size = () => {
      const r = el.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
      if (W === k.W && H === k.H && cv.width === Math.round(W * d)) return;
      k.W = W; k.H = H; k.D = d; cv.width = Math.round(W * d); cv.height = Math.round(H * d); cx.setTransform(d, 0, 0, d, 0, 0);
      if (k.onResize) k.onResize();
    };
    on(window, 'resize', size); on(window, 'orientationchange', size);
    let ro = null; if (window.ResizeObserver){ ro = new ResizeObserver(size); ro.observe(el); }
    let raf = 0, last = 0, frameFn = null, dead = false;
    const loop = t => { if (dead) return; raf = requestAnimationFrame(loop); const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60; last = t; if (frameFn) frameFn(dt); };
    k.frame = f => { frameFn = f; };
    raf = requestAnimationFrame(loop);
    const tms = new Set();
    k.after = (ms, fn) => { const id = setTimeout(() => { tms.delete(id); if (!dead) fn(); }, ms); tms.add(id); return id; };
    k.clearTimers = () => { tms.forEach(clearTimeout); tms.clear(); };
    k.pt = e => { const r = cv.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
    k.cleanup = () => { dead = true; cancelAnimationFrame(raf); frameFn = null; k.clearTimers(); offs.forEach(f => f()); offs.length = 0; if (ro) ro.disconnect(); };
    k.size = size;
    return k;
  }
  // samples a gesture so a flick's speed comes from its last ~90ms
  function flickTracker(){
    const s = [];
    return {
      reset(p){ s.length = 0; s.push({x:p.x, y:p.y, t:performance.now()}); },
      add(p){ s.push({x:p.x, y:p.y, t:performance.now()}); if (s.length > 40) s.shift(); },
      vel(){ if (s.length < 2) return {vx:0, vy:0, dist:0}; const lastS = s[s.length - 1]; let i = s.length - 1; while (i > 0 && lastS.t - s[i - 1].t < 90) i--; const a = s[Math.max(0, i - 1)]; const dt = Math.max(0.016, (lastS.t - a.t) / 1000);
        return {vx:(lastS.x - a.x) / dt, vy:(lastS.y - a.y) / dt, dist:Math.hypot(lastS.x - s[0].x, lastS.y - s[0].y)}; },
      first(){ return s[0]; }, last(){ return s[s.length - 1]; }
    };
  }
  window.BreakGames.rings = {
    start(el, api){
      const F = bbFrame(el, api), RM = F.RM, HF = F.HF;
      const k = kit(el, api), cx = k.cx;
      const CAM_H = 1.25, G = 6.2, NECK = 0.43, RING_R = 0.13, HAND_Z = 1.6, HAND_H = 0.45, TABLE_NEAR = 2.3, TABLE_FAR = 6.7;
      const ROWS = [{z:3.6, pts:10, col:'#25b26e'}, {z:4.8, pts:20, col:'#2f86e6'}, {z:6.0, pts:30, col:'#9a5cf0'}];
      const RING_COLS = ['#ff4f5e', '#ffb020', '#2fc6ff', '#6fe04f', '#ff6ad5', '#fff4d6'];
      const BULBS = ['#ffd23f', '#ff5a5f', '#36c2ff', '#7be05a', '#ff9df0'];
      let F_ = 1, HOR = 0, MID = 0;
      const bg = document.createElement('canvas'), bx = bg.getContext('2d');
      const sprites = {};
      const layout = () => { MID = k.W / 2; F_ = Math.min(k.H * 1.3, k.W * 1.05); HOR = Math.max(k.H * 0.2, k.H * 0.93 - CAM_H * F_ / TABLE_NEAR); for (const key in sprites) delete sprites[key]; drawStatic(); };
      const P = (x, h, z) => ({x: MID + x * F_ / z, y: HOR + (CAM_H - h) * F_ / z, s: F_ / z});
      let bottles = [], rings = [], pops = [], cur = null, left = 10, score = 0, state = 'menu', tossN = 0, hint = 0, goldTimer = 0, streak = 0, bulbT = 0;
      el.__rings = () => ({state, left, score, cur: cur ? P(cur.x, cur.h, cur.z) : null, gold: (bottles.find(b => b.gold) || {}).x, H: k.H, W: k.W});

      // ---------- the cached booth ----------
      let bulbs = [], signL = 0;
      function drawStatic(){
        const W = k.W, H = k.H, d = k.D; bg.width = Math.round(W*d); bg.height = Math.round(H*d);
        const c = bx; c.setTransform(d, 0, 0, d, 0, 0);
        // back wall: warm wooden planks, darker at the top
        let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a0f30'); g.addColorStop(0.45, '#5a2340'); g.addColorStop(1, '#2a0d1e');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        let seed = 5; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
        const pw = Math.max(46, W/12);
        for (let x = 0; x < W; x += pw){
          c.fillStyle = `rgba(${120 + rnd()*40|0},${50 + rnd()*20|0},${40 + rnd()*20|0},.32)`; c.fillRect(x, 0, pw - 2, H);
          c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x + pw - 2, 0, 2, H);
          c.strokeStyle = 'rgba(255,210,170,.06)'; c.lineWidth = 1;
          for (let i = 0; i < 5; i++){ const gx = x + 6 + rnd()*(pw - 12); c.beginPath(); c.moveTo(gx, 0); c.bezierCurveTo(gx + 6, H*0.3, gx - 6, H*0.6, gx + 3, H); c.stroke(); }
        }
        // prize shelf with plush toys along the back
        const far = P(0, 0, TABLE_FAR), shelfY = Math.max(HOR*0.62, far.y - Math.max(30, H*0.08));
        const prizeY = shelfY - 4;
        c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, shelfY + 6, W, 10);
        g = c.createLinearGradient(0, shelfY - 2, 0, shelfY + 10); g.addColorStop(0, '#c98a4a'); g.addColorStop(1, '#6b3a17'); c.fillStyle = g; c.fillRect(0, shelfY - 2, W, 10);
        const prizes = ['🧸', '🦄', '🐼', '🐸', '🐙', '🦊', '🐻', '🐰', '🦁', '🐶'], ps = clamp(H*0.065, 26, 52);
        c.font = `${Math.round(ps)}px ${F.EMO}`; c.textAlign = 'center'; c.textBaseline = 'bottom';
        for (let i = 0, n = Math.ceil(W/(ps*1.25)); i < n; i++){ c.globalAlpha = 0.92; c.fillText(prizes[i % prizes.length], (i + 0.5)*W/n, prizeY); }
        c.globalAlpha = 1;
        // pennant bunting, and a second shelf of big prizes when the wall is tall enough
        const vTop = Math.max(40, HOR*0.36) + W/10*0.42 + 30;
        const room = shelfY - vTop;
        const bunt = (y0, sag) => { const nP = Math.max(8, Math.round(W/46)); c.strokeStyle = 'rgba(30,10,10,.7)'; c.lineWidth = 1.5; c.beginPath();
          for (let i = 0; i <= nP; i++){ const x = i*W/nP, y = y0 + Math.sin(i/nP*Math.PI)*sag; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
          for (let i = 0; i < nP; i++){ const x0 = i*W/nP, x1 = (i + 1)*W/nP, y0a = y0 + Math.sin(i/nP*Math.PI)*sag, y1a = y0 + Math.sin((i + 1)/nP*Math.PI)*sag;
            c.fillStyle = BULBS[i % BULBS.length]; c.beginPath(); c.moveTo(x0 + 3, y0a); c.lineTo(x1 - 3, y1a); c.lineTo((x0 + x1)/2, (y0a + y1a)/2 + W/nP*0.8); c.closePath(); c.fill();
            c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.moveTo((x0 + x1)/2, (y0a + y1a)/2); c.lineTo(x1 - 3, y1a); c.lineTo((x0 + x1)/2, (y0a + y1a)/2 + W/nP*0.8); c.closePath(); c.fill(); } };
        if (room > 110) bunt(vTop + 10, Math.min(40, room*0.12));
        if (room > 260){
          const s2 = shelfY - room*0.42, ps2 = clamp(room*0.2, 40, 76);
          c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, s2 + 6, W, 10);
          g = c.createLinearGradient(0, s2 - 2, 0, s2 + 10); g.addColorStop(0, '#c98a4a'); g.addColorStop(1, '#6b3a17'); c.fillStyle = g; c.fillRect(0, s2 - 2, W, 10);
          c.font = `${Math.round(ps2)}px ${F.EMO}`; c.textAlign = 'center'; c.textBaseline = 'bottom';
          const big = ['🦒', '🐳', '🦖', '🐲', '🦩', '🐘'];
          for (let i = 0, n2 = Math.max(3, Math.floor(W/(ps2*1.6))); i < n2; i++) c.fillText(big[i % big.length], (i + 0.5)*W/n2, s2 - 2);
        }
        // striped poles at the sides
        const poleW = Math.max(16, W*0.03);
        for (const px0 of [0, W - poleW]){
          g = c.createLinearGradient(px0, 0, px0 + poleW, 0); g.addColorStop(0, '#7a1020'); g.addColorStop(0.4, '#ff5a6a'); g.addColorStop(1, '#5a0a18');
          c.fillStyle = g; c.fillRect(px0, 0, poleW, H);
          c.fillStyle = 'rgba(255,255,255,.75)'; for (let y = -poleW; y < H; y += poleW*2.2){ c.beginPath(); c.moveTo(px0, y); c.lineTo(px0 + poleW, y + poleW*0.8); c.lineTo(px0 + poleW, y + poleW*1.6); c.lineTo(px0, y + poleW*0.8); c.closePath(); c.fill(); }
        }
        // the tent canopy: shaded stripes with a scalloped valance and gold trim
        const top = Math.max(40, HOR*0.36), n = 10, sw = W/n;
        for (let i = 0; i < n; i++){
          g = c.createLinearGradient(i*sw, 0, (i + 1)*sw, 0); const red = i % 2 === 0;
          g.addColorStop(0, red ? '#a3121f' : '#d8d2cf'); g.addColorStop(0.5, red ? '#ff4252' : '#ffffff'); g.addColorStop(1, red ? '#8f0f1b' : '#cbc3bf');
          c.fillStyle = g; c.beginPath(); c.moveTo(i*sw, 0); c.lineTo((i + 1)*sw, 0); c.lineTo((i + 1)*sw, top); c.quadraticCurveTo((i + 0.5)*sw, top + sw*0.42, i*sw, top); c.closePath(); c.fill();
          c.strokeStyle = '#ffcc4a'; c.lineWidth = 3; c.beginPath(); c.moveTo((i + 1)*sw, top); c.quadraticCurveTo((i + 0.5)*sw, top + sw*0.42, i*sw, top); c.stroke();
        }
        g = c.createLinearGradient(0, 0, 0, top*0.6); g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, top*0.6);
        // sign
        const sy = Math.max(24, top*0.45), sf = clamp(W*0.05, 22, 40);
        c.font = `800 ${Math.round(sf)}px ${HF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        const tw = c.measureText('RING TOSS').width + sf*1.4; signL = W/2 - tw/2;
        F.rr(c, W/2 - tw/2, sy - sf*0.75, tw, sf*1.5, sf*0.75); c.fillStyle = '#2a0f30'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#ffcc4a'; c.stroke();
        c.shadowColor = '#ffcc4a'; c.shadowBlur = 14; c.fillStyle = '#ffe9a0'; c.fillText('RING TOSS', W/2, sy + 1); c.shadowBlur = 0;
        // string of bulbs along the valance (their glow twinkles live)
        bulbs = [];
        for (let i = 0; i < 18; i++){ const t = (i + 0.5)/18, x = t*W, y = top + sw*0.2 + Math.sin(t*Math.PI*n)*sw*0.12 + 6; bulbs.push({x, y, col: BULBS[i % BULBS.length]}); }
        c.strokeStyle = 'rgba(30,20,10,.8)'; c.lineWidth = 1.5; c.beginPath(); bulbs.forEach((b, i) => i ? c.lineTo(b.x, b.y - 4) : c.moveTo(b.x, b.y - 4)); c.stroke();
        // the table: wood planks in perspective under a spotlight
        const a = P(-1.75, 0, TABLE_NEAR), b = P(1.75, 0, TABLE_NEAR), cc = P(1.75, 0, TABLE_FAR), dd = P(-1.75, 0, TABLE_FAR);
        c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.moveTo(dd.x - 10, dd.y + 4); c.lineTo(cc.x + 10, cc.y + 4); c.lineTo(b.x + 30, H); c.lineTo(a.x - 30, H); c.closePath(); c.fill();
        g = c.createLinearGradient(0, dd.y, 0, a.y); g.addColorStop(0, '#6e3d1d'); g.addColorStop(1, '#c4844a');
        c.fillStyle = g; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(cc.x, cc.y); c.lineTo(dd.x, dd.y); c.closePath(); c.fill();
        c.save(); c.clip();
        for (let i = 0; i <= 9; i++){ const x = -1.75 + i * 3.5 / 9, p1 = P(x, 0, TABLE_NEAR), p2 = P(x, 0, TABLE_FAR);
          c.strokeStyle = 'rgba(40,15,0,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.stroke();
          c.strokeStyle = 'rgba(255,220,170,.12)'; c.lineWidth = 1; c.beginPath(); c.moveTo(p1.x + 2, p1.y); c.lineTo(p2.x + 1, p2.y); c.stroke(); }
        for (let i = 0; i < 70; i++){ const x = -1.7 + rnd()*3.4, z = TABLE_NEAR + rnd()*(TABLE_FAR - TABLE_NEAR), p = P(x, 0, z), l = 18*p.s/300;
          c.strokeStyle = 'rgba(60,25,5,.22)'; c.lineWidth = 1; c.beginPath(); c.moveTo(p.x, p.y); c.quadraticCurveTo(p.x + 3, p.y + l*0.5, p.x, p.y + l); c.stroke(); }
        const sp = P(0, 0, 4.6); g = c.createRadialGradient(sp.x, sp.y, 4, sp.x, sp.y, (b.x - a.x)*0.6); g.addColorStop(0, 'rgba(255,236,190,.45)'); g.addColorStop(1, 'rgba(255,236,190,0)');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.restore();
        // the front skirt with stars
        const fh = Math.max(14, H*0.05);
        g = c.createLinearGradient(0, a.y, 0, a.y + fh); g.addColorStop(0, '#d8263a'); g.addColorStop(1, '#7c0f1d');
        c.fillStyle = g; c.fillRect(a.x, a.y, b.x - a.x, fh);
        c.fillStyle = '#ffcc4a'; c.fillRect(a.x, a.y, b.x - a.x, 3);
        c.font = `${Math.round(fh*0.6)}px ${F.EMO}`; c.textBaseline = 'middle';
        for (let x = a.x + fh; x < b.x - fh/2; x += fh*2.2) c.fillText('⭐', x, a.y + fh*0.58);
        // row point plaques
        ROWS.forEach(r => { const p = P(1.5, 0, r.z), fz = clamp(p.s * 0.07, 12, 22), t = r.pts + ' pts';
          c.font = `800 ${Math.round(fz)}px ${HF}`; const w = c.measureText(t).width + fz;
          F.rr(c, p.x - w/2, p.y - fz*1.6, w, fz*1.4, fz*0.7); c.fillStyle = r.col; c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.stroke();
          c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, p.x, p.y - fz*0.9); });
        // vignette
        g = c.createRadialGradient(W/2, H*0.55, Math.min(W, H)*0.3, W/2, H*0.55, Math.max(W, H)*0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,0,15,.5)');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.setTransform(1, 0, 0, 1, 0, 0);
      }
      // a glow dot sprite for bulbs and sparkles
      function glow(col, px){
        const key = 'g' + col + px; if (sprites[key]) return sprites[key];
        const c = document.createElement('canvas'), d = k.D; c.width = c.height = Math.ceil(px*d); const x = c.getContext('2d'); x.scale(d, d);
        const g = x.createRadialGradient(px/2, px/2, 0, px/2, px/2, px/2); g.addColorStop(0, col); g.addColorStop(0.25, col); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.globalAlpha = 0.9; x.fillStyle = g; x.fillRect(0, 0, px, px); return (sprites[key] = {c, px});
      }
      // a glass bottle, prerendered per colour and row
      function bottleSprite(col, gold, s){
        const key = 'b' + col + gold + Math.round(s); if (sprites[key]) return sprites[key];
        const bw = 0.09 * s, bh = 0.27 * s, nw = 0.032 * s, nh = NECK * s, w = bw*2 + 8, h = nh + nw + 8;
        const c = document.createElement('canvas'), d = k.D; c.width = Math.ceil(w*d); c.height = Math.ceil(h*d); const x = c.getContext('2d'); x.scale(d, d); x.translate(w/2, h - 2);
        const path = () => { x.beginPath(); x.moveTo(-bw, 0); x.lineTo(-bw, -bh); x.quadraticCurveTo(-bw, -bh - bw * 1.1, -nw, -bh - bw * 1.5); x.lineTo(-nw, -nh); x.lineTo(nw, -nh); x.lineTo(nw, -bh - bw * 1.5); x.quadraticCurveTo(bw, -bh - bw * 1.1, bw, -bh); x.lineTo(bw, 0); x.closePath(); };
        const base = gold ? '#f5c518' : col;
        path(); let g = x.createLinearGradient(-bw, 0, bw, 0);
        g.addColorStop(0, gold ? '#9a6a00' : 'rgba(0,0,0,.55)'); g.addColorStop(0.18, base); g.addColorStop(0.32, gold ? '#fff6c2' : 'rgba(255,255,255,.9)'); g.addColorStop(0.42, base); g.addColorStop(0.85, base); g.addColorStop(1, gold ? '#7a5200' : 'rgba(0,0,0,.6)');
        x.fillStyle = base; x.fill(); x.globalAlpha = 0.85; x.fillStyle = g; x.fill(); x.globalAlpha = 1;
        // liquid line and label
        x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(-bw, -bh*0.42, bw*2, bh*0.42);
        x.fillStyle = gold ? '#fff2a8' : 'rgba(255,255,255,.88)'; x.fillRect(-bw, -bh*0.72, bw*2, bh*0.24);
        x.fillStyle = gold ? '#a77c00' : col; x.font = `800 ${Math.max(6, bh*0.17)}px ${HF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(gold ? '★' : '◆', 0, -bh*0.6);
        x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = Math.max(1, bw*0.12); x.beginPath(); x.moveTo(-bw*0.55, -bh*0.08); x.lineTo(-bw*0.55, -bh*0.82); x.stroke();
        // lip of the neck
        x.fillStyle = gold ? '#fff2a8' : 'rgba(255,255,255,.92)'; x.fillRect(-nw * 1.3, -nh - nw * 0.6, nw * 2.6, nw * 0.9);
        path(); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1; x.stroke();
        return (sprites[key] = {c, w, h});
      }
      function makeBottles(){
        bottles = [];
        ROWS.forEach(r => { for (let i = 0; i < 5; i++) bottles.push({x:(i - 2) * 0.42, z:r.z, pts:r.pts, col:r.col, gold:false, wob:0, sq:0}); });
        moveGold();
      }
      function moveGold(){ bottles.forEach(b => { if (b.gold){ b.gold = false; b.pts = ROWS[2].pts; } }); const back = bottles.filter(b => b.z === ROWS[2].z && !b.held); const g = back[Math.floor(Math.random() * back.length)] || bottles[bottles.length - 1]; g.gold = true; g.pts = 100; }
      function newRing(){ cur = {x:0, h:HAND_H, z:HAND_Z, vx:0, vh:0, vz:0, state:'hand', col:RING_COLS[tossN % RING_COLS.length], spin:0, bounces:0, t:0, on:null, slide:0, alpha:1, trail:[]}; }
      function begin(){ F.hide(); makeBottles(); rings = []; pops = []; left = 10; score = 0; tossN = 0; hint = 4; goldTimer = 0; streak = 0; state = 'play'; newRing(); F.callout('Step right up!', '#ffe9a0', 54, 1.1); }
      function startScreen(){
        state = 'menu';
        F.title({icon: '🎪', title: 'Ring Toss', howIcon: '👆', how: 'Flick a ring up at the bottles. Far bottles score more, the ⭐ gold one is 100!', best: api.best, bestUnit: 'points', onPlay: begin});
      }
      function finish(){
        state = 'end'; const res = api.saveScore(score);
        const ringers = rings.filter(r => r.state === 'on').length;
        k.after(700, () => F.end({head: 'All rings tossed! 🎪', score, unit: 'points', stars: 1 + (score >= 60 ? 1 : 0) + (score >= 150 ? 1 : 0), best: res.best, isBest: res.isBest,
          lines: [`🎯 ${ringers} ringer${ringers === 1 ? '' : 's'} out of 10`], onPlay: begin}));
      }
      // --- input: flick from the bottom of the screen ---
      const fl = flickTracker(); let dragging = false;
      k.on(k.cv, 'pointerdown', e => { if (state !== 'play' || !cur || cur.state !== 'hand') return; dragging = true; try { k.cv.setPointerCapture(e.pointerId); } catch(_){} fl.reset(k.pt(e)); });
      k.on(k.cv, 'pointermove', e => { if (!dragging) return; const p = k.pt(e); fl.add(p); cur.x = clamp((p.x - MID) / (F_ / HAND_Z), -0.7, 0.7); });
      const up = e => {
        if (!dragging) return; dragging = false; fl.add(k.pt(e));
        const v = fl.vel(), spd = -v.vy / k.H;
        if (spd < 0.6 || v.dist < 25){ hint = 2.5; return; }
        const vz = clamp(0.4 + spd * 1.65, 1.6, 8.5), ratio = clamp(v.vx / -v.vy, -1.2, 1.2);
        cur.vz = vz; cur.vx = ratio * vz * 0.5; cur.vh = 2.4; cur.state = 'fly'; cur.spin = ratio * 4 + 2; hint = 0; left--; tossN++;
        const p = P(cur.x, cur.h, cur.z); F.burst(p.x, p.y, {n: 8, color: ['#ffffff', cur.col], speed: 160, life: 0.35, size: 3, kind: 'spark', glow: true});
        rings.push(cur); cur = null;
      };
      k.on(k.cv, 'pointerup', up); k.on(k.cv, 'pointercancel', up);
      function pop(txt, x, h, z, col){ pops.push({txt, x, h, z, t:0, col}); }
      function settle(r, msg, col){ if (r.state === 'fly') r.state = 'down'; if (msg) pop(msg, r.x, Math.max(r.h, 0.3), r.z, col); k.after(650, () => { if (state !== 'play') return; if (left <= 0){ finish(); return; } if (++goldTimer >= 3){ goldTimer = 0; moveGold(); } newRing(); }); }
      function update(dt){
        F.tick(dt); bulbT += dt;
        if (F.paused()) return;
        rings.forEach(r => {
          r.t += dt;
          if (r.state === 'fly'){
            const ph = r.h; r.x += r.vx * dt; r.z += r.vz * dt; r.vh -= G * dt; r.h += r.vh * dt;
            r.trail.push(r.x, r.h, r.z); if (r.trail.length > 24) r.trail.splice(0, 3);
            if (ph >= NECK && r.h < NECK && r.vh < 0){
              let best = null, bd = 9; bottles.forEach(b => { const d = Math.hypot(r.x - b.x, (r.z - b.z) * 0.85); if (d < bd){ bd = d; best = b; } });
              if (best && bd < 0.12){
                r.state = 'on'; r.on = best; r.slide = 0; best.held = (best.held || 0) + 1; best.wob = 1; best.sq = 1; r.stack = best.held - 1; r.trail.length = 0;
                score += best.pts; streak++;
                const p = P(best.x, NECK, best.z);
                F.burst(p.x, p.y, {n: best.gold ? 46 : 22, color: best.gold ? ['#ffd23f', '#fff6c2', '#ffffff'] : [r.col, '#ffffff', '#ffd23f'], speed: best.gold ? 420 : 260, life: 0.9, size: 4, grav: 300, kind: 'confetti', drag: 1.5});
                F.burst(p.x, p.y, {n: 10, color: '#fff6c2', speed: 180, life: 0.4, size: 3, kind: 'spark', glow: true});
                F.fly('+' + best.pts, p.x, p.y - 20, 'score', best.gold ? '#ffd23f' : '#ffffff');
                if (best.gold){ api.confetti(40); goldTimer = 2; F.flash(0.5, '255,215,90'); F.shake(0.45); F.hitPause(0.18); F.callout('GOLD! +100', '#ffd23f', 76, 1.4); }
                else if (streak >= 2) F.callout(streak === 2 ? 'Two in a row!' : `${streak} in a row! 🔥`, '#ffe9a0', 54, 1.1);
                else F.callout('Ringer!', '#ffffff', 60, 0.9);
                if (!best.gold) F.shake(0.12);
                settle(r); return;
              }
              if (best && bd < 0.23 && r.bounces < 2){
                const dx = r.x - best.x, dz = r.z - best.z, d = Math.hypot(dx, dz) || 1;
                r.vx = dx / d * 0.9 + r.vx * 0.25; r.vz = dz / d * 0.9 + r.vz * 0.3; r.vh = 1.5; r.h = NECK + 0.002; r.bounces++; best.wob = 0.6; r.spin *= -1.5;
                const p = P(best.x, NECK, best.z); F.burst(p.x, p.y, {n: 8, color: ['#ffffff', '#ffe6a6'], speed: 200, life: 0.3, size: 2.5, kind: 'spark', glow: true});
                pop('Clink!', best.x, 0.6, best.z, '#ffe6a6');
              }
            }
            if (r.h <= 0 && r.z >= TABLE_NEAR && r.z <= TABLE_FAR && Math.abs(r.x) < 1.7){ r.h = 0; streak = 0; const p = P(r.x, 0, r.z); F.burst(p.x, p.y, {n: 8, color: 'rgba(240,210,170,.8)', speed: 90, life: 0.5, size: 3, grav: -20}); settle(r, 'Miss', '#ffffff'); }
            else if (r.h < -1.2 || r.z > 9){ r.state = 'gone'; streak = 0; settle(r, null); pop('Miss', r.x, 0.2, Math.min(r.z, TABLE_FAR), '#ffffff'); }
          } else if (r.state === 'on'){ r.slide = Math.min(1, r.slide + dt * 3); }
          else if (r.state === 'down'){ r.alpha = Math.max(0.35, r.alpha - dt * 0.4); if (r.trail.length) r.trail.splice(0, 3); }
          else if (r.trail.length) r.trail.splice(0, 3);
        });
        bottles.forEach(b => { b.wob = Math.max(0, b.wob - dt * 1.6); b.sq = Math.max(0, b.sq - dt * 5); });
        for (let i = pops.length - 1; i >= 0; i--){ pops[i].t += dt; if (pops[i].t > 1.2) pops.splice(i, 1); }
        if (rings.length > 40) rings = rings.filter(r => r.state === 'on' || r.state === 'fly');
        if (hint > 0) hint -= dt;
        // the gold bottle sparkles now and then
        if (!RM && Math.random() < dt*5){ const gb = bottles.find(b => b.gold); if (gb){ const p = P(gb.x + (Math.random() - 0.5)*0.15, Math.random()*0.4, gb.z); F.burst(p.x, p.y, {n: 1, color: '#fff6c2', speed: 30, life: 0.6, size: 3, glow: true, grav: -30}); } }
      }
      // --- drawing ---
      function drawBottle(b){
        const p = P(b.x, 0, b.z), s = p.s, wob = Math.sin(performance.now() / 50) * b.wob * 0.05;
        const bw = 0.09 * s;
        cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(p.x + bw*0.3, p.y, bw * 1.35, bw * 0.38, 0, 0, 7); cx.fill();
        if (b.gold){ const gl = glow('rgba(255,215,80,.9)', Math.round(bw*7)); cx.globalAlpha = 0.55 + Math.sin(bulbT*4)*0.2; cx.drawImage(gl.c, p.x - gl.px/2, p.y - NECK*s*0.6 - gl.px/2, gl.px, gl.px); cx.globalAlpha = 1; }
        const sp = bottleSprite(b.col, b.gold, s), sq = RM ? 0 : b.sq*0.08;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(wob); cx.scale(1 + sq, 1 - sq);
        cx.drawImage(sp.c, -sp.w/2, -sp.h + 2, sp.w, sp.h);
        cx.restore();
      }
      function ringShape(x, y, rx, ry, col, alpha, half){
        cx.globalAlpha = alpha;
        const a0 = half === 'back' ? Math.PI : 0, a1 = half === 'front' ? Math.PI : Math.PI * 2, full = !half;
        cx.lineWidth = Math.max(2.5, rx * 0.3); cx.strokeStyle = 'rgba(0,0,0,.4)';
        cx.beginPath(); cx.ellipse(x, y + 2, rx, ry, 0, a0, full ? Math.PI*2 : a1); cx.stroke();
        cx.strokeStyle = col; cx.lineWidth = Math.max(2, rx * 0.24); cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, a0, full ? Math.PI*2 : a1); cx.stroke();
        cx.strokeStyle = 'rgba(0,0,0,.22)'; cx.lineWidth = Math.max(1, rx * 0.08); cx.beginPath(); cx.ellipse(x, y + rx*0.06, rx*1.04, ry*1.05, 0, a0 === Math.PI ? Math.PI : 0.1, full ? Math.PI - 0.1 : a1); cx.stroke();
        cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = Math.max(1, rx * 0.07); cx.beginPath(); cx.ellipse(x, y - rx * 0.05, rx * 0.95, ry * 0.88, 0, Math.PI * 1.1, Math.PI * 1.6); cx.stroke();
        cx.globalAlpha = 1;
      }
      function ringOnBottle(r, half){
        const b = r.on, hh = lerp(NECK, 0.3 + Math.min(r.stack, 3) * 0.03, r.slide), p = P(b.x, hh, b.z), rx = RING_R * 0.62 * p.s;
        ringShape(p.x, p.y, rx, rx * 0.32, r.col, 1, half);
      }
      function drawFlyer(r){
        if (r.h < 0) return;
        const p = P(r.x, r.h, r.z), rx = RING_R * p.s;
        if (r.trail.length > 3 && !RM){ for (let i = 0; i < r.trail.length - 3; i += 3){ const q = P(r.trail[i], r.trail[i + 1], r.trail[i + 2]), a = i/r.trail.length; cx.globalAlpha = a*0.35; cx.strokeStyle = r.col; cx.lineWidth = Math.max(2, RING_R*q.s*0.2); cx.beginPath(); cx.ellipse(q.x, q.y, RING_R*q.s*(0.5 + a*0.5), RING_R*q.s*0.2, 0, 0, 7); cx.stroke(); } cx.globalAlpha = 1; }
        if (r.h > 0 && r.z >= TABLE_NEAR && r.z <= TABLE_FAR){ const sh = P(r.x, 0, r.z); cx.fillStyle = `rgba(0,0,0,${0.3 - Math.min(0.2, r.h*0.15)})`; cx.beginPath(); cx.ellipse(sh.x, sh.y, rx, rx * 0.22, 0, 0, 7); cx.fill(); }
        const tilt = r.state === 'down' ? 0.24 : clamp(0.3 + Math.sin(r.t * r.spin) * 0.12, 0.15, 0.5);
        ringShape(p.x, p.y, rx, rx * tilt, r.col, r.alpha);
      }
      const list = [];
      function draw(){
        const W = k.W, H = k.H;
        cx.setTransform(k.D, 0, 0, k.D, 0, 0);
        const shk = F.shakeXY(); cx.save(); cx.translate(shk.x, shk.y);
        cx.drawImage(bg, 0, 0, W, H);
        // twinkling bulbs
        const bs = Math.max(26, H*0.06);
        for (let i = 0; i < bulbs.length; i++){ const b = bulbs[i], on = RM ? 1 : 0.6 + 0.4*Math.sin(bulbT*3 + i*1.7);
          const gl = glow(b.col, Math.round(bs)); cx.globalAlpha = on; cx.drawImage(gl.c, b.x - bs/2, b.y - bs/2, bs, bs);
          cx.globalAlpha = 1; cx.fillStyle = '#fffbe8'; cx.beginPath(); cx.arc(b.x, b.y, Math.max(2.5, H*0.006), 0, 7); cx.fill(); }
        list.length = 0;
        bottles.forEach(b => list.push({z:b.z, b}));
        rings.forEach(r => { if (r.state !== 'on' && r.state !== 'gone') list.push({z:r.z - 0.01, r}); });
        list.sort((a, b) => b.z - a.z);
        for (const it of list){
          if (it.b){ rings.forEach(r => { if (r.on === it.b) ringOnBottle(r, 'back'); }); drawBottle(it.b); rings.forEach(r => { if (r.on === it.b) ringOnBottle(r, 'front'); }); }
          else drawFlyer(it.r);
        }
        rings.forEach(r => { if (r.state === 'gone' && r.h > -1.2) drawFlyer(r); });
        if (cur){ const p = P(cur.x, cur.h, cur.z), rx = RING_R * p.s, bob = RM || dragging ? 0 : Math.sin(bulbT*3)*4;
          const gl = glow('rgba(255,240,200,.6)', Math.round(rx*3.4)); cx.drawImage(gl.c, p.x - gl.px/2, p.y + bob - gl.px/2, gl.px, gl.px);
          ringShape(p.x, p.y + bob, rx, rx * 0.42, cur.col, 1); }
        F.drawParts(cx);
        pops.forEach(q => { const p = P(q.x, q.h + q.t * 0.25, q.z); cx.globalAlpha = clamp(1.4 - q.t, 0, 1); F.text(cx, q.txt, p.x, p.y, Math.round(clamp(p.s * 0.08, 18, 30)), q.col); cx.globalAlpha = 1; });
        cx.restore();
        // glass HUD
        if (state !== 'menu'){
          const hh = 48;
          F.pill(cx, W - 12, 10, {key: 'score', icon: '⭐', label: 'Score', value: score, align: 'right', h: hh, accent: '#ffd23f'});
          const w = F.pill(cx, 12, 10, {key: 'rings', icon: '⭕', label: 'Rings', value: left, h: hh, accent: '#ff6ad5'});
          if (24 + w + 10*17 < signL){ for (let i = 0; i < 10; i++){ cx.strokeStyle = i < left ? RING_COLS[i % RING_COLS.length] : 'rgba(255,255,255,.22)'; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(28 + w + i * 17, 10 + hh/2, 6, 6, 0, 0, 7); cx.stroke(); } }
          if (hint > 0 && state === 'play' && cur){
            const p = P(cur.x, cur.h, cur.z), bob = RM ? 0 : Math.sin(bulbT*5)*8;
            cx.globalAlpha = clamp(hint, 0, 1); F.text(cx, '👆 Flick up to toss!', W/2, p.y - RING_R*p.s - 40 + bob, 28, '#ffffff'); cx.globalAlpha = 1;
          }
        }
        F.drawFx(cx, W, H, H*0.36);
      }
      k.onResize = layout; k.size();
      k.frame(dt => { if (state === 'play' || state === 'end') update(dt); else { F.tick(dt); bulbT += dt; } draw(); });
      makeBottles(); startScreen();
      return () => { k.cleanup(); F.cleanup(); delete el.__rings; el.innerHTML = ''; };
    }
  };
})();
