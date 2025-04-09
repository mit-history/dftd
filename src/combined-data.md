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
```js
// view(Inputs.table(combined_data));
```

```js
const author = view(
  Inputs.select([
    "No author selected",
    ...Array.from(
      new Set([
        ...french_data.map((d) => d.author.split(" ; ")).flat().filter(Boolean),
        ...danish_data.map((d) => d.author?.split(",")).flat().filter(Boolean),
        ...dutch_data.map((d) => d.author).filter(Boolean),
      ])
    ).sort(),
    { label: "Filter by author", value: "No author selected" }
  ])
);
```

```js
// Apply filter
const author_filtered_data =
  author === "No author selected" ? undefined : combined_data.filter((d) => d.author === author || d.author?.includes(author));
```

```js
const author_data_combined = author_filtered_data ? author_filtered_data .map((d, i, arr) => {
    const total = combined_data.filter(f => f.year === d.year && f.origin === d.origin).reduce((a, b) => a + 1, 0);
    const author = arr.filter(f => f.year === d.year && f.origin === d.origin).reduce((a, b) => a + 1, 0);
    return {year: d.year, origin: d.origin, percentage: (author / total) };
  }) : undefined;

const author_data = Array.from(new Set(author_data_combined?.map(JSON.stringify))).map(JSON.parse);
```

```js
// display(author_data ? Inputs.table(author_data) : html`<i>No data.</i>`)
```
```js
display(author_data ? percentageYearsChart(author_data) : html`<i>No data.</i>`)
```

```js
function percentageYearsChart(data) {
  return Plot.plot({
    title: `Compare percentage of performances per year of works by ${author}`,
    fx: { padding: 0, label: null },
    x: { axis: null, paddingOuter: 0.2 },
    y: { grid: true, label: "Percentage" },
    color: { legend: true },
    width: 1000,
    marks: [
      Plot.barY(data, {x: "origin", y: "percentage", fx: "year", fill: "origin", tip: true}),
      Plot.ruleY([0])
    ]
  });
}
```

```js
// const earthquakes = d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson").then(d => d.features.map(f => {
//   const c = d3.geoCentroid(f);
//   return {magnitude: f.properties.mag, longitude: c[0], latitude: c[1]};
// }))
```

```js
// const circle = d3.geoCircle().center([9, 34]).radius(26.3)()

// const world = FileAttachment("countries-110m.json").json()
// const land = topojson.feature(world, world.objects.land)

// Plot.plot({
//   projection: {type: "orthographic", rotate: [-2, -30]},
//   r: {transform: (d) => Math.pow(10, d)}, // convert Richter to amplitude
//   marks: [
//     Plot.geo(land, {fill: "currentColor", fillOpacity: 0.2}),
//     Plot.sphere(),
//     Plot.dot(earthquakes, {x: "longitude", y: "latitude", r: "magnitude", stroke: "red", fill: "red", fillOpacity: 0.2})
//   ]
// })
```