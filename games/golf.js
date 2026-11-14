// Break Zone: Mini Golf. 1 or 2 players taking turns, 9 holes seen from above.
// Pull back from the ball and let go to putt. Lowest total strokes wins.
(function(){
  window.BreakGames = window.BreakGames || {};

  // Courses live in an 800 x 500 world. Walls are the outline polygon, solid blocks and banks.
  const HOLES = [
    {name:'Easy Start', par:2, tee:[150,250], cup:[650,250],
      poly:[[90,160],[710,160],[710,340],[90,340]]},
    {name:'The Bend', par:3, tee:[130,380], cup:[640,130],
      poly:[[70,320],[540,320],[540,60],[730,60],[730,450],[70,450]],
      segs:[[650,450,730,370]], bumpers:[{x:470,y:385,r:16}]},
    {name:'The Windmill', par:3, tee:[120,250], cup:[690,250],
      poly:[[60,120],[750,120],[750,380],[60,380]],
      blocks:[[370,120,430,195],[370,305,430,380]], mills:[{x:400,y:250,len:92,speed:1.6,n:4}]},
    {name:'Sandy Beach', par:3, tee:[110,250], cup:[690,250],
      poly:[[60,70],[750,70],[750,430],[60,430]],
      sand:[{x:300,y:150,w:230,h:200}], blocks:[[600,180,625,320]], bumpers:[{x:220,y:130,r:16},{x:220,y:370,r:16}]},
    {name:'Bumper Alley', par:3, tee:[110,250], cup:[700,250],
      poly:[[60,90],[750,90],[750,410],[60,410]],
      bumpers:[{x:260,y:180,r:20},{x:260,y:320,r:20},{x:380,y:250,r:22},{x:500,y:170,r:20},{x:500,y:330,r:20},{x:610,y:250,r:18}]},
    {name:'Lily Pond', par:3, tee:[110,350], cup:[690,150],
      poly:[[60,70],[750,70],[750,430],[60,430]],
      water:[{x:280,y:70,w:240,h:140},{x:280,y:290,w:240,h:140}], bumpers:[{x:620,y:330,r:16}]},
    {name:'Over the Hill', par:3, tee:[110,250], cup:[690,250],
      poly:[[60,110],[750,110],[750,390],[60,390]],
      hills:[{x:320,y:110,w:150,h:280,ax:-330,ay:0}], segs:[[640,190,640,215],[640,285,640,310]], sand:[{x:540,y:110,w:70,h:60},{x:540,y:330,w:70,h:60}]},
    {name:'The Tunnel', par:3, tee:[120,380], cup:[680,120],
      poly:[[60,60],[740,60],[740,440],[60,440]],
      blocks:[[385,60,415,440]], tunnels:[{ax:300,ay:130,bx:480,by:390,dx:1,dy:0}],
      water:[{x:60,y:60,w:110,h:90}], bumpers:[{x:600,y:250,r:18}]},
    {name:'Grand Finale', par:4, tee:[110,380], cup:[110,140],
      poly:[[40,40],[760,40],[760,460],[40,460]],
      blocks:[[40,236,560,264]], mills:[{x:660,y:250,len:88,speed:-1.4,n:3}],
      sand:[{x:300,y:300,w:120,h:160}], water:[{x:280,y:40,w:150,h:110}], bumpers:[{x:520,y:160,r:16},{x:220,y:200,r:14}]}
  ];

  window.BreakGames.golf = { start(el, api){
    const C = api.colors, RM = !!api.reducedMotion;
    const HEAD_FONT = '"Baloo 2", system-ui, sans-serif', TXT_FONT = '"Lexend", system-ui, sans-serif';
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
    const ov = document.createElement('div');
    ov.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
    el.appendChild(cv); el.appendChild(ov);
    const cx = cv.getContext('2d');
    let W = 0, H = 0, raf = 0, last = 0, rect = null;
    const size = () => { rect = el.getBoundingClientRect(); const d = window.devicePixelRatio || 1;
      W = Math.max(1, rect.width); H = Math.max(1, rect.height); cv.width = Math.round(W*d); cv.height = Math.round(H*d); cx.setTransform(d,0,0,d,0,0); };
    size(); window.addEventListener('resize', size);

    const BR = 8, CUPR = 13, MAXS = 950, MAXSTROKES = 8;
    let phase = 'menu', nP = 1, players = [], cur = 0, hi = 0, hole = null, segs = [], t = 0;
    const ball = {x:0, y:0, vx:0, vy:0, moving:false, sink:0, lx:0, ly:0};
    let strokes = 0, drag = null, popup = null, banner = null, doneT = 0, flash = [];
    const setPhase = p => { phase = p; el.dataset.phase = p; };
    el._golfDbg = () => ({phase, bx:ball.x, by:ball.y, cx:hole ? hole.cup[0] : 0, cy:hole ? hole.cup[1] : 0, hole:hi, cur, strokes, ...L});

    function loadHole(i){
      hi = i; hole = HOLES[i]; segs = [];
      const pg = hole.poly; for (let k = 0; k < pg.length; k++){ const a = pg[k], b = pg[(k + 1) % pg.length]; segs.push([a[0], a[1], b[0], b[1]]); }
      for (const b of hole.blocks || []){ const [x1, y1, x2, y2] = b; segs.push([x1,y1,x2,y1],[x2,y1,x2,y2],[x2,y2,x1,y2],[x1,y2,x1,y1]); }
      for (const s of hole.segs || []) segs.push(s);
      flash = (hole.bumpers || []).map(() => 0);
    }
    function startTurn(){
      ball.x = ball.lx = hole.tee[0]; ball.y = ball.ly = hole.tee[1]; ball.vx = ball.vy = 0; ball.moving = false; ball.sink = 0;
      strokes = 0; setPhase('aim');
      const pl = players[cur];
      if (cur === 0) banner = {a:'Hole ' + (hi + 1) + ': ' + hole.name, b:'Par ' + hole.par + (nP === 2 ? '  ·  ' + pl.av + ' ' + pl.name : ''), t:0};
      else banner = {a:pl.av + ' ' + pl.name + "'s turn", b:'Hole ' + (hi + 1) + ' · Par ' + hole.par, t:0};
    }
    function startGame(n){
      nP = n; players = [{name: api.name || 'You', av: api.avatar || '🙂', sc: []}];
      if (n === 2) players.push({name:'Player 2', av:'🐼', sc: []});
      cur = 0; loadHole(0); startTurn(); ov.innerHTML = ''; ov.style.pointerEvents = 'none';
    }
    function showPop(txt, col, dur){ popup = {txt, col: col || '#fff', t:0, dur: dur || 1.5}; }
    function holeDone(sunk){
      const s = Math.min(strokes, MAXSTROKES); players[cur].sc[hi] = s;
      if (sunk){ const d = s - hole.par;
        const txt = s === 1 ? 'Hole in one!' : d <= -2 ? 'Eagle!' : d === -1 ? 'Birdie!' : d === 0 ? 'Par' : d === 1 ? 'Bogey' : s + ' strokes';
        showPop(txt, s === 1 || d < 0 ? '#ffd65a' : '#ffffff', 1.7); if (!RM && (s === 1 || d < 0)) api.confetti(s === 1 ? 50 : 20); }
      else showPop('Max ' + MAXSTROKES + ' strokes', '#ffffff', 1.7);
      doneT = 0; setPhase('holed');
    }
    function nextAfterHole(){
      if (nP === 2 && cur === 0){ cur = 1; startTurn(); return; }
      cur = 0;
      if (hi + 1 >= HOLES.length){ endGame(); return; }
      loadHole(hi + 1); startTurn();
    }
    const sum = pl => pl.sc.reduce((a, b) => a + (b || 0), 0);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const btnCss = main => `min-height:56px;min-width:150px;padding:10px 22px;border-radius:16px;border:2px solid ${main ? C.accent : C.line};background:${main ? C.accent : C.panel};color:${main ? C.accentInk : C.ink};font:700 22px ${HEAD_FONT};cursor:pointer;touch-action:manipulation`;
    function showCard(html){
      ov.style.pointerEvents = 'auto';
      ov.innerHTML = `<div style="background:${C.panel};color:${C.ink};border:2px solid ${C.line};border-radius:22px;padding:20px 22px;text-align:center;max-width:560px;max-height:100%;overflow:auto;box-sizing:border-box;box-shadow:0 10px 40px rgba(0,0,0,.35);font-family:${TXT_FONT}">${html}</div>`;
    }
    function endGame(){
      setPhase('end');
      const t1 = sum(players[0]), r = api.saveScore(t1) || {}, par = HOLES.reduce((a, h) => a + h.par, 0);
      let head = 'All 9 holes done!';
      if (nP === 2){ const t2 = sum(players[1]); head = t1 === t2 ? "It's a tie!" : (t1 < t2 ? esc(players[0].name) + ' wins!' : 'Player 2 wins!'); }
      const td = 'padding:3px 5px;border-bottom:1px solid ' + C.line;
      const table = `<table style="border-collapse:collapse;margin:8px auto;font-size:14px"><tr><th style="${td};text-align:left">Hole</th>${HOLES.map((h, i) => `<th style="${td}">${i + 1}</th>`).join('')}<th style="${td}">Total</th></tr>
        <tr style="color:${C.mut}"><td style="${td};text-align:left">Par</td>${HOLES.map(h => `<td style="${td}">${h.par}</td>`).join('')}<td style="${td}">${par}</td></tr>
        ${players.map(p => `<tr><td style="${td};text-align:left;white-space:nowrap">${esc(p.av)} ${esc(p.name)}</td>${p.sc.map((s, i) => `<td style="${td};${s < HOLES[i].par ? 'color:' + C.good + ';font-weight:700' : ''}">${s}</td>`).join('')}<td style="${td};font-weight:800">${sum(p)}</td></tr>`).join('')}</table>`;
      showCard(`<div style="font-size:48px;line-height:1">⛳</div>
        <h2 style="margin:4px 0 2px;font:700 28px ${HEAD_FONT}">${head}</h2>
        <p style="margin:0;font-size:20px">${nP === 2 ? '' : 'Total strokes: '}<b>${nP === 2 ? players.map(p => esc(p.av) + ' ' + sum(p)).join(' · ') : t1}</b></p>
        ${table}
        <p style="margin:6px 0 2px;color:${C.mut}">Your best: <b style="color:${C.ink}">${r.best != null ? r.best : t1}</b> strokes (fewer is better)</p>
        ${r.isBest ? `<p style="margin:4px 0;font:700 24px ${HEAD_FONT};color:${C.sun}">🏆 New best!</p>` : ''}
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:10px">
          <button data-act="again" style="${btnCss(true)}">Play again</button>
          <button data-act="menu" style="${btnCss(false)}">Players</button></div>`);
    }
    function menu(){
      setPhase('menu'); players = []; nP = 1; loadHole(0); ball.x = hole.tee[0]; ball.y = hole.tee[1]; ball.sink = 0; banner = popup = null;
      showCard(`<div style="font-size:56px;line-height:1">⛳</div>
        <h2 style="margin:6px 0 4px;font:700 32px ${HEAD_FONT}">Mini Golf</h2>
        <p style="margin:0 0 14px;color:${C.mut}">Pull back from the ball and let go to putt.</p>
        ${api.best != null ? `<p style="margin:0 0 12px">🏆 Best: <b>${api.best}</b> strokes</p>` : ''}
        <div style="display:flex;flex-direction:column;gap:12px;align-items:stretch">
          <button data-act="p1" style="${btnCss(true)}">▶ 1 player</button>
          <button data-act="p2" style="${btnCss(false)}">👥 2 players (same iPad)</button></div>`);
    }
    const onOv = e => { const b = e.target.closest('button[data-act]'); if (!b) return; const a = b.dataset.act;
      if (a === 'p1') startGame(1); else if (a === 'p2') startGame(2); else if (a === 'again') startGame(nP); else if (a === 'menu') menu(); };
    ov.addEventListener('click', onOv);

    // ---- layout ----
    let L = {sc:1, ox:0, oy:0};
    function layout(){
      const top = 46, rows = 2 + Math.max(1, nP), bot = rows*19 + 14, avail = H - top - bot;
      const sc = Math.max(0.2, Math.min((W - 16)/800, avail/500));
      L = {sc, ox:(W - 800*sc)/2, oy: top + (avail - 500*sc)/2, top, bot};
    }

    // ---- physics ----
    const inRect = (r, x, y) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
    function step(dt){
      // windmills always turn
      for (const m of hole.mills || []) m.a = (m.a || 0) + m.speed*dt;
      if (ball.sink > 0) return;
      // a blade sweeping into a resting ball nudges it
      for (const m of hole.mills || []) for (let k = 0; k < m.n; k++){
        const a = m.a + k*Math.PI*2/m.n, ex = m.x + Math.cos(a)*m.len, ey = m.y + Math.sin(a)*m.len;
        const dx = ex - m.x, dy = ey - m.y, l2 = dx*dx + dy*dy;
        let u = ((ball.x - m.x)*dx + (ball.y - m.y)*dy)/l2; u = Math.max(0, Math.min(1, u));
        const px = m.x + dx*u, py = m.y + dy*u, ddx = ball.x - px, ddy = ball.y - py, d = Math.hypot(ddx, ddy), rr = BR + 5;
        if (d < rr && d > 1e-4){
          const nx = ddx/d, ny = ddy/d; ball.x += nx*(rr - d); ball.y += ny*(rr - d);
          const bvx = -m.speed*(py - m.y), bvy = m.speed*(px - m.x);
          let rvx = ball.vx - bvx, rvy = ball.vy - bvy; const vn = rvx*nx + rvy*ny;
          if (vn < 0){ rvx -= 1.6*vn*nx; rvy -= 1.6*vn*ny; ball.vx = rvx + bvx; ball.vy = rvy + bvy; }
          if (!ball.moving && phase === 'aim'){ ball.moving = true; drag = null; setPhase('roll'); }
        }
      }
      if (!ball.moving) return;
      let sand = false; for (const s of hole.sand || []) if (inRect(s, ball.x, ball.y)) sand = true;
      let hill = null; for (const h of hole.hills || []) if (inRect(h, ball.x, ball.y)) hill = h;
      if (hill){ ball.vx += hill.ax*dt; ball.vy += hill.ay*dt; }
      let sp = Math.hypot(ball.vx, ball.vy);
      const dec = (sand ? 620 : 150) + (sand ? 2.6 : 0.9)*sp;
      if (sp > 0){ const k = Math.max(0, sp - dec*dt)/sp; ball.vx *= k; ball.vy *= k; }
      ball.x += ball.vx*dt; ball.y += ball.vy*dt;
      // walls
      for (const s of segs){
        const dx = s[2] - s[0], dy = s[3] - s[1], l2 = dx*dx + dy*dy;
        let u = ((ball.x - s[0])*dx + (ball.y - s[1])*dy)/l2; u = Math.max(0, Math.min(1, u));
        const px = s[0] + dx*u, py = s[1] + dy*u, ddx = ball.x - px, ddy = ball.y - py, d2 = ddx*ddx + ddy*ddy;
        if (d2 < BR*BR && d2 > 1e-8){
          const d = Math.sqrt(d2), nx = ddx/d, ny = ddy/d; ball.x = px + nx*BR; ball.y = py + ny*BR;
          const vn = ball.vx*nx + ball.vy*ny;
          if (vn < 0){ ball.vx -= 1.72*vn*nx; ball.vy -= 1.72*vn*ny; ball.vx *= 0.97; ball.vy *= 0.97; }
        }
      }
      // bumpers
      (hole.bumpers || []).forEach((b, i) => {
        const dx = ball.x - b.x, dy = ball.y - b.y, d = Math.hypot(dx, dy), rr = b.r + BR;
        if (d < rr && d > 1e-4){
          const nx = dx/d, ny = dy/d; ball.x = b.x + nx*rr; ball.y = b.y + ny*rr;
          const vn = ball.vx*nx + ball.vy*ny;
          if (vn < 0){ ball.vx -= 2*vn*nx; ball.vy -= 2*vn*ny; const s2 = Math.hypot(ball.vx, ball.vy), ns = Math.min(MAXS*0.8, s2*1.12 + 40); ball.vx *= ns/s2; ball.vy *= ns/s2; flash[i] = 1; }
        }
      });
      // tunnel
      for (const tn of hole.tunnels || []){
        if (Math.hypot(ball.x - tn.ax, ball.y - tn.ay) < 15){
          const s2 = Math.max(260, Math.hypot(ball.vx, ball.vy)*0.9);
          ball.x = tn.bx + tn.dx*22; ball.y = tn.by + tn.dy*22; ball.vx = tn.dx*s2; ball.vy = tn.dy*s2;
          showPop('Whoosh!', '#9fe0ff', 0.9);
        }
      }
      // water
      for (const w of hole.water || []) if (inRect(w, ball.x, ball.y)){
        ball.x = ball.lx; ball.y = ball.ly; ball.vx = ball.vy = 0; ball.moving = false; strokes++;
        showPop('Splash! +1', '#9fe0ff', 1.3); afterStop(); return;
      }
      // cup
      sp = Math.hypot(ball.vx, ball.vy);
      const cdx = hole.cup[0] - ball.x, cdy = hole.cup[1] - ball.y, cd = Math.hypot(cdx, cdy);
      if (cd < CUPR){
        if (sp < 430){ ball.sink = 0.001; ball.moving = false; ball.vx = ball.vy = 0; holeDone(true); return; }
        // too fast: it lips out a little
        const a = (Math.random() - 0.5)*0.5, c = Math.cos(a), s = Math.sin(a);
        const vx = ball.vx*c - ball.vy*s, vy = ball.vx*s + ball.vy*c; ball.vx = vx*0.85; ball.vy = vy*0.85;
      } else if (cd < CUPR + 10 && sp < 200){ ball.vx += cdx/cd*260*dt; ball.vy += cdy/cd*260*dt; }
      if (Math.hypot(ball.vx, ball.vy) < 5 && !hill){ ball.vx = ball.vy = 0; ball.moving = false; afterStop(); }
    }
    function afterStop(){
      if (phase === 'holed') return;
      if (strokes >= MAXSTROKES) holeDone(false); else setPhase('aim');
    }

    // ---- input: pull back and release ----
    const toW = e => ({x:(e.clientX - rect.left - L.ox)/L.sc, y:(e.clientY - rect.top - L.oy)/L.sc, px:e.clientX - rect.left, py:e.clientY - rect.top});
    function down(e){
      if (phase !== 'aim') return;
      rect = el.getBoundingClientRect(); const p = toW(e);
      const near = Math.hypot(p.px - (L.ox + ball.x*L.sc), p.py - (L.oy + ball.y*L.sc)) < 70;
      drag = {id:e.pointerId, near, sx:p.px, sy:p.py, px:p.px, py:p.py};
      try { cv.setPointerCapture(e.pointerId); } catch(_){}
    }
    function pullOf(){ // screen-space pull vector (from where the shot goes, backwards)
      if (!drag) return null;
      const bx = L.ox + ball.x*L.sc, by = L.oy + ball.y*L.sc;
      const vx = drag.near ? bx - drag.px : drag.sx - drag.px, vy = drag.near ? by - drag.py : drag.sy - drag.py;
      const maxP = Math.max(110, Math.min(170, Math.min(W, H)*0.22)), len = Math.hypot(vx, vy);
      return {dx: len ? vx/len : 0, dy: len ? vy/len : 0, pow: Math.min(1, len/maxP), len};
    }
    function move(e){ if (!drag || e.pointerId !== drag.id) return; const p = toW(e); drag.px = p.px; drag.py = p.py; }
    function up(e){
      if (!drag || e.pointerId !== drag.id) return;
      const p = toW(e); drag.px = p.px; drag.py = p.py;
      const pl = pullOf(); drag = null;
      if (phase !== 'aim' || !pl || pl.len < 14) return;
      const sp = 40 + Math.pow(pl.pow, 1.25)*(MAXS - 40);
      ball.lx = ball.x; ball.ly = ball.y; ball.vx = pl.dx*sp; ball.vy = pl.dy*sp; ball.moving = true; strokes++;
      setPhase('roll');
    }
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

    // ---- drawing ----
    const X = x => L.ox + x*L.sc, Y = y => L.oy + y*L.sc;
    function rr(x, y, w, h, r){ cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
    function polyPath(pg){ cx.beginPath(); cx.moveTo(X(pg[0][0]), Y(pg[0][1])); for (let i = 1; i < pg.length; i++) cx.lineTo(X(pg[i][0]), Y(pg[i][1])); cx.closePath(); }
    function drawCourse(){
      const s = L.sc;
      // garden around the course
      cx.fillStyle = '#2f7d3a'; cx.fillRect(0, 0, W, H);
      cx.fillStyle = 'rgba(255,255,255,.06)';
      for (let i = 0; i < 26; i++){ const x = (i*137) % W, y = L.top + ((i*89) % Math.max(1, H - L.top)); cx.beginPath(); cx.arc(x, y, 3 + (i % 4), 0, 6.283); cx.fill(); }
      // green with mown stripes
      cx.save(); polyPath(hole.poly); cx.fillStyle = '#4cbb4f'; cx.fill(); cx.clip();
      cx.fillStyle = 'rgba(255,255,255,.07)'; for (let x = 0; x < 800; x += 80) cx.fillRect(X(x), Y(0), 40*s, 500*s);
      // hills
      for (const h of hole.hills || []){
        const g = cx.createLinearGradient(X(h.x), 0, X(h.x + h.w), 0);
        g.addColorStop(0, '#5fc35c'); g.addColorStop(0.5, '#86d877'); g.addColorStop(1, '#3f9f43');
        cx.fillStyle = g; cx.fillRect(X(h.x), Y(h.y), h.w*s, h.h*s);
        cx.strokeStyle = 'rgba(255,255,255,.45)'; cx.lineWidth = 3*s; cx.lineCap = 'round';
        const dir = h.ax < 0 ? 1 : -1; // chevrons point uphill
        for (let yy = h.y + 30; yy < h.y + h.h - 10; yy += 50) for (let xx = h.x + 30; xx < h.x + h.w - 10; xx += 45){
          cx.beginPath(); cx.moveTo(X(xx - 8*dir), Y(yy - 10)); cx.lineTo(X(xx + 8*dir), Y(yy)); cx.lineTo(X(xx - 8*dir), Y(yy + 10)); cx.stroke(); }
      }
      // sand
      for (const sd of hole.sand || []){
        cx.fillStyle = '#ecd28f'; rr(X(sd.x), Y(sd.y), sd.w*s, sd.h*s, 26*s); cx.fill();
        cx.strokeStyle = '#d6b464'; cx.lineWidth = 2; cx.stroke();
        cx.fillStyle = 'rgba(160,120,50,.35)';
        for (let i = 0; i < sd.w*sd.h/600; i++){ const px = sd.x + 10 + ((i*53) % Math.max(1, sd.w - 20)), py = sd.y + 10 + ((i*31) % Math.max(1, sd.h - 20)); cx.beginPath(); cx.arc(X(px), Y(py), 1.6*s, 0, 6.283); cx.fill(); }
      }
      // water
      for (const w of hole.water || []){
        cx.fillStyle = '#2f8fe0'; rr(X(w.x), Y(w.y), w.w*s, w.h*s, 18*s); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 2*s;
        for (let yy = w.y + 22; yy < w.y + w.h - 8; yy += 28) for (let xx = w.x + 20; xx < w.x + w.w - 20; xx += 46){
          const o = RM ? 0 : Math.sin(t*2 + xx*0.1 + yy)*4; cx.beginPath(); cx.arc(X(xx + o), Y(yy), 8*s, Math.PI*1.1, Math.PI*1.9); cx.stroke(); }
        cx.font = `${18*s}px sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('🪷', X(w.x + w.w*0.75), Y(w.y + w.h*0.5));
      }
      // tunnels
      for (const tn of hole.tunnels || []){
        for (const [x, y, lbl] of [[tn.ax, tn.ay, 'in'], [tn.bx, tn.by, 'out']]){
          cx.fillStyle = '#8a8a8a'; cx.beginPath(); cx.arc(X(x), Y(y), 24*s, 0, 6.283); cx.fill();
          cx.fillStyle = '#1b1b1b'; cx.beginPath(); cx.arc(X(x), Y(y), 16*s, 0, 6.283); cx.fill();
          if (lbl === 'out'){ cx.strokeStyle = '#fff'; cx.lineWidth = 3*s; cx.beginPath(); cx.moveTo(X(x + 28), Y(y)); cx.lineTo(X(x + 44), Y(y)); cx.lineTo(X(x + 38), Y(y - 6)); cx.moveTo(X(x + 44), Y(y)); cx.lineTo(X(x + 38), Y(y + 6)); cx.stroke(); }
        }
        cx.strokeStyle = 'rgba(30,30,30,.25)'; cx.setLineDash([6, 8]); cx.lineWidth = 3*s; cx.beginPath(); cx.moveTo(X(tn.ax), Y(tn.ay)); cx.lineTo(X(tn.bx), Y(tn.by)); cx.stroke(); cx.setLineDash([]);
      }
      // cup + flag
      const [hx, hy] = hole.cup;
      cx.fillStyle = 'rgba(255,255,255,.35)'; cx.beginPath(); cx.arc(X(hx), Y(hy), (CUPR + 4)*s, 0, 6.283); cx.fill();
      cx.fillStyle = '#0d1a0e'; cx.beginPath(); cx.arc(X(hx), Y(hy), CUPR*s, 0, 6.283); cx.fill();
      cx.restore();
      // walls (wood rails)
      cx.lineJoin = 'round'; cx.lineCap = 'round';
      polyPath(hole.poly); cx.strokeStyle = '#6b4220'; cx.lineWidth = 16*s; cx.stroke(); cx.strokeStyle = '#a8703a'; cx.lineWidth = 9*s; cx.stroke();
      for (const b of hole.blocks || []){ const [x1, y1, x2, y2] = b; cx.fillStyle = '#8b5a2b'; cx.fillRect(X(x1), Y(y1), (x2 - x1)*s, (y2 - y1)*s); cx.strokeStyle = '#6b4220'; cx.lineWidth = 4*s; cx.strokeRect(X(x1), Y(y1), (x2 - x1)*s, (y2 - y1)*s); }
      for (const sg of hole.segs || []){ cx.beginPath(); cx.moveTo(X(sg[0]), Y(sg[1])); cx.lineTo(X(sg[2]), Y(sg[3])); cx.strokeStyle = '#6b4220'; cx.lineWidth = 12*s; cx.stroke(); cx.strokeStyle = '#c4874a'; cx.lineWidth = 6*s; cx.stroke(); }
      // bumpers
      (hole.bumpers || []).forEach((b, i) => {
        const f = flash[i] || 0; cx.fillStyle = '#c8102e'; cx.beginPath(); cx.arc(X(b.x), Y(b.y), (b.r + f*3)*s, 0, 6.283); cx.fill();
        cx.strokeStyle = f > 0.05 ? '#ffe46b' : '#ffffff'; cx.lineWidth = 4*s; cx.beginPath(); cx.arc(X(b.x), Y(b.y), (b.r - 5)*s, 0, 6.283); cx.stroke();
      });
      // flag stays beside the hole (short pole so it never hides the cup)
      if (ball.sink === 0 || phase !== 'holed'){
        cx.strokeStyle = '#f2f2f2'; cx.lineWidth = 3*s; cx.beginPath(); cx.moveTo(X(hx + CUPR + 2), Y(hy)); cx.lineTo(X(hx + CUPR + 2), Y(hy - 48)); cx.stroke();
        cx.fillStyle = '#e53935'; cx.beginPath(); const wv = RM ? 0 : Math.sin(t*4)*3; cx.moveTo(X(hx + CUPR + 2), Y(hy - 48)); cx.lineTo(X(hx + CUPR + 30), Y(hy - 40 + wv)); cx.lineTo(X(hx + CUPR + 2), Y(hy - 30)); cx.fill();
        cx.fillStyle = '#fff'; cx.font = `700 ${11*s}px ${TXT_FONT}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(String(hi + 1), X(hx + CUPR + 12), Y(hy - 39 + wv/2));
      }
    }
    function drawMills(){
      const s = L.sc;
      for (const m of hole.mills || []){
        for (let k = 0; k < m.n; k++){
          const a = (m.a || 0) + k*Math.PI*2/m.n, ex = m.x + Math.cos(a)*m.len, ey = m.y + Math.sin(a)*m.len;
          cx.lineCap = 'round'; cx.strokeStyle = '#5a3a1a'; cx.lineWidth = 12*s; cx.beginPath(); cx.moveTo(X(m.x), Y(m.y)); cx.lineTo(X(ex), Y(ey)); cx.stroke();
          cx.strokeStyle = '#f4ead2'; cx.lineWidth = 6*s; cx.beginPath(); cx.moveTo(X(m.x + Math.cos(a)*22), Y(m.y + Math.sin(a)*22)); cx.lineTo(X(ex), Y(ey)); cx.stroke();
        }
        cx.fillStyle = '#c0392b'; cx.beginPath(); cx.arc(X(m.x), Y(m.y), 13*s, 0, 6.283); cx.fill();
        cx.fillStyle = '#ffd65a'; cx.beginPath(); cx.arc(X(m.x), Y(m.y), 5*s, 0, 6.283); cx.fill();
      }
    }
    function drawBall(){
      const s = L.sc, k = ball.sink > 0 ? Math.max(0, 1 - ball.sink*2.5) : 1;
      if (k <= 0) return;
      const x = X(ball.x), y = Y(ball.y), r = BR*s*k;
      cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(x + 2*s, y + 3*s, r, r*0.8, 0, 0, 6.283); cx.fill();
      const g = cx.createRadialGradient(x - r*0.35, y - r*0.35, r*0.1, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#cfd8e3');
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, r, 0, 6.283); cx.fill();
      if (phase === 'aim' && !drag){
        const pl = players[cur]; if (pl){ cx.font = `${Math.max(18, 22*s)}px sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'bottom'; cx.fillText(pl.av, x, y - r - 4 - (RM ? 0 : Math.abs(Math.sin(t*3))*4)); }
        cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 2; cx.setLineDash([4, 5]); cx.beginPath(); cx.arc(x, y, 30 + (RM ? 0 : Math.sin(t*4)*3), 0, 6.283); cx.stroke(); cx.setLineDash([]);
      }
    }
    function drawAim(){
      const pl = pullOf(); if (!pl || pl.len < 6 || phase !== 'aim') return;
      const bx = X(ball.x), by = Y(ball.y);
      // pull line back to the finger
      cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(bx, by); cx.lineTo(bx - pl.dx*Math.min(pl.len, 170), by - pl.dy*Math.min(pl.len, 170)); cx.stroke();
      // aim line: dotted, longer with more power
      const len = (60 + pl.pow*260)*Math.max(0.6, L.sc), col = pl.pow < 0.45 ? '#7dff8a' : pl.pow < 0.8 ? '#ffd65a' : '#ff6b5a';
      cx.fillStyle = col;
      for (let d = 16; d < len; d += 14){ cx.beginPath(); cx.arc(bx + pl.dx*d, by + pl.dy*d, 3.4*(1 - d/len*0.5), 0, 6.283); cx.fill(); }
      const ax = bx + pl.dx*len, ay = by + pl.dy*len, an = Math.atan2(pl.dy, pl.dx);
      cx.beginPath(); cx.moveTo(ax + Math.cos(an)*12, ay + Math.sin(an)*12); cx.lineTo(ax + Math.cos(an + 2.5)*12, ay + Math.sin(an + 2.5)*12); cx.lineTo(ax + Math.cos(an - 2.5)*12, ay + Math.sin(an - 2.5)*12); cx.closePath(); cx.fill();
      // power meter
      const mh = 110, mw = 18, mx = Math.max(12, Math.min(W - mw - 12, pl.dx > 0.2 ? bx - 48 - mw : bx + 48)), my = Math.max(L.top + 4, Math.min(H - L.bot - mh - 4, by - mh/2));
      cx.fillStyle = 'rgba(0,0,0,.45)'; rr(mx - 3, my - 3, mw + 6, mh + 6, 8); cx.fill();
      const g = cx.createLinearGradient(0, my + mh, 0, my); g.addColorStop(0, '#7dff8a'); g.addColorStop(0.55, '#ffd65a'); g.addColorStop(1, '#ff6b5a');
      cx.fillStyle = g; rr(mx, my + mh*(1 - pl.pow), mw, mh*pl.pow, 5); cx.fill();
      cx.fillStyle = '#fff'; cx.font = `700 12px ${TXT_FONT}`; cx.textAlign = 'center'; cx.textBaseline = 'bottom'; cx.fillText('Power', mx + mw/2, my - 5);
    }
    function drawHud(){
      cx.fillStyle = C.panel; cx.fillRect(0, 0, W, L.top);
      cx.strokeStyle = C.line; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, L.top); cx.lineTo(W, L.top); cx.stroke();
      if (phase !== 'menu'){
        cx.fillStyle = C.ink; cx.textBaseline = 'middle'; cx.textAlign = 'left'; cx.font = `700 ${W < 600 ? 15 : 18}px ${HEAD_FONT}`;
        cx.fillText('Hole ' + (hi + 1) + '/9: ' + hole.name + '  ·  Par ' + hole.par, 14, L.top/2 + 1);
        if (players[cur]){ cx.textAlign = 'right'; cx.font = `700 ${W < 600 ? 14 : 17}px ${TXT_FONT}`;
          cx.fillText(players[cur].av + (nP === 2 ? ' ' + players[cur].name : '') + '  Strokes: ' + strokes, W - 14, L.top/2 + 1); }
      } else { cx.fillStyle = C.ink; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.font = `700 18px ${HEAD_FONT}`; cx.fillText('⛳ Mini Golf', W/2, L.top/2); }
      // scorecard
      const y0 = H - L.bot + 6, rh = 19, nameW = Math.min(120, W*0.16), cw = (W - 20 - nameW)/10;
      cx.fillStyle = C.panel; cx.fillRect(0, H - L.bot, W, L.bot);
      cx.strokeStyle = C.line; cx.beginPath(); cx.moveTo(0, H - L.bot); cx.lineTo(W, H - L.bot); cx.stroke();
      const rows = [['Hole', HOLES.map((h, i) => String(i + 1)), 'Tot'], ['Par', HOLES.map(h => String(h.par)), String(HOLES.reduce((a, h) => a + h.par, 0))]];
      const pls = players.length ? players : [{name: api.name || 'You', av: api.avatar || '🙂', sc: []}];
      pls.forEach(p => rows.push([p.av + ' ' + p.name, HOLES.map((h, i) => p.sc[i] != null ? String(p.sc[i]) : ''), String(p.sc.reduce((a, b) => a + (b || 0), 0) || '')]));
      rows.forEach((r, ri) => {
        const y = y0 + ri*rh;
        if (ri >= 2 && ri - 2 === cur && phase !== 'end' && phase !== 'menu'){ cx.fillStyle = C.soft; cx.fillRect(6, y, W - 12, rh); }
        cx.fillStyle = ri === 1 ? C.mut : C.ink; cx.font = `${ri === 0 || ri >= 2 ? 700 : 500} 13px ${TXT_FONT}`; cx.textAlign = 'left'; cx.textBaseline = 'middle';
        let nm = r[0]; while (nm.length > 3 && cx.measureText(nm).width > nameW - 6) nm = nm.slice(0, -2) + '…';
        cx.fillText(nm, 10, y + rh/2); cx.textAlign = 'center';
        r[1].forEach((v, i) => { if (ri === 0 && i === hi && phase !== 'menu' && phase !== 'end'){ cx.fillStyle = C.accent; rr(10 + nameW + i*cw + cw/2 - 11, y + 1, 22, rh - 2, 6); cx.fill(); cx.fillStyle = C.accentInk; }
          else cx.fillStyle = ri === 1 ? C.mut : (ri >= 2 && v && +v < HOLES[i].par ? C.good : C.ink);
          cx.fillText(v, 10 + nameW + i*cw + cw/2, y + rh/2); });
        cx.fillStyle = ri === 1 ? C.mut : C.ink; cx.fillText(r[2], 10 + nameW + 9*cw + cw/2, y + rh/2);
      });
    }
    function drawText(txt, y, fs, col, alpha, sc){
      cx.save(); cx.globalAlpha = alpha; cx.translate(W/2, y); cx.scale(sc, sc);
      cx.font = `800 ${fs}px ${HEAD_FONT}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineJoin = 'round';
      cx.lineWidth = fs*0.17; cx.strokeStyle = 'rgba(10,30,15,.85)'; cx.strokeText(txt, 0, 0); cx.fillStyle = col; cx.fillText(txt, 0, 0); cx.restore();
    }
    function drawOverlays(dt){
      const mid = L.oy + 250*L.sc;
      if (banner){ banner.t += dt; const d = 2.0; if (banner.t > d) banner = null; else {
        const a = banner.t > d - 0.4 ? (d - banner.t)/0.4 : 1, sc = RM ? 1 : Math.min(1, 0.6 + banner.t*3);
        drawText(banner.a, mid - 22, Math.max(26, Math.min(52, W/16)), '#ffffff', a, sc);
        drawText(banner.b, mid + 26, Math.max(18, Math.min(28, W/30)), '#ffd65a', a, sc); } }
      if (popup){ popup.t += dt; if (popup.t > popup.dur) popup = null; else {
        const a = popup.t > popup.dur - 0.35 ? (popup.dur - popup.t)/0.35 : 1, sc = RM ? 1 : Math.min(1, popup.t*5)*(1 + 0.08*Math.sin(Math.min(1, popup.t*5)*Math.PI));
        drawText(popup.txt, mid - (banner ? 90 : 0), Math.max(32, Math.min(64, W/13)), popup.col, a, sc); } }
    }

    function loop(now){
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, last ? (now - last)/1000 : 0.016); last = now; t += dt;
      layout();
      const n = Math.min(14, Math.ceil(dt/(1/240)));
      for (let i = 0; i < n; i++) step(dt/n);
      for (let i = 0; i < flash.length; i++) flash[i] = Math.max(0, flash[i] - dt*4);
      if (phase === 'holed'){ doneT += dt; if (ball.sink > 0) ball.sink += dt; if (doneT > 1.9) nextAfterHole(); }
      drawCourse(); drawMills(); drawBall(); drawAim(); drawHud(); drawOverlays(dt);
    }
    menu();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
      ov.removeEventListener('click', onOv);
      delete el._golfDbg; el.innerHTML = '';
    };
  }};
})();
