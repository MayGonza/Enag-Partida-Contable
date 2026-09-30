const fs = require('fs');
const path = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/registro.html';
let data = fs.readFileSync(path, 'utf8');
data = data.replace(/âœ”/g, '✔').replace(/âš ï¸ /g, '⚠️').replace(/âš ï¸/g, '⚠️');
data = data.replace(/Usuario registrado exitosamente\. Redirigiendo al login\.\.\./g, 'Cuenta creada. Revise su correo y verifíquelo antes de iniciar sesión.');
data = data.replace(/setTimeout\(\(\) => \{\s*window\.location\.href = 'login\.html';\s*\}, 1500\);/g, `await user.sendEmailVerification(); setTimeout(() => { firebase.auth().signOut().then(() => { window.location.href = 'login.html'; }); }, 4000);`);
fs.writeFileSync(path, data, 'utf8');
console.log('Fixed registro.html');
