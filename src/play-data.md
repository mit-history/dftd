---
theme: dashboard
title: CFRP Play Data
toc: false
---

# Performances

**NOTE**: This data was truncated at 50,000 results and does not represent the full dataset.

<!-- Load and transform the data -->

```js
const plays = FileAttachment("play_data.csv").csv({typed: true});
```

```js
const searchResults = view(Inputs.search(plays, {
  placeholder: "Search plays"
}));

```

```js
const playsTable = view(Inputs.table(searchResults));

```
<!-- A shared color scale for consistency, sorted by the number of plays per genre -->

```js
const color = Plot.scale({
  color: {
    type: "categorical",
    domain: d3.groupSort(plays, (D) => -D.length, (d) => d.genre),
    unknown: "var(--theme-foreground-muted)"
  }
});
```

<!-- Plot of launch vehicles -->

```js
function genreChart(data, {width}) {
  return Plot.plot({
    title: "Genres",
    width,
    height: 300,
    marginTop: 0,
    marginLeft: 100,
    x: {grid: true, label: "Performances"},
    y: {label: null},
    color: {...color},
    marks: [
      Plot.rectX(data, Plot.groupY({x: "count"}, {y: "genre", fill: "genre", tip: true, sort: {y: "-x"}})),
      Plot.ruleX([0])
    ]
  });
}
```

## By Genre

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => genreChart(searchResults, {width}))}
  </div>
</div>

<!-- Genre vs number of acts -->

```js
function actsByGenre(data, {width}) {
  return Plot.plot({
    title: "Acts by Genre",
    width,
    height: 400,
    marginTop: 50,
    marginLeft: 100,
    x: {label: "Number of Acts"},
    y: {label: "Plays"},
    color: {...color},
    marks: [
      Plot.barY(data, Plot.groupX({ y: "count" }, { x: "act_number", fill: "genre", tip: true }))
    ]
  });
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => actsByGenre(searchResults, {width}))}
  </div>
</div>

<!-- Genre vs number of acts -->

```js
function daysByGenre(data, {width}) {
  return Plot.plot({
    title: "Days by Genre",
    width,
    height: 400,
    marginTop: 50,
    marginLeft: 100,
    x: {label: "Day of the Week"},
    y: {label: "Plays"},
    color: {...color},
    marks: [
      Plot.barY(data, Plot.groupX({ y: "count" }, { x: "jour", fill: "genre", tip: true }))
    ]
  });
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => daysByGenre(searchResults, {width}))}
  </div>
</div>