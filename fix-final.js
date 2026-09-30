const fs = require('fs');

const path = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/registro.html';
let data = fs.readFileSync(path, 'utf8');

// The envelope icon might have a trailing space or a variation selector.
// Just to be safe, replace the line
data = data.replace(/<span class="input-icon">✉️ <\/span>/g, '<span class="input-icon">📧</span>');
data = data.replace(/<span class="input-icon">✉️<\/span>/g, '<span class="input-icon">📧</span>');
data = data.replace(/<span class="input-icon">✉ <\/span>/g, '<span class="input-icon">📧</span>');
data = data.replace(/<span class="input-icon">✉<\/span>/g, '<span class="input-icon">📧</span>');

// For Area
data = data.replace(/Ã rea/g, 'Área');
data = data.replace(/Ã\srea/g, 'Área');

fs.writeFileSync(path, data, 'utf8');
console.log('Fixed registro.html manually');
