const fs = require('fs');

// 1. MODIFICAR COTIZACIONES.HTML PARA GUARDAR EN FIRESTORE
let pathCotiz = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html';
let dataCotiz = fs.readFileSync(pathCotiz, 'utf8');

dataCotiz = dataCotiz.replace(
    /localStorage\.setItem\('enag_cotizaciones', JSON\.stringify\(cotizaciones\)\);/g,
    `localStorage.setItem('enag_cotizaciones', JSON.stringify(cotizaciones));
                // Guardar en Firestore para la bitácora
                try {
                    let cData = null;
                    if (typeof index !== 'undefined' && index !== -1 && cotizaciones[index]) {
                        cData = cotizaciones[index];
                    } else if (typeof nuevaCotizacion !== 'undefined') {
                        cData = nuevaCotizacion;
                    }
                    if (cData && typeof dbFirestore !== 'undefined') {
                        dbFirestore.collection('cotizaciones').doc(String(cData.numero)).set({
                            ...cData,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                } catch(e) { console.error("Error guardando en Firestore:", e); }`
);
fs.writeFileSync(pathCotiz, dataCotiz, 'utf8');


// 2. MODIFICAR INDEX.HTML PARA AÑADIR EL MODULO TI
let pathIndex = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/index.html';
let dataIndex = fs.readFileSync(pathIndex, 'utf8');

if(!dataIndex.includes("mostrarSubmenu('ti')")) {
    const cardTI = `
            <div class="card" onclick="mostrarSubmenu('ti')" id="cardTI">
                <div class="icon">💻</div>
                <h2>Tecnología (TI)</h2>
                <p>Auditoría, Bitácoras y Administración del sistema.</p>
            </div>
    `;
    dataIndex = dataIndex.replace(/<\/div>\s*<\/div>\s*<!-- Submenús/g, cardTI + '\n        </div>\n    </div>\n\n    <!-- Submenús');

    const menuTI = `
    <!-- Menú TI -->
    <div id="menuTI" class="submenu-container">
        <h2 style="margin-bottom: 25px; color: var(--primary);">Módulo de TI</h2>
        <div class="cards-grid">
            <a href="views/bitacora.html" class="card">
                <div class="icon">📝</div>
                <h2>Bitácora de Cotizaciones</h2>
                <p>Registro histórico de cotizaciones creadas en el sistema.</p>
            </a>
        </div>
    </div>
    `;
    dataIndex = dataIndex.replace(/<!-- Botón de retroceso -->/g, menuTI + '\n    <!-- Botón de retroceso -->');

    const hideTI = `
                        if (dep === 'direccion' || dep === 'ti') {
                            document.getElementById('areasContainer').style.display = 'grid';
                            const cardTI = document.getElementById('cardTI');
                            if(cardTI) cardTI.style.display = (dep === 'ti' || dep === 'direccion') ? 'block' : 'none';
                        }
    `;
    dataIndex = dataIndex.replace(/if \(dep === 'direccion' \|\| dep === 'ti'\) \{\s*document.getElementById\('areasContainer'\).style.display = 'grid';/g, hideTI);

    fs.writeFileSync(pathIndex, dataIndex, 'utf8');
}
console.log('Modified cotizaciones.html and index.html');
