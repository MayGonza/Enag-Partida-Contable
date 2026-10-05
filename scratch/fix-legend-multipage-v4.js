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
    
    const regex = /\/\/ Agregar leyenda de generacion en todas las paginas \(Actualizado v3\)[\s\S]*?doc\.text\("Documento generado por: " \+ userName, 14, doc\.internal\.pageSize\.getHeight\(\) - 35\);\s*\}/g;
    
    const newLegendCode = `// Agregar leyenda de generacion en todas las paginas (Actualizado v4)
            let userName = localStorage.getItem('enag_username');
            if (!userName && typeof firebase !== 'undefined' && firebase.auth().currentUser) {
                userName = firebase.auth().currentUser.email;
            }
            if (!userName) userName = "Usuario Desconocido";
            
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text("Documento generado por: " + userName, 14, doc.internal.pageSize.getHeight() - 40);
            }`;

    if (content.match(regex)) {
        content = content.replace(regex, newLegendCode);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file} with fallback and -40 height`);
    } else {
        console.log(`Regex did not match in ${file}`);
    }
});
