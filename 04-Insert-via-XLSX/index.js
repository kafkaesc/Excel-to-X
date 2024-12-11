console.log('Running Insert-via-XLSX...\n');

const dbFilename = 'music.db';

// Setup objects for sqlite access, file system, and the file reader
const sq = require('sqlite3');
const fs = require('fs');
const fr = require('xlsx');
const db = new sq.Database(dbFilename);
const inFile = fr.readFile('./in.xlsx');
const sheets = inFile.SheetNames;

// Initiate empty errors array for logging any failed rows
const errors = [];

function sani(st) {
    return st.replace(/\'/g, "''");
}

for (let i = 0; i < sheets.length; i++) {
    const sheet = fr.utils.sheet_to_json(inFile.Sheets[inFile.SheetNames[i]]);
    for (let j = 0; j < sheet.length; j++) {
        // Uncomment below to log the data on each row
        console.log(`${inFile.SheetNames[i]} Row ${j + 1}: `, sheet[j]);
    }
}
