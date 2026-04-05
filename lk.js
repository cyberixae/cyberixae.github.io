// src/web/menu.ts
var mountMenu = (container, navigate2) => {
  const panel = document.createElement("div");
  panel.setAttribute("class", "menu");
  const title = document.createElement("div");
  title.setAttribute("class", "menu-title");
  title.innerHTML = "LK";
  panel.appendChild(title);
  const modes = document.createElement("div");
  modes.setAttribute("class", "menu-modes");
  const randomBtn = document.createElement("div");
  randomBtn.setAttribute("class", "button menu-mode");
  randomBtn.innerHTML = "Random";
  randomBtn.onclick = () => navigate2("random");
  modes.appendChild(randomBtn);
  const campaignBtn = document.createElement("div");
  campaignBtn.setAttribute("class", "button menu-mode");
  campaignBtn.innerHTML = "Campaign";
  campaignBtn.onclick = () => navigate2("campaign");
  modes.appendChild(campaignBtn);
  panel.appendChild(modes);
  container.innerHTML = "";
  container.appendChild(panel);
  return () => {
  };
};

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
  return arr[Math.floor(index) % arr.length];
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
  for (const t of first()) {
    for (const ts of sequence(rest)()) {
      yield [t, ...ts];
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
  const [left4, right3] = split(next2)();
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

// src/utils/tuple.ts
var head3 = (a91) => {
  const [h] = a91;
  return h;
};
var tail = (a91) => {
  const [_h, ...t] = a91;
  return t;
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
  mp: ruleMP
};
var isReverseId1 = (s) => s in reverse1;
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

// src/utils/string.ts
var split2 = (s, c) => ensureNonEmpty(s.split(c), s);

// src/interactive/event.ts
var reverse02 = (rev) => ({
  kind: "reverse0",
  rev
});
var undo = () => ({ kind: "undo" });
var reset = () => ({ kind: "reset" });
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
  const [cmd, ...args] = split2(str, " ");
  if (isReverseId1(cmd)) {
    console.error("TBD, parse:" + JSON.stringify(args));
  }
  return null;
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
    return next(cursor);
  }
  return cursor;
};
var undo2 = (s) => {
  const path = activePath(s);
  const current = subDerivation(s.derivation, path);
  if (current?.kind === "transformation") {
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
    return focus(derivation, s.branch);
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

// src/systems/lk.ts
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
  cl1: ruleCL1.apply,
  dr1: ruleDR1.apply,
  cl2: ruleCL2.apply,
  dr2: ruleDR2.apply,
  dl: ruleDL.apply,
  cr: ruleCR.apply,
  il: ruleIL.apply,
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
var lk = {
  a: alpha,
  o: omega,
  i: iota,
  z: zeta
};

// src/solver/bruteStructure0.ts
var seqKey = (s) => JSON.stringify([s.antecedent, s.succedent]);
var buildStructurePath = (d, rules90, p) => {
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
    const currentKey = seqKey(current.result);
    for (const [rId, rule] of entries(reverseStructure0)) {
      const ruleId2 = rId;
      if (!includes(rules90, ruleId2)) continue;
      const reversed = rule.tryReverse(current);
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
    const parentNode = nodes.get(edge.parentKey);
    proof = proofUsing(parentNode.result, [proof], edge.ruleId);
    key = edge.parentKey;
  }
  return proof;
};
var bruteStructure0 = (d, rules90, p) => function* () {
  const result = buildStructurePath(d, rules90, p);
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
var bruteWeaken0 = (d, rules90, p) => function* () {
  if (equals3(d.result, p.result)) {
    yield proofUsing(d.result, p.deps, p.rule);
    return;
  }
  const swl2 = "swl";
  if (includes(rules90, swl2) && d.result.antecedent.length > p.result.antecedent.length && reverseStructure0[swl2].isResultDerivation(d)) {
    const step = reverseStructure0.swl.reverse(d);
    const [dep] = step.deps;
    if (dep.kind === "premise") {
      yield* map(
        bruteWeaken0(dep, rules90, p),
        (depProof) => proofUsing(step.result, [depProof], swl2)
      )();
    }
    return;
  }
  const swr2 = "swr";
  if (includes(rules90, swr2) && d.result.succedent.length > p.result.succedent.length && reverseStructure0[swr2].isResultDerivation(d)) {
    const step = reverseStructure0.swr.reverse(d);
    const [dep] = step.deps;
    if (dep.kind === "premise") {
      yield* map(
        bruteWeaken0(dep, rules90, p),
        (depProof) => proofUsing(step.result, [depProof], swr2)
      )();
    }
    return;
  }
};
var bruteAxiom0 = (d, rules90, limit) => function* () {
  for (const rule of Object.values(reverseAxiom0)) {
    if (!includes(rules90, rule.id)) {
      continue;
    }
    const result = rule.tryReverse(d);
    if (!result) {
      continue;
    }
    yield* brute0(result, rules90, limit)();
  }
};
var candidateConnectives = (rules90, sequent2) => {
  const kinds = /* @__PURE__ */ new Set();
  for (const [rId, rule] of entries(reverse0)) {
    if (!includes(rules90, rId)) continue;
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
  for (let leftOps = 0; leftOps < opCount; leftOps++) {
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
var bruteLogic1 = (d, rules90, limit) => function* () {
  const applicableRules3 = entries(reverse1).filter(
    ([rId]) => includes(rules90, rId)
  );
  if (applicableRules3.length === 0) return;
  const atoms2 = uniq2([
    ...d.result.antecedent.flatMap(atoms),
    ...d.result.succedent.flatMap(atoms)
  ]);
  const connectives2 = candidateConnectives(rules90, d.result);
  for (let opCount = 0; opCount <= limit * 2; opCount++) {
    for (const formula of formulasOfOpCount(opCount, atoms2, connectives2)()) {
      for (const [, rule] of applicableRules3) {
        const result = rule.tryReverse(formula)(d);
        if (!result) continue;
        yield* brute0(result, rules90, limit)();
      }
    }
  }
};
var bruteLogic0 = (d, rules90, limit) => function* () {
  yield* flatMap(
    hypoWeaken(d),
    (hypo) => flatMap(
      bruteAxiom0(hypo, rules90, limit),
      (h) => bruteWeaken0(d, rules90, h)
    )
  )();
  for (const rule of Object.values(reverseLogic0)) {
    if (!includes(rules90, rule.id)) {
      continue;
    }
    const result = rule.tryReverse(d);
    if (!result) {
      continue;
    }
    yield* brute0(result, rules90, limit)();
  }
  yield* bruteLogic1(d, rules90, limit)();
};
var hypoStructure = (d, rules90) => function* () {
  const visited = /* @__PURE__ */ new Set();
  const queue = [d];
  while (queue.length > 0) {
    const current = queue.shift();
    const key = seqKey(current.result);
    if (visited.has(key)) continue;
    visited.add(key);
    yield current;
    for (const [rId, rule] of entries(reverseStructure0)) {
      const ruleId2 = rId;
      if (!includes(rules90, ruleId2)) continue;
      const reversed = rule.tryReverse(current);
      if (!reversed || reversed.kind !== "transformation") continue;
      const [dep] = reversed.deps;
      if (!dep || dep.kind !== "premise") continue;
      queue.push(dep);
    }
  }
};
var brute0Premise = (d, rules90, limit) => function* () {
  if (limit < 1) {
    return;
  }
  if (!isTautology2(d.result)) {
    return;
  }
  yield* flatMap(
    hypoStructure(d, rules90),
    (hypo) => flatMap(
      bruteLogic0(hypo, rules90, limit),
      (h) => bruteStructure0(d, rules90, h)
    )
  )();
};
var brute0Transformation = (d, rules90, limit) => function* () {
  const depProofs = sequence(
    d.deps.map((dep) => brute0(dep, rules90, limit - 1))
  );
  yield* map(
    depProofs,
    (proofs) => proofUsing(d.result, proofs, d.rule)
  )();
};
var brute0 = (d, rules90, limit) => function* () {
  switch (d.kind) {
    case "premise":
      yield* brute0Premise(d, rules90, limit)();
      break;
    case "transformation": {
      const rule = d.rule;
      if (includes(rules90, rule)) {
        yield* brute0Transformation({ ...d, rule }, rules90, limit)();
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
  for (let limit = 0; ; limit++) {
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

// src/model/challenge.ts
var challenge = (c) => c;
var random2 = (size = 10, minDifficulty = 8) => () => {
  const rules90 = [
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
  let solution89;
  while (typeof solution89 === "undefined") {
    ;
    [solution89] = head2(
      flatMap(
        filter(repeatIO(random(size)), isTautology),
        (tautology) => {
          const [proof, difficulty] = brute({
            goal: conclusion(tautology),
            rules: rules90
          });
          return difficulty < minDifficulty ? empty() : of(proof);
        }
      )
    );
  }
  return {
    rules: rules90,
    goal: solution89.result,
    solution: solution89
  };
};

// src/challenges/ch0-identity-1.ts
var { a, i: i2 } = lk;
var rules2 = ["i"];
var goal = sequent([a("p")], [a("p")]);
var solution = i2.i(a("p"));
var ch0identity1 = challenge({ rules: rules2, goal, solution });

// src/challenges/ch0-identity-2.ts
var { a: a4, i: i3 } = lk;
var rules3 = ["i"];
var goal2 = sequent([a4("q")], [a4("q")]);
var solution2 = i3.i(a4("q"));
var ch0identity2 = challenge({ rules: rules3, goal: goal2, solution: solution2 });

// src/challenges/ch0-identity-3.ts
var { a: a5, o, i: i4 } = lk;
var rules4 = ["i"];
var goal3 = sequent([o.p1.negation(a5("p"))], [o.p1.negation(a5("p"))]);
var solution3 = i4.i(o.p1.negation(a5("p")));
var ch0identity3 = challenge({ rules: rules4, goal: goal3, solution: solution3 });

// src/challenges/ch0-identity-4.ts
var { a: a6, o: o2, i: i5 } = lk;
var rules5 = ["i"];
var goal4 = sequent(
  [o2.p2.conjunction(a6("q"), a6("r"))],
  [o2.p2.conjunction(a6("q"), a6("r"))]
);
var solution4 = i5.i(o2.p2.conjunction(a6("q"), a6("r")));
var ch0identity4 = challenge({ rules: rules5, goal: goal4, solution: solution4 });

// src/challenges/ch0-identity-5.ts
var { a: a7, o: o3, i: i6 } = lk;
var rules6 = ["i"];
var goal5 = sequent(
  [o3.p2.disjunction(a7("r"), a7("s"))],
  [o3.p2.disjunction(a7("r"), a7("s"))]
);
var solution5 = i6.i(o3.p2.disjunction(a7("r"), a7("s")));
var ch0identity5 = challenge({ rules: rules6, goal: goal5, solution: solution5 });

// src/challenges/ch0-identity-6.ts
var { a: a8, o: o4, i: i7 } = lk;
var rules7 = ["i"];
var goal6 = sequent(
  [o4.p2.implication(a8("r"), a8("p"))],
  [o4.p2.implication(a8("r"), a8("p"))]
);
var solution6 = i7.i(o4.p2.implication(a8("r"), a8("p")));
var ch0identity6 = challenge({ rules: rules7, goal: goal6, solution: solution6 });

// src/challenges/ch0-identity-7.ts
var { a: a9, o: o5, i: i8 } = lk;
var rules8 = ["i"];
var goal7 = sequent(
  [o5.p2.conjunction(a9("q"), o5.p1.negation(a9("p")))],
  [o5.p2.conjunction(a9("q"), o5.p1.negation(a9("p")))]
);
var solution7 = i8.i(o5.p2.conjunction(a9("q"), o5.p1.negation(a9("p"))));
var ch0identity7 = challenge({ rules: rules8, goal: goal7, solution: solution7 });

// src/challenges/ch0-identity-8.ts
var { a: a10, o: o6, i: i9 } = lk;
var rules9 = ["i"];
var goal8 = sequent(
  [
    o6.p2.implication(
      o6.p2.disjunction(a10("p"), a10("q")),
      o6.p2.conjunction(a10("p"), a10("q"))
    )
  ],
  [
    o6.p2.implication(
      o6.p2.disjunction(a10("p"), a10("q")),
      o6.p2.conjunction(a10("p"), a10("q"))
    )
  ]
);
var solution8 = i9.i(
  o6.p2.implication(
    o6.p2.disjunction(a10("p"), a10("q")),
    o6.p2.conjunction(a10("p"), a10("q"))
  )
);
var ch0identity8 = challenge({ rules: rules9, goal: goal8, solution: solution8 });

// src/challenges/ch0-identity-9.ts
var { a: a11, o: o7, i: i10 } = lk;
var rules10 = ["i"];
var goal9 = sequent(
  [
    o7.p2.implication(
      o7.p2.disjunction(a11("p"), o7.p1.negation(a11("q"))),
      o7.p1.negation(o7.p2.conjunction(a11("r"), a11("s")))
    )
  ],
  [
    o7.p2.implication(
      o7.p2.disjunction(a11("p"), o7.p1.negation(a11("q"))),
      o7.p1.negation(o7.p2.conjunction(a11("r"), a11("s")))
    )
  ]
);
var solution9 = i10.i(
  o7.p2.implication(
    o7.p2.disjunction(a11("p"), o7.p1.negation(a11("q"))),
    o7.p1.negation(o7.p2.conjunction(a11("r"), a11("s")))
  )
);
var ch0identity9 = challenge({ rules: rules10, goal: goal9, solution: solution9 });

// src/challenges/ch1-weakening-1.ts
var { a: a12, z, i: i11 } = lk;
var rules11 = ["i", "swl", "swr"];
var goal10 = sequent([a12("p"), a12("q")], [a12("p")]);
var solution10 = z.swl(a12("q"), i11.i(a12("p")));
var ch1weakening1 = challenge({ rules: rules11, goal: goal10, solution: solution10 });

// src/challenges/ch1-weakening-2.ts
var { a: a13, z: z2, i: i12 } = lk;
var rules12 = ["i", "swl", "swr"];
var goal11 = sequent([a13("p")], [a13("q"), a13("p")]);
var solution11 = z2.swr(a13("q"), i12.i(a13("p")));
var ch1weakening2 = challenge({ rules: rules12, goal: goal11, solution: solution11 });

// src/challenges/ch1-weakening-3.ts
var { a: a14, z: z3, i: i13 } = lk;
var rules13 = ["i", "swl", "swr"];
var goal12 = sequent([a14("p"), a14("q")], [a14("q"), a14("p")]);
var solution12 = z3.swl(a14("q"), z3.swr(a14("q"), i13.i(a14("p"))));
var ch1weakening3 = challenge({ rules: rules13, goal: goal12, solution: solution12 });

// src/challenges/ch1-weakening-4.ts
var { a: a15, o: o8, z: z4, i: i14 } = lk;
var rules14 = ["i", "swl", "swr"];
var goal13 = sequent(
  [a15("q"), o8.p2.conjunction(a15("p"), a15("q"))],
  [o8.p2.conjunction(a15("q"), a15("p")), a15("q")]
);
var solution13 = z4.swl(
  o8.p2.conjunction(a15("p"), a15("q")),
  z4.swr(o8.p2.conjunction(a15("q"), a15("p")), i14.i(a15("q")))
);
var ch1weakening4 = challenge({ rules: rules14, goal: goal13, solution: solution13 });

// src/challenges/ch1-weakening-5.ts
var { a: a16, o: o9, z: z5, i: i15 } = lk;
var rules15 = ["i", "swl", "swr"];
var goal14 = sequent(
  [o9.p2.conjunction(a16("p"), a16("q")), a16("p")],
  [a16("q"), o9.p2.conjunction(a16("p"), a16("q"))]
);
var solution14 = z5.swl(
  a16("p"),
  z5.swr(a16("q"), i15.i(o9.p2.conjunction(a16("p"), a16("q"))))
);
var ch1weakening5 = challenge({ rules: rules15, goal: goal14, solution: solution14 });

// src/challenges/ch1-weakening-6.ts
var { a: a17, z: z6, i: i16 } = lk;
var rules16 = ["i", "swl", "swr"];
var goal15 = sequent(
  [a17("p"), a17("q"), a17("q"), a17("p")],
  [a17("p"), a17("q"), a17("q"), a17("p")]
);
var solution15 = z6.swl(
  a17("p"),
  z6.swl(
    a17("q"),
    z6.swl(a17("q"), z6.swr(a17("p"), z6.swr(a17("q"), z6.swr(a17("q"), i16.i(a17("p"))))))
  )
);
var ch1weakening6 = challenge({ rules: rules16, goal: goal15, solution: solution15 });

// src/challenges/ch1-weakening-7.ts
var { a: a18, o: o10, i: i17 } = lk;
var rules17 = ["i", "swl", "swr"];
var goal16 = sequent(
  [
    o10.p2.implication(
      o10.p2.disjunction(a18("p"), a18("q")),
      o10.p2.conjunction(a18("p"), a18("q"))
    )
  ],
  [
    o10.p2.implication(
      o10.p2.disjunction(a18("p"), a18("q")),
      o10.p2.conjunction(a18("p"), a18("q"))
    )
  ]
);
var solution16 = i17.i(
  o10.p2.implication(
    o10.p2.disjunction(a18("p"), a18("q")),
    o10.p2.conjunction(a18("p"), a18("q"))
  )
);
var ch1weakening7 = challenge({ rules: rules17, goal: goal16, solution: solution16 });

// src/challenges/ch1-weakening-8.ts
var { a: a19, o: o11, z: z7, i: i18 } = lk;
var rules18 = ["i", "swl", "swr"];
var goal17 = sequent(
  [a19("p"), o11.p2.implication(a19("q"), a19("p")), a19("q")],
  [a19("q"), o11.p2.implication(a19("q"), a19("p")), a19("p")]
);
var solution17 = z7.swl(
  a19("q"),
  z7.swl(
    o11.p2.implication(a19("q"), a19("p")),
    z7.swr(a19("q"), z7.swr(o11.p2.implication(a19("q"), a19("p")), i18.i(a19("p"))))
  )
);
var ch1weakening8 = challenge({ rules: rules18, goal: goal17, solution: solution17 });

// src/challenges/ch1-weakening-9.ts
var { a: a20, z: z8, i: i19 } = lk;
var rules19 = ["i", "swl", "swr"];
var goal18 = sequent(
  [a20("s"), a20("r"), a20("q"), a20("p")],
  [a20("p"), a20("q"), a20("r"), a20("s")]
);
var solution18 = z8.swl(
  a20("p"),
  z8.swl(
    a20("q"),
    z8.swl(a20("r"), z8.swr(a20("p"), z8.swr(a20("q"), z8.swr(a20("r"), i19.i(a20("s"))))))
  )
);
var ch1weakening9 = challenge({ rules: rules19, goal: goal18, solution: solution18 });

// src/challenges/ch2-permutation-1.ts
var { a: a21, z: z9, i: i20 } = lk;
var rules20 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal19 = sequent([a21("p"), a21("p"), a21("p"), a21("q"), a21("p"), a21("p")], [a21("q")]);
var solution19 = z9.swl(
  a21("p"),
  z9.swl(
    a21("p"),
    z9.sRotLB(z9.swl(a21("p"), z9.swl(a21("p"), z9.swl(a21("p"), i20.i(a21("q"))))))
  )
);
var ch2permutation1 = challenge({ rules: rules20, goal: goal19, solution: solution19 });

// src/challenges/ch2-permutation-2.ts
var { a: a22, z: z10, i: i21 } = lk;
var rules21 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal20 = sequent([a22("q")], [a22("p"), a22("p"), a22("p"), a22("q"), a22("p"), a22("p")]);
var solution20 = z10.sRotRF(
  z10.sRotRF(
    z10.swr(
      a22("p"),
      z10.swr(a22("p"), z10.swr(a22("p"), z10.swr(a22("p"), z10.swr(a22("p"), i21.i(a22("q"))))))
    )
  )
);
var ch2permutation2 = challenge({ rules: rules21, goal: goal20, solution: solution20 });

// src/challenges/ch2-permutation-3.ts
var { a: a23, z: z11, i: i22 } = lk;
var rules22 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal21 = sequent(
  [a23("p"), a23("p"), a23("p"), a23("q"), a23("p"), a23("p")],
  [a23("p"), a23("p"), a23("p"), a23("q"), a23("p"), a23("p")]
);
var solution21 = z11.swl(
  a23("p"),
  z11.swl(
    a23("p"),
    z11.swl(
      a23("q"),
      z11.swl(
        a23("p"),
        z11.swl(
          a23("p"),
          z11.swr(
            a23("p"),
            z11.swr(
              a23("p"),
              z11.swr(a23("p"), z11.swr(a23("q"), z11.swr(a23("p"), i22.i(a23("p")))))
            )
          )
        )
      )
    )
  )
);
var ch2permutation3 = challenge({ rules: rules22, goal: goal21, solution: solution21 });

// src/challenges/ch2-permutation-4.ts
var { a: a24, z: z12, i: i23 } = lk;
var rules23 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal22 = sequent(
  [a24("s"), a24("r"), a24("q"), a24("p")],
  [a24("s"), a24("r"), a24("q"), a24("p")]
);
var solution22 = z12.sRotLB(
  z12.swl(
    a24("q"),
    z12.swl(
      a24("r"),
      z12.swl(a24("s"), z12.swr(a24("s"), z12.swr(a24("r"), z12.swr(a24("q"), i23.i(a24("p"))))))
    )
  )
);
var ch2permutation4 = challenge({ rules: rules23, goal: goal22, solution: solution22 });

// src/challenges/ch2-permutation-5.ts
var { a: a25, o: o12, z: z13, i: i24 } = lk;
var rules24 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal23 = sequent(
  [o12.p2.conjunction(a25("p"), a25("q")), o12.p2.conjunction(a25("p"), a25("q"))],
  [o12.p2.conjunction(a25("p"), a25("q")), o12.p2.disjunction(a25("p"), a25("q"))]
);
var solution23 = z13.sRotRF(
  z13.swl(
    o12.p2.conjunction(a25("p"), a25("q")),
    z13.swr(
      o12.p2.disjunction(a25("p"), a25("q")),
      i24.i(o12.p2.conjunction(a25("p"), a25("q")))
    )
  )
);
var ch2permutation5 = challenge({ rules: rules24, goal: goal23, solution: solution23 });

// src/challenges/ch2-permutation-6.ts
var { a: a26, o: o13, z: z14, i: i25 } = lk;
var rules25 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal24 = sequent(
  [
    o13.p2.conjunction(a26("q"), a26("s")),
    o13.p2.conjunction(a26("q"), a26("s")),
    o13.p2.conjunction(a26("q"), a26("s"))
  ],
  [
    o13.p2.conjunction(a26("q"), a26("s")),
    o13.p2.conjunction(a26("s"), a26("q")),
    o13.p2.conjunction(a26("s"), a26("q"))
  ]
);
var solution24 = z14.sRotRB(
  z14.swl(
    o13.p2.conjunction(a26("q"), a26("s")),
    z14.swl(
      o13.p2.conjunction(a26("q"), a26("s")),
      z14.swr(
        o13.p2.conjunction(a26("s"), a26("q")),
        z14.swr(
          o13.p2.conjunction(a26("s"), a26("q")),
          i25.i(o13.p2.conjunction(a26("q"), a26("s")))
        )
      )
    )
  )
);
var ch2permutation6 = challenge({ rules: rules25, goal: goal24, solution: solution24 });

// src/challenges/ch2-permutation-7.ts
var { a: a27, o: o14, z: z15, i: i26 } = lk;
var rules26 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal25 = sequent(
  [
    o14.p2.implication(a27("q"), a27("p")),
    o14.p2.implication(a27("p"), a27("s")),
    o14.p2.implication(a27("s"), a27("r"))
  ],
  [
    o14.p2.implication(a27("r"), a27("p")),
    o14.p2.implication(a27("p"), a27("s")),
    o14.p2.implication(a27("s"), a27("q"))
  ]
);
var solution25 = z15.sRotLF(
  z15.sRotRF(
    z15.swl(
      o14.p2.implication(a27("q"), a27("p")),
      z15.swl(
        o14.p2.implication(a27("s"), a27("r")),
        z15.swr(
          o14.p2.implication(a27("s"), a27("q")),
          z15.swr(
            o14.p2.implication(a27("r"), a27("p")),
            i26.i(o14.p2.implication(a27("p"), a27("s")))
          )
        )
      )
    )
  )
);
var ch2permutation7 = challenge({ rules: rules26, goal: goal25, solution: solution25 });

// src/challenges/ch2-permutation-8.ts
var { a: a28, o: o15, z: z16, i: i27 } = lk;
var rules27 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal26 = sequent(
  [
    o15.p2.conjunction(a28("s"), a28("q")),
    a28("r"),
    o15.p2.implication(a28("q"), a28("p")),
    o15.p1.negation(a28("r"))
  ],
  [
    o15.p1.negation(a28("p")),
    o15.p2.implication(a28("s"), a28("q")),
    o15.p1.negation(a28("r")),
    o15.p2.disjunction(a28("q"), a28("p"))
  ]
);
var solution26 = z16.sRotLB(
  z16.sRotRF(
    z16.swl(
      o15.p2.implication(a28("q"), a28("p")),
      z16.swl(
        a28("r"),
        z16.swl(
          o15.p2.conjunction(a28("s"), a28("q")),
          z16.swr(
            o15.p2.disjunction(a28("q"), a28("p")),
            z16.swr(
              o15.p1.negation(a28("p")),
              z16.swr(
                o15.p2.implication(a28("s"), a28("q")),
                i27.i(o15.p1.negation(a28("r")))
              )
            )
          )
        )
      )
    )
  )
);
var ch2permutation8 = challenge({ rules: rules27, goal: goal26, solution: solution26 });

// src/challenges/ch2-permutation-9.ts
var { a: a29, o: o16, z: z17, i: i28 } = lk;
var rules28 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal27 = sequent(
  [a29("p"), o16.p1.negation(a29("p")), a29("q"), a29("r")],
  [o16.p1.negation(a29("q")), o16.p1.negation(a29("p")), a29("s"), o16.p1.negation(a29("r"))]
);
var solution27 = z17.swr(
  o16.p1.negation(a29("q")),
  z17.sRotLF(
    z17.sRotRB(
      z17.swl(
        a29("p"),
        z17.swl(
          a29("r"),
          z17.swl(
            a29("q"),
            z17.swr(
              a29("s"),
              z17.swr(o16.p1.negation(a29("r")), i28.i(o16.p1.negation(a29("p"))))
            )
          )
        )
      )
    )
  )
);
var ch2permutation9 = challenge({ rules: rules28, goal: goal27, solution: solution27 });

// src/challenges/ch3-negation-1.ts
var { a: a30, o: o17, z: z18, i: i29 } = lk;
var rules29 = ["i", "nl", "nr"];
var goal28 = sequent([a30("r"), o17.p1.negation(a30("r"))], []);
var solution28 = z18.nl(i29.i(a30("r")));
var ch3negation1 = challenge({ rules: rules29, goal: goal28, solution: solution28 });

// src/challenges/ch3-negation-2.ts
var { a: a31, o: o18, z: z19, i: i30 } = lk;
var rules30 = ["i", "nl", "nr"];
var goal29 = sequent([], [o18.p1.negation(a31("r")), a31("r")]);
var solution29 = z19.nr(i30.i(a31("r")));
var ch3negation2 = challenge({ rules: rules30, goal: goal29, solution: solution29 });

// src/challenges/ch3-negation-3.ts
var { a: a32, o: o19, z: z20, i: i31 } = lk;
var rules31 = ["i", "nl", "nr"];
var goal30 = sequent([o19.p1.negation(o19.p1.negation(a32("q")))], [a32("q")]);
var solution30 = z20.nl(z20.nr(i31.i(a32("q"))));
var ch3negation3 = challenge({ rules: rules31, goal: goal30, solution: solution30 });

// src/challenges/ch3-negation-4.ts
var { a: a33, o: o20, z: z21, i: i32 } = lk;
var rules32 = ["i", "nl", "nr"];
var goal31 = sequent(
  [o20.p1.negation(o20.p1.negation(a33("s")))],
  [o20.p1.negation(o20.p1.negation(o20.p1.negation(o20.p1.negation(a33("s")))))]
);
var solution31 = z21.nr(z21.nl(i32.i(o20.p1.negation(o20.p1.negation(a33("s"))))));
var ch3negation4 = challenge({ rules: rules32, goal: goal31, solution: solution31 });

// src/challenges/ch3-negation-5.ts
var { a: a34, o: o21, z: z22, i: i33 } = lk;
var rules33 = ["i", "swl", "swr", "nl", "nr"];
var goal32 = sequent(
  [o21.p1.negation(o21.p1.negation(o21.p2.conjunction(a34("p"), a34("q"))))],
  [
    o21.p1.negation(
      o21.p1.negation(
        o21.p1.negation(o21.p1.negation(o21.p2.conjunction(a34("p"), a34("q"))))
      )
    )
  ]
);
var solution32 = z22.nr(
  z22.nl(i33.i(o21.p1.negation(o21.p1.negation(o21.p2.conjunction(a34("p"), a34("q"))))))
);
var ch3negation5 = challenge({ rules: rules33, goal: goal32, solution: solution32 });

// src/challenges/ch3-negation-6.ts
var { a: a35, o: o22, z: z23, i: i34 } = lk;
var rules34 = ["i", "swl", "swr", "nl", "nr"];
var goal33 = sequent(
  [
    o22.p1.negation(o22.p1.negation(a35("p"))),
    o22.p1.negation(o22.p1.negation(o22.p1.negation(a35("p"))))
  ],
  [
    o22.p1.negation(o22.p1.negation(a35("p"))),
    o22.p1.negation(o22.p1.negation(o22.p1.negation(a35("p"))))
  ]
);
var solution33 = z23.swr(
  o22.p1.negation(o22.p1.negation(a35("p"))),
  z23.swr(
    o22.p1.negation(o22.p1.negation(o22.p1.negation(a35("p")))),
    z23.nl(i34.i(o22.p1.negation(o22.p1.negation(a35("p")))))
  )
);
var ch3negation6 = challenge({ rules: rules34, goal: goal33, solution: solution33 });

// src/challenges/ch3-negation-7.ts
var { a: a36, o: o23, z: z24, i: i35 } = lk;
var rules35 = [
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
var goal34 = sequent(
  [
    o23.p1.negation(o23.p1.negation(a36("p"))),
    o23.p1.negation(o23.p1.negation(o23.p1.negation(a36("p"))))
  ],
  [
    o23.p1.negation(o23.p1.negation(a36("p"))),
    o23.p1.negation(o23.p1.negation(o23.p1.negation(a36("p"))))
  ]
);
var solution34 = z24.sRotLF(
  z24.swl(
    o23.p1.negation(o23.p1.negation(a36("p"))),
    z24.swr(
      o23.p1.negation(o23.p1.negation(a36("p"))),
      i35.i(o23.p1.negation(o23.p1.negation(o23.p1.negation(a36("p")))))
    )
  )
);
var ch3negation7 = challenge({ rules: rules35, goal: goal34, solution: solution34 });

// src/challenges/ch3-negation-8.ts
var { a: a37, o: o24, z: z25, i: i36 } = lk;
var rules36 = [
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
var goal35 = sequent(
  [
    o24.p1.negation(o24.p1.negation(a37("p"))),
    o24.p2.conjunction(o24.p1.negation(a37("p")), o24.p1.negation(a37("q"))),
    o24.p1.negation(o24.p1.negation(o24.p1.negation(a37("q"))))
  ],
  [
    o24.p1.negation(o24.p1.negation(o24.p1.negation(a37("p")))),
    o24.p2.conjunction(o24.p1.negation(a37("p")), o24.p1.negation(a37("q"))),
    o24.p1.negation(o24.p1.negation(a37("q")))
  ]
);
var solution35 = z25.sRotLF(
  z25.sRotRF(
    z25.swl(
      o24.p1.negation(o24.p1.negation(a37("p"))),
      z25.swl(
        o24.p1.negation(o24.p1.negation(o24.p1.negation(a37("q")))),
        z25.swr(
          o24.p1.negation(o24.p1.negation(a37("q"))),
          z25.swr(
            o24.p1.negation(o24.p1.negation(o24.p1.negation(a37("p")))),
            i36.i(o24.p2.conjunction(o24.p1.negation(a37("p")), o24.p1.negation(a37("q"))))
          )
        )
      )
    )
  )
);
var ch3negation8 = challenge({ rules: rules36, goal: goal35, solution: solution35 });

// src/challenges/ch3-negation-9.ts
var { a: a38, o: o25, z: z26, i: i37 } = lk;
var rules37 = [
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
var goal36 = sequent(
  [o25.p1.negation(a38("p")), o25.p1.negation(a38("s")), o25.p1.negation(a38("p")), a38("r")],
  [a38("q"), o25.p1.negation(a38("q")), a38("s"), o25.p1.negation(a38("r"))]
);
var solution36 = z26.sRotRB(
  z26.nr(
    z26.sRotLB(
      z26.swl(
        a38("r"),
        z26.swl(
          o25.p1.negation(a38("p")),
          z26.swl(
            o25.p1.negation(a38("s")),
            z26.swl(
              o25.p1.negation(a38("p")),
              z26.swr(a38("s"), z26.swr(o25.p1.negation(a38("r")), i37.i(a38("q"))))
            )
          )
        )
      )
    )
  )
);
var ch3negation9 = challenge({ rules: rules37, goal: goal36, solution: solution36 });

// src/challenges/ch4-theorem-1.ts
var { a: a39, o: o26, z: z27, i: i38 } = lk;
var rules38 = ["i", "ir"];
var goal37 = conclusion(o26.p2.implication(a39("q"), a39("q")));
var solution37 = z27.ir(i38.i(a39("q")));
var ch4theorem1 = challenge({ rules: rules38, goal: goal37, solution: solution37 });

// src/challenges/ch4-theorem-2.ts
var { a: a40, o: o27, z: z28, i: i39 } = lk;
var rules39 = ["i", "ir"];
var goal38 = conclusion(
  o27.p2.implication(
    o27.p2.conjunction(a40("q"), a40("q")),
    o27.p2.conjunction(a40("q"), a40("q"))
  )
);
var solution38 = z28.ir(i39.i(o27.p2.conjunction(a40("q"), a40("q"))));
var ch4theorem2 = challenge({ rules: rules39, goal: goal38, solution: solution38 });

// src/challenges/ch4-theorem-3.ts
var { a: a41, o: o28, z: z29, i: i40 } = lk;
var rules40 = ["i", "ir"];
var goal39 = conclusion(
  o28.p2.implication(
    o28.p2.implication(a41("p"), a41("r")),
    o28.p2.implication(a41("p"), a41("r"))
  )
);
var solution39 = z29.ir(i40.i(o28.p2.implication(a41("p"), a41("r"))));
var ch4theorem3 = challenge({ rules: rules40, goal: goal39, solution: solution39 });

// src/challenges/ch4-theorem-4.ts
var { a: a42, o: o29, z: z30, i: i41 } = lk;
var rules41 = ["i", "ir"];
var goal40 = conclusion(
  o29.p2.implication(
    o29.p2.implication(a42("q"), o29.p2.implication(a42("r"), a42("q"))),
    o29.p2.implication(a42("q"), o29.p2.implication(a42("r"), a42("q")))
  )
);
var solution40 = z30.ir(
  i41.i(o29.p2.implication(a42("q"), o29.p2.implication(a42("r"), a42("q"))))
);
var ch4theorem4 = challenge({ rules: rules41, goal: goal40, solution: solution40 });

// src/challenges/ch4-theorem-5.ts
var { a: a43, o: o30, z: z31, i: i42 } = lk;
var rules42 = ["i", "swl", "swr", "ir"];
var goal41 = conclusion(
  o30.p2.implication(a43("q"), o30.p2.implication(a43("r"), a43("q")))
);
var solution41 = z31.ir(z31.ir(z31.swl(a43("r"), i42.i(a43("q")))));
var ch4theorem5 = challenge({ rules: rules42, goal: goal41, solution: solution41 });

// src/challenges/ch4-theorem-6.ts
var { a: a44, o: o31, z: z32, i: i43 } = lk;
var rules43 = ["i", "swl", "swr", "ir"];
var goal42 = conclusion(
  o31.p2.implication(a44("r"), o31.p2.implication(a44("q"), a44("q")))
);
var solution42 = z32.ir(z32.swl(a44("r"), z32.ir(i43.i(a44("q")))));
var ch4theorem6 = challenge({ rules: rules43, goal: goal42, solution: solution42 });

// src/challenges/ch4-theorem-7.ts
var { a: a45, o: o32, z: z33, i: i44 } = lk;
var rules44 = ["i", "swl", "swr", "ir"];
var goal43 = conclusion(
  o32.p2.implication(
    o32.p2.implication(a45("p"), o32.p2.implication(a45("q"), o32.p1.negation(a45("p")))),
    o32.p2.implication(a45("p"), a45("p"))
  )
);
var solution43 = z33.ir(
  z33.swl(
    o32.p2.implication(a45("p"), o32.p2.implication(a45("q"), o32.p1.negation(a45("p")))),
    z33.ir(i44.i(a45("p")))
  )
);
var ch4theorem7 = challenge({ rules: rules44, goal: goal43, solution: solution43 });

// src/challenges/ch4-theorem-8.ts
var { a: a46, o: o33, z: z34, i: i45 } = lk;
var rules45 = ["i", "swl", "swr", "nl", "nr", "ir"];
var goal44 = conclusion(
  o33.p2.implication(
    o33.p1.negation(o33.p1.negation(a46("s"))),
    o33.p1.negation(o33.p1.negation(o33.p1.negation(o33.p1.negation(a46("s")))))
  )
);
var solution44 = z34.ir(z34.nr(z34.nl(i45.i(o33.p1.negation(o33.p1.negation(a46("s")))))));
var ch4theorem8 = challenge({ rules: rules45, goal: goal44, solution: solution44 });

// src/challenges/ch4-theorem-9.ts
var { a: a47, o: o34, z: z35, i: i46 } = lk;
var rules46 = ["i", "swl", "swr", "nl", "nr", "ir"];
var goal45 = conclusion(
  o34.p2.implication(
    o34.p1.negation(o34.p1.negation(o34.p2.conjunction(a47("p"), a47("q")))),
    o34.p1.negation(
      o34.p1.negation(
        o34.p1.negation(o34.p1.negation(o34.p2.conjunction(a47("p"), a47("q"))))
      )
    )
  )
);
var solution45 = z35.ir(
  z35.nr(
    z35.nl(i46.i(o34.p1.negation(o34.p1.negation(o34.p2.conjunction(a47("p"), a47("q"))))))
  )
);
var ch4theorem9 = challenge({ rules: rules46, goal: goal45, solution: solution45 });

// src/challenges/ch5-composition-1.ts
var { a: a48, o: o35, z: z36, i: i47 } = lk;
var rules47 = ["i", "swl", "swr", "cl", "dr"];
var goal46 = sequent([o35.p2.conjunction(a48("p"), a48("q"))], [a48("q"), a48("p")]);
var solution46 = z36.cl(z36.swl(a48("q"), z36.swr(a48("q"), i47.i(a48("p")))));
var ch5composition1 = challenge({ rules: rules47, goal: goal46, solution: solution46 });

// src/challenges/ch5-composition-2.ts
var { a: a49, o: o36, z: z37, i: i48 } = lk;
var rules48 = ["i", "swl", "swr", "cl", "dr"];
var goal47 = sequent([a49("q"), a49("p")], [o36.p2.disjunction(a49("p"), a49("q"))]);
var solution47 = z37.dr(z37.swl(a49("p"), z37.swr(a49("p"), i48.i(a49("q")))));
var ch5composition2 = challenge({ rules: rules48, goal: goal47, solution: solution47 });

// src/challenges/ch5-composition-3.ts
var { a: a50, o: o37, z: z38, i: i49 } = lk;
var rules49 = ["i", "swl", "swr", "cl", "dr"];
var goal48 = sequent(
  [o37.p2.conjunction(a50("q"), a50("p"))],
  [o37.p2.disjunction(a50("p"), a50("q"))]
);
var solution48 = z38.cl(z38.dr(z38.swl(a50("p"), z38.swr(a50("p"), i49.i(a50("q"))))));
var ch5composition3 = challenge({ rules: rules49, goal: goal48, solution: solution48 });

// src/challenges/ch5-composition-4.ts
var { a: a51, o: o38, z: z39, i: i50 } = lk;
var rules50 = ["i", "swl", "swr", "cl", "dr"];
var goal49 = sequent(
  [o38.p2.conjunction(o38.p2.conjunction(a51("r"), a51("p")), a51("s"))],
  [o38.p2.disjunction(a51("s"), o38.p2.disjunction(a51("p"), a51("r")))]
);
var solution49 = z39.cl(
  z39.dr(
    z39.swl(
      a51("s"),
      z39.cl(z39.swr(a51("s"), z39.dr(z39.swl(a51("p"), z39.swr(a51("p"), i50.i(a51("r")))))))
    )
  )
);
var ch5composition4 = challenge({ rules: rules50, goal: goal49, solution: solution49 });

// src/challenges/ch5-composition-5.ts
var { a: a52, o: o39, z: z40, i: i51 } = lk;
var rules51 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "cl",
  "dr"
];
var goal50 = sequent(
  [
    o39.p2.conjunction(
      o39.p2.conjunction(a52("r"), a52("p")),
      o39.p2.disjunction(a52("p"), a52("r"))
    )
  ],
  [
    o39.p2.disjunction(
      o39.p2.conjunction(a52("p"), a52("r")),
      o39.p2.disjunction(a52("r"), a52("p"))
    )
  ]
);
var solution50 = z40.cl(
  z40.dr(
    z40.swl(
      o39.p2.disjunction(a52("p"), a52("r")),
      z40.cl(
        z40.swr(
          o39.p2.conjunction(a52("p"), a52("r")),
          z40.dr(z40.sRotLF(z40.swl(a52("r"), z40.swr(a52("r"), i51.i(a52("p"))))))
        )
      )
    )
  )
);
var ch5composition5 = challenge({ rules: rules51, goal: goal50, solution: solution50 });

// src/challenges/ch5-composition-6.ts
var { a: a53, o: o40, z: z41, i: i52 } = lk;
var rules52 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "cl",
  "dr"
];
var goal51 = sequent(
  [
    o40.p2.conjunction(
      o40.p2.disjunction(a53("r"), a53("p")),
      o40.p2.disjunction(a53("p"), a53("s"))
    )
  ],
  [
    o40.p2.disjunction(
      o40.p2.disjunction(a53("s"), a53("p")),
      o40.p2.disjunction(a53("r"), a53("p"))
    )
  ]
);
var solution51 = z41.cl(
  z41.dr(
    z41.swl(
      o40.p2.disjunction(a53("p"), a53("s")),
      z41.swr(
        o40.p2.disjunction(a53("s"), a53("p")),
        i52.i(o40.p2.disjunction(a53("r"), a53("p")))
      )
    )
  )
);
var ch5composition6 = challenge({ rules: rules52, goal: goal51, solution: solution51 });

// src/challenges/ch5-composition-7.ts
var { a: a54, o: o41, z: z42, i: i53 } = lk;
var rules53 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "cl",
  "dr"
];
var goal52 = sequent(
  [
    o41.p2.conjunction(
      o41.p2.conjunction(a54("p"), a54("q")),
      o41.p2.implication(a54("r"), a54("q"))
    )
  ],
  [
    o41.p2.disjunction(
      o41.p2.implication(a54("q"), a54("r")),
      o41.p2.disjunction(a54("p"), a54("q"))
    )
  ]
);
var solution52 = z42.cl(
  z42.dr(
    z42.swl(
      o41.p2.implication(a54("r"), a54("q")),
      z42.cl(
        z42.swr(
          o41.p2.implication(a54("q"), a54("r")),
          z42.dr(z42.sRotLF(z42.swl(a54("p"), z42.swr(a54("p"), i53.i(a54("q"))))))
        )
      )
    )
  )
);
var ch5composition7 = challenge({ rules: rules53, goal: goal52, solution: solution52 });

// src/challenges/ch5-composition-8.ts
var { a: a55, o: o42, z: z43, i: i54 } = lk;
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
  "dr",
  "ir"
];
var goal53 = conclusion(
  o42.p2.implication(
    o42.p2.conjunction(a55("q"), o42.p1.negation(a55("q"))),
    o42.p2.disjunction(a55("r"), a55("s"))
  )
);
var solution53 = z43.ir(
  z43.cl(z43.nl(z43.sRotRF(z43.swr(o42.p2.disjunction(a55("r"), a55("s")), i54.i(a55("q"))))))
);
var ch5composition8 = challenge({ rules: rules54, goal: goal53, solution: solution53 });

// src/challenges/ch5-composition-9.ts
var { a: a56, o: o43, z: z44, i: i55 } = lk;
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
  "dr",
  "ir"
];
var goal54 = conclusion(
  o43.p2.implication(
    o43.p2.conjunction(
      o43.p2.conjunction(o43.p1.negation(a56("p")), o43.p1.negation(a56("s"))),
      o43.p2.conjunction(o43.p1.negation(a56("p")), a56("r"))
    ),
    o43.p2.disjunction(
      o43.p2.disjunction(a56("q"), o43.p1.negation(a56("q"))),
      o43.p2.disjunction(a56("s"), o43.p1.negation(a56("r")))
    )
  )
);
var solution54 = z44.ir(
  z44.dr(
    z44.dr(
      z44.sRotRB(
        z44.nr(
          z44.sRotLF(
            z44.swl(
              o43.p2.conjunction(
                o43.p2.conjunction(o43.p1.negation(a56("p")), o43.p1.negation(a56("s"))),
                o43.p2.conjunction(o43.p1.negation(a56("p")), a56("r"))
              ),
              z44.swr(
                o43.p2.disjunction(a56("s"), o43.p1.negation(a56("r"))),
                i55.i(a56("q"))
              )
            )
          )
        )
      )
    )
  )
);
var ch5composition9 = challenge({ rules: rules55, goal: goal54, solution: solution54 });

// src/challenges/ch6-branching-1.ts
var { a: a57, o: o44, z: z45, i: i56 } = lk;
var rules56 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "dl",
  "cr"
];
var goal55 = sequent([o44.p2.disjunction(a57("p"), a57("q"))], [a57("p"), a57("q")]);
var solution55 = z45.dl(
  z45.sRotRF(z45.swr(a57("q"), i56.i(a57("p")))),
  z45.swr(a57("p"), i56.i(a57("q")))
);
var ch6branching1 = challenge({ rules: rules56, goal: goal55, solution: solution55 });

// src/challenges/ch6-branching-2.ts
var { a: a58, o: o45, z: z46, i: i57 } = lk;
var rules57 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "dl",
  "cr"
];
var goal56 = sequent([a58("p"), a58("q")], [o45.p2.conjunction(a58("p"), a58("q"))]);
var solution56 = z46.cr(
  z46.swl(a58("q"), i57.i(a58("p"))),
  z46.sRotLF(z46.swl(a58("p"), i57.i(a58("q"))))
);
var ch6branching2 = challenge({ rules: rules57, goal: goal56, solution: solution56 });

// src/challenges/ch6-branching-3.ts
var { a: a59, o: o46, z: z47, i: i58 } = lk;
var rules58 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "dl",
  "cr"
];
var goal57 = sequent(
  [o46.p2.disjunction(a59("p"), a59("p"))],
  [o46.p2.conjunction(a59("p"), a59("p"))]
);
var solution57 = z47.dl(
  z47.cr(i58.i(a59("p")), i58.i(a59("p"))),
  z47.cr(i58.i(a59("p")), i58.i(a59("p")))
);
var ch6branching3 = challenge({ rules: rules58, goal: goal57, solution: solution57 });

// src/challenges/ch6-branching-4.ts
var { a: a60, o: o47, z: z48, i: i59 } = lk;
var rules59 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "cl",
  "cr",
  "dl",
  "dr"
];
var goal58 = sequent(
  [o47.p2.disjunction(a60("p"), a60("q"))],
  [o47.p2.disjunction(a60("q"), a60("p"))]
);
var solution58 = z48.dr(
  z48.dl(z48.swr(a60("q"), i59.i(a60("p"))), z48.sRotRF(z48.swr(a60("p"), i59.i(a60("q")))))
);
var ch6branching4 = challenge({ rules: rules59, goal: goal58, solution: solution58 });

// src/challenges/ch6-branching-5.ts
var { a: a61, o: o48, z: z49, i: i60 } = lk;
var rules60 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "cl",
  "cr",
  "dl",
  "dr"
];
var goal59 = sequent(
  [o48.p2.conjunction(a61("p"), a61("q"))],
  [o48.p2.conjunction(a61("q"), a61("p"))]
);
var solution59 = z49.cl(
  z49.cr(z49.sRotLF(z49.swl(a61("p"), i60.i(a61("q")))), z49.swl(a61("q"), i60.i(a61("p"))))
);
var ch6branching5 = challenge({ rules: rules60, goal: goal59, solution: solution59 });

// src/challenges/ch6-branching-6.ts
var { a: a62, o: o49, z: z50, i: i61 } = lk;
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
var goal60 = conclusion(
  o49.p2.implication(
    o49.p1.negation(o49.p2.conjunction(a62("p"), a62("q"))),
    o49.p2.disjunction(o49.p1.negation(a62("p")), o49.p1.negation(a62("q")))
  )
);
var solution60 = z50.ir(
  z50.nl(
    z50.cr(
      z50.sRotRF(z50.dr(z50.nr(z50.swr(o49.p1.negation(a62("q")), i61.i(a62("p")))))),
      z50.sRotRF(z50.dr(z50.swr(o49.p1.negation(a62("p")), z50.nr(i61.i(a62("q"))))))
    )
  )
);
var ch6branching6 = challenge({ rules: rules61, goal: goal60, solution: solution60 });

// src/challenges/ch6-branching-7.ts
var { a: a63, o: o50, z: z51, i: i62 } = lk;
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
var goal61 = conclusion(
  o50.p2.implication(
    o50.p2.disjunction(o50.p1.negation(a63("p")), o50.p1.negation(a63("q"))),
    o50.p1.negation(o50.p2.conjunction(a63("p"), a63("q")))
  )
);
var solution61 = z51.ir(
  z51.nr(
    z51.cl(
      z51.sRotLF(
        z51.dl(
          z51.nl(z51.swl(a63("q"), i62.i(a63("p")))),
          z51.nl(z51.sRotLF(z51.swl(a63("p"), i62.i(a63("q")))))
        )
      )
    )
  )
);
var ch6branching7 = challenge({ rules: rules62, goal: goal61, solution: solution61 });

// src/challenges/ch6-branching-8.ts
var { a: a64, o: o51, z: z52, i: i63 } = lk;
var rules63 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "cl",
  "cr",
  "dl",
  "dr",
  "ir"
];
var goal62 = conclusion(
  o51.p2.implication(
    o51.p2.conjunction(a64("p"), o51.p2.disjunction(a64("q"), a64("r"))),
    o51.p2.disjunction(
      o51.p2.conjunction(a64("p"), a64("q")),
      o51.p2.conjunction(a64("p"), a64("r"))
    )
  )
);
var solution62 = z52.ir(
  z52.cl(
    z52.dr(
      z52.dl(
        z52.cr(
          z52.sRotRF(
            z52.swl(a64("q"), z52.swr(o51.p2.conjunction(a64("p"), a64("r")), i63.i(a64("p"))))
          ),
          z52.sRotLF(
            z52.sRotRF(
              z52.swl(
                a64("p"),
                z52.swr(o51.p2.conjunction(a64("p"), a64("r")), i63.i(a64("q")))
              )
            )
          )
        ),
        z52.swr(
          o51.p2.conjunction(a64("p"), a64("q")),
          z52.cr(
            z52.swl(a64("r"), i63.i(a64("p"))),
            z52.sRotLF(z52.swl(a64("p"), i63.i(a64("r"))))
          )
        )
      )
    )
  )
);
var ch6branching8 = challenge({ rules: rules63, goal: goal62, solution: solution62 });

// src/challenges/ch6-branching-9.ts
var { a: a65, o: o52, z: z53, i: i64 } = lk;
var rules64 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "cl",
  "cr",
  "dl",
  "dr",
  "ir"
];
var goal63 = conclusion(
  o52.p2.implication(
    o52.p2.disjunction(
      o52.p2.conjunction(a65("p"), a65("q")),
      o52.p2.conjunction(a65("p"), a65("r"))
    ),
    o52.p2.conjunction(a65("p"), o52.p2.disjunction(a65("q"), a65("r")))
  )
);
var solution63 = z53.ir(
  z53.dl(
    z53.cl(
      z53.cr(
        z53.swl(a65("q"), i64.i(a65("p"))),
        z53.dr(z53.sRotLF(z53.sRotRF(z53.swl(a65("p"), z53.swr(a65("r"), i64.i(a65("q")))))))
      )
    ),
    z53.cl(
      z53.cr(
        z53.swl(a65("r"), i64.i(a65("p"))),
        z53.dr(z53.sRotLF(z53.swl(a65("p"), z53.swr(a65("q"), i64.i(a65("r"))))))
      )
    )
  )
);
var ch6branching9 = challenge({ rules: rules64, goal: goal63, solution: solution63 });

// src/challenges/ch7-completeness-1.ts
var { a: a66, o: o53, z: z54, i: i65 } = lk;
var rules65 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "il",
  "ir"
];
var goal64 = sequent([a66("p"), o53.p2.implication(a66("p"), a66("q"))], [a66("q")]);
var solution64 = z54.il(
  z54.sRotRF(z54.swr(a66("q"), i65.i(a66("p")))),
  z54.sRotLF(z54.swl(a66("p"), i65.i(a66("q"))))
);
var ch7completeness1 = challenge({ rules: rules65, goal: goal64, solution: solution64 });

// src/challenges/ch7-completeness-2.ts
var { a: a67, o: o54, z: z55, i: i66 } = lk;
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
  "il",
  "ir"
];
var goal65 = conclusion(
  o54.p2.implication(
    o54.p2.implication(a67("p"), a67("q")),
    o54.p2.implication(o54.p1.negation(a67("q")), o54.p1.negation(a67("p")))
  )
);
var solution65 = z55.ir(
  z55.ir(
    z55.sRotLF(
      z55.il(
        z55.sRotRF(z55.nr(z55.sRotLF(z55.swl(o54.p1.negation(a67("q")), i66.i(a67("p")))))),
        z55.sRotLF(z55.nl(z55.sRotRF(z55.swr(o54.p1.negation(a67("p")), i66.i(a67("q"))))))
      )
    )
  )
);
var ch7completeness2 = challenge({ rules: rules66, goal: goal65, solution: solution65 });

// src/challenges/ch7-completeness-3.ts
var { a: a68, o: o55, z: z56, i: i67 } = lk;
var rules67 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "il",
  "ir"
];
var goal66 = conclusion(
  o55.p2.implication(
    o55.p2.implication(a68("p"), a68("q")),
    o55.p2.implication(
      o55.p2.implication(a68("q"), a68("r")),
      o55.p2.implication(a68("p"), a68("r"))
    )
  )
);
var solution66 = z56.ir(
  z56.ir(
    z56.ir(
      z56.sRotLF(
        z56.il(
          z56.sRotLF(
            z56.il(
              z56.sRotRF(z56.swr(a68("r"), z56.swr(a68("q"), i67.i(a68("p"))))),
              z56.sRotLF(z56.swl(a68("p"), z56.swr(a68("p"), i67.i(a68("r")))))
            )
          ),
          z56.sRotLF(
            z56.il(
              z56.sRotLF(z56.sRotRF(z56.swl(a68("p"), z56.swr(a68("r"), i67.i(a68("q")))))),
              z56.sRotLB(z56.swl(a68("q"), z56.swl(a68("p"), i67.i(a68("r")))))
            )
          )
        )
      )
    )
  )
);
var ch7completeness3 = challenge({ rules: rules67, goal: goal66, solution: solution66 });

// src/challenges/ch7-completeness-4.ts
var { a: a69, o: o56, z: z57, i: i68 } = lk;
var rules68 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "cl",
  "cr",
  "il",
  "ir"
];
var goal67 = conclusion(
  o56.p2.implication(
    o56.p2.implication(o56.p2.conjunction(a69("p"), a69("q")), a69("r")),
    o56.p2.implication(a69("p"), o56.p2.implication(a69("q"), a69("r")))
  )
);
var solution67 = z57.ir(
  z57.ir(
    z57.ir(
      z57.sRotLF(
        z57.il(
          z57.cr(
            z57.sRotRF(z57.swl(a69("q"), z57.swr(a69("r"), i68.i(a69("p"))))),
            z57.sRotLF(z57.sRotRF(z57.swl(a69("p"), z57.swr(a69("r"), i68.i(a69("q"))))))
          ),
          z57.sRotLB(z57.swl(a69("q"), z57.swl(a69("p"), i68.i(a69("r")))))
        )
      )
    )
  )
);
var ch7completeness4 = challenge({ rules: rules68, goal: goal67, solution: solution67 });

// src/challenges/ch7-completeness-5.ts
var { a: a70, o: o57, z: z58, i: i69 } = lk;
var rules69 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "cl",
  "cr",
  "il",
  "ir"
];
var goal68 = conclusion(
  o57.p2.implication(
    o57.p2.implication(o57.p2.implication(a70("p"), a70("q")), a70("p")),
    a70("p")
  )
);
var solution68 = z58.ir(z58.il(z58.ir(z58.swr(a70("q"), i69.i(a70("p")))), i69.i(a70("p"))));
var ch7completeness5 = challenge({ rules: rules69, goal: goal68, solution: solution68 });

// src/challenges/ch7-completeness-6.ts
var { a: a71, o: o58, z: z59, i: i70 } = lk;
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
  "il",
  "ir"
];
var goal69 = conclusion(
  o58.p2.implication(
    o58.p2.implication(a71("p"), a71("q")),
    o58.p2.implication(
      o58.p2.implication(a71("p"), o58.p1.negation(a71("q"))),
      o58.p1.negation(a71("p"))
    )
  )
);
var solution69 = z59.ir(
  z59.ir(
    z59.il(
      z59.il(
        z59.sRotRF(z59.nr(z59.swr(a71("p"), i70.i(a71("p"))))),
        z59.sRotRF(z59.nr(z59.sRotLF(z59.swl(a71("q"), i70.i(a71("p"))))))
      ),
      z59.sRotLF(
        z59.il(
          z59.sRotRF(z59.nr(z59.sRotLF(z59.swl(o58.p1.negation(a71("q")), i70.i(a71("p")))))),
          z59.sRotLF(z59.nl(z59.sRotRF(z59.swr(o58.p1.negation(a71("p")), i70.i(a71("q"))))))
        )
      )
    )
  )
);
var ch7completeness6 = challenge({ rules: rules70, goal: goal69, solution: solution69 });

// src/challenges/ch7-completeness-7.ts
var { a: a72, o: o59, z: z60, i: i71 } = lk;
var rules71 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "il",
  "ir"
];
var goal70 = conclusion(
  o59.p2.implication(
    o59.p2.implication(a72("p"), o59.p2.implication(a72("p"), a72("q"))),
    o59.p2.implication(a72("p"), a72("q"))
  )
);
var solution70 = z60.ir(
  z60.il(
    z60.sRotRF(z60.ir(z60.swr(a72("q"), i71.i(a72("p"))))),
    i71.i(o59.p2.implication(a72("p"), a72("q")))
  )
);
var ch7completeness7 = challenge({ rules: rules71, goal: goal70, solution: solution70 });

// src/challenges/ch7-completeness-8.ts
var { a: a73, o: o60, z: z61, i: i72 } = lk;
var rules72 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "il",
  "ir"
];
var goal71 = conclusion(
  o60.p2.implication(
    o60.p2.implication(o60.p2.implication(a73("p"), a73("q")), a73("q")),
    o60.p2.implication(o60.p2.implication(a73("q"), a73("p")), a73("p"))
  )
);
var solution71 = z61.ir(
  z61.ir(
    z61.sRotLF(
      z61.il(
        z61.ir(
          z61.sRotLF(
            z61.swl(o60.p2.implication(a73("q"), a73("p")), z61.swr(a73("q"), i72.i(a73("p"))))
          )
        ),
        z61.sRotLF(
          z61.il(
            z61.sRotRF(z61.swr(a73("p"), i72.i(a73("q")))),
            z61.sRotLF(z61.swl(a73("q"), i72.i(a73("p"))))
          )
        )
      )
    )
  )
);
var ch7completeness8 = challenge({ rules: rules72, goal: goal71, solution: solution71 });

// src/challenges/ch7-completeness-9.ts
var { a: a74, o: o61, z: z62, i: i73 } = lk;
var rules73 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB",
  "cl",
  "cr",
  "il",
  "ir"
];
var goal72 = conclusion(
  o61.p2.implication(
    o61.p2.implication(a74("p"), o61.p2.implication(a74("q"), a74("r"))),
    o61.p2.implication(o61.p2.conjunction(a74("p"), a74("q")), a74("r"))
  )
);
var solution72 = z62.ir(
  z62.ir(
    z62.cl(
      z62.sRotLF(
        z62.il(
          z62.sRotRF(z62.swl(a74("q"), z62.swr(a74("r"), i73.i(a74("p"))))),
          z62.il(
            z62.sRotLF(z62.sRotRF(z62.swl(a74("p"), z62.swr(a74("r"), i73.i(a74("q")))))),
            z62.sRotLB(z62.swl(a74("q"), z62.swl(a74("p"), i73.i(a74("r")))))
          )
        )
      )
    )
  )
);
var ch7completeness9 = challenge({ rules: rules73, goal: goal72, solution: solution72 });

// src/challenges/ch8-constants-1.ts
var { a: a75, o: o62, z: z63, i: i74 } = lk;
var rules74 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal73 = sequent([a75("p"), o62.p0.verum, a75("q")], [a75("r"), o62.p0.verum, a75("s")]);
var solution73 = z63.sRotLF(
  z63.sRotRF(
    z63.swl(a75("p"), z63.swl(a75("q"), z63.swr(a75("s"), z63.swr(a75("r"), i74.i(o62.p0.verum)))))
  )
);
var ch8constants1 = challenge({ rules: rules74, goal: goal73, solution: solution73 });

// src/challenges/ch8-constants-2.ts
var { a: a76, o: o63, z: z64, i: i75 } = lk;
var rules75 = [
  "i",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal74 = sequent(
  [a76("s"), o63.p0.falsum, a76("r")],
  [a76("q"), o63.p0.falsum, a76("p")]
);
var solution74 = z64.sRotLF(
  z64.sRotRF(
    z64.swl(
      a76("s"),
      z64.swl(a76("r"), z64.swr(a76("p"), z64.swr(a76("q"), i75.i(o63.p0.falsum))))
    )
  )
);
var ch8constants2 = challenge({ rules: rules75, goal: goal74, solution: solution74 });

// src/challenges/ch8-constants-3.ts
var { a: a77, o: o64, z: z65, i: i76 } = lk;
var rules76 = [
  "f",
  "v",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal75 = sequent([a77("p"), o64.p0.verum, a77("q")], [a77("q"), o64.p0.verum, a77("p")]);
var solution75 = z65.sRotRF(
  z65.swl(
    a77("q"),
    z65.swl(o64.p0.verum, z65.swl(a77("p"), z65.swr(a77("p"), z65.swr(a77("q"), i76.v()))))
  )
);
var ch8constants3 = challenge({ rules: rules76, goal: goal75, solution: solution75 });

// src/challenges/ch8-constants-4.ts
var { a: a78, o: o65, z: z66, i: i77 } = lk;
var rules77 = [
  "f",
  "v",
  "swl",
  "swr",
  "sRotLF",
  "sRotRF",
  "sRotLB",
  "sRotRB"
];
var goal76 = sequent(
  [a78("r"), o65.p0.falsum, a78("s")],
  [a78("s"), o65.p0.falsum, a78("r")]
);
var solution76 = z66.sRotLF(
  z66.swl(
    a78("r"),
    z66.swl(a78("s"), z66.swr(a78("s"), z66.swr(o65.p0.falsum, z66.swr(a78("r"), i77.f()))))
  )
);
var ch8constants4 = challenge({ rules: rules77, goal: goal76, solution: solution76 });

// src/challenges/ch8-constants-5.ts
var { a: a79, o: o66, z: z67, i: i78 } = lk;
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
var ch8constants5 = challenge({ rules: rules78, goal: goal77, solution: solution77 });

// src/challenges/ch8-constants-6.ts
var { a: a80, o: o67, z: z68, i: i79 } = lk;
var rules79 = [
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
var ch8constants6 = challenge({ rules: rules79, goal: goal78, solution: solution78 });

// src/challenges/ch8-constants-7.ts
var { a: a81, o: o68, z: z69, i: i80 } = lk;
var rules80 = [
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
var goal79 = sequent(
  [o68.p2.disjunction(o68.p0.falsum, a81("p"))],
  [o68.p2.conjunction(o68.p0.verum, a81("p"))]
);
var solution79 = z69.dl(
  z69.swr(o68.p2.conjunction(o68.p0.verum, a81("p")), i80.f()),
  z69.cr(z69.swl(a81("p"), i80.v()), i80.i(a81("p")))
);
var ch8constants7 = challenge({ rules: rules80, goal: goal79, solution: solution79 });

// src/challenges/ch8-constants-8.ts
var { a: a82, o: o69, z: z70, i: i81 } = lk;
var rules81 = [
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
var ch8constants8 = challenge({ rules: rules81, goal: goal80, solution: solution80 });

// src/challenges/ch8-constants-9.ts
var { a: a83, o: o70, z: z71, i: i82 } = lk;
var rules82 = [
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
var ch8constants9 = challenge({ rules: rules82, goal: goal81, solution: solution81 });

// src/challenges/ch9-consolidation-1.ts
var { a: a84, o: o71, z: z72, i: i83 } = lk;
var rules83 = [
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
var ch9consolidation1 = challenge({ rules: rules83, goal: goal82, solution: solution82 });

// src/challenges/ch9-consolidation-2.ts
var { a: a85, o: o72, z: z73, i: i84 } = lk;
var rules84 = [
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
var ch9consolidation2 = challenge({ rules: rules84, goal: goal83, solution: solution83 });

// src/challenges/ch9-consolidation-3.ts
var { a: a86, o: o73, z: z74, i: i85 } = lk;
var rules85 = [
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
var ch9consolidation3 = challenge({ rules: rules85, goal: goal84, solution: solution84 });

// src/challenges/ch9-consolidation-4.ts
var { a: a87, o: o74, z: z75, i: i86 } = lk;
var rules86 = [
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
var goal85 = conclusion(o74.p2.disjunction(a87("p"), o74.p1.negation(a87("p"))));
var solution85 = z75.dr(z75.sRotRF(z75.nr(i86.i(a87("p")))));
var ch9consolidation4 = challenge({ rules: rules86, goal: goal85, solution: solution85 });

// src/challenges/ch9-consolidation-5.ts
var { a: a88, o: o75, z: z76, i: i87 } = lk;
var rules87 = [
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
var ch9consolidation5 = challenge({ rules: rules87, goal: goal86, solution: solution86 });

// src/challenges/ch9-consolidation-6.ts
var { a: a89, o: o76, z: z77, i: i88 } = lk;
var rules88 = [
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
var ch9consolidation6 = challenge({ rules: rules88, goal: goal87, solution: solution87 });

// src/challenges/ch9-consolidation-7.ts
var { a: a90, o: o77, z: z78, i: i89 } = lk;
var rules89 = [
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
var goal88 = conclusion(o77.p2.implication(a90("p"), a90("p")));
var solution88 = z78.ir(i89.i(a90("p")));
var ch9consolidation7 = challenge({ rules: rules89, goal: goal88, solution: solution88 });

// src/challenges/index.ts
var challenges = {
  ch0identity1,
  ch0identity2,
  ch0identity3,
  ch0identity4,
  ch0identity5,
  ch0identity6,
  ch0identity7,
  ch0identity8,
  ch0identity9,
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
  ch4theorem1,
  ch4theorem2,
  ch4theorem3,
  ch4theorem4,
  ch4theorem5,
  ch4theorem6,
  ch4theorem7,
  ch4theorem8,
  ch4theorem9,
  ch5composition1,
  ch5composition2,
  ch5composition3,
  ch5composition4,
  ch5composition5,
  ch5composition6,
  ch5composition7,
  ch5composition8,
  ch5composition9,
  ch6branching1,
  ch6branching2,
  ch6branching3,
  ch6branching4,
  ch6branching5,
  ch6branching6,
  ch6branching7,
  ch6branching8,
  ch6branching9,
  ch7completeness1,
  ch7completeness2,
  ch7completeness3,
  ch7completeness4,
  ch7completeness5,
  ch7completeness6,
  ch7completeness7,
  ch7completeness8,
  ch7completeness9,
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

// src/render/block.ts
var space = " ";
function split3(s, d) {
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
  const [first, ...rest] = split3(b, "\n");
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
  const line2 = spaced([line(lineWidth), note]);
  const line3 = center2(lineWidth)(root);
  const aligned = align(line1, pad(leftify(last3, line2, line3)));
  if (aligned != null) {
    return aligned;
  }
  return pad(leftify(line1, line2, line3));
}
function lastLine(block) {
  const [first, ...rest] = split3(block, "\n");
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
  return { text, active: false };
}
function active(text) {
  return { text, active: true };
}
function plain(segments) {
  return segments.map((s) => s.text).join("");
}
function escape(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function html(segments) {
  return segments.map(
    (s) => s.active ? `<span class="connective-active">${escape(s.text)}</span>` : escape(s.text)
  ).join("");
}
function trim(segments) {
  const result = [...segments];
  for (let i90 = 0; i90 < result.length; i90++) {
    const s = result[i90];
    if (s === void 0) break;
    const trimmed = s.text.trimStart();
    result[i90] = { ...s, text: trimmed };
    if (trimmed.length > 0) break;
  }
  for (let i90 = result.length - 1; i90 >= 0; i90--) {
    const s = result[i90];
    if (s === void 0) break;
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
function printUnary(key, activeConn = false) {
  return (a91) => (theme) => {
    const [s0, s1] = theme[key];
    return [
      activeConn ? active(s0) : of2(s0),
      ...a91(theme),
      of2(s1)
    ];
  };
}
function printBinary(key, activeConn = false) {
  return (a91, b) => (theme) => {
    const [s0, s1, s2] = theme[key];
    return [
      of2(s0),
      ...a91(theme),
      activeConn ? active(s1) : of2(s1),
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
  return print("atom")(printString(chr));
}
function fromFalsum(_falsum) {
  return print("falsum")();
}
function fromVerum(_verum) {
  return print("verum")();
}
function fromNegation({ negand }, activeConnective = false) {
  const expand = (operand) => {
    const optional = () => print("optional")(fromProp(operand));
    const parenthesized = () => print("parenthesis")(fromProp(operand));
    return matchRaw(operand, {
      atom: fromProp,
      falsum: optional,
      verum: optional,
      negation: optional,
      conjunction: parenthesized,
      disjunction: parenthesized,
      implication: parenthesized
    });
  };
  return printUnary("negation", activeConnective)(expand(negand));
}
function fromConjunction({ leftConjunct, rightConjunct }, activeConnective = false) {
  const expand = (operand) => {
    const optional = () => print("optional")(fromProp(operand));
    const parenthesized = () => print("parenthesis")(fromProp(operand));
    return matchRaw(operand, {
      atom: fromProp,
      falsum: optional,
      verum: optional,
      negation: optional,
      conjunction: parenthesized,
      disjunction: parenthesized,
      implication: parenthesized
    });
  };
  return printBinary("conjunction", activeConnective)(
    expand(leftConjunct),
    expand(rightConjunct)
  );
}
function fromDisjunction({ leftDisjunct, rightDisjunct }, activeConnective = false) {
  const expand = (operand) => {
    const optional = () => print("optional")(fromProp(operand));
    const parenthesized = () => print("parenthesis")(fromProp(operand));
    return matchRaw(operand, {
      atom: fromProp,
      falsum: optional,
      verum: optional,
      negation: optional,
      conjunction: parenthesized,
      disjunction: parenthesized,
      implication: parenthesized
    });
  };
  return printBinary("disjunction", activeConnective)(
    expand(leftDisjunct),
    expand(rightDisjunct)
  );
}
function fromImplication({ antecedent, consequent }, activeConnective = false) {
  const expand = (operand) => {
    const optional = () => print("optional")(fromProp(operand));
    const parenthesized = () => print("parenthesis")(fromProp(operand));
    return matchRaw(operand, {
      atom: fromProp,
      falsum: optional,
      verum: optional,
      negation: optional,
      conjunction: optional,
      disjunction: optional,
      implication: parenthesized
    });
  };
  return printBinary("implication", activeConnective)(
    expand(antecedent),
    expand(consequent)
  );
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
function fromSequent(judgement, ruleIds = []) {
  const { antecedent, succedent } = judgement;
  const activeLeft = ruleIds.some(
    (id) => id in leftLogical && rules[id].isResult(judgement)
  );
  const activeRight = ruleIds.some(
    (id) => id in rightLogical && rules[id].isResult(judgement)
  );
  const antPrinters = antecedent.map(
    (f2, i90) => activeLeft && i90 === antecedent.length - 1 ? fromProp(f2, true) : fromProp(f2)
  );
  const sucPrinters = succedent.map(
    (f2, i90) => activeRight && i90 === 0 ? fromProp(f2, true) : fromProp(f2)
  );
  return (t) => trim(
    print("sequent")(
      printArray("formulas")(antPrinters),
      printArray("formulas")(sucPrinters)
    )(t)
  );
}
function left3(n = null) {
  const l = "L";
  return n != null ? l + n : l;
}
function right2(n = null) {
  const r = "R";
  return n != null ? r + n : r;
}
function fromRuleId(s) {
  return (t) => [
    of2(
      matchRuleId(s, {
        i: () => "I",
        f: () => "\u22A5",
        v: () => "\u22A4",
        cl: () => t.conjunction.join(empty3) + left3(),
        dr: () => t.disjunction.join(empty3) + right2(),
        cl1: () => t.conjunction.join(empty3) + left3("\u2081"),
        dr1: () => t.disjunction.join(empty3) + right2("\u2081"),
        cl2: () => t.conjunction.join(empty3) + left3("\u2082"),
        dr2: () => t.disjunction.join(empty3) + right2("\u2082"),
        dl: () => t.disjunction.join(empty3) + left3(),
        cr: () => t.conjunction.join(empty3) + right2(),
        il: () => t.implication.join(empty3) + left3(),
        ir: () => t.implication.join(empty3) + right2(),
        nl: () => t.negation.join(empty3) + left3(),
        nr: () => t.negation.join(empty3) + right2(),
        swl: () => "WL",
        swr: () => "WR",
        scl: () => "CL",
        scr: () => "CR",
        sRotLF: () => "\u21B6L",
        sRotRF: () => "\u21B7R",
        sRotLB: () => "\u21B7L",
        sRotRB: () => "\u21B6R",
        sxl: () => "XL",
        sxr: () => "XR",
        a1: () => "a1",
        a2: () => "a2",
        a3: () => "a3",
        cut: () => "cut",
        mp: () => "mp"
      })
    )
  ];
}
function fromPremise({ result }) {
  return plain(fromSequent(result)(basic));
}
function fromTransformation({ rule, deps, result }) {
  return treeAuto(
    plain(fromSequent(result)(basic)),
    deps.map(fromDerivation),
    "(" + plain(fromRuleId(rule)(basic)) + ")"
  );
}
function fromDerivation(treelike) {
  switch (treelike.kind) {
    case "premise":
      return fromPremise(treelike);
    case "transformation":
      return fromTransformation(treelike);
  }
}
var unit = 16;
var half = center2(2 * unit);
var full = center2(4 * unit);
var fromFocus = (s) => {
  return fromDerivation(s.derivation);
};

// src/interactive/workspace.ts
var Workspace = class {
  theorems;
  conjectures = {};
  theoremKeys;
  selected;
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
    return this.conjectures[this.selected];
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
    const cursor = this.currentConjecture();
    const update = applyEvent(cursor, ev);
    this.conjectures[this.selected] = update;
  }
};

// src/interactive/repl.ts
function* repl(workspace) {
  let output = [of2('\nWelcome!\n\nType "help" for help')];
  while (true) {
    const input = yield [...output, of2("\n")];
    const [cmd, ...args] = split2(input, " ");
    switch (cmd) {
      case "quit":
        return [of2("\nExiting...")];
      case "help": {
        const [arg] = args;
        if (arg == null) {
          output = [
            of2(
              "\nSystem commands:\n  help - display this manual\n  help <rule> - display rule description\n  list - list all conjectures\n  prev - select previous conjecture\n  next - select next conjecture\n  undo - undo applied rule in current conjecture\n  reset - undo all applied rules of current conjecture\n  select <conjecture> - select active conjecture"
            )
          ];
          break;
        }
        if (isRuleId(arg)) {
          output = [
            of2(
              '\nRule "' + arg + '":\n\n' + fromDerivation(rules[arg].example)
            )
          ];
          break;
        }
        output = [of2('\nUnknown rule "' + arg + '"')];
        break;
      }
      case "list":
        output = [
          of2(
            "\nConjectures:\n" + workspace.listConjectures().map(
              ([id]) => (id === workspace.selected ? "*" : " ") + " " + id
            ).join("\n")
          )
        ];
        break;
      case "prev":
        workspace.selectConjecture(workspace.previousConjectureId());
        output = status(workspace.currentConjecture());
        break;
      case "next":
        workspace.selectConjecture(workspace.nextConjectureId());
        output = status(workspace.currentConjecture());
        break;
      case "select": {
        const [conjectureId] = args;
        if (!workspace.isConjectureId(conjectureId)) {
          output = [of2('\nUnknown conjecture "' + conjectureId + '"')];
          break;
        }
        workspace.selectConjecture(conjectureId);
        output = status(workspace.currentConjecture());
        break;
      }
      default: {
        const ev = parseEvent(cmd);
        if (!ev) {
          output = [of2('\nUnknown command "' + cmd + '"')];
          break;
        }
        workspace.applyEvent(ev);
        output = status(workspace.currentConjecture());
      }
    }
  }
}
var status = (s) => {
  const rules90 = applicableRules2(s);
  return [
    of2("\n"),
    ...fromSequent(activeSequent(s), rules90)(basic),
    of2("\n\n" + fromFocus(s)),
    of2("\nRules: " + rules90.join(", ")),
    of2("\nProof: undo, reset"),
    of2("\nConjectures: prev, next, select, list"),
    of2("\nSystem: quit, help\n"),
    ...isProof(s.derivation) ? [of2("\nConglaturations!\n")] : []
  ];
};

// src/web/game.ts
var qwertyKeyMap = {
  Escape: "menu",
  Backquote: "level",
  KeyR: "reset",
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
  Backspace: "undo"
};
var codeToLabel = (code) => {
  const special = {
    Backquote: "\xA7",
    Semicolon: "\xF6",
    Space: "\u23B5",
    Enter: "\u21B5",
    Backspace: "\u232B",
    Escape: "\u238B"
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
var ruleAction = {
  swl: "leftWeakening",
  sRotLF: "leftRotateLeft",
  sRotLB: "leftRotateRight",
  nl: "leftConnective",
  cl: "leftConnective",
  cl1: "leftConnective",
  cl2: "leftConnective",
  dl: "leftConnective",
  il: "leftConnective",
  swr: "rightWeakening",
  sRotRB: "rightRotateLeft",
  sRotRF: "rightRotateRight",
  nr: "rightConnective",
  dr: "rightConnective",
  dr1: "rightConnective",
  dr2: "rightConnective",
  cr: "rightConnective",
  ir: "rightConnective",
  i: "axiom",
  f: "axiom",
  v: "axiom",
  a1: "axiom",
  a2: "axiom",
  a3: "axiom"
};
var keyHintBadge = (hint) => {
  const badge = document.createElement("span");
  badge.setAttribute("class", "key-hint");
  badge.textContent = hint;
  return badge;
};
var ps5KeyMap = {
  12: "leftWeakening",
  14: "leftRotateLeft",
  15: "leftRotateRight",
  13: "leftConnective",
  3: "rightWeakening",
  2: "rightRotateLeft",
  1: "rightRotateRight",
  0: "rightConnective",
  5: "axiom",
  4: "undo"
};
var createButton = (label, disabled, onClick, hint) => {
  const el = document.createElement("pre");
  el.setAttribute("class", "button" + (disabled ? " disabled" : ""));
  if (!disabled && onClick) el.onclick = onClick;
  if (hint !== void 0) {
    el.appendChild(keyHintBadge(hint));
    el.appendChild(document.createTextNode(" " + label));
  } else {
    el.innerHTML = label;
  }
  return el;
};
var createProof = (workspace) => {
  const pre = document.createElement("pre");
  pre.setAttribute("class", "proof");
  const s = workspace.currentConjecture();
  if (s.derivation.kind === "transformation") {
    pre.innerHTML = "\n" + fromFocus(s) + "\n";
  }
  return pre;
};
var createPlayArea = (workspace, makeCongrats) => {
  const panel = document.createElement("div");
  panel.setAttribute("class", "playarea");
  if (workspace.isSolved()) {
    panel.appendChild(makeCongrats());
  } else {
    const active2 = document.createElement("div");
    active2.setAttribute("class", "current");
    active2.innerHTML = html(
      fromSequent(
        activeSequent(workspace.currentConjecture()),
        workspace.applicableRules()
      )(basic)
    );
    panel.appendChild(active2);
  }
  panel.appendChild(createProof(workspace));
  return panel;
};
var createPanel = (className, ruleRecord, ls, rules90, solved, onApply) => {
  const panel = document.createElement("div");
  panel.setAttribute("class", className);
  Object.entries(ruleRecord).forEach(([key, rule]) => {
    if (!rule || !rules90.includes(key)) return;
    const disabled = solved || !ls.includes(key);
    const pre = document.createElement("pre");
    pre.setAttribute("class", "rule button" + (disabled ? " disabled" : ""));
    if (!disabled) pre.onclick = () => onApply(key);
    pre.innerHTML = fromDerivation(rule.example);
    const action = ruleAction[key];
    const hint = action !== void 0 ? actionKeyHint[action] : void 0;
    if (hint !== void 0) pre.appendChild(keyHintBadge(hint));
    panel.appendChild(pre);
  });
  return panel;
};
var createBench = (workspace, makeCongrats, controlsEl, rerender) => {
  const ls = workspace.applicableRules();
  const rules90 = workspace.availableRules();
  const solved = workspace.isSolved();
  const apply2 = (key) => {
    if (isReverseId0(key)) workspace.applyEvent(reverse02(key));
    rerender();
  };
  const applyCenter = (key) => {
    if (isReverseId0(key)) workspace.applyEvent(reverse02(key));
    rerender();
  };
  const panel = document.createElement("div");
  panel.setAttribute("class", "bench");
  panel.appendChild(createPanel("left", left, ls, rules90, solved, apply2));
  panel.appendChild(createPanel("main", center, ls, rules90, solved, applyCenter));
  panel.appendChild(createPanel("right", right, ls, rules90, solved, apply2));
  panel.appendChild(createPlayArea(workspace, makeCongrats));
  panel.appendChild(controlsEl);
  return panel;
};
var autoRule = (workspace, rules90) => {
  const available = workspace.applicableRules();
  const [first] = rules90.filter((rule) => available.includes(rule));
  if (!first) return;
  if (isReverseId0(first)) workspace.applyEvent(reverse02(first));
};
var createDispatch = (getWorkspace, rerender, navigate2, onSolved, onLevel) => (action) => {
  if (action === "menu") {
    navigate2("menu");
    return;
  }
  if (action === "level") {
    onLevel?.();
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
    case "axiom":
      autoRule(workspace, keys(center));
      break;
    case "undo":
      workspace.applyEvent(undo());
      break;
  }
  rerender();
};
var setupGamepad = (dispatch) => {
  const oldPresses = [];
  let active2 = false;
  const loop = () => {
    if (!active2) return;
    const gp = navigator.getGamepads()[0];
    if (gp) {
      for (const [button, action] of Object.entries(ps5KeyMap)) {
        const index = Number(button);
        const oldPress = oldPresses[index] ?? false;
        const newPress = gp.buttons[index]?.pressed ?? false;
        if (newPress !== oldPress) {
          if (newPress) dispatch(action);
          oldPresses[index] = newPress;
        }
      }
    }
    requestAnimationFrame(loop);
  };
  const onConnected = () => {
    active2 = true;
    loop();
  };
  window.addEventListener("gamepadconnected", onConnected);
  return () => {
    active2 = false;
    window.removeEventListener("gamepadconnected", onConnected);
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
    const rules90 = document.createElement("div");
    rules90.setAttribute("class", "rules");
    rules90.innerHTML = challenge2.rules.map((rule) => fromRuleId(rule)(basic)).join(", ");
    item.appendChild(rules90);
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
var createControls = (ws, listingEl, rerender, navigate2) => {
  const canUndo = activePath(ws.currentConjecture()).length > 0;
  const panel = document.createElement("div");
  panel.setAttribute("class", "controls");
  panel.appendChild(
    createButton(
      "undo",
      !canUndo,
      () => {
        ws.applyEvent({ kind: "undo" });
        rerender();
      },
      actionKeyHint["undo"]
    )
  );
  panel.appendChild(
    createButton(
      "reset",
      !canUndo,
      () => {
        ws.applyEvent(reset());
        rerender();
      },
      actionKeyHint["reset"]
    )
  );
  panel.appendChild(
    createButton(
      "level",
      false,
      () => listingEl.removeAttribute("style"),
      actionKeyHint["level"]
    )
  );
  panel.appendChild(
    createButton("menu", false, () => navigate2("menu"), actionKeyHint["menu"])
  );
  return panel;
};
var createCongrats = (ws, selectLevel, rerender) => {
  const panel = document.createElement("div");
  const banner = document.createElement("div");
  banner.setAttribute("class", "congrats");
  const hurray = document.createElement("div");
  hurray.setAttribute("class", "hurray");
  hurray.innerHTML = "\n\n\u{1F389} Conglaturations! \u{1F389}\n";
  banner.appendChild(hurray);
  panel.appendChild(banner);
  const buttons = document.createElement("div");
  buttons.setAttribute("class", "congrabuttons");
  buttons.appendChild(
    createButton(
      "Prev Level",
      false,
      () => selectLevel(ws.previousConjectureId())
    )
  );
  buttons.appendChild(
    createButton("Play Again", false, () => {
      ws.applyEvent(reset());
      rerender();
    })
  );
  buttons.appendChild(
    createButton("Next Level", false, () => selectLevel(ws.nextConjectureId()))
  );
  panel.appendChild(buttons);
  return panel;
};
var mountCampaign = (container, navigate2) => {
  const ws = new Workspace(challenges);
  const selectLevel = (id) => {
    if (ws.isConjectureId(id)) {
      ws.selectConjecture(id);
      history.pushState(
        { screen: "campaign", selected: id },
        "",
        `?mode=campaign&level=${id}`
      );
    }
    rerender();
  };
  let listingEl = createListing(ws, selectLevel);
  const rerender = () => {
    container.innerHTML = "";
    listingEl = createListing(ws, selectLevel);
    container.appendChild(listingEl);
    const controlsEl = createControls(ws, listingEl, rerender, navigate2);
    const makeCongrats = () => createCongrats(ws, selectLevel, rerender);
    container.appendChild(createBench(ws, makeCongrats, controlsEl, rerender));
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
  const dispatch = createDispatch(
    () => ws,
    rerender,
    navigate2,
    onSolved,
    () => listingEl.removeAttribute("style")
  );
  const params = new URLSearchParams(window.location.search);
  const level = params.get("level") ?? "";
  if (ws.isConjectureId(level)) {
    ws.selectConjecture(level);
  }
  rerender();
  const handleKey = (ev) => {
    console.log(ev.code);
    const action = qwertyKeyMap[ev.code];
    if (action) dispatch(action);
  };
  document.addEventListener("keydown", handleKey);
  const cleanupGamepad = setupGamepad(dispatch);
  const gen = repl(ws);
  gen.next("");
  Object.assign(window, {
    cmd: (input) => {
      const result = gen.next(input);
      console.log(plain(result.value));
      rerender();
      return result.done;
    }
  });
  return () => {
    document.removeEventListener("keydown", handleKey);
    cleanupGamepad();
  };
};

// src/web/challenge-pool.ts
var POOL_TARGET = 5;
var FALLBACK_SIZE = 5;
var FALLBACK_MIN_DIFFICULTY = 0;
var ChallengePool = class {
  pool = [];
  worker;
  constructor() {
    this.worker = new Worker("lk.w.js");
    this.worker.onmessage = (e) => {
      this.pool.push(e.data.challenge);
      if (this.pool.length >= POOL_TARGET) {
        this.send({ type: "pause" });
      }
    };
    this.worker.onerror = (e) => {
      console.error("Challenge worker error:", e.message);
    };
  }
  send(msg) {
    this.worker.postMessage(msg);
  }
  take() {
    const challenge2 = this.pool.shift();
    if (challenge2 !== void 0) {
      if (this.pool.length < POOL_TARGET) {
        this.send({ type: "resume" });
      }
      return challenge2;
    }
    const { goal: goal89, rules: rules90 } = random2(FALLBACK_SIZE, FALLBACK_MIN_DIFFICULTY)();
    return { goal: goal89, rules: rules90 };
  }
  cleanup() {
    this.worker.terminate();
  }
};

// src/web/random.ts
var newWorkspace = (pool) => new Workspace({ challenge: pool.take() });
var createControls2 = (ws, onNew, rerender, navigate2) => {
  const canUndo = activePath(ws.currentConjecture()).length > 0;
  const panel = document.createElement("div");
  panel.setAttribute("class", "controls");
  panel.appendChild(
    createButton(
      "undo",
      !canUndo,
      () => {
        ws.applyEvent({ kind: "undo" });
        rerender();
      },
      actionKeyHint["undo"]
    )
  );
  panel.appendChild(
    createButton(
      "reset",
      !canUndo,
      () => {
        ws.applyEvent(reset());
        rerender();
      },
      actionKeyHint["reset"]
    )
  );
  panel.appendChild(createButton("new", false, onNew));
  panel.appendChild(
    createButton("menu", false, () => navigate2("menu"), actionKeyHint["menu"])
  );
  return panel;
};
var createCongrats2 = (ws, onNew, rerender) => {
  const panel = document.createElement("div");
  const banner = document.createElement("div");
  banner.setAttribute("class", "congrats");
  const hurray = document.createElement("div");
  hurray.setAttribute("class", "hurray");
  hurray.innerHTML = "\n\n\u{1F389} Conglaturations! \u{1F389}\n";
  banner.appendChild(hurray);
  panel.appendChild(banner);
  const buttons = document.createElement("div");
  buttons.setAttribute("class", "congrabuttons");
  buttons.appendChild(
    createButton("Play Again", false, () => {
      ws.applyEvent(reset());
      rerender();
    })
  );
  buttons.appendChild(createButton("New Challenge", false, onNew));
  panel.appendChild(buttons);
  return panel;
};
var mountRandom = (container, navigate2) => {
  const pool = new ChallengePool();
  let ws = newWorkspace(pool);
  const onNew = () => {
    ws = newWorkspace(pool);
    rerender();
  };
  const rerender = () => {
    container.innerHTML = "";
    const controlsEl = createControls2(ws, onNew, rerender, navigate2);
    const makeCongrats = () => createCongrats2(ws, onNew, rerender);
    container.appendChild(createBench(ws, makeCongrats, controlsEl, rerender));
  };
  const onSolved = (action) => {
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
  const dispatch = createDispatch(() => ws, rerender, navigate2, onSolved);
  rerender();
  const handleKey = (ev) => {
    const action = qwertyKeyMap[ev.code];
    if (action) dispatch(action);
  };
  document.addEventListener("keydown", handleKey);
  const cleanupGamepad = setupGamepad(dispatch);
  return () => {
    document.removeEventListener("keydown", handleKey);
    cleanupGamepad();
    pool.cleanup();
  };
};

// src/web.ts
var cleanup = () => {
};
var navigate = (screen) => {
  cleanup();
  history.pushState(
    { screen },
    "",
    screen === "menu" ? window.location.pathname : `?mode=${screen}`
  );
  mount(screen);
};
var mount = (screen) => {
  const body = document.getElementById("body");
  if (!body) return;
  switch (screen) {
    case "menu":
      cleanup = mountMenu(body, navigate);
      break;
    case "campaign":
      cleanup = mountCampaign(body, navigate);
      break;
    case "random":
      cleanup = mountRandom(body, navigate);
      break;
  }
};
var init3 = () => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  if (mode === "campaign" || mode === "random") {
    mount(mode);
  } else if (params.get("level") !== null) {
    mount("campaign");
  } else {
    mount("menu");
  }
};
document.addEventListener("DOMContentLoaded", init3);
window.addEventListener("popstate", (event) => {
  cleanup();
  const screen = event.state?.screen ?? "menu";
  mount(screen);
});
