export function yearTicks(start, end) {
  const span = end - start;

  const step =
    span <= 20  ? 1  :
    span <= 50  ? 5  :
    span <= 100 ? 10 :
    span <= 250 ? 25 :
    span <= 500 ? 50 :
                  100;

  const first = Math.ceil(start / step) * step;

  const ticks = [];
  for (let year = first; year <= end; year += step) {
    ticks.push(year);
  }

  return ticks;
}