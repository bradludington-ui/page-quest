// Break Zone game: checkers. Self-contained: canvas + DOM overlay, no images or libraries.
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
  // Checkers (American rules): diagonal moves, captures are a must, multi-jumps, kings. vs computer or 2 players.
  window.BreakGames.checkers = {
    start(el, api){
      const k = kit(el, api), cx = k.cx, C = k.C;
      // board: 64 cells, 0 empty; 1 / 2 = men of side 0 (bottom, moves up) / side 1 (top); 3 / 4 = their kings
      const opt = Object.assign({players:1, level:'easy'}, api.store.get('opts') || {});
      const side = v => v === 1 || v === 3 ? 0 : v === 2 || v === 4 ? 1 : -1, isKing = v => v >= 3;
      const PC = [{top:'#e8424c', rim:'#9e1f28'}, {top:'#3b3f4a', rim:'#15171c'}];
      let state = 'menu', B = [], turn = 0, sel = -1, path = [], seqs = [], moving = null, quiet = 0, last = null, winner = -1, crowned = [];
      const names = () => opt.players === 1 ? ['You', 'Computer'] : [api.name || 'Red', 'Black'];
      function startScreen(){
        state = 'menu';
        const groups = [{label:'Players', value:opt.players, options:[{label:'1 player (vs computer)', value:1}, {label:'2 players (same iPad)', value:2}], onChange:v => { opt.players = v; startScreen(); }}];
        if (opt.players === 1) groups.push({label:'Computer', value:opt.level, options:[{label:'Easy', value:'easy'}, {label:'Medium', value:'medium'}], onChange:v => { opt.level = v; }});
        k.menu({emoji:'🔴⚫', title:'Checkers', lines:['Tap a piece, then tap where it should go.', 'Jumps are a must. Reach the far side to get a king 👑', opt.players === 1 && api.best != null ? 'Best: ' + api.best : ''], groups, buttons:[{label:'Play', primary:true, onClick:begin}]});
      }
      function begin(){
        api.store.set('opts', opt); k.hideMenu();
        B = Array(64).fill(0);
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1){ if (r < 3) B[r * 8 + c] = 2; else if (r > 4) B[r * 8 + c] = 1; }
        turn = 0; sel = -1; path = []; moving = null; quiet = 0; last = null; winner = -1; state = 'play'; refresh();
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
      let G = {};
      const layout = () => { const top = 54, s = Math.floor(Math.min(k.W - 20, k.H - top - 10) / 8) * 8; G = {s, q:s / 8, x:(k.W - s) / 2, y:top + (k.H - top - 10 - s) / 2}; };
      k.onResize = layout; layout();
      const cellAt = p => { const c = Math.floor((p.x - G.x) / G.q), r = Math.floor((p.y - G.y) / G.q); return c >= 0 && c < 8 && r >= 0 && r < 8 ? r * 8 + c : -1; };
      const cellXY = i => ({x:G.x + ((i & 7) + 0.5) * G.q, y:G.y + ((i >> 3) + 0.5) * G.q});
      let nudge = 0;
      function tap(i){
        if (!human() || i < 0) return;
        if (path.length === 0 && side(B[i]) === turn){ sel = seqs.some(m => m.from === i) ? i : -1; if (sel < 0){ nudge = 1.2; } return; }
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
      el._test = () => { if (!human()) return []; const r = k.cv.getBoundingClientRect(), pt = i => ({x:r.left + G.x + ((i & 7) + 0.5) * G.q, y:r.top + G.y + ((i >> 3) + 0.5) * G.q});
        return {sel, path:path.slice(), moves:seqs.map(m => ({from:pt(m.from), steps:m.steps.map(pt), caps:m.caps.length, fromCell:m.from, cells:m.steps.slice()}))}; };
      // --- a move animates hop by hop ---
      function commit(m){
        const v = B[m.from]; moving = {m, v, i:0, t:0, at:m.from}; sel = -1; path = [];
      }
      function finishMove(){
        const m = moving.m; moving = null; const king = apply(B, m); last = m;
        if (king) crowned.push({cell:m.steps[m.steps.length - 1], t:0});
        quiet = m.caps.length ? 0 : quiet + 1;
        turn = 1 - turn; refresh();
        if (!seqs.length || count(turn) === 0){ gameOver(1 - turn); return; }
        if (quiet >= 80){ gameOver(-1); return; }
        if (opt.players === 1 && turn === 1) k.after(500, () => { if (state === 'play' && turn === 1 && !moving) commit(aiMove()); });
      }
      function gameOver(w){
        state = 'over'; winner = w;
        k.after(1200, () => {
          state = 'end'; const [a, b] = names(), left = count(0);
          const head = w < 0 ? "It's a draw!" : opt.players === 1 ? (w === 0 ? 'You win!' : 'The computer wins this time') : names()[w] + ' wins!';
          if (w === 0 || (opt.players === 2 && w >= 0)) api.confetti(60);
          if (opt.players === 1){ const sc = (w === 0 ? 10 : 0) + left, res = api.saveScore(sc);
            k.endScreen({emoji:w === 0 ? '🏆' : w < 0 ? '🤝' : '🤖', title:head, score:sc, res, extra:[(w === 0 ? '10 for the win + ' : '') + left + ' piece' + (left === 1 ? '' : 's') + ' left'], again:begin, menu:startScreen}); }
          else k.endScreen({emoji:'🏆', title:head, headline:a + ' ' + count(0) + ' pieces · ' + b + ' ' + count(1) + ' pieces', again:begin, menu:startScreen});
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
      // --- drawing ---
      function piece(x, y, v, alpha, lift){
        const s = side(v), r = G.q * 0.38; cx.globalAlpha = alpha == null ? 1 : alpha;
        if (lift){ cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(x, y + r * 0.35, r, r * 0.9, 0, 0, 7); cx.fill(); y -= lift; }
        cx.fillStyle = PC[s].rim; cx.beginPath(); cx.arc(x, y + r * 0.12, r, 0, 7); cx.fill();
        cx.fillStyle = PC[s].top; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,.25)'; cx.lineWidth = r * 0.1; cx.beginPath(); cx.arc(x, y, r * 0.7, 0, 7); cx.stroke();
        if (isKing(v)){ // a drawn crown reads the same from either side of the table
          const w = r * 0.9, h = r * 0.55; cx.fillStyle = '#ffd23f'; cx.strokeStyle = '#a77c00'; cx.lineWidth = 2;
          cx.beginPath(); cx.moveTo(x - w / 2, y + h / 2); cx.lineTo(x - w / 2, y - h / 2); cx.lineTo(x - w / 4, y); cx.lineTo(x, y - h / 2 - 2); cx.lineTo(x + w / 4, y); cx.lineTo(x + w / 2, y - h / 2); cx.lineTo(x + w / 2, y + h / 2); cx.closePath(); cx.fill(); cx.stroke();
        }
        cx.globalAlpha = 1;
      }
      function update(dt){
        if (moving){
          moving.t += dt / 0.22;
          if (moving.t >= 1){ const m = moving.m, to = m.steps[moving.i]; if (m.caps[moving.i] != null){ const cp = m.caps[moving.i]; B[cp] = 0; } moving.at = to; moving.i++; moving.t = 0;
            if (moving.i >= m.steps.length){ finishMove(); } }
        }
        crowned.forEach(c => { c.t += dt; }); crowned = crowned.filter(c => c.t < 1.2);
        if (nudge > 0) nudge -= dt;
      }
      function draw(){
        cx.fillStyle = C.bg; cx.fillRect(0, 0, k.W, k.H);
        if (state === 'menu') return;
        const [a, b] = names();
        if (state === 'play'){ const jump = seqs.length && seqs[0].caps.length && human(); k.chip((opt.players === 1 ? (turn === 0 ? 'Your turn' : 'Computer…') : names()[turn] + "'s turn") + (jump ? ': jump!' : ''), k.W / 2, 8, 'center', 18, '#fff', turn === 0 ? PC[0].top : PC[1].top); }
        k.chip('🔴 ' + a + ': ' + count(0), 12, 8, 'left', 16); k.chip('⚫ ' + b + ': ' + count(1), k.W - 12, 8, 'right', 16);
        cx.fillStyle = '#6b3d1f'; k.rr(G.x - 8, G.y - 8, G.s + 16, G.s + 16, 12); cx.fill();
        const tg = human() ? nextTargets() : [], movable = human() && sel < 0 ? new Set(seqs.map(m => m.from)) : null, mustJump = seqs.length && seqs[0].caps.length;
        for (let i = 0; i < 64; i++){
          const x = G.x + (i & 7) * G.q, y = G.y + (i >> 3) * G.q, dark = ((i >> 3) + (i & 7)) % 2 === 1;
          cx.fillStyle = dark ? '#3f7a4a' : '#efe0c0'; cx.fillRect(x, y, G.q, G.q);
          if (last && (i === last.from || i === last.steps[last.steps.length - 1])){ cx.fillStyle = 'rgba(255,230,120,.25)'; cx.fillRect(x, y, G.q, G.q); }
          if (i === sel){ cx.fillStyle = 'rgba(255,210,63,.55)'; cx.fillRect(x, y, G.q, G.q); }
          path.forEach(p => { if (p === i){ cx.fillStyle = 'rgba(255,210,63,.35)'; cx.fillRect(x, y, G.q, G.q); } });
        }
        for (let i = 0; i < 64; i++){
          const v = B[i]; if (!v) continue; if (moving && i === moving.m.from) continue;
          if (sel === i && path.length) continue;
          const p = cellXY(i); piece(p.x, p.y, v, 1, 0);
          if (movable && movable.has(i) && (mustJump || nudge > 0)){ cx.strokeStyle = mustJump ? '#ffd23f' : '#fff'; cx.lineWidth = 4; cx.setLineDash([6, 5]); cx.beginPath(); cx.arc(p.x, p.y, G.q * 0.45, 0, 7); cx.stroke(); cx.setLineDash([]); }
        }
        if (sel >= 0 && path.length){ const p = cellXY(path[path.length - 1]); piece(p.x, p.y, B[sel], 1, 4); }
        tg.forEach(i => { const p = cellXY(i); cx.fillStyle = 'rgba(255,210,63,.85)'; cx.beginPath(); cx.arc(p.x, p.y, G.q * 0.16, 0, 7); cx.fill(); cx.strokeStyle = '#ffd23f'; cx.lineWidth = 3; cx.beginPath(); cx.arc(p.x, p.y, G.q * 0.4, 0, 7); cx.stroke(); });
        if (moving){ const m = moving.m, from = cellXY(moving.at), to = cellXY(m.steps[moving.i] != null ? m.steps[moving.i] : moving.at), t = moving.t, hop = Math.sin(Math.PI * t) * G.q * (m.caps.length ? 0.35 : 0.12);
          piece(lerp(from.x, to.x, t), lerp(from.y, to.y, t), moving.v, 1, hop + 2); }
        crowned.forEach(c => { const p = cellXY(c.cell); cx.globalAlpha = clamp(1.2 - c.t, 0, 1); k.chip('King! 👑', p.x, p.y - G.q * 0.9 - c.t * 20, 'center', 18); cx.globalAlpha = 1; });
        if (nudge > 0 && human() && !mustJump){ cx.globalAlpha = clamp(nudge, 0, 1); k.chip('That piece can’t move', k.W / 2, k.H / 2 - 16, 'center', 18); cx.globalAlpha = 1; }
      }
      k.frame(dt => { if (state === 'play' || state === 'over') update(dt); draw(); });
      startScreen();
      return () => { delete el._test; k.cleanup(); };
    }
  };
})();
