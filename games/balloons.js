// Break Zone game: balloons. Self-contained: canvas + DOM overlay, no images or libraries.
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
  // Balloon Pop: balloons float up a fair wall; tap or flick to throw a soft suction ball (slight arc). 60 seconds.
  window.BreakGames.balloons = {
    start(el, api){
      const k = kit(el, api), cx = k.cx, C = k.C;
      const COLS = ['#ff4d6d', '#ffb020', '#36c2ff', '#7be05a', '#b07cff', '#ff7ad9', '#2ee6c5'];
      const KINDS = [{r:0.068, sp:0.13, pts:10, w:5}, {r:0.052, sp:0.18, pts:20, w:4}, {r:0.038, sp:0.26, pts:30, w:3}];
      let reload = 0, state = 'menu', time = 60, score = 0, balloons = [], balls = [], bits = [], pops = [], spawnT = 0, rainbowT = 10, elapsed = 0, popped = 0, hint = 0;
      const M = () => Math.min(k.W, k.H), launch = () => ({x:k.W / 2, y:k.H - M() * 0.07});
      function spawn(rainbow){
        const kd = rainbow ? KINDS[1] : pick(), r = kd.r * M() * (0.9 + Math.random() * 0.2), hard = clamp(elapsed / 60, 0, 1);
        balloons.push({x:rnd(r + 10, k.W - r - 10), y:k.H + r * 1.5, r, vy:-(kd.sp * (1 + hard * 0.6) * k.H * (0.85 + Math.random() * 0.3) + (rainbow ? k.H * 0.05 : 0)), ph:Math.random() * 7, sw:rnd(10, 26), col:COLS[Math.floor(Math.random() * COLS.length)], pts:rainbow ? 25 : kd.pts, rainbow:!!rainbow, alive:true});
      }
      function pick(){ const t = KINDS.reduce((a, b) => a + b.w, 0); let x = Math.random() * t; for (const kd of KINDS){ x -= kd.w; if (x <= 0) return kd; } return KINDS[0]; }
      function begin(){ k.hideMenu(); state = 'play'; time = 60; score = 0; balloons = []; balls = []; bits = []; pops = []; spawnT = 0; rainbowT = rnd(9, 14); elapsed = 0; popped = 0; hint = 4; for (let i = 0; i < 4; i++){ spawn(false); balloons[i].y = k.H * (0.45 + i * 0.13); } }
      function startScreen(){ state = 'menu'; balloons = []; for (let i = 0; i < 7; i++){ spawn(false); balloons[i].y = k.H * (0.2 + Math.random() * 0.7); }
        k.menu({emoji:'🎈', title:'Balloon Pop', lines:['Tap or flick to throw a ball and pop balloons.', 'Small ones are worth more. 🌈 = extra time!', api.best != null ? 'Best: ' + api.best : ''], buttons:[{label:'Play', primary:true, onClick:begin}]}); }
      function finish(){ state = 'end'; const res = api.saveScore(score); k.after(700, () => k.endScreen({emoji:'🎈', title:"Time's up!", score, res, extra:[popped + ' balloons popped'], again:begin})); }
      // --- input: a tap throws at that spot, a flick throws that way ---
      const fl = flickTracker(); let down = false;
      k.on(k.cv, 'pointerdown', e => { if (state !== 'play') return; down = true; try { k.cv.setPointerCapture(e.pointerId); } catch(_){} fl.reset(k.pt(e)); });
      k.on(k.cv, 'pointermove', e => { if (down) fl.add(k.pt(e)); });
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
        balls.push({x:o.x, y:o.y, vx, vy, g, t:0, r:M() * 0.028, stuck:false, life:0, hits:0}); hint = 0;
      };
      k.on(k.cv, 'pointerup', up); k.on(k.cv, 'pointercancel', up);
      function burst(b){
        b.alive = false; popped++;
        let pts = b.pts; score += pts;
        const n = api.reducedMotion ? 6 : 12; for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2 + Math.random() * 0.4, s = rnd(120, 320); bits.push({x:b.x, y:b.y, vx:Math.cos(a) * s, vy:Math.sin(a) * s, life:0.6, t:0, col:b.rainbow ? COLS[i % COLS.length] : b.col, w:rnd(6, 12)}); }
        bits.push({ring:true, x:b.x, y:b.y, r:b.r, t:0, life:0.35, col:'#fff'});
        if (b.rainbow){ time += 5; pops.push({txt:'🌈 +5 seconds!', x:b.x, y:b.y, t:0, col:'#ffd23f', big:true}); api.confetti(30); }
        pops.push({txt:'+' + pts, x:b.x, y:b.y - b.r, t:0, col:'#fff'});
      }
      function update(dt){
        if (state === 'play'){
          elapsed += dt; time -= dt;
          spawnT -= dt; if (spawnT <= 0){ spawn(false); spawnT = lerp(0.85, 0.45, clamp(elapsed / 60, 0, 1)) * rnd(0.7, 1.3); }
          rainbowT -= dt; if (rainbowT <= 0){ spawn(true); rainbowT = rnd(11, 16); }
          if (time <= 0){ time = 0; finish(); }
        }
        balloons.forEach(b => { b.y += b.vy * dt; b.ph += dt * 1.6; });
        for (let i = balloons.length - 1; i >= 0; i--){ const b = balloons[i]; if (!b.alive || b.y < -b.r * 3) balloons.splice(i, 1); }
        balls.forEach(bl => {
          bl.life += dt;
          if (!bl.stuck){
            bl.t += dt; bl.vy += bl.g * dt; bl.x += bl.vx * dt; bl.y += bl.vy * dt;
            if (state === 'play') balloons.forEach(b => { if (b.alive){ const bx = b.x + Math.sin(b.ph) * b.sw * 0.3; if (Math.hypot(bl.x - bx, (bl.y - b.y) * 0.88) < b.r + bl.r){ b.x = bx; burst(b); bl.hits++; if (bl.hits === 2){ score += 15; pops.push({txt:'Double! +15', x:bl.x, y:bl.y - 30, t:0, col:'#ffd23f', big:true}); } } } });
            if (bl.t > 0.7 || bl.y < bl.r || bl.x < bl.r || bl.x > k.W - bl.r){ bl.stuck = true; bl.life = 0; bl.x = clamp(bl.x, bl.r, k.W - bl.r); bl.y = Math.max(bl.y, bl.r); }
          }
        });
        for (let i = balls.length - 1; i >= 0; i--) if (balls[i].stuck && balls[i].life > 0.9) balls.splice(i, 1);
        for (let i = bits.length - 1; i >= 0; i--){ const p = bits[i]; p.t += dt; if (!p.ring){ p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; } if (p.t > p.life) bits.splice(i, 1); }
        for (let i = pops.length - 1; i >= 0; i--){ pops[i].t += dt; if (pops[i].t > 1.1) pops.splice(i, 1); }
        if (hint > 0) hint -= dt;
        if (reload > 0) reload -= dt;
      }
      function drawWall(){
        const W = k.W, H = k.H;
        const g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a6fdb'); g.addColorStop(1, '#5aa8ff'); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
        cx.fillStyle = 'rgba(255,255,255,.08)'; const s = Math.max(36, M() * 0.1); for (let y = 0, r = 0; y < H; y += s, r++) for (let x = (r % 2) * s / 2; x < W; x += s){ cx.beginPath(); cx.arc(x, y, s * 0.12, 0, 7); cx.fill(); }
      }
      function drawCounter(){
        const W = k.W, H = k.H, ch = M() * 0.12; cx.fillStyle = '#e8424c'; cx.fillRect(0, H - ch, W, ch); cx.fillStyle = '#fff'; for (let x = 0; x < W; x += 60) cx.fillRect(x, H - ch, 30, ch);
        cx.fillStyle = 'rgba(0,0,0,.2)'; cx.fillRect(0, H - ch, W, 5);
      }
      function drawBalloon(b){
        const x = b.x + Math.sin(b.ph) * b.sw * 0.3, y = b.y, r = b.r;
        cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(x, y + r * 1.15); cx.quadraticCurveTo(x + Math.sin(b.ph * 1.3) * 10, y + r * 1.8, x, y + r * 2.6); cx.stroke();
        let fill;
        if (b.rainbow){ fill = cx.createLinearGradient(x - r, y - r, x + r, y + r); COLS.forEach((c, i) => fill.addColorStop(i / (COLS.length - 1), c)); } else fill = b.col;
        cx.fillStyle = fill; cx.beginPath(); cx.ellipse(x, y, r * 0.88, r * 1.05, 0, 0, 7); cx.fill();
        cx.beginPath(); cx.moveTo(x, y + r * 0.98); cx.lineTo(x - r * 0.12, y + r * 1.18); cx.lineTo(x + r * 0.12, y + r * 1.18); cx.fill();
        cx.fillStyle = 'rgba(255,255,255,.45)'; cx.beginPath(); cx.ellipse(x - r * 0.32, y - r * 0.4, r * 0.18, r * 0.3, -0.5, 0, 7); cx.fill();
        if (b.rainbow){ cx.font = `800 ${Math.round(r * 0.55)}px ${HF}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#fff'; cx.fillText('+5s', x, y + 2); }
      }
      function draw(){
        drawWall();
        balloons.forEach(drawBalloon);
        drawCounter();
        bits.forEach(p => { const a = 1 - p.t / p.life; cx.globalAlpha = a; if (p.ring){ cx.strokeStyle = p.col; cx.lineWidth = 3; cx.beginPath(); cx.arc(p.x, p.y, p.r * (1 + p.t * 3), 0, 7); cx.stroke(); } else { cx.fillStyle = p.col; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.t * 9 + p.w); cx.fillRect(-p.w / 2, -p.w / 4, p.w, p.w / 2); cx.restore(); } cx.globalAlpha = 1; });
        balls.forEach(b => { const a = b.stuck ? clamp(1 - (b.life - 0.5) / 0.4, 0, 1) : 1; cx.globalAlpha = a; const sq = b.stuck ? 1 + Math.min(b.life * 6, 1) * 0.25 : 1;
          cx.fillStyle = '#ffe14d'; cx.beginPath(); cx.ellipse(b.x, b.y, b.r * sq, b.r / sq, 0, 0, 7); cx.fill(); cx.strokeStyle = '#d9a400'; cx.lineWidth = 2; cx.stroke();
          cx.fillStyle = '#ff7a00'; cx.beginPath(); cx.arc(b.x, b.y, b.r * 0.45, 0, 7); cx.fill(); cx.globalAlpha = 1; });
        // the launcher: a ball resting on the counter
        if (state === 'play'){ const o = launch(), r = M() * 0.028; cx.fillStyle = '#ffe14d'; cx.beginPath(); cx.arc(o.x, o.y, r, 0, 7); cx.fill(); cx.strokeStyle = '#d9a400'; cx.lineWidth = 2; cx.stroke(); cx.fillStyle = '#ff7a00'; cx.beginPath(); cx.arc(o.x, o.y, r * 0.45, 0, 7); cx.fill(); }
        pops.forEach(q => { cx.globalAlpha = clamp(1.4 - q.t * 1.3, 0, 1); cx.font = `800 ${q.big ? 30 : 24}px ${HF}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineWidth = 5; cx.strokeStyle = 'rgba(0,0,0,.55)'; const y = q.y - q.t * 40; cx.strokeText(q.txt, q.x, y); cx.fillStyle = q.col; cx.fillText(q.txt, q.x, y); cx.globalAlpha = 1; });
        if (state !== 'menu'){
          k.chip('Score ' + score, k.W - 12, 10, 'right', 20);
          const tt = Math.ceil(time), low = tt <= 10 && state === 'play';
          k.chip('⏱ ' + tt, 12, 10, 'left', 20, low ? '#fff' : null, low ? '#e8424c' : null);
          if (hint > 0){ cx.globalAlpha = clamp(hint, 0, 1); k.chip('👆 Tap a balloon or flick to throw!', k.W / 2, k.H * 0.4, 'center', 20); cx.globalAlpha = 1; }
        }
      }
      k.frame(dt => { if (state === 'menu'){ balloons.forEach(b => { b.y += b.vy * dt * 0.4; b.ph += dt; if (b.y < -b.r * 3) b.y = k.H + b.r * 2; }); } else update(dt); draw(); });
      startScreen();
      return k.cleanup;
    }
  };
})();
