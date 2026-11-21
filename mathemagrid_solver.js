
"use strict";

// Each row/column specifies two operations and a target.
// Digits are stored in row-major order:
//   0 1 2
//   3 4 5
//   6 7 8

const puzzleA = {
  horizontal: [
    ["/", "*", 4],
    ["*", "-", 20],
    ["*", "+", 39]
  ],
  vertical: [
    ["+", "-", 5],
    ["*", "+", 33],
    ["+", "+", 12]
  ]
};

// Return null if an operation produces a negative
// or fractional result, or attempts division by zero.
function applyOp(a, op, b) {
  switch (op) {
    case "+": return a + b;
    case "-": return a >= b ? a - b : null;
    case "*": return a * b;
    case "/":
      return b !== 0 && a % b === 0 ? a / b : null;
    default:
      throw new Error(`Unknown operation: ${op}`);
  }
}

// Evaluate strictly left to right.
function checkEquation(a, b, c, equation) {
  const [op1, op2, target] = equation;
  const intermediate = applyOp(a, op1, b);
  if (intermediate === null) return false;

  const result = applyOp(intermediate, op2, c);
  return result !== null && result === target;
}

// Return up to maxSolutions solutions.
// Each solution is an array of nine digits.
function solve(puzzle, maxSolutions = Infinity) {
  const solutions = [];
  const grid = new Array(9).fill(0);
  const used = new Array(10).fill(false);

  function backtrack(pos) {
    if (solutions.length >= maxSolutions) return;

    if (pos === 9) {
      solutions.push([...grid]);
      return;
    }

    for (let digit = 1; digit <= 9; digit++) {
      if (used[digit]) continue;

      grid[pos] = digit;
      used[digit] = true;

      let valid = true;
      const row = Math.floor(pos / 3);
      const col = pos % 3;

      // Check a row once all three digits are filled.
      if (col === 2) {
        const i = row * 3;
        valid = checkEquation(
          grid[i], grid[i + 1], grid[i + 2],
          puzzle.horizontal[row]
        );
      }

      // Check columns when the bottom row is filled.
      if (valid && row === 2) {
        valid = checkEquation(
          grid[col], grid[col + 3], grid[col + 6],
          puzzle.vertical[col]
        );
      }

      if (valid) backtrack(pos + 1);

      used[digit] = false;
      grid[pos] = 0;

      if (solutions.length >= maxSolutions) return;
    }
  }

  backtrack(0);
  return solutions;
}


const OPERATIONS = ["+", "-", "*", "/"];

// Fisher-Yates shuffle.
function randomPermutation() {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  return digits;
}

function randomOp() {
  return OPERATIONS[
    Math.floor(Math.random() * OPERATIONS.length)
  ];
}

// Evaluate an equation and return its result,
// or null if an intermediate value is invalid.
function equationResult(a, b, c, op1, op2) {
  const intermediate = applyOp(a, op1, b);
  if (intermediate === null) return null;

  return applyOp(intermediate, op2, c);
}

// Generate a candidate from a random digit arrangement
// and twelve independently selected operations.
function randomCandidate() {
  const grid = randomPermutation();
  const puzzle = {
    horizontal: [],
    vertical: []
  };

  for (let row = 0; row < 3; row++) {
    const i = row * 3;
    const op1 = randomOp();
    const op2 = randomOp();

    const target = equationResult(
      grid[i], grid[i + 1], grid[i + 2], op1, op2
    );

    if (target === null) return null;

    puzzle.horizontal.push([op1, op2, target]);
  }

  for (let col = 0; col < 3; col++) {
    const op1 = randomOp();
    const op2 = randomOp();

    const target = equationResult(
      grid[col], grid[col + 3], grid[col + 6],
      op1, op2
    );

    if (target === null) return null;

    puzzle.vertical.push([op1, op2, target]);
  }

  return puzzle;
}

// Generate a puzzle with exactly one solution.
function generate(maxAttempts = 1000000) {
  let valid = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const puzzle = randomCandidate();
    if (puzzle === null) continue;

    valid++;

    const solutions = solve(puzzle, 2);

    if (solutions.length === 1) {
      return {
        puzzle,
        solution: solutions[0],
        attempts: attempt,
        validCandidates: valid
      };
    }
  }

  throw new Error(
    `No unique puzzle found after ${maxAttempts} attempts`
  );
}

// Test the generator.
const generated = generate();

console.log("Attempts:", generated.attempts);
console.log("Valid candidates:", generated.validCandidates);
console.log("Puzzle:");
console.log(JSON.stringify(generated.puzzle, null, 2));
console.log("Solution:");

for (let row = 0; row < 3; row++) {
  console.log(
    generated.solution.slice(row * 3, row * 3 + 3).join(" ")
  );
}

