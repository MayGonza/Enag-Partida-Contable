const fs = require('fs');
let content = fs.readFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/orden_produccion.html', 'utf8');

// replace the link
const oldLinkRegex = /<a href=\"\.\.\/index\.html\" class=\"btn-nav btn-nav-menu\">.*?<\/a>/i;
const newBtn = `<button onclick="cerrarSesion()" class="btn-nav btn-nav-menu" style="background-color: #ef4444; color: white; border: none; cursor: pointer; height: 35px; line-height: 1;">🚪 Cerrar Sesión</button>`;

if (oldLinkRegex.test(content)) {
    content = content.replace(oldLinkRegex, newBtn);
}

// add cerrarSesion function before the closing body
const scriptInjection = `
    <script>
        async function cerrarSesion() {
            if (window.registrarBitacora) {
                await window.registrarBitacora('Autenticación', 'Cerrar Sesión', 'El usuario ha cerrado su sesión desde Orden de Producción.');
            }
            firebase.auth().signOut().then(() => {
                window.location.href = 'login.html';
            });
        }
    </script>
</body>`;

if (!content.includes('function cerrarSesion')) {
    content = content.replace('</body>', scriptInjection);
}

fs.writeFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/orden_produccion.html', content, 'utf8');
console.log('Botón cerrar sesion añadido');
