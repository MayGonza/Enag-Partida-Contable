const fs = require('fs');
let file = 'c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html';
let data = fs.readFileSync(file, 'utf8');

// Fix cambiarEstadoCotizacion
data = data.replace(
    /function cambiarEstadoCotizacion\(id, nuevoEstado\) \{([\s\S]*?)let msj = "Se creó o actualizó la cotización #" \+ cData\.numero \+ " para el cliente " \+ \(cData\.cliente \? cData\.cliente\.nombre : 'Desconocido'\);\s*window\.registrarBitacora\('Comercialización', 'Guardar Cotización', msj\);/m,
    `function cambiarEstadoCotizacion(id, nuevoEstado) {$1let msj = "Se actualizó el estado de la cotización #" + cData.numero + " a '" + nuevoEstado + "' (Cliente: " + (cData.cliente ? cData.cliente.nombre : 'Desconocido') + ")";
                            window.registrarBitacora('Comercialización', 'Actualizar Estado', msj);`
);

// Fix eliminarCotizacion (the broken try catch block)
data = data.replace(
    /function eliminarCotizacion\(numero\) \{[\s\S]*?if \(confirm\([\s\S]*?cotizaciones = cotizaciones\.filter[^\n]*\n\s*localStorage\.setItem[^\n]*\n\s*\/\/ Guardar en Firestore para la bitácora\n\s*try \{[\s\S]*?\} catch\(e\) \{ console\.error\("Error guardando en Firestore:", e\); \}/,
    `function eliminarCotizacion(numero) {
            if (confirm(\`¿Está seguro de que desea eliminar esta cotización del historial?\`)) {
                cotizaciones = cotizaciones.filter(c => Number(c.numero) !== Number(numero));
                localStorage.setItem('enag_cotizaciones', JSON.stringify(cotizaciones));
                try {
                    if (typeof dbFirestore !== 'undefined') {
                        dbFirestore.collection('cotizaciones').doc(String(numero)).delete().catch(e => console.error("Error al eliminar de Firestore:", e));
                    }
                    if (window.registrarBitacora) {
                        window.registrarBitacora('Comercialización', 'Eliminar Cotización', "Se eliminó la cotización #" + numero);
                    }
                } catch(e) { console.error("Error guardando bitácora:", e); }`
);

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed!');
