import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

/**
 * Bar chart: performances per year, faceted by year, grouped by origin.
 */
export function compareYearsChart(data, { startYear, endYear, width, height = 500 } = {}) {
  const years = Array.from(new Set(data.map(d => d.year).filter(Boolean))).sort((a, b) => a - b);
  const n = years.length;
  const step =
    n > 60 ? 10 :
    n > 40 ? 5 :
    n > 25 ? 2 : 1;
  const yearTicks = years.filter((_, i) => i % step === 0);

  const title =
    startYear != null && endYear != null
      ? `Compare performances per year, ${startYear}–${endYear}`
      : `Compare performances per year`;

  return Plot.plot({
    title,
    fx: { label: null, padding: 0.1 },
    x: { axis: null, paddingOuter: 0.2 },
    y: { grid: true, label: "Performances", domain: [0, 366] },
    color: { legend: true },
    width,
    height,
    marginBottom: 60,
    marks: [
      Plot.barY(data, Plot.groupX({ y2: "count" }, { x: "origin", fx: "year", fill: "origin", tip: true })),
      Plot.ruleY([0]),
      Plot.axisFx({
        ticks: yearTicks,
        tickFormat: d => String(d),
        anchor: "bottom"
      })
    ]
  });
}

/**
 * Percentage of performances per year by origin for a selected author.
 * Expects data rows like: {year, origin, percentage}
 */
export function percentageYearsChart(data, { author, startYear, endYear, width, height = 500 } = {}) {
  const title =
    author && startYear != null && endYear != null
      ? `Percentage of performances per year of works by ${author}, ${startYear} - ${endYear}`
      : `Percentage of performances per year`;

  return Plot.plot({
    title,
    fx: { padding: 0, label: null },
    x: { axis: null, paddingOuter: 0.2 },
    y: { grid: true, label: "Percentage" },
    color: { legend: true },
    width,
    height,
    marks: [
      Plot.barY(data, { x: "origin", y: "percentage", fx: "year", fill: "origin", tip: true }),
      Plot.ruleY([0])
    ]
  });
}

/**
 * Summarize performances by genre buckets across years for divergent plot.
 */
export function processPerformanceGenres(fullData, comedyData, dramaData, tragedyData, balletData, origin) {
  const allYears = d3.rollup(fullData, v => v.length, d => d.year);
  const comedyYears = d3.rollup(comedyData, v => v.length, d => d.year);
  const dramaYears = d3.rollup(dramaData.concat(tragedyData), v => v.length, d => d.year);
  const balletYears = d3.rollup(balletData, v => v.length, d => d.year);

  return Array.from(allYears, ([year, total]) => {
    const comedy = comedyYears.get(year) || 0;
    const drama = dramaYears.get(year) || 0;
    const ballet = balletYears.get(year) || 0;
    const other = total - comedy - drama - ballet;
    return {
      year: +year,
      origin,
      comedy,
      drama,
      ballet,
      other,
      percent: {
        comedy: comedy / total,
        drama: drama / total,
        ballet: ballet / total,
        other: other / total
      }
    };
  });
}

export function genreLegend({ domain, range, title = "Legend", columns = 2 } = {}) {
  return Plot.legend({
    color: { domain, range },
    title,
    columns
  });
}

/**
 * Diverging stacked bars (Danish negative, French positive).
 * Expects precomputed summaries for danish_summary and french_summary.
 */
export function divergentPlot({
  danish_summary,
  french_summary,
  startYear,
  endYear,
  width,
  height = 700,
  colorDomain,
  colorRange
} = {}) {
  const title =
    startYear != null && endYear != null
      ? `Diverging Genre Performance Chart (${startYear} - ${endYear})`
      : `Diverging Genre Performance Chart`;

  return Plot.plot({
    title,
    width,
    height,
    x: { label: "Number of Performances", tickFormat: Math.abs },
    y: { label: "Year", reverse: true, tickFormat: d => String(d) },
    color: { domain: colorDomain, range: colorRange },
    marks: [
      Plot.barX(
        danish_summary.flatMap(d => {
          const parts = [];
          let x = 0;
          for (const type of ["comedy", "drama", "ballet", "other"]) {
            const value = d[type];
            parts.push({
              year: d.year,
              x1: -x,
              x2: -(x + value),
              type,
              origin: "danish",
              percent: `${Math.round(d.percent[type] * 100)}%`
            });
            x += value;
          }
          return parts;
        }),
        { x1: "x1", x2: "x2", y: "year", fill: d => `${d.origin}-${d.type}` }
      ),
      Plot.barX(
        french_summary.flatMap(d => {
          const parts = [];
          let x = 0;
          for (const type of ["comedy", "drama", "ballet", "other"]) {
            const value = d[type];
            parts.push({
              year: d.year,
              x1: x,
              x2: x + value,
              type,
              origin: "french",
              percent: `${Math.round(d.percent[type] * 100)}%`
            });
            x += value;
          }
          return parts;
        }),
        { x1: "x1", x2: "x2", y: "year", fill: d => `${d.origin}-${d.type}` }
      ),
      Plot.ruleX([0]),
      Plot.text(
        danish_summary.flatMap(d => {
          const labels = [];
          let x = 0;
          for (const type of ["comedy", "drama", "ballet", "other"]) {
            const value = d[type];
            if (value > 0) labels.push({ year: d.year, x: -(x + value / 2), text: `${Math.round(d.percent[type] * 100)}%` });
            x += value;
          }
          return labels;
        }),
        { x: "x", y: "year", text: "text", textAnchor: "middle" }
      ),
      Plot.text(
        french_summary.flatMap(d => {
          const labels = [];
          let x = 0;
          for (const type of ["comedy", "drama", "ballet", "other"]) {
            const value = d[type];
            if (value > 0) labels.push({ year: d.year, x: x + value / 2, text: `${Math.round(d.percent[type] * 100)}%` });
            x += value;
          }
          return labels;
        }),
        { x: "x", y: "year", text: "text", textAnchor: "middle" }
      )
    ]
  });
}
