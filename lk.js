"use strict";
(() => {
  // src/utils/record.ts
  var keys = (s) => Object.keys(s);
  var get = (r, k) => r[k];
  var entries = (s) => Object.entries(s);

  // src/utils/array.ts
  var isNonEmptyArray = (a) => {
    return a.length > 0;
  };
  var head = (arr) => arr[0];
  var last = (arr) => arr.at(-1);
  var init = (arr) => arr.slice(0, -1);
  var zip = (a, b) => {
    return Array.from({ length: Math.min(a.length, b.length) }).map(
      (_, i2) => [a.at(i2), b.at(i2)]
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
  var equals = (a, b) => {
    switch (a.kind) {
      case "atom":
        return b.kind === "atom" && b.value === a.value;
      case "falsum":
        return b.kind === "falsum";
      case "verum":
        return b.kind === "verum";
      case "negation":
        return b.kind === "negation" && equals(b.negand, a.negand);
      case "implication":
        return b.kind === "implication" && equals(b.antecedent, a.antecedent) && equals(b.consequent, a.consequent);
      case "conjunction":
        return b.kind === "conjunction" && equals(b.leftConjunct, a.leftConjunct) && equals(b.rightConjunct, a.rightConjunct);
      case "disjunction":
        return b.kind === "disjunction" && equals(b.leftDisjunct, a.leftDisjunct) && equals(b.rightDisjunct, a.rightDisjunct);
    }
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
  var init2 = (a) => {
    return a.slice(0, -1);
  };
  var last2 = (a) => {
    return a[a.length - 1];
  };
  var isTupleOf0 = (arr) => arr.length === 0;
  var isTupleOf1 = (arr) => arr.length === 1;

  // src/model/sequent.ts
  var equalFormulas = (aa, ab) => {
    return aa.length === ab.length && zip(aa, ab).every(([a, b]) => equals(a, b));
  };
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
    return isActiveR(j) && r(head2(j.succedent));
  };
  var conclusion = (proposition) => sequent([], [proposition]);
  var isConclusion = (j) => {
    return j.antecedent.length === 0 && j.succedent.length === 1;
  };
  var equals2 = (a, b) => {
    return equalFormulas(a.antecedent, b.antecedent) && equalFormulas(a.succedent, b.succedent);
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
  var isEquivalent = (a, b) => equals2(a.result, b.result);
  var replaceDep = (parent, index, d) => {
    const deps = replaceItem(parent.deps, index, d);
    if (!deps) {
      return null;
    }
    if (!zip(parent.deps, deps).every(([a, b]) => isEquivalent(a, b))) {
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
    const paths = d.deps.flatMap((dep, i2) => branches(dep, [...path, i2]));
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
    const paths = d.deps.flatMap((dep, i2) => openBranches(dep, [...path, i2]));
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
  var applyCL = (s) => {
    const \u03B3 = init2(init2(s.result.antecedent));
    const a = last2(init2(s.result.antecedent));
    const b = last2(s.result.antecedent);
    const \u03B4 = s.result.succedent;
    return cl(sequent([...\u03B3, conjunction(a, b)], \u03B4), [s]);
  };
  var reverseCL = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const acb = last2(p.result.antecedent);
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
  var applyCL1 = (b, s) => {
    const \u03B3 = init2(s.result.antecedent);
    const a = last2(s.result.antecedent);
    const \u03B4 = s.result.succedent;
    return cl1(sequent([...\u03B3, conjunction(a, b)], \u03B4), [s]);
  };
  var reverseCL1 = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const acb = last2(p.result.antecedent);
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
  var applyCL2 = (a, s) => {
    const \u03B3 = init2(s.result.antecedent);
    const b = last2(s.result.antecedent);
    const \u03B4 = s.result.succedent;
    return cl2(sequent([...\u03B3, conjunction(a, b)], \u03B4), [s]);
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
  var applyCR = (s1, s2) => {
    const \u03B3 = s1.result.antecedent;
    const a = head2(s1.result.succedent);
    const b = head2(s2.result.succedent);
    const \u03B4 = tail(s1.result.succedent);
    return cr(sequent(\u03B3, [conjunction(a, b), ...\u03B4]), [s1, s2]);
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
  var applyCut = (s1, s2) => {
    const \u03B3 = s1.result.antecedent;
    const \u03B4 = init2(s1.result.succedent);
    return cut(sequent(\u03B3, \u03B4), [s1, s2]);
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
  var applyDL = (s1, s2) => {
    const \u03B3 = init2(s1.result.antecedent);
    const a = last2(s1.result.antecedent);
    const b = last2(s2.result.antecedent);
    const \u03B4 = s1.result.succedent;
    return dl(sequent([...\u03B3, disjunction(a, b)], \u03B4), [s1, s2]);
  };
  var reverseDL = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const adb = last2(p.result.antecedent);
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
  var applyDR = (s) => {
    const \u03B3 = s.result.antecedent;
    const a = head2(s.result.succedent);
    const b = head2(tail(s.result.succedent));
    const \u03B4 = tail(tail(s.result.succedent));
    return dr(sequent(\u03B3, [disjunction(a, b), ...\u03B4]), [s]);
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
  var applyDR1 = (b, s) => {
    const \u03B3 = s.result.antecedent;
    const \u03B4 = tail(s.result.succedent);
    const a = head2(s.result.succedent);
    return dr1(sequent(\u03B3, [disjunction(a, b), ...\u03B4]), [s]);
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
  var applyDR2 = (a, s) => {
    const \u03B3 = s.result.antecedent;
    const \u03B4 = tail(s.result.succedent);
    const b = head2(s.result.succedent);
    return dr2(sequent(\u03B3, [disjunction(a, b), ...\u03B4]), [s]);
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
  var applyIL = (s1, s2) => {
    const \u03B3 = s1.result.antecedent;
    const a = head2(s1.result.succedent);
    const b = last2(s2.result.antecedent);
    const \u03B4 = tail(s1.result.succedent);
    return il(sequent([...\u03B3, implication(a, b)], \u03B4), [s1, s2]);
  };
  var reverseIL = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const aib = last2(p.result.antecedent);
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
  var applyIR = (s) => {
    const \u03B3 = init2(s.result.antecedent);
    const a = last2(s.result.antecedent);
    const b = head2(s.result.succedent);
    const \u03B4 = tail(s.result.succedent);
    return ir(sequent(\u03B3, [implication(a, b), ...\u03B4]), [s]);
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
  var applyMP = (s1, s2) => {
    const a12 = s1.result.succedent[0].antecedent;
    const a22 = s2.result.succedent[0];
    const _a = assertEqual(a12, a22);
    const c = s1.result.succedent[0].consequent;
    return transformation(conclusion(c), [s1, s2], "MP");
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
  var applyNL = (s) => {
    const \u03B3 = s.result.antecedent;
    const a = head2(s.result.succedent);
    const \u03B4 = tail(s.result.succedent);
    return nl(sequent([...\u03B3, negation(a)], \u03B4), [s]);
  };
  var reverseNL = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const na = last2(p.result.antecedent);
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
  var applyNR = (s) => {
    const \u03B3 = init2(s.result.antecedent);
    const a = last2(s.result.antecedent);
    const \u03B4 = s.result.succedent;
    return nr(sequent(\u03B3, [negation(a), ...\u03B4]), [s]);
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
  var applySCL = (s) => {
    const \u03B3 = init2(init2(s.result.antecedent));
    const a = last2(s.result.antecedent);
    const \u03B4 = s.result.succedent;
    return scl(sequent([...\u03B3, a], \u03B4), [s]);
  };
  var reverseSCL = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const a = last2(p.result.antecedent);
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
  var applySCR = (s) => {
    const \u03B3 = s.result.antecedent;
    const a = head2(s.result.succedent);
    const \u03B4 = tail(tail(s.result.succedent));
    return scr(sequent(\u03B3, [a, ...\u03B4]), [s]);
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
  var applySRotLB = (s) => {
    const a = head2(s.result.antecedent);
    const \u03B3 = init2(tail(s.result.antecedent));
    const b = last2(s.result.antecedent);
    const \u03B4 = s.result.succedent;
    return sRotLB(sequent([...\u03B3, b, a], \u03B4), [s]);
  };
  var reverseSRotLB = (p) => {
    const \u03B3 = init2(init2(p.result.antecedent));
    const a = last2(p.result.antecedent);
    const b = last2(init2(p.result.antecedent));
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
  var applySRotLF = (s) => {
    const \u03B3 = init2(init2(s.result.antecedent));
    const a = last2(s.result.antecedent);
    const b = last2(init2(s.result.antecedent));
    const \u03B4 = s.result.succedent;
    return sRotLF(sequent([a, ...\u03B3, b], \u03B4), [s]);
  };
  var reverseSRotLF = (p) => {
    const \u03B3 = init2(tail(p.result.antecedent));
    const a = head2(p.result.antecedent);
    const b = last2(p.result.antecedent);
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
  var applySRotRB = (s) => {
    const \u03B3 = s.result.antecedent;
    const \u03B4 = init2(tail(s.result.succedent));
    const a = last2(s.result.succedent);
    const b = head2(s.result.succedent);
    return sRotRB(sequent(\u03B3, [a, b, ...\u03B4]), [s]);
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
  var applySRotRF = (s) => {
    const \u03B3 = s.result.antecedent;
    const \u03B4 = tail(tail(s.result.succedent));
    const a = head2(s.result.succedent);
    const b = head2(tail(s.result.succedent));
    return sRotRF(sequent(\u03B3, [b, ...\u03B4, a]), [s]);
  };
  var reverseSRotRF = (p) => {
    const \u03B3 = p.result.antecedent;
    const \u03B4 = init2(tail(p.result.succedent));
    const a = last2(p.result.succedent);
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
  var applySWL = (a, s) => {
    const \u03B3 = s.result.antecedent;
    const \u03B4 = s.result.succedent;
    return swl(sequent([...\u03B3, a], \u03B4), [s]);
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
  var applySWR = (a, s) => {
    const \u03B3 = s.result.antecedent;
    const \u03B4 = s.result.succedent;
    return swr(sequent(\u03B3, [a, ...\u03B4]), [s]);
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
  var applySXL = (s) => {
    const \u03B3 = init2(init2(s.result.antecedent));
    const b = last2(s.result.antecedent);
    const a = last2(init2(s.result.antecedent));
    const \u03B4 = s.result.succedent;
    return sxl(sequent([...\u03B3, b, a], \u03B4), [s]);
  };
  var reverseSXL = (p) => {
    const \u03B3 = init2(init2(p.result.antecedent));
    const a = last2(p.result.antecedent);
    const b = last2(init2(p.result.antecedent));
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
  var applySXR = (s) => {
    const \u03B3 = s.result.antecedent;
    const b = head2(tail(s.result.succedent));
    const a = head2(s.result.succedent);
    const \u03B4 = tail(tail(s.result.succedent));
    return sxr(sequent(\u03B3, [b, a, ...\u03B4]), [s]);
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
  var reverse0 = {
    a1: ruleA1,
    a2: ruleA2,
    a3: ruleA3,
    f: ruleF,
    i: ruleI,
    cl: ruleCL,
    dr: ruleDR,
    cl1: ruleCL1,
    dr1: ruleDR1,
    cl2: ruleCL2,
    dr2: ruleDR2,
    dl: ruleDL,
    cr: ruleCR,
    il: ruleIL,
    ir: ruleIR,
    nl: ruleNL,
    nr: ruleNR,
    swl: ruleSWL,
    swr: ruleSWR,
    scl: ruleSCL,
    scr: ruleSCR,
    sRotLF: ruleSRotLF,
    sRotLB: ruleSRotLB,
    sRotRF: ruleSRotRF,
    sRotRB: ruleSRotRB,
    sxl: ruleSXL,
    sxr: ruleSXR,
    v: ruleV
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
  var split = (s, c) => ensureNonEmpty(s.split(c), s);

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
    const [cmd, ...args] = split(str, " ");
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

  // src/render/block.ts
  var space = " ";
  function split2(s, d) {
    const parts = s.split(d);
    if (isNonEmptyArray(parts)) {
      return parts;
    }
    return [s];
  }
  function align(a, b) {
    const last3 = lastLine(a);
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
    )(a);
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
      (_, i2) => left2(width1)(lines1[i2] ?? String()) + left2(width2)(lines2[i2] ?? String())
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
    if (aligned) {
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
  var empty = String();
  function printNullary(key) {
    return () => (theme) => {
      const [s0] = theme[key];
      return s0;
    };
  }
  function printUnary(key) {
    return (a) => (theme) => {
      const [s0, s1] = theme[key];
      return [s0, a(theme), s1].join(empty);
    };
  }
  function printBinary(key) {
    return (a, b) => (theme) => {
      const [s0, s1, s2] = theme[key];
      return [s0, a(theme), s1, b(theme), s2].join(empty);
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
  var printString = (s) => () => s;
  var printNothing = printString(empty);
  function printNonEmptyArray(k) {
    return ([head3, ...tail2]) => tail2.reduce(print(k), head3);
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
  function fromNegation({ negand }) {
    const expand = (operand) => {
      switch (operand.kind) {
        case "atom":
          return fromProp(operand);
        case "falsum":
        case "verum":
        case "negation":
          return print("optional")(fromProp(operand));
        case "conjunction":
        case "disjunction":
        case "implication":
          return print("parenthesis")(fromProp(operand));
      }
    };
    return print("negation")(expand(negand));
  }
  function fromConjunction({
    leftConjunct,
    rightConjunct
  }) {
    const expand = (operand) => {
      switch (operand.kind) {
        case "atom":
          return fromProp(operand);
        case "falsum":
        case "verum":
        case "negation":
          return print("optional")(fromProp(operand));
        case "conjunction":
        case "disjunction":
        case "implication":
          return print("parenthesis")(fromProp(operand));
      }
    };
    return print("conjunction")(expand(leftConjunct), expand(rightConjunct));
  }
  function fromDisjunction({
    leftDisjunct,
    rightDisjunct
  }) {
    const expand = (operand) => {
      switch (operand.kind) {
        case "atom":
          return fromProp(operand);
        case "falsum":
        case "verum":
        case "negation":
          return print("optional")(fromProp(operand));
        case "conjunction":
        case "disjunction":
        case "implication":
          return print("parenthesis")(fromProp(operand));
      }
    };
    return print("disjunction")(expand(leftDisjunct), expand(rightDisjunct));
  }
  function fromImplication({
    antecedent,
    consequent
  }) {
    const expand = (operand) => {
      switch (operand.kind) {
        case "atom":
          return fromProp(operand);
        case "falsum":
        case "verum":
        case "negation":
        case "conjunction":
        case "disjunction":
          return print("optional")(fromProp(operand));
        case "implication":
          return print("parenthesis")(fromProp(operand));
      }
    };
    return print("implication")(expand(antecedent), expand(consequent));
  }
  function fromProp(proposition) {
    switch (proposition.kind) {
      case "atom":
        return fromAtom(proposition);
      case "falsum":
        return fromFalsum(proposition);
      case "verum":
        return fromVerum(proposition);
      case "negation":
        return fromNegation(proposition);
      case "conjunction":
        return fromConjunction(proposition);
      case "disjunction":
        return fromDisjunction(proposition);
      case "implication":
        return fromImplication(proposition);
    }
  }
  function fromFormulas(formulas) {
    return printArray("formulas")(formulas.map(fromProp));
  }
  function fromSequent(judgement) {
    const { antecedent, succedent } = judgement;
    return (t) => print("sequent")(
      fromFormulas(antecedent),
      fromFormulas(succedent)
    )(t).trim();
  }
  function left3(n = null) {
    const l = "L";
    return n ? l + n : l;
  }
  function right2(n = null) {
    const r = "R";
    return n ? r + n : r;
  }
  function fromRule(s) {
    return (t) => {
      switch (s) {
        case "i":
          return "I";
        case "f":
          return "\u22A5";
        case "v":
          return "\u22A4";
        case "cl":
          return t.conjunction.join(empty) + left3();
        case "dr":
          return t.disjunction.join(empty) + right2();
        case "cl1":
          return t.conjunction.join(empty) + left3("\u2081");
        case "dr1":
          return t.disjunction.join(empty) + right2("\u2081");
        case "cl2":
          return t.conjunction.join(empty) + left3("\u2082");
        case "dr2":
          return t.disjunction.join(empty) + right2("\u2082");
        case "dl":
          return t.disjunction.join(empty) + left3();
        case "cr":
          return t.conjunction.join(empty) + right2();
        case "il":
          return t.implication.join(empty) + left3();
        case "ir":
          return t.implication.join(empty) + right2();
        case "nl":
          return t.negation.join(empty) + left3();
        case "nr":
          return t.negation.join(empty) + right2();
        case "swl":
          return "WL";
        case "swr":
          return "WR";
        case "scl":
          return "CL";
        case "scr":
          return "CR";
        case "sRotLF":
          return "\u21B6L";
        case "sRotRF":
          return "\u21B7R";
        case "sRotLB":
          return "\u21B7L";
        case "sRotRB":
          return "\u21B6R";
        case "sxl":
          return "XL";
        case "sxr":
          return "XR";
      }
      return s;
    };
  }
  function fromPremise({ result }) {
    return fromSequent(result)(basic);
  }
  function fromTransformation({ rule, deps, result }) {
    return treeAuto(
      fromSequent(result)(basic),
      deps.map(fromDerivation),
      "(" + fromRule(rule)(basic) + ")"
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

  // src/systems/lk.ts
  var alpha = (s) => atom(s);
  var omega = {
    p0: { falsum, verum },
    p1: { negation },
    p2: { implication, conjunction, disjunction }
  };
  var iota = {
    i: ruleI.apply
  };
  var zeta = {
    cut: ruleCut.apply,
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

  // src/challenges/ch0-identity-1.ts
  var ch0identity1 = {
    rules: ["i"],
    goal: sequent([lk.a("p")], [lk.a("p")])
  };

  // src/challenges/ch0-identity-2.ts
  var ch0identity2 = {
    rules: ["i"],
    goal: sequent([lk.a("q")], [lk.a("q")])
  };

  // src/challenges/ch0-identity-3.ts
  var ch0identity3 = {
    rules: ["i"],
    goal: sequent([lk.o.p1.negation(lk.a("p"))], [lk.o.p1.negation(lk.a("p"))])
  };

  // src/challenges/ch0-identity-4.ts
  var ch0identity4 = {
    rules: ["i"],
    goal: sequent(
      [lk.o.p2.conjunction(lk.a("q"), lk.a("r"))],
      [lk.o.p2.conjunction(lk.a("q"), lk.a("r"))]
    )
  };

  // src/challenges/ch0-identity-5.ts
  var ch0identity5 = {
    rules: ["i"],
    goal: sequent(
      [lk.o.p2.disjunction(lk.a("r"), lk.a("s"))],
      [lk.o.p2.disjunction(lk.a("r"), lk.a("s"))]
    )
  };

  // src/challenges/ch0-identity-6.ts
  var ch0identity6 = {
    rules: ["i"],
    goal: sequent(
      [lk.o.p2.implication(lk.a("r"), lk.a("p"))],
      [lk.o.p2.implication(lk.a("r"), lk.a("p"))]
    )
  };

  // src/challenges/ch0-identity-7.ts
  var ch0identity7 = {
    rules: ["i"],
    goal: sequent(
      [lk.o.p2.conjunction(lk.a("q"), lk.o.p1.negation(lk.a("p")))],
      [lk.o.p2.conjunction(lk.a("q"), lk.o.p1.negation(lk.a("p")))]
    )
  };

  // src/challenges/ch0-identity-8.ts
  var ch0identity8 = {
    rules: ["i"],
    goal: sequent(
      [
        lk.o.p2.implication(
          lk.o.p2.disjunction(lk.a("p"), lk.a("q")),
          lk.o.p2.conjunction(lk.a("p"), lk.a("q"))
        )
      ],
      [
        lk.o.p2.implication(
          lk.o.p2.disjunction(lk.a("p"), lk.a("q")),
          lk.o.p2.conjunction(lk.a("p"), lk.a("q"))
        )
      ]
    )
  };

  // src/challenges/ch0-identity-9.ts
  var ch0identity9 = {
    rules: ["i"],
    goal: sequent(
      [
        lk.o.p2.implication(
          lk.o.p2.disjunction(lk.a("p"), lk.o.p1.negation(lk.a("q"))),
          lk.o.p1.negation(lk.o.p2.conjunction(lk.a("r"), lk.a("s")))
        )
      ],
      [
        lk.o.p2.implication(
          lk.o.p2.disjunction(lk.a("p"), lk.o.p1.negation(lk.a("q"))),
          lk.o.p1.negation(lk.o.p2.conjunction(lk.a("r"), lk.a("s")))
        )
      ]
    )
  };

  // src/challenges/ch1-weakening-1.ts
  var ch1weakening1 = {
    rules: ["i", "swl", "swr"],
    goal: sequent([lk.a("p"), lk.a("q")], [lk.a("p")])
  };

  // src/challenges/ch1-weakening-2.ts
  var ch1weakening2 = {
    rules: ["i", "swl", "swr"],
    goal: sequent([lk.a("p")], [lk.a("q"), lk.a("p")])
  };

  // src/challenges/ch1-weakening-3.ts
  var ch1weakening3 = {
    rules: ["i", "swl", "swr"],
    goal: sequent([lk.a("p"), lk.a("q")], [lk.a("q"), lk.a("p")])
  };

  // src/challenges/ch1-weakening-4.ts
  var ch1weakening4 = {
    rules: ["i", "swl", "swr"],
    goal: sequent(
      [lk.a("q"), lk.o.p2.conjunction(lk.a("p"), lk.a("q"))],
      [lk.o.p2.conjunction(lk.a("q"), lk.a("p")), lk.a("q")]
    )
  };

  // src/challenges/ch1-weakening-5.ts
  var ch1weakening5 = {
    rules: ["i", "swl", "swr"],
    goal: sequent(
      [lk.o.p2.conjunction(lk.a("p"), lk.a("q")), lk.a("p")],
      [lk.a("q"), lk.o.p2.conjunction(lk.a("p"), lk.a("q"))]
    )
  };

  // src/challenges/ch1-weakening-6.ts
  var ch1weakening6 = {
    rules: ["i", "swl", "swr"],
    goal: sequent(
      [lk.a("p"), lk.a("q"), lk.a("q"), lk.a("p")],
      [lk.a("p"), lk.a("q"), lk.a("q"), lk.a("p")]
    )
  };

  // src/challenges/ch1-weakening-7.ts
  var ch1weakening7 = {
    rules: ["i", "swl", "swr"],
    goal: sequent(
      [
        lk.o.p2.implication(
          lk.o.p2.disjunction(lk.a("p"), lk.a("q")),
          lk.o.p2.conjunction(lk.a("p"), lk.a("q"))
        )
      ],
      [
        lk.o.p2.implication(
          lk.o.p2.disjunction(lk.a("p"), lk.a("q")),
          lk.o.p2.conjunction(lk.a("p"), lk.a("q"))
        )
      ]
    )
  };

  // src/challenges/ch1-weakening-8.ts
  var ch1weakening8 = {
    rules: ["i", "swl", "swr"],
    goal: sequent(
      [lk.a("p"), lk.o.p2.implication(lk.a("q"), lk.a("p")), lk.a("q")],
      [lk.a("q"), lk.o.p2.implication(lk.a("q"), lk.a("p")), lk.a("p")]
    )
  };

  // src/challenges/ch1-weakening-9.ts
  var ch1weakening9 = {
    rules: ["i", "swl", "swr"],
    goal: sequent(
      [lk.a("s"), lk.a("r"), lk.a("q"), lk.a("p")],
      [lk.a("p"), lk.a("q"), lk.a("r"), lk.a("s")]
    )
  };

  // src/challenges/ch2-permutation-1.ts
  var ch2permutation1 = {
    rules: ["i", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [lk.a("p"), lk.a("p"), lk.a("p"), lk.a("q"), lk.a("p"), lk.a("p")],
      [lk.a("q")]
    )
  };

  // src/challenges/ch2-permutation-2.ts
  var ch2permutation2 = {
    rules: ["i", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [lk.a("q")],
      [lk.a("p"), lk.a("p"), lk.a("p"), lk.a("q"), lk.a("p"), lk.a("p")]
    )
  };

  // src/challenges/ch2-permutation-3.ts
  var ch2permutation3 = {
    rules: ["i", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [lk.a("p"), lk.a("p"), lk.a("p"), lk.a("q"), lk.a("p"), lk.a("p")],
      [lk.a("p"), lk.a("p"), lk.a("p"), lk.a("q"), lk.a("p"), lk.a("p")]
    )
  };

  // src/challenges/ch2-permutation-4.ts
  var ch2permutation4 = {
    rules: ["i", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [lk.a("s"), lk.a("r"), lk.a("q"), lk.a("p")],
      [lk.a("s"), lk.a("r"), lk.a("q"), lk.a("p")]
    )
  };

  // src/challenges/ch2-permutation-5.ts
  var ch2permutation5 = {
    rules: ["i", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [
        lk.o.p2.conjunction(lk.a("p"), lk.a("q")),
        lk.o.p2.conjunction(lk.a("p"), lk.a("q"))
      ],
      [
        lk.o.p2.conjunction(lk.a("p"), lk.a("q")),
        lk.o.p2.disjunction(lk.a("p"), lk.a("q"))
      ]
    )
  };

  // src/challenges/ch2-permutation-6.ts
  var ch2permutation6 = {
    rules: ["i", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [
        lk.o.p2.conjunction(lk.a("q"), lk.a("s")),
        lk.o.p2.conjunction(lk.a("q"), lk.a("s")),
        lk.o.p2.conjunction(lk.a("q"), lk.a("s"))
      ],
      [
        lk.o.p2.conjunction(lk.a("q"), lk.a("s")),
        lk.o.p2.conjunction(lk.a("s"), lk.a("q")),
        lk.o.p2.conjunction(lk.a("s"), lk.a("q"))
      ]
    )
  };

  // src/challenges/ch2-permutation-7.ts
  var ch2permutation7 = {
    rules: ["i", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [
        lk.o.p2.implication(lk.a("q"), lk.a("p")),
        lk.o.p2.implication(lk.a("p"), lk.a("s")),
        lk.o.p2.implication(lk.a("s"), lk.a("r"))
      ],
      [
        lk.o.p2.implication(lk.a("r"), lk.a("p")),
        lk.o.p2.implication(lk.a("p"), lk.a("s")),
        lk.o.p2.implication(lk.a("s"), lk.a("q"))
      ]
    )
  };

  // src/challenges/ch2-permutation-8.ts
  var ch2permutation8 = {
    rules: ["i", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [
        lk.o.p2.conjunction(lk.a("s"), lk.a("q")),
        lk.a("r"),
        lk.o.p2.implication(lk.a("q"), lk.a("p")),
        lk.o.p1.negation(lk.a("r"))
      ],
      [
        lk.o.p1.negation(lk.a("p")),
        lk.o.p2.implication(lk.a("s"), lk.a("q")),
        lk.o.p1.negation(lk.a("r")),
        lk.o.p2.disjunction(lk.a("q"), lk.a("p"))
      ]
    )
  };

  // src/challenges/ch2-permutation-9.ts
  var ch2permutation9 = {
    rules: ["i", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [lk.a("p"), lk.o.p1.negation(lk.a("p")), lk.a("q"), lk.a("r")],
      [
        lk.o.p1.negation(lk.a("q")),
        lk.o.p1.negation(lk.a("p")),
        lk.a("s"),
        lk.o.p1.negation(lk.a("r"))
      ]
    )
  };

  // src/challenges/ch3-negation-1.ts
  var ch3negation1 = {
    rules: ["i", "nl", "nr"],
    goal: sequent([lk.a("r"), lk.o.p1.negation(lk.a("r"))], [])
  };

  // src/challenges/ch3-negation-2.ts
  var ch3negation2 = {
    rules: ["i", "nl", "nr"],
    goal: sequent([], [lk.o.p1.negation(lk.a("r")), lk.a("r")])
  };

  // src/challenges/ch3-negation-3.ts
  var ch3negation3 = {
    rules: ["i", "nl", "nr"],
    goal: sequent([lk.o.p1.negation(lk.o.p1.negation(lk.a("q")))], [lk.a("q")])
  };

  // src/challenges/ch3-negation-4.ts
  var ch3negation4 = {
    rules: ["i", "nl", "nr"],
    goal: sequent(
      [lk.o.p1.negation(lk.o.p1.negation(lk.a("s")))],
      [
        lk.o.p1.negation(
          lk.o.p1.negation(lk.o.p1.negation(lk.o.p1.negation(lk.a("s"))))
        )
      ]
    )
  };

  // src/challenges/ch3-negation-5.ts
  var ch3negation5 = {
    rules: ["i", "swl", "swr", "nl", "nr"],
    goal: sequent(
      [
        lk.o.p1.negation(
          lk.o.p1.negation(lk.o.p2.conjunction(lk.a("p"), lk.a("q")))
        )
      ],
      [
        lk.o.p1.negation(
          lk.o.p1.negation(
            lk.o.p1.negation(
              lk.o.p1.negation(lk.o.p2.conjunction(lk.a("p"), lk.a("q")))
            )
          )
        )
      ]
    )
  };

  // src/challenges/ch3-negation-6.ts
  var ch3negation6 = {
    rules: ["i", "swl", "swr", "nl", "nr"],
    goal: sequent(
      [
        lk.o.p1.negation(lk.o.p1.negation(lk.a("p"))),
        lk.o.p1.negation(lk.o.p1.negation(lk.o.p1.negation(lk.a("p"))))
      ],
      [
        lk.o.p1.negation(lk.o.p1.negation(lk.a("p"))),
        lk.o.p1.negation(lk.o.p1.negation(lk.o.p1.negation(lk.a("p"))))
      ]
    )
  };

  // src/challenges/ch3-negation-7.ts
  var ch3negation7 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "nl",
      "nr"
    ],
    goal: sequent(
      [
        lk.o.p1.negation(lk.o.p1.negation(lk.a("p"))),
        lk.o.p1.negation(lk.o.p1.negation(lk.o.p1.negation(lk.a("p"))))
      ],
      [
        lk.o.p1.negation(lk.o.p1.negation(lk.a("p"))),
        lk.o.p1.negation(lk.o.p1.negation(lk.o.p1.negation(lk.a("p"))))
      ]
    )
  };

  // src/challenges/ch3-negation-8.ts
  var ch3negation8 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "nl",
      "nr"
    ],
    goal: sequent(
      [
        lk.o.p1.negation(lk.o.p1.negation(lk.a("p"))),
        lk.o.p2.conjunction(
          lk.o.p1.negation(lk.a("p")),
          lk.o.p1.negation(lk.a("q"))
        ),
        lk.o.p1.negation(lk.o.p1.negation(lk.o.p1.negation(lk.a("q"))))
      ],
      [
        lk.o.p1.negation(lk.o.p1.negation(lk.o.p1.negation(lk.a("p")))),
        lk.o.p2.conjunction(
          lk.o.p1.negation(lk.a("p")),
          lk.o.p1.negation(lk.a("q"))
        ),
        lk.o.p1.negation(lk.o.p1.negation(lk.a("q")))
      ]
    )
  };

  // src/challenges/ch3-negation-9.ts
  var ch3negation9 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "nl",
      "nr"
    ],
    goal: sequent(
      [
        lk.o.p1.negation(lk.a("p")),
        lk.o.p1.negation(lk.a("s")),
        lk.o.p1.negation(lk.a("p")),
        lk.a("r")
      ],
      [
        lk.a("q"),
        lk.o.p1.negation(lk.a("q")),
        lk.a("s"),
        lk.o.p1.negation(lk.a("r"))
      ]
    )
  };

  // src/challenges/ch4-theorem-1.ts
  var ch4theorem1 = {
    rules: ["i", "ir"],
    goal: conclusion(lk.o.p2.implication(lk.a("q"), lk.a("q")))
  };

  // src/challenges/ch4-theorem-2.ts
  var ch4theorem2 = {
    rules: ["i", "ir"],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.conjunction(lk.a("q"), lk.a("q")),
        lk.o.p2.conjunction(lk.a("q"), lk.a("q"))
      )
    )
  };

  // src/challenges/ch4-theorem-3.ts
  var ch4theorem3 = {
    rules: ["i", "ir"],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.a("p"), lk.a("r")),
        lk.o.p2.implication(lk.a("p"), lk.a("r"))
      )
    )
  };

  // src/challenges/ch4-theorem-4.ts
  var ch4theorem4 = {
    rules: ["i", "ir"],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.a("q"), lk.o.p2.implication(lk.a("r"), lk.a("q"))),
        lk.o.p2.implication(lk.a("q"), lk.o.p2.implication(lk.a("r"), lk.a("q")))
      )
    )
  };

  // src/challenges/ch4-theorem-5.ts
  var ch4theorem5 = {
    rules: ["i", "swl", "swr", "ir"],
    goal: conclusion(
      lk.o.p2.implication(lk.a("q"), lk.o.p2.implication(lk.a("r"), lk.a("q")))
    )
  };

  // src/challenges/ch4-theorem-6.ts
  var ch4theorem6 = {
    rules: ["i", "swl", "swr", "ir"],
    goal: conclusion(
      lk.o.p2.implication(lk.a("r"), lk.o.p2.implication(lk.a("q"), lk.a("q")))
    )
  };

  // src/challenges/ch4-theorem-7.ts
  var ch4theorem7 = {
    rules: ["i", "swl", "swr", "ir"],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(
          lk.a("p"),
          lk.o.p2.implication(lk.a("q"), lk.o.p1.negation(lk.a("p")))
        ),
        lk.o.p2.implication(lk.a("p"), lk.a("p"))
      )
    )
  };

  // src/challenges/ch4-theorem-8.ts
  var ch4theorem8 = {
    rules: ["i", "swl", "swr", "nl", "nr", "ir"],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p1.negation(lk.o.p1.negation(lk.a("s"))),
        lk.o.p1.negation(
          lk.o.p1.negation(lk.o.p1.negation(lk.o.p1.negation(lk.a("s"))))
        )
      )
    )
  };

  // src/challenges/ch4-theorem-9.ts
  var ch4theorem9 = {
    rules: ["i", "swl", "swr", "nl", "nr", "ir"],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p1.negation(
          lk.o.p1.negation(lk.o.p2.conjunction(lk.a("p"), lk.a("q")))
        ),
        lk.o.p1.negation(
          lk.o.p1.negation(
            lk.o.p1.negation(
              lk.o.p1.negation(lk.o.p2.conjunction(lk.a("p"), lk.a("q")))
            )
          )
        )
      )
    )
  };

  // src/challenges/ch5-composition-1.ts
  var ch5composition1 = {
    rules: ["i", "swl", "swr", "cl", "dr"],
    goal: sequent(
      [lk.o.p2.conjunction(lk.a("p"), lk.a("q"))],
      [lk.a("q"), lk.a("p")]
    )
  };

  // src/challenges/ch5-composition-2.ts
  var ch5composition2 = {
    rules: ["i", "swl", "swr", "cl", "dr"],
    goal: sequent(
      [lk.a("q"), lk.a("p")],
      [lk.o.p2.disjunction(lk.a("p"), lk.a("q"))]
    )
  };

  // src/challenges/ch5-composition-3.ts
  var ch5composition3 = {
    rules: ["i", "swl", "swr", "cl", "dr"],
    goal: sequent(
      [lk.o.p2.conjunction(lk.a("q"), lk.a("p"))],
      [lk.o.p2.disjunction(lk.a("p"), lk.a("q"))]
    )
  };

  // src/challenges/ch5-composition-4.ts
  var ch5composition4 = {
    rules: ["i", "swl", "swr", "cl", "dr"],
    goal: sequent(
      [lk.o.p2.conjunction(lk.o.p2.conjunction(lk.a("r"), lk.a("p")), lk.a("s"))],
      [lk.o.p2.disjunction(lk.a("s"), lk.o.p2.disjunction(lk.a("p"), lk.a("r")))]
    )
  };

  // src/challenges/ch5-composition-5.ts
  var ch5composition5 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "cl",
      "dr"
    ],
    goal: sequent(
      [
        lk.o.p2.conjunction(
          lk.o.p2.conjunction(lk.a("r"), lk.a("p")),
          lk.o.p2.disjunction(lk.a("p"), lk.a("r"))
        )
      ],
      [
        lk.o.p2.disjunction(
          lk.o.p2.conjunction(lk.a("p"), lk.a("r")),
          lk.o.p2.disjunction(lk.a("r"), lk.a("p"))
        )
      ]
    )
  };

  // src/challenges/ch5-composition-6.ts
  var ch5composition6 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "cl",
      "dr"
    ],
    goal: sequent(
      [
        lk.o.p2.conjunction(
          lk.o.p2.disjunction(lk.a("r"), lk.a("p")),
          lk.o.p2.disjunction(lk.a("p"), lk.a("s"))
        )
      ],
      [
        lk.o.p2.disjunction(
          lk.o.p2.disjunction(lk.a("s"), lk.a("p")),
          lk.o.p2.disjunction(lk.a("r"), lk.a("p"))
        )
      ]
    )
  };

  // src/challenges/ch5-composition-7.ts
  var ch5composition7 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "cl",
      "dr"
    ],
    goal: sequent(
      [
        lk.o.p2.conjunction(
          lk.o.p2.conjunction(lk.a("p"), lk.a("q")),
          lk.o.p2.implication(lk.a("r"), lk.a("q"))
        )
      ],
      [
        lk.o.p2.disjunction(
          lk.o.p2.implication(lk.a("q"), lk.a("r")),
          lk.o.p2.disjunction(lk.a("p"), lk.a("q"))
        )
      ]
    )
  };

  // src/challenges/ch5-composition-8.ts
  var ch5composition8 = {
    rules: [
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
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.conjunction(lk.a("q"), lk.o.p1.negation(lk.a("q"))),
        lk.o.p2.disjunction(lk.a("r"), lk.a("s"))
      )
    )
  };

  // src/challenges/ch5-composition-9.ts
  var ch5composition9 = {
    rules: [
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
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.conjunction(
          lk.o.p2.conjunction(
            lk.o.p1.negation(lk.a("p")),
            lk.o.p1.negation(lk.a("s"))
          ),
          lk.o.p2.conjunction(lk.o.p1.negation(lk.a("p")), lk.a("r"))
        ),
        lk.o.p2.disjunction(
          lk.o.p2.disjunction(lk.a("q"), lk.o.p1.negation(lk.a("q"))),
          lk.o.p2.disjunction(lk.a("s"), lk.o.p1.negation(lk.a("r")))
        )
      )
    )
  };

  // src/challenges/ch6-branching-1.ts
  var ch6branching1 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "dl",
      "cr"
    ],
    goal: sequent(
      [lk.o.p2.disjunction(lk.a("p"), lk.a("q"))],
      [lk.a("p"), lk.a("q")]
    )
  };

  // src/challenges/ch6-branching-2.ts
  var ch6branching2 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "dl",
      "cr"
    ],
    goal: sequent(
      [lk.a("p"), lk.a("q")],
      [lk.o.p2.conjunction(lk.a("p"), lk.a("q"))]
    )
  };

  // src/challenges/ch6-branching-3.ts
  var ch6branching3 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "dl",
      "cr"
    ],
    goal: sequent(
      [lk.o.p2.disjunction(lk.a("p"), lk.a("p"))],
      [lk.o.p2.conjunction(lk.a("p"), lk.a("p"))]
    )
  };

  // src/challenges/ch6-branching-4.ts
  var ch6branching4 = {
    rules: [
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
    ],
    goal: sequent(
      [lk.o.p2.disjunction(lk.a("p"), lk.a("q"))],
      [lk.o.p2.disjunction(lk.a("q"), lk.a("p"))]
    )
  };

  // src/challenges/ch6-branching-5.ts
  var ch6branching5 = {
    rules: [
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
    ],
    goal: sequent(
      [lk.o.p2.conjunction(lk.a("p"), lk.a("q"))],
      [lk.o.p2.conjunction(lk.a("q"), lk.a("p"))]
    )
  };

  // src/challenges/ch6-branching-6.ts
  var ch6branching6 = {
    rules: [
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
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p1.negation(lk.o.p2.conjunction(lk.a("p"), lk.a("q"))),
        lk.o.p2.disjunction(
          lk.o.p1.negation(lk.a("p")),
          lk.o.p1.negation(lk.a("q"))
        )
      )
    )
  };

  // src/challenges/ch6-branching-7.ts
  var ch6branching7 = {
    rules: [
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
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.disjunction(
          lk.o.p1.negation(lk.a("p")),
          lk.o.p1.negation(lk.a("q"))
        ),
        lk.o.p1.negation(lk.o.p2.conjunction(lk.a("p"), lk.a("q")))
      )
    )
  };

  // src/challenges/ch6-branching-8.ts
  var ch6branching8 = {
    rules: [
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
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.conjunction(lk.a("p"), lk.o.p2.disjunction(lk.a("q"), lk.a("r"))),
        lk.o.p2.disjunction(
          lk.o.p2.conjunction(lk.a("p"), lk.a("q")),
          lk.o.p2.conjunction(lk.a("p"), lk.a("r"))
        )
      )
    )
  };

  // src/challenges/ch6-branching-9.ts
  var ch6branching9 = {
    rules: [
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
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.disjunction(
          lk.o.p2.conjunction(lk.a("p"), lk.a("q")),
          lk.o.p2.conjunction(lk.a("p"), lk.a("r"))
        ),
        lk.o.p2.conjunction(lk.a("p"), lk.o.p2.disjunction(lk.a("q"), lk.a("r")))
      )
    )
  };

  // src/challenges/ch7-completeness-1.ts
  var ch7completeness1 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "il",
      "ir"
    ],
    goal: sequent(
      [lk.a("p"), lk.o.p2.implication(lk.a("p"), lk.a("q"))],
      [lk.a("q")]
    )
  };

  // src/challenges/ch7-completeness-2.ts
  var ch7completeness2 = {
    rules: [
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
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.a("p"), lk.a("q")),
        lk.o.p2.implication(
          lk.o.p1.negation(lk.a("q")),
          lk.o.p1.negation(lk.a("p"))
        )
      )
    )
  };

  // src/challenges/ch7-completeness-3.ts
  var ch7completeness3 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "il",
      "ir"
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.a("p"), lk.a("q")),
        lk.o.p2.implication(
          lk.o.p2.implication(lk.a("q"), lk.a("r")),
          lk.o.p2.implication(lk.a("p"), lk.a("r"))
        )
      )
    )
  };

  // src/challenges/ch7-completeness-4.ts
  var ch7completeness4 = {
    rules: [
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
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.o.p2.conjunction(lk.a("p"), lk.a("q")), lk.a("r")),
        lk.o.p2.implication(lk.a("p"), lk.o.p2.implication(lk.a("q"), lk.a("r")))
      )
    )
  };

  // src/challenges/ch7-completeness-5.ts
  var ch7completeness5 = {
    rules: [
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
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.o.p2.implication(lk.a("p"), lk.a("q")), lk.a("p")),
        lk.a("p")
      )
    )
  };

  // src/challenges/ch7-completeness-6.ts
  var ch7completeness6 = {
    rules: [
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
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.a("p"), lk.a("q")),
        lk.o.p2.implication(
          lk.o.p2.implication(lk.a("p"), lk.o.p1.negation(lk.a("q"))),
          lk.o.p1.negation(lk.a("p"))
        )
      )
    )
  };

  // src/challenges/ch7-completeness-7.ts
  var ch7completeness7 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "il",
      "ir"
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.a("p"), lk.o.p2.implication(lk.a("p"), lk.a("q"))),
        lk.o.p2.implication(lk.a("p"), lk.a("q"))
      )
    )
  };

  // src/challenges/ch7-completeness-8.ts
  var ch7completeness8 = {
    rules: [
      "i",
      "swl",
      "swr",
      "sRotLF",
      "sRotRF",
      "sRotLB",
      "sRotRB",
      "il",
      "ir"
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.o.p2.implication(lk.a("p"), lk.a("q")), lk.a("q")),
        lk.o.p2.implication(lk.o.p2.implication(lk.a("q"), lk.a("p")), lk.a("p"))
      )
    )
  };

  // src/challenges/ch7-completeness-9.ts
  var ch7completeness9 = {
    rules: [
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
    ],
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.a("p"), lk.o.p2.implication(lk.a("q"), lk.a("r"))),
        lk.o.p2.implication(lk.o.p2.conjunction(lk.a("p"), lk.a("q")), lk.a("r"))
      )
    )
  };

  // src/challenges/ch8-constants-1.ts
  var ch8constants1 = {
    rules: ["i", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [lk.a("p"), lk.o.p0.verum, lk.a("q")],
      [lk.a("r"), lk.o.p0.verum, lk.a("s")]
    )
  };

  // src/challenges/ch8-constants-2.ts
  var ch8constants2 = {
    rules: ["i", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [lk.a("s"), lk.o.p0.falsum, lk.a("r")],
      [lk.a("q"), lk.o.p0.falsum, lk.a("p")]
    )
  };

  // src/challenges/ch8-constants-3.ts
  var ch8constants3 = {
    rules: ["f", "v", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [lk.a("p"), lk.o.p0.verum, lk.a("q")],
      [lk.a("q"), lk.o.p0.verum, lk.a("p")]
    )
  };

  // src/challenges/ch8-constants-4.ts
  var ch8constants4 = {
    rules: ["f", "v", "swl", "swr", "sRotLF", "sRotRF", "sRotLB", "sRotRB"],
    goal: sequent(
      [lk.a("r"), lk.o.p0.falsum, lk.a("s")],
      [lk.a("s"), lk.o.p0.falsum, lk.a("r")]
    )
  };

  // src/challenges/ch8-constants-5.ts
  var ch8constants5 = {
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
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(
          lk.a("p"),
          lk.o.p2.implication(lk.a("q"), lk.o.p1.negation(lk.a("p")))
        ),
        lk.o.p2.implication(lk.a("p"), lk.o.p0.verum)
      )
    )
  };

  // src/challenges/ch8-constants-6.ts
  var ch8constants6 = {
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
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p1.negation(lk.o.p1.negation(lk.o.p0.falsum)),
        lk.o.p1.negation(
          lk.o.p1.negation(lk.o.p1.negation(lk.o.p1.negation(lk.a("s"))))
        )
      )
    )
  };

  // src/challenges/ch8-constants-7.ts
  var ch8constants7 = {
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
    goal: sequent(
      [lk.o.p2.disjunction(lk.o.p0.falsum, lk.a("p"))],
      [lk.o.p2.conjunction(lk.o.p0.verum, lk.a("p"))]
    )
  };

  // src/challenges/ch8-constants-8.ts
  var ch8constants8 = {
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
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.a("p"), lk.a("q")),
        lk.o.p2.implication(
          lk.o.p2.implication(lk.a("q"), lk.o.p0.falsum),
          lk.o.p2.implication(lk.a("p"), lk.a("r"))
        )
      )
    )
  };

  // src/challenges/ch8-constants-9.ts
  var ch8constants9 = {
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
    goal: sequent(
      [
        lk.o.p2.conjunction(
          lk.o.p2.conjunction(lk.a("r"), lk.a("q")),
          lk.o.p2.implication(lk.a("s"), lk.o.p1.negation(lk.o.p0.verum))
        )
      ],
      [
        lk.o.p2.disjunction(
          lk.o.p2.implication(
            lk.a("s"),
            lk.o.p2.implication(lk.a("q"), lk.a("r"))
          ),
          lk.o.p0.falsum
        )
      ]
    )
  };

  // src/challenges/ch9-consolidation-1.ts
  var ch9consolidation1 = {
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
    goal: conclusion(
      lk.o.p2.disjunction(
        lk.o.p2.disjunction(lk.a("r"), lk.a("s")),
        lk.o.p2.implication(
          lk.o.p2.conjunction(
            lk.o.p2.implication(lk.a("q"), lk.a("r")),
            lk.o.p2.conjunction(lk.a("p"), lk.a("q"))
          ),
          lk.o.p2.implication(lk.a("q"), lk.a("r"))
        )
      )
    )
  };

  // src/challenges/ch9-consolidation-2.ts
  var ch9consolidation2 = {
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
    goal: conclusion(
      lk.o.p2.implication(
        lk.a("p"),
        lk.o.p2.implication(
          lk.o.p1.negation(lk.o.p2.disjunction(lk.a("p"), lk.a("q"))),
          lk.o.p2.implication(lk.a("q"), lk.a("r"))
        )
      )
    )
  };

  // src/challenges/ch9-consolidation-3.ts
  var ch9consolidation3 = {
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
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.conjunction(
          lk.o.p2.implication(lk.a("p"), lk.a("q")),
          lk.o.p2.disjunction(lk.o.p1.negation(lk.a("q")), lk.a("r"))
        ),
        lk.o.p2.disjunction(lk.o.p1.negation(lk.a("p")), lk.a("r"))
      )
    )
    /*
    solution: lk.z.ir(
      lk.z.swl(
        lk.o.p2.implication(
          lk.a('p'),
          lk.o.p2.implication(lk.a('q'), lk.o.p1.negation(lk.a('p'))),
        ),
        lk.z.ir(lk.i.i(lk.a('p'))),
      ),
    ),*/
  };

  // src/challenges/ch9-consolidation-4.ts
  var ch9consolidation4 = {
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
    goal: conclusion(lk.o.p2.disjunction(lk.a("p"), lk.o.p1.negation(lk.a("p"))))
  };

  // src/challenges/ch9-consolidation-5.ts
  var ch9consolidation5 = {
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
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.a("p"), lk.o.p2.implication(lk.a("q"), lk.a("r"))),
        lk.o.p2.implication(lk.a("q"), lk.o.p2.implication(lk.a("p"), lk.a("r")))
      )
    )
  };

  // src/challenges/ch9-consolidation-6.ts
  var ch9consolidation6 = {
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
    goal: conclusion(
      lk.o.p2.implication(
        lk.o.p2.implication(lk.a("p"), lk.a("r")),
        lk.o.p2.implication(
          lk.o.p2.implication(lk.a("q"), lk.a("r")),
          lk.o.p2.implication(
            lk.o.p2.disjunction(lk.a("p"), lk.a("q")),
            lk.a("r")
          )
        )
      )
    )
  };

  // src/challenges/ch9-consolidation-7.ts
  var ch9consolidation7 = {
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
    goal: conclusion(
      lk.o.p2.implication(lk.a("p"), lk.a("p"))
    )
  };

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
  var isTheoremKey = (k) => k in challenges;

  // src/interactive/workspace.ts
  var Workspace = class {
    constructor(challenges2) {
      this.conjectures = {};
      this.theorems = challenges2;
      const theoremKeys = keys(challenges2);
      if (!isNonEmptyArray(theoremKeys)) {
        throw new Error("no challenges");
      }
      this.theoremKeys = theoremKeys;
      this.selected = theoremKeys[0];
      this.selectConjecture(this.selected);
    }
    isSolved() {
      return isProof(this.currentConjecture().derivation);
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
  var isRuleId = (u) => typeof u === "string" && u in ruleId;

  // src/interactive/repl.ts
  function* repl(workspace2) {
    let output = '\nWelcome!\n\nType "help" for help';
    while (true) {
      const input = yield output + "\n";
      output = "";
      const [cmd, ...args] = split(input, " ");
      switch (cmd) {
        case "quit":
          return "\nExiting...";
        case "help": {
          const [arg] = args;
          if (!arg) {
            output = "\nSystem commands:\n  help - display this manual\n  help <rule> - display rule description\n  list - list all conjectures\n  prev - select previous conjecture\n  next - select next conjecture\n  undo - undo applied rule in current conjecture\n  reset - undo all applied rules of current conjecture\n  select <conjecture> - select active conjecture";
            break;
          }
          if (isRuleId(arg)) {
            output = '\nRule "' + arg + '":\n\n';
            output += fromDerivation(rules[arg].example);
            break;
          }
          output = '\nUnknown rule "' + arg + '"';
          break;
        }
        case "list":
          output = "\nConjectures:\n" + workspace2.listConjectures().map(([id]) => (id === workspace2.selected ? "*" : " ") + " " + id).join("\n");
          break;
        case "prev":
          workspace2.selectConjecture(workspace2.previousConjectureId());
          output = status(workspace2.currentConjecture());
          break;
        case "next":
          workspace2.selectConjecture(workspace2.nextConjectureId());
          output = status(workspace2.currentConjecture());
          break;
        case "select": {
          const [conjectureId] = args;
          if (!workspace2.isConjectureId(conjectureId)) {
            break;
          }
          workspace2.selectConjecture(conjectureId);
          output = status(workspace2.currentConjecture());
          break;
        }
        default: {
          const ev = parseEvent(cmd);
          if (!ev) {
            break;
          }
          workspace2.applyEvent(ev);
          output = status(workspace2.currentConjecture());
        }
      }
    }
  }
  var status = (s) => "\n" + fromFocus(s) + "\nRules: " + applicableRules2(s).join(", ") + "\nProof: undo, reset\nConjectures: prev, next, select, list\nSystem: quit, help\n" + (isProof(s.derivation) ? "\nConglaturations!\n" : "");

  // src/web.ts
  var controls = ["undo", "reset", "level"];
  var workspace = new Workspace(challenges);
  var proof = (s) => {
    const pre = document.createElement("pre");
    pre.setAttribute("class", "proof");
    if (s.derivation.kind === "transformation") {
      pre.innerHTML = "\n" + fromFocus(s) + "\n";
    }
    return pre;
  };
  var listing = () => {
    const shroud = document.createElement("div");
    shroud.onclick = (click) => {
      click.preventDefault();
      shroud.setAttribute("style", "display: none;");
    };
    shroud.setAttribute("class", "shroud");
    shroud.setAttribute("style", "display: none;");
    shroud.setAttribute("id", "levelmenu");
    const panel = document.createElement("div");
    panel.setAttribute("class", "level-select");
    panel.onclick = (click) => {
      click.preventDefault();
      return false;
    };
    const close = document.createElement("a");
    close.setAttribute("class", "close");
    close.innerHTML = "\u2716";
    close.onclick = (click) => {
      click.preventDefault();
      shroud.setAttribute("style", "display: none;");
    };
    panel.appendChild(close);
    const levels = document.createElement("div");
    levels.setAttribute("class", "levels");
    workspace.listConjectures().forEach(([id, challenge]) => {
      const item = document.createElement("div");
      item.setAttribute(
        "class",
        "level" + (id === workspace.selected ? " active" : "")
      );
      item.onclick = (click) => {
        click.preventDefault();
        selectLevel(id);
      };
      const title = document.createElement("div");
      title.setAttribute("class", "title");
      title.innerHTML = id;
      item.appendChild(title);
      const rules2 = document.createElement("div");
      rules2.setAttribute("class", "rules");
      rules2.innerHTML = challenge.rules.map((rule) => fromRule(rule)(basic)).join(", ");
      item.appendChild(rules2);
      const goal = document.createElement("div");
      goal.setAttribute("class", "goal");
      goal.innerHTML = fromSequent(challenge.goal)(basic);
      item.appendChild(goal);
      levels.appendChild(item);
    });
    panel.appendChild(levels);
    shroud.appendChild(panel);
    return shroud;
  };
  var congrats = () => {
    const panel = document.createElement("div");
    const banner = document.createElement("div");
    banner.setAttribute("class", "congrats");
    const hurray = document.createElement("div");
    hurray.setAttribute("class", "hurray");
    hurray.innerHTML = "\n\n\u{1F389} Conglaturations! \u{1F389}\n";
    banner.appendChild(hurray);
    const congratsButtons = document.createElement("div");
    congratsButtons.setAttribute("class", "congrabuttons");
    const previousButton = document.createElement("div");
    previousButton.setAttribute("class", "button");
    previousButton.innerHTML = "Prev Level";
    previousButton.onclick = () => {
      selectLevel(workspace.previousConjectureId());
    };
    congratsButtons.appendChild(previousButton);
    const againbutton = document.createElement("div");
    againbutton.setAttribute("class", "button");
    againbutton.innerHTML = "Play Again";
    againbutton.onclick = () => {
      workspace.applyEvent(reset());
      render();
    };
    congratsButtons.appendChild(againbutton);
    const continueButton = document.createElement("div");
    continueButton.setAttribute("class", "button");
    continueButton.innerHTML = "Next Level";
    continueButton.onclick = () => {
      selectLevel(workspace.nextConjectureId());
    };
    congratsButtons.appendChild(continueButton);
    panel.appendChild(banner);
    panel.appendChild(congratsButtons);
    return panel;
  };
  var current = (s) => {
    if (workspace.isSolved()) {
      return congrats();
    }
    const active = document.createElement("div");
    active.setAttribute("class", "current");
    const sequent2 = activeSequent(s);
    active.innerHTML = fromSequent(sequent2)(basic);
    return active;
  };
  var playArea = (s) => {
    const panel = document.createElement("div");
    panel.setAttribute("class", "playarea");
    panel.appendChild(current(s));
    panel.appendChild(proof(s));
    return panel;
  };
  var levelHandler = () => {
    const menu = document.getElementById("levelmenu");
    menu?.removeAttribute("style");
  };
  var mainPanel = (ls, rules2) => {
    const panel = document.createElement("div");
    panel.setAttribute("class", "main");
    entries(center).forEach(([key, rule]) => {
      if (rules2.includes(key)) {
        const pre = document.createElement("pre");
        const disabled = workspace.isSolved() || !ls.includes(key);
        pre.setAttribute("class", "rule button" + (disabled ? " disabled" : ""));
        if (!disabled) {
          pre.onclick = () => {
            if (isReverseId0(key)) {
              workspace.applyEvent(reverse02(key));
            }
            render();
          };
        }
        pre.innerHTML = fromDerivation(rule.example);
        panel.appendChild(pre);
      }
    });
    return panel;
  };
  var leftPanel = (ls, rules2) => {
    const panel = document.createElement("div");
    panel.setAttribute("class", "left");
    entries(left).forEach(([key, rule]) => {
      if (rules2.includes(key)) {
        const pre = document.createElement("pre");
        const disabled = workspace.isSolved() || !ls.includes(key);
        pre.setAttribute("class", "rule button" + (disabled ? " disabled" : ""));
        if (!disabled) {
          pre.onclick = () => {
            workspace.applyEvent(reverse02(key));
            render();
          };
        }
        pre.innerHTML = fromDerivation(rule.example);
        panel.appendChild(pre);
      }
    });
    return panel;
  };
  var rightPanel = (ls, rules2) => {
    const panel = document.createElement("div");
    panel.setAttribute("class", "right");
    entries(right).forEach(([key, rule]) => {
      if (rules2.includes(key)) {
        const pre = document.createElement("pre");
        const disabled = workspace.isSolved() || !ls.includes(key);
        if (!disabled) {
          pre.onclick = () => {
            workspace.applyEvent(reverse02(key));
            render();
          };
        }
        pre.setAttribute("class", "rule button" + (disabled ? " disabled" : ""));
        pre.innerHTML = fromDerivation(rule.example);
        panel.appendChild(pre);
      }
    });
    return panel;
  };
  var control = (s) => {
    const path = activePath(s);
    const panel = document.createElement("div");
    panel.setAttribute("class", "controls");
    controls.forEach((key) => {
      const disabled = !(key === "level" || ["undo", "reset"].includes(key) && path.length > 0);
      const pre = document.createElement("pre");
      pre.setAttribute("class", "button" + (disabled ? " disabled" : ""));
      if (!disabled) {
        switch (key) {
          case "undo":
            pre.onclick = () => {
              workspace.applyEvent(undo());
              render();
            };
            break;
          case "reset":
            pre.onclick = () => {
              workspace.applyEvent(reset());
              render();
            };
            break;
          case "level":
            pre.onclick = levelHandler;
            break;
        }
      }
      pre.innerHTML = key;
      panel.appendChild(pre);
    });
    return panel;
  };
  var bench = (s, rules2) => {
    const ls = workspace.applicableRules();
    const panel = document.createElement("div");
    panel.setAttribute("class", "bench");
    panel.appendChild(leftPanel(ls, rules2));
    panel.appendChild(mainPanel(ls, rules2));
    panel.appendChild(rightPanel(ls, rules2));
    panel.appendChild(playArea(s));
    panel.appendChild(control(s));
    return panel;
  };
  var render = () => {
    const body = document.getElementById("body");
    if (!body) {
      return;
    }
    body.innerHTML = "";
    body.appendChild(listing());
    body.appendChild(
      bench(workspace.currentConjecture(), workspace.availableRules())
    );
  };
  var selectLevel = (selected) => {
    if (workspace.isConjectureId(selected)) {
      workspace.selectConjecture(selected);
      history.pushState({ selected }, "", `?level=${selected}`);
    }
    render();
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
  var oldPresses = [];
  function gameLoop() {
    const pads = navigator.getGamepads();
    if (pads.length < 1) {
      return;
    }
    const gp = pads[0];
    if (!gp) {
      return;
    }
    for (const [button, action] of Object.entries(ps5KeyMap)) {
      const index = Number(button);
      const oldPress = oldPresses[index] ?? false;
      const newPress = gp.buttons[index]?.pressed ?? false;
      if (newPress !== oldPress) {
        if (newPress) {
          dispatch(action);
        }
        oldPresses[index] = newPress;
      }
    }
    requestAnimationFrame(gameLoop);
  }
  var autoRule = (rules2) => {
    const available = workspace.applicableRules();
    const [first] = rules2.filter((rule) => available.includes(rule));
    if (!first) {
      return;
    }
    if (isReverseId0(first)) {
      workspace.applyEvent(reverse02(first));
    }
  };
  var dispatch = (action) => {
    if (workspace.isSolved()) {
      switch (action) {
        case "leftWeakening":
        case "rightWeakening":
          workspace.applyEvent(reset());
          break;
        case "axiom":
        case "rightConnective":
          workspace.selectConjecture(workspace.nextConjectureId());
          break;
        case "undo":
          workspace.selectConjecture(workspace.previousConjectureId());
          break;
      }
    } else {
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
          autoRule(keys(leftLogical));
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
          autoRule(keys(rightLogical));
          break;
        case "axiom":
          autoRule(keys(center));
          break;
        case "undo":
          workspace.applyEvent(undo());
          break;
      }
    }
    render();
  };
  var qwertyKeyMap = {
    e: "leftWeakening",
    s: "leftRotateLeft",
    f: "leftRotateRight",
    d: "leftConnective",
    i: "rightWeakening",
    j: "rightRotateLeft",
    l: "rightRotateRight",
    k: "rightConnective",
    Enter: "axiom",
    Backspace: "undo"
  };
  var init3 = () => {
    const params = new URLSearchParams(window.location.search);
    const level = params.get("level") ?? "";
    if (workspace.isConjectureId(level)) {
      workspace.selectConjecture(level);
      history.replaceState({ selected: level }, "", `?level=${level}`);
    }
    render();
    document.addEventListener("keydown", (ev) => {
      const action = qwertyKeyMap[ev.key];
      if (!action) {
        return;
      }
      dispatch(action);
    });
    window.addEventListener("gamepadconnected", (_ev) => {
      gameLoop();
    });
  };
  var gen = repl(workspace);
  gen.next("");
  window["cmd"] = (input) => {
    const result = gen.next(input);
    console.log(result.value);
    render();
    return result.done;
  };
  document.addEventListener("DOMContentLoaded", init3);
  window.addEventListener("popstate", (event) => {
    const level = event.state?.selected;
    if (level && isTheoremKey(level)) {
      workspace.selectConjecture(level);
    }
    render();
  });
})();
