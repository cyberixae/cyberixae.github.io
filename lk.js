// src/model/mode.ts
var gameModes = ["random", "campaign"];

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
var isNonEmptyArray = (a87) => {
  return a87.length > 0;
};
var head = (arr) => arr[0];
var last = (arr) => arr.at(-1);
var init = (arr) => arr.slice(0, -1);
var zip = (a87, b) => {
  return Array.from({ length: Math.min(a87.length, b.length) }).map(
    (_, i88) => [a87.at(i88), b.at(i88)]
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
var uniq2 = (arr) => {
  return [...uniq(arr)];
};
var includes = (arr, val) => arr.some((x) => x === val);

// src/utils/seq.ts
var empty = () => function* () {
};
var of = (a87) => function* () {
  yield a87;
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
    const a87 = antecedent();
    if (a87 === false) {
      return true;
    }
    const c = consequent();
    if (c === true) {
      return true;
    }
    if (a87 === null) {
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
var equals = (a87, b) => match(a87, {
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
var head3 = (a87) => {
  const [h] = a87;
  return h;
};
var tail = (a87) => {
  const [_h, ...t2] = a87;
  return t2;
};
var init2 = (a87) => {
  return a87.slice(0, -1);
};
var last2 = (a87) => {
  return a87[a87.length - 1];
};
var isTupleOf0 = (arr) => arr.length === 0;
var isTupleOf1 = (arr) => arr.length === 1;

// src/model/formulas.ts
var equals2 = (fa, fb) => {
  return fa.length === fb.length && zip(fa, fb).every(([a87, b]) => equals(a87, b));
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
var equals3 = (a87, b) => {
  return equals2(a87.antecedent, b.antecedent) && equals2(a87.succedent, b.succedent);
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
var isEquivalent = (a87, b) => equals3(a87.result, b.result);
var replaceDep = (parent, index, d) => {
  const deps = replaceItem(parent.deps, index, d);
  if (!deps) {
    return null;
  }
  if (!zip(parent.deps, deps).every(([a87, b]) => isEquivalent(a87, b))) {
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
  const paths = d.deps.flatMap((dep, i88) => branches(dep, [...path, i88]));
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
  const paths = d.deps.flatMap((dep, i88) => openBranches(dep, [...path, i88]));
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

// src/utils/record.ts
var keys = (s) => Object.keys(s);
var get = (r, k) => r[k];
var entries = (s) => Object.entries(s);

// src/rules/cl.ts
var isCLResult = refineActiveL(isConjunction);
var isCLResultDerivation = refineDerivation(isCLResult);
var cl = (result, deps) => {
  return transformation(result, deps, "cl");
};
var applyCL = (...deps) => {
  const [dep] = deps;
  const \u03B3 = init2(init2(dep.result.antecedent));
  const a87 = last2(init2(dep.result.antecedent));
  const b = last2(dep.result.antecedent);
  const \u03B4 = dep.result.succedent;
  return cl(sequent([...\u03B3, conjunction(a87, b)], \u03B4), deps);
};
var reverseCL = (p) => {
  const \u03B3 = init2(p.result.antecedent);
  const acb = last2(p.result.antecedent);
  const a87 = acb.leftConjunct;
  const b = acb.rightConjunct;
  const \u03B4 = p.result.succedent;
  return cl(p.result, [premise(sequent([...\u03B3, a87, b], \u03B4))]);
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
  const a87 = head3(dep1.result.succedent);
  const b = head3(dep2.result.succedent);
  const \u03B4 = tail(dep1.result.succedent);
  return cr(sequent(\u03B3, [conjunction(a87, b), ...\u03B4]), deps);
};
var reverseCR = (p) => {
  const \u03B3 = p.result.antecedent;
  const acb = head3(p.result.succedent);
  const a87 = acb.leftConjunct;
  const b = acb.rightConjunct;
  const \u03B4 = tail(p.result.succedent);
  return cr(p.result, [
    premise(sequent(\u03B3, [a87, ...\u03B4])),
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
var reverseCut = (p, a87) => {
  const \u03B3 = p.result.antecedent;
  const \u03B4 = p.result.succedent;
  return cut(p.result, [
    premise(sequent(\u03B3, [...\u03B4, a87])),
    premise(sequent([a87, ...\u03B3], \u03B4))
  ]);
};
var tryReverseCut = (a87) => (d) => {
  return isCutResultDerivation(d) ? reverseCut(d, a87) : null;
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
  const a87 = last2(dep1.result.antecedent);
  const b = last2(dep2.result.antecedent);
  const \u03B4 = dep1.result.succedent;
  return dl(sequent([...\u03B3, disjunction(a87, b)], \u03B4), deps);
};
var reverseDL = (p) => {
  const \u03B3 = init2(p.result.antecedent);
  const adb = last2(p.result.antecedent);
  const a87 = adb.leftDisjunct;
  const b = adb.rightDisjunct;
  const \u03B4 = p.result.succedent;
  return dl(p.result, [
    premise(sequent([...\u03B3, a87], \u03B4)),
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
  const a87 = head3(dep.result.succedent);
  const b = head3(tail(dep.result.succedent));
  const \u03B4 = tail(tail(dep.result.succedent));
  return dr(sequent(\u03B3, [disjunction(a87, b), ...\u03B4]), deps);
};
var reverseDR = (p) => {
  const \u03B3 = p.result.antecedent;
  const adb = head3(p.result.succedent);
  const a87 = adb.leftDisjunct;
  const b = adb.rightDisjunct;
  const \u03B4 = tail(p.result.succedent);
  return dr(p.result, [premise(sequent(\u03B3, [a87, b, ...\u03B4]))]);
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
var applyI = (a87) => i(sequent([a87], [a87]));
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
  const a87 = head3(dep1.result.succedent);
  const b = last2(dep2.result.antecedent);
  const \u03B4 = tail(dep1.result.succedent);
  return il(sequent([...\u03B3, implication(a87, b)], \u03B4), deps);
};
var reverseIL = (p) => {
  const \u03B3 = init2(p.result.antecedent);
  const aib = last2(p.result.antecedent);
  const a87 = aib.antecedent;
  const b = aib.consequent;
  const \u03B4 = p.result.succedent;
  return il(p.result, [
    premise(sequent(\u03B3, [a87, ...\u03B4])),
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
  const a87 = last2(dep.result.antecedent);
  const b = head3(dep.result.succedent);
  const \u03B4 = tail(dep.result.succedent);
  return ir(sequent(\u03B3, [implication(a87, b), ...\u03B4]), deps);
};
var reverseIR = (p) => {
  const \u03B3 = p.result.antecedent;
  const aib = head3(p.result.succedent);
  const a87 = aib.antecedent;
  const b = aib.consequent;
  const \u03B4 = tail(p.result.succedent);
  return ir(p.result, [premise(sequent([...\u03B3, a87], [b, ...\u03B4]))]);
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
  const a87 = head3(dep.result.succedent);
  const \u03B4 = tail(dep.result.succedent);
  return nl(sequent([...\u03B3, negation(a87)], \u03B4), deps);
};
var reverseNL = (p) => {
  const \u03B3 = init2(p.result.antecedent);
  const na = last2(p.result.antecedent);
  const a87 = na.negand;
  const \u03B4 = p.result.succedent;
  return nl(p.result, [premise(sequent(\u03B3, [a87, ...\u03B4]))]);
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
  const a87 = last2(dep.result.antecedent);
  const \u03B4 = dep.result.succedent;
  return nr(sequent(\u03B3, [negation(a87), ...\u03B4]), deps);
};
var reverseNR = (p) => {
  const \u03B3 = p.result.antecedent;
  const na = head3(p.result.succedent);
  const a87 = na.negand;
  const \u03B4 = tail(p.result.succedent);
  return nr(p.result, [premise(sequent([...\u03B3, a87], \u03B4))]);
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
  const a87 = head3(dep.result.antecedent);
  const \u03B3 = init2(tail(dep.result.antecedent));
  const b = last2(dep.result.antecedent);
  const \u03B4 = dep.result.succedent;
  return sRotLB(sequent([...\u03B3, b, a87], \u03B4), deps);
};
var reverseSRotLB = (p) => {
  const \u03B3 = init2(init2(p.result.antecedent));
  const a87 = last2(p.result.antecedent);
  const b = last2(init2(p.result.antecedent));
  const \u03B4 = p.result.succedent;
  return sRotLB(p.result, [premise(sequent([a87, ...\u03B3, b], \u03B4))]);
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
  const \u03B4 = init2(tail(dep.result.succedent));
  const a87 = last2(dep.result.succedent);
  const b = head3(dep.result.succedent);
  return sRotRB(sequent(\u03B3, [a87, b, ...\u03B4]), deps);
};
var reverseSRotRB = (p) => {
  const \u03B3 = p.result.antecedent;
  const \u03B4 = tail(tail(p.result.succedent));
  const a87 = head3(p.result.succedent);
  const b = head3(tail(p.result.succedent));
  return sRotRB(p.result, [premise(sequent(\u03B3, [b, ...\u03B4, a87]))]);
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
var applySWL = (a87, ...deps) => {
  const [dep] = deps;
  const \u03B3 = dep.result.antecedent;
  const \u03B4 = dep.result.succedent;
  return swl(sequent([...\u03B3, a87], \u03B4), deps);
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
var applySWR = (a87, ...deps) => {
  const [dep] = deps;
  const \u03B3 = dep.result.antecedent;
  const \u03B4 = dep.result.succedent;
  return swr(sequent(\u03B3, [a87, ...\u03B4]), deps);
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
var rules = {
  cl: ruleCL,
  cr: ruleCR,
  cut: ruleCut,
  dl: ruleDL,
  dr: ruleDR,
  f: ruleF,
  i: ruleI,
  il: ruleIL,
  ir: ruleIR,
  nl: ruleNL,
  nr: ruleNR,
  sRotLB: ruleSRotLB,
  sRotRB: ruleSRotRB,
  swl: ruleSWL,
  swr: ruleSWR,
  v: ruleV
};
var applicableRules = (j) => entries(rules).flatMap(([k, v2]) => v2.isResult(j) ? [k] : []);
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
var isReverseId0 = (s) => s in reverse0;
var reverse1 = {
  cut: ruleCut
};
var isReverseId1 = (s) => s in reverse1;
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
var ruleCategory = {
  f: "axiom",
  i: "axiom",
  v: "axiom",
  swl: "structural",
  sRotLB: "structural",
  swr: "structural",
  sRotRB: "structural",
  nl: "logical",
  cl: "logical",
  dl: "logical",
  il: "logical",
  nr: "logical",
  dr: "logical",
  cr: "logical",
  ir: "logical",
  cut: "meta"
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
  for (let i88 = 1; i88 <= allPaths.length; i88 += 1) {
    const candidate = mod(allPaths, s.branch + i88);
    if (open.has(candidate.join(","))) {
      return focus(s.derivation, s.branch + i88);
    }
  }
  return next(s);
};
var forwardThenBackOpen = (s) => {
  const allPaths = branches(s.derivation);
  const open = new Set(openBranches(s.derivation).map((p) => p.join(",")));
  const normalized = (Math.floor(s.branch) % allPaths.length + allPaths.length) % allPaths.length;
  for (let i88 = normalized + 1; i88 < allPaths.length; i88 += 1) {
    const p = allPaths[i88];
    if (p && open.has(p.join(","))) {
      return focus(s.derivation, s.branch + (i88 - normalized));
    }
  }
  for (let i88 = normalized - 1; i88 >= 0; i88 -= 1) {
    const p = allPaths[i88];
    if (p && open.has(p.join(","))) {
      return focus(s.derivation, s.branch + (i88 - normalized));
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
var undo = (s) => {
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
var reset = (s) => {
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
      state = undo(state);
      break;
    case "reset":
      state = reset(state);
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

// src/model/challenge.ts
var isChallenge = (c) => "solution" in c;
var challenge = (c) => c;
var isTutorial = (c) => "pinned" in c && Array.isArray(c.pinned);

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
  sRotLB: ruleSRotLB.apply,
  sRotRB: ruleSRotRB.apply
};
var rules2 = [
  "i",
  "f",
  "v",
  "swl",
  "swr",
  "sRotLB",
  "sRotRB",
  "nl",
  "nr",
  "cl",
  "cr",
  "dl",
  "dr",
  "il",
  "ir",
  "cut"
];
var name = "RK";
var rk = {
  a: alpha,
  o: omega,
  i: iota,
  z: zeta
};

// src/challenges/ch0-identity-1.ts
var { a, i: i2 } = rk;
var goal = sequent([a("p")], [a("p")]);
var solution = i2.i(a("p"));
var ch0identity1 = challenge({ rules: rules2, goal, solution });

// src/challenges/ch0-identity-2.ts
var { a: a2, i: i3 } = rk;
var goal2 = sequent([a2("q")], [a2("q")]);
var solution2 = i3.i(a2("q"));
var ch0identity2 = challenge({ rules: rules2, goal: goal2, solution: solution2 });

// src/challenges/ch1-weakening-1.ts
var { a: a3, z, i: i4 } = rk;
var goal3 = sequent([a3("p"), a3("q")], [a3("p")]);
var solution3 = z.swl(a3("q"), i4.i(a3("p")));
var ch1weakening1 = challenge({ rules: rules2, goal: goal3, solution: solution3 });

// src/challenges/ch1-weakening-2.ts
var { a: a4, z: z2, i: i5 } = rk;
var goal4 = sequent([a4("p")], [a4("q"), a4("p")]);
var solution4 = z2.swr(a4("q"), i5.i(a4("p")));
var ch1weakening2 = challenge({ rules: rules2, goal: goal4, solution: solution4 });

// src/challenges/ch1-weakening-3.ts
var { a: a5, z: z3, i: i6 } = rk;
var goal5 = sequent([a5("p"), a5("q")], [a5("q"), a5("p")]);
var solution5 = z3.swl(a5("q"), z3.swr(a5("q"), i6.i(a5("p"))));
var ch1weakening3 = challenge({ rules: rules2, goal: goal5, solution: solution5 });

// src/challenges/ch1-weakening-4.ts
var { a: a6, o, z: z4, i: i7 } = rk;
var goal6 = sequent(
  [a6("q"), o.p2.conjunction(a6("p"), a6("q"))],
  [o.p2.conjunction(a6("q"), a6("p")), a6("q")]
);
var solution6 = z4.swl(
  o.p2.conjunction(a6("p"), a6("q")),
  z4.swr(o.p2.conjunction(a6("q"), a6("p")), i7.i(a6("q")))
);
var ch1weakening4 = challenge({ rules: rules2, goal: goal6, solution: solution6 });

// src/challenges/ch1-weakening-5.ts
var { a: a7, o: o2, z: z5, i: i8 } = rk;
var goal7 = sequent(
  [o2.p2.conjunction(a7("p"), a7("q")), a7("p")],
  [a7("q"), o2.p2.conjunction(a7("p"), a7("q"))]
);
var solution7 = z5.swl(
  a7("p"),
  z5.swr(a7("q"), i8.i(o2.p2.conjunction(a7("p"), a7("q"))))
);
var ch1weakening5 = challenge({ rules: rules2, goal: goal7, solution: solution7 });

// src/challenges/ch1-weakening-6.ts
var { a: a8, z: z6, i: i9 } = rk;
var goal8 = sequent(
  [a8("p"), a8("q"), a8("q"), a8("p")],
  [a8("p"), a8("q"), a8("q"), a8("p")]
);
var solution8 = z6.swl(
  a8("p"),
  z6.swl(
    a8("q"),
    z6.swl(a8("q"), z6.swr(a8("p"), z6.swr(a8("q"), z6.swr(a8("q"), i9.i(a8("p"))))))
  )
);
var ch1weakening6 = challenge({ rules: rules2, goal: goal8, solution: solution8 });

// src/challenges/ch1-weakening-8.ts
var { a: a9, o: o3, z: z7, i: i10 } = rk;
var goal9 = sequent(
  [a9("p"), o3.p2.implication(a9("q"), a9("p")), a9("q")],
  [a9("q"), o3.p2.implication(a9("q"), a9("p")), a9("p")]
);
var solution9 = z7.swl(
  a9("q"),
  z7.swl(
    o3.p2.implication(a9("q"), a9("p")),
    z7.swr(a9("q"), z7.swr(o3.p2.implication(a9("q"), a9("p")), i10.i(a9("p"))))
  )
);
var ch1weakening8 = challenge({ rules: rules2, goal: goal9, solution: solution9 });

// src/challenges/ch1-weakening-9.ts
var { a: a10, z: z8, i: i11 } = rk;
var goal10 = sequent(
  [a10("s"), a10("r"), a10("q"), a10("p")],
  [a10("p"), a10("q"), a10("r"), a10("s")]
);
var solution10 = z8.swl(
  a10("p"),
  z8.swl(
    a10("q"),
    z8.swl(a10("r"), z8.swr(a10("p"), z8.swr(a10("q"), z8.swr(a10("r"), i11.i(a10("s"))))))
  )
);
var ch1weakening9 = challenge({ rules: rules2, goal: goal10, solution: solution10 });

// src/challenges/ch2-permutation-1.ts
var { a: a11, z: z9, i: i12 } = rk;
var goal11 = sequent([a11("p"), a11("p"), a11("p"), a11("q"), a11("p"), a11("p")], [a11("q")]);
var solution11 = z9.swl(
  a11("p"),
  z9.swl(
    a11("p"),
    z9.sRotLB(z9.swl(a11("p"), z9.swl(a11("p"), z9.swl(a11("p"), i12.i(a11("q"))))))
  )
);
var ch2permutation1 = challenge({ rules: rules2, goal: goal11, solution: solution11 });

// src/challenges/ch2-permutation-2.ts
var { a: a12, z: z10, i: i13 } = rk;
var goal12 = sequent([a12("q")], [a12("p"), a12("p"), a12("p"), a12("q"), a12("p"), a12("p")]);
var solution12 = z10.swr(
  a12("p"),
  z10.swr(
    a12("p"),
    z10.swr(a12("p"), z10.sRotRB(z10.swr(a12("p"), z10.swr(a12("p"), i13.i(a12("q"))))))
  )
);
var ch2permutation2 = challenge({ rules: rules2, goal: goal12, solution: solution12 });

// src/challenges/ch2-permutation-3.ts
var { a: a13, z: z11, i: i14 } = rk;
var goal13 = sequent(
  [a13("p"), a13("p"), a13("p"), a13("q"), a13("p"), a13("p")],
  [a13("p"), a13("p"), a13("p"), a13("q"), a13("p"), a13("p")]
);
var solution13 = z11.swl(
  a13("p"),
  z11.swl(
    a13("p"),
    z11.swl(
      a13("q"),
      z11.swl(
        a13("p"),
        z11.swl(
          a13("p"),
          z11.swr(
            a13("p"),
            z11.swr(
              a13("p"),
              z11.swr(a13("p"), z11.swr(a13("q"), z11.swr(a13("p"), i14.i(a13("p")))))
            )
          )
        )
      )
    )
  )
);
var ch2permutation3 = challenge({ rules: rules2, goal: goal13, solution: solution13 });

// src/challenges/ch2-permutation-4.ts
var { a: a14, z: z12, i: i15 } = rk;
var goal14 = sequent(
  [a14("s"), a14("r"), a14("q"), a14("p")],
  [a14("s"), a14("r"), a14("q"), a14("p")]
);
var solution14 = z12.sRotLB(
  z12.swl(
    a14("q"),
    z12.swl(
      a14("r"),
      z12.swl(a14("s"), z12.swr(a14("s"), z12.swr(a14("r"), z12.swr(a14("q"), i15.i(a14("p"))))))
    )
  )
);
var ch2permutation4 = challenge({ rules: rules2, goal: goal14, solution: solution14 });

// src/challenges/ch2-permutation-5.ts
var { a: a15, o: o4, z: z13, i: i16 } = rk;
var goal15 = sequent(
  [o4.p2.conjunction(a15("p"), a15("q")), o4.p2.conjunction(a15("p"), a15("q"))],
  [o4.p2.conjunction(a15("p"), a15("q")), o4.p2.disjunction(a15("p"), a15("q"))]
);
var solution15 = z13.sRotRB(
  z13.swl(
    o4.p2.conjunction(a15("p"), a15("q")),
    z13.swr(
      o4.p2.disjunction(a15("p"), a15("q")),
      i16.i(o4.p2.conjunction(a15("p"), a15("q")))
    )
  )
);
var ch2permutation5 = challenge({ rules: rules2, goal: goal15, solution: solution15 });

// src/challenges/ch2-permutation-6.ts
var { a: a16, o: o5, z: z14, i: i17 } = rk;
var goal16 = sequent(
  [
    o5.p2.conjunction(a16("q"), a16("s")),
    o5.p2.conjunction(a16("q"), a16("s")),
    o5.p2.conjunction(a16("q"), a16("s"))
  ],
  [
    o5.p2.conjunction(a16("q"), a16("s")),
    o5.p2.conjunction(a16("s"), a16("q")),
    o5.p2.conjunction(a16("s"), a16("q"))
  ]
);
var solution16 = z14.sRotRB(
  z14.swl(
    o5.p2.conjunction(a16("q"), a16("s")),
    z14.swl(
      o5.p2.conjunction(a16("q"), a16("s")),
      z14.swr(
        o5.p2.conjunction(a16("s"), a16("q")),
        z14.swr(
          o5.p2.conjunction(a16("s"), a16("q")),
          i17.i(o5.p2.conjunction(a16("q"), a16("s")))
        )
      )
    )
  )
);
var ch2permutation6 = challenge({ rules: rules2, goal: goal16, solution: solution16 });

// src/challenges/ch2-permutation-7.ts
var { a: a17, o: o6, z: z15, i: i18 } = rk;
var goal17 = sequent(
  [
    o6.p2.implication(a17("q"), a17("p")),
    o6.p2.implication(a17("p"), a17("s")),
    o6.p2.implication(a17("s"), a17("r"))
  ],
  [
    o6.p2.implication(a17("r"), a17("p")),
    o6.p2.implication(a17("p"), a17("s")),
    o6.p2.implication(a17("s"), a17("q"))
  ]
);
var solution17 = z15.swl(
  o6.p2.implication(a17("s"), a17("r")),
  z15.swr(
    o6.p2.implication(a17("r"), a17("p")),
    z15.sRotLB(
      z15.sRotRB(
        z15.swl(
          o6.p2.implication(a17("q"), a17("p")),
          z15.swr(
            o6.p2.implication(a17("s"), a17("q")),
            i18.i(o6.p2.implication(a17("p"), a17("s")))
          )
        )
      )
    )
  )
);
var ch2permutation7 = challenge({ rules: rules2, goal: goal17, solution: solution17 });

// src/challenges/ch2-permutation-8.ts
var { a: a18, o: o7, z: z16, i: i19 } = rk;
var goal18 = sequent(
  [
    o7.p2.conjunction(a18("s"), a18("q")),
    a18("r"),
    o7.p2.implication(a18("q"), a18("p")),
    o7.p1.negation(a18("r"))
  ],
  [
    o7.p1.negation(a18("p")),
    o7.p2.implication(a18("s"), a18("q")),
    o7.p1.negation(a18("r")),
    o7.p2.disjunction(a18("q"), a18("p"))
  ]
);
var solution18 = z16.swr(
  o7.p1.negation(a18("p")),
  z16.swr(
    o7.p2.implication(a18("s"), a18("q")),
    z16.sRotLB(
      z16.sRotRB(
        z16.swl(
          o7.p2.implication(a18("q"), a18("p")),
          z16.swl(
            a18("r"),
            z16.swl(
              o7.p2.conjunction(a18("s"), a18("q")),
              z16.swr(
                o7.p2.disjunction(a18("q"), a18("p")),
                i19.i(o7.p1.negation(a18("r")))
              )
            )
          )
        )
      )
    )
  )
);
var ch2permutation8 = challenge({ rules: rules2, goal: goal18, solution: solution18 });

// src/challenges/ch2-permutation-9.ts
var { a: a19, o: o8, z: z17, i: i20 } = rk;
var goal19 = sequent(
  [a19("p"), o8.p1.negation(a19("p")), a19("q"), a19("r")],
  [o8.p1.negation(a19("q")), o8.p1.negation(a19("p")), a19("s"), o8.p1.negation(a19("r"))]
);
var solution19 = z17.swl(
  a19("r"),
  z17.swl(
    a19("q"),
    z17.swr(
      o8.p1.negation(a19("q")),
      z17.sRotLB(
        z17.sRotRB(
          z17.swl(
            a19("p"),
            z17.swr(
              a19("s"),
              z17.swr(o8.p1.negation(a19("r")), i20.i(o8.p1.negation(a19("p"))))
            )
          )
        )
      )
    )
  )
);
var ch2permutation9 = challenge({ rules: rules2, goal: goal19, solution: solution19 });

// src/challenges/ch3-negation-1.ts
var { a: a20, o: o9, z: z18, i: i21 } = rk;
var goal20 = sequent([a20("r"), o9.p1.negation(a20("r"))], []);
var solution20 = z18.nl(i21.i(a20("r")));
var ch3negation1 = challenge({ rules: rules2, goal: goal20, solution: solution20 });

// src/challenges/ch3-negation-2.ts
var { a: a21, o: o10, z: z19, i: i22 } = rk;
var goal21 = sequent([], [o10.p1.negation(a21("r")), a21("r")]);
var solution21 = z19.nr(i22.i(a21("r")));
var ch3negation2 = challenge({ rules: rules2, goal: goal21, solution: solution21 });

// src/challenges/ch3-negation-3.ts
var { a: a22, o: o11, z: z20, i: i23 } = rk;
var goal22 = sequent([o11.p1.negation(o11.p1.negation(a22("q")))], [a22("q")]);
var solution22 = z20.nl(z20.nr(i23.i(a22("q"))));
var ch3negation3 = challenge({ rules: rules2, goal: goal22, solution: solution22 });

// src/challenges/ch3-negation-4.ts
var { a: a23, o: o12, z: z21, i: i24 } = rk;
var goal23 = sequent(
  [o12.p1.negation(o12.p1.negation(a23("s")))],
  [o12.p1.negation(o12.p1.negation(o12.p1.negation(o12.p1.negation(a23("s")))))]
);
var solution23 = z21.nr(z21.nl(i24.i(o12.p1.negation(o12.p1.negation(a23("s"))))));
var ch3negation4 = challenge({ rules: rules2, goal: goal23, solution: solution23 });

// src/challenges/ch3-negation-5.ts
var { a: a24, o: o13, z: z22, i: i25 } = rk;
var goal24 = sequent(
  [o13.p1.negation(o13.p1.negation(o13.p2.conjunction(a24("p"), a24("q"))))],
  [
    o13.p1.negation(
      o13.p1.negation(
        o13.p1.negation(o13.p1.negation(o13.p2.conjunction(a24("p"), a24("q"))))
      )
    )
  ]
);
var solution24 = z22.nr(
  z22.nl(i25.i(o13.p1.negation(o13.p1.negation(o13.p2.conjunction(a24("p"), a24("q"))))))
);
var ch3negation5 = challenge({ rules: rules2, goal: goal24, solution: solution24 });

// src/challenges/ch3-negation-6.ts
var { a: a25, o: o14, z: z23, i: i26 } = rk;
var goal25 = sequent(
  [
    o14.p1.negation(o14.p1.negation(a25("p"))),
    o14.p1.negation(o14.p1.negation(o14.p1.negation(a25("p"))))
  ],
  [
    o14.p1.negation(o14.p1.negation(a25("p"))),
    o14.p1.negation(o14.p1.negation(o14.p1.negation(a25("p"))))
  ]
);
var solution25 = z23.sRotLB(
  z23.swl(
    o14.p1.negation(o14.p1.negation(a25("p"))),
    z23.swr(
      o14.p1.negation(o14.p1.negation(a25("p"))),
      i26.i(o14.p1.negation(o14.p1.negation(o14.p1.negation(a25("p")))))
    )
  )
);
var ch3negation6 = challenge({ rules: rules2, goal: goal25, solution: solution25 });

// src/challenges/ch3-negation-8.ts
var { a: a26, o: o15, z: z24, i: i27 } = rk;
var goal26 = sequent(
  [
    o15.p1.negation(o15.p1.negation(a26("p"))),
    o15.p2.conjunction(o15.p1.negation(a26("p")), o15.p1.negation(a26("q"))),
    o15.p1.negation(o15.p1.negation(o15.p1.negation(a26("q"))))
  ],
  [
    o15.p1.negation(o15.p1.negation(o15.p1.negation(a26("p")))),
    o15.p2.conjunction(o15.p1.negation(a26("p")), o15.p1.negation(a26("q"))),
    o15.p1.negation(o15.p1.negation(a26("q")))
  ]
);
var solution26 = z24.swl(
  o15.p1.negation(o15.p1.negation(o15.p1.negation(a26("q")))),
  z24.swr(
    o15.p1.negation(o15.p1.negation(o15.p1.negation(a26("p")))),
    z24.sRotLB(
      z24.sRotRB(
        z24.swl(
          o15.p1.negation(o15.p1.negation(a26("p"))),
          z24.swr(
            o15.p1.negation(o15.p1.negation(a26("q"))),
            i27.i(o15.p2.conjunction(o15.p1.negation(a26("p")), o15.p1.negation(a26("q"))))
          )
        )
      )
    )
  )
);
var ch3negation8 = challenge({ rules: rules2, goal: goal26, solution: solution26 });

// src/challenges/ch3-negation-9.ts
var { a: a27, o: o16, z: z25, i: i28 } = rk;
var goal27 = sequent(
  [o16.p1.negation(a27("p")), o16.p1.negation(a27("s")), o16.p1.negation(a27("p")), a27("r")],
  [a27("q"), o16.p1.negation(a27("q")), a27("s"), o16.p1.negation(a27("r"))]
);
var solution27 = z25.sRotRB(
  z25.nr(
    z25.sRotLB(
      z25.swl(
        a27("r"),
        z25.swl(
          o16.p1.negation(a27("p")),
          z25.swl(
            o16.p1.negation(a27("s")),
            z25.swl(
              o16.p1.negation(a27("p")),
              z25.swr(a27("s"), z25.swr(o16.p1.negation(a27("r")), i28.i(a27("q"))))
            )
          )
        )
      )
    )
  )
);
var ch3negation9 = challenge({ rules: rules2, goal: goal27, solution: solution27 });

// src/challenges/ch3-negation-10.ts
var { a: a28, o: o17, i: i29 } = rk;
var goal28 = sequent(
  [o17.p1.negation(o17.p1.negation(a28("p")))],
  [o17.p1.negation(o17.p1.negation(a28("p")))]
);
var solution28 = i29.i(o17.p1.negation(o17.p1.negation(a28("p"))));
var ch3negation10 = challenge({ rules: rules2, goal: goal28, solution: solution28 });

// src/challenges/ch4-theorem-1.ts
var { a: a29, o: o18, z: z26, i: i30 } = rk;
var goal29 = conclusion(o18.p2.implication(a29("q"), a29("q")));
var solution29 = z26.ir(i30.i(a29("q")));
var ch4theorem1 = challenge({ rules: rules2, goal: goal29, solution: solution29 });

// src/challenges/ch4-theorem-2.ts
var { a: a30, o: o19, z: z27, i: i31 } = rk;
var goal30 = conclusion(
  o19.p2.implication(
    o19.p2.conjunction(a30("q"), a30("q")),
    o19.p2.conjunction(a30("q"), a30("q"))
  )
);
var solution30 = z27.ir(i31.i(o19.p2.conjunction(a30("q"), a30("q"))));
var ch4theorem2 = challenge({ rules: rules2, goal: goal30, solution: solution30 });

// src/challenges/ch4-theorem-3.ts
var { a: a31, o: o20, z: z28, i: i32 } = rk;
var goal31 = conclusion(
  o20.p2.implication(
    o20.p2.implication(a31("p"), a31("r")),
    o20.p2.implication(a31("p"), a31("r"))
  )
);
var solution31 = z28.ir(i32.i(o20.p2.implication(a31("p"), a31("r"))));
var ch4theorem3 = challenge({ rules: rules2, goal: goal31, solution: solution31 });

// src/challenges/ch4-theorem-4.ts
var { a: a32, o: o21, z: z29, i: i33 } = rk;
var goal32 = conclusion(
  o21.p2.implication(
    o21.p2.implication(a32("q"), o21.p2.implication(a32("r"), a32("q"))),
    o21.p2.implication(a32("q"), o21.p2.implication(a32("r"), a32("q")))
  )
);
var solution32 = z29.ir(
  i33.i(o21.p2.implication(a32("q"), o21.p2.implication(a32("r"), a32("q"))))
);
var ch4theorem4 = challenge({ rules: rules2, goal: goal32, solution: solution32 });

// src/challenges/ch4-theorem-5.ts
var { a: a33, o: o22, z: z30, i: i34 } = rk;
var goal33 = conclusion(
  o22.p2.implication(a33("q"), o22.p2.implication(a33("r"), a33("q")))
);
var solution33 = z30.ir(z30.ir(z30.swl(a33("r"), i34.i(a33("q")))));
var ch4theorem5 = challenge({ rules: rules2, goal: goal33, solution: solution33 });

// src/challenges/ch4-theorem-6.ts
var { a: a34, o: o23, z: z31, i: i35 } = rk;
var goal34 = conclusion(
  o23.p2.implication(a34("r"), o23.p2.implication(a34("q"), a34("q")))
);
var solution34 = z31.ir(z31.ir(z31.sRotLB(z31.swl(a34("r"), i35.i(a34("q"))))));
var ch4theorem6 = challenge({ rules: rules2, goal: goal34, solution: solution34 });

// src/challenges/ch4-theorem-7.ts
var { a: a35, o: o24, z: z32, i: i36 } = rk;
var goal35 = conclusion(
  o24.p2.implication(
    o24.p2.implication(a35("p"), o24.p2.implication(a35("q"), o24.p1.negation(a35("p")))),
    o24.p2.implication(a35("p"), a35("p"))
  )
);
var solution35 = z32.ir(
  z32.ir(
    z32.sRotLB(
      z32.swl(
        o24.p2.implication(
          a35("p"),
          o24.p2.implication(a35("q"), o24.p1.negation(a35("p")))
        ),
        i36.i(a35("p"))
      )
    )
  )
);
var ch4theorem7 = challenge({ rules: rules2, goal: goal35, solution: solution35 });

// src/challenges/ch4-theorem-8.ts
var { a: a36, o: o25, z: z33, i: i37 } = rk;
var goal36 = conclusion(
  o25.p2.implication(
    o25.p1.negation(o25.p1.negation(a36("s"))),
    o25.p1.negation(o25.p1.negation(o25.p1.negation(o25.p1.negation(a36("s")))))
  )
);
var solution36 = z33.ir(z33.nr(z33.nl(i37.i(o25.p1.negation(o25.p1.negation(a36("s")))))));
var ch4theorem8 = challenge({ rules: rules2, goal: goal36, solution: solution36 });

// src/challenges/ch4-theorem-9.ts
var { a: a37, o: o26, z: z34, i: i38 } = rk;
var goal37 = conclusion(
  o26.p2.implication(
    o26.p1.negation(o26.p1.negation(o26.p2.conjunction(a37("p"), a37("q")))),
    o26.p1.negation(
      o26.p1.negation(
        o26.p1.negation(o26.p1.negation(o26.p2.conjunction(a37("p"), a37("q"))))
      )
    )
  )
);
var solution37 = z34.ir(
  z34.nr(
    z34.nl(i38.i(o26.p1.negation(o26.p1.negation(o26.p2.conjunction(a37("p"), a37("q"))))))
  )
);
var ch4theorem9 = challenge({ rules: rules2, goal: goal37, solution: solution37 });

// src/challenges/ch4-theorem-10.ts
var { a: a38, o: o27, i: i39 } = rk;
var goal38 = sequent(
  [o27.p2.implication(a38("r"), a38("p"))],
  [o27.p2.implication(a38("r"), a38("p"))]
);
var solution38 = i39.i(o27.p2.implication(a38("r"), a38("p")));
var ch4theorem10 = challenge({ rules: rules2, goal: goal38, solution: solution38 });

// src/challenges/ch5-composition-1.ts
var { a: a39, o: o28, z: z35, i: i40 } = rk;
var goal39 = sequent([o28.p2.conjunction(a39("p"), a39("q"))], [a39("q"), a39("p")]);
var solution39 = z35.cl(z35.swl(a39("q"), z35.swr(a39("q"), i40.i(a39("p")))));
var ch5composition1 = challenge({ rules: rules2, goal: goal39, solution: solution39 });

// src/challenges/ch5-composition-2.ts
var { a: a40, o: o29, z: z36, i: i41 } = rk;
var goal40 = sequent([a40("q"), a40("p")], [o29.p2.disjunction(a40("p"), a40("q"))]);
var solution40 = z36.dr(z36.swl(a40("p"), z36.swr(a40("p"), i41.i(a40("q")))));
var ch5composition2 = challenge({ rules: rules2, goal: goal40, solution: solution40 });

// src/challenges/ch5-composition-3.ts
var { a: a41, o: o30, z: z37, i: i42 } = rk;
var goal41 = sequent(
  [o30.p2.conjunction(a41("q"), a41("p"))],
  [o30.p2.disjunction(a41("p"), a41("q"))]
);
var solution41 = z37.cl(z37.dr(z37.swl(a41("p"), z37.swr(a41("p"), i42.i(a41("q"))))));
var ch5composition3 = challenge({ rules: rules2, goal: goal41, solution: solution41 });

// src/challenges/ch5-composition-4.ts
var { a: a42, o: o31, z: z38, i: i43 } = rk;
var goal42 = sequent(
  [o31.p2.conjunction(o31.p2.conjunction(a42("r"), a42("p")), a42("s"))],
  [o31.p2.disjunction(a42("s"), o31.p2.disjunction(a42("p"), a42("r")))]
);
var solution42 = z38.cl(
  z38.dr(
    z38.sRotLB(
      z38.sRotRB(
        z38.swl(
          o31.p2.conjunction(a42("r"), a42("p")),
          z38.swr(o31.p2.disjunction(a42("p"), a42("r")), i43.i(a42("s")))
        )
      )
    )
  )
);
var ch5composition4 = challenge({ rules: rules2, goal: goal42, solution: solution42 });

// src/challenges/ch5-composition-5.ts
var { a: a43, o: o32, z: z39, i: i44 } = rk;
var goal43 = sequent(
  [
    o32.p2.conjunction(
      o32.p2.conjunction(a43("r"), a43("p")),
      o32.p2.disjunction(a43("p"), a43("r"))
    )
  ],
  [
    o32.p2.disjunction(
      o32.p2.conjunction(a43("p"), a43("r")),
      o32.p2.disjunction(a43("r"), a43("p"))
    )
  ]
);
var solution43 = z39.cl(
  z39.dr(
    z39.dl(
      z39.swr(
        o32.p2.conjunction(a43("p"), a43("r")),
        z39.dr(
          z39.sRotLB(
            z39.swl(o32.p2.conjunction(a43("r"), a43("p")), z39.swr(a43("r"), i44.i(a43("p"))))
          )
        )
      ),
      z39.swr(
        o32.p2.conjunction(a43("p"), a43("r")),
        z39.dr(
          z39.sRotLB(
            z39.sRotRB(
              z39.swl(
                o32.p2.conjunction(a43("r"), a43("p")),
                z39.swr(a43("p"), i44.i(a43("r")))
              )
            )
          )
        )
      )
    )
  )
);
var ch5composition5 = challenge({ rules: rules2, goal: goal43, solution: solution43 });

// src/challenges/ch5-composition-6.ts
var { a: a44, o: o33, z: z40, i: i45 } = rk;
var goal44 = sequent(
  [
    o33.p2.conjunction(
      o33.p2.disjunction(a44("r"), a44("p")),
      o33.p2.disjunction(a44("p"), a44("s"))
    )
  ],
  [
    o33.p2.disjunction(
      o33.p2.disjunction(a44("s"), a44("p")),
      o33.p2.disjunction(a44("r"), a44("p"))
    )
  ]
);
var solution44 = z40.cl(
  z40.dr(
    z40.swl(
      o33.p2.disjunction(a44("p"), a44("s")),
      z40.swr(
        o33.p2.disjunction(a44("s"), a44("p")),
        i45.i(o33.p2.disjunction(a44("r"), a44("p")))
      )
    )
  )
);
var ch5composition6 = challenge({ rules: rules2, goal: goal44, solution: solution44 });

// src/challenges/ch5-composition-7.ts
var { a: a45, o: o34, z: z41, i: i46 } = rk;
var goal45 = sequent(
  [
    o34.p2.conjunction(
      o34.p2.conjunction(a45("p"), a45("q")),
      o34.p2.implication(a45("r"), a45("q"))
    )
  ],
  [
    o34.p2.disjunction(
      o34.p2.implication(a45("q"), a45("r")),
      o34.p2.disjunction(a45("p"), a45("q"))
    )
  ]
);
var solution45 = z41.dr(
  z41.ir(
    z41.swr(
      a45("r"),
      z41.dr(
        z41.sRotLB(
          z41.swl(
            o34.p2.conjunction(
              o34.p2.conjunction(a45("p"), a45("q")),
              o34.p2.implication(a45("r"), a45("q"))
            ),
            z41.swr(a45("p"), i46.i(a45("q")))
          )
        )
      )
    )
  )
);
var ch5composition7 = challenge({ rules: rules2, goal: goal45, solution: solution45 });

// src/challenges/ch5-composition-8.ts
var { a: a46, o: o35, z: z42, i: i47 } = rk;
var goal46 = conclusion(
  o35.p2.implication(
    o35.p2.conjunction(a46("q"), o35.p1.negation(a46("q"))),
    o35.p2.disjunction(a46("r"), a46("s"))
  )
);
var solution46 = z42.ir(
  z42.cl(z42.nl(z42.sRotRB(z42.swr(o35.p2.disjunction(a46("r"), a46("s")), i47.i(a46("q"))))))
);
var ch5composition8 = challenge({ rules: rules2, goal: goal46, solution: solution46 });

// src/challenges/ch5-composition-9.ts
var { a: a47, o: o36, z: z43, i: i48 } = rk;
var goal47 = conclusion(
  o36.p2.implication(
    o36.p2.conjunction(
      o36.p2.conjunction(o36.p1.negation(a47("p")), o36.p1.negation(a47("s"))),
      o36.p2.conjunction(o36.p1.negation(a47("p")), a47("r"))
    ),
    o36.p2.disjunction(
      o36.p2.disjunction(a47("q"), o36.p1.negation(a47("q"))),
      o36.p2.disjunction(a47("s"), o36.p1.negation(a47("r")))
    )
  )
);
var solution47 = z43.ir(
  z43.dr(
    z43.dr(
      z43.sRotRB(
        z43.nr(
          z43.sRotLB(
            z43.swl(
              o36.p2.conjunction(
                o36.p2.conjunction(o36.p1.negation(a47("p")), o36.p1.negation(a47("s"))),
                o36.p2.conjunction(o36.p1.negation(a47("p")), a47("r"))
              ),
              z43.swr(
                o36.p2.disjunction(a47("s"), o36.p1.negation(a47("r"))),
                i48.i(a47("q"))
              )
            )
          )
        )
      )
    )
  )
);
var ch5composition9 = challenge({ rules: rules2, goal: goal47, solution: solution47 });

// src/challenges/ch5-composition-10.ts
var { a: a48, o: o37, i: i49 } = rk;
var goal48 = sequent(
  [o37.p2.conjunction(a48("q"), a48("r"))],
  [o37.p2.conjunction(a48("q"), a48("r"))]
);
var solution48 = i49.i(o37.p2.conjunction(a48("q"), a48("r")));
var ch5composition10 = challenge({ rules: rules2, goal: goal48, solution: solution48 });

// src/challenges/ch5-composition-11.ts
var { a: a49, o: o38, i: i50 } = rk;
var goal49 = sequent(
  [o38.p2.conjunction(a49("q"), o38.p1.negation(a49("p")))],
  [o38.p2.conjunction(a49("q"), o38.p1.negation(a49("p")))]
);
var solution49 = i50.i(o38.p2.conjunction(a49("q"), o38.p1.negation(a49("p"))));
var ch5composition11 = challenge({ rules: rules2, goal: goal49, solution: solution49 });

// src/challenges/ch6-branching-1.ts
var { a: a50, o: o39, z: z44, i: i51 } = rk;
var goal50 = sequent([o39.p2.disjunction(a50("p"), a50("q"))], [a50("p"), a50("q")]);
var solution50 = z44.dl(
  z44.sRotRB(z44.swr(a50("q"), i51.i(a50("p")))),
  z44.swr(a50("p"), i51.i(a50("q")))
);
var ch6branching1 = challenge({ rules: rules2, goal: goal50, solution: solution50 });

// src/challenges/ch6-branching-2.ts
var { a: a51, o: o40, z: z45, i: i52 } = rk;
var goal51 = sequent([a51("p"), a51("q")], [o40.p2.conjunction(a51("p"), a51("q"))]);
var solution51 = z45.cr(
  z45.swl(a51("q"), i52.i(a51("p"))),
  z45.sRotLB(z45.swl(a51("p"), i52.i(a51("q"))))
);
var ch6branching2 = challenge({ rules: rules2, goal: goal51, solution: solution51 });

// src/challenges/ch6-branching-3.ts
var { a: a52, o: o41, z: z46, i: i53 } = rk;
var goal52 = sequent(
  [o41.p2.disjunction(a52("p"), a52("p"))],
  [o41.p2.conjunction(a52("p"), a52("p"))]
);
var solution52 = z46.dl(
  z46.cr(i53.i(a52("p")), i53.i(a52("p"))),
  z46.cr(i53.i(a52("p")), i53.i(a52("p")))
);
var ch6branching3 = challenge({ rules: rules2, goal: goal52, solution: solution52 });

// src/challenges/ch6-branching-4.ts
var { a: a53, o: o42, z: z47, i: i54 } = rk;
var goal53 = sequent(
  [o42.p2.disjunction(a53("p"), a53("q"))],
  [o42.p2.disjunction(a53("q"), a53("p"))]
);
var solution53 = z47.dr(
  z47.dl(z47.swr(a53("q"), i54.i(a53("p"))), z47.sRotRB(z47.swr(a53("p"), i54.i(a53("q")))))
);
var ch6branching4 = challenge({ rules: rules2, goal: goal53, solution: solution53 });

// src/challenges/ch6-branching-5.ts
var { a: a54, o: o43, z: z48, i: i55 } = rk;
var goal54 = sequent(
  [o43.p2.conjunction(a54("p"), a54("q"))],
  [o43.p2.conjunction(a54("q"), a54("p"))]
);
var solution54 = z48.cl(
  z48.cr(z48.sRotLB(z48.swl(a54("p"), i55.i(a54("q")))), z48.swl(a54("q"), i55.i(a54("p"))))
);
var ch6branching5 = challenge({ rules: rules2, goal: goal54, solution: solution54 });

// src/challenges/ch6-branching-6.ts
var { a: a55, o: o44, z: z49, i: i56 } = rk;
var goal55 = conclusion(
  o44.p2.implication(
    o44.p1.negation(o44.p2.conjunction(a55("p"), a55("q"))),
    o44.p2.disjunction(o44.p1.negation(a55("p")), o44.p1.negation(a55("q")))
  )
);
var solution55 = z49.ir(
  z49.nl(
    z49.cr(
      z49.sRotRB(z49.dr(z49.nr(z49.swr(o44.p1.negation(a55("q")), i56.i(a55("p")))))),
      z49.sRotRB(z49.dr(z49.swr(o44.p1.negation(a55("p")), z49.nr(i56.i(a55("q"))))))
    )
  )
);
var ch6branching6 = challenge({ rules: rules2, goal: goal55, solution: solution55 });

// src/challenges/ch6-branching-7.ts
var { a: a56, o: o45, z: z50, i: i57 } = rk;
var goal56 = conclusion(
  o45.p2.implication(
    o45.p2.disjunction(o45.p1.negation(a56("p")), o45.p1.negation(a56("q"))),
    o45.p1.negation(o45.p2.conjunction(a56("p"), a56("q")))
  )
);
var solution56 = z50.ir(
  z50.nr(
    z50.cl(
      z50.sRotLB(
        z50.sRotLB(
          z50.dl(
            z50.nl(z50.swl(a56("q"), i57.i(a56("p")))),
            z50.nl(z50.sRotLB(z50.swl(a56("p"), i57.i(a56("q")))))
          )
        )
      )
    )
  )
);
var ch6branching7 = challenge({ rules: rules2, goal: goal56, solution: solution56 });

// src/challenges/ch6-branching-8.ts
var { a: a57, o: o46, z: z51, i: i58 } = rk;
var goal57 = conclusion(
  o46.p2.implication(
    o46.p2.conjunction(a57("p"), o46.p2.disjunction(a57("q"), a57("r"))),
    o46.p2.disjunction(
      o46.p2.conjunction(a57("p"), a57("q")),
      o46.p2.conjunction(a57("p"), a57("r"))
    )
  )
);
var solution57 = z51.ir(
  z51.cl(
    z51.dr(
      z51.dl(
        z51.cr(
          z51.sRotRB(
            z51.swl(a57("q"), z51.swr(o46.p2.conjunction(a57("p"), a57("r")), i58.i(a57("p"))))
          ),
          z51.sRotLB(
            z51.sRotRB(
              z51.swl(
                a57("p"),
                z51.swr(o46.p2.conjunction(a57("p"), a57("r")), i58.i(a57("q")))
              )
            )
          )
        ),
        z51.swr(
          o46.p2.conjunction(a57("p"), a57("q")),
          z51.cr(
            z51.swl(a57("r"), i58.i(a57("p"))),
            z51.sRotLB(z51.swl(a57("p"), i58.i(a57("r"))))
          )
        )
      )
    )
  )
);
var ch6branching8 = challenge({ rules: rules2, goal: goal57, solution: solution57 });

// src/challenges/ch6-branching-9.ts
var { a: a58, o: o47, z: z52, i: i59 } = rk;
var goal58 = conclusion(
  o47.p2.implication(
    o47.p2.disjunction(
      o47.p2.conjunction(a58("p"), a58("q")),
      o47.p2.conjunction(a58("p"), a58("r"))
    ),
    o47.p2.conjunction(a58("p"), o47.p2.disjunction(a58("q"), a58("r")))
  )
);
var solution58 = z52.ir(
  z52.dl(
    z52.cl(
      z52.cr(
        z52.swl(a58("q"), i59.i(a58("p"))),
        z52.dr(z52.sRotLB(z52.sRotRB(z52.swl(a58("p"), z52.swr(a58("r"), i59.i(a58("q")))))))
      )
    ),
    z52.cl(
      z52.cr(
        z52.swl(a58("r"), i59.i(a58("p"))),
        z52.dr(z52.sRotLB(z52.swl(a58("p"), z52.swr(a58("q"), i59.i(a58("r"))))))
      )
    )
  )
);
var ch6branching9 = challenge({ rules: rules2, goal: goal58, solution: solution58 });

// src/challenges/ch6-branching-10.ts
var { a: a59, o: o48, i: i60 } = rk;
var goal59 = sequent(
  [o48.p2.disjunction(a59("r"), a59("s"))],
  [o48.p2.disjunction(a59("r"), a59("s"))]
);
var solution59 = i60.i(o48.p2.disjunction(a59("r"), a59("s")));
var ch6branching10 = challenge({ rules: rules2, goal: goal59, solution: solution59 });

// src/challenges/ch7-completeness-1.ts
var { a: a60, o: o49, z: z53, i: i61 } = rk;
var goal60 = sequent([a60("p"), o49.p2.implication(a60("p"), a60("q"))], [a60("q")]);
var solution60 = z53.il(
  z53.sRotRB(z53.swr(a60("q"), i61.i(a60("p")))),
  z53.sRotLB(z53.swl(a60("p"), i61.i(a60("q"))))
);
var ch7completeness1 = challenge({ rules: rules2, goal: goal60, solution: solution60 });

// src/challenges/ch7-completeness-2.ts
var { a: a61, o: o50, z: z54, i: i62 } = rk;
var goal61 = conclusion(
  o50.p2.implication(
    o50.p2.implication(a61("p"), a61("q")),
    o50.p2.implication(o50.p1.negation(a61("q")), o50.p1.negation(a61("p")))
  )
);
var solution61 = z54.ir(
  z54.ir(
    z54.sRotLB(
      z54.il(
        z54.sRotRB(z54.nr(z54.sRotLB(z54.swl(o50.p1.negation(a61("q")), i62.i(a61("p")))))),
        z54.sRotLB(z54.nl(z54.sRotRB(z54.swr(o50.p1.negation(a61("p")), i62.i(a61("q"))))))
      )
    )
  )
);
var ch7completeness2 = challenge({ rules: rules2, goal: goal61, solution: solution61 });

// src/challenges/ch7-completeness-3.ts
var { a: a62, o: o51, z: z55, i: i63 } = rk;
var goal62 = conclusion(
  o51.p2.implication(
    o51.p2.implication(a62("p"), a62("q")),
    o51.p2.implication(
      o51.p2.implication(a62("q"), a62("r")),
      o51.p2.implication(a62("p"), a62("r"))
    )
  )
);
var solution62 = z55.ir(
  z55.ir(
    z55.ir(
      z55.sRotLB(
        z55.il(
          z55.il(
            z55.sRotRB(z55.swr(a62("q"), z55.swr(a62("r"), i63.i(a62("p"))))),
            z55.sRotLB(z55.sRotRB(z55.swl(a62("p"), z55.swr(a62("r"), i63.i(a62("q"))))))
          ),
          z55.sRotLB(
            z55.swl(o51.p2.implication(a62("p"), a62("q")), z55.swl(a62("p"), i63.i(a62("r"))))
          )
        )
      )
    )
  )
);
var ch7completeness3 = challenge({ rules: rules2, goal: goal62, solution: solution62 });

// src/challenges/ch7-completeness-4.ts
var { a: a63, o: o52, z: z56, i: i64 } = rk;
var goal63 = conclusion(
  o52.p2.implication(
    o52.p2.implication(o52.p2.conjunction(a63("p"), a63("q")), a63("r")),
    o52.p2.implication(a63("p"), o52.p2.implication(a63("q"), a63("r")))
  )
);
var solution63 = z56.ir(
  z56.ir(
    z56.ir(
      z56.sRotLB(
        z56.sRotLB(
          z56.il(
            z56.cr(
              z56.sRotRB(z56.swl(a63("q"), z56.swr(a63("r"), i64.i(a63("p"))))),
              z56.sRotLB(z56.sRotRB(z56.swl(a63("p"), z56.swr(a63("r"), i64.i(a63("q"))))))
            ),
            z56.sRotLB(z56.swl(a63("q"), z56.swl(a63("p"), i64.i(a63("r")))))
          )
        )
      )
    )
  )
);
var ch7completeness4 = challenge({ rules: rules2, goal: goal63, solution: solution63 });

// src/challenges/ch7-completeness-5.ts
var { a: a64, o: o53, z: z57, i: i65 } = rk;
var goal64 = conclusion(
  o53.p2.implication(
    o53.p2.implication(o53.p2.implication(a64("p"), a64("q")), a64("p")),
    a64("p")
  )
);
var solution64 = z57.ir(z57.il(z57.ir(z57.swr(a64("q"), i65.i(a64("p")))), i65.i(a64("p"))));
var ch7completeness5 = challenge({ rules: rules2, goal: goal64, solution: solution64 });

// src/challenges/ch7-completeness-6.ts
var { a: a65, o: o54, z: z58, i: i66 } = rk;
var goal65 = conclusion(
  o54.p2.implication(
    o54.p2.implication(a65("p"), a65("q")),
    o54.p2.implication(
      o54.p2.implication(a65("p"), o54.p1.negation(a65("q"))),
      o54.p1.negation(a65("p"))
    )
  )
);
var solution65 = z58.ir(
  z58.ir(
    z58.il(
      z58.il(
        z58.swr(a65("p"), z58.sRotRB(z58.nr(i66.i(a65("p"))))),
        z58.sRotRB(z58.nr(z58.sRotLB(z58.swl(a65("q"), i66.i(a65("p"))))))
      ),
      z58.sRotLB(
        z58.il(
          z58.sRotRB(z58.nr(z58.sRotLB(z58.swl(o54.p1.negation(a65("q")), i66.i(a65("p")))))),
          z58.sRotLB(z58.nl(z58.sRotRB(z58.swr(o54.p1.negation(a65("p")), i66.i(a65("q"))))))
        )
      )
    )
  )
);
var ch7completeness6 = challenge({ rules: rules2, goal: goal65, solution: solution65 });

// src/challenges/ch7-completeness-7.ts
var { a: a66, o: o55, z: z59, i: i67 } = rk;
var goal66 = conclusion(
  o55.p2.implication(
    o55.p2.implication(a66("p"), o55.p2.implication(a66("p"), a66("q"))),
    o55.p2.implication(a66("p"), a66("q"))
  )
);
var solution66 = z59.ir(
  z59.il(
    z59.sRotRB(z59.ir(z59.swr(a66("q"), i67.i(a66("p"))))),
    i67.i(o55.p2.implication(a66("p"), a66("q")))
  )
);
var ch7completeness7 = challenge({ rules: rules2, goal: goal66, solution: solution66 });

// src/challenges/ch7-completeness-8.ts
var { a: a67, o: o56, z: z60, i: i68 } = rk;
var goal67 = conclusion(
  o56.p2.implication(
    o56.p2.implication(o56.p2.implication(a67("p"), a67("q")), a67("q")),
    o56.p2.implication(o56.p2.implication(a67("q"), a67("p")), a67("p"))
  )
);
var solution67 = z60.ir(
  z60.ir(
    z60.sRotLB(
      z60.il(
        z60.ir(
          z60.sRotLB(
            z60.swl(o56.p2.implication(a67("q"), a67("p")), z60.swr(a67("q"), i68.i(a67("p"))))
          )
        ),
        z60.sRotLB(
          z60.il(
            z60.sRotRB(z60.swr(a67("p"), i68.i(a67("q")))),
            z60.sRotLB(z60.swl(a67("q"), i68.i(a67("p"))))
          )
        )
      )
    )
  )
);
var ch7completeness8 = challenge({ rules: rules2, goal: goal67, solution: solution67 });

// src/challenges/ch7-completeness-9.ts
var { a: a68, o: o57, z: z61, i: i69 } = rk;
var goal68 = conclusion(
  o57.p2.implication(
    o57.p2.implication(a68("p"), o57.p2.implication(a68("q"), a68("r"))),
    o57.p2.implication(o57.p2.conjunction(a68("p"), a68("q")), a68("r"))
  )
);
var solution68 = z61.ir(
  z61.ir(
    z61.cl(
      z61.sRotLB(
        z61.sRotLB(
          z61.il(
            z61.sRotRB(z61.swl(a68("q"), z61.swr(a68("r"), i69.i(a68("p"))))),
            z61.il(
              z61.sRotLB(z61.sRotRB(z61.swl(a68("p"), z61.swr(a68("r"), i69.i(a68("q")))))),
              z61.sRotLB(z61.swl(a68("q"), z61.swl(a68("p"), i69.i(a68("r")))))
            )
          )
        )
      )
    )
  )
);
var ch7completeness9 = challenge({ rules: rules2, goal: goal68, solution: solution68 });

// src/challenges/ch7-completeness-10.ts
var { a: a69, o: o58, i: i70 } = rk;
var goal69 = sequent(
  [
    o58.p2.implication(
      o58.p2.disjunction(a69("p"), a69("q")),
      o58.p2.conjunction(a69("p"), a69("q"))
    )
  ],
  [
    o58.p2.implication(
      o58.p2.disjunction(a69("p"), a69("q")),
      o58.p2.conjunction(a69("p"), a69("q"))
    )
  ]
);
var solution69 = i70.i(
  o58.p2.implication(
    o58.p2.disjunction(a69("p"), a69("q")),
    o58.p2.conjunction(a69("p"), a69("q"))
  )
);
var ch7completeness10 = challenge({ rules: rules2, goal: goal69, solution: solution69 });

// src/challenges/ch7-completeness-11.ts
var { a: a70, o: o59, i: i71 } = rk;
var goal70 = sequent(
  [
    o59.p2.implication(
      o59.p2.disjunction(a70("p"), o59.p1.negation(a70("q"))),
      o59.p1.negation(o59.p2.conjunction(a70("r"), a70("s")))
    )
  ],
  [
    o59.p2.implication(
      o59.p2.disjunction(a70("p"), o59.p1.negation(a70("q"))),
      o59.p1.negation(o59.p2.conjunction(a70("r"), a70("s")))
    )
  ]
);
var solution70 = i71.i(
  o59.p2.implication(
    o59.p2.disjunction(a70("p"), o59.p1.negation(a70("q"))),
    o59.p1.negation(o59.p2.conjunction(a70("r"), a70("s")))
  )
);
var ch7completeness11 = challenge({ rules: rules2, goal: goal70, solution: solution70 });

// src/challenges/ch8-constants-1.ts
var { a: a71, o: o60, z: z62, i: i72 } = rk;
var goal71 = sequent([a71("p"), o60.p0.verum, a71("q")], [a71("r"), o60.p0.verum, a71("s")]);
var solution71 = z62.swr(
  a71("r"),
  z62.sRotRB(
    z62.swl(a71("q"), z62.swl(o60.p0.verum, z62.swl(a71("p"), z62.swr(a71("s"), i72.v()))))
  )
);
var ch8constants1 = challenge({ rules: rules2, goal: goal71, solution: solution71 });

// src/challenges/ch8-constants-2.ts
var { a: a72, o: o61, z: z63, i: i73 } = rk;
var goal72 = sequent(
  [a72("s"), o61.p0.falsum, a72("r")],
  [a72("q"), o61.p0.falsum, a72("p")]
);
var solution72 = z63.swl(
  a72("r"),
  z63.sRotLB(
    z63.swl(a72("s"), z63.swr(a72("q"), z63.swr(o61.p0.falsum, z63.swr(a72("p"), i73.f()))))
  )
);
var ch8constants2 = challenge({ rules: rules2, goal: goal72, solution: solution72 });

// src/challenges/ch8-constants-3.ts
var { a: a73, o: o62, z: z64, i: i74 } = rk;
var goal73 = sequent([a73("s"), a73("p"), a73("s")], [a73("r"), o62.p0.verum, a73("r")]);
var solution73 = z64.swr(
  a73("r"),
  z64.sRotRB(z64.swl(a73("s"), z64.swl(a73("p"), z64.swl(a73("s"), z64.swr(a73("r"), i74.v())))))
);
var ch8constants3 = challenge({ rules: rules2, goal: goal73, solution: solution73 });

// src/challenges/ch8-constants-4.ts
var { a: a74, o: o63, z: z65, i: i75 } = rk;
var goal74 = sequent([a74("s"), o63.p0.falsum, a74("s")], [a74("r"), a74("p"), a74("r")]);
var solution74 = z65.swl(
  a74("s"),
  z65.sRotLB(z65.swl(a74("s"), z65.swr(a74("r"), z65.swr(a74("p"), z65.swr(a74("r"), i75.f())))))
);
var ch8constants4 = challenge({ rules: rules2, goal: goal74, solution: solution74 });

// src/challenges/ch8-constants-5.ts
var { a: a75, o: o64, z: z66, i: i76 } = rk;
var goal75 = conclusion(
  o64.p2.implication(
    o64.p2.implication(a75("p"), o64.p2.implication(a75("q"), o64.p1.negation(a75("p")))),
    o64.p2.implication(a75("p"), o64.p0.verum)
  )
);
var solution75 = z66.ir(
  z66.ir(
    z66.swl(
      a75("p"),
      z66.swl(
        o64.p2.implication(
          a75("p"),
          o64.p2.implication(a75("q"), o64.p1.negation(a75("p")))
        ),
        i76.v()
      )
    )
  )
);
var ch8constants5 = challenge({ rules: rules2, goal: goal75, solution: solution75 });

// src/challenges/ch8-constants-6.ts
var { a: a76, o: o65, z: z67, i: i77 } = rk;
var goal76 = conclusion(
  o65.p2.implication(
    o65.p1.negation(o65.p1.negation(o65.p0.falsum)),
    o65.p1.negation(o65.p1.negation(o65.p1.negation(o65.p1.negation(a76("s")))))
  )
);
var solution76 = z67.ir(
  z67.nl(
    z67.nr(
      z67.swr(
        o65.p1.negation(o65.p1.negation(o65.p1.negation(o65.p1.negation(a76("s"))))),
        i77.f()
      )
    )
  )
);
var ch8constants6 = challenge({ rules: rules2, goal: goal76, solution: solution76 });

// src/challenges/ch8-constants-7.ts
var { a: a77, o: o66, z: z68, i: i78 } = rk;
var goal77 = sequent(
  [o66.p2.disjunction(o66.p0.falsum, a77("p"))],
  [o66.p2.conjunction(o66.p0.verum, a77("p"))]
);
var solution77 = z68.dl(
  z68.swr(o66.p2.conjunction(o66.p0.verum, a77("p")), i78.f()),
  z68.cr(z68.swl(a77("p"), i78.v()), i78.i(a77("p")))
);
var ch8constants7 = challenge({ rules: rules2, goal: goal77, solution: solution77 });

// src/challenges/ch8-constants-8.ts
var { a: a78, o: o67, z: z69, i: i79 } = rk;
var goal78 = conclusion(
  o67.p2.implication(
    o67.p2.implication(a78("p"), a78("q")),
    o67.p2.implication(
      o67.p2.implication(a78("q"), o67.p0.falsum),
      o67.p2.implication(a78("p"), a78("r"))
    )
  )
);
var solution78 = z69.ir(
  z69.ir(
    z69.sRotLB(
      z69.il(
        z69.sRotRB(
          z69.ir(
            z69.sRotLB(
              z69.swl(
                o67.p2.implication(a78("q"), o67.p0.falsum),
                z69.swr(a78("r"), i79.i(a78("p")))
              )
            )
          )
        ),
        z69.sRotLB(
          z69.il(
            z69.sRotRB(z69.swr(o67.p2.implication(a78("p"), a78("r")), i79.i(a78("q")))),
            z69.sRotLB(
              z69.swl(a78("q"), z69.swr(o67.p2.implication(a78("p"), a78("r")), i79.f()))
            )
          )
        )
      )
    )
  )
);
var ch8constants8 = challenge({ rules: rules2, goal: goal78, solution: solution78 });

// src/challenges/ch8-constants-9.ts
var { a: a79, o: o68, z: z70, i: i80 } = rk;
var goal79 = sequent(
  [
    o68.p2.conjunction(
      o68.p2.conjunction(a79("r"), a79("q")),
      o68.p2.implication(a79("s"), o68.p1.negation(o68.p0.verum))
    )
  ],
  [
    o68.p2.disjunction(
      o68.p2.implication(a79("s"), o68.p2.implication(a79("q"), a79("r"))),
      o68.p0.falsum
    )
  ]
);
var solution79 = z70.cl(
  z70.dr(
    z70.il(
      z70.sRotRB(
        z70.ir(
          z70.sRotLB(
            z70.swl(
              o68.p2.conjunction(a79("r"), a79("q")),
              z70.swr(
                o68.p2.implication(a79("q"), a79("r")),
                z70.swr(o68.p0.falsum, i80.i(a79("s")))
              )
            )
          )
        )
      ),
      z70.nl(
        z70.sRotRB(
          z70.swl(
            o68.p2.conjunction(a79("r"), a79("q")),
            z70.swr(
              o68.p2.implication(a79("s"), o68.p2.implication(a79("q"), a79("r"))),
              z70.swr(o68.p0.falsum, i80.v())
            )
          )
        )
      )
    )
  )
);
var ch8constants9 = challenge({ rules: rules2, goal: goal79, solution: solution79 });

// src/challenges/ch9-consolidation-1.ts
var { a: a80, o: o69, z: z71, i: i81 } = rk;
var goal80 = conclusion(
  o69.p2.disjunction(
    o69.p2.disjunction(a80("r"), a80("s")),
    o69.p2.implication(
      o69.p2.conjunction(
        o69.p2.implication(a80("q"), a80("r")),
        o69.p2.conjunction(a80("p"), a80("q"))
      ),
      o69.p2.implication(a80("q"), a80("r"))
    )
  )
);
var solution80 = z71.dr(
  z71.swr(
    o69.p2.disjunction(a80("r"), a80("s")),
    z71.ir(
      z71.cl(
        z71.swl(
          o69.p2.conjunction(a80("p"), a80("q")),
          i81.i(o69.p2.implication(a80("q"), a80("r")))
        )
      )
    )
  )
);
var ch9consolidation1 = challenge({ rules: rules2, goal: goal80, solution: solution80 });

// src/challenges/ch9-consolidation-2.ts
var { a: a81, o: o70, z: z72, i: i82 } = rk;
var goal81 = conclusion(
  o70.p2.implication(
    a81("p"),
    o70.p2.implication(
      o70.p1.negation(o70.p2.disjunction(a81("p"), a81("q"))),
      o70.p2.implication(a81("q"), a81("r"))
    )
  )
);
var solution81 = z72.ir(
  z72.ir(
    z72.nl(
      z72.dr(
        z72.sRotRB(
          z72.swr(a81("q"), z72.swr(o70.p2.implication(a81("q"), a81("r")), i82.i(a81("p"))))
        )
      )
    )
  )
);
var ch9consolidation2 = challenge({ rules: rules2, goal: goal81, solution: solution81 });

// src/challenges/ch9-consolidation-3.ts
var { a: a82, o: o71, z: z73, i: i83 } = rk;
var goal82 = conclusion(
  o71.p2.implication(
    o71.p2.conjunction(
      o71.p2.implication(a82("p"), a82("q")),
      o71.p2.disjunction(o71.p1.negation(a82("q")), a82("r"))
    ),
    o71.p2.disjunction(o71.p1.negation(a82("p")), a82("r"))
  )
);
var solution82 = z73.ir(
  z73.cl(
    z73.sRotLB(
      z73.il(
        z73.sRotRB(
          z73.dr(
            z73.nr(
              z73.sRotLB(
                z73.swl(
                  o71.p2.disjunction(o71.p1.negation(a82("q")), a82("r")),
                  z73.swr(a82("r"), i83.i(a82("p")))
                )
              )
            )
          )
        ),
        z73.sRotLB(
          z73.dl(
            z73.nl(
              z73.sRotRB(
                z73.swr(
                  o71.p2.disjunction(o71.p1.negation(a82("p")), a82("r")),
                  i83.i(a82("q"))
                )
              )
            ),
            z73.dr(
              z73.sRotLB(
                z73.swl(a82("q"), z73.swr(o71.p1.negation(a82("p")), i83.i(a82("r"))))
              )
            )
          )
        )
      )
    )
  )
);
var ch9consolidation3 = challenge({ rules: rules2, goal: goal82, solution: solution82 });

// src/challenges/ch9-consolidation-4.ts
var { a: a83, o: o72, z: z74, i: i84 } = rk;
var goal83 = conclusion(o72.p2.disjunction(a83("p"), o72.p1.negation(a83("p"))));
var solution83 = z74.dr(z74.sRotRB(z74.nr(i84.i(a83("p")))));
var ch9consolidation4 = challenge({ rules: rules2, goal: goal83, solution: solution83 });

// src/challenges/ch9-consolidation-5.ts
var { a: a84, o: o73, z: z75, i: i85 } = rk;
var goal84 = conclusion(
  o73.p2.implication(
    o73.p2.implication(a84("p"), o73.p2.implication(a84("q"), a84("r"))),
    o73.p2.implication(a84("q"), o73.p2.implication(a84("p"), a84("r")))
  )
);
var solution84 = z75.ir(
  z75.ir(
    z75.ir(
      z75.sRotLB(
        z75.sRotLB(
          z75.il(
            z75.sRotLB(z75.sRotRB(z75.swl(a84("q"), z75.swr(a84("r"), i85.i(a84("p")))))),
            z75.il(
              z75.sRotRB(z75.swl(a84("p"), z75.swr(a84("r"), i85.i(a84("q"))))),
              z75.sRotLB(z75.swl(a84("p"), z75.swl(a84("q"), i85.i(a84("r")))))
            )
          )
        )
      )
    )
  )
);
var ch9consolidation5 = challenge({ rules: rules2, goal: goal84, solution: solution84 });

// src/challenges/ch9-consolidation-6.ts
var { a: a85, o: o74, z: z76, i: i86 } = rk;
var goal85 = conclusion(
  o74.p2.implication(
    o74.p2.implication(a85("p"), a85("r")),
    o74.p2.implication(
      o74.p2.implication(a85("q"), a85("r")),
      o74.p2.implication(o74.p2.disjunction(a85("p"), a85("q")), a85("r"))
    )
  )
);
var solution85 = z76.ir(
  z76.ir(
    z76.ir(
      z76.dl(
        z76.sRotLB(
          z76.swl(
            o74.p2.implication(a85("q"), a85("r")),
            z76.il(
              z76.sRotRB(z76.swr(a85("r"), i86.i(a85("p")))),
              z76.sRotLB(z76.swl(a85("p"), i86.i(a85("r"))))
            )
          )
        ),
        z76.sRotLB(
          z76.il(
            z76.sRotRB(
              z76.swl(
                o74.p2.implication(a85("p"), a85("r")),
                z76.swr(a85("r"), i86.i(a85("q")))
              )
            ),
            z76.sRotLB(
              z76.swl(
                o74.p2.implication(a85("p"), a85("r")),
                z76.swl(a85("q"), i86.i(a85("r")))
              )
            )
          )
        )
      )
    )
  )
);
var ch9consolidation6 = challenge({ rules: rules2, goal: goal85, solution: solution85 });

// src/challenges/ch9-consolidation-7.ts
var { a: a86, o: o75, z: z77, i: i87 } = rk;
var goal86 = conclusion(
  o75.p2.disjunction(
    o75.p2.implication(a86("r"), a86("p")),
    o75.p2.conjunction(
      o75.p2.conjunction(
        a86("r"),
        o75.p2.conjunction(
          a86("r"),
          o75.p2.disjunction(
            o75.p2.conjunction(a86("r"), o75.p2.implication(a86("s"), a86("p"))),
            o75.p2.disjunction(a86("r"), a86("p"))
          )
        )
      ),
      o75.p2.implication(o75.p0.falsum, a86("q"))
    )
  )
);
var solution86 = z77.dr(
  z77.ir(
    z77.swr(
      a86("p"),
      z77.cr(
        z77.cr(
          i87.i(a86("r")),
          z77.cr(
            i87.i(a86("r")),
            z77.dr(
              z77.swr(
                o75.p2.conjunction(a86("r"), o75.p2.implication(a86("s"), a86("p"))),
                z77.dr(z77.sRotRB(z77.swr(a86("p"), i87.i(a86("r")))))
              )
            )
          )
        ),
        z77.ir(z77.sRotLB(z77.swl(a86("r"), z77.swr(a86("q"), i87.f()))))
      )
    )
  )
);
var ch9consolidation7 = challenge({ rules: rules2, goal: goal86, solution: solution86 });

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
  exitToMainMenu: "Exit to Main Menu",
  left: "Left",
  right: "Right",
  drop: "Drop",
  destruct: "Destruct",
  rules: "Rules",
  axiom: "Close",
  playAgain: "Play Again",
  playAgainShort: "Again",
  settings: "Settings",
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
  continue: "Continue",
  start: "Start",
  back: "Back",
  preview: "Preview",
  moves: "Moves",
  par: "Par",
  points: "Points",
  bonus: "Bonus",
  done: "Done",
  goal: "Goal",
  statsTemplate: "Generated {formulas} formulas ({rate}/s), {tautologies} tautologies, {solved} solved. Updated {sinceUpdate}s ago.",
  customChallenge: "Custom Challenge",
  lemmaTitle: "Build Lemma",
  lemmaConfirm: "Confirm",
  lemma: "Lemma",
  secret: "Secret",
  prevBranch: "Prev",
  nextBranch: "Next",
  versus: "Versus",
  player1: "Player 1",
  player2: "Player 2",
  tie: "Tie!",
  winsTemplate: "{player} wins!",
  skip: "Skip",
  players: "Players",
  matchLength: "Match Length (min)",
  mouse: "Mouse",
  keyboard: "Keyboard",
  gamepad1: "Gamepad 1",
  gamepad2: "Gamepad 2",
  npc: "NPC"
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
  exitToMainMenu: "P\xE4\xE4valikkoon",
  left: "Vasen",
  right: "Oikea",
  drop: "Pudota",
  destruct: "Pura",
  rules: "S\xE4\xE4nn\xF6t",
  axiom: "Sulje",
  playAgain: "Pelaa uudestaan",
  playAgainShort: "Uudestaan",
  settings: "Asetukset",
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
  continue: "Jatka",
  start: "Aloita",
  back: "Takaisin",
  preview: "Esikatselu",
  moves: "Siirrot",
  par: "Par",
  points: "Pisteet",
  bonus: "Bonus",
  done: "Valmis",
  goal: "Tavoite",
  statsTemplate: "Tuotettu {formulas} kaavaa ({rate}/s), {tautologies} tautologiaa, {solved} ratkaisua. P\xE4ivitetty {sinceUpdate}s sitten.",
  customChallenge: "Muokattu haaste",
  lemmaTitle: "Rakenna lemma",
  lemmaConfirm: "Vahvista",
  lemma: "Lemma",
  secret: "Salainen",
  prevBranch: "Edellinen",
  nextBranch: "Seuraava",
  versus: "Vastakkain",
  player1: "Pelaaja 1",
  player2: "Pelaaja 2",
  tie: "Tasapeli!",
  winsTemplate: "{player} voitti!",
  skip: "Ohita",
  players: "Pelaajat",
  matchLength: "Ottelun kesto (min)",
  mouse: "Hiiri",
  keyboard: "N\xE4pp\xE4imist\xF6",
  gamepad1: "Ohjain 1",
  gamepad2: "Ohjain 2",
  npc: "NPC"
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
  exitToMainMenu: "Salir al men\xFA principal",
  left: "Izquierda",
  right: "Derecha",
  drop: "Soltar",
  destruct: "Destruir",
  rules: "Reglas",
  axiom: "Cerrar",
  playAgain: "Jugar de nuevo",
  playAgainShort: "De nuevo",
  settings: "Ajustes",
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
  continue: "Continuar",
  start: "Comenzar",
  back: "Atr\xE1s",
  preview: "Vista previa",
  moves: "Movimientos",
  par: "Par",
  points: "Puntos",
  bonus: "Bonus",
  done: "Hecho",
  goal: "Objetivo",
  statsTemplate: "Generadas {formulas} f\xF3rmulas ({rate}/s), {tautologies} tautolog\xEDas, {solved} resueltas. Actualizado hace {sinceUpdate}s.",
  customChallenge: "Desaf\xEDo personalizado",
  lemmaTitle: "Construir lema",
  lemmaConfirm: "Confirmar",
  lemma: "Lema",
  secret: "Secreto",
  prevBranch: "Anterior",
  nextBranch: "Siguiente",
  versus: "Versus",
  player1: "Jugador 1",
  player2: "Jugador 2",
  tie: "\xA1Empate!",
  winsTemplate: "\xA1{player} gana!",
  skip: "Saltar",
  players: "Jugadores",
  matchLength: "Duraci\xF3n (min)",
  mouse: "Rat\xF3n",
  keyboard: "Teclado",
  gamepad1: "Mando 1",
  gamepad2: "Mando 2",
  npc: "NPC"
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
  exitToMainMenu: "Zp\u011Bt do hlavn\xEDho menu",
  left: "Vlevo",
  right: "Vpravo",
  drop: "Pustit",
  destruct: "Zni\u010Dit",
  rules: "Pravidla",
  axiom: "Zav\u0159\xEDt",
  playAgain: "Hr\xE1t znovu",
  playAgainShort: "Znovu",
  settings: "Nastaven\xED",
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
  continue: "Pokra\u010Dovat",
  start: "Start",
  back: "Zp\u011Bt",
  preview: "N\xE1hled",
  moves: "Tahy",
  par: "Par",
  points: "Body",
  bonus: "Bonus",
  done: "Hotovo",
  goal: "C\xEDl",
  statsTemplate: "Vygenerov\xE1no {formulas} formul\xED ({rate}/s), {tautologies} tautologi\xED, {solved} vy\u0159e\u0161eno. Aktualizov\xE1no p\u0159ed {sinceUpdate}s.",
  customChallenge: "Vlastn\xED v\xFDzva",
  lemmaTitle: "Sestavit lemma",
  lemmaConfirm: "Potvrdit",
  lemma: "Lemma",
  secret: "Tajn\xE9",
  prevBranch: "P\u0159edchoz\xED",
  nextBranch: "Dal\u0161\xED",
  versus: "Versus",
  player1: "Hr\xE1\u010D 1",
  player2: "Hr\xE1\u010D 2",
  tie: "Rem\xEDza!",
  winsTemplate: "{player} vyhr\xE1v\xE1!",
  skip: "P\u0159esko\u010Dit",
  players: "Hr\xE1\u010Di",
  matchLength: "D\xE9lka z\xE1pasu (min)",
  mouse: "My\u0161",
  keyboard: "Kl\xE1vesnice",
  gamepad1: "Ovlada\u010D 1",
  gamepad2: "Ovlada\u010D 2",
  npc: "NPC"
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
  exitToMainMenu: "Wyjd\u017A do menu g\u0142\xF3wnego",
  left: "Lewo",
  right: "Prawo",
  drop: "Upu\u015B\u0107",
  destruct: "Zniszcz",
  rules: "Zasady",
  axiom: "Zamknij",
  playAgain: "Zagraj ponownie",
  playAgainShort: "Ponownie",
  settings: "Ustawienia",
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
  continue: "Kontynuuj",
  start: "Start",
  back: "Powr\xF3t",
  preview: "Podgl\u0105d",
  moves: "Ruchy",
  par: "Par",
  points: "Punkty",
  bonus: "Bonus",
  done: "Gotowe",
  goal: "Cel",
  statsTemplate: "Wygenerowano {formulas} formu\u0142 ({rate}/s), {tautologies} tautologii, {solved} rozwi\u0105zanych. Zaktualizowano {sinceUpdate}s temu.",
  customChallenge: "Niestandardowe wyzwanie",
  lemmaTitle: "Zbuduj lemat",
  lemmaConfirm: "Zatwierd\u017A",
  lemma: "Lemat",
  secret: "Tajne",
  prevBranch: "Poprzedni",
  nextBranch: "Nast\u0119pny",
  versus: "Versus",
  player1: "Gracz 1",
  player2: "Gracz 2",
  tie: "Remis!",
  winsTemplate: "{player} wygrywa!",
  skip: "Pomi\u0144",
  players: "Gracze",
  matchLength: "Czas meczu (min)",
  mouse: "Mysz",
  keyboard: "Klawiatura",
  gamepad1: "Pad 1",
  gamepad2: "Pad 2",
  npc: "NPC"
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
  const name2 = document.createElement("span");
  name2.className = "lang-switcher-name";
  name2.textContent = endonymOf(current2);
  const chevron = document.createElement("span");
  chevron.textContent = "\u25BE";
  button.appendChild(globe);
  button.appendChild(name2);
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
    (a87, b) => endonymOf(a87).localeCompare(endonymOf(b))
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
  let clicks = 0;
  const render = () => {
    container.innerHTML = "";
    const panel = document.createElement("div");
    panel.setAttribute("class", "menu");
    panel.appendChild(createLangSwitcher());
    const title = document.createElement("div");
    title.setAttribute("class", "menu-title");
    title.innerHTML = t("title");
    title.onclick = () => {
      clicks += 1;
      if (clicks > 5) navigate2("secret");
    };
    panel.appendChild(title);
    const modes = document.createElement("div");
    modes.setAttribute("class", "menu-modes");
    const versusBtn = document.createElement("div");
    versusBtn.setAttribute("class", "button menu-mode");
    versusBtn.textContent = t("versus");
    versusBtn.onclick = () => navigate2("versus-config");
    modes.appendChild(versusBtn);
    for (const mode of gameModes) {
      const btn = document.createElement("div");
      btn.setAttribute("class", "button menu-mode");
      btn.innerHTML = modeLabel[mode]();
      btn.onclick = () => navigate2(mode);
      modes.appendChild(btn);
    }
    panel.appendChild(modes);
    container.appendChild(panel);
  };
  render();
  return { cleanup: () => {
  }, rerender: render };
};

// src/interactive/event.ts
var reverse02 = (rev) => ({
  kind: "reverse0",
  rev
});
var reverse12 = (rev, a87) => ({
  kind: "reverse1",
  rev,
  a: a87
});
var undo2 = () => ({ kind: "undo" });
var reset2 = () => ({ kind: "reset" });
var nextBranch = () => ({ kind: "nextBranch" });
var prevBranch = () => ({ kind: "prevBranch" });

// src/utils/utils.ts
var isNonNullable = (value) => value != null;
function assertNever(_n, s = "Unexpected value") {
  throw new Error(s);
}

// src/render/block.ts
var space = " ";
function split(s, d) {
  const parts = s.split(d);
  if (isNonEmptyArray(parts)) {
    return parts;
  }
  return [s];
}
function align(a87, b) {
  const last3 = lastLine(a87);
  if (last3.trim().length < 1) {
    return null;
  }
  const [first, ...rest] = split(b, "\n");
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
  )(a87);
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
    (_, i88) => left2(width1)(lines1[i88] ?? String()) + left2(width2)(lines2[i88] ?? String())
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
  const [first, ...rest] = split(block, "\n");
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
var matchRuleId = (s, f2) => f2[s]();

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
  for (let i88 = 0; i88 < result.length; i88 += 1) {
    const s = result[i88];
    if (s === void 0) break;
    if (s.raw === true) continue;
    const trimmed = s.text.trimStart();
    result[i88] = { ...s, text: trimmed };
    if (trimmed.length > 0) break;
  }
  for (let i88 = result.length - 1; i88 >= 0; i88 -= 1) {
    const s = result[i88];
    if (s === void 0) break;
    if (s.raw === true) continue;
    const trimmed = s.text.trimEnd();
    result[i88] = { ...s, text: trimmed };
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
  return (a87) => (theme) => {
    const [s0, s1] = theme[key];
    if (key === "parenthesis") {
      return [paren(s0), ...a87(theme), paren(s1)];
    }
    return [
      markConnective ? connective(s0, activeConn) : activeConn ? active(s0) : of2(s0),
      ...a87(theme),
      of2(s1)
    ];
  };
}
function printBinary(key, activeConn = false, markConnective = false) {
  return (a87, b) => (theme) => {
    const [s0, s1, s2] = theme[key];
    return [
      of2(s0),
      ...a87(theme),
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
  const antPrinters = antecedent.map((f2, i88) => {
    const p = fromProp(f2, true);
    return gaze && gaze.side === "left" && gaze.index === i88 ? wrapGazed(p) : p;
  });
  const sucPrinters = succedent.map((f2, i88) => {
    const p = fromProp(f2, true);
    return gaze && gaze.side === "right" && gaze.index === i88 ? wrapGazed(p) : p;
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
        dl: () => t2.disjunction.join(empty3) + left3(l),
        cr: () => t2.conjunction.join(empty3) + right2(r),
        il: () => t2.implication.join(empty3) + left3(l),
        ir: () => t2.implication.join(empty3) + right2(r),
        nl: () => t2.negation.join(empty3) + left3(l),
        nr: () => t2.negation.join(empty3) + right2(r),
        swl: () => "W" + left3(l),
        swr: () => "W" + right2(r),
        sRotLB: () => "\u21B7" + left3(l),
        sRotRB: () => "\u21B6" + right2(r),
        cut: () => "\u2702\uFE0F"
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
function fromMeta(meta2) {
  return leftify(
    br,
    br,
    full(underline("*")(meta2.name)),
    br,
    ...meta2.propositions.flatMap(({ title, examples }) => [
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
    ...meta2.rules.flatMap(({ title, examples }) => [
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

// src/web/tree.ts
var equalPaths = (a87, b) => a87.length === b.length && a87.every((v2, i88) => v2 === b[i88]);
var startsWith = (path, prefix) => path.length >= prefix.length && prefix.every((v2, i88) => v2 === path[i88]);
var renderSequent = (derivation, isActive, gaze, ghost = false) => {
  const el = document.createElement("div");
  el.setAttribute("class", "tree-sequent" + (ghost ? " ghost" : ""));
  el.innerHTML = html(
    fromSequent(derivation.result, isActive ? gaze : null)(basic)
  );
  return el;
};
var renderInferenceLine = (ruleId, ghost = false) => {
  const container = document.createElement("div");
  container.setAttribute("class", "tree-inference" + (ghost ? " ghost" : ""));
  const label = document.createElement("div");
  label.setAttribute("class", "tree-rule-label");
  label.innerHTML = html(
    fromRuleId(ruleId, t("sideLeft"), t("sideRight"))(basic)
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
    derivation.deps.forEach((dep, i88) => {
      const child = renderDerivation(
        dep,
        activePath2,
        gaze,
        [...currentPath, i88],
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
    for (let i88 = 0; i88 < children.length; i88 += 1) {
      const child = children[i88];
      if (!child) continue;
      const cw = stabilizeWidths(child);
      childSubtreeSum += cw.subtree;
      const pad2 = (cw.subtree - cw.sequent) / 2;
      if (i88 === 0) firstChildPad = pad2;
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
  const candidates = side === "left" ? ["nl", "cl", "dl", "il"] : ["nr", "dr", "cr", "ir"];
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
  for (let i88 = 0; i88 < MAX_STEPS; i88 += 1) {
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
  KeyC: "lemma",
  Space: "axiom",
  Enter: "axiom",
  Backspace: "undo",
  ArrowLeft: "gazeLeft",
  ArrowRight: "gazeRight",
  ArrowUp: "gazeConnective",
  ArrowDown: "gazeWeakening",
  KeyR: "toggleRules",
  KeyN: "skip"
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
  2: "lemma",
  // Square
  3: "skip",
  // Triangle
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
var activeInput = "pointer";
var hotMode = false;
var gazeModeActive = false;
var gamepadListeners = /* @__PURE__ */ new Set();
var isGamepadActive = () => activeInput === "gamepad";
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
var inputClass = {
  pointer: "input-pointer",
  keyboard: "input-keyboard",
  gamepad: "input-gamepad"
};
var setActiveInput = (v2) => {
  if (activeInput === v2) return;
  const wasGamepad = activeInput === "gamepad";
  activeInput = v2;
  if (typeof document !== "undefined") {
    const el = document.documentElement;
    el.classList.remove("input-pointer", "input-keyboard", "input-gamepad");
    el.classList.add(inputClass[v2]);
  }
  if (wasGamepad !== (v2 === "gamepad")) notifyGamepadListeners();
};
if (typeof document !== "undefined") {
  document.documentElement.classList.add("input-pointer");
}
var markPointerInput = () => setActiveInput("pointer");
var markKeyboardInput = () => {
  setActiveInput("keyboard");
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("keyboard-detected");
  }
};
if (typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.documentElement.classList.add("keyboard-detected");
}
var markGamepadInput = () => setActiveInput("gamepad");
var onGamepadConnected = () => setActiveInput("gamepad");
var onGamepadDisconnected = () => setActiveInput("pointer");
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
var getActionHint = (action) => isGamepadActive() ? activeActionPadHint()[action] : actionKeyHint[action];
var kbdHint = (s) => isGamepadActive() ? void 0 : s;
var dualHint = (kbd, padAction) => isGamepadActive() ? activeActionPadHint()[padAction] : kbd;
var getActionHintPure = (action, isGamepad) => isGamepad ? activeActionPadHint()[action] : actionKeyHint[action];

// src/web/game.ts
var ghostToDerivation = (chain, activeSequent2) => {
  let deps = [];
  for (let i88 = chain.length - 1; i88 >= 0; i88 -= 1) {
    const step = chain[i88];
    if (!step) continue;
    if (deps.length === 0) {
      deps = step.sequents.map((s) => premise(s));
    }
    if (i88 === 0) {
      return transformation(activeSequent2, deps, step.rule);
    }
    const result = chain[i88 - 1]?.sequents[0];
    if (!result) continue;
    deps = [transformation(result, deps, step.rule)];
  }
  return premise(activeSequent2);
};
var ruleAction = {
  swl: "leftWeakening",
  sRotLB: "leftRotateRight",
  nl: "leftConnective",
  cl: "leftConnective",
  dl: "leftConnective",
  il: "leftConnective",
  swr: "rightWeakening",
  sRotRB: "rightRotateLeft",
  nr: "rightConnective",
  dr: "rightConnective",
  cr: "rightConnective",
  ir: "rightConnective",
  i: "axiom",
  f: "axiom",
  v: "axiom",
  cut: "lemma"
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
      labelSpan.textContent = label;
      el.appendChild(labelSpan);
    } else {
      el.innerHTML = label;
    }
  } else {
    const longSpan = document.createElement("span");
    longSpan.setAttribute("class", "button-label long");
    longSpan.textContent = label.long;
    el.appendChild(longSpan);
    const shortSpan = document.createElement("span");
    shortSpan.setAttribute("class", "button-label short");
    shortSpan.textContent = label.short;
    el.appendChild(shortSpan);
  }
  return el;
};
var rulesVisible = false;
var setDefaultRulesVisible = (visible) => {
  rulesVisible = visible;
  treeZoom = 1;
  autoZoomedDerivations = /* @__PURE__ */ new WeakSet();
};
var treeZoom = 1;
var ZOOM_MIN = 0.4;
var ZOOM_MAX = 2;
var ZOOM_STEP = 0.2;
var autoZoomedDerivations = /* @__PURE__ */ new WeakSet();
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
var createBenchCtx = (isGamepadMode = false, autoZoom = true, showPar = true, showHud = true, autoZoomMax = AUTO_ZOOM_MAX) => {
  let gazeModeActive2 = false;
  let zoom = 1;
  const autoZoomed = /* @__PURE__ */ new WeakSet();
  let lastScrollTop2 = 0;
  let lastScrollLeft2 = 0;
  let rulesVis = false;
  return {
    isGazeModeActive: () => gazeModeActive2,
    setGazeModeActive: (v2) => {
      gazeModeActive2 = v2;
    },
    getActionHint: (action) => getActionHintPure(action, isGamepadMode),
    getTreeZoom: () => zoom,
    setTreeZoom: (v2) => {
      zoom = v2;
    },
    tryAutoZoom: (d) => {
      if (!autoZoom) return false;
      if (autoZoomed.has(d)) return false;
      autoZoomed.add(d);
      return true;
    },
    getLastScroll: () => ({ top: lastScrollTop2, left: lastScrollLeft2 }),
    setLastScroll: (top, left4) => {
      lastScrollTop2 = top;
      lastScrollLeft2 = left4;
    },
    isRulesVisible: () => rulesVis,
    toggleRulesVisible: () => {
      rulesVis = !rulesVis;
    },
    showPar,
    showHud,
    autoZoomMax
  };
};
var defaultCtx = {
  isGazeModeActive,
  setGazeModeActive,
  getActionHint,
  getTreeZoom: () => treeZoom,
  setTreeZoom: (v2) => {
    treeZoom = v2;
  },
  tryAutoZoom: (d) => {
    if (autoZoomedDerivations.has(d)) return false;
    autoZoomedDerivations.add(d);
    return true;
  },
  getLastScroll: () => ({ top: lastScrollTop, left: lastScrollLeft }),
  setLastScroll: (top, left4) => {
    lastScrollTop = top;
    lastScrollLeft = left4;
  },
  isRulesVisible: () => rulesVisible,
  toggleRulesVisible: () => {
    rulesVisible = !rulesVisible;
  },
  showPar: true,
  showHud: true,
  autoZoomMax: AUTO_ZOOM_MAX
};
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
var createPlayArea = (workspace, ctx) => {
  const panel = document.createElement("div");
  const solvedClass = workspace.isSolved() ? " solved" : "";
  panel.setAttribute("class", "playarea" + solvedClass);
  panel.style.setProperty("--tree-zoom", String(ctx.getTreeZoom()));
  const { top: startTop, left: startLeft } = ctx.getLastScroll();
  panel.addEventListener("scroll", () => {
    ctx.setLastScroll(panel.scrollTop, panel.scrollLeft);
  });
  const focus2 = workspace.currentConjecture();
  const solved = workspace.isSolved();
  const gaze = ctx.isGazeModeActive() ? workspace.gaze() : null;
  const ghostChain = ctx.isGazeModeActive() ? computeGhostChain(
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
    if (isFresh && !solved && ctx.tryAutoZoom(focus2.derivation)) {
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
              ctx.autoZoomMax,
              ctx.getTreeZoom() * availW * AUTO_ZOOM_PAD / sequentRect.width
            )
          );
          if (Math.abs(target - ctx.getTreeZoom()) > 0.01) {
            ctx.setTreeZoom(target);
            panel.style.setProperty("--tree-zoom", String(ctx.getTreeZoom()));
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
  cr: "\u2227",
  dl: "\u2228",
  dr: "\u2228",
  il: "\u2192",
  ir: "\u2192"
};
var gazeHintBadgeForKind = (key, hints) => {
  if (!hints || hints.hintChar === void 0) return null;
  if (key === hints.immediateRule) {
    return keyHintBadge(hints.hintChar, "cold");
  }
  if (key === hints.eventualRule && hints.eventualRule !== hints.immediateRule) {
    return keyHintBadge(hints.hintChar, "coldGhost");
  }
  return null;
};
var createRuleCard = (key, rule, disabled, pinned, hideRules, gazeHints, panelClass, getHint) => {
  const isPinned = pinned.includes(key);
  const pre = document.createElement("pre");
  pre.setAttribute(
    "class",
    "rule hint" + (disabled ? " disabled" : "") + (isPinned ? " pinned" : "")
  );
  pre.dataset["rule"] = key;
  pre.dataset["group"] = ruleCategory[key];
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
  const hint = action !== void 0 ? getHint(action) : void 0;
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
var createPanel = (className, ruleRecord, ls, rules3, pinned, hideRules, solved, gazeHints, getHint) => {
  const panel = document.createElement("div");
  panel.setAttribute("class", className);
  entries(ruleRecord).forEach(([key, rule]) => {
    if (!rules3.includes(key)) return;
    const disabled = solved || !ls.includes(key);
    panel.appendChild(
      createRuleCard(
        key,
        rule,
        disabled,
        pinned,
        hideRules,
        gazeHints,
        className,
        getHint
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
  const walk2 = (node) => {
    if (node.kind === "premise") return;
    counts[ruleCategory[node.rule]] += 1;
    node.deps.forEach(walk2);
  };
  walk2(d);
  return counts;
};
var formatHudCounts = (counts) => {
  const order = ["axiom", "structural", "logical", "meta"];
  const total = order.reduce((sum, cat) => sum + counts[cat], 0);
  return `<b>${total}</b>`;
};
var createBench = (workspace, makeCongrats, controlsEl, rerender, onMenu, onApplyReverse1, hideLemma, ctx = defaultCtx, onSkip) => {
  const ls = workspace.applicableRules();
  const rules3 = workspace.availableRules();
  const solved = workspace.isSolved();
  const focus2 = workspace.currentConjecture();
  const activeDeriv = subDerivation(focus2.derivation, activePath(focus2));
  const branchClosed = activeDeriv?.kind === "transformation";
  const inactive = solved || branchClosed;
  const seq = activeSequent(workspace.currentConjecture());
  const available = workspace.availableRules();
  const buildKindHints = (kind, hintChar) => {
    const chain = computeGhostChain(seq, workspace.gaze(), kind, available);
    if (!chain || chain.length === 0) return null;
    return {
      immediateRule: chain[0]?.rule ?? null,
      eventualRule: chain[chain.length - 1]?.rule ?? null,
      hintChar
    };
  };
  const gazeHints = ctx.isGazeModeActive() ? {
    connective: buildKindHints(
      "connective",
      ctx.getActionHint("gazeConnective")
    ),
    weakening: buildKindHints(
      "weakening",
      ctx.getActionHint("gazeWeakening")
    )
  } : { connective: null, weakening: null };
  const hideRules = !ctx.isRulesVisible() || solved;
  const pinned = workspace.pinnedRules();
  const panel = document.createElement("div");
  const hasPinned = !solved && pinned.length > 0;
  const hasPinnedMany = !solved && pinned.length > 2;
  panel.setAttribute(
    "class",
    "bench" + (hideRules ? " rules-hidden" : "") + (hasPinned ? " has-pinned" : "") + (hasPinnedMany ? " has-pinned-many" : "")
  );
  panel.appendChild(
    createPanel(
      "left",
      left,
      ls,
      rules3,
      pinned,
      hideRules,
      inactive,
      gazeHints,
      ctx.getActionHint
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
        rules3,
        pinned,
        hideRules,
        inactive,
        gazeHints,
        ctx.getActionHint
      )
    );
  }
  panel.appendChild(
    createPanel(
      "right",
      right,
      ls,
      rules3,
      pinned,
      hideRules,
      inactive,
      gazeHints,
      ctx.getActionHint
    )
  );
  const rulesBtn = document.createElement("div");
  rulesBtn.setAttribute("class", "button toggle bench-rules-btn");
  rulesBtn.setAttribute("aria-label", t("rules"));
  rulesBtn.textContent = "?";
  rulesBtn.onclick = () => {
    ctx.toggleRulesVisible();
    rerender();
  };
  const rulesLed = document.createElement("span");
  rulesLed.setAttribute("class", "led" + (ctx.isRulesVisible() ? " on" : ""));
  rulesBtn.appendChild(rulesLed);
  const rulesHint = ctx.getActionHint("toggleRules");
  if (rulesHint !== void 0) rulesBtn.appendChild(keyHintBadge(rulesHint));
  const topbar = document.createElement("div");
  topbar.setAttribute("class", "bench-topbar");
  const topbarLeft = document.createElement("div");
  topbarLeft.setAttribute("class", "bench-topbar-left");
  if (onMenu !== void 0) {
    const menuBtn = document.createElement("div");
    menuBtn.setAttribute("class", "button quiz-menu-btn");
    menuBtn.setAttribute("aria-label", t("menu"));
    menuBtn.textContent = "\u22EE";
    menuBtn.onclick = onMenu;
    const menuHint = ctx.getActionHint("menu");
    if (menuHint !== void 0) menuBtn.appendChild(keyHintBadge(menuHint));
    topbarLeft.appendChild(menuBtn);
  }
  topbar.appendChild(topbarLeft);
  const topbarCenter = document.createElement("div");
  topbarCenter.setAttribute("class", "bench-topbar-center");
  const hud = document.createElement("div");
  hud.setAttribute("class", "hud" + (solved ? " solved" : ""));
  if (ctx.showHud && solved) {
    const hudCounts = formatHudCounts(countRuleUsage(focus2.derivation));
    hud.innerHTML = t("moves") + " " + hudCounts;
    if (ctx.showPar) {
      const solution87 = workspace.currentSolution();
      const par = document.createElement("div");
      par.setAttribute("class", "par");
      par.innerHTML = solution87 ? t("par") + " " + formatHudCounts(countRuleUsage(solution87)) : t("par") + " \u{1F480}";
      hud.appendChild(par);
    }
  }
  topbarCenter.appendChild(hud);
  topbar.appendChild(topbarCenter);
  const topbarRight = document.createElement("div");
  topbarRight.setAttribute("class", "bench-topbar-right");
  if (!solved) {
    topbarRight.appendChild(rulesBtn);
  }
  topbar.appendChild(topbarRight);
  panel.appendChild(topbar);
  const rulesSheet = document.createElement("div");
  const sheetMode = ctx.isGazeModeActive() ? "gaze" : "hot";
  rulesSheet.setAttribute("class", "rules-sheet " + sheetMode);
  if (!congrats) {
    const sheetCenter = document.createElement("div");
    sheetCenter.setAttribute("class", "rules-sheet-center");
    entries(center).forEach(([key, rule]) => {
      if (!rules3.includes(key)) return;
      const disabled = solved || !ls.includes(key);
      const card = createRuleCard(
        key,
        rule,
        disabled,
        pinned,
        hideRules,
        gazeHints,
        "main",
        ctx.getActionHint
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
    if (!rules3.includes(key)) return;
    const disabled = inactive || !ls.includes(key);
    const card = createRuleCard(
      key,
      rule,
      disabled,
      pinned,
      hideRules,
      gazeHints,
      "left",
      ctx.getActionHint
    );
    leftCol.appendChild(card);
  });
  const rightCol = document.createElement("div");
  rightCol.setAttribute("class", "rules-sheet-col");
  entries(right).forEach(([key, rule]) => {
    if (!rules3.includes(key)) return;
    const disabled = inactive || !ls.includes(key);
    const card = createRuleCard(
      key,
      rule,
      disabled,
      pinned,
      hideRules,
      gazeHints,
      "right",
      ctx.getActionHint
    );
    rightCol.appendChild(card);
  });
  sheetSides.appendChild(leftCol);
  sheetSides.appendChild(rightCol);
  rulesSheet.appendChild(sheetSides);
  panel.appendChild(rulesSheet);
  panel.appendChild(createPlayArea(workspace, ctx));
  const zoomOut = createButton("\u2212", false, () => {
    ctx.setTreeZoom(Math.max(ZOOM_MIN, ctx.getTreeZoom() - ZOOM_STEP));
    rerender();
  });
  const zoomReset = createButton(":", false, () => {
    ctx.setTreeZoom(1);
    rerender();
  });
  zoomReset.classList.add("zoom-reset");
  const zoomIn = createButton("+", false, () => {
    ctx.setTreeZoom(Math.min(ZOOM_MAX, ctx.getTreeZoom() + ZOOM_STEP));
    rerender();
  });
  const gazeMovable = !inactive && seq.antecedent.length + seq.succedent.length > 1;
  const leftDisabled = ctx.isGazeModeActive() ? !gazeMovable : inactive || seq.antecedent.length === 0;
  const rightDisabled = ctx.isGazeModeActive() ? !gazeMovable : inactive || seq.succedent.length === 0;
  const gazeLeftBtn = createButton(
    t("left"),
    leftDisabled,
    () => {
      if (!ctx.isGazeModeActive()) {
        ctx.setGazeModeActive(true);
        workspace.setGaze({
          side: "left",
          index: seq.antecedent.length - 1
        });
      } else {
        workspace.moveGaze(-1);
      }
      rerender();
    },
    ctx.getActionHint("gazeLeft")
  );
  const gazeRightBtn = createButton(
    t("right"),
    rightDisabled,
    () => {
      if (!ctx.isGazeModeActive()) {
        ctx.setGazeModeActive(true);
        workspace.setGaze({ side: "right", index: 0 });
      } else {
        workspace.moveGaze(1);
      }
      rerender();
    },
    ctx.getActionHint("gazeRight")
  );
  const gazeWeakeningBtn = createButton(
    t("drop"),
    !ctx.isGazeModeActive() || inactive,
    () => {
      workspace.setGazeKind("weakening");
      applyGazeRule(workspace, "weakening");
      rerender();
    },
    ctx.getActionHint("gazeWeakening")
  );
  const connectiveRule = gazeHints.connective?.eventualRule ?? null;
  const connectiveLabel = connectiveRule !== null ? ruleConnectiveLabel[connectiveRule] ?? "" : "";
  const connectiveDisabled = !ctx.isGazeModeActive() || inactive || connectiveLabel === "";
  const gazeConnectiveBtn = createButton(
    t("destruct"),
    connectiveDisabled,
    () => {
      workspace.setGazeKind("connective");
      applyGazeRule(workspace, "connective");
      rerender();
    },
    ctx.getActionHint("gazeConnective")
  );
  const makeGroup = (...cls) => {
    const g = document.createElement("div");
    g.setAttribute("class", ["controls-group", ...cls].join(" "));
    return g;
  };
  const axiomBtn = createButton(
    t("axiom"),
    inactive || !keys(reverseAxiom0).some((k) => ls.includes(k) && isReverseId0(k)),
    () => {
      autoRule(workspace, keys(reverseAxiom0));
      rerender();
    },
    ctx.getActionHint("axiom")
  );
  const lemmaDisabled = inactive || onApplyReverse1 === void 0 || !ls.includes("cut");
  const lemmaBtn = createButton(
    t("lemma"),
    lemmaDisabled,
    () => {
      if (onApplyReverse1 === void 0) return;
      onApplyReverse1("cut", (formula) => {
        workspace.applyEvent(reverse12("cut", formula));
        rerender();
      });
    },
    ctx.getActionHint("lemma")
  );
  const miscGroup = makeGroup("controls-misc");
  if (onSkip !== void 0) {
    const skipBtn = createButton(t("skip"), false, onSkip);
    skipBtn.classList.add("mutating");
    miscGroup.appendChild(skipBtn);
  }
  const gazeGroup = makeGroup(ctx.isGazeModeActive() ? "gaze" : "hot");
  gazeGroup.appendChild(gazeLeftBtn);
  gazeGroup.appendChild(gazeWeakeningBtn);
  gazeGroup.appendChild(gazeConnectiveBtn);
  gazeGroup.appendChild(gazeRightBtn);
  zoomOut.classList.add("zoom-step");
  zoomIn.classList.add("zoom-step");
  const zoomGroup = document.createElement("div");
  zoomGroup.setAttribute("class", "bench-zoom");
  zoomGroup.appendChild(zoomOut);
  zoomGroup.appendChild(zoomReset);
  zoomGroup.appendChild(zoomIn);
  if (!solved) topbarCenter.appendChild(zoomGroup);
  controlsEl.setAttribute("class", "controls-undo-inner");
  const branchCount = branches(workspace.currentConjecture().derivation).length;
  const canSwitch = !solved && branchCount > 1;
  const prevBranchBtn = createButton(
    t("prevBranch"),
    !canSwitch,
    () => {
      workspace.applyEvent(prevBranch());
      rerender();
    },
    ctx.getActionHint("prevBranch")
  );
  const nextBranchBtn = createButton(
    t("nextBranch"),
    !canSwitch,
    () => {
      workspace.applyEvent(nextBranch());
      rerender();
    },
    ctx.getActionHint("nextBranch")
  );
  gazeLeftBtn.classList.add("inert");
  gazeRightBtn.classList.add("inert");
  lemmaBtn.classList.add("inert");
  prevBranchBtn.classList.add("inert");
  nextBranchBtn.classList.add("inert");
  gazeWeakeningBtn.classList.add("mutating");
  gazeConnectiveBtn.classList.add("mutating");
  axiomBtn.classList.add("mutating");
  const navGroup = makeGroup("controls-nav");
  navGroup.appendChild(prevBranchBtn);
  if (hideLemma !== true) navGroup.appendChild(lemmaBtn);
  navGroup.appendChild(controlsEl);
  navGroup.appendChild(axiomBtn);
  navGroup.appendChild(nextBranchBtn);
  const controlsBar = document.createElement("div");
  controlsBar.setAttribute("class", "controls");
  if (congrats) {
    congrats.buttons.setAttribute("class", "congrabuttons controls-group");
    controlsBar.appendChild(congrats.buttons);
  } else {
    if (hideLemma !== true) controlsBar.appendChild(miscGroup);
    controlsBar.appendChild(navGroup);
    controlsBar.appendChild(gazeGroup);
  }
  panel.appendChild(controlsBar);
  if (!solved && pinned.length > 0) {
    const pinnedStrip = document.createElement("div");
    pinnedStrip.setAttribute("class", "pinned-strip");
    const allRules = {
      ...left,
      ...center,
      ...right
    };
    for (const key of pinned) {
      const rule = allRules[key];
      if (rule === void 0 || !rules3.includes(key)) continue;
      const disabled = inactive || !ls.includes(key);
      const panelClass = key in left ? "left" : key in right ? "right" : "main";
      const card = createRuleCard(
        key,
        rule,
        disabled,
        pinned,
        false,
        gazeHints,
        panelClass,
        ctx.getActionHint
      );
      pinnedStrip.appendChild(card);
    }
    panel.appendChild(pinnedStrip);
  }
  return panel;
};
var autoRule = (workspace, rules3) => {
  const available = workspace.applicableRules();
  const [first] = rules3.filter(
    (rule) => available.includes(rule) && isReverseId0(rule)
  );
  if (!first) return;
  workspace.applyEvent(reverse02(first));
};
var createPausePopup = (onResume, onExit, onReset, resetDisabled, onSettings, onCustom) => {
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
  if (onCustom) {
    buttons.appendChild(
      createButton(t("customChallenge"), false, onCustom, kbdHint("b"))
    );
  }
  if (onSettings) {
    buttons.appendChild(
      createButton(t("customChallenge"), false, onSettings, kbdHint("b"))
    );
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
  "leftRotateRight",
  "rightWeakening",
  "rightConnective",
  "rightRotateLeft"
]);
var createDispatch = (getWorkspace, rerender, navigate2, onSolved, onLevel, onMenu, onApplyReverse1, ctx = defaultCtx, onJustSolved) => (action) => {
  if (action === "gazeLeft" || action === "gazeRight") {
    if (!ctx.isGazeModeActive()) {
      const workspace2 = getWorkspace();
      const seq = activeSequent(workspace2.currentConjecture());
      if (action === "gazeLeft") {
        if (seq.antecedent.length === 0) return;
        ctx.setGazeModeActive(true);
        workspace2.setGaze({
          side: "left",
          index: seq.antecedent.length - 1
        });
      } else {
        if (seq.succedent.length === 0) return;
        ctx.setGazeModeActive(true);
        workspace2.setGaze({ side: "right", index: 0 });
      }
      rerender();
      return;
    }
  } else if (action === "gazeConnective" || action === "gazeWeakening") {
    if (!ctx.isGazeModeActive()) return;
  } else if (ctx.isGazeModeActive() && (RULE_APPLY_ACTIONS.has(action) || action === "reset")) {
    ctx.setGazeModeActive(false);
  } else if (action === "undo" && ctx.isGazeModeActive()) {
    if (activePath(getWorkspace().currentConjecture()).length === 0) {
      ctx.setGazeModeActive(false);
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
    ctx.toggleRulesVisible();
    rerender();
    return;
  }
  const workspace = getWorkspace();
  if (action === "reset") {
    workspace.applyEvent(reset2());
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
    case "rightConnective":
      autoRule(workspace, keys(rightLogical));
      break;
    case "prevBranch":
      workspace.applyEvent(prevBranch());
      break;
    case "nextBranch":
      workspace.applyEvent(nextBranch());
      break;
    case "lemma":
      if (onApplyReverse1 !== void 0 && workspace.availableRules().includes("cut")) {
        onApplyReverse1("cut", (formula) => {
          workspace.applyEvent(reverse12("cut", formula));
          rerender();
        });
      }
      return;
    case "axiom":
      autoRule(workspace, keys(reverseAxiom0));
      break;
    case "undo":
      workspace.applyEvent(undo2());
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
  if (workspace.isSolved()) {
    onJustSolved?.();
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
var setupGamepad = (dispatch, gamepadIndex = 0) => {
  const oldPresses = [];
  let active2 = false;
  let chordFired = false;
  const loop = () => {
    if (!active2) return;
    const gp = navigator.getGamepads()[gamepadIndex];
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
    if (navigator.getGamepads()[gamepadIndex] !== null) return;
    active2 = false;
    onGamepadDisconnected();
  };
  window.addEventListener("gamepadconnected", onConnected);
  window.addEventListener("gamepaddisconnected", onDisconnected);
  const preExisting = navigator.getGamepads()[gamepadIndex] !== null;
  if (preExisting) onConnected();
  return () => {
    active2 = false;
    window.removeEventListener("gamepadconnected", onConnected);
    window.removeEventListener("gamepaddisconnected", onDisconnected);
  };
};

// src/web/formula-editor.ts
var makeBtn = (label, handler) => {
  const btn = document.createElement("pre");
  btn.setAttribute("class", "button");
  btn.textContent = label;
  btn.onclick = handler;
  return btn;
};
var setDisabled = (btn, disabled, handler) => {
  btn.setAttribute("class", disabled ? "button disabled" : "button");
  btn.onclick = disabled ? null : handler;
};
var makeHintBadge = (text) => {
  const badge = document.createElement("span");
  badge.setAttribute("class", text.length > 1 ? "key-hint wide" : "key-hint");
  badge.textContent = text;
  return badge;
};
var clamp = (v2, lo, hi) => Math.max(lo, Math.min(hi, v2));
var createFormulaEditor = (title, confirmLabel, onConfirm, onCancel, undoHint, activateHint) => {
  let stack = [];
  let history2 = [];
  let cursorRow = 0;
  let cursorCol = 0;
  let cursorVisible = false;
  const saveAndSet = (next2) => {
    history2 = [...history2, stack];
    stack = next2;
    renderState();
  };
  const pushProp = (p) => {
    saveAndSet([...stack, p]);
  };
  const applyNeg = () => {
    const top = stack[stack.length - 1];
    if (top === void 0) return;
    saveAndSet([...stack.slice(0, -1), negation(top)]);
  };
  const applyBin = (op) => {
    const right3 = stack[stack.length - 1];
    const left4 = stack[stack.length - 2];
    if (right3 === void 0 || left4 === void 0) return;
    const result = op === "conjunction" ? conjunction(left4, right3) : op === "disjunction" ? disjunction(left4, right3) : implication(left4, right3);
    saveAndSet([...stack.slice(0, -2), result]);
  };
  const doUndo = () => {
    const prev2 = history2[history2.length - 1];
    if (prev2 === void 0) return;
    stack = prev2;
    history2 = history2.slice(0, -1);
    renderState();
  };
  const confirmCurrent = () => {
    const formula = stack.length === 1 ? stack[0] : void 0;
    if (formula !== void 0) onConfirm(formula);
  };
  const shroud = document.createElement("div");
  shroud.setAttribute("class", "shroud pause-shroud");
  shroud.onclick = (ev) => {
    if (ev.target === shroud) {
      ev.preventDefault();
      onCancel();
    }
  };
  const popup = document.createElement("div");
  popup.setAttribute("class", "formula-editor-popup");
  popup.onclick = (ev) => {
    ev.stopPropagation();
  };
  const titleEl = document.createElement("div");
  titleEl.setAttribute("class", "formula-editor-title");
  titleEl.textContent = title;
  popup.appendChild(titleEl);
  const stackDisplay = document.createElement("div");
  stackDisplay.setAttribute("class", "formula-editor-stack");
  popup.appendChild(stackDisplay);
  const atomRow = document.createElement("div");
  atomRow.setAttribute("class", "config-toggles");
  const atomNames = ["p", "q", "r", "s", "u", "v"];
  const atomCells = [];
  for (const name2 of atomNames) {
    const a87 = atom(name2);
    const btn = document.createElement("pre");
    btn.setAttribute("class", "button");
    btn.innerHTML = html(fromAtom(a87)(basic));
    const activate = () => {
      pushProp(a87);
    };
    btn.onclick = activate;
    atomRow.appendChild(btn);
    atomCells.push({ btn, activate, isEnabled: () => true });
  }
  popup.appendChild(atomRow);
  const connRow = document.createElement("div");
  connRow.setAttribute("class", "config-toggles");
  const implBtn = makeBtn("\u2192", () => {
    applyBin("implication");
  });
  const conjBtn = makeBtn("\u2227", () => {
    applyBin("conjunction");
  });
  const disjBtn = makeBtn("\u2228", () => {
    applyBin("disjunction");
  });
  const negBtn = makeBtn("\xAC", () => {
    applyNeg();
  });
  const falsumBtn = makeBtn("\u22A5", () => {
    pushProp(falsum);
  });
  const verumBtn = makeBtn("\u22A4", () => {
    pushProp(verum);
  });
  connRow.appendChild(implBtn);
  connRow.appendChild(conjBtn);
  connRow.appendChild(disjBtn);
  connRow.appendChild(negBtn);
  connRow.appendChild(falsumBtn);
  connRow.appendChild(verumBtn);
  popup.appendChild(connRow);
  const connCells = [
    {
      btn: implBtn,
      activate: () => applyBin("implication"),
      isEnabled: () => stack.length >= 2
    },
    {
      btn: conjBtn,
      activate: () => applyBin("conjunction"),
      isEnabled: () => stack.length >= 2
    },
    {
      btn: disjBtn,
      activate: () => applyBin("disjunction"),
      isEnabled: () => stack.length >= 2
    },
    { btn: negBtn, activate: applyNeg, isEnabled: () => stack.length >= 1 },
    { btn: falsumBtn, activate: () => pushProp(falsum), isEnabled: () => true },
    { btn: verumBtn, activate: () => pushProp(verum), isEnabled: () => true }
  ];
  const controls = document.createElement("div");
  controls.setAttribute("class", "formula-editor-controls");
  const cancelBtn = document.createElement("pre");
  cancelBtn.setAttribute("class", "button");
  cancelBtn.textContent = t("back");
  cancelBtn.onclick = onCancel;
  controls.appendChild(cancelBtn);
  const undoBtn = document.createElement("pre");
  undoBtn.setAttribute("class", "button");
  undoBtn.textContent = t("undo");
  controls.appendChild(undoBtn);
  const confirmBtn = document.createElement("pre");
  confirmBtn.setAttribute("class", "button");
  confirmBtn.textContent = confirmLabel;
  controls.appendChild(confirmBtn);
  popup.appendChild(controls);
  shroud.appendChild(popup);
  const controlCells = [
    { btn: cancelBtn, activate: onCancel, isEnabled: () => true },
    { btn: undoBtn, activate: doUndo, isEnabled: () => history2.length > 0 },
    {
      btn: confirmBtn,
      activate: confirmCurrent,
      isEnabled: () => stack.length === 1
    }
  ];
  const rows = [
    atomCells,
    connCells,
    controlCells
  ];
  const hintBadge = undoHint !== void 0 ? makeHintBadge(undoHint) : null;
  const cursorBadge = activateHint !== void 0 ? makeHintBadge(activateHint) : null;
  if (cursorBadge !== null) cursorBadge.classList.add("cursor-hint");
  const renderState = () => {
    stackDisplay.innerHTML = stack.length === 0 ? "" : stack.map((p) => html(fromProp(p)(basic))).join(" ");
    setDisabled(negBtn, stack.length === 0, () => {
      applyNeg();
    });
    setDisabled(implBtn, stack.length < 2, () => {
      applyBin("implication");
    });
    setDisabled(conjBtn, stack.length < 2, () => {
      applyBin("conjunction");
    });
    setDisabled(disjBtn, stack.length < 2, () => {
      applyBin("disjunction");
    });
    setDisabled(undoBtn, history2.length === 0, () => {
      doUndo();
    });
    if (hintBadge !== null) {
      hintBadge.remove();
      if (history2.length > 0) {
        undoBtn.appendChild(hintBadge);
      } else {
        cancelBtn.appendChild(hintBadge);
      }
    }
    const formula = stack.length === 1 ? stack[0] : void 0;
    confirmBtn.setAttribute(
      "class",
      formula !== void 0 ? "button" : "button disabled"
    );
    confirmBtn.onclick = formula !== void 0 ? confirmCurrent : null;
    for (const row of rows) {
      for (const cell of row) cell.btn.classList.remove("cursor");
    }
    const focused = cursorVisible ? rows[cursorRow]?.[cursorCol] : void 0;
    if (focused !== void 0) focused.btn.classList.add("cursor");
    if (cursorBadge !== null) {
      cursorBadge.remove();
      if (focused !== void 0 && focused.isEnabled()) {
        focused.btn.appendChild(cursorBadge);
      }
    }
  };
  const moveCursor = (dRow, dCol) => {
    if (!cursorVisible) {
      cursorVisible = true;
      cursorRow = 0;
      cursorCol = 0;
      renderState();
      return;
    }
    cursorRow = clamp(cursorRow + dRow, 0, rows.length - 1);
    const row = rows[cursorRow];
    if (row !== void 0)
      cursorCol = clamp(cursorCol + dCol, 0, row.length - 1);
    renderState();
  };
  const activateFocused = () => {
    if (!cursorVisible) {
      cursorVisible = true;
      cursorRow = 0;
      cursorCol = 0;
      renderState();
      return;
    }
    const cell = rows[cursorRow]?.[cursorCol];
    if (cell !== void 0 && cell.isEnabled()) cell.activate();
  };
  const onAction = (action) => {
    switch (action) {
      case "gazeLeft":
      case "leftRotateLeft":
        moveCursor(0, -1);
        break;
      case "gazeRight":
      case "leftRotateRight":
        moveCursor(0, 1);
        break;
      case "gazeConnective":
      case "leftConnective":
        moveCursor(-1, 0);
        break;
      case "gazeWeakening":
      case "leftWeakening":
        moveCursor(1, 0);
        break;
      case "axiom":
        activateFocused();
        break;
    }
  };
  renderState();
  return {
    el: shroud,
    tryUndo: () => {
      if (history2.length === 0) return false;
      doUndo();
      return true;
    },
    onAction
  };
};

// src/web/campaign.ts
var rulesUsedIn = (d) => {
  if (d.kind === "premise") return /* @__PURE__ */ new Set();
  const result = /* @__PURE__ */ new Set([d.rule]);
  for (const dep of d.deps) {
    for (const rule of rulesUsedIn(dep)) result.add(rule);
  }
  return result;
};
var challengeRules = (c) => {
  if (!isChallenge(c)) return [];
  const used = rulesUsedIn(c.solution);
  return c.rules.filter((r) => used.has(r));
};
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
    const rules3 = document.createElement("div");
    rules3.setAttribute("class", "rules");
    rules3.innerHTML = challengeRules(challenge2).map(
      (rule) => html(fromRuleId(rule, t("sideLeft"), t("sideRight"))(basic))
    ).join(", ");
    item.appendChild(rules3);
    const goal87 = document.createElement("div");
    goal87.setAttribute("class", "goal");
    goal87.innerHTML = html(fromSequent(challenge2.goal)(basic));
    item.appendChild(goal87);
    levels.appendChild(item);
  });
  panel.appendChild(levels);
  shroud.appendChild(panel);
  return shroud;
};
var createControls = (ws, _listingEl, rerender, showLevelButton, onLevel) => {
  const canUndo = activePath(ws.currentConjecture()).length > 0;
  const undoEnabled = canUndo || isGazeModeActive();
  const panel = document.createElement("div");
  panel.setAttribute("class", "controls");
  if (showLevelButton) {
    panel.appendChild(
      createButton(t("level"), false, onLevel, getActionHint("level"))
    );
  }
  const undoBtn = createButton(
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
  );
  undoBtn.classList.add("mutating");
  panel.appendChild(undoBtn);
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
        ws.applyEvent(reset2());
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
      ws.applyEvent(reset2());
    }
    setGazeModeActive(false);
    pausePopupOpen = false;
    rerender();
  };
  let formulaEditorOpen = false;
  let closeFormulaEditor = null;
  let tryUndoInEditor = null;
  let editorOnAction = null;
  const onApplyReverse1 = (_key, onFormula) => {
    if (formulaEditorOpen) return;
    formulaEditorOpen = true;
    const cancel = () => {
      formulaEditorOpen = false;
      closeFormulaEditor = null;
      tryUndoInEditor = null;
      editorOnAction = null;
      container.removeChild(modal);
    };
    const {
      el: modal,
      tryUndo,
      onAction
    } = createFormulaEditor(
      t("lemmaTitle"),
      t("lemmaConfirm"),
      (formula) => {
        formulaEditorOpen = false;
        closeFormulaEditor = null;
        tryUndoInEditor = null;
        editorOnAction = null;
        container.removeChild(modal);
        onFormula(formula);
      },
      cancel,
      "\u232B",
      getActionHint("axiom")
    );
    closeFormulaEditor = cancel;
    tryUndoInEditor = tryUndo;
    editorOnAction = onAction;
    container.appendChild(modal);
  };
  const rerender = () => {
    container.innerHTML = "";
    listingEl = createListing(ws, selectLevel);
    container.appendChild(listingEl);
    const controlsEl = createControls(
      ws,
      listingEl,
      rerender,
      levelPresses >= 2,
      () => toggleLevel(listingEl)
    );
    const makeCongrats = () => createCongrats(ws, selectLevel, rerender);
    container.appendChild(
      createBench(
        ws,
        makeCongrats,
        controlsEl,
        rerender,
        togglePausePopup,
        onApplyReverse1,
        true
      )
    );
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
        ws.applyEvent(reset2());
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
    togglePausePopup,
    onApplyReverse1
  );
  const dispatch = (action) => {
    if (formulaEditorOpen) {
      if (action === "undo") {
        if (!(tryUndoInEditor?.() ?? false)) closeFormulaEditor?.();
      } else if (action === "menu" || action === "exit") {
        closeFormulaEditor?.();
      } else {
        editorOnAction?.(action);
      }
      return;
    }
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
  document.documentElement.classList.add("mode-single");
  document.addEventListener("keydown", handleKey);
  document.addEventListener("pointerdown", markPointerInput);
  const cleanupGamepad = setupGamepad(dispatch);
  const unsubscribeGamepad = subscribeGamepad(rerender);
  const cleanup = () => {
    document.documentElement.classList.remove("mode-single");
    document.removeEventListener("keydown", handleKey);
    document.removeEventListener("pointerdown", markPointerInput);
    cleanupGamepad();
    unsubscribeGamepad();
  };
  return { cleanup, rerender };
};

// src/web/random.ts
var createControls2 = (getWorkspace, rerender) => {
  const ws = getWorkspace();
  const canUndo = activePath(ws.currentConjecture()).length > 0;
  const undoEnabled = canUndo || isGazeModeActive();
  const panel = document.createElement("div");
  panel.setAttribute("class", "controls");
  const undoBtn = createButton(
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
  );
  undoBtn.classList.add("mutating");
  panel.appendChild(undoBtn);
  return panel;
};
var createCongrats2 = (onNew, onSettings) => {
  const hurray = document.createElement("div");
  hurray.setAttribute("class", "hurray");
  hurray.innerHTML = t("congratulations");
  const buttons = document.createElement("div");
  buttons.setAttribute("class", "congrabuttons");
  buttons.appendChild(
    createButton(t("customChallenge"), false, onSettings, kbdHint("b"))
  );
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
      ws.applyEvent(reset2());
    }
    setGazeModeActive(false);
    pausePopupOpen = false;
    rerender();
  };
  const freshFromPopup = () => {
    pausePopupOpen = false;
    onNew();
  };
  let formulaEditorOpen = false;
  let closeFormulaEditor = null;
  let tryUndoInEditor = null;
  let editorOnAction = null;
  const onApplyReverse1 = (_key, onFormula) => {
    if (formulaEditorOpen) return;
    formulaEditorOpen = true;
    const cancel = () => {
      formulaEditorOpen = false;
      closeFormulaEditor = null;
      tryUndoInEditor = null;
      editorOnAction = null;
      container.removeChild(modal);
    };
    const {
      el: modal,
      tryUndo,
      onAction
    } = createFormulaEditor(
      t("lemmaTitle"),
      t("lemmaConfirm"),
      (formula) => {
        formulaEditorOpen = false;
        closeFormulaEditor = null;
        tryUndoInEditor = null;
        editorOnAction = null;
        container.removeChild(modal);
        onFormula(formula);
      },
      cancel,
      "\u232B",
      getActionHint("axiom")
    );
    closeFormulaEditor = cancel;
    tryUndoInEditor = tryUndo;
    editorOnAction = onAction;
    container.appendChild(modal);
  };
  const rerender = () => {
    const ws = getWorkspace();
    container.innerHTML = "";
    const controlsEl = createControls2(getWorkspace, rerender);
    const makeCongrats = () => createCongrats2(onNew, openSettings);
    container.appendChild(
      createBench(
        ws,
        makeCongrats,
        controlsEl,
        rerender,
        togglePausePopup,
        onApplyReverse1,
        void 0,
        void 0,
        freshFromPopup
      )
    );
    if (pausePopupOpen) {
      const canReset = activePath(ws.currentConjecture()).length > 0;
      const resetEnabled = canReset || isGazeModeActive();
      container.appendChild(
        createPausePopup(
          closePausePopup,
          exitToMenu,
          resetFromPopup,
          !resetEnabled,
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
        ws.applyEvent(reset2());
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
    togglePausePopup,
    onApplyReverse1
  );
  const dispatch = (action) => {
    if (formulaEditorOpen) {
      if (action === "undo") {
        if (!(tryUndoInEditor?.() ?? false)) closeFormulaEditor?.();
      } else if (action === "menu" || action === "exit") {
        closeFormulaEditor?.();
      } else {
        editorOnAction?.(action);
      }
      return;
    }
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
    if (ev.code === "KeyB") {
      openSettings();
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
  document.documentElement.classList.add("mode-single");
  document.addEventListener("keydown", handleKey);
  document.addEventListener("pointerdown", markPointerInput);
  const cleanupGamepad = setupGamepad(dispatch);
  const unsubscribeGamepad = subscribeGamepad(rerender);
  const cleanup = () => {
    document.documentElement.classList.remove("mode-single");
    document.removeEventListener("keydown", handleKey);
    document.removeEventListener("pointerdown", markPointerInput);
    cleanupGamepad();
    unsubscribeGamepad();
  };
  return { cleanup, rerender };
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

// src/help/index.ts
var helpSystems = {
  rk: {
    id: "rk",
    name: meta.name,
    meta,
    exampleProof
  }
};
var isHelpSystemId = (s) => s in helpSystems;
var renderSystemHelp = (id) => {
  const sys = helpSystems[id];
  return fromMeta(sys.meta) + "\n\nSandbox\n\n" + fromDerivation(sys.exampleProof) + "\n";
};

// src/web/system.ts
var mountSystem = (container, navigate2) => {
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
      const menuBtn = document.createElement("div");
      menuBtn.setAttribute("class", "button system-item");
      menuBtn.innerHTML = t("exitToMainMenu");
      menuBtn.onclick = () => navigate2("menu");
      list.appendChild(menuBtn);
      panel.appendChild(list);
    }
    container.appendChild(panel);
  };
  render();
  return { cleanup: () => {
  }, rerender: render };
};

// src/web/secret.ts
var mountSecret = (container, navigate2) => {
  const render = () => {
    container.innerHTML = "";
    const panel = document.createElement("div");
    panel.setAttribute("class", "menu");
    panel.appendChild(createLangSwitcher());
    const title = document.createElement("div");
    title.setAttribute("class", "menu-title");
    title.innerHTML = t("secret");
    panel.appendChild(title);
    const modes = document.createElement("div");
    modes.setAttribute("class", "menu-modes");
    const systemsBtn = document.createElement("div");
    systemsBtn.setAttribute("class", "button menu-mode");
    systemsBtn.innerHTML = t("systems");
    systemsBtn.onclick = () => navigate2("system");
    modes.appendChild(systemsBtn);
    panel.appendChild(modes);
    const backBtn = document.createElement("div");
    backBtn.setAttribute("class", "button menu-mode");
    backBtn.innerHTML = t("back");
    backBtn.onclick = () => navigate2("menu");
    panel.appendChild(backBtn);
    container.appendChild(panel);
  };
  render();
  return { cleanup: () => {
  }, rerender: render };
};

// src/npc/proof-walker.ts
var extractAuxFormula = (rule, deps) => {
  const dep0 = deps[0];
  const dep1 = deps[1];
  if (dep0 === void 0 || dep1 === void 0) return null;
  if (rule === "cut") {
    const succ2 = dep0.result.succedent;
    return isNonEmptyArray(succ2) ? last(succ2) : null;
  }
  const succ = dep1.result.succedent;
  return isNonEmptyArray(succ) ? succ[0] : null;
};
var walk = (node, out, shuffle) => {
  const rule = node.rule;
  if (isReverseId1(rule)) {
    const aux = extractAuxFormula(rule, node.deps);
    if (aux !== null) out.push(reverse12(rule, aux));
  } else if (isReverseId0(rule)) {
    out.push(reverse02(rule));
  }
  if (shuffle && node.deps.length === 2 && Math.random() < 0.5) {
    const dep0 = node.deps[0];
    const dep1 = node.deps[1];
    if (dep0 !== void 0 && dep1 !== void 0) {
      out.push(nextBranch());
      walk(dep1, out, shuffle);
      walk(dep0, out, shuffle);
      return;
    }
  }
  for (const dep of node.deps) {
    walk(dep, out, shuffle);
  }
};
var linearize = (proof, opts = {}) => {
  const events = [];
  const shuffle = opts.shuffle ?? true;
  walk(proof, events, shuffle);
  return events;
};

// src/npc/solver-runner.ts
var createSolver = () => {
  let worker = null;
  let nextRequestId = 0;
  let current2 = null;
  const ensureWorker = () => {
    if (worker !== null) return worker;
    const w = new Worker("lk.npc.w.js");
    w.onmessage = (e) => {
      if (current2 === null || e.data.requestId !== current2.requestId) return;
      if (e.data.type === "proof") {
        const onProof = current2.onProof;
        current2 = null;
        onProof(e.data.proof);
      } else if (e.data.type === "exhausted") {
        const onExhausted = current2.onExhausted;
        current2 = null;
        onExhausted();
      }
    };
    w.onerror = (e) => {
      console.error("NPC worker error:", e.message);
    };
    worker = w;
    return w;
  };
  const post = (msg) => {
    ensureWorker().postMessage(msg);
  };
  return {
    solveChunked: (config, onProof, opts) => {
      const requestId = nextRequestId;
      nextRequestId += 1;
      current2 = { requestId, onProof, onExhausted: opts.onExhausted };
      post({
        type: "solve",
        requestId,
        goal: config.goal,
        rules: config.rules,
        maxDepth: opts.maxDepth
      });
      return {
        cancel: () => {
          if (current2 !== null && current2.requestId === requestId) {
            current2 = null;
          }
          if (worker !== null) {
            worker.postMessage({
              type: "cancel",
              requestId
            });
          }
        }
      };
    },
    cleanup: () => {
      current2 = null;
      if (worker !== null) {
        worker.terminate();
        worker = null;
      }
    }
  };
};

// src/npc/driver.ts
var PLANNING_POLL_MS = 300;
var PAUSE_POLL_MS = 200;
var createNpcDriver = (opts) => {
  let state = { kind: "idle" };
  let pendingTimeout = null;
  let cleanedUp = false;
  let pausedAt = null;
  const solver = createSolver();
  const nextThinkDelay = () => {
    const base = opts.knobs.baseThinkMs;
    const jit = opts.knobs.jitterMs;
    if (jit <= 0) return Math.max(50, base);
    const offset = (Math.random() * 2 - 1) * jit;
    return Math.max(50, base + offset);
  };
  const schedule = (delayMs) => {
    if (cleanedUp) return;
    if (pendingTimeout !== null) clearTimeout(pendingTimeout);
    pendingTimeout = setTimeout(tick, delayMs);
  };
  const cancelSolverIfPlanning = () => {
    if (state.kind === "planning") state.handle.cancel();
  };
  const startObserving = () => {
    state = { kind: "observing" };
    schedule(50);
  };
  const startPlanning = (idx) => {
    const ws = opts.getWorkspace();
    const goal87 = ws.currentConjecture().derivation.result;
    const rules3 = ws.availableRules().filter((r) => !isReverseId1(r));
    if (!isTautology2(goal87)) {
      startObserving();
      opts.skip();
      return;
    }
    const searchRef = { proof: null, exhausted: false };
    const handle = solver.solveChunked(
      { goal: goal87, rules: rules3 },
      (p) => {
        searchRef.proof = p;
      },
      {
        maxDepth: opts.knobs.searchDepth,
        onExhausted: () => {
          searchRef.exhausted = true;
        }
      }
    );
    state = {
      kind: "planning",
      observedIdx: idx,
      startedAt: Date.now(),
      handle,
      searchRef
    };
    schedule(PLANNING_POLL_MS);
  };
  const startExecuting = (idx, plan, challengeStartedAt) => {
    state = {
      kind: "executing",
      observedIdx: idx,
      plan,
      cursor: 0,
      challengeStartedAt,
      stuckAccumMs: 0
    };
    schedule(nextThinkDelay());
  };
  const tick = () => {
    pendingTimeout = null;
    if (cleanedUp || opts.isGameOver()) return;
    if (opts.isPaused?.() ?? false) {
      if (pausedAt === null) pausedAt = Date.now();
      schedule(PAUSE_POLL_MS);
      return;
    }
    if (pausedAt !== null) {
      const delta = Date.now() - pausedAt;
      pausedAt = null;
      if (state.kind === "planning") {
        state = { ...state, startedAt: state.startedAt + delta };
      } else if (state.kind === "givingUp") {
        state = { ...state, since: state.since + delta };
      } else if (state.kind === "executing") {
        state = {
          ...state,
          challengeStartedAt: state.challengeStartedAt + delta
        };
      }
    }
    const idx = opts.getChallengeIdx();
    if ((state.kind === "planning" || state.kind === "givingUp" || state.kind === "executing") && state.observedIdx !== idx) {
      cancelSolverIfPlanning();
      startObserving();
      return;
    }
    const linearizeOpts = {
      shuffle: true
    };
    if (state.kind === "idle" || state.kind === "observing") {
      startPlanning(idx);
      return;
    }
    if (state.kind === "planning") {
      const proof = state.searchRef.proof;
      if (proof !== null) {
        state.handle.cancel();
        startExecuting(idx, linearize(proof, linearizeOpts), state.startedAt);
        return;
      }
      if (state.searchRef.exhausted) {
        state.handle.cancel();
        state = { kind: "givingUp", observedIdx: idx, since: Date.now() };
        schedule(PLANNING_POLL_MS);
        return;
      }
      if (Date.now() - state.startedAt > opts.knobs.skipAfterMs) {
        state.handle.cancel();
        startObserving();
        opts.skip();
        return;
      }
      schedule(PLANNING_POLL_MS);
      return;
    }
    if (state.kind === "givingUp") {
      if (Date.now() - state.since > opts.knobs.skipStuckMs) {
        startObserving();
        opts.skip();
        return;
      }
      schedule(PLANNING_POLL_MS);
      return;
    }
    if (Date.now() - state.challengeStartedAt > opts.knobs.skipAfterMs) {
      startObserving();
      opts.skip();
      return;
    }
    if (state.cursor >= state.plan.length) {
      startObserving();
      opts.skip();
      return;
    }
    const ev = state.plan[state.cursor];
    if (ev === void 0) {
      startObserving();
      opts.skip();
      return;
    }
    const before = opts.getTotalMoves();
    opts.applyEvent(ev);
    const after = opts.getTotalMoves();
    if (opts.getChallengeIdx() !== state.observedIdx) {
      startObserving();
      return;
    }
    const advanced = after !== before;
    const nextStuck = advanced ? 0 : state.stuckAccumMs + opts.knobs.baseThinkMs;
    if (nextStuck > opts.knobs.skipStuckMs) {
      startObserving();
      opts.skip();
      return;
    }
    state = {
      ...state,
      cursor: state.cursor + 1,
      stuckAccumMs: nextStuck
    };
    schedule(nextThinkDelay());
  };
  schedule(opts.knobs.baseThinkMs);
  return {
    cleanup: () => {
      cleanedUp = true;
      if (pendingTimeout !== null) {
        clearTimeout(pendingTimeout);
        pendingTimeout = null;
      }
      cancelSolverIfPlanning();
      solver.cleanup();
    }
  };
};

// src/web/versus.ts
var formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};
var totalMoves = (ws) => {
  const counts = countRuleUsage(ws.currentConjecture().derivation);
  return Object.values(counts).reduce((a87, b) => a87 + b, 0);
};
var makeVersusFormulaEditor = (side, onFormula, onCancel, undoHint, activateHint) => {
  let modalEl = null;
  const close = () => {
    modalEl?.remove();
    modalEl = null;
    onCancel();
  };
  const { el, tryUndo, onAction } = createFormulaEditor(
    t("lemmaTitle"),
    t("lemmaConfirm"),
    (formula) => {
      modalEl?.remove();
      modalEl = null;
      onFormula(formula);
    },
    close,
    undoHint,
    activateHint
  );
  modalEl = el;
  if (side === "left") {
    el.style.right = "calc(50% + 2.5em)";
  } else {
    el.style.left = "calc(50% + 2.5em)";
  }
  document.body.appendChild(el);
  return { close, tryUndo, onAction };
};
var mountVersus = (container, navigate2, pool2, versusConfig) => {
  container.innerHTML = "";
  const root = document.createElement("div");
  container.appendChild(root);
  const sharedChallenges = [];
  const ensureChallenge = (i88) => {
    while (sharedChallenges.length <= i88 + 2) sharedChallenges.push(pool2.take());
  };
  ensureChallenge(0);
  let wsIdx1 = 0;
  let index1 = 1;
  let score1 = 0;
  const resolved1 = /* @__PURE__ */ new Map();
  const levelPoints1 = /* @__PURE__ */ new Map();
  const skipSynthetic1 = /* @__PURE__ */ new Map();
  let pending1 = [];
  let scoreCommitted1 = false;
  let wsIdx2 = 0;
  let index2 = 1;
  let score2 = 0;
  const resolved2 = /* @__PURE__ */ new Map();
  const levelPoints2 = /* @__PURE__ */ new Map();
  const skipSynthetic2 = /* @__PURE__ */ new Map();
  let pending2 = [];
  let scoreCommitted2 = false;
  const currentChallengeIdx1 = () => wsIdx1;
  const currentChallengeIdx2 = () => wsIdx2;
  const makeWorkspace = (i88) => {
    ensureChallenge(i88);
    const item = sharedChallenges[i88];
    if (item === void 0)
      throw new Error("no challenge at index " + String(i88));
    return new Workspace({ challenge: item.challenge });
  };
  const advancePlayer1 = () => {
    scoreCommitted1 = false;
    const [next1, ...rest1] = pending1;
    if (next1 !== void 0) {
      wsIdx1 = next1;
      pending1 = rest1;
    } else {
      wsIdx1 = index1;
      index1 += 1;
    }
    ws1 = makeWorkspace(wsIdx1);
  };
  const advancePlayer2 = () => {
    scoreCommitted2 = false;
    const [next2, ...rest2] = pending2;
    if (next2 !== void 0) {
      wsIdx2 = next2;
      pending2 = rest2;
    } else {
      wsIdx2 = index2;
      index2 += 1;
    }
    ws2 = makeWorkspace(wsIdx2);
  };
  let ws1 = makeWorkspace(0);
  let ws2 = makeWorkspace(0);
  const makeCtx = (input) => {
    const base = createBenchCtx(input !== "keyboard", true, false, false, 1);
    if (input !== "mouse") return base;
    return { ...base, getActionHint: () => void 0 };
  };
  const ctx1 = makeCtx(versusConfig.p1Input);
  const ctx2 = makeCtx(versusConfig.p2Input);
  let timeLeft = versusConfig.gameDurationSeconds;
  let gameOver = false;
  let paused = false;
  let timerEl = null;
  let closeEditor1 = null;
  let tryUndoEditor1 = null;
  let onActionEditor1 = null;
  let closeEditor2 = null;
  let tryUndoEditor2 = null;
  let onActionEditor2 = null;
  const isNpc1 = versusConfig.p1Input === "npc";
  const isNpc2 = versusConfig.p2Input === "npc";
  const hideControls1 = versusConfig.p1Input !== "mouse" && !isNpc1;
  const hideControls2 = versusConfig.p2Input !== "mouse" && !isNpc2;
  let half1El = null;
  let half2El = null;
  let thermoEl = null;
  const makeUndoControls = (ws, ctx, refresh) => {
    const el = document.createElement("div");
    el.setAttribute("class", "controls");
    const canUndo = activePath(ws.currentConjecture()).length > 0;
    const enabled = canUndo || ctx.isGazeModeActive();
    const undoBtn = createButton(
      t("undo"),
      !enabled,
      () => {
        if (canUndo) {
          ws.applyEvent(undo2());
        } else {
          ctx.setGazeModeActive(false);
        }
        refresh();
      },
      ctx.getActionHint("undo")
    );
    undoBtn.classList.add("mutating");
    el.appendChild(undoBtn);
    return el;
  };
  const buildHalf1 = () => {
    const half2 = document.createElement("div");
    half2.setAttribute(
      "class",
      "versus-half" + (isNpc1 ? " versus-half-npc" : "") + (hideControls1 ? " versus-half-keys" : "")
    );
    half2.appendChild(
      createBench(
        ws1,
        makeCongratsP1,
        isNpc1 ? document.createElement("div") : makeUndoControls(ws1, ctx1, refreshP1),
        refreshP1,
        void 0,
        onApplyReverse1,
        void 0,
        ctx1,
        isNpc1 ? void 0 : skipPlayer1
      )
    );
    return half2;
  };
  const buildHalf2 = () => {
    const half2 = document.createElement("div");
    half2.setAttribute(
      "class",
      "versus-half" + (isNpc2 ? " versus-half-npc" : "") + (hideControls2 ? " versus-half-keys" : "")
    );
    half2.appendChild(
      createBench(
        ws2,
        makeCongratsP2,
        isNpc2 ? document.createElement("div") : makeUndoControls(ws2, ctx2, refreshP2),
        refreshP2,
        void 0,
        onApplyReverse2,
        void 0,
        ctx2,
        isNpc2 ? void 0 : skipPlayer2
      )
    );
    return half2;
  };
  const buildThermo = () => {
    const thermo = document.createElement("div");
    thermo.setAttribute("class", "versus-thermo");
    const clock = document.createElement("div");
    clock.setAttribute("class", "versus-thermo-clock");
    clock.textContent = formatTime(timeLeft);
    timerEl = clock;
    thermo.appendChild(clock);
    const thermoRows = document.createElement("div");
    thermoRows.setAttribute("class", "versus-thermo-rows");
    const ci1 = currentChallengeIdx1();
    const ci2 = currentChallengeIdx2();
    const allKeys = [
      ci1,
      ci2,
      ...Array.from(resolved1.keys()),
      ...Array.from(resolved2.keys())
    ];
    const maxIdx = Math.max(...allKeys);
    const currentMoves1 = totalMoves(ws1);
    const currentMoves2 = totalMoves(ws2);
    const displayEntry = (resolved, ci, i88) => {
      if (i88 !== ci) return resolved.get(i88);
      const entry = resolved.get(ci);
      return typeof entry === "number" ? entry : "current";
    };
    const entryMoves = (e, cur, synthetic) => {
      if (e === void 0) return "";
      if (e === "current") return String(cur);
      if (e === "skip")
        return synthetic !== void 0 ? `(${String(synthetic)})` : "\u2013";
      return String(e);
    };
    const entryPts = (e, pts) => {
      if (e === void 0 || e === "current" || e === "skip") return "";
      const bonus = (pts ?? 1) - 1;
      return bonus > 0 ? `+${String(bonus)}` : "";
    };
    const makeCell = (entry, cur, pts, synthetic, playerClass) => {
      const cell2 = document.createElement("div");
      cell2.setAttribute(
        "class",
        `versus-thermo-cell ${playerClass}${entry === "current" ? " current" : ""}`
      );
      const movesEl = document.createElement("div");
      movesEl.setAttribute("class", "versus-thermo-moves");
      movesEl.textContent = entryMoves(entry, cur, synthetic);
      const ptsEl = document.createElement("div");
      ptsEl.setAttribute("class", "versus-thermo-points");
      ptsEl.textContent = entryPts(entry, pts);
      cell2.appendChild(movesEl);
      cell2.appendChild(ptsEl);
      return cell2;
    };
    for (let i88 = maxIdx; i88 >= 0; i88 -= 1) {
      const row = document.createElement("div");
      row.setAttribute("class", "versus-thermo-row");
      row.appendChild(
        makeCell(
          displayEntry(resolved1, ci1, i88),
          currentMoves1,
          levelPoints1.get(i88),
          skipSynthetic1.get(i88),
          "p1"
        )
      );
      row.appendChild(
        makeCell(
          displayEntry(resolved2, ci2, i88),
          currentMoves2,
          levelPoints2.get(i88),
          skipSynthetic2.get(i88),
          "p2"
        )
      );
      thermoRows.appendChild(row);
    }
    const thermoTotal = document.createElement("div");
    thermoTotal.setAttribute("class", "versus-thermo-total");
    const totalCell1 = document.createElement("div");
    totalCell1.setAttribute("class", "versus-thermo-cell p1 total");
    totalCell1.textContent = String(score1);
    const totalCell2 = document.createElement("div");
    totalCell2.setAttribute("class", "versus-thermo-cell p2 total");
    totalCell2.textContent = String(score2);
    thermoTotal.appendChild(totalCell1);
    thermoTotal.appendChild(totalCell2);
    thermo.appendChild(thermoTotal);
    thermo.appendChild(thermoRows);
    const menuBtn = createButton("\u22EE", false, () => setPaused(true));
    menuBtn.classList.add("versus-menu-btn");
    menuBtn.setAttribute("aria-label", t("menu"));
    thermo.appendChild(menuBtn);
    return thermo;
  };
  const setPaused = (v2) => {
    paused = v2;
    rerender();
  };
  const buildPauseMenu = () => {
    const shroud = document.createElement("div");
    shroud.setAttribute("class", "shroud pause-shroud");
    shroud.onclick = (ev) => {
      if (ev.target === shroud) {
        ev.preventDefault();
        setPaused(false);
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
      createButton(
        t("resumeGame"),
        false,
        () => setPaused(false),
        getActionHintPure("menu", false)
      )
    );
    buttons.appendChild(
      createButton(
        t("playAgain"),
        false,
        () => navigate2("versus"),
        getActionHintPure("skip", false)
      )
    );
    buttons.appendChild(
      createButton(t("settings"), false, () => navigate2("versus-config"))
    );
    buttons.appendChild(
      createButton(
        t("exitToMainMenu"),
        false,
        () => navigate2("menu"),
        getActionHintPure("exit", false)
      )
    );
    panel.appendChild(buttons);
    shroud.appendChild(panel);
    shroud.appendChild(createLangSwitcher());
    return shroud;
  };
  const rerender = () => {
    if (ws1.isSolved()) commitScore1();
    if (ws2.isSolved()) commitScore2();
    root.innerHTML = "";
    timerEl = null;
    const screen = document.createElement("div");
    screen.setAttribute("class", "versus-screen");
    const arena = document.createElement("div");
    arena.setAttribute("class", "versus-arena");
    half1El = buildHalf1();
    half2El = buildHalf2();
    thermoEl = buildThermo();
    arena.appendChild(half1El);
    arena.appendChild(thermoEl);
    arena.appendChild(half2El);
    screen.appendChild(arena);
    root.appendChild(screen);
    if (gameOver) root.appendChild(buildResultScreen());
    else if (paused) root.appendChild(buildPauseMenu());
  };
  const breakdownEntry = (resolved, ci, i88) => {
    if (i88 !== ci) return resolved.get(i88);
    const entry = resolved.get(ci);
    return typeof entry === "number" ? entry : "current";
  };
  const sideCells = (entry, currentMoves, levelPoints, synthetic) => {
    if (entry === void 0)
      return { moves: "", done: "", bonus: "", points: "" };
    if (entry === "current")
      return { moves: String(currentMoves), done: "\u2026", bonus: "", points: "" };
    if (entry === "skip")
      return {
        moves: synthetic !== void 0 ? String(synthetic) : "",
        done: "\u2298",
        bonus: "\u2014",
        points: "0"
      };
    const pts = levelPoints ?? 1;
    const bonus = pts - 1;
    return {
      moves: String(entry),
      done: "\u2713",
      bonus: bonus > 0 ? `+${String(bonus)}` : "\u2014",
      points: String(pts)
    };
  };
  const cell = (cls, label, value) => {
    const el = document.createElement("div");
    el.setAttribute("class", `vb-cell ${cls}`);
    const lab = document.createElement("div");
    lab.setAttribute("class", "vb-cell-label");
    lab.textContent = label;
    const val = document.createElement("div");
    val.setAttribute("class", "vb-cell-value");
    val.textContent = value;
    el.appendChild(lab);
    el.appendChild(val);
    return el;
  };
  const par = (i88) => {
    const solution87 = sharedChallenges[i88]?.challenge.solution;
    if (solution87 === void 0) return "\u{1F480}";
    const counts = countRuleUsage(solution87);
    return String(Object.values(counts).reduce((a87, b) => a87 + b, 0));
  };
  const buildResultScreen = () => {
    const ci1 = currentChallengeIdx1();
    const ci2 = currentChallengeIdx2();
    const maxIdx = Math.max(
      ci1,
      ci2,
      ...Array.from(resolved1.keys()),
      ...Array.from(resolved2.keys())
    );
    const moves1 = totalMoves(ws1);
    const moves2 = totalMoves(ws2);
    const overlay = document.createElement("div");
    overlay.setAttribute("class", "versus-result");
    const title = document.createElement("div");
    title.setAttribute("class", "versus-breakdown-title");
    title.textContent = score1 > score2 ? t("winsTemplate").replace("{player}", t("player1")) : score2 > score1 ? t("winsTemplate").replace("{player}", t("player2")) : t("tie");
    overlay.appendChild(title);
    const grid = document.createElement("div");
    grid.setAttribute("class", "versus-breakdown-grid");
    const header = document.createElement("div");
    header.setAttribute("class", "vb-level vb-header");
    const p1Name = document.createElement("div");
    p1Name.setAttribute("class", "vb-title-name p1");
    p1Name.textContent = t("player1");
    const p1Score = document.createElement("div");
    p1Score.setAttribute("class", "vb-title-score-cell p1");
    p1Score.innerHTML = `<span class="vb-title-score">${String(score1)}</span>`;
    const spacer = document.createElement("div");
    spacer.setAttribute("class", "vb-title-spacer");
    const p2Score = document.createElement("div");
    p2Score.setAttribute("class", "vb-title-score-cell p2");
    p2Score.innerHTML = `<span class="vb-title-score">${String(score2)}</span>`;
    const p2Name = document.createElement("div");
    p2Name.setAttribute("class", "vb-title-name p2");
    p2Name.textContent = t("player2");
    header.appendChild(p1Name);
    header.appendChild(p1Score);
    header.appendChild(spacer);
    header.appendChild(p2Score);
    header.appendChild(p2Name);
    grid.appendChild(header);
    const sub = document.createElement("div");
    sub.setAttribute("class", "vb-level vb-subhead");
    const subCols = [
      t("moves"),
      t("done"),
      t("bonus"),
      t("points"),
      t("par"),
      t("goal"),
      t("points"),
      t("bonus"),
      t("done"),
      t("moves")
    ];
    subCols.forEach((label, idx) => {
      const c = document.createElement("div");
      c.setAttribute(
        "class",
        "vb-cell vb-subcell" + (idx === 4 || idx === 6 ? " vb-sec-start" : "")
      );
      c.textContent = label;
      sub.appendChild(c);
    });
    grid.appendChild(sub);
    for (let i88 = 0; i88 <= maxIdx; i88 += 1) {
      const e1 = breakdownEntry(resolved1, ci1, i88);
      const e2 = breakdownEntry(resolved2, ci2, i88);
      const s1 = sideCells(
        e1,
        moves1,
        levelPoints1.get(i88),
        skipSynthetic1.get(i88)
      );
      const s2 = sideCells(
        e2,
        moves2,
        levelPoints2.get(i88),
        skipSynthetic2.get(i88)
      );
      const row = document.createElement("div");
      row.setAttribute("class", "vb-level");
      row.appendChild(cell("p1 num", t("moves"), s1.moves));
      row.appendChild(cell("p1 num", t("done"), s1.done));
      row.appendChild(cell("p1 num", t("bonus"), s1.bonus));
      row.appendChild(cell("p1 num pts", t("points"), s1.points));
      const parCell = cell("vb-sec-start num", t("par"), par(i88));
      row.appendChild(parCell);
      const goalCell = document.createElement("div");
      goalCell.setAttribute("class", "vb-cell vb-goal");
      const goalLab = document.createElement("div");
      goalLab.setAttribute("class", "vb-cell-label");
      goalLab.textContent = t("goal");
      const goalVal = document.createElement("div");
      goalVal.setAttribute("class", "vb-cell-value");
      const seq = sharedChallenges[i88]?.challenge.goal;
      if (seq !== void 0) goalVal.innerHTML = html(fromSequent(seq)(basic));
      goalCell.appendChild(goalLab);
      goalCell.appendChild(goalVal);
      row.appendChild(goalCell);
      row.appendChild(cell("p2 num pts vb-sec-start", t("points"), s2.points));
      row.appendChild(cell("p2 num", t("bonus"), s2.bonus));
      row.appendChild(cell("p2 num", t("done"), s2.done));
      row.appendChild(cell("p2 num", t("moves"), s2.moves));
      grid.appendChild(row);
    }
    overlay.appendChild(grid);
    const actions = document.createElement("div");
    actions.setAttribute("class", "versus-breakdown-actions");
    actions.appendChild(
      createButton(
        t("settings"),
        false,
        () => navigate2("versus-config"),
        getActionHintPure("lemma", false)
      )
    );
    actions.appendChild(
      createButton(
        t("playAgain"),
        false,
        () => navigate2("versus"),
        getActionHintPure("skip", false)
      )
    );
    overlay.appendChild(actions);
    return overlay;
  };
  const commitScore1 = () => {
    if (scoreCommitted1) return;
    scoreCommitted1 = true;
    const challengeIdx = currentChallengeIdx1();
    const moves1 = totalMoves(ws1);
    const isRetry = resolved1.get(challengeIdx) === "skip";
    resolved1.set(challengeIdx, moves1);
    score1 += 1;
    levelPoints1.set(challengeIdx, 1);
    if (isRetry) {
      const p2Moves = resolved2.get(challengeIdx);
      if (typeof p2Moves === "number") {
        skipSynthetic1.delete(challengeIdx);
        const diff = moves1 - p2Moves;
        const bonus = Math.abs(diff);
        if (moves1 < p2Moves) {
          score1 += bonus;
          levelPoints1.set(challengeIdx, 1 + bonus);
        } else if (p2Moves < moves1) {
          score2 += bonus;
          levelPoints2.set(
            challengeIdx,
            (levelPoints2.get(challengeIdx) ?? 1) + bonus
          );
        }
      }
    } else {
      const p2Entry = resolved2.get(challengeIdx);
      if (typeof p2Entry === "number") {
        const diff = moves1 - p2Entry;
        const bonus = Math.abs(diff);
        if (moves1 < p2Entry) {
          score1 += bonus;
          levelPoints1.set(challengeIdx, 1 + bonus);
        } else if (p2Entry < moves1) {
          score2 += bonus;
          levelPoints2.set(
            challengeIdx,
            (levelPoints2.get(challengeIdx) ?? 1) + bonus
          );
        }
      } else if (p2Entry === "skip") {
        pending2 = [...pending2, challengeIdx];
      }
    }
  };
  const solvePlayer1 = () => {
    commitScore1();
    advancePlayer1();
    rerenderHalf1();
    rebuildThermo();
  };
  const commitScore2 = () => {
    if (scoreCommitted2) return;
    scoreCommitted2 = true;
    const challengeIdx = currentChallengeIdx2();
    const moves2 = totalMoves(ws2);
    const isRetry = resolved2.get(challengeIdx) === "skip";
    resolved2.set(challengeIdx, moves2);
    score2 += 1;
    levelPoints2.set(challengeIdx, 1);
    if (isRetry) {
      const p1Moves = resolved1.get(challengeIdx);
      if (typeof p1Moves === "number") {
        skipSynthetic2.delete(challengeIdx);
        const diff = moves2 - p1Moves;
        const bonus = Math.abs(diff);
        if (moves2 < p1Moves) {
          score2 += bonus;
          levelPoints2.set(challengeIdx, 1 + bonus);
        } else if (p1Moves < moves2) {
          score1 += bonus;
          levelPoints1.set(
            challengeIdx,
            (levelPoints1.get(challengeIdx) ?? 1) + bonus
          );
        }
      }
    } else {
      const p1Entry = resolved1.get(challengeIdx);
      if (typeof p1Entry === "number") {
        const diff = moves2 - p1Entry;
        const bonus = Math.abs(diff);
        if (moves2 < p1Entry) {
          score2 += bonus;
          levelPoints2.set(challengeIdx, 1 + bonus);
        } else if (p1Entry < moves2) {
          score1 += bonus;
          levelPoints1.set(
            challengeIdx,
            (levelPoints1.get(challengeIdx) ?? 1) + bonus
          );
        }
      } else if (p1Entry === "skip") {
        pending1 = [...pending1, challengeIdx];
      }
    }
  };
  const solvePlayer2 = () => {
    commitScore2();
    advancePlayer2();
    rerenderHalf2();
    rebuildThermo();
  };
  const skipPlayer1 = () => {
    if (gameOver) return;
    const challengeIdx = wsIdx1;
    resolved1.set(challengeIdx, "skip");
    const p2Entry = resolved2.get(challengeIdx);
    if (typeof p2Entry === "number") {
      const synthetic = 2 * p2Entry;
      skipSynthetic1.set(challengeIdx, synthetic);
      const bonus = p2Entry;
      score2 += bonus;
      levelPoints2.set(
        challengeIdx,
        (levelPoints2.get(challengeIdx) ?? 1) + bonus
      );
    }
    advancePlayer1();
    rerenderHalf1();
    rebuildThermo();
  };
  const skipPlayer2 = () => {
    if (gameOver) return;
    const challengeIdx = wsIdx2;
    resolved2.set(challengeIdx, "skip");
    const p1Entry = resolved1.get(challengeIdx);
    if (typeof p1Entry === "number") {
      const synthetic = 2 * p1Entry;
      skipSynthetic2.set(challengeIdx, synthetic);
      const bonus = p1Entry;
      score1 += bonus;
      levelPoints1.set(
        challengeIdx,
        (levelPoints1.get(challengeIdx) ?? 1) + bonus
      );
    }
    advancePlayer2();
    rerenderHalf2();
    rebuildThermo();
  };
  const rerenderHalf1 = () => {
    if (half1El === null) return;
    const fresh = buildHalf1();
    half1El.replaceWith(fresh);
    half1El = fresh;
  };
  const rerenderHalf2 = () => {
    if (half2El === null) return;
    const fresh = buildHalf2();
    half2El.replaceWith(fresh);
    half2El = fresh;
  };
  const rebuildThermo = () => {
    if (thermoEl === null) return;
    const fresh = buildThermo();
    thermoEl.replaceWith(fresh);
    thermoEl = fresh;
  };
  const refreshP1 = () => {
    if (ws1.isSolved()) commitScore1();
    rerenderHalf1();
    rebuildThermo();
  };
  const refreshP2 = () => {
    if (ws2.isSolved()) commitScore2();
    rerenderHalf2();
    rebuildThermo();
  };
  const onSolved1 = (action) => {
    if (gameOver) return;
    if (action === "menu") {
      navigate2("menu");
      return;
    }
    if (action === "axiom") {
      solvePlayer1();
      return;
    }
    rerenderHalf1();
  };
  const onSolved2 = (action) => {
    if (gameOver) return;
    if (action === "menu") {
      navigate2("menu");
      return;
    }
    if (action === "axiom") {
      solvePlayer2();
      return;
    }
    rerenderHalf2();
  };
  const onApplyReverse1 = (_key, onFormula) => {
    if (closeEditor1 !== null) return;
    const ed1 = makeVersusFormulaEditor(
      "left",
      (formula) => {
        closeEditor1 = null;
        tryUndoEditor1 = null;
        onActionEditor1 = null;
        onFormula(formula);
      },
      () => {
        closeEditor1 = null;
        tryUndoEditor1 = null;
        onActionEditor1 = null;
      },
      versusConfig.p1Input === "keyboard" ? "\u232B" : versusConfig.p1Input === "mouse" ? void 0 : "\u25CB",
      ctx1.getActionHint("axiom")
    );
    closeEditor1 = ed1.close;
    tryUndoEditor1 = ed1.tryUndo;
    onActionEditor1 = ed1.onAction;
  };
  const onApplyReverse2 = (_key, onFormula) => {
    if (closeEditor2 !== null) return;
    const ed2 = makeVersusFormulaEditor(
      "right",
      (formula) => {
        closeEditor2 = null;
        tryUndoEditor2 = null;
        onActionEditor2 = null;
        onFormula(formula);
      },
      () => {
        closeEditor2 = null;
        tryUndoEditor2 = null;
        onActionEditor2 = null;
      },
      versusConfig.p2Input === "keyboard" ? "\u232B" : versusConfig.p2Input === "mouse" ? void 0 : "\u25CB",
      ctx2.getActionHint("axiom")
    );
    closeEditor2 = ed2.close;
    tryUndoEditor2 = ed2.tryUndo;
    onActionEditor2 = ed2.onAction;
  };
  const dispatch1 = createDispatch(
    () => ws1,
    refreshP1,
    navigate2,
    onSolved1,
    void 0,
    void 0,
    onApplyReverse1,
    ctx1
  );
  const dispatch2 = createDispatch(
    () => ws2,
    refreshP2,
    navigate2,
    onSolved2,
    void 0,
    void 0,
    onApplyReverse2,
    ctx2
  );
  const makeCongratsP1 = () => {
    const hurray = document.createElement("div");
    const buttons = document.createElement("div");
    buttons.appendChild(
      createButton(
        t("continue"),
        false,
        () => dispatch1("axiom"),
        ctx1.getActionHint("axiom")
      )
    );
    return { hurray, buttons };
  };
  const makeCongratsP2 = () => {
    const hurray = document.createElement("div");
    const buttons = document.createElement("div");
    buttons.appendChild(
      createButton(
        t("continue"),
        false,
        () => dispatch2("axiom"),
        ctx2.getActionHint("axiom")
      )
    );
    return { hurray, buttons };
  };
  const ticker = setInterval(() => {
    if (gameOver || paused) return;
    timeLeft -= 1;
    if (timeLeft <= 0) {
      timeLeft = 0;
      gameOver = true;
      clearInterval(ticker);
      closeEditor1?.();
      closeEditor2?.();
      rerender();
      return;
    }
    if (timerEl !== null) {
      timerEl.textContent = formatTime(timeLeft);
    }
  }, 1e3);
  const connectedGamepadIndices = () => Array.from(navigator.getGamepads()).flatMap(
    (gp, i88) => gp !== null ? [i88] : []
  );
  const gpIndex = (input) => {
    const indices = connectedGamepadIndices();
    return input === "gamepad2" ? indices[1] ?? 1 : indices[0] ?? 0;
  };
  const handleEditorInput1 = (action) => {
    if (closeEditor1 === null) return false;
    if (action === "undo") {
      if (!(tryUndoEditor1?.() ?? false)) closeEditor1();
    } else if (action === "menu") {
      closeEditor1();
    } else {
      onActionEditor1?.(action);
    }
    return true;
  };
  const handleEditorInput2 = (action) => {
    if (closeEditor2 === null) return false;
    if (action === "undo") {
      if (!(tryUndoEditor2?.() ?? false)) closeEditor2();
    } else if (action === "menu") {
      closeEditor2();
    } else {
      onActionEditor2?.(action);
    }
    return true;
  };
  const handleResultAction = (action) => {
    if (action === "lemma") navigate2("versus-config");
    else if (action === "skip") navigate2("versus");
  };
  const handleControlAction = (action) => {
    if (gameOver) {
      handleResultAction(action);
      return;
    }
    if (paused) {
      if (action === "menu" || action === "undo") setPaused(false);
      else if (action === "skip") navigate2("versus");
      else if (action === "exit") navigate2("menu");
      return;
    }
    if (action !== "menu") return;
    if (closeEditor1 !== null || closeEditor2 !== null) {
      closeEditor1?.();
      closeEditor2?.();
    } else {
      setPaused(true);
    }
  };
  const handleKey = (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey || gameOver || paused) return;
    const action = qwertyKeyMap[ev.code];
    if (action === void 0 || action === "menu") return;
    markKeyboardInput();
    if (handleEditorInput1(action)) return;
    if (action === "skip") {
      skipPlayer1();
      return;
    }
    dispatch1(action);
  };
  const handleKey2 = (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey || gameOver || paused) return;
    const action = qwertyKeyMap[ev.code];
    if (action === void 0 || action === "menu") return;
    markKeyboardInput();
    if (handleEditorInput2(action)) return;
    if (action === "skip") {
      skipPlayer2();
      return;
    }
    dispatch2(action);
  };
  let cleanupP1;
  if (versusConfig.p1Input === "keyboard") {
    document.addEventListener("keydown", handleKey);
    cleanupP1 = () => document.removeEventListener("keydown", handleKey);
  } else if (versusConfig.p1Input === "mouse") {
    cleanupP1 = () => {
    };
  } else if (versusConfig.p1Input === "npc") {
    const driver = createNpcDriver({
      getWorkspace: () => ws1,
      getChallengeIdx: () => wsIdx1,
      getTotalMoves: () => totalMoves(ws1),
      applyEvent: (ev) => {
        ws1.applyEvent(ev);
        if (ws1.isSolved()) {
          solvePlayer1();
        } else {
          refreshP1();
        }
      },
      skip: skipPlayer1,
      knobs: versusConfig.npc1Knobs,
      isGameOver: () => gameOver,
      isPaused: () => paused
    });
    cleanupP1 = driver.cleanup;
  } else {
    cleanupP1 = setupGamepad((action) => {
      if (gameOver || paused || action === "menu") return;
      if (handleEditorInput1(action)) return;
      if (action === "skip") {
        skipPlayer1();
        return;
      }
      dispatch1(action);
    }, gpIndex(versusConfig.p1Input));
  }
  let cleanupP2;
  if (versusConfig.p2Input === "keyboard") {
    document.addEventListener("keydown", handleKey2);
    cleanupP2 = () => document.removeEventListener("keydown", handleKey2);
  } else if (versusConfig.p2Input === "mouse") {
    cleanupP2 = () => {
    };
  } else if (versusConfig.p2Input === "npc") {
    const driver = createNpcDriver({
      getWorkspace: () => ws2,
      getChallengeIdx: () => wsIdx2,
      getTotalMoves: () => totalMoves(ws2),
      applyEvent: (ev) => {
        ws2.applyEvent(ev);
        if (ws2.isSolved()) {
          solvePlayer2();
        } else {
          refreshP2();
        }
      },
      skip: skipPlayer2,
      knobs: versusConfig.npc2Knobs,
      isGameOver: () => gameOver,
      isPaused: () => paused
    });
    cleanupP2 = driver.cleanup;
  } else {
    cleanupP2 = setupGamepad((action) => {
      if (gameOver || paused || action === "menu") return;
      if (handleEditorInput2(action)) return;
      if (action === "skip") {
        skipPlayer2();
        return;
      }
      dispatch2(action);
    }, gpIndex(versusConfig.p2Input));
  }
  const handleControlKey = (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const action = qwertyKeyMap[ev.code];
    if (action !== void 0) handleControlAction(action);
  };
  document.addEventListener("keydown", handleControlKey);
  const controlPadIndices = [.../* @__PURE__ */ new Set([0, ...connectedGamepadIndices()])];
  const cleanupControlPads = controlPadIndices.map(
    (idx) => setupGamepad((action) => handleControlAction(action), idx)
  );
  const unsubGamepad = subscribeGamepad(rerender);
  rerender();
  return {
    cleanup: () => {
      clearInterval(ticker);
      cleanupP1();
      cleanupP2();
      document.removeEventListener("keydown", handleControlKey);
      cleanupControlPads.forEach((c) => c());
      unsubGamepad();
      closeEditor1?.();
      closeEditor2?.();
    },
    rerender
  };
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
var renderAtom = (name2) => html(fromAtom(atom(name2))(basic));
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
var buildFormulaSettingsSection = (config, onChange, prependFilterRows = []) => {
  const createToggle = (content, useHtml, title, isActive, onToggle) => {
    const btn = document.createElement("pre");
    btn.className = "button toggle";
    if (useHtml) {
      btn.innerHTML = content;
    } else {
      btn.textContent = content;
    }
    btn.title = title;
    const led = document.createElement("span");
    led.className = "led" + (isActive() ? " on" : "");
    btn.appendChild(led);
    btn.onclick = () => {
      onToggle();
      led.className = "led" + (isActive() ? " on" : "");
      onChange();
    };
    return btn;
  };
  const shapeSection = createSection(t("formulaShape"));
  const filterHeading = document.createElement("div");
  filterHeading.className = "config-subsection-title";
  filterHeading.textContent = t("filter");
  shapeSection.appendChild(filterHeading);
  for (const row of prependFilterRows) {
    shapeSection.appendChild(row);
  }
  shapeSection.appendChild(
    createRow(
      t("bypassPercent"),
      createNumberInput(
        config.bypassPercent,
        (v2) => {
          config.bypassPercent = v2;
          onChange();
        },
        0,
        100
      )
    )
  );
  shapeSection.appendChild(
    createRow(
      t("targetNonStructural"),
      createNumberInput(
        config.targetNonStructural,
        (v2) => {
          config.targetNonStructural = v2;
          onChange();
        },
        1
      )
    )
  );
  shapeSection.appendChild(
    createRow(
      t("size"),
      createNumberInput(
        config.size,
        (v2) => {
          config.size = v2;
          onChange();
        },
        1,
        30
      )
    )
  );
  const defaultConnectives = defaultRandomConfig().connectives;
  const connectiveKeys = [
    { key: "implication", label: t("implicationWeight"), symbol: "\u2192" },
    { key: "conjunction", label: t("conjunctionWeight"), symbol: "\u2227" },
    { key: "disjunction", label: t("disjunctionWeight"), symbol: "\u2228" },
    { key: "negation", label: t("negationWeight"), symbol: "\xAC" }
  ];
  const connectiveHeading = document.createElement("div");
  connectiveHeading.className = "config-subsection-title";
  connectiveHeading.textContent = t("connectives");
  shapeSection.appendChild(connectiveHeading);
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
  const symbolKeys = ["p", "q", "r", "s", "u", "v"];
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
  return shapeSection;
};
var mountRandomConfig = (container, _navigate, onStart) => {
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
    settings.appendChild(buildFormulaSettingsSection(config, restartSearch));
    const buttons = document.createElement("div");
    buttons.className = "config-buttons";
    const backBtn = document.createElement("div");
    backBtn.className = "button";
    backBtn.textContent = t("back");
    backBtn.onclick = () => history.back();
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

// src/npc/knobs.ts
var defaultNpcKnobs = () => ({
  // Tuned 2026-06-12 so the default opponent is not trivially beatable:
  // depth 8 solves essentially the whole default pool (12/12 sampled,
  // search <160ms), and ~400ms per move finishes a typical 11-19 event
  // plan in 5-8s per level.
  baseThinkMs: 400,
  jitterMs: 250,
  skipAfterMs: 3e4,
  skipStuckMs: 8e3,
  searchDepth: 8
});
var pickNumber2 = (params, key, fallback) => {
  const raw2 = params.get(key);
  if (raw2 === null || raw2 === "") return fallback;
  const value = parseFloat(raw2);
  return Number.isFinite(value) ? value : fallback;
};
var parseNpcKnobsFromParams = (params, prefix) => {
  const defaults = defaultNpcKnobs();
  return {
    baseThinkMs: pickNumber2(params, prefix + "think", defaults.baseThinkMs),
    jitterMs: pickNumber2(params, prefix + "jitter", defaults.jitterMs),
    skipAfterMs: pickNumber2(params, prefix + "skip_time", defaults.skipAfterMs),
    skipStuckMs: pickNumber2(
      params,
      prefix + "skip_stuck",
      defaults.skipStuckMs
    ),
    searchDepth: pickNumber2(params, prefix + "depth", defaults.searchDepth)
  };
};
var setNpcKnobsParams = (knobs, params, prefix) => {
  params.set(prefix + "think", String(knobs.baseThinkMs));
  params.set(prefix + "jitter", String(knobs.jitterMs));
  params.set(prefix + "skip_time", String(knobs.skipAfterMs));
  params.set(prefix + "skip_stuck", String(knobs.skipStuckMs));
  params.set(prefix + "depth", String(knobs.searchDepth));
};

// src/web/versus-config.ts
var defaultVersusConfig = () => ({
  randomConfig: defaultRandomConfig(),
  gameDurationSeconds: 300,
  p1Input: "keyboard",
  p2Input: "npc",
  npc1Knobs: defaultNpcKnobs(),
  npc2Knobs: defaultNpcKnobs()
});
var INPUT_OPTIONS = [
  "mouse",
  "keyboard",
  "gamepad1",
  "gamepad2",
  "npc"
];
var pickNumber3 = (params, key, fallback) => {
  const raw2 = params.get(key);
  if (raw2 === null || raw2 === "") return fallback;
  const value = parseInt(raw2, 10);
  return Number.isFinite(value) ? value : fallback;
};
var pickInput = (params, key, fallback) => {
  const raw2 = params.get(key);
  if (raw2 === "mouse" || raw2 === "keyboard" || raw2 === "gamepad1" || raw2 === "gamepad2" || raw2 === "npc")
    return raw2;
  return fallback;
};
var parseVersusConfigFromParams = (params) => {
  const defaults = defaultVersusConfig();
  return {
    randomConfig: parseConfigFromParams(params),
    gameDurationSeconds: pickNumber3(
      params,
      "versus_time",
      defaults.gameDurationSeconds
    ),
    p1Input: pickInput(params, "versus_p1", defaults.p1Input),
    p2Input: pickInput(params, "versus_p2", defaults.p2Input),
    npc1Knobs: parseNpcKnobsFromParams(params, "npc1_"),
    npc2Knobs: parseNpcKnobsFromParams(params, "npc2_")
  };
};
var setVersusConfigParams = (config, params) => {
  setConfigParams(config.randomConfig, params);
  params.set("versus_time", String(config.gameDurationSeconds));
  params.set("versus_p1", config.p1Input);
  params.set("versus_p2", config.p2Input);
  setNpcKnobsParams(config.npc1Knobs, params, "npc1_");
  setNpcKnobsParams(config.npc2Knobs, params, "npc2_");
};
var inputLabel = (input) => {
  if (input === "mouse") return t("mouse");
  if (input === "keyboard") return t("keyboard");
  if (input === "gamepad1") return t("gamepad1");
  if (input === "gamepad2") return t("gamepad2");
  return t("npc");
};
var inputEmoji = (input) => {
  if (input === "mouse") return "\u{1F5B1}\uFE0F";
  if (input === "keyboard") return "\u2328\uFE0F";
  if (input === "gamepad1") return "\u{1F3AE}\u2081";
  if (input === "gamepad2") return "\u{1F3AE}\u2082";
  return "\u{1F916}";
};
var connectedGamepadCount = () => Array.from(navigator.getGamepads()).filter((gp) => gp !== null).length;
var isInputAvailable = (input) => {
  if (input === "mouse" || input === "keyboard" || input === "npc") return true;
  const needed = input === "gamepad1" ? 1 : 2;
  return connectedGamepadCount() >= needed;
};
var mountVersusConfig = (container, _navigate, onStart) => {
  const config = parseVersusConfigFromParams(
    new URLSearchParams(window.location.search)
  );
  const syncUrl = () => {
    const params = new URLSearchParams(window.location.search);
    setVersusConfigParams(config, params);
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
      const distance = entryDistance(nonStructuralCount, config.randomConfig);
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
    config.randomConfig,
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
    previewWorker = createPreviewWorker(config.randomConfig, handleResult);
    renderPreviewList(entries2);
    startClock();
  };
  const canStart = () => isInputAvailable(config.p1Input) && isInputAvailable(config.p2Input);
  const createRadioGroup = (options, getActive, getLabel, getContent, isDisabled, onChange) => {
    const group = document.createElement("div");
    group.className = "config-toggles";
    for (const option of options) {
      const btn = document.createElement("div");
      const active2 = getActive() === option;
      const disabled = isDisabled(option);
      btn.className = "button" + (active2 ? " active" : "") + (disabled ? " disabled" : "");
      btn.textContent = getContent(option);
      btn.title = getLabel(option);
      btn.setAttribute("aria-label", getLabel(option));
      if (!disabled) {
        btn.onclick = () => {
          onChange(option);
          rerender();
        };
      }
      group.appendChild(btn);
    }
    return group;
  };
  const rerender = () => {
    container.innerHTML = "";
    const layout = document.createElement("div");
    layout.className = "random-config versus-config";
    layout.appendChild(createLangSwitcher());
    const title = document.createElement("div");
    title.className = "config-title";
    title.textContent = t("versus");
    layout.appendChild(title);
    const columns = document.createElement("div");
    columns.className = "config-columns";
    const settings = document.createElement("div");
    settings.className = "config-settings";
    const inputSection = document.createElement("div");
    inputSection.className = "config-section";
    const inputSectionTitle = document.createElement("div");
    inputSectionTitle.className = "config-section-title";
    inputSectionTitle.textContent = t("players");
    inputSection.appendChild(inputSectionTitle);
    const p1Label = document.createElement("div");
    p1Label.className = "config-subsection-title";
    p1Label.textContent = t("player1");
    inputSection.appendChild(p1Label);
    inputSection.appendChild(
      createRadioGroup(
        INPUT_OPTIONS,
        () => config.p1Input,
        inputLabel,
        inputEmoji,
        (v2) => !isInputAvailable(v2),
        (v2) => {
          config.p1Input = v2;
          syncUrl();
        }
      )
    );
    const p2Label = document.createElement("div");
    p2Label.className = "config-subsection-title";
    p2Label.textContent = t("player2");
    inputSection.appendChild(p2Label);
    inputSection.appendChild(
      createRadioGroup(
        INPUT_OPTIONS,
        () => config.p2Input,
        inputLabel,
        inputEmoji,
        (v2) => !isInputAvailable(v2),
        (v2) => {
          config.p2Input = v2;
          syncUrl();
        }
      )
    );
    settings.appendChild(inputSection);
    const buttons = document.createElement("div");
    buttons.className = "config-buttons";
    const backBtn = document.createElement("div");
    backBtn.className = "button";
    backBtn.textContent = t("back");
    backBtn.onclick = () => history.back();
    buttons.appendChild(backBtn);
    const startBtn = document.createElement("div");
    startBtn.className = "button" + (canStart() ? "" : " disabled");
    startBtn.textContent = t("start");
    if (canStart()) {
      startBtn.onclick = () => onStart(config);
    }
    buttons.appendChild(startBtn);
    settings.appendChild(buttons);
    settings.appendChild(
      buildFormulaSettingsSection(config.randomConfig, restartSearch, [
        createRow(
          t("matchLength"),
          createNumberInput(
            config.gameDurationSeconds / 60,
            (v2) => {
              config.gameDurationSeconds = v2 * 60;
              syncUrl();
            },
            1,
            99
          )
        )
      ])
    );
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
  const onGamepadChange = () => rerender();
  window.addEventListener("gamepadconnected", onGamepadChange);
  window.addEventListener("gamepaddisconnected", onGamepadChange);
  rerender();
  return {
    cleanup: () => {
      window.removeEventListener("gamepadconnected", onGamepadChange);
      window.removeEventListener("gamepaddisconnected", onGamepadChange);
      stopClock();
      if (previewWorker) {
        previewWorker.terminate();
        previewWorker = void 0;
      }
    },
    rerender
  };
};

// src/solver/bruteStructure0.ts
var seqKey = (s) => JSON.stringify([s.antecedent, s.succedent]);
var buildStructurePath = (d, rules3, p) => {
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
      const ruleId = rId;
      if (!includes(rules3, ruleId)) continue;
      const reversed = rule.tryReverse(current2);
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
var bruteStructure0 = (d, rules3, p) => function* () {
  const result = buildStructurePath(d, rules3, p);
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
var bruteWeaken0 = (d, rules3, p) => function* () {
  if (equals3(d.result, p.result)) {
    yield proofUsing(d.result, p.deps, p.rule);
    return;
  }
  const swl2 = "swl";
  if (includes(rules3, swl2) && d.result.antecedent.length > p.result.antecedent.length && reverseStructure0[swl2].isResultDerivation(d)) {
    const step = reverseStructure0.swl.reverse(d);
    const [dep] = step.deps;
    if (dep.kind === "premise") {
      yield* map(
        bruteWeaken0(dep, rules3, p),
        (depProof) => proofUsing(step.result, [depProof], swl2)
      )();
    }
    return;
  }
  const swr2 = "swr";
  if (includes(rules3, swr2) && d.result.succedent.length > p.result.succedent.length && reverseStructure0[swr2].isResultDerivation(d)) {
    const step = reverseStructure0.swr.reverse(d);
    const [dep] = step.deps;
    if (dep.kind === "premise") {
      yield* map(
        bruteWeaken0(dep, rules3, p),
        (depProof) => proofUsing(step.result, [depProof], swr2)
      )();
    }
    return;
  }
};
var bruteAxiom0 = (d, rules3, limit) => function* () {
  for (const rule of Object.values(reverseAxiom0)) {
    if (!includes(rules3, rule.id)) {
      continue;
    }
    const result = rule.tryReverse(d);
    if (!result) {
      continue;
    }
    yield* brute0(result, rules3, limit)();
  }
};
var candidateConnectives = (rules3, sequent2) => {
  const kinds = /* @__PURE__ */ new Set();
  for (const [rId, rule] of entries(reverse0)) {
    if (!includes(rules3, rId)) continue;
    for (const kind of rule.connectives) kinds.add(kind);
  }
  for (const p of [...sequent2.antecedent, ...sequent2.succedent])
    for (const kind of connectives(p)) kinds.add(kind);
  return kinds;
};
var formulasOfOpCount = (opCount, atoms2, connectives2) => function* () {
  if (opCount === 0) {
    for (const a87 of atoms2) yield atom(a87);
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
var bruteLogic1 = (d, rules3, limit) => function* () {
  const applicableRules3 = entries(reverse1).filter(
    ([rId]) => includes(rules3, rId)
  );
  if (applicableRules3.length === 0) return;
  const atoms2 = uniq2([
    ...d.result.antecedent.flatMap(atoms),
    ...d.result.succedent.flatMap(atoms)
  ]);
  const connectives2 = candidateConnectives(rules3, d.result);
  for (let opCount = 0; opCount <= limit * 2; opCount += 1) {
    for (const formula of formulasOfOpCount(opCount, atoms2, connectives2)()) {
      for (const [, rule] of applicableRules3) {
        const result = rule.tryReverse(formula)(d);
        if (!result) continue;
        yield* brute0(result, rules3, limit)();
      }
    }
  }
};
var bruteLogic0 = (d, rules3, limit) => function* () {
  yield* flatMap(
    hypoWeaken(d),
    (hypo) => flatMap(
      bruteAxiom0(hypo, rules3, limit),
      (h) => bruteWeaken0(d, rules3, h)
    )
  )();
  for (const rule of Object.values(reverseLogic0)) {
    if (!includes(rules3, rule.id)) {
      continue;
    }
    const result = rule.tryReverse(d);
    if (!result) {
      continue;
    }
    yield* brute0(result, rules3, limit)();
  }
  yield* bruteLogic1(d, rules3, limit)();
};
var hypoStructure = (d, rules3) => function* () {
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
      const ruleId = rId;
      if (!includes(rules3, ruleId)) continue;
      const reversed = rule.tryReverse(current2);
      if (!reversed || reversed.kind !== "transformation") continue;
      const [dep] = reversed.deps;
      if (!dep || dep.kind !== "premise") continue;
      queue.push(dep);
    }
  }
};
var brute0Premise = (d, rules3, limit) => function* () {
  if (limit < 1) {
    return;
  }
  if (!isTautology2(d.result)) {
    return;
  }
  yield* flatMap(
    hypoStructure(d, rules3),
    (hypo) => flatMap(
      bruteLogic0(hypo, rules3, limit),
      (h) => bruteStructure0(d, rules3, h)
    )
  )();
};
var brute0Transformation = (d, rules3, limit) => function* () {
  const depProofs = sequence(
    d.deps.map((dep) => brute0(dep, rules3, limit - 1))
  );
  yield* map(
    depProofs,
    (proofs) => proofUsing(d.result, proofs, d.rule)
  )();
};
var brute0 = (d, rules3, limit) => function* () {
  switch (d.kind) {
    case "premise":
      yield* brute0Premise(d, rules3, limit)();
      break;
    case "transformation": {
      const rule = d.rule;
      if (includes(rules3, rule)) {
        yield* brute0Transformation({ ...d, rule }, rules3, limit)();
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
  const gen = bruteSearch(c);
  while (true) {
    const { done, value } = gen.next();
    if (done === true) return value;
  }
};

// src/random/challenge.ts
var RULES = rules2;
var SOLVER_RULES = RULES.filter(
  (r) => !isReverseId1(r)
);
var STRUCTURAL_RULES = /* @__PURE__ */ new Set([
  "swl",
  "swr",
  "sRotLB",
  "sRotRB"
]);
var countNonStructural = (d) => {
  if (d.kind === "premise") return 0;
  const self = STRUCTURAL_RULES.has(d.rule) ? 0 : 1;
  return self + d.deps.reduce((sum, dep) => sum + countNonStructural(dep), 0);
};
var random2 = (size = 10, minDifficulty = 8) => () => {
  const rules3 = RULES;
  let solution87;
  while (typeof solution87 === "undefined") {
    ;
    [solution87] = head2(
      flatMap(
        filter(repeatIO(random(size)), isTautology),
        (tautology) => {
          const [proof, difficulty] = brute({
            goal: conclusion(tautology),
            rules: SOLVER_RULES
          });
          return difficulty < minDifficulty ? empty() : of(proof);
        }
      )
    );
  }
  return {
    rules: rules3,
    goal: solution87.result,
    solution: solution87
  };
};
var bellRandom = (min, max, center3) => {
  const mid = center3 ?? (min + max) / 2;
  const stddev = Math.max(max - mid, mid - min) / 3;
  let value;
  do {
    const u1 = Math.random();
    const u2 = Math.random();
    const z78 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    value = Math.round(mid + z78 * stddev);
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
  const rules3 = RULES;
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
        challenge: { rules: rules3, goal: conclusion(formula) },
        nonStructuralCount: 0,
        bypassed: true,
        formulasTried,
        tautologiesFound,
        solved
      };
    }
    if (!isTautology(formula)) continue;
    tautologiesFound += 1;
    const solver = bruteSearch({
      goal: conclusion(formula),
      rules: SOLVER_RULES
    });
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
      challenge: { rules: rules3, goal: proof.result, solution: proof },
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
      const gen = randomConfiguredStep(looseConfig, () => 1e3);
      while (true) {
        const { done, value } = gen.next();
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
var current = { cleanup: () => {
}, rerender: () => {
} };
var enterMode = (mode) => {
  session.enter(mode, factory[mode]());
};
var navigate = (screen) => {
  current.cleanup();
  if (screen === "menu") {
    setGazeModeActive(false);
    session.returnToMenu();
  }
  if (screen === "random") {
    pool.configure(defaultRandomConfig());
  }
  if (includes(gameModes, screen)) {
    enterMode(screen);
  }
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
    if (screen === "random-config") {
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
    if (screen === "versus-config" || screen === "versus") {
      for (const key of [
        "symbols",
        "connectives",
        "formula_size",
        "proof_size",
        "chaoticity",
        "versus_time",
        "versus_p1",
        "versus_p2"
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
    case "secret":
      current = mountSecret(body, navigate);
      break;
    case "system":
      current = mountSystem(body, navigate);
      break;
    case "versus": {
      const vConfig = parseVersusConfigFromParams(
        new URLSearchParams(window.location.search)
      );
      pool.configure(vConfig.randomConfig);
      current = mountVersus(body, navigate, pool, vConfig);
      break;
    }
    case "versus-config":
      current = mountVersusConfig(body, navigate, (versusConfig) => {
        current.cleanup();
        pool.configure(versusConfig.randomConfig);
        const params = new URLSearchParams();
        const lang = new URLSearchParams(window.location.search).get("lang");
        if (lang !== null) params.set("lang", lang);
        params.set("mode", "versus");
        setVersusConfigParams(versusConfig, params);
        history.pushState({ screen: "versus" }, "", `?${params.toString()}`);
        mount("versus");
      });
      break;
    case "random-config":
      current = mountRandomConfig(body, navigate, (config) => {
        pool.configure(config);
        current.cleanup();
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
    mount(mode);
  } else if (mode === "random-config") {
    mount("random-config");
  } else if (mode === "secret") {
    mount("secret");
  } else if (mode === "system") {
    mount("system");
  } else if (mode === "versus") {
    mount("versus");
  } else if (mode === "versus-config") {
    mount("versus-config");
  } else if (params.get("level") !== null) {
    enterMode("campaign");
    mount("campaign");
  } else {
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
  mount(screen);
});
