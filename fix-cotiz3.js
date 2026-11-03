const fs = require('fs');
let path = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html';
let data = fs.readFileSync(path, 'utf8');

// Replace the line generating the totalGeneral and Acciones to insert the Select in the middle
data = data.replace(
    /<td class="align-right" style="font-weight: bold;">\$\{formatMoneda\(c\.totalGeneral\)\}<\/td>([\s\n\r]*)<td class="align-center">([\s\n\r]*<button class="btn-history-action btn-history-load")/g,
    `<td class="align-right" style="font-weight: bold;">\${formatMoneda(c.totalGeneral)}</td>
                    <td class="align-center">
                        <select onchange="cambiarEstadoCotizacion(\${c.numero}, this.value)" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; font-size: 0.85em; background-color: \${c.estado === 'Aprobada' ? '#d1fae5' : c.estado === 'Rechazada' ? '#fee2e2' : '#fef3c7'}; color: \${c.estado === 'Aprobada' ? '#065f46' : c.estado === 'Rechazada' ? '#991b1b' : '#92400e'};">
                            <option value="Pendiente" \${c.estado === 'Pendiente' || !c.estado ? 'selected' : ''}>⏳ Pendiente</option>
                            <option value="Aprobada" \${c.estado === 'Aprobada' ? 'selected' : ''}>✅ Aprobada</option>
                            <option value="Rechazada" \${c.estado === 'Rechazada' ? 'selected' : ''}>❌ Rechazada</option>
                        </select>
                    </td>$1<td class="align-center">$2`
);

fs.writeFileSync(path, data, 'utf8');
console.log('Fixed render row using regex');
