// Fishing: pull back and let go to cast from the dock. Wait for the bobber to dip, tap to hook,
// then hold and release to keep the fish in the green zone while you reel. Every species caught
// swims in your aquarium. A round is 2 minutes or 10 casts.
(function(){
  window.BreakGames = window.BreakGames || {};
  window.BreakGames.fishing = {
    start(el, api){
      const C = api.colors, RM = !!api.reducedMotion;
      const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const HEAD = "'Baloo 2', 'Trebuchet MS', system-ui, sans-serif", TXT = 'Lexend, Verdana, system-ui, sans-serif';
      const EMOJI = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
      const ROUND_TIME = 120, ROUND_CASTS = 10;

      // ---------- species ----------
      // d: depth range (0 = just under the surface, 1 = the deep far water); w: how common; diff: how hard to reel.
      const SPECIES = [
        {id:'minnow',  name:'Minnow',         ch:'🐟', d:[0,.6],   w:30,  pts:5,   cm:[6,14],    diff:.05},
        {id:'shrimp',  name:'Shrimp',         ch:'🦐', d:[0,.55],  w:12,  pts:6,   cm:[4,10],    diff:.08},
        {id:'sunny',   name:'Sunny Fish',     ch:'🐠', d:[0,.75],  w:24,  pts:8,   cm:[10,22],   diff:.12},
        {id:'puffer',  name:'Pufferfish',     ch:'🐡', d:[.2,.85], w:14,  pts:12,  cm:[15,30],   diff:.25},
        {id:'crab',    name:'Crab',           ch:'🦀', d:[.45,1],  w:13,  pts:12,  cm:[12,25],   diff:.2},
        {id:'boot',    name:'Old Boot',       ch:'👢', d:[.3,1],   w:6,   pts:1,   cm:[24,30],   diff:0},
        {id:'squid',   name:'Squid',          ch:'🦑', d:[.4,1],   w:10,  pts:16,  cm:[25,60],   diff:.35},
        {id:'lobster', name:'Lobster',        ch:'🦞', d:[.55,1],  w:7,   pts:22,  cm:[25,50],   diff:.4},
        {id:'octopus', name:'Octopus',        ch:'🐙', d:[.55,1],  w:8,   pts:20,  cm:[30,90],   diff:.45},
        {id:'turtle',  name:'Sea Turtle',     ch:'🐢', d:[.3,1],   w:6,   pts:25,  cm:[40,110],  diff:.5},
        {id:'shark',   name:'Shark',          ch:'🦈', d:[.65,1],  w:4,   pts:40,  cm:[120,300], diff:.8},
        {id:'rainbow', name:'Rainbow Fish',   ch:'🐠', d:[.2,1],   w:2.5, pts:50,  cm:[15,30],   diff:.55, fx:'rainbow', rare:true},
        {id:'golden',  name:'Golden Fish',    ch:'🐟', d:[.4,1],   w:2,   pts:75,  cm:[20,40],   diff:.65, fx:'gold', rare:true},
        {id:'chest',   name:'Treasure Chest', ch:'',   d:[.7,1],   w:1.4, pts:100, cm:[50,70],   diff:.5,  fx:'chest', rare:true}];
      const BY = {}; SPECIES.forEach(s => BY[s.id] = s);
      const article = n => /^[AEIOU]/.test(n) ? 'an' : 'a';
      const sizeTxt = cm => cm >= 100 ? (cm/100).toFixed(1) + ' m' : Math.round(cm) + ' cm';

      // ---------- sprites (prerendered; gold and rainbow are tinted copies) ----------
      const DPR = () => Math.min(window.devicePixelRatio || 1, 2.5);
      const spCache = {};
      function drawChest(x, s){
        x.fillStyle = '#8a4b1f'; x.fillRect(-s*.42, -s*.08, s*.84, s*.42);
        x.fillStyle = '#a65f2a'; x.beginPath(); x.moveTo(-s*.42, -s*.08); x.quadraticCurveTo(0, -s*.42, s*.42, -s*.08); x.closePath(); x.fill();
        x.fillStyle = '#f2c230'; x.fillRect(-s*.42, -s*.1, s*.84, s*.06); x.fillRect(-s*.3, -s*.3, s*.07, s*.64); x.fillRect(s*.23, -s*.3, s*.07, s*.64);
        x.fillStyle = '#ffe680'; x.fillRect(-s*.06, -s*.06, s*.12, s*.14);
        x.strokeStyle = '#4a2408'; x.lineWidth = Math.max(1, s*.03); x.strokeRect(-s*.42, -s*.08, s*.84, s*.42);
        x.fillStyle = 'rgba(255,240,150,.9)'; for (const [a, b] of [[-.25,-.3],[.1,-.36],[.3,-.25]]){ x.beginPath(); x.arc(a*s, b*s, s*.035, 0, 7); x.fill(); }
      }
      function sprite(sp, px){
        const k = sp.id + '|' + px; if (spCache[k]) return spCache[k];
        const d = DPR(), sz = Math.ceil(px*1.35), c = document.createElement('canvas'); c.width = c.height = Math.ceil(sz*d);
        const x = c.getContext('2d'); x.scale(d, d); x.translate(sz/2, sz/2);
        if (sp.fx === 'chest') drawChest(x, px);
        else { x.font = `${px}px ${EMOJI}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(sp.ch, 0, px*.05); }
        if (sp.fx === 'gold' || sp.fx === 'rainbow'){
          x.globalCompositeOperation = 'source-atop';
          const gr = x.createLinearGradient(-px/2, -px/2, px/2, px/2);
          if (sp.fx === 'gold'){ gr.addColorStop(0, 'rgba(255,240,140,.85)'); gr.addColorStop(.5, 'rgba(240,180,20,.75)'); gr.addColorStop(1, 'rgba(255,225,90,.85)'); }
          else for (let i = 0; i <= 6; i++) gr.addColorStop(i/6, `hsla(${i*55},95%,60%,.62)`);
          x.fillStyle = gr; x.fillRect(-sz/2, -sz/2, sz, sz);
          x.globalCompositeOperation = 'source-over';
          x.fillStyle = 'rgba(255,255,255,.95)'; for (const [a, b] of [[-.3,-.25],[.25,-.3],[.1,.25]]){ x.beginPath(); x.arc(a*px, b*px, px*.035, 0, 7); x.fill(); }
        }
        return (spCache[k] = {c, sz});
      }
      const urlCache = {};
      const spriteURL = sp => urlCache[sp.id] || (urlCache[sp.id] = sprite(sp, 64).c.toDataURL());
      function drawSp(ctx, sp, px, x, y, flip, rot, alpha){
        const s = sprite(sp, px); ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1); if (rot) ctx.rotate(rot); if (alpha != null) ctx.globalAlpha = alpha;
        ctx.drawImage(s.c, -s.sz/2, -s.sz/2, s.sz, s.sz); ctx.restore();
      }
      const emoSp = {}; const emo = ch => emoSp[ch] || (emoSp[ch] = {id: 'e' + ch, ch});

      // ---------- DOM ----------
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
      el.appendChild(cv);
      const cx = cv.getContext('2d');
      const ov = document.createElement('div');
      ov.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;z-index:5;background:rgba(8,30,50,.32)';
      el.appendChild(ov);
      const BTN = (act, label, primary, extra) => `<button data-act="${act}" style="min-height:58px;min-width:170px;padding:10px 26px;border-radius:18px;border:none;font:800 23px ${HEAD};cursor:pointer;background:${primary ? C.accent : C.soft};color:${primary ? C.accentInk : C.ink};box-shadow:0 4px 0 rgba(0,0,0,.2);margin:6px;${extra||''}">${label}</button>`;
      const card = inner => `<div style="background:${C.panel};color:${C.ink};border-radius:24px;padding:20px 24px;max-width:460px;width:100%;max-height:100%;overflow:auto;text-align:center;box-shadow:0 12px 34px rgba(0,0,0,.35);font-family:${TXT}">${inner}</div>`;
      const showOv = (html, raw) => { ov.innerHTML = raw ? html : card(html); ov.style.display = 'flex'; ov.style.padding = raw ? '0' : '16px'; };
      const hideOv = () => { ov.style.display = 'none'; ov.innerHTML = ''; aqCv = null; };

      let W = 0, H = 0, raf = 0, last = 0, alive = true;
      const size = () => { const r = el.getBoundingClientRect(), d = DPR(); W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W*d); cv.height = Math.round(H*d); cx.setTransform(d,0,0,d,0,0); if (aqCv) aqSize(); };
      window.addEventListener('resize', size);

      // ---------- saved aquarium ----------
      const loadAq = () => { const a = api.store.get('aq'); return a && typeof a === 'object' ? a : {}; };
      let aq = loadAq();
      const saveAq = () => { try{ api.store.set('aq', aq); }catch(e){} };

      // ---------- world geometry ----------
      const surfY = () => Math.round(H*0.3);
      const dockX = () => Math.max(140, W*0.2);
      const deepY = () => H - 18;
      const botY = x => { const t = Math.max(0, Math.min(1, (x - dockX())/(W - dockX()))); return Math.min(deepY(), surfY() + (H - surfY())*(0.42 + 0.55*t) + Math.sin(x*0.02)*6); };
      const rodTip = () => ({x: dockX() + 34, y: surfY() - 112});
      const avPos = () => ({x: dockX() - 34, y: surfY() - 46});
      const landX = p => dockX() + 70 + p*(W - dockX() - 140);

      const g = {mode: 'start', phase: 'aim', time: 0, casts: 0, score: 0, caught: [], msg: null, drag: null, power: 0,
        bob: {x: 0, y: 0}, hook: {x: 0, y: 0, ty: 0}, fly: 0, fish: null, sp: null, phT: 0, nibbles: 0, dip: 0,
        reel: null, ambient: [], bubbles: [], ripples: [], pending: null, hold: false, waitT: 0};
      el.__fish = g; // read-only peek for automated tests

      function pickSpecies(depth){
        const list = SPECIES.filter(s => depth >= s.d[0] - 0.05 && depth <= s.d[1] + 0.05);
        let tot = 0; for (const s of list) tot += s.w*(depth > 0.6 && s.d[0] > 0.4 ? 1.4 : 1);
        let r = Math.random()*tot;
        for (const s of list){ r -= s.w*(depth > 0.6 && s.d[0] > 0.4 ? 1.4 : 1); if (r <= 0) return s; }
        return list[0] || SPECIES[0];
      }
      function makeAmbient(){
        g.ambient.length = 0;
        const n = Math.max(5, Math.round(W/150));
        for (let i = 0; i < n; i++){
          const depth = Math.random();
          const choices = SPECIES.filter(s => !s.rare && s.id !== 'boot' && s.id !== 'crab' && s.id !== 'lobster' && depth >= s.d[0] && depth <= s.d[1]);
          const sp = choices[Math.floor(Math.random()*choices.length)] || SPECIES[0];
          g.ambient.push({sp, depth, x: Math.random()*W, v: (Math.random() < .5 ? -1 : 1)*(18 + Math.random()*26), ph: Math.random()*6, px: 26 + Math.round(sp.cm[1]/12)*2});
        }
      }
      function newRound(){
        Object.assign(g, {mode: 'play', phase: 'aim', time: 0, casts: 0, score: 0, msg: null, drag: null, power: 0, fish: null, sp: null, reel: null, pending: null, hold: false});
        g.caught = []; g.ripples.length = 0; makeAmbient();
      }
      function say(t, col, dur){ g.msg = {t, col: col || '#fff', life: dur || 1.6}; }

      // ---------- input ----------
      const pt = e => { const r = cv.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
      const down = e => {
        if (e.button > 0 || g.mode !== 'play') return; e.preventDefault();
        try{ cv.setPointerCapture(e.pointerId); }catch(_){}
        const p = pt(e);
        if (g.phase === 'aim'){ g.drag = {id: e.pointerId, x0: p.x, y0: p.y, x: p.x, y: p.y}; g.phase = 'drag'; g.power = 0; }
        else if (g.phase === 'wait'){ if (g.nibT > 0){ scare(); } }
        else if (g.phase === 'bite'){ startReel(); }
        else if (g.phase === 'reel'){ g.hold = true; g.holdId = e.pointerId; }
      };
      const move = e => { if (!g.drag || e.pointerId !== g.drag.id) return; e.preventDefault(); const p = pt(e); g.drag.x = p.x; g.drag.y = p.y;
        const dx = g.drag.x0 - p.x, dy = p.y - g.drag.y0; // pulling back = left and/or down
        g.power = Math.max(0, Math.min(1, Math.hypot(Math.max(dx, -dx*0.6), Math.max(dy, -dy*0.6))/(Math.min(W, H)*0.42))); };
      const up = e => {
        if (g.phase === 'reel' && e.pointerId === g.holdId) g.hold = false;
        if (!g.drag || e.pointerId !== g.drag.id) return;
        g.drag = null;
        if (g.phase !== 'drag') return;
        if (g.power < 0.08){ g.phase = 'aim'; say('Pull back further, then let go!', '#fff', 1.6); return; }
        cast(g.power);
      };
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

      // ---------- the cast ----------
      function cast(p){
        g.casts++; g.phase = 'fly'; g.fly = 0; g.power = p;
        const lx = landX(p); g.flyFrom = rodTip(); g.flyTo = {x: lx, y: surfY()};
        g.hook.x = lx; g.hook.y = surfY(); g.hook.ty = surfY() + (botY(lx) - surfY())*0.82;
      }
      function landed(){
        g.phase = 'sink'; g.bob.x = g.flyTo.x; g.bob.y = surfY(); g.ripples.push({x: g.bob.x, r: 4, life: 1});
        const depth = Math.max(0, Math.min(1, (g.hook.ty - surfY())/(deepY() - surfY())));
        g.sp = pickSpecies(depth);
        g.waitT = 1.4 + Math.random()*2.4; g.phT = 0; g.nibT = 0;
        g.nibbles = Math.floor(Math.random()*(api.grade >= 5 ? 3 : 2));
        const fromLeft = g.hook.x > W*0.75 ? true : g.hook.x < W*0.45 ? false : Math.random() < .5;
        g.fish = {x: fromLeft ? -60 : W + 60, y: g.hook.ty + (Math.random() - .5)*30, px: Math.round(Math.min(64, 34 + (g.sp.cm[1] > 100 ? 26 : g.sp.cm[1]/4))), flip: fromLeft, wig: 0};
      }
      function scare(){ say('Too soon! It swam away.', '#ffd7a8'); fishFlee(); }
      function fishFlee(){ if (g.fish){ g.fleeing = g.fish; g.fleeing.flee = 1; } g.fish = null; g.phase = 'gone'; g.phT = 1.4; }
      function startReel(){
        const sp = g.sp, k = api.grade >= 5 ? 0.9 : 1;
        g.phase = 'reel'; g.hold = false;
        g.reel = {p: 0.35, v: 0, z: 0.5, zt: 0.5, zTimer: 0, hz: Math.max(0.085, (0.19 - sp.diff*0.085)*k), prog: 0.3, diff: sp.diff, t: 0};
        say('Hooked! Hold to reel up!', '#c8ffd0', 1.4);
      }
      function caught(){
        const sp = g.sp, f = Math.random(), sz = sp.cm[0] + (sp.cm[1] - sp.cm[0])*f*f*0.6 + (sp.cm[1] - sp.cm[0])*Math.random()*0.4;
        const pts = Math.max(1, Math.round(sp.pts*(0.75 + 0.5*(sz - sp.cm[0])/Math.max(1, sp.cm[1] - sp.cm[0]))));
        g.score += pts; g.caught.push({id: sp.id, cm: sz, pts});
        const rec = aq[sp.id] || {n: 0, big: 0}; const isNew = !rec.n; const bigger = rec.n && sz > rec.big;
        rec.n++; rec.big = Math.max(rec.big || 0, Math.round(sz)); aq[sp.id] = rec; saveAq();
        g.phase = 'card'; g.reel = null; g.hold = false;
        if (sp.rare) api.confetti(50);
        const done = g.casts >= ROUND_CASTS || g.time >= ROUND_TIME;
        showOv(`<img src="${spriteURL(sp)}" alt="" style="width:96px;height:96px;display:block;margin:0 auto 2px">
          <div style="font:800 30px ${HEAD};line-height:1.15">You caught ${article(sp.name)} ${esc(sp.name)}!</div>
          <div style="margin:6px 0;font-size:18px">📏 ${sizeTxt(sz)} &nbsp;·&nbsp; <b>+${pts}</b> points</div>
          ${isNew ? `<div style="font:800 20px ${HEAD};color:${C.good}">✨ New in your aquarium!</div>` : bigger ? `<div style="font:800 20px ${HEAD};color:${C.good}">📏 Your biggest one yet!</div>` : ''}
          ${sp.id === 'boot' ? `<div style="color:${C.mut}">Oops, not a fish!</div>` : ''}
          ${BTN('next', done ? 'See my score' : 'Cast again', true)}`);
      }
      function lost(t){ say(t || 'It got away!', '#ffd7a8'); fishFlee(); }

      function endRound(){
        g.mode = 'end'; g.phase = 'aim'; g.drag = null; g.fish = null; g.reel = null;
        const res = api.saveScore(g.score);
        const tally = {}; g.caught.forEach(c => tally[c.id] = (tally[c.id] || 0) + 1);
        const icons = Object.keys(tally).map(id => `<span style="display:inline-flex;align-items:center;margin:2px 6px"><img src="${spriteURL(BY[id])}" alt="" style="width:34px;height:34px">${tally[id] > 1 ? '×' + tally[id] : ''}</span>`).join('');
        const big = g.caught.slice().sort((a, b) => b.pts - a.pts)[0];
        showOv(`<div style="font:800 32px ${HEAD}">🎣 Time to dock!</div>
          ${res.isBest ? `<div style="font:800 26px ${HEAD};color:${C.good};margin:2px 0">🏆 New best!</div>` : ''}
          <div style="font:800 54px ${HEAD};line-height:1.05">${g.score}</div><div style="color:${C.mut}">points</div>
          <div style="margin:8px 0">${icons || `<span style="color:${C.mut}">No catches this time</span>`}</div>
          ${big ? `<div style="color:${C.mut};margin-bottom:4px">Best catch: ${esc(BY[big.id].name)} (${sizeTxt(big.cm)})</div>` : ''}
          <div style="margin-bottom:6px">Best: <b>${res.best}</b></div>
          ${BTN('again', 'Play again', true)}${BTN('aq', '🐠 Aquarium', false)}`);
      }
      function startScreen(){
        g.mode = 'start'; aq = loadAq();
        const have = SPECIES.filter(s => aq[s.id] && aq[s.id].n).length;
        if (!g.ambient.length) makeAmbient();
        showOv(`<div style="font-size:54px;line-height:1">🎣</div><div style="font:800 34px ${HEAD}">Fishing</div>
          <div style="color:${C.mut};margin:4px 0 10px">Pull back and let go to cast. Tap when the bobber dips!</div>
          ${api.best != null ? `<div style="margin-bottom:6px">🏆 Best: <b>${esc(api.best)}</b> points</div>` : ''}
          ${BTN('play', 'Play', true)}<br>${BTN('aq', `🐠 My Aquarium (${have}/${SPECIES.length})`, false)}`);
      }

      // ---------- aquarium ----------
      let aqCv = null, aqCx = null, aqW = 0, aqH = 0, aqFish = [], aqBubbles = [];
      function aqSize(){ const r = aqCv.getBoundingClientRect(), d = DPR(); aqW = Math.max(1, r.width); aqH = Math.max(1, r.height); aqCv.width = Math.round(aqW*d); aqCv.height = Math.round(aqH*d); aqCx.setTransform(d,0,0,d,0,0); }
      function openAquarium(from){
        g.mode = 'aquarium'; g.aqFrom = from; aq = loadAq();
        const have = SPECIES.filter(s => aq[s.id] && aq[s.id].n).length;
        const tiles = SPECIES.map(s => { const r = aq[s.id], ok = r && r.n;
          return `<div style="background:${C.soft};border-radius:16px;padding:8px 4px;display:flex;flex-direction:column;align-items:center;min-width:0">
            <div style="position:relative;width:48px;height:48px"><img src="${spriteURL(s)}" alt="" style="width:48px;height:48px;${ok ? '' : 'filter:brightness(0);opacity:.28'}">${ok ? '' : `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 24px ${HEAD};color:${C.mut}">?</span>`}</div>
            <div style="font:600 13px ${TXT};text-align:center;line-height:1.15;min-height:30px;display:flex;align-items:center">${ok ? esc(s.name) : '???'}</div>
            <div style="font:800 16px ${HEAD};color:${ok ? C.ink : C.mut}">${ok ? '×' + r.n : '–'}</div></div>`; }).join('');
        showOv(`<div style="position:absolute;inset:0;display:flex;flex-direction:column;background:${C.panel};color:${C.ink};font-family:${TXT}">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;gap:10px">
            <div style="font:800 26px ${HEAD}">🐠 My Aquarium <span style="font-size:18px;color:${C.mut}">${have} of ${SPECIES.length} found</span></div>
            ${BTN('back', 'Back', true, 'min-width:110px;margin:0')}</div>
          <canvas data-aq style="flex:1;min-height:150px;width:100%;display:block;touch-action:none"></canvas>
          <div style="max-height:46%;overflow:auto;touch-action:pan-y;padding:10px 12px 14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px">${tiles}</div></div>`, true);
        aqCv = ov.querySelector('[data-aq]'); aqCx = aqCv.getContext('2d'); aqSize();
        aqFish = [];
        SPECIES.forEach(s => { const r = aq[s.id]; if (!r || !r.n) return; for (let i = 0; i < Math.min(3, r.n); i++) aqFish.push({sp: s, x: Math.random()*aqW, y: 0.15 + Math.random()*0.7, v: (Math.random() < .5 ? -1 : 1)*(20 + Math.random()*30), ph: Math.random()*6, px: s.id === 'shark' ? 64 : s.id === 'turtle' ? 54 : 42, floor: ['crab','lobster','chest','boot'].includes(s.id)}); });
        aqBubbles = []; for (let i = 0; i < 18; i++) aqBubbles.push({x: Math.random(), y: Math.random(), r: 2 + Math.random()*4, v: 0.05 + Math.random()*0.08});
      }
      function drawAquarium(dt){
        if (!aqCv) return;
        const c = aqCx, w = aqW, h = aqH;
        const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5fc8e8'); gr.addColorStop(1, '#1b6c9a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
        c.fillStyle = '#e8d29a'; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 20) c.lineTo(x, h - 18 - Math.sin(x*0.03)*6); c.lineTo(w, h); c.fill();
        c.strokeStyle = '#2f9e5a'; c.lineWidth = 6; c.lineCap = 'round';
        for (let i = 0; i < 6; i++){ const bx = (i + 0.5)/6*w; c.beginPath(); c.moveTo(bx, h - 14); for (let k = 1; k < 6; k++) c.lineTo(bx + Math.sin(performance.now()/650 + k + i)*8, h - 14 - k*Math.min(22, h/10)); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,.5)';
        for (const b of aqBubbles){ b.y -= b.v*dt; if (b.y < -0.05){ b.y = 1.05; b.x = Math.random(); } c.beginPath(); c.arc(b.x*w, b.y*h, b.r, 0, 7); c.fill(); }
        if (!aqFish.length){ c.fillStyle = 'rgba(255,255,255,.92)'; c.font = `700 22px ${HEAD}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Empty tank! Go catch something 🎣', w/2, h/2); }
        for (const f of aqFish){
          f.ph += dt*2; f.x += f.v*dt*(f.floor ? 0.4 : 1);
          if (f.x < 30){ f.x = 30; f.v = Math.abs(f.v); } if (f.x > w - 30){ f.x = w - 30; f.v = -Math.abs(f.v); }
          const y = f.floor ? h - 30 - f.px*0.3 : 20 + f.y*(h - 70) + Math.sin(f.ph)*6;
          drawSp(c, f.sp, f.px, f.x, y, f.v > 0, f.floor ? 0 : Math.sin(f.ph)*0.08);
        }
      }

      ov.addEventListener('click', e => {
        const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
        if (a === 'play' || a === 'again'){ hideOv(); newRound(); }
        else if (a === 'aq') openAquarium(g.mode);
        else if (a === 'back'){ hideOv(); startScreen(); }
        else if (a === 'next'){ hideOv(); g.phase = 'aim'; g.fish = null; if (g.casts >= ROUND_CASTS || g.time >= ROUND_TIME) endRound(); }
      });

      // ---------- update ----------
      function step(dt){
        for (const a of g.ambient){ a.x += a.v*dt; a.ph += dt*2; if (a.x < -60) a.x = W + 60; if (a.x > W + 60) a.x = -60; }
        for (let i = g.ripples.length - 1; i >= 0; i--){ const r = g.ripples[i]; r.r += 40*dt; r.life -= dt*0.9; if (r.life <= 0) g.ripples.splice(i, 1); }
        if (g.fleeing){ const f = g.fleeing; f.x += (f.flip ? -1 : 1)*260*dt; f.flee -= dt; if (f.flee <= 0) g.fleeing = null; }
        if (g.msg){ g.msg.life -= dt; if (g.msg.life <= 0) g.msg = null; }
        if (g.mode !== 'play') return;
        if (g.phase !== 'card') g.time += dt;
        const ph = g.phase;
        if (ph === 'fly'){
          g.fly += dt/0.75; if (g.fly >= 1) landed();
          else { const t = g.fly, a = g.flyFrom, b = g.flyTo; g.bob.x = a.x + (b.x - a.x)*t; g.bob.y = a.y + (b.y - a.y)*t - Math.sin(t*Math.PI)*(80 + g.power*90); }
        } else if (ph === 'sink' || ph === 'wait' || ph === 'bite'){
          g.hook.y += (g.hook.ty - g.hook.y)*Math.min(1, dt*3);
          if (ph === 'sink' && g.hook.ty - g.hook.y < 4) g.phase = 'wait';
          const f = g.fish;
          if (f && g.phase === 'wait'){
            g.waitT -= dt;
            const tx = g.hook.x + (f.flip ? -1 : 1)*f.px*0.55, ty = g.hook.y;
            const k = Math.max(0, Math.min(1, 1 - g.waitT/2.5));
            f.x += (tx - f.x)*Math.min(1, dt*(0.4 + k*2.5)); f.y += (ty - f.y)*Math.min(1, dt*2);
            if (g.waitT <= 0){
              g.phT += dt;
              if (g.nibbles > 0){ g.nibT = Math.max(0, (g.nibT || 0) - dt); if (g.phT > 0.75){ g.phT = 0; g.nibbles--; g.nibT = 0.3; g.ripples.push({x: g.bob.x, r: 3, life: .6}); } }
              else if (g.phT > 0.5){ g.phase = 'bite'; g.phT = 0; g.nibT = 0; g.ripples.push({x: g.bob.x, r: 6, life: 1}); }
            }
          } else if (g.phase === 'bite'){
            g.phT += dt;
            if (g.phT > (api.grade >= 5 ? 1.0 : 1.25)) lost('Too slow! It got away.');
          }
          if (g.phase === 'wait' || g.phase === 'bite'){
            if (g.time >= ROUND_TIME){ lost("Time's up!"); }
          }
        } else if (ph === 'gone'){
          g.phT -= dt; g.hook.y += (surfY() - g.hook.y)*Math.min(1, dt*4);
          if (g.phT <= 0){ g.phase = 'aim'; if (g.casts >= ROUND_CASTS || g.time >= ROUND_TIME) endRound(); }
        } else if (ph === 'reel'){
          const r = g.reel; r.t += dt;
          r.v += (g.hold ? 3.4 : -2.9)*dt; r.v *= Math.pow(0.35, dt); r.p += r.v*dt;
          if (r.p < 0){ r.p = 0; r.v = Math.abs(r.v)*0.25; } if (r.p > 1){ r.p = 1; r.v = -Math.abs(r.v)*0.25; }
          r.zTimer -= dt;
          if (r.zTimer <= 0){ r.zt = r.hz + Math.random()*(1 - 2*r.hz); r.zTimer = (1.5 - r.diff*0.8)*(0.6 + Math.random()*0.8); }
          r.z += (r.zt - r.z)*Math.min(1, dt*(0.8 + r.diff*2.6));
          const inZone = Math.abs(r.p - r.z) < r.hz;
          r.prog += inZone ? dt*0.3*(1 - r.diff*0.35) : -dt*0.17;
          r.in = inZone;
          // the fish on the line drifts towards the dock as you reel
          if (g.fish){ g.fish.wig += dt*(inZone ? 6 : 14); const k = Math.max(0, Math.min(1, r.prog));
            g.fish.x = g.hook.x + (dockX() + 30 - g.hook.x)*k*0.85 + Math.sin(g.fish.wig)*6; g.fish.y = g.hook.ty + (surfY() + 30 - g.hook.ty)*k + Math.cos(g.fish.wig*0.7)*4; g.fish.flip = false; }
          if (r.prog >= 1) caught();
          else if (r.prog <= 0) lost('It got away!');
        } else if (ph === 'aim' || ph === 'drag'){
          if (ph === 'aim' && (g.casts >= ROUND_CASTS || g.time >= ROUND_TIME)) endRound();
        }
      }

      // ---------- draw ----------
      const clouds = []; for (let i = 0; i < 4; i++) clouds.push({x: Math.random(), y: 0.06 + Math.random()*0.14, s: 0.7 + Math.random()*0.6, v: 6 + Math.random()*8});
      function rr(x, y, w, h, r){ cx.beginPath(); if (cx.roundRect) cx.roundRect(x, y, w, h, r); else cx.rect(x, y, w, h); }
      function label(t, x, y, px, col){ cx.font = `800 ${px}px ${HEAD}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineWidth = 5; cx.strokeStyle = 'rgba(0,30,50,.55)'; cx.strokeText(t, x, y); cx.fillStyle = col || '#fff'; cx.fillText(t, x, y); }
      function draw(dt){
        const S = surfY(), dx = dockX();
        // sky
        let gr = cx.createLinearGradient(0, 0, 0, S); gr.addColorStop(0, '#7cc8f2'); gr.addColorStop(1, '#d9f1ff'); cx.fillStyle = gr; cx.fillRect(0, 0, W, S + 2);
        cx.fillStyle = '#ffe27a'; cx.beginPath(); cx.arc(W - 80, S*0.32, Math.min(34, S*0.18), 0, 7); cx.fill();
        cx.fillStyle = 'rgba(255,255,255,.9)';
        for (const c of clouds){ const x = ((c.x*W + g.time*c.v + (g.mode !== 'play' ? performance.now()/1000*c.v : 0)) % (W + 160)) - 80, y = c.y*H, r = 16*c.s;
          cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.arc(x + r*1.1, y - r*0.5, r*1.2, 0, 7); cx.arc(x + r*2.3, y, r, 0, 7); cx.fill(); }
        // far shore
        cx.fillStyle = '#7cc47a'; cx.beginPath(); cx.moveTo(dx, S); cx.quadraticCurveTo(W*0.6, S - 26, W, S - 10); cx.lineTo(W, S); cx.fill();
        // water
        gr = cx.createLinearGradient(0, S, 0, H); gr.addColorStop(0, '#3fb3dc'); gr.addColorStop(1, '#0d4f78'); cx.fillStyle = gr; cx.fillRect(0, S, W, H - S);
        cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 2; cx.beginPath();
        for (let x = 0; x <= W; x += 12){ const y = S + Math.sin(x*0.05 + performance.now()/600)*2; x ? cx.lineTo(x, y) : cx.moveTo(x, y); } cx.stroke();
        // sea floor
        cx.fillStyle = '#c9a86a'; cx.beginPath(); cx.moveTo(0, H); for (let x = 0; x <= W + 10; x += 14) cx.lineTo(x, botY(x)); cx.lineTo(W, H); cx.fill();
        cx.fillStyle = '#b08f55'; for (let x = 20; x < W; x += 70){ cx.beginPath(); cx.arc(x, botY(x) + 6, 6, 0, 7); cx.fill(); }
        // seaweed
        cx.strokeStyle = '#2e9a58'; cx.lineWidth = 5; cx.lineCap = 'round';
        for (let i = 1; i < 8; i++){ const bx = dx + (W - dx)*i/8, by = botY(bx); cx.beginPath(); cx.moveTo(bx, by); for (let k = 1; k < 5; k++) cx.lineTo(bx + Math.sin(performance.now()/700 + k + i)*6, by - k*14); cx.stroke(); }
        // ambient fish
        for (const a of g.ambient){ const y = S + 24 + a.depth*(deepY() - S - 60) + Math.sin(a.ph)*5; drawSp(cx, a.sp, a.px, a.x, Math.min(y, botY(a.x) - a.px*0.6), a.v > 0, 0, 0.85); }
        // dock
        cx.fillStyle = '#7a4a26'; for (let x = 18; x < dx; x += 46) cx.fillRect(x, S - 14, 10, Math.min(H - S + 14, botY(x) - S + 30));
        cx.fillStyle = '#a8703f'; cx.fillRect(0, S - 26, dx + 6, 18); cx.fillStyle = '#8b5a2f'; for (let x = 0; x < dx; x += 24) cx.fillRect(x, S - 26, 2, 18);
        // avatar and rod
        const av = avPos(), tip0 = rodTip();
        let tip = tip0;
        if (g.phase === 'drag'){ tip = {x: tip0.x - 60*g.power, y: tip0.y + 30*g.power}; }
        else if (g.phase === 'reel'){ const b = Math.sin(performance.now()/90)*4 + 14; tip = {x: tip0.x + 6, y: tip0.y + b}; }
        else if (g.phase === 'bite'){ tip = {x: tip0.x + 4, y: tip0.y + 12}; }
        cx.strokeStyle = '#5b3a1e'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(av.x + 14, av.y + 6); cx.quadraticCurveTo((av.x + tip.x)/2, Math.min(av.y, tip.y) - 10, tip.x, tip.y); cx.stroke();
        drawSp(cx, emo(api.avatar || '🙂'), 52, av.x, av.y, false, 0);
        // line, bobber, hook
        const showLine = ['fly','sink','wait','bite','reel','gone'].includes(g.phase) && g.mode === 'play';
        if (showLine){
          let bx = g.bob.x, by = g.bob.y;
          if (g.phase !== 'fly'){ const nib = (g.nibT || 0) > 0 ? Math.sin(((0.3 - g.nibT)/0.3)*Math.PI)*6 : 0; by = S - 2 + Math.sin(performance.now()/400)*1.5 + nib + (g.phase === 'bite' ? 14 : 0) + (g.phase === 'reel' ? 10 : 0); }
          if (g.phase === 'reel' && g.fish){ bx = g.fish.x; }
          cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(tip.x, tip.y); cx.quadraticCurveTo((tip.x + bx)/2, Math.max(tip.y, by) - (g.phase === 'fly' ? 0 : 20), bx, by); cx.stroke();
          if (g.phase !== 'fly'){ const hx = g.phase === 'reel' && g.fish ? g.fish.x : g.hook.x, hy = g.phase === 'reel' && g.fish ? g.fish.y : g.hook.y;
            cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.beginPath(); cx.moveTo(bx, by); cx.lineTo(hx, hy); cx.stroke();
            cx.strokeStyle = '#d8dde2'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(hx, hy + 4, 5, 0, Math.PI); cx.stroke(); }
          // bobber
          cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(bx, by + 4, 8, 0, Math.PI); cx.fill();
          cx.fillStyle = '#ef3b3b'; cx.beginPath(); cx.arc(bx, by + 4, 8, Math.PI, 0); cx.fill();
          cx.fillStyle = '#222'; cx.fillRect(bx - 1, by - 10, 2, 7);
        }
        for (const r of g.ripples){ cx.strokeStyle = `rgba(255,255,255,${r.life*0.7})`; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(r.x, S + 2, r.r, r.r*0.3, 0, 0, 7); cx.stroke(); }
        // fish on the way to / on the hook
        const f = g.fish;
        if (f && g.mode === 'play' && g.sp){ const show = g.phase === 'reel' || g.phase === 'bite' || g.phase === 'wait';
          if (show) drawSp(cx, g.sp, f.px, f.x, f.y, f.flip, g.phase === 'reel' ? Math.sin(f.wig)*0.25 : 0, g.phase === 'wait' ? 0.75 : 1); }
        if (g.fleeing && g.sp) drawSp(cx, g.sp, g.fleeing.px, g.fleeing.x, g.fleeing.y, !g.fleeing.flip, 0, Math.max(0, g.fleeing.flee));
        // power meter while pulling back
        if (g.phase === 'drag'){
          const lx = landX(g.power);
          cx.setLineDash([6, 8]); cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(tip.x, tip.y);
          cx.quadraticCurveTo((tip.x + lx)/2, tip.y - 70 - g.power*80, lx, S); cx.stroke(); cx.setLineDash([]);
          cx.strokeStyle = '#ffe27a'; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(lx, S + 2, 18, 6, 0, 0, 7); cx.stroke();
          const mw = 140, mx = av.x - 40, my = av.y - 64; rr(mx, my, mw, 16, 8); cx.fillStyle = 'rgba(0,0,0,.4)'; cx.fill();
          rr(mx + 2, my + 2, (mw - 4)*g.power, 12, 6); cx.fillStyle = `hsl(${120 - g.power*100},85%,55%)`; cx.fill();
        }
        // reel bar
        if (g.phase === 'reel' && g.reel){
          const r = g.reel, bw = 64, bh = Math.max(180, Math.min(H - S - 30, 360)), bxp = W - bw - 22, byp = S + (H - S - bh)/2;
          rr(bxp - 6, byp - 6, bw + 12, bh + 12, 18); cx.fillStyle = 'rgba(0,30,50,.6)'; cx.fill();
          rr(bxp, byp, bw, bh, 12); cx.fillStyle = 'rgba(255,255,255,.18)'; cx.fill();
          const zy = byp + (1 - r.z - r.hz)*bh, zh = r.hz*2*bh;
          rr(bxp + 4, zy, bw - 8, zh, 10); cx.fillStyle = r.in ? 'rgba(90,230,120,.9)' : 'rgba(90,230,120,.55)'; cx.fill();
          drawSp(cx, g.sp, 30, bxp + bw/2, zy + zh/2, false, Math.sin(performance.now()/120)*0.2);
          const my = byp + (1 - r.p)*bh;
          cx.fillStyle = '#ffe27a'; cx.strokeStyle = '#7a5a00'; cx.lineWidth = 2; rr(bxp - 4, my - 6, bw + 8, 12, 6); cx.fill(); cx.stroke();
          // catch progress
          const px = bxp - 26; rr(px, byp, 14, bh, 7); cx.fillStyle = 'rgba(0,0,0,.35)'; cx.fill();
          const k = Math.max(0, Math.min(1, r.prog)); rr(px, byp + bh*(1 - k), 14, bh*k, 7); cx.fillStyle = k > 0.25 ? '#ffd23f' : '#ff7a59'; cx.fill();
          if (!g.msg) label(g.hold ? 'Reeling…' : 'Hold to reel up!', Math.min(W/2, bxp - 150), byp + 20, 24, '#fff');
        }
        // HUD
        if (g.mode === 'play'){
          const left = Math.max(0, ROUND_TIME - g.time), mm = Math.floor(left/60), ss = Math.floor(left%60);
          const hud = `🎣 ${Math.max(0, ROUND_CASTS - g.casts)}   ⏱️ ${mm}:${String(ss).padStart(2,'0')}   ⭐ ${g.score}`;
          cx.font = `800 22px ${HEAD}`; const hw = cx.measureText(hud).width + 26;
          rr(12, 12, hw, 44, 16); cx.fillStyle = 'rgba(0,40,70,.55)'; cx.fill();
          cx.fillStyle = '#fff'; cx.textAlign = 'left'; cx.textBaseline = 'middle';
          cx.fillText(hud, 25, 35);
          const hint = g.phase === 'aim' ? (g.casts === 0 ? '👈 Pull back and let go to cast!' : 'Pull back and let go!') : g.phase === 'wait' ? 'Wait for a bite…' : g.phase === 'sink' ? 'Wait for a bite…' : '';
          if (hint) label(hint, (dx + W)/2, S + 40, 24, '#fff');
          if (g.phase === 'bite'){ const pulse = RM ? 1 : 1 + Math.sin(performance.now()/70)*0.08; label('TAP NOW!', g.bob.x, S - 40, Math.round(34*pulse), '#ffe27a'); }
        }
        if (g.msg){ cx.globalAlpha = Math.min(1, g.msg.life*2); label(g.msg.t, W/2, Math.max(80, S*0.62), 28, g.msg.col); cx.globalAlpha = 1; }
      }
      const frame = t => {
        if (!alive) return;
        const dt = Math.min(0.05, last ? (t - last)/1000 : 0.016); last = t;
        step(dt); draw(dt); if (g.mode === 'aquarium') drawAquarium(dt);
        raf = requestAnimationFrame(frame);
      };
      size(); startScreen();
      raf = requestAnimationFrame(frame);

      return () => {
        alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size);
        cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
        el.innerHTML = ''; delete el.__fish;
      };
    }
  };
})();
