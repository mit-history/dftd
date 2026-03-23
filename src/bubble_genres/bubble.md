# New Orleans Genre Bubble Chart

```js
import * as d3 from "npm:d3";
import * as Inputs from "npm:@observablehq/inputs";
```

```js
const data = await FileAttachment("data/new_orleans/genre_two_level_FIXED.csv").csv({typed: true});
```

```js
const MAIN_GENRES = ["drame", "tragedy", "comedy", "vaudeville", "opera", "other"];
```

```js
function stripAccents(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
```

```js
function normalizeText(value) {
  return stripAccents(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[\/_,;:()]+/g, " ")
    .replace(/[-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
```

```js
function normalizeOriginalGenre(value) {
  const text = normalizeText(value);

  if (!text) return "other";

  if (/(^|\s)opera(\s|$)|(^|\s)opere(\s|$)|lyrique/.test(text)) return "opera";
  if (/(^|\s)comedy(\s|$)|(^|\s)comedie(\s|$)|(^|\s)comedie ballet(\s|$)|(^|\s)comic(\s|$)|(^|\s)comique(\s|$)/.test(text)) return "comedy";
  if (/(^|\s)tragedy(\s|$)|(^|\s)tragedie(\s|$)|(^|\s)tragic(\s|$)/.test(text)) return "tragedy";
  if (/(^|\s)drame(\s|$)|(^|\s)drama(\s|$)/.test(text)) return "drame";
  if (/(^|\s)vaudeville(\s|$)|(^|\s)vaud(\s|$)|(^|\s)vaud\.(\s|$)/.test(text)) return "vaudeville";

  return text;
}
```

```js
function getMainGenres(value) {
  const text = normalizeText(value);
  const genres = [];

  if (
    /\bcomedy\b/.test(text) ||
    /\bcomedie\b/.test(text) ||
    /\bcomedie ballet\b/.test(text) ||
    /\bcomic\b/.test(text) ||
    /\bcomique\b/.test(text)
  ) {
    genres.push("comedy");
  }

  if (
    /\bopera\b/.test(text) ||
    /\bopera comique\b/.test(text) ||
    /\bopere\b/.test(text) ||
    /\blyrique\b/.test(text)
  ) {
    genres.push("opera");
  }

  if (
    /\btragedy\b/.test(text) ||
    /\btragedie\b/.test(text) ||
    /\btragic\b/.test(text)
  ) {
    genres.push("tragedy");
  }

  if (
    /\bdrame\b/.test(text) ||
    /\bdrama\b/.test(text)
  ) {
    genres.push("drame");
  }

  if (
    /\bvaudeville\b/.test(text) ||
    /\bvaud\b/.test(text)
  ) {
    genres.push("vaudeville");
  }

  return [...new Set(genres)].length ? [...new Set(genres)] : ["other"];
}
```

```js
function formatLabel(value) {
  const text = String(value || "").trim();
  if (!text) return "Other";
  return text
    .split(" ")
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(" ");
}
```

```js
const expandedData = data.flatMap(d => {
  const mainGenres = getMainGenres(d.grouped_genre);
  const originalParents = getMainGenres(d.original_genre);
  const normalizedOriginal = normalizeOriginalGenre(d.original_genre);

  return mainGenres.map(main => ({
    work: d.work,
    year: d.year,
    original_genre: normalizedOriginal,
    original_genre_raw: d.original_genre,
    grouped_genre: d.grouped_genre,
    grouped_genre_normalized: normalizeText(d.grouped_genre),
    main_genre: main,
    original_parent_genres: originalParents
  }));
});
```

```js
const expanded = view(
  Inputs.toggle({
    label: "Expand to specific genres",
    value: false
  })
);
```

```js
const hierarchyData = expanded
  ? {
      name: "genres",
      children: MAIN_GENRES.map(main => {
        const rows = expandedData.filter(d => d.original_parent_genres.includes(main));

        const children = d3.rollups(
          rows.filter(d => d.original_genre && String(d.original_genre).trim() !== ""),
          v => v.length,
          d => d.original_genre
        )
          .map(([name, value]) => ({name, value}))
          .sort((a, b) => d3.descending(a.value, b.value));

        return {name: main, children};
      }).filter(d => d.children.length > 0)
    }
  : {
      name: "genres",
      children: d3.rollups(
        expandedData,
        v => v.length,
        d => d.main_genre
      )
        .map(([name, value]) => ({name, value}))
        .sort((a, b) => d3.descending(a.value, b.value))
    };
```

```js
const root = d3.hierarchy(hierarchyData)
  .sum(d => d.value || 0)
  .sort((a, b) => b.value - a.value);
```

```js
const chart = (() => {
  const width = 980;
  const height = 760;

  const pack = d3.pack()
    .size([width, height])
    .padding(10);

  const packed = pack(root);
  const leaves = packed.leaves();

  const color = d3.scaleOrdinal()
    .domain(MAIN_GENRES)
    .range(d3.schemeTableau10);

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .style("max-width", "100%")
    .style("height", "auto")
    .style("font-family", "sans-serif")
    .style("background", "white");

  const node = svg.selectAll("g")
    .data(leaves)
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("circle")
    .attr("r", d => d.r)
    .attr("fill", d => {
      const parentAtDepth1 = d.ancestors().find(a => a.depth === 1);
      return color(parentAtDepth1 ? parentAtDepth1.data.name : d.data.name);
    })
    .attr("fill-opacity", expanded ? 0.75 : 0.9)
    .attr("stroke", "#333")
    .attr("stroke-width", 1);

  node.append("title")
  .text(d => {
    const parent = d.parent?.data?.name;

    if (expanded && parent) {
      return [
        `Main category: ${formatLabel(parent)}`,
        `Original genre: ${formatLabel(d.data.name)}`,
        `Works: ${d.value}`
      ].join("\n");
    }

    return [
      `Main category: ${formatLabel(d.data.name)}`,
      `Works: ${d.value}`
    ].join("\n");
  });

  node.append("text")
    .selectAll("tspan")
    .data(d => {
      if (d.r < 22) return [];

      const label = formatLabel(d.data.name);
      const words = label.split(/\s+/);
      const lines = [];
      const maxChars = Math.max(8, Math.floor(d.r / 3));
      let line = "";

      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (test.length <= maxChars) {
          line = test;
        } else {
          if (line) lines.push(line);
          line = word;
        }
      }
      if (line) lines.push(line);

      return [...lines.slice(0, 2), String(d.value)];
    })
    .join("tspan")
    .attr("x", 0)
    .attr("y", (d, i, nodes) => `${(i - (nodes.length - 1) / 2) * 1.1}em`)
    .attr("text-anchor", "middle")
    .attr("font-size", d => d.r < 40 ? 10 : 12)
    .attr("fill", "#111")
    .text(d => d);

  return svg.node();
})();
```

```js
display(chart)
```
# Subgenre breakdown
```js
const summaryTable = expanded
  ? MAIN_GENRES.flatMap(main => {
      const rows = expandedData.filter(d => d.original_parent_genres.includes(main));

      return d3.rollups(
        rows.filter(d => d.original_genre && String(d.original_genre).trim() !== ""),
        v => v.length,
        d => d.original_genre
      )
        .map(([subgenre, works]) => ({
          main_genre: formatLabel(main),
          subgenre: formatLabel(subgenre),
          works
        }))
        .sort((a, b) => d3.descending(a.works, b.works));
    })
  : d3.rollups(
      expandedData,
      v => v.length,
      d => d.main_genre
    )
      .map(([main_genre, works]) => ({
        main_genre: formatLabel(main_genre),
        works
      }))
      .sort((a, b) => d3.descending(a.works, b.works));
```

```js
display(Inputs.table(summaryTable))
```
# Inspect Works
```js
const selectedMainGenre = view(
  Inputs.select(MAIN_GENRES, {
    label: "Inspect works in main category:",
    value: "comedy",
    format: d => formatLabel(d)
  })
);
```


```js
const filteredWorks = expandedData
  .filter(d => expanded ? d.original_parent_genres.includes(selectedMainGenre) : d.main_genre === selectedMainGenre)
  .map(d => ({
    work: d.work,
    year: d.year,
    main_genre: expanded ? d.original_parent_genres.map(formatLabel).join(", ") : formatLabel(d.main_genre),
    grouped_genre: d.grouped_genre,
    original_genre: formatLabel(d.original_genre)
  }));
```

```js
display(Inputs.table(filteredWorks))
```
