// Basketball shootout: flick the ball up toward the hoop. 60-second round, 2 points a basket,
// "On fire!" after 3 in a row (+1 a basket), and from 10 points the hoop slides side to side.
(function(){
  window.BreakGames = window.BreakGames || {};
  window.BreakGames.hoops = {
    start(el, api){
      const C = api.colors, RM = api.reducedMotion;
      const LW = 1000, LH = 700;             // logical world; fitted into el
      const G = 1500, BR = 26;               // gravity, ball radius
      const FLOOR = 655, START = {x: 190, y: 560};
      const RIM_Y = 300, RIM_HALF = 56, RIM_R = 6, BASE_X = 720;
      const ROUND = 60;

      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.appendChild(cv);
      const cx = cv.getContext('2d');
      const ui = document.createElement('div');
      ui.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none';
      el.appendChild(ui);

      let W = 0, H = 0, sc = 1, ox = 0, oy = 0, raf = 0, last = 0, alive = true;
      const timers = new Set();
      const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms); timers.add(t); };
      const size = () => {
        const r = el.getBoundingClientRect(), d = window.devicePixelRatio || 1;
        W = r.width; H = r.height; cv.width = Math.round(W*d); cv.height = Math.round(H*d);
        sc = Math.min(W/LW, H/LH); ox = (W - LW*sc)/2; oy = (H - LH*sc)/2;
        cx.setTransform(d,0,0,d,0,0);
      };
      size(); window.addEventListener('resize', size);

      // ---- state ----
      let mode = 'menu', score = 0, timeLeft = ROUND, streak = 0, made = 0, shots = 0;
      let hoopX = BASE_X, slidePhase = 0, netWiggle = 0, held = null, nextBallIn = 0;
      const balls = [], pops = [];
      const hoop = () => ({fx: hoopX - RIM_HALF, bx: hoopX + RIM_HALF, board: hoopX + RIM_HALF + 14});
      const newBall = () => ({x: START.x, y: START.y, vx: 0, vy: 0, rot: 0, live: false, t: 0, scored: false, touched: false, done: false, above: false, res: false});
      let ready = newBall();

      // ---- overlay screens ----
      const btn = (label, primary) => `<button data-b="${label}" style="pointer-events:auto;min-height:56px;min-width:200px;padding:10px 26px;border-radius:18px;border:2px solid ${primary ? C.accent : C.line};background:${primary ? C.accent : C.panel};color:${primary ? C.accentInk : C.ink};font:700 24px 'Baloo 2',sans-serif;cursor:pointer">${label}</button>`;
      const card = html => { ui.innerHTML = `<div style="pointer-events:auto;background:${C.panel};color:${C.ink};border:2px solid ${C.line};border-radius:24px;padding:24px 30px;max-width:86%;text-align:center;font-family:Lexend,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:12px;align-items:center">${html}</div>`; };
      const onUi = e => { const b = e.target.closest('[data-b]'); if (!b) return; e.preventDefault(); begin(); };
      ui.addEventListener('click', onUi);
      const menu = () => {
        mode = 'menu';
        card(`<div style="font-size:54px;line-height:1">🏀</div><div style="font:800 32px 'Baloo 2',sans-serif">Basketball</div>
          <div style="color:${C.mut};font-size:17px">Flick the ball up into the hoop!</div>
          ${api.best != null ? `<div style="color:${C.mut}">🏆 Best: ${api.best}</div>` : ''}${btn('Play', true)}`);
      };
      const begin = () => {
        ui.innerHTML = ''; mode = 'play'; score = 0; timeLeft = ROUND; streak = 0; made = 0; shots = 0;
        el.dataset.score = 0; hoopX = BASE_X; slidePhase = 0; balls.length = 0; pops.length = 0; ready = newBall(); held = null; nextBallIn = 0;
        pop('Go!', LW/2, 200, '#ffd84d', 1.2);
      };
      const finish = () => {
        mode = 'over';
        const r = api.saveScore(score);
        card(`<div style="font:800 34px 'Baloo 2',sans-serif">Time!</div>
          <div style="font:800 52px 'Baloo 2',sans-serif;color:${C.accent}">${score} points</div>
          <div style="color:${C.mut}">${made} basket${made === 1 ? '' : 's'}</div>
          ${r.isBest ? `<div style="font:800 26px 'Baloo 2',sans-serif;color:${C.good}">🏆 New best!</div>` : `<div style="color:${C.mut}">🏆 Best: ${r.best}</div>`}
          ${btn('Play again', true)}`);
      };
      const pop = (text, x, y, color, life) => { pops.push({text, x, y, color, t: 0, life: life || 1.1}); };

      // ---- input: flick ----
      const toW = e => { const r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left - ox)/sc, y: (e.clientY - r.top - oy)/sc}; };
      const down = e => {
        if (mode !== 'play' || held || !ready || nextBallIn > 0) return;
        const p = toW(e);
        if (Math.hypot(p.x - ready.x, p.y - ready.y) > 170 && p.y < 380) return; // start near the ball or low on screen
        held = {id: e.pointerId, pts: [{x: p.x, y: p.y, t: performance.now()}]};
        try { cv.setPointerCapture(e.pointerId); } catch(_){}
        e.preventDefault();
      };
      const move = e => {
        if (!held || e.pointerId !== held.id) return;
        const p = toW(e); held.pts.push({x: p.x, y: p.y, t: performance.now()});
        if (held.pts.length > 12) held.pts.shift();
      };
      const up = e => {
        if (!held || e.pointerId !== held.id) return;
        const p = toW(e), now = performance.now(); held.pts.push({x: p.x, y: p.y, t: now});
        const pts = held.pts; held = null;
        let a = pts[0]; for (const q of pts) if (now - q.t <= 110) { a = q; break; }
        const b = pts[pts.length - 1], dt = Math.max(0.03, (b.t - a.t)/1000);
        let vx = (b.x - a.x)/dt, vy = (b.y - a.y)/dt;
        if (vy > -250 || Math.hypot(b.x - pts[0].x, b.y - pts[0].y) < 25) { pop('Flick up!', START.x + 60, START.y - 90, '#ffffff', 0.9); return; }
        // flick speed -> launch speed, softened so a normal flick reaches the hoop
        const sp = Math.hypot(vx, vy), want = Math.max(650, Math.min(2000, 480 + sp*0.4));
        vx = vx/sp*want; vy = vy/sp*want;
        Object.assign(ready, {vx, vy, live: true});
        balls.push(ready); shots++; ready = null; nextBallIn = 0.25;
      };
      cv.addEventListener('pointerdown', down);
      cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);

      // ---- physics ----
      const hitPoint = (b, px, py, e) => {
        const dx = b.x - px, dy = b.y - py, d = Math.hypot(dx, dy), m = BR + RIM_R;
        if (d >= m || d === 0) return false;
        const nx = dx/d, ny = dy/d; b.x = px + nx*m; b.y = py + ny*m;
        const vn = b.vx*nx + b.vy*ny;
        if (vn < 0) { b.vx -= (1+e)*vn*nx; b.vy -= (1+e)*vn*ny; b.vx *= 0.92; b.vy *= 0.92; }
        return true;
      };
      const stepBall = (b, dt) => {
        const h = hoop();
        const prevY = b.y;
        b.vy += G*dt; b.x += b.vx*dt; b.y += b.vy*dt; b.rot += b.vx*dt/BR; b.t += dt;
        if (!b.scored) {
          if (hitPoint(b, h.fx, RIM_Y, 0.5)) b.touched = true;
          if (hitPoint(b, h.bx, RIM_Y, 0.5)) b.touched = true;
          // backboard: vertical face at h.board
          if (b.y > RIM_Y - 150 && b.y < RIM_Y + 30 && b.x + BR > h.board && b.x < h.board + 12 && b.vx > 0) {
            b.x = h.board - BR; b.vx = -b.vx*0.55; b.touched = true;
          }
          // score: centre passes down through the rim plane between the rim points
          if (prevY < RIM_Y && b.y >= RIM_Y && b.vy > 0 && b.x > h.fx + 4 && b.x < h.bx - 4) basket(b);
        } else {
          // ball drops through the net: keep it between the net sides
          if (b.y < RIM_Y + 90) { b.vx *= 0.9; b.x += (hoopX - b.x)*0.15; }
        }
        // a miss is known as soon as the ball drops back below the rim (or lands) without going in
        if (!b.res && !b.scored) {
          if (b.y < RIM_Y - BR) b.above = true;
          if ((b.above && b.y > RIM_Y + 40 && b.vy > 0) || b.y >= FLOOR - BR - 1) { b.res = true; settle(b); }
        }
        if (b.y > FLOOR - BR) { b.y = FLOOR - BR; if (b.vy > 0) b.vy = -b.vy*0.55; b.vx *= 0.85; }
        if (b.x < -80 || b.x > LW + 80 || b.t > 3.2) b.done = true;
      };
      const basket = b => {
        b.scored = true; b.res = true; made++; streak++; netWiggle = 1;
        const fire = streak > 3, pts = fire ? 3 : 2;
        score += pts; el.dataset.score = score;
        const sw = !b.touched;
        pop(sw ? `Swish! +${pts}` : `+${pts}`, hoopX, RIM_Y - 70, sw ? '#7dffb0' : '#ffffff', 1.1);
        if (streak === 3) { pop('On fire! 🔥', LW/2, 170, '#ff9b3d', 1.6); if (!RM) api.confetti(25); }
      };
      const settle = b => { if (!b.scored && mode === 'play') { if (streak >= 3) pop('Fire out', START.x + 40, START.y - 110, '#cfe3ff', 0.9); streak = 0; } };

      const update = dt => {
        if (mode === 'play') {
          timeLeft -= dt;
          if (nextBallIn > 0) { nextBallIn -= dt; if (nextBallIn <= 0 && !ready) ready = newBall(); }
          if (score >= 10) { slidePhase += dt*(0.9 + Math.min(2.6, (score - 10)*0.05)); hoopX = BASE_X + Math.sin(slidePhase)*165; }
          if (timeLeft <= 0) { timeLeft = 0; mode = 'ending'; held = null; ready = null; pop('Time!', LW/2, 220, '#ffd84d', 1.6); later(() => { balls.length = 0; finish(); }, 1600); }
        }
        for (let s = 0; s < 4; s++) for (const b of balls) if (!b.done) stepBall(b, dt/4);
        for (let i = balls.length - 1; i >= 0; i--) if (balls[i].done) { if (!balls[i].res) settle(balls[i]); balls.splice(i, 1); }
        netWiggle = Math.max(0, netWiggle - dt*2.2);
        for (let i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t > pops[i].life) pops.splice(i, 1); }
      };

      // ---- drawing ----
      const drawBall = (x, y, rot) => {
        cx.save(); cx.translate(x, y); cx.rotate(rot);
        const g = cx.createRadialGradient(-8, -10, 4, 0, 0, BR);
        g.addColorStop(0, '#ffb066'); g.addColorStop(1, '#e0661c');
        cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, BR, 0, 7); cx.fill();
        cx.strokeStyle = '#5a2a0c'; cx.lineWidth = 2.2;
        cx.beginPath(); cx.arc(0, 0, BR, 0, 7); cx.stroke();
        cx.beginPath(); cx.moveTo(-BR, 0); cx.lineTo(BR, 0); cx.moveTo(0, -BR); cx.lineTo(0, BR); cx.stroke();
        cx.beginPath(); cx.arc(-BR*1.25, 0, BR*0.85, -0.75, 0.75); cx.stroke();
        cx.beginPath(); cx.arc(BR*1.25, 0, BR*0.85, Math.PI - 0.75, Math.PI + 0.75); cx.stroke();
        cx.restore();
      };
      const text = (s, x, y, size, color, align) => {
        cx.font = `800 ${size}px "Baloo 2", sans-serif`; cx.textAlign = align || 'center'; cx.textBaseline = 'middle';
        cx.lineWidth = size/6; cx.strokeStyle = 'rgba(20,20,40,.75)'; cx.strokeText(s, x, y);
        cx.fillStyle = color; cx.fillText(s, x, y);
      };
      const draw = () => {
        cx.fillStyle = '#2b3a67'; cx.fillRect(0, 0, W, H);
        cx.save(); cx.translate(ox, oy); cx.scale(sc, sc);
        // wall + floor
        const wall = cx.createLinearGradient(0, 0, 0, FLOOR); wall.addColorStop(0, '#30427a'); wall.addColorStop(1, '#4f64a8');
        cx.fillStyle = wall; cx.fillRect(-ox/sc, -oy/sc, W/sc, FLOOR + oy/sc);
        cx.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 6; i++) cx.fillRect(-ox/sc, 80 + i*95, W/sc, 3);
        cx.fillStyle = '#c98a4b'; cx.fillRect(-ox/sc, FLOOR, W/sc, LH - FLOOR + oy/sc + 2);
        cx.fillStyle = 'rgba(0,0,0,.12)'; for (let x = -200; x < LW + 200; x += 60) cx.fillRect(x, FLOOR, 2, LH - FLOOR + 40);
        cx.fillStyle = 'rgba(255,255,255,.55)'; cx.fillRect(START.x - 70, FLOOR + 8, 140, 5);
        const h = hoop();
        // pole + backboard
        cx.fillStyle = '#7d8799'; cx.fillRect(h.board + 26, RIM_Y - 120, 16, FLOOR - RIM_Y + 120);
        cx.fillStyle = '#7d8799'; cx.fillRect(h.board + 6, RIM_Y - 40, 26, 10);
        cx.fillStyle = '#f4f7ff'; cx.fillRect(h.board, RIM_Y - 160, 14, 190);
        cx.strokeStyle = '#d93a3a'; cx.lineWidth = 3; cx.strokeRect(h.board + 2, RIM_Y - 70, 9, 64);
        // back of net
        const wig = Math.sin(performance.now()/40)*netWiggle*6;
        const netDraw = () => {
          cx.strokeStyle = 'rgba(255,255,255,.9)'; cx.lineWidth = 2;
          const top = RIM_Y, bot = RIM_Y + 80 + netWiggle*14, nl = h.fx + 10 + wig, nr = h.bx - 10 + wig;
          for (let i = 0; i <= 6; i++) { const t = i/6; cx.beginPath(); cx.moveTo(h.fx + t*(h.bx - h.fx), top); cx.lineTo(nl + t*(nr - nl), bot); cx.stroke(); }
          for (let j = 1; j <= 3; j++) { const t = j/3, y = top + t*(bot - top); cx.beginPath(); cx.moveTo(h.fx + t*(nl - h.fx), y); cx.lineTo(h.bx + t*(nr - h.bx), y); cx.stroke(); }
        };
        // shooter avatar
        cx.fillStyle = '#000'; cx.font = '64px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(api.avatar || '🙂', START.x - 95, FLOOR - 40);
        // balls behind the front rim
        for (const b of balls) drawBall(b.x, b.y, b.rot);
        if (ready) {
          const bob = (mode === 'play' && !held) ? Math.sin(performance.now()/260)*4 : 0;
          drawBall(ready.x, ready.y + bob, 0);
          if (mode === 'play' && shots === 0 && !held) { // first-shot hint
            const t = (performance.now()/900) % 1;
            cx.globalAlpha = 1 - t; cx.font = '46px sans-serif'; cx.fillText('👆', ready.x + 40, ready.y + 40 - t*120); cx.globalAlpha = 1;
            text('Flick up!', ready.x + 40, ready.y - 110, 30, '#ffffff');
          }
        }
        netDraw();
        // rim (front)
        cx.strokeStyle = '#ff6a1f'; cx.lineWidth = 7; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(h.fx, RIM_Y); cx.lineTo(h.bx, RIM_Y); cx.lineTo(h.board, RIM_Y); cx.stroke();
        cx.lineCap = 'butt';
        // HUD
        text(`${score}`, 40, 46, 48, '#ffd84d', 'left');
        text('points', 40 + cx.measureText(`${score}`).width + 12, 54, 24, '#ffffff', 'left');
        const tl = Math.ceil(timeLeft);
        text(`⏱ ${tl}`, LW - 40, 46, 44, tl <= 10 && mode === 'play' ? '#ff8080' : '#ffffff', 'right');
        if (streak >= 3) text('🔥 On fire', LW/2, 46, 30, '#ff9b3d');
        else if (streak > 0) text(`${streak} in a row`, LW/2, 46, 26, '#cfe3ff');
        for (const p of pops) {
          const k = p.t/p.life, a = Math.max(0, 1 - k*k);
          cx.globalAlpha = a; text(p.text, p.x, p.y - k*40, 40 + (RM ? 0 : (1 - k)*10), p.color); cx.globalAlpha = 1;
        }
        cx.restore();
      };
      const frame = now => {
        const dt = Math.min(0.033, (now - (last || now))/1000); last = now;
        update(dt); draw();
        raf = requestAnimationFrame(frame);
      };
      menu();
      raf = requestAnimationFrame(frame);

      return () => {
        alive = false; cancelAnimationFrame(raf);
        timers.forEach(t => clearTimeout(t)); timers.clear();
        window.removeEventListener('resize', size);
        cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
        cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
        ui.removeEventListener('click', onUi);
        el.innerHTML = '';
      };
    }
  };
})();
