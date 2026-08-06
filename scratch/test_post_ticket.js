const http = require('http');

// Simular el inicio del servidor app.js
require('../app.js');

setTimeout(async () => {
    console.log("Enviando petición POST /api/soporte/ticket para simular el formulario de la interfaz...");

    const postData = JSON.stringify({
        nombre: "Usuario de Prueba UI",
        fechaHora: new Date().toLocaleString(),
        departamento: "Contabilidad",
        descripcion: "Prueba de envío desde el formulario de soporte de la app"
    });

    const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/soporte/ticket',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log("Respuesta del Servidor:", data);
            process.exit(0);
        });
    });

    req.on('error', (e) => {
        console.error("Error en la petición:", e.message);
        process.exit(1);
    });

    req.write(postData);
    req.end();
}, 1000);
