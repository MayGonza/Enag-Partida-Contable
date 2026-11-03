const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
c = c.replace(/href="views\/([a-zA-Z0-9_]+)\.html"/g, 'href="views/$1.html?v=5"');
fs.writeFileSync('index.html', c);
