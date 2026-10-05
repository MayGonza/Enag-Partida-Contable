const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'views');
const files = ['partidas.html', 'partidas_credito.html', 'comprobante_retencion.html'];

files.forEach(file => {
    let content = fs.readFileSync(path.join(viewsDir, file), 'utf8');
    
    const bitacoraCode = `
            if (window.registrarBitacora) {
                window.registrarBitacora('Contabilidad', 'Generar PDF', 'Se generó un documento en el módulo Contabilidad');
            }
`;

    let changed = false;
    
    if (!content.includes('Generar PDF\', \'Se')) {
        const originalContent = content;
        content = content.replace(/(link\.download = [^;]+;)/g, `$1${bitacoraCode}`);
        if (content !== originalContent) changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(path.join(viewsDir, file), content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
