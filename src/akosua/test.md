---
toc: false
---

# Visualizations of Play Data

```js
const danish = FileAttachment("data/danish-performances.csv").csv({typed: true});
const french = FileAttachment("data/french-performances.json").json();
const dutch = FileAttachment("data/dutch-performances.csv").csv({typed: true});
```

```js
const data_origin = new Map();
data_origin.set("french", french);
data_origin.set("danish", danish);
data_origin.set("dutch", dutch);
```

```js
const combined_data = danish
    .map(d => ({...d, origin: "danish"}))
    .concat(french.map(d => ({...d, origin: "french"})))
    .map(d => ({...d, year: String(d.year)}))
    .concat(dutch.map(d => ({...d, origin: "dutch"})))
    .map(d => ({...d, year: String(d.year)}));
```
<div>

```js
const opt = ["Author Genre Bubble", "Location Author Bubble"];
const vizOpt = Inputs.checkbox(opt, {label: "Visualization", value: ["Author Genre Bubble"]});
const viz = view(vizOpt);
```

```js
const bubble = viz.includes("Author Genre Bubble");
const location = viz.includes("Location Author Bubble");
```

<div class="card" style="position:sticky;top:5px;">

<details open>

<summary>Filters</summary>

```js
const start_date_input = Inputs.date({label: "Start", value: "1748-01-01"})
const start_date =  view(start_date_input);
const end_date_input = Inputs.date({label: "End", value: "1778-12-31"})
const end_date =  view(end_date_input);
const randomDates = () =>  {
  const start = new Date("1748-01-01");
  const end = new Date("1778-12-31");
  const new_start = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const new_end = new Date(new_start.getTime() + Math.random() * (end.getTime() - new_start.getTime()));
  start_date_input.value = new_start;
  end_date_input.value = new_end;
  start_date_input.dispatchEvent(new Event("input"));
  end_date_input.dispatchEvent(new Event("input"));
}
console.log(`start_date is ${start_date}`)

```

```js
const originOptions = ["danish", "dutch", "french"];
const originsInput = Inputs.checkbox(originOptions, {label: "Origin", value: originOptions});
const originsSelect = Inputs.toggle({label: "Select All", value: true})
const origins = view(originsInput);
view(originsSelect);

originsSelect.oninput = (event) => {
  if (!event.bubbles) return;
  if(originsSelect.value) {
    originsInput.value = originOptions;
  }
  else {
    originsInput.value = [];
  }

  originsInput.dispatchEvent(new Event("input"));
}

originsInput.oninput = (event) => {
  if(originsInput.value.length !== originOptions.length)  {
    originsSelect.value = false;
  } else {
    originsSelect.value = true;
  }
}

const randomOrigins = () => {
  const newValue = originOptions.filter(i => Math.round(Math.random()));
  originsInput.value = newValue;
  originsInput.dispatchEvent(new Event("input"));

  if(newValue.length === 3) originsSelect.value = true;
  else originsSelect.value = false;
}
```

```js
const genreOptions = Array.from(new Set(combined_data.filter(d => origins.includes(d.origin)).map((d) => d.genre).filter(Boolean))).sort();

const genreInput = Inputs.checkbox(
  genreOptions,
  {
    label: "Select genre(s)",
    value: genreOptions // default: all
  }
);

const genreSelect = Inputs.toggle({label: "Select All", value: true})

genreSelect.oninput = (event) => {
  if(genreSelect.value) {
    genreInput.value = genreOptions;
  }
  else {
    genreInput.value = [];
  }

  genreInput.dispatchEvent(new Event("input"));
}

genreInput.oninput = (event) => {
  if(genreInput.value.length !== genreOptions.length)  {
    genreSelect.value = false;
  } else {
    genreSelect.value = true;
  }
}

const genres = view(genreInput);
if(genreOptions.length > 0) view(genreSelect);
```

```js
const authorOptions = [
    "No author",
    ...Array.from(
      new Set([
        ...french.map((d) => d.author.split(" ; ")).flat().filter(Boolean),
        ...danish.map((d) => d.author?.split(",")).flat().filter(Boolean),
        ...dutch.map((d) => d.author).filter(Boolean),
      ])
    ).sort()
]

const authorInput = Inputs.select( authorOptions, { label: "Filter by author", value: "No author" })
const author = view(authorInput);

const randomAuthor = () => {
  authorInput.value = authorOptions[Math.floor(Math.random() * authorOptions.length)];
  authorInput.dispatchEvent(new Event("input"));
}
```

```js
view(Inputs.button("Randomize", {value: null, reduce: () => {
  randomDates();
  randomOrigins();
  randomAuthor();
}}));
```

</details>

</div>


```js
const formatted_data = combined_data.filter(d => (new Date(d.date) > start_date) && (new Date(d.date) <= end_date) && origins.includes(d.origin) && genres.includes(d.genre));
```

```js
import { BubbleChart, authorBubble } from "./akosua/bubble_chart.js";
// import { rangeInput } from "./akosua/range_input.js";
```

```js
// import { htl } from "npm:@observablehq/htl";

const theme_Flat = `
/* Options */
:scope {
  color: #3b99fc;
  width: 240px;
}

:scope {
  position: relative;
  display: inline-block;
  --thumb-size: 15px;
  --thumb-radius: calc(var(--thumb-size) / 2);
  padding: var(--thumb-radius) 0;
  margin: 2px;
  vertical-align: middle;
}
:scope .range-track {
  box-sizing: border-box;
  position: relative;
  height: 7px;
  background-color: hsl(0, 0%, 80%);
  overflow: visible;
  border-radius: 4px;
  padding: 0 var(--thumb-radius);
}
:scope .range-track-zone {
  box-sizing: border-box;
  position: relative;
}
:scope .range-select {
  box-sizing: border-box;
  position: relative;
  left: var(--range-min);
  width: calc(var(--range-max) - var(--range-min));
  cursor: ew-resize;
  background: currentColor;
  height: 7px;
  border: inherit;
}
/* Expands the hotspot area. */
:scope .range-select:before {
  content: "";
  position: absolute;
  width: 100%;
  height: var(--thumb-size);
  left: 0;
  top: calc(2px - var(--thumb-radius));
}
:scope .range-select:focus,
:scope .thumb:focus {
  outline: none;
}
:scope .thumb {
  box-sizing: border-box;
  position: absolute;
  width: var(--thumb-size);
  height: var(--thumb-size);

  background: #fcfcfc;
  top: -4px;
  border-radius: 100%;
  border: 1px solid hsl(0,0%,55%);
  cursor: default;
  margin: 0;
}
:scope .thumb:active {
  box-shadow: inset 0 var(--thumb-size) #0002;
}
:scope .thumb-min {
  left: calc(-1px - var(--thumb-radius));
}
:scope .thumb-max {
  right: calc(-1px - var(--thumb-radius));
}
`
function randomScope(prefix = 'scope-') {
  return prefix + (performance.now() + Math.random()).toString(32).replace('.', '-');
}

const cssLength = v => v == null ? null : typeof v === 'number' ? `${v}px` : `${v}`

function rangeInput(options = {}) {
  const {
    min = 0,
    max = 100,
    step = "any",
    value: defaultValue = [min, max],
    color,
    width,
    theme = theme_Flat,
    enableTextInput = false
  } = options;

  const controls = {};
  const scope = randomScope();
  const clamp = (a, b, v) => (v < a ? a : v > b ? b : v);
  // const html = htl.html;

  const inputMin = html`<input type="number" id="min-input"  min=${min} max=${defaultValue[1]} step=${step} value=${defaultValue[0]} />`;
  inputMin.style = "width:5em";
  const inputMax = html`<input type="number" id="max-input"  min=${defaultValue[0]} max=${max} step=${step} value=${defaultValue[1]} />`;
  inputMax.style = "width:5em";

  // Will be used to sanitize values while avoiding floating point issues.
  const input = html`<input type=range ${{ min, max, step }}>`;

  const dom = html`${
    enableTextInput ? inputMin : ""
  }<div class=${`${scope} range-slider`} style=${{
    color,
    width: cssLength(width)
  }}>
  ${(controls.track = html`<div class="range-track">
    ${(controls.zone = html`<div class="range-track-zone">
      ${(controls.range = html`<div class="range-select" tabindex=0>
        ${(controls.min = html`<div class="thumb thumb-min" tabindex=0>`)}
        ${(controls.max = html`<div class="thumb thumb-max" tabindex=0>`)}
      `)}
    `)}
  `)}
  ${html`<style>${theme.replace(/:scope\b/g, "." + scope)}`}
</div>${enableTextInput ? inputMax : ""}`;

  let value = [],
    changed = false;
  Object.defineProperty(dom, "value", {
    get: () => [...value],
    set: ([a, b]) => {
      value = sanitize(a, b);
      updateRange();
    }
  });

  const sanitize = (a, b) => {
    a = isNaN(a) ? min : ((input.value = a), input.valueAsNumber);
    b = isNaN(b) ? max : ((input.value = b), input.valueAsNumber);
    return [Math.min(a, b), Math.max(a, b)];
  };

  const updateRange = () => {
    const ratio = (v) => (v - min) / (max - min);
    dom.style.setProperty("--range-min", `${ratio(value[0]) * 100}%`);
    dom.style.setProperty("--range-max", `${ratio(value[1]) * 100}%`);
  };

  const dispatch = (name) => {
    dom.dispatchEvent(new Event(name, { bubbles: true }));
  };
  const setValue = (vmin, vmax) => {
    const [pmin, pmax] = value;
    value = sanitize(vmin, vmax);
    updateRange();
    // Only dispatch if values have changed.
    if (pmin === value[0] && pmax === value[1]) return;
    inputMin.value = value[0];
    inputMax.value = value[1];
    dispatch("input");
    changed = true;
  };

  inputMin.addEventListener("input", () => {
    if (+inputMin.value > +inputMax.value || +inputMin.value < min) {
      dom.appendChild(html`<please enter less>`);
      return;
    }
    inputMax.min = inputMin.value;
    setValue(inputMin.value, dom.value[1]);
  });

  inputMax.addEventListener("input", () => {
    if (+inputMax.value < +inputMin.value || +inputMax.value > max) {
      dom.appendChild(html`<please enter above>`);
      return;
    }

    inputMin.max = inputMax.value;
    setValue(dom.value[0], inputMax.value);
  });

  setValue(...defaultValue);

  // Mousemove handlers.
  const handlers = new Map([
    [
      controls.min,
      (dt, ov) => {
        const v = clamp(min, ov[1], ov[0] + dt * (max - min));
        setValue(v, ov[1]);
      }
    ],
    [
      controls.max,
      (dt, ov) => {
        const v = clamp(ov[0], max, ov[1] + dt * (max - min));
        setValue(ov[0], v);
      }
    ],
    [
      controls.range,
      (dt, ov) => {
        const d = ov[1] - ov[0];
        const v = clamp(min, max - d, ov[0] + dt * (max - min));
        setValue(v, v + d);
      }
    ]
  ]);

  // Returns client offset object.
  const pointer = (e) => (e.touches ? e.touches[0] : e);
  // Note: Chrome defaults "passive" for touch events to true.
  const on = (e, fn) =>
    e
      .split(" ")
      .map((e) => document.addEventListener(e, fn, { passive: false }));
  const off = (e, fn) =>
    e
      .split(" ")
      .map((e) => document.removeEventListener(e, fn, { passive: false }));

  let initialX,
    initialV,
    target,
    dragging = false;
  function handleDrag(e) {
    // Gracefully handle exit and reentry of the viewport.
    if (!e.buttons && !e.touches) {
      handleDragStop();
      return;
    }
    dragging = true;
    const w = controls.zone.getBoundingClientRect().width;
    e.preventDefault();
    handlers.get(target)((pointer(e).clientX - initialX) / w, initialV);
  }

  function handleDragStop(e) {
    off("mousemove touchmove", handleDrag);
    off("mouseup touchend", handleDragStop);
    if (changed) dispatch("change");
  }

  invalidation.then(handleDragStop);

  dom.ontouchstart = dom.onmousedown = (e) => {
    dragging = false;
    changed = false;
    if (!handlers.has(e.target)) return;
    on("mousemove touchmove", handleDrag);
    on("mouseup touchend", handleDragStop);
    e.preventDefault();
    e.stopPropagation();

    target = e.target;
    initialX = pointer(e).clientX;
    initialV = value.slice();
  };

  controls.track.onclick = (e) => {
    if (dragging) return;
    changed = false;
    const r = controls.zone.getBoundingClientRect();
    const t = clamp(0, 1, (pointer(e).clientX - r.left) / r.width);
    const v = min + t * (max - min);
    const [vmin, vmax] = value,
      d = vmax - vmin;
    if (v < vmin) setValue(v, v + d);
    else if (v > vmax) setValue(v - d, v);
    if (changed) dispatch("change");
  };

  return dom;
}

```


```js
// filter data to only include selected author
const author_formatted_data = (author != "No author")? formatted_data.filter(d => d.author == author) : formatted_data;

// count number of performances by genre
const count_by_genre = Object.entries(author_formatted_data.reduce((acc, d) => {
  acc[d.genre] = (acc[d.genre] || 0) + 1;
  return acc;
}, {})).map(c => ({genre: c[0], count: c[1]}));

```

```js
display(bubble ? html `<h2>Bubble Author Genre</h2>` : html`<div></div>`);
display(bubble ? html `<h2>${author}</h2>` : html`<div></div>`)

display(bubble ? BubbleChart(count_by_genre, {
    label: d => `${d.genre}-${d.count}`,
    value: d => d.count,
    title: d => d.genre,
    group: d => d.genre[0],
    width: 700,
    fontSize: 20
}): html`<div></div>`);
```

```js
const locs = {}

const french_authors = Object.entries(formatted_data.filter(d => d.origin == 'french').reduce((acc, d) => {
    acc[d.author] = (acc[d.author] || 0) + 1;
    return acc;
  }, {})).map(c => {return {author: c[0], count: c[1]}});

const danish_authors = Object.entries(formatted_data.filter(d => d.origin == 'danish').reduce((acc, d) => {
    acc[d.author] = (acc[d.author] || 0) + 1;
    return acc;
  }, {})).map(c => {return {author: c[0], count: c[1]}});

const dutch_authors = Object.entries(formatted_data.filter(d => d.origin == 'dutch').reduce((acc, d) => {
    acc[d.author] = (acc[d.author] || 0) + 1;
    return acc;
  }, {})).map(c => {return {author: c[0], count: c[1]}});



```


```js
display(location ? html `<h2>Bubble Location Authors</h2>` : html`<div></div>`);
```


```js
const do_overall_threshold = Inputs.toggle({label: "Overall Threshold", value: true});
const do_overall_threshold_val = location?view(do_overall_threshold):false;

```
```js
const overall_threshold = Inputs.number({value:1, label: 'Enter Threshold'});
const overall_threshold_val = do_overall_threshold_val?view(overall_threshold):0;
```

```js
display(location? html `<h2>French</h2>` : html`<div></div>`);
const french_threshold = Inputs.number({value:1, label: 'Enter Threshold'});
const french_threshold_val = location? (do_overall_threshold_val?overall_threshold_val:view(french_threshold)):0;
const f = rangeInput({
  min: 1748,
  max: 1798,
  step: 1,
  value: [1748, 1778],
  enableTextInput: true
});
const f_val = location?view(f):[0,0];

// const french_year_opt = Inputs.range([1748, 1778], {label: "Year", step: 1, placeholder: "1748–1778"});
// const french_year = location? view(french_year_opt): 0;
```

```js
display(location? authorBubble(combined_data, 'french', 0, french_threshold_val, f_val[0], f_val[1]): html`<div></div>`);
```

```js

display(location? html `<h2>Dutch</h2>` : html`<div></div>`);
const dutch_threshold = Inputs.number({value:1, label: 'Enter Threshold'});
const dutch_threshold_val = location? (do_overall_threshold_val?overall_threshold_val:view(dutch_threshold)):0;
const du = rangeInput({
  min: 1748,
  max: 1798,
  step: 1,
  value: [1748, 1778],
  enableTextInput: true
});
const du_val = location?view(du):[0,0];

// const dutch_year_opt = Inputs.range([1748, 1778], {label: "Year", step: 1, placeholder: "1748–1778"});
// const dutch_year = location? view(dutch_year_opt):0;
```

```js
display(location? authorBubble(combined_data, 'dutch', 0, dutch_threshold_val, du_val[0], du_val[1]): html`<div></div>`);
```

```js
display(location? html `<h2>Danish</h2>` : html`<div></div>`)
const danish_threshold = Inputs.number({value:1, label: 'Enter Threshold'});
const danish_threshold_val = location? (do_overall_threshold_val?overall_threshold_val:view(danish_threshold)):0;
const da = rangeInput({
  min: 1748,
  max: 1798,
  step: 1,
  value: [1748, 1778],
  enableTextInput: true
});
const da_val = location?view(da):[0,0];

// const danish_year_opt = Inputs.range([1748, 1778], {label: "Year", step: 1, placeholder: "1748–1778"});
// const danish_year = location?view(danish_year_opt):0;
```

```js
display(location? authorBubble(combined_data, 'danish', 0, danish_threshold_val, da_val[0], da_val[1]): html`<div></div>`);
```



</div>
