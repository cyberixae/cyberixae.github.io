"use strict";
(() => {
  // src/utils/iterable.ts
  var uniq = (arr) => (function* () {
    const skip = /* @__PURE__ */ new Set();
    const it = arr[Symbol.iterator]();
    while (true) {
      const { done, value } = it.next();
      if (done) {
        return;
      }
      if (skip.has(value)) {
        break;
      }
      yield value;
      skip.add(value);
    }
  })();

  // src/utils/array.ts
  var isNonEmptyArray = (a) => {
    return a.length > 0;
  };
  var zip = (a, b) => {
    return Array.from({ length: Math.min(a.length, b.length) }).map(
      (_, i2) => [a.at(i2), b.at(i2)]
    );
  };
  var uniq2 = (arr) => {
    return [...uniq(arr)];
  };
  var rotate = ([x, ...xs]) => [...xs, x];

  // src/utils/seq.ts
  var empty = () => function* () {
  };
  var of = (a) => function* () {
    yield a;
  };
  var map = (s, f2) => function* () {
    const g = s();
    while (true) {
      const { done, value } = g.next();
      if (done === true) {
        return;
      }
      yield f2(value);
    }
  };
  var flatMap = (s, f2) => function* () {
    const g = s();
    while (true) {
      const { done, value } = g.next();
      if (done === true) {
        return;
      }
      yield* f2(value)();
    }
  };
  var filter = (s, f2) => function* () {
    const g = s();
    while (true) {
      const { done, value } = g.next();
      if (done === true) {
        return;
      }
      if (f2(value)) {
        yield value;
      }
    }
  };
  var isEmpty = (s) => {
    const g = s();
    const { done } = g.next();
    if (done === true) {
      return true;
    }
    return false;
  };
  var sequence = (seqs) => function* () {
    if (!isNonEmptyArray(seqs)) {
      yield [];
      return;
    }
    const [first, ...rest] = seqs;
    for (const t of first()) {
      for (const ts of sequence(rest)()) {
        yield [t, ...ts];
      }
    }
  };
  var head = (s) => {
    const g = s();
    const { done, value } = g.next();
    if (done === true) {
      return [];
    }
    return [value];
  };
  var sequenceT = (t) => sequence(t);
  var repeatIO = (io) => function* () {
    while (true) {
      yield io();
    }
  };

  // src/utils/random.ts
  var split = (x) => () => {
    const rand = Math.random();
    const y = Math.floor(rand * x);
    return [y, x - y];
  };

  // src/model/valuation.ts
  var empty2 = {};
  var valuations = (atoms2) => function* () {
    if (!isNonEmptyArray(atoms2)) {
      yield empty2;
      return;
    }
    const [x, ...xs] = atoms2;
    const t = { [x]: true };
    const f2 = { [x]: false };
    const vs = valuations(xs);
    yield* map(vs, (v2) => ({ ...v2, ...t }))();
    yield* map(vs, (v2) => ({ ...v2, ...f2 }))();
  };
  var satisfies = (v2, p) => fold(p, {
    atom: (value) => () => v2[value] ?? null,
    falsum: () => () => false,
    verum: () => () => true,
    negation: (negand) => () => {
      const n = negand();
      if (n === null) {
        return null;
      }
      return !n;
    },
    implication: (antecedent, consequent) => () => {
      const a = antecedent();
      if (a === false) {
        return true;
      }
      const c = consequent();
      if (c === true) {
        return true;
      }
      if (a === null) {
        return null;
      }
      if (c === null) {
        return null;
      }
      return false;
    },
    conjunction: (leftConjunct, rightConjunct) => () => {
      const l = leftConjunct();
      if (l === false) {
        return false;
      }
      const r = rightConjunct();
      if (r === false) {
        return false;
      }
      if (l === null) {
        return null;
      }
      if (r === null) {
        return null;
      }
      return true;
    },
    disjunction: (leftDisjunct, rightDisjunct) => () => {
      const l = leftDisjunct();
      if (l === true) {
        return true;
      }
      const r = rightDisjunct();
      if (r === true) {
        return true;
      }
      if (l === null) {
        return null;
      }
      if (r === null) {
        return null;
      }
      return false;
    }
  });
  var isModel = (v2, p) => satisfies(v2, p)() ?? false;
  var isCountermodel = (v2, p) => !isModel(v2, p);

  // src/model/prop.ts
  var atom = (value) => ({
    kind: "atom",
    value
  });
  var falsum = {
    kind: "falsum"
  };
  var verum = {
    kind: "verum"
  };
  var negation = (negand) => ({
    kind: "negation",
    negand
  });
  var isNegation = (p) => p.kind === "negation";
  var implication = (antecedent, consequent) => ({
    kind: "implication",
    antecedent,
    consequent
  });
  var isImplication = (p) => p.kind === "implication";
  var conjunction = (leftConjunct, rightConjunct) => ({
    kind: "conjunction",
    leftConjunct,
    rightConjunct
  });
  var isConjunction = (p) => p.kind === "conjunction";
  var disjunction = (leftDisjunct, rightDisjunct) => ({
    kind: "disjunction",
    leftDisjunct,
    rightDisjunct
  });
  var isDisjunction = (p) => p.kind === "disjunction";
  var match = (p, f2) => {
    switch (p.kind) {
      case "atom":
        return f2.atom(p.value);
      case "falsum":
        return f2.falsum();
      case "verum":
        return f2.verum();
      case "negation":
        return f2.negation(p.negand);
      case "implication":
        return f2.implication(p.antecedent, p.consequent);
      case "conjunction":
        return f2.conjunction(p.leftConjunct, p.rightConjunct);
      case "disjunction":
        return f2.disjunction(p.leftDisjunct, p.rightDisjunct);
    }
  };
  var equals = (a, b) => match(a, {
    atom: (value) => b.kind === "atom" && b.value === value,
    falsum: () => b.kind === "falsum",
    verum: () => b.kind === "verum",
    negation: (negand) => b.kind === "negation" && equals(b.negand, negand),
    implication: (antecedent, consequent) => b.kind === "implication" && equals(b.antecedent, antecedent) && equals(b.consequent, consequent),
    conjunction: (leftConjunct, rightConjunct) => b.kind === "conjunction" && equals(b.leftConjunct, leftConjunct) && equals(b.rightConjunct, rightConjunct),
    disjunction: (leftDisjunct, rightDisjunct) => b.kind === "disjunction" && equals(b.leftDisjunct, leftDisjunct) && equals(b.rightDisjunct, rightDisjunct)
  });
  var fold = (p, f2) => match(p, {
    atom: (value) => f2.atom(value),
    falsum: () => f2.falsum(),
    verum: () => f2.verum(),
    negation: (negand) => f2.negation(fold(negand, f2)),
    implication: (antecedent, consequent) => f2.implication(fold(antecedent, f2), fold(consequent, f2)),
    conjunction: (leftConjunct, rightConjunct) => f2.conjunction(fold(leftConjunct, f2), fold(rightConjunct, f2)),
    disjunction: (leftDisjunct, rightDisjunct) => f2.disjunction(fold(leftDisjunct, f2), fold(rightDisjunct, f2))
  });
  var atoms = (p) => fold(p, {
    atom: (value) => [value],
    falsum: () => [],
    verum: () => [],
    negation: (negand) => negand,
    implication: (antecedent, consequent) => uniq2([...antecedent, ...consequent]),
    conjunction: (leftConjunct, rightConjunct) => uniq2([...leftConjunct, ...rightConjunct]),
    disjunction: (leftDisjunct, rightDisjunct) => uniq2([...leftDisjunct, ...rightDisjunct])
  });
  var countermodels = (p) => {
    return filter(valuations(atoms(p)), (v2) => isCountermodel(v2, p));
  };
  var isTautology = (p) => {
    return isEmpty(countermodels(p));
  };
  var random = (size = 10) => () => {
    const rand = Math.random();
    if (size < 1) {
      if (rand < 0.05) {
        return falsum;
      }
      if (rand < 0.1) {
        return verum;
      }
      if (rand < 0.2) {
        return atom("s");
      }
      if (rand < 0.45) {
        return atom("r");
      }
      if (rand < 0.7) {
        return atom("q");
      }
      return atom("p");
    }
    const next = size - 1;
    const [left2, right2] = split(next)();
    if (rand < 0.3) {
      return conjunction(random(left2)(), random(right2)());
    }
    if (rand < 0.6) {
      return disjunction(random(left2)(), random(right2)());
    }
    if (rand < 0.9) {
      return implication(random(left2)(), random(right2)());
    }
    return negation(random(next)());
  };

  // src/utils/tuple.ts
  var head2 = (a) => {
    const [h] = a;
    return h;
  };
  var tail = (a) => {
    const [_h, ...t] = a;
    return t;
  };
  var init = (a) => {
    return a.slice(0, -1);
  };
  var last = (a) => {
    return a[a.length - 1];
  };
  var isTupleOf0 = (arr) => arr.length === 0;
  var isTupleOf1 = (arr) => arr.length === 1;

  // src/model/formulas.ts
  var equals2 = (fa, fb) => {
    return fa.length === fb.length && zip(fa, fb).every(([a, b]) => equals(a, b));
  };
  var rotations = (fs) => function* () {
    yield fs;
    if (!isNonEmptyArray(fs)) {
      return;
    }
    let tmp = rotate(fs);
    while (tmp[0] !== fs[0]) {
      yield tmp;
      tmp = rotate(tmp);
    }
  };

  // src/model/sequent.ts
  var sequent = (antecedent, succedent) => ({
    kind: "sequent",
    antecedent,
    succedent
  });
  var isActiveL = (j) => {
    return isNonEmptyArray(j.antecedent);
  };
  var refineActiveL = (r) => (j) => {
    return isActiveL(j) && r(last(j.antecedent));
  };
  var isActiveR = (j) => {
    return isNonEmptyArray(j.succedent);
  };
  var refineActiveR = (r) => (j) => {
    return isActiveR(j) && r(head2(j.succedent));
  };
  var conclusion = (proposition) => sequent([], [proposition]);
  var isConclusion = (j) => {
    return j.antecedent.length === 0 && j.succedent.length === 1;
  };
  var equals3 = (a, b) => {
    return equals2(a.antecedent, b.antecedent) && equals2(a.succedent, b.succedent);
  };
  var isTautology2 = (s) => isTautology(
    implication(
      s.antecedent.reduce((acc, p) => conjunction(acc, p), verum),
      s.succedent.reduce((acc, p) => disjunction(acc, p), falsum)
    )
  );
  var rotations2 = (s) => function* () {
    yield* map(
      sequenceT([
        rotations(s.antecedent),
        rotations(s.succedent)
      ]),
      ([antecedent, succedent]) => sequent(antecedent, succedent)
    )();
  };

  // src/model/derivation.ts
  function premise(result) {
    return {
      kind: "premise",
      result
    };
  }
  function transformation(result, deps, rule) {
    return { kind: "transformation", result, deps, rule };
  }
  var refineDerivation = (r) => (s) => {
    return r(s.result);
  };
  function introduction(result, rule) {
    return transformation(result, [], rule);
  }
  function proof(result, deps, rule) {
    return { kind: "transformation", result, deps, rule };
  }

  // src/rules/a1.ts
  var isAxiom1 = (p) => {
    const piqip = p;
    if (piqip.kind !== "implication") {
      return false;
    }
    const p1 = piqip.antecedent;
    const qip = piqip.consequent;
    if (qip.kind !== "implication") {
      return false;
    }
    const p2 = qip.consequent;
    return equals(p1, p2);
  };
  var isA1Result = (s) => {
    return isConclusion(s) && isAxiom1(s.succedent[0]);
  };
  var isA1ResultDerivation = refineDerivation(isA1Result);
  var a1 = (result) => {
    return introduction(result, "A1");
  };
  var applyA1 = (p, q) => {
    return a1(conclusion(implication(p, implication(q, p))));
  };
  var reverseA1 = (p) => {
    return a1(p.result);
  };
  var tryReverseA1 = (d) => {
    return isA1ResultDerivation(d) ? reverseA1(d) : null;
  };
  var exampleA1 = applyA1(atom("A"), atom("B"));
  var ruleA1 = {
    id: "a1",
    isResult: isA1Result,
    isResultDerivation: isA1ResultDerivation,
    make: a1,
    apply: applyA1,
    reverse: reverseA1,
    tryReverse: tryReverseA1,
    example: exampleA1
  };

  // src/rules/a2.ts
  var isAxiom2 = (p) => {
    const piqiripiqipir = p;
    if (piqiripiqipir.kind !== "implication") {
      return false;
    }
    const piqir = piqiripiqipir.antecedent;
    if (piqir.kind !== "implication") {
      return false;
    }
    const p1 = piqir.antecedent;
    const qir = piqir.consequent;
    if (qir.kind !== "implication") {
      return false;
    }
    const q1 = qir.antecedent;
    const r1 = qir.consequent;
    const piqipir = piqiripiqipir.consequent;
    if (piqipir.kind !== "implication") {
      return false;
    }
    const piq = piqipir.antecedent;
    if (piq.kind !== "implication") {
      return false;
    }
    const p2 = piq.antecedent;
    const q2 = piq.consequent;
    const pir = piqipir.consequent;
    if (pir.kind !== "implication") {
      return false;
    }
    const p3 = pir.antecedent;
    const r2 = pir.consequent;
    if (!equals(p1, p2)) {
      return false;
    }
    if (!equals(p2, p3)) {
      return false;
    }
    if (!equals(q1, q2)) {
      return false;
    }
    if (!equals(r1, r2)) {
      return false;
    }
    return true;
  };
  var isA2Result = (s) => {
    return isConclusion(s) && isAxiom2(s.succedent[0]);
  };
  var isA2ResultDerivation = refineDerivation(isA2Result);
  var a2 = (result) => {
    return introduction(result, "A2");
  };
  var applyA2 = (p, q, r) => a2(
    conclusion(
      implication(
        implication(p, implication(q, r)),
        implication(implication(p, q), implication(p, r))
      )
    )
  );
  var reverseA2 = (p) => {
    return a2(p.result);
  };
  var tryReverseA2 = (d) => {
    return isA2ResultDerivation(d) ? reverseA2(d) : null;
  };
  var exampleA2 = applyA2(atom("A"), atom("B"), atom("C"));
  var ruleA2 = {
    id: "a2",
    isResult: isA2Result,
    isResultDerivation: isA2ResultDerivation,
    make: a2,
    apply: applyA2,
    reverse: reverseA2,
    tryReverse: tryReverseA2,
    example: exampleA2
  };

  // src/rules/a3.ts
  var isAxiom3 = (p) => {
    const npinqiqip = p;
    if (npinqiqip.kind !== "implication") {
      return false;
    }
    const npinq = npinqiqip.antecedent;
    if (npinq.kind !== "implication") {
      return false;
    }
    const np = npinq.antecedent;
    if (np.kind !== "negation") {
      return false;
    }
    const p1 = np.negand;
    const nq = npinq.consequent;
    if (nq.kind !== "negation") {
      return false;
    }
    const q1 = nq.negand;
    const qip = npinqiqip.consequent;
    if (qip.kind !== "implication") {
      return false;
    }
    const q2 = qip.antecedent;
    const p2 = qip.consequent;
    return equals(p1, p2) && equals(q1, q2);
  };
  var isA3Result = (s) => {
    return isConclusion(s) && isAxiom3(s.succedent[0]);
  };
  var isA3ResultDerivation = refineDerivation(isA3Result);
  var a3 = (result) => {
    return introduction(result, "A3");
  };
  var applyA3 = (p, q) => a3(
    conclusion(
      implication(implication(negation(p), negation(q)), implication(q, p))
    )
  );
  var reverseA3 = (p) => {
    return a3(p.result);
  };
  var tryReverseA3 = (d) => {
    return isA3ResultDerivation(d) ? reverseA3(d) : null;
  };
  var exampleA3 = applyA3(atom("A"), atom("B"));
  var ruleA3 = {
    id: "a3",
    isResult: isA3Result,
    isResultDerivation: isA3ResultDerivation,
    make: a3,
    apply: applyA3,
    reverse: reverseA3,
    tryReverse: tryReverseA3,
    example: exampleA3
  };

  // src/rules/cl.ts
  var isCLResult = refineActiveL(isConjunction);
  var isCLResultDerivation = refineDerivation(isCLResult);
  var cl = (result, deps) => {
    return transformation(result, deps, "cl");
  };
  var applyCL = (...deps) => {
    const [dep] = deps;
    const \u03B3 = init(init(dep.result.antecedent));
    const a = last(init(dep.result.antecedent));
    const b = last(dep.result.antecedent);
    const \u03B4 = dep.result.succedent;
    return cl(sequent([...\u03B3, conjunction(a, b)], \u03B4), deps);
  };
  var reverseCL = (p) => {
    const \u03B3 = init(p.result.antecedent);
    const acb = last(p.result.antecedent);
    const a = acb.leftConjunct;
    const b = acb.rightConjunct;
    const \u03B4 = p.result.succedent;
    return cl(p.result, [premise(sequent([...\u03B3, a, b], \u03B4))]);
  };
  var tryReverseCL = (d) => {
    return isCLResultDerivation(d) ? reverseCL(d) : null;
  };
  var exampleCL = applyCL(
    premise(sequent([atom("\u0393"), atom("A"), atom("B")], [atom("\u0394")]))
  );
  var ruleCL = {
    id: "cl",
    isResult: isCLResult,
    isResultDerivation: isCLResultDerivation,
    make: cl,
    apply: applyCL,
    reverse: reverseCL,
    tryReverse: tryReverseCL,
    example: exampleCL
  };

  // src/rules/cl1.ts
  var isCL1Result = refineActiveL(isConjunction);
  var isCL1ResultDerivation = refineDerivation(isCL1Result);
  var cl1 = (result, deps) => {
    return transformation(result, deps, "cl1");
  };
  var applyCL1 = (b, ...deps) => {
    const [dep] = deps;
    const \u03B3 = init(dep.result.antecedent);
    const a = last(dep.result.antecedent);
    const \u03B4 = dep.result.succedent;
    return cl1(sequent([...\u03B3, conjunction(a, b)], \u03B4), deps);
  };
  var reverseCL1 = (p) => {
    const \u03B3 = init(p.result.antecedent);
    const acb = last(p.result.antecedent);
    const a = acb.leftConjunct;
    const \u03B4 = p.result.succedent;
    return cl1(p.result, [premise(sequent([...\u03B3, a], \u03B4))]);
  };
  var tryReverseCL1 = (d) => {
    return isCL1ResultDerivation(d) ? reverseCL1(d) : null;
  };
  var exampleCL1 = applyCL1(
    atom("B"),
    premise(sequent([atom("\u0393"), atom("A")], [atom("\u0394")]))
  );
  var ruleCL1 = {
    id: "cl1",
    isResult: isCL1Result,
    isResultDerivation: isCL1ResultDerivation,
    make: cl1,
    apply: applyCL1,
    reverse: reverseCL1,
    tryReverse: tryReverseCL1,
    example: exampleCL1
  };

  // src/rules/cl2.ts
  var isCL2Result = refineActiveL(isConjunction);
  var isCL2ResultDerivation = refineDerivation(isCL2Result);
  var cl2 = (result, deps) => {
    return transformation(result, deps, "cl2");
  };
  var applyCL2 = (a, ...deps) => {
    const [dep] = deps;
    const \u03B3 = init(dep.result.antecedent);
    const b = last(dep.result.antecedent);
    const \u03B4 = dep.result.succedent;
    return cl2(sequent([...\u03B3, conjunction(a, b)], \u03B4), deps);
  };
  var reverseCL2 = (p) => {
    const \u03B3 = init(p.result.antecedent);
    const acb = last(p.result.antecedent);
    const b = acb.rightConjunct;
    const \u03B4 = p.result.succedent;
    return cl2(p.result, [premise(sequent([...\u03B3, b], \u03B4))]);
  };
  var tryReverseCL2 = (d) => {
    return isCL2ResultDerivation(d) ? reverseCL2(d) : null;
  };
  var exampleCL2 = applyCL2(
    atom("A"),
    premise(sequent([atom("\u0393"), atom("B")], [atom("\u0394")]))
  );
  var ruleCL2 = {
    id: "cl2",
    isResult: isCL2Result,
    isResultDerivation: isCL2ResultDerivation,
    make: cl2,
    apply: applyCL2,
    reverse: reverseCL2,
    tryReverse: tryReverseCL2,
    example: exampleCL2
  };

  // src/rules/cr.ts
  var isCRResult = refineActiveR(isConjunction);
  var isCRResultDerivation = refineDerivation(isCRResult);
  var cr = (result, deps) => {
    return transformation(result, deps, "cr");
  };
  var applyCR = (...deps) => {
    const [dep1, dep2] = deps;
    const \u03B3 = dep1.result.antecedent;
    const a = head2(dep1.result.succedent);
    const b = head2(dep2.result.succedent);
    const \u03B4 = tail(dep1.result.succedent);
    return cr(sequent(\u03B3, [conjunction(a, b), ...\u03B4]), deps);
  };
  var reverseCR = (p) => {
    const \u03B3 = p.result.antecedent;
    const acb = head2(p.result.succedent);
    const a = acb.leftConjunct;
    const b = acb.rightConjunct;
    const \u03B4 = tail(p.result.succedent);
    return cr(p.result, [
      premise(sequent(\u03B3, [a, ...\u03B4])),
      premise(sequent(\u03B3, [b, ...\u03B4]))
    ]);
  };
  var tryReverseCR = (d) => {
    return isCRResultDerivation(d) ? reverseCR(d) : null;
  };
  var exampleCR = applyCR(
    premise(sequent([atom("\u0393")], [atom("A"), atom("\u0394")])),
    premise(sequent([atom("\u0393")], [atom("B"), atom("\u0394")]))
  );
  var ruleCR = {
    id: "cr",
    isResult: isCRResult,
    isResultDerivation: isCRResultDerivation,
    make: cr,
    apply: applyCR,
    reverse: reverseCR,
    tryReverse: tryReverseCR,
    example: exampleCR
  };

  // src/rules/cut.ts
  var isCutResult = (s) => {
    return true;
  };
  var isCutResultDerivation = refineDerivation(isCutResult);
  var cut = (result, deps) => {
    return transformation(result, deps, "Cut");
  };
  var applyCut = (...deps) => {
    const [dep1] = deps;
    const \u03B3 = dep1.result.antecedent;
    const \u03B4 = init(dep1.result.succedent);
    return cut(sequent(\u03B3, \u03B4), deps);
  };
  var reverseCut = (p, a) => {
    const \u03B3 = p.result.antecedent;
    const \u03B4 = p.result.succedent;
    return cut(p.result, [
      premise(sequent(\u03B3, [...\u03B4, a])),
      premise(sequent([a, ...\u03B3], \u03B4))
    ]);
  };
  var tryReverseCut = (a) => (d) => {
    return isCutResultDerivation(d) ? reverseCut(d, a) : null;
  };
  var exampleCut = applyCut(
    premise(sequent([atom("\u0393")], [atom("\u0394"), atom("A")])),
    premise(sequent([atom("A"), atom("\u0393")], [atom("\u0394")]))
  );
  var ruleCut = {
    id: "cut",
    isResult: isCutResult,
    isResultDerivation: isCutResultDerivation,
    make: cut,
    apply: applyCut,
    reverse: reverseCut,
    tryReverse: tryReverseCut,
    example: exampleCut
  };

  // src/rules/dl.ts
  var isDLResult = refineActiveL(isDisjunction);
  var isDLResultDerivation = refineDerivation(isDLResult);
  var dl = (result, deps) => {
    return transformation(result, deps, "dl");
  };
  var applyDL = (...deps) => {
    const [dep1, dep2] = deps;
    const \u03B3 = init(dep1.result.antecedent);
    const a = last(dep1.result.antecedent);
    const b = last(dep2.result.antecedent);
    const \u03B4 = dep1.result.succedent;
    return dl(sequent([...\u03B3, disjunction(a, b)], \u03B4), deps);
  };
  var reverseDL = (p) => {
    const \u03B3 = init(p.result.antecedent);
    const adb = last(p.result.antecedent);
    const a = adb.leftDisjunct;
    const b = adb.rightDisjunct;
    const \u03B4 = p.result.succedent;
    return dl(p.result, [
      premise(sequent([...\u03B3, a], \u03B4)),
      premise(sequent([...\u03B3, b], \u03B4))
    ]);
  };
  var tryReverseDL = (d) => {
    return isDLResultDerivation(d) ? reverseDL(d) : null;
  };
  var exampleDL = applyDL(
    premise(sequent([atom("\u0393"), atom("A")], [atom("\u0394")])),
    premise(sequent([atom("\u0393"), atom("B")], [atom("\u0394")]))
  );
  var ruleDL = {
    id: "dl",
    isResult: isDLResult,
    isResultDerivation: isDLResultDerivation,
    make: dl,
    apply: applyDL,
    reverse: reverseDL,
    tryReverse: tryReverseDL,
    example: exampleDL
  };

  // src/rules/dr.ts
  var isDRResult = (s) => {
    return s.succedent.at(0)?.kind === "disjunction";
  };
  var isDRResultDerivation = refineDerivation(isDRResult);
  var dr = (result, deps) => {
    return transformation(result, deps, "dr");
  };
  var applyDR = (...deps) => {
    const [dep] = deps;
    const \u03B3 = dep.result.antecedent;
    const a = head2(dep.result.succedent);
    const b = head2(tail(dep.result.succedent));
    const \u03B4 = tail(tail(dep.result.succedent));
    return dr(sequent(\u03B3, [disjunction(a, b), ...\u03B4]), deps);
  };
  var reverseDR = (p) => {
    const \u03B3 = p.result.antecedent;
    const adb = head2(p.result.succedent);
    const a = adb.leftDisjunct;
    const b = adb.rightDisjunct;
    const \u03B4 = tail(p.result.succedent);
    return dr(p.result, [premise(sequent(\u03B3, [a, b, ...\u03B4]))]);
  };
  var tryReverseDR = (d) => {
    return isDRResultDerivation(d) ? reverseDR(d) : null;
  };
  var exampleDR = applyDR(
    premise(sequent([atom("\u0393")], [atom("A"), atom("B"), atom("\u0394")]))
  );
  var ruleDR = {
    id: "dr",
    isResult: isDRResult,
    isResultDerivation: isDRResultDerivation,
    make: dr,
    apply: applyDR,
    reverse: reverseDR,
    tryReverse: tryReverseDR,
    example: exampleDR
  };

  // src/rules/dr1.ts
  var isDR1Result = (s) => {
    return s.succedent.at(0)?.kind === "disjunction";
  };
  var isDR1ResultDerivation = refineDerivation(isDR1Result);
  var dr1 = (result, deps) => {
    return transformation(result, deps, "dr1");
  };
  var applyDR1 = (b, ...deps) => {
    const [dep] = deps;
    const \u03B3 = dep.result.antecedent;
    const \u03B4 = tail(dep.result.succedent);
    const a = head2(dep.result.succedent);
    return dr1(sequent(\u03B3, [disjunction(a, b), ...\u03B4]), deps);
  };
  var reverseDR1 = (p) => {
    const \u03B3 = p.result.antecedent;
    const adb = head2(p.result.succedent);
    const a = adb.leftDisjunct;
    const \u03B4 = tail(p.result.succedent);
    return dr1(p.result, [premise(sequent(\u03B3, [a, ...\u03B4]))]);
  };
  var tryReverseDR1 = (d) => {
    return isDR1ResultDerivation(d) ? reverseDR1(d) : null;
  };
  var exampleDR1 = applyDR1(
    atom("B"),
    premise(sequent([atom("\u0393")], [atom("A"), atom("\u0394")]))
  );
  var ruleDR1 = {
    id: "dr1",
    isResult: isDR1Result,
    isResultDerivation: isDR1ResultDerivation,
    make: dr1,
    apply: applyDR1,
    reverse: reverseDR1,
    tryReverse: tryReverseDR1,
    example: exampleDR1
  };

  // src/rules/dr2.ts
  var isDR2Result = (s) => {
    return s.succedent.at(0)?.kind === "disjunction";
  };
  var isDR2ResultDerivation = refineDerivation(isDR2Result);
  var dr2 = (result, deps) => {
    return transformation(result, deps, "dr2");
  };
  var applyDR2 = (a, ...deps) => {
    const [dep] = deps;
    const \u03B3 = dep.result.antecedent;
    const \u03B4 = tail(dep.result.succedent);
    const b = head2(dep.result.succedent);
    return dr2(sequent(\u03B3, [disjunction(a, b), ...\u03B4]), deps);
  };
  var reverseDR2 = (p) => {
    const \u03B3 = p.result.antecedent;
    const adb = head2(p.result.succedent);
    const b = adb.rightDisjunct;
    const \u03B4 = tail(p.result.succedent);
    return dr2(p.result, [premise(sequent(\u03B3, [b, ...\u03B4]))]);
  };
  var tryReverseDR2 = (d) => {
    return isDR2ResultDerivation(d) ? reverseDR2(d) : null;
  };
  var exampleDR2 = applyDR2(
    atom("A"),
    premise(sequent([atom("\u0393")], [atom("B"), atom("\u0394")]))
  );
  var ruleDR2 = {
    id: "dr2",
    isResult: isDR2Result,
    isResultDerivation: isDR2ResultDerivation,
    make: dr2,
    apply: applyDR2,
    reverse: reverseDR2,
    tryReverse: tryReverseDR2,
    example: exampleDR2
  };

  // src/rules/f.ts
  var isFResult = (s) => {
    return isTupleOf1(s.antecedent) && isTupleOf0(s.succedent) && equals(s.antecedent[0], falsum);
  };
  var isFResultDerivation = refineDerivation(isFResult);
  var f = (result) => introduction(result, "f");
  var applyF = () => f(sequent([falsum], []));
  var reverseF = (p) => {
    return f(p.result);
  };
  var tryReverseF = (d) => {
    return isFResultDerivation(d) ? reverseF(d) : null;
  };
  var exampleF = applyF();
  var ruleF = {
    id: "f",
    isResult: isFResult,
    isResultDerivation: isFResultDerivation,
    make: f,
    apply: applyF,
    reverse: reverseF,
    tryReverse: tryReverseF,
    example: exampleF
  };

  // src/rules/i.ts
  var isIResult = (s) => {
    return isTupleOf1(s.antecedent) && isTupleOf1(s.succedent) && equals(s.antecedent[0], s.succedent[0]);
  };
  var isIResultDerivation = refineDerivation(isIResult);
  var i = (result) => introduction(result, "i");
  var applyI = (a) => i(sequent([a], [a]));
  var reverseI = (p) => {
    return i(p.result);
  };
  var tryReverseI = (d) => {
    return isIResultDerivation(d) ? reverseI(d) : null;
  };
  var exampleI = applyI(atom("A"));
  var ruleI = {
    id: "i",
    isResult: isIResult,
    isResultDerivation: isIResultDerivation,
    make: i,
    apply: applyI,
    reverse: reverseI,
    tryReverse: tryReverseI,
    example: exampleI
  };

  // src/rules/il.ts
  var isILResult = refineActiveL(isImplication);
  var isILResultDerivation = refineDerivation(isILResult);
  var il = (result, deps) => {
    return transformation(result, deps, "il");
  };
  var applyIL = (...deps) => {
    const [dep1, dep2] = deps;
    const \u03B3 = dep1.result.antecedent;
    const a = head2(dep1.result.succedent);
    const b = last(dep2.result.antecedent);
    const \u03B4 = tail(dep1.result.succedent);
    return il(sequent([...\u03B3, implication(a, b)], \u03B4), deps);
  };
  var reverseIL = (p) => {
    const \u03B3 = init(p.result.antecedent);
    const aib = last(p.result.antecedent);
    const a = aib.antecedent;
    const b = aib.consequent;
    const \u03B4 = p.result.succedent;
    return il(p.result, [
      premise(sequent(\u03B3, [a, ...\u03B4])),
      premise(sequent([...\u03B3, b], \u03B4))
    ]);
  };
  var tryReverseIL = (d) => {
    return isILResultDerivation(d) ? reverseIL(d) : null;
  };
  var exampleIL = applyIL(
    premise(sequent([atom("\u0393")], [atom("A"), atom("\u0394")])),
    premise(sequent([atom("\u0393"), atom("B")], [atom("\u0394")]))
  );
  var ruleIL = {
    id: "il",
    isResult: isILResult,
    isResultDerivation: isILResultDerivation,
    make: il,
    apply: applyIL,
    reverse: reverseIL,
    tryReverse: tryReverseIL,
    example: exampleIL
  };

  // src/rules/ir.ts
  var isIRResult = refineActiveR(isImplication);
  var isIRResultDerivation = refineDerivation(isIRResult);
  var ir = (result, deps) => {
    return transformation(result, deps, "ir");
  };
  var applyIR = (...deps) => {
    const [dep] = deps;
    const \u03B3 = init(dep.result.antecedent);
    const a = last(dep.result.antecedent);
    const b = head2(dep.result.succedent);
    const \u03B4 = tail(dep.result.succedent);
    return ir(sequent(\u03B3, [implication(a, b), ...\u03B4]), deps);
  };
  var reverseIR = (p) => {
    const \u03B3 = p.result.antecedent;
    const aib = head2(p.result.succedent);
    const a = aib.antecedent;
    const b = aib.consequent;
    const \u03B4 = tail(p.result.succedent);
    return ir(p.result, [premise(sequent([...\u03B3, a], [b, ...\u03B4]))]);
  };
  var tryReverseIR = (d) => {
    return isIRResultDerivation(d) ? reverseIR(d) : null;
  };
  var exampleIR = applyIR(
    premise(sequent([atom("\u0393"), atom("A")], [atom("B"), atom("\u0394")]))
  );
  var ruleIR = {
    id: "ir",
    isResult: isIRResult,
    isResultDerivation: isIRResultDerivation,
    make: ir,
    apply: applyIR,
    reverse: reverseIR,
    tryReverse: tryReverseIR,
    example: exampleIR
  };

  // src/utils/utils.ts
  var assertEqual = (a, b) => {
    if (JSON.stringify(a) === JSON.stringify(b)) {
      return a;
    }
    return assertNever(b);
  };
  function assertNever(_n, s = "Unexpected value") {
    throw new Error(s);
  }

  // src/rules/mp.ts
  var isMPResult = (j) => isConclusion(j);
  var isMPResultDerivation = refineDerivation(isMPResult);
  var mp = (result, deps) => transformation(result, deps, "MP");
  var applyMP = (...deps) => {
    const [dep1, dep2] = deps;
    const a12 = dep1.result.succedent[0].antecedent;
    const a22 = dep2.result.succedent[0];
    const _a = assertEqual(a12, a22);
    const c = dep1.result.succedent[0].consequent;
    return transformation(conclusion(c), deps, "MP");
  };
  var reverseMP = (d, p) => {
    const q = head2(d.result.succedent);
    const piq = implication(p, q);
    return mp(d.result, [premise(conclusion(piq)), premise(conclusion(p))]);
  };
  var tryReverseMP = (p) => (d) => {
    return isMPResultDerivation(d) ? reverseMP(d, p) : null;
  };
  var exampleMP = applyMP(
    premise(conclusion(implication(atom("A"), atom("B")))),
    premise(conclusion(atom("A")))
  );
  var ruleMP = {
    id: "mp",
    isResult: isMPResult,
    isResultDerivation: isMPResultDerivation,
    make: mp,
    apply: applyMP,
    reverse: reverseMP,
    tryReverse: tryReverseMP,
    example: exampleMP
  };

  // src/rules/nl.ts
  var isNLResult = refineActiveL(isNegation);
  var isNLResultDerivation = refineDerivation(isNLResult);
  var nl = (result, deps) => {
    return transformation(result, deps, "nl");
  };
  var applyNL = (...deps) => {
    const [dep] = deps;
    const \u03B3 = dep.result.antecedent;
    const a = head2(dep.result.succedent);
    const \u03B4 = tail(dep.result.succedent);
    return nl(sequent([...\u03B3, negation(a)], \u03B4), deps);
  };
  var reverseNL = (p) => {
    const \u03B3 = init(p.result.antecedent);
    const na = last(p.result.antecedent);
    const a = na.negand;
    const \u03B4 = p.result.succedent;
    return nl(p.result, [premise(sequent(\u03B3, [a, ...\u03B4]))]);
  };
  var tryReverseNL = (d) => {
    return isNLResultDerivation(d) ? reverseNL(d) : null;
  };
  var exampleNL = applyNL(
    premise(sequent([atom("\u0393")], [atom("A"), atom("\u0394")]))
  );
  var ruleNL = {
    id: "nl",
    isResult: isNLResult,
    isResultDerivation: isNLResultDerivation,
    make: nl,
    apply: applyNL,
    reverse: reverseNL,
    tryReverse: tryReverseNL,
    example: exampleNL
  };

  // src/rules/nr.ts
  var isNRResult = refineActiveR(isNegation);
  var isNRResultDerivation = refineDerivation(isNRResult);
  var nr = (result, deps) => {
    return transformation(result, deps, "nr");
  };
  var applyNR = (...deps) => {
    const [dep] = deps;
    const \u03B3 = init(dep.result.antecedent);
    const a = last(dep.result.antecedent);
    const \u03B4 = dep.result.succedent;
    return nr(sequent(\u03B3, [negation(a), ...\u03B4]), deps);
  };
  var reverseNR = (p) => {
    const \u03B3 = p.result.antecedent;
    const na = head2(p.result.succedent);
    const a = na.negand;
    const \u03B4 = tail(p.result.succedent);
    return nr(p.result, [premise(sequent([...\u03B3, a], \u03B4))]);
  };
  var tryReverseNR = (d) => {
    return isNRResultDerivation(d) ? reverseNR(d) : null;
  };
  var exampleNR = applyNR(
    premise(sequent([atom("\u0393"), atom("A")], [atom("\u0394")]))
  );
  var ruleNR = {
    id: "nr",
    isResult: isNRResult,
    isResultDerivation: isNRResultDerivation,
    make: nr,
    apply: applyNR,
    reverse: reverseNR,
    tryReverse: tryReverseNR,
    example: exampleNR
  };

  // src/rules/scl.ts
  var isSCLResult = (s) => {
    return s.antecedent.length > 0;
  };
  var isSCLResultDerivation = refineDerivation(isSCLResult);
  var scl = (result, deps) => {
    return transformation(result, deps, "scl");
  };
  var applySCL = (...deps) => {
    const [dep] = deps;
    const \u03B3 = init(init(dep.result.antecedent));
    const a = last(dep.result.antecedent);
    const \u03B4 = dep.result.succedent;
    return scl(sequent([...\u03B3, a], \u03B4), deps);
  };
  var reverseSCL = (p) => {
    const \u03B3 = init(p.result.antecedent);
    const a = last(p.result.antecedent);
    const \u03B4 = p.result.succedent;
    return scl(p.result, [premise(sequent([...\u03B3, a, a], \u03B4))]);
  };
  var tryReverseSCL = (d) => {
    return isSCLResultDerivation(d) ? reverseSCL(d) : null;
  };
  var exampleSCL = applySCL(
    premise(sequent([atom("\u0393"), atom("A"), atom("A")], [atom("\u0394")]))
  );
  var ruleSCL = {
    id: "scl",
    isResult: isSCLResult,
    isResultDerivation: isSCLResultDerivation,
    make: scl,
    apply: applySCL,
    reverse: reverseSCL,
    tryReverse: tryReverseSCL,
    example: exampleSCL
  };

  // src/rules/scr.ts
  var isSCRResult = isActiveR;
  var isSCRResultDerivation = refineDerivation(isSCRResult);
  var scr = (result, deps) => {
    return transformation(result, deps, "scr");
  };
  var applySCR = (...deps) => {
    const [dep] = deps;
    const \u03B3 = dep.result.antecedent;
    const a = head2(dep.result.succedent);
    const \u03B4 = tail(tail(dep.result.succedent));
    return scr(sequent(\u03B3, [a, ...\u03B4]), deps);
  };
  var reverseSCR = (p) => {
    const \u03B3 = p.result.antecedent;
    const a = head2(p.result.succedent);
    const \u03B4 = tail(p.result.succedent);
    return scr(p.result, [premise(sequent(\u03B3, [a, a, ...\u03B4]))]);
  };
  var tryReverseSCR = (d) => {
    return isSCRResultDerivation(d) ? reverseSCR(d) : null;
  };
  var exampleSCR = applySCR(
    premise(sequent([atom("\u0393")], [atom("A"), atom("A"), atom("\u0394")]))
  );
  var ruleSCR = {
    id: "scr",
    isResult: isSCRResult,
    isResultDerivation: isSCRResultDerivation,
    make: scr,
    apply: applySCR,
    reverse: reverseSCR,
    tryReverse: tryReverseSCR,
    example: exampleSCR
  };

  // src/rules/srotlb.ts
  var isSRotLBResult = (s) => {
    return s.antecedent.length > 1;
  };
  var isSRotLBResultDerivation = refineDerivation(isSRotLBResult);
  var sRotLB = (result, deps) => {
    return transformation(result, deps, "sRotLB");
  };
  var applySRotLB = (...deps) => {
    const [dep] = deps;
    const a = head2(dep.result.antecedent);
    const \u03B3 = init(tail(dep.result.antecedent));
    const b = last(dep.result.antecedent);
    const \u03B4 = dep.result.succedent;
    return sRotLB(sequent([...\u03B3, b, a], \u03B4), deps);
  };
  var reverseSRotLB = (p) => {
    const \u03B3 = init(init(p.result.antecedent));
    const a = last(p.result.antecedent);
    const b = last(init(p.result.antecedent));
    const \u03B4 = p.result.succedent;
    return sRotLB(p.result, [premise(sequent([a, ...\u03B3, b], \u03B4))]);
  };
  var tryReverseSRotLB = (d) => {
    return isSRotLBResultDerivation(d) ? reverseSRotLB(d) : null;
  };
  var exampleSRotLB = applySRotLB(
    premise(sequent([atom("A"), atom("\u0393"), atom("B")], [atom("\u0394")]))
  );
  var ruleSRotLB = {
    id: "sRotLB",
    isResult: isSRotLBResult,
    isResultDerivation: isSRotLBResultDerivation,
    make: sRotLB,
    apply: applySRotLB,
    reverse: reverseSRotLB,
    tryReverse: tryReverseSRotLB,
    example: exampleSRotLB
  };

  // src/rules/srotlf.ts
  var isSRotLFResult = (s) => {
    return s.antecedent.length > 1;
  };
  var isSRotLFResultDerivation = refineDerivation(isSRotLFResult);
  var sRotLF = (result, deps) => {
    return transformation(result, deps, "sRotLF");
  };
  var applySRotLF = (...deps) => {
    const [dep] = deps;
    const \u03B3 = init(init(dep.result.antecedent));
    const a = last(dep.result.antecedent);
    const b = last(init(dep.result.antecedent));
    const \u03B4 = dep.result.succedent;
    return sRotLF(sequent([a, ...\u03B3, b], \u03B4), deps);
  };
  var reverseSRotLF = (p) => {
    const \u03B3 = init(tail(p.result.antecedent));
    const a = head2(p.result.antecedent);
    const b = last(p.result.antecedent);
    const \u03B4 = p.result.succedent;
    return sRotLF(p.result, [premise(sequent([...\u03B3, b, a], \u03B4))]);
  };
  var tryReverseSRotLF = (d) => {
    return isSRotLFResultDerivation(d) ? reverseSRotLF(d) : null;
  };
  var exampleSRotLF = applySRotLF(
    premise(sequent([atom("\u0393"), atom("B"), atom("A")], [atom("\u0394")]))
  );
  var ruleSRotLF = {
    id: "sRotLF",
    isResult: isSRotLFResult,
    isResultDerivation: isSRotLFResultDerivation,
    make: sRotLF,
    apply: applySRotLF,
    reverse: reverseSRotLF,
    tryReverse: tryReverseSRotLF,
    example: exampleSRotLF
  };

  // src/rules/srotrb.ts
  var isSRotRBResult = (s) => {
    return s.succedent.length > 1;
  };
  var isSRotRBResultDerivation = refineDerivation(isSRotRBResult);
  var sRotRB = (result, deps) => {
    return transformation(result, deps, "sRotRB");
  };
  var applySRotRB = (...deps) => {
    const [dep] = deps;
    const \u03B3 = dep.result.antecedent;
    const \u03B4 = init(tail(dep.result.succedent));
    const a = last(dep.result.succedent);
    const b = head2(dep.result.succedent);
    return sRotRB(sequent(\u03B3, [a, b, ...\u03B4]), deps);
  };
  var reverseSRotRB = (p) => {
    const \u03B3 = p.result.antecedent;
    const \u03B4 = tail(tail(p.result.succedent));
    const a = head2(p.result.succedent);
    const b = head2(tail(p.result.succedent));
    return sRotRB(p.result, [premise(sequent(\u03B3, [b, ...\u03B4, a]))]);
  };
  var tryReverseSRotRB = (d) => {
    return isSRotRBResultDerivation(d) ? reverseSRotRB(d) : null;
  };
  var exampleSRotRB = applySRotRB(
    premise(sequent([atom("\u0393")], [atom("B"), atom("\u0394"), atom("A")]))
  );
  var ruleSRotRB = {
    id: "sRotRB",
    isResult: isSRotRBResult,
    isResultDerivation: isSRotRBResultDerivation,
    make: sRotRB,
    apply: applySRotRB,
    reverse: reverseSRotRB,
    tryReverse: tryReverseSRotRB,
    example: exampleSRotRB
  };

  // src/rules/srotrf.ts
  var isSRotRFResult = (s) => {
    return s.succedent.length > 1;
  };
  var isSRotRFResultDerivation = refineDerivation(isSRotRFResult);
  var sRotRF = (result, deps) => {
    return transformation(result, deps, "sRotRF");
  };
  var applySRotRF = (...deps) => {
    const [dep] = deps;
    const \u03B3 = dep.result.antecedent;
    const \u03B4 = tail(tail(dep.result.succedent));
    const a = head2(dep.result.succedent);
    const b = head2(tail(dep.result.succedent));
    return sRotRF(sequent(\u03B3, [b, ...\u03B4, a]), deps);
  };
  var reverseSRotRF = (p) => {
    const \u03B3 = p.result.antecedent;
    const \u03B4 = init(tail(p.result.succedent));
    const a = last(p.result.succedent);
    const b = head2(p.result.succedent);
    return sRotRF(p.result, [premise(sequent(\u03B3, [a, b, ...\u03B4]))]);
  };
  var tryReverseSRotRF = (d) => {
    return isSRotRFResultDerivation(d) ? reverseSRotRF(d) : null;
  };
  var exampleSRotRF = applySRotRF(
    premise(sequent([atom("\u0393")], [atom("A"), atom("B"), atom("\u0394")]))
  );
  var ruleSRotRF = {
    id: "sRotRF",
    isResult: isSRotRFResult,
    isResultDerivation: isSRotRFResultDerivation,
    make: sRotRF,
    apply: applySRotRF,
    reverse: reverseSRotRF,
    tryReverse: tryReverseSRotRF,
    example: exampleSRotRF
  };

  // src/rules/swl.ts
  var isSWLResult = (s) => {
    return s.antecedent.length > 0;
  };
  var isSWLResultDerivation = refineDerivation(isSWLResult);
  var swl = (result, deps) => {
    return transformation(result, deps, "swl");
  };
  var applySWL = (a, ...deps) => {
    const [dep] = deps;
    const \u03B3 = dep.result.antecedent;
    const \u03B4 = dep.result.succedent;
    return swl(sequent([...\u03B3, a], \u03B4), deps);
  };
  var reverseSWL = (p) => {
    const \u03B3 = init(p.result.antecedent);
    const \u03B4 = p.result.succedent;
    return swl(p.result, [premise(sequent(\u03B3, \u03B4))]);
  };
  var tryReverseSWL = (d) => {
    return isSWLResultDerivation(d) ? reverseSWL(d) : null;
  };
  var exampleSWL = applySWL(
    atom("A"),
    premise(sequent([atom("\u0393")], [atom("\u0394")]))
  );
  var ruleSWL = {
    id: "swl",
    isResult: isSWLResult,
    isResultDerivation: isSWLResultDerivation,
    make: swl,
    apply: applySWL,
    reverse: reverseSWL,
    tryReverse: tryReverseSWL,
    example: exampleSWL
  };

  // src/rules/swr.ts
  var isSWRResult = isActiveR;
  var isSWRResultDerivation = refineDerivation(isSWRResult);
  var swr = (result, deps) => {
    return transformation(result, deps, "swr");
  };
  var applySWR = (a, ...deps) => {
    const [dep] = deps;
    const \u03B3 = dep.result.antecedent;
    const \u03B4 = dep.result.succedent;
    return swr(sequent(\u03B3, [a, ...\u03B4]), deps);
  };
  var reverseSWR = (p) => {
    const \u03B3 = p.result.antecedent;
    const \u03B4 = tail(p.result.succedent);
    return swr(p.result, [premise(sequent(\u03B3, \u03B4))]);
  };
  var tryReverseSWR = (d) => {
    return isSWRResultDerivation(d) ? reverseSWR(d) : null;
  };
  var exampleSWR = applySWR(
    atom("A"),
    premise(sequent([atom("\u0393")], [atom("\u0394")]))
  );
  var ruleSWR = {
    id: "swr",
    isResult: isSWRResult,
    isResultDerivation: isSWRResultDerivation,
    make: swr,
    apply: applySWR,
    reverse: reverseSWR,
    tryReverse: tryReverseSWR,
    example: exampleSWR
  };

  // src/rules/sxl.ts
  var isSXLResult = (s) => {
    return s.antecedent.length > 1;
  };
  var isSXLResultDerivation = refineDerivation(isSXLResult);
  var sxl = (result, deps) => {
    return transformation(result, deps, "sxl");
  };
  var applySXL = (...deps) => {
    const [dep] = deps;
    const \u03B3 = init(init(dep.result.antecedent));
    const b = last(dep.result.antecedent);
    const a = last(init(dep.result.antecedent));
    const \u03B4 = dep.result.succedent;
    return sxl(sequent([...\u03B3, b, a], \u03B4), deps);
  };
  var reverseSXL = (p) => {
    const \u03B3 = init(init(p.result.antecedent));
    const a = last(p.result.antecedent);
    const b = last(init(p.result.antecedent));
    const \u03B4 = p.result.succedent;
    return sxl(p.result, [premise(sequent([...\u03B3, a, b], \u03B4))]);
  };
  var tryReverseSXL = (d) => {
    return isSXLResultDerivation(d) ? reverseSXL(d) : null;
  };
  var exampleSXL = applySXL(
    premise(sequent([atom("\u0393"), atom("A"), atom("B")], [atom("\u0394")]))
  );
  var ruleSXL = {
    id: "sxl",
    isResult: isSXLResult,
    isResultDerivation: isSXLResultDerivation,
    make: sxl,
    apply: applySXL,
    reverse: reverseSXL,
    tryReverse: tryReverseSXL,
    example: exampleSXL
  };

  // src/rules/sxr.ts
  var isSXRResult = (s) => {
    return s.succedent.length > 1;
  };
  var isSXRResultDerivation = refineDerivation(isSXRResult);
  var sxr = (result, deps) => {
    return transformation(result, deps, "sxr");
  };
  var applySXR = (...deps) => {
    const [dep] = deps;
    const \u03B3 = dep.result.antecedent;
    const b = head2(tail(dep.result.succedent));
    const a = head2(dep.result.succedent);
    const \u03B4 = tail(tail(dep.result.succedent));
    return sxr(sequent(\u03B3, [b, a, ...\u03B4]), deps);
  };
  var reverseSXR = (p) => {
    const \u03B3 = p.result.antecedent;
    const a = head2(tail(p.result.succedent));
    const b = head2(p.result.succedent);
    const \u03B4 = tail(tail(p.result.succedent));
    return sxr(p.result, [premise(sequent(\u03B3, [a, b, ...\u03B4]))]);
  };
  var tryReverseSXR = (d) => {
    return isSXRResultDerivation(d) ? reverseSXR(d) : null;
  };
  var exampleSXR = applySXR(
    premise(sequent([atom("\u0393")], [atom("A"), atom("B"), atom("\u0394")]))
  );
  var ruleSXR = {
    id: "sxr",
    isResult: isSXRResult,
    isResultDerivation: isSXRResultDerivation,
    make: sxr,
    apply: applySXR,
    reverse: reverseSXR,
    tryReverse: tryReverseSXR,
    example: exampleSXR
  };

  // src/rules/v.ts
  var isVResult = (s) => {
    return isTupleOf0(s.antecedent) && isTupleOf1(s.succedent) && equals(s.succedent[0], verum);
  };
  var isVResultDerivation = refineDerivation(isVResult);
  var v = (result) => introduction(result, "v");
  var applyV = () => v(sequent([], [verum]));
  var reverseV = (p) => {
    return v(p.result);
  };
  var tryReverseV = (d) => {
    return isVResultDerivation(d) ? reverseV(d) : null;
  };
  var exampleV = applyV();
  var ruleV = {
    id: "v",
    isResult: isVResult,
    isResultDerivation: isVResultDerivation,
    make: v,
    apply: applyV,
    reverse: reverseV,
    tryReverse: tryReverseV,
    example: exampleV
  };

  // src/rules/index.ts
  var reverseAxiom0 = {
    f: ruleF,
    v: ruleV,
    i: ruleI,
    a1: ruleA1,
    a2: ruleA2,
    a3: ruleA3
  };
  var reverseLogic0 = {
    ir: ruleIR,
    nl: ruleNL,
    nr: ruleNR,
    cl: ruleCL,
    cl1: ruleCL1,
    cl2: ruleCL2,
    dr: ruleDR,
    dr1: ruleDR1,
    dr2: ruleDR2,
    dl: ruleDL,
    cr: ruleCR,
    il: ruleIL
  };
  var reverseStructure0 = {
    swl: ruleSWL,
    swr: ruleSWR,
    scl: ruleSCL,
    scr: ruleSCR,
    sRotLF: ruleSRotLF,
    sRotLB: ruleSRotLB,
    sRotRF: ruleSRotRF,
    sRotRB: ruleSRotRB,
    sxl: ruleSXL,
    sxr: ruleSXR
  };
  var reverse0 = {
    ...reverseAxiom0,
    ...reverseLogic0,
    ...reverseStructure0
  };
  var reverse1 = {
    cut: ruleCut,
    mp: ruleMP
  };
  var _reverse = {
    ...reverse0,
    ...reverse1
  };
  var center = {
    a1: ruleA1,
    a2: ruleA2,
    a3: ruleA3,
    f: ruleF,
    cut: ruleCut,
    i: ruleI,
    mp: ruleMP,
    v: ruleV
  };
  var leftStructural = {
    scl: ruleSCL,
    swl: ruleSWL,
    sRotLB: ruleSRotLB,
    sRotLF: ruleSRotLF,
    sxl: ruleSXL
  };
  var leftLogical = {
    nl: ruleNL,
    cl: ruleCL,
    cl1: ruleCL1,
    cl2: ruleCL2,
    dl: ruleDL,
    il: ruleIL
  };
  var left = {
    ...leftStructural,
    ...leftLogical
  };
  var rightStructural = {
    scr: ruleSCR,
    swr: ruleSWR,
    sRotRB: ruleSRotRB,
    sRotRF: ruleSRotRF,
    sxr: ruleSXR
  };
  var rightLogical = {
    nr: ruleNR,
    dr: ruleDR,
    dr1: ruleDR1,
    dr2: ruleDR2,
    cr: ruleCR,
    ir: ruleIR
  };
  var right = {
    ...rightStructural,
    ...rightLogical
  };
  var _side = {
    ...center,
    ...left,
    ...right
  };

  // src/solver/brute.ts
  var hypoWeaken = (d) => function* () {
    const farLeft = d.result.antecedent.at(0);
    const farRight = d.result.succedent.at(-1);
    if (farLeft && farRight) {
      yield premise(sequent([farLeft], [farRight]));
    }
    if (farLeft) {
      yield premise(sequent([farLeft], []));
    }
    if (farRight) {
      yield premise(sequent([], [farRight]));
    }
  };
  var bruteWeaken0 = (d, p) => function* () {
    if (equals3(d.result, p.result)) {
      yield proof(d.result, p.deps, p.rule);
      return;
    }
    if (d.result.antecedent.length > p.result.antecedent.length && reverseStructure0.swl.isResultDerivation(d)) {
      const step = reverseStructure0.swl.reverse(d);
      const [dep] = step.deps;
      if (dep.kind === "premise") {
        yield* map(
          bruteWeaken0(dep, p),
          (depProof) => proof(step.result, [depProof], step.rule)
        )();
      }
      return;
    }
    if (d.result.succedent.length > p.result.succedent.length && reverseStructure0.swr.isResultDerivation(d)) {
      const step = reverseStructure0.swr.reverse(d);
      const [dep] = step.deps;
      if (dep.kind === "premise") {
        yield* map(
          bruteWeaken0(dep, p),
          (depProof) => proof(step.result, [depProof], step.rule)
        )();
      }
      return;
    }
  };
  var bruteAxiom0 = (d, limit) => function* () {
    for (const rule of Object.values(reverseAxiom0)) {
      const result = rule.tryReverse(d);
      if (!result) {
        continue;
      }
      yield* brute0(result, limit)();
    }
  };
  var bruteLogic0 = (d, limit) => function* () {
    yield* flatMap(
      hypoWeaken(d),
      (hypo) => flatMap(bruteAxiom0(hypo, limit), (h) => bruteWeaken0(d, h))
    )();
    for (const rule of Object.values(reverseLogic0)) {
      const result = rule.tryReverse(d);
      if (!result) {
        continue;
      }
      yield* brute0(result, limit)();
    }
  };
  var hypoRotate = (d) => function* () {
    yield* map(rotations2(d.result), premise)();
  };
  var bruteRotate0 = (d, p) => function* () {
    if (equals3(d.result, p.result)) {
      yield proof(d.result, p.deps, p.rule);
      return;
    }
    if (!equals2(d.result.antecedent, p.result.antecedent) && reverseStructure0.sRotLF.isResultDerivation(d)) {
      const step = reverseStructure0.sRotLF.reverse(d);
      const [dep] = step.deps;
      if (dep.kind === "premise") {
        yield* map(
          bruteRotate0(dep, p),
          (depProof) => proof(step.result, [depProof], step.rule)
        )();
      }
      return;
    }
    if (!equals2(d.result.succedent, p.result.succedent) && reverseStructure0.sRotRF.isResultDerivation(d)) {
      const step = reverseStructure0.sRotRF.reverse(d);
      const [dep] = step.deps;
      if (dep.kind === "premise") {
        yield* map(
          bruteRotate0(dep, p),
          (depProof) => proof(step.result, [depProof], step.rule)
        )();
      }
      return;
    }
  };
  var brute0Premise = (d, limit) => function* () {
    if (limit < 1) {
      return;
    }
    if (!isTautology2(d.result)) {
      return;
    }
    yield* flatMap(
      hypoRotate(d),
      (hypo) => flatMap(bruteLogic0(hypo, limit), (h) => bruteRotate0(d, h))
    )();
  };
  var brute0Transformation = (d, limit) => function* () {
    const depProofs = sequence(d.deps.map((dep) => brute0(dep, limit - 1)));
    yield* map(depProofs, (proofs) => proof(d.result, proofs, d.rule))();
  };
  var brute0 = (d, limit) => function* () {
    switch (d.kind) {
      case "premise":
        yield* brute0Premise(d, limit)();
        break;
      case "transformation":
        yield* brute0Transformation(d, limit)();
        break;
    }
  };
  var brute = (s) => {
    let limit = 0;
    while (true) {
      const proofs = head(brute0(premise(s), limit));
      if (isNonEmptyArray(proofs)) {
        return [proofs[0], limit];
      }
      limit += 1;
    }
  };

  // src/model/challenge.ts
  var random2 = (size = 10, minDifficulty = 8) => () => {
    let solution;
    while (!solution) {
      ;
      [solution] = head(
        flatMap(
          filter(repeatIO(random(size)), isTautology),
          (tautology) => {
            const [proof2, difficulty] = brute(conclusion(tautology));
            return difficulty < minDifficulty ? empty() : of(proof2);
          }
        )
      );
    }
    return {
      rules: [
        "i",
        "f",
        "v",
        "swl",
        "swr",
        "sRotLF",
        "sRotRF",
        "sRotLB",
        "sRotRB",
        "nl",
        "nr",
        "cl",
        "cr",
        "dl",
        "dr",
        "il",
        "ir"
      ],
      goal: solution.result,
      solution
    };
  };

  // src/web/challenge-worker.ts
  var running = true;
  var generate = () => {
    const { goal, rules } = random2()();
    return { goal, rules };
  };
  var loop = () => {
    if (!running) return;
    const challenge = generate();
    self.postMessage({ type: "challenge", challenge });
    setTimeout(loop, 0);
  };
  self.onmessage = (e) => {
    if (e.data.type === "pause") {
      running = false;
    } else if (e.data.type === "resume" && !running) {
      running = true;
      loop();
    }
  };
  loop();
})();
