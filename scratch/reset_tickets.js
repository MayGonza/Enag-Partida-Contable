const fs = require('fs');
const path = require('path');

// 1. Limpiar tickets.json
const ticketsFilePath = path.join(__dirname, '../tickets.json');
fs.writeFileSync(ticketsFilePath, '[]', 'utf8');
console.log("tickets.json limpiado exitosamente.");

// 2. Intentar vaciar la tabla MySQL si la base de datos está activa
const db = require('../db');
async function resetDb() {
    try {
        const conn = await db.getConnection();
        await conn.query("TRUNCATE TABLE soporte_tickets");
        conn.release();
        console.log("Tabla soporte_tickets en MySQL limpiada exitosamente.");
    } catch (e) {
        console.log("MySQL no activo o tabla no requerida para resetear.");
    }
    process.exit(0);
}
resetDb();
