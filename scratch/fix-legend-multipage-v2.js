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
    
    // We want to replace the previously injected block.
    // The previous block started with "// Agregar leyenda de generacion en todas las paginas"
    // and ended with 'doc.text("Documento generado por: " + userName, 14, doc.internal.pageSize.getHeight() - 10);'
    // followed by a closing brace }
    
    const regex = /\/\/ Agregar leyenda de generacion en todas las paginas[\s\S]*?doc\.text\("Documento generado por: " \+ userName, 14, doc\.internal\.pageSize\.getHeight\(\) - 10\);\s*\}/g;
    
    const newLegendCode = `// Agregar leyenda de generacion en todas las paginas (Actualizado)
            let userName = "Usuario Desconocido";
            if (typeof firebase !== 'undefined') {
                const currentUser = await new Promise(resolve => {
                    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
                        unsubscribe();
                        resolve(user);
                    });
                });
                
                if (currentUser) {
                    try {
                        const uDoc = await dbFirestore.collection('usuarios').doc(currentUser.uid).get();
                        if (uDoc.exists) userName = uDoc.data().usuario || currentUser.email;
                        else userName = currentUser.email;
                    } catch(e) {
                        userName = currentUser.email;
                    }
                }
            }
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(100);
                // Subido a -28 para que no tape el membrete inferior
                doc.text("Documento generado por: " + userName, 14, doc.internal.pageSize.getHeight() - 28);
            }`;

    if (content.match(regex)) {
        content = content.replace(regex, newLegendCode);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file} with correct user fetch and relocated text`);
    } else {
        console.log(`Regex did not match in ${file}`);
    }
});
