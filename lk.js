"use strict";
(() => {
  // src/model/prop.ts
  var atom = (value) => ({
    kind: "atom",
    value
  });
  var negation = (negand) => ({
    kind: "negation",
    negand
  });
  var implication = (antecedent, consequent) => ({
    kind: "implication",
    antecedent,
    consequent
  });
  var conjunction = (leftConjunct, rightConjunct) => ({
    kind: "conjunction",
    leftConjunct,
    rightConjunct
  });
  var disjunction = (leftDisjunct, rightDisjunct) => ({
    kind: "disjunction",
    leftDisjunct,
    rightDisjunct
  });
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

  // src/utils/array.ts
  var isNonEmptyArray = (a) => {
    return a.hasOwnProperty(0);
  };
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

  // src/utils/tuple.ts
  var head = (a) => {
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
  var last = (a) => {
    return a[a.length - 1];
  };
  var isTupleOf1 = (arr) => arr.length === 1;

  // src/utils/utils.ts
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
  function align(a, b) {
    const last2 = lastLine(a);
    if (last2.trim().length < 1) {
      return null;
    }
    const [first2, ...rest] = split(b, "\n");
    if (first2.trim() !== last2.trim()) {
      return null;
    }
    const topLeft = Math.abs(last2.trimStart().length - last2.length);
    const topRight = Math.abs(last2.trimEnd().length - last2.length);
    const bottomLeft = Math.abs(first2.trimStart().length - first2.length);
    const bottomRight = Math.abs(first2.trimEnd().length - first2.length);
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
  function left(wide) {
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
      (_, i2) => left(width1)(lines1[i2] ?? String()) + left(width2)(lines2[i2] ?? String())
    ).reverse().join("\n");
  }
  function center(wide) {
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
    const [first2, ...rest] = blocks;
    if (typeof first2 !== "string") {
      return "";
    }
    return rest.map(margin(n, 0)).reduce(concat, first2);
  }
  var br = String();
  function leftify(...lines) {
    return lines.join("\n");
  }
  function tree(root, branches, note, lineWidth) {
    const line1 = center(lineWidth)(spaced(branches, 2));
    const last2 = center(lineWidth)(lastLine(line1).trim());
    const line2 = spaced([line(lineWidth), note]);
    const line3 = center(lineWidth)(root);
    const aligned = align(line1, pad(leftify(last2, line2, line3)));
    if (aligned) {
      return aligned;
    }
    return pad(leftify(line1, line2, line3));
  }
  function lastLine(block) {
    const [first2, ...rest] = split(block, "\n");
    return rest.at(-1) ?? first2;
  }
  function treeAuto(root, branches, note) {
    const branchBlock = spaced(branches, 2);
    const contentWidth = Math.max(
      lastLine(branchBlock).trim().length + 2,
      width(root) + 2
    );
    return tree(root, branches, note, contentWidth);
  }

  // src/model/judgement.ts
  var equalFormulas = (aa, ab) => {
    return aa.length === ab.length && zip(aa, ab).every(([a, b]) => equals(a, b));
  };
  var judgement = (antecedent, succedent) => ({
    kind: "judgement",
    antecedent,
    succedent
  });
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
  var isProof = (d) => {
    return d.kind === "transformation" && d.deps.every((dep) => isProof(dep));
  };
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
  var lsPremise = (_d, path) => {
    return [path];
  };
  var lsTransformation = (d, path) => {
    const paths = d.deps.flatMap((dep, i2) => lsDerivation(dep, [...path, i2]));
    if (isNonEmptyArray(paths)) {
      return paths;
    }
    return [path];
  };
  var lsDerivation = (root, path = []) => {
    switch (root.kind) {
      case "premise":
        return lsPremise(root, path);
      case "transformation":
        return lsTransformation(root, path);
    }
  };

  // src/interactive/focus.ts
  var focus = (derivation, branch = 0) => ({
    derivation,
    branch
  });
  var next = (s) => focus(s.derivation, s.branch + 1);
  var prev = (s) => focus(s.derivation, s.branch - 1);
  var activePath = (s) => {
    const paths = lsDerivation(s.derivation);
    return mod(paths, s.branch);
  };
  var apply = (s, edit) => {
    const path = activePath(s);
    const derivation = editDerivation(s.derivation, path, edit);
    if (!derivation) {
      return s;
    }
    return focus(derivation, s.branch);
  };
  var undo = (s) => {
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
  var reset = (s) => {
    return focus(premise(s.derivation.result));
  };
  var applyEvent = (state, ev) => {
    switch (ev.kind) {
      case "reverse":
        const edit = rev[ev.rev];
        if (!edit) {
          break;
        }
        state = apply(state, edit);
        break;
      case "undo":
        state = undo(state);
        break;
      case "reset":
        state = reset(state);
        break;
      case "next":
        state = next(state);
        break;
      case "prev":
        state = prev(state);
        break;
    }
    return state;
  };

  // src/render/print.ts
  var NullaryTemplateId = {
    falsum: null,
    verum: null
  };
  var isNullaryTemplateId = (s) => NullaryTemplateId.hasOwnProperty(s);
  var UnaryTemplateId = {
    atom: null,
    optional: null,
    parenthesis: null,
    negation: null
  };
  var isUnaryTemplateId = (s) => UnaryTemplateId.hasOwnProperty(s);
  var BinaryTemplateId = {
    conjunction: null,
    disjunction: null,
    implication: null,
    formulas: null,
    sequent: null
  };
  var isBinaryTemplateId = (s) => BinaryTemplateId.hasOwnProperty(s);
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
    return ([head2, ...tail2]) => tail2.reduce(print(k), head2);
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
      chr = "\u{1F9A2}";
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
  function fromSequent(judgement2) {
    const { antecedent, succedent } = judgement2;
    return (t) => print("sequent")(
      fromFormulas(antecedent),
      fromFormulas(succedent)
    )(t).trim();
  }
  function left2(n = null) {
    const l = "L";
    return n ? l + n : l;
  }
  function right(n = null) {
    const r = "R";
    return n ? r + n : r;
  }
  function fromRule(s) {
    return (t) => {
      switch (s) {
        case "cl1":
          return t.conjunction.join(empty) + left2("\u2081");
        case "dr1":
          return t.disjunction.join(empty) + right("\u2081");
        case "cl2":
          return t.conjunction.join(empty) + left2("\u2082");
        case "dr2":
          return t.disjunction.join(empty) + right("\u2082");
        case "dl":
          return t.disjunction.join(empty) + left2();
        case "cr":
          return t.conjunction.join(empty) + right();
        case "il":
          return t.implication.join(empty) + left2();
        case "ir":
          return t.implication.join(empty) + right();
        case "nl":
          return t.negation.join(empty) + left2();
        case "nr":
          return t.negation.join(empty) + right();
        case "swl":
          return "WL";
        case "swr":
          return "WR";
        case "scl":
          return "CL";
        case "scr":
          return "CR";
        case "SRotLF":
          return "\u21B6L";
        case "SRotRF":
          return "\u21B7R";
        case "SRotLB":
          return "\u21B7L";
        case "SRotRB":
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
  var half = center(2 * unit);
  var full = center(4 * unit);
  var fromFocus = (s) => {
    const path = activePath(s);
    return fromDerivation(s.derivation);
  };

  // src/utils/record.ts
  var entries = (s) => Object.entries(s);

  // src/systems/lk.ts
  var atom2 = atom;
  var negation2 = (n) => negation(n);
  var isNegation = (p) => p.kind === "negation";
  var implication2 = (a, c) => implication(a, c);
  var isImplication = (p) => p.kind === "implication";
  var conjunction2 = (l, r) => conjunction(l, r);
  var isConjunction = (p) => p.kind === "conjunction";
  var disjunction2 = (l, r) => disjunction(l, r);
  var isDisjunction = (p) => p.kind === "disjunction";
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
    return isActiveR(j) && r(head(j.succedent));
  };
  var isIResult = (s) => {
    return isTupleOf1(s.antecedent) && isTupleOf1(s.succedent) && equals(s.antecedent[0], s.succedent[0]);
  };
  var isIResultDerivation = refineDerivation(isIResult);
  var i = (result) => introduction(result, "I");
  var applyI = (a) => i(judgement([a], [a]));
  var reverseI = (p) => {
    return i(p.result);
  };
  var tryReverseI = (d) => {
    return isIResultDerivation(d) ? reverseI(d) : null;
  };
  var exampleI = applyI(atom2("A"));
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
    return cut(judgement(\u03B3, \u03B4), [s1, s2]);
  };
  var exampleCut = applyCut(
    premise(judgement([atom2("\u0393")], [atom2("\u0394"), atom2("A")])),
    premise(judgement([atom2("A"), atom2("\u0393")], [atom2("\u0394")]))
  );
  var isCL1Result = refineActiveL(isConjunction);
  var isCL1ResultDerivation = refineDerivation(isCL1Result);
  var cl1 = (result, deps) => {
    return transformation(result, deps, "cl1");
  };
  var applyCL1 = (b, s) => {
    const \u03B3 = init2(s.result.antecedent);
    const a = last(s.result.antecedent);
    const \u03B4 = s.result.succedent;
    return cl1(judgement([...\u03B3, conjunction2(a, b)], \u03B4), [s]);
  };
  var reverseCL1 = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const acb = last(p.result.antecedent);
    const a = acb.leftConjunct;
    const \u03B4 = p.result.succedent;
    return cl1(p.result, [premise(judgement([...\u03B3, a], \u03B4))]);
  };
  var tryReverseCL1 = (d) => {
    return isCL1ResultDerivation(d) ? reverseCL1(d) : null;
  };
  var exampleCL1 = applyCL1(
    atom2("B"),
    premise(judgement([atom2("\u0393"), atom2("A")], [atom2("\u0394")]))
  );
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
    const a = head(s.result.succedent);
    return dr1(judgement(\u03B3, [disjunction2(a, b), ...\u03B4]), [s]);
  };
  var reverseDR1 = (p) => {
    const \u03B3 = p.result.antecedent;
    const adb = head(p.result.succedent);
    const a = adb.leftDisjunct;
    const \u03B4 = tail(p.result.succedent);
    return dr1(p.result, [premise(judgement(\u03B3, [a, ...\u03B4]))]);
  };
  var tryReverseDR1 = (d) => {
    return isDR1ResultDerivation(d) ? reverseDR1(d) : null;
  };
  var exampleDR1 = applyDR1(
    atom2("B"),
    premise(judgement([atom2("\u0393")], [atom2("A"), atom2("\u0394")]))
  );
  var isCL2Result = refineActiveL(isConjunction);
  var isCL2ResultDerivation = refineDerivation(isCL2Result);
  var cl2 = (result, deps) => {
    return transformation(result, deps, "cl2");
  };
  var applyCL2 = (a, s) => {
    const \u03B3 = init2(s.result.antecedent);
    const b = last(s.result.antecedent);
    const \u03B4 = s.result.succedent;
    return cl2(judgement([...\u03B3, conjunction2(a, b)], \u03B4), [s]);
  };
  var reverseCL2 = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const acb = last(p.result.antecedent);
    const b = acb.rightConjunct;
    const \u03B4 = p.result.succedent;
    return cl2(p.result, [premise(judgement([...\u03B3, b], \u03B4))]);
  };
  var tryReverseCL2 = (d) => {
    return isCL2ResultDerivation(d) ? reverseCL2(d) : null;
  };
  var exampleCL2 = applyCL2(
    atom2("A"),
    premise(judgement([atom2("\u0393"), atom2("B")], [atom2("\u0394")]))
  );
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
    const b = head(s.result.succedent);
    return dr2(judgement(\u03B3, [disjunction2(a, b), ...\u03B4]), [s]);
  };
  var reverseDR2 = (p) => {
    const \u03B3 = p.result.antecedent;
    const adb = head(p.result.succedent);
    const b = adb.rightDisjunct;
    const \u03B4 = tail(p.result.succedent);
    return dr2(p.result, [premise(judgement(\u03B3, [b, ...\u03B4]))]);
  };
  var tryReverseDR2 = (d) => {
    return isDR2ResultDerivation(d) ? reverseDR2(d) : null;
  };
  var exampleDR2 = applyDR2(
    atom2("A"),
    premise(judgement([atom2("\u0393"), atom2("B")], [atom2("\u0394")]))
  );
  var isDLResult = refineActiveL(isDisjunction);
  var isDLResultDerivation = refineDerivation(isDLResult);
  var dl = (result, deps) => {
    return transformation(result, deps, "dl");
  };
  var applyDL = (s1, s2) => {
    const \u03B3 = init2(s1.result.antecedent);
    const a = last(s1.result.antecedent);
    const b = last(s2.result.antecedent);
    const \u03B4 = s1.result.succedent;
    return dl(judgement([...\u03B3, disjunction2(a, b)], \u03B4), [s1, s2]);
  };
  var reverseDL = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const adb = last(p.result.antecedent);
    const a = adb.leftDisjunct;
    const b = adb.rightDisjunct;
    const \u03B4 = p.result.succedent;
    return dl(p.result, [
      premise(judgement([...\u03B3, a], \u03B4)),
      premise(judgement([...\u03B3, b], \u03B4))
    ]);
  };
  var tryReverseDL = (d) => {
    return isDLResultDerivation(d) ? reverseDL(d) : null;
  };
  var exampleDL = applyDL(
    premise(judgement([atom2("\u0393"), atom2("A")], [atom2("\u0394")])),
    premise(judgement([atom2("\u0393"), atom2("B")], [atom2("\u0394")]))
  );
  var isCRResult = refineActiveR(isConjunction);
  var isCRResultDerivation = refineDerivation(isCRResult);
  var cr = (result, deps) => {
    return transformation(result, deps, "cr");
  };
  var applyCR = (s1, s2) => {
    const \u03B3 = s1.result.antecedent;
    const a = head(s1.result.succedent);
    const b = head(s2.result.succedent);
    const \u03B4 = tail(s1.result.succedent);
    return cr(judgement(\u03B3, [conjunction2(a, b), ...\u03B4]), [s1, s2]);
  };
  var reverseCR = (p) => {
    const \u03B3 = p.result.antecedent;
    const acb = head(p.result.succedent);
    const a = acb.leftConjunct;
    const b = acb.rightConjunct;
    const \u03B4 = tail(p.result.succedent);
    return cr(p.result, [
      premise(judgement(\u03B3, [a, ...\u03B4])),
      premise(judgement(\u03B3, [b, ...\u03B4]))
    ]);
  };
  var tryReverseCR = (d) => {
    return isCRResultDerivation(d) ? reverseCR(d) : null;
  };
  var exampleCR = applyCR(
    premise(judgement([atom2("\u0393")], [atom2("A"), atom2("\u0394")])),
    premise(judgement([atom2("\u0393")], [atom2("B"), atom2("\u0394")]))
  );
  var isILResult = refineActiveL(isImplication);
  var isILResultDerivation = refineDerivation(isILResult);
  var il = (result, deps) => {
    return transformation(result, deps, "il");
  };
  var applyIL = (s1, s2) => {
    const \u03B3 = s1.result.antecedent;
    const a = head(s1.result.succedent);
    const b = last(s2.result.antecedent);
    const \u03B4 = tail(s1.result.succedent);
    return il(judgement([...\u03B3, implication2(a, b)], \u03B4), [s1, s2]);
  };
  var reverseIL = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const aib = last(p.result.antecedent);
    const a = aib.antecedent;
    const b = aib.consequent;
    const \u03B4 = p.result.succedent;
    return il(p.result, [
      premise(judgement(\u03B3, [a, ...\u03B4])),
      premise(judgement([...\u03B3, b], \u03B4))
    ]);
  };
  var tryReverseIL = (d) => {
    return isILResultDerivation(d) ? reverseIL(d) : null;
  };
  var exampleIL = applyIL(
    premise(judgement([atom2("\u0393")], [atom2("A"), atom2("\u0394")])),
    premise(judgement([atom2("\u0393"), atom2("B")], [atom2("\u0394")]))
  );
  var isIRResult = refineActiveR(isImplication);
  var isIRResultDerivation = refineDerivation(isIRResult);
  var ir = (result, deps) => {
    return transformation(result, deps, "ir");
  };
  var applyIR = (s) => {
    const \u03B3 = init2(s.result.antecedent);
    const a = last(s.result.antecedent);
    const b = head(s.result.succedent);
    const \u03B4 = tail(s.result.succedent);
    return ir(judgement(\u03B3, [implication2(a, b), ...\u03B4]), [s]);
  };
  var reverseIR = (p) => {
    const \u03B3 = p.result.antecedent;
    const aib = head(p.result.succedent);
    const a = aib.antecedent;
    const b = aib.consequent;
    const \u03B4 = tail(p.result.succedent);
    return ir(p.result, [premise(judgement([...\u03B3, a], [b, ...\u03B4]))]);
  };
  var tryReverseIR = (d) => {
    return isIRResultDerivation(d) ? reverseIR(d) : null;
  };
  var exampleIR = applyIR(
    premise(judgement([atom2("\u0393"), atom2("A")], [atom2("B"), atom2("\u0394")]))
  );
  var isNLResult = refineActiveL(isNegation);
  var isNLResultDerivation = refineDerivation(isNLResult);
  var nl = (result, deps) => {
    return transformation(result, deps, "nl");
  };
  var applyNL = (s) => {
    const \u03B3 = s.result.antecedent;
    const a = head(s.result.succedent);
    const \u03B4 = tail(s.result.succedent);
    return nl(judgement([...\u03B3, negation2(a)], \u03B4), [s]);
  };
  var reverseNL = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const na = last(p.result.antecedent);
    const a = na.negand;
    const \u03B4 = p.result.succedent;
    return nl(p.result, [premise(judgement(\u03B3, [a, ...\u03B4]))]);
  };
  var tryReverseNL = (d) => {
    return isNLResultDerivation(d) ? reverseNL(d) : null;
  };
  var exampleNL = applyNL(
    premise(judgement([atom2("\u0393")], [atom2("A"), atom2("\u0394")]))
  );
  var isNRResult = refineActiveR(isNegation);
  var isNRResultDerivation = refineDerivation(isNRResult);
  var nr = (result, deps) => {
    return transformation(result, deps, "nr");
  };
  var applyNR = (s) => {
    const \u03B3 = init2(s.result.antecedent);
    const a = last(s.result.antecedent);
    const \u03B4 = s.result.succedent;
    return nr(judgement(\u03B3, [negation2(a), ...\u03B4]), [s]);
  };
  var reverseNR = (p) => {
    const \u03B3 = p.result.antecedent;
    const na = head(p.result.succedent);
    const a = na.negand;
    const \u03B4 = tail(p.result.succedent);
    return nr(p.result, [premise(judgement([...\u03B3, a], \u03B4))]);
  };
  var tryReverseNR = (d) => {
    return isNRResultDerivation(d) ? reverseNR(d) : null;
  };
  var exampleNR = applyNR(
    premise(judgement([atom2("\u0393"), atom2("A")], [atom2("\u0394")]))
  );
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
    return swl(judgement([...\u03B3, a], \u03B4), [s]);
  };
  var reverseSWL = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const \u03B4 = p.result.succedent;
    return swl(p.result, [premise(judgement(\u03B3, \u03B4))]);
  };
  var tryReverseSWL = (d) => {
    return isSWLResultDerivation(d) ? reverseSWL(d) : null;
  };
  var exampleSWL = applySWL(
    atom2("A"),
    premise(judgement([atom2("\u0393")], [atom2("\u0394")]))
  );
  var isSWRResult = isActiveR;
  var isSWRResultDerivation = refineDerivation(isSWRResult);
  var swr = (result, deps) => {
    return transformation(result, deps, "swr");
  };
  var applySWR = (a, s) => {
    const \u03B3 = s.result.antecedent;
    const \u03B4 = s.result.succedent;
    return swr(judgement(\u03B3, [a, ...\u03B4]), [s]);
  };
  var reverseSWR = (p) => {
    const \u03B3 = p.result.antecedent;
    const \u03B4 = tail(p.result.succedent);
    return swr(p.result, [premise(judgement(\u03B3, \u03B4))]);
  };
  var tryReverseSWR = (d) => {
    return isSWRResultDerivation(d) ? reverseSWR(d) : null;
  };
  var exampleSWR = applySWR(
    atom2("A"),
    premise(judgement([atom2("\u0393")], [atom2("\u0394")]))
  );
  var isSCLResult = (s) => {
    return s.antecedent.length > 0;
  };
  var isSCLResultDerivation = refineDerivation(isSCLResult);
  var scl = (result, deps) => {
    return transformation(result, deps, "scl");
  };
  var applySCL = (s) => {
    const \u03B3 = init2(init2(s.result.antecedent));
    const a = last(s.result.antecedent);
    const \u03B4 = s.result.succedent;
    return scl(judgement([...\u03B3, a], \u03B4), [s]);
  };
  var reverseSCL = (p) => {
    const \u03B3 = init2(p.result.antecedent);
    const a = last(p.result.antecedent);
    const \u03B4 = p.result.succedent;
    return scl(p.result, [premise(judgement([...\u03B3, a, a], \u03B4))]);
  };
  var tryReverseSCL = (d) => {
    return isSCLResultDerivation(d) ? reverseSCL(d) : null;
  };
  var exampleSCL = applySCL(
    premise(judgement([atom2("\u0393"), atom2("A"), atom2("A")], [atom2("\u0394")]))
  );
  var isSCRResult = isActiveR;
  var isSCRResultDerivation = refineDerivation(isSCRResult);
  var scr = (result, deps) => {
    return transformation(result, deps, "scr");
  };
  var applySCR = (s) => {
    const \u03B3 = s.result.antecedent;
    const a = head(s.result.succedent);
    const \u03B4 = tail(tail(s.result.succedent));
    return scr(judgement(\u03B3, [a, ...\u03B4]), [s]);
  };
  var reverseSCR = (p) => {
    const \u03B3 = p.result.antecedent;
    const a = head(p.result.succedent);
    const \u03B4 = tail(p.result.succedent);
    return scr(p.result, [premise(judgement(\u03B3, [a, a, ...\u03B4]))]);
  };
  var tryReverseSCR = (d) => {
    return isSCRResultDerivation(d) ? reverseSCR(d) : null;
  };
  var exampleSCR = applySCR(
    premise(judgement([atom2("\u0393")], [atom2("A"), atom2("A"), atom2("\u0394")]))
  );
  var isSRotLFResult = (s) => {
    return s.antecedent.length > 1;
  };
  var isSRotLFResultDerivation = refineDerivation(isSRotLFResult);
  var sRotLF = (result, deps) => {
    return transformation(result, deps, "SRotLF");
  };
  var applySRotLF = (s) => {
    const \u03B3 = init2(init2(s.result.antecedent));
    const a = last(s.result.antecedent);
    const b = last(init2(s.result.antecedent));
    const \u03B4 = s.result.succedent;
    return sRotLF(judgement([a, ...\u03B3, b], \u03B4), [s]);
  };
  var reverseSRotLF = (p) => {
    const \u03B3 = init2(tail(p.result.antecedent));
    const a = head(p.result.antecedent);
    const b = last(p.result.antecedent);
    const \u03B4 = p.result.succedent;
    return sRotLF(p.result, [premise(judgement([...\u03B3, b, a], \u03B4))]);
  };
  var tryReverseSRotLF = (d) => {
    return isSRotLFResultDerivation(d) ? reverseSRotLF(d) : null;
  };
  var exampleSRotLF = applySRotLF(
    premise(judgement([atom2("\u0393"), atom2("B"), atom2("A")], [atom2("\u0394")]))
  );
  var isSRotLBResult = (s) => {
    return s.antecedent.length > 1;
  };
  var isSRotLBResultDerivation = refineDerivation(isSRotLBResult);
  var sRotLB = (result, deps) => {
    return transformation(result, deps, "SRotLB");
  };
  var applySRotLB = (s) => {
    const a = head(s.result.antecedent);
    const \u03B3 = init2(tail(s.result.antecedent));
    const b = last(s.result.antecedent);
    const \u03B4 = s.result.succedent;
    return sRotLB(judgement([...\u03B3, b, a], \u03B4), [s]);
  };
  var reverseSRotLB = (p) => {
    const \u03B3 = init2(init2(p.result.antecedent));
    const a = last(p.result.antecedent);
    const b = last(init2(p.result.antecedent));
    const \u03B4 = p.result.succedent;
    return sRotLB(p.result, [premise(judgement([a, ...\u03B3, b], \u03B4))]);
  };
  var tryReverseSRotLB = (d) => {
    return isSRotLBResultDerivation(d) ? reverseSRotLB(d) : null;
  };
  var exampleSRotLB = applySRotLB(
    premise(judgement([atom2("A"), atom2("\u0393"), atom2("B")], [atom2("\u0394")]))
  );
  var isSRotRFResult = (s) => {
    return s.succedent.length > 1;
  };
  var isSRotRFResultDerivation = refineDerivation(isSRotRFResult);
  var sRotRF = (result, deps) => {
    return transformation(result, deps, "SRotRF");
  };
  var applySRotRF = (s) => {
    const \u03B3 = s.result.antecedent;
    const \u03B4 = tail(tail(s.result.succedent));
    const a = head(s.result.succedent);
    const b = head(tail(s.result.succedent));
    return sRotRF(judgement(\u03B3, [b, ...\u03B4, a]), [s]);
  };
  var reverseSRotRF = (p) => {
    const \u03B3 = p.result.antecedent;
    const \u03B4 = init2(tail(p.result.succedent));
    const a = last(p.result.succedent);
    const b = head(p.result.succedent);
    return sRotRF(p.result, [premise(judgement(\u03B3, [a, b, ...\u03B4]))]);
  };
  var tryReverseSRotRF = (d) => {
    return isSRotRFResultDerivation(d) ? reverseSRotRF(d) : null;
  };
  var exampleSRotRF = applySRotRF(
    premise(judgement([atom2("\u0393")], [atom2("A"), atom2("B"), atom2("\u0394")]))
  );
  var isSRotRBResult = (s) => {
    return s.succedent.length > 1;
  };
  var isSRotRBResultDerivation = refineDerivation(isSRotRBResult);
  var sRotRB = (result, deps) => {
    return transformation(result, deps, "SRotRB");
  };
  var applySRotRB = (s) => {
    const \u03B3 = s.result.antecedent;
    const \u03B4 = init2(tail(s.result.succedent));
    const a = last(s.result.succedent);
    const b = head(s.result.succedent);
    return sRotRB(judgement(\u03B3, [a, b, ...\u03B4]), [s]);
  };
  var reverseSRotRB = (p) => {
    const \u03B3 = p.result.antecedent;
    const \u03B4 = tail(tail(p.result.succedent));
    const a = head(p.result.succedent);
    const b = head(tail(p.result.succedent));
    return sRotRB(p.result, [premise(judgement(\u03B3, [b, ...\u03B4, a]))]);
  };
  var tryReverseSRotRB = (d) => {
    return isSRotRBResultDerivation(d) ? reverseSRotRB(d) : null;
  };
  var exampleSRotRB = applySRotRB(
    premise(judgement([atom2("\u0393")], [atom2("B"), atom2("\u0394"), atom2("A")]))
  );
  var isSXLResult = (s) => {
    return s.antecedent.length > 1;
  };
  var isSXLResultDerivation = refineDerivation(isSXLResult);
  var sxl = (result, deps) => {
    return transformation(result, deps, "sxl");
  };
  var applySXL = (s) => {
    const \u03B3 = init2(init2(s.result.antecedent));
    const b = last(s.result.antecedent);
    const a = last(init2(s.result.antecedent));
    const \u03B4 = s.result.succedent;
    return sxl(judgement([...\u03B3, b, a], \u03B4), [s]);
  };
  var reverseSXL = (p) => {
    const \u03B3 = init2(init2(p.result.antecedent));
    const a = last(p.result.antecedent);
    const b = last(init2(p.result.antecedent));
    const \u03B4 = p.result.succedent;
    return sxl(p.result, [premise(judgement([...\u03B3, a, b], \u03B4))]);
  };
  var tryReverseSXL = (d) => {
    return isSXLResultDerivation(d) ? reverseSXL(d) : null;
  };
  var exampleSXL = applySXL(
    premise(judgement([atom2("\u0393"), atom2("A"), atom2("B")], [atom2("\u0394")]))
  );
  var isSXRResult = (s) => {
    return s.succedent.length > 1;
  };
  var isSXRResultDerivation = refineDerivation(isSXRResult);
  var sxr = (result, deps) => {
    return transformation(result, deps, "sxr");
  };
  var applySXR = (s) => {
    const \u03B3 = s.result.antecedent;
    const b = head(tail(s.result.succedent));
    const a = head(s.result.succedent);
    const \u03B4 = tail(tail(s.result.succedent));
    return sxr(judgement(\u03B3, [b, a, ...\u03B4]), [s]);
  };
  var reverseSXR = (p) => {
    const \u03B3 = p.result.antecedent;
    const a = head(tail(p.result.succedent));
    const b = head(p.result.succedent);
    const \u03B4 = tail(tail(p.result.succedent));
    return sxr(p.result, [premise(judgement(\u03B3, [a, b, ...\u03B4]))]);
  };
  var tryReverseSXR = (d) => {
    return isSXRResultDerivation(d) ? reverseSXR(d) : null;
  };
  var exampleSXR = applySXR(
    premise(judgement([atom2("\u0393")], [atom2("A"), atom2("B"), atom2("\u0394")]))
  );
  var alpha = (s) => atom2(s);
  var omega = {
    p0: {},
    p1: { negation: negation2 },
    p2: { implication: implication2, conjunction: conjunction2, disjunction: disjunction2 }
  };
  var iota = {
    i: applyI
  };
  var zeta = {
    cut: applyCut,
    cl1: applyCL1,
    dr1: applyDR1,
    cl2: applyCL2,
    dr2: applyDR2,
    dl: applyDL,
    cr: applyCR,
    il: applyIL,
    ir: applyIR,
    nl: applyNL,
    nr: applyNR,
    swl: applySWL,
    swr: applySWR,
    scl: applySCL,
    scr: applySCR,
    sRotLF: applySRotLF,
    sRotLB: applySRotLB,
    sRotRF: applySRotRF,
    sRotRB: applySRotRB,
    sxl: applySXL,
    sxr: applySXR
  };
  var rev = {
    i: tryReverseI,
    cl1: tryReverseCL1,
    dr1: tryReverseDR1,
    cl2: tryReverseCL2,
    dr2: tryReverseDR2,
    dl: tryReverseDL,
    cr: tryReverseCR,
    il: tryReverseIL,
    ir: tryReverseIR,
    nl: tryReverseNL,
    nr: tryReverseNR,
    swl: tryReverseSWL,
    swr: tryReverseSWR,
    scl: tryReverseSCL,
    scr: tryReverseSCR,
    sRotLF: tryReverseSRotLF,
    sRotLB: tryReverseSRotLB,
    sRotRF: tryReverseSRotRF,
    sRotRB: tryReverseSRotRB,
    sxl: tryReverseSXL,
    sxr: tryReverseSXR
  };
  var meta = {
    name: "Gentzen LK",
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
            negation2(atom2("A")),
            implication2(atom2("A"), atom2("B")),
            conjunction2(atom2("A"), atom2("B")),
            disjunction2(atom2("A"), atom2("B"))
          ]
        ]
      }
    ],
    rules: [
      {
        title: "Axiom",
        examples: [exampleI]
      },
      {
        title: "Cut",
        examples: [[exampleCut]]
      },
      {
        title: "Logical Rules",
        examples: [
          [exampleCL1, exampleDR1],
          [exampleCL2, exampleDR2],
          [exampleDL, exampleCR],
          [exampleIL, exampleIR],
          [exampleNL, exampleNR]
        ]
      },
      {
        title: "Structural Rules",
        examples: [
          [exampleSWL, exampleSWR],
          [exampleSCL, exampleSCR],
          [exampleSRotLF, exampleSRotRF],
          [exampleSRotLB, exampleSRotRB],
          [exampleSXL, exampleSXR]
        ]
      }
    ]
  };
  var lk = {
    a: alpha,
    o: omega,
    i: iota,
    z: zeta
  };
  var revs = (d, p) => entries(rev).flatMap(([rev29, ed]) => {
    const result = editDerivation(d, p, ed);
    if (result) {
      return [[rev29, result]];
    }
    return [];
  });

  // src/interactive/event.ts
  var reverse = (rev29) => ({
    kind: "reverse",
    rev: rev29
  });

  // src/theorems/ch0-identity-1.ts
  var ch0identity1 = {
    rules: ["i"],
    goal: judgement([lk.a("p")], [lk.a("p")])
  };

  // src/theorems/ch0-identity-2.ts
  var ch0identity2 = {
    rules: ["i"],
    goal: judgement([lk.a("q")], [lk.a("q")])
  };

  // src/theorems/ch0-identity-3.ts
  var ch0identity3 = {
    rules: ["i"],
    goal: judgement([lk.o.p1.negation(lk.a("p"))], [lk.o.p1.negation(lk.a("p"))])
  };

  // src/theorems/ch0-identity-4.ts
  var ch0identity4 = {
    rules: ["i"],
    goal: judgement(
      [lk.o.p2.conjunction(lk.a("p"), lk.a("q"))],
      [lk.o.p2.conjunction(lk.a("p"), lk.a("q"))]
    )
  };

  // src/theorems/ch0-identity-5.ts
  var ch0identity5 = {
    rules: ["i"],
    goal: judgement(
      [lk.o.p2.disjunction(lk.a("p"), lk.a("q"))],
      [lk.o.p2.disjunction(lk.a("p"), lk.a("q"))]
    )
  };

  // src/theorems/ch0-identity-6.ts
  var ch0identity6 = {
    rules: ["i"],
    goal: judgement(
      [lk.o.p2.implication(lk.a("p"), lk.a("q"))],
      [lk.o.p2.implication(lk.a("p"), lk.a("q"))]
    )
  };

  // src/theorems/ch0-identity-7.ts
  var ch0identity7 = {
    rules: ["i"],
    goal: judgement(
      [lk.o.p2.conjunction(lk.a("p"), lk.o.p1.negation(lk.a("q")))],
      [lk.o.p2.conjunction(lk.a("p"), lk.o.p1.negation(lk.a("q")))]
    )
  };

  // src/theorems/ch0-identity-8.ts
  var ch0identity8 = {
    rules: ["i"],
    goal: judgement(
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

  // src/theorems/ch0-identity-9.ts
  var ch0identity9 = {
    rules: ["i"],
    goal: judgement(
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

  // src/theorems/ch1-weakening-1.ts
  var ch1weakening1 = {
    rules: ["i", "swl"],
    goal: judgement([lk.a("p"), lk.a("q")], [lk.a("p")])
  };

  // src/theorems/ch1-weakening-2.ts
  var ch1weakening2 = {
    rules: ["i", "swr"],
    goal: judgement([lk.a("p")], [lk.a("q"), lk.a("p")])
  };

  // src/theorems/ch1-weakening-3.ts
  var ch1weakening3 = {
    rules: ["i", "swl", "swr"],
    goal: judgement([lk.a("p"), lk.a("q")], [lk.a("q"), lk.a("p")])
  };

  // src/theorems/ch1-weakening-4.ts
  var ch1weakening4 = {
    rules: ["i", "swl", "swr"],
    goal: judgement(
      [lk.a("q"), lk.o.p2.conjunction(lk.a("p"), lk.a("q"))],
      [lk.o.p2.conjunction(lk.a("q"), lk.a("p")), lk.a("q")]
    )
  };

  // src/theorems/ch1-weakening-5.ts
  var ch1weakening5 = {
    rules: ["i", "swl", "swr"],
    goal: judgement(
      [lk.o.p2.conjunction(lk.a("p"), lk.a("q")), lk.a("p")],
      [lk.a("q"), lk.o.p2.conjunction(lk.a("p"), lk.a("q"))]
    )
  };

  // src/theorems/ch1-weakening-6.ts
  var ch1weakening6 = {
    rules: ["i", "swl", "swr"],
    goal: judgement(
      [lk.a("p"), lk.a("q"), lk.a("q"), lk.a("p")],
      [lk.a("p"), lk.a("q"), lk.a("q"), lk.a("p")]
    )
  };

  // src/theorems/ch1-weakening-7.ts
  var ch1weakening7 = {
    rules: ["i", "swl", "swr"],
    goal: judgement(
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

  // src/theorems/ch1-weakening-8.ts
  var ch1weakening8 = {
    rules: ["i", "swl", "swr"],
    goal: judgement(
      [lk.a("p"), lk.o.p2.implication(lk.a("q"), lk.a("p")), lk.a("q")],
      [lk.a("q"), lk.o.p2.implication(lk.a("q"), lk.a("p")), lk.a("p")]
    )
  };

  // src/theorems/ch1-weakening-9.ts
  var ch1weakening9 = {
    rules: ["i", "swl", "swr"],
    goal: judgement(
      [lk.a("s"), lk.a("r"), lk.a("q"), lk.a("p")],
      [lk.a("p"), lk.a("q"), lk.a("r"), lk.a("s")]
    )
  };

  // src/theorems/ch2-permutation-1.ts
  var ch2permutation1 = {
    rules: ["i", "swl", "sRotLB", "sRotLF"],
    goal: judgement(
      [lk.a("p"), lk.a("p"), lk.a("p"), lk.a("q"), lk.a("p"), lk.a("p")],
      [lk.a("q")]
    )
  };

  // src/theorems/ch2-permutation-2.ts
  var ch2permutation2 = {
    rules: ["i", "swr", "sRotRB", "sRotRF"],
    goal: judgement(
      [lk.a("q")],
      [lk.a("p"), lk.a("p"), lk.a("p"), lk.a("q"), lk.a("p"), lk.a("p")]
    )
  };

  // src/theorems/ch2-permutation-3.ts
  var ch2permutation3 = {
    rules: ["i", "swl", "sRotLB", "sRotLF", "swr", "sRotRB", "sRotRF"],
    goal: judgement(
      [lk.a("p"), lk.a("p"), lk.a("p"), lk.a("q"), lk.a("p"), lk.a("p")],
      [lk.a("p"), lk.a("p"), lk.a("p"), lk.a("q"), lk.a("p"), lk.a("p")]
    )
  };

  // src/theorems/ch2-permutation-4.ts
  var ch2permutation4 = {
    rules: ["i", "swl", "sRotLB", "sRotLF", "swr", "sRotRB", "sRotRF"],
    goal: judgement(
      [lk.a("s"), lk.a("r"), lk.a("q"), lk.a("p")],
      [lk.a("s"), lk.a("r"), lk.a("q"), lk.a("p")]
    )
  };

  // src/theorems/ch2-permutation-5.ts
  var ch2permutation5 = {
    rules: ["i", "swl", "sRotLB", "sRotLF", "swr", "sRotRB", "sRotRF"],
    goal: judgement(
      [lk.o.p2.conjunction(lk.a("p"), lk.a("q")), lk.o.p2.conjunction(lk.a("p"), lk.a("q"))],
      [lk.o.p2.conjunction(lk.a("p"), lk.a("q")), lk.o.p2.disjunction(lk.a("p"), lk.a("q"))]
    )
  };

  // src/theorems/ch2-permutation-6.ts
  var ch2permutation6 = {
    rules: ["i", "swl", "sRotLB", "sRotLF", "swr", "sRotRB", "sRotRF"],
    goal: judgement(
      [lk.o.p2.conjunction(lk.a("q"), lk.a("s")), lk.o.p2.conjunction(lk.a("q"), lk.a("s")), lk.o.p2.conjunction(lk.a("q"), lk.a("s"))],
      [lk.o.p2.conjunction(lk.a("q"), lk.a("s")), lk.o.p2.conjunction(lk.a("s"), lk.a("q")), lk.o.p2.conjunction(lk.a("s"), lk.a("q"))]
    )
  };

  // src/theorems/ch2-permutation-7.ts
  var ch2permutation7 = {
    rules: ["i", "swl", "sRotLB", "sRotLF", "swr", "sRotRB", "sRotRF"],
    goal: judgement(
      [lk.o.p2.implication(lk.a("q"), lk.a("p")), lk.o.p2.implication(lk.a("p"), lk.a("s")), lk.o.p2.implication(lk.a("s"), lk.a("r"))],
      [lk.o.p2.implication(lk.a("r"), lk.a("p")), lk.o.p2.implication(lk.a("p"), lk.a("s")), lk.o.p2.implication(lk.a("s"), lk.a("q"))]
    )
  };

  // src/theorems/ch2-permutation-8.ts
  var ch2permutation8 = {
    rules: ["i", "swl", "sRotLB", "sRotLF", "swr", "sRotRB", "sRotRF"],
    goal: judgement(
      [lk.o.p2.conjunction(lk.a("s"), lk.a("q")), lk.a("r"), lk.o.p2.implication(lk.a("q"), lk.a("p")), lk.o.p1.negation(lk.a("r"))],
      [lk.o.p1.negation(lk.a("p")), lk.o.p2.implication(lk.a("s"), lk.a("q")), lk.o.p1.negation(lk.a("r")), lk.o.p2.disjunction(lk.a("q"), lk.a("p"))]
    )
  };

  // src/theorems/ch2-permutation-9.ts
  var ch2permutation9 = {
    rules: ["i", "swl", "sRotLB", "sRotLF", "swr", "sRotRB", "sRotRF"],
    goal: judgement(
      [lk.a("p"), lk.o.p1.negation(lk.a("p")), lk.a("q"), lk.a("r")],
      [lk.o.p1.negation(lk.a("q")), lk.o.p1.negation(lk.a("p")), lk.a("s"), lk.o.p1.negation(lk.a("r"))]
    )
  };

  // src/theorems/index.ts
  var theorems = {
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
    ch2permutation9
    // harmaaPuolukkaTiikeri,
    // violettiLuumuBiisoni,
    // syaaniPaprikaKettu,
  };
  var isTheoremKey = (k) => k in theorems;

  // src/web.ts
  var main = {
    i: fromDerivation(exampleI)
  };
  var left3 = {
    cl1: fromDerivation(exampleCL1),
    cl2: fromDerivation(exampleCL2),
    dl: fromDerivation(exampleDL),
    il: fromDerivation(exampleIL),
    nl: fromDerivation(exampleNL),
    scl: fromDerivation(exampleSCL),
    swl: fromDerivation(exampleSWL),
    //sxl: fromDerivation(exampleSXL), not relevant for reverse
    sRotLB: fromDerivation(exampleSRotLB),
    sRotLF: fromDerivation(exampleSRotLF)
  };
  var right2 = {
    dr1: fromDerivation(exampleDR1),
    dr2: fromDerivation(exampleDR2),
    cr: fromDerivation(exampleCR),
    ir: fromDerivation(exampleIR),
    nr: fromDerivation(exampleNR),
    scr: fromDerivation(exampleSCR),
    swr: fromDerivation(exampleSWR),
    //sxr: fromDerivation(exampleSXR), not relevant for reverse
    sRotRB: fromDerivation(exampleSRotRB),
    sRotRF: fromDerivation(exampleSRotRF)
  };
  var controls = ["prev", "undo", "reset", "level", "next"];
  var workspace = {};
  var selected = null;
  var isDone = false;
  var status = (s) => "\n" + fromFocus(s) + "\n";
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
    panel.setAttribute("class", "levels");
    Object.keys(theorems).forEach((id) => {
      const item = document.createElement("div");
      const link = document.createElement("a");
      link.setAttribute("class", id === selected ? "active" : "");
      link.setAttribute("href", "#");
      link.onclick = (click) => {
        click.preventDefault();
        selectLevel(id);
      };
      link.innerHTML = id;
      item.appendChild(link);
      panel.appendChild(item);
    });
    shroud.appendChild(panel);
    return shroud;
  };
  var level = (s) => {
    const panel = document.createElement("div");
    panel.setAttribute("class", "playarea");
    if (isDone) {
      const congrats = document.createElement("div");
      congrats.setAttribute("class", "congrats");
      const hurray = document.createElement("div");
      hurray.setAttribute("class", "hurray");
      hurray.innerHTML = "\n\n\u{1F389} Conglaturations! \u{1F389}\n";
      congrats.appendChild(hurray);
      const congratsButtons = document.createElement("div");
      congratsButtons.setAttribute("class", "congrabuttons");
      const againbutton = document.createElement("div");
      againbutton.setAttribute("class", "button");
      againbutton.innerHTML = "Play Again";
      againbutton.onclick = resetHandler();
      congratsButtons.appendChild(againbutton);
      const continueButton = document.createElement("div");
      continueButton.setAttribute("class", "button");
      continueButton.innerHTML = "Next Level";
      continueButton.onclick = () => nextLevel();
      congratsButtons.appendChild(continueButton);
      panel.appendChild(congrats);
      panel.appendChild(congratsButtons);
    }
    const pre = document.createElement("pre");
    pre.setAttribute("class", "status");
    pre.innerHTML = status(s);
    panel.appendChild(pre);
    return panel;
  };
  var ruleHandler = (ev) => () => {
    if (!selected) {
      return;
    }
    const cursor = workspace[selected];
    if (!cursor) {
      return;
    }
    const update = applyEvent(cursor, ev);
    workspace[selected] = update;
    render();
  };
  var undoHandler = (_ev) => () => {
    if (!selected) {
      return;
    }
    const cursor = workspace[selected];
    if (!cursor) {
      return;
    }
    const update = undo(cursor);
    workspace[selected] = update;
    render();
  };
  var nextHandler = (_ev) => () => {
    if (!selected) {
      return;
    }
    const cursor = workspace[selected];
    if (!cursor) {
      return;
    }
    const update = next(cursor);
    workspace[selected] = update;
    render();
  };
  var prevHandler = (_ev) => () => {
    if (!selected) {
      return;
    }
    const cursor = workspace[selected];
    if (!cursor) {
      return;
    }
    const update = prev(cursor);
    workspace[selected] = update;
    render();
  };
  var resetHandler = (_ev) => () => {
    if (!selected) {
      return;
    }
    const cursor = workspace[selected];
    if (!cursor) {
      return;
    }
    const update = reset(cursor);
    workspace[selected] = update;
    render();
  };
  var levelHandler = (_ev) => () => {
    const menu = document.getElementById("levelmenu");
    menu?.removeAttribute("style");
  };
  var mainPanel = (ls, rules) => {
    const panel = document.createElement("div");
    panel.setAttribute("class", "main");
    Object.entries(main).forEach(([key, schem]) => {
      if (rules.includes(key)) {
        const pre = document.createElement("pre");
        const disabled = isDone || !ls.includes(key);
        pre.setAttribute("class", "rule button" + (disabled ? " disabled" : ""));
        if (!disabled) {
          pre.onclick = ruleHandler(reverse(key));
        }
        pre.innerHTML = schem;
        panel.appendChild(pre);
      }
    });
    return panel;
  };
  var leftPanel = (ls, rules) => {
    const panel = document.createElement("div");
    panel.setAttribute("class", "left");
    Object.entries(left3).forEach(([key, schem]) => {
      if (rules.includes(key)) {
        const pre = document.createElement("pre");
        const disabled = isDone || !ls.includes(key);
        pre.setAttribute("class", "rule button" + (disabled ? " disabled" : ""));
        if (!disabled) {
          pre.onclick = ruleHandler(reverse(key));
        }
        pre.innerHTML = schem;
        panel.appendChild(pre);
      }
    });
    return panel;
  };
  var rightPanel = (ls, rules) => {
    const panel = document.createElement("div");
    panel.setAttribute("class", "right");
    Object.entries(right2).forEach(([key, schem]) => {
      if (rules.includes(key)) {
        const pre = document.createElement("pre");
        const disabled = isDone || !ls.includes(key);
        if (!disabled) {
          pre.onclick = ruleHandler(reverse(key));
        }
        pre.setAttribute("class", "rule button" + (disabled ? " disabled" : ""));
        pre.innerHTML = schem;
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
      const disabled = !(key === "level" || ["undo", "reset"].includes(key) && path.length > 0 || ["next", "prev"].includes(key) && lsDerivation(s.derivation).length > 1);
      const pre = document.createElement("pre");
      pre.setAttribute("class", "button" + (disabled ? " disabled" : ""));
      if (!disabled) {
        switch (key) {
          case "undo":
            pre.onclick = undoHandler();
            break;
          case "reset":
            pre.onclick = resetHandler();
            break;
          case "prev":
            pre.onclick = prevHandler();
            break;
          case "next":
            pre.onclick = nextHandler();
            break;
          case "level":
            pre.onclick = levelHandler();
            break;
        }
      }
      pre.innerHTML = key;
      panel.appendChild(pre);
    });
    return panel;
  };
  var bench = (s, rules) => {
    const ls = revs(s.derivation, activePath(s)).map(head);
    const panel = document.createElement("div");
    panel.setAttribute("class", "bench");
    panel.appendChild(leftPanel(ls, rules));
    panel.appendChild(mainPanel(ls, rules));
    panel.appendChild(rightPanel(ls, rules));
    panel.appendChild(level(s));
    panel.appendChild(control(s));
    return panel;
  };
  var render = () => {
    if (!selected) {
      return;
    }
    const current = workspace[selected];
    if (!current) {
      return;
    }
    const body = document.getElementById("body");
    if (!body) {
      return;
    }
    body.innerHTML = "";
    isDone = isProof(current.derivation);
    body.appendChild(listing());
    body.appendChild(bench(current, theorems[selected].rules));
  };
  var selectLevel = (conjectureId) => {
    if (!(conjectureId in workspace)) {
      workspace[conjectureId] = focus(premise(theorems[conjectureId].goal));
    }
    selected = conjectureId;
    history.pushState({ selected }, "", `?level=${selected}`);
    render();
  };
  var first = "ch0identity1";
  var nextLevelId = () => {
    if (!selected) {
      return first;
    }
    const theoremKeys = Object.keys(theorems);
    const index = theoremKeys.findIndex((x) => x === selected);
    if (index < 0) {
      return first;
    }
    return theoremKeys[index + 1] ?? first;
  };
  var nextLevel = () => {
    selectLevel(nextLevelId());
  };
  var init3 = () => {
    const params = new URLSearchParams(window.location.search);
    const level2 = params.get("level");
    if (level2 && isTheoremKey(level2)) {
      selectLevel(level2);
    } else {
      nextLevel();
    }
  };
  document.addEventListener("DOMContentLoaded", init3);
  window.addEventListener("popstate", (event) => {
    const level2 = event.state?.selected;
    if (level2 && isTheoremKey(level2)) {
      selectLevel(level2);
    }
    render();
  });
})();
