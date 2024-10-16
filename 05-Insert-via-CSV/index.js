console.log('Running Insert-via-CSV...\n');

// Setup objects for axios, file system, csv parser, and the file reader
const ax = require('axios');
const fs = require('fs');
const cp = require('csv-parse');
const fr = cp.parse({ columns: true, delimiter: ',' });

// Initiate empty errors array for logging any failed rows
const errors = [];

// Initiate empty promises array for tracking SQL inserts
const promises = [];

function insertSong(title, artist, album, year) {
    const sqlScript = `INSERT INTO Songs (Title, Artist, Album, Year) VALUES ('${title}', '${artist}', '${album}', ${year})`;
    console.log('▶️ ' + sqlScript);
}

let i = 1;
fs.createReadStream('in.csv')
    .pipe(fr)
    .on('data', (row) => {
        // Uncomment below to log the data on each row
        // console.log(`Row ${i}: `, row);
        insertSong(row.Title, row.Artist, row.Album, row.Year);
        i++;
    })
    .on('end', () => {
        // Once all promises have resolved, check for errors and close
        Promise.all(promises).then(() => {
            if (errors.length > 0) {
                const errMessage = `\n${errors.length} error(s) found, logging to errors.json\n`;
                console.log(errMessage);
                fs.writeFile('errors.json', JSON.stringify(errors), () => {});
            } else {
                console.log('\nDownloads finished, no errors found\n');
            }
            console.log('Closing...\n');
        });
    });
