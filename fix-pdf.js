const fs = require('fs');
const file = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html';
let content = fs.readFileSync(file, 'utf8');

// Replacement 1: Reporte de Historial (add column "Estado")
const histRegex = /head:\s*\[\['Fecha y Hora', 'Cliente', 'Términos', 'Total'\]\],/g;
const histRepl = `head: [['Fecha y Hora', 'Cliente', 'Términos', 'Estado', 'Total']],`;
content = content.replace(histRegex, histRepl);

const bodyMapRegex = /return \[\s*fFormateada,\s*c\.cliente\.nombre,\s*c\.terminos,\s*formatMoneda\(c\.totalGeneral\)\s*\];/g;
const bodyMapRepl = `return [
                    fFormateada,
                    c.cliente.nombre,
                    c.terminos,
                    c.estado || 'Pendiente',
                    formatMoneda(c.totalGeneral)
                ];`;
content = content.replace(bodyMapRegex, bodyMapRepl);

const columnStylesRegex = /0: \{ halign: 'center', cellWidth: 40 \},\s*1: \{ cellWidth: 80 \},\s*2: \{ halign: 'center', cellWidth: 30 \},\s*3: \{ halign: 'right', cellWidth: 30 \}/g;
const columnStylesRepl = `0: { halign: 'center', cellWidth: 35 },
                    1: { cellWidth: 65 },
                    2: { halign: 'center', cellWidth: 25 },
                    3: { halign: 'center', cellWidth: 25 },
                    4: { halign: 'right', cellWidth: 30 }`;
content = content.replace(columnStylesRegex, columnStylesRepl);

// Replacement 2: Cotizacion PDF Individual (add "Estado" under Encargado)
const indvRegex = /doc\.setFont\('helvetica', 'normal'\);\s*doc\.setTextColor\(100, 100, 100\);\s*doc\.text\(data\.comercial, 148, titleY \+ 7\);\s*\/\/\ 4\. Estructura de la Tabla de Conceptos/g;
const indvRepl = `doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(data.comercial, 148, titleY + 7);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(80, 80, 80);
            doc.text("Estado de cotización:", 15, titleY + 13);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            const est = data.estado || 'Pendiente';
            doc.text(est.toUpperCase(), 48, titleY + 13);

            // 4. Estructura de la Tabla de Conceptos`;
content = content.replace(indvRegex, indvRepl);

const tableStartYRegex = /startY: titleY \+ 13,/g;
const tableStartYRepl = `startY: titleY + 18,`;
content = content.replace(tableStartYRegex, tableStartYRepl);

fs.writeFileSync(file, content, 'utf8');
console.log("PDF code updated");
