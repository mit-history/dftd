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
  author === "No author selected" ? undefined : formatted_data.filter((d) => d.author === author || d.author?.includes(author));
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
display(author_data.length > 0 ? percentageYearsChart(author_data) : html`<i>No data.</i>`)
```

```js
function percentageYearsChart(data) {
  return Plot.plot({
    title: `Percentage of performances per year of works by ${author}, ${start_date.getFullYear()} - ${end_date.getFullYear()}`,
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
const paris = {latitude: 48.856667, longitude: 2.352222}
const copenhagen = {latitude: 55.676111, longitude: 12.568333}
const amsterdam = {latitude: 52.372778, longitude: 4.893611}

const author_counts = author_filtered_data ? Object.entries(author_filtered_data.reduce((acc, d) => {
  acc[d.origin] = (acc[d.origin] || 0) + 1;
  return acc;
}, {})).map(([origin, count]) => {
  const coordinates = { 
    danish: copenhagen,
    dutch: amsterdam,
    french: paris
  }[origin];
  return { origin, count, ...coordinates };
}) : undefined;
```

```js
const world = FileAttachment("data/countries-110m.json").json()
```

```js
const circle = d3.geoCircle().center([7, 50]).radius(10).precision(2)()
const land = topojson.feature(world, world.objects.land)
```

```js
function mapPlot(data) {
  return Plot.plot({
    title: `Total number of performances of works by ${author}, ${start_date.getFullYear()} - ${end_date.getFullYear()}`,
    projection: {
      type: "azimuthal-equidistant",
      rotate: [-7, -50],
      domain: circle,
      inset: 10
    },
    marks: [
      Plot.graticule(),
      Plot.geo(land, {fill: "currentColor", fillOpacity: 0.3}),
      Plot.dot(data, {
        x: "longitude", 
        y: "latitude", 
        r: "count", 
        stroke: "red", 
        fill: "red", 
        fillOpacity: 0.2, 
        channels: {origin: "origin"},
        tip: {
          format: {
            x: false,
            y: false,
            origin: true,
            count: true,
          }
        }
      }),
      Plot.frame()
    ]
  })
}
```

```js
display(author_counts ? mapPlot(author_counts) : html`<i>No data.</i>`)
```