---
theme: dashboard
title: combined dashboard
toc: false
---

```js
const danish_data = FileAttachment("data/danish-performances.csv").csv({typed: true});
const french_data = FileAttachment("data/french-performances.json").json();
const dutch_data = FileAttachment("data/dutch-performances.csv").csv({typed: true});
```

```js
function yearChart(data) {
  return Plot.plot({
    title: "Performances by year",
    x: {label: "Year"},
    y: {grid: true, label: "Performances"},
    width: 1000,
    marks: [
      Plot.barY(data, Plot.groupX({y: "count"}, {x: "year", fill: "year"})),
      Plot.ruleY([0])
    ]
  });
}
```

# Danish Performances, 1748-1778

```js
display(yearChart(danish_data))
```

# French Performances, 1748-1778

```js
display(yearChart(french_data))
```

# Dutch Performances, 1748-1778

```js
display(yearChart(dutch_data))
```

# Comparative Performances, 1748-1778

```js
const combined_data = danish_data
    .map(d => ({...d, origin: "danish"}))
    .concat(french_data.map(d => ({...d, origin: "french"})))
    .map(d => ({...d, year: String(d.year)}))
    .concat(dutch_data.map(d => ({...d, origin: "dutch"})))
    .map(d => ({...d, year: String(d.year)}));
```

```js
function compareYearsChart(data) {
  return Plot.plot({
    title: "Compare performances per year",
    fx: {padding: 0, label: null},
    x: {axis: null, paddingOuter: 0.2},
    y: {grid: true, label: "Performances"},
    color: {legend: true},
    width: 1000,
    marks: [
      Plot.barY(data, Plot.groupX({y2: "count"}, {x: "origin", fx: "year", fill: "origin", tip: true})),
      Plot.ruleY([0])
    ]
  });
}

display(compareYearsChart(combined_data))
```