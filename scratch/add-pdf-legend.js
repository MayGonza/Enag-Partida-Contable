const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'views');
const hrAndAcctFiles = [
    'constancias.html',
    'constancias_contrato.html',
    'constancias_sin_deducciones.html',
    'constancias_sin_deducciones_contrato.html',
    'incapacidades.html',
    'vacaciones.html',
    'vouchers.html',
    'vouchers_contrato.html',
    'partidas.html',
    'partidas_credito.html',
    'comprobante_retencion.html'
];

hrAndAcctFiles.forEach(file => {
    const filePath = path.join(viewsDir, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    const legendCode = `
            // Agregar leyenda de generacion
            let userName = "Usuario Desconocido";
            if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
                const currentUser = firebase.auth().currentUser;
                try {
                    const uDoc = await dbFirestore.collection('usuarios').doc(currentUser.uid).get();
                    if (uDoc.exists) userName = uDoc.data().usuario || currentUser.email;
                    else userName = currentUser.email;
                } catch(e) {
                    userName = currentUser.email;
                }
            }
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text("Documento generado por: " + userName, 14, doc.internal.pageSize.getHeight() - 10);
`;

    let changed = false;

    if (!content.includes('Documento generado por:')) {
        const originalContent = content;
        
        // Match doc.save(...)
        content = content.replace(/(doc\.save\(.*?\);)/g, `${legendCode}\n            $1`);
        
        // Match doc.output(...) for partidas
        // Since doc.output is used in partidas.html like: const pdfBlob = doc.output('blob');
        content = content.replace(/(const [a-zA-Z0-9_]+ = doc\.output\('.*?'\);)/g, `${legendCode}\n            $1`);
        
        if (content !== originalContent) changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
