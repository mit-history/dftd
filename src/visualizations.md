---
theme: dashboard
title: French, Dutch and Danish theater visualizations
layout: sidebar
toc: True
---

# French + Dutch + Danish Theater visualizations!

## Total Performances by Database from 1748-1778

```js
const dataset = view(
  Inputs.select(["french", "danish", "dutch"], {
    label: "Choose dataset",
    value: "french",
  })
);
```

```js
// Load all three datasets
const french = await FileAttachment("data/french-performances.json").json();
const danish = await FileAttachment("data/danish-performances.csv").csv({
  typed: true,
});
const dutch = await FileAttachment("data/dutch-performances.csv").csv({
  typed: true,
});
```

```js
// Choose dataset based on selection
const rawData =
  dataset === "french"
    ? french
    : dataset === "danish"
    ? danish
    : dataset === "dutch"
    ? dutch
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

## visualizations

<div id="chart-container"></div>

```js
import {
  createAnimatedLineChart,
  createHeatmap,
} from "./components/barchart.js";

const chart = display(createAnimatedLineChart(data, { height: 500 }));
```

```js
const heatmap = display(createHeatmap(data, { width: 900, height: 600 }));
```

<div id="map-container"></div>
