const fs = require('fs');

let pathIndex = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/index.html';
let dataIndex = fs.readFileSync(pathIndex, 'utf8');

// Add ti to contrasenas
dataIndex = dataIndex.replace(
    /comercializacion: "" \/\/ No requiere contraseña/g,
    `comercializacion: "", // No requiere contraseña
            ti: "" // No requiere contraseña`
);

// Add ti to nombresAreas
dataIndex = dataIndex.replace(
    /rrhh: "Área de Recursos Humanos"/g,
    `rrhh: "Área de Recursos Humanos",
                ti: "Tecnología (TI)"`
);

fs.writeFileSync(pathIndex, dataIndex, 'utf8');
console.log('Fixed passwords logic for TI');
