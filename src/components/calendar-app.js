// src/components/calendar-app.js
// Calendar mini-app. This version does NOT reload French/Dutch/Danish data.
// Instead, pass already-normalized arrays from index.md so every visualization
// uses the exact same canonical pipeline.

export async function renderCalendarApp({
  calendar,
  display,
  html,
  Inputs,
  asDate,
  start_date,
  end_date,
  origins,

  // canonical performances from index (shape from data-normalizers.js)
  danishPerf,   // [{id,date,year,title,genre,author,place}, ...]
  frenchPerf,
  dutchPerf,

  // raw NOLA CSV rows (typed:false) loaded in index
  nolaCsv,

  ORIGIN_COLOR,
  injectCalendarStyles,
  buildEvents,
  renderCalendar
}) {
  // Only render the calendar UI if the viz is active
  display(
    calendar
      ? html`<h2>Global Theatre Calendar (1748 – 1798)</h2>`
      : html`<div></div>`
  );

  // ==============================
  // 1) Helpers
  // ==============================
  function normKey(k) {
    return String(k || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  // ==============================
  // 2) Map canonical performances to calendar rows
  // ==============================
  const Danish = (danishPerf ?? []).map((p, i) => ({
    id: p.id ?? `Danish-${i}`,
    date: p.date,
    year: p.year ?? (p.date ? p.date.getUTCFullYear() : null),
    title: p.title || "Untitled",
    origin: "Danish",
    theater: p.place ?? "Unknown venue",
    city: p.place ?? null
  })).filter(d => d.date);

  const French = (frenchPerf ?? []).map((p, i) => ({
    id: p.id ?? `French-${i}`,
    date: p.date,
    year: p.year ?? (p.date ? p.date.getUTCFullYear() : null),
    title: p.title || "Untitled",
    origin: "French",
    theater: p.place ?? "Unknown venue",
    city: p.place ?? null
  })).filter(d => d.date);

  const Dutch = (dutchPerf ?? []).map((p, i) => ({
    id: p.id ?? `Dutch-${i}`,
    date: p.date,
    year: p.year ?? (p.date ? p.date.getUTCFullYear() : null),
    title: p.title || "Untitled",
    origin: "Dutch",
    theater: p.place ?? "Unknown venue",
    city: p.place ?? null
  })).filter(d => d.date);

  // NOLA normalization (still unique schema; we keep it local to the calendar)
  const nolaRows = (nolaCsv ?? []).map(obj => {
    const out = {};
    for (const k of Object.keys(obj)) out[normKey(k)] = obj[k];
    return out;
  });

  const nola = nolaRows.map((r, i) => {
    const d = asDate(r["date of performance"] ?? r["date"]);
    if (!d || isNaN(+d)) return null;
    return {
      id: r["issue #"] ?? `nola-${i}`,
      date: d,
      year: d.getUTCFullYear(),
      title: (r["works mentioned"] ?? "Untitled").trim(),
      origin: "New Orleans",
      theater: (r["performance location"] ?? r["loc of ad"] ?? "Unknown venue").trim(),
      city: "New Orleans"
    };
  }).filter(Boolean);

  // ==============================
  // 3) Combine and cap
  // ==============================
  const CAP_NON_NOLA = Date.UTC(1799, 11, 31);
  const CAP = Date.UTC(1812, 11, 31);

  const allRows = [
    ...Danish.filter(d => d.date <= CAP_NON_NOLA),
    ...French.filter(d => d.date <= CAP_NON_NOLA),
    ...Dutch.filter(d => d.date <= CAP_NON_NOLA),
    ...nola.filter(d => d.date <= CAP)
  ];

  const COLOR = new Map([
    ["Danish", "#ef4444"],
    ["French", "#3b82f6"],
    ["Dutch", "#16a34a"],
    ["New Orleans", "#a855f7"]
  ]);
  try { for (const [k, c] of COLOR) ORIGIN_COLOR.set(k, c); } catch {}

  if (calendar) {
    display(html`<div style="font:12px system-ui; margin:.25rem 0;">
      Number of Performances displayed per dataset (≤1799 Europe, ≤1812 New Orleans) —
      Danish: <b>${Danish.filter(d => d.date <= CAP_NON_NOLA).length}</b> ·
      French: <b>${French.filter(d => d.date <= CAP_NON_NOLA).length}</b> ·
      Dutch: <b>${Dutch.filter(d => d.date <= CAP_NON_NOLA).length}</b> ·
      New Orleans: <b>${nola.filter(d => d.date <= CAP).length}</b> ·
      total after cap: <b>${allRows.length}</b>
    </div>`);
  }

  // ==============================
  // 4) Controls and mount points
  // ==============================
  const modeIn = Inputs.radio(["Month", "Week", "Day"], { label: "Calendar view", value: "Month" });
  const overlayIn = Inputs.toggle({ label: "Overlay major events", value: true });
  const anchorIn = Inputs.date({ label: "Date displayed", value: start_date });
  const includeNola = Inputs.toggle({ label: "Include New Orleans (NOLA)", value: true });

  const nav = html`<div style="display:flex; gap:.5rem; align-items:center; margin:.25rem 0;">
    <button id="prev">◀ Prev</button><button id="next">Next ▶</button>
  </div>`;

  const venuesMount = html`<div id="venues-mount"></div>`;
  const legendMount = html`<div id="legend-mount"></div>`;

  if (calendar) {
    display(html`<div class="card" style="padding:.6rem; margin:.6rem 0;">
      <div style="display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.6rem;">
        <div>${anchorIn}</div><div>${nav}</div>
        <div>${modeIn}</div><div>${overlayIn}</div>
        <div style="grid-column:1/-1">${includeNola}</div>
        <div style="grid-column:1/-1">${venuesMount}</div>
        <div style="grid-column:1/-1">${legendMount}</div>
      </div>
    </div>`);
  }

  // ==============================
  // 5) Imperative render with global filters
  // ==============================
  injectCalendarStyles();

  const CAL_ID = "calendar-colored";
  if (calendar) display(html`<div id="${CAL_ID}"></div>`);

  function capDate(d) { return new Date(Math.min(+asDate(d), CAP)); }

  function buildVenuesInput(startDate, endDate, originsList) {
    const opts = Array.from(new Set(
      allRows
        .filter(d => d.date >= startDate && d.date <= endDate && originsList.includes(d.origin))
        .map(d => d.theater)
        .filter(Boolean)
    )).sort();

    return Inputs.checkbox(opts, { label: "Venues", value: opts });
  }

  const initialOriginsBase = origins.map(o =>
    o === "danish" ? "Danish" :
    o === "french" ? "French" :
    o === "dutch" ? "Dutch" : o
  );

  const initialOriginsList = includeNola.value
    ? [...initialOriginsBase, "New Orleans"]
    : initialOriginsBase;

  let venuesIn = buildVenuesInput(capDate(start_date), capDate(end_date), initialOriginsList);
  venuesMount.replaceChildren(venuesIn);

  function venuesValue() {
    const v = venuesIn.value;
    return Array.isArray(v) ? v : [];
  }

  function renderLegend(originsList) {
    const el = html`<div class="cal-legend">
      ${originsList.map(o => html`<span class="cal-key"><span class="cal-dot" style="background:${COLOR.get(o) || '#999'}"></span>${o}</span>`)}
      <span class="cal-key"><span class="cal-dot" style="background:#dbeafe"></span>major event</span>
    </div>`;
    legendMount.replaceChildren(el);
  }

  function rerender() {
    if (!calendar) return;

    const start = capDate(start_date);
    const end = capDate(end_date);

    const baseOrigins = origins.map(o =>
      o === "danish" ? "Danish" :
      o === "french" ? "French" :
      o === "dutch" ? "Dutch" : o
    );

    const originsList = includeNola.value
      ? [...baseOrigins, "New Orleans"]
      : baseOrigins;

    const anchor = capDate(anchorIn.value || start);
    const mode = modeIn.value;

    // rebuild venues when the available list changes
    const fresh = buildVenuesInput(start, end, originsList);
    const oldOpts = Array.from(venuesIn.options || []).map(x => x.textContent);
    const newOpts = Array.from(fresh.options || []).map(x => x.textContent);
    const changed = oldOpts.length !== newOpts.length || oldOpts.some((o, i) => o !== newOpts[i]);

    if (changed) {
      const prevSelection = venuesValue();
      venuesIn = fresh;

      // preserve selection where possible
      const newLabels = Array.from(venuesIn.options || []).map(x => x.textContent);
      const keep = newLabels.filter(v => prevSelection.includes(v));
      venuesIn.value = keep.length ? keep : newLabels;

      venuesIn.addEventListener("input", rerender);
      venuesMount.replaceChildren(venuesIn);
    }

    const selectedVenues = venuesValue();

    // filter rows
    const filtered = allRows.filter(d =>
      d.date >= start && d.date <= end &&
      originsList.includes(d.origin) &&
      (!selectedVenues.length || selectedVenues.includes(d.theater))
    );

    // build events and attach per-origin color
    const events = buildEvents(filtered, asDate, { places: selectedVenues }).map(e => ({
      ...e,
      color: COLOR.get(e.origin) || e.color
    }));

    const overlays = overlayIn.value ? [
      { date: "1755-11-01", name: "Lisbon earthquake" },
      { date: "1763-02-10", name: "Treaty of Paris" },
      { date: "1776-07-04", name: "U.S. Independence" },
      { date: "1803-12-20", name: "Louisiana Purchase (NOLA)" },
      { date: "1815-01-08", name: "Battle of New Orleans" }
    ] : [];

    renderLegend(originsList);

    renderCalendar({ container: CAL_ID, mode, anchor, events, overlays });
  }

  if (calendar) {
    [modeIn, overlayIn, anchorIn, includeNola].forEach(inp => {
      inp.addEventListener("input", rerender);
    });
    venuesIn.addEventListener("input", rerender);

    nav.querySelector("#prev").onclick = () => {
      const a = capDate(anchorIn.value || start_date);
      const mode = modeIn.value;
      if (mode === "Month") a.setUTCMonth(a.getUTCMonth() - 1);
      else if (mode === "Week") a.setUTCDate(a.getUTCDate() - 7);
      else a.setUTCDate(a.getUTCDate() - 1);
      anchorIn.value = a; anchorIn.dispatchEvent(new Event("input"));
    };

    nav.querySelector("#next").onclick = () => {
      const a = capDate(anchorIn.value || start_date);
      const mode = modeIn.value;
      if (mode === "Month") a.setUTCMonth(a.getUTCMonth() + 1);
      else if (mode === "Week") a.setUTCDate(a.getUTCDate() + 7);
      else a.setUTCDate(a.getUTCDate() + 1);
      anchorIn.value = a; anchorIn.dispatchEvent(new Event("input"));
    };

    rerender();
  }
}
