const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(viewsDir, file), 'utf8');
    let moduleName = 'General';
    
    if (file.includes('constancia') || file.includes('incapacidade') || file.includes('vacacione')) {
        moduleName = 'Recursos Humanos';
    } else if (file.includes('voucher')) {
        moduleName = 'Planillas';
    } else if (file.includes('orden_produccion')) {
        moduleName = 'Producción';
    } else if (file.includes('partida') || file.includes('comprobante')) {
        moduleName = 'Contabilidad';
    } else if (file.includes('manual')) {
        moduleName = 'TI';
    } else if (file.includes('cotizaciones') || file.includes('comercializacion')) {
        moduleName = 'Comercialización';
    }
    
    const bitacoraCode = `
            if (window.registrarBitacora) {
                window.registrarBitacora('${moduleName}', 'Generar PDF', 'Se generó un documento en el módulo ${moduleName}');
            }
`;

    let changed = false;
    
    // Add to doc.save
    if (!content.includes(`Se generó un documento en el módulo`)) {
        const originalContent = content;
        content = content.replace(/(doc\.save\(.*?\);)/g, `$1${bitacoraCode}`);
        if (content !== originalContent) changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(path.join(viewsDir, file), content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
