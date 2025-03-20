---
theme: dashboard
title: Year Filtering
toc: false
---

```js
import { filterComedyPerformances } from "./components/comedyCharts.js"; // [Added]

const danish_data_full = await FileAttachment(
  "data/danish-performances.csv"
).csv({
  typed: true,
});
const french_data_full = await FileAttachment(
  "data/french-performances.json"
).json();

const combined_data_full = danish_data_full
  .map((d) => ({ ...d, origin: "danish" }))
  .concat(french_data_full.map((d) => ({ ...d, origin: "french" })))
  .map((d) => ({ ...d, year: String(d.year) }));

const startYear = view(
  Inputs.range([1748, 1778], { label: "Start Year", step: 1, value: 1748 })
);
const endYear = view(
  Inputs.range([1748, 1778], { label: "End Year", step: 1, value: 1778 })
);

// const french_data = french_data_full.filter(
//   (play) => play.year >= startYear && play.year <= endYear
// );
// const danish_data = danish_data_full.filter(
//   (play) => play.year >= startYear && play.year <= endYear
// );

// console.log(startYear, endYear, french_data_full, french_data);
```

```js
const french_data = french_data_full.filter(
  (play) => play.year >= startYear && play.year <= endYear
);
const danish_data = danish_data_full.filter(
  (play) => play.year >= startYear && play.year <= endYear
);
const combined_data = combined_data_full.filter(
  (play) => play.year >= startYear && play.year <= endYear
);
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
      Plot.barY(data, Plot.groupX({ y: "count" }, { x: "year", fill: "year" })),
      Plot.ruleY([0]),
    ],
  });
}
```

# Danish Performances, 1748-1778

```js
display(yearChart(danish_data));
```

# French Performances, 1748-1778

```js
display(yearChart(french_data));
```

# Comparative Performances, 1748-1778

```js

```

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

display(compareYearsChart(combined_data));
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
const combined_comedy_data = danish_comedy
  .map((d) => ({ ...d, origin: "danish" }))
  .concat(french_comedy.map((d) => ({ ...d, origin: "french" })))
  .map((d) => ({ ...d, year: String(d.year) }));

display(compareYearsChart(combined_comedy_data));
```
