// Brain Break game: four. Self-contained: canvas + DOM overlay, no images or libraries.
(function(){
  'use strict';
  window.BreakGames = window.BreakGames || {};
  // ---- shared Brain Break helpers (the same in every game by this author) ----
  const HF = '"Baloo 2", "Trebuchet MS", system-ui, sans-serif', TF = '"Lexend", Verdana, system-ui, sans-serif', EF = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui, sans-serif';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t, rnd = (a, b) => a + Math.random() * (b - a);
  const eOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3), eIn = t => { t = clamp(t, 0, 1); return t * t; };
  const eBack = t => { t = clamp(t, 0, 1); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const mkCanvas = (w, h, d) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * d)); c.height = Math.max(1, Math.round(h * d)); const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); return [c, x]; };
  const rrPath = (x, X, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); x.beginPath(); x.moveTo(X + r, y); x.arcTo(X + w, y, X + w, y + h, r); x.arcTo(X + w, y + h, X, y + h, r); x.arcTo(X, y + h, X, y, r); x.arcTo(X, y, X + w, y, r); x.closePath(); };
  // a soft blurred blob of a path (a cast shadow); canvas filters are not on every iPad, so this uses an offset shadow
  const soft = (x, d, blur, col, path) => { x.save(); x.shadowColor = col; x.shadowBlur = blur * d; x.shadowOffsetX = 10000 * d; x.translate(-10000, 0); x.fillStyle = '#000'; path(); x.fill(); x.restore(); };
  // wood: a gradient plank with grain lines and a knot or two (drawn once into a cached layer)
  function wood(x, X, Y, w, h, c0, c1, grain, seed, vertical){
    const g = vertical ? x.createLinearGradient(X, Y, X + w, Y) : x.createLinearGradient(X, Y, X, Y + h); g.addColorStop(0, c0); g.addColorStop(1, c1);
    x.fillStyle = g; x.fillRect(X, Y, w, h);
    const R = seeded(seed || 7), L = vertical ? w : h, Lo = vertical ? h : w, n = Math.max(6, Math.round(L / 5));
    x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip(); x.lineCap = 'round';
    for (let i = 0; i < n; i++){
      const p = R() * L, amp = 1 + R() * 5, fr = 0.004 + R() * 0.012, ph = R() * 6.3;
      x.strokeStyle = grain.replace('A', (0.05 + R() * 0.16).toFixed(3)); x.lineWidth = 0.5 + R() * 1.8; x.beginPath();
      for (let s = -10; s <= Lo + 10; s += 12){ const o = p + Math.sin(s * fr + ph) * amp + Math.sin(s * fr * 3.1 + ph) * amp * 0.3; if (vertical) (s < 0 ? x.moveTo(X + o, Y + s) : x.lineTo(X + o, Y + s)); else (s < 0 ? x.moveTo(X + s, Y + o) : x.lineTo(X + s, Y + o)); }
      x.stroke();
    }
    for (let i = 0; i < Math.round(Lo * L / 90000); i++){ const kx = X + R() * w, ky = Y + R() * h, kr = 3 + R() * 6; x.strokeStyle = grain.replace('A', '0.22'); x.lineWidth = 1.2; for (let j = 0; j < 3; j++){ x.beginPath(); x.ellipse(kx, ky, kr * (1 + j * 0.7) * (vertical ? 0.6 : 1.8), kr * (1 + j * 0.7) * (vertical ? 1.8 : 0.6), 0, 0, 7); x.stroke(); } }
    x.restore();
  }
  // ---- the shared Brain Break frame: title card, between-games card, end card (DOM) ----
  const CSS = `.bbov{position:absolute;left:0;top:0;right:0;bottom:0;display:none;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;background:radial-gradient(ellipse at 50% 45%,rgba(15,23,42,.28),rgba(15,23,42,.72));touch-action:none;z-index:5}
.bbcard{position:relative;width:min(560px,100%);max-height:100%;overflow:auto;box-sizing:border-box;padding:18px 20px 18px;border-radius:30px;background:linear-gradient(180deg,rgba(30,41,59,.93),rgba(15,23,42,.95));border:1px solid rgba(255,255,255,.15);box-shadow:0 26px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.14);color:#fff;text-align:center;font-family:${TF};display:flex;flex-direction:column;align-items:center;gap:10px;animation:bbUp .55s cubic-bezier(.2,1.25,.4,1) both;scrollbar-width:none}
@keyframes bbUp{from{transform:translateY(70px) scale(.95);opacity:0}to{transform:none;opacity:1}}
.bbicon{font:46px/1 ${EF};filter:drop-shadow(0 6px 10px rgba(0,0,0,.4));animation:bbBob 2.8s ease-in-out infinite}
@keyframes bbBob{50%{transform:translateY(-7px) rotate(-3deg)}}
.bbname{font:800 42px/1 ${HF};letter-spacing:.5px;background:linear-gradient(180deg,#fff 30%,#fde68a);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 3px 0 rgba(120,53,15,.9));animation:bbIn .7s .08s cubic-bezier(.2,1.5,.4,1) both;padding-top:4px}
@keyframes bbIn{from{transform:scale(.4);opacity:0}}
.bbh{font:800 34px/1.08 ${HF};text-shadow:0 3px 10px rgba(0,0,0,.4)}
.bbsub{font:500 17px/1.35 ${TF};color:#cbd5e1}
.bbhow{display:inline-flex;align-items:center;gap:10px;font:500 17px/1.3 ${TF};color:#e2e8f0;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:8px 18px}
.bbhow b{font:22px/1 ${EF}}
.bbrow{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:center;width:100%}
.bbchip{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(15,23,42,.55);border:1px solid rgba(255,255,255,.15);font:700 17px ${HF};color:#fff}
.bbav{font:32px/1 ${EF};width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.45),rgba(255,255,255,.08));border:2px solid rgba(255,255,255,.35);box-shadow:0 6px 14px rgba(0,0,0,.3)}
.bbmode{flex:1 1 170px;min-height:72px;border-radius:22px;border:2px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;font:800 22px/1.1 ${HF};display:flex;flex-direction:row;align-items:center;justify-content:center;gap:10px;cursor:pointer;touch-action:manipulation;transition:transform .18s,background .18s,box-shadow .18s}
.bbmode i{font:32px/1 ${EF};font-style:normal}
.bbmode[aria-pressed=true]{background:linear-gradient(180deg,#3b82f6,#1d4ed8);border-color:#93c5fd;box-shadow:0 10px 24px rgba(37,99,235,.5);transform:translateY(-3px)}
.bblab{font:600 13px ${TF};color:#94a3b8;letter-spacing:.08em;text-transform:uppercase}
.bbseg{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.bbseg button{min-height:50px;min-width:86px;padding:6px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:#fff;font:700 19px ${HF};cursor:pointer;touch-action:manipulation}
.bbseg button[aria-pressed=true]{background:#fde047;color:#1e293b;border-color:#fde047;box-shadow:0 6px 16px rgba(253,224,71,.35)}
.bbplay{min-height:66px;width:min(340px,100%);border-radius:999px;border:0;background:linear-gradient(180deg,#4ade80,#16a34a);color:#fff;font:800 29px ${HF};text-shadow:0 2px 0 rgba(0,0,0,.25);box-shadow:0 6px 0 #166534,0 16px 30px rgba(22,163,74,.45);cursor:pointer;touch-action:manipulation;animation:bbPulse 1.7s ease-in-out infinite;margin-top:4px}
@keyframes bbPulse{50%{transform:scale(1.045)}}
.bbplay:active{transform:translateY(4px)!important;box-shadow:0 2px 0 #166534}
.bb2nd{min-height:52px;padding:6px 22px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#e2e8f0;font:700 19px ${HF};cursor:pointer;touch-action:manipulation}
.bbstars{display:flex;gap:6px;justify-content:center}
.bbstars span{font:800 50px/1 ${HF};color:rgba(255,255,255,.16)}
.bbstars span.on{color:#fde047;text-shadow:0 0 18px rgba(253,224,71,.65),0 3px 0 #b45309;animation:bbStar .6s cubic-bezier(.2,1.7,.4,1) both}
@keyframes bbStar{from{transform:scale(0) rotate(-50deg)}}
.bbscore{font:800 66px/1 ${HF};color:#fde047;text-shadow:0 4px 0 rgba(120,53,15,.8),0 10px 24px rgba(0,0,0,.35)}
.bbvs{font:800 40px/1 ${HF};display:flex;gap:14px;align-items:center;justify-content:center}
.bbribbon{position:relative;margin-top:-2px;padding:6px 34px;font:800 20px ${HF};color:#422006;background:linear-gradient(180deg,#fde047,#f59e0b);clip-path:polygon(0 0,100% 0,94% 50%,100% 100%,0 100%,6% 50%);animation:bbIn .6s .5s cubic-bezier(.2,1.6,.4,1) both;filter:drop-shadow(0 4px 8px rgba(0,0,0,.35))}
.bbrm .bbcard,.bbrm .bbicon,.bbrm .bbname,.bbrm .bbplay,.bbrm .bbstars span.on,.bbrm .bbribbon{animation:none!important}`;
  function bbUI(el, api){
    const st = document.createElement('style'); st.textContent = CSS; el.appendChild(st);
    const ov = document.createElement('div'); ov.className = 'bbov' + (api.reducedMotion ? ' bbrm' : ''); el.appendChild(ov);
    const mk = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
    const btn = (cls, txt, fn) => { const b = mk('button', cls, txt); b.type = 'button'; b.addEventListener('click', e => { e.stopPropagation(); fn(); }); return b; };
    let countRaf = 0;
    const open = () => { cancelAnimationFrame(countRaf); ov.innerHTML = ''; ov.style.display = 'flex'; const c = mk('div', 'bbcard'); ov.appendChild(c); return c; };
    const seg = (g, onPaint) => {
      const wrap = mk('div', ''); wrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;align-items:center';
      wrap.appendChild(mk('div', 'bblab', g.label)); const row = mk('div', 'bbseg');
      const bs = g.options.map(o => { const b = btn('', o.label, () => { g.value = o.value; paint(); if (g.onChange) g.onChange(o.value); }); row.appendChild(b); return [b, o.value]; });
      const paint = () => bs.forEach(([b, v]) => b.setAttribute('aria-pressed', v === g.value ? 'true' : 'false'));
      paint(); wrap.appendChild(row); return wrap;
    };
    const ui = {
      // title card: game name, how-to, avatar + best, mode cards, options, big Play
      title(o){
        const c = open();
        c.appendChild(mk('div', 'bbicon', o.icon));
        c.appendChild(mk('div', 'bbname', o.name));
        const how = mk('div', 'bbhow'); how.appendChild(mk('b', '', o.howIcon || '👆')); how.appendChild(mk('span', '', o.how)); c.appendChild(how);
        const who = mk('div', 'bbrow'); who.appendChild(mk('div', 'bbav', api.avatar || '🙂'));
        who.appendChild(mk('div', 'bbchip', '🏆 Best: ' + (api.best == null ? '–' : api.best + (o.bestUnit ? ' ' + o.bestUnit : '')))); c.appendChild(who);
        if (o.mode){
          const row = mk('div', 'bbrow');
          const cards = [[1, '🤖', 'vs Computer'], [2, '👥', '2 players']].map(([v, e, t]) => { const b = btn('bbmode', null, () => { o.mode.value = v; paint(); o.mode.onChange(v); }); const i = mk('i', '', e); b.appendChild(i); b.appendChild(mk('span', '', t)); row.appendChild(b); return [b, v]; });
          const paint = () => cards.forEach(([b, v]) => b.setAttribute('aria-pressed', v === o.mode.value ? 'true' : 'false'));
          paint(); c.appendChild(row);
        }
        (o.groups || []).forEach(g => c.appendChild(seg(g)));
        c.appendChild(btn('bbplay', '▶ Play', o.onPlay));
      },
      // between games: who won this one, the running score, Next
      between(o){
        const c = open();
        c.appendChild(mk('div', 'bbicon', o.icon)); c.appendChild(mk('div', 'bbh', o.title));
        if (o.vs){ const v = mk('div', 'bbvs'); o.vs.forEach((p, i) => { if (i) v.appendChild(mk('span', '', '–')); const s = mk('span', '', p.text); s.style.color = p.color || '#fff'; v.appendChild(s); }); c.appendChild(v); }
        if (o.sub) c.appendChild(mk('div', 'bbsub', o.sub));
        c.appendChild(btn('bbplay', o.btn || '▶ Next game', o.onGo));
      },
      // end card: result, stars, score counting up, best, Play again
      end(o){
        const c = open(), rm = api.reducedMotion;
        if (o.res && o.res.isBest && o.score > 0) c.appendChild(mk('div', 'bbribbon', '🏆 New best!'));
        c.appendChild(mk('div', 'bbicon', o.icon)); c.appendChild(mk('div', 'bbh', o.title));
        if (o.sub) c.appendChild(mk('div', 'bbsub', o.sub));
        if (o.vs){ const v = mk('div', 'bbvs'); o.vs.forEach((p, i) => { if (i) v.appendChild(mk('span', '', '–')); const s = mk('span', '', p.text); s.style.color = p.color || '#fff'; v.appendChild(s); }); c.appendChild(v); }
        if (o.stars != null){ const s = mk('div', 'bbstars'); for (let i = 0; i < 3; i++){ const sp = mk('span', i < o.stars ? 'on' : '', '★'); sp.style.animationDelay = (0.35 + i * 0.18) + 's'; s.appendChild(sp); } c.appendChild(s); }
        if (o.score != null){
          c.appendChild(mk('div', 'bblab', o.scoreLabel || 'Score'));
          const sc = mk('div', 'bbscore', rm ? String(o.score) : '0'); c.appendChild(sc);
          if (!rm){ const t0 = performance.now(), dur = 700 + Math.min(600, o.score * 40); const tick = t => { if (!sc.isConnected) return; const p = clamp((t - t0) / dur, 0, 1); sc.textContent = String(Math.round(o.score * eOut(p))); if (p < 1) countRaf = requestAnimationFrame(tick); }; countRaf = requestAnimationFrame(tick); }
        }
        if (o.res && !(o.res.isBest && o.score > 0)) c.appendChild(mk('div', 'bbchip', '🏆 Best: ' + o.res.best));
        if (o.line) c.appendChild(mk('div', 'bbsub', o.line));
        c.appendChild(btn('bbplay', '▶ Play again', o.again));
        if (o.menu) c.appendChild(btn('bb2nd', 'Change players', o.menu));
      },
      hide(){ cancelAnimationFrame(countRaf); ov.style.display = 'none'; ov.innerHTML = ''; },
      isOpen: () => ov.style.display !== 'none',
      kill(){ cancelAnimationFrame(countRaf); }
    };
    return ui;
  }
  // save the round; the shell throws confetti for any new best, so it is held back when the child did not win
  function saveQuiet(api, score, celebrate){
    const w = window, orig = w.confetti;
    if (celebrate || typeof orig !== 'function') return api.saveScore(score);
    try { w.confetti = () => {}; return api.saveScore(score); } finally { w.confetti = orig; }
  }
  // glass HUD pill on a canvas: small label over a bold value
  function pill(x, X, y, label, value, align, dot, size, extra){
    size = size || 22; const lf = `600 ${Math.round(size * 0.5)}px ${TF}`, vf = `800 ${size}px ${HF}`;
    x.font = lf; const lw = label ? x.measureText(label.toUpperCase()).width : 0; x.font = vf; const vw = x.measureText(value).width;
    const pad = size * 0.7, dw = dot ? size * 0.65 : 0, w = Math.max(lw, vw) + pad * 2 + dw + (extra || 0), h = label ? size * 2.05 : size * 1.65;
    const L = align === 'right' ? X - w : align === 'center' ? X - w / 2 : X;
    rrPath(x, L, y, w, h, h / 2); x.fillStyle = 'rgba(15,23,42,.55)'; x.fill(); x.strokeStyle = 'rgba(255,255,255,.15)'; x.lineWidth = 1; x.stroke();
    const cxm = L + pad + dw + Math.max(lw, vw) / 2;
    if (dot){ x.fillStyle = dot; x.beginPath(); x.arc(L + pad + dw * 0.3, y + h / 2, size * 0.24, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 1.5; x.stroke(); }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    if (label){ x.font = lf; x.fillStyle = 'rgba(226,232,240,.78)'; x.fillText(label.toUpperCase(), cxm, y + size * 0.62); x.font = vf; x.fillStyle = '#fff'; x.fillText(value, cxm, y + size * 1.36); }
    else { x.font = vf; x.fillStyle = '#fff'; x.fillText(value, cxm, y + h / 2 + 1); }
    return {x:L, y, w, h};
  }
  // particles, pop-up text that flies to the HUD, screen shake, flash and hit pause (one small engine per game)
  function juice(api){
    const P = [], T = [], J = {P, T, sh:0, fl:0, hold:0, flCol:'#fff'};
    J.add = (o) => { if (P.length >= 150) P.shift(); P.push(Object.assign({t:0, life:0.8, vx:0, vy:0, g:0, r:3, kind:'spark', col:'#fde047', rot:0, vr:0, drag:0}, o)); };
    J.burst = (x, y, n, col, kind, spd, life, up) => { for (let i = 0; i < n; i++){ const a = Math.random() * 6.283, v = (spd || 200) * (0.35 + Math.random() * 0.65); J.add({x, y, vx:Math.cos(a) * v, vy:Math.sin(a) * v - (up || 0), g:kind === 'chip' ? 700 : kind === 'dust' ? -20 : 120, r:kind === 'dust' ? rnd(4, 9) : kind === 'chip' ? rnd(3, 6) : rnd(1.5, 3.5), kind:kind || 'spark', col:Array.isArray(col) ? col[i % col.length] : col, life:(life || 0.8) * rnd(0.7, 1.2), vr:rnd(-12, 12), drag:kind === 'dust' ? 3 : 1}); } };
    J.ring = (x, y, R, n, col, spd) => { for (let i = 0; i < n; i++){ const a = i / n * 6.283 + Math.random() * 0.4, v = (spd || 90) * rnd(0.6, 1.1); J.add({x:x + Math.cos(a) * R, y:y + Math.sin(a) * R * 0.5, vx:Math.cos(a) * v, vy:Math.sin(a) * v * 0.45, g:-30, r:rnd(3, 6), kind:'dust', col, life:rnd(0.35, 0.55), drag:4}); } };
    J.text = (s, x, y, o) => { T.push(Object.assign({s, x, y, x0:x, y0:y, t:0, life:1.3, size:30, col:'#fde047', tx:null, ty:null}, o || {})); };
    J.shake = a => { if (!api.reducedMotion) J.sh = Math.max(J.sh, a); };
    J.flash = (a, col) => { if (!api.reducedMotion){ J.fl = Math.max(J.fl, a); J.flCol = col || '#fff'; } };
    J.pause = s => { if (!api.reducedMotion) J.hold = Math.max(J.hold, s); };
    J.update = dt => {
      for (const p of P){ p.t += dt; const d = Math.exp(-p.drag * dt); p.vx *= d; p.vy *= d; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
      for (let i = P.length - 1; i >= 0; i--) if (P[i].t >= P[i].life) P.splice(i, 1);
      for (const t of T) t.t += dt; for (let i = T.length - 1; i >= 0; i--) if (T[i].t >= T[i].life) T.splice(i, 1);
      J.sh = Math.max(0, J.sh - dt * 30); J.fl = Math.max(0, J.fl - dt * 3);
    };
    J.offset = () => J.sh > 0 ? [rnd(-J.sh, J.sh), rnd(-J.sh, J.sh)] : [0, 0];
    // dust is drawn in its own pass, under the pieces (J.draw(x, true)); everything else on top (J.draw(x))
    J.draw = (x, under) => {
      for (const p of P){
        if ((p.kind === 'dust') !== !!under) continue;
        const a = 1 - p.t / p.life; x.globalAlpha = clamp(a, 0, 1);
        if (p.kind === 'spark'){ x.globalCompositeOperation = 'lighter'; x.fillStyle = p.col; x.beginPath(); x.arc(p.x, p.y, p.r * (0.6 + a * 0.6), 0, 7); x.fill(); x.globalCompositeOperation = 'source-over'; }
        else if (p.kind === 'dust'){ x.globalAlpha = clamp(a * 0.5, 0, 1); x.fillStyle = p.col; x.beginPath(); x.arc(p.x, p.y, p.r * (1.6 - a * 0.6), 0, 7); x.fill(); }
        else if (p.kind === 'star'){ x.globalCompositeOperation = 'lighter'; x.fillStyle = p.col; x.save(); x.translate(p.x, p.y); x.rotate(p.rot); const s = p.r * 2.4 * (0.5 + a * 0.5); x.beginPath(); for (let i = 0; i < 8; i++){ const rr = i % 2 ? s * 0.28 : s; x.lineTo(Math.cos(i * 0.785) * rr, Math.sin(i * 0.785) * rr); } x.fill(); x.restore(); x.globalCompositeOperation = 'source-over'; }
        else { x.fillStyle = p.col; x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r); x.restore(); }
      }
      x.globalAlpha = 1;
      if (under) return;
      for (const t of T){
        const k = t.t / t.life, pop = eBack(t.t / 0.25), fly = t.tx != null ? eIn((t.t - 0.45) / (t.life - 0.45)) : 0;
        const px = lerp(t.x0, t.tx != null ? t.tx : t.x0, fly), py = lerp(t.y0 - (t.tx != null ? 0 : k * 30), t.ty != null ? t.ty : t.y0, fly);
        x.globalAlpha = clamp(t.tx != null ? 1 - fly * 0.6 : (1 - k) * 3, 0, 1);
        const sz = t.size * (0.4 + 0.6 * pop) * (1 - fly * 0.45);
        x.font = `800 ${Math.round(sz)}px ${HF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
        x.lineWidth = Math.max(3, sz * 0.18); x.strokeStyle = 'rgba(15,23,42,.85)'; x.strokeText(t.s, px, py); x.fillStyle = t.col; x.fillText(t.s, px, py);
      }
      x.globalAlpha = 1;
    };
    J.overlay = (x, W, H) => { if (J.fl > 0){ x.globalAlpha = clamp(J.fl, 0, 0.7); x.fillStyle = J.flCol; x.fillRect(-20, -20, W + 40, H + 40); x.globalAlpha = 1; } };
    return J;
  }
  // three bouncing dots: the computer is thinking
  function dots(x, X, Y, t, col){ for (let i = 0; i < 3; i++){ const b = Math.max(0, Math.sin(t * 7 - i * 0.7)); x.fillStyle = col || '#fff'; x.globalAlpha = 0.5 + b * 0.5; x.beginPath(); x.arc(X + i * 9, Y - b * 5, 3, 0, 7); x.fill(); } x.globalAlpha = 1; }
  function kit(el, api){
    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden'; el.style.userSelect = 'none'; el.style.webkitUserSelect = 'none';
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none';
    el.appendChild(cv);
    const cx = cv.getContext('2d');
    const k = {cv, cx, on, W:1, H:1, d:1, onResize:null, J:juice(api), RM:!!api.reducedMotion, now:0};
    const size = () => {
      const r = el.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
      if (W === k.W && H === k.H && cv.width === Math.round(W * d)) return;
      k.W = W; k.H = H; k.d = d; cv.width = Math.round(W * d); cv.height = Math.round(H * d); cx.setTransform(d, 0, 0, d, 0, 0);
      if (k.onResize) k.onResize();
    };
    on(window, 'resize', size); on(window, 'orientationchange', size);
    let ro = null; if (window.ResizeObserver){ ro = new ResizeObserver(size); ro.observe(el); }
    let raf = 0, last = 0, frameFn = null, dead = false;
    const loop = t => { if (dead) return; raf = requestAnimationFrame(loop); let dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60; last = t; k.now += dt;
      if (k.J.hold > 0){ k.J.hold -= dt; dt = 0; }
      if (frameFn) frameFn(dt); };
    k.frame = f => { frameFn = f; };
    raf = requestAnimationFrame(loop);
    const tms = new Set();
    k.after = (ms, fn) => { const id = setTimeout(() => { tms.delete(id); if (!dead) fn(); }, ms); tms.add(id); return id; };
    k.clearTimers = () => { tms.forEach(clearTimeout); tms.clear(); };
    k.pt = e => { const r = cv.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
    k.ui = bbUI(el, api);
    k.hideMenu = () => k.ui.hide(); k.menuOpen = () => k.ui.isOpen();
    k.rr = (x, y, w, h, r) => rrPath(cx, x, y, w, h, r);
    k.pill = (label, value, X, y, align, dot, size, extra) => pill(cx, X, y, label, value, align, dot, size, extra);
    k.cleanup = () => { dead = true; cancelAnimationFrame(raf); frameFn = null; k.clearTimers(); k.ui.kill(); offs.forEach(f => f()); offs.length = 0; if (ro) ro.disconnect(); el.innerHTML = ''; };
    size();
    return k;
  }
  // Four in a Row: best of 3 against the computer (easy / medium / hard) or a friend on the same iPad.
  // Drawn as a glossy blue plastic stand on a wooden table in a cosy room; discs drop, bounce and squash.
  window.BreakGames.four = {
    start(el, api){
      const k = kit(el, api), cx = k.cx, J = k.J, RM = k.RM;
      const COLS = 7, ROWS = 6;
      const DC = [{c:'#ef4444', d:'#991b1b', l:'#fecaca', name:'Red'}, {c:'#facc15', d:'#a16207', l:'#fef9c3', name:'Yellow'}];
      const opt = Object.assign({players:1, level:'easy'}, api.store.get('opts') || {});
      let state = 'menu', g = [], land = [], turn = 0, starter = 0, wins = [0, 0], games = 0, draws = 0, falling = null, winCells = null, winT = 0, hoverCol = -1, aiHov = {x:3, tgt:3, t:0, on:false};
      for (let c = 0; c < COLS; c++){ g.push([]); land.push([]); }
      const names = () => opt.players === 1 ? ['You', 'Computer'] : [api.name || 'Player 1', 'Player 2'];
      function startScreen(){
        state = 'menu';
        const groups = [];
        if (opt.players === 1) groups.push({label:'Computer', value:opt.level, options:[{label:'Easy', value:'easy'}, {label:'Medium', value:'medium'}, {label:'Hard', value:'hard'}], onChange:v => { opt.level = v; }});
        k.ui.title({icon:'🔴🟡', name:'Four in a Row', howIcon:'⬇️', how:'Tap a column to drop a disc. Connect four! Best of 3.', bestUnit:'wins', mode:{value:opt.players, onChange:v => { opt.players = v; startScreen(); }}, groups, onPlay:beginMatch});
      }
      function beginMatch(){ api.store.set('opts', opt); discS = [0, 1].map(who => discSprite(who, G.cs)); wins = [0, 0]; games = 0; draws = 0; starter = 0; k.hideMenu(); newGame(); }
      function newGame(){ g = []; land = []; for (let c = 0; c < COLS; c++){ g.push([]); land.push([]); } turn = starter; winCells = null; falling = null; state = 'play'; aiHov.on = false; maybeAI(); }
      const at = (b, c, r) => (c >= 0 && c < COLS && r >= 0 && r < ROWS && b[c][r] != null) ? b[c][r] : -1;
      function fourAt(b, c, r){ const who = b[c][r]; for (const [dc, dr] of [[1,0],[0,1],[1,1],[1,-1]]){ const cells = [[c, r]]; for (let s = 1; at(b, c + dc * s, r + dr * s) === who; s++) cells.push([c + dc * s, r + dr * s]); for (let s = 1; at(b, c - dc * s, r - dr * s) === who; s++) cells.push([c - dc * s, r - dr * s]); if (cells.length >= 4) return cells; } return null; }
      const full = b => b.every(col => col.length >= ROWS);
      function drop(c){
        if (state !== 'play' || falling || g[c].length >= ROWS) return;
        const r = g[c].length; falling = {c, r, who:turn, y:-0.9, v:0, bounce:0}; aiHov.on = false;
      }
      function landed(){
        const f = falling; g[f.c].push(f.who); land[f.c][f.r] = k.now; falling = null;
        const w = fourAt(g, f.c, f.r);
        if (w){ winCells = w; endGame(f.who); return; }
        if (full(g)){ endGame(-1); return; }
        turn = 1 - turn; maybeAI();
      }
      function endGame(who){
        state = 'over'; games++; winT = k.now; if (who >= 0) wins[who]++; else draws++;
        if (who >= 0){
          k.after(250, () => { J.pause(0.1); J.shake(7); J.flash(0.35, '#fff7d6'); const m = winMid(); J.text('+1', m.x, m.y, {size:50, col:'#fde047', tx:k.W / 2, ty:30, life:1.3});
            winCells.forEach(([c, r]) => { const p = cellXY(c, r); J.burst(p.x, p.y, 10, ['#fde047', '#fff', DC[who].l], 'star', 280, 0.9); }); });
        } else J.text('Board full!', k.W / 2, G.y + G.cs * 3, {size:48, col:'#e2e8f0', life:1.3});
        const done = wins[0] >= 2 || wins[1] >= 2 || games >= 3;
        k.after(1700, () => {
          const [a, b] = names();
          if (done){ matchOver(); return; }
          starter = 1 - starter;
          const head = who < 0 ? 'Board full: a tie!' : who === 0 ? (opt.players === 1 ? 'You win this game!' : a + ' wins this game!') : (opt.players === 1 ? 'The computer wins this game' : b + ' wins this game!');
          k.ui.between({icon:who < 0 ? '🤝' : who === 0 ? '🎉' : (opt.players === 1 ? '🤖' : '🎉'), title:head, vs:[{text:a + ' ' + wins[0], color:'#fca5a5'}, {text:wins[1] + ' ' + b, color:'#fde68a'}], sub:'Game ' + (games + 1) + ' of 3 is next', onGo:() => { k.hideMenu(); newGame(); }});
        });
      }
      function matchOver(){
        state = 'end'; const [a, b] = names(), won = wins[0] > wins[1];
        const head = won ? (opt.players === 1 ? 'You won the match!' : a + ' wins the match!') : wins[1] > wins[0] ? (opt.players === 1 ? 'The computer won this time' : b + ' wins the match!') : 'The match is a tie!';
        const vs = [{text:a + ' ' + wins[0], color:'#fca5a5'}, {text:wins[1] + ' ' + b, color:'#fde68a'}];
        if (opt.players === 1){
          const stars = wins[0] >= 2 ? (wins[1] === 0 ? 3 : 2) : wins[0] >= 1 ? 1 : 0;
          const res = saveQuiet(api, wins[0], won); if (won && !res.isBest) api.confetti(50);
          k.ui.end({icon:won ? '🏆' : wins[0] === wins[1] ? '🤝' : '🤖', title:head, stars, score:wins[0], scoreLabel:'Your wins', res, vs, again:beginMatch, menu:startScreen});
        } else { if (wins[0] !== wins[1]) api.confetti(50); k.ui.end({icon:wins[0] === wins[1] ? '🤝' : '🏆', title:head, vs, again:beginMatch, menu:startScreen}); }
      }
      // --- computer: easy / medium (rules) / hard (small alpha-beta search); its disc wanders over the columns while it thinks ---
      function maybeAI(){
        if (!(opt.players === 1 && turn === 1 && state === 'play')) return;
        aiHov.on = true; aiHov.t = 0;
        k.after(650, () => { if (state !== 'play' || turn !== 1 || falling) return; const c = aiMove(); aiHov.tgt = c; aiHov.lock = true;
          k.after(380, () => { aiHov.lock = false; if (state === 'play' && turn === 1 && !falling) drop(c); }); });
      }
      const legal = b => { const m = []; for (const c of [3, 2, 4, 1, 5, 0, 6]) if (b[c].length < ROWS) m.push(c); return m; };
      function winsWith(b, c, who){ if (b[c].length >= ROWS) return false; b[c].push(who); const w = !!fourAt(b, c, b[c].length - 1); b[c].pop(); return w; }
      function scoreBoard(b){
        let s = 0; const cell = (c, r) => at(b, c, r);
        for (let r = 0; r < ROWS; r++) if (b[3][r] === 1) s += 3; else if (b[3][r] === 0) s -= 3;
        for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) for (const [dc, dr] of [[1,0],[0,1],[1,1],[1,-1]]){
          const ec = c + dc * 3, er = r + dr * 3; if (ec < 0 || ec >= COLS || er < 0 || er >= ROWS) continue;
          let a = 0, h = 0; for (let i = 0; i < 4; i++){ const v = cell(c + dc * i, r + dr * i); if (v === 1) a++; else if (v === 0) h++; }
          if (a && h) continue; if (a === 3) s += 12; else if (a === 2) s += 3; if (h === 3) s -= 14; else if (h === 2) s -= 3;
        }
        return s;
      }
      function ab(b, depth, alpha, beta, who){
        const ms = legal(b); if (!ms.length) return 0;
        if (depth === 0) return scoreBoard(b);
        let best = who === 1 ? -1e9 : 1e9;
        for (const c of ms){
          b[c].push(who); const won = !!fourAt(b, c, b[c].length - 1);
          const v = won ? (who === 1 ? 100000 + depth : -100000 - depth) : ab(b, depth - 1, alpha, beta, 1 - who); b[c].pop();
          if (who === 1){ if (v > best) best = v; if (best > alpha) alpha = best; } else { if (v < best) best = v; if (best < beta) beta = best; }
          if (alpha >= beta) break;
        }
        return best;
      }
      function aiMove(){
        const b = g.map(col => col.slice()), ms = legal(b), L = opt.level, rand = a => a[Math.floor(Math.random() * a.length)];
        const win = ms.find(c => winsWith(b, c, 1)), block = ms.find(c => winsWith(b, c, 0));
        if (L === 'easy'){ if (win != null && Math.random() < 0.7) return win; if (block != null && Math.random() < 0.45) return block; return Math.random() < 0.4 ? ms[0] : rand(ms); }
        if (win != null) return win; if (block != null) return block;
        if (L === 'medium'){
          const safe = ms.filter(c => { b[c].push(1); const bad = legal(b).some(c2 => winsWith(b, c2, 0)); b[c].pop(); return !bad; });
          const pool = safe.length ? safe : ms; return Math.random() < 0.55 ? pool[0] : rand(pool);
        }
        let best = -1e9, bc = ms[0];
        for (const c of ms){ b[c].push(1); const v = ab(b, 4, -1e9, 1e9, 0) + (Math.random() - 0.5); b[c].pop(); if (v > best){ best = v; bc = c; } }
        return bc;
      }
      // --- layout and cached art ---
      let G = {}, bg = null, frame = null, discS = [], hole = 0;
      const cellXY = (c, r) => ({x:G.x + (c + 0.5) * G.cs, y:G.y + (ROWS - 1 - r + 0.5) * G.cs});
      const winMid = () => { let sx = 0, sy = 0; winCells.forEach(([c, r]) => { const p = cellXY(c, r); sx += p.x; sy += p.y; }); return {x:sx / winCells.length, y:sy / winCells.length}; };
      function build(){
        const W = k.W, H = k.H, d = k.d, cs = G.cs, fw = cs * COLS + cs * 0.5, fh = cs * ROWS + cs * 0.5, fx = G.x - cs * 0.25, fy = G.y - cs * 0.25;
        hole = cs * 0.39;
        // room: wall, lamp glow, wooden table
        let [c, x] = mkCanvas(W, H, d); bg = c;
        let gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1e3a5f'); gr.addColorStop(1, '#0c1c33'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
        x.fillStyle = 'rgba(255,255,255,.035)'; for (let i = 0; i < W; i += 46){ x.fillRect(i, 0, 18, H); }
        gr = x.createRadialGradient(W / 2, fy + fh * 0.35, 20, W / 2, fy + fh * 0.4, Math.max(W, H) * 0.7); gr.addColorStop(0, 'rgba(255,214,150,.30)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
        const ty = G.tableY; wood(x, 0, ty, W, H - ty, '#8a5a34', '#4a2c16', 'rgba(30,14,4,A)', 5, false);
        x.fillStyle = 'rgba(255,225,180,.35)'; x.fillRect(0, ty, W, 2); gr = x.createLinearGradient(0, ty, 0, ty + 30); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, ty, W, 30);
        // the stand's shadow on the wall and on the table, and the dark slot behind the holes
        soft(x, d, 26, 'rgba(0,0,0,.5)', () => rrPath(x, fx + 14, fy + 18, fw, fh, cs * 0.3)); soft(x, d, 16, 'rgba(0,0,0,.55)', () => { x.beginPath(); x.ellipse(W / 2, ty + 10, fw * 0.62, 12, 0, 0, 7); });
        x.fillStyle = 'rgba(4,12,30,.28)'; rrPath(x, fx + cs * 0.12, fy + cs * 0.12, fw - cs * 0.24, fh - cs * 0.24, cs * 0.2); x.fill();
        // the plastic stand with holes
        [c, x] = mkCanvas(W, H, d); frame = c;
        const shape = () => { rrPath(x, fx, fy, fw, fh, cs * 0.3); for (let cc = 0; cc < COLS; cc++) for (let r = 0; r < ROWS; r++){ const p = cellXY(cc, r); x.moveTo(p.x + hole, p.y); x.arc(p.x, p.y, hole, 0, Math.PI * 2, true); } };
        // feet
        for (const s of [-1, 1]){ const lx = s < 0 ? fx - cs * 0.05 : fx + fw + cs * 0.05; x.fillStyle = '#163f9c'; x.beginPath(); x.moveTo(lx, fy + fh * 0.55); x.lineTo(lx + s * cs * 0.18, ty + 6); x.lineTo(lx - s * cs * 0.55, ty + 6); x.lineTo(lx - s * cs * 0.3, fy + fh * 0.55); x.fill(); gr = x.createLinearGradient(lx - cs * 0.6, 0, lx + cs * 0.6, 0); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(0,0,0,.2)'); x.fillStyle = gr; x.fill(); }
        x.save(); shape(); gr = x.createLinearGradient(0, fy, 0, fy + fh); gr.addColorStop(0, '#3b82f6'); gr.addColorStop(0.5, '#2563eb'); gr.addColorStop(1, '#1d4ed8'); x.fillStyle = gr; x.fill('evenodd');
        x.clip('evenodd');
        gr = x.createLinearGradient(fx, fy, fx + fw * 0.6, fy + fh); gr.addColorStop(0, 'rgba(255,255,255,.28)'); gr.addColorStop(0.35, 'rgba(255,255,255,.06)'); gr.addColorStop(0.36, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(fx, fy, fw, fh);
        // each hole: a dark inner lip at the top, a bright rim at the bottom
        for (let cc = 0; cc < COLS; cc++) for (let r = 0; r < ROWS; r++){ const p = cellXY(cc, r);
          const lg = x.createLinearGradient(p.x - hole, p.y - hole, p.x + hole, p.y + hole); lg.addColorStop(0, 'rgba(8,20,60,.85)'); lg.addColorStop(0.5, 'rgba(20,40,110,.2)'); lg.addColorStop(1, 'rgba(190,220,255,.9)');
          x.strokeStyle = lg; x.lineWidth = cs * 0.07; x.beginPath(); x.arc(p.x, p.y, hole + cs * 0.025, 0, 7); x.stroke();
          x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1.5; x.beginPath(); x.arc(p.x, p.y, hole + cs * 0.085, Math.PI * 1.05, Math.PI * 1.6); x.stroke(); }
        x.restore();
        rrPath(x, fx + 1.5, fy + 1.5, fw - 3, fh - 3, cs * 0.28); x.strokeStyle = 'rgba(191,219,254,.75)'; x.lineWidth = 2; x.stroke();
        rrPath(x, fx, fy, fw, fh, cs * 0.3); x.strokeStyle = '#173a8a'; x.lineWidth = 2; x.stroke();
        // disc sprites
        discS = [0, 1].map(who => discSprite(who, cs));
      }
      function discSprite(who, cs){
        const s = cs, [c, x] = mkCanvas(s, s, k.d), o = s / 2, r = cs * 0.385, T = DC[who];
        let gr = x.createRadialGradient(o - r * 0.3, o - r * 0.35, r * 0.1, o, o, r); gr.addColorStop(0, T.l); gr.addColorStop(0.45, T.c); gr.addColorStop(1, T.d);
        x.fillStyle = gr; x.beginPath(); x.arc(o, o, r, 0, 7); x.fill();
        for (const [f, a, w] of [[0.86, 'rgba(0,0,0,.22)', 0.07], [0.8, 'rgba(255,255,255,.25)', 0.03], [0.6, 'rgba(0,0,0,.16)', 0.05], [0.55, 'rgba(255,255,255,.2)', 0.025]]){ x.strokeStyle = a; x.lineWidth = r * w * 2; x.beginPath(); x.arc(o, o, r * f, 0, 7); x.stroke(); }
        if (who === 0 && opt.players === 1 && api.avatar){ x.globalAlpha = 0.9; x.font = `${Math.round(r * 0.75)}px ${EF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#000'; x.fillText(api.avatar, o, o + r * 0.05); x.globalAlpha = 1; }
        gr = x.createLinearGradient(0, o - r, 0, o); gr.addColorStop(0, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.ellipse(o - r * 0.08, o - r * 0.5, r * 0.6, r * 0.3, -0.2, 0, 7); x.fill();
        return c;
      }
      const layout = () => { const top = 66, cs = Math.min((k.W - 30) / (COLS + 0.6), (k.H - top - 28) / (ROWS + 1.75)); const gh = cs * (ROWS + 1.75), y0 = top + Math.max(0, (k.H - top - 28 - gh) / 2);
        G = {cs, x:(k.W - cs * COLS) / 2, y:y0 + cs * 1.15}; G.tableY = G.y + cs * ROWS + cs * 0.25 + Math.min(26, (k.H - (G.y + cs * ROWS)) * 0.5); build(); };
      k.onResize = layout; layout();
      const colAt = p => { const c = Math.floor((p.x - G.x) / G.cs); return c >= 0 && c < COLS && p.y > G.y - G.cs * 1.4 ? c : -1; };
      const human = () => state === 'play' && !falling && (opt.players === 2 || turn === 0);
      let down = false;
      k.on(k.cv, 'pointerdown', e => { if (!human()) return; down = true; hoverCol = colAt(k.pt(e)); });
      k.on(k.cv, 'pointermove', e => { if (human()) hoverCol = colAt(k.pt(e)); });
      k.on(k.cv, 'pointerup', e => { if (!down) return; down = false; if (!human()) return; const c = colAt(k.pt(e)); if (c >= 0) drop(c); });
      k.on(k.cv, 'pointercancel', () => { down = false; });
      k.on(k.cv, 'pointerleave', () => { if (!down) hoverCol = -1; });
      el._st = () => state;
      el._test = () => { const r = k.cv.getBoundingClientRect(); return human() ? legal(g).map(c => ({col:c, x:r.left + G.x + (c + 0.5) * G.cs, y:r.top + G.y + G.cs * 2})) : []; };
      function disc(x, y, who, sx, sy, alpha){ const s = G.cs; cx.globalAlpha = alpha == null ? 1 : alpha; cx.drawImage(discS[who], x - s * sx / 2, y - s * sy / 2 + (1 - sy) * s * 0.35, s * sx, s * sy); cx.globalAlpha = 1; }
      function update(dt){
        if (falling){ const f = falling; f.v += dt * 42; f.y += f.v * dt; const target = ROWS - 1 - f.r;
          if (f.y >= target){
            if (f.bounce === 0){ const p = cellXY(f.c, f.r); J.burst(p.x, p.y + G.cs * 0.3, 7, ['#fff', DC[f.who].l], 'spark', 140, 0.4); J.shake(2.5); f.hit = k.now; }
            if (f.bounce < 1 && f.v > 6){ f.y = target; f.v = -f.v * 0.26; f.bounce++; } else { f.y = target; landed(); } } }
        if (aiHov.on){ aiHov.t += dt; if (!aiHov.lock && aiHov.t > 0.22){ aiHov.t = 0; const ok = legal(g); aiHov.tgt = ok[Math.floor(Math.random() * ok.length)]; } aiHov.x = lerp(aiHov.x, aiHov.tgt, 1 - Math.exp(-dt * 9)); }
        J.update(dt);
      }
      function draw(){
        const [ox, oy] = J.offset(); cx.save(); cx.translate(ox, oy);
        cx.drawImage(bg, -3, -3, k.W + 6, k.H + 6);
        if (state !== 'menu'){
          // the disc waiting above the board
          const hy = G.y - G.cs * 0.85 + (RM ? 0 : Math.sin(k.now * 4) * 3);
          if (human() && hoverCol >= 0 && g[hoverCol].length < ROWS){ const p = cellXY(hoverCol, 0);
            const gl = cx.createLinearGradient(0, G.y - G.cs * 0.3, 0, G.y + G.cs * ROWS); gl.addColorStop(0, 'rgba(255,255,255,.16)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = gl; cx.fillRect(p.x - G.cs / 2, G.y - G.cs * 0.25, G.cs, G.cs * (ROWS + 0.2));
            disc(p.x, hy, turn, 1, 1); }
          if (aiHov.on && !falling && state === 'play'){ disc(G.x + (aiHov.x + 0.5) * G.cs, hy, 1, 1, 1, 0.92); }
          for (let c = 0; c < COLS; c++) for (let r = 0; r < g[c].length; r++){ const p = cellXY(c, r), a = k.now - (land[c][r] || -9); let sx = 1, sy = 1; if (a < 0.3 && !RM){ const w = Math.sin(a / 0.3 * Math.PI) * (1 - a / 0.3); sx = 1 + 0.12 * w; sy = 1 - 0.12 * w; } disc(p.x, p.y, g[c][r], sx, sy); }
          if (falling){ const f = falling, p = {x:G.x + (f.c + 0.5) * G.cs, y:G.y + (f.y + 0.5) * G.cs}; let sx = 1, sy = 1; if (f.hit != null && !RM){ const a = k.now - f.hit; if (a < 0.2){ const w = Math.sin(a / 0.2 * Math.PI); sx = 1 + 0.14 * w; sy = 1 - 0.14 * w; } } else if (!RM){ sy = 1 + Math.min(0.12, f.v * 0.008); sx = 1 / sy; } disc(p.x, p.y, f.who, sx, sy); }
        }
        cx.drawImage(frame, -3, -3, k.W + 6, k.H + 6);
        if (state !== 'menu'){
          if (human() && hoverCol >= 0 && g[hoverCol].length < ROWS){ const p = cellXY(hoverCol, 0), b = RM ? 0 : Math.sin(k.now * 6) * 4, ay = G.y - G.cs * 0.25 + b; cx.fillStyle = 'rgba(255,255,255,.9)'; cx.beginPath(); cx.moveTo(p.x - 10, ay - 10); cx.lineTo(p.x + 10, ay - 10); cx.lineTo(p.x, ay); cx.fill(); }
          if (winCells){ const t = k.now - winT, pu = RM ? 1 : 0.6 + 0.4 * Math.sin(t * 8);
            const pts = winCells.map(([c, r]) => cellXY(c, r)).sort((a, b) => a.x - b.x || a.y - b.y), e = eOut(clamp(t / 0.45, 0, 1));
            cx.save(); cx.lineCap = 'round'; cx.shadowColor = 'rgba(253,224,71,1)'; cx.shadowBlur = 24;
            for (const p of pts){ cx.strokeStyle = `rgba(255,236,120,${0.95 * pu})`; cx.lineWidth = G.cs * 0.08; cx.beginPath(); cx.arc(p.x, p.y, hole + G.cs * 0.03, 0, 7); cx.stroke(); }
            const a = pts[0], b = pts[pts.length - 1]; cx.strokeStyle = 'rgba(255,248,200,.9)'; cx.lineWidth = G.cs * 0.09; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(lerp(a.x, b.x, e), lerp(a.y, b.y, e)); cx.stroke(); cx.restore(); }
        }
        J.draw(cx);
        cx.restore();
        if (state !== 'menu') hud();
        J.overlay(cx, k.W, k.H);
      }
      function hud(){
        const [a, b] = names(), sz = k.W < 620 ? 18 : 22, thinking = state === 'play' && opt.players === 1 && turn === 1;
        const turnName = opt.players === 1 ? (turn === 0 ? 'You' : 'Computer') : names()[turn];
        const tp = k.pill(state === 'play' ? 'Turn' : 'Game', state === 'play' ? (thinking ? '🤖 Thinking' : turnName) : 'Done', 12, 10, 'left', state === 'play' ? DC[turn].c : null, sz, thinking ? 30 : 0);
        if (thinking) dots(cx, tp.x + tp.w - sz * 0.7 - 24, tp.y + tp.h * 0.7, k.now, '#fde047');
        k.pill('Match · best of 3', (opt.players === 1 ? 'You ' : a.slice(0, 8) + ' ') + wins[0] + ' – ' + wins[1] + (opt.players === 1 ? ' 🤖' : ' ' + b.slice(0, 8)), k.W / 2, 10, 'center', null, sz);
        k.pill('Game', Math.max(1, Math.min(games + (state === 'play' ? 1 : 0), 3)) + ' / 3', k.W - 12, 10, 'right', null, sz);
      }
      k.frame(dt => { update(dt); draw(); });
      startScreen();
      return () => { delete el._test; delete el._st; k.cleanup(); };
    }
  };
})();
