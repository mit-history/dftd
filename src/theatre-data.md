---
theme: dashboard
title: theatre dashboard
toc: false
---

```js
// import {pie} from "./components/theatre.js";
// import {format} from "./components/format.js";
```

```js
const theatre = FileAttachment("data/performances.csv").csv({typed: true});
```

# Performances, 1748-1778

```js
Inputs.table(theatre)
```

# Formatted


```js
// display(pie(theatre, {width:600, height: 600}))
```

```js
// const color = Plot.scale({
//   color: {
//     type: "categorical",
//     domain: d3.groupSort(formatted, (D) => -D.length, (d) => d.title),
//     unknown: "var(--theme-foreground-muted)"
//   }
// });
```

```js
function yearChart(data) {
  return Plot.plot({
    title: "Performances by year",
    x: {grid: true, label: "Year"},
    y: {label: "Performances"},
    width: 1000,
    // color: {...color},
    marks: [
      Plot.barY(data, Plot.groupX({y: "count"}, {x: "year", fill: "year"})),
      Plot.ruleY([0])
    ]
  });
}

display(yearChart(theatre))
```

```js
function genreChart(data) {
  return Plot.plot({
    title: "Genres",
    // width,
    // height: 300,
    marginTop: 0,
    marginLeft: 100,
    x: {grid: true, label: "Performances"},
    y: {label: null},
    // color: {...color},
    marks: [
      Plot.rectX(data, Plot.groupY({x: "count"}, {y: "genre", fill: "genre", tip: true, sort: {y: "-x"}})),
      Plot.ruleX([0])
    ]
  });
}

display(genreChart(theatre))
```

```js
function titleChart(data) {
  return Plot.plot({
    title: "Titles by frequency",
    // width,
    // height: 300,
    height: 5000,
    marginTop: 0,
    marginLeft: 100,
    x: {grid: true, label: "Performances"},
    y: {label: null},
    // color: {...color},
    marks: [
      Plot.rectX(data, Plot.groupY({x: "count"}, {y: "title", fill: "title", tip: true, sort: {y: "-x"}})),
      Plot.ruleX([0])
    ]
  });
}

display(titleChart(theatre))
```