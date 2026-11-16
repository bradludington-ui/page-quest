// Page Quest math: grade 3 (FCPS / Virginia SOL). Procedural problem generators.
// Contract: see MATH-BRIEF.md. Every answer is computed from the generated numbers.
(function(){
  const M = window.MathSkills = window.MathSkills || {};

  // ---------- helpers ----------
  const NAMES = ['Sam','Maya','Leo','Ava','Ben','Lily','Max','Emma','Noah','Mia'];
  const PLACE = ['ones','tens','hundreds','thousands','ten thousands'];
  const PLACE_CAP = ['Ones','Tens','Hundreds','Thousands','Ten thousands'];
  const POW = [1,10,100,1000,10000];
  function fmt(n){ const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (n < 0 ? '−' : '') + s; }
  function name(R){ return R.pick(NAMES); }
  function names2(R){ const a = R.pick(NAMES); let b = R.pick(NAMES); while (b === a) b = R.pick(NAMES); return [a, b]; }
  // answer first, then up to 3 unique distractors (never equal to the answer)
  function choices(ans, ds){
    const out = [String(ans)];
    for (const d of ds){
      const s = String(d);
      if (!s || out.includes(s) || /NaN|undefined|Infinity/.test(s)) continue;
      out.push(s); if (out.length === 4) break;
    }
    return out;
  }
  function digitsOf(n){ return String(n).split('').reverse().map(Number); } // ones first
  function cents(c){ return c >= 100 ? '$' + (Math.floor(c/100)) + '.' + String(c % 100).padStart(2,'0') : c + '¢'; }

  // column addition steps (one step per place) -- for a + b
  function addSteps(a, b){
    const da = digitsOf(a), db = digitsOf(b), n = Math.max(da.length, db.length);
    const steps = []; let carry = 0;
    for (let i = 0; i < n; i++){
      const x = da[i] || 0, y = db[i] || 0, s = x + y + carry;
      const sum = carry ? `${x} + ${y} + 1 (carried) = ${s}` : `${x} + ${y} = ${s}`;
      if (s >= 10 && i < n - 1) steps.push(`${PLACE_CAP[i]}: ${sum}. Write ${s - 10}, carry 1 to the ${PLACE[i+1]}.`);
      else steps.push(`${PLACE_CAP[i]}: ${sum}.`);
      carry = s >= 10 ? 1 : 0;
    }
    return steps;
  }
  // column subtraction steps -- for a − b (a ≥ b)
  function subSteps(a, b){
    const da = digitsOf(a), db = digitsOf(b), n = da.length;
    const steps = []; let borrow = 0;
    for (let i = 0; i < n; i++){
      const top = da[i] - borrow, y = db[i] || 0;
      if (i === n - 1 && top === 0 && y === 0) { borrow = 0; continue; }
      if (top < y){
        steps.push(borrow
          ? `${PLACE_CAP[i]}: this ${da[i]} lent 1, so it is too small. Regroup 1 from the ${PLACE[i+1]}: ${da[i] + 10} − 1 − ${y} = ${top + 10 - y}.`
          : `${PLACE_CAP[i]}: ${da[i]} is less than ${y}, so regroup 1 from the ${PLACE[i+1]}: ${da[i] + 10} − ${y} = ${top + 10 - y}.`);
        borrow = 1;
      } else {
        steps.push(borrow ? `${PLACE_CAP[i]}: ${da[i]} − 1 (lent) − ${y} = ${top - y}.` : `${PLACE_CAP[i]}: ${top} − ${y} = ${top - y}.`);
        borrow = 0;
      }
    }
    return steps;
  }
  function dol(c){ return '$' + Math.floor(c/100) + '.' + String(c % 100).padStart(2,'0'); }
  function pl(n, w){ return n === 1 ? w.replace(/s$/, '') : w; }
  function roundTo(n, p){ return Math.floor((n + p/2) / p) * p; }

  // ---------- Unit 1: data ----------
  const GRAPH_THEMES = [
    { title:'Favorite Fruit', cats:['Apples','Bananas','Grapes','Pears','Peaches'], q:c=>`How many students chose ${c}?`, noun:'students' },
    { title:'Pets in Our Class', cats:['Dogs','Cats','Fish','Birds','Hamsters'], q:c=>`How many students have ${c.toLowerCase()}?`, noun:'students' },
    { title:'Favorite Sport', cats:['Soccer','Baseball','Swimming','Tennis','Basketball'], q:c=>`How many students chose ${c.toLowerCase()}?`, noun:'students' },
    { title:'Books Read This Month', cats:NAMES, q:c=>`How many books did ${c} read?`, noun:'books' },
    { title:'Cans Collected', cats:['Room 1','Room 2','Room 3','Room 4'], q:c=>`How many cans did ${c} collect?`, noun:'cans' }
  ];
  M['g3.graphs'] = { name:'Bar graphs & picture graphs', unit:'g3u1', gen(R, lvl){
    const th = R.pick(GRAPH_THEMES);
    const cats = R.shuffle(th.cats.slice()).slice(0, 4);
    const usePicto = lvl === 1 || (lvl === 3 && R.chance(0.5));
    const key = lvl === 1 ? R.pick([1,2,2]) : (usePicto ? R.pick([2,5,10]) : 1);
    const unitStep = usePicto ? key : (lvl === 3 ? R.pick([2,5]) : 1);
    const maxIcons = 8;
    const vals = cats.map(() => R.int(1, usePicto ? maxIcons : (lvl === 3 ? 10 : 15)) * unitStep);
    // make values distinct so "how many more" is never zero
    for (let i = 1; i < vals.length; i++) while (vals.slice(0, i).includes(vals[i])) vals[i] = R.int(1, usePicto ? maxIcons : (lvl === 3 ? 10 : 15)) * unitStep;
    const model = usePicto ? { type:'picto', title:th.title, cats, vals, key } : { type:'bars', title:th.title, cats, vals };
    const readStep = (i) => usePicto
      ? `${cats[i]} has ${vals[i] / key} ${pl(vals[i] / key, 'pictures')}. ${vals[i] / key} × ${key} = ${vals[i]}.`
      : `Go to the top of the ${cats[i]} bar and look across: ${vals[i]}.`;
    const keyStep = usePicto ? [`Look at the key: each picture means ${key}.`] : [];
    const type = lvl === 1 ? R.pick(['one','one','more']) : lvl === 2 ? R.pick(['one','more','more','total2']) : R.pick(['more','fewer','total']);
    if (type === 'one'){
      const i = R.int(0, 3);
      return { q:th.q(cats[i]), kind:'num', a:vals[i], model,
        hint: usePicto ? `Count the pictures for ${cats[i]}. Remember what one picture is worth.` : `Find the end of the ${cats[i]} bar and look straight across to the numbers.`,
        steps: [...keyStep, readStep(i), `So the answer is ${vals[i]}.`] };
    }
    if (type === 'more' || type === 'fewer'){
      let i = R.int(0, 3), j = R.int(0, 3); while (j === i) j = R.int(0, 3);
      if (vals[i] < vals[j]) [i, j] = [j, i];
      const d = vals[i] - vals[j];
      const q = type === 'more' ? `How many more ${th.noun} for ${cats[i]} than for ${cats[j]}?` : `How many fewer ${th.noun} for ${cats[j]} than for ${cats[i]}?`;
      return { q, kind:'num', a:d, model,
        hint: `Find both numbers first. Then take the smaller one away from the bigger one.`,
        steps: [...keyStep, readStep(i), readStep(j), `Subtract: ${vals[i]} − ${vals[j]} = ${d}. The difference is ${d}.`].slice(-5) };
    }
    if (type === 'total2'){
      let i = R.int(0, 3), j = R.int(0, 3); while (j === i) j = R.int(0, 3);
      const s = vals[i] + vals[j];
      return { q:`How many ${th.noun} for ${cats[i]} and ${cats[j]} together?`, kind:'num', a:s, model,
        hint: `"Together" means add. Read both, then add them.`,
        steps: [...keyStep, readStep(i), readStep(j), `Add: ${vals[i]} + ${vals[j]} = ${s}.`].slice(-5) };
    }
    const tot = vals.reduce((x, y) => x + y, 0);
    return { q:`How many ${th.noun} in all on the graph?`, kind:'num', a:tot, model,
      hint: `Read the number for each one, then add all four.`,
      steps: [...keyStep, `Read each one: ${cats.map((c, i) => `${c} ${vals[i]}`).join(', ')}.`, `Add them: ${vals.join(' + ')} = ${tot}.`, `There are ${tot} in all.`] };
  }};

  // ---------- Unit 2: place value, compare, round, add/subtract, estimate ----------
  M['g3.placevalue'] = { name:'Place value', unit:'g3u2', gen(R, lvl){
    const digs = lvl === 1 ? 3 : 4;
    const mode = lvl === 1 ? R.pick(['blocks','value']) : lvl === 2 ? R.pick(['blocks','value','expanded']) : R.pick(['missing','regroup','value']);
    const mk = () => { let n; do { n = R.int(POW[digs-1], POW[digs] - 1); } while (false); return n; };
    if (mode === 'blocks'){
      const n = mk(), d = digitsOf(n);
      const parts = []; for (let i = d.length - 1; i >= 0; i--) parts.push({ i, v: d[i] * POW[i] });
      return { q:'What number do the base-ten blocks show?', kind:'num', a:n,
        model:{ type:'blocks', th:d[3] || 0, h:d[2] || 0, t:d[1] || 0, o:d[0] || 0 },
        hint:'Count each kind of block: big cubes are thousands, flats are hundreds, rods are tens, little cubes are ones.',
        steps:[ parts.map(p => `${d[p.i]} ${pl(d[p.i], PLACE[p.i])} = ${fmt(p.v)}`).join(', ') + '.', `Put them together: ${parts.map(p => fmt(p.v)).join(' + ')}.`, `The number is ${fmt(n)}.`] };
    }
    if (mode === 'value'){
      let n, d, p;
      do { n = mk(); d = digitsOf(n); p = R.int(0, d.length - 1); } while (d[p] === 0 || d.filter(x => x === d[p]).length > 1);
      const v = d[p] * POW[p];
      return { q:`In ${fmt(n)}, what is the value of the digit ${d[p]}?`, kind:'num', a:v,
        hint:'Find the digit, then say which place it is in: ones, tens, hundreds or thousands.',
        steps:[ `Find the ${d[p]} in ${fmt(n)}.`, `It is in the ${PLACE[p]} place.`, `${d[p]} ${pl(d[p], PLACE[p])} = ${fmt(v)}. So its value is ${fmt(v)}.`] };
    }
    if (mode === 'expanded'){
      let n, d; do { n = mk(); d = digitsOf(n); } while (new Set(d.filter(x => x)).size < 3);
      const terms = d.map((x, i) => x * POW[i]).reverse().filter(x => x);
      const ans = terms.map(fmt).join(' + ');
      const plain = d.slice().reverse().filter(x => x).join(' + ');
      const shift = d.map((x, i) => i > 0 ? x * POW[i-1] : x).reverse().filter(x => x).map(fmt).join(' + ');
      const swapped = terms.length >= 3 ? [terms[0], terms[2], terms[1], ...terms.slice(3)] : terms;
      const wrongOrderVal = terms.map((t, k) => k === 1 ? t * 10 : t).map(fmt).join(' + ');
      return { q:`Which is the expanded form of ${fmt(n)}?`, kind:'choice', a:ans,
        choices: choices(ans, [plain, shift, wrongOrderVal]),
        hint:'Expanded form shows what each digit is worth, added together.',
        steps:[ d.slice().reverse().map((x, k) => x ? `${x} → ${fmt(x * POW[d.length - 1 - k])}` : null).filter(Boolean).join(', ') + '.', `Add the values: ${ans}.`, `So the expanded form is ${ans}.`] };
    }
    if (mode === 'missing'){
      let n, d, p; do { n = mk(); d = digitsOf(n); p = R.int(0, 3); } while (d[p] === 0);
      const terms = d.map((x, i) => ({ i, v: x * POW[i] })).reverse().filter(t => t.v);
      const shown = terms.map(t => t.i === p ? '?' : fmt(t.v)).join(' + ');
      const v = d[p] * POW[p];
      return { q:`${shown} = ${fmt(n)}. What number goes in the ?`, kind:'num', a:v,
        hint:`Look at the ${PLACE[p]} digit in ${fmt(n)}.`,
        steps:[ `The missing part is the ${PLACE[p]} part.`, `The ${PLACE[p]} digit of ${fmt(n)} is ${d[p]}.`, `${d[p]} ${pl(d[p], PLACE[p])} = ${fmt(v)}. So ? = ${fmt(v)}.`] };
    }
    // regroup: e.g. 2 thousands, 14 tens, 3 ones
    const th = R.int(1, 8), big = R.pick([1,2]); // which place gets more than 9
    const h = big === 2 ? R.int(10, 19) : R.int(0, 9);
    const t = big === 1 ? R.int(10, 19) : R.int(0, 9);
    const o = R.int(0, 9);
    const n = th * 1000 + h * 100 + t * 10 + o;
    return { q:`What number is ${th} ${pl(th, 'thousands')}, ${h} hundreds, ${t} tens, and ${o} ones?`, kind:'num', a:n,
      hint: big === 2 ? `${h} hundreds is more than 9 hundreds. 10 hundreds make 1 thousand.` : `${t} tens is more than 9 tens. 10 tens make 1 hundred.`,
      steps:[ `${th} ${pl(th, 'thousands')} = ${fmt(th * 1000)}`, `${h} hundreds = ${fmt(h * 100)} and ${t} tens = ${t * 10}`, `Add: ${fmt(th * 1000)} + ${fmt(h * 100)} + ${t * 10} + ${o} = ${fmt(n)}.`, `The number is ${fmt(n)}.`] };
  }};

  M['g3.compare'] = { name:'Compare & order numbers', unit:'g3u2', gen(R, lvl){
    if (lvl === 3 && R.chance(0.6)){
      // order: which is greatest / least, made from the same digits
      let d; do { d = [R.int(1, 9), R.int(0, 9), R.int(0, 9), R.int(0, 9)]; } while (new Set(d).size < 4);
      const nums = new Set(); let guard = 0;
      while (nums.size < 4 && guard++ < 200){ const s = R.shuffle(d.slice()); if (s[0] !== 0) nums.add(Number(s.join(''))); }
      const arr = [...nums];
      const most = R.chance(0.5);
      const a = most ? Math.max(...arr) : Math.min(...arr);
      const sorted = arr.slice().sort((x, y) => most ? y - x : x - y);
      return { q:`Which number is the ${most ? 'greatest' : 'least'}?`, kind:'choice', a:fmt(a), choices: choices(fmt(a), arr.filter(x => x !== a).map(fmt)),
        hint:'Start with the thousands digits. If they tie, look at the hundreds, then the tens.',
        steps:[ `Compare the thousands digits first.`, `If two tie, move right one place and compare again.`, `In order: ${sorted.map(fmt).join(', ')}.`, `The ${most ? 'greatest' : 'least'} is ${fmt(a)}.`] };
    }
    const digs = lvl === 1 ? 3 : 4;
    let a = R.int(POW[digs-1], POW[digs] - 1), b;
    if (R.chance(0.1)) b = a;
    else { const keep = R.int(1, digs - 1); // share the first `keep` digits so it is not too easy
      const head = Math.floor(a / POW[digs - keep]) * POW[digs - keep];
      do { b = head + R.int(0, POW[digs - keep] - 1); } while (b === a || b < POW[digs-1]); }
    const sym = a > b ? '>' : a < b ? '<' : '=';
    const da = digitsOf(a), db = digitsOf(b), steps = [];
    for (let i = digs - 1; i >= 0; i--){
      if (da[i] === db[i]){ steps.push(`${PLACE_CAP[i]}: ${da[i]} and ${db[i]} are the same.`); continue; }
      steps.push(`${PLACE_CAP[i]}: ${da[i]} ${da[i] > db[i] ? '>' : '<'} ${db[i]}. That decides it!`); break;
    }
    if (!steps.length) steps.push('Every digit is the same in every place.');
    const st = steps.length > 3 ? [steps[0] + ' ' + steps[1], ...steps.slice(2)] : steps;
    st.push(`So ${fmt(a)} ${sym} ${fmt(b)}.`);
    return { q:`Which symbol makes this true?  ${fmt(a)} ☐ ${fmt(b)}`, kind:'choice', a:sym, choices:['<','>','='],
      hint:'Compare from the left. The first place where the digits are different tells you which number is bigger.',
      steps: st };
  }};

  M['g3.round'] = { name:'Rounding', unit:'g3u2', gen(R, lvl){
    const P = lvl === 1 ? 10 : lvl === 2 ? 100 : R.pick([100, 1000, 1000]);
    let n;
    do {
      n = lvl === 1 ? R.int(11, 989) : lvl === 2 ? R.int(101, 999) : R.int(1001, 9989);
    } while (n % P === 0);
    const lo = Math.floor(n / P) * P, hi = lo + P, mid = lo + P / 2, a = roundTo(n, P);
    const word = P === 10 ? 'ten' : P === 100 ? 'hundred' : 'thousand';
    return { q:`Round ${fmt(n)} to the nearest ${word}.`, kind:'num', a,
      model:{ type:'numberline', min:lo, max:hi, step:P / 10, label:P / 2, points:[{ x:n, label:fmt(n) }] },
      hint:`Which two ${word}s is ${fmt(n)} between? Is it closer to the smaller one or the bigger one?`,
      steps:[ `${fmt(n)} is between ${fmt(lo)} and ${fmt(hi)}.`, `The halfway point is ${fmt(mid)}.`,
        n >= mid ? `${fmt(n)} is at or past ${fmt(mid)}, so round up.` : `${fmt(n)} is before ${fmt(mid)}, so round down.`,
        `${fmt(n)} rounds to ${fmt(a)}.`] };
  }};

  M['g3.addsub'] = { name:'Add & subtract', unit:'g3u2', gen(R, lvl){
    const add = R.chance(0.5);
    if (lvl < 3){
      let a, b;
      if (lvl === 1){
        if (add){ do { a = R.int(100, 899); b = R.int(15, 899); } while (a + b > 999 || ((a % 10) + (b % 10) < 10 && R.chance(0.7))); }
        else { do { a = R.int(200, 999); b = R.int(15, a - 1); } while ((a % 10) >= (b % 10) && R.chance(0.7)); }
      } else {
        if (add){ do { a = R.int(1000, 8999); b = R.int(150, 8999); } while (a + b > 9999); }
        else { a = R.int(1500, 9999); b = R.int(150, a - 1); }
      }
      const c = add ? a + b : a - b;
      const sym = add ? '+' : '−';
      const steps = add ? addSteps(a, b) : subSteps(a, b);
      steps.push(`So ${fmt(a)} ${sym} ${fmt(b)} = ${fmt(c)}.`);
      return { q:`What is ${fmt(a)} ${sym} ${fmt(b)}?`, kind:'num', a:c,
        hint: add ? 'Line up the places. Start with the ones. If a place adds to 10 or more, carry 1 to the next place.'
                  : 'Line up the places. Start with the ones. If the top digit is too small, regroup 1 from the next place.',
        steps };
    }
    const A = name(R);
    let a, b, q, clue;
    if (add){
      do { a = R.int(120, 4999); b = R.int(120, 4999); } while (a + b > 9999);
      const t = R.int(0, 2);
      q = t === 0 ? `${A} read ${fmt(a)} pages in the fall and ${fmt(b)} pages in the winter. How many pages did ${A} read in all?`
        : t === 1 ? `The school library has ${fmt(a)} books. It gets ${fmt(b)} new books. How many books does it have now?`
        : `${A} scored ${fmt(a)} points in a video game, then ${fmt(b)} more points. How many points in all?`;
      clue = t === 0 ? '"In all" means put together, so add.' : t === 1 ? '"Gets new books" means more, so add.' : '"More points ... in all" means add.';
    } else {
      a = R.int(800, 9999); b = R.int(120, a - 50);
      const t = R.int(0, 2);
      q = t === 0 ? `${A} had ${fmt(a)} stickers and gave away ${fmt(b)}. How many stickers are left?`
        : t === 1 ? `A plane flew ${fmt(a)} miles. A train went ${fmt(b)} miles. How many more miles did the plane go?`
        : `${A} needs ${fmt(a)} points to win a prize and has ${fmt(b)}. How many more points does ${A} need?`;
      clue = t === 0 ? '"Gave away ... left" means take away, so subtract.' : '"How many more" means find the difference, so subtract.';
    }
    const c = add ? a + b : a - b, sym = add ? '+' : '−';
    return { q, kind:'num', a:c,
      hint: add ? 'Are you putting groups together or taking away? Look for clue words.' : 'Are you putting groups together, taking away, or comparing? Look for clue words.',
      steps:[ clue, `Write it: ${fmt(a)} ${sym} ${fmt(b)}. Line up the places.`, `Work from the ones to the left${add ? ', carrying when needed' : ', regrouping when needed'}.`, `${fmt(a)} ${sym} ${fmt(b)} = ${fmt(c)}.`, `The answer is ${fmt(c)}.`] };
  }};

  // ---- Homework-spiral problem types (the class's weekly "November Spiral" sheets) ----
  M['g3.add3'] = { name:'Add three numbers', unit:'g3u2', gen(R, lvl){
    const hi = lvl === 1 ? 39 : lvl === 2 ? 69 : 99, lo = lvl === 3 ? 25 : 11;
    const a = R.int(lo, hi), b = R.int(lo, hi), c = R.int(lo, hi), s1 = a + b, t = s1 + c;
    return { q:`What is ${a} + ${b} + ${c}?`, kind:'num', a:t,
      hint: 'Add two numbers first, then add the third. Look for two ones digits that make 10!',
      steps:[`Add the first two: ${a} + ${b} = ${s1}.`, `Now add the third: ${s1} + ${c} = ${t}.`, `Check another way: add in any order and you get the same total.`, `${a} + ${b} + ${c} = ${t}.`] };
  }};

  // Subtracting across zeros, e.g. 400 − 38. The slip to catch: regrouping the hundreds but forgetting the tens become 9.
  M['g3.subzero'] = { name:'Subtract across zeros', unit:'g3u2', gen(R, lvl){
    let a, b;
    if (lvl === 1){ a = R.int(2, 9) * 100; do { b = R.int(12, 99); } while (b % 10 === 0); }
    else if (lvl === 2){ const H = R.int(3, 9), d = R.int(0, 6); a = H * 100 + d; do { b = R.int(101, a - 50); } while (b % 10 <= d || Math.floor(b / 10) % 10 === 0); }
    else { a = R.int(2, 9) * 1000 + R.pick([0, 0, R.int(1, 5)]); do { b = R.int(120, 999); } while (b % 10 <= a % 10); }
    const c = a - b, big = a >= 1000, da = digitsOf(a), db = digitsOf(b);
    // after regrouping across the zeros: the leading digit loses 1, every zero becomes 9, the ones get 10 more
    const rg = da.map((x, i) => i === 0 ? x + 10 : i === da.length - 1 ? x - 1 : 9);
    const names = big ? ['thousands', 'hundreds', 'tens', 'ones'] : ['hundreds', 'tens', 'ones'];
    const parts = rg.slice().reverse().map((x, i) => `${x} ${x === 1 ? names[i].replace(/s$/, '') : names[i]}`).join(', ');
    const steps = [`The ones digit is too small, and the place next to it is 0, so there is nothing to borrow there.`,
      `Go to the ${names[0]}: regroup ${fmt(a)} as ${parts}. It is still ${fmt(a)}! Every 0 becomes 9.`];
    for (let i = 0; i < da.length; i++){ const y = db[i] || 0; steps.push(`${PLACE_CAP[i]}: ${rg[i]} − ${y} = ${rg[i] - y}.`); }
    steps.push(`${fmt(a)} − ${fmt(b)} = ${fmt(c)}.  Check: ${fmt(c)} + ${fmt(b)} = ${fmt(a)} ✓`);
    const wrong = c + 10; // the answer you get if the tens never turn into 9
    return { q:`What is ${fmt(a)} − ${fmt(b)}?`, kind:'num', a:c,
      hint:`The zeros can't lend, so regroup from the ${names[0]}. Then each 0 becomes a 9. Watch out: the tens become 9, not 10! (A common slip gives ${fmt(wrong)}.)`,
      steps };
  }};

  M['g3.missing'] = { name:'Missing numbers & balance', unit:'g3u2', gen(R, lvl){
    const t = R.int(0, lvl === 1 ? 1 : 3);
    if (t === 0){ const a = R.int(6, 9), b = R.int(5, 9), s = a + b, c = 10, d = s - c;
      return { q:`What number goes in the box?  ${a} + ${b} = ${c} + ☐`, kind:'num', a:d,
        hint:'The equal sign means BOTH sides are worth the same. Find what the left side equals first.',
        steps:[`The = sign means the same amount on each side.`, `Left side: ${a} + ${b} = ${s}.`, `So ${c} + ☐ must also be ${s}.`, `${c} + ${d} = ${s}, so the box is ${d}.`] }; }
    if (t === 1){ const total = R.int(30, 99), x = R.int(11, total - 11), r = total - x;
      return { q:`What number goes in the box?  ${total} − ☐ = ${r}`, kind:'num', a:x,
        hint:`What do you take away from ${total} to get ${r}? Think: ${r} + ☐ = ${total}.`,
        steps:[`Turn it around: ${r} + ☐ = ${total}.`, `${total} − ${r} = ${x}.`, `Check: ${total} − ${x} = ${r} ✓`] }; }
    if (t === 2){ const a = R.int(120, 600), x = R.int(25, 300), b = a + x;
      return { q:`What number goes in the box?  ${a} + ☐ = ${b}`, kind:'num', a:x,
        hint:`Subtract to find the missing part: ${b} − ${a}.`, steps:[`The missing part is the total minus the part you know.`, `${b} − ${a} = ${x}.`, `Check: ${a} + ${x} = ${b} ✓`] }; }
    const a = R.int(15, 60), b = R.int(15, 60), c = R.int(10, Math.min(a + b - 5, 70)), d = a + b - c;
    return { q:`What number goes in the box?  ${a} + ${b} = ${c} + ☐`, kind:'num', a:d,
      hint:'Both sides of = are worth the same. Find the left side, then ask what you add to the right side.',
      steps:[`Left side: ${a} + ${b} = ${a + b}.`, `So ${c} + ☐ = ${a + b}.`, `${a + b} − ${c} = ${d}.`, `The box is ${d}.`] };
  }};

  M['g3.twostep'] = { name:'Two-step word problems', unit:'g3u2', gen(R, lvl){
    const [A, B] = names2(R), max = lvl === 1 ? 30 : lvl === 2 ? 80 : 400;
    const t = R.int(0, 2);
    if (t === 0){ const x = R.int(5, Math.floor(max / 3)), y = R.int(5, Math.floor(max / 3)), used = R.int(3, x + y - 2), left = x + y - used;
      return { q:`${A} peeled ${x} potatoes and ${B} peeled ${y}. Their mom used ${used} to make mashed potatoes. How many peeled potatoes are left over?`, kind:'num', a:left, unit:'potatoes',
        hint:'Two steps! First find how many were peeled in all. Then take away the ones that were used.',
        steps:[`Step 1: peeled in all: ${x} + ${y} = ${x + y}.`, `Step 2: take away the ones used: ${x + y} − ${used} = ${left}.`, `${left} potatoes are left over.`] }; }
    if (t === 1){ const total = R.int(Math.floor(max / 2), max), m = R.int(5, Math.floor(total / 3)), w = R.int(5, Math.floor(total / 3)), left = total - m - w;
      return { q:`There were ${total} rolls in a basket. The kids ate ${m} rolls and the grown-ups ate ${w} rolls. How many rolls were left in the basket?`, kind:'num', a:left, unit:'rolls',
        hint:'Two steps! Find how many were eaten in all, then subtract from the total. (Or subtract one group at a time.)',
        steps:[`Step 1: rolls eaten: ${m} + ${w} = ${m + w}.`, `Step 2: ${total} − ${m + w} = ${left}.`, `${left} rolls were left.`] }; }
    const have = R.int(10, Math.floor(max / 2)), more = R.int(5, Math.floor(max / 3)), gave = R.int(3, have + more - 2), left = have + more - gave;
    return { q:`${A} had ${have} cans for the food drive. ${A} collected ${more} more, then gave ${gave} to the school. How many cans does ${A} have now?`, kind:'num', a:left, unit:'cans',
      hint:'Two steps! First add the cans collected. Then subtract the ones given away.',
      steps:[`Step 1: ${have} + ${more} = ${have + more}.`, `Step 2: ${have + more} − ${gave} = ${left}.`, `${A} has ${left} cans now.`] };
  }};

  M['g3.units'] = { name:'Choose the unit', unit:'g3u8', gen(R, lvl){
    const L = [['a potato', 'inches', 'feet'], ['a pencil', 'inches', 'yards'], ['your classroom', 'feet', 'inches'], ['a soccer field', 'yards', 'inches'],
      ['the drive to Grandma\'s house', 'miles', 'feet'], ['a crayon', 'centimeters', 'meters'], ['a swimming pool', 'meters', 'centimeters'], ['a bookshelf', 'feet', 'miles'],
      ['a ladybug', 'centimeters', 'meters'], ['a hallway at school', 'yards', 'inches'], ['a school bus', 'feet', 'inches'], ['your thumb', 'inches', 'feet']];
    const W = [['a turkey', 'pounds', 'ounces'], ['a slice of bread', 'ounces', 'pounds'], ['a bathtub of water', 'gallons', 'cups'], ['a glass of milk', 'cups', 'gallons'], ['a bag of apples', 'pounds', 'ounces']];
    const it = lvl === 1 ? R.pick(L) : R.pick(R.chance(.7) ? L : W), word = L.includes(it) ? 'measure the length of' : 'measure';
    return { q:`Would you ${word} ${it[0]} in ${R.chance(.5) ? it[1] + ' or ' + it[2] : it[2] + ' or ' + it[1]}?`, kind:'choice', a:it[1], choices:[it[1], it[2]],
      hint:'Picture the object. Use small units for small things and big units for big things.',
      steps:[`Think about how big ${it[0]} is.`, `${it[1][0].toUpperCase() + it[1].slice(1)} make sense for something that size.`, `So use ${it[1]}.`] };
  }};

  // the homework sheet always rounds to the nearest hundred
  M['g3.round100'] = { name:'Round to the nearest hundred', unit:'g3u2', gen(R, lvl){ return M['g3.round'].gen(R, lvl === 3 ? 3 : 2); }};

  M['g3.estimate'] = { name:'Estimate sums & differences', unit:'g3u2', gen(R, lvl){
    const P = lvl === 1 ? 10 : lvl === 2 ? 100 : R.pick([100, 1000]);
    const word = P === 10 ? 'ten' : P === 100 ? 'hundred' : 'thousand';
    const add = R.chance(0.5);
    const rng = lvl === 1 ? [12, 98] : lvl === 2 ? [120, 980] : (P === 100 ? [1200, 4800] : [1200, 8900]);
    let a, b;
    do { a = R.int(rng[0], rng[1]); b = R.int(rng[0], rng[1]); if (!add && b > a) [a, b] = [b, a]; }
    while (a % P === 0 || b % P === 0 || (add && roundTo(a, P) + roundTo(b, P) > 9999) || (!add && roundTo(a, P) === roundTo(b, P)));
    const ra = roundTo(a, P), rb = roundTo(b, P), e = add ? ra + rb : ra - rb, sym = add ? '+' : '−';
    return { q:`Estimate ${fmt(a)} ${sym} ${fmt(b)} by rounding each number to the nearest ${word}.`, kind:'num', a:e,
      hint:`First round each number to the nearest ${word}. Then ${add ? 'add' : 'subtract'} the rounded numbers.`,
      steps:[ `Round ${fmt(a)} → ${fmt(ra)}.`, `Round ${fmt(b)} → ${fmt(rb)}.`, `${fmt(ra)} ${sym} ${fmt(rb)} = ${fmt(e)}.`, `The estimate is about ${fmt(e)}.`] };
  }};

  // ---------- Unit 3: multiplication & division ----------
  // strategy steps for f × n (f is the "strategy" factor)
  function factSteps(f, n){
    const p = f * n;
    switch (f){
      case 0: return [`0 groups of ${n} (or ${n} groups of 0) is nothing at all.`, `Anything times 0 is 0. So the answer is ${p}.`];
      case 1: return [`1 group of ${n} is just ${n}.`, `Anything times 1 stays the same. So the answer is ${p}.`];
      case 2: return [`× 2 is a double.`, `${n} + ${n} = ${p}. So the answer is ${p}.`];
      case 3: return [`× 3 = double, then one more group.`, `Double ${n}: ${n} + ${n} = ${2*n}.`, `One more ${n}: ${2*n} + ${n} = ${p}. So the answer is ${p}.`];
      case 4: return [`× 4 = double, then double again.`, `Double ${n}: ${2*n}.`, `Double again: ${2*n} + ${2*n} = ${p}. So the answer is ${p}.`];
      case 5: return [`Count by 5s, ${n} times.`, n ? `${Array.from({length:n}, (_, i) => 5*(i+1)).join(', ')}.` : `0 fives is 0.`, `So the answer is ${p}.`];
      case 6: return [`× 6 = × 5, then one more group.`, `5 × ${n} = ${5*n}.`, `${5*n} + ${n} = ${p}. So the answer is ${p}.`];
      case 7: return [`Break 7 into 5 + 2.`, `5 × ${n} = ${5*n} and 2 × ${n} = ${2*n}.`, `${5*n} + ${2*n} = ${p}. So the answer is ${p}.`];
      case 8: return [`× 8 = double, double, double!`, `${n} → ${2*n} → ${4*n}.`, `Double once more: ${4*n} + ${4*n} = ${p}. So the answer is ${p}.`];
      case 9: return [`× 9 trick: do × 10, then take one group away.`, `10 × ${n} = ${10*n}.`, `${10*n} − ${n} = ${p}. So the answer is ${p}.`];
      case 10: return [`× 10: put a 0 on the end.`, `${n} becomes ${p}. So the answer is ${p}.`];
    }
  }
  function factHint(f, n){
    return ({0:'What happens when you have zero groups?', 1:'One group of a number is just that number.', 2:'Times 2 is a double. What is the number plus itself?',
      3:'Double it, then add one more group.', 4:'Double it, then double that again.', 5:'Count by 5s. Or think: half of times 10.',
      6:'Do times 5 first, then add one more group.', 7:'Break 7 into 5 and 2. Do both and add.', 8:'Double, double, double!',
      9:'Do times 10, then take away one group.', 10:'Times 10 puts a 0 on the end.'})[f];
  }
  const FACT_SETS = { 1:[0,1,2,5,10], 2:[0,1,2,3,4,5,6,10], 3:[0,1,2,3,4,5,6,7,8,9,10] };
  M['g3.facts'] = { name:'Multiplication & division facts', unit:'g3u3', warm:true, gen(R, lvl){
    const set = FACT_SETS[lvl];
    const hard = lvl === 2 ? [3,4,6] : lvl === 3 ? [7,8,9] : set;
    if (lvl === 3 && R.chance(0.45)){
      const d = R.int(1, 10), q = R.int(0, 10), p = d * q;
      const f = q === 0 ? 0 : (d >= 3 && d <= 9 ? d : q); // a strategy factor for "think multiplication"
      return { q:`What is ${p} ÷ ${d}?`, kind:'num', a:q, fact:`${p}/${d}`,
        hint:`Think of the fact family: ${d} × what = ${p}?`,
        steps:[ `Division asks: ${d} times what makes ${p}?`, `Try it: ${d} × ${q} = ${p}.`, `Fact family: ${d} × ${q} = ${p}, so ${p} ÷ ${d} = ${q}.`] };
    }
    const f = R.chance(0.7) ? R.pick(hard) : R.pick(set);
    const n = R.int(0, 10);
    const [x, y] = R.chance(0.5) ? [f, n] : [n, f];
    return { q:`What is ${x} × ${y}?`, kind:'num', a:x * y, fact:`${x}x${y}`,
      hint: factHint(f, n), steps: factSteps(f, n) };
  }};

  M['g3.arrays'] = { name:'Arrays & equal groups', unit:'g3u3', gen(R, lvl){
    if (lvl === 1){
      if (R.chance(0.5)){
        const g = R.int(2, 5), e = R.int(2, 5), p = g * e;
        return { q:`There are ${g} equal groups with ${e} dots in each. How many dots in all?`, kind:'num', a:p,
          model:{ type:'groups', groups:g, each:e },
          hint:'Count the dots in one group. Then skip count once for each group.',
          steps:[ `${g} groups of ${e} means ${g} × ${e}.`, `Skip count by ${e}: ${Array.from({length:g}, (_, i) => e*(i+1)).join(', ')}.`, `${g} × ${e} = ${p} dots.`] };
      }
      const r = R.int(2, 5), c = R.int(2, 6), p = r * c;
      return { q:'How many dots are in this array?', kind:'num', a:p, model:{ type:'array', rows:r, cols:c },
        hint:'Count the dots in one row. Then count how many rows.',
        steps:[ `There are ${r} rows.`, `Each row has ${c} dots.`, `${r} rows of ${c}: ${r} × ${c} = ${p} dots.`] };
    }
    if (lvl === 2){
      const r = R.int(2, 6), c = R.int(3, 9), p = r * c;
      const ans = `${r} × ${c} = ${p}`;
      return { q:'Which multiplication sentence matches this array?', kind:'choice', a:ans,
        choices: choices(ans, [`${r} + ${c} = ${r + c}`, `${r} × ${c+1} = ${r*(c+1)}`, `${r+1} × ${c} = ${(r+1)*c}`, `${r} × ${c-1} = ${r*(c-1)}`]),
        model:{ type:'array', rows:r, cols:c },
        hint:'Rows × dots in each row = total. Count carefully!',
        steps:[ `Count the rows: ${r}.`, `Count the dots in one row: ${c}.`, `Rows × dots in a row: ${ans}.`] };
    }
    const r = R.int(3, 10), c = R.int(3, 10), p = r * c;
    if (R.chance(0.5)){
      return { q:`${p} dots are put in ${r} equal rows. How many dots are in each row?`, kind:'num', a:c,
        model:{ type:'array', rows:r, cols:c },
        hint:`Think: ${r} × what = ${p}?`,
        steps:[ `Equal rows means divide: ${p} ÷ ${r}.`, `Think multiplication: ${r} × ? = ${p}.`, `${r} × ${c} = ${p}, so there are ${c} in each row.`] };
    }
    return { q:`An array has ${r} rows with ${c} in each row. How many in all?`, kind:'num', a:p,
      model:{ type:'array', rows:r, cols:c },
      hint:'Rows times how many in each row. Use a fact you know to help.',
      steps:[ `${r} rows of ${c} means ${r} × ${c}.`, ...factSteps(c >= 3 && c <= 9 ? c : r, c >= 3 && c <= 9 ? r : c).slice(-2)] };
  }};

  M['g3.inverse'] = { name:'Missing factors & fact families', unit:'g3u3', gen(R, lvl){
    const set = lvl === 1 ? [2,5,10] : lvl === 2 ? [2,3,4,5,6,10] : [2,3,4,5,6,7,8,9,10];
    const f = R.pick(set), n = R.int(1, 10), p = f * n;
    const mode = lvl < 3 ? R.pick(['mf','mf','div']) : R.pick(['mf','dividend','family','div']);
    if (mode === 'mf'){
      const left = R.chance(0.5);
      const q = left ? `${f} × ? = ${p}. What is the missing number?` : `? × ${f} = ${p}. What is the missing number?`;
      return { q, kind:'num', a:n, hint:`Count by ${f}s until you reach ${p}. How many jumps?`,
        steps:[ `Count by ${f}s: ${Array.from({length:n}, (_, i) => f*(i+1)).join(', ')}.`, `That took ${n} jumps.`, `${f} × ${n} = ${p}, so ? = ${n}.`] };
    }
    if (mode === 'div'){
      return { q:`${f} × ${n} = ${p}. So ${p} ÷ ${f} = ?`, kind:'num', a:n, hint:'Multiplication and division are in the same fact family. Use the fact you were given!',
        steps:[ `${p} ÷ ${f} asks: ${f} times what is ${p}?`, `We know ${f} × ${n} = ${p}.`, `So ${p} ÷ ${f} = ${n}.`] };
    }
    if (mode === 'dividend'){
      return { q:`? ÷ ${f} = ${n}. What is the missing number?`, kind:'num', a:p, hint:`Undo the division: multiply ${n} × ${f}.`,
        steps:[ `If ? ÷ ${f} = ${n}, then ${n} × ${f} = ?`, `${n} × ${f} = ${p}.`, `So ? = ${p}.`] };
    }
    let a = f, b = n; if (a === b) b = n === 10 ? 9 : n + 1;
    const pp = a * b;
    const ans = `${pp} ÷ ${b} = ${a}`;
    return { q:`Which fact is in the same family as ${a} × ${b} = ${pp}?`, kind:'choice', a:ans,
      choices: choices(ans, [`${pp} ÷ ${a} = ${b + 1}`, `${a} + ${b} = ${a + b}`, `${pp} − ${b} = ${pp - b}`, `${pp} ÷ ${b + 1} = ${a}`]),
      hint:'A fact family uses the same three numbers. Two multiply, two divide.',
      steps:[ `The three numbers are ${a}, ${b} and ${pp}.`, `Family: ${a} × ${b} = ${pp}, ${b} × ${a} = ${pp}, ${pp} ÷ ${a} = ${b}, ${pp} ÷ ${b} = ${a}.`, `The match is ${ans}.`] };
  }};

  M['g3.wordmd'] = { name:'Multiply & divide word problems', unit:'g3u3', gen(R, lvl){
    const A = name(R);
    if (lvl === 3){
      const t = R.int(0, 3);
      if (t === 0){
        const g = R.int(3, 9), e = R.int(3, 9), tot = g * e, k = R.int(2, tot - 2), a = tot - k;
        return { q:`${A} buys ${g} packs of stickers with ${e} stickers in each pack. Then ${A} gives away ${k}. How many stickers are left?`, kind:'num', a,
          hint:'Two steps! First find how many stickers in all. Then take away.',
          steps:[ `Step 1: ${g} packs of ${e}: ${g} × ${e} = ${tot}.`, `Step 2: gives away ${k}: ${tot} − ${k} = ${a}.`, `${A} has ${a} stickers left.`] };
      }
      if (t === 1){
        const d = R.int(2, 6), q = R.int(2, 9), k = R.int(1, 9), p = d * q + k;
        return { q:`${A} has ${p} cookies, eats ${k}, then shares the rest equally among ${d} friends. How many cookies does each friend get?`, kind:'num', a:q,
          hint:'Two steps! First find how many are left to share. Then divide.',
          steps:[ `Step 1: ${p} − ${k} = ${p - k} cookies to share.`, `Step 2: ${p - k} ÷ ${d}. Think ${d} × ? = ${p - k}.`, `${d} × ${q} = ${p - k}, so each friend gets ${q}.`] };
      }
      if (t === 2){
        const g = R.int(3, 9), e = R.int(3, 10), k = R.int(2, 15), a = g * e + k;
        return { q:`${A} has ${g} boxes of pencils with ${e} in each box, plus ${k} loose pencils. How many pencils in all?`, kind:'num', a,
          hint:'First find the pencils in the boxes. Then add the loose ones.',
          steps:[ `Step 1: ${g} × ${e} = ${g * e} pencils in boxes.`, `Step 2: ${g * e} + ${k} = ${a}.`, `${A} has ${a} pencils in all.`] };
      }
      const c = R.int(2, 9), n = R.int(2, 9), pay = c * n < 50 ? 50 : 100, a = pay - c * n;
      return { q:`Tickets cost $${c} each. ${A} buys ${n} tickets and pays with $${pay}. How much change does ${A} get?`, kind:'num', a, unit:'dollars',
        hint:'First find the cost of all the tickets. Then find the change.',
        steps:[ `Step 1: ${n} × $${c} = $${c * n}.`, `Step 2: $${pay} − $${c * n} = $${a}.`, `${A} gets $${a} in change.`] };
    }
    const set = lvl === 1 ? [2,3,4,5,10] : [2,3,4,5,6,7,8,9,10];
    const f = R.pick(set), n = R.int(lvl === 1 ? 1 : 2, lvl === 1 ? 5 : 10), p = f * n;
    const t = R.int(0, 5);
    if (t === 0) return { q:`${A} has ${n} bags. Each bag has ${f} marbles. How many marbles in all?`, kind:'num', a:p,
      model: (n <= 6 && f <= 6) ? { type:'groups', groups:n, each:f } : undefined,
      hint:'Equal groups! How many groups, and how many in each?',
      steps:[ `${n} groups of ${f} means ${n} × ${f}.`, `${n} × ${f} = ${p}.`, `There are ${p} marbles.`] };
    if (t === 1) return { q:`There are ${n} rows of chairs with ${f} chairs in each row. How many chairs?`, kind:'num', a:p,
      model:{ type:'array', rows:n, cols:f },
      hint:'Rows times chairs in each row.',
      steps:[ `${n} rows of ${f}: ${n} × ${f}.`, `${n} × ${f} = ${p}.`, `There are ${p} chairs.`] };
    if (t === 2){ const leg = R.pick([['spiders',8],['cats',4],['ants',6],['birds',2]]); const k = leg[1] > 5 && lvl === 1 ? 2 : n; const tot = k * leg[1];
      return { q:`One of the ${leg[0]} has ${leg[1]} legs. How many legs do ${k} ${leg[0]} have?`, kind:'num', a:tot,
        hint:`Each one has ${leg[1]} legs. Add ${leg[1]} for each one, or multiply.`,
        steps:[ `${k} groups of ${leg[1]} legs: ${k} × ${leg[1]}.`, `${k} × ${leg[1]} = ${tot}.`, `${k} ${leg[0]} have ${tot} legs.`] }; }
    if (t === 3) return { q:`${A} shares ${p} cookies equally among ${f} friends. How many cookies does each friend get?`, kind:'num', a:n,
      hint:`Share equally means divide. Think: ${f} × what = ${p}?`,
      steps:[ `Share equally: ${p} ÷ ${f}.`, `Think: ${f} × ? = ${p}. ${f} × ${n} = ${p}.`, `Each friend gets ${n} cookies.`] };
    if (t === 4) return { q:`${p} students make teams of ${f}. How many teams are there?`, kind:'num', a:n,
      hint:`How many groups of ${f} fit in ${p}?`,
      steps:[ `Teams of ${f}: ${p} ÷ ${f}.`, `Count by ${f}s to ${p}: that is ${n} jumps.`, `There are ${n} teams.`] };
    return { q:`${A} puts ${p} crayons into boxes with ${f} in each box. How many boxes does ${A} fill?`, kind:'num', a:n,
      hint:`Divide: how many ${f}s make ${p}?`,
      steps:[ `${p} ÷ ${f} = ?`, `${f} × ${n} = ${p}.`, `${A} fills ${n} boxes.`] };
  }};

  // ---------- Unit 4: geometry ----------
  const POLY = [
    { shape:'triangle', sides:3, nm:'Triangle' }, { shape:'right-triangle', sides:3, nm:'Triangle' },
    { shape:'square', sides:4, nm:'Quadrilateral' }, { shape:'rectangle', sides:4, nm:'Quadrilateral' },
    { shape:'rhombus', sides:4, nm:'Quadrilateral' }, { shape:'parallelogram', sides:4, nm:'Quadrilateral' },
    { shape:'trapezoid', sides:4, nm:'Quadrilateral' }, { shape:'irregular-quad', sides:4, nm:'Quadrilateral' },
    { shape:'pentagon', sides:5, nm:'Pentagon' }, { shape:'irregular-pentagon', sides:5, nm:'Pentagon' },
    { shape:'hexagon', sides:6, nm:'Hexagon' }, { shape:'irregular-hexagon', sides:6, nm:'Hexagon' },
    { shape:'heptagon', sides:7, nm:'Heptagon' }, { shape:'octagon', sides:8, nm:'Octagon' }
  ];
  const BY_SIDES = { 3:'Triangle', 4:'Quadrilateral', 5:'Pentagon', 6:'Hexagon', 7:'Heptagon', 8:'Octagon' };
  const NAME_TIP = { 3:'tri- means 3', 4:'quad- means 4', 5:'penta- means 5', 6:'hexa- means 6', 7:'hepta- means 7', 8:'octa- means 8 (like an octopus!)' };
  M['g3.polygons'] = { name:'Polygons', unit:'g3u4', gen(R, lvl){
    if (lvl === 1){
      const p = R.pick(POLY), v = R.chance(0.35);
      return { q:`How many ${v ? 'vertices (corners)' : 'sides'} does this polygon have?`, kind:'num', a:p.sides, model:{ type:'polygon', shape:p.shape },
        hint:`Put your finger on one ${v ? 'corner' : 'side'} and count around. Stop when you get back to where you started.`,
        steps:[ `Start at the top and go around.`, `Count each ${v ? 'corner' : 'side'} once.`, `It has ${p.sides} ${v ? 'vertices' : 'sides'}.`] };
    }
    if (lvl === 2){
      const p = R.pick(POLY), ans = p.nm;
      const ds = [p.sides - 1, p.sides + 1, p.sides + 2, p.sides - 2].filter(s => BY_SIDES[s]).map(s => BY_SIDES[s]);
      return { q:'What is the name of this polygon?', kind:'choice', a:ans, choices: choices(ans, ds), model:{ type:'polygon', shape:p.shape },
        hint:'Count the sides first. Then match the number to the name.',
        steps:[ `Count the sides: ${p.sides}.`, `${NAME_TIP[p.sides]}.`, `A polygon with ${p.sides} sides is a ${ans.toLowerCase()}.`] };
    }
    const t = R.int(0, 2);
    if (t === 0){
      const s = R.int(3, 8), ans = BY_SIDES[s];
      const ds = [s - 1, s + 1, s + 2, s - 2].filter(x => BY_SIDES[x]).map(x => BY_SIDES[x]);
      return { q:`A polygon has ${s} vertices. What is it called?`, kind:'choice', a:ans, choices: choices(ans, ds),
        hint:'A polygon has the same number of vertices as sides.',
        steps:[ `Every side ends at a corner, so ${s} vertices means ${s} sides.`, `${NAME_TIP[s]}.`, `It is a ${ans.toLowerCase()}.`] };
    }
    if (t === 1){
      let a = R.int(3, 8), b = R.int(3, 8); while (a === b) b = R.int(3, 8); if (a < b) [a, b] = [b, a];
      return { q:`How many more sides does a ${BY_SIDES[a].toLowerCase()} have than a ${BY_SIDES[b].toLowerCase()}?`, kind:'num', a:a - b,
        hint:'Figure out how many sides each shape has first.',
        steps:[ `A ${BY_SIDES[a].toLowerCase()} has ${a} sides.`, `A ${BY_SIDES[b].toLowerCase()} has ${b} sides.`, `${a} − ${b} = ${a - b} more sides.`] };
    }
    const s = R.int(3, 8), k = R.int(2, 4);
    return { q:`How many sides do ${k} ${BY_SIDES[s].toLowerCase()}s have in all?`, kind:'num', a:k * s,
      hint:`How many sides does one ${BY_SIDES[s].toLowerCase()} have? Then think of ${k} groups of that.`,
      steps:[ `One ${BY_SIDES[s].toLowerCase()} has ${s} sides.`, `${k} of them: ${k} × ${s} = ${k * s}.`, `That is ${k * s} sides in all.`] };
  }};

  // quadrilaterals: names each shape truthfully also has (inclusive), so they are never offered as wrong answers
  const QUAD_ALSO = { Square:['Rectangle','Rhombus','Parallelogram'], Rectangle:['Parallelogram'], Rhombus:['Parallelogram'], Parallelogram:[], Trapezoid:[] };
  const QUAD_SHAPE = { Square:'square', Rectangle:'rectangle', Rhombus:'rhombus', Parallelogram:'parallelogram', Trapezoid:'trapezoid' };
  const QUAD_DESC = { Square:'4 equal sides and 4 right angles', Rectangle:'4 right angles and 2 pairs of equal sides',
    Rhombus:'4 equal sides; its angles do not have to be right angles', Parallelogram:'2 pairs of parallel sides',
    Trapezoid:'only 1 pair of parallel sides' };
  const QUAD_ATTR = [
    { q:'Which shape has 4 right angles but not all sides equal?', a:'Rectangle', ds:['Square','Rhombus','Trapezoid'], why:'Square has all sides equal, so it is out. Rhombus and trapezoid do not have 4 right angles.' },
    { q:'Which shape has 4 equal sides and 4 right angles?', a:'Square', ds:['Rhombus','Rectangle','Trapezoid'], why:'A rhombus has equal sides but may not have right angles. A rectangle may not have equal sides.' },
    { q:'Which shape has 4 equal sides but no right angles?', a:'Rhombus', ds:['Square','Rectangle','Trapezoid'], why:'A square has right angles, so it is out.' },
    { q:'Which shape has only one pair of parallel sides?', a:'Trapezoid', ds:['Square','Rectangle','Parallelogram'], why:'Squares, rectangles and parallelograms all have 2 pairs of parallel sides.' },
    { q:'Which shape has 2 pairs of parallel sides, no right angles, and sides that are not all equal?', a:'Parallelogram', ds:['Rectangle','Square','Trapezoid'], why:'Rectangles and squares have right angles. A trapezoid has only 1 pair of parallel sides.' }
  ];
  const QUAD_COUNT = [
    { shape:'rectangle', q:'How many right angles does this rectangle have?', a:4, how:'Every corner of a rectangle is a square corner.' },
    { shape:'square', q:'How many right angles does this square have?', a:4, how:'Every corner of a square is a square corner.' },
    { shape:'trapezoid', q:'How many pairs of parallel sides does this trapezoid have?', a:1, how:'Only the top and bottom never meet.' },
    { shape:'parallelogram', q:'How many pairs of parallel sides does this parallelogram have?', a:2, how:'Top and bottom are parallel, and so are the two slanted sides.' },
    { shape:'rhombus', q:'How many sides of this rhombus are equal in length?', a:4, how:'All four sides of a rhombus are the same length.' },
    { shape:'rhombus', q:'How many right angles does this rhombus have?', a:0, how:'Its corners are slanted, not square corners.' },
    { shape:'parallelogram', q:'How many right angles does this parallelogram have?', a:0, how:'Its corners are slanted, not square corners.' }
  ];
  M['g3.quads'] = { name:'Quadrilaterals', unit:'g3u4', gen(R, lvl){
    if (lvl === 1){
      const nm = R.pick(Object.keys(QUAD_SHAPE));
      const pool = Object.keys(QUAD_SHAPE).filter(x => x !== nm && !QUAD_ALSO[nm].includes(x)).concat(['Pentagon','Triangle','Hexagon']);
      return { q:'What is the best name for this shape?', kind:'choice', a:nm, choices: choices(nm, R.shuffle(pool)), model:{ type:'polygon', shape:QUAD_SHAPE[nm] },
        hint:'Check: Are the sides equal? Are the corners square corners? Which sides are parallel?',
        steps:[ `It has 4 sides, so it is a quadrilateral.`, `Look closer: it has ${QUAD_DESC[nm]}.`, `The best name is ${nm}.`] };
    }
    if (lvl === 2){
      const it = R.pick(QUAD_ATTR);
      return { q:it.q, kind:'choice', a:it.a, choices: choices(it.a, it.ds),
        hint:'Read each clue and cross out the shapes that do not fit.',
        steps:[ `Check each clue one at a time.`, it.why, `Only the ${it.a.toLowerCase()} fits every clue. Answer: ${it.a}.`] };
    }
    const it = R.pick(QUAD_COUNT);
    return { q:it.q, kind:'num', a:it.a, model:{ type:'polygon', shape:it.shape },
      hint: /right/.test(it.q) ? 'A right angle is a square corner, like the corner of a book.' : /parallel/.test(it.q) ? 'Parallel sides go the same way and never meet, like train tracks.' : 'Compare the lengths of the sides.',
      steps:[ it.how, `So the answer is ${it.a}.`] };
  }};

  const COMPOSE = [
    { lv:1, kind:'choice', q:'Two squares the same size are put side by side. What shape do they make?', a:'Rectangle', ds:['Triangle','Pentagon','Hexagon'], why:['The new shape has 4 sides and 4 square corners.', 'It is longer than it is tall.'] },
    { lv:1, kind:'choice', q:'A square is cut from one corner to the opposite corner. What shapes are made?', a:'2 triangles', ds:['2 squares','2 rectangles','2 pentagons'], why:['The cut makes 2 pieces.', 'Each piece has 3 sides.'] },
    { lv:1, kind:'num', q:'How many green triangle pattern blocks fit together to make one yellow hexagon?', a:6, why:['Picture the hexagon cut like a pizza from its center.', 'Each of its 6 sides gets one triangle.'] },
    { lv:2, kind:'num', q:'How many red trapezoid pattern blocks make one yellow hexagon?', a:2, why:['A trapezoid is half of the hexagon.', 'Two halves make a whole.'] },
    { lv:2, kind:'num', q:'How many blue rhombus pattern blocks make one yellow hexagon?', a:3, why:['Each rhombus is the same as 2 triangles.', 'The hexagon is 6 triangles, and 6 ÷ 2 = 3.'] },
    { lv:2, kind:'choice', q:'A hexagon is cut in half from one corner to the opposite corner. What two shapes are made?', a:'2 trapezoids', ds:['2 triangles','2 squares','2 pentagons'], why:['Each half has 4 sides.', 'Each half has one pair of parallel sides.'] },
    { lv:2, kind:'choice', q:'A triangle is put on top of a square, like a house. How many sides does the new shape have, and what is it?', a:'5 sides, a pentagon', ds:['7 sides, a heptagon','4 sides, a quadrilateral','6 sides, a hexagon'], why:['The square and triangle share one side, so that side is inside now.', 'Count around the outside: 3 square sides + 2 triangle sides = 5.'] },
    { lv:2, kind:'choice', q:'A rectangle is cut in half with a straight line from the middle of one long side to the middle of the other. What shapes are made?', a:'2 smaller rectangles', ds:['2 triangles','2 trapezoids','2 pentagons'], why:['The cut goes straight across.', 'Each piece still has 4 square corners.'] },
    { lv:2, kind:'choice', q:'Six triangles that are all the same size fit around one point. What shape can they make?', a:'Hexagon', ds:['Octagon','Pentagon','Square'], why:['There is one outside side for each triangle.', '6 sides makes a hexagon.'] }
  ];
  M['g3.composepoly'] = { name:'Combine & cut polygons', unit:'g3u4', gen(R, lvl){
    if (lvl === 3 && R.chance(0.6)){
      const s = R.int(4, 8), nm = BY_SIDES[s].toLowerCase(), shape = R.pick(POLY.filter(p => p.sides === s && !/irregular/.test(p.shape))).shape;
      const a = s - 2;
      return { q:`A ${nm} is cut into triangles by drawing lines from ONE corner to every other corner it can reach. How many triangles are made?`, kind:'num', a,
        model:{ type:'polygon', shape },
        hint:'Draw it! Pick one corner and draw lines to every corner that is not next to it. Then count the triangles.',
        steps:[ `A ${nm} has ${s} corners.`, `From one corner you can draw lines to ${s - 3} other corner${s - 3 === 1 ? '' : 's'}.`, `That makes ${s - 3} + 1 = ${a} triangles.`, `So there are ${a} triangles.`] };
    }
    const pool = COMPOSE.filter(c => lvl === 1 ? c.lv === 1 : true);
    const it = R.pick(pool);
    const p = { q:it.q, kind:it.kind, a: it.kind === 'num' ? it.a : it.a,
      hint:'Try drawing it on paper, or picture the pieces fitting together. Count sides carefully.',
      steps:[ ...it.why, `So the answer is ${it.a}.`] };
    if (it.kind === 'choice') p.choices = choices(it.a, it.ds);
    return p;
  }};

  // ---------- Unit 5: multiples of 10 ----------
  M['g3.multiples10'] = { name:'Multiply by multiples of 10', unit:'g3u5', gen(R, lvl){
    const n = lvl === 1 ? R.int(1, 5) : R.int(2, 9);
    const t = lvl === 1 ? R.pick([1,2,3,5]) : R.int(2, 9);
    const m = t * 10, p = n * m;
    if (lvl === 3 && R.chance(0.5)){
      if (R.chance(0.5)) return { q:`? × ${m} = ${fmt(p)}. What is the missing number?`, kind:'num', a:n,
        hint:`Think in tens: ? × ${t} tens = ${p / 10} tens.`,
        steps:[ `${fmt(p)} is ${p / 10} tens and ${m} is ${t} tens.`, `? × ${t} = ${p / 10}.`, `${n} × ${t} = ${p / 10}, so ? = ${n}.`] };
      const A = name(R);
      return { q:`${A} buys ${n} boxes of crayons. Each box has ${m} crayons. How many crayons in all?`, kind:'num', a:p,
        hint:`Multiply ${n} × ${m}. Use the basic fact ${n} × ${t} to help.`,
        steps:[ `${n} boxes of ${m}: ${n} × ${m}.`, `${n} × ${t} tens = ${n * t} tens.`, `${n * t} tens = ${fmt(p)} crayons.`] };
    }
    const [x, y] = R.chance(0.7) ? [n, m] : [m, n];
    return { q:`What is ${x} × ${y}?`, kind:'num', a:p,
      hint:`${m} is ${t} ${pl(t, 'tens')}. Use the fact ${n} × ${t}, then think in tens.`,
      steps:[ `${m} = ${t} ${pl(t, 'tens')}, so this is ${n} × ${t} ${pl(t, 'tens')}.`, `${n} × ${t} = ${n * t}, so it is ${n * t} ${pl(n * t, 'tens')}.`, `${n * t} ${pl(n * t, 'tens')} = ${fmt(p)}.`] };
  }};

  // ---------- Unit 6: fractions ----------
  const FNAME = { 2:['half','halves'], 3:['third','thirds'], 4:['fourth','fourths'], 5:['fifth','fifths'], 6:['sixth','sixths'], 8:['eighth','eighths'] };
  M['g3.fractions'] = { name:'Fractions', unit:'g3u6', gen(R, lvl){
    const d = R.pick(lvl === 1 ? [2,3,4,6,8] : [2,3,4,5,6,8]);
    if (lvl === 1){
      const k = R.int(1, d - 1), ans = `${k}/${d}`;
      return { q:'What fraction of the shape is shaded?', kind:'choice', a:ans,
        choices: choices(ans, [`${d - k}/${d}`, `${k}/${d - k}`, `${d}/${k}`, `${k + 1}/${d}`, `${k}/${d + 1}`]),
        model:{ type:'fraction', parts:d, shaded:k, shape:R.pick(['bar','circle']) },
        hint:'The bottom number is how many equal parts in all. The top number is how many are shaded.',
        steps:[ `Count all the equal parts: ${d}. That is the bottom number.`, `Count the shaded parts: ${k}. That is the top number.`, `So ${ans} is shaded.`] };
    }
    if (lvl === 2){
      const k = R.int(1, d - 1), ans = `${k}/${d}`;
      return { q:'What fraction is at the point on the number line?', kind:'choice', a:ans,
        choices: choices(ans, [`${k}/${d + 1}`, `${k + 1}/${d}`, `${d - k}/${d}`, `1/${k + 1}`, `${k}/${d - 1}`]),
        model:{ type:'numberline', min:0, max:1, step:1 / d, label:1, points:[{ x:k / d, label:'?' }] },
        hint:'Count the jumps (spaces) from 0 to 1, not the tick marks. Then count jumps from 0 to the point.',
        steps:[ `From 0 to 1 there are ${d} equal jumps, so each jump is 1/${d}.`, `From 0 to the point is ${k} jump${k > 1 ? 's' : ''}.`, `So the point is at ${ans}.`] };
    }
    // compare: same denominator or same numerator
    if (R.chance(0.5)){
      let a = R.int(1, d - 1), b = R.int(1, d - 1); while (b === a && d > 2) b = R.int(1, d - 1);
      if (d === 2) { a = 1; b = 1; }
      const sym = a > b ? '>' : a < b ? '<' : '=';
      return { q:`Which symbol makes this true?  ${a}/${d} ☐ ${b}/${d}`, kind:'choice', a:sym, choices:['<','>','='],
        hint:'The bottom numbers match, so the pieces are the same size. Who has more pieces?',
        steps:[ `Both are ${FNAME[d][1]}, so the pieces are the same size.`, a === b ? `Both have ${a} piece${a > 1 ? 's' : ''}.` : `${Math.max(a, b)} ${pl(Math.max(a, b), 'pieces')} is more than ${Math.min(a, b)} ${pl(Math.min(a, b), 'pieces')}.`, `So ${a}/${d} ${sym} ${b}/${d}.`] };
    }
    const n = R.int(1, 3);
    let x = R.pick([2,3,4,5,6,8].filter(v => v > n)), y = R.pick([2,3,4,5,6,8].filter(v => v > n));
    while (y === x) y = R.pick([2,3,4,5,6,8].filter(v => v > n));
    const sym = x < y ? '>' : '<'; // same numerator: smaller denominator = bigger pieces
    return { q:`Which symbol makes this true?  ${n}/${x} ☐ ${n}/${y}`, kind:'choice', a:sym, choices:['<','>','='],
      hint:'The top numbers match. Which pieces are bigger: cut into fewer parts or more parts?',
      steps:[ `Both have ${n} piece${n > 1 ? 's' : ''}.`, `${FNAME[Math.min(x, y)][1]} are bigger than ${FNAME[Math.max(x, y)][1]}: fewer cuts means bigger pieces.`, `So ${n}/${x} ${sym} ${n}/${y}.`] };
  }};

  // ---------- Unit 8: time, money, perimeter, area ----------
  const tstr = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  const addMin = (h, m, add) => { let t = ((h % 12) * 60 + m + add) % 720; if (t < 0) t += 720; let hh = Math.floor(t / 60); if (hh === 0) hh = 12; return [hh, t % 60]; };
  M['g3.time'] = { name:'Telling time & elapsed time', unit:'g3u8', gen(R, lvl){
    if (lvl === 1 || (lvl === 2 && R.chance(0.5))){
      const h = R.int(1, 12), m = lvl === 1 ? R.int(0, 11) * 5 : R.int(0, 59);
      const ans = tstr(h, m), mark = Math.floor(m / 5), extra = m % 5;
      const nextH = h === 12 ? 1 : h + 1, prevH = h === 1 ? 12 : h - 1;
      const ds = [tstr(nextH, m), tstr(h, mark), m ? tstr(prevH, m) : tstr(h, 30), tstr(h, (m + 5) % 60)];
      // reading the minute hand's number as minutes, e.g. 3:05 for 3:25
      return { q:'What time does the clock show?', kind:'choice', a:ans, choices: choices(ans, ds), model:{ type:'clock', h, m },
        hint:'The short hand tells the hour. The long hand tells the minutes: count by 5s for each number.',
        steps:[ m === 0 ? `The short hand points to ${h}.` : `The short hand is just past the ${h}, so the hour is ${h}.`,
          extra ? `The long hand is ${extra} mark${extra > 1 ? 's' : ''} past the ${mark || 12}. Count by 5s to ${mark * 5}, then add ${extra}: ${m} minutes.`
                : m === 0 ? `The long hand points to 12. That means 0 minutes, "o'clock".` : `The long hand points to the ${mark}. Count by 5s: ${m} minutes.`,
          `The time is ${ans}.`] };
    }
    const h = R.int(1, 12), m = lvl === 2 ? R.pick([0, 30]) : R.pick([0, 15, 30, 45]);
    const dh = R.int(1, lvl === 2 ? 4 : 5), dm = lvl === 2 ? 0 : R.pick([0, 30]);
    const [eh, em] = addMin(h, m, dh * 60 + dm);
    const A = name(R);
    const act = R.pick(['soccer practice','a movie','a trip to the zoo','a birthday party','a baseball game']);
    const dur = dm ? `${dh} hour${dh > 1 ? 's' : ''} and 30 minutes` : `${dh} hour${dh > 1 ? 's' : ''}`;
    if (R.chance(0.5)){
      const ans = tstr(eh, em);
      const [w1h, w1m] = addMin(h, m, dh * 60 + dm + 60), [w2h, w2m] = addMin(h, m, dh * 60 + dm - 60), [w3h, w3m] = addMin(h, m, dh * 60 + (dm ? 0 : 30));
      return { q:`${act[0].toUpperCase() + act.slice(1)} starts at ${tstr(h, m)} and lasts ${dur}. What time does it end?`, kind:'choice', a:ans,
        choices: choices(ans, [tstr(w1h, w1m), tstr(w2h, w2m), tstr(w3h, w3m)]), model:{ type:'clock', h, m },
        hint:'Start at the beginning time. Jump ahead one hour at a time, then add any half hour.',
        steps:[ `Start at ${tstr(h, m)}.`, `Jump ${dh} hour${dh > 1 ? 's' : ''}: ${tstr(...addMin(h, m, dh * 60))}.`, ...(dm ? [`Add 30 minutes: ${ans}.`] : []), `It ends at ${ans}.`] };
    }
    const ans = dur;
    const alt = (x, y) => y ? `${x} hour${x > 1 ? 's' : ''} and 30 minutes` : `${x} hour${x > 1 ? 's' : ''}`;
    return { q:`${A} goes to ${act} from ${tstr(h, m)} to ${tstr(eh, em)}. How long is it?`, kind:'choice', a:ans,
      choices: choices(ans, [alt(dh + 1, dm), dh > 1 ? alt(dh - 1, dm) : alt(dh + 2, dm), alt(dh, dm ? 0 : 30)]),
      hint:'Count the hours from the start time. Then check for a half hour left over.',
      steps:[ `Start at ${tstr(h, m)}.`, `Count whole hours: ${Array.from({length:dh}, (_, i) => tstr(...addMin(h, m, (i + 1) * 60))).join(', ')}. That is ${dh} hour${dh > 1 ? 's' : ''}.`, ...(dm ? [`From ${tstr(...addMin(h, m, dh * 60))} to ${tstr(eh, em)} is 30 more minutes.`] : []), `It lasts ${ans}.`] };
  }};

  const COIN = { q:['quarter','quarters',25], d:['dime','dimes',10], n:['nickel','nickels',5], p:['penny','pennies',1] };
  M['g3.money'] = { name:'Counting money & making change', unit:'g3u8', gen(R, lvl){
    if (lvl < 3){
      let c; do { c = lvl === 1 ? { q:R.int(0, 2), d:R.int(0, 3), n:R.int(0, 2), p:R.int(0, 4) } : { q:R.int(0, 5), d:R.int(0, 4), n:R.int(0, 3), p:R.int(0, 4) }; }
      while (c.q + c.d + c.n + c.p < 2);
      const coins = []; ['q','d','n','p'].forEach(k => { for (let i = 0; i < c[k]; i++) coins.push(k); });
      let run = 0; const steps = [];
      ['q','d','n','p'].forEach(k => { if (!c[k]) return; const v = c[k] * COIN[k][2]; run += v;
        steps.push(`${c[k]} ${c[k] > 1 ? COIN[k][1] : COIN[k][0]}: ${c[k]} × ${COIN[k][2]}¢ = ${v}¢. Running total: ${run}¢.`); });
      steps.push(`Total: ${run}¢${run >= 100 ? ' (' + cents(run) + ')' : ''}.`);
      return { q:'How much money is shown? (Answer in cents.)', kind:'num', a:run, unit:'¢', model:{ type:'coins', coins },
        hint:'Start with the coins worth the most. Quarters are 25¢, dimes 10¢, nickels 5¢, pennies 1¢.',
        steps };
    }
    const A = name(R), item = R.pick(['a toy car','a book','a snack','a ball','a pack of cards']);
    if (R.chance(0.5)){
      const price = R.int(1, 19) * 5, ch = 100 - price;
      return { q:`${A} buys ${item} for ${price}¢ and pays with $1. How much change does ${A} get?`, kind:'num', a:ch, unit:'¢',
        hint:'$1 is 100¢. Count up from the price to 100¢.',
        steps:[ `$1 = 100¢.`, `Count up from ${price}¢ to 100¢, or subtract: 100 − ${price} = ${ch}.`, `The change is ${ch}¢.`] };
    }
    const price = R.int(21, 99) * 5, ch = 500 - price, a = ch / 100;
    return { q:`${A} buys ${item} for ${cents(price)} and pays with a $5 bill. How much change in dollars? (Write it like 1.25.)`, kind:'num', a, unit:'dollars',
      hint:'$5.00 is 500¢. Find the difference, then write it back in dollars.',
      steps:[ `$5.00 = 500¢ and ${cents(price)} = ${price}¢.`, `500 − ${price} = ${ch}¢.`, `${ch}¢ = ${dol(ch)}. The change is ${dol(ch)}.`] };
  }};

  const LUNIT = ['cm','in','ft','m'];
  M['g3.perimeter'] = { name:'Perimeter', unit:'g3u8', gen(R, lvl){
    const u = R.pick(LUNIT);
    if (lvl === 1){
      const w = R.int(2, 10), h = R.int(2, 9), P = 2 * (w + h);
      return { q:'What is the perimeter of this rectangle?', kind:'num', a:P, unit:u, model:{ type:'rect', w, h, unit:u },
        hint:'Perimeter is the distance all the way around. A rectangle has 4 sides: two long, two short.',
        steps:[ `The sides are ${w}, ${h}, ${w} and ${h}.`, `Add them: ${w} + ${h} + ${w} + ${h} = ${P}.`, `The perimeter is ${P} ${u}.`] };
    }
    if (lvl === 2){
      if (R.chance(0.3)){
        const s = R.int(2, 12), P = 4 * s;
        return { q:`A square has sides that are ${s} ${u} long. What is its perimeter?`, kind:'num', a:P, unit:u, model:{ type:'polygon', shape:'square' },
          hint:'A square has 4 sides that are all the same length.',
          steps:[ `4 sides, each ${s} ${u}.`, `${s} + ${s} + ${s} + ${s} = 4 × ${s} = ${P}.`, `The perimeter is ${P} ${u}.`] };
      }
      const p = R.pick([{ shape:'triangle', n:3 }, { shape:'irregular-quad', n:4 }, { shape:'irregular-pentagon', n:5 }, { shape:'irregular-hexagon', n:6 }]);
      const sides = Array.from({ length:p.n }, () => R.int(2, 12)), P = sides.reduce((a, b) => a + b, 0);
      return { q:`A ${BY_SIDES[p.n].toLowerCase()} has sides ${sides.map(s => s + ' ' + u).join(', ')}. What is its perimeter?`, kind:'num', a:P, unit:u, model:{ type:'polygon', shape:p.shape },
        hint:'Add up all the side lengths. Check off each one as you add it.',
        steps:[ `There are ${p.n} sides to add.`, `${sides.join(' + ')} = ${P}.`, `The perimeter is ${P} ${u}.`] };
    }
    let w = R.int(3, 12), h = R.int(2, 10); if (h > w) [w, h] = [h, w]; const P = 2 * (w + h);
    if (R.chance(0.5)){
      return { q:`A rectangle has a perimeter of ${P} ${u}. Its length is ${w} ${u}. What is its width?`, kind:'num', a:h, unit:u, hint:'The two lengths use up part of the perimeter. The two widths share what is left.',
        steps:[ `Two lengths: ${w} + ${w} = ${2 * w}.`, `What is left: ${P} − ${2 * w} = ${P - 2 * w}.`, `Two widths share that: ${P - 2 * w} ÷ 2 = ${h}.`, `The width is ${h} ${u}.`] };
    }
    const s = R.int(2, 12), P2 = 4 * s;
    return { q:`A square has a perimeter of ${P2} ${u}. How long is one side?`, kind:'num', a:s, unit:u, model:{ type:'polygon', shape:'square' },
      hint:'A square has 4 equal sides. Split the perimeter into 4 equal parts.',
      steps:[ `4 equal sides make ${P2} ${u}.`, `${P2} ÷ 4 = ? Think 4 × ? = ${P2}.`, `4 × ${s} = ${P2}, so each side is ${s} ${u}.`] };
  }};

  M['g3.area'] = { name:'Area', unit:'g3u8', gen(R, lvl){
    if (lvl < 3){
      const w = R.int(2, lvl === 1 ? 6 : 9), h = R.int(2, lvl === 1 ? 5 : 8), A = w * h;
      return { q:'Each small square is 1 square unit. What is the area of the rectangle?', kind:'num', a:A, unit:'square units',
        model:{ type:'rect', w, h, grid:true },
        hint: lvl === 1 ? 'Count the squares in one row. Then count by that number for each row.' : 'Count one row and the number of rows, then multiply.',
        steps:[ `One row has ${w} squares.`, `There are ${h} rows.`, `${h} rows of ${w}: ${h} × ${w} = ${A}.`, `The area is ${A} square units.`] };
    }
    const u = R.pick(['cm','in','ft','m']);
    const w = R.int(3, 10), h = R.int(2, 10), A = w * h;
    if (R.chance(0.35)){
      return { q:`A rectangle has an area of ${A} ${u}². One side is ${w} ${u}. How long is the other side?`, kind:'num', a:h, unit:u,
        hint:`Area = side × side. Think: ${w} × what = ${A}?`,
        steps:[ `Area = length × width.`, `${w} × ? = ${A}.`, `${w} × ${h} = ${A}, so the other side is ${h} ${u}.`] };
    }
    return { q:`What is the area of a rectangle that is ${w} ${u} long and ${h} ${u} wide?`, kind:'num', a:A, unit:`${u}²`,
      model:{ type:'rect', w, h, unit:u },
      hint:'Area is how many squares cover it. You can multiply length × width instead of counting.',
      steps:[ `Area = length × width.`, `${w} × ${h} = ${A}.`, `The area is ${A} ${u}².`] };
  }};
})();
