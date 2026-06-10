const { app, BrowserWindow } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, // Mantener un ancho predeterminado razonable
    height: 750, // Mantener una altura predeterminada razonable
    minWidth: 350, // Permitir que la ventana se reduzca a dimensiones de móvil
    minHeight: 600, // Establecer una altura mínima para la usabilidad
    resizable: true
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);
