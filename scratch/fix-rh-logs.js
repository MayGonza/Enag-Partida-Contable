const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'views');

const fixes = [
    {
        file: 'vouchers.html',
        replacements: [
            {
                from: /window\.registrarBitacora\('Planillas', 'Generar PDF', 'Se generó un documento en el módulo Planillas'\);/g,
                to: "window.registrarBitacora('Planillas', 'Generar PDF', typeof emp !== 'undefined' ? `Se generó Voucher (Acuerdo) para: ${emp.nombre}` : (typeof seleccionados !== 'undefined' ? `Se generaron Vouchers (Acuerdo) por lote (${seleccionados.length} empleados)` : 'Se generó Voucher (Acuerdo)'));"
            }
        ]
    },
    {
        file: 'vouchers_contrato.html',
        replacements: [
            {
                from: /window\.registrarBitacora\('Planillas', 'Generar PDF', 'Se generó un documento en el módulo Planillas'\);/g,
                to: "window.registrarBitacora('Planillas', 'Generar PDF', typeof emp !== 'undefined' ? `Se generó Voucher (Contrato) para: ${emp.nombre}` : (typeof seleccionados !== 'undefined' ? `Se generaron Vouchers (Contrato) por lote (${seleccionados.length} empleados)` : 'Se generó Voucher (Contrato)'));"
            }
        ]
    },
    {
        file: 'constancias.html',
        replacements: [
            {
                from: /window\.registrarBitacora\('Recursos Humanos', 'Generar PDF', 'Se generó un documento en el módulo Recursos Humanos'\);/g,
                to: "window.registrarBitacora('Recursos Humanos', 'Generar PDF', typeof emp !== 'undefined' ? `Se generó Constancia con Deducciones (Acuerdo) para: ${emp.nombre}` : (typeof seleccionados !== 'undefined' ? `Se generaron Constancias con Deducciones (Acuerdo) por lote (${seleccionados.length} empleados)` : 'Se generó Constancia'));"
            }
        ]
    },
    {
        file: 'constancias_contrato.html',
        replacements: [
            {
                from: /window\.registrarBitacora\('Recursos Humanos', 'Generar PDF', 'Se generó un documento en el módulo Recursos Humanos'\);/g,
                to: "window.registrarBitacora('Recursos Humanos', 'Generar PDF', typeof emp !== 'undefined' ? `Se generó Constancia con Deducciones (Contrato) para: ${emp.nombre}` : (typeof seleccionados !== 'undefined' ? `Se generaron Constancias con Deducciones (Contrato) por lote (${seleccionados.length} empleados)` : 'Se generó Constancia'));"
            }
        ]
    },
    {
        file: 'constancias_sin_deducciones.html',
        replacements: [
            {
                from: /window\.registrarBitacora\('Recursos Humanos', 'Generar PDF', 'Se generó un documento en el módulo Recursos Humanos'\);/g,
                to: "window.registrarBitacora('Recursos Humanos', 'Generar PDF', typeof emp !== 'undefined' ? `Se generó Constancia Simple (Acuerdo) para: ${emp.nombre}` : (typeof seleccionados !== 'undefined' ? `Se generaron Constancias Simples (Acuerdo) por lote (${seleccionados.length} empleados)` : 'Se generó Constancia'));"
            }
        ]
    },
    {
        file: 'constancias_sin_deducciones_contrato.html',
        replacements: [
            {
                from: /window\.registrarBitacora\('Recursos Humanos', 'Generar PDF', 'Se generó un documento en el módulo Recursos Humanos'\);/g,
                to: "window.registrarBitacora('Recursos Humanos', 'Generar PDF', typeof emp !== 'undefined' ? `Se generó Constancia Simple (Contrato) para: ${emp.nombre}` : (typeof seleccionados !== 'undefined' ? `Se generaron Constancias Simples (Contrato) por lote (${seleccionados.length} empleados)` : 'Se generó Constancia'));"
            }
        ]
    },
    {
        file: 'vacaciones.html',
        replacements: [
            {
                from: /window\.registrarBitacora\('Recursos Humanos', 'Generar PDF', 'Se generó un documento en el módulo Recursos Humanos'\);/g,
                to: "window.registrarBitacora('Recursos Humanos', 'Generar PDF', typeof emp !== 'undefined' ? `Se generó Formulario de Vacaciones para: ${emp.nombre}` : (typeof seleccionados !== 'undefined' ? `Se generaron Formularios de Vacaciones por lote (${seleccionados.length} empleados)` : 'Se generó Formulario de Vacaciones'));"
            }
        ]
    },
    {
        file: 'incapacidades.html',
        replacements: [
            {
                from: /window\.registrarBitacora\('Recursos Humanos', 'Generar PDF', 'Se generó un documento en el módulo Recursos Humanos'\);/g,
                to: "window.registrarBitacora('Recursos Humanos', 'Generar PDF', typeof emp !== 'undefined' ? `Se generó Formulario de Incapacidad para: ${emp.nombre}` : (typeof seleccionados !== 'undefined' ? `Se generaron Formularios de Incapacidad por lote (${seleccionados.length} empleados)` : 'Se generó Formulario de Incapacidad'));"
            }
        ]
    }
];

let count = 0;

for (const fix of fixes) {
    const filePath = path.join(viewsDir, fix.file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        for (const rep of fix.replacements) {
            if (content.match(rep.from)) {
                content = content.replace(rep.from, rep.to);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log('Fixed logs in ' + fix.file);
            count++;
        }
    }
}

console.log('Total files fixed: ' + count);
