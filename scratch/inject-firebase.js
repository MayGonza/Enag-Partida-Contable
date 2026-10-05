const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'views');
const htmlFiles = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

const scriptsToInject = `
    <!-- Firebase SDK Compat v10 -->
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>
    <script src="../js/firebase-config.js"></script>
`;

let count = 0;

for (const file of htmlFiles) {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it already has firebase-config.js
    if (!content.includes('firebase-config.js')) {
        // Find </body>
        if (content.includes('</body>')) {
            content = content.replace('</body>', scriptsToInject + '\n</body>');
            fs.writeFileSync(filePath, content);
            console.log('Injected scripts into ' + file);
            count++;
        }
    }
}

console.log('Total files fixed: ' + count);
