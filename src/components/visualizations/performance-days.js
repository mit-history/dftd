// The imperative chart mounting logic for the "Days with Performances" visualization.

export function renderPerformanceDays({
  performanceDays,
  origins,
  genre_data,
  danish_filtered_data,
  french_filtered_data,
  combined_data,
  asDate,
  start_date,
  end_date,
  window,
  document,
  createMultipleAnimatedLines,
  createHeatmap
}) {
  if (!performanceDays) return;

  const lineMount = document.getElementById("line-chart-container");
  const heatMount = document.getElementById("heatmap-container");
  if (!lineMount || !heatMount) return;

  // summarize only what’s in the current date window
  function summarize(dataset, label) {
    const map = new Map();
    dataset.forEach(d => {
      const dt = asDate(d.date);
      if (!dt) return;
      if (dt < start_date || dt > end_date) return;
      const year = d.year ?? dt.getUTCFullYear();
      if (!map.has(year)) map.set(year, new Set());
      map.get(year).add(dt.toISOString().slice(0, 10)); // day-level uniqueness
    });
    const summary = Array.from(map, ([year, dates]) => ({
      year,
      count: dates.size
    })).sort((a, b) => a.year - b.year);

    return { label, data: summary };
  }

  const originToData = {
    danish: danish_filtered_data,
    french: french_filtered_data,
    dutch: combined_data
      .filter(d => d.origin === "dutch")
      .filter(d => {
        const dt = asDate(d.date);
        return dt && dt >= start_date && dt <= end_date;
      })
  };

  const summarized_data = origins.map(origin =>
    summarize(originToData[origin] ?? [], origin)
  );

  // clear old charts
  lineMount.innerHTML = "";
  heatMount.innerHTML = "";

  const containerWidth = (window?.innerWidth ?? 1200) * 0.45;

  if (origins.length > 0) {
    lineMount.append(
      createMultipleAnimatedLines(summarized_data, { width: containerWidth, height: 600 })
    );
    heatMount.append(
      createHeatmap(genre_data, { width: containerWidth, height: 600 })
    );
  }
}
