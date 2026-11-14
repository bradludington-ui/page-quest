// Break Zone game: four. Self-contained: canvas + DOM overlay, no images or libraries.
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
      const card = mk('div', `background:${C.panel};color:${C.ink};border:2px solid ${C.line};border-radius:26px;padding:20px 22px;max-width:480px;width:100%;box-sizing:border-box;box-shadow:0 14px 44px rgba(0,0,0,.3);display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;font-family:${TF};max-height:100%;overflow:auto`);
      if (o.emoji) card.appendChild(mk('div', 'font-size:56px;line-height:1.1', o.emoji));
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
        const paint = () => btns.forEach(([b, v]) => { b.style.cssText = btnCss(false, v === g.value) + 'min-width:84px;font-size:20px'; b.setAttribute('aria-pressed', v === g.value ? 'true' : 'false'); });
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
  // Four in a Row: 7 columns x 6 rows, discs drop with a bounce. Best of 3 vs the computer, or 2 players.
  window.BreakGames.four = {
    start(el, api){
      const k = kit(el, api), cx = k.cx, C = k.C;
      const COLS = 7, ROWS = 6, DISC = ['#e8424c', '#f5c518'];
      const opt = Object.assign({players:1, level:'easy'}, api.store.get('opts') || {});
      let state = 'menu', g = [], turn = 0, starter = 0, wins = [0, 0], games = 0, draws = 0, falling = null, winCells = null, hoverCol = -1, flash = 0;
      const names = () => opt.players === 1 ? ['You', 'Computer'] : [api.name || 'Player 1', 'Player 2'];
      function startScreen(){
        state = 'menu';
        const groups = [{label:'Players', value:opt.players, options:[{label:'1 player (vs computer)', value:1}, {label:'2 players (same iPad)', value:2}], onChange:v => { opt.players = v; startScreen(); }}];
        if (opt.players === 1) groups.push({label:'Computer', value:opt.level, options:[{label:'Easy', value:'easy'}, {label:'Medium', value:'medium'}, {label:'Hard', value:'hard'}], onChange:v => { opt.level = v; }});
        k.menu({emoji:'🔴🟡', title:'Four in a Row', lines:['Drop discs. Connect four in a line to win!', 'First to win 2 games takes the match.', opt.players === 1 && api.best != null ? 'Best: ' + api.best + ' wins' : ''], groups, buttons:[{label:'Play', primary:true, onClick:beginMatch}]});
      }
      function beginMatch(){ api.store.set('opts', opt); wins = [0, 0]; games = 0; draws = 0; starter = 0; k.hideMenu(); newGame(); }
      function newGame(){ g = []; for (let c = 0; c < COLS; c++) g.push([]); turn = starter; winCells = null; falling = null; state = 'play'; flash = 0; maybeAI(); }
      const at = (b, c, r) => (c >= 0 && c < COLS && r >= 0 && r < ROWS && b[c][r] != null) ? b[c][r] : -1;
      function fourAt(b, c, r){ const who = b[c][r]; for (const [dc, dr] of [[1,0],[0,1],[1,1],[1,-1]]){ const cells = [[c, r]]; for (let s = 1; at(b, c + dc * s, r + dr * s) === who; s++) cells.push([c + dc * s, r + dr * s]); for (let s = 1; at(b, c - dc * s, r - dr * s) === who; s++) cells.push([c - dc * s, r - dr * s]); if (cells.length >= 4) return cells; } return null; }
      const full = b => b.every(col => col.length >= ROWS);
      function drop(c){
        if (state !== 'play' || falling || g[c].length >= ROWS) return;
        const r = g[c].length; falling = {c, r, who:turn, y:-0.8, v:0, bounce:0};
      }
      function landed(){
        const f = falling; g[f.c].push(f.who); falling = null;
        const w = fourAt(g, f.c, f.r);
        if (w){ winCells = w; endGame(f.who); return; }
        if (full(g)){ endGame(-1); return; }
        turn = 1 - turn; maybeAI();
      }
      function endGame(who){
        state = 'over'; games++; if (who >= 0) wins[who]++; else draws++;
        const done = wins[0] >= 2 || wins[1] >= 2 || games >= 3;
        k.after(1400, () => {
          const [a, b] = names();
          if (done){ matchOver(); return; }
          starter = 1 - starter;
          const head = who < 0 ? 'Board full: a tie!' : who === 0 ? (opt.players === 1 ? 'You win this game!' : a + ' wins this game!') : (opt.players === 1 ? 'The computer wins this game.' : b + ' wins this game!');
          k.menu({emoji:who < 0 ? '🤝' : '🎉', title:head, lines:[{text:a + ' ' + wins[0] + ' – ' + wins[1] + ' ' + b, big:true}, 'Game ' + (games + 1) + ' of 3 is next'], buttons:[{label:'Next game', primary:true, onClick:() => { k.hideMenu(); newGame(); }}]});
        });
      }
      function matchOver(){
        state = 'end'; const [a, b] = names();
        const head = wins[0] > wins[1] ? (opt.players === 1 ? 'You won the match!' : a + ' wins the match!') : wins[1] > wins[0] ? (opt.players === 1 ? 'The computer won this time' : b + ' wins the match!') : 'The match is a tie!';
        if (wins[0] > wins[1]) api.confetti(50);
        const line = a + ' ' + wins[0] + ' – ' + wins[1] + ' ' + b;
        if (opt.players === 1){ const res = api.saveScore(wins[0]); k.endScreen({emoji:wins[0] > wins[1] ? '🏆' : '🤖', title:head, score:wins[0], scoreLabel:'Your wins', res, extra:[line], again:beginMatch, menu:startScreen}); }
        else k.endScreen({emoji:'🏆', title:head, headline:line, again:beginMatch, menu:startScreen});
      }
      // --- computer: easy / medium (rules) / hard (small alpha-beta search) ---
      function maybeAI(){ if (opt.players === 1 && turn === 1 && state === 'play') k.after(600, () => { if (state === 'play' && turn === 1 && !falling) drop(aiMove()); }); }
      const legal = b => { const m = []; for (const c of [3, 2, 4, 1, 5, 0, 6]) if (b[c].length < ROWS) m.push(c); return m; };
      function winsWith(b, c, who){ if (b[c].length >= ROWS) return false; b[c].push(who); const w = !!fourAt(b, c, b[c].length - 1); b[c].pop(); return w; }
      function scoreBoard(b){
        let s = 0; const cell = (c, r) => at(b, c, r);
        for (let r = 0; r < ROWS; r++) if (b[3][r] === 1) s += 3; else if (b[3][r] === 0) s -= 3;
        for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) for (const [dc, dr] of [[1,0],[0,1],[1,1],[1,-1]]){
          const ec = c + dc * 3, er = r + dr * 3; if (ec < 0 || ec >= COLS || er < 0 || er >= ROWS) continue;
          let a = 0, h = 0; for (let i = 0; i < 4; i++){ const v = cell(c + dc * i, r + dr * i); if (v === 1) a++; else if (v === 0) h++; }
          if (a && h) continue; if (a === 3) s += 12; else if (a === 2) s += 3; if (h === 3) s -= 14; else if (h === 2) s -= 3;
        }
        return s;
      }
      function ab(b, depth, alpha, beta, who){
        const ms = legal(b); if (!ms.length) return 0;
        if (depth === 0) return scoreBoard(b);
        let best = who === 1 ? -1e9 : 1e9;
        for (const c of ms){
          b[c].push(who); const won = !!fourAt(b, c, b[c].length - 1);
          const v = won ? (who === 1 ? 100000 + depth : -100000 - depth) : ab(b, depth - 1, alpha, beta, 1 - who); b[c].pop();
          if (who === 1){ if (v > best) best = v; if (best > alpha) alpha = best; } else { if (v < best) best = v; if (best < beta) beta = best; }
          if (alpha >= beta) break;
        }
        return best;
      }
      function aiMove(){
        const b = g.map(col => col.slice()), ms = legal(b), L = opt.level, rand = a => a[Math.floor(Math.random() * a.length)];
        const win = ms.find(c => winsWith(b, c, 1)), block = ms.find(c => winsWith(b, c, 0));
        if (L === 'easy'){ if (win != null && Math.random() < 0.7) return win; if (block != null && Math.random() < 0.45) return block; return Math.random() < 0.4 ? ms[0] : rand(ms); }
        if (win != null) return win; if (block != null) return block;
        if (L === 'medium'){
          const safe = ms.filter(c => { b[c].push(1); const bad = legal(b).some(c2 => winsWith(b, c2, 0)); b[c].pop(); return !bad; });
          const pool = safe.length ? safe : ms; return Math.random() < 0.55 ? pool[0] : rand(pool);
        }
        let best = -1e9, bc = ms[0];
        for (const c of ms){ b[c].push(1); const v = ab(b, 4, -1e9, 1e9, 0) + (Math.random() - 0.5); b[c].pop(); if (v > best){ best = v; bc = c; } }
        return bc;
      }
      // --- layout & input ---
      let G = {};
      const layout = () => { const top = 58, cs = Math.min((k.W - 24) / COLS, (k.H - top - 16) / (ROWS + 1)); G = {cs, x:(k.W - cs * COLS) / 2, y:top + cs + (k.H - top - 16 - cs * (ROWS + 1)) / 2}; };
      k.onResize = layout; layout();
      const colAt = p => { const c = Math.floor((p.x - G.x) / G.cs); return c >= 0 && c < COLS && p.y > G.y - G.cs * 1.2 ? c : -1; };
      const human = () => state === 'play' && !falling && (opt.players === 2 || turn === 0);
      let down = false;
      k.on(k.cv, 'pointerdown', e => { if (!human()) return; down = true; hoverCol = colAt(k.pt(e)); });
      k.on(k.cv, 'pointermove', e => { if (human()) hoverCol = colAt(k.pt(e)); });
      k.on(k.cv, 'pointerup', e => { if (!down) return; down = false; if (!human()) return; const c = colAt(k.pt(e)); if (c >= 0) drop(c); });
      k.on(k.cv, 'pointercancel', () => { down = false; });
      el._test = () => { const r = k.cv.getBoundingClientRect(); return human() ? legal(g).map(c => ({col:c, x:r.left + G.x + (c + 0.5) * G.cs, y:r.top + G.y + G.cs * 2})) : []; };
      const cellXY = (c, r) => ({x:G.x + (c + 0.5) * G.cs, y:G.y + (ROWS - 1 - r + 0.5) * G.cs});
      function disc(x, y, who, glow){
        const rad = G.cs * 0.4;
        cx.fillStyle = who === 0 ? '#a8222b' : '#b88a00'; cx.beginPath(); cx.arc(x, y + 2, rad, 0, 7); cx.fill();
        cx.fillStyle = DISC[who]; cx.beginPath(); cx.arc(x, y, rad, 0, 7); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = rad * 0.12; cx.beginPath(); cx.arc(x, y, rad * 0.7, 0, 7); cx.stroke();
        if (who === 0 && opt.players === 1 && api.avatar){ cx.font = `${Math.round(rad * 0.8)}px system-ui, "Apple Color Emoji", sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#000'; cx.fillText(api.avatar, x, y + rad * 0.05); }
        if (glow){ cx.strokeStyle = '#fff'; cx.lineWidth = 5; cx.beginPath(); cx.arc(x, y, rad + 3, 0, 7); cx.stroke(); }
      }
      function update(dt){
        if (falling){ const f = falling; f.v += dt * 40; f.y += f.v * dt; const target = ROWS - 1 - f.r;
          if (f.y >= target){ if (f.bounce < 1 && f.v > 6){ f.y = target; f.v = -f.v * 0.28; f.bounce++; } else { f.y = target; landed(); } } }
        flash += dt;
      }
      function draw(){
        cx.fillStyle = C.bg; cx.fillRect(0, 0, k.W, k.H);
        if (state === 'menu') return;
        const [a, b] = names();
        k.chip(a + ' ' + wins[0] + '  –  ' + wins[1] + ' ' + b, k.W / 2, 8, 'center', 20);
        if (state === 'play'){ const txt = opt.players === 1 ? (turn === 0 ? 'Your turn' : 'Computer…') : names()[turn] + "'s turn"; k.chip(txt, 12, 8, 'left', 16, turn === 0 ? '#fff' : '#3a2c00', DISC[turn]); }
        k.chip('Game ' + Math.min(games + (state === 'play' ? 1 : 0), 3) + ' of 3', k.W - 12, 8, 'right', 16);
        // hovering disc over a column
        if (human() && hoverCol >= 0 && g[hoverCol].length < ROWS){ const p = cellXY(hoverCol, ROWS); cx.globalAlpha = 0.85; disc(p.x, p.y + G.cs * 0.1, turn); cx.globalAlpha = 1; }
        if (falling){ const p = {x:G.x + (falling.c + 0.5) * G.cs, y:G.y + (falling.y + 0.5) * G.cs}; disc(p.x, p.y, falling.who); }
        for (let c = 0; c < COLS; c++) for (let r = 0; r < g[c].length; r++){ const p = cellXY(c, r), glow = winCells && winCells.some(([wc, wr]) => wc === c && wr === r) && (api.reducedMotion || Math.sin(flash * 8) > -0.3); disc(p.x, p.y, g[c][r], glow); }
        // the blue frame with holes cut out (drawn on top so discs look inside)
        cx.save(); cx.beginPath(); k.rr(G.x - 8, G.y - 8, G.cs * COLS + 16, G.cs * ROWS + 16, 18);
        for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++){ const p = cellXY(c, r); cx.moveTo(p.x + G.cs * 0.4, p.y); cx.arc(p.x, p.y, G.cs * 0.4, 0, Math.PI * 2, true); }
        cx.fillStyle = '#2156c9'; cx.fill('evenodd'); cx.restore();
        cx.strokeStyle = '#163e96'; cx.lineWidth = 3; k.rr(G.x - 8, G.y - 8, G.cs * COLS + 16, G.cs * ROWS + 16, 18); cx.stroke();
        if (winCells && state !== 'play'){ const p0 = cellXY(winCells[0][0], winCells[0][1]); let p1 = p0; winCells.forEach(([c, r]) => { const p = cellXY(c, r); if (Math.hypot(p.x - p0.x, p.y - p0.y) > Math.hypot(p1.x - p0.x, p1.y - p0.y)) p1 = p; });
          cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.lineCap = 'round'; cx.lineWidth = G.cs * 0.12; cx.beginPath(); cx.moveTo(p0.x, p0.y); cx.lineTo(p1.x, p1.y); cx.stroke(); }
      }
      k.frame(dt => { update(dt); draw(); });
      startScreen();
      return () => { delete el._test; k.cleanup(); };
    }
  };
})();
