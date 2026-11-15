// Tower Stacker: a crane swings a building floor back and forth above the tower; tap to drop it.
// Whatever hangs over the edge is sliced off and falls away. A perfect drop keeps the width (3 in a row grows it back).
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
  window.BreakGames.stack = {
    start(el, api){
      const RM = !!api.reducedMotion;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.style.overflow = 'hidden';
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.appendChild(cv);
      const cx = cv.getContext('2d');
      const UI = bbFrame(el, api, {accent:'#ffb347', accent2:'#5b3a8c', glow:'rgba(255,170,90,.5)'});
      const J = bbJuice(api);

      let W = 0, H = 0, dpr = 1, raf = 0, last = 0, alive = true;
      // world units: tower centred on x=0, block height BH; scale s maps units to pixels.
      const BH = 30, BASE_W = 200;
      let s = 1;
      const g = {
        mode: 'start', tower: [], cur: null, dir: 1, speed: 120, cam: 0, camT: 0,
        bits: [], streak: 0, score: 0, over: 0, falling: null, time: 0, perfects: 0, land: null, hudBump: 0, shown: 0
      };
      el.__stack = g; // read-only peek for automated tests
      const range = () => Math.min(W/s/2 - 8, 250);
      const groundY = () => H - Math.max(54, H*0.1);
      const sy = u => groundY() - (u - g.cam)*s;          // world height -> screen y
      const sx = u => W/2 + u*s;
      const PAL = [];
      const colorOf = n => {
        if (PAL[n]) return PAL[n];
        if (n === 0) return (PAL[0] = {f:'#8d97ab', t:'#c3cad8', b:'#5d6678', n:0});
        const h = (205 + n*23) % 360;
        return (PAL[n] = {f:`hsl(${h},58%,56%)`, t:`hsl(${h},75%,74%)`, b:`hsl(${h},50%,38%)`, n});
      };

      // ---------- static layers (rebuilt on resize) ----------
      let L = null;
      const STARS = []; for (let i = 0; i < 160; i++) STARS.push({x: Math.random(), y: Math.random(), r: Math.random()*1.4 + 0.3, a: 0.4 + Math.random()*0.6});
      const TWINK = []; for (let i = 0; i < 18; i++) TWINK.push({x: Math.random(), y: Math.random(), p: Math.random()*7, r: 1.5 + Math.random()*1.5});
      const CLOUDS = []; for (let i = 0; i < 9; i++) CLOUDS.push({x: Math.random(), h: 300 + i*110 + Math.random()*60, v: 6 + Math.random()*12, k: i % 3, sc: 0.7 + Math.random()*0.6});
      function skyline(w, h, far){
        const Ly = bbLayer(w, h, dpr), x = Ly.x;
        let px = -20; const seed = far ? 7 : 3; let r = seed;
        const rand = () => { r = (r*9301 + 49297) % 233280; return r/233280; };
        while (px < w + 20){
          const bw = (far ? 38 : 54) + rand()*(far ? 50 : 70), bh = h*(far ? 0.35 + rand()*0.55 : 0.2 + rand()*0.45);
          const gr = x.createLinearGradient(0, h - bh, 0, h);
          if (far){ gr.addColorStop(0, '#b4c8ea'); gr.addColorStop(1, '#94abd6'); } else { gr.addColorStop(0, '#7f93c4'); gr.addColorStop(1, '#5d6fa0'); }
          x.fillStyle = gr; x.fillRect(px, h - bh, bw, bh);
          x.fillStyle = far ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.1)'; x.fillRect(px, h - bh, bw, 3);
          if (rand() < 0.35){ x.fillStyle = far ? '#a3b7dc' : '#6c80b2'; x.fillRect(px + bw*0.4, h - bh - 14, 4, 14); }
          // lit windows
          const ws = far ? 9 : 12;
          for (let wy = h - bh + 10; wy < h - 8; wy += ws*1.6) for (let wx = px + 6; wx < px + bw - 8; wx += ws*1.4){
            const q = rand(); if (q < 0.45) continue;
            x.fillStyle = q > 0.85 ? 'rgba(255,240,190,.9)' : far ? 'rgba(235,245,255,.45)' : 'rgba(220,235,255,.5)';
            x.fillRect(wx, wy, ws*0.6, ws*0.75);
          }
          px += bw + (far ? 2 : 6) + rand()*10;
        }
        return Ly;
      }
      function cloudSprite(k){
        const w = 220, h = 110, Ly = bbLayer(w, h, dpr), x = Ly.x;
        const blobs = [[[60,70,34],[100,52,44],[146,66,36],[120,78,30],[82,82,28]], [[50,72,28],[86,56,36],[128,58,32],[164,74,26],[110,82,30]], [[70,66,36],[116,50,40],[158,70,30],[100,82,30]]][k];
        x.fillStyle = 'rgba(120,130,170,.35)'; for (const [bx, by, br] of blobs){ x.beginPath(); x.arc(bx + 4, by + 8, br, 0, 7); x.fill(); }
        const gr = x.createLinearGradient(0, 20, 0, 100); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#dfe6f5');
        x.fillStyle = gr; for (const [bx, by, br] of blobs){ x.beginPath(); x.arc(bx, by, br, 0, 7); x.fill(); }
        return Ly;
      }
      function build(){
        const sw = Math.ceil(W*1.2);
        L = {far: skyline(sw, Math.round(H*0.62), true), near: skyline(sw, Math.round(H*0.42), false), clouds: [0,1,2].map(cloudSprite)};
        // stars
        L.stars = bbLayer(W, H, dpr);
        for (const st of STARS){ L.stars.x.globalAlpha = st.a; L.stars.x.fillStyle = '#fff'; L.stars.x.beginPath(); L.stars.x.arc(st.x*W, st.y*H, st.r, 0, 7); L.stars.x.fill(); }
        L.stars.x.globalAlpha = 1;
        // nebula wash (fixed, not tiled)
        L.neb = bbLayer(W, H, dpr); const nb = L.neb.x.createRadialGradient(W*0.3, H*0.4, 10, W*0.3, H*0.4, Math.max(W, H)*0.7); nb.addColorStop(0, 'rgba(170,90,230,.22)'); nb.addColorStop(1, 'rgba(170,90,230,0)');
        L.neb.x.fillStyle = nb; L.neb.x.fillRect(0, 0, W, H);
        // sun glow sprite
        const sz = 260; L.sun = bbLayer(sz, sz, dpr);
        const sg = L.sun.x.createRadialGradient(sz/2, sz/2, 4, sz/2, sz/2, sz/2); sg.addColorStop(0, 'rgba(255,250,220,1)'); sg.addColorStop(0.18, 'rgba(255,230,150,1)'); sg.addColorStop(0.22, 'rgba(255,200,120,.55)'); sg.addColorStop(1, 'rgba(255,160,90,0)');
        L.sun.x.fillStyle = sg; L.sun.x.fillRect(0, 0, sz, sz);
        // ground: park + plaza
        const gh = Math.round(H*0.5); L.ground = bbLayer(W, gh, dpr); const x = L.ground.x;
        const gg = x.createLinearGradient(0, 0, 0, gh); gg.addColorStop(0, '#5fbf5a'); gg.addColorStop(0.15, '#46a046'); gg.addColorStop(1, '#2f7a38'); x.fillStyle = gg; x.fillRect(0, 0, W, gh);
        x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, 0, W, 3);
        for (let i = 0; i < 260; i++){ x.fillStyle = Math.random() < 0.5 ? 'rgba(20,80,30,.25)' : 'rgba(170,230,140,.22)'; x.fillRect(Math.random()*W, 6 + Math.random()*gh, 2, 4 + Math.random()*4); }
        // plaza under the tower
        const pw = BASE_W*s*1.5, pg = x.createLinearGradient(0, 0, 0, 30*s); pg.addColorStop(0, '#d9d2c3'); pg.addColorStop(1, '#a89f8d');
        x.fillStyle = pg; x.beginPath(); x.moveTo(W/2 - pw/2, 0); x.lineTo(W/2 + pw/2, 0); x.lineTo(W/2 + pw*0.62, 26*s); x.lineTo(W/2 - pw*0.62, 26*s); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(90,80,60,.25)'; x.lineWidth = 1; for (let i = 1; i < 6; i++){ const t = i/6; x.beginPath(); x.moveTo(W/2 - pw/2 + pw*t, 0); x.lineTo(W/2 - pw*0.62 + pw*1.24*t, 26*s); x.stroke(); }
        // trees along the plaza (own layer, drawn in front of the skyline)
        L.ground.trees = [];
        const edge = (BASE_W/2 + 40)*s;
        for (const sd of [-1, 1]){ for (let i = 0; i < 3; i++){ const tx = W/2 + sd*(edge + i*70*s + 10); if (tx < 10 || tx > W - 10) continue; L.ground.trees.push([tx, (30 + (i % 2)*10)*s]); } }
        L.treeLayer = bbLayer(W, Math.round(120*s + 20), dpr);
        // draw trees into tree layer (anchored at its bottom)
        { const tl = L.treeLayer.x, oy = 120*s + 10; tl.save(); tl.translate(0, oy);
          const tree2 = (tx, ts) => { tl.fillStyle = 'rgba(0,0,0,.22)'; tl.beginPath(); tl.ellipse(tx + ts*0.3, 4, ts*0.9, ts*0.22, 0, 0, 7); tl.fill();
            tl.fillStyle = '#6b4423'; tl.fillRect(tx - ts*0.08, -ts*0.6, ts*0.16, ts*0.65);
            const tg = tl.createRadialGradient(tx - ts*0.25, -ts*1.15, 2, tx, -ts*0.95, ts*0.75); tg.addColorStop(0, '#a6ec74'); tg.addColorStop(1, '#2e8a3a');
            tl.fillStyle = tg; for (const [ox, oy2, rr] of [[0, -0.95, 0.62], [-0.38, -0.7, 0.42], [0.38, -0.7, 0.42]]){ tl.beginPath(); tl.arc(tx + ox*ts, oy2*ts, rr*ts, 0, 7); tl.fill(); } };
          for (const [tx, ts] of L.ground.trees) tree2(tx, ts);
          tl.restore(); }
        L.skyKey = -1;
      }
      const size = () => { const r = el.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2); W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); cx.setTransform(dpr,0,0,dpr,0,0);
        s = Math.max(0.7, Math.min(1.7, Math.min(W/440, H/600))); build(); };
      size(); window.addEventListener('resize', size);
      let ro = null; if (window.ResizeObserver){ ro = new ResizeObserver(() => { const r = el.getBoundingClientRect(); if (Math.abs(r.width - W) > 1 || Math.abs(r.height - H) > 1) size(); }); ro.observe(el); }

      // ---------- rules (unchanged) ----------
      function newRound(){
        g.tower = [{x: 0, w: BASE_W, c: colorOf(0)}];
        g.bits.length = 0; J.clear(); g.streak = 0; g.score = 0; g.shown = 0; g.over = 0; g.falling = null; g.time = 0; g.perfects = 0; g.land = null;
        g.cam = 0; g.camT = 0; g.dir = 1; g.speed = 115;
        spawn();
        g.mode = 'play';
      }
      function spawn(){
        const top = g.tower[g.tower.length-1], n = g.tower.length;
        const R = range();
        g.dir = n % 2 ? 1 : -1;
        g.cur = {x: g.dir > 0 ? -R + top.w/2 : R - top.w/2, w: top.w, c: colorOf(n), t: 0};
        g.speed = Math.min(330, 115 + n*7) * (api.grade >= 5 ? 1.08 : 1);
      }
      let hudPill = {x: 12, y: 12, w: 120, h: 50};
      const hudTo = () => ({x: hudPill.x + hudPill.w*0.7, y: hudPill.y + hudPill.h/2});
      function scored(n){ // +1 flies up to the height pill
        J.text('+1', sx(g.tower[n].x), sy(n*BH + BH) - 10, {col: '#fff', size: 26, to: hudTo, onArrive: () => { g.shown = g.score; g.hudBump = 1; }});
        if (n % 10 === 0){ J.text(n + ' floors!', W/2, sy(n*BH + BH) - 70, {col: '#7ee8ff', size: 40, big: true, life: 1.4}); api.confetti(30); }
      }
      function drop(){
        if (g.mode !== 'play' || !g.cur || g.falling) return;
        const top = g.tower[g.tower.length-1], b = g.cur, n = g.tower.length;
        const dx = b.x - top.x, tol = Math.max(4, b.w*0.035);
        if (Math.abs(dx) <= tol){
          b.x = top.x; g.streak++; g.perfects++;
          let grow = 0;
          if (g.streak >= 3 && b.w < BASE_W){ grow = Math.min(12, BASE_W - b.w); b.w += grow; }
          g.tower.push({x: b.x, w: b.w, c: b.c}); g.score = g.tower.length - 1;
          const py = sy(n*BH) - BH*s/2;
          J.ring(sx(b.x), py, b.w*s*0.5, '#fff6b0', 0.45);
          J.burst(sx(b.x), py, RM ? 10 : 26, {kind: 'spark', cols: ['#fff6b0', '#ffd23f', '#ffffff'], min: 160, max: 420, g: 300, r0: 2, r1: 4});
          J.text(grow ? 'PERFECT! WIDER!' : 'PERFECT!', W/2, py - 60, {col: '#ffe066', size: 40, big: true, life: 1});
          if (g.streak > 1) J.text('COMBO x' + g.streak, W/2, py - 104, {col: '#ff9ff3', size: 28, big: true, life: 1.1});
          J.flash(0.25, '#fffbe0'); if (g.streak >= 3) J.hitPause(0.06);
        } else {
          const l = Math.max(b.x - b.w/2, top.x - top.w/2), r = Math.min(b.x + b.w/2, top.x + top.w/2);
          if (r - l <= 0.5){ // missed the tower entirely
            g.falling = {x: b.x, y: n*BH, w: b.w, c: b.c, vy: 0, vx: g.dir*40, rot: 0, vr: g.dir*1.6};
            g.cur = null; g.over = 1.3; J.shake(14); J.flash(0.4, '#ff6b6b');
            J.text('Oops!', W/2, sy(n*BH) - 60, {col: '#ffb4b4', size: 42, big: true, life: 1.2});
            return;
          }
          g.streak = 0;
          const cutL = b.x - b.w/2 < l ? {a: b.x - b.w/2, z: l} : {a: r, z: b.x + b.w/2};
          g.bits.push({x: (cutL.a + cutL.z)/2, y: n*BH, w: cutL.z - cutL.a, c: b.c, vy: 0, vx: (cutL.a < l || cutL.z <= l) ? -60 : 60, rot: 0, vr: (dx < 0 ? -1 : 1)*(1.5 + Math.random())});
          g.tower.push({x: (l + r)/2, w: r - l, c: b.c}); g.score = g.tower.length - 1;
          const cutX = cutL.a < l ? l : r;
          J.burst(sx(cutX), sy(n*BH) - BH*s/2, RM ? 6 : 14, {kind: 'spark', cols: ['#ffffff', '#ffe08a'], min: 120, max: 300, g: 700});
          J.shake(5);
          if (r - l < 18) J.text('Careful!', W/2, sy(n*BH) - 60, {col: '#ffd0d0', size: 34, big: true});
        }
        // dust where it lands
        const nb = g.tower[n];
        for (const sd of [-1, 1]) J.burst(sx(nb.x + sd*nb.w/2), sy(n*BH), RM ? 3 : 7, {col: 'rgba(240,235,225,.85)', a: sd < 0 ? Math.PI : 0, spread: 1.2, min: 40, max: 120, g: -40, drag: 3, r0: 4, r1: 8, life: 0.9});
        g.land = {i: n, t: 0};
        scored(n);
        g.cur = null; spawn();
      }

      function finish(){
        g.mode = 'end';
        const res = api.saveScore(g.score);
        if (res.isBest && g.score > 0) api.confetti(60);
        UI.end({emoji: g.score >= 30 ? '🚀' : g.score >= 15 ? '🏙️' : '🧱', title: g.score >= 30 ? 'Into space!' : g.score >= 15 ? 'Sky high!' : 'Tower down!',
          score: g.score, unit: g.score === 1 ? 'floor high' : 'floors high', res, stars: [8, 18, 30],
          extra: [g.perfects ? `✨ ${g.perfects} perfect drop${g.perfects === 1 ? '' : 's'}` : ''], onAgain: newRound});
      }
      function startScreen(){
        g.mode = 'start'; g.tower = [{x:0, w:BASE_W, c: colorOf(0)}]; g.cam = g.camT = 0; J.clear(); g.bits.length = 0; g.falling = null;
        spawn();
        UI.start({emoji: '🏗️', title: 'Tower Stacker', icon: '👆', how: 'Tap to drop each floor. Line it up for a <b>Perfect!</b>', bestUnit: 'floors', onPlay: newRound});
      }

      const down = e => { if (e.button > 0) return; e.preventDefault(); drop(); };
      cv.addEventListener('pointerdown', down);

      // ---------- drawing ----------
      const mixc = (c1, c2, t) => [lerp(c1[0],c2[0],t), lerp(c1[1],c2[1],t), lerp(c1[2],c2[2],t)];
      const rgb = c => `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;
      const SKY = [[[108,186,248],[200,234,255]], [[255,150,110],[255,214,160]], [[60,48,130],[168,96,170]], [[6,8,30],[24,22,70]], [[2,3,14],[10,10,40]]];
      let skyGrad = null;
      function skyAt(k){ const i = Math.min(SKY.length - 2, Math.floor(k)), t = Math.min(1, k - i); return [mixc(SKY[i][0], SKY[i+1][0], t), mixc(SKY[i][1], SKY[i+1][1], t)]; }
      function block(x, yU, w, c, rot, sqx, sqy, idx){
        const px = sx(x), py = sy(yU), pw = w*s, ph = BH*s, r = Math.min(5*s, pw/2);
        cx.save(); cx.translate(px, py); if (rot) { cx.translate(0, -ph/2); cx.rotate(rot); cx.translate(0, ph/2); }
        if (sqx) cx.scale(sqx, sqy);
        // facade
        cx.fillStyle = c.f; bbRR(cx, -pw/2, -ph, pw, ph, r); cx.fill();
        cx.save(); bbRR(cx, -pw/2, -ph, pw, ph, r); cx.clip();
        // windows on a world grid so sliced pieces stay consistent
        if (c.n !== 0){
          const ws = 26, x0 = x - w/2, i0 = Math.ceil((x0 - 7)/ws), i1 = Math.floor((x + w/2 - 6)/ws);
          for (let i = i0; i <= i1; i++){ const wx = (i*ws - x)*s, lit = ((i*73 + (idx|0)*151) & 7) < 4;
            cx.fillStyle = lit ? '#ffe6a0' : 'rgba(25,35,70,.55)'; cx.fillRect(wx - 6*s, -ph*0.72, 12*s, ph*0.44);
            if (lit){ cx.fillStyle = 'rgba(255,255,255,.55)'; cx.fillRect(wx - 6*s, -ph*0.72, 12*s, ph*0.08); } }
        } else { // lobby: doors
          cx.fillStyle = '#4b3b2a'; bbRR(cx, -16*s, -ph*0.86, 32*s, ph*0.86, 8*s); cx.fill(); cx.fillStyle = '#ffd98a'; cx.fillRect(-12*s, -ph*0.74, 10*s, ph*0.7); cx.fillRect(2*s, -ph*0.74, 10*s, ph*0.7);
          cx.fillStyle = 'rgba(255,255,255,.35)'; for (const sd of [-1, 1]) cx.fillRect(sd*60*s - 10*s, -ph*0.7, 20*s, ph*0.45);
        }
        // light from upper-left: top bevel, bottom shade, side shading
        cx.fillStyle = c.t; cx.fillRect(-pw/2, -ph, pw, Math.max(3, ph*0.16));
        cx.fillStyle = c.b; cx.fillRect(-pw/2, -Math.max(3, ph*0.14), pw, Math.max(3, ph*0.14));
        cx.fillStyle = 'rgba(255,255,255,.14)'; cx.fillRect(-pw/2, -ph, Math.min(pw, 6*s), ph);
        cx.fillStyle = 'rgba(0,0,0,.18)'; cx.fillRect(pw/2 - Math.min(pw, 8*s), -ph, Math.min(pw, 8*s), ph);
        cx.restore();
        cx.strokeStyle = 'rgba(0,0,0,.28)'; cx.lineWidth = 1; bbRR(cx, -pw/2 + .5, -ph + .5, pw - 1, ph - 1, r); cx.stroke();
        cx.restore();
      }
      function draw(){
        const gy0 = groundY();
        // sky (gradient rebuilt only when the colour stage moves)
        const k = Math.max(0, g.cam/BH/14), key = Math.round(k*40);
        if (key !== L.skyKey){ L.skyKey = key; const sk = skyAt(k); skyGrad = cx.createLinearGradient(0, 0, 0, H); skyGrad.addColorStop(0, rgb(sk[0])); skyGrad.addColorStop(1, rgb(sk[1])); }
        cx.save(); cx.translate(J.sx, J.sy);
        cx.fillStyle = skyGrad; cx.fillRect(-20, -20, W + 40, H + 40);
        const starA = clamp((k - 1.5)/1.2, 0, 1);
        if (starA > 0){ // starfield with parallax
          const off = ((g.cam*s*0.12) % H + H) % H;
          cx.globalAlpha = starA; cx.drawImage(L.neb.c, 0, 0, W, H); cx.drawImage(L.stars.c, 0, off - H, W, H); cx.drawImage(L.stars.c, 0, off, W, H);
          cx.fillStyle = '#fff';
          for (const t of TWINK){ const a = 0.5 + 0.5*Math.sin(g.time*3 + t.p); cx.globalAlpha = starA*a; const yy = ((t.y*H + g.cam*s*0.12) % H + H) % H; cx.beginPath(); cx.arc(t.x*W, yy, t.r, 0, 7); cx.fill();
            cx.fillRect(t.x*W - t.r*3*a, yy - 0.5, t.r*6*a, 1); cx.fillRect(t.x*W - 0.5, yy - t.r*3*a, 1, t.r*6*a); }
          cx.globalAlpha = starA; cx.font = `${Math.round(60*s)}px sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
          cx.shadowColor = 'rgba(200,180,255,.8)'; cx.shadowBlur = 24;
          cx.fillText('🪐', W*0.2, gy0 - (40*BH - g.cam)*s*0.5); cx.fillText('🌙', W*0.8, gy0 - (54*BH - g.cam)*s*0.5); cx.fillText('🛰️', W*0.72, gy0 - (70*BH - g.cam)*s*0.5);
          cx.shadowBlur = 0; cx.globalAlpha = 1;
        }
        // setting sun
        const sunY = gy0 - 300*s + g.cam*s*0.3, sunA = clamp(1 - (k - 1.6)/0.8, 0, 1);
        if (sunA > 0 && sunY < H + 130){ cx.globalAlpha = sunA; cx.drawImage(L.sun.c, W*0.76 - 130, sunY - 130, 260, 260); cx.globalAlpha = 1; }
        // skyline layers (parallax)
        const farY = gy0 + g.cam*s*0.35, nearY = gy0 + g.cam*s*0.6, sw = L.far.c.width/dpr;
        if (farY - L.far.c.height/dpr < H) cx.drawImage(L.far.c, (W - sw)/2 + Math.sin(g.time*0.05)*4, farY - L.far.c.height/dpr, sw, L.far.c.height/dpr);
        // clouds
        for (const c of CLOUDS){ const y = gy0 - (c.h - g.cam*0.7)*s; if (y < -80 || y > H + 80) continue; const cw = 200*s*c.sc*0.7, x = ((c.x*(W + cw) + g.time*c.v) % (W + cw*2)) - cw;
          cx.globalAlpha = 0.95*clamp(1 - (k - 1.7)/0.6, 0, 1); if (cx.globalAlpha <= 0) continue; cx.drawImage(L.clouds[c.k].c, x, y - cw*0.25, cw, cw*0.5); }
        cx.globalAlpha = 1;
        if (nearY - L.near.c.height/dpr < H) cx.drawImage(L.near.c, (W - sw)/2, nearY - L.near.c.height/dpr, sw, L.near.c.height/dpr);
        // ground
        const gy = sy(0);
        if (gy < H + 10){ cx.drawImage(L.ground.c, 0, gy, W, L.ground.c.height/dpr);
          // tower's soft shadow on the plaza
          cx.fillStyle = 'rgba(0,0,0,.22)'; cx.beginPath(); cx.ellipse(W/2 + 18*s, gy + 6*s, BASE_W*s*0.62, 10*s, 0, 0, 7); cx.fill(); }
        // tower (only what is on screen)
        const top = g.tower.length - 1;
        for (let i = 0; i < g.tower.length; i++){ const b = g.tower[i], y = sy(i*BH); if (y < 0 - 4 || y - BH*s > H) continue;
          if (g.land && g.land.i === i){ const e = clamp(g.land.t/0.3, 0, 1), d = (1 - easeOut(e)); block(b.x, i*BH, b.w, b.c, 0, 1 + 0.07*d*Math.cos(e*9), 1 - 0.14*d*Math.cos(e*9), i); }
          else block(b.x, i*BH, b.w, b.c, 0, 0, 0, i);
        }
        for (const b of g.bits) block(b.x, b.y, b.w, b.c, b.rot, 0, 0, 1);
        if (g.falling) block(g.falling.x, g.falling.y, g.falling.w, g.falling.c, g.falling.rot, 0, 0, 2);
        if (g.cur){ const n = g.tower.length, t = g.tower[n-1], bx = sx(g.cur.x), byTop = sy(n*BH) - BH*s - 14*s;
          // crane cable + hook
          cx.strokeStyle = 'rgba(40,45,60,.85)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(bx - 10*s, byTop + 6*s); cx.lineTo(bx, -10); cx.lineTo(bx + 10*s, byTop + 6*s); cx.stroke();
          cx.fillStyle = '#f2b705'; bbRR(cx, bx - 9*s, byTop - 4*s, 18*s, 10*s, 3*s); cx.fill(); cx.strokeStyle = '#a77a00'; cx.stroke();
          // landing shadow on the top floor
          const l = Math.max(g.cur.x - g.cur.w/2, t.x - t.w/2), r = Math.min(g.cur.x + g.cur.w/2, t.x + t.w/2);
          if (r > l){ cx.fillStyle = 'rgba(0,0,0,.2)'; cx.fillRect(sx(l), sy(n*BH) - BH*s*0.16, (r - l)*s, BH*s*0.16); }
          // guide lines up from the top floor's edges
          cx.strokeStyle = 'rgba(255,255,255,.5)'; cx.setLineDash([5, 6]); cx.lineWidth = 2;
          cx.beginPath(); cx.moveTo(sx(t.x - t.w/2), sy(n*BH)); cx.lineTo(sx(t.x - t.w/2), sy(n*BH) - BH*s*1.4); cx.moveTo(sx(t.x + t.w/2), sy(n*BH)); cx.lineTo(sx(t.x + t.w/2), sy(n*BH) - BH*s*1.4); cx.stroke(); cx.setLineDash([]);
          block(g.cur.x, n*BH, g.cur.w, g.cur.c, Math.sin(g.time*3)*0.012, 0, 0, n);
        }
        if (gy < H + 10){ const th = L.treeLayer.c.height/dpr; cx.drawImage(L.treeLayer.c, 0, gy + 10 - th + 10, W, th); }
        J.drawParticles(cx);
        J.drawText(cx);
        cx.restore();
        J.drawFlash(cx, W, H);
        // HUD
        if (g.mode !== 'start'){
          hudPill = bbPill(cx, 12, 12, 'Height', g.shown, {icon: '🏢', bump: g.hudBump, h: 52});
          if (api.best != null || g.mode === 'end') bbPill(cx, W - 12, 12, 'Best', Math.max(api.best || 0, g.mode === 'end' ? g.score : 0), {icon: '🏆', align: 'right', h: 52});
          if (g.streak >= 2) bbPill(cx, W/2, 12, 'Combo', 'x' + g.streak, {icon: '🔥', align: 'center', h: 52, fg: '#ffe066'});
          if (g.mode === 'play' && g.tower.length === 1 && !g.bits.length){ const a = 0.75 + 0.25*Math.sin(g.time*5); cx.globalAlpha = a; bbPill(cx, W/2, 74, 'How to', 'Tap anywhere to drop!', {icon: '👆', align: 'center', h: 50}); cx.globalAlpha = 1; }
        }
      }

      function step(dt){
        g.time += dt;
        if (g.hudBump > 0) g.hudBump = Math.max(0, g.hudBump - dt*3.5);
        if (g.land){ g.land.t += dt; if (g.land.t > 0.4) g.land = null; }
        if (g.mode === 'play' || g.mode === 'start'){
          if (g.cur){ const R = range(); g.cur.x += g.dir*g.speed*dt*(g.mode === 'start' ? 0.7 : 1);
            if (g.cur.x + g.cur.w/2 > R){ g.cur.x = R - g.cur.w/2; g.dir = -1; } else if (g.cur.x - g.cur.w/2 < -R){ g.cur.x = -R + g.cur.w/2; g.dir = 1; } }
        }
        if (g.mode === 'play'){
          if (g.falling){ const f = g.falling; f.vy -= 900*dt; f.y += f.vy*dt; f.x += f.vx*dt; f.rot += f.vr*dt; }
          if (g.over > 0){ g.over -= dt; if (g.over <= 0) finish(); }
        }
        for (let i = g.bits.length - 1; i >= 0; i--){ const b = g.bits[i]; b.vy -= 900*dt; b.y += b.vy*dt; b.x += b.vx*dt; b.rot += b.vr*dt; if (sy(b.y) > H + 120) g.bits.splice(i, 1); }
        J.update(dt);
        const n = g.tower.length;
        g.camT = Math.max(0, n*BH + BH - (groundY() - H*0.42)/s);
        g.cam += (g.camT - g.cam)*Math.min(1, dt*4);
      }
      const frame = t => {
        if (!alive) return;
        let dt = Math.min(0.05, last ? (t - last)/1000 : 0.016); last = t;
        if (J.pause > 0){ J.pause -= dt; dt = 0; }
        step(dt); draw(); raf = requestAnimationFrame(frame);
      };
      startScreen();
      raf = requestAnimationFrame(frame);

      return () => { alive = false; cancelAnimationFrame(raf); UI.destroy(); window.removeEventListener('resize', size); if (ro) ro.disconnect(); cv.removeEventListener('pointerdown', down); el.innerHTML = ''; delete el.__stack; };
    }
  };
})();
