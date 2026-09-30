const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });

try {
    // We mock some things that might fail
    dom.window.escucharAvisosRHTiempoReal = () => {};
    dom.window.unsubscribeAvisosFirestore = null;
    
    // Call the function
    dom.window.mostrarSubmenu('ti');
    
    console.log("menuTI display:", dom.window.document.getElementById('menuTI').style.display);
    console.log("menuTitle text:", dom.window.document.getElementById('menuTitle').textContent);
} catch (e) {
    console.error("Error executing mostrarSubmenu:", e);
}
