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
    ? French
    : dataset === "Danish"
    ? Danish
    : dataset === "Dutch"
    ? Dutch
    : [...French.map(d => ({ ...d, group: "French" })),
       ...Danish.map(d => ({ ...d, group: "Danish" })),
       ...Dutch.map(d => ({ ...d, group: "Dutch" }))];
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


## Animated Line Chart

<div id="chart-container"></div>

```js
import {
  createAnimatedLineChart,
  createHeatmap,
} from "./components/barchart.js";

// sort by year first for ltr visualization
data.sort((a, b) => a.year - b.year);

const chart = display(
  dataset === "All"
    ? createMultiLineChart(data, { height: 500 })
    : createAnimatedLineChart(data, { height: 500 })
);
```

<details>
  <summary style="cursor: pointer; font-weight: bold; color: #1c7ed6;">
    🔍 Click to show explanation
  </summary>
  <p>
    This animated line chart shows number of performance days across three countries from 1748–1778.
    Select a country and genre to explore different trends. INSERT CONTEXTUAL INFORMATION
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
    This visualization summarizes performance days across countries from 1748–1778 as a heatmap.
    INSERT CONTEXTUAL INFORMATION HERE
  </p>
</details>


<div id="map-container"></div>
