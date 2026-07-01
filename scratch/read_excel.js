const fs = require('fs');
// Since xlsx.full.min.js might not export directly in commonjs unless simulated or standard,
// let's try to require it. Usually, packaged version sets global or module.exports.
try {
    const XLSX = require('./js/xlsx.full.min.js');
    const buf = fs.readFileSync('planilla2.xls');
    const wb = XLSX.read(buf, {type: 'buffer'});
    console.log("SHEETS:", wb.SheetNames);
    wb.SheetNames.forEach(name => {
        const sheet = wb.Sheets[name];
        const rows = XLSX.utils.sheet_to_json(sheet, {header: 1, defval: ""});
        console.log(`\n--- SHEET: ${name} (Rows: ${rows.length}) ---`);
        for (let i = 0; i < Math.min(rows.length, 25); i++) {
            console.log(`Row ${i}:`, rows[i].slice(0, 15));
        }
    });
} catch (e) {
    console.error("Error:", e);
}
