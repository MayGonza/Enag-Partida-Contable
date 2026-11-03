const fs = require('fs');
const path = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/js/firebase-config.js';
let data = fs.readFileSync(path, 'utf8');

// Fix registrarBitacora fallback logic
data = data.replace(
    /if\s*\(\s*uDoc\.exists\s*\)\s*usuarioSino\s*=\s*uDoc\.data\(\)\.usuario\s*\|\|\s*currentUser\.email;/g,
    "if(uDoc.exists) { usuarioSino = uDoc.data().usuario || currentUser.email; } else { usuarioSino = currentUser.email || 'Desconocido'; }"
);

// Add global auth state listener for enag_username
if (!data.includes('localStorage.setItem(\'enag_username\'')) {
    data += `

// Sincronizar nombre de usuario globalmente
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user && dbFirestore) {
            try {
                const uDoc = await dbFirestore.collection('usuarios').doc(user.uid).get();
                if (uDoc.exists) {
                    localStorage.setItem('enag_username', uDoc.data().usuario || user.email);
                } else {
                    localStorage.setItem('enag_username', user.email);
                }
            } catch(e) {
                localStorage.setItem('enag_username', user.email);
            }
        } else if (!user) {
            localStorage.removeItem('enag_username');
        }
    });
}
`;
}

fs.writeFileSync(path, data, 'utf8');
console.log('Fixed firebase-config.js');
