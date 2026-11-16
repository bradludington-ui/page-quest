// Page Quest math: grade 3 geometry question bank (FCPS Unit 4 / Virginia SOL 3.MG.3).
// Loaded after g3.js; it REPLACES g3.polygons, g3.quads and g3.composepoly with many more question types and drawings.
// Every drawing is a list of points in a 200 x 195 box (see mathModel in index.html). Every cut and every claim about a
// piece was checked against the points drawn here: keep them in step if you move a point.
(function(){
  const M = window.MathSkills = window.MathSkills || {};

  // ---------- helpers ----------
  const NAMES = ['Sam','Maya','Leo','Ava','Ben','Lily','Max','Emma','Noah','Mia'];
  const who = R => R.pick(NAMES);
  // answer first, then up to 3 unique distractors (never equal to the answer)
  function choices(ans, ds){
    const out = [String(ans)];
    for (const d of ds){ const s = String(d); if (!s || out.includes(s) || /NaN|undefined|Infinity/.test(s)) continue; out.push(s); if (out.length === 4) break; }
    return out;
  }
  const TF = ['True', 'False'];
  const NM = { 3:'triangle', 4:'quadrilateral', 5:'pentagon', 6:'hexagon', 7:'heptagon', 8:'octagon' };
  const PRE = { 3:'tri', 4:'quad', 5:'penta', 6:'hexa', 7:'hepta', 8:'octa' };
  const TIP = { 3:'tri- means 3 (like a tricycle)', 4:'quad- means 4', 5:'penta- means 5', 6:'hexa- means 6', 7:'hepta- means 7', 8:'octa- means 8 (like an octopus)' };
  const Cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const an = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
  const pls = w => /us$/.test(w) ? w + 'es' : w + 's';
  const near = n => [n + 1, n - 1, n + 2, n - 2].filter(x => NM[x]).map(x => Cap(NM[x]));
  const r1 = v => Math.round(v * 10) / 10;
  const ABCD = k => ['A','B','C','D'].slice(0, k);
  const pickType = (R, list, lvl) => R.pick(list.filter(t => t.lv.includes(lvl))).f(R, lvl);
  // n distinct whole numbers from lo..hi, none in ex
  function distinct(R, n, lo, hi, ex){ const out = []; let g = 0; while (out.length < n && g++ < 200){ const v = R.int(lo, hi); if (!out.includes(v) && !(ex || []).includes(v)) out.push(v); } return out; }

  // a regular polygon: vertex 0 at the top unless turned by rot (radians)
  function reg(n, rot, r, cx, cy){ rot = rot || 0; r = r || 82; cx = cx || 100; cy = cy || 98;
    return [...Array(n)].map((_, i) => { const a = -Math.PI / 2 + rot + i * 2 * Math.PI / n; return [r1(cx + r * Math.cos(a)), r1(cy + r * Math.sin(a))]; }); }
  // a shape is easy to read when no corner is nearly flat (so a side is never hidden) or very sharp, and no side is tiny
  function okPoly(p){ const n = p.length;
    for (let i = 0; i < n; i++){ const a = p[i], b = p[(i + n - 1) % n], c = p[(i + 1) % n];
      const u = [b[0] - a[0], b[1] - a[1]], v = [c[0] - a[0], c[1] - a[1]], lu = Math.hypot(u[0], u[1]), lv = Math.hypot(v[0], v[1]);
      if (lv < 30) return false; const cos = (u[0] * v[0] + u[1] * v[1]) / (lu * lv);
      if (cos < Math.cos(150 * Math.PI / 180) || cos > Math.cos(22 * Math.PI / 180)) return false; }
    return true; }
  // an irregular polygon with n sides: corners at sorted angles around the middle, so the sides never cross
  function irr(R, n){ for (let t = 0; t < 80; t++){ const off = R.rand() * Math.PI * 2, p = [];
      for (let i = 0; i < n; i++){ const a = off + (i + (R.rand() - .5) * .55) * 2 * Math.PI / n, r = R.int(54, 84); p.push([r1(100 + r * Math.cos(a)), r1(98 + r * Math.sin(a))]); }
      if (okPoly(p)) return p; }
    return reg(n, .3); }
  const SIDES = { triangle:3, 'right-triangle':3, 'irregular-triangle':3, square:4, rectangle:4, rhombus:4, parallelogram:4, trapezoid:4, 'right-trapezoid':4, kite:4, 'irregular-quad':4,
    pentagon:5, 'irregular-pentagon':5, house:5, hexagon:6, 'irregular-hexagon':6, 'l-shape':6, heptagon:7, 'irregular-heptagon':7, arrow:7, octagon:8, 'irregular-octagon':8, star:10, cross:12 };
  // shapes with a "dent" (an inside corner): still polygons
  const DENT = { 4:[[[100,20],[180,170],[100,120],[20,170]]], 5:[[[20,30],[180,30],[180,170],[100,100],[20,170]]],
    8:[[[20,25],[180,25],[180,75],[125,75],[125,180],[75,180],[75,75],[20,75]]] };
  // a drawing of a polygon with n sides, harder to read as the level goes up
  function polyFor(R, lvl, n){ const c = R.rand();
    if (lvl === 1){ const L1 = { 3:['triangle','right-triangle'], 4:['square','rectangle','trapezoid'], 5:['pentagon','house'], 6:['hexagon'], 7:['heptagon'], 8:['octagon'] };
      return c < .65 ? { shape:R.pick(L1[n]) } : { pts:reg(n, R.pick([0, Math.PI / n])) }; }
    if (lvl === 2){ const L2 = { 3:['irregular-triangle','right-triangle'], 4:['parallelogram','rhombus','kite','irregular-quad','right-trapezoid'], 5:['irregular-pentagon','house'], 6:['irregular-hexagon'], 7:['irregular-heptagon'], 8:['irregular-octagon'] };
      return c < .45 ? { shape:R.pick(L2[n]) } : c < .6 ? { pts:reg(n, R.rand() * Math.PI) } : { pts:irr(R, n) }; }
    const L3 = { 3:['irregular-triangle'], 4:['kite','irregular-quad'], 5:['house','irregular-pentagon'], 6:['l-shape','irregular-hexagon'], 7:['arrow','irregular-heptagon'], 8:['irregular-octagon'] };
    if (DENT[n] && c < .2) return { pts:R.pick(DENT[n]) };
    return c < .5 ? { shape:R.pick(L3[n]) } : { pts:irr(R, n) }; }
  const isReg = m => m.shape && ['triangle','square','pentagon','hexagon','heptagon','octagon'].includes(m.shape);

  // shapes that are NOT polygons, and why
  const NONPOLY = [
    { m:{ circle:true }, why:'curve', easy:1 },
    { m:{ curve:'M100 25 C190 25 190 170 100 170 C10 170 10 25 100 25 Z' }, why:'curve', easy:1 },
    { m:{ curve:'M25 150 L175 150 A75 75 0 0 0 25 150 Z' }, why:'curve' },
    { m:{ curve:'M30 180 L30 80 Q100 -5 170 80 L170 180 Z' }, why:'curve' },
    { m:{ curve:'M100 20 L175 150 Q100 190 25 150 Z' }, why:'curve' },
    { m:{ curve:'M30 165 L30 35 L170 35 L170 165 Q100 115 30 165 Z' }, why:'curve' },
    { m:{ open:true, pts:[[70,170],[25,170],[100,25],[175,170],[130,170]] }, why:'open', easy:1 },
    { m:{ open:true, pts:[[85,25],[35,25],[35,160],[165,160],[165,25],[115,25]] }, why:'open', easy:1 },
    { m:{ open:true, pts:[[20,150],[60,45],[100,150],[140,45],[180,150]] }, why:'open' },
    { m:{ open:true, pts:[[150,40],[50,40],[50,160],[150,160]] }, why:'open' }
  ];
  const nonPoly = (R, lvl) => R.pick(lvl === 1 ? NONPOLY.filter(x => x.easy) : NONPOLY);
  const WHY = { curve:'it has a curved side', open:'it is not closed (it has a gap)' };

  // real things and their shapes
  const REAL = [['a stop sign', 8], ['a yield sign', 3], ['one cell of a honeycomb', 6], ['home plate on a baseball field', 5], ['a school crossing sign', 5],
    ['the end of a new pencil', 6], ['a sheet of notebook paper', 4], ['a door', 4], ['a nut that screws onto a bolt', 6], ['a slice of sandwich cut from corner to corner', 3], ['a window pane', 4]];
  const ROUND = ['a dinner plate', 'a coin', 'a clock face', 'a bike wheel', 'a whole pizza', 'a cookie'];

  const ROWQ = 'Look at shapes A, B, C and D.';

  // =====================================================================
  // POLYGONS
  // =====================================================================
  const countT = w => ({ lv:[1,2,3], f(R, lvl){
    const big = lvl === 3 && R.chance(.15), n = big ? R.pick([10, 12]) : R.int(3, 8), m = big ? { shape:n === 10 ? 'star' : 'cross' } : polyFor(R, lvl, n);
    const one = w === 'sides' ? 'side' : w === 'vertices' ? 'corner (vertex)' : 'angle (corner)';
    return { q:`How many ${w} does this ${big ? 'shape' : 'polygon'} have?`, kind:'num', a:n, model:Object.assign({ type:'polygon' }, m),
      hint:`Touch one ${one} and count around the shape. Stop when you get back to where you started.`,
      steps:[ `Start at one ${one} and go around.`, w === 'angles' ? `Every corner makes one angle.` : `Count each ${one} once. Dents count too.`, `It has ${n} ${w}.`] }; } });

  const POLY_T = [
    countT('sides'), countT('vertices'), countT('angles'),
    // name the drawn polygon
    { lv:[1,2,3], f(R, lvl){ const n = R.int(3, 8), m = polyFor(R, lvl, n), ans = Cap(NM[n]);
      return { q:lvl === 1 ? 'What is the name of this polygon?' : 'Count the sides. What kind of polygon is this?', kind:'choice', a:ans, choices:choices(ans, near(n)), model:Object.assign({ type:'polygon' }, m),
        hint:'Count the sides first. Then match the number to the name.',
        steps:[ `Count the sides: ${n}.`, `${TIP[n]}.`, `A polygon with ${n} sides is ${an(NM[n])}.`] }; } },
    // name from a count
    { lv:[1,2,3], f(R, lvl){ const n = R.int(3, 8), w = R.pick(['sides','vertices','angles']), ans = Cap(NM[n]);
      return { q:`A polygon has ${n} ${w}. What is it called?`, kind:'choice', a:ans, choices:choices(ans, near(n)),
        hint:'A polygon has the same number of sides, vertices and angles.',
        steps:[ w === 'sides' ? `It has ${n} sides.` : `${n} ${w} means ${n} sides too.`, `${TIP[n]}.`, `It is ${an(NM[n])}.`] }; } },
    // count from a name
    { lv:[1,2,3], f(R, lvl){ const n = R.int(3, 8), w = R.pick(['sides','vertices','angles']);
      return { q:`How many ${w} does ${an(NM[n])} have?`, kind:'num', a:n,
        hint:`Look at the start of the word: ${PRE[n]}-.`,
        steps:[ `${TIP[n]}.`, `${Cap(an(NM[n]))} has ${n} sides, so it has ${n} ${w}.`] }; } },
    // which is NOT a polygon
    { lv:[1,2,3], f(R, lvl){ const k = R.int(0, 3), np = nonPoly(R, lvl), ns = distinct(R, 3, 3, 8);
      const items = []; let j = 0; for (let i = 0; i < 4; i++) items.push(Object.assign({ label:'ABCD'[i] }, i === k ? np.m : polyFor(R, lvl, ns[j++])));
      return { q:`${ROWQ} Which shape is NOT a polygon?`, kind:'choice', a:'ABCD'[k], choices:ABCD(4), model:{ type:'shapes', items },
        hint:'A polygon is closed and every side is a straight line. Look for a curve or a gap.',
        steps:[ 'Check each shape: is it closed? Are all the sides straight?', `Shape ${'ABCD'[k]} is not a polygon because ${WHY[np.why]}.`, `Answer: ${'ABCD'[k]}.`] }; } },
    // which IS a polygon
    { lv:[1,2,3], f(R, lvl){ const k = R.int(0, 3), n = R.int(3, 8), pool = R.shuffle(lvl === 1 ? NONPOLY.filter(x => x.easy) : NONPOLY);
      const items = []; let j = 0; for (let i = 0; i < 4; i++) items.push(Object.assign({ label:'ABCD'[i] }, i === k ? polyFor(R, lvl, n) : pool[j++].m));
      return { q:`${ROWQ} Which shape IS a polygon?`, kind:'choice', a:'ABCD'[k], choices:ABCD(4), model:{ type:'shapes', items },
        hint:'Find the shape that is closed and has only straight sides.',
        steps:[ 'The other shapes have a curve or a gap.', `Shape ${'ABCD'[k]} is closed with ${n} straight sides.`, `Answer: ${'ABCD'[k]}.`] }; } },
    // which shape is a [name]
    { lv:[1,2,3], f(R, lvl){ const ns = distinct(R, 4, 3, 8), k = R.int(0, 3), n = ns[k];
      const items = ns.map((s, i) => Object.assign({ label:'ABCD'[i] }, polyFor(R, lvl, s)));
      return { q:`${ROWQ} Which shape is ${an(NM[n])}?`, kind:'choice', a:'ABCD'[k], choices:ABCD(4), model:{ type:'shapes', items },
        hint:`${Cap(TIP[n])}. Count the sides of each shape.`,
        steps:[ `${Cap(an(NM[n]))} has ${n} sides.`, `Shape ${'ABCD'[k]} has ${n} sides.`, `Answer: ${'ABCD'[k]}.`] }; } },
    // is this a polygon? (pick the reason)
    { lv:[1,2,3], f(R, lvl){ const yes = R.chance(.45), np = nonPoly(R, lvl), n = R.int(3, 8);
      const Y = 'Yes. It is closed and all its sides are straight.', C = 'No. It has a curved side.', O = 'No. It is not closed.', E = 'No. Its sides are not all the same length.';
      const ans = yes ? Y : np.why === 'curve' ? C : O;
      return { q:'Is this shape a polygon? Pick the best answer.', kind:'choice', a:ans, choices:[Y, C, O, E], model:Object.assign({ type:'polygon' }, yes ? polyFor(R, Math.max(2, lvl), n) : np.m),
        hint:'Polygon check: closed? all straight sides? (The sides do NOT have to be the same length.)',
        steps:[ 'A polygon must be closed and have only straight sides.', yes ? `This shape is closed and has ${n} straight sides.` : `This shape is not a polygon: ${WHY[np.why]}.`, `Answer: ${ans}`] }; } },
    // prefix -> number
    { lv:[1,2,3], f(R, lvl){ const n = R.int(3, 8);
      return { q:`The name ${NM[n]} starts with "${PRE[n]}-". What number does "${PRE[n]}-" mean?`, kind:'num', a:n,
        hint:'Think of other words: tricycle, octopus, quadruplets...',
        steps:[ `${Cap(TIP[n])}.`, `So ${an(NM[n])} has ${n} sides.`] }; } },
    // number -> prefix name
    { lv:[1,2,3], f(R, lvl){ const n = R.int(3, 8), ans = Cap(NM[n]);
      return { q:`Which shape name starts with a part that means ${n}?`, kind:'choice', a:ans, choices:choices(ans, R.shuffle(near(n))),
        hint:'tri = 3, quad = 4, penta = 5, hexa = 6, hepta = 7, octa = 8.',
        steps:[ `${Cap(TIP[n])}.`, `So the answer is ${ans}.`] }; } },
    // real world: shape name
    { lv:[1,2,3], f(R, lvl){ const [o, n] = R.pick(REAL), ans = Cap(NM[n]);
      return { q:`What polygon is the shape of ${o}?`, kind:'choice', a:ans, choices:choices(ans, R.shuffle(near(n))),
        hint:'Picture it, then count its sides.',
        steps:[ `${Cap(o)} has ${n} sides.`, `A shape with ${n} sides is ${an(NM[n])}.`] }; } },
    // real world: count sides
    { lv:[1,2,3], f(R, lvl){ const [o, n] = R.pick(REAL);
      return { q:`How many sides does ${o} have?`, kind:'num', a:n,
        hint:'Picture it and count the straight edges.',
        steps:[ `${Cap(o)} is shaped like ${an(NM[n])}.`, `${Cap(an(NM[n]))} has ${n} sides.`] }; } },
    // real world: not a polygon
    { lv:[1,2,3], f(R, lvl){ const rnd = R.pick(ROUND), ps = R.shuffle(REAL).slice(0, 3).map(x => Cap(x[0])), ans = Cap(rnd);
      return { q:'Which of these is NOT shaped like a polygon?', kind:'choice', a:ans, choices:choices(ans, ps),
        hint:'A polygon has only straight sides. Which one is round?',
        steps:[ `${ans} is round. It has no straight sides.`, 'The others have straight sides, so they are polygons.'] }; } },
    // how many more sides
    { lv:[1,2,3], f(R, lvl){ let [a, b] = distinct(R, 2, 3, lvl === 1 ? 6 : 8); if (a < b) [a, b] = [b, a];
      return { q:`How many more sides does ${an(NM[a])} have than ${an(NM[b])}?`, kind:'num', a:a - b,
        hint:'Find how many sides each shape has. Then subtract.',
        steps:[ `${Cap(an(NM[a]))} has ${a} sides.`, `${Cap(an(NM[b]))} has ${b} sides.`, `${a} − ${b} = ${a - b}.`] }; } },
    // total sides of k shapes
    { lv:[1,2,3], f(R, lvl){ const n = R.int(3, lvl === 1 ? 5 : 8), k = lvl === 1 ? 2 : R.int(2, lvl === 2 ? 4 : 5), w = R.pick(['sides','vertices']);
      return { q:`How many ${w} do ${k} ${pls(NM[n])} have in all?`, kind:'num', a:k * n,
        hint:`How many ${w} does one ${NM[n]} have? Add that ${k} times.`,
        steps:[ `One ${NM[n]} has ${n} ${w}.`, `${k} × ${n} = ${k * n}.`, `${k * n} ${w} in all.`] }; } },
    // riddles
    { lv:[1,2,3], f(R, lvl){ const v = R.int(0, lvl === 1 ? 2 : 6);
      let q, n, why;
      if (v === 0){ n = R.int(3, 8); q = `I am a polygon with ${n} vertices. What am I?`; why = `${n} vertices means ${n} sides.`; }
      else if (v === 1){ const b = R.int(3, 7), d = R.int(1, Math.min(lvl === 1 ? 2 : 4, 8 - b)); n = b + d; q = `I have ${d} more side${d > 1 ? 's' : ''} than ${an(NM[b])}. What am I?`; why = `${Cap(an(NM[b]))} has ${b} sides. ${b} + ${d} = ${n}.`; }
      else if (v === 2){ const b = R.int(4, 8), d = R.int(1, Math.min(3, b - 3)); n = b - d; q = `I have ${d} fewer side${d > 1 ? 's' : ''} than ${an(NM[b])}. What am I?`; why = `${Cap(an(NM[b]))} has ${b} sides. ${b} − ${d} = ${n}.`; }
      else if (v === 3){ const [o, s] = R.pick(REAL); n = s; q = `I have the same number of sides as ${o}. What am I?`; why = `${Cap(o)} has ${s} sides.`; }
      else if (v === 4){ const b = R.pick([3, 4]); n = 2 * b; q = `I have twice as many sides as ${an(NM[b])}. What am I?`; why = `${Cap(an(NM[b]))} has ${b} sides. Twice ${b} is ${n}.`; }
      else if (v === 5){ n = R.int(3, 8); q = `If you add my sides to a triangle's sides, you get ${n + 3}. What am I?`; why = `A triangle has 3 sides. ${n + 3} − 3 = ${n}.`; }
      else { const b = R.int(3, 7); n = b + 1; q = `I have one more angle than ${an(NM[b])}. What am I?`; why = `${Cap(an(NM[b]))} has ${b} angles. ${b} + 1 = ${n}.`; }
      const ans = Cap(NM[n]);
      return { q, kind:'choice', a:ans, choices:choices(ans, R.shuffle(near(n))), hint:'Work out how many sides the mystery shape has. Then name it.',
        steps:[ why, `A shape with ${n} sides is ${an(NM[n])}.`] }; } },
    // true or false
    { lv:[1,2,3], f(R, lvl){ const n = R.int(3, 8), w = R.pick(['sides','vertices','angles']);
      const bank = [
        () => { const k = R.chance(.5) ? n : (n === 3 ? 4 : n + R.pick([-1, 1])); return [`${Cap(an(NM[n]))} has ${k} ${w}.`, k === n, `${Cap(an(NM[n]))} has ${n} ${w}.`]; },
        () => ['A circle is a polygon.', false, 'A circle is curved. A polygon has only straight sides.'],
        () => ['A polygon can have a curved side.', false, 'Every side of a polygon is straight.'],
        () => ['A shape must be closed to be a polygon.', true, 'A polygon has no gaps.'],
        () => ['A polygon must have at least 3 sides.', true, '2 straight sides cannot close up a shape. A triangle (3 sides) is the smallest polygon.'],
        () => ['Every hexagon has 6 sides that are all the same length.', false, 'A hexagon just needs 6 straight sides. They can be different lengths.'],
        () => ['A polygon has the same number of sides and vertices.', true, 'Each side ends at a vertex, so the numbers match.'],
        () => { const [a, b] = distinct(R, 2, 3, 8); return [`${Cap(an(NM[a]))} has more sides than ${an(NM[b])}.`, a > b, `${Cap(an(NM[a]))} has ${a} sides and ${an(NM[b])} has ${b}.`]; },
        () => { const a = R.int(3, 6), d = R.int(1, 8 - a), s = R.chance(.5) ? d : d + 1; return [`${Cap(an(NM[a + d]))} has ${s} more side${s > 1 ? 's' : ''} than ${an(NM[a])}.`, s === d, `${a + d} − ${a} = ${d}.`]; }
      ];
      const [s, t, why] = R.pick(lvl === 1 ? bank.slice(0, 5) : bank)();
      const ans = t ? 'True' : 'False';
      return { q:`True or false? ${s}`, kind:'choice', a:ans, choices:TF, hint:'Read it carefully. Think about what makes a polygon and how many sides each one has.',
        steps:[ why, `So it is ${ans.toLowerCase()}.`] }; } },
    // error analysis with a drawing
    { lv:[1,2,3], f(R, lvl){ const A = who(R), n = R.int(3, 8), m = polyFor(R, lvl, n);
      const right = R.chance(.4), c = right ? n : (n === 8 ? 7 : n === 3 ? 4 : n + R.pick([-1, 1]));
      const he = /^(Sam|Leo|Ben|Max|Noah)$/.test(A) ? 'he' : 'she';
      const ans = right ? `Yes. It has ${n} sides.` : `No. It has ${n} sides, so it is ${an(NM[n])}.`;
      const ds = right ? [`No. It has ${n + 1} sides.`, `No. Its sides must all be the same length.`, `No. It has ${n - 1} sides.`]
                       : [`Yes. It has ${c} sides.`, `No. It has ${c + 1} sides.`, `Yes. It looks close enough.`];
      return { q:`${A} says this shape is ${an(NM[c])}. Is ${he} right?`, kind:'choice', a:ans, choices:choices(ans, ds), model:Object.assign({ type:'polygon' }, m),
        hint:'Count the sides yourself. Then check the name.',
        steps:[ `Count the sides: ${n}.`, `${Cap(an(NM[n]))} has ${n} sides.`, right ? `${A} is right.` : `${A} is not right. It is ${an(NM[n])}.`] }; } },
    // irregular still has the name
    { lv:[1,2,3], f(R, lvl){ const n = R.int(3, 8), A = who(R), ans = `No. It has ${n} straight sides, so it is still ${an(NM[n])}.`;
      const m = lvl === 1 ? { shape:{3:'irregular-triangle',4:'irregular-quad',5:'irregular-pentagon',6:'irregular-hexagon',7:'irregular-heptagon',8:'irregular-octagon'}[n] } : { pts:irr(R, n) };
      return { q:`${A} says this is not ${an(NM[n])} because its sides are not all the same length. Is ${A} right?`, kind:'choice', a:ans,
        choices:choices(ans, [`Yes. ${Cap(pls(NM[n]))} must have equal sides.`, `Yes. It is not a polygon.`, `No. It is ${an(NM[n === 8 ? 7 : n + 1])}.`]), model:Object.assign({ type:'polygon' }, m),
        hint:'Does the name depend on the side lengths, or on how many sides there are?',
        steps:[ `Count the sides: ${n}.`, 'Sides can be different lengths. The name only depends on how many sides.', `It is still ${an(NM[n])}.`] }; } },
    // regular and irregular: same name
    { lv:[1,2,3], f(R, lvl){ const n = R.int(3, 8), ans = Cap(NM[n]), sw = R.chance(.5);
      const a = { pts:reg(n, R.pick([0, Math.PI / n])) }, b = { pts:irr(R, n) };
      return { q:'Shape A has equal sides. Shape B does not. What is the name of BOTH shapes?', kind:'choice', a:ans, choices:choices(ans, near(n)),
        model:{ type:'shapes', items:[Object.assign({ label:'A' }, a), Object.assign({ label:'B' }, b)] },
        hint:'Count the sides of each shape.', steps:[ `Shape A has ${n} sides. Shape B has ${n} sides too.`, `Both are ${pls(NM[n])}, even if the sides are not equal.`] }; } },
    // which has more sides (words)
    { lv:[1,2,3], f(R, lvl){ const [a, b] = distinct(R, 2, 3, 8), ans = Cap(an(NM[Math.max(a, b)]));
      return { q:`Which has more sides: ${an(NM[a])} or ${an(NM[b])}?`, kind:'choice', a:ans, choices:[Cap(an(NM[a])), Cap(an(NM[b])), 'They have the same number'],
        hint:'Figure out how many sides each one has.', steps:[ `${Cap(an(NM[a]))} has ${a} sides. ${Cap(an(NM[b]))} has ${b} sides.`, `${Math.max(a, b)} is more, so the answer is ${ans.toLowerCase()}.`] }; } },
    // the most sides in a row
    { lv:[1,2,3], f(R, lvl){ const ns = distinct(R, 4, 3, 8), mx = Math.max(...ns), k = ns.indexOf(mx), fewest = lvl > 1 && R.chance(.4), mn = Math.min(...ns), kk = fewest ? ns.indexOf(mn) : k;
      return { q:`${ROWQ} Which shape has the ${fewest ? 'fewest' : 'most'} sides?`, kind:'choice', a:'ABCD'[kk], choices:ABCD(4),
        model:{ type:'shapes', items:ns.map((s, i) => Object.assign({ label:'ABCD'[i] }, polyFor(R, lvl, s))) },
        hint:'Count the sides of every shape, then compare.', steps:[ `The shapes have ${ns.join(', ')} sides.`, `Shape ${'ABCD'[kk]} has ${fewest ? mn : mx}, the ${fewest ? 'fewest' : 'most'}.`] }; } },
    // count the polygons in a row
    { lv:[1,2,3], f(R, lvl){ const k = R.int(1, 3), np = R.shuffle(lvl === 1 ? NONPOLY.filter(x => x.easy) : NONPOLY).slice(0, 4 - k), ss = R.shuffle([...Array(k)].map(() => polyFor(R, lvl, R.int(3, 8))).concat(np.map(x => x.m)));
      return { q:`${ROWQ} How many of these shapes are polygons?`, kind:'num', a:k, model:{ type:'shapes', items:ss.map((s, i) => Object.assign({ label:'ABCD'[i] }, s)) },
        hint:'Check each shape: closed, and only straight sides?', steps:[ `${4 - k} shape${4 - k > 1 ? 's have' : ' has'} a curve or a gap.`, `${k} ${k > 1 ? 'are polygons' : 'is a polygon'}.`] }; } },
    // count shapes with a name in a row
    { lv:[1,2,3], f(R, lvl){ const n = R.int(3, 8), k = R.int(1, 3), others = distinct(R, 4 - k, 3, 8, [n]), ss = R.shuffle([...Array(k)].map(() => n).concat(others));
      return { q:`${ROWQ} How many of these shapes are ${pls(NM[n])}?`, kind:'num', a:k, model:{ type:'shapes', items:ss.map((s, i) => Object.assign({ label:'ABCD'[i] }, polyFor(R, lvl, s))) },
        hint:`Look for shapes with exactly ${n} sides.`, steps:[ `${Cap(pls(NM[n]))} have ${n} sides.`, `Count the shapes with ${n} sides: ${k}.`] }; } },
    // how many more sides: drawing
    { lv:[1,2,3], f(R, lvl){ let [a, b] = distinct(R, 2, 3, 8); if (a < b) [a, b] = [b, a];
      return { q:'How many more sides does shape A have than shape B?', kind:'num', a:a - b,
        model:{ type:'shapes', items:[Object.assign({ label:'A' }, polyFor(R, lvl, a)), Object.assign({ label:'B' }, polyFor(R, lvl, b))] },
        hint:'Count the sides of each shape, then subtract.', steps:[ `Shape A has ${a} sides. Shape B has ${b} sides.`, `${a} − ${b} = ${a - b}.`] }; } },
    // sides and vertices together
    { lv:[1,2,3], f(R, lvl){ const n = R.int(3, lvl === 1 ? 6 : 8);
      return { q:`Add the number of sides and the number of vertices of ${an(NM[n])}. What do you get?`, kind:'num', a:2 * n,
        hint:'A polygon has the same number of sides and vertices.', steps:[ `${Cap(an(NM[n]))} has ${n} sides and ${n} vertices.`, `${n} + ${n} = ${2 * n}.`] }; } },
    // square corners in a polygon
    { lv:[2,3], f(R, lvl){ const S = R.pick([
        { m:{ shape:'house' }, k:2, n:5 }, { m:{ shape:'right-triangle', right:[1] }, k:1, n:3 }, { m:{ shape:'right-trapezoid' }, k:2, n:4 },
        { m:{ pts:[[30,30],[170,30],[170,120],[100,175],[30,175]] }, k:3, n:5 }, { m:{ shape:'rectangle' }, k:4, n:4 },
        { m:{ pts:[[30,30],[120,30],[175,85],[175,175],[30,175]] }, k:3, n:5 }, { m:{ shape:'pentagon' }, k:0, n:5 }, { m:{ shape:'hexagon' }, k:0, n:6 } ]);
      return { q:`How many right angles (square corners) does this ${NM[S.n]} have?`, kind:'num', a:S.k, model:Object.assign({ type:'polygon' }, S.m),
        hint:'A right angle is a square corner, like the corner of a book. Check each corner.',
        steps:[ `It has ${S.n} corners. Check each one.`, S.k ? `${S.k} of them ${S.k > 1 ? 'are' : 'is a'} square corner${S.k > 1 ? 's' : ''}.` : 'None of them are square corners.', `Answer: ${S.k}.`] }; } },
    // total -> what shape
    { lv:[2,3], f(R, lvl){ const A = who(R), n = R.int(3, 8), k = R.int(2, lvl === 2 ? 3 : 5), ans = Cap(NM[n]);
      return { q:`${A} drew ${k} shapes that are all the same kind of polygon. They have ${k * n} sides in all. What shape did ${A} draw?`, kind:'choice', a:ans, choices:choices(ans, R.shuffle(near(n))),
        hint:`Share ${k * n} sides equally among ${k} shapes.`, steps:[ `${k * n} ÷ ${k} = ${n} sides each.`, `A shape with ${n} sides is ${an(NM[n])}.`] }; } },
    // total -> how many shapes
    { lv:[2,3], f(R, lvl){ const A = who(R), n = R.int(3, 8), k = R.int(2, lvl === 2 ? 4 : 6);
      return { q:`${A} made some ${pls(NM[n])} with straws. One straw is one side. ${A} used ${k * n} straws. How many ${pls(NM[n])} did ${A} make?`, kind:'num', a:k,
        hint:`Each ${NM[n]} uses ${n} straws.`, steps:[ `Each ${NM[n]} needs ${n} straws.`, `${k * n} ÷ ${n} = ${k}.`, `${A} made ${k} ${pls(NM[n])}.`] }; } },
    // mixed totals
    { lv:[3], f(R, lvl){ const [a, b] = distinct(R, 2, 3, 8), x = R.int(1, 3), y = R.int(1, 3), tot = x * a + y * b;
      const one = (c, s) => `${c} ${c > 1 ? pls(NM[s]) : NM[s]}`;
      return { q:`How many sides do ${one(x, a)} and ${one(y, b)} have in all?`, kind:'num', a:tot,
        hint:'Find the sides for each kind of shape, then add.', steps:[ `${one(x, a)}: ${x} × ${a} = ${x * a}.`, `${one(y, b)}: ${y} × ${b} = ${y * b}.`, `${x * a} + ${y * b} = ${tot}.`] }; } }
  ];
  M['g3.polygons'] = { name:'Polygons', unit:'g3u4', gen(R, lvl){ return pickType(R, POLY_T, lvl); } };

  // =====================================================================
  // QUADRILATERALS
  // =====================================================================
  const QN = ['Square','Rectangle','Rhombus','Parallelogram','Trapezoid'];
  // names each shape truthfully also has, so they are never offered as wrong answers
  const ALSO = { Square:['Rectangle','Rhombus','Parallelogram','Quadrilateral'], Rectangle:['Parallelogram','Quadrilateral'], Rhombus:['Parallelogram','Quadrilateral'],
    Parallelogram:['Quadrilateral'], Trapezoid:['Quadrilateral'] };
  const DESC = { Square:'4 equal sides and 4 right angles', Rectangle:'4 right angles, and its sides are not all equal', Rhombus:'4 equal sides, but no right angles',
    Parallelogram:'2 pairs of parallel sides, but no right angles and not all sides equal', Trapezoid:'only 1 pair of parallel sides' };
  // drawings: rt = right angles, par = pairs of parallel sides, lv = lowest level that uses it
  const QD = {
    Square:[ { m:{ shape:'square' }, rt:4, par:2, lv:1 }, { m:{ pts:[[50,40],[150,40],[150,140],[50,140]] }, rt:4, par:2, lv:1 },
      { m:{ pts:[[100,15],[180,95],[100,175],[20,95]], right:[0,1,2,3] }, rt:4, par:2, lv:3 },
      { m:{ pts:[[64.1,21.1],[176.9,62.1],[135.9,174.9],[23.1,133.9]], right:[0,1,2,3] }, rt:4, par:2, lv:3 } ],
    Rectangle:[ { m:{ shape:'rectangle' }, rt:4, par:2, lv:1 }, { m:{ pts:[[60,15],[140,15],[140,180],[60,180]] }, rt:4, par:2, lv:2 },
      { m:{ pts:[[50.7,23.4],[189.3,103.4],[149.3,172.6],[10.7,92.6]], right:[0,1,2,3] }, rt:4, par:2, lv:3 } ],
    Rhombus:[ { m:{ pts:[[100,40],[185,98],[100,156],[15,98]] }, rt:0, par:2, lv:1 }, { m:{ pts:[[15,150],[115,150],[172.4,68.1],[72.4,68.1]] }, rt:0, par:2, lv:2 },
      { m:{ pts:[[100,10],[150,98],[100,186],[50,98]] }, rt:0, par:2, lv:2 } ],
    Parallelogram:[ { m:{ shape:'parallelogram' }, rt:0, par:2, lv:1 }, { m:{ pts:[[5,40],[145,40],[195,150],[55,150]] }, rt:0, par:2, lv:2 },
      { m:{ pts:[[60,20],[150,50],[150,175],[60,145]] }, rt:0, par:2, lv:3 } ],
    Trapezoid:[ { m:{ shape:'trapezoid' }, rt:0, par:1, lv:1 }, { m:{ pts:[[10,45],[190,45],[140,155],[60,155]] }, rt:0, par:1, lv:2 }, { m:{ shape:'right-trapezoid' }, rt:2, par:1, lv:2 },
      { m:{ pts:[[40,40],[120,40],[185,155],[15,155]] }, rt:0, par:1, lv:2 }, { m:{ pts:[[40,20],[160,60],[160,140],[40,180]] }, rt:0, par:1, lv:3 } ]
  };
  const NOPAR = [ { m:{ shape:'kite' } }, { m:{ shape:'irregular-quad' } }, { m:{ pts:[[100,20],[180,170],[100,120],[20,170]] } } ];
  const qd = (R, nm, lvl) => R.pick(QD[nm].filter(d => d.lv <= lvl));
  const notQuad = (R, lvl) => R.pick([3, 5, 6, 8].map(n => () => polyFor(R, lvl, n)))();
  const QSTAT = {
    Square:{ T:['It has 4 right angles.','All 4 sides are equal.','It has 2 pairs of parallel sides.'], F:['It has only 1 pair of parallel sides.','It has no right angles.','It has 5 vertices.'] },
    Rectangle:{ T:['It has 4 right angles.','It has 2 pairs of parallel sides.','Its opposite sides are equal.'], F:['All 4 sides are equal.','It has no right angles.','It has only 1 pair of parallel sides.'] },
    Rhombus:{ T:['All 4 sides are equal.','It has 2 pairs of parallel sides.'], F:['It has 4 right angles.','It has only 1 pair of parallel sides.','It has 5 sides.'] },
    Parallelogram:{ T:['It has 2 pairs of parallel sides.','Its opposite sides are equal.'], F:['It has 4 right angles.','All 4 sides are equal.','It has only 1 pair of parallel sides.'] },
    Trapezoid:{ T:['It has exactly 1 pair of parallel sides.'], F:['It has 2 pairs of parallel sides.','All 4 sides are equal.','It has 5 vertices.'] }
  };
  const QCLUE = [
    { c:'4 right angles, but the sides are not all equal', a:'Rectangle', ds:['Square','Rhombus','Trapezoid'], why:'A square has all sides equal, so it is out. A rhombus and a trapezoid do not have 4 right angles.' },
    { c:'4 equal sides and 4 right angles', a:'Square', ds:['Rhombus','Trapezoid','Pentagon'], why:'A rhombus has equal sides but no square corners.' },
    { c:'4 equal sides but no right angles', a:'Rhombus', ds:['Square','Rectangle','Trapezoid'], why:'A square has right angles, so it is out.' },
    { c:'only 1 pair of parallel sides', a:'Trapezoid', ds:['Square','Rectangle','Rhombus'], why:'Squares, rectangles and rhombuses have 2 pairs of parallel sides.' },
    { c:'2 pairs of parallel sides, no right angles, and sides that are not all equal', a:'Parallelogram', ds:['Rectangle','Square','Trapezoid'], why:'Rectangles and squares have right angles. A trapezoid has only 1 pair of parallel sides.' }
  ];
  const QRID = [
    { q:'I am a rectangle AND a rhombus at the same time. What am I?', a:'Square', ds:['Trapezoid','Pentagon','Triangle'], why:'A rectangle has 4 right angles. A rhombus has 4 equal sides. Both together is a square.' },
    { q:'I am a quadrilateral, but not a parallelogram. I have 1 pair of parallel sides. What am I?', a:'Trapezoid', ds:['Rectangle','Rhombus','Square'], why:'Only 1 pair of parallel sides means a trapezoid.' },
    { q:'I am a parallelogram with 4 right angles, but my sides are not all equal. What am I?', a:'Rectangle', ds:['Square','Rhombus','Trapezoid'], why:'Right angles but not all sides equal: a rectangle.' },
    { q:'I am a parallelogram with 4 equal sides and no square corners. What am I?', a:'Rhombus', ds:['Square','Rectangle','Trapezoid'], why:'Equal sides with no square corners: a rhombus.' },
    { q:'I have 4 sides and 4 vertices, but I am not a square, a rectangle, a rhombus or a parallelogram. My top and bottom are parallel. What am I?', a:'Trapezoid', ds:['Pentagon','Triangle','Hexagon'], why:'4 sides with one pair of parallel sides: a trapezoid.' },
    { q:'A rhombus has 4 right angles. What else can we call it?', a:'Square', ds:['Trapezoid','Triangle','Pentagon'], why:'4 equal sides and 4 right angles make a square.' },
    { q:'A rectangle has 4 sides that are all the same length. What else can we call it?', a:'Square', ds:['Trapezoid','Triangle','Hexagon'], why:'4 right angles and 4 equal sides make a square.' }
  ];
  const QTF = [
    ['Every square is a rectangle.', true, 'A square has 4 right angles, so it is a rectangle too.'],
    ['Every rectangle is a square.', false, 'A rectangle can be long and thin. Its sides do not have to be equal.'],
    ['A rhombus is always a square.', false, 'A rhombus does not have to have right angles.'],
    ['Every square is a rhombus.', true, 'A square has 4 equal sides, so it is a rhombus too.'],
    ['Every rectangle is a parallelogram.', true, 'A rectangle has 2 pairs of parallel sides.'],
    ['A trapezoid has 2 pairs of parallel sides.', false, 'A trapezoid has only 1 pair of parallel sides.'],
    ['Every quadrilateral has 4 angles.', true, 'Quad- means 4: 4 sides and 4 angles.'],
    ['A square is a quadrilateral.', true, 'A square has 4 sides.'],
    ['Every parallelogram has 4 right angles.', false, 'Many parallelograms lean over and have no square corners.'],
    ['A rhombus has 4 equal sides.', true, 'That is what makes it a rhombus.'],
    ['A rectangle always has 4 equal sides.', false, 'Only its opposite sides have to be equal.'],
    ['A trapezoid is a quadrilateral.', true, 'A trapezoid has 4 sides.'],
    ['Every rhombus is a parallelogram.', true, 'A rhombus has 2 pairs of parallel sides.'],
    ['A triangle is a quadrilateral.', false, 'A triangle has 3 sides, not 4.'],
    ['A square can be called a parallelogram.', true, 'A square has 2 pairs of parallel sides.']
  ];
  const QERR = [
    { s:'Rhombus', claim:'this shape is a square because all 4 sides are equal', a:'No. Its corners are not right angles, so it is a rhombus.', ds:['Yes. All 4 sides are equal.','No. It is a trapezoid.','No. It has 5 sides.'], why:'A square also needs 4 right angles.' },
    { s:'Square', claim:'this shape is NOT a rectangle', a:'No. It has 4 right angles, so it is a rectangle too.', ds:['Yes. A rectangle cannot have 4 equal sides.','Yes. It is only a square.','Yes. It is a trapezoid.'], why:'Every square has 4 right angles, so every square is a rectangle.' },
    { s:'Trapezoid', claim:'this shape is a parallelogram', a:'No. Only 1 pair of sides is parallel, so it is a trapezoid.', ds:['Yes. It has parallel sides.','Yes. It has 4 sides.','No. It is a rectangle.'], why:'A parallelogram needs 2 pairs of parallel sides.' },
    { s:'Rectangle', claim:'this shape is a parallelogram', a:'Yes. It has 2 pairs of parallel sides.', ds:['No. A parallelogram cannot have right angles.','No. It is only a rectangle.','No. It has only 1 pair of parallel sides.'], why:'A rectangle has 2 pairs of parallel sides, so it is a parallelogram too.' },
    { s:'Parallelogram', claim:'this shape is a rectangle', a:'No. It has no right angles.', ds:['Yes. It has 2 pairs of parallel sides.','Yes. Its opposite sides are equal.','No. It has 5 sides.'], why:'A rectangle needs 4 right angles.' },
    { s:'Square', claim:'this shape is a rhombus', a:'Yes. All 4 sides are equal.', ds:['No. A rhombus cannot have right angles.','No. It is only a square.','No. It has only 1 pair of parallel sides.'], why:'A square has 4 equal sides, so it is a rhombus too.' },
    { s:'Rhombus', claim:'this shape is a parallelogram', a:'Yes. It has 2 pairs of parallel sides.', ds:['No. It has no right angles.','No. It is a trapezoid.','No. Its sides are all equal.'], why:'Its opposite sides are parallel.' }
  ];
  const sayYes = A => /^(Sam|Leo|Ben|Max|Noah)$/.test(A) ? 'he' : 'she';
  const UNITS = ['cm', 'in', 'ft', 'm'];

  // side-length drawings: labels outside each side (or ? for the one to find)
  function sqDraw(nm, lab){ // lab = [top, right, bottom, left]
    if (nm === 'Rhombus') return { pts:[[100,30],[160,98],[100,166],[40,98]], labels:[[150,52,lab[0]],[154,148,lab[1]],[50,148,lab[2]],[46,52,lab[3]]].filter(l => l[2]) };
    if (nm === 'Rectangle') return { pts:[[45,55],[155,55],[155,135],[45,135]], labels:[[100,46,lab[0]],[178,100,lab[1]],[100,154,lab[2]],[22,100,lab[3]]].filter(l => l[2]) };
    return { pts:[[55,45],[145,45],[145,135],[55,135]], labels:[[100,36,lab[0]],[170,95,lab[1]],[100,154,lab[2]],[30,95,lab[3]]].filter(l => l[2]) }; }

  const QUAD_T = [
    // best name for a drawing
    { lv:[1,2,3], f(R, lvl){ const nm = R.pick(QN), d = qd(R, nm, lvl);
      const pool = R.shuffle(QN.filter(x => x !== nm && !ALSO[nm].includes(x))).concat(['Pentagon','Hexagon']);
      return { q:lvl === 3 && d.m.right ? 'This shape is turned. What is the best name for it?' : 'What is the best name for this shape?', kind:'choice', a:nm, choices:choices(nm, pool), model:Object.assign({ type:'polygon' }, d.m),
        hint:'Check: Are the sides equal? Are the corners square corners? Which sides are parallel?',
        steps:[ 'It has 4 sides, so it is a quadrilateral.', `Look closer: it has ${DESC[nm]}.`, `The best name is ${nm.toLowerCase()}.`] }; } },
    // which shape has these clues
    { lv:[1,2,3], f(R, lvl){ const it = R.pick(QCLUE);
      return { q:`Which shape has ${it.c}?`, kind:'choice', a:it.a, choices:choices(it.a, it.ds), hint:'Read each clue and cross out the shapes that do not fit.',
        steps:[ it.why, `Only the ${it.a.toLowerCase()} fits every clue.`] }; } },
    // riddle
    { lv:[1,2,3], f(R, lvl){ const it = R.pick(lvl === 1 ? QRID.slice(4) : QRID);
      return { q:it.q, kind:'choice', a:it.a, choices:choices(it.a, it.ds), hint:'Use each clue to cross out shapes.', steps:[ it.why, `Answer: ${it.a}.`] }; } },
    // count right angles (drawn)
    { lv:[1,2,3], f(R, lvl){ const nm = R.pick(QN), d = qd(R, nm, lvl);
      return { q:'How many right angles (square corners) does this shape have?', kind:'num', a:d.rt, model:Object.assign({ type:'polygon' }, d.m),
        hint:'A right angle is a square corner, like the corner of a book. Check all 4 corners.',
        steps:[ 'Check each of the 4 corners.', d.rt ? `${d.rt} of them ${d.rt > 1 ? 'are' : 'is a'} square corner${d.rt > 1 ? 's' : ''}.` : 'None of the corners are square corners. They are slanted.', `Answer: ${d.rt}.`] }; } },
    // count parallel pairs (drawn)
    { lv:[1,2,3], f(R, lvl){ const nm = R.pick(QN.concat(['none'])), d = nm === 'none' ? Object.assign({ par:0 }, R.pick(NOPAR)) : qd(R, nm, lvl);
      return { q:'How many pairs of parallel sides does this shape have?', kind:'num', a:d.par, model:Object.assign({ type:'polygon' }, d.m),
        hint:'Parallel sides go the same way and never meet, like train tracks. Check the opposite sides.',
        steps:[ 'Look at each pair of opposite sides.', d.par === 2 ? 'Both pairs go the same way.' : d.par === 1 ? 'Only one pair goes the same way.' : 'No pair goes the same way. They would meet if you made them longer.', `Answer: ${d.par}.`] }; } },
    // equal sides: square and rhombus
    { lv:[1,2], f(R, lvl){ const nm = R.pick(['Square','Rhombus']), d = qd(R, nm, lvl);
      return { q:'How many sides of this shape are the same length?', kind:'num', a:4, model:Object.assign({ type:'polygon' }, d.m),
        hint:'Compare the lengths of the sides.', steps:[ `This is ${an(nm.toLowerCase())}.`, `${Cap(an(nm.toLowerCase()))} has 4 equal sides.`] }; } },
    // true or false
    { lv:[1,2,3], f(R, lvl){ const [s, t, why] = R.pick(lvl === 1 ? QTF.filter((x, i) => [0,1,5,6,7,9,11,13].includes(i)) : QTF), ans = t ? 'True' : 'False';
      return { q:`True or false? ${s}`, kind:'choice', a:ans, choices:TF, hint:'Think about what each shape must have.', steps:[ why, `So it is ${ans.toLowerCase()}.`] }; } },
    // which name does NOT fit this shape
    { lv:[1,2,3], f(R, lvl){ const nm = R.pick(['Square','Rectangle','Rhombus','Parallelogram']), d = qd(R, nm, lvl);
      const wrong = QN.filter(x => x !== nm && !ALSO[nm].includes(x)), ans = R.pick(wrong), ok = [nm].concat(ALSO[nm], ['Polygon']);
      return { q:'Which name is NOT true for this shape?', kind:'choice', a:ans, choices:choices(ans, R.shuffle(ok)), model:Object.assign({ type:'polygon' }, d.m),
        hint:'A shape can have more than one name. Find the one that does not fit.',
        steps:[ `This is ${an(nm.toLowerCase())}: it has ${DESC[nm]}.`, `It is also: ${ALSO[nm].map(x => x.toLowerCase()).join(', ')} and polygon.`, `It is not ${an(ans.toLowerCase())}.`] }; } },
    // missing side: square
    { lv:[1,2,3], f(R, lvl){ const s = R.int(2, lvl === 1 ? 9 : 25), u = R.pick(UNITS), at = R.int(1, 3), lab = ['', '', '', '']; lab[0] = `${s} ${u}`; lab[at] = '?';
      return { q:'This shape is a square. How long is the side marked ?', kind:'num', a:s, unit:u, model:Object.assign({ type:'polygon' }, sqDraw('Square', lab)),
        hint:'All 4 sides of a square are the same length.', steps:[ 'A square has 4 equal sides.', `One side is ${s} ${u}, so every side is ${s} ${u}.`] }; } },
    // missing side: rhombus
    { lv:[1,2,3], f(R, lvl){ const s = R.int(2, lvl === 1 ? 9 : 25), u = R.pick(UNITS), at = R.int(1, 3), lab = ['', '', '', '']; lab[0] = `${s} ${u}`; lab[at] = '?';
      return { q:'This shape is a rhombus. How long is the side marked ?', kind:'num', a:s, unit:u, model:Object.assign({ type:'polygon' }, sqDraw('Rhombus', lab)),
        hint:'All 4 sides of a rhombus are the same length.', steps:[ 'A rhombus has 4 equal sides.', `One side is ${s} ${u}, so every side is ${s} ${u}.`] }; } },
    // missing side: rectangle
    { lv:[1,2,3], f(R, lvl){ const w = R.int(6, lvl === 1 ? 12 : 30), h = R.int(2, w - 2), u = R.pick(UNITS), askW = R.chance(.5), lab = [`${w} ${u}`, '', '', `${h} ${u}`];
      if (askW) lab[2] = '?'; else lab[1] = '?';
      return { q:'This shape is a rectangle. How long is the side marked ?', kind:'num', a:askW ? w : h, unit:u, model:Object.assign({ type:'polygon' }, sqDraw('Rectangle', lab)),
        hint:'In a rectangle, opposite sides are the same length.', steps:[ 'Opposite sides of a rectangle are equal.', `The side marked ? is across from the ${askW ? w : h} ${u} side.`, `So it is ${askW ? w : h} ${u}.`] }; } },
    // all four sides of a rectangle (words)
    { lv:[1,2,3], f(R, lvl){ const w = R.int(4, 15), h = R.int(2, w - 1), u = R.pick(UNITS), ans = `${w} ${u} and ${h} ${u}`;
      return { q:`Two sides of a rectangle that touch are ${w} ${u} and ${h} ${u} long. How long are the other two sides?`, kind:'choice', a:ans,
        choices:choices(ans, [`${w} ${u} and ${w} ${u}`, `${h} ${u} and ${h} ${u}`, `${w + h} ${u} and ${w + h} ${u}`]),
        hint:'Opposite sides of a rectangle match.', steps:[ 'Each side has a matching side across from it.', `So the other sides are ${w} ${u} and ${h} ${u}.`] }; } },
    // all sides added (square/rhombus/rectangle)
    { lv:[2,3], f(R, lvl){ const nm = R.pick(['Square','Rhombus','Rectangle']), u = R.pick(UNITS);
      if (nm === 'Rectangle'){ const w = R.int(4, 12), h = R.int(2, w - 1), t = 2 * (w + h);
        return { q:'This shape is a rectangle. How long are all 4 sides added together?', kind:'num', a:t, unit:u, model:Object.assign({ type:'polygon' }, sqDraw('Rectangle', [`${w} ${u}`, '', '', `${h} ${u}`])),
          hint:'Find the 2 missing sides first. Opposite sides match.', steps:[ `The sides are ${w}, ${h}, ${w} and ${h}.`, `${w} + ${h} + ${w} + ${h} = ${t}.`] }; }
      const s = R.int(2, 12), t = 4 * s;
      return { q:`This shape is ${an(nm.toLowerCase())}. How long are all 4 sides added together?`, kind:'num', a:t, unit:u, model:Object.assign({ type:'polygon' }, sqDraw(nm, [`${s} ${u}`, '', '', ''])),
        hint:`All 4 sides of ${an(nm.toLowerCase())} are equal.`, steps:[ `Every side is ${s} ${u}.`, `${s} + ${s} + ${s} + ${s} = ${t}.`] }; } },
    // which shape is a [name] (row)
    { lv:[1,2,3], f(R, lvl){ const nm = R.pick(QN), k = R.int(0, 3);
      // distractors must truly not be that kind of shape
      const pool = QN.filter(x => x !== nm && !ALSO[x].includes(nm) && !ALSO[nm].includes(x));
      const items = []; for (let i = 0; i < 4; i++){ items.push(Object.assign({ label:'ABCD'[i] }, i === k ? qd(R, nm, lvl).m : (pool.length && R.chance(.7) ? qd(R, R.pick(pool), lvl).m : notQuad(R, lvl)))); }
      return { q:`${ROWQ} Which shape is ${an(nm.toLowerCase())}?`, kind:'choice', a:'ABCD'[k], choices:ABCD(4), model:{ type:'shapes', items },
        hint:`${Cap(an(nm.toLowerCase()))} has ${DESC[nm]}.`, steps:[ `Look for ${DESC[nm]}.`, `Shape ${'ABCD'[k]} is ${an(nm.toLowerCase())}.`] }; } },
    // which is NOT a parallelogram (row)
    { lv:[1,2,3], f(R, lvl){ const k = R.int(0, 3), par = R.shuffle(['Square','Rectangle','Rhombus','Parallelogram']), odd = R.chance(.6) ? qd(R, 'Trapezoid', lvl).m : R.pick(NOPAR).m;
      const items = []; let j = 0; for (let i = 0; i < 4; i++) items.push(Object.assign({ label:'ABCD'[i] }, i === k ? odd : qd(R, par[j++], lvl).m));
      return { q:`${ROWQ} Which shape is NOT a parallelogram?`, kind:'choice', a:'ABCD'[k], choices:ABCD(4), model:{ type:'shapes', items },
        hint:'A parallelogram has 2 pairs of parallel sides. Squares, rectangles and rhombuses count!', steps:[ 'Check both pairs of opposite sides in each shape.', `Shape ${'ABCD'[k]} does not have 2 pairs of parallel sides.`, `Answer: ${'ABCD'[k]}.`] }; } },
    // which shape has NO parallel sides (row)
    { lv:[2,3], f(R, lvl){ const k = R.int(0, 3), oth = R.shuffle(QN).slice(0, 3);
      const items = []; let j = 0; for (let i = 0; i < 4; i++) items.push(Object.assign({ label:'ABCD'[i] }, i === k ? R.pick(NOPAR).m : qd(R, oth[j++], lvl).m));
      return { q:`${ROWQ} Which quadrilateral has NO parallel sides?`, kind:'choice', a:'ABCD'[k], choices:ABCD(4), model:{ type:'shapes', items },
        hint:'Parallel sides never meet, like train tracks.', steps:[ 'The other shapes each have at least 1 pair of parallel sides.', `Shape ${'ABCD'[k]} has none.`] }; } },
    // count quadrilaterals in a row
    { lv:[1,2,3], f(R, lvl){ const k = R.int(1, 3), qs = [...Array(k)].map(() => R.chance(.3) ? R.pick(NOPAR).m : qd(R, R.pick(QN), lvl).m), os = [...Array(4 - k)].map(() => notQuad(R, lvl));
      return { q:`${ROWQ} How many of these shapes are quadrilaterals?`, kind:'num', a:k, model:{ type:'shapes', items:R.shuffle(qs.concat(os)).map((m, i) => Object.assign({ label:'ABCD'[i] }, m)) },
        hint:'A quadrilateral is any polygon with 4 sides.', steps:[ 'Count the sides of each shape.', `${k} shape${k > 1 ? 's have' : ' has'} 4 sides.`] }; } },
    // count shapes with 4 right angles in a row
    { lv:[1,2,3], f(R, lvl){ const k = R.int(1, 3), ys = [...Array(k)].map(() => qd(R, R.pick(['Square','Rectangle']), Math.min(lvl, 2)).m), ns = [...Array(4 - k)].map(() => qd(R, R.pick(['Rhombus','Parallelogram','Trapezoid']), lvl).m);
      return { q:`${ROWQ} How many of these shapes have 4 right angles?`, kind:'num', a:k, model:{ type:'shapes', items:R.shuffle(ys.concat(ns)).map((m, i) => Object.assign({ label:'ABCD'[i] }, m)) },
        hint:'Look for shapes where every corner is a square corner.', steps:[ 'Squares and rectangles have 4 right angles.', `There ${k > 1 ? 'are' : 'is'} ${k}.`] }; } },
    // error analysis
    { lv:[1,2,3], f(R, lvl){ const it = R.pick(QERR), A = who(R), d = qd(R, it.s, Math.max(lvl, 1));
      return { q:`${A} says ${it.claim}. Is ${sayYes(A)} right?`, kind:'choice', a:it.a, choices:choices(it.a, it.ds), model:Object.assign({ type:'polygon' }, d.m),
        hint:'Check the sides, the corners and the parallel sides.', steps:[ it.why, `Answer: ${it.a}`] }; } },
    // which sentence is true about this shape
    { lv:[1,2,3], f(R, lvl){ const nm = R.pick(QN), d = qd(R, nm, lvl), S = QSTAT[nm], ans = R.pick(S.T);
      const F = nm === 'Trapezoid' && d.rt ? S.F : S.F.concat(nm === 'Trapezoid' ? ['It has 4 right angles.'] : []);
      return { q:'Which sentence is true about this shape?', kind:'choice', a:ans, choices:choices(ans, R.shuffle(F)), model:Object.assign({ type:'polygon' }, d.m),
        hint:'Check the sides, the corners and the parallel sides one at a time.', steps:[ `This is ${an(nm.toLowerCase())}: it has ${DESC[nm]}.`, `So "${ans}" is true.`] }; } },
    // which sentence is NOT true
    { lv:[2,3], f(R, lvl){ const nm = R.pick(QN), d = qd(R, nm, lvl), S = QSTAT[nm], ans = R.pick(S.F);
      return { q:'Which sentence is NOT true about this shape?', kind:'choice', a:ans, choices:choices(ans, R.shuffle(S.T.concat(['It is a quadrilateral.','It has 4 vertices.']))), model:Object.assign({ type:'polygon' }, d.m),
        hint:'Three sentences are true. Find the one that is wrong.', steps:[ `This is ${an(nm.toLowerCase())}: it has ${DESC[nm]}.`, `"${ans}" is not true.`] }; } },
    // facts in words
    { lv:[1,2,3], f(R, lvl){ const it = R.pick([
        ['How many angles does every quadrilateral have?', 4, 'Quad- means 4: 4 sides, 4 vertices, 4 angles.'],
        ['How many sides does every quadrilateral have?', 4, 'Quad- means 4.'],
        ['How many pairs of parallel sides does a trapezoid have?', 1, 'A trapezoid has only 1 pair of parallel sides.'],
        ['How many right angles does every rectangle have?', 4, 'Every corner of a rectangle is a square corner.'],
        ['How many pairs of parallel sides does a parallelogram have?', 2, 'Para- sounds like parallel: 2 pairs.'],
        ['How many equal sides does a rhombus have?', 4, 'All 4 sides of a rhombus are equal.'],
        ['How many right angles does every square have?', 4, 'Every corner of a square is a square corner.'],
        ['How many pairs of parallel sides does a square have?', 2, 'Top and bottom are parallel, and so are left and right.']]);
      return { q:it[0], kind:'num', a:it[1], hint:'Picture the shape and check it.', steps:[ it[2], `Answer: ${it[1]}.`] }; } },
    // name by side lengths and corners
    { lv:[1,2,3], f(R, lvl){ const u = R.pick(UNITS), t = R.int(0, 2), a = R.int(3, 12), b = a + R.int(1, 6);
      const [ss, rt, ans] = t === 0 ? [[a, a, a, a], true, 'Square'] : t === 1 ? [[b, a, b, a], true, 'Rectangle'] : [[a, a, a, a], false, 'Rhombus'];
      return { q:`A quadrilateral has ${rt ? '4 right angles' : 'no right angles'}. Its sides are ${ss.join(', ')} ${u}, going around. What is the best name for it?`, kind:'choice', a:ans,
        choices:choices(ans, QN.filter(x => x !== ans && !ALSO[ans].includes(x)).concat(['Pentagon'])),
        hint:'Are the sides all equal? Are there right angles?', steps:[ ss[0] === ss[1] ? 'All 4 sides are equal.' : 'Opposite sides are equal, but not all 4.', rt ? 'It has 4 right angles.' : 'It has no right angles.', `So it is ${an(ans.toLowerCase())}.`] }; } },
    // totals of right angles / vertices
    { lv:[1,2,3], f(R, lvl){ const k = R.int(2, lvl === 1 ? 3 : 6), nm = R.pick(['squares','rectangles']), w = R.pick(['right angles','vertices','sides']);
      return { q:`How many ${w} do ${k} ${nm} have in all?`, kind:'num', a:4 * k, hint:`One of them has 4 ${w}.`, steps:[ `Each one has 4 ${w}.`, `${k} × 4 = ${4 * k}.`] }; } },
    // is this a quadrilateral?
    { lv:[1,2,3], f(R, lvl){ const yes = R.chance(.5), n = yes ? 4 : R.pick([3, 5, 6]), m = yes ? (R.chance(.4) ? R.pick(NOPAR).m : qd(R, R.pick(QN), lvl).m) : polyFor(R, lvl, n);
      const Y = 'Yes. It has 4 straight sides.', ans = yes ? Y : `No. It has ${n} sides.`;
      return { q:'Is this shape a quadrilateral?', kind:'choice', a:ans, choices:choices(ans, [Y, `No. It has ${n === 4 ? 5 : n === 3 ? 4 : n - 1} sides.`, 'No. Its sides are not equal.', 'No. It has no right angles.']), model:Object.assign({ type:'polygon' }, m),
        hint:'A quadrilateral is any polygon with 4 sides. The sides do not need to be equal.', steps:[ `Count the sides: ${n}.`, yes ? 'Any shape with 4 straight sides is a quadrilateral.' : `It needs 4 sides to be a quadrilateral.`] }; } },
    // another true name
    { lv:[2,3], f(R, lvl){ const nm = R.pick(['Square','Rectangle','Rhombus']), d = qd(R, nm, lvl), ans = R.pick(ALSO[nm].filter(x => x !== 'Quadrilateral'));
      const ds = QN.filter(x => x !== nm && !ALSO[nm].includes(x)).concat(['Pentagon','Triangle']);
      return { q:`This shape is ${an(nm.toLowerCase())}. Which other name is ALSO true for it?`, kind:'choice', a:ans, choices:choices(ans, R.shuffle(ds)), model:Object.assign({ type:'polygon' }, d.m),
        hint:'A shape can have more than one name. Check what it has.', steps:[ `It has ${DESC[nm]}.`, `So it is also ${an(ans.toLowerCase())}.`] }; } }
  ];
  M['g3.quads'] = { name:'Quadrilaterals', unit:'g3u4', gen(R, lvl){ return pickType(R, QUAD_T, lvl); } };

  // =====================================================================
  // COMBINE & CUT
  // =====================================================================
  const SQ = [[35,25],[165,25],[165,155],[35,155]], RECT = [[10,45],[190,45],[190,145],[10,145]], TRI = [[100,20],[180,170],[20,170]];
  const HX = [[182,98],[141,169],[59,169],[18,98],[59,27],[141,27]], HC = [100,98];  // flat-top regular hexagon, side 82, center HC
  const HOUSE = [[100,15],[175,80],[175,180],[25,180],[25,80]], PARA = [[55,40],[195,40],[145,150],[5,150]];
  const PTRAP = [[20,150],[180,150],[140,80.7],[60,80.7]], PRH = [[32,140],[122,140],[167,62.1],[77,62.1]]; // pattern-block trapezoid and rhombus (side 80 / 90)
  const ln = (a, b) => [a[0], a[1], b[0], b[1]];
  const hxC = ks => ks.map(k => ln(HC, HX[k]));
  // one cut makes two pieces: d = the two pieces, s = sides of each piece
  const CUT2 = [
    { pts:SQ, cuts:[[35,25,165,155]], d:'2 triangles', s:[3,3], lv:1, of:'square' },
    { pts:SQ, cuts:[[100,25,100,155]], d:'2 rectangles', s:[4,4], lv:1, of:'square' },
    { pts:RECT, cuts:[[10,145,190,45]], d:'2 triangles', s:[3,3], lv:1, of:'rectangle' },
    { pts:RECT, cuts:[[10,95,190,95]], d:'2 rectangles', s:[4,4], lv:1, of:'rectangle' },
    { pts:SQ, cuts:[[125,25,165,65]], d:'a pentagon and a triangle', s:[5,3], lv:1, of:'square' },
    { pts:RECT, cuts:[[10,95,60,145]], d:'a pentagon and a triangle', s:[5,3], lv:2, of:'rectangle' },
    { pts:TRI, cuts:[[100,20,100,170]], d:'2 triangles', s:[3,3], lv:1, of:'triangle' },
    { pts:TRI, cuts:[[57.3,100,142.7,100]], d:'a triangle and a trapezoid', s:[3,4], lv:2, of:'triangle' },
    { pts:HOUSE, cuts:[[25,80,175,80]], d:'a triangle and a rectangle', s:[3,4], lv:1, of:'pentagon' },
    { pts:HX, cuts:[ln(HX[3], HX[0])], d:'2 trapezoids', s:[4,4], lv:2, of:'hexagon' },
    { pts:PARA, cuts:[[55,40,55,150]], d:'a triangle and a trapezoid', s:[3,4], lv:2, of:'parallelogram' },
    { pts:PARA, cuts:[[55,40,145,150]], d:'2 triangles', s:[3,3], lv:2, of:'parallelogram' },
    { pts:SQ, cuts:[[35,25,165,90]], d:'a triangle and a trapezoid', s:[3,4], lv:2, of:'square' },
    { pts:PRH, cuts:[ln(PRH[1], PRH[3])], d:'2 triangles', s:[3,3], lv:2, of:'rhombus' }
  ];
  const CUT_D = ['2 triangles','2 rectangles','2 squares','a pentagon and a triangle','a triangle and a trapezoid','2 trapezoids','a triangle and a rectangle','2 pentagons','a square and a triangle','a hexagon and a triangle'];
  const cutDs = c => CUT_D.filter(x => x !== c.d && !(c.d === 'a triangle and a rectangle' && x === 'a square and a triangle'));
  // shapes put together: parts, the new shape's name and its number of sides
  const JOIN = [
    { pts:[[100,10],[160,70],[160,190],[40,190],[40,70]], cuts:[[40,70,160,70]], parts:'a square and a triangle', nm:'Pentagon', s:5, lv:1, no:['a rectangle and a triangle'] },
    { pts:[[10,50],[190,50],[190,140],[10,140]], cuts:[[100,50,100,140]], parts:'2 squares', nm:'Rectangle', s:4, lv:1, no:['2 rectangles'] },
    { pts:SQ, cuts:[[35,25,165,155]], parts:'2 triangles', nm:'Square', s:4, lv:1 },
    { pts:RECT, cuts:[[10,145,190,45]], parts:'2 triangles', nm:'Rectangle', s:4, lv:1 },
    { pts:PARA, cuts:[[55,40,145,150]], parts:'2 triangles', nm:'Parallelogram', s:4, lv:2 },
    { pts:TRI, cuts:[[100,20,100,170]], parts:'2 triangles', nm:'Triangle', s:3, lv:2 },
    { pts:[[15,60],[135,60],[188,98],[135,136],[15,136]], cuts:[[135,60,135,136]], parts:'a rectangle and a triangle', nm:'Pentagon', s:5, lv:2 },
    { pts:HX, cuts:[ln(HX[3], HX[0])], parts:'2 trapezoids', nm:'Hexagon', s:6, lv:1 },
    { pts:TRI, cuts:[[57.3,100,142.7,100]], parts:'a triangle and a trapezoid', nm:'Triangle', s:3, lv:3 },
    { pts:[[60,60],[140,60],[190,140],[10,140]], cuts:[[60,60,60,140],[140,60,140,140]], parts:'a square and 2 triangles', nm:'Trapezoid', s:4, lv:2 },
    { pts:[[10,65],[190,65],[190,125],[10,125]], cuts:[[70,65,70,125],[130,65,130,125]], parts:'3 squares', nm:'Rectangle', s:4, lv:2, no:['3 rectangles'] },
    { pts:[[20,20],[90,20],[90,110],[180,110],[180,180],[20,180]], cuts:[[90,110,90,180]], parts:'2 rectangles', nm:'Hexagon', s:6, lv:3 },
    { pts:PRH, cuts:[ln(PRH[1], PRH[3])], parts:'2 triangles', nm:'Rhombus', s:4, lv:2 },
    { pts:PTRAP, cuts:[[60,80.7,100,150],[140,80.7,100,150]], parts:'3 triangles', nm:'Trapezoid', s:4, lv:2 },
    { pts:HX, cuts:hxC([0,1,2,3,4,5]), parts:'6 triangles', nm:'Hexagon', s:6, lv:1 },
    { pts:HX, cuts:hxC([0,2,4]), parts:'3 rhombuses', nm:'Hexagon', s:6, lv:2 }
  ];
  const JOIN_P = ['a square and a triangle','2 squares','2 triangles','a rectangle and a triangle','2 trapezoids','a triangle and a trapezoid','a square and 2 triangles','3 squares','2 rectangles','3 triangles','6 triangles','3 rhombuses','2 pentagons','4 triangles'];
  const TRUE_ALSO = { Square:['Rectangle','Rhombus','Parallelogram'], Rectangle:['Parallelogram'], Rhombus:['Parallelogram'], Parallelogram:[], Trapezoid:[], Triangle:[], Pentagon:[], Hexagon:[] };
  const nameDs = a => ['Triangle','Square','Rectangle','Pentagon','Hexagon','Trapezoid','Octagon','Rhombus'].filter(x => x !== a && !TRUE_ALSO[a].includes(x));
  // pattern blocks drawn as a whole: q, answer, why
  const PB = [
    { pts:HX, cuts:hxC([0,1,2,3,4,5]), q:'How many green triangle blocks make this yellow hexagon?', a:6, why:'Count the triangles around the middle: 6.', lv:1 },
    { pts:HX, cuts:hxC([0,2,4]), q:'How many blue rhombus blocks make this yellow hexagon?', a:3, why:'Count the rhombuses: 3.', lv:1 },
    { pts:HX, cuts:[ln(HX[3], HX[0])], q:'How many red trapezoid blocks make this yellow hexagon?', a:2, why:'The cut makes a top half and a bottom half: 2 trapezoids.', lv:1 },
    { pts:PTRAP, cuts:[[60,80.7,100,150],[140,80.7,100,150]], q:'How many green triangle blocks make this red trapezoid?', a:3, why:'Count the triangles: 3.', lv:1 },
    { pts:PRH, cuts:[ln(PRH[1], PRH[3])], q:'How many green triangle blocks make this blue rhombus?', a:2, why:'The cut splits the rhombus into 2 triangles.', lv:1 },
    { pts:HX, cuts:[ln(HX[3], HX[0])].concat(hxC([1,2])), q:'This hexagon is made of 1 trapezoid and some triangles. How many triangles?', a:3, why:'The bottom half is cut into 3 triangles.', lv:2 },
    { pts:HX, cuts:[ln(HX[3], HX[0])].concat(hxC([4])), q:'This hexagon is made of 1 trapezoid, 1 rhombus and some triangles. How many triangles?', a:1, why:'The top half is 1 rhombus and 1 triangle.', lv:2 },
    { pts:HX, cuts:hxC([0,2,3,4]), q:'This hexagon is made of 2 rhombuses and some triangles. How many triangles?', a:2, why:'Besides the 2 rhombuses there are 2 triangles.', lv:2 }
  ];
  const EQ = [['triangles','hexagon',6],['rhombuses','hexagon',3],['trapezoids','hexagon',2],['triangles','trapezoid',3],['triangles','rhombus',2]];
  const COLOR = { triangles:'green', rhombuses:'blue', trapezoids:'red', hexagon:'yellow', trapezoid:'red', rhombus:'blue' };
  // drawings cut into several pieces: how many pieces
  const PIECES = [
    { pts:HX, cuts:hxC([0,1,2,3,4,5]), a:6, what:'triangles', lv:1 }, { pts:SQ, cuts:[[100,25,100,155],[35,90,165,90]], a:4, what:'squares', lv:1 },
    { pts:SQ, cuts:[[35,25,165,155],[165,25,35,155]], a:4, what:'triangles', lv:1 }, { pts:HX, cuts:[ln(HX[0], HX[2]), ln(HX[2], HX[4]), ln(HX[4], HX[0])], a:4, what:'triangles', lv:2 },
    { pts:HX, cuts:hxC([0,2,4]), a:3, what:'rhombuses', lv:1 }, { pts:PTRAP, cuts:[[60,80.7,100,150],[140,80.7,100,150]], a:3, what:'triangles', lv:1 }
  ];
  const sqItems = () => ({ diag:{ pts:SQ, cuts:[[35,25,165,155]] }, mid:{ pts:SQ, cuts:[[100,25,100,155]] }, corner:{ pts:SQ, cuts:[[125,25,165,65]] }, side:{ pts:SQ, cuts:[[35,25,165,90]] } });
  const SQ_WHAT = { diag:'2 triangles', mid:'2 rectangles', corner:'a pentagon and a triangle', side:'a triangle and a trapezoid' };
  const twoName = (a, b) => a === b ? `2 ${pls(NM[a])}` : `${an(NM[Math.min(a, b)])} and ${an(NM[Math.max(a, b)])}`;
  const CTF = [
    ['Two triangles can be put together to make a square.', true, 'Cut a square from corner to corner: the 2 triangles fit back together.'],
    ['A square can be cut into 2 triangles with one straight cut.', true, 'Cut from one corner to the opposite corner.'],
    ['Cutting a rectangle straight across the middle makes 2 smaller rectangles.', true, 'Each piece still has 4 square corners.'],
    ['Two squares put side by side make a triangle.', false, 'They make a rectangle.'],
    ['6 green triangle blocks can make a yellow hexagon.', true, 'The hexagon is 6 triangles around the middle.'],
    ['2 red trapezoid blocks can make a yellow hexagon.', true, 'Each trapezoid is half of the hexagon.'],
    ['3 red trapezoid blocks make one yellow hexagon.', false, 'Only 2 trapezoids make a hexagon.'],
    ['Cutting one corner off a square makes a pentagon and a triangle.', true, 'The big piece has 5 sides. The small piece has 3.'],
    ['A square and a triangle can be put together to make a pentagon.', true, 'Like a house: 3 square sides + 2 triangle sides = 5 sides.'],
    ['Cutting a square from corner to corner makes 2 rectangles.', false, 'It makes 2 triangles.'],
    ['4 blue rhombus blocks make one yellow hexagon.', false, 'It takes 3 rhombuses.'],
    ['2 green triangle blocks can make a blue rhombus.', true, 'A rhombus block is 2 triangles.'],
    ['Every straight cut across a triangle makes 2 triangles.', false, 'A cut across the middle makes a triangle and a trapezoid.'],
    ['Two triangles can be put together to make a parallelogram.', true, 'Cut a parallelogram from corner to corner: you get 2 triangles.']
  ];
  const CERR = [
    { c:'cutting a square from corner to corner makes 2 rectangles', a:'No. It makes 2 triangles.', ds:['Yes. Each piece has 4 sides.','No. It makes 2 squares.','No. It makes a pentagon.'], why:'Each piece has 3 sides.' },
    { c:'2 trapezoid blocks make a hexagon', a:'Yes. Each trapezoid is half of the hexagon.', ds:['No. It takes 3 trapezoids.','No. It takes 6 trapezoids.','No. Trapezoids make a square.'], why:'Two halves make a whole hexagon.' },
    { c:'it takes 4 rhombus blocks to make a hexagon', a:'No. It takes 3 rhombuses.', ds:['Yes. A hexagon has 4 parts.','No. It takes 6 rhombuses.','No. It takes 2 rhombuses.'], why:'A hexagon is 6 triangles, and each rhombus is 2 triangles: 6 ÷ 2 = 3.' },
    { c:'a square and a triangle put together like a house make a hexagon', a:'No. The new shape has 5 sides, so it is a pentagon.', ds:['Yes. 4 sides + 3 sides makes about 6.','No. It makes a heptagon.','No. It makes a square.'], why:'The shared side is inside now. Count the outside: 5 sides.' },
    { c:'cutting one corner off a square leaves a square', a:'No. The big piece has 5 sides, so it is a pentagon.', ds:['Yes. It still has 4 corners.','No. It leaves a triangle.','No. It leaves a hexagon.'], why:'Cutting a corner turns 1 corner into 2 corners.' },
    { c:'2 squares side by side make a bigger square', a:'No. They make a rectangle.', ds:['Yes. Squares make squares.','No. They make a triangle.','No. They make a pentagon.'], why:'The new shape is twice as long as it is tall.' }
  ];

  const pg = o => Object.assign({ type:'polygon' }, o);
  const COMP_T = [
    // what two shapes does the cut make
    { lv:[1,2,3], f(R, lvl){ const c = R.pick(CUT2.filter(x => x.lv <= lvl));
      return { q:`This ${c.of} is cut along the dashed line. What two shapes are made?`, kind:'choice', a:c.d, choices:choices(c.d, R.shuffle(cutDs(c))), model:pg({ pts:c.pts, cuts:c.cuts }),
        hint:'Look at each piece by itself. Count its sides.', steps:[ `One piece has ${c.s[0]} sides. The other has ${c.s[1]} sides.`, `So the cut makes ${c.d}.`] }; } },
    // sides of each piece / the pieces' sides in all
    { lv:[1,2,3], f(R, lvl){ const c = R.pick(CUT2.filter(x => x.lv <= lvl && (lvl === 3 || x.s[0] === x.s[1])));
      if (c.s[0] === c.s[1] && (lvl < 3 || R.chance(.4)))
        return { q:`This ${c.of} is cut into 2 pieces. How many sides does each piece have?`, kind:'num', a:c.s[0], model:pg({ pts:c.pts, cuts:c.cuts }),
          hint:'Pick one piece and count around it. The cut line is a side too!', steps:[ 'The dashed cut is one side of each piece.', `Each piece has ${c.s[0]} sides.`] };
      return { q:`This ${c.of} is cut into 2 pieces. How many sides do the 2 pieces have in all?`, kind:'num', a:c.s[0] + c.s[1], model:pg({ pts:c.pts, cuts:c.cuts }),
        hint:'Count the sides of each piece, then add. The cut is a side of BOTH pieces.', steps:[ `One piece has ${c.s[0]} sides. The other has ${c.s[1]}.`, `${c.s[0]} + ${c.s[1]} = ${c.s[0] + c.s[1]}.`] }; } },
    // a cut from one corner to another corner of a regular polygon
    { lv:[1,2,3], f(R, lvl){ const n = lvl === 1 ? R.pick([4, 6]) : lvl === 2 ? R.int(4, 6) : R.int(5, 8), k = R.int(2, n - 2), p = reg(n, n === 4 ? Math.PI / 4 : 0);
      const ans = twoName(k + 1, n - k + 1), A = k + 1, B = n - k + 1;
      const ds = [twoName(A, B + 1), twoName(Math.max(3, A - 1), B), twoName(A + 1, B + 1), `2 ${pls(NM[Math.min(8, n)])}`].filter(x => x !== ans);
      return { q:`This ${NM[n] === 'quadrilateral' ? 'square' : NM[n]} is cut from one corner to another corner. What two shapes are made?`, kind:'choice', a:ans, choices:choices(ans, ds), model:pg({ pts:p, cuts:[ln(p[0], p[k])] }),
        hint:'Count the corners of each piece. The two ends of the cut are corners of BOTH pieces.', steps:[ `One piece has ${A} sides. The other has ${B} sides.`, `So the cut makes ${ans}.`] }; } },
    // cut a corner off: how many sides does the bigger piece have / what is it
    { lv:[1,2,3], f(R, lvl){ const n = lvl === 1 ? R.pick([3, 4]) : R.int(3, lvl === 2 ? 6 : 7), p = reg(n, n === 4 ? Math.PI / 4 : 0), t = .35;
      const a = [r1(p[0][0] + t * (p[1][0] - p[0][0])), r1(p[0][1] + t * (p[1][1] - p[0][1]))], b = [r1(p[0][0] + t * (p[n - 1][0] - p[0][0])), r1(p[0][1] + t * (p[n - 1][1] - p[0][1]))];
      const nm = n === 4 ? 'square' : NM[n], m = pg({ pts:p, cuts:[ln(a, b)] });
      if (R.chance(.5)) return { q:`One corner is cut off this ${nm}. How many sides does the bigger piece have?`, kind:'num', a:n + 1, model:m,
        hint:'Count the sides of the big piece. The cut adds a new side.', steps:[ `The ${nm} had ${n} sides.`, 'The cut takes away a corner but adds one new side, so the big piece has 1 more side.', `${n} + 1 = ${n + 1}.`] };
      const ans = Cap(NM[n + 1]);
      return { q:`One corner is cut off this ${nm}. What shape is the bigger piece?`, kind:'choice', a:ans, choices:choices(ans, near(n + 1).concat([Cap(NM[n])])), model:m,
        hint:'Count the sides of the big piece.', steps:[ `The big piece has ${n + 1} sides.`, `A shape with ${n + 1} sides is ${an(NM[n + 1])}.`] }; } },
    // lines from one corner: n - 2 triangles (drawn)
    { lv:[1,2,3], f(R, lvl){ const n = lvl === 1 ? R.int(4, 5) : lvl === 2 ? R.int(4, 6) : R.int(5, 8), p = reg(n, n === 4 ? Math.PI / 4 : 0), cuts = [];
      for (let k = 2; k <= n - 2; k++) cuts.push(ln(p[0], p[k]));
      return { q:`Lines are drawn from ONE corner of this ${n === 4 ? 'square' : NM[n]}. How many triangles are made?`, kind:'num', a:n - 2, model:pg({ pts:p, cuts }),
        hint:'Count the triangles between the lines.', steps:[ `There are ${n - 3} line${n > 4 ? 's' : ''}, and ${n - 3} line${n > 4 ? 's make' : ' makes'} ${n - 2} pieces.`, `Each piece has 3 sides, so there are ${n - 2} triangles.`] }; } },
    // lines from one corner (words)
    { lv:[2,3], f(R, lvl){ const n = R.int(4, 8);
      return { q:`You draw lines from ONE corner of ${an(NM[n])} to every corner that is not next to it. How many triangles do you make?`, kind:'num', a:n - 2,
        hint:'Draw it! Or remember: the number of triangles is 2 less than the number of sides.', steps:[ `${Cap(an(NM[n]))} has ${n} sides.`, `From one corner you can draw ${n - 3} line${n > 4 ? 's' : ''}.`, `That makes ${n - 2} triangles.`] }; } },
    // joined: what is the new shape
    { lv:[1,2,3], f(R, lvl){ const j = R.pick(JOIN.filter(x => x.lv <= lvl));
      return { q:`${Cap(j.parts)} are put together like this. What is the new shape?`, kind:'choice', a:j.nm, choices:choices(j.nm, R.shuffle(nameDs(j.nm))), model:pg({ pts:j.pts, cuts:j.cuts }),
        hint:'Ignore the dashed lines inside. Look only at the outside edge and count its sides.', steps:[ `Count the outside sides: ${j.s}.`, `The new shape is ${an(j.nm.toLowerCase())}.`] }; } },
    // joined: how many sides / vertices
    { lv:[1,2,3], f(R, lvl){ const j = R.pick(JOIN.filter(x => x.lv <= lvl)), w = R.pick(['sides','vertices']);
      return { q:`${Cap(j.parts)} are put together to make this shape. How many ${w} does the new shape have?`, kind:'num', a:j.s, model:pg({ pts:j.pts, cuts:j.cuts }),
        hint:'Only count the outside edge. The dashed lines are inside the new shape.', steps:[ 'The sides where the pieces touch are inside now, so they do not count.', `Going around the outside: ${j.s} ${w}.`] }; } },
    // joined: which shapes were put together
    { lv:[1,2,3], f(R, lvl){ const j = R.pick(JOIN.filter(x => x.lv <= lvl)), ds = R.shuffle(JOIN_P.filter(x => x !== j.parts && !(j.no || []).includes(x)));
      return { q:'This shape was made by putting smaller shapes together along the dashed lines. Which shapes were used?', kind:'choice', a:j.parts, choices:choices(j.parts, ds), model:pg({ pts:j.pts, cuts:j.cuts }),
        hint:'Look at each piece between the dashed lines. Count its sides.', steps:[ 'Look at each piece by itself.', `The pieces are ${j.parts}.`] }; } },
    // pattern blocks with a drawing
    { lv:[1,2,3], f(R, lvl){ const b = R.pick(PB.filter(x => x.lv <= lvl));
      return { q:b.q, kind:'num', a:b.a, model:pg({ pts:b.pts, cuts:b.cuts }), hint:'Count the pieces the dashed lines make.', steps:[ b.why, `Answer: ${b.a}.`] }; } },
    // pattern blocks: how many to make several
    { lv:[1,2,3], f(R, lvl){ const [sm, bg, e] = R.pick(lvl === 1 ? EQ.slice(0, 3) : EQ), k = R.int(lvl === 1 ? 1 : 2, lvl === 1 ? 2 : 5), A = who(R);
      if (lvl === 1 || R.chance(.5)) return { q:`It takes ${e} ${COLOR[sm]} ${sm} to make one ${COLOR[bg]} ${bg}. How many ${sm} does ${A} need to make ${k} ${k > 1 ? pls(bg) : bg}?`, kind:'num', a:e * k,
        hint:`Each ${bg} needs ${e}. Add ${e} for each ${bg}.`, steps:[ `${k} ${k > 1 ? pls(bg) : bg} × ${e} ${sm} each.`, `${k} × ${e} = ${e * k}.`] };
      return { q:`It takes ${e} ${COLOR[sm]} ${sm} to make one ${COLOR[bg]} ${bg}. ${A} has ${e * k} ${sm}. How many ${pls(bg)} can ${A} make?`, kind:'num', a:k,
        hint:`How many groups of ${e} are in ${e * k}?`, steps:[ `Each ${bg} uses ${e} ${sm}.`, `${e * k} ÷ ${e} = ${k}.`] }; } },
    // pattern blocks: how many of a block make a shape (words)
    { lv:[1,2,3], f(R, lvl){ const [sm, bg, e] = R.pick(EQ);
      return { q:`How many ${COLOR[sm]} ${{triangles:'triangle',rhombuses:'rhombus',trapezoids:'trapezoid'}[sm]} pattern blocks make one ${COLOR[bg]} ${bg}?`, kind:'num', a:e,
        hint:'Picture the blocks fitting together with no gaps.', steps:[ sm === 'triangles' && bg === 'hexagon' ? 'A hexagon is 6 triangles around its middle.' : sm === 'rhombuses' ? 'Each rhombus is 2 triangles, and a hexagon is 6 triangles: 6 ÷ 2 = 3.' : sm === 'trapezoids' ? 'Each trapezoid is half of a hexagon.' : bg === 'trapezoid' ? 'A trapezoid block is 3 triangles in a row.' : 'A rhombus block is 2 triangles.', `Answer: ${e}.`] }; } },
    // mixed pattern blocks (words)
    { lv:[2,3], f(R, lvl){ const it = R.pick([
        ['A yellow hexagon is made of 1 red trapezoid and some green triangles. How many triangles?', 3, 'The trapezoid is half (3 triangles). The other half needs 3 triangles.'],
        ['A yellow hexagon is made of 1 blue rhombus and some green triangles. How many triangles?', 4, 'The hexagon is 6 triangles. The rhombus is 2 of them: 6 − 2 = 4.'],
        ['A yellow hexagon is made of 2 blue rhombuses and some green triangles. How many triangles?', 2, '2 rhombuses are 4 triangles: 6 − 4 = 2.'],
        ['A yellow hexagon is made of 1 red trapezoid, 1 blue rhombus and some green triangles. How many triangles?', 1, 'Trapezoid = 3 triangles, rhombus = 2: 6 − 3 − 2 = 1.'],
        ['A red trapezoid is made of 1 blue rhombus and some green triangles. How many triangles?', 1, 'A trapezoid is 3 triangles. The rhombus is 2 of them: 3 − 2 = 1.']]);
      return { q:it[0], kind:'num', a:it[1], hint:'Think of every block as green triangles: hexagon 6, trapezoid 3, rhombus 2.', steps:[ it[2], `Answer: ${it[1]}.`] }; } },
    // count pieces
    { lv:[1,2,3], f(R, lvl){ if (R.chance(.4)){ const k = R.int(2, lvl === 1 ? 4 : 6), cuts = []; for (let i = 1; i < k; i++){ const x = r1(10 + 180 * i / k); cuts.push([x, 45, x, 145]); }
        return { q:'This rectangle is cut along the dashed lines. How many pieces are made?', kind:'num', a:k, model:pg({ pts:RECT, cuts }),
          hint:'Count the pieces, not the lines.', steps:[ `There are ${k - 1} cut${k > 2 ? 's' : ''}.`, `${k - 1} straight cut${k > 2 ? 's' : ''} across make ${k} pieces.`] }; }
      const c = R.pick(PIECES.filter(x => x.lv <= lvl));
      return { q:'This shape is cut along the dashed lines. How many pieces are made?', kind:'num', a:c.a, model:pg({ pts:c.pts, cuts:c.cuts }),
        hint:'Touch each piece once as you count.', steps:[ `The pieces are ${c.a} ${c.what}.`, `Answer: ${c.a}.`] }; } },
    // which cut makes ... (row of squares)
    { lv:[1,2,3], f(R, lvl){ const I = sqItems(), keys = R.shuffle(lvl === 1 ? ['diag','mid','corner'] : ['diag','mid','corner','side']), want = R.pick(keys), k = keys.indexOf(want);
      return { q:`${keys.length === 3 ? 'Look at squares A, B and C.' : ROWQ} Which cut makes ${SQ_WHAT[want]}?`, kind:'choice', a:'ABCD'[k], choices:ABCD(keys.length),
        model:{ type:'shapes', items:keys.map((key, i) => Object.assign({ label:'ABCD'[i] }, I[key])) },
        hint:'Picture each square split along its dashed line. Count the sides of each piece.', steps:[ `Square ${'ABCD'[k]} splits into ${SQ_WHAT[want]}.`, `Answer: ${'ABCD'[k]}.`] }; } },
    // two cuts: what are the 4 pieces
    { lv:[1,2,3], f(R, lvl){ const both = R.chance(.5), ans = both ? '4 triangles' : '4 squares';
      return { q:'This square is cut along both dashed lines. What are the 4 pieces?', kind:'choice', a:ans, choices:choices(ans, both ? ['4 squares','4 rectangles','4 trapezoids'] : ['4 triangles','4 trapezoids','4 pentagons']),
        model:pg({ pts:SQ, cuts:both ? [[35,25,165,155],[165,25,35,155]] : [[100,25,100,155],[35,90,165,90]] }),
        hint:'Look at one piece. Count its sides and check its corners.', steps:[ both ? 'Each piece has 3 sides.' : 'Each piece has 4 equal sides and 4 square corners.', `They are ${ans}.`] }; } },
    // count triangles, big and small
    { lv:[2,3], f(R, lvl){ const it = R.pick([
        { m:{ pts:TRI, cuts:[[100,20,100,170]] }, a:3, why:'2 small triangles + 1 big triangle (the whole shape) = 3.', lv:2 },
        { m:{ pts:TRI, cuts:[[100,20,73.3,170],[100,20,126.7,170]] }, a:6, why:'3 small + 2 made of 2 pieces + 1 big = 6.', lv:3 },
        { m:{ pts:TRI, cuts:[[57.3,100,142.7,100]] }, a:2, why:'The small triangle on top + the whole big triangle = 2. The bottom piece is a trapezoid.', lv:2 },
        { m:{ pts:SQ, cuts:[[35,25,165,155],[165,25,35,155]] }, a:8, why:'4 small triangles + 4 bigger ones made of 2 small ones = 8.', lv:3 },
        { m:{ pts:RECT, cuts:[[10,145,190,45]] }, a:2, why:'The cut makes 2 triangles. The whole rectangle is not a triangle.', lv:2 }].filter(x => x.lv <= lvl));
      return { q:'How many triangles can you find in this picture? Count small ones and big ones.', kind:'num', a:it.a, model:pg(it.m),
        hint:'Count the small triangles first. Then look for bigger triangles made of more than one piece.', steps:[ it.why] }; } },
    // true or false
    { lv:[1,2,3], f(R, lvl){ const [s, t, why] = R.pick(lvl === 1 ? CTF.slice(0, 10) : CTF), ans = t ? 'True' : 'False';
      return { q:`True or false? ${s}`, kind:'choice', a:ans, choices:TF, hint:'Picture it or draw it.', steps:[ why, `So it is ${ans.toLowerCase()}.`] }; } },
    // error analysis
    { lv:[1,2,3], f(R, lvl){ const it = R.pick(CERR), A = who(R);
      return { q:`${A} says ${it.c}. Is ${sayYes(A)} right?`, kind:'choice', a:it.a, choices:choices(it.a, it.ds), hint:'Draw it on paper and check.', steps:[ it.why, `Answer: ${it.a}`] }; } },
    // word problems without a drawing
    { lv:[1,2,3], f(R, lvl){ const A = who(R), it = R.pick([
        [`${A} puts 2 squares that are the same size side by side. What shape do they make?`, 'Rectangle', ['Triangle','Pentagon','Hexagon'], 'The new shape has 4 sides and 4 square corners, and it is longer than it is tall.'],
        [`${A} puts a triangle on top of a square, like a house. What shape is the outline?`, 'Pentagon', ['Heptagon','Hexagon','Square'], '3 sides of the square + 2 sides of the triangle = 5 sides.'],
        [`${A} cuts a square from one corner to the opposite corner. What shapes are the pieces?`, 'Triangles', ['Squares','Rectangles','Pentagons'], 'Each piece has 3 sides.'],
        [`${A} cuts a hexagon in half from one corner to the opposite corner. What shapes are the pieces?`, 'Trapezoids', ['Triangles','Squares','Pentagons'], 'Each half has 4 sides and 1 pair of parallel sides.'],
        [`${A} puts 6 triangles that are the same size around one point. What shape do they make?`, 'Hexagon', ['Octagon','Pentagon','Square'], 'There is one outside side for each triangle: 6 sides.'],
        [`${A} cuts a rectangle in half, straight across from the middle of one long side to the middle of the other. What shapes are the pieces?`, 'Rectangles', ['Triangles','Trapezoids','Pentagons'], 'Each piece still has 4 square corners.']]);
      return { q:it[0], kind:'choice', a:it[1], choices:choices(it[1], it[2]), hint:'Draw it on paper. Then count the sides.', steps:[ it[3], `Answer: ${it[1]}.`] }; } },
    // how many cuts to make n pieces (rectangle)
    { lv:[2,3], f(R, lvl){ const k = R.int(3, 7), A = who(R);
      return { q:`${A} wants to cut a long rectangle into ${k} smaller rectangles with straight cuts across it. How many cuts does ${A} need?`, kind:'num', a:k - 1,
        hint:'Try it with 2 pieces first: 1 cut makes 2 pieces.', steps:[ 'Each cut across adds 1 more piece.', `To get ${k} pieces you need ${k - 1} cuts.`] }; } }
  ];
  M['g3.composepoly'] = { name:'Combine & cut polygons', unit:'g3u4', gen(R, lvl){ return pickType(R, COMP_T, lvl); } };
})();
