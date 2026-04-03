console.log('Running Insert-via-XLSX...\n');

const dbFilename = 'music.db';

// Setup objects for sqlite access and the file reader
const ex = require('exceljs');
const sq = require('sqlite3');
const db = new sq.Database(dbFilename);

// Initiate empty errors array for logging any failed rows
const errors = [];

function insertSong(title, artist, album, year) {
    const sqlScript = `INSERT INTO Songs (Title, Artist, Album, Year) VALUES ('${sani(
        title,
    )}', '${sani(artist)}', '${sani(album)}', ${year})`;
    db.run(sqlScript, [], (err) => {
        if (err) {
            console.error(`Error running:\n${sqlScript}\n${err}`);
        }
    });
    console.log('▶️ ' + sqlScript);
}

function sani(st) {
    return st.replace(/\'/g, "''");
}

async function main() {
    const workbook = new ex.Workbook();
    await workbook.xlsx.readFile('./in.xlsx');

    workbook.eachSheet((sheet) => {
        const headers = {};
        sheet.getRow(1).eachCell((cell, colNumber) => {
            headers[colNumber] = cell.value;
        });

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const rowData = {};
            row.eachCell((cell, colNumber) => {
                rowData[headers[colNumber]] = cell.value;
            });

            // Uncomment below to log the data on each row
            // console.log(`${sheet.name} Row ${rowNumber - 1}: `, rowData);
            insertSong(
                rowData.Title,
                rowData.Artist,
                rowData.Album,
                rowData.Year,
            );
        });
    });
}

main();
