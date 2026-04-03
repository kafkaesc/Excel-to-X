console.log('Running Download-via-XLSX...\n');

const baseUri = 'https://www.jaredhettinger.io/lit/txt/';

// Setup objects for axios, file system, and the file reader
const ax = require('axios');
const ex = require('exceljs');
const fs = require('fs');

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
            const errMessage = `Error on sheet '${context.sheetName}', row '${context.row}' downloading file from '${uri}'`;
            errors.push({
                caughtError: err,
                message: errMessage,
                rowData: context.rowData,
            });
        });
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
            const downloadSlug = `${rowData['Author Last Name']} - ${rowData['Work Title']}.txt`;
            const downloadUri = `${baseUri}${downloadSlug}`;
            const saveAs = `${rowData['Author First Name']} ${rowData['Author Last Name']} x ${rowData['Work Title']}.txt`;
            const context = {
                row: rowNumber - 1,
                rowData,
                sheetName: sheet.name,
            };
            promises.push(download(downloadUri, saveAs, context));
        });
    });

    // Once all promises have resolved, check for errors and close
    await Promise.all(promises);
    if (errors.length > 0) {
        const errMessage = `\n${errors.length} error(s) found, logging to errors.json\n`;
        console.log(errMessage);
        fs.writeFile('errors.json', JSON.stringify(errors), () => {});
    } else {
        console.log('\nDownloads finished, no errors found\n');
    }
    console.log('Closing...\n');
}

main();
