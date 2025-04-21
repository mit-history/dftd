import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


export function createAnimatedLineChart(
  data,
  { width = 900, height = 500, duration = 100 } = {}
) {
  const computedWidth = width;
  const baseFontSize = Math.max(12, computedWidth * 0.015);
  const baseRadius = Math.max(2, computedWidth * 0.01);

  data = data.map((d) => ({
    ...d,
    performance_date: d.performance_date || d.date,
  }));

  const yearToUniqueDates = new Map();
  data.forEach((d) => {
    const year = d.year;
    if (year >= 1748 && year <= 1778) {
      if (!yearToUniqueDates.has(year)) yearToUniqueDates.set(year, new Set());
      yearToUniqueDates.get(year).add(d.performance_date);
    }
  });

  const formattedData = Array.from(yearToUniqueDates, ([year, dates]) => ({
    year,
    count: dates.size,
  })).sort((a, b) => a.year - b.year);

  const margin = { top: 20, right: 30, bottom: 70, left: 60 };
  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${computedWidth} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")


    .style("background", "#F5F5F5");

  const x = d3.scaleLinear().domain([1748, 1778]).range([margin.left, computedWidth - margin.right]);
  const y = d3.scaleLinear().domain([0, 366]).range([height - margin.bottom, margin.top]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .selectAll("text")
    .style("fill", "#333")
    .style("font-size", `${baseFontSize}px`);

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("fill", "#333")
    .style("font-size", `${baseFontSize}px`);

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.count))
    .curve(d3.curveMonotoneX);

  const path = svg
    .append("path")
    .datum(formattedData)
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", "0,1000")
    .attr("d", line);

  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid black")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("opacity", 0);

  const circles = svg
    .append("g")
    .selectAll("circle")
    .data(formattedData)
    .join("circle")
    .attr("cx", (d) => x(d.year))
    .attr("cy", (d) => y(d.count))
    .attr("r", baseRadius)
    .attr("fill", "#FF0000")
    .attr("opacity", 0)
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`Year: ${d.year}<br>Performances: ${d.count}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  path
    .attr("stroke-dasharray", path.node().getTotalLength())
    .attr("stroke-dashoffset", path.node().getTotalLength())
    .transition()
    .duration(duration * formattedData.length)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  circles
    .transition()
    .delay((d, i) => i * duration)
    .duration(100)
    .attr("opacity", 1);

  return svg.node();
}


// for all lines at once
export function createMultipleAnimatedLines(groups, { width = 900, height = 500, duration = 100 } = {}) {
  const baseFontSize = Math.max(12, width * 0.015);
  const baseRadius = Math.max(2, width * 0.01);

  const margin = { top: 20, right: 160, bottom: 60, left: 60 };
  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")

    .style("background", "#F5F5F5");

  const allData = groups.flatMap((g) => g.data);
  const years = d3.extent(allData, d => d.year);
  const maxY = d3.max(allData, d => d.count);

  const x = d3.scaleLinear().domain(years).range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([0, maxY]).nice().range([height - margin.bottom, margin.top]);
  const color = d3.scaleOrdinal().domain(groups.map(g => g.label)).range(["red", "blue", "green"]);

  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.count))
    .curve(d3.curveMonotoneX);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .selectAll("text")
    .style("fill", "#333")
    .style("font-size", `${baseFontSize}px`);

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("fill", "#333")
    .style("font-size", `${baseFontSize}px`);

  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "6px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("opacity", 0);

  groups.forEach(({ label, data }) => {
    const sorted = data.sort((a, b) => a.year - b.year);

    const path = svg.append("path")
      .datum(sorted)
      .attr("fill", "none")
      .attr("stroke", color(label))
      .attr("stroke-width", 2.5)
      .attr("d", line);

    const totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", `${totalLength},${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(duration * 30)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    svg.append("g")
      .selectAll("circle")
      .data(sorted)
      .join("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.count))
      .attr("r", baseRadius)
      .attr("fill", color(label))
      .attr("opacity", 0)
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`${label}<br>Year: ${d.year}<br>Count: ${d.count}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0))
      .transition()
      .delay((d, i) => i * 30)
      .duration(100)
      .attr("opacity", 1);
  });

  const legend = svg.append("g").attr("transform", `translate(${width - 120}, 30)`);
  groups.forEach(({ label }, i) => {
    const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
    g.append("rect").attr("width", 12).attr("height", 12).attr("fill", color(label));
    g.append("text").attr("x", 18).attr("y", 10).text(label).style("font-size", `${baseFontSize}px`).style("fill", "#333");
  });

  return svg.node();
}


export function createHeatmap(data, { width = 900, height = 500 } = {}) {
  const container = document.getElementById("map-container");
  const computedWidth = width || container.clientWidth || 900;

  console.log("Sample Data:", data.slice(0, 5));

  // make sure performance_date exists
  data = data.map((d) => ({
    ...d,
    performance_date: d.performance_date || d.date,
  }));

  // get year, month, and count unique days per (year, month)
  let heatmapData = new Map();

  data.forEach((d) => {
    const dateString =
      typeof d.performance_date == "string"
        ? d.performance_date
        : d.performance_date.toISOString();
    let [year, month, _] = dateString.split("-").map(Number);
    if (year >= 1748 && year <= 1778) {
      let key = `${year}-${month}`;
      if (!heatmapData.has(key)) {
        heatmapData.set(key, new Set());
      }
      heatmapData.get(key).add(d.performance_date);
    }
  });

  // Convert Map to array format [{year, month, count}]
  const formattedData = Array.from(heatmapData, ([key, dates]) => {
    let [year, month] = key.split("-").map(Number);
    return { year, month, count: dates.size };
  });

  const years = Array.from(new Set(formattedData.map((d) => d.year))).sort(
    (a, b) => a - b
  );
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const margin = { top: 20, right: 160, bottom: 60, left: 60 };
  const cellSize = 30;

  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${computedWidth} ${height + 100}`)
    .style("width", "100%")
    .style("height", "auto")

    .style("background", "#F5F5F5");

  const x = d3
    .scaleBand()
    .domain(years)
    .range([margin.left, width - margin.right])
    .padding(0.05);

  const y = d3
    .scaleBand()
    .domain(months)
    .range([margin.top, height - margin.bottom])
    .padding(0.05);

  // Color Scale (Dark Cool Blue → Yellow → Orange → Red)
  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(formattedData, (d) => d.count)])
    .interpolator(
      d3.interpolateRgbBasis(["#264653", "#fee090", "#fdae61", "#d73027"])
    );

  // Draw heatmap cells
  svg
    .append("g")
    .selectAll("rect")
    .data(formattedData)
    .join("rect")
    .attr("x", (d) => x(d.year))
    .attr("y", (d) => y(d.month))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", (d) => colorScale(d.count))
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke", "#FFFFFF").attr("stroke-width", 4);
      tooltip
        .style("opacity", 1)
        .html(
          `Year: ${d.year}<br>Month: ${d.month}<br>Performances: ${d.count}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", "none");
      tooltip.style("opacity", 0);
    });

  // X-Axis (Years)
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("fill", "#333333");

  // Y-Axis (Months)
  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3.axisLeft(y).tickFormat((d) => {
        return new Date(2000, d - 1, 1).toLocaleString("default", {
          month: "short",
        });
      })
    )
    .selectAll("text")
    .style("fill", "#333333");

  // Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "#FFFFFF")
    .style("border", "1px solid #666")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("opacity", 0);

  // color legend
  const legendWidth = 300;
  const legendHeight = 20;
  const legendX = computedWidth / 2 - legendWidth / 2;
  const legendY = height + 30;

  const legendScale = d3
    .scaleLinear()
    .domain([0, d3.max(formattedData, (d) => d.count)])
    .range([0, legendWidth]);

  const legendAxis = d3
    .axisBottom(legendScale)
    .ticks(5)
    .tickFormat(d3.format("d"));

  const legendGradient = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  legendGradient
    .selectAll("stop")
    .data([
      { offset: "0%", color: "#264653" }, // Dark Cool Blue
      { offset: "33%", color: "#fee090" }, // Yellow
      { offset: "66%", color: "#fdae61" }, // Orange
      { offset: "100%", color: "#d73027" }, // Red
    ])
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  svg
    .append("rect")
    .attr("x", legendX)
    .attr("y", legendY)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");

  svg
    .append("g")
    .attr("transform", `translate(${legendX},${legendY + legendHeight})`)
    .call(legendAxis)
    .selectAll("text")
    .style("fill", "#333333");

  svg
    .append("text")
    .attr("x", legendX + legendWidth / 2)
    .attr("y", legendY - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#333333")
    .text("Number of Performance Days");

  return svg.node();
}

export function createGenreProportionChart(data, { width = 400, height = 400 } = {}) {
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("width", "100%")
    .style("height", "auto")


    .style("background", "#f9f9f9");

  const genreRollup = d3.rollup(data, v => v.length, d => d.genre);
  const total = d3.sum(Array.from(genreRollup.values()));

  const genreCounts = Array.from(genreRollup, ([genre, count]) => ({
    genre,
    proportion: count / total
  })).sort((a, b) => d3.descending(a.proportion, b.proportion));

  const x = d3.scaleLinear()
    .domain([0, d3.max(genreCounts, d => d.proportion)])
    .range([100, width - 20]);

  const y = d3.scaleBand()
    .domain(genreCounts.map(d => d.genre))
    .range([20, height - 30])
    .padding(0.1);

  svg.append("g")
    .selectAll("rect")
    .data(genreCounts)
    .join("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.genre))
    .attr("width", d => x(d.proportion) - x(0))
    .attr("height", y.bandwidth())
    .attr("fill", "#69b3a2");

  svg.append("g")
    .selectAll("text")
    .data(genreCounts)
    .join("text")
    .attr("x", d => x(d.proportion) + 5)
    .attr("y", d => y(d.genre) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("fill", "#333")
    .text(d => `${(d.proportion * 100).toFixed(1)}%`);

  svg.append("g")
    .attr("transform", `translate(${x(0) - 5},0)`)
    .call(d3.axisLeft(y));

  return svg.node();
}
