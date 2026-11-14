// Table hockey: drag your paddle on your half, knock the puck into the far goal. First to 7.
// 1 player vs the computer (easy / medium / hard) or 2 players on one iPad, one finger each.
(function(){
  window.BreakGames = window.BreakGames || {};
  window.BreakGames.hockey = {
    start(el, api){
      const C = api.colors, RM = api.reducedMotion;
      // table in "along" (A, 0..1000, P1 defends A=0) and "across" (X, 0..560)
      const LEN = 1000, WID = 560, MID = LEN/2, PR = 24, KR = 44, GOAL_LO = 175, GOAL_HI = 385, WIN = 7;
      const RAIL = 26, MAXV = 1700, E_WALL = 0.9;
      const AI = {easy: {speed: 360, home: 900, lag: 3, err: 40}, medium: {speed: 600, home: 880, lag: 6, err: 18}, hard: {speed: 880, home: 860, lag: 12, err: 4}};

      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.appendChild(cv);
      const cx = cv.getContext('2d');
      const ui = document.createElement('div');
      ui.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none';
      el.appendChild(ui);

      let W = 0, H = 0, sc = 1, ox = 0, oy = 0, port = false, raf = 0, last = 0, alive = true;
      const timers = new Set();
      const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms); timers.add(t); };
      const size = () => {
        const r = el.getBoundingClientRect(), d = window.devicePixelRatio || 1;
        W = r.width; H = r.height; cv.width = Math.round(W*d); cv.height = Math.round(H*d);
        port = H > W*1.05;
        const lw = (port ? WID : LEN) + 2*RAIL + 16, lh = (port ? LEN : WID) + 2*RAIL + 16;
        sc = Math.min(W/lw, H/lh); ox = W/2; oy = H/2;
        cx.setTransform(d,0,0,d,0,0);
      };
      size(); window.addEventListener('resize', size);
      // table -> screen (css px) and back. Landscape: P1 on the left. Portrait: P1 at the bottom.
      const toS = (a, x) => port ? {x: ox + (x - WID/2)*sc, y: oy + (MID - a)*sc} : {x: ox + (a - MID)*sc, y: oy + (x - WID/2)*sc};
      const fromS = (sx, sy) => port ? {a: MID - (sy - oy)/sc, x: WID/2 + (sx - ox)/sc} : {a: MID + (sx - ox)/sc, x: WID/2 + (sy - oy)/sc};

      // ---- state ----
      let mode = 'menu', players = 1, level = 'easy', score = [0, 0], pause = 0, label = null, flash = 0;
      const puck = {a: MID - 160, x: WID/2, va: 0, vx: 0, spin: 0};
      const pads = [mkPad(0), mkPad(1)];
      function mkPad(side){ return {side, a: side ? LEN - 110 : 110, x: WID/2, ta: side ? LEN - 110 : 110, tx: WID/2, va: 0, vx: 0, ptr: null}; }
      const ai = {ta: LEN - 110, tx: WID/2, off: 0, cool: 0};
      el._hk = () => ({mode, score: score.slice(), puck: toS(puck.a, puck.x), pad: toS(pads[0].a, pads[0].x), pa: puck.a, px: puck.x, port});

      // ---- overlay screens ----
      const btn = (lab, attr, on, big) => `<button ${attr} style="pointer-events:auto;min-height:${big ? 60 : 52}px;min-width:${big ? 220 : 120}px;padding:8px 20px;border-radius:16px;border:2px solid ${on ? C.accent : C.line};background:${on ? C.accent : C.panel};color:${on ? C.accentInk : C.ink};font:700 ${big ? 26 : 20}px 'Baloo 2',sans-serif;cursor:pointer">${lab}</button>`;
      const card = html => { ui.innerHTML = `<div style="pointer-events:auto;background:${C.panel};color:${C.ink};border:2px solid ${C.line};border-radius:24px;padding:22px 26px;max-width:90%;text-align:center;font-family:Lexend,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:12px;align-items:center">${html}</div>`; };
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
        card(`<div style="font-size:50px;line-height:1">🏒</div><div style="font:800 32px 'Baloo 2',sans-serif">Table Hockey</div>
          <div style="color:${C.mut};font-size:16px">Drag your paddle. First to ${WIN} goals wins!</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${btn('1 player (vs computer)', 'data-m="1"', players === 1)}${btn('2 players (same iPad)', 'data-m="2"', players === 2)}</div>
          ${players === 1 ? `<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${['easy', 'medium', 'hard'].map(d => btn(d[0].toUpperCase() + d.slice(1), `data-d="${d}"`, level === d)).join('')}</div>` : ''}
          ${players === 1 && api.best != null ? `<div style="color:${C.mut}">🏆 Best: ${api.best} goals</div>` : ''}
          ${btn('Play', 'data-b="Play"', true, true)}`);
      };
      const begin = () => {
        ui.innerHTML = ''; mode = 'play'; score = [0, 0];
        pads[0] = mkPad(0); pads[1] = mkPad(1); ai.cool = 0;
        servePuck(Math.random() < 0.5 ? 0 : 1); pause = 0.8; label = {text: 'Go!', t: 0, life: 0.9, color: '#ffd84d'};
      };
      const finish = () => {
        mode = 'over';
        const p1win = score[0] > score[1];
        let html;
        if (players === 1) {
          const r = api.saveScore(score[0]);
          html = `<div style="font:800 34px 'Baloo 2',sans-serif">${p1win ? 'You win! 🎉' : 'Computer wins'}</div>
            <div style="font:800 46px 'Baloo 2',sans-serif;color:${C.accent}">${score[0]} – ${score[1]}</div>
            <div style="color:${C.mut}">You scored ${score[0]} goal${score[0] === 1 ? '' : 's'}</div>
            ${r.isBest ? `<div style="font:800 26px 'Baloo 2',sans-serif;color:${C.good}">🏆 New best!</div>` : `<div style="color:${C.mut}">🏆 Best: ${r.best}</div>`}`;
          if (p1win && !RM) api.confetti(40);
        } else {
          html = `<div style="font:800 34px 'Baloo 2',sans-serif">${p1win ? 'Player 1' : 'Player 2'} wins! 🎉</div>
            <div style="font:800 46px 'Baloo 2',sans-serif;color:${C.accent}">${score[0]} – ${score[1]}</div>`;
          if (!RM) api.confetti(40);
        }
        card(html + `<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${btn('Play again', 'data-b="Play again"', true, true)}${btn('Change mode', 'data-b="Menu"', false, true)}</div>`);
      };
      const servePuck = side => { Object.assign(puck, {a: side ? MID + 170 : MID - 170, x: WID/2, va: 0, vx: 0}); };

      // ---- input: one paddle per finger, each on its own half ----
      const down = e => {
        if (mode !== 'play') return;
        const r = cv.getBoundingClientRect(), p = fromS(e.clientX - r.left, e.clientY - r.top);
        const side = p.a < MID ? 0 : 1;
        if (side === 1 && players === 1) return;
        const pad = pads[side];
        if (pad.ptr != null) return;              // that half already has a finger
        pad.ptr = e.pointerId; pad.ta = p.a; pad.tx = p.x;
        try { cv.setPointerCapture(e.pointerId); } catch(_){}
        e.preventDefault();
      };
      const move = e => {
        for (const pad of pads) if (pad.ptr === e.pointerId) {
          const r = cv.getBoundingClientRect(), p = fromS(e.clientX - r.left, e.clientY - r.top);
          pad.ta = p.a; pad.tx = p.x;
        }
      };
      const up = e => { for (const pad of pads) if (pad.ptr === e.pointerId) pad.ptr = null; };
      cv.addEventListener('pointerdown', down);
      cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);

      // ---- computer ----
      const thinkAI = dt => {
        const P = AI[level], pad = pads[1];
        ai.cool = Math.max(0, ai.cool - dt);
        const toward = puck.va > 40;             // coming at the computer's goal
        let ta, tx;
        if (puck.a > MID - 20 && ai.cool <= 0 && (puck.a > pad.a - 20 ? false : true) && (!toward || puck.a > LEN - 380 || Math.hypot(puck.va, puck.vx) < 350)) {
          // strike: come from behind the puck, aiming at the player's goal
          const ga = 0, gx = WID/2 + ai.off, da = ga - puck.a, dx = gx - puck.x, dl = Math.hypot(da, dx) || 1;
          ta = puck.a - da/dl*(PR + KR - 14); tx = puck.x - dx/dl*(PR + KR - 14);
          ta += (da/dl)*-30; // overshoot through the puck
        } else if (puck.a > pad.a - 10 && puck.a > MID) {
          // puck slipped behind: get back around it
          ta = Math.min(LEN - KR - 4, puck.a + 70); tx = puck.x + (puck.x > WID/2 ? -80 : 80);
        } else {
          ta = P.home; tx = WID/2 + (puck.x - WID/2)*0.65;
        }
        // lag: easy follows sluggishly
        const k = Math.min(1, dt*P.lag);
        ai.ta += (ta - ai.ta)*k; ai.tx += (tx - ai.tx)*k;
        pad.ta = ai.ta; pad.tx = ai.tx;
        if (Math.hypot(puck.a - pad.a, puck.x - pad.x) < PR + KR + 4) { ai.cool = level === 'easy' ? 0.45 : level === 'medium' ? 0.25 : 0.1; ai.off = (Math.random()*2 - 1)*(P.err*3); }
      };

      // ---- physics ----
      const clampPad = (pad) => {
        const lo = pad.side ? MID + KR : KR, hi = pad.side ? LEN - KR : MID - KR;
        pad.ta = Math.max(lo, Math.min(hi, pad.ta)); pad.tx = Math.max(KR, Math.min(WID - KR, pad.tx));
      };
      const hitPad = (pad) => {
        const da = puck.a - pad.a, dx = puck.x - pad.x, d = Math.hypot(da, dx), m = PR + KR;
        if (d >= m) return;
        const na = d ? da/d : (pad.side ? -1 : 1), nx = d ? dx/d : 0;
        puck.a = pad.a + na*m; puck.x = pad.x + nx*m;
        const ra = puck.va - pad.va, rx = puck.vx - pad.vx, vn = ra*na + rx*nx;
        if (vn < 0) { puck.va -= 1.9*vn*na; puck.vx -= 1.9*vn*nx; puck.spin += (rx*na - ra*nx)*0.002; }
      };
      const post = (pa, px) => {
        const da = puck.a - pa, dx = puck.x - px, d = Math.hypot(da, dx);
        if (d >= PR || d === 0) return;
        const na = da/d, nx = dx/d; puck.a = pa + na*PR; puck.x = px + nx*PR;
        const vn = puck.va*na + puck.vx*nx; if (vn < 0) { puck.va -= 1.8*vn*na; puck.vx -= 1.8*vn*nx; }
      };
      const goal = side => {   // side = who scored
        score[side]++; el.dataset.score = score.join('-');
        flash = 1;
        label = {text: players === 1 ? (side === 0 ? 'GOAL!' : 'Computer scores') : `GOAL! Player ${side + 1}`, t: 0, life: 1.3, color: side === 0 ? '#5fb4ff' : '#ff7a7a'};
        if (score[side] >= WIN) { mode = 'ended'; puck.va = puck.vx = 0; later(finish, 1300); return; }
        servePuck(side ? 0 : 1); pause = 1.1;
      };
      const step = dt => {
        for (const pad of pads) {
          clampPad(pad);
          const pa = pad.a, px = pad.x;
          let da = pad.ta - pad.a, dx = pad.tx - pad.x; const d = Math.hypot(da, dx);
          const maxStep = (pad.side && players === 1 ? AI[level].speed : 4000)*dt;
          if (d > maxStep) { da *= maxStep/d; dx *= maxStep/d; }
          pad.a += da; pad.x += dx;
          pad.va = (pad.a - pa)/dt; pad.vx = (pad.x - px)/dt;
        }
        if (pause > 0 || mode !== 'play') return;
        puck.a += puck.va*dt; puck.x += puck.vx*dt;
        // side rails
        if (puck.x < PR) { puck.x = PR; puck.vx = Math.abs(puck.vx)*E_WALL; }
        if (puck.x > WID - PR) { puck.x = WID - PR; puck.vx = -Math.abs(puck.vx)*E_WALL; }
        const inMouth = puck.x > GOAL_LO && puck.x < GOAL_HI;
        if (!inMouth) {
          if (puck.a < PR) { puck.a = PR; puck.va = Math.abs(puck.va)*E_WALL; }
          if (puck.a > LEN - PR) { puck.a = LEN - PR; puck.va = -Math.abs(puck.va)*E_WALL; }
        }
        post(0, GOAL_LO); post(0, GOAL_HI); post(LEN, GOAL_LO); post(LEN, GOAL_HI);
        hitPad(pads[0]); hitPad(pads[1]);
        const sp = Math.hypot(puck.va, puck.vx); if (sp > MAXV) { puck.va *= MAXV/sp; puck.vx *= MAXV/sp; }
        if (puck.a < -PR) goal(1); else if (puck.a > LEN + PR) goal(0);
      };
      const update = dt => {
        if (mode === 'play' || mode === 'ended') {
          if (players === 1 && mode === 'play') thinkAI(dt);
          if (pause > 0) pause -= dt;
          for (let i = 0; i < 4; i++) step(dt/4);
          const f = Math.exp(-0.32*dt); puck.va *= f; puck.vx *= f; puck.spin *= Math.exp(-1.5*dt);
          // a puck stuck dead on the centre line gets a nudge
          if (mode === 'play' && pause <= 0 && Math.hypot(puck.va, puck.vx) < 6 && Math.abs(puck.a - MID) < PR) puck.va += (Math.random() < 0.5 ? -60 : 60);
        }
        if (label) { label.t += dt; if (label.t > label.life) label = null; }
        flash = Math.max(0, flash - dt*2);
      };

      // ---- drawing ----
      const text = (s, x, y, size, color, rot) => {
        cx.save(); cx.translate(x, y); if (rot) cx.rotate(rot);
        cx.font = `800 ${size}px "Baloo 2", sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.lineWidth = size/6; cx.lineJoin = 'round'; cx.strokeStyle = 'rgba(15,25,50,.8)'; cx.strokeText(s, 0, 0);
        cx.fillStyle = color; cx.fillText(s, 0, 0); cx.restore();
      };
      const lineT = (a1, x1, a2, x2) => { const p = toS(a1, x1), q = toS(a2, x2); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); };
      const drawPad = (pad, color, emoji) => {
        const p = toS(pad.a, pad.x), r = KR*sc;
        cx.fillStyle = 'rgba(0,0,0,.18)'; cx.beginPath(); cx.arc(p.x + 3*sc, p.y + 5*sc, r, 0, 7); cx.fill();
        const g = cx.createRadialGradient(p.x - r*0.3, p.y - r*0.3, r*0.1, p.x, p.y, r);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, color); g.addColorStop(1, color);
        cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, r, 0, 7); cx.fill();
        cx.strokeStyle = 'rgba(0,0,0,.35)'; cx.lineWidth = 3; cx.stroke();
        cx.fillStyle = 'rgba(255,255,255,.85)'; cx.beginPath(); cx.arc(p.x, p.y, r*0.62, 0, 7); cx.fill();
        cx.fillStyle = '#000'; cx.font = `${Math.round(r*0.95)}px sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText(emoji, p.x, p.y + r*0.05);
      };
      const draw = () => {
        cx.fillStyle = '#1d2b4f'; cx.fillRect(0, 0, W, H);
        // rail
        const c0 = toS(-RAIL, -RAIL), c1 = toS(LEN + RAIL, WID + RAIL);
        const rx = Math.min(c0.x, c1.x), ry = Math.min(c0.y, c1.y), rw = Math.abs(c1.x - c0.x), rh = Math.abs(c1.y - c0.y);
        cx.fillStyle = '#3b4f86'; cx.beginPath(); cx.roundRect ? cx.roundRect(rx, ry, rw, rh, 34*sc) : cx.rect(rx, ry, rw, rh); cx.fill();
        const t0 = toS(0, 0), t1 = toS(LEN, WID);
        const tx = Math.min(t0.x, t1.x), ty = Math.min(t0.y, t1.y), tw = Math.abs(t1.x - t0.x), th = Math.abs(t1.y - t0.y);
        const ice = cx.createLinearGradient(tx, ty, tx + tw, ty + th); ice.addColorStop(0, '#eef7ff'); ice.addColorStop(1, '#d6ebff');
        cx.fillStyle = ice; cx.beginPath(); cx.roundRect ? cx.roundRect(tx, ty, tw, th, 22*sc) : cx.rect(tx, ty, tw, th); cx.fill();
        cx.save(); cx.beginPath(); cx.rect(tx, ty, tw, th); cx.clip();
        // air holes (a sparse dot grid)
        cx.fillStyle = 'rgba(80,120,170,.18)';
        for (let a = 40; a < LEN; a += 60) for (let x = 40; x < WID; x += 60) { const p = toS(a, x); cx.fillRect(p.x - 1.2, p.y - 1.2, 2.4, 2.4); }
        // markings
        cx.lineWidth = 4*sc; cx.strokeStyle = 'rgba(220,60,70,.55)'; cx.beginPath(); lineT(MID, 0, MID, WID); cx.stroke();
        const cc = toS(MID, WID/2); cx.beginPath(); cx.arc(cc.x, cc.y, 80*sc, 0, 7); cx.stroke();
        cx.strokeStyle = 'rgba(60,110,220,.45)';
        for (const end of [0, LEN]) { const g = toS(end, WID/2); cx.beginPath(); cx.arc(g.x, g.y, 120*sc, 0, 7); cx.stroke(); }
        cx.restore();
        // goals
        for (const [end, col] of [[0, '#2f7bff'], [LEN, '#ff4b5c']]) {
          cx.strokeStyle = col; cx.lineWidth = 10*sc; cx.lineCap = 'round';
          cx.beginPath(); lineT(end, GOAL_LO, end, GOAL_HI); cx.stroke();
          cx.fillStyle = '#0d1530'; const g0 = toS(end + (end ? 6 : -6), GOAL_LO), g1 = toS(end + (end ? RAIL : -RAIL), GOAL_HI);
          cx.fillRect(Math.min(g0.x, g1.x), Math.min(g0.y, g1.y), Math.abs(g1.x - g0.x), Math.abs(g1.y - g0.y));
          cx.lineCap = 'butt';
        }
        if (flash && !RM) { cx.fillStyle = `rgba(255,255,255,${flash*0.35})`; cx.fillRect(tx, ty, tw, th); }
        // scores, each upright on its own half
        const s1 = port ? toS(MID - 110, 60) : toS(MID - 90, 50), s2 = port ? toS(MID + 110, WID - 60) : toS(MID + 90, 50);
        text(String(score[0]), s1.x, s1.y, 44*Math.max(0.8, sc), '#2f7bff');
        text(String(score[1]), s2.x, s2.y, 44*Math.max(0.8, sc), '#ff4b5c', port && players === 2 ? Math.PI : 0);
        // puck
        const pp = toS(puck.a, puck.x), pr = PR*sc;
        cx.fillStyle = 'rgba(0,0,0,.2)'; cx.beginPath(); cx.arc(pp.x + 2*sc, pp.y + 4*sc, pr, 0, 7); cx.fill();
        cx.fillStyle = '#222838'; cx.beginPath(); cx.arc(pp.x, pp.y, pr, 0, 7); cx.fill();
        cx.strokeStyle = '#ffd84d'; cx.lineWidth = 3*sc; cx.beginPath(); cx.arc(pp.x, pp.y, pr*0.6, 0, 7); cx.stroke();
        drawPad(pads[0], '#2f7bff', api.avatar || '🙂');
        drawPad(pads[1], '#ff4b5c', players === 1 ? '🤖' : '⭐');
        if (mode === 'play' && pads[0].ptr == null && score[0] + score[1] === 0) {
          const h = toS(130, WID/2); text(port ? 'Drag your paddle' : 'Drag your paddle', h.x, h.y - (port ? 70 : 0)*sc + (port ? 0 : 70*sc), 26*Math.max(0.8, sc), '#2f7bff');
        }
        if (players === 2 && mode === 'play' && pads[1].ptr == null && score[0] + score[1] === 0) {
          const h = toS(LEN - 130, WID/2); text('Player 2', h.x, h.y + (port ? 0 : 70*sc), 26*Math.max(0.8, sc), '#ff4b5c', port ? Math.PI : 0);
        }
        if (label) {
          const k = label.t/label.life, c = toS(MID, WID/2);
          cx.globalAlpha = Math.min(1, (1 - k)*3); text(label.text, c.x, c.y, 56*Math.max(0.8, sc)*(RM ? 1 : 1 + Math.max(0, 0.25 - k)), label.color); cx.globalAlpha = 1;
        }
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
        delete el._hk; el.innerHTML = '';
      };
    }
  };
})();
