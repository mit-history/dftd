// Small shared helpers for index.md and other pages.

export function asDate(x) {
  if (x instanceof Date) return x;
  if (typeof x === "number") return new Date(x);
  if (typeof x === "string") return new Date(x.replace(" AD", ""));
  return null;
}

export function normKey(k) {
  return String(k ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function capDate(d, capUtcMillis) {
  const dt = asDate(d);
  if (!dt) return null;
  return new Date(Math.min(+dt, capUtcMillis));
}
