// taken from https://observablehq.com/framework/data-loaders

import {csvFormat} from "d3-dsv";
import {readFile} from "fs";

await readFile("src/data/danish-works.json", (err, data) => {
    const workMap = new Map(JSON.parse(data).map(work => [work.id, work]));

    // genre, play title, play author, performance date, performance location
    readFile("src/data/danish-performances.json", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        const collection = JSON.parse(data);

        // Convert to an array of objects.
        const features = collection.map((f) => {
            const date = new Date(f.date)
            const work_objs = f.production.works.map(work => workMap.get(work.id.toString()))
            
            return {
                id: f.id,
                date: date,
                year: date.getFullYear(),
                title: f.production.works.map(work => work.title),
                production: f.production,
                works: work_objs,
                genre: work_objs.map(work => work?.genres[0]?.name),
                place: f.place?.name
            }
        });

        // console.log(features.production);

        // console.log(works.filter(w => w.id == '614')) // works.filter(w => w.id === '1')[0]

        // Output CSV.
        process.stdout.write(csvFormat(features));
    });

});