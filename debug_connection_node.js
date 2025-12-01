const https = require('https');

const spreadsheetId = '1B3HoE6B1h20iErFHUrvPzEaXXliq89VXPlTxUB2bBH4';
const sheetName = 'Eventos2025';
const apiKey = 'AIzaSyBFnL21PJKs-KEcyRm_dslFy1ytMQAzoe0';
const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;

console.log('Fetching:', url);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            if (jsonData.values && jsonData.values.length > 0) {
                console.log('--- HEADERS (Row 0) ---');
                console.log(JSON.stringify(jsonData.values[0], null, 2));

                if (jsonData.values.length > 1) {
                    console.log('--- FIRST ROW (Row 1) ---');
                    console.log(JSON.stringify(jsonData.values[1], null, 2));
                } else {
                    console.log('No data rows found.');
                }
            } else {
                console.log('No values found in response.');
                console.log(data.substring(0, 500)); // Print start of response if error
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw data start:', data.substring(0, 200));
        }
    });

}).on('error', (err) => {
    console.error('Error fetching data:', err.message);
});
