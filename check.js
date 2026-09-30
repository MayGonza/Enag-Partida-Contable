const fs = require('fs');
let data = fs.readFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/index.html', 'utf8');
const lines = data.split('\n');
const start = lines.findIndex(l => l.includes('function mostrarSubmenu('));
const end = lines.findIndex((l, i) => i > start && l.includes('function volverAlMenuPrincipal'));
console.log(lines.slice(start, end).join('\n'));
