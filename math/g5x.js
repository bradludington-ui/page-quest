// Page Quest math: grade 5 ADVANCED (FCPS Math 6 / Virginia SOL 2023 grade 6), EXTRA VARIETY.
// Loaded after g5.js. Replaces these skills with much bigger question banks (20+ question types at every level):
//   g5.intops, g5.orderops, g5.exponents, g5.squares, g5.sqword   (Unit 5: integers, order of operations, exponents, squares)
//   g5.absval, g5.intcompare, g5.ineq                              (Unit 2: integers & inequalities)
// Every answer is computed from the generated numbers. Each skill is a list of question TYPES; gen() picks one that is
// allowed at the level (most types run at every level with level-sized numbers) and retries if a type returns null.
(function(){
  const M = window.MathSkills = window.MathSkills || {};
  const MS = '−'; // real minus sign

  // ---------- helpers (copied from g5.js, which keeps its own private) ----------
  function clean(n){ return Math.round(n * 1e6) / 1e6; }
  function N(n){
    n = clean(n);
    const neg = n < 0; let s = String(Math.abs(n));
    if (Number.isInteger(n) && Math.abs(n) >= 10000) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? MS : '') + s;
  }
  function P(n){ return n < 0 ? '(' + N(n) + ')' : N(n); }
  const SUP = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
  function sup(e){ return String(e).split('').map(c => SUP[c]).join(''); }
  function pw(b, e){ return (b < 0 ? '(' + N(b) + ')' : N(b)) + sup(e); }
  const NAMES = ['Sam','Maya','Leo','Ava','Ben','Lily','Max','Emma','Noah','Mia','Zoe','Eli','Ruby','Omar','Nora','Jack','Aria','Luis','Ivy','Kai','Priya','Theo','Grace','Owen'];
  function two(R){ const a = R.pick(NAMES); let b = R.pick(NAMES), g = 0; while (b === a && g++ < 50) b = R.pick(NAMES); return [a, b]; }
  function choose(ans, cands, max){ max = max || 4; const out = [String(ans)];
    for (const c of cands){ if (out.length >= max) break; if (c == null || c === '') continue; const s = String(c); if (!out.includes(s)) out.push(s); }
    return out; }
  function rnz(R, a, b){ let v = 0, g = 0; while (v === 0 && g++ < 60) v = R.int(a, b); return v || b; }
  function sum(a){ return a.reduce((s, v) => s + v, 0); }
  function money(v){ return (v < 0 ? MS : '') + '$' + Math.abs(v); }
  function sgn(v){ return v > 0 ? '+' + v : N(v); }
  function distinct(R, k, lo, hi, ok){ const s = new Set(); let g = 0; while (s.size < k && g++ < 800){ const v = R.int(lo, hi); if (!ok || ok(v)) s.add(v); } return s.size === k ? [...s] : null; }
  function plural(n, w){ return n === 1 ? w : w + 's'; }
  // a number line that fits every value in vals (points drawn are pts)
  function nlAuto(pts, vals, extra){
    const all = (vals || []).concat(pts.map(p => p.x)); const m = Math.max(5, ...all.map(Math.abs));
    const L = m <= 10 ? 10 : m <= 20 ? 20 : m <= 30 ? 30 : m <= 50 ? 50 : 100;
    const step = L <= 30 ? 1 : L <= 50 ? 5 : 10, lab = L <= 10 ? 2 : L <= 30 ? 5 : L <= 50 ? 10 : 20;
    return Object.assign({ type:'numberline', min:-L, max:L, step, label:lab, points:pts }, extra || {});
  }
  function nlv(vals){ return nlAuto(vals.map(x => ({ x, label:N(x) })), []); }
  // pick a question type allowed at this level; a type may return null to ask for a fresh one
  function run(R, lvl, T){
    const pool = T.filter(t => !t.L || t.L.indexOf(lvl) >= 0);
    for (let g = 0; g < 400; g++){ const o = R.pick(pool).f(R, lvl); if (o) return o; }
    throw new Error('no problem made');
  }
  function addT(T, L, f){ T.push(typeof L === 'function' ? { f:L } : { L, f }); }

  // ---------- an order-of-operations engine: shows every step the way a kid would do it ----------
  // terms: {n:value} | {g:[items], br:bool} (parentheses / brackets) | {p:term, e:exponent}. items = [term, op, term, op, ...]
  const num = v => ({ n:v }), grp = (items, br) => ({ g:items, br:!!br }), pow = (t, e) => ({ p:t, e });
  const isN = t => t && Object.prototype.hasOwnProperty.call(t, 'n');
  function showT(t, first){
    if (isN(t)) return first ? N(t.n) : P(t.n);
    if (t.g) return (t.br ? '[' : '(') + show(t.g) + (t.br ? ']' : ')');
    return (isN(t.p) ? (t.p.n < 0 ? '(' + N(t.p.n) + ')' : N(t.p.n)) : showT(t.p, false)) + sup(t.e);
  }
  function show(items){ return items.map((x, i) => i % 2 ? ' ' + x + ' ' : showT(x, i === 0)).join(''); }
  function collapse(t){
    if (t.g){ const g = t.g.map((x, i) => i % 2 ? x : collapse(x)); return g.length === 1 && isN(g[0]) ? g[0] : grp(g, t.br); }
    if (t.p) return pow(collapse(t.p), t.e);
    return t;
  }
  const BADX = { bad:1 };
  function step(items){
    for (let i = 0; i < items.length; i += 2){ const t = items[i];
      const inner = t.g ? t : (t.p && t.p.g ? t.p : null);
      if (inner){ const r = step(inner.g); const ng = collapse(grp(r.items, inner.br)); const ni = items.slice();
        ni[i] = t.g ? ng : collapse(pow(ng, t.e)); return Object.assign({}, r, { items:ni, inside:true, gk: r.inside ? r.gk : (inner.br ? 'brackets' : 'parentheses') }); }
    }
    for (let i = 0; i < items.length; i += 2){ const t = items[i];
      if (t.p && isN(t.p)){ const b = t.p.n, v = Math.pow(b, t.e); const ni = items.slice(); ni[i] = num(v); return { items:ni, k:'exp', txt:`${pw(b, t.e)} = ${N(v)}`, v }; }
    }
    for (const lvlOps of [['×', '÷'], ['+', '−']]){
      for (let i = 1; i < items.length; i += 2){ const op = items[i]; if (lvlOps.indexOf(op) < 0) continue;
        const a = items[i - 1].n, b = items[i + 1].n; let v;
        if (op === '×') v = a * b; else if (op === '÷'){ if (b === 0 || a % b !== 0) throw BADX; v = a / b; } else if (op === '+') v = a + b; else v = a - b;
        const ni = items.slice(0, i - 1).concat([num(v)], items.slice(i + 2));
        return { items:ni, k:op, txt:`${N(a)} ${op} ${P(b)} = ${N(v)}`, v };
      }
    }
    return null;
  }
  function solve(items){
    try {
      let cur = items.map(x => typeof x === 'string' ? x : collapse(x)); const steps = []; let mn = Infinity, mx = 0;
      for (let g = 0; g < 40 && !(cur.length === 1 && isN(cur[0])); g++){
        const r = step(cur); if (!r) return null; cur = r.items; mn = Math.min(mn, r.v); mx = Math.max(mx, Math.abs(r.v));
        steps.push({ k:r.k, txt:r.txt, inside:!!r.inside, gk:r.gk, after:show(cur) });
      }
      return { v:cur[0].n, steps, mn, mx };
    } catch (e){ if (e === BADX) return null; throw e; }
  }
  const KWORD = { exp:'Exponent', '×':'Multiply', '÷':'Divide', '+':'Add', '−':'Subtract' };
  function stepLines(sol){
    const L = sol.steps.map((s, i) => {
      const lab = s.inside ? `Inside the ${s.gk} first. ${KWORD[s.k]}: ${s.txt}` : `${KWORD[s.k]}: ${s.txt}`;
      return i < sol.steps.length - 1 ? `${lab}   → now: ${s.after}` : lab;
    });
    L.push(`Answer: ${N(sol.v)}`);
    return L;
  }
  // working straight left to right (the classic mistake). Exponents done first. Only for flat expressions.
  function ltr(items){
    if (items.some((x, i) => i % 2 === 0 && x.g)) return null;
    let v = null, op = null;
    for (let i = 0; i < items.length; i++){
      if (i % 2){ op = items[i]; continue; }
      const t = items[i]; const x = isN(t) ? t.n : (isN(t.p) ? Math.pow(t.p.n, t.e) : null); if (x === null) return null;
      if (v === null) v = x; else if (op === '+') v += x; else if (op === '−') v -= x; else if (op === '×') v *= x; else { if (x === 0 || v % x) return null; v /= x; }
    }
    return v;
  }
  const PEMDAS = 'Please Excuse My Dear Aunt Sally: Parentheses, Exponents, then × and ÷ (left to right), then + and − (left to right).';

  // ======================= g5.intops =======================
  function addSteps(a, b){
    const r = a + b;
    if (a === 0 || b === 0) return [`Adding 0 changes nothing.`, `${N(a)} + ${P(b)} = ${N(r)}`];
    if ((a > 0) === (b > 0)) return [`Same signs: add the sizes. ${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(a) + Math.abs(b)}`, `Keep the sign: both are ${a > 0 ? 'positive' : 'negative'}.`, `${N(a)} + ${P(b)} = ${N(r)}`];
    const big = Math.abs(a) >= Math.abs(b) ? a : b;
    return [`Different signs: subtract the sizes. ${Math.max(Math.abs(a), Math.abs(b))} − ${Math.min(Math.abs(a), Math.abs(b))} = ${Math.abs(r)}`, r === 0 ? 'They cancel out to 0.' : `Keep the sign of the number farther from 0 (${N(big)}): ${r > 0 ? 'positive' : 'negative'}.`, `${N(a)} + ${P(b)} = ${N(r)}`];
  }
  function subSteps(a, b){ const r = a - b; return [`Subtracting is adding the opposite: ${N(a)} − ${P(b)} = ${N(a)} + ${P(-b)}`, ...addSteps(a, -b).slice(0, -1), `${N(a)} − ${P(b)} = ${N(r)}`]; }
  function mulSign(a, b, op, r){
    return [`${op === '×' ? 'Multiply' : 'Divide'} the sizes: ${Math.abs(a)} ${op} ${Math.abs(b)} = ${Math.abs(r)}`, r === 0 ? 'Zero has no sign.' : ((a < 0) === (b < 0) ? 'Same signs → the answer is POSITIVE.' : 'Different signs → the answer is NEGATIVE.'), `${N(a)} ${op} ${P(b)} = ${N(r)}`];
  }
  const IOH = {
    '+':'Same signs: add the sizes and keep the sign. Different signs: subtract the sizes and keep the sign of the number farther from 0.',
    '−':'Subtracting is adding the opposite: keep the first number, change − to +, and flip the sign of the second number.',
    '×':'Multiply the sizes. Same signs → positive. Different signs → negative.',
    '÷':'Divide the sizes. Same signs → positive. Different signs → negative.' };
  const ioLim = l => [0, 10, 25, 50][l], ioM = l => [0, 6, 12, 12][l];
  function opProb(R, lvl, op){
    const L = ioLim(lvl), m = ioM(lvl); let a, b, r;
    if (op === '+' || op === '−'){ do { a = rnz(R, -L, L); b = rnz(R, -L, L); } while (a > 0 && b > 0); r = op === '+' ? a + b : a - b; }
    else if (op === '×'){ do { a = rnz(R, -m, m); b = rnz(R, -m, m); } while (a > 0 && b > 0); r = a * b; }
    else { do { b = rnz(R, -m, m); r = rnz(R, -m, m); } while (b > 0 && r > 0); a = b * r; }
    const steps = op === '+' ? addSteps(a, b) : op === '−' ? subSteps(a, b) : mulSign(a, b, op, r);
    return { a, b, r, op, txt:`${N(a)} ${op} ${P(b)}`, steps };
  }
  const OPS = ['+', '−', '×', '÷'];
  const OPWORD = { '+':'sum', '−':'difference', '×':'product', '÷':'quotient' };
  const IO = [];
  for (const op of OPS) addT(IO, (R, lvl) => { const o = opProb(R, lvl, op);
    const model = (op === '+' || op === '−') && Math.abs(o.a) <= 30 && Math.abs(o.r) <= 30 ? nlAuto([{ x:o.a, label:'start' }], [o.r]) : undefined;
    return { q:`${o.txt} = ?`, kind:'num', a:o.r, model, hint:IOH[op], steps:o.steps }; });
  // missing numbers
  addT(IO, (R, lvl) => { const L = ioLim(lvl); const a = rnz(R, -L, L), x = rnz(R, -L, L); if (a > 0 && x > 0) return null; const c = a + x;
    return { q:`${N(a)} + ? = ${N(c)}`, kind:'num', a:x, hint:'What do you add to the first number to land on the answer? Find it by subtracting.',
      steps:[`Picture a number line: start at ${N(a)} and end at ${N(c)}.`, `The missing number = ${N(c)} − ${P(a)} = ${N(x)}`, `Check: ${N(a)} + ${P(x)} = ${N(c)} ✓`] }; });
  addT(IO, (R, lvl) => { const L = ioLim(lvl); const a = rnz(R, -L, L), x = rnz(R, -L, L); if (a > 0 && x > 0) return null; const c = a - x;
    return { q:`${N(a)} − ? = ${N(c)}`, kind:'num', a:x, hint:'What do you take away from the first number to get the answer?',
      steps:[`The missing number is what you subtract from ${N(a)} to get ${N(c)}.`, `Find it: ${N(a)} − ${P(c)} = ${N(x)}`, `Check: ${N(a)} − ${P(x)} = ${N(c)} ✓`] }; });
  addT(IO, (R, lvl) => { const m = ioM(lvl); const x = rnz(R, -m, m), b = rnz(R, -m, m); if (x > 0 && b > 0) return null; const c = x * b;
    return { q:`? × ${P(b)} = ${N(c)}`, kind:'num', a:x, hint:'Undo multiplying by dividing. Then think about the sign.',
      steps:[`Undo × with ÷: ${N(c)} ÷ ${P(b)}`, ...mulSign(c, b, '÷', x).slice(0, 2), `The missing number is ${N(x)}. Check: ${N(x)} × ${P(b)} = ${N(c)} ✓`] }; });
  addT(IO, (R, lvl) => { const m = ioM(lvl); const x = rnz(R, -m, m), q = rnz(R, -m, m); if (x > 0 && q > 0) return null; const c = x * q;
    return { q:`${N(c)} ÷ ? = ${N(q)}`, kind:'num', a:x, hint:'What number can you divide by to get the answer? Try dividing the first number by the answer.',
      steps:[`If ${N(c)} ÷ ? = ${N(q)}, then ? = ${N(c)} ÷ ${P(q)}.`, ...mulSign(c, q, '÷', x).slice(0, 2), `The missing number is ${N(x)}. Check: ${N(c)} ÷ ${P(x)} = ${N(q)} ✓`] }; });
  // sign of a product without multiplying
  addT(IO, (R, lvl) => { const k = lvl === 3 ? 4 : 3, m = Math.min(ioM(lvl), 9); const f = []; for (let i = 0; i < k; i++) f.push(rnz(R, -m, m));
    const neg = f.filter(x => x < 0).length; if (!neg) return null; const a = neg % 2 ? 'negative' : 'positive'; const t = f.map((x, i) => i ? P(x) : N(x)).join(' × ');
    return { q:`Without multiplying, is  ${t}  positive or negative?`, kind:'choice', a, choices:['positive', 'negative'],
      hint:'Count the negative numbers. An even number of negatives → positive. An odd number → negative.',
      steps:[`Count the negative numbers: there ${neg === 1 ? 'is' : 'are'} ${neg}.`, neg % 2 ? `${neg} is odd, so one negative is left without a partner. The answer is negative.` : `${neg} is even, so the negatives pair up, and each pair makes a positive. The answer is positive.`, `Check: ${t} = ${N(f.reduce((s, x) => s * x, 1))}`, `Answer: ${a}`] }; });
  // contexts
  addT(IO, (R, lvl) => { const L = ioLim(lvl); const st = R.int(-L, Math.round(L / 2)), d = R.int(2, L), up = R.chance(0.5); const r = up ? st + d : st - d; if (st >= 0 && r >= 0) return null;
    const when = R.pick(['At 6 a.m.', 'At midnight', 'At sunrise', 'Early in the morning', 'At 5 p.m.']);
    return { q:`${when} the temperature was ${N(st)}°F. Then it ${up ? 'rose' : 'dropped'} ${d} degrees. What was the new temperature?`, kind:'num', a:r, unit:'°F', model:nlAuto([{ x:st, label:'start' }], [r]),
      hint: up ? '"Rose" means the temperature went UP: add, or move right on the number line.' : '"Dropped" means the temperature went DOWN: subtract, or move left on the number line.',
      steps:[up ? `Rose means add: ${N(st)} + ${d}` : `Dropped means subtract: ${N(st)} − ${d}`, `On the number line, start at ${N(st)} and move ${d} to the ${up ? 'right' : 'left'}.`, `You land on ${N(r)}.`, `The new temperature is ${N(r)}°F.`] }; });
  addT(IO, (R, lvl) => { const L = ioLim(lvl); const lo = R.int(-L, -1), hi = R.int(lo + 3, Math.max(lo + 4, L)); const a = hi - lo;
    const city = R.pick(['Fairbanks', 'Minneapolis', 'Duluth', 'Buffalo', 'Anchorage', 'Fargo']);
    return { q:`In ${city}, the high temperature was ${N(hi)}°F and the low was ${N(lo)}°F. How many degrees warmer was the high than the low?`, kind:'num', a, unit:'°F',
      model:nlAuto([{ x:lo, label:'low' }, { x:hi, label:'high' }], []), hint:'Find the difference: high − low. Subtracting a negative is adding.',
      steps:[`Difference = high − low = ${N(hi)} − ${P(lo)}`, `Subtracting a negative is the same as adding: ${N(hi)} + ${-lo}`, `${N(hi)} + ${-lo} = ${a}`, `The high was ${a} degrees warmer.`] }; });
  addT(IO, (R, lvl) => { const L = ioLim(lvl) * 2; const d = R.int(6, L), u = R.int(2, d - 1); const r = -d + u;
    return { q:`A diver is at ${N(-d)} feet (below sea level). She swims UP ${u} feet. What is her new elevation?`, kind:'num', a:r, unit:'ft', model:nlAuto([{ x:-d, label:'diver' }, { x:0, label:'sea' }], [r]),
      hint:'Going up means add. Start at the diver and move toward 0.',
      steps:[`Up means add: ${N(-d)} + ${u}`, ...addSteps(-d, u).slice(0, -1), `Her new elevation is ${N(r)} feet.`] }; });
  addT(IO, (R, lvl) => { const L = ioLim(lvl) * 2; const d = R.int(5, L), u = R.int(5, L); const r = -d - u;
    return { q:`A submarine is at ${N(-d)} feet. It dives DOWN another ${u} feet. What is its new elevation?`, kind:'num', a:r, unit:'ft',
      hint:'Going down means subtract. You are already below 0, so you go even lower.',
      steps:[`Down means subtract: ${N(-d)} − ${u}`, `Same as adding a negative: ${N(-d)} + ${P(-u)}`, ...addSteps(-d, -u).slice(0, -1), `The new elevation is ${N(r)} feet.`] }; });
  addT(IO, (R, lvl) => { const L = ioLim(lvl) * 2; const e = R.int(2, L), d = R.int(e + 1, e + L); const r = e - d;
    return { q:`A hiker starts on a trail at ${e} feet above sea level and walks DOWN ${d} feet into a valley below sea level. What is the hiker's new elevation?`, kind:'num', a:r, unit:'ft',
      hint:'Start at the first elevation and subtract how far the hiker walked down.',
      steps:[`Down means subtract: ${e} − ${d}`, ...subSteps(e, d).slice(0, -1), `${e} − ${d} = ${N(r)}`, `The hiker is at ${N(r)} feet, below sea level.`] }; });
  addT(IO, (R, lvl) => { const L = ioLim(lvl) * 2; const x = R.int(5, L), y = R.int(5, L); const r = y - x; const n = R.pick(NAMES);
    return { q:`${n}'s account balance is ${money(-x)} (${n} owes money). Then ${n} deposits $${y}. What is the new balance in dollars?`, kind:'num', a:r, unit:'$',
      hint:'A deposit adds money. Start at the negative balance and add.',
      steps:[`Start: ${N(-x)}. A deposit adds: ${N(-x)} + ${y}`, ...addSteps(-x, y).slice(0, -1), `The new balance is ${money(r)}.`] }; });
  addT(IO, (R, lvl) => { const L = ioLim(lvl) * 2; const x = R.int(2, L), y = R.int(x + 1, x + L); const r = x - y; const n = R.pick(NAMES);
    return { q:`${n} has $${x} in the bank and spends $${y}, so the account goes below $0. What is the new balance in dollars?`, kind:'num', a:r, unit:'$',
      hint:'Spending subtracts. If you spend more than you have, the balance is negative.',
      steps:[`Spending subtracts: ${x} − ${y}`, `${y} is more than ${x}, so the answer is negative.`, `Sizes: ${y} − ${x} = ${y - x}`, `The new balance is ${money(r)} (${n} owes $${y - x}).`] }; });
  addT(IO, (R, lvl) => { const k = lvl + 1; const p = []; for (let i = 0; i < k; i++) p.push(R.chance(0.5) ? R.int(1, 15) : -R.int(1, 15));
    if (!p.some(x => x < 0) || !p.some(x => x > 0)) return null; const w = p.map(x => x > 0 ? `gained ${x} yards` : `lost ${-x} yards`);
    const desc = w.length === 2 ? w.join(' and then ') : w.slice(0, -1).join(', ') + ', and then ' + w[w.length - 1]; const t = sum(p);
    const run2 = []; let s = p[0]; for (let i = 1; i < p.length; i++){ run2.push(`${N(s)} + ${P(p[i])} = ${N(s + p[i])}`); s += p[i]; }
    return { q:`A football team ${desc}. What is the total change in yards?`, kind:'num', a:t, unit:'yards',
      hint:'Gains are positive. Losses are negative. Add them all up.',
      steps:[`Write each play as an integer: ${p.map(N).join(', ')}`, ...run2, `The total change is ${N(t)} yards.`] }; });
  addT(IO, (R, lvl) => { const k = lvl + 2; const p = []; for (let i = 0; i < k; i++) p.push(R.int(-2, 2)); if (!p.some(x => x < 0)) return null; const t = sum(p); const n = R.pick(NAMES);
    return { q:`In golf, a score below par is negative. ${n}'s scores compared to par on ${k} holes were ${p.map(sgn).join(', ')}. What is ${n}'s total compared to par?`, kind:'num', a:t,
      hint:'Add the scores. Each +1 and −1 pair cancels to 0.',
      steps:[`Add the positives: ${sum(p.filter(x => x > 0))}`, `Add the negatives: ${N(sum(p.filter(x => x < 0)))}`, `${sum(p.filter(x => x > 0))} + ${P(sum(p.filter(x => x < 0)))} = ${N(t)}`, `${n}'s total is ${sgn(t)} compared to par.`] }; });
  for (const want of ['NEGATIVE', 'POSITIVE']) addT(IO, (R, lvl) => { const one = [], three = [], seen = new Set();
    for (let g = 0; g < 300 && (one.length < 1 || three.length < 3); g++){ const o = opProb(R, lvl, R.pick(OPS)); if (seen.has(o.txt) || o.r === 0) continue;
      const isW = want === 'NEGATIVE' ? o.r < 0 : o.r > 0; if (isW && one.length < 1){ one.push(o); seen.add(o.txt); } else if (!isW && three.length < 3){ three.push(o); seen.add(o.txt); } }
    if (one.length < 1 || three.length < 3) return null; const all = [one[0], ...three];
    return { q:`Which expression has a ${want} value?`, kind:'choice', a:one[0].txt, choices:all.map(o => o.txt),
      hint:'Work out the sign of each one. Look at the sign rules for each operation.',
      steps:[...all.map(o => `${o.txt} = ${N(o.r)}`), `Only ${one[0].txt} is ${want.toLowerCase()}.`] }; });
  function mistake(R, lvl, nm){ const L = ioLim(lvl), m = ioM(lvl); const kind = R.int(0, 3); let a, b, r, wrong, why, steps;
    if (kind === 0){ a = rnz(R, -L, L); b = -R.int(1, L); r = a - b; wrong = a + b; why = `${nm} forgot that subtracting a negative is the same as ADDING its opposite.`; steps = subSteps(a, b); return { txt:`${N(a)} − ${P(b)}`, r, wrong, why, steps }; }
    if (kind === 1){ a = -R.int(2, m); b = -R.int(2, m); r = a * b; wrong = -r; why = 'A negative times a negative is POSITIVE.'; return { txt:`${N(a)} × ${P(b)}`, r, wrong, why, steps:mulSign(a, b, '×', r) }; }
    if (kind === 2){ a = -R.int(2, L); b = R.int(1, L); if (b === -a) return null; r = a + b; wrong = a - b; why = 'When the signs are different, SUBTRACT the sizes and keep the sign of the number farther from 0.'; return { txt:`${N(a)} + ${b}`, r, wrong, why, steps:addSteps(a, b) }; }
    b = -R.int(2, m); const q = -R.int(1, m); a = b * q; r = q; wrong = -q; why = 'Different signs → the answer is NEGATIVE.'; return { txt:`${N(a)} ÷ ${P(b)}`, r, wrong, why, steps:mulSign(a, b, '÷', r) };
  }
  addT(IO, (R, lvl) => { const nm = R.pick(NAMES); const e = mistake(R, lvl, nm); if (!e || e.wrong === e.r) return null;
    return { q:`${nm} says ${e.txt} = ${N(e.wrong)}. That is not right. What is the correct answer?`, kind:'num', a:e.r, hint:'Check the sign rules one step at a time.',
      steps:[e.why, ...e.steps, `The correct answer is ${N(e.r)}.`] }; });
  addT(IO, (R, lvl) => { const [n1, n2] = two(R); const e = mistake(R, lvl, 'One student'); if (!e || e.wrong === e.r) return null; const first = R.chance(0.5);
    const v1 = first ? e.r : e.wrong, v2 = first ? e.wrong : e.r; const a = first ? n1 : n2;
    return { q:`${n1} says ${e.txt} = ${N(v1)}. ${n2} says ${e.txt} = ${N(v2)}. Who is correct?`, kind:'choice', a, choices:[n1, n2],
      hint:'Work it out yourself first, then see whose answer matches.', steps:[...e.steps, `${a} is correct. ${e.why.replace('One student', 'The other student')}`] }; });
  addT(IO, (R, lvl) => { const L = ioLim(lvl); const a = R.int(-L, L), d = R.int(2, L), left = R.chance(0.5); const r = left ? a - d : a + d; if (a >= 0 && r >= 0) return null;
    return { q:`Start at ${N(a)} on a number line. Move ${d} units to the ${left ? 'LEFT' : 'RIGHT'}. Where do you land?`, kind:'num', a:r, model:nlAuto([{ x:a, label:'start' }], [r]),
      hint:'Moving right adds. Moving left subtracts.',
      steps:[left ? `Left means subtract: ${N(a)} − ${d}` : `Right means add: ${N(a)} + ${d}`, `Count ${d} jumps from ${N(a)}.`, `You land on ${N(r)}.`] }; });
  addT(IO, (R, lvl) => { const L = [0, 10, 15, 20][lvl]; const x = R.int(1, L), y = R.int(1, L); const r = x - y; const z = Math.min(x, y);
    return { q:`A mat has ${x} positive counters (+1 each) and ${y} negative counters (−1 each). After you take away all the zero pairs, what is the value on the mat?`, kind:'num', a:r,
      hint:'One + counter and one − counter make a zero pair (+1 + −1 = 0). Take the pairs away and count what is left.',
      steps:[`Match each + with a −. You can make ${z} zero ${plural(z, 'pair')}.`, `Take them away: ${x - z} positive and ${y - z} negative counters are left.`, r === 0 ? 'Nothing is left, so the value is 0.' : `${Math.abs(r)} ${r > 0 ? 'positive' : 'negative'} ${plural(Math.abs(r), 'counter')} left.`, `Value: ${N(r)}  (that is ${x} + ${P(-y)} = ${N(r)})`] }; });
  addT(IO, (R, lvl) => { const d = R.int(1, [0, 4, 7, 9][lvl]), h = R.int(2, [0, 5, 8, 12][lvl]); const r = -d * h;
    return { q:`The temperature dropped ${d} ${plural(d, 'degree')} every hour for ${h} hours. What was the total change in temperature? (Use a negative number for a drop.)`, kind:'num', a:r, unit:'°',
      hint:'A drop each hour is a negative number. Multiply it by the number of hours.',
      steps:[`A drop of ${d} each hour is ${N(-d)}.`, `${h} hours: ${h} × ${P(-d)}`, `Different signs → negative: ${h} × ${d} = ${d * h}, so ${N(r)}`, `The total change was ${N(r)}°.`] }; });
  addT(IO, (R, lvl) => { const d = R.int(2, [0, 10, 25, 40][lvl]), m = R.int(2, [0, 5, 8, 10][lvl]); const r = -d * m;
    return { q:`A submarine starts at sea level and dives ${d} feet each minute for ${m} minutes. What is its elevation now?`, kind:'num', a:r, unit:'ft',
      hint:'Diving down is negative. Multiply the change each minute by the number of minutes.',
      steps:[`Each minute: ${N(-d)} feet.`, `${m} minutes: ${m} × ${P(-d)}`, `Different signs → negative: ${m} × ${d} = ${d * m}`, `The submarine is at ${N(r)} feet.`] }; });
  addT(IO, (R, lvl) => { const k = R.int(2, [0, 4, 6, 9][lvl]), s = R.int(2, [0, 10, 20, 40][lvl]); const x = k * s;
    return { q:`${k} friends share a debt of $${x} equally. What integer shows each friend's share? (Use a negative number for money owed.)`, kind:'num', a:-s, unit:'$',
      hint:'A debt is negative. Divide the debt by the number of friends.',
      steps:[`The debt is ${N(-x)}.`, `Share it ${k} ways: ${N(-x)} ÷ ${k}`, `Different signs → negative: ${x} ÷ ${k} = ${s}`, `Each friend's share is ${N(-s)}.`] }; });
  addT(IO, (R, lvl) => { const op = R.pick(OPS); const o = opProb(R, lvl, op); const w = OPWORD[op];
    return { q:`What is the ${w} of ${N(o.a)} and ${N(o.b)}?`, kind:'num', a:o.r, hint:'Sum = add. Difference = subtract. Product = multiply. Quotient = divide.',
      steps:[`"${w[0].toUpperCase() + w.slice(1)}" means ${{ sum:'add', difference:'subtract', product:'multiply', quotient:'divide' }[w]}: ${o.txt}`, ...o.steps] }; });
  addT(IO, (R, lvl) => { const L = ioLim(lvl); const a = rnz(R, -L, L), b = rnz(R, -L, L); if (a === b || a === -b) return null; const t = a - b;
    const ans = `${N(a)} + ${P(-b)}`; const ds = [[`${N(a)} + ${P(b)}`, a + b], [`${N(b)} − ${P(a)}`, b - a], [`${N(-a)} − ${P(b)}`, -a - b], [`${N(-a)} + ${P(-b)}`, -a - b]].filter(x => x[1] !== t).map(x => x[0]);
    return { q:`Which expression has the same value as  ${N(a)} − ${P(b)}?`, kind:'choice', a:ans, choices:choose(ans, ds), hint:'Subtracting a number is the same as adding its opposite.',
      steps:[`Keep the first number: ${N(a)}`, `Change − to +, and change ${N(b)} to its opposite, ${N(-b)}.`, `${N(a)} − ${P(b)} = ${ans} = ${N(t)}`, `Answer: ${ans}`] }; });
  // multi-step, shown with the order-of-operations engine
  function ioExpr(R, lvl, shape){
    const L = Math.min(ioLim(lvl), 20), m = Math.min(ioM(lvl), 9);
    for (let g = 0; g < 60; g++){ let it;
      const a = rnz(R, -L, L), b = rnz(R, -L, L), c = rnz(R, -L, L), x = rnz(R, -m, m), y = rnz(R, -m, m);
      if (shape === 0) it = [num(a), R.pick(['+', '−']), num(b), R.pick(['+', '−']), num(c)];
      else if (shape === 1) it = [num(x), '×', num(y), R.pick(['+', '−']), num(c)];
      else if (shape === 2) it = [num(x * y), '÷', num(x), R.pick(['+', '−']), num(c)];
      else if (shape === 3) it = [grp([num(a), R.pick(['+', '−']), num(b)]), '×', num(y)];
      else it = [num(x), '×', num(y), '×', num(rnz(R, -5, 5))];
      if (!it.some((t, i) => i % 2 === 0 && ((isN(t) && t.n < 0) || (t.g && t.g.some((u, j) => j % 2 === 0 && u.n < 0))))) continue;
      const s = solve(it); if (!s || s.mx > 400) continue; return { it, s };
    }
    return null;
  }
  addT(IO, (R, lvl) => { const e = ioExpr(R, lvl, 0); if (!e) return null;
    return { q:`${show(e.it)} = ?`, kind:'num', a:e.s.v, hint:'Work from left to right, one step at a time. Change each subtraction into adding the opposite.', steps:stepLines(e.s) }; });
  addT(IO, [2, 3], (R, lvl) => { const e = ioExpr(R, lvl, R.int(1, 2)); if (!e) return null;
    return { q:`${show(e.it)} = ?`, kind:'num', a:e.s.v, hint:'Multiply or divide first, then add or subtract. Watch the signs!', steps:stepLines(e.s) }; });
  addT(IO, [2, 3], (R, lvl) => { const e = ioExpr(R, lvl, R.pick([3, 4])); if (!e) return null;
    return { q:`${show(e.it)} = ?`, kind:'num', a:e.s.v, hint:'Do the parentheses first, then multiply. Count the negative signs.', steps:stepLines(e.s) }; });
  addT(IO, [1], (R, lvl) => { const a = -R.int(1, 9), b = -R.int(1, 9); const r = a + b;
    return { q:`Two negative numbers, ${N(a)} and ${N(b)}, are added. What is the sum?`, kind:'num', a:r, hint:'Same signs: add the sizes and keep the negative sign.', steps:addSteps(a, b) }; });
  addT(IO, [2, 3], (R, lvl) => { const k = R.pick([3, 4]); const L = ioLim(lvl); for (let g = 0; g < 80; g++){
      const v = []; for (let i = 0; i < k; i++) v.push(R.int(-L, Math.round(L / 3))); const s = sum(v); if (s % k || s === 0 || !v.some(x => x < 0)) continue; const mean = s / k;
      return { q:`The low temperatures on ${k} days were ${v.map(N).join(', ')} °F. What was the mean (average) low temperature?`, kind:'num', a:mean, unit:'°F',
        hint:'Add all the temperatures, then divide by how many there are.',
        steps:[`Add them: ${v.map((x, i) => i ? P(x) : N(x)).join(' + ')} = ${N(s)}`, `There are ${k} days, so divide: ${N(s)} ÷ ${k}`, `${mean < 0 ? 'Different signs → negative. ' : ''}${Math.abs(s)} ÷ ${k} = ${Math.abs(mean)}`, `The mean is ${N(mean)}°F.`] }; } return null; });
  addT(IO, (R, lvl) => { const o1 = opProb(R, lvl, R.pick(OPS)), o2 = opProb(R, lvl, R.pick(OPS)); if (o1.txt === o2.txt) return null;
    const a = o1.r > o2.r ? o1.txt : o1.r < o2.r ? o2.txt : 'They are equal';
    return { q:`Which has the greater value:  ${o1.txt}  or  ${o2.txt}?`, kind:'choice', a, choices:[o1.txt, o2.txt, 'They are equal'],
      hint:'Work out each one. Then the greater number is the one farther RIGHT on the number line.',
      steps:[`${o1.txt} = ${N(o1.r)}`, `${o2.txt} = ${N(o2.r)}`, `Answer: ${a}`] }; });
  addT(IO, (R, lvl) => { const L = ioLim(lvl); const a = rnz(R, -L, L);
    return { q:`What number can you add to ${N(a)} to get exactly 0?`, kind:'num', a:-a, hint:'A number plus its opposite is 0. That is a zero pair!',
      steps:[`${N(a)} is ${Math.abs(a)} units from 0.`, `To get back to 0, add its opposite, ${N(-a)}.`, `${N(a)} + ${P(-a)} = 0`, `Answer: ${N(-a)}`] }; });

  M['g5.intops'] = { name:'Add, subtract, multiply & divide integers', unit:'g5u5', warm:true, gen(R, lvl){ return run(R, lvl, IO); } };

  // ======================= g5.orderops =======================
  // operand: whole numbers at L1/L2, sometimes negative at L3
  function ov(R, lvl, lo, hi){ return lvl === 3 && R.chance(0.45) ? -R.int(Math.max(1, lo), hi) : R.int(lo, hi); }
  const OSHAPES = [
    (R, l) => [num(ov(R, l, 1, 12 + 6 * l)), '+', num(ov(R, l, 2, 9)), '×', num(ov(R, l, 2, 9))],
    (R, l) => [grp([num(ov(R, l, 1, 12)), '+', num(ov(R, l, 1, 12))]), '×', num(ov(R, l, 2, 6))],
    (R, l) => { const d = ov(R, l, 2, 9), q = R.int(1, 9); return [num(ov(R, l, 10, 20 + 10 * l)), '−', num(d * q), '÷', num(d)]; },
    (R, l) => { const d = ov(R, l, 2, 6), q = R.int(1, 5); return [num(ov(R, l, 2, 9)), '×', num(ov(R, l, 2, 9)), '−', num(d * q), '÷', num(d)]; },
    (R, l) => [num(ov(R, l, 1, 20)), '+', pow(num(ov(R, l, 2, l === 1 ? 4 : 6)), 2), '×', num(ov(R, l, 2, 5))],
    (R, l) => [pow(grp([num(ov(R, l, 1, 6)), '+', num(ov(R, l, 1, 6))]), 2), '−', num(ov(R, l, 1, 20))],
    (R, l) => [num(ov(R, l, 2, 6)), '×', grp([num(ov(R, l, 2, 9)), '+', num(ov(R, l, 1, 9))]), '−', pow(num(R.int(2, l === 1 ? 3 : 4)), 2)],
    (R, l) => { const a = ov(R, l, 2, 10); const ds = [2, 3, 4, 5, 6, 8, 9].filter(d => (a * a) % d === 0); return [pow(num(a), 2), '÷', num(R.pick(ds)), '+', num(ov(R, l, 1, 15))]; },
    (R, l) => [num(ov(R, l, 2, 5)), '×', grp([num(ov(R, l, 2, 9)), '+', grp([num(ov(R, l, 5, 15)), '−', num(R.int(1, 4))])], true)],
    (R, l) => { const e = rnz(R, l === 3 ? -6 : 1, 6), q = ov(R, l, 1, 6), s = e * q, a = l === 3 ? R.int(-3, s + 3) : R.int(1, Math.max(1, s - 1)); const c = ov(R, l, 7, 12);
      return [grp([num(a), '+', num(s - a)]), '÷', grp([num(c), '−', num(c - e)])]; },
    (R, l) => { const b = ov(R, l, 2, 6), q = R.int(2, 8); return [num(b * q), '÷', num(b), '×', num(ov(R, l, 2, 5))]; },
    (R, l) => [num(ov(R, l, 10, 30)), '−', num(ov(R, l, 2, 9)), '+', num(ov(R, l, 2, 9))],
    (R, l) => [num(ov(R, l, 2, 5)), '×', pow(num(ov(R, l, 2, 4)), 2)],
    (R, l) => [num(ov(R, l, 5, 20)), '+', num(ov(R, l, 2, 7)), '×', num(ov(R, l, 2, 7)), '−', num(ov(R, l, 1, 9))],
    (R, l) => [pow(num(ov(R, l, 3, l === 1 ? 6 : 9)), 2), '−', num(ov(R, l, 2, 5)), '×', num(ov(R, l, 2, 5))],
    (R, l) => [grp([num(ov(R, l, 8, 15)), '−', num(ov(R, l, 1, 7))]), '×', grp([num(ov(R, l, 1, 5)), '+', num(ov(R, l, 1, 5))])]
  ];
  // build a valid expression from shape i: whole-number results at every step; no negatives below L3
  function oMake(R, lvl, i){
    for (let g = 0; g < 80; g++){ const it = OSHAPES[i](R, lvl); const s = solve(it); if (!s) continue;
      if (lvl < 3 && s.mn < 0) continue; if (s.mx > (lvl === 1 ? 200 : 600)) continue; return { it, s }; }
    return null;
  }
  const OO = [];
  // find the value: one type per expression shape
  OSHAPES.forEach((_, i) => addT(OO, (R, lvl) => { const e = oMake(R, lvl, i); if (!e) return null;
    return { q:`Find the value:  ${show(e.it)}`, kind:'num', a:e.s.v, hint:PEMDAS, steps:stepLines(e.s) }; }));
  // which part first?
  function opPairs(items, out){
    for (let i = 0; i < items.length; i++){ const t = items[i];
      if (i % 2){ const L = items[i - 1], Rt = items[i + 1]; if (isN(L) && isN(Rt)) out.push(`${N(L.n)} ${t} ${P(Rt.n)}`); continue; }
      if (t.g) opPairs(t.g, out); else if (t.p){ if (isN(t.p)) out.push(pw(t.p.n, t.e)); else if (t.p.g) opPairs(t.p.g, out); } }
    return out;
  }
  addT(OO, (R, lvl) => { const e = oMake(R, lvl, R.pick([0, 2, 3, 4, 6, 7, 8, 13, 14, 15])); if (!e) return null;
    const first = e.s.steps[0].txt.split(' = ')[0]; const cs = opPairs(e.it, []); if (cs.indexOf(first) < 0) return null; const ds = cs.filter(c => c !== first); if (!ds.length) return null;
    const why = e.s.steps[0].inside ? `It is inside the ${e.s.steps[0].gk}, and parentheses come first.` : e.s.steps[0].k === 'exp' ? 'There are no parentheses left to do, so the exponent comes first.' : 'There are no parentheses or exponents, so multiplication and division come before addition and subtraction.';
    return { q:`In  ${show(e.it)},  which part should you do FIRST?`, kind:'choice', a:first, choices:choose(first, ds), hint:PEMDAS,
      steps:['Go down the list: Parentheses, Exponents, × and ÷, then + and −.', why, `So do ${first} first.`] }; });
  const OPNAME = { exp:'the exponent', '×':'multiplication', '÷':'division', '+':'addition', '−':'subtraction' };
  addT(OO, (R, lvl) => { const e = oMake(R, lvl, R.int(0, OSHAPES.length - 1)); if (!e || e.s.steps.length < 2) return null;
    const last = OPNAME[e.s.steps[e.s.steps.length - 1].k]; const present = [...new Set(e.s.steps.map(s => OPNAME[s.k]))].filter(x => x !== last);
    const others = Object.values(OPNAME).filter(x => x !== last && present.indexOf(x) < 0);
    return { q:`In  ${show(e.it)},  which operation do you do LAST?`, kind:'choice', a:last, choices:choose(last, [...present, ...others]), hint:PEMDAS,
      steps:[...stepLines(e.s).slice(0, -1), `The very last step was ${last}.`] }; });
  // where do the parentheses go?
  addT(OO, (R, lvl) => { for (let g = 0; g < 60; g++){
      const a = R.int(1, 9), b = R.int(1, 9), c = R.int(3, 9), d = R.int(1, c - 1);
      const plain = [num(a), '+', num(b), '×', num(c), '−', num(d)];
      const opts = [[grp([num(a), '+', num(b)]), '×', num(c), '−', num(d)], [num(a), '+', num(b), '×', grp([num(c), '−', num(d)])], [grp([num(a), '+', num(b)]), '×', grp([num(c), '−', num(d)])]];
      const pv = solve(plain).v, vals = opts.map(o => solve(o).v); if (new Set([pv, ...vals]).size < 4) continue;
      const k = R.int(0, 2), T = vals[k], ans = show(opts[k]);
      return { q:`Where do the parentheses go to make this true?   ${show(plain)} = ${T}`, kind:'choice', a:ans, choices:[...opts.map(show), 'No parentheses are needed'],
        hint:'Try each choice. Do the parentheses first, then finish with the order of operations.',
        steps:[`With no parentheses: ${show(plain)} = ${pv}`, ...opts.map((o, i) => `${show(o)} = ${vals[i]}${i === k ? '  ✓' : ''}`), `Answer: ${ans}`] }; } return null; });
  addT(OO, (R, lvl) => { for (let g = 0; g < 60; g++){
      const a = R.int(2, 6), b = R.int(4, 12), c = R.int(1, b - 1), d = R.int(1, 9);
      const plain = [num(a), '×', num(b), '−', num(c), '+', num(d)];
      const opts = [[num(a), '×', grp([num(b), '−', num(c)]), '+', num(d)], [num(a), '×', num(b), '−', grp([num(c), '+', num(d)])], [num(a), '×', grp([num(b), '−', num(c), '+', num(d)])]];
      const ps = solve(plain); if (!ps || ps.mn < 0) continue; const sols = opts.map(o => solve(o)); if (sols.some(s => !s || s.mn < 0)) continue;
      const vals = sols.map(s => s.v); if (new Set([ps.v, ...vals]).size < 4) continue;
      const k = R.int(0, 2), T = vals[k], ans = show(opts[k]);
      return { q:`Add ONE pair of parentheses to make this true:   ${show(plain)} = ${T}`, kind:'choice', a:ans, choices:[...opts.map(show), 'No parentheses are needed'],
        hint:'Test each choice. Remember: parentheses first!',
        steps:[`With no parentheses: ${show(plain)} = ${ps.v}`, ...opts.map((o, i) => `${show(o)} = ${vals[i]}${i === k ? '  ✓' : ''}`), `Answer: ${ans}`] }; } return null; });
  // error analysis
  addT(OO, (R, lvl) => { const nm = R.pick(NAMES); const e = oMake(R, lvl, R.pick([0, 2, 3, 13, 14])); if (!e) return null; const w = ltr(e.it); if (w === null || w === e.s.v) return null;
    return { q:`${nm} got ${N(w)} for  ${show(e.it)}.  What is the correct value?`, kind:'num', a:e.s.v, hint:PEMDAS,
      steps:[`${nm} worked straight from left to right. That is the mistake!`, '× and ÷ must come before + and −.', ...stepLines(e.s)] }; });
  addT(OO, (R, lvl) => { const nm = R.pick(NAMES); const e = oMake(R, lvl, R.pick([0, 2, 3, 4, 13, 14])); if (!e) return null; const w = ltr(e.it); if (w === null || w === e.s.v) return null;
    const right = R.chance(0.5), claim = right ? e.s.v : w, a = right ? 'Yes' : 'No';
    return { q:`${nm} says  ${show(e.it)} = ${N(claim)}.  Is ${nm} correct?`, kind:'choice', a, choices:['Yes', 'No'], hint:'Work it out yourself with the order of operations, then compare.',
      steps:[...stepLines(e.s), right ? `${nm} got ${N(claim)}, which matches. Yes!` : `${nm} got ${N(claim)} by going left to right. The correct value is ${N(e.s.v)}, so No.`] }; });
  const WHY = ['Added before multiplying', 'Subtracted before dividing', 'Multiplied the base by the exponent instead of using it as a power', 'Did not do the parentheses first'];
  addT(OO, (R, lvl) => { const nm = R.pick(NAMES); const k = R.int(0, 3); let it, wrong;
    const a = R.int(2, 12), b = R.int(2, 9), c = R.int(2, 9);
    if (k === 0){ it = [num(a), '+', num(b), '×', num(c)]; wrong = (a + b) * c; }
    else if (k === 1){ const d = R.int(2, 6), q = R.int(2, 6), x = R.int(1, 20); it = [num(x + d * q + d * R.int(1, 4)), '−', num(d * q), '÷', num(d)]; const t = it[0].n - d * q; if (t % d) return null; wrong = t / d; }
    else if (k === 2){ const bb = R.int(3, 9); it = [num(a), '+', pow(num(bb), 2)]; wrong = a + bb * 2; }
    else { it = [grp([num(a), '+', num(b)]), '×', num(c)]; wrong = a + b * c; }
    const s = solve(it); if (!s || s.v === wrong) return null; const ans = WHY[k];
    return { q:`${nm} worked out  ${show(it)}  and got ${wrong}. What mistake did ${nm} make?`, kind:'choice', a:ans, choices:WHY, hint:'Work it out the right way, then see which step went wrong.',
      steps:[...stepLines(s), `${nm} got ${wrong} instead, because ${nm}: ${ans.toLowerCase()}.`] }; });
  // stories: write the expression, and find the value
  const STORIES = [
    (R) => { const p = R.int(2, 6), q = R.int(4, 12), r = R.int(2, 9), n = R.pick(NAMES); return { t:`${n} buys ${p} packs of ${q} stickers and then gets ${r} more stickers.`, ask:'How many stickers does ' + n + ' have?',
      it:[num(p), '×', num(q), '+', num(r)], bad:[[num(p), '×', grp([num(q), '+', num(r)])], [num(p), '+', num(q), '×', num(r)], [grp([num(p), '+', num(q)]), '×', num(r)]] }; },
    (R) => { const k = R.int(2, 5), c = R.int(3, 9), m = k * c + R.int(2, 20), n = R.pick(NAMES); return { t:`${n} has $${m} and buys ${k} books that cost $${c} each.`, ask:'How many dollars are left?',
      it:[num(m), '−', num(k), '×', num(c)], bad:[[grp([num(m), '−', num(k)]), '×', num(c)], [num(m), '−', num(k), '+', num(c)], [num(k), '×', num(c), '+', num(m)]] }; },
    (R) => { const k = R.int(2, 8), a = R.int(2, 6), b = R.int(2, 6); return { t:`Each of ${k} friends gets a bag with ${a} apples and ${b} oranges.`, ask:'How many pieces of fruit is that in all?',
      it:[num(k), '×', grp([num(a), '+', num(b)])], bad:[[num(k), '×', num(a), '+', num(b)], [num(k), '+', num(a), '×', num(b)], [grp([num(k), '+', num(a)]), '×', num(b)]] }; },
    (R) => { const k = R.int(2, 6), e = R.int(1, 5), t = k * R.int(3, 9); return { t:`${t} cookies are shared equally by ${k} friends. Then each friend gets ${e} more cookies from a new batch.`, ask:'How many cookies does each friend have?',
      it:[num(t), '÷', num(k), '+', num(e)], bad:[[num(t), '÷', grp([num(k), '+', num(e)])], [grp([num(t), '+', num(e)]), '÷', num(k)], [num(t), '×', num(k), '+', num(e)]] }; },
    (R) => { const d = R.int(5, 15), w = R.int(2, 7), s = R.int(1, 20), n = R.pick(NAMES); return { t:`${n} earns $${d} a day for ${w} days, then spends $${s}.`, ask:'How many dollars does ' + n + ' have now?',
      it:[num(d), '×', num(w), '−', num(s)], bad:[[num(d), '×', grp([num(w), '−', num(s)])], [num(d), '+', num(w), '−', num(s)], [num(s), '−', num(d), '×', num(w)]] }; },
    (R) => { const s = R.int(3, 9), x = R.int(2, 20); return { t:`A square garden has sides of ${s} feet. A flower bed of ${x} square feet is added next to it.`, ask:'What is the total area in square feet?',
      it:[pow(num(s), 2), '+', num(x)], bad:[[num(s), '×', num(2), '+', num(x)], [pow(grp([num(s), '+', num(x)]), 2)], [num(4), '×', num(s), '+', num(x)]] }; },
    (R) => { const t = R.int(3, 8), a = R.int(2, 6), b = R.int(2, 6); return { t:`A team plays ${t} games. In each game they score ${a} goals in the first half and ${b} goals in the second half.`, ask:'How many goals do they score in all?',
      it:[num(t), '×', grp([num(a), '+', num(b)])], bad:[[num(t), '×', num(a), '+', num(b)], [num(t), '+', num(a), '+', num(b)], [grp([num(t), '+', num(a)]), '×', num(b)]] }; }
  ];
  STORIES.forEach(S => {
    addT(OO, (R, lvl) => { const st = S(R); const ans = show(st.it); const bad = st.bad.map(show).filter(x => x !== ans);
      return { q:`${st.t} Which expression shows the answer to "${st.ask}"`, kind:'choice', a:ans, choices:choose(ans, bad), hint:'Read the story in order. Which numbers must be grouped or multiplied together?',
        steps:['Think about what happens first in the story, and what is multiplied or grouped.', `The story matches ${ans}.`, `Its value is ${N(solve(st.it).v)}.`] }; });
    addT(OO, (R, lvl) => { const st = S(R); const s = solve(st.it); if (!s || s.v < 0) return null;
      return { q:`${st.t} ${st.ask}`, kind:'num', a:s.v, hint:'Write an expression for the story first. Then use the order of operations.',
        steps:[`Expression: ${show(st.it)}`, ...stepLines(s)] }; });
  });
  // compare two expressions
  addT(OO, (R, lvl) => { const a = R.int(2, 9), b = R.int(2, 9), c = R.int(2, 9); const k = R.int(0, 2); let e1, e2;
    if (k === 0){ e1 = [num(a), '+', num(b), '×', num(c)]; e2 = [grp([num(a), '+', num(b)]), '×', num(c)]; }
    else if (k === 1){ e1 = [num(a), '×', pow(num(b % 4 + 2), 2)]; e2 = [pow(grp([num(a), '×', num(b % 4 + 2)]), 2)]; }
    else { const x = R.int(20, 40); e1 = [num(x), '−', num(b), '−', num(c)]; e2 = [num(x), '−', grp([num(b), '−', num(c)])]; }
    if (R.chance(0.5)) [e1, e2] = [e2, e1]; const s1 = solve(e1), s2 = solve(e2); const t1 = show(e1), t2 = show(e2);
    const ans = s1.v > s2.v ? t1 : s1.v < s2.v ? t2 : 'They are equal';
    return { q:`Which has the greater value?`, kind:'choice', a:ans, choices:[t1, t2, 'They are equal'], hint:'Find the value of each one using the order of operations.',
      steps:[`${t1} = ${s1.v}`, `${t2} = ${s2.v}`, `Answer: ${ans}`] }; });
  addT(OO, (R, lvl) => { const e = oMake(R, lvl, R.int(0, OSHAPES.length - 1)); if (!e) return null; const w = ltr(e.it);
    const truth = R.chance(0.5); let claim = e.s.v; if (!truth) claim = (w !== null && w !== e.s.v) ? w : e.s.v + R.pick([-2, -1, 1, 2]);
    const a = claim === e.s.v ? 'True' : 'False';
    return { q:`True or false?   ${show(e.it)} = ${N(claim)}`, kind:'choice', a, choices:['True', 'False'], hint:PEMDAS,
      steps:[...stepLines(e.s), `The value is ${N(e.s.v)}, so the statement is ${a.toLowerCase()}.`] }; });
  addT(OO, (R, lvl) => { const a = R.int(1, 15), x = lvl === 3 ? rnz(R, -6, 9) : R.int(2, 9), c = R.int(2, 6); const T = a + x * c;
    return { q:`What number goes in the box?   ${a} + ☐ × ${c} = ${N(T)}`, kind:'num', a:x, hint:'The × part happens before the +. What must ☐ × ' + c + ' equal?',
      steps:[`The ☐ × ${c} part is done first, then ${a} is added.`, `So ☐ × ${c} = ${N(T)} − ${a} = ${N(T - a)}`, `☐ = ${N(T - a)} ÷ ${c} = ${N(x)}`, `Check: ${a} + ${P(x)} × ${c} = ${a} + ${P(x * c)} = ${N(T)} ✓`] }; });
  addT(OO, (R, lvl) => { const x = R.int(1, 9), b = R.int(1, 9), c = R.int(2, 6); const T = (x + b) * c;
    return { q:`What number goes in the box?   (☐ + ${b}) × ${c} = ${T}`, kind:'num', a:x, hint:'Work backward: undo the × first, then undo the +.',
      steps:[`(☐ + ${b}) times ${c} is ${T}, so ☐ + ${b} = ${T} ÷ ${c} = ${x + b}`, `☐ = ${x + b} − ${b} = ${x}`, `Check: (${x} + ${b}) × ${c} = ${x + b} × ${c} = ${T} ✓`] }; });
  addT(OO, (R, lvl) => { for (let g = 0; g < 60; g++){ const a = R.int(2, 20), b = R.int(2, 9), c = R.int(2, 9);
      const res = OPS.map(op => { const s = solve([num(a), op, num(b), '×', num(c)]); return s ? s.v : null; }); const T = res[R.int(0, 3)]; if (T === null || (lvl < 3 && T < 0)) continue;
      if (res.filter(v => v === T).length !== 1) continue; const ans = OPS[res.indexOf(T)];
      return { q:`Which sign goes in the box?   ${a} ☐ ${b} × ${c} = ${N(T)}`, kind:'choice', a:ans, choices:OPS.slice(), hint:'Try each sign. Remember × and ÷ come before + and −, left to right.',
        steps:[...OPS.map((op, i) => `${a} ${op} ${b} × ${c} = ${res[i] === null ? 'not a whole number' : N(res[i])}${op === ans ? '  ✓' : ''}`), `Answer: ${ans}`] }; } return null; });
  addT(OO, (R, lvl) => { const a = R.int(2, 9), b = R.int(2, 9), c = R.int(2, 9), d = R.int(2, 9); const e = [num(a), '×', num(b), '+', num(c), '×', num(d)];
    const s = solve(e); const step1 = `${a} × ${b} = ${a * b}`, step2 = `${c} × ${d} = ${c * d}`;
    return { q:`${show(e)}:  which TWO steps happen before you add?`, kind:'choice', a:`${a} × ${b} and ${c} × ${d}`, choices:choose(`${a} × ${b} and ${c} × ${d}`, [`${b} + ${c} and then × ${d}`, `${a} × ${b} only`, `${a} × ${b + c} and then × ${d}`]),
      hint:'Both multiplications come before the addition.', steps:[`Multiply: ${step1}`, `Multiply: ${step2}`, `Then add: ${a * b} + ${c * d} = ${s.v}`, `Answer: ${a} × ${b} and ${c} × ${d}`] }; });

  M['g5.orderops'] = { name:'Order of operations', unit:'g5u5', gen(R, lvl){ return run(R, lvl, OO); } };

  // ======================= g5.exponents =======================
  function mulOut(b, e){ return Array(e).fill(b < 0 ? '(' + N(b) + ')' : N(b)).join(' × '); }
  function evSteps(b, e){ const v = Math.pow(b, e); const L = [`${pw(b, e)} means ${b < 0 ? '(' + N(b) + ')' : N(b)} multiplied by itself ${e} times (NOT ${N(b)} × ${e}).`, mulOut(b, e)];
    let acc = b; const part = []; for (let i = 1; i < e; i++){ part.push(`${N(acc)} × ${P(b)} = ${N(acc * b)}`); acc *= b; }
    if (e > 2) L.push('One step at a time: ' + part.join(',  ')); L.push(`${pw(b, e)} = ${N(v)}`); return L; }
  // base/exponent pairs sized by level
  function bePair(R, lvl){ for (let g = 0; g < 80; g++){ const b = R.int(2, [0, 6, 9, 12][lvl]), e = R.int(2, [0, 3, 4, 5][lvl]); const v = Math.pow(b, e); if (v <= [0, 216, 10000, 100000][lvl]) return [b, e, v]; } return [2, 3, 8]; }
  const ORD = { 2:'second', 3:'third', 4:'fourth', 5:'fifth', 6:'sixth', 7:'seventh', 8:'eighth', 9:'ninth' };
  const EX = [];
  addT(EX, (R, lvl) => { const [b, e, v] = bePair(R, lvl);
    return { q:`What is ${pw(b, e)}?`, kind:'num', a:v, hint:`The small raised number tells how many ${b}'s to multiply together.`, steps:evSteps(b, e) }; });
  addT(EX, (R, lvl) => { const n = R.int([0, 1, 2, 3][lvl], [0, 4, 6, 9][lvl]); const v = Math.pow(10, n);
    return { q:`What is ${pw(10, n)}?`, kind:'num', a:v, hint:'For a power of 10, the exponent tells how many zeros come after the 1.',
      steps:[`${pw(10, n)} means ${n} tens multiplied together.`, `Each × 10 adds one zero, so write 1 followed by ${n} ${plural(n, 'zero')}.`, `${pw(10, n)} = ${N(v)}`] }; });
  addT(EX, (R, lvl) => { const n = R.int(2, [0, 4, 6, 8][lvl]); const a = pw(10, n);
    return { q:`Write ${N(Math.pow(10, n))} as a power of 10.`, kind:'choice', a, choices:choose(a, [pw(10, n + 1), pw(10, n - 1), pw(n, 10)]), hint:'Count the zeros.',
      steps:[`${N(Math.pow(10, n))} has ${n} zeros.`, `So it is 10 multiplied ${n} times.`, `Answer: ${a}`] }; });
  addT(EX, (R, lvl) => { const b = R.int(2, 9), e = R.int(3, [0, 4, 5, 7][lvl]); const a = pw(b, e);
    return { q:`Write in exponent form:  ${mulOut(b, e)}`, kind:'choice', a, choices:choose(a, [b !== e ? pw(e, b) : pw(b, e + 1), N(b * e), `${b} × ${e}`, pw(b, e - 1)]),
      hint:'The base is the number being multiplied. The exponent counts how many times.', steps:[`The number being multiplied is ${b}: that is the base.`, `Count them: ${e} times. That is the exponent.`, `Answer: ${a}`] }; });
  addT(EX, (R, lvl) => { const b = R.int(2, 9), e = R.int(2, [0, 4, 5, 6][lvl]); if (b === e) return null; const a = mulOut(b, e);
    return { q:`Which means the same as ${pw(b, e)}?`, kind:'choice', a, choices:choose(a, [`${b} × ${e}`, mulOut(e, b), Array(e).fill(b).join(' + ')]),
      hint:'The exponent tells how many times the base is written in the multiplication.', steps:[`The base is ${b}. The exponent is ${e}.`, `So write ${b} as a factor ${e} times: ${a}`, `Answer: ${a}`] }; });
  addT(EX, (R, lvl) => { const b = R.int(2, 15), e = R.int(2, 9); if (b === e) return null;
    return { q:`In ${pw(b, e)}, what is the BASE?`, kind:'num', a:b, hint:'The base is the big number on the bottom. The exponent is the small raised number.',
      steps:[`${pw(b, e)}: the big number is ${b} and the small raised number is ${e}.`, `The base (the number being multiplied) is ${b}.`] }; });
  addT(EX, (R, lvl) => { const b = R.int(2, 15), e = R.int(2, 9); if (b === e) return null;
    return { q:`In ${pw(b, e)}, what is the EXPONENT?`, kind:'num', a:e, hint:'The exponent is the small number up high. It counts how many times the base is multiplied.',
      steps:[`${pw(b, e)}: the small raised number is ${e}.`, `So the exponent is ${e}: multiply ${b} by itself ${e} times.`] }; });
  addT(EX, (R, lvl) => { const nm = R.pick(NAMES); const [b, e, v] = bePair(R, lvl); if (b * e === v) return null;
    return { q:`${nm} says ${pw(b, e)} = ${b * e}. That is not right. What is ${pw(b, e)} really?`, kind:'num', a:v, hint:`${nm} multiplied ${b} × ${e}. An exponent means multiply the base by ITSELF.`,
      steps:[`${nm} did ${b} × ${e} = ${b * e}. That is the common mistake!`, ...evSteps(b, e)] }; });
  const EXWHY = ['Multiplied the base by the exponent', 'Added the base and the exponent', 'Multiplied the exponent by itself', 'Nothing. It is correct'];
  addT(EX, (R, lvl) => { const nm = R.pick(NAMES); const [b, e, v] = bePair(R, lvl); const k = R.int(0, 3); const claim = [b * e, b + e, e * e, v][k];
    if ([b * e, b + e, e * e, v].filter(x => x === claim).length > 1) return null; const a = EXWHY[k];
    return { q:`${nm} says ${pw(b, e)} = ${N(claim)}. What did ${nm} do?`, kind:'choice', a, choices:EXWHY.slice(), hint:`Work out ${pw(b, e)} yourself, then compare.`,
      steps:[...evSteps(b, e), k === 3 ? `${nm} is right!` : `${nm} got ${N(claim)}: ${a.toLowerCase()}.`] }; });
  addT(EX, (R, lvl) => { const pairs = lvl === 1 ? [[2, 3], [2, 4], [3, 4], [2, 5]] : [[2, 5], [2, 4], [3, 4], [2, 6], [3, 5], [4, 5], [2, 3], [3, 6], [2, 7]];
    let [x, y] = R.pick(pairs); if (R.chance(0.5)) [x, y] = [y, x]; const v1 = Math.pow(x, y), v2 = Math.pow(y, x);
    const a = v1 > v2 ? pw(x, y) : v1 < v2 ? pw(y, x) : 'They are equal';
    return { q:`Which is greater:  ${pw(x, y)}  or  ${pw(y, x)}?`, kind:'choice', a, choices:[pw(x, y), pw(y, x), 'They are equal'], hint:'Work out each one. Do not just look at the big numbers!',
      steps:[`${pw(x, y)} = ${mulOut(x, y)} = ${v1}`, `${pw(y, x)} = ${mulOut(y, x)} = ${v2}`, `Answer: ${a}`] }; });
  addT(EX, (R, lvl) => { const items = []; const vals = new Set(); for (let g = 0; g < 200 && items.length < 4; g++){ const [b, e, v] = bePair(R, lvl); if (vals.has(v)) continue; vals.add(v); items.push([b, e, v]); }
    if (items.length < 4) return null; const big = R.chance(0.5); const best = items.reduce((m, x) => (big ? x[2] > m[2] : x[2] < m[2]) ? x : m); const a = pw(best[0], best[1]);
    return { q:`Which has the ${big ? 'GREATEST' : 'LEAST'} value?`, kind:'choice', a, choices:items.map(x => pw(x[0], x[1])), hint:'Find the value of each power, then compare.',
      steps:[...items.map(x => `${pw(x[0], x[1])} = ${N(x[2])}`), `The ${big ? 'greatest' : 'least'} is ${a}.`] }; });
  addT(EX, (R, lvl) => { const b = -R.int(lvl === 1 ? 1 : 2, [0, 5, 5, 6][lvl]), e = R.int(2, [0, 3, 3, 4][lvl]); const v = Math.pow(b, e); if (Math.abs(v) > 1300) return null;
    return { q:`What is ${pw(b, e)}?`, kind:'num', a:v, hint:'The parentheses mean the negative number is the base. Count the negatives: even → positive, odd → negative.',
      steps:[...evSteps(b, e).slice(0, -1), e % 2 ? `There are ${e} negatives (odd), so the answer is negative.` : `There are ${e} negatives (even), so they pair up: the answer is positive.`, `${pw(b, e)} = ${N(v)}`] }; });
  addT(EX, (R, lvl) => { const b = -R.int(2, 9), e = R.int(2, [0, 5, 7, 9][lvl]); const a = e % 2 ? 'negative' : 'positive';
    return { q:`Without working it out, is ${pw(b, e)} positive or negative?`, kind:'choice', a, choices:['positive', 'negative'], hint:'Look at the exponent. Is it even or odd?',
      steps:[`${pw(b, e)} multiplies ${e} negative numbers.`, e % 2 ? `${e} is odd: one negative is left without a partner, so it is negative.` : `${e} is even: the negatives pair up, and each pair is positive.`, `Answer: ${a}`] }; });
  addT(EX, (R, lvl) => { const [b, e, v] = bePair(R, lvl);
    return { q:`${b} raised to what exponent equals ${N(v)}?`, kind:'num', a:e,
      hint:`Keep multiplying by ${b} and count how many ${b}'s it takes to reach ${N(v)}.`,
      steps:[`Multiply ${b}'s and count: ${Array.from({ length:e }, (_, i) => `${pw(b, i + 1)} = ${N(Math.pow(b, i + 1))}`).join(', ')}`, `It takes ${e} ${b}'s to make ${N(v)}.`, `The exponent is ${e}.`] }; });
  addT(EX, (R, lvl) => { const e = R.int(2, 3), b = R.int(2, [0, 6, 9, 12][lvl]); const v = Math.pow(b, e);
    return { q:`What number goes in the box?   ☐${sup(e)} = ${N(v)}`, kind:'num', a:b, hint:`Which number, multiplied by itself ${e} times, makes ${N(v)}?`,
      steps:[`☐${sup(e)} means ☐ × ☐${e === 3 ? ' × ☐' : ''}.`, `Try ${b}: ${mulOut(b, e)} = ${N(v)} ✓`, `The base is ${b}.`] }; });
  addT(EX, (R, lvl) => { const n = R.int(2, [0, 3, 5, 6][lvl]), m = R.int(2, 9); const r = m * Math.pow(10, n);
    return { q:`What is ${m} × ${pw(10, n)}?`, kind:'num', a:r, hint:'Find the power of 10 first. Then multiplying by it just adds zeros.',
      steps:[`${pw(10, n)} = ${N(Math.pow(10, n))}`, `${m} × ${N(Math.pow(10, n))} = ${N(r)}  (write ${m}, then ${n} zeros)`] }; });
  addT(EX, (R, lvl) => { const n = R.int(2, [0, 4, 5, 6][lvl]), m = R.int(2, 9); const v = m * Math.pow(10, n);
    return { q:`${N(v)} = ${m} × 10 to what power?`, kind:'num', a:n, hint:'Count the zeros after the first digit.',
      steps:[`${N(v)} is ${m} followed by ${n} zeros.`, `So ${N(v)} = ${m} × ${N(Math.pow(10, n))} = ${m} × ${pw(10, n)}.`, `The exponent is ${n}.`] }; });
  addT(EX, (R, lvl) => { const a = R.int(2, [0, 6, 9, 12][lvl]), b = R.int(2, [0, 3, 4, 5][lvl]), e = R.int(2, 3); const v1 = a * a, v2 = Math.pow(b, e), r = v1 + v2;
    return { q:`Find the value:  ${pw(a, 2)} + ${pw(b, e)}`, kind:'num', a:r, hint:'Find each power first, then add.',
      steps:[`${pw(a, 2)} = ${a} × ${a} = ${v1}`, `${pw(b, e)} = ${mulOut(b, e)} = ${v2}`, `Add: ${v1} + ${v2} = ${r}`] }; });
  addT(EX, (R, lvl) => { const [b, e, v] = bePair(R, lvl); const c = R.int(2, [0, 6, 9, 12][lvl]), w = c * c; if (w === v) return null; const big = Math.max(v, w), sm = Math.min(v, w);
    const t1 = v >= w ? pw(b, e) : pw(c, 2), t2 = v >= w ? pw(c, 2) : pw(b, e);
    return { q:`Find the value:  ${t1} − ${t2}`, kind:'num', a:big - sm, hint:'Find each power first, then subtract.',
      steps:[`${pw(b, e)} = ${mulOut(b, e)} = ${N(v)}`, `${pw(c, 2)} = ${c} × ${c} = ${w}`, `Subtract: ${N(big)} − ${sm} = ${N(big - sm)}`] }; });
  addT(EX, (R, lvl) => { const n = R.int(2, [0, 5, 7, 10][lvl]); const v = Math.pow(2, n); const nm = R.pick(NAMES);
    return { q:`${nm}'s bacteria experiment starts with 1 cell. The number of cells doubles every hour. How many cells are there after ${n} hours?`, kind:'num', a:v,
      hint:'Doubling means × 2 each hour. After n hours that is 2 to the n power.',
      steps:[`Each hour multiplies by 2, so after ${n} hours: ${pw(2, n)}.`, mulOut(2, n), `= ${N(v)} cells`] }; });
  addT(EX, (R, lvl) => { const b = R.int(2, [0, 4, 6, 10][lvl]); const v = b * b * b; const thing = R.pick([['boxes', 'bags', 'marbles'], ['shelves', 'bins', 'books'], ['crates', 'packs', 'pencils']]);
    return { q:`There are ${b} ${thing[0]}. Each one holds ${b} ${thing[1]}, and each of those holds ${b} ${thing[2]}. How many ${thing[2]} are there in all?`, kind:'num', a:v,
      hint:`That is ${b} × ${b} × ${b}, which is ${pw(b, 3)}.`, steps:[`${b} groups of ${b} groups of ${b}: ${mulOut(b, 3)} = ${pw(b, 3)}`, `${b} × ${b} = ${b * b}`, `${b * b} × ${b} = ${v}`, `There are ${v} ${thing[2]}.`] }; });
  addT(EX, (R, lvl) => { const b = R.int(2, [0, 6, 9, 12][lvl]); const cube = R.chance(0.5); const v = cube ? b * b * b : b * b;
    return { q:`What is ${b} ${cube ? 'cubed' : 'squared'}?`, kind:'num', a:v, hint:`"${cube ? 'Cubed' : 'Squared'}" means to the power of ${cube ? 3 : 2}.`,
      steps:[`${b} ${cube ? 'cubed' : 'squared'} = ${pw(b, cube ? 3 : 2)}`, ...evSteps(b, cube ? 3 : 2).slice(1)] }; });
  addT(EX, (R, lvl) => { const b = R.int(2, 9), e = R.int(3, 9); if (b === e) return null; const a = pw(b, e);
    return { q:`Which shows "${b} to the ${ORD[e]} power"?`, kind:'choice', a, choices:choose(a, [pw(e, b), `${b} × ${e}`, `${e} × ${e}`]), hint:'The first number is the base. The power is the exponent.',
      steps:[`"${b} to the ${ORD[e]} power": the base is ${b} and the exponent is ${e}.`, `Answer: ${a}`] }; });
  addT(EX, (R, lvl) => { const n = R.int(2, [0, 5, 7, 10][lvl]);
    return { q:`How many zeros are there when you write ${pw(10, n)} as a regular number?`, kind:'num', a:n, hint:'The exponent on 10 tells how many zeros.',
      steps:[`${pw(10, n)} = ${N(Math.pow(10, n))}`, `Count the zeros: ${n}.`] }; });
  addT(EX, (R, lvl) => { const [b, e, v] = bePair(R, lvl); const cands = [[pw(e, b), Math.pow(e, b)], [pw(b, e + 1), Math.pow(b, e + 1)], [pw(b + 1, e), Math.pow(b + 1, e)], [`${b} × ${e}`, b * e], [pw(b, e - 1), Math.pow(b, e - 1)]].filter(x => x[1] !== v && x[0] !== pw(b, e));
    const a = pw(b, e);
    return { q:`Which is equal to ${N(v)}?`, kind:'choice', a, choices:choose(a, cands.map(x => x[0])), hint:'Find the value of each choice.',
      steps:[...[[a, v], ...cands.slice(0, 3)].map(x => `${x[0]} = ${N(x[1])}`), `Answer: ${a}`] }; });
  addT(EX, (R, lvl) => { const its = []; const vals = new Set(); for (let g = 0; g < 200 && its.length < 3; g++){ const [b, e, v] = bePair(R, lvl); if (vals.has(v)) continue; vals.add(v); its.push([pw(b, e), v]); }
    if (its.length < 3) return null; const s = [...its].sort((x, y) => x[1] - y[1]); const a = s.map(x => x[0]).join(', ');
    const ds = [[...s].reverse().map(x => x[0]).join(', '), [s[1], s[0], s[2]].map(x => x[0]).join(', '), [s[0], s[2], s[1]].map(x => x[0]).join(', ')];
    return { q:`Order from LEAST to GREATEST:  ${its.map(x => x[0]).join(',  ')}`, kind:'choice', a, choices:choose(a, ds), hint:'Find the value of each power first.',
      steps:[...its.map(x => `${x[0]} = ${N(x[1])}`), `Order: ${a}`] }; });
  addT(EX, (R, lvl) => { const n = R.int(2, [0, 6, 9, 20][lvl]);
    return { q:`What is ${pw(1, n)}?`, kind:'num', a:1, hint:'1 times 1 is always 1, no matter how many times.', steps:[`${pw(1, n)} = ${Array(Math.min(n, 6)).fill(1).join(' × ')}${n > 6 ? ' × ...' : ''}`, '1 × 1 = 1 every time.', 'Answer: 1'] }; });
  addT(EX, (R, lvl) => { const b = R.int(2, [0, 5, 8, 12][lvl]); const v = b * b * b; const u = R.pick(['inches', 'centimeters', 'feet']);
    return { q:`A cube is ${b} ${u} long on each edge. Its volume is ${pw(b, 3)} cubic ${u}. What is the volume?`, kind:'num', a:v, unit:'cubic ' + u,
      hint:`${pw(b, 3)} = ${b} × ${b} × ${b}.`, steps:evSteps(b, 3).concat([`The volume is ${v} cubic ${u}.`]) }; });

  M['g5.exponents'] = { name:'Exponents & powers of 10', unit:'g5u5', gen(R, lvl){ return run(R, lvl, EX); } };

  // ======================= g5.squares =======================
  // Perfect squares: the skill this child finds hardest. Calm, explicit steps; facts keyed 'sq' + n².
  const sqMax = l => [0, 12, 15, 20][l];
  const isSq = n => n >= 0 && Number.isInteger(Math.sqrt(n));
  function nonSq(R, lo, hi){ for (let g = 0; g < 200; g++){ const n = R.int(lo, hi); if (!isSq(n)) return n; } return lo + 1 === 4 ? 5 : 2; }
  function squaresList(k){ return Array.from({ length:k }, (_, i) => `${i + 1}×${i + 1}=${(i + 1) * (i + 1)}`).join(', '); }
  function rootTry(A, s){ const L = [`√${A} asks: what number times ITSELF makes ${A}?`];
    if (s > 2) L.push(`Try ${s - 1}: ${s - 1} × ${s - 1} = ${(s - 1) * (s - 1)}. Too small.`);
    L.push(`Try ${s}: ${s} × ${s} = ${A} ✓`); L.push(`√${A} = ${s}`); return L; }
  function arr(s){ return s <= 10 ? { type:'array', rows:s, cols:s } : undefined; }
  const SQ = [];
  addT(SQ, (R, lvl) => { const n = R.int(1, sqMax(lvl));
    return { q:`What is ${pw(n, 2)}?`, kind:'num', a:n * n, fact:'sq' + n * n, model:arr(n), hint:`${pw(n, 2)} means ${n} × ${n}. Picture a square with ${n} on each side.`,
      steps:[`${pw(n, 2)} means ${n} × ${n} (NOT ${n} × 2).`, `${n} × ${n} = ${n * n}`, `${pw(n, 2)} = ${n * n}`] }; });
  addT(SQ, (R, lvl) => { const n = R.int(1, sqMax(lvl));
    return { q:`What is √${n * n}?`, kind:'num', a:n, fact:'sq' + n * n, model:arr(n), hint:`√${n * n} asks: what number times ITSELF makes ${n * n}?`, steps:rootTry(n * n, n) }; });
  addT(SQ, (R, lvl) => { const n = R.int(2, sqMax(lvl));
    return { q:`What number times itself equals ${n * n}?`, kind:'num', a:n, fact:'sq' + n * n, hint:'Think of your times tables: which number times the SAME number gives this?', steps:rootTry(n * n, n) }; });
  addT(SQ, (R, lvl) => { const n = R.int(2, sqMax(lvl));
    return { q:`${n} squared is what number?`, kind:'num', a:n * n, fact:'sq' + n * n, hint:`"Squared" means multiply the number by itself.`, steps:[`${n} squared = ${pw(n, 2)} = ${n} × ${n}`, `${n} × ${n} = ${n * n}`] }; });
  addT(SQ, (R, lvl) => { const s = R.int(2, Math.min(10, sqMax(lvl)));
    return { q:`This square array has ${s} rows with ${s} dots in each row. How many dots are there in all?`, kind:'num', a:s * s, fact:'sq' + s * s, model:{ type:'array', rows:s, cols:s },
      hint:'Rows × dots in each row. A square array makes a perfect square!', steps:[`${s} rows × ${s} dots = ${pw(s, 2)}`, `${s} × ${s} = ${s * s}`, `There are ${s * s} dots. ${s * s} is a perfect square.`] }; });
  addT(SQ, (R, lvl) => { const k = R.int(2, sqMax(lvl)), a = k * k; const ds = [a + 1, a - 2, 2 * k, a + k, a - 1].filter(x => x > 1 && !isSq(x)).map(N);
    return { q:'Which number is a perfect square?', kind:'choice', a:N(a), choices:choose(N(a), R.shuffle(ds)), hint:'A perfect square is a whole number times ITSELF, like 3 × 3 = 9.',
      steps:[`Check: ${k} × ${k} = ${a}, so ${a} is a perfect square.`, 'The others are not any whole number times itself.', `Answer: ${a}`] }; });
  addT(SQ, (R, lvl) => { const m = sqMax(lvl); const ks = distinct(R, 3, 2, m); if (!ks) return null; let x = nonSq(R, 5, m * m); if (ks.some(k => k * k === x)) return null;
    return { q:'Which number is NOT a perfect square?', kind:'choice', a:N(x), choices:[N(x), ...ks.map(k => N(k * k))], hint:'Find a whole number that times itself makes each one. One of them has no such number.',
      steps:[...ks.map(k => `${k * k} = ${k} × ${k} ✓`), `${x} is between ${Math.floor(Math.sqrt(x)) ** 2} and ${Math.ceil(Math.sqrt(x)) ** 2}, so no whole number times itself makes it.`, `Answer: ${x}`] }; });
  addT(SQ, (R, lvl) => { const n = nonSq(R, 3, [0, 99, 224, 399][lvl]); const lo = Math.floor(Math.sqrt(n)), hi = lo + 1; const a = `${lo} and ${hi}`; const half = Math.floor(n / 2);
    return { q:`Between which two whole numbers is √${n}?`, kind:'choice', a, choices:choose(a, [lo > 1 ? `${lo - 1} and ${lo}` : null, `${hi} and ${hi + 1}`, `${half} and ${half + 1}`]),
      hint:`Find the perfect squares just below and just above ${n}.`,
      steps:[`Perfect squares near ${n}: ${lo} × ${lo} = ${lo * lo} and ${hi} × ${hi} = ${hi * hi}.`, `${n} is between ${lo * lo} and ${hi * hi}.`, `So √${n} is between √${lo * lo} and √${hi * hi}: between ${a}.`] }; });
  addT(SQ, (R, lvl) => { for (let g = 0; g < 50; g++){ const n = nonSq(R, 3, [0, 99, 224, 399][lvl]); const r = Math.sqrt(n), lo = Math.floor(r), hi = lo + 1;
      const near = (n - lo * lo) < (hi * hi - n) ? lo : hi; if (Math.abs((n - lo * lo) - (hi * hi - n)) < 3) continue;
      return { q:`√${n} is CLOSEST to which whole number?`, kind:'choice', a:N(near), choices:choose(N(near), [N(near === lo ? hi : lo), N(Math.round(n / 2)), N(near + (near === lo ? -1 : 1))].filter(x => +x.replace(MS, '-') > 0)),
        hint:`Which perfect square is ${n} nearer to?`, steps:[`${lo} × ${lo} = ${lo * lo} and ${hi} × ${hi} = ${hi * hi}.`, `${n} is ${n - lo * lo} away from ${lo * lo} and ${hi * hi - n} away from ${hi * hi}.`, `It is nearer to ${near * near}, so √${n} is closest to ${near}.`] }; } return null; });
  addT(SQ, (R, lvl) => { const s = R.int(2, sqMax(lvl)); const A = s * s;
    return { q:`${A} tiles make one big square with no tiles left over. How many tiles are in each row?`, kind:'num', a:s, fact:'sq' + A, model:arr(s),
      hint:'In a square, the number of rows equals the number in each row. Which number times itself is ' + A + '?', steps:[`Rows × row length = ${A}, and they are the same number.`, ...rootTry(A, s).slice(1)] }; });
  addT(SQ, (R, lvl) => { const n = R.int(2, sqMax(lvl) * sqMax(lvl) - 1); const k = Math.floor(Math.sqrt(n)) + 1;
    return { q:`What is the next perfect square GREATER than ${n}?`, kind:'num', a:k * k, hint:'List perfect squares: 1, 4, 9, 16, 25, ... Which is the first one bigger than ' + n + '?',
      steps:[`${k - 1} × ${k - 1} = ${(k - 1) * (k - 1)}, which is not greater than ${n}.`, `${k} × ${k} = ${k * k}, which is greater than ${n}.`, `The next perfect square is ${k * k}.`] }; });
  addT(SQ, (R, lvl) => { const m = sqMax(lvl); const a = nonSq(R, 2, m * m / 2), b = nonSq(R, a + 10, m * m); if (b <= a) return null;
    const list = []; for (let k = 1; k * k < b; k++) if (k * k > a) list.push(k * k); if (!list.length) return null;
    return { q:`How many perfect squares are between ${a} and ${b}?`, kind:'num', a:list.length, hint:'List the perfect squares 1, 4, 9, 16, ... and count the ones between the two numbers.',
      steps:[`Perfect squares between ${a} and ${b}: ${list.join(', ')}`, `Count them: ${list.length}.`] }; });
  addT(SQ, (R, lvl) => { const x = R.int(1, sqMax(lvl)), y = R.int(1, sqMax(lvl)); const r = x + y;
    return { q:`What is √${x * x} + √${y * y}?`, kind:'num', a:r, hint:'Find each square root first. Then add.', steps:[`√${x * x} = ${x}, because ${x} × ${x} = ${x * x}.`, `√${y * y} = ${y}, because ${y} × ${y} = ${y * y}.`, `${x} + ${y} = ${r}`] }; });
  addT(SQ, (R, lvl) => { const x = R.int(3, sqMax(lvl)), y = R.int(1, x - 1); const r = x - y;
    return { q:`What is √${x * x} − √${y * y}?`, kind:'num', a:r, hint:'Find each square root first. Then subtract. (It is NOT the same as √' + (x * x - y * y) + '!)', steps:[`√${x * x} = ${x}`, `√${y * y} = ${y}`, `${x} − ${y} = ${r}`] }; });
  addT(SQ, (R, lvl) => { const s = R.int(2, sqMax(lvl)), A = s * s; const k = R.chance(0.3) ? s : R.int(Math.max(1, s - 4), s + 4); const t1 = `√${A}`, t2 = N(k);
    const a = s > k ? t1 : s < k ? t2 : 'They are equal';
    return { q:`Which is greater:  √${A}  or  ${k}?`, kind:'choice', a, choices:[t1, t2, 'They are equal'], hint:`First find √${A}. Then compare.`, steps:[`√${A} = ${s}, because ${s} × ${s} = ${A}.`, `Compare ${s} and ${k}.`, `Answer: ${a}`] }; });
  addT(SQ, (R, lvl) => { const nm = R.pick(NAMES); const s = R.int(3, sqMax(lvl)), A = s * s; if (A % 2) return null;
    return { q:`${nm} says √${A} = ${A / 2}, because ${A} ÷ 2 = ${A / 2}. What is √${A} really?`, kind:'num', a:s, fact:'sq' + A, hint:'A square root is NOT dividing by 2. It is the number that times ITSELF makes ' + A + '.',
      steps:[`Check ${nm}'s answer: ${A / 2} × ${A / 2} = ${(A / 2) * (A / 2)}, not ${A}. So it is wrong.`, ...rootTry(A, s).slice(1)] }; });
  addT(SQ, (R, lvl) => { const s = R.int(2, sqMax(lvl)); const u = R.pick(['in', 'cm', 'ft', 'm']);
    return { q:`A square has sides of ${s} ${u}. What is its area?`, kind:'num', a:s * s, unit:u + '²', fact:'sq' + s * s, model:{ type:'rect', w:s, h:s, unit:u, grid:s <= 10, labels:true },
      hint:'Area of a square = side × side.', steps:[`Area = side × side = ${s} × ${s}`, `${s} × ${s} = ${s * s}`, `The area is ${s * s} square ${u} (${s * s} ${u}²).`] }; });
  addT(SQ, (R, lvl) => { const s = R.int(2, sqMax(lvl)), A = s * s; const u = R.pick(['in', 'cm', 'ft', 'm']);
    return { q:`A square has an area of ${A} square ${u}. How long is each side?`, kind:'num', a:s, unit:u, fact:'sq' + A, hint:`Area = side × side. Which number times itself is ${A}?`,
      steps:['A square has 4 equal sides, and area = side × side.', ...rootTry(A, s).slice(1, -1), `Each side is ${s} ${u}.`] }; });
  addT(SQ, (R, lvl) => { const v = distinct(R, 3, 2, sqMax(lvl)); if (!v) return null; const vals = [v[0], v[1], v[2] * v[2]]; if (new Set(vals).size < 3) return null;
    const lab = [`√${v[0] * v[0]}`, N(v[1]), pw(v[2], 2)]; const idx = [0, 1, 2].sort((i, j) => vals[i] - vals[j]); const a = idx.map(i => lab[i]).join(', ');
    const ds = [[...idx].reverse(), [idx[1], idx[0], idx[2]], [idx[0], idx[2], idx[1]], [idx[2], idx[0], idx[1]]].map(o => o.map(i => lab[i]).join(', '));
    return { q:`Order from LEAST to GREATEST:  ${lab.join(',   ')}`, kind:'choice', a, choices:choose(a, ds), hint:'Change each one into a plain number first.',
      steps:[`${lab[0]} = ${vals[0]}`, `${lab[1]} = ${vals[1]}`, `${lab[2]} = ${v[2]} × ${v[2]} = ${vals[2]}`, `Order: ${a}`] }; });
  addT(SQ, (R, lvl) => { const n = nonSq(R, 3, [0, 140, 224, 399][lvl]); const lo = Math.floor(Math.sqrt(n)), hi = lo + 1; const a = `${lo * lo} and ${hi * hi}`;
    return { q:`${n} is between which two perfect squares?`, kind:'choice', a, choices:choose(a, [lo > 1 ? `${(lo - 1) ** 2} and ${lo * lo}` : null, `${hi * hi} and ${(hi + 1) ** 2}`, `${lo} and ${hi}`]),
      hint:'List the perfect squares: 1, 4, 9, 16, 25, 36, ... Find the ones on each side.', steps:[`${lo} × ${lo} = ${lo * lo}, which is less than ${n}.`, `${hi} × ${hi} = ${hi * hi}, which is more than ${n}.`, `Answer: ${a}`] }; });
  addT(SQ, (R, lvl) => { const k = R.int(1, sqMax(lvl) - 1); const r = (k + 1) * (k + 1) - k * k;
    return { q:`How much greater is ${pw(k + 1, 2)} than ${pw(k, 2)}?`, kind:'num', a:r, hint:'Find each square, then subtract.',
      steps:[`${pw(k + 1, 2)} = ${k + 1} × ${k + 1} = ${(k + 1) * (k + 1)}`, `${pw(k, 2)} = ${k} × ${k} = ${k * k}`, `${(k + 1) * (k + 1)} − ${k * k} = ${r}`] }; });
  addT(SQ, (R, lvl) => { const k = R.int(1, sqMax(lvl) - 4); const seq = [k, k + 1, k + 2, k + 3].map(x => x * x); const nx = (k + 4) * (k + 4);
    return { q:`What comes next?   ${seq.join(', ')}, ?`, kind:'num', a:nx, hint:'These are perfect squares! What number is squared to make each one?',
      steps:[`${seq.map((v, i) => `${v} = ${k + i} × ${k + i}`).join(', ')}`, `The next one is ${k + 4} × ${k + 4}.`, `${k + 4} × ${k + 4} = ${nx}`] }; });
  addT(SQ, (R, lvl) => { const lo = R.int(2, sqMax(lvl) - 1); const n = nonSq(R, lo * lo + 1, (lo + 1) * (lo + 1) - 1);
    const out = [nonSq(R, (lo + 1) * (lo + 1) + 1, (lo + 2) * (lo + 2) - 1), lo > 2 ? nonSq(R, (lo - 1) * (lo - 1) + 1, lo * lo - 1) : null, nonSq(R, (lo + 2) * (lo + 2) + 1, (lo + 3) * (lo + 3) - 1)].filter(x => x);
    const a = `√${n}`;
    return { q:`Which square root is between ${lo} and ${lo + 1}?`, kind:'choice', a, choices:choose(a, out.map(x => `√${x}`)), hint:`√ of a number between ${lo * lo} and ${(lo + 1) * (lo + 1)} is between ${lo} and ${lo + 1}.`,
      steps:[`${lo} = √${lo * lo} and ${lo + 1} = √${(lo + 1) * (lo + 1)}.`, `So look for a number under the √ between ${lo * lo} and ${(lo + 1) * (lo + 1)}.`, `${n} fits. Answer: ${a}`] }; });
  addT(SQ, (R, lvl) => { const m = sqMax(lvl); const yes = R.chance(0.5); const s = R.int(2, m); const n = yes ? s * s : nonSq(R, 5, m * m); const a = yes ? 'Yes' : 'No'; const lo = Math.floor(Math.sqrt(n));
    return { q:`Is ${n} a perfect square?`, kind:'choice', a, choices:['Yes', 'No'], hint:'Is there a whole number that times ITSELF makes it?',
      steps: yes ? [`${s} × ${s} = ${n}.`, `Yes, ${n} is a perfect square.`] : [`${lo} × ${lo} = ${lo * lo} (too small) and ${lo + 1} × ${lo + 1} = ${(lo + 1) * (lo + 1)} (too big).`, `No whole number in between, so No.`] }; });
  addT(SQ, (R, lvl) => { const s = R.int(2, sqMax(lvl)); const A = s * s;
    return { q:`If √☐ = ${s}, what number is in the box?`, kind:'num', a:A, fact:'sq' + A, hint:`Undo the square root by squaring: ${s} × ${s}.`,
      steps:[`√☐ = ${s} means ${s} times itself makes ☐.`, `${s} × ${s} = ${A}`, `The box is ${A}. Check: √${A} = ${s} ✓`] }; });

  M['g5.squares'] = { name:'Perfect squares & square roots', unit:'g5u5', warm:true, gen(R, lvl){ return run(R, lvl, SQ); } };

  // ======================= g5.sqword =======================
  // Real-life squares in the style of the class worksheet (fence around a square yard, lace around a pillowcase,
  // tiles on a square floor, carpet in a square bedroom), plus many more contexts and every direction:
  // area ↔ side ↔ perimeter, cost, tiles, comparing two squares, leftovers.
  const swSide = (R, l) => l === 1 ? R.int(3, 10) : l === 2 ? R.int(6, 15) : R.int(11, 20);
  const SWA = { ft:'square feet', m:'square meters', yd:'square yards', 'in':'square inches', cm:'square centimeters' };
  const SWL = { ft:'feet', m:'meters', yd:'yards', 'in':'inches', cm:'centimeters' };
  function swFind(A, s, u){ return [`Area of a square = side × side, so ask: what number times ITSELF makes ${A}?`, ...(s > 2 ? [`Try ${s - 1}: ${s - 1} × ${s - 1} = ${(s - 1) * (s - 1)}. Too small.`] : []), `Try ${s}: ${s} × ${s} = ${A} ✓  So each side is ${s} ${SWL[u]}.`]; }
  const draw = A => `Draw a square and write the area, ${A}, inside it.`;
  // things that go AROUND a square (perimeter)
  const AROUND = [
    { thing:'backyard', u:'ft', what:'fence', verb:'go all the way around it' },
    { thing:'pillowcase', u:'cm', what:'lace', verb:'sew all the way around the edge' },
    { thing:'garden', u:'ft', what:'fencing', verb:'put all the way around it' },
    { thing:'dog pen', u:'m', what:'fence', verb:'go all the way around it' },
    { thing:'bulletin board', u:'in', what:'border trim', verb:'go all the way around the edge' },
    { thing:'photo', u:'in', what:'frame trim', verb:'go all the way around it' },
    { thing:'sandbox', u:'ft', what:'wood edging', verb:'go all the way around it' },
    { thing:'quilt', u:'in', what:'ribbon', verb:'sew all the way around the edge' },
    { thing:'patio', u:'ft', what:'brick edging', verb:'line all the way around it' },
    { thing:'playground', u:'m', what:'fence', verb:'go all the way around it' }
  ];
  // things that are COVERED (area)
  const COVER = [
    { thing:'bedroom', u:'ft', what:'carpet', side:'wall' },
    { thing:'kitchen floor', u:'ft', what:'tile', side:'side' },
    { thing:'lawn', u:'yd', what:'new grass sod', side:'side' },
    { thing:'tablecloth', u:'in', what:'fabric', side:'side' },
    { thing:'game board', u:'cm', what:'paper to cover it', side:'side' },
    { thing:'classroom rug', u:'ft', what:'rug material', side:'side' },
    { thing:'window', u:'in', what:'glass', side:'side' },
    { thing:'garden bed', u:'m', what:'soil cover', side:'side' }
  ];
  const WHO = ['Mr. Nice', 'Ms. Lopez', 'Coach Reed', 'Mrs. Wong', 'Mr. Patel', 'Grandma Rose'];
  const SW = [];
  addT(SW, (R, lvl) => { const c = R.pick(AROUND), s = swSide(R, lvl), A = s * s, P4 = 4 * s; const who = R.chance(0.5) ? R.pick(WHO) : R.pick(NAMES);
    return { q:`${who} has a SQUARE ${c.thing} with an area of ${A} ${SWA[c.u]}. How many ${SWL[c.u]} of ${c.what} are needed to ${c.verb}?`, kind:'num', a:P4, unit:c.u,
      hint:'Two steps! First find one side (the square root of the area). Then the ' + c.what + ' goes around all 4 sides.',
      steps:[draw(A), ...swFind(A, s, c.u), `Going around means perimeter: 4 equal sides, so 4 × ${s} = ${P4}.`, `${who} needs ${P4} ${SWL[c.u]} of ${c.what}.`] }; });
  addT(SW, (R, lvl) => { const c = R.pick(COVER), s = swSide(R, lvl), A = s * s; const nm = R.pick(NAMES);
    return { q:`${nm} wants ${c.what} for a SQUARE ${c.thing}. Each ${c.side} is ${s} ${SWL[c.u]} long. How many ${SWA[c.u]} of ${c.what} are needed?`, kind:'num', a:A, unit:c.u + '²',
      model:{ type:'rect', w:s, h:s, unit:c.u, grid:s <= 10, labels:true }, hint:'Covering means AREA. Area of a square = side × side.',
      steps:[`${c.what[0].toUpperCase() + c.what.slice(1)} covers the whole ${c.thing}, so find the AREA (not the perimeter).`, `It is a square, so every side is ${s} ${SWL[c.u]}.`, `Area = ${s} × ${s} = ${A}.`, `${nm} needs ${A} ${SWA[c.u]}.`] }; });
  addT(SW, (R, lvl) => { const things = [['garden', 'ft'], ['playground', 'm'], ['rug', 'ft'], ['poster', 'in'], ['field', 'yd'], ['napkin', 'cm'], ['parking lot', 'm'], ['stage', 'ft']];
    const [t, u] = R.pick(things), s = swSide(R, lvl), A = s * s; const nm = R.pick(NAMES);
    return { q:`${nm}'s SQUARE ${t} has an area of ${A} ${SWA[u]}. How long is each side?`, kind:'num', a:s, unit:u, fact:'sq' + A,
      hint:`Area of a square = side × side. What number times itself is ${A}?`, steps:[draw(A), ...swFind(A, s, u), `Each side is ${s} ${SWL[u]}.`] }; });
  addT(SW, (R, lvl) => { const who = R.pick([...WHO, R.pick(NAMES)]), s = swSide(R, lvl), A = s * s;
    return { q:`${who} has ${A} tiles. Each tile is 1 foot by 1 foot. ${who} uses ALL the tiles to cover a SQUARE floor with none left over. How long is each side of the room?`, kind:'num', a:s, unit:'ft',
      model:arr(s), hint:`Each tile covers 1 square foot, so the floor's area is ${A} square feet. Which number times itself is ${A}?`,
      steps:[`Each tile is 1 square foot, so the floor is ${A} square feet.`, ...swFind(A, s, 'ft'), `The room is ${s} feet by ${s} feet.`] }; });
  addT(SW, (R, lvl) => { const s = swSide(R, lvl), A = s * s; const a = `${s} feet by ${s} feet`;
    return { q:`Exactly ${A} one-foot square tiles cover a SQUARE floor. What are the floor's dimensions?`, kind:'choice', a,
      choices:choose(a, [`${A / 2} feet by ${A / 2} feet`, `${s + 1} feet by ${s + 1} feet`, `${s * 2} feet by ${s * 2} feet`, `${s - 1} feet by ${s - 1} feet`]),
      hint:'A square has two equal sides. Which number times itself is ' + A + '?', steps:[`The area is ${A} square feet.`, `${s} × ${s} = ${A} ✓`, `The floor is ${a}.`] }; });
  addT(SW, (R, lvl) => { const c = R.pick(AROUND), s = swSide(R, lvl), P4 = 4 * s; const nm = R.pick(NAMES);
    return { q:`It takes ${P4} ${SWL[c.u]} of ${c.what} to ${c.verb.replace(' it', '').replace(' the edge', '')} a SQUARE ${c.thing}. How long is each side of the ${c.thing}?`, kind:'num', a:s, unit:c.u,
      hint:'The ' + c.what + ' covers all 4 equal sides. Share the total equally among 4 sides.', steps:[`The perimeter is ${P4} ${SWL[c.u]}.`, `A square has 4 equal sides: ${P4} ÷ 4 = ${s}.`, `Each side is ${s} ${SWL[c.u]}.`] }; });
  addT(SW, (R, lvl) => { const s = swSide(R, lvl), P4 = 4 * s, A = s * s; const t = R.pick(['rug', 'garden', 'patio', 'sandbox', 'pool cover']);
    return { q:`The perimeter of a SQUARE ${t} is ${P4} feet. What is the area of the ${t}?`, kind:'num', a:A, unit:'ft²',
      hint:'Two steps! The 4 sides are equal, so divide the perimeter by 4. Then area = side × side.', steps:[`Step 1: one side = ${P4} ÷ 4 = ${s} ft.`, `Step 2: area = side × side = ${s} × ${s}`, `${s} × ${s} = ${A}`, `The area is ${A} square feet.`] }; });
  addT(SW, (R, lvl) => { const s = swSide(R, lvl), A = s * s, P4 = 4 * s, c = R.int(2, lvl === 1 ? 5 : 15); const cost = P4 * c; const who = R.pick(WHO);
    return { q:`${who}'s SQUARE yard has an area of ${A} square feet. Fencing costs $${c} per foot. How many dollars will it cost to fence all the way around the yard?`, kind:'num', a:cost, unit:'$',
      hint:'Three steps: find a side, then the perimeter, then multiply by the cost of each foot.', steps:[...swFind(A, s, 'ft'), `Perimeter = 4 × ${s} = ${P4} feet.`, `Cost = ${P4} × $${c} = $${cost}.`] }; });
  addT(SW, (R, lvl) => { const s = swSide(R, lvl), A = s * s, c = R.int(2, lvl === 1 ? 5 : 9); const cost = A * c; const nm = R.pick(NAMES);
    return { q:`${nm}'s SQUARE bedroom has walls that are ${s} feet long. Carpet costs $${c} per square foot. How many dollars will the carpet cost?`, kind:'num', a:cost, unit:'$',
      hint:'Find the area first (side × side). Then multiply by the cost of each square foot.', steps:[`Area = ${s} × ${s} = ${A} square feet.`, `Cost = ${A} × $${c} = $${cost}.`] }; });
  addT(SW, (R, lvl) => { const t = R.pick([2, 3]); const k = lvl === 1 ? R.int(2, 4) : lvl === 2 ? R.int(3, 6) : R.int(5, 8); const s = t * k, n = k * k;
    return { q:`A SQUARE patio is ${s} feet on each side. It is covered with square tiles that are ${t} feet on each side. How many tiles are needed?`, kind:'num', a:n, unit:'tiles', model:arr(k),
      hint:`First find how many tiles fit along one side: ${s} ÷ ${t}. The tiles make a square too!`, steps:[`Along one side: ${s} ÷ ${t} = ${k} tiles.`, `The tiles form a ${k} by ${k} square.`, `${k} × ${k} = ${n} tiles.`] }; });
  addT(SW, (R, lvl) => { const [n1, n2] = two(R); const s1 = swSide(R, lvl), s2 = swSide(R, lvl); const A1 = s1 * s1, A2 = s2 * s2;
    const a = A1 > A2 ? `${n1}'s` : A1 < A2 ? `${n2}'s` : 'They are the same';
    return { q:`${n1}'s SQUARE garden has an area of ${A1} square feet. ${n2}'s SQUARE garden has sides of ${s2} feet. Whose garden is bigger?`, kind:'choice', a, choices:[`${n1}'s`, `${n2}'s`, 'They are the same'],
      hint:'Compare the same kind of measurement: find the area of the second garden, or the side of the first.', steps:[`${n1}'s garden: ${A1} square feet.`, `${n2}'s garden: ${s2} × ${s2} = ${A2} square feet.`, `Answer: ${a}`] }; });
  addT(SW, (R, lvl) => { const s1 = swSide(R, lvl); let s2 = swSide(R, lvl); if (s1 === s2) return null; const big = Math.max(s1, s2), sm = Math.min(s1, s2);
    return { q:`SQUARE garden A has an area of ${s1 * s1} square feet. SQUARE garden B has an area of ${s2 * s2} square feet. How many feet longer is a side of the bigger garden?`, kind:'num', a:big - sm, unit:'ft',
      hint:'Find the side of each garden with a square root. Then subtract the sides.', steps:[`Garden A: √${s1 * s1} = ${s1} ft per side.`, `Garden B: √${s2 * s2} = ${s2} ft per side.`, `${big} − ${sm} = ${big - sm} feet longer.`] }; });
  const FORM = [['A marching band has', 'members standing', 'members'], ['A teacher sets up', 'chairs', 'chairs'], ['A farmer plants', 'apple trees in an orchard', 'trees'], ['A baker puts', 'cupcakes on a tray', 'cupcakes'], ['A sheet holds', 'stamps', 'stamps'], ['A coach lines up', 'students for a photo', 'students']];
  addT(SW, (R, lvl) => { const f = R.pick(FORM), s = swSide(R, lvl), A = s * s;
    return { q:`${f[0]} ${A} ${f[1]} in a SQUARE, with the same number in every row and every column. How many ${f[2]} are in each row?`, kind:'num', a:s, fact:'sq' + A, model:arr(s),
      hint:`Rows × number in each row = ${A}, and they are the same number. Find √${A}.`, steps:[`Same number of rows and columns, so ? × ? = ${A}.`, ...swFind(A, s, 'ft').slice(1).map(x => x.replace(' So each side is ' + s + ' feet.', '')), `There are ${s} ${f[2]} in each row.`] }; });
  addT(SW, (R, lvl) => { let n; do { n = R.int(lvl === 1 ? 10 : 40, lvl === 1 ? 99 : lvl === 2 ? 200 : 399); } while (isSq(n)); const s = Math.floor(Math.sqrt(n)); const left = n - s * s; const nm = R.pick(NAMES);
    const item = R.pick(['plants', 'tiles', 'cards', 'chairs']);
    return { q:`${nm} has ${n} ${item} and wants to arrange them in the BIGGEST square possible. How many ${item} will be left over?`, kind:'num', a:left,
      hint:`Find the biggest perfect square that is not more than ${n}.`, steps:[`${s} × ${s} = ${s * s} fits, but ${s + 1} × ${s + 1} = ${(s + 1) * (s + 1)} is too many.`, `The biggest square uses ${s * s} ${item}.`, `Left over: ${n} − ${s * s} = ${left}.`] }; });
  addT(SW, (R, lvl) => { const s = lvl === 1 ? R.int(2, 6) : R.int(4, 10); const A = s * s, B = 4 * A;
    return { q:`A SQUARE garden is ${s} feet on each side. ${R.pick(NAMES)} makes a new square garden with sides TWICE as long. What is the area of the new garden?`, kind:'num', a:B, unit:'ft²',
      hint:'First double the side. Then find side × side.', steps:[`New side: 2 × ${s} = ${2 * s} feet.`, `New area: ${2 * s} × ${2 * s} = ${B} square feet.`, `(That is 4 times the old area of ${A}!)`] }; });
  addT(SW, (R, lvl) => { let n; do { n = R.int(lvl === 1 ? 10 : 30, lvl === 1 ? 99 : lvl === 2 ? 224 : 399); } while (isSq(n)); const lo = Math.floor(Math.sqrt(n)), hi = lo + 1; const a = `between ${lo} and ${hi} feet`;
    return { q:`A SQUARE patio has an area of ${n} square feet. About how long is each side?`, kind:'choice', a, choices:choose(a, [`between ${lo - 1} and ${lo} feet`, `between ${hi} and ${hi + 1} feet`, `about ${Math.round(n / 4)} feet`]),
      hint:`${n} is not a perfect square. Find the perfect squares just below and above it.`, steps:[`${lo} × ${lo} = ${lo * lo} and ${hi} × ${hi} = ${hi * hi}.`, `${n} is between them, so the side is between ${lo} and ${hi} feet.`] }; });
  const NEED = [['put a fence around a square yard', 'perimeter'], ['buy carpet for a square room', 'area'], ['sew lace around a square pillow', 'perimeter'], ['cover a square floor with tiles', 'area'],
    ['paint a square wall', 'area'], ['put a frame around a square picture', 'perimeter'], ['spread grass seed on a square lawn', 'area'], ['tie a ribbon around the edge of a square box lid', 'perimeter'],
    ['cover a square table with a tablecloth', 'area'], ['put a border around a square bulletin board', 'perimeter']];
  addT(SW, (R, lvl) => { const [task, a] = R.pick(NEED); const nm = R.pick(NAMES);
    return { q:`${nm} wants to ${task}. Should ${nm} find the AREA or the PERIMETER?`, kind:'choice', a, choices:['area', 'perimeter'],
      hint:'Going AROUND the edge → perimeter. COVERING the inside → area.', steps:[a === 'area' ? 'This covers the whole inside of the square.' : 'This goes around the outside edge of the square.', `So find the ${a}.`] }; });
  addT(SW, (R, lvl) => { const nm = R.pick(NAMES), s = swSide(R, lvl), A = s * s; const k = R.int(0, 1); const wrong = k ? A / 4 : A / 2; if (!Number.isInteger(wrong) || wrong === s) return null;
    return { q:`${nm} says a SQUARE room with an area of ${A} square feet has sides of ${wrong} feet, because ${A} ÷ ${k ? 4 : 2} = ${wrong}. What is the real side length?`, kind:'num', a:s, unit:'ft', fact:'sq' + A,
      hint:'The side of a square is the square root of the area, not the area divided by something.',
      steps:[`Check ${nm}'s answer: ${wrong} × ${wrong} = ${wrong * wrong}, not ${A}.`, ...swFind(A, s, 'ft'), `The real side is ${s} feet.`] }; });
  addT(SW, (R, lvl) => { const k = lvl === 1 ? R.int(3, 6) : lvl === 2 ? R.int(5, 9) : R.int(8, 12); const p = R.pick([4, 5, 6, 8, 10]); const A = k * k;
    return { q:`A SQUARE quilt is made from ${A} square patches. Each patch is ${p} inches on each side. How long is each edge of the quilt?`, kind:'num', a:k * p, unit:'in',
      hint:`First find how many patches are along one edge (√${A}). Then multiply by the size of a patch.`, steps:[`Patches along one edge: √${A} = ${k}, because ${k} × ${k} = ${A}.`, `Each patch is ${p} inches: ${k} × ${p} = ${k * p}.`, `Each edge of the quilt is ${k * p} inches.`] }; });
  addT(SW, (R, lvl) => { const s = swSide(R, lvl); const nm = R.pick(NAMES); const t = R.pick(['photo', 'painting', 'mirror', 'card']);
    return { q:`${nm}'s SQUARE ${t} is ${s} inches on each side. How many inches of frame trim go all the way around it?`, kind:'num', a:4 * s, unit:'in',
      hint:'All the way around means perimeter. A square has 4 equal sides.', model:{ type:'rect', w:s, h:s, unit:'in', grid:false },
      steps:['Around the edge means perimeter.', `4 equal sides: ${s} + ${s} + ${s} + ${s} = 4 × ${s}`, `= ${4 * s} inches.`] }; });
  addT(SW, (R, lvl) => { const s = swSide(R, lvl), P4 = 4 * s, A = s * s;
    return { q:`A fence that is ${P4} feet long goes all the way around a SQUARE garden. How many 1-foot square tiles would it take to cover the garden?`, kind:'num', a:A, unit:'tiles',
      hint:'Find one side from the fence (perimeter ÷ 4). Then the number of tiles is side × side.', steps:[`One side: ${P4} ÷ 4 = ${s} feet.`, `Tiles: ${s} × ${s} = ${A}.`, `It takes ${A} tiles.`] }; });
  addT(SW, (R, lvl) => { const s = swSide(R, lvl), A = s * s, P4 = 4 * s, F = P4 + R.int(3, 30); const nm = R.pick(NAMES);
    return { q:`${nm} has ${F} feet of fencing. ${nm} fences all the way around a SQUARE dog pen with an area of ${A} square feet. How many feet of fencing are left over?`, kind:'num', a:F - P4, unit:'ft',
      hint:'Find the side, then the perimeter. Subtract it from the fencing ' + nm + ' has.', steps:[...swFind(A, s, 'ft'), `Perimeter: 4 × ${s} = ${P4} feet.`, `Left over: ${F} − ${P4} = ${F - P4} feet.`] }; });
  addT(SW, (R, lvl) => { const s = swSide(R, lvl), k = R.int(1, 5); const A = s * s, B = (s + k) * (s + k);
    return { q:`A SQUARE garden has an area of ${A} square feet. Each side is made ${k} ${plural(k, 'foot').replace('foots', 'feet')} longer. What is the new area?`, kind:'num', a:B, unit:'ft²',
      hint:'Find the old side first. Add to it. Then multiply the new side by itself.', steps:[...swFind(A, s, 'ft'), `New side: ${s} + ${k} = ${s + k} feet.`, `New area: ${s + k} × ${s + k} = ${B} square feet.`] }; });
  addT(SW, (R, lvl) => { const k = R.pick([8, 8, 6, 10, 9]); const n = k * k; const g = R.pick(['checkerboard', 'game board', 'floor of tiles', 'pegboard']);
    return { q:`A SQUARE ${g} has ${k} small squares along each side. How many small squares are on the whole board?`, kind:'num', a:n, fact:'sq' + n, model:arr(k),
      hint:'Rows × columns, and in a square they are the same.', steps:[`${k} rows of ${k} squares: ${k} × ${k}`, `= ${n} small squares.`] }; });

  M['g5.sqword'] = { name:'Square roots in real life', unit:'g5u5', gen(R, lvl){ return run(R, lvl, SW); } };

  // ======================= g5.absval =======================
  const avL = l => [0, 20, 50, 100][l];
  const AV = [];
  addT(AV, (R, lvl) => { const n = R.chance(0.7) ? -R.int(1, avL(lvl)) : R.int(1, avL(lvl));
    return { q:`What is |${N(n)}|?`, kind:'num', a:Math.abs(n), model:nlAuto([{ x:n, label:N(n) }], []), hint:'Absolute value is the DISTANCE from zero. Distance is never negative.',
      steps:[`|${N(n)}| means: how far is ${N(n)} from 0?`, `${N(n)} is ${Math.abs(n)} units from 0.`, `|${N(n)}| = ${Math.abs(n)}`] }; });
  addT(AV, (R, lvl) => { const n = rnz(R, -avL(lvl), avL(lvl));
    return { q:`What is the opposite of ${N(n)}?`, kind:'num', a:-n, model:nlv([n, -n]), hint:'Opposites are the same distance from zero, on the other side.',
      steps:[`${N(n)} is ${Math.abs(n)} units ${n < 0 ? 'left' : 'right'} of 0.`, 'Go the same distance on the other side of 0.', `The opposite of ${N(n)} is ${N(-n)}.`] }; });
  addT(AV, (R, lvl) => { const n = rnz(R, -avL(lvl), avL(lvl));
    return { q:`What is −|${N(n)}|?`, kind:'num', a:-Math.abs(n), hint:'Do the absolute value first. Then the − sign outside makes it the opposite.',
      steps:[`Inside first: |${N(n)}| = ${Math.abs(n)}`, `The − sign outside means "the opposite of": −${Math.abs(n)}`, `Answer: ${N(-Math.abs(n))}`] }; });
  for (const op of ['+', '−', '×']) addT(AV, (R, lvl) => { const L = op === '×' ? [0, 6, 10, 12][lvl] : avL(lvl) / 2; const a = rnz(R, -L, L), b = rnz(R, -L, L); if (a > 0 && b > 0) return null;
    const x = Math.abs(a), y = Math.abs(b); const r = op === '+' ? x + y : op === '−' ? x - y : x * y;
    return { q:`What is |${N(a)}| ${op} |${N(b)}|?`, kind:'num', a:r, hint:'Find each absolute value first, then do the operation.', steps:[`|${N(a)}| = ${x}`, `|${N(b)}| = ${y}`, `${x} ${op} ${y} = ${N(r)}`] }; });
  for (const far of [true, false]) addT(AV, (R, lvl) => { const v = distinct(R, 4, -avL(lvl), avL(lvl), x => x !== 0); if (!v) return null; const ab = v.map(Math.abs);
    const t = far ? Math.max(...ab) : Math.min(...ab); if (ab.filter(x => x === t).length > 1) return null; const a = N(v[ab.indexOf(t)]); const trick = N(far ? Math.max(...v) : Math.min(...v));
    return { q:`Which number is ${far ? 'FARTHEST from' : 'CLOSEST to'} zero?   ${v.map(N).join(',   ')}`, kind:'choice', a, choices:choose(a, [trick, ...v.map(N)]), model:nlv(v),
      hint:'Compare absolute values. Ignore the sign and look at the size.', steps:[`Absolute values: ${v.map(x => `|${N(x)}| = ${Math.abs(x)}`).join(', ')}`, `The ${far ? 'biggest' : 'smallest'} distance is ${t}.`, `Answer: ${a}`] }; });
  addT(AV, (R, lvl) => { const k = R.int(2, avL(lvl) / 2); const a = `${k} and ${N(-k)}`;
    return { q:`Which pair of numbers BOTH have an absolute value of ${k}?`, kind:'choice', a, choices:choose(a, [`${k} and 0`, `${N(-k)} and ${N(-2 * k)}`, `${2 * k} and ${N(-2 * k)}`]), model:nlv([-k, k]),
      hint:'Which numbers are exactly that many steps from 0? Look both ways!', steps:[`Absolute value ${k} means ${k} units from 0.`, `${k} units right of 0 is ${k}. ${k} units left of 0 is ${N(-k)}.`, `Both: ${a}`] }; });
  addT(AV, (R, lvl) => { const d = R.int(2, avL(lvl) / 2);
    return { q:`It is ${N(-d)}°F outside. How many degrees below zero is that?`, kind:'num', a:d, unit:'°F', model:nlAuto([{ x:-d, label:N(-d) }, { x:0, label:'0' }], []),
      hint:'"How far below zero" is the absolute value.', steps:[`The temperature is ${N(-d)}°F.`, `Its distance from 0 is |${N(-d)}| = ${d}.`, `It is ${d} degrees below zero.`] }; });
  addT(AV, (R, lvl) => { const d = R.int(5, avL(lvl) * 3); const what = R.pick(['A submarine', 'A shark', 'A scuba diver', 'A shipwreck']);
    return { q:`${what} is at ${N(-d)} feet (below sea level). How many feet is it from sea level?`, kind:'num', a:d, unit:'ft', hint:'Sea level is 0. Find the distance from 0.',
      steps:['Sea level is 0 feet.', `Distance from 0 is |${N(-d)}| = ${d}.`, `It is ${d} feet from sea level.`] }; });
  addT(AV, (R, lvl) => { const d = R.int(3, avL(lvl) * 2), nm = R.pick(NAMES);
    return { q:`${nm}'s account balance is ${money(-d)}. How many dollars does ${nm} owe?`, kind:'num', a:d, unit:'$', hint:'The size of a debt is the absolute value of the balance.',
      steps:[`The balance is ${money(-d)}.`, `The size of the debt is |${N(-d)}| = ${d}.`, `${nm} owes $${d}.`] }; });
  for (const kind of ['abs', 'one']) addT(AV, (R, lvl) => { const L = avL(lvl); const a = rnz(R, -L, L); let b = R.chance(0.2) ? -a : rnz(R, -L, L);
    const x = kind === 'abs' ? Math.abs(a) : a, y = Math.abs(b); const sym = x < y ? '<' : x > y ? '>' : '='; const left = kind === 'abs' ? `|${N(a)}|` : N(a);
    return { q:`Which symbol makes this true?   ${left}  ☐  |${N(b)}|`, kind:'choice', a:sym, choices:['<', '>', '='], hint:'Find the value of any absolute value first. Then compare.',
      steps:[...(kind === 'abs' ? [`|${N(a)}| = ${x}`] : []), `|${N(b)}| = ${y}`, `Compare ${N(x)} and ${y}: ${N(x)} ${sym} ${y}`, `So ${left} ${sym} |${N(b)}|`] }; });
  addT(AV, (R, lvl) => { const d = R.int(5, avL(lvl)), h = R.int(5, avL(lvl) + 10);
    return { q:`A diver is at ${N(-d)} feet. A bird flies at ${h} feet above sea level, right above the diver. How far apart are they?`, kind:'num', a:d + h, unit:'ft',
      model:nlAuto([{ x:-d, label:'diver' }, { x:0, label:'sea' }, { x:h, label:'bird' }], []), hint:'They are on opposite sides of 0. Find each distance from 0, then add.',
      steps:[`Diver to sea level: |${N(-d)}| = ${d} ft`, `Sea level to bird: ${h} ft`, `Opposite sides of 0, so add: ${d} + ${h} = ${d + h}`, `They are ${d + h} feet apart.`] }; });
  addT(AV, (R, lvl) => { const k = R.int(2, avL(lvl) / 2); const t = R.int(0, 4); let st, ok;
    if (t === 0){ st = `|${N(-k)}| = ${N(-k)}`; ok = false; } else if (t === 1){ st = `|${N(-k)}| = ${k}`; ok = true; } else if (t === 2){ st = `|${k}| = |${N(-k)}|`; ok = true; }
    else if (t === 3){ const j = R.int(1, k - 1); st = `|${N(-k)}| < |${j}|`; ok = false; } else { const j = R.int(1, k - 1); st = `${N(-k)} < ${N(-j)}`; ok = true; }
    const a = ok ? 'True' : 'False';
    return { q:`True or false?   ${st}`, kind:'choice', a, choices:['True', 'False'], hint:'Absolute value is distance from 0, so it is never negative.',
      steps:[`Work out each side: ${st.replace(/\|([^|]+)\|/g, (m, x) => m + ' = ' + Math.abs(+x.replace(MS, '-')))}`, `The statement is ${a.toLowerCase()}.`] }; });
  for (const strict of [true, false]) addT(AV, (R, lvl) => { const k = R.int(2, [0, 6, 12, 25][lvl]); const a = strict ? 2 * k - 1 : 2 * k + 1;
    return { q:`How many integers have an absolute value ${strict ? 'LESS THAN' : 'LESS THAN OR EQUAL TO'} ${k}?`, kind:'num', a, hint:'Count from the left side of 0, include 0, then count the right side.',
      steps:[strict ? `They are the integers from ${N(-(k - 1))} to ${k - 1}.` : `They are the integers from ${N(-k)} to ${k}.`, `Negatives: ${strict ? k - 1 : k}. Zero: 1. Positives: ${strict ? k - 1 : k}.`, `Total: ${strict ? k - 1 : k} + 1 + ${strict ? k - 1 : k} = ${a}`] }; });
  addT(AV, (R, lvl) => { const k = R.int(1, avL(lvl) / 2); const a = `${k} or ${N(-k)}`;
    return { q:`|x| = ${k}. What can x be?`, kind:'choice', a, choices:[a, `${k} only`, `${N(-k)} only`, `0 or ${k}`], model:nlv([-k, k]), hint:'Which numbers are exactly ' + k + ' units from 0? There are two!',
      steps:[`|x| = ${k} means x is ${k} units from 0.`, `Right of 0: ${k}. Left of 0: ${N(-k)}.`, `Answer: ${a}`] }; });
  addT(AV, (R, lvl) => { const [n1, n2] = two(R); const v = distinct(R, 2, 5, avL(lvl) * 2); if (!v) return null; const a = v[0] > v[1] ? n1 : n2;
    return { q:`${n1}'s balance is ${money(-v[0])}. ${n2}'s balance is ${money(-v[1])}. Who owes MORE money?`, kind:'choice', a, choices:[n1, n2],
      hint:'The bigger debt has the bigger absolute value, even though its balance is the lower number.', steps:[`${n1} owes |${N(-v[0])}| = $${v[0]}.`, `${n2} owes |${N(-v[1])}| = $${v[1]}.`, `${a} owes more.`] }; });
  addT(AV, (R, lvl) => { const ab = distinct(R, 4, 1, avL(lvl)); if (!ab) return null; const v = ab.map(x => R.chance(0.6) ? -x : x); const s = [...v].sort((x, y) => Math.abs(x) - Math.abs(y));
    const a = s.map(N).join(', '); const ds = [[...v].sort((x, y) => x - y).map(N).join(', '), [...s].reverse().map(N).join(', '), [s[1], s[0], s[2], s[3]].map(N).join(', ')];
    return { q:`Order by ABSOLUTE VALUE, least to greatest:   ${v.map(N).join(',   ')}`, kind:'choice', a, choices:choose(a, ds), hint:'Look only at each number\'s distance from 0.',
      steps:[`Absolute values: ${v.map(x => `|${N(x)}| = ${Math.abs(x)}`).join(', ')}`, `From smallest distance to largest: ${a}`] }; });
  addT(AV, (R, lvl) => { const n = R.int(1, avL(lvl));
    return { q:`What is −(${N(-n)})?`, kind:'num', a:n, hint:'−( ) means "the opposite of". What is the opposite of a negative?',
      steps:[`−(${N(-n)}) means the opposite of ${N(-n)}.`, `The opposite of ${N(-n)} is ${n}.`, `Answer: ${n}`] }; });
  addT(AV, (R, lvl) => { const g = R.int(1, [0, 5, 9, 12][lvl]), nm = R.pick(NAMES);
    return { q:`In golf, ${nm}'s score was ${N(-g)} (that is ${g} under par). How many strokes away from par is that?`, kind:'num', a:g, hint:'Par is like 0. How far is the score from 0?',
      steps:['Par is 0.', `|${N(-g)}| = ${g}`, `${nm} was ${g} ${plural(g, 'stroke')} away from par.`] }; });
  addT(AV, (R, lvl) => { const v = distinct(R, 2, 5, avL(lvl) * 3); if (!v) return null; const a1 = `the cave at ${N(-v[0])} feet`, a2 = `the hilltop at ${v[1]} feet`;
    const a = v[0] > v[1] ? a1 : a2;
    return { q:`A cave is at ${N(-v[0])} feet and a hilltop is at ${v[1]} feet. Which one is FARTHER from sea level?`, kind:'choice', a, choices:[a1, a2], hint:'Compare distances from 0: use absolute value.',
      steps:[`Cave: |${N(-v[0])}| = ${v[0]} feet from sea level.`, `Hilltop: |${v[1]}| = ${v[1]} feet from sea level.`, `Farther: ${a}`] }; });
  addT(AV, (R, lvl) => { const k = R.int(2, avL(lvl)), nm = R.pick(NAMES);
    return { q:`${nm} says |${N(-k)}| = ${N(-k)}. That is not right. What is |${N(-k)}| really?`, kind:'num', a:k, hint:'Absolute value is a distance, and a distance is never negative.',
      steps:[`${nm} kept the negative sign. But absolute value is distance from 0.`, `${N(-k)} is ${k} units from 0.`, `|${N(-k)}| = ${k}`] }; });
  addT(AV, (R, lvl) => { const L = avL(lvl) / 2; const a = rnz(R, -L, L), b = rnz(R, -L, L); if (a > 0 && b > 0) return null; const s = a + b;
    return { q:`What is |${N(a)} + ${P(b)}|?`, kind:'num', a:Math.abs(s), hint:'Work inside the absolute value bars first, like parentheses. Then take the absolute value.',
      steps:[`Inside first: ${N(a)} + ${P(b)} = ${N(s)}`, `|${N(s)}| = ${Math.abs(s)}`] }; });
  addT(AV, (R, lvl) => { const n = rnz(R, -avL(lvl), avL(lvl)); const ab = Math.abs(n); const a = N(-n);
    return { q:`Which number has the same absolute value as ${N(n)}?`, kind:'choice', a, choices:choose(a, [N(ab + 1), N(-(ab + 1)), '0', N(ab - 1 || 2 * ab)]), hint:'Same absolute value = same distance from 0.',
      steps:[`|${N(n)}| = ${ab}.`, `The other number that is ${ab} units from 0 is ${a}.`, `Answer: ${a}`] }; });
  addT(AV, (R, lvl) => { const n = rnz(R, -avL(lvl), avL(lvl));
    return { q:`On a number line, how many units is ${N(n)} from 0?`, kind:'num', a:Math.abs(n), model:nlAuto([{ x:n, label:N(n) }], []), hint:'Count the units from 0 to the number. That count is its absolute value.',
      steps:[`Count from 0 to ${N(n)}.`, `That is ${Math.abs(n)} units, so |${N(n)}| = ${Math.abs(n)}.`] }; });

  M['g5.absval'] = { name:'Absolute value & opposites', unit:'g5u2', gen(R, lvl){ return run(R, lvl, AV); } };

  // ======================= g5.intcompare =======================
  const icL = l => [0, 10, 30, 100][l];
  const CITIES = ['Fairbanks', 'Denver', 'Chicago', 'Boston', 'Fargo', 'Duluth', 'Helena', 'Buffalo'];
  const IC = [];
  addT(IC, (R, lvl) => { const L = icL(lvl); const a = R.int(-L, L), b = R.chance(0.1) ? a : R.int(-L, L); const sym = a < b ? '<' : a > b ? '>' : '=';
    const where = a < b ? `${N(a)} is to the LEFT of ${N(b)}` : a > b ? `${N(a)} is to the RIGHT of ${N(b)}` : 'They are the same number';
    return { q:`Which symbol makes this true?   ${N(a)}  ☐  ${N(b)}`, kind:'choice', a:sym, choices:['<', '>', '='], model:nlv(a === b ? [a] : [a, b]),
      hint:'On a number line, numbers get bigger as you move RIGHT. Negative numbers are left of zero.', steps:['Find both numbers on the number line.', where + '.', `So ${N(a)} ${sym} ${N(b)}`] }; });
  for (const big of [true, false]) addT(IC, (R, lvl) => { const L = icL(lvl); const v = distinct(R, 4, -L, L); if (!v || !v.some(x => x < 0)) return null; const a = N(big ? Math.max(...v) : Math.min(...v));
    const abs = v.reduce((m, x) => Math.abs(x) > Math.abs(m) ? x : m, v[0]);
    return { q:`Which number is the ${big ? 'GREATEST' : 'LEAST'}?   ${v.map(N).join(',   ')}`, kind:'choice', a, choices:choose(a, [N(abs), ...v.map(N)]), model:nlv(v),
      hint: big ? 'The greatest number is farthest to the RIGHT on the number line.' : 'The least number is farthest to the LEFT. A big negative is very small!',
      steps:['Picture the numbers on a number line.', big ? 'Look for the one farthest right.' : 'Look for the one farthest left.', `The ${big ? 'greatest' : 'least'} is ${a}.`] }; });
  for (const up of [true, false]) addT(IC, (R, lvl) => { const L = icL(lvl); const v = distinct(R, lvl === 1 ? 4 : 5, -L, L); if (!v || v.filter(x => x < 0).length < 2) return null;
    const s = [...v].sort((a, b) => up ? a - b : b - a); const ans = s.map(N).join(', ');
    const ds = [[...v].sort((a, b) => up ? Math.abs(a) - Math.abs(b) : Math.abs(b) - Math.abs(a)).map(N).join(', '), [...s].reverse().map(N).join(', '), [s[1], s[0], ...s.slice(2)].map(N).join(', ')];
    return { q:`Order from ${up ? 'LEAST to GREATEST' : 'GREATEST to LEAST'}:   ${v.map(N).join(',   ')}`, kind:'choice', a:ans, choices:choose(ans, ds), model:nlv(v),
      hint:'Picture a number line. The negative farthest from zero is the SMALLEST.', steps:['Place each number on the number line.', `Read them ${up ? 'from left to right' : 'from right to left'}.`, `Order: ${ans}`] }; });
  for (const cold of [true, false]) addT(IC, (R, lvl) => { const cs = R.shuffle(CITIES).slice(0, 4); const t = distinct(R, 4, -icL(lvl), Math.round(icL(lvl) / 2)); if (!t || !t.some(x => x < 0)) return null;
    const pick = cold ? Math.min(...t) : Math.max(...t); const a = cs[t.indexOf(pick)];
    return { q:`Low temperatures: ${cs.map((c, i) => `${c} ${N(t[i])}°F`).join(',  ')}. Which city was the ${cold ? 'COLDEST' : 'WARMEST'}?`, kind:'choice', a, choices:cs, model:nlv(t),
      hint: cold ? 'The coldest temperature is the LEAST number: farthest left on the number line.' : 'The warmest temperature is the GREATEST number: farthest right.',
      steps:[`The temperatures are ${t.map(N).join(', ')}.`, `The ${cold ? 'least' : 'greatest'} is ${N(pick)}.`, `${a} was the ${cold ? 'coldest' : 'warmest'}.`] }; });
  addT(IC, (R, lvl) => { const pl = R.shuffle(['a cave', 'a lake bottom', 'a hilltop', 'a valley', 'a mine tunnel', 'a parking garage']).slice(0, 3); const e = distinct(R, 3, -icL(lvl) * 2, icL(lvl)); if (!e || !e.some(x => x < 0)) return null;
    const lo = Math.min(...e); const a = pl[e.indexOf(lo)];
    return { q:`Elevations: ${pl.map((p, i) => `${p} at ${N(e[i])} ft`).join(',  ')}. Which place has the LOWEST elevation?`, kind:'choice', a, choices:pl,
      hint:'Lowest elevation = least number. Negatives are below sea level.', steps:[`Compare ${e.map(N).join(', ')}.`, `The least is ${N(lo)}.`, `Lowest: ${a}`] }; });
  addT(IC, (R, lvl) => { const L = icL(lvl); const a = rnz(R, -L, L), b = rnz(R, -L, L); if (a === b || (a > 0 && b > 0)) return null; const sym = R.pick(['<', '>']); const ok = sym === '<' ? a < b : a > b;
    const ans = ok ? 'True' : 'False';
    return { q:`True or false?   ${N(a)} ${sym} ${N(b)}`, kind:'choice', a:ans, choices:['True', 'False'], model:nlv([a, b]), hint:'The number farther RIGHT on the number line is greater.',
      steps:[`${N(a)} is to the ${a < b ? 'left' : 'right'} of ${N(b)}, so ${N(a)} ${a < b ? '<' : '>'} ${N(b)}.`, `The statement is ${ans.toLowerCase()}.`] }; });
  addT(IC, (R, lvl) => { const L = icL(lvl); const a = R.int(-L, L - 4), b = R.int(a + 3, Math.min(L, a + 12)); if (b >= 0 && a >= 0) return null; const x = R.int(a + 1, b - 1);
    const ds = [a - R.int(1, 3), b + R.int(1, 3), a === 0 ? null : -x, a, b].filter(v => v !== null && (v <= a || v >= b)).map(N);
    return { q:`Which number is between ${N(a)} and ${N(b)}?`, kind:'choice', a:N(x), choices:choose(N(x), R.shuffle(ds)), model:nlv([a, b]), hint:'It must be greater than the first number and less than the second.',
      steps:[`Between means: greater than ${N(a)} AND less than ${N(b)}.`, `${N(x)} is to the right of ${N(a)} and to the left of ${N(b)}.`, `Answer: ${N(x)}`] }; });
  addT(IC, (R, lvl) => { const L = icL(lvl); const a = R.int(-L, -2), b = R.int(a + 2, Math.min(L, a + 30)); const n = b - a - 1;
    return { q:`How many integers are between ${N(a)} and ${N(b)}? (Do not count ${N(a)} or ${N(b)}.)`, kind:'num', a:n, hint:'Count the steps from one to the other, then take away 1.',
      steps:[`From ${N(a)} to ${N(b)} is ${b - a} steps on the number line.`, `The integers strictly between them: ${b - a} − 1 = ${n}.`, n <= 12 ? `They are: ${Array.from({ length:n }, (_, i) => N(a + 1 + i)).join(', ')}` : `Answer: ${n}`] }; });
  addT(IC, (R, lvl) => { const ns = R.shuffle(NAMES).slice(0, 4); const sc = distinct(R, 4, -[0, 5, 8, 12][lvl], [0, 5, 8, 12][lvl]); if (!sc || !sc.some(x => x < 0)) return null;
    const lo = Math.min(...sc); const a = ns[sc.indexOf(lo)];
    return { q:`In golf, the LOWEST score wins. Scores compared to par: ${ns.map((n, i) => `${n} ${sgn(sc[i])}`).join(',  ')}. Who won?`, kind:'choice', a, choices:ns,
      hint:'Find the least number. Negative scores are below par.', steps:[`Scores: ${sc.map(sgn).join(', ')}`, `The least is ${N(lo)}.`, `${a} won.`] }; });
  addT(IC, (R, lvl) => { const ns = R.shuffle(NAMES).slice(0, 3); const b = distinct(R, 3, -icL(lvl) * 2, icL(lvl)); if (!b || b.filter(x => x < 0).length < 2) return null;
    const lo = Math.min(...b); const a = ns[b.indexOf(lo)];
    return { q:`Bank balances: ${ns.map((n, i) => `${n} ${money(b[i])}`).join(',  ')}. Whose balance is the LOWEST?`, kind:'choice', a, choices:ns,
      hint:'A bigger debt means a lower (more negative) balance.', steps:[`Balances: ${b.map(N).join(', ')}`, `The least is ${N(lo)}.`, `${a} has the lowest balance.`] }; });
  addT(IC, (R, lvl) => { const n = rnz(R, -icL(lvl), icL(lvl)); const a = n > 0 ? N(n) : N(-n);
    return { q:`Which is greater:  ${N(n)}  or its opposite?`, kind:'choice', a, choices:[N(n), N(-n), 'They are equal'], model:nlv([n, -n]),
      hint:'The opposite is on the other side of 0. Positive numbers are always greater than negative numbers.', steps:[`The opposite of ${N(n)} is ${N(-n)}.`, `The positive one is greater.`, `Answer: ${a}`] }; });
  addT(IC, (R, lvl) => { const L = icL(lvl); const T = [], F = []; for (let g = 0; g < 300 && (T.length < 1 || F.length < 3); g++){ const a = rnz(R, -L, L), b = rnz(R, -L, L); if (a === b || (a > 0 && b > 0)) continue;
      const sym = R.pick(['<', '>']); const s = `${N(a)} ${sym} ${N(b)}`; const ok = sym === '<' ? a < b : a > b; if (ok && T.length < 1) T.push(s); else if (!ok && F.length < 3 && F.indexOf(s) < 0) F.push(s); }
    if (T.length < 1 || F.length < 3) return null;
    return { q:'Which statement is TRUE?', kind:'choice', a:T[0], choices:[T[0], ...F], hint:'Check each one on a number line: the number farther right is greater.',
      steps:['Check each statement. Remember: farther right = greater.', `${T[0]} is true.`, 'The other three are false.'] }; });
  for (const more of [true, false]) addT(IC, (R, lvl) => { const x = rnz(R, -icL(lvl), icL(lvl)); const a = more ? x + 1 : x - 1;
    return { q:`What is the ${more ? 'least integer GREATER' : 'greatest integer LESS'} than ${N(x)}?`, kind:'num', a, hint: more ? 'Take one step to the RIGHT on the number line.' : 'Take one step to the LEFT on the number line.',
      steps:[`${more ? 'Greater' : 'Less'} means ${more ? 'right' : 'left'} of ${N(x)} on the number line.`, `The very next integer ${more ? 'to the right' : 'to the left'} is ${N(a)}.`, `Answer: ${N(a)}`] }; });
  addT(IC, (R, lvl) => { const v = distinct(R, 4, -10, 10); if (!v) return null; const L = ['A', 'B', 'C', 'D']; const s = [...v].sort((a, b) => a - b); const k = R.int(0, 3);
    return { q:`Which point is at ${N(s[k])} on the number line?`, kind:'choice', a:L[k], choices:L.slice(), model:{ type:'numberline', min:-10, max:10, step:1, label:2, points:s.map((x, i) => ({ x, label:L[i] })) },
      hint:'Find 0 first. Negative numbers are to the left of 0. Count the tick marks.', steps:['Start at 0 and count tick marks.', `${N(s[k])} is ${Math.abs(s[k])} ${plural(Math.abs(s[k]), 'tick')} ${s[k] < 0 ? 'left' : 'right'} of 0.`, `That is point ${L[k]}.`] }; });
  addT(IC, (R, lvl) => { const v = distinct(R, 4, -10, 10, x => x !== 0); if (!v) return null; const L = ['A', 'B', 'C', 'D']; const s = [...v].sort((a, b) => a - b); const k = R.int(0, 3);
    return { q:`What number is at point ${L[k]}?`, kind:'num', a:s[k], model:{ type:'numberline', min:-10, max:10, step:1, label:2, points:s.map((x, i) => ({ x, label:L[i] })) },
      hint:'Find 0. Count tick marks to the point. Left of 0 means negative.', steps:['Start at 0.', `Point ${L[k]} is ${Math.abs(s[k])} ${plural(Math.abs(s[k]), 'tick')} to the ${s[k] < 0 ? 'left' : 'right'}.`, `So it is ${N(s[k])}.`] }; });
  addT(IC, (R, lvl) => { const v = distinct(R, lvl === 1 ? 3 : 5, -icL(lvl), icL(lvl)); if (!v || !v.some(x => x < 0)) return null; const s = [...v].sort((a, b) => a - b); const mid = s[(s.length - 1) / 2];
    return { q:`Put these in order. Which number is in the MIDDLE?   ${v.map(N).join(',   ')}`, kind:'choice', a:N(mid), choices:choose(N(mid), v.map(N)), hint:'Order them from least to greatest first.',
      steps:[`Order: ${s.map(N).join(', ')}`, `The middle one is ${N(mid)}.`] }; });
  addT(IC, (R, lvl) => { const L = icL(lvl); const k = R.int(-L + 5, L - 5); const yes = R.int(k - 8, k - 1); const no = distinct(R, 3, k, k + 15); if (!no) return null;
    return { q:`Which number is LESS than ${N(k)}?`, kind:'choice', a:N(yes), choices:[N(yes), ...no.map(N)], hint:'Less means to the LEFT on the number line.',
      steps:[`Look for a number to the left of ${N(k)}.`, `${N(yes)} < ${N(k)} ✓`, `Answer: ${N(yes)}`] }; });
  addT(IC, (R, lvl) => { const v = distinct(R, 2, 1, [0, 4, 6, 9][lvl]); if (!v) return null; const a = N(-Math.max(...v));
    return { q:`A parking garage has underground levels ${N(-v[0])} and ${N(-v[1])}. Which level is DEEPER underground?`, kind:'choice', a, choices:[N(-v[0]), N(-v[1])],
      hint:'Deeper means lower, so it is the lesser number.', steps:[`Compare ${N(-v[0])} and ${N(-v[1])}.`, `${a} is farther left (lower).`, `Level ${a} is deeper.`] }; });
  addT(IC, (R, lvl) => { const L = icL(lvl); const a = R.int(-L, L - 5), b = R.int(a + 3, Math.min(L, a + 15)); if (a >= 0) return null; const x = R.int(a + 1, b - 1);
    const out = [a, b, a - R.int(1, 5), b + R.int(1, 5)].map(N);
    return { q:`Which number is greater than ${N(a)} but less than ${N(b)}?`, kind:'choice', a:N(x), choices:choose(N(x), out), hint:'It must be to the right of the first number and to the left of the second.',
      steps:[`Greater than ${N(a)}: to its right. Less than ${N(b)}: to its left.`, `${N(x)} fits both.`, `Answer: ${N(x)}`] }; });

  M['g5.intcompare'] = { name:'Compare & order integers', unit:'g5u2', gen(R, lvl){ return run(R, lvl, IC); } };

  // ======================= g5.ineq =======================
  const SYMS = ['>', '≥', '<', '≤'];
  const IW = { '>':'greater than', '≥':'greater than or equal to', '<':'less than', '≤':'less than or equal to' };
  const IWS = { '>':'is more than', '≥':'is at least', '<':'is less than', '≤':'is at most' };
  function itest(s, x, c){ return s === '>' ? x > c : s === '≥' ? x >= c : s === '<' ? x < c : x <= c; }
  const isOpen = s => s === '>' || s === '<', isRight = s => s === '>' || s === '≥';
  function iModel(c, s, dir, open){ const w = Math.abs(c) <= 8 ? 10 : 20; return { type:'numberline', min:-w, max:w, step:1, label:w === 10 ? 2 : 5, points:[], ray:{ from:c, dir: dir || (isRight(s) ? 'right' : 'left'), open: open === undefined ? isOpen(s) : open } }; }
  const ic = l => l === 1 ? [-8, 8] : l === 2 ? [-12, 12] : [-18, 18];
  function cOf(R, l){ const [a, b] = ic(l); return R.int(a, b); }
  function graphSteps(c, s){ return [`The circle is at ${N(c)}.`, isOpen(s) ? `The circle is OPEN, so ${N(c)} is NOT included: use > or <.` : `The circle is CLOSED (filled), so ${N(c)} IS included: use ≥ or ≤.`, `The arrow points ${isRight(s) ? 'right, toward greater' : 'left, toward smaller'} numbers.`]; }
  const IHINT = 'Open circle: the number is NOT included (> or <). Closed circle: it IS included (≥ or ≤). Arrow right = greater, arrow left = less.';
  const IQ = [];
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const a = `x ${s} ${N(c)}`;
    return { q:'Which inequality matches the graph?', kind:'choice', a, choices:SYMS.map(t => `x ${t} ${N(c)}`), model:iModel(c, s), hint:IHINT, steps:[...graphSteps(c, s), `Answer: ${a}`] }; });
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const a = `t ${s} ${N(c)}`;
    return { q:'The graph shows the temperatures t (in °F) during one night. Which inequality matches?', kind:'choice', a, choices:SYMS.map(t => `t ${t} ${N(c)}`), model:iModel(c, s), hint:IHINT, steps:[...graphSteps(c, s), `Answer: ${a}`] }; });
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const d = (o, r) => `${o ? 'open' : 'closed'} circle at ${N(c)}, arrow ${r ? 'right' : 'left'}`; const a = d(isOpen(s), isRight(s));
    return { q:`How would you graph  x ${s} ${N(c)}?`, kind:'choice', a, choices:[d(true, true), d(true, false), d(false, true), d(false, false)], hint:IHINT,
      steps:[isOpen(s) ? `${s} does not include ${N(c)}: open circle.` : `${s} includes ${N(c)}: closed circle.`, isRight(s) ? 'Greater → arrow points right.' : 'Less → arrow points left.', `Answer: ${a}`] }; });
  for (const want of [true, false]) addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const yes = [], no = [];
    for (let x = c - 6; x <= c + 6; x++) (itest(s, x, c) ? yes : no).push(x);
    const pool = want ? yes : no; const ans = R.pick(pool.filter(x => Math.abs(x - c) <= 4)); let others = R.shuffle(want ? no : yes).filter(x => Math.abs(x - c) <= 5);
    if (isOpen(s) && want && others.indexOf(c) >= 0) others = [c, ...others.filter(x => x !== c)]; if (!isOpen(s) && !want && others.indexOf(c) >= 0) others = [c, ...others.filter(x => x !== c)];
    const a = N(ans);
    return { q:`Which number is ${want ? '' : 'NOT '}a solution of  x ${s} ${N(c)}?`, kind:'choice', a, choices:choose(a, others.map(N)),
      hint:`A solution makes the inequality TRUE. Ask: is the number ${IW[s]} ${N(c)}?`,
      steps:[`x ${s} ${N(c)} means x is ${IW[s]} ${N(c)}.`, isOpen(s) ? `${N(c)} itself is NOT a solution.` : `${N(c)} itself IS a solution.`, `${a} ${s} ${N(c)} is ${want ? 'true' : 'false'}, so ${a} is ${want ? '' : 'NOT '}a solution.`] }; });
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS), v = R.int(c - 5, c + 5); const ok = itest(s, v, c); const a = ok ? 'Yes' : 'No';
    return { q:`Is ${N(v)} a solution of  x ${s} ${N(c)}?`, kind:'choice', a, choices:['Yes', 'No'], hint:`Put ${N(v)} in for x. Is it true?`,
      steps:[`Check: ${N(v)} ${s} ${N(c)}?`, `${N(v)} is ${v === c ? 'equal to' : v > c ? 'greater than' : 'less than'} ${N(c)}.`, ok ? 'That makes it true. Yes!' : 'That makes it false. No.'] }; });
  const WCTX = [
    { t:k => `You must be at least ${k} inches tall to ride the roller coaster.`, s:'≥', v:'h', k:R => R.int(40, 54) },
    { t:k => `A suitcase can weigh no more than ${k} pounds.`, s:'≤', v:'w', k:R => R.int(30, 50) },
    { t:k => `The temperature stayed below ${N(k)}°F all night.`, s:'<', v:'t', k:R => R.int(-10, 5) },
    { t:k => `More than ${k} people came to the game.`, s:'>', v:'p', k:R => R.int(20, 90) },
    { t:k => `You need a score of at least ${k} points to win a prize.`, s:'≥', v:'s', k:R => R.int(50, 90) },
    { t:k => `Fewer than ${k} students can fit on the bus.`, s:'<', v:'n', k:R => R.int(30, 60) },
    { t:k => `Kids may have at most ${k} minutes of screen time.`, s:'≤', v:'m', k:R => R.int(30, 90) },
    { t:k => `Children younger than ${k} get in free.`, s:'<', v:'a', k:R => R.int(3, 6) },
    { t:k => `The elevator holds a maximum of ${k} people.`, s:'≤', v:'p', k:R => R.int(8, 15) },
    { t:k => `You must be older than ${k} to join the club.`, s:'>', v:'a', k:R => R.int(8, 12) },
    { t:k => `It costs a minimum of $${k} to open a savings account.`, s:'≥', v:'d', k:R => R.int(10, 25) },
    { t:k => `The speed limit is ${k} mph, so cars may go no faster than that.`, s:'≤', v:'s', k:R => R.pick([25, 30, 35, 45, 55]) },
    { t:k => `The pool water must be warmer than ${k}°F.`, s:'>', v:'t', k:R => R.int(75, 82) },
    { t:k => `The low tonight will be at least ${N(k)}°F.`, s:'≥', v:'t', k:R => R.int(-12, -1) },
    { t:k => `The submarine always stays deeper than ${-k} feet below sea level, so its elevation e is below ${N(k)}.`, s:'<', v:'e', k:R => -R.int(10, 60) },
    { t:k => `A team must have more than ${k} players to play.`, s:'>', v:'p', k:R => R.int(4, 9) }
  ];
  const KEY = { '≥':'"at least" or "minimum" means that number or more: ≥', '≤':'"no more than", "at most" or "maximum" means that number or less: ≤', '<':'"below", "fewer than", "younger than" or "less than" means smaller, not equal: <', '>':'"more than", "older than" or "warmer than" means bigger, not equal: >' };
  addT(IQ, (R, lvl) => { const w = R.pick(WCTX), k = w.k(R); const a = `${w.v} ${w.s} ${N(k)}`;
    return { q:`${w.t(k)} Which inequality shows this?`, kind:'choice', a, choices:SYMS.map(s => `${w.v} ${s} ${N(k)}`),
      hint:'Key words: "at least" ≥, "no more than / at most" ≤, "more than" >, "less than / below / fewer than" <.', steps:[KEY[w.s], `So the inequality is ${a}`] }; });
  for (const fits of [true, false]) addT(IQ, (R, lvl) => { const w = R.pick(WCTX), k = w.k(R); const yes = [], no = [];
    for (let x = k - 6; x <= k + 6; x++) (itest(w.s, x, k) ? yes : no).push(x); if (!yes.length || !no.length) return null;
    const ans = R.pick(fits ? yes : no); let oth = R.shuffle(fits ? no : yes); if (oth.indexOf(k) >= 0) oth = [k, ...oth.filter(x => x !== k)];
    const a = N(ans);
    return { q:`${w.t(k)} Which value of ${w.v} ${fits ? 'FITS' : 'does NOT fit'} the rule?`, kind:'choice', a, choices:choose(a, oth.map(N)),
      hint:'Write the inequality first. Then test each number. Be careful with the number in the rule itself!',
      steps:[`The rule is ${w.v} ${w.s} ${N(k)}.`, `${N(k)} itself ${isOpen(w.s) ? 'does NOT' : 'DOES'} fit (${isOpen(w.s) ? 'not equal allowed' : 'equal is allowed'}).`, `${a} ${w.s} ${N(k)} is ${fits ? 'true' : 'false'}.`, `Answer: ${a}`] }; });
  addT(IQ, (R, lvl) => { const w = R.pick(WCTX), k = w.k(R); const least = isRight(w.s); const ans = w.s === '>' ? k + 1 : w.s === '≥' ? k : w.s === '<' ? k - 1 : k;
    return { q:`${w.t(k)} What is the ${least ? 'LEAST' : 'GREATEST'} integer value of ${w.v} that fits?`, kind:'num', a:ans,
      hint:'Write the inequality. Does it include the number itself, or not?',
      steps:[`The rule is ${w.v} ${w.s} ${N(k)}.`, isOpen(w.s) ? `${N(k)} is NOT allowed, so take the next integer ${least ? 'up' : 'down'}.` : `${N(k)} IS allowed.`, `Answer: ${N(ans)}`] }; });
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const a = `x ${IWS[s]} ${N(c)}`;
    return { q:`Which sentence means the same as  x ${s} ${N(c)}?`, kind:'choice', a, choices:SYMS.map(t => `x ${IWS[t]} ${N(c)}`), hint:'≥ means "at least". ≤ means "at most". > means "more than". < means "less than".',
      steps:[`${s} means ${IW[s]}.`, `Answer: ${a}`] }; });
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const a = `x is ${IW[s]} ${N(c)}`;
    return { q:'Which sentence describes the graph?', kind:'choice', a, choices:SYMS.map(t => `x is ${IW[t]} ${N(c)}`), model:iModel(c, s), hint:IHINT, steps:[...graphSteps(c, s), `Answer: ${a}`] }; });
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const lo = c - R.int(3, 6), hi = c + R.int(3, 6); let n = 0; for (let x = lo; x <= hi; x++) if (itest(s, x, c)) n++;
    return { q:`How many integers from ${N(lo)} to ${N(hi)} (including both) make  x ${s} ${N(c)}  true?`, kind:'num', a:n, hint:'List the integers from the first number to the last, then keep only the ones that work.',
      steps:[`x ${s} ${N(c)}: ${isOpen(s) ? N(c) + ' does not count' : N(c) + ' counts'}.`, `The ones that work: ${(() => { const L = []; for (let x = lo; x <= hi; x++) if (itest(s, x, c)) L.push(N(x)); return L.join(', '); })()}`, `That is ${n} ${plural(n, 'integer')}.`] }; });
  for (const great of [true, false]) addT(IQ, (R, lvl) => { const c = cOf(R, lvl); const s = great ? R.pick(['<', '≤']) : R.pick(['>', '≥']); const ans = s === '<' ? c - 1 : s === '>' ? c + 1 : c;
    return { q:`What is the ${great ? 'GREATEST' : 'LEAST'} integer that makes  x ${s} ${N(c)}  true?`, kind:'num', a:ans, model:iModel(c, s),
      hint:isOpen(s) ? `${N(c)} is not included (open circle). Take one step ${great ? 'left' : 'right'}.` : `${N(c)} is included (closed circle).`,
      steps:[isOpen(s) ? `${N(c)} ${s} ${N(c)} is false, so ${N(c)} does not count.` : `${N(c)} ${s} ${N(c)} is true, so ${N(c)} counts.`, `The ${great ? 'greatest' : 'least'} integer that works is ${N(ans)}.`] }; });
  const FLIP = { '>':'<', '<':'>', '≥':'≤', '≤':'≥' };
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const a = `x ${FLIP[s]} ${N(c)}`;
    return { q:`${N(c)} ${s} x  means the same as which inequality?`, kind:'choice', a, choices:SYMS.map(t => `x ${t} ${N(c)}`), hint:'Read it backward. If the number is greater than x, then x is less than the number.',
      steps:[`${N(c)} ${s} x says ${N(c)} is ${IW[s]} x.`, `Turn it around so x is first: the symbol flips to point the same way at the same number.`, `Answer: ${a}`] }; });
  const FIX = ['Use an open circle', 'Use a closed circle', 'Point the arrow the other way', 'Nothing. The graph is correct'];
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS), nm = R.pick(NAMES); const k = R.int(0, 2); let open = isOpen(s), right = isRight(s), a;
    if (k === 0){ open = !open; a = isOpen(s) ? FIX[0] : FIX[1]; } else if (k === 1){ right = !right; a = FIX[2]; } else a = FIX[3];
    return { q:`${nm} graphed  x ${s} ${N(c)}  like this. What should ${nm} fix?`, kind:'choice', a, choices:FIX.slice(), model:iModel(c, s, right ? 'right' : 'left', open), hint:IHINT,
      steps:[isOpen(s) ? `${s} does not include ${N(c)}: it needs an OPEN circle.` : `${s} includes ${N(c)}: it needs a CLOSED circle.`, `The arrow should point ${isRight(s) ? 'right' : 'left'}.`, `Answer: ${a}`] }; });
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const a = isOpen(s) ? 'No' : 'Yes';
    return { q:`Is ${N(c)} itself a solution of  x ${s} ${N(c)}?`, kind:'choice', a, choices:['Yes', 'No'], hint:'Does the symbol have the "or equal to" line under it?',
      steps:[`Check: ${N(c)} ${s} ${N(c)}?`, isOpen(s) ? `${N(c)} is not ${IW[s]} itself, so No.` : `${N(c)} is equal to itself, and ${s} allows equal. Yes!`] }; });
  addT(IQ, (R, lvl) => { const v = cOf(R, lvl); const T = [], F = []; for (let g = 0; g < 300 && (T.length < 1 || F.length < 3); g++){ const s = R.pick(SYMS), c = v + R.int(-4, 4); const t = `x ${s} ${N(c)}`;
      if (itest(s, v, c)){ if (T.length < 1) T.push(t); } else if (F.length < 3 && F.indexOf(t) < 0) F.push(t); }
    if (T.length < 1 || F.length < 3) return null;
    return { q:`Which inequality has ${N(v)} as a solution?`, kind:'choice', a:T[0], choices:[T[0], ...F], hint:`Put ${N(v)} in for x in each one. Which is true?`,
      steps:[`Test ${N(v)} in each inequality.`, `${T[0].replace('x', N(v))} is true.`, `Answer: ${T[0]}`] }; });
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const a = `x ${s} ${N(c)}`;
    return { q:`Which inequality says "x is ${IW[s]} ${N(c)}"?`, kind:'choice', a, choices:SYMS.map(t => `x ${t} ${N(c)}`), hint:'The open side of < or > faces the bigger number. A line underneath means "or equal to".',
      steps:[`"${IW[s]}" is ${s}.`, `Answer: ${a}`] }; });
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const yes = [], no = []; for (let x = c - 6; x <= c + 6; x++) (itest(s, x, c) ? yes : no).push(x);
    const a = N(R.pick(yes.filter(x => Math.abs(x - c) <= 5))); let oth = R.shuffle(no).filter(x => Math.abs(x - c) <= 5); if (isOpen(s)) oth = [c, ...oth.filter(x => x !== c)];
    return { q:'Which number is in the shaded part of the graph?', kind:'choice', a, choices:choose(a, oth.map(N)), model:iModel(c, s), hint:'The shaded part is the thick arrow. An open circle means its number is NOT shaded.',
      steps:[...graphSteps(c, s), `${a} is on the shaded part.`, `Answer: ${a}`] }; });
  addT(IQ, (R, lvl) => { const c = cOf(R, lvl), s = R.pick(SYMS); const a = isOpen(s) ? 'No' : 'Yes';
    return { q:`Look at the graph. Is ${N(c)} included in the solutions?`, kind:'choice', a, choices:['Yes', 'No'], model:iModel(c, s), hint:'Open circle = not included. Closed (filled) circle = included.',
      steps:[`The circle at ${N(c)} is ${isOpen(s) ? 'open' : 'closed'}.`, isOpen(s) ? `So ${N(c)} is NOT included. No.` : `So ${N(c)} IS included. Yes.`] }; });

  M['g5.ineq'] = { name:'Inequalities on a number line', unit:'g5u2', gen(R, lvl){ return run(R, lvl, IQ); } };
})();
