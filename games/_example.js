// Example Break Zone game: shows the shape every game follows. Not listed in the Break Zone.
(function(){
  window.BreakGames = window.BreakGames || {};
  window.BreakGames._example = {
    start(el, api){
      const cv = document.createElement('canvas'); cv.style.width = '100%'; cv.style.height = '100%'; cv.style.display = 'block'; cv.style.touchAction = 'none';
      el.appendChild(cv);
      const cx = cv.getContext('2d'); let W = 0, H = 0, raf = 0, score = 0;
      const size = () => { const r = el.getBoundingClientRect(), d = window.devicePixelRatio || 1; W = r.width; H = r.height; cv.width = W*d; cv.height = H*d; cx.setTransform(d,0,0,d,0,0); };
      size(); window.addEventListener('resize', size);
      const tap = e => { score++; if (score === 5){ const r = api.saveScore(score); } };
      cv.addEventListener('pointerdown', tap);
      const frame = () => { cx.fillStyle = api.colors.panel; cx.fillRect(0,0,W,H); cx.fillStyle = api.colors.ink; cx.font = '700 28px "Baloo 2", sans-serif'; cx.textAlign = 'center'; cx.fillText('Taps: ' + score, W/2, H/2); raf = requestAnimationFrame(frame); };
      frame();
      return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); cv.removeEventListener('pointerdown', tap); };
    }
  };
})();
