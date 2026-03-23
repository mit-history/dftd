# Dutch Data Source

The Query is made to https://lod.uba.uva.nl/CREATE/ONSTAGE/sparql
  - It was copy pasted into the text box and then exported out as a csv file

FULL QUERY BELOW:

    PREFIX schema: <https://schema.org/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT
      ?date
      ?playTitle
      (SAMPLE(?firstAuthorName) AS ?authorName)
      ?originalTitle
      (SAMPLE(?firstOriginalAuthorName) AS ?originalAuthorName)
    WHERE {
      VALUES (?theaterEvent) { (schema:TheatreEvent) (schema:TheaterEvent) }


      ?work schema:headline ?playTitle ;
            schema:creator ?author .
      ?author schema:name ?firstAuthorName .

      ?performance schema:workPerformed ?work .
      ?show a ?theaterEvent ;
            schema:subEvent ?performance ;
            schema:startDate ?date .
      OPTIONAL {
        ?work schema:isBasedOn ?original .
        ?original schema:creator ?originalAuthor .
        ?originalAuthor schema:name ?firstOriginalAuthorName .
        ?original schema:headline ?originalTitle .
      }

      FILTER (
        ?date >= "1748-01-01"^^xsd:date &&
        ?date <= "1798-12-31"^^xsd:date
      )
    }
    GROUP BY ?date ?playTitle ?authorName ?originalTitle
    ORDER BY ?date
