"use strict";
(() => {
  // src/utils/record.ts
  var entries = (s) => Object.entries(s);

  // src/utils/iterable.ts
  var uniq = (arr) => (function* () {
    const skip = /* @__PURE__ */ new Set();
    const it = arr[Symbol.iterator]();
    while (true) {
      const { done, value } = it.next();
      if (done === true) {
        return;
      }
      if (skip.has(value)) {
        continue;
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
  var includes = (arr, val) => arr.some((x) => x === val);

  // src/utils/seq.ts
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

  // src/model/valuation.ts
  var empty = {};
  var valuations = (atoms2) => function* () {
    if (!isNonEmptyArray(atoms2)) {
      yield empty;
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
  var connectives = (p) => fold(p, {
    atom: () => [],
    falsum: () => ["falsum"],
    verum: () => ["verum"],
    negation: (negand) => uniq2(["negation", ...negand]),
    implication: (antecedent, consequent) => uniq2(["implication", ...antecedent, ...consequent]),
    conjunction: (leftConjunct, rightConjunct) => uniq2(["conjunction", ...leftConjunct, ...rightConjunct]),
    disjunction: (leftDisjunct, rightDisjunct) => uniq2(["disjunction", ...leftDisjunct, ...rightDisjunct])
  });
  var countermodels = (p) => {
    return filter(valuations(atoms(p)), (v2) => isCountermodel(v2, p));
  };
  var isTautology = (p) => {
    return isEmpty(countermodels(p));
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
  var equals3 = (a, b) => {
    return equals2(a.antecedent, b.antecedent) && equals2(a.succedent, b.succedent);
  };
  var isTautology2 = (s) => isTautology(
    implication(
      s.antecedent.reduce((acc, p) => conjunction(acc, p), verum),
      s.succedent.reduce((acc, p) => disjunction(acc, p), falsum)
    )
  );

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
  function proofUsing(result, deps, rule) {
    return { kind: "transformation", result, deps, rule };
  }

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
    connectives: ["conjunction"],
    isResult: isCLResult,
    isResultDerivation: isCLResultDerivation,
    make: cl,
    apply: applyCL,
    reverse: reverseCL,
    tryReverse: tryReverseCL,
    example: exampleCL
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
    connectives: ["conjunction"],
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
    return transformation(result, deps, "cut");
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
    connectives: [],
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
    connectives: ["disjunction"],
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
    connectives: ["disjunction"],
    isResult: isDRResult,
    isResultDerivation: isDRResultDerivation,
    make: dr,
    apply: applyDR,
    reverse: reverseDR,
    tryReverse: tryReverseDR,
    example: exampleDR
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
    connectives: ["falsum"],
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
    connectives: [],
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
    connectives: ["implication"],
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
    connectives: ["implication"],
    isResult: isIRResult,
    isResultDerivation: isIRResultDerivation,
    make: ir,
    apply: applyIR,
    reverse: reverseIR,
    tryReverse: tryReverseIR,
    example: exampleIR
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
    connectives: ["negation"],
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
    connectives: ["negation"],
    isResult: isNRResult,
    isResultDerivation: isNRResultDerivation,
    make: nr,
    apply: applyNR,
    reverse: reverseNR,
    tryReverse: tryReverseNR,
    example: exampleNR
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
    connectives: [],
    isResult: isSRotLBResult,
    isResultDerivation: isSRotLBResultDerivation,
    make: sRotLB,
    apply: applySRotLB,
    reverse: reverseSRotLB,
    tryReverse: tryReverseSRotLB,
    example: exampleSRotLB
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
    connectives: [],
    isResult: isSRotRBResult,
    isResultDerivation: isSRotRBResultDerivation,
    make: sRotRB,
    apply: applySRotRB,
    reverse: reverseSRotRB,
    tryReverse: tryReverseSRotRB,
    example: exampleSRotRB
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
    connectives: [],
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
    connectives: [],
    isResult: isSWRResult,
    isResultDerivation: isSWRResultDerivation,
    make: swr,
    apply: applySWR,
    reverse: reverseSWR,
    tryReverse: tryReverseSWR,
    example: exampleSWR
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
    connectives: ["verum"],
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
    i: ruleI
  };
  var reverseLogic0 = {
    ir: ruleIR,
    nl: ruleNL,
    nr: ruleNR,
    cl: ruleCL,
    dr: ruleDR,
    dl: ruleDL,
    cr: ruleCR,
    il: ruleIL
  };
  var reverseStructure0 = {
    swl: ruleSWL,
    swr: ruleSWR,
    sRotLB: ruleSRotLB,
    sRotRB: ruleSRotRB
  };
  var reverse0 = {
    ...reverseAxiom0,
    ...reverseLogic0,
    ...reverseStructure0
  };
  var reverse1 = {
    cut: ruleCut
  };
  var _reverse = {
    ...reverse0,
    ...reverse1
  };
  var center = {
    cut: ruleCut,
    i: ruleI
  };
  var leftStructural = {
    swl: ruleSWL,
    sRotLB: ruleSRotLB
  };
  var leftLogical = {
    nl: ruleNL,
    cl: ruleCL,
    dl: ruleDL,
    il: ruleIL
  };
  var left = {
    f: ruleF,
    ...leftStructural,
    ...leftLogical
  };
  var rightStructural = {
    swr: ruleSWR,
    sRotRB: ruleSRotRB
  };
  var rightLogical = {
    nr: ruleNR,
    dr: ruleDR,
    cr: ruleCR,
    ir: ruleIR
  };
  var right = {
    v: ruleV,
    ...rightStructural,
    ...rightLogical
  };
  var _side = {
    ...center,
    ...left,
    ...right
  };

  // src/solver/bruteStructure0.ts
  var seqKey = (s) => JSON.stringify([s.antecedent, s.succedent]);
  var buildStructurePath = (d, rules, p) => {
    if (equals3(d.result, p.result)) {
      return proofUsing(d.result, p.deps, p.rule);
    }
    const target = seqKey(p.result);
    const parent = /* @__PURE__ */ new Map();
    const startKey = seqKey(d.result);
    const queue = [d];
    const visited = /* @__PURE__ */ new Set([startKey]);
    const nodes = /* @__PURE__ */ new Map([[startKey, d]]);
    let found = false;
    outer: while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      const currentKey = seqKey(current.result);
      for (const [rId, rule] of entries(reverseStructure0)) {
        const ruleId = rId;
        if (!includes(rules, ruleId)) continue;
        const reversed = rule.tryReverse(current);
        if (!reversed || reversed.kind !== "transformation") continue;
        const [dep] = reversed.deps;
        if (!dep || dep.kind !== "premise") continue;
        const depKey = seqKey(dep.result);
        if (visited.has(depKey)) continue;
        visited.add(depKey);
        nodes.set(depKey, dep);
        parent.set(depKey, { parentKey: currentKey, ruleId });
        if (depKey === target) {
          found = true;
          break outer;
        }
        queue.push(dep);
      }
    }
    if (!found) return null;
    let proof = proofUsing(p.result, p.deps, p.rule);
    let key = target;
    while (key !== startKey) {
      const edge = parent.get(key);
      if (!edge) break;
      const parentNode = nodes.get(edge.parentKey);
      if (!parentNode) break;
      proof = proofUsing(parentNode.result, [proof], edge.ruleId);
      key = edge.parentKey;
    }
    return proof;
  };
  var bruteStructure0 = (d, rules, p) => function* () {
    const result = buildStructurePath(d, rules, p);
    if (result !== null) {
      yield result;
    }
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
  var bruteWeaken0 = (d, rules, p) => function* () {
    if (equals3(d.result, p.result)) {
      yield proofUsing(d.result, p.deps, p.rule);
      return;
    }
    const swl2 = "swl";
    if (includes(rules, swl2) && d.result.antecedent.length > p.result.antecedent.length && reverseStructure0[swl2].isResultDerivation(d)) {
      const step = reverseStructure0.swl.reverse(d);
      const [dep] = step.deps;
      if (dep.kind === "premise") {
        yield* map(
          bruteWeaken0(dep, rules, p),
          (depProof) => proofUsing(step.result, [depProof], swl2)
        )();
      }
      return;
    }
    const swr2 = "swr";
    if (includes(rules, swr2) && d.result.succedent.length > p.result.succedent.length && reverseStructure0[swr2].isResultDerivation(d)) {
      const step = reverseStructure0.swr.reverse(d);
      const [dep] = step.deps;
      if (dep.kind === "premise") {
        yield* map(
          bruteWeaken0(dep, rules, p),
          (depProof) => proofUsing(step.result, [depProof], swr2)
        )();
      }
      return;
    }
  };
  var bruteAxiom0 = (d, rules, limit) => function* () {
    for (const rule of Object.values(reverseAxiom0)) {
      if (!includes(rules, rule.id)) {
        continue;
      }
      const result = rule.tryReverse(d);
      if (!result) {
        continue;
      }
      yield* brute0(result, rules, limit)();
    }
  };
  var candidateConnectives = (rules, sequent2) => {
    const kinds = /* @__PURE__ */ new Set();
    for (const [rId, rule] of entries(reverse0)) {
      if (!includes(rules, rId)) continue;
      for (const kind of rule.connectives) kinds.add(kind);
    }
    for (const p of [...sequent2.antecedent, ...sequent2.succedent])
      for (const kind of connectives(p)) kinds.add(kind);
    return kinds;
  };
  var formulasOfOpCount = (opCount, atoms2, connectives2) => function* () {
    if (opCount === 0) {
      for (const a of atoms2) yield atom(a);
      if (connectives2.has("falsum")) yield falsum;
      if (connectives2.has("verum")) yield verum;
      return;
    }
    if (connectives2.has("negation")) {
      for (const p of formulasOfOpCount(opCount - 1, atoms2, connectives2)()) {
        yield negation(p);
      }
    }
    for (let leftOps = 0; leftOps < opCount; leftOps += 1) {
      const rightOps = opCount - 1 - leftOps;
      for (const l of formulasOfOpCount(leftOps, atoms2, connectives2)()) {
        for (const r of formulasOfOpCount(rightOps, atoms2, connectives2)()) {
          if (connectives2.has("implication")) yield implication(l, r);
          if (connectives2.has("conjunction")) yield conjunction(l, r);
          if (connectives2.has("disjunction")) yield disjunction(l, r);
        }
      }
    }
  };
  var bruteLogic1 = (d, rules, limit) => function* () {
    const applicableRules = entries(reverse1).filter(
      ([rId]) => includes(rules, rId)
    );
    if (applicableRules.length === 0) return;
    const atoms2 = uniq2([
      ...d.result.antecedent.flatMap(atoms),
      ...d.result.succedent.flatMap(atoms)
    ]);
    const connectives2 = candidateConnectives(rules, d.result);
    for (let opCount = 0; opCount <= limit * 2; opCount += 1) {
      for (const formula of formulasOfOpCount(opCount, atoms2, connectives2)()) {
        for (const [, rule] of applicableRules) {
          const result = rule.tryReverse(formula)(d);
          if (!result) continue;
          yield* brute0(result, rules, limit)();
        }
      }
    }
  };
  var bruteLogic0 = (d, rules, limit) => function* () {
    yield* flatMap(
      hypoWeaken(d),
      (hypo) => flatMap(
        bruteAxiom0(hypo, rules, limit),
        (h) => bruteWeaken0(d, rules, h)
      )
    )();
    for (const rule of Object.values(reverseLogic0)) {
      if (!includes(rules, rule.id)) {
        continue;
      }
      const result = rule.tryReverse(d);
      if (!result) {
        continue;
      }
      yield* brute0(result, rules, limit)();
    }
    yield* bruteLogic1(d, rules, limit)();
  };
  var hypoStructure = (d, rules) => function* () {
    const visited = /* @__PURE__ */ new Set();
    const queue = [d];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      const key = seqKey(current.result);
      if (visited.has(key)) continue;
      visited.add(key);
      yield current;
      for (const [rId, rule] of entries(reverseStructure0)) {
        const ruleId = rId;
        if (!includes(rules, ruleId)) continue;
        const reversed = rule.tryReverse(current);
        if (!reversed || reversed.kind !== "transformation") continue;
        const [dep] = reversed.deps;
        if (!dep || dep.kind !== "premise") continue;
        queue.push(dep);
      }
    }
  };
  var brute0Premise = (d, rules, limit) => function* () {
    if (limit < 1) {
      return;
    }
    if (!isTautology2(d.result)) {
      return;
    }
    yield* flatMap(
      hypoStructure(d, rules),
      (hypo) => flatMap(
        bruteLogic0(hypo, rules, limit),
        (h) => bruteStructure0(d, rules, h)
      )
    )();
  };
  var brute0Transformation = (d, rules, limit) => function* () {
    const depProofs = sequence(
      d.deps.map((dep) => brute0(dep, rules, limit - 1))
    );
    yield* map(
      depProofs,
      (proofs) => proofUsing(d.result, proofs, d.rule)
    )();
  };
  var brute0 = (d, rules, limit) => function* () {
    switch (d.kind) {
      case "premise":
        yield* brute0Premise(d, rules, limit)();
        break;
      case "transformation": {
        const rule = d.rule;
        if (includes(rules, rule)) {
          yield* brute0Transformation({ ...d, rule }, rules, limit)();
        }
        break;
      }
    }
  };
  var tryAtDepth = (c, limit) => {
    const proofs = head(brute0(premise(c.goal), c.rules, limit));
    return isNonEmptyArray(proofs) ? proofs[0] : void 0;
  };
  function* bruteSearchLimit(c, maxLimit) {
    for (let limit = 0; limit <= maxLimit; limit += 1) {
      const proof = tryAtDepth(c, limit);
      if (proof) return [proof, limit];
      yield;
    }
    return null;
  }

  // src/npc/npc-worker.ts
  var currentRequestId = null;
  var startSolve = (requestId, goal, rules, maxDepth) => {
    currentRequestId = requestId;
    const gen = bruteSearchLimit({ goal, rules }, maxDepth);
    const tick = () => {
      if (currentRequestId !== requestId) return;
      const result = gen.next();
      if (result.done === true) {
        currentRequestId = null;
        if (result.value === null) {
          self.postMessage({
            type: "exhausted",
            requestId
          });
          return;
        }
        const [proof] = result.value;
        self.postMessage({
          type: "proof",
          requestId,
          proof
        });
        return;
      }
      setTimeout(tick, 0);
    };
    setTimeout(tick, 0);
  };
  self.onmessage = (e) => {
    if (e.data.type === "solve") {
      startSolve(e.data.requestId, e.data.goal, e.data.rules, e.data.maxDepth);
    } else if (e.data.type === "cancel") {
      if (currentRequestId === e.data.requestId) {
        currentRequestId = null;
      }
    }
  };
})();
