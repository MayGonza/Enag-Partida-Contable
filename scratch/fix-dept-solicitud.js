const fs = require('fs');
const file = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/solicitud_personal.html';
let content = fs.readFileSync(file, 'utf8');

const targetStr = '<option value="Dirección">Dirección / Administración</option>';
const replacementStr = targetStr + `
                          <option value="Corrección">Corrección</option>
                          <option value="Diseño Gráfico">Diseño Gráfico</option>
                          <option value="Control de Calidad">Control de Calidad</option>
                          <option value="Sub Gerencia de Producción">Sub Gerencia de Producción</option>
                          <option value="CTP">CTP</option>
                          <option value="Almacén">Almacén</option>
                          <option value="Offset / Guillotina">Offset / Guillotina</option>
                          <option value="Digital">Digital</option>`;

// Only replace if it hasn't been added yet
if (!content.includes('value="Corrección"')) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('solicitud_personal.html actualizado con nuevos departamentos');
} else {
    console.log('Los departamentos ya existian.');
}
