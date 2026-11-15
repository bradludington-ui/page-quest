// Page Quest math: grade 5 ADVANCED (FCPS) = Virginia Math 6 content.
// Procedural generators. Every answer is computed from the generated numbers.
(function(){
  const M = window.MathSkills = window.MathSkills || {};
  const MS = '−'; // real minus sign

  // ---------- helpers ----------
  function clean(n){ return Math.round(n * 1e6) / 1e6; }
  function N(n){ // number as text with a real minus sign and commas for big whole numbers
    n = clean(n);
    const neg = n < 0; let s = String(Math.abs(n));
    if (Number.isInteger(n) && Math.abs(n) >= 10000) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? MS : '') + s;
  }
  function P(n){ return n < 0 ? '(' + N(n) + ')' : N(n); } // negatives in parentheses
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ [a, b] = [b, a % b]; } return a || 1; }
  function frac(n, d){ const g = gcd(n, d); return (n / g) + '/' + (d / g); }
  function r2(x){ return Math.round(x * 100) / 100; }
  function choose(ans, cands){ const out = [ans]; for (const c of cands){ if (out.length >= 4) break; if (c != null && c !== '' && !out.includes(c)) out.push(c); } return out; }
  function sum(a){ return a.reduce((s, v) => s + v, 0); }
  const SUP = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
  function pw(b, e){ return (b < 0 ? '(' + N(b) + ')' : N(b)) + String(e).split('').map(c => SUP[c]).join(''); }
  const NAMES = ['Sam','Maya','Leo','Ava','Ben','Lily','Max','Emma','Noah','Mia'];
  function distinctInts(R, k, lo, hi){ const s = new Set(); let g = 0; while (s.size < k && g++ < 500) s.add(R.int(lo, hi)); return [...s]; }
  function dec(x){ return N(clean(x)); }

  // ======================= UNIT 1: DATA =======================
  const DATA_CTX = [
    { t:'Pages Lily read', col:'Pages', rows:'day' },
    { t:'Goals Max scored', col:'Goals', rows:'game' },
    { t:'Push-ups Ava did', col:'Push-ups', rows:'day' },
    { t:'Points Ben scored', col:'Points', rows:'game' },
    { t:'Minutes Noah practiced piano', col:'Minutes', rows:'day' },
    { t:'Books each friend read', col:'Books', rows:'friend' }
  ];
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  function rowLabel(kind, i){ return kind === 'day' ? DAYS[i] : kind === 'game' ? 'Game ' + (i + 1) : NAMES[i]; }
  function dataModel(ctx, vals){ return { type:'table', head:[ctx.rows === 'day' ? 'Day' : ctx.rows === 'game' ? 'Game' : 'Friend', ctx.col], rows: vals.map((v, i) => [rowLabel(ctx.rows, i), N(v)]) }; }
  function meanSet(R, n, lo, hi){
    for (let g = 0; g < 300; g++){
      const m = R.int(lo + 2, hi - 2); const v = [];
      for (let i = 0; i < n - 1; i++) v.push(R.int(lo, hi));
      const last = n * m - sum(v);
      if (last >= lo && last <= hi){ v.push(last); return R.shuffle(v); }
    }
    return Array(n).fill(lo + 2);
  }
  function medianOf(v){ const s = [...v].sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }

  M['g5.stats'] = { name:'Mean, median, mode & range', unit:'g5u1', gen(R, lvl){
    const ctx = R.pick(DATA_CTX);
    if (lvl === 3 && R.chance(0.6)){
      if (R.chance(0.5)){ // which measure stays the same
        const v = distinctInts(R, 5, 2, 20).sort((a, b) => a - b);
        const big = v[4] + R.int(10, 30); const nv = [...v.slice(0, 4), big];
        return { q:`Data: ${v.map(N).join(', ')}. The largest value, ${v[4]}, is changed to ${big}. Which measure stays the SAME?`, kind:'choice', a:'the median',
          choices:['the median','the mean','the range'], model:{ type:'table', head:['Before','After'], rows:v.map((x, i) => [N(x), N(nv[i])]) },
          hint:'Only the biggest number changed. Which measure only cares about the middle?',
          steps:[`The mean uses every number, so making ${v[4]} bigger raises the mean.`, `The range is largest − smallest, and the largest got bigger, so the range changes.`, `The middle number is still ${v[2]}, so the median stays the same.`, 'Answer: the median'] };
      }
      // missing value to make a target mean
      const n = R.int(4, 5); const v = meanSet(R, n, 3, 20); const m = sum(v) / n; const shown = v.slice(0, n - 1); const miss = v[n - 1];
      return { q:`${NAMES[R.int(0, 9)]} has the scores ${shown.map(N).join(', ')}. What must the next score be so the mean of all ${n} scores is ${m}?`, kind:'num', a:miss,
        hint:`If the mean is ${m} for ${n} scores, what must the TOTAL be?`,
        steps:[`Total needed = mean × number of scores = ${m} × ${n} = ${m * n}`, `Total so far: ${shown.map(N).join(' + ')} = ${sum(shown)}`, `Missing score = ${m * n} − ${sum(shown)} = ${miss}`, `The next score must be ${miss}.`] };
    }
    const n = lvl === 1 ? 5 : R.int(6, 7); const hi = lvl === 1 ? 20 : 40;
    const which = R.pick(['mean','median','mode','range']);
    let v, a, steps, hint;
    if (which === 'mean'){
      v = meanSet(R, n, 1, hi); a = sum(v) / n;
      hint = 'Add up all the values, then share the total equally: divide by how many values there are.';
      steps = [`Add all the values: ${v.map(N).join(' + ')} = ${sum(v)}`, `Count the values: there are ${n}.`, `Divide: ${sum(v)} ÷ ${n} = ${N(a)}`, `The mean is ${N(a)}.`];
    } else if (which === 'median'){
      v = distinctInts(R, n, 1, hi); a = medianOf(v); const s = [...v].sort((x, y) => x - y);
      hint = 'Put the numbers in order from least to greatest first. Then find the middle.';
      if (n % 2) steps = [`Put them in order: ${s.map(N).join(', ')}`, `Cross off one from each end until one is left in the middle.`, `The median is ${N(a)}.`];
      else steps = [`Put them in order: ${s.map(N).join(', ')}`, `There are ${n} values, so there are TWO middle values: ${s[n / 2 - 1]} and ${s[n / 2]}.`, `Find halfway between them: (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${N(a)}`, `The median is ${N(a)}.`];
    } else if (which === 'mode'){
      const base = distinctInts(R, n - 1, 1, hi); const m = R.pick(base); v = R.shuffle([...base, m]); a = m;
      hint = 'The mode is the value that shows up MOST often.';
      steps = [`Look for a value that appears more than once.`, `${m} appears 2 times. Every other value appears once.`, `The mode is ${m}.`];
    } else {
      v = distinctInts(R, n, 1, hi); const mx = Math.max(...v), mn = Math.min(...v); a = mx - mn;
      hint = 'Range = greatest value − least value.';
      steps = [`Greatest value: ${mx}. Least value: ${mn}.`, `Subtract: ${mx} − ${mn} = ${a}`, `The range is ${a}.`];
    }
    return { q:`${ctx.t} is shown in the table. What is the ${which}?`, kind:'num', a, model:dataModel(ctx, v), hint, steps };
  }};

  const STATQ_YES = ['How many hours do students in my class sleep each night?','How tall are the 5th graders at my school?','How many pets do families on my street have?','What is the favorite fruit of kids in our grade?','How many books did each student in my class read this month?','How long does it take students at my school to get to school?','How many minutes do kids on my team practice each week?'];
  const STATQ_NO = ['How tall is Mia?','How many days are in a week?',"What is my teacher's name?",'How many pets does Leo have?','What time does school start?','What is 8 × 7?',"What color is Ben's backpack?",'How many legs does a spider have?'];
  const SAMPLES = [
    { goal:"the favorite lunch of students at Maya's school", good:'Ask 60 students picked at random from every grade', bad:['Ask her 5 best friends','Ask only the kids on the soccer team','Ask only the 1st graders'] },
    { goal:'how many hours kids in her town read each week', good:'Ask 100 kids picked at random around town', bad:['Ask only kids at the library','Ask only her class','Ask kids in her book club'] },
    { goal:'the favorite sport of students at his school', good:'Ask every 10th student on the school list', bad:['Ask only the basketball team','Ask kids in the gym after PE','Ask his 3 cousins'] },
    { goal:'how students get to school (bus, car, walk, bike)', good:'Ask 50 students picked at random from all grades', bad:['Ask only kids waiting at the bus stop','Ask only kids at the bike rack','Ask only kids who live next door'] }
  ];
  const GRAPHS = [
    { d:'the temperature at noon each day for two weeks', a:'line graph', why:'It shows how something CHANGES OVER TIME, so a line graph fits.' },
    { d:'what percent of the class budget went to each thing', a:'circle graph', why:'It shows PARTS OF ONE WHOLE (percents), so a circle graph fits.' },
    { d:'the number of students who chose each favorite sport', a:'bar graph', why:'It COMPARES CATEGORIES (sports), so a bar graph fits.' },
    { d:'the number of pets each of 20 students has (0 to 5 pets)', a:'line plot', why:'It shows how often each SMALL NUMBER shows up, so a line plot (dot plot) fits.' },
    { d:'how much a puppy weighed each month for a year', a:'line graph', why:'It shows how something CHANGES OVER TIME, so a line graph fits.' },
    { d:'how a family spends each part of its day (sleep, school, play)', a:'circle graph', why:'It shows PARTS OF ONE WHOLE day, so a circle graph fits.' },
    { d:'the number of cans each class collected', a:'bar graph', why:'It COMPARES CATEGORIES (classes), so a bar graph fits.' },
    { d:'the ages of 25 people at a party, showing every exact value grouped by tens', a:'stem-and-leaf plot', why:'It shows every exact value, grouped by tens digit, so a stem-and-leaf plot fits.' }
  ];
  const GRAPH_NAMES = ['line graph','circle graph','bar graph','line plot','stem-and-leaf plot'];
  const CYCLE = ['Ask a question','Collect data','Organize and show the data','Analyze and share results'];

  M['g5.statq'] = { name:'Statistical questions, samples & graphs', unit:'g5u1', gen(R, lvl){
    const kind = lvl === 1 ? R.pick(['q','q','graph']) : lvl === 2 ? R.pick(['q','sample','graph']) : R.pick(['qnot','sample','graph','cycle']);
    if (kind === 'q'){
      const a = R.pick(STATQ_YES); const ds = R.shuffle(STATQ_NO).slice(0, 3);
      return { q:'Which one is a statistical question?', kind:'choice', a, choices:choose(a, ds),
        hint:'A statistical question has answers that VARY. You would need to collect lots of answers.',
        steps:['Ask: would different people give different answers?', 'Questions with one single answer are NOT statistical.', `This one has many different answers: "${a}"`] };
    }
    if (kind === 'qnot'){
      const a = R.pick(STATQ_NO); const ds = R.shuffle(STATQ_YES).slice(0, 3);
      return { q:'Which one is NOT a statistical question?', kind:'choice', a, choices:choose(a, ds),
        hint:'Look for the question that has just ONE answer.',
        steps:['A statistical question expects many different answers (variability).', 'Three of these need data from many people or things.', `This one has only one answer, so it is NOT statistical: "${a}"`] };
    }
    if (kind === 'sample'){
      const s = R.pick(SAMPLES); const who = R.pick(NAMES);
      return { q:`${who} wants to know ${s.goal}. Which sample is the BEST (most representative)?`, kind:'choice', a:s.good, choices:choose(s.good, s.bad),
        hint:'A good sample is random and includes all kinds of people in the group, not just one small part.',
        steps:['A representative sample looks like the whole group.', 'Picking only friends, one team, or one grade leaves people out (that is biased).', `Best sample: ${s.good}`] };
    }
    if (kind === 'cycle'){
      const i = R.int(0, 2); const a = CYCLE[i + 1];
      return { q:`In the data cycle, what comes right after "${CYCLE[i]}"?`, kind:'choice', a, choices:choose(a, CYCLE.filter(c => c !== CYCLE[i])),
        hint:'Think about the order: question, collect, organize, analyze.',
        steps:['The data cycle: 1) Ask a question  2) Collect data  3) Organize and show the data  4) Analyze and share results', `"${CYCLE[i]}" is step ${i + 1}.`, `Next is: ${a}`] };
    }
    const g = R.pick(GRAPHS); const ds = R.shuffle(GRAPH_NAMES.filter(x => x !== g.a)).slice(0, 3);
    return { q:`Which graph is BEST for showing ${g.d}?`, kind:'choice', a:g.a, choices:choose(g.a, ds),
      hint:'Over time → line graph. Parts of a whole → circle graph. Compare groups → bar graph. Counts of small numbers → line plot.',
      steps:[g.why, `Best choice: ${g.a}`] };
  }};

  // ======================= UNIT 2: INTEGERS & INEQUALITIES =======================
  function nlFor(vals, lo, hi, step, label){ return { type:'numberline', min:lo, max:hi, step, label, points: vals.map(x => ({ x, label:N(x) })) }; }

  M['g5.intcompare'] = { name:'Compare & order integers', unit:'g5u2', gen(R, lvl){
    if (lvl === 1){
      const a = R.int(-10, 10); const b = R.chance(0.1) ? a : R.int(-10, 10);
      const sym = a < b ? '<' : a > b ? '>' : '=';
      const where = a < b ? `${N(a)} is to the LEFT of ${N(b)}` : a > b ? `${N(a)} is to the RIGHT of ${N(b)}` : 'They are the same number';
      return { q:`Which symbol makes this true?   ${N(a)}  ☐  ${N(b)}`, kind:'choice', a:sym, choices:['<','>','='], model:nlFor(a === b ? [a] : [a, b], -10, 10, 1, 2),
        hint:'On a number line, numbers get bigger as you move RIGHT. Negative numbers are left of zero.',
        steps:['Find both numbers on the number line.', where + '.', `So ${N(a)} ${sym} ${N(b)}`] };
    }
    if (lvl === 2){
      const v = distinctInts(R, 4, -30, 30); const big = R.chance(0.5);
      const a = N(big ? Math.max(...v) : Math.min(...v));
      const abs = v.reduce((m, x) => Math.abs(x) > Math.abs(m) ? x : m, v[0]);
      const ds = v.map(N).filter(x => x !== a);
      return { q:`Which number is the ${big ? 'GREATEST' : 'LEAST'}?  ${v.map(N).join(',  ')}`, kind:'choice', a, choices:choose(a, [N(abs), ...ds]), model:nlFor(v, -30, 30, 5, 10),
        hint: big ? 'The greatest number is farthest to the RIGHT on the number line.' : 'The least number is farthest to the LEFT. A big negative is very small!',
        steps:['Picture the numbers on a number line.', big ? 'Look for the one farthest right.' : 'Look for the one farthest left.', `The ${big ? 'greatest' : 'least'} is ${a}.`] };
    }
    const v = R.shuffle([R.int(-50, -1), R.int(-50, -1), R.int(-50, 50), R.int(-50, 50)]);
    if (new Set(v).size < 4) return M['g5.intcompare'].gen(R, lvl);
    const s = [...v].sort((a, b) => a - b); const ans = s.map(N).join(', ');
    const byAbs = [...v].sort((a, b) => Math.abs(a) - Math.abs(b) || a - b).map(N).join(', ');
    const rev = [...s].reverse().map(N).join(', ');
    const negs = s.filter(x => x < 0).reverse(); const pos = s.filter(x => x >= 0);
    const negWrong = [...negs, ...pos].map(N).join(', ');
    const extra = R.shuffle([...v]).map(N).join(', ');
    return { q:`Order from LEAST to GREATEST:  ${v.map(N).join(',  ')}`, kind:'choice', a:ans, choices:choose(ans, [byAbs, negWrong, rev, [s[1], s[0], s[2], s[3]].map(N).join(', '), [s[0], s[2], s[1], s[3]].map(N).join(', '), extra]), model:nlFor(v, -50, 50, 10, 10),
      hint:'Negatives come first. The negative farthest from zero (like −40) is the SMALLEST.',
      steps:[`Negatives first, from farthest left: ${negs.slice().reverse().map(N).join(', ') || 'none'}`, `Then zero and positives, small to big: ${pos.map(N).join(', ') || 'none'}`, `Order: ${ans}`] };
  }};

  M['g5.absval'] = { name:'Absolute value & opposites', unit:'g5u2', gen(R, lvl){
    if (lvl === 1){
      const n = R.int(-20, 20) || -7;
      if (R.chance(0.5)) return { q:`What is |${N(n)}|?`, kind:'num', a:Math.abs(n), model:nlFor([n], -20, 20, 1, 5),
        hint:'Absolute value is the DISTANCE from zero. Distance is never negative.',
        steps:[`|${N(n)}| means: how far is ${N(n)} from 0?`, `Count the jumps from 0 to ${N(n)}: ${Math.abs(n)} units.`, `|${N(n)}| = ${Math.abs(n)}`] };
      return { q:`What is the opposite of ${N(n)}?`, kind:'num', a:-n, model:nlFor([n, -n].filter((x, i, a) => a.indexOf(x) === i), -20, 20, 1, 5),
        hint:'Opposites are the same distance from zero, on the other side.',
        steps:[`${N(n)} is ${Math.abs(n)} units ${n < 0 ? 'left' : 'right'} of 0.`, `Go the same distance on the other side of 0.`, `The opposite of ${N(n)} is ${N(-n)}.`] };
    }
    if (lvl === 2){
      const t = R.int(0, 3);
      if (t === 0){ const d = R.int(5, 25); return { q:`It is ${N(-d)}°F outside. How many degrees below zero is that?`, kind:'num', a:d, unit:'°F', model:nlFor([-d, 0], -30, 30, 5, 10),
        hint:'"How far from zero" is the absolute value.', steps:[`The temperature is ${N(-d)}°F.`, `Its distance from 0 is |${N(-d)}| = ${d}.`, `It is ${d} degrees below zero.`] }; }
      if (t === 1){ const d = R.int(10, 90); const w = R.pick(NAMES); return { q:`A submarine is at ${N(-d)} feet (below sea level). How many feet is it from sea level (0 ft)?`, kind:'num', a:d, unit:'ft',
        hint:'Sea level is 0. Find the distance from 0.', steps:[`Sea level is 0 feet.`, `Distance from 0 is |${N(-d)}| = ${d}.`, `The submarine is ${d} feet from sea level.`] }; }
      if (t === 2){ const d = R.int(5, 60); const nm = R.pick(NAMES); return { q:`${nm} owes $${d}, so the balance is −$${d}. What is the size of the debt in dollars?`.replace('−$', MS + '$'), kind:'num', a:d, unit:'$',
        hint:'The size of a debt is the absolute value of the balance.', steps:[`The balance is ${MS}$${d}.`, `The size of the debt is |${N(-d)}| = ${d}.`, `${nm} owes ${d} dollars.`] }; }
      const v = distinctInts(R, 4, -25, 25).filter(x => x !== 0); if (v.length < 3) return M['g5.absval'].gen(R, lvl);
      const absS = v.map(Math.abs); const mx = Math.max(...absS); if (absS.filter(x => x === mx).length > 1) return M['g5.absval'].gen(R, lvl);
      const a = N(v[absS.indexOf(mx)]); const big = N(Math.max(...v));
      return { q:`Which number is FARTHEST from zero?  ${v.map(N).join(',  ')}`, kind:'choice', a, choices:choose(a, [big, ...v.map(N)]), model:nlFor(v, -25, 25, 5, 5),
        hint:'Compare absolute values. Ignore the sign and look at the size.', steps:[`Absolute values: ${v.map(x => `|${N(x)}| = ${Math.abs(x)}`).join(', ')}`, `The biggest distance is ${mx}.`, `Farthest from zero: ${a}`] };
    }
    const t = R.int(0, 2);
    if (t === 0){ const a = R.int(-30, -1), b = R.int(-30, 30); const op = R.pick(['+','−']); const ans = op === '+' ? Math.abs(a) + Math.abs(b) : Math.abs(a) - Math.abs(b);
      return { q:`What is |${N(a)}| ${op} |${N(b)}|?`, kind:'num', a:ans, hint:'Find each absolute value first, then do the operation.',
        steps:[`|${N(a)}| = ${Math.abs(a)}`, `|${N(b)}| = ${Math.abs(b)}`, `${Math.abs(a)} ${op} ${Math.abs(b)} = ${N(ans)}`] }; }
    if (t === 1){ const d = R.int(5, 40), h = R.int(5, 60); const w = R.pick(NAMES);
      return { q:`A diver is at ${N(-d)} feet. A bird flies at ${h} feet above sea level, right above the diver. How far apart are they?`, kind:'num', a:d + h, unit:'ft', model:{ type:'numberline', min:-40, max:60, step:10, label:20, points:[{ x:-d, label:'diver' }, { x:0, label:'sea' }, { x:h, label:'bird' }] },
        hint:'They are on opposite sides of 0. Find each distance from 0, then add.', steps:[`Diver to sea level: |${N(-d)}| = ${d} ft`, `Sea level to bird: ${h} ft`, `Opposite sides, so add: ${d} + ${h} = ${d + h}`, `They are ${d + h} feet apart.`] }; }
    const k = R.int(3, 15); const a = `${k} and ${N(-k)}`;
    return { q:`Which pair of numbers BOTH have an absolute value of ${k}?`, kind:'choice', a, choices:choose(a, [`${k} and 0`, `${N(-k)} only`, `${2 * k} and ${N(-2 * k)}`]), model:nlFor([-k, k], -20, 20, 1, 5),
      hint:'Which numbers are exactly that many steps from 0? Look both ways!', steps:[`Absolute value ${k} means ${k} units from 0.`, `${k} units right of 0 is ${k}. ${k} units left of 0 is ${N(-k)}.`, `Both: ${a}`] };
  }};

  const INEQ_WORD = { '>':'greater than', '≥':'greater than or equal to', '<':'less than', '≤':'less than or equal to' };
  function ineqTest(sym, x, c){ return sym === '>' ? x > c : sym === '≥' ? x >= c : sym === '<' ? x < c : x <= c; }
  M['g5.ineq'] = { name:'Inequalities on a number line', unit:'g5u2', gen(R, lvl){
    const c = R.int(-8, 8); const sym = R.pick(['>','≥','<','≤']);
    const dir = (sym === '>' || sym === '≥') ? 'right' : 'left'; const open = (sym === '>' || sym === '<');
    const model = { type:'numberline', min:-10, max:10, step:1, label:2, points:[], ray:{ from:c, dir, open } };
    if (lvl === 1 || (lvl === 3 && R.chance(0.3))){
      const a = `x ${sym} ${N(c)}`;
      return { q:'Which inequality matches the graph?', kind:'choice', a, choices:['>','≥','<','≤'].map(s => `x ${s} ${N(c)}`), model,
        hint:'Open circle: the number is NOT included (> or <). Closed circle: it IS included (≥ or ≤). Arrow right = greater.',
        steps:[`The circle is at ${N(c)}.`, open ? 'The circle is OPEN, so ' + N(c) + ' is not included: use > or <.' : 'The circle is CLOSED (filled), so ' + N(c) + ' is included: use ≥ or ≤.', `The arrow points ${dir}, toward ${dir === 'right' ? 'greater' : 'smaller'} numbers.`, `Answer: ${a}`] };
    }
    if (lvl === 2 || R.chance(0.5)){
      const yes = []; const no = [];
      for (let x = c - 6; x <= c + 6; x++){ (ineqTest(sym, x, c) ? yes : no).push(x); }
      const ansN = R.pick(yes.filter(x => x !== c).length ? yes.filter(x => Math.abs(x - c) <= 4) : yes);
      const nos = R.shuffle(no); if (!open) {} else if (!nos.includes(c)) nos.unshift(c); else { nos.splice(nos.indexOf(c), 1); nos.unshift(c); }
      const a = N(ansN);
      return { q:`Which number is a solution of  x ${sym} ${N(c)}?`, kind:'choice', a, choices:choose(a, nos.map(N)), model,
        hint:`A solution makes the inequality TRUE. Is the number ${INEQ_WORD[sym]} ${N(c)}?`,
        steps:[`x ${sym} ${N(c)} means x is ${INEQ_WORD[sym]} ${N(c)}.`, `Check each choice on the number line: it must be in the shaded part.`, open ? `${N(c)} itself is NOT a solution (open circle).` : `${N(c)} itself IS a solution (closed circle).`, `${a} ${sym} ${N(c)} is true, so ${a} is a solution.`] };
    }
    const W = [
      { t:(k) => `You must be at least ${k} feet tall to ride.`, s:'≥', v:'h', k:R.int(3, 5) },
      { t:(k) => `A bag can hold no more than ${k} pounds.`, s:'≤', v:'w', k:R.int(10, 30) },
      { t:(k) => `The temperature stayed below ${N(k)}°F all night.`, s:'<', v:'t', k:R.int(-8, 5) },
      { t:(k) => `More than ${k} people came to the game.`, s:'>', v:'p', k:R.int(20, 90) },
      { t:(k) => `You need a score of at least ${k} to win.`, s:'≥', v:'s', k:R.int(50, 90) },
      { t:(k) => `The ocean floor here is deeper than ${N(k)} feet, so its elevation is less than that.`, s:'<', v:'e', k:-R.int(10, 50) }
    ];
    const w = R.pick(W); const a = `${w.v} ${w.s} ${N(w.k)}`;
    const key = { '≥':'"at least" means that number or more: ≥', '≤':'"no more than" means that number or less: ≤', '<':'"below / less than" means smaller, not equal: <', '>':'"more than" means bigger, not equal: >' };
    return { q:`${w.t(w.k)} Which inequality shows this?`, kind:'choice', a, choices:['>','≥','<','≤'].map(s => `${w.v} ${s} ${N(w.k)}`),
      hint:'Key words: "at least" ≥, "no more than" ≤, "more than" >, "less than / below" <.',
      steps:[key[w.s], `So the inequality is ${a}`] };
  }};

  // ======================= UNIT 3: RATIOS & RATIONAL NUMBERS =======================
  const RATIO_CTX = [['Cups of juice','Cups of water'],['Laps','Minutes'],['Red beads','Blue beads'],['Scoops of mix','Cups of milk'],['Teachers','Students']];
  M['g5.ratio'] = { name:'Ratios & unit rates', unit:'g5u3', gen(R, lvl){
    if (lvl === 1){
      const a = R.int(1, 5), b = R.int(2, 9); if (a === b) return M['g5.ratio'].gen(R, lvl);
      const ctx = R.pick(RATIO_CTX); const ks = [1, 2, 3, R.int(4, 6)]; const miss = R.int(1, 3); const col = R.int(0, 1);
      const rows = ks.map((k, i) => (i === miss ? (col === 0 ? ['?', N(b * k)] : [N(a * k), '?']) : [N(a * k), N(b * k)]));
      const ans = (col === 0 ? a : b) * ks[miss]; const other = (col === 0 ? b : a) * ks[miss];
      return { q:`The table shows equivalent ratios. What number goes where the ? is?`, kind:'num', a:ans, model:{ type:'table', head:ctx, rows },
        hint:`Look at the first row: ${a} to ${b}. How many times bigger is the row with the ? ?`,
        steps:[`The first row is ${a} : ${b}.`, `In the ? row, the known number is ${other}. ${other} ÷ ${col === 0 ? b : a} = ${ks[miss]}, so multiply by ${ks[miss]}.`, `${col === 0 ? a : b} × ${ks[miss]} = ${ans}`, `The missing number is ${ans}.`] };
    }
    if (lvl === 2){
      const t = R.int(0, 2); const nm = R.pick(NAMES);
      if (t === 0){ const n = R.int(3, 8), p = R.int(2, 9); const tot = n * p; return { q:`${nm} paid $${tot} for ${n} notebooks. Each costs the same. How much is ONE notebook?`, kind:'num', a:p, unit:'$', model:{ type:'table', head:['Notebooks','Cost ($)'], rows:[[N(n), N(tot)], ['1', '?']] },
        hint:'A unit rate is the amount for ONE. Divide the total by how many.', steps:[`Unit rate = total ÷ number of notebooks`, `${tot} ÷ ${n} = ${p}`, `One notebook costs $${p}.`] }; }
      if (t === 1){ const h = R.int(2, 6), r = R.int(10, 40); return { q:`${nm} read ${h * r} pages in ${h} hours at a steady pace. How many pages per hour is that?`, kind:'num', a:r, unit:'pages', model:{ type:'table', head:['Hours','Pages'], rows:[[N(h), N(h * r)], ['1', '?']] },
        hint:'"Per hour" means for ONE hour. Divide.', steps:[`Pages ÷ hours = pages per hour`, `${h * r} ÷ ${h} = ${r}`, `${r} pages per hour.`] }; }
      const r = R.int(3, 9), n1 = R.int(2, 5), n2 = R.int(6, 12); return { q:`A bike goes ${r * n1} miles in ${n1} hours. At the same rate, how far does it go in ${n2} hours?`, kind:'num', a:r * n2, unit:'miles', model:{ type:'table', head:['Hours','Miles'], rows:[[N(n1), N(r * n1)], ['1', '?'], [N(n2), '?']] },
        hint:'First find the miles in ONE hour. Then multiply.', steps:[`Miles in 1 hour: ${r * n1} ÷ ${n1} = ${r}`, `Miles in ${n2} hours: ${r} × ${n2} = ${r * n2}`, `It goes ${r * n2} miles.`] };
    }
    const a = R.int(1, 7), b = R.int(2, 9); if (a === b || gcd(a, b) > 1) return M['g5.ratio'].gen(R, lvl);
    const t = R.int(0, 2); const k = R.int(2, 8);
    if (t === 0) return { q:`The ratio of red marbles to blue marbles is ${a} : ${b}. There are ${b * k} blue marbles. How many red marbles are there?`, kind:'num', a:a * k, model:{ type:'table', head:['Red','Blue'], rows:[[N(a), N(b)], ['?', N(b * k)]] },
      hint:`How many groups of ${b} blue marbles are there?`, steps:[`Each group has ${a} red and ${b} blue.`, `${b * k} ÷ ${b} = ${k} groups.`, `Red: ${a} × ${k} = ${a * k}`, `There are ${a * k} red marbles.`] };
    if (t === 1) return { q:`In a class, the ratio of boys to girls is ${a} : ${b}. There are ${(a + b) * k} students in all. How many girls are there?`, kind:'num', a:b * k, model:{ type:'table', head:['Boys','Girls','Total'], rows:[[N(a), N(b), N(a + b)], ['?', '?', N((a + b) * k)]] },
      hint:`One "group" has ${a} boys and ${b} girls, so ${a + b} students. How many groups make the class?`, steps:[`One group: ${a} + ${b} = ${a + b} students.`, `Groups: ${(a + b) * k} ÷ ${a + b} = ${k}`, `Girls: ${b} × ${k} = ${b * k}`, `There are ${b * k} girls.`] };
    const ans = `${a}/${a + b}`;
    return { q:`The ratio of cats to dogs at a shelter is ${a} : ${b}. What fraction of all the cats and dogs are cats?`, kind:'choice', a:ans, choices:choose(ans, [`${a}/${b}`, `${b}/${a + b}`, `${b}/${a}`]),
      hint:'This is part-to-WHOLE. The whole is cats + dogs.', steps:[`Cats : dogs is part to part: ${a} : ${b}.`, `The whole is ${a} + ${b} = ${a + b}.`, `Cats out of the whole: ${ans}`] };
  }};

  const FDP_DEN = [2, 4, 5, 10, 20, 25, 50];
  M['g5.fdp'] = { name:'Fractions, decimals & percents', unit:'g5u3', warm:true, gen(R, lvl){
    if (lvl === 1){
      const t = R.int(0, 2);
      if (t === 0){ const d = R.pick(FDP_DEN); const n = R.int(1, d - 1); const p = n * 100 / d;
        return { q:`Write ${n}/${d} as a percent.`, kind:'num', a:p, unit:'%', model: d <= 10 ? { type:'fraction', parts:d, shaded:n, shape:'bar' } : undefined,
          hint:'Percent means "out of 100". Make an equivalent fraction with 100 on the bottom.',
          steps:[`${100 / d} × ${d} = 100, so multiply top and bottom by ${100 / d}.`, `${n}/${d} = ${p}/100`, `${p}/100 = ${p}%`] }; }
      if (t === 1){ const p = R.int(1, 99); return { q:`Write ${dec(p / 100)} as a percent.`, kind:'num', a:p, unit:'%',
        hint:'Multiply by 100: move the decimal point 2 places to the right.', steps:[`${dec(p / 100)} = ${p} hundredths`, `${dec(p / 100)} × 100 = ${p}`, `${dec(p / 100)} = ${p}%`] }; }
      const p = R.int(1, 99); return { q:`Write ${p}% as a decimal.`, kind:'num', a:clean(p / 100),
        hint:'Divide by 100: move the decimal point 2 places to the left.', steps:[`${p}% means ${p} out of 100.`, `${p} ÷ 100 = ${dec(p / 100)}`, `${p}% = ${dec(p / 100)}`] };
    }
    if (lvl === 2){
      const t = R.int(0, 2);
      if (t === 0){ const p = R.pick([5,10,12,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95]); const ans = frac(p, 100); const g = gcd(p, 100);
        return { q:`Write ${p}% as a fraction in simplest form.`, kind:'choice', a:ans, choices:choose(ans, [`${p}/10`, `${p}/100`, frac(100 - p, 100), `1/${p}`]),
          hint:'Write it over 100, then divide the top and bottom by the same number.', steps:[`${p}% = ${p}/100`, `Divide top and bottom by ${g}: ${p} ÷ ${g} = ${p / g}, 100 ÷ ${g} = ${100 / g}`, `Simplest form: ${ans}`] }; }
      if (t === 1){ const d = R.pick([2, 4, 5, 8, 10, 20, 25]); const n = R.int(1, d - 1); const v = n / d;
        return { q:`Write ${n}/${d} as a decimal.`, kind:'num', a:clean(v),
          hint:'A fraction means divide: top ÷ bottom.', steps:[`${n}/${d} means ${n} ÷ ${d}.`, `${n} ÷ ${d} = ${dec(v)}`, `${n}/${d} = ${dec(v)}`] }; }
      const d = R.pick([10, 100]); const n = R.int(1, d - 1); const v = n / d; const ans = frac(n, d);
      return { q:`Write ${dec(v)} as a fraction in simplest form.`, kind:'choice', a:ans, choices:choose(ans, [`${n}/${d === 10 ? 100 : 10}`, `${n}/${d}`, `1/${n}`, frac(d - n, d)]),
        hint:`Read the decimal in place value: tenths or hundredths. Then simplify.`, steps:[`${dec(v)} is ${n} ${d === 10 ? 'tenths' : 'hundredths'} = ${n}/${d}`, gcd(n, d) > 1 ? `Divide top and bottom by ${gcd(n, d)}.` : 'It is already simplest.', `${dec(v)} = ${ans}`] };
    }
    const t = R.int(0, 2);
    if (t === 0){ const p = R.pick([10, 20, 25, 50, 75, 30, 40, 60, 5]); const base = 100 / gcd(p, 100); const n = base * R.int(1, 8); const ans = p * n / 100;
      return { q:`What is ${p}% of ${n}?`, kind:'num', a:ans,
        hint:`Turn ${p}% into a fraction or decimal, then multiply.`, steps:[`${p}% = ${frac(p, 100)}`, `${frac(p, 100)} of ${n}: ${n} ÷ ${100 / gcd(p, 100)} × ${p / gcd(p, 100)}`, `= ${N(ans)}`, `${p}% of ${n} is ${N(ans)}.`] }; }
    if (t === 1){ const d = R.pick([10, 20, 25, 50]); const n = R.int(1, d); const nm = R.pick(NAMES); const p = n * 100 / d;
      return { q:`${nm} got ${n} out of ${d} questions right on a quiz. What percent is that?`, kind:'num', a:p, unit:'%',
        hint:'Write it as a fraction, then make the bottom 100.', steps:[`${n} out of ${d} = ${n}/${d}`, `Multiply top and bottom by ${100 / d}: ${p}/100`, `That is ${p}%.`] }; }
    const d = R.pick([2, 4, 5, 8]); let n = R.int(d + 1, 3 * d - 1); while (gcd(n, d) > 1) n++; const p = n * 100 / d;
    return { q:`Write ${n}/${d} as a percent. (Hint: it is more than 1 whole!)`, kind:'num', a:clean(p), unit:'%',
      hint:'1 whole = 100%. A fraction bigger than 1 is more than 100%.', steps:[`${n}/${d} = ${n} ÷ ${d} = ${dec(n / d)}`, `Multiply by 100: ${dec(n / d)} × 100 = ${N(clean(p))}`, `${n}/${d} = ${N(clean(p))}%`] };
  }};

  function asForm(R, p, form){ // p = percent value
    if (form === 'p') return N(p) + '%';
    if (form === 'd') return dec(p / 100);
    return frac(p, 100);
  }
  M['g5.order'] = { name:'Order fractions, decimals & percents', unit:'g5u3', gen(R, lvl){
    const k = lvl === 1 ? 3 : 4;
    const pool = lvl === 1 ? [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90] : lvl === 2 ? [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95] : [5, 12.5, 20, 25, 37.5, 40, 45, 60, 62.5, 75, 80, 87.5, 110, 120, 125, 150];
    const ps = R.shuffle(pool).slice(0, k);
    const forms = R.shuffle(lvl === 1 ? ['f', 'd', 'p'] : ['f', 'd', 'p', R.pick(['f', 'd', 'p'])]);
    const items = ps.map((p, i) => ({ p, s:asForm(R, p, forms[i]) }));
    if (lvl === 1 && R.chance(0.5)){
      const big = R.chance(0.5); const best = items.reduce((m, x) => (big ? x.p > m.p : x.p < m.p) ? x : m);
      return { q:`Which is ${big ? 'GREATEST' : 'LEAST'}?  ${items.map(x => x.s).join(',   ')}`, kind:'choice', a:best.s, choices:items.map(x => x.s),
        hint:'Change them all to the same form. Percents are easy to compare!',
        steps:[...items.map(x => `${x.s} = ${N(x.p)}%`).slice(0, 3), `The ${big ? 'greatest' : 'least'} is ${best.s}.`] };
    }
    const asc = [...items].sort((a, b) => a.p - b.p).map(x => x.s).join(', ');
    const byText = [...items].sort((a, b) => parseFloat(a.s) - parseFloat(b.s) || a.s.localeCompare(b.s)).map(x => x.s).join(', ');
    const rev = [...items].sort((a, b) => b.p - a.p).map(x => x.s).join(', ');
    const sw = [...items].sort((a, b) => a.p - b.p); [sw[0], sw[1]] = [sw[1], sw[0]];
    const steps = [`Change each to a percent: ${items.map(x => `${x.s} = ${N(x.p)}%`).join(', ')}`, `Order the percents: ${[...items].sort((a, b) => a.p - b.p).map(x => N(x.p) + '%').join(', ')}`, `Least to greatest: ${asc}`];
    return { q:`Which list is in order from LEAST to GREATEST?`, kind:'choice', a:asc, choices:choose(asc, [byText, rev, sw.map(x => x.s).join(', '), R.shuffle(items).map(x => x.s).join(', ')]),
      hint:'Change every number to a percent (or a decimal) so they all look alike. Then compare.', steps };
  }};

  // ======================= UNIT 4: COORDINATE PLANE & CONGRUENCE =======================
  function quadOf(x, y){ if (x === 0 && y === 0) return 'origin'; if (y === 0) return 'x-axis'; if (x === 0) return 'y-axis'; return x > 0 ? (y > 0 ? 'Quadrant I' : 'Quadrant IV') : (y > 0 ? 'Quadrant II' : 'Quadrant III'); }
  const QUADS = ['Quadrant I','Quadrant II','Quadrant III','Quadrant IV'];
  function lr(x){ return x > 0 ? `${x} right` : x < 0 ? `${-x} left` : 'no move left or right'; }
  function ud(y){ return y > 0 ? `${y} up` : y < 0 ? `${-y} down` : 'no move up or down'; }
  function quadSteps(x, y, a){
    return [`x = ${N(x)}: ${x > 0 ? 'positive, go RIGHT' : x < 0 ? 'negative, go LEFT' : 'zero, stay on the y-axis'}.`, `y = ${N(y)}: ${y > 0 ? 'positive, go UP' : y < 0 ? 'negative, go DOWN' : 'zero, stay on the x-axis'}.`, 'Quadrants: I (+,+), II (−,+), III (−,−), IV (+,−).', `(${N(x)}, ${N(y)}) is on/in: ${a}`];
  }
  M['g5.quadrant'] = { name:'Quadrants & axes', unit:'g5u4', gen(R, lvl){
    const nz = (a, b) => { let v = 0; while (v === 0) v = R.int(a, b); return v; };
    if (lvl === 1){ const x = nz(-8, 8), y = nz(-8, 8); const a = quadOf(x, y);
      return { q:`Point A is shown. Which quadrant is it in?`, kind:'choice', a, choices:QUADS, model:{ type:'grid', range:10, points:[{ x, y, label:'A' }] },
        hint:'Start at the middle. Is A left or right? Up or down?', steps:quadSteps(x, y, a) }; }
    if (lvl === 2){
      let x = nz(-12, 12), y = nz(-12, 12); if (R.chance(0.25)){ if (R.chance(0.5)) x = 0; else y = 0; }
      const a = quadOf(x, y);
      const cands = a.includes('axis') ? ['x-axis', 'y-axis', ...R.shuffle(QUADS)] : [quadOf(-x, y), quadOf(x, -y), quadOf(-x, -y), 'x-axis'];
      return { q:`Where is the point (${N(x)}, ${N(y)})?`, kind:'choice', a, choices:choose(a, cands),
        hint:'Look at the SIGNS. If one number is 0, the point sits on an axis.', steps:quadSteps(x, y, a) };
    }
    const x = nz(-9, 9), y = nz(-9, 9); const axis = R.pick(['x-axis', 'y-axis']);
    const nx = axis === 'y-axis' ? -x : x, ny = axis === 'x-axis' ? -y : y; const a = quadOf(nx, ny);
    return { q:`The point (${N(x)}, ${N(y)}) is reflected across the ${axis}. Which quadrant is the new point in?`, kind:'choice', a, choices:QUADS, model:{ type:'grid', range:10, points:[{ x, y, label:'P' }] },
      hint:`Reflecting across the ${axis} flips the sign of ${axis === 'x-axis' ? 'y' : 'x'} only.`,
      steps:[`Across the ${axis}: change the sign of ${axis === 'x-axis' ? 'y' : 'x'}.`, `(${N(x)}, ${N(y)}) → (${N(nx)}, ${N(ny)})`, `Signs (${nx > 0 ? '+' : '−'}, ${ny > 0 ? '+' : '−'}): ${a}`] };
  }};

  M['g5.plot'] = { name:'Plot ordered pairs', unit:'g5u4', gen(R, lvl){
    const rg = lvl === 1 ? 6 : lvl === 2 ? 8 : 10;
    if (lvl === 3 && R.chance(0.6)){
      const x = R.int(-6, 6), y = R.int(-6, 6); const dx = R.pick([-4, -3, -2, 2, 3, 4]), dy = R.pick([-4, -3, -2, 2, 3, 4]);
      const nx = x + dx, ny = y + dy;
      return { q:`Point P is at (${N(x)}, ${N(y)}). Plot the point that is ${lr(dx)} and ${ud(dy)} from P.`, kind:'plot', a:[nx, ny], model:{ type:'grid', range:rg, points:[{ x, y, label:'P' }] },
        hint:'Left/right changes x. Up/down changes y.', steps:[`Left/right changes x: ${N(x)} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)} = ${N(nx)}`, `Up/down changes y: ${N(y)} ${dy > 0 ? '+' : '−'} ${Math.abs(dy)} = ${N(ny)}`, `Plot (${N(nx)}, ${N(ny)}).`] };
    }
    const x = R.int(-rg, rg), y = R.int(-rg, rg);
    return { q:`Tap to plot the point (${N(x)}, ${N(y)}).`, kind:'plot', a:[x, y], model:{ type:'grid', range:rg, points:[] },
      hint:'Start at the origin (0, 0). Move left/right for x FIRST, then up/down for y.',
      steps:['Start at the origin (0, 0).', `x = ${N(x)}: move ${lr(x)}.`, `y = ${N(y)}: move ${ud(y)}.`, `Plot (${N(x)}, ${N(y)}).`] };
  }};

  function distSteps(c1, c2, axisName){
    const same = (c1 >= 0 && c2 >= 0) || (c1 <= 0 && c2 <= 0); const d = Math.abs(c1 - c2);
    if (same) return [`The ${axisName === 'x' ? 'y' : 'x'}-coordinates match, so count along the ${axisName}-direction.`, `Both ${axisName}'s are on the same side of 0: subtract |${N(c1)}| and |${N(c2)}|.`, `${Math.max(Math.abs(c1), Math.abs(c2))} − ${Math.min(Math.abs(c1), Math.abs(c2))} = ${d}`, `So the distance is ${d}.`];
    return [`The ${axisName === 'x' ? 'y' : 'x'}-coordinates match, so count along the ${axisName}-direction.`, `The ${axisName}'s are on opposite sides of 0: ADD their absolute values.`, `|${N(c1)}| + |${N(c2)}| = ${Math.abs(c1)} + ${Math.abs(c2)} = ${d}`, `So the distance is ${d}.`];
  }
  M['g5.distance'] = { name:'Distance on the coordinate plane', unit:'g5u4', gen(R, lvl){
    const horiz = R.chance(0.5);
    let c1, c2;
    if (lvl === 1){ const s = R.pick([1, -1]); c1 = s * R.int(1, 9); c2 = s * R.int(1, 9); if (c1 === c2) c2 = s * (Math.abs(c1) === 9 ? 2 : Math.abs(c1) + 1); }
    else { c1 = -R.int(1, 9); c2 = R.int(1, 9); if (R.chance(0.5)) [c1, c2] = [c2, c1]; }
    const k = R.int(-9, 9);
    if (lvl === 3 && R.chance(0.5)){
      const x1 = -R.int(1, 8), x2 = R.int(1, 8), y1 = -R.int(1, 8), y2 = R.int(1, 8); const w = x2 - x1, h = y2 - y1;
      return { q:`A rectangle has corners at (${N(x1)}, ${N(y1)}), (${N(x2)}, ${N(y1)}), (${N(x2)}, ${N(y2)}) and (${N(x1)}, ${N(y2)}). What is its perimeter?`, kind:'num', a:2 * (w + h), unit:'units',
        model:{ type:'grid', range:10, points:[], segs:[[x1, y1, x2, y1], [x2, y1, x2, y2], [x2, y2, x1, y2], [x1, y2, x1, y1]] },
        hint:'Find the length of the bottom side and one tall side. Then add all four sides.',
        steps:[`Bottom side: x goes from ${N(x1)} to ${N(x2)}: ${Math.abs(x1)} + ${x2} = ${w} units.`, `Tall side: y goes from ${N(y1)} to ${N(y2)}: ${Math.abs(y1)} + ${y2} = ${h} units.`, `Perimeter = ${w} + ${h} + ${w} + ${h} = ${2 * (w + h)}`, `The perimeter is ${2 * (w + h)} units.`] };
    }
    const A = horiz ? [c1, k] : [k, c1], B = horiz ? [c2, k] : [k, c2];
    const d = Math.abs(c1 - c2);
    const pre = lvl === 3 ? `On a town map, the school is at (${N(A[0])}, ${N(A[1])}) and the park is at (${N(B[0])}, ${N(B[1])}). Each unit is 1 block. How many blocks apart are they?` : `What is the distance between A(${N(A[0])}, ${N(A[1])}) and B(${N(B[0])}, ${N(B[1])})?`;
    return { q:pre, kind:'num', a:d, unit: lvl === 3 ? 'blocks' : 'units', model:{ type:'grid', range:10, points:[{ x:A[0], y:A[1], label:'A' }, { x:B[0], y:B[1], label:'B' }], segs:[[A[0], A[1], B[0], B[1]]] },
      hint:'The points share a coordinate, so the segment is straight. Count the units, or use absolute value.',
      steps:distSteps(c1, c2, horiz ? 'x' : 'y') };
  }};

  M['g5.congruent'] = { name:'Congruent segments & polygons', unit:'g5u4', gen(R, lvl){
    if (lvl <= 2){
      const L = R.int(2, 7); const lens = R.shuffle([L, L + 1, L === 2 ? L + 2 : L - 1]); const names = ['CD','EF','GH'];
      const points = [], segs = [];
      const ax = -8; const ay = lvl === 1 ? 8 : 6;
      segs.push([ax, ay, ax + L, ay]); points.push({ x:ax, y:ay, label:'A' }, { x:ax + L, y:ay, label:'B' });
      lens.forEach((len, i) => {
        const p1 = names[i][0], p2 = names[i][1];
        if (lvl === 1){ const y = 4 - 4 * i; const x0 = R.int(-8, 8 - len); segs.push([x0, y, x0 + len, y]); points.push({ x:x0, y, label:p1 }, { x:x0 + len, y, label:p2 }); }
        else { const x = -6 + 6 * i; const y0 = -9; segs.push([x, y0, x, y0 + len]); points.push({ x, y:y0, label:p1 }, { x, y:y0 + len, label:p2 }); }
      });
      const a = names[lens.indexOf(L)];
      return { q:`Which segment is congruent to segment AB?`, kind:'choice', a, choices:names, model:{ type:'grid', range:10, points, segs },
        hint:'Congruent segments have the SAME length. Count the units on each one.',
        steps:[`Count AB: from x = ${N(ax)} to x = ${N(ax + L)} is ${L} units.`, `Count the others: ${names.map((n, i) => `${n} = ${lens[i]}`).join(', ')}.`, `Same length as AB: ${a}`] };
    }
    if (R.chance(0.5)){
      const w = R.int(3, 9), h = R.int(2, 9); if (w === h) return M['g5.congruent'].gen(R, lvl);
      const a = `${h} cm by ${w} cm`;
      return { q:`Rectangle ABCD is ${w} cm by ${h} cm. Which rectangle is congruent to it?`, kind:'choice', a, choices:choose(a, [`${2 * w} cm by ${2 * h} cm`, `${w} cm by ${h + 1} cm`, `${w + 1} cm by ${h - 1} cm`]), model:{ type:'rect', w, h, unit:'cm' },
        hint:'Congruent means same size AND same shape. Turning a shape does not change its size.',
        steps:['Congruent shapes match side for side.', `${h} by ${w} is the same rectangle, just turned.`, `${2 * w} by ${2 * h} has the same shape but is bigger, so it is NOT congruent.`, `Answer: ${a}`] };
    }
    const s = distinctInts(R, 3, 4, 12).sort((x, y) => x - y); if (s[0] + s[1] <= s[2]) return M['g5.congruent'].gen(R, lvl);
    const a = R.shuffle([...s]).map(v => v + ' in').join(', ');
    return { q:`Triangle ABC has sides ${s.join(' in, ')} in. Which triangle is congruent to it?`, kind:'choice', a,
      choices:choose(a, [s.map(v => 2 * v + ' in').join(', '), [s[0], s[1], s[2] + 1].map(v => v + ' in').join(', '), [s[0], s[0], s[2]].map(v => v + ' in').join(', ')]), model:{ type:'polygon', shape:'triangle' },
      hint:'Look for the SAME three side lengths. They can be listed in any order.',
      steps:[`ABC's sides: ${s.join(', ')}.`, 'A congruent triangle has exactly these three lengths (any order). Doubled sides make a bigger triangle, not a congruent one.', `Answer: ${a}`] };
  }};

  // ======================= UNIT 5: INTEGER COMPUTATION =======================
  function addSteps(a, b){ // a + b
    const r = a + b;
    if (a === 0 || b === 0) return [`Adding 0 changes nothing.`, `${N(a)} + ${P(b)} = ${N(r)}`];
    if ((a > 0) === (b > 0)) return [`Same signs: add the sizes. ${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(a) + Math.abs(b)}`, `Keep the sign: both are ${a > 0 ? 'positive' : 'negative'}.`, `${N(a)} + ${P(b)} = ${N(r)}`];
    const big = Math.abs(a) >= Math.abs(b) ? a : b;
    return [`Different signs: subtract the sizes. ${Math.max(Math.abs(a), Math.abs(b))} − ${Math.min(Math.abs(a), Math.abs(b))} = ${Math.abs(r)}`, r === 0 ? 'They cancel out to 0.' : `Keep the sign of the number farther from 0 (${N(big)}): ${r > 0 ? 'positive' : 'negative'}.`, `${N(a)} + ${P(b)} = ${N(r)}`];
  }
  function mulSign(a, b, op, r){
    return [`${op === '×' ? 'Multiply' : 'Divide'} the sizes: ${Math.abs(a)} ${op} ${Math.abs(b)} = ${Math.abs(r)}`, r === 0 ? 'Zero has no sign.' : ((a < 0) === (b < 0) ? 'Same signs → the answer is POSITIVE.' : 'Different signs → the answer is NEGATIVE.'), `${N(a)} ${op} ${P(b)} = ${N(r)}`];
  }
  function oneOp(R, lim, mlim){
    const op = R.pick(['+', '−', '×', '÷']); let a, b, r, steps, hint, model;
    if (op === '+'){ a = R.int(-lim, lim); b = R.int(-lim, lim); r = a + b; steps = addSteps(a, b); hint = 'Same signs: add and keep the sign. Different signs: subtract and keep the sign of the bigger size.'; }
    else if (op === '−'){ a = R.int(-lim, lim); b = R.int(-lim, lim); r = a - b; steps = [`Subtracting is adding the opposite: ${N(a)} − ${P(b)} = ${N(a)} + ${P(-b)}`, ...addSteps(a, -b).slice(0, -1), `${N(a)} − ${P(b)} = ${N(r)}`]; hint = 'Change subtraction to adding the opposite: keep, change, change.'; }
    else if (op === '×'){ a = R.int(-mlim, mlim); b = R.int(-mlim, mlim); r = a * b; steps = mulSign(a, b, '×', r); hint = 'Multiply like normal. Same signs → positive. Different signs → negative.'; }
    else { b = R.int(1, mlim) * R.pick([1, -1]); r = R.int(-mlim, mlim); a = b * r; steps = mulSign(a, b, '÷', r); hint = 'Divide like normal. Same signs → positive. Different signs → negative.'; }
    if ((op === '+' || op === '−') && Math.abs(a) <= 20 && Math.abs(r) <= 20) model = { type:'numberline', min:-20, max:20, step:1, label:5, points:[{ x:a, label:'start' }] };
    return { q:`${N(a)} ${op} ${P(b)} = ?`, kind:'num', a:r, hint, steps, model };
  }
  M['g5.intops'] = { name:'Add, subtract, multiply & divide integers', unit:'g5u5', warm:true, gen(R, lvl){
    if (lvl === 1) return oneOp(R, 10, 6);
    if (lvl === 2) return oneOp(R, 25, 12);
    const t = R.int(0, 3);
    if (t === 0) return oneOp(R, 50, 12);
    if (t === 1){ const a = R.int(-15, 15), b = R.int(-15, 15), c = R.int(-15, 15); const s1 = a + b, r = s1 - c;
      return { q:`${N(a)} + ${P(b)} − ${P(c)} = ?`, kind:'num', a:r, hint:'Work left to right. Turn the subtraction into adding the opposite.',
        steps:[`Left to right. First: ${N(a)} + ${P(b)} = ${N(s1)}`, `Next: ${N(s1)} − ${P(c)} = ${N(s1)} + ${P(-c)}`, `${N(s1)} + ${P(-c)} = ${N(r)}`, `Answer: ${N(r)}`] }; }
    const nm = R.pick(NAMES);
    if (t === 2){ const st = R.int(-12, 5), up = R.int(4, 15); const r = st + up;
      return { q:`At 6 a.m. it was ${N(st)}°F. By noon the temperature rose ${up} degrees. What was the temperature at noon?`, kind:'num', a:r, unit:'°F', model:{ type:'numberline', min:-20, max:20, step:1, label:5, points:[{ x:st, label:'6 a.m.' }] },
        hint:'"Rose" means add. Start at the 6 a.m. temperature and move right.', steps:[`Rose means add: ${N(st)} + ${up}`, ...addSteps(st, up).slice(0, -1), `${N(st)} + ${up} = ${N(r)}`, `It was ${N(r)}°F at noon.`] }; }
    const d = R.int(2, 6), h = R.int(3, 8); const r = -d * h;
    return { q:`The temperature dropped ${d} degrees every hour for ${h} hours. What was the total change in temperature? (Use a negative number for a drop.)`, kind:'num', a:r, unit:'°',
      hint:'A drop each hour is a negative number. Multiply it by the number of hours.', steps:[`A drop of ${d} each hour is ${N(-d)}.`, `${h} hours: ${h} × ${P(-d)}`, `Different signs → negative: ${h} × ${d} = ${d * h}, so ${N(r)}`, `The total change was ${N(r)}°.`] };
  }};

  M['g5.orderops'] = { name:'Order of operations', unit:'g5u5', gen(R, lvl){
    const hint = 'Please Excuse My Dear Aunt Sally: Parentheses, Exponents, then × and ÷ (left to right), then + and − (left to right).';
    const T = [];
    if (lvl === 1){
      T.push(() => { const a = R.int(2, 20), b = R.int(2, 9), c = R.int(2, 9); const p = b * c, r = a + p; return [`${a} + ${b} × ${c}`, r, [`No parentheses or exponents. Multiply first: ${b} × ${c} = ${p}`, `Then add: ${a} + ${p} = ${r}`, `Answer: ${r}`]]; });
      T.push(() => { const a = R.int(2, 12), b = R.int(2, 12), c = R.int(2, 6); const s = a + b, r = s * c; return [`(${a} + ${b}) × ${c}`, r, [`Parentheses first: ${a} + ${b} = ${s}`, `Then multiply: ${s} × ${c} = ${r}`, `Answer: ${r}`]]; });
      T.push(() => { const d = R.int(2, 9), q = R.int(2, 9), c = d * q, a = R.int(q + 1, 30); const r = a - q; return [`${a} − ${c} ÷ ${d}`, r, [`Divide first: ${c} ÷ ${d} = ${q}`, `Then subtract: ${a} − ${q} = ${r}`, `Answer: ${r}`]]; });
      T.push(() => { const a = R.int(2, 9), b = R.int(2, 9), d = R.int(2, 6), q = R.int(1, 5), c = d * q; const p = a * b, r = p - q; return [`${a} × ${b} − ${c} ÷ ${d}`, r, [`Multiply: ${a} × ${b} = ${p}`, `Divide: ${c} ÷ ${d} = ${q}`, `Subtract: ${p} − ${q} = ${r}`, `Answer: ${r}`]]; });
    } else if (lvl === 2){
      T.push(() => { const a = R.int(1, 20), b = R.int(2, 6), c = R.int(2, 5); const s = b * b, p = s * c, r = a + p; return [`${a} + ${pw(b, 2)} × ${c}`, r, [`Exponent first: ${pw(b, 2)} = ${b} × ${b} = ${s}`, `Multiply: ${s} × ${c} = ${p}`, `Add: ${a} + ${p} = ${r}`, `Answer: ${r}`]]; });
      T.push(() => { const a = R.int(1, 6), b = R.int(1, 6), c = R.int(1, 20); const s = a + b, e = s * s, r = e - c; return [`(${a} + ${b})${SUP['2']} − ${c}`, r, [`Parentheses first: ${a} + ${b} = ${s}`, `Exponent: ${pw(s, 2)} = ${e}`, `Subtract: ${e} − ${c} = ${r}`, `Answer: ${r}`]]; });
      T.push(() => { const b = R.pick([2, 3, 4, 6, 8, 9]); const a = b * R.int(1, 2) * R.pick([1, 2]); const e = a * a; if (e % b) return null; const q = e / b, c = R.int(1, 15), r = q + c; return [`${pw(a, 2)} ÷ ${b} + ${c}`, r, [`Exponent first: ${pw(a, 2)} = ${e}`, `Divide: ${e} ÷ ${b} = ${q}`, `Add: ${q} + ${c} = ${r}`, `Answer: ${r}`]]; });
      T.push(() => { const a = R.int(2, 6), b = R.int(2, 9), c = R.int(1, 9), d = R.int(1, 3); const s = b + c, p = a * s, e = Math.pow(2, d), r = p - e; return [`${a} × (${b} + ${c}) − ${pw(2, d)}`, r, [`Parentheses: ${b} + ${c} = ${s}`, `Exponent: ${pw(2, d)} = ${e}`, `Multiply: ${a} × ${s} = ${p}`, `Subtract: ${p} − ${e} = ${r}`, `Answer: ${r}`]]; });
    } else {
      T.push(() => { const a = R.int(-15, 15) || 7, b = R.int(-6, 6) || -3, c = R.int(-6, 6) || 4; const p = b * c, r = a + p; return [`${N(a)} + ${P(b)} × ${P(c)}`, r, [`Multiply first: ${P(b)} × ${P(c)} = ${N(p)}`, `Then add: ${N(a)} + ${P(p)} = ${N(r)}`, `Answer: ${N(r)}`]]; });
      T.push(() => { const a = R.int(-5, 5), b = R.int(-5, 5), c = R.pick([1, 2, -2, 4, -4]); const s = a - b, e = s * s; if (e % c) return null; const r = e / c; return [`(${N(a)} − ${P(b)})${SUP['2']} ÷ ${P(c)}`, r, [`Parentheses: ${N(a)} − ${P(b)} = ${N(s)}`, `Exponent: ${P(s)}${SUP['2']} = ${e} (a negative times a negative is positive)`, `Divide: ${e} ÷ ${P(c)} = ${N(r)}`, `Answer: ${N(r)}`]]; });
      T.push(() => { const a = R.int(-8, 8) || -5, b = R.int(2, 7), c = R.int(2, 4); const p = a * b, e = c * c, r = p - e; return [`${N(a)} × ${b} − ${pw(c, 2)}`, r, [`Exponent first: ${pw(c, 2)} = ${e}`, `Multiply: ${N(a)} × ${b} = ${N(p)}`, `Subtract: ${N(p)} − ${e} = ${N(r)}`, `Answer: ${N(r)}`]]; });
      T.push(() => { const d = R.pick([-5, -4, -3, -2, 2, 3, 4, 5]), q = R.int(-6, 6), c = d * q, a = R.int(-10, 10), b = R.int(-10, 10); const s = a + b, r = q - s; return [`${N(c)} ÷ ${P(d)} − (${N(a)} + ${P(b)})`, r, [`Parentheses: ${N(a)} + ${P(b)} = ${N(s)}`, `Divide: ${N(c)} ÷ ${P(d)} = ${N(q)}`, `Subtract: ${N(q)} − ${P(s)} = ${N(r)}`, `Answer: ${N(r)}`]]; });
    }
    let out = null; for (let g = 0; g < 80 && !out; g++){ out = R.pick(T)(); if (out && lvl < 3 && out[1] < 0) out = null; }
    return { q:`Find the value:  ${out[0]}`, kind:'num', a:out[1], hint, steps:out[2] };
  }};

  M['g5.exponents'] = { name:'Exponents & powers of 10', unit:'g5u5', gen(R, lvl){
    const evalSteps = (b, e) => { const v = Math.pow(b, e); return [`${pw(b, e)} means ${b} times itself ${e} times (NOT ${b} × ${e}).`, `${Array(e).fill(b).join(' × ')}`, `= ${N(v)}`]; };
    if (lvl === 1){
      if (R.chance(0.3)){ const n = R.int(1, 5); const v = Math.pow(10, n); return { q:`What is ${pw(10, n)}?`, kind:'num', a:v, hint:'For powers of 10, the exponent tells how many zeros come after the 1.', steps:[`The exponent is ${n}, so write 1 followed by ${n} zero${n > 1 ? 's' : ''}.`, `${pw(10, n)} = ${N(v)}`] }; }
      const b = R.int(2, 9), e = R.int(2, 3); const v = Math.pow(b, e);
      return { q:`What is ${pw(b, e)}?`, kind:'num', a:v, hint:`The small number tells how many ${b}'s to multiply together.`, steps:evalSteps(b, e) };
    }
    if (lvl === 2){
      if (R.chance(0.5)){ const b = R.int(2, 9), e = R.int(3, 6); const a = pw(b, e);
        return { q:`Write as a power:  ${Array(e).fill(b).join(' × ')}`, kind:'choice', a, choices:choose(a, [pw(e, b), N(b * e), `${b} × ${e}`]),
          hint:'The base is the number being multiplied. The exponent counts how many times.', steps:[`The number being multiplied is ${b}: that is the base.`, `Count them: ${e} times. That is the exponent.`, `Answer: ${a}`] }; }
      if (R.chance(0.5)){ const n = R.int(2, 7); const a = pw(10, n);
        return { q:`Write ${N(Math.pow(10, n))} as a power of 10.`, kind:'choice', a, choices:choose(a, [pw(10, n + 1), pw(10, n - 1), pw(n, 10)]),
          hint:'Count the zeros.', steps:[`${N(Math.pow(10, n))} has ${n} zeros.`, `So it is 10 multiplied ${n} times.`, `Answer: ${a}`] }; }
      const b = R.int(2, 5), e = R.int(3, 4); return { q:`What is ${pw(b, e)}?`, kind:'num', a:Math.pow(b, e), hint:`Multiply ${b} by itself ${e} times. Go one step at a time.`, steps:evalSteps(b, e) };
    }
    const t = R.int(0, 2);
    if (t === 0){ const pairs = [[2, 5], [2, 4], [3, 4], [2, 6], [3, 5], [4, 5], [2, 3]]; const [x, y] = R.pick(pairs); const v1 = Math.pow(x, y), v2 = Math.pow(y, x);
      const a = v1 > v2 ? pw(x, y) : v1 < v2 ? pw(y, x) : 'They are equal';
      return { q:`Which is greater:  ${pw(x, y)}  or  ${pw(y, x)}?`, kind:'choice', a, choices:[pw(x, y), pw(y, x), 'They are equal'],
        hint:'Work out each one. Do not just look at the big numbers!', steps:[`${pw(x, y)} = ${Array(y).fill(x).join(' × ')} = ${v1}`, `${pw(y, x)} = ${Array(x).fill(y).join(' × ')} = ${v2}`, `Answer: ${a}`] }; }
    if (t === 1){ const a = R.int(2, 6), b = R.int(2, 4), e = R.int(2, 3); const v1 = a * a, v2 = Math.pow(b, e), r = v1 + v2;
      return { q:`Find the value:  ${pw(a, 2)} + ${pw(b, e)}`, kind:'num', a:r, hint:'Find each power first, then add.', steps:[`${pw(a, 2)} = ${a} × ${a} = ${v1}`, `${pw(b, e)} = ${Array(e).fill(b).join(' × ')} = ${v2}`, `${v1} + ${v2} = ${r}`] }; }
    const n = R.int(2, 4), m = R.int(2, 9); const r = m * Math.pow(10, n);
    return { q:`What is ${m} × ${pw(10, n)}?`, kind:'num', a:r, hint:'Find the power of 10 first, then multiply. Multiplying by 10 adds a zero.', steps:[`${pw(10, n)} = ${N(Math.pow(10, n))}`, `${m} × ${N(Math.pow(10, n))} = ${N(r)}`] };
  }};

  // Perfect squares: the struggle skill. Very calm, explicit steps.
  function rootSteps(A, s, unit){
    const u = unit ? ' ' + unit : '';
    const lo = s - 1, hi = s + 1;
    return [`A square has 4 equal sides. Area = side × side.`, `So find the number that times itself makes ${A}. That is √${A}.`, `Try numbers: ${lo} × ${lo} = ${lo * lo} (too small)${hi <= 25 ? `, ${hi} × ${hi} = ${hi * hi} (too big)` : ''}.`, `${s} × ${s} = ${A} ✓  So each side is ${s}${u}.`];
  }
  M['g5.squares'] = { name:'Perfect squares & square roots', unit:'g5u5', warm:true, gen(R, lvl){
    if (lvl === 1){
      const n = R.int(1, 15);
      if (R.chance(0.5)) return { q:`What is ${pw(n, 2)}?`, kind:'num', a:n * n, fact:'sq' + n * n, model: n <= 10 ? { type:'array', rows:n, cols:n } : undefined,
        hint:`${pw(n, 2)} means ${n} × ${n}. Picture a square with ${n} on each side.`,
        steps:[`${pw(n, 2)} means ${n} × ${n} (NOT ${n} × 2).`, `${n} × ${n} = ${n * n}`, `${pw(n, 2)} = ${n * n}`] };
      return { q:`What is √${n * n}?`, kind:'num', a:n, fact:'sq' + n * n, model: n <= 10 ? { type:'array', rows:n, cols:n } : undefined,
        hint:`√${n * n} asks: what number times ITSELF makes ${n * n}?`,
        steps:[`√${n * n} means: ? × ? = ${n * n}, using the same number twice.`, `Try ${n}: ${n} × ${n} = ${n * n} ✓`, `√${n * n} = ${n}`] };
    }
    const nm = R.pick(NAMES);
    if (lvl === 2){
      const t = R.int(0, 3);
      if (t === 0){ const s = R.int(4, 15), A = s * s; const u = R.pick(['ft', 'm', 'yd']);
        return { q:`${nm} has a SQUARE garden with an area of ${A} square ${u === 'ft' ? 'feet' : u === 'm' ? 'meters' : 'yards'}. How long is each side?`, kind:'num', a:s, unit:u,
          hint:`Area of a square = side × side. What number times itself is ${A}?`, steps:rootSteps(A, s, u) }; }
      if (t === 1){ const s = R.int(3, 10), A = s * s;
        return { q:`${nm} uses ${A} square tiles to make one big square with no tiles left over. How many tiles are in each row?`, kind:'num', a:s, unit:'tiles', model:{ type:'array', rows:s, cols:s },
          hint:'In a square, the number of rows equals the number in each row. Which number times itself is ' + A + '?',
          steps:[`A square has the same number of rows and columns.`, `So rows × rows = ${A}. Find √${A}.`, `${s} × ${s} = ${A} ✓`, `There are ${s} tiles in each row.`] }; }
      if (t === 2){ const s = R.int(3, 20); const u = R.pick(['in', 'cm', 'ft']);
        return { q:`A square sticker is ${s} ${u} on each side. What is its area?`, kind:'num', a:s * s, unit:u + '²', model:{ type:'rect', w:s, h:s, unit:u, grid: s <= 10 },
          hint:'Area of a square = side × side.', steps:[`Area = side × side`, `${s} × ${s} = ${s * s}`, `The area is ${s * s} square ${u} (${s * s} ${u}²).`] }; }
      const s = R.int(11, 20), A = s * s;
      return { q:`A square playground has an area of ${A} square meters. How long is each side?`, kind:'num', a:s, unit:'m',
        hint:`${A} is more than 100, so the side is more than 10. Try 11, 12, 13...`,
        steps:[`Area = side × side, so find √${A}.`, `${A} is bigger than 100 (10 × 10), so the side is more than 10.`, `Try ${s - 1}: ${s - 1} × ${s - 1} = ${(s - 1) * (s - 1)}, too small.`, `Try ${s}: ${s} × ${s} = ${A} ✓  Each side is ${s} m.`] };
    }
    const t = R.int(0, 3);
    if (t === 0){ const s = R.int(4, 15), A = s * s; const P4 = 4 * s;
      return { q:`A square garden has an area of ${A} square feet. ${nm} wants to put a fence all the way around it. How many feet of fence are needed?`, kind:'num', a:P4, unit:'ft',
        hint:'Two steps! First find one side (square root of the area). Then the fence goes around all 4 sides.',
        steps:[`Step 1: find a side. What number times itself is ${A}?`, `${s} × ${s} = ${A}, so each side is ${s} ft.`, `Step 2: the fence goes around 4 sides: 4 × ${s} = ${P4}`, `You need ${P4} feet of fence.`] }; }
    if (t === 1){ let n; do { n = R.int(5, 399); } while (Number.isInteger(Math.sqrt(n))); const lo = Math.floor(Math.sqrt(n)), hi = lo + 1; const a = `${lo} and ${hi}`;
      const half = Math.floor(n / 2);
      return { q:`Between which two whole numbers is √${n}?`, kind:'choice', a, choices:choose(a, [`${lo - 1} and ${lo}`, `${hi} and ${hi + 1}`, `${half} and ${half + 1}`]),
        hint:`Find the perfect squares just below and just above ${n}.`,
        steps:[`List perfect squares near ${n}: ${lo} × ${lo} = ${lo * lo} and ${hi} × ${hi} = ${hi * hi}.`, `${n} is between ${lo * lo} and ${hi * hi}.`, `So √${n} is between √${lo * lo} and √${hi * hi}: between ${a}.`] }; }
    if (t === 2){ let n; do { n = R.int(20, 150); } while (Number.isInteger(Math.sqrt(n))); const s = Math.floor(Math.sqrt(n));
      return { q:`${nm} has ${n} square tiles. What is the side length (in tiles) of the BIGGEST square ${nm} can make?`, kind:'num', a:s, unit:'tiles',
        hint:`Find the biggest perfect square that is not more than ${n}.`,
        steps:[`A square of side s uses s × s tiles.`, `${s} × ${s} = ${s * s} (fits), but ${s + 1} × ${s + 1} = ${(s + 1) * (s + 1)} (too many).`, `The biggest square has ${s} tiles on each side (${n - s * s} tiles left over).`, `Answer: ${s}`] }; }
    const s = R.int(3, 15); const P4 = 4 * s;
    return { q:`The perimeter of a square rug is ${P4} feet. What is the area of the rug?`, kind:'num', a:s * s, unit:'ft²',
      hint:'Two steps! The 4 sides are equal, so divide the perimeter by 4. Then area = side × side.',
      steps:[`Step 1: the 4 sides are equal: ${P4} ÷ 4 = ${s} ft per side.`, `Step 2: area = side × side = ${s} × ${s}`, `${s} × ${s} = ${s * s}`, `The area is ${s * s} square feet.`] };
  }};

  // ======================= UNIT 6: EXPRESSIONS & EQUATIONS =======================
  const VARS = ['n', 'x', 'y', 'a', 'm', 'k'];
  M['g5.expr'] = { name:'Expressions with variables', unit:'g5u6', gen(R, lvl){
    const v = R.pick(VARS);
    if (lvl === 1 || (lvl === 2 && R.chance(0.4))){
      const t = R.int(0, 2); const n = R.int(2, 10);
      if (t === 0){ const a = R.int(2, 9), b = R.int(1, 20); const p = a * n, r = p + b; return { q:`Evaluate ${a}${v} + ${b} when ${v} = ${n}.`, kind:'num', a:r, hint:`${a}${v} means ${a} × ${v}. Replace ${v} with ${n}.`,
        steps:[`Replace ${v} with ${n}: ${a} × ${n} + ${b}`, `Multiply first: ${a} × ${n} = ${p}`, `Add: ${p} + ${b} = ${r}`] }; }
      if (t === 1){ const b = R.int(2, 9), q = R.int(2, 9), nn = b * q, c = R.int(1, 15); const r = q + c; return { q:`Evaluate ${v} ÷ ${b} + ${c} when ${v} = ${nn}.`, kind:'num', a:r, hint:`Put ${nn} in for ${v}. Then divide before adding.`,
        steps:[`Replace ${v} with ${nn}: ${nn} ÷ ${b} + ${c}`, `Divide: ${nn} ÷ ${b} = ${q}`, `Add: ${q} + ${c} = ${r}`] }; }
      const a = R.int(1, 9), b = R.int(2, 6); const s = n + a, r = s * b; return { q:`Evaluate ${b}(${v} + ${a}) when ${v} = ${n}.`, kind:'num', a:r, hint:`A number right next to parentheses means multiply.`,
        steps:[`Replace ${v} with ${n}: ${b} × (${n} + ${a})`, `Parentheses first: ${n} + ${a} = ${s}`, `Multiply: ${b} × ${s} = ${r}`] };
    }
    if (lvl === 2){
      if (R.chance(0.4)){ const a = R.int(2, 9), b = R.int(1, 9); const r = 2 * a + b * b; return { q:`Evaluate 2a + b${SUP['2']} when a = ${a} and b = ${b}.`, kind:'num', a:r, hint:'Replace each letter with its number. Do the exponent before adding.',
        steps:[`Replace: 2 × ${a} + ${pw(b, 2)}`, `Exponent: ${pw(b, 2)} = ${b * b}. Multiply: 2 × ${a} = ${2 * a}`, `Add: ${2 * a} + ${b * b} = ${r}`] }; }
      return wordExpr(R, v, false);
    }
    if (R.chance(0.5)){ const a = R.int(2, 6), b = R.int(-12, 12), n = R.int(-8, 8); const p = a * n, r = p - b;
      return { q:`Evaluate ${a}${v} − ${P(b)} when ${v} = ${N(n)}.`, kind:'num', a:r, hint:`Replace ${v} with ${N(n)} (use parentheses!). Watch the signs.`,
        steps:[`Replace ${v}: ${a} × ${P(n)} − ${P(b)}`, `Multiply: ${a} × ${P(n)} = ${N(p)}`, `Subtract: ${N(p)} − ${P(b)} = ${N(p)} + ${P(-b)} = ${N(r)}`] }; }
    return wordExpr(R, v, true);
  }};
  function wordExpr(R, v, hard){
    const k = R.int(2, 9); let m = R.int(2, 9); if (m === k) m = k === 9 ? 2 : k + 1;
    const easy = [
      { w:`${k} more than ${v}`, a:`${v} + ${k}`, d:[`${k}${v}`, `${v} − ${k}`, `${k} − ${v}`], why:'"more than" means add.' },
      { w:`${k} less than ${v}`, a:`${v} − ${k}`, d:[`${k} − ${v}`, `${v} + ${k}`, `${k}${v}`], why:'"less than" means subtract FROM the number: start with ' + v + '.' },
      { w:`the product of ${k} and ${v}`, a:`${k}${v}`, d:[`${k} + ${v}`, `${v} − ${k}`, `${v} ÷ ${k}`], why:'"product" means multiply.' },
      { w:`${v} divided by ${k}`, a:`${v} ÷ ${k}`, d:[`${k} ÷ ${v}`, `${k}${v}`, `${v} − ${k}`], why:'"divided by" means ÷, and order matters: ' + v + ' comes first.' },
      { w:`the cost of ${v} tickets at $${k} each`, a:`${k}${v}`, d:[`${k} + ${v}`, `${v} ÷ ${k}`, `${v} − ${k}`], why:'Each ticket costs the same, so multiply.' }
    ];
    const harder = [
      { w:`${k} times a number ${v}, plus ${m}`, a:`${k}${v} + ${m}`, d:[`${k}(${v} + ${m})`, `${m}${v} + ${k}`, `${k}${v} − ${m}`], why:'First "times" (multiply), then "plus" (add).' },
      { w:`${k} less than ${m} times ${v}`, a:`${m}${v} − ${k}`, d:[`${k} − ${m}${v}`, `${m}(${v} − ${k})`, `${m}${v} + ${k}`], why:'"' + k + ' less than" means subtract ' + k + ' at the END.' },
      { w:`twice the sum of ${v} and ${k}`, a:`2(${v} + ${k})`, d:[`2${v} + ${k}`, `${v} + 2 · ${k}`, `2 + ${v} + ${k}`], why:'"Sum" goes in parentheses first, then double it.' },
      { w:`$${k} for each of ${v} pizzas, plus a $${m} delivery fee`, a:`${k}${v} + ${m}`, d:[`${m}${v} + ${k}`, `${k}(${v} + ${m})`, `${k} + ${v} + ${m}`], why:'Pizzas: ' + k + ' × ' + v + '. Then add the fee once.' }
    ];
    const it = R.pick(hard ? harder : easy);
    return { q:`Which expression means "${it.w}"?`, kind:'choice', a:it.a, choices:choose(it.a, it.d),
      hint:'Key words: more/plus/sum = +, less/minus = −, times/product/each = ×, divided/per = ÷.', steps:[it.why, `Answer: ${it.a}`] };
  }

  M['g5.onestep'] = { name:'One-step equations', unit:'g5u6', gen(R, lvl){
    const v = R.pick(['x', 'n', 'y', 'm']);
    const kinds = lvl === 1 ? ['+', '−'] : ['+', '−', '×', '÷'];
    const op = R.pick(kinds); const lim = lvl === 3 ? 15 : 20;
    let x, a, b, q, steps, hint;
    const pick = (lo, hi) => lvl === 3 ? R.int(-hi, hi) || lo : R.int(lo, hi);
    if (op === '+'){ x = pick(1, lim); a = pick(1, lim); if (lvl === 3 && a === 0) a = 4; b = x + a;
      q = `${v} + ${P(a)} = ${N(b)}`; hint = `What undoes adding ${N(a)}? Do it to BOTH sides.`;
      steps = [`${v} has ${N(a)} added to it. Undo it by subtracting ${P(a)} from both sides.`, `${v} + ${P(a)} − ${P(a)} = ${N(b)} − ${P(a)}`, `${v} = ${N(x)}`]; }
    else if (op === '−'){ x = pick(1, lim); a = lvl === 3 ? R.int(1, lim) : R.int(1, Math.max(1, x)); b = x - a;
      q = `${v} − ${a} = ${N(b)}`; hint = `What undoes subtracting ${a}? Do it to BOTH sides.`;
      steps = [`${a} is subtracted from ${v}. Undo it by adding ${a} to both sides.`, `${v} − ${a} + ${a} = ${N(b)} + ${a}`, `${v} = ${N(x)}`]; }
    else if (op === '×'){ x = pick(1, 12); a = lvl === 3 ? R.pick([-9, -7, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]) : R.int(2, 9); b = a * x;
      q = `${a < 0 ? '(' + N(a) + ')' : a}${v} = ${N(b)}`; hint = `${N(a)}${v} means ${N(a)} × ${v}. What undoes multiplying? Do it to BOTH sides.`;
      steps = [`${v} is multiplied by ${N(a)}. Undo it by dividing both sides by ${P(a)}.`, `${N(b)} ÷ ${P(a)} = ${N(x)}`, `${v} = ${N(x)}`]; }
    else { x = pick(1, 12); a = lvl === 3 ? R.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]) : R.int(2, 9); const xx = a * x; b = x; x = xx;
      q = `${v} ÷ ${P(a)} = ${N(b)}`; hint = `What undoes dividing by ${N(a)}? Do it to BOTH sides.`;
      steps = [`${v} is divided by ${N(a)}. Undo it by multiplying both sides by ${P(a)}.`, `${N(b)} × ${P(a)} = ${N(x)}`, `${v} = ${N(x)}`]; }
    steps.push(`Check: put ${N(x)} back in the equation. It works! ${v} = ${N(x)}`);
    return { q:`Solve for ${v}:   ${q}`, kind:'num', a:x, hint, steps };
  }};

  // ======================= UNIT 7: AREA & CIRCLES =======================
  M['g5.area'] = { name:'Area of triangles, parallelograms & composite shapes', unit:'g5u7', gen(R, lvl){
    const u = R.pick(['cm', 'in', 'ft', 'm']);
    if (lvl === 1){
      if (R.chance(0.4)){ const w = R.int(3, 15), h = R.int(2, 12); return { q:`What is the area of a rectangle that is ${w} ${u} long and ${h} ${u} wide?`, kind:'num', a:w * h, unit:u + '²', model:{ type:'rect', w, h, unit:u, grid: w <= 10 && h <= 10 },
        hint:'Area of a rectangle = length × width.', steps:[`Area = length × width`, `${w} × ${h} = ${w * h}`, `The area is ${w * h} ${u}².`] }; }
      const b = R.int(3, 15), h = R.int(2, 12); return { q:`A parallelogram has a base of ${b} ${u} and a height of ${h} ${u}. What is its area?`, kind:'num', a:b * h, unit:u + '²', model:{ type:'polygon', shape:'parallelogram' },
        hint:'Cut off the slanted end and slide it over: it becomes a rectangle! Area = base × height.', steps:[`A parallelogram can be rearranged into a rectangle.`, `Area = base × height = ${b} × ${h}`, `${b} × ${h} = ${b * h}`, `The area is ${b * h} ${u}².`] };
    }
    if (lvl === 2){
      let b = R.int(3, 16), h = R.int(2, 12); if ((b * h) % 2) b += 1; const A = b * h / 2;
      if (R.chance(0.25)){ const bb = R.int(3, 12), hh = R.int(2, 10); const AA = bb * hh;
        return { q:`A parallelogram has an area of ${AA} ${u}² and a base of ${bb} ${u}. What is its height?`, kind:'num', a:hh, unit:u, model:{ type:'polygon', shape:'parallelogram' },
          hint:'Area = base × height. What times the base gives the area?', steps:[`Area = base × height, so ${AA} = ${bb} × height.`, `Height = ${AA} ÷ ${bb}`, `${AA} ÷ ${bb} = ${hh}`, `The height is ${hh} ${u}.`] }; }
      return { q:`A triangle has a base of ${b} ${u} and a height of ${h} ${u}. What is its area?`, kind:'num', a:A, unit:u + '²', model:{ type:'polygon', shape:R.pick(['triangle', 'right-triangle']) },
        hint:'A triangle is HALF of a parallelogram (or rectangle) with the same base and height.', steps:[`Area of a triangle = ½ × base × height.`, `${b} × ${h} = ${b * h}`, `Half of ${b * h} is ${A}.`, `The area is ${A} ${u}².`] };
    }
    if (R.chance(0.6)){
      const W = R.int(5, 10), H = R.int(5, 10), cw = R.int(2, W - 2), ch = R.int(2, H - 2);
      const pts = [[0, 0], [W, 0], [W, H - ch], [W - cw, H - ch], [W - cw, H], [0, H]];
      const segs = pts.map((p, i) => [p[0], p[1], pts[(i + 1) % 6][0], pts[(i + 1) % 6][1]]);
      const A1 = W * (H - ch), A2 = (W - cw) * ch; const A = A1 + A2;
      return { q:`This garden is shaped like the outline on the grid. Each square is 1 ft by 1 ft. It is ${W} ft wide and ${H} ft tall, with a corner piece missing that is ${cw} ft wide and ${ch} ft tall. What is its area?`, kind:'num', a:A, unit:'ft²',
        model:{ type:'grid', range:10, quad1:true, points:[], segs },
        hint:'Split the shape into two rectangles. Find each area, then add.',
        steps:[`Split it into two rectangles with a line across.`, `Bottom rectangle: ${W} × ${H - ch} = ${A1}`, `Top rectangle: ${W - cw} × ${ch} = ${A2}`, `Add: ${A1} + ${A2} = ${A} ft².`] };
    }
    let b = R.int(8, 20), h = R.int(6, 14); if ((b * h) % 2) h += 1; const tri = b * h / 2; const s = R.int(2, Math.max(2, Math.min(8, Math.floor(Math.sqrt(tri / 2)))));
    return { q:`A sign is a triangle (base ${b} in, height ${h} in) with a square (${s} in by ${s} in) cut out of the middle. What area of the sign is left?`, kind:'num', a:tri - s * s, unit:'in²', model:{ type:'polygon', shape:'triangle' },
      hint:'Find the whole triangle\'s area, then take away the square.', steps:[`Triangle: ½ × ${b} × ${h} = ${tri}`, `Square: ${s} × ${s} = ${s * s}`, `Take away: ${tri} − ${s * s} = ${tri - s * s}`, `${tri - s * s} in² is left.`] };
  }};

  M['g5.circle'] = { name:'Circles: circumference & area', unit:'g5u7', gen(R, lvl){
    const u = R.pick(['cm', 'in', 'ft', 'm']);
    if (lvl === 1){
      if (R.chance(0.5)){ const r = R.int(2, 25); return { q:`A circle has a radius of ${r} ${u}. What is its diameter?`, kind:'num', a:2 * r, unit:u,
        hint:'The diameter goes all the way across, through the center. It is 2 radii long.', steps:[`Diameter = 2 × radius`, `2 × ${r} = ${2 * r}`, `The diameter is ${2 * r} ${u}.`] }; }
      const d = 2 * R.int(2, 25); return { q:`A circle has a diameter of ${d} ${u}. What is its radius?`, kind:'num', a:d / 2, unit:u,
        hint:'The radius goes from the center to the edge: half the diameter.', steps:[`Radius = diameter ÷ 2`, `${d} ÷ 2 = ${d / 2}`, `The radius is ${d / 2} ${u}.`] };
    }
    if (lvl === 2){
      if (R.chance(0.5)){ const d = R.int(2, 20); const C = r2(3.14 * d); return { q:`A circle has a diameter of ${d} ${u}. Find its circumference. Use π ≈ 3.14. Round to the nearest hundredth.`, kind:'num', a:C, unit:u,
        hint:'Circumference = π × diameter.', steps:[`C = π × d`, `C = 3.14 × ${d}`, `3.14 × ${d} = ${N(C)}`, `The circumference is about ${N(C)} ${u}.`] }; }
      const r = R.int(1, 15); const C = r2(2 * 3.14 * r); return { q:`A circle has a radius of ${r} ${u}. Find its circumference. Use π ≈ 3.14. Round to the nearest hundredth.`, kind:'num', a:C, unit:u,
        hint:'Circumference = 2 × π × radius (or π × diameter).', steps:[`The diameter is 2 × ${r} = ${2 * r}.`, `C = 3.14 × ${2 * r}`, `= ${N(C)}`, `The circumference is about ${N(C)} ${u}.`] };
    }
    const byD = R.chance(0.4); const r = R.int(1, 12); const A = r2(3.14 * r * r);
    return { q:`A circle has a ${byD ? 'diameter' : 'radius'} of ${byD ? 2 * r : r} ${u}. Find its area. Use π ≈ 3.14. Round to the nearest hundredth.`, kind:'num', a:A, unit:u + '²',
      hint:'Area = π × radius × radius. Make sure you use the RADIUS!',
      steps:[...(byD ? [`Radius = diameter ÷ 2 = ${2 * r} ÷ 2 = ${r}`] : []), `A = π × r × r = 3.14 × ${r} × ${r}`, `${r} × ${r} = ${r * r}, and 3.14 × ${r * r} = ${N(A)}`, `The area is about ${N(A)} ${u}².`] };
  }};

  // ======================= UNIT 8: PROBABILITY =======================
  const COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];
  M['g5.prob'] = { name:'Probability', unit:'g5u8', gen(R, lvl){
    const cols = R.shuffle(COLORS).slice(0, 3); const counts = cols.map(() => R.int(1, 7));
    let T = sum(counts); const ci = R.int(0, 2);
    const model = { type:'table', head:['Color', 'Marbles'], rows:cols.map((c, i) => [c, N(counts[i])]) };
    if (lvl === 1){
      const kind = R.pick(['impossible', 'certain', 'likely', 'unlikely', 'equal']);
      let f, T2, ev;
      if (kind === 'impossible'){ f = 0; T2 = R.int(4, 10); ev = 'orange'; }
      else if (kind === 'certain'){ f = T2 = R.int(4, 10); ev = cols[0]; }
      else if (kind === 'equal'){ T2 = 2 * R.int(2, 5); f = T2 / 2; ev = cols[0]; }
      else if (kind === 'likely'){ T2 = R.int(6, 12); f = R.int(Math.floor(T2 / 2) + 1, T2 - 1); ev = cols[0]; }
      else { T2 = R.int(6, 12); f = R.int(1, Math.ceil(T2 / 2) - 1); ev = cols[0]; }
      const words = { impossible:'impossible', certain:'certain', likely:'likely', unlikely:'unlikely', equal:'equally likely' };
      const a = words[kind];
      const rows = kind === 'impossible' ? [[cols[0], N(T2 - 2)], [cols[1], '2']] : kind === 'certain' ? [[cols[0], N(T2)]] : [[cols[0], N(f)], [cols[1], N(T2 - f)]];
      return { q:`A bag has these marbles. You pick one without looking. How likely is it to be ${ev}?`, kind:'choice', a, choices:choose(a, R.shuffle(['impossible', 'unlikely', 'equally likely', 'likely', 'certain'])), model:{ type:'table', head:['Color', 'Marbles'], rows },
        hint:'Compare how many marbles are ' + ev + ' to how many there are in all.',
        steps:[`${ev[0].toUpperCase() + ev.slice(1)}: ${f} out of ${T2} marbles.`, f === 0 ? 'There are none, so it cannot happen.' : f === T2 ? 'Every marble is that color, so it must happen.' : f * 2 === T2 ? 'Exactly half, so it is a 50-50 chance.' : f * 2 > T2 ? 'More than half are that color.' : 'Less than half are that color.', `It is ${a}.`] };
    }
    const f = counts[ci]; const ans = frac(f, T);
    if (lvl === 2){
      const ds = [`${f}/${T - f}`, frac(T - f, T), `${f}/${counts.length}`, `1/${T}`];
      return { q:`A bag has these marbles. You pick one without looking. What is P(${cols[ci]})? Give the fraction in simplest form.`, kind:'choice', a:ans, choices:choose(ans, ds), model,
        hint:'Probability = favorable outcomes ÷ total outcomes.',
        steps:[`Favorable: ${f} ${cols[ci]} marbles.`, `Total: ${counts.join(' + ')} = ${T} marbles.`, `P(${cols[ci]}) = ${f}/${T}${frac(f, T) !== f + '/' + T ? ' = ' + ans : ''}`, `Answer: ${ans}`] };
    }
    const t = R.int(0, 2);
    if (t === 0){ const Ts = R.pick([4, 5, 10, 20]); const fs = R.int(1, Ts - 1); const p = fs * 100 / Ts;
      return { q:`A spinner has ${Ts} equal parts. ${fs} of them are blue. What is the probability of landing on blue, as a percent?`, kind:'num', a:p, unit:'%', model: Ts <= 12 ? { type:'fraction', parts:Ts, shaded:fs, shape:'circle' } : undefined,
        hint:'Write the probability as a fraction, then change it to a percent (out of 100).', steps:[`P(blue) = ${fs}/${Ts}`, `Make the bottom 100: × ${100 / Ts} on top and bottom = ${p}/100`, `That is ${p}%.`] }; }
    if (t === 1){ const k = R.int(1, 5); const evs = [`a number greater than ${k}`, `a number less than ${k + 1}`]; const big = R.chance(0.5); const f2 = big ? 6 - k : k; const a = frac(f2, 6);
      const okList = big ? Array.from({ length:6 - k }, (_, i) => k + 1 + i) : Array.from({ length:k }, (_, i) => i + 1);
      return { q:`You roll a number cube (1 to 6). What is the probability of rolling ${big ? evs[0] : evs[1]}?`, kind:'choice', a, choices:choose(a, [frac(6 - f2, 6), f2 === 3 ? '3/12' : `${f2}/${6 - f2}`, `1/${f2 === 1 ? 2 : f2}`, `1/6`]),
        hint:'List the numbers that work. Then put that count over 6.', steps:[`Numbers that work: ${okList.join(', ')} → ${f2} of them.`, `There are 6 possible numbers.`, `P = ${f2}/6${frac(f2, 6) !== f2 + '/6' ? ' = ' + a : ''}`, `Answer: ${a}`] }; }
    const notA = frac(T - f, T);
    return { q:`A bag has these marbles. You pick one without looking. What is the probability of NOT picking ${cols[ci]}? (simplest form)`, kind:'choice', a:notA, choices:choose(notA, [ans, `${T - f}/${f}`, `${f}/${T - f}`, `1/${T}`]), model,
      hint:'Count the marbles that are NOT ' + cols[ci] + '. Or: 1 − P(' + cols[ci] + ').',
      steps:[`Total: ${T} marbles. ${cols[ci]}: ${f}.`, `Not ${cols[ci]}: ${T} − ${f} = ${T - f}`, `P(not ${cols[ci]}) = ${T - f}/${T}${notA !== (T - f) + '/' + T ? ' = ' + notA : ''}`, `Answer: ${notA}`] };
  }};
})();
