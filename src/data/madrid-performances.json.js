import * as XLSX from 'xlsx';
import { readFileSync, writeFile } from 'fs';

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
    // return [];
    const empty = new Set(["", " ", null, undefined]);
    const isWhitespace = str => !/\S/.test(str)
    const getVal = v => {
        return isWhitespace(v)||empty.has(v)?null:v;
    }
    const data = readFileSync("./src/data/madrid-database.xlsx");
    const workbook = XLSX.read(data);
    const madrid = {
        'Teatro del Príncipe': null,
        'Teatro de la Cruz': null
    };

    for(const theater of Object.keys(madrid)){
        madrid[theater] = XLSX.utils.sheet_to_json(workbook.Sheets[theater]).reduce((acc, p) => {
            const dateString = getVal(p['Performance Date'])?.split(' ');
            for (let i = 1; i < 4; i++){
                const g = {
                    title: getVal(p[`Play ${i} Title`]),
                    author: getVal(p[`Author 1 Play ${i} Name`]),
                    genre: getVal(p[`Play ${i} Genre`]),
                    date: dateString? new Date(Number(dateString[2]), MONTHS[dateString[1]], Number(dateString[0])):null,
                    year: dateString? dateString[2]:null
                };

                if (p[`Author 2 Play ${i} Name`])
                    g.author += ', '+p[`Author 2 Play ${i} Name`]

                acc.push(g)
                // if(g.author == "Francisco de Rojas Zorrilla, Francisco de Rojas Zorrilla"){
                //     console.log(theater)
                //     console.log(g)
                // }
                return acc;
            }

        }, []).filter(d => d.title||d.author||d.genre);
    }

    return madrid;
}

const plays = await load();
// console.log(plays)

// writeFile(`madrid_authors.json`, JSON.stringify([...new Set(plays['Teatro de la Cruz'].map(d=>d.author), plays['Teatro del Príncipe'].map(d=>d.author))], null, 4), 'utf8', e =>{
//     if (e){
//         console.error('error writing to file', e);
//     }else{
//         console.log(`done`);
//     }
// });

process.stdout.write(JSON.stringify(plays));
