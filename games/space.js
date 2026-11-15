// Space Dodge: drag anywhere to steer the rocket left and right. Dodge the falling rocks,
// grab stars, pick up a shield. Three hits and the round is over. Score = stars + time bonus.
// Brain Break look: a deep-space scene with nebulae and a ringed planet, a lit rocket with the
// player's avatar in the window, glowing pickups, explosions and a glass HUD.
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
  window.BreakGames.space = {
    start(el, api){
      const F = bbFrame(el, api), RM = F.RM, HEAD = F.HF;

      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.insertBefore(cv, el.firstChild);
      const cx = cv.getContext('2d');
      const bg = document.createElement('canvas'), bx = bg.getContext('2d');

      let W = 0, H = 0, dpr = 1, raf = 0, last = 0, alive = true;
      const size = () => {
        const r = el.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); cx.setTransform(dpr,0,0,dpr,0,0);
        bg.width = cv.width; bg.height = cv.height; drawStatic();
        if (g) g.x = Math.max(30, Math.min(W - 30, g.x));
      };
      const mk = (w, h) => { const c = document.createElement('canvas'), d = Math.min(window.devicePixelRatio || 1, 2.5); c.width = Math.ceil(w*d); c.height = Math.ceil(h*d); const x = c.getContext('2d'); x.scale(d, d); return [c, x]; };

      // ---- the cached backdrop: nebulae, a galaxy band and a ringed planet ----
      function drawStatic(){
        const c = bx; c.setTransform(dpr,0,0,dpr,0,0);
        let gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#03051a'); gr.addColorStop(0.55, '#0c0b30'); gr.addColorStop(1, '#1d1150');
        c.fillStyle = gr; c.fillRect(0, 0, W, H);
        const neb = (x, y, r, col) => { const q = c.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, col); q.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = q; c.fillRect(x - r, y - r, 2*r, 2*r); };
        neb(W*0.18, H*0.28, Math.max(W, H)*0.45, 'rgba(150,80,240,.30)');
        neb(W*0.9, H*0.62, Math.max(W, H)*0.4, 'rgba(30,170,240,.22)');
        neb(W*0.55, H*0.05, Math.max(W, H)*0.3, 'rgba(255,90,160,.16)');
        // a soft galaxy band
        c.save(); c.translate(W/2, H*0.35); c.rotate(-0.45);
        gr = c.createLinearGradient(0, -H*0.12, 0, H*0.12); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(200,190,255,.10)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = gr; c.fillRect(-W, -H*0.12, 2*W, H*0.24);
        let seed = 11; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
        for (let i = 0; i < 260; i++){ c.globalAlpha = 0.15 + rnd()*0.4; c.fillStyle = rnd() < 0.3 ? '#ffd9f0' : '#e2e6ff'; c.fillRect((rnd() - 0.5)*2*W, (rnd() - 0.5)*H*0.2, 1.2, 1.2); }
        c.restore(); c.globalAlpha = 1;
        // ringed planet, lower right, lit from the upper left
        const pr = Math.min(W, H)*0.24, px = W*0.86, py = H*0.82;
        neb(px, py, pr*1.8, 'rgba(255,150,90,.18)');
        const ring = (front) => { c.save(); c.translate(px, py); c.rotate(-0.35); c.beginPath(); c.ellipse(0, 0, pr*1.75, pr*0.42, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI*2);
          c.strokeStyle = 'rgba(255,214,170,.55)'; c.lineWidth = pr*0.13; c.stroke(); c.strokeStyle = 'rgba(255,240,220,.35)'; c.lineWidth = pr*0.04; c.stroke(); c.restore(); };
        ring(false);
        gr = c.createRadialGradient(px - pr*0.45, py - pr*0.5, pr*0.1, px, py, pr);
        gr.addColorStop(0, '#ffd2a0'); gr.addColorStop(0.45, '#e2734d'); gr.addColorStop(0.85, '#7a2a4a'); gr.addColorStop(1, '#2a0d2e');
        c.fillStyle = gr; c.beginPath(); c.arc(px, py, pr, 0, 6.283); c.fill();
        c.save(); c.beginPath(); c.arc(px, py, pr, 0, 6.283); c.clip();
        c.globalAlpha = 0.18; c.strokeStyle = '#fff1d6'; c.lineWidth = pr*0.06;
        for (let i = -3; i <= 3; i++){ c.beginPath(); c.ellipse(px, py + i*pr*0.26, pr*1.1, pr*0.12, -0.12, 0, 6.283); c.stroke(); }
        c.restore(); c.globalAlpha = 1;
        c.strokeStyle = 'rgba(255,200,160,.5)'; c.lineWidth = 3; c.beginPath(); c.arc(px, py, pr + 1, Math.PI*0.95, Math.PI*1.6); c.stroke();
        ring(true);
        // a small blue moon, upper left
        const mr = Math.min(W, H)*0.05, mx = W*0.12, my = H*0.16;
        gr = c.createRadialGradient(mx - mr*0.4, my - mr*0.4, 1, mx, my, mr); gr.addColorStop(0, '#d9f4ff'); gr.addColorStop(0.6, '#4a9be0'); gr.addColorStop(1, '#13284f');
        c.fillStyle = gr; c.beginPath(); c.arc(mx, my, mr, 0, 6.283); c.fill();
        // vignette
        gr = c.createRadialGradient(W/2, H/2, Math.min(W, H)*0.35, W/2, H/2, Math.max(W, H)*0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,10,.55)');
        c.fillStyle = gr; c.fillRect(0, 0, W, H);
        c.setTransform(1,0,0,1,0,0);
      }

      // ---- sprites, prerendered once per size ----
      const cache = {};
      function rockSprite(kind, r){
        const k = 'r' + kind + '|' + r; if (cache[k]) return cache[k];
        const sz = Math.ceil(r*2.6), [c, x] = mk(sz, sz); x.translate(sz/2, sz/2);
        let seed = kind*97 + 13; const rnd = () => (seed = (seed*9301 + 49297) % 233280)/233280;
        const pts = []; const n = 12;
        for (let i = 0; i < n; i++){ const a = i/n*Math.PI*2, rr = r*(0.8 + rnd()*0.28); pts.push([Math.cos(a)*rr, Math.sin(a)*rr]); }
        const path = () => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); };
        const tint = [['#c9b9a8','#8d7b6a','#3a2f27'], ['#b8b0c8','#6f6987','#26223a'], ['#d0b090','#93684a','#3b2416'], ['#a9b4c2','#667386','#1f2633']][kind%4];
        path(); const gr = x.createRadialGradient(-r*0.45, -r*0.5, r*0.1, 0, 0, r*1.15); gr.addColorStop(0, tint[0]); gr.addColorStop(0.5, tint[1]); gr.addColorStop(1, tint[2]);
        x.fillStyle = gr; x.fill();
        x.save(); path(); x.clip();
        for (let i = 0; i < 5; i++){ const a = rnd()*6.28, rr = rnd()*r*0.55, cr = r*(0.1 + rnd()*0.17), cx0 = Math.cos(a)*rr, cy0 = Math.sin(a)*rr;
          x.fillStyle = 'rgba(20,12,8,.38)'; x.beginPath(); x.arc(cx0, cy0, cr, 0, 7); x.fill();
          x.strokeStyle = 'rgba(255,240,220,.25)'; x.lineWidth = Math.max(1, cr*0.25); x.beginPath(); x.arc(cx0, cy0, cr, Math.PI*0.1, Math.PI*0.9); x.stroke(); }
        // dark side away from the light
        const sh = x.createLinearGradient(-r, -r, r, r); sh.addColorStop(0.45, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,15,.55)'); x.fillStyle = sh; x.fillRect(-r*1.3, -r*1.3, r*2.6, r*2.6);
        x.restore();
        path(); x.strokeStyle = 'rgba(255,220,190,.35)'; x.lineWidth = 2; x.stroke();
        return (cache[k] = {c, sz});
      }
      function starSprite(px){
        const k = 's' + px; if (cache[k]) return cache[k];
        const sz = Math.ceil(px*2.2), [c, x] = mk(sz, sz); x.translate(sz/2, sz/2);
        let gr = x.createRadialGradient(0, 0, 0, 0, 0, sz/2); gr.addColorStop(0, 'rgba(255,230,120,.55)'); gr.addColorStop(1, 'rgba(255,200,60,0)'); x.fillStyle = gr; x.fillRect(-sz/2, -sz/2, sz, sz);
        const R = px*0.5, r = R*0.45; x.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r : R; x.lineTo(Math.cos(a)*rr, Math.sin(a)*rr); } x.closePath();
        gr = x.createLinearGradient(-R, -R, R, R); gr.addColorStop(0, '#fff6b8'); gr.addColorStop(0.5, '#ffd23a'); gr.addColorStop(1, '#e88a00');
        x.fillStyle = gr; x.fill(); x.lineWidth = 2; x.strokeStyle = '#b86200'; x.stroke();
        x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.ellipse(-R*0.2, -R*0.3, R*0.16, R*0.1, -0.6, 0, 7); x.fill();
        return (cache[k] = {c, sz});
      }
      function glowSprite(col, px){
        const k = 'g' + col + px; if (cache[k]) return cache[k];
        const [c, x] = mk(px, px); const gr = x.createRadialGradient(px/2, px/2, 0, px/2, px/2, px/2);
        gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(0.35, `rgba(${col},.45)`); gr.addColorStop(1, `rgba(${col},0)`);
        x.fillStyle = gr; x.fillRect(0, 0, px, px); return (cache[k] = {c, sz: px});
      }
      function rocketSprite(u){
        const k = 'k' + u.toFixed(2); if (cache[k]) return cache[k];
        const w = 70*u, h = 110*u, [c, x] = mk(w, h); x.translate(w/2, h*0.5);
        const s = u;
        // fins
        x.fillStyle = '#d92f45';
        for (const sg of [-1, 1]){ x.beginPath(); x.moveTo(sg*12*s, 10*s); x.quadraticCurveTo(sg*30*s, 20*s, sg*30*s, 42*s); x.lineTo(sg*12*s, 32*s); x.closePath(); x.fill(); }
        x.fillStyle = 'rgba(0,0,0,.25)'; for (const sg of [-1, 1]){ x.beginPath(); x.moveTo(sg*12*s, 26*s); x.lineTo(sg*30*s, 42*s); x.lineTo(sg*12*s, 32*s); x.closePath(); x.fill(); }
        // body
        x.beginPath(); x.moveTo(0, -48*s); x.bezierCurveTo(18*s, -30*s, 16*s, 10*s, 12*s, 34*s); x.lineTo(-12*s, 34*s); x.bezierCurveTo(-16*s, 10*s, -18*s, -30*s, 0, -48*s); x.closePath();
        let gr = x.createLinearGradient(-16*s, 0, 16*s, 0); gr.addColorStop(0, '#9aa6bd'); gr.addColorStop(0.35, '#ffffff'); gr.addColorStop(0.7, '#d7deea'); gr.addColorStop(1, '#6d7891');
        x.fillStyle = gr; x.fill(); x.lineWidth = 1.5; x.strokeStyle = 'rgba(40,50,80,.5)'; x.stroke();
        // nose cone
        x.save(); x.clip(); gr = x.createLinearGradient(-16*s, 0, 16*s, 0); gr.addColorStop(0, '#a01c30'); gr.addColorStop(0.4, '#ff5468'); gr.addColorStop(1, '#8c1426');
        x.fillStyle = gr; x.fillRect(-20*s, -50*s, 40*s, 22*s); x.restore();
        // center fin
        x.fillStyle = '#b8233a'; x.fillRect(-2.5*s, 14*s, 5*s, 24*s);
        // window ring
        x.fillStyle = '#4b5570'; x.beginPath(); x.arc(0, -8*s, 11.5*s, 0, 7); x.fill();
        gr = x.createRadialGradient(-3*s, -11*s, 1, 0, -8*s, 9*s); gr.addColorStop(0, '#bff0ff'); gr.addColorStop(1, '#1d6aa8');
        x.fillStyle = gr; x.beginPath(); x.arc(0, -8*s, 9*s, 0, 7); x.fill();
        x.font = `${Math.round(13*s)}px ${F.EMO}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(api.avatar || '🙂', 0, -7.5*s);
        x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(-3.5*s, -12*s, 3*s, 1.8*s, -0.6, 0, 7); x.fill();
        // nozzle
        gr = x.createLinearGradient(-9*s, 0, 9*s, 0); gr.addColorStop(0, '#3a4256'); gr.addColorStop(0.5, '#9aa4b8'); gr.addColorStop(1, '#2a3040');
        x.fillStyle = gr; x.beginPath(); x.moveTo(-9*s, 33*s); x.lineTo(9*s, 33*s); x.lineTo(11*s, 41*s); x.lineTo(-11*s, 41*s); x.closePath(); x.fill();
        return (cache[k] = {c, w, h});
      }
      const emo = {};
      function emoSprite(ch, px){ const k = ch + px; if (emo[k]) return emo[k]; const sz = Math.ceil(px*1.3), [c, x] = mk(sz, sz); x.font = `${px}px ${F.EMO}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, sz/2, sz/2 + px*0.05); return (emo[k] = {c, sz}); }
      const stamp = (sp, x, y, rot, s) => { const w = (sp.w || sp.sz)*(s || 1), h = (sp.h || sp.sz)*(s || 1); if (rot){ cx.save(); cx.translate(x, y); cx.rotate(rot); cx.drawImage(sp.c, -w/2, -h/2, w, h); cx.restore(); } else cx.drawImage(sp.c, x - w/2, y - h/2, w, h); };

      const stars = [[], [], []];
      for (let L = 0; L < 3; L++) for (let i = 0; i < 40 + L*12; i++) stars[L].push({x: Math.random(), y: Math.random(), r: 0.6 + L*0.6 + Math.random()*0.6, tw: Math.random()*6});
      const LAYER_SPEED = [18, 45, 95];

      let g = null;
      g = {mode: 'start', x: 0, tx: 0, t: 0, lives: 3, stars: 0, rocks: [], items: [], pops: [], inv: 0, shield: 0, spawnT: 0, itemT: 2, shieldT: 14, shake: 0, endT: 0, streak: 0, streakT: 0, hurt: 0, exT: 0, boom: null};
      el.__space = g; // read-only peek for automated tests
      size(); window.addEventListener('resize', size);
      g.x = g.tx = W/2;
      const rocketY = () => H - Math.max(80, H*0.15);
      const unit = () => Math.max(0.75, Math.min(1.4, Math.min(W, H*1.2)/700));

      function newRound(){
        Object.assign(g, {mode: 'play', t: 0, lives: 3, stars: 0, inv: 1, shield: 0, spawnT: 0.6, itemT: 1.6, shieldT: 12 + Math.random()*6, shake: 0, endT: 0, streak: 0, streakT: 0, hurt: 0, boom: null});
        g.rocks.length = 0; g.items.length = 0; g.pops.length = 0;
        g.x = g.tx = W/2;
        F.callout('Blast off!', '#9eeaff', 64, 1.0);
      }
      const speedNow = () => (150 + g.t*5.5) * (H/700) * (api.grade >= 5 ? 1.1 : 1);
      const scoreOf = () => g.stars + Math.floor(g.t/3);

      function spawnRock(){
        const u = unit(), r = (18 + Math.random()*(14 + Math.min(18, g.t*0.4)))*u;
        g.rocks.push({x: r + Math.random()*(W - 2*r), y: -r - 10, r, vy: speedNow()*(0.75 + Math.random()*0.5), vx: (Math.random() - 0.5)*30*u, rot: Math.random()*6, vr: (Math.random() - 0.5)*2, kind: Math.floor(Math.random()*4)});
      }
      function spawnItem(type){
        const u = unit(); g.items.push({type, x: 40 + Math.random()*(W - 80), y: -30, vy: speedNow()*0.6, r: 22*u, ph: Math.random()*6});
      }

      function step(dt){
        F.tick(dt);
        for (let L = 0; L < 3; L++){ const v = LAYER_SPEED[L]*(g.mode === 'play' ? 1 + g.t/60 : 1)*dt/H; for (const s of stars[L]){ s.y += v; s.tw += dt*3; if (s.y > 1){ s.y -= 1; s.x = Math.random(); } } }
        if (g.mode !== 'play') return;
        if (F.paused()) return;
        g.t += dt;
        g.x += (g.tx - g.x)*Math.min(1, dt*14);
        g.inv = Math.max(0, g.inv - dt); g.shield = Math.max(0, g.shield - dt); g.hurt = Math.max(0, g.hurt - dt*2);
        g.streakT -= dt; if (g.streakT <= 0) g.streak = 0;
        g.spawnT -= dt;
        if (g.spawnT <= 0){ spawnRock(); g.spawnT = Math.max(0.28, 0.95 - g.t*0.012) * (0.7 + Math.random()*0.6); if (g.t > 40 && Math.random() < 0.25) spawnRock(); }
        g.itemT -= dt; if (g.itemT <= 0){ spawnItem('star'); g.itemT = 0.9 + Math.random()*1.2; }
        g.shieldT -= dt; if (g.shieldT <= 0){ spawnItem('shield'); g.shieldT = 16 + Math.random()*10; }
        const u = unit(), ry = rocketY(), rr = 22*u;
        // engine exhaust
        g.exT -= dt; if (g.exT <= 0){ g.exT = 0.035; F.burst(g.x + (Math.random() - 0.5)*8*u, ry + 52*u, {n: 1, dir: Math.PI/2, spread: 0.5, speed: 220, life: 0.45, size: 5*u, color: ['#ffb347', '#ff7b39', '#ffe9a6'], glow: true, drag: 3}); }
        for (let i = g.rocks.length - 1; i >= 0; i--){ const k = g.rocks[i]; k.y += k.vy*dt; k.x += k.vx*dt; k.rot += k.vr*dt;
          if (k.x < k.r || k.x > W - k.r) k.vx = -k.vx;
          if (k.y - k.r > H){ g.rocks.splice(i, 1); continue; }
          const dx = k.x - g.x, dy = k.y - ry, hitR = k.r*0.78 + rr;
          if (dx*dx + dy*dy < hitR*hitR){
            if (g.shield > 0){ g.shield = 0; g.inv = 0.8; F.burst(k.x, k.y, {n: 22, color: ['#7fe3ff', '#ffffff'], speed: 320, life: 0.6, size: 4, kind: 'spark', glow: true}); F.burst(k.x, k.y, {n: 10, color: ['#9a8f86', '#6d6259'], speed: 200, life: 0.8, size: 5, grav: 120}); F.callout('Shield saved you!', '#9eeaff', 44, 1.0); g.rocks.splice(i, 1); F.shake(0.15); continue; }
            if (g.inv > 0) continue;
            g.lives--; g.inv = 1.6; g.hurt = 1; F.shake(0.4); F.flash(0.45, '255,80,60'); F.hitPause(0.08);
            F.burst(k.x, k.y, {n: 16, color: ['#ffb36b', '#ff6a3c', '#ffe9a6'], speed: 300, life: 0.6, size: 4, kind: 'spark', glow: true});
            F.burst(k.x, k.y, {n: 12, color: ['#9a8f86', '#6d6259', '#c9b9a8'], speed: 220, life: 0.9, size: 5, grav: 140});
            g.rocks.splice(i, 1);
            if (g.lives <= 0){
              F.burst(g.x, ry, {n: 50, color: ['#ffffff', '#ffd27a', '#ff7a3c', '#ff3c3c'], speed: 460, life: 1.1, size: 6, glow: true});
              F.burst(g.x, ry, {n: 24, color: ['#c9d2e4', '#d92f45', '#6d7891'], speed: 300, life: 1.3, size: 5, grav: 160, kind: 'confetti'});
              g.boom = {x: g.x, y: ry, t: 0}; F.shake(0.9); F.flash(0.8, '255,200,140'); F.callout('KABOOM!', '#ffb36b', 80, 1.1);
              g.mode = 'crash'; g.endT = 1.4; return;
            }
            F.callout(g.lives === 1 ? 'Last life!' : 'Ouch!', '#ffb3a7', 50, 0.8);
          }
        }
        for (let i = g.items.length - 1; i >= 0; i--){ const it = g.items[i]; it.y += it.vy*dt; it.ph += dt*3;
          if (it.y - it.r > H){ g.items.splice(i, 1); if (it.type === 'star') g.streak = 0; continue; }
          const dx = it.x - g.x, dy = it.y - ry, R = it.r + rr*1.1;
          if (dx*dx + dy*dy < R*R){
            g.items.splice(i, 1);
            if (it.type === 'star'){
              g.stars++; g.streak++; g.streakT = 2.5;
              F.burst(it.x, it.y, {n: 12, color: ['#ffe066', '#ffffff', '#ffb020'], speed: 220, life: 0.55, size: 3, kind: 'spark', glow: true});
              F.fly('+1', it.x, it.y, 'stars', '#fff2a8');
              if (g.streak >= 3 && g.streak % 3 === 0) F.callout(`Star streak ×${g.streak}!`, '#ffe066', 48, 1.0);
            } else {
              g.shield = 9; F.burst(it.x, it.y, {n: 20, color: ['#7fe3ff', '#ffffff'], speed: 260, life: 0.7, size: 4, glow: true}); F.callout('Shield on!', '#9eeaff', 48, 1.0);
            }
          }
        }
      }
      function finish(){
        g.mode = 'end';
        const sc = scoreOf(), secs = Math.floor(g.t), bonus = Math.floor(g.t/3);
        const res = api.saveScore(sc);
        F.end({head: '💥 Rocket down!', score: sc, unit: 'points', stars: 1 + (sc >= 30 ? 1 : 0) + (sc >= 70 ? 1 : 0), best: res.best, isBest: res.isBest,
          lines: [`⭐ ${g.stars} star${g.stars === 1 ? '' : 's'} + ⏱️ ${bonus} time bonus (${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')} flown)`], onPlay: () => { F.hide(); newRound(); }});
      }
      function startScreen(){
        g.mode = 'start';
        F.title({icon: '🚀', title: 'Space Dodge', howIcon: '👆', how: 'Drag anywhere to steer. Dodge rocks, grab ⭐ stars, catch a 🛡️ shield!', best: api.best, bestUnit: 'points',
          onPlay: () => { F.hide(); newRound(); }});
      }

      // Relative drag: the finger can be anywhere, so it never covers the rocket.
      let drag = null;
      const px = e => { const r = cv.getBoundingClientRect(); return e.clientX - r.left; };
      const down = e => { if (e.button > 0) return; e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(_){} drag = {id: e.pointerId, x0: px(e), r0: g.tx}; };
      const move = e => { if (!drag || e.pointerId !== drag.id) return; e.preventDefault(); g.tx = Math.max(26, Math.min(W - 26, drag.r0 + (px(e) - drag.x0)*1.25)); };
      const up = e => { if (drag && e.pointerId === drag.id) drag = null; };
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

      function draw(){
        cx.drawImage(bg, 0, 0, W, H);
        const sh = F.shakeXY(); cx.save(); cx.translate(sh.x, sh.y);
        const spd = g.mode === 'play' ? 1 + g.t/60 : 1;
        for (let L = 0; L < 3; L++){
          cx.fillStyle = L === 2 ? '#ffffff' : L === 1 ? '#c9d4ff' : '#8a96c8';
          for (const s of stars[L]){
            const a = L === 1 ? 0.55 + 0.45*Math.sin(s.tw) : 1;
            cx.globalAlpha = a; cx.fillRect(s.x*W, s.y*H, s.r, s.r*(L === 2 ? 1 + spd*1.6 : 1));
          }
        }
        cx.globalAlpha = 1;
        const u = unit();
        for (const it of g.items){
          const bob = Math.sin(it.ph)*3;
          if (it.type === 'star'){ stamp(glowSprite('255,220,90', Math.round(90*u)), it.x, it.y + bob, 0, 1 + Math.sin(it.ph*1.3)*0.08); stamp(starSprite(Math.round(36*u)), it.x, it.y + bob, Math.sin(it.ph)*0.3); }
          else { stamp(glowSprite('110,220,255', Math.round(110*u)), it.x, it.y + bob, 0); cx.strokeStyle = 'rgba(160,240,255,.85)'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(it.x, it.y + bob, it.r*1.25, 0, 7); cx.stroke(); stamp(emoSprite('🛡️', Math.round(34*u)), it.x, it.y + bob, 0); }
        }
        for (const k of g.rocks){
          const sp = rockSprite(k.kind, Math.round(k.r/4)*4);
          cx.save(); cx.translate(k.x, k.y); cx.rotate(k.rot); cx.drawImage(sp.c, -sp.sz/2, -sp.sz/2, sp.sz, sp.sz); cx.restore();
          if (k.vy > 260){ cx.strokeStyle = 'rgba(255,170,110,.18)'; cx.lineWidth = k.r*0.9; cx.beginPath(); cx.moveTo(k.x, k.y - k.r*0.5); cx.lineTo(k.x - k.vx*0.12, k.y - k.r - k.vy*0.12); cx.stroke(); }
        }
        F.drawParts(cx);
        const ry = rocketY();
        if (g.mode !== 'crash' && g.mode !== 'end'){
          const blink = g.inv > 0 && g.mode === 'play' && (RM ? true : Math.floor(g.t*12) % 2 === 0);
          const ru = u*1.2, tilt = (g.tx - g.x)*0.004, fl = RM ? 1 : 0.85 + Math.random()*0.3;
          cx.save(); cx.translate(g.x, ry); cx.rotate(tilt);
          // engine glow and flame
          stamp(glowSprite('255,150,60', Math.round(90*ru)), 0, 52*ru, 0, fl);
          cx.globalCompositeOperation = 'lighter';
          stamp(glowSprite('255,220,140', Math.round(34*ru)), 0, 50*ru, 0, fl*1.1);
          cx.fillStyle = 'rgba(255,190,90,.75)'; cx.beginPath(); cx.moveTo(-9*ru, 42*ru); cx.quadraticCurveTo(0, (70 + 22*fl)*ru, 9*ru, 42*ru); cx.fill();
          cx.fillStyle = 'rgba(255,255,220,.9)'; cx.beginPath(); cx.moveTo(-5*ru, 42*ru); cx.quadraticCurveTo(0, (56 + 10*fl)*ru, 5*ru, 42*ru); cx.fill();
          cx.globalCompositeOperation = 'source-over';
          cx.globalAlpha = blink ? 0.4 : 1;
          const rs = rocketSprite(ru); cx.drawImage(rs.c, -rs.w/2, -rs.h/2, rs.w, rs.h);
          cx.globalAlpha = 1;
          cx.restore();
          if (g.shield > 0){
            const a = g.shield < 2 ? (Math.floor(g.t*8) % 2 ? 0.3 : 0.8) : 0.8, r = 52*u;
            stamp(glowSprite('110,220,255', Math.round(r*2.6)), g.x, ry, 0);
            cx.strokeStyle = `rgba(170,240,255,${a})`; cx.lineWidth = 3; cx.beginPath(); cx.arc(g.x, ry, r, 0, 7); cx.stroke();
            cx.strokeStyle = `rgba(255,255,255,${a*0.6})`; cx.lineWidth = 2; cx.beginPath(); cx.arc(g.x, ry, r - 5, Math.PI*1.1 + g.t, Math.PI*1.6 + g.t); cx.stroke();
          }
        }
        if (g.boom){ const b = g.boom; b.t += 1/60; if (b.t < 0.8){ cx.strokeStyle = `rgba(255,220,170,${1 - b.t/0.8})`; cx.lineWidth = 8*(1 - b.t/0.8) + 1; cx.beginPath(); cx.arc(b.x, b.y, 20 + b.t*420, 0, 7); cx.stroke(); stamp(glowSprite('255,200,120', Math.round(240*u)), b.x, b.y, 0, 1 + b.t); } }
        cx.restore();
        if (g.hurt > 0 && !RM){ const v = cx.createRadialGradient(W/2, H/2, Math.min(W, H)*0.35, W/2, H/2, Math.max(W, H)*0.7); v.addColorStop(0, 'rgba(255,0,0,0)'); v.addColorStop(1, `rgba(255,40,40,${g.hurt*0.4})`); cx.fillStyle = v; cx.fillRect(0, 0, W, H); }
        if (g.mode === 'play' || g.mode === 'crash'){
          const hh = 48;
          F.pill(cx, 12, 10, {key: 'lives', icon: '❤️', label: 'Lives', value: '♥'.repeat(Math.max(0, g.lives)) + '♡'.repeat(3 - Math.max(0, g.lives)), h: hh, accent: '#ff5a7a'});
          const w = F.pill(cx, W - 12, 10, {key: 'score', icon: '🏁', label: 'Score', value: scoreOf(), align: 'right', h: hh});
          F.pill(cx, W - 24 - w, 10, {key: 'stars', icon: '⭐', label: 'Stars', value: g.stars, align: 'right', h: hh, accent: '#ffd23a'});
          if (g.t < 3.5 && g.mode === 'play'){ cx.globalAlpha = Math.min(1, 3.5 - g.t); F.text(cx, '👆 Drag anywhere to steer', W/2, H*0.58, 28, '#ffffff'); cx.globalAlpha = 1; }
        }
        F.drawFx(cx, W, H, H*0.4);
      }
      const frame = t => {
        if (!alive) return;
        const dt = Math.min(0.05, last ? (t - last)/1000 : 0.016); last = t;
        step(dt);
        if (g.mode === 'crash'){ g.endT -= dt; if (g.endT <= 0) finish(); }
        cx.setTransform(dpr,0,0,dpr,0,0);
        draw(); raf = requestAnimationFrame(frame);
      };
      startScreen();
      raf = requestAnimationFrame(frame);

      return () => {
        alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size);
        cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
        F.cleanup(); el.innerHTML = ''; delete el.__space;
      };
    }
  };
})();
