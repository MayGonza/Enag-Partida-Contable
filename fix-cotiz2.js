const fs = require('fs');
let path = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html';
let data = fs.readFileSync(path, 'utf8');

const renderRowOld = `<td class="align-right" style="font-weight: bold;">\${formatMoneda(c.totalGeneral)}</td>
                    <td class="align-center">
                        <button class="btn-history-action btn-history-load" onclick="cargarCotizacionDesdeHistorial(\${c.numero})">Cargar</button>
                        <button class="btn-history-action btn-history-pdf" onclick="generarPDFDirecto(\${c.numero})">PDF</button>
                        <button class="btn-history-action btn-history-delete" onclick="eliminarCotizacion(\${c.numero})">Eliminar</button>
                    </td>`;

const renderRowNew = `<td class="align-right" style="font-weight: bold;">\${formatMoneda(c.totalGeneral)}</td>
                    <td class="align-center">
                        <select onchange="cambiarEstadoCotizacion(\${c.numero}, this.value)" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; font-size: 0.85em; background-color: \${c.estado === 'Aprobada' ? '#d1fae5' : c.estado === 'Rechazada' ? '#fee2e2' : '#fef3c7'}; color: \${c.estado === 'Aprobada' ? '#065f46' : c.estado === 'Rechazada' ? '#991b1b' : '#92400e'};">
                            <option value="Pendiente" \${c.estado === 'Pendiente' || !c.estado ? 'selected' : ''}>⏳ Pendiente</option>
                            <option value="Aprobada" \${c.estado === 'Aprobada' ? 'selected' : ''}>✅ Aprobada</option>
                            <option value="Rechazada" \${c.estado === 'Rechazada' ? 'selected' : ''}>❌ Rechazada</option>
                        </select>
                    </td>
                    <td class="align-center">
                        <button class="btn-history-action btn-history-load" onclick="cargarCotizacionDesdeHistorial(\${c.numero})">Cargar</button>
                        <button class="btn-history-action btn-history-pdf" onclick="generarPDFDirecto(\${c.numero})">PDF</button>
                        <button class="btn-history-action btn-history-delete" onclick="eliminarCotizacion(\${c.numero})">Eliminar</button>
                    </td>`;

data = data.replace(renderRowOld, renderRowNew);

// Since my previous script looked for c.id instead of c.numero in cambiarEstadoCotizacion, I need to fix that too
data = data.replace(/c => c\.id === id/g, 'c => c.numero == id');

fs.writeFileSync(path, data, 'utf8');
console.log('Fixed render row');
