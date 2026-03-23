import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


// try loading the dutach data and then exporting as json

export function createBarChart(data, { width = 800, height = 500 } = {}) {
  console.log("Sample Data:", data.slice(0, 5));

  // normalize Dutch dataset; make sure performance_date exists as a field
  data = data.map(d => ({
      ...d,
      performance_date: d.performance_date || d.date // Use 'date' if 'performance_date' is missing
  }));

  let filteredData = data
      .map(d => ({ ...d, year: parseInt(d.performance_date.split("-")[0]) }))
      .filter(d => d.year >= 1748 && d.year <= 1778);

  const performanceCounts = d3.rollup(
      filteredData,
      v => v.length,
      d => d.year
  );

  const formattedData = Array.from(performanceCounts, ([year, count]) => ({ year, count }));
  formattedData.sort((a, b) => a.year - b.year);

  const margin = { top: 20, right: 30, bottom: 70, left: 60 };

  const svg = d3.create("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto");

  const x = d3.scaleBand()
      .domain(formattedData.map(d => d.year))
      .range([margin.left, width - margin.right])
      .padding(0.1);

  const y = d3.scaleLinear()
      .domain([0, d3.max(formattedData, d => d.count)]).nice()
      .range([height - margin.bottom, margin.top]);

  svg.append("g")
      .selectAll("rect")
      .data(formattedData)
      .join("rect")
      .attr("x", d => x(d.year))
      .attr("y", d => y(d.count))
      .attr("height", d => y(0) - y(d.count))
      .attr("width", x.bandwidth())
      .attr("fill", (d, i) => i % 2 === 0 ? "steelblue" : "steelblue");

  svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

  svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

  return svg.node();
}



export function createComedyChart(data, { width = 800, height = 500 } = {}) {
  const filteredData = data.filter(d => d.genre === "comédie");



  const theaterCounts = d3.rollup(
    filteredData,
    v => v.length,
    d => d.theater
  );

  const formattedData = Array.from(theaterCounts, ([theater, count]) => ({ theater, count }));
  console.log("Formatted Data comed:", formattedData.map(d => d.year));


  const margin = { top: 20, right: 30, bottom: 70, left: 60 };

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(formattedData.map(d => d.theater))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(formattedData, d => d.count)]).nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .selectAll("rect")
    .data(formattedData)
    .join("rect")
    .attr("x", d => x(d.theater))
    .attr("y", d => y(d.count))
    .attr("height", d => y(0) - y(d.count))
    .attr("width", x.bandwidth())
    .attr("fill", "steelblue");

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  return svg.node();
}
