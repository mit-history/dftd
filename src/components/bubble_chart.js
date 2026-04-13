import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

export function BubbleChart(data, {
  name = ([x]) => x, // alias for label
  label = name, // given d in data, returns text to display on the bubble
  value = ([, y]) => y, // given d in data, returns a quantitative size
  group, // given d in data, returns a categorical value for color
  title, // given d in data, returns text to show on hover
  link, // given a node d, its link (if any)
  linkTarget = "_blank", // the target attribute for links, if any
  width = 640, // outer width, in pixels
  height = width, // outer height, in pixels
  padding = 3, // padding between circles
  margin = 1, // default margins
  marginTop = margin, // top margin, in pixels
  marginRight = margin, // right margin, in pixels
  marginBottom = margin, // bottom margin, in pixels
  marginLeft = margin, // left margin, in pixels
  groups, // array of group names (the domain of the color scale)
  colors = d3.schemeTableau10, // an array of colors (for groups)
  fill = "#ccc", // a static fill color, if no group channel is specified
  fillOpacity = 0.7, // the fill opacity of the bubbles
  stroke, // a static stroke around the bubbles
  strokeWidth, // the stroke width around the bubbles, if any
  strokeOpacity, // the stroke opacity around the bubbles, if any
  fontSize = 10, // font size for labels
} = {}) {
  // Compute the values.
  const D = d3.map(data, d => d);
  const V = d3.map(data, value);
  const G = group == null ? null : d3.map(data, group);
  const I = d3.range(V.length).filter(i => V[i] > 0);

  // Unique the groups.
  if (G && groups === undefined) groups = I.map(i => G[i]);
  groups = G && new d3.InternSet(groups);

  // Construct scales.
  const color = G && d3.scaleOrdinal(groups, colors);

  // Compute labels and titles.
  const L = label == null ? null : d3.map(data, label);
  const T = title === undefined ? L : title == null ? null : d3.map(data, title);

  // Compute layout: create a 1-deep hierarchy, and pack it.
  const root = d3.pack()
      .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
      .padding(padding)
    (d3.hierarchy({children: I})
      .sum(i => V[i]));

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-marginLeft, -marginTop, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("fill", "currentColor")
      .attr("font-size", fontSize)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");

  const leaf = svg.selectAll("a")
    .data(root.leaves())
    .join("a")
      .attr("xlink:href", link == null ? null : (d, i) => link(D[d.data], i, data))
      .attr("target", link == null ? null : linkTarget)
      .attr("transform", d => `translate(${d.x},${d.y})`);

  leaf.append("circle")
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-opacity", strokeOpacity)
      .attr("fill", G ? d => color(G[d.data]) : fill == null ? "none" : fill)
      .attr("fill-opacity", fillOpacity)
      .attr("r", d => d.r);

  if (T) leaf.append("title")
      .text(d => T[d.data]);

  if (L) {
    // A unique identifier for clip paths (to avoid conflicts).
    const uid = `O-${Math.random().toString(16).slice(2)}`;

    leaf.append("clipPath")
        .attr("id", d => `${uid}-clip-${d.data}`)
      .append("circle")
        .attr("r", d => d.r);

    leaf.append("text")
        .attr("clip-path", d => `url(${new URL(`#${uid}-clip-${d.data}`, location)})`)
      .selectAll("tspan")
      .data(d => `${L[d.data]}`.split(/\n/g))
      .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
        .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
        .text(d => d);
  }

  return Object.assign(svg.node(), {scales: {color}});
}

export function genreBubble(formatted_data, author){
  // filter data to only include selected author
  const author_formatted_data = (author != "No author")? formatted_data.filter(d => d.author == author) : formatted_data;

  // count number of performances by genre
  const count_by_genre = Object.entries(author_formatted_data.reduce((acc, d) => {
    acc[d.genre] = (acc[d.genre] || 0) + 1;
    return acc;
  }, {})).map(c => ({genre: c[0], count: c[1]}));
}

export function authorBubble(data, origin, season = 0, threshold = [0,0], season_start, season_end, mode){

  const percent = mode == "percentage";

  //filter unwanted data; convert to list of {author: str, count: number} objects
  let authors = Object.entries(data.filter(d => (d.origin == origin) && (Number(d.year) <= season_end) && (Number(d.year) >= season_start)).reduce((acc, d) => {
      acc[d.author] = (acc[d.author] || 0) + 1;
      return acc;
  }, {})).map(c => {return {author: c[0], count: c[1]}});
  const performance_count = percent?authors.reduce((count, author) => {return count + author.count}, 0):1;
  authors = percent?authors.filter(c => (100*c.count/performance_count >= threshold[0] && 100*c.count/performance_count <= threshold[1])):authors.filter(c => c.count >= threshold[0] && c.count <= threshold[1]);


  const percentage_sign = percent?"%":"";
  const percentage_multiplier = percent?100:1;
  //make actual chart
  return BubbleChart(authors, {
    //attempt to filter out first names for readability
    label: d => {
      const author = d.author||'unknown'
      if(author.indexOf(' ') === -1)
        return author;
      if (author.indexOf('(') !== -1)
        return author.substring(0, author.indexOf('('));
      if (author.indexOf(',') !== -1)
        return author.substring(0, author.indexOf(','));
      return author.substring(author.lastIndexOf(' ')+1);
    },
    value: d => (d.count/performance_count)*percentage_multiplier,
    title: d => `${d.author||'unknown'} - ${parseFloat(((d.count/performance_count)*percentage_multiplier).toPrecision(3))}${percentage_sign}`,
    group: d => d.author[0],
    width: 700,
    fontSize: 10
  })
}
