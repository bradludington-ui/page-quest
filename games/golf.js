// Brain Break: Mini Golf. 1 or 2 players taking turns, 9 holes seen from above.
// Pull back from the ball and let go to putt. Lowest total strokes wins.
// Drawn as a sunny garden course: each hole is painted once (lawn, wooden rails, sand, ponds) into a cached
// layer; water shimmer, windmills, bumpers, the flag and the ball move on top, with juice on every hit.
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

  // Courses live in an 800 x 500 world. Walls are the outline polygon, solid blocks and banks.
  const HOLES = [
    {name:'Easy Start', par:2, tee:[150,250], cup:[650,250],
      poly:[[90,160],[710,160],[710,340],[90,340]]},
    {name:'The Bend', par:3, tee:[130,380], cup:[640,130],
      poly:[[70,320],[540,320],[540,60],[730,60],[730,450],[70,450]],
      segs:[[650,450,730,370]], bumpers:[{x:470,y:385,r:16}]},
    {name:'The Windmill', par:3, tee:[120,250], cup:[690,250],
      poly:[[60,120],[750,120],[750,380],[60,380]],
      blocks:[[370,120,430,195],[370,305,430,380]], mills:[{x:400,y:250,len:92,speed:1.6,n:4}]},
    {name:'Sandy Beach', par:3, tee:[110,250], cup:[690,250],
      poly:[[60,70],[750,70],[750,430],[60,430]],
      sand:[{x:300,y:150,w:230,h:200}], blocks:[[600,180,625,320]], bumpers:[{x:220,y:130,r:16},{x:220,y:370,r:16}]},
    {name:'Bumper Alley', par:3, tee:[110,250], cup:[700,250],
      poly:[[60,90],[750,90],[750,410],[60,410]],
      bumpers:[{x:260,y:180,r:20},{x:260,y:320,r:20},{x:380,y:250,r:22},{x:500,y:170,r:20},{x:500,y:330,r:20},{x:610,y:250,r:18}]},
    {name:'Lily Pond', par:3, tee:[110,350], cup:[690,150],
      poly:[[60,70],[750,70],[750,430],[60,430]],
      water:[{x:280,y:70,w:240,h:140},{x:280,y:290,w:240,h:140}], bumpers:[{x:620,y:330,r:16}]},
    {name:'Over the Hill', par:3, tee:[110,250], cup:[690,250],
      poly:[[60,110],[750,110],[750,390],[60,390]],
      hills:[{x:320,y:110,w:150,h:280,ax:-330,ay:0}], segs:[[640,190,640,215],[640,285,640,310]], sand:[{x:540,y:110,w:70,h:60},{x:540,y:330,w:70,h:60}]},
    {name:'The Tunnel', par:3, tee:[120,380], cup:[680,120],
      poly:[[60,60],[740,60],[740,440],[60,440]],
      blocks:[[385,60,415,440]], tunnels:[{ax:300,ay:130,bx:480,by:390,dx:1,dy:0}],
      water:[{x:60,y:60,w:110,h:90}], bumpers:[{x:600,y:250,r:18}]},
    {name:'Grand Finale', par:4, tee:[110,380], cup:[110,140],
      poly:[[40,40],[760,40],[760,460],[40,460]],
      blocks:[[40,236,560,264]], mills:[{x:660,y:250,len:88,speed:-1.4,n:3}],
      sand:[{x:300,y:300,w:120,h:160}], water:[{x:280,y:40,w:150,h:110}], bumpers:[{x:520,y:160,r:16},{x:220,y:200,r:14}]}
  ];
  const PAR = HOLES.reduce((a, h) => a + h.par, 0);

  window.BreakGames.golf = { start(el, api){
    const RM = !!api.reducedMotion;
    const HEAD_FONT = '"Baloo 2", system-ui, sans-serif', TXT_FONT = '"Lexend", system-ui, sans-serif';
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
    el.appendChild(cv);
    const cx = cv.getContext('2d');
    const K = bbKit(el, api, {id:'golf', icon:'⛳', title:'Mini Golf', c1:'#4ade80', c2:'#0f766e', onAct: a => {
      if (a === 'p1') startGame(1); else if (a === 'p2') startGame(2); else if (a === 'again') startGame(nP); else if (a === 'menu') menu(); }});
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, rect = null;
    const size = () => { rect = el.getBoundingClientRect(); dpr = window.devicePixelRatio || 1;
      W = Math.max(1, rect.width); H = Math.max(1, rect.height); cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); cx.setTransform(dpr,0,0,dpr,0,0); paintKey = ''; };
    let paintKey = '';
    size(); window.addEventListener('resize', size);

    const BR = 8, CUPR = 13, MAXS = 950, MAXSTROKES = 8;
    let phase = 'menu', nP = 1, players = [], cur = 0, hi = 0, hole = null, segs = [], t = 0;
    const ball = {x:0, y:0, vx:0, vy:0, moving:false, sink:0, lx:0, ly:0};
    let strokes = 0, drag = null, popup = null, banner = null, doneT = 0, flash = [], inSand = false, wallCd = 0, strokeBump = 0;
    const trail = [];
    const setPhase = p => { phase = p; el.dataset.phase = p; };
    el._golfDbg = () => ({phase, bx:ball.x, by:ball.y, cx:hole ? hole.cup[0] : 0, cy:hole ? hole.cup[1] : 0, hole:hi, cur, strokes, ...L});

    function loadHole(i){
      hi = i; hole = HOLES[i]; segs = [];
      const pg = hole.poly; for (let k = 0; k < pg.length; k++){ const a = pg[k], b = pg[(k + 1) % pg.length]; segs.push([a[0], a[1], b[0], b[1]]); }
      for (const b of hole.blocks || []){ const [x1, y1, x2, y2] = b; segs.push([x1,y1,x2,y1],[x2,y1,x2,y2],[x2,y2,x1,y2],[x1,y2,x1,y1]); }
      for (const s of hole.segs || []) segs.push(s);
      flash = (hole.bumpers || []).map(() => 0);
      paintKey = '';
    }
    function startTurn(){
      ball.x = ball.lx = hole.tee[0]; ball.y = ball.ly = hole.tee[1]; ball.vx = ball.vy = 0; ball.moving = false; ball.sink = 0; trail.length = 0;
      strokes = 0; setPhase('aim');
      const pl = players[cur];
      if (cur === 0) banner = {k:'Hole ' + (hi + 1) + ' of 9', a:hole.name, b:'Par ' + hole.par + (nP === 2 ? '  ·  ' + pl.av + ' ' + pl.name : ''), t:0};
      else banner = {k:'Hole ' + (hi + 1) + ' of 9', a:pl.av + ' ' + pl.name + "'s turn", b:'Par ' + hole.par, t:0};
    }
    function startGame(n){
      nP = n; players = [{name: api.name || 'You', av: api.avatar || '🙂', sc: []}];
      if (n === 2) players.push({name:'Player 2', av:'🐼', sc: []});
      cur = 0; loadHole(0); startTurn(); K.hide(); K.clearFx();
    }
    function showPop(txt, col, dur, big){ popup = {txt, col: col || '#fff', t:0, dur: dur || 1.5, big: !!big}; }
    function holeDone(sunk){
      const s = Math.min(strokes, MAXSTROKES); players[cur].sc[hi] = s;
      const [px, py] = [X(hole.cup[0]), Y(hole.cup[1])];
      if (sunk){ const d = s - hole.par;
        const txt = s === 1 ? 'Hole in one!' : d <= -2 ? 'Eagle!' : d === -1 ? 'Birdie!' : d === 0 ? 'Par' : d === 1 ? 'Bogey' : s + ' strokes';
        const great = s === 1 || d < 0;
        showPop(txt, great ? '#ffd65a' : '#ffffff', 1.7, great); if (!RM && great) api.confetti(s === 1 ? 50 : 20);
        K.burst(px, py, 2, {cols: ['rgba(255,255,255,.9)'], shape: 'ring', speed: 0, grav: 0, size: 10*L.sc, life: 0.6});
        K.burst(px, py, great ? 30 : 14, {cols: great ? ['#fde047', '#fff', '#f472b6', '#60a5fa'] : ['#fff', '#bbf7d0'], shape: 'star', speed: (great ? 340 : 200)*Math.max(0.6, L.sc), grav: 300, size: 5*Math.max(0.7, L.sc), life: 0.9});
        K.kick(great ? 0.7 : 0.25, great ? 0.3 : 0.08, great ? 0.14 : 0.05, '#fffbe6');
      }
      else showPop('Max ' + MAXSTROKES + ' strokes', '#ffffff', 1.7);
      const cell = cardCell(cur, hi); if (cell) K.fly(String(s), px, py - 20, cell[0], cell[1], sunk && s < hole.par ? '#86efac' : '#fde047', 30);
      doneT = 0; setPhase('holed');
    }
    function nextAfterHole(){
      if (nP === 2 && cur === 0){ cur = 1; startTurn(); return; }
      cur = 0;
      if (hi + 1 >= HOLES.length){ endGame(); return; }
      loadHole(hi + 1); startTurn();
    }
    const sum = pl => pl.sc.reduce((a, b) => a + (b || 0), 0);
    const esc = K.esc;
    function endGame(){
      setPhase('end');
      const t1 = sum(players[0]), r = api.saveScore(t1) || {};
      let head = 'All 9 holes done!';
      if (nP === 2){ const t2 = sum(players[1]); head = t1 === t2 ? "It's a tie!" : (t1 < t2 ? esc(players[0].name) + ' wins!' : 'Player 2 wins!'); }
      const stars = t1 <= PAR + 3 ? 3 : t1 <= PAR + 10 ? 2 : 1;
      const td = 'padding:4px 4px;border-bottom:1px solid rgba(255,255,255,.12);text-align:center';
      const table = `<div style="overflow-x:auto"><table style="border-collapse:collapse;margin:2px auto;font-size:13px;color:#e2e8f0"><tr><th style="${td};text-align:left">Hole</th>${HOLES.map((h, i) => `<th style="${td}">${i + 1}</th>`).join('')}<th style="${td}">Tot</th></tr>
        <tr style="color:#94a3b8"><td style="${td};text-align:left">Par</td>${HOLES.map(h => `<td style="${td}">${h.par}</td>`).join('')}<td style="${td}">${PAR}</td></tr>
        ${players.map(p => `<tr><td style="${td};text-align:left;white-space:nowrap">${esc(p.av)} ${esc(p.name)}</td>${p.sc.map((s, i) => `<td style="${td};${s < HOLES[i].par ? 'color:#4ade80;font-weight:700' : ''}">${s}</td>`).join('')}<td style="${td};font-weight:800;color:#fff">${sum(p)}</td></tr>`).join('')}</table></div>`;
      K.end({head, score: t1, unit: `strokes · par ${PAR} · fewer is better`, stars, best: r.best != null ? r.best : t1, bestUnit: 'strokes', isBest: !!r.isBest, wide: true,
        extra: (nP === 2 ? `<div style="font:700 18px ${HEAD_FONT};margin-bottom:6px">${players.map(p => esc(p.av) + ' ' + sum(p)).join(' &nbsp;·&nbsp; ')}</div>` : '') + table,
        second: {act: 'menu', label: '👥 Players'}});
    }
    function menu(){
      setPhase('menu'); players = []; nP = 1; loadHole(0); ball.x = hole.tee[0]; ball.y = hole.tee[1]; ball.sink = 0; banner = popup = null; trail.length = 0;
      K.start({how: 'Pull back from the ball and let go to putt.', howIcon: '🏌️', bestUnit: 'strokes',
        modes: [{act: 'p1', icon: api.avatar || '🙂', label: '1 player', sub: '9 holes, beat your best'}, {act: 'p2', icon: '👥', label: '2 players', sub: 'Take turns on one iPad'}]});
    }

    // ---- layout ----
    let L = {sc:1, ox:0, oy:0};
    function layout(){
      const top = 68, rows = 2 + Math.max(1, nP), bot = rows*20 + 22, avail = H - top - bot;
      const sc = Math.max(0.2, Math.min((W - 24)/800, avail/500));
      L = {sc, ox:(W - 800*sc)/2, oy: top + (avail - 500*sc)/2, top, bot};
    }
    function cardCell(pi, h){ // centre of a scorecard cell (for the flying stroke count)
      const nameW = Math.min(120, W*0.16), cw = (W - 36 - nameW)/10;
      return [18 + nameW + h*cw + cw/2, H - L.bot + 8 + (2 + pi)*20 + 10];
    }

    // ---- physics ----
    const inRect = (r, x, y) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
    function step(dt){
      // windmills always turn
      for (const m of hole.mills || []) m.a = (m.a || 0) + m.speed*dt;
      if (ball.sink > 0) return;
      // a blade sweeping into a resting ball nudges it
      for (const m of hole.mills || []) for (let k = 0; k < m.n; k++){
        const a = m.a + k*Math.PI*2/m.n, ex = m.x + Math.cos(a)*m.len, ey = m.y + Math.sin(a)*m.len;
        const dx = ex - m.x, dy = ey - m.y, l2 = dx*dx + dy*dy;
        let u = ((ball.x - m.x)*dx + (ball.y - m.y)*dy)/l2; u = Math.max(0, Math.min(1, u));
        const px = m.x + dx*u, py = m.y + dy*u, ddx = ball.x - px, ddy = ball.y - py, d = Math.hypot(ddx, ddy), rr = BR + 5;
        if (d < rr && d > 1e-4){
          const nx = ddx/d, ny = ddy/d; ball.x += nx*(rr - d); ball.y += ny*(rr - d);
          const bvx = -m.speed*(py - m.y), bvy = m.speed*(px - m.x);
          let rvx = ball.vx - bvx, rvy = ball.vy - bvy; const vn = rvx*nx + rvy*ny;
          if (vn < 0){ rvx -= 1.6*vn*nx; rvy -= 1.6*vn*ny; ball.vx = rvx + bvx; ball.vy = rvy + bvy; if (vn < -120) hitFx(ball.x - nx*BR, ball.y - ny*BR, ['#fef3c7', '#fff'], 0.15); }
          if (!ball.moving && phase === 'aim'){ ball.moving = true; drag = null; setPhase('roll'); }
        }
      }
      if (!ball.moving) return;
      let sand = false; for (const s of hole.sand || []) if (inRect(s, ball.x, ball.y)) sand = true;
      if (sand && !inSand){ K.burst(X(ball.x), Y(ball.y), 10, {cols: ['#f5deb3', '#e9c46a', '#fff7e0'], speed: 120*Math.max(0.6, L.sc), grav: 0, drag: 4, size: 3*Math.max(0.7, L.sc), life: 0.6}); }
      inSand = sand;
      let hill = null; for (const h of hole.hills || []) if (inRect(h, ball.x, ball.y)) hill = h;
      if (hill){ ball.vx += hill.ax*dt; ball.vy += hill.ay*dt; }
      let sp = Math.hypot(ball.vx, ball.vy);
      const dec = (sand ? 620 : 150) + (sand ? 2.6 : 0.9)*sp;
      if (sp > 0){ const k = Math.max(0, sp - dec*dt)/sp; ball.vx *= k; ball.vy *= k; }
      ball.x += ball.vx*dt; ball.y += ball.vy*dt;
      // walls
      for (const s of segs){
        const dx = s[2] - s[0], dy = s[3] - s[1], l2 = dx*dx + dy*dy;
        let u = ((ball.x - s[0])*dx + (ball.y - s[1])*dy)/l2; u = Math.max(0, Math.min(1, u));
        const px = s[0] + dx*u, py = s[1] + dy*u, ddx = ball.x - px, ddy = ball.y - py, d2 = ddx*ddx + ddy*ddy;
        if (d2 < BR*BR && d2 > 1e-8){
          const d = Math.sqrt(d2), nx = ddx/d, ny = ddy/d; ball.x = px + nx*BR; ball.y = py + ny*BR;
          const vn = ball.vx*nx + ball.vy*ny;
          if (vn < 0){ ball.vx -= 1.72*vn*nx; ball.vy -= 1.72*vn*ny; ball.vx *= 0.97; ball.vy *= 0.97; if (vn < -160 && wallCd <= 0){ wallCd = 0.08; hitFx(px, py, ['#d6a46a', '#fde68a', '#fff'], Math.min(0.4, -vn/1800)); } }
        }
      }
      // bumpers
      (hole.bumpers || []).forEach((b, i) => {
        const dx = ball.x - b.x, dy = ball.y - b.y, d = Math.hypot(dx, dy), rr = b.r + BR;
        if (d < rr && d > 1e-4){
          const nx = dx/d, ny = dy/d; ball.x = b.x + nx*rr; ball.y = b.y + ny*rr;
          const vn = ball.vx*nx + ball.vy*ny;
          if (vn < 0){ ball.vx -= 2*vn*nx; ball.vy -= 2*vn*ny; const s2 = Math.hypot(ball.vx, ball.vy), ns = Math.min(MAXS*0.8, s2*1.12 + 40); ball.vx *= ns/s2; ball.vy *= ns/s2; flash[i] = 1;
            K.burst(X(b.x + nx*b.r), Y(b.y + ny*b.r), 14, {cols: ['#fde047', '#fff', '#fb7185'], shape: 'spark', speed: 300*Math.max(0.6, L.sc), ang: Math.atan2(ny, nx), spread: 2.2, grav: 0, drag: 3, size: 3, life: 0.35});
            K.kick(0.3, 0, 0.04); }
        }
      });
      // tunnel
      for (const tn of hole.tunnels || []){
        if (Math.hypot(ball.x - tn.ax, ball.y - tn.ay) < 15){
          const s2 = Math.max(260, Math.hypot(ball.vx, ball.vy)*0.9);
          ball.x = tn.bx + tn.dx*22; ball.y = tn.by + tn.dy*22; ball.vx = tn.dx*s2; ball.vy = tn.dy*s2; trail.length = 0;
          showPop('Whoosh!', '#9fe0ff', 0.9);
          K.burst(X(tn.bx + tn.dx*20), Y(tn.by), 12, {cols: ['#e0f2fe', '#fff'], speed: 220*Math.max(0.6, L.sc), ang: Math.atan2(tn.dy, tn.dx), spread: 1.4, grav: 0, drag: 3, size: 3, life: 0.4});
        }
      }
      // water
      for (const w of hole.water || []) if (inRect(w, ball.x, ball.y)){
        K.burst(X(ball.x), Y(ball.y), 18, {cols: ['#bae6fd', '#e0f2fe', '#38bdf8'], speed: 220*Math.max(0.6, L.sc), grav: 300, size: 3.5*Math.max(0.7, L.sc), life: 0.6, vy: -60});
        K.burst(X(ball.x), Y(ball.y), 2, {cols: ['rgba(255,255,255,.8)'], shape: 'ring', speed: 0, grav: 0, size: 8*L.sc, life: 0.7});
        ball.x = ball.lx; ball.y = ball.ly; ball.vx = ball.vy = 0; ball.moving = false; strokes++; trail.length = 0; strokeBump = 1;
        showPop('Splash! +1', '#9fe0ff', 1.3); afterStop(); return;
      }
      // cup
      sp = Math.hypot(ball.vx, ball.vy);
      const cdx = hole.cup[0] - ball.x, cdy = hole.cup[1] - ball.y, cd = Math.hypot(cdx, cdy);
      if (cd < CUPR){
        if (sp < 430){ ball.sink = 0.001; ball.moving = false; ball.vx = ball.vy = 0; holeDone(true); return; }
        // too fast: it lips out a little
        const a = (Math.random() - 0.5)*0.5, c = Math.cos(a), s = Math.sin(a);
        const vx = ball.vx*c - ball.vy*s, vy = ball.vx*s + ball.vy*c; ball.vx = vx*0.85; ball.vy = vy*0.85;
      } else if (cd < CUPR + 10 && sp < 200){ ball.vx += cdx/cd*260*dt; ball.vy += cdy/cd*260*dt; }
      if (Math.hypot(ball.vx, ball.vy) < 5 && !hill){ ball.vx = ball.vy = 0; ball.moving = false; afterStop(); }
    }
    function hitFx(x, y, cols, shake){ K.burst(X(x), Y(y), 7, {cols, speed: 150*Math.max(0.6, L.sc), grav: 0, drag: 4, size: 2.6*Math.max(0.7, L.sc), life: 0.35}); if (shake > 0.12) K.kick(shake, 0, 0); }
    function afterStop(){
      if (phase === 'holed') return;
      if (strokes >= MAXSTROKES) holeDone(false); else setPhase('aim');
    }

    // ---- input: pull back and release ----
    const toW = e => ({x:(e.clientX - rect.left - L.ox)/L.sc, y:(e.clientY - rect.top - L.oy)/L.sc, px:e.clientX - rect.left, py:e.clientY - rect.top});
    function down(e){
      if (phase !== 'aim') return;
      rect = el.getBoundingClientRect(); const p = toW(e);
      const near = Math.hypot(p.px - (L.ox + ball.x*L.sc), p.py - (L.oy + ball.y*L.sc)) < 70;
      drag = {id:e.pointerId, near, sx:p.px, sy:p.py, px:p.px, py:p.py};
      try { cv.setPointerCapture(e.pointerId); } catch(_){}
    }
    function pullOf(){ // screen-space pull vector (from where the shot goes, backwards)
      if (!drag) return null;
      const bx = L.ox + ball.x*L.sc, by = L.oy + ball.y*L.sc;
      const vx = drag.near ? bx - drag.px : drag.sx - drag.px, vy = drag.near ? by - drag.py : drag.sy - drag.py;
      const maxP = Math.max(110, Math.min(170, Math.min(W, H)*0.22)), len = Math.hypot(vx, vy);
      return {dx: len ? vx/len : 0, dy: len ? vy/len : 0, pow: Math.min(1, len/maxP), len};
    }
    function move(e){ if (!drag || e.pointerId !== drag.id) return; const p = toW(e); drag.px = p.px; drag.py = p.py; }
    function up(e){
      if (!drag || e.pointerId !== drag.id) return;
      const p = toW(e); drag.px = p.px; drag.py = p.py;
      const pl = pullOf(); drag = null;
      if (phase !== 'aim' || !pl || pl.len < 14) return;
      const sp = 40 + Math.pow(pl.pow, 1.25)*(MAXS - 40);
      ball.lx = ball.x; ball.ly = ball.y; ball.vx = pl.dx*sp; ball.vy = pl.dy*sp; ball.moving = true; strokes++; strokeBump = 1;
      K.burst(X(ball.x), Y(ball.y), 8, {cols: ['#fff', '#bbf7d0'], speed: 120*Math.max(0.6, L.sc), ang: Math.atan2(-pl.dy, -pl.dx), spread: 1.6, grav: 0, drag: 4, size: 2.5, life: 0.3});
      if (pl.pow > 0.85) K.kick(0.2, 0, 0.03);
      setPhase('roll');
    }
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

    // ---- the cached layer: garden + this hole's course, painted once per hole and size ----
    const X = x => L.ox + x*L.sc, Y = y => L.oy + y*L.sc;
    const lay = document.createElement('canvas'), lx = lay.getContext('2d');
    const seeded = seed => () => (seed = (seed*16807) % 2147483647)/2147483647;
    function rrp(g, x, y, w, h, r){ r = Math.min(r, w/2, h/2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function polyP(g, pg){ g.beginPath(); g.moveTo(X(pg[0][0]), Y(pg[0][1])); for (let i = 1; i < pg.length; i++) g.lineTo(X(pg[i][0]), Y(pg[i][1])); g.closePath(); }
    function paint(){
      lay.width = cv.width; lay.height = cv.height; const g = lx, s = L.sc, R = seeded(97 + hi*31);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      // lawn with soft light from the top-left
      let gr = g.createLinearGradient(0, 0, W*0.4, H); gr.addColorStop(0, '#5fae4a'); gr.addColorStop(1, '#2f7a33');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let i = 0; i < W*H/90; i++){ g.fillStyle = R() < 0.5 ? 'rgba(255,255,220,.06)' : 'rgba(0,40,0,.08)'; g.fillRect(R()*W, R()*H, 2, 3); }
      // stepping stones path, flower beds and shrubs (the course covers whatever lands under it)
      for (let i = 0; i < 14; i++){ const x = R()*W, y = R()*H, r = 10 + R()*8;
        g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x + 2, y + 3, r, r*0.75, 0, 0, 6.283); g.fill();
        g.fillStyle = '#c7c2b4'; g.beginPath(); g.ellipse(x, y, r, r*0.75, 0, 0, 6.283); g.fill();
        g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(x - r*0.25, y - r*0.2, r*0.5, r*0.3, 0, 0, 6.283); g.fill(); }
      const FL = ['#f472b6', '#facc15', '#f8fafc', '#c084fc', '#fb923c', '#f87171'];
      for (let i = 0; i < 26; i++){ const x = R()*W, y = R()*H, r = 18 + R()*26, col = FL[(R()*FL.length) | 0];
        g.fillStyle = 'rgba(0,30,0,.28)'; g.beginPath(); g.arc(x + 5, y + 7, r, 0, 6.283); g.fill();
        const bg2 = g.createRadialGradient(x - r*0.3, y - r*0.3, r*0.1, x, y, r); bg2.addColorStop(0, '#4ade80'); bg2.addColorStop(1, '#166534');
        g.fillStyle = bg2; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
        for (let k = 0; k < 7; k++){ const a = R()*6.283, d = R()*r*0.75; g.fillStyle = col; g.beginPath(); g.arc(x + Math.cos(a)*d, y + Math.sin(a)*d, 2.6, 0, 6.283); g.fill();
          g.fillStyle = '#fef9c3'; g.beginPath(); g.arc(x + Math.cos(a)*d, y + Math.sin(a)*d, 1, 0, 6.283); g.fill(); } }
      for (let i = 0; i < 8; i++){ const x = R() < 0.5 ? R()*W*0.18 : W - R()*W*0.18, y = R()*H, r = 34 + R()*30;
        g.fillStyle = 'rgba(0,30,0,.3)'; g.beginPath(); g.arc(x + 12, y + 16, r, 0, 6.283); g.fill();
        for (let k = 0; k < 5; k++){ const a = k*1.256, cx2 = x + Math.cos(a)*r*0.35, cy2 = y + Math.sin(a)*r*0.35;
          const tg = g.createRadialGradient(cx2 - r*0.2, cy2 - r*0.25, 2, cx2, cy2, r*0.7); tg.addColorStop(0, '#86efac'); tg.addColorStop(0.6, '#22863a'); tg.addColorStop(1, '#14532d');
          g.fillStyle = tg; g.beginPath(); g.arc(cx2, cy2, r*0.7, 0, 6.283); g.fill(); } }
      if (!hole) return;
      // the course sits on a little raised plinth with a soft shadow
      g.save(); g.shadowColor = 'rgba(0,25,0,.55)'; g.shadowBlur = 22*s; g.shadowOffsetX = 6*s; g.shadowOffsetY = 10*s;
      polyP(g, hole.poly); g.fillStyle = '#3e2a14'; g.fill(); g.restore();
      g.save(); polyP(g, hole.poly);
      gr = g.createRadialGradient(X(400), Y(250), 40*s, X(400), Y(250), 520*s); gr.addColorStop(0, '#6fd36a'); gr.addColorStop(1, '#3ea54a');
      g.fillStyle = gr; g.fill(); g.clip();
      // mown stripes and a fine speckle
      g.fillStyle = 'rgba(255,255,255,.07)'; for (let x = -500; x < 900; x += 60){ g.beginPath(); g.moveTo(X(x), Y(0)); g.lineTo(X(x + 30), Y(0)); g.lineTo(X(x + 30 + 200), Y(500)); g.lineTo(X(x + 200), Y(500)); g.closePath(); g.fill(); }
      for (let i = 0; i < 900; i++){ g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,60,0,.09)'; g.fillRect(X(R()*800), Y(R()*500), 1.6, 1.6); }
      // hills
      for (const h of hole.hills || []){
        gr = g.createLinearGradient(X(h.x), 0, X(h.x + h.w), 0);
        gr.addColorStop(0, 'rgba(30,90,30,.35)'); gr.addColorStop(0.45, 'rgba(190,255,170,.45)'); gr.addColorStop(1, 'rgba(20,70,20,.4)');
        g.fillStyle = gr; g.fillRect(X(h.x), Y(h.y), h.w*s, h.h*s);
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3*s; g.lineCap = 'round';
        const dir = h.ax < 0 ? 1 : -1; // chevrons point uphill
        for (let yy = h.y + 30; yy < h.y + h.h - 10; yy += 50) for (let xx = h.x + 30; xx < h.x + h.w - 10; xx += 45){
          g.beginPath(); g.moveTo(X(xx - 8*dir), Y(yy - 10)); g.lineTo(X(xx + 8*dir), Y(yy)); g.lineTo(X(xx - 8*dir), Y(yy + 10)); g.stroke(); }
      }
      // sand traps: rim shadow, grain and raked arcs
      for (const sd of hole.sand || []){
        g.save(); rrp(g, X(sd.x), Y(sd.y), sd.w*s, sd.h*s, 26*s); g.fillStyle = '#c9a65a'; g.fill(); g.clip();
        gr = g.createRadialGradient(X(sd.x + sd.w*0.45), Y(sd.y + sd.h*0.4), 4, X(sd.x + sd.w/2), Y(sd.y + sd.h/2), Math.max(sd.w, sd.h)*0.6*s);
        gr.addColorStop(0, '#fbe7b0'); gr.addColorStop(1, '#e2c27a'); g.fillStyle = gr; g.fillRect(X(sd.x), Y(sd.y), sd.w*s, sd.h*s);
        g.strokeStyle = 'rgba(160,120,50,.28)'; g.lineWidth = 1.4*s;
        for (let k = 12; k < Math.max(sd.w, sd.h); k += 12){ g.beginPath(); g.arc(X(sd.x + sd.w/2), Y(sd.y + sd.h/2), k*s, 0, 6.283); g.stroke(); }
        for (let i = 0; i < sd.w*sd.h/150; i++){ g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.35)' : 'rgba(150,110,40,.3)'; g.fillRect(X(sd.x + R()*sd.w), Y(sd.y + R()*sd.h), 1.4, 1.4); }
        g.strokeStyle = 'rgba(120,85,30,.45)'; g.lineWidth = 5*s; rrp(g, X(sd.x), Y(sd.y), sd.w*s, sd.h*s, 26*s); g.stroke();
        g.restore();
      }
      // ponds: deep centre, light shallows, a stone edge and lily pads
      for (const w of hole.water || []){
        g.save(); rrp(g, X(w.x), Y(w.y), w.w*s, w.h*s, 18*s); g.clip();
        gr = g.createRadialGradient(X(w.x + w.w/2), Y(w.y + w.h/2), 4, X(w.x + w.w/2), Y(w.y + w.h/2), Math.max(w.w, w.h)*0.65*s);
        gr.addColorStop(0, '#0b5fa5'); gr.addColorStop(0.7, '#1d8fdc'); gr.addColorStop(1, '#5ec4f2'); g.fillStyle = gr; g.fillRect(X(w.x), Y(w.y), w.w*s, w.h*s);
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 4*s; rrp(g, X(w.x), Y(w.y), w.w*s, w.h*s, 18*s); g.stroke();
        for (let k = 0; k < 3; k++){ const lx2 = w.x + w.w*(0.2 + R()*0.6), ly2 = w.y + w.h*(0.2 + R()*0.6), r = (9 + R()*6)*s, a = R()*6.283;
          g.fillStyle = 'rgba(0,40,60,.3)'; g.beginPath(); g.arc(X(lx2) + 2, Y(ly2) + 3, r, 0, 6.283); g.fill();
          g.fillStyle = '#4caf50'; g.beginPath(); g.moveTo(X(lx2), Y(ly2)); g.arc(X(lx2), Y(ly2), r, a + 0.35, a + 6.0); g.closePath(); g.fill();
          g.strokeStyle = 'rgba(20,80,20,.6)'; g.lineWidth = 1; g.stroke(); }
        g.font = `${20*s}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🪷', X(w.x + w.w*0.75), Y(w.y + w.h*0.5));
        g.restore();
      }
      // tunnels: stone pipe mouths and a faint dug line between them
      for (const tn of hole.tunnels || []){
        g.strokeStyle = 'rgba(60,40,20,.25)'; g.setLineDash([6*s, 9*s]); g.lineWidth = 4*s; g.beginPath(); g.moveTo(X(tn.ax), Y(tn.ay)); g.lineTo(X(tn.bx), Y(tn.by)); g.stroke(); g.setLineDash([]);
        for (const [x, y, lbl] of [[tn.ax, tn.ay, 'in'], [tn.bx, tn.by, 'out']]){
          g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(X(x) + 3*s, Y(y) + 4*s, 26*s, 0, 6.283); g.fill();
          gr = g.createRadialGradient(X(x) - 8*s, Y(y) - 8*s, 2, X(x), Y(y), 26*s); gr.addColorStop(0, '#e5e7eb'); gr.addColorStop(1, '#6b7280');
          g.fillStyle = gr; g.beginPath(); g.arc(X(x), Y(y), 25*s, 0, 6.283); g.fill();
          gr = g.createRadialGradient(X(x), Y(y), 2, X(x), Y(y), 17*s); gr.addColorStop(0, '#000'); gr.addColorStop(1, '#27272a');
          g.fillStyle = gr; g.beginPath(); g.arc(X(x), Y(y), 17*s, 0, 6.283); g.fill();
          if (lbl === 'out'){ g.strokeStyle = '#fff'; g.lineWidth = 3.5*s; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(x + 30), Y(y)); g.lineTo(X(x + 46), Y(y)); g.moveTo(X(x + 39), Y(y - 7)); g.lineTo(X(x + 46), Y(y)); g.lineTo(X(x + 39), Y(y + 7)); g.stroke(); }
        }
      }
      // the cup: a pale collar, then a deep hole with an inner shadow
      const [hx, hy] = hole.cup;
      g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.arc(X(hx), Y(hy), (CUPR + 5)*s, 0, 6.283); g.fill();
      gr = g.createRadialGradient(X(hx) - 3*s, Y(hy) - 4*s, 1, X(hx), Y(hy), CUPR*s); gr.addColorStop(0, '#000'); gr.addColorStop(0.7, '#0b1a0c'); gr.addColorStop(1, '#2c3d2d');
      g.fillStyle = gr; g.beginPath(); g.arc(X(hx), Y(hy), CUPR*s, 0, 6.283); g.fill();
      g.strokeStyle = '#e5e7eb'; g.lineWidth = 1.5*s; g.beginPath(); g.arc(X(hx), Y(hy), CUPR*s, 0, 6.283); g.stroke();
      // tee mat
      g.fillStyle = 'rgba(255,255,255,.18)'; rrp(g, X(hole.tee[0] - 22), Y(hole.tee[1] - 22), 44*s, 44*s, 8*s); g.fill();
      g.restore();
      // wooden rails: dark base, warm plank, highlight edge
      g.lineJoin = 'round'; g.lineCap = 'round';
      polyP(g, hole.poly); g.strokeStyle = '#4a2c12'; g.lineWidth = 18*s; g.stroke();
      g.strokeStyle = '#9a6234'; g.lineWidth = 12*s; g.stroke();
      g.strokeStyle = 'rgba(255,214,160,.55)'; g.lineWidth = 3*s; g.save(); g.translate(-2*s, -2*s); polyP(g, hole.poly); g.stroke(); g.restore();
      const wood = (x1, y1, x2, y2) => {
        g.fillStyle = 'rgba(0,25,0,.35)'; g.fillRect(X(x1) + 5*s, Y(y1) + 7*s, (x2 - x1)*s, (y2 - y1)*s);
        gr = g.createLinearGradient(X(x1), Y(y1), X(x2), Y(y2)); gr.addColorStop(0, '#b77a43'); gr.addColorStop(1, '#7a4a22');
        g.fillStyle = gr; g.fillRect(X(x1), Y(y1), (x2 - x1)*s, (y2 - y1)*s);
        g.strokeStyle = 'rgba(70,40,15,.35)'; g.lineWidth = 1;
        const horiz = (x2 - x1) > (y2 - y1);
        for (let k = 8; k < (horiz ? y2 - y1 : x2 - x1); k += 10){ g.beginPath(); if (horiz){ g.moveTo(X(x1), Y(y1 + k)); g.lineTo(X(x2), Y(y1 + k)); } else { g.moveTo(X(x1 + k), Y(y1)); g.lineTo(X(x1 + k), Y(y2)); } g.stroke(); }
        g.strokeStyle = '#4a2c12'; g.lineWidth = 3*s; g.strokeRect(X(x1), Y(y1), (x2 - x1)*s, (y2 - y1)*s);
        g.fillStyle = 'rgba(255,220,170,.35)'; g.fillRect(X(x1), Y(y1), (x2 - x1)*s, 2.5*s);
      };
      for (const b of hole.blocks || []) wood(b[0], b[1], b[2], b[3]);
      for (const sg of hole.segs || []){ g.beginPath(); g.moveTo(X(sg[0]), Y(sg[1])); g.lineTo(X(sg[2]), Y(sg[3])); g.strokeStyle = '#4a2c12'; g.lineWidth = 14*s; g.stroke(); g.strokeStyle = '#b77a43'; g.lineWidth = 8*s; g.stroke(); }
      // soft vignette over everything
      gr = g.createRadialGradient(W/2, H/2, Math.min(W, H)*0.4, W/2, H/2, Math.max(W, H)*0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,20,0,.35)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    }

    // ---- per-frame drawing ----
    const rr = (x, y, w, h, r) => K.rr(cx, x, y, w, h, r);
    let gBump = null, gBallG = null;
    function drawWater(){
      if (RM) return;
      const s = L.sc;
      for (const w of hole.water || []){
        cx.save(); rr(X(w.x), Y(w.y), w.w*s, w.h*s, 18*s); cx.clip();
        cx.strokeStyle = 'rgba(255,255,255,.28)'; cx.lineWidth = 1.6*s;
        for (let yy = w.y + 16; yy < w.y + w.h; yy += 22){ cx.beginPath();
          for (let xx = w.x; xx <= w.x + w.w; xx += 10){ const yo = Math.sin(t*1.6 + xx*0.06 + yy*0.4)*3; if (xx === w.x) cx.moveTo(X(xx), Y(yy + yo)); else cx.lineTo(X(xx), Y(yy + yo)); }
          cx.stroke(); }
        cx.restore();
      }
    }
    function drawBumpers(){
      const s = L.sc;
      if (!gBump){ gBump = cx.createRadialGradient(-0.35, -0.4, 0.05, 0, 0, 1); gBump.addColorStop(0, '#ff8a9b'); gBump.addColorStop(0.5, '#e11d48'); gBump.addColorStop(1, '#7f1d1d'); }
      (hole.bumpers || []).forEach((b, i) => {
        const f = flash[i] || 0, r = (b.r + f*4)*s;
        cx.fillStyle = 'rgba(0,30,0,.35)'; cx.beginPath(); cx.arc(X(b.x) + 3*s, Y(b.y) + 5*s, b.r*s, 0, 6.283); cx.fill();
        if (f > 0.05){ cx.fillStyle = `rgba(253,224,71,${f*0.5})`; cx.beginPath(); cx.arc(X(b.x), Y(b.y), r + 10*s*f, 0, 6.283); cx.fill(); }
        cx.save(); cx.translate(X(b.x), Y(b.y)); cx.scale(r, r); cx.fillStyle = gBump; cx.beginPath(); cx.arc(0, 0, 1, 0, 6.283); cx.fill(); cx.restore();
        cx.strokeStyle = f > 0.05 ? '#fde047' : '#fff'; cx.lineWidth = 3.5*s; cx.beginPath(); cx.arc(X(b.x), Y(b.y), r*0.62, 0, 6.283); cx.stroke();
        cx.fillStyle = 'rgba(255,255,255,.55)'; cx.beginPath(); cx.ellipse(X(b.x) - r*0.35, Y(b.y) - r*0.4, r*0.25, r*0.15, -0.6, 0, 6.283); cx.fill();
      });
    }
    function drawMills(){
      const s = L.sc;
      for (const m of hole.mills || []){
        for (const pass of [0, 1]) for (let k = 0; k < m.n; k++){
          const a = (m.a || 0) + k*Math.PI*2/m.n, ex = m.x + Math.cos(a)*m.len, ey = m.y + Math.sin(a)*m.len, o = pass ? 0 : 7*s;
          cx.lineCap = 'round';
          if (!pass){ cx.strokeStyle = 'rgba(0,30,0,.3)'; cx.lineWidth = 14*s; cx.beginPath(); cx.moveTo(X(m.x) + o, Y(m.y) + o*1.4); cx.lineTo(X(ex) + o, Y(ey) + o*1.4); cx.stroke(); continue; }
          cx.strokeStyle = '#5a3a1a'; cx.lineWidth = 13*s; cx.beginPath(); cx.moveTo(X(m.x), Y(m.y)); cx.lineTo(X(ex), Y(ey)); cx.stroke();
          cx.strokeStyle = k % 2 ? '#fde68a' : '#f4ead2'; cx.lineWidth = 8*s; cx.beginPath(); cx.moveTo(X(m.x + Math.cos(a)*22), Y(m.y + Math.sin(a)*22)); cx.lineTo(X(ex), Y(ey)); cx.stroke();
          cx.strokeStyle = 'rgba(120,80,30,.35)'; cx.lineWidth = 1.2; for (let q = 0.35; q < 1; q += 0.16){ const qx = m.x + Math.cos(a)*m.len*q, qy = m.y + Math.sin(a)*m.len*q, nx = -Math.sin(a)*4, ny = Math.cos(a)*4;
            cx.beginPath(); cx.moveTo(X(qx - nx), Y(qy - ny)); cx.lineTo(X(qx + nx), Y(qy + ny)); cx.stroke(); }
        }
        cx.fillStyle = 'rgba(0,30,0,.3)'; cx.beginPath(); cx.arc(X(m.x) + 4*s, Y(m.y) + 6*s, 16*s, 0, 6.283); cx.fill();
        cx.fillStyle = '#b91c1c'; cx.beginPath(); cx.arc(X(m.x), Y(m.y), 15*s, 0, 6.283); cx.fill();
        cx.fillStyle = '#ef4444'; cx.beginPath(); cx.arc(X(m.x) - 2*s, Y(m.y) - 2*s, 11*s, 0, 6.283); cx.fill();
        cx.fillStyle = '#ffd65a'; cx.beginPath(); cx.arc(X(m.x), Y(m.y), 5*s, 0, 6.283); cx.fill();
      }
    }
    function drawFlag(){
      const s = L.sc, [hx, hy] = hole.cup;
      if (ball.sink !== 0 && phase === 'holed') return;
      const px = X(hx + CUPR + 2), py = Y(hy), top = Y(hy - 50), wv = RM ? 0 : Math.sin(t*4)*3*s;
      cx.strokeStyle = 'rgba(0,30,0,.3)'; cx.lineWidth = 3*s; cx.beginPath(); cx.moveTo(px, py); cx.lineTo(px + 26*s, py + 14*s); cx.stroke();   // pole shadow
      cx.strokeStyle = '#f8fafc'; cx.lineWidth = 3.2*s; cx.beginPath(); cx.moveTo(px, py); cx.lineTo(px, top); cx.stroke();
      cx.fillStyle = '#fde047'; cx.beginPath(); cx.arc(px, top, 2.6*s, 0, 6.283); cx.fill();
      cx.fillStyle = '#e53935'; cx.beginPath(); cx.moveTo(px, top + 2*s);
      cx.quadraticCurveTo(px + 14*s, top + 2*s - wv, px + 30*s, top + 10*s + wv); cx.quadraticCurveTo(px + 14*s, top + 16*s + wv*0.5, px, top + 20*s); cx.closePath(); cx.fill();
      cx.fillStyle = 'rgba(0,0,0,.18)'; cx.beginPath(); cx.moveTo(px, top + 12*s); cx.quadraticCurveTo(px + 14*s, top + 16*s + wv*0.5, px, top + 20*s); cx.closePath(); cx.fill();
      cx.fillStyle = '#fff'; cx.font = `800 ${11*s}px ${HEAD_FONT}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(String(hi + 1), px + 12*s, top + 10*s + wv*0.3);
    }
    function drawBall(){
      const s = L.sc, k = ball.sink > 0 ? Math.max(0, 1 - ball.sink*2.5) : 1;
      if (!gBallG){ gBallG = cx.createRadialGradient(-0.35, -0.35, 0.08, 0, 0, 1); gBallG.addColorStop(0, '#ffffff'); gBallG.addColorStop(0.7, '#e5e7eb'); gBallG.addColorStop(1, '#9ca3af'); }
      // trail
      if (trail.length > 4){ for (let i = 0; i < trail.length - 2; i += 2){ const a = i/trail.length; cx.globalAlpha = a*0.45; cx.fillStyle = '#fff';
        cx.beginPath(); cx.arc(X(trail[i]), Y(trail[i+1]), BR*s*(0.3 + a*0.6), 0, 6.283); cx.fill(); } cx.globalAlpha = 1; }
      if (k <= 0) return;
      const x = X(ball.x), y = Y(ball.y), r = BR*s*k, sp = Math.hypot(ball.vx, ball.vy), st = RM ? 0 : Math.min(0.25, sp/3000);
      cx.fillStyle = 'rgba(0,30,0,.35)'; cx.beginPath(); cx.ellipse(x + 2.5*s, y + 4*s, r, r*0.8, 0, 0, 6.283); cx.fill();
      cx.save(); cx.translate(x, y); cx.rotate(Math.atan2(ball.vy, ball.vx)); cx.scale(r*(1 + st), r*(1 - st*0.6));
      cx.fillStyle = gBallG; cx.beginPath(); cx.arc(0, 0, 1, 0, 6.283); cx.fill(); cx.restore();
      cx.fillStyle = 'rgba(0,0,0,.12)'; for (const [dx, dy] of [[0.3, 0.2], [-0.1, 0.45], [0.45, -0.15], [0.05, -0.05]]){ cx.beginPath(); cx.arc(x + dx*r, y + dy*r, r*0.1, 0, 6.283); cx.fill(); }
      if (phase === 'aim' && !drag){
        const pl = players[cur]; if (pl){ cx.font = `${Math.max(22, 26*s)}px system-ui, sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'bottom'; cx.fillText(pl.av, x, y - r - 6 - (RM ? 0 : Math.abs(Math.sin(t*3))*5)); }
        cx.strokeStyle = `rgba(255,255,255,${0.55 + (RM ? 0 : Math.sin(t*4)*0.25)})`; cx.lineWidth = 2.5; cx.setLineDash([5, 6]); cx.lineDashOffset = RM ? 0 : -t*20;
        cx.beginPath(); cx.arc(x, y, 30 + (RM ? 0 : Math.sin(t*4)*3), 0, 6.283); cx.stroke(); cx.setLineDash([]); cx.lineDashOffset = 0;
      }
    }
    function drawAim(){
      const pl = pullOf(); if (!pl || pl.len < 6 || phase !== 'aim') return;
      const bx = X(ball.x), by = Y(ball.y);
      // pull band back to the finger
      cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 4; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(bx, by); cx.lineTo(bx - pl.dx*Math.min(pl.len, 170), by - pl.dy*Math.min(pl.len, 170)); cx.stroke();
      // aim path: glowing dots, longer with more power
      const len = (60 + pl.pow*260)*Math.max(0.6, L.sc), col = pl.pow < 0.45 ? '#7dff8a' : pl.pow < 0.8 ? '#ffd65a' : '#ff6b5a';
      cx.save(); cx.shadowColor = col; cx.shadowBlur = 8; cx.fillStyle = col;
      for (let d = 16; d < len; d += 14){ cx.beginPath(); cx.arc(bx + pl.dx*d, by + pl.dy*d, 3.6*(1 - d/len*0.5), 0, 6.283); cx.fill(); }
      const ax = bx + pl.dx*len, ay = by + pl.dy*len, an = Math.atan2(pl.dy, pl.dx);
      cx.beginPath(); cx.moveTo(ax + Math.cos(an)*13, ay + Math.sin(an)*13); cx.lineTo(ax + Math.cos(an + 2.5)*13, ay + Math.sin(an + 2.5)*13); cx.lineTo(ax + Math.cos(an - 2.5)*13, ay + Math.sin(an - 2.5)*13); cx.closePath(); cx.fill();
      cx.restore();
      // power ring around the ball
      cx.strokeStyle = 'rgba(15,23,42,.55)'; cx.lineWidth = 9; cx.beginPath(); cx.arc(bx, by, 24, 0, 6.283); cx.stroke();
      cx.strokeStyle = col; cx.lineWidth = 6; cx.lineCap = 'round'; cx.beginPath(); cx.arc(bx, by, 24, -Math.PI/2, -Math.PI/2 + pl.pow*6.283); cx.stroke();
      // power pill
      const txt = Math.round(pl.pow*100) + '%', mx = Math.max(60, Math.min(W - 60, bx - pl.dx*80)), my = Math.max(L.top + 10, Math.min(H - L.bot - 60, by - pl.dy*80 - 23));
      K.pill(cx, mx, my, 'POWER', txt, {h: 42, fs: 20, align: 'center', col});
    }
    function drawHud(){
      if (phase !== 'menu' && hole){
        const z = Math.max(0.78, Math.min(1.1, W/900)), hh = 48*z, top = 10;
        const pl = players[cur];
        K.pill(cx, 14, top, 'HOLE ' + (hi + 1) + ' OF 9', hole.name, {icon: '⛳', h: hh, fs: (W < 600 ? 18 : 22)*z});
        K.pill(cx, W/2 + (W < 600 ? 30 : 0), top, 'PAR', String(hole.par), {h: hh, fs: 24*z, align: 'center', minW: 64*z});
        const sb = 1 + strokeBump*0.25, rx = W - 14;
        cx.save(); cx.translate(rx - 60*z, top + hh/2); cx.scale(sb, sb); cx.translate(-(rx - 60*z), -(top + hh/2));
        if (pl) K.pill(cx, rx, top, nP === 2 ? pl.name.toUpperCase() : 'STROKES', (nP === 2 ? 'Strokes ' : '') + strokes, {icon: pl.av, h: hh, fs: 24*z, align: 'right', col: strokes >= hole.par + 2 ? '#fdba74' : '#fff'});
        cx.restore();
      }
      // scorecard: a glass panel along the bottom
      const rh = 20, nameW = Math.min(120, W*0.16), cw = (W - 36 - nameW)/10, y0 = H - L.bot + 8;
      cx.fillStyle = 'rgba(15,23,42,.62)'; rr(8, H - L.bot + 2, W - 16, L.bot - 10, 16); cx.fill();
      cx.strokeStyle = 'rgba(255,255,255,.15)'; cx.lineWidth = 1; cx.stroke();
      const rows = [['Hole', HOLES.map((h, i) => String(i + 1)), 'Tot'], ['Par', HOLES.map(h => String(h.par)), String(PAR)]];
      const pls = players.length ? players : [{name: api.name || 'You', av: api.avatar || '🙂', sc: []}];
      pls.forEach(p => rows.push([p.av + ' ' + p.name, HOLES.map((h, i) => p.sc[i] != null ? String(p.sc[i]) : ''), String(p.sc.reduce((a, b) => a + (b || 0), 0) || '')]));
      rows.forEach((r, ri) => {
        const y = y0 + ri*rh;
        if (ri >= 2 && ri - 2 === cur && phase !== 'end' && phase !== 'menu'){ cx.fillStyle = 'rgba(255,255,255,.1)'; rr(14, y, W - 28, rh, 8); cx.fill(); }
        cx.fillStyle = ri === 1 ? '#94a3b8' : '#f1f5f9'; cx.font = `${ri === 0 || ri >= 2 ? 700 : 500} 13px ${TXT_FONT}`; cx.textAlign = 'left'; cx.textBaseline = 'middle';
        let nm = r[0]; while (nm.length > 3 && cx.measureText(nm).width > nameW - 6) nm = nm.slice(0, -2) + '…';
        cx.fillText(nm, 20, y + rh/2); cx.textAlign = 'center';
        r[1].forEach((v, i) => { const cxp = 18 + nameW + i*cw + cw/2;
          if (ri === 0 && i === hi && phase !== 'menu' && phase !== 'end'){ cx.fillStyle = '#fde047'; rr(cxp - 12, y + 1, 24, rh - 2, 8); cx.fill(); cx.fillStyle = '#3b2300'; }
          else cx.fillStyle = ri === 1 ? '#94a3b8' : (ri >= 2 && v && +v < HOLES[i].par ? '#4ade80' : ri >= 2 && v && +v > HOLES[i].par + 1 ? '#fdba74' : '#f1f5f9');
          cx.fillText(v, cxp, y + rh/2); });
        cx.fillStyle = ri === 1 ? '#94a3b8' : '#fff'; cx.font = `800 13px ${TXT_FONT}`; cx.fillText(r[2], 18 + nameW + 9*cw + cw/2, y + rh/2);
      });
    }
    function drawOverlays(dt){
      const mid = L.oy + 250*L.sc;
      if (banner){ banner.t += dt; const d = 2.0; if (banner.t > d) banner = null; else {
        const a = banner.t > d - 0.4 ? (d - banner.t)/0.4 : 1, e = RM ? 1 : 1 - Math.pow(1 - Math.min(1, banner.t*3), 3), sl = (1 - e)*60;
        cx.save(); cx.globalAlpha = a; cx.translate(0, sl);
        const fs = Math.max(28, Math.min(52, W/15)), bw = Math.min(W - 40, Math.max(320, fs*banner.a.length*0.55 + 60)), bh = fs*2.6;
        cx.fillStyle = 'rgba(15,23,42,.62)'; rr(W/2 - bw/2, mid - bh/2, bw, bh, 26); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.18)'; cx.lineWidth = 1; cx.stroke();
        cx.font = `700 ${Math.round(fs*0.32)}px ${TXT_FONT}`; cx.fillStyle = '#bbf7d0'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(banner.k.toUpperCase(), W/2, mid - bh*0.3);
        K.big(cx, banner.a, W/2, mid - bh*0.02, fs, '#ffffff');
        cx.font = `800 ${Math.round(fs*0.45)}px ${HEAD_FONT}`; cx.fillStyle = '#fde047'; cx.fillText(banner.b, W/2, mid + bh*0.3);
        cx.restore(); } }
      if (popup){ popup.t += dt; if (popup.t > popup.dur) popup = null; else {
        const a = popup.t > popup.dur - 0.35 ? (popup.dur - popup.t)/0.35 : 1, sc = RM ? 1 : Math.min(1, popup.t*5)*(1 + 0.08*Math.sin(Math.min(1, popup.t*5)*Math.PI));
        const y = mid - (banner ? 110 : 0), fs = Math.max(34, Math.min(popup.big ? 80 : 64, W/(popup.big ? 10 : 13)));
        cx.save(); cx.globalAlpha = a; cx.translate(W/2, y); cx.scale(sc, sc);
        if (popup.big && !RM) K.rays(cx, 0, 0, fs*3.2, popup.col, 0.22*a, t*0.8);
        K.big(cx, popup.txt, 0, 0, fs, popup.col, {stroke: 'rgba(10,30,15,.88)', glow: popup.big ? popup.col : null});
        cx.restore(); } }
    }

    function loop(now){
      raf = requestAnimationFrame(loop);
      const rdt = Math.min(0.05, last ? (now - last)/1000 : 0.016); last = now; t += rdt;
      const dt = K.tick(rdt);
      layout();
      const key = W + 'x' + H + ':' + hi + ':' + nP;
      if (key !== paintKey){ paintKey = key; paint(); }
      const n = Math.min(14, Math.ceil(dt/(1/240)));
      if (dt > 0) for (let i = 0; i < n; i++) step(dt/n);
      if (wallCd > 0) wallCd -= rdt;
      strokeBump = Math.max(0, strokeBump - rdt*4);
      for (let i = 0; i < flash.length; i++) flash[i] = Math.max(0, flash[i] - rdt*4);
      if (ball.moving && Math.hypot(ball.vx, ball.vy) > 120){ trail.push(ball.x, ball.y); if (trail.length > 20) trail.splice(0, 2); }
      else if (trail.length) trail.splice(0, 2);
      if (phase === 'holed'){ doneT += rdt; if (ball.sink > 0) ball.sink += rdt; if (doneT > 1.9) nextAfterHole(); }
      const [shx, shy] = K.shakeXY();
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.save(); cx.translate(shx, shy);
      cx.drawImage(lay, 0, 0, W, H);
      drawWater(); drawBumpers(); drawFlag(); drawMills(); drawBall(); drawAim();
      cx.restore();
      K.drawParts(cx);
      drawHud(); drawOverlays(rdt);
      K.drawFlies(cx); K.drawFlash(cx, W, H);
    }
    menu();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
      K.destroy();
      delete el._golfDbg; el.innerHTML = '';
    };
  }};
})();
