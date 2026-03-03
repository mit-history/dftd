---
toc: false
---

```js
import { injectGlobalStyles } from "./components/styles.js";
import { asDate } from "./components/utils.js";
import { tryJson, tryCsv } from "./components/data-loaders.js";
import { normalizeFrench, normalizeDutch, normalizeDanishJoinedLight, splitAuthorString } from "./components/data-normalizers.js";
import {
  percentageYearsChart,
  compareYearsChart,
  processPerformanceGenres,
  genreLegend,
  divergentPlot
} from "./components/viz-charts.js";
import { landFromWorld, defaultCircle, mapPlot } from "./components/viz-map.js";
import { createVizToggle, vizFlags } from "./components/viz-router.js";
import {
  createDateFilters,
  createOriginFilters,
  createGenreFilters,
  createAuthorFilters,
  createRandomizeButton
} from "./components/filters.js";
import { renderPerformanceDays } from "./components/performance-days.js";
import { renderCalendarApp } from "./components/calendar-app.js";
```

```js
// Global styles
display(injectGlobalStyles(html));
```

```js
// -----------------------------
// 1) Load datasets
// -----------------------------

// French: prefer generated/normalized performances file if present; fallback to french-plays.json.
const frenchRaw = await tryJson(FileAttachment,
  "data/french/french-performances.json",
  "data/french/french-plays.json"
);

const french = normalizeFrench(frenchRaw, asDate);

// Dutch: prefer transformed dutch-performances.csv if present; fallback to raw CREATE export CSV(s) and transform in-page.
const dutchRaw = await tryCsv(FileAttachment, true,
  "data/dutch/dutch-performances.csv",
  "data/dutch/dutch_data_1748_1798.csv",
  "data/dutch/dutch_data_1748-1798.csv",
  "data/dutch/dutch_data.csv"
);

// Normalize Dutch rows (handles different column names)
const dutch = normalizeDutch(dutchRaw, asDate);

// Danish (joined-light pipeline)
const danish_raw = await FileAttachment("data/danish/danish-performances.json").json();
const danish_works = await FileAttachment("data/danish/danish-works.json").json();
const danish_joined = await FileAttachment("data/danish/danish-performances-joined-light.json").json();

// DEBUGGING
display({
  danish_raw_len: danish_raw.length,
  danish_joined_len: danish_joined.length,

  // do joined rows even have contributors?
  joined_with_contributors: danish_joined.filter(r => (r.contributors ?? []).length > 0).length,

  // is the perfId lookup working?
  joined_hit_rate: danish_raw.filter(p => perfIdToJoined.has(String(p.id))).length,

  // show a real joined row with contributors (if any exist)
  sample_joined_with_contributors: danish_joined.find(r => (r.contributors ?? []).length > 0)?.contributors?.slice(0, 5),

  // show what role_names look like
  sample_role_names: danish_joined.find(r => (r.contributors ?? []).length > 0)?.contributors?.map(c => c.role_names).slice(0, 5)
});

// performance_id -> joined row
const perfIdToJoined = new Map(danish_joined.map(r => [String(r.performance_id), r]));

// workId -> { title, genres }
const workMeta = new Map(
  danish_works.map(w => [
    String(w.id),
    {
      title: w.title ?? w.formatted_title ?? null,
      genres: (w.genres ?? []).map(g => g?.name ?? g?.title).filter(Boolean)
    }
  ])
);

function joinedAuthors(joinedRow) {
  const AUTHOR_ROLE_WORDS = ["composer", "playwright", "librettist", "forfatter"];
  const names = (joinedRow?.contributors ?? [])
    .filter(c => (c.role_names ?? []).some(r =>
      AUTHOR_ROLE_WORDS.some(w => String(r).toLowerCase().includes(w))
    ))
    .map(c => c.person_name)
    .filter(Boolean);
  return Array.from(new Set(names));
}

const danish = danish_raw.map(perf => {
  const d = asDate(perf.date);
  if (!d) return null;

  const joined = perfIdToJoined.get(String(perf.id));
  const workIds = (joined?.work_ids ?? []).map(String);

  const metas = workIds.map(id => workMeta.get(id)).filter(Boolean);
  const allGenres = metas.flatMap(m => m.genres ?? []);
  const titleFromWorks = metas.map(m => m.title).filter(Boolean).join("; ");

  const authors = joinedAuthors(joined);

  return {
    id: String(perf.id),
    date: d,
    year: d.getUTCFullYear(),
    title: titleFromWorks || perf.formatted_title || perf.production?.formatted_title || null,
    genre: allGenres.length ? allGenres[0] : null,              // or allGenres.join("; ")
    author: authors.length ? authors.join(" ; ") : null,
    place: perf.place?.name ?? null,
    origin: "danish"
  };
}).filter(Boolean);

// Combined
const combined_data = [
  ...danish,
  ...french.map(d => ({ ...d, origin: "french" })),
  ...dutch.map(d => ({ ...d, origin: "dutch" }))
];
```

```js
// -----------------------------
// 2) Viz routing (checkbox + ?viz=... override)
// -----------------------------
const viz = createVizToggle({ Inputs, view });
const {
  overTime,
  divergingGenres,
  byAuthor,
  performanceDays,
  authorShare,
  bubble,
  calendar
} = vizFlags(viz);
```

<div class="card" style="margin-bottom: 1rem;">
<details open>
<summary>Filters</summary>

```js
// Date filters
const {
  start_date_input,
  end_date_input,
  start_date,
  end_date,
  randomizeDates
} = createDateFilters({ Inputs, view }, { start: "1748-01-01", end: "1798-12-31" });

// Origin filters
const {
  originOptions,
  originsInput,
  originsSelect,
  origins,
  randomizeOrigins
} = createOriginFilters({ Inputs, view }, ["danish", "dutch", "french"]);

// Formatted_data depends on date + origins (and is used by genre + author filters)
const formatted_data = combined_data.filter(d => {
  const dt = asDate(d.date);
  return dt && dt > start_date && dt <= end_date && origins.includes(d.origin);
});

// Genre filters
const { genreOptions, genreInput, genreSelect, genres } = createGenreFilters(
  { Inputs, view },
  { formatted_data, origins }
);

// Author filters
const { authorOptions, authorInput, author, randomizeAuthor } = createAuthorFilters(
  { Inputs, view },
  { french, danish, dutch }
);

// Randomize button
view(createRandomizeButton({ Inputs }, { randomizeDates, randomizeOrigins, randomizeAuthor }));
```

</details>
</div>

```js
// Helpful sanity view (safe to delete)
const yearsInView = Array.from(new Set(formatted_data.map(d => +d.year).filter(Boolean))).sort((a, b) => a - b);
yearsInView.slice(0,10).concat("...").concat(yearsInView.slice(-10))
```

```js
// -----------------------------
// 3) Over Time
// -----------------------------
if (overTime) {
  display(html`<h2>Comparative Performances Over Time</h2>`);
  display(
    formatted_data.length > 0
      ? html`<div class="full-bleed">
          ${compareYearsChart(formatted_data, { startYear: start_date.getUTCFullYear(), endYear: end_date.getUTCFullYear(), width: window.innerWidth, height: 500 })}
        </div>`
      : html`<i>No data.</i>`
  );
}

if (divergingGenres) {
  display(html`<h2>Comparative Performance Genres Over Time</h2>`);
}
```

```js
// -----------------------------
// 4) Author Share
// -----------------------------
import {
  authorShareChart,
  addAuthorToCompare,
  clearAuthorsToCompare
} from "./components/author-share.js";

if (authorShare) {
  display(html`<h2>Author Performance Contribution Percentage</h2>`);
  display(authorShareChart(author, formatted_data));

  view(Inputs.button("Add author", {
    value: null,
    reduce: () => { addAuthorToCompare(author); return null; }
  }));

  view(Inputs.button("Clear authors", {
    value: null,
    reduce: () => { clearAuthorsToCompare(); return null; }
  }));
} else {
  display(html`<div></div>`);
}
```

```js
// -----------------------------
// 5) Author Bubble
// -----------------------------
import { authorBubble } from "./components/bubble_chart.js";
import { rangeInput } from "./components/range_input.js";

display(bubble ? html`<h2>Authors Performed By Location</h2>` : html`<div></div>`);

const percent_absolute = Inputs.radio(["percentage", "absolute"], { label: "Mode", value: "percentage" });
const percent_absolute_val = bubble ? view(percent_absolute) : "percentage";

const do_overall_threshold = Inputs.toggle({ label: "Overall Threshold", value: true });
const do_overall_threshold_val = bubble ? view(do_overall_threshold) : false;

const overall_threshold = Inputs.number({ value: 1, label: "Enter Threshold" });
const overall_threshold_val = do_overall_threshold_val ? view(overall_threshold) : 0;

// French
display(bubble ? html`<h2>French</h2>` : html`<div></div>`);
const french_threshold = Inputs.number({ value: 1, label: "Enter Threshold" });
const french_threshold_val = bubble ? (do_overall_threshold_val ? overall_threshold_val : view(french_threshold)) : 0;
const f = rangeInput({ min: 1748, max: 1798, step: 1, value: [1748, 1778], enableTextInput: true });
const f_val = bubble ? view(f) : [0, 0];

display(
  bubble
    ? authorBubble(combined_data, "french", 0, french_threshold_val, f_val[0], f_val[1], percent_absolute_val)
    : html`<div></div>`
);

// Dutch
display(bubble ? html`<h2>Dutch Change</h2>` : html`<div></div>`);
const dutch_threshold = Inputs.number({ value: 1, label: "Enter Threshold" });
const dutch_threshold_val = bubble ? (do_overall_threshold_val ? overall_threshold_val : view(dutch_threshold)) : 0;
const du = rangeInput({ min: 1748, max: 1798, step: 1, value: [1748, 1778], enableTextInput: true });
const du_val = bubble ? view(du) : [0, 0];

display(
  bubble
    ? authorBubble(combined_data, "dutch", 0, dutch_threshold_val, du_val[0], du_val[1], percent_absolute_val)
    : html`<div></div>`
);

//  DEBUGGING
// display({
//   danish_raw_len: danish_raw.length,
//   danish_joined_len: danish_joined.length,

//   // do joined rows even have contributors?
//   joined_with_contributors: danish_joined.filter(r => (r.contributors ?? []).length > 0).length,

//   // is the perfId lookup working?
//   joined_hit_rate: danish_raw.filter(p => perfIdToJoined.has(String(p.id))).length,

//   // show a real joined row with contributors (if any exist)
//   sample_joined_with_contributors: danish_joined.find(r => (r.contributors ?? []).length > 0)?.contributors?.slice(0, 5),

//   // show what role_names look like
//   sample_role_names: danish_joined.find(r => (r.contributors ?? []).length > 0)?.contributors?.map(c => c.role_names).slice(0, 5)
// });

// Danish

display(bubble ? html`<h2>Danish</h2>` : html`<div></div>`);
const danish_threshold = Inputs.number({ value: 1, label: "Enter Threshold" });
const danish_threshold_val = bubble ? (do_overall_threshold_val ? overall_threshold_val : view(danish_threshold)) : 0;
const da = rangeInput({ min: 1748, max: 1798, step: 1, value: [1748, 1778], enableTextInput: true });
const da_val = bubble ? view(da) : [0, 0];

display(
  bubble
    ? authorBubble(combined_data, "danish", 0, danish_threshold_val, da_val[0], da_val[1], percent_absolute_val)
    : html`<div></div>`
);
```

```js
// -----------------------------
// 6) Diverging Genres
// -----------------------------

const danish_filtered_data = danish.filter(d => {
  const dt = asDate(d.date);
  return dt && dt > start_date && dt <= end_date;
});

const french_filtered_data = french.filter(d => {
  const dt = asDate(d.date);
  return dt && dt > start_date && dt <= end_date;
});

// Danish genre buckets (kept identical)
const danish_comedy = danish.filter(d =>
  d.genre && (d.genre.toLowerCase().includes("comed") || d.genre.toLowerCase().includes("coméd"))
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const danish_tragedy = danish.filter(d =>
  d.genre && (d.genre.toLowerCase().includes("tragedia per musica") || d.genre.toLowerCase().includes("tragedy"))
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const danish_ballet = danish.filter(d =>
  d.genre && (d.genre.toLowerCase().includes("ballet") ||
    d.genre.toLowerCase().includes("ballet,ballet") ||
    d.genre.toLowerCase().includes("ballet,ballet,ballet"))
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const danish_drama = danish.filter(d =>
  d.genre && (d.genre.toLowerCase().includes("drama") ||
    d.genre.toLowerCase().includes("dramma giocoso per musica") ||
    d.genre.toLowerCase().includes("dramma pastorale") ||
    d.genre.toLowerCase().includes("dramma per musica"))
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

// French genre buckets (kept identical)
const french_comedy = french.filter(d => d.genre === "comédie").filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const french_tragedy = french.filter(d =>
  d.genre && d.genre.toLowerCase().includes("tragédie")
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const french_ballet = french.filter(d =>
  d.genre && d.genre.toLowerCase().includes("ballet")
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const french_drama = french.filter(d =>
  d.genre && d.genre.toLowerCase().includes("drame")
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const danish_summary = processPerformanceGenres(danish_filtered_data, danish_comedy, danish_drama, danish_tragedy, danish_ballet, "danish");
const french_summary = processPerformanceGenres(french_filtered_data, french_comedy, french_drama, french_tragedy, french_ballet, "french");

display(divergingGenres ? genreLegend() : html`<div></div>`);

display(divergingGenres
  ? ((danish_filtered_data.length > 0 && french_filtered_data.length > 0)
      ? html`<div class="full-bleed">${divergentPlot(danish_summary, french_summary, { startYear: start_date.getUTCFullYear(), endYear: end_date.getUTCFullYear(), width: window.innerWidth, height: 700 })}</div>`
      : html`<i>No data.</i>`)
  : html`<div></div>`
);
```

```js
// -----------------------------
// 7) By Author charts (percentage by year + map)
// -----------------------------
const author_filtered_data =
  author === "No author" ? undefined : formatted_data.filter((d) => d.author === author || d.author?.includes(author));

const author_data_combined = author_filtered_data ? author_filtered_data.map((d, i, arr) => {
  const total = combined_data
    .filter(f => f.year === d.year && f.origin === d.origin)
    .reduce((a) => a + 1, 0);
  const authorCount = arr
    .filter(f => f.year === d.year && f.origin === d.origin)
    .reduce((a) => a + 1, 0);
  return { year: d.year, origin: d.origin, percentage: (authorCount / total) };
}) : undefined;

const author_data = Array.from(new Set(author_data_combined?.map(JSON.stringify))).map(JSON.parse);

// Map setup
const paris = { latitude: 48.856667, longitude: 2.352222 };
const copenhagen = { latitude: 55.676111, longitude: 12.568333 };
const amsterdam = { latitude: 52.372778, longitude: 4.893611 };

const author_counts = author_filtered_data ? Object.entries(author_filtered_data.reduce((acc, d) => {
  acc[d.origin] = (acc[d.origin] || 0) + 1;
  return acc;
}, {})).map(([origin, count]) => {
  const coordinates = { danish: copenhagen, dutch: amsterdam, french: paris }[origin];
  return { origin, count, ...coordinates };
}) : undefined;

// World geometry for map
const world = await FileAttachment("data/countries-110m.json").json();
const circle = defaultCircle();
const land = landFromWorld(world);

display(byAuthor ? html`<h2>Performances by Author</h2>` : html`<div></div>`);
display(byAuthor ? html`<h3>Percentage by Author</h3>` : html`<div></div>`);

display(byAuthor
  ? (author_data?.length > 0
      ? html`<div class="full-bleed">
          ${percentageYearsChart(author_data, { author, startYear: start_date.getUTCFullYear(), endYear: end_date.getUTCFullYear(), width: window.innerWidth, height: 500 })}
        </div>`
      : html`<i>No data.</i>`)
  : html`<div></div>`
);

display(byAuthor ? html`<h3>Percentage by Location</h3>` : html`<div></div>`);

display(byAuthor
  ? (author_counts
      ? html`<div class="full-bleed">
          ${mapPlot(author_counts, { author, startYear: start_date.getUTCFullYear(), endYear: end_date.getUTCFullYear(), width: window.innerWidth, height: 450, circle, land })}
        </div>`
      : html`<i>No data.</i>`)
  : html`<div></div>`
);
```

```js
// -----------------------------
// 8) Days with performances (imperative mounts)
// -----------------------------
display(performanceDays ? html`<h2>Animated Line Chart and Heatmap of Days with Performances</h2>` : html`<div></div>`);
display(performanceDays ? html`<p> Selected genres: ${genres.length === 0 ? "None" : genres.length === genreOptions.length ? "All" : genres.join(", ")} </p>` : html`<div></div>`);

const genre_data =
  genres.length === 0
    ? formatted_data
    : formatted_data.filter((d) => genres.includes(d.genre));
```

<div class="full-bleed days-grid">
  <div id="line-chart-container"></div>
  <div id="heatmap-container"></div>
</div>

```js
import { createMultipleAnimatedLines, createHeatmap } from "./components/barchart.js";

// sort by year first for ltr visualization
genre_data.sort((a, b) => a.year - b.year);

renderPerformanceDays({
  performanceDays,
  origins,
  genre_data,
  danish_filtered_data,
  french_filtered_data,
  combined_data,
  asDate,
  start_date,
  end_date,
  window,
  document,
  createMultipleAnimatedLines,
  createHeatmap
});
```

```js
// -----------------------------
// 9) Calendar (moved to calendar-app.js)
// -----------------------------
import { injectCalendarStyles, buildEvents, renderCalendar, ORIGIN_COLOR } from "./components/calendar.js";

await renderCalendarApp({
  calendar,
  display,
  html,
  Inputs,
  asDate,
  start_date,
  end_date,
  origins,
  danishPerf: danish,
  frenchPerf: french,
  dutchPerf: dutch,
  nolaCsv,
  ORIGIN_COLOR,
  injectCalendarStyles,
  buildEvents,
  renderCalendar
});
```
