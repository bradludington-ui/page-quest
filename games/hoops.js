// Brain Break: Basketball shootout. Flick the ball up toward the hoop. 60-second round, 2 points a basket,
// "On fire!" after 3 in a row (+1 a basket), and from 10 points the hoop slides side to side.
// Drawn as a lit night arena: cached crowd + floor layer, glass backboard, juice on every basket.
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
  window.BreakGames.hoops = {
    start(el, api){
      const RM = !!api.reducedMotion;
      const LW = 1000, LH = 700;             // logical world; fitted into el
      const G = 1500, BR = 26;               // gravity, ball radius
      const FLOOR = 655, START = {x: 190, y: 560};
      const RIM_Y = 300, RIM_HALF = 56, RIM_R = 6, BASE_X = 720;
      const ROUND = 60;

      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.appendChild(cv);
      const cx = cv.getContext('2d');
      const K = bbKit(el, api, {id:'hoops', icon:'🏀', title:'Basketball', c1:'#fb923c', c2:'#dc2626', onAct: () => begin()});

      let W = 0, H = 0, dpr = 1, sc = 1, ox = 0, oy = 0, raf = 0, last = 0, alive = true;
      const timers = new Set();
      const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms); timers.add(t); };
      const bg = document.createElement('canvas'), bx = bg.getContext('2d');
      const size = () => {
        const r = el.getBoundingClientRect(); dpr = window.devicePixelRatio || 1;
        W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
        sc = Math.min(W/LW, H/LH); ox = (W - LW*sc)/2; oy = (H - LH*sc)/2;
        cx.setTransform(dpr,0,0,dpr,0,0);
        paintArena();
      };

      // ---- the arena, painted once per size into an offscreen layer ----
      const rnd = (() => { let s = 7; return () => (s = (s*16807) % 2147483647)/2147483647; })();
      const crowd = []; for (let i = 0; i < 260; i++) crowd.push({u: rnd(), v: rnd(), c: rnd(), s: rnd()});
      const CROWD_C = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#f8fafc', '#ec4899', '#14b8a6', '#facc15'];
      function paintArena(){
        bg.width = cv.width; bg.height = cv.height; const g = bx;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        // deep arena dark
        let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#050816'); gr.addColorStop(0.5, '#0d1636'); gr.addColorStop(1, '#141c3d');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.save(); g.translate(ox, oy); g.scale(sc, sc);
        const L0 = -ox/sc, R0 = (W - ox)/sc, T0 = -oy/sc, B0 = (H - oy)/sc, WW = R0 - L0;
        // roof truss + lamp row
        g.strokeStyle = 'rgba(148,163,184,.12)'; g.lineWidth = 3;
        for (let x = Math.floor(L0/80)*80; x < R0; x += 80){ g.beginPath(); g.moveTo(x, T0); g.lineTo(x + 40, 40); g.lineTo(x + 80, T0); g.stroke(); }
        g.fillStyle = 'rgba(148,163,184,.18)'; g.fillRect(L0, 36, WW, 6);
        for (let x = Math.floor(L0/140)*140 + 70; x < R0; x += 140){
          const lg = g.createRadialGradient(x, 52, 0, x, 52, 70); lg.addColorStop(0, 'rgba(255,248,220,.95)'); lg.addColorStop(0.12, 'rgba(255,240,200,.6)'); lg.addColorStop(1, 'rgba(255,230,180,0)');
          g.fillStyle = lg; g.fillRect(x - 70, -20, 140, 150);
          g.fillStyle = '#fffbea'; g.beginPath(); g.ellipse(x, 50, 14, 6, 0, 0, 6.283); g.fill();
        }
        // stands: three tiers of crowd
        const tiers = [[96, 205, 0.55], [215, 352, 0.75], [362, 520, 1]];
        tiers.forEach(([y0, y1, k], ti) => {
          gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(30,41,82,${0.5 + k*0.3})`); gr.addColorStop(1, `rgba(15,23,50,${0.7 + k*0.2})`);
          g.fillStyle = gr; g.fillRect(L0, y0, WW, y1 - y0);
          g.fillStyle = 'rgba(255,255,255,.05)'; for (let y = y0 + 24; y < y1; y += 26) g.fillRect(L0, y, WW, 2);
          const n = Math.round(WW/(16 - ti*2));
          for (let i = 0; i < n; i++){
            const q = crowd[(i*7 + ti*31) % crowd.length], x = L0 + (i + q.u*0.6)*WW/n, row = Math.floor(q.v*Math.max(1, (y1 - y0 - 18)/26)), y = y0 + 16 + row*26;
            const r = (5 + ti*1.6)*(0.85 + q.s*0.3), col = CROWD_C[(q.c*CROWD_C.length) | 0];
            g.globalAlpha = 0.28 + k*0.42;
            g.fillStyle = col; g.beginPath(); g.ellipse(x, y + r*1.7, r*1.2, r*1.1, 0, Math.PI, 0); g.fill();   // shoulders
            g.fillStyle = q.s > 0.5 ? '#f1c27d' : '#8d5524'; g.beginPath(); g.arc(x, y, r*0.8, 0, 6.283); g.fill();
            g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(x - r*0.25, y - r*0.3, r*0.28, 0, 6.283); g.fill();
          }
          g.globalAlpha = 1;
          const hz = g.createLinearGradient(0, y0, 0, y1); hz.addColorStop(0, 'rgba(8,12,32,.45)'); hz.addColorStop(1, 'rgba(8,12,32,0)');
          g.fillStyle = hz; g.fillRect(L0, y0, WW, y1 - y0);
          g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(L0, y1, WW, 8);
        });
        // LED ribbon board
        gr = g.createLinearGradient(0, 520, 0, 556); gr.addColorStop(0, '#111827'); gr.addColorStop(1, '#030712'); g.fillStyle = gr; g.fillRect(L0, 520, WW, 36);
        g.fillStyle = 'rgba(251,146,60,.16)'; for (let x = L0; x < R0; x += 6) g.fillRect(x, 522, 3, 32);
        g.font = '800 22px "Baloo 2", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.save(); g.shadowColor = '#fb923c'; g.shadowBlur = 12; g.fillStyle = '#fed7aa';
        const lbl = '★ PAGE QUEST ARENA   ★ BRAIN BREAK   ', lw = g.measureText(lbl).width;
        for (let x = L0 + lw/2; x < R0 + lw; x += lw) g.fillText(lbl, x, 539);
        g.restore();
        // padded court wall
        gr = g.createLinearGradient(0, 556, 0, FLOOR); gr.addColorStop(0, '#1e3a8a'); gr.addColorStop(1, '#172554'); g.fillStyle = gr; g.fillRect(L0, 556, WW, FLOOR - 556);
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(L0, 558, WW, 3);
        // hardwood floor with planks, sheen and reflections of the lamps
        gr = g.createLinearGradient(0, FLOOR, 0, B0); gr.addColorStop(0, '#b4743a'); gr.addColorStop(0.35, '#d69a57'); gr.addColorStop(1, '#8a5326');
        g.fillStyle = gr; g.fillRect(L0, FLOOR, WW, B0 - FLOOR);
        for (let y = FLOOR, i = 0; y < B0; y += 9 + i*1.5, i++){
          g.fillStyle = i % 2 ? 'rgba(90,45,10,.12)' : 'rgba(255,220,170,.06)'; g.fillRect(L0, y, WW, 9 + i*1.5);
          g.fillStyle = 'rgba(60,30,8,.25)'; for (let x = L0 + ((i*53) % 90); x < R0; x += 90 + (i % 3)*20) g.fillRect(x, y, 1.5, 9 + i*1.5);
        }
        for (let x = Math.floor(L0/140)*140 + 70; x < R0; x += 140){
          const rg = g.createLinearGradient(0, FLOOR, 0, FLOOR + 60); rg.addColorStop(0, 'rgba(255,245,220,.28)'); rg.addColorStop(1, 'rgba(255,245,220,0)');
          g.fillStyle = rg; g.fillRect(x - 8, FLOOR, 16, 60);
        }
        g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(L0, FLOOR, WW, 3);
        // court paint: the key under the hoop's home and the shooter's line
        g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 4;
        g.beginPath(); g.moveTo(L0, FLOOR + 14); g.lineTo(R0, FLOOR + 14); g.stroke();
        g.fillStyle = 'rgba(220,38,38,.13)'; g.fillRect(BASE_X - 130, FLOOR + 16, 260, Math.max(0, B0 - FLOOR - 16));
        g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3; g.strokeRect(BASE_X - 130, FLOOR + 16, 260, Math.max(0, B0 - FLOOR - 16) + 10);
        g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(START.x - 80, FLOOR + 26, 160, 5);
        g.restore();
        // vignette
        gr = g.createRadialGradient(W/2, H*0.45, Math.min(W, H)*0.3, W/2, H*0.45, Math.max(W, H)*0.8);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      }
      size(); window.addEventListener('resize', size);

      // gradients made once in local coordinates (moved into place with translate)
      const gBall = cx.createRadialGradient(-BR*0.35, -BR*0.4, BR*0.1, 0, 0, BR);
      gBall.addColorStop(0, '#ffb877'); gBall.addColorStop(0.55, '#f0731f'); gBall.addColorStop(1, '#9a3a0c');
      const gShine = cx.createRadialGradient(-BR*0.4, -BR*0.45, 0, -BR*0.4, -BR*0.45, BR*0.7);
      gShine.addColorStop(0, 'rgba(255,255,255,.65)'); gShine.addColorStop(1, 'rgba(255,255,255,0)');
      const gPole = cx.createLinearGradient(0, 0, 18, 0); gPole.addColorStop(0, '#475569'); gPole.addColorStop(0.4, '#cbd5e1'); gPole.addColorStop(1, '#334155');
      const gGlass = cx.createLinearGradient(0, -170, 30, 40); gGlass.addColorStop(0, 'rgba(220,240,255,.55)'); gGlass.addColorStop(0.5, 'rgba(180,215,255,.25)'); gGlass.addColorStop(1, 'rgba(200,230,255,.45)');
      const gSpot = cx.createRadialGradient(0, 0, 0, 0, 0, 1); gSpot.addColorStop(0, 'rgba(255,240,200,.35)'); gSpot.addColorStop(1, 'rgba(255,240,200,0)');
      const gBeam = cx.createLinearGradient(0, 0, 0, 640); gBeam.addColorStop(0, 'rgba(255,250,230,.16)'); gBeam.addColorStop(1, 'rgba(255,250,230,0)');

      // ---- state ----
      let mode = 'menu', score = 0, timeLeft = ROUND, streak = 0, made = 0, shots = 0, bestRun = 0;
      let hoopX = BASE_X, slidePhase = 0, netWiggle = 0, held = null, nextBallIn = 0, T = 0, scoreBump = 0, rimGlow = 0;
      const balls = [], pops = [];
      let hudScore = {cx: 80, cy: 34};
      const hoop = () => ({fx: hoopX - RIM_HALF, bx: hoopX + RIM_HALF, board: hoopX + RIM_HALF + 14});
      const newBall = () => ({x: START.x, y: START.y, vx: 0, vy: 0, rot: 0, live: false, t: 0, scored: false, touched: false, done: false, above: false, res: false, sq: 0, hitCd: 0, tr: []});
      let ready = newBall();
      const W2S = (x, y) => [ox + x*sc, oy + y*sc];

      const menu = () => {
        mode = 'menu';
        K.start({how: 'Flick the ball up into the hoop! 60 seconds.', howIcon: '👆'});
      };
      const begin = () => {
        K.hide(); K.clearFx(); mode = 'play'; score = 0; timeLeft = ROUND; streak = 0; made = 0; shots = 0; bestRun = 0;
        el.dataset.score = 0; hoopX = BASE_X; slidePhase = 0; balls.length = 0; pops.length = 0; ready = newBall(); held = null; nextBallIn = 0;
        pop('Go!', LW/2, 200, '#ffd84d', 1.2, 1.3);
      };
      const finish = () => {
        mode = 'over';
        const r = api.saveScore(score) || {};
        const stars = score >= 30 ? 3 : score >= 16 ? 2 : 1;
        K.end({head: 'Time!', score, unit: 'points', stars, best: r.best != null ? r.best : score, isBest: !!r.isBest,
          extra: `🏀 ${made} basket${made === 1 ? '' : 's'} · ${shots} shot${shots === 1 ? '' : 's'}${bestRun >= 3 ? ` · 🔥 ${bestRun} in a row` : ''}`});
      };
      const pop = (text, x, y, color, life, big) => { pops.push({text, x, y, color, t: 0, life: life || 1.1, big: big || 1}); };
      K.onLand = () => { scoreBump = 1; };

      // ---- input: flick ----
      const toW = e => { const r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left - ox)/sc, y: (e.clientY - r.top - oy)/sc}; };
      const down = e => {
        if (mode !== 'play' || held || !ready || nextBallIn > 0) return;
        const p = toW(e);
        if (Math.hypot(p.x - ready.x, p.y - ready.y) > 170 && p.y < 380) return; // start near the ball or low on screen
        held = {id: e.pointerId, pts: [{x: p.x, y: p.y, t: performance.now()}]};
        try { cv.setPointerCapture(e.pointerId); } catch(_){}
        e.preventDefault();
      };
      const move = e => {
        if (!held || e.pointerId !== held.id) return;
        const p = toW(e); held.pts.push({x: p.x, y: p.y, t: performance.now()});
        if (held.pts.length > 12) held.pts.shift();
      };
      const up = e => {
        if (!held || e.pointerId !== held.id) return;
        const p = toW(e), now = performance.now(); held.pts.push({x: p.x, y: p.y, t: now});
        const pts = held.pts; held = null;
        let a = pts[0]; for (const q of pts) if (now - q.t <= 110) { a = q; break; }
        const b = pts[pts.length - 1], dt = Math.max(0.03, (b.t - a.t)/1000);
        let vx = (b.x - a.x)/dt, vy = (b.y - a.y)/dt;
        if (vy > -250 || Math.hypot(b.x - pts[0].x, b.y - pts[0].y) < 25) { pop('Flick up!', START.x + 60, START.y - 90, '#ffffff', 0.9, 0.8); return; }
        // flick speed -> launch speed, softened so a normal flick reaches the hoop
        const sp = Math.hypot(vx, vy), want = Math.max(650, Math.min(2000, 480 + sp*0.4));
        vx = vx/sp*want; vy = vy/sp*want;
        Object.assign(ready, {vx, vy, live: true});
        balls.push(ready); shots++; ready = null; nextBallIn = 0.25;
        const [sx, sy] = W2S(START.x, START.y + 10);
        K.burst(sx, sy, 8, {cols: ['rgba(255,255,255,.8)', '#fde68a'], speed: 140, ang: -Math.PI/2, spread: 2.2, grav: 300, size: 3*Math.max(0.6, sc), life: 0.4});
      };
      cv.addEventListener('pointerdown', down);
      cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);

      // ---- physics (unchanged rules) ----
      const hitPoint = (b, px, py, e) => {
        const dx = b.x - px, dy = b.y - py, d = Math.hypot(dx, dy), m = BR + RIM_R;
        if (d >= m || d === 0) return false;
        const nx = dx/d, ny = dy/d; b.x = px + nx*m; b.y = py + ny*m;
        const vn = b.vx*nx + b.vy*ny;
        if (vn < 0) { b.vx -= (1+e)*vn*nx; b.vy -= (1+e)*vn*ny; b.vx *= 0.92; b.vy *= 0.92; clank(b, px, py, -vn); }
        return true;
      };
      const clank = (b, px, py, v) => {
        if (b.hitCd > 0 || v < 120) return; b.hitCd = 0.12; rimGlow = 1;
        const [sx, sy] = W2S(px, py);
        K.burst(sx, sy, 10, {cols: ['#fff7d6', '#fdba74', '#fb923c'], shape: 'spark', speed: 260*Math.max(0.6, sc), grav: 600, size: 3, life: 0.35});
        K.kick(0.25, 0, 0);
      };
      const stepBall = (b, dt) => {
        const h = hoop();
        const prevY = b.y;
        b.vy += G*dt; b.x += b.vx*dt; b.y += b.vy*dt; b.rot += b.vx*dt/BR; b.t += dt; if (b.hitCd > 0) b.hitCd -= dt;
        if (!b.scored) {
          if (hitPoint(b, h.fx, RIM_Y, 0.5)) b.touched = true;
          if (hitPoint(b, h.bx, RIM_Y, 0.5)) b.touched = true;
          // backboard: vertical face at h.board
          if (b.y > RIM_Y - 150 && b.y < RIM_Y + 30 && b.x + BR > h.board && b.x < h.board + 12 && b.vx > 0) {
            b.x = h.board - BR; b.vx = -b.vx*0.55; b.touched = true; b.sq = 0.6;
            const [sx, sy] = W2S(h.board, b.y); K.burst(sx, sy, 6, {cols: ['#e0f2fe', '#fff'], shape: 'spark', speed: 180*Math.max(0.6, sc), ang: Math.PI, spread: 2, grav: 200, size: 2.5, life: 0.3});
          }
          // score: centre passes down through the rim plane between the rim points
          if (prevY < RIM_Y && b.y >= RIM_Y && b.vy > 0 && b.x > h.fx + 4 && b.x < h.bx - 4) basket(b);
        } else {
          // ball drops through the net: keep it between the net sides
          if (b.y < RIM_Y + 90) { b.vx *= 0.9; b.x += (hoopX - b.x)*0.15; }
        }
        // a miss is known as soon as the ball drops back below the rim (or lands) without going in
        if (!b.res && !b.scored) {
          if (b.y < RIM_Y - BR) b.above = true;
          if ((b.above && b.y > RIM_Y + 40 && b.vy > 0) || b.y >= FLOOR - BR - 1) { b.res = true; settle(b); }
        }
        if (b.y > FLOOR - BR) {
          b.y = FLOOR - BR;
          if (b.vy > 0) { if (b.vy > 220){ b.sq = Math.min(1, b.vy/900); const [sx, sy] = W2S(b.x, FLOOR); K.burst(sx, sy, 5, {cols: ['rgba(255,236,200,.7)'], speed: 90, ang: -Math.PI/2, spread: 2.6, grav: 120, size: 4*Math.max(0.6, sc), life: 0.45}); } b.vy = -b.vy*0.55; }
          b.vx *= 0.85;
        }
        if (b.x < -80 || b.x > LW + 80 || b.t > 3.2) b.done = true;
      };
      const basket = b => {
        b.scored = true; b.res = true; made++; streak++; netWiggle = 1; bestRun = Math.max(bestRun, streak);
        const fire = streak > 3, pts = fire ? 3 : 2;
        score += pts; el.dataset.score = score;
        const sw = !b.touched;
        const [sx, sy] = W2S(hoopX, RIM_Y + 20);
        K.burst(sx, sy, sw ? 26 : 16, {cols: fire ? ['#fde047', '#fb923c', '#ef4444', '#fff'] : ['#fde047', '#fff', '#7dd3fc'], shape: 'star', speed: 320*Math.max(0.6, sc), grav: 500, size: 5*Math.max(0.7, sc), life: 0.8});
        if (sw) K.burst(sx, sy - 14*sc, 3, {cols: ['rgba(125,255,176,.9)'], shape: 'ring', speed: 0, grav: 0, size: 18*sc, life: 0.55});
        K.fly('+' + pts, sx, sy + 70*sc, hudScore.cx, hudScore.cy, fire ? '#fb923c' : '#fde047', 34);
        pop(sw ? 'SWISH!' : 'Nice!', hoopX, RIM_Y - 95, sw ? '#7dffb0' : '#ffffff', 1.0, sw ? 1.15 : 0.9);
        K.kick(sw ? 0.45 : 0.3, sw ? 0.18 : 0.08, sw ? 0.07 : 0.04, '#fff7d6');
        if (streak === 3) { pop('ON FIRE! 🔥', LW/2, 170, '#ff9b3d', 1.6, 1.4); if (!RM) api.confetti(25); K.kick(0.6, 0.2, 0.1, '#fdba74'); }
      };
      const settle = b => { if (!b.scored && mode === 'play') { if (streak >= 3) pop('Fire out', START.x + 40, START.y - 110, '#cfe3ff', 0.9, 0.8); streak = 0; } };

      const update = (dt, rdt) => {
        T += rdt;
        if (mode === 'play') {
          timeLeft -= rdt;
          if (nextBallIn > 0) { nextBallIn -= rdt; if (nextBallIn <= 0 && !ready) ready = newBall(); }
          if (score >= 10) { slidePhase += dt*(0.9 + Math.min(2.6, (score - 10)*0.05)); hoopX = BASE_X + Math.sin(slidePhase)*165; }
          if (timeLeft <= 0) { timeLeft = 0; mode = 'ending'; held = null; ready = null; pop('Time!', LW/2, 220, '#ffd84d', 1.6, 1.5); later(() => { balls.length = 0; finish(); }, 1600); }
        }
        for (let s = 0; s < 4; s++) for (const b of balls) if (!b.done) stepBall(b, dt/4);
        for (const b of balls){ b.sq = Math.max(0, b.sq - rdt*5); if (dt > 0){ b.tr.push(b.x, b.y); if (b.tr.length > 16) b.tr.splice(0, 2); }
          if (streak >= 3 && !b.scored && b.live && !RM && Math.random() < 0.7){ const [sx, sy] = W2S(b.x, b.y); K.burst(sx, sy, 1, {cols: ['#fde047', '#fb923c', '#ef4444'], speed: 40, grav: -260, size: 7*Math.max(0.6, sc), life: 0.45, jx: 14*sc, jy: 14*sc}); } }
        for (let i = balls.length - 1; i >= 0; i--) if (balls[i].done) { if (!balls[i].res) settle(balls[i]); balls.splice(i, 1); }
        netWiggle = Math.max(0, netWiggle - rdt*2.2); scoreBump = Math.max(0, scoreBump - rdt*4); rimGlow = Math.max(0, rimGlow - rdt*4);
        for (let i = pops.length - 1; i >= 0; i--) { pops[i].t += rdt; if (pops[i].t > pops[i].life) pops.splice(i, 1); }
      };

      // ---- drawing ----
      const drawBall = (b, x, y, rot) => {
        // shadow on the floor shrinks with height
        const hgt = Math.max(0, FLOOR - (y + BR)), k = Math.max(0.25, 1 - hgt/500);
        cx.fillStyle = `rgba(0,0,0,${0.35*k})`; cx.beginPath(); cx.ellipse(x, FLOOR + 6, BR*1.1*k, BR*0.28*k, 0, 0, 6.283); cx.fill();
        if (b && b.tr.length > 4 && b.live && !b.done){
          for (let i = 0; i < b.tr.length - 2; i += 2){ const a = (i/b.tr.length); cx.globalAlpha = a*0.35; cx.fillStyle = streak >= 3 ? '#fb923c' : '#fed7aa';
            cx.beginPath(); cx.arc(b.tr[i], b.tr[i+1], BR*(0.45 + a*0.5), 0, 6.283); cx.fill(); }
          cx.globalAlpha = 1;
        }
        const sq = b ? b.sq : 0;
        cx.save(); cx.translate(x, y);
        if (sq > 0) cx.scale(1 + sq*0.22, 1 - sq*0.2);
        cx.fillStyle = gBall; cx.beginPath(); cx.arc(0, 0, BR, 0, 6.283); cx.fill();
        cx.save(); cx.rotate(rot); cx.strokeStyle = 'rgba(60,20,4,.85)'; cx.lineWidth = 2.2;
        cx.beginPath(); cx.moveTo(-BR, 0); cx.lineTo(BR, 0); cx.moveTo(0, -BR); cx.lineTo(0, BR); cx.stroke();
        cx.beginPath(); cx.arc(-BR*1.25, 0, BR*0.85, -0.75, 0.75); cx.stroke();
        cx.beginPath(); cx.arc(BR*1.25, 0, BR*0.85, Math.PI - 0.75, Math.PI + 0.75); cx.stroke();
        cx.restore();
        cx.fillStyle = gShine; cx.beginPath(); cx.arc(0, 0, BR, 0, 6.283); cx.fill();
        cx.strokeStyle = 'rgba(60,20,4,.6)'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(0, 0, BR, 0, 6.283); cx.stroke();
        cx.restore();
      };
      const drawHoopBack = h => {
        // light beam onto the hoop
        cx.save(); cx.translate(hoopX - 40, 0); cx.fillStyle = gBeam; cx.beginPath(); cx.moveTo(10, 0); cx.lineTo(70, 0); cx.lineTo(170, 640); cx.lineTo(-90, 640); cx.closePath(); cx.fill(); cx.restore();
        // pole and arm
        cx.save(); cx.translate(h.board + 30, 0);
        cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(8, FLOOR + 6, 40, 8, 0, 0, 6.283); cx.fill();
        cx.fillStyle = gPole; cx.fillRect(0, RIM_Y - 120, 18, FLOOR - RIM_Y + 120);
        cx.fillStyle = '#1e3a8a'; cx.fillRect(-4, FLOOR - 120, 26, 120); cx.fillStyle = 'rgba(255,255,255,.18)'; cx.fillRect(0, FLOOR - 120, 5, 120);
        cx.restore();
        cx.fillStyle = '#64748b'; cx.fillRect(h.board + 6, RIM_Y - 44, 28, 10);
        // glass backboard with frame
        cx.save(); cx.translate(h.board, RIM_Y);
        cx.fillStyle = 'rgba(0,0,0,.25)'; cx.fillRect(4, -156, 16, 194);
        cx.fillStyle = gGlass; cx.fillRect(0, -160, 14, 190);
        cx.strokeStyle = '#e2e8f0'; cx.lineWidth = 3; cx.strokeRect(0, -160, 14, 190);
        cx.strokeStyle = '#ef4444'; cx.lineWidth = 3; cx.strokeRect(2, -70, 9, 64);
        cx.fillStyle = 'rgba(255,255,255,.55)'; cx.fillRect(2, -156, 3, 120);
        cx.restore();
        // back half of the rim
        cx.strokeStyle = '#9a3412'; cx.lineWidth = 5; cx.beginPath(); cx.ellipse(hoopX, RIM_Y, RIM_HALF, 9, 0, Math.PI, 0); cx.stroke();
      };
      const drawNet = h => {
        const wig = Math.sin(T*25)*netWiggle*6, top = RIM_Y + 4, bot = RIM_Y + 82 + netWiggle*14, nl = h.fx + 12 + wig, nr = h.bx - 12 + wig;
        cx.strokeStyle = 'rgba(255,255,255,.92)'; cx.lineWidth = 2.2; cx.lineCap = 'round';
        const N = 7, R = 5;
        for (let i = 0; i <= N; i++){
          cx.beginPath();
          for (let j = 0; j <= R; j++){
            const tj = j/R, xl = h.fx + (nl - h.fx)*tj, xr = h.bx + (nr - h.bx)*tj, y = top + (bot - top)*tj + Math.sin(T*18 + i)*netWiggle*3*tj;
            const ti = ((i + (j % 2)*0.5)/N), x = xl + (xr - xl)*Math.min(1, ti);
            if (j === 0) cx.moveTo(x, y); else cx.lineTo(x, y);
          }
          cx.stroke();
        }
        cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 1.6;
        for (let j = 1; j <= R; j++){ const tj = j/R, y = top + (bot - top)*tj; cx.beginPath(); cx.moveTo(h.fx + (nl - h.fx)*tj, y); cx.lineTo(h.bx + (nr - h.bx)*tj, y); cx.stroke(); }
      };
      const drawRimFront = h => {
        cx.save();
        if (rimGlow > 0 || streak >= 3){ cx.shadowColor = streak >= 3 ? '#fb923c' : '#fde68a'; cx.shadowBlur = 18*Math.max(rimGlow, streak >= 3 ? 0.8 + Math.sin(T*10)*0.2 : 0); }
        cx.strokeStyle = '#f97316'; cx.lineWidth = 7; cx.lineCap = 'round';
        cx.beginPath(); cx.ellipse(hoopX, RIM_Y, RIM_HALF, 9, 0, 0, Math.PI); cx.stroke();
        cx.beginPath(); cx.moveTo(h.bx, RIM_Y); cx.lineTo(h.board, RIM_Y); cx.stroke();
        cx.restore();
        cx.strokeStyle = 'rgba(255,237,213,.8)'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(hoopX, RIM_Y - 1.5, RIM_HALF - 2, 7.5, 0, 0.3, Math.PI - 0.3); cx.stroke();
      };
      const drawPops = () => {
        for (const p of pops) {
          const k = p.t/p.life, a = Math.max(0, 1 - k*k), s = RM ? 1 : (k < 0.15 ? 0.5 + k/0.15*0.7 : 1.2 - Math.min(0.2, (k - 0.15)*1.2));
          cx.save(); cx.globalAlpha = a; cx.translate(p.x, p.y - k*40); cx.scale(s*p.big, s*p.big);
          if (p.big > 1.2 && !RM) K.rays(cx, 0, 0, 160, p.color, 0.18*a, T*0.8);
          K.big(cx, p.text, 0, 0, 44, p.color); cx.restore();
        }
      };
      const draw = () => {
        const [shx, shy] = K.shakeXY();
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cx.drawImage(bg, 0, 0, W, H);
        cx.save(); cx.translate(shx, shy);
        // twinkling camera flashes in the stands
        if (!RM){ for (let i = 0; i < 5; i++){ const q = crowd[(Math.floor(T*1.7) * 13 + i*47) % crowd.length], f = (T*1.7) % 1;
          const fx2 = ox + (q.u*LW - 0)*sc, fy = oy + (110 + q.v*390)*sc; cx.globalAlpha = Math.max(0, 1 - f*3)*0.9; cx.fillStyle = '#fff';
          cx.beginPath(); cx.arc(fx2, fy, 3 + (1 - f)*3, 0, 6.283); cx.fill(); } cx.globalAlpha = 1; }
        cx.translate(ox, oy); cx.scale(sc, sc);
        const h = hoop();
        drawHoopBack(h);
        // shooter on a soft spotlight
        cx.save(); cx.translate(START.x - 40, FLOOR + 8); cx.scale(150, 30); cx.fillStyle = gSpot; cx.beginPath(); cx.arc(0, 0, 1, 0, 6.283); cx.fill(); cx.restore();
        cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(START.x - 95, FLOOR + 4, 40, 9, 0, 0, 6.283); cx.fill();
        const hop = mode === 'play' && !RM ? Math.abs(Math.sin(T*3))*4 : 0;
        cx.font = '72px system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic'; cx.fillStyle = '#000';
        cx.fillText(api.avatar || '🙂', START.x - 95, FLOOR - 4 - hop);
        // balls behind the front rim
        for (const b of balls) drawBall(b, b.x, b.y, b.rot);
        if (ready) {
          const bob = (mode === 'play' && !held && !RM) ? Math.sin(T*4)*4 : 0;
          if (mode === 'play' && !held){ cx.strokeStyle = `rgba(253,224,71,${0.35 + Math.sin(T*5)*0.2})`; cx.lineWidth = 3; cx.beginPath(); cx.arc(ready.x, ready.y + bob, BR + 10 + (RM ? 0 : Math.sin(T*5)*3), 0, 6.283); cx.stroke(); }
          drawBall(null, ready.x, ready.y + bob, 0);
          if (mode === 'play' && shots === 0 && !held) { // first-shot hint
            const t = (T/0.9) % 1;
            cx.globalAlpha = 1 - t; cx.font = '46px system-ui, sans-serif'; cx.textBaseline = 'middle'; cx.fillText('👆', ready.x + 40, ready.y + 40 - t*120); cx.globalAlpha = 1;
            K.big(cx, 'Flick up!', ready.x + 50, ready.y - 110, 32, '#ffffff');
          }
        }
        drawNet(h);
        drawRimFront(h);
        drawPops();
        cx.restore();
        K.drawParts(cx);
        // HUD: glass pills
        if (mode !== 'menu'){
          const sz = Math.max(0.8, Math.min(1.15, W/900)), hh = 50*sz, top = 12;
          const sb = 1 + scoreBump*0.25;
          cx.save(); cx.translate(16 + 60*sz, top + hh/2); cx.scale(sb, sb); cx.translate(-(16 + 60*sz), -(top + hh/2));
          const ps = K.pill(cx, 16, top, 'SCORE', String(score), {icon: '🏀', h: hh, fs: 28*sz, minW: 120*sz, col: '#fde047'});
          cx.restore(); hudScore = {cx: ps.cx, cy: ps.cy};
          const tl = Math.ceil(timeLeft), hot = tl <= 10 && mode === 'play';
          const pulse = hot && !RM ? 1 + Math.max(0, Math.sin(T*8))*0.08 : 1;
          cx.save(); cx.translate(W - 16 - 55*sz, top + hh/2); cx.scale(pulse, pulse); cx.translate(-(W - 16 - 55*sz), -(top + hh/2));
          K.pill(cx, W - 16, top, 'TIME', String(tl), {icon: '⏱', h: hh, fs: 28*sz, minW: 110*sz, align: 'right', col: hot ? '#fca5a5' : '#fff', ring: hot ? 'rgba(248,113,113,.7)' : null, glow: hot ? 'rgba(239,68,68,.6)' : null});
          cx.restore();
          if (streak >= 3) K.pill(cx, W/2, top, 'STREAK', `ON FIRE ×${streak}`, {icon: '🔥', h: hh, fs: 24*sz, align: 'center', col: '#fdba74', glow: 'rgba(251,146,60,.7)', ring: 'rgba(251,146,60,.6)'});
          else if (streak > 0) K.pill(cx, W/2, top, 'STREAK', `${streak} in a row`, {h: hh, fs: 22*sz, align: 'center', col: '#bae6fd'});
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
