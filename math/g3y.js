// Page Quest math: grade 3 (FCPS / Virginia SOL 2023), the big question bank.
// Loaded after g3.js, g3geo.js and g3x.js; REPLACES these skills with a much wider variety of question types at every level:
// g3.facts, g3.arrays, g3.inverse, g3.wordmd, g3.multiples10, g3.fractions, g3.money, g3.time, g3.perimeter, g3.area, g3.graphs, g3.units.
// Contract: see g3.js. Every answer is computed from the generated numbers. Each skill is a pool of question types;
// gen() picks one of the types allowed at the level, and the level scales the numbers.
(function(){
  const M = window.MathSkills = window.MathSkills || {};

  // ---------- helpers (copied from g3.js, which keeps its own private) ----------
  const NAMES = ['Sam','Maya','Leo','Ava','Ben','Lily','Max','Emma','Noah','Mia','Zoe','Eli','Ruby','Omar','Nora','Jack','Ivy','Luis','Grace','Owen'];
  function fmt(n){ const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (n < 0 ? '−' : '') + s; }
  function name(R){ return R.pick(NAMES); }
  function names2(R){ const a = R.pick(NAMES); let b = R.pick(NAMES); while (b === a) b = R.pick(NAMES); return [a, b]; }
  // answer first, then up to 3 unique distractors (never equal to the answer)
  function choices(ans, ds){
    const out = [String(ans)];
    for (const d of ds){
      const s = String(d);
      const fa = /^(\d+)\/(\d+)$/.exec(String(ans)), fs = /^(\d+)\/(\d+)$/.exec(s);
      if (fa && fs && fa[1] * fs[2] === fs[1] * fa[2]) continue; // an equivalent fraction would be a second right answer
      if (!s || out.includes(s) || /NaN|undefined|Infinity|(^|[^\d])-\d|\/0\b|\$-/.test(s)) continue; // never a negative or impossible distractor
      out.push(s); if (out.length === 4) break;
    }
    return out;
  }
  function pl(n, w){ return n === 1 ? w.replace(/ies$/, 'y').replace(/(ch|sh|x)es$/, '$1').replace(/s$/, '') : w; }
  function cents(c){ return c >= 100 ? '$' + Math.floor(c / 100) + '.' + String(c % 100).padStart(2, '0') : c + '¢'; }
  function dol(c){ return '$' + Math.floor(c / 100) + '.' + String(c % 100).padStart(2, '0'); }
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const sum = a => a.reduce((x, y) => x + y, 0);
  const range = (a, b) => { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; };
  const skip = (f, n) => Array.from({ length:n }, (_, i) => f * (i + 1)).join(', ');
  // a type is a function tagged with the levels it is used at
  const ALL = [1, 2, 3], L12 = [1, 2], L23 = [2, 3], L1 = [1], L2 = [2], L3 = [3];
  function T(lv, f){ f.lv = lv; return f; }
  function run(types, R, lvl){ const ok = types.filter(t => t.lv.includes(lvl)); return R.pick(ok)(R, lvl); }
  // distractor strings whose value is not the answer's value
  function notVal(v, list){ return list.filter(x => x[1] !== v && x[1] >= 0 && isFinite(x[1])).map(x => x[0]); }

  // ---------- multiplication strategies (same wording as g3.js) ----------
  function factSteps(f, n){
    const p = f * n;
    switch (f){
      case 0: return [`0 groups of ${n} (or ${n} groups of 0) is nothing at all.`, `Anything times 0 is 0. So the answer is ${p}.`];
      case 1: return [`1 group of ${n} is just ${n}.`, `Anything times 1 stays the same. So the answer is ${p}.`];
      case 2: return [`× 2 is a double.`, `${n} + ${n} = ${p}. So the answer is ${p}.`];
      case 3: return [`× 3 = double, then one more group.`, `Double ${n}: ${n} + ${n} = ${2*n}.`, `One more ${n}: ${2*n} + ${n} = ${p}. So the answer is ${p}.`];
      case 4: return [`× 4 = double, then double again.`, `Double ${n}: ${2*n}.`, `Double again: ${2*n} + ${2*n} = ${p}. So the answer is ${p}.`];
      case 5: return [`Count by 5s, ${n} times.`, n ? `${skip(5, n)}.` : `0 fives is 0.`, `So the answer is ${p}.`];
      case 6: return [`× 6 = × 5, then one more group.`, `5 × ${n} = ${5*n}.`, `${5*n} + ${n} = ${p}. So the answer is ${p}.`];
      case 7: return [`Break 7 into 5 + 2.`, `5 × ${n} = ${5*n} and 2 × ${n} = ${2*n}.`, `${5*n} + ${2*n} = ${p}. So the answer is ${p}.`];
      case 8: return [`× 8 = double, double, double!`, `${n} → ${2*n} → ${4*n}.`, `Double once more: ${4*n} + ${4*n} = ${p}. So the answer is ${p}.`];
      case 9: return [`× 9 trick: do × 10, then take one group away.`, `10 × ${n} = ${10*n}.`, `${10*n} − ${n} = ${p}. So the answer is ${p}.`];
      case 10: return [`× 10: put a 0 on the end.`, `${n} becomes ${p}. So the answer is ${p}.`];
    }
    return [`${f} × ${n} = ${p}.`];
  }
  function factHint(f){
    return ({0:'What happens when you have zero groups?', 1:'One group of a number is just that number.', 2:'Times 2 is a double. What is the number plus itself?',
      3:'Double it, then add one more group.', 4:'Double it, then double that again.', 5:'Count by 5s. Or think: half of times 10.',
      6:'Do times 5 first, then add one more group.', 7:'Break 7 into 5 and 2. Do both and add.', 8:'Double, double, double!',
      9:'Do times 10, then take away one group.', 10:'Times 10 puts a 0 on the end.'})[f] || 'Use a fact you know to help.';
  }
  // which factor to build the strategy on: the easiest one
  const PRI = [0, 1, 2, 10, 5, 9, 4, 3, 6, 8, 7];
  function strat(x, y){ return PRI.indexOf(x) <= PRI.indexOf(y) ? [x, y] : [y, x]; }
  function mSteps(x, y){ const [f, n] = strat(x, y); return factSteps(f, n); }
  function mHint(x, y){ return factHint(strat(x, y)[0]); }
  const divSteps = (p, d, q) => [`Division asks: ${d} times what makes ${p}?`, `Try it: ${d} × ${q} = ${p}.`, `So ${p} ÷ ${d} = ${q}.`];
  const FACT_SETS = { 1:[0,1,2,5,10], 2:[0,1,2,3,4,5,6,10], 3:[0,1,2,3,4,5,6,7,8,9,10] };
  const HARD = { 1:[2,5,10], 2:[3,4,6], 3:[6,7,8,9] };
  // a fact pair: x is from the level's set (often a "hard" one), y is 0..10; both at least lo
  function pair(R, lvl, lo){
    lo = lo || 0; let x, y, g = 0;
    do { x = R.chance(0.65) ? R.pick(HARD[lvl]) : R.pick(FACT_SETS[lvl]); y = R.int(lo, 10); } while (x < lo && g++ < 50);
    if (x < lo) x = Math.max(lo, 2);
    return R.chance(0.5) ? [x, y] : [y, x];
  }
  // a division fact: divisor from the level's set (never 0), quotient lo..10
  function dpair(R, lvl, lo){
    const ds = FACT_SETS[lvl].filter(v => v >= Math.max(1, lo || 1));
    const d = R.chance(0.6) ? R.pick(HARD[lvl].filter(v => ds.includes(v))) : R.pick(ds), q = R.int(lo || 0, 10);
    return [d * q, d, q];
  }

  // ======================= g3.facts =======================
  const EQ_CTX = [['bags','apples'], ['boxes','crayons'], ['plates','cookies'], ['vases','flowers'], ['nests','eggs'], ['packs','cards'], ['tanks','fish'], ['jars','marbles'], ['baskets','muffins'], ['cups','straws']];
  const SHARE_CTX = ['stickers','cookies','grapes','pencils','marbles','crackers','beads','toy cars'];
  const TEAM_CTX = [['students','teams'], ['kids','groups'], ['players','teams'], ['campers','tents'], ['dancers','lines']];
  const mFact = (x, y, q, extra) => Object.assign({ q, kind:'num', a:x * y, fact:`${x}x${y}`, hint:mHint(x, y), steps:mSteps(x, y) }, extra || {});
  const dFact = (p, d, q, text, extra) => Object.assign({ q:text, kind:'num', a:q, fact:`${p}/${d}`, hint:`Think of the fact family: ${d} × what = ${p}?`, steps:divSteps(p, d, q) }, extra || {});
  const FACTS = [
    T(ALL, (R, l) => { const [x, y] = pair(R, l); return mFact(x, y, `What is ${x} × ${y}?`); }),
    T(ALL, (R, l) => { const [x, y] = pair(R, l); return mFact(x, y, `Solve: ${x} × ${y} = ☐`); }),
    T(ALL, (R, l) => { const [x, y] = pair(R, l); return mFact(x, y, `☐ = ${x} × ${y}. What number goes in the box?`); }),
    T(ALL, (R, l) => { const [x, y] = pair(R, l, 1); return mFact(x, y, `What is ${x} groups of ${y}?`, { hint:`${x} groups of ${y} means ${x} × ${y}.` }); }),
    T(ALL, (R, l) => { const [x, y] = pair(R, l); return mFact(x, y, `What is the product of ${x} and ${y}?`, { hint:'Product means the answer when you multiply. ' + mHint(x, y) }); }),
    T(ALL, (R, l) => { let [x, y] = pair(R, l, 1); if (y < 2) [x, y] = [y, x]; if (y < 2) y = 2;
      return mFact(x, y, `Count by ${y}s, ${x} times. What number do you end on?`, { hint:`Say the ${y}s out loud and keep track on your fingers.`, steps:[`Count by ${y}s: ${skip(y, x)}.`, `That is ${x} counts, so ${x} × ${y} = ${x * y}.`] }); }),
    T(ALL, (R, l) => { const [x, y] = pair(R, l, 2), c = R.pick(EQ_CTX), A = name(R);
      return mFact(x, y, `${A} has ${x} ${c[0]} with ${y} ${c[1]} in each. How many ${c[1]} are there in all?`, { hint:'Equal groups! How many groups, and how many in each? ' + mHint(x, y), steps:[`${x} groups of ${y} means ${x} × ${y}.`, ...mSteps(x, y)] }); }),
    T(ALL, (R, l) => { const [x, y] = pair(R, l, 1);
      return mFact(x, y, 'How many dots are in this array? Use multiplication.', { model:{ type:'array', rows:x, cols:y }, hint:'Rows × dots in each row. ' + mHint(x, y), steps:[`There are ${x} rows with ${y} dots in each.`, ...mSteps(x, y)] }); }),
    T(ALL, (R, l) => { let [x, y] = pair(R, l, 2); if (x > 6) [x, y] = [y, x]; if (x > 6) x = 6;
      return mFact(x, y, 'How many dots are there in all the circles?', { model:{ type:'groups', groups:x, each:y }, hint:'Count one circle. Then think: how many circles?', steps:[`There are ${x} circles with ${y} dots in each.`, ...mSteps(x, y)] }); }),
    T(ALL, (R, l) => { let [x, y] = pair(R, l, 1); if (x === y) y = y === 10 ? 9 : y + 1; const p = x * y, ans = `${y} × ${x}`;
      return { q:`Which is the same as ${x} × ${y}?`, kind:'choice', a:ans, fact:`${x}x${y}`,
        choices: choices(ans, R.shuffle(notVal(p, [[`${x} + ${y}`, x + y], [`${x} × ${y + 1}`, x * (y + 1)], [`${x + 1} × ${y}`, (x + 1) * y], [`${y} + ${y}`, 2 * y], [`${x} × ${x}`, x * x]]))),
        hint:'You can switch the order of the factors and the product stays the same.',
        steps:[`${x} × ${y} = ${p}.`, `Turn it around: ${y} × ${x} = ${p} too.`, `So ${ans} is the same.`] }; }),
    T(ALL, (R, l) => { let [x, y] = pair(R, l, 1); if (x > 5) [x, y] = [y, x]; if (x > 5) x = R.int(2, 5); if (x < 2) x = 2;
      const p = x * y, add = Array(x).fill(y).join(' + '), ans = `${x} × ${y}`;
      return { q:`Which is the same as ${add}?`, kind:'choice', a:ans, fact:`${x}x${y}`,
        choices: choices(ans, R.shuffle(notVal(p, [[`${y} × ${y}`, y * y], [`${x} + ${y}`, x + y], [`${x + 1} × ${y}`, (x + 1) * y], [`${x} × ${y + 1}`, x * (y + 1)]]))),
        hint:'Count how many times the same number is added. That is the number of groups.',
        steps:[`${y} is added ${x} times.`, `${x} groups of ${y} = ${ans}.`, `${ans} = ${p}.`] }; }),
    T(ALL, (R, l) => { const ev = FACT_SETS[l].filter(v => v >= 2 && v % 2 === 0), f = R.pick(ev), h = f / 2, n = R.int(1, 10), p = f * n;
      return { q:`Use a double. ${h} × ${n} = ${h * n}. So what is ${f} × ${n}?`, kind:'num', a:p, fact:`${f}x${n}`,
        hint:`${f} is double ${h}, so ${f} × ${n} is double ${h * n}.`, steps:[`${f} is double ${h}, so ${f} × ${n} is double ${h} × ${n}.`, `Double ${h * n}: ${h * n} + ${h * n} = ${p}.`, `So ${f} × ${n} = ${p}.`] }; }),
    T(ALL, (R, l) => { const [x, y] = pair(R, l), p = x * y;
      return { q:`If ${x} × ${y} = ${p}, what is ${y} × ${x}?`, kind:'num', a:p, fact:`${y}x${x}`,
        hint:'Switching the order of the factors does not change the product.', steps:[`${y} × ${x} has the same factors as ${x} × ${y}.`, `The order does not matter when you multiply.`, `So ${y} × ${x} = ${p}.`] }; }),
    T(ALL, (R, l) => { const fs = FACT_SETS[l].filter(v => v >= 3), f = R.pick(fs), a = f >= 6 ? 5 : 2, b = f - a, n = R.int(1, 10), p = f * n;
      return { q:`${f} × ${n} is the same as ${a} × ${n} + ${b} × ${n}. What is ${f} × ${n}?`, kind:'num', a:p, fact:`${f}x${n}`,
        hint:`Find ${a} × ${n} and ${b} × ${n}, then add them.`, steps:[`${a} × ${n} = ${a * n}.`, `${b} × ${n} = ${b * n}.`, `${a * n} + ${b * n} = ${p}. So ${f} × ${n} = ${p}.`] }; }),
    T(ALL, (R, l) => { let [x, y] = pair(R, l, 1); if (y < 2) [x, y] = [y, x]; if (y < 2) y = 2; const A = name(R);
      return mFact(x, y, `${A} hops by ${y}s on a number line, starting at 0. Where does ${A} land after ${x} hops?`, { hint:`Each hop is ${y}. ${x} hops is ${x} × ${y}.`, steps:[`Hop by ${y}s: ${skip(y, x)}.`, `${x} hops of ${y} is ${x} × ${y} = ${x * y}.`] }); }),
    T(ALL, (R, l) => { const [x, y] = pair(R, l, 2), it = R.pick(['stickers','erasers','pencils','bookmarks','stamps']);
      return mFact(x, y, `${cap(it)} cost ${y}¢ each. How much do ${x} ${it} cost?`, { unit:'¢', hint:`${x} ${it} at ${y}¢ each is ${x} × ${y}.` }); }),
    T(ALL, (R, l) => { const [p, d, q] = dpair(R, l); return dFact(p, d, q, `What is ${p} ÷ ${d}?`); }),
    T(ALL, (R, l) => { const [p, d, q] = dpair(R, l); return dFact(p, d, q, `Solve: ${p} ÷ ${d} = ☐`); }),
    T(ALL, (R, l) => { const [p, d, q] = dpair(R, l, 1); return dFact(p, d, q, `How many ${d}s are in ${p}?`, { hint:`Count by ${d}s until you reach ${p}. How many counts?`, steps:[`Count by ${d}s: ${skip(d, q)}.`, `That is ${q} counts.`, `So ${p} ÷ ${d} = ${q}.`] }); }),
    T(ALL, (R, l) => { const [p, d, q] = dpair(R, l); return dFact(p, d, q, `${d} × ☐ = ${p}. What number goes in the box?`, { hint:`What number times ${d} makes ${p}?` }); }),
    T(ALL, (R, l) => { const [p, d, q] = dpair(R, l); return dFact(p, d, q, `☐ × ${d} = ${p}. What number goes in the box?`, { hint:`Think: ${p} ÷ ${d}.` }); }),
    T(ALL, (R, l) => { const [p, d, q] = dpair(R, l, 1); const D = Math.max(2, d), P = D * q, it = R.pick(SHARE_CTX);
      return dFact(P, D, q, `${P} ${it} are shared equally by ${D} friends. How many ${it} does each friend get?`, { hint:`Sharing equally means divide: ${P} ÷ ${D}.`, steps:[`Share ${P} into ${D} equal groups: ${P} ÷ ${D}.`, `Think: ${D} × ? = ${P}.`, `${D} × ${q} = ${P}, so each friend gets ${q}.`] }); }),
    T(ALL, (R, l) => { const [p, d, q] = dpair(R, l, 1); const D = Math.max(2, d), P = D * q, c = R.pick(TEAM_CTX);
      return dFact(P, D, q, `${P} ${c[0]} get into ${c[1]} of ${D}. How many ${c[1]} are there?`, { hint:`How many groups of ${D} fit in ${P}?`, steps:[`Groups of ${D}: ${P} ÷ ${D}.`, `Count by ${D}s to ${P}: ${skip(D, q)}.`, `That is ${q} ${c[1]}.`] }); }),
    T(ALL, (R, l) => { const [p, d, q] = dpair(R, l, 1);
      return { q:`☐ ÷ ${d} = ${q}. What number goes in the box?`, kind:'num', a:p, fact:`${p}/${d}`, hint:`Undo the division: multiply ${q} × ${d}.`,
        steps:[`If ☐ ÷ ${d} = ${q}, then ☐ = ${q} × ${d}.`, `${q} × ${d} = ${p}.`, `So the box is ${p}.`] }; }),
    T(ALL, (R, l) => { let [p, d, q] = dpair(R, l, 1); if (d === q) { q = q === 10 ? 9 : q + 1; p = d * q; } const ans = `${p} ÷ ${d} = ${q}`;
      return { q:`Which fact is in the same fact family as ${d} × ${q} = ${p}?`, kind:'choice', a:ans, fact:`${p}/${d}`,
        choices: choices(ans, [`${p} ÷ ${q} = ${d + 1}`, `${d} + ${q} = ${d + q}`, `${p} − ${d} = ${p - d}`, `${p} ÷ ${d} = ${q + 1}`]),
        hint:'A fact family uses the same three numbers. Two multiply, two divide.',
        steps:[`The three numbers are ${d}, ${q} and ${p}.`, `${d} × ${q} = ${p}, so ${p} ÷ ${d} = ${q}.`, `The match is ${ans}.`] }; }),
    T(ALL, (R, l) => { const [p, d, q] = dpair(R, l); return dFact(p, d, q, `What number times ${d} equals ${p}?`); }),
    T(ALL, (R, l) => { const [p, d, q] = dpair(R, l); return dFact(p, d, q, `If ${d} × ${q} = ${p}, then ${p} ÷ ${d} = ?`, { hint:'Use the multiplication fact you were given!' }); })
  ];
  M['g3.facts'] = { name:'Multiplication & division facts', unit:'g3u3', warm:true, gen(R, lvl){ return run(FACTS, R, lvl); } };

  // ======================= g3.arrays =======================
  function adims(R, l){ return l === 1 ? [R.int(2, 5), R.int(2, 6)] : l === 2 ? [R.int(2, 6), R.int(3, 9)] : [R.int(3, 10), R.int(3, 10)]; }
  function gdims(R, l){ return l === 1 ? [R.int(2, 5), R.int(2, 5)] : l === 2 ? [R.int(2, 6), R.int(2, 8)] : [R.int(3, 6), R.int(3, 9)]; }
  const ARR_CTX = [['garden','rows','tomato plants'], ['wall','rows','tiles'], ['sheet of stamps','rows','stamps'], ['box of chocolates','rows','chocolates'],
    ['muffin pan','rows','cups'], ['parking lot','rows','cars'], ['classroom','rows','desks'], ['orchard','rows','apple trees'], ['egg carton','rows','eggs'], ['quilt','rows','squares']];
  const GRP_CTX = [['plates','cookies'], ['bags','oranges'], ['boxes','pencils'], ['vases','roses'], ['packs','juice boxes'], ['bowls','strawberries'], ['nests','eggs'], ['cars','kids']];
  const ARRAYS = [
    T(ALL, (R, l) => { const [r, c] = adims(R, l), p = r * c;
      return { q:'How many dots are in this array?', kind:'num', a:p, model:{ type:'array', rows:r, cols:c }, hint:'Count the dots in one row. Then count how many rows.',
        steps:[`There are ${r} rows.`, `Each row has ${c} dots.`, `${r} rows of ${c}: ${r} × ${c} = ${p} dots.`] }; }),
    T(ALL, (R, l) => { const [g, e] = gdims(R, l), p = g * e;
      return { q:'How many dots are in all the groups?', kind:'num', a:p, model:{ type:'groups', groups:g, each:e }, hint:'Count the dots in one group. Then skip count once for each group.',
        steps:[`${g} groups of ${e} means ${g} × ${e}.`, `Skip count by ${e}: ${skip(e, g)}.`, `${g} × ${e} = ${p} dots.`] }; }),
    T(ALL, (R, l) => { let [r, c] = adims(R, l); if (r === c) c++; const p = r * c, ans = `${r} × ${c} = ${p}`;
      return { q:'Which multiplication sentence matches this array?', kind:'choice', a:ans, model:{ type:'array', rows:r, cols:c },
        choices: choices(ans, R.shuffle([`${r} + ${c} = ${r + c}`, `${r} × ${c + 1} = ${r * (c + 1)}`, `${r + 1} × ${c} = ${(r + 1) * c}`, `${r} × ${c - 1} = ${r * (c - 1)}`])),
        hint:'Rows × dots in each row = total. Count carefully!', steps:[`Count the rows: ${r}.`, `Count the dots in one row: ${c}.`, `Rows × dots in a row: ${ans}.`] }; }),
    T(ALL, (R, l) => { let [g, e] = gdims(R, l); if (g === e) e++; const p = g * e, ans = `${g} × ${e} = ${p}`;
      return { q:'Which multiplication sentence matches the equal groups?', kind:'choice', a:ans, model:{ type:'groups', groups:g, each:e },
        choices: choices(ans, R.shuffle([`${g} + ${e} = ${g + e}`, `${g} × ${e + 1} = ${g * (e + 1)}`, `${e} × ${e} = ${e * e}`, `${g + 1} × ${e} = ${(g + 1) * e}`])),
        hint:'Number of groups × number in each group = total.', steps:[`There are ${g} groups.`, `Each group has ${e} dots.`, `So the sentence is ${ans}.`] }; }),
    T(ALL, (R, l) => { const [r, c] = adims(R, l), p = r * c;
      return { q:`This array has ${p} dots in ${r} equal rows. How many dots are in each row?`, kind:'num', a:c, model:{ type:'array', rows:r, cols:c }, hint:`Think: ${r} × what = ${p}?`,
        steps:[`Equal rows means divide: ${p} ÷ ${r}.`, `Think multiplication: ${r} × ? = ${p}.`, `${r} × ${c} = ${p}, so there are ${c} in each row.`] }; }),
    T(ALL, (R, l) => { const [r, c] = adims(R, l), p = r * c, x = R.pick(ARR_CTX);
      return { q:`A ${x[0]} has ${r} rows of ${x[2]}. There are ${c} ${x[2]} in each row. How many ${x[2]} are there?`, kind:'num', a:p,
        model: R.chance(0.5) ? { type:'array', rows:r, cols:c } : undefined, hint:'Rows times how many in each row.',
        steps:[`${r} rows of ${c} means ${r} × ${c}.`, ...mSteps(r, c)] }; }),
    T(ALL, (R, l) => { const [g, e] = gdims(R, l), p = g * e, x = R.pick(GRP_CTX);
      return { q:`There are ${g} ${x[0]} with ${e} ${x[1]} in each. How many ${x[1]} in all?`, kind:'num', a:p, hint:'Equal groups! Multiply the number of groups by the number in each group.',
        steps:[`${g} groups of ${e}: ${g} × ${e}.`, ...mSteps(g, e)] }; }),
    T(ALL, (R, l) => { let [r, c] = adims(R, l); r = Math.min(r, 5); if (r < 2) r = 2; const p = r * c, ans = Array(r).fill(c).join(' + ');
      const ds = [`${c} + ${r}`, Array(r).fill(c + 1).join(' + '), r > 2 ? Array(r - 1).fill(c).join(' + ') : Array(r + 1).fill(c).join(' + '), Array(r).fill(c - 1).join(' + ')];
      return { q:'Which addition sentence adds the dots in each row of this array?', kind:'choice', a:ans, model:{ type:'array', rows:r, cols:c }, choices: choices(ans, R.shuffle(ds)),
        hint:'Each row has the same number of dots. Add that number once for every row.', steps:[`Each row has ${c} dots.`, `There are ${r} rows, so add ${c} a total of ${r} times.`, `${ans} = ${p}.`] }; }),
    T(ALL, (R, l) => { let [r, c] = adims(R, l); if (r === c) c++;
      return { q:`An array has ${r} rows of ${c}. If you turn it on its side, it has ${c} rows. How many are in each row now?`, kind:'num', a:r,
        hint:'Turning an array swaps the rows and the columns. The total stays the same.', steps:[`Before: ${r} rows of ${c}, so ${r} × ${c} = ${r * c}.`, `After turning: ${c} rows of ${r}.`, `${c} × ${r} = ${r * c} still, so each row has ${r}.`] }; }),
    T(ALL, (R, l) => { const [r, c] = adims(R, l), p = r * c, it = R.pick(['stickers','stamps','photos','tiles']);
      return { q:`An array of ${p} ${it} has ${r} rows. How many columns does it have?`, kind:'num', a:c, hint:`Columns go up and down. Think: ${r} × ? = ${p}.`,
        steps:[`Each column has one ${pl(1, it)} from every row, so each row has as many ${it} as there are columns.`, `${p} ÷ ${r} = ?`, `${r} × ${c} = ${p}, so there are ${c} columns.`] }; }),
    T(ALL, (R, l) => { const [r, c] = adims(R, l), p = r * c, a = (r + 1) * c;
      return { q:`This array has ${r} rows of ${c} dots. You add one more row. How many dots are there now?`, kind:'num', a, model:{ type:'array', rows:r, cols:c },
        hint:'Find how many dots there are now, then add one more row.', steps:[`Now: ${r} × ${c} = ${p}.`, `One more row adds ${c} dots.`, `${p} + ${c} = ${a}. (That is ${r + 1} × ${c}.)`] }; }),
    T(ALL, (R, l) => { let [r, c] = adims(R, l); if (c < 3) c = 3; const p = r * c, a = r * (c - 1);
      return { q:`This array has ${r} rows of ${c} dots. You take away one column. How many dots are left?`, kind:'num', a, model:{ type:'array', rows:r, cols:c },
        hint:'One column has one dot in every row.', steps:[`Now: ${r} × ${c} = ${p}.`, `One column has ${r} dots.`, `${p} − ${r} = ${a}. (That is ${r} × ${c - 1}.)`] }; }),
    T(ALL, (R, l) => { let r1, c1, r2, c2; do { [r1, c1] = adims(R, l); [r2, c2] = adims(R, l); } while (r1 * c1 === r2 * c2);
      const a1 = r1 * c1, a2 = r2 * c2, big = Math.max(a1, a2), sm = Math.min(a1, a2), d = big - sm;
      return { q:`Array A has ${r1} rows of ${c1}. Array B has ${r2} rows of ${c2}. How many more dots does the bigger array have?`, kind:'num', a:d,
        hint:'Find the total in each array first. Then subtract.', steps:[`A: ${r1} × ${c1} = ${a1}.`, `B: ${r2} × ${c2} = ${a2}.`, `${big} − ${sm} = ${d} more dots.`] }; }),
    T(ALL, (R, l) => { let [r, c] = adims(R, l); if (r === c) c++; const p = r * c, ans = `${r} rows of ${c}`;
      return { q:`Which array has ${p} dots?`, kind:'choice', a:ans,
        choices: choices(ans, R.shuffle(notVal(p, [[`${r} rows of ${c + 1}`, r * (c + 1)], [`${r + 1} rows of ${c}`, (r + 1) * c], [`${r - 1} rows of ${c}`, (r - 1) * c], [`${r} rows of ${c - 1}`, r * (c - 1)], [`${r} rows of ${r + c}`, r * (r + c)]]))),
        hint:'Multiply rows × number in each row for each choice.', steps:[`${r} rows of ${c} is ${r} × ${c}.`, `${r} × ${c} = ${p}.`, `So the answer is ${ans}.`] }; }),
    T(ALL, (R, l) => { const [g, e] = gdims(R, l), p = g * e, it = R.pick(['marbles','beads','shells','buttons']);
      return { q:`${p} ${it} are put into ${g} equal groups. How many ${it} are in each group?`, kind:'num', a:e, hint:`Think: ${g} × what = ${p}?`,
        steps:[`Equal groups means divide: ${p} ÷ ${g}.`, `${g} × ${e} = ${p}.`, `So there are ${e} in each group.`] }; }),
    T(ALL, (R, l) => { const [g, e] = gdims(R, l), p = g * e, it = R.pick(['pencils','crayons','cards','blocks']);
      return { q:`${p} ${it} are put into groups of ${e}. How many groups are there?`, kind:'num', a:g, hint:`How many ${e}s make ${p}?`,
        steps:[`Count by ${e}s to ${p}: ${skip(e, g)}.`, `That is ${g} counts.`, `So there are ${g} groups.`] }; }),
    T(L23, (R, l) => { let [r, c] = adims(R, l); if (r < 3) r = 3; const a = R.int(1, r - 1), b = r - a, p = r * c;
      return { q:`An array has ${r} rows of ${c}. Split it into ${a} ${pl(a, 'rows')} and ${b} ${pl(b, 'rows')}: ${a} × ${c} = ${a * c} and ${b} × ${c} = ${b * c}. How many dots in all?`, kind:'num', a:p,
        model:{ type:'array', rows:r, cols:c }, hint:'Add the two smaller parts together.', steps:[`Top part: ${a} × ${c} = ${a * c}.`, `Bottom part: ${b} × ${c} = ${b * c}.`, `${a * c} + ${b * c} = ${p}. So ${r} × ${c} = ${p}.`] }; }),
    T(ALL, (R, l) => { const s = l === 1 ? R.int(2, 5) : l === 2 ? R.int(3, 7) : R.int(4, 10), p = s * s;
      return { q:`A square array has ${s} rows and the same number of dots in each row. How many dots are in the array?`, kind:'num', a:p,
        hint:`A square array has as many dots in each row as it has rows.`, steps:[`${s} rows with ${s} in each row.`, `${s} × ${s} = ${p}.`] }; }),
    T(ALL, (R, l) => { const [r, c] = adims(R, l), p = r * c;
      return { q:`Two arrays each have ${r} rows of ${c}. How many dots are in both arrays together?`, kind:'num', a:2 * p,
        hint:'Find one array, then double it.', steps:[`One array: ${r} × ${c} = ${p}.`, `Two arrays: ${p} + ${p} = ${2 * p}.`] }; }),
    T(ALL, (R, l) => { const [r, c] = adims(R, l), p = r * c;
      return { q:`Skip count by ${c}s, once for each row of this array. What number do you end on?`, kind:'num', a:p, model:{ type:'array', rows:r, cols:c },
        hint:`Each row is one count of ${c}.`, steps:[`There are ${r} rows.`, `Count by ${c}s: ${skip(c, r)}.`, `You end on ${p}.`] }; }),
    T(ALL, (R, l) => { let [g, e] = gdims(R, l); g = Math.min(g, 5); const a = (g + 1) * e;
      return { q:'How many dots would there be with one more group just like these?', kind:'num', a, model:{ type:'groups', groups:g, each:e },
        hint:'Find the total now, then add one more group.', steps:[`Now: ${g} × ${e} = ${g * e}.`, `One more group adds ${e}.`, `${g * e} + ${e} = ${a}.`] }; }),
    T(ALL, (R, l) => { let [r, c] = adims(R, l); if (r === c) c++; const ans = `${r} rows of ${c} dots`;
      return { q:'Which words describe this array?', kind:'choice', a:ans, model:{ type:'array', rows:r, cols:c },
        choices: choices(ans, R.shuffle([`${c} rows of ${r} dots`, `${r} rows of ${c + 1} dots`, `${r + c} dots in one row`])),
        hint:'Rows go across, from left to right. Count the rows, then the dots in one row.', steps:[`Rows go across. There are ${r} rows.`, `Each row has ${c} dots.`, `So it is ${ans}.`] }; })
  ];
  M['g3.arrays'] = { name:'Arrays & equal groups', unit:'g3u3', gen(R, lvl){ return run(ARRAYS, R, lvl); } };

  // ======================= g3.inverse =======================
  const INV_SET = { 1:[2,5,10], 2:[2,3,4,5,6,10], 3:[2,3,4,5,6,7,8,9,10] };
  function ifn(R, l){ const f = R.pick(INV_SET[l]), n = R.int(1, 10); return [f, n, f * n]; }
  // products with two different factor pairs (for balance equations)
  const PAIRS = {}; for (let a = 1; a <= 10; a++) for (let b = a; b <= 10; b++) (PAIRS[a * b] = PAIRS[a * b] || []).push([a, b]);
  const MULTI = Object.keys(PAIRS).map(Number).filter(p => PAIRS[p].length >= 2 && p > 4);
  const INVERSE = [
    T(ALL, (R, l) => { const [f, n, p] = ifn(R, l);
      return { q:`${f} × ? = ${p}. What is the missing number?`, kind:'num', a:n, hint:`Count by ${f}s until you reach ${p}. How many jumps?`,
        steps:[`Count by ${f}s: ${skip(f, n)}.`, `That took ${n} jumps.`, `${f} × ${n} = ${p}, so ? = ${n}.`] }; }),
    T(ALL, (R, l) => { const [f, n, p] = ifn(R, l);
      return { q:`? × ${f} = ${p}. What is the missing number?`, kind:'num', a:n, hint:`Think: ${p} ÷ ${f}.`,
        steps:[`The missing number is a factor. Divide: ${p} ÷ ${f}.`, `${n} × ${f} = ${p}.`, `So ? = ${n}.`] }; }),
    T(ALL, (R, l) => { const [f, n, p] = ifn(R, l);
      return { q:`${f} × ${n} = ${p}. So ${p} ÷ ${f} = ?`, kind:'num', a:n, hint:'Multiplication and division are in the same fact family. Use the fact you were given!',
        steps:[`${p} ÷ ${f} asks: ${f} times what is ${p}?`, `We know ${f} × ${n} = ${p}.`, `So ${p} ÷ ${f} = ${n}.`] }; }),
    T(ALL, (R, l) => { const [f, n, p] = ifn(R, l);
      return { q:`? ÷ ${f} = ${n}. What is the missing number?`, kind:'num', a:p, hint:`Undo the division: multiply ${n} × ${f}.`,
        steps:[`If ? ÷ ${f} = ${n}, then ${n} × ${f} = ?`, `${n} × ${f} = ${p}.`, `So ? = ${p}.`] }; }),
    T(ALL, (R, l) => { const [f, n, p] = ifn(R, l);
      return { q:`${p} ÷ ? = ${n}. What is the missing number?`, kind:'num', a:f, hint:`Think: ${n} × what = ${p}?`,
        steps:[`If ${p} ÷ ? = ${n}, then ${n} × ? = ${p}.`, `${n} × ${f} = ${p}.`, `So ? = ${f}.`] }; }),
    T(ALL, (R, l) => { let [a, b] = ifn(R, l); if (a === b) b = b === 10 ? 9 : b + 1; const pp = a * b, ans = `${pp} ÷ ${b} = ${a}`;
      return { q:`Which fact is in the same family as ${a} × ${b} = ${pp}?`, kind:'choice', a:ans,
        choices: choices(ans, [`${pp} ÷ ${a} = ${b + 1}`, `${a} + ${b} = ${a + b}`, `${pp} − ${b} = ${pp - b}`, `${pp} ÷ ${b + 1} = ${a}`]),
        hint:'A fact family uses the same three numbers. Two multiply, two divide.',
        steps:[`The three numbers are ${a}, ${b} and ${pp}.`, `Family: ${a} × ${b} = ${pp}, ${b} × ${a} = ${pp}, ${pp} ÷ ${a} = ${b}, ${pp} ÷ ${b} = ${a}.`, `The match is ${ans}.`] }; }),
    T(ALL, (R, l) => { let [a, b] = ifn(R, l); if (b < 2) b = 2; if (a === b) b = b === 10 ? 9 : b + 1; const p = a * b;
      const odd = R.pick([`${a} + ${b} = ${a + b}`, `${p} − ${a} = ${p - a}`, `${p} ÷ ${a} = ${a}`.replace(`= ${a}`, `= ${b + 1}`)]);
      const good = R.shuffle([`${a} × ${b} = ${p}`, `${b} × ${a} = ${p}`, `${p} ÷ ${a} = ${b}`, `${p} ÷ ${b} = ${a}`]).slice(0, 3);
      return { q:`Which fact is NOT in the fact family for ${a}, ${b} and ${p}?`, kind:'choice', a:odd, choices: choices(odd, good),
        hint:'Fact family facts only multiply or divide, and they use only the three numbers.', steps:[`The family: ${a} × ${b} = ${p}, ${b} × ${a} = ${p}, ${p} ÷ ${a} = ${b}, ${p} ÷ ${b} = ${a}.`, `${odd} is not one of them.`] }; }),
    T(ALL, (R, l) => { const [d, q, p] = ifn(R, l), ans = `${d} × ${q} = ${p}`;
      return { q:`Which multiplication fact helps you solve ${p} ÷ ${d}?`, kind:'choice', a:ans,
        choices: choices(ans, R.shuffle([`${d} × ${q + 1} = ${d * (q + 1)}`, `${d} + ${q} = ${d + q}`, `${d} × ${q - 1} = ${d * (q - 1)}`, `${p} × ${d} = ${p * d}`])),
        hint:`Division asks: ${d} times what makes ${p}?`, steps:[`Look for a fact with ${d} and ${p} in it.`, `${ans}.`, `So ${p} ÷ ${d} = ${q}.`] }; }),
    T(ALL, (R, l) => { let [a, b] = ifn(R, l); if (a === b) b = b === 10 ? 9 : b + 1;
      return { q:`${a} × ${b} = ${b} × ?`, kind:'num', a:a, hint:'You can multiply in any order (commutative property).',
        steps:[`Both sides must make ${a * b}.`, `Switching the order: ${a} × ${b} = ${b} × ${a}.`, `So ? = ${a}.`] }; }),
    T(ALL, (R, l) => { const n = R.int(2, l === 1 ? 10 : 99);
      return { q:`What is ${n} × 1? (Think: one group of ${n}.)`, kind:'num', a:n, hint:'Any number times 1 stays the same (identity property).',
        steps:[`One group of ${n} is just ${n}.`, `So ${n} × 1 = ${n}.`] }; }),
    T(ALL, (R, l) => { const n = R.int(2, l === 1 ? 10 : 99);
      return { q:`What is ${n} × 0? (Think: ${n} groups with nothing in them.)`, kind:'num', a:0, hint:'Any number times 0 is 0 (zero property).',
        steps:[`${n} groups of 0 is still nothing.`, `So ${n} × 0 = 0.`] }; }),
    T(ALL, (R, l) => { const n = R.int(2, 10), m = R.int(2, 10), k = R.int(0, 2);
      const ex = k === 0 ? `${n} × ${m === n ? m + 1 : m} = ${m === n ? m + 1 : m} × ${n}` : k === 1 ? `${n} × 1 = ${n}` : `${n} × 0 = 0`;
      const ans = ['Commutative property','Identity property','Zero property'][k];
      return { q:`Which property does ${ex} show?`, kind:'choice', a:ans, choices:['Commutative property','Identity property','Zero property'],
        hint:'Commutative: switch the order. Identity: times 1 stays the same. Zero: times 0 is 0.',
        steps:[k === 0 ? 'The same two factors are just in a different order.' : k === 1 ? 'Multiplying by 1 left the number the same.' : 'Multiplying by 0 made 0.', `That is the ${ans.toLowerCase()}.`] }; }),
    T(ALL, (R, l) => { const n = R.int(2, 10), k = R.int(0, 2), it = R.pick(['cookies','apples','stickers']);
      if (k === 0) return { q:`${n} ${it} are shared by ${n} friends. How many ${it} does each friend get?`, kind:'num', a:1, hint:'A number divided by itself is 1.', steps:[`${n} ÷ ${n} = 1.`, `Each friend gets 1.`] };
      if (k === 1) return { q:`There are 0 ${it} to share with ${n} friends. How many ${it} does each friend get?`, kind:'num', a:0, hint:'0 divided by any number is 0.', steps:[`0 ÷ ${n} = 0.`, `Nobody gets any.`] };
      return { q:`${n} ${it} are all put into 1 basket. How many ${it} are in the basket?`, kind:'num', a:n, hint:'A number divided by 1 stays the same.', steps:[`${n} ÷ 1 = ${n}.`, `All ${n} are in the basket.`] }; }),
    T(ALL, (R, l) => { const [d, q, p] = ifn(R, l), right = R.chance(0.5), w = right ? q : (q === 10 || R.chance(0.5)) && q > 1 ? q - 1 : q + 1, ans = right ? 'Yes' : 'No';
      return { q:`Is ${p} ÷ ${d} = ${w} true? Check with multiplication.`, kind:'choice', a:ans, choices:['Yes','No'],
        hint:`Multiply ${d} × ${w}. Do you get ${p}?`, steps:[`${d} × ${w} = ${d * w}.`, d * w === p ? `That is ${p}, so it is true.` : `That is not ${p}, so it is not true. (${p} ÷ ${d} = ${q}.)`] }; }),
    T(ALL, (R, l) => { const [d, q, p] = ifn(R, l), A = name(R), ans = `${d} × ${q} = ${p}`;
      return { q:`${A} puts ${p} beads into bags of ${d}. Which multiplication fact helps find how many bags?`, kind:'choice', a:ans,
        choices: choices(ans, R.shuffle([`${d} × ${p} = ${d * p}`, `${d} + ${q} = ${d + q}`, `${d} × ${q + 1} = ${d * (q + 1)}`])),
        hint:`Bags of ${d}: ${d} times how many bags makes ${p}?`, steps:[`Bags × ${d} = ${p}.`, `${ans}.`, `So there are ${q} bags.`] }; }),
    T(L23, (R, l) => { let p, a, b, c, x, g = 0;
      do { p = R.pick(MULTI); const ps = R.shuffle(PAIRS[p].slice()); [a, b] = R.shuffle(ps[0].slice()); [c, x] = R.shuffle(ps[1].slice()); } while ((c === a || c === b) && g++ < 30);
      if (c === a || c === b) [c, x] = [x, c];
      return { q:`${a} × ${b} = ${c} × ?`, kind:'num', a:x, hint:`Both sides must be the same number. Find ${a} × ${b} first.`,
        steps:[`${a} × ${b} = ${p}.`, `${c} × ? = ${p}.`, `${c} × ${x} = ${p}, so ? = ${x}.`] }; }),
    T(ALL, (R, l) => { const s = l === 1 ? R.int(1, 5) : R.int(2, 10);
      return { q:`The same number goes in both boxes: ☐ × ☐ = ${s * s}. What is the number?`, kind:'num', a:s, hint:'Try numbers times themselves: 2 × 2, 3 × 3, 4 × 4...',
        steps:[`Try ${s} × ${s}.`, `${s} × ${s} = ${s * s}. So the number is ${s}.`] }; }),
    T(ALL, (R, l) => { const [d, q, p] = ifn(R, l);
      if (R.chance(0.5) && p * d !== q && p + d !== q && p - d !== q)
        return { q:`Which sign goes in the box? ${p} ☐ ${d} = ${q}`, kind:'choice', a:'÷', choices:['×','÷','+','−'],
          hint:'The answer is smaller than the first number. Try each sign.', steps:[`Try ÷: ${p} ÷ ${d} = ${q}. ✓`, `So the sign is ÷.`] };
      let a = d, b = q; if (b < 2) b = 2; const pp = a * b;
      if (a + b === pp) b = 3;
      return { q:`Which sign goes in the box? ${a} ☐ ${a === d ? b : b} = ${a * b}`, kind:'choice', a:'×', choices:['×','÷','+','−'],
        hint:'The answer is bigger than both numbers. Try each sign.', steps:[`Try +: ${a} + ${b} = ${a + b}. Not it.`, `Try ×: ${a} × ${b} = ${a * b}. ✓`, `So the sign is ×.`] }; }),
    T(ALL, (R, l) => { let [r, c] = adims(R, l); if (r === c) c++; const p = r * c, ans = `${p} ÷ ${r} = ${c}`;
      return { q:`This array shows ${r} × ${c} = ${p}. Which division fact does it also show?`, kind:'choice', a:ans, model:{ type:'array', rows:r, cols:c },
        choices: choices(ans, R.shuffle([`${p} ÷ ${r} = ${c + 1}`, `${p} − ${r} = ${p - r}`, `${c} ÷ ${r} = ${p}`])),
        hint:`Share the ${p} dots into ${r} rows. How many in each row?`, steps:[`${p} dots in ${r} equal rows.`, `Each row has ${c}.`, `So ${ans}.`] }; }),
    T(ALL, (R, l) => { let [a, b] = ifn(R, l); if (a === b) b = b === 10 ? 9 : b + 1; const p = a * b;
      return { q:`In the fact family for ${a}, ${b} and ${p}, what is ${p} ÷ ${b}?`, kind:'num', a:a, hint:`Use ${a} × ${b} = ${p}.`,
        steps:[`${a} × ${b} = ${p}.`, `So ${p} ÷ ${b} = ${a}.`] }; }),
    T(ALL, (R, l) => { const [a, b, p] = ifn(R, l);
      return { q:`A multiplication fact family has the factors ${a} and ${b}. What is the product?`, kind:'num', a:p, hint:'The product is what you get when you multiply the factors.',
        steps:[`Multiply the factors: ${a} × ${b}.`, `${a} × ${b} = ${p}.`] }; }),
    T(ALL, (R, l) => { const n = R.int(2, 10), k = R.int(0, 2);
      const ans = k === 0 ? `${n} × 0 = 0` : k === 1 ? `${n} × 1 = ${n}` : `${n} ÷ 1 = ${n}`;
      const ds = [`${n} × 0 = ${n}`, `${n} × 1 = 1`, `${n} ÷ 1 = 1`, `${n} × 1 = ${n + 1}`];
      return { q:'Which number sentence is true?', kind:'choice', a:ans, choices: choices(ans, R.shuffle(ds)),
        hint:'Times 0 is 0. Times 1 or divided by 1 stays the same.', steps:[`Check each one with the rules for 0 and 1.`, `${ans} is true.`] }; }),
    T(ALL, (R, l) => { const [d, q, p] = ifn(R, l), A = name(R);
      return { q:`${A} gave all of a pile of stickers to ${d} friends. Each friend got ${q}. How many stickers were in the pile?`, kind:'num', a:p,
        hint:`Each of ${d} friends got ${q}. Multiply to find the total.`, steps:[`${d} friends × ${q} each.`, `${d} × ${q} = ${p}.`, `There were ${p} stickers in the pile.`] }; })
  ];
  M['g3.inverse'] = { name:'Missing factors & fact families', unit:'g3u3', gen(R, lvl){ return run(INVERSE, R, lvl); } };

  // ======================= g3.wordmd =======================
  const WSET = { 1:[2,3,4,5,10], 2:[2,3,4,5,6,7,8,9,10], 3:[3,4,5,6,7,8,9,10] };
  function wfn(R, l){ const f = R.pick(WSET[l]), n = l === 1 ? R.int(2, 5) : R.int(2, 10); return [f, n, f * n]; }
  const one = (q, a, hint, steps, x) => Object.assign({ q, kind:'num', a, hint, steps }, x || {});
  const LEGS = [['birds',2],['cats',4],['dogs',4],['ants',6],['beetles',6],['spiders',8],['octopuses',8],['horses',4]];
  const WHEELS = [['bikes',2],['tricycles',3],['cars',4],['wagons',4],['scooters',2]];
  const WORDMD = [
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l), A = name(R);
      return one(`${A} has ${n} bags. Each bag has ${f} marbles. How many marbles in all?`, p, 'Equal groups! How many groups, and how many in each?',
        [`${n} groups of ${f} means ${n} × ${f}.`, `${n} × ${f} = ${p}.`, `There are ${p} marbles.`], (n <= 6 && f <= 6) ? { model:{ type:'groups', groups:n, each:f } } : {}); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l);
      return one(`There are ${n} rows of chairs with ${f} chairs in each row. How many chairs are there?`, p, 'Rows times chairs in each row.',
        [`${n} rows of ${f}: ${n} × ${f}.`, `${n} × ${f} = ${p}.`, `There are ${p} chairs.`], { model:{ type:'array', rows:n, cols:f } }); }),
    T(ALL, (R, l) => { const ok = LEGS.filter(x => l > 1 || WSET[1].includes(x[1])), a = R.pick(ok), n = l === 1 ? R.int(2, 5) : R.int(2, 10), t = n * a[1];
      return one(`Each of the ${a[0]} has ${a[1]} legs. How many legs do ${n} ${a[0]} have?`, t, `Each one has ${a[1]} legs. Add ${a[1]} for each one, or multiply.`,
        [`${n} groups of ${a[1]} legs: ${n} × ${a[1]}.`, `${n} × ${a[1]} = ${t}.`, `${n} ${a[0]} have ${t} legs.`]); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l), A = name(R);
      return one(`${A} shares ${p} cookies equally among ${f} friends. How many cookies does each friend get?`, n, `Share equally means divide. Think: ${f} × what = ${p}?`,
        [`Share equally: ${p} ÷ ${f}.`, `Think: ${f} × ? = ${p}. ${f} × ${n} = ${p}.`, `Each friend gets ${n} cookies.`]); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l);
      return one(`${p} students make teams of ${f}. How many teams are there?`, n, `How many groups of ${f} fit in ${p}?`,
        [`Teams of ${f}: ${p} ÷ ${f}.`, `Count by ${f}s to ${p}: that is ${n} jumps.`, `There are ${n} teams.`]); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l), A = name(R);
      return one(`${A} puts ${p} crayons into boxes with ${f} in each box. How many boxes does ${A} fill?`, n, `Divide: how many ${f}s make ${p}?`,
        [`${p} ÷ ${f} = ?`, `${f} × ${n} = ${p}.`, `${A} fills ${n} boxes.`]); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l), it = R.pick([['notebook','notebooks'],['toy','toys'],['ticket','tickets'],['book','books'],['ball','balls']]);
      return one(`Each ${it[0]} costs $${f}. How much do ${n} ${it[1]} cost?`, p, `${n} ${it[1]} at $${f} each: multiply.`,
        [`${n} × $${f}.`, `${n} × ${f} = ${p}.`, `They cost $${p}.`], { unit:'dollars' }); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l), it = R.pick([['kite','kites'],['puzzle','puzzles'],['hat','hats'],['plant','plants']]);
      return one(`${n} ${it[1]} cost $${p} in all. Each one costs the same. How much does one ${it[0]} cost?`, f, `Split $${p} into ${n} equal parts.`,
        [`$${p} ÷ ${n} = ?`, `${n} × ${f} = ${p}.`, `One ${it[0]} costs $${f}.`], { unit:'dollars' }); }),
    T(ALL, (R, l) => { const ok = WHEELS.filter(x => l > 1 || WSET[1].includes(x[1])), v = R.pick(ok), n = l === 1 ? R.int(2, 5) : R.int(2, 10), t = n * v[1];
      return one(`How many wheels are on ${n} ${v[0]}? (Each one has ${v[1]} wheels.)`, t, `Count by ${v[1]}s, once for each.`,
        [`${n} × ${v[1]}.`, `${n} × ${v[1]} = ${t}.`, `There are ${t} wheels.`]); }),
    T(ALL, (R, l) => { const ok = WHEELS.filter(x => l > 1 || WSET[1].includes(x[1])), v = R.pick(ok), n = l === 1 ? R.int(2, 5) : R.int(2, 10), t = n * v[1];
      return one(`A store has some ${v[0]}. Each one has ${v[1]} wheels. There are ${t} wheels in all. How many ${v[0]} are there?`, n, `How many groups of ${v[1]} make ${t}?`,
        [`${t} ÷ ${v[1]} = ?`, `${v[1]} × ${n} = ${t}.`, `There are ${n} ${v[0]}.`]); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l);
      return one(`Each page of a photo album holds ${f} photos. How many photos fit on ${n} pages?`, p, `${n} pages with ${f} on each: multiply.`,
        [`${n} × ${f}.`, `${n} × ${f} = ${p}.`, `${p} photos fit.`]); }),
    T(L23, (R, l) => { const n = R.int(2, 10), t = n * 7;
      return one(`How many days are in ${n} weeks?`, t, 'Every week has 7 days.', [`${n} weeks × 7 days.`, `${n} × 7 = ${t}.`, `There are ${t} days.`]); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l), A = name(R);
      return one(`${A} reads ${f} pages every day. How many pages does ${A} read in ${n} days?`, p, `${f} pages each day for ${n} days.`,
        [`${n} × ${f}.`, `${n} × ${f} = ${p}.`, `${A} reads ${p} pages.`]); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l);
      return one(`Each car can take ${f} kids on a field trip. How many cars are needed for ${p} kids?`, n, `How many groups of ${f} make ${p}?`,
        [`${p} ÷ ${f} = ?`, `${f} × ${n} = ${p}.`, `${n} cars are needed.`]); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l), A = name(R);
      return one(`${A} cuts a ribbon that is ${p} inches long into pieces that are each ${f} inches long. How many pieces does ${A} get?`, n, `How many ${f}s fit in ${p}?`,
        [`${p} ÷ ${f} = ?`, `${f} × ${n} = ${p}.`, `${A} gets ${n} pieces.`]); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l);
      return one(`${p} trees are planted in ${f} equal rows. How many trees are in each row?`, n, `Share ${p} into ${f} equal rows.`,
        [`${p} ÷ ${f} = ?`, `${f} × ${n} = ${p}.`, `There are ${n} trees in each row.`]); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l);
      return one(`${n} friends each have ${f} stickers. How many stickers do they have in all?`, p, `${n} friends with ${f} each: multiply.`,
        [`${n} × ${f}.`, `${n} × ${f} = ${p}.`, `They have ${p} stickers.`]); }),
    T(ALL, (R, l) => { const c = R.pick([['nickels',5],['dimes',10]]), n = l === 1 ? R.int(2, 6) : R.int(3, 10), t = n * c[1];
      return one(`How many cents are ${n} ${c[0]} worth?`, t, `Each one is worth ${c[1]}¢. Count by ${c[1]}s.`,
        [`Count by ${c[1]}s: ${skip(c[1], n)}.`, `${n} × ${c[1]} = ${t}.`, `They are worth ${t}¢.`], { unit:'¢' }); }),
    T(ALL, (R, l) => { const c = R.pick([['nickels',5],['dimes',10]]), n = l === 1 ? R.int(2, 6) : R.int(3, 10), t = n * c[1], A = name(R);
      return one(`${A} has ${t}¢, all in ${c[0]}. How many ${c[0]} does ${A} have?`, n, `How many ${c[1]}s make ${t}?`,
        [`${t} ÷ ${c[1]} = ?`, `Count by ${c[1]}s to ${t}: ${n} counts.`, `${A} has ${n} ${c[0]}.`]); }),
    T(L23, (R, l) => { const [f, n, p] = wfn(R, l), [A, B] = names2(R);
      return one(`${B} has ${n} shells. ${A} has ${f} times as many shells as ${B}. How many shells does ${A} have?`, p, `${f} times as many means multiply by ${f}.`,
        [`${f} times ${n}: ${f} × ${n}.`, `${f} × ${n} = ${p}.`, `${A} has ${p} shells.`]); }),
    T(ALL, (R, l) => { const [f, n, p] = wfn(R, l), A = name(R);
      return one(`${A} planted ${p} seeds in pots. ${A} put ${f} seeds in each pot. How many pots did ${A} use?`, n, `How many groups of ${f} are in ${p}?`,
        [`${p} ÷ ${f} = ?`, `${f} × ${n} = ${p}.`, `${A} used ${n} pots.`]); }),
    // ---- two-step ----
    T(L3, (R) => { const A = name(R), g = R.int(3, 9), e = R.int(3, 9), tot = g * e, k = R.int(2, tot - 2), a = tot - k;
      return one(`${A} buys ${g} packs of stickers with ${e} stickers in each pack. Then ${A} gives away ${k}. How many stickers are left?`, a, 'Two steps! First find how many stickers in all. Then take away.',
        [`Step 1: ${g} packs of ${e}: ${g} × ${e} = ${tot}.`, `Step 2: gives away ${k}: ${tot} − ${k} = ${a}.`, `${A} has ${a} stickers left.`]); }),
    T(L3, (R) => { const A = name(R), d = R.int(2, 6), q = R.int(2, 9), k = R.int(1, 9), p = d * q + k;
      return one(`${A} has ${p} cookies, eats ${k}, then shares the rest equally among ${d} friends. How many cookies does each friend get?`, q, 'Two steps! First find how many are left to share. Then divide.',
        [`Step 1: ${p} − ${k} = ${p - k} cookies to share.`, `Step 2: ${p - k} ÷ ${d}. Think ${d} × ? = ${p - k}.`, `${d} × ${q} = ${p - k}, so each friend gets ${q}.`]); }),
    T(L23, (R) => { const A = name(R), g = R.int(3, 9), e = R.int(3, 10), k = R.int(2, 15), a = g * e + k;
      return one(`${A} has ${g} boxes of pencils with ${e} in each box, plus ${k} loose pencils. How many pencils in all?`, a, 'First find the pencils in the boxes. Then add the loose ones.',
        [`Step 1: ${g} × ${e} = ${g * e} pencils in boxes.`, `Step 2: ${g * e} + ${k} = ${a}.`, `${A} has ${a} pencils in all.`]); }),
    T(L3, (R) => { const A = name(R), c = R.int(2, 9), n = R.int(2, 9), pay = c * n < 20 ? 20 : c * n < 50 ? 50 : 100, a = pay - c * n;
      return one(`Tickets cost $${c} each. ${A} buys ${n} tickets and pays with $${pay}. How much change does ${A} get?`, a, 'First find the cost of all the tickets. Then find the change.',
        [`Step 1: ${n} × $${c} = $${c * n}.`, `Step 2: $${pay} − $${c * n} = $${a}.`, `${A} gets $${a} in change.`], { unit:'dollars' }); }),
    T(L23, (R) => { const A = name(R), a1 = R.int(2, 6), b1 = R.int(2, 9), a2 = R.int(2, 6), b2 = R.int(2, 9), t = a1 * b1 + a2 * b2;
      return one(`${A} has ${a1} bags of red beads with ${b1} in each bag and ${a2} bags of blue beads with ${b2} in each bag. How many beads in all?`, t, 'Find each color first, then add.',
        [`Red: ${a1} × ${b1} = ${a1 * b1}.`, `Blue: ${a2} × ${b2} = ${a2 * b2}.`, `${a1 * b1} + ${a2 * b2} = ${t} beads.`]); }),
    T(L23, (R) => { const [A, B] = names2(R); let a1, b1, a2, b2; do { a1 = R.int(2, 9); b1 = R.int(2, 9); a2 = R.int(2, 9); b2 = R.int(2, 9); } while (a1 * b1 <= a2 * b2);
      const d = a1 * b1 - a2 * b2;
      return one(`${A} has ${a1} boxes with ${b1} toy cars in each. ${B} has ${a2} boxes with ${b2} toy cars in each. How many more toy cars does ${A} have?`, d, 'Find how many each one has. Then subtract.',
        [`${A}: ${a1} × ${b1} = ${a1 * b1}.`, `${B}: ${a2} × ${b2} = ${a2 * b2}.`, `${a1 * b1} − ${a2 * b2} = ${d} more.`]); }),
    T(L3, (R) => { const d = R.int(2, 6), q = R.int(3, 10), k = R.int(1, q - 1), p = d * q;
      return one(`${p} grapes are shared equally by ${d} kids. Each kid eats ${k} grapes. How many grapes does each kid have left?`, q - k, 'Two steps! Share first, then take away what each kid eats.',
        [`Step 1: ${p} ÷ ${d} = ${q} each.`, `Step 2: ${q} − ${k} = ${q - k}.`, `Each kid has ${q - k} left.`]); }),
    T(L3, (R) => { const d = R.int(2, 6), g = R.int(2, 9), m = R.int(2, 5), p = d * g, t = g * m;
      return one(`${p} students sit in groups of ${d}. Each group gets ${m} markers. How many markers are needed?`, t, 'Two steps! Find how many groups first. Then find the markers.',
        [`Step 1: ${p} ÷ ${d} = ${g} groups.`, `Step 2: ${g} × ${m} = ${t} markers.`, `${t} markers are needed.`]); }),
    T(L3, (R) => { const A = name(R); let n, f, m, g = 0; do { n = R.int(2, 6); f = R.int(2, 10); m = R.int(2, 6); } while (((n * f) % m || (n * f) / m > 10) && g++ < 99);
      if ((n * f) % m) { n = 2; f = 6; m = 3; } const t = n * f, q = t / m;
      return one(`${A} buys ${n} packs of ${f} trading cards. ${A} splits all the cards equally into ${m} piles. How many cards are in each pile?`, q, 'Two steps! Find all the cards first. Then divide.',
        [`Step 1: ${n} × ${f} = ${t} cards.`, `Step 2: ${t} ÷ ${m} = ${q}.`, `Each pile has ${q} cards.`]); }),
    T(L3, (R) => { const s = R.int(2, 6), b = R.int(2, 6), t = s * 8 + b * 6;
      return one(`A bug box has ${s} spiders and ${b} ants. A spider has 8 legs and an ant has 6 legs. How many legs are in the box?`, t, 'Find the spider legs and the ant legs, then add.',
        [`Spiders: ${s} × 8 = ${s * 8}.`, `Ants: ${b} × 6 = ${b * 6}.`, `${s * 8} + ${b * 6} = ${t} legs.`]); }),
    T(L23, (R) => { const r = R.int(3, 8), c = R.int(3, 6), k = R.int(1, c + 2), t = r * c - k;
      return one(`A classroom has ${r} rows of ${c} desks. ${k} desks are empty. How many desks have students?`, t, 'Find all the desks first. Then take away the empty ones.',
        [`Step 1: ${r} × ${c} = ${r * c} desks.`, `Step 2: ${r * c} − ${k} = ${t}.`, `${t} desks have students.`]); }),
    T(L3, (R) => { const A = name(R), f = R.int(3, 10), n = R.int(3, 9), k = R.int(2, f * n - 2), a = f * n - k;
      return one(`${A} saves $${f} each week for ${n} weeks. Then ${A} spends $${k} on a game. How much money is left?`, a, 'Find how much was saved. Then subtract what was spent.',
        [`Step 1: ${n} × $${f} = $${f * n}.`, `Step 2: $${f * n} − $${k} = $${a}.`, `${A} has $${a} left.`], { unit:'dollars' }); }),
    T(L23, (R) => { const A = name(R), x = R.int(1, 5), y = R.int(1, 5), c = R.int(2, 10), t = (x + y) * c;
      return one(`${A} buys ${x} apples and ${y} pears. Each piece of fruit costs ${c}¢. How much does ${A} spend?`, t, 'Find how many pieces of fruit first. Then multiply by the price.',
        [`Step 1: ${x} + ${y} = ${x + y} pieces.`, `Step 2: ${x + y} × ${c}¢ = ${t}¢.`, `${A} spends ${t}¢.`], { unit:'¢' }); }),
    T(L23, (R) => { const n = R.int(5, 12), k = R.int(1, n - 2), f = R.int(2, 6), t = (n - k) * f;
      return one(`There are ${n} kids at a party. ${k} ${k === 1 ? "goes" : "go"} home early. Each kid who stays gets ${f} balloons. How many balloons are given out?`, t, 'Find how many kids stay. Then multiply.',
        [`Step 1: ${n} − ${k} = ${n - k} kids stay.`, `Step 2: ${n - k} × ${f} = ${t}.`, `${t} balloons are given out.`]); })
  ];
  M['g3.wordmd'] = { name:'Multiply & divide word problems', unit:'g3u3', gen(R, lvl){ return run(WORDMD, R, lvl); } };

  // ======================= g3.multiples10 =======================
  function m10(R, l){ const n = l === 1 ? R.int(1, 5) : R.int(2, 9), t = l === 1 ? R.pick([1,2,3,4,5]) : R.int(2, 9); return [n, t, t * 10, n * t * 10]; }
  const tensSteps = (n, t, m, p) => [`${m} = ${t} ${pl(t, 'tens')}, so this is ${n} × ${t} ${pl(t, 'tens')}.`, `${n} × ${t} = ${n * t}, so it is ${n * t} ${pl(n * t, 'tens')}.`, `${n * t} ${pl(n * t, 'tens')} = ${fmt(p)}.`];
  const tensHint = (n, t, m) => `${m} is ${t} ${pl(t, 'tens')}. Use the fact ${n} × ${t}, then think in tens.`;
  const M10W = [['boxes of crayons','crayons'], ['packs of paper','sheets'], ['bags of marbles','marbles'], ['rolls of stickers','stickers'], ['cartons of straws','straws'], ['jars of beads','beads']];
  const MULT10 = [
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l); return { q:`What is ${n} × ${m}?`, kind:'num', a:p, hint:tensHint(n, t, m), steps:tensSteps(n, t, m, p) }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l); return { q:`Solve: ${m} × ${n} = ☐`, kind:'num', a:p, hint:tensHint(n, t, m), steps:tensSteps(n, t, m, p) }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l); return { q:`☐ = ${n} × ${m}. What number goes in the box?`, kind:'num', a:p, hint:tensHint(n, t, m), steps:tensSteps(n, t, m, p) }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l);
      return { q:`${n} × ☐ = ${fmt(p)}. The missing number is a multiple of 10. What is it?`, kind:'num', a:m, hint:`Think in tens: ${n} × ? tens = ${p / 10} tens.`,
        steps:[`${fmt(p)} is ${p / 10} tens.`, `${n} × ${t} = ${p / 10}, so it is ${t} tens.`, `${t} tens = ${m}. The box is ${m}.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l);
      return { q:`☐ × ${m} = ${fmt(p)}. What is the missing number?`, kind:'num', a:n, hint:`Think in tens: ? × ${t} tens = ${p / 10} tens.`,
        steps:[`${fmt(p)} is ${p / 10} tens and ${m} is ${t} tens.`, `? × ${t} = ${p / 10}.`, `${n} × ${t} = ${p / 10}, so ? = ${n}.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l);
      return { q:`${n} × ${t} tens = how many tens?`, kind:'num', a:n * t, hint:`Just multiply ${n} × ${t}. The answer is in tens.`,
        steps:[`${n} × ${t} = ${n * t}.`, `So ${n} × ${t} tens = ${n * t} tens (that is ${fmt(p)}).`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l);
      return { q:`Use the fact ${n} × ${t} = ${n * t}. What is ${n} × ${m}?`, kind:'num', a:p, hint:`${m} is 10 times bigger than ${t}, so the answer is 10 times bigger too.`,
        steps:[`${n} × ${t} = ${n * t}.`, `${m} is ${t} tens, so ${n} × ${m} is ${n * t} tens.`, `${n * t} tens = ${fmt(p)}.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l);
      return { q:`Skip count by ${m}s. What is the ${['','1st','2nd','3rd'][n] || n + 'th'} number you say?`, kind:'num', a:p, hint:`Count by ${m}s: ${m}, ${2 * m}, ${3 * m}...`,
        steps:[`Count by ${m}s: ${skip(m, n).split(', ').map(Number).map(fmt).join(', ')}.`, `The number in place ${n} is ${fmt(p)}.`, `That is ${n} × ${m} = ${fmt(p)}.`] }; }),
    T(ALL, (R, l) => { let [n, t, m, p] = m10(R, l); if (n * t > 20) { n = R.int(1, 4); t = R.int(1, 5); m = t * 10; p = n * m; }
      return { q:`Each rod is 10. The blocks show ${n} groups of ${m}. What number is that?`, kind:'num', a:p, model:{ type:'blocks', t:n * t },
        hint:'Count the rods by 10s.', steps:[`${n} groups of ${t} rods = ${n * t} rods.`, `Count by 10s: ${n * t} rods = ${p}.`, `So ${n} × ${m} = ${p}.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l);
      return { q:`Each jump on the number line is ${m}. The dot is after ${n} ${pl(n, 'jumps')} from 0. What number is at the dot?`, kind:'num', a:p,
        model:{ type:'numberline', min:0, max:(n + 1) * m, step:m, label:(n + 1) * m, points:[{ x:p, label:'?' }] },
        hint:`Count the jumps from 0 to the dot by ${m}s.`, steps:[`Count by ${m}s: ${skip(m, n)}.`, `${n} jumps of ${m} = ${n} × ${m} = ${p}.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l), A = name(R), w = R.pick(M10W);
      return { q:`${A} has ${n} ${w[0]}. Each one has ${m} ${w[1]}. How many ${w[1]} in all?`, kind:'num', a:p, hint:`Multiply ${n} × ${m}. Use the basic fact ${n} × ${t} to help.`,
        steps:[`${n} groups of ${m}: ${n} × ${m}.`, `${n} × ${t} tens = ${n * t} tens.`, `${n * t} tens = ${fmt(p)} ${w[1]}.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l);
      return { q:`A bus holds ${m} people. How many people can ${n} ${pl(n, 'buses')} hold?`, kind:'num', a:p, hint:tensHint(n, t, m), steps:tensSteps(n, t, m, p) }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l), A = name(R);
      return { q:`${A} buys ${n} ${pl(n, 'games')} that cost $${m} each. How much does ${A} spend?`, kind:'num', a:p, unit:'dollars', hint:tensHint(n, t, m), steps:[...tensSteps(n, t, m, p), `${A} spends $${p}.`].slice(-3) }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l), A = name(R);
      return { q:`${A} practices piano for ${m} minutes each day. How many minutes is that in ${n} ${pl(n, 'days')}?`, kind:'num', a:p, unit:'minutes', hint:tensHint(n, t, m), steps:tensSteps(n, t, m, p) }; }),
    T(ALL, (R, l) => { let a, b, c, d; do { [a, , b] = m10(R, l); [c, , d] = m10(R, l); } while (a === c && b === d);
      const x = a * b, y = c * d, sym = x > y ? '>' : x < y ? '<' : '=';
      return { q:`Which symbol makes this true?  ${a} × ${b} ☐ ${c} × ${d}`, kind:'choice', a:sym, choices:['<','>','='],
        hint:'Find both products first, then compare.', steps:[`${a} × ${b} = ${fmt(x)}.`, `${c} × ${d} = ${fmt(y)}.`, `So ${a} × ${b} ${sym} ${c} × ${d}.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l), ans = fmt(p);
      return { q:`Which is the product of ${n} × ${m}?`, kind:'choice', a:ans, choices: choices(ans, [fmt(n * t), fmt(p * 10), fmt(n + m), fmt(p + 10), fmt(p - 10)]),
        hint:`Do ${n} × ${t}, then make it tens. Don't forget the 0!`, steps:tensSteps(n, t, m, p) }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l), A = name(R), wrong = n * t;
      return { q:`${A} says ${n} × ${m} = ${wrong}. ${A} forgot something. What is the correct answer?`, kind:'num', a:p,
        hint:`${m} is ${t} tens, so the answer is ${n * t} tens, not ${n * t} ones.`, steps:[`${n} × ${t} = ${n * t}, but ${m} is ${t} tens.`, `So the answer is ${n * t} tens.`, `${n * t} tens = ${fmt(p)}.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l), A = name(R);
      return { q:`${A} has ${fmt(p)} stickers to put on sheets of ${m}. How many sheets does ${A} fill?`, kind:'num', a:n, hint:`How many ${m}s make ${fmt(p)}? Think in tens.`,
        steps:[`${fmt(p)} is ${p / 10} tens and ${m} is ${t} tens.`, `? × ${t} = ${p / 10}.`, `${n} × ${t} = ${p / 10}, so ${A} fills ${n} sheets.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l), w = R.pick(M10W), k = Math.max(n, 3);
      return { q:`The table shows the ${w[1]} in ${w[0]}. Each one holds the same number. How many ${w[1]} are in ${k + 1} ${w[0].split(" ")[0]}?`, kind:'num', a:(k + 1) * m,
        model:{ type:'table', head:[cap(w[0].split(' ')[0]), cap(w[1])], rows:[[1, m], [2, 2 * m], [3, 3 * m], [k + 1, '?']] },
        hint:`Each one adds ${m}. Look for the pattern.`, steps:[`Each one holds ${m}.`, `${k + 1} × ${m} = ${fmt((k + 1) * m)}.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l), ans = `${n} × ${m}`;
      return { q:`Which is equal to ${fmt(p)}?`, kind:'choice', a:ans,
        choices: choices(ans, R.shuffle(notVal(p, [[`${n + 1} × ${m}`, (n + 1) * m], [`${n} × ${m + 10}`, n * (m + 10)], [`${n} × ${t}`, n * t], [`${n} + ${m}`, n + m]]))),
        hint:'Find each product. Think in tens!', steps:[`${n} × ${m} = ${n} × ${t} tens = ${n * t} tens.`, `${n * t} tens = ${fmt(p)}.`, `So ${ans} = ${fmt(p)}.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l), ans = `${n} × ${t} = ${n * t}`;
      return { q:`Which basic fact helps you solve ${n} × ${m}?`, kind:'choice', a:ans,
        choices: choices(ans, R.shuffle([`${n} + ${t} = ${n + t}`, `${n} × 10 = ${n * 10}`, `${t} × ${t} = ${t * t}`, `${n} × ${t + 1} = ${n * (t + 1)}`])),
        hint:`${m} is ${t} tens. Which fact uses ${n} and ${t}?`, steps:[`${m} = ${t} tens.`, `Use ${ans}.`, `Then ${n} × ${m} = ${n * t} tens = ${fmt(p)}.`] }; }),
    T(ALL, (R, l) => { const [n, t, m, p] = m10(R, l);
      return { q:`${n} × ${t} × 10 = ?`, kind:'num', a:p, hint:`Do ${n} × ${t} first. Then times 10 puts a 0 on the end.`,
        steps:[`${n} × ${t} = ${n * t}.`, `${n * t} × 10 = ${fmt(p)}.`, `That is the same as ${n} × ${m}.`] }; })
  ];
  M['g3.multiples10'] = { name:'Multiply by multiples of 10', unit:'g3u5', gen(R, lvl){ return run(MULT10, R, lvl); } };

  // ======================= g3.fractions =======================
  const FNAME = { 2:['half','halves'], 3:['third','thirds'], 4:['fourth','fourths'], 5:['fifth','fifths'], 6:['sixth','sixths'], 8:['eighth','eighths'], 10:['tenth','tenths'], 12:['twelfth','twelfths'] };
  const NUMW = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
  const DEN = { 1:[2,3,4,6,8], 2:[2,3,4,5,6,8], 3:[2,3,4,5,6,8,10,12] };
  const fword = (k, d) => `${NUMW[k]} ${k === 1 ? FNAME[d][0] : FNAME[d][1]}`;
  function fk(R, l, d){ d = d || R.pick(DEN[l]); return [R.int(1, d - 1), d]; }
  const shp = R => R.pick(['bar','circle']);
  const fracDs = (k, d) => [`${d - k}/${d}`, `${k}/${d - k}`, `${d}/${k}`, `${k + 1}/${d}`, `${k}/${d + 1}`, `${k - 1}/${d}`].filter(s => !/^0\//.test(s) && !/\/0$/.test(s));
  const FRACTIONS = [
    T(ALL, (R, l) => { const [k, d] = fk(R, l), ans = `${k}/${d}`;
      return { q:'What fraction of the shape is shaded?', kind:'choice', a:ans, choices: choices(ans, R.shuffle(fracDs(k, d))), model:{ type:'fraction', parts:d, shaded:k, shape:shp(R) },
        hint:'The bottom number is how many equal parts in all. The top number is how many are shaded.',
        steps:[`Count all the equal parts: ${d}. That is the bottom number.`, `Count the shaded parts: ${k}. That is the top number.`, `So ${ans} is shaded.`] }; }),
    T(ALL, (R, l) => { const [k, d] = fk(R, l), ans = `${d - k}/${d}`;
      return { q:'What fraction of the shape is NOT shaded?', kind:'choice', a:ans, choices: choices(ans, R.shuffle([`${k}/${d}`, `${d - k}/${k}`, `${d}/${d - k}`, `${d - k}/${d + 1}`])),
        model:{ type:'fraction', parts:d, shaded:k, shape:shp(R) }, hint:'Count the parts that are white. Then count all the parts.',
        steps:[`There are ${d} equal parts.`, `${k} are shaded, so ${d} − ${k} = ${d - k} are not.`, `${ans} is not shaded.`] }; }),
    T(ALL, (R, l) => { const [k, d] = fk(R, l);
      return { q:`You want to shade ${k}/${d} of this bar. How many parts should you shade?`, kind:'num', a:k, model:{ type:'fraction', parts:d, shaded:0, shape:'bar' },
        hint:'The top number tells how many parts to shade.', steps:[`The bar has ${d} equal parts, which matches the bottom number.`, `The top number is ${k}.`, `Shade ${k} parts.`] }; }),
    T(ALL, (R, l) => { const [k, d] = fk(R, l), ans = `${k}/${d}`;
      return { q:'What fraction is at the point on the number line?', kind:'choice', a:ans, choices: choices(ans, R.shuffle([`${k}/${d + 1}`, `${k + 1}/${d}`, `${d - k}/${d}`, `1/${k + 1}`, `${k}/${d - 1}`].filter(s => !/\/1$/.test(s) && s !== `${k}/${k}`))),
        model:{ type:'numberline', min:0, max:1, step:1 / d, label:1, points:[{ x:k / d, label:'?' }] },
        hint:'Count the jumps (spaces) from 0 to 1, not the tick marks. Then count jumps from 0 to the point.',
        steps:[`From 0 to 1 there are ${d} equal jumps, so each jump is 1/${d}.`, `From 0 to the point is ${k} jump${k > 1 ? 's' : ''}.`, `So the point is at ${ans}.`] }; }),
    T(ALL, (R, l) => { const d = R.pick(DEN[l]);
      return { q:'Into how many equal parts is the space from 0 to 1 cut on this number line?', kind:'num', a:d, model:{ type:'numberline', min:0, max:1, step:1 / d, label:1 },
        hint:'Count the spaces between the tick marks, not the tick marks.', steps:[`Count the jumps from 0 to 1.`, `There are ${d} equal jumps.`, `So each jump is 1/${d}.`] }; }),
    T(ALL, (R, l) => { const d = R.pick(DEN[l]), ans = `1/${d}`;
      return { q:'Each part of this shape is what fraction of the whole?', kind:'choice', a:ans, choices: choices(ans, R.shuffle([`${d}/1`, `1/${d + 1}`, `1/${d - 1}`, `${d - 1}/${d}`].filter(s => s !== '1/1'))),
        model:{ type:'fraction', parts:d, shaded:1, shape:shp(R) }, hint:'One part out of all the equal parts. That is a unit fraction.',
        steps:[`The whole has ${d} equal parts.`, `One part is 1 out of ${d}.`, `So each part is ${ans}.`] }; }),
    T(ALL, (R, l) => { const d = R.pick(DEN[l]), ans = FNAME[d][1];
      return { q:`A sandwich is cut into ${d} equal parts. What do we call the parts?`, kind:'choice', a:ans, choices: choices(ans, R.shuffle(Object.keys(FNAME).filter(x => +x !== d && DEN[l].includes(+x)).map(x => FNAME[x][1]))),
        hint:'2 parts are halves, 3 parts are thirds, 4 parts are fourths...', steps:[`${d} equal parts.`, `Each part is one ${FNAME[d][0]}.`, `They are ${ans}.`] }; }),
    T(ALL, (R, l) => { const [k, d] = fk(R, l), ans = `${k}/${d}`;
      return { q:`${k} out of ${d} equal parts of a garden have flowers. What fraction of the garden has flowers?`, kind:'choice', a:ans, choices: choices(ans, R.shuffle(fracDs(k, d))),
        hint:'The part with flowers goes on top. All the equal parts go on the bottom.', steps:[`Parts with flowers: ${k} (top number).`, `Equal parts in all: ${d} (bottom number).`, `${ans}.`] }; }),
    T(ALL, (R, l) => { const [k, d] = fk(R, l), ans = `${k}/${d}`;
      return { q:`How do you write "${fword(k, d)}" as a fraction?`, kind:'choice', a:ans, choices: choices(ans, R.shuffle([`${d}/${k}`, `${k}/${d + 1}`, `${k + 1}/${d}`, `1/${d}`].filter(s => s !== ans))),
        hint:'The first word is the top number. The second word tells the bottom number.', steps:[`"${NUMW[k]}" is ${k}, the top number.`, `"${k === 1 ? FNAME[d][0] : FNAME[d][1]}" means ${d} equal parts, the bottom number.`, `So it is ${ans}.`] }; }),
    T(ALL, (R, l) => { const [k, d] = fk(R, l), top = R.chance(0.5);
      return { q:`In the fraction ${k}/${d}, what is the ${top ? 'numerator (top number)' : 'denominator (bottom number)'}?`, kind:'num', a:top ? k : d,
        hint:'The numerator is on top. The denominator is on the bottom.', steps:[top ? `The numerator is the top number: ${k}. It counts the parts we are talking about.` : `The denominator is the bottom number: ${d}. It tells how many equal parts make the whole.`] }; }),
    T(ALL, (R, l) => { const d = R.pick(DEN[l].filter(x => x > 2)); let a = R.int(1, d - 1), b = R.int(1, d - 1); while (b === a) b = R.int(1, d - 1);
      const sym = a > b ? '>' : '<';
      return { q:`Which symbol makes this true?  ${a}/${d} ☐ ${b}/${d}`, kind:'choice', a:sym, choices:['<','>','='],
        hint:'The bottom numbers match, so the pieces are the same size. Who has more pieces?',
        steps:[`Both are ${FNAME[d][1]}, so the pieces are the same size.`, `${Math.max(a, b)} pieces is more than ${Math.min(a, b)} ${pl(Math.min(a, b), 'pieces')}.`, `So ${a}/${d} ${sym} ${b}/${d}.`] }; }),
    T(ALL, (R, l) => { const n = l === 1 ? 1 : R.int(1, 3), pool = DEN[l].filter(v => v > n); let x = R.pick(pool), y = R.pick(pool); while (y === x) y = R.pick(pool);
      const sym = x < y ? '>' : '<';
      return { q:`Which symbol makes this true?  ${n}/${x} ☐ ${n}/${y}`, kind:'choice', a:sym, choices:['<','>','='],
        hint:'The top numbers match. Which pieces are bigger: cut into fewer parts or more parts?',
        steps:[`Both have ${n} piece${n > 1 ? 's' : ''}.`, `${FNAME[Math.min(x, y)][1]} are bigger than ${FNAME[Math.max(x, y)][1]}: fewer cuts means bigger pieces.`, `So ${n}/${x} ${sym} ${n}/${y}.`] }; }),
    T(ALL, (R, l) => { const n = l === 1 ? 1 : R.int(1, 2), pool = DEN[l].filter(v => v > n); let x = R.pick(pool), y = R.pick(pool); while (y === x) y = R.pick(pool);
      const big = x < y ? x : y, ans = `${n}/${big}`, [A, B] = names2(R);
      return { q:`${A} eats ${n}/${x} of a pizza. ${B} eats ${n}/${y} of a pizza the same size. Who eats more pizza?`, kind:'choice', a:big === x ? A : B, choices:[A, B],
        hint:'Same top number. Fewer slices means bigger slices!', steps:[`Both ate ${n} slice${n > 1 ? 's' : ''}.`, `${FNAME[big][1]} are bigger than ${FNAME[Math.max(x, y)][1]}.`, `${ans} is more, so ${big === x ? A : B} eats more.`] }; }),
    T(ALL, (R, l) => { const d = R.pick(DEN[l].filter(x => x > 3)); const ks = R.shuffle(range(1, d - 1)).slice(0, 3), most = R.chance(0.5), a = most ? Math.max(...ks) : Math.min(...ks), ans = `${a}/${d}`;
      return { q:`Which fraction is the ${most ? 'greatest' : 'least'}?`, kind:'choice', a:ans, choices: choices(ans, ks.filter(x => x !== a).map(x => `${x}/${d}`)),
        hint:'The pieces are all the same size. Compare the top numbers.', steps:[`All of them are ${FNAME[d][1]}.`, `The ${most ? 'biggest' : 'smallest'} top number is ${a}.`, `So ${ans} is the ${most ? 'greatest' : 'least'}.`] }; }),
    T(ALL, (R, l) => { const pool = DEN[l]; const ds = R.shuffle(pool.slice()).slice(0, 3), most = R.chance(0.5), a = most ? Math.min(...ds) : Math.max(...ds), ans = `1/${a}`;
      return { q:`Which unit fraction is the ${most ? 'greatest' : 'least'}?`, kind:'choice', a:ans, choices: choices(ans, ds.filter(x => x !== a).map(x => `1/${x}`)),
        hint:'With 1 on top, a bigger bottom number means smaller pieces.', steps:[`Each is 1 piece.`, most ? `Fewest pieces in the whole = biggest piece: 1/${a}.` : `Most pieces in the whole = smallest piece: 1/${a}.`, `So ${ans} is the ${most ? 'greatest' : 'least'}.`] }; }),
    T(ALL, (R, l) => { const n = R.pick(l === 1 ? [2,3,4,6,8] : [3,4,5,6,8,10]), k = R.int(1, n - 1), c = R.pick([['balloons','red'],['marbles','blue'],['crayons','green'],['cars','yellow'],['fish','orange']]), ans = `${k}/${n}`;
      return { q:`There are ${n} ${c[0]}. ${cap(NUMW[k])} of them ${k === 1 ? 'is' : 'are'} ${c[1]}. What fraction of the ${c[0]} ${k === 1 ? 'is' : 'are'} ${c[1]}?`, kind:'choice', a:ans, choices: choices(ans, R.shuffle(fracDs(k, n))),
        hint:`The whole set is all ${n} ${c[0]}. That is the bottom number.`, steps:[`There are ${n} in the set: the bottom number.`, `${k} ${k === 1 ? 'is' : 'are'} ${c[1]}: the top number.`, `So ${ans} ${k === 1 ? 'is' : 'are'} ${c[1]}.`] }; }),
    T(ALL, (R, l) => { const n = R.int(3, l === 1 ? 4 : 6), k = R.int(1, n - 1), others = ['square', 'circle', 'hexagon'];
      const items = R.shuffle([...Array(k)].map(() => ({ shape:'triangle' })).concat([...Array(n - k)].map(() => { const o = R.pick(others); return o === 'circle' ? { circle:true } : { shape:o }; })));
      const ans = `${k}/${n}`;
      return { q:'What fraction of the shapes are triangles?', kind:'choice', a:ans, choices: choices(ans, R.shuffle([`${n - k}/${n}`, `${k}/${n - k}`, `${n}/${k}`, `${k}/${n + 1}`])), model:{ type:'shapes', items },
        hint:'Count all the shapes for the bottom number. Count the triangles for the top number.', steps:[`There are ${n} shapes in all.`, `${k} ${k === 1 ? 'is a triangle' : 'are triangles'}.`, `So ${ans} are triangles.`] }; }),
    T(ALL, (R, l) => { const d = R.pick(l === 1 ? [2,3,4,5] : [2,3,4,5,6,8,10]), k = l === 3 ? R.int(1, d - 1) : 1, q = R.int(2, l === 1 ? 5 : 8), n = d * q, a = k * q, it = R.pick(['cookies','apples','stickers','beads','crayons']);
      return { q:`What is ${k}/${d} of ${n} ${it}?`, kind:'num', a, hint:`Split ${n} into ${d} equal groups. Then take ${k} of the groups.`,
        steps:[`${n} ÷ ${d} = ${q} in each group.`, k === 1 ? `1/${d} is one group: ${q}.` : `${k} groups: ${k} × ${q} = ${a}.`, `So ${k}/${d} of ${n} is ${a}.`] }; }),
    T(ALL, (R, l) => { const pairs = []; for (const b of [2,3,4,5,6]) for (const m of [2,3,4]) if (b * m <= (l === 1 ? 8 : 12) && b * m !== 9) pairs.push([b, m]);
      const [b, m] = R.pick(pairs), a = R.int(1, b - 1), D = b * m, N = a * m;
      return { q:`${a}/${b} = ☐/${D}. What number goes in the box?`, kind:'num', a:N, model:{ type:'fraction', parts:b, shaded:a, shape:'bar' },
        hint:`Cut each of the ${b} parts into ${m} smaller parts. How many small parts are shaded?`,
        steps:[`${D} is ${b} × ${m}, so each part is cut into ${m}.`, `${a} shaded parts × ${m} = ${N} small parts.`, `So ${a}/${b} = ${N}/${D}.`] }; }),
    T(ALL, (R, l) => { const m = R.int(2, l === 1 ? 4 : 6), ans = `${m}/${2 * m}`;
      return { q:'Which fraction is equal to 1/2?', kind:'choice', a:ans, choices: choices(ans, R.shuffle([`${m}/${2 * m + 1}`, `${m + 1}/${2 * m}`, m > 2 ? `1/${m}` : `1/3`, `2/${2 * m + 2}`].filter(s => s !== ans))),
        hint:'Half means the top number is half of the bottom number.', steps:[`${m} is half of ${2 * m}.`, `So ${ans} = 1/2.`] }; }),
    T(ALL, (R, l) => { const d = R.pick(DEN[l]);
      return { q:`How many ${FNAME[d][1]} make one whole?`, kind:'num', a:d, model:{ type:'fraction', parts:d, shaded:d, shape:shp(R) },
        hint:'When every part is shaded, you have the whole.', steps:[`The whole is cut into ${d} ${FNAME[d][1]}.`, `${d}/${d} = 1 whole.`, `So ${d} ${FNAME[d][1]} make one whole.`] }; }),
    T(ALL, (R, l) => { const d = R.pick(DEN[l]), ans = `${d}/${d}`;
      return { q:'Which fraction is equal to 1 whole?', kind:'choice', a:ans, choices: choices(ans, R.shuffle([`1/${d}`, `${d - 1}/${d}`, `${d}/${d + 1}`, `${d + 1}/${d}`].filter(s => s !== ans && s !== '1/1'))),
        hint:'One whole means every part is used.', steps:[`When the top and bottom numbers are the same, every part is there.`, `${ans} = 1 whole.`] }; }),
    T(ALL, (R, l) => { const [k, d] = fk(R, l, R.pick(DEN[l].filter(x => x >= 4))), A = name(R), ans = `${d - k}/${d}`;
      return { q:`A pie is cut into ${d} equal slices. ${A} eats ${k} ${pl(k, 'slices')}. What fraction of the pie is left?`, kind:'choice', a:ans,
        choices: choices(ans, R.shuffle([`${k}/${d}`, `${d - k}/${k}`, `${d}/${d - k}`, `${d - k + 1}/${d}`])),
        hint:'Find how many slices are left. All the slices make the bottom number.', steps:[`${d} − ${k} = ${d - k} slices are left.`, `There were ${d} slices in all.`, `So ${ans} is left.`] }; }),
    T(ALL, (R, l) => { const [k, d] = fk(R, l);
      return { q:'How many more parts need to be shaded to shade the whole shape?', kind:'num', a:d - k, model:{ type:'fraction', parts:d, shaded:k, shape:shp(R) },
        hint:'Count the parts that are not shaded yet.', steps:[`${k} of ${d} parts are shaded.`, `${d} − ${k} = ${d - k}.`, `Shade ${d - k} more to make ${d}/${d}.`] }; }),
    T(L23, (R, l) => { const pairs = []; for (const b of [2,3,4]) for (const m of [2,3,4]) if (b * m <= 12 && b * m !== 9) pairs.push([b, m]);
      const [b, m] = R.pick(pairs), a = R.int(1, b - 1), D = b * m, N = a * m;
      return { q:`The point is at ${a}/${b}. How many ${FNAME[D][1]} is that? (Write the top number.)`, kind:'num', a:N,
        model:{ type:'numberline', min:0, max:1, step:1 / D, label:1, points:[{ x:a / b, label:`${a}/${b}` }] },
        hint:`Count the small jumps of 1/${D} from 0 to the point.`, steps:[`Each small jump is 1/${D}.`, `From 0 to the point is ${N} small jumps.`, `So ${a}/${b} = ${N}/${D}.`] }; })
  ];
  M['g3.fractions'] = { name:'Fractions', unit:'g3u6', gen(R, lvl){ return run(FRACTIONS, R, lvl); } };

  // ======================= g3.money =======================
  const COIN = { h:['half dollar','half dollars',50], q:['quarter','quarters',25], d:['dime','dimes',10], n:['nickel','nickels',5], p:['penny','pennies',1] };
  const ITEMS = ['a toy car','a book','a snack','a ball','a pack of cards','a yo-yo','a jump rope','a coloring book','a water bottle','a bag of chips'];
  function coinSet(R, l, bills){
    let c; do { c = l === 1 ? { q:R.int(0, 2), d:R.int(0, 3), n:R.int(0, 2), p:R.int(0, 4) } : l === 2 ? { q:R.int(0, 4), d:R.int(0, 4), n:R.int(0, 3), p:R.int(0, 4) } : { h:R.int(0, 1), q:R.int(0, 4), d:R.int(0, 4), n:R.int(0, 3), p:R.int(0, 4) }; }
    while (Object.values(c).reduce((a, b) => a + b, 0) < 2);
    c.b = bills ? R.int(1, l === 1 ? 2 : 4) : 0;
    const coins = []; for (let i = 0; i < c.b; i++) coins.push('b'); ['h','q','d','n','p'].forEach(k => { for (let i = 0; i < (c[k] || 0); i++) coins.push(k); });
    const val = c.b * 100 + ['h','q','d','n','p'].reduce((s, k) => s + (c[k] || 0) * COIN[k][2], 0);
    return { c, coins, val };
  }
  function coinSteps(c){ let run = 0; const s = [];
    if (c.b){ run += c.b * 100; s.push(`${c.b} one-dollar ${pl(c.b, 'bills')}: ${cents(c.b * 100)}. Running total: ${cents(run)}.`); }
    ['h','q','d','n','p'].forEach(k => { if (!c[k]) return; const v = c[k] * COIN[k][2]; run += v; s.push(`${c[k]} ${c[k] > 1 ? COIN[k][1] : COIN[k][0]}: ${c[k]} × ${COIN[k][2]}¢ = ${v}¢. Running total: ${cents(run)}.`); });
    s.push(`Total: ${cents(run)}.`); return s; }
  const coinWords = c => ['h','q','d','n','p'].filter(k => c[k]).map(k => `${c[k]} ${c[k] > 1 ? COIN[k][1] : COIN[k][0]}`).join(', ');
  // fewest coins for an amount
  function fewest(v){ const o = {}; let r = v; for (const k of ['q','d','n','p']){ o[k] = Math.floor(r / COIN[k][2]); r -= o[k] * COIN[k][2]; } return o; }
  const MONEY = [
    T(ALL, (R, l) => { const s = coinSet(R, l, false);
      return { q:'How much money is shown? (Answer in cents.)', kind:'num', a:s.val, unit:'¢', model:{ type:'coins', coins:s.coins },
        hint:'Start with the coins worth the most. Quarters are 25¢, dimes 10¢, nickels 5¢, pennies 1¢.', steps:coinSteps(s.c) }; }),
    T(ALL, (R, l) => { const s = coinSet(R, l, true);
      return { q:'How much money is shown in dollars? (Write it like 1.25.)', kind:'num', a:s.val / 100, unit:'dollars', model:{ type:'coins', coins:s.coins },
        hint:'Count the dollar bills first. Then count on the coins, starting with the biggest.', steps:coinSteps(s.c) }; }),
    T(ALL, (R, l) => { const v = R.int(3, l === 1 ? 10 : 19) * 5, f = fewest(v), ans = coinWords(f);
      const alt1 = Object.assign({}, f, { q:f.q, d:f.d + 1 }), alt2 = Object.assign({}, f, { n:f.n + 1 }), alt3 = f.q ? Object.assign({}, f, { q:f.q - 1 }) : Object.assign({}, f, { q:1 });
      const ds = [alt1, alt2, alt3].map(coinWords);
      return { q:`Which coins make exactly ${v}¢?`, kind:'choice', a:ans, choices: choices(ans, ds),
        hint:'Add up the coins in each choice. Quarters 25¢, dimes 10¢, nickels 5¢, pennies 1¢.', steps:[`Try ${ans}.`, ...coinSteps(f).slice(-2)] }; }),
    T(ALL, (R, l) => { const ks = R.shuffle(['q','d','n','p']).slice(0, 2), a = R.int(2, 7), b = R.int(2, 7), va = a * COIN[ks[0]][2], vb = b * COIN[ks[1]][2];
      if (va === vb) return MONEY[0](R, l);
      const A = `${a} ${COIN[ks[0]][1]}`, B = `${b} ${COIN[ks[1]][1]}`, ans = va > vb ? A : B;
      return { q:`Which is worth more: ${A} or ${B}?`, kind:'choice', a:ans, choices:[A, B],
        hint:'Find the value of each group of coins, then compare.', steps:[`${A} = ${cents(va)}.`, `${B} = ${cents(vb)}.`, `${ans} is worth more.`] }; }),
    T(ALL, (R, l) => { const [A, B] = names2(R); let s1, s2; do { s1 = coinSet(R, l, false); s2 = coinSet(R, l, false); } while (s1.val === s2.val);
      const ans = s1.val > s2.val ? A : B;
      return { q:`${A} has ${coinWords(s1.c)}. ${B} has ${coinWords(s2.c)}. Who has more money?`, kind:'choice', a:ans, choices:[A, B],
        hint:'Count each person\'s money first.', steps:[`${A}: ${cents(s1.val)}.`, `${B}: ${cents(s2.val)}.`, `${ans} has more.`] }; }),
    T(ALL, (R, l) => { const A = name(R), item = R.pick(ITEMS), price = l === 1 ? R.int(1, 19) * 5 : R.int(11, 99), ch = 100 - price;
      return { q:`${A} buys ${item} for ${price}¢ and pays with $1. How much change does ${A} get?`, kind:'num', a:ch, unit:'¢',
        hint:'$1 is 100¢. Count up from the price to 100¢.', steps:[`$1 = 100¢.`, `Count up from ${price}¢ to 100¢, or subtract: 100 − ${price} = ${ch}.`, `The change is ${ch}¢.`] }; }),
    T(ALL, (R, l) => { const A = name(R), item = R.pick(ITEMS), price = l === 1 ? R.int(21, 99) * 5 : R.int(101, 495), ch = 500 - price;
      return { q:`${A} buys ${item} for ${cents(price)} and pays with a $5 bill. How much change does ${A} get in dollars? (Write it like 1.25.)`, kind:'num', a:ch / 100, unit:ch === 100 ? 'dollar' : 'dollars',
        hint:'$5.00 is 500¢. Find the difference, then write it back in dollars.', steps:[`$5.00 = 500¢ and ${cents(price)} = ${price}¢.`, `500 − ${price} = ${ch}¢.`, `${ch}¢ = ${dol(ch)}. The change is ${dol(ch)}.`] }; }),
    T(ALL, (R, l) => { const A = name(R), item = R.pick(ITEMS), price = l === 1 ? R.int(2, 9) * 100 : l === 2 ? R.int(21, 199) * 5 : R.int(201, 995), ch = 1000 - price;
      return { q:`${A} buys ${item} for ${dol(price)} and pays with a $10 bill. How much change does ${A} get in dollars? (Write it like 1.25.)`, kind:'num', a:ch / 100, unit:ch === 100 ? 'dollar' : 'dollars',
        hint:'$10.00 is 1,000¢. Count up from the price to $10.', steps:[`$10.00 = 1,000¢ and ${dol(price)} = ${price}¢.`, `1,000 − ${price} = ${ch}¢.`, `The change is ${dol(ch)}.`] }; }),
    T(ALL, (R, l) => { const v = R.int(l === 1 ? 6 : 11, l === 1 ? 40 : 99), f = fewest(v), n = f.q + f.d + f.n + f.p;
      return { q:`What is the fewest number of coins that make ${v}¢? (Use quarters, dimes, nickels and pennies.)`, kind:'num', a:n,
        hint:'Use the biggest coins you can first: quarters, then dimes, then nickels, then pennies.', steps:[`Biggest coins first: ${coinWords(f)}.`, `That makes ${v}¢.`, `${n} ${pl(n, 'coins')} in all.`] }; }),
    T(ALL, (R, l) => { let s; do { s = coinSet(R, l, false); } while (s.val >= 100); const need = 100 - s.val;
      return { q:'How many more cents do you need to make $1?', kind:'num', a:need, unit:'¢', model:{ type:'coins', coins:s.coins },
        hint:'Count the coins. Then count up to 100¢.', steps:[...coinSteps(s.c).slice(-1), `100 − ${s.val} = ${need}.`, `You need ${need}¢ more.`] }; }),
    T(ALL, (R, l) => { const k = R.pick(['q','d','n']), mult = COIN[k][2], n = R.int(2, l === 1 ? 6 : 12), v = n * mult;
      return { q:`How many ${COIN[k][1]} make ${cents(v)}?`, kind:'num', a:n, hint:`Each ${COIN[k][0]} is ${mult}¢. Count by ${mult}s to ${v}.`,
        steps:[`Count by ${mult}s: ${skip(mult, n)}.`, `That is ${n} ${COIN[k][1]}.`] }; }),
    T(ALL, (R, l) => { const A = name(R), [x, y] = R.shuffle(ITEMS.slice()).slice(0, 2), a = R.int(10, l === 1 ? 45 : 95), b = R.int(10, l === 1 ? 45 : 95), t = a + b;
      return { q:`${A} buys ${x} for ${a}¢ and ${y} for ${b}¢. How much does ${A} spend in all? (Answer in cents.)`, kind:'num', a:t, unit:'¢',
        hint:'"In all" means add the two prices.', steps:[`${a}¢ + ${b}¢ = ${t}¢.`, `${A} spends ${cents(t)}.`] }; }),
    T(ALL, (R, l) => { const A = name(R), item = R.pick(ITEMS), have = R.int(l === 1 ? 30 : 60, 99), cost = R.int(10, have - 5), left = have - cost;
      return { q:`${A} has ${have}¢ and buys ${item} for ${cost}¢. How much money does ${A} have left?`, kind:'num', a:left, unit:'¢',
        hint:'Take the cost away from what you had.', steps:[`${have} − ${cost} = ${left}.`, `${A} has ${left}¢ left.`] }; }),
    T(ALL, (R, l) => { const s = coinSet(R, l, false), item = R.pick(ITEMS), A = name(R), price = s.val + R.pick([-15, -10, -5, 5, 10, 15]) > 0 ? s.val + R.pick([-15, -10, -5, 5, 10, 15]) : s.val + 5;
      const ans = s.val >= price ? 'Yes' : 'No';
      return { q:`${A} has the coins shown. Can ${A} buy ${item} that costs ${cents(price)}?`, kind:'choice', a:ans, choices:['Yes','No'], model:{ type:'coins', coins:s.coins },
        hint:'Count the coins, then compare to the price.', steps:[...coinSteps(s.c).slice(-1), s.val >= price ? `${cents(s.val)} is enough for ${cents(price)}.` : `${cents(s.val)} is less than ${cents(price)}.`, `So the answer is ${ans}.`] }; }),
    T(ALL, (R, l) => { const A = name(R), f = R.int(1, l === 1 ? 2 : 4), o = R.int(1, 9), t = R.chance(0.5) && l > 1 ? R.int(1, 3) : 0, total = f * 5 + o + t * 10;
      return { q:`${A} has ${f} five-dollar ${pl(f, 'bills')}${t ? `, ${t} ten-dollar ${pl(t, 'bills')}` : ''} and ${o} one-dollar ${pl(o, 'bills')}. How many dollars does ${A} have?`, kind:'num', a:total, unit:'dollars',
        hint:'Count the biggest bills first, then count on.', steps:[...(t ? [`Ten-dollar bills: ${t} × $10 = $${t * 10}.`] : []), `Five-dollar bills: ${f} × $5 = $${f * 5}.`, `One-dollar bills: $${o}.`, `Total: $${total}.`] }; }),
    T(ALL, (R, l) => { const k = R.pick(['q','d','n']), n = R.int(2, l === 1 ? 4 : 9), v = n * COIN[k][2];
      return { q:`What is the value of ${n} ${COIN[k][1]}? (Answer in cents.)`, kind:'num', a:v, unit:'¢', hint:`Each ${COIN[k][0]} is worth ${COIN[k][2]}¢. Count by ${COIN[k][2]}s.`,
        steps:[`Count by ${COIN[k][2]}s: ${skip(COIN[k][2], n)}.`, `${n} ${COIN[k][1]} = ${v}¢.`] }; }),
    T(ALL, (R, l) => { const pairs = [['n','p'],['d','p'],['d','n'],['q','n'],['q','p']], [big, small] = R.pick(pairs), n = R.int(1, l === 1 ? 3 : 6), a = n * COIN[big][2] / COIN[small][2];
      return { q:`How many ${COIN[small][1]} have the same value as ${n} ${n > 1 ? COIN[big][1] : COIN[big][0]}?`, kind:'num', a,
        hint:`Find the value of the ${COIN[big][1]} first. Then count by ${COIN[small][2]}s.`, steps:[`${n} ${n > 1 ? COIN[big][1] : COIN[big][0]} = ${n * COIN[big][2]}¢.`, `${n * COIN[big][2]} ÷ ${COIN[small][2]} = ${a}.`, `So ${a} ${COIN[small][1]}.`] }; }),
    T(ALL, (R, l) => { const s = coinSet(R, l, true), ans = dol(s.val), v = s.val;
      const ds = [dol(v + 10), dol(v - 10 > 0 ? v - 10 : v + 25), dol(v + 100), dol(v - 1 > 0 ? v - 1 : v + 1)];
      return { q:`Which amount is shown: ${s.c.b} one-dollar ${pl(s.c.b, 'bills')} and ${coinWords(s.c)}?`, kind:'choice', a:ans, choices: choices(ans, R.shuffle(ds)),
        hint:'Bills are the dollars. Coins are the cents after the point.', steps:coinSteps(s.c) }; }),
    T(ALL, (R, l) => { const v = R.int(101, l === 1 ? 199 : 999), ans = dol(v), d = Math.floor(v / 100), c = v % 100;
      return { q:`Which is the same as ${v}¢?`, kind:'choice', a:ans, choices: choices(ans, R.shuffle([`$${v}`, `$${Math.floor(v / 10)}.${v % 10}`, `$${d + 1}.${String(c).padStart(2, '0')}`, `$${d}.${String(c).padStart(2, '0').split('').reverse().join('')}`])),
        hint:'100¢ is $1. The cents go after the dot.', steps:[`${v}¢ = ${d} hundred cents and ${c} cents.`, `${d * 100}¢ = $${d}.`, `So ${v}¢ = ${ans}.`] }; }),
    T(ALL, (R, l) => { const A = name(R), price = R.int(1, 14) * 5, k = Math.ceil(price / 25) + (R.chance(0.4) ? 1 : 0), paid = k * 25, ch = paid - price;
      if (ch === 0) return MONEY[5](R, l);
      return { q:`${A} pays for a ${price}¢ treat with ${k} ${pl(k, 'quarters')}. How much change does ${A} get?`, kind:'num', a:ch, unit:'¢',
        hint:'Find how much the quarters are worth, then subtract the price.', steps:[`${k} quarters = ${paid}¢.`, `${paid} − ${price} = ${ch}.`, `The change is ${ch}¢.`] }; }),
    T(ALL, (R, l) => { const A = name(R), q = R.int(1, 3), d = R.int(1, l === 1 ? 4 : 7), t = q * 25 + d * 10;
      return { q:`${A} has ${q} ${pl(q, 'quarters')} and some dimes. ${A} has ${t}¢ in all. How many dimes does ${A} have?`, kind:'num', a:d,
        hint:'Find the value of the quarters. The rest is dimes.', steps:[`${q} ${pl(q, 'quarters')} = ${q * 25}¢.`, `${t} − ${q * 25} = ${d * 10}¢ in dimes.`, `${d * 10}¢ is ${d} ${pl(d, 'dimes')}.`] }; }),
    T(ALL, (R, l) => { const it = R.pick(['stickers','pencils','erasers','gumballs']), n = R.int(2, l === 1 ? 5 : 9), c = R.pick(l === 1 ? [5, 10] : [5, 10, 15, 20, 25]), t = n * c;
      return { q:`${cap(it)} cost ${c}¢ each. How much do ${n} ${it} cost? (Answer in cents.)`, kind:'num', a:t, unit:'¢',
        hint:`${n} groups of ${c}¢. Skip count or multiply.`, steps:[`Count by ${c}s: ${skip(c, n)}.`, `${n} × ${c}¢ = ${t}¢ (${cents(t)}).`] }; }),
    T(ALL, (R, l) => { const s = coinSet(R, l, false), ans = s.val > 100 ? 'The coins' : s.val < 100 ? 'One dollar' : 'They are the same';
      return { q:'Which is worth more: the coins shown or one dollar?', kind:'choice', a:ans, choices:['The coins','One dollar','They are the same'], model:{ type:'coins', coins:s.coins },
        hint:'One dollar is 100¢. Count the coins and compare.', steps:[...coinSteps(s.c).slice(-1), `$1 = 100¢.`, `So the answer is: ${ans.toLowerCase()}.`] }; }),
    T(L23, (R, l) => { const A = name(R), n = R.int(2, 5), q = R.int(2, 9), t = n * q;
      return { q:`${A} and ${n - 1} ${pl(n - 1, 'friends')} share $${t} equally. How many dollars does each person get?`, kind:'num', a:q, unit:'dollars',
        hint:`Count the people: ${A} plus ${n - 1} ${pl(n - 1, 'friends')}. Then divide.`, steps:[`There are ${n} people.`, `$${t} ÷ ${n} = $${q}.`, `Each person gets $${q}.`] }; })
  ];
  M['g3.money'] = { name:'Counting money & making change', unit:'g3u8', gen(R, lvl){ return run(MONEY, R, lvl); } };

  // ======================= g3.time =======================
  const tstr = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  const addMin = (h, m, add) => { let t = ((h % 12) * 60 + m + add) % 720; if (t < 0) t += 720; let hh = Math.floor(t / 60); if (hh === 0) hh = 12; return [hh, t % 60]; };
  const ap = t => { t = ((t % 1440) + 1440) % 1440; const hh = Math.floor(t / 60), mm = t % 60, h12 = hh % 12 || 12; return `${tstr(h12, mm)} ${hh < 12 ? 'a.m.' : 'p.m.'}`; };
  function clockT(R, l, any){ const h = R.int(1, 12), m = (l === 1 && !any && R.chance(0.6)) ? R.int(0, 11) * 5 : R.int(0, 59); return [h, m]; }
  const dur = mins => { const h = Math.floor(mins / 60), m = mins % 60; return (h ? `${h} ${pl(h, 'hours')}` : '') + (h && m ? ' and ' : '') + (m ? `${m} ${pl(m, 'minutes')}` : ''); };
  function readSteps(h, m){ const mark = Math.floor(m / 5), extra = m % 5;
    return [m === 0 ? `The short hand points to ${h}.` : `The short hand is just past the ${h}, so the hour is ${h}.`,
      extra ? `The long hand is ${extra} mark${extra > 1 ? 's' : ''} past the ${mark || 12}. Count by 5s to ${mark * 5}, then add ${extra}: ${m} minutes.`
            : m === 0 ? `The long hand points to 12. That means 0 minutes, "o'clock".` : `The long hand points to the ${mark}. Count by 5s: ${m} minutes.`]; }
  function readDs(h, m){ const nextH = h === 12 ? 1 : h + 1, prevH = h === 1 ? 12 : h - 1, mark = Math.floor(m / 5), sw = [Math.round(m / 5) % 12 || 12, (h * 5) % 60];
    return [tstr(nextH, m), m >= 5 ? tstr(h, mark) : tstr(h, 30), m >= 30 ? tstr(nextH, m) : tstr(prevH, m), tstr(sw[0], sw[1]), tstr(h, (m + 5) % 60), tstr(h, (m + 55) % 60)]; }
  const ACTS = [['eats breakfast', 6, 8, 'a.m.'], ['gets on the school bus', 7, 8, 'a.m.'], ['has morning recess', 9, 10, 'a.m.'], ['wakes up', 6, 7, 'a.m.'], ['eats dinner', 5, 7, 'p.m.'],
    ['goes to bed', 7, 9, 'p.m.'], ['plays outside after school', 3, 5, 'p.m.'], ['takes a bath before bed', 7, 8, 'p.m.'], ['eats an after-school snack', 3, 4, 'p.m.'], ['walks the dog before school', 6, 7, 'a.m.']];
  const EVENTS = ['soccer practice','a movie','a trip to the zoo','a birthday party','a baseball game','art class','swim lessons','a piano lesson','the school play','a bike ride'];
  const TIME = [
    T(ALL, (R, l) => { const [h, m] = clockT(R, l), ans = tstr(h, m);
      return { q:'What time does the clock show?', kind:'choice', a:ans, choices: choices(ans, readDs(h, m)), model:{ type:'clock', h, m },
        hint:'The short hand tells the hour. The long hand tells the minutes: count by 5s for each number.', steps:[...readSteps(h, m), `The time is ${ans}.`] }; }),
    T(ALL, (R, l) => { const [h, m] = clockT(R, l, true), ans = tstr(h, m);
      return { q:'What time is it? Read the clock to the minute.', kind:'choice', a:ans, choices: choices(ans, R.shuffle(readDs(h, m))), model:{ type:'clock', h, m },
        hint:'Count by 5s to the last number the long hand passed. Then count the little marks by 1s.', steps:[...readSteps(h, m), `The time is ${ans}.`] }; }),
    T(ALL, (R, l) => { const [h, m] = clockT(R, l);
      return { q:'How many minutes after the hour does the clock show?', kind:'num', a:m, unit:'minutes', model:{ type:'clock', h, m },
        hint:'Look only at the long hand. Count by 5s, then count any extra marks.', steps:[readSteps(h, m)[1], `So it is ${m} minutes after ${h}.`] }; }),
    T(ALL, (R, l) => { let [h, m] = clockT(R, l); if (m > 50) m = R.int(1, 50);
      return { q:'What hour is it? Look at the short hand.', kind:'num', a:h, model:{ type:'clock', h, m },
        hint:'The short hand points to the hour, or is just past it. Use the number it has passed.', steps:[readSteps(h, m)[0], `The hour is ${h}.`] }; }),
    T(ALL, (R, l) => { const [h, m] = clockT(R, l), add = R.pick(l === 1 ? [5, 10, 15, 30] : [10, 15, 20, 25, 35, 40, 45]), [eh, em] = addMin(h, m, add), ans = tstr(eh, em);
      return { q:`What time will it be in ${add} minutes?`, kind:'choice', a:ans, model:{ type:'clock', h, m },
        choices: choices(ans, [tstr(...addMin(h, m, add + 5)), tstr(...addMin(h, m, add - 5)), tstr(...addMin(h, m, add + 60)), tstr(...addMin(h, m, -add))]),
        hint:'Read the clock first. Then count on the minutes.', steps:[`The clock shows ${tstr(h, m)}.`, `Count on ${add} minutes.`, `${tstr(h, m)} + ${add} minutes = ${ans}.`] }; }),
    T(ALL, (R, l) => { const [h, m] = clockT(R, l), add = R.pick(l === 1 ? [5, 10, 15, 30] : [10, 15, 20, 25, 40]), [eh, em] = addMin(h, m, -add), ans = tstr(eh, em);
      return { q:`What time was it ${add} minutes ago?`, kind:'choice', a:ans, model:{ type:'clock', h, m },
        choices: choices(ans, [tstr(...addMin(h, m, add)), tstr(...addMin(h, m, -add - 5)), tstr(...addMin(h, m, -add + 5)), tstr(...addMin(h, m, -add - 60))]),
        hint:'Read the clock first. Then count back the minutes.', steps:[`The clock shows ${tstr(h, m)}.`, `Count back ${add} minutes.`, `It was ${ans}.`] }; }),
    T(ALL, (R, l) => { const [h, m] = clockT(R, l), k = R.int(1, l === 1 ? 2 : 4), [eh, em] = addMin(h, m, k * 60), ans = tstr(eh, em);
      return { q:`What time will it be ${k} ${pl(k, 'hours')} after the time on the clock?`, kind:'choice', a:ans, model:{ type:'clock', h, m },
        choices: choices(ans, [tstr(...addMin(h, m, (k + 1) * 60)), tstr(...addMin(h, m, k * 60 + 10)), tstr(...addMin(h, m, k)), tstr(...addMin(h, m, (k - 1) * 60 || -60))]),
        hint:'Only the hour changes. The minutes stay the same.', steps:[`The clock shows ${tstr(h, m)}.`, `Add ${k} ${pl(k, 'hours')} to the hour.`, `It will be ${ans}.`] }; }),
    T(ALL, (R, l) => { const h = R.int(1, 12), m = R.pick([0, 15, 30, 45]), nh = h === 12 ? 1 : h + 1;
      const W = { 0:`${h} o'clock`, 15:`quarter past ${h}`, 30:`half past ${h}`, 45:`quarter to ${nh}` }, ans = W[m];
      return { q:'Which words tell the time on the clock?', kind:'choice', a:ans, model:{ type:'clock', h, m }, choices: choices(ans, R.shuffle(Object.values(W).filter(x => x !== ans).concat([`quarter to ${h}`]))),
        hint:'Quarter past = 15 minutes after. Half past = 30 minutes after. Quarter to = 15 minutes before the next hour.', steps:[...readSteps(h, m), `${tstr(h, m)} is ${ans}.`] }; }),
    T(ALL, (R, l) => { let [h, m] = clockT(R, l); if (m === 0) m = 5 * R.int(1, 11);
      return { q:'How many minutes until the next hour?', kind:'num', a:60 - m, unit:'minutes', model:{ type:'clock', h, m },
        hint:'There are 60 minutes in an hour. How many minutes have gone by?', steps:[`The clock shows ${tstr(h, m)}.`, `60 − ${m} = ${60 - m}.`, `${60 - m} minutes until ${(h % 12) + 1}:00.`] }; }),
    T(ALL, (R, l) => { const h = R.int(1, 12), k = R.int(1, 11), m = k * 5, ans = `the ${k}`;
      return { q:`At ${tstr(h, m)}, which number does the minute hand point to?`, kind:'choice', a:ans, choices: choices(ans, R.shuffle([`the ${h}`, `the ${m > 12 ? Math.floor(m / 10) : (k % 12) + 1}`, `the ${(k + 1) % 12 || 12}`, `the ${(k + 11) % 12 || 12}`])),
        hint:'Each number on the clock is 5 more minutes. Count by 5s.', steps:[`Count by 5s: ${skip(5, k)}.`, `${m} minutes is ${k} numbers past 12.`, `The minute hand points to ${ans}.`] }; }),
    T(ALL, (R, l) => { const a = R.pick(ACTS), A = name(R), h = R.int(a[1], a[2]), m = R.int(0, 11) * 5;
      return { q:`${A} ${a[0]} at ${tstr(h, m)}. Is that a.m. or p.m.?`, kind:'choice', a:a[3], choices:['a.m.','p.m.'],
        hint:'a.m. is from midnight to noon (morning). p.m. is from noon to midnight (afternoon and night).', steps:[`${cap(a[0].replace(/s\b/, ''))} happens in the ${a[3] === 'a.m.' ? 'morning' : 'afternoon or evening'}.`, `So it is ${a[3]}.`] }; }),
    T(ALL, (R, l) => { const a = R.pick(ACTS), h = R.int(a[1], a[2]), m = R.int(0, 3) * 15, ans = `${tstr(h, m)} ${a[3]}`, other = a[3] === 'a.m.' ? 'p.m.' : 'a.m.';
      const h2 = ((h + 5) % 12) || 12;
      return { q:`Which is the best time for a child who ${a[0]}?`, kind:'choice', a:ans, choices: choices(ans, [`${tstr(h, m)} ${other}`, `${tstr(h2, m)} ${other}`]),
        hint:'Think about whether it happens in the morning or the evening.', steps:[`This happens in the ${a[3] === 'a.m.' ? 'morning, which is a.m.' : 'afternoon or evening, which is p.m.'}`, `${ans} makes sense.`] }; }),
    T(L23, (R, l) => { const h = R.int(1, 11), m = l === 2 ? R.int(0, 6) * 5 : R.int(0, 59), d = l === 2 ? R.int(1, 4) * 5 + R.pick([0, 15, 30]) : R.int(11, 55);
      const sm = h * 60 + m, e = sm + d, A = name(R), ev = R.pick(EVENTS);
      return { q:`${cap(ev)} starts at ${tstr(h, m)} and ends at ${tstr(...addMin(h, m, d))}. How many minutes long is it?`, kind:'num', a:d, unit:'minutes',
        hint:'Count on from the start time to the end time. Jump to the next 5 or 10, then keep going.', steps:[`Start at ${tstr(h, m)}.`, `Count on to ${tstr(...addMin(h, m, d))}.`, `That is ${d} minutes.`] }; }),
    T(ALL, (R, l) => { const h = R.int(1, 10), m = l === 1 ? R.pick([0, 30]) : l === 2 ? R.pick([0, 15, 30, 45]) : R.int(0, 11) * 5;
      const dm = l === 1 ? R.int(1, 3) * 60 : l === 2 ? R.pick([60, 90, 120, 30, 45, 150]) : R.pick([75, 95, 110, 140, 50, 125]);
      const [eh, em] = addMin(h, m, dm), ans = tstr(eh, em), ev = R.pick(EVENTS);
      return { q:`${cap(ev)} starts at ${tstr(h, m)} and lasts ${dur(dm)}. What time does it end?`, kind:'choice', a:ans, model:{ type:'clock', h, m },
        choices: choices(ans, [tstr(...addMin(h, m, dm + 60)), tstr(...addMin(h, m, dm - 60 > 0 ? dm - 60 : dm + 30)), tstr(...addMin(h, m, dm + 30)), tstr(...addMin(h, m, dm - 15))]),
        hint:'Start at the beginning time. Jump ahead the hours first, then the minutes.', steps:[`Start at ${tstr(h, m)}.`, `Add ${dur(dm)}.`, `It ends at ${ans}.`] }; }),
    T(ALL, (R, l) => { const h = R.int(2, 11), m = l === 1 ? R.pick([0, 30]) : R.int(0, 11) * 5, dm = l === 1 ? R.int(1, 3) * 60 : R.pick([30, 45, 60, 90, 75, 120, 20, 105]);
      const [sh, sm] = addMin(h, m, -dm), ans = tstr(sh, sm), A = name(R), ev = R.pick(EVENTS);
      return { q:`${cap(ev)} ended at ${tstr(h, m)} and lasted ${dur(dm)}. What time did it start?`, kind:'choice', a:ans,
        choices: choices(ans, [tstr(...addMin(h, m, dm)), tstr(...addMin(h, m, -dm - 60)), tstr(...addMin(h, m, -dm + 30)), tstr(...addMin(h, m, -dm - 15))]),
        hint:'Count BACK from the end time.', steps:[`End at ${tstr(h, m)}.`, `Go back ${dur(dm)}.`, `It started at ${ans}.`] }; }),
    T(ALL, (R, l) => { const h = R.int(1, 11), m = R.int(1, 11) * 5, A = name(R), ans = tstr(h, m), ev = R.pick(['recess','lunch','reading time','music class']);
      return { q:`The number line shows minutes after ${h}:00. ${A}'s ${ev} starts at the dot. What time does it start?`, kind:'choice', a:ans,
        model:{ type:'numberline', min:0, max:60, step:5, label:10, points:[{ x:m, label:'' }] }, choices: choices(ans, [tstr(h, m + 5 > 59 ? m - 5 : m + 5), tstr(h, m - 5 < 0 ? m + 10 : m - 5), tstr(h + 1, m), tstr(h, Math.floor(m / 10))]),
        hint:'Each small jump is 5 minutes. Count from 0 to the dot.', steps:[`The dot is at ${m} on the number line.`, `${m} minutes after ${h}:00 is ${ans}.`] }; }),
    T(ALL, (R, l) => { const h = R.int(1, 11), a = R.int(0, 6) * 5, b = a + R.int(2, 6) * 5, d = b - a;
      return { q:`The number line shows minutes after ${h}:00. Recess starts at the first dot and ends at the second dot. How many minutes long is recess?`, kind:'num', a:d, unit:'minutes',
        model:{ type:'numberline', min:0, max:60, step:5, label:10, points:[{ x:a, label:'start' }, { x:b, label:'end' }] },
        hint:'Count the 5-minute jumps from one dot to the other.', steps:[`Start: ${tstr(h, a)}. End: ${tstr(h, b)}.`, `${b} − ${a} = ${d}.`, `Recess is ${d} minutes long.`] }; }),
    T(ALL, (R, l) => { const [h, m] = clockT(R, l, true), add = R.pick(l === 1 ? [10, 15, 30] : [20, 25, 35, 40, 45]), [eh, em] = addMin(h, m, add), ans = tstr(eh, em), A = name(R);
      return { q:`The clock shows when ${A} started cleaning. ${A} cleaned for ${add} minutes. When did ${A} finish?`, kind:'choice', a:ans, model:{ type:'clock', h, m },
        choices: choices(ans, [tstr(...addMin(h, m, add + 10)), tstr(...addMin(h, m, add - 10)), tstr(...addMin(h, m, add + 60))]),
        hint:'Read the start time on the clock. Then count on.', steps:[`Start: ${tstr(h, m)}.`, `Count on ${add} minutes.`, `${A} finished at ${ans}.`] }; }),
    T(ALL, (R, l) => { const h = R.int(1, 12); let a = R.int(0, 59), b = R.int(0, 59); while (b === a) b = R.int(0, 59);
      const sa = tstr(h, a), sb = tstr(h, b), ans = a > b ? sa : sb;
      return { q:`Which time is later: ${sa} or ${sb}?`, kind:'choice', a:ans, choices:[sa, sb], hint:'Same hour, so compare the minutes.', steps:[`Both are in the ${h} o'clock hour.`, `${Math.max(a, b)} minutes is more than ${Math.min(a, b)} minutes.`, `${ans} is later.`] }; }),
    T(ALL, (R, l) => { const k = R.int(0, 4);
      const Q = [[`How many minutes are in ${l === 1 ? 1 : 2} ${l === 1 ? 'hour' : 'hours'}?`, (l === 1 ? 1 : 2) * 60, 'There are 60 minutes in 1 hour.'], ['How many minutes are in half an hour?', 30, 'Half of 60 is 30.'],
        ['How many hours are in one day?', 24, 'A day has 12 a.m. hours and 12 p.m. hours.'], ['How many minutes are in a quarter of an hour?', 15, 'A quarter of 60 is 15.'], [`How many minutes are in 1 hour and ${l === 1 ? 10 : 25} minutes?`, l === 1 ? 70 : 85, 'Start with 60 minutes, then add the extra minutes.']][k];
      return { q:Q[0], kind:'num', a:Q[1], hint:Q[2], steps:[Q[2], `The answer is ${Q[1]}.`] }; }),
    T(ALL, (R, l) => { const ev = R.shuffle(['Reading','Math','Lunch','Recess','Art','Science']).slice(0, 3); let t = R.int(8, 10) * 60 + R.pick([0, 15, 30]); const rows = [];
      ev.forEach(e => { const d = R.pick(l === 1 ? [30, 60] : [25, 30, 35, 40, 45, 50]); rows.push([e, ap(t), ap(t + d), d]); t += d; });
      const i = R.int(0, 2);
      return { q:`Look at the schedule. How many minutes long is ${rows[i][0]}?`, kind:'num', a:rows[i][3], unit:'minutes', model:{ type:'table', head:['Class','Starts','Ends'], rows:rows.map(r => r.slice(0, 3)) },
        hint:'Count on from the start time to the end time.', steps:[`${rows[i][0]} starts at ${rows[i][1]} and ends at ${rows[i][2]}.`, `Count on: that is ${rows[i][3]} minutes.`] }; }),
    T(ALL, (R, l) => { const h = R.int(1, 12), m = R.int(1, 11) * 5 + (l === 1 ? 0 : R.int(0, 4)), nh = h === 12 ? 1 : h + 1, ans = `${m} minutes after ${h}`;
      return { q:'Which words tell the time on the clock?', kind:'choice', a:ans, model:{ type:'clock', h, m }, choices: choices(ans, [`${m} minutes after ${nh}`, `${60 - m} minutes after ${h}`, `${h} minutes after ${Math.round(m / 5) || 12}`]),
        hint:'The hour is the number the short hand has passed. Then count the minutes.', steps:[...readSteps(h, m), `It is ${tstr(h, m)}, or ${ans}.`] }; }),
    T(L3, (R, l) => { const s = R.int(9, 11) * 60 + R.int(0, 11) * 5, d = R.pick([90, 105, 120, 135, 150, 165, 180, 75]), e = s + d, ev = R.pick(EVENTS);
      return { q:`${cap(ev)} goes from ${ap(s)} to ${ap(e)}. How long is that?`, kind:'choice', a:dur(d), choices: choices(dur(d), [dur(d + 60), dur(d - 30), dur(d + 15), dur(d - 60)]),
        hint:'Count the whole hours first, then the extra minutes. Noon is 12:00 p.m.', steps:[`Start at ${ap(s)}.`, `Count whole hours: ${Math.floor(d / 60)} ${pl(Math.floor(d / 60), 'hours')} gets to ${ap(s + Math.floor(d / 60) * 60)}.`, ...(d % 60 ? [`Then ${d % 60} more minutes gets to ${ap(e)}.`] : []), `It lasts ${dur(d)}.`] }; }),
    T(L3, (R, l) => { const s = R.int(10, 11) * 60 + R.int(0, 11) * 5, d = R.pick([60, 90, 120, 150, 75, 105]), e = s + d, A = name(R);
      return { q:`${A} leaves for the park at ${ap(s)} and stays ${dur(d)}. What time does ${A} leave the park?`, kind:'choice', a:ap(e), choices: choices(ap(e), [ap(e).replace(/[ap]\.m\./, m => m === 'a.m.' ? 'p.m.' : 'a.m.'), ap(e + 60), ap(e - 30)]),
        hint:'Add the hours, then the minutes. Watch for noon: after 11:59 a.m. comes 12:00 p.m.', steps:[`Start at ${ap(s)}.`, `Add ${dur(d)}.`, `${A} leaves at ${ap(e)}.`] }; })
  ];
  M['g3.time'] = { name:'Telling time & elapsed time', unit:'g3u8', gen(R, lvl){ return run(TIME, R, lvl); } };

  // ======================= perimeter & area shared =======================
  const LU = { cm:'centimeters', in:'inches', ft:'feet', m:'meters', yd:'yards' };
  const LUNIT = ['cm','in','ft','m'];
  // side-length labels outside each edge (works for any simple polygon, convex or not)
  function edgeLabels(pts, texts, inside){
    let a2 = 0; for (let i = 0; i < pts.length; i++){ const p = pts[i], q = pts[(i + 1) % pts.length]; a2 += p[0] * q[1] - q[0] * p[1]; }
    const sg = a2 > 0 ? 1 : -1, out = [];
    texts.forEach((t, i) => { if (t == null || t === '') return; const p = pts[i], q = pts[(i + 1) % pts.length], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      const f = inside && inside.includes(i) ? -1.25 : 1, nx = f * sg * dy / L, ny = -f * sg * dx / L;
      out.push([Math.round((p[0] + q[0]) / 2 + nx * (12 + Math.abs(nx) * 13)), Math.round((p[1] + q[1]) / 2 + ny * 14 + 5), t]); });
    return out;
  }
  const reg = (n, r) => [...Array(n)].map((_, i) => [Math.round(100 + r * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / n)), Math.round(100 + r * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / n))]);
  const PSHAPES = {
    3:[{ nm:'triangle', pts:[[100,35],[160,160],[40,160]] }, { nm:'triangle', pts:[[60,35],[60,160],[160,160]], right:[1] }, { nm:'triangle', pts:[[55,150],[90,40],[165,135]] }],
    4:[{ nm:'quadrilateral', pts:[[60,45],[150,35],[160,160],[50,145]] }, { nm:'trapezoid', pts:[[75,45],[130,45],[160,155],[45,155]] }, { nm:'parallelogram', pts:[[80,50],[165,50],[125,150],[40,150]] }],
    5:[{ nm:'pentagon', pts:reg(5, 62) }, { nm:'pentagon', pts:[[60,45],[145,40],[160,115],[100,165],[45,120]] }],
    6:[{ nm:'hexagon', pts:reg(6, 62) }, { nm:'hexagon', pts:[[60,55],[115,35],[155,70],[150,145],[95,165],[48,130]] }]
  };
  // side lengths that can really make the drawn shape: triangle inequality, Pythagorean right triangles, equal opposite sides
  const TRIPLES = [[3,4,5],[6,8,10],[5,12,13],[9,12,15],[8,15,17],[12,16,20],[4,3,5],[8,6,10]];
  function sidesFor(sh, R, l){
    const n = sh.pts.length;
    if (sh.right){ const t = R.pick(l === 1 ? TRIPLES.filter(x => x[2] <= 10) : TRIPLES); return [t[0], t[1], t[2]]; }
    if (sh.nm === 'parallelogram'){ const a = psz(R, l), b = psz(R, l); return [a, b, a, b]; }
    if (sh.nm === 'trapezoid'){ const top = psz(R, l), d = R.int(1, 3), leg = d + R.int(1, 4); return [top, leg, top + 2 * d, leg]; }
    let s; do { s = sh.pts.map(() => psz(R, l)); } while (2 * Math.max(...s) >= sum(s) || (n === 3 && new Set(s).size === 1));
    return s;
  }
  const PNAME = { 3:'triangle', 4:'quadrilateral', 5:'pentagon', 6:'hexagon', 7:'heptagon', 8:'octagon' };
  // a rectilinear L or notched shape, drawn to scale, with every side labelled
  function lShape(R, l){
    let W, H; do { W = R.int(4, l === 1 ? 8 : 12); H = R.int(4, l === 1 ? 8 : 10); } while (W > 1.6 * H || H > 1.6 * W);
    const cw = R.int(Math.ceil(W / 3), Math.floor(2 * W / 3)), ch = R.int(Math.ceil(H / 3), Math.floor(2 * H / 3)); // cut a cw × ch corner off the top right
    const s = Math.min(115 / W, 115 / H), x0 = 100 - W * s / 2, y0 = 97 - H * s / 2, X = v => Math.round(x0 + v * s), Y = v => Math.round(y0 + v * s);
    const g = [[0,0],[W - cw,0],[W - cw,ch],[W,ch],[W,H],[0,H]], lens = [W - cw, ch, cw, H - ch, W, H];
    return { g, lens, pts:g.map(p => [X(p[0]), Y(p[1])]), W, H, cw, ch, area:W * H - cw * ch, per:2 * (W + H) };
  }
  // labels for an L shape: outer sides outside; the two inner sides of the cut near their far ends, so they never collide
  function lLabels(sh, labs){
    const out = edgeLabels(sh.pts, labs.map((t, i) => i === 1 || i === 2 ? '' : t)), p = sh.pts;
    if (labs[1]) out.push([p[1][0] + 22, p[1][1] + 16, labs[1]]);
    if (labs[2]) out.push([Math.round((p[2][0] + p[3][0]) / 2), p[2][1] + 20, labs[2]]);
    return out;
  }
  // a shape made of unit squares (no holes), drawn as squares with an SVG path
  function polyomino(R, n, maxW){
    for (let tries = 0; tries < 60; tries++){
      const cells = new Set(['0,0']); const key = (x, y) => x + ',' + y;
      while (cells.size < n){ const [x, y] = R.pick([...cells]).split(',').map(Number), [dx, dy] = R.pick([[1,0],[-1,0],[0,1],[0,-1]]); cells.add(key(x + dx, y + dy)); }
      const pts = [...cells].map(c => c.split(',').map(Number)), xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      const mx = Math.min(...xs), my = Math.min(...ys), w = Math.max(...xs) - mx + 1, h = Math.max(...ys) - my + 1;
      if (w > maxW || h > maxW || w * h === n) continue; // keep it non-rectangular and small enough
      const grid = pts.map(p => [p[0] - mx, p[1] - my]), has = (x, y) => grid.some(p => p[0] === x && p[1] === y);
      // no holes: flood fill the outside of a padded box
      const seen = new Set(), st = [[-1, -1]];
      while (st.length){ const [x, y] = st.pop(), k = key(x, y); if (seen.has(k) || x < -1 || y < -1 || x > w || y > h || has(x, y)) continue; seen.add(k); st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); }
      if (seen.size + n !== (w + 2) * (h + 2)) continue;
      let per = 0; grid.forEach(([x, y]) => { [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => { if (!has(x + dx, y + dy)) per++; }); });
      const s = Math.min(30, 160 / Math.max(w, h)), ox = 100 - w * s / 2, oy = 97 - h * s / 2;
      const curve = grid.map(([x, y]) => `M${(ox + x * s).toFixed(1)} ${(oy + y * s).toFixed(1)}h${s.toFixed(1)}v${s.toFixed(1)}h${(-s).toFixed(1)}Z`).join('');
      return { n, per, w, h, model:{ type:'polygon', curve } };
    }
    return null;
  }

  // ======================= g3.perimeter =======================
  function psz(R, l){ return l === 1 ? R.int(2, 9) : l === 2 ? R.int(3, 15) : R.int(5, 25); }
  const PERIM = [
    T(ALL, (R, l) => { const u = R.pick(LUNIT), w = R.int(2, l === 1 ? 9 : 12), h = R.int(2, l === 1 ? 8 : 10), P = 2 * (w + h);
      return { q:'What is the perimeter of this rectangle?', kind:'num', a:P, unit:u, model:{ type:'rect', w, h, unit:u },
        hint:'Perimeter is the distance all the way around. A rectangle has 4 sides: two long, two short.', steps:[`The sides are ${w}, ${h}, ${w} and ${h}.`, `Add them: ${w} + ${h} + ${w} + ${h} = ${P}.`, `The perimeter is ${P} ${u}.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT), s = psz(R, l), P = 4 * s;
      return { q:`What is the total distance around a square if each side measures ${s} ${LU[u]}?`, kind:'num', a:P, unit:u,
        hint:'A square has 4 sides that are all the same length. Add all 4.', steps:[`4 sides, each ${s} ${u}.`, `${s} + ${s} + ${s} + ${s} = 4 × ${s} = ${P}.`, `The distance around is ${P} ${u}.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT), s = psz(R, l), P = 4 * s, pts = [[55,40],[145,40],[145,130],[55,130]];
      return { q:'All four sides of this square are the same length. What is its perimeter?', kind:'num', a:P, unit:u,
        model:{ type:'polygon', pts, right:[0,1,2,3], labels:edgeLabels(pts, [`${s} ${u}`]) },
        hint:'Only one side is labelled, but all 4 sides are the same.', steps:[`Each side is ${s} ${u}.`, `4 × ${s} = ${P}.`, `The perimeter is ${P} ${u}.`] }; }),
    ...[3, 4, 5, 6].map(n => T(n <= 4 ? ALL : n === 5 ? ALL : L23, (R, l) => { const u = R.pick(LUNIT), sh = R.pick(PSHAPES[n]), sides = sidesFor(sh, R, l), P = sum(sides);
      return { q:`What is the perimeter of this ${sh.nm}?`, kind:'num', a:P, unit:u, model:{ type:'polygon', pts:sh.pts, right:sh.right, labels:edgeLabels(sh.pts, sides.map(s => `${s} ${u}`)) },
        hint:'Add up all the side lengths. Check off each one as you add it.', steps:[`There are ${n} sides to add.`, `${sides.join(' + ')} = ${P}.`, `The perimeter is ${P} ${u}.`] }; })),
    T(ALL, (R, l) => { const n = R.pick(l === 1 ? [3, 4] : [3, 4, 5, 6]), u = R.pick(LUNIT), sh = R.pick(PSHAPES[n]), sides = sidesFor(sh, R, l), P = sum(sides), i = R.int(0, n - 1);
      return { q:`The perimeter of this ${sh.nm} is ${P} ${u}. How long is the side marked "?"`, kind:'num', a:sides[i], unit:u,
        model:{ type:'polygon', pts:sh.pts, right:sh.right, labels:edgeLabels(sh.pts, sides.map((s, j) => j === i ? '?' : `${s} ${u}`)) },
        hint:'Add the sides you know. Then subtract from the perimeter.', steps:[`Known sides: ${sides.filter((_, j) => j !== i).join(' + ')} = ${P - sides[i]}.`, `${P} − ${P - sides[i]} = ${sides[i]}.`, `The missing side is ${sides[i]} ${u}.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT); let w = R.int(3, l === 1 ? 9 : 14), h = R.int(2, l === 1 ? 8 : 12); if (h > w) [w, h] = [h, w]; const P = 2 * (w + h);
      return { q:`A rectangle has a perimeter of ${P} ${u}. Its length is ${w} ${u}. What is its width?`, kind:'num', a:h, unit:u, hint:'The two lengths use up part of the perimeter. The two widths share what is left.',
        steps:[`Two lengths: ${w} + ${w} = ${2 * w}.`, `What is left: ${P} − ${2 * w} = ${P - 2 * w}.`, `Two widths share that: ${P - 2 * w} ÷ 2 = ${h}.`, `The width is ${h} ${u}.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT), s = R.int(2, l === 1 ? 5 : 10), P = 4 * s;
      return { q:`A square has a perimeter of ${P} ${u}. How long is one side?`, kind:'num', a:s, unit:u, model:{ type:'polygon', shape:'square' },
        hint:'A square has 4 equal sides. Split the perimeter into 4 equal parts.', steps:[`4 equal sides make ${P} ${u}.`, `${P} ÷ 4 = ? Think 4 × ? = ${P}.`, `4 × ${s} = ${P}, so each side is ${s} ${u}.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT), s = psz(R, l), P = 3 * s;
      return { q:`Each side of a triangle is ${s} ${LU[u]} long. All three sides are the same. What is the perimeter?`, kind:'num', a:P, unit:u, model:{ type:'polygon', shape:'triangle' },
        hint:'Add the same side 3 times, or multiply by 3.', steps:[`3 sides, each ${s}.`, `${s} + ${s} + ${s} = ${P}.`, `The perimeter is ${P} ${u}.`] }; }),
    T(ALL, (R, l) => { const n = R.pick([5, 6, 8]), u = R.pick(LUNIT), s = R.int(2, l === 1 ? 5 : 10), P = n * s;
      return { q:`${n === 8 ? "An" : "A"} ${PNAME[n]} has ${n} sides that are all ${s} ${LU[u]} long. What is its perimeter?`, kind:'num', a:P, unit:u, model:{ type:'polygon', shape:PNAME[n] },
        hint:`Every side is the same, so add ${s} once for each of the ${n} sides.`, steps:[`${n} sides × ${s} ${u}.`, `${n} × ${s} = ${P}.`, `The perimeter is ${P} ${u}.`] }; }),
    T(ALL, (R, l) => { const A = name(R), w = R.int(3, l === 1 ? 9 : 20), h = R.int(2, l === 1 ? 8 : 15), P = 2 * (w + h);
      return { q:`${A} puts a fence around a garden that is ${w} feet long and ${h} feet wide. How many feet of fence does ${A} need?`, kind:'num', a:P, unit:'feet',
        hint:'The fence goes all the way around: two lengths and two widths.', steps:[`${w} + ${h} + ${w} + ${h}.`, `= ${P}.`, `${A} needs ${P} feet of fence.`] }; }),
    T(ALL, (R, l) => { const A = name(R), w = R.int(4, l === 1 ? 10 : 20), h = R.int(3, l === 1 ? 8 : 15), P = 2 * (w + h);
      return { q:`${A} glues ribbon around the edge of a picture that is ${w} inches wide and ${h} inches tall. How many inches of ribbon does ${A} use?`, kind:'num', a:P, unit:'inches',
        hint:'Ribbon around the edge is the perimeter.', steps:[`Two widths: ${w} + ${w} = ${2 * w}.`, `Two heights: ${h} + ${h} = ${2 * h}.`, `${2 * w} + ${2 * h} = ${P} inches.`] }; }),
    T(ALL, (R, l) => { const A = name(R), sides = [psz(R, l), psz(R, l), psz(R, l), psz(R, l)].map(x => x * (l === 3 ? 10 : 1)), P = sum(sides);
      return { q:`${A} walks all the way around a park. The four sides are ${sides.slice(0, 3).join(', ')} and ${sides[3]} meters long. How far does ${A} walk?`, kind:'num', a:P, unit:'meters',
        hint:'Walking all the way around means add every side.', steps:[`${sides.join(' + ')} = ${P}.`, `${A} walks ${P} meters.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT), w = R.int(2, l === 1 ? 9 : 15), h = R.int(2, l === 1 ? 9 : 15), P = 2 * (w + h);
      return { q:`A rectangle is ${w} ${u} long and ${h} ${u} wide. What is its perimeter?`, kind:'num', a:P, unit:u,
        hint:'Add all four sides: length + width + length + width.', steps:[`${w} + ${h} + ${w} + ${h} = ${P}.`, `The perimeter is ${P} ${u}.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT), sh = lShape(R, l), labs = sh.lens.map(x => `${x} ${u}`);
      return { q:'What is the perimeter of this shape?', kind:'num', a:sh.per, unit:u, model:{ type:'polygon', pts:sh.pts, right:[0,5], labels:lLabels(sh, labs) },
        hint:'Start at one corner and add every side as you go around.', steps:[`There are 6 sides.`, `${sh.lens.join(' + ')} = ${sh.per}.`, `The perimeter is ${sh.per} ${u}.`] }; }),
    T(L23, (R, l) => { const u = R.pick(LUNIT), sh = lShape(R, l), labs = sh.lens.map((x, i) => i === 1 || i === 2 ? '' : `${x} ${u}`);
      return { q:'Two sides are not labelled. What is the perimeter of this shape?', kind:'num', a:sh.per, unit:u, model:{ type:'polygon', pts:sh.pts, right:[0,5], labels:lLabels(sh, labs) },
        hint:'The short sides add up to the long side across from them. Find the missing sides first.',
        steps:[`Missing across: ${sh.W} − ${sh.W - sh.cw} = ${sh.cw}.`, `Missing up and down: ${sh.H} − ${sh.H - sh.ch} = ${sh.ch}.`, `${sh.lens.join(' + ')} = ${sh.per}.`, `The perimeter is ${sh.per} ${u}.`] }; }),
    T(ALL, (R, l) => { const w = R.int(2, l === 1 ? 6 : 9), h = R.int(2, l === 1 ? 5 : 8), P = 2 * (w + h);
      return { q:'Each small square is 1 unit long. What is the perimeter of the rectangle?', kind:'num', a:P, unit:'units', model:{ type:'rect', w, h, grid:true },
        hint:'Count the unit sides all the way around the outside edge, not the squares inside.', steps:[`Top and bottom: ${w} + ${w} = ${2 * w}.`, `Left and right: ${h} + ${h} = ${2 * h}.`, `${2 * w} + ${2 * h} = ${P} units.`] }; }),
    T(ALL, (R, l) => { const p = polyomino(R, R.int(l === 1 ? 4 : 5, l === 1 ? 6 : 9), 4);
      if (!p) return PERIM[0](R, l);
      return { q:'Each square has sides 1 unit long. What is the perimeter of the shape?', kind:'num', a:p.per, unit:'units', model:p.model,
        hint:'Trace around the outside edge with your finger and count each unit side once.', steps:[`Go all the way around the outside.`, `Count every unit edge on the outside: ${p.per}.`, `The perimeter is ${p.per} units.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT); let w, h, s; do { w = R.int(2, 10); h = R.int(2, 8); s = R.int(2, 9); } while (2 * (w + h) === 4 * s);
      const a = 2 * (w + h), b = 4 * s, ans = a > b ? 'the rectangle' : 'the square';
      return { q:`Which has the greater perimeter: a rectangle ${w} ${u} by ${h} ${u}, or a square with ${s}-${u} sides?`, kind:'choice', a:ans, choices:['the rectangle','the square'],
        hint:'Find both perimeters, then compare.', steps:[`Rectangle: ${w} + ${h} + ${w} + ${h} = ${a}.`, `Square: 4 × ${s} = ${b}.`, `${ans === 'the rectangle' ? a : b} is greater, so ${ans}.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT), a = psz(R, l), b = psz(R, l), c = R.int(Math.abs(a - b) + 1, a + b - 1), P = a + b + c;
      return { q:`A triangle has a perimeter of ${P} ${u}. Two sides are ${a} ${u} and ${b} ${u}. How long is the third side?`, kind:'num', a:c, unit:u,
        hint:'Add the two sides you know. Subtract from the perimeter.', steps:[`${a} + ${b} = ${a + b}.`, `${P} − ${a + b} = ${c}.`, `The third side is ${c} ${u}.`] }; })
  ];
  M['g3.perimeter'] = { name:'Perimeter', unit:'g3u8', gen(R, lvl){ return run(PERIM, R, lvl); } };

  // ======================= g3.area =======================
  const AREA = [
    T(ALL, (R, l) => { const w = R.int(2, l === 1 ? 6 : 9), h = R.int(2, l === 1 ? 5 : 8), A = w * h;
      return { q:'Each small square is 1 square unit. What is the area of the rectangle?', kind:'num', a:A, unit:'square units', model:{ type:'rect', w, h, grid:true },
        hint:'Count the squares in one row. Then count by that number for each row.', steps:[`One row has ${w} squares.`, `There are ${h} rows.`, `${h} rows of ${w}: ${h} × ${w} = ${A}.`, `The area is ${A} square units.`] }; }),
    T(ALL, (R, l) => { const w = R.int(2, l === 1 ? 6 : 9), h = R.int(2, l === 1 ? 5 : 8), A = w * h;
      return { q:'How many square units cover this rectangle?', kind:'num', a:A, unit:'square units', model:{ type:'rect', w, h, grid:true },
        hint:'Rows × squares in each row.', steps:[`${h} rows with ${w} squares each.`, `${h} × ${w} = ${A}.`] }; }),
    T(ALL, (R, l) => { const p = polyomino(R, R.int(l === 1 ? 4 : 6, l === 1 ? 8 : 14), 5); if (!p) return AREA[0](R, l);
      return { q:'Each square is 1 square unit. What is the area of the shape?', kind:'num', a:p.n, unit:'square units', model:p.model,
        hint:'Count every square once. Touch each one as you count.', steps:[`Count the squares row by row.`, `There are ${p.n} squares.`, `The area is ${p.n} square units.`] }; }),
    T(ALL, (R, l) => { const p = polyomino(R, R.int(5, l === 1 ? 8 : 12), 5); if (!p) return AREA[0](R, l); const more = R.int(1, 3);
      return { q:`You add ${more} more ${pl(more, 'squares')} to this shape. What is the area of the new shape?`, kind:'num', a:p.n + more, unit:'square units', model:p.model,
        hint:'Count the squares now, then add the new ones.', steps:[`The shape has ${p.n} squares.`, `${p.n} + ${more} = ${p.n + more}.`, `The new area is ${p.n + more} square units.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT), w = R.int(2, l === 1 ? 6 : 10), h = R.int(2, l === 1 ? 5 : 9), A = w * h;
      return { q:'What is the area of this rectangle?', kind:'num', a:A, unit:`square ${LU[u]}`, model:{ type:'rect', w, h, unit:u },
        hint:'Area is how many squares cover it. Multiply length × width.', steps:[`Area = length × width.`, `${w} × ${h} = ${A}.`, `The area is ${A} square ${LU[u]}.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT), w = R.int(2, l === 1 ? 6 : 10), h = R.int(2, l === 1 ? 5 : 10), A = w * h;
      return { q:`What is the area of a rectangle that is ${w} ${u} long and ${h} ${u} wide?`, kind:'num', a:A, unit:`square ${LU[u]}`,
        hint:'Multiply the length by the width.', steps:[`${w} × ${h} = ${A}.`, `The area is ${A} square ${LU[u]}.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT), s = R.int(2, l === 1 ? 5 : 10), A = s * s;
      return { q:`A square has sides that are ${s} ${LU[u]} long. What is its area?`, kind:'num', a:A, unit:`square ${LU[u]}`, model:{ type:'rect', w:s, h:s, unit:u },
        hint:'All sides of a square are the same. Multiply side × side.', steps:[`${s} × ${s} = ${A}.`, `The area is ${A} square ${LU[u]}.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT), w = R.int(2, l === 1 ? 5 : 10), h = R.int(2, l === 1 ? 5 : 10), A = w * h;
      return { q:`A rectangle has an area of ${A} square ${LU[u]}. One side is ${w} ${u}. How long is the other side?`, kind:'num', a:h, unit:u,
        hint:`Area = side × side. Think: ${w} × what = ${A}?`, steps:[`Area = length × width.`, `${w} × ? = ${A}.`, `${w} × ${h} = ${A}, so the other side is ${h} ${u}.`] }; }),
    T(ALL, (R, l) => { const k = R.int(0, 5);
      const Q = [['Which tells how many square units cover a shape?', 'Area', 'Perimeter'], ['Which tells the distance around a shape?', 'Perimeter', 'Area'],
        ['A family wants to put a fence around their yard. Do they need the area or the perimeter?', 'Perimeter', 'Area'], ['Dad wants to cover the kitchen floor with tiles. Does he need the area or the perimeter?', 'Area', 'Perimeter'],
        ['You want to put a border all the way around a bulletin board. Do you need the area or the perimeter?', 'Perimeter', 'Area'], ['You want to know how much carpet covers a bedroom floor. Do you need the area or the perimeter?', 'Area', 'Perimeter']][k];
      return { q:Q[0], kind:'choice', a:Q[1], choices:[Q[1], Q[2]], hint:'Area covers the inside. Perimeter goes around the edge.', steps:[Q[1] === 'Area' ? 'Covering the inside of a shape is area.' : 'Going around the outside edge is perimeter.', `The answer is ${Q[1]}.`] }; }),
    T(ALL, (R, l) => { const u = R.pick(LUNIT); let a, b, c, d; do { a = R.int(2, 9); b = R.int(2, 9); c = R.int(2, 9); d = R.int(2, 9); } while (a * b === c * d);
      const A1 = `${a} ${u} by ${b} ${u}`, B1 = `${c} ${u} by ${d} ${u}`, ans = a * b > c * d ? A1 : B1;
      return { q:`Which rectangle has the greater area: ${A1} or ${B1}?`, kind:'choice', a:ans, choices:[A1, B1], hint:'Find each area by multiplying, then compare.',
        steps:[`${a} × ${b} = ${a * b}.`, `${c} × ${d} = ${c * d}.`, `${ans} has more area.`] }; }),
    T(ALL, (R, l) => { const A = name(R), w = R.int(2, l === 1 ? 6 : 10), h = R.int(2, l === 1 ? 5 : 9), t = w * h, it = R.pick([['rug','feet'],['garden','feet'],['poster','inches'],['quilt','feet'],['patio','yards']]);
      return { q:`${A}'s ${it[0]} is ${w} ${it[1]} long and ${h} ${it[1]} wide. What is the area of the ${it[0]}?`, kind:'num', a:t, unit:`square ${it[1]}`,
        hint:'Area = length × width.', steps:[`${w} × ${h} = ${t}.`, `The area is ${t} square ${it[1]}.`] }; }),
    T(ALL, (R, l) => { let a, b, c, d; do { a = R.int(2, 8); b = R.int(2, 8); c = R.int(2, 8); d = R.int(2, 8); } while (a * b <= c * d);
      return { q:`Rectangle A is ${a} by ${b} units. Rectangle B is ${c} by ${d} units. How many more square units does A cover than B?`, kind:'num', a:a * b - c * d, unit:'square units',
        hint:'Find both areas first. Then subtract.', steps:[`A: ${a} × ${b} = ${a * b}.`, `B: ${c} × ${d} = ${c * d}.`, `${a * b} − ${c * d} = ${a * b - c * d}.`] }; }),
    T(L23, (R, l) => { const u = R.pick(LUNIT), sh = lShape(R, l), labs = sh.lens.map(x => `${x} ${u}`);
      return { q:'What is the area of this shape? (Split it into two rectangles.)', kind:'num', a:sh.area, unit:`square ${LU[u]}`, model:{ type:'polygon', pts:sh.pts, right:[0,5], labels:lLabels(sh, labs) },
        hint:'Draw a line to cut it into two rectangles. Find each area, then add.',
        steps:[`Bottom part: ${sh.W} × ${sh.H - sh.ch} = ${sh.W * (sh.H - sh.ch)}.`, `Top part: ${sh.W - sh.cw} × ${sh.ch} = ${(sh.W - sh.cw) * sh.ch}.`, `${sh.W * (sh.H - sh.ch)} + ${(sh.W - sh.cw) * sh.ch} = ${sh.area} square ${LU[u]}.`] }; }),
    T(ALL, (R, l) => { const r = R.int(2, l === 1 ? 5 : 9), c = R.int(2, l === 1 ? 6 : 9), A = r * c;
      return { q:`A rectangle is covered by ${r} rows of unit squares with ${c} squares in each row. What is its area?`, kind:'num', a:A, unit:'square units',
        hint:'Rows × squares in each row.', steps:[`${r} × ${c} = ${A}.`, `The area is ${A} square units.`] }; }),
    T(ALL, (R, l) => { let w = R.int(2, l === 1 ? 5 : 9), h = R.int(2, l === 1 ? 5 : 9); if (w === h) h++; const A = w * h, ans = `${w} by ${h}`;
      return { q:`Which rectangle has an area of ${A} square units?`, kind:'choice', a:ans,
        choices: choices(ans, R.shuffle(notVal(A, [[`${w + 1} by ${h}`, (w + 1) * h], [`${w} by ${h + 1}`, w * (h + 1)], [`${w - 1} by ${h}`, (w - 1) * h], [`${w + h} by 1`, w + h]]))),
        hint:'Multiply the two sides of each rectangle.', steps:[`${w} × ${h} = ${A}.`, `So ${ans} has an area of ${A}.`] }; }),
    T(L3, (R, l) => { const u = R.pick(LUNIT), s = R.int(2, 10), P = 4 * s, A = s * s;
      return { q:`A square has a perimeter of ${P} ${u}. What is its area?`, kind:'num', a:A, unit:`square ${LU[u]}`,
        hint:'Find one side first: the perimeter is 4 equal sides.', steps:[`One side: ${P} ÷ 4 = ${s}.`, `Area: ${s} × ${s} = ${A}.`, `The area is ${A} square ${LU[u]}.`] }; }),
    T(L23, (R, l) => { const u = R.pick(LUNIT), w = R.int(2, 9), h = R.int(2, 9), A = w * h, P = 2 * (w + h);
      return { q:`A rectangle has an area of ${A} square ${LU[u]}. One side is ${w} ${u}. What is its perimeter?`, kind:'num', a:P, unit:u,
        hint:'Use the area to find the other side first. Then add all four sides.', steps:[`${A} ÷ ${w} = ${h}, so the other side is ${h}.`, `Perimeter: ${w} + ${h} + ${w} + ${h} = ${P}.`, `The perimeter is ${P} ${u}.`] }; }),
    T(ALL, (R, l) => { const r = R.int(2, l === 1 ? 4 : 8), c = R.int(3, l === 1 ? 6 : 9), A = (r + 1) * c, B = name(R);
      return { q:`${B}'s patio is ${r} rows of tiles with ${c} tiles in each row. ${B} adds one more row. How many tiles are there now?`, kind:'num', a:A, unit:'tiles',
        hint:'Find the new number of rows first.', steps:[`${r} + 1 = ${r + 1} rows.`, `${r + 1} × ${c} = ${A}.`, `There are ${A} tiles.`] }; }),
    T(ALL, (R, l) => { const w = R.int(3, l === 1 ? 6 : 10), h = R.int(2, l === 1 ? 5 : 9), A = w * h;
      return { q:`A floor is ${w} feet by ${h} feet. Each tile is 1 foot by 1 foot. How many tiles cover the floor?`, kind:'num', a:A, unit:'tiles',
        hint:'Each tile is one square foot. Area tells how many.', steps:[`Area = ${w} × ${h} = ${A} square feet.`, `Each tile covers 1 square foot.`, `${A} tiles.`] }; }),
    T(ALL, (R, l) => { const k = R.int(0, 2), u = R.pick(LUNIT), w = R.int(2, 8), h = R.int(2, 8);
      const ans = `square ${LU[u]}`;
      return { q:`A rectangle is ${w} ${LU[u]} by ${h} ${LU[u]}. Which unit goes with its area?`, kind:'choice', a:ans, choices:[ans, LU[u]],
        hint:'Area counts squares, so it uses square units.', steps:[`Area counts how many squares cover the shape.`, `So its area is ${w * h} ${ans}.`] }; }),
    T(ALL, (R, l) => { const w = R.int(2, l === 1 ? 5 : 8), h = R.int(2, l === 1 ? 5 : 8), A = w * h, P = 2 * (w + h), askA = R.chance(0.5);
      return { q:`This rectangle is ${w} units by ${h} units. What is its ${askA ? 'area' : 'perimeter'}?`, kind:'num', a:askA ? A : P, unit:askA ? 'square units' : 'units', model:{ type:'rect', w, h, grid:true, labels:true, unit:'' },
        hint: askA ? 'Area: count the squares inside, or multiply.' : 'Perimeter: add the sides all the way around.', steps: askA ? [`${w} × ${h} = ${A}.`, `The area is ${A} square units.`] : [`${w} + ${h} + ${w} + ${h} = ${P}.`, `The perimeter is ${P} units.`] }; })
  ];
  M['g3.area'] = { name:'Area', unit:'g3u8', gen(R, lvl){ return run(AREA, R, lvl); } };

  // ======================= g3.graphs =======================
  const THEMES = [
    { title:'Favorite Fruit', cats:['Apples','Bananas','Grapes','Pears','Peaches'], noun:'students', q:c => `How many students chose ${c.toLowerCase()}?` },
    { title:'Pets in Our Class', cats:['Dogs','Cats','Fish','Birds','Hamsters'], noun:'pets', q:c => `How many ${c.toLowerCase()} are in the class?` },
    { title:'Favorite Sport', cats:['Soccer','Baseball','Swimming','Tennis','Basketball'], noun:'students', q:c => `How many students chose ${c.toLowerCase()}?` },
    { title:'Books Read This Month', cats:['Sam','Maya','Leo','Ava','Ben','Lily'], noun:'books', q:c => `How many books did ${c} read?` },
    { title:'Cans Collected', cats:['Room 1','Room 2','Room 3','Room 4'], noun:'cans', q:c => `How many cans did ${c} collect?` },
    { title:'Favorite Color', cats:['Red','Blue','Green','Purple','Yellow'], noun:'students', q:c => `How many students chose ${c.toLowerCase()}?` },
    { title:'Birds at the Feeder', cats:['Robins','Cardinals','Blue jays','Sparrows'], noun:'birds', q:c => `How many ${c.toLowerCase()} came to the feeder?` },
    { title:'Weather in March', cats:['Sunny','Cloudy','Rainy','Windy'], noun:'days', q:c => `How many days were ${c.toLowerCase()}?` },
    { title:'Lunch Choices', cats:['Pizza','Tacos','Salad','Soup','Pasta'], noun:'lunches', q:c => `How many students chose ${c.toLowerCase()}?` },
    { title:'Trees in the Park', cats:['Oak','Maple','Pine','Birch'], noun:'trees', q:c => `How many ${c.toLowerCase()} trees are in the park?` }
  ];
  // a graph with values that sit exactly on a gridline (bars) or on whole/half pictures (picto)
  function graph(R, l, forceKind){
    const th = R.pick(THEMES), n = R.chance(0.3) && th.cats.length >= 5 ? 5 : 4, cats = R.shuffle(th.cats.slice()).slice(0, n);
    const kind = forceKind || (l === 1 ? R.pick(['picto','bars']) : R.pick(['picto','bars','bars','table']));
    let vals, key = 1, step = 1;
    if (kind === 'picto'){
      key = l === 1 ? R.pick([1, 2, 2]) : l === 2 ? R.pick([2, 5, 10]) : R.pick([2, 4, 10]);
      const half = l === 3 && key % 2 === 0, pool = []; for (let k = 1; k <= 8; k++){ pool.push(k * key); if (half && k < 8) pool.push(k * key + key / 2); }
      vals = R.shuffle(pool).slice(0, n);
    } else {
      step = l === 1 ? R.pick([1, 2]) : l === 2 ? R.pick([2, 5]) : R.pick([5, 10]);
      const pool = R.shuffle(range(1, 5)); vals = pool.slice(0, n).map(k => k * step); if (n === 5) vals = R.shuffle(range(1, 5)).map(k => k * step);
      if (!vals.includes(5 * step)) vals[R.int(0, n - 1)] = 5 * step;
      if (kind === 'table'){ vals = vals.map(v => v + (l === 1 ? 0 : R.int(0, step - 1))); for (let i = 1; i < n; i++) while (vals.slice(0, i).includes(vals[i])) vals[i]++; }
    }
    const model = kind === 'picto' ? { type:'picto', title:th.title, cats, vals, key } : kind === 'bars' ? { type:'bars', title:th.title, cats, vals } : { type:'table', head:[th.title, 'Number'], rows:cats.map((c, i) => [c, vals[i]]) };
    const read = i => kind === 'picto' ? `${cats[i]} has ${vals[i] / key} ${pl(vals[i] / key, 'pictures')}. ${vals[i] / key} × ${key} = ${vals[i]}.`
      : kind === 'bars' ? `Go to the top of the ${cats[i]} bar and look across: ${vals[i]}.` : `Find ${cats[i]} in the table: ${vals[i]}.`;
    const keyStep = kind === 'picto' ? [`Look at the key: each picture means ${key}.`] : [];
    const look = kind === 'picto' ? 'Count the pictures and use the key. ' : kind === 'bars' ? 'Read the top of each bar against the numbers on the side. ' : 'Read the numbers in the table. ';
    return { th, cats, vals, key, step, kind, model, read, keyStep, look, n };
  }
  function two(R, G){ let i = R.int(0, G.n - 1), j = R.int(0, G.n - 1); while (j === i) j = R.int(0, G.n - 1); if (G.vals[i] < G.vals[j]) [i, j] = [j, i]; return [i, j]; }
  const gq = (G, q, a, hint, steps, x) => Object.assign({ q, kind:'num', a, model:G.model, hint:G.look + hint, steps:[...G.keyStep, ...steps].slice(-5) }, x || {});
  const GRAPHS = [
    T(ALL, (R, l) => { const G = graph(R, l), i = R.int(0, G.n - 1); return gq(G, G.th.q(G.cats[i]), G.vals[i], 'Find that row or bar.', [G.read(i), `So the answer is ${G.vals[i]}.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l), [i, j] = two(R, G), d = G.vals[i] - G.vals[j];
      return gq(G, `How many more ${G.th.noun} for ${G.cats[i]} than for ${G.cats[j]}?`, d, 'Find both numbers. Then subtract the smaller from the bigger.', [G.read(i), G.read(j), `${G.vals[i]} − ${G.vals[j]} = ${d}.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l), [i, j] = two(R, G), d = G.vals[i] - G.vals[j];
      return gq(G, `How many fewer ${G.th.noun} for ${G.cats[j]} than for ${G.cats[i]}?`, d, '"How many fewer" means find the difference.', [G.read(j), G.read(i), `${G.vals[i]} − ${G.vals[j]} = ${d}.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l), [i, j] = two(R, G), s = G.vals[i] + G.vals[j];
      return gq(G, `How many ${G.th.noun} for ${G.cats[i]} and ${G.cats[j]} together?`, s, '"Together" means add.', [G.read(i), G.read(j), `${G.vals[i]} + ${G.vals[j]} = ${s}.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l), t = sum(G.vals);
      return gq(G, `How many ${G.th.noun} are shown in all on the graph?`, t, 'Read every number, then add them all.', [`Read each one: ${G.cats.map((c, i) => `${c} ${G.vals[i]}`).join(', ')}.`, `${G.vals.join(' + ')} = ${t}.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l), m = Math.max(...G.vals), i = G.vals.indexOf(m);
      return gq(G, 'Which one has the most?', G.cats[i], 'Look for the longest bar, the most pictures, or the biggest number.', [`The greatest number is ${m}.`, `That is ${G.cats[i]}.`], { kind:'choice', a:G.cats[i], choices:G.cats.slice() }); }),
    T(ALL, (R, l) => { const G = graph(R, l), m = Math.min(...G.vals), i = G.vals.indexOf(m);
      return gq(G, 'Which one has the fewest?', G.cats[i], 'Look for the shortest bar, the fewest pictures, or the smallest number.', [`The smallest number is ${m}.`, `That is ${G.cats[i]}.`], { kind:'choice', a:G.cats[i], choices:G.cats.slice() }); }),
    T(ALL, (R, l) => { const G = graph(R, l), i = R.int(0, G.n - 1), t = sum(G.vals), a = t - G.vals[i];
      return gq(G, `Leave out ${G.cats[i]}. How many ${G.th.noun} are shown for all the others?`, a, `Add all the others, or find the total and take away ${G.cats[i]}.`, [`Total: ${G.vals.join(' + ')} = ${t}.`, G.read(i), `${t} − ${G.vals[i]} = ${a}.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l), [i, j] = two(R, G), d = G.vals[i] - G.vals[j];
      return gq(G, `How many more would ${G.cats[j]} need to tie with ${G.cats[i]}?`, d, 'Find the difference between the two.', [G.read(i), G.read(j), `${G.vals[i]} − ${G.vals[j]} = ${d} more.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l), i = R.int(0, G.n - 1);
      return gq(G, `Which one has exactly ${G.vals[i]}?`, G.cats[i], 'Check each one until you find a match.', [G.read(i), `So the answer is ${G.cats[i]}.`], { kind:'choice', a:G.cats[i], choices:G.cats.slice() }); }),
    T(ALL, (R, l) => { const G = graph(R, l), s = G.vals.slice().sort((a, b) => a - b), th = s[R.int(0, G.n - 2)], c = G.vals.filter(v => v > th).length;
      return gq(G, `How many of the ${G.n} choices on the graph have more than ${th}?`, c, `Find each number and check if it is more than ${th}.`, [`The numbers are ${G.vals.join(', ')}.`, `More than ${th}: ${G.vals.filter(v => v > th).join(', ')}.`, `That is ${c}.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l), [i, j] = two(R, G), tr = R.chance(0.5), st = tr ? `The number for ${G.cats[i]} is greater than the number for ${G.cats[j]}.` : `The number for ${G.cats[j]} is greater than the number for ${G.cats[i]}.`, ans = tr ? 'True' : 'False';
      return gq(G, `True or false? ${st}`, ans, 'Read both numbers and compare.', [G.read(i), G.read(j), `${G.vals[i]} > ${G.vals[j]}, so it is ${ans.toLowerCase()}.`], { kind:'choice', a:ans, choices:['True','False'] }); }),
    T(ALL, (R, l) => { const G = graph(R, l), i = R.int(0, G.n - 1), k = l === 1 ? R.int(1, 5) : R.pick([2, 3, 5, 10]), a = G.vals[i] + k;
      return gq(G, `If ${k} more join ${G.cats[i]}, how many will ${G.cats[i]} have?`, a, 'Read the number now. Then add.', [G.read(i), `${G.vals[i]} + ${k} = ${a}.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l), mx = Math.max(...G.vals), mn = Math.min(...G.vals);
      return gq(G, 'What is the difference between the greatest and the least?', mx - mn, 'Find the biggest and the smallest. Subtract.', [`Greatest: ${mx}.`, `Least: ${mn}.`, `${mx} − ${mn} = ${mx - mn}.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l, 'picto'), k = R.int(2, 9), v = k * G.key, c = R.pick(['Ella','Kim','Room 5','Gus']);
      return gq(G, `In this graph, how many pictures would show ${v}?`, k, `Each picture means ${G.key}. How many ${G.key}s make ${v}?`, [`Each picture = ${G.key}.`, `${v} ÷ ${G.key} = ${k}.`, `Draw ${k} ${pl(k, 'pictures')}.`]); }),
    T(L23, (R, l) => { const G = graph(R, l, 'picto'); if (G.key % 2) return GRAPHS[0](R, l);
      return gq(G, 'In this graph, what does half of a picture stand for?', G.key / 2, 'A whole picture is the key. Half a picture is half of that.', [`A whole picture = ${G.key}.`, `Half of ${G.key} is ${G.key / 2}.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l, 'bars');
      return gq(G, 'The lines on this bar graph go up by the same amount. How much is each step?', G.step, 'Read the numbers on the side: what do they count by?', [`The side numbers go 0, ${G.step}, ${2 * G.step}, ${3 * G.step}...`, `They count by ${G.step}s.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l), [i, j] = two(R, G), t = G.vals[i] + G.vals[j], ans = `${G.cats[i]} and ${G.cats[j]}`, ds = [];
      for (let a = 0; a < G.n; a++) for (let b = a + 1; b < G.n; b++) if (G.vals[a] + G.vals[b] !== t) ds.push(`${G.cats[a]} and ${G.cats[b]}`);
      if (!ds.length) return GRAPHS[0](R, l);
      return gq(G, `Which two together make ${t}?`, ans, 'Add pairs until you find the total.', [G.read(i), G.read(j), `${G.vals[i]} + ${G.vals[j]} = ${t}.`], { kind:'choice', a:ans, choices: choices(ans, R.shuffle(ds)) }); }),
    T(ALL, (R, l) => { const G = graph(R, l), s = G.vals.slice().sort((a, b) => b - a), i = G.vals.indexOf(s[1]);
      return gq(G, 'Which one has the second most?', G.cats[i], 'Put them in order from most to least.', [`From most to least: ${s.join(', ')}.`, `The second most is ${s[1]}: ${G.cats[i]}.`], { kind:'choice', a:G.cats[i], choices:G.cats.slice() }); }),
    T(ALL, (R, l) => { const G = graph(R, l), idx = range(0, G.n - 1).sort((a, b) => G.vals[a] - G.vals[b]), ans = idx.map(i => G.cats[i]).join(', ');
      const ds = [idx.slice().reverse().map(i => G.cats[i]).join(', '), R.shuffle(idx.slice()).map(i => G.cats[i]).join(', '), [idx[1], idx[0], ...idx.slice(2)].map(i => G.cats[i]).join(', ')];
      return gq(G, 'Which list goes from least to greatest?', ans, 'Find the smallest first, then the next...', [`In order: ${idx.map(i => `${G.cats[i]} (${G.vals[i]})`).join(', ')}.`], { kind:'choice', a:ans, choices: choices(ans, ds) }); }),
    T(ALL, (R, l) => { const G = graph(R, l, 'table'), i = R.int(0, G.n - 1), j = (i + 1) % G.n, a = Math.abs(G.vals[i] - G.vals[j]);
      return gq(G, `Look at the table. What is the difference between ${G.cats[i]} and ${G.cats[j]}?`, a, 'Subtract the smaller number from the bigger one.', [G.read(i), G.read(j), `${Math.max(G.vals[i], G.vals[j])} − ${Math.min(G.vals[i], G.vals[j])} = ${a}.`]); }),
    T(ALL, (R, l) => { const G = graph(R, l), i = R.int(0, G.n - 1), k = R.int(1, Math.max(1, Math.min(5, G.vals[i] - 1))), a = G.vals[i] - k;
      if (G.vals[i] < 2) return GRAPHS[0](R, l);
      return gq(G, `Suppose ${G.cats[i]} had ${k} fewer. How many would ${G.cats[i]} have then?`, a, 'Read the number. Then subtract.', [G.read(i), `${G.vals[i]} − ${k} = ${a}.`]); })
  ];
  M['g3.graphs'] = { name:'Bar graphs & picture graphs', unit:'g3u1', gen(R, lvl){ return run(GRAPHS, R, lvl); } };

  // ======================= g3.units =======================
  // [thing, best unit, other units]
  const U_LEN = [['a potato','inches',['feet','yards','miles']], ['a pencil','inches',['yards','feet','miles']], ['your classroom','feet',['inches','miles']], ['a soccer field','yards',['inches','miles']],
    ['the drive to Grandma\'s house','miles',['feet','inches','yards']], ['a school bus','feet',['inches','miles']], ['your thumb','inches',['feet','yards','miles']], ['a football field','yards',['inches','miles']],
    ['a bike trail through the state park','miles',['inches','feet']], ['a door','feet',['miles','inches']], ['a paper clip','inches',['feet','yards','miles']], ['a trip across the state','miles',['inches','feet','yards']]];
  const U_MET = [['a crayon','centimeters',['meters']], ['a swimming pool','meters',['centimeters']], ['a ladybug','centimeters',['meters']], ['a hallway at school','meters',['centimeters']],
    ['a fork','centimeters',['meters']], ['a soccer field','meters',['centimeters']], ['an eraser','centimeters',['meters']], ['a basketball court','meters',['centimeters']]];
  const U_WT = [['a turkey','pounds',['ounces']], ['a slice of bread','ounces',['pounds']], ['a bag of apples','pounds',['ounces']], ['a strawberry','ounces',['pounds']],
    ['a dog','pounds',['ounces']], ['a letter in the mail','ounces',['pounds']], ['a bowling ball','pounds',['ounces']], ['a pencil','ounces',['pounds']]];
  const U_MASS = [['a paper clip','grams',['kilograms']], ['a watermelon','kilograms',['grams']], ['a feather','grams',['kilograms']], ['a bicycle','kilograms',['grams']], ['a grape','grams',['kilograms']], ['a big bag of rice','kilograms',['grams']]];
  const U_CAP = [['a bathtub of water','gallons',['cups']], ['a glass of milk','cups',['gallons']], ['a fish tank','gallons',['cups','quarts']], ['a mug of hot cocoa','cups',['gallons','quarts']],
    ['a big pot of soup','quarts',['cups','gallons']], ['a swimming pool','gallons',['cups','quarts']], ['a bowl of cereal','cups',['gallons']], ['a pitcher of lemonade','quarts',['gallons','cups']]];
  const U_ALL = [U_LEN, U_MET, U_WT, U_MASS, U_CAP];
  // [thing, good estimate number, unit, wrong units]
  const EST = [['a pencil', 7, 'inches', ['feet','yards']], ['a dog', 30, 'pounds', ['ounces']], ['a door', 2, 'meters', ['centimeters']], ['a paper clip', 1, 'gram', ['kilogram']],
    ['a juice box', 1, 'cup', ['gallon']], ['a car', 15, 'feet', ['inches','miles']], ['a book', 1, 'pound', ['ounce']], ['a milk jug', 1, 'gallon', ['cup']],
    ['a new crayon', 9, 'centimeters', ['meters']], ['a baby', 8, 'pounds', ['ounces']], ['a bathtub', 40, 'gallons', ['cups']], ['a backpack', 3, 'kilograms', ['grams']],
    ['a slice of cheese', 1, 'ounce', ['pound']], ['a bed', 2, 'meters', ['centimeters']], ['a teacher\'s desk', 5, 'feet', ['inches','miles']], ['a walk across town', 2, 'miles', ['feet','inches']]];
  const BENCH = [['about 1 inch long','a paper clip',['a baseball bat','a door','a car']], ['about 1 foot long','a ruler',['a paper clip','a school bus','a grape']], ['about 1 yard long','a baseball bat',['a paper clip','a crayon','a school bus']],
    ['about 1 meter long','a guitar',['an ant','a crayon','a house']], ['about 1 centimeter wide','your fingernail',['your arm','a desk','a door']], ['about 1 pound','a loaf of bread',['a car','a feather','a piano']],
    ['about 1 ounce','a slice of bread',['a bowling ball','a dog','a car']], ['about 1 gallon','a milk jug',['a spoon','a cup of tea','a bathtub']], ['about 1 cup','a mug of cocoa',['a bathtub','a swimming pool','a raindrop']],
    ['about 1 kilogram','a pineapple',['a paper clip','a school bus','a feather']], ['about 1 gram','a paper clip',['a pineapple','a bicycle','a dog']]];
  const CONV = [['inches','foot',12], ['feet','yard',3], ['centimeters','meter',100], ['ounces','pound',16], ['cups','pint',2], ['pints','quart',2], ['quarts','gallon',4]];
  const ORDER = [['inches','feet','yards','miles'], ['centimeters','meters'], ['cups','pints','quarts','gallons'], ['ounces','pounds'], ['grams','kilograms']];
  function unitQ(R, list, verb){ const it = R.pick(list), opts = [it[1], ...R.shuffle(it[2].slice()).slice(0, 2)];
    return { q:`Which unit would you use to ${verb} ${it[0]}?`, kind:'choice', a:it[1], choices:opts,
      hint:'Picture the object. Use small units for small things and big units for big things.', steps:[`Think about how big ${it[0]} is.`, `${cap(it[1])} make sense for something that size.`, `So use ${it[1]}.`] }; }
  const UNITS = [
    T(ALL, (R, l) => { const it = R.pick(U_LEN), o = it[2][0], q = R.chance(0.5) ? `${it[1]} or ${o}` : `${o} or ${it[1]}`;
      return { q:`Would you measure the length of ${it[0]} in ${q}?`, kind:'choice', a:it[1], choices:[it[1], o],
        hint:'Picture the object. Use small units for small things and big units for big things.', steps:[`Think about how big ${it[0]} is.`, `${cap(it[1])} make sense for something that size.`, `So use ${it[1]}.`] }; }),
    T(ALL, (R, l) => unitQ(R, U_LEN, 'measure the length of')),
    T(ALL, (R, l) => unitQ(R, U_MET, 'measure the length of')),
    T(ALL, (R, l) => unitQ(R, U_WT, 'weigh')),
    T(ALL, (R, l) => unitQ(R, U_MASS, 'find the mass of')),
    T(ALL, (R, l) => unitQ(R, U_CAP, 'measure how much liquid is in')),
    T(ALL, (R, l) => { const e = R.pick(EST), ans = `${e[1]} ${e[2]}`;
      return { q:`Which is the best estimate for ${e[0]}?`, kind:'choice', a:ans, choices: choices(ans, e[3].map(u => `${e[1]} ${u}`)),
        hint:'The number is the same in every choice. Which unit makes sense for that size?', steps:[`Picture ${e[0]}.`, `${e[1]} ${e[3][0]} would be much too ${['inches','ounces','ounce','cups','cup','centimeters','gram','grams'].includes(e[3][0]) ? 'small' : 'big'}.`, `${ans} makes sense.`] }; }),
    T(ALL, (R, l) => { const b = R.pick(BENCH), ans = b[1];
      return { q:`Which is ${b[0]}?`, kind:'choice', a:ans, choices: choices(ans, b[2]), hint:'Think of things you know that are that size.', steps:[`${cap(b[1])} is ${b[0]}.`, `The others are much bigger or much smaller.`] }; }),
    T(ALL, (R, l) => { const o = R.pick(ORDER), i = R.int(0, o.length - 2), j = R.int(i + 1, o.length - 1), longer = R.chance(0.5);
      const ws = o[0] === 'inches' || o[0] === 'centimeters' ? ['longer','shorter'] : o[0] === 'cups' ? ['more','less'] : ['heavier','lighter'], a1 = pl(1, o[i]), a2 = pl(1, o[j]), ans = longer ? `1 ${a2}` : `1 ${a1}`;
      return { q:`Which is ${longer ? ws[0] : ws[1]}${o[0] === 'cups' ? ' liquid' : ''}: 1 ${a1} or 1 ${a2}?`, kind:'choice', a:ans, choices:[`1 ${a1}`, `1 ${a2}`],
        hint:`Put the units in order from smallest to biggest: ${o.join(', ')}.`, steps:[`From smallest to biggest: ${o.join(', ')}.`, `So ${ans} is ${longer ? ws[0] : ws[1]}.`] }; }),
    T(ALL, (R, l) => { const o = R.pick(ORDER.filter(x => x.length >= 3)), small = R.chance(0.5), ans = small ? o[0] : o[o.length - 1];
      return { q:`Which unit is the ${small ? 'smallest' : 'largest'}?`, kind:'choice', a:ans, choices:R.shuffle(o.slice()), hint:'Picture one of each unit.', steps:[`In order: ${o.join(', ')}.`, `The ${small ? 'smallest' : 'largest'} is ${ans}.`] }; }),
    T(ALL, (R, l) => { const c = R.pick(l === 1 ? CONV.slice(0, 3) : CONV);
      return { q:`How many ${c[0]} are in 1 ${c[1]}?`, kind:'num', a:c[2], unit:c[0], hint:'This is a fact to remember.', steps:[`1 ${c[1]} = ${c[2]} ${c[0]}.`] }; }),
    T(L23, (R, l) => { const c = R.pick(CONV.filter(x => x[2] <= 16)), n = R.int(2, l === 2 ? 3 : 5), a = n * c[2];
      return { q:`How many ${c[0]} are in ${n} ${c[1] === 'foot' ? 'feet' : c[1] + 's'}?`, kind:'num', a, unit:c[0], hint:`1 ${c[1]} = ${c[2]} ${c[0]}. Multiply.`, steps:[`1 ${c[1]} = ${c[2]} ${c[0]}.`, `${n} × ${c[2]} = ${a}.`] }; }),
    T(ALL, (R, l) => { const max = l === 1 ? 8 : 12, half = l > 1 && R.chance(0.5), x = R.int(2, max - 1) + (half ? 0.5 : 0), ans = half ? `${Math.floor(x)} 1/2 inches` : `${x} inches`;
      const fx = v => Number.isInteger(v) ? `${v} inches` : `${Math.floor(v)} 1/2 inches`;
      return { q:'A pencil starts at 0 on the ruler and ends at the dot. How long is it?', kind:'choice', a:ans, model:{ type:'numberline', min:0, max, step:0.5, label:1, points:[{ x, label:'' }] },
        choices: choices(ans, [fx(x + 1), fx(x - 0.5), fx(x + 0.5), fx(x - 1)]), hint:'Each number is 1 inch. A short tick in the middle is a half inch.', steps:[`Start at 0. The end is at ${half ? Math.floor(x) + ' and a half' : x}.`, `So it is ${ans} long.`] }; }),
    T(ALL, (R, l) => { const max = l === 1 ? 10 : 15, a = R.int(0, 4), b = R.int(a + 2, max);
      return { q:'A ribbon lies along this centimeter ruler from one dot to the other. How long is the ribbon?', kind:'num', a:b - a, unit:'cm', model:{ type:'numberline', min:0, max, step:1, label:1, points:[{ x:a, label:'' }, { x:b, label:'' }] },
        hint:'Count the centimeter spaces between the dots, or subtract.', steps:[`One end is at ${a}, the other is at ${b}.`, `${b} − ${a} = ${b - a}.`, `The ribbon is ${b - a} cm long.`] }; }),
    T(ALL, (R, l) => { const k = R.int(0, 3), T2 = [['the length of a table','a ruler or measuring tape'], ['how heavy a melon is','a scale'], ['how much water is in a bowl','a measuring cup'], ['how long a book is','a ruler']][k], ans = T2[1];
      return { q:`Which tool would you use to measure ${T2[0]}?`, kind:'choice', a:ans, choices: choices(ans, ['a scale','a measuring cup','a ruler or measuring tape','a clock'].filter(x => x !== ans && !(ans === 'a ruler' && x === 'a ruler or measuring tape'))),
        hint:'Rulers measure length, scales measure weight, measuring cups measure liquid.', steps:[`Measuring ${T2[0]} needs ${ans}.`] }; }),
    T(L3, (R, l) => { const c = R.pick([['feet','inches',12], ['yards','feet',3], ['pounds','ounces',16], ['quarts','pints',2], ['gallons','quarts',4]]), n = R.int(2, 4), big = n * c[2], other = big + R.pick([-c[2] + 1, 2, -2, 5]);
      if (other === big) return UNITS[0](R, l);
      const A = `${n} ${c[0]}`, B = `${other} ${c[1]}`, ans = big > other ? A : B;
      return { q:`Which is more: ${A} or ${B}?`, kind:'choice', a:ans, choices:[A, B], hint:`Change ${c[0]} into ${c[1]} first. 1 ${pl(1, c[0]) === 'feet' ? 'foot' : pl(1, c[0])} = ${c[2]} ${c[1]}.`,
        steps:[`${A} = ${n} × ${c[2]} = ${big} ${c[1]}.`, `Compare ${big} and ${other}.`, `${ans} is more.`] }; }),
    T(L23, (R, l) => { const A = name(R), n = R.int(2, 6), k = R.pick([['yards','feet',3], ['feet','inches',12]]), a = n * k[2];
      return { q:`${A} has a rope that is ${n} ${k[0]} long. How many ${k[1]} long is the rope?`, kind:'num', a, unit:k[1], hint:`1 ${k[0] === 'feet' ? 'foot' : 'yard'} = ${k[2]} ${k[1]}.`, steps:[`Each ${k[0] === 'feet' ? 'foot' : 'yard'} is ${k[2]} ${k[1]}.`, `${n} × ${k[2]} = ${a}.`, `The rope is ${a} ${k[1]} long.`] }; }),
    T(ALL, (R, l) => { const A = name(R), a = R.int(2, l === 1 ? 9 : 40), b = R.int(2, l === 1 ? 9 : 40), u = R.pick(['inches','centimeters','feet']);
      return { q:`${A} has a ribbon that is ${a} ${u} long and another that is ${b} ${u} long. How long are they together?`, kind:'num', a:a + b, unit:u, hint:'Together means add the lengths.', steps:[`${a} + ${b} = ${a + b}.`, `Together they are ${a + b} ${u}.`] }; }),
    T(ALL, (R, l) => { const A = name(R), u = R.pick(['pounds','kilograms']), a = u === 'pounds' ? R.int(8, l === 1 ? 15 : 25) : R.int(4, 12), b = R.int(2, a - 2);
      return { q:`${A}'s backpack weighs ${a} ${u}. ${A} takes out books that weigh ${b} ${pl(b, u)}. How much does the backpack weigh now?`, kind:'num', a:a - b, unit:u, hint:'Taking out means subtract.', steps:[`${a} − ${b} = ${a - b}.`, `It weighs ${a - b} ${u}.`] }; }),
    T(ALL, (R, l) => { const d = R.pick([['a cup','cups'], ['a liter','liters'], ['a quart','quarts']]), n = R.int(2, l === 1 ? 5 : 9), m = R.int(2, l === 1 ? 4 : 6), A = name(R);
      return { q:`${A} pours ${n} ${d[1]} of water into a bucket, then ${m} more ${d[1]}. How many ${d[1]} of water are in the bucket?`, kind:'num', a:n + m, unit:d[1], hint:'Add the two amounts.', steps:[`${n} + ${m} = ${n + m}.`, `There are ${n + m} ${d[1]}.`] }; }),
    T(ALL, (R, l) => { const o = R.pick([['a car','a bicycle','pounds'], ['a horse','a cat','pounds'], ['a watermelon','an apple','grams'], ['a school bus','a car','feet'], ['a bathtub','a sink','gallons']]), ans = o[0];
      return { q:`Which is more likely to measure 100 ${o[2]}: ${o[0]} or ${o[1]}?`, kind:'choice', a:ans, choices:[o[0], o[1]], hint:`Think about which one is bigger.`, steps:[`${cap(o[0])} is much bigger than ${o[1]}.`, `So ${ans} is more likely to be 100 ${o[2]}.`] }; })
  ];
  M['g3.units'] = { name:'Choose the unit', unit:'g3u8', gen(R, lvl){ return run(UNITS, R, lvl); } };
})();
