// Break Zone game: rollball. Self-contained: canvas + DOM overlay, no images or libraries.
(function(){
  'use strict';
  window.BreakGames = window.BreakGames || {};
  // ---- shared helpers (same in every Break Zone game by this author) ----
  const HF = '"Baloo 2", "Trebuchet MS", system-ui, sans-serif', TF = '"Lexend", Verdana, system-ui, sans-serif';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t, rnd = (a, b) => a + Math.random() * (b - a);
  function kit(el, api){
    const C = api.colors, offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden'; el.style.userSelect = 'none'; el.style.webkitUserSelect = 'none';
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none';
    el.appendChild(cv);
    const cx = cv.getContext('2d');
    const k = {cv, cx, C, on, W:1, H:1, onResize:null};
    const size = () => {
      const r = el.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
      if (W === k.W && H === k.H && cv.width === Math.round(W * d)) return;
      k.W = W; k.H = H; cv.width = Math.round(W * d); cv.height = Math.round(H * d); cx.setTransform(d, 0, 0, d, 0, 0);
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
    k.clearTimers = () => { tms.forEach(clearTimeout); tms.clear(); };
    k.pt = e => { const r = cv.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
    // overlay for start / end / between-game screens
    const ov = document.createElement('div');
    ov.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;display:none;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;background:rgba(0,0,0,.28);touch-action:none';
    el.appendChild(ov);
    const mk = (tag, css, txt) => { const n = document.createElement(tag); if (css) n.style.cssText = css; if (txt != null) n.textContent = txt; return n; };
    const btnCss = (primary, sel) => `min-height:56px;min-width:120px;padding:8px 22px;border-radius:18px;font:700 22px ${HF};cursor:pointer;touch-action:manipulation;` +
      (primary || sel ? `background:${C.accent};color:${C.accentInk};border:3px solid ${C.accent};` : `background:${C.soft};color:${C.ink};border:3px solid ${C.line};`);
    k.menu = o => {
      ov.innerHTML = ''; ov.style.display = 'flex';
      const card = mk('div', `background:${C.panel};color:${C.ink};border:2px solid ${C.line};border-radius:26px;padding:18px 20px;max-width:560px;width:100%;box-sizing:border-box;box-shadow:0 14px 44px rgba(0,0,0,.3);display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;font-family:${TF};max-height:100%;overflow:auto`);
      if (o.emoji) card.appendChild(mk('div', 'font-size:46px;line-height:1.1', o.emoji));
      if (o.title) card.appendChild(mk('div', `font:800 32px/1.1 ${HF}`, o.title));
      (o.lines || []).forEach(l => {
        if (l == null || l === '') return;
        const d = typeof l === 'string' ? {text:l} : l;
        card.appendChild(mk('div', d.big ? `font:800 30px/1.15 ${HF};color:${d.color || C.ink}` : `font:500 17px/1.35 ${TF};color:${d.color || C.mut}`, d.text));
      });
      (o.groups || []).forEach(g => {
        card.appendChild(mk('div', `font:600 15px ${TF};color:${C.mut};margin-top:4px`, g.label));
        const row = mk('div', 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center');
        const btns = g.options.map(op => { const b = mk('button', '', op.label); b.type = 'button'; b.dataset.v = String(op.value); row.appendChild(b); return [b, op.value]; });
        const paint = () => btns.forEach(([b, v]) => { b.style.cssText = btnCss(false, v === g.value) + 'min-width:84px;min-height:52px;font-size:19px;padding:6px 16px'; b.setAttribute('aria-pressed', v === g.value ? 'true' : 'false'); });
        btns.forEach(([b, v]) => b.addEventListener('click', () => { g.value = v; paint(); if (g.onChange) g.onChange(v); }));
        paint(); card.appendChild(row);
      });
      const col = mk('div', 'display:flex;flex-direction:column;gap:10px;margin-top:8px;width:100%;align-items:center');
      (o.buttons || []).forEach(bt => { const b = mk('button', btnCss(bt.primary) + 'width:min(320px,100%)', bt.label); b.type = 'button'; b.addEventListener('click', () => bt.onClick()); col.appendChild(b); });
      card.appendChild(col); ov.appendChild(card);
    };
    k.hideMenu = () => { ov.style.display = 'none'; ov.innerHTML = ''; };
    k.menuOpen = () => ov.style.display !== 'none';
    // the standard end screen: score, best, new best, play again
    k.endScreen = o => {
      const lines = [];
      if (o.headline) lines.push({text:o.headline, big:true, color:o.headColor});
      if (o.score != null) lines.push({text:(o.scoreLabel || 'Score') + ': ' + o.score, big:true});
      if (o.res) lines.push(o.res.isBest ? {text:'🏆 New best!', big:true, color:C.good} : 'Best: ' + o.res.best);
      (o.extra || []).forEach(x => lines.push(x));
      const buttons = [{label:'Play again', primary:true, onClick:o.again}];
      if (o.menu) buttons.push({label:'Change players', onClick:o.menu});
      k.menu({emoji:o.emoji, title:o.title, lines, buttons});
    };
    // canvas helpers
    k.rr = (x, y, w, h, r) => { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); };
    k.chip = (txt, x, y, align, size, fg, bg) => {
      size = size || 18; cx.font = `700 ${size}px ${HF}`; const w = cx.measureText(txt).width + size * 1.1, h = size * 1.7;
      const left = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
      cx.fillStyle = bg || C.panel; k.rr(left, y, w, h, h / 2); cx.fill(); cx.strokeStyle = C.line; cx.lineWidth = 1.5; cx.stroke();
      cx.fillStyle = fg || C.ink; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(txt, left + w / 2, y + h / 2 + 1); return w;
    };
    k.cleanup = () => { dead = true; cancelAnimationFrame(raf); frameFn = null; k.clearTimers(); offs.forEach(f => f()); offs.length = 0; if (ro) ro.disconnect(); el.innerHTML = ''; };
    size();
    return k;
  }
  // samples a gesture so a flick's speed comes from its last ~90ms
  function flickTracker(){
    const s = [];
    return {
      reset(p){ s.length = 0; s.push({x:p.x, y:p.y, t:performance.now()}); },
      add(p){ s.push({x:p.x, y:p.y, t:performance.now()}); if (s.length > 40) s.shift(); },
      vel(){ if (s.length < 2) return {vx:0, vy:0, dist:0}; const lastS = s[s.length - 1]; let i = s.length - 1; while (i > 0 && lastS.t - s[i - 1].t < 90) i--; const a = s[Math.max(0, i - 1)]; const dt = Math.max(0.016, (lastS.t - a.t) / 1000);
        return {vx:(lastS.x - a.x) / dt, vy:(lastS.y - a.y) / dt, dist:Math.hypot(lastS.x - s[0].x, lastS.y - s[0].y)}; },
      first(){ return s[0]; }, last(){ return s[s.length - 1]; }
    };
  }
  // Roll & Score: swipe the ball up a wooden lane; it hops off the ramp into a ring board (10-50, with 100 holes in the top corners).
  window.BreakGames.rollball = {
    start(el, api){
      const k = kit(el, api), cx = k.cx, C = k.C;
      const BALLS = 9, DECEL = 0.55, BD = 1.6; // board depth in board units (u -1..1 across, w 0..BD back)
      const CEN = {u:0, w:0.95}, RINGS = [{r:0.17, pts:50, col:'#ff4d6d'}, {r:0.34, pts:40, col:'#ffb020'}, {r:0.52, pts:30, col:'#36c2ff'}, {r:0.72, pts:20, col:'#7be05a'}];
      const HOLES = [{u:-0.8, w:1.43, r:0.13}, {u:0.8, w:1.43, r:0.13}];
      let L = {};
      const layout = () => {
        const W = k.W, H = k.H, cxm = W / 2;
        const laneW = Math.min(W * 0.62, H * 0.62);
        L = {cxm, laneBot:H * 0.97, laneTop:H * 0.52, hwBot:laneW / 2, hwTop:laneW * 0.33,
             boardFront:H * 0.48, boardBack:H * 0.16, bhwFront:laneW * 0.5, bhwBack:laneW * 0.43, R:Math.max(14, laneW * 0.075)};
      };
      k.onResize = layout; layout();
      const laneY = s => lerp(L.laneBot, L.laneTop, s), laneHW = s => lerp(L.hwBot, L.hwTop, s);
      const laneP = (x, s) => ({x: L.cxm + x * laneHW(s), y: laneY(s), sc: lerp(1, 0.62, s)});
      const boardP = (u, w) => { const t = w / BD; return {x: L.cxm + u * lerp(L.bhwFront, L.bhwBack, t), y: lerp(L.boardFront, L.boardBack, t), sc: lerp(0.55, 0.42, t)}; };
      const boardRX = w => lerp(L.bhwFront, L.bhwBack, w / BD), boardRY = () => (L.boardFront - L.boardBack) / BD;
      let state = 'menu', ball = null, left = BALLS, score = 0, pops = [], hint = 0, sunk = [], lastPts = null, streak = 0;
      function newBall(){ ball = {mode:'rest', x:0, s:0.07, v:0, vx:0, spin:0, h:0, t:0}; }
      function begin(){ k.hideMenu(); state = 'play'; left = BALLS; score = 0; pops = []; sunk = []; hint = 4; streak = 0; newBall(); }
      function startScreen(){ state = 'menu'; newBall(); k.menu({emoji:'🎯', title:'Roll & Score', lines:['Swipe up to roll the ball up the lane.', 'Small corner holes are worth 100!', api.best != null ? 'Best: ' + api.best : ''], buttons:[{label:'Play', primary:true, onClick:begin}]}); }
      function finish(){ state = 'end'; const res = api.saveScore(score); k.after(600, () => k.endScreen({emoji:'🎯', title:'Nice rolling!', score, res, again:begin})); }
      function pop(txt, x, y, col, big){ pops.push({txt, x, y, col, big, t:0}); }
      // --- input ---
      const fl = flickTracker(); let drag = false;
      k.on(k.cv, 'pointerdown', e => { if (state !== 'play' || !ball || ball.mode !== 'rest') return; const p = k.pt(e); if (p.y < L.laneTop) return; drag = true; try { k.cv.setPointerCapture(e.pointerId); } catch(_){} fl.reset(p); ball.mode = 'hold'; });
      k.on(k.cv, 'pointermove', e => { if (!drag) return; const p = k.pt(e); fl.add(p); ball.x = clamp((p.x - L.cxm) / laneHW(ball.s), -0.8, 0.8); });
      const release = e => {
        if (!drag) return; drag = false; fl.add(k.pt(e)); const v = fl.vel(), laneLen = L.laneBot - L.laneTop;
        const vs = -v.vy / laneLen;
        if (vs < 0.5 || v.dist < 20){ ball.mode = 'rest'; hint = 2.5; return; }
        ball.v = clamp(vs * 0.8, 0, 3.8); ball.vx = clamp(v.vx / laneHW(0.1) * 0.35, -1.6, 1.6); ball.mode = 'roll'; hint = 0;
      };
      k.on(k.cv, 'pointerup', release); k.on(k.cv, 'pointercancel', release);
      function scoreAt(u, w){
        for (const h of HOLES) if (Math.hypot(u - h.u, w - h.w) < h.r) return {pts:100, u:h.u, w:h.w};
        const d = Math.hypot(u - CEN.u, w - CEN.w);
        for (const r of RINGS) if (d < r.r) return {pts:r.pts, u:CEN.u, w:CEN.w + (r.pts === 50 ? 0 : r.r - 0.09)};
        return {pts:10, u:clamp(u, -0.85, 0.85), w:0.1};
      }
      function update(dt){
        const b = ball; if (!b) return;
        b.t += dt;
        if (b.mode === 'roll'){
          b.v -= DECEL * dt; b.s += b.v * dt; b.x += b.vx * dt; b.spin += b.v * dt * 9;
          if (Math.abs(b.x) > 0.84){ b.x = Math.sign(b.x) * 0.84; b.vx *= -0.55; }
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
          if (b.s <= 0.07){ b.s = 0.07; b.mode = 'rest'; b.v = 0; b.vx = 0; pop('Roll harder!', L.cxm, laneY(0.35), '#fff'); }
        } else if (b.mode === 'fly'){
          if (b.t >= b.T){
            if (Math.abs(b.u1) > 1){ b.u1 = Math.sign(b.u1) * 0.92; }
            const sc = scoreAt(b.u1, b.w1);
            b.mode = 'hop'; b.t = 0; b.hu = b.u1; b.hw = b.w1; b.tu = sc.u; b.tw = sc.w; b.pts = sc.pts;
          }
        } else if (b.mode === 'hop'){
          if (b.t >= 0.55){
            score += b.pts; left--;
            const p = boardP(b.tu, b.tw);
            pop('+' + b.pts, p.x, p.y - 20, b.pts === 100 ? '#ffd23f' : '#fff', b.pts >= 50);
            if (b.pts === 100){ api.confetti(40); pop('Corner shot!', L.cxm, L.boardFront * 0.55, '#ffd23f', true); }
            else if (b.pts === 50) pop('Bullseye!', L.cxm, L.boardFront * 0.55, '#ff9fb2', true);
            sunk.push({u:b.tu, w:b.tw, t:0}); if (sunk.length > 12) sunk.shift();
            ball = null;
            k.after(600, () => { if (state !== 'play') return; if (left <= 0) finish(); else newBall(); });
          }
        }
        for (let i = pops.length - 1; i >= 0; i--){ pops[i].t += dt; if (pops[i].t > 1.3) pops.splice(i, 1); }
        if (hint > 0) hint -= dt;
      }
      // --- drawing ---
      function drawCabinet(){
        const W = k.W, H = k.H;
        const g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#13213f'); g.addColorStop(1, '#0a1226'); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
        // marquee lights around the board
        const t = performance.now() / 300;
        for (let i = 0; i < 16; i++){ const y = lerp(L.boardBack - 8, L.laneTop + 10, i / 15); [-1, 1].forEach(sd => { const x = L.cxm + sd * (lerp(L.bhwBack, L.hwTop, i / 15) + 22); cx.fillStyle = (Math.floor(t) + i) % 3 === 0 ? '#ffd23f' : '#ff6b8a'; cx.globalAlpha = (Math.floor(t) + i) % 3 === 0 ? 1 : 0.45; cx.beginPath(); cx.arc(x, y, 4, 0, 7); cx.fill(); }); }
        cx.globalAlpha = 1;
        // board back panel
        const bl = boardP(-1.12, BD), br = boardP(1.12, BD), fr = boardP(1.12, 0), fl2 = boardP(-1.12, 0);
        cx.fillStyle = '#2b3a67'; cx.fillRect(bl.x, L.boardBack - 26, br.x - bl.x, 30);
        cx.fillStyle = '#ffd23f'; cx.font = `800 ${clamp(L.R * 1.1, 14, 22)}px ${HF}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('★ ROLL & SCORE ★', L.cxm, L.boardBack - 11);
        // board surface
        cx.fillStyle = '#18264a'; cx.beginPath(); cx.moveTo(bl.x, bl.y); cx.lineTo(br.x, br.y); cx.lineTo(fr.x, fr.y); cx.lineTo(fl2.x, fl2.y); cx.closePath(); cx.fill();
        cx.strokeStyle = '#4c63a8'; cx.lineWidth = 3; cx.stroke();
        // rings (outer first)
        const c = boardP(CEN.u, CEN.w), ry = boardRY(), rx = boardRX(CEN.w);
        cx.fillStyle = '#22335f'; cx.beginPath(); cx.ellipse(c.x, c.y, 0.95 * rx, 0.95 * ry, 0, 0, 7); cx.fill();
        for (let i = RINGS.length - 1; i >= 0; i--){
          const r = RINGS[i];
          cx.fillStyle = i % 2 ? '#2e4580' : '#1c2b55'; cx.beginPath(); cx.ellipse(c.x, c.y, r.r * rx, r.r * ry, 0, 0, 7); cx.fill();
          cx.strokeStyle = r.col; cx.lineWidth = 3; cx.stroke();
          const hy = c.y - (r.r - 0.09) * ry * (i === 0 ? 0 : 1);
          cx.fillStyle = '#05080f'; cx.beginPath(); cx.ellipse(c.x, hy, 0.085 * rx, 0.085 * ry * 0.75, 0, 0, 7); cx.fill();
          cx.fillStyle = r.col; cx.font = `800 ${clamp(rx * 0.1, 11, 20)}px ${HF}`;
          if (i > 0) cx.fillText(String(r.pts), c.x + (r.r - 0.09) * rx * 0.0 + (r.r - 0.09) * rx * 0.75, c.y + (r.r - 0.09) * ry * 0.55);
        }
        cx.fillStyle = RINGS[0].col; cx.font = `800 ${clamp(rx * 0.1, 11, 20)}px ${HF}`; cx.fillText('50', c.x, c.y + 0.12 * ry);
        HOLES.forEach(h => { const p = boardP(h.u, h.w), hrx = h.r * boardRX(h.w), hry = h.r * ry;
          cx.fillStyle = '#3a1e5c'; cx.beginPath(); cx.ellipse(p.x, p.y, hrx * 1.35, hry * 1.35, 0, 0, 7); cx.fill(); cx.strokeStyle = '#ffd23f'; cx.lineWidth = 3; cx.stroke();
          cx.fillStyle = '#05080f'; cx.beginPath(); cx.ellipse(p.x, p.y, hrx * 0.75, hry * 0.6, 0, 0, 7); cx.fill();
          cx.fillStyle = '#ffd23f'; cx.fillText('100', p.x, p.y + hry * 1.05 + 8); });
        cx.fillStyle = '#9fb0d8'; cx.fillText('10', L.cxm, boardP(0, 0.1).y);
        // lane
        const a = laneP(-1.1, 0), b2 = laneP(1.1, 0), c2 = laneP(1.1, 1), d = laneP(-1.1, 1);
        const lg = cx.createLinearGradient(0, L.laneTop, 0, L.laneBot); lg.addColorStop(0, '#a8692f'); lg.addColorStop(1, '#e0a05c');
        cx.fillStyle = lg; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b2.x, b2.y); cx.lineTo(c2.x, c2.y); cx.lineTo(d.x, d.y); cx.closePath(); cx.fill();
        cx.strokeStyle = 'rgba(80,40,10,.25)'; cx.lineWidth = 1;
        for (let i = -4; i <= 4; i++){ const p1 = laneP(i / 4.4, 0), p2 = laneP(i / 4.4, 1); cx.beginPath(); cx.moveTo(p1.x, p1.y); cx.lineTo(p2.x, p2.y); cx.stroke(); }
        // arrows painted on lane
        cx.fillStyle = 'rgba(255,255,255,.18)'; [0.3, 0.55].forEach(s => { const p = laneP(0, s), w = laneHW(s) * 0.12; cx.beginPath(); cx.moveTo(p.x, p.y - w); cx.lineTo(p.x + w, p.y + w * 0.4); cx.lineTo(p.x - w, p.y + w * 0.4); cx.fill(); });
        // rails
        cx.fillStyle = '#c0c8d8'; [[a, d, -1], [b2, c2, 1]].forEach(([p, q, sd]) => { cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); cx.lineTo(q.x + sd * 10, q.y); cx.lineTo(p.x + sd * 16, p.y); cx.fill(); });
        // ramp hump at the top of the lane
        const r1 = laneP(-1.05, 1), r2 = laneP(1.05, 1); const rg = cx.createLinearGradient(0, r1.y - 20, 0, r1.y + 6); rg.addColorStop(0, '#ffcf8a'); rg.addColorStop(1, '#8a4f1c');
        cx.fillStyle = rg; cx.beginPath(); cx.moveTo(r1.x, r1.y + 4); cx.quadraticCurveTo(L.cxm, r1.y - L.R * 1.6, r2.x, r2.y + 4); cx.closePath(); cx.fill();
      }
      function drawBall(x, y, r, spin, sh){
        if (sh){ cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(sh.x, sh.y + r * 0.7, r * 0.9, r * 0.3, 0, 0, 7); cx.fill(); }
        const g = cx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, '#fff7e6'); g.addColorStop(0.5, '#e8d2a6'); g.addColorStop(1, '#8e6d3c');
        cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fill();
        cx.save(); cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.clip(); cx.strokeStyle = 'rgba(120,70,20,.45)'; cx.lineWidth = r * 0.16;
        const off = ((spin % 1) + 1) % 1; for (let i = -1; i < 2; i++){ const yy = y + (i + off) * r * 0.9 - r * 0.45; cx.beginPath(); cx.ellipse(x, yy, r, r * 0.25, 0, 0, 7); cx.stroke(); }
        cx.restore();
      }
      function draw(){
        drawCabinet();
        sunk.forEach(s => { const p = boardP(s.u, s.w); cx.fillStyle = 'rgba(232,210,166,.55)'; cx.beginPath(); cx.arc(p.x, p.y, L.R * 0.35, 0, 7); cx.fill(); });
        const b = ball;
        if (b){
          if (b.mode === 'rest' || b.mode === 'hold' || b.mode === 'roll' || b.mode === 'back'){ const p = laneP(b.x, b.s); drawBall(p.x, p.y - L.R * p.sc, L.R * p.sc, b.spin, {x:p.x, y:p.y - L.R * p.sc}); }
          else if (b.mode === 'fly'){
            const t = clamp(b.t / b.T, 0, 1), from = laneP(b.fx, 1), to = boardP(b.u1, b.bounced ? BD : b.w1);
            let x = lerp(from.x, to.x, t), gy = lerp(from.y, to.y, t), sc = lerp(0.62, to.sc, t), arc = Math.sin(Math.PI * t) * (k.H * 0.1 + b.wHit * k.H * 0.05);
            drawBall(x, gy - arc - L.R * sc, L.R * sc, b.spin + t * 3, {x, y:gy - L.R * sc});
          } else if (b.mode === 'hop'){
            const t = clamp(b.t / 0.55, 0, 1), u = lerp(b.hu, b.tu, t), w = lerp(b.hw, b.tw, t), p = boardP(u, w), hop = Math.abs(Math.sin(t * Math.PI * 2)) * (1 - t) * k.H * 0.035, r = L.R * p.sc * (t > 0.8 ? lerp(1, 0.5, (t - 0.8) / 0.2) : 1);
            drawBall(p.x, p.y - hop - r, r, b.spin, {x:p.x, y:p.y - r});
          }
        }
        pops.forEach(q => { cx.globalAlpha = clamp(1.5 - q.t, 0, 1); cx.font = `800 ${q.big ? 36 : 26}px ${HF}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineWidth = 5; cx.strokeStyle = 'rgba(0,0,0,.65)'; const y = q.y - q.t * 30; cx.strokeText(q.txt, q.x, y); cx.fillStyle = q.col; cx.fillText(q.txt, q.x, y); cx.globalAlpha = 1; });
        if (state !== 'menu'){
          k.chip('Score ' + score, k.W - 12, 10, 'right', 20);
          const w = k.chip('Balls ' + left, 12, 10, 'left', 20);
          for (let i = 0; i < BALLS; i++){ cx.fillStyle = i < left ? '#e8d2a6' : 'rgba(255,255,255,.15)'; cx.beginPath(); cx.arc(26 + w + i * 15, 27, 6, 0, 7); cx.fill(); }
          if (hint > 0 && ball && ball.mode === 'rest'){ cx.globalAlpha = clamp(hint, 0, 1); k.chip('👆 Swipe up to roll!', L.cxm, laneY(0.35), 'center', 20); cx.globalAlpha = 1; }
        }
      }
      k.frame(dt => { if (state === 'play' || state === 'end') update(dt); draw(); });
      startScreen();
      return k.cleanup;
    }
  };
})();
