// Page Quest math: grade 3 number skills, the big question bank (FCPS / Virginia SOL 2023, "November Spiral").
// Replaces g3.add3, g3.addsub, g3.subzero, g3.missing, g3.twostep, g3.round, g3.round100, g3.compare, g3.placevalue,
// g3.estimate from g3.js (same keys, names, units). Each skill keeps a list of question TYPES; every type works at every
// level, and the level sets the size of the numbers. Every answer is computed from the generated numbers.
(function(){
  const M = window.MathSkills = window.MathSkills || {};

  // ---------- helpers (g3.js's are private, so these are copies) ----------
  const NAMES = ['Sam','Maya','Leo','Ava','Ben','Lily','Max','Emma','Noah','Mia','Zoe','Eli','Ruby','Omar','Nina','Jack','Aria','Luis','Hana','Theo'];
  const PLACE = ['ones','tens','hundreds','thousands','ten thousands'];
  const PLACE_CAP = ['Ones','Tens','Hundreds','Thousands','Ten thousands'];
  const POW = [1,10,100,1000,10000,100000];
  function fmt(n){ const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (n < 0 ? '−' : '') + s; }
  function nms(R, k){ return R.shuffle(NAMES.slice()).slice(0, k); }
  function nm(R){ return R.pick(NAMES); }
  function choices(ans, ds){
    const out = [String(ans)];
    for (const d of ds){
      const s = String(d);
      if (!s || out.includes(s) || /NaN|undefined|Infinity/.test(s)) continue;
      out.push(s); if (out.length === 4) break;
    }
    return out;
  }
  // number choices: answer + whole, non-negative distractors, padded to 4 with answer ± pads
  function nch(ans, ds, pads){
    const out = choices(fmt(ans), ds.filter(d => Number.isInteger(d) && d >= 0 && d !== ans).map(fmt));
    for (const p of (pads || [10, 100, 1, 20])){
      for (const v of [ans + p, ans - p]) if (out.length < 4 && v >= 0 && !out.includes(fmt(v))) out.push(fmt(v));
    }
    return out;
  }
  function digitsOf(n){ return String(n).split('').reverse().map(Number); } // ones first
  function pl(n, w){ return n === 1 ? w.replace(/s$/, '') : w; }
  function roundTo(n, p){ return Math.floor((n + p/2) / p) * p; }
  function pw(P){ return P === 10 ? 'ten' : P === 100 ? 'hundred' : 'thousand'; }
  const YN = ['Yes', 'No'], TF = ['True', 'False'];
  const num = (q, a, hint, steps, x) => Object.assign({ q, kind:'num', a, hint, steps }, x || {});
  const cho = (q, a, ch, hint, steps, x) => Object.assign({ q, kind:'choice', a:String(a), choices:ch, hint, steps }, x || {});

  const ONES = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  function w99(n){ return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); }
  function w999(n){ const h = Math.floor(n / 100), r = n % 100; return (h ? ONES[h] + ' hundred' : '') + (h && r ? ' ' : '') + (r || !h ? w99(r) : ''); }
  function words(n){ if (n === 0) return 'zero'; const th = Math.floor(n / 1000), r = n % 1000; return (th ? w999(th) + ' thousand' : '') + (th && r ? ' ' : '') + (r ? w999(r) : ''); }
  function expTerms(n){ return digitsOf(n).map((x, i) => x * POW[i]).reverse().filter(x => x); }
  function expanded(n){ return expTerms(n).map(fmt).join(' + '); }
  function unitForm(n){ const d = digitsOf(n); return d.map((x, i) => `${x} ${pl(x, PLACE[i])}`).reverse().join(', '); }
  function fromDigits(ds){ return Number(ds.join('')); } // most significant first

  // column addition steps -- for a + b
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
  function hasCarry(a, b){ const da = digitsOf(a), db = digitsOf(b); for (let i = 0; i < Math.max(da.length, db.length); i++) if ((da[i] || 0) + (db[i] || 0) >= 10) return true; return false; }
  function hasBorrow(a, b){ const da = digitsOf(a), db = digitsOf(b); for (let i = 0; i < da.length; i++) if (da[i] < (db[i] || 0)) return true; return false; }
  // the "forgot to carry" sum: every column keeps only its ones digit (the last column keeps all of it)
  function noCarry(a, b){ const da = digitsOf(a), db = digitsOf(b), n = Math.max(da.length, db.length); let r = 0;
    for (let i = 0; i < n; i++){ const s = (da[i] || 0) + (db[i] || 0); r += (i === n - 1 ? s : s % 10) * POW[i]; } return r; }
  // the "smaller from bigger" slip: subtract the smaller digit from the bigger one in every column
  function flipSub(a, b){ const da = digitsOf(a), db = digitsOf(b); let r = 0; for (let i = 0; i < da.length; i++) r += Math.abs(da[i] - (db[i] || 0)) * POW[i]; return r; }

  // =====================================================================================================
  // g3.add3 -- adding three numbers
  // =====================================================================================================
  function a3n(R, lvl){ return lvl === 1 ? R.int(11, 49) : lvl === 2 ? R.int(15, 99) : R.int(105, 499); }
  function tri(R, lvl){ return [a3n(R, lvl), a3n(R, lvl), a3n(R, lvl)]; }
  function s3(a, b, c){ return [`Add the first two: ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`, `Now add the third: ${fmt(a + b)} + ${fmt(c)} = ${fmt(a + b + c)}.`, `The total is ${fmt(a + b + c)}.`]; }
  const H3 = 'Add two numbers first, then add the third. Look for ones digits that make 10!';
  const ex3 = (a, b, c) => `${fmt(a)} + ${fmt(b)} + ${fmt(c)}`;
  function add3Word(qf, unit, clue){
    return (R, lvl) => { const [a, b, c] = tri(R, lvl), [A, B, C] = nms(R, 3), t = a + b + c;
      return num(qf(a, b, c, A, B, C), t, `${clue} Add all three numbers.`, [`${clue}`, ...s3(a, b, c)], unit ? { unit } : {}); };
  }
  const ADD3 = [
    (R, lvl) => { const [a, b, c] = tri(R, lvl); return num(`What is ${ex3(a, b, c)}?`, a + b + c, H3, s3(a, b, c)); },
    (R, lvl) => { const [a, b, c] = tri(R, lvl); return num(`Find the sum of ${fmt(a)}, ${fmt(b)}, and ${fmt(c)}.`, a + b + c, '"Sum" means add. Add two, then add the third.', s3(a, b, c)); },
    (R, lvl) => { const [a, b, c] = tri(R, lvl), t = a + b + c;
      return num(`Stack ${fmt(a)}, ${fmt(b)}, and ${fmt(c)} in a column, lining up the places. What is the sum?`, t, 'Ones under ones, tens under tens. Add the ones column first and carry if you need to.',
        [`Line up the ones, tens${lvl === 3 ? ' and hundreds' : ''}.`, `Ones: ${a % 10} + ${b % 10} + ${c % 10} = ${a % 10 + b % 10 + c % 10}.`, ...s3(a, b, c).slice(0, 2), `The sum is ${fmt(t)}.`]); },
    (R, lvl) => { const o = R.int(1, 9), top = lvl === 1 ? 4 : 9, hun = () => lvl === 3 ? R.int(1, 4) * 100 : 0;
      const a = hun() + R.int(1, top) * 10 + o, cc = hun() + R.int(1, top) * 10 + (10 - o), b = a3n(R, lvl), t = a + b + cc;
      return num(`Find two numbers whose ones make a ten, then add: ${ex3(a, b, cc)}`, t, `Look at the ones digits: ${o} and ${10 - o} make 10!`,
        [`${o} + ${10 - o} = 10, so add ${fmt(a)} + ${fmt(cc)} first: ${fmt(a + cc)}.`, `Then add ${fmt(b)}: ${fmt(a + cc)} + ${fmt(b)} = ${fmt(t)}.`, `The total is ${fmt(t)}.`]); },
    add3Word((a, b, c, A) => `${A} picked ${fmt(a)} apples on Monday, ${fmt(b)} on Tuesday, and ${fmt(c)} on Wednesday. How many apples did ${A} pick in all?`, 'apples', '"In all" means put together.'),
    add3Word((a, b, c) => `For the food drive, Room 1 collected ${fmt(a)} cans, Room 2 collected ${fmt(b)} cans, and Room 3 collected ${fmt(c)} cans. How many cans did the three rooms collect?`, 'cans', 'Put the three rooms together.'),
    add3Word((a, b, c) => `A basketball team scored ${fmt(a)} points in the first game, ${fmt(b)} in the second game, and ${fmt(c)} in the third game. How many points did the team score in all?`, 'points', '"In all" means add.'),
    add3Word((a, b, c) => `For Thanksgiving, a bakery made ${fmt(a)} rolls, ${fmt(b)} muffins, and ${fmt(c)} pies. How many baked goods did it make altogether?`, '', '"Altogether" means add.'),
    add3Word((a, b, c) => `A bookcase has ${fmt(a)} books on the top shelf, ${fmt(b)} on the middle shelf, and ${fmt(c)} on the bottom shelf. How many books are on the bookcase?`, 'books', 'Add the books on all three shelves.'),
    add3Word((a, b, c, A, B, C) => `${A} has ${fmt(a)} stickers, ${B} has ${fmt(b)} stickers, and ${C} has ${fmt(c)} stickers. How many stickers do they have together?`, 'stickers', '"Together" means add.'),
    add3Word((a, b, c, A) => `${A} spent $${fmt(a)} on a game, $${fmt(b)} on shoes, and $${fmt(c)} on a jacket. How many dollars did ${A} spend in all?`, 'dollars', 'Add the three prices.'),
    add3Word((a, b, c) => `A bus drove ${fmt(a)} miles on Friday, ${fmt(b)} miles on Saturday, and ${fmt(c)} miles on Sunday. How many miles did it drive in all?`, 'miles', 'Put the three days together.'),
    add3Word((a, b, c) => `A triangle has sides that are ${fmt(a)} cm, ${fmt(b)} cm, and ${fmt(c)} cm long. What is the distance all the way around the triangle?`, 'cm', 'All the way around means add all three sides.'),
    add3Word((a, b, c) => `Three buses took students to the zoo. The buses carried ${fmt(a)}, ${fmt(b)}, and ${fmt(c)} students. How many students went to the zoo?`, 'students', 'Add the students from all three buses.'),
    (R, lvl) => { const [a, b, c] = tri(R, lvl), t = a + b + c, x = t - a - b;
      return num(`What number goes in the box?  ${fmt(a)} + ${fmt(b)} + ☐ = ${fmt(t)}`, x, `Add the two numbers you know. Then ask how far that is from ${fmt(t)}.`,
        [`${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`, `${fmt(t)} − ${fmt(a + b)} = ${fmt(x)}.`, `Check: ${ex3(a, b, x)} = ${fmt(t)} ✓`]); },
    (R, lvl) => { const [a, b, c] = tri(R, lvl), t = a + b + c;
      return num(`What number goes in the box?  ${fmt(a)} + ☐ + ${fmt(c)} = ${fmt(t)}`, b, `Add the two numbers you know, then subtract from ${fmt(t)}.`,
        [`${fmt(a)} + ${fmt(c)} = ${fmt(a + c)}.`, `${fmt(t)} − ${fmt(a + c)} = ${fmt(b)}.`, `Check: ${ex3(a, b, c)} = ${fmt(t)} ✓`]); },
    (R, lvl) => { const [a, b, c] = tri(R, lvl), t = a + b + c;
      return num(`What number goes in the box?  ☐ + ${fmt(b)} + ${fmt(c)} = ${fmt(t)}`, a, `Add the two numbers you know, then subtract from ${fmt(t)}.`,
        [`${fmt(b)} + ${fmt(c)} = ${fmt(b + c)}.`, `${fmt(t)} − ${fmt(b + c)} = ${fmt(a)}.`, `Check: ${ex3(a, b, c)} = ${fmt(t)} ✓`]); },
    (R, lvl) => { const [a, b, c] = tri(R, lvl), t = a + b + c, ans = ex3(a, b, c);
      return cho(`Which expression has a sum of ${fmt(t)}?`, ans, choices(ans, [ex3(a, b + 10, c), ex3(a, b, c - 1), ex3(a + 1, b, c + 10)]),
        'Add up each choice. Only one makes the total.', [`${ans}: ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}, then + ${fmt(c)} = ${fmt(t)} ✓`, `The other choices have different totals.`, `So ${ans} is the answer.`]); },
    (R, lvl) => { const [a, b, c] = tri(R, lvl), ans = ex3(c, a, b);
      return cho(`Which is equal to ${ex3(a, b, c)}?`, ans, choices(ans, [`${fmt(a)} + ${fmt(b)} − ${fmt(c)}`, `${fmt(a)} + ${fmt(c)}`, ex3(a, b, c + 10)]),
        'You can add numbers in any order and get the same sum.', [`${ex3(c, a, b)} has the same three numbers, just in a different order.`, `Changing the order does not change the sum.`, `So it equals ${ex3(a, b, c)}.`]); },
    (R, lvl) => { const [a, b, c] = tri(R, lvl), t = a + b + c;
      return num(`Start at ${fmt(a)}. Add ${fmt(b)}. Then add ${fmt(c)}. What number do you end on?`, t, 'Add one number at a time.', s3(a, b, c)); },
    (R, lvl) => { const [a, b, c] = tri(R, lvl); let d, e, f; do { [d, e, f] = tri(R, lvl); } while (d + e + f === a + b + c);
      const e1 = ex3(a, b, c), e2 = ex3(d, e, f), t1 = a + b + c, t2 = d + e + f, ans = t1 > t2 ? e1 : e2;
      return cho(`Which has the greater sum: ${e1} or ${e2}?`, ans, [e1, e2], 'Find each total, then compare.',
        [`${e1} = ${fmt(t1)}.`, `${e2} = ${fmt(t2)}.`, `${fmt(Math.max(t1, t2))} is greater, so the answer is ${ans}.`]); },
    (R, lvl) => { const [a, b, c] = tri(R, lvl), t = a + b + c, A = nm(R), w = R.chance(0.5) ? t - 10 : t + 10;
      return num(`${A} says ${ex3(a, b, c)} = ${fmt(w)}. That is not right. What is the correct sum?`, t, 'Add again carefully. Did someone forget to carry, or carry too much?',
        [...s3(a, b, c).slice(0, 2), `The correct sum is ${fmt(t)}, not ${fmt(w)}.`]); },
    (R, lvl) => { const [a, b, c] = tri(R, lvl), t = a + b + c, A = nm(R), ok = R.chance(0.5), x = ok ? t : t + R.pick([10, -10, 1, -1]);
      return cho(`${A} added ${ex3(a, b, c)} and got ${fmt(x)}. Is ${A} correct?`, ok ? 'Yes' : 'No', YN, 'Find the sum yourself, then compare.',
        [...s3(a, b, c).slice(0, 2), ok ? `${A} got ${fmt(x)}. That matches, so Yes.` : `${A} got ${fmt(x)}, but the sum is ${fmt(t)}. So No.`]); }
  ];
  M['g3.add3'] = { name:'Add three numbers', unit:'g3u2', gen(R, lvl){ return R.pick(ADD3)(R, lvl); } };

  // =====================================================================================================
  // g3.addsub -- 3- and 4-digit addition and subtraction with regrouping
  // =====================================================================================================
  function genAdd(R, lvl){ let a, b, g = 0;
    do {
      if (lvl === 1){ a = R.int(105, 799); b = R.int(25, 999 - a); }
      else if (lvl === 2){ if (R.chance(0.5)){ a = R.int(150, 899); b = R.int(150, 899); } else { a = R.int(1000, 4999); b = R.int(105, 999); } }
      else { a = R.int(1050, 7999); b = R.int(105, 9999 - a); }
    } while (!hasCarry(a, b) && g++ < 60);
    return [a, b]; }
  function genSub(R, lvl){ let a, b, g = 0;
    do {
      if (lvl === 1){ a = R.int(300, 999); b = R.int(25, a - 50); }
      else if (lvl === 2){ if (R.chance(0.5)){ a = R.int(1000, 4999); b = R.int(105, 999); } else { a = R.int(400, 999); b = R.int(105, a - 50); } }
      else { a = R.int(2000, 9999); b = R.int(1000, a - 100); }
    } while (!hasBorrow(a, b) && g++ < 60);
    return [a, b]; }
  const HA = 'Line up the places. Start with the ones. If a place adds to 10 or more, carry 1 to the next place.';
  const HS = 'Line up the places. Start with the ones. If the top digit is too small, regroup 1 from the next place.';
  const sA = (a, b) => [...addSteps(a, b), `So ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`];
  const sS = (a, b) => [...subSteps(a, b), `So ${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.`];
  function asWord(add, qf, clue, unit){
    return (R, lvl) => { const [a, b] = add ? genAdd(R, lvl) : genSub(R, lvl), [A, B] = nms(R, 2), c = add ? a + b : a - b;
      return num(qf(a, b, A, B), c, clue + (add ? ' Then add.' : ' Then subtract.'),
        [clue, `Write it: ${fmt(a)} ${add ? '+' : '−'} ${fmt(b)}.`, ...(add ? addSteps(a, b) : subSteps(a, b)), `The answer is ${fmt(c)}.`], unit ? { unit } : {}); };
  }
  const ADDSUB = [
    (R, lvl) => { const [a, b] = genAdd(R, lvl); return num(`What is ${fmt(a)} + ${fmt(b)}?`, a + b, HA, sA(a, b)); },
    (R, lvl) => { const [a, b] = genSub(R, lvl); return num(`What is ${fmt(a)} − ${fmt(b)}?`, a - b, HS, sS(a, b)); },
    (R, lvl) => { const [a, b] = genAdd(R, lvl); return num(`Write ${fmt(a)} + ${fmt(b)} in a column, lining up the places. What is the sum?`, a + b, 'Ones under ones, tens under tens. Add from the right and carry when a column makes 10 or more.', sA(a, b)); },
    (R, lvl) => { const [a, b] = genSub(R, lvl); return num(`Find the difference between ${fmt(a)} and ${fmt(b)}.`, a - b, '"Difference" means subtract the smaller number from the bigger one.', sS(a, b)); },
    asWord(true, (a, b, A) => `${A} had ${fmt(a)} stamps. Then ${A} got ${fmt(b)} more stamps. How many stamps does ${A} have now?`, '"Got more" means the amount gets bigger.', 'stamps'),
    asWord(false, (a, b) => `A farm stand had ${fmt(a)} ears of corn. It sold ${fmt(b)} of them. How many ears of corn are left?`, '"Sold ... left" means take away.'),
    asWord(false, (a, b) => `The red team scored ${fmt(a)} points. The blue team scored ${fmt(b)} points. How many more points did the red team score?`, '"How many more" means compare, so find the difference.', 'points'),
    asWord(false, (a, b) => `The art club made ${fmt(a)} paper cranes. The music club made ${fmt(b)} paper cranes. How many fewer cranes did the music club make?`, '"How many fewer" means compare, so find the difference.', 'cranes'),
    asWord(false, (a, b) => `There are ${fmt(a)} people at the fair. ${fmt(b)} of them are kids and the rest are grown-ups. How many grown-ups are at the fair?`, 'You know the whole and one part. The other part is whole minus part.', 'grown-ups'),
    asWord(false, (a, b, A) => `${A} needs ${fmt(a)} points to win a prize. ${A} has ${fmt(b)} points so far. How many more points does ${A} need?`, 'Find how far it is from what you have to what you need.', 'points'),
    asWord(true, (a, b) => `A school spent $${fmt(a)} on books and $${fmt(b)} on art supplies. How many dollars did the school spend in all?`, '"In all" means put together.', 'dollars'),
    asWord(false, (a, b) => `A plane flew ${fmt(a)} miles on Monday and ${fmt(b)} miles on Tuesday. How many more miles did it fly on Monday?`, '"How many more" means find the difference.', 'miles'),
    asWord(true, (a, b) => `A school has ${fmt(a)} girls and ${fmt(b)} boys. How many students does the school have?`, 'Girls and boys together make all the students.', 'students'),
    asWord(false, (a, b, A) => `${A} had some baseball cards. ${A} got ${fmt(b)} more and now has ${fmt(a)} cards. How many cards did ${A} have at first?`, 'Take away the cards that were added to find the start.', 'cards'),
    asWord(false, (a, b, A) => `A hiking trail is ${fmt(a)} feet long. ${A} has walked ${fmt(b)} feet. How many feet are left to walk?`, 'The whole trail minus the part walked is what is left.', 'feet'),
    (R, lvl) => { const add = R.chance(0.5), [a, b] = add ? genAdd(R, lvl) : genSub(R, lvl), A = nm(R);
      const story = add ? `${A} has ${fmt(a)} beads and buys ${fmt(b)} more. How many beads now?` : `${A} has ${fmt(a)} beads and uses ${fmt(b)} of them. How many beads are left?`;
      const plus = `${fmt(a)} + ${fmt(b)} = ☐`, minus = `${fmt(a)} − ${fmt(b)} = ☐`, ans = add ? plus : minus;
      return cho(`Which number sentence matches the story? ${story}`, ans, choices(ans, [add ? minus : plus, `${fmt(b)} − ${fmt(a)} = ☐`, `${fmt(a)} + ☐ = ${fmt(b)}`]),
        add ? 'Buying more makes the number bigger: add.' : 'Using some up makes the number smaller: subtract.',
        [add ? `"Buys more" means join, so add.` : `"Uses ... left" means take away, so subtract.`, `Start with ${fmt(a)}, then ${add ? 'add' : 'take away'} ${fmt(b)}.`, `The sentence is ${ans}.`]); },
    (R, lvl) => { let a, b, g = 0; do { [a, b] = genAdd(R, lvl); } while (noCarry(a, b) === a + b && g++ < 30); const c = a + b, w = noCarry(a, b), A = nm(R);
      const ww = w === c ? c + 10 : w;
      return num(`${A} says ${fmt(a)} + ${fmt(b)} = ${fmt(ww)}. ${A} made a mistake. What is the correct sum?`, c, 'Add it yourself. Watch for a column that makes 10 or more: did someone forget to carry?',
        [...addSteps(a, b), `The correct sum is ${fmt(c)}, not ${fmt(ww)}.`]); },
    (R, lvl) => { let a, b, g = 0; do { [a, b] = genSub(R, lvl); } while (flipSub(a, b) === a - b && g++ < 30); const c = a - b, w = flipSub(a, b), A = nm(R);
      const ww = w === c ? c + 10 : w;
      return num(`${A} says ${fmt(a)} − ${fmt(b)} = ${fmt(ww)}. ${A} made a mistake. What is the correct difference?`, c, 'You can\'t take a bigger digit from a smaller one. Regroup instead of flipping the digits!',
        [...subSteps(a, b), `The correct difference is ${fmt(c)}, not ${fmt(ww)}.`]); },
    (R, lvl) => { const add = R.chance(0.5), [a, b] = add ? genAdd(R, lvl) : genSub(R, lvl), c = add ? a + b : a - b, A = nm(R), ok = R.chance(0.5);
      const x = ok ? c : (add ? (noCarry(a, b) !== c ? noCarry(a, b) : c + 100) : (flipSub(a, b) !== c ? flipSub(a, b) : c + 10)), sym = add ? '+' : '−';
      return cho(`${A} says ${fmt(a)} ${sym} ${fmt(b)} = ${fmt(x)}. Is ${A} right?`, ok ? 'Yes' : 'No', YN, 'Work it out yourself, then compare.',
        [...(add ? addSteps(a, b) : subSteps(a, b)).slice(-2), `${fmt(a)} ${sym} ${fmt(b)} = ${fmt(c)}.`, ok ? `That matches, so Yes.` : `${fmt(x)} does not match, so No.`]); },
    (R, lvl) => { const [a, b] = genSub(R, lvl), c = a - b, A = nm(R), ans = `${fmt(c)} + ${fmt(b)} = ${fmt(a)}`;
      return cho(`${A} found that ${fmt(a)} − ${fmt(b)} = ${fmt(c)}. Which addition checks the answer?`, ans, choices(ans, [`${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}`, `${fmt(c)} + ${fmt(a)} = ${fmt(a + c)}`, `${fmt(b)} + ${fmt(a)} = ${fmt(a + b)}`]),
        'Add the answer to the number you took away. You should get back to the start.', [`To check subtraction, add the answer and the number taken away.`, `${fmt(c)} + ${fmt(b)} = ${fmt(a)}.`, `That is the starting number, so it checks!`]); },
    (R, lvl) => { const [a, b] = genSub(R, lvl), c = a - b;
      return num(`Check this subtraction with addition: ${fmt(a)} − ${fmt(b)} = ${fmt(c)}. What is ${fmt(c)} + ${fmt(b)}?`, a, 'If the subtraction is right, adding back gives the number you started with.',
        [...addSteps(c, b).slice(-2), `${fmt(c)} + ${fmt(b)} = ${fmt(a)}.`, `That is the start number, so the subtraction checks out.`]); },
    (R, lvl) => { const [a, b] = genAdd(R, lvl); return num(`What is the sum of ${fmt(a)} and ${fmt(b)}?`, a + b, '"Sum" means add.', sA(a, b)); },
    (R, lvl) => { const [a, b] = genAdd(R, lvl), c = a + b;
      return cho(`Which is the sum of ${fmt(a)} and ${fmt(b)}?`, fmt(c), nch(c, [noCarry(a, b), c + 100, c - 10, a - b], [100, 10]), HA, sA(a, b)); }
  ];
  M['g3.addsub'] = { name:'Add & subtract', unit:'g3u2', gen(R, lvl){ return R.pick(ADDSUB)(R, lvl); } };

  // =====================================================================================================
  // g3.subzero -- subtraction across zeros (400 − 38, 600 − 247, 1,000 − 365, 3,005 − 1,238)
  // =====================================================================================================
  function genZ(R, lvl){ let a, b;
    if (lvl === 1){ a = R.int(2, 9) * 100; do { b = R.int(12, 99); } while (b % 10 === 0); }
    else if (lvl === 2){ const H = R.int(3, 9), d = R.chance(0.5) ? 0 : R.int(1, 6); a = H * 100 + d; do { b = R.int(101, a - 50); } while (b % 10 <= d || Math.floor(b / 10) % 10 === 0); }
    else { a = R.int(1, 9) * 1000 + R.pick([0, 0, R.int(1, 6)]); const lo = a >= 2000 ? 120 : 120, hi = a - 50; do { b = R.int(lo, hi); } while (b % 10 <= a % 10); }
    return [a, b]; }
  // the regrouped number in words; a top place that became 0 (1,000 → 9 hundreds …) is left out
  function zParts(rg, names){ return rg.slice().reverse().map((x, i) => (i === 0 && x === 0) ? null : `${x} ${x === 1 ? names[i].replace(/s$/, '') : names[i]}`).filter(Boolean).join(', '); }
  function zSteps(a, b){
    const c = a - b, big = a >= 1000, da = digitsOf(a), db = digitsOf(b);
    const rg = da.map((x, i) => i === 0 ? x + 10 : i === da.length - 1 ? x - 1 : 9);
    const names = big ? ['thousands', 'hundreds', 'tens', 'ones'] : ['hundreds', 'tens', 'ones'];
    const parts = zParts(rg, names);
    const steps = [`The ones digit is too small, and the next place is 0, so it has nothing to lend.`,
      `Regroup from the ${names[0]}: ${fmt(a)} = ${parts}. Every 0 becomes 9.`];
    for (let i = 0; i < da.length; i++){ const y = db[i] || 0; if (i === da.length - 1 && rg[i] === 0 && y === 0) continue; steps.push(`${PLACE_CAP[i]}: ${rg[i]} − ${y} = ${rg[i] - y}.`); }
    steps.push(`${fmt(a)} − ${fmt(b)} = ${fmt(c)}.  Check: ${fmt(c)} + ${fmt(b)} = ${fmt(a)} ✓`);
    return { steps, rg, names, parts };
  }
  const HZ = (a, b) => `The zeros can't lend, so regroup from the biggest place. Each 0 becomes 9. Watch out: the tens become 9, not 10! (The slip gives ${fmt(a - b + 10)}.)`;
  function zWord(qf, unit){
    return (R, lvl) => { const [a, b] = genZ(R, lvl), A = nm(R), c = a - b;
      return num(qf(a, b, A), c, HZ(a, b), [`Subtract: ${fmt(a)} − ${fmt(b)}.`, ...zSteps(a, b).steps.slice(1)], unit ? { unit } : {}); };
  }
  const SUBZERO = [
    (R, lvl) => { const [a, b] = genZ(R, lvl); return num(`What is ${fmt(a)} − ${fmt(b)}?`, a - b, HZ(a, b), zSteps(a, b).steps); },
    (R, lvl) => { const [a, b] = genZ(R, lvl); return num(`Find the difference: ${fmt(a)} − ${fmt(b)}`, a - b, HZ(a, b), zSteps(a, b).steps); },
    zWord((a, b) => `A store had ${fmt(a)} apples. It sold ${fmt(b)} apples. How many apples are left?`, 'apples'),
    zWord((a, b) => `A school had ${fmt(a)} pencils. Students used ${fmt(b)} of them. How many pencils are left?`, 'pencils'),
    zWord((a, b) => `The food drive wants to collect ${fmt(a)} cans. So far it has ${fmt(b)} cans. How many more cans does it need?`, 'cans'),
    zWord((a, b, A) => `A book has ${fmt(a)} pages. ${A} has read ${fmt(b)} pages. How many pages are left to read?`, 'pages'),
    zWord((a, b, A) => `${A} saved $${fmt(a)}. ${A} spent $${fmt(b)} on a new bike. How many dollars does ${A} have left?`, 'dollars'),
    zWord((a, b) => `A road trip is ${fmt(a)} miles long. The family has driven ${fmt(b)} miles. How many miles are left?`, 'miles'),
    zWord((a, b) => `One school has ${fmt(a)} students. Another school has ${fmt(b)} students. How many more students does the first school have?`, 'students'),
    (R, lvl) => { const [a, b] = genZ(R, lvl), c = a - b;
      return cho(`Which answer is correct?  ${fmt(a)} − ${fmt(b)} = ?`, fmt(c), nch(c, [c + 10, flipSub(a, b), c + 100, c - 10], [10, 100]), HZ(a, b), zSteps(a, b).steps); },
    (R, lvl) => { const [a, b] = genZ(R, lvl), c = a - b, A = nm(R);
      return num(`${A} says ${fmt(a)} − ${fmt(b)} = ${fmt(c + 10)}. Find the mistake. What is the correct answer?`, c, `When you regroup ${fmt(a)}, the tens become 9, not 10.`,
        [`${A} forgot that the 0 in the tens turns into 9 after lending.`, ...zSteps(a, b).steps.slice(1)]); },
    (R, lvl) => { const [a, b] = genZ(R, lvl), c = a - b, A = nm(R), ans = `${A} kept 10 tens instead of changing the tens to 9.`;
      return cho(`${A} says ${fmt(a)} − ${fmt(b)} = ${fmt(c + 10)}. What mistake did ${A} make?`, ans,
        choices(ans, [`${A} should have added instead.`, `${A} forgot to subtract the ones.`, `There is no mistake. ${fmt(c + 10)} is right.`]),
        'Do the problem yourself. Is your answer 10 less than theirs?',
        [`The right answer is ${fmt(c)}.`, `${fmt(c + 10)} is 10 too big.`, `That happens when the tens are not changed to 9 after lending one ten to the ones.`]); },
    (R, lvl) => { const [a, b] = genZ(R, lvl), c = a - b, A = nm(R), ok = R.chance(0.5), x = ok ? c : c + 10;
      return cho(`${A} says ${fmt(a)} − ${fmt(b)} = ${fmt(x)}. Is ${A} correct?`, ok ? 'Yes' : 'No', YN, 'Check by adding the answer to the number taken away.',
        [`Check: ${fmt(x)} + ${fmt(b)} = ${fmt(x + b)}.`, ok ? `That is ${fmt(a)}, so Yes!` : `That is not ${fmt(a)}, so No. The answer is ${fmt(c)}.`]); },
    (R, lvl) => { const [a, b] = genZ(R, lvl), z = zSteps(a, b), rg = z.rg, names = z.names;
      const mk = arr => zParts(arr, names);
      const w1 = rg.map((x, i) => i === 1 ? 10 : x), w2 = rg.map((x, i) => i === rg.length - 1 ? x + 1 : x), w3 = rg.map((x, i) => i === 0 ? x - 1 : x);
      return cho(`To find ${fmt(a)} − ${fmt(b)}, you regroup ${fmt(a)}. Which way shows ${fmt(a)} regrouped?`, z.parts, choices(z.parts, [mk(w1), mk(w2), mk(w3)]),
        'Take 1 from the biggest place. Each 0 becomes 9, and the ones get 10 more.', z.steps.slice(0, 2)); },
    (R, lvl) => { const [a, b] = genZ(R, lvl), z = zSteps(a, b), k = R.pick(z.rg[z.rg.length - 1] ? [0, 1, z.rg.length - 1] : [0, 1, z.rg.length - 2]), word = PLACE[k], v = z.rg[k];
      return num(`To subtract ${fmt(a)} − ${fmt(b)}, you regroup ${fmt(a)}. After regrouping, how many ${word} are there?`, v, 'Take 1 from the biggest place. Each 0 becomes 9, and the ones get 10 more.',
        [`${fmt(a)} = ${z.parts}.`, `So there are ${v} ${word}.`]); },
    (R, lvl) => { const [a, b] = genZ(R, lvl), c = a - b, A = nm(R), ans = `${fmt(c)} + ${fmt(b)} = ${fmt(a)}`;
      return cho(`${A} says ${fmt(a)} − ${fmt(b)} = ${fmt(c)}. Which addition checks it?`, ans, choices(ans, [`${fmt(c + 10)} + ${fmt(b)} = ${fmt(a + 10)}`, `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}`, `${fmt(c)} + ${fmt(a)} = ${fmt(a + c)}`]),
        'Answer + the number taken away should give the starting number.', [`Add the answer and the number taken away: ${fmt(c)} + ${fmt(b)}.`, `${fmt(c)} + ${fmt(b)} = ${fmt(a)} ✓`]); },
    (R, lvl) => { const [a, b] = genZ(R, lvl), c = a - b;
      return num(`What number goes in the box?  ${fmt(b)} + ☐ = ${fmt(a)}`, c, `Subtract to find the missing part: ${fmt(a)} − ${fmt(b)}.`, zSteps(a, b).steps); },
    (R, lvl) => { const [a, b] = genZ(R, lvl), c = a - b;
      return num(`What number is ${fmt(b)} less than ${fmt(a)}?`, c, `"${fmt(b)} less than ${fmt(a)}" means ${fmt(a)} − ${fmt(b)}.`, zSteps(a, b).steps); },
    (R, lvl) => { let a, b, g = 0; do { [a, b] = genZ(R, lvl); } while (a % POW[String(a).length - 1] !== 0 && g++ < 60); const c = a - b;
      return num(`Use a trick: ${fmt(a)} − ${fmt(b)} has the same answer as ${fmt(a - 1)} − ${fmt(b - 1)}. What is the answer?`, c, `Take 1 from both numbers. Now ${fmt(a - 1)} has no zeros to regroup across!`,
        [`Taking 1 from both numbers keeps the difference the same.`, `${fmt(a - 1)} − ${fmt(b - 1)}: no regrouping needed!`, ...subSteps(a - 1, b - 1), `So ${fmt(a)} − ${fmt(b)} = ${fmt(c)}.`]); },
    (R, lvl) => { const [a, b] = genZ(R, lvl), c = a - b;
      return num(`Count up from ${fmt(b)} to ${fmt(a)}. How far is it?`, c, 'The distance from one number up to another is their difference.',
        [`The distance is ${fmt(a)} − ${fmt(b)}.`, ...zSteps(a, b).steps.slice(1)]); },
    (R, lvl) => { const [a, b] = genZ(R, lvl), c = a - b, ans = `${fmt(a)} − ${fmt(b)} = ${fmt(c)}`;
      return cho(`Which number sentence is true?`, ans, choices(ans, [`${fmt(a)} − ${fmt(b)} = ${fmt(c + 10)}`, `${fmt(a)} − ${fmt(b)} = ${fmt(c + 100)}`, `${fmt(a)} − ${fmt(b)} = ${fmt(Math.abs(c - 10))}`]),
        'Solve it once, then find the sentence that matches.', zSteps(a, b).steps); }
  ];
  M['g3.subzero'] = { name:'Subtract across zeros', unit:'g3u2', gen(R, lvl){ return R.pick(SUBZERO)(R, lvl); } };

  // =====================================================================================================
  // g3.missing -- missing numbers and the meaning of the equal sign
  // =====================================================================================================
  function mv(R, lvl){ return lvl === 1 ? R.int(2, 12) : lvl === 2 ? R.int(11, 60) : R.int(105, 499); }
  const HEQ = 'The = sign means BOTH sides are worth the same. Find the side you can work out first.';
  const MISSING = [
    (R, lvl) => { const a = mv(R, lvl), b = mv(R, lvl), s = a + b, c = (lvl === 1 && s > 10 && R.chance(0.6)) ? 10 : R.int(1, s - 1), d = s - c;
      return num(`What number goes in the box?  ${fmt(a)} + ${fmt(b)} = ${fmt(c)} + ☐`, d, HEQ, [`Left side: ${fmt(a)} + ${fmt(b)} = ${fmt(s)}.`, `So ${fmt(c)} + ☐ must also be ${fmt(s)}.`, `${fmt(s)} − ${fmt(c)} = ${fmt(d)}. The box is ${fmt(d)}.`]); },
    (R, lvl) => { const t = mv(R, lvl) + mv(R, lvl), x = R.int(1, t - 1), r = t - x;
      return num(`What number goes in the box?  ${fmt(t)} − ☐ = ${fmt(r)}`, x, `What do you take away from ${fmt(t)} to get ${fmt(r)}? Think: ${fmt(r)} + ☐ = ${fmt(t)}.`,
        [`Turn it around: ${fmt(r)} + ☐ = ${fmt(t)}.`, `${fmt(t)} − ${fmt(r)} = ${fmt(x)}.`, `Check: ${fmt(t)} − ${fmt(x)} = ${fmt(r)} ✓`]); },
    (R, lvl) => { const b = mv(R, lvl), r = mv(R, lvl), t = b + r;
      return num(`What number goes in the box?  ☐ − ${fmt(b)} = ${fmt(r)}`, t, `The box is the starting number. Add back what was taken away.`,
        [`If you take ${fmt(b)} away and get ${fmt(r)}, the start was ${fmt(r)} + ${fmt(b)}.`, `${fmt(r)} + ${fmt(b)} = ${fmt(t)}.`, `Check: ${fmt(t)} − ${fmt(b)} = ${fmt(r)} ✓`]); },
    (R, lvl) => { const a = mv(R, lvl), x = mv(R, lvl), s = a + x;
      return num(`What number goes in the box?  ${fmt(a)} + ☐ = ${fmt(s)}`, x, `Subtract to find the missing part: ${fmt(s)} − ${fmt(a)}.`,
        [`The missing part is the total minus the part you know.`, `${fmt(s)} − ${fmt(a)} = ${fmt(x)}.`, `Check: ${fmt(a)} + ${fmt(x)} = ${fmt(s)} ✓`]); },
    (R, lvl) => { const b = mv(R, lvl), x = mv(R, lvl), s = b + x;
      return num(`What number goes in the box?  ☐ + ${fmt(b)} = ${fmt(s)}`, x, `What plus ${fmt(b)} makes ${fmt(s)}?`,
        [`☐ = ${fmt(s)} − ${fmt(b)}.`, `${fmt(s)} − ${fmt(b)} = ${fmt(x)}.`, `Check: ${fmt(x)} + ${fmt(b)} = ${fmt(s)} ✓`]); },
    (R, lvl) => { const a = mv(R, lvl), k = mv(R, lvl), s = a + k, y = R.int(1, Math.max(2, Math.floor(s / 2))), x = s + y;
      return num(`What number goes in the box?  ${fmt(a)} + ☐ = ${fmt(x)} − ${fmt(y)}`, k, HEQ, [`Right side: ${fmt(x)} − ${fmt(y)} = ${fmt(s)}.`, `So ${fmt(a)} + ☐ = ${fmt(s)}.`, `${fmt(s)} − ${fmt(a)} = ${fmt(k)}. The box is ${fmt(k)}.`]); },
    (R, lvl) => { const a = mv(R, lvl), k = mv(R, lvl), s = a + k, y = R.int(1, Math.max(2, Math.floor(s / 2))), x = s + y;
      return num(`What number goes in the box?  ${fmt(x)} − ${fmt(y)} = ☐ + ${fmt(a)}`, k, HEQ, [`Left side: ${fmt(x)} − ${fmt(y)} = ${fmt(s)}.`, `So ☐ + ${fmt(a)} = ${fmt(s)}.`, `${fmt(s)} − ${fmt(a)} = ${fmt(k)}. The box is ${fmt(k)}.`]); },
    (R, lvl) => { const a = mv(R, lvl), b = mv(R, lvl), s = a + b, c = R.int(1, s - 1), d = s - c;
      return num(`What number goes in the box?  ${fmt(a)} + ${fmt(b)} = ☐ + ${fmt(c)}`, d, HEQ, [`Left side: ${fmt(a)} + ${fmt(b)} = ${fmt(s)}.`, `So ☐ + ${fmt(c)} = ${fmt(s)}.`, `${fmt(s)} − ${fmt(c)} = ${fmt(d)}.`]); },
    (R, lvl) => { const b = mv(R, lvl), r = mv(R, lvl), a = b + r, c = mv(R, lvl), x = r + c;
      return num(`What number goes in the box?  ${fmt(a)} − ${fmt(b)} = ☐ − ${fmt(c)}`, x, HEQ, [`Left side: ${fmt(a)} − ${fmt(b)} = ${fmt(r)}.`, `So ☐ − ${fmt(c)} = ${fmt(r)}.`, `${fmt(r)} + ${fmt(c)} = ${fmt(x)}. The box is ${fmt(x)}.`]); },
    (R, lvl) => { const a = mv(R, lvl), b = mv(R, lvl), s = a + b; let c; do { c = R.int(1, s - 1); } while (c === a || c === b); const ok = R.chance(0.5);
      let d = s - c; if (!ok) d = d + R.pick([1, 2, -1, 10]); if (d <= 0) d = s - c + 1; const tru = c + d === s;
      return cho(`Is this true or false?  ${fmt(a)} + ${fmt(b)} = ${fmt(c)} + ${fmt(d)}`, tru ? 'True' : 'False', TF, 'Work out each side. True means both sides are the same.',
        [`Left: ${fmt(a)} + ${fmt(b)} = ${fmt(s)}.`, `Right: ${fmt(c)} + ${fmt(d)} = ${fmt(c + d)}.`, tru ? `Both are ${fmt(s)}, so it is true.` : `${fmt(s)} and ${fmt(c + d)} are different, so it is false.`]); },
    (R, lvl) => { const b = mv(R, lvl), r = mv(R, lvl), a = b + r, d = mv(R, lvl); let c = r + d; const ok = R.chance(0.5); if (!ok) c += R.pick([1, 2, 10]); const tru = c - d === r;
      return cho(`Is this true or false?  ${fmt(a)} − ${fmt(b)} = ${fmt(c)} − ${fmt(d)}`, tru ? 'True' : 'False', TF, 'Work out each side. True means both sides are the same.',
        [`Left: ${fmt(a)} − ${fmt(b)} = ${fmt(r)}.`, `Right: ${fmt(c)} − ${fmt(d)} = ${fmt(c - d)}.`, tru ? `Both are ${fmt(r)}, so it is true.` : `${fmt(r)} and ${fmt(c - d)} are different, so it is false.`]); },
    (R, lvl) => { const a = mv(R, lvl), b = mv(R, lvl), s = a + b, c = R.int(1, s - 1), d = s - c;
      return cho(`Which number makes this true?  ${fmt(a)} + ${fmt(b)} = ☐ + ${fmt(c)}`, fmt(d), nch(d, [s, s + c, d + 1], [1, 2]), 'Both sides must be worth the same. The box is NOT just the answer to the left side!',
        [`Left side: ${fmt(a)} + ${fmt(b)} = ${fmt(s)}.`, `☐ + ${fmt(c)} = ${fmt(s)}, so ☐ = ${fmt(s)} − ${fmt(c)} = ${fmt(d)}.`]); },
    (R, lvl) => { const a = mv(R, lvl), b = mv(R, lvl), s = a + b, c = R.int(1, s - 1), d = s - c, A = nm(R);
      return num(`${A} wrote ${fmt(s)} in the box:  ${fmt(a)} + ${fmt(b)} = ${fmt(c)} + ☐. That is not right. What number belongs in the box?`, d, `${fmt(s)} is the value of the left side. The right side must ALSO be ${fmt(s)}.`,
        [`${A} wrote the sum of the left side, but = means "the same as".`, `${fmt(c)} + ☐ = ${fmt(s)}.`, `${fmt(s)} − ${fmt(c)} = ${fmt(d)}. The box is ${fmt(d)}.`]); },
    (R, lvl) => { const a = mv(R, lvl), b = mv(R, lvl), s = a + b, c = R.int(1, s - 1), d = s - c, ans = 'Both sides have the same value';
      return cho(`In ${fmt(a)} + ${fmt(b)} = ${fmt(c)} + ${fmt(d)}, what does the = sign mean?`, ans, choices(ans, ['The answer comes next', 'Add all the numbers', 'The right side is bigger']),
        'Look at both sides. What is each side worth?', [`Left: ${fmt(a)} + ${fmt(b)} = ${fmt(s)}.`, `Right: ${fmt(c)} + ${fmt(d)} = ${fmt(s)}.`, `= means both sides are the same amount.`]); },
    (R, lvl) => { const a = mv(R, lvl), b = mv(R, lvl), s = a + b, c = R.int(1, s - 1), d = s - c, ans = `${fmt(a)} + ${fmt(b)} = ${fmt(c)} + ${fmt(d)}`;
      const w1 = `${fmt(a)} + ${fmt(b)} = ${fmt(c)} + ${fmt(d + 1)}`, w2 = `${fmt(a)} + ${fmt(b)} = ${fmt(s)} + ${fmt(c)}`, w3 = `${fmt(a)} + ${fmt(b + 1)} = ${fmt(c)} + ${fmt(d)}`;
      return cho(`Which equation is true?`, ans, choices(ans, [w1, w2, w3]), 'Find the value of each side. A true equation has two sides that match.',
        [`${fmt(a)} + ${fmt(b)} = ${fmt(s)} and ${fmt(c)} + ${fmt(d)} = ${fmt(s)}.`, `Both sides are ${fmt(s)}, so ${ans} is true.`]); },
    (R, lvl) => { const a = mv(R, lvl), b = mv(R, lvl), s = a + b, c = R.int(1, s - 1), d = s - c;
      return num(`A balance scale has ${fmt(a)} cubes and ${fmt(b)} cubes on the left side. The right side has ${fmt(c)} cubes. How many more cubes go on the right side to make it balance?`, d, 'Balanced means both sides have the same number of cubes.',
        [`Left side: ${fmt(a)} + ${fmt(b)} = ${fmt(s)} cubes.`, `${fmt(c)} + ☐ = ${fmt(s)}.`, `${fmt(s)} − ${fmt(c)} = ${fmt(d)} more cubes.`], { unit:'cubes' }); },
    (R, lvl) => { const b = mv(R, lvl), r = mv(R, lvl), t = b + r, A = nm(R);
      return num(`${A} had some stickers. ${A} gave away ${fmt(b)} and has ${fmt(r)} left. How many stickers did ${A} have at the start?`, t, 'Write it as ☐ − given away = left. Add back to find the start.',
        [`☐ − ${fmt(b)} = ${fmt(r)}.`, `☐ = ${fmt(r)} + ${fmt(b)} = ${fmt(t)}.`, `${A} had ${fmt(t)} stickers.`], { unit:'stickers' }); },
    (R, lvl) => { const a = mv(R, lvl), x = mv(R, lvl), s = a + x, A = nm(R);
      return num(`${A} has ${fmt(a)} cards. How many more cards does ${A} need to have ${fmt(s)} cards?`, x, `Write it as ${fmt(a)} + ☐ = ${fmt(s)}.`,
        [`${fmt(a)} + ☐ = ${fmt(s)}.`, `${fmt(s)} − ${fmt(a)} = ${fmt(x)}.`, `${A} needs ${fmt(x)} more cards.`], { unit:'cards' }); },
    (R, lvl) => { const b = mv(R, lvl), a = b + mv(R, lvl), plus = R.chance(0.5), c = plus ? a + b : a - b, ans = plus ? '+' : '−';
      return cho(`Which sign makes this true?  ${fmt(a)} ☐ ${fmt(b)} = ${fmt(c)}`, ans, ['+', '−'], `Is ${fmt(c)} bigger or smaller than ${fmt(a)}?`,
        [`${fmt(c)} is ${plus ? 'bigger' : 'smaller'} than ${fmt(a)}.`, `${fmt(a)} ${ans} ${fmt(b)} = ${fmt(c)} ✓`]); },
    (R, lvl) => { const a = mv(R, lvl), b = mv(R, lvl), x = mv(R, lvl), s = a + b + x, c = R.int(1, s - 1), d = s - c;
      return num(`What number goes in the box?  ${fmt(a)} + ${fmt(b)} + ☐ = ${fmt(c)} + ${fmt(d)}`, x, HEQ,
        [`Right side: ${fmt(c)} + ${fmt(d)} = ${fmt(s)}.`, `Left side so far: ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`, `${fmt(s)} − ${fmt(a + b)} = ${fmt(x)}. The box is ${fmt(x)}.`]); },
    (R, lvl) => { const d = lvl === 1 ? R.int(5, 9) : lvl === 2 ? R.int(15, 49) : R.int(150, 499), s = 2 * d, e = lvl === 1 ? 10 : lvl === 2 ? R.pick([20, 30, 40, 50]) : R.pick([100, 200, 300, 400, 500]);
      const ee = e < s ? e : Math.floor(s / 2), x = s - ee;
      return num(`What number goes in the box?  ${fmt(d)} + ${fmt(d)} = ${fmt(ee)} + ☐`, x, 'Find the double first. Then the other side must match it.',
        [`Double: ${fmt(d)} + ${fmt(d)} = ${fmt(s)}.`, `${fmt(ee)} + ☐ = ${fmt(s)}.`, `${fmt(s)} − ${fmt(ee)} = ${fmt(x)}.`]); },
    (R, lvl) => { const b = mv(R, lvl), c = mv(R, lvl), s = b + c, a = R.int(1, s - 1), x = s - a;
      return num(`What number goes in the box?  ☐ + ${fmt(a)} = ${fmt(b)} + ${fmt(c)}`, x, HEQ, [`Right side: ${fmt(b)} + ${fmt(c)} = ${fmt(s)}.`, `☐ + ${fmt(a)} = ${fmt(s)}.`, `${fmt(s)} − ${fmt(a)} = ${fmt(x)}.`]); }
  ];
  M['g3.missing'] = { name:'Missing numbers & balance', unit:'g3u2', gen(R, lvl){ return R.pick(MISSING)(R, lvl); } };

  // =====================================================================================================
  // g3.twostep -- two-step add/subtract word problems
  // =====================================================================================================
  function tv(R, lvl){ return lvl === 1 ? R.int(4, 15) : lvl === 2 ? R.int(12, 49) : R.int(105, 399); }
  const H2 = 'Two steps! Do the first part, then use that answer for the second part.';
  const TWOSTEP = [
    (R, lvl) => { const [A, B] = nms(R, 2), x = tv(R, lvl), y = tv(R, lvl), u = R.int(2, x + y - 2), l = x + y - u;
      return num(`${A} peeled ${fmt(x)} potatoes and ${B} peeled ${fmt(y)}. Their mom used ${fmt(u)} to make mashed potatoes. How many peeled potatoes are left over?`, l, H2,
        [`Step 1: peeled in all: ${fmt(x)} + ${fmt(y)} = ${fmt(x + y)}.`, `Step 2: take away the ones used: ${fmt(x + y)} − ${fmt(u)} = ${fmt(l)}.`, `${fmt(l)} potatoes are left over.`], { unit:'potatoes' }); },
    (R, lvl) => { const m = tv(R, lvl), w = tv(R, lvl), t = m + w + tv(R, lvl), l = t - m - w;
      return num(`There were ${fmt(t)} rolls at the Thanksgiving dinner. The kids ate ${fmt(m)} rolls and the grown-ups ate ${fmt(w)} rolls. How many rolls were left?`, l, H2,
        [`Step 1: rolls eaten: ${fmt(m)} + ${fmt(w)} = ${fmt(m + w)}.`, `Step 2: ${fmt(t)} − ${fmt(m + w)} = ${fmt(l)}.`, `${fmt(l)} rolls were left.`], { unit:'rolls' }); },
    (R, lvl) => { const A = nm(R), h = tv(R, lvl), m = tv(R, lvl), g = R.int(2, h + m - 2), l = h + m - g;
      return num(`${A} had ${fmt(h)} cans for the food drive. ${A} collected ${fmt(m)} more, then gave ${fmt(g)} to the school. How many cans does ${A} have now?`, l, H2,
        [`Step 1: ${fmt(h)} + ${fmt(m)} = ${fmt(h + m)}.`, `Step 2: ${fmt(h + m)} − ${fmt(g)} = ${fmt(l)}.`, `${A} has ${fmt(l)} cans now.`], { unit:'cans' }); },
    (R, lvl) => { const a = tv(R, lvl), p = tv(R, lvl), e = R.int(2, a + p - 2), l = a + p - e;
      return num(`A family baked ${fmt(a)} apple tarts and ${fmt(p)} pumpkin tarts for Thanksgiving. They ate ${fmt(e)} tarts. How many tarts are left?`, l, H2,
        [`Step 1: tarts baked: ${fmt(a)} + ${fmt(p)} = ${fmt(a + p)}.`, `Step 2: ${fmt(a + p)} − ${fmt(e)} = ${fmt(l)}.`, `${fmt(l)} tarts are left.`], { unit:'tarts' }); },
    (R, lvl) => { const a = tv(R, lvl), b = tv(R, lvl), o = R.int(1, a + b - 1), d = a + b - o;
      return num(`The Eagles scored ${fmt(a)} points in the first half and ${fmt(b)} points in the second half. The Hawks scored ${fmt(o)} points in the whole game. How many more points did the Eagles score?`, d, H2,
        [`Step 1: Eagles in all: ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`, `Step 2: compare: ${fmt(a + b)} − ${fmt(o)} = ${fmt(d)}.`, `The Eagles scored ${fmt(d)} more points.`], { unit:'points' }); },
    (R, lvl) => { const h = tv(R, lvl) + tv(R, lvl), n = tv(R, lvl), o = R.int(1, h + n - 1), l = h + n - o;
      return num(`The school library had ${fmt(h)} books. It got ${fmt(n)} new books. Then students checked out ${fmt(o)} books. How many books are still on the shelves?`, l, H2,
        [`Step 1: ${fmt(h)} + ${fmt(n)} = ${fmt(h + n)} books.`, `Step 2: ${fmt(h + n)} − ${fmt(o)} = ${fmt(l)}.`, `${fmt(l)} books are on the shelves.`], { unit:'books' }); },
    (R, lvl) => { const A = nm(R), h = tv(R, lvl), e = tv(R, lvl), s = R.int(1, h + e - 1), l = h + e - s;
      return num(`${A} had $${fmt(h)}. ${A} earned $${fmt(e)} raking leaves, then spent $${fmt(s)} on a game. How many dollars does ${A} have now?`, l, H2,
        [`Step 1: ${fmt(h)} + ${fmt(e)} = ${fmt(h + e)} dollars.`, `Step 2: ${fmt(h + e)} − ${fmt(s)} = ${fmt(l)}.`, `${A} has $${fmt(l)}.`], { unit:'dollars' }); },
    (R, lvl) => { const A = nm(R), x = tv(R, lvl), y = tv(R, lvl), step = lvl === 1 ? 10 : lvl === 2 ? 10 : 100, P = (Math.floor((x + y) / step) + R.int(1, 3)) * step, ch = P - x - y;
      return num(`${A} bought a book for $${fmt(x)} and a toy for $${fmt(y)}. ${A} paid with $${fmt(P)}. How many dollars of change did ${A} get back?`, ch, H2,
        [`Step 1: cost in all: ${fmt(x)} + ${fmt(y)} = ${fmt(x + y)} dollars.`, `Step 2: change: ${fmt(P)} − ${fmt(x + y)} = ${fmt(ch)}.`, `${A} gets $${fmt(ch)} back.`], { unit:'dollars' }); },
    (R, lvl) => { const [A, B] = nms(R, 2), a = tv(R, lvl), b = tv(R, lvl), c = R.int(1, a + b - 1), d = a + b - c;
      return num(`${A} had ${fmt(a)} marbles and then won ${fmt(b)} more. ${B} has ${fmt(c)} marbles. How many more marbles does ${A} have than ${B} now?`, d, H2,
        [`Step 1: ${A} now has ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`, `Step 2: compare: ${fmt(a + b)} − ${fmt(c)} = ${fmt(d)}.`, `${A} has ${fmt(d)} more marbles.`], { unit:'marbles' }); },
    (R, lvl) => { const a = tv(R, lvl) + tv(R, lvl), off = R.int(1, a - 1), on = tv(R, lvl), n = a - off + on;
      return num(`There were ${fmt(a)} people on a bus. At the first stop, ${fmt(off)} people got off and ${fmt(on)} people got on. How many people are on the bus now?`, n, H2,
        [`Step 1: after ${fmt(off)} got off: ${fmt(a)} − ${fmt(off)} = ${fmt(a - off)}.`, `Step 2: after ${fmt(on)} got on: ${fmt(a - off)} + ${fmt(on)} = ${fmt(n)}.`, `${fmt(n)} people are on the bus.`], { unit:'people' }); },
    (R, lvl) => { const A = nm(R), m = tv(R, lvl), t = tv(R, lvl), P = m + t + tv(R, lvl), l = P - m - t;
      return num(`A book has ${fmt(P)} pages. ${A} read ${fmt(m)} pages on Monday and ${fmt(t)} pages on Tuesday. How many pages are left to read?`, l, H2,
        [`Step 1: pages read: ${fmt(m)} + ${fmt(t)} = ${fmt(m + t)}.`, `Step 2: ${fmt(P)} − ${fmt(m + t)} = ${fmt(l)}.`, `${fmt(l)} pages are left.`], { unit:'pages' }); },
    (R, lvl) => { const a = tv(R, lvl), b = tv(R, lvl), r = R.int(1, a + b - 1), w = a + b - r;
      return num(`On a field trip, there were ${fmt(a)} third graders and ${fmt(b)} fourth graders. ${fmt(r)} students rode the bus and the rest walked. How many students walked?`, w, H2,
        [`Step 1: students in all: ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`, `Step 2: ${fmt(a + b)} − ${fmt(r)} = ${fmt(w)} walked.`, `${fmt(w)} students walked.`], { unit:'students' }); },
    (R, lvl) => { const A = nm(R), t = tv(R, lvl), p = tv(R, lvl), G = t + p + tv(R, lvl), n = G - t - p;
      return num(`${A} wants to pick ${fmt(G)} vegetables from the garden. ${A} picked ${fmt(t)} tomatoes and ${fmt(p)} peppers. How many more vegetables does ${A} need to pick?`, n, H2,
        [`Step 1: picked so far: ${fmt(t)} + ${fmt(p)} = ${fmt(t + p)}.`, `Step 2: ${fmt(G)} − ${fmt(t + p)} = ${fmt(n)}.`, `${A} needs ${fmt(n)} more.`], { unit:'vegetables' }); },
    (R, lvl) => { const a = tv(R, lvl) + tv(R, lvl), f = R.int(1, a - 1), b = a - f, t = a + b;
      return num(`The Blue Team collected ${fmt(a)} cans. The Green Team collected ${fmt(f)} fewer cans than the Blue Team. How many cans did both teams collect?`, t, H2,
        [`Step 1: Green Team: ${fmt(a)} − ${fmt(f)} = ${fmt(b)}.`, `Step 2: both teams: ${fmt(a)} + ${fmt(b)} = ${fmt(t)}.`, `They collected ${fmt(t)} cans.`], { unit:'cans' }); },
    (R, lvl) => { const [A, B] = nms(R, 2), a = tv(R, lvl), m = tv(R, lvl), b = a + m, t = a + b;
      return num(`${A} read ${fmt(a)} pages. ${B} read ${fmt(m)} more pages than ${A}. How many pages did they read together?`, t, H2,
        [`Step 1: ${B}: ${fmt(a)} + ${fmt(m)} = ${fmt(b)}.`, `Step 2: together: ${fmt(a)} + ${fmt(b)} = ${fmt(t)}.`, `They read ${fmt(t)} pages.`], { unit:'pages' }); },
    (R, lvl) => { const k = tv(R, lvl), g = tv(R, lvl), n = R.int(1, k + g - 1), r = k + g - n;
      return num(`For the Turkey Trot race, ${fmt(k)} kids and ${fmt(g)} grown-ups signed up. ${fmt(n)} people did not come. How many people ran the race?`, r, H2,
        [`Step 1: signed up: ${fmt(k)} + ${fmt(g)} = ${fmt(k + g)}.`, `Step 2: ${fmt(k + g)} − ${fmt(n)} = ${fmt(r)}.`, `${fmt(r)} people ran.`], { unit:'people' }); },
    (R, lvl) => { const f = tv(R, lvl), s = tv(R, lvl), t = f + s + tv(R, lvl), l = t - f - s;
      return num(`The lunchroom had ${fmt(t)} cartons of milk. Kids took ${fmt(f)} at first lunch and ${fmt(s)} at second lunch. How many cartons are left?`, l, H2,
        [`Step 1: taken: ${fmt(f)} + ${fmt(s)} = ${fmt(f + s)}.`, `Step 2: ${fmt(t)} − ${fmt(f + s)} = ${fmt(l)}.`, `${fmt(l)} cartons are left.`], { unit:'cartons' }); },
    (R, lvl) => { const [A, B] = nms(R, 2), a = tv(R, lvl), b = tv(R, lvl), c = R.int(1, a + b - 1), d = a + b - c;
      return num(`In a game, ${A} scored ${fmt(a)} points in round 1 and ${fmt(b)} points in round 2. ${B} scored ${fmt(c)} points in all. How many fewer points did ${B} score than ${A}?`, d, H2,
        [`Step 1: ${A} in all: ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`, `Step 2: ${fmt(a + b)} − ${fmt(c)} = ${fmt(d)}.`, `${B} scored ${fmt(d)} fewer points.`], { unit:'points' }); },
    (R, lvl) => { const A = nm(R), h = tv(R, lvl), g = tv(R, lvl), T = h + g + tv(R, lvl), n = T - h - g;
      return num(`${A} wants a scooter that costs $${fmt(T)}. ${A} has $${fmt(h)} and gets $${fmt(g)} for a birthday. How many more dollars does ${A} need?`, n, H2,
        [`Step 1: money now: ${fmt(h)} + ${fmt(g)} = ${fmt(h + g)}.`, `Step 2: ${fmt(T)} − ${fmt(h + g)} = ${fmt(n)}.`, `${A} needs $${fmt(n)} more.`], { unit:'dollars' }); },
    (R, lvl) => { const A = nm(R), h = tv(R, lvl), l = R.int(1, h - 1), f = tv(R, lvl), n = h - l + f;
      return num(`${A} had ${fmt(h)} stamps. ${A} lost ${fmt(l)} stamps, then found ${fmt(f)} new ones at a yard sale. How many stamps does ${A} have now?`, n, H2,
        [`Step 1: after losing some: ${fmt(h)} − ${fmt(l)} = ${fmt(h - l)}.`, `Step 2: after finding more: ${fmt(h - l)} + ${fmt(f)} = ${fmt(n)}.`, `${A} has ${fmt(n)} stamps.`], { unit:'stamps' }); },
    (R, lvl) => { const f = tv(R, lvl), s = tv(R, lvl), G = R.int(1, f + s - 1), o = f + s - G;
      return num(`The school play sold ${fmt(f)} tickets on Friday and ${fmt(s)} tickets on Saturday. The goal was ${fmt(G)} tickets. How many more tickets than the goal did they sell?`, o, H2,
        [`Step 1: sold: ${fmt(f)} + ${fmt(s)} = ${fmt(f + s)}.`, `Step 2: ${fmt(f + s)} − ${fmt(G)} = ${fmt(o)}.`, `They sold ${fmt(o)} more than the goal.`], { unit:'tickets' }); },
    (R, lvl) => { const g = tv(R, lvl), b = tv(R, lvl), c = R.int(1, g + b - 1), d = g + b - c;
      return num(`Class A has ${fmt(g)} girls and ${fmt(b)} boys in its after-school club. Class B has ${fmt(c)} students in its club. How many more students are in Class A's club?`, d, H2,
        [`Step 1: Class A: ${fmt(g)} + ${fmt(b)} = ${fmt(g + b)}.`, `Step 2: ${fmt(g + b)} − ${fmt(c)} = ${fmt(d)}.`, `Class A has ${fmt(d)} more.`], { unit:'students' }); }
  ];
  M['g3.twostep'] = { name:'Two-step word problems', unit:'g3u2', gen(R, lvl){ return R.pick(TWOSTEP)(R, lvl); } };

  // =====================================================================================================
  // Rounding: g3.round (tens, hundreds, thousands) and g3.round100 (always the nearest hundred)
  // =====================================================================================================
  function rInfo(n, P){ const lo = Math.floor(n / P) * P, hi = lo + P, mid = lo + P / 2, a = roundTo(n, P); return { lo, hi, mid, a }; }
  function rSteps(n, P){ const { lo, hi, mid, a } = rInfo(n, P);
    return [`${fmt(n)} is between ${fmt(lo)} and ${fmt(hi)}.`, `The halfway point is ${fmt(mid)}.`,
      n >= mid ? `${fmt(n)} is at or past ${fmt(mid)}, so round up.` : `${fmt(n)} is before ${fmt(mid)}, so round down.`, `${fmt(n)} rounds to ${fmt(a)}.`]; }
  function rHint(n, P){ const W = pw(P); return `Which two ${W}s is ${fmt(n)} between? Look at the digit to the right of the ${PLACE[Math.log10(P)]} place: 5 or more rounds up.`; }
  // a number to round: not a multiple of P; about 1 in 7 is exactly halfway (the 5-rounds-up rule)
  function rGen(R, rng, P, half){ const [lo, hi] = rng; let n, g = 0;
    if (half === true || (half === undefined && R.chance(0.14))){ do { n = (Math.floor(R.int(lo, hi) / P)) * P + P / 2; } while ((n < lo || n > hi) && g++ < 40); if (n >= lo && n <= hi) return n; }
    do { n = R.int(lo, hi); } while (n % P === 0 || (half === false && n % P === P / 2)); return n; }
  function boxDisplay(n, k){ const s = String(n).split(''); const i = s.length - 1 - k; s[i] = '☐'; let out = ''; for (let j = 0; j < s.length; j++){ out += s[j]; const rem = s.length - 1 - j; if (rem > 0 && rem % 3 === 0) out += ','; } return out; }
  const ROUND_T = [
    (R, lvl, P, g) => { const n = g(); return num(`Round ${fmt(n)} to the nearest ${pw(P)}.`, roundTo(n, P), rHint(n, P), rSteps(n, P)); },
    (R, lvl, P, g) => { const n = g(), i = rInfo(n, P);
      return num(`Use the number line. Round ${fmt(n)} to the nearest ${pw(P)}.`, i.a, `Is ${fmt(n)} closer to ${fmt(i.lo)} or to ${fmt(i.hi)} on the line?`, rSteps(n, P),
        { model:{ type:'numberline', min:i.lo, max:i.hi, step:P / 10, label:P / 2, points:[{ x:n, label:fmt(n) }] } }); },
    (R, lvl, P, g) => { const n = g(false), i = rInfo(n, P);
      return cho(`${fmt(n)} is between ${fmt(i.lo)} and ${fmt(i.hi)}. Which one is it closer to?`, fmt(i.a), [fmt(i.lo), fmt(i.hi)], `Find the halfway point, ${fmt(i.mid)}. Which side is ${fmt(n)} on?`, rSteps(n, P),
        { model:{ type:'numberline', min:i.lo, max:i.hi, step:P / 10, label:P / 2, points:[{ x:n, label:fmt(n) }] } }); },
    (R, lvl, P, g) => { const n = g(), i = rInfo(n, P);
      return num(`What number is exactly halfway between ${fmt(i.lo)} and ${fmt(i.hi)}?`, i.mid, `Halfway between two ${pw(P)}s is the number that ends in ${P === 10 ? '5' : P === 100 ? '50' : '500'}.`,
        [`From ${fmt(i.lo)} to ${fmt(i.hi)} is ${fmt(P)}.`, `Half of ${fmt(P)} is ${fmt(P / 2)}.`, `${fmt(i.lo)} + ${fmt(P / 2)} = ${fmt(i.mid)}.`]); },
    (R, lvl, P, g) => { const n = g(true), i = rInfo(n, P);
      return cho(`${fmt(n)} is exactly halfway between ${fmt(i.lo)} and ${fmt(i.hi)}. What does it round to, to the nearest ${pw(P)}?`, fmt(i.hi), [fmt(i.lo), fmt(i.hi)],
        'The rule: when a number is exactly halfway, round UP.', [`${fmt(n)} is right in the middle.`, `The rule says 5 rounds up.`, `So ${fmt(n)} rounds up to ${fmt(i.hi)}.`]); },
    (R, lvl, P, g) => { const Rr = roundTo(g(), P), h = P / 2; let c; do { c = R.int(Rr - h, Rr + h - 1); } while (c === Rr || c <= 0);
      const outs = R.shuffle([R.int(Rr + h, Rr + P - 1), R.int(Rr + h, Rr + P - 1), Rr - h - 1 > 0 ? R.int(Math.max(1, Rr - P + 1), Rr - h - 1) : Rr + P + 1, Rr + h]);
      return cho(`Which number rounds to ${fmt(Rr)} when you round to the nearest ${pw(P)}?`, fmt(c), nch(c, outs, [P, P * 2]), `Numbers from ${fmt(Rr - h)} up to ${fmt(Rr + h - 1)} round to ${fmt(Rr)}.`,
        [`Numbers that round to ${fmt(Rr)} go from ${fmt(Rr - h)} (halfway, rounds up) to ${fmt(Rr + h - 1)}.`, `${fmt(c)} is in that range.`, ...rSteps(c, P).slice(-1)]); },
    (R, lvl, P, g) => { const Rr = roundTo(g(), P), ans = Rr + P / 2 - 1;
      return num(`What is the greatest whole number that rounds to ${fmt(Rr)} when rounding to the nearest ${pw(P)}?`, ans, `${fmt(Rr + P / 2)} is halfway, and halfway rounds UP to ${fmt(Rr + P)}. So go one less.`,
        [`${fmt(Rr + P / 2)} rounds up to ${fmt(Rr + P)}.`, `One less is ${fmt(ans)}, which still rounds down to ${fmt(Rr)}.`, `The greatest is ${fmt(ans)}.`]); },
    (R, lvl, P, g) => { const Rr = roundTo(g(), P), ans = Rr - P / 2;
      return num(`What is the least whole number that rounds to ${fmt(Rr)} when rounding to the nearest ${pw(P)}?`, ans, `Halfway between ${fmt(Rr - P)} and ${fmt(Rr)} rounds UP. What is that halfway number?`,
        [`Halfway between ${fmt(Rr - P)} and ${fmt(Rr)} is ${fmt(ans)}.`, `Halfway rounds up, so ${fmt(ans)} rounds to ${fmt(Rr)}.`, `${fmt(ans - 1)} would round down, so the least is ${fmt(ans)}.`]); },
    (R, lvl, P, g) => { const n = g(); return num(`A school has ${fmt(n)} students. About how many students is that, rounded to the nearest ${pw(P)}?`, roundTo(n, P), rHint(n, P), rSteps(n, P), { unit:'students' }); },
    (R, lvl, P, g) => { const n = g(), A = nm(R); return num(`${A}'s family drove ${fmt(n)} miles on a trip. Rounded to the nearest ${pw(P)}, about how many miles did they drive?`, roundTo(n, P), rHint(n, P), rSteps(n, P), { unit:'miles' }); },
    (R, lvl, P, g) => { const n = g(); return num(`${fmt(n)} fans came to a football game. About how many fans came, to the nearest ${pw(P)}?`, roundTo(n, P), rHint(n, P), rSteps(n, P), { unit:'fans' }); },
    (R, lvl, P, g) => { const n = g(); return num(`A TV costs $${fmt(n)}. About how many dollars is that, to the nearest ${pw(P)}?`, roundTo(n, P), rHint(n, P), rSteps(n, P), { unit:'dollars' }); },
    (R, lvl, P, g) => { const n = g(); return num(`A jar at the fair holds ${fmt(n)} jelly beans. Round to the nearest ${pw(P)}: about how many jelly beans are in the jar?`, roundTo(n, P), rHint(n, P), rSteps(n, P)); },
    (R, lvl, P, g) => { const n = g(), i = rInfo(n, P), A = nm(R), ok = R.chance(0.5), x = ok ? i.a : (i.a === i.lo ? i.hi : i.lo);
      return cho(`${A} rounded ${fmt(n)} to the nearest ${pw(P)} and got ${fmt(x)}. Is ${A} correct?`, ok ? 'Yes' : 'No', YN, rHint(n, P), [...rSteps(n, P), ok ? `${A} is right!` : `${A} said ${fmt(x)}, so No.`]); },
    (R, lvl, P, g) => { const n = g(), i = rInfo(n, P), A = nm(R), w = i.a === i.lo ? i.hi : i.lo;
      return num(`${A} rounded ${fmt(n)} to the nearest ${pw(P)} and got ${fmt(w)}. That is not right. What is the correct answer?`, i.a, rHint(n, P), rSteps(n, P)); },
    (R, lvl, P, g) => { const n = g(), k = Math.log10(P) - 1, ans = `the ${PLACE[k]} digit`;
      const ch = [k - 1, k, k + 1, k + 2].filter(x => x >= 0 && x < String(n).length).map(x => `the ${PLACE[x]} digit`);
      return cho(`To round ${fmt(n)} to the nearest ${pw(P)}, which digit do you look at?`, ans, choices(ans, ch), `Look one place to the right of the ${PLACE[k + 1]} place.`,
        [`You are rounding to the ${PLACE[k + 1]} place.`, `Look at the digit just to its right: the ${PLACE[k]} digit.`, `If it is 5 or more, round up. If it is 4 or less, round down.`]); },
    (R, lvl, P, g) => { const n = g(false), i = rInfo(n, P), W = pw(P), ans = `${fmt(i.lo)} and ${fmt(i.hi)}`;
      const ds = [`${fmt(i.hi)} and ${fmt(i.hi + P)}`, i.lo - P >= 0 ? `${fmt(i.lo - P)} and ${fmt(i.lo)}` : `${fmt(i.hi + P)} and ${fmt(i.hi + 2 * P)}`, `${fmt(i.lo + P / 10)} and ${fmt(i.hi + P / 10)}`];
      return cho(`${fmt(n)} is between which two ${W}s?`, ans, choices(ans, ds), `Find the ${W} just below ${fmt(n)} and the ${W} just above it.`, rSteps(n, P).slice(0, 1).concat([`So it is between ${ans}.`])); },
    (R, lvl, P, g) => { const n = g(), i = rInfo(n, P), up = i.a === i.hi, ans = up ? 'Round up' : 'Round down';
      return cho(`You are rounding ${fmt(n)} to the nearest ${pw(P)}. Do you round up or round down?`, ans, ['Round up', 'Round down'], rHint(n, P), rSteps(n, P)); },
    (R, lvl, P, g) => { const n = g(), i = rInfo(n, P), other = i.a === i.lo ? i.hi : i.lo, Q = P === 1000 ? 100 : P * 10;
      return cho(`Which shows ${fmt(n)} rounded to the nearest ${pw(P)}?`, fmt(i.a), nch(i.a, [other, roundTo(n, Q), roundTo(n, P === 10 ? 100 : P / 10), i.a + P].filter(v => v > 0), [P]), rHint(n, P), rSteps(n, P)); },
    (R, lvl, P, g) => { const n = g(), k = Math.log10(P) - 1, i = rInfo(n, P), down = R.chance(0.5), X = down ? i.lo : i.hi;
      const good = down ? [0, 1, 2, 3, 4] : [5, 6, 7, 8, 9], bad = down ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4], d = R.pick(good), disp = boxDisplay(n, k);
      return cho(`Which digit could go in the box so that ${disp} rounds to ${fmt(X)} (nearest ${pw(P)})?`, String(d), [String(d), ...R.shuffle(bad.slice()).slice(0, 3).map(String)],
        `The box is the digit you look at. 5 or more rounds up; 4 or less rounds down.`,
        [`The box is in the ${PLACE[k]} place, the digit that decides.`, down ? `To round down to ${fmt(X)}, it must be 0, 1, 2, 3 or 4.` : `To round up to ${fmt(X)}, it must be 5, 6, 7, 8 or 9.`, `So ${d} works.`]); },
    (R, lvl, P, g) => { const Rr = roundTo(g(), P), h = P / 2, ins = new Set(); let gd = 0; while (ins.size < 3 && gd++ < 50){ const v = R.int(Rr - h, Rr + h - 1); if (v > 0 && v !== Rr) ins.add(v); }
      const out = R.chance(0.5) ? Rr + h + R.int(0, h - 1) : (Rr - h - 1 > 0 ? Rr - h - 1 - R.int(0, Math.min(h - 1, Rr - h - 2)) : Rr + h);
      return cho(`Which number does NOT round to ${fmt(Rr)} (nearest ${pw(P)})?`, fmt(out), choices(fmt(out), [...ins].map(fmt)), `Numbers from ${fmt(Rr - h)} to ${fmt(Rr + h - 1)} round to ${fmt(Rr)}.`,
        [`Numbers from ${fmt(Rr - h)} to ${fmt(Rr + h - 1)} round to ${fmt(Rr)}.`, `${fmt(out)} is outside that range.`, ...rSteps(out, P).slice(-1)]); },
    (R, lvl, P, g) => { const Rr = roundTo(g(), P), h = P / 2; let c; do { c = R.int(Rr - h, Rr + h - 1); } while (c === Rr || c <= 0);
      const outs = [Rr + h + R.int(0, h - 1), Rr + P + R.int(1, h - 1), Rr - h - 1 > 0 ? Rr - h - 1 : Rr + h];
      return cho(`A number rounded to the nearest ${pw(P)} is ${fmt(Rr)}. Which could the number be?`, fmt(c), nch(c, outs, [P, 2 * P]), `Which choice is closer to ${fmt(Rr)} than to any other ${pw(P)}?`,
        [`Numbers from ${fmt(Rr - h)} to ${fmt(Rr + h - 1)} round to ${fmt(Rr)}.`, `${fmt(c)} is in that range.`]); }
  ];
  const RANGE = {
    round:   { 1:{ 10:[12, 989], 100:[101, 989] }, 2:{ 10:[101, 4999], 100:[101, 4999] }, 3:{ 10:[1001, 9989], 100:[1001, 9949], 1000:[1001, 9499] } },
    round100:{ 1:{ 100:[101, 999] }, 2:{ 100:[101, 2999] }, 3:{ 100:[1001, 9949] } }
  };
  function roundGen(which){
    return function(R, lvl){
      const P = which === 'round100' ? 100 : lvl === 1 ? R.pick([10, 10, 100]) : lvl === 2 ? R.pick([10, 100, 100]) : R.pick([10, 100, 1000, 1000]);
      const rng = RANGE[which][lvl][P], g = half => rGen(R, rng, P, half);
      return R.pick(ROUND_T)(R, lvl, P, g);
    };
  }
  M['g3.round'] = { name:'Rounding', unit:'g3u2', gen: roundGen('round') };
  M['g3.round100'] = { name:'Round to the nearest hundred', unit:'g3u2', gen: roundGen('round100') };

  // =====================================================================================================
  // g3.compare -- compare and order numbers
  // =====================================================================================================
  function cDigs(R, lvl){ return lvl === 1 ? 3 : lvl === 2 ? 4 : R.pick([4, 5, 5]); }
  function cRand(R, d){ return R.int(POW[d - 1], POW[d] - 1); }
  function near(R, a){ const d = String(a).length, keep = R.int(1, d - 1), cut = POW[d - keep]; let b, g = 0;
    do { b = Math.floor(a / cut) * cut + R.int(0, cut - 1); } while ((b === a || b < POW[d - 1]) && g++ < 50); return b === a ? a + 1 : b; }
  function cmpSteps(a, b){ const da = digitsOf(a), db = digitsOf(b), st = [];
    if (da.length !== db.length){ st.push(`${fmt(a)} has ${da.length} digits and ${fmt(b)} has ${db.length} digits.`, `More digits means a bigger number.`); }
    else { const same = []; let i = da.length - 1; while (i >= 0 && da[i] === db[i]){ same.push(PLACE[i]); i--; }
      if (same.length) st.push(same.length === 1 ? `The ${same[0]} digits are the same (${da[da.length - 1]}).` : `The ${same.slice(0, -1).join(', ')} and ${same[same.length - 1]} digits are the same.`);
      if (i >= 0) st.push(`${PLACE_CAP[i]}: ${da[i]} ${da[i] > db[i] ? '>' : '<'} ${db[i]}. That decides it!`); else st.push('Every digit is the same.'); }
    const s = a > b ? '>' : a < b ? '<' : '='; st.push(`So ${fmt(a)} ${s} ${fmt(b)}.`); return st; }
  const HC = 'Compare from the left. The first place where the digits are different tells you which number is bigger.';
  function cSet(R, lvl, k){ const d = cDigs(R, lvl), base = cRand(R, d), s = new Set([base]); let g = 0; while (s.size < k && g++ < 100) s.add(near(R, base)); return [...s]; }
  const COMPARE = [
    (R, lvl) => { const a = cRand(R, cDigs(R, lvl)), b = R.chance(0.1) ? a : near(R, a), s = a > b ? '>' : a < b ? '<' : '=';
      return cho(`Which symbol makes this true?  ${fmt(a)} ☐ ${fmt(b)}`, s, ['<', '>', '='], HC, cmpSteps(a, b)); },
    (R, lvl) => { const a = cRand(R, cDigs(R, lvl)), b = near(R, a), sym = R.pick(['>', '<']), tru = sym === '>' ? a > b : a < b;
      return cho(`True or false?  ${fmt(a)} ${sym} ${fmt(b)}`, tru ? 'True' : 'False', TF, HC, cmpSteps(a, b)); },
    (R, lvl) => { const a = cRand(R, cDigs(R, lvl)), b = near(R, a), ans = Math.max(a, b);
      return cho(`Which number is greater: ${fmt(a)} or ${fmt(b)}?`, fmt(ans), [fmt(a), fmt(b)], HC, cmpSteps(a, b)); },
    (R, lvl) => { const a = cRand(R, cDigs(R, lvl)), b = near(R, a), ans = Math.min(a, b);
      return cho(`Which number is less: ${fmt(a)} or ${fmt(b)}?`, fmt(ans), [fmt(a), fmt(b)], HC, cmpSteps(a, b)); },
    (R, lvl) => { const xs = cSet(R, lvl, 3), up = xs.slice().sort((p, q) => p - q), ans = up.map(fmt).join('; ');
      const perms = [[1, 0, 2], [0, 2, 1], [2, 1, 0], [2, 0, 1]].map(p => p.map(i => fmt(up[i])).join('; '));
      return cho(`Which list is in order from least to greatest?`, ans, choices(ans, R.shuffle(perms)), 'Find the smallest number first, then the next, then the biggest.',
        [`Compare the numbers place by place.`, `Least: ${fmt(up[0])}. Then ${fmt(up[1])}. Greatest: ${fmt(up[2])}.`, `In order: ${ans}.`]); },
    (R, lvl) => { const xs = cSet(R, lvl, 3), dn = xs.slice().sort((p, q) => q - p), ans = dn.map(fmt).join('; ');
      const perms = [[1, 0, 2], [0, 2, 1], [2, 1, 0], [1, 2, 0]].map(p => p.map(i => fmt(dn[i])).join('; '));
      return cho(`Which list is in order from greatest to least?`, ans, choices(ans, R.shuffle(perms)), 'Find the biggest number first, then the next, then the smallest.',
        [`Compare the numbers place by place.`, `Greatest: ${fmt(dn[0])}. Then ${fmt(dn[1])}. Least: ${fmt(dn[2])}.`, `In order: ${ans}.`]); },
    (R, lvl) => { const xs = cSet(R, lvl, 4), a = Math.max(...xs);
      return cho(`Which number is the greatest?`, fmt(a), choices(fmt(a), xs.filter(x => x !== a).map(fmt)), HC, [`Compare the biggest place first, then move right.`, `In order from greatest: ${xs.slice().sort((p, q) => q - p).map(fmt).join('; ')}.`, `The greatest is ${fmt(a)}.`]); },
    (R, lvl) => { const xs = cSet(R, lvl, 4), a = Math.min(...xs);
      return cho(`Which number is the least?`, fmt(a), choices(fmt(a), xs.filter(x => x !== a).map(fmt)), HC, [`Compare the biggest place first, then move right.`, `In order from least: ${xs.slice().sort((p, q) => p - q).map(fmt).join('; ')}.`, `The least is ${fmt(a)}.`]); },
    (R, lvl) => { let x, y, k, sym, ok, bad, g = 0;
      do { const d = cDigs(R, lvl); x = cRand(R, d); k = R.int(0, d - 2); y = near(R, x); sym = R.pick(['>', '<']);
        ok = []; bad = []; for (let v = 0; v <= 9; v++){ const xv = x - digitsOf(x)[k] * POW[k] + v * POW[k]; (sym === '>' ? xv > y : xv < y) ? ok.push(v) : bad.push(v); }
      } while ((!ok.length || bad.length < 2) && g++ < 100);
      if (!ok.length || bad.length < 1){ x = 456; k = 1; y = 452; sym = '>'; ok = [6, 7, 8, 9]; bad = [0, 1, 2, 3, 4]; }
      const d = R.pick(ok), disp = boxDisplay(x, k), b3 = R.shuffle(bad.slice()).slice(0, 3);
      return cho(`Which digit makes this true?  ${disp} ${sym} ${fmt(y)}`, String(d), [String(d), ...b3.map(String)], 'Try each choice in the box, then compare place by place.',
        [`Put ${d} in the box: ${fmt(x - digitsOf(x)[k] * POW[k] + d * POW[k])}.`, `${fmt(x - digitsOf(x)[k] * POW[k] + d * POW[k])} ${sym} ${fmt(y)} is true.`, `The other digits make it false.`]); },
    (R, lvl) => { const n = cDigs(R, lvl) === 5 ? 4 : cDigs(R, lvl); let ds; do { ds = Array.from({ length:n }, () => R.int(0, 9)); } while (new Set(ds).size < n || ds.every(x => x === 0));
      const dn = ds.slice().sort((p, q) => q - p), ans = fromDigits(dn);
      return num(`Use each of the digits ${ds.join(', ')} once. What is the greatest number you can make?`, ans, 'Put the biggest digit in the biggest place.',
        [`Order the digits from greatest to least: ${dn.join(', ')}.`, `The greatest number is ${fmt(ans)}.`]); },
    (R, lvl) => { const n = cDigs(R, lvl) === 5 ? 4 : cDigs(R, lvl); let ds; do { ds = Array.from({ length:n }, () => R.int(0, 9)); if (R.chance(0.4)) ds[R.int(0, n - 1)] = 0; } while (new Set(ds).size < n);
      const up = ds.slice().sort((p, q) => p - q); if (up[0] === 0){ const i = up.findIndex(x => x > 0); [up[0], up[i]] = [up[i], up[0]]; } const ans = fromDigits(up);
      return num(`Use each of the digits ${ds.join(', ')} once. What is the least number you can make?`, ans, 'Put the smallest digit in the biggest place, but a number cannot start with 0.',
        [`Order the digits from least to greatest.`, ds.includes(0) ? `A number can't start with 0, so start with the smallest digit that is not 0.` : `Smallest digit goes first.`, `The least number is ${fmt(ans)}.`]); },
    (R, lvl) => { const [A, B] = nms(R, 2), a = cRand(R, cDigs(R, lvl)), b = near(R, a), ans = a > b ? `${A}'s school` : `${B}'s school`;
      return cho(`${A}'s school has ${fmt(a)} books. ${B}'s school has ${fmt(b)} books. Which school has more books?`, ans, [`${A}'s school`, `${B}'s school`], HC, [...cmpSteps(a, b), `So ${ans} has more.`]); },
    (R, lvl) => { const a = cRand(R, cDigs(R, lvl)), b = near(R, a), ans = a > b ? 'The Blue Trail' : 'The Red Trail';
      return cho(`The Blue Trail is ${fmt(a)} feet long. The Red Trail is ${fmt(b)} feet long. Which trail is longer?`, ans, ['The Blue Trail', 'The Red Trail'], HC, [...cmpSteps(a, b), `So ${ans.toLowerCase()} is longer.`]); },
    (R, lvl) => { const xs = cSet(R, lvl, 4).sort((p, q) => p - q), lo = xs[0], hi = xs[3], mid = xs[R.int(1, 2)], d = String(hi).length;
      const outs = [hi + R.int(1, 50), Math.max(POW[d - 1], lo - R.int(1, 50)), hi + R.int(51, 200)].filter(v => v < lo || v > hi);
      return cho(`Which number is between ${fmt(lo)} and ${fmt(hi)}?`, fmt(mid), choices(fmt(mid), outs.map(fmt)), 'It must be greater than the first number AND less than the second.',
        [`${fmt(mid)} > ${fmt(lo)}.`, `${fmt(mid)} < ${fmt(hi)}.`, `So ${fmt(mid)} is between them.`]); },
    (R, lvl) => { const a = cRand(R, cDigs(R, lvl)), b = R.chance(0.2) ? a : near(R, a), s = a > b ? '>' : a < b ? '<' : '=';
      return cho(`Which symbol makes this true?  ${fmt(a)} ☐ ${expanded(b)}`, s, ['<', '>', '='], 'First write the expanded form as one number. Then compare.', [`${expanded(b)} = ${fmt(b)}.`, ...cmpSteps(a, b)]); },
    (R, lvl) => { const a = cRand(R, cDigs(R, lvl)), b = R.chance(0.2) ? a : near(R, a), s = b > a ? '>' : b < a ? '<' : '=';
      return cho(`Which symbol makes this true?  ${words(b)} ☐ ${fmt(a)}`, s, ['<', '>', '='], 'Write the words as a number first. Then compare.', [`${words(b)} = ${fmt(b)}.`, ...cmpSteps(b, a)]); },
    (R, lvl) => { const a = cRand(R, cDigs(R, lvl)), b = near(R, a), ans = fmt(Math.max(a, b));
      return cho(`On a number line, which number is farther to the right: ${fmt(a)} or ${fmt(b)}?`, ans, [fmt(a), fmt(b)], 'Numbers get bigger as you move right on a number line.', [...cmpSteps(a, b), `The bigger number, ${ans}, is farther right.`]); },
    (R, lvl) => { const xs = cSet(R, lvl, 6), X = xs[0], list = xs.slice(1), cnt = list.filter(v => v > X).length;
      return num(`How many of these numbers are greater than ${fmt(X)}?  ${list.map(fmt).join(';  ')}`, cnt, `Compare each number to ${fmt(X)} one at a time.`,
        [list.map(v => `${fmt(v)} ${v > X ? '>' : '<'} ${fmt(X)}`).join('; ') + '.', `${cnt} ${pl(cnt, 'numbers')} ${cnt === 1 ? 'is' : 'are'} greater.`]); },
    (R, lvl) => { const d = cDigs(R, lvl), a = cRand(R, d), p = R.int(0, d - 1), da = digitsOf(a); let v; do { v = R.int(p === d - 1 ? 1 : 0, 9); } while (v === da[p]);
      const b = a - da[p] * POW[p] + v * POW[p] + 0; const ans = PLACE[p];
      const opts = choices(ans, R.shuffle(PLACE.slice(0, d).filter(x => x !== ans)));
      return cho(`Compare ${fmt(a)} and ${fmt(b)}. In which place are the digits first different (reading from the left)?`, ans, opts, 'Start at the biggest place and move right until the digits are not the same.', cmpSteps(a, b).slice(0, -1).concat([`The digits first differ in the ${ans} place.`])); },
    (R, lvl) => { const xs = cSet(R, lvl, 4), up = xs.slice().sort((p, q) => p - q), ans = up[1];
      return cho(`Put these in order from least to greatest: ${xs.map(fmt).join('; ')}. Which number comes second?`, fmt(ans), choices(fmt(ans), xs.filter(x => x !== ans).map(fmt)), HC,
        [`In order: ${up.map(fmt).join('; ')}.`, `Second is ${fmt(ans)}.`]); },
    (R, lvl) => { const a = cRand(R, cDigs(R, lvl)), b = near(R, a), ans = a < b ? 'May' : 'June';
      return cho(`A toy store sold ${fmt(a)} toys in May and ${fmt(b)} toys in June. In which month did it sell fewer toys?`, ans, ['May', 'June'], HC, [...cmpSteps(a, b), `Fewer toys were sold in ${ans}.`]); }
  ];
  M['g3.compare'] = { name:'Compare & order numbers', unit:'g3u2', gen(R, lvl){ return R.pick(COMPARE)(R, lvl); } };

  // =====================================================================================================
  // g3.placevalue
  // =====================================================================================================
  function pDigs(R, lvl){ return lvl === 1 ? 3 : lvl === 2 ? 4 : R.pick([4, 5]); }
  function pRand(R, lvl){ const d = pDigs(R, lvl); return R.int(POW[d - 1], POW[d] - 1); }
  const HP = 'Say the places from the right: ones, tens, hundreds, thousands, ten thousands.';
  const PLACEVALUE = [
    (R, lvl) => { let n, d, p; do { n = pRand(R, lvl); d = digitsOf(n); p = R.int(0, d.length - 1); } while (d[p] === 0 || d.filter(x => x === d[p]).length > 1);
      const v = d[p] * POW[p];
      return num(`In ${fmt(n)}, what is the value of the digit ${d[p]}?`, v, 'Find the digit, then say which place it is in.', [`Find the ${d[p]} in ${fmt(n)}.`, `It is in the ${PLACE[p]} place.`, `${d[p]} ${pl(d[p], PLACE[p])} = ${fmt(v)}.`]); },
    (R, lvl) => { let n, d, p; do { n = pRand(R, lvl); d = digitsOf(n); p = R.int(0, d.length - 1); } while (d.filter(x => x === d[p]).length > 1);
      const ans = PLACE[p];
      return cho(`In ${fmt(n)}, which place is the digit ${d[p]} in?`, ans, choices(ans, R.shuffle(PLACE.slice(0, d.length).filter(x => x !== ans))), HP,
        [`Count places from the right: ${d.map((x, i) => `${x} is ${PLACE[i]}`).reverse().join(', ')}.`, `The ${d[p]} is in the ${ans} place.`]); },
    (R, lvl) => { let n, d; do { n = pRand(R, lvl); d = digitsOf(n); } while (new Set(d.filter(x => x)).size < 3);
      const terms = expTerms(n), ans = terms.map(fmt).join(' + '), plain = d.slice().reverse().filter(x => x).join(' + ');
      const shift = d.map((x, i) => i > 0 ? x * POW[i - 1] : x).reverse().filter(x => x).map(fmt).join(' + ');
      const big = terms.map((t, k) => k === 1 ? t * 10 : t).map(fmt).join(' + ');
      return cho(`Which is the expanded form of ${fmt(n)}?`, ans, choices(ans, [plain, shift, big]), 'Expanded form shows what each digit is worth, added together.',
        [d.slice().reverse().map((x, k) => x ? `${x} → ${fmt(x * POW[d.length - 1 - k])}` : null).filter(Boolean).join(', ') + '.', `So the expanded form is ${ans}.`]); },
    (R, lvl) => { const n = pRand(R, lvl), t = expTerms(n), sh = R.chance(0.5) ? R.shuffle(t.slice()) : t;
      return num(`What number is ${sh.map(fmt).join(' + ')}?`, n, 'Put each part in its place. A missing place gets a 0.', [`Line the parts up by place.`, `${t.map(fmt).join(' + ')} = ${fmt(n)}.`]); },
    (R, lvl) => { const n = pRand(R, lvl);
      return num(`Write this number in standard form: ${words(n)}`, n, 'Read it one part at a time. "Thousand" and "hundred" tell you the place.', [`${words(n)}`, `= ${expanded(n)}`, `= ${fmt(n)}.`]); },
    (R, lvl) => { let n, d; do { n = pRand(R, lvl); d = digitsOf(n); } while (d[0] === d[1] || d[1] === d[2] || d[1] === 0 || d[0] === 0);
      const sw = (i, j) => { const e = d.slice(); [e[i], e[j]] = [e[j], e[i]]; return Number(e.slice().reverse().join('')); };
      const ans = words(n);
      return cho(`Which is the word form of ${fmt(n)}?`, ans, choices(ans, [words(sw(0, 1)), words(sw(1, 2)), words(n + 100 > POW[d.length] - 1 ? n - 100 : n + 100)]),
        'Read the number the way you say it out loud.', [`${fmt(n)} = ${expanded(n)}.`, `Say it: ${ans}.`]); },
    (R, lvl) => { const th = lvl === 1 ? 0 : R.int(1, 4), h = R.int(lvl === 1 ? 1 : 0, 5), t = R.int(0, 9), o = R.int(0, 9), n = th * 1000 + h * 100 + t * 10 + o;
      const parts = [[th, 3], [h, 2], [t, 1], [o, 0]].filter(x => x[0]);
      return num('What number do the base-ten blocks show?', n, 'Big cubes are thousands, flats are hundreds, rods are tens, little cubes are ones.',
        [parts.map(([x, i]) => `${x} ${pl(x, PLACE[i])} = ${fmt(x * POW[i])}`).join(', ') + '.', `The number is ${fmt(n)}.`], { model:{ type:'blocks', th, h, t, o } }); },
    (R, lvl) => { const n = (lvl === 1 ? R.int(10, 99) : lvl === 2 ? R.int(100, 999) : R.int(1000, 4999)) * 10;
      return num(`How many tens are in ${fmt(n)}?`, n / 10, 'Every 10 is one ten. How many groups of 10 make the number?', [`10 tens make 100, so count every ten.`, `${fmt(n)} = ${fmt(n / 10)} tens.`, `There are ${fmt(n / 10)} tens.`]); },
    (R, lvl) => { const n = (lvl === 1 ? R.int(1, 9) : lvl === 2 ? R.int(10, 99) : R.int(100, 999)) * 100;
      return num(`How many hundreds are in ${fmt(n)}?`, n / 100, '10 hundreds make 1 thousand. Count all the hundreds.', [`Each 100 is one hundred.`, `${fmt(n)} = ${fmt(n / 100)} hundreds.`, `There are ${fmt(n / 100)} hundreds.`]); },
    (R, lvl) => { const n = pRand(R, lvl), a = n + 10; return num(`What is 10 more than ${fmt(n)}?`, a, 'Only the tens digit goes up by 1 (unless it is 9, then regroup!).', [`Add 1 ten: ${fmt(n)} + 10.`, `= ${fmt(a)}.`]); },
    (R, lvl) => { const n = pRand(R, lvl), a = n - 10; return num(`What is 10 less than ${fmt(n)}?`, a, 'Take 1 away from the tens digit (if it is 0, regroup).', [`Take away 1 ten: ${fmt(n)} − 10.`, `= ${fmt(a)}.`]); },
    (R, lvl) => { const n = pRand(R, lvl), a = n + 100; return num(`What number is 100 greater than ${fmt(n)}?`, a, 'Add 1 to the hundreds digit.', [`Add 1 hundred: ${fmt(n)} + 100.`, `= ${fmt(a)}.`]); },
    (R, lvl) => { const n = pRand(R, lvl), a = n - 100; return num(`Start at ${fmt(n)} and count back 100. What number do you land on?`, a, 'Take 1 from the hundreds digit.', [`Take away 1 hundred: ${fmt(n)} − 100.`, `= ${fmt(a)}.`]); },
    (R, lvl) => { const n = pRand(R, lvl), a = n + 1000; return num(`Add 1,000 to ${fmt(n)}. What number do you get?`, a, 'Add 1 to the thousands digit (if it is 9, regroup!).', [`Add 1 thousand: ${fmt(n)} + 1,000.`, `= ${fmt(a)}.`]); },
    (R, lvl) => { const m = lvl === 1 ? R.int(1000, 1999) : pRand(R, lvl), a = m - 1000;
      return num(`What number is 1,000 less than ${fmt(m)}?`, a, 'Take 1 from the thousands digit (if it is 0, regroup!).', [`Take away 1 thousand: ${fmt(m)} − 1,000.`, `= ${fmt(a)}.`]); },
    (R, lvl) => { let n, d, p; do { n = pRand(R, lvl); d = digitsOf(n); p = R.int(0, d.length - 1); } while (d[p] === 0);
      const terms = d.map((x, i) => ({ i, v: x * POW[i] })).reverse().filter(t => t.v), v = d[p] * POW[p];
      return num(`${terms.map(t => t.i === p ? '☐' : fmt(t.v)).join(' + ')} = ${fmt(n)}. What number goes in the box?`, v, `Look at the ${PLACE[p]} digit of ${fmt(n)}.`,
        [`The missing part is the ${PLACE[p]} part.`, `The ${PLACE[p]} digit is ${d[p]}.`, `${d[p]} ${pl(d[p], PLACE[p])} = ${fmt(v)}.`]); },
    (R, lvl) => { const th = lvl === 1 ? 0 : R.int(1, 8), big = R.pick([1, 2]), h = big === 2 ? R.int(10, 19) : R.int(lvl === 1 ? 1 : 0, 9), t = big === 1 ? R.int(10, 19) : R.int(0, 9), o = R.int(0, 9), n = th * 1000 + h * 100 + t * 10 + o;
      const lead = th ? `${th} ${pl(th, 'thousands')}, ` : '';
      return num(`What number is ${lead}${h} hundreds, ${t} tens, and ${o} ones?`, n, big === 2 ? `${h} hundreds is more than 9. 10 hundreds make 1 thousand.` : `${t} tens is more than 9. 10 tens make 1 hundred.`,
        [th ? `${th} ${pl(th, 'thousands')} = ${fmt(th * 1000)}.` : `Find each part.`, `${h} hundreds = ${fmt(h * 100)} and ${t} tens = ${t * 10}.`, `Add: ${th ? fmt(th * 1000) + ' + ' : ''}${fmt(h * 100)} + ${t * 10} + ${o} = ${fmt(n)}.`]); },
    (R, lvl) => { const n = pRand(R, lvl), d = digitsOf(n), parts = R.shuffle(d.map((x, i) => `${x} ${pl(x, PLACE[i])}`));
      return num(`I have ${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}. What number am I?`, n, 'Put each digit in its own place. The order of the clues does not matter.',
        [`Sort by place: ${unitForm(n)}.`, `The number is ${fmt(n)}.`]); },
    (R, lvl) => { const h = R.int(1, 6), k = R.int(1, 3), t = h + k, o = R.int(0, 9), th = lvl === 1 ? 0 : R.int(1, 9), n = th * 1000 + h * 100 + t * 10 + o;
      return num(`${th ? `My thousands digit is ${th}. ` : ''}My hundreds digit is ${h}. My tens digit is ${k} more than my hundreds digit. My ones digit is ${o}. What number am I?`, n, 'Work out each digit, then put them in order.',
        [`Tens digit: ${h} + ${k} = ${t}.`, `${th ? `Thousands ${th}, ` : ''}hundreds ${h}, tens ${t}, ones ${o}.`, `The number is ${fmt(n)}.`]); },
    (R, lvl) => { const n = pRand(R, lvl), d = digitsOf(n), p = R.int(0, d.length - 1);
      return num(`What digit is in the ${PLACE[p]} place of ${fmt(n)}?`, d[p], HP, [`${unitForm(n)}.`, `The ${PLACE[p]} digit is ${d[p]}.`]); },
    (R, lvl) => { const dg = lvl === 1 ? 3 : 4, v = R.int(1, 9); const mk = pos => { let n, d; do { n = R.int(POW[dg - 1], POW[dg] - 1); d = digitsOf(n); } while (d[pos] !== v || d.filter((x, i) => x === v && i !== pos).length); return n; };
      const ans = mk(2), others = [0, 1, 3].filter(p => p < dg).map(mk);
      while (others.length < 3) others.push(mk(R.pick([0, 1])));
      return cho(`Which number has a ${v} in the hundreds place?`, fmt(ans), choices(fmt(ans), others.map(fmt)), 'The hundreds place is the third digit from the right.',
        [`Look at the third digit from the right in each number.`, `In ${fmt(ans)}, the ${v} is in the hundreds place.`]); },
    (R, lvl) => { let n, d; do { n = pRand(R, lvl); d = digitsOf(n); } while (new Set(d).size < d.length);
      const ans = unitForm(n), rev = d.slice().reverse(), sh = d.map((x, i) => `${x} ${pl(x, PLACE[(i + 1) % d.length])}`).reverse().join(', ');
      const sw = d.slice(); [sw[0], sw[1]] = [sw[1], sw[0]];
      return cho(`Which shows ${fmt(n)}?`, ans, choices(ans, [unitForm(Number(sw.slice().reverse().join(''))), sh, rev.map((x, i) => `${x} ${pl(x, PLACE[i])}`).join(', ')]),
        HP, [`${fmt(n)}: ${d.map((x, i) => `${x} in the ${PLACE[i]}`).reverse().join(', ')}.`, `So it is ${ans}.`]); }
  ];
  M['g3.placevalue'] = { name:'Place value', unit:'g3u2', gen(R, lvl){ return R.pick(PLACEVALUE)(R, lvl); } };

  // =====================================================================================================
  // g3.estimate -- estimate sums and differences by rounding; reasonableness
  // =====================================================================================================
  function eP(R, lvl){ return lvl === 1 ? R.pick([10, 10, 100]) : lvl === 2 ? R.pick([10, 100, 100]) : R.pick([100, 1000]); }
  function eRng(lvl, P){ if (P === 10) return lvl === 1 ? [12, 98] : [105, 989]; if (P === 100) return lvl === 3 ? [1050, 4949] : [105, 949]; return [1050, 8949]; }
  function eNum(R, lvl, P){ const [lo, hi] = eRng(lvl, P); let n; do { n = R.int(lo, hi); } while (n % P === 0); return n; }
  function ePair(R, lvl, P, add){ let a, b, g = 0;
    do { a = eNum(R, lvl, P); b = eNum(R, lvl, P); if (!add && b > a) [a, b] = [b, a]; }
    while (g++ < 80 && ((add && roundTo(a, P) + roundTo(b, P) > 99999) || (!add && roundTo(a, P) <= roundTo(b, P))));
    return [a, b]; }
  function eSteps(a, b, P, add){ const ra = roundTo(a, P), rb = roundTo(b, P), e = add ? ra + rb : ra - rb, s = add ? '+' : '−';
    return [`Round ${fmt(a)} → ${fmt(ra)}.`, `Round ${fmt(b)} → ${fmt(rb)}.`, `${fmt(ra)} ${s} ${fmt(rb)} = ${fmt(e)}.`, `The estimate is about ${fmt(e)}.`]; }
  const eH = (P, add) => `Round each number to the nearest ${pw(P)} first. Then ${add ? 'add' : 'subtract'} the rounded numbers.`;
  const est = (a, b, P, add) => add ? roundTo(a, P) + roundTo(b, P) : roundTo(a, P) - roundTo(b, P);
  function eCtx(add, qf, unit){
    return (R, lvl) => { const P = eP(R, lvl), [a, b] = ePair(R, lvl, P, add), A = nm(R);
      return num(qf(a, b, pw(P), A), est(a, b, P, add), eH(P, add), eSteps(a, b, P, add), unit ? { unit } : {}); };
  }
  function eReason(addIn, wording){
    return (R, lvl) => { const add = addIn === 'any' ? R.chance(0.5) : addIn, P = eP(R, lvl), [a, b] = ePair(R, lvl, P, add), ex = add ? a + b : a - b, E = est(a, b, P, add), A = nm(R), ok = R.chance(0.5), s = add ? '+' : '−';
      let x = ex; if (!ok){ const k = R.pick([3, 4, 5]) * P; x = (ex - k > 0 && R.chance(0.5)) ? ex - k : ex + k; }
      return cho(wording(a, b, x, s, A), ok ? 'Yes' : 'No', YN, `Estimate first: round each number to the nearest ${pw(P)}. Is the answer close to your estimate?`,
        [...eSteps(a, b, P, add).slice(0, 3), ok ? `${fmt(x)} is close to ${fmt(E)}, so it is reasonable.` : `${fmt(x)} is far from ${fmt(E)}, so it is NOT reasonable.`]); };
  }
  const ESTIMATE = [
    (R, lvl) => { const P = eP(R, lvl), [a, b] = ePair(R, lvl, P, true); return num(`Estimate ${fmt(a)} + ${fmt(b)} by rounding each number to the nearest ${pw(P)}.`, est(a, b, P, true), eH(P, true), eSteps(a, b, P, true)); },
    (R, lvl) => { const P = eP(R, lvl), [a, b] = ePair(R, lvl, P, false); return num(`Estimate ${fmt(a)} − ${fmt(b)} by rounding each number to the nearest ${pw(P)}.`, est(a, b, P, false), eH(P, false), eSteps(a, b, P, false)); },
    eReason(true, (a, b, x) => `Is ${fmt(x)} a reasonable answer for ${fmt(a)} + ${fmt(b)}?`),
    eReason(false, (a, b, x) => `Is ${fmt(x)} a reasonable answer for ${fmt(a)} − ${fmt(b)}?`),
    eReason('any', (a, b, x, s, A) => `${A} says ${fmt(a)} ${s} ${fmt(b)} = ${fmt(x)}. Use an estimate: does that answer make sense?`),
    (R, lvl) => { const P = eP(R, lvl), [a, b] = ePair(R, lvl, P, true), E = est(a, b, P, true);
      return cho(`Which is the best estimate of ${fmt(a)} + ${fmt(b)}? (Round to the nearest ${pw(P)}.)`, fmt(E), nch(E, [E + P, E - P, est(a, b, P === 10 ? 100 : P === 100 ? 1000 : 100, true), E + 2 * P], [P, 2 * P]), eH(P, true), eSteps(a, b, P, true)); },
    eCtx(true, (a, b, W, A) => `${A} read ${fmt(a)} pages one month and ${fmt(b)} pages the next month. About how many pages did ${A} read in all? Round each number to the nearest ${W}.`, 'pages'),
    eCtx(false, (a, b, W) => `A stadium has ${fmt(a)} seats. ${fmt(b)} seats are filled. About how many seats are empty? Round each number to the nearest ${W}.`, 'seats'),
    eCtx(false, (a, b, W) => `A truck drove ${fmt(a)} miles and a car drove ${fmt(b)} miles. About how many more miles did the truck drive? Round to the nearest ${W}.`, 'miles'),
    eCtx(true, (a, b, W) => `A game costs $${fmt(a)} and a book costs $${fmt(b)}. About how many dollars do they cost together? Round each price to the nearest ${W}.`, 'dollars'),
    eCtx(false, (a, b, W) => `A family's trip is ${fmt(a)} miles long. They have driven ${fmt(b)} miles. About how many miles are left? Round to the nearest ${W}.`, 'miles'),
    (R, lvl) => { const P = eP(R, lvl), add = R.chance(0.5), [a, b] = ePair(R, lvl, P, add), A = nm(R), ra = roundTo(a, P), rb = roundTo(b, P), E = add ? ra + rb : ra - rb, s = add ? '+' : '−';
      return num(`${A} rounded ${fmt(a)} to ${fmt(ra)} and ${fmt(b)} to ${fmt(rb)}. What is ${A}'s estimate of ${fmt(a)} ${s} ${fmt(b)}?`, E, `Use the rounded numbers: ${fmt(ra)} ${s} ${fmt(rb)}.`,
        [`Use the rounded numbers.`, `${fmt(ra)} ${s} ${fmt(rb)} = ${fmt(E)}.`]); },
    (R, lvl) => { const P = eP(R, lvl), [a, b] = ePair(R, lvl, P, true), ra = roundTo(a, P), rb = roundTo(b, P), ans = `${fmt(ra)} + ${fmt(rb)}`;
      const fl = x => Math.floor(x / P) * P, ce = x => Math.ceil(x / P) * P;
      return cho(`Which shows how to estimate ${fmt(a)} + ${fmt(b)} by rounding to the nearest ${pw(P)}?`, ans,
        choices(ans, [`${fmt(fl(a))} + ${fmt(fl(b))}`, `${fmt(ce(a))} + ${fmt(ce(b))}`, `${fmt(ra === fl(a) ? ce(a) : fl(a))} + ${fmt(rb)}`, `${fmt(ra)} + ${fmt(rb === fl(b) ? ce(b) : fl(b))}`]),
        `Round each number to the nearest ${pw(P)}. 5 or more rounds up.`, eSteps(a, b, P, true).slice(0, 2).concat([`So the estimate is ${ans}.`])); },
    (R, lvl) => { const P = eP(R, lvl); let a, b, g = 0; do { [a, b] = ePair(R, lvl, P, true); } while (a + b === est(a, b, P, true) && g++ < 50);
      const E = est(a, b, P, true), ex = a + b, more = ex > E, ans = more ? `More than ${fmt(E)}` : `Less than ${fmt(E)}`;
      return cho(`The estimate of ${fmt(a)} + ${fmt(b)} is ${fmt(E)}. Is the exact sum more or less than ${fmt(E)}?`, ans, [`More than ${fmt(E)}`, `Less than ${fmt(E)}`],
        'Did the numbers mostly round up or round down? Or just add to check!', [...eSteps(a, b, P, true).slice(0, 3), `Exact: ${fmt(a)} + ${fmt(b)} = ${fmt(ex)}.`, `${fmt(ex)} is ${more ? 'more' : 'less'} than ${fmt(E)}.`]); },
    (R, lvl) => { const P = eP(R, lvl), a = eNum(R, lvl, P), b = eNum(R, lvl, P), c = eNum(R, lvl, P), E = roundTo(a, P) + roundTo(b, P) + roundTo(c, P);
      return num(`Three classes raised $${fmt(a)}, $${fmt(b)}, and $${fmt(c)} for the food bank. About how many dollars is that in all? Round each to the nearest ${pw(P)}.`, E, `Round all three numbers to the nearest ${pw(P)}, then add.`,
        [`Round: ${fmt(a)} → ${fmt(roundTo(a, P))}, ${fmt(b)} → ${fmt(roundTo(b, P))}, ${fmt(c)} → ${fmt(roundTo(c, P))}.`, `${fmt(roundTo(a, P))} + ${fmt(roundTo(b, P))} + ${fmt(roundTo(c, P))} = ${fmt(E)}.`, `About $${fmt(E)}.`], { unit:'dollars' }); },
    (R, lvl) => { const P = eP(R, lvl), [a, b] = ePair(R, lvl, P, true), E = est(a, b, P, true), A = nm(R);
      return num(`${A} estimated ${fmt(a)} + ${fmt(b)} to be about ${fmt(E)}. Now find the exact sum.`, a + b, 'Add the real numbers. Your answer should be close to the estimate!',
        [...addSteps(a, b), `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}, which is close to ${fmt(E)} ✓`]); },
    (R, lvl) => { const P = eP(R, lvl), [a, b] = ePair(R, lvl, P, true), A = nm(R), s = a + b; let Mn = Math.round((s + (R.chance(0.5) ? 1 : -1) * R.int(P, 3 * P)) / P) * P; if (Mn <= 0 || Mn === s) Mn = s + P;
      const ok = Mn >= s;
      return cho(`${A} has $${fmt(Mn)}. Does ${A} have enough money to buy a scooter for $${fmt(a)} and a helmet for $${fmt(b)}?`, ok ? 'Yes' : 'No', YN, 'Estimate the total cost, then check it exactly.',
        [...eSteps(a, b, P, true).slice(0, 3), `Exact cost: ${fmt(a)} + ${fmt(b)} = ${fmt(s)} dollars.`, ok ? `$${fmt(Mn)} is enough. Yes!` : `$${fmt(Mn)} is not enough. No.`]); },
    (R, lvl) => { const P = eP(R, lvl), A = nm(R); let a, b, X, E, g = 0;
      do { [a, b] = ePair(R, lvl, P, true); E = est(a, b, P, true); X = Math.floor(a / P) * P + Math.floor(b / P) * P; if (X === E) X = Math.ceil(a / P) * P + Math.ceil(b / P) * P; } while (X === E && g++ < 50);
      if (X === E) X = E + P;
      return num(`${A} estimated ${fmt(a)} + ${fmt(b)} by rounding to the nearest ${pw(P)} and got ${fmt(X)}. ${A} made a rounding mistake. What is the correct estimate?`, E, `Round each number carefully: 5 or more rounds up, 4 or less rounds down.`, eSteps(a, b, P, true)); },
    (R, lvl) => { const P = eP(R, lvl); let a, b, c, E, g = 0;
      do { a = eNum(R, lvl, P); b = eNum(R, lvl, P); c = eNum(R, lvl, P); E = roundTo(a, P) + roundTo(b, P) - roundTo(c, P); } while ((E < 0 || a + b - c < 0) && g++ < 80);
      if (E < 0 || a + b - c < 0){ [a, b, c] = [a, b, Math.min(a, b)]; E = roundTo(a, P) + roundTo(b, P) - roundTo(c, P); }
      return num(`Estimate ${fmt(a)} + ${fmt(b)} − ${fmt(c)} by rounding each number to the nearest ${pw(P)}.`, E, `Round all three numbers first. Then add the first two and subtract the third.`,
        [`Round: ${fmt(roundTo(a, P))}, ${fmt(roundTo(b, P))}, ${fmt(roundTo(c, P))}.`, `${fmt(roundTo(a, P))} + ${fmt(roundTo(b, P))} = ${fmt(roundTo(a, P) + roundTo(b, P))}.`, `${fmt(roundTo(a, P) + roundTo(b, P))} − ${fmt(roundTo(c, P))} = ${fmt(E)}.`]); },
    (R, lvl) => { const P = eP(R, lvl), a = eNum(R, lvl, P), b = eNum(R, lvl, P), c = eNum(R, lvl, P), E = roundTo(a, P) + roundTo(b, P) + roundTo(c, P);
      return num(`A school has ${fmt(a)} first graders, ${fmt(b)} second graders, and ${fmt(c)} third graders. About how many students is that? Round each number to the nearest ${pw(P)}.`, E, `Round all three numbers to the nearest ${pw(P)}, then add.`,
        [`Round: ${fmt(roundTo(a, P))}, ${fmt(roundTo(b, P))}, ${fmt(roundTo(c, P))}.`, `${fmt(roundTo(a, P))} + ${fmt(roundTo(b, P))} + ${fmt(roundTo(c, P))} = ${fmt(E)}.`, `About ${fmt(E)} students.`], { unit:'students' }); },
    (R, lvl) => { const P = eP(R, lvl), [a, b] = ePair(R, lvl, P, false), E = est(a, b, P, false);
      return cho(`Which is the best estimate of ${fmt(a)} − ${fmt(b)}? (Round to the nearest ${pw(P)}.)`, fmt(E), nch(E, [E + P, E - P, roundTo(a, P) + roundTo(b, P), E + 2 * P], [P, 2 * P]), eH(P, false), eSteps(a, b, P, false)); }
  ];
  M['g3.estimate'] = { name:'Estimate sums & differences', unit:'g3u2', gen(R, lvl){ return R.pick(ESTIMATE)(R, lvl); } };
})();
