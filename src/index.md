---
toc: false
---


```js
const french = await FileAttachment("data/french-performances.json").json();
console.log('lengths')
const french_dates = new Set(french.filter(d=> d.year === 1775).map(d=> d.date))
const dutch = await FileAttachment("data/dutch-performances.csv").csv({typed: true});
const saintDomingue = await FileAttachment("data/saint_domingue/formatted_saint_domingue.json").json();
const london = await FileAttachment('data/london/formatted_london.json').json()
const coventGarden = london.filter(d => d.place == "Covent Garden").map(d =>{
  d.origin = 'covent garden';
  return d;
});
const druryLane = london.filter(d => d.place == "Drury Lane").map(d =>{
  d.origin = 'drury lane';
  return d;
});
const newOrleans = await FileAttachment("data/new_orleans/new_o_frequent_performances.csv").csv({typed: false});
console.log(coventGarden)
console.log(druryLane)


const color_map = {
  'french': '#FF725C',
  'dutch': '#EFB119',
  'danish': '#4269D0',
  'saint-domingue': '#6BC5B0',
  'new orleans': '#A855F7',
  'covent garden': '#4DA011',
  'drury lane': '#DF789A',
  // 'teatro de la cruz': '#97BBF5',
  // 'teatro del principe': '#9C6B4E',
  // 'incoming data': '#B2C400',
};

const name_map = {
  'french': 'Comédie-Française (Paris)',
  'dutch': 'Schouwburg Theater (Amsterdam)',
  'danish': 'Royal Danish Theater (Copenhagen)',
  'saint-domingue': 'Saint-Domingue (All theaters)',
  'covent garden': 'Covent Garden (London)',
  'drury lane': 'Drury Lane (London)',
  'new orleans': 'New Orleans (All theaters)',
  'teatro de la cruz': 'Teatro de la Cruz (Madrid)',
  'teatro del principe': 'Teatro del Principe (Madrid)'
};

// Load & normalize the Danish performances directly from the raw JSON
const danish_raw = await FileAttachment("data/danish-performances.json").json();

// Load Danish works to look up missing authors
const danish_works = await FileAttachment("data/danish-works.json").json();
const danishPerfAuthors = new Map();
const danishPerfGenres = new Map();
for (const work of danish_works) {
  const authors = (work.contributors || [])
    .filter(c => c.roles?.some(r => ["Playwright", "Librettist", "Author"].includes(r.title)))
    .map(c => c.person?.name)
    .filter(Boolean)
    .join(" ; ");

  const genres = (work.genres || [])
    .map(g => g.name)
    .filter(Boolean)
    .join(" ; ");

  if (work.productions) {
    for (const prod of work.productions) {
      if (prod.performances) {
        for (const perf of prod.performances) {
          if (authors) danishPerfAuthors.set(String(perf.id), authors);
          if (genres) danishPerfGenres.set(String(perf.id), genres);
        }
      }
    }
  }
}

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
  let authorFromWorks = works.map((w) => w.author?.name || w.author).filter(Boolean).join(" ; ");
  if (!authorFromWorks) {
    authorFromWorks = danishPerfAuthors.get(String(perf.id));
  }
  let genreFromWorks = works.map((w) => w.genre?.name || w.genre).filter(Boolean).join(" ; ");
  if (!genreFromWorks) {
    genreFromWorks = danishPerfGenres.get(String(perf.id));
  }

  return {
    id: typeof perf.id === "string" ? perf.id : String(perf.id),
    date: d,                     // <-- real Date object
    year,                        // <-- number, e.g. 1748
    title:
      titleFromWorks ||
      perf.formatted_title ||
      perf.production?.formatted_title ||
      null,
    genre: genreFromWorks || null,
    place: perf.place?.name ?? null,
    author: authorFromWorks || null,
    origin: "danish",
  };
});

```

<!-- handles date formatting -->
```js
function asDate(x) {
  if (x instanceof Date) return x;
  if (typeof x === "number") return new Date(x);
  if (typeof x === "string") return new Date(x.replace(" AD", ""));
  return null;
}
```


<!-- styling of notebook -->
```js
html`<style>
  body * { outline: 1px solid red !important; }
</style>`

html`<style>
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
</style>`

```

```js
const data_origin = new Map();
data_origin.set("french", french);
data_origin.set("danish", danish);
data_origin.set("dutch", dutch);
data_origin.set("saint-domingue", saintDomingue);

const combined_data = [
  ...danish,
  ...french.map(d => ({ ...d, origin: "french" })),
  ...dutch.map(d => ({ ...d, origin: "dutch" })),
  ...saintDomingue.map(d => ({ ...d, origin: "saint-domingue" })),
  ...coventGarden,
  ...druryLane,
  ...newOrleans.map(d=>({
    date: new Date(d['date of performance']),
    title: d['works mentioned'],
    genre: d.genre,
    place: d['Performance Location'],
    author: d.author,
    year: Number(d.year),
    origin: 'new orleans'
  }))
];
// console.log('combined data')
// console.log(combined_data.filter(d=>d.origin=='new orleans'))

```


```js
function percentageYearsChart(data) {
  return Plot.plot({
    title: `Percentage of performances per year of works by ${author},${start_date.getUTCFullYear()} - ${end_date.getFullYear()}`,
    fx: { padding: 0, label: null },
    x: { axis: null, paddingOuter: 0.2 },
    y: { grid: true, label: "Percentage" },
    color: {
      domain: Object.keys(color_map),
      range: Object.values(color_map),
      tickFormat: d => name_map[d] || d,
      legend: true
    },
    width: window.innerWidth,
    height: 500,
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
    width: window.innerWidth,
    height: 450,
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
        stroke: d => color_map[d.origin],
        fill: d => color_map[d.origin],
        fillOpacity: 0.8,
        channels: {Location: d => name_map[d.origin] || d.origin},
        tip: {
          format: {
            x: false,
            y: false,
            Location: true,
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
      range: ["#fca5a5", "#fb7185", "#ef4444", "#a3a3a3", "#93c5fd", "#60a5fa", "#3b82f6", "#6b7280"],
      tickFormat: d => {
        const [orig, genre] = d.split('-');
        return `${name_map[orig] || orig} - ${genre}`;
      }
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
    width: window.innerWidth,
    height: 700,
    x: {
      label: "Number of Performances",
      tickFormat: Math.abs
    },
    y: {
      label: "Year",
      reverse: true,
      tickFormat: d => String(d)
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

<!-- toggle to go to visualizations -->
```js

// Map route IDs / query params -> internal labels in the toggle list
const vizLabelById = {
  "over-time": "Over Time",
  "genres": "Diverging Genres",
  "authors": "By Author",
  "days": "Days with Performances",
  "heat-map": "Heat Map",

  // Author share variants
  "authorShare": "Author Share",
  "author-shares": "Author Share",

  // Author bubble variants
  "author_bubble": "Author Bubble",
  "author-bubble": "Author Bubble",
  "authorBubble": "Author Bubble",

  "calendar": "Calendar",
  "nola-genre-bubble": "NOLA Genre Bubble"
};


// Full list of visualization labels
const opt = [
  "Over Time",
  "Heat Map",
  // "Diverging Genres",
  // "By Author",
  "Days with Performances",
  "Author Share",
  "Author Bubble",
  "Calendar",
  "NOLA Genre Bubble",
];

// Read ?viz=... from the URL if we’re in a browser
let vizParam = null;
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  vizParam = params.get("viz");
}

// If vizParam matches one of our IDs, lock to that one; otherwise use the checkbox
let viz;
if (vizParam && vizLabelById[vizParam]) {
  // Only that one visualization is "on"
  viz = [vizLabelById[vizParam]];
} else {
  const vizOpt = Inputs.checkbox(opt, {
    label: "Visualization",
    value: ["Over Time"]
  });
  viz = view(vizOpt);
}

```

```js
const overTime = viz.includes("Over Time");
// const divergingGenres = viz.includes("Diverging Genres");
// const byAuthor = viz.includes("By Author");
const performanceDays = viz.includes("Days with Performances");
const authorShare = viz.includes("Author Share");
const bubble = viz.includes("Author Bubble");
const calendar = viz.includes("Calendar");
const nolaBubble = viz.includes("NOLA Genre Bubble");
const heatMap = viz.includes("Heat Map");

const vizFilterConfig = {
  "Over Time": { yearRange: true, origins: true },
  "Heat Map": { exactDateRange: true, origins: true },
  "Days with Performances": { yearRange: true, origins: true },
  "Author Share": { yearRange: true, origins: true },
  "Author Bubble": { yearRange: true, authorBubbleControls: true, origins: true },
  "Calendar": { calendarControls: true, origins: true },
  "NOLA Genre Bubble": { nolaGenres: true }
};

const activeFilters = Object.assign(
  {},
  ...viz.map(label => vizFilterConfig[label] ?? {})
);

// prioritize year slider when different date selection types are activated in sandbox mode
activeFilters.exactDateRange = activeFilters.exactDateRange && !activeFilters.yearRange;

```

<div class="card" style="margin-bottom: 1rem;">


<details closed>

<summary>Filters</summary>

```js
import { rangeInput } from "./components/range_input.js";
```

```js
// Calendar-specific controls only
const modeIn       = Inputs.radio(["Month","Week","Day"], { label: "Calendar view", value: "Month" });
const overlayIn    = Inputs.toggle({ label: "Overlay major events", value: true });
const anchorIn     = Inputs.date({ label: "Date displayed", value: start_date });
const includeNola  = Inputs.toggle({ label: "Include New Orleans (NOLA)", value: true });

const nav = html`<div style="display:flex; gap:.5rem; align-items:center; margin:.25rem 0;">
  <button id="prev">◀ Prev</button><button id="next">Next ▶</button>
</div>`;

// Dedicated mount nodes so we *replace* contents instead of appending
const venuesMount = html`<div id="venues-mount"></div>`;
const legendMount = html`<div id="legend-mount"></div>`;

// Only render the controls card if an active visualization uses calendar controls.
if (activeFilters.calendarControls) {
  display(html`<div style="padding:.6rem; margin:.6rem 0;">
    <div style="display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.6rem;">
      <div>${anchorIn}</div><div>${nav}</div>
      <div>${modeIn}</div><div>${overlayIn}</div>
      <div style="grid-column:1/-1">${includeNola}</div>
      <div style="grid-column:1/-1">${venuesMount}</div>
    </div>
  </div>`);
}else{
  display(html`<span></span>`);
}

const nolaMainGenres = ["drame", "tragedy", "comedy", "vaudeville", "opera", "other"];

const nolaGenreInput = Inputs.checkbox(nolaMainGenres, {
  label: "Filter NOLA Genres",
  value: nolaMainGenres,
  format: d => d.charAt(0).toUpperCase() + d.slice(1)
});

const nolaSelectedGenres = activeFilters.nolaGenres
  ? view(nolaGenreInput)
  : (display(html`<span hidden></span>`), nolaMainGenres);
```

```js
  const start_date_input = Inputs.date({label: "Start", value: "1748-01-01"})
  const end_date_input = Inputs.date({label: "End", value: "1798-12-31"})
  const date_range = rangeInput({
    min: 1748,
    max: 1815,
    step: 1,
    value: [1748, 1815],
    enableTextInput: true
  });
  const defaultDateRange = [1748, 1815];
  display(activeFilters.yearRange? html`<span style="margin-right: 1rem">Year Range</span>`:html`<span hidden></span>`)
  const date_range_val = activeFilters.yearRange
    ? view(date_range)
    : (display(html`<span hidden></span>`), defaultDateRange);
```
```js

  const start_date = activeFilters.exactDateRange
    ? view(start_date_input)
    : (display(html`<span hidden></span>`), new Date(`${date_range_val[0]}-01-01`));
  const end_date = activeFilters.exactDateRange
    ? view(end_date_input)
    : (display(html`<span hidden></span>`), new Date(`${date_range_val[1]}-12-31`));


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

const originOptions = ["danish", "dutch", "french", "saint-domingue", 'covent garden', 'drury lane', 'new orleans'];
const reactiveOrigins = Inputs.input(["danish", "dutch", "french"]);
const react = Generators.input(reactiveOrigins)

```
```js

const originsInput = Inputs.checkbox(originOptions, {
    label: !overTime? "Origin": "Origin (max 3)",
    value: reactiveOrigins,
    format:  d => html`<span class="cal-key"><span class="cal-dot" style="background:${color_map[d] || '#999'}"></span>${name_map[d] || d}</span>`,
    // name_map[d] || d,
    // disabled: ['new orleans']
    disabled: originOptions.filter((o) => (!overTime? false: (3 <= react.length) && !react.includes(o)))
  })
const bindedInput = Inputs.bind(
  originsInput,
  reactiveOrigins
)
const originsSelect = Inputs.toggle({label: "Select All", value: false})
const origins = activeFilters.origins
  ? view(originsInput)
  : (display(html`<span hidden></span>`), originOptions);
if (activeFilters.origins && !overTime) {
  view(originsSelect);
} else {
  display(html`<span hidden></span>`);
}

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
const UNKNOWN_GENRE = "Unknown genre";
const genreKey = (d) => d.genre || UNKNOWN_GENRE;

const genreOptions = Array.from(new Set(
  formatted_data
    .filter(d => origins.includes(d.origin))
    .map(genreKey)
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

const genres = activeFilters.genres
  ? view(genreInput)
  : (display(html`<span hidden></span>`), genreOptions);
if (activeFilters.genres && genreOptions.length > 0) {
  view(genreSelect);
} else {
  display(html`<span hidden></span>`);
}
```

```js
const authorOptions = [
    "No author",
    ...Array.from(
      new Set([
        ...french.map((d) => d.author?.split(" ; ")).flat().filter(Boolean),
        ...danish.flatMap((d) => d.author?.split(/[,;]\s*/)).filter(Boolean),
        ...danish.map((d) => d.author?.split(/[,;]\s*/)).flat().filter(Boolean),
        ...dutch.map((d) => d.author).filter(Boolean),
        ...saintDomingue.map((d) => d.author).filter(Boolean),
        ...london.map((d) => d.author).filter(Boolean)
      ])
    ).sort()
];

const authorInput = Inputs.select( authorOptions, { label: "Filter by author", value: "No author" })
const author = 'No author';

const randomAuthor = () => {
  authorInput.value = authorOptions[Math.floor(Math.random() * authorOptions.length)];
  authorInput.dispatchEvent(new Event("input"));
}
```

```js
const percent_absolute = Inputs.radio(["percentage", "absolute"], {label: "Mode", value: "percentage"});
const percent_absolute_val = activeFilters.authorBubbleControls
  ? view(percent_absolute)
  : (display(html`<span hidden></span>`), 0);
```

```js
const threshold = rangeInput({
  min: 0,
  max: percent_absolute_val=="percentage"?100:Math.max(...Object.values(maxes)),
  step: 1,
  value: [0, percent_absolute_val=="percentage"?100:Math.max(...Object.values(maxes))],
  enableTextInput: true,
});
display(bubble? html`<span style="margin-right: 1rem">Threshold</span>`:html`<span hidden></span>`)
const threshold_val = bubble? view(threshold):display(html`<span hidden></span>`)
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

```

```js
function compareYearsChart(data) {
  console.log('this is data')
  console.log(data)
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
    color: {
      domain: Object.keys(color_map),
      range: Object.values(color_map),
      tickFormat: d => name_map[d] || d,
      legend: true
    },
    width: window.innerWidth,
    marginBottom: 60,
    marks: [
      Plot.barY(data, Plot.groupX({y2: "count"}, {x: "origin", fx: "year", fill: "origin", tip: true})),
      Plot.ruleY([0]),
      // 👇 labels below instead of above
      Plot.axisFx({
        ticks: yearTicks,
        tickFormat: d => String(d),
        anchor: "bottom"
      })
    ]
  });
}



```

```js

const unique_formatted_data = []
for (const origin of originOptions){
  const dates = new Set()
  for (const event of formatted_data.filter(d=>d.origin === origin)){
    if (!dates.has(event.date)){
      unique_formatted_data.push(event);
      dates.add(event.date)
    }
  }
}
// console.log('formatted data')
// console.log(unique_formatted_data.filter(d=>d.origin=='new orleans'))
// console.log(new_cv.length)
// console.log(formatted_cv.length)
// const full_formatted_data = unique_formatted_data.concat(new_stdmg).concat(new_cv.map(d => {d.origin = 'covent garden'; return d})).concat(new_dl.map(d => {d.origin = 'drury lane'; return d}));
if (overTime) {
  // display(html`<h2>Comparative Performances Over Time</h2>`);
  display(
    unique_formatted_data.length > 0
      ? html`<div class="full-bleed" id="french-graph-container">
          ${compareYearsChart(unique_formatted_data)}
        </div>`
      : html`<i>No data.</i>`
  );
} else {
  display(html`<span hidden></span>`);
}

// if (divergingGenres) {
  // display(html`<h2>Comparative Performance Genres Over Time</h2>`);
// }

```

```js
import {
  authorShareChart,
  emitAuthorsToCompare,
  addAuthorToCompare,
  clearAuthorsToCompare,
  authorsCompareBus,
  latestAuthorsToCompare
} from "./components/author-share.js";

```

```js

if (authorShare) {
  display(html`<div class="full-bleed">
    <h2>Author Performance Contribution Per Days</h2>
    ${authorShareChart(author, unique_formatted_data, color_map, name_map)}
  </div>`);
} else {
  display(html`<span hidden></span>`)
}
```

```js
import { BubbleChart, authorBubble } from "./components/bubble_chart.js";
```

```js
const maxes = {}
for(const loc of [combined_data.filter(d => d.origin == 'french'), combined_data.filter(d => d.origin == 'dutch'), coventGarden, druryLane, saintDomingue]){
  maxes[loc[0].origin] = Math.max(...Object.values(loc.reduce((acc, d) => {
      acc[d.author] = (acc[d.author] || 0) + 1;
      return acc;
  }, {})))
}
console.log('maxes', maxes)
```


```js
if(bubble){
  for(const origin of origins){
    display(bubble? html `<h2>${name_map[origin]}</h2>` : html`<div></div>`);
    display(
    bubble
      ? authorBubble(
          combined_data,
          origin,
          0,
        threshold_val,
          date_range_val[0],
          date_range_val[1],
          percent_absolute_val
        )
      : html`<div></div>`
  );
  }
}
```

```js
// display(bubble? html `<h2>Comédie-Française (Paris)</h2>` : html`<div></div>`);
```

```js
// display(
//    bubble
//      ? authorBubble(
//          combined_data,
//         "french",
//         0,
//        french_threshold_val,
//         date_range_val[0],
//          date_range_val[1],
//          percent_absolute_val
//        )
//      : html`<div></div>`
//  );
```

```js

// display(bubble? html `<h2>Schouwburg Theater (Amsterdam)</h2>` : html`<div></div>`);
// display(bubble&&!do_overall_threshold_val? html`<p>Threshold Range</p>`:html`<div></div>`);
// const dutch_threshold = rangeInput({
//   min: 0,
//   max: percent_absolute_val=="percentage"?100:maxes.dutch,
//   step: 1,
//   value: [0, percent_absolute_val=="percentage"?100:maxes.dutch],
//   enableTextInput: true
// });
// const dutch_threshold_val = bubble? (do_overall_threshold_val?overall_threshold_val:view(dutch_threshold)):[0,0];


```

```js
// display(bubble? authorBubble(combined_data, 'dutch', 0, dutch_threshold_val, date_range_val[0], date_range_val[1], percent_absolute_val): html`<div></div>`);
```

```js
// display(bubble? html `<h2>Saint-Domingue (All Theaters)</h2>` : html`<div></div>`)
// display(bubble&&!do_overall_threshold_val? html`<p>Threshold Range</p>`:html`<div></div>`);
// const stdmg_threshold = rangeInput({
//   min: 0,
//   max: percent_absolute_val=="percentage"?100:maxes['saint-domingue'],
//   step: 1,
//   value: [0, percent_absolute_val=="percentage"?100:maxes['saint-domingue']],
//   enableTextInput: true
// });
// const stdmg_threshold_val = bubble? (do_overall_threshold_val?overall_threshold_val:view(stdmg_threshold)):[0,0];
// display(bubble? html`<p>Year Range</p>`:html`<div></div>`);


```

```js
// display(bubble? authorBubble(saintDomingue, 'saint-domingue', 0, stdmg_threshold_val, date_range_val[0], date_range_val[1], percent_absolute_val): html`<div></div>`);
```

```js
// display(bubble? html `<h2>Covent Garden (London)</h2>` : html`<div></div>`)
// display(bubble&&!do_overall_threshold_val? html`<p>Threshold Range</p>`:html`<div></div>`);
// const cv_threshold = rangeInput({
//   min: 0,
//   max: percent_absolute_val=="percentage"?100:maxes['covent garden'],
//   step: 1,
//   value: [0, percent_absolute_val=="percentage"?100:maxes['covent garden']],
//   enableTextInput: true
// });
// const cv_threshold_val = bubble? (do_overall_threshold_val?overall_threshold_val:view(cv_threshold)):[0,0];



```

```js
// display(bubble? authorBubble(coventGarden, 'covent garden', 0, cv_threshold_val, date_range_val[0], date_range_val[1], percent_absolute_val): html`<div></div>`);
```

```js
// display(bubble? html `<h2>Drury Lane (London)</h2>` : html`<div></div>`)
// display(bubble&&!do_overall_threshold_val? html`<p>Threshold Range</p>`:html`<div></div>`);
// const dl_threshold = rangeInput({
//   min: 0,
//   max: percent_absolute_val=="percentage"?100:maxes['drury lane'],
//   step: 1,
//   value: [0, percent_absolute_val=="percentage"?100:maxes['drury lane']],
//   enableTextInput: true
// });
// const dl_threshold_val = bubble? (do_overall_threshold_val?overall_threshold_val:view(dl_threshold)):[0,0];


```

```js
// display(bubble? authorBubble(druryLane, 'drury lane', 0, dl_threshold_val, date_range_val[0], date_range_val[1], percent_absolute_val): html`<div></div>`);
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
// display(divergingGenres ? genreLegend() : html`<div></div>`);
```

```js
// display(divergingGenres
//   ? ((danish_filtered_data.length > 0 && french_filtered_data.length > 0)
//       ? html`<div class="full-bleed">${divergentPlot()}</div>`
//       : html`<i>No data.</i>`)
//   : html`<div></div>`
// )

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
    "danish": copenhagen,
    "dutch": amsterdam,
    "french": paris,
    "covent garden": {latitude: 51.5072, longitude: -0.14}, // London, slightly offset left
    "drury lane": {latitude: 51.5072, longitude: -0.11},    // London, slightly offset right
    "saint-domingue": {latitude: 18.9, longitude: -72.2},
    "teatro de la cruz": {latitude: 40.4168, longitude: -3.7038},
    "teatro del principe": {latitude: 40.4168, longitude: -3.7038},
    "new orleans": {latitude: 29.9511, longitude: -90.0715}
  }[origin] || {latitude: 0, longitude: 0};
  return { origin, count, ...coordinates };
}) : undefined;
```

```js
// display(byAuthor ? html `<h2>Performances by Author</h2>` : html`<div></div>`)
```

```js
// display(byAuthor ? html `<h3>Percentage by Author</h3>` : html`<div></div>`)
```

```js
// display(byAuthor
//   ? (author_data.length > 0
//       ? html`<div class="full-bleed">
//           ${percentageYearsChart(author_data)}
//         </div>`
//       : html`<i>No data.</i>`)
//   : html`<div></div>`
// )

```

```js
// display(byAuthor ? html `<h3>Percentage by Location</h3>` : html`<div></div>`)
```

```js
// display(byAuthor
//   ? (author_counts
//       ? html`<div class="full-bleed">
//           ${mapPlot(author_counts)}
//         </div>`
//       : html`<i>No data.</i>`)
//   : html`<div></div>`
// )

```

```js
// display(performanceDays ? html `<h2>Animated Line Chart of Days with Performances</h2>` : html`<div></div>`)
display(html`<span hidden></span>`)
```

```js
const genre_data =
  genres.length === 0 || genres.length === genreOptions.length
    ? formatted_data
    : formatted_data.filter((d) => genres.includes(genreKey(d)));
```

<div class="full-bleed days-grid">
  <div id="line-chart-container"></div>
  <div id="heatmap-container"></div>
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

// The animated lines count performance days by origin; genre filtering is reserved for the heat map.
const originToData = Object.fromEntries(
  originOptions.map(origin => [
    origin,
    formatted_data.filter(d => d.origin === origin)
  ])
);

// build the list in the order the user selected
const summarized_data = origins.map(origin =>
  summarize(originToData[origin] ?? [], origin)
);


const containerWidth = window.innerWidth;
const containerHeight = window.innerHeight;

const lineChartContainer = document.getElementById("line-chart-container");
lineChartContainer.replaceChildren();

if (origins.length > 0 && performanceDays) {
  lineChartContainer.replaceChildren(createMultipleAnimatedLines(summarized_data, {
    width: containerWidth,
    height: containerHeight,
    colorMap: color_map,
    nameMap: name_map
  }));
} else {
  lineChartContainer.replaceChildren();
}


```
</div>



```js
// display(heatMap ? html `<h2>Heatmap of Days with Performances</h2>` : html`<div></div>`)

display(origins.length > 0 && heatMap ? createHeatmap(genre_data, { width: containerWidth, height: containerHeight }) : heatMap? html`<i>No data.</i>`: html`<span></span>`)

```



```js
// Heading for the calendar section – only when calendar viz is active
// display(
//   calendar
//     ? html`<h2>Global Theatre Calendar (1748 – 1798)</h2>`
//     : html`<div></div>`
// );

import { injectCalendarStyles, buildEvents, renderCalendar, ORIGIN_COLOR } from "./components/calendar.js";

// ==============================
// 1) Load data again
// ==============================
const FrenchRaw = await FileAttachment("data/french-performances.json").json();
const DutchRaw  = await FileAttachment("data/dutch-performances.csv").csv({typed: true});
const DanishRaw = await FileAttachment("data/danish-performances.json").json();
const SaintDomingueRaw = await FileAttachment("data/saint_domingue/formatted_saint_domingue.json").json();
const LondonRaw = await FileAttachment('data/london/formatted_london.json').json();
const CoventGardenRaw = LondonRaw.filter(d=>d.place=='Covent Garden').map(d=>({...d, origin: 'covent garden'}));
const DruryLaneRaw = LondonRaw.filter(d=>d.place=='Drury Lane').map(d=>({...d, origin: 'drury lane'}));
const nolaCsv   = await FileAttachment("data/new_orleans/new_o_frequent_performances.csv").csv({typed: false});


// ==============================
// 2) Helpers
// ==============================
function normKey(k){ return String(k||"").trim().toLowerCase().replace(/\s+/g," "); }

// ==============================
// 3) Normalize datasets
// ==============================
const Danish = DanishRaw.map((perf, i) => {
  const d = asDate(perf.date);
  const works = perf.production?.works ?? [];
  const titleFromWorks = works.map(w => w.title).filter(Boolean).join("; ");
  return {
    id: typeof perf.id === "string" ? perf.id : `Danish-${i}`,
    date: d, year: d ? d.getUTCFullYear() : null,
    title: titleFromWorks || perf.formatted_title.slice(0, perf.formatted_title.indexOf(' by The Royal Danish')) || perf.production?.formatted_title.slice(0, perf.formatted_title.indexOf(' by The Royal Danish')) || "Untitled",
    origin: "danish",
    theater: perf.place?.name ?? perf.theater ?? perf.venue ?? "Unknown venue",
    city: perf.place?.name ?? null
  };
}).filter(d => d.date);

const French = FrenchRaw.map((r,i) => {
  const d = asDate(r.date ?? r.startDate ?? r.start_date);
  return {
    id: r.id ?? `French-${i}`,
    date: d, year: d ? d.getUTCFullYear() : (r.year ?? null),
    title: r.title ?? r.headline ?? r.playTitle ?? r.production?.formatted_title ?? "Untitled",
    origin: "french",
    theater: r.place?.name ?? r.place ?? r.theater ?? r.venue ?? "Unknown venue",
    city: r.city ?? r.place ?? null
  };
}).filter(d => d.date);

const Dutch = DutchRaw.map((r,i) => {
  const d = asDate(r.date ?? r.Date ?? r.performance_date ?? r.start_date);
  return {
    id: r.id ?? r.ID ?? `Dutch-${i}`,
    date: d, year: d ? d.getUTCFullYear() : (r.year ?? r.Year ?? null),
    title: r.title ?? r.Title ?? r.play ?? r.Play ?? "Untitled",
    origin: "dutch",
    theater: r.theater ?? r.Theater ?? r.venue ?? r.Venue ?? r.place ?? r.Place ?? "Unknown venue",
    city: r.city ?? r.City ?? null
  };
}).filter(d => d.date);

const SaintDomingue = SaintDomingueRaw.map((r,i) => {
  const d = asDate(r.date ?? r.Date ?? r.performance_date ?? r.start_date);
  return {
    id: r.id ?? r.ID ?? `Saint-Domingue-${i}`,
    date: d, year: d ? d.getUTCFullYear() : (r.year ?? r.Year ?? null),
    title: r.title ?? r.Title ?? r.play ?? r.Play ?? "Untitled",
    origin: "saint-domingue",
    theater: r.theater ?? r.Theater ?? r.venue ?? r.Venue ?? r.place ?? r.Place ?? "Unknown venue",
    city: r.city ?? r.City ?? null
  };
}).filter(d => d.date);

const CoventGarden = CoventGardenRaw.map((r,i) => {
  const d = asDate(r.date ?? r.Date ?? r.performance_date ?? r.start_date);
  return {
    id: r.id ?? r.ID ?? `Covent-Garden-${i}`,
    date: d, year: d ? d.getUTCFullYear() : (r.year ?? r.Year ?? null),
    title: r.title ?? r.Title ?? r.play ?? r.Play ?? "Untitled",
    origin: "covent garden",
    theater: r.theater ?? r.Theater ?? r.venue ?? r.Venue ?? r.place ?? r.Place ?? "Unknown venue",
    city: r.city ?? r.City ?? null
  };
}).filter(d => d.date);

const DruryLane = DruryLaneRaw.map((r,i) => {
  const d = asDate(r.date ?? r.Date ?? r.performance_date ?? r.start_date);
  return {
    id: r.id ?? r.ID ?? `Drury-Lane-${i}`,
    date: d, year: d ? d.getUTCFullYear() : (r.year ?? r.Year ?? null),
    title: r.title ?? r.Title ?? r.play ?? r.Play ?? "Untitled",
    origin: "drury lane",
    theater: r.theater ?? r.Theater ?? r.venue ?? r.Venue ?? r.place ?? r.Place ?? "Unknown venue",
    city: r.city ?? r.City ?? null
  };
}).filter(d => d.date);

const nolaRows = nolaCsv.map(obj => { const out = {}; for (const k of Object.keys(obj)) out[normKey(k)] = obj[k]; return out; });
const nola = nolaRows.map((r,i) => {
  const d = asDate(r["date of performance"] ?? r["date"]);
  return {
    id: r["issue #"] ?? `nola-${i}`,
    date: d, year: d ? d.getUTCFullYear() : (r["year"] ?? null),
    title: (r["works mentioned"] ?? "Untitled").trim(),
    origin: "new orleans",
    theater: (r["performance location"] ?? r["loc of ad"] ?? "Unknown venue").trim(),
    city: "New Orleans"
  };
}).filter(d => d.date);
// load the two layer genre file
const nolaGenres = await FileAttachment("data/new_orleans/genre_two_level_FIXED.csv").csv({ typed: true });

// ==============================
// 4) Combine and cap
//    - Danish / French / Dutch ≤ 1799-12-31
//    - New Orleans ≤ 1812-12-31
// ==============================
const CAP_NON_NOLA = Date.UTC(1799, 11, 31);
const CAP          = Date.UTC(1812, 11, 31);  // global max

const allRows = [
  ...Danish.filter(d => d.date <= CAP_NON_NOLA),
  ...French.filter(d => d.date <= CAP_NON_NOLA),
  ...Dutch.filter(d => d.date <= CAP_NON_NOLA),
  ...SaintDomingue.filter(d => d.date <= CAP_NON_NOLA),
  ...CoventGarden.filter(d => d.date <= CAP_NON_NOLA),
  ...DruryLane.filter(d => d.date <= CAP_NON_NOLA),
  ...nola.filter(d => d.date <= CAP)          // NOLA up to 1812
];

// Color map + legend colors (keys match origin values now)
const COLOR = new Map([
  ["danish",         color_map["danish"]],
  ["french",         color_map["french"]],
  ["dutch",          color_map["dutch"]],
  ["new orleans",    color_map["new orleans"]],
  ["saint-domingue", color_map["saint-domingue"]],
  ["covent garden",  color_map["covent garden"]],
  ["drury lane",     color_map["drury lane"]],
  ["teatro de la cruz", color_map["teatro de la cruz"]],
  ["teatro del principe", color_map["teatro del principe"]]
]);
try { for (const [k,c] of COLOR) ORIGIN_COLOR.set(k, c); } catch {}

// Summary text – only when calendar viz is active
if (calendar) {
  display(html`<div style="font:12px system-ui; margin:.25rem 0;">
    Number of Performances displayed per dataset (≤1799 Europe, ≤1812 New Orleans) —
    Danish: <b>${Danish.filter(d => d.date <= CAP_NON_NOLA).length}</b> ·
    French: <b>${French.filter(d => d.date <= CAP_NON_NOLA).length}</b> ·
    Dutch: <b>${Dutch.filter(d => d.date <= CAP_NON_NOLA).length}</b> ·
    New Orleans: <b>${nola.filter(d => d.date <= CAP).length}</b> ·
    total after cap: <b>${allRows.length}</b>
  </div>`);
} else {
  display(html`<span hidden></span>`);
}

// ==============================
// 5) Controls and mount points
//    👉 uses global start_date / end_date / origins
// ==============================

// // Calendar-specific controls only
// const modeIn       = Inputs.radio(["Month","Week","Day"], { label: "Calendar view", value: "Month" });
// const overlayIn    = Inputs.toggle({ label: "Overlay major events", value: true });
// const anchorIn     = Inputs.date({ label: "Date displayed", value: start_date });
// const includeNola  = Inputs.toggle({ label: "Include New Orleans (NOLA)", value: true });

// const nav = html`<div style="display:flex; gap:.5rem; align-items:center; margin:.25rem 0;">
//   <button id="prev">◀ Prev</button><button id="next">Next ▶</button>
// </div>`;

// // Dedicated mount nodes so we *replace* contents instead of appending
// const venuesMount = html`<div id="venues-mount"></div>`;
// const legendMount = html`<div id="legend-mount"></div>`;

// // Only render the controls card if calendar viz is active
// if (calendar) {
//   display(html`<div class="card" style="padding:.6rem; margin:.6rem 0;">
//     <div style="display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.6rem;">
//       <div>${anchorIn}</div><div>${nav}</div>
//       <div>${modeIn}</div><div>${overlayIn}</div>
//       <div style="grid-column:1/-1">${includeNola}</div>
//       <div style="grid-column:1/-1">${venuesMount}</div>
//       <div style="grid-column:1/-1">${legendMount}</div>
//     </div>
//   </div>`);
// }

// ==============================
// 6) Imperative render with global filters
// ==============================
injectCalendarStyles();

const CAL_ID = "calendar-colored";

// Calendar container only when calendar is active
if (calendar) {
  display(html`<div id="${CAL_ID}"></div>`);
} else {
  display(html`<span hidden></span>`);
}

function capDate(d){ return new Date(Math.min(+asDate(d), CAP)); }

function buildVenuesInput(startDate, endDate, originsList) {
  const opts = Array.from(new Set(
    allRows
      .filter(d => d.date >= startDate && d.date <= endDate && originsList.includes(d.origin))
      .map(d => d.theater)
      .filter(Boolean)
  )).sort();
  return Inputs.checkbox(opts, { label: "Venues", value: opts });
}

// Initial venues input, based on global filters
const initialOriginsBase = origins;
const initialOriginsList = includeNola.value
  ? [...initialOriginsBase, "new orleans"]
  : initialOriginsBase;

let venuesIn = buildVenuesInput(capDate(start_date), capDate(end_date), initialOriginsList);
if (calendar) {
  venuesMount.replaceChildren(venuesIn);
} else {
  venuesMount.replaceChildren();
  legendMount.replaceChildren();
}

function venuesValue() {
  const v = venuesIn.value;
  return Array.isArray(v) ? v : [];
}

function renderLegend(originsList) {
  const el = html`<div class="cal-legend">
    ${originsList.map(o => html`<span class="cal-key"><span class="cal-dot" style="background:${COLOR.get(o) || '#999'}"></span>${name_map[o] || o}</span>`)}
    <span class="cal-key"><span class="cal-dot" style="background:#dbeafe"></span>major event</span>
  </div>`;
  legendMount.replaceChildren(el);
}

function rerender() {
  if (!calendar) return; // don't do anything if calendar viz isn't active

  // Use global filters
  const start = capDate(start_date);
  const end   = capDate(end_date);

  const baseOrigins = origins;
  const originsList = includeNola.value
    ? [...baseOrigins, "new orleans"]
    : baseOrigins;

  const anchor = capDate(anchorIn.value || start);
  const mode   = modeIn.value;

  // rebuild venues when the available list changes
  const fresh = buildVenuesInput(start, end, originsList);
  const oldOpts = Array.from(venuesIn.options || []).map(x => x.textContent);
  const newOpts = Array.from(fresh.options || []).map(x => x.textContent);
  const changed = oldOpts.length !== newOpts.length || oldOpts.some((o,i)=>o!==newOpts[i]);
  if (changed) {
    const prevSelection = venuesValue();
    venuesIn = fresh;
    // try to preserve previous selection where possible
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

// Wire controls only when calendar viz is active
if (calendar) {
  [modeIn, overlayIn, anchorIn, includeNola].forEach(inp => {
    inp.addEventListener("input", rerender);
  });
  venuesIn.addEventListener("input", rerender);

  // Prev/Next
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

  // First render
  rerender();
}
```
```js
// -----------------------------
// NOLA Genre Bubble Chart
// -----------------------------

display(nolaBubble ? html`<h2>New Orleans Genre Bubble Chart</h2>` : html`<div></div>`);

if (nolaBubble) {
  function stripAccents(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function normalizeText(value) {
    return stripAccents(value)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[\/_,;:()]+/g, " ")
      .replace(/[-–—]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeOriginalGenre(value) {
    const text = normalizeText(value);
    if (!text) return "other";
    if (/(^|\s)opera(\s|$)|(^|\s)opere(\s|$)|lyrique/.test(text)) return "opera";
    if (/(^|\s)comedy(\s|$)|(^|\s)comedie(\s|$)|(^|\s)comedie ballet(\s|$)|(^|\s)comic(\s|$)|(^|\s)comique(\s|$)/.test(text)) return "comedy";
    if (/(^|\s)tragedy(\s|$)|(^|\s)tragedie(\s|$)|(^|\s)tragic(\s|$)/.test(text)) return "tragedy";
    if (/(^|\s)drame(\s|$)|(^|\s)drama(\s|$)/.test(text)) return "drame";
    if (/(^|\s)vaudeville(\s|$)|(^|\s)vaud(\s|$)|(^|\s)vaud\.(\s|$)/.test(text)) return "vaudeville";
    return text;
  }

  function getMainGenres(value) {
    const text = normalizeText(value);
    const genres = [];
    if (/\bcomedy\b|\bcomedie\b|\bcomedie ballet\b|\bcomic\b|\bcomique\b/.test(text)) genres.push("comedy");
    if (/\bopera\b|\bopera comique\b|\bopere\b|\blyrique\b/.test(text)) genres.push("opera");
    if (/\btragedy\b|\btragedie\b|\btragic\b/.test(text)) genres.push("tragedy");
    if (/\bdrame\b|\bdrama\b/.test(text)) genres.push("drame");
    if (/\bvaudeville\b|\bvaud\b/.test(text)) genres.push("vaudeville");
    return [...new Set(genres)].length ? [...new Set(genres)] : ["other"];
  }

  function formatLabel(value) {
    const text = String(value || "").trim();
    if (!text) return "Other";
    return text.split(" ").map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(" ");
  }

  const expandedData = nolaGenres.flatMap(d => {
    const mainGenres = getMainGenres(d.grouped_genre);
    const originalParents = getMainGenres(d.original_genre);
    const normalizedOriginal = normalizeOriginalGenre(d.original_genre);
    return mainGenres.map(main => ({
      work: d.work,
      year: d.year,
      original_genre: normalizedOriginal,
      original_genre_raw: d.original_genre,
      grouped_genre: d.grouped_genre,
      grouped_genre_normalized: normalizeText(d.grouped_genre),
      main_genre: main,
      original_parent_genres: originalParents
    }));
  });

  // --- Expand toggle ---
  const expandToggle = Inputs.toggle({ label: "Expand to specific genres", value: false });
  display(expandToggle);

  // --- Main chart render function (called on toggle change) ---
  const chartMount = html`<div></div>`;
  const tableMount = html`<div></div>`;
  const inspectMount = html`<div></div>`;
  display(chartMount);

  display(html`<h3>Subgenre breakdown</h3>`);
  display(tableMount);

  display(html`<h3>Inspect Works</h3>`);
  display(inspectMount);

  function renderBubble(expanded) {
    const hierarchyData = expanded
      ? {
          name: "genres",
          children: nolaSelectedGenres.map(main => {
            const rows = expandedData.filter(d => d.original_parent_genres.includes(main));
            const children = d3.rollups(
              rows.filter(d => d.original_genre && String(d.original_genre).trim() !== ""),
              v => v.length,
              d => d.original_genre
            )
              .map(([name, value]) => ({ name, value }))
              .sort((a, b) => d3.descending(a.value, b.value));
            return { name: main, children };
          }).filter(d => d.children.length > 0)
        }
      : {
          name: "genres",
          children: d3.rollups(
            expandedData.filter(d => nolaSelectedGenres.includes(d.main_genre)),
            v => v.length,
            d => d.main_genre
          )
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => d3.descending(a.value, b.value))
        };

    const root = d3.hierarchy(hierarchyData)
      .sum(d => d.value || 0)
      .sort((a, b) => b.value - a.value);

    const width = window.innerWidth * 0.9;
    const height = 760;
    const pack = d3.pack().size([width, height]).padding(10);
    const packed = pack(root);
    const leaves = packed.leaves();

    const color = d3.scaleOrdinal().domain(nolaMainGenres).range(d3.schemeTableau10);

    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .style("max-width", "100%")
      .style("height", "auto")
      .style("font-family", "sans-serif");

    const node = svg.selectAll("g").data(leaves).join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => {
        const p = d.ancestors().find(a => a.depth === 1);
        return color(p ? p.data.name : d.data.name);
      })
      .attr("fill-opacity", expanded ? 0.75 : 0.9)
      .attr("stroke", "#333")
      .attr("stroke-width", 1);

    node.append("title").text(d => {
      const parent = d.parent?.data?.name;
      if (expanded && parent) {
        return `Main category: ${formatLabel(parent)}\nOriginal genre: ${formatLabel(d.data.name)}\nWorks: ${d.value}`;
      }
      return `Main category: ${formatLabel(d.data.name)}\nWorks: ${d.value}`;
    });

    node.append("text").selectAll("tspan")
      .data(d => {
        if (d.r < 22) return [];
        const label = formatLabel(d.data.name);
        const words = label.split(/\s+/);
        const lines = [];
        const maxChars = Math.max(8, Math.floor(d.r / 3));
        let line = "";
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (test.length <= maxChars) { line = test; }
          else { if (line) lines.push(line); line = word; }
        }
        if (line) lines.push(line);
        return [...lines.slice(0, 2), String(d.value)];
      })
      .join("tspan")
      .attr("x", 0)
      .attr("y", (d, i, nodes) => `${(i - (nodes.length - 1) / 2) * 1.1}em`)
      .attr("text-anchor", "middle")
      .attr("font-size", d => d.r < 40 ? 10 : 12)
      .attr("fill", "#111")
      .text(d => d);

    chartMount.replaceChildren(svg.node());

    // --- Summary table ---
    const summaryTable = expanded
      ? nolaSelectedGenres.flatMap(main => {
          const rows = expandedData.filter(d => d.original_parent_genres.includes(main));
          return d3.rollups(
            rows.filter(d => d.original_genre && String(d.original_genre).trim() !== ""),
            v => v.length,
            d => d.original_genre
          )
            .map(([subgenre, works]) => ({ main_genre: formatLabel(main), subgenre: formatLabel(subgenre), works }))
            .sort((a, b) => d3.descending(a.works, b.works));
        })
      : d3.rollups(
          expandedData.filter(d => nolaSelectedGenres.includes(d.main_genre)),
          v => v.length,
          d => d.main_genre
        )
          .map(([main_genre, works]) => ({ main_genre: formatLabel(main_genre), works }))
          .sort((a, b) => d3.descending(a.works, b.works));

    tableMount.replaceChildren(Inputs.table(summaryTable));

    // --- Inspect works selector ---
    const selectOptions = nolaSelectedGenres.length > 0 ? nolaSelectedGenres : ["None selected"];
    const genreSelect = Inputs.select(selectOptions, {
      label: "Inspect works in main category:",
      value: selectOptions.includes("comedy") ? "comedy" : selectOptions[0],
      format: d => formatLabel(d)
    });

    function renderInspectTable(selectedMainGenre) {
      const filteredWorks = expandedData
        .filter(d => expanded
          ? d.original_parent_genres.includes(selectedMainGenre)
          : d.main_genre === selectedMainGenre)
        .map(d => ({
          work: d.work,
          year: d.year,
          main_genre: expanded
            ? d.original_parent_genres.map(formatLabel).join(", ")
            : formatLabel(d.main_genre),
          grouped_genre: d.grouped_genre,
          original_genre: formatLabel(d.original_genre)
        }));
      worksTableMount.replaceChildren(Inputs.table(filteredWorks));
    }

    const worksTableMount = html`<div></div>`;
    genreSelect.addEventListener("input", () => renderInspectTable(genreSelect.value));
    inspectMount.replaceChildren(genreSelect, worksTableMount);
    renderInspectTable(genreSelect.value);
  }

  // Initial render
  renderBubble(expandToggle.value);

  // Re-render when toggle changes
  expandToggle.addEventListener("input", () => renderBubble(expandToggle.value));
}
```
