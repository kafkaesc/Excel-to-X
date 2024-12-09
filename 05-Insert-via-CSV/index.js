console.log('Running Insert-via-CSV...\n');

const dbFilename = 'music.db';

// Setup objects for sqlite access, file system, csv parser, and the file reader
const sq = require('sqlite3');
const fs = require('fs');
const cp = require('csv-parse');
const fr = cp.parse({ columns: true, delimiter: ',' });
const db = new sq.Database(dbFilename);

// Initiate empty errors array for logging any failed rows
const errors = [];

// Initiate empty promises array for tracking SQL inserts
const promises = [];

function insertSong(title, artist, album, year) {
    const sqlScript = `INSERT INTO Songs (Title, Artist, Album, Year) VALUES ('${sani(
        title
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
            db.close();
            console.log('Closing...\n');
        });
    });
