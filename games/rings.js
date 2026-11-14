// Break Zone game: rings. Self-contained: canvas + DOM overlay, no images or libraries.
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
      if (o.res) lines.push(o.res.isBest && o.score > 0 ? {text:'🏆 New best!', big:true, color:C.good} : 'Best: ' + o.res.best);
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
  // Ring Toss: a fair booth seen in perspective. Flick a ring; it flies in an arc and rings a bottle neck, clinks off, or misses.
  window.BreakGames.rings = {
    start(el, api){
      const k = kit(el, api), cx = k.cx, C = k.C;
      const CAM_H = 1.25, G = 6.2, NECK = 0.43, RING_R = 0.13, HAND_Z = 1.6, HAND_H = 0.45, TABLE_NEAR = 2.3, TABLE_FAR = 6.7;
      const ROWS = [{z:3.6, pts:10, col:'#2fa36b'}, {z:4.8, pts:20, col:'#2f7fd6'}, {z:6.0, pts:30, col:'#8a4fd6'}];
      const RING_COLS = ['#ff5a5f', '#ffb020', '#36c2ff', '#7be05a', '#ff7ad9', '#ffffff'];
      let F = 1, HOR = 0, MID = 0;
      const layout = () => { MID = k.W / 2; HOR = k.H * 0.2; F = Math.min(k.H * 1.3, k.W * 1.05); };
      k.onResize = layout; layout();
      const P = (x, h, z) => ({x: MID + x * F / z, y: HOR + (CAM_H - h) * F / z, s: F / z});
      let bottles = [], rings = [], pops = [], cur = null, left = 10, score = 0, state = 'menu', tossN = 0, hint = 0, goldTimer = 0;
      function makeBottles(){
        bottles = [];
        ROWS.forEach((r, ri) => { for (let i = 0; i < 5; i++) bottles.push({x:(i - 2) * 0.42 + (ri === 1 ? 0.0 : 0), z:r.z, pts:r.pts, col:r.col, gold:false, wob:0}); });
        moveGold();
      }
      function moveGold(){ bottles.forEach(b => { if (b.gold){ b.gold = false; b.pts = ROWS[2].pts; } }); const back = bottles.filter(b => b.z === ROWS[2].z && !b.held); const g = back[Math.floor(Math.random() * back.length)] || bottles[bottles.length - 1]; g.gold = true; g.pts = 100; }
      function newRing(){ cur = {x:0, h:HAND_H, z:HAND_Z, vx:0, vh:0, vz:0, state:'hand', col:RING_COLS[tossN % RING_COLS.length], spin:0, bounces:0, t:0, on:null, slide:0, alpha:1}; }
      function begin(){ k.hideMenu(); makeBottles(); rings = []; pops = []; left = 10; score = 0; tossN = 0; hint = 4; goldTimer = 0; state = 'play'; newRing(); }
      function startScreen(){
        state = 'menu';
        k.menu({emoji:'🎪', title:'Ring Toss', lines:['Flick a ring up at the bottles.', 'Far bottles are worth more. Gold = 100!', api.best != null ? 'Best: ' + api.best : ''], buttons:[{label:'Play', primary:true, onClick:begin}]});
      }
      function finish(){
        state = 'end'; const res = api.saveScore(score);
        k.after(500, () => k.endScreen({emoji:'🎪', title:'All rings tossed!', score, res, again:begin}));
      }
      // --- input: flick from the bottom of the screen ---
      const fl = flickTracker(); let dragging = false;
      k.on(k.cv, 'pointerdown', e => { if (state !== 'play' || !cur || cur.state !== 'hand') return; dragging = true; try { k.cv.setPointerCapture(e.pointerId); } catch(_){} fl.reset(k.pt(e)); });
      k.on(k.cv, 'pointermove', e => { if (!dragging) return; const p = k.pt(e); fl.add(p); cur.x = clamp((p.x - MID) / (F / HAND_Z), -0.7, 0.7); });
      const up = e => {
        if (!dragging) return; dragging = false; fl.add(k.pt(e));
        const v = fl.vel(), spd = -v.vy / k.H;
        if (spd < 0.6 || v.dist < 25){ hint = 2.5; return; }
        const vz = clamp(0.4 + spd * 1.65, 1.6, 8.5), ratio = clamp(v.vx / -v.vy, -1.2, 1.2);
        cur.vz = vz; cur.vx = ratio * vz * 0.5; cur.vh = 2.4; cur.state = 'fly'; cur.spin = ratio * 4 + 2; hint = 0; left--; tossN++;
        rings.push(cur); cur = null;
      };
      k.on(k.cv, 'pointerup', up); k.on(k.cv, 'pointercancel', up);
      function pop(txt, x, h, z, col){ pops.push({txt, x, h, z, t:0, col}); }
      function settle(r, msg, col){ if (r.state === 'fly') r.state = 'down'; if (msg) pop(msg, r.x, Math.max(r.h, 0.3), r.z, col); k.after(650, () => { if (state !== 'play') return; if (left <= 0){ finish(); return; } if (++goldTimer >= 3){ goldTimer = 0; moveGold(); } newRing(); }); }
      function update(dt){
        rings.forEach(r => {
          r.t += dt;
          if (r.state === 'fly'){
            const ph = r.h; r.x += r.vx * dt; r.z += r.vz * dt; r.vh -= G * dt; r.h += r.vh * dt;
            if (ph >= NECK && r.h < NECK && r.vh < 0){
              let best = null, bd = 9; bottles.forEach(b => { const d = Math.hypot(r.x - b.x, (r.z - b.z) * 0.85); if (d < bd){ bd = d; best = b; } });
              if (best && bd < 0.12){
                r.state = 'on'; r.on = best; r.slide = 0; best.held = (best.held || 0) + 1; best.wob = 1; r.stack = best.held - 1;
                score += best.pts; pop((best.gold ? '⭐ GOLD! +' : 'Ringer! +') + best.pts, best.x, 0.7, best.z, best.gold ? '#ffd23f' : '#ffffff');
                if (best.gold){ api.confetti(40); goldTimer = 2; }
                settle(r); return;
              }
              if (best && bd < 0.23 && r.bounces < 2){
                const dx = r.x - best.x, dz = r.z - best.z, d = Math.hypot(dx, dz) || 1;
                r.vx = dx / d * 0.9 + r.vx * 0.25; r.vz = dz / d * 0.9 + r.vz * 0.3; r.vh = 1.5; r.h = NECK + 0.002; r.bounces++; best.wob = 0.6; r.spin *= -1.5;
                pop('Clink!', best.x, 0.6, best.z, '#ffe6a6');
              }
            }
            if (r.h <= 0 && r.z >= TABLE_NEAR && r.z <= TABLE_FAR && Math.abs(r.x) < 1.7){ r.h = 0; settle(r, 'Miss', '#ffffff'); }
            else if (r.h < -1.2 || r.z > 9){ r.state = 'gone'; settle(r, null); pop('Miss', r.x, 0.2, Math.min(r.z, TABLE_FAR), '#ffffff'); }
          } else if (r.state === 'on'){ r.slide = Math.min(1, r.slide + dt * 3); }
          else if (r.state === 'down'){ r.alpha = Math.max(0.35, r.alpha - dt * 0.4); }
        });
        bottles.forEach(b => { b.wob = Math.max(0, b.wob - dt * 1.6); });
        for (let i = pops.length - 1; i >= 0; i--){ pops[i].t += dt; if (pops[i].t > 1.2) pops.splice(i, 1); }
        if (rings.length > 40) rings = rings.filter(r => r.state === 'on' || r.state === 'fly');
        if (hint > 0) hint -= dt;
      }
      // --- drawing ---
      function drawBooth(){
        const W = k.W, H = k.H;
        // back curtain
        const g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a1752'); g.addColorStop(1, '#1d0b2b'); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
        // light string
        for (let i = 0; i < 14; i++){ const x = (i + 0.5) * W / 14, y = HOR * 0.55 + Math.sin(i * 0.9) * 4; cx.fillStyle = ['#ffd23f', '#ff5a5f', '#36c2ff', '#7be05a'][i % 4]; cx.beginPath(); cx.arc(x, y, Math.max(3, H * 0.008), 0, 7); cx.fill(); }
        // tent stripes
        const sw = W / 10; for (let i = 0; i < 10; i++){ cx.fillStyle = i % 2 ? '#ffffff' : '#e8424c'; cx.beginPath(); cx.moveTo(i * sw, 0); cx.lineTo((i + 1) * sw, 0); cx.lineTo((i + 1) * sw, HOR * 0.32); cx.quadraticCurveTo((i + 0.5) * sw, HOR * 0.48, i * sw, HOR * 0.32); cx.fill(); }
        // table top
        const a = P(-1.75, 0, TABLE_NEAR), b = P(1.75, 0, TABLE_NEAR), c = P(1.75, 0, TABLE_FAR), d = P(-1.75, 0, TABLE_FAR);
        const tg = cx.createLinearGradient(0, d.y, 0, a.y); tg.addColorStop(0, '#7a4a25'); tg.addColorStop(1, '#b97a44');
        cx.fillStyle = tg; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.lineTo(c.x, c.y); cx.lineTo(d.x, d.y); cx.closePath(); cx.fill();
        cx.strokeStyle = 'rgba(0,0,0,.18)'; cx.lineWidth = 1;
        for (let i = 1; i < 9; i++){ const x = -1.75 + i * 3.5 / 9, p1 = P(x, 0, TABLE_NEAR), p2 = P(x, 0, TABLE_FAR); cx.beginPath(); cx.moveTo(p1.x, p1.y); cx.lineTo(p2.x, p2.y); cx.stroke(); }
        // table front edge
        cx.fillStyle = '#5b3418'; cx.fillRect(a.x, a.y, b.x - a.x, Math.max(8, H * 0.03));
        // row labels
        ROWS.forEach(r => { const p = P(1.45, 0, r.z); k.chip(String(r.pts), p.x, p.y - 22 * p.s / 300, 'center', clamp(p.s * 0.06, 12, 20), '#fff', r.col); });
      }
      function drawBottle(b){
        const p = P(b.x, 0, b.z), s = p.s, wob = Math.sin(performance.now() / 50) * b.wob * 0.05;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(wob);
        const bw = 0.09 * s, bh = 0.27 * s, nw = 0.032 * s, nh = NECK * s;
        cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(0, 0, bw * 1.2, bw * 0.35, 0, 0, 7); cx.fill();
        const col = b.gold ? '#f5c518' : b.col;
        const g = cx.createLinearGradient(-bw, 0, bw, 0); g.addColorStop(0, col); g.addColorStop(0.35, b.gold ? '#fff6c2' : 'rgba(255,255,255,.85)'); g.addColorStop(0.55, col); g.addColorStop(1, b.gold ? '#a77c00' : 'rgba(0,0,0,.45)');
        cx.fillStyle = col; cx.beginPath();
        cx.moveTo(-bw, 0); cx.lineTo(-bw, -bh); cx.quadraticCurveTo(-bw, -bh - bw * 1.1, -nw, -bh - bw * 1.5); cx.lineTo(-nw, -nh); cx.lineTo(nw, -nh); cx.lineTo(nw, -bh - bw * 1.5); cx.quadraticCurveTo(bw, -bh - bw * 1.1, bw, -bh); cx.lineTo(bw, 0); cx.closePath(); cx.fill();
        cx.fillStyle = g; cx.globalAlpha = 0.55; cx.fill(); cx.globalAlpha = 1;
        cx.fillStyle = b.gold ? '#fff2a8' : 'rgba(255,255,255,.9)'; cx.fillRect(-nw * 1.25, -nh - nw * 0.6, nw * 2.5, nw * 0.9);
        if (b.gold){ cx.font = `${Math.max(10, bw * 1.1)}px system-ui`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('⭐', 0, -bh * 0.5); }
        cx.restore();
      }
      function ringShape(x, y, rx, ry, col, alpha, half){
        cx.globalAlpha = alpha; cx.lineWidth = Math.max(2, rx * 0.26); cx.strokeStyle = 'rgba(0,0,0,.35)';
        const a0 = half === 'back' ? Math.PI : 0, a1 = half === 'front' ? Math.PI : Math.PI * 2;
        cx.beginPath(); cx.ellipse(x, y + 1.5, rx, ry, 0, a0, half ? a1 : Math.PI * 2); cx.stroke();
        cx.strokeStyle = col; cx.lineWidth = Math.max(1.6, rx * 0.2); cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, a0, half ? a1 : Math.PI * 2); cx.stroke();
        cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = Math.max(1, rx * 0.06); cx.beginPath(); cx.ellipse(x, y - rx * 0.05, rx * 0.95, ry * 0.9, 0, Math.PI * 1.1, Math.PI * 1.6); cx.stroke();
        cx.globalAlpha = 1;
      }
      function ringOnBottle(r, half){
        const b = r.on, hh = lerp(NECK, 0.3 + Math.min(r.stack, 3) * 0.03, r.slide), p = P(b.x, hh, b.z), rx = RING_R * 0.62 * p.s;
        ringShape(p.x, p.y, rx, rx * 0.32, r.col, 1, half);
      }
      function drawFlyer(r){
        if (r.h < 0) return;
        const p = P(r.x, r.h, r.z), rx = RING_R * p.s;
        if (r.h > 0 && r.z >= TABLE_NEAR && r.z <= TABLE_FAR){ const sh = P(r.x, 0, r.z); cx.fillStyle = 'rgba(0,0,0,.22)'; cx.beginPath(); cx.ellipse(sh.x, sh.y, rx, rx * 0.22, 0, 0, 7); cx.fill(); }
        const tilt = r.state === 'down' ? 0.24 : clamp(0.3 + Math.sin(r.t * r.spin) * 0.12, 0.15, 0.5);
        ringShape(p.x, p.y, rx, rx * tilt, r.col, r.alpha);
      }
      const list = [];
      function draw(){
        drawBooth();
        list.length = 0;
        bottles.forEach(b => list.push({z:b.z, b}));
        rings.forEach(r => { if (r.state !== 'on' && r.state !== 'gone') list.push({z:r.z - 0.01, r}); });
        list.sort((a, b) => b.z - a.z);
        for (const it of list){
          if (it.b){ rings.forEach(r => { if (r.on === it.b) ringOnBottle(r, 'back'); }); drawBottle(it.b); rings.forEach(r => { if (r.on === it.b) ringOnBottle(r, 'front'); }); }
          else drawFlyer(it.r);
        }
        rings.forEach(r => { if (r.state === 'gone' && r.h > -1.2) drawFlyer(r); });
        if (cur){ const p = P(cur.x, cur.h, cur.z), rx = RING_R * p.s; ringShape(p.x, p.y, rx, rx * 0.42, cur.col, 1); }
        pops.forEach(q => { const p = P(q.x, q.h + q.t * 0.25, q.z); cx.globalAlpha = clamp(1.4 - q.t, 0, 1); cx.font = `800 ${clamp(p.s * 0.09, 18, 34)}px ${HF}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineWidth = 5; cx.strokeStyle = 'rgba(0,0,0,.6)'; cx.strokeText(q.txt, p.x, p.y); cx.fillStyle = q.col; cx.fillText(q.txt, p.x, p.y); cx.globalAlpha = 1; });
        // HUD
        if (state !== 'menu'){
          k.chip('Score ' + score, k.W - 12, 10, 'right', 20);
          const w = k.chip('Rings ' + left + (cur ? '' : ''), 12, 10, 'left', 20);
          for (let i = 0; i < 10; i++){ cx.strokeStyle = i < left ? RING_COLS[i % RING_COLS.length] : 'rgba(255,255,255,.2)'; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(24 + w + i * 16, 27, 6, 6, 0, 0, 7); cx.stroke(); }
          if (hint > 0 && state === 'play' && cur){ cx.globalAlpha = clamp(hint, 0, 1); k.chip('👆 Flick up to toss!', k.W / 2, k.H - 56, 'center', 20); cx.globalAlpha = 1; }
        }
      }
      k.frame(dt => { if (state === 'play' || state === 'end') update(dt); draw(); });
      makeBottles(); startScreen();
      return k.cleanup;
    }
  };
})();
