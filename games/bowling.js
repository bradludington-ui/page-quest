// Brain Break: Bowling. 1 or 2 players on one iPad. Swipe up from the ball to roll it:
// direction aims, speed is power, a curved swipe adds hook. 10 frames, real scoring.
// Drawn as a glowing "cosmic bowling" alley: cached room layer, neighbour lanes for depth, glossy boards
// with pin reflections, a marbled ball, and juice on every pin hit (chips, hit pause, strike callouts).
(function(){
  window.BreakGames = window.BreakGames || {};
  // ---- Brain Break kit: the frame every game shares (glass HUD pills, start + end cards) and the "juice" ----
  // Copied into each game file on purpose (games are separate files with no shared module).
  function bbKit(el, api, o){
    const RM = !!api.reducedMotion, HF = '"Baloo 2", system-ui, sans-serif', TF = '"Lexend", system-ui, sans-serif';
    const P = 'bb-' + o.id, c1 = o.c1 || '#f59e0b', c2 = o.c2 || '#ea580c';
    const css = document.createElement('style');
    css.textContent = `
.${P}-ov{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;pointer-events:none;opacity:0;transition:opacity .25s}
.${P}-ov.on{pointer-events:auto;opacity:1;background:radial-gradient(ellipse at 50% 42%,rgba(15,23,42,.2),rgba(2,6,23,.74))}
.${P}-card{position:relative;width:min(460px,100%);max-height:100%;overflow-x:hidden;overflow-y:auto;box-sizing:border-box;padding:18px 22px 22px;border-radius:30px;text-align:center;color:#fff;font-family:${TF};scrollbar-width:none;
 background:linear-gradient(165deg,rgba(33,45,92,.95),rgba(11,17,38,.97));border:1px solid rgba(255,255,255,.16);box-shadow:0 26px 70px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.2)}
.${P}-card.wide{width:min(560px,100%)}
.${P}-card:before{content:"";position:absolute;inset:0 0 auto 0;height:110px;background:radial-gradient(ellipse at 50% -20%,${c1}66,transparent 70%);pointer-events:none}
.${P}-up{animation:${P}-up .55s cubic-bezier(.2,1.25,.4,1) both}
@keyframes ${P}-up{from{transform:translateY(70px) scale(.94);opacity:0}to{transform:none;opacity:1}}
.${P}-ico{position:relative;font-size:60px;line-height:1;display:inline-block;filter:drop-shadow(0 8px 12px rgba(0,0,0,.45))}
.${P}-ico.bob{animation:${P}-bob 2.4s ease-in-out infinite}
@keyframes ${P}-bob{50%{transform:translateY(-8px) rotate(-7deg)}}
.${P}-t{position:relative;margin:2px 0 4px;font:800 clamp(36px,6.4vw,50px)/1.02 ${HF};letter-spacing:.5px;color:#fff;text-shadow:0 3px 0 ${c2},0 6px 0 rgba(0,0,0,.25),0 10px 26px rgba(0,0,0,.45)}
.${P}-how{display:inline-flex;align-items:center;gap:8px;margin:6px 0 14px;padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);font-size:15px;line-height:1.25;color:#e2e8f0}
.${P}-how b{font-size:22px}
.${P}-me{display:flex;align-items:center;justify-content:center;gap:10px;margin:0 0 16px;flex-wrap:wrap}
.${P}-av{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;font-size:30px;background:radial-gradient(circle at 35% 30%,#fff,#cbd5e1);box-shadow:0 4px 12px rgba(0,0,0,.4),0 0 0 3px ${c1}}
.${P}-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:999px;background:rgba(15,23,42,.55);border:1px solid rgba(255,255,255,.15);font:700 17px ${HF};color:#fff}
.${P}-chip.gold{background:linear-gradient(180deg,rgba(253,224,71,.22),rgba(245,158,11,.18));border-color:rgba(253,224,71,.45)}
.${P}-play{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:68px;border:0;border-radius:999px;cursor:pointer;touch-action:manipulation;color:#fff;font:800 28px ${HF};text-shadow:0 2px 0 rgba(0,0,0,.28);
 background:linear-gradient(180deg,${c1},${c2});box-shadow:0 7px 0 rgba(0,0,0,.3),0 14px 30px rgba(0,0,0,.35),inset 0 2px 0 rgba(255,255,255,.45)}
.${P}-play,.${P}-mode{position:relative}
.${P}-pulse{animation:${P}-glow 1.8s ease-in-out infinite}
.${P}-pulse:after{content:"";position:absolute;inset:-3px;border-radius:inherit;border:3px solid ${c1};pointer-events:none;animation:${P}-ring 1.8s ease-out infinite}
.${P}-play:active,.${P}-mode:active{transform:translateY(4px) scale(.98)}
@keyframes ${P}-glow{50%{filter:brightness(1.12) saturate(1.1)}}
@keyframes ${P}-ring{0%{transform:scale(1);opacity:.85}100%{transform:scale(1.12,1.35);opacity:0}}
.${P}-modes{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.${P}-mode{min-height:128px;border-radius:24px;cursor:pointer;touch-action:manipulation;color:#fff;font:800 22px/1.1 ${HF};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:12px;
 border:2px solid rgba(255,255,255,.2);background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.05));box-shadow:0 7px 0 rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.25)}
.${P}-mode.main{background:linear-gradient(180deg,${c1},${c2});border-color:rgba(255,255,255,.4)}
.${P}-mode span{font-size:46px;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.35))}
.${P}-mode small{font:600 13px ${TF};opacity:.9}
.${P}-sec{margin-top:12px;min-height:50px;padding:8px 20px;border-radius:999px;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.08);color:#fff;font:700 18px ${HF};cursor:pointer;touch-action:manipulation}
.${P}-head{position:relative;font:800 30px/1.1 ${HF};margin:4px 0 2px;text-shadow:0 3px 0 rgba(0,0,0,.3)}
.${P}-score{font:800 clamp(60px,12vw,88px)/1 ${HF};color:#fff;text-shadow:0 4px 0 ${c2},0 0 34px ${c1}aa;font-variant-numeric:tabular-nums}
.${P}-unit{font:700 18px ${HF};color:#cbd5e1;margin-top:0}
.${P}-stars{display:flex;justify-content:center;align-items:flex-end;gap:10px;margin:10px 0 8px;font-size:46px;line-height:1}
.${P}-stars i{font-style:normal;display:inline-block;filter:grayscale(1) brightness(.55);opacity:.45;transform:scale(.7);transition:transform .45s cubic-bezier(.2,1.8,.4,1),opacity .3s,filter .3s}
.${P}-stars i:nth-child(2){font-size:58px}
.${P}-stars i.on{filter:drop-shadow(0 0 12px rgba(253,224,71,.9));opacity:1;transform:scale(1)}
.${P}-rib{position:absolute;top:22px;right:-44px;transform:rotate(35deg);padding:7px 50px;background:linear-gradient(180deg,#fde047,#f59e0b);color:#3b2300;font:800 16px ${HF};box-shadow:0 4px 14px rgba(0,0,0,.4);z-index:2;animation:${P}-rib .7s .5s cubic-bezier(.2,1.6,.4,1) both}
@keyframes ${P}-rib{from{transform:rotate(35deg) scale(0)}to{transform:rotate(35deg) scale(1)}}
.${P}-extra{margin:10px 0 2px;font-size:15px;color:#e2e8f0}
@media (max-height:560px){.${P}-ico{font-size:44px}.${P}-mode{min-height:96px}.${P}-mode span{font-size:36px}.${P}-how{margin:4px 0 10px}}
`;
    el.appendChild(css);
    const ov = document.createElement('div'); ov.className = P + '-ov'; el.appendChild(ov);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let anim = 0, tms = [];
    const later = (fn, ms) => { const t = setTimeout(() => { tms = tms.filter(x => x !== t); fn(); }, ms); tms.push(t); };
    const onClick = e => { const b = e.target.closest('button[data-act]'); if (b && o.onAct) o.onAct(b.dataset.act); };
    ov.addEventListener('click', onClick);
    const K = {RM, HF, TF, esc, ov};
    K.hide = () => { ov.classList.remove('on'); ov.innerHTML = ''; cancelAnimationFrame(anim); };
    // start screen: o.title, o.icon, o.how, o.howIcon; modes = [{act, icon, label, sub}] (two = choice cards) or one Play button
    K.start = (s) => {
      cancelAnimationFrame(anim);
      const best = api.best != null ? `<span class="${P}-chip gold">🏆 Best ${esc(api.best)}${s.bestUnit ? ' ' + esc(s.bestUnit) : ''}</span>` : `<span class="${P}-chip">✨ First game!</span>`;
      const modes = s.modes && s.modes.length > 1
        ? `<div class="${P}-modes">${s.modes.map((m, i) => `<button data-act="${m.act}" class="${P}-mode ${i === 0 ? 'main ' + (RM ? '' : P + '-pulse') : ''}"><span>${m.icon}</span>${esc(m.label)}${m.sub ? `<small>${esc(m.sub)}</small>` : ''}</button>`).join('')}</div>`
        : `<button data-act="${(s.modes && s.modes[0] && s.modes[0].act) || 'play'}" class="${P}-play ${RM ? '' : P + '-pulse'}">▶ Play</button>`;
      ov.innerHTML = `<div class="${P}-card ${P}-up">
        <div class="${P}-ico ${RM ? '' : 'bob'}">${o.icon}</div>
        <div class="${P}-t">${esc(o.title)}</div>
        <div class="${P}-how"><b>${s.howIcon || '👆'}</b><span>${esc(s.how)}</span></div>
        <div class="${P}-me"><div class="${P}-av">${esc(api.avatar || '🙂')}</div><span class="${P}-chip">${esc(api.name || 'You')}</span>${best}</div>
        ${modes}</div>`;
      ov.classList.add('on');
    };
    // end screen: e.head, e.score (number), e.unit, e.stars (0-3), e.best, e.isBest, e.extra (html), e.second {act,label}
    K.end = (e) => {
      cancelAnimationFrame(anim);
      ov.innerHTML = `<div class="${P}-card ${e.wide ? 'wide' : ''} ${P}-up">
        ${e.isBest ? `<div class="${P}-rib">🏆 New best!</div>` : ''}
        <div class="${P}-ico">${o.icon}</div>
        <div class="${P}-head">${e.head}</div>
        <div class="${P}-score" data-n="0">0</div><div class="${P}-unit">${esc(e.unit || '')}</div>
        <div class="${P}-stars"><i>⭐</i><i>⭐</i><i>⭐</i></div>
        <div class="${P}-me" style="margin:6px 0 4px"><span class="${P}-chip ${e.isBest ? 'gold' : ''}">🏆 Best ${esc(e.best)}${e.bestUnit ? ' ' + esc(e.bestUnit) : ''}</span></div>
        ${e.extra ? `<div class="${P}-extra">${e.extra}</div>` : ''}
        <button data-act="again" class="${P}-play ${RM ? '' : P + '-pulse'}" style="margin-top:12px">▶ Play again</button>
        ${e.second ? `<button data-act="${e.second.act}" class="${P}-sec">${esc(e.second.label)}</button>` : ''}</div>`;
      ov.classList.add('on');
      const sEl = ov.querySelector('.' + P + '-score'), stars = ov.querySelectorAll('.' + P + '-stars i'), target = +e.score || 0;
      const t0 = performance.now(), dur = RM ? 0 : Math.min(1400, 500 + Math.abs(target)*12);
      const tick = now => {
        const k = dur ? Math.min(1, (now - t0)/dur) : 1, ease = 1 - Math.pow(1 - k, 3);
        sEl.textContent = String(Math.round(target*ease));
        if (k < 1) anim = requestAnimationFrame(tick);
        else stars.forEach((s, i) => { if (i < e.stars) { if (RM) s.classList.add('on'); else later(() => s.classList.add('on'), 160 + i*260); } });
      };
      anim = requestAnimationFrame(tick);
    };
    // ---- canvas helpers ----
    K.rr = (cx, x, y, w, h, r) => { r = Math.min(r, w/2, h/2); cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); };
    // glass HUD pill: label (small caps) over a big value. Returns {x, w, cx, cy} so pop-ups can fly to it.
    K.pill = (cx, x, y, label, value, op) => {
      op = op || {}; const h = op.h || 46, fs = op.fs || 24, ic = op.icon || '';
      cx.font = `800 ${fs}px ${HF}`; const vw = cx.measureText(value).width;
      cx.font = `700 10.5px ${TF}`; const lw = label ? cx.measureText(label).width : 0;
      const iw = ic ? fs*1.15 : 0, w = Math.max(op.minW || 0, Math.max(vw, lw) + 28 + iw + (op.extra || 0));
      const x0 = op.align === 'right' ? x - w : op.align === 'center' ? x - w/2 : x;
      cx.save();
      if (op.glow){ cx.shadowColor = op.glow; cx.shadowBlur = 16; }
      cx.fillStyle = 'rgba(15,23,42,.55)'; K.rr(cx, x0, y, w, h, h/2); cx.fill(); cx.shadowBlur = 0;
      cx.strokeStyle = op.ring || 'rgba(255,255,255,.15)'; cx.lineWidth = 1; K.rr(cx, x0 + 0.5, y + 0.5, w - 1, h - 1, h/2); cx.stroke();
      cx.textBaseline = 'middle';
      if (ic){ cx.font = `${fs*0.86}px system-ui, sans-serif`; cx.textAlign = 'center'; cx.fillStyle = '#fff'; cx.fillText(ic, x0 + 14 + iw/2 - 2, y + h/2 + 1); }
      const tx = x0 + 14 + iw + (Math.max(vw, lw) - 0)/2 + (op.extra ? 0 : 0);
      cx.textAlign = 'center';
      if (label){ cx.font = `700 10.5px ${TF}`; cx.fillStyle = 'rgba(226,232,240,.8)'; cx.fillText(label, tx, y + h*0.27); }
      cx.font = `800 ${fs}px ${HF}`; cx.fillStyle = op.col || '#fff';
      cx.shadowColor = 'rgba(0,0,0,.45)'; cx.shadowOffsetY = 2; cx.shadowBlur = 0;
      cx.fillText(value, tx, y + (label ? h*0.63 : h/2 + 1));
      cx.restore();
      return {x: x0, w, h, cx: tx, cy: y + h/2};
    };
    // outlined headline text (callouts)
    K.big = (cx, s, x, y, size, col, op) => {
      op = op || {};
      cx.font = `800 ${size}px ${HF}`; cx.textAlign = op.align || 'center'; cx.textBaseline = 'middle'; cx.lineJoin = 'round';
      cx.lineWidth = size*0.2; cx.strokeStyle = op.stroke || 'rgba(12,10,30,.88)'; cx.strokeText(s, x, y);
      if (op.glow){ cx.save(); cx.shadowColor = op.glow; cx.shadowBlur = size*0.5; cx.fillStyle = col; cx.fillText(s, x, y); cx.restore(); }
      cx.fillStyle = col; cx.fillText(s, x, y);
      if (op.shine !== false){ cx.save(); cx.globalAlpha *= 0.35; cx.fillStyle = '#fff'; cx.beginPath(); cx.rect(x - 2000, y - size*0.55, 4000, size*0.42); cx.clip(); cx.fillText(s, x, y); cx.restore(); }
    };
    // ---- juice: particles (pooled, capped), flying score pop-ups, shake, flash, hit pause ----
    const parts = [], pool = [], MAXP = 150, flies = [];
    const fx = {shake:0, flash:0, flashCol:'#ffffff', pause:0};
    K.fx = fx;
    K.burst = (x, y, n, op) => {
      op = op || {};
      for (let i = 0; i < n && parts.length < MAXP; i++){
        const p = pool.pop() || {};
        const a = op.ang != null ? op.ang + (Math.random() - 0.5)*(op.spread != null ? op.spread : 6.283) : Math.random()*6.283;
        const sp = (op.speed || 200)*(0.35 + Math.random()*0.65);
        p.x = x + (op.jx ? (Math.random() - 0.5)*op.jx : 0); p.y = y + (op.jy ? (Math.random() - 0.5)*op.jy : 0);
        p.vx = Math.cos(a)*sp + (op.vx || 0); p.vy = Math.sin(a)*sp + (op.vy || 0);
        p.life = (op.life || 0.7)*(0.6 + Math.random()*0.6); p.t = 0;
        p.size = (op.size || 4)*(0.6 + Math.random()*0.7); p.g = op.grav != null ? op.grav : 500; p.drag = op.drag != null ? op.drag : 1.5;
        const cols = op.cols || ['#fff']; p.col = cols[(Math.random()*cols.length) | 0];
        p.shape = op.shape || 'dot'; p.rot = Math.random()*6.283; p.vr = (Math.random() - 0.5)*12;
        parts.push(p);
      }
    };
    K.fly = (text, x, y, tx, ty, col, size) => { if (flies.length < 12) flies.push({text, x, y, sx:x, sy:y, tx, ty, col: col || '#fde047', t:0, size: size || 34}); };
    K.kick = (shake, flash, pause, col) => { if (RM) return; fx.shake = Math.max(fx.shake, shake || 0); fx.flash = Math.max(fx.flash, flash || 0); fx.pause = Math.max(fx.pause, pause || 0); if (col) fx.flashCol = col; };
    // advance effects with the real dt; returns the game dt (0 while a hit pause holds)
    K.tick = dt => {
      for (let i = parts.length - 1; i >= 0; i--){
        const p = parts[i]; p.t += dt;
        if (p.t >= p.life){ pool.push(p); parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
        const d = Math.max(0, 1 - p.drag*dt); p.vx *= d; p.vy = p.vy*d + p.g*dt; p.x += p.vx*dt; p.y += p.vy*dt; p.rot += p.vr*dt;
      }
      for (let i = flies.length - 1; i >= 0; i--){ const f = flies[i]; f.t += dt; if (f.t > 1.05){ flies.splice(i, 1); if (K.onLand) K.onLand(f); } }
      fx.shake = Math.max(0, fx.shake - dt*2.6); fx.flash = Math.max(0, fx.flash - dt*3.2);
      if (fx.pause > 0){ fx.pause -= dt; return 0; }
      return dt;
    };
    K.shakeXY = () => { if (!fx.shake) return [0, 0]; const s = fx.shake*fx.shake*14, t = performance.now(); return [Math.sin(t*0.091)*s, Math.cos(t*0.077)*s*0.7]; };
    K.drawParts = cx => {
      for (const p of parts){
        const k = p.t/p.life, a = k < 0.7 ? 1 : (1 - k)/0.3;
        cx.globalAlpha = a; cx.fillStyle = p.col;
        if (p.shape === 'spark'){ cx.strokeStyle = p.col; cx.lineWidth = p.size*0.6; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx*0.035, p.y - p.vy*0.035); cx.stroke(); }
        else if (p.shape === 'conf'){ cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillRect(-p.size, -p.size*0.5, p.size*2, p.size); cx.restore(); }
        else if (p.shape === 'star'){ cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); const r = p.size; cx.beginPath();
          for (let j = 0; j < 10; j++){ const rr = j % 2 ? r*0.45 : r, an = j*Math.PI/5; cx.lineTo(Math.cos(an)*rr, Math.sin(an)*rr); } cx.closePath(); cx.fill(); cx.restore(); }
        else if (p.shape === 'ring'){ cx.strokeStyle = p.col; cx.lineWidth = 2; cx.beginPath(); cx.arc(p.x, p.y, p.size*(1 + k*3), 0, 6.283); cx.stroke(); }
        else { cx.beginPath(); cx.arc(p.x, p.y, p.size*(1 - k*0.5), 0, 6.283); cx.fill(); }
      }
      cx.globalAlpha = 1;
    };
    K.drawFlies = cx => {
      for (const f of flies){
        const k = Math.min(1, f.t/1.05);
        let x, y, s, a = 1;
        if (k < 0.35){ const q = k/0.35; x = f.sx; y = f.sy - 40*Math.sin(q*Math.PI/2); s = RM ? 1 : 0.5 + 0.7*Math.sin(q*Math.PI*0.75); }
        else { const q = (k - 0.35)/0.65, e = q*q*(3 - 2*q); x = f.sx + (f.tx - f.sx)*e; y = f.sy - 40 + (f.ty - f.sy + 40)*e - Math.sin(e*Math.PI)*60; s = 1 - 0.55*e; a = q > 0.85 ? (1 - q)/0.15 : 1; }
        cx.save(); cx.globalAlpha = a; cx.translate(x, y); cx.scale(s, s); K.big(cx, f.text, 0, 0, f.size, f.col, {shine:false}); cx.restore();
      }
    };
    K.drawFlash = (cx, W, H) => { if (fx.flash > 0){ cx.globalAlpha = Math.min(0.6, fx.flash*0.6); cx.fillStyle = fx.flashCol; cx.fillRect(0, 0, W, H); cx.globalAlpha = 1; } };
    // radiating rays behind a big callout
    K.rays = (cx, x, y, r, col, a, rot) => {
      cx.save(); cx.translate(x, y); cx.rotate(rot || 0); cx.globalAlpha = a; cx.fillStyle = col;
      for (let i = 0; i < 12; i++){ cx.beginPath(); cx.moveTo(0, 0); cx.arc(0, 0, r, i*0.5236 - 0.11, i*0.5236 + 0.11); cx.closePath(); cx.fill(); }
      cx.restore();
    };
    K.clearFx = () => { while (parts.length) pool.push(parts.pop()); flies.length = 0; fx.shake = fx.flash = fx.pause = 0; };
    K.destroy = () => { cancelAnimationFrame(anim); tms.forEach(clearTimeout); tms = []; ov.removeEventListener('click', onClick); };
    return K;
  }
  window.BreakGames.bowling = { start(el, api){
    const C = api.colors, RM = !!api.reducedMotion;
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
    el.appendChild(cv);
    const cx = cv.getContext('2d');
    const K = bbKit(el, api, {id:'bowling', icon:'🎳', title:'Bowling', c1:'#a78bfa', c2:'#7c3aed', onAct: a => {
      if (a === 'p1') startGame(1); else if (a === 'p2') startGame(2); else if (a === 'again') startGame(nP); else if (a === 'menu') menu(); }});
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, rect = null, T = 0;
    const room = document.createElement('canvas'), rx = room.getContext('2d');
    const size = () => { rect = el.getBoundingClientRect(); dpr = window.devicePixelRatio || 1;
      W = Math.max(1, rect.width); H = Math.max(1, rect.height); cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); cx.setTransform(dpr,0,0,dpr,0,0); sizeKey = ''; };
    let sizeKey = '';
    size(); window.addEventListener('resize', size);
    const HEAD_FONT = '"Baloo 2", system-ui, sans-serif', TXT_FONT = '"Lexend", system-ui, sans-serif';

    // ---- world (cm). x across the lane, z down the lane from the foul line ----
    const LH = 53, GW = 22, HEADZ = 1830, ROWD = 26.4, SP = 30.48, PR = 6.05, PRF = 8.5, BR = 10.9;
    const DECKEND = 1958, PITEND = 2060, HOOK = 125, MB = 7, MP = 1.6;
    const pins = []; for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) pins.push({hx:(i - r/2)*SP, hz:HEADZ + r*ROWD, x:0, z:0, vx:0, vz:0, down:false, gone:false, up0:true, ang:0, fallT:1, spin:0});
    const ball = {x:0, z:0, vx:0, vz:0, spin:0, gutter:false, active:false, rollA:0};
    const rack = () => { for (const p of pins){ p.x = p.hx; p.z = p.hz; p.vx = p.vz = 0; p.down = p.gone = false; p.fallT = 1; p.ang = 0; } };
    const sweep = () => { for (const p of pins){ if (p.down && !p.gone) p.gone = true; p.vx = p.vz = 0; } };
    rack();
    // wood grain streaks, fixed in the world so they slide by as the camera follows the ball
    const grain = []; { let s = 5; const r = () => (s = (s*16807) % 2147483647)/2147483647; for (let i = 0; i < 70; i++) grain.push({x: (r()*2 - 1)*(LH - 2), z: r()*1800, l: 40 + r()*120}); }

    // ---- game state ----
    let phase = 'menu', nP = 1, players = [], cur = 0, frame = 0, fresh = true, camZ = 0, rollT = 0, passT = -1, resT = 0;
    let popup = null, hintOn = true, drag = null, guide = null, lastResult = null, impCd = 0, firstHit = false, totBump = 0;
    const btrail = [];
    const setPhase = p => { phase = p; el.dataset.phase = p; };
    const newPlayer = (name, av) => ({name, av, frames: Array.from({length:10}, () => []), run: 0, strikes: 0});

    // ---- scoring ----
    function scoreOf(pl){ // cumulative per frame (null when not yet known)
      const rolls = [], starts = [];
      pl.frames.forEach(f => { starts.push(rolls.length); rolls.push(...f); });
      const out = []; let tot = 0;
      for (let f = 0; f < 10; f++){
        const fr = pl.frames[f], i = starts[f]; let v = null;
        if (f < 9){
          if (fr[0] === 10){ if (rolls.length > i + 2) v = 10 + rolls[i+1] + rolls[i+2]; }
          else if (fr.length === 2){ v = fr[0] + fr[1] === 10 ? (rolls.length > i + 2 ? 10 + rolls[i+2] : null) : fr[0] + fr[1]; }
        } else {
          const done = fr.length === 3 || (fr.length === 2 && fr[0] + fr[1] < 10);
          if (done) v = fr.reduce((a, b) => a + b, 0);
        }
        if (v == null){ for (let k = f; k < 10; k++) out.push(null); break; }
        tot += v; out.push(tot);
      }
      return out;
    }
    const total = pl => { const s = scoreOf(pl); let t = 0; s.forEach(v => { if (v != null) t = v; }); return t; };
    const mk = n => n === 0 ? '-' : String(n);
    function marks(fr, tenth){
      const [a, b, c] = fr;
      if (!tenth){ if (a === 10) return ['', 'X']; return [a == null ? '' : mk(a), b == null ? '' : (a + b === 10 ? '/' : mk(b))]; }
      const m = ['', '', ''];
      if (a != null) m[0] = a === 10 ? 'X' : mk(a);
      if (b != null) m[1] = a === 10 ? (b === 10 ? 'X' : mk(b)) : (a + b === 10 ? '/' : mk(b));
      if (c != null){ if (a === 10 && b === 10) m[2] = c === 10 ? 'X' : mk(c); else if (a === 10) m[2] = b + c === 10 ? '/' : mk(c); else m[2] = c === 10 ? 'X' : mk(c); }
      return m;
    }

    // ---- layout + projection ----
    let L = {}, G = {};
    function layout(){
      const sbH = 18 + nP*34 + 10;
      const vt = sbH + 6, vb = H - 12;
      const laneHalf = Math.min(W*0.32, (vb - vt)*0.5);
      const s0 = laneHalf / LH, D = 520;
      const hy = vt + (vb - vt)*0.06, sy0 = vb - Math.max(70, (vb - vt)*0.14);
      L = {sbH, vt, vb, s0, D, F:s0*D, hy, sy0, HC:(sy0 - hy)/s0, cxm: W/2};
      // as the camera follows the ball it also rises, so the pin triangle opens up
      const tt = Math.max(0, camZ)/1500; L.HCe = L.HC*(1 + 1.4*tt); L.hye = hy - tt*(vb - vt)*0.43;
      const key = W + 'x' + H + ':' + nP;
      if (key !== sizeKey){ sizeKey = key; paintRoom(); }
    }
    function proj(x, z, out){ const dz = z - camZ + L.D; const s = L.F / Math.max(dz, 30); out.x = L.cxm + x*s; out.y = L.hye + L.HCe*s; out.s = s; return out; }
    const P1 = {x:0,y:0,s:0}, P2 = {x:0,y:0,s:0}, P3 = {x:0,y:0,s:0}, P4 = {x:0,y:0,s:0}, PI = {x:0,y:0,s:0};
    const xAtFoul = sx => { proj(0, 0, P1); return (sx - L.cxm)/P1.s; };

    // the room behind the lanes, painted once per size: cosmic-bowling walls with neon and glowing dots
    const dots = []; { let s = 3; const r = () => (s = (s*16807) % 2147483647)/2147483647; for (let i = 0; i < 90; i++) dots.push({u: r(), v: r(), c: r(), z: r()}); }
    const NEON = ['#f472b6', '#22d3ee', '#a3e635', '#facc15', '#c084fc'];
    function paintRoom(){
      room.width = cv.width; room.height = cv.height; const g = rx;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0b0620'); gr.addColorStop(0.45, '#1c0f45'); gr.addColorStop(1, '#0a0618');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      // wall panels
      g.fillStyle = 'rgba(255,255,255,.025)'; for (let x = 0; x < W; x += 90) g.fillRect(x, 0, 45, H);
      // glowing cosmic dots
      for (const d of dots){ const x = d.u*W, y = L.sbH + d.v*(H - L.sbH)*0.6, r = 1 + d.z*2.2, col = NEON[(d.c*NEON.length) | 0];
        g.save(); g.shadowColor = col; g.shadowBlur = 8; g.globalAlpha = 0.35 + d.z*0.5; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.restore(); }
      // neon tubes along the wall
      const neon = (y, col, w) => { g.save(); g.shadowColor = col; g.shadowBlur = 18; g.strokeStyle = col; g.lineWidth = w; g.globalAlpha = 0.9;
        g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= W; x += 40) g.lineTo(x, y + Math.sin(x*0.02)*6); g.stroke(); g.restore(); };
      neon(L.sbH + (H - L.sbH)*0.12, '#f472b6', 3); neon(L.sbH + (H - L.sbH)*0.16, '#22d3ee', 2);
      // ceiling spotlights
      for (let x = W*0.1; x < W; x += W*0.2){ gr = g.createRadialGradient(x, L.sbH, 0, x, L.sbH, 160); gr.addColorStop(0, 'rgba(255,240,255,.28)'); gr.addColorStop(1, 'rgba(255,240,255,0)');
        g.fillStyle = gr; g.fillRect(x - 160, L.sbH, 320, 200); }
      // screen-space gradients reused every frame (the lane moves, these don't)
      G.shade = cx.createLinearGradient(0, L.vt, 0, L.vb); G.shade.addColorStop(0, 'rgba(255,236,200,.25)'); G.shade.addColorStop(0.5, 'rgba(255,236,200,0)'); G.shade.addColorStop(1, 'rgba(60,25,5,.28)');
      G.sheen = cx.createLinearGradient(0, L.vt, 0, L.vb); G.sheen.addColorStop(0, 'rgba(255,255,255,.35)'); G.sheen.addColorStop(0.6, 'rgba(255,255,255,.07)'); G.sheen.addColorStop(1, 'rgba(255,255,255,0)');
      G.vig = cx.createRadialGradient(W/2, H*0.55, Math.min(W, H)*0.35, W/2, H*0.55, Math.max(W, H)*0.8); G.vig.addColorStop(0, 'rgba(0,0,0,0)'); G.vig.addColorStop(1, 'rgba(5,2,20,.5)');
    }
    // unit-space gradients for pins and the ball (moved into place with translate/scale)
    const gPin = cx.createLinearGradient(-0.55, 0, 0.55, 0); gPin.addColorStop(0, '#a9a69c'); gPin.addColorStop(0.3, '#ffffff'); gPin.addColorStop(0.55, '#f4f2ea'); gPin.addColorStop(1, '#8f8c82');
    const gBall = cx.createRadialGradient(-0.3, -0.35, 0.05, 0, 0, 1); gBall.addColorStop(0, '#c4b5fd'); gBall.addColorStop(0.45, '#6d28d9'); gBall.addColorStop(1, '#1e0b4b');
    const gSpec = cx.createRadialGradient(-0.38, -0.45, 0, -0.38, -0.45, 0.45); gSpec.addColorStop(0, 'rgba(255,255,255,.95)'); gSpec.addColorStop(1, 'rgba(255,255,255,0)');

    // ---- physics ----
    function collide(a, ra, ma, b, rb, mb, e){
      const dx = b.x - a.x, dz = b.z - a.z, d2 = dx*dx + dz*dz, rr = ra + rb;
      if (d2 >= rr*rr || d2 < 1e-6) return 0;
      const d = Math.sqrt(d2), nx = dx/d, nz = dz/d, vrel = (b.vx - a.vx)*nx + (b.vz - a.vz)*nz;
      const over = rr - d, ia = 1/ma, ib = 1/mb, it = ia + ib;
      a.x -= nx*over*ia/it; a.z -= nz*over*ia/it; b.x += nx*over*ib/it; b.z += nz*over*ib/it;
      if (vrel >= 0) return 0;
      const j = -(1 + e)*vrel / it;
      a.vx -= j*ia*nx; a.vz -= j*ia*nz; b.vx += j*ib*nx; b.vz += j*ib*nz;
      // a little scatter so pin action looks lively
      const kick = (Math.random() - 0.5)*0.35*j*ib;
      b.vx += -nz*kick; b.vz += nx*kick;
      return -vrel;
    }
    const topple = p => { if (!p.down){ p.down = true; p.fallT = 0; p.ang = Math.atan2(p.vz, p.vx) || Math.PI/2; p.spin = (Math.random() - 0.5)*8; } };
    const rad = p => p.down ? PRF : PR;
    function impact(p, v, byBall){ // chips and sparks where a pin is struck (purely visual)
      if (impCd > 0 && !byBall) return; impCd = 0.03;
      proj(p.x, p.z, PI); const y = PI.y - 18*PI.s;
      K.burst(PI.x, y, byBall ? 9 : 4, {cols: ['#fff', '#fef3c7', '#fde68a'], shape: 'spark', speed: Math.min(420, 120 + v*0.4), grav: 500, size: 2.5, life: 0.35});
      if (byBall && !firstHit){ firstHit = true; K.kick(0.45, 0.06, 0.06, '#fff7ed');
        K.burst(PI.x, y, 3, {cols: ['rgba(255,255,255,.8)'], shape: 'ring', speed: 0, grav: 0, size: 10, life: 0.4}); }
    }
    function step(dt){
      if (ball.active){
        if (!ball.gutter && ball.z > 820 && ball.z < HEADZ + 60) ball.vx += ball.spin*HOOK*dt;
        ball.x += ball.vx*dt; ball.z += ball.vz*dt; ball.rollA += Math.hypot(ball.vx, ball.vz)*dt/BR;
        ball.vz *= (1 - 0.015*dt);
        if (!ball.gutter && Math.abs(ball.x) > LH){ ball.gutter = true; ball.spin = 0; }
        if (ball.gutter){ const tx = Math.sign(ball.x)*(LH + GW/2); ball.x += (tx - ball.x)*Math.min(1, dt*14); ball.vx = 0; }
        if (ball.z > PITEND){ ball.active = false; }
        if (!ball.gutter && ball.z > HEADZ - 30 && ball.z < DECKEND + 20){
          for (const p of pins){ if (p.gone) continue; const hit = collide(ball, BR, MB, p, rad(p), MP, 0.8); if (hit > 30){ topple(p); impact(p, hit, true); } }
        }
      }
      for (let i = 0; i < 10; i++){
        const p = pins[i]; if (p.gone) continue;
        const sp = Math.hypot(p.vx, p.vz);
        if (sp > 0){ const dec = (p.down ? 260 : 900)*dt, k = Math.max(0, sp - dec)/sp; p.vx *= k; p.vz *= k; }
        p.x += p.vx*dt; p.z += p.vz*dt;
        if (!p.down && sp > 140) topple(p);
        if (p.down){ p.ang += p.spin*dt*Math.min(1, sp/120); if (p.fallT < 1) p.fallT = Math.min(1, p.fallT + dt*4.5); }
        if (Math.abs(p.x) > LH + 2 || p.z > DECKEND || p.z < HEADZ - 220){ p.down = true; p.gone = true; }
        for (let j = i + 1; j < 10; j++){
          const q = pins[j]; if (q.gone) continue;
          const hit = collide(p, rad(p), MP, q, rad(q), MP, 0.75);
          if (hit > 45){ if (p.down || sp > 60) topple(q); if (q.down) topple(p); impact(q, hit, false); }
        }
      }
    }
    const pinsMoving = () => pins.some(p => !p.gone && Math.hypot(p.vx, p.vz) > 4) || pins.some(p => p.down && !p.gone && p.fallT < 1);

    // ---- turn flow ----
    function startGame(n){
      nP = n; players = [newPlayer(api.name || 'You', api.avatar || '🙂')];
      if (n === 2) players.push(newPlayer('Player 2', '🐼'));
      cur = 0; frame = 0; fresh = true; hintOn = true; rack(); resetBall();
      K.hide(); K.clearFx();
      setPhase('aim'); showPop(n === 2 ? players[0].av + ' ' + players[0].name + "'s turn" : 'Frame 1', C.accent, 1.1, true);
    }
    function resetBall(){ ball.x = 0; ball.z = 0; ball.vx = ball.vz = 0; ball.spin = 0; ball.gutter = false; ball.active = false; ball.rollA = 0; btrail.length = 0; }
    function showPop(txt, col, dur, small, big){ popup = {txt, col, t:0, dur: dur || 1.3, small: !!small, big: !!big}; }
    function finishRoll(){
      const pl = players[cur], fr = pl.frames[frame];
      let n = 0; for (const p of pins) if (p.up0 && (p.down || p.gone)) n++;
      const standingBefore = pins.filter(p => p.up0).length;
      fr.push(n);
      let label, col = C.ink, big = false;
      if (fresh && n === 10){ pl.run++; pl.strikes++; big = true;
        label = pl.run === 2 ? 'Double!' : pl.run === 3 ? 'Turkey!' : pl.run > 3 ? pl.run + '-Bagger!' : 'Strike!'; col = '#ff8a3d';
        if (!RM) api.confetti(25); K.kick(0.9, 0.35, 0.12, '#fff1e6'); }
      else if (!fresh && n === standingBefore && n > 0){ label = 'Spare!'; col = '#4ade80'; big = true; K.kick(0.4, 0.15, 0.06, '#ecfdf5'); }
      else if (ball.gutter && n === 0) { label = 'Gutter ball'; col = C.mut; }
      else label = n === 1 ? '1 pin' : n + ' pins';
      if (fresh && n !== 10) pl.run = 0;
      lastResult = label;
      showPop(label, col, 1.4, !/!/.test(label), big);
      popup.low = popup.small;
      if (n > 0){ const tc = totCell(cur); K.fly('+' + n, W/2, popY(!big) + (big ? 80 : -62), tc[0], tc[1], big ? '#fde047' : '#ffffff', big ? 40 : 32); }
      // decide what happens next
      let over = false, rerack = false;
      if (frame < 9){ if (fr.length === 1 && n === 10) over = true; else if (fr.length === 2) over = true; }
      else {
        if (fr.length === 1) rerack = n === 10;
        else if (fr.length === 2){ if (fr[0] === 10) rerack = fr[1] === 10; else if (fr[0] + fr[1] === 10) rerack = true; else over = true; }
        else over = true;
      }
      resT = 0; setPhase('result');
      pending = {over, rerack};
    }
    let pending = null;
    function nextTurn(){
      const {over, rerack} = pending; pending = null;
      if (over){
        // next player / frame
        let np = cur + 1, nf = frame;
        if (np >= nP){ np = 0; nf++; }
        if (nf >= 10){ endGame(); return; }
        const changed = np !== cur || nP === 1;
        cur = np; frame = nf; fresh = true; rack();
        if (nP === 2) showPop(players[cur].av + ' ' + players[cur].name + "'s turn", C.accent, 1.2, true);
        else if (changed) showPop('Frame ' + (frame + 1), C.accent, 1, true);
      } else if (rerack){ fresh = true; rack(); }
      else { fresh = false; sweep(); }
      for (const p of pins) p.up0 = !p.gone;
      resetBall(); setPhase('aim');
    }
    function endGame(){
      setPhase('end');
      const t1 = total(players[0]);
      const r = api.saveScore(t1) || {};
      const esc = K.esc;
      let head = 'Game over!';
      if (nP === 2){ const t2 = total(players[1]); head = t1 === t2 ? "It's a tie!" : (t1 > t2 ? esc(players[0].name) + ' wins!' : 'Player 2 wins!'); }
      const stars = t1 >= 140 ? 3 : t1 >= 90 ? 2 : 1;
      const rows = players.map(p => `<div style="display:flex;justify-content:space-between;gap:20px;font:700 19px ${HEAD_FONT};padding:3px 6px"><span>${esc(p.av)} ${esc(p.name)}</span><span style="color:#cbd5e1;font:500 14px ${TXT_FONT};align-self:center">${p.strikes} strike${p.strikes === 1 ? '' : 's'}</span><b>${total(p)}</b></div>`).join('');
      K.end({head, score: t1, unit: 'pins', stars, best: r.best != null ? r.best : t1, isBest: !!r.isBest,
        extra: `<div style="min-width:240px;max-width:340px;margin:0 auto">${rows}</div>`, second: {act: 'menu', label: '👥 Players'}});
    }
    function menu(){
      setPhase('menu'); resetBall(); rack(); players = []; nP = 1; popup = null;
      K.start({how: 'Swipe up to roll. Curve it to spin!', howIcon: '👆',
        modes: [{act: 'p1', icon: '🎳', label: '1 player', sub: '10 frames, beat your best'}, {act: 'p2', icon: '👥', label: '2 players', sub: 'Take turns on one iPad'}]});
    }

    // ---- input: swipe ----
    const pt = e => ({x: e.clientX - rect.left, y: e.clientY - rect.top, t: e.timeStamp || performance.now()});
    function down(e){
      if (phase !== 'aim') return;
      rect = el.getBoundingClientRect(); layout();
      const p = pt(e);
      if (p.y < L.hy + (L.sy0 - L.hy)*0.4) return;
      ball.x = Math.max(-(LH - BR - 2), Math.min(LH - BR - 2, xAtFoul(p.x)));
      drag = {id: e.pointerId, pts: [p]}; hintOn = false;
      try { cv.setPointerCapture(e.pointerId); } catch(_){}
      setPhase('drag');
    }
    function move(e){
      if (!drag || e.pointerId !== drag.id) return;
      const p = pt(e); drag.pts.push(p); if (drag.pts.length > 80) drag.pts.splice(1, 1);
      const a = drag.pts[0]; guide = {dx: p.x - a.x, dy: p.y - a.y};
    }
    function up(e){
      if (!drag || e.pointerId !== drag.id) return;
      const p = pt(e); drag.pts.push(p);
      const pts = drag.pts; drag = null; guide = null;
      const a = pts[0], b = pts[pts.length - 1], dy = b.y - a.y, dx = b.x - a.x;
      if (dy > -40 || Math.abs(dx) > -dy*1.6){ setPhase('aim'); return; }
      // power from the swipe speed (last 120 ms, else whole swipe)
      let k = pts.length - 1; while (k > 0 && b.t - pts[k-1].t <= 120) k--;
      let dist = 0, dur = b.t - pts[k].t;
      for (let i = k + 1; i < pts.length; i++) dist += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y);
      if (dur < 20 || dist < 20){ dist = 0; for (let i = 1; i < pts.length; i++) dist += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y); dur = b.t - a.t; }
      const v = dur > 0 ? dist/dur*1000 * (700/Math.max(400, H)) : 3000;
      const vz = Math.max(470, Math.min(1080, 380 + v*0.33));
      // aim: extend the swipe to the head pin's row on screen
      proj(0, HEADZ, P1);
      const t = (P1.y - a.y)/dy; let tx = (a.x + dx*t - L.cxm)/P1.s;
      tx = ball.x + (tx - ball.x)*0.55; tx = Math.max(-LH - 20, Math.min(LH + 20, tx));
      // hook: how much the swipe bowed away from a straight line
      const len = Math.hypot(dx, dy); let bow = 0, nb = 0;
      for (let i = 1; i < pts.length - 1; i++){ const q = pts[i]; const f = ((q.x - a.x)*dx + (q.y - a.y)*dy)/(len*len); if (f < 0.2 || f > 0.8) continue;
        bow += (dx*(q.y - a.y) - dy*(q.x - a.x))/len; nb++; }
      bow = nb ? bow/nb/len : 0;
      const spin = Math.abs(bow) < 0.03 ? 0 : Math.max(-1, Math.min(1, -bow*5));
      ball.vz = vz; ball.vx = vz*(tx - ball.x)/HEADZ - spin*HOOK*0.55; ball.spin = spin; ball.active = true;
      rollT = 0; passT = -1; firstHit = false; for (const p of pins) p.up0 = !p.gone && !p.down;
      proj(ball.x, 0, PI); K.burst(PI.x, PI.y, 10, {cols: ['rgba(196,181,253,.9)', '#fff'], speed: 160, ang: -Math.PI/2, spread: 2.4, grav: 200, size: 3, life: 0.4});
      if (vz > 950) K.kick(0.2, 0, 0);
      setPhase('roll');
    }
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

    // ---- drawing ----
    function poly(pts, fill){ cx.beginPath(); cx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) cx.lineTo(pts[i].x, pts[i].y); cx.closePath(); cx.fillStyle = fill; cx.fill(); }
    const qp = [], qn = () => { const o = qp[qi] || (qp[qi] = {x:0,y:0,s:0}); qi++; return o; }; let qi = 0;
    const q = (x, z) => proj(x, z, qn());   // pooled projections, recycled every frame
    function laneSet(off, zN, dim){
      const o = LH + GW + 14;
      poly([q(off - o, zN), q(off + o, zN), q(off + o, PITEND), q(off - o, PITEND)], dim ? '#1d130c' : '#3a2616');
      for (const sgn of [-1, 1]){
        const g1 = q(off + sgn*LH, zN), g2 = q(off + sgn*(LH + GW), zN), g3 = q(off + sgn*(LH + GW), DECKEND), g4 = q(off + sgn*LH, DECKEND);
        poly([g1, g2, g3, g4], dim ? '#363b47' : '#7f8898');
        const m1 = q(off + sgn*(LH + GW*0.22), zN), m2 = q(off + sgn*(LH + GW*0.78), zN), m3 = q(off + sgn*(LH + GW*0.78), DECKEND), m4 = q(off + sgn*(LH + GW*0.22), DECKEND);
        poly([m1, m2, m3, m4], dim ? '#2a2e38' : '#5d6574');
        if (!dim){ cx.strokeStyle = 'rgba(255,255,255,.45)'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(g2.x, g2.y); cx.lineTo(g3.x, g3.y); cx.stroke(); }
      }
      if (zN < 0) poly([q(off - LH, zN), q(off + LH, zN), q(off + LH, 0), q(off - LH, 0)], dim ? '#4a3622' : '#e3c08a');
      const z0 = Math.max(0, zN), NB = dim ? 1 : 13;
      for (let k = 0; k < NB; k++){ const x0 = off - LH + k*2*LH/NB, x1 = x0 + 2*LH/NB;
        poly([q(x0, z0), q(x1, z0), q(x1, DECKEND), q(x0, DECKEND)], dim ? '#5b4129' : (k % 2 ? '#dfae6c' : '#e8bb7b')); }
    }
    function drawLane(){
      qi = 0;
      cx.drawImage(room, 0, 0, W, H);
      // drifting glow motes
      if (!RM) for (let i = 0; i < 18; i++){ const d = dots[i*4], x = ((d.u*W + T*(8 + d.z*14)) % (W + 20)) - 10, y = L.vt + ((d.v*(H - L.vt) - T*(5 + d.c*8)) % (H - L.vt) + (H - L.vt)) % (H - L.vt);
        cx.globalAlpha = 0.25 + 0.25*Math.sin(T*2 + i); cx.fillStyle = NEON[i % NEON.length]; cx.beginPath(); cx.arc(x, y, 1.5 + d.z*1.5, 0, 6.283); cx.fill(); }
      cx.globalAlpha = 1;
      const zN = Math.max(camZ - L.D + 60, -260), o = LH + GW + 14, off = 2*o + 22;
      // neighbour lanes for depth, dimmed
      laneSet(-off, zN, true); laneSet(off, zN, true);
      laneSet(0, zN, false);
      // light, sheen and grain on our lane
      const z0 = Math.max(0, zN);
      poly([q(-LH, z0), q(LH, z0), q(LH, DECKEND), q(-LH, DECKEND)], G.shade);
      poly([q(-LH*0.45, z0), q(LH*0.45, z0), q(LH*0.45, DECKEND), q(-LH*0.45, DECKEND)], G.sheen);
      cx.strokeStyle = 'rgba(120,70,20,.22)'; cx.lineWidth = 1;
      cx.beginPath();
      for (const gr of grain){ if (gr.z < z0) continue; const a = q(gr.x, gr.z), b = q(gr.x, Math.min(DECKEND, gr.z + gr.l)); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); }
      cx.stroke();
      // pin deck, brighter under the lights
      poly([q(-LH, HEADZ - 70), q(LH, HEADZ - 70), q(LH, DECKEND), q(-LH, DECKEND)], 'rgba(255,245,225,.22)');
      // foul line with a glow, arrows and dots
      if (zN < 0){ const a = q(-LH, 0), b = q(LH, 0); cx.save(); cx.shadowColor = '#ef4444'; cx.shadowBlur = 10; cx.strokeStyle = '#dc2626'; cx.lineWidth = Math.max(2, 3*a.s); cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); cx.restore(); }
      for (let k = -3; k <= 3; k++){
        const x = k*13.6, z0a = 460 - Math.abs(k)*14; if (z0a < zN) continue;
        const t = q(x, z0a + 26), l = q(x - 2.8, z0a), r = q(x + 2.8, z0a);
        cx.fillStyle = '#4c1d95'; cx.beginPath(); cx.moveTo(t.x, t.y); cx.lineTo(l.x, l.y); cx.lineTo(r.x, r.y); cx.closePath(); cx.fill();
        cx.fillStyle = 'rgba(196,181,253,.6)'; const t2 = q(x, z0a + 20), l2 = q(x - 1, z0a + 6); cx.beginPath(); cx.moveTo(t2.x, t2.y); cx.lineTo(l2.x, l2.y); cx.lineTo(t.x, t.y); cx.closePath(); cx.fill();
        if (zN < 200){ cx.fillStyle = '#4c1d95'; const d = q(x, 200); cx.beginPath(); cx.arc(d.x, d.y, Math.max(1.2, 1.5*d.s), 0, 6.283); cx.fill(); }
      }
      cx.fillStyle = 'rgba(120,70,20,.35)';
      for (const p of pins){ const s = q(p.hx, p.hz); cx.beginPath(); cx.ellipse(s.x, s.y, 3*s.s, 1.5*s.s, 0, 0, 6.283); cx.fill(); }
      // pit, back wall and the glowing masking panel
      poly([q(-o, DECKEND), q(o, DECKEND), q(o, PITEND), q(-o, PITEND)], '#08050c');
      const bw = q(0, PITEND), wl = q(-o - 40, PITEND), wr = q(o + 40, PITEND), top = bw.y - 100*bw.s;
      const wg = cx.createLinearGradient(0, top, 0, bw.y); wg.addColorStop(0, '#4c1d95'); wg.addColorStop(0.7, '#1e1048'); wg.addColorStop(1, '#0b0620');
      cx.fillStyle = wg; cx.fillRect(wl.x, top, wr.x - wl.x, bw.y - top);
      cx.strokeStyle = '#c084fc'; cx.lineWidth = Math.max(1, 2*bw.s); cx.save(); cx.shadowColor = '#c084fc'; cx.shadowBlur = 12; cx.strokeRect(wl.x + 3, top + 3, wr.x - wl.x - 6, bw.y - top - 6); cx.restore();
      cx.save(); cx.shadowColor = '#facc15'; cx.shadowBlur = 14; cx.fillStyle = '#fde68a'; cx.font = `800 ${Math.max(9, 22*bw.s)}px ${HEAD_FONT}`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText('★ PAGE QUEST LANES ★', bw.x, top + 32*bw.s); cx.restore();
      // light falling on the pins from under the panel
      const lg = cx.createRadialGradient(bw.x, bw.y, 0, bw.x, bw.y, 140*bw.s); lg.addColorStop(0, 'rgba(255,250,235,.35)'); lg.addColorStop(1, 'rgba(255,250,235,0)');
      cx.fillStyle = lg; cx.fillRect(bw.x - 140*bw.s, bw.y - 60*bw.s, 280*bw.s, 200*bw.s);
    }
    function pinShape(h, w){ // pin outline, base at (0,0), pointing up, h = height px, w = belly width px
      const hw = w/2;
      cx.beginPath(); cx.moveTo(-hw*0.55, 0);
      cx.bezierCurveTo(-hw*1.05, -h*0.15, -hw*1.1, -h*0.4, -hw*0.42, -h*0.66);
      cx.bezierCurveTo(-hw*0.3, -h*0.74, -hw*0.62, -h*0.86, -hw*0.5, -h*0.94);
      cx.bezierCurveTo(-hw*0.35, -h*1.02, hw*0.35, -h*1.02, hw*0.5, -h*0.94);
      cx.bezierCurveTo(hw*0.62, -h*0.86, hw*0.3, -h*0.74, hw*0.42, -h*0.66);
      cx.bezierCurveTo(hw*1.1, -h*0.4, hw*1.05, -h*0.15, hw*0.55, 0);
      cx.closePath();
    }
    function pinBody(h, w){
      cx.save(); cx.scale(w, h); pinShape(1, 1); cx.fillStyle = gPin; cx.fill(); cx.restore();
      cx.fillStyle = '#dc2626'; cx.fillRect(-w*0.22, -h*0.76, w*0.44, h*0.035); cx.fillRect(-w*0.21, -h*0.71, w*0.42, h*0.035);
      cx.fillStyle = 'rgba(255,255,255,.85)'; cx.beginPath(); cx.ellipse(-w*0.2, -h*0.42, w*0.07, h*0.13, 0, 0, 6.283); cx.fill();
      cx.beginPath(); cx.ellipse(-w*0.1, -h*0.9, w*0.05, h*0.035, 0, 0, 6.283); cx.fill();
    }
    function drawPinUp(p, s, tilt){
      const h = 38*s, w = 12.5*s;
      cx.save(); cx.translate(P2.x, P2.y);
      cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(0, 0, w*0.65, w*0.24, 0, 0, 6.283); cx.fill();
      if (!tilt){ cx.save(); cx.globalAlpha = 0.16; cx.scale(1, -0.4); pinBody(h, w); cx.restore(); }   // reflection in the glossy deck
      if (tilt) cx.rotate(tilt);
      pinBody(h, w);
      cx.restore();
    }
    function drawPinDown(p){
      const ca = Math.cos(p.ang), sa = Math.sin(p.ang);
      proj(p.x - ca*7, p.z - sa*7, P3); proj(p.x + ca*28, p.z + sa*28, P4);
      const s = (P3.s + P4.s)/2, ang = Math.atan2(P4.y - P3.y, P4.x - P3.x), len = Math.hypot(P4.x - P3.x, P4.y - P3.y);
      cx.save(); cx.translate(P3.x, P3.y - 5*s); cx.rotate(ang + Math.PI/2);
      cx.scale(1, Math.max(0.25, len/(38*s)));
      pinBody(38*s, 11*s);
      cx.restore();
    }
    function drawBall(){
      proj(ball.x, ball.z, P2); const r = BR*P2.s, y = P2.y - r;
      // trail behind a rolling ball
      if (ball.active && btrail.length > 3){ for (let i = 0; i < btrail.length - 2; i += 2){ proj(btrail[i], btrail[i+1], P3); const a = i/btrail.length;
        cx.globalAlpha = a*0.3; cx.fillStyle = '#a78bfa'; cx.beginPath(); cx.arc(P3.x, P3.y - BR*P3.s, BR*P3.s*(0.5 + a*0.5), 0, 6.283); cx.fill(); } cx.globalAlpha = 1; }
      cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(P2.x, P2.y, r*0.95, r*0.32, 0, 0, 6.283); cx.fill();
      // reflection
      cx.save(); cx.globalAlpha = 0.13; cx.translate(P2.x, P2.y + r*0.42); cx.scale(r*0.92, r*0.42); cx.fillStyle = gBall; cx.beginPath(); cx.arc(0, 0, 1, 0, 6.283); cx.fill(); cx.restore();
      cx.save(); cx.translate(P2.x, y); cx.scale(r, r);
      cx.fillStyle = gBall; cx.beginPath(); cx.arc(0, 0, 1, 0, 6.283); cx.fill();
      // marbled swirls that roll with the ball
      cx.save(); cx.clip(); const ph = ball.rollA;
      cx.strokeStyle = 'rgba(244,114,182,.45)'; cx.lineWidth = 0.18;
      for (let k = 0; k < 3; k++){ const yy = Math.sin(ph + k*2.1)*0.8; cx.beginPath(); cx.moveTo(-1.2, yy - 0.3); cx.bezierCurveTo(-0.4, yy + 0.5, 0.3, yy - 0.6, 1.2, yy + 0.2); cx.stroke(); }
      cx.restore();
      // finger holes roll with the ball
      cx.fillStyle = 'rgba(10,5,30,.9)';
      for (const [ox, oa] of [[-0.22, 0], [0.22, 0], [0, 0.55]]){
        const a = ph + oa, c = Math.cos(a); if (c < 0.15) continue;
        cx.beginPath(); cx.ellipse(ox, -Math.sin(a)*0.6, 0.11, 0.11*c, 0, 0, 6.283); cx.fill();
      }
      cx.fillStyle = gSpec; cx.beginPath(); cx.arc(0, 0, 1, 0, 6.283); cx.fill();
      cx.restore();
    }
    function drawObjects(){
      // painter's order: far to near
      const list = [];
      for (const p of pins) if (!p.gone) list.push(p);
      if (ball.active || phase === 'aim' || phase === 'drag' || phase === 'menu') list.push(ball);
      list.sort((a, b) => b.z - a.z);
      for (const o of list){
        if (o === ball){ if (ball.z - camZ + L.D > 40) drawBall(); continue; }
        if (o.down && o.fallT >= 1) drawPinDown(o);
        else { proj(o.x, o.z, P2); const t = o.down ? (Math.cos(o.ang) >= 0 ? 1 : -1)*o.fallT*1.35 : 0; drawPinUp(o, P2.s, t); }
      }
    }
    function drawGuide(){
      if (phase === 'drag' && guide && guide.dy < -10){
        proj(ball.x, ball.z, P2); const y0 = P2.y - BR*P2.s;
        const len = Math.min(240, Math.hypot(guide.dx, guide.dy)*1.4), a = Math.atan2(guide.dy, guide.dx);
        cx.save(); cx.shadowColor = '#c4b5fd'; cx.shadowBlur = 10; cx.strokeStyle = 'rgba(255,255,255,.9)'; cx.setLineDash([10, 9]); cx.lineDashOffset = RM ? 0 : -T*40; cx.lineWidth = 5; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(P2.x, y0); cx.lineTo(P2.x + Math.cos(a)*len, y0 + Math.sin(a)*len); cx.stroke(); cx.setLineDash([]);
        const ex = P2.x + Math.cos(a)*len, ey = y0 + Math.sin(a)*len; cx.fillStyle = '#fff'; cx.beginPath(); cx.moveTo(ex + Math.cos(a)*12, ey + Math.sin(a)*12); cx.lineTo(ex + Math.cos(a + 2.5)*12, ey + Math.sin(a + 2.5)*12); cx.lineTo(ex + Math.cos(a - 2.5)*12, ey + Math.sin(a - 2.5)*12); cx.closePath(); cx.fill();
        cx.restore();
      }
      if ((phase === 'aim') && hintOn){
        proj(ball.x, ball.z, P2); const y0 = P2.y - BR*P2.s*2 - 34, t = T;
        cx.fillStyle = 'rgba(15,23,42,.6)'; K.rr(cx, P2.x - 140, y0 - 38, 280, 66, 33); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.15)'; cx.lineWidth = 1; cx.stroke();
        cx.fillStyle = '#fff'; cx.font = `800 ${Math.max(17, Math.min(24, W/34))}px ${HEAD_FONT}`; cx.textAlign = 'center'; cx.textBaseline = 'bottom';
        cx.fillText('👆 Swipe up to roll!', P2.x, y0 - 2 - (RM ? 0 : Math.abs(Math.sin(t*3))*3));
        cx.font = `500 ${Math.max(12, Math.min(15, W/54))}px ${TXT_FONT}`; cx.fillStyle = 'rgba(226,232,240,.85)';
        cx.fillText('Curve your swipe to spin', P2.x, y0 + 20);
      }
    }
    const rr = (x, y, w, h, r) => K.rr(cx, x, y, w, h, r);
    let cardGeo = {pad: 14, nameW: 100, totW: 60, cw: 40};
    function totCell(pi){ return [W - cardGeo.pad - cardGeo.totW/2, 18 + pi*34 + 15]; }
    function drawCard(){
      // overhead monitor: dark glass panel along the top
      cx.fillStyle = 'rgba(15,23,42,.82)'; rr(6, 4, W - 12, L.sbH - 6, 16); cx.fill();
      cx.strokeStyle = 'rgba(196,181,253,.35)'; cx.lineWidth = 1; cx.stroke();
      const pad = 14, nameW = Math.min(120, W*0.13), totW = Math.min(64, W*0.08), cw = (W - 2*pad - nameW - totW)/10.5;
      cardGeo = {pad, nameW, totW, cw};
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = 'rgba(203,213,225,.75)'; cx.font = `700 10.5px ${TXT_FONT}`;
      for (let f = 0; f < 10; f++) cx.fillText(String(f + 1), pad + nameW + f*cw + (f === 9 ? cw*0.75 : cw/2), 11);
      cx.fillText('TOTAL', W - pad - totW/2, 11);
      const show = players.length ? players : [newPlayer(api.name || 'You', api.avatar || '🙂')];
      show.forEach((pl, pi) => {
        const y = 18 + pi*34, h = 30, sc = scoreOf(pl), me = phase !== 'menu' && phase !== 'end' && pi === cur;
        cx.fillStyle = me ? 'rgba(167,139,250,.18)' : 'rgba(255,255,255,.05)'; rr(pad - 6, y, W - 2*pad + 12, h, 9); cx.fill();
        cx.fillStyle = '#fff'; cx.textAlign = 'left'; cx.font = `700 14px ${TXT_FONT}`;
        let nm = pl.av + ' ' + pl.name; while (nm.length > 3 && cx.measureText(nm).width > nameW - 8) nm = nm.slice(0, -2) + '…';
        cx.fillText(nm, pad + 2, y + h/2);
        for (let f = 0; f < 10; f++){
          const x = pad + nameW + f*cw, w = f === 9 ? cw*1.5 : cw;
          const active = me && f === frame;
          if (active){ cx.save(); cx.shadowColor = '#facc15'; cx.shadowBlur = 10; cx.fillStyle = '#facc15'; rr(x + 1, y + 1, w - 2, h - 2, 6); cx.fill(); cx.restore(); }
          else { cx.fillStyle = 'rgba(255,255,255,.07)'; rr(x + 1, y + 1, w - 2, h - 2, 6); cx.fill(); }
          const m = marks(pl.frames[f], f === 9), bw = Math.min(16, w/(m.length + 0.5));
          cx.font = `800 11px ${TXT_FONT}`; cx.textAlign = 'center';
          m.forEach((t, k) => { const bx = x + w - (m.length - k)*bw - 2;
            cx.strokeStyle = active ? 'rgba(59,35,0,.35)' : 'rgba(255,255,255,.18)'; cx.lineWidth = 1; cx.strokeRect(bx, y + 2, bw, 12);
            cx.fillStyle = t === 'X' ? (active ? '#9a3412' : '#fb923c') : t === '/' ? (active ? '#166534' : '#4ade80') : (active ? '#3b2300' : '#f1f5f9'); cx.fillText(t, bx + bw/2, y + 8.5); });
          if (sc[f] != null){ cx.fillStyle = active ? '#3b2300' : '#fff'; cx.font = `800 12px ${TXT_FONT}`; cx.fillText(String(sc[f]), x + w/2, y + 22); }
        }
        const tb = pi === cur ? 1 + totBump*0.3 : 1;
        cx.save(); cx.translate(W - pad - totW/2, y + h/2 + 1); cx.scale(tb, tb);
        cx.fillStyle = pi === cur && totBump > 0 ? '#fde047' : '#fff'; cx.font = `800 18px ${HEAD_FONT}`; cx.textAlign = 'center';
        cx.fillText(String(total(pl)), 0, 0); cx.restore();
      });
    }
    K.onLand = () => { totBump = 1; };
    const popY = small => L.vt + (L.vb - L.vt)*(small ? 0.55 : 0.36);
    function drawPopup(dt){
      if (!popup) return; popup.t += dt; if (popup.t > popup.dur){ popup = null; return; }
      const k = popup.t/popup.dur, sc = RM ? 1 : Math.min(1, popup.t*6)*(1 + 0.08*Math.sin(Math.min(1, popup.t*6)*Math.PI));
      const alpha = k > 0.8 ? (1 - k)/0.2 : 1, fs = popup.small ? Math.max(24, Math.min(40, W/22)) : Math.max(40, Math.min(84, W/10));
      const y = popY(popup.low);
      const col = popup.col === C.ink || popup.col === C.mut ? '#ffffff' : popup.col === C.accent ? '#ffd65a' : popup.col;
      cx.save(); cx.globalAlpha = alpha; cx.translate(W/2, y); cx.scale(sc, sc);
      if (popup.big && !RM) K.rays(cx, 0, 0, fs*3.4, col, 0.22*alpha, T*0.9);
      if (popup.small){ cx.font = `800 ${fs}px ${HEAD_FONT}`; const tw = cx.measureText(popup.txt).width + fs*1.2;
        cx.fillStyle = 'rgba(15,23,42,.6)'; rr(-tw/2, -fs*0.75, tw, fs*1.5, fs*0.75); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.15)'; cx.lineWidth = 1; cx.stroke(); }
      K.big(cx, popup.txt, 0, 0, fs, col, {glow: popup.big ? col : null, stroke: 'rgba(15,10,35,.88)'});
      cx.restore();
    }
    function drawTurn(){
      if (phase === 'menu' || phase === 'end' || !players.length) return;
      const pl = players[cur], fr = pl.frames[frame];
      K.pill(cx, 12, L.vt + 8, (nP === 2 ? pl.name.toUpperCase() + ' · ' : '') + 'FRAME ' + (frame + 1), 'Ball ' + (fr.length + (phase === 'result' ? 0 : 1)), {icon: nP === 2 ? pl.av : '🎳', h: 46, fs: 21});
      if (pl.run >= 2 && phase !== 'result') K.pill(cx, 12, L.vt + 60, 'STREAK', '🔥 ' + pl.run + ' strikes', {h: 40, fs: 17, col: '#fdba74', glow: 'rgba(251,146,60,.5)'});
    }
    function drawPins(){ // little pin map, like the display above a real lane
      if (phase === 'menu' || phase === 'end') return;
      const sz = Math.max(13, Math.min(18, W/60)), w = sz*4.6, h = sz*4.2, x0 = W - w - 12, y0 = L.vt + 8;
      cx.fillStyle = 'rgba(15,23,42,.55)'; rr(x0, y0, w, h, 14); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.15)'; cx.lineWidth = 1; cx.stroke();
      pins.forEach(p => { const r = Math.round((p.hz - HEADZ)/ROWD), px = x0 + w/2 + (p.hx/SP)*sz, py = y0 + h - sz*0.8 - r*sz*0.86;
        const up = !p.down && !p.gone; cx.beginPath(); cx.arc(px, py, sz*0.34, 0, 6.283);
        if (up){ cx.save(); cx.shadowColor = '#fff'; cx.shadowBlur = 6; cx.fillStyle = '#ffffff'; cx.fill(); cx.restore(); } else { cx.strokeStyle = 'rgba(255,255,255,.3)'; cx.lineWidth = 1.5; cx.stroke(); } });
    }
    // ---- main loop ----
    function frameLoop(now){
      raf = requestAnimationFrame(frameLoop);
      const rdt = Math.min(0.05, last ? (now - last)/1000 : 0.016); last = now; T += rdt;
      const dt = K.tick(rdt);
      impCd = Math.max(0, impCd - rdt); totBump = Math.max(0, totBump - rdt*4);
      layout();
      if (phase === 'roll'){
        rollT += dt;
        const n = Math.min(12, Math.ceil(dt/(1/240)));
        if (dt > 0) for (let i = 0; i < n; i++) step(dt/n);
        if (passT < 0 && (ball.z > DECKEND || !ball.active)) passT = rollT;
        const settled = passT >= 0 && rollT - passT > 0.7 && !pinsMoving();
        if (settled || rollT > 9) finishRoll();
        if (ball.active && dt > 0){ btrail.push(ball.x, ball.z); if (btrail.length > 24) btrail.splice(0, 2); }
      } else if (phase === 'result'){
        resT += dt; const n = Math.min(12, Math.ceil(dt/(1/240))); if (dt > 0) for (let i = 0; i < n; i++) step(dt/n);
        if (resT > 1.35) nextTurn();
      }
      // camera follows the ball down the lane, then comes back
      const target = (phase === 'roll' || phase === 'result') ? Math.max(0, Math.min(1150, (ball.active ? ball.z : DECKEND) - 520)) : 0;
      camZ += (target - camZ)*Math.min(1, rdt*(phase === 'aim' ? 4 : 2.6));
      layout();
      const [shx, shy] = K.shakeXY();
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.save(); cx.translate(shx, shy);
      drawLane(); drawObjects();
      cx.fillStyle = G.vig; cx.fillRect(0, 0, W, H);
      cx.restore();
      K.drawParts(cx);
      drawGuide(); drawTurn(); drawPins(); drawCard(); drawPopup(rdt);
      K.drawFlies(cx); K.drawFlash(cx, W, H);
    }
    setPhase('menu'); menu();
    raf = requestAnimationFrame(frameLoop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
      K.destroy();
      el.innerHTML = '';
    };
  }};
})();
