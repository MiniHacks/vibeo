export function toInt(x?: unknown | string | number | null): number {
  return x ? +x : 0;
}
