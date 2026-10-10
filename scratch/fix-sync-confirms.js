const fs = require('fs');

function fixLimpiarCampos(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace('function limpiarCampos() {', 'async function limpiarCampos() {');
    content = content.replace("if (confirm('¿Está seguro de que desea limpiar todos los campos del formulario?')) {", "if ((window.enagConfirm && await window.enagConfirm('¿Está seguro de que desea limpiar todos los campos del formulario?')) || (!window.enagConfirm && confirm('¿Está seguro de que desea limpiar todos los campos del formulario?'))) {");
    content = content.replace("if (confirm('¿Está seguro de que desea limpiar todos los campos de la partida?')) {", "if ((window.enagConfirm && await window.enagConfirm('¿Está seguro de que desea limpiar todos los campos de la partida?')) || (!window.enagConfirm && confirm('¿Está seguro de que desea limpiar todos los campos de la partida?'))) {");
    fs.writeFileSync(file, content);
}

fixLimpiarCampos('views/comprobante_retencion.html');
fixLimpiarCampos('views/partidas.html');
fixLimpiarCampos('views/partidas_credito.html');

console.log('Fixed limpiarCampos confirms');
