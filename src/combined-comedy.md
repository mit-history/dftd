---
theme: dashboard
title: Comedy Performances
toc: true
---

# Comedy Performance Dates 

The following graphs show number of comedy performances per year.

```js
import { filterComedyPerformances } from "./components/comedyCharts.js"; // [Added]

const danish_data = FileAttachment("data/danish-performances.csv").csv({
  typed: true,
});
const french_data = FileAttachment("data/french-performances.json").json();
```

```js
// Yearly Performance Chart Function
function yearChart(data) {
  return Plot.plot({
    title: "Performances by year",
    x: { label: "Year" },
    y: { grid: true, label: "Performances" },
    width: 1000,
    marks: [
      Plot.barY(data, Plot.groupX({ y: "count" }, { x: "year" })),
      Plot.ruleY([0]),
    ],
  });
}
```

# Danish Comedy Performances, 1748-1778

```js
const danish_comedy = danish_data.filter(
  (d) =>
    d.genre &&
    (d.genre.toLowerCase().includes("comed") ||
      d.genre.toLowerCase().includes("coméd"))
);
display(yearChart(danish_comedy));
```

# French Comedy Performances, 1748-1778

```js
const french_comedy = filterComedyPerformances(french_data);
display(yearChart(french_comedy));
```

# Comparative Comedy Performances, 1748-1778

```js
function compareYearsChart(data) {
  return Plot.plot({
    title: "Compare performances per year",
    fx: { padding: 0, label: null },
    x: { axis: null, paddingOuter: 0.2 },
    y: { grid: true, label: "Performances" },
    color: { legend: true },
    width: 1000,
    marks: [
      Plot.barY(
        data,
        Plot.groupX(
          { y2: "count" },
          { x: "origin", fx: "year", fill: "origin" }
        )
      ),
      Plot.ruleY([0]),
    ],
  });
}
```

```js
const combined_comedy_data = danish_comedy
  .map((d) => ({ ...d, origin: "danish" }))
  .concat(french_comedy.map((d) => ({ ...d, origin: "french" })))
  .map((d) => ({ ...d, year: String(d.year) }));

display(compareYearsChart(combined_comedy_data));
```
