const fs = require('fs');
const path = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/login.html';
let data = fs.readFileSync(path, 'utf8');

// Fixing corrupted accents
data = data.replace(/sesiÃ³n/g, 'sesión');
data = data.replace(/escribiÃ³/g, 'escribió');
data = data.replace(/podrÃ­amos/g, 'podríamos');
data = data.replace(/mÃ¡s/g, 'más');
data = data.replace(/fÃ¡cil/g, 'fácil');
data = data.replace(/validaciÃ³n/g, 'validación');
data = data.replace(/rÃ¡pida/g, 'rápida');
data = data.replace(/contraseÃ±a/g, 'contraseña');
data = data.replace(/electrÃ³nico/g, 'electrónico');
data = data.replace(/invÃ¡lido/g, 'inválido');

fs.writeFileSync(path, data, 'utf8');
console.log('Fixed login.html');
