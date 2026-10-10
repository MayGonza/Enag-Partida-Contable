const fs = require('fs');

function fixConfirm(file, searchStr, replaceStr) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(searchStr, replaceStr);
    fs.writeFileSync(file, content);
}

fixConfirm('index.html', 'if (!confirm("¿Deseas eliminar este aviso de Recursos Humanos?")) {', 'if (window.enagConfirm) { if (!(await window.enagConfirm("¿Deseas eliminar este aviso de Recursos Humanos?"))) { return; } } else if (!confirm("¿Deseas eliminar este aviso de Recursos Humanos?")) {');

fixConfirm('views/cotizaciones.html', 'if (confirm(`¿Está seguro de que desea eliminar esta cotización del historial?`)) {', 'if ((window.enagConfirm && await window.enagConfirm(`¿Está seguro de que desea eliminar esta cotización del historial?`)) || (!window.enagConfirm && confirm(`¿Está seguro de que desea eliminar esta cotización del historial?`))) {');

console.log('Fixed async confirms');
