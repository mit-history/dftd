# Data visualization

```js
const plays = FileAttachment("./data/french-loadPlays.json").json();
```

```js
view(Inputs.table(plays));
```

```js
// genrePlot
function countByGenre(data, cutoff = 10) {
  const genreCounts = {};
  data.forEach((play) => {
    const genre = play.genre || "Unknown";
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });
  return Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .filter((genre) => genre.count >= cutoff);
}

function genrePlot(data, cutoff = 10) {
  return Plot.plot({
    title: "Number of Plays by Genre",
    width: 600,
    height: 400,
    x: { label: "Genre" },
    y: { label: "Count" },
    marks: [
      Plot.barY(countByGenre(data, cutoff), {
        x: "genre",
        y: "count",
        fill: "steelblue",
        tip: true,
        sort: { x: "-y" },
      }),
    ],
  });
}
```

```js
const cutoff = 3;
```

The following graph shows the number of plays by genre for all genres that applied to at least ${cutoff} plays in the dataset.

```js
genrePlot(plays, cutoff);
```

```jsx
function listData(data) {
  return (
    <ul>
      {data.map((play) => (
        <li>
          {play.title} by {play.author} (Genre: {play.genre})
        </li>
      ))}
    </ul>
  );
}
```

```jsx
display(listData(plays));
```

// 🔸 Author Plot

```js
function countByAuthor(data) {
  const authorCounts = {};
  data.forEach((play) => {
    const author = play.author || "Unknown";
    authorCounts[author] = (authorCounts[author] || 0) + 1;
  });
  return Object.entries(authorCounts).map(([author, count]) => ({
    author,
    count,
  }));
}

function authorPlot(data) {
  return Plot.plot({
    title: "Number of Plays by Author",
    width: 600,
    height: 400,
    x: { label: "Author" },
    y: { label: "Count" },
    marks: [
      Plot.barY(countByAuthor(data), {
        x: "author",
        y: "count",
        fill: "darkorange",
        tip: true,
        sort: { x: "-y" },
      }),
    ],
  });
}
```

```js
authorPlot(plays);
```

---

// 🔸 Prologue Plot

```js
function countByPrologue(data) {
  const result = { "With Prologue": 0, "Without Prologue": 0 };
  data.forEach((play) => {
    if (play.prologue) result["With Prologue"]++;
    else result["Without Prologue"]++;
  });
  return Object.entries(result).map(([prologue, count]) => ({
    prologue,
    count,
  }));
}

function prologuePlot(data) {
  return Plot.plot({
    title: "Plays with/without Prologue",
    width: 600,
    height: 400,
    x: { label: "Prologue" },
    y: { label: "Count" },
    marks: [
      Plot.barY(countByPrologue(data), {
        x: "prologue",
        y: "count",
        fill: "purple",
        tip: true,
      }),
    ],
  });
}
```

```js
prologuePlot(plays);
```

---

// 🔸 Musique / Danse / Machine Plot

```js
function countByMusique(data) {
  const result = { "With Effects": 0, "Without Effects": 0 };
  data.forEach((play) => {
    if (play.musique_danse_machine) result["With Effects"]++;
    else result["Without Effects"]++;
  });
  return Object.entries(result).map(([type, count]) => ({ type, count }));
}

function musiquePlot(data) {
  return Plot.plot({
    title: "Plays with Musique/Danse/Machine",
    width: 600,
    height: 400,
    x: { label: "Effect Type" },
    y: { label: "Count" },
    marks: [
      Plot.barY(countByMusique(data), {
        x: "type",
        y: "count",
        fill: "teal",
        tip: true,
      }),
    ],
  });
}
```

```js
musiquePlot(plays);
```

---

```jsx
function listData(data) {
  return (
    <ul>
      {data.map((play) => (
        <li>
          {play.title} by {play.author} (Genre: {play.genre})
        </li>
      ))}
    </ul>
  );
}
```

```jsx
display(listData(plays));
```
