// src/model/mode.ts
var gameModes = ["random", "campaign"];

// src/utils/record.ts
var keys = (s) => Object.keys(s);
var get = (r, k) => r[k];
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
var isNonEmptyArray = (a91) => {
  return a91.length > 0;
};
var head = (arr) => arr[0];
var last = (arr) => arr.at(-1);
var init = (arr) => arr.slice(0, -1);
var zip = (a91, b) => {
  return Array.from({ length: Math.min(a91.length, b.length) }).map(
    (_, i90) => [a91.at(i90), b.at(i90)]
  );
};
var mod = (arr, index) => {
  const len = arr.length;
  return arr[(Math.floor(index) % len + len) % len];
};
var replaceItem = (arr, index, item) => {
  const before = arr.slice(0, index);
  const after = arr.slice(index + 1);
  const tmp = [...before, item, ...after];
  if (tmp.length !== arr.length) {
    return null;
  }
  return tmp;
};
var ensureNonEmpty = (arr, fallback) => isNonEmptyArray(arr) ? arr : [fallback];
var uniq2 = (arr) => {
  return [...uniq(arr)];
};
var includes = (arr, val) => arr.some((x) => x === val);

// src/utils/seq.ts
var empty = () => function* () {
};
var of = (a91) => function* () {
  yield a91;
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
  for (const t2 of first()) {
    for (const ts of sequence(rest)()) {
      yield [t2, ...ts];
    }
  }
};
var head2 = (s) => {
  const g = s();
  const { done, value } = g.next();
  if (done === true) {
    return [];
  }
  return [value];
};
var repeatIO = (io) => function* () {
  while (true) {
    yield io();
  }
};

// src/utils/number.ts
var splitAt = (x, fraction) => {
  const y = Math.floor(fraction * x);
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
  const t2 = { [x]: true };
  const f2 = { [x]: false };
  const vs = valuations(xs);
  yield* map(vs, (v2) => ({ ...v2, ...t2 }))();
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
    const a91 = antecedent();
    if (a91 === false) {
      return true;
    }
    const c = consequent();
    if (c === true) {
      return true;
    }
    if (a91 === null) {
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
var matchRaw = (p, f2) => {
  switch (p.kind) {
    case "atom":
      return f2.atom(p);
    case "falsum":
      return f2.falsum(p);
    case "verum":
      return f2.verum(p);
    case "negation":
      return f2.negation(p);
    case "implication":
      return f2.implication(p);
    case "conjunction":
      return f2.conjunction(p);
    case "disjunction":
      return f2.disjunction(p);
  }
};
var equals = (a91, b) => match(a91, {
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
  const next2 = size - 1;
  const [left4, right3] = splitAt(next2, Math.random());
  if (rand < 0.3) {
    return conjunction(random(left4)(), random(right3)());
  }
  if (rand < 0.6) {
    return disjunction(random(left4)(), random(right3)());
  }
  if (rand < 0.9) {
    return implication(random(left4)(), random(right3)());
  }
  return negation(random(next2)());
};
var pickWeighted = (choices) => {
  const total = choices.reduce((sum, c) => sum + c.weight, 0);
  if (total <= 0) return void 0;
  let rand = Math.random() * total;
  for (const c of choices) {
    rand -= c.weight;
    if (rand < 0) return c.value;
  }
  const last3 = choices[choices.length - 1];
  return last3?.value;
};
var randomWeighted = (size, connectives2, symbols) => () => {
  if (size < 1) {
    const leaf = pickWeighted([
      { weight: symbols.p, value: atom("p") },
      { weight: symbols.q, value: atom("q") },
      { weight: symbols.r, value: atom("r") },
      { weight: symbols.s, value: atom("s") },
      { weight: symbols.u, value: atom("u") },
      { weight: symbols.v, value: atom("v") },
      { weight: symbols.falsum, value: falsum },
      { weight: symbols.verum, value: verum }
    ]);
    return leaf ?? atom("p");
  }
  const next2 = size - 1;
  const [left4, right3] = splitAt(next2, Math.random());
  const branch = pickWeighted([
    {
      weight: connectives2.conjunction,
      value: () => conjunction(
        randomWeighted(left4, connectives2, symbols)(),
        randomWeighted(right3, connectives2, symbols)()
      )
    },
    {
      weight: connectives2.disjunction,
      value: () => disjunction(
        randomWeighted(left4, connectives2, symbols)(),
        randomWeighted(right3, connectives2, symbols)()
      )
    },
    {
      weight: connectives2.implication,
      value: () => implication(
        randomWeighted(left4, connectives2, symbols)(),
        randomWeighted(right3, connectives2, symbols)()
      )
    },
    {
      weight: connectives2.negation,
      value: () => negation(randomWeighted(next2, connectives2, symbols)())
    }
  ]);
  return branch ? branch() : atom("p");
};

// src/utils/tuple.ts
var head3 = (a91) => {
  const [h] = a91;
  return h;
};
var tail = (a91) => {
  const [_h, ...t2] = a91;
  return t2;
};
var init2 = (a91) => {
  return a91.slice(0, -1);
};
var last2 = (a91) => {
  return a91[a91.length - 1];
};
var isTupleOf0 = (arr) => arr.length === 0;
var isTupleOf1 = (arr) => arr.length === 1;

// src/model/formulas.ts
var equals2 = (fa, fb) => {
  return fa.length === fb.length && zip(fa, fb).every(([a91, b]) => equals(a91, b));
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
  return isActiveL(j) && r(last2(j.antecedent));
};
var isActiveR = (j) => {
  return isNonEmptyArray(j.succedent);
};
var refineActiveR = (r) => (j) => {
  return isActiveR(j) && r(head3(j.succedent));
};
var conclusion = (proposition) => sequent([], [proposition]);
var isConclusion = (j) => {
  return j.antecedent.length === 0 && j.succedent.length === 1;
};
var equals3 = (a91, b) => {
  return equals2(a91.antecedent, b.antecedent) && equals2(a91.succedent, b.succedent);
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
var isEquivalent = (a91, b) => equals3(a91.result, b.result);
var replaceDep = (parent, index, d) => {
  const deps = replaceItem(parent.deps, index, d);
  if (!deps) {
    return null;
  }
  if (!zip(parent.deps, deps).every(([a91, b]) => isEquivalent(a91, b))) {
    return null;
  }
  return { ...parent, deps };
};
var editPremise = (root, path, edit) => {
  if (isNonEmptyArray(path)) {
    return null;
  }
  return edit(root);
};
var editTransformation = (root, path, edit) => {
  if (isNonEmptyArray(path)) {
    const [index, ...rest] = path;
    const dep = root.deps[index];
    if (!dep) {
      return null;
    }
    const update = editDerivation(dep, rest, edit);
    if (!update) {
      return null;
    }
    return replaceDep(root, index, update);
  }
  return edit(root);
};
var editDerivation = (root, path, edit) => {
  if (!root) {
    return null;
  }
  switch (root.kind) {
    case "premise":
      return editPremise(root, path, edit);
    case "transformation":
      return editTransformation(root, path, edit);
  }
};
var subDerivationPremise = (root, path) => {
  if (isNonEmptyArray(path)) {
    return null;
  }
  return root;
};
var subDerivationTransformation = (root, path) => {
  if (isNonEmptyArray(path)) {
    const [index, ...rest] = path;
    const dep = root.deps[index];
    if (!dep) {
      return null;
    }
    return subDerivation(dep, rest);
  }
  return root;
};
var subDerivation = (root, path) => {
  if (!root) {
    return null;
  }
  switch (root.kind) {
    case "premise":
      return subDerivationPremise(root, path);
    case "transformation":
      return subDerivationTransformation(root, path);
  }
};
var branchesPremise = (_d, path) => {
  return [path];
};
var branchesTransformation = (d, path) => {
  const paths = d.deps.flatMap((dep, i90) => branches(dep, [...path, i90]));
  if (isNonEmptyArray(paths)) {
    return paths;
  }
  return [path];
};
var branches = (root, path = []) => {
  switch (root.kind) {
    case "premise":
      return branchesPremise(root, path);
    case "transformation":
      return branchesTransformation(root, path);
  }
};
var openBranchesPremise = (_d, path) => {
  return [path];
};
var openBranchesTransformation = (d, path) => {
  const paths = d.deps.flatMap((dep, i90) => openBranches(dep, [...path, i90]));
  if (isNonEmptyArray(paths)) {
    return paths;
  }
  return [];
};
var openBranches = (root, path = []) => {
  switch (root.kind) {
    case "premise":
      return openBranchesPremise(root, path);
    case "transformation":
      return openBranchesTransformation(root, path);
  }
};
var isProof = (d) => {
  return openBranches(d).length < 1;
};

// src/model/template.ts
var Variable = (name4) => ({ kind: "var", name: name4 });
var Implication = (antecedent, consequent) => ({
  kind: "implication",
  antecedent,
  consequent
});
var Negation = (negand) => ({
  kind: "negation",
  negand
});
var match2 = (t2) => {
  const check = (p, t3, bindings) => {
    switch (t3.kind) {
      case "var": {
        const bound = bindings.get(t3.name);
        if (bound !== void 0) return equals(bound, p);
        bindings.set(t3.name, p);
        return true;
      }
      case "implication":
        return p.kind === "implication" && check(p.antecedent, t3.antecedent, bindings) && check(p.consequent, t3.consequent, bindings);
      case "negation":
        return p.kind === "negation" && check(p.negand, t3.negand, bindings);
    }
  };
  return (p) => check(p, t2, /* @__PURE__ */ new Map());
};

// src/rules/a1.ts
var P = Variable("P");
var Q = Variable("Q");
var Axiom1 = Implication(P, Implication(Q, P));
var isAxiom1 = match2(Axiom1);
var isA1Result = (s) => {
  return isConclusion(s) && isAxiom1(s.succedent[0]);
};
var isA1ResultDerivation = refineDerivation(isA1Result);
var a1 = (result) => {
  return introduction(result, "a1");
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
  connectives: ["implication"],
  isResult: isA1Result,
  isResultDerivation: isA1ResultDerivation,
  make: a1,
  apply: applyA1,
  reverse: reverseA1,
  tryReverse: tryReverseA1,
  example: exampleA1
};

// src/rules/a2.ts
var P2 = Variable("P");
var Q2 = Variable("Q");
var R = Variable("R");
var Axiom2 = Implication(
  Implication(P2, Implication(Q2, R)),
  Implication(Implication(P2, Q2), Implication(P2, R))
);
var isAxiom2 = match2(Axiom2);
var isA2Result = (s) => {
  return isConclusion(s) && isAxiom2(s.succedent[0]);
};
var isA2ResultDerivation = refineDerivation(isA2Result);
var a2 = (result) => {
  return introduction(result, "a2");
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
  connectives: ["implication"],
  isResult: isA2Result,
  isResultDerivation: isA2ResultDerivation,
  make: a2,
  apply: applyA2,
  reverse: reverseA2,
  tryReverse: tryReverseA2,
  example: exampleA2
};

// src/rules/a3.ts
var P3 = Variable("P");
var Q3 = Variable("Q");
var Axiom3 = Implication(
  Implication(Negation(P3), Negation(Q3)),
  Implication(Q3, P3)
);
var isAxiom3 = match2(Axiom3);
var isA3Result = (s) => {
  return isConclusion(s) && isAxiom3(s.succedent[0]);
};
var isA3ResultDerivation = refineDerivation(isA3Result);
var a3 = (result) => {
  return introduction(result, "a3");
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
  connectives: ["implication", "negation"],
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
  const \u03B3 = init2(init2(dep.result.antecedent));
  const a91 = last2(init2(dep.result.antecedent));
  const b = last2(dep.result.antecedent);
  const \u03B4 = dep.result.succedent;
  return cl(sequent([...\u03B3, conjunction(a91, b)], \u03B4), deps);
};
var reverseCL = (p) => {
  const \u03B3 = init2(p.result.antecedent);
  const acb = last2(p.result.antecedent);
  const a91 = acb.leftConjunct;
  const b = acb.rightConjunct;
  const \u03B4 = p.result.succedent;
  return cl(p.result, [premise(sequent([...\u03B3, a91, b], \u03B4))]);
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

// src/rules/cl1.ts
var isCL1Result = refineActiveL(isConjunction);
var isCL1ResultDerivation = refineDerivation(isCL1Result);
var cl1 = (result, deps) => {
  return transformation(result, deps, "cl1");
};
var applyCL1 = (b, ...deps) => {
  const [dep] = deps;
  const \u03B3 = init2(dep.result.antecedent);
  const a91 = last2(dep.result.antecedent);
  const \u03B4 = dep.result.succedent;
  return cl1(sequent([...\u03B3, conjunction(a91, b)], \u03B4), deps);
};
var reverseCL1 = (p) => {
  const \u03B3 = init2(p.result.antecedent);
  const acb = last2(p.result.antecedent);
  const a91 = acb.leftConjunct;
  const \u03B4 = p.result.succedent;
  return cl1(p.result, [premise(sequent([...\u03B3, a91], \u03B4))]);
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
  connectives: ["conjunction"],
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
var applyCL2 = (a91, ...deps) => {
  const [dep] = deps;
  const \u03B3 = init2(dep.result.antecedent);
  const b = last2(dep.result.antecedent);
  const \u03B4 = dep.result.succedent;
  return cl2(sequent([...\u03B3, conjunction(a91, b)], \u03B4), deps);
};
var reverseCL2 = (p) => {
  const \u03B3 = init2(p.result.antecedent);
  const acb = last2(p.result.antecedent);
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
  connectives: ["conjunction"],
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
  const a91 = head3(dep1.result.succedent);
  const b = head3(dep2.result.succedent);
  const \u03B4 = tail(dep1.result.succedent);
  return cr(sequent(\u03B3, [conjunction(a91, b), ...\u03B4]), deps);
};
var reverseCR = (p) => {
  const \u03B3 = p.result.antecedent;
  const acb = head3(p.result.succedent);
  const a91 = acb.leftConjunct;
  const b = acb.rightConjunct;
  const \u03B4 = tail(p.result.succedent);
  return cr(p.result, [
    premise(sequent(\u03B3, [a91, ...\u03B4])),
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
  const \u03B4 = init2(dep1.result.succedent);
  return cut(sequent(\u03B3, \u03B4), deps);
};
var reverseCut = (p, a91) => {
  const \u03B3 = p.result.antecedent;
  const \u03B4 = p.result.succedent;
  return cut(p.result, [
    premise(sequent(\u03B3, [...\u03B4, a91])),
    premise(sequent([a91, ...\u03B3], \u03B4))
  ]);
};
var tryReverseCut = (a91) => (d) => {
  return isCutResultDerivation(d) ? reverseCut(d, a91) : null;
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
  const \u03B3 = init2(dep1.result.antecedent);
  const a91 = last2(dep1.result.antecedent);
  const b = last2(dep2.result.antecedent);
  const \u03B4 = dep1.result.succedent;
  return dl(sequent([...\u03B3, disjunction(a91, b)], \u03B4), deps);
};
var reverseDL = (p) => {
  const \u03B3 = init2(p.result.antecedent);
  const adb = last2(p.result.antecedent);
  const a91 = adb.leftDisjunct;
  const b = adb.rightDisjunct;
  const \u03B4 = p.result.succedent;
  return dl(p.result, [
    premise(sequent([...\u03B3, a91], \u03B4)),
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

// src/rules/fcr.ts
var isFCRResult = (s) => {
  const first = s.succedent.at(0);
  return first !== void 0 && isConjunction(first);
};
var isFCRResultDerivation = refineDerivation(isFCRResult);
var fcr = (result, deps) => {
  return transformation(result, deps, "fcr");
};
var applyFCR = (...deps) => {
  const [dep1, dep2] = deps;
  const \u03B3 = dep1.result.antecedent;
  const \u03C2 = dep2.result.antecedent;
  const a91 = head3(dep1.result.succedent);
  const b = head3(dep2.result.succedent);
  const \u03B4 = tail(dep1.result.succedent);
  const \u03C0 = tail(dep2.result.succedent);
  return fcr(sequent([...\u03B3, ...\u03C2], [conjunction(a91, b), ...\u03B4, ...\u03C0]), deps);
};
var reverseFCR = (p, splitAnt, splitSuc) => {
  const acb = head3(p.result.succedent);
  const rest = tail(p.result.succedent);
  const [\u03B3, \u03C2] = splitAnt(p.result.antecedent);
  const a91 = acb.leftConjunct;
  const b = acb.rightConjunct;
  const [\u03B4, \u03C0] = splitSuc(rest);
  return fcr(p.result, [
    premise(sequent(\u03B3, [a91, ...\u03B4])),
    premise(sequent(\u03C2, [b, ...\u03C0]))
  ]);
};
var tryReverseFCR = (splitAnt, splitSuc) => (d) => {
  if (!isFCRResultDerivation(d)) return null;
  return reverseFCR(d, splitAnt, splitSuc);
};
var exampleFCR = applyFCR(
  premise(sequent([atom("\u0393")], [atom("A"), atom("\u0394")])),
  premise(sequent([atom("\u03A3")], [atom("B"), atom("\u03A0")]))
);
var ruleFCR = {
  id: "fcr",
  connectives: ["conjunction"],
  isResult: isFCRResult,
  isResultDerivation: isFCRResultDerivation,
  make: fcr,
  apply: applyFCR,
  reverse: reverseFCR,
  tryReverse: tryReverseFCR,
  example: exampleFCR
};

// src/rules/fcut.ts
var isFCutResult = (s) => {
  return true;
};
var isFCutResultDerivation = refineDerivation(isFCutResult);
var fcut = (result, deps) => {
  return transformation(result, deps, "fcut");
};
var applyFCut = (...deps) => {
  const [dep1, dep2] = deps;
  const \u03B3 = dep1.result.antecedent;
  const \u03B4 = init2(dep1.result.succedent);
  const \u03C2 = tail(dep2.result.antecedent);
  const \u03C0 = dep2.result.succedent;
  return fcut(sequent([...\u03B3, ...\u03C2], [...\u03B4, ...\u03C0]), deps);
};
var reverseFCut = (p, a91, splitAnt, splitSuc) => {
  const [\u03B3, \u03C2] = splitAnt(p.result.antecedent);
  const [\u03B4, \u03C0] = splitSuc(p.result.succedent);
  return fcut(p.result, [
    premise(sequent(\u03B3, [...\u03B4, a91])),
    premise(sequent([a91, ...\u03C2], \u03C0))
  ]);
};
var tryReverseFCut = (a91) => (d) => {
  if (!isFCutResultDerivation(d)) return null;
  const antLen = d.result.antecedent.length;
  const sucLen = d.result.succedent.length;
  return reverseFCut(
    d,
    a91,
    (arr) => [arr.slice(0, antLen), arr.slice(antLen)],
    (arr) => [arr.slice(0, sucLen), arr.slice(sucLen)]
  );
};
var exampleFCut = applyFCut(
  premise(sequent([atom("\u0393")], [atom("\u0394"), atom("A")])),
  premise(sequent([atom("A"), atom("\u03A3")], [atom("\u03A0")]))
);
var ruleFCut = {
  id: "fcut",
  connectives: [],
  isResult: isFCutResult,
  isResultDerivation: isFCutResultDerivation,
  make: fcut,
  apply: applyFCut,
  reverse: reverseFCut,
  tryReverse: tryReverseFCut,
  example: exampleFCut
};

// src/rules/fdl.ts
var isFDLResult = (s) => {
  const last3 = s.antecedent.at(-1);
  return last3 !== void 0 && isDisjunction(last3);
};
var isFDLResultDerivation = refineDerivation(isFDLResult);
var fdl = (result, deps) => {
  return transformation(result, deps, "fdl");
};
var applyFDL = (...deps) => {
  const [dep1, dep2] = deps;
  const \u03B3 = init2(dep1.result.antecedent);
  const \u03C2 = init2(dep2.result.antecedent);
  const a91 = last2(dep1.result.antecedent);
  const b = last2(dep2.result.antecedent);
  const \u03B4 = dep1.result.succedent;
  const \u03C0 = dep2.result.succedent;
  return fdl(sequent([...\u03B3, ...\u03C2, disjunction(a91, b)], [...\u03B4, ...\u03C0]), deps);
};
var reverseFDL = (p, splitAnt, splitSuc) => {
  const adb = last2(p.result.antecedent);
  const rest = init2(p.result.antecedent);
  const [\u03B3, \u03C2] = splitAnt(rest);
  const a91 = adb.leftDisjunct;
  const b = adb.rightDisjunct;
  const [\u03B4, \u03C0] = splitSuc(p.result.succedent);
  return fdl(p.result, [
    premise(sequent([...\u03B3, a91], \u03B4)),
    premise(sequent([...\u03C2, b], \u03C0))
  ]);
};
var tryReverseFDL = (splitAnt, splitSuc) => (d) => {
  if (!isFDLResultDerivation(d)) return null;
  return reverseFDL(d, splitAnt, splitSuc);
};
var exampleFDL = applyFDL(
  premise(sequent([atom("\u0393"), atom("A")], [atom("\u0394")])),
  premise(sequent([atom("\u03A3"), atom("B")], [atom("\u03A0")]))
);
var ruleFDL = {
  id: "fdl",
  connectives: ["disjunction"],
  isResult: isFDLResult,
  isResultDerivation: isFDLResultDerivation,
  make: fdl,
  apply: applyFDL,
  reverse: reverseFDL,
  tryReverse: tryReverseFDL,
  example: exampleFDL
};

// src/rules/fil.ts
var isFILResult = (s) => {
  const last3 = s.antecedent.at(-1);
  return last3 !== void 0 && isImplication(last3);
};
var isFILResultDerivation = refineDerivation(isFILResult);
var fil = (result, deps) => {
  return transformation(result, deps, "fil");
};
var applyFIL = (...deps) => {
  const [dep1, dep2] = deps;
  const \u03B3 = dep1.result.antecedent;
  const \u03C2 = init2(dep2.result.antecedent);
  const a91 = head3(dep1.result.succedent);
  const b = last2(dep2.result.antecedent);
  const \u03B4 = tail(dep1.result.succedent);
  const \u03C0 = dep2.result.succedent;
  return fil(sequent([...\u03B3, ...\u03C2, implication(a91, b)], [...\u03B4, ...\u03C0]), deps);
};
var reverseFIL = (p, splitAnt, splitSuc) => {
  const aib = last2(p.result.antecedent);
  const rest = init2(p.result.antecedent);
  const [\u03B3, \u03C2] = splitAnt(rest);
  const a91 = aib.antecedent;
  const b = aib.consequent;
  const [\u03B4, \u03C0] = splitSuc(p.result.succedent);
  return fil(p.result, [
    premise(sequent(\u03B3, [a91, ...\u03B4])),
    premise(sequent([...\u03C2, b], \u03C0))
  ]);
};
var tryReverseFIL = (splitAnt, splitSuc) => (d) => {
  if (!isFILResultDerivation(d)) return null;
  return reverseFIL(d, splitAnt, splitSuc);
};
var exampleFIL = applyFIL(
  premise(sequent([atom("\u0393")], [atom("A"), atom("\u0394")])),
  premise(sequent([atom("\u03A3"), atom("B")], [atom("\u03A0")]))
);
var ruleFIL = {
  id: "fil",
  connectives: ["implication"],
  isResult: isFILResult,
  isResultDerivation: isFILResultDerivation,
  make: fil,
  apply: applyFIL,
  reverse: reverseFIL,
  tryReverse: tryReverseFIL,
  example: exampleFIL
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
  const a91 = head3(dep.result.succedent);
  const b = head3(tail(dep.result.succedent));
  const \u03B4 = tail(tail(dep.result.succedent));
  return dr(sequent(\u03B3, [disjunction(a91, b), ...\u03B4]), deps);
};
var reverseDR = (p) => {
  const \u03B3 = p.result.antecedent;
  const adb = head3(p.result.succedent);
  const a91 = adb.leftDisjunct;
  const b = adb.rightDisjunct;
  const \u03B4 = tail(p.result.succedent);
  return dr(p.result, [premise(sequent(\u03B3, [a91, b, ...\u03B4]))]);
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
  const a91 = head3(dep.result.succedent);
  return dr1(sequent(\u03B3, [disjunction(a91, b), ...\u03B4]), deps);
};
var reverseDR1 = (p) => {
  const \u03B3 = p.result.antecedent;
  const adb = head3(p.result.succedent);
  const a91 = adb.leftDisjunct;
  const \u03B4 = tail(p.result.succedent);
  return dr1(p.result, [premise(sequent(\u03B3, [a91, ...\u03B4]))]);
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
  connectives: ["disjunction"],
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
var applyDR2 = (a91, ...deps) => {
  const [dep] = deps;
  const \u03B3 = dep.result.antecedent;
  const \u03B4 = tail(dep.result.succedent);
  const b = head3(dep.result.succedent);
  return dr2(sequent(\u03B3, [disjunction(a91, b), ...\u03B4]), deps);
};
var reverseDR2 = (p) => {
  const \u03B3 = p.result.antecedent;
  const adb = head3(p.result.succedent);
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
  connectives: ["disjunction"],
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
var applyI = (a91) => i(sequent([a91], [a91]));
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
  const a91 = head3(dep1.result.succedent);
  const b = last2(dep2.result.antecedent);
  const \u03B4 = tail(dep1.result.succedent);
  return il(sequent([...\u03B3, implication(a91, b)], \u03B4), deps);
};
var reverseIL = (p) => {
  const \u03B3 = init2(p.result.antecedent);
  const aib = last2(p.result.antecedent);
  const a91 = aib.antecedent;
  const b = aib.consequent;
  const \u03B4 = p.result.succedent;
  return il(p.result, [
    premise(sequent(\u03B3, [a91, ...\u03B4])),
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
  const \u03B3 = init2(dep.result.antecedent);
  const a91 = last2(dep.result.antecedent);
  const b = head3(dep.result.succedent);
  const \u03B4 = tail(dep.result.succedent);
  return ir(sequent(\u03B3, [implication(a91, b), ...\u03B4]), deps);
};
var reverseIR = (p) => {
  const \u03B3 = p.result.antecedent;
  const aib = head3(p.result.succedent);
  const a91 = aib.antecedent;
  const b = aib.consequent;
  const \u03B4 = tail(p.result.succedent);
  return ir(p.result, [premise(sequent([...\u03B3, a91], [b, ...\u03B4]))]);
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

// src/utils/utils.ts
var assertEqual = (a91, b) => {
  if (JSON.stringify(a91) === JSON.stringify(b)) {
    return a91;
  }
  return assertNever(b);
};
var isNonNullable = (value) => value != null;
function assertNever(_n, s = "Unexpected value") {
  throw new Error(s);
}

// src/rules/mp.ts
var isMPResult = (j) => isConclusion(j);
var isMPResultDerivation = refineDerivation(isMPResult);
var mp = (result, deps) => transformation(result, deps, "mp");
var applyMP = (...deps) => {
  const [dep1, dep2] = deps;
  const a110 = dep1.result.succedent[0].antecedent;
  const a210 = dep2.result.succedent[0];
  const _a = assertEqual(a110, a210);
  const c = dep1.result.succedent[0].consequent;
  return transformation(conclusion(c), deps, "mp");
};
var reverseMP = (d, p) => {
  const q = head3(d.result.succedent);
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
  connectives: [],
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
  const a91 = head3(dep.result.succedent);
  const \u03B4 = tail(dep.result.succedent);
  return nl(sequent([...\u03B3, negation(a91)], \u03B4), deps);
};
var reverseNL = (p) => {
  const \u03B3 = init2(p.result.antecedent);
  const na = last2(p.result.antecedent);
  const a91 = na.negand;
  const \u03B4 = p.result.succedent;
  return nl(p.result, [premise(sequent(\u03B3, [a91, ...\u03B4]))]);
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
  const \u03B3 = init2(dep.result.antecedent);
  const a91 = last2(dep.result.antecedent);
  const \u03B4 = dep.result.succedent;
  return nr(sequent(\u03B3, [negation(a91), ...\u03B4]), deps);
};
var reverseNR = (p) => {
  const \u03B3 = p.result.antecedent;
  const na = head3(p.result.succedent);
  const a91 = na.negand;
  const \u03B4 = tail(p.result.succedent);
  return nr(p.result, [premise(sequent([...\u03B3, a91], \u03B4))]);
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
  const \u03B3 = init2(init2(dep.result.antecedent));
  const a91 = last2(dep.result.antecedent);
  const \u03B4 = dep.result.succedent;
  return scl(sequent([...\u03B3, a91], \u03B4), deps);
};
var reverseSCL = (p) => {
  const \u03B3 = init2(p.result.antecedent);
  const a91 = last2(p.result.antecedent);
  const \u03B4 = p.result.succedent;
  return scl(p.result, [premise(sequent([...\u03B3, a91, a91], \u03B4))]);
};
var tryReverseSCL = (d) => {
  return isSCLResultDerivation(d) ? reverseSCL(d) : null;
};
var exampleSCL = applySCL(
  premise(sequent([atom("\u0393"), atom("A"), atom("A")], [atom("\u0394")]))
);
var ruleSCL = {
  id: "scl",
  connectives: [],
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
  const a91 = head3(dep.result.succedent);
  const \u03B4 = tail(tail(dep.result.succedent));
  return scr(sequent(\u03B3, [a91, ...\u03B4]), deps);
};
var reverseSCR = (p) => {
  const \u03B3 = p.result.antecedent;
  const a91 = head3(p.result.succedent);
  const \u03B4 = tail(p.result.succedent);
  return scr(p.result, [premise(sequent(\u03B3, [a91, a91, ...\u03B4]))]);
};
var tryReverseSCR = (d) => {
  return isSCRResultDerivation(d) ? reverseSCR(d) : null;
};
var exampleSCR = applySCR(
  premise(sequent([atom("\u0393")], [atom("A"), atom("A"), atom("\u0394")]))
);
var ruleSCR = {
  id: "scr",
  connectives: [],
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
  const a91 = head3(dep.result.antecedent);
  const \u03B3 = init2(tail(dep.result.antecedent));
  const b = last2(dep.result.antecedent);
  const \u03B4 = dep.result.succedent;
  return sRotLB(sequent([...\u03B3, b, a91], \u03B4), deps);
};
var reverseSRotLB = (p) => {
  const \u03B3 = init2(init2(p.result.antecedent));
  const a91 = last2(p.result.antecedent);
  const b = last2(init2(p.result.antecedent));
  const \u03B4 = p.result.succedent;
  return sRotLB(p.result, [premise(sequent([a91, ...\u03B3, b], \u03B4))]);
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
  const \u03B3 = init2(init2(dep.result.antecedent));
  const a91 = last2(dep.result.antecedent);
  const b = last2(init2(dep.result.antecedent));
  const \u03B4 = dep.result.succedent;
  return sRotLF(sequent([a91, ...\u03B3, b], \u03B4), deps);
};
var reverseSRotLF = (p) => {
  const \u03B3 = init2(tail(p.result.antecedent));
  const a91 = head3(p.result.antecedent);
  const b = last2(p.result.antecedent);
  const \u03B4 = p.result.succedent;
  return sRotLF(p.result, [premise(sequent([...\u03B3, b, a91], \u03B4))]);
};
var tryReverseSRotLF = (d) => {
  return isSRotLFResultDerivation(d) ? reverseSRotLF(d) : null;
};
var exampleSRotLF = applySRotLF(
  premise(sequent([atom("\u0393"), atom("B"), atom("A")], [atom("\u0394")]))
);
var ruleSRotLF = {
  id: "sRotLF",
  connectives: [],
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
  const \u03B4 = init2(tail(dep.result.succedent));
  const a91 = last2(dep.result.succedent);
  const b = head3(dep.result.succedent);
  return sRotRB(sequent(\u03B3, [a91, b, ...\u03B4]), deps);
};
var reverseSRotRB = (p) => {
  const \u03B3 = p.result.antecedent;
  const \u03B4 = tail(tail(p.result.succedent));
  const a91 = head3(p.result.succedent);
  const b = head3(tail(p.result.succedent));
  return sRotRB(p.result, [premise(sequent(\u03B3, [b, ...\u03B4, a91]))]);
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
  const a91 = head3(dep.result.succedent);
  const b = head3(tail(dep.result.succedent));
  return sRotRF(sequent(\u03B3, [b, ...\u03B4, a91]), deps);
};
var reverseSRotRF = (p) => {
  const \u03B3 = p.result.antecedent;
  const \u03B4 = init2(tail(p.result.succedent));
  const a91 = last2(p.result.succedent);
  const b = head3(p.result.succedent);
  return sRotRF(p.result, [premise(sequent(\u03B3, [a91, b, ...\u03B4]))]);
};
var tryReverseSRotRF = (d) => {
  return isSRotRFResultDerivation(d) ? reverseSRotRF(d) : null;
};
var exampleSRotRF = applySRotRF(
  premise(sequent([atom("\u0393")], [atom("A"), atom("B"), atom("\u0394")]))
);
var ruleSRotRF = {
  id: "sRotRF",
  connectives: [],
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
var applySWL = (a91, ...deps) => {
  const [dep] = deps;
  const \u03B3 = dep.result.antecedent;
  const \u03B4 = dep.result.succedent;
  return swl(sequent([...\u03B3, a91], \u03B4), deps);
};
var reverseSWL = (p) => {
  const \u03B3 = init2(p.result.antecedent);
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
var applySWR = (a91, ...deps) => {
  const [dep] = deps;
  const \u03B3 = dep.result.antecedent;
  const \u03B4 = dep.result.succedent;
  return swr(sequent(\u03B3, [a91, ...\u03B4]), deps);
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
  const \u03B3 = init2(init2(dep.result.antecedent));
  const b = last2(dep.result.antecedent);
  const a91 = last2(init2(dep.result.antecedent));
  const \u03B4 = dep.result.succedent;
  return sxl(sequent([...\u03B3, b, a91], \u03B4), deps);
};
var reverseSXL = (p) => {
  const \u03B3 = init2(init2(p.result.antecedent));
  const a91 = last2(p.result.antecedent);
  const b = last2(init2(p.result.antecedent));
  const \u03B4 = p.result.succedent;
  return sxl(p.result, [premise(sequent([...\u03B3, a91, b], \u03B4))]);
};
var tryReverseSXL = (d) => {
  return isSXLResultDerivation(d) ? reverseSXL(d) : null;
};
var exampleSXL = applySXL(
  premise(sequent([atom("\u0393"), atom("A"), atom("B")], [atom("\u0394")]))
);
var ruleSXL = {
  id: "sxl",
  connectives: [],
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
  const b = head3(tail(dep.result.succedent));
  const a91 = head3(dep.result.succedent);
  const \u03B4 = tail(tail(dep.result.succedent));
  return sxr(sequent(\u03B3, [b, a91, ...\u03B4]), deps);
};
var reverseSXR = (p) => {
  const \u03B3 = p.result.antecedent;
  const a91 = head3(tail(p.result.succedent));
  const b = head3(p.result.succedent);
  const \u03B4 = tail(tail(p.result.succedent));
  return sxr(p.result, [premise(sequent(\u03B3, [a91, b, ...\u03B4]))]);
};
var tryReverseSXR = (d) => {
  return isSXRResultDerivation(d) ? reverseSXR(d) : null;
};
var exampleSXR = applySXR(
  premise(sequent([atom("\u0393")], [atom("A"), atom("B"), atom("\u0394")]))
);
var ruleSXR = {
  id: "sxr",
  connectives: [],
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
var rules = {
  a1: ruleA1,
  a2: ruleA2,
  a3: ruleA3,
  cl1: ruleCL1,
  cl2: ruleCL2,
  cl: ruleCL,
  cr: ruleCR,
  cut: ruleCut,
  dl: ruleDL,
  fcr: ruleFCR,
  fcut: ruleFCut,
  fdl: ruleFDL,
  fil: ruleFIL,
  dr1: ruleDR1,
  dr2: ruleDR2,
  dr: ruleDR,
  f: ruleF,
  i: ruleI,
  il: ruleIL,
  ir: ruleIR,
  mp: ruleMP,
  nl: ruleNL,
  nr: ruleNR,
  sRotLB: ruleSRotLB,
  sRotLF: ruleSRotLF,
  sRotRB: ruleSRotRB,
  sRotRF: ruleSRotRF,
  scl: ruleSCL,
  scr: ruleSCR,
  swl: ruleSWL,
  swr: ruleSWR,
  sxl: ruleSXL,
  sxr: ruleSXR,
  v: ruleV
};
var applicableRules = (j) => entries(rules).flatMap(([k, v2]) => v2.isResult(j) ? [k] : []);
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
var isReverseId0 = (s) => s in reverse0;
var reverse1 = {
  cut: ruleCut,
  fcut: ruleFCut,
  mp: ruleMP
};
var isReverseId1 = (s) => s in reverse1;
var reverseSplit2 = {
  fcr: ruleFCR,
  fdl: ruleFDL,
  fil: ruleFIL
};
var _reverse = {
  ...reverse0,
  ...reverse1,
  ...reverseSplit2
};
var center = {
  a1: ruleA1,
  a2: ruleA2,
  a3: ruleA3,
  f: ruleF,
  cut: ruleCut,
  fcut: ruleFCut,
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
  fdl: ruleFDL,
  il: ruleIL,
  fil: ruleFIL
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
  fcr: ruleFCR,
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
var ruleCategory = {
  a1: "axiom",
  a2: "axiom",
  a3: "axiom",
  f: "axiom",
  i: "axiom",
  v: "axiom",
  scl: "structural",
  swl: "structural",
  sRotLB: "structural",
  sRotLF: "structural",
  sxl: "structural",
  scr: "structural",
  swr: "structural",
  sRotRB: "structural",
  sRotRF: "structural",
  sxr: "structural",
  nl: "logical",
  cl: "logical",
  cl1: "logical",
  cl2: "logical",
  dl: "logical",
  il: "logical",
  nr: "logical",
  dr: "logical",
  dr1: "logical",
  dr2: "logical",
  cr: "logical",
  ir: "logical",
  cut: "meta",
  fcut: "meta",
  mp: "meta",
  fcr: "meta",
  fdl: "meta",
  fil: "meta"
};

// src/utils/string.ts
var split = (s, c) => ensureNonEmpty(s.split(c), s);

// src/interactive/event.ts
var reverse02 = (rev) => ({
  kind: "reverse0",
  rev
});
var undo = () => ({ kind: "undo" });
var reset = () => ({ kind: "reset" });
var nextBranch = () => ({ kind: "nextBranch" });
var prevBranch = () => ({ kind: "prevBranch" });
var parseEvent = (str) => {
  switch (str) {
    case "undo":
      return undo();
    case "reset":
      return reset();
  }
  if (isReverseId0(str)) {
    return reverse02(str);
  }
  const [cmd2, ...args] = split(str, " ");
  if (isReverseId1(cmd2)) {
    console.error("TBD, parse:" + JSON.stringify(args));
  }
  return null;
};

// src/render/block.ts
var space = " ";
function split2(s, d) {
  const parts = s.split(d);
  if (isNonEmptyArray(parts)) {
    return parts;
  }
  return [s];
}
function align(a91, b) {
  const last3 = lastLine(a91);
  if (last3.trim().length < 1) {
    return null;
  }
  const [first, ...rest] = split2(b, "\n");
  if (first.trim() !== last3.trim()) {
    return null;
  }
  const topLeft = Math.abs(last3.trimStart().length - last3.length);
  const topRight = Math.abs(last3.trimEnd().length - last3.length);
  const bottomLeft = Math.abs(first.trimStart().length - first.length);
  const bottomRight = Math.abs(first.trimEnd().length - first.length);
  const top = margin(
    Math.max(0, bottomLeft - topLeft),
    Math.max(0, bottomRight - topRight)
  )(a91);
  const bot = margin(
    Math.max(0, topLeft - bottomLeft),
    Math.max(0, topRight - bottomRight)
  )(rest.join("\n"));
  return [...top.split("\n"), ...bot.split("\n")].join("\n");
}
function margin(left4, right3 = 0, space2 = " ") {
  return (str) => {
    return str.split("\n").map((line2) => space2.repeat(left4) + line2 + space2.repeat(right3)).join("\n");
  };
}
function width(str) {
  return Math.max(...str.split("\n").map((line2) => line2.length));
}
function left2(wide) {
  return (str) => {
    const length = width(str);
    const rightMargin = Math.max(0, wide - length);
    return margin(0, rightMargin, " ")(str);
  };
}
function concat(str1, str2) {
  const lines1 = str1.split("\n").reverse();
  const width1 = width(str1);
  const lines2 = str2.split("\n").reverse();
  const width2 = width(str2);
  const count = Math.max(lines1.length, lines2.length);
  return "x".repeat(count).split(String()).map(
    (_, i90) => left2(width1)(lines1[i90] ?? String()) + left2(width2)(lines2[i90] ?? String())
  ).reverse().join("\n");
}
function center2(wide) {
  return (str) => {
    const length = width(str);
    const leftMargin = Math.max(0, Math.floor((wide - length) / 2));
    const rightMargin = Math.max(0, wide - length - leftMargin);
    return margin(leftMargin, rightMargin, " ")(str);
  };
}
function line(width2) {
  return "\u2015".repeat(width2);
}
function pad(str) {
  const length = width(str);
  const lines = str.split("\n");
  return lines.map((line2) => line2.padEnd(length, space)).join("\n");
}
function spaced(blocks, n = 1) {
  const [first, ...rest] = blocks;
  if (typeof first !== "string") {
    return "";
  }
  return rest.map(margin(n, 0)).reduce(concat, first);
}
var br = String();
function leftify(...lines) {
  return lines.join("\n");
}
function tree(root, branches2, note, lineWidth) {
  const line1 = center2(lineWidth)(spaced(branches2, 2));
  const last3 = center2(lineWidth)(lastLine(line1).trim());
  const line2 = note !== null ? spaced([line(lineWidth), note]) : line(lineWidth);
  const line3 = center2(lineWidth)(root);
  const aligned = align(line1, pad(leftify(last3, line2, line3)));
  if (aligned != null) {
    return aligned;
  }
  return pad(leftify(line1, line2, line3));
}
function lastLine(block) {
  const [first, ...rest] = split2(block, "\n");
  return rest.at(-1) ?? first;
}
function treeAuto(root, branches2, note) {
  const branchBlock = spaced(branches2, 2);
  const contentWidth = Math.max(
    lastLine(branchBlock).trim().length + 2,
    width(root) + 2
  );
  return tree(root, branches2, note, contentWidth);
}
var underline = (char) => (str) => [...str.split("\n"), char.repeat(width(str))].join("\n");

// src/model/rule.ts
var ruleId = {
  a1: "a1",
  a2: "a2",
  a3: "a3",
  cl1: "cl1",
  cl2: "cl2",
  cl: "cl",
  cr: "cr",
  cut: "cut",
  dl: "dl",
  fcr: "fcr",
  fcut: "fcut",
  fdl: "fdl",
  fil: "fil",
  dr1: "dr1",
  dr2: "dr2",
  dr: "dr",
  f: "f",
  i: "i",
  il: "il",
  ir: "ir",
  mp: "mp",
  nl: "nl",
  nr: "nr",
  sRotLB: "sRotLB",
  sRotLF: "sRotLF",
  sRotRB: "sRotRB",
  sRotRF: "sRotRF",
  scl: "scl",
  scr: "scr",
  swl: "swl",
  swr: "swr",
  sxl: "sxl",
  sxr: "sxr",
  v: "v"
};
var matchRuleId = (s, f2) => f2[s]();
var isRuleId = (u) => typeof u === "string" && u in ruleId;

// src/render/segment.ts
function of2(text) {
  return { text, active: false, connective: false };
}
function active(text) {
  return { text, active: true, connective: false };
}
function connective(text, active2) {
  return { text, active: active2, connective: true };
}
function paren(text) {
  return { text, active: false, connective: false, parenthesis: true };
}
function turnstile(text) {
  return { text, active: false, connective: false, turnstile: true };
}
function raw(html2) {
  return { text: html2, active: false, connective: false, raw: true };
}
function plain(segments) {
  return segments.map((s) => s.raw === true ? "" : s.text).join("");
}
function escape(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function html(segments) {
  return segments.map((s) => {
    if (s.raw === true) {
      return s.text;
    }
    if (s.connective) {
      const cls = s.active ? "connective active" : "connective";
      return `<span class="${cls}">${escape(s.text)}</span>`;
    }
    if (s.parenthesis === true) {
      return `<span class="parenthesis">${escape(s.text)}</span>`;
    }
    if (s.turnstile === true) {
      return `<span class="turnstile">${escape(s.text)}</span>`;
    }
    return escape(s.text);
  }).join("");
}
function trim(segments) {
  const result = [...segments];
  for (let i90 = 0; i90 < result.length; i90 += 1) {
    const s = result[i90];
    if (s === void 0) break;
    if (s.raw === true) continue;
    const trimmed = s.text.trimStart();
    result[i90] = { ...s, text: trimmed };
    if (trimmed.length > 0) break;
  }
  for (let i90 = result.length - 1; i90 >= 0; i90 -= 1) {
    const s = result[i90];
    if (s === void 0) break;
    if (s.raw === true) continue;
    const trimmed = s.text.trimEnd();
    result[i90] = { ...s, text: trimmed };
    if (trimmed.length > 0) break;
  }
  return result;
}

// src/render/print.ts
var NullaryTemplateId = {
  falsum: null,
  verum: null
};
var isNullaryTemplateId = (s) => s in NullaryTemplateId;
var UnaryTemplateId = {
  atom: null,
  optional: null,
  parenthesis: null,
  negation: null
};
var isUnaryTemplateId = (s) => s in UnaryTemplateId;
var BinaryTemplateId = {
  conjunction: null,
  disjunction: null,
  implication: null,
  formulas: null,
  sequent: null
};
var isBinaryTemplateId = (s) => s in BinaryTemplateId;
var basic = {
  falsum: ["\u22A5"],
  verum: ["\u22A4"],
  atom: ["", ""],
  optional: ["", ""],
  parenthesis: ["(", ")"],
  negation: ["\xAC", ""],
  conjunction: ["", "\u2227", ""],
  disjunction: ["", "\u2228", ""],
  implication: ["", "\u2192", ""],
  formulas: ["", ",", ""],
  sequent: ["", " \u22A2 ", ""]
};
var empty3 = String();
function printNullary(key) {
  return () => (theme) => {
    const [s0] = theme[key];
    return [of2(s0)];
  };
}
function printUnary(key, activeConn = false, markConnective = false) {
  return (a91) => (theme) => {
    const [s0, s1] = theme[key];
    if (key === "parenthesis") {
      return [paren(s0), ...a91(theme), paren(s1)];
    }
    return [
      markConnective ? connective(s0, activeConn) : activeConn ? active(s0) : of2(s0),
      ...a91(theme),
      of2(s1)
    ];
  };
}
function printBinary(key, activeConn = false, markConnective = false) {
  return (a91, b) => (theme) => {
    const [s0, s1, s2] = theme[key];
    return [
      of2(s0),
      ...a91(theme),
      markConnective ? connective(s1, activeConn) : activeConn ? active(s1) : key === "sequent" ? turnstile(s1) : of2(s1),
      ...b(theme),
      of2(s2)
    ];
  };
}
function print(key) {
  if (isNullaryTemplateId(key)) {
    return printNullary(key);
  }
  if (isUnaryTemplateId(key)) {
    return printUnary(key);
  }
  if (isBinaryTemplateId(key)) {
    return printBinary(key);
  }
  return assertNever(key);
}
var printString = (s) => (_theme) => [of2(s)];
var printNothing = printString(empty3);
function printNonEmptyArray(k) {
  return ([head4, ...tail2]) => tail2.reduce(print(k), head4);
}
function printArray(k) {
  return (ps) => isNonEmptyArray(ps) ? printNonEmptyArray(k)(ps) : printNothing;
}
function fromAtom({ value }) {
  let chr = value;
  if (value === "p") {
    chr = "\u{1F427}";
  }
  if (value === "q") {
    chr = "\u{1F99C}";
  }
  if (value === "r") {
    chr = "\u{1F983}";
  }
  if (value === "s") {
    chr = "\u{1F986}";
  }
  if (value === "u") {
    chr = "\u{1F413}";
  }
  if (value === "v") {
    chr = "\u{1F99A}";
  }
  return print("atom")(printString(chr));
}
function fromFalsum(_falsum) {
  return print("falsum")();
}
function fromVerum(_verum) {
  return print("verum")();
}
var precedence = (p) => matchRaw(p, {
  atom: () => 4,
  falsum: () => 4,
  verum: () => 4,
  negation: () => 3,
  conjunction: () => 2,
  disjunction: () => 2,
  implication: () => 1
});
var expand = (minPrec, operand) => {
  if (operand.kind === "atom") return fromProp(operand);
  return precedence(operand) >= minPrec ? print("optional")(fromProp(operand)) : print("parenthesis")(fromProp(operand));
};
function fromNegation({ negand }, activeConnective = false) {
  return printUnary("negation", activeConnective, true)(expand(3, negand));
}
function fromConjunction({ leftConjunct, rightConjunct }, activeConnective = false) {
  return printBinary(
    "conjunction",
    activeConnective,
    true
  )(expand(3, leftConjunct), expand(3, rightConjunct));
}
function fromDisjunction({ leftDisjunct, rightDisjunct }, activeConnective = false) {
  return printBinary(
    "disjunction",
    activeConnective,
    true
  )(expand(3, leftDisjunct), expand(3, rightDisjunct));
}
function fromImplication({ antecedent, consequent }, activeConnective = false) {
  return printBinary(
    "implication",
    activeConnective,
    true
  )(expand(2, antecedent), expand(2, consequent));
}
function fromProp(proposition, activeConnective = false) {
  return matchRaw(proposition, {
    atom: fromAtom,
    falsum: fromFalsum,
    verum: fromVerum,
    negation: (p) => fromNegation(p, activeConnective),
    conjunction: (p) => fromConjunction(p, activeConnective),
    disjunction: (p) => fromDisjunction(p, activeConnective),
    implication: (p) => fromImplication(p, activeConnective)
  });
}
var wrapGazed = (p) => (t2) => [raw('<span class="gazed">'), ...p(t2), raw("</span>")];
function fromSequent(judgement, gaze = null) {
  const { antecedent, succedent } = judgement;
  const antPrinters = antecedent.map((f2, i90) => {
    const p = fromProp(f2, true);
    return gaze && gaze.side === "left" && gaze.index === i90 ? wrapGazed(p) : p;
  });
  const sucPrinters = succedent.map((f2, i90) => {
    const p = fromProp(f2, true);
    return gaze && gaze.side === "right" && gaze.index === i90 ? wrapGazed(p) : p;
  });
  return (t2) => trim(
    print("sequent")(
      printArray("formulas")(antPrinters),
      printArray("formulas")(sucPrinters)
    )(t2)
  );
}
function left3(label, n = null) {
  return n != null ? label + n : label;
}
function right2(label, n = null) {
  return n != null ? label + n : label;
}
function fromRuleId(s, l = "L", r = "R") {
  return (t2) => [
    of2(
      matchRuleId(s, {
        i: () => "I",
        f: () => "\u22A5",
        v: () => "\u22A4",
        cl: () => t2.conjunction.join(empty3) + left3(l),
        dr: () => t2.disjunction.join(empty3) + right2(r),
        cl1: () => t2.conjunction.join(empty3) + left3(l, "\u2081"),
        dr1: () => t2.disjunction.join(empty3) + right2(r, "\u2081"),
        cl2: () => t2.conjunction.join(empty3) + left3(l, "\u2082"),
        dr2: () => t2.disjunction.join(empty3) + right2(r, "\u2082"),
        dl: () => t2.disjunction.join(empty3) + left3(l),
        cr: () => t2.conjunction.join(empty3) + right2(r),
        il: () => t2.implication.join(empty3) + left3(l),
        ir: () => t2.implication.join(empty3) + right2(r),
        nl: () => t2.negation.join(empty3) + left3(l),
        nr: () => t2.negation.join(empty3) + right2(r),
        swl: () => "W" + left3(l),
        swr: () => "W" + right2(r),
        scl: () => "C" + left3(l),
        scr: () => "C" + right2(r),
        sRotLF: () => "\u21B6" + left3(l),
        sRotRF: () => "\u21B7" + right2(r),
        sRotLB: () => "\u21B7" + left3(l),
        sRotRB: () => "\u21B6" + right2(r),
        sxl: () => "X" + left3(l),
        sxr: () => "X" + right2(r),
        a1: () => "a1",
        a2: () => "a2",
        a3: () => "a3",
        cut: () => "cut",
        fcut: () => "fcut",
        fcr: () => t2.conjunction.join(empty3) + right2(r, "\u1DA0"),
        fdl: () => t2.disjunction.join(empty3) + left3(l, "\u1DA0"),
        fil: () => t2.implication.join(empty3) + left3(l, "\u1DA0"),
        mp: () => "mp"
      })
    )
  ];
}
function fromPremise({ result }) {
  return plain(fromSequent(result)(basic));
}
function fromTransformation({ rule, deps, result }, l = "L", r = "R", showLabel = true) {
  return treeAuto(
    plain(fromSequent(result)(basic)),
    deps.map((d) => fromDerivation(d, l, r, showLabel)),
    showLabel ? "(" + plain(fromRuleId(rule, l, r)(basic)) + ")" : null
  );
}
function fromDerivation(treelike, l = "L", r = "R", showLabel = true) {
  switch (treelike.kind) {
    case "premise":
      return fromPremise(treelike);
    case "transformation":
      return fromTransformation(treelike, l, r, showLabel);
  }
}
var unit = 16;
var half = center2(2 * unit);
var full = center2(4 * unit);
function fromMeta(meta4) {
  return leftify(
    br,
    br,
    full(underline("*")(meta4.name)),
    br,
    ...meta4.propositions.flatMap(({ title, examples }) => [
      br,
      title,
      br,
      br,
      ...examples.flatMap((line2) => [
        half(
          spaced(
            line2.map((x) => plain(fromProp(x)(basic))),
            1
          )
        ),
        br
      ])
    ]),
    br,
    ...meta4.rules.flatMap(({ title, examples }) => [
      br,
      title,
      br,
      br,
      ...examples.flatMap((line2) => [
        spaced(
          line2.map((x) => half(fromDerivation(x))),
          0
        ),
        br,
        br
      ])
    ])
  );
}
var fromFocus = (s) => {
  return fromDerivation(s.derivation);
};

// src/interactive/focus.ts
var focus = (derivation, branch = 0) => ({
  derivation,
  branch
});
var next = (s) => focus(s.derivation, s.branch + 1);
var prev = (s) => focus(s.derivation, s.branch - 1);
var activePath = (s) => {
  const paths = branches(s.derivation);
  return mod(paths, s.branch);
};
var activeSequent = (s) => {
  const path = activePath(s);
  const derivation = subDerivation(s.derivation, path);
  if (!derivation) {
    console.warn(
      "activeSequent: path not found in derivation, falling back to root"
    );
  }
  return (derivation ?? s.derivation).result;
};
var nextOpenForward = (s) => {
  const allPaths = branches(s.derivation);
  const open = new Set(openBranches(s.derivation).map((p) => p.join(",")));
  for (let i90 = 1; i90 <= allPaths.length; i90 += 1) {
    const candidate = mod(allPaths, s.branch + i90);
    if (open.has(candidate.join(","))) {
      return focus(s.derivation, s.branch + i90);
    }
  }
  return next(s);
};
var forwardThenBackOpen = (s) => {
  const allPaths = branches(s.derivation);
  const open = new Set(openBranches(s.derivation).map((p) => p.join(",")));
  const normalized = (Math.floor(s.branch) % allPaths.length + allPaths.length) % allPaths.length;
  for (let i90 = normalized + 1; i90 < allPaths.length; i90 += 1) {
    const p = allPaths[i90];
    if (p && open.has(p.join(","))) {
      return focus(s.derivation, s.branch + (i90 - normalized));
    }
  }
  for (let i90 = normalized - 1; i90 >= 0; i90 -= 1) {
    const p = allPaths[i90];
    if (p && open.has(p.join(","))) {
      return focus(s.derivation, s.branch + (i90 - normalized));
    }
  }
  return next(s);
};
var apply = (s, edit) => {
  const path = activePath(s);
  const derivation = editDerivation(s.derivation, path, edit);
  if (!derivation) {
    return s;
  }
  const cursor = focus(derivation, s.branch);
  const openBefore = openBranches(s.derivation).length;
  const openAfter = openBranches(derivation).length;
  if (openAfter < openBefore) {
    return forwardThenBackOpen(cursor);
  }
  const curPath = activePath(cursor);
  const curDeriv = subDerivation(cursor.derivation, curPath);
  if (curDeriv && curDeriv.kind === "transformation") {
    return nextOpenForward(cursor);
  }
  return cursor;
};
var undo2 = (s) => {
  const path = activePath(s);
  const current2 = subDerivation(s.derivation, path);
  if (current2?.kind === "transformation") {
    const derivation = editDerivation(
      s.derivation,
      path,
      (d) => premise(d.result)
    );
    if (!derivation) {
      return s;
    }
    return focus(derivation, s.branch);
  }
  if (isNonEmptyArray(path)) {
    const parentPath = init(path);
    const derivation = editDerivation(
      s.derivation,
      parentPath,
      (parent) => premise(parent.result)
    );
    if (!derivation) {
      return s;
    }
    const result = focus(derivation, s.branch);
    const resultPath = activePath(result);
    const resultDeriv = subDerivation(result.derivation, resultPath);
    if (resultDeriv && resultDeriv.kind === "transformation") {
      return nextOpenForward(result);
    }
    return result;
  }
  return s;
};
var reset2 = (s) => {
  return focus(premise(s.derivation.result));
};
var applyEvent = (state, ev) => {
  switch (ev.kind) {
    case "reverse0": {
      const rule = reverse0[ev.rev];
      state = apply(state, rule.tryReverse);
      break;
    }
    case "reverse1": {
      const rule = reverse1[ev.rev];
      state = apply(state, rule.tryReverse(ev.a));
      break;
    }
    case "undo":
      state = undo2(state);
      break;
    case "reset":
      state = reset2(state);
      break;
    case "nextBranch":
      state = next(state);
      break;
    case "prevBranch":
      state = prev(state);
      break;
  }
  return state;
};
var applicableRules2 = (state) => {
  const p = activePath(state);
  const d = subDerivation(state.derivation, p);
  if (!d) {
    return [];
  }
  return applicableRules(d.result);
};

// src/systems/rk.ts
var alpha = (s) => atom(s);
var omega = {
  p0: { falsum, verum },
  p1: { negation },
  p2: { implication, conjunction, disjunction }
};
var iota = {
  i: ruleI.apply,
  v: ruleV.apply,
  f: ruleF.apply
};
var zeta = {
  cut: ruleCut.apply,
  cl: ruleCL.apply,
  dr: ruleDR.apply,
  dl: ruleDL.apply,
  cr: ruleCR.apply,
  il: ruleIL.apply,
  ir: ruleIR.apply,
  nl: ruleNL.apply,
  nr: ruleNR.apply,
  swl: ruleSWL.apply,
  swr: ruleSWR.apply,
  sRotLF: ruleSRotLF.apply,
  sRotLB: ruleSRotLB.apply,
  sRotRF: ruleSRotRF.apply,
  sRotRB: ruleSRotRB.apply
};
var rules2 = [
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
];
var name = "RK";
var rk = {
  a: alpha,
  o: omega,
  i: iota,
  z: zeta
};

// src/help/rk.ts
var meta = {
  name,
  propositions: [
    {
      title: "Variables",
      examples: [
        [
          alpha("p"),
          alpha("q"),
          alpha("r"),
          alpha("s"),
          alpha("t"),
          alpha("u")
        ]
      ]
    },
    {
      title: "Connectives",
      examples: [
        [
          falsum,
          verum,
          negation(atom("A")),
          implication(atom("A"), atom("B")),
          conjunction(atom("A"), atom("B")),
          disjunction(atom("A"), atom("B"))
        ]
      ]
    }
  ],
  rules: [
    {
      title: "Axiom",
      examples: [[ruleF.example, ruleV.example], [ruleI.example]]
    },
    {
      title: "Cut",
      examples: [[ruleCut.example]]
    },
    {
      title: "Logical Rules",
      examples: [
        [ruleCL.example, ruleDR.example],
        [ruleDL.example, ruleCR.example],
        [ruleIL.example, ruleIR.example],
        [ruleNL.example, ruleNR.example]
      ]
    },
    {
      title: "Structural Rules",
      examples: [
        [ruleSWL.example, ruleSWR.example],
        [ruleSRotLF.example, ruleSRotRF.example],
        [ruleSRotLB.example, ruleSRotRB.example]
      ]
    }
  ]
};
var exampleProof = rk.z.ir(
  rk.z.swl(
    rk.o.p2.implication(
      rk.a("p"),
      rk.o.p2.implication(rk.a("q"), rk.o.p1.negation(rk.a("p")))
    ),
    rk.z.ir(rk.i.i(rk.a("p")))
  )
);

// src/systems/fk.ts
var alpha2 = (s) => atom(s);
var omega2 = {
  p0: { falsum, verum },
  p1: { negation },
  p2: { implication, conjunction, disjunction }
};
var iota2 = {
  i: ruleI.apply,
  v: ruleV.apply,
  f: ruleF.apply
};
var zeta2 = {
  fcut: ruleFCut.apply,
  cl1: ruleCL1.apply,
  dr1: ruleDR1.apply,
  cl2: ruleCL2.apply,
  dr2: ruleDR2.apply,
  fdl: ruleFDL.apply,
  fcr: ruleFCR.apply,
  fil: ruleFIL.apply,
  ir: ruleIR.apply,
  nl: ruleNL.apply,
  nr: ruleNR.apply,
  swl: ruleSWL.apply,
  swr: ruleSWR.apply,
  scl: ruleSCL.apply,
  scr: ruleSCR.apply,
  sRotLF: ruleSRotLF.apply,
  sRotLB: ruleSRotLB.apply,
  sRotRF: ruleSRotRF.apply,
  sRotRB: ruleSRotRB.apply,
  sxl: ruleSXL.apply,
  sxr: ruleSXR.apply
};
var name2 = "FK";
var fk = {
  a: alpha2,
  o: omega2,
  i: iota2,
  z: zeta2
};

// src/help/fk.ts
var meta2 = {
  name: name2,
  propositions: [
    {
      title: "Variables",
      examples: [
        [
          alpha2("p"),
          alpha2("q"),
          alpha2("r"),
          alpha2("s"),
          alpha2("t"),
          alpha2("u")
        ]
      ]
    },
    {
      title: "Connectives",
      examples: [
        [
          falsum,
          verum,
          negation(atom("A")),
          implication(atom("A"), atom("B")),
          conjunction(atom("A"), atom("B")),
          disjunction(atom("A"), atom("B"))
        ]
      ]
    }
  ],
  rules: [
    {
      title: "Axiom",
      examples: [[ruleF.example, ruleV.example], [ruleI.example]]
    },
    {
      title: "Logical Rules",
      examples: [
        [ruleCL1.example, ruleDR1.example],
        [ruleCL2.example, ruleDR2.example],
        [ruleFIL.example, ruleIR.example],
        [ruleFDL.example, ruleFCR.example],
        [ruleNL.example, ruleNR.example],
        [ruleFCut.example]
      ]
    },
    {
      title: "Structural Rules",
      examples: [
        [ruleSWL.example, ruleSWR.example],
        [ruleSCL.example, ruleSCR.example],
        [ruleSRotLF.example, ruleSRotRF.example],
        [ruleSRotLB.example, ruleSRotRB.example],
        [ruleSXL.example, ruleSXR.example]
      ]
    }
  ]
};
var exampleProof2 = fk.z.ir(
  fk.z.swl(
    fk.o.p2.implication(
      fk.a("p"),
      fk.o.p2.implication(fk.a("q"), fk.o.p1.negation(fk.a("p")))
    ),
    fk.z.ir(fk.i.i(fk.a("p")))
  )
);

// src/systems/la3.ts
var alpha3 = (s) => atom(s);
var omega3 = {
  p0: {},
  p1: { negation },
  p2: { implication }
};
var iota3 = {
  a1: ruleA1.apply,
  a2: ruleA2.apply,
  a3: ruleA3.apply
};
var zeta3 = {
  mp: ruleMP.apply
};
var name3 = "\u0141ukasiewicz Axioms 3";
var la3 = {
  a: alpha3,
  o: omega3,
  i: iota3,
  z: zeta3
};

// src/help/la3.ts
var meta3 = {
  name: name3,
  propositions: [
    {
      title: "Variables",
      examples: [
        [
          alpha3("p"),
          alpha3("q"),
          alpha3("r"),
          alpha3("s"),
          alpha3("t"),
          alpha3("u")
        ]
      ]
    },
    {
      title: "Connectives",
      examples: [[negation(atom("A")), implication(atom("A"), atom("B"))]]
    }
  ],
  rules: [
    {
      title: "Axioms",
      examples: [[ruleA1.example, ruleA2.example, ruleA3.example]]
    },
    {
      title: "Rule",
      examples: [[ruleMP.example]]
    }
  ]
};
var exampleProof3 = la3.z.mp(
  la3.i.a2(
    la3.a("p"),
    la3.o.p2.implication(la3.a("q"), la3.o.p1.negation(la3.a("p"))),
    la3.a("p")
  ),
  la3.i.a1(
    la3.a("p"),
    la3.o.p2.implication(la3.a("q"), la3.o.p1.negation(la3.a("p")))
  )
);

// src/help/index.ts
var helpSystems = {
  rk: {
    id: "rk",
    name: meta.name,
    meta,
    exampleProof
  },
  fk: {
    id: "fk",
    name: meta2.name,
    meta: meta2,
    exampleProof: exampleProof2
  },
  la3: {
    id: "la3",
    name: meta3.name,
    meta: meta3,
    exampleProof: exampleProof3
  }
};
var isHelpSystemId = (s) => s in helpSystems;
var renderSystemHelp = (id) => {
  const sys = helpSystems[id];
  return fromMeta(sys.meta) + "\n\nSandbox\n\n" + fromDerivation(sys.exampleProof) + "\n";
};

// src/interactive/repl.ts
function* repl(session2, factory2) {
  let output = menuPrompt();
  while (true) {
    const input = yield [...output, of2("\n")];
    if (input.trim() === "") {
      output = session2.mode === null ? menuPrompt() : modeStatus(session2);
      continue;
    }
    const [cmd2, ...args] = split(input, " ");
    const global = handleGlobal(cmd2, args);
    if (global) {
      output = global;
      continue;
    }
    if (session2.mode === null) {
      const result2 = handleMenu(session2, factory2, cmd2);
      if (result2 === null) return [of2("\nExiting...")];
      output = result2;
      continue;
    }
    const result = handleMode(session2, factory2, cmd2, args);
    if (result === null) return [of2("\nExiting...")];
    output = result;
  }
}
var menuPrompt = () => [
  of2(
    "\n[Main Menu]\n" + gameModes.map(
      (m) => "\n  " + m + " - " + m.charAt(0).toUpperCase() + m.slice(1) + " mode"
    ).join("") + "\n  quit - Exit"
  )
];
var handleGlobal = (cmd2, args) => {
  switch (cmd2) {
    case "systems":
      return [
        of2(
          "\nSystems:\n" + Object.values(helpSystems).map((s) => "  " + s.id + " - " + s.name).join("\n")
        )
      ];
    case "system": {
      const [arg] = args;
      if (arg == null || !isHelpSystemId(arg)) {
        return [of2('\nUnknown system "' + arg + '"')];
      }
      return [of2("\n" + renderSystemHelp(arg))];
    }
    default:
      return null;
  }
};
var handleMenu = (session2, factory2, cmd2) => {
  if (cmd2 === "quit") return null;
  if (includes(gameModes, cmd2)) {
    session2.enter(cmd2, factory2[cmd2]());
    return modeStatus(session2);
  }
  return [of2('\nUnknown command "' + cmd2 + '"')];
};
var handleMode = (session2, factory2, cmd2, args) => {
  switch (cmd2) {
    case "quit":
      return null;
    case "menu":
      session2.returnToMenu();
      return menuPrompt();
    case "new": {
      if (session2.mode !== "random") {
        return [of2('\nUnknown command "new"')];
      }
      session2.replaceWorkspace(factory2["random"]());
      return modeStatus(session2);
    }
    case "help": {
      const [arg] = args;
      if (arg == null) {
        return modeHelp(session2);
      }
      if (isRuleId(arg)) {
        return [
          of2('\nRule "' + arg + '":\n\n' + fromDerivation(rules[arg].example))
        ];
      }
      return [of2('\nUnknown rule "' + arg + '"')];
    }
    case "list": {
      if (session2.mode !== "campaign") {
        return [of2('\nUnknown command "list"')];
      }
      return [
        of2(
          "\nConjectures:\n" + session2.workspace.listConjectures().map(
            ([id]) => (id === session2.workspace.selected ? "*" : " ") + " " + id
          ).join("\n")
        )
      ];
    }
    case "prev": {
      if (session2.mode !== "campaign") {
        return [of2('\nUnknown command "prev"')];
      }
      session2.workspace.selectConjecture(
        session2.workspace.previousConjectureId()
      );
      return modeStatus(session2);
    }
    case "next": {
      if (session2.mode !== "campaign") {
        return [of2('\nUnknown command "next"')];
      }
      session2.workspace.selectConjecture(session2.workspace.nextConjectureId());
      return modeStatus(session2);
    }
    case "select": {
      if (session2.mode !== "campaign") {
        return [of2('\nUnknown command "select"')];
      }
      const [conjectureId] = args;
      if (!session2.workspace.isConjectureId(conjectureId)) {
        return [of2('\nUnknown conjecture "' + conjectureId + '"')];
      }
      session2.workspace.selectConjecture(conjectureId);
      return modeStatus(session2);
    }
    default: {
      const ev = parseEvent(cmd2);
      if (!ev) {
        return [of2('\nUnknown command "' + cmd2 + '"')];
      }
      session2.workspace.applyEvent(ev);
      return modeStatus(session2);
    }
  }
};
var modeHelp = (session2) => {
  let text = "\nCommands:";
  text += "\n  help - display this manual";
  text += "\n  help <rule> - display rule description";
  text += "\n  undo - undo applied rule";
  text += "\n  reset - undo all applied rules";
  if (session2.mode === "random") {
    text += "\n  new - get a new random challenge";
  }
  text += "\n  menu - return to main menu";
  text += "\n  quit - exit";
  return [of2(text)];
};
var modeStatus = (session2) => {
  const ws = session2.workspace;
  const s = ws.currentConjecture();
  const solved = isProof(s.derivation);
  const availableRules = ws.applicableRules();
  let title = "";
  if (session2.mode === "campaign") {
    title = "\n[Campaign: " + ws.selected + "]";
  } else if (session2.mode === "random") {
    title = "\n[Random]";
  }
  const commands = ["help", "undo", "reset"];
  if (session2.mode === "random") commands.push("new");
  commands.push("menu");
  const result = [
    of2(title + "\n\n"),
    ...fromSequent(activeSequent(s))(basic),
    of2("\n\n" + fromFocus(s)),
    of2("\n\nRules: " + availableRules.join(", ")),
    of2("\nCommands: " + commands.join(", "))
  ];
  if (solved) {
    result.push(of2("\n\nConglaturations!\n"));
    if (session2.mode === "campaign") {
      result.push(of2('\nType "next" to continue'));
    }
    if (session2.mode === "random") {
      result.push(of2('\nType "new" for a new challenge'));
    }
  }
  return result;
};

// src/interactive/session.ts
var Session = class {
  _mode = null;
  _workspace = null;
  get mode() {
    return this._mode;
  }
  get workspace() {
    if (this._workspace === null) {
      throw new Error("No active workspace");
    }
    return this._workspace;
  }
  enter(mode, workspace) {
    this._mode = mode;
    this._workspace = workspace;
  }
  returnToMenu() {
    this._mode = null;
    this._workspace = null;
  }
  replaceWorkspace(workspace) {
    this._workspace = workspace;
  }
};

// src/model/challenge.ts
var isChallenge = (c) => "solution" in c;
var challenge = (c) => c;
var isTutorial = (c) => "pinned" in c && Array.isArray(c.pinned);
var tutorial = (t2) => t2;

// src/interactive/workspace.ts
var Workspace = class {
  theorems;
  conjectures = {};
  theoremKeys;
  selected;
  _gaze = null;
  _gazeKind = "connective";
  isSolved() {
    return isProof(this.currentConjecture().derivation);
  }
  constructor(challenges2) {
    this.theorems = challenges2;
    const theoremKeys = keys(challenges2);
    if (!isNonEmptyArray(theoremKeys)) {
      throw new Error("no challenges");
    }
    this.theoremKeys = theoremKeys;
    this.selected = theoremKeys[0];
    this.selectConjecture(this.selected);
  }
  currentConjecture() {
    const c = this.conjectures[this.selected];
    if (c) return c;
    console.warn(`Conjecture '${this.selected}' not initialized, recovering`);
    const conf = get(this.theorems, this.selected);
    const f2 = focus(premise(conf.goal));
    this.conjectures[this.selected] = f2;
    return f2;
  }
  previousConjectureId() {
    const index = this.theoremKeys.findIndex((x) => x === this.selected);
    return this.theoremKeys[index - 1] ?? head(this.theoremKeys);
  }
  nextConjectureId() {
    const index = this.theoremKeys.findIndex((x) => x === this.selected);
    return this.theoremKeys[index + 1] ?? last(this.theoremKeys);
  }
  availableRules() {
    return get(this.theorems, this.selected).rules;
  }
  currentSolution() {
    const conf = get(this.theorems, this.selected);
    return isChallenge(conf) ? conf.solution : void 0;
  }
  pinnedRules() {
    const conf = get(this.theorems, this.selected);
    return isTutorial(conf) ? conf.pinned : [];
  }
  applicableRules() {
    const available = this.availableRules();
    const appplicable = applicableRules2(this.currentConjecture());
    return available.filter((rule) => appplicable.includes(rule));
  }
  selectConjecture(id) {
    if (!(id in this.conjectures)) {
      const conf = get(this.theorems, id);
      this.conjectures[id] = focus(premise(conf.goal));
    }
    this.selected = id;
  }
  listConjectures() {
    return entries(this.theorems);
  }
  isConjectureId(s) {
    return typeof s === "string" && s in this.theorems;
  }
  applyEvent(ev) {
    const oldGaze = this.gaze();
    const cursor = this.currentConjecture();
    const update = applyEvent(cursor, ev);
    this.conjectures[this.selected] = update;
    if (ev.kind === "nextBranch" || ev.kind === "prevBranch" || ev.kind === "reset") {
      this._gaze = null;
    } else {
      const seq = activeSequent(update);
      const sideLen = oldGaze.side === "left" ? seq.antecedent.length : seq.succedent.length;
      if (sideLen > 0) {
        this._gaze = {
          side: oldGaze.side,
          index: Math.min(oldGaze.index, sideLen - 1)
        };
      } else {
        this._gaze = null;
      }
    }
    this._gazeKind = "connective";
  }
  applyEventWithGaze(ev, nextGaze) {
    const cursor = this.currentConjecture();
    const update = applyEvent(cursor, ev);
    this.conjectures[this.selected] = update;
    this._gaze = nextGaze;
  }
  gazeKind() {
    return this._gazeKind;
  }
  setGazeKind(kind) {
    this._gazeKind = kind;
  }
  setGaze(gaze) {
    this._gaze = gaze;
    this._gazeKind = "connective";
  }
  gaze() {
    if (this._gaze) return this._gaze;
    return this.defaultGaze();
  }
  defaultGaze() {
    const seq = activeSequent(this.currentConjecture());
    if (seq.antecedent.length > 0) {
      return { side: "left", index: seq.antecedent.length - 1 };
    }
    if (seq.succedent.length > 0) {
      return { side: "right", index: 0 };
    }
    return { side: "left", index: 0 };
  }
  moveGaze(direction) {
    const seq = activeSequent(this.currentConjecture());
    const ant = seq.antecedent.length;
    const suc = seq.succedent.length;
    const total = ant + suc;
    if (total === 0) {
      this._gaze = null;
      this._gazeKind = "connective";
      return;
    }
    const current2 = this._gaze ?? this.defaultGaze();
    const linear = current2.side === "left" ? current2.index : ant + current2.index;
    const next2 = (linear + direction + total) % total;
    this._gaze = next2 < ant ? { side: "left", index: next2 } : { side: "right", index: next2 - ant };
    this._gazeKind = "connective";
  }
};

// src/challenges/ch0-identity-1.ts
var { a, i: i2 } = rk;
var rules3 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned = ["i"];
var goal = sequent([a("p")], [a("p")]);
var solution = i2.i(a("p"));
var ch0identity1 = tutorial({ rules: rules3, goal, solution, pinned });

// src/challenges/ch0-identity-2.ts
var { a: a4, i: i3 } = rk;
var rules4 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned2 = ["i"];
var goal2 = sequent([a4("q")], [a4("q")]);
var solution2 = i3.i(a4("q"));
var ch0identity2 = tutorial({ rules: rules4, goal: goal2, solution: solution2, pinned: pinned2 });

// src/challenges/ch1-weakening-1.ts
var { a: a5, z, i: i4 } = rk;
var rules5 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned3 = ["swl", "swr"];
var goal3 = sequent([a5("p"), a5("q")], [a5("p")]);
var solution3 = z.swl(a5("q"), i4.i(a5("p")));
var ch1weakening1 = tutorial({ rules: rules5, goal: goal3, solution: solution3, pinned: pinned3 });

// src/challenges/ch1-weakening-2.ts
var { a: a6, z: z2, i: i5 } = rk;
var rules6 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned4 = ["swl", "swr"];
var goal4 = sequent([a6("p")], [a6("q"), a6("p")]);
var solution4 = z2.swr(a6("q"), i5.i(a6("p")));
var ch1weakening2 = tutorial({ rules: rules6, goal: goal4, solution: solution4, pinned: pinned4 });

// src/challenges/ch1-weakening-3.ts
var { a: a7, z: z3, i: i6 } = rk;
var rules7 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned5 = ["swl", "swr"];
var goal5 = sequent([a7("p"), a7("q")], [a7("q"), a7("p")]);
var solution5 = z3.swl(a7("q"), z3.swr(a7("q"), i6.i(a7("p"))));
var ch1weakening3 = tutorial({ rules: rules7, goal: goal5, solution: solution5, pinned: pinned5 });

// src/challenges/ch1-weakening-4.ts
var { a: a8, o, z: z4, i: i7 } = rk;
var rules8 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned6 = ["swl", "swr"];
var goal6 = sequent(
  [a8("q"), o.p2.conjunction(a8("p"), a8("q"))],
  [o.p2.conjunction(a8("q"), a8("p")), a8("q")]
);
var solution6 = z4.swl(
  o.p2.conjunction(a8("p"), a8("q")),
  z4.swr(o.p2.conjunction(a8("q"), a8("p")), i7.i(a8("q")))
);
var ch1weakening4 = tutorial({ rules: rules8, goal: goal6, solution: solution6, pinned: pinned6 });

// src/challenges/ch1-weakening-5.ts
var { a: a9, o: o2, z: z5, i: i8 } = rk;
var rules9 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned7 = ["swl", "swr"];
var goal7 = sequent(
  [o2.p2.conjunction(a9("p"), a9("q")), a9("p")],
  [a9("q"), o2.p2.conjunction(a9("p"), a9("q"))]
);
var solution7 = z5.swl(
  a9("p"),
  z5.swr(a9("q"), i8.i(o2.p2.conjunction(a9("p"), a9("q"))))
);
var ch1weakening5 = tutorial({ rules: rules9, goal: goal7, solution: solution7, pinned: pinned7 });

// src/challenges/ch1-weakening-6.ts
var { a: a10, z: z6, i: i9 } = rk;
var rules10 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned8 = ["swl", "swr"];
var goal8 = sequent(
  [a10("p"), a10("q"), a10("q"), a10("p")],
  [a10("p"), a10("q"), a10("q"), a10("p")]
);
var solution8 = z6.swl(
  a10("p"),
  z6.swl(
    a10("q"),
    z6.swl(a10("q"), z6.swr(a10("p"), z6.swr(a10("q"), z6.swr(a10("q"), i9.i(a10("p"))))))
  )
);
var ch1weakening6 = tutorial({ rules: rules10, goal: goal8, solution: solution8, pinned: pinned8 });

// src/challenges/ch1-weakening-7.ts
var { a: a11, o: o3, i: i10 } = rk;
var rules11 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned9 = ["swl", "swr"];
var goal9 = sequent(
  [
    o3.p2.implication(
      o3.p2.disjunction(a11("p"), a11("q")),
      o3.p2.conjunction(a11("p"), a11("q"))
    )
  ],
  [
    o3.p2.implication(
      o3.p2.disjunction(a11("p"), a11("q")),
      o3.p2.conjunction(a11("p"), a11("q"))
    )
  ]
);
var solution9 = i10.i(
  o3.p2.implication(
    o3.p2.disjunction(a11("p"), a11("q")),
    o3.p2.conjunction(a11("p"), a11("q"))
  )
);
var ch1weakening7 = tutorial({ rules: rules11, goal: goal9, solution: solution9, pinned: pinned9 });

// src/challenges/ch1-weakening-8.ts
var { a: a12, o: o4, z: z7, i: i11 } = rk;
var rules12 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned10 = ["swl", "swr"];
var goal10 = sequent(
  [a12("p"), o4.p2.implication(a12("q"), a12("p")), a12("q")],
  [a12("q"), o4.p2.implication(a12("q"), a12("p")), a12("p")]
);
var solution10 = z7.swl(
  a12("q"),
  z7.swl(
    o4.p2.implication(a12("q"), a12("p")),
    z7.swr(a12("q"), z7.swr(o4.p2.implication(a12("q"), a12("p")), i11.i(a12("p"))))
  )
);
var ch1weakening8 = tutorial({ rules: rules12, goal: goal10, solution: solution10, pinned: pinned10 });

// src/challenges/ch1-weakening-9.ts
var { a: a13, z: z8, i: i12 } = rk;
var rules13 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned11 = ["swl", "swr"];
var goal11 = sequent(
  [a13("s"), a13("r"), a13("q"), a13("p")],
  [a13("p"), a13("q"), a13("r"), a13("s")]
);
var solution11 = z8.swl(
  a13("p"),
  z8.swl(
    a13("q"),
    z8.swl(a13("r"), z8.swr(a13("p"), z8.swr(a13("q"), z8.swr(a13("r"), i12.i(a13("s"))))))
  )
);
var ch1weakening9 = tutorial({ rules: rules13, goal: goal11, solution: solution11, pinned: pinned11 });

// src/challenges/ch2-permutation-1.ts
var { a: a14, z: z9, i: i13 } = rk;
var rules14 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned12 = ["sRotLF", "sRotRF", "sRotLB", "sRotRB"];
var goal12 = sequent([a14("p"), a14("p"), a14("p"), a14("q"), a14("p"), a14("p")], [a14("q")]);
var solution12 = z9.swl(
  a14("p"),
  z9.swl(
    a14("p"),
    z9.sRotLB(z9.swl(a14("p"), z9.swl(a14("p"), z9.swl(a14("p"), i13.i(a14("q"))))))
  )
);
var ch2permutation1 = tutorial({ rules: rules14, goal: goal12, solution: solution12, pinned: pinned12 });

// src/challenges/ch2-permutation-2.ts
var { a: a15, z: z10, i: i14 } = rk;
var rules15 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned13 = ["sRotLF", "sRotRF", "sRotLB", "sRotRB"];
var goal13 = sequent([a15("q")], [a15("p"), a15("p"), a15("p"), a15("q"), a15("p"), a15("p")]);
var solution13 = z10.sRotRF(
  z10.sRotRF(
    z10.swr(
      a15("p"),
      z10.swr(a15("p"), z10.swr(a15("p"), z10.swr(a15("p"), z10.swr(a15("p"), i14.i(a15("q"))))))
    )
  )
);
var ch2permutation2 = tutorial({ rules: rules15, goal: goal13, solution: solution13, pinned: pinned13 });

// src/challenges/ch2-permutation-3.ts
var { a: a16, z: z11, i: i15 } = rk;
var rules16 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned14 = ["sRotLF", "sRotRF", "sRotLB", "sRotRB"];
var goal14 = sequent(
  [a16("p"), a16("p"), a16("p"), a16("q"), a16("p"), a16("p")],
  [a16("p"), a16("p"), a16("p"), a16("q"), a16("p"), a16("p")]
);
var solution14 = z11.swl(
  a16("p"),
  z11.swl(
    a16("p"),
    z11.swl(
      a16("q"),
      z11.swl(
        a16("p"),
        z11.swl(
          a16("p"),
          z11.swr(
            a16("p"),
            z11.swr(
              a16("p"),
              z11.swr(a16("p"), z11.swr(a16("q"), z11.swr(a16("p"), i15.i(a16("p")))))
            )
          )
        )
      )
    )
  )
);
var ch2permutation3 = tutorial({ rules: rules16, goal: goal14, solution: solution14, pinned: pinned14 });

// src/challenges/ch2-permutation-4.ts
var { a: a17, z: z12, i: i16 } = rk;
var rules17 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned15 = ["sRotLF", "sRotRF", "sRotLB", "sRotRB"];
var goal15 = sequent(
  [a17("s"), a17("r"), a17("q"), a17("p")],
  [a17("s"), a17("r"), a17("q"), a17("p")]
);
var solution15 = z12.sRotLB(
  z12.swl(
    a17("q"),
    z12.swl(
      a17("r"),
      z12.swl(a17("s"), z12.swr(a17("s"), z12.swr(a17("r"), z12.swr(a17("q"), i16.i(a17("p"))))))
    )
  )
);
var ch2permutation4 = tutorial({ rules: rules17, goal: goal15, solution: solution15, pinned: pinned15 });

// src/challenges/ch2-permutation-5.ts
var { a: a18, o: o5, z: z13, i: i17 } = rk;
var rules18 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned16 = ["sRotLF", "sRotRF", "sRotLB", "sRotRB"];
var goal16 = sequent(
  [o5.p2.conjunction(a18("p"), a18("q")), o5.p2.conjunction(a18("p"), a18("q"))],
  [o5.p2.conjunction(a18("p"), a18("q")), o5.p2.disjunction(a18("p"), a18("q"))]
);
var solution16 = z13.sRotRF(
  z13.swl(
    o5.p2.conjunction(a18("p"), a18("q")),
    z13.swr(
      o5.p2.disjunction(a18("p"), a18("q")),
      i17.i(o5.p2.conjunction(a18("p"), a18("q")))
    )
  )
);
var ch2permutation5 = tutorial({ rules: rules18, goal: goal16, solution: solution16, pinned: pinned16 });

// src/challenges/ch2-permutation-6.ts
var { a: a19, o: o6, z: z14, i: i18 } = rk;
var rules19 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned17 = ["sRotLF", "sRotRF", "sRotLB", "sRotRB"];
var goal17 = sequent(
  [
    o6.p2.conjunction(a19("q"), a19("s")),
    o6.p2.conjunction(a19("q"), a19("s")),
    o6.p2.conjunction(a19("q"), a19("s"))
  ],
  [
    o6.p2.conjunction(a19("q"), a19("s")),
    o6.p2.conjunction(a19("s"), a19("q")),
    o6.p2.conjunction(a19("s"), a19("q"))
  ]
);
var solution17 = z14.sRotRB(
  z14.swl(
    o6.p2.conjunction(a19("q"), a19("s")),
    z14.swl(
      o6.p2.conjunction(a19("q"), a19("s")),
      z14.swr(
        o6.p2.conjunction(a19("s"), a19("q")),
        z14.swr(
          o6.p2.conjunction(a19("s"), a19("q")),
          i18.i(o6.p2.conjunction(a19("q"), a19("s")))
        )
      )
    )
  )
);
var ch2permutation6 = tutorial({ rules: rules19, goal: goal17, solution: solution17, pinned: pinned17 });

// src/challenges/ch2-permutation-7.ts
var { a: a20, o: o7, z: z15, i: i19 } = rk;
var rules20 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned18 = ["sRotLF", "sRotRF", "sRotLB", "sRotRB"];
var goal18 = sequent(
  [
    o7.p2.implication(a20("q"), a20("p")),
    o7.p2.implication(a20("p"), a20("s")),
    o7.p2.implication(a20("s"), a20("r"))
  ],
  [
    o7.p2.implication(a20("r"), a20("p")),
    o7.p2.implication(a20("p"), a20("s")),
    o7.p2.implication(a20("s"), a20("q"))
  ]
);
var solution18 = z15.sRotLF(
  z15.sRotRF(
    z15.swl(
      o7.p2.implication(a20("q"), a20("p")),
      z15.swl(
        o7.p2.implication(a20("s"), a20("r")),
        z15.swr(
          o7.p2.implication(a20("s"), a20("q")),
          z15.swr(
            o7.p2.implication(a20("r"), a20("p")),
            i19.i(o7.p2.implication(a20("p"), a20("s")))
          )
        )
      )
    )
  )
);
var ch2permutation7 = tutorial({ rules: rules20, goal: goal18, solution: solution18, pinned: pinned18 });

// src/challenges/ch2-permutation-8.ts
var { a: a21, o: o8, z: z16, i: i20 } = rk;
var rules21 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned19 = ["sRotLF", "sRotRF", "sRotLB", "sRotRB"];
var goal19 = sequent(
  [
    o8.p2.conjunction(a21("s"), a21("q")),
    a21("r"),
    o8.p2.implication(a21("q"), a21("p")),
    o8.p1.negation(a21("r"))
  ],
  [
    o8.p1.negation(a21("p")),
    o8.p2.implication(a21("s"), a21("q")),
    o8.p1.negation(a21("r")),
    o8.p2.disjunction(a21("q"), a21("p"))
  ]
);
var solution19 = z16.sRotLB(
  z16.sRotRF(
    z16.swl(
      o8.p2.implication(a21("q"), a21("p")),
      z16.swl(
        a21("r"),
        z16.swl(
          o8.p2.conjunction(a21("s"), a21("q")),
          z16.swr(
            o8.p2.disjunction(a21("q"), a21("p")),
            z16.swr(
              o8.p1.negation(a21("p")),
              z16.swr(
                o8.p2.implication(a21("s"), a21("q")),
                i20.i(o8.p1.negation(a21("r")))
              )
            )
          )
        )
      )
    )
  )
);
var ch2permutation8 = tutorial({ rules: rules21, goal: goal19, solution: solution19, pinned: pinned19 });

// src/challenges/ch2-permutation-9.ts
var { a: a22, o: o9, z: z17, i: i21 } = rk;
var rules22 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var pinned20 = ["sRotLF", "sRotRF", "sRotLB", "sRotRB"];
var goal20 = sequent(
  [a22("p"), o9.p1.negation(a22("p")), a22("q"), a22("r")],
  [o9.p1.negation(a22("q")), o9.p1.negation(a22("p")), a22("s"), o9.p1.negation(a22("r"))]
);
var solution20 = z17.swr(
  o9.p1.negation(a22("q")),
  z17.sRotLF(
    z17.sRotRB(
      z17.swl(
        a22("p"),
        z17.swl(
          a22("r"),
          z17.swl(
            a22("q"),
            z17.swr(
              a22("s"),
              z17.swr(o9.p1.negation(a22("r")), i21.i(o9.p1.negation(a22("p"))))
            )
          )
        )
      )
    )
  )
);
var ch2permutation9 = tutorial({ rules: rules22, goal: goal20, solution: solution20, pinned: pinned20 });

// src/challenges/ch3-negation-1.ts
var { a: a23, o: o10, z: z18, i: i22 } = rk;
var rules23 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr"
];
var pinned21 = ["nl", "nr"];
var goal21 = sequent([a23("r"), o10.p1.negation(a23("r"))], []);
var solution21 = z18.nl(i22.i(a23("r")));
var ch3negation1 = tutorial({ rules: rules23, goal: goal21, solution: solution21, pinned: pinned21 });

// src/challenges/ch3-negation-2.ts
var { a: a24, o: o11, z: z19, i: i23 } = rk;
var rules24 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr"
];
var pinned22 = ["nl", "nr"];
var goal22 = sequent([], [o11.p1.negation(a24("r")), a24("r")]);
var solution22 = z19.nr(i23.i(a24("r")));
var ch3negation2 = tutorial({ rules: rules24, goal: goal22, solution: solution22, pinned: pinned22 });

// src/challenges/ch3-negation-3.ts
var { a: a25, o: o12, z: z20, i: i24 } = rk;
var rules25 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr"
];
var pinned23 = ["nl", "nr"];
var goal23 = sequent([o12.p1.negation(o12.p1.negation(a25("q")))], [a25("q")]);
var solution23 = z20.nl(z20.nr(i24.i(a25("q"))));
var ch3negation3 = tutorial({ rules: rules25, goal: goal23, solution: solution23, pinned: pinned23 });

// src/challenges/ch3-negation-4.ts
var { a: a26, o: o13, z: z21, i: i25 } = rk;
var rules26 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr"
];
var pinned24 = ["nl", "nr"];
var goal24 = sequent(
  [o13.p1.negation(o13.p1.negation(a26("s")))],
  [o13.p1.negation(o13.p1.negation(o13.p1.negation(o13.p1.negation(a26("s")))))]
);
var solution24 = z21.nr(z21.nl(i25.i(o13.p1.negation(o13.p1.negation(a26("s"))))));
var ch3negation4 = tutorial({ rules: rules26, goal: goal24, solution: solution24, pinned: pinned24 });

// src/challenges/ch3-negation-5.ts
var { a: a27, o: o14, z: z22, i: i26 } = rk;
var rules27 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr"
];
var pinned25 = ["nl", "nr"];
var goal25 = sequent(
  [o14.p1.negation(o14.p1.negation(o14.p2.conjunction(a27("p"), a27("q"))))],
  [
    o14.p1.negation(
      o14.p1.negation(
        o14.p1.negation(o14.p1.negation(o14.p2.conjunction(a27("p"), a27("q"))))
      )
    )
  ]
);
var solution25 = z22.nr(
  z22.nl(i26.i(o14.p1.negation(o14.p1.negation(o14.p2.conjunction(a27("p"), a27("q"))))))
);
var ch3negation5 = tutorial({ rules: rules27, goal: goal25, solution: solution25, pinned: pinned25 });

// src/challenges/ch3-negation-6.ts
var { a: a28, o: o15, z: z23, i: i27 } = rk;
var rules28 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr"
];
var pinned26 = ["nl", "nr"];
var goal26 = sequent(
  [
    o15.p1.negation(o15.p1.negation(a28("p"))),
    o15.p1.negation(o15.p1.negation(o15.p1.negation(a28("p"))))
  ],
  [
    o15.p1.negation(o15.p1.negation(a28("p"))),
    o15.p1.negation(o15.p1.negation(o15.p1.negation(a28("p"))))
  ]
);
var solution26 = z23.sRotLF(
  z23.swl(
    o15.p1.negation(o15.p1.negation(a28("p"))),
    z23.swr(
      o15.p1.negation(o15.p1.negation(a28("p"))),
      i27.i(o15.p1.negation(o15.p1.negation(o15.p1.negation(a28("p")))))
    )
  )
);
var ch3negation6 = tutorial({ rules: rules28, goal: goal26, solution: solution26, pinned: pinned26 });

// src/challenges/ch3-negation-7.ts
var { a: a29, o: o16, z: z24, i: i28 } = rk;
var rules29 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr"
];
var pinned27 = ["nl", "nr"];
var goal27 = sequent(
  [
    o16.p1.negation(o16.p1.negation(a29("p"))),
    o16.p1.negation(o16.p1.negation(o16.p1.negation(a29("p"))))
  ],
  [
    o16.p1.negation(o16.p1.negation(a29("p"))),
    o16.p1.negation(o16.p1.negation(o16.p1.negation(a29("p"))))
  ]
);
var solution27 = z24.sRotLF(
  z24.swl(
    o16.p1.negation(o16.p1.negation(a29("p"))),
    z24.swr(
      o16.p1.negation(o16.p1.negation(a29("p"))),
      i28.i(o16.p1.negation(o16.p1.negation(o16.p1.negation(a29("p")))))
    )
  )
);
var ch3negation7 = tutorial({ rules: rules29, goal: goal27, solution: solution27, pinned: pinned27 });

// src/challenges/ch3-negation-8.ts
var { a: a30, o: o17, z: z25, i: i29 } = rk;
var rules30 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr"
];
var pinned28 = ["nl", "nr"];
var goal28 = sequent(
  [
    o17.p1.negation(o17.p1.negation(a30("p"))),
    o17.p2.conjunction(o17.p1.negation(a30("p")), o17.p1.negation(a30("q"))),
    o17.p1.negation(o17.p1.negation(o17.p1.negation(a30("q"))))
  ],
  [
    o17.p1.negation(o17.p1.negation(o17.p1.negation(a30("p")))),
    o17.p2.conjunction(o17.p1.negation(a30("p")), o17.p1.negation(a30("q"))),
    o17.p1.negation(o17.p1.negation(a30("q")))
  ]
);
var solution28 = z25.sRotLF(
  z25.sRotRF(
    z25.swl(
      o17.p1.negation(o17.p1.negation(a30("p"))),
      z25.swl(
        o17.p1.negation(o17.p1.negation(o17.p1.negation(a30("q")))),
        z25.swr(
          o17.p1.negation(o17.p1.negation(a30("q"))),
          z25.swr(
            o17.p1.negation(o17.p1.negation(o17.p1.negation(a30("p")))),
            i29.i(o17.p2.conjunction(o17.p1.negation(a30("p")), o17.p1.negation(a30("q"))))
          )
        )
      )
    )
  )
);
var ch3negation8 = tutorial({ rules: rules30, goal: goal28, solution: solution28, pinned: pinned28 });

// src/challenges/ch3-negation-9.ts
var { a: a31, o: o18, z: z26, i: i30 } = rk;
var rules31 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr"
];
var pinned29 = ["nl", "nr"];
var goal29 = sequent(
  [o18.p1.negation(a31("p")), o18.p1.negation(a31("s")), o18.p1.negation(a31("p")), a31("r")],
  [a31("q"), o18.p1.negation(a31("q")), a31("s"), o18.p1.negation(a31("r"))]
);
var solution29 = z26.sRotRB(
  z26.nr(
    z26.sRotLB(
      z26.swl(
        a31("r"),
        z26.swl(
          o18.p1.negation(a31("p")),
          z26.swl(
            o18.p1.negation(a31("s")),
            z26.swl(
              o18.p1.negation(a31("p")),
              z26.swr(a31("s"), z26.swr(o18.p1.negation(a31("r")), i30.i(a31("q"))))
            )
          )
        )
      )
    )
  )
);
var ch3negation9 = tutorial({ rules: rules31, goal: goal29, solution: solution29, pinned: pinned29 });

// src/challenges/ch3-negation-10.ts
var { a: a32, o: o19, i: i31 } = rk;
var rules32 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr"
];
var pinned30 = ["nl", "nr"];
var goal30 = sequent([o19.p1.negation(a32("p"))], [o19.p1.negation(a32("p"))]);
var solution30 = i31.i(o19.p1.negation(a32("p")));
var ch3negation10 = tutorial({ rules: rules32, goal: goal30, solution: solution30, pinned: pinned30 });

// src/challenges/ch4-theorem-1.ts
var { a: a33, o: o20, z: z27, i: i32 } = rk;
var rules33 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "ir"
];
var pinned31 = ["ir"];
var goal31 = conclusion(o20.p2.implication(a33("q"), a33("q")));
var solution31 = z27.ir(i32.i(a33("q")));
var ch4theorem1 = tutorial({ rules: rules33, goal: goal31, solution: solution31, pinned: pinned31 });

// src/challenges/ch4-theorem-2.ts
var { a: a34, o: o21, z: z28, i: i33 } = rk;
var rules34 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "ir"
];
var pinned32 = ["ir"];
var goal32 = conclusion(
  o21.p2.implication(
    o21.p2.conjunction(a34("q"), a34("q")),
    o21.p2.conjunction(a34("q"), a34("q"))
  )
);
var solution32 = z28.ir(i33.i(o21.p2.conjunction(a34("q"), a34("q"))));
var ch4theorem2 = tutorial({ rules: rules34, goal: goal32, solution: solution32, pinned: pinned32 });

// src/challenges/ch4-theorem-3.ts
var { a: a35, o: o22, z: z29, i: i34 } = rk;
var rules35 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "ir"
];
var pinned33 = ["ir"];
var goal33 = conclusion(
  o22.p2.implication(
    o22.p2.implication(a35("p"), a35("r")),
    o22.p2.implication(a35("p"), a35("r"))
  )
);
var solution33 = z29.ir(i34.i(o22.p2.implication(a35("p"), a35("r"))));
var ch4theorem3 = tutorial({ rules: rules35, goal: goal33, solution: solution33, pinned: pinned33 });

// src/challenges/ch4-theorem-4.ts
var { a: a36, o: o23, z: z30, i: i35 } = rk;
var rules36 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "ir"
];
var pinned34 = ["ir"];
var goal34 = conclusion(
  o23.p2.implication(
    o23.p2.implication(a36("q"), o23.p2.implication(a36("r"), a36("q"))),
    o23.p2.implication(a36("q"), o23.p2.implication(a36("r"), a36("q")))
  )
);
var solution34 = z30.ir(
  i35.i(o23.p2.implication(a36("q"), o23.p2.implication(a36("r"), a36("q"))))
);
var ch4theorem4 = tutorial({ rules: rules36, goal: goal34, solution: solution34, pinned: pinned34 });

// src/challenges/ch4-theorem-5.ts
var { a: a37, o: o24, z: z31, i: i36 } = rk;
var rules37 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "ir"
];
var pinned35 = ["ir"];
var goal35 = conclusion(
  o24.p2.implication(a37("q"), o24.p2.implication(a37("r"), a37("q")))
);
var solution35 = z31.ir(z31.ir(z31.swl(a37("r"), i36.i(a37("q")))));
var ch4theorem5 = tutorial({ rules: rules37, goal: goal35, solution: solution35, pinned: pinned35 });

// src/challenges/ch4-theorem-6.ts
var { a: a38, o: o25, z: z32, i: i37 } = rk;
var rules38 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "ir"
];
var pinned36 = ["ir"];
var goal36 = conclusion(
  o25.p2.implication(a38("r"), o25.p2.implication(a38("q"), a38("q")))
);
var solution36 = z32.ir(z32.ir(z32.sRotLF(z32.swl(a38("r"), i37.i(a38("q"))))));
var ch4theorem6 = tutorial({ rules: rules38, goal: goal36, solution: solution36, pinned: pinned36 });

// src/challenges/ch4-theorem-7.ts
var { a: a39, o: o26, z: z33, i: i38 } = rk;
var rules39 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "ir"
];
var pinned37 = ["ir"];
var goal37 = conclusion(
  o26.p2.implication(
    o26.p2.implication(a39("p"), o26.p2.implication(a39("q"), o26.p1.negation(a39("p")))),
    o26.p2.implication(a39("p"), a39("p"))
  )
);
var solution37 = z33.ir(
  z33.ir(
    z33.sRotLF(
      z33.swl(
        o26.p2.implication(
          a39("p"),
          o26.p2.implication(a39("q"), o26.p1.negation(a39("p")))
        ),
        i38.i(a39("p"))
      )
    )
  )
);
var ch4theorem7 = tutorial({ rules: rules39, goal: goal37, solution: solution37, pinned: pinned37 });

// src/challenges/ch4-theorem-8.ts
var { a: a40, o: o27, z: z34, i: i39 } = rk;
var rules40 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "ir"
];
var pinned38 = ["ir"];
var goal38 = conclusion(
  o27.p2.implication(
    o27.p1.negation(o27.p1.negation(a40("s"))),
    o27.p1.negation(o27.p1.negation(o27.p1.negation(o27.p1.negation(a40("s")))))
  )
);
var solution38 = z34.ir(z34.nr(z34.nl(i39.i(o27.p1.negation(o27.p1.negation(a40("s")))))));
var ch4theorem8 = tutorial({ rules: rules40, goal: goal38, solution: solution38, pinned: pinned38 });

// src/challenges/ch4-theorem-9.ts
var { a: a41, o: o28, z: z35, i: i40 } = rk;
var rules41 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "ir"
];
var pinned39 = ["ir"];
var goal39 = conclusion(
  o28.p2.implication(
    o28.p1.negation(o28.p1.negation(o28.p2.conjunction(a41("p"), a41("q")))),
    o28.p1.negation(
      o28.p1.negation(
        o28.p1.negation(o28.p1.negation(o28.p2.conjunction(a41("p"), a41("q"))))
      )
    )
  )
);
var solution39 = z35.ir(
  z35.nr(
    z35.nl(i40.i(o28.p1.negation(o28.p1.negation(o28.p2.conjunction(a41("p"), a41("q"))))))
  )
);
var ch4theorem9 = tutorial({ rules: rules41, goal: goal39, solution: solution39, pinned: pinned39 });

// src/challenges/ch4-theorem-10.ts
var { a: a42, o: o29, i: i41 } = rk;
var rules42 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "ir"
];
var pinned40 = ["ir"];
var goal40 = sequent(
  [o29.p2.implication(a42("r"), a42("p"))],
  [o29.p2.implication(a42("r"), a42("p"))]
);
var solution40 = i41.i(o29.p2.implication(a42("r"), a42("p")));
var ch4theorem10 = tutorial({ rules: rules42, goal: goal40, solution: solution40, pinned: pinned40 });

// src/challenges/ch5-composition-1.ts
var { a: a43, o: o30, z: z36, i: i42 } = rk;
var rules43 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "dr",
  "ir"
];
var pinned41 = ["cl", "dr"];
var goal41 = sequent([o30.p2.conjunction(a43("p"), a43("q"))], [a43("q"), a43("p")]);
var solution41 = z36.cl(z36.swl(a43("q"), z36.swr(a43("q"), i42.i(a43("p")))));
var ch5composition1 = tutorial({ rules: rules43, goal: goal41, solution: solution41, pinned: pinned41 });

// src/challenges/ch5-composition-2.ts
var { a: a44, o: o31, z: z37, i: i43 } = rk;
var rules44 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "dr",
  "ir"
];
var pinned42 = ["cl", "dr"];
var goal42 = sequent([a44("q"), a44("p")], [o31.p2.disjunction(a44("p"), a44("q"))]);
var solution42 = z37.dr(z37.swl(a44("p"), z37.swr(a44("p"), i43.i(a44("q")))));
var ch5composition2 = tutorial({ rules: rules44, goal: goal42, solution: solution42, pinned: pinned42 });

// src/challenges/ch5-composition-3.ts
var { a: a45, o: o32, z: z38, i: i44 } = rk;
var rules45 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "dr",
  "ir"
];
var pinned43 = ["cl", "dr"];
var goal43 = sequent(
  [o32.p2.conjunction(a45("q"), a45("p"))],
  [o32.p2.disjunction(a45("p"), a45("q"))]
);
var solution43 = z38.cl(z38.dr(z38.swl(a45("p"), z38.swr(a45("p"), i44.i(a45("q"))))));
var ch5composition3 = tutorial({ rules: rules45, goal: goal43, solution: solution43, pinned: pinned43 });

// src/challenges/ch5-composition-4.ts
var { a: a46, o: o33, z: z39, i: i45 } = rk;
var rules46 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "dr",
  "ir"
];
var pinned44 = ["cl", "dr"];
var goal44 = sequent(
  [o33.p2.conjunction(o33.p2.conjunction(a46("r"), a46("p")), a46("s"))],
  [o33.p2.disjunction(a46("s"), o33.p2.disjunction(a46("p"), a46("r")))]
);
var solution44 = z39.cl(
  z39.dr(
    z39.sRotLF(
      z39.sRotRF(
        z39.swl(
          o33.p2.conjunction(a46("r"), a46("p")),
          z39.swr(o33.p2.disjunction(a46("p"), a46("r")), i45.i(a46("s")))
        )
      )
    )
  )
);
var ch5composition4 = tutorial({ rules: rules46, goal: goal44, solution: solution44, pinned: pinned44 });

// src/challenges/ch5-composition-5.ts
var { a: a47, o: o34, z: z40, i: i46 } = rk;
var rules47 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "dr",
  "ir"
];
var pinned45 = ["cl", "dr"];
var goal45 = sequent(
  [
    o34.p2.conjunction(
      o34.p2.conjunction(a47("r"), a47("p")),
      o34.p2.disjunction(a47("p"), a47("r"))
    )
  ],
  [
    o34.p2.disjunction(
      o34.p2.conjunction(a47("p"), a47("r")),
      o34.p2.disjunction(a47("r"), a47("p"))
    )
  ]
);
var solution45 = z40.cl(
  z40.dr(
    z40.swl(
      o34.p2.disjunction(a47("p"), a47("r")),
      z40.cl(
        z40.swr(
          o34.p2.conjunction(a47("p"), a47("r")),
          z40.dr(z40.sRotLF(z40.swl(a47("r"), z40.swr(a47("r"), i46.i(a47("p"))))))
        )
      )
    )
  )
);
var ch5composition5 = tutorial({ rules: rules47, goal: goal45, solution: solution45, pinned: pinned45 });

// src/challenges/ch5-composition-6.ts
var { a: a48, o: o35, z: z41, i: i47 } = rk;
var rules48 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "dr",
  "ir"
];
var pinned46 = ["cl", "dr"];
var goal46 = sequent(
  [
    o35.p2.conjunction(
      o35.p2.disjunction(a48("r"), a48("p")),
      o35.p2.disjunction(a48("p"), a48("s"))
    )
  ],
  [
    o35.p2.disjunction(
      o35.p2.disjunction(a48("s"), a48("p")),
      o35.p2.disjunction(a48("r"), a48("p"))
    )
  ]
);
var solution46 = z41.cl(
  z41.dr(
    z41.swl(
      o35.p2.disjunction(a48("p"), a48("s")),
      z41.swr(
        o35.p2.disjunction(a48("s"), a48("p")),
        i47.i(o35.p2.disjunction(a48("r"), a48("p")))
      )
    )
  )
);
var ch5composition6 = tutorial({ rules: rules48, goal: goal46, solution: solution46, pinned: pinned46 });

// src/challenges/ch5-composition-7.ts
var { a: a49, o: o36, z: z42, i: i48 } = rk;
var rules49 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "dr",
  "ir"
];
var pinned47 = ["cl", "dr"];
var goal47 = sequent(
  [
    o36.p2.conjunction(
      o36.p2.conjunction(a49("p"), a49("q")),
      o36.p2.implication(a49("r"), a49("q"))
    )
  ],
  [
    o36.p2.disjunction(
      o36.p2.implication(a49("q"), a49("r")),
      o36.p2.disjunction(a49("p"), a49("q"))
    )
  ]
);
var solution47 = z42.dr(
  z42.ir(
    z42.swr(
      a49("r"),
      z42.dr(
        z42.sRotLF(
          z42.swl(
            o36.p2.conjunction(
              o36.p2.conjunction(a49("p"), a49("q")),
              o36.p2.implication(a49("r"), a49("q"))
            ),
            z42.swr(a49("p"), i48.i(a49("q")))
          )
        )
      )
    )
  )
);
var ch5composition7 = tutorial({ rules: rules49, goal: goal47, solution: solution47, pinned: pinned47 });

// src/challenges/ch5-composition-8.ts
var { a: a50, o: o37, z: z43, i: i49 } = rk;
var rules50 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "dr",
  "ir"
];
var pinned48 = ["cl", "dr"];
var goal48 = conclusion(
  o37.p2.implication(
    o37.p2.conjunction(a50("q"), o37.p1.negation(a50("q"))),
    o37.p2.disjunction(a50("r"), a50("s"))
  )
);
var solution48 = z43.ir(
  z43.cl(z43.nl(z43.sRotRF(z43.swr(o37.p2.disjunction(a50("r"), a50("s")), i49.i(a50("q"))))))
);
var ch5composition8 = tutorial({ rules: rules50, goal: goal48, solution: solution48, pinned: pinned48 });

// src/challenges/ch5-composition-9.ts
var { a: a51, o: o38, z: z44, i: i50 } = rk;
var rules51 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "dr",
  "ir"
];
var pinned49 = ["cl", "dr"];
var goal49 = conclusion(
  o38.p2.implication(
    o38.p2.conjunction(
      o38.p2.conjunction(o38.p1.negation(a51("p")), o38.p1.negation(a51("s"))),
      o38.p2.conjunction(o38.p1.negation(a51("p")), a51("r"))
    ),
    o38.p2.disjunction(
      o38.p2.disjunction(a51("q"), o38.p1.negation(a51("q"))),
      o38.p2.disjunction(a51("s"), o38.p1.negation(a51("r")))
    )
  )
);
var solution49 = z44.ir(
  z44.dr(
    z44.dr(
      z44.sRotRB(
        z44.nr(
          z44.sRotLF(
            z44.swl(
              o38.p2.conjunction(
                o38.p2.conjunction(o38.p1.negation(a51("p")), o38.p1.negation(a51("s"))),
                o38.p2.conjunction(o38.p1.negation(a51("p")), a51("r"))
              ),
              z44.swr(
                o38.p2.disjunction(a51("s"), o38.p1.negation(a51("r"))),
                i50.i(a51("q"))
              )
            )
          )
        )
      )
    )
  )
);
var ch5composition9 = tutorial({ rules: rules51, goal: goal49, solution: solution49, pinned: pinned49 });

// src/challenges/ch5-composition-10.ts
var { a: a52, o: o39, i: i51 } = rk;
var rules52 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "dr",
  "ir"
];
var pinned50 = ["cl", "dr"];
var goal50 = sequent(
  [o39.p2.conjunction(a52("q"), a52("r"))],
  [o39.p2.conjunction(a52("q"), a52("r"))]
);
var solution50 = i51.i(o39.p2.conjunction(a52("q"), a52("r")));
var ch5composition10 = tutorial({ rules: rules52, goal: goal50, solution: solution50, pinned: pinned50 });

// src/challenges/ch5-composition-11.ts
var { a: a53, o: o40, i: i52 } = rk;
var rules53 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "dr",
  "ir"
];
var pinned51 = ["cl", "dr"];
var goal51 = sequent(
  [o40.p2.conjunction(a53("q"), o40.p1.negation(a53("p")))],
  [o40.p2.conjunction(a53("q"), o40.p1.negation(a53("p")))]
);
var solution51 = i52.i(o40.p2.conjunction(a53("q"), o40.p1.negation(a53("p"))));
var ch5composition11 = tutorial({ rules: rules53, goal: goal51, solution: solution51, pinned: pinned51 });

// src/challenges/ch6-branching-1.ts
var { a: a54, o: o41, z: z45, i: i53 } = rk;
var rules54 = [
  "i",
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
  "ir"
];
var pinned52 = ["dl", "cr"];
var goal52 = sequent([o41.p2.disjunction(a54("p"), a54("q"))], [a54("p"), a54("q")]);
var solution52 = z45.dl(
  z45.sRotRF(z45.swr(a54("q"), i53.i(a54("p")))),
  z45.swr(a54("p"), i53.i(a54("q")))
);
var ch6branching1 = tutorial({ rules: rules54, goal: goal52, solution: solution52, pinned: pinned52 });

// src/challenges/ch6-branching-2.ts
var { a: a55, o: o42, z: z46, i: i54 } = rk;
var rules55 = [
  "i",
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
  "ir"
];
var pinned53 = ["dl", "cr"];
var goal53 = sequent([a55("p"), a55("q")], [o42.p2.conjunction(a55("p"), a55("q"))]);
var solution53 = z46.cr(
  z46.swl(a55("q"), i54.i(a55("p"))),
  z46.sRotLF(z46.swl(a55("p"), i54.i(a55("q"))))
);
var ch6branching2 = tutorial({ rules: rules55, goal: goal53, solution: solution53, pinned: pinned53 });

// src/challenges/ch6-branching-3.ts
var { a: a56, o: o43, z: z47, i: i55 } = rk;
var rules56 = [
  "i",
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
  "ir"
];
var pinned54 = ["dl", "cr"];
var goal54 = sequent(
  [o43.p2.disjunction(a56("p"), a56("p"))],
  [o43.p2.conjunction(a56("p"), a56("p"))]
);
var solution54 = z47.dl(
  z47.cr(i55.i(a56("p")), i55.i(a56("p"))),
  z47.cr(i55.i(a56("p")), i55.i(a56("p")))
);
var ch6branching3 = tutorial({ rules: rules56, goal: goal54, solution: solution54, pinned: pinned54 });

// src/challenges/ch6-branching-4.ts
var { a: a57, o: o44, z: z48, i: i56 } = rk;
var rules57 = [
  "i",
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
  "ir"
];
var pinned55 = ["dl", "cr"];
var goal55 = sequent(
  [o44.p2.disjunction(a57("p"), a57("q"))],
  [o44.p2.disjunction(a57("q"), a57("p"))]
);
var solution55 = z48.dr(
  z48.dl(z48.swr(a57("q"), i56.i(a57("p"))), z48.sRotRF(z48.swr(a57("p"), i56.i(a57("q")))))
);
var ch6branching4 = tutorial({ rules: rules57, goal: goal55, solution: solution55, pinned: pinned55 });

// src/challenges/ch6-branching-5.ts
var { a: a58, o: o45, z: z49, i: i57 } = rk;
var rules58 = [
  "i",
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
  "ir"
];
var pinned56 = ["dl", "cr"];
var goal56 = sequent(
  [o45.p2.conjunction(a58("p"), a58("q"))],
  [o45.p2.conjunction(a58("q"), a58("p"))]
);
var solution56 = z49.cl(
  z49.cr(z49.sRotLF(z49.swl(a58("p"), i57.i(a58("q")))), z49.swl(a58("q"), i57.i(a58("p"))))
);
var ch6branching5 = tutorial({ rules: rules58, goal: goal56, solution: solution56, pinned: pinned56 });

// src/challenges/ch6-branching-6.ts
var { a: a59, o: o46, z: z50, i: i58 } = rk;
var rules59 = [
  "i",
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
  "ir"
];
var pinned57 = ["dl", "cr"];
var goal57 = conclusion(
  o46.p2.implication(
    o46.p1.negation(o46.p2.conjunction(a59("p"), a59("q"))),
    o46.p2.disjunction(o46.p1.negation(a59("p")), o46.p1.negation(a59("q")))
  )
);
var solution57 = z50.ir(
  z50.nl(
    z50.cr(
      z50.sRotRF(z50.dr(z50.nr(z50.swr(o46.p1.negation(a59("q")), i58.i(a59("p")))))),
      z50.sRotRF(z50.dr(z50.swr(o46.p1.negation(a59("p")), z50.nr(i58.i(a59("q"))))))
    )
  )
);
var ch6branching6 = tutorial({ rules: rules59, goal: goal57, solution: solution57, pinned: pinned57 });

// src/challenges/ch6-branching-7.ts
var { a: a60, o: o47, z: z51, i: i59 } = rk;
var rules60 = [
  "i",
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
  "ir"
];
var pinned58 = ["dl", "cr"];
var goal58 = conclusion(
  o47.p2.implication(
    o47.p2.disjunction(o47.p1.negation(a60("p")), o47.p1.negation(a60("q"))),
    o47.p1.negation(o47.p2.conjunction(a60("p"), a60("q")))
  )
);
var solution58 = z51.ir(
  z51.nr(
    z51.cl(
      z51.sRotLF(
        z51.dl(
          z51.nl(z51.swl(a60("q"), i59.i(a60("p")))),
          z51.nl(z51.sRotLF(z51.swl(a60("p"), i59.i(a60("q")))))
        )
      )
    )
  )
);
var ch6branching7 = tutorial({ rules: rules60, goal: goal58, solution: solution58, pinned: pinned58 });

// src/challenges/ch6-branching-8.ts
var { a: a61, o: o48, z: z52, i: i60 } = rk;
var rules61 = [
  "i",
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
  "ir"
];
var pinned59 = ["dl", "cr"];
var goal59 = conclusion(
  o48.p2.implication(
    o48.p2.conjunction(a61("p"), o48.p2.disjunction(a61("q"), a61("r"))),
    o48.p2.disjunction(
      o48.p2.conjunction(a61("p"), a61("q")),
      o48.p2.conjunction(a61("p"), a61("r"))
    )
  )
);
var solution59 = z52.ir(
  z52.cl(
    z52.dr(
      z52.dl(
        z52.cr(
          z52.sRotRF(
            z52.swl(a61("q"), z52.swr(o48.p2.conjunction(a61("p"), a61("r")), i60.i(a61("p"))))
          ),
          z52.sRotLF(
            z52.sRotRF(
              z52.swl(
                a61("p"),
                z52.swr(o48.p2.conjunction(a61("p"), a61("r")), i60.i(a61("q")))
              )
            )
          )
        ),
        z52.swr(
          o48.p2.conjunction(a61("p"), a61("q")),
          z52.cr(
            z52.swl(a61("r"), i60.i(a61("p"))),
            z52.sRotLF(z52.swl(a61("p"), i60.i(a61("r"))))
          )
        )
      )
    )
  )
);
var ch6branching8 = tutorial({ rules: rules61, goal: goal59, solution: solution59, pinned: pinned59 });

// src/challenges/ch6-branching-9.ts
var { a: a62, o: o49, z: z53, i: i61 } = rk;
var rules62 = [
  "i",
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
  "ir"
];
var pinned60 = ["dl", "cr"];
var goal60 = conclusion(
  o49.p2.implication(
    o49.p2.disjunction(
      o49.p2.conjunction(a62("p"), a62("q")),
      o49.p2.conjunction(a62("p"), a62("r"))
    ),
    o49.p2.conjunction(a62("p"), o49.p2.disjunction(a62("q"), a62("r")))
  )
);
var solution60 = z53.ir(
  z53.dl(
    z53.cl(
      z53.cr(
        z53.swl(a62("q"), i61.i(a62("p"))),
        z53.dr(z53.sRotLF(z53.sRotRF(z53.swl(a62("p"), z53.swr(a62("r"), i61.i(a62("q")))))))
      )
    ),
    z53.cl(
      z53.cr(
        z53.swl(a62("r"), i61.i(a62("p"))),
        z53.dr(z53.sRotLF(z53.swl(a62("p"), z53.swr(a62("q"), i61.i(a62("r"))))))
      )
    )
  )
);
var ch6branching9 = tutorial({ rules: rules62, goal: goal60, solution: solution60, pinned: pinned60 });

// src/challenges/ch6-branching-10.ts
var { a: a63, o: o50, i: i62 } = rk;
var rules63 = [
  "i",
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
  "ir"
];
var pinned61 = ["dl", "cr"];
var goal61 = sequent(
  [o50.p2.disjunction(a63("r"), a63("s"))],
  [o50.p2.disjunction(a63("r"), a63("s"))]
);
var solution61 = i62.i(o50.p2.disjunction(a63("r"), a63("s")));
var ch6branching10 = tutorial({ rules: rules63, goal: goal61, solution: solution61, pinned: pinned61 });

// src/challenges/ch7-completeness-1.ts
var { a: a64, o: o51, z: z54, i: i63 } = rk;
var rules64 = [
  "i",
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
];
var pinned62 = ["il"];
var goal62 = sequent([a64("p"), o51.p2.implication(a64("p"), a64("q"))], [a64("q")]);
var solution62 = z54.il(
  z54.sRotRF(z54.swr(a64("q"), i63.i(a64("p")))),
  z54.sRotLF(z54.swl(a64("p"), i63.i(a64("q"))))
);
var ch7completeness1 = tutorial({ rules: rules64, goal: goal62, solution: solution62, pinned: pinned62 });

// src/challenges/ch7-completeness-2.ts
var { a: a65, o: o52, z: z55, i: i64 } = rk;
var rules65 = [
  "i",
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
];
var pinned63 = ["il"];
var goal63 = conclusion(
  o52.p2.implication(
    o52.p2.implication(a65("p"), a65("q")),
    o52.p2.implication(o52.p1.negation(a65("q")), o52.p1.negation(a65("p")))
  )
);
var solution63 = z55.ir(
  z55.ir(
    z55.sRotLF(
      z55.il(
        z55.sRotRF(z55.nr(z55.sRotLF(z55.swl(o52.p1.negation(a65("q")), i64.i(a65("p")))))),
        z55.sRotLF(z55.nl(z55.sRotRF(z55.swr(o52.p1.negation(a65("p")), i64.i(a65("q"))))))
      )
    )
  )
);
var ch7completeness2 = tutorial({ rules: rules65, goal: goal63, solution: solution63, pinned: pinned63 });

// src/challenges/ch7-completeness-3.ts
var { a: a66, o: o53, z: z56, i: i65 } = rk;
var rules66 = [
  "i",
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
];
var pinned64 = ["il"];
var goal64 = conclusion(
  o53.p2.implication(
    o53.p2.implication(a66("p"), a66("q")),
    o53.p2.implication(
      o53.p2.implication(a66("q"), a66("r")),
      o53.p2.implication(a66("p"), a66("r"))
    )
  )
);
var solution64 = z56.ir(
  z56.ir(
    z56.ir(
      z56.sRotLF(
        z56.il(
          z56.sRotLF(
            z56.il(
              z56.sRotRF(z56.swr(a66("r"), z56.swr(a66("q"), i65.i(a66("p"))))),
              z56.sRotLF(z56.swl(a66("p"), z56.swr(a66("p"), i65.i(a66("r")))))
            )
          ),
          z56.sRotLF(
            z56.il(
              z56.sRotLF(z56.sRotRF(z56.swl(a66("p"), z56.swr(a66("r"), i65.i(a66("q")))))),
              z56.sRotLB(z56.swl(a66("q"), z56.swl(a66("p"), i65.i(a66("r")))))
            )
          )
        )
      )
    )
  )
);
var ch7completeness3 = tutorial({ rules: rules66, goal: goal64, solution: solution64, pinned: pinned64 });

// src/challenges/ch7-completeness-4.ts
var { a: a67, o: o54, z: z57, i: i66 } = rk;
var rules67 = [
  "i",
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
];
var pinned65 = ["il"];
var goal65 = conclusion(
  o54.p2.implication(
    o54.p2.implication(o54.p2.conjunction(a67("p"), a67("q")), a67("r")),
    o54.p2.implication(a67("p"), o54.p2.implication(a67("q"), a67("r")))
  )
);
var solution65 = z57.ir(
  z57.ir(
    z57.ir(
      z57.sRotLF(
        z57.il(
          z57.cr(
            z57.sRotRF(z57.swl(a67("q"), z57.swr(a67("r"), i66.i(a67("p"))))),
            z57.sRotLF(z57.sRotRF(z57.swl(a67("p"), z57.swr(a67("r"), i66.i(a67("q"))))))
          ),
          z57.sRotLB(z57.swl(a67("q"), z57.swl(a67("p"), i66.i(a67("r")))))
        )
      )
    )
  )
);
var ch7completeness4 = tutorial({ rules: rules67, goal: goal65, solution: solution65, pinned: pinned65 });

// src/challenges/ch7-completeness-5.ts
var { a: a68, o: o55, z: z58, i: i67 } = rk;
var rules68 = [
  "i",
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
];
var pinned66 = ["il"];
var goal66 = conclusion(
  o55.p2.implication(
    o55.p2.implication(o55.p2.implication(a68("p"), a68("q")), a68("p")),
    a68("p")
  )
);
var solution66 = z58.ir(z58.il(z58.ir(z58.swr(a68("q"), i67.i(a68("p")))), i67.i(a68("p"))));
var ch7completeness5 = tutorial({ rules: rules68, goal: goal66, solution: solution66, pinned: pinned66 });

// src/challenges/ch7-completeness-6.ts
var { a: a69, o: o56, z: z59, i: i68 } = rk;
var rules69 = [
  "i",
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
];
var pinned67 = ["il"];
var goal67 = conclusion(
  o56.p2.implication(
    o56.p2.implication(a69("p"), a69("q")),
    o56.p2.implication(
      o56.p2.implication(a69("p"), o56.p1.negation(a69("q"))),
      o56.p1.negation(a69("p"))
    )
  )
);
var solution67 = z59.ir(
  z59.ir(
    z59.il(
      z59.il(
        z59.sRotRF(z59.nr(z59.swr(a69("p"), i68.i(a69("p"))))),
        z59.sRotRF(z59.nr(z59.sRotLF(z59.swl(a69("q"), i68.i(a69("p"))))))
      ),
      z59.sRotLF(
        z59.il(
          z59.sRotRF(z59.nr(z59.sRotLF(z59.swl(o56.p1.negation(a69("q")), i68.i(a69("p")))))),
          z59.sRotLF(z59.nl(z59.sRotRF(z59.swr(o56.p1.negation(a69("p")), i68.i(a69("q"))))))
        )
      )
    )
  )
);
var ch7completeness6 = tutorial({ rules: rules69, goal: goal67, solution: solution67, pinned: pinned67 });

// src/challenges/ch7-completeness-7.ts
var { a: a70, o: o57, z: z60, i: i69 } = rk;
var rules70 = [
  "i",
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
];
var pinned68 = ["il"];
var goal68 = conclusion(
  o57.p2.implication(
    o57.p2.implication(a70("p"), o57.p2.implication(a70("p"), a70("q"))),
    o57.p2.implication(a70("p"), a70("q"))
  )
);
var solution68 = z60.ir(
  z60.il(
    z60.sRotRF(z60.ir(z60.swr(a70("q"), i69.i(a70("p"))))),
    i69.i(o57.p2.implication(a70("p"), a70("q")))
  )
);
var ch7completeness7 = tutorial({ rules: rules70, goal: goal68, solution: solution68, pinned: pinned68 });

// src/challenges/ch7-completeness-8.ts
var { a: a71, o: o58, z: z61, i: i70 } = rk;
var rules71 = [
  "i",
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
];
var pinned69 = ["il"];
var goal69 = conclusion(
  o58.p2.implication(
    o58.p2.implication(o58.p2.implication(a71("p"), a71("q")), a71("q")),
    o58.p2.implication(o58.p2.implication(a71("q"), a71("p")), a71("p"))
  )
);
var solution69 = z61.ir(
  z61.ir(
    z61.sRotLF(
      z61.il(
        z61.ir(
          z61.sRotLF(
            z61.swl(o58.p2.implication(a71("q"), a71("p")), z61.swr(a71("q"), i70.i(a71("p"))))
          )
        ),
        z61.sRotLF(
          z61.il(
            z61.sRotRF(z61.swr(a71("p"), i70.i(a71("q")))),
            z61.sRotLF(z61.swl(a71("q"), i70.i(a71("p"))))
          )
        )
      )
    )
  )
);
var ch7completeness8 = tutorial({ rules: rules71, goal: goal69, solution: solution69, pinned: pinned69 });

// src/challenges/ch7-completeness-9.ts
var { a: a72, o: o59, z: z62, i: i71 } = rk;
var rules72 = [
  "i",
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
];
var pinned70 = ["il"];
var goal70 = conclusion(
  o59.p2.implication(
    o59.p2.implication(a72("p"), o59.p2.implication(a72("q"), a72("r"))),
    o59.p2.implication(o59.p2.conjunction(a72("p"), a72("q")), a72("r"))
  )
);
var solution70 = z62.ir(
  z62.ir(
    z62.cl(
      z62.sRotLF(
        z62.il(
          z62.sRotRF(z62.swl(a72("q"), z62.swr(a72("r"), i71.i(a72("p"))))),
          z62.il(
            z62.sRotLF(z62.sRotRF(z62.swl(a72("p"), z62.swr(a72("r"), i71.i(a72("q")))))),
            z62.sRotLB(z62.swl(a72("q"), z62.swl(a72("p"), i71.i(a72("r")))))
          )
        )
      )
    )
  )
);
var ch7completeness9 = tutorial({ rules: rules72, goal: goal70, solution: solution70, pinned: pinned70 });

// src/challenges/ch7-completeness-10.ts
var { a: a73, o: o60, i: i72 } = rk;
var rules73 = [
  "i",
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
];
var pinned71 = ["il"];
var goal71 = sequent(
  [
    o60.p2.implication(
      o60.p2.disjunction(a73("p"), a73("q")),
      o60.p2.conjunction(a73("p"), a73("q"))
    )
  ],
  [
    o60.p2.implication(
      o60.p2.disjunction(a73("p"), a73("q")),
      o60.p2.conjunction(a73("p"), a73("q"))
    )
  ]
);
var solution71 = i72.i(
  o60.p2.implication(
    o60.p2.disjunction(a73("p"), a73("q")),
    o60.p2.conjunction(a73("p"), a73("q"))
  )
);
var ch7completeness10 = tutorial({ rules: rules73, goal: goal71, solution: solution71, pinned: pinned71 });

// src/challenges/ch7-completeness-11.ts
var { a: a74, o: o61, i: i73 } = rk;
var rules74 = [
  "i",
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
];
var pinned72 = ["il"];
var goal72 = sequent(
  [
    o61.p2.implication(
      o61.p2.disjunction(a74("p"), o61.p1.negation(a74("q"))),
      o61.p1.negation(o61.p2.conjunction(a74("r"), a74("s")))
    )
  ],
  [
    o61.p2.implication(
      o61.p2.disjunction(a74("p"), o61.p1.negation(a74("q"))),
      o61.p1.negation(o61.p2.conjunction(a74("r"), a74("s")))
    )
  ]
);
var solution72 = i73.i(
  o61.p2.implication(
    o61.p2.disjunction(a74("p"), o61.p1.negation(a74("q"))),
    o61.p1.negation(o61.p2.conjunction(a74("r"), a74("s")))
  )
);
var ch7completeness11 = tutorial({ rules: rules74, goal: goal72, solution: solution72, pinned: pinned72 });

// src/challenges/ch8-constants-1.ts
var { a: a75, o: o62, z: z63, i: i74 } = rk;
var rules75 = [
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
];
var pinned73 = ["f", "v"];
var goal73 = sequent([a75("p"), o62.p0.verum, a75("q")], [a75("r"), o62.p0.verum, a75("s")]);
var solution73 = z63.sRotRF(
  z63.swl(
    a75("q"),
    z63.swl(o62.p0.verum, z63.swl(a75("p"), z63.swr(a75("s"), z63.swr(a75("r"), i74.v()))))
  )
);
var ch8constants1 = tutorial({ rules: rules75, goal: goal73, solution: solution73, pinned: pinned73 });

// src/challenges/ch8-constants-2.ts
var { a: a76, o: o63, z: z64, i: i75 } = rk;
var rules76 = [
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
];
var pinned74 = ["f", "v"];
var goal74 = sequent(
  [a76("s"), o63.p0.falsum, a76("r")],
  [a76("q"), o63.p0.falsum, a76("p")]
);
var solution74 = z64.sRotLF(
  z64.swl(
    a76("s"),
    z64.swl(a76("r"), z64.swr(a76("q"), z64.swr(o63.p0.falsum, z64.swr(a76("p"), i75.f()))))
  )
);
var ch8constants2 = tutorial({ rules: rules76, goal: goal74, solution: solution74, pinned: pinned74 });

// src/challenges/ch8-constants-3.ts
var { a: a77, o: o64, z: z65, i: i76 } = rk;
var rules77 = [
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
];
var pinned75 = ["f", "v"];
var goal75 = sequent([a77("s"), a77("p"), a77("s")], [a77("r"), o64.p0.verum, a77("r")]);
var solution75 = z65.sRotRF(
  z65.swl(
    a77("s"),
    z65.swl(a77("p"), z65.swl(a77("s"), z65.swr(a77("r"), z65.swr(a77("r"), i76.v()))))
  )
);
var ch8constants3 = tutorial({ rules: rules77, goal: goal75, solution: solution75, pinned: pinned75 });

// src/challenges/ch8-constants-4.ts
var { a: a78, o: o65, z: z66, i: i77 } = rk;
var rules78 = [
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
];
var pinned76 = ["f", "v"];
var goal76 = sequent([a78("s"), o65.p0.falsum, a78("s")], [a78("r"), a78("p"), a78("r")]);
var solution76 = z66.sRotLF(
  z66.swl(
    a78("s"),
    z66.swl(a78("s"), z66.swr(a78("r"), z66.swr(a78("p"), z66.swr(a78("r"), i77.f()))))
  )
);
var ch8constants4 = tutorial({ rules: rules78, goal: goal76, solution: solution76, pinned: pinned76 });

// src/challenges/ch8-constants-5.ts
var { a: a79, o: o66, z: z67, i: i78 } = rk;
var pinned77 = ["f", "v"];
var goal77 = conclusion(
  o66.p2.implication(
    o66.p2.implication(a79("p"), o66.p2.implication(a79("q"), o66.p1.negation(a79("p")))),
    o66.p2.implication(a79("p"), o66.p0.verum)
  )
);
var solution77 = z67.ir(
  z67.ir(
    z67.swl(
      a79("p"),
      z67.swl(
        o66.p2.implication(
          a79("p"),
          o66.p2.implication(a79("q"), o66.p1.negation(a79("p")))
        ),
        i78.v()
      )
    )
  )
);
var ch8constants5 = tutorial({ rules: rules2, goal: goal77, solution: solution77, pinned: pinned77 });

// src/challenges/ch8-constants-6.ts
var { a: a80, o: o67, z: z68, i: i79 } = rk;
var pinned78 = ["f", "v"];
var goal78 = conclusion(
  o67.p2.implication(
    o67.p1.negation(o67.p1.negation(o67.p0.falsum)),
    o67.p1.negation(o67.p1.negation(o67.p1.negation(o67.p1.negation(a80("s")))))
  )
);
var solution78 = z68.ir(
  z68.nl(
    z68.nr(
      z68.swr(
        o67.p1.negation(o67.p1.negation(o67.p1.negation(o67.p1.negation(a80("s"))))),
        i79.f()
      )
    )
  )
);
var ch8constants6 = tutorial({ rules: rules2, goal: goal78, solution: solution78, pinned: pinned78 });

// src/challenges/ch8-constants-7.ts
var { a: a81, o: o68, z: z69, i: i80 } = rk;
var pinned79 = ["f", "v"];
var goal79 = sequent(
  [o68.p2.disjunction(o68.p0.falsum, a81("p"))],
  [o68.p2.conjunction(o68.p0.verum, a81("p"))]
);
var solution79 = z69.dl(
  z69.swr(o68.p2.conjunction(o68.p0.verum, a81("p")), i80.f()),
  z69.cr(z69.swl(a81("p"), i80.v()), i80.i(a81("p")))
);
var ch8constants7 = tutorial({ rules: rules2, goal: goal79, solution: solution79, pinned: pinned79 });

// src/challenges/ch8-constants-8.ts
var { a: a82, o: o69, z: z70, i: i81 } = rk;
var pinned80 = ["f", "v"];
var goal80 = conclusion(
  o69.p2.implication(
    o69.p2.implication(a82("p"), a82("q")),
    o69.p2.implication(
      o69.p2.implication(a82("q"), o69.p0.falsum),
      o69.p2.implication(a82("p"), a82("r"))
    )
  )
);
var solution80 = z70.ir(
  z70.ir(
    z70.sRotLF(
      z70.il(
        z70.sRotRF(
          z70.ir(
            z70.sRotLF(
              z70.swl(
                o69.p2.implication(a82("q"), o69.p0.falsum),
                z70.swr(a82("r"), i81.i(a82("p")))
              )
            )
          )
        ),
        z70.sRotLF(
          z70.il(
            z70.sRotRF(z70.swr(o69.p2.implication(a82("p"), a82("r")), i81.i(a82("q")))),
            z70.sRotLF(
              z70.swl(a82("q"), z70.swr(o69.p2.implication(a82("p"), a82("r")), i81.f()))
            )
          )
        )
      )
    )
  )
);
var ch8constants8 = tutorial({ rules: rules2, goal: goal80, solution: solution80, pinned: pinned80 });

// src/challenges/ch8-constants-9.ts
var { a: a83, o: o70, z: z71, i: i82 } = rk;
var pinned81 = ["f", "v"];
var goal81 = sequent(
  [
    o70.p2.conjunction(
      o70.p2.conjunction(a83("r"), a83("q")),
      o70.p2.implication(a83("s"), o70.p1.negation(o70.p0.verum))
    )
  ],
  [
    o70.p2.disjunction(
      o70.p2.implication(a83("s"), o70.p2.implication(a83("q"), a83("r"))),
      o70.p0.falsum
    )
  ]
);
var solution81 = z71.cl(
  z71.dr(
    z71.il(
      z71.sRotRB(
        z71.ir(
          z71.sRotLF(
            z71.swl(
              o70.p2.conjunction(a83("r"), a83("q")),
              z71.swr(
                o70.p2.implication(a83("q"), a83("r")),
                z71.swr(o70.p0.falsum, i82.i(a83("s")))
              )
            )
          )
        )
      ),
      z71.nl(
        z71.sRotRB(
          z71.swl(
            o70.p2.conjunction(a83("r"), a83("q")),
            z71.swr(
              o70.p2.implication(a83("s"), o70.p2.implication(a83("q"), a83("r"))),
              z71.swr(o70.p0.falsum, i82.v())
            )
          )
        )
      )
    )
  )
);
var ch8constants9 = tutorial({ rules: rules2, goal: goal81, solution: solution81, pinned: pinned81 });

// src/challenges/ch9-consolidation-1.ts
var { a: a84, o: o71, z: z72, i: i83 } = rk;
var goal82 = conclusion(
  o71.p2.disjunction(
    o71.p2.disjunction(a84("r"), a84("s")),
    o71.p2.implication(
      o71.p2.conjunction(
        o71.p2.implication(a84("q"), a84("r")),
        o71.p2.conjunction(a84("p"), a84("q"))
      ),
      o71.p2.implication(a84("q"), a84("r"))
    )
  )
);
var solution82 = z72.dr(
  z72.swr(
    o71.p2.disjunction(a84("r"), a84("s")),
    z72.ir(
      z72.cl(
        z72.swl(
          o71.p2.conjunction(a84("p"), a84("q")),
          i83.i(o71.p2.implication(a84("q"), a84("r")))
        )
      )
    )
  )
);
var ch9consolidation1 = challenge({ rules: rules2, goal: goal82, solution: solution82 });

// src/challenges/ch9-consolidation-2.ts
var { a: a85, o: o72, z: z73, i: i84 } = rk;
var goal83 = conclusion(
  o72.p2.implication(
    a85("p"),
    o72.p2.implication(
      o72.p1.negation(o72.p2.disjunction(a85("p"), a85("q"))),
      o72.p2.implication(a85("q"), a85("r"))
    )
  )
);
var solution83 = z73.ir(
  z73.ir(
    z73.nl(
      z73.dr(
        z73.sRotRB(
          z73.swr(a85("q"), z73.swr(o72.p2.implication(a85("q"), a85("r")), i84.i(a85("p"))))
        )
      )
    )
  )
);
var ch9consolidation2 = challenge({ rules: rules2, goal: goal83, solution: solution83 });

// src/challenges/ch9-consolidation-3.ts
var { a: a86, o: o73, z: z74, i: i85 } = rk;
var goal84 = conclusion(
  o73.p2.implication(
    o73.p2.conjunction(
      o73.p2.implication(a86("p"), a86("q")),
      o73.p2.disjunction(o73.p1.negation(a86("q")), a86("r"))
    ),
    o73.p2.disjunction(o73.p1.negation(a86("p")), a86("r"))
  )
);
var solution84 = z74.ir(
  z74.cl(
    z74.sRotLF(
      z74.il(
        z74.sRotRF(
          z74.dr(
            z74.nr(
              z74.sRotLF(
                z74.swl(
                  o73.p2.disjunction(o73.p1.negation(a86("q")), a86("r")),
                  z74.swr(a86("r"), i85.i(a86("p")))
                )
              )
            )
          )
        ),
        z74.sRotLF(
          z74.dl(
            z74.nl(
              z74.sRotRF(
                z74.swr(
                  o73.p2.disjunction(o73.p1.negation(a86("p")), a86("r")),
                  i85.i(a86("q"))
                )
              )
            ),
            z74.dr(
              z74.sRotLF(
                z74.swl(a86("q"), z74.swr(o73.p1.negation(a86("p")), i85.i(a86("r"))))
              )
            )
          )
        )
      )
    )
  )
);
var ch9consolidation3 = challenge({ rules: rules2, goal: goal84, solution: solution84 });

// src/challenges/ch9-consolidation-4.ts
var { a: a87, o: o74, z: z75, i: i86 } = rk;
var goal85 = conclusion(o74.p2.disjunction(a87("p"), o74.p1.negation(a87("p"))));
var solution85 = z75.dr(z75.sRotRF(z75.nr(i86.i(a87("p")))));
var ch9consolidation4 = challenge({ rules: rules2, goal: goal85, solution: solution85 });

// src/challenges/ch9-consolidation-5.ts
var { a: a88, o: o75, z: z76, i: i87 } = rk;
var goal86 = conclusion(
  o75.p2.implication(
    o75.p2.implication(a88("p"), o75.p2.implication(a88("q"), a88("r"))),
    o75.p2.implication(a88("q"), o75.p2.implication(a88("p"), a88("r")))
  )
);
var solution86 = z76.ir(
  z76.ir(
    z76.ir(
      z76.sRotLF(
        z76.il(
          z76.sRotLF(z76.sRotRF(z76.swl(a88("q"), z76.swr(a88("r"), i87.i(a88("p")))))),
          z76.il(
            z76.sRotRF(z76.swl(a88("p"), z76.swr(a88("r"), i87.i(a88("q"))))),
            z76.sRotLB(z76.swl(a88("p"), z76.swl(a88("q"), i87.i(a88("r")))))
          )
        )
      )
    )
  )
);
var ch9consolidation5 = challenge({ rules: rules2, goal: goal86, solution: solution86 });

// src/challenges/ch9-consolidation-6.ts
var { a: a89, o: o76, z: z77, i: i88 } = rk;
var goal87 = conclusion(
  o76.p2.implication(
    o76.p2.implication(a89("p"), a89("r")),
    o76.p2.implication(
      o76.p2.implication(a89("q"), a89("r")),
      o76.p2.implication(o76.p2.disjunction(a89("p"), a89("q")), a89("r"))
    )
  )
);
var solution87 = z77.ir(
  z77.ir(
    z77.ir(
      z77.dl(
        z77.sRotLF(
          z77.il(
            z77.sRotLF(
              z77.sRotRF(
                z77.swl(
                  o76.p2.implication(a89("q"), a89("r")),
                  z77.swr(a89("r"), i88.i(a89("p")))
                )
              )
            ),
            z77.sRotLB(
              z77.swl(
                a89("p"),
                z77.swl(o76.p2.implication(a89("q"), a89("r")), i88.i(a89("r")))
              )
            )
          )
        ),
        z77.sRotLB(
          z77.il(
            z77.sRotRF(
              z77.swl(
                o76.p2.implication(a89("p"), a89("r")),
                z77.swr(a89("r"), i88.i(a89("q")))
              )
            ),
            z77.sRotLB(
              z77.swl(
                o76.p2.implication(a89("p"), a89("r")),
                z77.swl(a89("q"), i88.i(a89("r")))
              )
            )
          )
        )
      )
    )
  )
);
var ch9consolidation6 = challenge({ rules: rules2, goal: goal87, solution: solution87 });

// src/challenges/ch9-consolidation-7.ts
var { a: a90, o: o77, z: z78, i: i89 } = rk;
var goal88 = conclusion(
  o77.p2.disjunction(
    o77.p2.implication(a90("r"), a90("p")),
    o77.p2.conjunction(
      o77.p2.conjunction(
        a90("r"),
        o77.p2.conjunction(
          a90("r"),
          o77.p2.disjunction(
            o77.p2.conjunction(a90("r"), o77.p2.implication(a90("s"), a90("p"))),
            o77.p2.disjunction(a90("r"), a90("p"))
          )
        )
      ),
      o77.p2.implication(o77.p0.falsum, a90("q"))
    )
  )
);
var solution88 = z78.dr(
  z78.ir(
    z78.swr(
      a90("p"),
      z78.cr(
        z78.cr(
          i89.i(a90("r")),
          z78.cr(
            i89.i(a90("r")),
            z78.dr(
              z78.swr(
                o77.p2.conjunction(a90("r"), o77.p2.implication(a90("s"), a90("p"))),
                z78.dr(z78.sRotRF(z78.swr(a90("p"), i89.i(a90("r")))))
              )
            )
          )
        ),
        z78.ir(z78.sRotLF(z78.swl(a90("r"), z78.swr(a90("q"), i89.f()))))
      )
    )
  )
);
var ch9consolidation7 = challenge({ rules: rules2, goal: goal88, solution: solution88 });

// src/challenges/index.ts
var challenges = {
  ch0identity1,
  ch0identity2,
  ch1weakening1,
  ch1weakening2,
  ch1weakening3,
  ch1weakening4,
  ch1weakening5,
  ch1weakening6,
  ch1weakening7,
  ch1weakening8,
  ch1weakening9,
  ch2permutation1,
  ch2permutation2,
  ch2permutation3,
  ch2permutation4,
  ch2permutation5,
  ch2permutation6,
  ch2permutation7,
  ch2permutation8,
  ch2permutation9,
  ch3negation1,
  ch3negation2,
  ch3negation3,
  ch3negation4,
  ch3negation5,
  ch3negation6,
  ch3negation7,
  ch3negation8,
  ch3negation9,
  ch3negation10,
  ch4theorem1,
  ch4theorem2,
  ch4theorem3,
  ch4theorem4,
  ch4theorem5,
  ch4theorem6,
  ch4theorem7,
  ch4theorem8,
  ch4theorem9,
  ch4theorem10,
  ch5composition1,
  ch5composition2,
  ch5composition3,
  ch5composition4,
  ch5composition5,
  ch5composition6,
  ch5composition7,
  ch5composition8,
  ch5composition9,
  ch5composition10,
  ch5composition11,
  ch6branching1,
  ch6branching2,
  ch6branching3,
  ch6branching4,
  ch6branching5,
  ch6branching6,
  ch6branching7,
  ch6branching8,
  ch6branching9,
  ch6branching10,
  ch7completeness1,
  ch7completeness2,
  ch7completeness3,
  ch7completeness4,
  ch7completeness5,
  ch7completeness6,
  ch7completeness7,
  ch7completeness8,
  ch7completeness9,
  ch7completeness10,
  ch7completeness11,
  ch8constants1,
  ch8constants2,
  ch8constants3,
  ch8constants4,
  ch8constants5,
  ch8constants6,
  ch8constants7,
  ch8constants8,
  ch8constants9,
  ch9consolidation1,
  ch9consolidation2,
  ch9consolidation3,
  ch9consolidation4,
  ch9consolidation5,
  ch9consolidation6,
  ch9consolidation7
  // ch5compositionC,
  // ch5compositionE,
};

// src/web/i18n.ts
var en = {
  title: "LK",
  random: "Random",
  campaign: "Campaign",
  menu: "Menu",
  undo: "Undo",
  level: "Level",
  paused: "Paused",
  resumeGame: "Resume Game",
  resetChallenge: "Reset Challenge",
  freshChallenge: "Fresh Challenge",
  changeSettings: "Change Settings",
  exitToMainMenu: "Exit to Main Menu",
  left: "Left",
  right: "Right",
  drop: "Drop",
  destruct: "Destruct",
  rules: "Rules",
  axiom: "Axiom",
  playAgain: "Play Again",
  playAgainShort: "Again",
  newChallenge: "New Challenge",
  prevLevel: "Prev Level",
  prevLevelShort: "Prev",
  nextLevel: "Next Level",
  nextLevelShort: "Next",
  congratulations: "\u{1F389} Conglaturations! \u{1F389}",
  systems: "Systems",
  backToSystems: "\u2190 Systems",
  sideLeft: "L",
  sideRight: "R",
  randomConfig: "Random",
  formulaShape: "Settings",
  size: "Formula Length",
  connectives: "Connectives",
  symbols: "Symbols",
  negationWeight: "Negation",
  implicationWeight: "Implication",
  conjunctionWeight: "Conjunction",
  disjunctionWeight: "Disjunction",
  filter: "Parameters",
  bypassPercent: "Chaoticity (\u{1F480}%)",
  targetNonStructural: "Solution Size",
  start: "Start",
  back: "Back",
  preview: "Preview",
  score: "Score",
  par: "Par",
  statsTemplate: "Generated {formulas} formulas ({rate}/s), {tautologies} tautologies, {solved} solved. Updated {sinceUpdate}s ago."
};
var fi = {
  title: "LK",
  random: "Satunnainen",
  campaign: "Kampanja",
  menu: "Valikko",
  undo: "Kumoa",
  level: "Taso",
  paused: "Pys\xE4ytetty",
  resumeGame: "Jatka peli\xE4",
  resetChallenge: "Aloita alusta",
  freshChallenge: "Uusi haaste",
  changeSettings: "Muuta asetuksia",
  exitToMainMenu: "P\xE4\xE4valikkoon",
  left: "Vasen",
  right: "Oikea",
  drop: "Pudota",
  destruct: "Pura",
  rules: "S\xE4\xE4nn\xF6t",
  axiom: "Aksiooma",
  playAgain: "Pelaa uudestaan",
  playAgainShort: "Uudestaan",
  newChallenge: "Uusi haaste",
  prevLevel: "Edellinen",
  prevLevelShort: "Edellinen",
  nextLevel: "Seuraava",
  nextLevelShort: "Seuraava",
  congratulations: "\u{1F389} Oneski olkoon! \u{1F389}",
  systems: "J\xE4rjestelm\xE4t",
  backToSystems: "\u2190 J\xE4rjestelm\xE4t",
  sideLeft: "V",
  sideRight: "O",
  randomConfig: "Satunnainen",
  formulaShape: "Asetukset",
  size: "Kaavan pituus",
  connectives: "Konnektiivit",
  symbols: "Symbolit",
  negationWeight: "Negaatio",
  implicationWeight: "Implikaatio",
  conjunctionWeight: "Konjunktio",
  disjunctionWeight: "Disjunktio",
  filter: "Parametrit",
  bypassPercent: "Kaoottisuus (\u{1F480}%)",
  targetNonStructural: "Ratkaisun koko",
  start: "Aloita",
  back: "Takaisin",
  preview: "Esikatselu",
  score: "Pisteet",
  par: "Par",
  statsTemplate: "Tuotettu {formulas} kaavaa ({rate}/s), {tautologies} tautologiaa, {solved} ratkaisua. P\xE4ivitetty {sinceUpdate}s sitten."
};
var es = {
  title: "LK",
  random: "Aleatorio",
  campaign: "Campa\xF1a",
  menu: "Men\xFA",
  undo: "Deshacer",
  level: "Nivel",
  paused: "Pausado",
  resumeGame: "Reanudar juego",
  resetChallenge: "Reiniciar desaf\xEDo",
  freshChallenge: "Nuevo desaf\xEDo",
  changeSettings: "Cambiar ajustes",
  exitToMainMenu: "Salir al men\xFA principal",
  left: "Izquierda",
  right: "Derecha",
  drop: "Soltar",
  destruct: "Destruir",
  rules: "Reglas",
  axiom: "Axioma",
  playAgain: "Jugar de nuevo",
  playAgainShort: "De nuevo",
  newChallenge: "Nuevo desaf\xEDo",
  prevLevel: "Nivel anterior",
  prevLevelShort: "Anterior",
  nextLevel: "Siguiente nivel",
  nextLevelShort: "Siguiente",
  congratulations: "\u{1F389} \xA1Felicidades! \u{1F389}",
  systems: "Sistemas",
  backToSystems: "\u2190 Sistemas",
  sideLeft: "I",
  sideRight: "D",
  randomConfig: "Aleatorio",
  formulaShape: "Ajustes",
  size: "Longitud de f\xF3rmula",
  connectives: "Conectivos",
  symbols: "S\xEDmbolos",
  negationWeight: "Negaci\xF3n",
  implicationWeight: "Implicaci\xF3n",
  conjunctionWeight: "Conjunci\xF3n",
  disjunctionWeight: "Disyunci\xF3n",
  filter: "Par\xE1metros",
  bypassPercent: "Caoticidad (\u{1F480}%)",
  targetNonStructural: "Tama\xF1o de soluci\xF3n",
  start: "Comenzar",
  back: "Atr\xE1s",
  preview: "Vista previa",
  score: "Puntuaci\xF3n",
  par: "Par",
  statsTemplate: "Generadas {formulas} f\xF3rmulas ({rate}/s), {tautologies} tautolog\xEDas, {solved} resueltas. Actualizado hace {sinceUpdate}s."
};
var cs = {
  title: "LK",
  random: "N\xE1hodn\xE9",
  campaign: "Kampa\u0148",
  menu: "Menu",
  undo: "Zp\u011Bt",
  level: "\xDArove\u0148",
  paused: "Pozastaveno",
  resumeGame: "Pokra\u010Dovat",
  resetChallenge: "Restartovat v\xFDzvu",
  freshChallenge: "Nov\xE1 v\xFDzva",
  changeSettings: "Zm\u011Bnit nastaven\xED",
  exitToMainMenu: "Zp\u011Bt do hlavn\xEDho menu",
  left: "Vlevo",
  right: "Vpravo",
  drop: "Pustit",
  destruct: "Zni\u010Dit",
  rules: "Pravidla",
  axiom: "Axiom",
  playAgain: "Hr\xE1t znovu",
  playAgainShort: "Znovu",
  newChallenge: "Nov\xE1 v\xFDzva",
  prevLevel: "P\u0159edchoz\xED \xFArove\u0148",
  prevLevelShort: "P\u0159edchoz\xED",
  nextLevel: "Dal\u0161\xED \xFArove\u0148",
  nextLevelShort: "Dal\u0161\xED",
  congratulations: "\u{1F389} Gratulujeme! \u{1F389}",
  systems: "Syst\xE9my",
  backToSystems: "\u2190 Syst\xE9my",
  sideLeft: "L",
  sideRight: "P",
  randomConfig: "N\xE1hodn\xE9",
  formulaShape: "Nastaven\xED",
  size: "D\xE9lka formule",
  connectives: "Spojky",
  symbols: "Symboly",
  negationWeight: "Negace",
  implicationWeight: "Implikace",
  conjunctionWeight: "Konjunkce",
  disjunctionWeight: "Disjunkce",
  filter: "Parametry",
  bypassPercent: "Chaos (\u{1F480}%)",
  targetNonStructural: "Velikost \u0159e\u0161en\xED",
  start: "Start",
  back: "Zp\u011Bt",
  preview: "N\xE1hled",
  score: "Sk\xF3re",
  par: "Par",
  statsTemplate: "Vygenerov\xE1no {formulas} formul\xED ({rate}/s), {tautologies} tautologi\xED, {solved} vy\u0159e\u0161eno. Aktualizov\xE1no p\u0159ed {sinceUpdate}s."
};
var pl = {
  title: "LK",
  random: "Losowe",
  campaign: "Kampania",
  menu: "Menu",
  undo: "Cofnij",
  level: "Poziom",
  paused: "Pauza",
  resumeGame: "Wzn\xF3w gr\u0119",
  resetChallenge: "Zresetuj wyzwanie",
  freshChallenge: "Nowe wyzwanie",
  changeSettings: "Zmie\u0144 ustawienia",
  exitToMainMenu: "Wyjd\u017A do menu g\u0142\xF3wnego",
  left: "Lewo",
  right: "Prawo",
  drop: "Upu\u015B\u0107",
  destruct: "Zniszcz",
  rules: "Zasady",
  axiom: "Aksjomat",
  playAgain: "Zagraj ponownie",
  playAgainShort: "Ponownie",
  newChallenge: "Nowe wyzwanie",
  prevLevel: "Poprzedni poziom",
  prevLevelShort: "Poprz.",
  nextLevel: "Nast\u0119pny poziom",
  nextLevelShort: "Nast.",
  congratulations: "\u{1F389} Gratulacje! \u{1F389}",
  systems: "Systemy",
  backToSystems: "\u2190 Systemy",
  sideLeft: "L",
  sideRight: "P",
  randomConfig: "Losowe",
  formulaShape: "Ustawienia",
  size: "D\u0142ugo\u015B\u0107 formu\u0142y",
  connectives: "Sp\xF3jniki",
  symbols: "Symbole",
  negationWeight: "Negacja",
  implicationWeight: "Implikacja",
  conjunctionWeight: "Koniunkcja",
  disjunctionWeight: "Alternatywa",
  filter: "Parametry",
  bypassPercent: "Chaos (\u{1F480}%)",
  targetNonStructural: "Rozmiar rozwi\u0105zania",
  start: "Start",
  back: "Powr\xF3t",
  preview: "Podgl\u0105d",
  score: "Wynik",
  par: "Par",
  statsTemplate: "Wygenerowano {formulas} formu\u0142 ({rate}/s), {tautologies} tautologii, {solved} rozwi\u0105zanych. Zaktualizowano {sinceUpdate}s temu."
};
var messages = {
  cs,
  en,
  es,
  fi,
  pl
};
var detectLocale = () => {
  const lang = navigator.language.split("-")[0] ?? "en";
  return lang in messages ? lang : "en";
};
var systemLocale = detectLocale();
var locale = systemLocale;
var setLocale = (raw2) => {
  if (raw2 === null || raw2 === "") return;
  const normalized = raw2.replace(/_/g, "-").split("-")[0]?.toLowerCase();
  if (normalized !== void 0 && normalized in messages) locale = normalized;
};
var getLocale = () => locale;
var getSystemLocale = () => systemLocale;
var availableLocales = Object.keys(messages);
var endonyms = {
  cs: "\u010Ce\u0161tina",
  en: "English",
  es: "Espa\xF1ol",
  fi: "Suomi",
  pl: "Polski"
};
var endonymOf = (code) => endonyms[code] ?? code;
var rerenderHook = () => {
};
var onLocaleChange = (hook) => {
  rerenderHook = hook;
};
var changeLanguage = (raw2) => {
  setLocale(raw2);
  const params = new URLSearchParams(window.location.search);
  params.set("lang", locale);
  history.replaceState(history.state, "", `?${params.toString()}`);
  rerenderHook();
};
var clearLangOverride = () => {
  locale = systemLocale;
  const params = new URLSearchParams(window.location.search);
  params.delete("lang");
  const qs = params.toString();
  history.replaceState(
    history.state,
    "",
    qs ? `?${qs}` : window.location.pathname
  );
  rerenderHook();
};
var t = (key) => (messages[locale] ?? en)[key] ?? en[key];
var formatStats = (p) => {
  const values = {
    formulas: p.formulas,
    rate: p.rate,
    tautologies: p.tautologies,
    solved: p.solved,
    sinceUpdate: p.sinceUpdate
  };
  return t("statsTemplate").replace(
    /\{(\w+)\}/g,
    (_, key) => String(values[key] ?? `{${key}}`)
  );
};

// src/web/lang-switcher.ts
var createLangSwitcher = () => {
  const wrap = document.createElement("div");
  wrap.className = "lang-switcher";
  const current2 = getLocale();
  const button = document.createElement("div");
  button.className = "lang-switcher-button";
  const globe = document.createElement("span");
  globe.textContent = "\u{1F310}";
  const name4 = document.createElement("span");
  name4.className = "lang-switcher-name";
  name4.textContent = endonymOf(current2);
  const chevron = document.createElement("span");
  chevron.textContent = "\u25BE";
  button.appendChild(globe);
  button.appendChild(name4);
  button.appendChild(chevron);
  const menu = document.createElement("div");
  menu.className = "lang-switcher-menu";
  menu.hidden = true;
  const systemCode = getSystemLocale();
  const urlHasLang = new URLSearchParams(window.location.search).has("lang");
  const systemItem = document.createElement("div");
  systemItem.className = "lang-switcher-item";
  if (!urlHasLang) systemItem.classList.add("active");
  systemItem.textContent = endonymOf(systemCode);
  systemItem.onclick = (ev) => {
    ev.stopPropagation();
    clearLangOverride();
  };
  menu.appendChild(systemItem);
  const separator = document.createElement("hr");
  menu.appendChild(separator);
  const sortedLocales = [...availableLocales].sort(
    (a91, b) => endonymOf(a91).localeCompare(endonymOf(b))
  );
  for (const code of sortedLocales) {
    const item = document.createElement("div");
    item.className = "lang-switcher-item";
    if (urlHasLang && code === current2) item.classList.add("active");
    item.textContent = endonymOf(code);
    item.onclick = (ev) => {
      ev.stopPropagation();
      changeLanguage(code);
    };
    menu.appendChild(item);
  }
  button.onclick = (ev) => {
    ev.stopPropagation();
    if (menu.hidden) {
      menu.hidden = false;
      setTimeout(() => {
        document.addEventListener(
          "click",
          () => {
            menu.hidden = true;
          },
          { once: true }
        );
      }, 0);
    } else {
      menu.hidden = true;
    }
  };
  wrap.appendChild(button);
  wrap.appendChild(menu);
  return wrap;
};

// src/web/menu.ts
var modeLabel = {
  random: () => t("random"),
  campaign: () => t("campaign")
};
var mountMenu = (container, navigate2) => {
  const render = () => {
    container.innerHTML = "";
    const panel = document.createElement("div");
    panel.setAttribute("class", "menu");
    panel.appendChild(createLangSwitcher());
    const title = document.createElement("div");
    title.setAttribute("class", "menu-title");
    title.innerHTML = t("title");
    panel.appendChild(title);
    const modes = document.createElement("div");
    modes.setAttribute("class", "menu-modes");
    for (const mode of gameModes) {
      const btn = document.createElement("div");
      btn.setAttribute("class", "button menu-mode");
      btn.innerHTML = modeLabel[mode]();
      btn.onclick = () => navigate2(mode === "random" ? "random-config" : mode);
      modes.appendChild(btn);
    }
    panel.appendChild(modes);
    container.appendChild(panel);
  };
  render();
  return { cleanup: () => {
  }, rerender: render };
};

// src/web/tree.ts
var equalPaths = (a91, b) => a91.length === b.length && a91.every((v2, i90) => v2 === b[i90]);
var startsWith = (path, prefix) => path.length >= prefix.length && prefix.every((v2, i90) => v2 === path[i90]);
var renderSequent = (derivation, isActive, gaze, ghost = false) => {
  const el = document.createElement("div");
  el.setAttribute("class", "tree-sequent" + (ghost ? " ghost" : ""));
  el.innerHTML = html(
    fromSequent(derivation.result, isActive ? gaze : null)(basic)
  );
  return el;
};
var renderInferenceLine = (ruleId2, ghost = false) => {
  const container = document.createElement("div");
  container.setAttribute("class", "tree-inference" + (ghost ? " ghost" : ""));
  const label = document.createElement("div");
  label.setAttribute("class", "tree-rule-label");
  label.innerHTML = html(
    fromRuleId(ruleId2, t("sideLeft"), t("sideRight"))(basic)
  );
  container.appendChild(label);
  return container;
};
var renderDerivation = (derivation, activePath2, gaze = null, currentPath = [], ghostPath = null) => {
  const isGhostBoundary = ghostPath !== null && equalPaths(currentPath, ghostPath);
  const isGhostNode = ghostPath !== null && currentPath.length > ghostPath.length && startsWith(currentPath, ghostPath);
  const isActive = equalPaths(currentPath, activePath2) || isGhostBoundary;
  const isOpenActive = isActive && derivation.kind === "premise" && !isGhostBoundary;
  const isClosedActive = isActive && derivation.kind === "transformation" && !isGhostBoundary;
  const node = document.createElement("div");
  const cls = "tree-node" + (isOpenActive ? " tree-active" : "") + (isClosedActive ? " tree-closed-active" : "") + (isGhostBoundary ? " tree-active" : "") + (isGhostNode ? " ghost-node" : "");
  node.setAttribute("class", cls);
  let leafDepth = 0;
  if (derivation.kind === "transformation") {
    if (isClosedActive) {
      const marker = document.createElement("div");
      marker.setAttribute("class", "tree-closed-marker");
      node.appendChild(marker);
    }
    const premises = document.createElement("div");
    premises.setAttribute("class", "tree-premises");
    let maxChildDepth = -1;
    derivation.deps.forEach((dep, i90) => {
      const child = renderDerivation(
        dep,
        activePath2,
        gaze,
        [...currentPath, i90],
        ghostPath
      );
      const childDepth = Number(child.dataset["leafDepth"] ?? "0");
      if (childDepth > maxChildDepth) maxChildDepth = childDepth;
      premises.appendChild(child);
    });
    leafDepth = maxChildDepth < 0 ? 0 : maxChildDepth + 1;
    node.appendChild(premises);
    node.appendChild(
      renderInferenceLine(derivation.rule, isGhostBoundary || isGhostNode)
    );
    node.appendChild(
      renderSequent(
        derivation,
        isGhostBoundary || isOpenActive,
        isGhostBoundary ? gaze : null,
        isGhostNode
      )
    );
  } else {
    node.appendChild(renderSequent(derivation, isOpenActive, gaze, isGhostNode));
  }
  node.dataset["leafDepth"] = String(leafDepth);
  if (currentPath.length === 0) {
    node.addEventListener("copy", (e) => {
      e.preventDefault();
      e.clipboardData?.setData(
        "text/plain",
        fromDerivation(derivation, t("sideLeft"), t("sideRight"))
      );
    });
  }
  return node;
};
var LINE_PAD = 16;
var stabilizeWidths = (node) => {
  const sequent2 = node.querySelector(":scope > .tree-sequent");
  const sequentWidth = sequent2 ? sequent2.getBoundingClientRect().width : 0;
  const premises = node.querySelector(":scope > .tree-premises");
  const inference = node.querySelector(":scope > .tree-inference");
  let childSubtreeSum = 0;
  let firstChildPad = 0;
  let lastChildPad = 0;
  let gap = 0;
  let count = 0;
  if (premises) {
    const children = Array.from(
      premises.querySelectorAll(":scope > *")
    );
    count = children.length;
    gap = parseFloat(getComputedStyle(premises).gap) || 0;
    for (let i90 = 0; i90 < children.length; i90 += 1) {
      const child = children[i90];
      if (!child) continue;
      const cw = stabilizeWidths(child);
      childSubtreeSum += cw.subtree;
      const pad2 = (cw.subtree - cw.sequent) / 2;
      if (i90 === 0) firstChildPad = pad2;
      lastChildPad = pad2;
    }
  }
  const totalGap = Math.max(0, count - 1) * gap;
  const contentSpan = childSubtreeSum + totalGap - firstChildPad - lastChildPad;
  const lineWidth = Math.ceil(
    Math.max(sequentWidth, contentSpan) + LINE_PAD * 2
  );
  const premisesWidth = childSubtreeSum + totalGap;
  const subtreeWidth = Math.ceil(Math.max(lineWidth, premisesWidth));
  if (inference) {
    inference.style.width = `${lineWidth}px`;
    inference.style.alignSelf = "center";
    const lineShift = (firstChildPad - lastChildPad) / 2;
    if (Math.abs(lineShift) > 0.5) {
      inference.style.transform = `translateX(${lineShift}px)`;
    }
  }
  node.style.width = `${subtreeWidth}px`;
  return { sequent: sequentWidth, subtree: subtreeWidth };
};
var layoutTree = (root, opts = {}) => {
  stabilizeWidths(root);
  if (opts.skipActiveScroll === true) return;
  const active2 = root.querySelector(".tree-active");
  if (active2) {
    active2.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest"
    });
  }
};

// src/interactive/ghost.ts
var MAX_STEPS = 64;
var findConnectiveRule = (seq, side, available) => {
  const candidates = side === "left" ? ["nl", "cl", "cl1", "cl2", "dl", "il"] : ["nr", "dr", "dr1", "dr2", "cr", "ir"];
  for (const id of candidates) {
    if (!available.has(id)) continue;
    if (reverseLogic0[id].isResult(seq)) return id;
  }
  return null;
};
var stepRotation = (seq, side, available) => {
  const rule = side === "left" ? reverseStructure0.sRotLB : reverseStructure0.sRotRB;
  if (!available.has(rule.id)) return null;
  const t2 = rule.tryReverse(premise(seq));
  if (!t2 || t2.kind !== "transformation") return null;
  const dep = t2.deps[0];
  if (!dep) return null;
  return { id: rule.id, next: dep.result };
};
var stepFinal = (seq, side, kind, available) => {
  if (kind === "weakening") {
    const rule2 = side === "left" ? reverseStructure0.swl : reverseStructure0.swr;
    if (!available.has(rule2.id)) return null;
    const t3 = rule2.tryReverse(premise(seq));
    if (!t3 || t3.kind !== "transformation") return null;
    const nexts2 = t3.deps.map((d) => d.result);
    if (nexts2.length === 0) return null;
    return { id: rule2.id, nexts: nexts2 };
  }
  const id = findConnectiveRule(seq, side, available);
  if (!id) return null;
  const rule = reverseLogic0[id];
  const t2 = rule.tryReverse(premise(seq));
  if (!t2 || t2.kind !== "transformation") return null;
  const nexts = t2.deps.map((d) => d.result);
  if (nexts.length === 0) return null;
  return { id, nexts };
};
var computeGhostChain = (current2, gaze, kind, availableRules) => {
  const available = new Set(availableRules);
  const chain = [];
  let seq = current2;
  let g = gaze;
  for (let i90 = 0; i90 < MAX_STEPS; i90 += 1) {
    const ant = seq.antecedent.length;
    const suc = seq.succedent.length;
    if (g.side === "left" && (ant === 0 || g.index === ant - 1)) break;
    if (g.side === "right" && (suc === 0 || g.index === 0)) break;
    const step = stepRotation(seq, g.side, available);
    if (!step) return null;
    chain.push({ rule: step.id, sequents: [step.next] });
    seq = step.next;
    g = g.side === "left" ? { side: "left", index: g.index + 1 } : { side: "right", index: g.index - 1 };
  }
  const final = stepFinal(seq, g.side, kind, available);
  if (!final) return null;
  chain.push({ rule: final.id, sequents: final.nexts });
  return chain;
};

// src/web/input-mode.ts
var qwertyKeyMap = {
  KeyM: "menu",
  Escape: "menu",
  KeyX: "exit",
  Backquote: "level",
  KeyW: "prevBranch",
  KeyO: "nextBranch",
  KeyY: "reset",
  KeyA: "leftRotateLeft",
  KeyS: "leftWeakening",
  KeyF: "leftConnective",
  KeyG: "leftRotateRight",
  KeyH: "rightRotateLeft",
  KeyJ: "rightConnective",
  KeyL: "rightWeakening",
  Semicolon: "rightRotateRight",
  Space: "axiom",
  Enter: "axiom",
  Backspace: "undo",
  ArrowLeft: "gazeLeft",
  ArrowRight: "gazeRight",
  ArrowUp: "gazeConnective",
  ArrowDown: "gazeWeakening",
  KeyR: "toggleRules"
};
var codeToLabel = (code) => {
  const special = {
    Backquote: "\xA7",
    Semicolon: "\xF6",
    Space: "\u23B5",
    Enter: "\u21B5",
    Backspace: "\u232B",
    Escape: "\u238B",
    ArrowLeft: "\u2190",
    ArrowRight: "\u2192",
    ArrowUp: "\u2191",
    ArrowDown: "\u2193"
  };
  const char = special[code] ?? String();
  if (char) return char;
  if (code.startsWith("Key")) return code.slice(3).toLowerCase();
  return code.toLowerCase();
};
var actionKeyHint = {};
for (const [code, action] of Object.entries(qwertyKeyMap)) {
  if (!(action in actionKeyHint)) {
    actionKeyHint[action] = codeToLabel(code);
  }
}
var ps5SharedKeyMap = {
  4: "prevBranch",
  // L1
  5: "nextBranch",
  // R1
  6: "undo",
  // L2
  7: "axiom",
  // R2
  9: "menu"
  // Options
};
var ps5GazeKeyMap = {
  ...ps5SharedKeyMap,
  0: "axiom",
  // Cross — alias for muscle memory
  1: "undo",
  // Circle — alias
  12: "gazeConnective",
  // D-pad up
  13: "gazeWeakening",
  // D-pad down
  14: "gazeLeft",
  // D-pad left
  15: "gazeRight"
  // D-pad right
};
var ps5HotKeyMap = {
  ...ps5SharedKeyMap,
  0: "rightWeakening",
  // Cross   ↔ L
  1: "rightRotateRight",
  // Circle  ↔ ;/ö
  2: "rightRotateLeft",
  // Square  ↔ H
  3: "rightConnective",
  // Triangle ↔ J
  12: "leftConnective",
  // D-pad up    ↔ F
  13: "leftWeakening",
  // D-pad down  ↔ S
  14: "leftRotateLeft",
  // D-pad left  ↔ A
  15: "leftRotateRight"
  // D-pad right ↔ G
};
var padIndexToLabel = {
  0: "\u2715",
  1: "\u25EF",
  2: "\u25A1",
  3: "\u25B3",
  4: "L1",
  5: "R1",
  6: "L2",
  7: "R2",
  9: "\u2630",
  10: "L3",
  11: "R3",
  12: "\u2191",
  13: "\u2193",
  14: "\u2190",
  15: "\u2192"
};
var buildActionPadHint = (keyMap) => {
  const hint = {};
  for (const [idx, action] of Object.entries(keyMap)) {
    const label = padIndexToLabel[Number(idx)];
    if (label !== void 0 && !(action in hint)) {
      hint[action] = label;
    }
  }
  return hint;
};
var actionPadHintGaze = buildActionPadHint(ps5GazeKeyMap);
var actionPadHintHot = buildActionPadHint(ps5HotKeyMap);
var gamepadActive = false;
var hotMode = false;
var gazeModeActive = false;
var gamepadListeners = /* @__PURE__ */ new Set();
var isGazeModeActive = () => gazeModeActive;
var subscribeGamepad = (cb) => {
  gamepadListeners.add(cb);
  return () => {
    gamepadListeners.delete(cb);
  };
};
var notifyGamepadListeners = () => {
  for (const cb of gamepadListeners) cb();
};
var activePadKeyMap = () => hotMode ? ps5HotKeyMap : ps5GazeKeyMap;
var activeActionPadHint = () => hotMode ? actionPadHintHot : actionPadHintGaze;
var setGamepadActive = (v2) => {
  if (gamepadActive === v2) return;
  gamepadActive = v2;
  notifyGamepadListeners();
};
var markKeyboardInput = () => {
  setGamepadActive(false);
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("keyboard-detected");
  }
};
if (typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.documentElement.classList.add("keyboard-detected");
}
var markGamepadInput = () => setGamepadActive(true);
var onGamepadConnected = () => setGamepadActive(true);
var onGamepadDisconnected = () => setGamepadActive(false);
var setGazeModeActive = (active2) => {
  gazeModeActive = active2;
  if (active2 && hotMode) {
    hotMode = false;
    notifyGamepadListeners();
  }
};
var toggleHotMode = () => {
  hotMode = !hotMode;
  if (hotMode) gazeModeActive = false;
  notifyGamepadListeners();
};
var getActionHint = (action) => gamepadActive ? activeActionPadHint()[action] : actionKeyHint[action];
var kbdHint = (s) => gamepadActive ? void 0 : s;
var dualHint = (kbd, padAction) => gamepadActive ? activeActionPadHint()[padAction] : kbd;

// src/web/game.ts
var ghostToDerivation = (chain, activeSequent2) => {
  let deps = [];
  for (let i90 = chain.length - 1; i90 >= 0; i90 -= 1) {
    const step = chain[i90];
    if (!step) continue;
    if (deps.length === 0) {
      deps = step.sequents.map((s) => premise(s));
    }
    if (i90 === 0) {
      return transformation(activeSequent2, deps, step.rule);
    }
    const result = chain[i90 - 1]?.sequents[0];
    if (!result) continue;
    deps = [transformation(result, deps, step.rule)];
  }
  return premise(activeSequent2);
};
var ruleAction = {
  swl: "leftWeakening",
  sRotLF: "leftRotateLeft",
  sRotLB: "leftRotateRight",
  nl: "leftConnective",
  cl: "leftConnective",
  cl1: "leftConnective",
  cl2: "leftConnective",
  dl: "leftConnective",
  fdl: "leftConnective",
  il: "leftConnective",
  fil: "leftConnective",
  swr: "rightWeakening",
  sRotRB: "rightRotateLeft",
  sRotRF: "rightRotateRight",
  nr: "rightConnective",
  dr: "rightConnective",
  dr1: "rightConnective",
  dr2: "rightConnective",
  cr: "rightConnective",
  fcr: "rightConnective",
  ir: "rightConnective",
  i: "axiom",
  f: "axiom",
  v: "axiom",
  a1: "axiom",
  a2: "axiom",
  a3: "axiom"
};
var keyHintBadge = (hint, variant = "base") => {
  const badge = document.createElement("span");
  const base = variant === "hot" ? "key-hint hot" : variant === "cold" ? "key-hint cold" : variant === "coldGhost" ? "key-hint cold ghost" : "key-hint";
  const cls = hint.length > 1 ? base + " wide" : base;
  badge.setAttribute("class", cls);
  badge.textContent = hint;
  return badge;
};
var createButton = (label, disabled, onClick, hint, hintVariant = "base") => {
  const el = document.createElement("pre");
  el.setAttribute("class", "button" + (disabled ? " disabled" : ""));
  if (!disabled && onClick) el.onclick = onClick;
  if (hint !== void 0) {
    el.appendChild(keyHintBadge(hint, hintVariant));
  }
  if (typeof label === "string") {
    if (hint !== void 0) {
      const labelSpan = document.createElement("span");
      labelSpan.setAttribute("class", "button-label");
      labelSpan.textContent = " " + label;
      el.appendChild(labelSpan);
    } else {
      el.innerHTML = label;
    }
  } else {
    const longSpan = document.createElement("span");
    longSpan.setAttribute("class", "button-label long");
    longSpan.textContent = (hint !== void 0 ? " " : "") + label.long;
    el.appendChild(longSpan);
    const shortSpan = document.createElement("span");
    shortSpan.setAttribute("class", "button-label short");
    shortSpan.textContent = (hint !== void 0 ? " " : "") + label.short;
    el.appendChild(shortSpan);
  }
  return el;
};
var rulesVisible = false;
var setDefaultRulesVisible = (visible) => {
  rulesVisible = visible;
  treeZoom = 1;
  autoZoomedDerivation = null;
};
var treeZoom = 1;
var ZOOM_MIN = 0.4;
var ZOOM_MAX = 2;
var ZOOM_STEP = 0.2;
var autoZoomedDerivation = null;
var zoomTreeOut = () => {
  treeZoom = Math.max(ZOOM_MIN, treeZoom - ZOOM_STEP);
};
var zoomTreeReset = () => {
  treeZoom = 1;
};
var zoomTreeIn = () => {
  treeZoom = Math.min(ZOOM_MAX, treeZoom + ZOOM_STEP);
};
var AUTO_ZOOM_MAX = 1.2;
var AUTO_ZOOM_PAD = 0.9;
var CHECK_TOTAL_MS = 3e3;
var CHECK_STEP_MIN_MS = 80;
var CHECK_STEP_MAX_MS = 600;
var runProofCheckSweep = (tree2) => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const nodes = [
    tree2,
    ...Array.from(tree2.querySelectorAll(".tree-node"))
  ];
  if (nodes.length === 0) return;
  const byDepth = /* @__PURE__ */ new Map();
  let maxDepth = 0;
  for (const n of nodes) {
    const d = Number(n.dataset["leafDepth"] ?? "0");
    if (d > maxDepth) maxDepth = d;
    const list = byDepth.get(d);
    if (list) list.push(n);
    else byDepth.set(d, [n]);
  }
  const stepMs = Math.min(
    CHECK_STEP_MAX_MS,
    Math.max(
      CHECK_STEP_MIN_MS,
      maxDepth > 0 ? CHECK_TOTAL_MS / maxDepth : CHECK_TOTAL_MS
    )
  );
  const holdMs = stepMs * 0.67;
  for (let d = 0; d <= maxDepth; d += 1) {
    const level = byDepth.get(d);
    if (!level) continue;
    const isRoot = d === maxDepth;
    const prevLevel = d > 0 ? byDepth.get(d - 1) : null;
    setTimeout(() => {
      for (const n of level) n.classList.add("tree-checking");
      setTimeout(() => {
        for (const n of level) n.classList.remove("tree-checking");
        if (isRoot) {
          tree2.classList.add("tree-proven");
        } else {
          for (const n of level) n.classList.add("tree-verified");
        }
        if (prevLevel) {
          for (const n of prevLevel) {
            n.classList.remove("tree-verified");
            n.classList.add("tree-faded");
          }
        }
      }, holdMs);
    }, d * stepMs);
  }
};
var lastScrollTop = 0;
var lastScrollLeft = 0;
var createPlayArea = (workspace) => {
  const panel = document.createElement("div");
  const solvedClass = workspace.isSolved() ? " solved" : "";
  panel.setAttribute("class", "playarea" + solvedClass);
  panel.style.setProperty("--tree-zoom", String(treeZoom));
  panel.addEventListener("scroll", () => {
    lastScrollTop = panel.scrollTop;
    lastScrollLeft = panel.scrollLeft;
  });
  const startTop = lastScrollTop;
  const startLeft = lastScrollLeft;
  const focus2 = workspace.currentConjecture();
  const solved = workspace.isSolved();
  const gaze = isGazeModeActive() ? workspace.gaze() : null;
  const ghostChain = isGazeModeActive() ? computeGhostChain(
    activeSequent(focus2),
    workspace.gaze(),
    workspace.gazeKind(),
    workspace.availableRules()
  ) : null;
  const path = solved ? [-1] : activePath(focus2);
  let derivation = focus2.derivation;
  let ghostPath = null;
  if (ghostChain !== null && ghostChain.length > 0) {
    const edit = (leaf) => ghostToDerivation(ghostChain, leaf.result);
    const withGhost = editDerivation(focus2.derivation, path, edit);
    if (withGhost) {
      derivation = withGhost;
      ghostPath = path;
    }
  }
  const tree2 = renderDerivation(derivation, path, gaze, [], ghostPath);
  const isFresh = focus2.derivation.kind === "premise";
  tree2.style.visibility = "hidden";
  panel.appendChild(tree2);
  requestAnimationFrame(() => {
    layoutTree(tree2, { skipActiveScroll: true });
    panel.scrollTo({ top: startTop, left: startLeft, behavior: "instant" });
    if (!solved) {
      requestAnimationFrame(() => {
        const active2 = tree2.querySelector(
          ".tree-active, .tree-closed-active"
        );
        if (active2) {
          active2.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
          });
        }
      });
    }
    if (isFresh && !solved && autoZoomedDerivation !== focus2.derivation) {
      autoZoomedDerivation = focus2.derivation;
      const rootSequent = tree2.querySelector(
        ":scope > .tree-sequent"
      );
      if (rootSequent) {
        const sequentRect = rootSequent.getBoundingClientRect();
        const areaRect = panel.getBoundingClientRect();
        const panelStyle = getComputedStyle(panel);
        const padLeft = parseFloat(panelStyle.paddingLeft);
        const padRight = parseFloat(panelStyle.paddingRight);
        const availW = areaRect.width - padLeft - padRight;
        if (sequentRect.width > 0 && availW > 0) {
          const target = Math.max(
            ZOOM_MIN,
            Math.min(
              AUTO_ZOOM_MAX,
              treeZoom * availW * AUTO_ZOOM_PAD / sequentRect.width
            )
          );
          if (Math.abs(target - treeZoom) > 0.01) {
            treeZoom = target;
            panel.style.setProperty("--tree-zoom", String(treeZoom));
            layoutTree(tree2, { skipActiveScroll: true });
          }
        }
      }
    }
    tree2.style.visibility = "";
    if (solved) {
      const treeRect = tree2.getBoundingClientRect();
      const areaRect = panel.getBoundingClientRect();
      const panelStyle = getComputedStyle(panel);
      const padH = parseFloat(panelStyle.paddingLeft) + parseFloat(panelStyle.paddingRight);
      const padV = parseFloat(panelStyle.paddingTop) + parseFloat(panelStyle.paddingBottom);
      const availW = areaRect.width - padH;
      const availH = (areaRect.height - padV) * 0.85;
      const scale = Math.min(
        1,
        availW / treeRect.width,
        availH / treeRect.height
      );
      tree2.style.transformOrigin = "center bottom";
      tree2.style.transition = "transform 1.2s ease-in-out";
      const currentScale = tree2.style.transform ? parseFloat(tree2.style.transform.replace("scale(", "")) : 1;
      if (Math.abs(scale - currentScale) > 1e-3) {
        const onZoomEnd = (e) => {
          if (e.propertyName !== "transform") return;
          tree2.removeEventListener("transitionend", onZoomEnd);
          runProofCheckSweep(tree2);
        };
        tree2.addEventListener("transitionend", onZoomEnd);
      } else {
        setTimeout(() => runProofCheckSweep(tree2), 0);
      }
      requestAnimationFrame(() => {
        tree2.style.transform = `scale(${scale})`;
        tree2.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "center"
        });
      });
    }
  });
  return panel;
};
var ruleConnectiveLabel = {
  nl: "\xAC",
  nr: "\xAC",
  cl: "\u2227",
  cl1: "\u2227",
  cl2: "\u2227",
  cr: "\u2227",
  fcr: "\u2227",
  dl: "\u2228",
  dr: "\u2228",
  dr1: "\u2228",
  dr2: "\u2228",
  il: "\u2192",
  fil: "\u2192",
  ir: "\u2192",
  fdl: "\u2228"
};
var gazeHintBadgeForKind = (key, hints) => {
  if (!hints) return null;
  if (key === hints.immediateRule) {
    return keyHintBadge(hints.hintChar, "cold");
  }
  if (key === hints.eventualRule && hints.eventualRule !== hints.immediateRule) {
    return keyHintBadge(hints.hintChar, "coldGhost");
  }
  return null;
};
var createRuleCard = (key, rule, disabled, pinned82, hideRules, onApply, gazeHints, panelClass, interactive) => {
  const isPinned = pinned82.includes(key);
  const pre = document.createElement("pre");
  pre.setAttribute(
    "class",
    "rule " + (interactive ? "button" : "hint") + (disabled ? " disabled" : "") + (isPinned ? " pinned" : "")
  );
  pre.dataset["rule"] = key;
  const group = key in leftStructural || key in rightStructural ? "structural" : key in leftLogical || key in rightLogical ? "logical" : "center";
  pre.dataset["group"] = group;
  if (interactive && !disabled) pre.onclick = () => onApply(key);
  const withLabel = fromDerivation(
    rule.example,
    t("sideLeft"),
    t("sideRight"),
    true
  );
  const withoutLabel = fromDerivation(
    rule.example,
    t("sideLeft"),
    t("sideRight"),
    false
  );
  pre.innerHTML = '<span class="rule-label long">' + withLabel + '</span><span class="rule-label short">' + withoutLabel + "</span>";
  const action = ruleAction[key];
  const hint = action !== void 0 ? getActionHint(action) : void 0;
  const ruleHintVariant = panelClass === "main" ? "base" : "hot";
  if (hint !== void 0 && !hideRules)
    pre.appendChild(keyHintBadge(hint, ruleHintVariant));
  const gazeBadges = [
    gazeHintBadgeForKind(key, gazeHints.connective),
    gazeHintBadgeForKind(key, gazeHints.weakening)
  ].filter(isNonNullable);
  if (gazeBadges.length > 0) {
    const stack = document.createElement("span");
    stack.setAttribute("class", "gaze-hint-stack");
    for (const b of gazeBadges) stack.appendChild(b);
    pre.appendChild(stack);
  }
  return pre;
};
var createPanel = (className, ruleRecord, ls, rules79, pinned82, hideRules, solved, onApply, gazeHints) => {
  const panel = document.createElement("div");
  panel.setAttribute("class", className);
  entries(ruleRecord).forEach(([key, rule]) => {
    if (!rules79.includes(key)) return;
    const disabled = solved || !ls.includes(key);
    const interactive = !(pinned82.includes(key) && hideRules);
    panel.appendChild(
      createRuleCard(
        key,
        rule,
        disabled,
        pinned82,
        hideRules,
        onApply,
        gazeHints,
        className,
        interactive
      )
    );
  });
  return panel;
};
var countRuleUsage = (d) => {
  const counts = {
    axiom: 0,
    structural: 0,
    logical: 0,
    meta: 0
  };
  const walk = (node) => {
    if (node.kind === "premise") return;
    counts[ruleCategory[node.rule]] += 1;
    node.deps.forEach(walk);
  };
  walk(d);
  return counts;
};
var formatHudCounts = (counts) => {
  const order = ["axiom", "structural", "logical", "meta"];
  let lastNonZero = -1;
  order.forEach((cat, i90) => {
    if (counts[cat] > 0) lastNonZero = i90;
  });
  const total = order.reduce((sum, cat) => sum + counts[cat], 0);
  if (lastNonZero === -1) return "<b>0</b>";
  const segments = order.slice(0, lastNonZero + 1).map((cat) => counts[cat]);
  if (segments.length === 1) return `<b>${total}</b>`;
  return `<b>${total}</b> <span class="breakdown">${segments.join("+")}</span>`;
};
var createBench = (workspace, makeCongrats, controlsEl, rerender) => {
  const ls = workspace.applicableRules();
  const rules79 = workspace.availableRules();
  const solved = workspace.isSolved();
  const focus2 = workspace.currentConjecture();
  const activeDeriv = subDerivation(focus2.derivation, activePath(focus2));
  const branchClosed = activeDeriv?.kind === "transformation";
  const inactive = solved || branchClosed;
  const apply2 = (key) => {
    setGazeModeActive(false);
    if (isReverseId0(key)) workspace.applyEvent(reverse02(key));
    rerender();
  };
  const applyCenter = (key) => {
    setGazeModeActive(false);
    if (isReverseId0(key)) workspace.applyEvent(reverse02(key));
    rerender();
  };
  const seq = activeSequent(workspace.currentConjecture());
  const available = workspace.availableRules();
  const buildKindHints = (kind, hintChar) => {
    if (hintChar === void 0) return null;
    const chain = computeGhostChain(seq, workspace.gaze(), kind, available);
    if (!chain || chain.length === 0) return null;
    return {
      immediateRule: chain[0]?.rule ?? null,
      eventualRule: chain[chain.length - 1]?.rule ?? null,
      hintChar
    };
  };
  const gazeHints = isGazeModeActive() ? {
    connective: buildKindHints(
      "connective",
      getActionHint("gazeConnective")
    ),
    weakening: buildKindHints("weakening", getActionHint("gazeWeakening"))
  } : { connective: null, weakening: null };
  const hideRules = !rulesVisible || solved;
  const pinned82 = workspace.pinnedRules();
  const panel = document.createElement("div");
  const hasPinned = !solved && pinned82.length > 0;
  const hasPinnedMany = !solved && pinned82.length > 2;
  panel.setAttribute(
    "class",
    "bench" + (hideRules ? " rules-hidden" : "") + (hasPinned ? " has-pinned" : "") + (hasPinnedMany ? " has-pinned-many" : "")
  );
  panel.appendChild(
    createPanel(
      "left",
      left,
      ls,
      rules79,
      pinned82,
      hideRules,
      inactive,
      apply2,
      gazeHints
    )
  );
  const congrats = solved ? makeCongrats() : null;
  if (congrats) {
    panel.appendChild(congrats.hurray);
  } else {
    panel.appendChild(
      createPanel(
        "main",
        center,
        ls,
        rules79,
        pinned82,
        hideRules,
        inactive,
        applyCenter,
        gazeHints
      )
    );
  }
  panel.appendChild(
    createPanel(
      "right",
      right,
      ls,
      rules79,
      pinned82,
      hideRules,
      inactive,
      apply2,
      gazeHints
    )
  );
  const hud = document.createElement("div");
  hud.setAttribute("class", "hud" + (solved ? " solved" : ""));
  const hudCounts = formatHudCounts(countRuleUsage(focus2.derivation));
  hud.innerHTML = solved ? t("score") + " " + hudCounts : hudCounts;
  if (solved) {
    const solution89 = workspace.currentSolution();
    const par = document.createElement("div");
    par.setAttribute("class", "par");
    par.innerHTML = solution89 ? t("par") + " " + formatHudCounts(countRuleUsage(solution89)) : t("par") + " \u{1F480}";
    hud.appendChild(par);
  }
  panel.appendChild(hud);
  const rulesSheet = document.createElement("div");
  const sheetMode = isGazeModeActive() ? "gaze" : "hot";
  rulesSheet.setAttribute("class", "rules-sheet " + sheetMode);
  if (!congrats) {
    const sheetCenter = document.createElement("div");
    sheetCenter.setAttribute("class", "rules-sheet-center");
    entries(center).forEach(([key, rule]) => {
      if (!rules79.includes(key)) return;
      const disabled = solved || !ls.includes(key);
      const interactive = !(pinned82.includes(key) && hideRules);
      const card = createRuleCard(
        key,
        rule,
        disabled,
        pinned82,
        hideRules,
        applyCenter,
        gazeHints,
        "main",
        interactive
      );
      sheetCenter.appendChild(card);
    });
    rulesSheet.appendChild(sheetCenter);
  }
  const sheetSides = document.createElement("div");
  sheetSides.setAttribute("class", "rules-sheet-sides");
  const leftCol = document.createElement("div");
  leftCol.setAttribute("class", "rules-sheet-col");
  entries(left).forEach(([key, rule]) => {
    if (!rules79.includes(key)) return;
    const disabled = inactive || !ls.includes(key);
    const interactive = !(pinned82.includes(key) && hideRules);
    const card = createRuleCard(
      key,
      rule,
      disabled,
      pinned82,
      hideRules,
      apply2,
      gazeHints,
      "left",
      interactive
    );
    leftCol.appendChild(card);
  });
  const rightCol = document.createElement("div");
  rightCol.setAttribute("class", "rules-sheet-col");
  entries(right).forEach(([key, rule]) => {
    if (!rules79.includes(key)) return;
    const disabled = inactive || !ls.includes(key);
    const interactive = !(pinned82.includes(key) && hideRules);
    const card = createRuleCard(
      key,
      rule,
      disabled,
      pinned82,
      hideRules,
      apply2,
      gazeHints,
      "right",
      interactive
    );
    rightCol.appendChild(card);
  });
  sheetSides.appendChild(leftCol);
  sheetSides.appendChild(rightCol);
  rulesSheet.appendChild(sheetSides);
  panel.appendChild(rulesSheet);
  panel.appendChild(createPlayArea(workspace));
  const zoomOut = createButton(
    "\u2212",
    false,
    () => {
      zoomTreeOut();
      rerender();
    },
    kbdHint("-")
  );
  const zoomReset = createButton(
    "\u2299",
    false,
    () => {
      zoomTreeReset();
      rerender();
    },
    kbdHint("0")
  );
  const zoomIn = createButton(
    "+",
    false,
    () => {
      zoomTreeIn();
      rerender();
    },
    kbdHint("+")
  );
  const gazeMovable = !inactive && seq.antecedent.length + seq.succedent.length > 1;
  const leftDisabled = isGazeModeActive() ? !gazeMovable : inactive || seq.antecedent.length === 0;
  const rightDisabled = isGazeModeActive() ? !gazeMovable : inactive || seq.succedent.length === 0;
  const gazeLeftBtn = createButton(
    t("left"),
    leftDisabled,
    () => {
      if (!isGazeModeActive()) {
        setGazeModeActive(true);
        workspace.setGaze({
          side: "left",
          index: seq.antecedent.length - 1
        });
      } else {
        workspace.moveGaze(-1);
      }
      rerender();
    },
    getActionHint("gazeLeft")
  );
  const gazeRightBtn = createButton(
    t("right"),
    rightDisabled,
    () => {
      if (!isGazeModeActive()) {
        setGazeModeActive(true);
        workspace.setGaze({ side: "right", index: 0 });
      } else {
        workspace.moveGaze(1);
      }
      rerender();
    },
    getActionHint("gazeRight")
  );
  const gazeWeakeningBtn = createButton(
    t("drop"),
    !isGazeModeActive() || inactive,
    () => {
      workspace.setGazeKind("weakening");
      applyGazeRule(workspace, "weakening");
      rerender();
    },
    getActionHint("gazeWeakening")
  );
  const connectiveRule = gazeHints.connective?.eventualRule ?? null;
  const connectiveLabel = connectiveRule !== null ? ruleConnectiveLabel[connectiveRule] ?? "" : "";
  const connectiveDisabled = !isGazeModeActive() || inactive || connectiveLabel === "";
  const gazeConnectiveBtn = createButton(
    t("destruct"),
    connectiveDisabled,
    () => {
      workspace.setGazeKind("connective");
      applyGazeRule(workspace, "connective");
      rerender();
    },
    getActionHint("gazeConnective")
  );
  const makeGroup = (...cls) => {
    const g = document.createElement("div");
    g.setAttribute("class", ["controls-group", ...cls].join(" "));
    return g;
  };
  const rulesBtn = createButton(
    t("rules"),
    false,
    () => {
      rulesVisible = !rulesVisible;
      rerender();
    },
    getActionHint("toggleRules")
  );
  rulesBtn.classList.add("toggle");
  const rulesLed = document.createElement("span");
  rulesLed.setAttribute("class", "led" + (rulesVisible ? " on" : ""));
  rulesBtn.appendChild(rulesLed);
  const axiomBtn = createButton(
    t("axiom"),
    inactive || !keys(center).some((k) => ls.includes(k)),
    () => {
      autoRule(workspace, keys(center));
      rerender();
    },
    getActionHint("axiom")
  );
  const gazeGroup = makeGroup(isGazeModeActive() ? "gaze" : "hot");
  gazeGroup.appendChild(gazeLeftBtn);
  gazeGroup.appendChild(gazeWeakeningBtn);
  gazeGroup.appendChild(gazeConnectiveBtn);
  gazeGroup.appendChild(gazeRightBtn);
  const rulesGroup = makeGroup();
  rulesGroup.setAttribute("class", "controls-group controls-rules");
  rulesGroup.appendChild(rulesBtn);
  const axiomGroup = makeGroup();
  axiomGroup.setAttribute("class", "controls-group controls-axiom");
  axiomGroup.appendChild(axiomBtn);
  const zoomGroup = makeGroup();
  zoomGroup.appendChild(zoomOut);
  zoomGroup.appendChild(zoomReset);
  zoomGroup.appendChild(zoomIn);
  controlsEl.setAttribute("class", "controls-group");
  const centerCell = document.createElement("div");
  centerCell.setAttribute("class", "controls-center");
  const branchCount = branches(workspace.currentConjecture().derivation).length;
  const canSwitch = !solved && branchCount > 1;
  const prevBranchBtn = createButton(
    "\u21B0",
    !canSwitch,
    () => {
      workspace.applyEvent(prevBranch());
      rerender();
    },
    getActionHint("prevBranch")
  );
  const nextBranchBtn = createButton(
    "\u21B1",
    !canSwitch,
    () => {
      workspace.applyEvent(nextBranch());
      rerender();
    },
    getActionHint("nextBranch")
  );
  const branchGroup = makeGroup();
  branchGroup.appendChild(prevBranchBtn);
  branchGroup.appendChild(nextBranchBtn);
  const rightCell = document.createElement("div");
  rightCell.setAttribute("class", "controls-right");
  rightCell.appendChild(branchGroup);
  rightCell.appendChild(zoomGroup);
  const controlsBar = document.createElement("div");
  controlsBar.setAttribute("class", "controls");
  if (congrats) {
    congrats.buttons.setAttribute("class", "congrabuttons controls-group");
    centerCell.appendChild(congrats.buttons);
  } else {
    centerCell.appendChild(rulesGroup);
    centerCell.appendChild(gazeGroup);
    centerCell.appendChild(axiomGroup);
  }
  controlsBar.appendChild(controlsEl);
  controlsBar.appendChild(centerCell);
  controlsBar.appendChild(rightCell);
  panel.appendChild(controlsBar);
  if (!solved && pinned82.length > 0) {
    const pinnedStrip = document.createElement("div");
    pinnedStrip.setAttribute("class", "pinned-strip");
    const allRules = {
      ...left,
      ...center,
      ...right
    };
    for (const key of pinned82) {
      const rule = allRules[key];
      if (rule === void 0 || !rules79.includes(key)) continue;
      const disabled = inactive || !ls.includes(key);
      const panelClass = key in left ? "left" : key in right ? "right" : "main";
      const onApplyPinned = panelClass === "main" ? applyCenter : apply2;
      const card = createRuleCard(
        key,
        rule,
        disabled,
        pinned82,
        false,
        onApplyPinned,
        gazeHints,
        panelClass,
        !hideRules
      );
      pinnedStrip.appendChild(card);
    }
    panel.appendChild(pinnedStrip);
  }
  return panel;
};
var autoRule = (workspace, rules79) => {
  const available = workspace.applicableRules();
  const [first] = rules79.filter((rule) => available.includes(rule));
  if (!first) return;
  if (isReverseId0(first)) workspace.applyEvent(reverse02(first));
};
var createPausePopup = (onResume, onExit, onReset, resetDisabled, onFresh, onSettings) => {
  const shroud = document.createElement("div");
  shroud.setAttribute("class", "shroud pause-shroud");
  shroud.onclick = (ev) => {
    if (ev.target === shroud) {
      ev.preventDefault();
      onResume();
    }
  };
  const panel = document.createElement("div");
  panel.setAttribute("class", "pause-popup");
  panel.onclick = (ev) => {
    ev.stopPropagation();
  };
  const title = document.createElement("div");
  title.setAttribute("class", "pause-title");
  title.textContent = t("paused");
  panel.appendChild(title);
  const buttons = document.createElement("div");
  buttons.setAttribute("class", "pause-buttons");
  buttons.appendChild(
    createButton(t("resumeGame"), false, onResume, dualHint("m", "undo"))
  );
  const spacer = document.createElement("div");
  spacer.setAttribute("class", "pause-buttons-spacer");
  buttons.appendChild(spacer);
  buttons.appendChild(
    createButton(
      t("resetChallenge"),
      resetDisabled,
      onReset,
      getActionHint("reset")
    )
  );
  if (onFresh) {
    buttons.appendChild(
      createButton(t("freshChallenge"), false, onFresh, kbdHint("n"))
    );
  }
  if (onSettings) {
    buttons.appendChild(createButton(t("changeSettings"), false, onSettings));
  }
  buttons.appendChild(
    createButton(t("exitToMainMenu"), false, onExit, getActionHint("exit"))
  );
  panel.appendChild(buttons);
  shroud.appendChild(panel);
  shroud.appendChild(createLangSwitcher());
  return shroud;
};
var RULE_APPLY_ACTIONS = /* @__PURE__ */ new Set([
  "leftWeakening",
  "leftConnective",
  "leftRotateLeft",
  "leftRotateRight",
  "rightWeakening",
  "rightConnective",
  "rightRotateLeft",
  "rightRotateRight"
]);
var createDispatch = (getWorkspace, rerender, navigate2, onSolved, onLevel, onMenu) => (action) => {
  if (action === "gazeLeft" || action === "gazeRight") {
    if (!isGazeModeActive()) {
      const workspace2 = getWorkspace();
      const seq = activeSequent(workspace2.currentConjecture());
      if (action === "gazeLeft") {
        if (seq.antecedent.length === 0) return;
        setGazeModeActive(true);
        workspace2.setGaze({
          side: "left",
          index: seq.antecedent.length - 1
        });
      } else {
        if (seq.succedent.length === 0) return;
        setGazeModeActive(true);
        workspace2.setGaze({ side: "right", index: 0 });
      }
      rerender();
      return;
    }
  } else if (action === "gazeConnective" || action === "gazeWeakening") {
    if (!isGazeModeActive()) return;
  } else if (isGazeModeActive() && (RULE_APPLY_ACTIONS.has(action) || action === "reset")) {
    setGazeModeActive(false);
  } else if (action === "undo" && isGazeModeActive()) {
    if (activePath(getWorkspace().currentConjecture()).length === 0) {
      setGazeModeActive(false);
    }
  }
  if (action === "menu") {
    if (onMenu) onMenu();
    else navigate2("menu");
    return;
  }
  if (action === "level") {
    onLevel?.();
    return;
  }
  if (action === "toggleRules") {
    rulesVisible = !rulesVisible;
    rerender();
    return;
  }
  const workspace = getWorkspace();
  if (action === "reset") {
    workspace.applyEvent(reset());
    rerender();
    return;
  }
  if (workspace.isSolved()) {
    onSolved(action);
    return;
  }
  const focusState = workspace.currentConjecture();
  const activeDeriv = subDerivation(
    focusState.derivation,
    activePath(focusState)
  );
  const onClosedBranch = activeDeriv?.kind === "transformation";
  if (onClosedBranch && action !== "prevBranch" && action !== "nextBranch" && action !== "undo") {
    rerender();
    return;
  }
  switch (action) {
    case "leftWeakening":
      workspace.applyEvent(reverse02("swl"));
      break;
    case "leftRotateLeft":
      workspace.applyEvent(reverse02("sRotLF"));
      break;
    case "leftRotateRight":
      workspace.applyEvent(reverse02("sRotLB"));
      break;
    case "leftConnective":
      autoRule(workspace, keys(leftLogical));
      break;
    case "rightWeakening":
      workspace.applyEvent(reverse02("swr"));
      break;
    case "rightRotateLeft":
      workspace.applyEvent(reverse02("sRotRB"));
      break;
    case "rightRotateRight":
      workspace.applyEvent(reverse02("sRotRF"));
      break;
    case "rightConnective":
      autoRule(workspace, keys(rightLogical));
      break;
    case "prevBranch":
      workspace.applyEvent(prevBranch());
      break;
    case "nextBranch":
      workspace.applyEvent(nextBranch());
      break;
    case "axiom":
      autoRule(workspace, keys(center));
      break;
    case "undo":
      workspace.applyEvent(undo());
      break;
    case "gazeLeft":
      workspace.moveGaze(-1);
      break;
    case "gazeRight":
      workspace.moveGaze(1);
      break;
    case "gazeConnective":
      workspace.setGazeKind("connective");
      applyGazeRule(workspace, "connective");
      break;
    case "gazeWeakening":
      workspace.setGazeKind("weakening");
      applyGazeRule(workspace, "weakening");
      break;
  }
  rerender();
};
var applyGazeRule = (workspace, kind) => {
  const gaze = workspace.gaze();
  const seq = activeSequent(workspace.currentConjecture());
  const available = workspace.availableRules();
  const chain = computeGhostChain(seq, gaze, kind, available);
  if (!chain || chain.length === 0) return;
  const ant = seq.antecedent.length;
  const suc = seq.succedent.length;
  if (gaze.side === "left") {
    if (ant === 0) return;
    const activeIndex = ant - 1;
    if (gaze.index === activeIndex) {
      if (kind === "connective") {
        autoRule(workspace, keys(leftLogical));
      } else {
        if (!available.includes("swl")) return;
        workspace.applyEvent(reverse02("swl"));
      }
      return;
    }
    if (!available.includes("sRotLB")) return;
    workspace.applyEventWithGaze(reverse02("sRotLB"), {
      side: "left",
      index: gaze.index + 1
    });
  } else {
    if (suc === 0) return;
    const activeIndex = 0;
    if (gaze.index === activeIndex) {
      if (kind === "connective") {
        autoRule(workspace, keys(rightLogical));
      } else {
        if (!available.includes("swr")) return;
        workspace.applyEvent(reverse02("swr"));
      }
      return;
    }
    if (!available.includes("sRotRB")) return;
    workspace.applyEventWithGaze(reverse02("sRotRB"), {
      side: "right",
      index: gaze.index - 1
    });
  }
};
var setupGamepad = (dispatch) => {
  const oldPresses = [];
  let active2 = false;
  let chordFired = false;
  const loop = () => {
    if (!active2) return;
    const gp = navigator.getGamepads()[0];
    if (gp) {
      for (const [button, action] of Object.entries(activePadKeyMap())) {
        const index = Number(button);
        const oldPress = oldPresses[index] ?? false;
        const newPress = gp.buttons[index]?.pressed ?? false;
        if (newPress !== oldPress) {
          if (newPress) {
            markGamepadInput();
            setTimeout(() => dispatch(action), 0);
          }
          oldPresses[index] = newPress;
        }
      }
      const l3 = gp.buttons[10]?.pressed ?? false;
      const r3 = gp.buttons[11]?.pressed ?? false;
      if (l3 && r3 && !chordFired) {
        markGamepadInput();
        setTimeout(toggleHotMode, 0);
        chordFired = true;
      }
      if (!l3 && !r3) chordFired = false;
    }
    requestAnimationFrame(loop);
  };
  const onConnected = () => {
    if (active2) return;
    active2 = true;
    onGamepadConnected();
    loop();
  };
  const onDisconnected = () => {
    const stillConnected = Array.from(navigator.getGamepads()).some(
      (p) => p !== null
    );
    if (!stillConnected) {
      active2 = false;
      onGamepadDisconnected();
    }
  };
  window.addEventListener("gamepadconnected", onConnected);
  window.addEventListener("gamepaddisconnected", onDisconnected);
  const preExisting = Array.from(navigator.getGamepads()).some(
    (p) => p !== null
  );
  if (preExisting) onConnected();
  return () => {
    active2 = false;
    window.removeEventListener("gamepadconnected", onConnected);
    window.removeEventListener("gamepaddisconnected", onDisconnected);
  };
};

// src/web/campaign.ts
var createListing = (ws, onSelect) => {
  const shroud = document.createElement("div");
  shroud.setAttribute("class", "shroud");
  shroud.setAttribute("style", "display: none;");
  shroud.onclick = (ev) => {
    ev.preventDefault();
    shroud.setAttribute("style", "display: none;");
  };
  const panel = document.createElement("div");
  panel.setAttribute("class", "level-select");
  panel.onclick = (ev) => {
    ev.preventDefault();
    return false;
  };
  const close = document.createElement("a");
  close.setAttribute("class", "close");
  close.innerHTML = "\u2716";
  close.onclick = (ev) => {
    ev.preventDefault();
    shroud.setAttribute("style", "display: none;");
  };
  panel.appendChild(close);
  const levels = document.createElement("div");
  levels.setAttribute("class", "levels");
  ws.listConjectures().forEach(([id, challenge2]) => {
    const item = document.createElement("div");
    item.setAttribute("class", "level" + (id === ws.selected ? " active" : ""));
    item.onclick = (ev) => {
      ev.preventDefault();
      onSelect(id);
    };
    const title = document.createElement("div");
    title.setAttribute("class", "title");
    title.innerHTML = id;
    item.appendChild(title);
    const pinned82 = isTutorial(challenge2) ? challenge2.pinned : [];
    const rules79 = document.createElement("div");
    rules79.setAttribute("class", "rules");
    rules79.innerHTML = challenge2.rules.map((rule) => {
      const text = html(
        fromRuleId(rule, t("sideLeft"), t("sideRight"))(basic)
      );
      if (pinned82.includes(rule)) {
        return `<span class="pinned">${text}</span>`;
      }
      return text;
    }).join(", ");
    item.appendChild(rules79);
    const goal89 = document.createElement("div");
    goal89.setAttribute("class", "goal");
    goal89.innerHTML = html(fromSequent(challenge2.goal)(basic));
    item.appendChild(goal89);
    levels.appendChild(item);
  });
  panel.appendChild(levels);
  shroud.appendChild(panel);
  return shroud;
};
var createControls = (ws, _listingEl, rerender, onMenu, showLevelButton, onLevel) => {
  const canUndo = activePath(ws.currentConjecture()).length > 0;
  const undoEnabled = canUndo || isGazeModeActive();
  const panel = document.createElement("div");
  panel.setAttribute("class", "controls");
  panel.appendChild(
    createButton(t("menu"), false, onMenu, getActionHint("menu"))
  );
  if (showLevelButton) {
    panel.appendChild(
      createButton(t("level"), false, onLevel, getActionHint("level"))
    );
  }
  panel.appendChild(
    createButton(
      t("undo"),
      !undoEnabled,
      () => {
        if (canUndo) {
          ws.applyEvent({ kind: "undo" });
        } else {
          setGazeModeActive(false);
        }
        rerender();
      },
      getActionHint("undo")
    )
  );
  return panel;
};
var createCongrats = (ws, selectLevel, rerender) => {
  const hurray = document.createElement("div");
  hurray.setAttribute("class", "hurray");
  hurray.innerHTML = t("congratulations");
  const buttons = document.createElement("div");
  buttons.setAttribute("class", "congrabuttons");
  buttons.appendChild(
    createButton(
      { long: t("prevLevel"), short: t("prevLevelShort") },
      false,
      () => selectLevel(ws.previousConjectureId()),
      dualHint("p", "undo")
    )
  );
  buttons.appendChild(
    createButton(
      { long: t("playAgain"), short: t("playAgainShort") },
      false,
      () => {
        ws.applyEvent(reset());
        rerender();
      },
      getActionHint("reset")
    )
  );
  buttons.appendChild(
    createButton(
      { long: t("nextLevel"), short: t("nextLevelShort") },
      false,
      () => selectLevel(ws.nextConjectureId()),
      dualHint("\u2423", "axiom")
    )
  );
  return { hurray, buttons };
};
var mountCampaign = (container, navigate2, session2) => {
  setDefaultRulesVisible(false);
  let levelPresses = 0;
  const toggleLevel = (listingEl2) => {
    levelPresses += 1;
    if (levelPresses < 2) return;
    if (levelPresses === 2) {
      rerender();
      return;
    }
    const isHidden = listingEl2.style.display === "none";
    if (isHidden) {
      listingEl2.removeAttribute("style");
    } else {
      listingEl2.setAttribute("style", "display: none;");
    }
  };
  const ws = session2.workspace;
  const selectLevel = (id) => {
    if (ws.isConjectureId(id)) {
      ws.selectConjecture(id);
      setGazeModeActive(false);
      history.pushState(
        { screen: "campaign", selected: id },
        "",
        `?mode=campaign&level=${id}`
      );
    }
    rerender();
  };
  let listingEl = createListing(ws, selectLevel);
  let pausePopupOpen = false;
  const togglePausePopup = () => {
    pausePopupOpen = !pausePopupOpen;
    rerender();
  };
  const closePausePopup = () => {
    pausePopupOpen = false;
    rerender();
  };
  const exitToMenu = () => {
    pausePopupOpen = false;
    navigate2("menu");
  };
  const resetFromPopup = () => {
    if (activePath(ws.currentConjecture()).length > 0) {
      ws.applyEvent(reset());
    }
    setGazeModeActive(false);
    pausePopupOpen = false;
    rerender();
  };
  const rerender = () => {
    container.innerHTML = "";
    listingEl = createListing(ws, selectLevel);
    container.appendChild(listingEl);
    const controlsEl = createControls(
      ws,
      listingEl,
      rerender,
      togglePausePopup,
      levelPresses >= 2,
      () => toggleLevel(listingEl)
    );
    const makeCongrats = () => createCongrats(ws, selectLevel, rerender);
    container.appendChild(createBench(ws, makeCongrats, controlsEl, rerender));
    if (pausePopupOpen) {
      const canReset = activePath(ws.currentConjecture()).length > 0;
      const resetEnabled = canReset || isGazeModeActive();
      container.appendChild(
        createPausePopup(
          closePausePopup,
          exitToMenu,
          resetFromPopup,
          !resetEnabled
        )
      );
    }
  };
  const onSolved = (action) => {
    switch (action) {
      case "leftWeakening":
      case "rightWeakening":
        ws.applyEvent(reset());
        break;
      case "axiom":
      case "rightConnective":
        selectLevel(ws.nextConjectureId());
        return;
      case "undo":
        selectLevel(ws.previousConjectureId());
        return;
    }
    rerender();
  };
  const baseDispatch = createDispatch(
    () => ws,
    rerender,
    navigate2,
    onSolved,
    () => toggleLevel(listingEl),
    togglePausePopup
  );
  const dispatch = (action) => {
    if (action === "exit") {
      if (pausePopupOpen) exitToMenu();
      return;
    }
    if (action === "reset" && pausePopupOpen) {
      resetFromPopup();
      return;
    }
    if (action === "undo" && pausePopupOpen) {
      closePausePopup();
      return;
    }
    if (pausePopupOpen && action !== "menu") return;
    baseDispatch(action);
  };
  const params = new URLSearchParams(window.location.search);
  const level = params.get("level") ?? "";
  if (ws.isConjectureId(level)) {
    ws.selectConjecture(level);
  }
  rerender();
  const handleKey = (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    markKeyboardInput();
    console.log(ev.code);
    if (ev.code === "KeyP" && ws.isSolved()) {
      selectLevel(ws.previousConjectureId());
      return;
    }
    if (ev.code === "Slash" || ev.code === "Equal") {
      zoomTreeOut();
      rerender();
      return;
    }
    if (ev.code === "Minus") {
      zoomTreeIn();
      rerender();
      return;
    }
    if (ev.code === "Digit0") {
      zoomTreeReset();
      rerender();
      return;
    }
    const action = qwertyKeyMap[ev.code];
    if (action) dispatch(action);
  };
  document.addEventListener("keydown", handleKey);
  const cleanupGamepad = setupGamepad(dispatch);
  const unsubscribeGamepad = subscribeGamepad(rerender);
  const cleanup = () => {
    document.removeEventListener("keydown", handleKey);
    cleanupGamepad();
    unsubscribeGamepad();
  };
  return { cleanup, rerender };
};

// src/web/random.ts
var createControls2 = (getWorkspace, rerender, onMenu) => {
  const ws = getWorkspace();
  const canUndo = activePath(ws.currentConjecture()).length > 0;
  const undoEnabled = canUndo || isGazeModeActive();
  const panel = document.createElement("div");
  panel.setAttribute("class", "controls");
  panel.appendChild(
    createButton(t("menu"), false, onMenu, getActionHint("menu"))
  );
  panel.appendChild(
    createButton(
      t("undo"),
      !undoEnabled,
      () => {
        if (canUndo) {
          ws.applyEvent({ kind: "undo" });
        } else {
          setGazeModeActive(false);
        }
        rerender();
      },
      getActionHint("undo")
    )
  );
  return panel;
};
var createCongrats2 = (onNew, onSettings) => {
  const hurray = document.createElement("div");
  hurray.setAttribute("class", "hurray");
  hurray.innerHTML = t("congratulations");
  const buttons = document.createElement("div");
  buttons.setAttribute("class", "congrabuttons");
  buttons.appendChild(createButton(t("changeSettings"), false, onSettings));
  buttons.appendChild(
    createButton(t("newChallenge"), false, onNew, dualHint("n", "axiom"))
  );
  return { hurray, buttons };
};
var mountRandom = (container, navigate2, session2, onNewChallenge) => {
  setDefaultRulesVisible(false);
  const getWorkspace = () => session2.workspace;
  const onNew = () => {
    onNewChallenge();
    setGazeModeActive(false);
    rerender();
  };
  let pausePopupOpen = false;
  const togglePausePopup = () => {
    pausePopupOpen = !pausePopupOpen;
    rerender();
  };
  const closePausePopup = () => {
    pausePopupOpen = false;
    rerender();
  };
  const exitToMenu = () => {
    pausePopupOpen = false;
    navigate2("menu");
  };
  const openSettings = () => {
    pausePopupOpen = false;
    navigate2("random-config");
  };
  const resetFromPopup = () => {
    const ws = getWorkspace();
    if (activePath(ws.currentConjecture()).length > 0) {
      ws.applyEvent(reset());
    }
    setGazeModeActive(false);
    pausePopupOpen = false;
    rerender();
  };
  const freshFromPopup = () => {
    pausePopupOpen = false;
    onNew();
  };
  const rerender = () => {
    const ws = getWorkspace();
    container.innerHTML = "";
    const controlsEl = createControls2(getWorkspace, rerender, togglePausePopup);
    const makeCongrats = () => createCongrats2(onNew, openSettings);
    container.appendChild(createBench(ws, makeCongrats, controlsEl, rerender));
    if (pausePopupOpen) {
      const canReset = activePath(ws.currentConjecture()).length > 0;
      const resetEnabled = canReset || isGazeModeActive();
      container.appendChild(
        createPausePopup(
          closePausePopup,
          exitToMenu,
          resetFromPopup,
          !resetEnabled,
          freshFromPopup,
          openSettings
        )
      );
    }
  };
  const onSolved = (action) => {
    const ws = getWorkspace();
    switch (action) {
      case "leftWeakening":
      case "rightWeakening":
        ws.applyEvent(reset());
        break;
      case "axiom":
      case "rightConnective":
        onNew();
        return;
    }
    rerender();
  };
  const baseDispatch = createDispatch(
    getWorkspace,
    rerender,
    navigate2,
    onSolved,
    void 0,
    togglePausePopup
  );
  const dispatch = (action) => {
    if (action === "exit") {
      if (pausePopupOpen) exitToMenu();
      return;
    }
    if (action === "reset" && pausePopupOpen) {
      resetFromPopup();
      return;
    }
    if (action === "undo" && pausePopupOpen) {
      closePausePopup();
      return;
    }
    if (pausePopupOpen && action !== "menu") return;
    baseDispatch(action);
  };
  rerender();
  const handleKey = (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    markKeyboardInput();
    if (ev.code === "KeyN") {
      onNew();
      return;
    }
    if (ev.code === "Slash" || ev.code === "Equal") {
      zoomTreeOut();
      rerender();
      return;
    }
    if (ev.code === "Minus") {
      zoomTreeIn();
      rerender();
      return;
    }
    if (ev.code === "Digit0") {
      zoomTreeReset();
      rerender();
      return;
    }
    const action = qwertyKeyMap[ev.code];
    if (action) dispatch(action);
  };
  document.addEventListener("keydown", handleKey);
  const cleanupGamepad = setupGamepad(dispatch);
  const unsubscribeGamepad = subscribeGamepad(rerender);
  const cleanup = () => {
    document.removeEventListener("keydown", handleKey);
    cleanupGamepad();
    unsubscribeGamepad();
  };
  return { cleanup, rerender };
};

// src/web/system.ts
var mountSystem = (container, _navigate) => {
  const render = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    container.innerHTML = "";
    const panel = document.createElement("div");
    panel.setAttribute("class", "system");
    if (id != null && isHelpSystemId(id)) {
      const back = document.createElement("a");
      back.setAttribute("class", "button system-back");
      back.setAttribute("href", "?mode=system");
      back.innerHTML = t("backToSystems");
      back.onclick = (e) => {
        e.preventDefault();
        history.pushState({ screen: "system" }, "", "?mode=system");
        render();
      };
      panel.appendChild(back);
      const pre = document.createElement("pre");
      pre.setAttribute("class", "system-doc");
      pre.textContent = renderSystemHelp(id);
      panel.appendChild(pre);
    } else {
      const title = document.createElement("div");
      title.setAttribute("class", "system-title");
      title.innerHTML = t("systems");
      panel.appendChild(title);
      const list = document.createElement("div");
      list.setAttribute("class", "system-list");
      for (const sys of Object.values(helpSystems)) {
        const link = document.createElement("a");
        link.setAttribute("class", "button system-item");
        link.setAttribute("href", `?mode=system&id=${sys.id}`);
        link.innerHTML = sys.name;
        link.onclick = (e) => {
          e.preventDefault();
          history.pushState(
            { screen: "system" },
            "",
            `?mode=system&id=${sys.id}`
          );
          render();
        };
        list.appendChild(link);
      }
      panel.appendChild(list);
    }
    container.appendChild(panel);
  };
  render();
  return { cleanup: () => {
  }, rerender: render };
};

// src/random/config.ts
var defaultRandomConfig = () => ({
  size: 10,
  connectives: {
    negation: 1,
    implication: 3,
    conjunction: 3,
    disjunction: 3
  },
  symbols: {
    p: 6,
    q: 5,
    r: 5,
    s: 2,
    u: 1,
    v: 1,
    falsum: 1,
    verum: 1
  },
  targetNonStructural: 10,
  bypassPercent: 0
});

// src/web/challenge-protocol.ts
var serializeConfig = (config) => config;

// src/web/random-config.ts
var pickNumber = (params, key, fallback) => {
  const raw2 = params.get(key);
  if (raw2 === null || raw2 === "") return fallback;
  const value = parseFloat(raw2);
  return Number.isFinite(value) ? value : fallback;
};
var atomKeys = [
  "p",
  "q",
  "r",
  "s",
  "u",
  "v"
];
var parseConfigFromParams = (params) => {
  const defaults = defaultRandomConfig();
  const symbolsParam = params.get("symbols");
  const connectivesParam = params.get("connectives");
  const symbols = { ...defaults.symbols };
  if (symbolsParam !== null) {
    for (const key of atomKeys) {
      symbols[key] = symbolsParam.includes(key) ? defaults.symbols[key] : 0;
    }
  }
  if (connectivesParam !== null) {
    symbols.falsum = connectivesParam.includes("f") ? defaults.symbols.falsum : 0;
    symbols.verum = connectivesParam.includes("v") ? defaults.symbols.verum : 0;
  }
  const connectives2 = { ...defaults.connectives };
  if (connectivesParam !== null) {
    connectives2.implication = connectivesParam.includes("i") ? defaults.connectives.implication : 0;
    connectives2.conjunction = connectivesParam.includes("c") ? defaults.connectives.conjunction : 0;
    connectives2.disjunction = connectivesParam.includes("d") ? defaults.connectives.disjunction : 0;
    connectives2.negation = connectivesParam.includes("n") ? defaults.connectives.negation : 0;
  }
  return {
    size: pickNumber(params, "formula_size", defaults.size),
    targetNonStructural: pickNumber(
      params,
      "proof_size",
      defaults.targetNonStructural
    ),
    bypassPercent: pickNumber(params, "chaoticity", defaults.bypassPercent),
    connectives: connectives2,
    symbols
  };
};
var setConfigParams = (config, params) => {
  const symbols = atomKeys.filter((k) => config.symbols[k] > 0).join("");
  const connectives2 = [
    config.connectives.implication > 0 ? "i" : "",
    config.connectives.conjunction > 0 ? "c" : "",
    config.connectives.disjunction > 0 ? "d" : "",
    config.connectives.negation > 0 ? "n" : "",
    config.symbols.falsum > 0 ? "f" : "",
    config.symbols.verum > 0 ? "v" : ""
  ].join("");
  params.set("symbols", symbols);
  params.set("connectives", connectives2);
  params.set("formula_size", String(config.size));
  params.set(
    "proof_size",
    config.targetNonStructural === Infinity ? "" : String(config.targetNonStructural)
  );
  params.set("chaoticity", String(config.bypassPercent));
};
var TARGET_COUNT = 10;
var entryDistance = (nonStructural, config) => {
  const diff = nonStructural - config.targetNonStructural;
  if (diff === 0) return 0;
  return diff > 0 ? diff * 2 - 1 : -diff * 2;
};
var insertSorted = (entries2, entry) => {
  const result = [...entries2];
  const idx = result.findIndex((e) => e.distance > entry.distance);
  if (idx === -1) {
    result.push(entry);
  } else {
    result.splice(idx, 0, entry);
  }
  return result.slice(0, TARGET_COUNT);
};
var isDone = (entries2) => entries2.length >= TARGET_COUNT && entries2.every((e) => e.distance === 0);
var renderAtom = (name4) => html(fromAtom(atom(name4))(basic));
var renderFormula = (p) => {
  const segments = fromProp(p)(basic);
  return html(segments);
};
var timeoutForBuffer = (bufferSize) => {
  if (bufferSize === 0) return 3e4;
  if (bufferSize < 5) return 1e4;
  return 2e3;
};
var createPreviewWorker = (config, onResult) => {
  const worker = new Worker("lk.w.js");
  worker.onmessage = (e) => {
    onResult(e.data);
  };
  const send = (msg) => {
    worker.postMessage(msg);
  };
  const workerConfig = () => ({
    ...config,
    bypassPercent: 0,
    targetNonStructural: Infinity
  });
  send({ type: "configure", config: serializeConfig(workerConfig()) });
  send({ type: "timeout", ms: timeoutForBuffer(0) });
  send({ type: "resume" });
  return {
    configure: (newConfig) => {
      config = newConfig;
      send({ type: "pause" });
      send({
        type: "configure",
        config: serializeConfig(workerConfig())
      });
      send({ type: "timeout", ms: timeoutForBuffer(0) });
      send({ type: "resume" });
    },
    updateTimeout: (bufferSize) => {
      send({ type: "timeout", ms: timeoutForBuffer(bufferSize) });
    },
    terminate: () => {
      worker.terminate();
    }
  };
};
var renderPreviewList = (entries2) => {
  const list = document.querySelector(".config-preview-list");
  if (!list) return;
  list.innerHTML = "";
  for (const entry of entries2) {
    const item = document.createElement("div");
    item.className = "config-preview-item" + (entry.distance > 0 ? " approximate" : "");
    const count = document.createElement("span");
    count.className = "config-preview-count";
    count.textContent = String(entry.nonStructural);
    item.appendChild(count);
    const formula = document.createElement("span");
    formula.innerHTML = renderFormula(entry.formula);
    item.appendChild(formula);
    list.appendChild(item);
  }
};
var createNumberInput = (value, onChange, min = 0, max, step = 1, placeholder) => {
  const input = document.createElement("input");
  input.type = "number";
  input.className = "config-input";
  input.min = String(min);
  if (max !== void 0) input.max = String(max);
  input.step = String(step);
  if (value === Infinity) {
    input.value = "";
    input.placeholder = placeholder ?? "";
  } else {
    input.value = String(value);
  }
  input.onchange = () => {
    const parsed = parseFloat(input.value);
    if (input.value === "") {
      onChange(Infinity);
    } else if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };
  return input;
};
var createRow = (label, input) => {
  const row = document.createElement("div");
  row.className = "config-row";
  const labelEl = document.createElement("label");
  labelEl.className = "config-label";
  labelEl.textContent = label;
  row.appendChild(labelEl);
  row.appendChild(input);
  return row;
};
var createSection = (title) => {
  const section = document.createElement("div");
  section.className = "config-section";
  const heading = document.createElement("div");
  heading.className = "config-section-title";
  heading.textContent = title;
  section.appendChild(heading);
  return section;
};
var mountRandomConfig = (container, navigate2, onStart) => {
  const config = parseConfigFromParams(
    new URLSearchParams(window.location.search)
  );
  const syncUrl = () => {
    const params = new URLSearchParams(window.location.search);
    setConfigParams(config, params);
    history.replaceState(history.state, "", `?${params.toString()}`);
  };
  let entries2 = [];
  let totalFormulasTried = 0;
  let totalTautologiesFound = 0;
  let totalSolved = 0;
  let searchStartTime = Date.now();
  let lastWorkerUpdate = Date.now();
  let clockInterval;
  const updateStats = () => {
    const el = document.querySelector(".config-stats");
    if (!el) return;
    const now = Date.now();
    const elapsed = (now - searchStartTime) / 1e3;
    const rate = elapsed > 0 ? totalFormulasTried / elapsed : 0;
    const sinceUpdate = ((now - lastWorkerUpdate) / 1e3).toFixed(1);
    el.textContent = formatStats({
      formulas: totalFormulasTried,
      rate: rate.toFixed(1),
      tautologies: totalTautologiesFound,
      solved: totalSolved,
      sinceUpdate
    });
  };
  const startClock = () => {
    stopClock();
    clockInterval = setInterval(updateStats, 200);
  };
  const stopClock = () => {
    if (clockInterval !== void 0) {
      clearInterval(clockInterval);
      clockInterval = void 0;
    }
  };
  const handleResult = (msg) => {
    lastWorkerUpdate = Date.now();
    if (msg.type === "stats") {
      totalFormulasTried += msg.formulasTried;
      totalTautologiesFound += msg.tautologiesFound;
      totalSolved += msg.solved;
      updateStats();
      return;
    }
    if (msg.type === "challenge") {
      totalFormulasTried += msg.result.formulasTried;
      updateStats();
      if (isDone(entries2)) return;
      const { challenge: challenge2, nonStructuralCount } = msg.result;
      const formula = challenge2.goal.succedent[0];
      if (formula === void 0) return;
      const distance = entryDistance(nonStructuralCount, config);
      const entry = {
        formula,
        nonStructural: nonStructuralCount,
        distance
      };
      entries2 = insertSorted(entries2, entry);
      renderPreviewList(entries2);
      previewWorker?.updateTimeout(entries2.length);
      if (isDone(entries2) && previewWorker) {
        previewWorker.terminate();
        previewWorker = void 0;
        stopClock();
      }
    }
  };
  let previewWorker = createPreviewWorker(
    config,
    handleResult
  );
  const restartSearch = () => {
    syncUrl();
    entries2 = [];
    totalFormulasTried = 0;
    totalTautologiesFound = 0;
    totalSolved = 0;
    searchStartTime = Date.now();
    lastWorkerUpdate = Date.now();
    if (previewWorker) previewWorker.terminate();
    previewWorker = createPreviewWorker(config, handleResult);
    renderPreviewList(entries2);
    startClock();
  };
  const onInputChange = (setter) => (v2) => {
    setter(v2);
    restartSearch();
  };
  const rerender = () => {
    container.innerHTML = "";
    const layout = document.createElement("div");
    layout.className = "random-config";
    layout.appendChild(createLangSwitcher());
    const title = document.createElement("div");
    title.className = "config-title";
    title.textContent = t("randomConfig");
    layout.appendChild(title);
    const columns = document.createElement("div");
    columns.className = "config-columns";
    const settings = document.createElement("div");
    settings.className = "config-settings";
    const shapeSection = createSection(t("formulaShape"));
    const connectiveHeading = document.createElement("div");
    connectiveHeading.className = "config-subsection-title";
    connectiveHeading.textContent = t("connectives");
    shapeSection.appendChild(connectiveHeading);
    const defaultConnectives = defaultRandomConfig().connectives;
    const connectiveKeys = [
      { key: "implication", label: t("implicationWeight"), symbol: "\u2192" },
      { key: "conjunction", label: t("conjunctionWeight"), symbol: "\u2227" },
      { key: "disjunction", label: t("disjunctionWeight"), symbol: "\u2228" },
      { key: "negation", label: t("negationWeight"), symbol: "\xAC" }
    ];
    const createToggle = (content, useHtml, title2, isActive, onToggle) => {
      const btn = document.createElement("pre");
      btn.className = "button toggle";
      if (useHtml) {
        btn.innerHTML = content;
      } else {
        btn.textContent = content;
      }
      btn.title = title2;
      const led = document.createElement("span");
      led.className = "led" + (isActive() ? " on" : "");
      btn.appendChild(led);
      btn.onclick = () => {
        onToggle();
        led.className = "led" + (isActive() ? " on" : "");
        restartSearch();
      };
      return btn;
    };
    const connectiveToggles = document.createElement("div");
    connectiveToggles.className = "config-toggles";
    for (const { key, label, symbol } of connectiveKeys) {
      connectiveToggles.appendChild(
        createToggle(
          symbol,
          false,
          label,
          () => config.connectives[key] > 0,
          () => {
            config.connectives[key] = config.connectives[key] > 0 ? 0 : defaultConnectives[key];
          }
        )
      );
    }
    const defaultSymbols = defaultRandomConfig().symbols;
    const constantKeys = [
      { key: "falsum", symbol: "\u22A5" },
      { key: "verum", symbol: "\u22A4" }
    ];
    for (const { key, symbol } of constantKeys) {
      connectiveToggles.appendChild(
        createToggle(
          symbol,
          false,
          symbol,
          () => config.symbols[key] > 0,
          () => {
            config.symbols[key] = config.symbols[key] > 0 ? 0 : defaultSymbols[key];
          }
        )
      );
    }
    shapeSection.appendChild(connectiveToggles);
    const symbolHeading = document.createElement("div");
    symbolHeading.className = "config-subsection-title";
    symbolHeading.textContent = t("symbols");
    shapeSection.appendChild(symbolHeading);
    const symbolKeys = [
      "p",
      "q",
      "r",
      "s",
      "u",
      "v"
    ];
    const symbolToggles = document.createElement("div");
    symbolToggles.className = "config-toggles";
    for (const key of symbolKeys) {
      symbolToggles.appendChild(
        createToggle(
          renderAtom(key),
          true,
          key,
          () => config.symbols[key] > 0,
          () => {
            config.symbols[key] = config.symbols[key] > 0 ? 0 : defaultSymbols[key];
          }
        )
      );
    }
    shapeSection.appendChild(symbolToggles);
    settings.appendChild(shapeSection);
    const filterHeading = document.createElement("div");
    filterHeading.className = "config-subsection-title";
    filterHeading.textContent = t("filter");
    shapeSection.appendChild(filterHeading);
    shapeSection.appendChild(
      createRow(
        t("size"),
        createNumberInput(
          config.size,
          onInputChange((v2) => {
            config.size = v2;
          }),
          1,
          30
        )
      )
    );
    shapeSection.appendChild(
      createRow(
        t("targetNonStructural"),
        createNumberInput(
          config.targetNonStructural,
          onInputChange((v2) => {
            config.targetNonStructural = v2;
          }),
          1
        )
      )
    );
    shapeSection.appendChild(
      createRow(
        t("bypassPercent"),
        createNumberInput(
          config.bypassPercent,
          onInputChange((v2) => {
            config.bypassPercent = v2;
          }),
          0,
          100
        )
      )
    );
    const buttons = document.createElement("div");
    buttons.className = "config-buttons";
    const backBtn = document.createElement("div");
    backBtn.className = "button";
    backBtn.textContent = t("back");
    backBtn.onclick = () => navigate2("menu");
    buttons.appendChild(backBtn);
    const startBtn = document.createElement("div");
    startBtn.className = "button";
    startBtn.textContent = t("start");
    startBtn.onclick = () => onStart(config);
    buttons.appendChild(startBtn);
    settings.appendChild(buttons);
    columns.appendChild(settings);
    const preview = document.createElement("div");
    preview.className = "config-preview";
    const previewTitle = document.createElement("div");
    previewTitle.className = "config-section-title";
    previewTitle.textContent = t("preview");
    preview.appendChild(previewTitle);
    const stats = document.createElement("div");
    stats.className = "config-stats";
    preview.appendChild(stats);
    const list = document.createElement("div");
    list.className = "config-preview-list";
    preview.appendChild(list);
    columns.appendChild(preview);
    layout.appendChild(columns);
    container.appendChild(layout);
    restartSearch();
  };
  rerender();
  const cleanup = () => {
    stopClock();
    if (previewWorker) {
      previewWorker.terminate();
      previewWorker = void 0;
    }
  };
  return { cleanup, rerender };
};

// src/solver/bruteStructure0.ts
var seqKey = (s) => JSON.stringify([s.antecedent, s.succedent]);
var buildStructurePath = (d, rules79, p) => {
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
    const current2 = queue.shift();
    if (!current2) break;
    const currentKey = seqKey(current2.result);
    for (const [rId, rule] of entries(reverseStructure0)) {
      const ruleId2 = rId;
      if (!includes(rules79, ruleId2)) continue;
      const reversed = rule.tryReverse(current2);
      if (!reversed || reversed.kind !== "transformation") continue;
      const [dep] = reversed.deps;
      if (!dep || dep.kind !== "premise") continue;
      const depKey = seqKey(dep.result);
      if (visited.has(depKey)) continue;
      visited.add(depKey);
      nodes.set(depKey, dep);
      parent.set(depKey, { parentKey: currentKey, ruleId: ruleId2 });
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
var bruteStructure0 = (d, rules79, p) => function* () {
  const result = buildStructurePath(d, rules79, p);
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
var bruteWeaken0 = (d, rules79, p) => function* () {
  if (equals3(d.result, p.result)) {
    yield proofUsing(d.result, p.deps, p.rule);
    return;
  }
  const swl2 = "swl";
  if (includes(rules79, swl2) && d.result.antecedent.length > p.result.antecedent.length && reverseStructure0[swl2].isResultDerivation(d)) {
    const step = reverseStructure0.swl.reverse(d);
    const [dep] = step.deps;
    if (dep.kind === "premise") {
      yield* map(
        bruteWeaken0(dep, rules79, p),
        (depProof) => proofUsing(step.result, [depProof], swl2)
      )();
    }
    return;
  }
  const swr2 = "swr";
  if (includes(rules79, swr2) && d.result.succedent.length > p.result.succedent.length && reverseStructure0[swr2].isResultDerivation(d)) {
    const step = reverseStructure0.swr.reverse(d);
    const [dep] = step.deps;
    if (dep.kind === "premise") {
      yield* map(
        bruteWeaken0(dep, rules79, p),
        (depProof) => proofUsing(step.result, [depProof], swr2)
      )();
    }
    return;
  }
};
var bruteAxiom0 = (d, rules79, limit) => function* () {
  for (const rule of Object.values(reverseAxiom0)) {
    if (!includes(rules79, rule.id)) {
      continue;
    }
    const result = rule.tryReverse(d);
    if (!result) {
      continue;
    }
    yield* brute0(result, rules79, limit)();
  }
};
var candidateConnectives = (rules79, sequent2) => {
  const kinds = /* @__PURE__ */ new Set();
  for (const [rId, rule] of entries(reverse0)) {
    if (!includes(rules79, rId)) continue;
    for (const kind of rule.connectives) kinds.add(kind);
  }
  for (const p of [...sequent2.antecedent, ...sequent2.succedent])
    for (const kind of connectives(p)) kinds.add(kind);
  return kinds;
};
var formulasOfOpCount = (opCount, atoms2, connectives2) => function* () {
  if (opCount === 0) {
    for (const a91 of atoms2) yield atom(a91);
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
var bruteLogic1 = (d, rules79, limit) => function* () {
  const applicableRules3 = entries(reverse1).filter(
    ([rId]) => includes(rules79, rId)
  );
  if (applicableRules3.length === 0) return;
  const atoms2 = uniq2([
    ...d.result.antecedent.flatMap(atoms),
    ...d.result.succedent.flatMap(atoms)
  ]);
  const connectives2 = candidateConnectives(rules79, d.result);
  for (let opCount = 0; opCount <= limit * 2; opCount += 1) {
    for (const formula of formulasOfOpCount(opCount, atoms2, connectives2)()) {
      for (const [, rule] of applicableRules3) {
        const result = rule.tryReverse(formula)(d);
        if (!result) continue;
        yield* brute0(result, rules79, limit)();
      }
    }
  }
};
var bruteLogic0 = (d, rules79, limit) => function* () {
  yield* flatMap(
    hypoWeaken(d),
    (hypo) => flatMap(
      bruteAxiom0(hypo, rules79, limit),
      (h) => bruteWeaken0(d, rules79, h)
    )
  )();
  for (const rule of Object.values(reverseLogic0)) {
    if (!includes(rules79, rule.id)) {
      continue;
    }
    const result = rule.tryReverse(d);
    if (!result) {
      continue;
    }
    yield* brute0(result, rules79, limit)();
  }
  yield* bruteLogic1(d, rules79, limit)();
};
var hypoStructure = (d, rules79) => function* () {
  const visited = /* @__PURE__ */ new Set();
  const queue = [d];
  while (queue.length > 0) {
    const current2 = queue.shift();
    if (!current2) break;
    const key = seqKey(current2.result);
    if (visited.has(key)) continue;
    visited.add(key);
    yield current2;
    for (const [rId, rule] of entries(reverseStructure0)) {
      const ruleId2 = rId;
      if (!includes(rules79, ruleId2)) continue;
      const reversed = rule.tryReverse(current2);
      if (!reversed || reversed.kind !== "transformation") continue;
      const [dep] = reversed.deps;
      if (!dep || dep.kind !== "premise") continue;
      queue.push(dep);
    }
  }
};
var brute0Premise = (d, rules79, limit) => function* () {
  if (limit < 1) {
    return;
  }
  if (!isTautology2(d.result)) {
    return;
  }
  yield* flatMap(
    hypoStructure(d, rules79),
    (hypo) => flatMap(
      bruteLogic0(hypo, rules79, limit),
      (h) => bruteStructure0(d, rules79, h)
    )
  )();
};
var brute0Transformation = (d, rules79, limit) => function* () {
  const depProofs = sequence(
    d.deps.map((dep) => brute0(dep, rules79, limit - 1))
  );
  yield* map(
    depProofs,
    (proofs) => proofUsing(d.result, proofs, d.rule)
  )();
};
var brute0 = (d, rules79, limit) => function* () {
  switch (d.kind) {
    case "premise":
      yield* brute0Premise(d, rules79, limit)();
      break;
    case "transformation": {
      const rule = d.rule;
      if (includes(rules79, rule)) {
        yield* brute0Transformation({ ...d, rule }, rules79, limit)();
      }
      break;
    }
  }
};
var tryAtDepth = (c, limit) => {
  const proofs = head2(brute0(premise(c.goal), c.rules, limit));
  return isNonEmptyArray(proofs) ? proofs[0] : void 0;
};
function* bruteSearch(c) {
  for (let limit = 0; ; limit += 1) {
    const proof = tryAtDepth(c, limit);
    if (proof) return [proof, limit];
    yield;
  }
}
var brute = (c) => {
  const gen2 = bruteSearch(c);
  while (true) {
    const { done, value } = gen2.next();
    if (done === true) return value;
  }
};

// src/random/challenge.ts
var RULES = [
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
];
var STRUCTURAL_RULES = /* @__PURE__ */ new Set([
  "swl",
  "swr",
  "scl",
  "scr",
  "sRotLF",
  "sRotLB",
  "sRotRF",
  "sRotRB",
  "sxl",
  "sxr"
]);
var countNonStructural = (d) => {
  if (d.kind === "premise") return 0;
  const self = STRUCTURAL_RULES.has(d.rule) ? 0 : 1;
  return self + d.deps.reduce((sum, dep) => sum + countNonStructural(dep), 0);
};
var random2 = (size = 10, minDifficulty = 8) => () => {
  const rules79 = RULES;
  let solution89;
  while (typeof solution89 === "undefined") {
    ;
    [solution89] = head2(
      flatMap(
        filter(repeatIO(random(size)), isTautology),
        (tautology) => {
          const [proof, difficulty] = brute({
            goal: conclusion(tautology),
            rules: rules79
          });
          return difficulty < minDifficulty ? empty() : of(proof);
        }
      )
    );
  }
  return {
    rules: rules79,
    goal: solution89.result,
    solution: solution89
  };
};
var bellRandom = (min, max, center3) => {
  const mid = center3 ?? (min + max) / 2;
  const stddev = Math.max(max - mid, mid - min) / 3;
  let value;
  do {
    const u1 = Math.random();
    const u2 = Math.random();
    const z79 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    value = Math.round(mid + z79 * stddev);
  } while (value < min || value > max);
  return value;
};
var CONNECTIVE_KEYS = [
  "negation",
  "implication",
  "conjunction",
  "disjunction"
];
var randomSubsetConnectives = (connectives2) => {
  const keys2 = CONNECTIVE_KEYS.filter((k) => connectives2[k] > 0);
  if (keys2.length <= 1) return connectives2;
  const count = bellRandom(1, keys2.length);
  let selected;
  do {
    const shuffled = keys2.sort(() => Math.random() - 0.5);
    selected = new Set(shuffled.slice(0, count));
  } while (selected.size === 1 && selected.has("negation"));
  return {
    negation: selected.has("negation") ? connectives2.negation : 0,
    implication: selected.has("implication") ? connectives2.implication : 0,
    conjunction: selected.has("conjunction") ? connectives2.conjunction : 0,
    disjunction: selected.has("disjunction") ? connectives2.disjunction : 0
  };
};
var SYMBOL_KEYS = [
  "p",
  "q",
  "r",
  "s",
  "u",
  "v",
  "falsum",
  "verum"
];
var randomSubsetSymbols = (symbols) => {
  const keys2 = SYMBOL_KEYS.filter((k) => symbols[k] > 0);
  if (keys2.length <= 1) return symbols;
  const count = bellRandom(1, keys2.length, Math.min(4, keys2.length));
  const shuffled = keys2.sort(() => Math.random() - 0.5);
  const selected = new Set(shuffled.slice(0, count));
  const result = {
    p: 0,
    q: 0,
    r: 0,
    s: 0,
    u: 0,
    v: 0,
    falsum: 0,
    verum: 0
  };
  for (const k of selected) {
    result[k] = symbols[k];
  }
  return result;
};
function* randomConfiguredStep(config, getTimeout = () => 5e3) {
  const rules79 = RULES;
  const maxDepth = config.targetNonStructural + 10;
  const bypass = config.bypassPercent / 100;
  let formulasTried = 0;
  let tautologiesFound = 0;
  let solved = 0;
  const progress = () => ({
    formulasTried,
    tautologiesFound,
    solved
  });
  while (true) {
    const size = bellRandom(1, config.size);
    const connectives2 = randomSubsetConnectives(config.connectives);
    const symbols = randomSubsetSymbols(config.symbols);
    const formula = randomWeighted(size, connectives2, symbols)();
    formulasTried += 1;
    yield progress();
    const isBypassed = Math.random() < bypass;
    if (isBypassed) {
      return {
        challenge: { rules: rules79, goal: conclusion(formula) },
        nonStructuralCount: 0,
        bypassed: true,
        formulasTried,
        tautologiesFound,
        solved
      };
    }
    if (!isTautology(formula)) continue;
    tautologiesFound += 1;
    const solver = bruteSearch({ goal: conclusion(formula), rules: rules79 });
    let proof;
    let depth = 0;
    const solveStart = Date.now();
    while (depth <= maxDepth) {
      const step = solver.next();
      if (step.done === true) {
        proof = step.value[0];
        break;
      }
      depth += 1;
      if (Date.now() - solveStart > getTimeout()) break;
      yield progress();
    }
    if (proof === void 0) continue;
    solved += 1;
    const nonStructuralCount = countNonStructural(proof);
    if (isFinite(config.targetNonStructural) && nonStructuralCount !== config.targetNonStructural)
      continue;
    return {
      challenge: { rules: rules79, goal: proof.result, solution: proof },
      nonStructuralCount,
      bypassed: false,
      formulasTried,
      tautologiesFound,
      solved
    };
  }
}

// src/web/challenge-pool.ts
var POOL_TARGET = 5;
var FALLBACK_SIZE = 5;
var FALLBACK_MIN_DIFFICULTY = 0;
var RULES2 = [
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
];
var generateBypass = (config) => {
  const size = Math.floor(Math.random() * config.size) + 1;
  const formula = randomWeighted(
    size,
    config.connectives,
    config.symbols
  )();
  return {
    challenge: { rules: [...RULES2], goal: conclusion(formula) },
    nonStructuralCount: 0,
    bypassed: true,
    formulasTried: 1
  };
};
var ChallengePool = class {
  pool = [];
  worker;
  currentConfig;
  constructor() {
    this.worker = new Worker("lk.w.js");
    this.worker.onmessage = (e) => {
      if (e.data.type !== "challenge") return;
      const result = e.data.result;
      if (this.currentConfig && result.nonStructuralCount !== this.currentConfig.targetNonStructural) {
        return;
      }
      this.pool.push(result);
      if (this.pool.length >= POOL_TARGET) {
        this.send({ type: "pause" });
      }
    };
    this.worker.onerror = (e) => {
      console.error("Challenge worker error:", e.message);
    };
    this.send({ type: "resume" });
  }
  send(msg) {
    this.worker.postMessage(msg);
  }
  configure(config, seed) {
    this.currentConfig = config;
    this.pool = seed ?? [];
    this.send({ type: "pause" });
    this.send({
      type: "configure",
      config: serializeConfig({ ...config, bypassPercent: 0 })
    });
    if (this.pool.length < POOL_TARGET) {
      this.send({ type: "resume" });
    }
  }
  take() {
    if (this.currentConfig && Math.random() < this.currentConfig.bypassPercent / 100) {
      return generateBypass(this.currentConfig);
    }
    const result = this.pool.shift();
    if (result !== void 0) {
      if (this.pool.length < POOL_TARGET) {
        this.send({ type: "resume" });
      }
      return result;
    }
    if (this.currentConfig) {
      const looseConfig = {
        ...this.currentConfig,
        targetNonStructural: Infinity,
        bypassPercent: 0
      };
      const gen2 = randomConfiguredStep(looseConfig, () => 1e3);
      while (true) {
        const { done, value } = gen2.next();
        if (done === true) {
          return {
            challenge: value.challenge,
            nonStructuralCount: value.nonStructuralCount,
            bypassed: false,
            formulasTried: value.formulasTried
          };
        }
      }
    }
    const challenge2 = random2(FALLBACK_SIZE, FALLBACK_MIN_DIFFICULTY)();
    return {
      challenge: challenge2,
      nonStructuralCount: 0,
      bypassed: false,
      formulasTried: 0
    };
  }
  cleanup() {
    this.worker.terminate();
  }
};

// src/web.ts
var pool = new ChallengePool();
var session = new Session();
var factory = {
  campaign: () => new Workspace(challenges),
  random: () => new Workspace({ challenge: pool.take().challenge })
};
var gen = repl(session, factory);
gen.next("");
var current = { cleanup: () => {
}, rerender: () => {
} };
var currentScreen = "menu";
var enterMode = (mode) => {
  session.enter(mode, factory[mode]());
};
var screenForSession = () => session.mode ?? "menu";
var navigate = (screen) => {
  current.cleanup();
  if (screen === "menu") {
    setGazeModeActive(false);
    session.returnToMenu();
  }
  if (includes(gameModes, screen)) {
    enterMode(screen);
  }
  currentScreen = screen;
  const currentParams = new URLSearchParams(window.location.search);
  const lang = currentParams.get("lang");
  const nextParams = new URLSearchParams();
  if (lang !== null) nextParams.set("lang", lang);
  let url;
  if (screen === "menu") {
    const qs = nextParams.toString();
    url = qs ? `?${qs}` : window.location.pathname;
  } else {
    nextParams.set("mode", screen);
    if (screen === "random" || screen === "random-config") {
      for (const key of [
        "symbols",
        "connectives",
        "formula_size",
        "proof_size",
        "chaoticity"
      ]) {
        const val = currentParams.get(key);
        if (val !== null) nextParams.set(key, val);
      }
    }
    url = `?${nextParams.toString()}`;
  }
  history.pushState({ screen }, "", url);
  mount(screen);
};
var mount = (screen) => {
  const body = document.getElementById("body");
  if (!body) return;
  switch (screen) {
    case "menu":
      current = mountMenu(body, navigate);
      break;
    case "campaign":
      current = mountCampaign(body, navigate, session);
      break;
    case "random":
      current = mountRandom(body, navigate, session, () => {
        const ws = factory["random"]();
        session.replaceWorkspace(ws);
      });
      break;
    case "system":
      current = mountSystem(body, navigate);
      break;
    case "random-config":
      current = mountRandomConfig(body, navigate, (config) => {
        pool.configure(config);
        current.cleanup();
        currentScreen = "random";
        enterMode("random");
        const params = new URLSearchParams();
        const lang = new URLSearchParams(window.location.search).get("lang");
        if (lang !== null) params.set("lang", lang);
        params.set("mode", "random");
        setConfigParams(config, params);
        history.pushState({ screen: "random" }, "", `?${params.toString()}`);
        mount("random");
      });
      break;
  }
};
var syncScreen = () => {
  const expected = screenForSession();
  if (expected === currentScreen) return;
  current.cleanup();
  if (expected === "menu") setGazeModeActive(false);
  currentScreen = expected;
  const lang = new URLSearchParams(window.location.search).get("lang");
  const langSuffix = lang !== null ? `&lang=${encodeURIComponent(lang)}` : "";
  const menuUrl = lang !== null ? `${window.location.pathname}?lang=${encodeURIComponent(lang)}` : window.location.pathname;
  history.pushState(
    { screen: expected },
    "",
    expected === "menu" ? menuUrl : `?mode=${expected}${langSuffix}`
  );
  mount(expected);
};
var cmd = (input) => {
  const result = gen.next(input);
  console.log(plain(result.value));
  syncScreen();
  current.rerender();
};
Object.assign(window, { cmd });
var init3 = () => {
  const params = new URLSearchParams(window.location.search);
  setLocale(params.get("lang"));
  onLocaleChange(() => current.rerender());
  const mode = params.get("mode");
  if (mode === "campaign" || mode === "random") {
    if (mode === "random") {
      pool.configure(parseConfigFromParams(params));
    }
    enterMode(mode);
    currentScreen = mode;
    mount(mode);
  } else if (mode === "random-config") {
    currentScreen = "random-config";
    mount("random-config");
  } else if (mode === "system") {
    currentScreen = "system";
    mount("system");
  } else if (params.get("level") !== null) {
    enterMode("campaign");
    currentScreen = "campaign";
    mount("campaign");
  } else {
    currentScreen = "menu";
    mount("menu");
  }
  document.documentElement.classList.remove("loading");
};
document.addEventListener("DOMContentLoaded", init3);
window.addEventListener("popstate", (event) => {
  current.cleanup();
  const screen = event.state?.screen ?? "menu";
  if (screen === "menu") {
    setGazeModeActive(false);
    session.returnToMenu();
  }
  if (includes(gameModes, screen)) {
    enterMode(screen);
  }
  currentScreen = screen;
  mount(screen);
});
