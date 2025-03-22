---
theme: dashboard
title: French, Dutch and Danish theater visualizations
layout: sidebar
toc: True
---

# French + Dutch + Danish Theater visualizations!

## Total Performances by Database from 1748-1778


```js
viewof dataset = Inputs.select(["french", "danish", "dutch"], { label: "Choose dataset", value: "french" })
```

```js
// Load all three datasets
const french = await FileAttachment("data/french-performances.json").json();
const danish = await FileAttachment("data/danish-performances.csv").csv({ typed: true });
const dutch = await FileAttachment("data/dutch-performances.csv").csv({ typed: true });
```

```js
// Choose dataset based on selection
const rawData = {
  if (dataset === "french") return french;
  if (dataset === "danish") return danish;
  if (dataset === "dutch") return dutch;
}
```

## select genre

```js
viewof genre = Inputs.select(
  ["All genres", ...Array.from(new Set(rawData.map(d => d.genre).filter(Boolean))).sort()],
  { label: "Filter by genre", value: "All genres" }
)
```

```js
// Apply genre filter if selected
const data = genre === "All genres" ? rawData : rawData.filter(d => d.genre === genre);
```

```js
md`**Showing:** ${dataset} dataset ${genre !== "All genres" ? "filtered by genre: " + genre : "(all genres)"}.`
```

## visualizations

```js
import { createAnimatedLineChart, createHeatmap } from "../../src/components/barchart.js";

viewof chart = createAnimatedLineChart(data, { height: 500 });
```

```js
viewof heatmap = createHeatmap(data, { width: 900, height: 600 });
```
