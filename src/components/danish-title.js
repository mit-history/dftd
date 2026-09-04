// =============================================
//  danish-title.js — work titles for Danish performances
//  The Strapi export gives every Danish performance a formatted_title
//  shaped "<work> by <company> at <place> (<date>)", e.g.
//  "Amphitryon by The Royal Danish Theatre at Royal Danish Theatre, Kongens Nytorv (1748-12-16 AD)".
//  The calendar only wants the "<work>" part.
// =============================================

// -----------------------------------------------------
// clipFormattedTitle(formatted, {place, date}) — drop the
// " at <place> (<date>)" suffix and the trailing " by <company>"
// clause. Anything that doesn't match the shape is left alone.
// -----------------------------------------------------
export function clipFormattedTitle(formatted, {place, date} = {}) {
  if (typeof formatted !== "string") return "";

  let title = formatted;

  const suffix = place && date ? ` at ${place} (${date})` : null;
  if (suffix && title.endsWith(suffix)) {
    title = title.slice(0, title.length - suffix.length);
  }

  // The company clause is always last, so search from the right: a work
  // title may itself contain " by " ("Zaïre by candlelight").
  const by = title.lastIndexOf(" by ");
  if (by > 0) title = title.slice(0, by);

  return title.trim();
}

// -----------------------------------------------------
// danishPerformanceTitle(perf) — title for one performance,
// preferring the linked work titles when the export has them.
// -----------------------------------------------------
export function danishPerformanceTitle(perf) {
  const works = perf?.production?.works ?? [];
  const titleFromWorks = works.map(w => w.title).filter(Boolean).join("; ");
  if (titleFromWorks) return titleFromWorks;

  const place = perf?.place?.name;
  const date = perf?.date;

  return (
    clipFormattedTitle(perf?.formatted_title, {place, date}) ||
    clipFormattedTitle(perf?.production?.formatted_title, {place, date}) ||
    "Untitled"
  );
}
