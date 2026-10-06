const fs = require('fs');
let content = fs.readFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/registro.html', 'utf8');

const targetStr = '<option value="direccion">Dirección / Administración</option>';
const replacementStr = targetStr + `
                              <option value="correccion">Corrección</option>
                              <option value="diseno_grafico">Diseño Gráfico</option>
                              <option value="control_calidad">Control de Calidad</option>
                              <option value="sub_gerencia_produccion">Sub Gerencia de Producción</option>
                              <option value="ctp">CTP</option>
                              <option value="almacen">Almacén</option>
                              <option value="offset_guillotina">Offset / Guillotina</option>
                              <option value="digital">Digital</option>`;

if (!content.includes('value="correccion"')) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/registro.html', content, 'utf8');
}
