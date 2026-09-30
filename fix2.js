const fs = require('fs');

const path = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/registro.html';
let data = fs.readFileSync(path, 'utf8');

// Replace envelope emoji line entirely to be safe
data = data.replace(/<span class="input-icon">.*?<\/span>\s*<input type="email"/g, '<span class="input-icon">📧</span>\n                        <input type="email"');

// Replace 'Departamento / <anything>rea' with 'Departamento / Área'
data = data.replace(/Departamento \/ .*?rea/g, 'Departamento / Área');

fs.writeFileSync(path, data, 'utf8');
console.log('Fixed registro.html using Node');
