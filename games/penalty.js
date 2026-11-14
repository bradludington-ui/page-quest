// Penalty kicks: swipe from the ball toward the goal. Direction picks the spot, speed sets the
// height (too hard flies over the bar), a curved swipe bends the ball. 10 shots; the keeper improves.
(function(){
  window.BreakGames = window.BreakGames || {};
  window.BreakGames.penalty = {
    start(el, api){
      const C = api.colors, RM = api.reducedMotion;
      const LW = 1000, LH = 700;
      // camera: world X (m, across), h (m, up), d (m, from camera)
      const F = 1065, HC = 1.0, HOR = 260, MIDX = 500;
      const D0 = 3, D1 = 13, GW = 3.66, GH = 2.44, BRM = 0.11, NET_D = 1.4;
      const SHOTS = 10;
      const P = (X, h, d) => ({x: MIDX + F*X/d, y: HOR + F*(HC - h)/d, s: F/d});

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
        const r = el.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
        W = r.width; H = r.height; cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
        sc = Math.min(W/LW, H/LH); ox = (W - LW*sc)/2; oy = (H - LH*sc)/2;
        cx.setTransform(dpr,0,0,dpr,0,0);
      };
      size(); window.addEventListener('resize', size);

      // ---- state ----
      let mode = 'menu', shot = 0, goals = 0, results = [], phase = 'aim', label = null, shake = 0;
      const ball = {X: 0, h: BRM, d: D0, spin: 0, vis: 1};
      let flight = null;                       // {Xa, ha, T, t, bow, outcome, after}
      const keeper = {X: 0, h: 0.95, ang: 0, tx: 0, th: 0.95, speed: 4, delay: 0, active: false, happy: 0};
      let swipe = null, trail = [], netPush = 0, netX = 0, netH = 1;

      const btn = (lab, primary) => `<button data-b="${lab}" style="pointer-events:auto;min-height:56px;min-width:200px;padding:10px 26px;border-radius:18px;border:2px solid ${primary ? C.accent : C.line};background:${primary ? C.accent : C.panel};color:${primary ? C.accentInk : C.ink};font:700 24px 'Baloo 2',sans-serif;cursor:pointer">${lab}</button>`;
      const card = html => { ui.innerHTML = `<div style="pointer-events:auto;background:${C.panel};color:${C.ink};border:2px solid ${C.line};border-radius:24px;padding:24px 30px;max-width:86%;text-align:center;font-family:Lexend,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:12px;align-items:center">${html}</div>`; };
      const onUi = e => { const b = e.target.closest('[data-b]'); if (!b) return; e.preventDefault(); begin(); };
      ui.addEventListener('click', onUi);
      const menu = () => {
        mode = 'menu';
        card(`<div style="font-size:54px;line-height:1">⚽</div><div style="font:800 32px 'Baloo 2',sans-serif">Penalty Kicks</div>
          <div style="color:${C.mut};font-size:17px">Swipe from the ball to shoot. 10 shots!</div>
          ${api.best != null ? `<div style="color:${C.mut}">🏆 Best: ${api.best} goals</div>` : ''}${btn('Play', true)}`);
      };
      const begin = () => { ui.innerHTML = ''; mode = 'play'; shot = 0; goals = 0; results = []; el.dataset.goals = 0; resetShot(); };
      const finish = () => {
        mode = 'over';
        const r = api.saveScore(goals);
        const praise = goals >= 8 ? 'Superstar!' : goals >= 5 ? 'Great shooting!' : 'Nice try!';
        card(`<div style="font:800 32px 'Baloo 2',sans-serif">${praise}</div>
          <div style="font:800 52px 'Baloo 2',sans-serif;color:${C.accent}">${goals} goal${goals === 1 ? '' : 's'}</div>
          <div style="color:${C.mut}">out of ${SHOTS} shots</div>
          ${r.isBest ? `<div style="font:800 26px 'Baloo 2',sans-serif;color:${C.good}">🏆 New best!</div>` : `<div style="color:${C.mut}">🏆 Best: ${r.best}</div>`}
          ${btn('Play again', true)}`);
      };
      const resetShot = () => {
        Object.assign(ball, {X: 0, h: BRM, d: D0, spin: 0, vis: 1});
        Object.assign(keeper, {X: 0, h: 0.95, ang: 0, tx: 0, th: 0.95, active: false, happy: 0});
        flight = null; phase = 'aim'; label = null; trail = []; swipe = null; netPush = 0;
      };

      // ---- input: swipe ----
      const toW = e => { const r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left - ox)/sc, y: (e.clientY - r.top - oy)/sc, t: performance.now()}; };
      const BS = P(0, BRM, D0);
      const down = e => {
        if (mode !== 'play' || phase !== 'aim' || swipe) return;
        const p = toW(e);
        if (p.y < 400 && Math.hypot(p.x - BS.x, p.y - BS.y) > 160) return;
        swipe = {id: e.pointerId, pts: [p]}; trail = [p];
        try { cv.setPointerCapture(e.pointerId); } catch(_){}
        e.preventDefault();
      };
      const move = e => {
        if (!swipe || e.pointerId !== swipe.id) return;
        const p = toW(e); swipe.pts.push(p); trail.push(p); if (trail.length > 40) trail.shift();
      };
      const up = e => {
        if (!swipe || e.pointerId !== swipe.id) return;
        const end = toW(e); swipe.pts.push(end);
        const pts = swipe.pts; swipe = null;
        const a = pts[0], dx = end.x - a.x, dy = end.y - a.y, len = Math.hypot(dx, dy);
        if (len < 40 || dy > -25) { label = {text: 'Swipe up to shoot!', color: '#ffffff', t: 0, life: 1.2}; trail = []; return; }
        // speed over the swipe (whole swipe, so slow-then-fast still counts)
        const dur = Math.max(0.06, (end.t - a.t)/1000), speed = len/dur;
        const p = Math.max(0, Math.min(1.4, (speed - 400)/2800));
        // direction: a ray from the ball along the swipe, read where it crosses the goal's middle
        const aimY = (P(0, GH, D1).y + P(0, 0, D1).y)/2;
        const sx = BS.x + dx*(aimY - BS.y)/dy;
        const Xa = Math.max(-6, Math.min(6, (sx - MIDX)*D1/F));
        // bend: how far the swipe bows away from its straight line (signed, as a share of its length)
        let bow = 0;
        for (const q of pts) { const c = ((q.x - a.x)*dy - (q.y - a.y)*dx)/len; if (Math.abs(c) > Math.abs(bow)) bow = c; }
        bow = Math.abs(bow)/len > 0.06 ? Math.max(-0.45, Math.min(0.45, -bow/len)) : 0;
        shoot(Xa, 0.15 + p*2.2, p, bow);
      };
      cv.addEventListener('pointerdown', down);
      cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);

      const rnd = (a, b) => a + Math.random()*(b - a);
      const shoot = (Xa, ha, p, bow) => {
        const T = 0.95 - 0.45*Math.min(p, 1.2)/1.2;
        flight = {Xa, ha, T, t: 0, bow: bow*4.5, outcome: null, after: 0, vx: 0, vh: 0, vd: 0};
        phase = 'fly'; trail = [];
        // keeper guesses: gets a little better every shot; a bending ball is harder to read
        const skill = shot/(SHOTS - 1);
        const pRight = Math.max(0.12, 0.3 + 0.36*skill - (bow ? 0.15 : 0));
        keeper.speed = 3.8 + 2.4*skill; keeper.delay = 0.14 - 0.05*skill; keeper.active = true;
        const tgtX = Math.max(-3.3, Math.min(3.3, Xa)), tgtH = Math.max(0.35, Math.min(2.1, ha));
        if (Math.random() < pRight) { keeper.tx = tgtX + rnd(-0.5, 0.5); keeper.th = tgtH + rnd(-0.3, 0.3); }
        else if (Math.random() < 0.15) { keeper.tx = rnd(-0.4, 0.4); keeper.th = rnd(0.6, 1.4); }    // stays in the middle
        else { const side = Math.abs(tgtX) < 0.6 ? (Math.random() < 0.5 ? -1 : 1) : -Math.sign(tgtX); keeper.tx = side*rnd(1.2, 3.0); keeper.th = rnd(0.4, 1.8); }
      };
      // keeper body: a segment through its centre, tilted by its dive; radius ~0.36 m
      const keeperHit = (X, h) => {
        const sa = Math.sin(keeper.ang), ca = Math.cos(keeper.ang), half = 0.95;
        const ax = keeper.X - sa*half, ah = keeper.h - ca*half, bx = keeper.X + sa*(half + 0.1), bh = keeper.h + ca*(half + 0.1);
        const ex = bx - ax, eh = bh - ah, t = Math.max(0, Math.min(1, ((X - ax)*ex + (h - ah)*eh)/(ex*ex + eh*eh)));
        return Math.hypot(X - (ax + ex*t), h - (ah + eh*t)) < 0.36 + BRM;
      };
      const say = (text, color) => { label = {text, color, t: 0, life: 1.5}; };
      const resolve = () => {
        const X = ball.X, h = ball.h, f = flight;
        const ax = Math.abs(X);
        let o;
        if (h > GH + BRM) o = 'over';
        else if (ax > GW + BRM) o = 'wide';
        else if (ax > GW - BRM || h > GH - BRM) o = 'post';
        else if (keeperHit(X, h)) o = 'save';
        else o = 'goal';
        f.outcome = o;
        const dir = Math.sign(X || 1);
        if (o === 'goal') { goals++; el.dataset.goals = goals; netPush = 1; netX = X; netH = h; f.vx = 0; f.vh = 0; f.vd = 7; say('GOAL!', '#ffe14d'); if (!RM) api.confetti(30); }
        else if (o === 'save') { f.vx = dir*rnd(2, 5); f.vh = rnd(2, 4); f.vd = -rnd(6, 9); say('Saved!', '#9fd0ff'); keeper.happy = 1; }
        else if (o === 'post') { f.vx = -dir*rnd(1, 3); f.vh = 2; f.vd = -8; say(h > GH - BRM ? 'Off the bar!' : 'Off the post!', '#ffffff'); if (!RM) shake = 1; }
        else if (o === 'over') { f.vx = (X - 0)/f.T*0.2; f.vh = 4; f.vd = 18; say('Over the bar!', '#ffb0b0'); }
        else { f.vx = dir*4; f.vh = 0.5; f.vd = 18; say('Wide!', '#ffb0b0'); }
        results.push(o === 'goal');
        phase = 'result';
        later(() => { shot++; if (shot >= SHOTS) { phase = 'done'; later(finish, 400); } else resetShot(); }, 1700);
      };

      const update = dt => {
        if (flight && phase === 'fly') {
          const f = flight; f.t += dt;
          const t = Math.min(1, f.t/f.T);
          ball.d = D0 + (D1 - D0)*t;
          ball.X = f.Xa*t + f.bow*Math.sin(Math.PI*t);
          ball.h = BRM + (f.ha - BRM)*t + 0.25*f.ha*t*(1 - t);
          ball.spin += dt*18;
          if (t >= 1) resolve();
        } else if (flight && phase === 'result') {
          const f = flight; f.after += dt;
          if (f.outcome === 'goal') {
            ball.d = Math.min(D1 + NET_D - 0.2, ball.d + f.vd*dt); f.vd *= 0.9;
            if (ball.d >= D1 + NET_D - 0.25) { ball.h = Math.max(BRM, ball.h - dt*3); }
          } else {
            f.vh -= 9.8*dt; ball.X += f.vx*dt; ball.d = Math.max(D0 - 1.2, ball.d + f.vd*dt); ball.h += f.vh*dt;
            if (ball.h < BRM) { ball.h = BRM; f.vh = -f.vh*0.5; }
            if (ball.d > D1 + 3) ball.vis = Math.max(0, ball.vis - dt*2);
          }
          ball.spin += dt*10;
        }
        if (keeper.active) {
          if (keeper.delay > 0) keeper.delay -= dt;
          else {
            const dx = keeper.tx - keeper.X, dh = keeper.th - keeper.h, d = Math.hypot(dx, dh), stepL = keeper.speed*dt;
            if (d > 0.001) { const k = Math.min(1, stepL/d); keeper.X += dx*k; keeper.h += dh*k; }
            const lean = Math.max(-1.35, Math.min(1.35, (keeper.X)*0.75 + (keeper.tx - keeper.X)*0.2));
            keeper.ang += (lean - keeper.ang)*Math.min(1, dt*10);
          }
        }
        if (phase === 'result' && flight && flight.outcome !== 'save' && keeper.active) { // keeper falls to the grass
          keeper.h += (Math.max(0.35, Math.abs(keeper.ang) > 0.6 ? 0.35 : 0.95) - keeper.h)*Math.min(1, dt*4);
        }
        netPush = Math.max(0, netPush - dt*1.4);
        shake = Math.max(0, shake - dt*3);
        if (label) { label.t += dt; if (label.t > label.life) label = null; }
      };

      // ---- drawing ----
      const text = (s, x, y, size, color, align) => {
        cx.font = `800 ${size}px "Baloo 2", sans-serif`; cx.textAlign = align || 'center'; cx.textBaseline = 'middle';
        cx.lineWidth = size/6; cx.lineJoin = 'round'; cx.strokeStyle = 'rgba(10,30,20,.8)'; cx.strokeText(s, x, y);
        cx.fillStyle = color; cx.fillText(s, x, y);
      };
      const line3 = (a, b) => { const p = P(a[0], a[1], a[2]), q = P(b[0], b[1], b[2]); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); };
      const drawPitch = () => {
        const left = -ox/sc, top = -oy/sc, wide = W/sc, tall = H/sc;
        const sky = cx.createLinearGradient(0, top, 0, HOR); sky.addColorStop(0, '#4fa3e8'); sky.addColorStop(1, '#bfe3ff');
        cx.fillStyle = sky; cx.fillRect(left, top, wide, HOR - top);
        // stands with a crowd
        cx.fillStyle = '#39436b'; cx.fillRect(left, 150, wide, HOR - 150);
        const cols = ['#ff6b6b', '#ffd84d', '#6be38f', '#7fb2ff', '#ffffff', '#ff9bd2'];
        for (let r = 0; r < 4; r++) for (let x = left + (r % 2)*9; x < left + wide; x += 18) {
          cx.fillStyle = cols[(Math.floor(x*7 + r*13) % cols.length + cols.length) % cols.length];
          cx.beginPath(); cx.arc(x, 165 + r*22 + Math.sin(performance.now()/300 + x)*(RM ? 0 : 1.5), 6, 0, 7); cx.fill();
        }
        cx.fillStyle = '#2a2f4d'; cx.fillRect(left, HOR - 14, wide, 14);
        // grass with mowing stripes by depth
        cx.fillStyle = '#3fae4f'; cx.fillRect(left, HOR, wide, top + tall - HOR);
        for (let d = 2; d < 30; d += 2) {
          const a = P(0, 0, d + 1).y, b = P(0, 0, d).y;
          cx.fillStyle = 'rgba(255,255,255,.07)'; cx.fillRect(left, a, wide, b - a);
        }
        cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.lineWidth = 3; cx.beginPath();
        line3([-30, 0, D1], [30, 0, D1]);                       // goal line
        line3([-9.2, 0, D1], [-9.2, 0, D1 - 5.5]); line3([9.2, 0, D1], [9.2, 0, D1 - 5.5]); line3([-9.2, 0, D1 - 5.5], [9.2, 0, D1 - 5.5]);
        line3([-20, 0, D1], [-20, 0, 2.2]); line3([20, 0, D1], [20, 0, 2.2]);
        cx.stroke();
        const spot = P(0, 0, D0); cx.fillStyle = '#fff'; cx.beginPath(); cx.ellipse(spot.x, spot.y, 16, 5, 0, 0, 7); cx.fill();
      };
      const drawNet = () => {
        const push = netPush, bx = netX, bh = netH;
        const back = (X, h) => { const k = push*Math.max(0, 1 - Math.hypot(X - bx, h - bh)/1.6); return [X, h, D1 + NET_D + k*0.8]; };
        cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 1.2; cx.beginPath();
        for (let X = -GW; X <= GW + 0.01; X += GW/8) { line3(back(X, 0), back(X, GH)); line3([X, GH, D1], back(X, GH)); }
        for (let h = 0; h <= GH + 0.01; h += GH/5) { line3(back(-GW, h), back(GW, h)); line3([-GW, h, D1], back(-GW, h)); line3([GW, h, D1], back(GW, h)); }
        cx.stroke();
      };
      const drawPosts = () => {
        const a = P(-GW, 0, D1), b = P(-GW, GH, D1), c = P(GW, GH, D1), d = P(GW, 0, D1);
        cx.strokeStyle = '#ffffff'; cx.lineWidth = 9; cx.lineCap = 'round'; cx.lineJoin = 'round';
        cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.lineTo(c.x, c.y); cx.lineTo(d.x, d.y); cx.stroke();
        cx.lineCap = 'butt';
      };
      const drawKeeper = () => {
        const c = P(keeper.X, keeper.h, D1), s = c.s;
        const sh = P(keeper.X, 0, D1);
        cx.fillStyle = 'rgba(0,0,0,.18)'; cx.beginPath(); cx.ellipse(sh.x, sh.y, 0.5*s, 0.1*s, 0, 0, 7); cx.fill();
        cx.save(); cx.translate(c.x, c.y); cx.rotate(keeper.ang);
        const u = s;                                         // 1 m in px at the goal
        const arms = keeper.active && keeper.delay <= 0 ? 1 : 0.35;
        // legs
        cx.fillStyle = '#1c2a52'; cx.fillRect(-0.22*u, 0.1*u, 0.18*u, 0.8*u); cx.fillRect(0.04*u, 0.1*u, 0.18*u, 0.8*u);
        cx.fillStyle = '#111'; cx.fillRect(-0.24*u, 0.85*u, 0.22*u, 0.1*u); cx.fillRect(0.04*u, 0.85*u, 0.22*u, 0.1*u);
        // arms (raised when diving)
        cx.strokeStyle = '#ff8a1f'; cx.lineWidth = 0.13*u; cx.lineCap = 'round';
        const ay = -0.55*u, reach = 0.55*u;
        cx.beginPath(); cx.moveTo(-0.22*u, ay); cx.lineTo(-0.22*u - reach*(1 - arms*0.6), ay - reach*arms*1.1); cx.stroke();
        cx.beginPath(); cx.moveTo(0.22*u, ay); cx.lineTo(0.22*u + reach*(1 - arms*0.6), ay - reach*arms*1.1); cx.stroke();
        cx.fillStyle = '#ffe14d';
        cx.beginPath(); cx.arc(-0.22*u - reach*(1 - arms*0.6), ay - reach*arms*1.1, 0.12*u, 0, 7); cx.fill();
        cx.beginPath(); cx.arc(0.22*u + reach*(1 - arms*0.6), ay - reach*arms*1.1, 0.12*u, 0, 7); cx.fill();
        // shirt
        cx.fillStyle = '#ff8a1f'; cx.beginPath(); cx.roundRect ? cx.roundRect(-0.3*u, -0.7*u, 0.6*u, 0.85*u, 0.12*u) : cx.rect(-0.3*u, -0.7*u, 0.6*u, 0.85*u); cx.fill();
        cx.fillStyle = '#1c2a52'; cx.font = `800 ${0.36*u}px "Baloo 2", sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('1', 0, -0.3*u);
        // head
        cx.fillStyle = '#c98a5a'; cx.beginPath(); cx.arc(0, -0.86*u, 0.17*u, 0, 7); cx.fill();
        cx.fillStyle = '#3a2416'; cx.beginPath(); cx.arc(0, -0.92*u, 0.17*u, Math.PI, 0); cx.fill();
        cx.fillStyle = '#222'; cx.beginPath(); cx.arc(-0.06*u, -0.86*u, 0.025*u, 0, 7); cx.arc(0.06*u, -0.86*u, 0.025*u, 0, 7); cx.fill();
        if (keeper.happy) { cx.strokeStyle = '#222'; cx.lineWidth = 0.025*u; cx.beginPath(); cx.arc(0, -0.81*u, 0.06*u, 0.2, Math.PI - 0.2); cx.stroke(); }
        cx.restore();
      };
      const drawBall = () => {
        if (ball.vis <= 0) return;
        const p = P(ball.X, ball.h, ball.d), g = P(ball.X, 0, ball.d), r = BRM*p.s;
        cx.globalAlpha = ball.vis;
        cx.fillStyle = 'rgba(0,0,0,.22)'; cx.beginPath(); cx.ellipse(g.x, g.y, r*1.1, r*0.35, 0, 0, 7); cx.fill();
        cx.save(); cx.translate(p.x, p.y); cx.rotate(ball.spin);
        cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(0, 0, r, 0, 7); cx.fill();
        cx.fillStyle = '#222';
        cx.beginPath(); for (let i = 0; i < 5; i++) { const a = i*1.2566 - 1.57; cx.lineTo(Math.cos(a)*r*0.35, Math.sin(a)*r*0.35); } cx.fill();
        for (let k = 0; k < 5; k++) { const a = k*1.2566 - 1.57 + 0.63; cx.beginPath(); cx.arc(Math.cos(a)*r*0.92, Math.sin(a)*r*0.92, r*0.24, 0, 7); cx.fill(); }
        cx.strokeStyle = 'rgba(0,0,0,.35)'; cx.lineWidth = Math.max(1, r*0.06); cx.beginPath(); cx.arc(0, 0, r, 0, 7); cx.stroke();
        cx.restore(); cx.globalAlpha = 1;
      };
      const draw = () => {
        cx.fillStyle = '#2f8f40'; cx.fillRect(0, 0, W, H);
        cx.save(); cx.translate(ox + (shake ? Math.sin(performance.now()/20)*shake*6 : 0), oy); cx.scale(sc, sc);
        drawPitch();
        drawNet();
        if (ball.d > D1) drawBall();
        drawKeeper();
        drawPosts();
        if (ball.d <= D1) drawBall();
        // kicker
        cx.fillStyle = '#000'; cx.font = '70px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(api.avatar || '🙂', 330, 610);
        // swipe trail
        if (trail.length > 1) {
          cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = 10; cx.lineCap = 'round'; cx.lineJoin = 'round';
          cx.beginPath(); cx.moveTo(trail[0].x, trail[0].y); for (const q of trail) cx.lineTo(q.x, q.y); cx.stroke(); cx.lineCap = 'butt';
        }
        // hint
        if (mode === 'play' && phase === 'aim' && !swipe && shot === 0) {
          const t = (performance.now()/1100) % 1; cx.globalAlpha = 1 - t;
          cx.font = '46px sans-serif'; cx.fillText('👆', BS.x + 20, BS.y + 30 - t*170); cx.globalAlpha = 1;
          text('Swipe toward the goal!', MIDX, 470, 32, '#ffffff');
        }
        // HUD: shot dots
        if (mode !== 'menu') {
          text(`Goals: ${goals}`, 30, 40, 36, '#ffe14d', 'left');
          text(`Shot ${Math.min(shot + 1, SHOTS)} of ${SHOTS}`, LW - 30, 40, 30, '#ffffff', 'right');
          for (let i = 0; i < SHOTS; i++) {
            const x = MIDX - 4.5*34 + i*34, y = 92;
            cx.fillStyle = i < results.length ? (results[i] ? '#38d36b' : '#ff5a5a') : 'rgba(255,255,255,.35)';
            cx.beginPath(); cx.arc(x, y, 12, 0, 7); cx.fill();
            cx.strokeStyle = 'rgba(0,0,0,.35)'; cx.lineWidth = 2; cx.stroke();
          }
        }
        if (label) {
          const k = label.t/label.life, s = RM ? 1 : 1 + Math.max(0, 0.3 - k)*1.2;
          cx.globalAlpha = Math.min(1, (1 - k)*3); text(label.text, MIDX, 380, 64*s, label.color); cx.globalAlpha = 1;
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
