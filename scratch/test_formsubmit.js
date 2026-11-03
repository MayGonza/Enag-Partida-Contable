const https = require('https');

const postData = JSON.stringify({
    _subject: "[TICKET #1001] Solicitud de Soporte - Contabilidad",
    nombre: "Usuario Test Web",
    fecha_hora: "05/08/2026 11:05 PM",
    departamento: "Contabilidad",
    descripcion: "Prueba de envío automático directo a maygonza.cs@gmail.com desde web",
    _template: "table"
});

const req = https.request({
    hostname: 'formsubmit.co',
    path: '/ajax/maygonza.cs@gmail.com',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Respuesta de FormSubmit:", res.statusCode, data);
    });
});

req.on('error', (e) => {
    console.error("Error:", e.message);
});

req.write(postData);
req.end();
