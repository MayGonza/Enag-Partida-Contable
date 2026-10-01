const fs = require('fs');

function replaceInFile(filePath, search, replacement) {
    if (!fs.existsSync(filePath)) return;
    let data = fs.readFileSync(filePath, 'utf8');
    data = data.replace(search, replacement);
    fs.writeFileSync(filePath, data, 'utf8');
}

// 1. Fix login.html
replaceInFile(
    'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/login.html',
    /firebase\.auth\(\)\.onAuthStateChanged\(\(user\) => \{\s*if \(user\) \{/g,
    `firebase.auth().onAuthStateChanged((user) => {
            if (user && user.emailVerified) {`
);

// 2. Fix registro.html
replaceInFile(
    'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/registro.html',
    /await firebase\.auth\(\)\.languageCode = 'es';/,
    `if (window.registrarBitacora) {
                    await window.registrarBitacora('Administración', 'Crear Usuario', 'Se registró un nuevo usuario: ' + email + ' (' + departamento + ')');
                }
                await firebase.auth().languageCode = 'es';`
);

// 3. Fix index.html logout
replaceInFile(
    'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/index.html',
    /function cerrarSesion\(\) \{\s*firebase\.auth\(\)\.signOut\(\)/g,
    `async function cerrarSesion() {
            if (window.registrarBitacora) {
                await window.registrarBitacora('Autenticación', 'Cerrar Sesión', 'El usuario ha cerrado su sesión en el sistema.');
            }
            firebase.auth().signOut()`
);

// 4. Fix bitacora.html logout
replaceInFile(
    'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/bitacora.html',
    /function cerrarSesion\(e\) \{\s*e\.preventDefault\(\);\s*firebase\.auth\(\)\.signOut\(\)/g,
    `async function cerrarSesion(e) {
            e.preventDefault();
            if (window.registrarBitacora) {
                await window.registrarBitacora('Autenticación', 'Cerrar Sesión', 'El usuario ha cerrado su sesión en el sistema.');
            }
            firebase.auth().signOut()`
);

// 5. Fix comercializacion.html logout (if any)
replaceInFile(
    'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/comercializacion.html',
    /function cerrarSesion\(e\) \{\s*e\.preventDefault\(\);\s*firebase\.auth\(\)\.signOut\(\)/g,
    `async function cerrarSesion(e) {
            e.preventDefault();
            if (window.registrarBitacora) {
                await window.registrarBitacora('Autenticación', 'Cerrar Sesión', 'El usuario ha cerrado su sesión en el sistema.');
            }
            firebase.auth().signOut()`
);

// 6. Fix cotizaciones.html logout (if any)
replaceInFile(
    'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html',
    /function cerrarSesion\(e\) \{\s*e\.preventDefault\(\);\s*firebase\.auth\(\)\.signOut\(\)/g,
    `async function cerrarSesion(e) {
            e.preventDefault();
            if (window.registrarBitacora) {
                await window.registrarBitacora('Autenticación', 'Cerrar Sesión', 'El usuario ha cerrado su sesión en el sistema.');
            }
            firebase.auth().signOut()`
);

// 7. Fix constancias.html logout (if any)
replaceInFile(
    'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/constancias.html',
    /function cerrarSesion\(e\) \{\s*e\.preventDefault\(\);\s*firebase\.auth\(\)\.signOut\(\)/g,
    `async function cerrarSesion(e) {
            e.preventDefault();
            if (window.registrarBitacora) {
                await window.registrarBitacora('Autenticación', 'Cerrar Sesión', 'El usuario ha cerrado su sesión en el sistema.');
            }
            firebase.auth().signOut()`
);

console.log('Logs and flicker fixes applied');
