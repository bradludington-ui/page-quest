// Fishing: pull back and let go to cast from the dock. Wait for the bobber to dip, tap to hook,
// then hold and release to keep the fish in the green zone while you reel. Every species caught
// swims in your aquarium. A round is 2 minutes or 10 casts.
// Brain Break look: a sunny lake with layered hills, a wooden dock, light rays and caustics under the water.
// The saved aquarium (api.store 'aq': {speciesId: {n, big}}) keeps exactly the same shape as before.
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
  window.BreakGames.fishing = {
    start(el, api){
      const F = bbFrame(el, api), RM = F.RM, esc = F.esc, HEAD = F.HF, TXT = F.TF, EMOJI = F.EMO;
      const ROUND_TIME = 120, ROUND_CASTS = 10;

      // ---------- species ----------
      // d: depth range (0 = just under the surface, 1 = the deep far water); w: how common; diff: how hard to reel.
      const SPECIES = [
        {id:'minnow',  name:'Minnow',         ch:'🐟', d:[0,.6],   w:30,  pts:5,   cm:[6,14],    diff:.05},
        {id:'shrimp',  name:'Shrimp',         ch:'🦐', d:[0,.55],  w:12,  pts:6,   cm:[4,10],    diff:.08},
        {id:'sunny',   name:'Sunny Fish',     ch:'🐠', d:[0,.75],  w:24,  pts:8,   cm:[10,22],   diff:.12},
        {id:'puffer',  name:'Pufferfish',     ch:'🐡', d:[.2,.85], w:14,  pts:12,  cm:[15,30],   diff:.25},
        {id:'crab',    name:'Crab',           ch:'🦀', d:[.45,1],  w:13,  pts:12,  cm:[12,25],   diff:.2},
        {id:'boot',    name:'Old Boot',       ch:'👢', d:[.3,1],   w:6,   pts:1,   cm:[24,30],   diff:0},
        {id:'squid',   name:'Squid',          ch:'🦑', d:[.4,1],   w:10,  pts:16,  cm:[25,60],   diff:.35},
        {id:'lobster', name:'Lobster',        ch:'🦞', d:[.55,1],  w:7,   pts:22,  cm:[25,50],   diff:.4},
        {id:'octopus', name:'Octopus',        ch:'🐙', d:[.55,1],  w:8,   pts:20,  cm:[30,90],   diff:.45},
        {id:'turtle',  name:'Sea Turtle',     ch:'🐢', d:[.3,1],   w:6,   pts:25,  cm:[40,110],  diff:.5},
        {id:'shark',   name:'Shark',          ch:'🦈', d:[.65,1],  w:4,   pts:40,  cm:[120,300], diff:.8},
        {id:'rainbow', name:'Rainbow Fish',   ch:'🐠', d:[.2,1],   w:2.5, pts:50,  cm:[15,30],   diff:.55, fx:'rainbow', rare:true},
        {id:'golden',  name:'Golden Fish',    ch:'🐟', d:[.4,1],   w:2,   pts:75,  cm:[20,40],   diff:.65, fx:'gold', rare:true},
        {id:'chest',   name:'Treasure Chest', ch:'',   d:[.7,1],   w:1.4, pts:100, cm:[50,70],   diff:.5,  fx:'chest', rare:true}];
      const BY = {}; SPECIES.forEach(s => BY[s.id] = s);
      const article = n => /^[AEIOU]/.test(n) ? 'an' : 'a';
      const sizeTxt = cm => cm >= 100 ? (cm/100).toFixed(1) + ' m' : Math.round(cm) + ' cm';

      // ---------- sprites (prerendered; gold and rainbow are tinted copies) ----------
      const DPR = () => Math.min(window.devicePixelRatio || 1, 2.5);
      const spCache = {};
      function drawChest(x, s){
        const g = x.createLinearGradient(0, -s*.4, 0, s*.34); g.addColorStop(0, '#b8743a'); g.addColorStop(1, '#6b3612');
        x.fillStyle = g; x.fillRect(-s*.42, -s*.08, s*.84, s*.42);
        x.fillStyle = '#c47a3c'; x.beginPath(); x.moveTo(-s*.42, -s*.08); x.quadraticCurveTo(0, -s*.42, s*.42, -s*.08); x.closePath(); x.fill();
        x.fillStyle = '#f2c230'; x.fillRect(-s*.42, -s*.1, s*.84, s*.06); x.fillRect(-s*.3, -s*.3, s*.07, s*.64); x.fillRect(s*.23, -s*.3, s*.07, s*.64);
        x.fillStyle = '#ffe680'; x.fillRect(-s*.06, -s*.06, s*.12, s*.14);
        x.strokeStyle = '#4a2408'; x.lineWidth = Math.max(1, s*.03); x.strokeRect(-s*.42, -s*.08, s*.84, s*.42);
        x.fillStyle = 'rgba(255,240,150,.9)'; for (const [a, b] of [[-.25,-.3],[.1,-.36],[.3,-.25]]){ x.beginPath(); x.arc(a*s, b*s, s*.035, 0, 7); x.fill(); }
      }
      function sprite(sp, px){
        const k = sp.id + '|' + px; if (spCache[k]) return spCache[k];
        const d = DPR(), sz = Math.ceil(px*1.35), c = document.createElement('canvas'); c.width = c.height = Math.ceil(sz*d);
        const x = c.getContext('2d'); x.scale(d, d); x.translate(sz/2, sz/2);
        if (sp.fx === 'chest') drawChest(x, px);
        else { x.font = `${px}px ${EMOJI}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(sp.ch, 0, px*.05); }
        if (sp.fx === 'gold' || sp.fx === 'rainbow'){
          x.globalCompositeOperation = 'source-atop';
          const gr = x.createLinearGradient(-px/2, -px/2, px/2, px/2);
          if (sp.fx === 'gold'){ gr.addColorStop(0, 'rgba(255,240,140,.85)'); gr.addColorStop(.5, 'rgba(240,180,20,.75)'); gr.addColorStop(1, 'rgba(255,225,90,.85)'); }
          else for (let i = 0; i <= 6; i++) gr.addColorStop(i/6, `hsla(${i*55},95%,60%,.62)`);
          x.fillStyle = gr; x.fillRect(-sz/2, -sz/2, sz, sz);
          x.globalCompositeOperation = 'source-over';
          x.fillStyle = 'rgba(255,255,255,.95)'; for (const [a, b] of [[-.3,-.25],[.25,-.3],[.1,.25]]){ x.beginPath(); x.arc(a*px, b*px, px*.035, 0, 7); x.fill(); }
        }
        return (spCache[k] = {c, sz});
      }
      const urlCache = {};
      const spriteURL = sp => urlCache[sp.id] || (urlCache[sp.id] = sprite(sp, 64).c.toDataURL());
      function drawSp(ctx, sp, px, x, y, flip, rot, alpha){
        const s = sprite(sp, px); ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1); if (rot) ctx.rotate(rot); if (alpha != null) ctx.globalAlpha = alpha;
        ctx.drawImage(s.c, -s.sz/2, -s.sz/2, s.sz, s.sz); ctx.restore();
      }
      const emoSp = {}; const emo = ch => emoSp[ch] || (emoSp[ch] = {id: 'e' + ch, ch});
      const glowC = {};
      function glow(rgb, px){ const k = rgb + px; if (glowC[k]) return glowC[k]; const d = DPR(), c = document.createElement('canvas'); c.width = c.height = Math.ceil(px*d); const x = c.getContext('2d'); x.scale(d, d);
        const g = x.createRadialGradient(px/2, px/2, 0, px/2, px/2, px/2); g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(0.3, `rgba(${rgb},.45)`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(0, 0, px, px); return (glowC[k] = {c, px}); }
      let cloudSp = null;
      function cloudSprite(){
        if (cloudSp) return cloudSp; const d = DPR(), w = 150, h = 70, c = document.createElement('canvas'); c.width = w*d; c.height = h*d; const x = c.getContext('2d'); x.scale(d, d);
        const puff = (px, py, r) => { const g = x.createRadialGradient(px - r*0.3, py - r*0.4, r*0.2, px, py, r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#dcebf7'); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); };
        x.fillStyle = 'rgba(80,120,160,.15)'; x.beginPath(); x.ellipse(75, 58, 60, 8, 0, 0, 7); x.fill();
        puff(40, 44, 20); puff(110, 44, 20); puff(68, 34, 28); puff(95, 30, 22); x.fillStyle = '#eef6fd'; x.fillRect(40, 44, 70, 18);
        return (cloudSp = {c, w, h});
      }

      // ---------- DOM ----------
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.insertBefore(cv, el.firstChild);
      const cx = cv.getContext('2d');
      const bg = document.createElement('canvas'), bx = bg.getContext('2d');
      const timers = new Set();
      const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms); timers.add(t); };
      const hideOv = () => { F.hide(); aqCv = null; };

      let W = 0, H = 0, raf = 0, last = 0, alive = true;
      const size = () => { const r = el.getBoundingClientRect(), d = DPR(); W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W*d); cv.height = Math.round(H*d); cx.setTransform(d,0,0,d,0,0);
        bg.width = cv.width; bg.height = cv.height; drawStatic(); if (aqCv) aqSize(); };
      window.addEventListener('resize', size);

      // ---------- saved aquarium ----------
      const loadAq = () => { const a = api.store.get('aq'); return a && typeof a === 'object' ? a : {}; };
      let aq = loadAq();
      const saveAq = () => { try{ api.store.set('aq', aq); }catch(e){} };

      // ---------- world geometry ----------
      const surfY = () => Math.round(H*0.32);
      const dockX = () => Math.max(140, W*0.2);
      const deepY = () => H - 18;
      const botY = x => { const t = Math.max(0, Math.min(1, (x - dockX())/(W - dockX()))); return Math.min(deepY(), surfY() + (H - surfY())*(0.42 + 0.55*t) + Math.sin(x*0.02)*6); };
      const rodTip = () => ({x: dockX() + 34, y: surfY() - 112});
      const avPos = () => ({x: dockX() - 34, y: surfY() - 50});
      const landX = p => dockX() + 70 + p*(W - dockX() - 140);

      const g = {mode: 'start', phase: 'aim', time: 0, casts: 0, score: 0, caught: [], msg: null, drag: null, power: 0,
        bob: {x: 0, y: 0}, hook: {x: 0, y: 0, ty: 0}, fly: 0, fish: null, sp: null, phT: 0, nibbles: 0, dip: 0,
        reel: null, ambient: [], bubbles: [], ripples: [], pending: null, hold: false, waitT: 0, jump: null};
      el.__fish = g; // read-only peek for automated tests
      for (let i = 0; i < 26; i++) g.bubbles.push({x: Math.random(), y: Math.random(), r: 1.5 + Math.random()*3.5, v: 0.03 + Math.random()*0.05, w: Math.random()*6});

      // ---------- the cached lake ----------
      function drawStatic(){
        const c = bx, d = DPR(); c.setTransform(d, 0, 0, d, 0, 0);
        const S = surfY(), dx = dockX();
        let seed = 3; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
        // sky with a warm sun glow
        let gr = c.createLinearGradient(0, 0, 0, S); gr.addColorStop(0, '#4fa8e8'); gr.addColorStop(0.7, '#a6dcf7'); gr.addColorStop(1, '#fff1d0');
        c.fillStyle = gr; c.fillRect(0, 0, W, S + 2);
        const sx = W - Math.max(90, W*0.14), sy = S*0.34, sr = Math.min(36, S*0.16);
        gr = c.createRadialGradient(sx, sy, sr*0.5, sx, sy, sr*5); gr.addColorStop(0, 'rgba(255,240,180,.85)'); gr.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, S);
        gr = c.createRadialGradient(sx - sr*0.3, sy - sr*0.3, 1, sx, sy, sr); gr.addColorStop(0, '#fffbe6'); gr.addColorStop(1, '#ffd84a'); c.fillStyle = gr; c.beginPath(); c.arc(sx, sy, sr, 0, 7); c.fill();
        // far hills, two layers, then a tree line on the far shore
        const hill = (base, amp, col1, col2, f) => { gr = c.createLinearGradient(0, base - amp, 0, S); gr.addColorStop(0, col1); gr.addColorStop(1, col2); c.fillStyle = gr; c.beginPath(); c.moveTo(0, S);
          for (let x = 0; x <= W + 20; x += 20) c.lineTo(x, base - amp*(0.5 + 0.5*Math.sin(x*f + base))*(0.7 + 0.3*Math.sin(x*f*2.3))); c.lineTo(W, S); c.closePath(); c.fill(); };
        hill(S - 6, S*0.38, '#9fc3d9', '#bcd8e6', 0.006);
        hill(S - 2, S*0.22, '#6fa98a', '#8cc19c', 0.011);
        c.fillStyle = '#3f7d55';
        for (let x = dx + 10; x < W + 10; x += 9 + rnd()*7){ const h = 10 + rnd()*16; c.beginPath(); c.moveTo(x - 6, S); c.lineTo(x, S - h); c.lineTo(x + 6, S); c.fill(); }
        // water body
        gr = c.createLinearGradient(0, S, 0, H); gr.addColorStop(0, '#46c0e4'); gr.addColorStop(0.4, '#1f8fbe'); gr.addColorStop(1, '#0a3d66');
        c.fillStyle = gr; c.fillRect(0, S, W, H - S);
        // reflection of the sky and sun on the surface band
        gr = c.createLinearGradient(0, S, 0, S + 40); gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, S, W, 40);
        c.fillStyle = 'rgba(255,245,200,.45)'; for (let i = 0; i < 9; i++){ const w = 40 - i*3; c.fillRect(sx - w/2 + (rnd() - 0.5)*10, S + 6 + i*5, w, 1.5); }
        // light rays
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 6; i++){ const x0 = dx + (W - dx)*(i + 0.3)/6 + rnd()*30, w = 20 + rnd()*40;
          gr = c.createLinearGradient(0, S, 0, H*0.95); gr.addColorStop(0, 'rgba(180,240,255,.16)'); gr.addColorStop(1, 'rgba(180,240,255,0)');
          c.fillStyle = gr; c.beginPath(); c.moveTo(x0, S); c.lineTo(x0 + w, S); c.lineTo(x0 + w + 80, H); c.lineTo(x0 + 40, H); c.closePath(); c.fill(); }
        c.restore();
        // sea floor, textured, with rocks and coral
        gr = c.createLinearGradient(0, S + (H - S)*0.4, 0, H); gr.addColorStop(0, '#e2c88e'); gr.addColorStop(1, '#a8834d');
        c.fillStyle = gr; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W + 10; x += 14) c.lineTo(x, botY(x)); c.lineTo(W, H); c.closePath(); c.fill();
        c.save(); c.clip();
        for (let i = 0; i < W*0.6; i++){ const x = rnd()*W, y = botY(x) + rnd()*(H - botY(x)); c.fillStyle = rnd() < 0.5 ? 'rgba(120,85,40,.25)' : 'rgba(255,240,200,.35)'; c.fillRect(x, y, 1.5, 1.5); }
        for (let x = 30; x < W; x += 90 + rnd()*60){ const y = botY(x) + 8, r = 8 + rnd()*10;
          gr = c.createRadialGradient(x - r*0.3, y - r*0.4, 1, x, y, r); gr.addColorStop(0, '#a7a39a'); gr.addColorStop(1, '#4f4b45'); c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, r*1.3, r, 0, 0, 7); c.fill(); }
        c.restore();
        const coral = ['#ff7a8a', '#ff9f43', '#c86bff'];
        for (let i = 0; i < 4; i++){ const x = dx + (W - dx)*(0.15 + i*0.22) + rnd()*20, y = botY(x) + 2; c.strokeStyle = coral[i % 3]; c.lineWidth = 4; c.lineCap = 'round';
          for (let b = -1; b <= 1; b++){ c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + b*10, y - 14, x + b*14, y - 22 - rnd()*8); c.stroke(); } }
        // the dock: posts with shadows, plank deck with grain
        for (let x = 18; x < dx; x += 46){
          const ph = Math.min(H - S + 14, botY(x) - S + 30);
          gr = c.createLinearGradient(x, 0, x + 12, 0); gr.addColorStop(0, '#5a3418'); gr.addColorStop(0.5, '#8a5a32'); gr.addColorStop(1, '#4a2a12');
          c.fillStyle = gr; c.fillRect(x, S - 14, 12, ph);
          c.fillStyle = 'rgba(0,30,50,.25)'; c.fillRect(x, S + 4, 12, ph - 18);
        }
        c.fillStyle = 'rgba(0,30,50,.25)'; c.fillRect(0, S - 6, dx + 6, 10);
        gr = c.createLinearGradient(0, S - 30, 0, S - 8); gr.addColorStop(0, '#c98d55'); gr.addColorStop(1, '#8e5a2c');
        c.fillStyle = gr; c.fillRect(0, S - 30, dx + 8, 22);
        c.fillStyle = '#6e4220'; c.fillRect(0, S - 10, dx + 8, 4);
        for (let x = 0; x < dx + 8; x += 26){ c.fillStyle = 'rgba(60,30,10,.45)'; c.fillRect(x, S - 30, 2, 22);
          c.strokeStyle = 'rgba(255,220,170,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 4, S - 24); c.bezierCurveTo(x + 10, S - 22, x + 16, S - 26, x + 23, S - 23); c.stroke();
          c.fillStyle = '#3a2410'; c.beginPath(); c.arc(x + 6, S - 26, 1.3, 0, 7); c.arc(x + 20, S - 26, 1.3, 0, 7); c.fill(); }
        c.fillStyle = 'rgba(255,235,200,.35)'; c.fillRect(0, S - 30, dx + 8, 2);
        // tackle box and bucket on the dock
        c.font = `26px ${EMOJI}`; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText('🪣', Math.max(24, dx - 100), S - 28);
        c.setTransform(1,0,0,1,0,0);
      }

      function pickSpecies(depth){
        const list = SPECIES.filter(s => depth >= s.d[0] - 0.05 && depth <= s.d[1] + 0.05);
        let tot = 0; for (const s of list) tot += s.w*(depth > 0.6 && s.d[0] > 0.4 ? 1.4 : 1);
        let r = Math.random()*tot;
        for (const s of list){ r -= s.w*(depth > 0.6 && s.d[0] > 0.4 ? 1.4 : 1); if (r <= 0) return s; }
        return list[0] || SPECIES[0];
      }
      function makeAmbient(){
        g.ambient.length = 0;
        const n = Math.max(5, Math.round(W/150));
        for (let i = 0; i < n; i++){
          const depth = Math.random();
          const choices = SPECIES.filter(s => !s.rare && s.id !== 'boot' && s.id !== 'crab' && s.id !== 'lobster' && depth >= s.d[0] && depth <= s.d[1]);
          const sp = choices[Math.floor(Math.random()*choices.length)] || SPECIES[0];
          g.ambient.push({sp, depth, x: Math.random()*W, v: (Math.random() < .5 ? -1 : 1)*(18 + Math.random()*26), ph: Math.random()*6, px: 26 + Math.round(sp.cm[1]/12)*2});
        }
      }
      function newRound(){
        Object.assign(g, {mode: 'play', phase: 'aim', time: 0, casts: 0, score: 0, msg: null, drag: null, power: 0, fish: null, sp: null, reel: null, pending: null, hold: false, jump: null});
        g.caught = []; g.ripples.length = 0; makeAmbient();
        F.callout('Gone fishing!', '#ffffff', 56, 1.1);
      }
      function say(t, col, dur){ g.msg = {t, col: col || '#fff', life: dur || 1.6}; }

      // ---------- input ----------
      const pt = e => { const r = cv.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
      const down = e => {
        if (e.button > 0 || g.mode !== 'play') return; e.preventDefault();
        try{ cv.setPointerCapture(e.pointerId); }catch(_){}
        const p = pt(e);
        if (g.phase === 'aim'){ g.drag = {id: e.pointerId, x0: p.x, y0: p.y, x: p.x, y: p.y}; g.phase = 'drag'; g.power = 0; }
        else if (g.phase === 'wait'){ if (g.nibT > 0){ scare(); } }
        else if (g.phase === 'bite'){ startReel(); }
        else if (g.phase === 'reel'){ g.hold = true; g.holdId = e.pointerId; }
      };
      const move = e => { if (!g.drag || e.pointerId !== g.drag.id) return; e.preventDefault(); const p = pt(e); g.drag.x = p.x; g.drag.y = p.y;
        const dx = g.drag.x0 - p.x, dy = p.y - g.drag.y0; // pulling back = left and/or down
        g.power = Math.max(0, Math.min(1, Math.hypot(Math.max(dx, -dx*0.6), Math.max(dy, -dy*0.6))/(Math.min(W, H)*0.42))); };
      const up = e => {
        if (g.phase === 'reel' && e.pointerId === g.holdId) g.hold = false;
        if (!g.drag || e.pointerId !== g.drag.id) return;
        g.drag = null;
        if (g.phase !== 'drag') return;
        if (g.power < 0.08){ g.phase = 'aim'; say('Pull back further, then let go!', '#fff', 1.6); return; }
        cast(g.power);
      };
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

      // ---------- the cast ----------
      function cast(p){
        g.casts++; g.phase = 'fly'; g.fly = 0; g.power = p;
        const lx = landX(p); g.flyFrom = rodTip(); g.flyTo = {x: lx, y: surfY()};
        g.hook.x = lx; g.hook.y = surfY(); g.hook.ty = surfY() + (botY(lx) - surfY())*0.82;
      }
      function splash(x, n, big){
        const S = surfY();
        F.burst(x, S, {n: n || 14, dir: -Math.PI/2, spread: 1.6, speed: big ? 340 : 220, life: 0.7, size: big ? 4 : 3, grav: 700, drag: 0.6, color: ['#ffffff', '#c9f0ff', '#8fdcff']});
        g.ripples.push({x, r: 4, life: 1}); if (big) g.ripples.push({x, r: 14, life: 0.8});
      }
      function landed(){
        g.phase = 'sink'; g.bob.x = g.flyTo.x; g.bob.y = surfY(); splash(g.bob.x, 12);
        const depth = Math.max(0, Math.min(1, (g.hook.ty - surfY())/(deepY() - surfY())));
        g.sp = pickSpecies(depth);
        g.waitT = 1.4 + Math.random()*2.4; g.phT = 0; g.nibT = 0;
        g.nibbles = Math.floor(Math.random()*(api.grade >= 5 ? 3 : 2));
        const fromLeft = g.hook.x > W*0.75 ? true : g.hook.x < W*0.45 ? false : Math.random() < .5;
        g.fish = {x: fromLeft ? -60 : W + 60, y: g.hook.ty + (Math.random() - .5)*30, px: Math.round(Math.min(64, 34 + (g.sp.cm[1] > 100 ? 26 : g.sp.cm[1]/4))), flip: fromLeft, wig: 0};
      }
      function scare(){ say('Too soon! It swam away.', '#ffd7a8'); fishFlee(); }
      function fishFlee(){ if (g.fish){ g.fleeing = g.fish; g.fleeing.flee = 1; } g.fish = null; g.phase = 'gone'; g.phT = 1.4; }
      function startReel(){
        const sp = g.sp, k = api.grade >= 5 ? 0.9 : 1;
        g.phase = 'reel'; g.hold = false;
        g.reel = {p: 0.35, v: 0, z: 0.5, zt: 0.5, zTimer: 0, hz: Math.max(0.085, (0.19 - sp.diff*0.085)*k), prog: 0.3, diff: sp.diff, t: 0};
        splash(g.bob.x, 10); F.shake(0.15); F.callout('Hooked!', '#9dffb5', 60, 0.9);
        say('Hold to reel up!', '#c8ffd0', 1.4);
      }
      function caught(){
        const sp = g.sp, f = Math.random(), sz = sp.cm[0] + (sp.cm[1] - sp.cm[0])*f*f*0.6 + (sp.cm[1] - sp.cm[0])*Math.random()*0.4;
        const pts = Math.max(1, Math.round(sp.pts*(0.75 + 0.5*(sz - sp.cm[0])/Math.max(1, sp.cm[1] - sp.cm[0]))));
        g.score += pts; g.caught.push({id: sp.id, cm: sz, pts});
        const rec = aq[sp.id] || {n: 0, big: 0}; const isNew = !rec.n; const bigger = rec.n && sz > rec.big;
        rec.n++; rec.big = Math.max(rec.big || 0, Math.round(sz)); aq[sp.id] = rec; saveAq();
        g.phase = 'card'; g.reel = null; g.hold = false;
        // the catch leaps out of the water, then the card
        const fx = g.fish ? g.fish.x : g.hook.x;
        g.jump = {sp, x: fx, t: 0, px: g.fish ? g.fish.px : 48}; g.fish = null;
        splash(fx, 22, true); F.flash(sp.rare ? 0.6 : 0.3, '255,250,220'); if (sp.rare){ F.shake(0.4); F.hitPause(0.12); }
        F.fly('+' + pts, fx, surfY() - 30, 'score', '#ffe27a');
        if (sp.rare) api.confetti(50);
        const done = g.casts >= ROUND_CASTS || g.time >= ROUND_TIME;
        later(() => {
          g.jump = null;
          F.card(`<div style="position:relative;width:130px;height:120px;display:flex;align-items:center;justify-content:center">
              <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(255,226,122,.55),rgba(255,226,122,0) 70%)${RM ? '' : ';animation:bbfBob 2.6s ease-in-out infinite'}"></div>
              <img src="${spriteURL(sp)}" alt="" style="position:relative;width:104px;height:104px;display:block"></div>
            <div class="bbf-head">You caught ${article(sp.name)} ${esc(sp.name)}!</div>
            <div class="bbf-row"><span class="bbf-chip"><i>📏</i>${sizeTxt(sz)}</span><span class="bbf-chip" style="color:#ffe27a"><i>⭐</i>+${pts} points</span></div>
            ${isNew ? `<div class="bbf-new">✨ New in your aquarium!</div>` : bigger ? `<div class="bbf-new">📏 Your biggest one yet!</div>` : ''}
            ${sp.id === 'boot' ? `<div class="bbf-note">Oops, not a fish!</div>` : ''}
            <button class="bbf-play" data-bbf="btn" data-v="next">${done ? '🏁 See my score' : '🎣 Cast again'}</button>`, {onBtn: act});
        }, RM ? 150 : 750);
      }
      function lost(t){ say(t || 'It got away!', '#ffd7a8'); fishFlee(); }

      function endRound(){
        g.mode = 'end'; g.phase = 'aim'; g.drag = null; g.fish = null; g.reel = null;
        const res = api.saveScore(g.score);
        const tally = {}; g.caught.forEach(c => tally[c.id] = (tally[c.id] || 0) + 1);
        const icons = Object.keys(tally).map(id => `<span style="display:inline-flex;align-items:center;margin:2px 6px;font:800 16px ${HEAD}"><img src="${spriteURL(BY[id])}" alt="" style="width:38px;height:38px">${tally[id] > 1 ? '×' + tally[id] : ''}</span>`).join('');
        const big = g.caught.slice().sort((a, b) => b.pts - a.pts)[0];
        F.end({head: '🎣 Time to dock!', score: g.score, unit: 'points', stars: 1 + (g.score >= 40 ? 1 : 0) + (g.score >= 100 ? 1 : 0), best: res.best, isBest: res.isBest,
          lines: [icons || 'No catches this time', big ? `Best catch: ${esc(BY[big.id].name)} (${sizeTxt(big.cm)})` : ''].filter(Boolean),
          buttons: [{id: 'aq', label: '🐠 My Aquarium'}], onPlay: () => { hideOv(); newRound(); }, onBtn: act});
      }
      function startScreen(){
        g.mode = 'start'; aq = loadAq();
        const have = SPECIES.filter(s => aq[s.id] && aq[s.id].n).length;
        if (!g.ambient.length) makeAmbient();
        F.title({icon: '🎣', title: 'Fishing', howIcon: '👈', how: 'Pull back and let go to cast. Tap when the bobber dips, then hold to reel!', best: api.best, bestUnit: 'points',
          buttons: [{id: 'aq', label: `🐠 My Aquarium (${have}/${SPECIES.length})`}], onPlay: () => { hideOv(); newRound(); }, onBtn: act});
      }

      // ---------- aquarium ----------
      let aqCv = null, aqCx = null, aqW = 0, aqH = 0, aqFish = [], aqBubbles = [];
      function aqSize(){ const r = aqCv.getBoundingClientRect(), d = DPR(); aqW = Math.max(1, r.width); aqH = Math.max(1, r.height); aqCv.width = Math.round(aqW*d); aqCv.height = Math.round(aqH*d); aqCx.setTransform(d,0,0,d,0,0); }
      function openAquarium(from){
        g.mode = 'aquarium'; g.aqFrom = from; aq = loadAq();
        const have = SPECIES.filter(s => aq[s.id] && aq[s.id].n).length;
        const tiles = SPECIES.map(s => { const r = aq[s.id], ok = r && r.n;
          return `<div style="background:${ok ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.04)'};border:1px solid rgba(255,255,255,${ok ? '.2' : '.08'});border-radius:16px;padding:8px 4px;display:flex;flex-direction:column;align-items:center;min-width:0">
            <div style="position:relative;width:48px;height:48px"><img src="${spriteURL(s)}" alt="" style="width:48px;height:48px;${ok ? '' : 'filter:brightness(0) invert(1);opacity:.18'}">${ok ? '' : `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 24px ${HEAD};color:rgba(255,255,255,.6)">?</span>`}</div>
            <div style="font:600 13px ${TXT};text-align:center;line-height:1.15;min-height:30px;display:flex;align-items:center;color:${ok ? '#fff' : 'rgba(255,255,255,.5)'}">${ok ? esc(s.name) : '???'}</div>
            <div style="font:800 16px ${HEAD};color:${ok ? '#ffe27a' : 'rgba(255,255,255,.4)'}">${ok ? '×' + r.n : '–'}</div>${ok && r.big ? `<div style="font:500 11px ${TXT};color:rgba(255,255,255,.65)">📏 ${sizeTxt(r.big)}</div>` : ''}</div>`; }).join('');
        F.card(`<div style="position:absolute;inset:0;display:flex;flex-direction:column;background:linear-gradient(180deg,#14284f,#0b1730);color:#fff;font-family:${TXT}">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;gap:10px;flex-wrap:wrap">
            <div style="font:800 28px ${HEAD};text-shadow:0 2px 0 rgba(0,0,0,.35)">🐠 My Aquarium <span class="bbf-chip" style="font-size:16px;vertical-align:middle">${have} of ${SPECIES.length} found</span></div>
            <button class="bbf-sec" data-bbf="btn" data-v="back" style="min-width:110px">◀ Back</button></div>
          <canvas data-aq style="flex:1;min-height:150px;width:100%;display:block;touch-action:none"></canvas>
          <div style="max-height:46%;overflow:auto;touch-action:pan-y;padding:10px 12px 14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px">${tiles}</div></div>`, {onBtn: act}, true);
        aqCv = F.ov.querySelector('[data-aq]'); aqCx = aqCv.getContext('2d'); aqSize();
        aqFish = [];
        SPECIES.forEach(s => { const r = aq[s.id]; if (!r || !r.n) return; for (let i = 0; i < Math.min(3, r.n); i++) aqFish.push({sp: s, x: Math.random()*aqW, y: 0.15 + Math.random()*0.7, v: (Math.random() < .5 ? -1 : 1)*(20 + Math.random()*30), ph: Math.random()*6, px: s.id === 'shark' ? 64 : s.id === 'turtle' ? 54 : 42, floor: ['crab','lobster','chest','boot'].includes(s.id)}); });
        aqBubbles = []; for (let i = 0; i < 18; i++) aqBubbles.push({x: Math.random(), y: Math.random(), r: 2 + Math.random()*4, v: 0.05 + Math.random()*0.08});
      }
      function drawAquarium(dt){
        if (!aqCv) return;
        const c = aqCx, w = aqW, h = aqH, now = performance.now();
        const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6fd3ef'); gr.addColorStop(0.5, '#2a95c4'); gr.addColorStop(1, '#0f5684'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++){ const x0 = w*(0.1 + i*0.25) + Math.sin(now/3000 + i)*20; c.fillStyle = 'rgba(200,245,255,.08)'; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + 40, 0); c.lineTo(x0 + 110, h); c.lineTo(x0 + 50, h); c.closePath(); c.fill(); }
        c.restore();
        c.fillStyle = '#e8d29a'; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 20) c.lineTo(x, h - 18 - Math.sin(x*0.03)*6); c.lineTo(w, h); c.fill();
        c.font = `34px ${EMOJI}`; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText('🏰', w*0.82, h - 10); c.font = `24px ${EMOJI}`; c.fillText('🐚', w*0.18, h - 8);
        c.strokeStyle = '#2f9e5a'; c.lineWidth = 6; c.lineCap = 'round';
        for (let i = 0; i < 6; i++){ const bx = (i + 0.5)/6*w; c.beginPath(); c.moveTo(bx, h - 14); for (let k = 1; k < 6; k++) c.lineTo(bx + Math.sin(now/650 + k + i)*8, h - 14 - k*Math.min(22, h/10)); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,.5)';
        for (const b of aqBubbles){ b.y -= b.v*dt; if (b.y < -0.05){ b.y = 1.05; b.x = Math.random(); } c.beginPath(); c.arc(b.x*w, b.y*h, b.r, 0, 7); c.fill(); }
        if (!aqFish.length){ c.fillStyle = 'rgba(255,255,255,.95)'; c.font = `700 22px ${HEAD}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Empty tank! Go catch something 🎣', w/2, h/2); }
        for (const f of aqFish){
          f.ph += dt*2; f.x += f.v*dt*(f.floor ? 0.4 : 1);
          if (f.x < 30){ f.x = 30; f.v = Math.abs(f.v); } if (f.x > w - 30){ f.x = w - 30; f.v = -Math.abs(f.v); }
          const y = f.floor ? h - 30 - f.px*0.3 : 20 + f.y*(h - 70) + Math.sin(f.ph)*6;
          drawSp(c, f.sp, f.px, f.x, y, f.v > 0, f.floor ? 0 : Math.sin(f.ph)*0.08);
        }
        // glass edge
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, w - 3, h - 3);
      }

      function act(a){
        if (a === 'aq') openAquarium(g.mode);
        else if (a === 'back'){ hideOv(); startScreen(); }
        else if (a === 'next'){ hideOv(); g.phase = 'aim'; g.fish = null; if (g.casts >= ROUND_CASTS || g.time >= ROUND_TIME) endRound(); }
      }

      // ---------- update ----------
      function step(dt){
        F.tick(dt);
        for (const a of g.ambient){ a.x += a.v*dt; a.ph += dt*2; if (a.x < -60) a.x = W + 60; if (a.x > W + 60) a.x = -60; }
        for (const b of g.bubbles){ b.y -= b.v*dt; b.w += dt*2; if (b.y < 0){ b.y = 1; b.x = Math.random(); } }
        for (let i = g.ripples.length - 1; i >= 0; i--){ const r = g.ripples[i]; r.r += 40*dt; r.life -= dt*0.9; if (r.life <= 0) g.ripples.splice(i, 1); }
        if (g.fleeing){ const f = g.fleeing; f.x += (f.flip ? -1 : 1)*260*dt; f.flee -= dt; if (f.flee <= 0) g.fleeing = null; }
        if (g.msg){ g.msg.life -= dt; if (g.msg.life <= 0) g.msg = null; }
        if (g.jump) g.jump.t += dt;
        if (g.mode !== 'play') return;
        if (F.paused()) return;
        if (g.phase !== 'card') g.time += dt;
        const ph = g.phase;
        if (ph === 'fly'){
          g.fly += dt/0.75; if (g.fly >= 1) landed();
          else { const t = g.fly, a = g.flyFrom, b = g.flyTo; g.bob.x = a.x + (b.x - a.x)*t; g.bob.y = a.y + (b.y - a.y)*t - Math.sin(t*Math.PI)*(80 + g.power*90); }
        } else if (ph === 'sink' || ph === 'wait' || ph === 'bite'){
          g.hook.y += (g.hook.ty - g.hook.y)*Math.min(1, dt*3);
          if (ph === 'sink' && g.hook.ty - g.hook.y < 4) g.phase = 'wait';
          const f = g.fish;
          if (f && g.phase === 'wait'){
            g.waitT -= dt;
            const tx = g.hook.x + (f.flip ? -1 : 1)*f.px*0.55, ty = g.hook.y;
            const k = Math.max(0, Math.min(1, 1 - g.waitT/2.5));
            f.x += (tx - f.x)*Math.min(1, dt*(0.4 + k*2.5)); f.y += (ty - f.y)*Math.min(1, dt*2);
            if (g.waitT <= 0){
              g.phT += dt;
              if (g.nibbles > 0){ g.nibT = Math.max(0, (g.nibT || 0) - dt); if (g.phT > 0.75){ g.phT = 0; g.nibbles--; g.nibT = 0.3; g.ripples.push({x: g.bob.x, r: 3, life: .6}); } }
              else if (g.phT > 0.5){ g.phase = 'bite'; g.phT = 0; g.nibT = 0; g.ripples.push({x: g.bob.x, r: 6, life: 1}); splash(g.bob.x, 8); }
            }
          } else if (g.phase === 'bite'){
            g.phT += dt;
            if (g.phT > (api.grade >= 5 ? 1.0 : 1.25)) lost('Too slow! It got away.');
          }
          if (g.phase === 'wait' || g.phase === 'bite'){
            if (g.time >= ROUND_TIME){ lost("Time's up!"); }
          }
        } else if (ph === 'gone'){
          g.phT -= dt; g.hook.y += (surfY() - g.hook.y)*Math.min(1, dt*4);
          if (g.phT <= 0){ g.phase = 'aim'; if (g.casts >= ROUND_CASTS || g.time >= ROUND_TIME) endRound(); }
        } else if (ph === 'reel'){
          const r = g.reel; r.t += dt;
          r.v += (g.hold ? 3.4 : -2.9)*dt; r.v *= Math.pow(0.35, dt); r.p += r.v*dt;
          if (r.p < 0){ r.p = 0; r.v = Math.abs(r.v)*0.25; } if (r.p > 1){ r.p = 1; r.v = -Math.abs(r.v)*0.25; }
          r.zTimer -= dt;
          if (r.zTimer <= 0){ r.zt = r.hz + Math.random()*(1 - 2*r.hz); r.zTimer = (1.5 - r.diff*0.8)*(0.6 + Math.random()*0.8); }
          r.z += (r.zt - r.z)*Math.min(1, dt*(0.8 + r.diff*2.6));
          const inZone = Math.abs(r.p - r.z) < r.hz;
          r.prog += inZone ? dt*0.3*(1 - r.diff*0.35) : -dt*0.17;
          r.in = inZone;
          if (g.fish){ g.fish.wig += dt*(inZone ? 6 : 14); const k = Math.max(0, Math.min(1, r.prog));
            g.fish.x = g.hook.x + (dockX() + 30 - g.hook.x)*k*0.85 + Math.sin(g.fish.wig)*6; g.fish.y = g.hook.ty + (surfY() + 30 - g.hook.ty)*k + Math.cos(g.fish.wig*0.7)*4; g.fish.flip = false;
            if (!inZone && !RM && Math.random() < dt*6) F.burst(g.fish.x, g.fish.y, {n: 1, dir: -Math.PI/2, spread: 0.6, speed: 60, life: 0.8, size: 2.5, color: 'rgba(255,255,255,.8)', drag: 0.5, grav: -40}); }
          if (r.prog >= 1) caught();
          else if (r.prog <= 0) lost('It got away!');
        } else if (ph === 'aim' || ph === 'drag'){
          if (ph === 'aim' && (g.casts >= ROUND_CASTS || g.time >= ROUND_TIME)) endRound();
        }
      }

      // ---------- draw ----------
      const clouds = []; for (let i = 0; i < 4; i++) clouds.push({x: Math.random(), y: 0.04 + Math.random()*0.12, s: 0.55 + Math.random()*0.55, v: 6 + Math.random()*8});
      const birds = []; for (let i = 0; i < 3; i++) birds.push({x: Math.random(), y: 0.08 + Math.random()*0.12, v: 14 + Math.random()*10, ph: Math.random()*6});
      function rr(x, y, w, h, r){ F.rr(cx, x, y, w, h, r); }
      function label(t, x, y, px, col){ F.text(cx, t, x, y, px, col || '#fff', {stroke: 'rgba(0,30,50,.75)'}); }
      function draw(dt){
        const S = surfY(), dx = dockX(), now = performance.now(), tt = now/1000;
        cx.drawImage(bg, 0, 0, W, H);
        const sh = F.shakeXY(); cx.save(); cx.translate(sh.x, sh.y);
        // clouds and birds
        const cs = cloudSprite();
        for (const c of clouds){ const x = ((c.x*W + tt*c.v) % (W + 200)) - 100, y = c.y*H; cx.drawImage(cs.c, x - cs.w*c.s/2, y - cs.h*c.s/2, cs.w*c.s, cs.h*c.s); }
        cx.strokeStyle = 'rgba(40,50,70,.6)'; cx.lineWidth = 1.6;
        for (const b of birds){ const x = ((b.x*W + tt*b.v) % (W + 60)) - 30, y = b.y*H + Math.sin(tt + b.ph)*4, f = Math.sin(tt*8 + b.ph)*3;
          cx.beginPath(); cx.moveTo(x - 7, y - f); cx.quadraticCurveTo(x - 3, y - 4, x, y); cx.quadraticCurveTo(x + 3, y - 4, x + 7, y - f); cx.stroke(); }
        // caustics on the floor: a few slow shimmering bands
        cx.save(); cx.globalCompositeOperation = 'lighter'; cx.strokeStyle = 'rgba(200,250,255,.12)'; cx.lineWidth = 3;
        for (let i = 0; i < 7; i++){ const x0 = dx + (W - dx)*(i/7) + Math.sin(tt*0.7 + i)*20; cx.beginPath();
          for (let k = 0; k <= 6; k++){ const x = x0 + k*18, y = botY(x) - 6 - Math.sin(tt*1.6 + k + i*2)*5; k ? cx.lineTo(x, y) : cx.moveTo(x, y); } cx.stroke(); }
        cx.restore();
        // seaweed swaying
        for (let i = 1; i < 9; i++){ const bxp = dx + (W - dx)*i/9 + 12, by = botY(bxp);
          cx.strokeStyle = i % 2 ? '#2e9a58' : '#3fb36a'; cx.lineWidth = 6; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(bxp, by);
          for (let k = 1; k < 6; k++) cx.lineTo(bxp + Math.sin(tt*1.4 + k*0.8 + i)*(4 + k*1.5), by - k*15); cx.stroke();
          cx.strokeStyle = 'rgba(180,255,200,.35)'; cx.lineWidth = 1.5; cx.stroke(); }
        // ambient fish, fading with depth
        for (const a of g.ambient){ const y = S + 24 + a.depth*(deepY() - S - 60) + Math.sin(a.ph)*5; drawSp(cx, a.sp, a.px, a.x, Math.min(y, botY(a.x) - a.px*0.6), a.v > 0, 0, 0.9 - a.depth*0.35); }
        // bubbles
        cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 1;
        for (const b of g.bubbles){ const x = dx + b.x*(W - dx) + Math.sin(b.w)*4, y = S + 10 + b.y*(H - S - 20); if (y > botY(x)) continue; cx.beginPath(); cx.arc(x, y, b.r, 0, 7); cx.stroke(); }
        // water surface: gentle wave line and sun glints
        cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 2; cx.beginPath();
        for (let x = 0; x <= W; x += 12){ const y = S + Math.sin(x*0.05 + tt*1.7)*2; x ? cx.lineTo(x, y) : cx.moveTo(x, y); } cx.stroke();
        if (!RM){ cx.fillStyle = 'rgba(255,255,240,.85)'; for (let i = 0; i < 14; i++){ const x = dx + ((i*97.3 + tt*12) % (W - dx)), a = Math.sin(tt*3 + i*1.9); if (a > 0.6){ cx.fillRect(x, S + 3 + (i % 4)*6, 6 + a*6, 1.6); } } }
        // avatar and rod
        const av = avPos(), tip0 = rodTip();
        let tip = tip0;
        if (g.phase === 'drag'){ tip = {x: tip0.x - 60*g.power, y: tip0.y + 30*g.power}; }
        else if (g.phase === 'reel'){ const b = Math.sin(now/90)*4 + 14 + (g.hold ? 10 : 0); tip = {x: tip0.x + 6, y: tip0.y + b}; }
        else if (g.phase === 'bite'){ tip = {x: tip0.x + 4, y: tip0.y + 12}; }
        cx.fillStyle = 'rgba(0,0,0,.18)'; cx.beginPath(); cx.ellipse(av.x + 4, S - 30, 26, 5, 0, 0, 7); cx.fill();
        cx.lineCap = 'round';
        cx.strokeStyle = '#3d2410'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(av.x + 14, av.y + 8); cx.quadraticCurveTo((av.x + tip.x)/2, Math.min(av.y, tip.y) - 10, tip.x, tip.y); cx.stroke();
        cx.strokeStyle = '#c98a4a'; cx.lineWidth = 3; cx.stroke();
        cx.fillStyle = '#9aa4b8'; cx.beginPath(); cx.arc(av.x + 22, av.y + 2, 5, 0, 7); cx.fill();
        drawSp(cx, emo(api.avatar || '🙂'), 56, av.x, av.y, false, 0);
        // line, bobber, hook
        const showLine = ['fly','sink','wait','bite','reel','gone'].includes(g.phase) && g.mode === 'play';
        if (showLine){
          let bx = g.bob.x, by = g.bob.y;
          if (g.phase !== 'fly'){ const nib = (g.nibT || 0) > 0 ? Math.sin(((0.3 - g.nibT)/0.3)*Math.PI)*6 : 0; by = S - 2 + Math.sin(now/400)*1.5 + nib + (g.phase === 'bite' ? 14 : 0) + (g.phase === 'reel' ? 10 : 0); }
          if (g.phase === 'reel' && g.fish){ bx = g.fish.x; }
          const tense = g.phase === 'reel';
          cx.strokeStyle = tense && g.hold ? 'rgba(255,250,210,.95)' : 'rgba(255,255,255,.85)'; cx.lineWidth = tense ? 1.8 : 1.4; cx.beginPath(); cx.moveTo(tip.x, tip.y); cx.quadraticCurveTo((tip.x + bx)/2, Math.max(tip.y, by) - (g.phase === 'fly' || tense ? 0 : 20), bx, by); cx.stroke();
          if (g.phase !== 'fly'){ const hx = g.phase === 'reel' && g.fish ? g.fish.x : g.hook.x, hy = g.phase === 'reel' && g.fish ? g.fish.y : g.hook.y;
            cx.strokeStyle = 'rgba(255,255,255,.5)'; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(bx, by); cx.lineTo(hx, hy); cx.stroke();
            cx.strokeStyle = '#d8dde2'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(hx, hy + 4, 5, 0, Math.PI); cx.stroke();
            if (g.phase !== 'reel'){ cx.fillStyle = '#ff6a7a'; cx.beginPath(); cx.ellipse(hx + 3, hy + 9, 4, 2, 0.5, 0, 7); cx.fill(); } }
          // bobber: shaded, with a highlight and its reflection
          if (g.phase !== 'fly'){ cx.fillStyle = 'rgba(255,90,90,.25)'; cx.beginPath(); cx.ellipse(bx, S + 6, 9, 2.5, 0, 0, 7); cx.fill(); }
          const bgr = cx.createRadialGradient(bx - 3, by - 2, 1, bx, by + 3, 10); bgr.addColorStop(0, '#ff8f8f'); bgr.addColorStop(1, '#c41e2a');
          cx.fillStyle = '#f4f4f4'; cx.beginPath(); cx.arc(bx, by + 4, 8.5, 0, Math.PI); cx.fill();
          cx.fillStyle = bgr; cx.beginPath(); cx.arc(bx, by + 4, 8.5, Math.PI, 0); cx.fill();
          cx.fillStyle = 'rgba(255,255,255,.75)'; cx.beginPath(); cx.ellipse(bx - 3, by, 2.5, 1.5, -0.5, 0, 7); cx.fill();
          cx.fillStyle = '#222'; cx.fillRect(bx - 1, by - 10, 2, 7);
          if (g.phase === 'bite'){ const s = RM ? 1 : 1 + Math.sin(now/70)*0.12; label('❗', bx + 18, by - 22, Math.round(30*s), '#ffe27a'); }
        }
        for (const r of g.ripples){ cx.strokeStyle = `rgba(255,255,255,${r.life*0.7})`; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(r.x, S + 2, r.r, r.r*0.3, 0, 0, 7); cx.stroke(); }
        // fish on the way to / on the hook
        const f = g.fish;
        if (f && g.mode === 'play' && g.sp){ const show = g.phase === 'reel' || g.phase === 'bite' || g.phase === 'wait';
          if (show){ if (g.sp.rare) { const gl = glow('255,240,160', f.px*2); cx.globalAlpha = 0.6; cx.drawImage(gl.c, f.x - f.px, f.y - f.px, f.px*2, f.px*2); cx.globalAlpha = 1; }
            drawSp(cx, g.sp, f.px, f.x, f.y, f.flip, g.phase === 'reel' ? Math.sin(f.wig)*0.25 : 0, g.phase === 'wait' ? 0.75 : 1); } }
        if (g.fleeing && g.sp) drawSp(cx, g.sp, g.fleeing.px, g.fleeing.x, g.fleeing.y, !g.fleeing.flip, 0, Math.max(0, g.fleeing.flee));
        // the catch leaping out of the water
        if (g.jump){ const j = g.jump, k = Math.min(1, j.t/0.7), x = j.x + (av.x + 40 - j.x)*k, y = S - Math.sin(k*Math.PI)*120 - k*20, s = 1 + Math.sin(k*Math.PI)*0.35;
          const gl = glow('255,240,170', Math.round(j.px*3)); cx.globalAlpha = 0.7; cx.drawImage(gl.c, x - gl.px/2, y - gl.px/2, gl.px, gl.px); cx.globalAlpha = 1;
          drawSp(cx, j.sp, Math.round(j.px*s), x, y, false, -0.6 + k*1.2); }
        F.drawParts(cx);
        // aim line while pulling back
        if (g.phase === 'drag'){
          const lx = landX(g.power);
          cx.setLineDash([6, 8]); cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(tip.x, tip.y);
          cx.quadraticCurveTo((tip.x + lx)/2, tip.y - 70 - g.power*80, lx, S); cx.stroke(); cx.setLineDash([]);
          cx.strokeStyle = '#ffe27a'; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(lx, S + 2, 18, 6, 0, 0, 7); cx.stroke();
          const mw = 150, mx = av.x - 46, my = av.y - 76; rr(mx, my, mw, 20, 10); cx.fillStyle = 'rgba(15,23,42,.6)'; cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.2)'; cx.lineWidth = 1; cx.stroke();
          rr(mx + 3, my + 3, Math.max(14, (mw - 6)*g.power), 14, 7); cx.fillStyle = `hsl(${120 - g.power*100},85%,55%)`; cx.fill();
          cx.fillStyle = 'rgba(255,255,255,.35)'; rr(mx + 3, my + 3, Math.max(14, (mw - 6)*g.power), 5, 3); cx.fill();
        }
        cx.restore();
        // reel bar, glass style
        if (g.phase === 'reel' && g.reel){
          const r = g.reel, bw = 64, bh = Math.max(180, Math.min(H - S - 40, 360)), bxp = W - bw - 24, byp = S + (H - S - bh)/2;
          rr(bxp - 8, byp - 8, bw + 16, bh + 16, 20); cx.fillStyle = 'rgba(15,23,42,.6)'; cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.18)'; cx.lineWidth = 1; cx.stroke();
          rr(bxp, byp, bw, bh, 14); cx.fillStyle = 'rgba(120,200,255,.14)'; cx.fill();
          const zy = byp + (1 - r.z - r.hz)*bh, zh = r.hz*2*bh;
          rr(bxp + 4, zy, bw - 8, zh, 12); cx.fillStyle = r.in ? 'rgba(90,240,130,.95)' : 'rgba(90,230,120,.5)'; cx.fill();
          if (r.in){ cx.strokeStyle = 'rgba(220,255,230,.9)'; cx.lineWidth = 2; cx.stroke(); }
          drawSp(cx, g.sp, 32, bxp + bw/2, zy + zh/2, false, Math.sin(now/120)*0.2);
          const my = byp + (1 - r.p)*bh;
          cx.fillStyle = '#ffe27a'; cx.strokeStyle = '#7a5a00'; cx.lineWidth = 2; rr(bxp - 6, my - 7, bw + 12, 14, 7); cx.fill(); cx.stroke();
          const px = bxp - 30; rr(px, byp, 16, bh, 8); cx.fillStyle = 'rgba(15,23,42,.55)'; cx.fill();
          const k = Math.max(0, Math.min(1, r.prog)); rr(px + 2, byp + 2 + (bh - 4)*(1 - k), 12, (bh - 4)*k, 6); cx.fillStyle = k > 0.25 ? '#ffd23f' : '#ff7a59'; cx.fill();
          F.text(cx, '🐟', px + 8, byp - 16, 20, '#fff');
          if (!g.msg) label(g.hold ? 'Reeling…' : 'Hold to reel up!', Math.min(W/2, bxp - 150), byp + 20, 26, '#fff');
        }
        // HUD
        if (g.mode === 'play'){
          const left = Math.max(0, ROUND_TIME - g.time), mm = Math.floor(left/60), ss = Math.floor(left%60);
          let x = 12; const hh = 48;
          x += F.pill(cx, x, 10, {key: 'casts', icon: '🎣', label: 'Casts', value: Math.max(0, ROUND_CASTS - g.casts), h: hh}) + 8;
          x += F.pill(cx, x, 10, {key: 'time', icon: '⏱️', label: 'Time', value: `${mm}:${String(ss).padStart(2,'0')}`, h: hh, accent: left < 15 ? '#ff6a6a' : null}) + 8;
          F.pill(cx, x, 10, {key: 'score', icon: '⭐', label: 'Points', value: g.score, h: hh, accent: '#ffd23f'});
          const hint = g.phase === 'aim' ? (g.casts === 0 ? '👈 Pull back and let go to cast!' : 'Pull back and let go!') : g.phase === 'wait' || g.phase === 'sink' ? 'Wait for a bite…' : '';
          if (hint) label(hint, (dx + W)/2, S + 44, 26, '#fff');
          if (g.phase === 'bite'){ const pulse = RM ? 1 : 1 + Math.sin(now/70)*0.08; label('TAP NOW!', g.bob.x, S - 48, Math.round(38*pulse), '#ffe27a'); }
        }
        if (g.msg){ cx.globalAlpha = Math.min(1, g.msg.life*2); label(g.msg.t, W/2, S + 72, 28, g.msg.col); cx.globalAlpha = 1; }
        F.drawFx(cx, W, H, Math.max(100, S*0.5));
      }
      const frame = t => {
        if (!alive) return;
        const dt = Math.min(0.05, last ? (t - last)/1000 : 0.016); last = t;
        cx.setTransform(DPR(),0,0,DPR(),0,0);
        step(dt); draw(dt); if (g.mode === 'aquarium') drawAquarium(dt);
        raf = requestAnimationFrame(frame);
      };
      size(); startScreen();
      raf = requestAnimationFrame(frame);

      return () => {
        alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size);
        timers.forEach(t => clearTimeout(t)); timers.clear();
        cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
        F.cleanup(); el.innerHTML = ''; delete el.__fish;
      };
    }
  };
})();
