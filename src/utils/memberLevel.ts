/** Preserve the platform's existing 1,000-points-per-level progression. */
export function memberLevel(value: number) {
  const score = Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const level = Math.floor(score / 1000) + 1;
  const points = score % 1000;
  return { score, level, points, remaining: 1000 - points, progress: points / 1000, nextLevel: level + 1, nextTotal: level * 1000 };
}
