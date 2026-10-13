export interface DiffLine {
  type: "added" | "removed" | "equal";
  text: string;
  lineA?: number;
  lineB?: number;
}

/**
 * Computes line-by-line differences between two text strings using Longest Common Subsequence (LCS).
 */
export function computeLineDiff(textA: string, textB: string): DiffLine[] {
  const linesA = textA.split("\n");
  const linesB = textB.split("\n");

  const m = linesA.length;
  const n = linesB.length;

  // For very long texts, limit matrix size to prevent high memory usage
  if (m * n > 4000000) {
    // Fallback to fast naive comparison for massive multi-megabyte texts
    return computeFastDiff(linesA, linesB);
  }

  // Dynamic Programming table for LCS
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (linesA[i] === linesB[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to construct diff
  const result: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      result.unshift({
        type: "equal",
        text: linesA[i - 1],
        lineA: i,
        lineB: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        type: "added",
        text: linesB[j - 1],
        lineB: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({
        type: "removed",
        text: linesA[i - 1],
        lineA: i,
      });
      i--;
    }
  }

  return result;
}

function computeFastDiff(linesA: string[], linesB: string[]): DiffLine[] {
  const result: DiffLine[] = [];
  const max = Math.max(linesA.length, linesB.length);

  for (let k = 0; k < max; k++) {
    const a = linesA[k];
    const b = linesB[k];

    if (a !== undefined && b !== undefined) {
      if (a === b) {
        result.push({ type: "equal", text: a, lineA: k + 1, lineB: k + 1 });
      } else {
        result.push({ type: "removed", text: a, lineA: k + 1 });
        result.push({ type: "added", text: b, lineB: k + 1 });
      }
    } else if (a !== undefined) {
      result.push({ type: "removed", text: a, lineA: k + 1 });
    } else if (b !== undefined) {
      result.push({ type: "added", text: b, lineB: k + 1 });
    }
  }
  return result;
}
