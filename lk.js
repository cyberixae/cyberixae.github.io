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
var isFrozen = (start, path) => start !== null && subDerivation(start, path)?.kind === "transformation";
var canUndo = (s, start = null) => {
  const path = activePath(s);
  const current2 = subDerivation(s.derivation, path);
  if (current2?.kind === "transformation") {
    return !isFrozen(start, path);
  }
  if (isNonEmptyArray(path)) {
    return !isFrozen(start, init(path));
  }
  return false;
};
var undo = (s, start = null) => {
  const path = activePath(s);
  const current2 = subDerivation(s.derivation, path);
  if (current2?.kind === "transformation") {
    if (isFrozen(start, path)) {
      return s;
    }
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
    if (isFrozen(start, parentPath)) {
      return s;
    }
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
var reset = (s, start = null) => {
  return focus(start ?? premise(s.derivation.result));
};
var applyEvent = (state, ev, start = null) => {
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
      state = undo(state, start);
      break;
    case "reset":
      state = reset(state, start);
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
    const f2 = focus(conf.start ?? premise(conf.goal));
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
  // The presolved foundation, when the challenge has one: Undo/Reset floor
  // here and the renderer shows its nodes frozen.
  currentStart() {
    return get(this.theorems, this.selected).start;
  }
  // Whether undo would change anything (false at the bare goal and at a
  // presolved floor) — for honest Undo-button rendering.
  canUndo() {
    return canUndo(this.currentConjecture(), this.currentStart() ?? null);
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
      this.conjectures[id] = focus(conf.start ?? premise(conf.goal));
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
    const update = applyEvent(cursor, ev, this.currentStart() ?? null);
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
    const update = applyEvent(cursor, ev, this.currentStart() ?? null);
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
  random: "Zen",
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
  matchSetup: "Match Setup",
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
  randomConfig: "Zen",
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
  challengeSetup: "Challenge Setup",
  lemmaConfirm: "Confirm",
  lemma: "Claim",
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
  npc: "NPC",
  tutor: "Tutor",
  inputOff: "Off",
  tutorial: "Tutorial",
  tutorialBasics: "Basics",
  tutorialLogic: "Destruct Rules",
  tutorialPart: "Part",
  tutorialAdvance: "Next Topic",
  tutorialPrevious: "Previous Topic",
  tutorialOneMore: "One More Challenge",
  tutorialIdentity: "Identity",
  tutorialConstants: "Constants",
  tutorialExtras: "Extras",
  tutorialShape1: "Splitting",
  tutorialShape2: "Side flip",
  tutorialShape3: "Dividing",
  tutorialShape4: "Branching",
  tutorialShape5: "Shattering",
  tutorialOwlBasics: "Welcome to LK! In its challenges you close derivation trees built out of sequents. This first chapter teaches the essentials you need to play.",
  tutorialOwlLogic: "The second chapter is about dropping the extra connectives ( \u2192 \u2227 \u2228 \xAC ). If you would rather jump straight into the deep end, you can head for the real game as soon as you have found the {destruct} button. The subchapters walk through the consequences of dropping each connective in different situations, one at a time.",
  tutorialOwlClose: "A branch of the tree can be closed when the same sentence sits on both sides of the gate ( \u22A2 ) \u2014 this situation is called an identity. You can switch branches with the {branch} buttons and close the chosen branch with the {close} button.",
  tutorialOwlCloseConstants: "Constant sentences can sometimes close a branch on their own \u2014 Falsum ( \u22A5 ) when it sits alone on the left side of the gate, and Verum ( \u22A4 ) when it sits alone on the right.",
  tutorialOwlDrop: "Any extra sentences on a branch must always be dropped before the branch can close. Remove them by picking the sentence to drop with the {pick} buttons, then pressing the {drop} button repeatedly until the picked sentence falls off the tree. If you drop a sentence the branch needs for closing, you can undo your move by pressing {undo}.",
  tutorialOwlSplit: "You can drop a connective by picking a sentence with the {pick} buttons, then pressing {destruct} repeatedly until the outermost connective of the picked sentence falls off the tree. Dropping a Conjunction ( \u2227 ) on the left side of the gate, or a Disjunction ( \u2228 ) on the right, causes no further consequences \u2014 the pieces stay where they were.",
  tutorialOwlSideFlip: "Dropping a Negation ( \xAC ) makes the remaining sentence move to the other side of the gate.",
  tutorialOwlCrossing: "Dropping an Implication ( \u2192 ) on the right side of the gate divides its parts across the two sides of the gate.",
  tutorialOwlBranching: "Dropping a Conjunction ( \u2227 ) on the right side of the gate, or a Disjunction ( \u2228 ) on the left, makes the tree branch.",
  tutorialOwlBranchingCrossing: "Dropping an Implication ( \u2192 ) on the left side of the gate shatters the sentence: the most intricate of the rules combines both the parts dividing across the gate and the tree branching.",
  tutorialComplete: "Graduation",
  tutorialStart: "Start",
  tutorialOwlDone: "The tutorial is complete! You now know everything you need to play. Have fun!"
};
var fi = {
  title: "LK",
  random: "Zen",
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
  matchSetup: "Ottelun asetukset",
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
  randomConfig: "Zen",
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
  challengeSetup: "Haasteen asetukset",
  lemmaConfirm: "Vahvista",
  lemma: "V\xE4it\xE4",
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
  npc: "NPC",
  tutor: "Tuutori",
  inputOff: "Pois",
  tutorial: "Opastus",
  tutorialBasics: "Perusteet",
  tutorialLogic: "Purkus\xE4\xE4nn\xF6t",
  tutorialPart: "Osa",
  tutorialAdvance: "Seuraava aihe",
  tutorialPrevious: "Edellinen aihe",
  tutorialOneMore: "Viel\xE4 yksi haaste",
  tutorialIdentity: "Identiteetti",
  tutorialConstants: "Vakiot",
  tutorialExtras: "Ylim\xE4\xE4r\xE4iset",
  tutorialShape1: "Halkeaminen",
  tutorialShape2: "Puolenvaihto",
  tutorialShape3: "Jakautuminen",
  tutorialShape4: "Haarautuminen",
  tutorialShape5: "Sirpaloituminen",
  tutorialOwlBasics: "Tervetuloa pelaamaan LK:ta! Pelin haasteissa suljetaan sekventeist\xE4 koostuvia p\xE4\xE4ttelypuita. Ensimm\xE4isess\xE4 luvussa opimme pelaamisen kannalta v\xE4ltt\xE4m\xE4tt\xF6mi\xE4 perusasioita.",
  tutorialOwlLogic: "Toisessa luvussa k\xE4sittelemme ylim\xE4\xE4r\xE4isten konnektiivien ( \u2192 \u2227 \u2228 \xAC ) pudottamista. Mik\xE4li haluat hyp\xE4t\xE4 suoraan syv\xE4\xE4n p\xE4\xE4tyyn, voit v\xE4litt\xF6m\xE4sti {destruct} painikkeen l\xF6ydetty\xE4si siirty\xE4 pelaamaan varsinaista peli\xE4. T\xE4m\xE4n luvun aliluvuissa k\xE4yd\xE4\xE4n yksitellen l\xE4pi eri konnektiivien pudottamisen seuraamuksia eri tilanteissa.",
  tutorialOwlClose: "P\xE4\xE4ttelypuun oksa on suljettavissa silloin, kun portin ( \u22A2 ) kummallakin puolella on sama lause \u2014 t\xE4llaista tilannetta kutsutaan identiteetiksi. Voit vaihtaa oksaa {branch} painikkeilla ja sulkea valitun oksan {close} painikkeella.",
  tutorialOwlCloseConstants: "Vakiolauseet mahdollistavat joskus oksan sulkemisen yksin\xE4\xE4n \u2014 Falsum ( \u22A5 ) ollessaan yksin portin vasemmalla puolella, ja Verum ( \u22A4 ) ollessaan yksin portin oikealla puolella.",
  tutorialOwlDrop: "Oksan sis\xE4lt\xE4m\xE4t ylim\xE4\xE4r\xE4iset lauseet on aina pudotettava ennen kuin oksan voi sulkea. Saat ylim\xE4\xE4r\xE4iset lauseet poistettua valitsemalla pudotettavan lauseen {pick} painikkeilla, ja painamalla sen j\xE4lkeen {drop} painiketta toistuvasti, kunnes valittu lause putoaa puusta. Mik\xE4li pudotat oksan sulkemiseen tarvittavan lauseen, voit perua siirtosi painamalla {undo} painiketta.",
  tutorialOwlSplit: "Voit pudottaa konnektiivin valitsemalla lauseen {pick} painikkeilla, ja painamalla sen j\xE4lkeen {destruct} toistuvasti, kunnes valitun lauseen uloin konnektiivi putoaa puusta. Konjunktion ( \u2227 ) pudottaminen portin vasemmalla puolella tai Disjunktion ( \u2228 ) pudottaminen portin oikealla puolella ei aiheuta sen kummempia seuraamuksia \u2014 osat j\xE4\xE4v\xE4t paikoilleen.",
  tutorialOwlSideFlip: "Negaation ( \xAC ) pudottaminen aiheuttaa j\xE4ljelle j\xE4\xE4v\xE4n lauseen siirtymisen portin toiselle puolelle.",
  tutorialOwlCrossing: "Implikaation ( \u2192 ) pudottaminen portin oikealta puolelta aiheuttaa lauseen osien jakautumisen kahdelle puolelle porttia.",
  tutorialOwlBranching: "Konjunktion ( \u2227 ) pudottaminen portin oikealla puolella tai Disjunktion ( \u2228 ) pudottaminen portin vasemmalla puolella aiheuttaa puun haarautumisen.",
  tutorialOwlBranchingCrossing: "Implikaation ( \u2192 ) pudottaminen portin vasemmalta puolelta sirpaloittaa lauseen: s\xE4\xE4nn\xF6ist\xE4 monimutkaisin yhdist\xE4\xE4 sek\xE4 osien jakautumisen portin eri puolille ett\xE4 puun haarautumisen.",
  tutorialComplete: "Valmistujaiset",
  tutorialStart: "Aloita",
  tutorialOwlDone: "Opastus on suoritettu! Tied\xE4t nyt kaiken, mit\xE4 pelaamiseen tarvitaan. Pid\xE4 hauskaa!"
};
var es = {
  title: "LK",
  random: "Zen",
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
  matchSetup: "Configuraci\xF3n de partida",
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
  randomConfig: "Zen",
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
  challengeSetup: "Configuraci\xF3n del desaf\xEDo",
  lemmaConfirm: "Confirmar",
  lemma: "Afirmar",
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
  npc: "NPC",
  tutor: "Tutor",
  inputOff: "Desactivado",
  tutorial: "Tutorial",
  tutorialBasics: "Fundamentos",
  tutorialLogic: "Reglas de destrucci\xF3n",
  tutorialPart: "Parte",
  tutorialAdvance: "Siguiente tema",
  tutorialPrevious: "Tema anterior",
  tutorialOneMore: "Un desaf\xEDo m\xE1s",
  tutorialIdentity: "Identidad",
  tutorialConstants: "Constantes",
  tutorialExtras: "Sobrantes",
  tutorialShape1: "Partici\xF3n",
  tutorialShape2: "Cambio de lado",
  tutorialShape3: "Reparto",
  tutorialShape4: "Ramificaci\xF3n",
  tutorialShape5: "Fragmentaci\xF3n",
  tutorialOwlBasics: "\xA1Bienvenido a LK! En los desaf\xEDos del juego se cierran \xE1rboles de deducci\xF3n compuestos de secuentes. En este primer cap\xEDtulo aprendemos lo b\xE1sico imprescindible para jugar.",
  tutorialOwlLogic: "En el segundo cap\xEDtulo tratamos c\xF3mo soltar los conectivos sobrantes ( \u2192 \u2227 \u2228 \xAC ). Si prefieres lanzarte a lo hondo, en cuanto encuentres el bot\xF3n {destruct} puedes pasar directamente al juego de verdad. Los subcap\xEDtulos repasan una a una las consecuencias de soltar cada conectivo en distintas situaciones.",
  tutorialOwlClose: "Una rama del \xE1rbol se puede cerrar cuando a ambos lados de la puerta ( \u22A2 ) est\xE1 la misma oraci\xF3n \u2014 esta situaci\xF3n se llama identidad. Puedes cambiar de rama con los botones {branch} y cerrar la rama elegida con el bot\xF3n {close}.",
  tutorialOwlCloseConstants: "Las oraciones constantes a veces permiten cerrar una rama por s\xED solas: Falsum ( \u22A5 ) cuando est\xE1 solo a la izquierda de la puerta, y Verum ( \u22A4 ) cuando est\xE1 solo a la derecha.",
  tutorialOwlDrop: "Las oraciones sobrantes de una rama deben soltarse siempre antes de poder cerrarla. Elim\xEDnalas eligiendo la oraci\xF3n a soltar con los botones {pick} y pulsando despu\xE9s el bot\xF3n {drop} repetidamente, hasta que la oraci\xF3n elegida caiga del \xE1rbol. Si sueltas una oraci\xF3n necesaria para cerrar la rama, puedes deshacer el movimiento pulsando {undo}.",
  tutorialOwlSplit: "Puedes soltar un conectivo eligiendo una oraci\xF3n con los botones {pick} y pulsando despu\xE9s {destruct} repetidamente, hasta que el conectivo m\xE1s externo de la oraci\xF3n elegida caiga del \xE1rbol. Soltar una Conjunci\xF3n ( \u2227 ) en el lado izquierdo de la puerta, o una Disyunci\xF3n ( \u2228 ) en el derecho, no tiene mayores consecuencias: las piezas se quedan donde estaban.",
  tutorialOwlSideFlip: "Soltar una Negaci\xF3n ( \xAC ) hace que la oraci\xF3n restante pase al otro lado de la puerta.",
  tutorialOwlCrossing: "Soltar una Implicaci\xF3n ( \u2192 ) en el lado derecho de la puerta reparte sus partes entre los dos lados de la puerta.",
  tutorialOwlBranching: "Soltar una Conjunci\xF3n ( \u2227 ) en el lado derecho de la puerta, o una Disyunci\xF3n ( \u2228 ) en el izquierdo, ramifica el \xE1rbol.",
  tutorialOwlBranchingCrossing: "Soltar una Implicaci\xF3n ( \u2192 ) en el lado izquierdo de la puerta fragmenta la oraci\xF3n: la regla m\xE1s compleja combina el reparto de las partes entre ambos lados y la ramificaci\xF3n del \xE1rbol.",
  tutorialComplete: "Graduaci\xF3n",
  tutorialStart: "Empezar",
  tutorialOwlDone: "\xA1Tutorial completado! Ya sabes todo lo que necesitas para jugar. \xA1Divi\xE9rtete!"
};
var cs = {
  title: "LK",
  random: "Zen",
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
  matchSetup: "Nastaven\xED z\xE1pasu",
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
  randomConfig: "Zen",
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
  challengeSetup: "Nastaven\xED v\xFDzvy",
  lemmaConfirm: "Potvrdit",
  lemma: "Tvrdit",
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
  npc: "NPC",
  tutor: "Tutor",
  inputOff: "Vypnuto",
  tutorial: "N\xE1vod",
  tutorialBasics: "Z\xE1klady",
  tutorialLogic: "Pravidla ni\u010Den\xED",
  tutorialPart: "\u010C\xE1st",
  tutorialAdvance: "Dal\u0161\xED t\xE9ma",
  tutorialPrevious: "P\u0159edchoz\xED t\xE9ma",
  tutorialOneMore: "Je\u0161t\u011B jedna v\xFDzva",
  tutorialIdentity: "Identita",
  tutorialConstants: "Konstanty",
  tutorialExtras: "P\u0159ebytky",
  tutorialShape1: "Roz\u0161t\u011Bpen\xED",
  tutorialShape2: "Zm\u011Bna strany",
  tutorialShape3: "Rozd\u011Blen\xED",
  tutorialShape4: "V\u011Btven\xED",
  tutorialShape5: "T\u0159\xED\u0161t\u011Bn\xED",
  tutorialOwlBasics: "V\xEDtej ve h\u0159e LK! V jej\xEDch v\xFDzv\xE1ch se zav\xEDraj\xED odvozovac\xED stromy slo\u017Een\xE9 ze sekvent\u016F. V t\xE9to prvn\xED kapitole se nau\u010D\xEDme z\xE1klady, bez kter\xFDch se hr\xE1t ned\xE1.",
  tutorialOwlLogic: "Ve druh\xE9 kapitole se v\u011Bnujeme pou\u0161t\u011Bn\xED p\u0159ebyte\u010Dn\xFDch spojek ( \u2192 \u2227 \u2228 \xAC ). Chce\u0161-li sko\u010Dit rovnou do hlubin, m\u016F\u017Ee\u0161 hned po nalezen\xED tla\u010D\xEDtka {destruct} p\u0159ej\xEDt ke skute\u010Dn\xE9 h\u0159e. Podkapitoly prob\xEDraj\xED jednu po druh\xE9 d\u016Fsledky pu\u0161t\u011Bn\xED jednotliv\xFDch spojek v r\u016Fzn\xFDch situac\xEDch.",
  tutorialOwlClose: "V\u011Btev stromu lze zav\u0159\xEDt, kdy\u017E na obou stran\xE1ch br\xE1ny ( \u22A2 ) stoj\xED stejn\xE1 v\u011Bta \u2014 takov\xE9 situaci se \u0159\xEDk\xE1 identita. V\u011Btev p\u0159epne\u0161 tla\u010D\xEDtky {branch} a vybranou v\u011Btev zav\u0159e\u0161 tla\u010D\xEDtkem {close}.",
  tutorialOwlCloseConstants: "Konstantn\xED v\u011Bty n\u011Bkdy dok\xE1\u017Eou zav\u0159\xEDt v\u011Btev samy \u2014 Falsum ( \u22A5 ), kdy\u017E stoj\xED samo vlevo od br\xE1ny, a Verum ( \u22A4 ), kdy\u017E stoj\xED samo vpravo.",
  tutorialOwlDrop: "P\u0159ebyte\u010Dn\xE9 v\u011Bty na v\u011Btvi je v\u017Edy nutn\xE9 pustit, ne\u017E ji lze zav\u0159\xEDt. Odstran\xED\u0161 je tak, \u017Ee tla\u010D\xEDtky {pick} vybere\u0161 v\u011Btu k pu\u0161t\u011Bn\xED a pak opakovan\u011B ma\u010Dk\xE1\u0161 tla\u010D\xEDtko {drop}, dokud vybran\xE1 v\u011Bta nespadne ze stromu. Pokud pust\xED\u0161 v\u011Btu pot\u0159ebnou k zav\u0159en\xED v\u011Btve, m\u016F\u017Ee\u0161 tah vr\xE1tit tla\u010D\xEDtkem {undo}.",
  tutorialOwlSplit: "Spojku pust\xED\u0161 tak, \u017Ee tla\u010D\xEDtky {pick} vybere\u0161 v\u011Btu a pak opakovan\u011B ma\u010Dk\xE1\u0161 {destruct}, dokud vn\u011Bj\u0161\xED spojka vybran\xE9 v\u011Bty nespadne ze stromu. Pu\u0161t\u011Bn\xED Konjunkce ( \u2227 ) na lev\xE9 stran\u011B br\xE1ny nebo Disjunkce ( \u2228 ) na prav\xE9 nem\xE1 \u017E\xE1dn\xE9 zvl\xE1\u0161tn\xED n\xE1sledky \u2014 \u010D\xE1sti z\u016Fst\xE1vaj\xED na m\xEDst\u011B.",
  tutorialOwlSideFlip: "Pu\u0161t\u011Bn\xED Negace ( \xAC ) p\u0159esune zb\xFDvaj\xEDc\xED v\u011Btu na druhou stranu br\xE1ny.",
  tutorialOwlCrossing: "Pu\u0161t\u011Bn\xED Implikace ( \u2192 ) na prav\xE9 stran\u011B br\xE1ny rozd\u011Bl\xED jej\xED \u010D\xE1sti na ob\u011B strany br\xE1ny.",
  tutorialOwlBranching: "Pu\u0161t\u011Bn\xED Konjunkce ( \u2227 ) na prav\xE9 stran\u011B br\xE1ny nebo Disjunkce ( \u2228 ) na lev\xE9 rozv\u011Btv\xED strom.",
  tutorialOwlBranchingCrossing: "Pu\u0161t\u011Bn\xED Implikace ( \u2192 ) na lev\xE9 stran\u011B br\xE1ny v\u011Btu rozt\u0159\xED\u0161t\xED: nejslo\u017Eit\u011Bj\u0161\xED z pravidel spojuje jak rozd\u011Blen\xED \u010D\xE1st\xED na ob\u011B strany br\xE1ny, tak v\u011Btven\xED stromu.",
  tutorialComplete: "Promoce",
  tutorialStart: "Za\u010D\xEDt",
  tutorialOwlDone: "N\xE1vod je u konce! Te\u010F v\xED\u0161 v\u0161e, co ke hran\xED pot\u0159ebuje\u0161. Bav se!"
};
var pl = {
  title: "LK",
  random: "Zen",
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
  matchSetup: "Ustawienia meczu",
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
  randomConfig: "Zen",
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
  challengeSetup: "Ustawienia wyzwania",
  lemmaConfirm: "Zatwierd\u017A",
  lemma: "Twierd\u017A",
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
  npc: "NPC",
  tutor: "Tutor",
  inputOff: "Wy\u0142\u0105czony",
  tutorial: "Samouczek",
  tutorialBasics: "Podstawy",
  tutorialLogic: "Zasady niszczenia",
  tutorialPart: "Cz\u0119\u015B\u0107",
  tutorialAdvance: "Nast\u0119pny temat",
  tutorialPrevious: "Poprzedni temat",
  tutorialOneMore: "Jeszcze jedno wyzwanie",
  tutorialIdentity: "To\u017Csamo\u015B\u0107",
  tutorialConstants: "Sta\u0142e",
  tutorialExtras: "Zb\u0119dne",
  tutorialShape1: "Rozszczepienie",
  tutorialShape2: "Zmiana strony",
  tutorialShape3: "Rozdzielenie",
  tutorialShape4: "Rozga\u0142\u0119zienie",
  tutorialShape5: "Rozbicie",
  tutorialOwlBasics: "Witaj w grze LK! W jej wyzwaniach zamyka si\u0119 drzewa wnioskowania zbudowane z sekwent\xF3w. W tym pierwszym rozdziale poznajemy podstawy niezb\u0119dne do gry.",
  tutorialOwlLogic: "W drugim rozdziale zajmujemy si\u0119 upuszczaniem zb\u0119dnych sp\xF3jnik\xF3w ( \u2192 \u2227 \u2228 \xAC ). Je\u015Bli wolisz skoczy\u0107 na g\u0142\u0119bok\u0105 wod\u0119, zaraz po znalezieniu przycisku {destruct} mo\u017Cesz przej\u015B\u0107 do w\u0142a\u015Bciwej gry. Podrozdzia\u0142y omawiaj\u0105 po kolei skutki upuszczania poszczeg\xF3lnych sp\xF3jnik\xF3w w r\xF3\u017Cnych sytuacjach.",
  tutorialOwlClose: "Ga\u0142\u0105\u017A drzewa mo\u017Cna zamkn\u0105\u0107, gdy po obu stronach bramy ( \u22A2 ) stoi to samo zdanie \u2014 tak\u0105 sytuacj\u0119 nazywamy to\u017Csamo\u015Bci\u0105. Ga\u0142\u0105\u017A zmieniasz przyciskami {branch}, a wybran\u0105 ga\u0142\u0105\u017A zamykasz przyciskiem {close}.",
  tutorialOwlCloseConstants: "Zdania sta\u0142e czasem pozwalaj\u0105 zamkn\u0105\u0107 ga\u0142\u0105\u017A samodzielnie \u2014 Falsum ( \u22A5 ), gdy stoi samo po lewej stronie bramy, i Verum ( \u22A4 ), gdy stoi samo po prawej.",
  tutorialOwlDrop: "Zb\u0119dne zdania na ga\u0142\u0119zi trzeba zawsze upu\u015Bci\u0107, zanim da si\u0119 j\u0105 zamkn\u0105\u0107. Usuniesz je, wybieraj\u0105c zdanie do upuszczenia przyciskami {pick}, a nast\u0119pnie naciskaj\u0105c przycisk {drop} wielokrotnie, a\u017C wybrane zdanie spadnie z drzewa. Je\u015Bli upu\u015Bcisz zdanie potrzebne do zamkni\u0119cia ga\u0142\u0119zi, mo\u017Cesz cofn\u0105\u0107 ruch przyciskiem {undo}.",
  tutorialOwlSplit: "Sp\xF3jnik upuszczasz, wybieraj\u0105c zdanie przyciskami {pick}, a nast\u0119pnie naciskaj\u0105c {destruct} wielokrotnie, a\u017C zewn\u0119trzny sp\xF3jnik wybranego zdania spadnie z drzewa. Upuszczenie Koniunkcji ( \u2227 ) po lewej stronie bramy lub Alternatywy ( \u2228 ) po prawej nie ma szczeg\xF3lnych nast\u0119pstw \u2014 cz\u0119\u015Bci zostaj\u0105 na miejscu.",
  tutorialOwlSideFlip: "Upuszczenie Negacji ( \xAC ) przenosi pozosta\u0142e zdanie na drug\u0105 stron\u0119 bramy.",
  tutorialOwlCrossing: "Upuszczenie Implikacji ( \u2192 ) po prawej stronie bramy rozdziela jej cz\u0119\u015Bci na obie strony bramy.",
  tutorialOwlBranching: "Upuszczenie Koniunkcji ( \u2227 ) po prawej stronie bramy lub Alternatywy ( \u2228 ) po lewej rozga\u0142\u0119zia drzewo.",
  tutorialOwlBranchingCrossing: "Upuszczenie Implikacji ( \u2192 ) po lewej stronie bramy rozbija zdanie: najbardziej z\u0142o\u017Cona z regu\u0142 \u0142\u0105czy rozdzielenie cz\u0119\u015Bci na obie strony bramy i rozga\u0142\u0119zienie drzewa.",
  tutorialComplete: "Zako\u0144czenie",
  tutorialStart: "Rozpocznij",
  tutorialOwlDone: "Samouczek uko\u0144czony! Wiesz ju\u017C wszystko, czego potrzeba do gry. Mi\u0142ej zabawy!"
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

// src/web/button-cursor.ts
var clamp = (v2, lo, hi) => Math.max(lo, Math.min(hi, v2));
var cursorNavActions = /* @__PURE__ */ new Set([
  "gazeLeft",
  "gazeRight",
  "gazeConnective",
  "gazeWeakening",
  "leftRotateLeft",
  "leftRotateRight",
  "leftConnective",
  "leftWeakening"
]);
var createButtonCursor = (rows, opts = {}) => {
  let row = opts.startRow ?? 0;
  let col = opts.startCol ?? 0;
  let visible = false;
  const refresh = () => {
    for (const r of rows) {
      for (const cell of r) cell.btn.classList.remove("cursor");
    }
    const focused = visible ? rows[row]?.[col] : void 0;
    if (focused !== void 0) focused.btn.classList.add("cursor");
  };
  const reveal = () => {
    if (visible) return false;
    visible = true;
    row = opts.startRow ?? 0;
    col = opts.startCol ?? 0;
    refresh();
    return true;
  };
  const move = (dRow, dCol) => {
    if (reveal() && opts.moveOnReveal !== true) return;
    row = clamp(row + dRow, 0, rows.length - 1);
    const r = rows[row];
    if (r !== void 0) col = clamp(col + dCol, 0, r.length - 1);
    refresh();
  };
  const activate = () => {
    if (reveal()) return;
    const cell = rows[row]?.[col];
    if (cell !== void 0 && (cell.isEnabled?.() ?? true)) cell.activate();
  };
  const onAction = (action) => {
    switch (action) {
      case "gazeLeft":
      case "leftRotateLeft":
        move(0, -1);
        break;
      case "gazeRight":
      case "leftRotateRight":
        move(0, 1);
        break;
      case "gazeConnective":
      case "leftConnective":
        move(-1, 0);
        break;
      case "gazeWeakening":
      case "leftWeakening":
        move(1, 0);
        break;
      case "axiom":
        activate();
        break;
    }
  };
  const isEngaged = () => visible;
  return { onAction, refresh, isEngaged };
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
function hole(text) {
  return { text, active: false, connective: false, hole: true };
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
    if (s.hole === true) {
      return `<span class="hole">${escape(s.text)}</span>`;
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
  verum: null,
  hole: null
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
  hole: ["\u25A2"],
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

// src/render/draft.ts
var precedence2 = (d) => {
  switch (d.kind) {
    case "hole":
    case "atom":
    case "falsum":
    case "verum":
      return 4;
    case "negation":
      return 3;
    case "conjunction":
    case "disjunction":
      return 2;
    case "implication":
      return 1;
  }
};
var fromHole = () => (theme) => {
  const [s0] = theme.hole;
  return [hole(s0)];
};
var expand2 = (minPrec, operand) => {
  if (operand.kind === "atom" || operand.kind === "hole")
    return fromDraft(operand);
  return precedence2(operand) >= minPrec ? print("optional")(fromDraft(operand)) : print("parenthesis")(fromDraft(operand));
};
function fromDraft(d) {
  switch (d.kind) {
    case "hole":
      return fromHole();
    case "atom":
      return fromAtom(d);
    case "falsum":
      return fromFalsum(d);
    case "verum":
      return fromVerum(d);
    case "negation":
      return printUnary("negation", false, true)(expand2(3, d.negand));
    case "conjunction":
      return printBinary(
        "conjunction",
        false,
        true
      )(expand2(3, d.leftConjunct), expand2(3, d.rightConjunct));
    case "disjunction":
      return printBinary(
        "disjunction",
        false,
        true
      )(expand2(3, d.leftDisjunct), expand2(3, d.rightDisjunct));
    case "implication":
      return printBinary(
        "implication",
        false,
        true
      )(expand2(2, d.antecedent), expand2(2, d.consequent));
  }
}
var spliceSequent = (ant, suc) => {
  const p = print("sequent")(
    printArray("formulas")(ant),
    printArray("formulas")(suc)
  );
  return (theme) => trim(p(theme));
};
var lemmaGhostPremises = (goal87, d) => {
  const ant = goal87.antecedent.map((f2) => fromProp(f2));
  const suc = goal87.succedent.map((f2) => fromProp(f2));
  return [
    spliceSequent(ant, [...suc, fromDraft(d)]),
    spliceSequent([fromDraft(d), ...ant], suc)
  ];
};

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
var renderDerivation = (derivation, activePath2, gaze = null, currentPath = [], ghostPath = null, start = null, draftPremises = null) => {
  const isGhostBoundary = ghostPath !== null && equalPaths(currentPath, ghostPath);
  const isGhostNode = ghostPath !== null && currentPath.length > ghostPath.length && startsWith(currentPath, ghostPath);
  const isActive = equalPaths(currentPath, activePath2) || isGhostBoundary;
  const isOpenActive = isActive && derivation.kind === "premise" && !isGhostBoundary;
  const isClosedActive = isActive && derivation.kind === "transformation" && !isGhostBoundary;
  const isFrozen2 = start !== null && subDerivation(start, currentPath)?.kind === "transformation";
  const node = document.createElement("div");
  const cls = "tree-node" + (isOpenActive ? " tree-active" : "") + (isClosedActive ? " tree-closed-active" : "") + (isGhostBoundary ? " tree-active" : "") + (isGhostNode ? " ghost-node" : "") + (isFrozen2 ? " tree-frozen" : "");
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
        ghostPath,
        start,
        draftPremises
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
  } else if (draftPremises !== null && isOpenActive) {
    const premises = document.createElement("div");
    premises.setAttribute("class", "tree-premises");
    for (const printer of draftPremises) {
      const child = document.createElement("div");
      child.setAttribute("class", "tree-node ghost-node");
      const seqEl = document.createElement("div");
      seqEl.setAttribute("class", "tree-sequent ghost");
      seqEl.innerHTML = html(printer(basic));
      child.appendChild(seqEl);
      child.dataset["leafDepth"] = "0";
      premises.appendChild(child);
    }
    node.appendChild(premises);
    node.appendChild(renderInferenceLine("cut", true));
    node.appendChild(renderSequent(derivation, true, null, false));
    leafDepth = 1;
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

// src/model/draft.ts
var hole2 = { kind: "hole" };
var draftNegation = (negand) => ({
  kind: "negation",
  negand
});
var draftImplication = (antecedent, consequent) => ({
  kind: "implication",
  antecedent,
  consequent
});
var draftConjunction = (leftConjunct, rightConjunct) => ({
  kind: "conjunction",
  leftConjunct,
  rightConjunct
});
var draftDisjunction = (leftDisjunct, rightDisjunct) => ({
  kind: "disjunction",
  leftDisjunct,
  rightDisjunct
});
var fillLeftmost = (d, filler) => {
  switch (d.kind) {
    case "hole":
      return filler;
    case "atom":
    case "falsum":
    case "verum":
      return null;
    case "negation": {
      const negand = fillLeftmost(d.negand, filler);
      return negand === null ? null : draftNegation(negand);
    }
    case "implication": {
      const antecedent = fillLeftmost(d.antecedent, filler);
      if (antecedent !== null) return draftImplication(antecedent, d.consequent);
      const consequent = fillLeftmost(d.consequent, filler);
      return consequent === null ? null : draftImplication(d.antecedent, consequent);
    }
    case "conjunction": {
      const leftConjunct = fillLeftmost(d.leftConjunct, filler);
      if (leftConjunct !== null)
        return draftConjunction(leftConjunct, d.rightConjunct);
      const rightConjunct = fillLeftmost(d.rightConjunct, filler);
      return rightConjunct === null ? null : draftConjunction(d.leftConjunct, rightConjunct);
    }
    case "disjunction": {
      const leftDisjunct = fillLeftmost(d.leftDisjunct, filler);
      if (leftDisjunct !== null)
        return draftDisjunction(leftDisjunct, d.rightDisjunct);
      const rightDisjunct = fillLeftmost(d.rightDisjunct, filler);
      return rightDisjunct === null ? null : draftDisjunction(d.leftDisjunct, rightDisjunct);
    }
  }
};
var fillOrWrap = (d, piece) => {
  const filled = fillLeftmost(d, piece);
  return filled !== null ? filled : fillLeftmost(piece, d);
};
var toProp = (d) => {
  switch (d.kind) {
    case "hole":
      return null;
    case "atom":
    case "falsum":
    case "verum":
      return d;
    case "negation": {
      const negand = toProp(d.negand);
      return negand === null ? null : negation(negand);
    }
    case "implication": {
      const antecedent = toProp(d.antecedent);
      const consequent = toProp(d.consequent);
      return antecedent === null || consequent === null ? null : implication(antecedent, consequent);
    }
    case "conjunction": {
      const leftConjunct = toProp(d.leftConjunct);
      const rightConjunct = toProp(d.rightConjunct);
      return leftConjunct === null || rightConjunct === null ? null : conjunction(leftConjunct, rightConjunct);
    }
    case "disjunction": {
      const leftDisjunct = toProp(d.leftDisjunct);
      const rightDisjunct = toProp(d.rightDisjunct);
      return leftDisjunct === null || rightDisjunct === null ? null : disjunction(leftDisjunct, rightDisjunct);
    }
  }
};
var isComplete = (d) => toProp(d) !== null;

// src/web/lemma-editor.ts
var atomNames = ["p", "q", "r", "s", "u", "v"];
var cellSpecs = [
  { kind: "cancel", group: 0 },
  ...atomNames.map(
    (name2) => ({
      kind: "fill",
      group: 1,
      label: html(fromAtom(atom(name2))(basic)),
      piece: () => atom(name2),
      leaf: true
    })
  ),
  { kind: "fill", group: 2, label: "\u22A5", piece: () => falsum, leaf: true },
  { kind: "fill", group: 2, label: "\u22A4", piece: () => verum, leaf: true },
  {
    kind: "fill",
    group: 3,
    label: "\xAC",
    piece: () => draftNegation(hole2),
    leaf: false
  },
  {
    kind: "fill",
    group: 4,
    label: "\u2227",
    piece: () => draftConjunction(hole2, hole2),
    leaf: false
  },
  {
    kind: "fill",
    group: 4,
    label: "\u2228",
    piece: () => draftDisjunction(hole2, hole2),
    leaf: false
  },
  {
    kind: "fill",
    group: 4,
    label: "\u2192",
    piece: () => draftImplication(hole2, hole2),
    leaf: false
  },
  { kind: "undo", group: 5 },
  { kind: "confirm", group: 6 }
];
var REVEAL_INDEX = 1;
var lastGroup = cellSpecs[cellSpecs.length - 1]?.group ?? 0;
var firstIndexOfGroup = (g) => {
  const i88 = cellSpecs.findIndex((c) => c.group === g);
  return i88 < 0 ? 0 : i88;
};
var clamp2 = (v2, lo, hi) => Math.max(lo, Math.min(hi, v2));
var editorKeyPieces = {
  Digit1: () => atom("p"),
  Digit2: () => atom("q"),
  Digit3: () => atom("r"),
  Digit4: () => atom("s"),
  Digit5: () => atom("u"),
  Digit6: () => atom("v"),
  KeyS: () => draftNegation(hole2),
  KeyF: () => draftConjunction(hole2, hole2),
  KeyG: () => falsum,
  KeyH: () => verum,
  KeyJ: () => draftDisjunction(hole2, hole2),
  KeyL: () => draftImplication(hole2, hole2)
};
var createLemmaEditorSession = (onConfirm, onCancel) => {
  let current2 = hole2;
  let history2 = [];
  let cursorIndex = null;
  const fill = (piece) => {
    const next2 = fillOrWrap(current2, piece);
    if (next2 === null) return false;
    history2 = [...history2, current2];
    current2 = next2;
    return true;
  };
  const undo3 = () => {
    const prev2 = history2[history2.length - 1];
    if (prev2 === void 0) return false;
    current2 = prev2;
    history2 = history2.slice(0, -1);
    return true;
  };
  const confirm = () => {
    const formula = toProp(current2);
    if (formula === null) return false;
    onConfirm(formula);
    return true;
  };
  const reveal = () => {
    if (cursorIndex !== null) return false;
    cursorIndex = REVEAL_INDEX;
    return true;
  };
  const moveCursor = (delta) => {
    if (reveal()) return true;
    if (cursorIndex === null) return false;
    cursorIndex = clamp2(cursorIndex + delta, 0, cellSpecs.length - 1);
    return true;
  };
  const groupJump = (dir) => {
    if (reveal()) return true;
    if (cursorIndex === null) return false;
    const g = cellSpecs[cursorIndex]?.group ?? 0;
    cursorIndex = firstIndexOfGroup(clamp2(g + dir, 0, lastGroup));
    return true;
  };
  const activate = () => {
    if (reveal()) return true;
    if (cursorIndex === null) return false;
    const spec = cellSpecs[cursorIndex];
    if (spec === void 0) return false;
    switch (spec.kind) {
      case "cancel":
        onCancel();
        return false;
      case "fill":
        return fill(spec.piece());
      case "undo":
        return undo3();
      case "confirm":
        confirm();
        return false;
    }
  };
  const handleAction = (action) => {
    switch (action) {
      case "gazeLeft":
      case "leftRotateLeft":
        return moveCursor(-1);
      case "gazeRight":
      case "leftRotateRight":
        return moveCursor(1);
      case "prevBranch":
        return groupJump(-1);
      case "nextBranch":
        return groupJump(1);
      case "axiom":
        return activate();
      default:
        return false;
    }
  };
  return {
    draft: () => current2,
    canUndo: () => history2.length > 0,
    fill,
    undo: undo3,
    confirm,
    cancel: onCancel,
    cursor: () => cursorIndex,
    handleAction
  };
};
var makeButton = (label, disabled, onClick) => {
  const btn = document.createElement("pre");
  btn.setAttribute("class", "button" + (disabled ? " disabled" : ""));
  btn.innerHTML = label;
  if (!disabled) btn.onclick = onClick;
  return btn;
};
var createLemmaEditorBar = (session2, rerender) => {
  const bar = document.createElement("div");
  bar.setAttribute("class", "controls lemma-editor");
  const full2 = isComplete(session2.draft());
  const cursor = session2.cursor();
  let groupEl = null;
  let groupNo = -1;
  cellSpecs.forEach((spec, i88) => {
    if (spec.group !== groupNo) {
      groupNo = spec.group;
      groupEl = document.createElement("div");
      const palette = spec.kind === "fill" ? " lemma-palette" : "";
      groupEl.setAttribute("class", "controls-group" + palette);
      bar.appendChild(groupEl);
    }
    const btn = (() => {
      switch (spec.kind) {
        case "cancel": {
          const b = makeButton(t("back"), false, () => {
            session2.cancel();
          });
          b.classList.add("inert");
          return b;
        }
        case "fill": {
          const b = makeButton(spec.label, spec.leaf && full2, () => {
            if (session2.fill(spec.piece())) rerender();
          });
          b.classList.add("inert");
          return b;
        }
        case "undo": {
          const b = makeButton(t("undo"), !session2.canUndo(), () => {
            if (session2.undo()) rerender();
          });
          b.classList.add("inert");
          return b;
        }
        case "confirm": {
          const b = makeButton(t("lemmaConfirm"), !full2, () => {
            session2.confirm();
          });
          b.classList.add("mutating");
          return b;
        }
      }
    })();
    if (cursor === i88) btn.classList.add("cursor");
    groupEl?.appendChild(btn);
  });
  return bar;
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
var gazeKeyFamily = /* @__PURE__ */ new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Enter",
  "Backspace"
]);
var gazeKeyHint = (action) => {
  for (const [code, a87] of Object.entries(qwertyKeyMap)) {
    if (a87 === action && gazeKeyFamily.has(code)) return codeToLabel(code);
  }
  return actionKeyHint[action];
};
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
var gazePadHint = (action) => actionPadHintGaze[action];
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
var createButton = (label, disabled, onClick) => {
  const el = document.createElement("pre");
  el.setAttribute("class", "button" + (disabled ? " disabled" : ""));
  if (!disabled && onClick) el.onclick = onClick;
  if (typeof label === "string") {
    el.innerHTML = label;
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
var createPlayArea = (workspace, ctx, draftPremises = null) => {
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
  const tree2 = renderDerivation(
    derivation,
    path,
    gaze,
    [],
    ghostPath,
    workspace.currentStart() ?? null,
    draftPremises
  );
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
var createBench = (workspace, makeCongrats, controlsEl, rerender, onMenu, onApplyReverse1, hideLemma, ctx = defaultCtx, onSkip, hideGaze, hideRulesButton, lemmaEditor = null) => {
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
  if (!solved && hideRulesButton !== true) {
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
  const editing = lemmaEditor !== null && !solved;
  const draftPremises = editing ? lemmaGhostPremises(seq, lemmaEditor.draft()) : null;
  panel.appendChild(createPlayArea(workspace, ctx, draftPremises));
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
  const gazeLeftBtn = createButton(t("left"), leftDisabled, () => {
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
  });
  const gazeRightBtn = createButton(t("right"), rightDisabled, () => {
    if (!ctx.isGazeModeActive()) {
      ctx.setGazeModeActive(true);
      workspace.setGaze({ side: "right", index: 0 });
    } else {
      workspace.moveGaze(1);
    }
    rerender();
  });
  const gazeWeakeningBtn = createButton(
    t("drop"),
    !ctx.isGazeModeActive() || inactive,
    () => {
      workspace.setGazeKind("weakening");
      applyGazeRule(workspace, "weakening");
      rerender();
    }
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
    }
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
    }
  );
  const lemmaDisabled = inactive || onApplyReverse1 === void 0 || !ls.includes("cut");
  const lemmaBtn = createButton(t("lemma"), lemmaDisabled, () => {
    if (onApplyReverse1 === void 0) return;
    onApplyReverse1("cut", (formula) => {
      workspace.applyEvent(reverse12("cut", formula));
      rerender();
    });
  });
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
  const prevBranchBtn = createButton(t("prevBranch"), !canSwitch, () => {
    workspace.applyEvent(prevBranch());
    rerender();
  });
  const nextBranchBtn = createButton(t("nextBranch"), !canSwitch, () => {
    workspace.applyEvent(nextBranch());
    rerender();
  });
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
  if (editing) {
    panel.appendChild(createLemmaEditorBar(lemmaEditor, rerender));
    return panel;
  }
  const controlsBar = document.createElement("div");
  controlsBar.setAttribute("class", "controls");
  if (congrats) {
    congrats.buttons.setAttribute("class", "congrabuttons controls-group");
    controlsBar.appendChild(congrats.buttons);
  } else {
    if (onSkip !== void 0) controlsBar.appendChild(miscGroup);
    controlsBar.appendChild(navGroup);
    if (hideGaze !== true) controlsBar.appendChild(gazeGroup);
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
var createPausePopup = (onResume, onExit, onSettings, onCustom) => {
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
  const cells = [];
  const addButton = (el, activate, isEnabled) => {
    buttons.appendChild(el);
    cells.push({ btn: el, activate, isEnabled });
  };
  addButton(
    createButton(t("resumeGame"), false, onResume),
    onResume,
    () => true
  );
  const spacer = document.createElement("div");
  spacer.setAttribute("class", "pause-buttons-spacer");
  buttons.appendChild(spacer);
  if (onCustom) {
    addButton(
      createButton(t("challengeSetup"), false, onCustom),
      onCustom,
      () => true
    );
  }
  if (onSettings) {
    addButton(
      createButton(t("challengeSetup"), false, onSettings),
      onSettings,
      () => true
    );
  }
  addButton(
    createButton(t("exitToMainMenu"), false, onExit),
    onExit,
    () => true
  );
  panel.appendChild(buttons);
  shroud.appendChild(panel);
  shroud.appendChild(createLangSwitcher());
  const cursor = createButtonCursor(cells.map((c) => [c]));
  return { el: shroud, onAction: cursor.onAction };
};
var RULE_APPLY_ACTIONS = /* @__PURE__ */ new Set([
  "leftWeakening",
  "leftConnective",
  "leftRotateRight",
  "rightWeakening",
  "rightConnective",
  "rightRotateLeft"
]);
var createDispatch = (getWorkspace, rerender, navigate2, onSolved, onLevel, onMenu, onApplyReverse1, ctx = defaultCtx, onJustSolved, blockGaze) => (action) => {
  if (blockGaze !== void 0 && blockGaze() && (action === "gazeLeft" || action === "gazeRight" || action === "gazeConnective" || action === "gazeWeakening")) {
    return;
  }
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
  } else if (ctx.isGazeModeActive() && RULE_APPLY_ACTIONS.has(action)) {
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

// src/web/menu.ts
var mountMenu = (container, navigate2) => {
  let clicks = 0;
  let cursor = null;
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
    const cells = [];
    const addMode = (label, activate) => {
      const btn = document.createElement("div");
      btn.setAttribute("class", "button menu-mode");
      btn.textContent = label;
      btn.onclick = activate;
      modes.appendChild(btn);
      cells.push({ btn, activate });
    };
    addMode(t("versus"), () => navigate2("versus-config"));
    addMode(t("random"), () => navigate2("random"));
    addMode(t("tutorial"), () => navigate2("tutorial"));
    panel.appendChild(modes);
    container.appendChild(panel);
    cursor = createButtonCursor(cells.map((c) => [c]));
  };
  render();
  const handleKey = (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    markKeyboardInput();
    const action = qwertyKeyMap[ev.code];
    if (action !== void 0) cursor?.onAction(action);
  };
  document.addEventListener("keydown", handleKey);
  const cleanupGamepad = setupGamepad((action) => cursor?.onAction(action));
  return {
    cleanup: () => {
      document.removeEventListener("keydown", handleKey);
      cleanupGamepad();
    },
    rerender: render
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
  const canUndo2 = ws.canUndo();
  const undoEnabled = canUndo2 || isGazeModeActive();
  const panel = document.createElement("div");
  panel.setAttribute("class", "controls");
  if (showLevelButton) {
    panel.appendChild(createButton(t("level"), false, onLevel));
  }
  const undoBtn = createButton(t("undo"), !undoEnabled, () => {
    if (canUndo2) {
      ws.applyEvent({ kind: "undo" });
    } else {
      setGazeModeActive(false);
    }
    rerender();
  });
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
  const cells = [];
  const addButton = (label, activate) => {
    const el = createButton(label, false, activate);
    buttons.appendChild(el);
    cells.push({ btn: el, activate });
  };
  addButton(
    { long: t("prevLevel"), short: t("prevLevelShort") },
    () => selectLevel(ws.previousConjectureId())
  );
  addButton({ long: t("playAgain"), short: t("playAgainShort") }, () => {
    ws.applyEvent(reset2());
    rerender();
  });
  addButton(
    { long: t("nextLevel"), short: t("nextLevelShort") },
    () => selectLevel(ws.nextConjectureId())
  );
  const cursor = createButtonCursor([cells]);
  return {
    hurray,
    buttons,
    onAction: cursor.onAction,
    isEngaged: cursor.isEngaged
  };
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
      lemmaSession = null;
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
  let pausePopup = null;
  let congrats = null;
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
  let lemmaSession = null;
  const onApplyReverse1 = (_key, onFormula) => {
    if (lemmaSession !== null) return;
    setGazeModeActive(false);
    lemmaSession = createLemmaEditorSession(
      (formula) => {
        lemmaSession = null;
        onFormula(formula);
      },
      () => {
        lemmaSession = null;
        rerender();
      }
    );
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
      levelPresses >= 2,
      () => toggleLevel(listingEl)
    );
    const makeCongrats = () => {
      const c = createCongrats(ws, selectLevel, rerender);
      congrats = c;
      return c;
    };
    container.appendChild(
      createBench(
        ws,
        makeCongrats,
        controlsEl,
        rerender,
        togglePausePopup,
        onApplyReverse1,
        true,
        void 0,
        void 0,
        void 0,
        void 0,
        lemmaSession
      )
    );
    if (pausePopupOpen) {
      if (!pausePopup) {
        pausePopup = createPausePopup(closePausePopup, exitToMenu);
      }
      container.appendChild(pausePopup.el);
    } else {
      pausePopup = null;
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
    if (lemmaSession !== null) {
      const session3 = lemmaSession;
      if (action === "undo") {
        if (session3.undo()) rerender();
        else session3.cancel();
      } else if (action === "menu" || action === "exit") {
        session3.cancel();
      } else if (session3.handleAction(action)) {
        rerender();
      }
      return;
    }
    if (action === "exit") {
      if (pausePopupOpen) exitToMenu();
      return;
    }
    if (action === "undo" && pausePopupOpen) {
      closePausePopup();
      return;
    }
    if (pausePopupOpen && action !== "menu") {
      pausePopup?.onAction(action);
      return;
    }
    if (ws.isSolved() && congrats) {
      if (cursorNavActions.has(action)) {
        congrats.onAction(action);
        return;
      }
      if (action === "axiom" && congrats.isEngaged()) {
        congrats.onAction("axiom");
        return;
      }
    }
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
    if (lemmaSession !== null) {
      const piece = editorKeyPieces[ev.code];
      if (piece !== void 0) {
        if (lemmaSession.fill(piece())) rerender();
        return;
      }
    }
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
  const canUndo2 = ws.canUndo();
  const undoEnabled = canUndo2 || isGazeModeActive();
  const panel = document.createElement("div");
  panel.setAttribute("class", "controls");
  const undoBtn = createButton(t("undo"), !undoEnabled, () => {
    if (canUndo2) {
      ws.applyEvent({ kind: "undo" });
    } else {
      setGazeModeActive(false);
    }
    rerender();
  });
  undoBtn.classList.add("mutating");
  panel.appendChild(undoBtn);
  return panel;
};
var createCongrats2 = (onRetry, onNew, onSettings) => {
  const hurray = document.createElement("div");
  hurray.setAttribute("class", "hurray");
  hurray.innerHTML = t("congratulations");
  const buttons = document.createElement("div");
  buttons.setAttribute("class", "congrabuttons");
  const cells = [];
  const addButton = (label, activate) => {
    const el = createButton(label, false, activate);
    buttons.appendChild(el);
    cells.push({ btn: el, activate });
  };
  addButton(t("challengeSetup"), onSettings);
  addButton(t("playAgain"), onRetry);
  addButton(t("newChallenge"), onNew);
  const cursor = createButtonCursor([cells]);
  return {
    hurray,
    buttons,
    onAction: cursor.onAction,
    isEngaged: cursor.isEngaged
  };
};
var mountRandom = (container, navigate2, session2, onNewChallenge) => {
  setDefaultRulesVisible(false);
  const getWorkspace = () => session2.workspace;
  const onNew = () => {
    onNewChallenge();
    setGazeModeActive(false);
    lemmaSession = null;
    rerender();
  };
  let pausePopupOpen = false;
  let pausePopup = null;
  let congrats = null;
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
  const onRetry = () => {
    getWorkspace().applyEvent(reset2());
    setGazeModeActive(false);
    rerender();
  };
  const freshFromPopup = () => {
    pausePopupOpen = false;
    onNew();
  };
  let lemmaSession = null;
  const onApplyReverse1 = (_key, onFormula) => {
    if (lemmaSession !== null) return;
    setGazeModeActive(false);
    lemmaSession = createLemmaEditorSession(
      (formula) => {
        lemmaSession = null;
        onFormula(formula);
      },
      () => {
        lemmaSession = null;
        rerender();
      }
    );
    rerender();
  };
  const rerender = () => {
    const ws = getWorkspace();
    container.innerHTML = "";
    const controlsEl = createControls2(getWorkspace, rerender);
    const makeCongrats = () => {
      const c = createCongrats2(onRetry, onNew, openSettings);
      congrats = c;
      return c;
    };
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
        freshFromPopup,
        void 0,
        void 0,
        lemmaSession
      )
    );
    if (pausePopupOpen) {
      if (!pausePopup) {
        pausePopup = createPausePopup(closePausePopup, exitToMenu, openSettings);
      }
      container.appendChild(pausePopup.el);
    } else {
      pausePopup = null;
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
    if (lemmaSession !== null) {
      const session3 = lemmaSession;
      if (action === "undo") {
        if (session3.undo()) rerender();
        else session3.cancel();
      } else if (action === "menu" || action === "exit") {
        session3.cancel();
      } else if (session3.handleAction(action)) {
        rerender();
      }
      return;
    }
    if (action === "exit") {
      if (pausePopupOpen) exitToMenu();
      return;
    }
    if (action === "undo" && pausePopupOpen) {
      closePausePopup();
      return;
    }
    if (pausePopupOpen && action !== "menu") {
      pausePopup?.onAction(action);
      return;
    }
    if (getWorkspace().isSolved() && congrats) {
      if (cursorNavActions.has(action)) {
        congrats.onAction(action);
        return;
      }
      if (action === "axiom" && congrats.isEngaged()) {
        congrats.onAction("axiom");
        return;
      }
    }
    baseDispatch(action);
  };
  rerender();
  const handleKey = (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    markKeyboardInput();
    if (lemmaSession !== null) {
      const piece = editorKeyPieces[ev.code];
      if (piece !== void 0) {
        if (lemmaSession.fill(piece())) rerender();
        return;
      }
    }
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
    const campaignBtn = document.createElement("div");
    campaignBtn.setAttribute("class", "button menu-mode");
    campaignBtn.innerHTML = t("campaign");
    campaignBtn.onclick = () => navigate2("campaign");
    modes.appendChild(campaignBtn);
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

// src/model/closure.ts
var sidedRules = (p) => fold(p, {
  atom: () => ({ left: [], right: [] }),
  falsum: () => ({ left: ["f"], right: [] }),
  verum: () => ({ left: [], right: ["v"] }),
  negation: (body) => ({
    left: ["nl", ...body.right],
    right: ["nr", ...body.left]
  }),
  implication: (antecedent, consequent) => ({
    left: ["il", ...antecedent.right, ...consequent.left],
    right: ["ir", ...antecedent.left, ...consequent.right]
  }),
  conjunction: (leftConjunct, rightConjunct) => ({
    left: ["cl", ...leftConjunct.left, ...rightConjunct.left],
    right: ["cr", ...leftConjunct.right, ...rightConjunct.right]
  }),
  disjunction: (leftDisjunct, rightDisjunct) => ({
    left: ["dl", ...leftDisjunct.left, ...rightDisjunct.left],
    right: ["dr", ...leftDisjunct.right, ...rightDisjunct.right]
  })
});
var reachableRules = (s) => uniq2([
  ...s.antecedent.flatMap((p) => sidedRules(p).left),
  ...s.succedent.flatMap((p) => sidedRules(p).right)
]);

// src/model/presolve.ts
var CLOSINGS = /* @__PURE__ */ new Set(["i", "f", "v"]);
var NON_STRUCTURAL = /* @__PURE__ */ new Set([
  "nl",
  "nr",
  "cl",
  "cr",
  "dl",
  "dr",
  "il",
  "ir",
  "cut"
]);
var pruneClosings = (d) => {
  if (d.kind === "premise") return d;
  if (CLOSINGS.has(d.rule)) return premise(d.result);
  return { ...d, deps: d.deps.map(pruneClosings) };
};
var containsNonStructural = (d) => d.kind === "transformation" && (NON_STRUCTURAL.has(d.rule) || d.deps.some(containsNonStructural));
var pruneStructural = (d) => {
  if (d.kind === "premise") return d;
  if (!containsNonStructural(d)) return premise(d.result);
  return { ...d, deps: d.deps.map(pruneStructural) };
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
var bruteLimit = (c, maxLimit) => {
  for (let limit = 0; limit <= maxLimit; limit += 1) {
    const proof = tryAtDepth(c, limit);
    if (proof) return [proof];
  }
  return [];
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

// src/random/tutorial.ts
var tutorialRules = rules2.filter((r) => r !== "cut");
var ATOMS = {
  p: 3,
  q: 2,
  r: 1,
  s: 0,
  u: 0,
  v: 0,
  falsum: 0,
  verum: 0
};
var NONE = {
  negation: 0,
  implication: 0,
  conjunction: 0,
  disjunction: 0
};
var P = atom("p");
var Q = atom("q");
var logicNotches = [
  {
    // Same-side split: conjunction-left and disjunction-right — two pieces
    // that stay put. With no gate-flipping connective in the weights, the
    // per-side weights alone keep every candidate inside the clamp.
    glyphs: "\u2227 \u2228",
    featured: ["cl", "dr"],
    taught: ["cl", "dr"],
    anteConnectives: { ...NONE, conjunction: 1 },
    succConnectives: { ...NONE, disjunction: 1 },
    symbols: ATOMS,
    maxFormulaSize: 2,
    minAnte: 0,
    fallback: sequent([conjunction(P, Q)], [P])
  },
  {
    // Whole-formula gate-flip: negation on either side. From here on the
    // flip means any taught connective can legally sit on either side when
    // negations carry it to its legal polarity (e.g. ¬(A∧B) on the RIGHT
    // flips the conjunction to the left, where cl is taught) — so both
    // sides weight every taught connective and the closure filter rejects
    // the wrong-polarity placements.
    glyphs: "\xAC",
    featured: ["nl", "nr"],
    taught: ["cl", "dr", "nl", "nr"],
    anteConnectives: { ...NONE, conjunction: 1, disjunction: 1, negation: 2 },
    succConnectives: { ...NONE, conjunction: 1, disjunction: 1, negation: 2 },
    symbols: ATOMS,
    maxFormulaSize: 2,
    minAnte: 0,
    fallback: sequent([P], [negation(negation(P))])
  },
  {
    // Cross-gate split: implication-right — split and one piece hops the
    // gate. The bridge to real `⊢ A→B` goals (implication weight covers the
    // antecedent too: ¬(A→B) on the left is legal via the flip).
    glyphs: "\u2192",
    featured: ["ir"],
    taught: ["cl", "dr", "nl", "nr", "ir"],
    anteConnectives: {
      conjunction: 1,
      disjunction: 1,
      negation: 1,
      implication: 1
    },
    succConnectives: {
      conjunction: 1,
      disjunction: 1,
      negation: 1,
      implication: 2
    },
    symbols: ATOMS,
    maxFormulaSize: 2,
    minAnte: 0,
    fallback: sequent([], [implication(P, P)])
  },
  {
    // Branching split: conjunction-right and disjunction-left — the proof
    // forks. Same mirror as subchapter 1, now on the branching sides.
    glyphs: "\u2227 \u2228",
    featured: ["cr", "dl"],
    taught: ["cl", "dr", "nl", "nr", "ir", "cr", "dl"],
    anteConnectives: {
      conjunction: 1,
      disjunction: 1,
      negation: 1,
      implication: 1
    },
    succConnectives: {
      conjunction: 1,
      disjunction: 1,
      negation: 1,
      implication: 1
    },
    symbols: ATOMS,
    maxFormulaSize: 2,
    minAnte: 0,
    fallback: sequent([disjunction(P, Q)], [disjunction(Q, P)])
  },
  {
    // The capstone: implication-left — gate-crossing and branching combined.
    // Its simplest isolating goals are the modus-ponens shape `p→q, p ⊢ q`.
    glyphs: "\u2192",
    featured: ["il"],
    taught: ["cl", "dr", "nl", "nr", "ir", "cr", "dl", "il"],
    anteConnectives: {
      conjunction: 1,
      disjunction: 1,
      negation: 1,
      implication: 3
    },
    succConnectives: {
      conjunction: 1,
      disjunction: 1,
      negation: 1,
      implication: 1
    },
    symbols: ATOMS,
    maxFormulaSize: 2,
    minAnte: 1,
    fallback: sequent([implication(P, Q), P], [Q])
  }
];
var constantsNotch = {
  glyphs: "\u22A5 \u22A4",
  featured: ["f", "v"],
  taught: ["cl", "dr", "nl", "nr", "ir", "cr", "dl", "f", "v"],
  anteConnectives: {
    conjunction: 1,
    disjunction: 1,
    negation: 1,
    implication: 1
  },
  succConnectives: {
    conjunction: 1,
    disjunction: 1,
    negation: 1,
    implication: 1
  },
  symbols: { ...ATOMS, falsum: 2, verum: 2 },
  maxFormulaSize: 2,
  minAnte: 0,
  fallback: sequent([disjunction(falsum, P)], [P])
};
var MAX_LIMIT = 3;
var MAX_TRIES = 1e3;
var MAX_FORMULAS = 3;
var randomCount = () => Math.floor(Math.random() * 3);
var makeFormula = (weights, notch) => {
  const size = Math.floor(Math.random() * (notch.maxFormulaSize + 1));
  return randomWeighted(size, weights, notch.symbols)();
};
var subformulas = (f2) => {
  switch (f2.kind) {
    case "atom":
    case "falsum":
    case "verum":
      return [f2];
    case "negation":
      return [f2, ...subformulas(f2.negand)];
    case "implication":
      return [f2, ...subformulas(f2.antecedent), ...subformulas(f2.consequent)];
    case "conjunction":
      return [
        f2,
        ...subformulas(f2.leftConjunct),
        ...subformulas(f2.rightConjunct)
      ];
    case "disjunction":
      return [
        f2,
        ...subformulas(f2.leftDisjunct),
        ...subformulas(f2.rightDisjunct)
      ];
  }
};
var pick = (xs) => xs[Math.floor(Math.random() * xs.length)];
var asResult = (solution87, formulasTried) => ({
  challenge: { rules: tutorialRules, goal: solution87.result, solution: solution87 },
  nonStructuralCount: countNonStructural(solution87),
  bypassed: false,
  formulasTried
});
var fallbackChallenge = (notch) => {
  const [solution87] = brute({ goal: notch.fallback, rules: tutorialRules });
  return asResult(solution87, 0);
};
var generateSequentChallenge = (notch) => {
  for (let tries = 0; tries < MAX_TRIES; tries += 1) {
    const nAnte = Math.max(notch.minAnte, randomCount());
    const nSucc = randomCount();
    if (nAnte + nSucc === 0 || nAnte + nSucc > MAX_FORMULAS) continue;
    const antecedent = Array.from(
      { length: nAnte },
      () => makeFormula(notch.anteConnectives, notch)
    );
    const borrowPool = antecedent.flatMap(subformulas);
    const succedent = Array.from({ length: nSucc }, () => {
      const borrowed = borrowPool.length > 0 && Math.random() < 0.5 ? pick(borrowPool) : void 0;
      return borrowed ?? makeFormula(notch.succConnectives, notch);
    });
    const goal87 = sequent(antecedent, succedent);
    const closure = reachableRules(goal87);
    if (!closure.every((r) => notch.taught.includes(r))) continue;
    if (!notch.featured.some((r) => closure.includes(r))) continue;
    if (!isTautology2(goal87)) continue;
    const [solution87] = bruteLimit({ goal: goal87, rules: tutorialRules }, MAX_LIMIT);
    if (solution87 === void 0) continue;
    const dodgeRules = tutorialRules.filter((r) => !notch.featured.includes(r));
    const [dodge] = bruteLimit({ goal: goal87, rules: dodgeRules }, MAX_LIMIT);
    if (dodge !== void 0) continue;
    return asResult(solution87, tries + 1);
  }
  return fallbackChallenge(notch);
};
var frontierLeaves = (start) => openBranches(start).flatMap((path) => {
  const node = subDerivation(start, path);
  return node === null ? [] : [node.result];
});
var isAtomic = (seq) => [...seq.antecedent, ...seq.succedent].every((f2) => f2.kind === "atom");
var needsDrop = (seq) => seq.antecedent.length + seq.succedent.length > 2;
var needsRotation = (seq) => {
  const keepLeft = seq.antecedent[0];
  const keepRight = seq.succedent[seq.succedent.length - 1];
  if (keepLeft === void 0 || keepRight === void 0) return false;
  return !equals(keepLeft, keepRight);
};
var BASICS_TRIES = 50;
var isConstantClose = (seq) => seq.antecedent.length === 1 && seq.succedent.length === 0 && seq.antecedent[0]?.kind === "falsum" || seq.antecedent.length === 0 && seq.succedent.length === 1 && seq.succedent[0]?.kind === "verum";
var isCompositeClose = (seq) => seq.antecedent.some((f2) => f2.kind !== "atom");
var TEMPLATE_WEIGHTS = {
  negation: 1,
  implication: 0,
  conjunction: 1,
  disjunction: 1
};
var templateFormula = (notch, compound) => {
  for (; ; ) {
    const size = compound ? Math.floor(Math.random() * notch.maxFormulaSize) + 1 : Math.random() < 0.8 ? 0 : Math.floor(Math.random() * notch.maxFormulaSize) + 1;
    const f2 = randomWeighted(size, TEMPLATE_WEIGHTS, notch.symbols)();
    if (!compound || f2.kind !== "atom") return f2;
  }
};
var identityTemplate = (notch) => {
  const compound = templateFormula(notch, true);
  const other = templateFormula(notch, false);
  const [a87, b] = Math.random() < 0.5 ? [compound, other] : [other, compound];
  const goal87 = Math.random() < 0.5 ? sequent([a87, b], [conjunction(a87, b)]) : sequent([disjunction(a87, b)], [a87, b]);
  const closure = reachableRules(goal87);
  if (!closure.every((r) => logicNotches[3].taught.includes(r))) return null;
  const [solution87] = bruteLimit({ goal: goal87, rules: tutorialRules }, MAX_LIMIT);
  return solution87 === void 0 ? null : asResult(solution87, 1);
};
var generateBasicsChallenge = (kind) => {
  const source = kind === "constants" ? constantsNotch : logicNotches[3];
  const prune = kind === "drop" ? pruneStructural : pruneClosings;
  for (let tries = 0; tries < BASICS_TRIES; tries += 1) {
    const res2 = kind === "identity" && Math.random() < 0.5 ? identityTemplate(source) : generateSequentChallenge(source);
    if (res2 === null) continue;
    const solution88 = res2.challenge.solution;
    if (solution88 === void 0) continue;
    const start = prune(solution88);
    if (start.kind === "premise") continue;
    const leaves = frontierLeaves(start);
    if (leaves.length < 2) continue;
    if (kind === "identity" && !leaves.some(isCompositeClose)) continue;
    if (kind === "constants" && !leaves.some(isConstantClose)) continue;
    if (kind === "drop") {
      if (!leaves.every(isAtomic)) continue;
      if (!leaves.some(needsDrop)) continue;
      if (!leaves.some(needsRotation)) continue;
    }
    return { ...res2, challenge: { ...res2.challenge, start } };
  }
  const res = fallbackChallenge(source);
  const solution87 = res.challenge.solution;
  if (solution87 === void 0) return res;
  return { ...res, challenge: { ...res.challenge, start: prune(solution87) } };
};
var LOGIC_NAME_IDS = [
  "split",
  "sideFlip",
  "crossing",
  "branching",
  "branchingCrossing"
];
var tutorialCurriculum = [
  {
    chapter: "basics",
    nameId: "identity",
    glyphs: "",
    hideGaze: true,
    generate: () => generateBasicsChallenge("identity")
  },
  {
    // Same verb as the first beat, new winning conditions — still pure
    // closing, so gaze stays hidden.
    chapter: "basics",
    nameId: "constants",
    glyphs: "",
    hideGaze: true,
    generate: () => generateBasicsChallenge("constants")
  },
  {
    chapter: "basics",
    nameId: "drop",
    glyphs: "",
    hideGaze: false,
    generate: () => generateBasicsChallenge("drop")
  },
  // No glyphs on the Logic rows: the behavior names are unique there, and
  // ladder rows should carry symbols only where the name alone is ambiguous
  // (the two Close beats).
  ...logicNotches.map((notch, i88) => ({
    chapter: "logic",
    nameId: LOGIC_NAME_IDS[i88] ?? "split",
    glyphs: "",
    hideGaze: false,
    generate: () => generateSequentChallenge(notch)
  }))
];
var beatAt = (i88) => {
  const clamped = Math.max(0, Math.min(i88, tutorialCurriculum.length - 1));
  return tutorialCurriculum[clamped] ?? tutorialCurriculum[0] ?? beatFail();
};
var beatFail = () => {
  throw new Error("empty tutorial curriculum");
};
var tutorialStops = (() => {
  const stops = [];
  let lastChapter = null;
  tutorialCurriculum.forEach((beat, i88) => {
    if (beat.chapter !== lastChapter) {
      lastChapter = beat.chapter;
      stops.push({ kind: "intro", chapter: beat.chapter });
    }
    stops.push({ kind: "beat", beatIdx: i88 });
  });
  stops.push({ kind: "intro", chapter: "done" });
  return stops;
})();
var stopAt = (i88) => {
  const clamped = Math.max(0, Math.min(i88, tutorialStops.length - 1));
  return tutorialStops[clamped] ?? tutorialStops[0] ?? stopFail();
};
var stopFail = () => {
  throw new Error("empty tutorial stop list");
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
var mountVersus = (container, navigate2, pool2, versusConfig) => {
  container.innerHTML = "";
  const root = document.createElement("div");
  container.appendChild(root);
  const isTutorial2 = versusConfig.tutorial !== void 0;
  const untimed = isTutorial2;
  let stopIdx = versusConfig.tutorial?.startStop ?? 0;
  const beatForStop = (s) => {
    for (let i88 = s; i88 < tutorialStops.length; i88 += 1) {
      const stop = tutorialStops[i88];
      if (stop !== void 0 && stop.kind === "beat") return stop.beatIdx;
    }
    return tutorialCurriculum.length - 1;
  };
  let beatIdx = isTutorial2 ? beatForStop(stopIdx) : 0;
  const onIntro = () => isTutorial2 && stopAt(stopIdx).kind === "intro";
  let tutorInput = versusConfig.tutorial?.tutorInput ?? "off";
  const takeChallenge = () => isTutorial2 ? beatAt(beatIdx).generate() : pool2.take();
  const sharedChallenges = [];
  const ensureChallenge = (i88) => {
    while (sharedChallenges.length <= i88 + 2)
      sharedChallenges.push(takeChallenge());
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
  const noRulesToggle = { toggleRulesVisible: () => {
  } };
  const learnerCtx = () => ({
    ...createBenchCtx(false, true, false, false, 1),
    ...noRulesToggle,
    getActionHint
  });
  const tutorCtx = () => ({
    ...createBenchCtx(false, true, false, false, 1),
    ...noRulesToggle,
    getActionHint: (action) => tutorInput === "off" || tutorInput === "mouse" ? void 0 : getActionHintPure(action, tutorInput !== "keyboard")
  });
  const ctx1 = isTutorial2 ? learnerCtx() : makeCtx(versusConfig.p1Input);
  const ctx2 = isTutorial2 ? tutorCtx() : makeCtx(versusConfig.p2Input);
  let timeLeft = versusConfig.gameDurationSeconds;
  let gameOver = false;
  let paused = false;
  let pauseMenu = null;
  let resultScreen = null;
  let timerEl = null;
  let lemmaSession1 = null;
  let lemmaSession2 = null;
  const isNpc1 = !isTutorial2 && versusConfig.p1Input === "npc";
  const isNpc2 = !isTutorial2 && versusConfig.p2Input === "npc";
  const tutorOff = () => isTutorial2 && tutorInput === "off";
  const hideControls1 = isTutorial2 ? false : versusConfig.p1Input !== "mouse" && !isNpc1;
  const hideControls2 = () => isTutorial2 ? tutorInput === "keyboard" || tutorInput === "gamepad1" || tutorInput === "gamepad2" : versusConfig.p2Input !== "mouse" && !isNpc2;
  let half1El = null;
  let half2El = null;
  let thermoEl = null;
  const makeUndoControls = (ws, ctx, refresh) => {
    const el = document.createElement("div");
    el.setAttribute("class", "controls");
    const canUndo2 = ws.canUndo();
    const enabled = canUndo2 || ctx.isGazeModeActive();
    const undoBtn = createButton(t("undo"), !enabled, () => {
      if (canUndo2) {
        ws.applyEvent(undo2());
      } else {
        ctx.setGazeModeActive(false);
      }
      refresh();
    });
    undoBtn.classList.add("mutating");
    el.appendChild(undoBtn);
    return el;
  };
  const buildIntroPage = () => {
    const half2 = document.createElement("div");
    half2.setAttribute("class", "versus-half");
    const page = document.createElement("div");
    page.setAttribute("class", "tutorial-intro");
    const cells = [];
    const add = (label, activate) => {
      const el = createButton(label, false, activate);
      page.appendChild(el);
      cells.push({ btn: el, activate });
    };
    const stop = stopAt(stopIdx);
    if (stopIdx <= 0) {
      add(t("tutorialStart"), () => jumpToStop(stopIdx + 1));
    } else if (stop.kind === "intro" && stop.chapter === "done") {
      add(t("exitToMainMenu"), () => navigate2("menu"));
    } else {
      add(t("tutorialPrevious"), () => jumpToStop(stopIdx - 1));
      add(t("tutorialAdvance"), () => jumpToStop(stopIdx + 1));
    }
    const cursor = createButtonCursor([cells], {
      startCol: cells.length - 1,
      moveOnReveal: true
    });
    introCursor = { onAction: cursor.onAction, isEngaged: cursor.isEngaged };
    introDefault = cells[cells.length - 1]?.activate ?? null;
    half2.appendChild(page);
    return half2;
  };
  const buildHalf1 = () => {
    if (onIntro()) return buildIntroPage();
    const half2 = document.createElement("div");
    half2.setAttribute(
      "class",
      "versus-half" + (isNpc1 ? " versus-half-npc" : "") + (hideControls1 ? " versus-half-keys" : "")
    );
    half2.appendChild(
      createBench(
        ws1,
        makeCongratsP1,
        makeUndoControls(ws1, ctx1, refreshP1),
        refreshP1,
        void 0,
        onApplyReverse1,
        // The tutorial hides Lemma outright (Cut belongs to the Input chapter);
        // a permanently-disabled button would only draw the learner's eye.
        isTutorial2,
        ctx1,
        isTutorial2 ? void 0 : skipPlayer1,
        isTutorial2 && beatAt(beatIdx).hideGaze,
        isTutorial2,
        lemmaSession1
      )
    );
    return half2;
  };
  const owlChapterKey = {
    basics: "tutorialOwlBasics",
    logic: "tutorialOwlLogic",
    done: "tutorialOwlDone"
  };
  const owlBeatKey = [
    "tutorialOwlClose",
    "tutorialOwlCloseConstants",
    "tutorialOwlDrop",
    "tutorialOwlSplit",
    "tutorialOwlSideFlip",
    "tutorialOwlCrossing",
    "tutorialOwlBranching",
    "tutorialOwlBranchingCrossing"
  ];
  const owlDevices = [
    "pointer",
    "keyboard",
    "gamepad"
  ];
  const owlBindLabels = (device) => {
    if (device === "pointer") {
      return /* @__PURE__ */ new Map([
        ["pick", `${t("left")} / ${t("right")}`],
        ["drop", t("drop")],
        ["close", t("axiom")],
        ["undo", t("undo")],
        ["destruct", t("destruct")],
        ["branch", `${t("prevBranch")} / ${t("nextBranch")}`]
      ]);
    }
    const hint = device === "keyboard" ? gazeKeyHint : gazePadHint;
    const label = (action) => hint(action) ?? "?";
    return /* @__PURE__ */ new Map([
      ["pick", `${label("gazeLeft")} ${label("gazeRight")}`],
      ["drop", label("gazeWeakening")],
      ["close", label("axiom")],
      ["undo", label("undo")],
      ["destruct", label("gazeConnective")],
      ["branch", `${label("prevBranch")} / ${label("nextBranch")}`]
    ]);
  };
  const appendOwlTemplate = (into, template) => {
    const binds = owlDevices.map((device) => [device, owlBindLabels(device)]);
    for (const part of template.split(/(\{\w+\})/)) {
      if (part === "") continue;
      const token = part.startsWith("{") && part.endsWith("}") ? part.slice(1, -1) : null;
      if (token === null || !(binds[0]?.[1].has(token) ?? false)) {
        into.appendChild(document.createTextNode(part));
        continue;
      }
      for (const [device, labels] of binds) {
        const label = labels.get(token);
        if (label === void 0) continue;
        const chip = document.createElement("span");
        chip.setAttribute("class", `owl-bind for-${device}`);
        chip.textContent = label;
        into.appendChild(chip);
      }
    }
  };
  const buildOwl = () => {
    const owl = document.createElement("div");
    owl.setAttribute("class", "tutor-owl");
    const bubble = document.createElement("div");
    bubble.setAttribute("class", "tutor-owl-bubble");
    const stop = stopAt(stopIdx);
    const beatKey = stop.kind === "beat" ? owlBeatKey[stop.beatIdx] : void 0;
    const paragraphs = stop.kind === "intro" ? [t(owlChapterKey[stop.chapter])] : beatKey === void 0 ? [] : [t(beatKey)];
    for (const text of paragraphs) {
      const para = document.createElement("div");
      para.setAttribute("class", "tutor-owl-para");
      appendOwlTemplate(para, text);
      bubble.appendChild(para);
    }
    const face = document.createElement("div");
    face.setAttribute("class", "tutor-owl-face");
    face.textContent = "\u{1F989}";
    owl.appendChild(bubble);
    owl.appendChild(face);
    return owl;
  };
  const buildHalf2 = () => {
    if (onIntro()) {
      const half3 = document.createElement("div");
      half3.setAttribute("class", "versus-half versus-half-npc versus-half-off");
      half3.appendChild(buildOwl());
      return half3;
    }
    const half2 = document.createElement("div");
    half2.setAttribute(
      "class",
      "versus-half" + (isNpc2 || tutorOff() ? " versus-half-npc" : "") + (tutorOff() ? " versus-half-off" : "") + (hideControls2() ? " versus-half-keys" : "")
    );
    half2.appendChild(
      createBench(
        ws2,
        makeCongratsP2,
        makeUndoControls(ws2, ctx2, refreshP2),
        refreshP2,
        void 0,
        onApplyReverse2,
        isTutorial2,
        ctx2,
        isTutorial2 ? void 0 : skipPlayer2,
        isTutorial2 && beatAt(beatIdx).hideGaze,
        isTutorial2,
        lemmaSession2
      )
    );
    if (isTutorial2) half2.appendChild(buildOwl());
    return half2;
  };
  const buildThermo = () => {
    if (isTutorial2) return buildTutorialThermo();
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
    const cells = [];
    const addButton = (label, activate) => {
      const el = createButton(label, false, activate);
      buttons.appendChild(el);
      cells.push({ btn: el, activate });
    };
    addButton(t("resumeGame"), () => setPaused(false));
    if (isTutorial2) {
      const tutorLabel = tutorInput === "off" ? t("inputOff") : inputLabel(tutorInput);
      addButton(
        `${t("tutor")}: ${tutorLabel}`,
        () => applyTutorialTutor(nextTutorInput(tutorInput))
      );
    } else {
      addButton(t("playAgain"), () => navigate2("versus"));
      addButton(t("matchSetup"), () => navigate2("versus-config"));
    }
    addButton(t("exitToMainMenu"), () => navigate2("menu"));
    panel.appendChild(buttons);
    shroud.appendChild(panel);
    shroud.appendChild(createLangSwitcher());
    const cursor = createButtonCursor(cells.map((c) => [c]));
    return { el: shroud, onAction: cursor.onAction };
  };
  const TUTOR_INPUTS = [
    "off",
    "mouse",
    "keyboard",
    "gamepad1",
    "gamepad2"
  ];
  const nextTutorInput = (current2) => {
    const start = TUTOR_INPUTS.indexOf(current2);
    for (let step = 1; step <= TUTOR_INPUTS.length; step += 1) {
      const candidate = TUTOR_INPUTS[(start + step) % TUTOR_INPUTS.length];
      if (candidate === void 0) continue;
      if (candidate !== "off" && !isInputAvailable(candidate)) continue;
      return candidate;
    }
    return current2;
  };
  const applyTutorialTutor = (tutor) => {
    tutorInput = tutor;
    const params = new URLSearchParams(window.location.search);
    params.set("tutorial_stop", String(stopIdx));
    params.set("tutorial_tutor", tutor);
    history.replaceState(history.state, "", `?${params.toString()}`);
    pauseMenu = null;
    rerender();
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
    if (gameOver) {
      if (!resultScreen) resultScreen = buildResultScreen();
      root.appendChild(resultScreen.el);
    } else if (paused) {
      if (!pauseMenu) pauseMenu = buildPauseMenu();
      root.appendChild(pauseMenu.el);
    } else {
      pauseMenu = null;
    }
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
    const cells = [];
    const addButton = (label, activate) => {
      const el = createButton(label, false, activate);
      actions.appendChild(el);
      cells.push({ btn: el, activate });
    };
    addButton(t("matchSetup"), () => navigate2("versus-config"));
    addButton(t("playAgain"), () => navigate2("versus"));
    overlay.appendChild(actions);
    const cursor = createButtonCursor([cells]);
    return { el: overlay, onAction: cursor.onAction };
  };
  const commitScore1 = () => {
    if (isTutorial2) return;
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
    if (isTutorial2) return;
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
    if (isTutorial2) return;
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
    if (isTutorial2) return;
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
  const rerootAtBeat = (target) => {
    const clamped = Math.max(0, Math.min(target, tutorialCurriculum.length - 1));
    if (clamped === beatIdx) return;
    beatIdx = clamped;
    ctx1.setGazeModeActive(false);
    ctx2.setGazeModeActive(false);
    const fresh = Math.max(index1, index2, wsIdx1 + 1, wsIdx2 + 1);
    sharedChallenges.splice(fresh);
    pending1 = [];
    pending2 = [];
    scoreCommitted1 = false;
    scoreCommitted2 = false;
    wsIdx1 = fresh;
    index1 = fresh + 1;
    wsIdx2 = fresh;
    index2 = fresh + 1;
    ws1 = makeWorkspace(fresh);
    ws2 = makeWorkspace(fresh);
  };
  const jumpToStop = (target) => {
    const clamped = Math.max(0, Math.min(target, tutorialStops.length - 1));
    if (clamped === stopIdx) return;
    stopIdx = clamped;
    const stop = stopAt(stopIdx);
    if (stop.kind === "beat") {
      rerootAtBeat(stop.beatIdx);
    } else {
      rerootAtBeat(beatForStop(stopIdx));
    }
    rerenderHalf1();
    rerenderHalf2();
    rebuildThermo();
  };
  const stopIndexOfBeat = (beat) => tutorialStops.findIndex((s) => s.kind === "beat" && s.beatIdx === beat);
  const stopIndexOfIntro = (chapter) => tutorialStops.findIndex((s) => s.kind === "intro" && s.chapter === chapter);
  const beatNameKey = {
    identity: "tutorialIdentity",
    constants: "tutorialConstants",
    drop: "tutorialExtras",
    split: "tutorialShape1",
    sideFlip: "tutorialShape2",
    crossing: "tutorialShape3",
    branching: "tutorialShape4",
    branchingCrossing: "tutorialShape5"
  };
  const chapterKey = {
    basics: "tutorialBasics",
    logic: "tutorialLogic"
  };
  const buildTutorialThermo = () => {
    const thermo = document.createElement("div");
    thermo.setAttribute("class", "versus-thermo versus-thermo-tutorial");
    const ladder = document.createElement("div");
    ladder.setAttribute("class", "tutorial-ladder");
    let lastChapter = null;
    let chapterNo = 0;
    let beatNo = 0;
    tutorialCurriculum.forEach((beat, i88) => {
      if (beat.chapter !== lastChapter) {
        lastChapter = beat.chapter;
        chapterNo += 1;
        beatNo = 0;
        const chapter = beat.chapter;
        const introIdx = stopIndexOfIntro(chapter);
        const header = document.createElement("div");
        header.setAttribute(
          "class",
          "tutorial-ladder-chapter" + (introIdx === stopIdx ? " current" : "")
        );
        header.textContent = `${chapterNo} \xB7 ${t(chapterKey[chapter])}`;
        header.onclick = () => jumpToStop(introIdx);
        ladder.appendChild(header);
      }
      beatNo += 1;
      const currentStop = stopAt(stopIdx);
      const isCurrent = currentStop.kind === "beat" && currentStop.beatIdx === i88;
      const row = document.createElement("div");
      row.setAttribute(
        "class",
        "tutorial-ladder-row" + (isCurrent ? " current" : "")
      );
      const number = document.createElement("span");
      number.setAttribute("class", "tutorial-ladder-number");
      number.textContent = `${chapterNo}.${beatNo}`;
      row.appendChild(number);
      row.appendChild(document.createTextNode(t(beatNameKey[beat.nameId])));
      if (beat.glyphs !== "") {
        const glyphs = document.createElement("span");
        glyphs.setAttribute("class", "tutorial-ladder-glyphs");
        glyphs.textContent = beat.glyphs;
        row.appendChild(glyphs);
      }
      row.onclick = () => jumpToStop(stopIndexOfBeat(i88));
      ladder.appendChild(row);
    });
    const doneIdx = stopIndexOfIntro("done");
    const doneHeader = document.createElement("div");
    doneHeader.setAttribute(
      "class",
      "tutorial-ladder-chapter" + (doneIdx === stopIdx ? " current" : "")
    );
    doneHeader.textContent = `${chapterNo + 1} \xB7 ${t("tutorialComplete")}`;
    doneHeader.onclick = () => jumpToStop(doneIdx);
    ladder.appendChild(doneHeader);
    thermo.appendChild(ladder);
    const menuBtn = createButton("\u22EE", false, () => setPaused(true));
    menuBtn.classList.add("versus-menu-btn");
    menuBtn.setAttribute("aria-label", t("menu"));
    thermo.appendChild(menuBtn);
    return thermo;
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
  let congrats1 = null;
  let congrats2 = null;
  let introCursor = null;
  let introDefault = null;
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
    if (lemmaSession1 !== null) return;
    ctx1.setGazeModeActive(false);
    lemmaSession1 = createLemmaEditorSession(
      (formula) => {
        lemmaSession1 = null;
        onFormula(formula);
      },
      () => {
        lemmaSession1 = null;
        refreshP1();
      }
    );
    refreshP1();
  };
  const onApplyReverse2 = (_key, onFormula) => {
    if (lemmaSession2 !== null) return;
    ctx2.setGazeModeActive(false);
    lemmaSession2 = createLemmaEditorSession(
      (formula) => {
        lemmaSession2 = null;
        onFormula(formula);
      },
      () => {
        lemmaSession2 = null;
        refreshP2();
      }
    );
    refreshP2();
  };
  const gazeBlocked = () => isTutorial2 && beatAt(beatIdx).hideGaze;
  const makeCursorDispatch = (base, getWs, getCursor) => (action) => {
    if (onIntro()) {
      const cursor2 = introCursor;
      if (cursor2 !== null) {
        if (cursorNavActions.has(action)) {
          cursor2.onAction(action);
          return;
        }
        if (action === "axiom") {
          if (cursor2.isEngaged()) {
            cursor2.onAction("axiom");
          } else {
            introDefault?.();
          }
          return;
        }
      }
      return;
    }
    const cursor = getCursor();
    if (getWs().isSolved() && cursor !== null) {
      if (cursorNavActions.has(action)) {
        cursor.onAction(action);
        return;
      }
      if (action === "axiom" && cursor.isEngaged()) {
        cursor.onAction("axiom");
        return;
      }
    }
    base(action);
  };
  const dispatch1 = makeCursorDispatch(
    createDispatch(
      () => ws1,
      refreshP1,
      navigate2,
      onSolved1,
      void 0,
      void 0,
      onApplyReverse1,
      ctx1,
      void 0,
      gazeBlocked
    ),
    () => ws1,
    () => congrats1
  );
  const dispatch2 = makeCursorDispatch(
    createDispatch(
      () => ws2,
      refreshP2,
      navigate2,
      onSolved2,
      void 0,
      void 0,
      onApplyReverse2,
      ctx2,
      void 0,
      gazeBlocked
    ),
    () => ws2,
    () => congrats2
  );
  const makeCongrats = (onContinue, setCursor) => () => {
    const hurray = document.createElement("div");
    const buttons = document.createElement("div");
    const cells = [];
    const add = (label, disabled, activate) => {
      const el = createButton(label, disabled, activate);
      buttons.appendChild(el);
      cells.push({ btn: el, activate, isEnabled: () => !disabled });
    };
    if (isTutorial2) {
      add(t("tutorialPrevious"), stopIdx <= 0, () => jumpToStop(stopIdx - 1));
    }
    add(isTutorial2 ? t("tutorialOneMore") : t("continue"), false, onContinue);
    if (isTutorial2) {
      add(
        t("tutorialAdvance"),
        stopIdx >= tutorialStops.length - 1,
        () => jumpToStop(stopIdx + 1)
      );
    }
    const continueCol = isTutorial2 ? 1 : 0;
    const cursor = createButtonCursor([cells], {
      startCol: continueCol,
      moveOnReveal: true
    });
    setCursor({ onAction: cursor.onAction, isEngaged: cursor.isEngaged });
    return { hurray, buttons };
  };
  const makeCongratsP1 = makeCongrats(
    () => solvePlayer1(),
    (c) => {
      congrats1 = c;
    }
  );
  const makeCongratsP2 = makeCongrats(
    () => solvePlayer2(),
    (c) => {
      congrats2 = c;
    }
  );
  const ticker = setInterval(() => {
    if (untimed || gameOver || paused) return;
    timeLeft -= 1;
    if (timeLeft <= 0) {
      timeLeft = 0;
      gameOver = true;
      clearInterval(ticker);
      lemmaSession1?.cancel();
      lemmaSession2?.cancel();
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
    const session2 = lemmaSession1;
    if (session2 === null) return false;
    if (action === "undo") {
      if (session2.undo()) refreshP1();
      else session2.cancel();
    } else if (session2.handleAction(action)) {
      refreshP1();
    }
    return true;
  };
  const handleEditorInput2 = (action) => {
    const session2 = lemmaSession2;
    if (session2 === null) return false;
    if (action === "undo") {
      if (session2.undo()) refreshP2();
      else session2.cancel();
    } else if (session2.handleAction(action)) {
      refreshP2();
    }
    return true;
  };
  const handleResultAction = (action) => {
    if (action === "lemma") navigate2("versus-config");
    else if (action === "skip") navigate2("versus");
    else resultScreen?.onAction(action);
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
      else pauseMenu?.onAction(action);
      return;
    }
    if (action !== "menu") return;
    if (lemmaSession1 !== null || lemmaSession2 !== null) {
      lemmaSession1?.cancel();
      lemmaSession2?.cancel();
    } else {
      setPaused(true);
    }
  };
  const handleKey = (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey || gameOver || paused) return;
    if (lemmaSession1 !== null) {
      const piece = editorKeyPieces[ev.code];
      if (piece !== void 0) {
        markKeyboardInput();
        if (lemmaSession1.fill(piece())) refreshP1();
        return;
      }
    }
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
    if (lemmaSession2 !== null) {
      const piece = editorKeyPieces[ev.code];
      if (piece !== void 0) {
        markKeyboardInput();
        if (lemmaSession2.fill(piece())) refreshP2();
        return;
      }
    }
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
  let cleanupP2;
  if (isTutorial2) {
    const padHandler1 = (action) => {
      if (gameOver || paused || action === "menu") return;
      if (handleEditorInput1(action)) return;
      if (action === "skip") {
        skipPlayer1();
        return;
      }
      dispatch1(action);
    };
    const padHandler2 = (action) => {
      if (gameOver || paused || action === "menu") return;
      if (handleEditorInput2(action)) return;
      if (action === "skip") {
        skipPlayer2();
        return;
      }
      dispatch2(action);
    };
    const tutorPadIdx = () => tutorInput === "gamepad1" || tutorInput === "gamepad2" ? gpIndex(tutorInput) : null;
    const routeKey = (ev) => {
      if (tutorInput === "keyboard") handleKey2(ev);
      else handleKey(ev);
    };
    document.addEventListener("keydown", routeKey);
    const cleanups = [
      () => document.removeEventListener("keydown", routeKey),
      ...[0, 1, 2, 3].map(
        (idx) => setupGamepad((action) => {
          if (idx === tutorPadIdx()) padHandler2(action);
          else padHandler1(action);
        }, idx)
      )
    ];
    cleanupP1 = () => cleanups.forEach((c) => c());
    cleanupP2 = () => {
    };
  } else {
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
    },
    rerender
  };
};

// src/web/tutorial.ts
var mountTutorial = (container, navigate2, pool2, startStop, tutorInput) => {
  const stop = Math.max(0, Math.min(startStop, tutorialStops.length - 1));
  const config = {
    ...defaultVersusConfig(),
    // Neutralize the Versus defaults (p2 would be an NPC); the tutorial's
    // input wiring never consults these.
    p1Input: "mouse",
    p2Input: "mouse",
    tutorial: { startStop: stop, tutorInput }
  };
  return mountVersus(container, navigate2, pool2, config);
};

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
var pickTutorInput = (params) => {
  const raw2 = params.get("tutorial_tutor");
  if (raw2 === "mouse" || raw2 === "keyboard" || raw2 === "gamepad1" || raw2 === "gamepad2")
    return raw2;
  return "off";
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
    if (screen === "tutorial") {
      for (const key of ["tutorial_stop", "tutorial_tutor"]) {
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
    case "tutorial": {
      const params = new URLSearchParams(window.location.search);
      const raw2 = parseInt(params.get("tutorial_stop") ?? "0", 10);
      const stop = Number.isFinite(raw2) ? raw2 : 0;
      current = mountTutorial(
        body,
        navigate,
        pool,
        stop,
        pickTutorInput(params)
      );
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
  } else if (mode === "tutorial") {
    mount("tutorial");
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
