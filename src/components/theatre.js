import * as d3 from "npm:d3";

export function pie(data, {width, height} = {}) {
    data = data
        .map(d => d.genre)
        .reduce((acc, freq) => {
            acc[freq] = (acc[freq] || 0) + 1;
            return acc;
        }, {})

    data = Object.entries(data).map(([genre, frequency]) => ({
        genre, frequency
    }))

    const radius = Math.min(width, height) / 2

    const pie = d3.pie()
        .value(d => d.frequency)

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    const color = d3.scaleOrdinal(d3.schemeObservable10)

    svg.append("g")
        .selectAll()
        .data(pie(data))
        .join("path")
            .attr("fill", d => color(d.data.genre))
            .attr("d", arc)
        .append("title")
            .text(d => `${d.data.genre}: ${d.data.frequency}`);

    return svg.node();
}