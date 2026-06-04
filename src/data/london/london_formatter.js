import Papa from "papaparse";
import fs from "fs";
const csvFile = fs.readFileSync("LSDB-TransnationalStages-Sample.csv", "utf8");

// Assuming 'csvFile' is a File object from an input element
Papa.parse(csvFile, {
  header: true, // Treat the first row as headers
  dynamicTyping: true, // Automatically convert types
  skipEmptyLines: true, // Ignore empty rows
  complete: function(results) {
    console.log("Finished parsing");
    const formatted_data = results.data.map(d=>{
        const entry = {}

        let date = String(d['EventDate'])
        date = date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 8);
        entry['date'] = new Date(date)
        entry['author'] = d['AuthorName'];
        entry['genre'] = d['TheatronomicsGenreLabel']
        entry['title'] = d['PerformanceTitle']
        entry['place'] = d['Theatre']
        entry['origin'] = 'london';
        entry['year'] = Number(date.slice(0, 4));

        for (const key in entry){
            if (entry[key] == 'NULL' || entry[key] == 'ull]')
                entry[key] = null;
        }
        return entry
    })
    const jsonData = JSON.stringify(formatted_data, null, 4);
    fs.writeFile(`formatted_london.json`, jsonData, 'utf8', e =>{
        if (e){
            console.error('error writing to file', e);
        }else{
            console.log(`done`);
        }
    });
    // Now you have a clean array of objects to work with!
  },
  error: function(error) {
    console.error("Error parsing CSV:", error);
  }
})
