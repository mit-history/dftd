import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//  fix/add pause play buttons

export function createAnimatedLineChart(
  data,
  { width = 900, height = 500, duration = 100 } = {}
) {
  const container = document.getElementById("chart-container");
  const computedWidth = width || 900;

  console.log("Sample Data:", data.slice(0, 5));

  // Normalize dataset; ensure performance_date exists
  data = data.map((d) => ({
    ...d,
    performance_date: d.performance_date || d.date,
  }));

  // extract year and count unique performance days per year
  let yearToUniqueDates = new Map();

  data.forEach((d) => {
    let year = d.year;
    if (year >= 1748 && year <= 1778) {
      if (!yearToUniqueDates.has(year)) {
        yearToUniqueDates.set(year, new Set());
      }
      yearToUniqueDates.get(year).add(d.performance_date); // Count unique dates
    }
  });

  // Convert Map to array format [{year, count}]
  const formattedData = Array.from(yearToUniqueDates, ([year, dates]) => ({
    year,
    count: dates.size,
  })).sort((a, b) => a.year - b.year);

  const margin = { top: 20, right: 30, bottom: 70, left: 60 };

  // Create SVG container
  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${computedWidth} ${height}`)
    .style("width", "100%")
    .style("height", "auto")
    .style("background", "#F5F5F5");

  const x = d3
    .scaleLinear()
    .domain([1748, 1778])
    .range([margin.left, computedWidth - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(formattedData, (d) => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.count))
    .curve(d3.curveMonotoneX);

  // Add X-Axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .selectAll("text")
    .style("fill", "#333333");

  // Add Y-Axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("fill", "#333333");

  // Tooltip div
  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid black")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("opacity", 0);

  // Line path (initially hidden)
  const path = svg
    .append("path")
    .datum(formattedData)
    .attr("fill", "none")
    .attr("stroke", "#000000")
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", "0,1000")
    .attr("d", line);

  // Circles (Initially hidden)
  const circles = svg
    .append("g")
    .selectAll("circle")
    .data(formattedData)
    .join("circle")
    .attr("cx", (d) => x(d.year))
    .attr("cy", (d) => y(d.count))
    .attr("r", 5)
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

  let animationRunning = false;
  let animationTimer = null;

  function playAnimation() {
    if (animationRunning) return;
    animationRunning = true;

    path.attr("stroke-dasharray", null).attr("stroke-dashoffset", null);

    const totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", `${totalLength},${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(duration * formattedData.length)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);


    circles
      .attr("opacity", 0)
      .transition()
      .delay((d, i) => i * duration)
      .duration(100)
      .attr("opacity", 1);

    animationTimer = setTimeout(() => {
      animationRunning = false; // reset when animation completes
    }, duration * formattedData.length);
  }

  // function pauseAnimation() {
  //   d3.selectAll("circle").transition().duration(0); // stop circle transitions
  //   d3.selectAll("path").transition().duration(0); // stop line animation
  //   clearTimeout(animationTimer);
  //   animationRunning = false;
  // }

  // // create button container
  // const buttonContainer = document.createElement("div");
  // buttonContainer.id = "button-container";
  // buttonContainer.style.display = "flex";
  // buttonContainer.style.justifyContent = "center";
  // buttonContainer.style.marginTop = "10px";

  // // create play button
  // const playButton = document.createElement("button");
  // playButton.textContent = "▶ Play";
  // playButton.style.margin = "5px";
  // playButton.style.padding = "10px 20px";
  // playButton.style.fontSize = "16px";
  // playButton.style.cursor = "pointer";
  // playButton.style.background = "#FF7F7F";
  // playButton.style.color = "white";
  // playButton.style.border = "solid";
  // playButton.style.borderRadius = "5px";

  // playButton.addEventListener("click", () => {
  //   playAnimation();
  // });

  // // Create pause button
  // const pauseButton = document.createElement("button");
  // pauseButton.textContent = "⏸ Pause";
  // pauseButton.style.margin = "5px";
  // pauseButton.style.padding = "10px 20px";
  // pauseButton.style.fontSize = "16px";
  // pauseButton.style.cursor = "pointer";
  // pauseButton.style.background = "white";
  // pauseButton.style.color = "black";
  // pauseButton.style.border = "solid";
  // pauseButton.style.borderRadius = "5px";

  // pauseButton.addEventListener("click", () => {
  //   pauseAnimation();
  // });

  // buttonContainer.appendChild(playButton);
  // buttonContainer.appendChild(pauseButton);
  // if (!document.getElementById("button-container")) {
  //   container.appendChild(buttonContainer);
  // }

  // Start animation on load
  playAnimation();

  return svg.node();
}


// for all lines at once
export function createMultipleAnimatedLines(
  groups,
  { width = 900, height = 500, duration = 100 } = {}
) {
  const container = document.getElementById("chart-container");
  const margin = { top: 20, right: 160, bottom: 60, left: 60 };

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("width", "100%")
    .style("height", "auto")
    .style("background", "#F5F5F5");

  const allData = groups.flatMap((g) => g.data);
  const years = d3.extent(allData, (d) => d.year);
  const maxY = d3.max(allData, (d) => d.count);

  const x = d3.scaleLinear().domain(years).range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([0, maxY]).nice().range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.count))
    .curve(d3.curveMonotoneX);

  const color = d3
    .scaleOrdinal()
    .domain(groups.map((g) => g.label))
    .range(["red", "blue", "green"]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .selectAll("text")
    .style("fill", "#333")
    .style("font-size", "12px");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("fill", "#333")
    .style("font-size", "12px");

  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "6px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("opacity", 0);

  const paths = [];

  groups.forEach(({ label, data }) => {
    const sorted = data.sort((a, b) => a.year - b.year);

    const path = svg
      .append("path")
      .datum(sorted)
      .attr("fill", "none")
      .attr("stroke", color(label))
      .attr("stroke-width", 2.5)
      .attr("d", line);

    const totalLength = path.node().getTotalLength();

    path
      .interrupt()
      .attr("stroke-dasharray", `${totalLength},${totalLength}`)
      .attr("stroke-dashoffset", totalLength) // Reset before playing
      .transition()
      .duration(duration * 30)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)


    paths.push({ path, totalLength });

    svg
      .append("g")
      .selectAll("circle")
      .data(sorted)
      .join("circle")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.count))
      .attr("r", 4)
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
    g.append("text").attr("x", 18).attr("y", 10).text(label).style("font-size", "12px").style("fill", "#333");
  });

  // button functionality //
  let animationRunning = false;
  let animationTimer = null;

  function playAnimation() {
    if (animationRunning) return;
    animationRunning = true;

    paths.forEach(({ path, totalLength }) => {
      path
        .interrupt() // stop any previous animation
        .attr("stroke-dasharray", `${totalLength},${totalLength}`) // RESET this!
        .attr("stroke-dashoffset", totalLength) // RESET to start
        .transition()
        .duration(duration * 30)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("end", () => {
          animationRunning = false;
        });
    });

    svg.selectAll("circle")
      .interrupt()
      .attr("opacity", 0)
      .transition()
      .delay((d, i) => i * 30)
      .duration(100)
      .attr("opacity", 1);
  }




  // function pauseAnimation() {
  //   paths.forEach(({ path }) => {
  //     path.interrupt(); // Stop transition
  //     const currentOffset = parseFloat(path.attr("stroke-dashoffset"));
  //     path.attr("stroke-dashoffset", currentOffset); // Lock position
  //   });
  //   clearTimeout(animationTimer);
  //   animationRunning = false;
  // }


  // //  play pause Buttons //
  // const buttonContainer = document.createElement("div");
  // buttonContainer.id = "button-container";
  // buttonContainer.style.display = "flex";
  // buttonContainer.style.justifyContent = "center";
  // buttonContainer.style.marginTop = "10px";

  // const playButton = document.createElement("button");
  // playButton.textContent = "▶ Play";
  // playButton.className = "chart-button play";

  // const pauseButton = document.createElement("button");
  // pauseButton.textContent = "⏸ Pause";
  // pauseButton.className = "chart-button pause";

  // playButton.addEventListener("click", playAnimation);
  // pauseButton.addEventListener("click", pauseAnimation);

  // buttonContainer.appendChild(playButton);
  // buttonContainer.appendChild(pauseButton);
  // if (!container.querySelector("#button-container")) {
  //   container.appendChild(buttonContainer);
  // }

  // start animation
  playAnimation();

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
      d3.select(this).attr("stroke", "#FFFFFF").attr("stroke-width", 2);
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
