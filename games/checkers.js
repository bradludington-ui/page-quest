// Brain Break game: checkers. Self-contained: canvas + DOM overlay, no images or libraries.
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
  // Checkers against the computer (easy / medium) or a friend on the same iPad.
  // Drawn as an inlaid wooden board on a green felt table, with glossy stacked pieces that hop, slide and pop.
  window.BreakGames.checkers = {
    start(el, api){
      const k = kit(el, api), cx = k.cx, J = k.J, RM = k.RM;
      // board: 64 cells, 0 empty; 1 / 2 = men of side 0 (bottom, moves up) / side 1 (top); 3 / 4 = their kings
      const opt = Object.assign({players:1, level:'easy'}, api.store.get('opts') || {});
      const side = v => v === 1 || v === 3 ? 0 : v === 2 || v === 4 ? 1 : -1, isKing = v => v >= 3;
      const PC = [{c:'#ef4444', l:'#fca5a5', d:'#7f1d1d', dot:'#ef4444'}, {c:'#334155', l:'#94a3b8', d:'#0b1120', dot:'#1e293b'}];
      let state = 'menu', B = Array(64).fill(0), turn = 0, sel = -1, path = [], seqs = [], moving = null, quiet = 0, last = null, winner = -1, gone = [], landAt = {}, nudge = 0, combo = 0;
      const names = () => opt.players === 1 ? ['You', 'Computer'] : [api.name || 'Red', 'Black'];
      function startScreen(){
        state = 'menu';
        const groups = [];
        if (opt.players === 1) groups.push({label:'Computer', value:opt.level, options:[{label:'Easy', value:'easy'}, {label:'Medium', value:'medium'}], onChange:v => { opt.level = v; }});
        k.ui.title({icon:'🔴⚫', name:'Checkers', howIcon:'👆', how:'Tap a piece, then where it goes. Jumps are a must. Reach the far side for a king 👑', mode:{value:opt.players, onChange:v => { opt.players = v; startScreen(); }}, groups, onPlay:begin});
      }
      function begin(){
        api.store.set('opts', opt); k.hideMenu();
        B = Array(64).fill(0);
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1){ if (r < 3) B[r * 8 + c] = 2; else if (r > 4) B[r * 8 + c] = 1; }
        turn = 0; sel = -1; path = []; moving = null; quiet = 0; last = null; winner = -1; gone = []; landAt = {}; state = 'play'; refresh();
      }
      // every complete move for a side: {from, steps:[to...], caps:[cell...]}; captures are mandatory and continue while possible
      function movesFor(b, s){
        const out = [], caps = [];
        for (let i = 0; i < 64; i++){ if (side(b[i]) !== s) continue; jumps(b, i, i, [], [], b[i], caps); }
        if (caps.length) return caps;
        for (let i = 0; i < 64; i++){ if (side(b[i]) !== s) continue; for (const [dr, dc] of dirs(b[i])){ const r = (i >> 3) + dr, c = (i & 7) + dc; if (r >= 0 && r < 8 && c >= 0 && c < 8 && !b[r * 8 + c]) out.push({from:i, steps:[r * 8 + c], caps:[]}); } }
        return out;
      }
      function dirs(v){ return isKing(v) ? [[-1,-1],[-1,1],[1,-1],[1,1]] : side(v) === 0 ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]]; }
      function jumps(b, from, at, steps, capd, v, out){
        let any = false;
        for (const [dr, dc] of dirs(v)){
          const r = (at >> 3) + dr, c = (at & 7) + dc, r2 = r + dr, c2 = c + dc;
          if (r2 < 0 || r2 > 7 || c2 < 0 || c2 > 7) continue;
          const mid = r * 8 + c, to = r2 * 8 + c2;
          if (side(b[mid]) !== 1 - side(v) || capd.includes(mid) || (b[to] && to !== from)) continue;
          any = true;
          const promote = !isKing(v) && ((side(v) === 0 && r2 === 0) || (side(v) === 1 && r2 === 7));
          if (promote) out.push({from, steps:steps.concat(to), caps:capd.concat(mid)});
          else jumps(b, from, to, steps.concat(to), capd.concat(mid), v, out);
        }
        if (!any && steps.length) out.push({from, steps, caps:capd});
      }
      function apply(b, m){
        const v = b[m.from]; b[m.from] = 0; m.caps.forEach(c => { b[c] = 0; });
        const to = m.steps[m.steps.length - 1]; let nv = v;
        if (v === 1 && to < 8) nv = 3; if (v === 2 && to >= 56) nv = 4; b[to] = nv; return nv !== v;
      }
      function refresh(){ seqs = movesFor(B, turn); }
      const count = s => B.filter(v => side(v) === s).length;
      // --- human input: tap a piece, then a highlighted square; multi-jumps go one hop at a time ---
      const options = () => seqs.filter(m => m.from === sel && path.every((p, i) => m.steps[i] === p));
      const nextTargets = () => { const o = options(), set = new Set(); o.forEach(m => { if (m.steps.length > path.length) set.add(m.steps[path.length]); }); return [...set]; };
      const human = () => state === 'play' && !moving && (opt.players === 2 || turn === 0);
      let G = {}, bg = null, spr = [], crownS = null, shadowS = null;
      const cellAt = p => { const c = Math.floor((p.x - G.x) / G.q), r = Math.floor((p.y - G.y) / G.q); return c >= 0 && c < 8 && r >= 0 && r < 8 ? r * 8 + c : -1; };
      const cellXY = i => ({x:G.x + ((i & 7) + 0.5) * G.q, y:G.y + ((i >> 3) + 0.5) * G.q});
      function tap(i){
        if (!human() || i < 0) return;
        if (path.length === 0 && side(B[i]) === turn){ sel = seqs.some(m => m.from === i) ? i : -1; if (sel < 0) nudge = 1.4; else { const p = cellXY(i); J.ring(p.x, p.y + G.q * 0.1, G.q * 0.3, 6, 'rgba(255,240,200,.5)', 40); } return; }
        if (sel >= 0 && nextTargets().includes(i)){
          path.push(i);
          const o = options(), done = o.find(m => m.steps.length === path.length);
          if (done && o.length === 1){ commit(done); return; }
          if (done && !o.some(m => m.steps.length > path.length)){ commit(done); return; }
          return;
        }
        if (path.length === 0) sel = -1;
      }
      k.on(k.cv, 'pointerup', e => tap(cellAt(k.pt(e))));
      el._st = () => state;
      el._test = () => { if (!human()) return []; const r = k.cv.getBoundingClientRect(), pt = i => ({x:r.left + G.x + ((i & 7) + 0.5) * G.q, y:r.top + G.y + ((i >> 3) + 0.5) * G.q});
        return {sel, path:path.slice(), moves:seqs.map(m => ({from:pt(m.from), steps:m.steps.map(pt), caps:m.caps.length, fromCell:m.from, cells:m.steps.slice()}))}; };
      // --- a move animates hop by hop; each capture pops ---
      function commit(m){ const v = B[m.from]; moving = {m, v, i:0, t:0, at:m.from}; sel = -1; path = []; combo = 0; }
      function hopLanded(to, capCell){
        const p = cellXY(to); landAt[to] = k.now;
        J.ring(p.x, p.y + G.q * 0.12, G.q * 0.32, 8, 'rgba(255,240,210,.6)', 60);
        if (capCell != null){
          const cv = B[capCell], q = cellXY(capCell), s = side(cv); B[capCell] = 0; combo++;
          gone.push({cell:capCell, v:cv, t:0});
          J.burst(q.x, q.y, 16, [PC[s].c, PC[s].l, '#fde047'], 'spark', 260, 0.6); J.burst(q.x, q.y, 8, [PC[s].c, PC[s].d], 'chip', 260, 0.9, 120);
          J.shake(3 + combo * 2); J.pause(0.05 + combo * 0.02);
          const words = ['Jump!', 'Double jump!', 'Triple jump!', 'Mega jump!'];
          J.text(words[Math.min(3, combo - 1)], q.x, q.y - G.q * 0.6, {size:combo > 1 ? 38 : 30, col:combo > 1 ? '#fde047' : '#fff', life:1.1});
          if (combo > 1) J.flash(0.2, '#fff4c2');
        }
      }
      function finishMove(){
        const m = moving.m; moving = null; const king = apply(B, m); last = m;
        if (king){ const p = cellXY(m.steps[m.steps.length - 1]); J.burst(p.x, p.y, 22, ['#fde047', '#fff7c2', '#f59e0b'], 'star', 300, 1); J.text('King! 👑', p.x, p.y - G.q * 0.7, {size:36, col:'#fde047', life:1.4}); J.flash(0.25, '#fff4c2'); }
        quiet = m.caps.length ? 0 : quiet + 1;
        turn = 1 - turn; refresh();
        if (!seqs.length || count(turn) === 0){ gameOver(1 - turn); return; }
        if (quiet >= 80){ gameOver(-1); return; }
        if (opt.players === 1 && turn === 1) k.after(650, () => { if (state === 'play' && turn === 1 && !moving) commit(aiMove()); });
      }
      function gameOver(w){
        state = 'over'; winner = w;
        if (w >= 0){ J.flash(0.35, '#fff7d6'); J.shake(6); for (let i = 0; i < 64; i++) if (side(B[i]) === w){ const p = cellXY(i); J.burst(p.x, p.y, 3, ['#fde047', '#fff'], 'star', 160, 1); } }
        k.after(1400, () => {
          state = 'end'; const [a, b] = names(), left = count(0);
          const head = w < 0 ? "It's a draw!" : opt.players === 1 ? (w === 0 ? 'You win!' : 'The computer wins this time') : names()[w] + ' wins!';
          const vs = [{text:'🔴 ' + count(0), color:'#fca5a5'}, {text:count(1) + ' ⚫', color:'#cbd5e1'}];
          if (opt.players === 1){
            const sc = (w === 0 ? 10 : 0) + left, res = saveQuiet(api, sc, w === 0);
            if (w === 0 && !res.isBest) api.confetti(60);
            const stars = w === 0 ? (left >= 6 ? 3 : 2) : w < 0 || left >= 3 ? 1 : 0;
            k.ui.end({icon:w === 0 ? '🏆' : w < 0 ? '🤝' : '🤖', title:head, stars, score:sc, scoreLabel:'Points', res, vs, line:(w === 0 ? '10 for the win + ' : '') + left + ' piece' + (left === 1 ? '' : 's') + ' left', again:begin, menu:startScreen});
          } else { if (w >= 0) api.confetti(60); k.ui.end({icon:w < 0 ? '🤝' : '🏆', title:head, vs, line:'Pieces left on the board', again:begin, menu:startScreen}); }
        });
      }
      // --- computer ---
      function evalB(b){ let s = 0; for (let i = 0; i < 64; i++){ const v = b[i]; if (!v) continue; const r = i >> 3, val = isKing(v) ? 165 : 100 + (side(v) === 1 ? r : 7 - r) * 4 + ((i & 7) > 1 && (i & 7) < 6 ? 3 : 0); s += side(v) === 1 ? val : -val; } return s; }
      function search(b, depth, s, alpha, beta){
        const ms = movesFor(b, s); if (!ms.length) return s === 1 ? -9999 - depth : 9999 + depth;
        if (depth === 0) return evalB(b);
        for (const m of ms){ const nb = b.slice(); apply(nb, m); const v = search(nb, depth - 1, 1 - s, alpha, beta); if (s === 1){ if (v > alpha) alpha = v; } else { if (v < beta) beta = v; } if (alpha >= beta) break; }
        return s === 1 ? alpha : beta;
      }
      function aiMove(){
        const ms = seqs.slice(), rand = a => a[Math.floor(Math.random() * a.length)];
        if (opt.level === 'easy'){ const mx = Math.max(...ms.map(m => m.caps.length)); return rand(ms.filter(m => m.caps.length === mx)); }
        let best = -1e9, pick = [];
        for (const m of ms){ const nb = B.slice(); apply(nb, m); const v = search(nb, 3, 0, -1e9, 1e9) + Math.random() * 6; if (v > best){ best = v; pick = [m]; } }
        return pick[0] || rand(ms);
      }
      // --- cached scene: felt table, inlaid wooden board; piece sprites ---
      function build(){
        const W = k.W, H = k.H, d = k.d, q = G.q, s = G.s, bw = G.bw, [c, x] = mkCanvas(W, H, d); bg = c;
        let gr = x.createRadialGradient(W / 2, H * 0.4, 30, W / 2, H / 2, Math.max(W, H) * 0.75); gr.addColorStop(0, '#1f7a4f'); gr.addColorStop(1, '#0b3a24'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
        const R = seeded(31); for (let i = 0; i < W * H / 60; i++){ x.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.06)'; x.fillRect(R() * W, R() * H, 1.2, 1.2); }
        gr = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.8); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.5)'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
        const fx = G.x - bw, fy = G.y - bw, fs = s + bw * 2;
        soft(x, d, 30, 'rgba(0,0,0,.6)', () => rrPath(x, fx + 6, fy + 16, fs, fs, bw * 0.6));
        // walnut frame with a bevel
        x.save(); rrPath(x, fx, fy, fs, fs, bw * 0.6); x.clip(); wood(x, fx, fy, fs, fs, '#7a4626', '#3f2010', 'rgba(20,8,0,A)', 41, false);
        gr = x.createLinearGradient(fx, fy, fx + fs, fy + fs); gr.addColorStop(0, 'rgba(255,230,190,.3)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.3)'); x.fillStyle = gr; x.fillRect(fx, fy, fs, fs); x.restore();
        rrPath(x, fx + 1, fy + 1, fs - 2, fs - 2, bw * 0.6); x.strokeStyle = 'rgba(255,220,170,.35)'; x.lineWidth = 2; x.stroke();
        // squares: maple and walnut, inlaid
        x.save(); x.beginPath(); x.rect(G.x, G.y, s, s); x.clip(); wood(x, G.x, G.y, s, s, '#f0d3a3', '#d7ad74', 'rgba(120,70,20,A)', 9, false);
        x.beginPath(); for (let i = 0; i < 64; i++) if (((i >> 3) + (i & 7)) % 2 === 1) x.rect(G.x + (i & 7) * q, G.y + (i >> 3) * q, q, q); x.clip(); wood(x, G.x, G.y, s, s, '#6e4326', '#4a2914', 'rgba(15,5,0,A)', 17, true); x.restore();
        x.strokeStyle = 'rgba(40,20,5,.35)'; x.lineWidth = 1; for (let i = 0; i <= 8; i++){ x.beginPath(); x.moveTo(G.x + i * q, G.y); x.lineTo(G.x + i * q, G.y + s); x.stroke(); x.beginPath(); x.moveTo(G.x, G.y + i * q); x.lineTo(G.x + s, G.y + i * q); x.stroke(); }
        gr = x.createLinearGradient(G.x, G.y, G.x + s, G.y + s); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.12)'); x.fillStyle = gr; x.fillRect(G.x, G.y, s, s);
        x.strokeStyle = 'rgba(20,8,0,.6)'; x.lineWidth = 3; x.strokeRect(G.x - 1.5, G.y - 1.5, s + 3, s + 3); x.strokeStyle = 'rgba(232,190,120,.55)'; x.lineWidth = 1.5; x.strokeRect(G.x - 4.5, G.y - 4.5, s + 9, s + 9);
        // sprites
        spr = [0, 1].map(sd => pieceSprite(sd, q));
        const [sc, sx] = mkCanvas(q, q, d), sg = sx.createRadialGradient(q / 2, q / 2, 0, q / 2, q / 2, q / 2); sg.addColorStop(0, 'rgba(0,0,0,.6)'); sg.addColorStop(0.5, 'rgba(0,0,0,.3)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = sg; sx.fillRect(0, 0, q, q); shadowS = sc;
        const [cc, cxx] = mkCanvas(q, q, d), o = q / 2, w = q * 0.42, h = q * 0.27; cxx.translate(o, o + h * 0.1);
        gr = cxx.createLinearGradient(0, -h, 0, h); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.5, '#facc15'); gr.addColorStop(1, '#a16207'); cxx.fillStyle = gr; cxx.strokeStyle = '#78350f'; cxx.lineWidth = Math.max(1, q * 0.018); cxx.lineJoin = 'round';
        cxx.beginPath(); cxx.moveTo(-w / 2, h / 2); cxx.lineTo(-w / 2, -h / 2); cxx.lineTo(-w / 4, 0); cxx.lineTo(0, -h * 0.7); cxx.lineTo(w / 4, 0); cxx.lineTo(w / 2, -h / 2); cxx.lineTo(w / 2, h / 2); cxx.closePath(); cxx.fill(); cxx.stroke();
        cxx.fillStyle = '#ef4444'; for (const px of [-w / 2, 0, w / 2]){ cxx.beginPath(); cxx.arc(px, px === 0 ? -h * 0.72 : -h * 0.52, q * 0.025, 0, 7); cxx.fill(); }
        crownS = cc;
      }
      function pieceSprite(sd, q){
        const [c, x] = mkCanvas(q, q, k.d), o = q / 2, r = q * 0.38, T = PC[sd], th = r * 0.2, cy = o - th / 2;
        x.fillStyle = T.d; x.beginPath(); x.arc(o, cy + th, r, 0, 7); x.fill(); x.fillRect(o - r, cy, r * 2, th);
        x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 1; for (let i = 0; i < 18; i++){ const a = Math.PI * (0.05 + i * 0.05); x.beginPath(); x.moveTo(o + Math.cos(a) * r, cy + th * 0.2 + Math.sin(a) * r * 0.3); x.lineTo(o + Math.cos(a) * r, cy + th + Math.sin(a) * r); x.stroke(); }
        let gr = x.createRadialGradient(o - r * 0.35, cy - r * 0.4, r * 0.1, o, cy, r * 1.05); gr.addColorStop(0, T.l); gr.addColorStop(0.5, T.c); gr.addColorStop(1, T.d); x.fillStyle = gr; x.beginPath(); x.arc(o, cy, r, 0, 7); x.fill();
        for (const [f, col, w] of [[0.78, 'rgba(0,0,0,.28)', 0.09], [0.72, 'rgba(255,255,255,.22)', 0.04], [0.5, 'rgba(0,0,0,.18)', 0.05], [0.46, 'rgba(255,255,255,.16)', 0.03]]){ x.strokeStyle = col; x.lineWidth = r * w; x.beginPath(); x.arc(o, cy, r * f, 0, 7); x.stroke(); }
        gr = x.createLinearGradient(0, cy - r, 0, cy); gr.addColorStop(0, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.ellipse(o - r * 0.12, cy - r * 0.52, r * 0.58, r * 0.28, -0.25, 0, 7); x.fill();
        return c;
      }
      const layout = () => { const top = 64; let q = Math.min((k.W - 24) / 8.7, (k.H - top - 14) / 8.7); q = Math.floor(q); const s = q * 8, bw = q * 0.35;
        G = {q, s, bw, x:Math.round((k.W - s) / 2), y:Math.round(top + bw + Math.max(0, (k.H - top - 14 - s - bw * 2) / 2))}; build(); };
      k.onResize = layout; layout();
      // --- drawing ---
      function piece(x, y, v, lift, sx, sy, alpha){
        const s = side(v), q = G.q; lift = lift || 0; sx = sx || 1; sy = sy || 1; cx.globalAlpha = alpha == null ? 1 : alpha;
        const ss = q * (0.95 + lift / q * 0.8); cx.globalAlpha *= clamp(0.9 - lift / q * 0.6, 0.3, 1); cx.drawImage(shadowS, x - ss / 2 + lift * 0.25, y - ss / 2 + q * 0.08 + lift * 0.35, ss, ss); cx.globalAlpha = alpha == null ? 1 : alpha;
        const w = q * sx, h = q * sy, yy = y - lift;
        if (isKing(v)){ cx.drawImage(spr[s], x - w / 2, yy - h / 2 + q * 0.04, w, h); cx.drawImage(spr[s], x - w / 2, yy - h / 2 - q * 0.1, w, h); cx.drawImage(crownS, x - w / 2, yy - h / 2 - q * 0.14, w, h); }
        else cx.drawImage(spr[s], x - w / 2, yy - h / 2 + (1 - sy) * q * 0.3, w, h);
        cx.globalAlpha = 1;
      }
      function update(dt){
        if (moving){
          moving.t += dt / (moving.m.caps.length ? 0.26 : 0.22);
          if (moving.t >= 1){ const m = moving.m, to = m.steps[moving.i]; hopLanded(to, m.caps[moving.i]); moving.at = to; moving.i++; moving.t = 0;
            if (moving.i >= m.steps.length){ landAt[to] = k.now; finishMove(); } }
        }
        for (const gpc of gone) gpc.t += dt; gone = gone.filter(gpc => gpc.t < 0.45);
        if (nudge > 0) nudge -= dt;
        J.update(dt);
      }
      function draw(){
        const [ox, oy] = J.offset(); cx.save(); cx.translate(ox, oy);
        cx.drawImage(bg, -3, -3, k.W + 6, k.H + 6);
        if (state !== 'menu'){
          const q = G.q, hm = human(), tg = hm ? nextTargets() : [], movable = hm && sel < 0 ? new Set(seqs.map(m => m.from)) : null, mustJump = seqs.length && seqs[0].caps.length, pulse = RM ? 0.7 : 0.55 + 0.45 * Math.sin(k.now * 6);
          if (last){ for (const i of [last.from, last.steps[last.steps.length - 1]]){ cx.fillStyle = 'rgba(255,214,100,.18)'; cx.fillRect(G.x + (i & 7) * q, G.y + (i >> 3) * q, q, q); } }
          if (sel >= 0){ cx.fillStyle = 'rgba(253,224,71,.28)'; cx.fillRect(G.x + (sel & 7) * q, G.y + (sel >> 3) * q, q, q); }
          path.forEach(p => { cx.fillStyle = 'rgba(253,224,71,.2)'; cx.fillRect(G.x + (p & 7) * q, G.y + (p >> 3) * q, q, q); });
          // trays: pieces each side has taken
          trays();
          J.draw(cx, true);
          for (let i = 0; i < 64; i++){
            const v = B[i]; if (!v) continue; if (moving && i === moving.m.from) continue;
            if (sel === i && path.length) continue;
            const p = cellXY(i), a = k.now - (landAt[i] || -9); let sx = 1, sy = 1;
            if (a < 0.3 && !RM){ const w = Math.sin(a / 0.3 * Math.PI) * (1 - a / 0.3); sx = 1 + 0.12 * w; sy = 1 - 0.12 * w; }
            const lifted = i === sel && !RM ? 5 + Math.sin(k.now * 5) * 2 : 0;
            if (movable && movable.has(i) && (mustJump || nudge > 0)){ cx.save(); cx.strokeStyle = mustJump ? '#fde047' : '#fff'; cx.lineWidth = 3.5; cx.setLineDash([7, 6]); cx.lineDashOffset = RM ? 0 : -k.now * 24; cx.beginPath(); cx.arc(p.x, p.y, q * 0.46, 0, 7); cx.stroke(); cx.restore(); }
            if (i === sel){ cx.save(); cx.shadowColor = 'rgba(253,224,71,.9)'; cx.shadowBlur = 18; cx.strokeStyle = 'rgba(253,224,71,.9)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(p.x, p.y - lifted, q * 0.43, 0, 7); cx.stroke(); cx.restore(); }
            piece(p.x, p.y, v, lifted, sx, sy);
          }
          for (const gpc of gone){ const p = cellXY(gpc.cell), e = gpc.t / 0.45; piece(p.x, p.y, gpc.v, e * q * 0.5, 1 + e * 0.3, 1 + e * 0.3, 1 - e); }
          if (sel >= 0 && path.length){ const p = cellXY(path[path.length - 1]); piece(p.x, p.y, B[sel], 6); }
          cx.save(); cx.globalCompositeOperation = 'lighter';
          tg.forEach(i => { const p = cellXY(i); cx.fillStyle = `rgba(253,224,71,${0.35 + 0.35 * pulse})`; cx.beginPath(); cx.arc(p.x, p.y, q * 0.13, 0, 7); cx.fill(); cx.strokeStyle = `rgba(253,224,71,${0.5 + 0.4 * pulse})`; cx.lineWidth = 3; cx.beginPath(); cx.arc(p.x, p.y, q * (0.34 + 0.05 * pulse), 0, 7); cx.stroke(); });
          cx.restore();
          if (moving){ const m = moving.m, from = cellXY(moving.at), to = cellXY(m.steps[moving.i] != null ? m.steps[moving.i] : moving.at), t = eOut(moving.t), cap = m.caps[moving.i] != null, hop = Math.sin(Math.PI * moving.t) * q * (cap ? 0.55 : 0.18);
            const st = cap && !RM ? 1 + Math.sin(Math.PI * moving.t) * 0.12 : 1; piece(lerp(from.x, to.x, t), lerp(from.y, to.y, t), moving.v, hop + 2, st, st); }
        }
        J.draw(cx);
        cx.restore();
        if (state !== 'menu') hud();
        if (nudge > 0 && human() && !(seqs.length && seqs[0].caps.length)){ cx.globalAlpha = clamp(nudge, 0, 1); k.pill('', 'That piece can’t move', k.W / 2, k.H / 2 - 20, 'center', null, 20); cx.globalAlpha = 1; }
        J.overlay(cx, k.W, k.H);
      }
      function trays(){
        const room = G.x - G.bw - 8, q = G.q; if (room < q * 0.55) return;
        const sz = Math.min(q * 0.8, room - 8);
        for (const s of [0, 1]){
          const taken = 12 - count(1 - s), x = s === 0 ? (G.x - G.bw) / 2 : G.x + G.s + G.bw + (k.W - (G.x + G.s + G.bw)) / 2;
          for (let i = 0; i < taken; i++){ const y = G.y + G.s - sz * 0.5 - i * sz * 0.24 - Math.floor(i / 6) * 0; cx.drawImage(spr[1 - s], x - sz / 2, y - sz / 2, sz, sz); }
        }
      }
      function hud(){
        const [a, b] = names(), sz = k.W < 620 ? 17 : 21, thinking = state === 'play' && opt.players === 1 && turn === 1;
        const pcs = n => n + (n === 1 ? ' piece' : ' pieces');
        k.pill(a.slice(0, 10), pcs(count(0)), 12, 10, 'left', PC[0].c, sz);
        k.pill(b.slice(0, 10), pcs(count(1)), k.W - 12, 10, 'right', PC[1].c, sz);
        if (state === 'play'){
          const jump = seqs.length && seqs[0].caps.length && human();
          const val = thinking ? '🤖 Thinking' : (opt.players === 1 ? 'Your turn' : names()[turn] + '’s turn') + (jump ? ': jump!' : '');
          const tp = k.pill(jump ? 'Must jump' : 'Turn', val, k.W / 2, 10, 'center', PC[turn].c, sz, thinking ? 30 : 0);
          if (thinking) dots(cx, tp.x + tp.w - sz * 0.7 - 24, tp.y + tp.h * 0.7, k.now, '#fde047');
        }
      }
      k.frame(dt => { if (state === 'play' || state === 'over') update(dt); else J.update(dt); draw(); });
      startScreen();
      return () => { delete el._test; delete el._st; k.cleanup(); };
    }
  };
})();
