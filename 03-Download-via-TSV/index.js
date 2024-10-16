console.log('Running Download-via-TSV...\n');

const baseUri = 'https://www.jaredhettinger.io/lit/txt/';

// Setup objects for axios, file system, csv parser, and the file reader
const ax = require('axios');
const fs = require('fs');
const cp = require('csv-parse');
const fr = cp.parse({ columns: true, delimiter: '\t' });

// Initiate empty errors array for logging any failed rows
const errors = [];

// Initiate empty promises array for tracking all downloads
const promises = [];

async function download(uri, saveAs, context) {
    await ax
        .get(uri, { responseType: 'stream' })
        .then((res) => {
            console.log(`Downloading file from ${uri}`);
            const newFile = fs.createWriteStream(`./out/${saveAs}`);
            res.data.pipe(newFile);
            newFile.on('finish', () => newFile.close());
        })
        .catch((err) => {
            const errMessage = `Error on row '${context.row}' downloading file from '${uri}'`;
            errors.push({
                caughtError: err,
                message: errMessage,
                rowData: context.rowData,
            });
        });
}

let i = 1;
fs.createReadStream('in.tsv')
    .pipe(fr)
    .on('data', (row) => {
        // Uncomment below to log the data on each row
        // console.log(`Row ${i}: `, row);
        const downloadSlug = `${row['Author Last Name']} - ${row['Work Title']}.txt`;
        const downloadUri = `${baseUri}${downloadSlug}`;
        const saveAs = `${row['Work Title']} by ${row['Author First Name']} ${row['Author Last Name']}.txt`;
        const context = { row: i, rowData: row };
        const promise = download(downloadUri, saveAs, context);
        promises.push(promise);
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
