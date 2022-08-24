export type Percent = `${number}%`;

const p2nMap = new Map<Percent, number>();
export function p2n(p: Percent): number {
  let n = p2nMap.get(p);
  if (!n) {
    n = Number(p.slice(0, p.length - 1)) / 100;
    p2nMap.set(p, n);
  }
  return n;
}
