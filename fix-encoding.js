const fs = require('fs');

const files = [
    'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/login.html',
    'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/registro.html'
];

const fixes = {
    'Ã³': 'ó',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã±': 'ñ',
    'Â¿': '¿',
    'Ã ': 'Á',
    'â€”': '—',
    'Ãº': 'ú',
    'Ã¼': 'ü',
    'Ã‘': 'Ñ'
};

files.forEach(file => {
    let data = fs.readFileSync(file, 'utf8');
    for (const [bad, good] of Object.entries(fixes)) {
        // use regex with global flag to replace all occurrences
        const regex = new RegExp(bad, 'g');
        data = data.replace(regex, good);
    }
    fs.writeFileSync(file, data, 'utf8');
    console.log('Fixed', file);
});
