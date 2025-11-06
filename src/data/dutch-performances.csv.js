// taken from https://observablehq.com/framework/data-loaders

import {csvFormat} from "d3-dsv";
import {readFile} from "fs";
import {parse} from "csv-parse/sync";

readFile("src/data/dutch_data_1748_1798.csv", "utf8", (err, data) => {
    const parsed = parse(data, { columns: true });
    const transformed = parsed.map((record) => ({
        year: (new Date(record.date)).getFullYear(),
        date: record.date,
        title: record.originalTitle || record.playTitle,
        author: record.originalAuthorName || record.authorName
    }))
    process.stdout.write(csvFormat(transformed));
});

`Query used to get this data:

PREFIX schema: <https://schema.org/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT
  ?date
  ?playTitle
  # ?firstAuthorName
  (SAMPLE(?firstAuthorName) AS ?authorName)
  ?originalTitle
  # ?firstOriginalAuthorName
  (SAMPLE(?firstOriginalAuthorName) AS ?originalAuthorName)
WHERE {
  VALUES (?theaterEvent) { (schema:TheatreEvent) (schema:TheaterEvent) }

  OPTIONAL {
    ?work schema:isBasedOn ?original .
    ?original schema:creator ?originalAuthor .
    ?originalAuthor schema:name ?firstOriginalAuthorName .
    ?original schema:headline ?originalTitle .
  }

  ?work schema:headline ?playTitle ;
        schema:creator ?author .
  ?author schema:name ?firstAuthorName .

  ?performance schema:workPerformed ?work .
  ?show a ?theaterEvent ;
        schema:subEvent ?performance ;
        schema:startDate ?date .

  FILTER (
    ?date >= "1748-01-01"^^xsd:date &&
    ?date <= "1798-12-31"^^xsd:date
  )
}
GROUP BY ?date ?playTitle ?authorName ?originalTitle
ORDER BY ?date`
