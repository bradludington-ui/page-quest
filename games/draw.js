// Drawing Pad: draw with 12 colors or the rainbow brush, stamp emoji, undo, clear and save up to
// 6 pictures in a little gallery. No score.
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
  window.BreakGames.draw = {
    start(el, api){
      const RM = !!api.reducedMotion;
      const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const HEAD = HF, TXT = TF;
      const EMOJI = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
      const COLORS = ['#e63946','#ff8c1a','#ffd60a','#8ac926','#2a9d4b','#19b5a5','#4cc9f0','#2f5fd0','#7b4bd6','#ff70a6','#8b5a2b','#222222'];
      const STAMPS = ['⭐','❤️','🌈','🦋','🌸','🐶','🐱','🦄','🐠','🍕','🍩','🚀','🌞','⚽','🎈','👑'];
      const SIZES = [4, 10, 20, 36], STAMP_SIZES = [36, 56, 84, 120];
      const MAX_PICS = 6, MAX_STR = 190000; // ~140 KB of JPEG once the data URL's base64 is counted
      const DPR = () => Math.min(window.devicePixelRatio || 1, 2.5);

      const st = {tool: 'brush', color: COLORS[7], rainbow: false, size: 1, stamp: STAMPS[0], picIdx: -1, dirty: false};
      el.__draw = st; // read-only peek for automated tests

      // ---------- DOM: a studio desk with a glass tool tray ----------
      const css = document.createElement('style');
      css.textContent = BB_CSS + `
.dp-root{position:absolute;inset:0;display:flex;flex-direction:column;font-family:${TF};color:#fff;background:#6b4426}
.dp-bar{flex:none;display:flex;flex-direction:column;gap:6px;padding:8px 10px;position:relative;z-index:2;
  background:linear-gradient(180deg,rgba(30,41,66,.96),rgba(15,23,42,.96));border-bottom:1px solid rgba(255,255,255,.12);box-shadow:0 6px 18px rgba(0,0,0,.35)}
.dp-row{display:flex;gap:7px;align-items:center;overflow-x:auto;overflow-y:hidden;touch-action:pan-x;scrollbar-width:none;padding:5px 3px 4px}
.dp-row::-webkit-scrollbar{display:none}
.dp-tb{flex:none;width:52px;height:52px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.04));
  color:#fff;font:700 24px ${EMOJI};display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:transform .15s,box-shadow .15s,background .15s;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 2px 4px rgba(0,0,0,.3)}
.dp-tb:active{transform:scale(.92)}
.dp-tb.on{background:linear-gradient(180deg,rgba(255,224,102,.35),rgba(255,178,26,.18));border-color:#ffd23f;box-shadow:0 0 0 2px #ffd23f,0 0 16px rgba(255,210,63,.45)}
.dp-sw{flex:1 1 0;min-width:42px;max-width:54px;width:auto;height:46px;border-radius:50%;border:none;padding:0;cursor:pointer;position:relative;
  background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.75),rgba(255,255,255,0) 32%),radial-gradient(circle at 50% 60%,var(--c),var(--c) 55%,color-mix(in srgb,var(--c) 70%,#000) 100%);
  box-shadow:0 3px 0 rgba(0,0,0,.35),0 4px 8px rgba(0,0,0,.35),inset 0 -3px 6px rgba(0,0,0,.25);transition:transform .18s cubic-bezier(.2,1.5,.4,1);aspect-ratio:1/1;max-height:46px}
.dp-sw.on{transform:translateY(-4px) scale(1.12);box-shadow:0 0 0 3px #fff,0 0 0 6px rgba(255,210,63,.9),0 8px 14px rgba(0,0,0,.45)}
.dp-sw.rb{--c:#e63946;background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.75),rgba(255,255,255,0) 32%),conic-gradient(#e63946,#ff8c1a,#ffd60a,#8ac926,#4cc9f0,#7b4bd6,#ff70a6,#e63946)}
.dp-sep{flex:none;width:1px;height:36px;background:rgba(255,255,255,.18);margin:0 4px}
.dp-area{flex:1;position:relative;min-height:0}
.dp-toast{position:absolute;left:50%;bottom:18px;transform:translate(-50%,10px);background:rgba(15,23,42,.82);border:1px solid rgba(255,255,255,.18);color:#fff;padding:10px 20px;
  border-radius:999px;font:700 19px ${HF};opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;white-space:nowrap;box-shadow:0 8px 20px rgba(0,0,0,.35)}
.dp-toast.on{opacity:1;transform:translate(-50%,0)}
.dp-sec{min-height:56px;min-width:150px;padding:10px 22px;margin:6px;border-radius:999px;cursor:pointer;font:800 22px ${HF};color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22)}
.dp-pri{min-width:170px;width:auto;font-size:24px;min-height:60px;padding:8px 26px;margin:6px;animation:none}
.dp-new{animation:bbfPulse 1.6s ease-in-out infinite}
.dp-q{font:800 28px/1.1 ${HF}}
.dp-sub{color:rgba(255,255,255,.75);margin:2px 0 6px}
.dp-gal{width:100%;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:18px;padding:6px 4px 4px;box-sizing:border-box}
.dp-frame{position:relative;padding:9px;border-radius:8px;background:linear-gradient(135deg,#d9a35f,#8a5426 45%,#c4874a 70%,#6e3f19);box-shadow:0 10px 18px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.35)}
.dp-frame:nth-child(odd){transform:rotate(-1.6deg)}.dp-frame:nth-child(even){transform:rotate(1.4deg)}
.dp-frame .mat{display:block;width:100%;border:none;padding:7px;background:#f6f1e7;border-radius:3px;cursor:pointer;aspect-ratio:4/3;box-shadow:inset 0 2px 5px rgba(0,0,0,.3)}
.dp-frame img{width:100%;height:100%;object-fit:contain;display:block;background:#fff}
.dp-frame .pin{position:absolute;top:-9px;left:50%;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff9aa8,#d61f3a);box-shadow:0 2px 3px rgba(0,0,0,.4)}
.dp-del{position:absolute;top:-14px;right:-14px;width:48px;height:48px;border-radius:50%;border:2px solid rgba(255,255,255,.7);background:rgba(15,23,42,.85);font:20px ${EMOJI};cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.4)}
.dp-galh{width:100%;display:flex;align-items:baseline;gap:8px;margin:14px 0 4px;text-align:left;font:800 21px ${HF}}
.dp-galh span{font:500 14px ${TF};color:rgba(255,255,255,.7)}
.dp-empty{color:rgba(255,255,255,.72);margin-top:6px;padding:16px;border:2px dashed rgba(255,255,255,.2);border-radius:18px;width:100%;box-sizing:border-box}`;
      el.appendChild(css);
      const root = document.createElement('div'); root.className = 'dp-root';
      el.appendChild(root);
      const bar = document.createElement('div'); bar.className = 'dp-bar';
      const rowA = document.createElement('div'), rowB = document.createElement('div');
      rowA.className = 'dp-row'; rowB.className = 'dp-row';
      bar.appendChild(rowA); bar.appendChild(rowB); root.appendChild(bar);
      const area = document.createElement('div'); area.className = 'dp-area';
      root.appendChild(area);
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:crosshair';
      area.appendChild(cv);
      const vx = cv.getContext('2d');
      const toast = document.createElement('div'); toast.className = 'dp-toast';
      area.appendChild(toast);
      let toastT = 0;
      const say = t => { toast.textContent = t; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => { toast.classList.remove('on'); }, 1600); };
      const ov = document.createElement('div'); ov.className = 'bbf-ov' + (RM ? ' bbf-rm' : '');
      el.appendChild(ov);
      const BTN = (act, label, primary, extra) => `<button type="button" data-act="${act}" class="${primary ? 'bbf-play dp-pri' : 'dp-sec'}" style="${extra||''}">${label}</button>`;
      const card = (inner, wide) => `<div class="bbf-card bbf-in" style="width:min(${wide ? 680 : 440}px,100%);touch-action:pan-y">${inner}</div>`;
      const showOv = (html, wide) => { ov.innerHTML = card(html, wide); ov.style.display = 'flex'; };
      const hideOv = () => { ov.style.display = 'none'; ov.innerHTML = ''; };

      const tb = (act, inner, title, on, cls, style) => `<button type="button" data-act="${act}" aria-label="${esc(title)}" title="${esc(title)}" class="${cls || 'dp-tb'}${on ? ' on' : ''}" style="${style||''}">${inner}</button>`;
      function drawBar(){
        if (st.tool === 'stamp'){
          rowA.innerHTML = STAMPS.map((s, i) => tb('stamp:' + i, s, 'Stamp ' + (i+1), st.stamp === s)).join('');
        } else {
          rowA.innerHTML = COLORS.map((c, i) => tb('color:' + i, '', 'Color ' + (i+1), !st.rainbow && st.tool === 'brush' && st.color === c, 'dp-sw', `--c:${c}`)).join('')
            + tb('rainbow', '', 'Rainbow brush', st.rainbow && st.tool === 'brush', 'dp-sw rb');
        }
        const dot = i => { const d = [8, 14, 22, 32][i]; const col = st.tool === 'eraser' ? '#e2e8f0' : st.rainbow ? 'conic-gradient(#e63946,#ffd60a,#8ac926,#4cc9f0,#7b4bd6,#e63946)' : st.color; return `<span style="display:block;width:${d}px;height:${d}px;border-radius:50%;background:${st.tool === 'stamp' ? 'rgba(255,255,255,.55)' : col};box-shadow:0 0 0 2px rgba(255,255,255,.35),inset 0 -2px 3px rgba(0,0,0,.25)"></span>`; };
        const sep = `<span class="dp-sep"></span>`;
        rowB.innerHTML = tb('brush', '🖌️', 'Brush', st.tool === 'brush') + tb('eraser', '🧽', 'Eraser', st.tool === 'eraser') + tb('stamps', '⭐', 'Stamps', st.tool === 'stamp')
          + sep + [0,1,2,3].map(i => tb('size:' + i, dot(i), 'Size ' + (i+1), st.size === i)).join('')
          + sep + tb('undo', '↩️', 'Undo') + tb('clear', '🗑️', 'Clear') + tb('save', '💾', 'Save picture') + tb('gallery', '🖼️', 'Gallery');
      }

      // ---------- paper and strokes ----------
      let PW = 0, PH = 0, paper = null, px = null, base = null, bx = null, strokes = [];
      const MAX_STROKES = 30;
      function newPaper(){
        const r = area.getBoundingClientRect(), aw = Math.max(200, r.width - 24), ah = Math.max(150, r.height - 24);
        PW = 1200; PH = Math.round(Math.max(600, Math.min(1700, PW*ah/aw)));
        paper = document.createElement('canvas'); paper.width = PW; paper.height = PH; px = paper.getContext('2d');
        base = document.createElement('canvas'); base.width = PW; base.height = PH; bx = base.getContext('2d');
        bx.fillStyle = '#fff'; bx.fillRect(0, 0, PW, PH); strokes = []; render();
      }
      let VW = 0, VH = 0, fit = {x: 0, y: 0, s: 1}, needView = true;
      const viewSize = () => { const r = area.getBoundingClientRect(), d = DPR(); VW = Math.max(1, r.width); VH = Math.max(1, r.height); cv.width = Math.round(VW*d); cv.height = Math.round(VH*d); vx.setTransform(d,0,0,d,0,0); calcFit(); needView = true; };
      function calcFit(){ if (!PW) return; const m = Math.max(26, Math.min(VW, VH)*0.05); const s = Math.min((VW - m*2)/PW, (VH - m*2 - 8)/PH); fit = {s, x: (VW - PW*s)/2, y: (VH - PH*s)/2 + 4}; desk = null; }
      let desk = null, grain = null;
      function buildDesk(){
        const d = DPR(), L = bbLayer(VW, VH, d), x = L.x;
        // warm wooden desk with planks and grain
        const g = x.createLinearGradient(0, 0, VW, VH); g.addColorStop(0, '#9a6538'); g.addColorStop(0.5, '#b07644'); g.addColorStop(1, '#7d4e29'); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        const ph = 90; for (let y = 0, i = 0; y < VH; y += ph, i++){ x.fillStyle = i % 2 ? 'rgba(255,220,170,.05)' : 'rgba(60,30,10,.06)'; x.fillRect(0, y, VW, ph); x.fillStyle = 'rgba(50,25,8,.35)'; x.fillRect(0, y, VW, 1.5); }
        for (let i = 0; i < 220; i++){ const y = Math.random()*VH, x0 = Math.random()*VW, len = 60 + Math.random()*220; x.strokeStyle = Math.random() < 0.6 ? 'rgba(70,35,12,.16)' : 'rgba(255,225,180,.1)'; x.lineWidth = 1 + Math.random();
          x.beginPath(); x.moveTo(x0, y); x.bezierCurveTo(x0 + len*0.3, y + (Math.random() - 0.5)*6, x0 + len*0.7, y + (Math.random() - 0.5)*6, x0 + len, y + (Math.random() - 0.5)*4); x.stroke(); }
        // knots
        for (let i = 0; i < 4; i++){ const kx = Math.random()*VW, ky = Math.random()*VH; for (let r = 3; r < 16; r += 3){ x.strokeStyle = 'rgba(70,35,12,.18)'; x.beginPath(); x.ellipse(kx, ky, r*2.4, r, 0, 0, 7); x.stroke(); } }
        // warm lamp light from the top left
        const lamp = x.createRadialGradient(VW*0.15, -VH*0.1, 20, VW*0.3, VH*0.2, Math.max(VW, VH)); lamp.addColorStop(0, 'rgba(255,230,170,.35)'); lamp.addColorStop(1, 'rgba(0,0,0,.25)'); x.fillStyle = lamp; x.fillRect(0, 0, VW, VH);
        // drawing board under the paper
        const bw = PW*fit.s, bh = PH*fit.s, pad = 12;
        x.save(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 22; x.shadowOffsetY = 8; x.fillStyle = '#3b2a1e'; bbRR(x, fit.x - pad, fit.y - pad, bw + pad*2, bh + pad*2, 14); x.fill(); x.restore();
        const bg2 = x.createLinearGradient(0, fit.y - pad, 0, fit.y + bh + pad); bg2.addColorStop(0, '#5a4636'); bg2.addColorStop(1, '#3a2b20'); x.fillStyle = bg2; bbRR(x, fit.x - pad, fit.y - pad, bw + pad*2, bh + pad*2, 14); x.fill();
        x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1; bbRR(x, fit.x - pad + 1, fit.y - pad + 1, bw + pad*2 - 2, bh + pad*2 - 2, 13); x.stroke();
        // the paper's own shadow on the board
        x.save(); x.shadowColor = 'rgba(0,0,0,.4)'; x.shadowBlur = 8; x.shadowOffsetY = 2; x.fillStyle = '#fff'; x.fillRect(fit.x, fit.y, bw, bh); x.restore();
        // crayons and a pencil resting on the desk, only where there is room
        const sideRoom = fit.x - pad, room = Math.max(sideRoom, 0);
        if (room > 40){ crayon(x, fit.x - pad - room*0.5, VH*0.3, '#e63946', 0.25); crayon(x, fit.x - pad - room*0.5 + 10, VH*0.3 + 70, '#2f5fd0', -0.15); crayon(x, VW - room*0.5 + 6, VH*0.55, '#8ac926', 0.4); crayon(x, VW - room*0.5 - 4, VH*0.55 - 80, '#ffd60a', -0.3); }
        desk = L;
        // faint paper grain shown over the paper (never saved into the picture)
        if (!grain){ const gz = 256; grain = document.createElement('canvas'); grain.width = grain.height = gz; const gx = grain.getContext('2d');
          for (let i = 0; i < 2600; i++){ gx.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,.5)' : 'rgba(120,100,70,.5)'; gx.fillRect(Math.random()*gz, Math.random()*gz, 1, 1); } }
      }
      function crayon(x, cx0, cy0, col, rot){
        x.save(); x.translate(cx0, cy0); x.rotate(Math.PI/2 + rot); const L2 = 74, w = 13;
        x.fillStyle = 'rgba(0,0,0,.3)'; bbRR(x, -L2/2 + 3, -w/2 + 4, L2, w, 4); x.fill();
        const g = x.createLinearGradient(0, -w/2, 0, w/2); g.addColorStop(0, col); g.addColorStop(0.35, '#fff'); g.addColorStop(0.5, col); g.addColorStop(1, 'rgba(0,0,0,.4)');
        x.fillStyle = col; bbRR(x, -L2/2, -w/2, L2 - 12, w, 4); x.fill(); x.globalAlpha = 0.45; x.fillStyle = g; bbRR(x, -L2/2, -w/2, L2 - 12, w, 4); x.fill(); x.globalAlpha = 1;
        x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(-L2/2 + 12, -w/2, 30, w); x.fillStyle = 'rgba(255,255,255,.5)'; x.font = `700 8px ${HF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ART', -L2/2 + 27, 1);
        x.fillStyle = col; x.beginPath(); x.moveTo(L2/2 - 12, -w/2); x.lineTo(L2/2, 0); x.lineTo(L2/2 - 12, w/2); x.closePath(); x.fill();
        x.restore();
      }
      function drawView(){
        if (!desk) buildDesk();
        vx.drawImage(desk.c, 0, 0, VW, VH);
        if (!paper) return;
        vx.imageSmoothingEnabled = true; vx.drawImage(paper, fit.x, fit.y, PW*fit.s, PH*fit.s);
        vx.save(); vx.globalAlpha = 0.05; vx.fillStyle = vx.createPattern(grain, 'repeat'); vx.fillRect(fit.x, fit.y, PW*fit.s, PH*fit.s); vx.restore();
        // a metal clip holding the paper
        const cw = Math.min(120, PW*fit.s*0.28), cxm = fit.x + PW*fit.s/2, cy = fit.y - 14;
        const g = vx.createLinearGradient(0, cy, 0, cy + 30); g.addColorStop(0, '#f1f4fa'); g.addColorStop(0.5, '#a9b3c6'); g.addColorStop(1, '#6f7a90');
        vx.save(); vx.shadowColor = 'rgba(0,0,0,.4)'; vx.shadowBlur = 6; vx.shadowOffsetY = 3; vx.fillStyle = g; bbRR(vx, cxm - cw/2, cy, cw, 28, 9); vx.fill(); vx.restore();
        vx.fillStyle = 'rgba(255,255,255,.7)'; vx.fillRect(cxm - cw/2 + 8, cy + 4, cw - 16, 2);
        vx.fillStyle = '#5b6578'; vx.beginPath(); vx.arc(cxm, cy + 15, 5, 0, 7); vx.fill();
      }
      const lw = sz => SIZES[sz]/fit.s;            // brush width in paper pixels, so it looks the same on screen
      const sw = sz => STAMP_SIZES[sz]/fit.s;

      // Draw one stroke onto a context; `from` lets live drawing add just the newest segments.
      function endCap(ctx, s){ const n = s.pts.length/2; ctx.fillStyle = `hsl(${(s.h0 + s.dist[n-1]*0.45) % 360},90%,55%)`; ctx.beginPath(); ctx.arc(s.pts[(n-1)*2], s.pts[(n-1)*2+1], s.w/2, 0, 7); ctx.fill(); }
      function seg(ctx, s, i){ // segment ending at point i (smoothed through midpoints)
        const p = s.pts, x0 = p[(i-2)*2], y0 = p[(i-2)*2+1], x1 = p[(i-1)*2], y1 = p[(i-1)*2+1], x2 = p[i*2], y2 = p[i*2+1];
        const m0x = i >= 2 ? (x0 + x1)/2 : x1, m0y = i >= 2 ? (y0 + y1)/2 : y1;
        ctx.strokeStyle = s.erase ? '#fff' : s.rainbow ? `hsl(${(s.h0 + s.dist[i]*0.45) % 360},90%,55%)` : s.color;
        ctx.lineCap = s.rainbow ? 'butt' : 'round'; // rainbow segments meet tangent-smooth, so butt ends avoid bead-like scallops
        ctx.beginPath(); ctx.moveTo(m0x, m0y); ctx.quadraticCurveTo(x1, y1, (x1 + x2)/2, (y1 + y2)/2); ctx.stroke();
      }
      function paintLine(ctx, s, from){
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = s.w;
        const n = s.pts.length/2;
        if (from === 0){ // a dot for a tap
          ctx.fillStyle = s.erase ? '#fff' : s.rainbow ? `hsl(${s.h0},90%,55%)` : s.color;
          ctx.beginPath(); ctx.arc(s.pts[0], s.pts[1], s.w/2, 0, 7); ctx.fill(); from = 1;
        }
        for (let i = Math.max(1, from); i < n; i++) seg(ctx, s, i);
        if (s.rainbow && s.end) endCap(ctx, s);
      }
      const emoCache = {};
      function emoImg(ch){ if (emoCache[ch]) return emoCache[ch]; const c = document.createElement('canvas'), z = 160; c.width = c.height = z; const x = c.getContext('2d'); x.font = `128px ${EMOJI}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, z/2, z/2 + 8); return (emoCache[ch] = c); }
      function paintStamp(ctx, s, from){
        const img = emoImg(s.ch);
        for (let i = from; i < s.pts.length/3; i++){ const x = s.pts[i*3], y = s.pts[i*3+1], r = s.pts[i*3+2];
          ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.drawImage(img, -s.sz*0.625, -s.sz*0.625, s.sz*1.25, s.sz*1.25); ctx.restore(); }
      }
      function paint(ctx, s, from){
        if (s.t === 'clear'){ ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, PW, PH); }
        else if (s.t === 'line') paintLine(ctx, s, from || 0);
        else if (s.t === 'stamp') paintStamp(ctx, s, from || 0);
      }
      function render(){ px.drawImage(base, 0, 0); for (const s of strokes) paint(px, s, 0); needView = true; }
      function commit(s){
        strokes.push(s); st.dirty = true;
        while (strokes.length > MAX_STROKES){ paint(bx, strokes.shift(), 0); }
      }

      // ---------- pointer drawing ----------
      let cur = null;
      const toPaper = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left - fit.x)/fit.s, (e.clientY - r.top - fit.y)/fit.s]; };
      function addPoint(x, y){
        const s = cur;
        if (s.t === 'line'){
          const n = s.pts.length/2, lx = s.pts[(n-1)*2], ly = s.pts[(n-1)*2+1], d = Math.hypot(x - lx, y - ly);
          if (d < 1.5) return;
          s.pts.push(x, y); s.dist.push(s.dist[n-1] + d);
          px.lineCap = 'round'; px.lineJoin = 'round'; px.lineWidth = s.w; seg(px, s, n);
        } else {
          const k = s.pts.length/3, lx = s.pts[(k-1)*3], ly = s.pts[(k-1)*3+1];
          if (Math.hypot(x - lx, y - ly) < s.sz*0.85) return;
          s.pts.push(x, y, (Math.random() - 0.5)*0.5); paintStamp(px, s, k);
        }
        needView = true;
      }
      const down = e => {
        if (e.button > 0 || cur) return; e.preventDefault();
        try{ cv.setPointerCapture(e.pointerId); }catch(_){}
        const [x, y] = toPaper(e);
        if (st.tool === 'stamp'){ cur = {t: 'stamp', ch: st.stamp, sz: sw(st.size), pts: [x, y, (Math.random() - 0.5)*0.5], id: e.pointerId}; paintStamp(px, cur, 0); }
        else { cur = {t: 'line', erase: st.tool === 'eraser', rainbow: st.tool === 'brush' && st.rainbow, color: st.color, h0: Math.floor(Math.random()*360), w: lw(st.size)*(st.tool === 'eraser' ? 1.6 : 1), pts: [x, y], dist: [0], id: e.pointerId}; paintLine(px, cur, 0); }
        needView = true;
      };
      const move = e => {
        if (!cur || e.pointerId !== cur.id) return; e.preventDefault();
        const list = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
        if (list && list.length) for (const ce of list){ const [x, y] = toPaper(ce); addPoint(x, y); }
        else { const [x, y] = toPaper(e); addPoint(x, y); }
      };
      const up = e => {
        if (!cur || e.pointerId !== cur.id) return;
        if (cur.t === 'line'){ const n = cur.pts.length/2; if (n >= 2){ // finish the tail to the last point
          const x = cur.pts[(n-1)*2], y = cur.pts[(n-1)*2+1]; cur.pts.push(x, y); cur.dist.push(cur.dist[n-1]); px.lineWidth = cur.w; seg(px, cur, n); } }
        if (cur.t === 'line' && cur.rainbow){ cur.end = true; endCap(px, cur); }
        commit(cur); cur = null; needView = true;
      };
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

      // ---------- saving ----------
      const pics = () => { const p = api.store.get('pics'); return Array.isArray(p) ? p.filter(x => x && typeof x.d === 'string') : []; };
      function exportPic(){
        let scale = Math.min(1, 900/Math.max(PW, PH)), q = 0.78, url = '';
        for (let tries = 0; tries < 8; tries++){
          const c = document.createElement('canvas'); c.width = Math.round(PW*scale); c.height = Math.round(PH*scale);
          const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(paper, 0, 0, c.width, c.height);
          url = c.toDataURL('image/jpeg', q);
          if (url.length <= MAX_STR) break;
          if (q > 0.5) q -= 0.12; else scale *= 0.8;
        }
        return url;
      }
      function storePics(list){ try{ api.store.set('pics', list); return true; }catch(e){ return false; } }
      function savePic(replaceOldest){
        const list = pics(), d = exportPic(), item = {d, t: Date.now()};
        if (st.picIdx >= 0 && st.picIdx < list.length){ list.splice(st.picIdx, 1); list.unshift(item); }
        else if (list.length >= MAX_PICS){
          if (!replaceOldest){ showOv(`<div style="font-size:48px;line-height:1">🖼️</div><div class="dp-q">Your gallery is full</div>
            <div style="color:rgba(255,255,255,.75);margin:4px 0 10px">It holds ${MAX_PICS} pictures. Swap out the oldest one?</div>
            ${BTN('replaceOld', 'Yes, swap it', true)}${BTN('close', 'Not now', false)}`); return false; }
          list.pop(); list.unshift(item);
        } else list.unshift(item);
        if (!storePics(list)){ say('Could not save. Delete a picture first.'); return false; }
        st.picIdx = 0; st.dirty = false; say('💾 Saved to your gallery!'); api.confetti(25);
        return true;
      }

      // ---------- screens ----------
      let mode = 'gallery', afterSave = null;
      function gallery(){
        mode = 'gallery'; afterSave = null;
        const list = pics();
        const thumbs = list.map((p, i) => `<div class="dp-frame"><span class="pin"></span>
            <button type="button" class="mat" data-act="open:${i}" aria-label="Open picture ${i+1}"><img src="${p.d}" alt=""></button>
            <button type="button" class="dp-del" data-act="del:${i}" aria-label="Delete picture ${i+1}">🗑️</button></div>`).join('');
        showOv(`<div class="bbf-hero">🎨</div><div class="bbf-title">Drawing Pad</div>
          <div class="bbf-how"><span class="ic">🖌️</span><span>Draw, paint and stamp. <b>Just for fun!</b></span></div>
          <div class="bbf-row"><span class="bbf-av">${esc(api.avatar || '🙂')}</span><span class="bbf-chip">🖼️ <small>Gallery</small> ${list.length}/${MAX_PICS}</span></div>
          ${BTN('new', '✏️ New picture', true, 'min-height:68px;font-size:28px;min-width:240px')}
          ${list.length ? `<div class="dp-galh">🖼️ My gallery <span>tap a picture to keep drawing</span></div>
          <div class="dp-gal">${thumbs}</div>` : `<div class="dp-empty">Your saved pictures will hang here, like in a real gallery. 🖼️</div>`}`, true);
        const nb = ov.querySelector('[data-act="new"]'); if (nb) nb.classList.add('dp-new');
      }
      function openEditor(picIdx){
        hideOv(); mode = 'draw'; st.picIdx = picIdx; st.dirty = false;
        viewSize(); newPaper(); calcFit();
        if (picIdx >= 0){ const p = pics()[picIdx]; if (p){ const img = new Image(); img.onload = () => { if (!alive) return;
          const s = Math.min(PW/img.width, PH/img.height), w = img.width*s, h = img.height*s; bx.drawImage(img, (PW - w)/2, (PH - h)/2, w, h); render(); }; img.src = p.d; } }
        drawBar(); needView = true;
      }
      function confirmLeave(){
        if (!st.dirty || (!strokes.length && st.picIdx < 0)) return gallery();
        showOv(`<div style="font-size:48px;line-height:1">🖼️</div><div class="dp-q">Save your picture first?</div>
          <div style="margin-top:10px">${BTN('saveLeave', '💾 Save', true)}${BTN('leave', 'Don’t save', false)}<br>${BTN('close', 'Keep drawing', false)}</div>`);
      }

      function act(a){
        if (a.startsWith('color:')){ st.color = COLORS[+a.slice(6)]; st.rainbow = false; st.tool = 'brush'; }
        else if (a === 'rainbow'){ st.rainbow = true; st.tool = 'brush'; }
        else if (a.startsWith('stamp:')){ st.stamp = STAMPS[+a.slice(6)]; st.tool = 'stamp'; }
        else if (a.startsWith('size:')) st.size = +a.slice(5);
        else if (a === 'brush') st.tool = 'brush';
        else if (a === 'eraser') st.tool = 'eraser';
        else if (a === 'stamps') st.tool = 'stamp';
        else if (a === 'undo'){ if (strokes.length){ strokes.pop(); render(); st.dirty = true; } else say('Nothing to undo'); }
        else if (a === 'clear') showOv(`<div style="font-size:48px;line-height:1">🗑️</div><div class="dp-q">Clear the whole picture?</div>
            <div style="color:rgba(255,255,255,.75);margin:4px 0 8px">You can undo it with ↩️.</div>${BTN('clearYes', 'Yes, clear', true)}${BTN('close', 'Keep it', false)}`);
        else if (a === 'clearYes'){ hideOv(); commit({t: 'clear'}); render(); }
        else if (a === 'save') savePic(false);
        else if (a === 'replaceOld'){ hideOv(); const ok = savePic(true); if (ok && afterSave) afterSave(); }
        else if (a === 'gallery') confirmLeave();
        else if (a === 'saveLeave'){ hideOv(); afterSave = gallery; if (savePic(false)) gallery(); }
        else if (a === 'leave') gallery();
        else if (a === 'close'){ hideOv(); afterSave = null; }
        else if (a === 'new') openEditor(-1);
        else if (a.startsWith('open:')) openEditor(+a.slice(5));
        else if (a.startsWith('del:')){ const i = +a.slice(4), p = pics()[i]; if (!p) return;
          showOv(`<img src="${p.d}" alt="" style="max-width:220px;max-height:160px;border-radius:12px;background:#fff;display:block;margin:0 auto 8px">
            <div class="dp-q">Delete this picture?</div>${BTN('delYes:' + i, 'Yes, delete', true)}${BTN('back', 'Keep it', false)}`); return; }
        else if (a.startsWith('delYes:')){ const list = pics(); list.splice(+a.slice(7), 1); storePics(list); gallery(); return; }
        else if (a === 'back'){ gallery(); return; }
        if (mode === 'draw') drawBar();
      }
      const onClick = e => { const b = e.target.closest('[data-act]'); if (b) act(b.dataset.act); };
      bar.addEventListener('click', onClick); ov.addEventListener('click', onClick);

      let alive = true, raf = 0;
      const onResize = () => { viewSize(); };
      window.addEventListener('resize', onResize);
      let ro = null; if (window.ResizeObserver){ ro = new ResizeObserver(() => { const r = area.getBoundingClientRect(); if (Math.abs(r.width - VW) > 1 || Math.abs(r.height - VH) > 1) viewSize(); }); ro.observe(area); }
      const frame = () => { if (!alive) return; if (needView){ needView = false; drawView(); } raf = requestAnimationFrame(frame); };
      viewSize(); newPaper(); drawBar(); gallery();
      raf = requestAnimationFrame(frame);

      return () => {
        alive = false; cancelAnimationFrame(raf); clearTimeout(toastT); window.removeEventListener('resize', onResize);
        cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
        bar.removeEventListener('click', onClick); ov.removeEventListener('click', onClick); if (ro) ro.disconnect();
        el.innerHTML = ''; delete el.__draw;
      };
    }
  };
})();
