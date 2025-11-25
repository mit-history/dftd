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

/* =============================================================================
   Chart animations
============================================================================= */
function morphBetweenCharts(
  prevPlot,
  nextPlot,
  {
    selector = ".total-bars, .total-bars rect",
    duration = 800,
    ease = d3.easeCubicInOut,
  } = {}
) {
  const prevRects = d3
    .select(prevPlot)
    .selectAll(selector)
    .filter(function () { return this.tagName === "rect"; })
    .interrupt()
    .nodes();

  const nextRects = d3
    .select(nextPlot)
    .selectAll(selector)
    .filter(function () { return this.tagName === "rect"; })
    .interrupt()
    .nodes();

  let animated = 0;

  nextRects.forEach((rect, i) => {
    const next = d3.select(rect);
    const prev = prevRects[i];
    if (!prev) return;

    const y0 = +prev.getAttribute("y");
    const h0 = +prev.getAttribute("height");
    const y1 = +next.attr("y");
    const h1 = +next.attr("height");

    next
      .attr("y", y0)
      .attr("height", h0)
      .transition()
      .duration(duration)
      .ease(ease)
      .attr("y", y1)
      .attr("height", h1);

    animated++;
  });

  if (animated) {
    d3.select(nextPlot)
      .selectAll("text:not(g[aria-label='x-axis'] text):not(g[aria-label='y-axis'] text)")
      .attr("opacity", 0)
      .transition()
      .delay(duration * 0.5)
      .duration(duration * 0.5)
      .attr("opacity", 1);
  }

  return animated > 0;
}

function riseBars(plot, { duration = 800, stagger = 5 } = {}) {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const rects = d3
    .select(plot)
    .selectAll("rect")
    .filter(function () {
      const y = Number(this.getAttribute("y"));
      const h = Number(this.getAttribute("height"));
      return Number.isFinite(y) && Number.isFinite(h);
    });

  rects
    .attr("data-y", function () { return this.getAttribute("y"); })
    .attr("data-h", function () { return this.getAttribute("height"); })
    .attr("y", function () {
      const y = Number(this.getAttribute("data-y"));
      const h = Number(this.getAttribute("data-h"));
      return (Number.isFinite(y) ? y : 0) + (Number.isFinite(h) ? h : 0);
    })
    .attr("height", 0)
    .transition()
    .duration(duration)
    .delay((_, i) => i * stagger)
    .ease(d3.easeCubicOut)
    .attr("y", function () { return this.getAttribute("data-y"); })
    .attr("height", function () { return this.getAttribute("data-h"); });

  d3.select(plot)
    .selectAll("text:not(g[aria-label='x-axis'] text):not(g[aria-label='y-axis'] text)")
    .attr("opacity", 0)
    .transition()
    .duration(400)
    .delay(duration * 0.7)
    .attr("opacity", 1);
}

/* =============================================================================
   Author Compare Bus
============================================================================= */
export const authorsCompareBus = new EventTarget();
export let latestAuthorsToCompare = [];

const initialAuthors = [
  "Florent Carton dit Dancourt",
  "Voltaire",
  "La Font (Joseph de)"
];

export function emitAuthorsToCompare(authors) {
  const list = [...new Set(authors)].filter(Boolean);
  authorsCompareBus.dispatchEvent(
    new CustomEvent("authors:update", { detail: { authors: list } })
  );
}
authorsCompareBus.addEventListener("authors:update", (e) => {
  latestAuthorsToCompare = e.detail.authors ?? [];
});

emitAuthorsToCompare(initialAuthors);

export const addAuthorToCompare = (name) =>
  name && name !== "No author" && emitAuthorsToCompare([...latestAuthorsToCompare, name]);

export const clearAuthorsToCompare = () => emitAuthorsToCompare([]);

/* =============================================================================
   Texture / Pattern Templates
============================================================================= */
const stripeTexture = (id, stroke, bg, step = 6) => `
  <pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="${step}" height="${step}" fill="${bg}"/>
    <rect x="0" y="${(step - 2) / 2}" width="${step}" height="2" fill="${stroke}" opacity="0.9"/>
  </pattern>`;

const polkaDotTexture = (id, stroke, bg) => `
  <pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse">
    <rect width="12" height="12" fill="${bg}"/>
    <circle cx="3.5" cy="3.5" r="1.5" fill="${stroke}" opacity="0.9"/>
    <circle cx="9.5" cy="9.5" r="1.5" fill="${stroke}" opacity="0.9"/>
  </pattern>`;

const solidTexture = (id, stroke, _bg, step = 6, opaqueSolid = false) => `
  <pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    ${opaqueSolid ? `<rect width="${step}" height="${step}" fill="${stroke}"/>` : ``}
  </pattern>`;

function buildAuthorOriginPatterns(authors, bgColor, strokeOverride, idPrefix = "", opaqueSolid = false) {
  const temp = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const templates = [
    (id, s, b) => stripeTexture(id, s, b),
    (id, s, b) => polkaDotTexture(id, s, b),
    (id, s, b) => solidTexture(id, s, b, 6, opaqueSolid),
  ];

  const urlBy = new Map();
  const defs = [];
  const origins = Object.keys(theaterColorMap);

  // First author is solid (no pattern); start at i = 1
  for (let i = 1; i < authors.length; i++) {
    const tpl = templates[(i - 1) % templates.length];
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
    (id, s, b) => stripeTexture(id, s, b),
    (id, s, b) => polkaDotTexture(id, s, b),
    (id, s, b) => solidTexture(id, s, b, 6, /* opaqueSolid */ true),
  ];

  for (let i = 1; i < authors.length; i++) {
    const id = `${idPrefix}author-${i}`;
    defs.push(templates[(i - 1) % templates.length](id, "#4b5563", bgColor));
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
  legendEl.style.display = (!authors || authors.length < 2) ? "none" : "grid";
  if (!authors || authors.length < 2) return;

  const { defs } = buildAuthorOriginPatterns(authors, bg, "#4b5563", "legend-", true);

  const swatchW = 28;
  const swatchH = 14;
  const pad = 6;
  const totalRows = authors.length;

  const svg = createSvg("svg", { width: "100%", height: String(24 + (totalRows - 1) * (swatchH + pad)) });
  svg.style.display = "block";
  svg.appendChild(defs.cloneNode(true));

  // First author: solid dark gray box
  const firstY = pad;
  const g0 = createSvg("g");
  const r0 = createSvg("rect", { x: 0, y: firstY, width: swatchW, height: swatchH, rx: 2 });
  r0.setAttribute("fill", "#4b5563");
  r0.setAttribute("stroke", "#333");
  const t0 = createSvg("text", { x: swatchW + 8, y: firstY + swatchH - 2, "font-size": 12 });
  t0.setAttribute("fill", "#ddd");
  t0.textContent = authors[0];
  g0.append(r0, t0);
  svg.appendChild(g0);

  const origins = Object.keys(theaterColorMap);
  authors.slice(1).forEach((name, idx) => {
    const y = pad + (idx + 1) * (swatchH + pad);
    const g = createSvg("g");

    const rect = createSvg("rect", { x: 0, y, width: swatchW, height: swatchH, rx: 2 });
    rect.setAttribute("fill", `url(#legend-tex-a${idx + 1}-${origins[0]})`);
    rect.setAttribute("stroke", "#333");

    const label = createSvg("text", { x: swatchW + 8, y: y + swatchH - 2, "font-size": 12 });
    label.setAttribute("fill", "#ddd");
    label.textContent = name;

    g.append(rect, label);
    svg.appendChild(g);
  });

  legendEl.append(svg);
}

/* =============================================================================
   Label helpers
============================================================================= */
function makeAuthorLabels(mode, labels, fontScale) {
  const yTop = mode === "percent" ? (d) => d.y_pct : (d) => d.y_days;

  return [
    Plot.text(labels, {
      x: "year",
      y: yTop,
      text: (d) => `${d.authorDays}`,
      textAnchor: "middle",
      fontWeight: "bold",
      fontSize: fontScale,
      fill: "#000",
      clip: false,
      dy: -20,
      stroke: "#ffffff",
      strokeWidth: 5,
      paintOrder: "stroke",
    }),
    Plot.text(labels, {
      x: "year",
      y: yTop,
      text: (d) => `${d.authorPct.toFixed(1)}%`,
      textAnchor: "middle",
      fontWeight: "bold",
      fontSize: fontScale,
      fill: "#000",
      clip: false,
      dy: -8,
      stroke: "#ffffff",
      strokeWidth: 3,
      paintOrder: "stroke",
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
    const msg = createEl("div", { props: { innerHTML: "<i>No data for the current filters.</i>" } });
    return msg;
  }

  const ratio = (d3.max(years) - d3.min(years)) / 30;
  const fontScale = ratio > 1 ? 10 / (1 + 0.7 * (ratio - 1)) : 10 * (1 + 0.8 * (1 - ratio));
  const ticks = d3.ticks(d3.min(years), d3.max(years), 10).map(Math.round);
  const allYears = d3.range(d3.min(years), d3.max(years) + 1);
  const origins = Object.keys(theaterColorMap);

  const sharedPlotConfig = {
    width: 1000,
    height: 420,
    x: { label: "Year", tickFormat: "d", ticks },
    color: { domain: origins, range: origins.map((k) => theaterColorMap[k]), legend: true },
    marginTop: 16,
  };

  /* ---------- Data builders ---------- */
  function deriveStacked() {
    const authors = latestAuthorsToCompare.length ? latestAuthorsToCompare : [author];

    const rows = formatted_data.flatMap((d) => {
      const match = authors.find((a) => d.author === a || d.author?.includes(a));
      return match ? [{ author: match, year: +d.year, origin: d.origin, date: d.date }] : [];
    });

    const nested = d3.rollups(
      rows,
      (v) => new Set(v.map((x) => x.date)).size,
      (d) => d.author,
      (d) => d.year,
      (d) => d.origin
    );

    const countMap = new Map(
      nested.map(([an, yearsArr]) => [an, new Map(yearsArr.map(([y, origArr]) => [y, new Map(origArr)]))])
    );

    const segments = [];
    const authorLabels = [];
    let maxStackPct = 0;

    for (const year of allYears) {
      const total = totalDaysByYear.get(year) ?? 0;
      let offDays = 0;
      let offPct = 0;

      for (const an of authors) {
        const origCounts = origins.map((o) => countMap.get(an)?.get(year)?.get(o) ?? 0);
        const authorDays = d3.sum(origCounts);
        if (!authorDays) continue;

        const authorPct = total ? (authorDays / total) * 100 : 0;
        let wDays = offDays;
        let wPct = offPct;

        for (let i = 0; i < origins.length; i++) {
          const c = origCounts[i] || 0;
          const p = total ? (c / total) * 100 : 0;

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
          });

          wDays += c;
          wPct += p;
        }

        authorLabels.push({
          year,
          author: an,
          authorDays,
          authorPct,
          y_days: offDays + authorDays,
          y_pct: offPct + authorPct,
        });

        offDays += authorDays;
        offPct += authorPct;
      }

      maxStackPct = Math.max(maxStackPct, offPct);
    }

    const perYearTotals = allYears.map((year) => ({ year, totalDays: totalDaysByYear.get(year) ?? 0 }));
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
        daysStart: lab.y_days - lab.authorDays,
        daysEnd: lab.y_days,
        percentStart: lab.y_pct - lab.authorPct,
        percentEnd: lab.y_pct,
      });
    }

    return [...byKey.values()].sort((a, b) => a.year - b.year || authors.indexOf(a.author) - authors.indexOf(b.author));
  }

  /* ---------- Mark builders ---------- */
  function renderDaysMode(chartData) {
    const { segments, perYearTotals, authors } = chartData;
    const yMax = d3.max(perYearTotals, (d) => d.totalDays) ?? 0;

    const totalDaysLabels = Plot.text(
      perYearTotals.map((d) => ({ ...d, _y: d.totalDays + 1.0 })),
      {
        x: "year",
        y: (d) => d._y,
        text: (d) => `${d.totalDays}`,
        textAnchor: "middle",
        fontWeight: "bold",
        fontSize: fontScale,
        fill: "#fff",
        clip: false,
        dy: -6,
      }
    );

    return {
      config: {
        y: {
          label: "Number of Performances",
          grid: true,
          domain: [0, yMax],
        },
        title: `Author(s): ${authors.join("; ")} — Days`,
      },
      marks: [
        Plot.barY(perYearTotals, {
          x: "year",
          y: "totalDays",
          fill: "#ffffff",
          className: "total-bars",
          tip: {
            channels: {
              Year: (d) => d.year,
              Performances: (d) => d.totalDays,
            },
            format: {
              x: false,
              y: false,
            },
          },
        }),
        Plot.barY(segments, {
          x: "year",
          y: "daysEnd",
          y1: "daysStart",
          fill: "origin",
          opacity: 0.9,
          tip: {
            channels: {
              Author: (d) => d.author,
              "Share of total": (d) => d.percent,
              "Author days": (d) => d.count,
            },
            format: {
              "Share of total": (v) => `${v.toFixed(2)}%`,
              "Author days": (v) => v,
              x: false,
              y: false,
            },
          },
        }),
        Plot.ruleY([0]),
        totalDaysLabels,
      ],
    };
  }

  function renderPercentMode(chartData, ceiling) {
    const { segments, perYearTotals, authorLabels, authors } = chartData;
    const c = Math.min(100, Math.round(Number.isFinite(ceiling) ? ceiling : 100));
    const extraSpace = (chartData.maxStackPct ?? 0) * 0.06;

    return {
      config: {
        y: {
          label: "Share of performance days (%)",
          domain: [0, c + extraSpace],
          tickFormat: (d) => `${d}%`,
          grid: true,
          nice: false,
        },
        title: `Author(s): ${authors.join("; ")} — % of total (0–${c}%)`,
      },
      marks: [
        Plot.barY(perYearTotals, {
          x: "year",
          y: c + extraSpace,
          fill: "#ffffff",
          className: "total-bars",
          inset: 0,
        }),
        Plot.barY(segments, {
          x: "year",
          y: "percentEnd",
          y1: "percentStart",
          fill: "origin",
          opacity: 0.9,
          tip: {
            channels: {
              Author: (d) => d.author,
              "% of total": (d) => d.percent,
              "Author days": (d) => d.count,
            },
            format: {
              "% of total": (v) => `${v.toFixed(2)}%`,
              "Author days": (v) => v,
              x: false,
              y: false,
            },
          },
        }),
        Plot.ruleY([0]),
      ],
      labelsData: authorLabels,
    };
  }

  function textureOverlayMarks(segments, authors, space = "days", bg = "#ffffff") {
    const { defs, urlBy } = buildAuthorOriginPatterns(
      authors,
      bg,
      /* strokeOverride */ undefined,
      /* idPrefix */ "chart-",
      /* opaqueSolid */ false
    );

    const yTop = space === "days" ? "daysEnd" : "percentEndClamped";
    const yBot = space === "days" ? "daysStart" : "percentStartClamped";

    const data = segments
      .filter((s) => authors.indexOf(s.author) > 0)
      .map((s) => ({ ...s, _tex: urlBy.get(s.author)?.get(s.origin) || "none" }));

    return [
      () => defs,
      Plot.barY(data, {
        x: "year",
        y: yTop,
        y1: yBot,
        fill: "_tex",
        stroke: null,
        opacity: 1,
        pointerEvents: "none",
      }),
    ];
  }

  function makeCombinedFills(authors, bg = "#ffffff") {
    const { defs, urlByAuthor } = buildAuthorGrayPatterns(authors, bg, "chart-combined-");
    const fillOf = (a) => (authors.indexOf(a) === 0 ? "#4b5563" : (urlByAuthor.get(a) || "#4b5563"));
    return { defs, fillOf };
  }

  /* ---------- UI ---------- */
  let mode = "days";
  let showLabels = true;
  let combineOrigins = false;

  const wrapper = createEl("div", { styles: { display: "grid", gap: "8px" } });

  // Authors bar (top text)
  const authorsBar = createEl("div", { styles: { fontSize: "12px", color: "#dadadaff" } });
  const renderAuthorsLabel = (list) => { authorsBar.textContent = `Authors To Compare: [${(list ?? []).join("; ")}]`; };
  renderAuthorsLabel(latestAuthorsToCompare);

  // Legend (no outer box)
  const authorLegend = createEl("div", {
    styles: { display: "grid", gap: "6px", marginTop: "4px", width: "fit-content" },
  });

  // Mode controls
  const controls = createEl("div", { styles: { display: "flex", gap: "8px", alignItems: "center" } });
  const modeLabel = createEl("span", { styles: { fontSize: "14px", color: "#dadadaff" }, props: { textContent: "Mode:" } });

  const modeButton = createEl("button", {
    styles: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: "32px",
      padding: "0 10px",
      border: "1px solid #ccc",
      borderRadius: "6px",
      background: "#1f2937",
      color: "#eee",
      cursor: "pointer",
      font: "inherit",
    },
  });

  const hint = createEl("span", {
    styles: { fontSize: "12px", whiteSpace: "nowrap" },
    props: { textContent: "‘#’ = days, ‘%’ = percent" },
  });

  const percentSlider = createEl("input", {
    styles: { width: "160px", display: "none", marginLeft: "6px", cursor: "pointer" },
    props: { type: "range", min: "1", max: "100", step: "1", value: "100" },
  });

  controls.append(modeLabel, modeButton, hint, percentSlider);

  const labelsToggle = createEl("label", {
    styles: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      color: "#dadadaff",
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
      color: "#dadadaff",
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
  wrapper.append(authorsBar, authorLegend, controls, labelsToggle, combineToggle, chartHost);

  // Pause graph animation when adjusting slider
  let isScrubbing = false;
  percentSlider.addEventListener("pointerdown", () => (isScrubbing = true));
  percentSlider.addEventListener("pointerup", () => (isScrubbing = false));
  percentSlider.addEventListener("pointercancel", () => (isScrubbing = false));
  percentSlider.addEventListener("blur", () => (isScrubbing = false));

  let lastChartPlot = null;

  /* ---------- Render/update ---------- */
  function update(init = false) {
    chartHost.innerHTML = "";
    const chartData = deriveStacked();
    const { authors } = chartData;

    // Slider min = tallest bar (maxStackPct) → 100
    if (init || mode === "percent") {
      percentSlider.min = String(Math.min(100, Math.ceil(chartData.maxStackPct ?? 0)));
    }

    const sliderMinNum = Number(percentSlider.min) || 1;
    const sliderValNum = Number(percentSlider.value);
    const ceiling = Math.max(
      sliderMinNum,
      Math.min(100, Number.isFinite(sliderValNum) ? sliderValNum : 100)
    );

    const combined = combineOrigins ? combineSegmentsByAuthor(chartData) : null;

    // 1. Start from the *normal* chart for this mode
    const base = mode === "days"
      ? renderDaysMode(chartData)
      : renderPercentMode(chartData, ceiling);

    let marks = [...base.marks];
    let baseConfig = base.config;

    if (!combineOrigins) {
      // Original behavior (origins stacked + texture overlay)
      const bg = "#ffffff";

      const overlay =
        mode === "days"
          ? textureOverlayMarks(chartData.segments, chartData.authors, "days", bg)
          : textureOverlayMarks(
              chartData.segments.map((s) => ({
                ...s,
                percentEndClamped: Math.min(s.percentEnd, ceiling),
                percentStartClamped: Math.min(s.percentStart, ceiling),
              })),
              chartData.authors,
              "pct",
              bg
            );

      marks.push(...overlay);
    } else {
      const { defs, fillOf } = makeCombinedFills(chartData.authors, "#ffffff");
      const defsMark = () => defs;

      const AUTHOR_BARS_INDEX = 1;

      const baseWithoutAuthorBars = marks.filter((_, i) => i !== AUTHOR_BARS_INDEX);

      const combinedBarMark =
        mode === "days"
          ? Plot.barY(
              combined.map((s) => ({ ...s, _fill: fillOf(s.author) })),
              {
                x: "year",
                y: "daysEnd",
                y1: "daysStart",
                fill: "_fill",
                opacity: 1,
                stroke: null,
                tip: {
                  channels: {
                    Author: (d) => d.author,
                    "Author days": (d) => d.count,
                  },
                  format: {
                    "Author days": (v) => v,
                    x: false,
                    y: false,
                  },
                },
              }
            )
          : Plot.barY(
              combined.map((s) => ({
                ...s,
                percentEnd: Math.min(s.percentEnd, ceiling),
                percentStart: Math.min(s.percentStart, ceiling),
                _fill: fillOf(s.author),
              })),
              {
                x: "year",
                y: "percentEnd",
                y1: "percentStart",
                fill: "_fill",
                opacity: 1,
                stroke: null,
                tip: {
                  channels: {
                    Author: (d) => d.author,
                    "% of total": (d) => d.percent,
                    "Author days": (d) => d.count,
                  },
                  format: {
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
        title:
          mode === "days"
            ? `Author(s): ${chartData.authors.join("; ")} — Days (combined)`
            : `Author(s): ${chartData.authors.join("; ")} — % of total (combined, 0–${ceiling}%)`,
      };
    }

    if (showLabels) {
      marks.push(...makeAuthorLabels(mode, chartData.authorLabels, fontScale));
    }

    const plot = Plot.plot({ ...sharedPlotConfig, ...baseConfig, marks });
    chartHost.append(plot);

    plot.style.fontSize = `${11 * fontScale}px`;
    modeButton.textContent = mode === "days" ? "#" : "%";
    percentSlider.style.display = mode === "percent" ? "inline-block" : "none";

    renderPatternLegend(authorLegend, authors);

    const duration = isScrubbing ? 0 : 800;
    const morphed = morphBetweenCharts(lastChartPlot, plot, { duration, ease: d3.easeCubicInOut });
    if (!isScrubbing && !morphed) {
      riseBars(plot, { duration: 800, stagger: 5 });
    }
    lastChartPlot = plot;
  }

  /* ---------- Events ---------- */
  modeButton.addEventListener("click", () => {
    mode = mode === "days" ? "percent" : "days";
    if (mode === "percent") percentSlider.value = "100";
    update();
  });

  percentSlider.addEventListener("input", () => {
    if (mode === "percent") update();
  });

  labelsCheckbox.addEventListener("change", () => {
    showLabels = !!labelsCheckbox.checked;
    update();
  });

  authorsCompareBus.addEventListener("authors:update", (e) => {
    renderAuthorsLabel(e.detail.authors);
    update();
  });

  update(true);
  return wrapper;
}
