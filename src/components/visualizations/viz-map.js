import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import * as topojson from "npm:topojson-client";

/**
 * Build land feature from a TopoJSON 'world' object (e.g., countries-110m.json).
 */
export function landFromWorld(world) {
  return topojson.feature(world, world.objects.land);
}

/**
 * Circle domain used in your azimuthal equidistant projection.
 */
export function defaultCircle() {
  return d3.geoCircle().center([7, 50]).radius(10).precision(2)();
}

/**
 * Map plot for author counts by origin/city coordinates.
 * Expects rows: {longitude, latitude, count, origin}
 */
export function mapPlot(data, { author, startYear, endYear, width, height = 450, land, circle } = {}) {
  const title =
    author && startYear != null && endYear != null
      ? `Total number of performances of works by ${author}, ${startYear} - ${endYear}`
      : `Total number of performances`;

  return Plot.plot({
    title,
    width,
    height,
    projection: {
      type: "azimuthal-equidistant",
      rotate: [-7, -50],
      domain: circle ?? defaultCircle(),
      inset: 10
    },
    marks: [
      Plot.graticule(),
      Plot.geo(land, { fill: "currentColor", fillOpacity: 0.3 }),
      Plot.dot(data, {
        x: "longitude",
        y: "latitude",
        r: "count",
        fillOpacity: 0.2,
        channels: { origin: "origin" },
        tip: { format: { x: false, y: false, origin: true, count: true } }
      }),
      Plot.frame()
    ]
  });
}
