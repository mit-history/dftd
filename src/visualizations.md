---
theme: dashboard
title: French, Dutch and Danish theater visualizations
layout: sidebar
toc: True
---

# French, Dutch and Danish theater Visualizations

<div style="margin-top: 8%;"></div>

## select country

```js
const dataset = view(
  Inputs.select(["All", "French", "Danish", "Dutch"], {
    label: "Choose dataset",
    value: "French",
  })
);
```

```js
// Load all three datasets
const French = await FileAttachment("data/french-performances.json").json();
const Danish = await FileAttachment("data/danish-performances.csv").csv({
  typed: true,
});
const Dutch = await FileAttachment("data/dutch-performances.csv").csv({
  typed: true,
});
```


```js
// Choose dataset based on selection
const rawData =
  dataset === "French"
    ? French.map(d => ({ ...d, group: "French" }))
    : dataset === "Danish"
    ? Danish.map(d => ({ ...d, group: "Danish" }))
    : dataset === "Dutch"
    ? Dutch.map(d => ({ ...d, group: "Dutch" }))
    : [...French.map(d => ({ ...d, group: "French" })),
        ...Danish.map(d => ({ ...d, group: "Danish" })),
        ...Dutch.map(d => ({ ...d, group: "Dutch" })),
      ];

```

## select genre

```js
const genre = view(
  Inputs.select(
    [
      "All genres",
      ...Array.from(
        new Set(rawData.map((d) => d.genre).filter(Boolean))
      ).sort(),
    ],
    { label: "Filter by genre", value: "All genres" }
  )
);
```

```js
// Apply genre filter if selected
const data =
  genre === "All genres" ? rawData : rawData.filter((d) => d.genre === genre);
```

**Showing:** ${dataset} dataset ${genre !== "All genres" ? "filtered by genre: " + genre : "(all genres)"}.

<div style="margin-top: 10%;"></div>



### Dataset Summary
${summaryStats}

<div style="margin-top: 10%;"></div>



## Animated Line Chart of Days with Performances

<div id="chart-container"></div>

```js
import {
  createAnimatedLineChart,
  createMultipleAnimatedLines,
  createHeatmap,
} from "./components/barchart.js";

// sort by year first for ltr visualization
data.sort((a, b) => a.year - b.year);

summaryStats = (() => {
  function countUniqueDays(data) {
    return new Set(
      data.map((d) => {
        const raw = d.performance_date || d.date;
        const dateObj = new Date(raw);
        return dateObj.toISOString().split("T")[0];
      })
    ).size;
  }

  if (dataset === "All") {
    const breakdown = [
      { label: "🇫🇷 French", data: French },
      { label: "🇩🇰 Danish", data: Danish },
      { label: "🇳🇱 Dutch", data: Dutch },
    ].map(({ label, data }) => {
      const filtered = genre === "All genres" ? data : data.filter((d) => d.genre === genre);
      return {
        label,
        performances: filtered.length,
        days: countUniqueDays(filtered),
      };
    });

    const totalPerformances = breakdown.reduce((sum, d) => sum + d.performances, 0);
    const totalDays = breakdown.reduce((sum, d) => sum + d.days, 0);

    return html`<div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 16px;">
      ${breakdown.map(d => html`<div>${d.label}: ${d.performances} performances | ${d.days} unique days</div>`)}
      <hr style="margin: 10px auto; width: 60%;" />
      <div>Total: ${totalPerformances} performances | ${totalDays} unique days</div>
    </div>`;
  }

  const total = data.length;
  const unique = countUniqueDays(data);

  return html`<div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 16px;">
    Total Performances: ${total} | Unique Days Performed: ${unique}
  </div>`;
})();



const frenchData = summarize(French, "French");
const danishData = summarize(Danish, "Danish");
const dutchData = summarize(Dutch, "Dutch");


const chart = display(
  dataset === "All"
    ? createMultipleAnimatedLines([frenchData, danishData, dutchData], { height: 500 })
    : createAnimatedLineChart(data, { height: 500 })
);

```

<details>
  <summary style="cursor: pointer; font-weight: bold; color: #1c7ed6;">
    🔍 Click to show explanation
  </summary>
  <p>
    +INSERT CONTEXTUAL INFORMATION
  </p>
</details>



<!-- spacing between charts -->
<div style="margin-top: 10%;"></div>

## Heatmap of Days with Performances
```js
const heatmap = display(createHeatmap(data, { width: 900, height: 600 }));
```

<details>
  <summary style="cursor: pointer; font-weight: bold; color: #1c7ed6;">
    🔍 Click to show explanation
  </summary>
  <p>
    INSERT CONTEXTUAL INFORMATION HERE
  </p>
</details>


<div id="map-container"></div>
