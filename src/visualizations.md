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
viewof genres = Inputs.selectMultiple(
  Array.from(new Set(rawData.map(d => d.genre).filter(Boolean))).sort(),
  { label: "Filter by genres", value: [] }
)
```

## select time period
```js
viewof start_date = Inputs.date({ label: "Start date", value: new Date("1748-01-01") })
viewof end_date = Inputs.date({ label: "End date", value: new Date("1778-12-31") })
```


```js
// Apply genre filter if selected
const data = genres.length === 0
  ? rawData
  : rawData.filter(d => genres.includes(d.genre));

const data = genreFiltered.filter(d => {
  const date = new Date(d.performance_date || d.date);
  return date >= start_date && date <= end_date;
```



```js
md`**Showing:** ${dataset} dataset ${genres.length > 0 ? `filtered by genres: ${genres.join(", ")}` : "(all genres)"}.`
```

md`**Showing:** ${dataset} dataset from ${start_date.toDateString()} to ${end_date.toDateString()}, ${genres.length > 0 ? `filtered by genres: ${genres.join(", ")}` : "(all genres)"}.`


<!-- stats graphic -->

<!-- // Count total performances and total unique performance days -->
const totalPerformances = data.length;

const uniqueDates = new Set(data.map(d => d.performance_date || d.date));
const totalDaysPerformed = uniqueDates.size;

md`### 🎭 Summary
- **Total Performances:** ${totalPerformances.toLocaleString()}
- **Total Days Performed On:** ${totalDaysPerformed.toLocaleString()}`


## visualizations

```js
import { createAnimatedLineChart, createHeatmap } from "../../src/components/barchart.js";

viewof chart = createAnimatedLineChart(data, { height: 500 });
```

```js
viewof heatmap = createHeatmap(data, { width: 900, height: 600 });
```
