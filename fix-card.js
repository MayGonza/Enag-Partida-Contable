const fs = require('fs');

let pathIndex = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/index.html';
let dataIndex = fs.readFileSync(pathIndex, 'utf8');

dataIndex = dataIndex.replace(
    /if \(dep === 'direccion' \|\| dep === 'ti'\) \{\s*\/\/\s*Tienen acceso a todo el panel\s*document\.getElementById\('areasContainer'\)\.style\.display = 'grid';/g,
    `if (dep === 'direccion' || dep === 'ti') {
                            // Tienen acceso a todo el panel
                            document.getElementById('areasContainer').style.display = 'grid';
                            const cardTI = document.getElementById('cardTI');
                            if (cardTI) cardTI.style.display = 'block';`
);

fs.writeFileSync(pathIndex, dataIndex, 'utf8');
console.log('Fixed card unhiding logic');
