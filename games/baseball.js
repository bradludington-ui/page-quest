// Baseball (home run derby): the pitcher throws, tap anywhere to swing. Timing decides the hit:
// right on time is a HOME RUN, close is a single/double/triple, early or late is a foul or a strike.
// 10 pitches; they get a little faster and a change-up sneaks in later in the round.
(function(){
  window.BreakGames = window.BreakGames || {};
  window.BreakGames.baseball = {
    start(el, api){
      const C = api.colors, RM = api.reducedMotion;
      const LW = 1000, LH = 700, MIDX = 500;
      // pseudo perspective from behind home plate: depth d (m, toward center field), X (m, across), h (m, up)
      const HOR = 200, K = 4800, D0 = 12;
      const P = (X, h, d) => { const u = K/Math.max(0.5, d + D0), s = 0.15*u; return {x: MIDX + X*s, y: HOR + u - h*s, s}; };
      const PITCHES = 10, REL_D = 17.6, HIT_D = 0.5, MOUND_D = 18.4;
      const PTS = {hr: 4, triple: 3, double: 2, single: 1, foul: 0, strike: 0};
      const NAMES = {hr: 'HOME RUN!', triple: 'Triple!', double: 'Double!', single: 'Single!', foul: 'Foul ball', strike: 'Strike!'};
      const g5 = api.grade >= 5;
      const WIN = [0.05, 0.08, 0.11, 0.14, 0.2].map(w => w*(g5 ? 0.85 : 1)); // hr, triple, double, single, foul (seconds)

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
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      size(); window.addEventListener('resize', size);

      // ---- state ----
      let mode = 'menu', pitch = 0, points = 0, hrs = 0, results = [], phase = 'wait', label = null, sub = null, popup = null;
      let t = 0, windup = 0, T = 1.2, change = false, swing = null, flight = null, hop = 0;
      const ball = {X: 0, h: 0, d: REL_D, vis: 0, spin: 0};
      const HOME_F = [[14, 24], [7, 37], [-7, 37], [-14, 24], [-36, 72], [0, 84], [36, 72]];
      const fielders = HOME_F.map(([X, d]) => ({X, d, hx: X, hd: d, tx: X, td: d, run: false}));
      let chaser = null;

      const btn = (lab, primary) => `<button data-b="${lab}" style="pointer-events:auto;min-height:56px;min-width:200px;padding:10px 26px;border-radius:18px;border:2px solid ${primary ? C.accent : C.line};background:${primary ? C.accent : C.panel};color:${primary ? C.accentInk : C.ink};font:700 24px 'Baloo 2',sans-serif;cursor:pointer">${lab}</button>`;
      const card = html => { ui.innerHTML = `<div style="pointer-events:auto;background:${C.panel};color:${C.ink};border:2px solid ${C.line};border-radius:24px;padding:24px 30px;max-width:86%;text-align:center;font-family:Lexend,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:12px;align-items:center">${html}</div>`; };
      const onUi = e => { const b = e.target.closest('[data-b]'); if (!b) return; e.preventDefault(); begin(); };
      ui.addEventListener('click', onUi);
      const setPhase = p => { phase = p; el.dataset.phase = p; };
      const menu = () => {
        mode = 'menu'; setPhase('menu');
        card(`<div style="font-size:54px;line-height:1">⚾</div><div style="font:800 32px 'Baloo 2',sans-serif">Baseball</div>
          <div style="color:${C.mut};font-size:17px">Tap to swing when the ball gets to you. 10 pitches!</div>
          ${api.best != null ? `<div style="color:${C.mut}">🏆 Best: ${api.best} points</div>` : ''}${btn('Play', true)}`);
      };
      const begin = () => {
        ui.innerHTML = ''; mode = 'play'; pitch = 0; points = 0; hrs = 0; results = [];
        el.dataset.points = 0; resetPitch();
      };
      const finish = () => {
        mode = 'over'; setPhase('over');
        const r = api.saveScore(points);
        const praise = hrs >= 4 || points >= 22 ? 'Slugger!' : points >= 10 ? 'Great hitting!' : 'Nice swings!';
        card(`<div style="font:800 32px 'Baloo 2',sans-serif">${praise}</div>
          <div style="font:800 52px 'Baloo 2',sans-serif;color:${C.accent}">${points} point${points === 1 ? '' : 's'}</div>
          <div style="color:${C.mut}">⚾ ${hrs} home run${hrs === 1 ? '' : 's'}</div>
          ${r.isBest ? `<div style="font:800 26px 'Baloo 2',sans-serif;color:${C.good}">🏆 New best!</div>` : `<div style="color:${C.mut}">🏆 Best: ${r.best}</div>`}
          ${btn('Play again', true)}`);
      };
      const rnd = (a, b) => a + Math.random()*(b - a);
      const resetPitch = () => {
        Object.assign(ball, {X: 0.35, h: 1.9, d: REL_D, vis: 0, spin: 0});
        fielders.forEach(f => { f.X = f.hx; f.d = f.hd; f.tx = f.hx; f.td = f.hd; f.run = false; });
        chaser = null; flight = null; swing = null; label = null; sub = null; popup = null; hop = 0;
        windup = rnd(0.9, 1.4); t = 0;
        const base = g5 ? 1.05 : 1.25;
        change = pitch >= 5 && (pitch === 7 || Math.random() < 0.3);
        T = base*(1 - 0.03*pitch)*(change ? 1.45 : 1);
        el.dataset.ideal = Math.round(1000*T*(REL_D - HIT_D)/REL_D);
        setPhase('windup');
      };

      // ---- input: tap anywhere to swing ----
      const down = e => {
        if (mode !== 'play') return;
        e.preventDefault();
        if (swing || (phase !== 'pitch' && phase !== 'windup')) return;
        if (phase === 'windup') return;            // not thrown yet: a tap now does nothing
        swing = {t: 0};
        const err = t - T*(REL_D - HIT_D)/REL_D;   // + late, - early
        const a = Math.abs(err);
        let o = a < WIN[0] ? 'hr' : a < WIN[1] ? 'triple' : a < WIN[2] ? 'double' : a < WIN[3] ? 'single' : a < WIN[4] ? 'foul' : 'strike';
        if (o === 'strike') { swing.miss = true; sub = err < 0 ? 'Too early' : 'Too late'; return; }
        hit(o, err);
      };
      cv.addEventListener('pointerdown', down);

      const hit = (o, err) => {
        setPhase('hit');
        // early pulls to left field, late goes to right; a foul goes outside the lines
        const side = Math.max(-1, Math.min(1, err/WIN[3]));
        let ang;
        if (o === 'foul') ang = (err < 0 ? -1 : 1)*rnd(52, 68);
        else ang = side*38 + rnd(-6, 6);
        const dist = {hr: rnd(118, 135), triple: rnd(82, 92), double: rnd(58, 72), single: rnd(26, 44), foul: rnd(35, 60)}[o];
        const dur = {hr: 2.6, triple: 2.1, double: 1.8, single: 1.1, foul: 1.5}[o];
        const peak = {hr: 34, triple: 15, double: 12, single: 3.5, foul: 22}[o];
        const r = ang*Math.PI/180;
        flight = {o, t: 0, T: dur, peak, X0: ball.X, h0: ball.h, d0: ball.d, X1: dist*Math.sin(r), d1: dist*Math.cos(r), landed: false, roll: 0, rx: Math.sin(r), rd: Math.cos(r)};
        if (o !== 'foul' && o !== 'hr') {
          let best = null, bd = 1e9;
          for (const f of fielders) { const dd = Math.hypot(f.X - flight.X1, f.d - flight.d1); if (dd < bd) { bd = dd; best = f; } }
          chaser = best; best.run = true; best.tx = flight.X1; best.td = flight.d1;
        }
        if (o === 'hr') for (const f of fielders) if (f.hd > 60) { f.run = true; f.tx = f.hx + Math.sin(r)*6; f.td = 92; }
      };
      const say = (text, color, life) => { label = {text, color, t: 0, life: life || 1.6}; };
      const settle = o => {
        results.push(o); points += PTS[o]; if (o === 'hr') hrs++;
        el.dataset.points = points; el.dataset.last = o;
        say(NAMES[o], o === 'hr' ? '#ffe14d' : o === 'strike' ? '#ffb0b0' : o === 'foul' ? '#ffffff' : '#9ff0b0', o === 'hr' ? 2 : 1.6);
        if (PTS[o]) popup = {text: '+' + PTS[o], t: 0};
        if (o === 'hr') { hop = 1; if (!RM) api.confetti(40); }
        setPhase('result');
        later(() => { pitch++; if (pitch >= PITCHES) { setPhase('done'); later(finish, 500); } else resetPitch(); }, o === 'hr' ? 2000 : 1500);
      };

      const update = dt => {
        if (mode === 'play') {
          if (phase === 'windup') {
            t += dt;
            if (t >= windup) { t = 0; ball.vis = 1; setPhase('pitch'); }
          } else if (phase === 'pitch') {
            t += dt;
            const k = t/T;
            ball.d = REL_D*(1 - k);
            ball.X = 0.35*(1 - k);
            ball.h = 1.9 - 1.05*k - (change ? 0.25*k*k : 0);
            ball.spin += dt*20;
            if (ball.d < -1.6) { ball.vis = 0; if (!sub) sub = 'Swing!'; settle('strike'); }
          }
          if (flight && (phase === 'hit' || phase === 'result')) {
            const f = flight; f.t += dt;
            if (!f.landed) {
              const k = Math.min(1, f.t/f.T), e = 1 - (1 - k)*(1 - k)*0.35 - 0.65*(1 - k); // ease: fast off the bat
              ball.X = f.X0 + (f.X1 - f.X0)*e; ball.d = f.d0 + (f.d1 - f.d0)*e;
              ball.h = f.h0*(1 - k) + 4*f.peak*k*(1 - k);
              ball.spin += dt*25;
              if (f.o === 'hr' && phase === 'hit' && ball.d > 96) settle('hr');
              if (k >= 1) {
                f.landed = true; ball.h = 0;
                if (f.o === 'hr') ball.vis = 0;
                else { f.roll = f.o === 'foul' ? 4 : f.o === 'single' ? 9 : 6; if (phase === 'hit') settle(f.o); }
              }
            } else if (f.roll > 0) {
              const sp = f.roll*dt; ball.X += f.rx*sp; ball.d += f.rd*sp; f.roll = Math.max(0, f.roll - dt*6);
              if (chaser) { chaser.tx = ball.X; chaser.td = ball.d; }
            }
          }
          for (const f of fielders) if (f.run) {
            const dx = f.tx - f.X, dd = f.td - f.d, dist = Math.hypot(dx, dd), st = 9*dt;
            if (dist > 0.05) { const k = Math.min(1, st/dist); f.X += dx*k; f.d += dd*k; }
          }
          if (chaser && flight && flight.landed && Math.hypot(chaser.X - ball.X, chaser.d - ball.d) < 1.2) { ball.vis = 0; flight.roll = 0; }
          if (swing) swing.t += dt;
        }
        hop = Math.max(0, hop - dt*0.6);
        if (label) { label.t += dt; if (label.t > label.life) label = null; }
        if (popup) { popup.t += dt; if (popup.t > 1.4) popup = null; }
      };

      // ---- drawing ----
      const text = (s, x, y, size, color, align) => {
        cx.font = `800 ${size}px "Baloo 2", sans-serif`; cx.textAlign = align || 'center'; cx.textBaseline = 'middle';
        cx.lineWidth = size/6; cx.lineJoin = 'round'; cx.strokeStyle = 'rgba(10,25,40,.85)'; cx.strokeText(s, x, y);
        cx.fillStyle = color; cx.fillText(s, x, y);
      };
      const poly = (pts, fill) => { cx.beginPath(); pts.forEach((p, i) => i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y)); cx.closePath(); cx.fillStyle = fill; cx.fill(); };
      const arcPts = (R, a0, a1, n, h) => { const out = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0)*i/n)*Math.PI/180; out.push(P(R*Math.sin(a), h || 0, R*Math.cos(a))); } return out; };
      const fenceR = a => 98 - 6*Math.abs(a)/45;
      const fencePts = h => { const out = []; for (let a = -75; a <= 75; a += 5) { const r = a*Math.PI/180, R = Math.abs(a) <= 45 ? fenceR(a) : 92; out.push(P(R*Math.sin(r), h, R*Math.cos(r))); } return out; };
      const crowdCols = ['#ff6b6b', '#ffd84d', '#6be38f', '#7fb2ff', '#ffffff', '#ff9bd2'];
      const drawField = () => {
        const left = -ox/sc, top = -oy/sc, wide = W/sc, tall = H/sc;
        const sky = cx.createLinearGradient(0, top, 0, HOR + 40); sky.addColorStop(0, '#4b9fe6'); sky.addColorStop(1, '#c4e6ff');
        cx.fillStyle = sky; cx.fillRect(left, top, wide, HOR + 60 - top);
        // stands behind the fence
        cx.fillStyle = '#3b4470'; cx.fillRect(left, 150, wide, 120);
        for (let r = 0; r < 4; r++) for (let x = left + (r % 2)*8; x < left + wide; x += 16) {
          cx.fillStyle = crowdCols[(Math.floor(x*7 + r*13) % 6 + 6) % 6];
          cx.beginPath(); cx.arc(x, 162 + r*19 + (RM ? 0 : Math.sin(performance.now()/300 + x)*1.2), 5, 0, 7); cx.fill();
        }
        // grass
        cx.fillStyle = '#3aa64b'; cx.fillRect(left, 236, wide, top + tall - 236);
        const g = fencePts(0); poly([P(-200, 0, 30), ...g, P(200, 0, 30), P(200, 0, -6), P(-200, 0, -6)], '#3aa64b');
        // mowing stripes in the outfield
        for (let i = 0; i < 9; i++) if (i % 2) poly([P(0, 0, 0), ...arcPts(96, -45 + i*10, -35 + i*10, 3)], 'rgba(255,255,255,.06)');
        // fence (padded wall)
        const top3 = fencePts(3.2), bot = fencePts(0);
        poly([...bot, ...top3.slice().reverse()], '#1f5c3a');
        cx.strokeStyle = '#ffd84d'; cx.lineWidth = 3; cx.beginPath(); top3.forEach((p, i) => i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y)); cx.stroke();
        // infield dirt and grass diamond
        poly([P(0, 0, -2.5), ...arcPts(29, -52, 52, 16)], '#c98d55');
        const b1 = P(19.4, 0, 19.4), b2 = P(0, 0, 38.8), b3 = P(-19.4, 0, 19.4), hm = P(0, 0, 0);
        poly([P(0, 0, 2.6), P(16.8, 0, 19.4), P(0, 0, 36.2), P(-16.8, 0, 19.4)], '#45b356');
        // mound
        const m = P(0, 0, MOUND_D); cx.fillStyle = '#c98d55'; cx.beginPath(); cx.ellipse(m.x, m.y, 2.8*m.s, 1.1*m.s, 0, 0, 7); cx.fill();
        cx.fillStyle = '#fff'; cx.fillRect(m.x - 0.45*m.s, m.y - 0.08*m.s, 0.9*m.s, 0.16*m.s);
        // foul lines
        cx.strokeStyle = 'rgba(255,255,255,.9)'; cx.lineWidth = 3; cx.beginPath();
        const fl = P(-fenceR(45)*0.7071, 0, fenceR(45)*0.7071), fr = P(fenceR(45)*0.7071, 0, fenceR(45)*0.7071);
        cx.moveTo(hm.x, hm.y); cx.lineTo(fl.x, fl.y); cx.moveTo(hm.x, hm.y); cx.lineTo(fr.x, fr.y); cx.stroke();
        // batter's boxes
        cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = 3;
        for (const sx of [-1, 1]) { const a = P(sx*0.45, 0, -0.9), b = P(sx*1.6, 0, -0.9), c = P(sx*1.6, 0, 0.9), d = P(sx*0.45, 0, 0.9);
          cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.lineTo(c.x, c.y); cx.lineTo(d.x, d.y); cx.closePath(); cx.stroke(); }
        // bases and plate
        for (const b of [b1, b2, b3]) { cx.fillStyle = '#fff'; cx.fillRect(b.x - 0.5*b.s, b.y - 0.22*b.s, b.s, 0.44*b.s); }
        poly([P(-0.22, 0, 0.2), P(0.22, 0, 0.2), P(0.22, 0, 0), P(0, 0, -0.22), P(-0.22, 0, 0)], '#fff');
      };
      const person = (X, d, shirt, cap, glove) => {
        const p = P(X, 0, d), u = p.s;
        cx.fillStyle = 'rgba(0,0,0,.2)'; cx.beginPath(); cx.ellipse(p.x, p.y, 0.45*u, 0.14*u, 0, 0, 7); cx.fill();
        cx.fillStyle = '#e8e8ee'; cx.fillRect(p.x - 0.22*u, p.y - 0.9*u, 0.17*u, 0.9*u); cx.fillRect(p.x + 0.05*u, p.y - 0.9*u, 0.17*u, 0.9*u);
        cx.fillStyle = shirt; cx.beginPath(); cx.roundRect ? cx.roundRect(p.x - 0.3*u, p.y - 1.55*u, 0.6*u, 0.72*u, 0.12*u) : cx.rect(p.x - 0.3*u, p.y - 1.55*u, 0.6*u, 0.72*u); cx.fill();
        cx.fillStyle = '#c98a5a'; cx.beginPath(); cx.arc(p.x, p.y - 1.72*u, 0.17*u, 0, 7); cx.fill();
        cx.fillStyle = cap; cx.beginPath(); cx.arc(p.x, p.y - 1.76*u, 0.18*u, Math.PI, 0); cx.fill(); cx.fillRect(p.x - 0.02*u, p.y - 1.78*u, 0.3*u, 0.06*u);
        if (glove) { cx.fillStyle = '#7a4a22'; cx.beginPath(); cx.arc(p.x - 0.38*u, p.y - 1.2*u, 0.13*u, 0, 7); cx.fill(); }
      };
      const drawPitcher = () => {
        const p = P(0, 0, MOUND_D), u = p.s;
        person(0, MOUND_D, '#2f6fd6', '#1c3f8a', true);
        // throwing arm: winds up then whips forward at release
        let a = -0.3;
        if (mode === 'play' && phase === 'windup') { const k = t/windup; a = k < 0.7 ? -0.3 - 2.4*(k/0.7) : -2.7 + 3.2*((k - 0.7)/0.3); }
        else if (phase === 'pitch' && t < 0.25) a = 0.5;
        const sx = p.x + 0.28*u, sy = p.y - 1.45*u, len = 0.62*u;
        cx.strokeStyle = '#2f6fd6'; cx.lineWidth = 0.14*u; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(sx, sy); cx.lineTo(sx + Math.cos(a)*len, sy + Math.sin(a)*len); cx.stroke(); cx.lineCap = 'butt';
        if (phase === 'windup') { cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(sx + Math.cos(a)*len, sy + Math.sin(a)*len, 0.1*u, 0, 7); cx.fill(); }
      };
      const drawBall = () => {
        if (!ball.vis) return;
        const p = P(ball.X, ball.h, ball.d), g = P(ball.X, 0, ball.d), r = Math.max(2.5, 0.28*p.s);
        cx.fillStyle = 'rgba(0,0,0,.22)'; cx.beginPath(); cx.ellipse(g.x, g.y, r*1.1, r*0.35, 0, 0, 7); cx.fill();
        cx.save(); cx.translate(p.x, p.y); cx.rotate(ball.spin);
        cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(0, 0, r, 0, 7); cx.fill();
        cx.strokeStyle = '#d33'; cx.lineWidth = Math.max(1, r*0.12);
        cx.beginPath(); cx.arc(-r*1.15, 0, r*0.85, -0.8, 0.8); cx.stroke();
        cx.beginPath(); cx.arc(r*1.15, 0, r*0.85, Math.PI - 0.8, Math.PI + 0.8); cx.stroke();
        cx.strokeStyle = 'rgba(0,0,0,.3)'; cx.lineWidth = Math.max(1, r*0.07); cx.beginPath(); cx.arc(0, 0, r, 0, 7); cx.stroke();
        cx.restore();
      };
      const drawBatter = () => {
        const p = P(-1.25, 0, 0.1), u = p.s*1.25, jump = hop ? Math.abs(Math.sin(hop*14))*0.35*u*hop : 0;
        const by = p.y - jump;
        cx.fillStyle = 'rgba(0,0,0,.22)'; cx.beginPath(); cx.ellipse(p.x, p.y, 0.6*u, 0.16*u, 0, 0, 7); cx.fill();
        // the child, as the batter
        cx.font = `${1.5*u}px sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#000';
        cx.fillText(api.avatar || '🙂', p.x, by - 0.8*u);
        // bat: rests over the shoulder, sweeps across the plate on a swing
        let a = -2.0;
        if (swing) { const k = Math.min(1, swing.t/0.16); a = -2.0 + 2.85*(1 - (1 - k)*(1 - k)); }
        const hx = p.x + 0.42*u, hy = by - 0.75*u, L = 1.6*u;
        cx.save(); cx.translate(hx, hy); cx.rotate(a);
        cx.fillStyle = '#b5773a'; cx.strokeStyle = '#6e4420'; cx.lineWidth = 2;
        cx.beginPath(); cx.moveTo(0, -0.04*u); cx.lineTo(L*0.45, -0.05*u); cx.quadraticCurveTo(L, -0.13*u, L, 0); cx.quadraticCurveTo(L, 0.13*u, L*0.45, 0.05*u); cx.lineTo(0, 0.04*u); cx.closePath(); cx.fill(); cx.stroke();
        cx.fillStyle = '#333'; cx.fillRect(-0.04*u, -0.06*u, 0.08*u, 0.12*u);
        cx.restore();
        cx.fillStyle = '#d33'; cx.beginPath(); cx.arc(hx, hy, 0.12*u, 0, 7); cx.fill();
      };
      const drawHud = () => {
        // scoreboard
        cx.fillStyle = 'rgba(16,32,52,.88)'; cx.beginPath(); cx.roundRect ? cx.roundRect(MIDX - 300, 14, 600, 108, 18) : cx.rect(MIDX - 300, 14, 600, 108); cx.fill();
        cx.strokeStyle = '#ffd84d'; cx.lineWidth = 3; cx.stroke();
        text(`Points ${points}`, MIDX - 270, 46, 32, '#ffe14d', 'left');
        text(`⚾ HR ${hrs}`, MIDX, 46, 30, '#ffffff');
        text(`Pitch ${Math.min(pitch + 1, PITCHES)}/${PITCHES}`, MIDX + 270, 46, 30, '#ffffff', 'right');
        for (let i = 0; i < PITCHES; i++) {
          const x = MIDX - 4.5*42 + i*42, y = 92, o = results[i];
          cx.fillStyle = o == null ? 'rgba(255,255,255,.25)' : o === 'hr' ? '#ffd84d' : o === 'strike' ? '#ff5a5a' : o === 'foul' ? '#b9c2cc' : '#38d36b';
          cx.beginPath(); cx.arc(x, y, 13, 0, 7); cx.fill();
          if (o && PTS[o]) { cx.fillStyle = '#10203a'; cx.font = '800 16px "Baloo 2", sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(PTS[o], x, y + 1); }
        }
      };
      const draw = () => {
        cx.fillStyle = '#2f8f40'; cx.fillRect(0, 0, W, H);
        cx.save(); cx.translate(ox, oy); cx.scale(sc, sc);
        drawField();
        const far = fielders.filter(f => f.d > MOUND_D).sort((a, b) => b.d - a.d);
        for (const f of far) person(f.X, f.d, '#2f6fd6', '#1c3f8a', true);
        const ballFar = ball.d > MOUND_D;
        if (ballFar) drawBall();
        drawPitcher();
        for (const f of fielders) if (f.d <= MOUND_D) person(f.X, f.d, '#2f6fd6', '#1c3f8a', true);
        if (!ballFar) drawBall();
        drawBatter();
        if (mode === 'play' && pitch === 0 && (phase === 'windup' || phase === 'pitch') && !swing) {
          const k = (performance.now()/900) % 1;
          text('Tap to swing!', MIDX, 668, 34, '#ffffff');
          cx.globalAlpha = 0.6 + 0.4*Math.sin(k*6.28); cx.font = '44px sans-serif'; cx.textAlign = 'center'; cx.fillText('👆', MIDX + 190, 668); cx.globalAlpha = 1;
        }
        if (mode !== 'menu') drawHud();
        if (label) {
          const k = label.t/label.life, s = RM ? 1 : 1 + Math.max(0, 0.3 - k)*1.2;
          cx.globalAlpha = Math.min(1, (1 - k)*3); text(label.text, MIDX, 300, (label.text.length > 8 ? 70 : 64)*s, label.color);
          if (sub && label.color === '#ffb0b0') text(sub, MIDX, 360, 30, '#ffffff');
          cx.globalAlpha = 1;
        }
        if (popup) { cx.globalAlpha = Math.max(0, 1 - popup.t/1.4); text(popup.text, MIDX + 200, 260 - popup.t*30, 44, '#ffe14d'); cx.globalAlpha = 1; }
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
        timers.forEach(x => clearTimeout(x)); timers.clear();
        window.removeEventListener('resize', size);
        cv.removeEventListener('pointerdown', down);
        ui.removeEventListener('click', onUi);
        el.innerHTML = '';
      };
    }
  };
})();
