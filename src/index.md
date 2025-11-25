---
toc: false
---

# Visualizations of Play Data

```js
const french = await FileAttachment("data/french-performances.json").json();
const dutch = await FileAttachment("data/dutch-performances.csv").csv({typed: true});

// Load & normalize the Danish performances directly from the raw JSON
const danish_raw = await FileAttachment("data/danish-performances.json").json();

// helper: make any Strapi date format a usable (number OR "1748-12-16 AD")
function toDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    // strip trailing " AD" if present
    const clean = value.replace(" AD", "");
    return new Date(clean);
  }
  return null;
}

const danish = danish_raw.map((perf) => {
  const d = toDate(perf.date);
  const year = d ? d.getUTCFullYear() : null;

  // try to get a title, fall back to Strapi's formatted_title
  const works = perf.production?.works ?? [];
  const titleFromWorks = works.map((w) => w.title).filter(Boolean).join("; ");

  return {
    id: typeof perf.id === "string" ? perf.id : String(perf.id),
    date: d,                     // <-- real Date object
    year,                        // <-- number, e.g. 1748
    title:
      titleFromWorks ||
      perf.formatted_title ||
      perf.production?.formatted_title ||
      null,
    genre: null,                 //  current JSON doesn't carry genres here
    place: perf.place?.name ?? null,
    author: null,
    origin: "danish",
  };
});

```

```js
const data_origin = new Map();
data_origin.set("french", french);
data_origin.set("danish", danish);
data_origin.set("dutch", dutch);

const combined_data = [
  ...danish,
  ...french.map(d => ({ ...d, origin: "french" })),
  ...dutch.map(d => ({ ...d, origin: "dutch" }))
];

```


```js
function percentageYearsChart(data) {
  return Plot.plot({
    title: `Percentage of performances per year of works by ${author},${start_date.getUTCFullYear()} - ${end_date.getFullYear()}`,
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
    title: `Total number of performances of works by ${author},${start_date.getUTCFullYear()} - ${end_date.getFullYear()}`,
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
    title: `Diverging Genre Performance Chart (${start_date.getUTCFullYear()} - ${end_date.getFullYear()})`,
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
const opt = ["Over Time", "Diverging Genres", "By Author", "Days with Performances", "Author Share", "Author Bubble"];
const vizOpt = Inputs.checkbox(opt, {label: "Visualization", value: ["Over Time"]});
const viz = view(vizOpt);
```

```js
const overTime = viz.includes("Over Time");
const divergingGenres = viz.includes("Diverging Genres");
const byAuthor = viz.includes("By Author");
const performanceDays = viz.includes("Days with Performances");
const authorShare = viz.includes("Author Share");
const bubble = viz.includes("Author Bubble");
```

<div class="card" style="position:sticky;top:5px;">

<details open>

<summary>Filters</summary>

```js
const start_date_input = Inputs.date({label: "Start", value: "1748-01-01"})
const end_date_input = Inputs.date({label: "End", value: "1798-12-31"})
const start_date = view(start_date_input);
const end_date = view(end_date_input);

const randomDates = () =>  {
  const start = new Date("1748-01-01");
  const end = new Date("1798-12-31"); // was 1778-12-31 before
  const new_start = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const new_end = new Date(new_start.getTime() + Math.random() * (end.getTime() - new_start.getTime()));
  start_date_input.value = new_start;
  end_date_input.value = new_end;
  start_date_input.dispatchEvent(new Event("input"));
  end_date_input.dispatchEvent(new Event("input"));
}

```

```js
const originOptions = ["danish", "dutch", "french"];
const originsInput = Inputs.checkbox(originOptions, {label: "Origin", value: originOptions});
const originsSelect = Inputs.toggle({label: "Select All", value: true})
const origins = view(originsInput);
view(originsSelect);

originsSelect.oninput = (event) => {
  if (!event.bubbles) return;
  if(originsSelect.value) {
    originsInput.value = originOptions;
  }
  else {
    originsInput.value = [];
  }

  originsInput.dispatchEvent(new Event("input"));
}

originsInput.oninput = (event) => {
  if(originsInput.value.length !== originOptions.length)  {
    originsSelect.value = false;
  } else {
    originsSelect.value = true;
  }
}

const randomOrigins = () => {
  const newValue = originOptions.filter(i => Math.round(Math.random()));
  originsInput.value = newValue;
  originsInput.dispatchEvent(new Event("input"));

  if(newValue.length === 3) originsSelect.value = true;
  else originsSelect.value = false;
}
```

```js
const genreOptions = Array.from(new Set(
  formatted_data
    .filter(d => origins.includes(d.origin))
    .map((d) => d.genre)
    .filter(Boolean)
)).sort();


const genreInput = Inputs.checkbox(
  genreOptions,
  {
    label: "Select genre(s)",
    value: genreOptions // default: all
  }
);

const genreSelect = Inputs.toggle({label: "Select All", value: true})

genreSelect.oninput = (event) => {
  if(genreSelect.value) {
    genreInput.value = genreOptions;
  }
  else {
    genreInput.value = [];
  }

  genreInput.dispatchEvent(new Event("input"));
}

genreInput.oninput = (event) => {
  if(genreInput.value.length !== genreOptions.length)  {
    genreSelect.value = false;
  } else {
    genreSelect.value = true;
  }
}

const genres = view(genreInput);
if(genreOptions.length > 0) view(genreSelect);
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
  randomDates();
  randomOrigins();
  randomAuthor();
}}));
```

</details>

</div>

```js
const formatted_data = combined_data.filter(d => {
  const dt = asDate(d.date);
  return dt && dt > start_date && dt <= end_date && origins.includes(d.origin);
});


const yearsInView = Array.from(
  new Set(formatted_data.map(d => +d.year).filter(Boolean))
).sort((a, b) => a - b);


yearsInView.slice(0,10).concat("...").concat(yearsInView.slice(-10))

function asDate(x) {
  if (x instanceof Date) return x;
  if (typeof x === "number") return new Date(x);
  if (typeof x === "string") return new Date(x.replace(" AD", ""));
  return null;
}
```

```js
function compareYearsChart(data) {
  const years = Array.from(new Set(data.map(d => d.year).filter(Boolean))).sort((a, b) => a - b);
  const n = years.length;
  const step =
    n > 60 ? 10 :
    n > 40 ? 5 :
    n > 25 ? 2 : 1;
  const yearTicks = years.filter((_, i) => i % step === 0);

  return Plot.plot({
    title: `Compare performances per year, ${start_date.getFullYear()}–${end_date.getFullYear()}`,
    fx: { label: null, padding: 0.1 },
    x: { axis: null, paddingOuter: 0.2 },
    y: { grid: true, label: "Performances", domain: [0, 366] },
    color: { legend: true },
    width: 1000,
    marginBottom: 60,
    marks: [
      Plot.barY(data, Plot.groupX({y2: "count"}, {x: "origin", fx: "year", fill: "origin", tip: true})),
      Plot.ruleY([0]),
      // 👇 labels below instead of above
      Plot.axisFx({
        ticks: yearTicks,
        tickFormat: d => d,
        anchor: "bottom"
      })
    ]
  });
}



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
import {
  authorShareChart,
  emitAuthorsToCompare,
  addAuthorToCompare,
  clearAuthorsToCompare,
} from "./components/author-share.js";

if (authorShare) {
  display(html`<h2>Author Performance Contribution Percentage</h2>`);
  display(authorShareChart(author, formatted_data));
  } else
  display(html`<div></div>`)
```

```js
let authorsToCompare = [];

if (authorShare) {
  view(
    Inputs.button("Add author", {
      value: null,
      reduce: () => {
        addAuthorToCompare(author);
        return null;
      }
    })
  );

  view(
    Inputs.button("Clear authors", {
      value: null,
      reduce: () => {
        clearAuthorsToCompare();
        return null;
      }
    })
  );
} else {
  display(html`<div></div>`)
}
```

```js
import { BubbleChart, authorBubble } from "./components/bubble_chart.js";
import { rangeInput } from "./components/range_input.js";
```

```js
display(bubble ? html `<h2>Authors Performed By Location</h2>` : html`<div></div>`);
```

```js
display(bubble? html `<div></h2>` : html`<div></div>`);
const percent_absolute = Inputs.radio(["percentage", "absolute"], {label: "Mode", value: "percentage"});
const percent_absolute_val = bubble?view(percent_absolute):0;
```

```js
display(bubble? html `<div></h2>` : html`<div></div>`);
const do_overall_threshold = Inputs.toggle({label: "Overall Threshold", value: true});
const do_overall_threshold_val = bubble?view(do_overall_threshold):false;

```
```js
display(bubble? html `<div></h2>` : html`<div></div>`);
const overall_threshold = Inputs.number({value:1, label: 'Enter Threshold'});
const overall_threshold_val = do_overall_threshold_val?view(overall_threshold):0;
```


```js
display(bubble? html `<h2>French</h2>` : html`<div></div>`);
const french_threshold = Inputs.number({value:1, label: 'Enter Threshold'});
const french_threshold_val = bubble? (do_overall_threshold_val?overall_threshold_val:view(french_threshold)):0;
const f = rangeInput({
  min: 1748,
  max: 1798,
  step: 1,
  value: [1748, 1778],
  enableTextInput: true
});
const f_val = bubble?view(f):[0,0];

```

```js
display(bubble? authorBubble(combined_data, 'french', 0, french_threshold_val, f_val[0], f_val[1], percent_absolute_val): html`<div></div>`);
```

```js

display(bubble? html `<h2>Dutch</h2>` : html`<div></div>`);
const dutch_threshold = Inputs.number({value:1, label: 'Enter Threshold'});
const dutch_threshold_val = bubble? (do_overall_threshold_val?overall_threshold_val:view(dutch_threshold)):0;
const du = rangeInput({
  min: 1748,
  max: 1798,
  step: 1,
  value: [1748, 1778],
  enableTextInput: true
});
const du_val = bubble?view(du):[0,0];

```

```js
display(bubble? authorBubble(combined_data, 'dutch', 0, dutch_threshold_val, du_val[0], du_val[1], percent_absolute_val): html`<div></div>`);
```

```js
display(bubble? html `<h2>Danish</h2>` : html`<div></div>`)
const danish_threshold = Inputs.number({value:1, label: 'Enter Threshold'});
const danish_threshold_val = bubble? (do_overall_threshold_val?overall_threshold_val:view(danish_threshold)):0;
const da = rangeInput({
  min: 1748,
  max: 1798,
  step: 1,
  value: [1748, 1778],
  enableTextInput: true
});
const da_val = bubble?view(da):[0,0];


```

```js
display(bubble? authorBubble(combined_data, 'danish', 0, danish_threshold_val, da_val[0], da_val[1], percent_absolute_val): html`<div></div>`);
```



</div>

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
const danish_filtered_data = danish.filter(d => {
  const dt = asDate(d.date);
  return dt && dt > start_date && dt <= end_date;
});
const french_filtered_data = french.filter(d => {
  const dt = asDate(d.date);
  return dt && dt > start_date && dt <= end_date;
});

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
display(performanceDays ? html `<p> Selected genres: ${genres.length === 0 ? "None" : genres.length === genreOptions.length ? "All" : genres.join(", ")} </p>` : html`<div></div>`)
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
// summarize only what’s in the current date window
function summarize(dataset, label) {
  const map = new Map();
  dataset.forEach(d => {
    const dt = asDate(d.date);
    if (!dt) return;
    if (dt < start_date || dt > end_date) return; // 👈 clamp to filter
    const year = d.year ?? dt.getUTCFullYear();
    if (!map.has(year)) map.set(year, new Set());
    map.get(year).add(dt.toISOString().slice(0, 10)); // day-level uniqueness
  });
  const summary = Array.from(map, ([year, dates]) => ({
    year,
    count: dates.size,
  })).sort((a, b) => a.year - b.year);
  return { label, data: summary };
}

// use the already-filtered datasets
const originToData = {
  danish: danish_filtered_data,
  french: french_filtered_data,
  // if you ever add dutch_filtered_data, put it here too
  dutch: combined_data
    .filter(d => d.origin === "dutch")
    .filter(d => {
      const dt = asDate(d.date);
      return dt && dt >= start_date && dt <= end_date;
    })
};

// build the list in the order the user selected
const summarized_data = origins.map(origin =>
  summarize(originToData[origin] ?? [], origin)
);


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
