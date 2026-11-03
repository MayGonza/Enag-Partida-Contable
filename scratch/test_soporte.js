const fs = require('fs');
const path = require('path');

console.log("Probando persistencia de ticket de soporte...");
const ticketsFilePath = path.join(__dirname, '../tickets.json');

let tickets = [];
if (fs.existsSync(ticketsFilePath)) {
    try {
        tickets = JSON.parse(fs.readFileSync(ticketsFilePath, 'utf8'));
    } catch (e) { }
}

const nextNum = tickets.length > 0 ? Math.max(...tickets.map(t => t.numeroTicket || 1000)) + 1 : 1001;

console.log("Siguiente número de ticket acumulable:", nextNum);
