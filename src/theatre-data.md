---
theme: dashboard
title: theatre dashboard
toc: false
---

```js
const theatre = FileAttachment("data/danish-performances.csv").csv({typed: true});
```

# Danish Performances, 1748-1778

```js
Inputs.table(theatre)
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