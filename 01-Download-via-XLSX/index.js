console.log('Running Download-via-XLSX...\n');

const baseUri = 'https://www.jaredhettinger.io/lit/txt/';

// Setup objects for axios, file system, file reader, and the target file
const ax = require('axios');
const fs = require('fs');
const fr = require('xlsx');
const inFile = fr.readFile('./in.xlsx');
const sheets = inFile.SheetNames;

// Initiate empty errors array for logging any failed rows
const errors = [];

// Initiate empty promises array for tracking all downloads
let promises = [];

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
            const errMessage = `Error on sheet '${context.sheetName}', row '${context.row}' downloading file from '${uri}'`;
            errors.push({
                caughtError: err,
                message: errMessage,
                rowData: context.rowData,
            });
        });
}

for (let i = 0; i < sheets.length; i++) {
    const sheet = fr.utils.sheet_to_json(inFile.Sheets[inFile.SheetNames[i]]);
    for (let j = 0; j < sheet.length; j++) {
        // Uncomment below to log the data on each row
        // console.log(`${inFile.SheetNames[i]} Row ${j + 1}: `, sheet[j]);
        const downloadSlug = `${sheet[j]['Author Last Name']} - ${sheet[j]['Work Title']}.txt`;
        const downloadUri = `${baseUri}${downloadSlug}`;
        const saveAs = `${sheet[j]['Author First Name']} ${sheet[j]['Author Last Name']} x ${sheet[j]['Work Title']}.txt`;
        const context = {
            row: j + 1,
            rowData: sheet[j],
            sheetName: inFile.SheetNames[i],
        };
        const promise = download(downloadUri, saveAs, context);
        promises.push(promise);
    }
}

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
