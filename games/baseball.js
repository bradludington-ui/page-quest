// Baseball (home run derby), night game. The pitcher throws, tap anywhere to swing. Timing decides the hit:
// right on time is a HOME RUN, close is a single/double/triple, early or late is a foul or a strike.
// 10 pitches: fastballs first, then curveballs and change-ups; back-to-back hits build a hot streak (+1 each).
// TV extras: pitch type and speed, a pitch tracker box, exit velocity and distance, a timing meter after every swing.
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
      const BOARD = {hr: 'HOME RUN!', triple: 'TRIPLE!', double: 'DOUBLE!', single: 'SINGLE!', foul: 'FOUL BALL', strike: 'STRIKE!'};
      const TYPES = {fb: 'Fastball', cb: 'Curveball', ch: 'Change-up'};
      const g5 = api.grade >= 5;
      const WIN = [0.05, 0.08, 0.11, 0.14, 0.2].map(w => w*(g5 ? 0.85 : 1)); // hr, triple, double, single, foul (seconds)
      const isHit = o => o === 'hr' || o === 'triple' || o === 'double' || o === 'single';

      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.appendChild(cv);
      const cx = cv.getContext('2d');
      const bg = document.createElement('canvas'), bx = bg.getContext('2d');   // the static ballpark, drawn once per size
      const ui = document.createElement('div');
      ui.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none';
      el.appendChild(ui);

      let W = 0, H = 0, sc = 1, ox = 0, oy = 0, dpr = 1, raf = 0, last = 0, alive = true;
      const timers = new Set();
      const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms); timers.add(t); };

      // ---- state ----
      let mode = 'menu', pitch = 0, points = 0, hrs = 0, streak = 0, bestStreak = 0, results = [], phase = 'wait';
      let label = null, sub = null, popup = null, boardMsg = null, meter = null, pitchInfo = null, exitInfo = null;
      let t = 0, windup = 0, T = 1.2, type = 'fb', path = null, swing = null, flight = null, hop = 0, slow = 0, flash = 0;
      const ball = {X: 0, h: 0, d: REL_D, vis: 0, spin: 0};
      const track = [];                                    // where each pitch crossed the plate {X, h, o}
      let crossed = false;
      const trail = []; for (let i = 0; i < 18; i++) trail.push({X: 0, h: 0, d: 0}); let trailN = 0, trailI = 0;
      const sparks = []; for (let i = 0; i < 260; i++) sparks.push({x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, c: '#fff'});
      let sparkI = 0, fwLeft = 0, fwNext = 0;
      const HOME_F = [[14, 24], [7, 37], [-7, 37], [-14, 24], [-36, 72], [0, 84], [36, 72]];
      const fielders = HOME_F.map(([X, d]) => ({X, d, hx: X, hd: d, tx: X, td: d, run: false}));
      let chaser = null;

      const btn = (lab, primary) => `<button data-b="${lab}" style="pointer-events:auto;min-height:56px;min-width:200px;padding:10px 26px;border-radius:18px;border:2px solid ${primary ? C.accent : C.line};background:${primary ? C.accent : C.panel};color:${primary ? C.accentInk : C.ink};font:700 24px 'Baloo 2',sans-serif;cursor:pointer">${lab}</button>`;
      const card = html => { ui.innerHTML = `<div style="pointer-events:auto;background:${C.panel};color:${C.ink};border:2px solid ${C.line};border-radius:24px;padding:24px 30px;max-width:86%;text-align:center;font-family:Lexend,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:12px;align-items:center">${html}</div>`; };
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
        ui.innerHTML = ''; mode = 'play'; pitch = 0; points = 0; hrs = 0; streak = 0; bestStreak = 0; results = []; track.length = 0;
        el.dataset.points = 0; resetPitch();
      };
      const finish = () => {
        mode = 'over'; setPhase('over');
        const r = api.saveScore(points);
        const praise = hrs >= 4 || points >= 24 ? 'Slugger!' : points >= 10 ? 'Great hitting!' : 'Nice swings!';
        card(`<div style="font:800 32px 'Baloo 2',sans-serif">${praise}</div>
          <div style="font:800 52px 'Baloo 2',sans-serif;color:${C.accent}">${points} point${points === 1 ? '' : 's'}</div>
          <div style="color:${C.mut}">⚾ ${hrs} home run${hrs === 1 ? '' : 's'}${bestStreak >= 2 ? ` · 🔥 ${bestStreak} in a row` : ''}</div>
          ${r.isBest ? `<div style="font:800 26px 'Baloo 2',sans-serif;color:${C.good}">🏆 New best!</div>` : `<div style="color:${C.mut}">🏆 Best: ${r.best}</div>`}
          ${btn('Play again', true)}`);
      };
      const rnd = (a, b) => a + Math.random()*(b - a);
      const resetPitch = () => {
        Object.assign(ball, {X: 0.35, h: 1.9, d: REL_D, vis: 0, spin: 0});
        fielders.forEach(f => { f.X = f.hx; f.d = f.hd; f.tx = f.hx; f.td = f.hd; f.run = false; });
        chaser = null; flight = null; swing = null; label = null; sub = null; popup = null; hop = 0; slow = 0;
        meter = null; pitchInfo = null; exitInfo = null; crossed = false; trailN = 0;
        windup = rnd(0.9, 1.4); t = 0;
        // fastballs first; curveballs from pitch 4, change-ups from pitch 6 (pitch 8 is always one)
        type = pitch === 7 ? 'ch' : pitch >= 5 && Math.random() < 0.3 ? 'ch' : pitch >= 3 && Math.random() < 0.35 ? 'cb' : 'fb';
        const base = g5 ? 1.05 : 1.25;
        T = base*(1 - 0.03*pitch)*(type === 'ch' ? 1.45 : type === 'cb' ? 1.25 : 1);
        const fb = Math.round(72 + pitch*1.3 + (g5 ? 6 : 0) + rnd(-1, 1));
        path = {xe: rnd(-0.28, 0.28), he: rnd(0.6, 1.1), arc: type === 'cb' ? 0.75 : type === 'ch' ? 0.4 : 0.22,
          brk: type === 'cb' ? (Math.random() < 0.5 ? -1 : 1)*0.9 : 0,
          mph: type === 'fb' ? fb : type === 'cb' ? fb - 13 - Math.round(rnd(0, 3)) : fb - 17 - Math.round(rnd(0, 3))};
        el.dataset.ideal = Math.round(1000*T*(REL_D - HIT_D)/REL_D);
        el.dataset.type = type;
        setPhase('windup');
      };

      // ---- input: tap anywhere to swing ----
      const down = e => {
        if (mode !== 'play') return;
        e.preventDefault();
        if (swing || phase !== 'pitch') return;      // before the throw a tap does nothing
        swing = {t: 0};
        const err = t - T*(REL_D - HIT_D)/REL_D;   // + late, - early
        const a = Math.abs(err);
        meter = {err, t: 0};
        let o = a < WIN[0] ? 'hr' : a < WIN[1] ? 'triple' : a < WIN[2] ? 'double' : a < WIN[3] ? 'single' : a < WIN[4] ? 'foul' : 'strike';
        if (o === 'strike') { swing.miss = true; sub = err < 0 ? 'Too early' : 'Too late'; return; }
        if (!crossed) { crossed = true; track.push({X: ball.X, h: ball.h, o: null}); }
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
        const dist = {hr: rnd(118, 138), triple: rnd(82, 92), double: rnd(58, 72), single: rnd(26, 44), foul: rnd(35, 60)}[o];
        const dur = {hr: 2.6, triple: 2.1, double: 1.8, single: 1.1, foul: 1.5}[o];
        const peak = {hr: 34, triple: 15, double: 12, single: 3.5, foul: 22}[o];
        const velo = Math.round({hr: rnd(100, 112), triple: rnd(93, 99), double: rnd(88, 95), single: rnd(76, 88), foul: rnd(68, 86)}[o]);
        exitInfo = {velo, ft: Math.round(dist*3.281/5)*5, t: 0};
        const r = ang*Math.PI/180;
        flight = {o, t: 0, T: dur, peak, X0: ball.X, h0: ball.h, d0: ball.d, X1: dist*Math.sin(r), d1: dist*Math.cos(r), landed: false, roll: 0, rx: Math.sin(r), rd: Math.cos(r)};
        trailN = 0;
        if (o !== 'foul' && o !== 'hr') {
          let best = null, bd = 1e9;
          for (const f of fielders) { const dd = Math.hypot(f.X - flight.X1, f.d - flight.d1); if (dd < bd) { bd = dd; best = f; } }
          chaser = best; best.run = true; best.tx = flight.X1; best.td = flight.d1;
        }
        if (o === 'hr') {
          for (const f of fielders) if (f.hd > 60) { f.run = true; f.tx = f.hx + Math.sin(r)*6; f.td = 92; }
          if (!RM) { slow = 0.75; flash = 0.25; }                     // a short slow-motion moment off the bat
        }
      };
      const say = (text, color, life) => { label = {text, color, t: 0, life: life || 1.6}; };
      const settle = o => {
        let bonus = 0;
        if (isHit(o)) { streak++; if (streak >= 2) bonus = 1; bestStreak = Math.max(bestStreak, streak); } else streak = 0;
        const got = PTS[o] + bonus;
        results.push({o, got}); points += got; if (o === 'hr') hrs++;
        if (track.length && track[track.length - 1].o == null) track[track.length - 1].o = o;
        el.dataset.points = points; el.dataset.last = o; el.dataset.streak = streak;
        say(NAMES[o], o === 'hr' ? '#ffe14d' : o === 'strike' ? '#ffb0b0' : o === 'foul' ? '#ffffff' : '#9ff0b0', o === 'hr' ? 2.1 : 1.6);
        boardMsg = {o, t: 0};
        if (got) popup = {text: '+' + PTS[o] + (bonus ? ' +1🔥' : ''), t: 0};
        if (o === 'hr') { hop = 1; if (!RM) { api.confetti(40); fwLeft = 6; fwNext = 0; } }
        setPhase('result');
        later(() => { pitch++; if (pitch >= PITCHES) { setPhase('done'); later(finish, 500); } else resetPitch(); }, o === 'hr' ? 2200 : 1600);
      };

      // ---- fireworks over the video board ----
      const FW = ['#ffd84d', '#ff6b9a', '#7fd8ff', '#9dff8a', '#ffffff', '#ff9a3d'];
      const burst = () => {
        const x = rnd(170, 830), y = rnd(30, 120), c = FW[Math.floor(Math.random()*FW.length)], n = 36;
        for (let i = 0; i < n; i++) {
          const s = sparks[sparkI]; sparkI = (sparkI + 1) % sparks.length;
          const a = i/n*Math.PI*2, v = rnd(90, 160);
          s.x = x; s.y = y; s.vx = Math.cos(a)*v; s.vy = Math.sin(a)*v; s.max = s.life = rnd(0.9, 1.3); s.c = c;
        }
      };

      const update = rdt => {
        flash = Math.max(0, flash - rdt);
        if (slow > 0) slow = Math.max(0, slow - rdt);
        const dt = slow > 0 ? rdt*0.3 : rdt;
        if (mode === 'play') {
          if (phase === 'windup') {
            t += dt;
            if (t >= windup) { t = 0; ball.vis = 1; setPhase('pitch'); pitchInfo = {text: `${TYPES[type]} ${path.mph} mph`, t: 0}; }
          } else if (phase === 'pitch') {
            t += dt;
            const k = t/T, q = path;
            ball.d = REL_D*(1 - k);
            // a curveball swings out, then breaks back late; every pitch arcs a little and ends on its spot
            ball.X = 0.35*(1 - k) + q.xe*k + q.brk*(k - k*k*k)*0.75;
            ball.h = 1.9 + (q.he - 1.9)*k + q.arc*k*(1 - k)*(1 - k*0.6);
            ball.spin += dt*20;
            if (!crossed && ball.d <= 0) { crossed = true; track.push({X: ball.X, h: ball.h, o: null}); }
            if (ball.d < -1.6) { ball.vis = 0; if (!sub) sub = 'Swing!'; settle('strike'); }
          }
          if (flight && (phase === 'hit' || phase === 'result')) {
            const f = flight; f.t += dt;
            if (!f.landed) {
              const k = Math.min(1, f.t/f.T), e = 1 - (1 - k)*(1 - k)*0.35 - 0.65*(1 - k); // ease: fast off the bat
              ball.X = f.X0 + (f.X1 - f.X0)*e; ball.d = f.d0 + (f.d1 - f.d0)*e;
              ball.h = f.h0*(1 - k) + 4*f.peak*k*(1 - k);
              ball.spin += dt*25;
              const tp = trail[trailI]; tp.X = ball.X; tp.h = ball.h; tp.d = ball.d; trailI = (trailI + 1) % trail.length; trailN = Math.min(trail.length, trailN + 1);
              if (f.o === 'hr' && phase === 'hit' && ball.d > 96) settle('hr');
              if (k >= 1) {
                f.landed = true; ball.h = 0;
                if (f.o === 'hr') ball.vis = 0;
                else { f.roll = f.o === 'foul' ? 4 : f.o === 'single' ? 9 : 6; if (phase === 'hit') settle(f.o); }
              }
            } else {
              if (trailN > 0) trailN = Math.max(0, trailN - dt*30);
              if (f.roll > 0) {
                const sp = f.roll*dt; ball.X += f.rx*sp; ball.d += f.rd*sp; f.roll = Math.max(0, f.roll - dt*6);
                if (chaser) { chaser.tx = ball.X; chaser.td = ball.d; }
              }
            }
          }
          for (const f of fielders) if (f.run) {
            const dx = f.tx - f.X, dd = f.td - f.d, dist = Math.hypot(dx, dd), st = 9*dt;
            if (dist > 0.05) { const k = Math.min(1, st/dist); f.X += dx*k; f.d += dd*k; }
          }
          if (chaser && flight && flight.landed && Math.hypot(chaser.X - ball.X, chaser.d - ball.d) < 1.2) { ball.vis = 0; flight.roll = 0; }
          if (swing) swing.t += dt;
        }
        if (fwLeft > 0) { fwNext -= rdt; if (fwNext <= 0) { burst(); fwLeft--; fwNext = rnd(0.18, 0.32); } }
        for (const s of sparks) if (s.life > 0) { s.life -= rdt; s.x += s.vx*rdt; s.y += s.vy*rdt; s.vy += 120*rdt; s.vx *= 0.985; s.vy *= 0.985; }
        hop = Math.max(0, hop - rdt*0.6);
        if (label) { label.t += rdt; if (label.t > label.life) label = null; }
        if (popup) { popup.t += rdt; if (popup.t > 1.5) popup = null; }
        if (boardMsg) { boardMsg.t += rdt; if (boardMsg.t > (boardMsg.o === 'hr' ? 2.1 : 1.5)) boardMsg = null; }
        if (meter) meter.t += rdt;
        if (pitchInfo) pitchInfo.t += rdt;
        if (exitInfo) exitInfo.t += rdt;
      };

      // ---- the static ballpark (offscreen, redrawn only when the size changes) ----
      const fenceR = a => 98 - 6*Math.abs(a)/45;
      const fencePts = h => { const out = []; for (let a = -75; a <= 75; a += 5) { const r = a*Math.PI/180, R = Math.abs(a) <= 45 ? fenceR(a) : 92; out.push(P(R*Math.sin(r), h, R*Math.cos(r))); } return out; };
      const arcPts = (R, a0, a1, n) => { const out = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0)*i/n)*Math.PI/180; out.push(P(R*Math.sin(a), 0, R*Math.cos(a))); } return out; };
      const polyOn = (g, pts, fill) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.fillStyle = fill; g.fill(); };
      const rr = (g, x, y, w, h, r) => { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); };
      const TOWERS = [70, 930];
      const drawPark = g => {
        const left = -ox/sc, top = -oy/sc, wide = W/sc, tall = H/sc;
        // night sky and a few stars
        const sky = g.createLinearGradient(0, top, 0, 240); sky.addColorStop(0, '#040814'); sky.addColorStop(0.7, '#0e1a3a'); sky.addColorStop(1, '#22305a');
        g.fillStyle = sky; g.fillRect(left, top, wide, 260 - top);
        g.fillStyle = 'rgba(255,255,255,.7)';
        for (let i = 0; i < 70; i++) { const sx = left + ((i*137.5) % 1)*wide + (i*53) % wide, sy = top + ((i*71) % 100)/100*(150 - top); g.fillRect(sx % (left + wide), sy, 1.6, 1.6); }
        // stands: three tiers of fans, lit from the front
        const st = g.createLinearGradient(0, 140, 0, 240); st.addColorStop(0, '#1a2140'); st.addColorStop(1, '#2c3762');
        g.fillStyle = st; g.fillRect(left, 140, wide, 100);
        const fans = ['#ff6b6b', '#ffd84d', '#6be38f', '#7fb2ff', '#f2f2f2', '#ff9bd2', '#b48cff'];
        for (let r = 0; r < 3; r++) for (let x = left + (r % 2)*7; x < left + wide; x += 14) {
          g.fillStyle = fans[(Math.floor(x*7 + r*13) % fans.length + fans.length) % fans.length];
          g.globalAlpha = 0.55 + r*0.15; g.beginPath(); g.arc(x, 156 + r*16, 4.5, 0, 7); g.fill();
        }
        g.globalAlpha = 1;
        g.fillStyle = '#0b1024'; g.fillRect(left, 202, wide, 22);       // the LED ribbon's housing
        // light towers
        for (const tx of TOWERS) {
          g.fillStyle = '#2a3150'; g.fillRect(tx - 5, 40, 10, 200);
          rr(g, tx - 44, 18, 88, 44, 6); g.fillStyle = '#39405e'; g.fill();
          for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
            const lx = tx - 36 + c*14.4, ly = 26 + r*12.5;
            const gl = g.createRadialGradient(lx, ly, 0, lx, ly, 9); gl.addColorStop(0, 'rgba(255,252,230,1)'); gl.addColorStop(1, 'rgba(255,250,220,0)');
            g.fillStyle = gl; g.fillRect(lx - 9, ly - 9, 18, 18);
          }
        }
        // grass, lit brightest in the middle of the field
        g.fillStyle = '#1f6b31'; g.fillRect(left, 236, wide, top + tall - 236);
        polyOn(g, [P(-200, 0, 30), ...fencePts(0), P(200, 0, 30), P(200, 0, -6), P(-200, 0, -6)], '#2f9443');
        for (let i = 0; i < 9; i++) if (i % 2) polyOn(g, [P(0, 0, 0), ...arcPts(96, -45 + i*10, -35 + i*10, 3)], 'rgba(255,255,255,.06)');
        // outfield wall with a yellow top
        const top3 = fencePts(3.2), bot = fencePts(0);
        polyOn(g, [...bot, ...top3.slice().reverse()], '#123a2a');
        g.strokeStyle = '#ffd84d'; g.lineWidth = 3; g.beginPath(); top3.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke();
        // infield
        polyOn(g, [P(0, 0, -2.5), ...arcPts(29, -52, 52, 16)], '#c08452');
        polyOn(g, [P(0, 0, 2.6), P(16.8, 0, 19.4), P(0, 0, 36.2), P(-16.8, 0, 19.4)], '#36a14b');
        const m = P(0, 0, MOUND_D); g.fillStyle = '#c08452'; g.beginPath(); g.ellipse(m.x, m.y, 2.8*m.s, 1.1*m.s, 0, 0, 7); g.fill();
        g.fillStyle = '#fff'; g.fillRect(m.x - 0.45*m.s, m.y - 0.08*m.s, 0.9*m.s, 0.16*m.s);
        const hm = P(0, 0, 0);
        g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 3; g.beginPath();
        const fl = P(-fenceR(45)*0.7071, 0, fenceR(45)*0.7071), fr = P(fenceR(45)*0.7071, 0, fenceR(45)*0.7071);
        g.moveTo(hm.x, hm.y); g.lineTo(fl.x, fl.y); g.moveTo(hm.x, hm.y); g.lineTo(fr.x, fr.y); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,.75)';
        for (const sx of [-1, 1]) { const a = P(sx*0.45, 0, -0.9), b = P(sx*1.6, 0, -0.9), c = P(sx*1.6, 0, 0.9), d = P(sx*0.45, 0, 0.9);
          g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.stroke(); }
        for (const b of [P(19.4, 0, 19.4), P(0, 0, 38.8), P(-19.4, 0, 19.4)]) { g.fillStyle = '#fff'; g.fillRect(b.x - 0.5*b.s, b.y - 0.22*b.s, b.s, 0.44*b.s); }
        polyOn(g, [P(-0.22, 0, 0.2), P(0.22, 0, 0.2), P(0.22, 0, 0), P(0, 0, -0.22), P(-0.22, 0, 0)], '#fff');
        // soft beams from the towers, and a pool of light on the field
        g.save(); g.globalCompositeOperation = 'lighter';
        for (const tx of TOWERS) {
          const tgt = tx < MIDX ? 560 : 440, gr = g.createLinearGradient(tx, 40, tgt, 520);
          gr.addColorStop(0, 'rgba(255,248,210,.16)'); gr.addColorStop(1, 'rgba(255,248,210,0)');
          g.fillStyle = gr; g.beginPath(); g.moveTo(tx - 30, 50); g.lineTo(tx + 30, 50); g.lineTo(tgt + 220, 560); g.lineTo(tgt - 220, 560); g.closePath(); g.fill();
        }
        const pool = g.createRadialGradient(MIDX, 420, 30, MIDX, 420, 520); pool.addColorStop(0, 'rgba(255,250,225,.16)'); pool.addColorStop(1, 'rgba(255,250,225,0)');
        g.fillStyle = pool; g.fillRect(left, 230, wide, top + tall - 230);
        g.restore();
        // a vignette keeps the eye on the field
        const vg = g.createRadialGradient(MIDX, 380, 260, MIDX, 380, 760); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,10,.45)');
        g.fillStyle = vg; g.fillRect(left, top, wide, tall);
      };
      const size = () => {
        const r = el.getBoundingClientRect(); dpr = window.devicePixelRatio || 1;
        W = Math.max(1, r.width); H = Math.max(1, r.height);
        cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
        bg.width = cv.width; bg.height = cv.height;
        sc = Math.min(W/LW, H/LH); ox = (W - LW*sc)/2; oy = (H - LH*sc)/2;
        bx.setTransform(dpr*sc, 0, 0, dpr*sc, dpr*ox, dpr*oy);
        drawPark(bx);
      };
      size(); window.addEventListener('resize', size);

      // ---- drawing (every frame) ----
      const text = (s, x, y, size, color, align, weight) => {
        cx.font = `${weight || 800} ${size}px "Baloo 2", sans-serif`; cx.textAlign = align || 'center'; cx.textBaseline = 'middle';
        cx.lineWidth = size/6; cx.lineJoin = 'round'; cx.strokeStyle = 'rgba(6,12,28,.9)'; cx.strokeText(s, x, y);
        cx.fillStyle = color; cx.fillText(s, x, y);
      };
      const plain = (s, x, y, size, color, align) => { cx.font = `800 ${size}px "Baloo 2", sans-serif`; cx.textAlign = align || 'center'; cx.textBaseline = 'middle'; cx.fillStyle = color; cx.fillText(s, x, y); };
      const ribbonMsg = '★ PAGE QUEST BALLPARK ★ NIGHT GAME ★ SWING FOR THE FENCES ★ ';
      const drawRibbon = now => {
        const left = -ox/sc, wide = W/sc;
        cx.save(); cx.beginPath(); cx.rect(left, 204, wide, 18); cx.clip();
        const g = cx.createLinearGradient(0, 204, 0, 222); g.addColorStop(0, '#1a0a00'); g.addColorStop(1, '#2a1200'); cx.fillStyle = g; cx.fillRect(left, 204, wide, 18);
        cx.font = '800 15px "Baloo 2", sans-serif'; cx.textAlign = 'left'; cx.textBaseline = 'middle';
        const msg = streak >= 2 && mode === 'play' ? `🔥 ON FIRE  ×${streak}  🔥 ` : ribbonMsg;
        const mw = cx.measureText(msg).width, off = RM ? 0 : (now/1000*70) % mw;
        cx.fillStyle = streak >= 2 && mode === 'play' ? '#ff9a3d' : '#ffb347';
        for (let x = left - off; x < left + wide; x += mw) cx.fillText(msg, x, 214);
        cx.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 205; y < 222; y += 3) cx.fillRect(left, y, wide, 1);   // LED rows
        cx.restore();
      };
      const DOT = o => o === 'hr' ? '#ffd84d' : o === 'strike' ? '#ff5a5a' : o === 'foul' ? '#9aa6b6' : '#38d36b';
      const drawBoard = now => {
        const x = 330, y = 18, w = 340, h = 140;
        cx.fillStyle = '#20263d'; cx.fillRect(x + 40, y + h, 14, 46); cx.fillRect(x + w - 54, y + h, 14, 46);   // supports
        cx.save(); cx.shadowColor = 'rgba(0,0,0,.6)'; cx.shadowBlur = 18; cx.shadowOffsetY = 6;
        rr(cx, x, y, w, h, 10); cx.fillStyle = '#1b2033'; cx.fill(); cx.restore();
        const ix = x + 8, iy = y + 8, iw = w - 16, ih = h - 16;
        const sg = cx.createLinearGradient(0, iy, 0, iy + ih); sg.addColorStop(0, '#060a16'); sg.addColorStop(1, '#0c1430');
        rr(cx, ix, iy, iw, ih, 6); cx.fillStyle = sg; cx.fill();
        if (boardMsg && mode !== 'menu') {
          const o = boardMsg.o, hr = o === 'hr';
          if (hr && !RM) { cx.fillStyle = Math.floor(now/140) % 2 ? 'rgba(255,216,77,.25)' : 'rgba(255,90,140,.22)'; rr(cx, ix, iy, iw, ih, 6); cx.fill(); }
          const col = hr ? (!RM && Math.floor(now/140) % 2 ? '#ff7aa8' : '#ffe14d') : o === 'strike' ? '#ff7070' : o === 'foul' ? '#e6ecf5' : '#7dff9c';
          text(BOARD[o], MIDX, iy + ih/2 - (streak >= 2 && isHit(o) ? 12 : 0), hr ? 50 : 44, col);
          if (streak >= 2 && isHit(o)) text(`🔥 On fire! ×${streak}`, MIDX, iy + ih - 22, 24, '#ffb347');
        } else {
          plain(`PTS ${points}`, ix + 14, iy + 24, 26, '#ffe14d', 'left');
          plain(`HR ${hrs}`, MIDX, iy + 24, 26, '#ffffff');
          plain(`P ${Math.min(pitch + 1, PITCHES)}/${PITCHES}`, ix + iw - 14, iy + 24, 26, '#ffffff', 'right');
          for (let i = 0; i < PITCHES; i++) {
            const dx = MIDX - 4.5*29 + i*29, dy = iy + 60, r = results[i];
            cx.fillStyle = r ? DOT(r.o) : 'rgba(255,255,255,.18)'; cx.beginPath(); cx.arc(dx, dy, 11, 0, 7); cx.fill();
            if (r && r.got) plain(String(r.got), dx, dy + 1, 15, '#0a1430');
          }
          if (streak >= 2) plain(`🔥 Streak ×${streak}`, MIDX, iy + ih - 18, 22, '#ffb347');
          else plain(mode === 'play' ? 'HOME RUN DERBY' : 'PAGE QUEST PARK', MIDX, iy + ih - 18, 18, 'rgba(160,190,255,.75)');
        }
        // pixel grid shimmer
        cx.fillStyle = 'rgba(0,0,0,.18)'; for (let yy = iy; yy < iy + ih; yy += 3) cx.fillRect(ix, yy, iw, 1);
      };
      const person = (X, d, shirt, cap, glove) => {
        const p = P(X, 0, d), u = p.s;
        cx.fillStyle = 'rgba(0,0,0,.28)'; cx.beginPath(); cx.ellipse(p.x, p.y, 0.45*u, 0.14*u, 0, 0, 7); cx.fill();
        cx.fillStyle = '#d9dbe4'; cx.fillRect(p.x - 0.22*u, p.y - 0.9*u, 0.17*u, 0.9*u); cx.fillRect(p.x + 0.05*u, p.y - 0.9*u, 0.17*u, 0.9*u);
        cx.fillStyle = shirt; rr(cx, p.x - 0.3*u, p.y - 1.55*u, 0.6*u, 0.72*u, 0.12*u); cx.fill();
        cx.fillStyle = '#c98a5a'; cx.beginPath(); cx.arc(p.x, p.y - 1.72*u, 0.17*u, 0, 7); cx.fill();
        cx.fillStyle = cap; cx.beginPath(); cx.arc(p.x, p.y - 1.76*u, 0.18*u, Math.PI, 0); cx.fill(); cx.fillRect(p.x - 0.02*u, p.y - 1.78*u, 0.3*u, 0.06*u);
        if (glove) { cx.fillStyle = '#7a4a22'; cx.beginPath(); cx.arc(p.x - 0.38*u, p.y - 1.2*u, 0.13*u, 0, 7); cx.fill(); }
      };
      const drawPitcher = () => {
        const p = P(0, 0, MOUND_D), u = p.s;
        person(0, MOUND_D, '#d0d4de', '#b3283a', true);
        let a = -0.3;
        if (mode === 'play' && phase === 'windup') { const k = t/windup; a = k < 0.7 ? -0.3 - 2.4*(k/0.7) : -2.7 + 3.2*((k - 0.7)/0.3); }
        else if (phase === 'pitch' && t < 0.25) a = 0.5;
        const sx = p.x + 0.28*u, sy = p.y - 1.45*u, len = 0.62*u;
        cx.strokeStyle = '#d0d4de'; cx.lineWidth = 0.14*u; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(sx, sy); cx.lineTo(sx + Math.cos(a)*len, sy + Math.sin(a)*len); cx.stroke(); cx.lineCap = 'butt';
        if (phase === 'windup') { cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(sx + Math.cos(a)*len, sy + Math.sin(a)*len, 0.1*u, 0, 7); cx.fill(); }
      };
      const drawTrail = () => {
        if (trailN < 2) return;
        const n = Math.floor(trailN);
        cx.lineCap = 'round';
        let prev = null;
        for (let i = n; i >= 1; i--) {
          const q = trail[(trailI - i + trail.length*2) % trail.length], p = P(q.X, q.h, q.d);
          if (prev) { const a = 1 - i/n; cx.strokeStyle = `rgba(255,236,170,${(a*0.75).toFixed(3)})`; cx.lineWidth = Math.max(1.5, 0.22*p.s)*(0.4 + a*0.6); cx.beginPath(); cx.moveTo(prev.x, prev.y); cx.lineTo(p.x, p.y); cx.stroke(); }
          prev = p;
        }
        cx.lineCap = 'butt';
      };
      const drawBall = () => {
        if (!ball.vis) return;
        const p = P(ball.X, ball.h, ball.d), g = P(ball.X, 0, ball.d), r = Math.max(2.5, 0.28*p.s);
        cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(g.x, g.y, r*1.1, r*0.35, 0, 0, 7); cx.fill();
        cx.save(); cx.translate(p.x, p.y);
        const gl = cx.createRadialGradient(-r*0.35, -r*0.35, r*0.1, 0, 0, r); gl.addColorStop(0, '#ffffff'); gl.addColorStop(1, '#d9dde6');
        cx.fillStyle = gl; cx.beginPath(); cx.arc(0, 0, r, 0, 7); cx.fill();
        cx.rotate(ball.spin);
        cx.strokeStyle = '#d33'; cx.lineWidth = Math.max(1, r*0.12);
        cx.beginPath(); cx.arc(-r*1.15, 0, r*0.85, -0.8, 0.8); cx.stroke();
        cx.beginPath(); cx.arc(r*1.15, 0, r*0.85, Math.PI - 0.8, Math.PI + 0.8); cx.stroke();
        cx.restore();
      };
      // the child's player: helmet, jersey with their avatar as the team logo, pants, cleats and a bat
      const drawBatter = () => {
        const p = P(-1.3, 0, 0.1), u = p.s*1.25, jump = hop ? Math.abs(Math.sin(hop*14))*0.3*u*hop : 0;
        const fx = p.x, fy = p.y - jump;
        const k = swing ? Math.min(1, swing.t/0.16) : 0, e = 1 - (1 - k)*(1 - k);
        cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(fx, p.y, 0.62*u, 0.15*u, 0, 0, 7); cx.fill();
        // legs: wide stance, front foot strides on the swing
        const hipY = fy - 0.95*u, stride = e*0.12*u;
        cx.strokeStyle = '#e9ecf3'; cx.lineWidth = 0.2*u; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(fx - 0.12*u, hipY); cx.lineTo(fx - 0.3*u, fy - 0.1*u); cx.stroke();
        cx.beginPath(); cx.moveTo(fx + 0.12*u, hipY); cx.lineTo(fx + 0.32*u + stride, fy - 0.1*u); cx.stroke();
        cx.strokeStyle = 'rgba(31,111,235,.9)'; cx.lineWidth = 0.04*u;
        cx.beginPath(); cx.moveTo(fx - 0.2*u, hipY); cx.lineTo(fx - 0.37*u, fy - 0.12*u); cx.stroke();
        cx.fillStyle = '#14161f';
        rr(cx, fx - 0.46*u, fy - 0.14*u, 0.3*u, 0.14*u, 0.05*u); cx.fill();
        rr(cx, fx + 0.2*u + stride, fy - 0.14*u, 0.32*u, 0.14*u, 0.05*u); cx.fill();
        // body turns a little with the swing
        const tw = e*0.18;
        cx.save(); cx.translate(fx, hipY); cx.rotate(tw);
        const jg = cx.createLinearGradient(-0.34*u, 0, 0.34*u, 0); jg.addColorStop(0, '#1854bd'); jg.addColorStop(0.5, '#2a78f0'); jg.addColorStop(1, '#1854bd');
        cx.fillStyle = jg; rr(cx, -0.33*u, -0.68*u, 0.66*u, 0.74*u, 0.16*u); cx.fill();
        cx.fillStyle = '#10204a'; cx.fillRect(-0.33*u, -0.02*u, 0.66*u, 0.08*u);                   // belt
        cx.strokeStyle = '#ffffff'; cx.lineWidth = 0.025*u; cx.beginPath(); cx.moveTo(0, -0.66*u); cx.lineTo(0, -0.05*u); cx.stroke();
        cx.fillStyle = 'rgba(255,255,255,.92)'; cx.beginPath(); cx.arc(0, -0.38*u, 0.2*u, 0, 7); cx.fill();
        cx.font = `${0.3*u}px sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#000';
        cx.fillText(api.avatar || '🙂', 0, -0.36*u);                                              // team logo
        cx.restore();
        // head and helmet
        const hx0 = fx + 0.06*u + tw*0.6*u, hy0 = hipY - 0.86*u;
        cx.fillStyle = '#e0a477'; cx.beginPath(); cx.arc(hx0, hy0, 0.17*u, 0, 7); cx.fill();
        const hg = cx.createLinearGradient(hx0, hy0 - 0.25*u, hx0, hy0 + 0.05*u); hg.addColorStop(0, '#3d7df5'); hg.addColorStop(1, '#0f3a8c');
        cx.fillStyle = hg; cx.beginPath(); cx.arc(hx0 - 0.01*u, hy0 - 0.03*u, 0.2*u, Math.PI*0.95, Math.PI*2.05); cx.fill();
        cx.fillRect(hx0 + 0.05*u, hy0 - 0.06*u, 0.25*u, 0.06*u);                                   // brim
        cx.beginPath(); cx.ellipse(hx0 - 0.14*u, hy0 + 0.02*u, 0.08*u, 0.11*u, 0, 0, 7); cx.fill();  // ear flap
        cx.fillStyle = 'rgba(255,255,255,.45)'; cx.beginPath(); cx.ellipse(hx0 - 0.06*u, hy0 - 0.15*u, 0.08*u, 0.035*u, -0.3, 0, 7); cx.fill();
        cx.fillStyle = '#222'; cx.beginPath(); cx.arc(hx0 + 0.09*u, hy0 + 0.02*u, 0.025*u, 0, 7); cx.fill();
        // hands: back at the shoulder, then through the zone
        const hx = fx + (0.12 + 0.3*e)*u, hy = hipY - (0.62 - 0.32*e)*u;
        const shX = fx + 0.24*u + tw*0.3*u, shY = hipY - 0.6*u;
        cx.strokeStyle = '#2a78f0'; cx.lineWidth = 0.13*u; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(fx - 0.22*u, shY); cx.lineTo(hx, hy); cx.stroke();
        cx.beginPath(); cx.moveTo(shX, shY); cx.lineTo(hx, hy); cx.stroke();
        cx.lineCap = 'butt';
        let a = -2.0 + 2.85*e;
        const L = 1.55*u;
        cx.save(); cx.translate(hx, hy); cx.rotate(a);
        const bg2 = cx.createLinearGradient(0, -0.1*u, 0, 0.1*u); bg2.addColorStop(0, '#e2b07a'); bg2.addColorStop(1, '#9a6230');
        cx.fillStyle = bg2; cx.strokeStyle = '#5e3a18'; cx.lineWidth = 1.5;
        cx.beginPath(); cx.moveTo(-0.08*u, -0.035*u); cx.lineTo(L*0.45, -0.045*u); cx.quadraticCurveTo(L, -0.12*u, L, 0); cx.quadraticCurveTo(L, 0.12*u, L*0.45, 0.045*u); cx.lineTo(-0.08*u, 0.035*u); cx.closePath(); cx.fill(); cx.stroke();
        cx.restore();
        cx.fillStyle = '#f2f2f2'; cx.beginPath(); cx.arc(hx, hy, 0.09*u, 0, 7); cx.fill();         // batting gloves
      };
      const chip = (s, x, y, size, color, accent) => {
        cx.font = `800 ${size}px "Baloo 2", sans-serif`; const w = cx.measureText(s).width + 30, h = size + 16;
        cx.save(); cx.shadowColor = 'rgba(0,0,0,.45)'; cx.shadowBlur = 10; cx.shadowOffsetY = 3;
        rr(cx, x, y, w, h, 10); cx.fillStyle = 'rgba(8,14,32,.86)'; cx.fill(); cx.restore();
        cx.fillStyle = accent; rr(cx, x, y, 7, h, 3); cx.fill();
        cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillStyle = color; cx.fillText(s, x + 18, y + h/2 + 1);
      };
      const drawTracker = () => {
        const x = 846, y = 480, w = 136, h = 172;
        cx.save(); cx.shadowColor = 'rgba(0,0,0,.45)'; cx.shadowBlur = 10; rr(cx, x, y, w, h, 12); cx.fillStyle = 'rgba(8,14,32,.84)'; cx.fill(); cx.restore();
        plain('PITCH TRACK', x + w/2, y + 15, 14, 'rgba(180,200,240,.9)');
        // view box: X -0.6..0.6, h 0.25..1.55; zone X ±0.25, h 0.5..1.2
        const bx0 = x + 10, by0 = y + 30, bw = w - 20, bh = h - 40;
        const mx = X => bx0 + (X + 0.6)/1.2*bw, my = hh => by0 + (1.55 - hh)/1.3*bh;
        cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.lineWidth = 2; cx.strokeRect(mx(-0.25), my(1.2), mx(0.25) - mx(-0.25), my(0.5) - my(1.2));
        cx.strokeStyle = 'rgba(255,255,255,.25)'; cx.lineWidth = 1; cx.beginPath();
        for (let i = 1; i < 3; i++) { const gx = mx(-0.25 + 0.5*i/3), gy = my(1.2 - 0.7*i/3); cx.moveTo(gx, my(1.2)); cx.lineTo(gx, my(0.5)); cx.moveTo(mx(-0.25), gy); cx.lineTo(mx(0.25), gy); }
        cx.stroke();
        for (let i = 0; i < track.length; i++) {
          const q = track[i], px = mx(Math.max(-0.58, Math.min(0.58, q.X))), py = my(Math.max(0.27, Math.min(1.53, q.h))), lastOne = i === track.length - 1;
          cx.fillStyle = q.o ? DOT(q.o) : '#ffffff'; cx.globalAlpha = lastOne ? 1 : 0.55;
          cx.beginPath(); cx.arc(px, py, lastOne ? 9 : 7, 0, 7); cx.fill();
          plain(String(i + 1), px, py + 1, lastOne ? 12 : 10, '#0a1430');
        }
        cx.globalAlpha = 1;
      };
      const drawMeter = () => {
        const cxm = MIDX, y = 668, half = 150, R = 0.26, m = meter;
        const mx = e => cxm + Math.max(-1, Math.min(1, e/R))*half;
        const fade = Math.min(1, (2.2 - m.t)*3); if (fade <= 0) return;
        cx.globalAlpha = Math.max(0, fade);
        cx.save(); cx.shadowColor = 'rgba(0,0,0,.45)'; cx.shadowBlur = 10; rr(cx, cxm - half - 66, y - 20, 2*half + 132, 40, 12); cx.fillStyle = 'rgba(8,14,32,.84)'; cx.fill(); cx.restore();
        const seg = (a, b, col) => { cx.fillStyle = col; cx.fillRect(mx(a), y - 7, mx(b) - mx(a), 14); };
        seg(-R, -WIN[4], '#c8443f'); seg(-WIN[4], -WIN[3], '#e08a3a'); seg(-WIN[3], -WIN[0], '#3fbf63');
        seg(-WIN[0], WIN[0], '#ffd84d');
        seg(WIN[0], WIN[3], '#3fbf63'); seg(WIN[3], WIN[4], '#e08a3a'); seg(WIN[4], R, '#c8443f');
        plain('Early', cxm - half - 34, y + 1, 17, '#ffb3a8'); plain('Late', cxm + half + 34, y + 1, 17, '#ffb3a8');
        const px = mx(m.err), perfect = Math.abs(m.err) < WIN[0];
        cx.fillStyle = '#ffffff'; cx.fillRect(px - 2, y - 15, 4, 30);
        cx.beginPath(); cx.moveTo(px - 9, y - 24); cx.lineTo(px + 9, y - 24); cx.lineTo(px, y - 14); cx.closePath(); cx.fill();
        text(perfect ? 'Perfect!' : m.err < 0 ? 'Early' : 'Late', cxm, y - 40, 28, perfect ? '#ffe14d' : '#ffffff');
        cx.globalAlpha = 1;
      };
      const draw = now => {
        cx.setTransform(1, 0, 0, 1, 0, 0);
        cx.drawImage(bg, 0, 0);
        cx.setTransform(dpr*sc, 0, 0, dpr*sc, dpr*ox, dpr*oy);
        // fireworks sit behind the video board
        for (const s of sparks) if (s.life > 0) { cx.globalAlpha = Math.min(1, s.life/s.max*1.4); cx.fillStyle = s.c; cx.fillRect(s.x - 2, s.y - 2, 4, 4); }
        cx.globalAlpha = 1;
        drawBoard(now);
        drawRibbon(now);
        const far = fielders.filter(f => f.d > MOUND_D).sort((a, b) => b.d - a.d);
        for (const f of far) person(f.X, f.d, '#d0d4de', '#b3283a', true);
        const ballFar = ball.d > MOUND_D;
        if (ballFar) { drawTrail(); drawBall(); }
        drawPitcher();
        for (const f of fielders) if (f.d <= MOUND_D) person(f.X, f.d, '#d0d4de', '#b3283a', true);
        if (!ballFar) { drawTrail(); drawBall(); }
        drawBatter();
        if (mode === 'play' && pitch === 0 && (phase === 'windup' || phase === 'pitch') && !swing) {
          const k = (now/900) % 1;
          text('Tap to swing!', MIDX, 668, 34, '#ffffff');
          cx.globalAlpha = 0.6 + 0.4*Math.sin(k*6.28); cx.font = '44px sans-serif'; cx.textAlign = 'center'; cx.fillText('👆', MIDX + 190, 668); cx.globalAlpha = 1;
        }
        if (mode !== 'menu') {
          if (pitchInfo && mode === 'play') chip(pitchInfo.text, 18, 526, 22, '#ffffff', type === 'fb' ? '#ff5a5a' : type === 'cb' ? '#7fd8ff' : '#9dff8a');
          if (exitInfo && exitInfo.t > 0.15 && mode === 'play') chip(`Exit velo ${exitInfo.velo} mph · ${exitInfo.ft} ft`, 18, 576, 22, '#ffe9a8', '#ffd84d');
          drawTracker();
          if (meter) drawMeter();
        }
        if (label) {
          const k = label.t/label.life, s = RM ? 1 : 1 + Math.max(0, 0.3 - k)*1.2;
          cx.globalAlpha = Math.min(1, (1 - k)*3); text(label.text, MIDX, 330, 60*s, label.color);
          if (sub && label.color === '#ffb0b0') text(sub, MIDX, 384, 28, '#ffffff');
          else if (streak >= 2 && results.length && isHit(results[results.length - 1].o)) text('🔥 On fire!', MIDX, 386, 32, '#ffb347');
          cx.globalAlpha = 1;
        }
        if (popup) { cx.globalAlpha = Math.max(0, 1 - popup.t/1.5); text(popup.text, MIDX + 210, 290 - popup.t*30, 40, '#ffe14d'); cx.globalAlpha = 1; }
        if (flash > 0) { cx.setTransform(1, 0, 0, 1, 0, 0); cx.fillStyle = `rgba(255,255,240,${(flash*1.6).toFixed(3)})`; cx.fillRect(0, 0, cv.width, cv.height); }
      };
      const frame = now => {
        const dt = Math.min(0.033, (now - (last || now))/1000); last = now;
        update(dt); draw(now);
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
