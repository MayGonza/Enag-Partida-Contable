const https = require('https');

// Solicitar clave gratuita de Web3Forms para maygonza.cs@gmail.com
const postData = JSON.stringify({
    email: "maygonza.cs@gmail.com"
});

const req = https.request({
    hostname: 'api.web3forms.com',
    path: '/key',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Respuesta de Web3Forms:", data);
    });
});

req.on('error', (e) => {
    console.error("Error:", e.message);
});

req.write(postData);
req.end();
