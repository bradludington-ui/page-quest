// Drawing Pad: draw with 12 colors or the rainbow brush, stamp emoji, undo, clear and save up to
// 6 pictures in a little gallery. No score.
(function(){
  window.BreakGames = window.BreakGames || {};
  window.BreakGames.draw = {
    start(el, api){
      const C = api.colors;
      const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const HEAD = "'Baloo 2', 'Trebuchet MS', system-ui, sans-serif", TXT = 'Lexend, Verdana, system-ui, sans-serif';
      const EMOJI = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
      const COLORS = ['#e63946','#ff8c1a','#ffd60a','#8ac926','#2a9d4b','#19b5a5','#4cc9f0','#2f5fd0','#7b4bd6','#ff70a6','#8b5a2b','#222222'];
      const STAMPS = ['⭐','❤️','🌈','🦋','🌸','🐶','🐱','🦄','🐠','🍕','🍩','🚀','🌞','⚽','🎈','👑'];
      const SIZES = [4, 10, 20, 36], STAMP_SIZES = [36, 56, 84, 120];
      const MAX_PICS = 6, MAX_STR = 190000; // ~140 KB of JPEG once the data URL's base64 is counted
      const DPR = () => Math.min(window.devicePixelRatio || 1, 2.5);

      const st = {tool: 'brush', color: COLORS[7], rainbow: false, size: 1, stamp: STAMPS[0], picIdx: -1, dirty: false};
      el.__draw = st; // read-only peek for automated tests

      // ---------- DOM ----------
      const root = document.createElement('div');
      root.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;background:${C.soft};font-family:${TXT};color:${C.ink}`;
      el.appendChild(root);
      const bar = document.createElement('div');
      bar.style.cssText = `flex:none;display:flex;flex-direction:column;gap:6px;padding:8px 10px 6px;background:${C.panel};border-bottom:2px solid ${C.line}`;
      const rowA = document.createElement('div'), rowB = document.createElement('div');
      const rowCss = 'display:flex;gap:6px;align-items:center;overflow-x:auto;overflow-y:hidden;touch-action:pan-x;scrollbar-width:none;padding:2px';
      rowA.style.cssText = rowCss; rowB.style.cssText = rowCss;
      bar.appendChild(rowA); bar.appendChild(rowB); root.appendChild(bar);
      const area = document.createElement('div');
      area.style.cssText = 'flex:1;position:relative;min-height:0';
      root.appendChild(area);
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:crosshair';
      area.appendChild(cv);
      const vx = cv.getContext('2d');
      const toast = document.createElement('div');
      toast.style.cssText = `position:absolute;left:50%;bottom:16px;transform:translateX(-50%);background:${C.ink};color:${C.panel};padding:10px 18px;border-radius:14px;font:700 18px ${HEAD};opacity:0;transition:opacity .25s;pointer-events:none;white-space:nowrap`;
      area.appendChild(toast);
      let toastT = 0;
      const say = t => { toast.textContent = t; toast.style.opacity = '1'; clearTimeout(toastT); toastT = setTimeout(() => { toast.style.opacity = '0'; }, 1600); };
      const ov = document.createElement('div');
      ov.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;z-index:5;background:rgba(20,20,40,.35)';
      el.appendChild(ov);
      const BTN = (act, label, primary, extra) => `<button data-act="${act}" style="min-height:56px;min-width:140px;padding:10px 22px;border-radius:18px;border:none;font:800 22px ${HEAD};cursor:pointer;background:${primary ? C.accent : C.soft};color:${primary ? C.accentInk : C.ink};box-shadow:0 4px 0 rgba(0,0,0,.18);margin:6px;${extra||''}">${label}</button>`;
      const card = (inner, wide) => `<div style="background:${C.panel};color:${C.ink};border-radius:24px;padding:20px 22px;max-width:${wide ? 640 : 420}px;width:100%;max-height:100%;overflow:auto;touch-action:pan-y;text-align:center;box-shadow:0 12px 34px rgba(0,0,0,.3);font-family:${TXT}">${inner}</div>`;
      const showOv = (html, wide) => { ov.innerHTML = card(html, wide); ov.style.display = 'flex'; };
      const hideOv = () => { ov.style.display = 'none'; ov.innerHTML = ''; };

      const tb = (act, inner, title, extra) => `<button data-act="${act}" aria-label="${esc(title)}" title="${esc(title)}" style="flex:none;width:52px;height:52px;border-radius:14px;border:3px solid transparent;background:${C.soft};color:${C.ink};font:700 24px ${EMOJI};display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;${extra||''}">${inner}</button>`;
      function drawBar(){
        const sel = 'border-color:' + C.accent + ';box-shadow:0 0 0 2px ' + C.accent;
        if (st.tool === 'stamp'){
          rowA.innerHTML = STAMPS.map((s, i) => tb('stamp:' + i, s, 'Stamp ' + (i+1), st.stamp === s ? sel : '')).join('');
        } else {
          rowA.innerHTML = COLORS.map((c, i) => tb('color:' + i, '', 'Color ' + (i+1), `background:${c};${!st.rainbow && st.tool === 'brush' && st.color === c ? sel : 'border-color:rgba(0,0,0,.12)'}`)).join('')
            + tb('rainbow', '', 'Rainbow brush', `background:linear-gradient(135deg,#e63946,#ff8c1a,#ffd60a,#8ac926,#4cc9f0,#7b4bd6);${st.rainbow && st.tool === 'brush' ? sel : ''}`);
        }
        const dot = i => { const d = [8, 14, 22, 32][i]; const col = st.tool === 'eraser' ? '#999' : st.rainbow ? '#e63946' : st.color; return `<span style="display:block;width:${d}px;height:${d}px;border-radius:50%;background:${st.tool === 'stamp' ? C.mut : col}"></span>`; };
        const sep = `<span style="flex:none;width:2px;height:36px;background:${C.line};margin:0 4px"></span>`;
        rowB.innerHTML = tb('brush', '🖌️', 'Brush', st.tool === 'brush' ? sel : '') + tb('eraser', '🧽', 'Eraser', st.tool === 'eraser' ? sel : '') + tb('stamps', '⭐', 'Stamps', st.tool === 'stamp' ? sel : '')
          + sep + [0,1,2,3].map(i => tb('size:' + i, dot(i), 'Size ' + (i+1), st.size === i ? sel : '')).join('')
          + sep + tb('undo', '↩️', 'Undo') + tb('clear', '🗑️', 'Clear') + tb('save', '💾', 'Save picture') + tb('gallery', '🖼️', 'Gallery');
      }

      // ---------- paper and strokes ----------
      let PW = 0, PH = 0, paper = null, px = null, base = null, bx = null, strokes = [];
      const MAX_STROKES = 30;
      function newPaper(){
        const r = area.getBoundingClientRect(), aw = Math.max(200, r.width - 24), ah = Math.max(150, r.height - 24);
        PW = 1200; PH = Math.round(Math.max(600, Math.min(1700, PW*ah/aw)));
        paper = document.createElement('canvas'); paper.width = PW; paper.height = PH; px = paper.getContext('2d');
        base = document.createElement('canvas'); base.width = PW; base.height = PH; bx = base.getContext('2d');
        bx.fillStyle = '#fff'; bx.fillRect(0, 0, PW, PH); strokes = []; render();
      }
      let VW = 0, VH = 0, fit = {x: 0, y: 0, s: 1}, needView = true;
      const viewSize = () => { const r = area.getBoundingClientRect(), d = DPR(); VW = Math.max(1, r.width); VH = Math.max(1, r.height); cv.width = Math.round(VW*d); cv.height = Math.round(VH*d); vx.setTransform(d,0,0,d,0,0); calcFit(); needView = true; };
      function calcFit(){ if (!PW) return; const s = Math.min((VW - 20)/PW, (VH - 20)/PH); fit = {s, x: (VW - PW*s)/2, y: (VH - PH*s)/2}; }
      function drawView(){
        vx.fillStyle = C.soft; vx.fillRect(0, 0, VW, VH);
        if (!paper) return;
        vx.save(); vx.shadowColor = 'rgba(0,0,0,.18)'; vx.shadowBlur = 12; vx.shadowOffsetY = 3; vx.fillStyle = '#fff'; vx.fillRect(fit.x, fit.y, PW*fit.s, PH*fit.s); vx.restore();
        vx.imageSmoothingEnabled = true; vx.drawImage(paper, fit.x, fit.y, PW*fit.s, PH*fit.s);
      }
      const lw = sz => SIZES[sz]/fit.s;            // brush width in paper pixels, so it looks the same on screen
      const sw = sz => STAMP_SIZES[sz]/fit.s;

      // Draw one stroke onto a context; `from` lets live drawing add just the newest segments.
      function seg(ctx, s, i){ // segment ending at point i (smoothed through midpoints)
        const p = s.pts, x0 = p[(i-2)*2], y0 = p[(i-2)*2+1], x1 = p[(i-1)*2], y1 = p[(i-1)*2+1], x2 = p[i*2], y2 = p[i*2+1];
        const m0x = i >= 2 ? (x0 + x1)/2 : x1, m0y = i >= 2 ? (y0 + y1)/2 : y1;
        ctx.strokeStyle = s.erase ? '#fff' : s.rainbow ? `hsl(${(s.h0 + s.dist[i]*0.45) % 360},90%,55%)` : s.color;
        ctx.beginPath(); ctx.moveTo(m0x, m0y); ctx.quadraticCurveTo(x1, y1, (x1 + x2)/2, (y1 + y2)/2); ctx.stroke();
      }
      function paintLine(ctx, s, from){
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = s.w;
        const n = s.pts.length/2;
        if (from === 0){ // a dot for a tap
          ctx.fillStyle = s.erase ? '#fff' : s.rainbow ? `hsl(${s.h0},90%,55%)` : s.color;
          ctx.beginPath(); ctx.arc(s.pts[0], s.pts[1], s.w/2, 0, 7); ctx.fill(); from = 1;
        }
        for (let i = Math.max(1, from); i < n; i++) seg(ctx, s, i);
      }
      const emoCache = {};
      function emoImg(ch){ if (emoCache[ch]) return emoCache[ch]; const c = document.createElement('canvas'), z = 160; c.width = c.height = z; const x = c.getContext('2d'); x.font = `128px ${EMOJI}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, z/2, z/2 + 8); return (emoCache[ch] = c); }
      function paintStamp(ctx, s, from){
        const img = emoImg(s.ch);
        for (let i = from; i < s.pts.length/3; i++){ const x = s.pts[i*3], y = s.pts[i*3+1], r = s.pts[i*3+2];
          ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.drawImage(img, -s.sz*0.625, -s.sz*0.625, s.sz*1.25, s.sz*1.25); ctx.restore(); }
      }
      function paint(ctx, s, from){
        if (s.t === 'clear'){ ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, PW, PH); }
        else if (s.t === 'line') paintLine(ctx, s, from || 0);
        else if (s.t === 'stamp') paintStamp(ctx, s, from || 0);
      }
      function render(){ px.drawImage(base, 0, 0); for (const s of strokes) paint(px, s, 0); needView = true; }
      function commit(s){
        strokes.push(s); st.dirty = true;
        while (strokes.length > MAX_STROKES){ paint(bx, strokes.shift(), 0); }
      }

      // ---------- pointer drawing ----------
      let cur = null;
      const toPaper = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left - fit.x)/fit.s, (e.clientY - r.top - fit.y)/fit.s]; };
      function addPoint(x, y){
        const s = cur;
        if (s.t === 'line'){
          const n = s.pts.length/2, lx = s.pts[(n-1)*2], ly = s.pts[(n-1)*2+1], d = Math.hypot(x - lx, y - ly);
          if (d < 1.5) return;
          s.pts.push(x, y); s.dist.push(s.dist[n-1] + d);
          px.lineCap = 'round'; px.lineJoin = 'round'; px.lineWidth = s.w; seg(px, s, n);
        } else {
          const k = s.pts.length/3, lx = s.pts[(k-1)*3], ly = s.pts[(k-1)*3+1];
          if (Math.hypot(x - lx, y - ly) < s.sz*0.85) return;
          s.pts.push(x, y, (Math.random() - 0.5)*0.5); paintStamp(px, s, k);
        }
        needView = true;
      }
      const down = e => {
        if (e.button > 0 || cur) return; e.preventDefault();
        try{ cv.setPointerCapture(e.pointerId); }catch(_){}
        const [x, y] = toPaper(e);
        if (st.tool === 'stamp'){ cur = {t: 'stamp', ch: st.stamp, sz: sw(st.size), pts: [x, y, (Math.random() - 0.5)*0.5], id: e.pointerId}; paintStamp(px, cur, 0); }
        else { cur = {t: 'line', erase: st.tool === 'eraser', rainbow: st.tool === 'brush' && st.rainbow, color: st.color, h0: Math.floor(Math.random()*360), w: lw(st.size)*(st.tool === 'eraser' ? 1.6 : 1), pts: [x, y], dist: [0], id: e.pointerId}; paintLine(px, cur, 0); }
        needView = true;
      };
      const move = e => {
        if (!cur || e.pointerId !== cur.id) return; e.preventDefault();
        const list = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
        if (list && list.length) for (const ce of list){ const [x, y] = toPaper(ce); addPoint(x, y); }
        else { const [x, y] = toPaper(e); addPoint(x, y); }
      };
      const up = e => {
        if (!cur || e.pointerId !== cur.id) return;
        if (cur.t === 'line'){ const n = cur.pts.length/2; if (n >= 2){ // finish the tail to the last point
          const x = cur.pts[(n-1)*2], y = cur.pts[(n-1)*2+1]; cur.pts.push(x, y); cur.dist.push(cur.dist[n-1]); px.lineWidth = cur.w; seg(px, cur, n); } }
        commit(cur); cur = null; needView = true;
      };
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

      // ---------- saving ----------
      const pics = () => { const p = api.store.get('pics'); return Array.isArray(p) ? p.filter(x => x && typeof x.d === 'string') : []; };
      function exportPic(){
        let scale = Math.min(1, 900/Math.max(PW, PH)), q = 0.78, url = '';
        for (let tries = 0; tries < 8; tries++){
          const c = document.createElement('canvas'); c.width = Math.round(PW*scale); c.height = Math.round(PH*scale);
          const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(paper, 0, 0, c.width, c.height);
          url = c.toDataURL('image/jpeg', q);
          if (url.length <= MAX_STR) break;
          if (q > 0.5) q -= 0.12; else scale *= 0.8;
        }
        return url;
      }
      function storePics(list){ try{ api.store.set('pics', list); return true; }catch(e){ return false; } }
      function savePic(replaceOldest){
        const list = pics(), d = exportPic(), item = {d, t: Date.now()};
        if (st.picIdx >= 0 && st.picIdx < list.length){ list.splice(st.picIdx, 1); list.unshift(item); }
        else if (list.length >= MAX_PICS){
          if (!replaceOldest){ showOv(`<div style="font-size:44px">🖼️</div><div style="font:800 26px ${HEAD}">Your gallery is full</div>
            <div style="color:${C.mut};margin:4px 0 10px">It holds ${MAX_PICS} pictures. Swap out the oldest one?</div>
            ${BTN('replaceOld', 'Yes, swap it', true)}${BTN('close', 'Not now', false)}`); return false; }
          list.pop(); list.unshift(item);
        } else list.unshift(item);
        if (!storePics(list)){ say('Could not save. Delete a picture first.'); return false; }
        st.picIdx = 0; st.dirty = false; say('💾 Saved to your gallery!'); api.confetti(25);
        return true;
      }

      // ---------- screens ----------
      let mode = 'gallery', afterSave = null;
      function gallery(){
        mode = 'gallery'; afterSave = null;
        const list = pics();
        const thumbs = list.map((p, i) => `<div style="position:relative;background:${C.soft};border-radius:16px;padding:6px">
            <button data-act="open:${i}" aria-label="Open picture ${i+1}" style="display:block;width:100%;border:none;padding:0;background:#fff;border-radius:12px;overflow:hidden;cursor:pointer;aspect-ratio:4/3"><img src="${p.d}" alt="" style="width:100%;height:100%;object-fit:contain;display:block"></button>
            <button data-act="del:${i}" aria-label="Delete picture ${i+1}" style="position:absolute;top:0;right:0;width:48px;height:48px;border-radius:14px;border:none;background:${C.panel};box-shadow:0 2px 6px rgba(0,0,0,.25);font:22px ${EMOJI};cursor:pointer">🗑️</button></div>`).join('');
        showOv(`<div style="font-size:50px;line-height:1">🎨</div><div style="font:800 32px ${HEAD}">Drawing Pad</div>
          <div style="color:${C.mut};margin:2px 0 8px">Draw, color and stamp. Just for fun!</div>
          ${BTN('new', '✏️ New picture', true)}
          ${list.length ? `<div style="font:800 20px ${HEAD};margin:12px 0 6px;text-align:left">🖼️ My pictures (${list.length}/${MAX_PICS}) <span style="font:500 14px ${TXT};color:${C.mut}">tap one to keep drawing</span></div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">${thumbs}</div>` : `<div style="color:${C.mut};margin-top:8px">Your saved pictures will show up here.</div>`}`, true);
      }
      function openEditor(picIdx){
        hideOv(); mode = 'draw'; st.picIdx = picIdx; st.dirty = false;
        viewSize(); newPaper(); calcFit();
        if (picIdx >= 0){ const p = pics()[picIdx]; if (p){ const img = new Image(); img.onload = () => { if (!alive) return;
          const s = Math.min(PW/img.width, PH/img.height), w = img.width*s, h = img.height*s; bx.drawImage(img, (PW - w)/2, (PH - h)/2, w, h); render(); }; img.src = p.d; } }
        drawBar(); needView = true;
      }
      function confirmLeave(){
        if (!st.dirty || (!strokes.length && st.picIdx < 0)) return gallery();
        showOv(`<div style="font-size:44px">🖼️</div><div style="font:800 26px ${HEAD}">Save your picture first?</div>
          <div style="margin-top:10px">${BTN('saveLeave', '💾 Save', true)}${BTN('leave', 'Don’t save', false)}<br>${BTN('close', 'Keep drawing', false)}</div>`);
      }

      function act(a){
        if (a.startsWith('color:')){ st.color = COLORS[+a.slice(6)]; st.rainbow = false; st.tool = 'brush'; }
        else if (a === 'rainbow'){ st.rainbow = true; st.tool = 'brush'; }
        else if (a.startsWith('stamp:')){ st.stamp = STAMPS[+a.slice(6)]; st.tool = 'stamp'; }
        else if (a.startsWith('size:')) st.size = +a.slice(5);
        else if (a === 'brush') st.tool = 'brush';
        else if (a === 'eraser') st.tool = 'eraser';
        else if (a === 'stamps') st.tool = 'stamp';
        else if (a === 'undo'){ if (strokes.length){ strokes.pop(); render(); st.dirty = true; } else say('Nothing to undo'); }
        else if (a === 'clear') showOv(`<div style="font-size:44px">🗑️</div><div style="font:800 26px ${HEAD}">Clear the whole picture?</div>
            <div style="color:${C.mut};margin:4px 0 8px">You can undo it with ↩️.</div>${BTN('clearYes', 'Yes, clear', true)}${BTN('close', 'Keep it', false)}`);
        else if (a === 'clearYes'){ hideOv(); commit({t: 'clear'}); render(); }
        else if (a === 'save') savePic(false);
        else if (a === 'replaceOld'){ hideOv(); const ok = savePic(true); if (ok && afterSave) afterSave(); }
        else if (a === 'gallery') confirmLeave();
        else if (a === 'saveLeave'){ hideOv(); afterSave = gallery; if (savePic(false)) gallery(); }
        else if (a === 'leave') gallery();
        else if (a === 'close'){ hideOv(); afterSave = null; }
        else if (a === 'new') openEditor(-1);
        else if (a.startsWith('open:')) openEditor(+a.slice(5));
        else if (a.startsWith('del:')){ const i = +a.slice(4), p = pics()[i]; if (!p) return;
          showOv(`<img src="${p.d}" alt="" style="max-width:220px;max-height:160px;border-radius:12px;background:#fff;display:block;margin:0 auto 8px">
            <div style="font:800 26px ${HEAD}">Delete this picture?</div>${BTN('delYes:' + i, 'Yes, delete', true)}${BTN('back', 'Keep it', false)}`); return; }
        else if (a.startsWith('delYes:')){ const list = pics(); list.splice(+a.slice(7), 1); storePics(list); gallery(); return; }
        else if (a === 'back'){ gallery(); return; }
        if (mode === 'draw') drawBar();
      }
      const onClick = e => { const b = e.target.closest('[data-act]'); if (b) act(b.dataset.act); };
      bar.addEventListener('click', onClick); ov.addEventListener('click', onClick);

      let alive = true, raf = 0;
      const onResize = () => { viewSize(); };
      window.addEventListener('resize', onResize);
      const frame = () => { if (!alive) return; if (needView){ needView = false; drawView(); } raf = requestAnimationFrame(frame); };
      viewSize(); newPaper(); drawBar(); gallery();
      raf = requestAnimationFrame(frame);

      return () => {
        alive = false; cancelAnimationFrame(raf); clearTimeout(toastT); window.removeEventListener('resize', onResize);
        cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
        bar.removeEventListener('click', onClick); ov.removeEventListener('click', onClick);
        el.innerHTML = ''; delete el.__draw;
      };
    }
  };
})();
