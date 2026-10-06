const fs = require('fs');
let content = fs.readFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/index.html', 'utf8');

const oldLogic = `                        if (dep === 'direccion') {`;
const newLogic = `                        const deptosOrden = ['correccion', 'diseno_grafico', 'control_calidad', 'sub_gerencia_produccion', 'ctp', 'almacen', 'offset_guillotina', 'digital'];
                        
                        if (deptosOrden.includes(dep)) {
                            window.location.href = 'views/orden_produccion.html';
                            return;
                        }
                        
                        if (dep === 'direccion') {`;

if (!content.includes('deptosOrden')) {
    content = content.replace(oldLogic, newLogic);
    fs.writeFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/index.html', content, 'utf8');
}
console.log('index.html updated with specific routing.');
