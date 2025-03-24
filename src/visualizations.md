---
theme: dashboard
title: French, Dutch and Danish theater visualizations
layout: sidebar
toc: True
---

```js
import {viewof dataset} from "./components/visualizations.js"
const dataset = Generators.input(viewof dataset)
```
## testing dataset 2


<!-- styling -->

<style>
  .tab-bar {
    display: flex;
    gap: 10px;
    margin: 10px 0 20px 0;
  }

  .tab-button {
    padding: 8px 16px;
    border: 1px solid #ccc;
    background-color: #f4f4f4;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    color: #333;
    transition: all 0.2s ease;
  }

  .tab-button.active {
    background-color: #ffffff;
    border-bottom: 2px solid white;
    color: #1c7ed6;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  }
</style>


# French + Dutch + Danish Theater visualizations!

<!-- ## Total Performances by Database from 1748-1778 -->


<!-- choosing dataset -->

```js
viewof dataset
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

## Animated Line Chart

<div id="chart-container"></div>

```js
import {
  createAnimatedLineChart,
  createHeatmap,
} from "./components/barchart.js";

// sort data by year first
data.sort((a, b) => a.year - b.year);

const chart = display(createAnimatedLineChart(data, { height: 500 }));
```


## Heatmap of Daily Performances

```js
const heatmap = display(createHeatmap(data, { width: 900, height: 600 }));
```
<div id="map-container"></div>
