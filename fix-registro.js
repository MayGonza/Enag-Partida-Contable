const fs = require('fs');
const path = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/registro.html';
let data = fs.readFileSync(path, 'utf8');

const regexes = [
    { target: /const fullName = document.getElementById\('fullName'\)\.value\.trim\(\);/,
      repl: `const fullNameEl = document.getElementById('fullName');\n            if(!fullNameEl) { alert("Falta fullName"); return; }\n            const fullName = fullNameEl.value.trim();` },
    { target: /const username = document.getElementById\('username'\)\.value\.trim\(\)\.toLowerCase\(\);/,
      repl: `const usernameEl = document.getElementById('username');\n            if(!usernameEl) { alert("Falta username"); return; }\n            const username = usernameEl.value.trim().toLowerCase();` },
    { target: /const email = document.getElementById\('email'\)\.value\.trim\(\);/,
      repl: `const emailEl = document.getElementById('email');\n            if(!emailEl) { alert("Falta email"); return; }\n            const email = emailEl.value.trim();` },
    { target: /const department = document.getElementById\('department'\)\.value;/,
      repl: `const departmentEl = document.getElementById('department');\n            if(!departmentEl) { alert("Falta department"); return; }\n            const department = departmentEl.value;` },
    { target: /const password = document.getElementById\('password'\)\.value;/,
      repl: `const passwordEl = document.getElementById('password');\n            if(!passwordEl) { alert("Falta password"); return; }\n            const password = passwordEl.value;` },
    { target: /const confirmPassword = document.getElementById\('confirmPassword'\)\.value;/,
      repl: `const confirmPasswordEl = document.getElementById('confirmPassword');\n            if(!confirmPasswordEl) { alert("Falta confirmPassword"); return; }\n            const confirmPassword = confirmPasswordEl.value;` }
];

let changed = false;
regexes.forEach(r => {
    if (r.target.test(data)) {
        data = data.replace(r.target, r.repl);
        changed = true;
    }
});

if (changed) {
    fs.writeFileSync(path, data, 'utf8');
    console.log('Fixed variables');
} else {
    console.log('No matches found. Check the regex or file content.');
}
