// Tower Stacker: a block slides back and forth above the tower; tap to drop it.
// Whatever hangs over the edge is sliced off and falls away. A perfect drop keeps the width.
(function(){
  window.BreakGames = window.BreakGames || {};
  window.BreakGames.stack = {
    start(el, api){
      const C = api.colors, RM = !!api.reducedMotion;
      const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const HEAD = "'Baloo 2', 'Trebuchet MS', system-ui, sans-serif", TXT = 'Lexend, Verdana, system-ui, sans-serif';

      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.appendChild(cv);
      const cx = cv.getContext('2d');
      const ov = document.createElement('div');
      ov.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;z-index:5;background:rgba(10,20,40,.28)';
      el.appendChild(ov);
      const BTN = (act, label, primary) => `<button data-act="${act}" style="min-height:58px;min-width:170px;padding:10px 28px;border-radius:18px;border:none;font:800 24px ${HEAD};cursor:pointer;background:${primary ? C.accent : C.soft};color:${primary ? C.accentInk : C.ink};box-shadow:0 4px 0 rgba(0,0,0,.2);margin:6px">${label}</button>`;
      const card = inner => `<div style="background:${C.panel};color:${C.ink};border-radius:24px;padding:22px 26px;max-width:440px;width:100%;text-align:center;box-shadow:0 12px 34px rgba(0,0,0,.35);font-family:${TXT}">${inner}</div>`;
      const showOv = html => { ov.innerHTML = card(html); ov.style.display = 'flex'; };
      const hideOv = () => { ov.style.display = 'none'; ov.innerHTML = ''; };

      let W = 0, H = 0, dpr = 1, raf = 0, last = 0, alive = true;
      const size = () => { const r = el.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2.5); W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); cx.setTransform(dpr,0,0,dpr,0,0); };
      size(); window.addEventListener('resize', size);

      // World units: tower centred on x=0, block height BH; scale s maps units to pixels.
      const BH = 30, BASE_W = 200;
      let s = 1;
      const g = {
        mode: 'start', tower: [], cur: null, dir: 1, speed: 120, cam: 0, camT: 0,
        bits: [], pops: [], streak: 0, score: 0, over: 0, falling: null, time: 0, perfects: 0
      };
      el.__stack = g; // read-only peek for automated tests
      const range = () => Math.min(W/s/2 - 8, 250);
      const groundY = () => H - Math.max(46, H*0.08);
      const sy = u => groundY() - (u - g.cam)*s;          // world height -> screen y
      const sx = u => W/2 + u*s;
      const hue = n => (205 + n*11) % 360;
      const colorOf = n => `hsl(${hue(n)},72%,${58 - (n%2)*4}%)`;

      function newRound(){
        g.tower = [{x: 0, w: BASE_W, c: colorOf(0)}];
        g.bits.length = 0; g.pops.length = 0; g.streak = 0; g.score = 0; g.over = 0; g.falling = null; g.time = 0; g.perfects = 0;
        g.cam = 0; g.camT = 0; g.dir = 1; g.speed = 115;
        spawn();
        g.mode = 'play';
      }
      function spawn(){
        const top = g.tower[g.tower.length-1], n = g.tower.length;
        const R = range();
        g.dir = n % 2 ? 1 : -1;
        g.cur = {x: g.dir > 0 ? -R + top.w/2 : R - top.w/2, w: top.w, c: colorOf(n)};
        g.speed = Math.min(330, 115 + n*7) * (api.grade >= 5 ? 1.08 : 1);
      }
      function drop(){
        if (g.mode !== 'play' || !g.cur || g.falling) return;
        const top = g.tower[g.tower.length-1], b = g.cur, n = g.tower.length;
        const dx = b.x - top.x, tol = Math.max(4, b.w*0.035);
        if (Math.abs(dx) <= tol){
          b.x = top.x; g.streak++; g.perfects++;
          let grow = 0;
          if (g.streak >= 3 && b.w < BASE_W){ grow = Math.min(12, BASE_W - b.w); b.w += grow; }
          g.tower.push(b); g.score = g.tower.length - 1;
          pop(grow ? 'Perfect! Wider!' : (g.streak > 1 ? 'Perfect! x' + g.streak : 'Perfect!'), n, '#fff8c4');
        } else {
          const l = Math.max(b.x - b.w/2, top.x - top.w/2), r = Math.min(b.x + b.w/2, top.x + top.w/2);
          if (r - l <= 0.5){ // missed the tower entirely
            g.falling = {x: b.x, y: n*BH, w: b.w, c: b.c, vy: 0, vx: g.dir*40, rot: 0, vr: g.dir*1.6};
            g.cur = null; g.over = 1.3; return;
          }
          g.streak = 0;
          const cutL = b.x - b.w/2 < l ? {a: b.x - b.w/2, z: l} : {a: r, z: b.x + b.w/2};
          g.bits.push({x: (cutL.a + cutL.z)/2, y: n*BH, w: cutL.z - cutL.a, c: b.c, vy: 0, vx: (cutL.a < l || cutL.z <= l) ? -60 : 60, rot: 0, vr: (dx < 0 ? -1 : 1)*(1.5 + Math.random())});
          g.tower.push({x: (l + r)/2, w: r - l, c: b.c}); g.score = g.tower.length - 1;
          if (r - l < 18) pop('Careful!', n, '#ffd0d0');
        }
        g.cur = null; spawn();
      }
      function pop(t, n, col){ g.pops.push({t, y: n*BH + BH, life: 1, col}); }

      function finish(){
        g.mode = 'end';
        const res = api.saveScore(g.score);
        showOv(`<div style="font:800 34px ${HEAD};margin-bottom:4px">${g.score >= 30 ? '🚀 Into space!' : g.score >= 15 ? '🏙️ Sky high!' : '🧱 Tower down!'}</div>
          ${res.isBest ? `<div style="font:800 26px ${HEAD};color:${C.good};margin:4px 0">🏆 New best!</div>` : ''}
          <div style="font:800 54px ${HEAD};line-height:1.1">${g.score}</div><div style="color:${C.mut};margin-bottom:6px">blocks high</div>
          <div style="color:${C.mut};margin-bottom:10px">${g.perfects ? `✨ ${g.perfects} perfect drop${g.perfects === 1 ? '' : 's'} · ` : ''}Best: ${res.best}</div>
          ${BTN('again', 'Play again', true)}`);
      }
      function startScreen(){
        g.mode = 'start'; g.tower = [{x:0, w:BASE_W, c: colorOf(0)}]; g.cur = null; g.cam = g.camT = 0;
        showOv(`<div style="font-size:56px;line-height:1">🧱</div><div style="font:800 34px ${HEAD}">Tower Stacker</div>
          <div style="color:${C.mut};margin:4px 0 12px">Tap to drop the block. Line it up for a <b>Perfect!</b></div>
          ${api.best != null ? `<div style="margin-bottom:8px">🏆 Best: <b>${esc(api.best)}</b> blocks</div>` : ''}
          ${BTN('play', 'Play', true)}`);
      }
      ov.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; hideOv(); newRound(); });

      const down = e => { if (e.button > 0) return; e.preventDefault(); drop(); };
      cv.addEventListener('pointerdown', down);

      // ---------- drawing ----------
      const lerp = (a, b, t) => a + (b - a)*t;
      const mix = (c1, c2, t) => `rgb(${Math.round(lerp(c1[0],c2[0],t))},${Math.round(lerp(c1[1],c2[1],t))},${Math.round(lerp(c1[2],c2[2],t))})`;
      const SKY = [[[126,200,250],[214,240,255]], [[255,170,120],[255,220,170]], [[70,60,150],[150,110,190]], [[8,10,35],[30,30,80]]];
      const stars = []; for (let i = 0; i < 90; i++) stars.push({x: Math.random(), y: Math.random(), r: Math.random()*1.6 + 0.4, p: Math.random()*6});
      const clouds = []; for (let i = 0; i < 6; i++) clouds.push({x: Math.random(), h: 120 + i*130 + Math.random()*60, w: 60 + Math.random()*50, v: 8 + Math.random()*10});
      function skyAt(heightUnits){
        const k = Math.max(0, heightUnits)/BH/16; // one sky stage every 16 blocks
        const i = Math.min(SKY.length - 2, Math.floor(k)), t = Math.min(1, k - i);
        return [mix(SKY[i][0], SKY[i+1][0], t), mix(SKY[i][1], SKY[i+1][1], t), Math.min(1, Math.max(0, (k - 1.4)/1.2))];
      }
      function block(x, yU, w, c, rot){
        const px = sx(x), py = sy(yU), pw = w*s, ph = BH*s;
        cx.save(); cx.translate(px, py - ph/2); if (rot) cx.rotate(rot);
        cx.fillStyle = c; cx.fillRect(-pw/2, -ph/2, pw, ph);
        cx.fillStyle = 'rgba(255,255,255,.28)'; cx.fillRect(-pw/2, -ph/2, pw, Math.max(3, ph*0.2));
        cx.fillStyle = 'rgba(0,0,0,.16)'; cx.fillRect(-pw/2, ph/2 - Math.max(3, ph*0.16), pw, Math.max(3, ph*0.16));
        cx.strokeStyle = 'rgba(0,0,0,.25)'; cx.lineWidth = 1; cx.strokeRect(-pw/2 + .5, -ph/2 + .5, pw - 1, ph - 1);
        cx.restore();
      }
      function draw(){
        s = Math.max(0.7, Math.min(1.7, Math.min(W/440, H/600)));
        const sk = skyAt(g.cam + (groundY() - H/2)/s);
        const gr = cx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, sk[0]); gr.addColorStop(1, sk[1]);
        cx.fillStyle = gr; cx.fillRect(0, 0, W, H);
        if (sk[2] > 0){ // stars fade in as we climb into space
          cx.fillStyle = '#fff';
          for (const st of stars){ const yy = ((st.y*H + g.cam*s*0.15) % H + H) % H; cx.globalAlpha = sk[2]*(0.55 + 0.45*Math.sin(g.time*2 + st.p)); cx.beginPath(); cx.arc(st.x*W, yy, st.r, 0, 7); cx.fill(); }
          cx.globalAlpha = 1;
          cx.font = `${Math.round(56*s)}px sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
          cx.globalAlpha = sk[2]; cx.fillText('🪐', W*0.18, sy(40*BH)); cx.fillText('🌙', W*0.82, sy(52*BH)); cx.fillText('🛰️', W*0.75, sy(68*BH)); cx.globalAlpha = 1;
        }
        // clouds (low sky)
        cx.fillStyle = 'rgba(255,255,255,.8)';
        for (const c of clouds){ const y = sy(c.h); if (y < -40 || y > H + 40) continue; const x = ((c.x*W + g.time*c.v) % (W + 200)) - 100; const r = c.w*s*0.35;
          cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.arc(x + r, y - r*0.4, r*1.1, 0, 7); cx.arc(x + r*2.1, y, r*0.9, 0, 7); cx.fill(); }
        // ground
        const gy = sy(0);
        if (gy < H + 10){ cx.fillStyle = '#5fbf5a'; cx.fillRect(0, gy, W, H - gy + 2); cx.fillStyle = '#4aa646'; cx.fillRect(0, gy, W, 6);
          cx.font = `${Math.round(30*s)}px sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'bottom'; cx.fillText('🌳', sx(-range() + 10), gy + 4); cx.fillText('🏠', sx(range() - 20), gy + 4); }
        // tower (only what is on screen)
        for (let i = 0; i < g.tower.length; i++){ const b = g.tower[i], y = sy(i*BH); if (y < -BH*s || y - BH*s > H) continue; block(b.x, i*BH, b.w, b.c, 0); }
        for (const b of g.bits) block(b.x, b.y, b.w, b.c, b.rot);
        if (g.falling) block(g.falling.x, g.falling.y, g.falling.w, g.falling.c, g.falling.rot);
        if (g.cur){ const n = g.tower.length; block(g.cur.x, n*BH, g.cur.w, g.cur.c, 0);
          // a faint guide showing where the top block is
          const top = g.tower[n-1]; cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.setLineDash([5, 6]); cx.lineWidth = 2;
          cx.beginPath(); cx.moveTo(sx(top.x - top.w/2), sy(n*BH)); cx.lineTo(sx(top.x - top.w/2), sy(n*BH) - BH*s); cx.moveTo(sx(top.x + top.w/2), sy(n*BH)); cx.lineTo(sx(top.x + top.w/2), sy(n*BH) - BH*s); cx.stroke(); cx.setLineDash([]); }
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        for (const p of g.pops){ cx.globalAlpha = Math.min(1, p.life*1.6); cx.font = `800 ${Math.round(30*Math.min(1.3, s))}px ${HEAD}`; cx.lineWidth = 5; cx.strokeStyle = 'rgba(0,0,0,.45)';
          const y = sy(p.y) - (1 - p.life)*50; cx.strokeText(p.t, W/2, y); cx.fillStyle = p.col; cx.fillText(p.t, W/2, y); }
        cx.globalAlpha = 1;
        if (g.mode === 'play'){
          // height badge
          cx.fillStyle = 'rgba(0,0,0,.35)'; const bw = 150; cx.beginPath(); cx.roundRect ? cx.roundRect(W/2 - bw/2, 12, bw, 48, 16) : cx.rect(W/2 - bw/2, 12, bw, 48); cx.fill();
          cx.fillStyle = '#fff'; cx.font = `800 30px ${HEAD}`; cx.fillText('🧱 ' + g.score, W/2, 38);
          if (g.tower.length === 1 && !g.bits.length){ cx.font = `700 22px ${HEAD}`; cx.lineWidth = 5; cx.strokeStyle = 'rgba(0,0,0,.4)'; cx.strokeText('Tap anywhere to drop!', W/2, 86); cx.fillStyle = '#fff'; cx.fillText('Tap anywhere to drop!', W/2, 86); }
        }
      }

      function step(dt){
        g.time += dt;
        if (g.mode === 'play'){
          if (g.cur){ const R = range(); g.cur.x += g.dir*g.speed*dt;
            if (g.cur.x + g.cur.w/2 > R){ g.cur.x = R - g.cur.w/2; g.dir = -1; } else if (g.cur.x - g.cur.w/2 < -R){ g.cur.x = -R + g.cur.w/2; g.dir = 1; } }
          if (g.falling){ const f = g.falling; f.vy -= 900*dt; f.y += f.vy*dt; f.x += f.vx*dt; f.rot += f.vr*dt; }
          if (g.over > 0){ g.over -= dt; if (g.over <= 0) finish(); }
        }
        for (let i = g.bits.length - 1; i >= 0; i--){ const b = g.bits[i]; b.vy -= 900*dt; b.y += b.vy*dt; b.x += b.vx*dt; b.rot += b.vr*dt; if (sy(b.y) > H + 120) g.bits.splice(i, 1); }
        for (let i = g.pops.length - 1; i >= 0; i--){ g.pops[i].life -= dt*0.8; if (g.pops[i].life <= 0) g.pops.splice(i, 1); }
        const n = g.tower.length;
        g.camT = Math.max(0, n*BH + BH - (groundY() - H*0.42)/s);
        g.cam += (g.camT - g.cam)*Math.min(1, dt*4);
      }
      const frame = t => {
        if (!alive) return;
        const dt = Math.min(0.05, last ? (t - last)/1000 : 0.016); last = t;
        step(dt); draw(); raf = requestAnimationFrame(frame);
      };
      startScreen();
      raf = requestAnimationFrame(frame);

      return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size); cv.removeEventListener('pointerdown', down); el.innerHTML = ''; delete el.__stack; };
    }
  };
})();
