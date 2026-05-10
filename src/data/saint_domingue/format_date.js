import { csvFormat } from "d3-dsv";
import { writeFile } from "fs";
import xlsx from "node-xlsx";

const stdmg = xlsx.parse('./saint_domingue.xlsx');
const base_date = new Date(1900, 0, 1);
const ms_per_day =  24 * 60 * 60 * 1000;
const formatted_stdmg = stdmg[0].data.filter(p => {
    return p[0] !== 'Serial' && p[6] !== null && p[6] !== undefined}).map(p => {

    const origin ='saint-domingue'
    let date, titles, genre, place, author, year;
    date = new Date(base_date.getTime() + (p[6]-2)*ms_per_day);
    titles = p[4];
    genre = p[9];
    place = p[5];
    author = p[7];
    year = date.getFullYear();

    return {
        date,
        title: titles,
        genre,
        place,
        author,
        year,
        origin
    }

});
const jsonData = JSON.stringify(formatted_stdmg, null, 4);
writeFile(`formatted_saint_domingue.json`, jsonData, 'utf8', e =>{
    if (e){
        console.error('error writing to file', e);
    }else{
        console.log(`done`);
    }
});
