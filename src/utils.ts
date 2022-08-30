export { lockScroll, unlockScroll } from "./utils.scroll-lock";

export type Percent = `${number}%`;

const p2nMap: Record<Percent, number> = { "100%": 1 };
export function p2n(p: Percent): number {
  if (p2nMap[p] !== undefined) {
    return p2nMap[p];
  }

  return p2nMap[p] = Number(p.slice(0, p.length - 1)) / 100;
}
