import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

const MONTHS = {
    Enero: 0,
    Febrero: 1,
    Marzo: 2,
    Abril: 3,
    Mayo: 4,
    Junio: 5,
    Julio: 6,
    Agosto: 7,
    Septiembre: 8,
    Octubre: 9,
    Noviembre: 10,
    Diciembre: 11
}


export async function load() {
    const data = readFileSync("./src/data/madrid-database.xlsx");
    const workbook = XLSX.read(data);
    const madrid = {
        'Teatro del Príncipe': null,
        'Teatro de la Cruz': null
    };

    for(const theater of Object.keys(madrid)){
        madrid[theater] = XLSX.utils.sheet_to_json(workbook.Sheets[theater]).reduce((acc, p) => {
            const dateString = p['Performance Date']?.split(' ');
            for (let i = 1; i < 4; i++){
                acc.push({
                    title: p[`Play ${i} Title`]||null,
                    author: p[`Author ${i} Name`]||null,
                    genre: p[`Play ${i} Genre`]||null,
                    date: dateString? new Date(Number(dateString[2]), MONTHS[dateString[1]], Number(dateString[0])):null,
                    year: dateString? dateString[2]:null
                });
            }
            return acc;
        }, []);
    }

    return madrid;
}

const plays = await load();
// console.log(plays)

process.stdout.write(JSON.stringify(plays));
