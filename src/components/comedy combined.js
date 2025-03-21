import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function createComedyPerformanceChart(frenchData, dutchData, { width = 800, height = 500 } = {}) {
    console.log(frenchData, dutchData);
    // Unified format to standardize time fields across different data sets
    function normalizeData(data, language) {
        if (!data) {
            return [];
        }
        return data
            .filter(d => d.genre === "comédie" || d.genre === "comedy") // only filtering comedy
            .map(d => ({
                year: new Date(d.date_de_creation || d.date || d.performance_date).getFullYear(),
                language: language
            }))
            .filter(d => !isNaN(d.year)); // Filter out invalid years
    }

    const combinedData = [
        ...normalizeData(frenchData, "French"),
        ...normalizeData(dutchData, "Dutch"),
        // ...normalizeData(danishData, "Danish")
    ];

    // comedy number by year
    const performanceCounts = d3.rollup(
        combinedData,
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
        .attr("fill", "steelblue");

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
