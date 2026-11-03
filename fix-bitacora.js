const fs = require('fs');

// 1. Modificar firebase-config.js
let pathFirebase = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/js/firebase-config.js';
let dataFirebase = fs.readFileSync(pathFirebase, 'utf8');

if (!dataFirebase.includes('window.registrarBitacora')) {
    dataFirebase += `

// Función global para la Bitácora de Auditoría
window.registrarBitacora = async function(modulo, accion, detalles) {
    if (typeof firebase === 'undefined' || !dbFirestore) return;
    try {
        const currentUser = firebase.auth().currentUser;
        let usuarioSino = "Sistema / Desconocido";
        if (currentUser) {
            try {
                const uDoc = await dbFirestore.collection('usuarios').doc(currentUser.uid).get();
                if(uDoc.exists) usuarioSino = uDoc.data().usuario || currentUser.email;
            } catch(e) { usuarioSino = currentUser.email; }
        }
        await dbFirestore.collection('bitacora_global').add({
            modulo: modulo,
            accion: accion,
            detalles: detalles,
            usuario: usuarioSino,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch(e) { console.error("Error al registrar en bitácora", e); }
};
`;
    fs.writeFileSync(pathFirebase, dataFirebase, 'utf8');
}

// 2. Modificar index.html para enrutar TI
let pathIndex = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/index.html';
let dataIndex = fs.readFileSync(pathIndex, 'utf8');

dataIndex = dataIndex.replace(
    /if \(dep === 'direccion' \|\| dep === 'ti'\) \{/g,
    `if (dep === 'direccion') {`
);

// We need to fix the menuTI to say "Bitácora Global del Sistema"
dataIndex = dataIndex.replace(
    /<h2>Bitácora de Cotizaciones<\/h2>\s*<p>Registro histórico de cotizaciones creadas en el sistema\.<\/p>/g,
    `<h2>Bitácora Global del Sistema</h2>
                <p>Auditoría y registro de todas las acciones del sistema.</p>`
);
fs.writeFileSync(pathIndex, dataIndex, 'utf8');

// 3. Modificar bitacora.html
let pathBitacora = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/bitacora.html';
let dataBitacora = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="../assets/logo.ico" type="image/x-icon">
    <title>Bitácora Global del Sistema - TI</title>
    <style>
        :root {
            --primary: #002147;
            --primary-light: #003470;
            --bg-body: #002147;
            --card-bg: rgba(255, 255, 255, 0.98);
            --text-color: #1e293b;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0; padding: 40px 20px;
            background-color: var(--bg-body);
            color: var(--text-color);
            min-height: 100vh;
        }
        body::before {
            content: ""; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: url('../assets/logo.jpeg') no-repeat center center; background-size: 40%;
            filter: blur(10px) opacity(0.15); z-index: -1;
        }
        .container {
            max-width: 1400px; margin: auto; background: var(--card-bg);
            padding: 35px; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.4);
            border-top: 8px solid var(--primary);
        }
        .nav-container { max-width: 1400px; margin: 0 auto 20px auto; display: flex; justify-content: space-between; }
        .btn-nav { text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; background: #6c757d; color: white; }
        h1 { color: var(--primary); text-align: center; margin-bottom: 30px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; font-size: 0.85em; }
        th { background: #f8fafc; color: var(--primary); font-weight: bold; }
        tr:nth-child(even) { background-color: #f8fafc; }
        
        .badge { padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 0.8em; }
        .badge-login { background: #dbeafe; color: #1e40af; }
        .badge-create { background: #d1fae5; color: #065f46; }
        .badge-update { background: #fef3c7; color: #92400e; }
        .badge-delete { background: #fee2e2; color: #991b1b; }
        .badge-default { background: #f3f4f6; color: #374151; }
    </style>
</head>
<body>
    <div class="nav-container">
        <a href="login.html" class="btn-nav" id="btnCerrarSesion" onclick="cerrarSesion(event)">← Cerrar Sesión</a>
    </div>

    <div class="container">
        <h1>🛡️ Bitácora Global del Sistema</h1>
        <p style="text-align: center; color: #64748b; margin-top: -20px; margin-bottom: 30px;">Auditoría General de TI - Registro de todas las acciones del sistema</p>

        <table id="bitacoraTable">
            <thead>
                <tr>
                    <th style="width: 15%">Fecha y Hora</th>
                    <th style="width: 15%">Usuario</th>
                    <th style="width: 15%">Módulo</th>
                    <th style="width: 15%">Acción</th>
                    <th style="width: 40%">Detalles</th>
                </tr>
            </thead>
            <tbody id="bitacoraBody">
                <tr><td colspan="5" style="text-align: center;">Cargando registros de auditoría...</td></tr>
            </tbody>
        </table>
    </div>

    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>
    <script src="../js/firebase-config.js"></script>

    <script>
        function cerrarSesion(e) {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                window.location.href = 'login.html';
            });
        }

        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const doc = await dbFirestore.collection('usuarios').doc(user.uid).get();
                    if (doc.exists) {
                        const userData = doc.data();
                        if (userData.departamento !== 'ti' && userData.departamento !== 'direccion') {
                            alert("Acceso denegado: Solo el departamento de TI puede ver esta bitácora.");
                            window.location.href = '../index.html';
                            return;
                        }
                        cargarBitacora();
                    }
                } catch(e) {
                    console.error("Error validando usuario", e);
                }
            } else {
                window.location.href = 'login.html';
            }
        });

        function formatTimestamp(timestamp) {
            if(!timestamp) return 'Fecha desconocida';
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleString('es-HN', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
            });
        }

        function getBadgeClass(accion) {
            const acc = (accion || '').toLowerCase();
            if(acc.includes('inicio de sesión') || acc.includes('login')) return 'badge-login';
            if(acc.includes('crear') || acc.includes('nueva')) return 'badge-create';
            if(acc.includes('actualizar') || acc.includes('modificar') || acc.includes('cambiar')) return 'badge-update';
            if(acc.includes('eliminar') || acc.includes('borrar')) return 'badge-delete';
            return 'badge-default';
        }

        function cargarBitacora() {
            dbFirestore.collection('bitacora_global').orderBy('timestamp', 'desc').limit(500).onSnapshot((snapshot) => {
                const tbody = document.getElementById('bitacoraBody');
                tbody.innerHTML = '';
                
                if (snapshot.empty) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay registros en la bitácora global.</td></tr>';
                    return;
                }

                snapshot.forEach(doc => {
                    const b = doc.data();
                    const tr = document.createElement('tr');
                    
                    const fechaTxt = formatTimestamp(b.timestamp);
                    const usuario = b.usuario || 'Desconocido';
                    const modulo = b.modulo || 'Sistema';
                    const accion = b.accion || 'Acción';
                    const detalles = b.detalles || '';

                    tr.innerHTML = \`
                        <td>\${fechaTxt}</td>
                        <td style="font-weight: bold; color: var(--primary);">\${usuario}</td>
                        <td>\${modulo}</td>
                        <td style="text-align: center;"><span class="badge \${getBadgeClass(accion)}">\${accion}</span></td>
                        <td>\${detalles}</td>
                    \`;
                    tbody.appendChild(tr);
                });
            }, (error) => {
                console.error("Error cargando bitácora:", error);
                document.getElementById('bitacoraBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar la bitácora. Verifique las reglas de Firestore.</td></tr>';
            });
        }
    </script>
</body>
</html>`;
fs.writeFileSync(pathBitacora, dataBitacora, 'utf8');

// 4. Conectar log in a la bitacora en login.html
let pathLogin = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/login.html';
let dataLogin = fs.readFileSync(pathLogin, 'utf8');
if (!dataLogin.includes('registrarBitacora(')) {
    dataLogin = dataLogin.replace(
        /window\.location\.href = '\.\.\/index\.html';/g,
        `if (window.registrarBitacora) window.registrarBitacora('Autenticación', 'Inicio de sesión', 'El usuario ingresó exitosamente al sistema.');
                        window.location.href = '../index.html';`
    );
    fs.writeFileSync(pathLogin, dataLogin, 'utf8');
}

// 5. Conectar cotizaciones a la bitacora
let pathCotiz = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html';
let dataCotiz = fs.readFileSync(pathCotiz, 'utf8');
if (!dataCotiz.includes('registrarBitacora(')) {
    dataCotiz = dataCotiz.replace(
        /dbFirestore\.collection\('cotizaciones'\)\.doc\(String\(cData\.numero\)\)\.set\(\{[\s\S]*?timestamp: firebase\.firestore\.FieldValue\.serverTimestamp\(\)\s*\}\);/g,
        `dbFirestore.collection('cotizaciones').doc(String(cData.numero)).set({
                            ...cData,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        
                        if (window.registrarBitacora) {
                            let msj = "Se creó o actualizó la cotización #" + cData.numero + " para el cliente " + (cData.cliente ? cData.cliente.nombre : 'Desconocido');
                            window.registrarBitacora('Comercialización', 'Guardar Cotización', msj);
                        }`
    );
    fs.writeFileSync(pathCotiz, dataCotiz, 'utf8');
}

console.log('Fixed Bitacora Global setup!');
