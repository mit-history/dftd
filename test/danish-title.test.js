import assert from "node:assert/strict";
import test from "node:test";

import {clipFormattedTitle, danishPerformanceTitle} from "../src/components/danish-title.js";

const VENUE = "Royal Danish Theatre, Kongens Nytorv";

function performance(formatted_title, {date = "1752-11-06 AD", place = VENUE} = {}) {
  return {formatted_title, date, place: {name: place}};
}

test("keeps only the work title for Royal Danish Theatre performances", () => {
  assert.equal(
    danishPerformanceTitle(
      performance(
        "Amphitryon by The Royal Danish Theatre at Royal Danish Theatre, Kongens Nytorv (1748-12-16 AD)",
        {date: "1748-12-16 AD"}
      )
    ),
    "Amphitryon"
  );
});

test("keeps only the work title for the Italian opera company", () => {
  assert.equal(
    danishPerformanceTitle(
      performance(
        "Il marito vizioso by Italian opera company at Royal Danish Theatre, Kongens Nytorv (1750-12-18 AD)",
        {date: "1750-12-18 AD"}
      )
    ),
    "Il marito vizioso"
  );
});

test("keeps only the work title for companies the calendar never listed", () => {
  assert.equal(
    danishPerformanceTitle(
      performance(
        "Porsugnacco by Mingotti's Italian opera troupe at Royal Danish Theatre, Kongens Nytorv (1752-11-28 AD)",
        {date: "1752-11-28 AD"}
      )
    ),
    "Porsugnacco"
  );
  assert.equal(
    danishPerformanceTitle(
      performance(
        "Zulima by Det Dramatiske Selskab at Royal Danish Theatre, Kongens Nytorv (1774-01-04 AD)",
        {date: "1774-01-04 AD"}
      )
    ),
    "Zulima"
  );
});

test("keeps the whole work title when no company is named", () => {
  assert.equal(
    danishPerformanceTitle(
      performance("Fyrværkerie at Royal Danish Theatre, Kongens Nytorv (1752-11-06 AD)")
    ),
    "Fyrværkerie"
  );
  assert.equal(
    danishPerformanceTitle(
      performance(
        "Pittoresk-mathematisk Forestilling og Fyrværkeri af Toscani at Royal Danish Theatre, Kongens Nytorv (1752-10-24 AD)",
        {date: "1752-10-24 AD"}
      )
    ),
    "Pittoresk-mathematisk Forestilling og Fyrværkeri af Toscani"
  );
});

test("does not cut a work title that itself contains ' by '", () => {
  assert.equal(
    danishPerformanceTitle(
      performance(
        "Elverhøj by Moonlight by The Royal Danish Theatre at Royal Danish Theatre, Kongens Nytorv (1780-05-02 AD)",
        {date: "1780-05-02 AD"}
      )
    ),
    "Elverhøj by Moonlight"
  );
});

test("prefers the titles of the linked works when the export has them", () => {
  const perf = performance(
    "Amphitryon by The Royal Danish Theatre at Royal Danish Theatre, Kongens Nytorv (1748-12-16 AD)",
    {date: "1748-12-16 AD"}
  );
  perf.production = {works: [{title: "Amphitryon"}, {title: "Den Stundesløse"}]};
  assert.equal(danishPerformanceTitle(perf), "Amphitryon; Den Stundesløse");
});

test("falls back to the production title, then to Untitled", () => {
  assert.equal(
    danishPerformanceTitle({
      date: "1748-12-16 AD",
      place: {name: VENUE},
      production: {formatted_title: "Amphitryon by The Royal Danish Theatre (1748 AD)"}
    }),
    "Amphitryon"
  );
  assert.equal(danishPerformanceTitle({date: "1748-12-16 AD", place: {name: VENUE}}), "Untitled");
  assert.equal(danishPerformanceTitle(undefined), "Untitled");
});

test("clipFormattedTitle leaves an unexpected shape untouched", () => {
  assert.equal(clipFormattedTitle("Fyrværkerie"), "Fyrværkerie");
  assert.equal(clipFormattedTitle("Fyrværkerie", {place: VENUE, date: "1799-01-01 AD"}), "Fyrværkerie");
  assert.equal(clipFormattedTitle(null), "");
});
