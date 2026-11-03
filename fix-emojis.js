const fs = require('fs');

const files = [
    'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/login.html',
    'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/registro.html'
];

const fixes = {
    'âš ï¸ ': '⚠️',
    'âš ï¸': '⚠️',
    'ðŸ‘¤': '👤',
    'ðŸ”‘': '🔑',
    'â€¢': '•',
    'âž”': '➔',
    'ðŸ“': '📝',
    'âœ‰ï¸ ': '✉️',
    'âœ‰ï¸': '✉️',
    'ðŸ’¼': '💼',
    'ðŸ”’': '🔒',
    'âœ”': '✔'
};

files.forEach(file => {
    let data = fs.readFileSync(file, 'utf8');
    for (const [bad, good] of Object.entries(fixes)) {
        // split and join works well for exact replacements without regex escaping issues
        data = data.split(bad).join(good);
    }
    fs.writeFileSync(file, data, 'utf8');
    console.log('Fixed', file);
});
