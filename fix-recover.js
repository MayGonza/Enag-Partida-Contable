const fs = require('fs');
let logPath = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/login.html';
let logData = fs.readFileSync(logPath, 'utf8');

let newLogic = `
            let email = userVal;
            if (!email.includes('@')) {
                try {
                    const snapshot = await dbFirestore.collection('usuarios').where('usuario', '==', userVal).get();
                    if (snapshot.empty) {
                        alert("No se encontró ningún usuario con ese nombre de usuario.");
                        return;
                    }
                    email = snapshot.docs[0].data().correo;
                } catch(error) {
                    console.error("Error buscando usuario:", error);
                    email = email + '@enag.hn';
                }
            }
`;

logData = logData.replace(
    /let email = userVal;\s*if \(!email\.includes\('@'\)\) \{\s*email = email \+ '@enag\.hn';\s*\}/g,
    newLogic
);

fs.writeFileSync(logPath, logData, 'utf8');
console.log('Fixed recover');
