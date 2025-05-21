---
toc: false
---

# Visualizations of Play Data

```js
const danish = FileAttachment("data/danish-performances.csv").csv({typed: true});
const french = FileAttachment("data/french-performances.json").json();
const dutch = FileAttachment("data/dutch-performances.csv").csv({typed: true});
```

```js
const data_origin = new Map();
data_origin.set("french", french);
data_origin.set("danish", danish);
data_origin.set("dutch", dutch);
```

```js
const combined_data = danish
    .map(d => ({...d, origin: "danish"}))
    .concat(french.map(d => ({...d, origin: "french"})))
    .map(d => ({...d, year: String(d.year)}))
    .concat(dutch.map(d => ({...d, origin: "dutch"})))
    .map(d => ({...d, year: String(d.year)}));
```

```js
function compareYearsChart(data) {
  return Plot.plot({
    title: `Compare performances per year, ${start_date.getFullYear()}-${end_date.getFullYear()}`,
    fx: { padding: 0, label: null },
    x: { axis: null, paddingOuter: 0.2 },
    y: { grid: true, label: "Performances", domain: [0, 366] },
    color: { legend: true },
    width: 1000,
    marks: [
      Plot.barY(data, Plot.groupX({y2: "count"}, {x: "origin", fx: "year", fill: "origin", tip: true})),
      Plot.ruleY([0])
    ]
  });
}
```

```js
function percentageYearsChart(data) {
  return Plot.plot({
    title: `Percentage of performances per year of works by ${author}, ${start_date.getFullYear()} - ${end_date.getFullYear()}`,
    fx: { padding: 0, label: null },
    x: { axis: null, paddingOuter: 0.2 },
    y: { grid: true, label: "Percentage" },
    color: { legend: true },
    marks: [
      Plot.barY(data, {x: "origin", y: "percentage", fx: "year", fill: "origin", tip: true}),
      Plot.ruleY([0])
    ]
  });
}
```

```js
const paris = {latitude: 48.856667, longitude: 2.352222}
const copenhagen = {latitude: 55.676111, longitude: 12.568333}
const amsterdam = {latitude: 52.372778, longitude: 4.893611}
```

```js
const world = FileAttachment("data/countries-110m.json").json()
```

```js
const circle = d3.geoCircle().center([7, 50]).radius(10).precision(2)()
const land = topojson.feature(world, world.objects.land)
```

```js
function mapPlot(data) {
  return Plot.plot({
    title: `Total number of performances of works by ${author}, ${start_date.getFullYear()} - ${end_date.getFullYear()}`,
    width: 400,
    projection: {
      type: "azimuthal-equidistant",
      rotate: [-7, -50],
      domain: circle,
      inset: 10
    },
    marks: [
      Plot.graticule(),
      Plot.geo(land, {fill: "currentColor", fillOpacity: 0.3}),
      Plot.dot(data, {
        x: "longitude", 
        y: "latitude", 
        r: "count", 
        stroke: "red", 
        fill: "red", 
        fillOpacity: 0.2, 
        channels: {origin: "origin"},
        tip: {
          format: {
            x: false,
            y: false,
            origin: true,
            count: true,
          }
        }
      }),
      Plot.frame()
    ]
  })
}
```

<div>

```js
const opt = ["Over Time", "By Author", "Days with Performances"];
const viz = view(Inputs.checkbox(opt, {label: "Visualization", value: opt.filter(o => Math.round(Math.random()))}));
```

```js
const overTime = viz.includes("Over Time");
const byAuthor = viz.includes("By Author");
const performanceDays = viz.includes("Days with Performances");
```

<div class="card" style="position:sticky;top:5px;">

<details open>

<summary>Filters</summary>

```js
const start_date = view(Inputs.date({label: "Start", value: "1748-01-01"}));
const end_date = view(Inputs.date({label: "End", value: "1778-12-31"}));
```

```js
const origins = view(Inputs.checkbox(["danish", "dutch", "french"], {label: "Origin", value: ["danish", "dutch", "french"].filter(i => Math.round(Math.random()))}));
```

```js
const genreOptions = Array.from(new Set(combined_data.filter(d => origins.includes(d.origin)).map((d) => d.genre).filter(Boolean))).sort();

const genres = view(
  Inputs.checkbox(
    genreOptions,
    {
      label: "Select genre(s)",
      value: genreOptions.filter(i => Math.round(Math.random())), // default: all
    }
  )
);
```

```js
const authorOptions = [
    "No author",
    ...Array.from(
      new Set([
        ...french.map((d) => d.author.split(" ; ")).flat().filter(Boolean),
        ...danish.map((d) => d.author?.split(",")).flat().filter(Boolean),
        ...dutch.map((d) => d.author).filter(Boolean),
      ])
    ).sort()
]

const author = view(
  Inputs.select( authorOptions, { label: "Filter by author", value: authorOptions[Math.floor(Math.random() * authorOptions.length)] })
);
```

</details>

</div>

```js
const formatted_data = combined_data.filter(d => (new Date(d.date) > start_date) && (new Date(d.date) <= end_date) && origins.includes(d.origin));
```

```js
display(overTime ? html `<h2>Comparative Performances Over Time</h2>` : html`<div></div>`)
```

```js
display(overTime ? (formatted_data.length > 0 ? compareYearsChart(formatted_data) : html`<i>No data.</i>`) : html`<div></div>`)
```

```js
// Apply filter
const author_filtered_data =
  author === "No author selected" ? undefined : formatted_data.filter((d) => d.author === author || d.author?.includes(author));
```

```js
const author_data_combined = author_filtered_data ? author_filtered_data .map((d, i, arr) => {
    const total = combined_data.filter(f => f.year === d.year && f.origin === d.origin).reduce((a, b) => a + 1, 0);
    const author = arr.filter(f => f.year === d.year && f.origin === d.origin).reduce((a, b) => a + 1, 0);
    return {year: d.year, origin: d.origin, percentage: (author / total) };
  }) : undefined;

const author_data = Array.from(new Set(author_data_combined?.map(JSON.stringify))).map(JSON.parse);
```

```js
const author_counts = author_filtered_data ? Object.entries(author_filtered_data.reduce((acc, d) => {
  acc[d.origin] = (acc[d.origin] || 0) + 1;
  return acc;
}, {})).map(([origin, count]) => {
  const coordinates = { 
    danish: copenhagen,
    dutch: amsterdam,
    french: paris
  }[origin];
  return { origin, count, ...coordinates };
}) : undefined;
```

```js
display(byAuthor ? html `<h2>Performances by Author</h2>` : html`<div></div>`)
```

```js
display(byAuthor ? html `<h3>Percentage by Author</h3>` : html`<div></div>`)
```

```js
display(byAuthor ? author_data.length > 0 ? percentageYearsChart(author_data) : html`<i>No data.</i>` : html`<div></div>`)
```

```js
display(byAuthor ? html `<h3>Percentage by Location</h3>` : html`<div></div>`)
```

```js
display(byAuthor ? author_counts ? mapPlot(author_counts) : html`<i>No data.</i>` : html`<div></div>`)
```

```js
display(performanceDays ? html `<h2>Animated Line Chart and Heatmap of Days with Performances</h2>` : html`<div></div>`)
display(performanceDays ? html `<p> Selected genres: ${genres.length === 0 ? "None" : genres.join(", ")} </p>` : html`<div></div>`)
```

```js
const genre_data =
  genres.length === 0
    ? formatted_data
    : formatted_data.filter((d) => genres.includes(d.genre));
```

<div style="
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  max-width: 1500px;
  margin: auto;
">
  <div id="line-chart-container" style="flex: 1 1 500px; min-width: 450px;"></div>
  <div id="heatmap-container" style="flex: 1 1 500px; min-width: 450px;"></div>
</div>

```js
import {
  createAnimatedLineChart,
  createMultipleAnimatedLines,
  createHeatmap,
  createGenreProportionChart,
  createGenreStackedBar,
  createGenreStackedBarVertical,
} from "./components/barchart.js";

// sort by year first for ltr visualization
genre_data.sort((a, b) => a.year - b.year);

// When dataset === "All", group each dataset into performance counts by year
function summarize(dataset, label) {
  const map = new Map();
  dataset.forEach(d => {
    const year = d.year;
    const date = d.performance_date || d.date;
    if (!map.has(year)) map.set(year, new Set());
    map.get(year).add(date);
  });
  const summary = Array.from(map, ([year, dates]) => ({
    year,
    count: dates.size,
  })).sort((a, b) => a.year - b.year);
  return { label, data: summary };
}

const french_data = summarize(french, "French");
const danish_data = summarize(danish, "Danish");
const dutch_data = summarize(dutch, "Dutch");

const summarized_data = origins.map(origin => summarize(data_origin.get(origin), origin));

// clear old charts
document.getElementById("line-chart-container").innerHTML = "";
document.getElementById("heatmap-container").innerHTML = "";

origins.length > 0 && performanceDays ? document.getElementById("line-chart-container").append(
    createMultipleAnimatedLines(summarized_data, { width: 700, height: 600 })
) : html`<i>No data.</i>`

origins.length > 0 && performanceDays ? document.getElementById("heatmap-container").append(
  createHeatmap(genre_data, { width: 700, height: 600 })
) : html`<i>No data.</i>`

```

</div>