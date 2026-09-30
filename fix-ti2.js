const fs = require('fs');

let pathIndex = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/index.html';
let dataIndex = fs.readFileSync(pathIndex, 'utf8');

dataIndex = dataIndex.replace(
    /} else if \(area === 'comercializacion'\) \{[\s\S]*?titulo = "Módulo de Comercialización";\s*\}/g,
    `} else if (area === 'comercializacion') {
                targetId = 'menuComercializacion';
                titulo = "Módulo de Comercialización";
            } else if (area === 'ti') {
                targetId = 'menuTI';
                titulo = "Módulo de TI";
            }`
);

fs.writeFileSync(pathIndex, dataIndex, 'utf8');
console.log('Fixed ti routing in mostrarSubmenu');
