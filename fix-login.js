const fs = require('fs');

// Fix registro.html
let regPath = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/registro.html';
let regData = fs.readFileSync(regPath, 'utf8');

regData = regData.replace(
    /await user\.sendEmailVerification\(\);\s*setTimeout\(\(\)\s*=>\s*\{\s*firebase\.auth\(\)\.signOut\(\)\.then\(\(\)\s*=>\s*\{\s*window\.location\.href\s*=\s*'login\.html';\s*\}\);\s*\},\s*4000\);/g,
    `firebase.auth().languageCode = 'es'; await user.sendEmailVerification(); await firebase.auth().signOut(); setTimeout(() => { window.location.href = 'login.html'; }, 3000);`
);

fs.writeFileSync(regPath, regData, 'utf8');

// Fix login.html
let logPath = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/login.html';
let logData = fs.readFileSync(logPath, 'utf8');

let newLogic = `
            let email = userVal;
            if (!email.includes('@')) {
                try {
                    const snapshot = await dbFirestore.collection('usuarios').where('usuario', '==', userVal).get();
                    if (snapshot.empty) {
                        throw { code: 'auth/user-not-found' };
                    }
                    email = snapshot.docs[0].data().correo;
                } catch(error) {
                    if (error.code === 'auth/user-not-found') throw error;
                    email = email + '@enag.hn';
                }
            }
`;

logData = logData.replace(
    /let email = userVal;\s*if \(!email\.includes\('@'\)\) \{\s*email = email \+ '@enag\.hn';\s*\}/g,
    newLogic
);

fs.writeFileSync(logPath, logData, 'utf8');
console.log('Fixed both');
