---
theme: dashboard
title: French, Dutch and Danish theater visualizations
layout: sidebar
toc: True
---

```js
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
```

# French, Dutch and Danish theater Visualizations

<div style="margin-top: 8%;"></div>

## select country and time period

```js
const dataset = view(
  Inputs.select(["All", "French", "Danish", "Dutch"], {
    label: "Choose dataset",
    value: "French",
  })
);
```

```js
// Load all three datasets
const French = await FileAttachment("data/french-performances.json").json();
const Danish = await FileAttachment("data/danish-performances.csv").csv({
  typed: true,
});
const Dutch = await FileAttachment("data/dutch-performances.csv").csv({
  typed: true,
});
```


```js
// Choose dataset based on selection
const rawData =
  dataset === "French"
    ? French.map(d => ({ ...d, group: "French" }))
    : dataset === "Danish"
    ? Danish.map(d => ({ ...d, group: "Danish" }))
    : dataset === "Dutch"
    ? Dutch.map(d => ({ ...d, group: "Dutch" }))
    : [...French.map(d => ({ ...d, group: "French" })),
        ...Danish.map(d => ({ ...d, group: "Danish" })),
        ...Dutch.map(d => ({ ...d, group: "Dutch" })),
      ];
```

```js
const start_date = view(Inputs.date({label: "Start", value: "1748-01-01"}));
const end_date = view(Inputs.date({label: "End", value: "1778-12-31"}));
```

## select genre

```js
const genres = view(
  Inputs.checkbox(
    Array.from(new Set(rawData.map((d) => d.genre).filter(Boolean))).sort(),
    {
      label: "Select genre(s)",
      value: [], // default: all
    }
  )
);
```

```js
// Apply genre and/or date filters if selected
const dateFiltered = rawData.filter(d => {
  const date = new Date(d.date || d.performance_date);
  return date >= start_date && date <= end_date;
});

const data =
  genres.length === 0
    ? dateFiltered
    : dateFiltered.filter((d) => genres.includes(d.genre));


```



**Showing:** ${dataset} dataset
${genres.length > 0 ? "filtered by genre(s): " + genres.join(", ") : "(all genres)"}
from ${start_date.toISOString().slice(0, 10)} to ${end_date.toISOString().slice(0, 10)}.


<div style="margin-top: 10%;"></div>




## Animated Line Chart and Heatmap of Days with Performances

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
data.sort((a, b) => a.year - b.year);

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

const frenchData = summarize(French, "French");
const danishData = summarize(Danish, "Danish");
const dutchData = summarize(Dutch, "Dutch");

// clear old charts
document.getElementById("line-chart-container").innerHTML = "";
document.getElementById("heatmap-container").innerHTML = "";

document.getElementById("line-chart-container").append(
  dataset === "All"
    ? createMultipleAnimatedLines([frenchData, danishData, dutchData], { width: 700, height: 600 })
    : createAnimatedLineChart(data, { width: 700, height: 600 })
);

document.getElementById("heatmap-container").append(
  createHeatmap(data, { width: 700, height: 600 })
);

```

<details>
  <summary style="cursor: pointer; font-weight: bold; color: #1c7ed6;">
    🔍 Click to show explanation
  </summary>
  <p>
    +INSERT CONTEXTUAL INFORMATION
  </p>
</details>



<!-- spacing between charts -->
<div style="margin-top: 10%;"></div>

