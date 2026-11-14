// Break Zone: Bowling. 1 or 2 players on one iPad. Swipe up from the ball to roll it:
// direction aims, speed is power, a curved swipe adds hook. 10 frames, real scoring.
(function(){
  window.BreakGames = window.BreakGames || {};
  window.BreakGames.bowling = { start(el, api){
    const C = api.colors, RM = !!api.reducedMotion;
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
    const HEAD_FONT = '"Baloo 2", system-ui, sans-serif', TXT_FONT = '"Lexend", system-ui, sans-serif';

    // ---- world (cm). x across the lane, z down the lane from the foul line ----
    const LH = 53, GW = 22, HEADZ = 1830, ROWD = 26.4, SP = 30.48, PR = 6.05, PRF = 8.5, BR = 10.9;
    const DECKEND = 1958, PITEND = 2060, HOOK = 125, MB = 7, MP = 1.6;
    const pins = []; for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) pins.push({hx:(i - r/2)*SP, hz:HEADZ + r*ROWD, x:0, z:0, vx:0, vz:0, down:false, gone:false, up0:true, ang:0, fallT:1, spin:0});
    const ball = {x:0, z:0, vx:0, vz:0, spin:0, gutter:false, active:false, rollA:0};
    const rack = () => { for (const p of pins){ p.x = p.hx; p.z = p.hz; p.vx = p.vz = 0; p.down = p.gone = false; p.fallT = 1; p.ang = 0; } };
    const sweep = () => { for (const p of pins){ if (p.down && !p.gone) p.gone = true; p.vx = p.vz = 0; } };
    rack();

    // ---- game state ----
    let phase = 'menu', nP = 1, players = [], cur = 0, frame = 0, fresh = true, camZ = 0, rollT = 0, passT = -1, resT = 0;
    let popup = null, hintOn = true, drag = null, guide = null, lastResult = null;
    const setPhase = p => { phase = p; el.dataset.phase = p; };
    const newPlayer = (name, av) => ({name, av, frames: Array.from({length:10}, () => [])});

    // ---- scoring ----
    function scoreOf(pl){ // cumulative per frame (null when not yet known)
      const rolls = [], starts = [];
      pl.frames.forEach(f => { starts.push(rolls.length); rolls.push(...f); });
      const out = []; let tot = 0;
      for (let f = 0; f < 10; f++){
        const fr = pl.frames[f], i = starts[f]; let v = null;
        if (f < 9){
          if (fr[0] === 10){ if (rolls.length > i + 2) v = 10 + rolls[i+1] + rolls[i+2]; }
          else if (fr.length === 2){ v = fr[0] + fr[1] === 10 ? (rolls.length > i + 2 ? 10 + rolls[i+2] : null) : fr[0] + fr[1]; }
        } else {
          const done = fr.length === 3 || (fr.length === 2 && fr[0] + fr[1] < 10);
          if (done) v = fr.reduce((a, b) => a + b, 0);
        }
        if (v == null){ for (let k = f; k < 10; k++) out.push(null); break; }
        tot += v; out.push(tot);
      }
      return out;
    }
    const total = pl => { const s = scoreOf(pl); let t = 0; s.forEach(v => { if (v != null) t = v; }); return t; };
    const mk = n => n === 0 ? '-' : String(n);
    function marks(fr, tenth){
      const [a, b, c] = fr;
      if (!tenth){ if (a === 10) return ['', 'X']; return [a == null ? '' : mk(a), b == null ? '' : (a + b === 10 ? '/' : mk(b))]; }
      const m = ['', '', ''];
      if (a != null) m[0] = a === 10 ? 'X' : mk(a);
      if (b != null) m[1] = a === 10 ? (b === 10 ? 'X' : mk(b)) : (a + b === 10 ? '/' : mk(b));
      if (c != null){ if (a === 10 && b === 10) m[2] = c === 10 ? 'X' : mk(c); else if (a === 10) m[2] = b + c === 10 ? '/' : mk(c); else m[2] = c === 10 ? 'X' : mk(c); }
      return m;
    }

    // ---- layout + projection ----
    let L = {};
    function layout(){
      const sbH = 18 + nP*34 + 10;
      const vt = sbH + 6, vb = H - 12;
      const laneHalf = Math.min(W*0.32, (vb - vt)*0.5);
      const s0 = laneHalf / LH, D = 520;
      const hy = vt + (vb - vt)*0.06, sy0 = vb - Math.max(70, (vb - vt)*0.14);
      L = {sbH, vt, vb, s0, D, F:s0*D, hy, sy0, HC:(sy0 - hy)/s0, cxm: W/2};
      // as the camera follows the ball it also rises, so the pin triangle opens up
      const tt = Math.max(0, camZ)/1500; L.HCe = L.HC*(1 + 1.4*tt); L.hye = hy - tt*(vb - vt)*0.43;
    }
    function proj(x, z, out){ const dz = z - camZ + L.D; const s = L.F / Math.max(dz, 30); out.x = L.cxm + x*s; out.y = L.hye + L.HCe*s; out.s = s; return out; }
    const P1 = {x:0,y:0,s:0}, P2 = {x:0,y:0,s:0}, P3 = {x:0,y:0,s:0}, P4 = {x:0,y:0,s:0};
    const xAtFoul = sx => { proj(0, 0, P1); return (sx - L.cxm)/P1.s; };

    // ---- physics ----
    function collide(a, ra, ma, b, rb, mb, e){
      const dx = b.x - a.x, dz = b.z - a.z, d2 = dx*dx + dz*dz, rr = ra + rb;
      if (d2 >= rr*rr || d2 < 1e-6) return 0;
      const d = Math.sqrt(d2), nx = dx/d, nz = dz/d, vrel = (b.vx - a.vx)*nx + (b.vz - a.vz)*nz;
      const over = rr - d, ia = 1/ma, ib = 1/mb, it = ia + ib;
      a.x -= nx*over*ia/it; a.z -= nz*over*ia/it; b.x += nx*over*ib/it; b.z += nz*over*ib/it;
      if (vrel >= 0) return 0;
      const j = -(1 + e)*vrel / it;
      a.vx -= j*ia*nx; a.vz -= j*ia*nz; b.vx += j*ib*nx; b.vz += j*ib*nz;
      // a little scatter so pin action looks lively
      const kick = (Math.random() - 0.5)*0.35*j*ib;
      b.vx += -nz*kick; b.vz += nx*kick;
      return -vrel;
    }
    const topple = p => { if (!p.down){ p.down = true; p.fallT = 0; p.ang = Math.atan2(p.vz, p.vx) || Math.PI/2; p.spin = (Math.random() - 0.5)*8; } };
    const rad = p => p.down ? PRF : PR;
    function step(dt){
      if (ball.active){
        if (!ball.gutter && ball.z > 820 && ball.z < HEADZ + 60) ball.vx += ball.spin*HOOK*dt;
        ball.x += ball.vx*dt; ball.z += ball.vz*dt; ball.rollA += Math.hypot(ball.vx, ball.vz)*dt/BR;
        ball.vz *= (1 - 0.015*dt);
        if (!ball.gutter && Math.abs(ball.x) > LH){ ball.gutter = true; ball.spin = 0; }
        if (ball.gutter){ const tx = Math.sign(ball.x)*(LH + GW/2); ball.x += (tx - ball.x)*Math.min(1, dt*14); ball.vx = 0; }
        if (ball.z > PITEND){ ball.active = false; }
        if (!ball.gutter && ball.z > HEADZ - 30 && ball.z < DECKEND + 20){
          for (const p of pins){ if (p.gone) continue; const hit = collide(ball, BR, MB, p, rad(p), MP, 0.8); if (hit > 30) topple(p); }
        }
      }
      for (let i = 0; i < 10; i++){
        const p = pins[i]; if (p.gone) continue;
        const sp = Math.hypot(p.vx, p.vz);
        if (sp > 0){ const dec = (p.down ? 260 : 900)*dt, k = Math.max(0, sp - dec)/sp; p.vx *= k; p.vz *= k; }
        p.x += p.vx*dt; p.z += p.vz*dt;
        if (!p.down && sp > 140) topple(p);
        if (p.down){ p.ang += p.spin*dt*Math.min(1, sp/120); if (p.fallT < 1) p.fallT = Math.min(1, p.fallT + dt*4.5); }
        if (Math.abs(p.x) > LH + 2 || p.z > DECKEND || p.z < HEADZ - 220){ p.down = true; p.gone = true; }
        for (let j = i + 1; j < 10; j++){
          const q = pins[j]; if (q.gone) continue;
          const hit = collide(p, rad(p), MP, q, rad(q), MP, 0.75);
          if (hit > 45){ if (p.down || sp > 60) topple(q); if (q.down) topple(p); }
        }
      }
    }
    const pinsMoving = () => pins.some(p => !p.gone && Math.hypot(p.vx, p.vz) > 4) || pins.some(p => p.down && !p.gone && p.fallT < 1);

    // ---- turn flow ----
    function startGame(n){
      nP = n; players = [newPlayer(api.name || 'You', api.avatar || '🙂')];
      if (n === 2) players.push(newPlayer('Player 2', '🐼'));
      cur = 0; frame = 0; fresh = true; hintOn = true; rack(); resetBall();
      ov.innerHTML = ''; ov.style.pointerEvents = 'none';
      setPhase('aim'); showPop(n === 2 ? players[0].av + ' ' + players[0].name + "'s turn" : 'Frame 1', C.accent, 1.1, true);
    }
    function resetBall(){ ball.x = 0; ball.z = 0; ball.vx = ball.vz = 0; ball.spin = 0; ball.gutter = false; ball.active = false; ball.rollA = 0; }
    function showPop(txt, col, dur, small){ popup = {txt, col, t:0, dur: dur || 1.3, small: !!small}; }
    function finishRoll(){
      const pl = players[cur], fr = pl.frames[frame];
      let n = 0; for (const p of pins) if (p.up0 && (p.down || p.gone)) n++;
      const standingBefore = pins.filter(p => p.up0).length;
      fr.push(n);
      let label, col = C.ink;
      if (fresh && n === 10){ label = 'Strike!'; col = '#e8541c'; if (!RM) api.confetti(25); }
      else if (!fresh && n === standingBefore && n > 0){ label = 'Spare!'; col = '#1c8f5a'; }
      else if (ball.gutter && n === 0) { label = 'Gutter ball'; col = C.mut; }
      else label = n === 1 ? '1 pin' : n + ' pins';
      lastResult = label;
      showPop(label, col, 1.4, !/!/.test(label));
      // decide what happens next
      let over = false, rerack = false;
      if (frame < 9){ if (fr.length === 1 && n === 10) over = true; else if (fr.length === 2) over = true; }
      else {
        if (fr.length === 1) rerack = n === 10;
        else if (fr.length === 2){ if (fr[0] === 10) rerack = fr[1] === 10; else if (fr[0] + fr[1] === 10) rerack = true; else over = true; }
        else over = true;
      }
      resT = 0; setPhase('result');
      pending = {over, rerack};
    }
    let pending = null;
    function nextTurn(){
      const {over, rerack} = pending; pending = null;
      if (over){
        // next player / frame
        let np = cur + 1, nf = frame;
        if (np >= nP){ np = 0; nf++; }
        if (nf >= 10){ endGame(); return; }
        const changed = np !== cur || nP === 1;
        cur = np; frame = nf; fresh = true; rack();
        if (nP === 2) showPop(players[cur].av + ' ' + players[cur].name + "'s turn", C.accent, 1.2, true);
        else if (changed) showPop('Frame ' + (frame + 1), C.accent, 1, true);
      } else if (rerack){ fresh = true; rack(); }
      else { fresh = false; sweep(); }
      for (const p of pins) p.up0 = !p.gone;
      resetBall(); setPhase('aim');
    }
    function endGame(){
      setPhase('end');
      const t1 = total(players[0]);
      const r = api.saveScore(t1) || {};
      const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      let rows = players.map(p => `<div style="display:flex;justify-content:space-between;gap:20px;font-size:22px;padding:4px 0"><span>${esc(p.av)} ${esc(p.name)}</span><b>${total(p)}</b></div>`).join('');
      let head = 'Game over!';
      if (nP === 2){ const t2 = total(players[1]); head = t1 === t2 ? "It's a tie!" : (t1 > t2 ? esc(players[0].name) + ' wins!' : 'Player 2 wins!'); }
      showCard(`<div style="font-size:52px;line-height:1">🎳</div>
        <h2 style="margin:6px 0 10px;font:700 30px ${HEAD_FONT}">${head}</h2>
        <div style="min-width:240px">${rows}</div>
        <p style="margin:10px 0 4px;color:${C.mut}">Your best: <b style="color:${C.ink}">${r.best != null ? r.best : t1}</b></p>
        ${r.isBest ? `<p style="margin:4px 0;font:700 24px ${HEAD_FONT};color:${C.sun}">🏆 New best!</p>` : ''}
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px">
          <button data-act="again" style="${btnCss(true)}">Play again</button>
          <button data-act="menu" style="${btnCss(false)}">Players</button></div>`);
    }

    // ---- overlay screens ----
    const btnCss = main => `min-height:56px;min-width:150px;padding:10px 22px;border-radius:16px;border:2px solid ${main ? C.accent : C.line};background:${main ? C.accent : C.panel};color:${main ? C.accentInk : C.ink};font:700 22px ${HEAD_FONT};cursor:pointer;touch-action:manipulation`;
    function showCard(html){
      ov.style.pointerEvents = 'auto';
      ov.innerHTML = `<div style="background:${C.panel};color:${C.ink};border:2px solid ${C.line};border-radius:22px;padding:22px 26px;text-align:center;max-width:440px;box-shadow:0 10px 40px rgba(0,0,0,.35);font-family:${TXT_FONT}">${html}</div>`;
    }
    function menu(){
      setPhase('menu'); resetBall(); rack(); players = []; nP = 1;
      showCard(`<div style="font-size:56px;line-height:1">🎳</div>
        <h2 style="margin:6px 0 4px;font:700 32px ${HEAD_FONT}">Bowling</h2>
        <p style="margin:0 0 14px;color:${C.mut}">Swipe up to roll. Curve it to spin!</p>
        ${api.best != null ? `<p style="margin:0 0 12px">🏆 Best: <b>${api.best}</b></p>` : ''}
        <div style="display:flex;flex-direction:column;gap:12px;align-items:stretch">
          <button data-act="p1" style="${btnCss(true)}">▶ 1 player</button>
          <button data-act="p2" style="${btnCss(false)}">👥 2 players (same iPad)</button></div>`);
    }
    const onOv = e => { const b = e.target.closest('button[data-act]'); if (!b) return; const a = b.dataset.act;
      if (a === 'p1') startGame(1); else if (a === 'p2') startGame(2); else if (a === 'again') startGame(nP); else if (a === 'menu') menu(); };
    ov.addEventListener('click', onOv);

    // ---- input: swipe ----
    const pt = e => ({x: e.clientX - rect.left, y: e.clientY - rect.top, t: e.timeStamp || performance.now()});
    function down(e){
      if (phase !== 'aim') return;
      rect = el.getBoundingClientRect(); layout();
      const p = pt(e);
      if (p.y < L.hy + (L.sy0 - L.hy)*0.4) return;
      ball.x = Math.max(-(LH - BR - 2), Math.min(LH - BR - 2, xAtFoul(p.x)));
      drag = {id: e.pointerId, pts: [p]}; hintOn = false;
      try { cv.setPointerCapture(e.pointerId); } catch(_){}
      setPhase('drag');
    }
    function move(e){
      if (!drag || e.pointerId !== drag.id) return;
      const p = pt(e); drag.pts.push(p); if (drag.pts.length > 80) drag.pts.splice(1, 1);
      const a = drag.pts[0]; guide = {dx: p.x - a.x, dy: p.y - a.y};
    }
    function up(e){
      if (!drag || e.pointerId !== drag.id) return;
      const p = pt(e); drag.pts.push(p);
      const pts = drag.pts; drag = null; guide = null;
      const a = pts[0], b = pts[pts.length - 1], dy = b.y - a.y, dx = b.x - a.x;
      if (dy > -40 || Math.abs(dx) > -dy*1.6){ setPhase('aim'); return; }
      // power from the swipe speed (last 120 ms, else whole swipe)
      let k = pts.length - 1; while (k > 0 && b.t - pts[k-1].t <= 120) k--;
      let dist = 0, dur = b.t - pts[k].t;
      for (let i = k + 1; i < pts.length; i++) dist += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y);
      if (dur < 20 || dist < 20){ dist = 0; for (let i = 1; i < pts.length; i++) dist += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y); dur = b.t - a.t; }
      const v = dur > 0 ? dist/dur*1000 * (700/Math.max(400, H)) : 3000;
      const vz = Math.max(470, Math.min(1080, 380 + v*0.33));
      // aim: extend the swipe to the head pin's row on screen
      proj(0, HEADZ, P1);
      const t = (P1.y - a.y)/dy; let tx = (a.x + dx*t - L.cxm)/P1.s;
      tx = ball.x + (tx - ball.x)*0.55; tx = Math.max(-LH - 20, Math.min(LH + 20, tx));
      // hook: how much the swipe bowed away from a straight line
      const len = Math.hypot(dx, dy); let bow = 0, nb = 0;
      for (let i = 1; i < pts.length - 1; i++){ const q = pts[i]; const f = ((q.x - a.x)*dx + (q.y - a.y)*dy)/(len*len); if (f < 0.2 || f > 0.8) continue;
        bow += (dx*(q.y - a.y) - dy*(q.x - a.x))/len; nb++; }
      bow = nb ? bow/nb/len : 0;
      const spin = Math.abs(bow) < 0.03 ? 0 : Math.max(-1, Math.min(1, -bow*5));
      ball.vz = vz; ball.vx = vz*(tx - ball.x)/HEADZ - spin*HOOK*0.55; ball.spin = spin; ball.active = true;
      rollT = 0; passT = -1; for (const p of pins) p.up0 = !p.gone && !p.down;
      setPhase('roll');
    }
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

    // ---- drawing ----
    function poly(pts, fill){ cx.beginPath(); cx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) cx.lineTo(pts[i].x, pts[i].y); cx.closePath(); cx.fillStyle = fill; cx.fill(); }
    const q = (x, z) => { const o = {x:0,y:0,s:0}; return proj(x, z, o); };
    function drawLane(){
      // backdrop
      const g = cx.createLinearGradient(0, L.vt, 0, L.vb); g.addColorStop(0, '#24164a'); g.addColorStop(1, '#120b26');
      cx.fillStyle = g; cx.fillRect(0, L.sbH, W, H - L.sbH);
      const zN = Math.max(camZ - L.D + 60, -260);
      // capping and gutters
      const o = LH + GW + 14;
      poly([q(-o, zN), q(o, zN), q(o, PITEND), q(-o, PITEND)], '#3a2a1c');
      for (const sgn of [-1, 1]){
        const g1 = q(sgn*LH, zN), g2 = q(sgn*(LH + GW), zN), g3 = q(sgn*(LH + GW), DECKEND), g4 = q(sgn*LH, DECKEND);
        poly([g1, g2, g3, g4], '#8c95a3');
        const m1 = q(sgn*(LH + GW*0.5), zN), m2 = q(sgn*(LH + GW*0.5), DECKEND);
        cx.strokeStyle = 'rgba(0,0,0,.25)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(m1.x, m1.y); cx.lineTo(m2.x, m2.y); cx.stroke();
      }
      // approach + lane
      if (zN < 0) poly([q(-LH, zN), q(LH, zN), q(LH, 0), q(-LH, 0)], '#e8c48a');
      const lg = cx.createLinearGradient(0, q(0, 0).y, 0, q(0, DECKEND).y); lg.addColorStop(0, '#e2b273'); lg.addColorStop(1, '#f2d39c');
      poly([q(-LH, Math.max(0, zN)), q(LH, Math.max(0, zN)), q(LH, DECKEND), q(-LH, DECKEND)], lg);
      // boards
      cx.strokeStyle = 'rgba(120,70,20,.18)'; cx.lineWidth = 1;
      for (let k = -6; k <= 6; k++){ const x = k*LH/6.5, a = q(x, Math.max(0, zN)), b = q(x, DECKEND); cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
      // foul line, dots and arrows
      if (zN < 0){ const a = q(-LH, 0), b = q(LH, 0); cx.strokeStyle = '#b3261e'; cx.lineWidth = Math.max(2, 3*a.s); cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
      cx.fillStyle = '#5b3a8c';
      for (let k = -3; k <= 3; k++){
        const x = k*13.6, z0 = 460 - Math.abs(k)*14; if (z0 < zN) continue;
        const t = q(x, z0 + 22), l = q(x - 2.4, z0), r = q(x + 2.4, z0);
        cx.beginPath(); cx.moveTo(t.x, t.y); cx.lineTo(l.x, l.y); cx.lineTo(r.x, r.y); cx.closePath(); cx.fill();
        if (zN < 200){ const d = q(x, 200); cx.beginPath(); cx.arc(d.x, d.y, Math.max(1.2, 1.4*d.s), 0, 6.283); cx.fill(); }
      }
      // pin spots
      cx.fillStyle = 'rgba(120,70,20,.35)';
      for (const p of pins){ const s = q(p.hx, p.hz); cx.beginPath(); cx.ellipse(s.x, s.y, 3*s.s, 1.5*s.s, 0, 0, 6.283); cx.fill(); }
      // pit and back wall
      poly([q(-o, DECKEND), q(o, DECKEND), q(o, PITEND), q(-o, PITEND)], '#140d0a');
      const bw = q(0, PITEND), wl = q(-o - 40, PITEND), wr = q(o + 40, PITEND), top = bw.y - 120*bw.s;
      const wg = cx.createLinearGradient(0, top, 0, bw.y); wg.addColorStop(0, '#3d2a86'); wg.addColorStop(1, '#1a1040');
      cx.fillStyle = wg; cx.fillRect(wl.x, top, wr.x - wl.x, bw.y - top);
      cx.fillStyle = '#f6c24a'; cx.font = `700 ${Math.max(10, 30*bw.s)}px ${HEAD_FONT}`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText('★  ★  ★', bw.x, top + 40*bw.s);
    }
    function pinShape(h, w){ // pin outline, base at (0,0), pointing up, h = height px, w = belly width px
      const hw = w/2;
      cx.beginPath(); cx.moveTo(-hw*0.55, 0);
      cx.bezierCurveTo(-hw*1.05, -h*0.15, -hw*1.1, -h*0.4, -hw*0.42, -h*0.66);
      cx.bezierCurveTo(-hw*0.3, -h*0.74, -hw*0.62, -h*0.86, -hw*0.5, -h*0.94);
      cx.bezierCurveTo(-hw*0.35, -h*1.02, hw*0.35, -h*1.02, hw*0.5, -h*0.94);
      cx.bezierCurveTo(hw*0.62, -h*0.86, hw*0.3, -h*0.74, hw*0.42, -h*0.66);
      cx.bezierCurveTo(hw*1.1, -h*0.4, hw*1.05, -h*0.15, hw*0.55, 0);
      cx.closePath();
    }
    function drawPinUp(p, s, tilt){
      const h = 38*s, w = 12.5*s;
      cx.save(); cx.translate(P2.x, P2.y);
      cx.fillStyle = 'rgba(0,0,0,.22)'; cx.beginPath(); cx.ellipse(0, 0, w*0.6, w*0.22, 0, 0, 6.283); cx.fill();
      if (tilt) cx.rotate(tilt);
      pinShape(h, w); cx.fillStyle = '#fbfbf7'; cx.fill(); cx.strokeStyle = 'rgba(60,40,30,.45)'; cx.lineWidth = Math.max(0.6, s*0.6); cx.stroke();
      cx.fillStyle = '#d42a2a'; cx.fillRect(-w*0.22, -h*0.76, w*0.44, h*0.035); cx.fillRect(-w*0.21, -h*0.71, w*0.42, h*0.035);
      cx.fillStyle = 'rgba(255,255,255,.7)'; cx.beginPath(); cx.ellipse(-w*0.18, -h*0.42, w*0.08, h*0.12, 0, 0, 6.283); cx.fill();
      cx.restore();
    }
    function drawPinDown(p){
      const ca = Math.cos(p.ang), sa = Math.sin(p.ang);
      proj(p.x - ca*7, p.z - sa*7, P3); proj(p.x + ca*28, p.z + sa*28, P4);
      const s = (P3.s + P4.s)/2, ang = Math.atan2(P4.y - P3.y, P4.x - P3.x), len = Math.hypot(P4.x - P3.x, P4.y - P3.y);
      cx.save(); cx.translate(P3.x, P3.y - 5*s); cx.rotate(ang + Math.PI/2);
      cx.scale(1, Math.max(0.25, len/(38*s)));
      pinShape(38*s, 11*s); cx.fillStyle = '#efefe8'; cx.fill(); cx.strokeStyle = 'rgba(60,40,30,.5)'; cx.lineWidth = Math.max(0.6, s*0.6); cx.stroke();
      cx.fillStyle = '#d42a2a'; cx.fillRect(-11*s*0.2, -38*s*0.76, 11*s*0.4, 38*s*0.05);
      cx.restore();
    }
    function drawBall(){
      proj(ball.x, ball.z, P2); const r = BR*P2.s, y = P2.y - r;
      cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(P2.x, P2.y, r*0.9, r*0.3, 0, 0, 6.283); cx.fill();
      const g = cx.createRadialGradient(P2.x - r*0.35, y - r*0.4, r*0.1, P2.x, y, r);
      g.addColorStop(0, '#9f86ff'); g.addColorStop(0.55, '#5530d6'); g.addColorStop(1, '#22105e');
      cx.fillStyle = g; cx.beginPath(); cx.arc(P2.x, y, r, 0, 6.283); cx.fill();
      // finger holes roll with the ball
      cx.fillStyle = 'rgba(10,5,30,.85)';
      const ph = ball.rollA;
      for (const [ox, oa] of [[-0.22, 0], [0.22, 0], [0, 0.55]]){
        const a = ph + oa, c = Math.cos(a); if (c < 0.15) continue;
        cx.beginPath(); cx.ellipse(P2.x + ox*r, y - Math.sin(a)*r*0.6, r*0.11, r*0.11*c, 0, 0, 6.283); cx.fill();
      }
    }
    function drawObjects(){
      // painter's order: far to near
      const list = [];
      for (const p of pins) if (!p.gone) list.push(p);
      if (ball.active || phase === 'aim' || phase === 'drag' || phase === 'menu') list.push(ball);
      list.sort((a, b) => b.z - a.z);
      for (const o of list){
        if (o === ball){ if (ball.z - camZ + L.D > 40) drawBall(); continue; }
        if (o.down && o.fallT >= 1) drawPinDown(o);
        else { proj(o.x, o.z, P2); const t = o.down ? (Math.cos(o.ang) >= 0 ? 1 : -1)*o.fallT*1.35 : 0; drawPinUp(o, P2.s, t); }
      }
    }
    function drawGuide(){
      if (phase === 'drag' && guide && guide.dy < -10){
        proj(ball.x, ball.z, P2); const y0 = P2.y - BR*P2.s;
        const len = Math.min(220, Math.hypot(guide.dx, guide.dy)*1.4), a = Math.atan2(guide.dy, guide.dx);
        cx.save(); cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.setLineDash([8, 8]); cx.lineWidth = 4; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(P2.x, y0); cx.lineTo(P2.x + Math.cos(a)*len, y0 + Math.sin(a)*len); cx.stroke(); cx.restore();
      }
      if ((phase === 'aim') && hintOn){
        proj(ball.x, ball.z, P2); const y0 = P2.y - BR*P2.s*2 - 14, t = performance.now()/1000;
        cx.fillStyle = 'rgba(255,255,255,.95)'; cx.font = `700 ${Math.max(16, Math.min(24, W/34))}px ${HEAD_FONT}`; cx.textAlign = 'center'; cx.textBaseline = 'bottom';
        cx.fillText('Swipe up to roll!', P2.x, y0 - (RM ? 0 : Math.abs(Math.sin(t*3))*8));
        cx.font = `500 ${Math.max(12, Math.min(16, W/52))}px ${TXT_FONT}`; cx.fillStyle = 'rgba(255,255,255,.75)';
        cx.fillText('Curve your swipe to spin', P2.x, y0 + 20);
      }
    }
    function rr(x, y, w, h, r){ cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
    function drawCard(){
      cx.fillStyle = C.panel; cx.fillRect(0, 0, W, L.sbH);
      cx.strokeStyle = C.line; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, L.sbH); cx.lineTo(W, L.sbH); cx.stroke();
      const pad = 8, nameW = Math.min(120, W*0.13), totW = Math.min(64, W*0.08), cw = (W - 2*pad - nameW - totW)/10.5;
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = C.mut; cx.font = `600 11px ${TXT_FONT}`;
      for (let f = 0; f < 10; f++) cx.fillText(String(f + 1), pad + nameW + f*cw + (f === 9 ? cw*0.75 : cw/2), 10);
      cx.fillText('Total', W - pad - totW/2, 10);
      const show = players.length ? players : [newPlayer(api.name || 'You', api.avatar || '🙂')];
      show.forEach((pl, pi) => {
        const y = 18 + pi*34, h = 30, sc = scoreOf(pl);
        cx.fillStyle = C.soft; rr(pad, y, W - 2*pad, h, 7); cx.fill();
        cx.fillStyle = C.ink; cx.textAlign = 'left'; cx.font = `700 14px ${TXT_FONT}`;
        let nm = pl.av + ' ' + pl.name; while (nm.length > 3 && cx.measureText(nm).width > nameW - 8) nm = nm.slice(0, -2) + '…';
        cx.fillText(nm, pad + 6, y + h/2);
        for (let f = 0; f < 10; f++){
          const x = pad + nameW + f*cw, w = f === 9 ? cw*1.5 : cw;
          const active = phase !== 'menu' && phase !== 'end' && pi === cur && f === frame;
          cx.fillStyle = active ? C.accent : C.panel; rr(x + 1, y + 1, w - 2, h - 2, 5); cx.fill();
          cx.strokeStyle = C.line; cx.lineWidth = 1; cx.stroke();
          const m = marks(pl.frames[f], f === 9), bw = Math.min(16, w/(m.length + 0.5));
          cx.font = `700 11px ${TXT_FONT}`; cx.textAlign = 'center';
          m.forEach((t, k) => { const bx = x + w - (m.length - k)*bw - 2;
            cx.strokeStyle = active ? 'rgba(255,255,255,.5)' : C.line; cx.strokeRect(bx, y + 2, bw, 12);
            cx.fillStyle = t === 'X' ? '#e8541c' : t === '/' ? '#1c8f5a' : (active ? C.accentInk : C.ink); cx.fillText(t, bx + bw/2, y + 8.5); });
          if (sc[f] != null){ cx.fillStyle = active ? C.accentInk : C.ink; cx.font = `700 12px ${TXT_FONT}`; cx.fillText(String(sc[f]), x + w/2, y + 22); }
        }
        cx.fillStyle = C.ink; cx.font = `800 16px ${HEAD_FONT}`; cx.textAlign = 'center';
        cx.fillText(String(total(pl)), W - pad - totW/2, y + h/2 + 1);
      });
    }
    function drawPopup(dt){
      if (!popup) return; popup.t += dt; if (popup.t > popup.dur){ popup = null; return; }
      const k = popup.t/popup.dur, sc = RM ? 1 : Math.min(1, popup.t*6)*(1 + 0.08*Math.sin(Math.min(1, popup.t*6)*Math.PI));
      const alpha = k > 0.8 ? (1 - k)/0.2 : 1, fs = popup.small ? Math.max(24, Math.min(40, W/22)) : Math.max(40, Math.min(78, W/11));
      const y = L.vt + (L.vb - L.vt)*0.36;
      cx.save(); cx.globalAlpha = alpha; cx.translate(W/2, y); cx.scale(sc, sc);
      cx.font = `800 ${fs}px ${HEAD_FONT}`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.lineWidth = fs*0.16; cx.strokeStyle = 'rgba(15,10,35,.85)'; cx.lineJoin = 'round'; cx.strokeText(popup.txt, 0, 0);
      cx.fillStyle = popup.col === C.ink || popup.col === C.mut ? '#ffffff' : popup.col === C.accent ? '#ffd65a' : popup.col; cx.fillText(popup.txt, 0, 0);
      cx.restore();
    }
    function drawTurn(){
      if (phase === 'menu' || phase === 'end' || !players.length) return;
      const pl = players[cur], fr = pl.frames[frame];
      const t = (nP === 2 ? pl.av + ' ' + pl.name + ' · ' : '') + 'Frame ' + (frame + 1) + ' · Ball ' + (fr.length + (phase === 'result' ? 0 : 1));
      cx.font = `700 15px ${TXT_FONT}`; const w = cx.measureText(t).width + 24;
      cx.fillStyle = 'rgba(10,6,25,.6)'; rr(W/2 - w/2, L.vt + 6, w, 28, 14); cx.fill();
      cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(t, W/2, L.vt + 20);
    }

    function drawPins(){ // little pin map, like the display above a real lane
      if (phase === 'menu' || phase === 'end') return;
      const sz = Math.max(13, Math.min(18, W/60)), w = sz*4.6, h = sz*4.2, x0 = W - w - 12, y0 = L.vt + 8;
      cx.fillStyle = 'rgba(10,6,25,.6)'; rr(x0, y0, w, h, 12); cx.fill();
      pins.forEach(p => { const r = Math.round((p.hz - HEADZ)/ROWD), px = x0 + w/2 + (p.hx/SP)*sz, py = y0 + h - sz*0.8 - r*sz*0.86;
        const up = !p.down && !p.gone; cx.beginPath(); cx.arc(px, py, sz*0.34, 0, 6.283);
        if (up){ cx.fillStyle = '#ffffff'; cx.fill(); } else { cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 1.5; cx.stroke(); } });
    }
    // ---- main loop ----
    function frameLoop(now){
      raf = requestAnimationFrame(frameLoop);
      const dt = Math.min(0.05, last ? (now - last)/1000 : 0.016); last = now;
      layout();
      if (phase === 'roll'){
        rollT += dt;
        const n = Math.min(12, Math.ceil(dt/(1/240)));
        for (let i = 0; i < n; i++) step(dt/n);
        if (passT < 0 && (ball.z > DECKEND || !ball.active)) passT = rollT;
        const settled = passT >= 0 && rollT - passT > 0.7 && !pinsMoving();
        if (settled || rollT > 9) finishRoll();
      } else if (phase === 'result'){
        resT += dt; const n = Math.min(12, Math.ceil(dt/(1/240))); for (let i = 0; i < n; i++) step(dt/n);
        if (resT > 1.35) nextTurn();
      }
      // camera follows the ball down the lane, then comes back
      const target = (phase === 'roll' || phase === 'result') ? Math.max(0, Math.min(1150, (ball.active ? ball.z : DECKEND) - 520)) : 0;
      camZ += (target - camZ)*Math.min(1, dt*(phase === 'aim' ? 4 : 2.6));
      layout(); drawLane(); drawObjects(); drawGuide(); drawTurn(); drawPins(); drawCard(); drawPopup(dt);
    }
    setPhase('menu'); menu();
    raf = requestAnimationFrame(frameLoop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
      ov.removeEventListener('click', onOv);
      el.innerHTML = '';
    };
  }};
})();
