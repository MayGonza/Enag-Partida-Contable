const fs = require('fs');

let logPath = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/login.html';
let logData = fs.readFileSync(logPath, 'utf8');

// The chunk of code to find (simplified via regex)
// We will look for: let email = userVal; ... if (!email.includes('@')) { email = email + '@enag.hn'; }
// The previous script failed because of the comments.

let newLogic = `                let email = userVal;
                if (!email.includes('@')) {
                    try {
                        const snapshot = await dbFirestore.collection('usuarios').where('usuario', '==', userVal).get();
                        if (snapshot.empty) {
                            throw { code: 'auth/user-not-found', message: 'Usuario no encontrado.' };
                        }
                        email = snapshot.docs[0].data().correo;
                    } catch(error) {
                        if (error.code === 'auth/user-not-found') throw error;
                        console.error("No se pudo buscar el correo en Firestore:", error);
                    }
                }`;

// Using regex to replace the exact block:
logData = logData.replace(
    /let email = userVal;[\s\S]*?if \(!email\.includes\('@'\)\) \{\s*email = email \+ '@enag\.hn';[^\}]*?\}/g,
    newLogic
);

fs.writeFileSync(logPath, logData, 'utf8');
console.log('Fixed login handleLogin logic');
