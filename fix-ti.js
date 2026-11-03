const fs = require('fs');

let pathIndex = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/index.html';
let dataIndex = fs.readFileSync(pathIndex, 'utf8');

// 1. Inyectar cardTI al final de areasContainer
const cardTI = `
            <div class="card area-card" id="cardTI" onclick="solicitarAcceso('ti')" style="display:none;">
                <div class="icon">💻</div>
                <h2>Tecnología (TI)</h2>
                <p>Auditoría, Bitácoras y Administración del sistema.</p>
            </div>
`;
dataIndex = dataIndex.replace(
    /<\/div>\s*<\/div>\s*<!-- SUB-MENÚ: CONTABILIDAD/g,
    cardTI + '\n        </div>\n    </div>\n\n    <!-- SUB-MENÚ: CONTABILIDAD'
);

// 2. Inyectar menuTI
const menuTI = `
        <div id="menuTI" class="grid-container sub-menu" style="display: none;">
            <a href="views/bitacora.html" class="card">
                <div class="icon">📝</div>
                <h2>Bitácora de Cotizaciones</h2>
                <p>Registro histórico de cotizaciones creadas en el sistema.</p>
            </a>
        </div>
`;
dataIndex = dataIndex.replace(
    /<div id="backButtonContainer"/g,
    menuTI + '        <div id="backButtonContainer"'
);

// 3. Update mostrarSubmenu
dataIndex = dataIndex.replace(
    /else if \(area === 'comercializacion'\) \{\s*targetId = 'menuComercializacion';\s*\}/g,
    `else if (area === 'comercializacion') {
                targetId = 'menuComercializacion';
            } else if (area === 'ti') {
                targetId = 'menuTI';
            }`
);

// 4. Update volverAlMenuPrincipal
dataIndex = dataIndex.replace(
    /document\.getElementById\('menuComercializacion'\)\.style\.display = 'none';/g,
    `document.getElementById('menuComercializacion').style.display = 'none';
            document.getElementById('menuTI').style.display = 'none';`
);

fs.writeFileSync(pathIndex, dataIndex, 'utf8');
console.log('Fixed TI menu logic in index.html');
