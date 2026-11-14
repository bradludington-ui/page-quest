// Break Zone game: ttt. Self-contained: canvas + DOM overlay, no images or libraries.
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
  // Tic-Tac-Toe: best of 5 against the computer (easy / medium / hard) or a friend on the same iPad.
  window.BreakGames.ttt = {
    start(el, api){
      const k = kit(el, api), cx = k.cx, C = k.C;
      const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      const opt = Object.assign({players:1, level:'easy', mark:'X'}, api.store.get('opts') || {});
      let state = 'menu', board, marks = [], turn = 0, starter = 0, wins = [0, 0], draws = 0, games = 0, winLine = null, anim = [], aiTimer = 0, msgT = 0, hoverCell = -1, test = null;
      // marks[0] = player one (the child), marks[1] = the computer or friend
      function setMarks(){ const m = opt.mark; marks = [m === 'A' ? 'A' : m, m === 'X' ? 'O' : m === 'O' ? 'X' : (opt.players === 1 ? 'R' : 'O')]; }
      const names = () => opt.players === 1 ? ['You', 'Computer'] : [api.name || 'Player 1', 'Player 2'];
      function startScreen(){
        state = 'menu';
        const groups = [
          {label:'Players', value:opt.players, options:[{label:'1 player (vs computer)', value:1}, {label:'2 players (same iPad)', value:2}], onChange:v => { opt.players = v; startScreen(); }},
          {label:'Your mark', value:opt.mark, options:[{label:'✖ X', value:'X'}, {label:'◯ O', value:'O'}, {label:(api.avatar || '🙂') + ' Me', value:'A'}], onChange:v => { opt.mark = v; }}];
        if (opt.players === 1) groups.push({label:'Computer', value:opt.level, options:[{label:'Easy', value:'easy'}, {label:'Medium', value:'medium'}, {label:'Hard', value:'hard'}], onChange:v => { opt.level = v; }});
        k.menu({emoji:'❌⭕', title:'Tic-Tac-Toe', lines:['Get three in a row. First to win 3 games takes the series!', opt.players === 1 && api.best != null ? 'Best: ' + api.best + ' wins' : ''], groups, buttons:[{label:'Play', primary:true, onClick:beginSeries}]});
      }
      function beginSeries(){ api.store.set('opts', opt); setMarks(); wins = [0, 0]; draws = 0; games = 0; starter = 0; k.hideMenu(); newGame(); }
      function newGame(){ board = Array(9).fill(-1); winLine = null; anim = []; turn = starter; state = 'play'; msgT = 0; maybeAI(); }
      const winner = b => { for (const l of LINES) if (b[l[0]] >= 0 && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return {who:b[l[0]], line:l}; return b.every(v => v >= 0) ? {who:-1} : null; };
      function place(i){
        if (state !== 'play' || board[i] >= 0) return;
        board[i] = turn; anim[i] = 0;
        const w = winner(board);
        if (w){ endGame(w); return; }
        turn = 1 - turn; maybeAI();
      }
      function endGame(w){
        state = 'over'; winLine = w.line || null; games++;
        if (w.who >= 0) wins[w.who]++; else draws++;
        const done = wins[0] >= 3 || wins[1] >= 3 || games >= 5;
        k.after(1100, () => {
          if (done){ seriesOver(); return; }
          const [a, b] = names(), head = w.who < 0 ? "It's a tie!" : w.who === 0 ? (opt.players === 1 ? 'You win this game!' : a + ' wins this game!') : (opt.players === 1 ? 'The computer wins this game.' : b + ' wins this game!');
          starter = 1 - starter;
          k.menu({emoji:w.who < 0 ? '🤝' : w.who === 0 ? '🎉' : (opt.players === 1 ? '🤖' : '🎉'), title:head, lines:[{text:a + ' ' + wins[0] + ' – ' + wins[1] + ' ' + b, big:true}, 'Game ' + (games + 1) + ' of 5 is next'], buttons:[{label:'Next game', primary:true, onClick:() => { k.hideMenu(); newGame(); }}]});
        });
      }
      function seriesOver(){
        state = 'end'; const [a, b] = names();
        const head = wins[0] > wins[1] ? (opt.players === 1 ? 'You won the series!' : a + ' wins the series!') : wins[1] > wins[0] ? (opt.players === 1 ? 'The computer won this time' : b + ' wins the series!') : 'The series is a tie!';
        if (wins[0] > wins[1]) api.confetti(50);
        if (opt.players === 1){ const res = api.saveScore(wins[0]); k.endScreen({emoji:wins[0] > wins[1] ? '🏆' : '🤖', title:head, score:wins[0], scoreLabel:'Your wins', res, extra:[a + ' ' + wins[0] + ' – ' + wins[1] + ' ' + b + (draws ? ' (' + draws + ' tie' + (draws > 1 ? 's' : '') + ')' : '')], again:beginSeries, menu:startScreen}); }
        else k.endScreen({emoji:'🏆', title:head, headline:a + ' ' + wins[0] + ' – ' + wins[1] + ' ' + b, again:beginSeries, menu:startScreen});
      }
      // --- computer ---
      function maybeAI(){ if (opt.players === 1 && turn === 1 && state === 'play'){ aiTimer = k.after(550, () => { if (state === 'play' && turn === 1) place(aiMove()); }); } }
      const empty = b => b.map((v, i) => v < 0 ? i : -1).filter(i => i >= 0);
      function finds(b, who){ for (const i of empty(b)){ b[i] = who; const w = winner(b); b[i] = -1; if (w && w.who === who) return i; } return -1; }
      function minimax(b, who){ const w = winner(b); if (w) return w.who === 1 ? 10 : w.who === 0 ? -10 : 0; let best = who === 1 ? -99 : 99; for (const i of empty(b)){ b[i] = who; const s = minimax(b, 1 - who) * 0.9; b[i] = -1; best = who === 1 ? Math.max(best, s) : Math.min(best, s); } return best; }
      function aiMove(){
        const e = empty(board), r = () => e[Math.floor(Math.random() * e.length)], L = opt.level;
        if (L === 'hard'){ let best = -99, bi = []; for (const i of e){ board[i] = 1; const s = minimax(board, 0); board[i] = -1; if (s > best + 1e-9){ best = s; bi = [i]; } else if (Math.abs(s - best) < 1e-9) bi.push(i); } return bi[Math.floor(Math.random() * bi.length)]; }
        const win = finds(board, 1), block = finds(board, 0);
        if (L === 'medium'){ if (win >= 0) return win; if (block >= 0) return block; if (board[4] < 0 && Math.random() < 0.7) return 4; const corners = [0, 2, 6, 8].filter(i => board[i] < 0); if (corners.length && Math.random() < 0.6) return corners[Math.floor(Math.random() * corners.length)]; return r(); }
        if (win >= 0 && Math.random() < 0.6) return win; if (block >= 0 && Math.random() < 0.35) return block; return r();
      }
      // --- layout & input ---
      let G = {};
      const layout = () => { const top = 64, s = Math.min(k.W - 32, k.H - top - 20); G = {s, x:(k.W - s) / 2, y:top + (k.H - top - 20 - s) / 2, c:s / 3}; };
      k.onResize = layout; layout();
      const cellAt = p => { const c = Math.floor((p.x - G.x) / G.c), r = Math.floor((p.y - G.y) / G.c); return c >= 0 && c < 3 && r >= 0 && r < 3 ? r * 3 + c : -1; };
      const humanTurn = () => state === 'play' && (opt.players === 2 || turn === 0);
      k.on(k.cv, 'pointerdown', e => { if (!humanTurn()) return; hoverCell = cellAt(k.pt(e)); });
      k.on(k.cv, 'pointerup', e => { if (!humanTurn()) { hoverCell = -1; return; } const i = cellAt(k.pt(e)); hoverCell = -1; if (i >= 0) place(i); });
      k.on(k.cv, 'pointercancel', () => { hoverCell = -1; });
      // for automated tests: screen points of the cells a person may tap now
      el._test = () => { const r = k.cv.getBoundingClientRect(); return humanTurn() ? empty(board).map(i => ({x:r.left + G.x + (i % 3 + 0.5) * G.c, y:r.top + G.y + (Math.floor(i / 3) + 0.5) * G.c})) : []; };
      const COL = ['#e8424c', '#2f7fe8'];
      function drawMark(m, who, x, y, s, t){
        const a = clamp(t, 0, 1); cx.lineCap = 'round'; cx.lineWidth = s * 0.12; cx.strokeStyle = COL[who];
        if (m === 'X'){ const d = s * 0.3; cx.beginPath(); cx.moveTo(x - d, y - d); cx.lineTo(x - d + 2 * d * Math.min(1, a * 2), y - d + 2 * d * Math.min(1, a * 2)); cx.stroke(); if (a > 0.5){ const b2 = (a - 0.5) * 2; cx.beginPath(); cx.moveTo(x + d, y - d); cx.lineTo(x + d - 2 * d * b2, y - d + 2 * d * b2); cx.stroke(); } }
        else if (m === 'O'){ cx.beginPath(); cx.arc(x, y, s * 0.3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a); cx.stroke(); }
        else { const em = m === 'A' ? (api.avatar || '🙂') : '🤖', sc = a < 1 ? 0.5 + a * 0.6 : 1; cx.font = `${Math.round(s * 0.62 * Math.min(sc, 1.1))}px system-ui, "Apple Color Emoji", sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#000'; cx.fillText(em, x, y + s * 0.04); cx.strokeStyle = COL[who]; cx.lineWidth = 4; cx.beginPath(); cx.arc(x, y, s * 0.42, 0, 7); cx.stroke(); }
      }
      function draw(dt){
        cx.fillStyle = C.bg; cx.fillRect(0, 0, k.W, k.H);
        if (state === 'menu') return;
        const [a, b] = names();
        // top bar: score and whose turn
        k.chip(a + ' ' + wins[0] + '  –  ' + wins[1] + ' ' + b, k.W / 2, 10, 'center', 20);
        if (state === 'play'){ const who = turn, txt = opt.players === 1 ? (who === 0 ? 'Your turn' : 'Computer is thinking…') : names()[who] + "'s turn"; k.chip(txt, 12, 10, 'left', 16, '#fff', COL[who]); }
        k.chip('Game ' + Math.min(games + (state === 'play' ? 1 : 0), 5) + ' of 5', k.W - 12, 10, 'right', 16);
        cx.fillStyle = C.panel; k.rr(G.x - 8, G.y - 8, G.s + 16, G.s + 16, 22); cx.fill(); cx.strokeStyle = C.line; cx.lineWidth = 2; cx.stroke();
        if (hoverCell >= 0 && board[hoverCell] < 0){ cx.fillStyle = C.soft; cx.fillRect(G.x + (hoverCell % 3) * G.c + 4, G.y + Math.floor(hoverCell / 3) * G.c + 4, G.c - 8, G.c - 8); }
        cx.strokeStyle = C.mut; cx.lineWidth = Math.max(4, G.s * 0.018); cx.lineCap = 'round';
        for (let i = 1; i < 3; i++){ cx.beginPath(); cx.moveTo(G.x + i * G.c, G.y + 10); cx.lineTo(G.x + i * G.c, G.y + G.s - 10); cx.stroke(); cx.beginPath(); cx.moveTo(G.x + 10, G.y + i * G.c); cx.lineTo(G.x + G.s - 10, G.y + i * G.c); cx.stroke(); }
        for (let i = 0; i < 9; i++) if (board[i] >= 0){ anim[i] = Math.min(1, (anim[i] || 0) + dt * 4); drawMark(marks[board[i]], board[i], G.x + (i % 3 + 0.5) * G.c, G.y + (Math.floor(i / 3) + 0.5) * G.c, G.c, anim[i]); }
        if (winLine){ msgT = Math.min(1, msgT + dt * 2.5); const p = j => ({x:G.x + (winLine[j] % 3 + 0.5) * G.c, y:G.y + (Math.floor(winLine[j] / 3) + 0.5) * G.c}); const p0 = p(0), p2 = p(2);
          cx.strokeStyle = 'rgba(255,200,40,.9)'; cx.lineWidth = G.c * 0.14; cx.beginPath(); cx.moveTo(p0.x, p0.y); cx.lineTo(lerp(p0.x, p2.x, msgT), lerp(p0.y, p2.y, msgT)); cx.stroke(); }
      }
      k.frame(draw);
      startScreen();
      return () => { delete el._test; k.cleanup(); };
    }
  };
})();
