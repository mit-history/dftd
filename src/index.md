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

```js
function processPerformanceGenres(fullData, comedyData, dramaData, tragedyData, balletData, origin) {
  const allYears = d3.rollup(fullData, v => v.length, d => d.year);
  const comedyYears = d3.rollup(comedyData, v => v.length, d => d.year);
  const dramaYears = d3.rollup(dramaData.concat(tragedyData), v => v.length, d => d.year);
  const balletYears = d3.rollup(balletData, v => v.length, d => d.year);

  return Array.from(allYears, ([year, total]) => {
    const comedy = comedyYears.get(year) || 0;
    const drama = dramaYears.get(year) || 0;
    const ballet = balletYears.get(year) || 0;
    const other = total - comedy - drama - ballet;
    return {
      year: +year,
      origin,
      comedy,
      drama,
      ballet,
      other,
      percent: {
        comedy: comedy / total,
        drama: drama / total,
        ballet: ballet / total,
        other: other / total
      }
    };
  });
}
```

```js
function genreLegend() {
  return Plot.legend({
    color: {
      domain: [
        "danish-comedy", "danish-drama", "danish-ballet", "danish-other",
        "french-comedy", "french-drama", "french-ballet", "french-other"
      ],
      range: ["#fca5a5", "#fb7185", "#ef4444", "#a3a3a3", "#93c5fd", "#60a5fa", "#3b82f6", "#6b7280"]
    },
    title: "Legend",
    columns: 2
  })
}
```

```js
function divergentPlot() {
  return Plot.plot({
    title: `Diverging Genre Performance Chart (${start_date.getFullYear()} - ${end_date.getFullYear()})`,
    width: 1000,
    height: 800,
    x: {
      label: "Number of Performances",
      tickFormat: Math.abs
    },
    y: {
      label: "Year",
      reverse: true
    },
    color: {
      domain: [
        "danish-comedy", "danish-drama", "danish-ballet", "danish-other",
        "french-comedy", "french-drama", "french-ballet", "french-other"
      ],
      range: ["#fca5a5", "#fb7185", "#ef4444", "#a3a3a3", "#93c5fd", "#60a5fa", "#3b82f6", "#6b7280"]
    },
  
    marks: [
      // 左侧（丹麦）：堆叠柱状图（负数）
      Plot.barX(
        danish_summary.flatMap(d => {
          const parts = [];
          let x = 0;
          for (const type of ["comedy", "drama", "ballet", "other"]) {
            const value = d[type];
            parts.push({
              year: d.year,
              x1: -x,
              x2: -(x + value),
              type,
              origin: "danish",
              percent: `${Math.round(d.percent[type] * 100)}%`
            });
            x += value;
          }
          return parts;
        }),
        {
          x1: "x1",
          x2: "x2",
          y: "year",
          fill: d => `${d.origin}-${d.type}`
        }
      ),

      // 右侧（法国）：堆叠柱状图（正数）
      Plot.barX(
        french_summary.flatMap(d => {
          const parts = [];
          let x = 0;
          for (const type of ["comedy", "drama", "ballet", "other"]) {
            const value = d[type];
            parts.push({
              year: d.year,
              x1: x,
              x2: x + value,
              type,
              origin: "french",
              percent: `${Math.round(d.percent[type] * 100)}%`
            });
            x += value;
          }
          return parts;
        }),
        {
          x1: "x1",
          x2: "x2",
          y: "year",
          fill: d => `${d.origin}-${d.type}`
        }
      ),

      // 中心线
      Plot.ruleX([0]),

      // 百分比文字标签（丹麦）
      Plot.text(
        danish_summary.flatMap(d => {
          const labels = [];
          let x = 0;
          for (const type of ["comedy", "drama", "ballet", "other"]) {
            const value = d[type];
            if (value > 0) {
              labels.push({
                year: d.year,
                x: -(x + value / 2),
                text: `${Math.round(d.percent[type] * 100)}%`
              });
            }
            x += value;
          }
          return labels;
        }),
        {
          x: "x",
          y: "year",
          text: "text",
          fill: "black",
          textAnchor: "middle"
        }
      ),

      // 百分比文字标签（法国）
      Plot.text(
        french_summary.flatMap(d => {
          const labels = [];
          let x = 0;
          for (const type of ["comedy", "drama", "ballet", "other"]) {
            const value = d[type];
            if (value > 0) {
              labels.push({
                year: d.year,
                x: x + value / 2,
                text: `${Math.round(d.percent[type] * 100)}%`
              });
            }
            x += value;
          }
          return labels;
        }),
        {
          x: "x",
          y: "year",
          text: "text",
          fill: "black",
          textAnchor: "middle"
        }
      )
    ]
  })
}
```

<div>

```js
const opt = ["Over Time", "Diverging Genres", "By Author", "Days with Performances"];
const vizOpt = Inputs.checkbox(opt, {label: "Visualization", value: ["Over Time"]});
const viz = view(vizOpt);
```

<p> Note: random genre options are selected by default. </p>

```js
const overTime = viz.includes("Over Time");
const divergingGenres = viz.includes("Diverging Genres");
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
const originOptions = ["danish", "dutch", "french"];
const originsInput = Inputs.checkbox(originOptions, {label: "Origin", value: originOptions});
const origins = view(originsInput);
const randomOrigins = () => {
  originsInput.value = originOptions.filter(i => Math.round(Math.random()));
  originsInput.dispatchEvent(new Event("input"));
}
```

```js
const genreOptions = Array.from(new Set(combined_data.filter(d => origins.includes(d.origin)).map((d) => d.genre).filter(Boolean))).sort();

const genreInput = Inputs.checkbox(
  genreOptions,
  {
    label: "Select genre(s)",
    value: genreOptions.filter(i => Math.round(Math.random()))
  }
);

const genres = view(genreInput);
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

const authorInput = Inputs.select( authorOptions, { label: "Filter by author", value: "No author" })
const author = view(authorInput);

const randomAuthor = () => {
  authorInput.value = authorOptions[Math.floor(Math.random() * authorOptions.length)];
  authorInput.dispatchEvent(new Event("input"));
}
```

```js
view(Inputs.button("Randomize", {value: null, reduce: () => { 
  randomOrigins(); 
  randomAuthor();
}}));
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
display(divergingGenres ? html `<h2>Comparative Performance Genres Over Time</h2>` : html`<div></div>`)
```

```js
const danish_comedy = danish.filter( (d) =>
  d.genre && (d.genre.toLowerCase().includes("comed") || d.genre.toLowerCase().includes("coméd"))
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const french_comedy = french.filter(d => d.genre === "comédie").filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

// filter out french tragedy, ballet and drama genres
const french_tragedy = french.filter(
  (d) => d.genre && (d.genre.toLowerCase().includes("tragédie"))
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const french_ballet = french.filter(
  (d) =>
    d.genre &&
    (d.genre.toLowerCase().includes("ballet"))
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const french_drama = french.filter(
  (d) =>
    d.genre &&
    (d.genre.toLowerCase().includes("drame"))).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

// filter out danish tragedy, ballet and drama genres
const danish_tragedy = danish.filter(
  (d) =>
    d.genre &&
    (d.genre.toLowerCase().includes("tragedia per musica") ||
      d.genre.toLowerCase().includes("tragedy"))
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const danish_ballet = danish.filter(
  (d) =>
    d.genre &&
    (d.genre.toLowerCase().includes("ballet") ||
      d.genre.toLowerCase().includes("ballet,ballet")||
      d.genre.toLowerCase().includes("ballet,ballet,ballet"))
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));

const danish_drama = danish.filter(
  (d) =>
    d.genre &&
    (d.genre.toLowerCase().includes("drama") ||
      d.genre.toLowerCase().includes("dramma giocoso per musica") ||
      d.genre.toLowerCase().includes("dramma pastorale")||
      d.genre.toLowerCase().includes("dramma per musica"))
).filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));
```

```js
const danish_filtered_data = danish.filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));
const french_filtered_data = french.filter(d => (new Date(d.date) > start_date) && (new Date(d.date)));
const danish_summary = processPerformanceGenres(danish_filtered_data, danish_comedy, danish_drama, danish_tragedy, danish_ballet, "danish");
const french_summary = processPerformanceGenres(french_filtered_data, french_comedy, french_drama, french_tragedy, french_ballet, "french");
```

```js
display(divergingGenres ? genreLegend() : html`<div></div>`);
```

```js
display(divergingGenres ? 
  ((danish_filtered_data.length > 0  && french_filtered_data.length > 0) ? divergentPlot() : html`<i>No data.</i>`) : 
  html`<div></div>`
)
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