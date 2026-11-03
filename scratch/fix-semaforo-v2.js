const fs = require('fs');
let content = fs.readFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html', 'utf8');

const oldLogic = `                // Semáforo de vigencia (15 días)
                let diffDays = 0;
                try {
                    const fStr = typeof c.fecha === 'string' ? c.fecha : new Date(c.fecha).toISOString();
                    const parts = fStr.split('T')[0].split('-');
                    if (parts.length >= 3) {
                        const cotDate = new Date(parts[0], parts[1] - 1, parts[2]);
                        const hoy = new Date();
                        hoy.setHours(0, 0, 0, 0);
                        const diffTime = hoy.getTime() - cotDate.getTime();
                        diffDays = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;
                    }
                } catch(e) { console.error('Error calculando vigencia', e); }`;

const newLogic = `                // Semáforo de vigencia (15 días)
                let diffDays = 0;
                try {
                    let fDate = new Date();
                    if (typeof c.fecha === 'string') {
                        if (c.fecha.includes('-')) {
                            const p = c.fecha.split('T')[0].split('-');
                            fDate = new Date(p[0], p[1] - 1, p[2]);
                        } else if (c.fecha.includes('/')) {
                            const p = c.fecha.split(' ')[0].split('/');
                            fDate = new Date(p[2], p[1] - 1, p[0]);
                        } else {
                            fDate = new Date(c.fecha);
                        }
                    } else {
                        fDate = new Date(c.fecha);
                    }
                    if (fDate && !isNaN(fDate.getTime())) {
                        const hoy = new Date();
                        hoy.setHours(0, 0, 0, 0);
                        fDate.setHours(0, 0, 0, 0);
                        const diffTime = hoy.getTime() - fDate.getTime();
                        diffDays = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;
                    }
                } catch(e) { console.error('Error calculando vigencia', e); }`;

if (content.includes(oldLogic)) {
    content = content.replace(oldLogic, newLogic);
    fs.writeFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html', content, 'utf8');
    console.log('Logica de vigencia SUPER reparada');
} else {
    console.log('No se encontro el texto exacto');
}
