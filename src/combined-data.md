---
theme: dashboard
title: Performances
toc: false
---

# Performance Dates 

The following graphs show number of performance days per year.

```js
const danish_data = FileAttachment("data/danish-performances.csv").csv({
  typed: true,
});
const french_data = FileAttachment("data/french-performances.json").json();
const dutch_data = FileAttachment("data/dutch-performances.csv").csv({typed: true});
```

```js
// Yearly Performance Chart Function
function yearChart(data) {
  return Plot.plot({
    title: "Performances by year",
    x: { label: "Year" },
    y: { grid: true, label: "Performances", domain: [0, 366] },
    width: 1000,
    marks: [
      Plot.barY(data, Plot.groupX({ y: "count" }, { x: "year" })),
      Plot.ruleY([0]),
    ],
  });
}
```

## Danish Performances, 1748-1778

```js
display(yearChart(danish_data));
```

## French Performances, 1748-1778

```js
display(yearChart(french_data));
```

## Dutch Performances, 1748-1778

```js
display(yearChart(dutch_data))
```

## Comparative Performances, 1748-1778

```js
const combined_data = danish_data
    .map(d => ({...d, origin: "danish"}))
    .concat(french_data.map(d => ({...d, origin: "french"})))
    .map(d => ({...d, year: String(d.year)}))
    .concat(dutch_data.map(d => ({...d, origin: "dutch"})))
    .map(d => ({...d, year: String(d.year)}));
```

```js
const start_date = view(Inputs.date({label: "Start", value: "1748-01-01"}));
const end_date = view(Inputs.date({label: "End", value: "1778-12-31"}));
```

```js
const origins = view(Inputs.checkbox(["danish", "dutch", "french"], {label: "Origin", value: ["danish", "dutch", "french"]}));
```

```js
const formatted_data = combined_data.filter(d => (new Date(d.date) > start_date) && (new Date(d.date) <= end_date) && origins.includes(d.origin));
```

```js
function compareYearsChart(data) {
  return Plot.plot({
    title: "Compare performances per year",
    fx: { padding: 0, label: null },
    x: { axis: null, paddingOuter: 0.2 },
    y: { grid: true, label: "Performances", domain: [0, 366] },
    color: { legend: true },
    width: 1000,
    marks: [
      Plot.barY(data, Plot.groupX({y2: "count"}, {x: "origin", fx: "year", fill: "origin", tip: true})),
      Plot.ruleY([0])
    ]
  });
}

display(formatted_data.length > 0 ? compareYearsChart(formatted_data) : html`<i>No data.</i>`)
```