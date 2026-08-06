const https = require('https');

const numeroTicket = 1001;
const nombre = "Iris Ramos";
const departamento = "Contabilidad";
const fechaHora = "05/08/2026 11:47 PM";
const descripcion = "Prueba de tarjeta limpia Web3Forms sin imprimir codigo raw HTML";

const postData = JSON.stringify({
    access_key: "cc18aace-0fb5-47fd-bb61-c422b4ec7b83",
    subject: `🎧 [TICKET #${numeroTicket}] Solicitud de Soporte Técnico - ${departamento}`,
    from_name: "Sistema ENAG Soporte",
    "🎫 NUMERO DE TICKET": `#TICK-${numeroTicket}`,
    "👤 SOLICITANTE": nombre,
    "📅 FECHA Y HORA (HONDURAS)": fechaHora,
    "🏢 DEPARTAMENTO": departamento,
    "📌 ESTADO": "NUEVO / PENDIENTE",
    "📝 DETALLE DE LA SOLICITUD": descripcion
});

const req = https.request({
    hostname: 'api.web3forms.com',
    path: '/submit',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Respuesta Web3Forms:", data);
    });
});

req.on('error', (e) => {
    console.error("Error:", e.message);
});

req.write(postData);
req.end();
