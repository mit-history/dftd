import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running! Use /fetch-dutch-data to get data.");
});

app.get("/fetch-dutch-data", async (req, res) => {
  const endpoint = "https://api.lod.uba.uva.nl/datasets/CREATE/ONSTAGE/services/ONSTAGE/sparql";

  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX onstage: <http://lod.uba.uva.nl/CREATE/ONSTAGE/>

    SELECT ?performance ?title ?date
    WHERE {
      ?performance rdf:type onstage:Performance .
      ?performance onstage:title ?title .
      ?performance onstage:date ?date .
    }
    LIMIT 100
  `;

  const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;

  try {
    console.log(`🔄 Fetching data from: ${url}`);

    const response = await fetch(url);
    console.log(`✅ Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data received:", JSON.stringify(data, null, 2));

    const formattedData = data.results.bindings.map(d => ({
      title: d.title.value,
      performance_date: d.date.value
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching SPARQL data:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
