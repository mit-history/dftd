// taken from https://observablehq.com/framework/data-loaders

import {csvFormat} from "d3-dsv";

// Fetch data
const response = await fetch("https://hack.cfregisters.org/data/json/plays.json");
if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
const collection = await response.json();

// Convert to an array of objects.
const features = collection.map((f) => ({
  title: f.title,
  author: f.author,
  genre: f.genre
}));

// Output CSV.
process.stdout.write(csvFormat(features));