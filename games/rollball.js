// Brain Break game: rollball (Roll & Score). Self-contained: canvas + DOM overlay, no images or libraries.
(function(){
  'use strict';
  window.BreakGames = window.BreakGames || {};
  // ---- Brain Break shared frame: glass HUD pills, title card, end card, juice (same block in every upgraded game) ----
  const HF = '"Baloo 2", "Trebuchet MS", system-ui, sans-serif', TF = '"Lexend", Verdana, system-ui, sans-serif';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t, rnd = (a, b) => a + Math.random() * (b - a);
  const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3), easeBack = t => { t = clamp(t, 0, 1); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const BB_CSS = `
.bbf-ov{position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;z-index:20;
  background:radial-gradient(ellipse at 50% 40%,rgba(15,23,42,.25),rgba(2,6,23,.62));touch-action:none;font-family:${TF}}
.bbf-card{position:relative;width:min(440px,100%);max-height:100%;overflow:auto;box-sizing:border-box;padding:26px 24px 22px;border-radius:30px;text-align:center;color:#fff;
  background:linear-gradient(165deg,rgba(51,65,105,.94),rgba(15,23,42,.95) 60%);border:1px solid rgba(255,255,255,.16);
  box-shadow:0 24px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.18);display:flex;flex-direction:column;align-items:center;gap:10px}
.bbf-card:before{content:"";position:absolute;left:12%;right:12%;top:-1px;height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,var(--bbacc,#ffcf3f),transparent)}
.bbf-in{animation:bbfIn .5s cubic-bezier(.2,1.3,.4,1) both}
.bbf-up{animation:bbfUp .55s cubic-bezier(.2,1.25,.4,1) both}
.bbf-hero{width:96px;height:96px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:58px;line-height:1;margin-top:-4px;
  background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.35),rgba(255,255,255,.06) 60%),var(--bbacc2,#334155);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 0 40px var(--bbglow,rgba(255,207,63,.45));
  animation:bbfBob 2.6s ease-in-out infinite}
.bbf-title{font:800 42px/1 ${HF};letter-spacing:.5px;margin-top:4px;background:linear-gradient(180deg,#fff,#ffe9a8);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 3px 0 rgba(0,0,0,.35))}
.bbf-how{display:flex;align-items:center;gap:10px;font:500 17px/1.35 ${TF};color:rgba(255,255,255,.88);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
  border-radius:16px;padding:9px 14px;text-align:left}
.bbf-how b{color:#ffe08a}
.bbf-how .ic{font-size:26px;flex:none;animation:bbfTap 1.6s ease-in-out infinite}
.bbf-row{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap}
.bbf-av{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.25)}
.bbf-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:999px;background:rgba(15,23,42,.55);border:1px solid rgba(255,255,255,.15);font:700 17px ${HF};color:#fff}
.bbf-chip small{font:600 12px ${TF};color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.06em}
.bbf-play{min-height:68px;min-width:220px;width:min(300px,100%);margin-top:6px;border:none;border-radius:999px;cursor:pointer;touch-action:manipulation;font:800 30px ${HF};color:#3a1d00;
  background:linear-gradient(180deg,#ffe066,#ffb21a 55%,#ff9500);box-shadow:0 6px 0 #c4620a,0 14px 26px rgba(0,0,0,.4),inset 0 2px 0 rgba(255,255,255,.6);
  animation:bbfPulse 1.6s ease-in-out infinite;text-shadow:0 1px 0 rgba(255,255,255,.45)}
.bbf-play:active{transform:translateY(4px) scale(.98);box-shadow:0 2px 0 #c4620a,0 6px 14px rgba(0,0,0,.4)}
.bbf-res{font:800 32px/1.05 ${HF};color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.35)}
.bbf-score{font:800 72px/1 ${HF};color:#ffe066;text-shadow:0 4px 0 rgba(0,0,0,.35),0 0 30px rgba(255,200,60,.45);font-variant-numeric:tabular-nums}
.bbf-unit{font:600 15px ${TF};color:rgba(255,255,255,.7);margin-top:-6px;text-transform:uppercase;letter-spacing:.08em}
.bbf-stars{display:flex;gap:10px;justify-content:center;margin:2px 0}
.bbf-star{font-size:46px;line-height:1;color:rgba(255,255,255,.16);text-shadow:0 2px 0 rgba(0,0,0,.3)}
.bbf-star.on{color:#ffd23f;text-shadow:0 0 18px rgba(255,210,63,.75),0 3px 0 #b77800;animation:bbfStar .5s cubic-bezier(.2,1.6,.4,1) both}
.bbf-rib{position:absolute;top:14px;right:-36px;transform:rotate(35deg);padding:6px 46px;background:linear-gradient(180deg,#ffe066,#ff9f1c);color:#4a2300;font:800 15px ${HF};
  box-shadow:0 4px 10px rgba(0,0,0,.35);white-space:nowrap}
.bbf-newbest{display:inline-block;padding:6px 16px;border-radius:999px;font:800 20px ${HF};color:#3a1d00;background:linear-gradient(90deg,#ffe066,#ffb21a,#ffe066);background-size:200% 100%;
  animation:bbfShine 1.8s linear infinite;box-shadow:0 0 22px rgba(255,200,60,.55)}
.bbf-extra{font:500 15px ${TF};color:rgba(255,255,255,.78)}
.bbf-rm *{animation:none!important;transition:none!important}
@keyframes bbfIn{from{opacity:0;transform:scale(.86) translateY(14px)}to{opacity:1;transform:none}}
@keyframes bbfUp{from{opacity:0;transform:translateY(80px)}to{opacity:1;transform:none}}
@keyframes bbfBob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-7px) rotate(3deg)}}
@keyframes bbfTap{0%,100%{transform:translateY(0)}50%{transform:translateY(4px) scale(.92)}}
@keyframes bbfPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes bbfStar{from{opacity:0;transform:scale(.2) rotate(-40deg)}to{opacity:1;transform:none}}
@keyframes bbfShine{from{background-position:0 0}to{background-position:200% 0}}`;
  const bbEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // frame(el, api, {accent, accent2, glow}) -> start screen / end card overlay inside el
  function bbFrame(el, api, theme){
    theme = theme || {};
    const st = document.createElement('style'); st.textContent = BB_CSS; el.appendChild(st);
    const ov = document.createElement('div'); ov.className = 'bbf-ov' + (api.reducedMotion ? ' bbf-rm' : '');
    ov.style.setProperty('--bbacc', theme.accent || '#ffcf3f'); ov.style.setProperty('--bbacc2', theme.accent2 || '#334155'); ov.style.setProperty('--bbglow', theme.glow || 'rgba(255,207,63,.45)');
    el.appendChild(ov);
    let raf = 0, onBtn = null, dead = false;
    const click = e => { const b = e.target.closest('[data-bb]'); if (b && onBtn) onBtn(b.dataset.bb); };
    ov.addEventListener('click', click);
    const F = {
      el: ov,
      open: () => ov.style.display !== 'none',
      hide(){ cancelAnimationFrame(raf); ov.style.display = 'none'; ov.innerHTML = ''; onBtn = null; },
      start(o){ // {emoji, title, how, icon, bestLabel, onPlay}
        cancelAnimationFrame(raf);
        const best = api.best != null ? `<span class="bbf-chip">🏆 <small>Best</small> ${bbEsc(api.best)}${o.bestUnit ? ' ' + bbEsc(o.bestUnit) : ''}</span>` : `<span class="bbf-chip">✨ <small>First game!</small></span>`;
        ov.innerHTML = `<div class="bbf-card bbf-in"><div class="bbf-hero">${o.emoji}</div><div class="bbf-title">${bbEsc(o.title)}</div>
          <div class="bbf-how"><span class="ic">${o.icon || '👆'}</span><span>${o.how}</span></div>
          <div class="bbf-row"><span class="bbf-av" title="${bbEsc(api.name || '')}">${bbEsc(api.avatar || '🙂')}</span>${best}</div>
          <button type="button" class="bbf-play" data-bb="play">▶ Play</button></div>`;
        ov.style.display = 'flex'; onBtn = a => { if (a === 'play'){ F.hide(); o.onPlay(); } };
      },
      end(o){ // {title, emoji, score, unit, res, stars:[t1,t2,t3] or count, extra, onAgain, lowerBetter}
        cancelAnimationFrame(raf);
        const n = typeof o.stars === 'number' ? o.stars : o.stars.filter(t => o.lowerBetter ? o.score <= t : o.score >= t).length;
        const isBest = o.res && o.res.isBest && (o.score > 0 || o.lowerBetter);
        ov.innerHTML = `<div class="bbf-card bbf-up">${isBest ? '<div class="bbf-rib">NEW BEST</div>' : ''}
          <div class="bbf-res">${o.emoji ? o.emoji + ' ' : ''}${bbEsc(o.title)}</div>
          <div class="bbf-stars">${[0,1,2].map(i => `<span class="bbf-star${i < n ? ' on' : ''}" style="animation-delay:${0.55 + i * 0.22}s">★</span>`).join('')}</div>
          <div class="bbf-score" data-n="1">0</div><div class="bbf-unit">${bbEsc(o.unit || 'points')}</div>
          ${isBest ? '<div class="bbf-newbest">🏆 New best!</div>' : ''}
          <div class="bbf-row"><span class="bbf-av">${bbEsc(api.avatar || '🙂')}</span><span class="bbf-chip">🏆 <small>Best</small> ${bbEsc(o.res ? o.res.best : o.score)}</span></div>
          ${(o.extra || []).filter(Boolean).map(x => `<div class="bbf-extra">${x}</div>`).join('')}
          <button type="button" class="bbf-play" data-bb="again">▶ Play again</button></div>`;
        ov.style.display = 'flex'; onBtn = a => { if (a === 'again'){ F.hide(); o.onAgain(); } };
        const num = ov.querySelector('[data-n]'), target = o.score;
        if (api.reducedMotion || !target){ num.textContent = String(target); return; }
        const t0 = performance.now(), dur = clamp(400 + Math.abs(target) * 8, 600, 1300);
        const tick = t => { if (dead) return; const k = clamp((t - t0) / dur, 0, 1); num.textContent = String(Math.round(target * easeOut(k))); if (k < 1) raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick);
      },
      destroy(){ dead = true; cancelAnimationFrame(raf); ov.removeEventListener('click', click); }
    };
    return F;
  }
  // rounded-rect path
  function bbRR(cx, x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  // glass HUD pill: small label over a big Baloo number. Returns {x,y,w,h} (for fly-to targets). bump 0..1 scales it up briefly.
  function bbPill(cx, x, y, label, value, o){
    o = o || {}; const h = o.h || 50, align = o.align || 'left', bump = o.bump || 0;
    cx.font = `800 ${Math.round(h * 0.5)}px ${HF}`; const vw = cx.measureText(String(value)).width;
    cx.font = `700 ${Math.round(h * 0.22)}px ${TF}`; const lw = cx.measureText(label).width;
    const icon = o.icon || '', iw = icon ? h * 0.62 : 0;
    const w = Math.max(vw, lw) + h * 0.7 + iw + (o.extraW || 0);
    const left = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    cx.save();
    if (bump > 0){ const s = 1 + 0.18 * Math.sin(bump * Math.PI); cx.translate(left + w / 2, y + h / 2); cx.scale(s, s); cx.translate(-(left + w / 2), -(y + h / 2)); }
    cx.fillStyle = o.bg || 'rgba(15,23,42,.55)'; bbRR(cx, left, y, w, h, h / 2); cx.fill();
    cx.strokeStyle = 'rgba(255,255,255,.15)'; cx.lineWidth = 1; bbRR(cx, left + 0.5, y + 0.5, w - 1, h - 1, h / 2 - 0.5); cx.stroke();
    cx.textBaseline = 'middle'; cx.textAlign = 'left';
    let tx = left + h * 0.35;
    if (icon){ cx.fillStyle = '#fff'; cx.font = `${Math.round(h * 0.46)}px sans-serif`; cx.fillText(icon, tx - 2, y + h / 2 + 1); tx += iw; }
    cx.fillStyle = 'rgba(255,255,255,.66)'; cx.font = `700 ${Math.round(h * 0.22)}px ${TF}`; cx.fillText(label.toUpperCase(), tx, y + h * 0.27);
    cx.fillStyle = o.fg || '#fff'; cx.font = `800 ${Math.round(h * 0.5)}px ${HF}`; cx.fillText(String(value), tx, y + h * 0.64);
    cx.restore();
    return {x:left, y, w, h};
  }
  // juice: capped particles, floating text that can fly to a HUD target, shake, flash, hit pause
  function bbJuice(api){
    const RM = !!api.reducedMotion, P = [], T = [];
    const J = {shakeA:0, flashA:0, flashC:'#fff', pause:0, sx:0, sy:0,
      burst(x, y, n, o){ o = o || {}; for (let i = 0; i < n && P.length < 150; i++){ const a = (o.a != null ? o.a : 0) + (o.spread != null ? (Math.random() - 0.5) * o.spread : Math.random() * Math.PI * 2), s = rnd(o.min || 80, o.max || 320);
        P.push({x, y, vx:Math.cos(a) * s, vy:Math.sin(a) * s, g:o.g != null ? o.g : 600, life:rnd(0.45, 0.9) * (o.life || 1), t:0, r:rnd(o.r0 || 2, o.r1 || 5), col:o.cols ? o.cols[(Math.random() * o.cols.length) | 0] : (o.col || '#fff'), kind:o.kind || 'dot', rot:Math.random() * 6, vr:rnd(-10, 10), drag:o.drag || 0}); } },
      ring(x, y, r, col, life){ if (P.length < 150) P.push({x, y, ring:true, r, col:col || '#fff', life:life || 0.4, t:0}); },
      text(txt, x, y, o){ o = o || {}; T.push({txt, x, y, x0:x, y0:y, t:0, col:o.col || '#fff', size:o.size || 30, life:o.life || 1.1, to:o.to || null, onArrive:o.onArrive || null, big:!!o.big}); },
      shake(a){ if (!RM) J.shakeA = Math.max(J.shakeA, a); },
      flash(a, c){ if (!RM){ J.flashA = Math.max(J.flashA, a); J.flashC = c || '#fff'; } },
      hitPause(s){ if (!RM) J.pause = Math.max(J.pause, s); },
      clear(){ P.length = 0; T.length = 0; J.shakeA = J.flashA = J.pause = 0; },
      count: () => P.length,
      update(dt){
        J.shakeA = Math.max(0, J.shakeA - dt * 40); J.sx = J.shakeA ? (Math.random() - 0.5) * J.shakeA : 0; J.sy = J.shakeA ? (Math.random() - 0.5) * J.shakeA : 0;
        J.flashA = Math.max(0, J.flashA - dt * 3);
        for (let i = P.length - 1; i >= 0; i--){ const p = P[i]; p.t += dt; if (p.t >= p.life){ P.splice(i, 1); continue; } if (!p.ring){ if (p.drag){ const f = Math.max(0, 1 - p.drag * dt); p.vx *= f; p.vy *= f; } p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; } }
        for (let i = T.length - 1; i >= 0; i--){ const q = T[i]; q.t += dt;
          if (q.to){ const k = clamp((q.t - 0.45) / 0.45, 0, 1); if (k > 0){ const e = k * k; const tx = q.to().x, ty = q.to().y; q.x = lerp(q.x0, tx, e); q.y = lerp(q.y0 - 26, ty, e); } else q.y = q.y0 - easeOut(q.t / 0.45) * 26;
            if (k >= 1){ if (q.onArrive) q.onArrive(); T.splice(i, 1); } }
          else { q.y = q.y0 - easeOut(q.t / q.life) * 46; if (q.t >= q.life) T.splice(i, 1); } }
      },
      drawParticles(cx){
        for (const p of P){ const a = 1 - p.t / p.life; cx.globalAlpha = a;
          if (p.ring){ cx.strokeStyle = p.col; cx.lineWidth = 4 * a + 1; cx.beginPath(); cx.arc(p.x, p.y, p.r * (1 + easeOut(p.t / p.life) * 1.6), 0, 7); cx.stroke(); }
          else if (p.kind === 'confetti'){ cx.fillStyle = p.col; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillRect(-p.r, -p.r * 0.45, p.r * 2, p.r * 0.9); cx.restore(); }
          else if (p.kind === 'spark'){ cx.strokeStyle = p.col; cx.lineWidth = p.r * 0.6; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); cx.stroke(); }
          else { cx.fillStyle = p.col; cx.beginPath(); cx.arc(p.x, p.y, p.r * (0.5 + a * 0.5), 0, 7); cx.fill(); } }
        cx.globalAlpha = 1;
      },
      drawText(cx){
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        for (const q of T){ const pin = easeBack(q.t / 0.22), fade = q.to ? 1 : clamp((q.life - q.t) / 0.3, 0, 1);
          const sc = q.to && q.t > 0.45 ? lerp(1, 0.6, clamp((q.t - 0.45) / 0.45, 0, 1)) : pin;
          cx.save(); cx.globalAlpha = fade; cx.translate(q.x, q.y); cx.scale(sc, sc);
          cx.font = `800 ${q.size}px ${HF}`; cx.lineJoin = 'round'; cx.lineWidth = q.size * 0.2; cx.strokeStyle = 'rgba(15,23,42,.8)'; cx.strokeText(q.txt, 0, 0);
          if (q.big){ cx.shadowColor = q.col; cx.shadowBlur = 18; }
          cx.fillStyle = q.col; cx.fillText(q.txt, 0, 0); cx.restore(); }
        cx.globalAlpha = 1;
      },
      drawFlash(cx, W, H){ if (J.flashA > 0){ cx.globalAlpha = J.flashA * 0.5; cx.fillStyle = J.flashC; cx.fillRect(0, 0, W, H); cx.globalAlpha = 1; } }
    };
    return J;
  }
  // offscreen canvas helper (static layers, redrawn only on resize)
  function bbLayer(W, H, dpr){ const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(W * dpr)); c.height = Math.max(1, Math.round(H * dpr)); const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return {c, x}; }
  // canvas + loop + timers + listeners, all undone by cleanup
  function kit(el){
    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden'; el.style.userSelect = 'none'; el.style.webkitUserSelect = 'none';
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none';
    el.appendChild(cv);
    const cx = cv.getContext('2d');
    const k = {cv, cx, on, W:1, H:1, dpr:1, onResize:null};
    const size = () => {
      const r = el.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
      if (W === k.W && H === k.H && cv.width === Math.round(W * d)) return;
      k.W = W; k.H = H; k.dpr = d; cv.width = Math.round(W * d); cv.height = Math.round(H * d); cx.setTransform(d, 0, 0, d, 0, 0);
      if (k.onResize) k.onResize();
    };
    on(window, 'resize', size); on(window, 'orientationchange', size);
    let ro = null; if (window.ResizeObserver){ ro = new ResizeObserver(size); ro.observe(el); }
    let raf = 0, last = 0, frameFn = null, dead = false;
    const loop = t => { if (dead) return; raf = requestAnimationFrame(loop); const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60; last = t; if (frameFn) frameFn(dt); };
    k.frame = f => { frameFn = f; };
    raf = requestAnimationFrame(loop);
    const tms = new Set();
    k.after = (ms, fn) => { const id = setTimeout(() => { tms.delete(id); if (!dead) fn(); }, ms); tms.add(id); return id; };
    k.pt = e => { const r = cv.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
    k.cleanup = () => { dead = true; cancelAnimationFrame(raf); frameFn = null; tms.forEach(clearTimeout); tms.clear(); offs.forEach(f => f()); offs.length = 0; if (ro) ro.disconnect(); el.innerHTML = ''; };
    k.size = size;
    return k;
  }
  // samples a gesture so a flick's speed comes from its last ~90ms
  function flickTracker(){
    const s = [];
    return {
      reset(p){ s.length = 0; s.push({x:p.x, y:p.y, t:performance.now()}); },
      add(p){ s.push({x:p.x, y:p.y, t:performance.now()}); if (s.length > 40) s.shift(); },
      vel(){ if (s.length < 2) return {vx:0, vy:0, dist:0}; const lastS = s[s.length - 1]; let i = s.length - 1; while (i > 0 && lastS.t - s[i - 1].t < 90) i--; const a = s[Math.max(0, i - 1)]; const dt = Math.max(0.016, (lastS.t - a.t) / 1000);
        return {vx:(lastS.x - a.x) / dt, vy:(lastS.y - a.y) / dt, dist:Math.hypot(lastS.x - s[0].x, lastS.y - s[0].y)}; }
    };
  }
  // Roll & Score: swipe the ball up a wooden lane; it hops off the ramp into a ring board (10-50, with 100 holes in the top corners).
  window.BreakGames.rollball = {
    start(el, api){
      const k = kit(el), cx = k.cx, RM = !!api.reducedMotion;
      const UI = bbFrame(el, api, {accent:'#ff5fd2', accent2:'#5a2a8a', glow:'rgba(255,95,210,.5)'});
      const J = bbJuice(api);
      const BALLS = 9, DECEL = 0.55, BD = 1.6; // board depth in board units (u -1..1 across, w 0..BD back)
      const CEN = {u:0, w:0.95}, RINGS = [{r:0.17, pts:50, col:'#ff4d6d'}, {r:0.34, pts:40, col:'#ffb020'}, {r:0.52, pts:30, col:'#36c2ff'}, {r:0.72, pts:20, col:'#7be05a'}];
      const HOLES = [{u:-0.8, w:1.43, r:0.13}, {u:0.8, w:1.43, r:0.13}];
      let L = {}, BG = null, GLOW = null, BALL = null;
      const layout = () => {
        const W = k.W, H = k.H, cxm = W / 2;
        const laneW = Math.min(W * 0.62, H * 0.62);
        L = {cxm, laneBot:H * 0.97, laneTop:H * 0.52, hwBot:laneW / 2, hwTop:laneW * 0.33,
             boardFront:H * 0.48, boardBack:H * 0.17, bhwFront:laneW * 0.5, bhwBack:laneW * 0.43, R:Math.max(14, laneW * 0.075)};
        buildBg();
      };
      const laneY = s => lerp(L.laneBot, L.laneTop, s), laneHW = s => lerp(L.hwBot, L.hwTop, s);
      const laneP = (x, s) => ({x: L.cxm + x * laneHW(s), y: laneY(s), sc: lerp(1, 0.62, s)});
      const boardP = (u, w) => { const t = w / BD; return {x: L.cxm + u * lerp(L.bhwFront, L.bhwBack, t), y: lerp(L.boardFront, L.boardBack, t), sc: lerp(0.55, 0.42, t)}; };
      const boardRX = w => lerp(L.bhwFront, L.bhwBack, w / BD), boardRY = () => (L.boardFront - L.boardBack) / BD;
      const poly = (x, pts) => { x.beginPath(); x.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i].x, pts[i].y); x.closePath(); };
      // ---------- the arcade, drawn once per size ----------
      function buildBg(){
        const W = k.W, H = k.H, d = k.dpr;
        BG = bbLayer(W, H, d); const x = BG.x;
        // back wall: deep purple with a soft light pool behind the board
        const wg = x.createLinearGradient(0, 0, 0, H); wg.addColorStop(0, '#1a0f33'); wg.addColorStop(0.55, '#24124a'); wg.addColorStop(1, '#0c0820'); x.fillStyle = wg; x.fillRect(0, 0, W, H);
        const pool = x.createRadialGradient(L.cxm, L.boardBack + 40, 10, L.cxm, L.boardBack + 40, Math.max(W, H) * 0.6); pool.addColorStop(0, 'rgba(255,90,200,.28)'); pool.addColorStop(0.5, 'rgba(90,60,220,.12)'); pool.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = pool; x.fillRect(0, 0, W, H);
        // wall panels
        x.strokeStyle = 'rgba(255,255,255,.04)'; x.lineWidth = 2; for (let px = 30; px < W; px += 60){ x.beginPath(); x.moveTo(px, 0); x.lineTo(px, H); x.stroke(); }
        // arcade carpet (cosmic pattern) at the bottom sides
        const cy = L.laneTop + 20, cg = x.createLinearGradient(0, cy, 0, H); cg.addColorStop(0, '#120a2a'); cg.addColorStop(1, '#1d0f3d'); x.fillStyle = cg; x.fillRect(0, cy, W, H - cy);
        const sh = ['#ff5fd2', '#36c2ff', '#ffd23f', '#7be05a'];
        for (let i = 0; i < 70; i++){ const px = Math.random() * W, py = cy + Math.random() * (H - cy); if (Math.abs(px - L.cxm) < L.hwBot + 50) continue; x.fillStyle = sh[i % 4]; x.globalAlpha = 0.35; x.beginPath();
          if (i % 3 === 0){ for (let j = 0; j < 5; j++){ const a = j * 1.2566 - 1.57; x.lineTo(px + Math.cos(a) * 5, py + Math.sin(a) * 5); x.lineTo(px + Math.cos(a + 0.628) * 2, py + Math.sin(a + 0.628) * 2); } } else x.arc(px, py, 2.5, 0, 7);
          x.fill(); }
        x.globalAlpha = 1;
        // cabinet side walls around the board (depth)
        const bl = boardP(-1.12, BD), br = boardP(1.12, BD), fr = boardP(1.12, 0), fl = boardP(-1.12, 0);
        const side = (p1, p2, sd) => { const o = 26; const g2 = x.createLinearGradient(p1.x, 0, p1.x + sd * o, 0); g2.addColorStop(0, '#3b1d6e'); g2.addColorStop(1, '#170b33');
          x.fillStyle = g2; poly(x, [p1, p2, {x:p2.x + sd * (o + 8), y:p2.y + 10}, {x:p1.x + sd * o, y:p1.y - 30}]); x.fill(); };
        side(bl, fl, -1); side(br, fr, 1);
        // header box for the neon sign
        const hg = x.createLinearGradient(0, L.boardBack - 44, 0, L.boardBack); hg.addColorStop(0, '#2a1652'); hg.addColorStop(1, '#170b33');
        x.fillStyle = hg; bbRR(x, bl.x - 24, L.boardBack - 46, br.x - bl.x + 48, 48, 12); x.fill(); x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1; x.stroke();
        // board surface: felt with grain
        const sg = x.createLinearGradient(0, L.boardBack, 0, L.boardFront); sg.addColorStop(0, '#16224a'); sg.addColorStop(1, '#203266');
        x.fillStyle = sg; poly(x, [bl, br, fr, fl]); x.fill();
        x.save(); poly(x, [bl, br, fr, fl]); x.clip(); x.globalAlpha = 0.08; for (let i = 0; i < 900; i++){ x.fillStyle = i % 2 ? '#fff' : '#000'; x.fillRect(bl.x + Math.random() * (br.x - bl.x + 40) - 20, L.boardBack + Math.random() * (L.boardFront - L.boardBack), 1, 1); } x.restore(); x.globalAlpha = 1;
        // rings, outer first: a raised ring wall with a lit rim
        const c = boardP(CEN.u, CEN.w), ry = boardRY(), rx = boardRX(CEN.w);
        x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(c.x, c.y + 6, 0.97 * rx, 0.97 * ry, 0, 0, 7); x.fill();
        for (let i = RINGS.length - 1; i >= 0; i--){
          const r = RINGS[i];
          const fg = x.createRadialGradient(c.x, c.y - r.r * ry * 0.6, 2, c.x, c.y, r.r * rx); fg.addColorStop(0, i % 2 ? '#34508f' : '#25396d'); fg.addColorStop(1, i % 2 ? '#273e75' : '#1a2a55');
          x.fillStyle = fg; x.beginPath(); x.ellipse(c.x, c.y, r.r * rx, r.r * ry, 0, 0, 7); x.fill();
          x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 5; x.beginPath(); x.ellipse(c.x, c.y + 2, r.r * rx, r.r * ry, 0, 0, 7); x.stroke();
          x.save(); x.shadowColor = r.col; x.shadowBlur = 10; x.strokeStyle = r.col; x.lineWidth = 3; x.beginPath(); x.ellipse(c.x, c.y, r.r * rx, r.r * ry, 0, 0, 7); x.stroke(); x.restore();
          const hy = c.y - (r.r - 0.09) * ry * (i === 0 ? 0 : 1);
          hole(x, c.x, hy, 0.085 * rx, 0.085 * ry * 0.75, r.col);
        }
        x.font = `800 ${clamp(rx * 0.1, 11, 20)}px ${HF}`; x.textAlign = 'center'; x.textBaseline = 'middle';
        for (let i = RINGS.length - 1; i >= 0; i--){ const r = RINGS[i]; const tx = i === 0 ? c.x : c.x + (r.r - 0.09) * rx * 0.75, ty = i === 0 ? c.y + 0.12 * ry : c.y + (r.r - 0.09) * ry * 0.55;
          numTag(x, String(r.pts), tx, ty, r.col, clamp(rx * 0.1, 11, 20)); }
        HOLES.forEach(h => { const p = boardP(h.u, h.w), hrx = h.r * boardRX(h.w), hry = h.r * ry;
          x.fillStyle = '#2b1150'; x.beginPath(); x.ellipse(p.x, p.y, hrx * 1.35, hry * 1.35, 0, 0, 7); x.fill();
          x.save(); x.shadowColor = '#ffd23f'; x.shadowBlur = 14; x.strokeStyle = '#ffd23f'; x.lineWidth = 3; x.beginPath(); x.ellipse(p.x, p.y, hrx * 1.35, hry * 1.35, 0, 0, 7); x.stroke(); x.restore();
          hole(x, p.x, p.y, hrx * 0.75, hry * 0.6, '#ffd23f');
          numTag(x, '100', p.x, p.y + hry * 1.05 + 9, '#ffd23f', clamp(rx * 0.1, 11, 20)); });
        numTag(x, '10', L.cxm, boardP(0, 0.1).y, '#9fb0d8', clamp(rx * 0.1, 11, 20));
        // board rim
        x.strokeStyle = '#6a7fd0'; x.lineWidth = 3; poly(x, [bl, br, fr, fl]); x.stroke();
        // ---- the lane ----
        const a = laneP(-1.1, 0), b2 = laneP(1.1, 0), c2 = laneP(1.1, 1), dd = laneP(-1.1, 1);
        // cabinet body around the lane
        const cab = (p, q, sd) => { const g2 = x.createLinearGradient(p.x, 0, p.x + sd * 60, 0); g2.addColorStop(0, '#5a2a8a'); g2.addColorStop(1, '#2a1250');
          x.fillStyle = g2; poly(x, [p, q, {x:q.x + sd * 26, y:q.y}, {x:p.x + sd * 48, y:p.y}]); x.fill();
          x.strokeStyle = 'rgba(255,95,210,.5)'; x.lineWidth = 2; x.beginPath(); x.moveTo(p.x + sd * 48, p.y); x.lineTo(q.x + sd * 26, q.y); x.stroke(); };
        cab(a, dd, -1); cab(b2, c2, 1);
        const lg = x.createLinearGradient(0, L.laneTop, 0, L.laneBot); lg.addColorStop(0, '#9a5a24'); lg.addColorStop(0.5, '#c98445'); lg.addColorStop(1, '#e3a564');
        x.fillStyle = lg; poly(x, [a, b2, c2, dd]); x.fill();
        x.save(); poly(x, [a, b2, c2, dd]); x.clip();
        // planks and grain
        for (let i = -6; i <= 6; i++){ const p1 = laneP(i / 6.6, 0), p2 = laneP(i / 6.6, 1); x.strokeStyle = 'rgba(70,35,10,.35)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(p1.x, p1.y); x.lineTo(p2.x, p2.y); x.stroke(); }
        for (let i = 0; i < 140; i++){ const u = Math.random() * 2.2 - 1.1, s0 = Math.random(), len = 0.04 + Math.random() * 0.12, p1 = laneP(u, s0), p2 = laneP(u + (Math.random() - 0.5) * 0.02, Math.min(1, s0 + len));
          x.strokeStyle = Math.random() < 0.5 ? 'rgba(90,45,15,.18)' : 'rgba(255,220,170,.14)'; x.lineWidth = 1; x.beginPath(); x.moveTo(p1.x, p1.y); x.quadraticCurveTo((p1.x + p2.x) / 2 + 2, (p1.y + p2.y) / 2, p2.x, p2.y); x.stroke(); }
        // lacquer shine
        const sh2 = x.createLinearGradient(L.cxm - L.hwBot, 0, L.cxm + L.hwBot, 0); sh2.addColorStop(0, 'rgba(255,255,255,0)'); sh2.addColorStop(0.42, 'rgba(255,255,255,.0)'); sh2.addColorStop(0.5, 'rgba(255,240,210,.22)'); sh2.addColorStop(0.58, 'rgba(255,255,255,0)');
        x.fillStyle = sh2; x.fillRect(0, L.laneTop, W, H);
        x.restore();
        // painted arrows
        x.fillStyle = 'rgba(255,255,255,.22)'; [0.25, 0.45, 0.65].forEach(s => { const p = laneP(0, s), w = laneHW(s) * 0.1; x.beginPath(); x.moveTo(p.x, p.y - w); x.lineTo(p.x + w, p.y + w * 0.4); x.lineTo(p.x - w, p.y + w * 0.4); x.fill(); });
        // chrome rails
        [[a, dd, -1], [b2, c2, 1]].forEach(([p, q, sd]) => { const g2 = x.createLinearGradient(p.x, 0, p.x + sd * 16, 0); g2.addColorStop(0, '#f4f7ff'); g2.addColorStop(0.5, '#9aa6c2'); g2.addColorStop(1, '#e2e8f6');
          x.fillStyle = g2; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.lineTo(q.x + sd * 10, q.y); x.lineTo(p.x + sd * 16, p.y); x.fill(); });
        // ramp hump at the top of the lane
        const r1 = laneP(-1.05, 1), r2 = laneP(1.05, 1); const rg = x.createLinearGradient(0, r1.y - L.R * 1.4, 0, r1.y + 6); rg.addColorStop(0, '#ffe0a8'); rg.addColorStop(0.5, '#d18a42'); rg.addColorStop(1, '#6e3a12');
        x.fillStyle = rg; x.beginPath(); x.moveTo(r1.x, r1.y + 4); x.quadraticCurveTo(L.cxm, r1.y - L.R * 1.6, r2.x, r2.y + 4); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(255,240,210,.6)'; x.lineWidth = 2; x.beginPath(); x.moveTo(r1.x + 6, r1.y + 1); x.quadraticCurveTo(L.cxm, r1.y - L.R * 1.45, r2.x - 6, r2.y + 1); x.stroke();
        // glow sprites for bulbs
        GLOW = {};
        for (const [name, col] of [['y', '255,210,63'], ['p', '255,95,210'], ['b', '80,200,255']]){ const z = 64, gl = bbLayer(z, z, d), gg = gl.x.createRadialGradient(z / 2, z / 2, 1, z / 2, z / 2, z / 2);
          gg.addColorStop(0, `rgba(255,255,255,1)`); gg.addColorStop(0.15, `rgba(${col},1)`); gg.addColorStop(0.4, `rgba(${col},.35)`); gg.addColorStop(1, `rgba(${col},0)`); gl.x.fillStyle = gg; gl.x.fillRect(0, 0, z, z); GLOW[name] = gl.c; }
        // the ball sprite (shading only; stripes roll on top)
        const bz = 128; BALL = bbLayer(bz, bz, 1); const bg = BALL.x.createRadialGradient(bz * 0.33, bz * 0.3, bz * 0.04, bz / 2, bz / 2, bz / 2);
        bg.addColorStop(0, '#fffaf0'); bg.addColorStop(0.45, '#ecd4a2'); bg.addColorStop(0.85, '#a37a40'); bg.addColorStop(1, '#6d4c22'); BALL.x.fillStyle = bg; BALL.x.beginPath(); BALL.x.arc(bz / 2, bz / 2, bz / 2 - 1, 0, 7); BALL.x.fill();
      }
      function hole(x, hx, hy, hrx, hry, rim){ const g2 = x.createRadialGradient(hx, hy - hry * 0.5, 1, hx, hy, hrx); g2.addColorStop(0, '#000'); g2.addColorStop(0.7, '#05030c'); g2.addColorStop(1, '#2a2048');
        x.fillStyle = g2; x.beginPath(); x.ellipse(hx, hy, hrx, hry, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(hx, hy + 1, hrx, hry, 0, 0.2, Math.PI - 0.2); x.stroke(); void rim; }
      function numTag(x, t, tx, ty, col, fs){ x.font = `800 ${fs}px ${HF}`; const w = x.measureText(t).width + fs * 0.7; x.fillStyle = 'rgba(10,8,30,.75)'; bbRR(x, tx - w / 2, ty - fs * 0.62, w, fs * 1.24, fs * 0.62); x.fill();
        x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, tx, ty + 1); }
      k.onResize = layout; k.size();

      let state = 'menu', ball = null, left = BALLS, score = 0, shown = 0, hint = 0, sunk = [], streak = 0, time = 0, hudBump = 0, glow = [];
      let trail = [];
      function newBall(){ ball = {mode:'rest', x:0, s:0.07, v:0, vx:0, spin:0, h:0, t:0, sq:0}; trail = []; }
      function begin(){ UI.hide(); state = 'play'; left = BALLS; score = 0; shown = 0; sunk = []; hint = 4; streak = 0; glow = []; J.clear(); newBall(); }
      function startScreen(){ state = 'menu'; newBall(); UI.start({emoji:'🎯', title:'Roll & Score', icon:'👆', how:'Swipe up to roll the ball. The small corner holes are worth <b>100!</b>', onPlay:begin}); }
      function finish(){ state = 'end'; const res = api.saveScore(score); if (res.isBest && score > 0) api.confetti(60);
        k.after(700, () => UI.end({emoji:'🎯', title: score >= 350 ? 'Arcade legend!' : score >= 250 ? 'Great rolling!' : 'Nice rolling!', score, unit:'points', res, stars:[150, 250, 350], extra:[`${sunk.filter(q => q.pts >= 50).length} bullseyes & corner shots`], onAgain:begin})); }
      // --- input ---
      const fl = flickTracker(); let drag = false;
      k.on(k.cv, 'pointerdown', e => { if (state !== 'play' || !ball || ball.mode !== 'rest') return; const p = k.pt(e); if (p.y < L.laneTop) return; drag = true; try { k.cv.setPointerCapture(e.pointerId); } catch(_){} fl.reset(p); ball.mode = 'hold'; });
      k.on(k.cv, 'pointermove', e => { if (!drag) return; const p = k.pt(e); fl.add(p); ball.x = clamp((p.x - L.cxm) / laneHW(ball.s), -0.8, 0.8); });
      const release = e => {
        if (!drag) return; drag = false; fl.add(k.pt(e)); const v = fl.vel(), laneLen = L.laneBot - L.laneTop;
        const vs = -v.vy / laneLen;
        if (vs < 0.5 || v.dist < 20){ ball.mode = 'rest'; hint = 2.5; return; }
        ball.v = clamp(vs * 0.8, 0, 3.8); ball.vx = clamp(v.vx / laneHW(0.1) * 0.35, -1.6, 1.6); ball.mode = 'roll'; hint = 0; ball.sq = 1;
      };
      k.on(k.cv, 'pointerup', release); k.on(k.cv, 'pointercancel', release);
      function scoreAt(u, w){
        for (let i = 0; i < HOLES.length; i++){ const h = HOLES[i]; if (Math.hypot(u - h.u, w - h.w) < h.r) return {pts:100, u:h.u, w:h.w, g:'h' + i}; }
        const d = Math.hypot(u - CEN.u, w - CEN.w);
        for (let i = 0; i < RINGS.length; i++){ const r = RINGS[i]; if (d < r.r) return {pts:r.pts, u:CEN.u, w:CEN.w + (r.pts === 50 ? 0 : r.r - 0.09), g:'r' + i}; }
        return {pts:10, u:clamp(u, -0.85, 0.85), w:0.1, g:'z'};
      }
      let pillScore = {x:0, y:12, w:100, h:52};
      const toScore = () => ({x:pillScore.x + pillScore.w * 0.6, y:pillScore.y + pillScore.h / 2});
      function landed(b){
        score += b.pts; left--;
        const p = boardP(b.tu, b.tw), pts = b.pts;
        J.text('+' + pts, p.x, p.y - 20, {col: pts === 100 ? '#ffd23f' : '#fff', size: pts >= 50 ? 36 : 28, to: toScore, onArrive: () => { shown += pts; hudBump = 1; }});
        J.ring(p.x, p.y, L.R * 0.8, pts === 100 ? '#ffd23f' : '#ffffff', 0.5);
        glow.push({g:b.g, t:0});
        if (pts >= 40) streak++; else streak = 0;
        if (pts === 100){ api.confetti(40); J.text('CORNER SHOT!', L.cxm, L.boardFront * 0.55, {col:'#ffd23f', size:42, big:true, life:1.3});
          J.burst(p.x, p.y, RM ? 12 : 40, {kind:'spark', cols:['#ffd23f', '#fff6b0', '#ff5fd2'], min:150, max:460, g:500}); J.shake(10); J.flash(0.35, '#ffe9a0'); J.hitPause(0.08); }
        else if (pts === 50){ J.text('BULLSEYE!', L.cxm, L.boardFront * 0.55, {col:'#ff9fb2', size:40, big:true, life:1.2});
          J.burst(p.x, p.y, RM ? 10 : 30, {kind:'spark', cols:['#ff4d6d', '#ffb3c1', '#fff'], min:140, max:400, g:500}); J.shake(6); J.flash(0.2, '#ffd6de'); J.hitPause(0.05); }
        else J.burst(p.x, p.y, RM ? 4 : 12, {cols:[RINGS.find(r => r.pts === pts) ? RINGS.find(r => r.pts === pts).col : '#9fb0d8', '#fff'], min:60, max:200, g:400});
        if (streak >= 2) J.text('HOT STREAK x' + streak, L.cxm, L.boardFront * 0.55 + 46, {col:'#ffb020', size:28, big:true, life:1.2});
        sunk.push({u:b.tu, w:b.tw, t:0, pts}); if (sunk.length > 12) sunk.shift();
      }
      function update(dt){
        time += dt; if (hudBump > 0) hudBump = Math.max(0, hudBump - dt * 3.5);
        for (let i = glow.length - 1; i >= 0; i--){ glow[i].t += dt; if (glow[i].t > 1.2) glow.splice(i, 1); }
        const b = ball; J.update(dt);
        if (hint > 0) hint -= dt;
        if (!b) return;
        b.t += dt; if (b.sq > 0) b.sq = Math.max(0, b.sq - dt * 4);
        if (b.mode === 'roll'){
          b.v -= DECEL * dt; b.s += b.v * dt; b.x += b.vx * dt; b.spin += b.v * dt * 9;
          if (Math.abs(b.x) > 0.84){ b.x = Math.sign(b.x) * 0.84; b.vx *= -0.55; const p = laneP(b.x, b.s); J.burst(p.x + Math.sign(b.x) * L.R * 0.6, p.y - L.R * 0.6, RM ? 2 : 6, {kind:'spark', col:'#fff', min:60, max:180, g:300}); }
          if (b.s >= 1){ // off the ramp
            const v1 = b.v, w = clamp((v1 - 0.18) * 0.62, 0.02, 1.9), T = 0.42 + 0.16 * w;
            b.mode = 'fly'; b.t = 0; b.T = T; b.fx = b.x; b.u0 = b.x * 0.7; b.w0 = -0.15;
            let u = clamp(b.x * 0.7 + b.vx * T * 0.6, -1.05, 1.05), bounced = false, ww = w;
            if (ww > BD - 0.05){ ww = BD - 0.3 - Math.random() * 0.25; bounced = true; }
            b.u1 = u; b.w1 = ww; b.bounced = bounced; b.wHit = w;
          }
          if (b.v <= 0 && b.s < 1){ b.mode = 'back'; b.v = 0; }
        } else if (b.mode === 'back'){
          b.v -= DECEL * 1.4 * dt; b.s += b.v * dt; b.spin += b.v * dt * 9;
          if (b.s <= 0.07){ b.s = 0.07; b.mode = 'rest'; b.v = 0; b.vx = 0; J.text('Roll harder!', L.cxm, laneY(0.35), {col:'#fff', size:28}); }
        } else if (b.mode === 'fly'){
          if (b.t >= b.T){
            if (Math.abs(b.u1) > 1){ b.u1 = Math.sign(b.u1) * 0.92; }
            const sc = scoreAt(b.u1, b.w1);
            b.mode = 'hop'; b.t = 0; b.hu = b.u1; b.hw = b.w1; b.tu = sc.u; b.tw = sc.w; b.pts = sc.pts; b.g = sc.g; b.sq = 1;
            const p = boardP(b.u1, b.w1); J.burst(p.x, p.y, RM ? 3 : 8, {col:'rgba(200,210,255,.8)', min:40, max:140, g:200, r0:2, r1:4});
            if (b.bounced) J.shake(4);
          }
        } else if (b.mode === 'hop'){
          if (b.t >= 0.55){
            landed(b);
            ball = null; trail = [];
            k.after(600, () => { if (state !== 'play') return; if (left <= 0) finish(); else newBall(); });
          }
        }
      }
      // --- drawing ---
      function drawBall(x, y, r, spin, sh, sqx, sqy){
        if (sh){ cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(sh.x, sh.y + r * 0.75, r * 0.95, r * 0.3, 0, 0, 7); cx.fill(); }
        cx.save(); cx.translate(x, y); if (sqx) cx.scale(sqx, sqy);
        cx.drawImage(BALL.c, -r, -r, r * 2, r * 2);
        cx.beginPath(); cx.arc(0, 0, r, 0, 7); cx.clip(); cx.strokeStyle = 'rgba(120,60,15,.45)'; cx.lineWidth = r * 0.16;
        const off = ((spin % 1) + 1) % 1; for (let i = -1; i < 2; i++){ const yy = (i + off) * r * 0.9 - r * 0.45; cx.beginPath(); cx.ellipse(0, yy, r, r * 0.25, 0, 0, 7); cx.stroke(); }
        cx.fillStyle = 'rgba(255,255,255,.75)'; cx.beginPath(); cx.ellipse(-r * 0.34, -r * 0.4, r * 0.22, r * 0.14, -0.6, 0, 7); cx.fill();
        cx.restore();
      }
      function drawLights(){
        const t = time * 3.2;
        for (let i = 0; i < 16; i++){ const y = lerp(L.boardBack - 8, L.laneTop + 10, i / 15);
          for (const sd of [-1, 1]){ const x = L.cxm + sd * (lerp(L.bhwBack, L.hwTop, i / 15) + 30); const on = (Math.floor(t) + i) % 3 === 0;
            const img = on ? GLOW.y : (i % 2 ? GLOW.p : GLOW.b); const z = on ? 30 : 20; cx.globalAlpha = on ? 1 : 0.55; cx.drawImage(img, x - z / 2, y - z / 2, z, z); } }
        cx.globalAlpha = 1;
      }
      function drawSign(){
        const fs = clamp(L.R * 1.3, 16, 28), y = L.boardBack - 22, flick = RM ? 1 : (Math.sin(time * 23) > 0.96 ? 0.6 : 1);
        cx.font = `800 ${fs}px ${HF}`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.save(); cx.globalAlpha = flick; cx.shadowColor = '#ff5fd2'; cx.shadowBlur = 18; cx.fillStyle = '#ffd6f4'; cx.fillText('★ ROLL & SCORE ★', L.cxm, y); cx.shadowBlur = 6; cx.fillText('★ ROLL & SCORE ★', L.cxm, y); cx.restore();
      }
      function draw(){
        const W = k.W, H = k.H;
        cx.save(); cx.translate(J.sx, J.sy);
        cx.drawImage(BG.c, 0, 0, W, H);
        drawSign(); drawLights();
        // ring / hole glow after a hit
        const c = boardP(CEN.u, CEN.w), ry = boardRY(), rx = boardRX(CEN.w);
        for (const gl of glow){ const a = (1 - gl.t / 1.2) * (0.7 + 0.3 * Math.sin(gl.t * 20)); if (gl.g === 'z') continue;
          cx.save(); cx.globalAlpha = a; cx.lineWidth = 6;
          if (gl.g[0] === 'r'){ const r = RINGS[+gl.g[1]]; cx.shadowColor = r.col; cx.shadowBlur = 24; cx.strokeStyle = r.col; cx.beginPath(); cx.ellipse(c.x, c.y, r.r * rx, r.r * ry, 0, 0, 7); cx.stroke(); }
          else { const h = HOLES[+gl.g[1]], p = boardP(h.u, h.w); cx.shadowColor = '#ffd23f'; cx.shadowBlur = 30; cx.strokeStyle = '#ffd23f'; cx.beginPath(); cx.ellipse(p.x, p.y, h.r * boardRX(h.w) * 1.35, h.r * ry * 1.35, 0, 0, 7); cx.stroke(); }
          cx.restore(); }
        sunk.forEach(s => { const p = boardP(s.u, s.w); cx.fillStyle = 'rgba(236,212,162,.5)'; cx.beginPath(); cx.ellipse(p.x, p.y, L.R * 0.38, L.R * 0.28, 0, 0, 7); cx.fill(); });
        const b = ball;
        // trail
        for (let i = 0; i < trail.length; i++){ const q = trail[i]; if (!q) continue; const a = (i + 1) / trail.length; cx.globalAlpha = a * 0.35; cx.fillStyle = '#ffe9c4'; cx.beginPath(); cx.arc(q.x, q.y, q.r * (0.4 + 0.6 * a), 0, 7); cx.fill(); }
        cx.globalAlpha = 1;
        let bp = null;
        if (b){
          const sq = b.sq > 0 ? Math.sin(b.sq * Math.PI) * 0.22 : 0;
          if (b.mode === 'rest' || b.mode === 'hold' || b.mode === 'roll' || b.mode === 'back'){ const p = laneP(b.x, b.s), r = L.R * p.sc; bp = {x:p.x, y:p.y - r, r};
            drawBall(p.x, p.y - r, r, b.spin, {x:p.x, y:p.y - r}, 1 - sq * 0.5, 1 + sq * 0.6); }
          else if (b.mode === 'fly'){
            const t = clamp(b.t / b.T, 0, 1), from = laneP(b.fx, 1), to = boardP(b.u1, b.bounced ? BD : b.w1);
            let x = lerp(from.x, to.x, t), gy = lerp(from.y, to.y, t), sc = lerp(0.62, to.sc, t), arc = Math.sin(Math.PI * t) * (k.H * 0.1 + b.wHit * k.H * 0.05);
            const r = L.R * sc; bp = {x, y:gy - arc - r, r};
            drawBall(x, gy - arc - r, r, b.spin + t * 3, {x, y:gy - r}, 1, 1);
          } else if (b.mode === 'hop'){
            const t = clamp(b.t / 0.55, 0, 1), u = lerp(b.hu, b.tu, t), w = lerp(b.hw, b.tw, t), p = boardP(u, w), hop = Math.abs(Math.sin(t * Math.PI * 2)) * (1 - t) * k.H * 0.035, r = L.R * p.sc * (t > 0.8 ? lerp(1, 0.5, (t - 0.8) / 0.2) : 1);
            const contact = 1 - Math.min(1, Math.abs(Math.sin(t * Math.PI * 2)) * 6) ; const s2 = t < 0.8 ? contact * 0.25 : 0;
            drawBall(p.x, p.y - hop - r, r, b.spin, {x:p.x, y:p.y - r}, 1 + s2, 1 - s2);
          }
        }
        // keep the trail as recent ball positions
        if (bp && b && (b.mode === 'roll' || b.mode === 'fly') && !RM){ trail.push(bp); if (trail.length > 10) trail.shift(); } else if (trail.length) trail.shift();
        J.drawParticles(cx); J.drawText(cx);
        cx.restore();
        J.drawFlash(cx, W, H);
        if (state !== 'menu'){
          pillScore = bbPill(cx, W - 12, 12, 'Score', shown, {icon:'⭐', align:'right', bump:hudBump, h:52});
          const ballsW = BALLS * 13;
          const pl = bbPill(cx, 12, 12, 'Balls', left, {icon:'🎳', h:52, extraW:ballsW + 6});
          for (let i = 0; i < BALLS; i++){ const bx = pl.x + pl.w - ballsW - 8 + i * 13 + 6, by = pl.y + pl.h / 2;
            if (i < left) cx.drawImage(BALL.c, bx - 5.5, by - 5.5, 11, 11); else { cx.fillStyle = 'rgba(255,255,255,.15)'; cx.beginPath(); cx.arc(bx, by, 4, 0, 7); cx.fill(); } }
          if (streak >= 2) bbPill(cx, W / 2, 12, 'Streak', 'x' + streak, {icon:'🔥', align:'center', h:52, fg:'#ffe066'});
          if (hint > 0 && ball && ball.mode === 'rest'){ cx.globalAlpha = clamp(hint, 0, 1) * (0.8 + 0.2 * Math.sin(time * 5)); bbPill(cx, L.cxm, laneY(0.38), 'How to', 'Swipe up to roll!', {icon:'👆', align:'center', h:50}); cx.globalAlpha = 1; }
        }
      }
      k.frame(dt => {
        if (J.pause > 0){ J.pause -= dt; dt = 0; }
        if (state === 'play' || state === 'end') update(dt); else { time += dt; J.update(dt); }
        draw();
      });
      el.__rb = () => ({state, mode: ball ? ball.mode : null, left, score}); // read-only peek for automated tests
      startScreen();
      return () => { UI.destroy(); k.cleanup(); delete el.__rb; };
    }
  };
})();
