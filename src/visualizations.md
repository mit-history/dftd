---
theme: dashboard
title: French, Dutch and Danish theater visualizations
layout: sidebar
toc: True
---

# Theater visualizations!

## select country

```js
const dataset = view(
  Inputs.select(["French", "Danish", "Dutch"], {
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
    : null;
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

## Animated Line Chart

<div id="chart-container"></div>

```js
import {
  createAnimatedLineChart,
  createHeatmap,
} from "./components/barchart.js";

// sort by year first for ltr visualization
data.sort((a, b) => a.year - b.year);

const chart = display(createAnimatedLineChart(data, { height: 500 }));
```

<!-- spacing between charts -->
<div style="margin-top: 50px;"></div>

## Heatmap of Days with Performances
```js
const heatmap = display(createHeatmap(data, { width: 900, height: 600 }));
```

<div id="map-container"></div>
