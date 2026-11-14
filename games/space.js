// Space Dodge: drag anywhere to steer the rocket left and right. Dodge the falling rocks,
// grab stars, pick up a shield. Three hits and the round is over. Score = stars + time bonus.
(function(){
  window.BreakGames = window.BreakGames || {};
  window.BreakGames.space = {
    start(el, api){
      const C = api.colors, RM = !!api.reducedMotion;
      const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const HEAD = "'Baloo 2', 'Trebuchet MS', system-ui, sans-serif", TXT = 'Lexend, Verdana, system-ui, sans-serif';

      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.appendChild(cv);
      const cx = cv.getContext('2d');
      const ov = document.createElement('div');
      ov.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;z-index:5;background:rgba(5,8,25,.45)';
      el.appendChild(ov);
      const BTN = (act, label, primary) => `<button data-act="${act}" style="min-height:58px;min-width:170px;padding:10px 28px;border-radius:18px;border:none;font:800 24px ${HEAD};cursor:pointer;background:${primary ? C.accent : C.soft};color:${primary ? C.accentInk : C.ink};box-shadow:0 4px 0 rgba(0,0,0,.2);margin:6px">${label}</button>`;
      const card = inner => `<div style="background:${C.panel};color:${C.ink};border-radius:24px;padding:22px 26px;max-width:440px;width:100%;text-align:center;box-shadow:0 12px 34px rgba(0,0,0,.4);font-family:${TXT}">${inner}</div>`;
      const showOv = html => { ov.innerHTML = card(html); ov.style.display = 'flex'; };
      const hideOv = () => { ov.style.display = 'none'; ov.innerHTML = ''; };

      let W = 0, H = 0, dpr = 1, raf = 0, last = 0, alive = true;
      const size = () => { const r = el.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2.5); W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); cx.setTransform(dpr,0,0,dpr,0,0); if (g) g.x = Math.max(30, Math.min(W - 30, g.x)); };

      // Prerendered emoji sprites: drawing text every frame is slow on iPads.
      const sprites = {};
      function sprite(ch, px){
        const k = ch + px; if (sprites[k]) return sprites[k];
        const c = document.createElement('canvas'), d = Math.min(window.devicePixelRatio || 1, 2.5), sz = Math.ceil(px*1.3);
        c.width = c.height = Math.ceil(sz*d); const x = c.getContext('2d'); x.scale(d, d);
        x.font = `${px}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, sz/2, sz/2 + px*0.05);
        return (sprites[k] = {c, sz});
      }
      const stamp = (ch, px, x, y, rot) => { const sp = sprite(ch, px); if (rot){ cx.save(); cx.translate(x, y); cx.rotate(rot); cx.drawImage(sp.c, -sp.sz/2, -sp.sz/2, sp.sz, sp.sz); cx.restore(); } else cx.drawImage(sp.c, x - sp.sz/2, y - sp.sz/2, sp.sz, sp.sz); };

      // Rock shapes: a few lumpy polygons, prerendered once per size bucket.
      const rockCache = {};
      function rockSprite(kind, r){
        const k = kind + '|' + r; if (rockCache[k]) return rockCache[k];
        const d = Math.min(window.devicePixelRatio || 1, 2.5), sz = Math.ceil(r*2.4), c = document.createElement('canvas'); c.width = c.height = Math.ceil(sz*d);
        const x = c.getContext('2d'); x.scale(d, d); x.translate(sz/2, sz/2);
        let seed = kind*97 + 13; const rnd = () => (seed = (seed*9301 + 49297) % 233280)/233280;
        x.beginPath(); const n = 11;
        for (let i = 0; i < n; i++){ const a = i/n*Math.PI*2, rr = r*(0.82 + rnd()*0.26); i ? x.lineTo(Math.cos(a)*rr, Math.sin(a)*rr) : x.moveTo(Math.cos(a)*rr, Math.sin(a)*rr); }
        x.closePath();
        const gr = x.createRadialGradient(-r*0.35, -r*0.35, r*0.1, 0, 0, r*1.1); const tint = ['#9a8f86','#8d7b6a','#a08a7a','#7f8794'][kind%4];
        gr.addColorStop(0, '#d6cdc4'); gr.addColorStop(0.5, tint); gr.addColorStop(1, '#4a4038');
        x.fillStyle = gr; x.fill(); x.lineWidth = 2; x.strokeStyle = 'rgba(30,20,10,.5)'; x.stroke();
        x.fillStyle = 'rgba(40,30,20,.35)';
        for (let i = 0; i < 4; i++){ const a = rnd()*6.28, rr = rnd()*r*0.5, cr = r*(0.1 + rnd()*0.16); x.beginPath(); x.arc(Math.cos(a)*rr, Math.sin(a)*rr, cr, 0, 7); x.fill(); }
        return (rockCache[k] = {c, sz});
      }

      const stars = [[], [], []];
      for (let L = 0; L < 3; L++) for (let i = 0; i < 40 + L*10; i++) stars[L].push({x: Math.random(), y: Math.random(), r: 0.5 + L*0.6 + Math.random()*0.6});
      const LAYER_SPEED = [18, 45, 95];

      let g = null;
      g = {mode: 'start', x: 0, tx: 0, t: 0, lives: 3, stars: 0, rocks: [], items: [], sparks: [], pops: [], inv: 0, shield: 0, spawnT: 0, itemT: 2, shieldT: 14, shake: 0, endT: 0};
      el.__space = g; // read-only peek for automated tests
      size(); window.addEventListener('resize', size);
      g.x = g.tx = W/2;
      const rocketY = () => H - Math.max(70, H*0.13);
      const unit = () => Math.max(0.75, Math.min(1.4, Math.min(W, H*1.2)/700));

      function newRound(){
        Object.assign(g, {mode: 'play', t: 0, lives: 3, stars: 0, inv: 1, shield: 0, spawnT: 0.6, itemT: 1.6, shieldT: 12 + Math.random()*6, shake: 0, endT: 0});
        g.rocks.length = 0; g.items.length = 0; g.sparks.length = 0; g.pops.length = 0;
        g.x = g.tx = W/2;
      }
      const speedNow = () => (150 + g.t*5.5) * (H/700) * (api.grade >= 5 ? 1.1 : 1);
      const scoreOf = () => g.stars + Math.floor(g.t/3);

      function spawnRock(){
        const u = unit(), r = (18 + Math.random()*(14 + Math.min(18, g.t*0.4)))*u;
        g.rocks.push({x: r + Math.random()*(W - 2*r), y: -r - 10, r, vy: speedNow()*(0.75 + Math.random()*0.5), vx: (Math.random() - 0.5)*30*u, rot: Math.random()*6, vr: (Math.random() - 0.5)*2, kind: Math.floor(Math.random()*4)});
      }
      function spawnItem(type){
        const u = unit(); g.items.push({type, x: 40 + Math.random()*(W - 80), y: -30, vy: speedNow()*0.6, r: 22*u, ph: Math.random()*6});
      }
      function burst(x, y, col, n){ for (let i = 0; i < n; i++){ const a = Math.random()*6.28, v = 60 + Math.random()*180; g.sparks.push({x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, life: 0.6 + Math.random()*0.4, col}); } }
      function pop(t, x, y, col){ g.pops.push({t, x, y, life: 1, col}); }

      function step(dt){
        // parallax stars always drift
        for (let L = 0; L < 3; L++){ const v = LAYER_SPEED[L]*(g.mode === 'play' ? 1 + g.t/60 : 1)*dt/H; for (const s of stars[L]){ s.y += v; if (s.y > 1){ s.y -= 1; s.x = Math.random(); } } }
        for (let i = g.sparks.length - 1; i >= 0; i--){ const p = g.sparks[i]; p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt; if (p.life <= 0) g.sparks.splice(i, 1); }
        for (let i = g.pops.length - 1; i >= 0; i--){ const p = g.pops[i]; p.y -= 40*dt; p.life -= dt; if (p.life <= 0) g.pops.splice(i, 1); }
        if (g.mode !== 'play') return;
        g.t += dt;
        g.x += (g.tx - g.x)*Math.min(1, dt*14);
        g.inv = Math.max(0, g.inv - dt); g.shield = Math.max(0, g.shield - dt); g.shake = Math.max(0, g.shake - dt);
        g.spawnT -= dt;
        if (g.spawnT <= 0){ spawnRock(); g.spawnT = Math.max(0.28, 0.95 - g.t*0.012) * (0.7 + Math.random()*0.6); if (g.t > 40 && Math.random() < 0.25) spawnRock(); }
        g.itemT -= dt; if (g.itemT <= 0){ spawnItem('star'); g.itemT = 0.9 + Math.random()*1.2; }
        g.shieldT -= dt; if (g.shieldT <= 0){ spawnItem('shield'); g.shieldT = 16 + Math.random()*10; }
        const u = unit(), ry = rocketY(), rr = 22*u;
        for (let i = g.rocks.length - 1; i >= 0; i--){ const k = g.rocks[i]; k.y += k.vy*dt; k.x += k.vx*dt; k.rot += k.vr*dt;
          if (k.x < k.r || k.x > W - k.r) k.vx = -k.vx;
          if (k.y - k.r > H){ g.rocks.splice(i, 1); continue; }
          const dx = k.x - g.x, dy = k.y - ry, hitR = k.r*0.78 + rr;
          if (dx*dx + dy*dy < hitR*hitR){
            if (g.shield > 0){ g.shield = 0; g.inv = 0.8; burst(k.x, k.y, '#7fe3ff', 18); pop('Shield!', g.x, ry - 60, '#9eeaff'); g.rocks.splice(i, 1); continue; }
            if (g.inv > 0) continue;
            g.lives--; g.inv = 1.6; g.shake = RM ? 0 : 0.35; burst(k.x, k.y, '#ffb36b', 22); g.rocks.splice(i, 1);
            if (g.lives <= 0){ burst(g.x, ry, '#ff7a5c', 40); g.mode = 'crash'; g.endT = 1.1; return; }
            pop('Ouch!', g.x, ry - 60, '#ffb3a7');
          }
        }
        for (let i = g.items.length - 1; i >= 0; i--){ const it = g.items[i]; it.y += it.vy*dt; it.ph += dt*3;
          if (it.y - it.r > H){ g.items.splice(i, 1); continue; }
          const dx = it.x - g.x, dy = it.y - ry, R = it.r + rr*1.1;
          if (dx*dx + dy*dy < R*R){
            g.items.splice(i, 1);
            if (it.type === 'star'){ g.stars++; burst(it.x, it.y, '#ffe066', 10); pop('+1 ⭐', it.x, it.y - 20, '#fff2a8'); }
            else { g.shield = 9; burst(it.x, it.y, '#7fe3ff', 16); pop('Shield on!', it.x, it.y - 20, '#9eeaff'); }
          }
        }
      }
      function finish(){
        g.mode = 'end';
        const sc = scoreOf(), secs = Math.floor(g.t), bonus = Math.floor(g.t/3);
        const res = api.saveScore(sc);
        showOv(`<div style="font:800 34px ${HEAD};margin-bottom:2px">💥 Rocket down!</div>
          ${res.isBest ? `<div style="font:800 26px ${HEAD};color:${C.good};margin:4px 0">🏆 New best!</div>` : ''}
          <div style="font:800 56px ${HEAD};line-height:1.1">${sc}</div>
          <div style="color:${C.mut};margin:2px 0 6px">⭐ ${g.stars} star${g.stars === 1 ? '' : 's'} + ⏱️ ${bonus} time bonus (${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')})</div>
          <div style="margin-bottom:10px">Best: <b>${res.best}</b></div>
          ${BTN('again', 'Play again', true)}`);
      }
      function startScreen(){
        g.mode = 'start';
        showOv(`<div style="font-size:56px;line-height:1">🚀</div><div style="font:800 34px ${HEAD}">Space Dodge</div>
          <div style="color:${C.mut};margin:4px 0 12px">Drag left and right to steer. Dodge rocks, grab ⭐, catch a 🛡️ shield!</div>
          ${api.best != null ? `<div style="margin-bottom:8px">🏆 Best: <b>${esc(api.best)}</b></div>` : ''}
          ${BTN('play', 'Play', true)}`);
      }
      ov.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; hideOv(); newRound(); });

      // Relative drag: the finger can be anywhere, so it never covers the rocket.
      let drag = null;
      const px = e => { const r = cv.getBoundingClientRect(); return e.clientX - r.left; };
      const down = e => { if (e.button > 0) return; e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(_){} drag = {id: e.pointerId, x0: px(e), r0: g.tx}; };
      const move = e => { if (!drag || e.pointerId !== drag.id) return; e.preventDefault(); g.tx = Math.max(26, Math.min(W - 26, drag.r0 + (px(e) - drag.x0)*1.25)); };
      const up = e => { if (drag && e.pointerId === drag.id) drag = null; };
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

      function draw(){
        const gr = cx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#060818'); gr.addColorStop(1, '#1b1446');
        cx.fillStyle = gr; cx.fillRect(0, 0, W, H);
        cx.save();
        if (g.shake > 0) cx.translate((Math.random() - 0.5)*10*g.shake/0.35, (Math.random() - 0.5)*10*g.shake/0.35);
        // nebula glow
        const neb = (x, y, r, col) => { const q = cx.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, col); q.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = q; cx.fillRect(x - r, y - r, 2*r, 2*r); };
        neb(W*0.2, H*0.3, H*0.4, 'rgba(140,90,230,.22)'); neb(W*0.85, H*0.65, H*0.35, 'rgba(40,170,230,.16)');
        for (let L = 0; L < 3; L++){ cx.fillStyle = L === 2 ? '#ffffff' : L === 1 ? '#c9d4ff' : '#7f8bb8'; for (const s of stars[L]){ cx.fillRect(s.x*W, s.y*H, s.r, s.r*(L === 2 ? 2.5 : 1)); } }
        const u = unit();
        for (const it of g.items){
          if (it.type === 'star'){ cx.fillStyle = 'rgba(255,236,140,.38)'; cx.beginPath(); cx.arc(it.x, it.y, it.r*1.25 + Math.sin(it.ph)*3, 0, 7); cx.fill(); stamp('⭐', Math.round(34*u), it.x, it.y, Math.sin(it.ph)*0.25); }
          else { cx.strokeStyle = 'rgba(127,227,255,.7)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(it.x, it.y, it.r*1.3 + Math.sin(it.ph)*3, 0, 7); cx.stroke(); stamp('🛡️', Math.round(36*u), it.x, it.y, 0); }
        }
        for (const k of g.rocks){ const sp = rockSprite(k.kind, Math.round(k.r/4)*4); cx.save(); cx.translate(k.x, k.y); cx.rotate(k.rot); cx.drawImage(sp.c, -sp.sz/2, -sp.sz/2, sp.sz, sp.sz); cx.restore(); }
        const ry = rocketY();
        if (g.mode !== 'crash' && g.mode !== 'end'){
          const blink = g.inv > 0 && g.mode === 'play' && (RM ? true : Math.floor(g.t*12) % 2 === 0);
          cx.globalAlpha = blink ? 0.4 : 1;
          // flame
          const fl = 14 + Math.random()*10;
          const fg = cx.createLinearGradient(0, ry + 18*u, 0, ry + (30 + fl)*u); fg.addColorStop(0, '#fff3b0'); fg.addColorStop(0.5, '#ff9d3b'); fg.addColorStop(1, 'rgba(255,60,40,0)');
          cx.fillStyle = fg; cx.beginPath(); cx.moveTo(g.x - 9*u, ry + 18*u); cx.quadraticCurveTo(g.x, ry + (34 + fl)*u, g.x + 9*u, ry + 18*u); cx.fill();
          stamp('🚀', Math.round(52*u), g.x, ry, -Math.PI/4 + (g.tx - g.x)*0.004);
          cx.globalAlpha = 1;
          if (g.shield > 0){ const a = g.shield < 2 ? (Math.floor(g.t*8) % 2 ? 0.25 : 0.7) : 0.65; cx.strokeStyle = `rgba(127,227,255,${a})`; cx.fillStyle = `rgba(127,227,255,${a*0.18})`; cx.lineWidth = 3; cx.beginPath(); cx.arc(g.x, ry, 42*u, 0, 7); cx.fill(); cx.stroke(); }
          // avatar pilot badge
          if (api.avatar){ stamp(api.avatar, Math.round(22*u), g.x + 30*u, ry + 18*u, 0); }
        }
        for (const p of g.sparks){ cx.globalAlpha = Math.max(0, Math.min(1, p.life*1.5)); cx.fillStyle = p.col; cx.fillRect(p.x - 2, p.y - 2, 4, 4); }
        cx.globalAlpha = 1;
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        for (const p of g.pops){ cx.globalAlpha = Math.min(1, p.life*1.5); cx.font = `800 26px ${HEAD}`; cx.fillStyle = p.col; cx.fillText(p.t, p.x, p.y); }
        cx.globalAlpha = 1;
        cx.restore();
        if (g.mode === 'play' || g.mode === 'crash'){
          // HUD
          cx.fillStyle = 'rgba(0,0,0,.4)'; cx.beginPath(); if (cx.roundRect) cx.roundRect(12, 12, 156, 46, 16); else cx.rect(12, 12, 156, 46); cx.fill();
          for (let i = 0; i < 3; i++){ cx.globalAlpha = i < g.lives ? 1 : 0.25; stamp('❤️', 28, 40 + i*46, 35, 0); } cx.globalAlpha = 1;
          const sc = scoreOf(), tw = 190;
          cx.fillStyle = 'rgba(0,0,0,.4)'; cx.beginPath(); if (cx.roundRect) cx.roundRect(W - tw - 12, 12, tw, 46, 16); else cx.rect(W - tw - 12, 12, tw, 46); cx.fill();
          cx.fillStyle = '#fff'; cx.font = `800 26px ${HEAD}`; cx.textAlign = 'right'; cx.fillText('⭐ ' + g.stars + '   🏁 ' + sc, W - 28, 37); cx.textAlign = 'center';
          if (g.t < 3.5 && g.mode === 'play'){ cx.globalAlpha = Math.min(1, 3.5 - g.t); cx.font = `800 26px ${HEAD}`; cx.fillStyle = '#fff'; cx.fillText('👆 Drag anywhere to steer', W/2, H*0.42); cx.globalAlpha = 1; }
        }
      }
      const frame = t => {
        if (!alive) return;
        const dt = Math.min(0.05, last ? (t - last)/1000 : 0.016); last = t;
        step(dt);
        if (g.mode === 'crash'){ g.endT -= dt; if (g.endT <= 0) finish(); }
        draw(); raf = requestAnimationFrame(frame);
      };
      startScreen();
      raf = requestAnimationFrame(frame);

      return () => {
        alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size);
        cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
        el.innerHTML = ''; delete el.__space;
      };
    }
  };
})();
