// Brain Break: Penalty kicks. Swipe from the ball toward the goal. Direction picks the spot, speed sets the
// height (too hard flies over the bar), a curved swipe bends the ball. 10 shots; the keeper improves.
// Drawn as a floodlit night stadium: cached stands + pitch layer, a shaded keeper, juice on every goal.
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
  window.BreakGames.penalty = {
    start(el, api){
      const RM = !!api.reducedMotion;
      const LW = 1000, LH = 700;
      // camera: world X (m, across), h (m, up), d (m, from camera)
      const F = 1065, HC = 1.0, HOR = 260, MIDX = 500;
      const D0 = 3, D1 = 13, GW = 3.66, GH = 2.44, BRM = 0.11, NET_D = 1.4;
      const SHOTS = 10;
      const P = (X, h, d) => ({x: MIDX + F*X/d, y: HOR + F*(HC - h)/d, s: F/d});

      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.appendChild(cv);
      const cx = cv.getContext('2d');
      const K = bbKit(el, api, {id:'penalty', icon:'⚽', title:'Penalty Kicks', c1:'#4ade80', c2:'#15803d', onAct: () => begin()});

      let W = 0, H = 0, dpr = 1, sc = 1, ox = 0, oy = 0, raf = 0, last = 0, alive = true, T = 0;
      const timers = new Set();
      const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms); timers.add(t); };
      const bg = document.createElement('canvas'), bx = bg.getContext('2d');
      const size = () => {
        const r = el.getBoundingClientRect(); dpr = window.devicePixelRatio || 1;
        W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
        sc = Math.min(W/LW, H/LH); ox = (W - LW*sc)/2; oy = (H - LH*sc)/2;
        cx.setTransform(dpr,0,0,dpr,0,0);
        paintStadium();
      };

      // ---- the stadium, painted once per size into an offscreen layer ----
      const rnd = (() => { let s = 11; return () => (s = (s*16807) % 2147483647)/2147483647; })();
      const fans = []; for (let i = 0; i < 400; i++) fans.push({u: rnd(), c: rnd(), s: rnd()});
      const stars = []; for (let i = 0; i < 70; i++) stars.push({u: rnd(), v: rnd(), r: rnd()});
      const FAN_C = ['#ef4444', '#f8fafc', '#facc15', '#3b82f6', '#22c55e', '#f97316', '#e11d48', '#a3e635'];
      const line3 = (g, a, b) => { const p = P(a[0], a[1], a[2]), q = P(b[0], b[1], b[2]); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); };
      function paintStadium(){
        bg.width = cv.width; bg.height = cv.height; const g = bx;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.fillStyle = '#04081a'; g.fillRect(0, 0, W, H);
        g.save(); g.translate(ox, oy); g.scale(sc, sc);
        const L0 = -ox/sc, R0 = (W - ox)/sc, T0 = -oy/sc, B0 = (H - oy)/sc, WW = R0 - L0;
        // night sky with stars
        let gr = g.createLinearGradient(0, T0, 0, 150); gr.addColorStop(0, '#020617'); gr.addColorStop(1, '#1e1b4b');
        g.fillStyle = gr; g.fillRect(L0, T0, WW, 150 - T0);
        for (const s of stars){ g.globalAlpha = 0.3 + s.r*0.7; g.fillStyle = '#fff'; g.beginPath(); g.arc(L0 + s.u*WW, T0 + s.v*(150 - T0)*0.9, 0.6 + s.r*1.3, 0, 6.283); g.fill(); }
        g.globalAlpha = 1;
        // upper and lower stands
        const tiers = [[70, 150, 0.55, '#1e293b', '#0f172a'], [150, 236, 0.9, '#1e2a4a', '#111a33']];
        tiers.forEach(([y0, y1, k, ca, cb], ti) => {
          gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, ca); gr.addColorStop(1, cb); g.fillStyle = gr; g.fillRect(L0, y0, WW, y1 - y0);
          const rows = Math.floor((y1 - y0 - 8)/14), per = Math.round(WW/(9 + ti*2));
          for (let r = 0; r < rows; r++) for (let i = 0; i < per; i++){
            const q = fans[(i*5 + r*17 + ti*7) % fans.length], x = L0 + (i + 0.5 + (r % 2)*0.5)*WW/per, y = y0 + 10 + r*14, rr = (3 + ti*1.4)*(0.85 + q.s*0.3);
            g.globalAlpha = (0.35 + k*0.5)*(0.7 + r/rows*0.3);
            g.fillStyle = FAN_C[(q.c*FAN_C.length) | 0]; g.beginPath(); g.ellipse(x, y + rr*1.4, rr*1.25, rr, 0, Math.PI, 0); g.fill();
            g.fillStyle = q.s > 0.45 ? '#f1c27d' : '#8d5524'; g.beginPath(); g.arc(x, y, rr*0.75, 0, 6.283); g.fill();
          }
          g.globalAlpha = 1;
          g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(L0, y1 - 3, WW, 4);
        });
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(L0, 148, WW, 3);
        // floodlight towers in the corners (glow is the light falling on the pitch)
        for (const fx of [L0 + WW*0.06, R0 - WW*0.06]){
          g.fillStyle = '#334155'; g.fillRect(fx - 3, 20, 6, 60);
          gr = g.createRadialGradient(fx, 14, 0, fx, 14, 200); gr.addColorStop(0, 'rgba(255,255,240,.9)'); gr.addColorStop(0.08, 'rgba(255,255,230,.55)'); gr.addColorStop(1, 'rgba(255,255,220,0)');
          g.fillStyle = gr; g.fillRect(fx - 200, -186, 400, 400);
          g.fillStyle = '#e2e8f0'; g.fillRect(fx - 28, 2, 56, 22);
          g.fillStyle = '#fffef0'; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++){ g.beginPath(); g.arc(fx - 21 + i*14, 8 + j*10, 4, 0, 6.283); g.fill(); }
        }
        // LED advertising boards
        gr = g.createLinearGradient(0, 236, 0, HOR); gr.addColorStop(0, '#0b1020'); gr.addColorStop(1, '#020617'); g.fillStyle = gr; g.fillRect(L0, 236, WW, HOR - 236);
        g.fillStyle = 'rgba(74,222,128,.13)'; for (let x = L0; x < R0; x += 5) g.fillRect(x, 238, 2.5, HOR - 240);
        g.font = '800 17px "Baloo 2", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.save(); g.shadowColor = '#4ade80'; g.shadowBlur = 10; g.fillStyle = '#d9f99d';
        const lbl = '⚽ PAGE QUEST CUP   ★ BRAIN BREAK   ', lw = g.measureText(lbl).width;
        for (let x = L0 + lw/2; x < R0 + lw; x += lw) g.fillText(lbl, x, 249);
        g.restore();
        // pitch: mowing stripes in perspective, lit from the towers
        gr = g.createLinearGradient(0, HOR, 0, B0); gr.addColorStop(0, '#1f7a34'); gr.addColorStop(0.5, '#2f9d46'); gr.addColorStop(1, '#23803a');
        g.fillStyle = gr; g.fillRect(L0, HOR, WW, B0 - HOR);
        for (let d = 2; d < 40; d += 2) { const a = P(0, 0, d + 1).y, b = P(0, 0, d).y; g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(L0, a, WW, b - a); }
        // grass blades texture near the camera
        for (let i = 0; i < 500; i++){ const x = L0 + rnd()*WW, y = HOR + 40 + Math.pow(rnd(), 0.7)*(B0 - HOR - 40), l = 2 + (y - HOR)/60;
          g.strokeStyle = rnd() < 0.5 ? 'rgba(134,239,172,.12)' : 'rgba(5,46,22,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5)*2, y - l); g.stroke(); }
        // light pools under the floodlights
        for (const fx of [0.25, 0.75]){ gr = g.createRadialGradient(L0 + WW*fx, HOR + 160, 0, L0 + WW*fx, HOR + 160, 420); gr.addColorStop(0, 'rgba(255,255,220,.1)'); gr.addColorStop(1, 'rgba(255,255,220,0)'); g.fillStyle = gr; g.fillRect(L0, HOR, WW, B0 - HOR); }
        g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath();
        line3(g, [-30, 0, D1], [30, 0, D1]);
        line3(g, [-9.2, 0, D1], [-9.2, 0, D1 - 5.5]); line3(g, [9.2, 0, D1], [9.2, 0, D1 - 5.5]); line3(g, [-9.2, 0, D1 - 5.5], [9.2, 0, D1 - 5.5]);
        line3(g, [-20, 0, D1], [-20, 0, 2.2]); line3(g, [20, 0, D1], [20, 0, 2.2]);
        g.stroke();
        const spot = P(0, 0, D0); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(spot.x, spot.y, 16, 5, 0, 0, 7); g.fill();
        // goal's shadow on the grass
        g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); const s1 = P(-GW, 0, D1), s2 = P(GW, 0, D1), s3 = P(GW + 0.6, 0, D1 + NET_D), s4 = P(-GW + 0.6, 0, D1 + NET_D);
        g.moveTo(s1.x, s1.y); g.lineTo(s2.x, s2.y); g.lineTo(s3.x, s3.y); g.lineTo(s4.x, s4.y); g.closePath(); g.fill();
        g.restore();
        gr = g.createRadialGradient(W/2, H*0.5, Math.min(W, H)*0.35, W/2, H*0.5, Math.max(W, H)*0.8);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      }
      size(); window.addEventListener('resize', size);

      // gradients made once (world or local coordinates)
      const pa = P(-GW, 0, D1), pb = P(GW, 0, D1), pt = P(0, GH, D1);
      const gPostL = cx.createLinearGradient(pa.x - 5, 0, pa.x + 5, 0), gPostR = cx.createLinearGradient(pb.x - 5, 0, pb.x + 5, 0), gBar = cx.createLinearGradient(0, pt.y - 5, 0, pt.y + 5);
      for (const gg of [gPostL, gPostR, gBar]){ gg.addColorStop(0, '#cbd5e1'); gg.addColorStop(0.35, '#ffffff'); gg.addColorStop(1, '#94a3b8'); }
      const gNet = cx.createLinearGradient(0, pt.y, 0, pa.y); gNet.addColorStop(0, 'rgba(15,23,42,.35)'); gNet.addColorStop(1, 'rgba(15,23,42,.12)');
      const gBallSh = cx.createRadialGradient(-0.35, -0.4, 0.05, 0, 0, 1); gBallSh.addColorStop(0, 'rgba(255,255,255,0)'); gBallSh.addColorStop(0.6, 'rgba(0,0,0,.05)'); gBallSh.addColorStop(1, 'rgba(0,0,0,.45)');
      const gBallHi = cx.createRadialGradient(-0.35, -0.4, 0, -0.35, -0.4, 0.55); gBallHi.addColorStop(0, 'rgba(255,255,255,.9)'); gBallHi.addColorStop(1, 'rgba(255,255,255,0)');
      const KU = F/D1;  // keeper is always on the goal line, so 1 m is a fixed number of px
      const gShirt = cx.createLinearGradient(-0.3*KU, 0, 0.3*KU, 0); gShirt.addColorStop(0, '#c2410c'); gShirt.addColorStop(0.45, '#fb923c'); gShirt.addColorStop(1, '#9a3412');

      // ---- state ----
      let mode = 'menu', shot = 0, goals = 0, results = [], phase = 'aim', label = null, run = 0, kickT = 0, goalBump = 0;
      const ball = {X: 0, h: BRM, d: D0, spin: 0, vis: 1};
      let flight = null;                       // {Xa, ha, T, t, bow, outcome, after}
      const keeper = {X: 0, h: 0.95, ang: 0, tx: 0, th: 0.95, speed: 4, delay: 0, active: false, happy: 0};
      let swipe = null, trail = [], netPush = 0, netX = 0, netH = 1;
      const btrail = [];
      let hudGoals = {cx: 80, cy: 34};
      const W2S = (x, y) => [ox + x*sc, oy + y*sc];

      const menu = () => { mode = 'menu'; K.start({how: 'Swipe from the ball toward the goal. 10 shots!', howIcon: '👆'}); };
      const begin = () => { K.hide(); K.clearFx(); mode = 'play'; shot = 0; goals = 0; results = []; run = 0; el.dataset.goals = 0; resetShot(); };
      const finish = () => {
        mode = 'over';
        const r = api.saveScore(goals) || {};
        const praise = goals >= 8 ? 'Superstar!' : goals >= 5 ? 'Great shooting!' : 'Nice try!';
        const stars = goals >= 8 ? 3 : goals >= 5 ? 2 : 1;
        K.end({head: praise, score: goals, unit: `goal${goals === 1 ? '' : 's'} out of ${SHOTS}`, stars, best: r.best != null ? r.best : goals, isBest: !!r.isBest,
          extra: `<span style="letter-spacing:2px;font-size:20px">${results.map(g => g ? '⚽' : '✖️').join('')}</span>`});
      };
      const resetShot = () => {
        Object.assign(ball, {X: 0, h: BRM, d: D0, spin: 0, vis: 1});
        Object.assign(keeper, {X: 0, h: 0.95, ang: 0, tx: 0, th: 0.95, active: false, happy: 0});
        flight = null; phase = 'aim'; label = null; trail = []; swipe = null; netPush = 0; btrail.length = 0;
      };
      K.onLand = () => { goalBump = 1; };

      // ---- input: swipe ----
      const toW = e => { const r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left - ox)/sc, y: (e.clientY - r.top - oy)/sc, t: performance.now()}; };
      const BS = P(0, BRM, D0);
      const down = e => {
        if (mode !== 'play' || phase !== 'aim' || swipe) return;
        const p = toW(e);
        if (p.y < 400 && Math.hypot(p.x - BS.x, p.y - BS.y) > 160) return;
        swipe = {id: e.pointerId, pts: [p]}; trail = [p];
        try { cv.setPointerCapture(e.pointerId); } catch(_){}
        e.preventDefault();
      };
      const move = e => {
        if (!swipe || e.pointerId !== swipe.id) return;
        const p = toW(e); swipe.pts.push(p); trail.push(p); if (trail.length > 40) trail.shift();
      };
      const up = e => {
        if (!swipe || e.pointerId !== swipe.id) return;
        const end = toW(e); swipe.pts.push(end);
        const pts = swipe.pts; swipe = null;
        const a = pts[0], dx = end.x - a.x, dy = end.y - a.y, len = Math.hypot(dx, dy);
        if (len < 40 || dy > -25) { label = {text: 'Swipe up to shoot!', color: '#ffffff', t: 0, life: 1.2, small: true}; trail = []; return; }
        // speed over the swipe (whole swipe, so slow-then-fast still counts)
        const dur = Math.max(0.06, (end.t - a.t)/1000), speed = len/dur;
        const p = Math.max(0, Math.min(1.4, (speed - 400)/2800));
        // direction: a ray from the ball along the swipe, read where it crosses the goal's middle
        const aimY = (P(0, GH, D1).y + P(0, 0, D1).y)/2;
        const sx = BS.x + dx*(aimY - BS.y)/dy;
        const Xa = Math.max(-6, Math.min(6, (sx - MIDX)*D1/F));
        // bend: how far the swipe bows away from its straight line (signed, as a share of its length)
        let bow = 0;
        for (const q of pts) { const c = ((q.x - a.x)*dy - (q.y - a.y)*dx)/len; if (Math.abs(c) > Math.abs(bow)) bow = c; }
        bow = Math.abs(bow)/len > 0.06 ? Math.max(-0.45, Math.min(0.45, -bow/len)) : 0;
        shoot(Xa, 0.15 + p*2.2, p, bow);
      };
      cv.addEventListener('pointerdown', down);
      cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);

      const rnd2 = (a, b) => a + Math.random()*(b - a);
      const shoot = (Xa, ha, p, bow) => {
        const Tt = 0.95 - 0.45*Math.min(p, 1.2)/1.2;
        flight = {Xa, ha, T: Tt, t: 0, bow: bow*4.5, outcome: null, after: 0, vx: 0, vh: 0, vd: 0};
        phase = 'fly'; trail = []; kickT = 1;
        const [sx, sy] = W2S(BS.x, BS.y + 8);
        K.burst(sx, sy, 12, {cols: ['rgba(187,247,208,.9)', 'rgba(255,255,255,.8)', '#4ade80'], speed: 180*Math.max(0.6, sc), ang: -Math.PI/2, spread: 2.4, grav: 500, size: 3.5*Math.max(0.6, sc), life: 0.5});
        K.kick(0.15 + p*0.15, 0, 0.03);
        // keeper guesses: gets a little better every shot; a bending ball is harder to read
        const skill = shot/(SHOTS - 1);
        const pRight = Math.max(0.12, 0.3 + 0.36*skill - (bow ? 0.15 : 0));
        keeper.speed = 3.8 + 2.4*skill; keeper.delay = 0.14 - 0.05*skill; keeper.active = true;
        const tgtX = Math.max(-3.3, Math.min(3.3, Xa)), tgtH = Math.max(0.35, Math.min(2.1, ha));
        if (Math.random() < pRight) { keeper.tx = tgtX + rnd2(-0.5, 0.5); keeper.th = tgtH + rnd2(-0.3, 0.3); }
        else if (Math.random() < 0.15) { keeper.tx = rnd2(-0.4, 0.4); keeper.th = rnd2(0.6, 1.4); }    // stays in the middle
        else { const side = Math.abs(tgtX) < 0.6 ? (Math.random() < 0.5 ? -1 : 1) : -Math.sign(tgtX); keeper.tx = side*rnd2(1.2, 3.0); keeper.th = rnd2(0.4, 1.8); }
      };
      // keeper body: a segment through its centre, tilted by its dive; radius ~0.36 m
      const keeperHit = (X, h) => {
        const sa = Math.sin(keeper.ang), ca = Math.cos(keeper.ang), half = 0.95;
        const ax = keeper.X - sa*half, ah = keeper.h - ca*half, bx2 = keeper.X + sa*(half + 0.1), bh = keeper.h + ca*(half + 0.1);
        const ex = bx2 - ax, eh = bh - ah, t = Math.max(0, Math.min(1, ((X - ax)*ex + (h - ah)*eh)/(ex*ex + eh*eh)));
        return Math.hypot(X - (ax + ex*t), h - (ah + eh*t)) < 0.36 + BRM;
      };
      const say = (text, color, big) => { label = {text, color, t: 0, life: 1.5, big: !!big}; };
      const resolve = () => {
        const X = ball.X, h = ball.h, f = flight;
        const ax = Math.abs(X);
        let o;
        if (h > GH + BRM) o = 'over';
        else if (ax > GW + BRM) o = 'wide';
        else if (ax > GW - BRM || h > GH - BRM) o = 'post';
        else if (keeperHit(X, h)) o = 'save';
        else o = 'goal';
        f.outcome = o;
        const dir = Math.sign(X || 1), bp = P(X, h, D1), [bsx, bsy] = W2S(bp.x, bp.y);
        if (o === 'goal') {
          goals++; run++; el.dataset.goals = goals; netPush = 1; netX = X; netH = h; f.vx = 0; f.vh = 0; f.vd = 7;
          say(run >= 3 ? 'HAT-TRICK!' : 'GOAL!', '#ffe14d', true); if (!RM) api.confetti(30);
          K.burst(bsx, bsy, 34, {cols: ['#fde047', '#fff', '#4ade80', '#60a5fa', '#f472b6'], shape: 'conf', speed: 420*Math.max(0.6, sc), grav: 380, size: 5*Math.max(0.7, sc), life: 1.1, drag: 1.2});
          K.burst(bsx, bsy, 2, {cols: ['rgba(255,255,255,.9)'], shape: 'ring', speed: 0, grav: 0, size: 14*sc, life: 0.5});
          K.fly('+1', bsx, bsy - 30*sc, hudGoals.cx, hudGoals.cy, '#fde047', 38);
          K.kick(0.7, 0.35, 0.12, '#fffbe6');
        }
        else if (o === 'save') { run = 0; f.vx = dir*rnd2(2, 5); f.vh = rnd2(2, 4); f.vd = -rnd2(6, 9); say('SAVED!', '#9fd0ff', true); keeper.happy = 1;
          K.burst(bsx, bsy, 16, {cols: ['#fef08a', '#fff', '#bae6fd'], shape: 'spark', speed: 300*Math.max(0.6, sc), grav: 400, size: 3, life: 0.4}); K.kick(0.35, 0.1, 0.07, '#dbeafe'); }
        else if (o === 'post') { run = 0; f.vx = -dir*rnd2(1, 3); f.vh = 2; f.vd = -8; say(h > GH - BRM ? 'Off the bar!' : 'Off the post!', '#ffffff');
          K.burst(bsx, bsy, 18, {cols: ['#fff', '#fde68a', '#e2e8f0'], shape: 'spark', speed: 360*Math.max(0.6, sc), grav: 500, size: 3, life: 0.4}); K.kick(1, 0.15, 0.08); }
        else if (o === 'over') { run = 0; f.vx = (X - 0)/f.T*0.2; f.vh = 4; f.vd = 18; say('Over the bar!', '#ffb0b0'); }
        else { run = 0; f.vx = dir*4; f.vh = 0.5; f.vd = 18; say('Wide!', '#ffb0b0'); }
        results.push(o === 'goal');
        phase = 'result';
        later(() => { shot++; if (shot >= SHOTS) { phase = 'done'; later(finish, 400); } else resetShot(); }, 1700);
      };

      const update = (dt, rdt) => {
        T += rdt; kickT = Math.max(0, kickT - rdt*3); goalBump = Math.max(0, goalBump - rdt*4);
        if (flight && phase === 'fly') {
          const f = flight; f.t += dt;
          const t = Math.min(1, f.t/f.T);
          ball.d = D0 + (D1 - D0)*t;
          ball.X = f.Xa*t + f.bow*Math.sin(Math.PI*t);
          ball.h = BRM + (f.ha - BRM)*t + 0.25*f.ha*t*(1 - t);
          ball.spin += dt*18;
          if (t >= 1) resolve();
        } else if (flight && phase === 'result') {
          const f = flight; f.after += dt;
          if (f.outcome === 'goal') {
            ball.d = Math.min(D1 + NET_D - 0.2, ball.d + f.vd*dt); f.vd *= 0.9;
            if (ball.d >= D1 + NET_D - 0.25) { ball.h = Math.max(BRM, ball.h - dt*3); }
          } else {
            f.vh -= 9.8*dt; ball.X += f.vx*dt; ball.d = Math.max(D0 - 1.2, ball.d + f.vd*dt); ball.h += f.vh*dt;
            if (ball.h < BRM) { ball.h = BRM; f.vh = -f.vh*0.5; }
            if (ball.d > D1 + 3) ball.vis = Math.max(0, ball.vis - dt*2);
          }
          ball.spin += dt*10;
        }
        if (dt > 0 && flight){ const p = P(ball.X, ball.h, ball.d); btrail.push(p.x, p.y, p.s); if (btrail.length > 30) btrail.splice(0, 3); }
        if (keeper.active) {
          if (keeper.delay > 0) keeper.delay -= dt;
          else {
            const dx = keeper.tx - keeper.X, dh = keeper.th - keeper.h, d = Math.hypot(dx, dh), stepL = keeper.speed*dt;
            if (d > 0.001) { const k = Math.min(1, stepL/d); keeper.X += dx*k; keeper.h += dh*k; }
            const lean = Math.max(-1.35, Math.min(1.35, (keeper.X)*0.75 + (keeper.tx - keeper.X)*0.2));
            keeper.ang += (lean - keeper.ang)*Math.min(1, dt*10);
          }
        }
        if (phase === 'result' && flight && flight.outcome !== 'save' && keeper.active) { // keeper falls to the grass
          keeper.h += (Math.max(0.35, Math.abs(keeper.ang) > 0.6 ? 0.35 : 0.95) - keeper.h)*Math.min(1, dt*4);
        }
        netPush = Math.max(0, netPush - dt*1.4);
        if (label) { label.t += rdt; if (label.t > label.life) label = null; }
      };

      // ---- drawing ----
      const line3c = (a, b) => line3(cx, a, b);
      const drawNet = () => {
        const push = netPush, nbx = netX, nbh = netH;
        const back = (X, h) => { const k = push*Math.max(0, 1 - Math.hypot(X - nbx, h - nbh)/1.6); return [X, h, D1 + NET_D + k*0.8]; };
        // dark netting panel so the white mesh reads
        const b1 = P(...back(-GW, 0)), b2 = P(...back(-GW, GH)), b3 = P(...back(GW, GH)), b4 = P(...back(GW, 0));
        cx.fillStyle = gNet; cx.beginPath(); cx.moveTo(b1.x, b1.y); cx.lineTo(b2.x, b2.y); cx.lineTo(b3.x, b3.y); cx.lineTo(b4.x, b4.y); cx.closePath(); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,.5)'; cx.lineWidth = 1.2; cx.beginPath();
        for (let X = -GW; X <= GW + 0.01; X += GW/10) { line3c(back(X, 0), back(X, GH)); line3c([X, GH, D1], back(X, GH)); }
        for (let h = 0; h <= GH + 0.01; h += GH/7) { line3c(back(-GW, h), back(GW, h)); line3c([-GW, h, D1], back(-GW, h)); line3c([GW, h, D1], back(GW, h)); }
        cx.stroke();
      };
      const drawPosts = () => {
        const a = P(-GW, 0, D1), b = P(-GW, GH, D1), c = P(GW, GH, D1), d = P(GW, 0, D1);
        cx.lineCap = 'round';
        cx.strokeStyle = 'rgba(0,0,0,.25)'; cx.lineWidth = 11; cx.beginPath(); cx.moveTo(a.x + 3, a.y); cx.lineTo(b.x + 3, b.y + 3); cx.lineTo(c.x + 3, c.y + 3); cx.lineTo(d.x + 3, d.y); cx.stroke();
        cx.lineWidth = 10;
        cx.strokeStyle = gPostL; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
        cx.strokeStyle = gPostR; cx.beginPath(); cx.moveTo(d.x, d.y); cx.lineTo(c.x, c.y); cx.stroke();
        cx.strokeStyle = gBar; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(c.x, c.y); cx.stroke();
        cx.lineCap = 'butt';
      };
      const drawKeeper = () => {
        const c = P(keeper.X, keeper.h, D1), u = KU;
        const sh = P(keeper.X, 0, D1);
        cx.fillStyle = 'rgba(0,0,0,.28)'; cx.beginPath(); cx.ellipse(sh.x, sh.y, (0.5 + (keeper.h - 0.95)*0.2)*u, 0.1*u, 0, 0, 7); cx.fill();
        cx.save(); cx.translate(c.x, c.y); cx.rotate(keeper.ang);
        const arms = keeper.active && keeper.delay <= 0 ? 1 : 0.35, bounce = !keeper.active && !RM ? Math.sin(T*6)*0.03*u : 0;
        cx.translate(0, bounce);
        // legs: shorts, socks, boots
        cx.fillStyle = '#1e293b'; cx.fillRect(-0.24*u, 0.05*u, 0.48*u, 0.3*u);
        cx.fillStyle = '#f97316'; cx.fillRect(-0.21*u, 0.33*u, 0.16*u, 0.5*u); cx.fillRect(0.05*u, 0.33*u, 0.16*u, 0.5*u);
        cx.fillStyle = 'rgba(0,0,0,.18)'; cx.fillRect(-0.21*u, 0.33*u, 0.05*u, 0.5*u); cx.fillRect(0.05*u, 0.33*u, 0.05*u, 0.5*u);
        cx.fillStyle = '#0f172a'; cx.fillRect(-0.25*u, 0.82*u, 0.22*u, 0.12*u); cx.fillRect(0.04*u, 0.82*u, 0.22*u, 0.12*u);
        // arms (raised when diving) with big gloves
        const ay = -0.55*u, reach = 0.55*u, hx = 0.22*u + reach*(1 - arms*0.6), hy = ay - reach*arms*1.1;
        cx.strokeStyle = '#ea580c'; cx.lineWidth = 0.14*u; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(-0.22*u, ay); cx.lineTo(-hx, hy); cx.moveTo(0.22*u, ay); cx.lineTo(hx, hy); cx.stroke();
        for (const sx of [-1, 1]){ cx.fillStyle = '#facc15'; cx.beginPath(); cx.arc(sx*hx, hy, 0.15*u, 0, 7); cx.fill();
          cx.fillStyle = 'rgba(255,255,255,.55)'; cx.beginPath(); cx.arc(sx*hx - 0.04*u, hy - 0.05*u, 0.05*u, 0, 7); cx.fill();
          cx.strokeStyle = '#a16207'; cx.lineWidth = 0.02*u; cx.beginPath(); cx.arc(sx*hx, hy, 0.15*u, 0, 7); cx.stroke(); }
        // shirt
        cx.fillStyle = gShirt; cx.beginPath(); cx.roundRect ? cx.roundRect(-0.3*u, -0.7*u, 0.6*u, 0.82*u, 0.13*u) : cx.rect(-0.3*u, -0.7*u, 0.6*u, 0.82*u); cx.fill();
        cx.fillStyle = 'rgba(255,255,255,.18)'; cx.fillRect(-0.3*u, -0.62*u, 0.6*u, 0.06*u);
        cx.fillStyle = '#1e293b'; cx.font = `800 ${0.36*u}px "Baloo 2", sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('1', 0, -0.28*u);
        // head
        cx.fillStyle = '#c98a5a'; cx.beginPath(); cx.arc(0, -0.86*u, 0.17*u, 0, 7); cx.fill();
        cx.fillStyle = '#3a2416'; cx.beginPath(); cx.arc(0, -0.92*u, 0.175*u, Math.PI, 0); cx.fill();
        cx.fillStyle = '#222'; cx.beginPath(); cx.arc(-0.06*u, -0.86*u, 0.025*u, 0, 7); cx.arc(0.06*u, -0.86*u, 0.025*u, 0, 7); cx.fill();
        if (keeper.happy) { cx.strokeStyle = '#222'; cx.lineWidth = 0.025*u; cx.beginPath(); cx.arc(0, -0.81*u, 0.06*u, 0.2, Math.PI - 0.2); cx.stroke(); }
        cx.restore();
      };
      const drawBall = () => {
        if (ball.vis <= 0) return;
        const p = P(ball.X, ball.h, ball.d), g = P(ball.X, 0, ball.d), r = BRM*p.s;
        cx.globalAlpha = ball.vis;
        // motion trail
        if (phase === 'fly' || (phase === 'result' && flight && flight.after < 0.3)){
          for (let i = 0; i < btrail.length - 3; i += 3){ const a = i/btrail.length; cx.globalAlpha = ball.vis*a*0.4; cx.fillStyle = '#e0f2fe';
            cx.beginPath(); cx.arc(btrail[i], btrail[i+1], BRM*btrail[i+2]*(0.4 + a*0.6), 0, 7); cx.fill(); }
          cx.globalAlpha = ball.vis;
        }
        const shk = Math.max(0.15, 1 - (ball.h - BRM)/2.5);
        cx.fillStyle = `rgba(0,0,0,${0.3*shk})`; cx.beginPath(); cx.ellipse(g.x, g.y, r*1.2, r*0.38, 0, 0, 7); cx.fill();
        cx.save(); cx.translate(p.x, p.y);
        cx.save(); cx.rotate(ball.spin);
        cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(0, 0, r, 0, 7); cx.fill();
        cx.fillStyle = '#1f2937';
        cx.beginPath(); for (let i = 0; i < 5; i++) { const a = i*1.2566 - 1.57; cx.lineTo(Math.cos(a)*r*0.35, Math.sin(a)*r*0.35); } cx.fill();
        for (let k = 0; k < 5; k++) { const a = k*1.2566 - 1.57 + 0.63; cx.beginPath(); cx.arc(Math.cos(a)*r*0.92, Math.sin(a)*r*0.92, r*0.24, 0, 7); cx.fill(); }
        cx.restore();
        cx.scale(r, r); cx.fillStyle = gBallSh; cx.beginPath(); cx.arc(0, 0, 1, 0, 7); cx.fill(); cx.fillStyle = gBallHi; cx.fill();
        cx.restore();
        cx.globalAlpha = 1;
      };
      const drawKicker = () => {
        const lean = kickT > 0 && !RM ? Math.sin(kickT*Math.PI)*0.25 : 0;
        cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(330, 650, 46, 10, 0, 0, 7); cx.fill();
        cx.save(); cx.translate(330, 645); cx.rotate(lean);
        cx.font = '76px system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic'; cx.fillStyle = '#000';
        cx.fillText(api.avatar || '🙂', 0, -4 - (mode === 'play' && phase === 'aim' && !RM ? Math.abs(Math.sin(T*2.5))*4 : 0)); cx.restore();
      };
      const draw = () => {
        const [shx, shy] = K.shakeXY();
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cx.drawImage(bg, 0, 0, W, H);
        cx.save(); cx.translate(ox + shx, oy + shy); cx.scale(sc, sc);
        // camera flashes in the stands (more after a goal)
        if (!RM){ const n = label && label.big && label.color === '#ffe14d' ? 14 : 4;
          for (let i = 0; i < n; i++){ const q = fans[(Math.floor(T*2.3)*29 + i*37) % fans.length], f = (T*2.3 + i*0.13) % 1;
            cx.globalAlpha = Math.max(0, 1 - f*3)*0.9; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(-ox/sc + q.u*W/sc, 80 + q.s*150, 2 + (1 - f)*3, 0, 6.283); cx.fill(); }
          cx.globalAlpha = 1; }
        drawNet();
        if (ball.d > D1) drawBall();
        drawKeeper();
        drawPosts();
        if (ball.d <= D1) drawBall();
        drawKicker();
        // aim ring around the ball before the shot
        if (mode === 'play' && phase === 'aim' && !swipe){ cx.strokeStyle = `rgba(253,224,71,${0.45 + Math.sin(T*5)*0.25})`; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(BS.x, BS.y + 8, 44 + (RM ? 0 : Math.sin(T*5)*4), 14, 0, 0, 7); cx.stroke(); }
        // swipe trail: a glowing ribbon that tapers off
        if (trail.length > 1) {
          cx.lineCap = 'round';
          for (let i = 1; i < trail.length; i++){ const k = i/trail.length; cx.strokeStyle = `rgba(255,255,255,${0.15 + k*0.7})`; cx.lineWidth = 3 + k*12;
            cx.beginPath(); cx.moveTo(trail[i-1].x, trail[i-1].y); cx.lineTo(trail[i].x, trail[i].y); cx.stroke(); }
          cx.lineCap = 'butt';
        }
        // hint
        if (mode === 'play' && phase === 'aim' && !swipe && shot === 0) {
          const t = (T/1.1) % 1; cx.globalAlpha = 1 - t;
          cx.font = '46px system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('👆', BS.x + 20, BS.y + 30 - t*170); cx.globalAlpha = 1;
          K.big(cx, 'Swipe toward the goal!', MIDX, 470, 34, '#ffffff');
        }
        if (label) {
          const k = label.t/label.life, s = RM ? 1 : 1 + Math.max(0, 0.3 - k)*1.2, a = Math.min(1, (1 - k)*3);
          cx.save(); cx.globalAlpha = a; cx.translate(MIDX, 380); cx.scale(s, s);
          if (label.big && !RM) K.rays(cx, 0, 0, 260, label.color, 0.2*a, T*0.7);
          K.big(cx, label.text, 0, 0, label.small ? 40 : label.big ? 86 : 60, label.color, {glow: label.big ? label.color : null});
          cx.restore();
        }
        cx.restore();
        K.drawParts(cx);
        // HUD: glass pills (goals, the ten shots, shot number)
        if (mode !== 'menu') {
          const z = Math.max(0.8, Math.min(1.15, W/900)), hh = 50*z, top = 12, gb = 1 + goalBump*0.25;
          cx.save(); cx.translate(16 + 55*z, top + hh/2); cx.scale(gb, gb); cx.translate(-(16 + 55*z), -(top + hh/2));
          const pg = K.pill(cx, 16, top, 'GOALS', String(goals), {icon: '⚽', h: hh, fs: 28*z, minW: 110*z, col: '#fde047'});
          cx.restore(); hudGoals = {cx: pg.cx, cy: pg.cy};
          K.pill(cx, W - 16, top, 'SHOT', `${Math.min(shot + 1, SHOTS)}/${SHOTS}`, {h: hh, fs: 26*z, minW: 100*z, align: 'right'});
          const dotR = 8*z, gap = 22*z, dw = SHOTS*gap + 20, dx0 = W/2 - dw/2, dy = top + (W < 620 ? hh + 8 : 0);
          cx.fillStyle = 'rgba(15,23,42,.55)'; K.rr(cx, dx0, dy, dw, hh, hh/2); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.15)'; cx.lineWidth = 1; cx.stroke();
          for (let i = 0; i < SHOTS; i++) {
            const x = dx0 + 10 + gap*(i + 0.5), y = dy + hh/2, cur = i === results.length && mode === 'play';
            cx.fillStyle = i < results.length ? (results[i] ? '#22c55e' : '#ef4444') : 'rgba(255,255,255,.18)';
            cx.beginPath(); cx.arc(x, y, dotR*(cur && !RM ? 1 + Math.sin(T*6)*0.12 : 1), 0, 7); cx.fill();
            if (i < results.length){ cx.fillStyle = 'rgba(255,255,255,.35)'; cx.beginPath(); cx.arc(x - dotR*0.3, y - dotR*0.3, dotR*0.35, 0, 7); cx.fill(); }
            if (cur){ cx.strokeStyle = '#fde047'; cx.lineWidth = 2; cx.beginPath(); cx.arc(x, y, dotR + 3, 0, 7); cx.stroke(); }
          }
        }
        K.drawFlies(cx);
        K.drawFlash(cx, W, H);
      };
      const frame = now => {
        raf = requestAnimationFrame(frame);
        const rdt = Math.min(0.033, (now - (last || now))/1000); last = now;
        const dt = K.tick(rdt);
        update(dt, rdt); draw();
      };
      menu();
      raf = requestAnimationFrame(frame);

      return () => {
        alive = false; cancelAnimationFrame(raf);
        timers.forEach(t => clearTimeout(t)); timers.clear();
        window.removeEventListener('resize', size);
        cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
        cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
        K.destroy();
        el.innerHTML = '';
      };
    }
  };
})();
