export const BATTLE_PROBLEMS = {
  "two-sum": {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    expectedOutput: {
      javascript: "[0,1]\n[1,2]\n[0,1]",
      python: "[0, 1]\n[1, 2]\n[0, 1]",
      java: "[0, 1]\n[1, 2]\n[0, 1]",
      c: "[0, 1]\n[1, 2]\n[0, 1]",
    },
  },
  "reverse-string": {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    expectedOutput: {
      javascript: '["o","l","l","e","h"]\n["h","a","n","n","a","H"]',
      python: "['o', 'l', 'l', 'e', 'h']\n['h', 'a', 'n', 'n', 'a', 'H']",
      java: "[o, l, l, e, h]\n[h, a, n, n, a, H]",
      c: "[o, l, l, e, h]\n[h, a, n, n, a, H]",
    },
  },
  "valid-palindrome": {
    id: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    expectedOutput: {
      javascript: "true\nfalse\ntrue",
      python: "True\nFalse\nTrue",
      java: "true\nfalse\ntrue",
      c: "1\n0\n1",
    },
  },
  "maximum-subarray": {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    expectedOutput: {
      javascript: "6\n1\n23",
      python: "6\n1\n23",
      java: "6\n1\n23",
      c: "6\n1\n23",
    },
  },
  "container-with-most-water": {
    id: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    expectedOutput: {
      javascript: "49\n1",
      python: "49\n1",
      java: "49\n1",
      c: "49\n1",
    },
  },
};

export const BATTLE_PROBLEM_IDS = new Set(Object.keys(BATTLE_PROBLEMS));

export const getBattleProblem = (problemId) =>
  BATTLE_PROBLEMS[problemId] || null;
