// Table hockey: drag your paddle on your half, knock the puck into the far goal. First to 7.
// 1 player vs the computer (easy / medium / hard) or 2 players on one iPad, one finger each.
// Brain Break look: a neon air-hockey table in a dark arena, glass HUD, title and result cards.
(function(){
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
  window.BreakGames.hockey = {
    start(el, api){
      const F = bbFrame(el, api), RM = F.RM;
      // table in "along" (A, 0..1000, P1 defends A=0) and "across" (X, 0..560)
      const LEN = 1000, WID = 560, MID = LEN/2, PR = 24, KR = 44, GOAL_LO = 175, GOAL_HI = 385, WIN = 7;
      const RAIL = 26, MAXV = 1700, E_WALL = 0.9, HUD = 68;
      const AI = {easy: {speed: 360, home: 900, lag: 3, err: 40, read: 0}, medium: {speed: 620, home: 890, lag: 7, err: 18, read: 0.6}, hard: {speed: 950, home: 900, lag: 14, err: 4, read: 1}};
      const BLUE = '#3d8bff', RED = '#ff4b6b', BLUE_RGB = '61,139,255', RED_RGB = '255,75,107';

      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.insertBefore(cv, el.firstChild);
      const cx = cv.getContext('2d');
      const bg = document.createElement('canvas'), bx = bg.getContext('2d');

      let W = 0, H = 0, D = 1, sc = 1, ox = 0, oy = 0, port = false, raf = 0, last = 0, alive = true;
      const timers = new Set();
      const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms); timers.add(t); };
      const size = () => {
        const r = el.getBoundingClientRect(); D = Math.min(window.devicePixelRatio || 1, 2.5);
        W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W*D); cv.height = Math.round(H*D);
        port = H > W*1.05;
        const lw = (port ? WID : LEN) + 2*RAIL + 16, lh = (port ? LEN : WID) + 2*RAIL + 16;
        sc = Math.min(W/lw, (H - HUD)/lh); ox = W/2; oy = HUD + (H - HUD)/2;
        cx.setTransform(D,0,0,D,0,0);
        bg.width = cv.width; bg.height = cv.height; drawStatic();
      };
      // table -> screen (css px) and back. Landscape: P1 on the left. Portrait: P1 at the bottom.
      const toS = (a, x) => port ? {x: ox + (x - WID/2)*sc, y: oy + (MID - a)*sc} : {x: ox + (a - MID)*sc, y: oy + (x - WID/2)*sc};
      const fromS = (sx, sy) => port ? {a: MID - (sy - oy)/sc, x: WID/2 + (sx - ox)/sc} : {a: MID + (sx - ox)/sc, x: WID/2 + (sy - oy)/sc};
      const rectS = (a0, x0, a1, x1) => { const p = toS(a0, x0), q = toS(a1, x1); return {x: Math.min(p.x, q.x), y: Math.min(p.y, q.y), w: Math.abs(q.x - p.x), h: Math.abs(q.y - p.y)}; };

      // ---- the static arena and table, drawn once per resize ----
      function drawStatic(){
        const c = bx; c.setTransform(D,0,0,D,0,0); c.clearRect(0, 0, W, H);
        // arena: deep blue room with spotlights and a blurred crowd
        let g = c.createRadialGradient(W/2, H*0.45, 10, W/2, H*0.5, Math.max(W, H)*0.8);
        g.addColorStop(0, '#22306a'); g.addColorStop(0.55, '#111a3d'); g.addColorStop(1, '#060a1c'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
        const crowd = ['#ff6b8a', '#ffd166', '#6be3ff', '#a78bfa', '#7cf29a', '#ffffff'];
        for (let i = 0; i < Math.round(W*H/900); i++){
          const x = rnd()*W, y = rnd()*H; c.globalAlpha = 0.12 + rnd()*0.22; c.fillStyle = crowd[Math.floor(rnd()*crowd.length)];
          c.beginPath(); c.arc(x, y, 1.5 + rnd()*2.5, 0, 6.283); c.fill();
        }
        c.globalAlpha = 1;
        for (let i = 0; i < 4; i++){
          const sx = W*(0.12 + i*0.25), q = c.createLinearGradient(sx, 0, sx, H); q.addColorStop(0, 'rgba(190,215,255,.22)'); q.addColorStop(1, 'rgba(190,215,255,0)');
          c.fillStyle = q; c.beginPath(); c.moveTo(sx - 14, 0); c.lineTo(sx + 14, 0); c.lineTo(sx + W*0.16, H); c.lineTo(sx - W*0.16, H); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(sx, 2, 16, 6, 0, 0, 6.283); c.fill();
        }
        // table shadow and rail
        const R = rectS(-RAIL, -RAIL, LEN + RAIL, WID + RAIL), T = rectS(0, 0, LEN, WID), rr = F.rr;
        c.save(); c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = 40; c.shadowOffsetY = 18;
        rr(c, R.x, R.y, R.w, R.h, 34*sc); c.fillStyle = '#1b2547'; c.fill(); c.restore();
        g = c.createLinearGradient(R.x, R.y, R.x, R.y + R.h); g.addColorStop(0, '#5b6c9c'); g.addColorStop(0.12, '#2a3763'); g.addColorStop(0.88, '#1c2649'); g.addColorStop(1, '#0d1430');
        rr(c, R.x, R.y, R.w, R.h, 34*sc); c.fillStyle = g; c.fill();
        c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 1.5; rr(c, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 32*sc); c.stroke();
        // team neon on each half of the inner rail edge
        for (const [a0, a1, col] of [[-RAIL, MID, BLUE], [MID, LEN + RAIL, RED]]){
          const h = rectS(a0, -RAIL - 4, a1, WID + RAIL + 4);
          c.save(); c.beginPath(); c.rect(h.x, h.y, h.w, h.h); c.clip();
          c.shadowColor = col; c.shadowBlur = 18; c.strokeStyle = col; c.lineWidth = 4*sc + 1;
          rr(c, T.x - 5*sc, T.y - 5*sc, T.w + 10*sc, T.h + 10*sc, 26*sc); c.stroke(); c.restore();
        }
        // the ice surface
        g = c.createRadialGradient(T.x + T.w/2, T.y + T.h/2, 10, T.x + T.w/2, T.y + T.h/2, Math.max(T.w, T.h)*0.7);
        g.addColorStop(0, '#fbfeff'); g.addColorStop(0.7, '#e2f0fb'); g.addColorStop(1, '#c4dcef');
        rr(c, T.x, T.y, T.w, T.h, 22*sc); c.fillStyle = g; c.fill();
        c.save(); rr(c, T.x, T.y, T.w, T.h, 22*sc); c.clip();
        // skate-like scratches
        for (let i = 0; i < 160; i++){
          const x = T.x + rnd()*T.w, y = T.y + rnd()*T.h, l = 10 + rnd()*40, a = rnd()*6.283;
          c.strokeStyle = rnd() < 0.5 ? 'rgba(120,150,190,.10)' : 'rgba(255,255,255,.5)'; c.lineWidth = 0.6 + rnd()*0.8;
          c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 0.4)*l*0.5, y + Math.sin(a + 0.4)*l*0.5, x + Math.cos(a)*l, y + Math.sin(a)*l); c.stroke();
        }
        // air holes
        for (let a = 30; a < LEN; a += 40) for (let x = 30; x < WID; x += 40){ const p = toS(a, x);
          c.fillStyle = 'rgba(70,100,150,.22)'; c.beginPath(); c.arc(p.x, p.y, 1.6, 0, 6.283); c.fill();
          c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(p.x - 0.6, p.y - 0.6, 0.7, 0, 6.283); c.fill(); }
        // markings
        const line = (a1, x1, a2, x2) => { const p = toS(a1, x1), q = toS(a2, x2); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); };
        c.lineCap = 'round';
        c.strokeStyle = 'rgba(225,50,80,.55)'; c.lineWidth = 6*sc; line(MID, 0, MID, WID);
        c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5*sc; line(MID, 0, MID, WID);
        const cc = toS(MID, WID/2);
        c.fillStyle = 'rgba(120,170,255,.12)'; c.beginPath(); c.arc(cc.x, cc.y, 84*sc, 0, 6.283); c.fill();
        c.strokeStyle = 'rgba(60,110,230,.5)'; c.lineWidth = 4*sc; c.beginPath(); c.arc(cc.x, cc.y, 84*sc, 0, 6.283); c.stroke();
        c.globalAlpha = 0.14; c.font = `${Math.round(70*sc)}px ${F.EMO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🏒', cc.x, cc.y + 3*sc); c.globalAlpha = 1;
        for (const [end, rgb] of [[0, BLUE_RGB], [LEN, RED_RGB]]){
          const gp = toS(end, WID/2);
          c.fillStyle = `rgba(${rgb},.14)`; c.beginPath(); c.arc(gp.x, gp.y, 125*sc, 0, 6.283); c.fill();
          c.strokeStyle = `rgba(${rgb},.55)`; c.lineWidth = 4*sc; c.beginPath(); c.arc(gp.x, gp.y, 125*sc, 0, 6.283); c.stroke();
          for (const fx of [140, WID - 140]){ const f = toS(end ? end - 230 : 230, fx); c.fillStyle = `rgba(${rgb},.45)`; c.beginPath(); c.arc(f.x, f.y, 7*sc, 0, 6.283); c.fill(); }
        }
        // gloss
        g = c.createLinearGradient(T.x, T.y, T.x + T.w, T.y + T.h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.45, 'rgba(255,255,255,.28)'); g.addColorStop(0.55, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(T.x, T.y, T.w, T.h);
        // inner shadow under the rail
        c.strokeStyle = 'rgba(10,20,50,.35)'; c.lineWidth = 10*sc; rr(c, T.x, T.y, T.w, T.h, 22*sc); c.stroke();
        c.restore();
        // goal mouths, with chrome posts
        for (const [end, col, rgb] of [[0, BLUE, BLUE_RGB], [LEN, RED, RED_RGB]]){
          const m = rectS(end + (end ? -4 : 4), GOAL_LO, end + (end ? RAIL + 2 : -RAIL - 2), GOAL_HI);
          g = c.createLinearGradient(m.x, m.y, m.x + (port ? 0 : m.w), m.y + (port ? m.h : 0));
          g.addColorStop(0, '#02050f'); g.addColorStop(1, `rgba(${rgb},.6)`);
          rr(c, m.x, m.y, m.w, m.h, 6*sc); c.fillStyle = '#03060f'; c.fill();
          c.save(); c.shadowColor = col; c.shadowBlur = 16; c.strokeStyle = col; c.lineWidth = 3; rr(c, m.x, m.y, m.w, m.h, 6*sc); c.stroke(); c.restore();
          for (const px of [GOAL_LO, GOAL_HI]){ const p = toS(end, px), r = 9*sc;
            const pg = c.createRadialGradient(p.x - r*0.4, p.y - r*0.4, 1, p.x, p.y, r); pg.addColorStop(0, '#ffffff'); pg.addColorStop(0.5, '#aab6cc'); pg.addColorStop(1, '#4b5672');
            c.fillStyle = pg; c.beginPath(); c.arc(p.x, p.y, r, 0, 6.283); c.fill(); }
        }
        c.setTransform(1,0,0,1,0,0);
      }

      // ---- state ----
      let mode = 'menu', players = 1, level = 'easy', score = [0, 0], pause = 0, glow = [0, 0], hitCd = 0, rally = 0;
      const puck = {a: MID - 160, x: WID/2, va: 0, vx: 0, spin: 0, sq: 0};
      const trail = []; for (let i = 0; i < 12; i++) trail.push({x: 0, y: 0, on: false});
      let trailI = 0;
      const pads = [mkPad(0), mkPad(1)];
      function mkPad(side){ return {side, a: side ? LEN - 110 : 110, x: WID/2, ta: side ? LEN - 110 : 110, tx: WID/2, va: 0, vx: 0, ptr: null, sq: 0}; }
      const ai = {ta: LEN - 110, tx: WID/2, off: 0, cool: 0};
      el._hk = () => ({mode, score: score.slice(), puck: toS(puck.a, puck.x), pad: toS(pads[0].a, pads[0].x), pad2: toS(pads[1].a, pads[1].x), pa: puck.a, px: puck.x, port});

      // ---- title and result cards ----
      const menu = () => {
        mode = 'menu';
        F.title({icon: '🏒', title: 'Table Hockey', howIcon: '👆', how: `Drag your paddle and slam the puck into the far goal. First to ${WIN}!`,
          best: api.best, bestUnit: 'goals',
          choices: [{id: '1', icon: '🤖', label: 'vs Computer', sub: 'Play the robot'}, {id: '2', icon: '👥', label: '2 players', sub: 'One iPad, two fingers'}], choice: String(players),
          seg: players === 1 ? {options: [{id: 'easy', label: 'Easy'}, {id: 'medium', label: 'Medium'}, {id: 'hard', label: 'Hard'}], value: level} : null,
          onPick: v => { players = +v; menu(); }, onSeg: v => { level = v; menu(); }, onPlay: begin});
      };
      const begin = () => {
        F.hide(); mode = 'play'; score = [0, 0]; glow = [0, 0]; rally = 0;
        pads[0] = mkPad(0); pads[1] = mkPad(1); ai.cool = 0; ai.ta = LEN - 110; ai.tx = WID/2;
        servePuck(Math.random() < 0.5 ? 0 : 1); pause = 1.0; F.callout('Face-off!', '#ffffff', 60, 1.0);
      };
      const finish = () => {
        mode = 'over';
        const p1win = score[0] > score[1];
        if (players === 1){
          const r = api.saveScore(score[0]);
          const stars = p1win ? (score[1] <= 3 ? 3 : 2) : 1;
          F.end({head: p1win ? 'You win! 🎉' : 'Robot wins this time', score: score[0], unit: `goal${score[0] === 1 ? '' : 's'} · final ${score[0]} – ${score[1]}`, stars, best: r.best, isBest: r.isBest,
            buttons: [{id: 'menu', label: 'Change mode'}], onPlay: begin, onBtn: menu});
          if (p1win && !RM) api.confetti(40);
        } else {
          F.end({head: `${p1win ? 'Player 1' : 'Player 2'} wins! 🎉`, noScore: true, lines: [`<span style="font:800 54px 'Baloo 2',sans-serif;color:#fff"><span style="color:${BLUE}">${score[0]}</span> – <span style="color:${RED}">${score[1]}</span></span>`],
            buttons: [{id: 'menu', label: 'Change mode'}], onPlay: begin, onBtn: menu});
          if (!RM) api.confetti(40);
        }
      };
      const servePuck = side => { Object.assign(puck, {a: side ? MID + 170 : MID - 170, x: WID/2, va: 0, vx: 0}); trail.forEach(t => t.on = false); };

      // ---- input: one paddle per finger, each on its own half ----
      const down = e => {
        if (mode !== 'play') return;
        const r = cv.getBoundingClientRect(), p = fromS(e.clientX - r.left, e.clientY - r.top);
        const side = p.a < MID ? 0 : 1;
        if (side === 1 && players === 1) return;
        const pad = pads[side];
        if (pad.ptr != null) return;              // that half already has a finger
        pad.ptr = e.pointerId; pad.ta = p.a; pad.tx = p.x;
        try { cv.setPointerCapture(e.pointerId); } catch(_){}
        e.preventDefault();
      };
      const move = e => {
        for (const pad of pads) if (pad.ptr === e.pointerId) {
          const r = cv.getBoundingClientRect(), p = fromS(e.clientX - r.left, e.clientY - r.top);
          pad.ta = p.a; pad.tx = p.x;
        }
      };
      const up = e => { for (const pad of pads) if (pad.ptr === e.pointerId) pad.ptr = null; };
      cv.addEventListener('pointerdown', down);
      cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);

      // ---- computer ----
      const thinkAI = dt => {
        const P = AI[level], pad = pads[1];
        ai.cool = Math.max(0, ai.cool - dt);
        const toward = puck.va > 40;             // coming at the computer's goal
        let ta, tx;
        if (puck.a > MID - 20 && ai.cool <= 0 && puck.a <= pad.a - 20 && (!toward || puck.a > LEN - 380 || Math.hypot(puck.va, puck.vx) < 350)) {
          // strike: come from behind the puck, aiming at the player's goal
          const ga = 0, gx = WID/2 + ai.off, da = ga - puck.a, dx = gx - puck.x, dl = Math.hypot(da, dx) || 1;
          ta = puck.a + da/dl*24; tx = puck.x + dx/dl*24;
        } else if (puck.a > pad.a - 10 && puck.a > MID) {
          // puck slipped behind: get back around it
          ta = Math.min(LEN - KR - 4, puck.a + 70); tx = puck.x + (puck.x > WID/2 ? -80 : 80);
        } else {
          ta = P.home; tx = WID/2 + (puck.x - WID/2)*0.65;
          if (toward && P.read) { // read where the puck will cross the goal line (with rail bounces)
            const t = (P.home - puck.a)/puck.va, span = WID - 2*PR;
            let px = (puck.x - PR + puck.vx*t) % (2*span); if (px < 0) px += 2*span;
            if (px > span) px = 2*span - px;
            const gx = Math.max(GOAL_LO - 20, Math.min(GOAL_HI + 20, PR + px));
            tx = tx + (gx - tx)*P.read;
          }
        }
        const k = Math.min(1, dt*P.lag);
        ai.ta += (ta - ai.ta)*k; ai.tx += (tx - ai.tx)*k;
        pad.ta = ai.ta; pad.tx = ai.tx;
        if (Math.hypot(puck.a - pad.a, puck.x - pad.x) < PR + KR + 4) { ai.cool = level === 'easy' ? 0.45 : level === 'medium' ? 0.25 : 0.1; ai.off = (Math.random()*2 - 1)*(P.err*3); }
      };

      // ---- physics ----
      const clampPad = (pad) => {
        const lo = pad.side ? MID + KR : KR, hi = pad.side ? LEN - KR : MID - KR;
        pad.ta = Math.max(lo, Math.min(hi, pad.ta)); pad.tx = Math.max(KR, Math.min(WID - KR, pad.tx));
      };
      const hitPad = (pad) => {
        const da = puck.a - pad.a, dx = puck.x - pad.x, d = Math.hypot(da, dx), m = PR + KR;
        if (d >= m) return;
        const na = d ? da/d : (pad.side ? -1 : 1), nx = d ? dx/d : 0;
        puck.a = pad.a + na*m; puck.x = pad.x + nx*m;
        const ra = puck.va - pad.va, rx = puck.vx - pad.vx, vn = ra*na + rx*nx;
        if (vn < 0) {
          puck.va -= 1.9*vn*na; puck.vx -= 1.9*vn*nx; puck.spin += (rx*na - ra*nx)*0.002;
          if (hitCd <= 0 && -vn > 160){
            hitCd = 0.08; const k = Math.min(1, -vn/1400), p = toS(pad.a + na*KR, pad.x + nx*KR);
            pad.sq = Math.max(pad.sq, 0.4 + k*0.6); puck.sq = Math.max(puck.sq, k);
            F.burst(p.x, p.y, {n: 6 + Math.round(k*12), color: ['#ffffff', pad.side ? '#ffc2cf' : '#c4dcff', '#ffe27a'], speed: 160 + k*320, life: 0.45, size: 3, kind: 'spark', glow: true, drag: 4});
            if (k > 0.75){ F.shake(0.18); rally++; if (rally >= 6 && rally % 3 === 0) F.callout(`${rally}-hit rally!`, '#ffe27a', 44, 1.0); }
            else rally++;
          }
        }
      };
      const post = (pa, px) => {
        const da = puck.a - pa, dx = puck.x - px, d = Math.hypot(da, dx);
        if (d >= PR || d === 0) return;
        const na = da/d, nx = dx/d; puck.a = pa + na*PR; puck.x = px + nx*PR;
        const vn = puck.va*na + puck.vx*nx; if (vn < 0) { puck.va -= 1.8*vn*na; puck.vx -= 1.8*vn*nx; }
      };
      const wallSpark = () => { const sp = Math.hypot(puck.va, puck.vx); if (sp > 700 && hitCd <= 0){ hitCd = 0.06; const p = toS(puck.a, puck.x); F.burst(p.x, p.y, {n: 5, color: '#cfe6ff', speed: 180, life: 0.35, size: 2.5, kind: 'spark', glow: true, drag: 5}); puck.sq = Math.max(puck.sq, 0.5); } };
      const goal = side => {   // side = who scored
        score[side]++; el.dataset.score = score.join('-'); rally = 0;
        glow[side ? 0 : 1] = 1;
        const end = side ? 0 : LEN, gp = toS(end, WID/2), col = side ? RED : BLUE;
        F.shake(0.6); F.flash(0.55, side ? RED_RGB : BLUE_RGB); F.hitPause(0.22);
        F.burst(gp.x, gp.y, {n: 40, color: [col, '#ffffff', '#ffe27a'], speed: 420, life: 1.1, size: 5, grav: 260, kind: 'confetti', drag: 1.6});
        F.burst(gp.x, gp.y, {n: 18, color: col, speed: 260, life: 0.6, size: 6, glow: true});
        F.fly('+1', gp.x, gp.y, 'p' + side, side ? '#ffb3c2' : '#b9d6ff');
        F.callout(players === 1 ? (side === 0 ? 'GOAL!' : 'Robot scores') : `GOAL! Player ${side + 1}`, side === 0 ? '#7fb6ff' : '#ff8aa2', 76, 1.3);
        if (score[side] >= WIN) { mode = 'ended'; puck.va = puck.vx = 0; later(finish, 1300); return; }
        servePuck(side ? 0 : 1); pause = 1.1;
      };
      const step = dt => {
        for (const pad of pads) {
          clampPad(pad);
          const pa = pad.a, px = pad.x;
          let da = pad.ta - pad.a, dx = pad.tx - pad.x; const d = Math.hypot(da, dx);
          const maxStep = (pad.side && players === 1 ? AI[level].speed : 4000)*dt;
          if (d > maxStep) { da *= maxStep/d; dx *= maxStep/d; }
          pad.a += da; pad.x += dx;
          pad.va = (pad.a - pa)/dt; pad.vx = (pad.x - px)/dt;
        }
        if (pause > 0 || mode !== 'play') return;
        puck.a += puck.va*dt; puck.x += puck.vx*dt;
        if (puck.x < PR) { puck.x = PR; puck.vx = Math.abs(puck.vx)*E_WALL; wallSpark(); }
        if (puck.x > WID - PR) { puck.x = WID - PR; puck.vx = -Math.abs(puck.vx)*E_WALL; wallSpark(); }
        const inMouth = puck.x > GOAL_LO && puck.x < GOAL_HI;
        if (!inMouth) {
          if (puck.a < PR) { puck.a = PR; puck.va = Math.abs(puck.va)*E_WALL; wallSpark(); }
          if (puck.a > LEN - PR) { puck.a = LEN - PR; puck.va = -Math.abs(puck.va)*E_WALL; wallSpark(); }
        }
        post(0, GOAL_LO); post(0, GOAL_HI); post(LEN, GOAL_LO); post(LEN, GOAL_HI);
        hitPad(pads[0]); hitPad(pads[1]);
        const sp = Math.hypot(puck.va, puck.vx); if (sp > MAXV) { puck.va *= MAXV/sp; puck.vx *= MAXV/sp; }
        if (puck.a < -PR) goal(1); else if (puck.a > LEN + PR) goal(0);
      };
      let trailT = 0;
      const update = dt => {
        F.tick(dt);
        if (F.paused()) return;           // hit pause on a goal
        hitCd -= dt;
        if (mode === 'play' || mode === 'ended') {
          if (players === 1 && mode === 'play') thinkAI(dt);
          if (pause > 0) pause -= dt;
          for (let i = 0; i < 4; i++) step(dt/4);
          const f = Math.exp(-0.32*dt); puck.va *= f; puck.vx *= f; puck.spin *= Math.exp(-1.5*dt);
          if (mode === 'play' && pause <= 0 && Math.hypot(puck.va, puck.vx) < 6 && Math.abs(puck.a - MID) < PR) puck.va += (Math.random() < 0.5 ? -60 : 60);
        }
        trailT += dt;
        if (trailT > 1/60){ trailT = 0; const p = toS(puck.a, puck.x), t = trail[trailI]; t.x = p.x; t.y = p.y; t.on = Math.hypot(puck.va, puck.vx) > 380; trailI = (trailI + 1) % trail.length; }
        for (const pad of pads) pad.sq = Math.max(0, pad.sq - dt*5);
        puck.sq = Math.max(0, puck.sq - dt*6);
        glow[0] = Math.max(0, glow[0] - dt*0.8); glow[1] = Math.max(0, glow[1] - dt*0.8);
      };

      // ---- drawing ----
      const drawPad = (pad, color, rgb, emoji) => {
        const p = toS(pad.a, pad.x), s = 1 + pad.sq*0.14, r = KR*sc*s;
        cx.fillStyle = 'rgba(10,20,50,.28)'; cx.beginPath(); cx.ellipse(p.x + 5*sc, p.y + 9*sc, r*1.02, r*0.96, 0, 0, 6.283); cx.fill();
        if (pad.ptr != null || (pad.side && players === 1)){ cx.fillStyle = `rgba(${rgb},.18)`; cx.beginPath(); cx.arc(p.x, p.y, r*1.35, 0, 6.283); cx.fill(); }
        // outer skirt
        let g = cx.createRadialGradient(p.x - r*0.35, p.y - r*0.45, r*0.1, p.x, p.y, r);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.18, color); g.addColorStop(0.85, color); g.addColorStop(1, 'rgba(0,0,0,.55)');
        cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.283); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(p.x, p.y, r - 1.5, Math.PI*1.05, Math.PI*1.75); cx.stroke();
        // raised knob
        const kr = r*0.62;
        g = cx.createRadialGradient(p.x - kr*0.35, p.y - kr*0.4, kr*0.1, p.x, p.y, kr);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#e8eef8'); g.addColorStop(1, '#9aa9c4');
        cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.arc(p.x + 1.5, p.y + 3, kr, 0, 6.283); cx.fill();
        cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, kr, 0, 6.283); cx.fill();
        cx.font = `${Math.round(kr*1.25)}px ${F.EMO}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#000';
        cx.fillText(emoji, p.x, p.y + kr*0.08);
      };
      const draw = () => {
        cx.setTransform(D,0,0,D,0,0);
        const sh = F.shakeXY(); cx.save(); cx.translate(sh.x, sh.y);
        cx.drawImage(bg, 0, 0, W, H);
        // goal lights
        for (const side of [0, 1]) if (glow[side] > 0){
          const gp = toS(side ? LEN : 0, WID/2), r = 260*sc, g = cx.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, r);
          g.addColorStop(0, `rgba(${side ? RED_RGB : BLUE_RGB},${glow[side]*0.55})`); g.addColorStop(1, 'rgba(0,0,0,0)');
          cx.fillStyle = g; cx.fillRect(gp.x - r, gp.y - r, 2*r, 2*r);
        }
        // big painted-in scores, upright for each player
        const s1 = port ? toS(MID - 120, WID/2) : toS(MID - 130, WID/2), s2 = port ? toS(MID + 120, WID/2) : toS(MID + 130, WID/2), fs = Math.round(92*sc);
        cx.font = `800 ${fs}px ${F.HF}`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillStyle = `rgba(${BLUE_RGB},.16)`; cx.fillText(String(score[0]), s1.x, s1.y);
        cx.save(); cx.translate(s2.x, s2.y); if (port && players === 2) cx.rotate(Math.PI); cx.fillStyle = `rgba(${RED_RGB},.16)`; cx.fillText(String(score[1]), 0, 0); cx.restore();
        // puck trail
        const pr = PR*sc;
        for (let i = 1; i <= trail.length; i++){ const t = trail[(trailI + i) % trail.length]; if (!t.on) continue; const k = i/trail.length;
          cx.fillStyle = `rgba(255,214,90,${k*0.28})`; cx.beginPath(); cx.arc(t.x, t.y, pr*(0.35 + k*0.6), 0, 6.283); cx.fill(); }
        // puck: shadow, body, rim, gold ring, highlight, stretched along its path
        const pp = toS(puck.a, puck.x), spd = Math.hypot(puck.va, puck.vx);
        const ang = port ? Math.atan2(-puck.va, puck.vx) : Math.atan2(puck.vx, puck.va), st = RM ? 0 : Math.min(0.22, spd/MAXV*0.25) + puck.sq*0.12;
        cx.fillStyle = 'rgba(10,20,50,.3)'; cx.beginPath(); cx.ellipse(pp.x + 3*sc, pp.y + 6*sc, pr*1.05, pr, 0, 0, 6.283); cx.fill();
        cx.save(); cx.translate(pp.x, pp.y); cx.rotate(ang); cx.scale(1 + st, 1 - st*0.6); cx.rotate(-ang);
        let g = cx.createRadialGradient(-pr*0.35, -pr*0.4, pr*0.1, 0, 0, pr);
        g.addColorStop(0, '#5a6378'); g.addColorStop(0.6, '#20263a'); g.addColorStop(1, '#0b0e18');
        cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, pr, 0, 6.283); cx.fill();
        cx.strokeStyle = '#ffd24a'; cx.lineWidth = 3*sc; cx.beginPath(); cx.arc(0, 0, pr*0.62, 0, 6.283); cx.stroke();
        cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(0, 0, pr - 1, Math.PI*1.1, Math.PI*1.7); cx.stroke();
        cx.restore();
        drawPad(pads[0], BLUE, BLUE_RGB, api.avatar || '🙂');
        drawPad(pads[1], RED, RED_RGB, players === 1 ? '🤖' : '⭐');
        F.drawParts(cx);
        if (mode === 'play' && pads[0].ptr == null && score[0] + score[1] === 0) {
          const h = toS(150, WID/2), bob = RM ? 0 : Math.sin(performance.now()/260)*5;
          F.text(cx, '👆 Drag your paddle', h.x, h.y + (port ? -90*sc : 0) + bob, Math.round(26*Math.max(0.85, sc)), '#ffffff');
        }
        if (players === 2 && mode === 'play' && pads[1].ptr == null && score[0] + score[1] === 0) {
          const h = toS(LEN - 150, WID/2);
          cx.save(); cx.translate(h.x, h.y + (port ? 90*sc : 0)); if (port) cx.rotate(Math.PI); F.text(cx, 'Player 2: drag here', 0, 0, Math.round(26*Math.max(0.85, sc)), '#ffffff'); cx.restore();
        }
        cx.restore();
        // glass HUD
        if (mode !== 'menu'){
          const hh = 48, y = Math.max(8, (HUD - hh)/2);
          F.pill(cx, 12, y, {key: 'p0', icon: api.avatar || '🙂', label: players === 1 ? 'You' : 'Player 1', value: score[0], h: hh, accent: BLUE});
          F.pill(cx, W - 12, y, {key: 'p1', icon: players === 1 ? '🤖' : '⭐', label: players === 1 ? 'Robot' : 'Player 2', value: score[1], align: 'right', h: hh, accent: RED});
          if (W > 520) F.pill(cx, W/2, y, {key: 'goal', icon: '🏁', label: 'First to', value: WIN, align: 'center', h: hh});
        }
        F.drawFx(cx, W, H, oy);
      };
      const frame = now => {
        if (!alive) return;
        const dt = Math.min(0.033, (now - (last || now))/1000); last = now;
        update(dt); draw();
        raf = requestAnimationFrame(frame);
      };
      size(); window.addEventListener('resize', size);
      menu();
      raf = requestAnimationFrame(frame);

      return () => {
        alive = false; cancelAnimationFrame(raf);
        timers.forEach(t => clearTimeout(t)); timers.clear();
        window.removeEventListener('resize', size);
        cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
        cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
        F.cleanup();
        delete el._hk; el.innerHTML = '';
      };
    }
  };
})();
