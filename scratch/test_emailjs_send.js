const https = require('https');

const postData = JSON.stringify({
    service_id: 'service_m4nwa33',
    template_id: 'template_abz297u',
    user_id: 'L9psQ9g3wbdxheABd',
    template_params: {
        numero_ticket: '#TICK-1001',
        solicitante: 'Iris Ramos',
        fecha_hora: '05/08/2026 12:18 AM',
        departamento: 'Contabilidad',
        descripcion: 'Prueba de ticket enviado directamente via EmailJS API con la clave publica oficial.',
        to_email: 'maygonza.cs@gmail.com'
    }
});

const req = https.request({
    hostname: 'api.emailjs.com',
    path: '/api/v1.0/email/send',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Respuesta de EmailJS API:", res.statusCode, data);
    });
});

req.on('error', (e) => {
    console.error("Error:", e.message);
});

req.write(postData);
req.end();
