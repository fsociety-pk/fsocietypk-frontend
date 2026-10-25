/** Scroll keyframes supplied in the Ascend design reference. */
type Stop = { p: number; v: number };
const X = [{p:0,v:0},{p:.32,v:-3.1},{p:.64,v:3.2},{p:1,v:0}];
const Y = [{p:0,v:-4.5},{p:.32,v:.55},{p:.64,v:.45},{p:1,v:.15}];
const S = [{p:0,v:2.15},{p:.32,v:1},{p:.64,v:.92},{p:1,v:1.12}];
export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
function sample(stops: Stop[], progress: number) {
  const p = clamp(progress);
  const i = stops.findIndex(stop => stop.p >= p);
  if (i <= 0) return stops[0].v;
  const a = stops[i - 1], b = stops[i];
  const t = (p - a.p) / (b.p - a.p);
  return a.v + (b.v - a.v) * t * t * (3 - 2 * t);
}
export function earthPose(progress: number, width: number) {
  const p = clamp(progress);
  return { x: sample(X, p) * clamp(width / 1200, .5, 1), y: sample(Y, p), scale: sample(S, p), rotation: 2.07 + p * Math.PI * 1.6 };
}
