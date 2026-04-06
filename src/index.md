---
toc: false
---

```js
import { injectGlobalStyles } from "./components/helpers/styles.js";
import { asDate } from "./components/helpers/utils.js";
import { tryJson, tryCsv } from "./components/helpers/data-loaders.js";
import { normalizeFrench, normalizeDutch, normalizeDanishJoinedLight, splitAuthorString } from "./components/helpers/data-normalizers.js";

import {
  percentageYearsChart,
  compareYearsChart,
  processPerformanceGenres,
  genreLegend,
  divergentPlot
} from "./components/visualizations/viz-charts.js";


import { landFromWorld, defaultCircle, mapPlot } from "./components/visualizations/viz-map.js";
import { createVizToggle, vizFlags } from "./components/helpers/viz-router.js";
import {
  createDateFilters,
  createOriginFilters,
  createGenreFilters,
  createAuthorFilters,
  createRandomizeButton
} from "./components/helpers/filters.js";
import { renderPerformanceDays } from "./components/visualizations/performance-days.js";
import { renderCalendarApp } from "./components/visualizations/calendar-app.js";
// debugging
display(html`<p>imports loaded</p>`);
```

```js
// Global styles
// display(injectGlobalStyles(html));
```

```js
// Load and normalize the data from each of our datasets

// New Orleans
const nola = await FileAttachment("data/new_orleans/genre_two_level_FIXED.csv").csv({ typed: true });
// might need to implement a normalizing filtr for the new orleans data

// French
const frenchRaw = await FileAttachment("data/french/french-performances.json").json();
const french = normalizeFrench(frenchRaw, asDate);

// Dutch
const dutchRaw = await FileAttachment("data/dutch/dutch_performances.csv").csv({ typed: true });
// might need to normalize Dutch rows to handle different column names
const dutch = normalizeDutch(dutchRaw, asDate);

// Danish
const danish_raw = await FileAttachment("data/danish/danish-performances.json").json();
const danish_works = await FileAttachment("data/danish/danish-works.json").json();
const danish_joined = await FileAttachment("data/danish/danish-performances-joined-light.json").json();

const danish = normalizeDanishJoinedLight(
  { performances: danish_raw, works: danish_works, joined: danish_joined },
  asDate
);


// Combined
const combined_data = [
  ...danish,
  ...french,
  ...dutch
];
// debugging
display(html`<p>data block loaded</p>`);
display({
  danish: danish?.length,
  french: french?.length,
  dutch: dutch?.length,
  nola: nola?.length
});

```

```js
// Section for handling the routing and navigation for the visualizations
const vizInput = Inputs.checkbox(
  [
    "Over Time",
    "Diverging Genres",
    "By Author",
    "Author Share",
    "Author Bubble",
    "Days with Performances",
    "Calendar"
  ],
  {
    label: "Visualization",
    value: ["Over Time"]
  }
);

display(vizInput);

const viz = vizInput.value ?? [];

// const {
//   overTime,
//   divergingGenres,
//   byAuthor,
//   performanceDays,
//   authorShare,
//   bubble,
//   calendar
// } = vizFlags(viz);

//this is just for testing/debugging purposes, since 
//it seems currently these values aren't being updated
//when the input value changes

const overTime = true;
const divergingGenres = true;
const byAuthor = true;
const performanceDays = true;
const authorShare = true;
const bubble = true;
const calendar = true;

```

## Filters

```js
//  Universal visualization filters

// Date filters
const {
  start_date_input,
  end_date_input,
  start_date,
  end_date,
  randomizeDates
} = createDateFilters(
  { Inputs, view },
  { start: "1748-01-01", end: "1798-12-31" }
);

const startDateObj = asDate(start_date_input.value);
const endDateObj = asDate(end_date_input.value);

display(start_date_input);
display(end_date_input);

// Dataset Origin filters
const {
  originOptions,
  originsInput,
  originsSelect,
  origins,
  randomizeOrigins
} = createOriginFilters({ Inputs, view }, ["danish", "dutch", "french"]);


const selectedOrigins = origins ?? ["danish","dutch","french"];

// Formatted_data depends on date + origins (and is used by genre + author filters)

const formatted_data = combined_data.filter(d => {
  const date = d.date instanceof Date ? d.date : asDate(d.date);
  const origin = (d.origin ?? "").toLowerCase();

  return (
    date instanceof Date &&
    !isNaN(+date) &&
    date >= startDateObj &&
    date <= endDateObj &&
    selectedOrigins.includes(origin)
  );
}).map(d => ({
  ...d,
  date: d.date instanceof Date ? d.date : asDate(d.date),
  origin: (d.origin ?? "").toLowerCase()
}));


// Genre filters
const { genreOptions, genreInput, genreSelect, genres } = createGenreFilters(
  { Inputs, view },
  { formatted_data, origins: selectedOrigins }
);

// Author filters
const { authorOptions, authorInput, author, randomizeAuthor } = createAuthorFilters(
  { Inputs, view },
  { french, danish, dutch }
);
display(start_date_input);
display(end_date_input);
```


```js
// Helpful sanity view (safe to delete)
const yearsInView = Array.from(new Set(formatted_data.map(d => +d.year).filter(Boolean))).sort((a, b) => a - b);
yearsInView.slice(0,10).concat("...").concat(yearsInView.slice(-10))
```
<!-- Comparative Performances Over Time Chart-->
```js
display(overTime ? html`<h2>Comparative Performances Over Time</h2>` : html`<div></div>`);
display(
  overTime
    ? (
        formatted_data.length > 0
          ? html`<div class="full-bleed">
              ${compareYearsChart(formatted_data, {
                startYear: startDateObj.getUTCFullYear(),
                endYear: endDateObj.getUTCFullYear(),
                width: window.innerWidth,
                height: 500
              })}
            </div>`
          : html`<i>No data.</i>`
      )
    : html`<div></div>`
);


```

<!-- Author Performance Contribution Percentage Chart -->
```js
import {
  authorShareChart,
  addAuthorToCompare,
  clearAuthorsToCompare
} from "./components/visualizations/author-share.js";

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
<!-- AUTHOR BUBBLE CHART -->
```js

import { authorBubble } from "./components/visualizations/bubble_chart.js";
import { rangeInput } from "./components/helpers/range_input.js";

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

const danish_filtered_data = danish.filter(d =>
  d.date instanceof Date && d.date >= startDateObj && d.date <= endDateObj
);

const french_filtered_data = french.filter(d =>
  d.date instanceof Date && d.date >= startDateObj && d.date <= endDateObj
);

// Danish genre buckets (kept identical)
const danish_comedy = danish.filter(d =>
  d.genre && (d.genre.toLowerCase().includes("comed") || d.genre.toLowerCase().includes("coméd"))
).filter(d => d.date instanceof Date && d.date >= startDateObj && d.date <= endDateObj);

const danish_tragedy = danish.filter(d =>
  d.genre && (d.genre.toLowerCase().includes("tragedia per musica") || d.genre.toLowerCase().includes("tragedy"))
).filter(d => d.date instanceof Date && d.date >= startDateObj && d.date <= endDateObj);

const danish_ballet = danish.filter(d =>
  d.genre && (d.genre.toLowerCase().includes("ballet") ||
    d.genre.toLowerCase().includes("ballet,ballet") ||
    d.genre.toLowerCase().includes("ballet,ballet,ballet"))
).filter(d => d.date instanceof Date && d.date >= startDateObj && d.date <= endDateObj);

const danish_drama = danish.filter(d =>
  d.genre && (d.genre.toLowerCase().includes("drama") ||
    d.genre.toLowerCase().includes("dramma giocoso per musica") ||
    d.genre.toLowerCase().includes("dramma pastorale") ||
    d.genre.toLowerCase().includes("dramma per musica"))
).filter(d => d.date instanceof Date && d.date >= startDateObj && d.date <= endDateObj);

// French genre buckets (kept identical)
const french_comedy = french.filter(d => d.genre === "comédie").filter(d => d.date instanceof Date && d.date >= startDateObj && d.date <= endDateObj);

const french_tragedy = french.filter(d =>
  d.genre && d.genre.toLowerCase().includes("tragédie")
).filter(d => d.date instanceof Date && d.date >= startDateObj && d.date <= endDateObj);

const french_ballet = french.filter(d =>
  d.genre && d.genre.toLowerCase().includes("ballet")
).filter(d => d.date instanceof Date && d.date >= startDateObj && d.date <= endDateObj);

const french_drama = french.filter(d =>
  d.genre && d.genre.toLowerCase().includes("drame")
).filter(d => d.date instanceof Date && d.date >= startDateObj && d.date <= endDateObj);

const danish_summary = processPerformanceGenres(danish_filtered_data, danish_comedy, danish_drama, danish_tragedy, danish_ballet, "danish");
const french_summary = processPerformanceGenres(french_filtered_data, french_comedy, french_drama, french_tragedy, french_ballet, "french");

display(divergingGenres ? genreLegend() : html`<div></div>`);

display(divergingGenres
  ? ((danish_filtered_data.length > 0 && french_filtered_data.length > 0)
      ? html`<div class="full-bleed">${divergentPlot(danish_summary, french_summary, { startYear: startDateObj.getUTCFullYear(), endYear: endDateObj.getUTCFullYear(), width: window.innerWidth, height: 700 })}</div>`
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
          ${percentageYearsChart(author_data, { author, startYear: startDateObj.getUTCFullYear(), endYear: endDateObj.getUTCFullYear(), width: window.innerWidth, height: 500 })}
        </div>`
      : html`<i>No data.</i>`)
  : html`<div></div>`
);

display(byAuthor ? html`<h3>Percentage by Location</h3>` : html`<div></div>`);

display(byAuthor
  ? (author_counts
      ? html`<div class="full-bleed">
          ${mapPlot(author_counts, { author, startYear: startDateObj.getUTCFullYear(), endYear: endDateObj.getUTCFullYear(), width: window.innerWidth, height: 450, circle, land })}
        </div>`
      : html`<i>No data.</i>`)
  : html`<div></div>`
);
```
<!-- DAYS WITH PERFORMANCES VISUALIZATIONS (IMPERATIVE MOUNTS)-->
```js
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
import { createMultipleAnimatedLines, createHeatmap } from "./components/visualizations/barchart.js";

// sort by year first for ltr visualization
genre_data.sort((a, b) => a.year - b.year);

renderPerformanceDays({
  performanceDays,
  origins: selectedOrigins,
  genre_data,
  danish_filtered_data,
  french_filtered_data,
  combined_data,
  asDate,
  startDateObj,
  endDateObj,
  window,
  document,
  createMultipleAnimatedLines,
  createHeatmap
});
```

<!-- CALENDAR APP VISUALIZATION-->
```js
import { injectCalendarStyles, buildEvents, renderCalendar, ORIGIN_COLOR } from "./components/visualizations/calendar.js";

await renderCalendarApp({
  calendar,
  display,
  html,
  Inputs,
  asDate,
  startDateObj,
  endDateObj,
  origins: selectedOrigins,
  danishPerf: danish,
  frenchPerf: french,
  dutchPerf: dutch,
  nola,
  ORIGIN_COLOR,
  injectCalendarStyles,
  buildEvents,
  renderCalendar
});
```
