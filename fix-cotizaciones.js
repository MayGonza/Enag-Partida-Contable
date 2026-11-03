const fs = require('fs');
let path = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html';
let data = fs.readFileSync(path, 'utf8');

// 1. Añadir Firebase Scripts al final del body
const firebaseScripts = `
    <!-- Firebase SDK Compat v10 -->
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>
    <script src="../js/firebase-config.js"></script>

    <script>
        // Cargar nombre del usuario autenticado
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && user.emailVerified) {
                try {
                    const doc = await dbFirestore.collection('usuarios').doc(user.uid).get();
                    if (doc.exists) {
                        const userData = doc.data();
                        const inputComercial = document.getElementById('comercial');
                        if (inputComercial) {
                            inputComercial.value = userData.nombre || userData.usuario;
                            inputComercial.readOnly = true; // Que no lo puedan cambiar
                            inputComercial.style.backgroundColor = '#f1f5f9';
                        }
                    }
                } catch(e) {
                    console.error("Error obteniendo datos del usuario", e);
                }
            } else {
                window.location.href = 'login.html';
            }
        });
        
        function cambiarEstadoCotizacion(id, nuevoEstado) {
            const index = cotizaciones.findIndex(c => c.id === id);
            if(index !== -1) {
                cotizaciones[index].estado = nuevoEstado;
                localStorage.setItem('enag_cotizaciones', JSON.stringify(cotizaciones));
                renderHistorial();
            }
        }
    </script>
</body>`;
data = data.replace(/<\/body>/g, firebaseScripts);

// 2. Modificar el encabezado de la tabla del historial para añadir "Estado"
data = data.replace(
    /<th style="width: 140px;" class="align-right">Total<\/th>\s*<th style="width: 200px;" class="align-center">Acciones<\/th>/g,
    `<th style="width: 140px;" class="align-right">Total</th>
     <th style="width: 130px;" class="align-center">Estado</th>
     <th style="width: 200px;" class="align-center">Acciones</th>`
);

// 3. Modificar renderHistorial() para incluir la columna de estado
// We need to look at how renderHistorial creates rows
// Let's replace the string construction in renderHistorial
const renderRowOld = `
                    <td class="align-right" style="font-weight: bold; color: var(--primary);">L. \${c.total}</td>
                    <td class="align-center">
                        <button class="action-btn btn-view" title="Ver / Imprimir" onclick="cargarCotizacion('\${c.id}')">🖨️</button>
                        <button class="action-btn btn-delete" title="Eliminar" onclick="eliminarCotizacion('\${c.id}')">🗑️</button>
                    </td>`;

const renderRowNew = `
                    <td class="align-right" style="font-weight: bold; color: var(--primary);">L. \${c.total}</td>
                    <td class="align-center">
                        <select onchange="cambiarEstadoCotizacion('\${c.id}', this.value)" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; font-size: 0.85em; background-color: \${c.estado === 'Aprobada' ? '#d1fae5' : c.estado === 'Rechazada' ? '#fee2e2' : '#fef3c7'}; color: \${c.estado === 'Aprobada' ? '#065f46' : c.estado === 'Rechazada' ? '#991b1b' : '#92400e'};">
                            <option value="Pendiente" \${c.estado === 'Pendiente' || !c.estado ? 'selected' : ''}>⏳ Pendiente</option>
                            <option value="Aprobada" \${c.estado === 'Aprobada' ? 'selected' : ''}>✅ Aprobada</option>
                            <option value="Rechazada" \${c.estado === 'Rechazada' ? 'selected' : ''}>❌ Rechazada</option>
                        </select>
                    </td>
                    <td class="align-center">
                        <button class="action-btn btn-view" title="Ver / Imprimir" onclick="cargarCotizacion('\${c.id}')">🖨️</button>
                        <button class="action-btn btn-delete" title="Eliminar" onclick="eliminarCotizacion('\${c.id}')">🗑️</button>
                    </td>`;
data = data.replace(renderRowOld, renderRowNew);

// 4. Set estado = 'Pendiente' by default when saving
data = data.replace(
    /const nuevaCotizacion = \{/g,
    `const nuevaCotizacion = {\n                estado: 'Pendiente',`
);

fs.writeFileSync(path, data, 'utf8');
console.log('Modified cotizaciones.html successfully');
