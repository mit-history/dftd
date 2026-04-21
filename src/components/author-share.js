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

    totalBar: isDarkMode ? "#ffffff" : "#313338",
    totalLabel: isDarkMode ? "#ffffff" : "#313338",

    authorLabel: isDarkMode ? "#ffffff" : "#313338",

    bg: isDarkMode ? "#1e1e1e" : "#ffffff",
    textureBG: isDarkMode ? "#ffffff" : "#1e1e1e",
    textureStrokeGray: isDarkMode ? "#999999" : "#313338",

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
  const r = Math.max(0.4, step * 0.18);
  return `
  <pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    <rect width="${step}" height="${step}" fill="${bg}"/>
    <circle cx="${step * 0.25}" cy="${step * 0.25}" r="${r}" fill="${stroke}" stroke="${theme.bg}" stroke-width="${Math.max(0.2, r * 0.2)}" opacity="0.9"/>
    <circle cx="${step * 0.75}" cy="${step * 0.75}" r="${r}" fill="${stroke}" stroke="${theme.bg}" stroke-width="${Math.max(0.2, r * 0.2)}" opacity="0.9"/>
  </pattern>`;
};

const solidTexture = (id, stroke, _bg, step = 6, opaqueSolid = false) => `
  <pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    ${opaqueSolid ? `<rect width="${step}" height="${step}" fill="${stroke}"/>` : ``}
  </pattern>`;

function buildAuthorOriginPatterns(
  authors,
  bgColor,
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
  const origins = Object.keys(theaterColorMap);

  for (let i = 0; i < authors.length; i++) {
    const tpl = templates[i % templates.length];
    const perOrigin = new Map();

    for (const origin of origins) {
      const id = `${idPrefix}tex-a${i}-${origin}`;
      const stroke = strokeOverride ?? theaterColorMap[origin];
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
  
  const templates = [
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
function renderPatternLegend(legendEl, authors, bg = "#ffffff") {
  legendEl.innerHTML = "";
  legendEl.style.display = !authors || authors.length < 2 ? "none" : "grid";
  if (!authors || authors.length < 2) return;

  const { defs } = buildAuthorOriginPatterns(
    authors,
    bg,
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

  const origins = Object.keys(theaterColorMap);
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
    rect.setAttribute("fill", `url(#legend-tex-a${idx}-${origins[0]})`);
    rect.setAttribute("stroke", "#333");

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
  const yTop = (d) => d.y_pct;

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
      dy: -20,
    }),
    Plot.text(labels, {
      x: "xMid",
      y: yTop,
      text: (d) => clampText(`${d.authorPct.toFixed(1)}%`, d),
      textAnchor: "middle",
      fontWeight: "bold",
      fontSize: fontScale,
      fill: theme.authorLabel,
      clip: false,
      dy: -8,
    }),
  ];
}

/* =============================================================================
   Main chart
============================================================================= */
export function authorShareChart(author, formatted_data) {
  const totalDaysByYear = d3.rollup(
    formatted_data,
    (rows) => new Set(rows.map((d) => d.date)).size,
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
  const origins = Object.keys(theaterColorMap);

  const sharedPlotConfig = {
    width: 1000,
    height: 420,
    x: { label: "Year", tickFormat: "d", ticks },
    color: {
      domain: origins,
      range: origins.map((k) => theaterColorMap[k]),
      legend: true,
    },
    marginTop: 16,
  };

  // Re-renders chart when color mode changes
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", () => update(true));

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
      (v) => new Set(v.map((x) => x.date)).size,
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
    let maxStackPct = 0;

    const authorCount = authors.length;
    const totalWidth = 0.8;
    const barWidth = totalWidth / authorCount;

    for (const year of allYears) {
      const total = totalDaysByYear.get(year) ?? 0;
      let maxAuthorPctForYear = 0;

      for (let j = 0; j < authorCount; j++) {
        const an = authors[j];
        const origCounts = origins.map(
          (o) => countMap.get(an)?.get(year)?.get(o) ?? 0
        );
        const authorDays = d3.sum(origCounts);
        if (!authorDays) continue;

        const authorPct = total ? (authorDays / total) * 100 : 0;
        maxAuthorPctForYear = Math.max(maxAuthorPctForYear, authorPct);

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

      maxStackPct = Math.max(maxStackPct, maxAuthorPctForYear);
    }

    const perYearTotals = allYears.map((year) => ({
      year,
      x1: year - 0.45,
      x2: year + 0.45,
      totalDays: totalDaysByYear.get(year) ?? 0,
    }));
    return { segments, authorLabels, perYearTotals, maxStackPct, authors };
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

  /* ---------- Mark builders ---------- */
  function renderPercentMode(chartData) {
    const { segments, authors } = chartData;
    const c = Math.min(100, Math.ceil(chartData.maxStackPct ?? 100));
    const extraSpace = (chartData.maxStackPct ?? 0) * 0.06;

    const marks = [];

    // Author share bars (always shown)
    marks.push(
      Plot.rectY(segments, {
        x1: "x1",
        x2: "x2",
        y1: "percentStart",
        y2: "percentEnd",
        fill: "origin",
        opacity: 0.9,
        tip: {
          channels: {
            Year: (d) => d.year,
            Author: (d) => d.author,
            "% of total": (d) => d.percent,
            "Author days": (d) => d.count,
          },
          format: {
            Year: (v) => `${v}`,
            "% of total": (v) => `${v.toFixed(2)}%`,
            "Author days": (v) => v,
            x: false,
            y: false,
          },
        },
      }),
      Plot.ruleY([0])
    );

    return {
      config: {
        y: {
          label: "Share of performance days (%)",
          domain: [0, c + extraSpace],
          tickFormat: (d) => `${d}%`,
          grid: true,
          nice: false,
        },
        title: `Author(s): ${authors.join(
          "; "
        )} — % of total (0–${c}%)`,
      },
      marks,
    };
  }

  function textureOverlayMarks(
    segments,
    authors,
    bg = theme.textureBG
  ) {
    const { defs, urlBy } = buildAuthorOriginPatterns(
      authors,
      bg,
      undefined,
      /* idPrefix */ "chart-",
      /* opaqueSolid */ false
    );

    const data = segments
      .map((s) => ({
        ...s,
        _tex: urlBy.get(s.author)?.get(s.origin) || "none",
      }));

    return [
      () => defs,
      Plot.rectY(data, {
        x1: "x1",
        x2: "x2",
        y1: "percentStartClamped",
        y2: "percentEndClamped",
        fill: "_tex",
        stroke: null,
        opacity: 1,
        pointerEvents: "none",
      }),
    ];
  }

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
    authorsBar.innerHTML = `<b>Authors To Compare:</b> [${(list ?? []).join("; ")}]${
      exceeded ? ' <span style="color: #ef4444; font-weight: bold; margin-left: 8px;">(3 authors max!)</span>' : ""
    }`;
  };
  renderAuthorsLabel(latestAuthorsToCompare);

  // Legend (no outer box)
  const authorLegend = createEl("div", {
    styles: { display: "grid", gap: "6px", marginTop: "4px", width: "fit-content" },
  });

  const labelsToggle = createEl("label", {
    styles: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      color: theme.textMuted,
      paddingLeft: "2px",
    },
    html: `<input type="checkbox" style="transform: translateY(1px);" checked> Show author labels`,
  });
  const labelsCheckbox = labelsToggle.querySelector("input");

  const combineToggle = createEl("label", {
    styles: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      color: theme.textMuted,
      paddingLeft: "2px",
    },
    html: `<input type="checkbox" style="transform: translateY(1px);"> Combine theater types`,
  });
  const combineCheckbox = combineToggle.querySelector("input");
  combineCheckbox.addEventListener("change", () => {
    combineOrigins = !!combineCheckbox.checked;
    update();
  });

  const chartHost = createEl("div", { props: { className: "chart-host" } });

  // Layout
  wrapper.append(
    labelsToggle,
    combineToggle,
    authorsBar,
    authorLegend,
    chartHost
  );

  /* ---------- Render/update ---------- */
  function update(init = false) {
    // Refresh global theme each time we render
    theme = getTheme();

    // Update UI colors to current theme
    authorsBar.style.color = theme.textMuted;
    labelsToggle.style.color = theme.textMuted;
    combineToggle.style.color = theme.textMuted;

    chartHost.innerHTML = "";
    const chartData = deriveStacked();
    const { authors } = chartData;

    const isDark = checkDarkMode();
    const patternBG = isDark ? "#1e1e1e" : "#ffffff";

    const ceiling = Math.min(100, Math.ceil(chartData.maxStackPct ?? 100));

    const combined = combineOrigins ? combineSegmentsByAuthor(chartData) : null;

    // 1. Start from the *normal* chart for this mode
    const base = renderPercentMode(chartData);

    let marks = [...base.marks];
    let baseConfig = base.config;

    if (!combineOrigins) {
      // Original behavior (origins stacked + texture overlay),
      // using patternBG consistently.
      const overlay = textureOverlayMarks(
        chartData.segments.map((s) => ({
          ...s,
          percentEndClamped: Math.min(s.percentEnd, ceiling),
          percentStartClamped: Math.min(s.percentStart, ceiling),
        })),
        chartData.authors,
        patternBG
      );

      marks.push(...overlay);
    } else {
      const { defs, fillOf } = makeCombinedFills(
        chartData.authors,
        patternBG
      );
      const defsMark = () => defs;

      const AUTHOR_BARS_INDEX = 0;

      const baseWithoutAuthorBars = marks.filter((_, i) => i !== AUTHOR_BARS_INDEX);

      const combinedBarMark = Plot.rectY(
        combined.map((s) => ({
          ...s,
          percentEnd: Math.min(s.percentEnd, ceiling),
          percentStart: Math.min(s.percentStart, ceiling),
          _fill: fillOf(s.author),
        })),
        {
          x1: "x1",
          x2: "x2",
          y1: "percentStart",
          y2: "percentEnd",
          fill: "_fill",
          opacity: 1,
          stroke: null,
          tip: {
            channels: {
              Year: (d) => d.year,
              Author: (d) => d.author,
              "% of total": (d) => d.percent,
              "Author days": (d) => d.count,
            },
            format: {
              Year: (v) => `${v}`,
              "% of total": (v) => `${v.toFixed(2)}%`,
              "Author days": (v) => v,
              x: false,
              y: false,
            },
          },
        }
      );

      marks = [defsMark, ...baseWithoutAuthorBars, combinedBarMark];

      baseConfig = {
        ...baseConfig,
        title: `Author(s): ${chartData.authors.join(
          "; "
        )} — % of total (combined, 0–${ceiling}%)`,
      };
    }

    if (showLabels) {
      marks.push(...makeAuthorLabels(chartData.authorLabels, fontScale));
    }

    const plot = Plot.plot({
      ...sharedPlotConfig,
      ...baseConfig,
      // No graph background – let parent/container provide it
      style: {
        ...(sharedPlotConfig.style || {}),
        background: "transparent",
        color: theme.text,
      },
      marks,
    });
    chartHost.append(plot);

    plot.style.fontSize = `${11 * fontScale}px`;

    // Legend texture background is white
    renderPatternLegend(authorLegend, authors, "#ffffff");
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

  update(true);
  return wrapper;
}
