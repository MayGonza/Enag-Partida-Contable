const fs = require('fs');
const path = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/registro.html';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
    /message\.innerText = 'Error al registrar: ' \+ error\.message;/g,
    "message.innerText = 'Error al registrar: ' + error.message; alert(error.stack || error);"
);

fs.writeFileSync(path, data, 'utf8');
console.log('Added stack trace alert');
