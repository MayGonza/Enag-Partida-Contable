const fs = require('fs');
let path = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
    /\/\/ Datos del Cliente \(En lugar de firma\)[\s\S]*?doc\.text\("Teléfono: " \+ tel, 130, y \+ 5\);/g,
    `// Se eliminó la sección de ACEPTADO POR EL CLIENTE (se enviará por correo)`
);

fs.writeFileSync(path, data, 'utf8');
console.log('Fixed PDF signature section');
