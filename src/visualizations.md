---
theme: dashboard
title: French, Dutch and Danish theater visualizations
layout: sidebar
toc: True
---

# French, Dutch and Danish theater Visualizations

<div style="margin-top: 8%;"></div>

## select country

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

## select genre

```js
const genre = view(
  Inputs.select(
    [
      "All genres",
      ...Array.from(
        new Set(rawData.map((d) => d.genre).filter(Boolean))
      ).sort(),
    ],
    { label: "Filter by genre", value: "All genres" }
  )
);
```

```js
// Apply genre filter if selected
const data =
  genre === "All genres" ? rawData : rawData.filter((d) => d.genre === genre);
```

**Showing:** ${dataset} dataset ${genre !== "All genres" ? "filtered by genre: " + genre : "(all genres)"}.

<div style="margin-top: 10%;"></div>


## Animated Line Chart of Days with Performances

<div id="chart-container"></div>

```js
import {
  createAnimatedLineChart,
  createMultipleAnimatedLines,
  createHeatmap,
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


const chart = display(
  dataset === "All"
    ? createMultipleAnimatedLines([frenchData, danishData, dutchData], { height: 500 })
    : createAnimatedLineChart(data, { height: 500 })
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

## Heatmap of Days with Performances
```js
const heatmap = display(createHeatmap(data, { width: 900, height: 600 }));
```

<details>
  <summary style="cursor: pointer; font-weight: bold; color: #1c7ed6;">
    🔍 Click to show explanation
  </summary>
  <p>
    INSERT CONTEXTUAL INFORMATION HERE
  </p>
</details>


<div id="map-container"></div>
