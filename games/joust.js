// Jousting: two knights charge down the tilt fence. Hold to gallop faster (more power, wobblier aim),
// and slide your finger up or down (or tap a target) to aim high, middle or low. Your shield covers
// the height you aim at, so aim where the other knight is NOT. 1 player vs the computer, or 2 players.
(function(){
  window.BreakGames = window.BreakGames || {};
  window.BreakGames.joust = {
    start(el, api){
      const C = api.colors, RM = api.reducedMotion;
      const LW = 1000, LH = 700;
      const BASE = [430, 565];                       // ground line (hooves) of each lane: left rides behind the fence
      const ZONE = [-160, -124, -92];                // high (head), mid (shield), low (body), from the hooves
      const ZNAME = ['High', 'Middle', 'Low'];
      const START = [120, 880], MEET = 150, WIN_PTS = 5, PASSES = 5, POWER = 0.55;
      const TEAM = [{c: '#2f6fd6', d: '#1d4a99', l: '#9cc3ff'}, {c: '#d63a3a', d: '#962222', l: '#ffb0a8'}];

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
        W = Math.max(1, r.width); H = Math.max(1, r.height);
        cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
        sc = Math.min(W/LW, H/LH); ox = (W - LW*sc)/2; oy = (H - LH*sc)/2;
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      size(); window.addEventListener('resize', size);

      // ---- crowd (fixed random look) ----
      const crowd = [];
      { let s = 7; const rnd = () => (s = (s*16807) % 2147483647)/2147483647;
        const cols = ['#e8b04a', '#d9534f', '#5b8def', '#7cc576', '#b07cd8', '#f08a5d', '#f4d35e', '#6cc4d8'];
        for (let row = 0; row < 4; row++) for (let i = 0; i < 34; i++) crowd.push({x: 18 + i*28.5 + (row % 2)*14 + rnd()*6, y: 228 + row*26, c: cols[Math.floor(rnd()*cols.length)], ph: rnd()*6.28}); }

      // ---- state ----
      let mode = 'menu', players = 1, level = api.grade >= 5 ? 'normal' : 'easy';
      let score = [0, 0], pass = 0, phase = 'ready', pt = 0, labels = [], parts = [], endWhy = '';
      const mkK = side => ({side, x: START[side], aim: 1, sp: 0.25, hold: 0, gait: 0, lance: 1, on: true, fall: null, done: false});
      const K = [mkK(0), mkK(1)];
      const ai = {target: 0.5, decided: false};
      const ptrs = new Map();                        // pointerId -> side
      el._jo = () => ({mode, phase, score: score.slice(), pass, players, K: K.map(k => ({x: k.x, aim: k.aim, sp: k.sp, on: k.on})), targets: [0, 1].map(s => [0, 1, 2].map(z => tgt(s, z)))});

      // ---- overlay screens ----
      const btn = (lab, attr, on, big) => `<button ${attr} style="pointer-events:auto;min-height:${big ? 60 : 52}px;min-width:${big ? 220 : 120}px;padding:8px 20px;border-radius:16px;border:2px solid ${on ? C.accent : C.line};background:${on ? C.accent : C.panel};color:${on ? C.accentInk : C.ink};font:700 ${big ? 26 : 20}px 'Baloo 2',sans-serif;cursor:pointer">${lab}</button>`;
      const card = html => { ui.innerHTML = `<div style="pointer-events:auto;background:${C.panel};color:${C.ink};border:2px solid ${C.line};border-radius:24px;padding:22px 26px;max-width:90%;text-align:center;font-family:Lexend,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:12px;align-items:center">${html}</div>`; };
      const row = h => `<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${h}</div>`;
      const onUi = e => {
        const b = e.target.closest('button'); if (!b) return; e.preventDefault();
        if (b.dataset.m) { players = +b.dataset.m; menu(); }
        else if (b.dataset.d) { level = b.dataset.d; menu(); }
        else if (b.dataset.b === 'Menu') menu();
        else if (b.dataset.b) begin();
      };
      ui.addEventListener('click', onUi);
      const menu = () => {
        mode = 'menu';
        card(`<div style="font-size:50px;line-height:1">🐴</div><div style="font:800 32px 'Baloo 2',sans-serif">Jousting</div>
          <div style="color:${C.mut};font-size:16px;max-width:420px">Hold to gallop. Slide up or down to aim.<br>Hit where their shield isn't!</div>
          ${row(btn('1 player (vs computer)', 'data-m="1"', players === 1) + btn('2 players (same iPad)', 'data-m="2"', players === 2))}
          ${players === 1 ? row(btn('Easy', 'data-d="easy"', level === 'easy') + btn('Tricky', 'data-d="normal"', level === 'normal')) : `<div style="color:${C.mut};font-size:15px">Left side rides the blue knight, right side the red knight.</div>`}
          ${players === 1 && api.best != null ? `<div style="color:${C.mut}">🏆 Best: ${api.best} points</div>` : ''}
          ${btn('Play', 'data-b="Play"', true, true)}`);
      };
      const begin = () => {
        ui.innerHTML = ''; mode = 'play'; score = [0, 0]; pass = 0; labels = []; parts = []; ptrs.clear();
        newPass();
      };
      const newPass = () => {
        pass++; phase = 'ready'; pt = 0;
        for (let s = 0; s < 2; s++) { const keep = K[s].aim; K[s] = mkK(s); K[s].aim = keep; }
        ai.decided = false; ai.target = level === 'easy' ? 0.3 + Math.random()*0.32 : 0.45 + Math.random()*0.4;
        if (players === 1) K[1].aim = Math.floor(Math.random()*3);
        for (const [id, s] of ptrs) K[s].hold++;
        say(`Pass ${pass} of ${PASSES}`, LW/2, 150, '#ffffff', 1.4, 44);
      };
      const finish = winner => {
        mode = 'over'; ptrs.clear();
        let html;
        if (players === 1) {
          const won = winner === 0, pts = score[0] + (won ? 5 : 0);
          const r = api.saveScore(pts);
          if (won && !RM) api.confetti(40);
          html = `<div style="font-size:46px;line-height:1">${won ? '🏆' : winner === 1 ? '🐴' : '🤝'}</div>
            <div style="font:800 32px 'Baloo 2',sans-serif">${won ? 'You win the joust!' : winner === 1 ? 'The computer wins!' : "It's a tie!"}</div>
            <div style="color:${C.mut}">${endWhy} · ${score[0]} – ${score[1]}</div>
            <div style="font:800 50px 'Baloo 2',sans-serif;color:${C.accent}">${pts} points</div>
            ${won ? `<div style="color:${C.mut};font-size:15px">${score[0]} for hits + 5 for winning</div>` : ''}
            ${r.isBest ? `<div style="font:800 26px 'Baloo 2',sans-serif;color:${C.good}">🏆 New best!</div>` : `<div style="color:${C.mut}">🏆 Best: ${r.best}</div>`}`;
        } else {
          if (winner >= 0 && !RM) api.confetti(40);
          html = `<div style="font-size:46px;line-height:1">${winner < 0 ? '🤝' : '🏆'}</div>
            <div style="font:800 32px 'Baloo 2',sans-serif;color:${winner < 0 ? C.ink : TEAM[winner].c}">${winner < 0 ? "It's a tie!" : `${winner ? 'Red' : 'Blue'} knight wins!`}</div>
            <div style="color:${C.mut}">${endWhy}</div>
            <div style="font:800 46px 'Baloo 2',sans-serif"><span style="color:${TEAM[0].c}">${score[0]}</span> – <span style="color:${TEAM[1].c}">${score[1]}</span></div>`;
        }
        card(html + row(btn('Play again', 'data-b="Play again"', true, true) + btn('Change mode', 'data-b="Menu"', false, true)));
      };

      // ---- labels & bits ----
      const say = (text, x, y, color, life, size) => labels.push({text, x, y, color, t: 0, life: life || 1.6, size: size || 40});
      const burst = (x, y, n, color, kind) => {
        for (let i = 0; i < n; i++) {
          const a = Math.random()*6.28, v = 120 + Math.random()*260;
          parts.push({x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v - 120, r: Math.random()*6.28, vr: (Math.random() - 0.5)*14, t: 0, life: 1 + Math.random()*0.6, color, kind});
        }
      };

      // ---- controls: targets live in screen space at each side's outer edge ----
      function tgt(side, z){
        const r = Math.max(30, Math.min(46, H*0.06)), gap = r*2 + 14;
        const cy = H*0.5 + (z - 1)*gap + Math.min(40, H*0.05);
        const x = side ? W - 14 - r : 14 + r;
        return {x, y: cy, r};
      }
      const sideOf = x => players === 1 ? 0 : (x < W/2 ? 0 : 1);
      const aimFrom = (side, y) => {
        let best = 1, bd = 1e9;
        for (let z = 0; z < 3; z++) { const d = Math.abs(tgt(side, z).y - y); if (d < bd) { bd = d; best = z; } }
        return best;
      };
      const local = e => { const r = cv.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
      const canSteer = () => mode === 'play' && (phase === 'ready' || phase === 'charge');
      const down = e => {
        if (mode !== 'play') return;
        e.preventDefault();
        const p = local(e), s = sideOf(p.x);
        ptrs.set(e.pointerId, s); K[s].hold++;
        try { cv.setPointerCapture(e.pointerId); } catch (_) {}
        if (canSteer()) K[s].aim = aimFrom(s, p.y);
      };
      const move = e => {
        if (!ptrs.has(e.pointerId)) return;
        const s = ptrs.get(e.pointerId);
        if (canSteer()) K[s].aim = aimFrom(s, local(e).y);
      };
      const up = e => {
        if (!ptrs.has(e.pointerId)) return;
        const s = ptrs.get(e.pointerId); ptrs.delete(e.pointerId);
        K[s].hold = Math.max(0, K[s].hold - 1);
      };
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

      // ---- the joust ----
      const vel = k => 60 + 175*k.sp;
      const missChance = (k, s) => 0.06 + 0.34*k.sp*k.sp + (s === 1 && players === 1 && level === 'easy' ? 0.1 : 0);
      const impact = () => {
        phase = 'after'; pt = 0;
        const res = [0, 1].map(s => {
          const a = K[s], d = K[1 - s];
          if (Math.random() < missChance(a, s)) return 'miss';
          if (a.aim === d.aim) return 'break';         // the shield takes it
          return a.sp >= POWER ? 'unhorse' : 'break';
        });
        // two knights cannot both fly: the faster rider stays in the saddle
        if (res[0] === 'unhorse' && res[1] === 'unhorse') {
          if (Math.abs(K[0].sp - K[1].sp) < 0.03) { res[0] = res[1] = 'break'; }
          else if (K[0].sp > K[1].sp) res[1] = 'break'; else res[0] = 'break';
        }
        const mid = (K[0].x + K[1].x)/2;
        let unhorsed = -1;
        for (let s = 0; s < 2; s++) {
          const a = K[s], d = K[1 - s], r = res[s], lx = s ? 690 : 310;
          const tipY = BASE[1 - s] + ZONE[a.aim];
          if (r === 'miss') { say('Miss!', lx, 300, '#ffffff', 1.6, 42); continue; }
          a.lance = 0;
          burst(mid + (s ? -20 : 20), tipY, 12, '#d9b77a', 'shard');
          if (r === 'break') { score[s] += 1; say('Lance broken! +1', lx, 300, TEAM[s].l, 1.8, 38); }
          else {
            score[s] += 3; unhorsed = 1 - s;
            say('Unhorsed! +3', lx, 300, '#ffe14d', 2.4, 46);
            d.on = false;
            d.fall = {x: d.x, y: BASE[d.side] - 115, vx: d.side ? 150 : -150, vy: -330, r: 0, vr: d.side ? 5 : -5, land: 640, landed: false, t: 0};
          }
        }
        el.dataset.score = score.join('-');
        if (unhorsed >= 0) { endWhy = (players === 1 ? (unhorsed ? 'You knocked the computer off' : 'You were knocked off') : `${unhorsed ? 'Red' : 'Blue'} knight knocked off`) + ` in pass ${pass}`; later(() => finish(1 - unhorsed), 2600); return; }
        const done = score[0] >= WIN_PTS || score[1] >= WIN_PTS || pass >= PASSES;
        later(() => {
          if (mode !== 'play') return;
          if (done) {
            endWhy = score[0] >= WIN_PTS || score[1] >= WIN_PTS ? `First to ${WIN_PTS} points` : `After ${PASSES} passes`;
            finish(score[0] === score[1] ? -1 : score[0] > score[1] ? 0 : 1);
          } else newPass();
        }, 2300);
      };
      const thinkAI = dt => {
        const k = K[1];
        k.sp += (k.sp < ai.target ? 0.6 : -0.3)*dt; k.sp = Math.max(0.25, Math.min(1, k.sp));
        const prog = (START[1] - START[0] - (k.x - K[0].x))/(START[1] - START[0] - MEET);
        if (!ai.decided && prog > 0.62) {
          ai.decided = true;
          const r = Math.random(), copy = level === 'easy' ? 0.22 : 0.5;
          if (r < copy) k.aim = K[0].aim;               // read your lance and raise the shield there
          else if (r < copy + 0.25) k.aim = Math.floor(Math.random()*3);
        }
      };
      const update = dt => {
        for (const L of labels) L.t += dt;
        labels = labels.filter(L => L.t < L.life);
        for (const p of parts) { p.t += dt; p.vy += 700*dt; p.x += p.vx*dt; p.y += p.vy*dt; p.r += p.vr*dt; }
        parts = parts.filter(p => p.t < p.life);
        for (const k of K) if (k.fall) {
          const f = k.fall; f.t += dt;
          if (!f.landed) { f.vy += 900*dt; f.x += f.vx*dt; f.y += f.vy*dt; f.r += f.vr*dt; if (f.y >= f.land) { f.y = f.land; f.landed = true; f.r = Math.PI/2*Math.sign(f.vr); burst(f.x, f.land + 20, 10, '#e6cf98', 'dust'); say('Oof!', f.x, f.land - 70, '#ffffff', 1.8, 40); } }
        }
        if (mode !== 'play') return;
        pt += dt;
        if (phase === 'ready') {
          if (pt > 1.6) { phase = 'charge'; pt = 0; say('Charge!', LW/2, 150, '#ffe14d', 1.0, 54); }
        } else if (phase === 'charge') {
          for (let s = 0; s < 2; s++) {
            const k = K[s];
            if (s === 1 && players === 1) continue;
            k.sp += (k.hold ? 0.75 : -0.22)*dt; k.sp = Math.max(0.25, Math.min(1, k.sp));
          }
          if (players === 1) thinkAI(dt);
          K[0].x += vel(K[0])*dt; K[1].x -= vel(K[1])*dt;
          if (K[1].x - K[0].x <= MEET) impact();
        } else if (phase === 'after') {
          for (let s = 0; s < 2; s++) { const k = K[s]; const v = Math.max(80, vel(k)*0.8); k.x += (s ? -v : v)*dt; }
        }
        for (const k of K) k.gait += (phase === 'ready' ? 1.5 : vel(k)*0.06)*dt;
      };

      // ---- drawing ----
      const text = (s, x, y, size, color, align, stroke) => {
        cx.font = `800 ${size}px "Baloo 2", sans-serif`; cx.textAlign = align || 'center'; cx.textBaseline = 'middle';
        if (stroke !== false) { cx.lineWidth = Math.max(3, size*0.14); cx.strokeStyle = 'rgba(20,20,40,.75)'; cx.lineJoin = 'round'; cx.strokeText(s, x, y); }
        cx.fillStyle = color; cx.fillText(s, x, y);
      };
      const drawArena = () => {
        // stands
        cx.fillStyle = '#7a4f2c'; cx.fillRect(0, 200, LW, 150);
        const tt = performance.now()/1000;
        for (const p of crowd) {
          const bob = RM ? 0 : Math.sin(tt*3 + p.ph)*2;
          cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y + 12 + bob, 10, Math.PI, 0); cx.fill();
          cx.fillStyle = '#f1c9a0'; cx.beginPath(); cx.arc(p.x, p.y + bob, 7, 0, 7); cx.fill();
        }
        cx.fillStyle = '#5a3a20'; cx.fillRect(0, 335, LW, 18);
        // pennants along the top
        cx.fillStyle = '#a06a3a'; cx.fillRect(0, 196, LW, 8);
        for (let i = 0; i < 20; i++) {
          cx.fillStyle = i % 2 ? TEAM[1].c : TEAM[0].c;
          cx.beginPath(); cx.moveTo(i*52 + 4, 204); cx.lineTo(i*52 + 48, 204); cx.lineTo(i*52 + 26, 236); cx.fill();
        }
        // two towers with flags
        for (const [x, c] of [[40, TEAM[0].c], [960, TEAM[1].c]]) {
          cx.fillStyle = '#b9a58a'; cx.fillRect(x - 30, 110, 60, 110);
          cx.fillStyle = '#a4917a'; for (let i = 0; i < 3; i++) cx.fillRect(x - 30 + i*24, 98, 14, 14);
          cx.fillStyle = '#5a4a3a'; cx.fillRect(x - 1, 50, 3, 50);
          const w = RM ? 0 : Math.sin(tt*4 + x)*5;
          cx.fillStyle = c; cx.beginPath(); cx.moveTo(x + 2, 52); cx.quadraticCurveTo(x + 22, 58 + w, x + 42, 62); cx.lineTo(x + 2, 76); cx.fill();
        }
        // sand
        cx.fillStyle = '#e3c58c'; cx.fillRect(-2000, 353, LW + 4000, 2000);
        cx.fillStyle = 'rgba(150,110,60,.18)';
        for (let i = 0; i < 26; i++) cx.fillRect((i*137) % LW, 380 + (i*53) % 300, 30, 4);
      };
      const drawFence = () => {
        const y0 = 392, y1 = 462;
        cx.fillStyle = 'rgba(0,0,0,.15)'; cx.fillRect(30, y1, LW - 60, 10);
        cx.fillStyle = '#8a5a30';
        for (let x = 40; x <= LW - 40; x += 92) cx.fillRect(x - 6, y0 - 8, 12, y1 - y0 + 8);
        // striped top rail
        for (let x = 30, i = 0; x < LW - 30; x += 40, i++) { cx.fillStyle = i % 2 ? '#f4f0e6' : '#d6a22a'; cx.fillRect(x, y0, Math.min(40, LW - 30 - x), 18); }
        cx.fillStyle = '#9c6a3a'; cx.fillRect(30, y0 + 30, LW - 60, 12);
        cx.fillStyle = '#7a4f2c'; cx.fillRect(30, y0 + 52, LW - 60, 10);
        cx.strokeStyle = 'rgba(0,0,0,.25)'; cx.lineWidth = 2; cx.strokeRect(30, y0, LW - 60, 18);
      };
      const leg = (x, y, a, c) => {
        cx.strokeStyle = c; cx.lineWidth = 9; cx.lineCap = 'round';
        const kx = x + Math.sin(a)*22, ky = y + Math.cos(a)*22;
        const fx = kx + Math.sin(a*1.6 - 0.3)*24, fy = ky + Math.cos(a*1.6 - 0.3)*24;
        cx.beginPath(); cx.moveTo(x, y); cx.lineTo(kx, ky); cx.lineTo(fx, fy); cx.stroke();
        cx.fillStyle = '#2b1d12'; cx.beginPath(); cx.arc(fx, fy, 5, 0, 7); cx.fill();
      };
      const drawHorse = (k, base) => {
        const T = TEAM[k.side], dir = k.side ? -1 : 1, g = k.gait*6.28;
        const bob = Math.sin(g*2)*2;
        cx.save(); cx.translate(k.x, base + bob); cx.scale(dir, 1);
        const hc = k.side ? '#e9e4dc' : '#7a4a2a', hd = k.side ? '#c8c0b2' : '#5c351c';
        // far legs
        leg(-38, -52, Math.sin(g + 1.6)*0.6, hd); leg(34, -52, Math.sin(g + 3.1)*0.6, hd);
        // tail
        cx.strokeStyle = hd; cx.lineWidth = 8; cx.beginPath(); cx.moveTo(-58, -70); cx.quadraticCurveTo(-82, -62 + Math.sin(g)*6, -76, -32); cx.stroke();
        // body
        cx.fillStyle = hc; cx.beginPath(); cx.ellipse(0, -72, 62, 26, 0, 0, 7); cx.fill();
        // neck & head
        cx.beginPath(); cx.moveTo(38, -88); cx.lineTo(66, -128); cx.lineTo(86, -122); cx.lineTo(62, -70); cx.fill();
        cx.beginPath(); cx.ellipse(86, -122, 24, 12, 0.5, 0, 7); cx.fill();
        cx.fillStyle = hd; cx.beginPath(); cx.moveTo(56, -126); cx.lineTo(62, -144); cx.lineTo(70, -128); cx.fill();
        cx.fillStyle = '#111'; cx.beginPath(); cx.arc(84, -128, 3, 0, 7); cx.fill();
        // mane
        cx.strokeStyle = hd; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(40, -96); cx.lineTo(62, -130); cx.stroke();
        // caparison (team cloth)
        cx.fillStyle = T.c; cx.beginPath(); cx.moveTo(-60, -84); cx.lineTo(48, -84); cx.lineTo(52, -42);
        for (let i = 0; i < 5; i++) { const x = 52 - i*25; cx.lineTo(x - 6, -34); cx.lineTo(x - 12, -42); }
        cx.lineTo(-64, -46); cx.closePath(); cx.fill();
        cx.fillStyle = T.l; cx.fillRect(-58, -82, 104, 6);
        // near legs
        leg(-30, -48, Math.sin(g)*0.6, hc); leg(40, -48, Math.sin(g + 1.5)*0.6, hc);
        // saddle
        cx.fillStyle = '#4a2a14'; cx.fillRect(-18, -100, 34, 12);
        cx.restore();
      };
      // rider standing at (0,0) = saddle, facing +x; used both in the saddle and while tumbling
      const drawRider = (k, emoji) => {
        const T = TEAM[k.side];
        // legs
        cx.fillStyle = '#9aa3ad'; cx.fillRect(-8, -6, 14, 30);
        // torso armour
        cx.fillStyle = '#b8c0c8'; cx.beginPath(); cx.roundRect(-14, -54, 28, 52, 8); cx.fill();
        cx.fillStyle = T.c; cx.fillRect(-14, -34, 28, 12);
        // helmet
        cx.fillStyle = '#c9d0d8'; cx.beginPath(); cx.roundRect(-13, -84, 26, 30, 10); cx.fill();
        cx.fillStyle = '#2a2f36'; cx.fillRect(2, -72, 11, 4);
        // plume
        cx.strokeStyle = T.c; cx.lineWidth = 7; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(-2, -84); cx.quadraticCurveTo(-14, -104, -34, -96); cx.stroke();
        cx.strokeStyle = T.l; cx.lineWidth = 4;
        cx.beginPath(); cx.moveTo(-2, -86); cx.quadraticCurveTo(-12, -100, -28, -96); cx.stroke();
        return T;
      };
      const drawShield = (k, y) => {
        const T = TEAM[k.side];
        cx.fillStyle = T.c; cx.strokeStyle = '#f4f0e6'; cx.lineWidth = 3;
        cx.beginPath(); cx.moveTo(-2, y - 22); cx.lineTo(26, y - 22); cx.lineTo(26, y + 2); cx.quadraticCurveTo(26, y + 20, 12, y + 28); cx.quadraticCurveTo(-2, y + 20, -2, y + 2); cx.closePath(); cx.fill(); cx.stroke();
        const em = k.side === 0 ? (api.avatar || '⭐') : players === 1 ? '🤖' : '⭐';
        cx.save(); cx.scale(k.side ? -1 : 1, 1); cx.font = '22px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#000';
        cx.fillText(em, (k.side ? -1 : 1)*12, y + 2); cx.restore();
      };
      const drawKnight = k => {
        const base = BASE[k.side], dir = k.side ? -1 : 1;
        drawHorse(k, base);
        if (!k.on) return;
        const bob = Math.sin(k.gait*12.56)*2;
        cx.save(); cx.translate(k.x - dir*4, base - 96 + bob); cx.scale(dir, 1);
        drawRider(k);
        // lance: from the hand to the chosen height on the other lane
        const other = 1 - k.side;
        const wob = (phase === 'charge' && !RM ? Math.sin(k.gait*20)*k.sp*k.sp*10 : 0);
        const tipY = (BASE[other] + ZONE[k.aim]) - (base - 96 + bob) + wob;
        const hx = 10, hy = -30, len = k.lance ? 185 : 52;
        const ang = Math.atan2(tipY - hy, 180);
        cx.save(); cx.translate(hx, hy); cx.rotate(ang);
        cx.fillStyle = '#d9b77a'; cx.beginPath(); cx.moveTo(-26, -5); cx.lineTo(len, -1.5); cx.lineTo(len, 1.5); cx.lineTo(-26, 5); cx.fill();
        if (k.lance) { cx.fillStyle = TEAM[k.side].c; for (let i = 0; i < 4; i++) cx.fillRect(10 + i*36, -4, 12, 8); cx.fillStyle = '#eee'; cx.beginPath(); cx.arc(len, 0, 4, 0, 7); cx.fill(); }
        else { cx.fillStyle = '#b8935a'; cx.beginPath(); cx.moveTo(len, -2); cx.lineTo(len + 8, -6); cx.lineTo(len + 4, 0); cx.lineTo(len + 9, 5); cx.lineTo(len, 2); cx.fill(); }
        cx.fillStyle = '#8a8f96'; cx.beginPath(); cx.arc(4, 0, 9, 0, 7); cx.fill();  // vamplate
        cx.restore();
        // shield guards the height this knight aims at
        drawShield(k, ZONE[k.aim] + 96 - bob);
        cx.restore();
      };
      const drawFallen = k => {
        const f = k.fall; if (!f) return;
        cx.save(); cx.translate(f.x, f.y); cx.rotate(f.r); cx.scale(k.side ? -1 : 1, 1);
        drawRider(k);
        cx.restore();
        if (f.landed) {
          const tt = f.t*4;
          cx.font = '22px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
          for (let i = 0; i < 3; i++) { const a = tt + i*2.09; cx.fillText('⭐', f.x + Math.cos(a)*34 + (k.side ? 30 : -30), f.y - 22 + Math.sin(a)*10); }
        }
      };
      const drawParts = () => {
        for (const p of parts) {
          cx.globalAlpha = Math.max(0, 1 - p.t/p.life);
          cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
          cx.fillStyle = p.color;
          if (p.kind === 'shard') cx.fillRect(-10, -2, 20, 4); else { cx.beginPath(); cx.arc(0, 0, 7, 0, 7); cx.fill(); }
          cx.restore();
        }
        cx.globalAlpha = 1;
      };
      const drawHUD = () => {
        const nm = players === 1 ? [`You ${api.avatar || ''}`, 'Computer 🤖'] : ['Blue knight', 'Red knight'];
        cx.fillStyle = 'rgba(20,24,40,.55)'; cx.beginPath(); cx.roundRect(LW/2 - 230, 8, 460, 74, 18); cx.fill();
        text(nm[0], LW/2 - 120, 30, 22, TEAM[0].l, 'center');
        text(nm[1], LW/2 + 120, 30, 22, TEAM[1].l, 'center');
        text(String(score[0]), LW/2 - 120, 60, 34, '#ffffff');
        text(String(score[1]), LW/2 + 120, 60, 34, '#ffffff');
        text(`Pass ${Math.min(pass, PASSES)}/${PASSES}`, LW/2, 46, 22, '#ffe14d');
      };
      // screen-space controls: three targets + a speed bar for each human
      const drawControls = () => {
        const humans = players === 1 ? [0] : [0, 1];
        for (const s of humans) {
          const k = K[s], T = TEAM[s];
          for (let z = 0; z < 3; z++) {
            const q = tgt(s, z), on = k.aim === z;
            cx.globalAlpha = on ? 0.95 : 0.6;
            cx.fillStyle = on ? T.c : 'rgba(20,24,40,.6)';
            cx.beginPath(); cx.arc(q.x, q.y, q.r, 0, 7); cx.fill();
            cx.lineWidth = on ? 4 : 2; cx.strokeStyle = on ? '#ffe14d' : 'rgba(255,255,255,.7)'; cx.stroke();
            cx.globalAlpha = 1;
            // little bullseye
            cx.strokeStyle = '#ffffff'; cx.lineWidth = 2; cx.beginPath(); cx.arc(q.x, q.y - 6, q.r*0.28, 0, 7); cx.stroke();
            cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(q.x, q.y - 6, 3, 0, 7); cx.fill();
            cx.font = `700 ${Math.round(q.r*0.34)}px "Lexend", sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
            cx.fillText(ZNAME[z], q.x, q.y + q.r*0.5);
          }
          // speed bar under the targets
          const q = tgt(s, 2), bw = Math.max(70, q.r*2.4), bh = 16;
          const bx = s ? W - 14 - bw : 14, by = q.y + q.r + 14;
          cx.fillStyle = 'rgba(20,24,40,.65)'; cx.beginPath(); cx.roundRect(bx - 4, by - 4, bw + 8, bh + 26, 8); cx.fill();
          const f = (k.sp - 0.25)/0.75;
          cx.fillStyle = k.sp >= POWER ? '#ffcf3a' : '#7fd08a';
          const fw = bw*f;
          cx.fillRect(s ? bx + bw - fw : bx, by, fw, bh);
          const px = s ? bx + bw - bw*(POWER - 0.25)/0.75 : bx + bw*(POWER - 0.25)/0.75;
          cx.fillStyle = '#ffffff'; cx.fillRect(px - 1.5, by - 3, 3, bh + 6);
          cx.font = '600 13px "Lexend", sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#ffffff';
          cx.fillText(k.sp >= POWER ? '💥 Power!' : 'Speed', bx + bw/2, by + bh + 11);
        }
        // hold hint
        if (mode === 'play' && (phase === 'ready' || (phase === 'charge' && pass === 1)) ) {
          const msg = 'Hold to gallop · slide to aim';
          if (players === 1) { cx.font = '700 18px "Lexend", sans-serif'; cx.textAlign = 'center'; cx.fillStyle = '#fff'; cx.strokeStyle = 'rgba(20,20,40,.7)'; cx.lineWidth = 4; cx.strokeText(msg, W/2, H - 22); cx.fillText(msg, W/2, H - 22); }
          else for (const s of [0, 1]) { const x = s ? W*0.75 : W*0.25; cx.font = '700 16px "Lexend", sans-serif'; cx.textAlign = 'center'; cx.fillStyle = '#fff'; cx.strokeStyle = 'rgba(20,20,40,.7)'; cx.lineWidth = 4; cx.strokeText(msg, x, H - 22); cx.fillText(msg, x, H - 22); }
        }
        if (players === 2 && mode === 'play') { cx.strokeStyle = 'rgba(255,255,255,.25)'; cx.setLineDash([8, 10]); cx.lineWidth = 2; cx.beginPath(); cx.moveTo(W/2, H*0.62); cx.lineTo(W/2, H); cx.stroke(); cx.setLineDash([]); }
      };
      const draw = () => {
        // sky
        const g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7fc4f5'); g.addColorStop(0.55, '#cde9fb'); g.addColorStop(0.56, '#e3c58c'); g.addColorStop(1, '#d9b778');
        cx.fillStyle = g; cx.fillRect(0, 0, W, H);
        cx.save(); cx.translate(ox, oy); cx.scale(sc, sc);
        cx.fillStyle = '#9fd3f7'; cx.fillRect(-2000, -2000, LW + 4000, 2200);
        drawArena();
        drawKnight(K[0]);
        drawFence();
        drawKnight(K[1]);
        drawFallen(K[0]); drawFallen(K[1]);
        drawParts();
        for (const L of labels) {
          const a = Math.min(1, (L.life - L.t)/0.35), s = 1 + Math.max(0, 0.25 - L.t)*1.6;
          cx.globalAlpha = Math.max(0, a); text(L.text, L.x, L.y - L.t*14, L.size*s, L.color); cx.globalAlpha = 1;
        }
        if (mode !== 'menu') drawHUD();
        cx.restore();
        if (mode === 'play') drawControls();
      };

      const frame = now => {
        if (!alive) return;
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
        delete el._jo; el.innerHTML = '';
      };
    }
  };
})();
