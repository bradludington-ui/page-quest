// Brain Break game: joust. Self-contained: canvas + DOM overlay, no images or libraries.
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
        if (t.pill){ const w = x.measureText(t.s).width + sz * 0.9, h = sz * 1.35; rrPath(x, px - w / 2, py - h / 2, w, h, h / 2); x.fillStyle = 'rgba(15,23,42,.62)'; x.fill(); x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 1.5; x.stroke(); }
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
  // Jousting: two knights charge down the tilt fence. Hold to gallop faster (more power, wobblier aim),
  // and slide your finger up or down (or tap a target) to aim high, middle or low. Your shield covers
  // the height you aim at, so aim where the other knight is NOT. 1 player vs the computer, or 2 players.
  // Drawn as a sunny tournament ground: a castle, a tall grandstand, a raked sand lists; the scene is
  // scaled to fill the play area in both orientations (the grandstand rises taller in portrait).
  window.BreakGames.joust = {
    start(el, api){
      const RM = !!api.reducedMotion;
      const LW = 1000, LH = 700;
      const BASE = [430, 565];                       // ground line (hooves) of each lane: left rides behind the fence
      const ZONE = [-160, -124, -92];                // high (head), mid (shield), low (body), from the hooves
      const ZNAME = ['High', 'Middle', 'Low'];
      const START = [120, 880], MEET = 150, WIN_PTS = 5, PASSES = 5, POWER = 0.55;
      const TEAM = [{c: '#2f6fd6', d: '#1d4a99', l: '#9cc3ff'}, {c: '#d63a3a', d: '#962222', l: '#ffb0a8'}];

      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.style.overflow = 'hidden';
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.appendChild(cv);
      const cx = cv.getContext('2d');
      const ui = bbUI(el, api), J = juice(api);

      let W = 0, H = 0, S = 110, D = 1, sc = 1, ox = 0, oy = 0, raf = 0, last = 0, alive = true, now = 0;
      let bgC = null, fenceC = null, cloudC = null;
      const timers = new Set();
      const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms); timers.add(t); };
      // fit the action (x 60..940, y 40..680 of the 1000x700 world) above a strip of sand that holds the aim targets and
      // the speed meter, so the controls never sit on a knight; whatever is left above becomes sky, castle and grandstand
      const size = () => {
        const r = el.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = Math.max(1, r.width); H = Math.max(1, r.height); D = dpr;
        cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
        S = clamp(H*0.15, 100, 132); sc = Math.min(W/880, (H - S)/640); ox = W/2 - 500*sc; oy = H - S - 680*sc;
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildScene();
      };
      const ro = window.ResizeObserver ? new ResizeObserver(() => { const r = el.getBoundingClientRect(); if (Math.abs(r.width - W) > 0.5 || Math.abs(r.height - H) > 0.5) size(); }) : null;

      // ---- crowd (fixed random look): the front rows cheer, the rows behind are painted once ----
      const crowd = [], backCrowd = [];
      const CROWD_COLS = ['#e8b04a', '#d9534f', '#5b8def', '#7cc576', '#b07cd8', '#f08a5d', '#f4d35e', '#6cc4d8'], SKIN = ['#f1c9a0', '#d9a679', '#a8724a', '#f6d7b8', '#7a4b2c'];
      { let s = 7; const rnd = () => (s = (s*16807) % 2147483647)/2147483647;
        for (let row = 0; row < 4; row++) for (let i = 0; i < 36; i++) crowd.push({x: 4 + i*28.5 + (row % 2)*14 + rnd()*6, y: 228 + row*26, c: CROWD_COLS[Math.floor(rnd()*8)], k: SKIN[Math.floor(rnd()*5)], ph: rnd()*6.28, fl: rnd() < 0.12});
        for (let row = 1; row <= 16; row++) for (let i = 0; i < 38; i++) backCrowd.push({x: -20 + i*28.5 + (row % 2)*14 + rnd()*6, y: 228 - row*24, c: CROWD_COLS[Math.floor(rnd()*8)], k: SKIN[Math.floor(rnd()*5)]}); }

      // ---- state ----
      let mode = 'menu', players = 1, level = api.grade >= 5 ? 'normal' : 'easy';
      let score = [0, 0], pass = 0, phase = 'ready', pt = 0, endWhy = '';
      const mkK = side => ({side, x: START[side], aim: 1, sp: 0.25, hold: 0, gait: 0, lance: 1, on: true, fall: null, done: false, dust: 0, rear: 0});
      const K = [mkK(0), mkK(1)];
      const ai = {target: 0.5, decided: false};
      const ptrs = new Map();                        // pointerId -> side
      el._jo = () => ({mode, phase, score: score.slice(), pass, players, K: K.map(k => ({x: k.x, aim: k.aim, sp: k.sp, on: k.on})), targets: [0, 1].map(s => [0, 1, 2].map(z => tgt(s, z)))});

      // ---- start / end screens (the shared Brain Break cards) ----
      const menu = () => {
        mode = 'menu'; ptrs.clear();
        ui.title({icon: '🐴', name: 'Jousting', howIcon: '✋', how: 'Hold to gallop. Tap or slide along High · Middle · Low to aim. Hit where their shield isn’t!', bestUnit: 'pts',
          mode: {value: players, onChange: v => { players = v; menu(); }},
          groups: players === 1 ? [{label: 'Computer', value: level, options: [{label: 'Easy', value: 'easy'}, {label: 'Tricky', value: 'normal'}], onChange: v => { level = v; }}] : [{label: 'Left side: blue knight · Right side: red knight', value: 0, options: []}],
          onPlay: begin});
      };
      const begin = () => {
        ui.hide(); mode = 'play'; score = [0, 0]; pass = 0; J.P.length = 0; J.T.length = 0; ptrs.clear();
        newPass();
      };
      const newPass = () => {
        pass++; phase = 'ready'; pt = 0;
        for (let s = 0; s < 2; s++) { const keep = K[s].aim; K[s] = mkK(s); K[s].aim = keep; }
        ai.decided = false; ai.target = level === 'easy' ? 0.3 + Math.random()*0.32 : 0.45 + Math.random()*0.4;
        if (players === 1) K[1].aim = Math.floor(Math.random()*3);
        for (const [id, s] of ptrs) K[s].hold++;
        J.text(`Pass ${pass} of ${PASSES}`, LW/2, 255, {size: 44, col: '#ffffff', life: 1.6, pill: true});
      };
      const finish = winner => {
        mode = 'over'; ptrs.clear();
        const vs = [{text: (players === 1 ? 'You ' : 'Blue ') + score[0], color: TEAM[0].l}, {text: score[1] + (players === 1 ? ' Computer' : ' Red'), color: TEAM[1].l}];
        if (players === 1) {
          const won = winner === 0, pts = score[0] + (won ? 5 : 0);
          // the shell throws confetti for any new best; it is held back unless the child won the joust
          const r = saveQuiet(api, pts, won);
          if (won && !r.isBest) api.confetti(40);
          const stars = won ? (endWhy.indexOf('knocked the computer off') >= 0 || score[0] - score[1] >= 3 ? 3 : 2) : winner < 0 || score[0] >= 2 ? 1 : 0;
          ui.end({icon: won ? '🏆' : winner === 1 ? '🐴' : '🤝', title: won ? 'You win the joust!' : winner === 1 ? 'The computer wins!' : "It's a tie!", sub: endWhy, vs, stars, score: pts, scoreLabel: 'Points', res: r,
            line: won ? `${score[0]} for hits + 5 for winning` : '', again: begin, menu});
        } else {
          if (winner >= 0) api.confetti(40);
          ui.end({icon: winner < 0 ? '🤝' : '🏆', title: winner < 0 ? "It's a tie!" : `${winner ? 'Red' : 'Blue'} knight wins!`, sub: endWhy, vs, again: begin, menu});
        }
      };

      // ---- controls: a row of three targets in the sand strip under the lists (one row per player), never over a knight ----
      const ctlGeo = side => {
        const r = clamp((S - 34)/2, 28, 40), gap = 12, gw = r*6 + gap*2;
        const half = players === 1 ? W : W/2, x0 = players === 1 ? (W - gw)/2 : side*W/2 + (half - gw)/2;
        return {r, gap, gw, x0, y: H - S + 8 + r};
      };
      function tgt(side, z){
        const g = ctlGeo(side), zz = side && players === 2 ? 2 - z : z;  // the right player's row mirrors, High nearest the edge
        return {x: g.x0 + g.r + zz*(g.r*2 + g.gap), y: g.y, r: g.r};
      }
      const inCtl = (side, p) => { const g = ctlGeo(side); return p.y > H - S - 6 && p.x > g.x0 - g.r && p.x < g.x0 + g.gw + g.r; };
      const sideOf = x => players === 1 ? 0 : (x < W/2 ? 0 : 1);
      // a finger on (or sliding along) the target row picks the height; holding anywhere else just gallops
      const aimFrom = (side, p, cur) => {
        if (!inCtl(side, p)) return cur;
        let best = cur, bd = 1e9;
        for (let z = 0; z < 3; z++) { const d = Math.abs(tgt(side, z).x - p.x); if (d < bd) { bd = d; best = z; } }
        return best;
      };
      const local = e => { const r = cv.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
      const canSteer = () => mode === 'play' && (phase === 'ready' || phase === 'charge');
      const down = e => {
        if (mode !== 'play') return;
        e.preventDefault();
        const p = local(e), s = sideOf(p.x);
        ptrs.set(e.pointerId, s); K[s].hold++;
        try { cv.setPointerCapture(e.pointerId); } catch (_) {}
        if (canSteer()) K[s].aim = aimFrom(s, p, K[s].aim);
      };
      const move = e => {
        if (!ptrs.has(e.pointerId)) return;
        const s = ptrs.get(e.pointerId);
        if (canSteer()) K[s].aim = aimFrom(s, local(e), K[s].aim);
      };
      const up = e => {
        if (!ptrs.has(e.pointerId)) return;
        const s = ptrs.get(e.pointerId); ptrs.delete(e.pointerId);
        K[s].hold = Math.max(0, K[s].hold - 1);
      };
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      window.addEventListener('resize', size);

      // ---- the joust ----
      const vel = k => 60 + 175*k.sp;
      const missChance = (k, s) => 0.06 + 0.34*k.sp*k.sp + (s === 1 && players === 1 && level === 'easy' ? 0.1 : 0);
      // where a HUD score pill sits, in world coordinates (score pop-ups fly there)
      const hudWorld = s => ({x: (W/2 + (s ? 1 : -1)*Math.min(150, W*0.2) - ox)/sc, y: (34 - oy)/sc});
      const impact = () => {
        phase = 'after'; pt = 0;
        const res = [0, 1].map(s => {
          const a = K[s], d = K[1 - s];
          if (Math.random() < missChance(a, s)) return 'miss';
          if (a.aim === d.aim) return 'break';         // the shield takes it
          return a.sp >= POWER ? 'unhorse' : 'break';
        });
        // two knights cannot both fly: the faster rider stays in the saddle
        if (res[0] === 'unhorse' && res[1] === 'unhorse') {
          if (Math.abs(K[0].sp - K[1].sp) < 0.03) { res[0] = res[1] = 'break'; }
          else if (K[0].sp > K[1].sp) res[1] = 'break'; else res[0] = 'break';
        }
        const mid = (K[0].x + K[1].x)/2;
        let unhorsed = -1, hits = 0;
        for (let s = 0; s < 2; s++) {
          const a = K[s], d = K[1 - s], r = res[s], lx = s ? 690 : 310;
          const tipY = BASE[1 - s] + ZONE[a.aim];
          if (r === 'miss') { J.text('Miss!', lx, 300, {size: 40, col: '#ffffff', life: 1.5}); continue; }
          a.lance = 0; hits++;
          J.burst(mid + (s ? -20 : 20), tipY, 14, ['#e8c58a', '#b8935a', '#f4e4c1'], 'chip', 340, 1.1, 180);
          J.burst(mid, tipY, 18, ['#fff7c2', '#fde047', '#ffffff'], 'spark', 420, 0.5);
          if (r === 'break') { score[s] += 1; J.text('Lance broken!', lx, 290, {size: 36, col: TEAM[s].l, life: 1.6}); const h = hudWorld(s); J.text('+1', mid, tipY - 30, {size: 44, col: '#fde047', tx: h.x, ty: h.y, life: 1.3}); }
          else {
            score[s] += 3; unhorsed = 1 - s;
            J.text('Unhorsed!', lx, 280, {size: 54, col: '#ffe14d', life: 2.2}); const h = hudWorld(s); J.text('+3', mid, tipY - 30, {size: 54, col: '#fde047', tx: h.x, ty: h.y, life: 1.5});
            d.on = false; d.rear = 1;
            d.fall = {x: d.x, y: BASE[d.side] - 115, vx: d.side ? 150 : -150, vy: -330, r: 0, vr: d.side ? 5 : -5, land: 640, landed: false, t: 0};
          }
        }
        if (hits) { J.pause(unhorsed >= 0 ? 0.16 : 0.08); J.shake(unhorsed >= 0 ? 14 : 7); J.flash(unhorsed >= 0 ? 0.55 : 0.3, '#fff8e1'); }
        el.dataset.score = score.join('-');
        if (unhorsed >= 0) { endWhy = (players === 1 ? (unhorsed ? 'You knocked the computer off' : 'You were knocked off') : `${unhorsed ? 'Red' : 'Blue'} knight knocked off`) + ` in pass ${pass}`; later(() => finish(1 - unhorsed), 2600); return; }
        const done = score[0] >= WIN_PTS || score[1] >= WIN_PTS || pass >= PASSES;
        later(() => {
          if (mode !== 'play') return;
          if (done) {
            endWhy = score[0] >= WIN_PTS || score[1] >= WIN_PTS ? `First to ${WIN_PTS} points` : `After ${PASSES} passes`;
            finish(score[0] === score[1] ? -1 : score[0] > score[1] ? 0 : 1);
          } else newPass();
        }, 2300);
      };
      const thinkAI = dt => {
        const k = K[1];
        k.sp += (k.sp < ai.target ? 0.6 : -0.3)*dt; k.sp = Math.max(0.25, Math.min(1, k.sp));
        const prog = (START[1] - START[0] - (k.x - K[0].x))/(START[1] - START[0] - MEET);
        if (!ai.decided && prog > 0.62) {
          ai.decided = true;
          const r = Math.random(), copy = level === 'easy' ? 0.22 : 0.5;
          if (r < copy) k.aim = K[0].aim;               // read your lance and raise the shield there
          else if (r < copy + 0.25) k.aim = Math.floor(Math.random()*3);
        }
      };
      const update = dt => {
        J.update(dt);
        for (const k of K) {
          if (k.rear > 0) k.rear = Math.max(0, k.rear - dt*1.2);
          if (k.fall) {
            const f = k.fall; f.t += dt;
            if (!f.landed) { f.vy += 900*dt; f.x += f.vx*dt; f.y += f.vy*dt; f.r += f.vr*dt; if (f.y >= f.land) { f.y = f.land; f.landed = true; f.r = Math.PI/2*Math.sign(f.vr); J.burst(f.x, f.land + 20, 14, '#e6cf98', 'dust', 160, 0.9); J.shake(8); J.text('Oof!', f.x, f.land - 70, {size: 40, col: '#ffffff', life: 1.6}); } }
          }
        }
        if (mode !== 'play') return;
        pt += dt;
        if (phase === 'ready') {
          if (pt > 1.6) { phase = 'charge'; pt = 0; J.text('Charge!', LW/2, 255, {size: 56, col: '#ffe14d', life: 1.0, pill: true}); }
        } else if (phase === 'charge') {
          for (let s = 0; s < 2; s++) {
            const k = K[s];
            if (s === 1 && players === 1) continue;
            k.sp += (k.hold ? 0.75 : -0.22)*dt; k.sp = Math.max(0.25, Math.min(1, k.sp));
          }
          if (players === 1) thinkAI(dt);
          K[0].x += vel(K[0])*dt; K[1].x -= vel(K[1])*dt;
          if (K[1].x - K[0].x <= MEET) impact();
        } else if (phase === 'after') {
          for (let s = 0; s < 2; s++) { const k = K[s]; const v = Math.max(80, vel(k)*0.8); k.x += (s ? -v : v)*dt; }
        }
        for (const k of K) {
          k.gait += (phase === 'ready' ? 1.5 : vel(k)*0.06)*dt;
          // hooves kick up sand while galloping
          if (phase !== 'ready' && !RM) { k.dust += dt*vel(k)*0.09; while (k.dust > 1) { k.dust--; const dir = k.side ? 1 : -1; J.add({x: k.x + dir*(30 + Math.random()*40), y: BASE[k.side] - 4, vx: dir*(30 + Math.random()*60), vy: -20 - Math.random()*40, g: 40, r: 3 + Math.random()*4, kind: 'dust', col: '#d9bd85', life: 0.6 + Math.random()*0.4, drag: 2}); } }
        }
      };

      // ---- drawing ----
      const text = (s, x, y, size, color, align) => {
        cx.font = `800 ${size}px ${HF}`; cx.textAlign = align || 'center'; cx.textBaseline = 'middle';
        cx.lineWidth = Math.max(3, size*0.16); cx.strokeStyle = 'rgba(15,23,42,.8)'; cx.lineJoin = 'round'; cx.strokeText(s, x, y);
        cx.fillStyle = color; cx.fillText(s, x, y);
      };
      // everything that never moves is painted once per size into bgC (behind the near knight) and fenceC (the tilt)
      function buildScene(){
        let x; [bgC, x] = mkCanvas(W, H, D);
        // sky in screen space, so it always reaches the top
        let g = x.createLinearGradient(0, 0, 0, Math.max(1, oy + 350*sc)); g.addColorStop(0, '#3d8fd8'); g.addColorStop(0.6, '#8fcdf5'); g.addColorStop(1, '#d6eefc');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        g = x.createRadialGradient(W*0.78, oy - 40*sc, 10, W*0.78, oy - 40*sc, 320*sc); g.addColorStop(0, 'rgba(255,250,220,.9)'); g.addColorStop(0.15, 'rgba(255,245,200,.45)'); g.addColorStop(1, 'rgba(255,245,200,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.save(); x.translate(ox, oy); x.scale(sc, sc);
        const top = -oy/sc - 10, L = -ox/sc - 10, R = (W - ox)/sc + 10;
        // far hills and the castle
        x.fillStyle = '#b5d6c0'; x.beginPath(); x.moveTo(L, 120); for (let i = L; i <= R; i += 40) x.lineTo(i, 40 + Math.sin(i*0.004 + 1)*30 + Math.sin(i*0.013)*12); x.lineTo(R, 120); x.fill();
        x.fillStyle = '#8fbf98'; x.beginPath(); x.moveTo(L, 120); for (let i = L; i <= R; i += 40) x.lineTo(i, 80 + Math.sin(i*0.006)*20 + Math.sin(i*0.019)*8); x.lineTo(R, 120); x.fill();
        const castle = (cx0, base, s) => {
          x.fillStyle = '#c4b49a'; x.fillRect(cx0 - 160*s, base - 90*s, 320*s, 90*s);
          for (let i = 0; i < 14; i++) x.fillRect(cx0 - 160*s + i*24*s, base - 102*s, 13*s, 12*s);
          for (const tx of [-170, -60, 60, 170]) { const h = tx === -60 || tx === 60 ? 190 : 140; x.fillStyle = '#b3a287'; x.fillRect(cx0 + (tx - 26)*s, base - h*s, 52*s, h*s); x.fillStyle = '#8d6e8f'; x.beginPath(); x.moveTo(cx0 + (tx - 32)*s, base - h*s); x.lineTo(cx0 + tx*s, base - (h + 60)*s); x.lineTo(cx0 + (tx + 32)*s, base - h*s); x.fill(); x.fillStyle = '#3b3346'; x.fillRect(cx0 + (tx - 6)*s, base - (h - 40)*s, 12*s, 22*s); }
          x.fillStyle = 'rgba(80,70,60,.18)'; x.fillRect(cx0 - 160*s, base - 30*s, 320*s, 30*s);
        };
        castle(500, 112, 0.85);
        // grandstand under a striped canopy; above it, sky and castle (much more of it in portrait)
        const standTop = Math.max(top, 110);
        x.fillStyle = '#7a4f2c'; x.fillRect(L, standTop, R - L, 360 - standTop);
        for (let y = standTop + 8; y < 340; y += 24) { x.fillStyle = 'rgba(0,0,0,.14)'; x.fillRect(L, y + 18, R - L, 4); x.fillStyle = 'rgba(255,220,170,.10)'; x.fillRect(L, y + 14, R - L, 3); }
        for (const p of backCrowd) { if (p.y < standTop + 14) continue; x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y + 12, 10, Math.PI, 0); x.fill(); x.fillStyle = p.k; x.beginPath(); x.arc(p.x, p.y, 7, 0, 7); x.fill(); }
        // the grandstand's roof: a striped canopy with scalloped edge
        if (standTop > top + 40) {
          const ry = standTop - 34;
          for (let i = 0, xx = L; xx < R; i++, xx += 40) { x.fillStyle = i % 2 ? '#f4efe6' : '#c7392f'; x.beginPath(); x.moveTo(xx, ry); x.lineTo(xx + 40, ry); x.lineTo(xx + 40, ry + 30); x.arc(xx + 20, ry + 30, 20, 0, Math.PI); x.fill(); }
          x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(L, ry + 28, R - L, 6);
          for (const px of [L + 30, 250, 500, 750, R - 30]) { x.fillStyle = '#6b4424'; x.fillRect(px - 5, ry, 10, standTop - ry + 360); }
        }
        // royal box with a crown banner in the middle of the stand
        x.fillStyle = '#6a2c8f'; x.fillRect(420, 150, 160, 70); x.fillStyle = '#f2c94c'; x.fillRect(420, 150, 160, 8); x.fillRect(420, 212, 160, 8);
        x.font = `40px ${EF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('👑', 500, 186);
        // hanging pennants and long banners in the two team colours
        x.fillStyle = '#a06a3a'; x.fillRect(L, 196, R - L, 8);
        for (let i = Math.floor(L/52); i*52 < R; i++) { x.fillStyle = (i & 1) ? TEAM[1].c : TEAM[0].c; x.beginPath(); x.moveTo(i*52 + 4, 204); x.lineTo(i*52 + 48, 204); x.lineTo(i*52 + 26, 236); x.fill(); x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.moveTo(i*52 + 4, 204); x.lineTo(i*52 + 26, 204); x.lineTo(i*52 + 26, 236); x.fill(); }
        for (const [bx, c] of [[200, TEAM[0]], [800, TEAM[1]]]) { x.fillStyle = c.c; x.beginPath(); x.moveTo(bx - 30, standTop - 4); x.lineTo(bx + 30, standTop - 4); x.lineTo(bx + 30, standTop + 66); x.lineTo(bx, standTop + 86); x.lineTo(bx - 30, standTop + 66); x.fill(); x.fillStyle = c.l; x.fillRect(bx - 30, standTop - 4, 60, 6); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(bx - 30, standTop - 4, 14, 72); x.font = `34px ${EF}`; x.fillText(c === TEAM[0] ? '🛡️' : '⚔️', bx, standTop + 36); }
        // front rail of the stand
        x.fillStyle = '#5a3a20'; x.fillRect(L, 335, R - L, 18);
        x.fillStyle = 'rgba(255,220,170,.25)'; x.fillRect(L, 335, R - L, 3);
        // the two towers at the ends of the lists
        for (const [tx, c] of [[40, TEAM[0].c], [960, TEAM[1].c]]) {
          g = x.createLinearGradient(tx - 30, 0, tx + 30, 0); g.addColorStop(0, '#cdbb9f'); g.addColorStop(1, '#988670'); x.fillStyle = g; x.fillRect(tx - 30, 110, 60, 243);
          x.fillStyle = '#a4917a'; for (let i = 0; i < 3; i++) x.fillRect(tx - 30 + i*24, 98, 14, 14);
          x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 2; for (let y = 125; y < 350; y += 18) { x.beginPath(); x.moveTo(tx - 30, y); x.lineTo(tx + 30, y); x.stroke(); }
          x.fillStyle = '#5a4a3a'; x.fillRect(tx - 1, 50, 3, 50);
        }
        // sand: warm gradient, raked lines and grit, a soft shadow under the stand
        g = x.createLinearGradient(0, 353, 0, 720); g.addColorStop(0, '#d9b877'); g.addColorStop(1, '#ecd29a'); x.fillStyle = g; x.fillRect(L, 353, R - L, 2000);
        g = x.createLinearGradient(0, 353, 0, 400); g.addColorStop(0, 'rgba(60,35,10,.35)'); g.addColorStop(1, 'rgba(60,35,10,0)'); x.fillStyle = g; x.fillRect(L, 353, R - L, 47);
        x.strokeStyle = 'rgba(150,110,60,.16)'; x.lineWidth = 3; for (let y = 372; y < 1100; y += 22) { x.beginPath(); for (let xx = L; xx <= R; xx += 30) x.lineTo(xx, y + Math.sin(xx*0.02 + y)*2); x.stroke(); }
        { let s = 3; const rr = () => (s = (s*16807) % 2147483647)/2147483647; for (let i = 0; i < 2000; i++) { x.fillStyle = rr() < 0.5 ? 'rgba(120,80,30,.18)' : 'rgba(255,245,215,.3)'; x.fillRect(L + rr()*(R - L), 360 + rr()*700, 2, 2); } }
        x.restore();
        // the near barrier: a low rail across the front, with the control strip of shaded sand in front of it
        { const ry = H - S - 2; let gg = x.createLinearGradient(0, ry, 0, H); gg.addColorStop(0, 'rgba(90,55,20,.28)'); gg.addColorStop(1, 'rgba(90,55,20,.12)'); x.fillStyle = gg; x.fillRect(0, ry, W, H - ry);
          gg = x.createLinearGradient(0, ry - 7, 0, ry + 7); gg.addColorStop(0, '#b07a44'); gg.addColorStop(1, '#6e4524'); x.fillStyle = gg; x.fillRect(0, ry - 7, W, 12); x.fillStyle = 'rgba(255,230,190,.45)'; x.fillRect(0, ry - 7, W, 2);
          for (let px = 20; px < W; px += 90) { x.fillStyle = '#5c3a1c'; x.fillRect(px - 4, ry - 12, 8, 20); x.fillStyle = '#d6a22a'; x.beginPath(); x.arc(px, ry - 13, 5, 0, 7); x.fill(); } }
        // the tilt fence, its own layer
        [fenceC, x] = mkCanvas(W, H, D); x.translate(ox, oy); x.scale(sc, sc);
        const y0 = 392, y1 = 462;
        x.fillStyle = 'rgba(60,35,10,.22)'; x.beginPath(); x.ellipse(500, y1 + 8, 480, 14, 0, 0, 7); x.fill();
        for (let px = 40; px <= LW - 40; px += 92) { g = x.createLinearGradient(px - 6, 0, px + 6, 0); g.addColorStop(0, '#a46e3c'); g.addColorStop(1, '#6e4524'); x.fillStyle = g; x.fillRect(px - 6, y0 - 8, 12, y1 - y0 + 8); x.fillStyle = '#d6a22a'; x.beginPath(); x.arc(px, y0 - 10, 7, 0, 7); x.fill(); }
        for (let px = 30, i = 0; px < LW - 30; px += 40, i++) { x.fillStyle = i % 2 ? '#f4f0e6' : '#d6a22a'; x.fillRect(px, y0, Math.min(40, LW - 30 - px), 18); }
        g = x.createLinearGradient(0, y0, 0, y0 + 18); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.22)'); x.fillStyle = g; x.fillRect(30, y0, LW - 60, 18);
        x.fillStyle = '#9c6a3a'; x.fillRect(30, y0 + 30, LW - 60, 12); x.fillStyle = 'rgba(255,230,190,.3)'; x.fillRect(30, y0 + 30, LW - 60, 3);
        x.fillStyle = '#7a4f2c'; x.fillRect(30, y0 + 52, LW - 60, 10);
        x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 2; x.strokeRect(30, y0, LW - 60, 18);
        // a soft cloud sprite
        [cloudC, x] = mkCanvas(220, 90, D);
        for (const [a, b, r] of [[60, 55, 32], [100, 42, 40], [145, 52, 34], [120, 62, 30], [80, 64, 26]]) { g = x.createRadialGradient(a, b - 8, 4, a, b, r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, 'rgba(255,255,255,.75)'); x.fillStyle = g; x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); }
      }
      const drawLive = () => {
        // drifting clouds (screen space, above the stand)
        const cw = 220*Math.max(0.6, sc), ch = 90*Math.max(0.6, sc), span = W + cw*2, skyH = Math.max(0, oy - 110*sc);
        for (let i = 0; i < 4; i++) { const cxp = ((i*span/4 + now*(8 + i*3)) % span) - cw, cyp = Math.min(skyH - ch*0.85, 14 + i*ch*0.6 + (i & 1)*34); if (skyH < ch*0.7) break; cx.globalAlpha = 0.85 - i*0.12; cx.drawImage(cloudC, cxp, cyp, cw*(1 - i*0.1), ch*(1 - i*0.1)); }
        cx.globalAlpha = 1;
        cx.save(); cx.translate(ox, oy); cx.scale(sc, sc);
        // front rows of the crowd cheer (jump when a lance breaks)
        const cheer = J.sh > 2 ? 6 : 0;
        for (const p of crowd) {
          const bob = RM ? 0 : Math.sin(now*3 + p.ph)*2 - (cheer ? Math.abs(Math.sin(now*14 + p.ph))*cheer : 0);
          cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y + 12 + bob, 10, Math.PI, 0); cx.fill();
          cx.fillStyle = p.k; cx.beginPath(); cx.arc(p.x, p.y + bob, 7, 0, 7); cx.fill();
          if (p.fl) { const w = RM ? 0 : Math.sin(now*6 + p.ph)*4; cx.strokeStyle = '#5a4a3a'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(p.x + 8, p.y + 8 + bob); cx.lineTo(p.x + 8, p.y - 18 + bob); cx.stroke(); cx.fillStyle = p.x < 500 ? TEAM[0].c : TEAM[1].c; cx.beginPath(); cx.moveTo(p.x + 9, p.y - 18 + bob); cx.lineTo(p.x + 24, p.y - 13 + bob + w*0.3); cx.lineTo(p.x + 9, p.y - 8 + bob); cx.fill(); }
        }
        // tower flags
        for (const [x, c] of [[40, TEAM[0].c], [960, TEAM[1].c]]) {
          const w = RM ? 0 : Math.sin(now*4 + x)*5;
          cx.fillStyle = c; cx.beginPath(); cx.moveTo(x + 2, 52); cx.quadraticCurveTo(x + 22, 58 + w, x + 42, 62 - w*0.3); cx.lineTo(x + 2, 76); cx.fill();
        }
        cx.restore();
      };
      const leg = (x, y, a, c) => {
        cx.strokeStyle = c; cx.lineWidth = 9; cx.lineCap = 'round';
        const kx = x + Math.sin(a)*22, ky = y + Math.cos(a)*22;
        const fx = kx + Math.sin(a*1.6 - 0.3)*24, fy = ky + Math.cos(a*1.6 - 0.3)*24;
        cx.beginPath(); cx.moveTo(x, y); cx.lineTo(kx, ky); cx.lineTo(fx, fy); cx.stroke();
        cx.fillStyle = '#2b1d12'; cx.beginPath(); cx.arc(fx, fy, 5.5, 0, 7); cx.fill();
      };
      const drawHorse = (k, base) => {
        const T = TEAM[k.side], dir = k.side ? -1 : 1, g = k.gait*6.28;
        const bob = Math.sin(g*2)*2;
        // ground shadow
        cx.fillStyle = 'rgba(70,40,10,.28)'; cx.beginPath(); cx.ellipse(k.x, base + 2, 78, 10, 0, 0, 7); cx.fill();
        cx.save(); cx.translate(k.x, base + bob); cx.scale(dir, 1);
        if (k.rear > 0) cx.rotate(-Math.sin(k.rear*Math.PI)*0.25);
        const hc = k.side ? '#ece6dc' : '#7a4a2a', hd = k.side ? '#c3baab' : '#5c351c', hl = k.side ? '#ffffff' : '#9a6440';
        // far legs
        leg(-38, -52, Math.sin(g + 1.6)*0.6, hd); leg(34, -52, Math.sin(g + 3.1)*0.6, hd);
        // tail
        cx.strokeStyle = hd; cx.lineWidth = 8; cx.beginPath(); cx.moveTo(-58, -70); cx.quadraticCurveTo(-82, -62 + Math.sin(g)*6, -76, -32); cx.stroke();
        // body with a highlight along the back
        cx.fillStyle = hc; cx.beginPath(); cx.ellipse(0, -72, 62, 26, 0, 0, 7); cx.fill();
        cx.fillStyle = hl; cx.globalAlpha = 0.45; cx.beginPath(); cx.ellipse(-4, -86, 48, 9, 0, 0, 7); cx.fill(); cx.globalAlpha = 1;
        // neck & head
        cx.fillStyle = hc; cx.beginPath(); cx.moveTo(38, -88); cx.lineTo(66, -128); cx.lineTo(86, -122); cx.lineTo(62, -70); cx.fill();
        cx.beginPath(); cx.ellipse(86, -122, 24, 12, 0.5, 0, 7); cx.fill();
        cx.fillStyle = hd; cx.beginPath(); cx.moveTo(56, -126); cx.lineTo(62, -144); cx.lineTo(70, -128); cx.fill();
        cx.fillStyle = '#111'; cx.beginPath(); cx.arc(84, -128, 3, 0, 7); cx.fill();
        cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(85, -129, 1, 0, 7); cx.fill();
        // mane
        cx.strokeStyle = hd; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(40, -96); cx.lineTo(62, -130); cx.stroke();
        // caparison (team cloth) with a gold trim and a soft fold shadow
        cx.fillStyle = T.c; cx.beginPath(); cx.moveTo(-60, -84); cx.lineTo(48, -84); cx.lineTo(52, -42);
        for (let i = 0; i < 5; i++) { const x = 52 - i*25; cx.lineTo(x - 6, -34); cx.lineTo(x - 12, -42); }
        cx.lineTo(-64, -46); cx.closePath(); cx.fill();
        cx.fillStyle = T.d; cx.globalAlpha = 0.5; for (let i = 0; i < 4; i++) cx.fillRect(-46 + i*26, -78, 6, 38); cx.globalAlpha = 1;
        cx.fillStyle = '#f2c94c'; cx.fillRect(-60, -84, 110, 5);
        cx.fillStyle = T.l; cx.fillRect(-58, -79, 104, 3);
        // near legs
        leg(-30, -48, Math.sin(g)*0.6, hc); leg(40, -48, Math.sin(g + 1.5)*0.6, hc);
        // saddle
        cx.fillStyle = '#4a2a14'; cx.fillRect(-18, -100, 34, 12); cx.fillStyle = '#7a4a24'; cx.fillRect(-18, -100, 34, 3);
        cx.restore();
      };
      // rider standing at (0,0) = saddle, facing +x; used both in the saddle and while tumbling
      const drawRider = k => {
        const T = TEAM[k.side];
        cx.fillStyle = '#8e97a2'; cx.fillRect(-8, -6, 14, 30);
        const g = cx.createLinearGradient(-14, 0, 14, 0); g.addColorStop(0, '#e2e8ee'); g.addColorStop(0.5, '#b8c0c8'); g.addColorStop(1, '#7d8792');
        cx.fillStyle = g; cx.beginPath(); cx.roundRect(-14, -54, 28, 52, 8); cx.fill();
        cx.fillStyle = T.c; cx.fillRect(-14, -34, 28, 12); cx.fillStyle = '#f2c94c'; cx.fillRect(-14, -34, 28, 2);
        cx.fillStyle = g; cx.beginPath(); cx.roundRect(-13, -84, 26, 30, 10); cx.fill();
        cx.fillStyle = 'rgba(255,255,255,.7)'; cx.fillRect(-8, -81, 4, 18);
        cx.fillStyle = '#2a2f36'; cx.fillRect(2, -72, 11, 4);
        cx.strokeStyle = T.c; cx.lineWidth = 7; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(-2, -84); cx.quadraticCurveTo(-14, -104, -34, -96); cx.stroke();
        cx.strokeStyle = T.l; cx.lineWidth = 4;
        cx.beginPath(); cx.moveTo(-2, -86); cx.quadraticCurveTo(-12, -100, -28, -96); cx.stroke();
      };
      const drawShield = (k, y) => {
        const T = TEAM[k.side];
        const g = cx.createLinearGradient(-2, y - 22, 26, y + 28); g.addColorStop(0, T.l); g.addColorStop(0.4, T.c); g.addColorStop(1, T.d);
        cx.fillStyle = g; cx.strokeStyle = '#f2c94c'; cx.lineWidth = 3;
        cx.beginPath(); cx.moveTo(-2, y - 22); cx.lineTo(26, y - 22); cx.lineTo(26, y + 2); cx.quadraticCurveTo(26, y + 20, 12, y + 28); cx.quadraticCurveTo(-2, y + 20, -2, y + 2); cx.closePath(); cx.fill(); cx.stroke();
        const em = k.side === 0 ? (api.avatar || '⭐') : players === 1 ? '🤖' : '⭐';
        cx.save(); cx.scale(k.side ? -1 : 1, 1); cx.font = `22px ${EF}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#000';
        cx.fillText(em, (k.side ? -1 : 1)*12, y + 2); cx.restore();
      };
      const drawKnight = k => {
        const base = BASE[k.side], dir = k.side ? -1 : 1;
        drawHorse(k, base);
        if (!k.on) return;
        const bob = Math.sin(k.gait*12.56)*2;
        cx.save(); cx.translate(k.x - dir*4, base - 96 + bob); cx.scale(dir, 1);
        drawRider(k);
        // lance: from the hand to the chosen height on the other lane
        const other = 1 - k.side;
        const wob = (phase === 'charge' && !RM ? Math.sin(k.gait*20)*k.sp*k.sp*10 : 0);
        const tipY = (BASE[other] + ZONE[k.aim]) - (base - 96 + bob) + wob;
        const hx = 10, hy = -30, len = k.lance ? 185 : 52;
        const ang = Math.atan2(tipY - hy, 180);
        cx.save(); cx.translate(hx, hy); cx.rotate(ang);
        cx.fillStyle = '#d9b77a'; cx.beginPath(); cx.moveTo(-26, -5); cx.lineTo(len, -1.5); cx.lineTo(len, 1.5); cx.lineTo(-26, 5); cx.fill();
        cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(-20, -3.5, len + 10, 1.5);
        if (k.lance) { cx.fillStyle = TEAM[k.side].c; for (let i = 0; i < 4; i++) cx.fillRect(10 + i*36, -4, 12, 8); cx.fillStyle = '#eee'; cx.beginPath(); cx.arc(len, 0, 4, 0, 7); cx.fill();
          // speed streaks behind a lance at full power
          if (phase === 'charge' && k.sp >= POWER && !RM) { cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 2; for (let i = 0; i < 3; i++) { const o = (now*400 + i*40) % 120; cx.beginPath(); cx.moveTo(len - 30 - o, -8 + i*8); cx.lineTo(len - 70 - o, -8 + i*8); cx.stroke(); } } }
        else { cx.fillStyle = '#b8935a'; cx.beginPath(); cx.moveTo(len, -2); cx.lineTo(len + 8, -6); cx.lineTo(len + 4, 0); cx.lineTo(len + 9, 5); cx.lineTo(len, 2); cx.fill(); }
        cx.fillStyle = '#8a8f96'; cx.beginPath(); cx.arc(4, 0, 9, 0, 7); cx.fill(); cx.fillStyle = 'rgba(255,255,255,.4)'; cx.beginPath(); cx.arc(2, -3, 4, 0, 7); cx.fill();
        cx.restore();
        drawShield(k, ZONE[k.aim] + 96 - bob);
        cx.restore();
      };
      const drawFallen = k => {
        const f = k.fall; if (!f) return;
        cx.fillStyle = 'rgba(70,40,10,.25)'; cx.beginPath(); cx.ellipse(f.x, f.land + 24, 34 + (f.landed ? 10 : 0), 7, 0, 0, 7); cx.fill();
        cx.save(); cx.translate(f.x, f.y); cx.rotate(f.r); cx.scale(k.side ? -1 : 1, 1);
        drawRider(k);
        cx.restore();
        if (f.landed) {
          const tt = f.t*4;
          cx.font = `22px ${EF}`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
          for (let i = 0; i < 3; i++) { const a = tt + i*2.09; cx.fillText('⭐', f.x + Math.cos(a)*34 + (k.side ? 30 : -30), f.y - 22 + Math.sin(a)*10); }
        }
      };
      const drawHUD = () => {
        const nm = players === 1 ? ['You ' + (api.avatar || ''), 'Computer 🤖'] : ['Blue knight', 'Red knight'], sz = W < 620 ? 18 : 22, off = Math.min(150, W*0.2);
        pill(cx, W/2 - off, 10, nm[0], String(score[0]), 'center', TEAM[0].c, sz);
        pill(cx, W/2 + off, 10, nm[1], String(score[1]), 'center', TEAM[1].c, sz);
        pill(cx, W/2, 10, 'Pass', `${Math.max(1, Math.min(pass, PASSES))}/${PASSES}`, 'center', null, sz - 2);
      };
      // screen-space controls: three glass targets + a speed bar for each human
      const drawControls = () => {
        const humans = players === 1 ? [0] : [0, 1];
        for (const s of humans) {
          const k = K[s], T = TEAM[s];
          for (let z = 0; z < 3; z++) {
            const q = tgt(s, z), on = k.aim === z;
            cx.fillStyle = on ? T.c : 'rgba(15,23,42,.42)';
            cx.beginPath(); cx.arc(q.x, q.y, q.r, 0, 7); cx.fill();
            if (on) { cx.fillStyle = 'rgba(255,255,255,.22)'; cx.beginPath(); cx.ellipse(q.x, q.y - q.r*0.45, q.r*0.7, q.r*0.35, 0, 0, 7); cx.fill(); }
            cx.lineWidth = on ? 4 : 1.5; cx.strokeStyle = on ? '#ffe14d' : 'rgba(255,255,255,.4)'; cx.beginPath(); cx.arc(q.x, q.y, q.r, 0, 7); cx.stroke();
            cx.strokeStyle = '#ffffff'; cx.lineWidth = 2; cx.beginPath(); cx.arc(q.x, q.y - 6, q.r*0.28, 0, 7); cx.stroke();
            cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(q.x, q.y - 6, 3, 0, 7); cx.fill();
            cx.font = `700 ${Math.round(q.r*0.34)}px ${TF}`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
            cx.fillText(ZNAME[z], q.x, q.y + q.r*0.5);
          }
          // speed meter under the row of targets
          const G = ctlGeo(s), bh = 10, bw = G.gw - 70, bx = G.x0 + 64, by = G.y + G.r + 6;
          rrPath(cx, G.x0, by - 4, G.gw, bh + 8, (bh + 8)/2); cx.fillStyle = 'rgba(15,23,42,.6)'; cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.15)'; cx.lineWidth = 1; cx.stroke();
          rrPath(cx, bx, by, bw, bh, bh/2); cx.fillStyle = 'rgba(255,255,255,.14)'; cx.fill();
          const f = (k.sp - 0.25)/0.75, fw = Math.max(bh, bw*f);
          rrPath(cx, bx, by, fw, bh, bh/2); cx.fillStyle = k.sp >= POWER ? '#ffcf3a' : '#7fd08a'; cx.fill();
          const px = bx + bw*(POWER - 0.25)/0.75;
          cx.fillStyle = '#ffffff'; cx.fillRect(px - 1.5, by - 3, 3, bh + 6);
          cx.font = `700 11px ${TF}`; cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillStyle = k.sp >= POWER ? '#ffcf3a' : '#ffffff';
          cx.fillText(k.sp >= POWER ? '💥 Power' : 'Speed', G.x0 + 10, by + bh/2);
        }
        // hold hint
        if (mode === 'play' && (phase === 'ready' || (phase === 'charge' && pass === 1))) {
          const msg = 'Hold to gallop · tap a target to aim';
          const xs = players === 1 ? [W/2] : [W*0.25, W*0.75];
          for (const x of xs) pill(cx, x, 64, '', msg, 'center', null, players === 1 ? 17 : 14);
        }
        if (players === 2 && mode === 'play') { cx.strokeStyle = 'rgba(255,255,255,.25)'; cx.setLineDash([8, 10]); cx.lineWidth = 2; cx.beginPath(); cx.moveTo(W/2, H - S); cx.lineTo(W/2, H); cx.stroke(); cx.setLineDash([]); }
      };
      const draw = () => {
        const [sx, sy] = J.offset();
        cx.save(); cx.translate(sx, sy);
        cx.drawImage(bgC, -4, -4, W + 8, H + 8);
        drawLive();
        cx.save(); cx.translate(ox, oy); cx.scale(sc, sc); J.draw(cx, true); cx.restore();
        cx.save(); cx.translate(ox, oy); cx.scale(sc, sc);
        drawKnight(K[0]);
        cx.restore();
        cx.drawImage(fenceC, -4, -4, W + 8, H + 8);
        cx.save(); cx.translate(ox, oy); cx.scale(sc, sc);
        drawKnight(K[1]);
        drawFallen(K[0]); drawFallen(K[1]);
        J.draw(cx);
        cx.restore();
        cx.restore();
        if (mode !== 'menu') drawHUD();
        if (mode === 'play') drawControls();
        J.overlay(cx, W, H);
      };

      const frame = t => {
        if (!alive) return;
        raf = requestAnimationFrame(frame);
        let dt = Math.min(0.033, (t - (last || t))/1000); last = t; now += dt;
        if (J.hold > 0) { J.hold -= dt; dt = 0; }
        update(dt); draw();
      };
      size(); if (ro) ro.observe(el);
      menu();
      raf = requestAnimationFrame(frame);

      return () => {
        alive = false; cancelAnimationFrame(raf); ui.kill();
        timers.forEach(t => clearTimeout(t)); timers.clear();
        window.removeEventListener('resize', size); if (ro) ro.disconnect();
        cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
        cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
        delete el._jo; el.innerHTML = '';
      };
    }
  };
})();
