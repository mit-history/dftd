import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";

document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style data-author-share-fix>
    .card[style*="position:sticky"] {
      background: var(--theme-background, #111) !important;
      z-index: 10 !important;
      border-radius: 8px;
    }
  </style>
  `
);

let theme = getTheme();
const theaterColorMap = {
  danish: "#3b82f6",
  dutch: "#f59e0b",
  french: "#ef4444",
  "saint-domingue": "#6cc5b0",
};

/* =============================================================================
   Small Utilities (simplified)
============================================================================= */
function createEl(tag, { styles, props, html } = {}) {
  const node = document.createElement(tag);
  if (styles) Object.assign(node.style, styles);
  if (props) Object.assign(node, props);
  if (html != null) node.innerHTML = html;
  return node;
}
function createSvg(tag, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function checkDarkMode() {
  return (  
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function getTheme() {
  const isDarkMode = checkDarkMode();
  return {
    text: isDarkMode ? "#ffffff" : "#313338",
    textMuted: isDarkMode ? "#cccccc" : "#313338",

    authorLabel: isDarkMode ? "#ffffff" : "#313338",

    bg: isDarkMode ? "#1e1e1e" : "#ffffff",
    textureBG: isDarkMode ? "#ffffff" : "#1e1e1e",

    combinedBar: isDarkMode ? "#ffffff" : "#000000"
  };
}


/* =============================================================================
   Author Compare Bus
============================================================================= */
export const authorsCompareBus = new EventTarget();
export let latestAuthorsToCompare = [];

const initialAuthors = [
  "Florent Carton dit Dancourt",
  "Voltaire",
  "La Font (Joseph de)",
];

export function emitAuthorsToCompare(authors) {
  const unique = [...new Set(authors)].filter(Boolean);
  const list = unique.slice(-3);
  authorsCompareBus.dispatchEvent(
    new CustomEvent("authors:update", { detail: { authors: list, exceeded: unique.length > 3 } })
  );
}
authorsCompareBus.addEventListener("authors:update", (e) => {
  latestAuthorsToCompare = e.detail.authors ?? [];
});

emitAuthorsToCompare(initialAuthors);

export const addAuthorToCompare = (name) =>
  name &&
  name !== "No author" &&
  emitAuthorsToCompare([...latestAuthorsToCompare, name]);

export const clearAuthorsToCompare = () => emitAuthorsToCompare([]);

/* =============================================================================
   Texture / Pattern Templates
============================================================================= */
const stripeTexture = (id, stroke, bg, step = 6) => {
  const h = Math.max(1, step / 3);
  return `
  <pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="${step}" height="${step}" fill="${bg}"/>
    <rect x="0" y="${(step - h) / 2}" width="${step}" height="${h}" fill="${stroke}" opacity="0.9"/>
  </pattern>`;
};

const polkaDotTexture = (id, stroke, bg, step = 6) => {
  const r = Math.max(0.5, step * 0.2);
  return `
  <pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    <rect width="${step}" height="${step}" fill="${bg}"/>
    <circle cx="${step * 0.25}" cy="${step * 0.25}" r="${r}" fill="${stroke}" stroke="${theme.bg}" stroke-width="${Math.max(0.5, r * 0.5)}" opacity="0.9"/>
    <circle cx="${step * 0.75}" cy="${step * 0.75}" r="${r}" fill="${stroke}" stroke="${theme.bg}" stroke-width="${Math.max(0.5, r * 0.5)}" opacity="0.9"/>
  </pattern>`;
};

const solidTexture = (id, stroke, _bg, step = 6, opaqueSolid = false) => `
  <pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    ${opaqueSolid ? `<rect width="${step}" height="${step}" fill="${stroke}"/>` : ``}
  </pattern>`;

function buildAuthorOriginPatterns(
  authors,
  bgColor,
  origins,
  colorScale,
  strokeOverride,
  idPrefix = "",
  opaqueSolid = false
) {
  const temp = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  
  const templates = [
    (id, s, b) => stripeTexture(id, s, b, 5),
    (id, s, b) => solidTexture(id, s, b, 5, opaqueSolid),
    (id, s, b) => polkaDotTexture(id, s, b, 4.5),
  ];

  const urlBy = new Map();
  const defs = [];

  for (let i = 0; i < authors.length; i++) {
    const tpl = templates[i % templates.length];
    const perOrigin = new Map();

    for (const origin of origins) {
      const safeOrigin = origin.replace(/[^a-zA-Z0-9]/g, '-');
      const id = `${idPrefix}tex-a${i}-${safeOrigin}`;
      const stroke = strokeOverride ?? colorScale(origin);
      defs.push(tpl(id, stroke, bgColor));
      perOrigin.set(origin, `url(#${id})`);
    }
    urlBy.set(authors[i], perOrigin);
  }

  temp.innerHTML = `<defs>${defs.join("")}</defs>`;
  return { defs: temp.querySelector("defs"), urlBy };
}

function buildAuthorGrayPatterns(authors, bgColor, idPrefix = "combined-") {
  const temp = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const defs = [];
  const urlByAuthor = new Map();
  
  const templates = authors.length === 1 
    ? [(id, s, b) => solidTexture(id, s, b, 5, true)]
    : [
        (id, s, b) => stripeTexture(id, s, b, 5),
        (id, s, b) => solidTexture(id, s, b, 5, /* opaqueSolid */ true),
        (id, s, b) => polkaDotTexture(id, s, b, 4.5),
      ];

  for (let i = 0; i < authors.length; i++) {
    const id = `${idPrefix}author-${i}`;
    defs.push(templates[i % templates.length](
      id,
      theme.combinedBar,
      bgColor
    ));
    urlByAuthor.set(authors[i], `url(#${id})`);
  }

  temp.innerHTML = `<defs>${defs.join("")}</defs>`;
  return { defs: temp.querySelector("defs"), urlByAuthor };
}

/* =============================================================================
   Legend
============================================================================= */
function renderPatternLegend(legendEl, authors, origins, colorScale, bg = "transparent") {
  legendEl.innerHTML = "";
  legendEl.style.display = !authors || authors.length < 2 ? "none" : "grid";
  if (!authors || authors.length < 2) return;

  const { defs } = buildAuthorOriginPatterns(
    authors,
    bg,
    origins,
    colorScale,
    undefined,
    "legend-",
    true
  );

  const swatchW = 28;
  const swatchH = 14;
  const pad = 6;
  const totalRows = authors.length;

  const svg = createSvg("svg", {
    width: "100%",
    height: String(pad + totalRows * (swatchH + pad)),
  });
  svg.style.display = "block";
  svg.appendChild(defs.cloneNode(true));
  authors.forEach((name, idx) => {
    const y = pad + idx * (swatchH + pad);
    const g = createSvg("g");

    const rect = createSvg("rect", {
      x: 0,
      y,
      width: swatchW,
      height: swatchH,
      rx: 2,
    });
    const safeOrigin = origins[0] ? origins[0].replace(/[^a-zA-Z0-9]/g, '-') : '';
    rect.setAttribute("fill", `url(#legend-tex-a${idx}-${safeOrigin})`);
    rect.setAttribute("stroke", theme.textMuted);

    const label = createSvg("text", {
      x: swatchW + 8,
      y: y + swatchH - 2,
      "font-size": 12,
    });
    label.setAttribute("fill", theme.textMuted);
    label.textContent = name;

    g.append(rect, label);
    svg.appendChild(g);
  });

  legendEl.append(svg);
}

/* =============================================================================
   Label helpers
============================================================================= */
function makeAuthorLabels(labels, fontScale) {
  const yTop = (d) => d.y_days;

  // Approximate dimensions to calculate how many characters fit
  const minYear = d3.min(labels, (d) => d.year) ?? 1748;
  const maxYear = d3.max(labels, (d) => d.year) ?? 1778;
  const yearSpan = Math.max(1, maxYear - minYear);
  // Plot defaults: width 1000, approx margin left 40, right 20 -> ~940 inner
  const pxPerYear = 940 / yearSpan;
  const charPx = fontScale * 0.55; // Approx pixel width per char

  const clampText = (str, d) => {
    const barWidthData = d.x2 - d.x1;
    const barPx = barWidthData * pxPerYear;
    const maxChars = Math.floor((barPx - 4) / charPx); // 4px whitespace inside
    
    if (maxChars <= 0) return "";
    if (str.length > maxChars) {
      if (maxChars <= 1) return "";
      return str.slice(0, maxChars - 1) + "…";
    }
    return str;
  };

  return [
    Plot.text(labels, {
      x: "xMid",
      y: yTop,
      text: (d) => clampText(`${d.authorDays}`, d),
      textAnchor: "middle",
      fontWeight: "bold",
      fontSize: fontScale,
      fill: theme.authorLabel,
      clip: false,
      dy: -10,
    }),
  ];
}

/* =============================================================================
   Main chart
============================================================================= */
export function authorShareChart(author, formatted_data, controlsContainer) {
  // --- DEBUG: Check for Saint-Domingue data ---
  const sdData = formatted_data.filter(d => d.origin === "saint-domingue");
  console.log(`Found ${sdData.length} records for Saint-Domingue!`, sdData);
  // --------------------------------------------

  const totalDaysByYear = d3.rollup(
    formatted_data,
    (yearRows) => {
      const byOrigin = d3.rollups(
        yearRows,
        (origRows) => new Set(origRows.map((d) => {
          const dt = d.date instanceof Date ? d.date : new Date(d.date);
          return isNaN(dt) ? String(d.date) : dt.toISOString().slice(0, 10);
        })).size,
        (d) => d.origin
      );
      return d3.sum(byOrigin, (d) => d[1]);
    },
    (d) => +d.year
  );

  const years = [...totalDaysByYear.keys()];
  if (!years.length) {
    const msg = createEl("div", {
      props: { innerHTML: "<i>No data for the current filters.</i>" },
    });
    return msg;
  }

  const ratio = (d3.max(years) - d3.min(years)) / 30;
  const fontScale =
    ratio > 1 ? 10 / (1 + 0.7 * (ratio - 1)) : 10 * (1 + 0.8 * (1 - ratio));
  const ticks = d3.ticks(d3.min(years), d3.max(years), 10).map(Math.round);
  const allYears = d3.range(d3.min(years), d3.max(years) + 1);
  const origins = Array.from(new Set(formatted_data.map(d => d.origin).filter(Boolean)));
  const colorScale = d3.scaleOrdinal(origins, d3.schemeObservable10);

  const sharedPlotConfig = {
    width: 1000,
    height: 420,
    x: { label: "Year", tickFormat: "d", ticks },
    color: {
      domain: origins,
      range: origins.map(o => colorScale(o)),
      legend: true,
    },
    marginTop: 16,
  };

  // Re-renders chart when color mode changes
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", () => update());

  /* ---------- Mark builders ---------- */
  function textureOverlayMarks(segments, authors, bg) {
    const { defs, urlBy } = buildAuthorOriginPatterns(
      authors,
      bg,
      origins,
      colorScale,
      undefined,
      "chart-",
      false
    );

    const data = segments.map((s) => ({
      ...s,
      _tex: urlBy.get(s.author)?.get(s.origin) || "none",
    }));

    return [
      () => defs,
      Plot.rectY(data, {
        x1: "x1",
        x2: "x2",
        y1: "daysStart",
        y2: "daysEnd",
        fill: "_tex",
        stroke: null,
        opacity: 1,
        pointerEvents: "none",
      }),
    ];
  }

  /* ---------- Data builders ---------- */
  function deriveStacked() {
    const authors = latestAuthorsToCompare.length
      ? latestAuthorsToCompare
      : [author];

    const rows = formatted_data.flatMap((d) => {
      const match = authors.find(
        (a) => d.author === a || d.author?.includes(a)
      );
      return match
        ? [{ author: match, year: +d.year, origin: d.origin, date: d.date }]
        : [];
    });

    const nested = d3.rollups(
      rows,
      (v) => new Set(v.map((x) => {
        const dt = x.date instanceof Date ? x.date : new Date(x.date);
        return isNaN(dt) ? String(x.date) : dt.toISOString().slice(0, 10);
      })).size,
      (d) => d.author,
      (d) => d.year,
      (d) => d.origin
    );

    const countMap = new Map(
      nested.map(([an, yearsArr]) => [
        an,
        new Map(yearsArr.map(([y, origArr]) => [y, new Map(origArr)])),
      ])
    );

    const segments = [];
    const authorLabels = [];
    let maxStackCount = 0;

    const authorCount = authors.length;
    const totalWidth = 0.8;
    const barWidth = totalWidth / authorCount;

    for (const year of allYears) {
      const total = totalDaysByYear.get(year) ?? 0;
      let maxAuthorDaysForYear = 0;

      for (let j = 0; j < authorCount; j++) {
        const an = authors[j];
        const origCounts = origins.map(
          (o) => countMap.get(an)?.get(year)?.get(o) ?? 0
        );
        const authorDays = d3.sum(origCounts);
        if (!authorDays) continue;

        const authorPct = total ? (authorDays / total) * 100 : 0;
        maxAuthorDaysForYear = Math.max(maxAuthorDaysForYear, authorDays);

        let wDays = 0;
        let wPct = 0;

        const x1 = year - totalWidth / 2 + j * barWidth;
        const x2 = x1 + barWidth;
        const xMid = (x1 + x2) / 2;

        for (let i = 0; i < origins.length; i++) {
          const c = origCounts[i] || 0; 
          const p = total ? (c / total) * 100 : 0;
          
          if (!c) continue;

          segments.push({
            year,
            author: an,
            origin: origins[i],
            count: c,
            percent: p,
            daysStart: wDays,
            daysEnd: wDays + c,
            percentStart: wPct,
            percentEnd: wPct + p,
            x1,
            x2,
            xMid,
          });

          wDays += c;
          wPct += p;
        }

        authorLabels.push({
          year,
          author: an,
          authorDays,
          authorPct,
          y_days: authorDays,
          y_pct: authorPct,
          x1,
          x2,
          xMid,
        });
      }

      maxStackCount = Math.max(maxStackCount, maxAuthorDaysForYear);
    }

    return { segments, authorLabels, maxStackCount, authors };
  }

  function combineSegmentsByAuthor(chartData) {
    const { authorLabels, authors } = chartData;
    const byKey = new Map();

    for (const lab of authorLabels) {
      const key = `${lab.year}::${lab.author}`;
      byKey.set(key, {
        year: lab.year,
        author: lab.author,
        count: lab.authorDays,
        percent: lab.authorPct,
        daysStart: 0,
        daysEnd: lab.authorDays,
        percentStart: 0,
        percentEnd: lab.authorPct,
        x1: lab.x1,
        x2: lab.x2,
        xMid: lab.xMid,
      });
    }

    return [...byKey.values()].sort(
      (a, b) =>
        a.year - b.year || authors.indexOf(a.author) - authors.indexOf(b.author)
    );
  }

  const sharedTip = {
    channels: { Year: "year", Author: "author", "% of total": "percent", "Author days": "count" },
    format: { Year: (v) => `${v}`, "% of total": (v) => `${v.toFixed(2)}%`, "Author days": true, x: false, y: false },
  };

  function makeCombinedFills(authors, bg = theme.textureBG) {
    const { defs, urlByAuthor } = buildAuthorGrayPatterns(
      authors,
      bg,
      "chart-combined-"
    );
    const fillOf = (a) => urlByAuthor.get(a) || theme.combinedBar;
    return { defs, fillOf };
  }

  /* ---------- UI ---------- */
  let showLabels = true;
  let combineOrigins = false;

  const wrapper = createEl("div", { styles: { display: "grid", gap: "8px" } });

  // Authors bar (top text)
  const authorsBar = createEl("div", {
    styles: { fontSize: "12px", color: theme.textMuted },
  });
  const renderAuthorsLabel = (list, exceeded = false) => {
    authorsBar.innerHTML = "";
    const labelPrefix = createEl("b", { html: "Authors To Compare: " });
    authorsBar.append(labelPrefix);

    const container = createEl("span", {
      styles: { display: "inline-flex", gap: "6px", flexWrap: "wrap", alignItems: "center", marginLeft: "6px" }
    });

    (list ?? []).forEach(a => {
      const pill = createEl("span", {
        styles: {
          border: `1px solid ${theme.textMuted}`,
          borderRadius: "4px",
          padding: "2px 6px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px"
        },
        html: `<span>${a}</span>`
      });
      
      const delBtn = createEl("span", {
        styles: { cursor: "pointer", color: "#ef4444", fontWeight: "bold", fontSize: "14px", lineHeight: "1" },
        html: "&times;"
      });
      delBtn.onclick = () => {
        const newList = list.filter(name => name !== a);
        emitAuthorsToCompare(newList);
      };
      
      pill.append(delBtn);
      container.append(pill);
    });
    authorsBar.append(container);

    if (exceeded) {
      const exc = createEl("span", {
        styles: { color: "#ef4444", fontWeight: "bold", marginLeft: "8px" },
        html: "(3 authors max!)"
      });
      authorsBar.append(exc);
    }
  };
  renderAuthorsLabel(latestAuthorsToCompare);

  const createToggle = (text, checked) => {
    const lbl = createEl("label", {
      styles: { display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", color: theme.textMuted, paddingLeft: "2px" },
      html: `<input type="checkbox" style="transform: translateY(1px);"${checked ? " checked" : ""}> ${text}`,
    });
    return [lbl, lbl.querySelector("input")];
  };

  const [labelsToggle, labelsCheckbox] = createToggle("Show author labels", true);

  const [combineToggle, combineCheckbox] = createToggle("Combine theater types", false);
  combineCheckbox.addEventListener("change", () => {
    combineOrigins = !!combineCheckbox.checked;
    update();
  });

  const chartHost = createEl("div", { props: { className: "chart-host" } });

  const authorLegend = createEl("div", {
    styles: { display: "grid", gap: "6px", marginTop: "4px", width: "fit-content" },
  });

  // Layout
  wrapper.append(
    ...[
      labelsToggle,
      combineToggle,
      controlsContainer, // Will be ignored by filter(Boolean) if undefined
      authorsBar,
      authorLegend,
      chartHost
    ].filter(Boolean)
  );

  /* ---------- Render/update ---------- */
  function update() {
    // Refresh global theme each time we render
    theme = getTheme();

    // Update UI colors to current theme
    authorsBar.style.color = theme.textMuted;
    labelsToggle.style.color = theme.textMuted;
    combineToggle.style.color = theme.textMuted;

    chartHost.innerHTML = "";
    const chartData = deriveStacked();
    const { segments, authors, maxStackCount, authorLabels } = chartData;

    const extraSpace = (maxStackCount || 0) * 0.1;
    const title = `Author(s): ${authors.join("; ")} — Number of performance days${combineOrigins ? " (combined)" : ""}`;

    let marks = [Plot.ruleY([0])];

    if (!combineOrigins) {
      marks.push(Plot.rectY(segments, { x1: "x1", x2: "x2", y1: "daysStart", y2: "daysEnd", fill: "origin", opacity: 0.9, tip: sharedTip }));
      if (authors.length > 1) {
        marks.push(...textureOverlayMarks(segments, authors, theme.bg));
      }
    } else {
      const { defs, fillOf } = makeCombinedFills(authors, theme.bg);
      const combinedData = combineSegmentsByAuthor(chartData).map(s => ({ ...s, _fill: fillOf(s.author) }));
      marks.push(
        () => defs,
        Plot.rectY(combinedData, { x1: "x1", x2: "x2", y1: "daysStart", y2: "daysEnd", fill: "_fill", opacity: 1, stroke: null, tip: sharedTip })
      );
    }

    if (showLabels) {
      marks.push(...makeAuthorLabels(authorLabels, fontScale));
    }

    const plot = Plot.plot({
      ...sharedPlotConfig,
      title,
      y: { label: "Number of performance days", domain: [0, (maxStackCount || 10) + extraSpace], tickFormat: "d", grid: true, nice: true },
      style: {
        ...(sharedPlotConfig.style || {}),
        background: "transparent",
        color: theme.text,
      },
      marks,
    });
    chartHost.append(plot);

    plot.style.fontSize = `${11 * fontScale}px`;

    renderPatternLegend(authorLegend, authors, origins, colorScale, "transparent");
  }

  /* ---------- Events ---------- */
  labelsCheckbox.addEventListener("change", () => {
    showLabels = !!labelsCheckbox.checked;
    update();
  });

  authorsCompareBus.addEventListener("authors:update", (e) => {
    renderAuthorsLabel(e.detail.authors, e.detail.exceeded);
    update();
  });

  update();
  return wrapper;
}