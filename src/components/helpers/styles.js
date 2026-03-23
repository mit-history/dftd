// Global page styles extracted from index.md
export function injectGlobalStyles(html) {
  return html`<style>
/* Remove Observable default centered column & padding */
body,
.observablehq {
  margin: 0 !important;
  padding: 0 !important;
  max-width: none !important;
  width: 100% !important;
}

/* Kill any extra top margin on the very first element */
.observablehq > *:first-child {
  margin-top: 0 !important;
}

/* Make sure the first card (Filters) starts flush at the top */
.observablehq .card:first-of-type {
  margin-top: 0 !important;
}

/* Override any default card margins globally */
.card {
  margin: 0 0 1rem 0 !important;   /* no top margin, small bottom gap */
  padding-top: 0.75rem !important;
}

/* Allow wide sections with side margins */
.full-bleed {
  width: 92vw !important;
  margin-left: calc(50% - 46vw) !important;
}

/* Make Plot charts stretch to their container */
svg.plot {
  width: 100% !important;
  max-width: 100% !important;
}

/* Optional: soften background inside iframe */
body {
  background: #f5f5f4;
}

.days-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 2rem;
}

.days-grid > div {
  flex: 1 1 500px;
  min-width: 450px;
}

/* Calendar legend (used by components/calendar.js + calendar-app.js) */
.cal-legend {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  align-items: center;
  font: 12px system-ui;
  margin-top: .25rem;
}
.cal-key {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .15rem .35rem;
  border-radius: 999px;
  background: rgba(0,0,0,.04);
}
.cal-dot {
  width: .7rem;
  height: .7rem;
  border-radius: 999px;
  display: inline-block;
}
</style>`;
}
