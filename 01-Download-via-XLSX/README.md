# Download-via-XLSX

Built by Jared Hettinger

This unit contains a node project that will parse data from the `in.xlsx` file and make calls to download those files.

## To Install

1. Navigate to the `/01-Download-via-XLSX/` folder
2. Run `npm install`

## To Run

1. Navigate to the `/01-Download-via-XLSX/` folder
2. Run `npm start`

## To Clean

Run `npm run clean`. This script deletes the an existing `errors.json` file, deletes everything in the `/out/` folder, and restores the `/out/.gitkeep` file

## Technologies Used

1. [Node](https://nodejs.org)
2. [SheetJS](https://www.npmjs.com/package/xlsx)
3. [Axios](https://www.npmjs.com/package/axios)
4. [XLSX/Office Open XML Workbook](https://learn.microsoft.com/en-us/openspecs/office_standards/ms-xlsx/)
