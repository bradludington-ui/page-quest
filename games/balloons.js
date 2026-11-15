// Brain Break game: balloons (Balloon Pop). Self-contained: canvas + DOM overlay, no images or libraries.
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
  // Balloon Pop: balloons float up a carnival booth; tap or flick to throw a soft suction ball (slight arc). 60 seconds.
  window.BreakGames.balloons = {
    start(el, api){
      const k = kit(el), cx = k.cx, RM = !!api.reducedMotion;
      const UI = bbFrame(el, api, {accent:'#ff4d6d', accent2:'#b3203a', glow:'rgba(255,77,109,.5)'});
      const J = bbJuice(api);
      const COLS = ['#ff4d6d', '#ffb020', '#36c2ff', '#7be05a', '#b07cff', '#ff7ad9', '#2ee6c5'];
      const KINDS = [{r:0.068, sp:0.13, pts:10, w:5}, {r:0.052, sp:0.18, pts:20, w:4}, {r:0.038, sp:0.26, pts:30, w:3}];
      let reload = 0, state = 'menu', time = 60, score = 0, shown = 0, balloons = [], balls = [], spawnT = 0, rainbowT = 10, elapsed = 0, popped = 0, hint = 0, clock = 0, hudBump = 0, streak = 0, lastPop = -9, aim = null;
      const M = () => Math.min(k.W, k.H), launch = () => ({x:k.W / 2, y:k.H - M() * 0.07});
      const awnH = () => Math.max(46, M() * 0.11), counterH = () => M() * 0.12;
      // ---------- cached art (rebuilt on resize) ----------
      let BG = null, FG = null, SPR = null, GL = null, BALLS = null;
      function shade(hex, f){ const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; if (f < 0){ r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } return `rgb(${r | 0},${g | 0},${b | 0})`; }
      function balloonSprite(col, rainbow){
        const w = 120, h = 150, L = bbLayer(w, h, Math.min(2, k.dpr)), x = L.x, cxm = w / 2, cy = 66, rx = 50, ry = 60;
        let f;
        if (rainbow){ f = x.createLinearGradient(cxm - rx, cy - ry, cxm + rx, cy + ry); COLS.forEach((c, i) => f.addColorStop(i / (COLS.length - 1), c)); }
        else { f = x.createRadialGradient(cxm - 16, cy - 22, 4, cxm, cy, ry * 1.05); f.addColorStop(0, shade(col, 0.55)); f.addColorStop(0.45, col); f.addColorStop(1, shade(col, -0.45)); }
        x.fillStyle = f; x.beginPath(); x.ellipse(cxm, cy, rx, ry, 0, 0, 7); x.fill();
        if (rainbow){ const sh = x.createRadialGradient(cxm - 16, cy - 22, 4, cxm, cy, ry * 1.05); sh.addColorStop(0, 'rgba(255,255,255,.45)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.3)'); x.fillStyle = sh; x.beginPath(); x.ellipse(cxm, cy, rx, ry, 0, 0, 7); x.fill(); }
        // knot
        x.fillStyle = rainbow ? '#b07cff' : shade(col, -0.3); x.beginPath(); x.moveTo(cxm, cy + ry - 2); x.lineTo(cxm - 7, cy + ry + 10); x.quadraticCurveTo(cxm, cy + ry + 6, cxm + 7, cy + ry + 10); x.closePath(); x.fill();
        // rim light and gloss
        x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 3; x.beginPath(); x.ellipse(cxm, cy, rx - 3, ry - 3, 0, 0.3, 1.4); x.stroke();
        x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.ellipse(cxm - 18, cy - 26, 9, 16, -0.5, 0, 7); x.fill();
        x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.arc(cxm - 8, cy - 42, 3.5, 0, 7); x.fill();
        if (rainbow){ x.font = `800 30px ${HF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 5; x.strokeStyle = 'rgba(80,20,90,.6)'; x.strokeText('+5s', cxm, cy + 2); x.fillStyle = '#fff'; x.fillText('+5s', cxm, cy + 2); }
        return L.c;
      }
      function build(){
        const W = k.W, H = k.H, d = k.dpr, ah = awnH(), ch = counterH();
        // back wall: warm lit planks with a dark vignette
        BG = bbLayer(W, H, d); let x = BG.x;
        const wg = x.createLinearGradient(0, 0, 0, H); wg.addColorStop(0, '#3a1a4f'); wg.addColorStop(0.5, '#5a2a5e'); wg.addColorStop(1, '#2a1238'); x.fillStyle = wg; x.fillRect(0, 0, W, H);
        const pw = Math.max(40, M() * 0.09);
        for (let px = 0, i = 0; px < W; px += pw, i++){ x.fillStyle = i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.06)'; x.fillRect(px, 0, pw, H); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(px, 0, 2, H);
          for (let j = 0; j < 6; j++){ x.strokeStyle = 'rgba(255,220,255,.05)'; x.lineWidth = 1; x.beginPath(); const gx = px + 6 + Math.random() * (pw - 12); x.moveTo(gx, Math.random() * H); x.lineTo(gx + (Math.random() - 0.5) * 6, Math.random() * H); x.stroke(); } }
        // star decals
        x.font = `${Math.round(M() * 0.05)}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.globalAlpha = 0.16;
        for (let i = 0; i < 10; i++) x.fillText('★', (i * 0.137 % 1) * W, ah + 30 + ((i * 0.53) % 1) * (H - ah - ch - 60));
        x.globalAlpha = 1;
        // warm light pools from the bulbs
        const pool = x.createRadialGradient(W / 2, ah, 10, W / 2, ah, Math.max(W, H) * 0.75); pool.addColorStop(0, 'rgba(255,200,120,.35)'); pool.addColorStop(0.6, 'rgba(255,140,120,.08)'); pool.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = pool; x.fillRect(0, 0, W, H);
        const vg = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.4)'); x.fillStyle = vg; x.fillRect(0, 0, W, H);
        // foreground: awning, posts, prizes, counter
        FG = bbLayer(W, H, d); x = FG.x;
        // posts
        const postW = Math.max(14, M() * 0.03);
        for (const px of [0, W - postW]){ const pg = x.createLinearGradient(px, 0, px + postW, 0); pg.addColorStop(0, '#8a5a2b'); pg.addColorStop(0.5, '#c9894a'); pg.addColorStop(1, '#6b411c'); x.fillStyle = pg; x.fillRect(px, 0, postW, H); }
        // awning stripes with a scalloped edge
        const sw = Math.max(44, W / 12);
        for (let i = 0, px = 0; px < W; px += sw, i++){
          const ag = x.createLinearGradient(0, 0, 0, ah); ag.addColorStop(0, i % 2 ? '#fff4e6' : '#e8283e'); ag.addColorStop(1, i % 2 ? '#e7d6c4' : '#b0182b');
          x.fillStyle = ag; x.beginPath(); x.moveTo(px, 0); x.lineTo(px + sw, 0); x.lineTo(px + sw, ah * 0.78); x.arc(px + sw / 2, ah * 0.78, sw / 2, 0, Math.PI); x.closePath(); x.fill();
          x.fillStyle = 'rgba(0,0,0,.16)'; x.beginPath(); x.arc(px + sw / 2, ah * 0.78, sw / 2, 0.15, Math.PI - 0.15); x.lineTo(px + sw / 2, ah * 0.78); x.fill();
        }
        x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 0, W, 4);
        // the counter
        const cy = H - ch;
        const tg = x.createLinearGradient(0, cy - 10, 0, cy + 6); tg.addColorStop(0, '#e2a868'); tg.addColorStop(1, '#9a5f2a'); x.fillStyle = tg; x.fillRect(0, cy - 8, W, 14);
        x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(0, cy - 8, W, 2);
        for (let px = 0, i = 0; px < W; px += 36, i++){ x.fillStyle = i % 2 ? '#fff0e0' : '#e8283e'; x.fillRect(px, cy + 6, 36, ch); }
        const cs = x.createLinearGradient(0, cy + 6, 0, H); cs.addColorStop(0, 'rgba(0,0,0,.35)'); cs.addColorStop(0.25, 'rgba(0,0,0,.05)'); cs.addColorStop(1, 'rgba(0,0,0,.3)'); x.fillStyle = cs; x.fillRect(0, cy + 6, W, ch);
        // gold trim with rivets
        x.fillStyle = '#f2c14e'; x.fillRect(0, cy + 6, W, 4); for (let px = 18; px < W; px += 48){ x.fillStyle = '#ffe29a'; x.beginPath(); x.arc(px, cy + 8, 2.4, 0, 7); x.fill(); }
        // prizes on the counter corners
        const ps = Math.round(M() * 0.075); x.font = `${ps}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'bottom';
        const prize = (t, px) => { x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.ellipse(px, cy - 4, ps * 0.42, ps * 0.1, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.fillText(t, px, cy - 2); };
        if (W > 520){ prize('🧸', postW + ps * 0.7); prize('🦄', postW + ps * 1.6); prize('🐻', W - postW - ps * 0.7); prize('🐙', W - postW - ps * 1.6); }
        else { prize('🧸', postW + ps * 0.6); prize('🦄', W - postW - ps * 0.6); }
        // sprites
        SPR = {}; COLS.forEach(c => { SPR[c] = balloonSprite(c, false); }); SPR.rainbow = balloonSprite(null, true);
        const z = 48, g = bbLayer(z, z, d), gg = g.x.createRadialGradient(z / 2, z / 2, 1, z / 2, z / 2, z / 2); gg.addColorStop(0, 'rgba(255,255,240,1)'); gg.addColorStop(0.2, 'rgba(255,214,120,1)'); gg.addColorStop(0.5, 'rgba(255,190,90,.3)'); gg.addColorStop(1, 'rgba(255,170,80,0)');
        g.x.fillStyle = gg; g.x.fillRect(0, 0, z, z); GL = g.c;
        const bz = 64; BALLS = bbLayer(bz, bz, 1); const bg = BALLS.x.createRadialGradient(bz * 0.36, bz * 0.32, 2, bz / 2, bz / 2, bz / 2); bg.addColorStop(0, '#fffbd0'); bg.addColorStop(0.45, '#ffe14d'); bg.addColorStop(1, '#c99400');
        BALLS.x.fillStyle = bg; BALLS.x.beginPath(); BALLS.x.arc(bz / 2, bz / 2, bz / 2 - 1, 0, 7); BALLS.x.fill();
        BALLS.x.fillStyle = '#ff7a00'; BALLS.x.beginPath(); BALLS.x.arc(bz / 2, bz / 2, bz * 0.2, 0, 7); BALLS.x.fill(); BALLS.x.fillStyle = 'rgba(255,255,255,.6)'; BALLS.x.beginPath(); BALLS.x.ellipse(bz * 0.36, bz * 0.3, bz * 0.12, bz * 0.07, -0.6, 0, 7); BALLS.x.fill();
      }
      k.onResize = build; k.size();
      // ---------- rules (unchanged) ----------
      function spawn(rainbow){
        const kd = rainbow ? KINDS[1] : pick(), r = kd.r * M() * (0.9 + Math.random() * 0.2), hard = clamp(elapsed / 60, 0, 1);
        balloons.push({x:rnd(r + 10, k.W - r - 10), y:k.H + r * 1.5, r, vy:-(kd.sp * (1 + hard * 0.6) * k.H * (0.85 + Math.random() * 0.3) + (rainbow ? k.H * 0.05 : 0)), ph:Math.random() * 7, sw:rnd(10, 26), col:COLS[Math.floor(Math.random() * COLS.length)], pts:rainbow ? 25 : kd.pts, rainbow:!!rainbow, alive:true});
      }
      function pick(){ const t = KINDS.reduce((a, b) => a + b.w, 0); let x = Math.random() * t; for (const kd of KINDS){ x -= kd.w; if (x <= 0) return kd; } return KINDS[0]; }
      function begin(){ UI.hide(); state = 'play'; time = 60; score = 0; shown = 0; balloons = []; balls = []; J.clear(); spawnT = 0; rainbowT = rnd(9, 14); elapsed = 0; popped = 0; hint = 4; streak = 0; lastPop = -9; for (let i = 0; i < 4; i++){ spawn(false); balloons[i].y = k.H * (0.45 + i * 0.13); } }
      function startScreen(){ state = 'menu'; balloons = []; for (let i = 0; i < 7; i++){ spawn(false); balloons[i].y = k.H * (0.2 + Math.random() * 0.7); }
        UI.start({emoji:'🎈', title:'Balloon Pop', icon:'👆', how:'Tap or flick to throw a ball. Small balloons are worth more, and 🌈 adds <b>time!</b>', onPlay:begin}); }
      function finish(){ state = 'end'; const res = api.saveScore(score); if (res.isBest && score > 0) api.confetti(60);
        k.after(800, () => UI.end({emoji:'🎈', title:"Time's up!", score, unit:'points', res, stars:[200, 450, 750], extra:[`🎈 ${popped} balloon${popped === 1 ? '' : 's'} popped`], onAgain:begin})); }
      // --- input: a tap throws at that spot, a flick throws that way ---
      const fl = flickTracker(); let down = false;
      k.on(k.cv, 'pointerdown', e => { if (state !== 'play') return; down = true; try { k.cv.setPointerCapture(e.pointerId); } catch(_){} const p = k.pt(e); fl.reset(p); aim = {x:p.x, y:p.y, t:0}; });
      k.on(k.cv, 'pointermove', e => { if (down){ const p = k.pt(e); fl.add(p); if (aim){ aim.x = p.x; aim.y = p.y; } } });
      const up = e => {
        if (!down) return; down = false; const p = k.pt(e); fl.add(p); if (state !== 'play') return;
        if (reload > 0 || balls.filter(b => !b.stuck).length >= 2) return; reload = 0.35;
        const o = launch(), g = k.H * 0.55, v = fl.vel(); let vx, vy;
        if (v.dist > 40 && Math.hypot(v.vx, v.vy) > 300 && v.vy < 0){
          const sp = clamp(Math.hypot(v.vx, v.vy) * 1.1, k.H * 1.1, k.H * 2.6), d = Math.hypot(v.vx, v.vy); vx = v.vx / d * sp; vy = v.vy / d * sp;
        } else {
          const tx = p.x, ty = Math.min(p.y, o.y - 20), T = clamp(Math.hypot(tx - o.x, ty - o.y) / (k.H * 1.7), 0.22, 0.6);
          vx = (tx - o.x) / T; vy = (ty - o.y - 0.5 * g * T * T) / T;
        }
        balls.push({x:o.x, y:o.y, vx, vy, g, t:0, r:M() * 0.028, stuck:false, life:0, hits:0, tr:[]}); hint = 0;
        J.burst(o.x, o.y, RM ? 2 : 6, {col:'rgba(255,240,200,.9)', a:-Math.PI / 2, spread:1.4, min:60, max:160, g:300});
      };
      k.on(k.cv, 'pointerup', up); k.on(k.cv, 'pointercancel', up);
      let pillScore = {x:0, y:12, w:100, h:52};
      const toScore = () => ({x:pillScore.x + pillScore.w * 0.6, y:pillScore.y + pillScore.h / 2});
      function burst(b){
        b.alive = false; popped++;
        let pts = b.pts; score += pts;
        // rubber shreds, sparks and a shock ring
        J.burst(b.x, b.y, RM ? 8 : 18, {kind:'confetti', cols:b.rainbow ? COLS : [b.col, shade(b.col, -0.25), shade(b.col, 0.3)], min:120, max:360, g:700, r0:4, r1:8});
        if (!RM) J.burst(b.x, b.y, 10, {kind:'spark', cols:['#fff', '#fff6c8'], min:200, max:420, g:0, life:0.6, drag:4});
        J.ring(b.x, b.y, b.r, '#ffffff', 0.35);
        if (b.rainbow){ time += 5; J.text('🌈 +5 seconds!', b.x, b.y - 40, {col:'#ffd23f', size:34, big:true, life:1.3}); api.confetti(30); J.flash(0.3, '#fff3c4'); J.hitPause(0.06); }
        J.text('+' + pts, b.x, b.y - b.r, {col:'#fff', size: pts >= 30 ? 32 : 26, to:toScore, onArrive:() => { shown += pts; hudBump = 1; }});
        if (clock - lastPop < 1.4) streak++; else streak = 1; lastPop = clock;
        if (streak >= 3 && streak % 1 === 0) J.text(streak >= 6 ? 'ON FIRE! x' + streak : 'STREAK x' + streak, k.W / 2, k.H * 0.36, {col:streak >= 6 ? '#ff9f43' : '#7ee8ff', size:streak >= 6 ? 40 : 32, big:true, life:0.9});
      }
      function update(dt){
        clock += dt; if (hudBump > 0) hudBump = Math.max(0, hudBump - dt * 3.5);
        if (aim){ aim.t += dt; if (!down && aim.t > 0.4) aim = null; }
        if (state === 'play'){
          elapsed += dt; time -= dt;
          spawnT -= dt; if (spawnT <= 0){ spawn(false); spawnT = lerp(0.85, 0.45, clamp(elapsed / 60, 0, 1)) * rnd(0.7, 1.3); }
          rainbowT -= dt; if (rainbowT <= 0){ spawn(true); rainbowT = rnd(11, 16); }
          if (clock - lastPop > 1.4) streak = 0;
          if (time <= 0){ time = 0; finish(); }
        }
        balloons.forEach(b => { b.y += b.vy * dt; b.ph += dt * 1.6; });
        for (let i = balloons.length - 1; i >= 0; i--){ const b = balloons[i]; if (!b.alive || b.y < -b.r * 3) balloons.splice(i, 1); }
        balls.forEach(bl => {
          bl.life += dt;
          if (!bl.stuck){
            bl.t += dt; bl.vy += bl.g * dt; bl.x += bl.vx * dt; bl.y += bl.vy * dt;
            if (!RM){ bl.tr.push(bl.x, bl.y); if (bl.tr.length > 16) bl.tr.splice(0, 2); }
            if (state === 'play') balloons.forEach(b => { if (b.alive){ const bx = b.x + Math.sin(b.ph) * b.sw * 0.3; if (Math.hypot(bl.x - bx, (bl.y - b.y) * 0.88) < b.r + bl.r){ b.x = bx; burst(b); bl.hits++; if (bl.hits === 2){ score += 15; J.text('DOUBLE! +15', bl.x, bl.y - 30, {col:'#ffd23f', size:34, big:true, to:toScore, onArrive:() => { shown += 15; hudBump = 1; }}); J.shake(6); } } } });
            if (bl.t > 0.7 || bl.y < bl.r || bl.x < bl.r || bl.x > k.W - bl.r){ bl.stuck = true; bl.life = 0; bl.x = clamp(bl.x, bl.r, k.W - bl.r); bl.y = Math.max(bl.y, bl.r); bl.tr.length = 0; }
          }
        });
        for (let i = balls.length - 1; i >= 0; i--) if (balls[i].stuck && balls[i].life > 0.9) balls.splice(i, 1);
        J.update(dt);
        if (hint > 0) hint -= dt;
        if (reload > 0) reload -= dt;
      }
      // ---------- drawing ----------
      function drawBalloon(b){
        const x = b.x + Math.sin(b.ph) * b.sw * 0.3, y = b.y, r = b.r, wob = Math.sin(b.ph * 2.3) * 0.03;
        cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 1.4; cx.beginPath(); cx.moveTo(x, y + r * 1.18); cx.bezierCurveTo(x + Math.sin(b.ph * 1.3) * 10, y + r * 1.7, x - Math.sin(b.ph * 1.1) * 8, y + r * 2.2, x + Math.sin(b.ph) * 4, y + r * 2.8); cx.stroke();
        const sw = r * 2.4 * (1 + wob), sh = r * 3 * (1 - wob);
        cx.drawImage(b.rainbow ? SPR.rainbow : SPR[b.col], x - sw / 2, y - r * 1.32 * (1 - wob), sw, sh);
      }
      function drawBall(x, y, r, sqx, sqy){ cx.save(); cx.translate(x, y); cx.scale(sqx, sqy); cx.drawImage(BALLS.c, -r, -r, r * 2, r * 2); cx.restore(); }
      function draw(){
        const W = k.W, H = k.H, ah = awnH();
        cx.save(); cx.translate(J.sx, J.sy);
        cx.drawImage(BG.c, 0, 0, W, H);
        // balloon shadows on the back wall, then balloons
        cx.fillStyle = 'rgba(0,0,0,.18)'; for (const b of balloons){ const x = b.x + Math.sin(b.ph) * b.sw * 0.3; cx.beginPath(); cx.ellipse(x + b.r * 0.35, b.y + b.r * 0.3, b.r * 0.85, b.r, 0, 0, 7); cx.fill(); }
        balloons.forEach(drawBalloon);
        // thrown balls with trails
        for (const b of balls){
          if (b.tr.length > 2){ for (let i = 0; i < b.tr.length; i += 2){ const a = i / b.tr.length; cx.globalAlpha = a * 0.4; cx.fillStyle = '#fff3a6'; cx.beginPath(); cx.arc(b.tr[i], b.tr[i + 1], b.r * (0.3 + 0.6 * a), 0, 7); cx.fill(); } cx.globalAlpha = 1; }
          const a = b.stuck ? clamp(1 - (b.life - 0.5) / 0.4, 0, 1) : 1, sq = b.stuck ? 1 + Math.min(b.life * 6, 1) * 0.25 : 1;
          cx.globalAlpha = a; drawBall(b.x, b.y, b.r, sq, 1 / sq); cx.globalAlpha = 1;
        }
        J.drawParticles(cx);
        // foreground booth (awning, posts, counter)
        cx.drawImage(FG.c, 0, 0, W, H);
        // string lights under the awning
        const sw = Math.max(44, W / 12), ly = ah * 0.78;
        cx.strokeStyle = '#2b1a10'; cx.lineWidth = 2; cx.beginPath(); for (let px = 0; px <= W + sw; px += sw / 2){ const yy = ly + sw * 0.5 + 6 + Math.sin(px / sw * Math.PI) * 6; px === 0 ? cx.moveTo(px, yy) : cx.lineTo(px, yy); } cx.stroke();
        for (let px = sw / 4, i = 0; px < W; px += sw / 2, i++){ const yy = ly + sw * 0.5 + 6 + Math.sin(px / sw * Math.PI) * 6, on = RM ? 1 : 0.6 + 0.4 * Math.sin(clock * 3 + i * 1.7);
          cx.globalAlpha = on; cx.drawImage(GL, px - 14, yy - 10, 28, 28); cx.globalAlpha = 1; cx.fillStyle = i % 3 === 0 ? '#ffe9a8' : i % 3 === 1 ? '#ffb3c6' : '#b9ecff'; cx.beginPath(); cx.arc(px, yy + 4, 3.5, 0, 7); cx.fill(); }
        // the launcher ball resting on the counter
        if (state === 'play'){ const o = launch(), r = M() * 0.028, ready = reload <= 0 && balls.filter(b => !b.stuck).length < 2;
          cx.globalAlpha = ready ? 1 : 0.45; cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(o.x, o.y + r * 0.9, r, r * 0.3, 0, 0, 7); cx.fill(); drawBall(o.x, o.y - (ready ? Math.abs(Math.sin(clock * 4)) * 3 : 0), r, 1, 1); cx.globalAlpha = 1; }
        // aim reticle
        if (aim && state === 'play'){ const a = clamp(1 - aim.t / 0.4, 0, 1) * (down ? 1 : 0.8); cx.globalAlpha = down ? 0.9 : a; cx.strokeStyle = '#fff'; cx.lineWidth = 2.5; const rr = 16 + (down ? Math.sin(clock * 10) * 2 : aim.t * 30);
          cx.beginPath(); cx.arc(aim.x, aim.y, rr, 0, 7); cx.stroke(); cx.beginPath(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ cx.moveTo(aim.x + dx * rr * 0.55, aim.y + dy * rr * 0.55); cx.lineTo(aim.x + dx * rr * 1.35, aim.y + dy * rr * 1.35); } cx.stroke(); cx.globalAlpha = 1; }
        J.drawText(cx);
        cx.restore();
        J.drawFlash(cx, W, H);
        if (state !== 'menu'){
          pillScore = bbPill(cx, W - 12, 10, 'Score', shown, {icon:'⭐', align:'right', bump:hudBump, h:52});
          const tt = Math.ceil(time), low = tt <= 10 && state === 'play';
          const pulse = low && !RM ? (clock % 1) : 0;
          bbPill(cx, 12, 10, 'Time', tt, {icon:'⏱️', h:52, bg: low ? 'rgba(200,30,50,.8)' : null, bump:pulse});
          if (streak >= 3) bbPill(cx, W / 2, 10, 'Streak', 'x' + streak, {icon:'🔥', align:'center', h:52, fg:'#ffe066'});
          if (hint > 0){ cx.globalAlpha = clamp(hint, 0, 1); bbPill(cx, W / 2, H * 0.42, 'How to', 'Tap a balloon or flick!', {icon:'👆', align:'center', h:50}); cx.globalAlpha = 1; }
        }
      }
      k.frame(dt => {
        if (J.pause > 0){ J.pause -= dt; dt = 0; }
        if (state === 'menu'){ clock += dt; balloons.forEach(b => { b.y += b.vy * dt * 0.4; b.ph += dt; if (b.y < -b.r * 3) b.y = k.H + b.r * 2; }); J.update(dt); } else update(dt);
        draw();
      });
      el.__balloons = () => ({state, score, balloons, time}); // read-only peek for automated tests
      startScreen();
      return () => { UI.destroy(); k.cleanup(); delete el.__balloons; };
    }
  };
})();
