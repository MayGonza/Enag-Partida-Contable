const fs = require('fs');
let content = fs.readFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html', 'utf8');

const oldLogic = `                // Semáforo de vigencia (15 días)
                const cotDate = new Date(c.fecha);
                const hoy = new Date();
                const diffTime = Math.abs(hoy - cotDate);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                let vigenciaBadge = '';
                if (diffDays >= 15) {
                    vigenciaBadge = '<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#ef4444; margin-right:4px; vertical-align:middle;"></span><span style="color:#ef4444; font-size:0.85em; font-weight:bold;">Vencida</span>';
                } else if (diffDays >= 7) {
                    vigenciaBadge = '<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#f59e0b; margin-right:4px; vertical-align:middle;"></span><span style="color:#b45309; font-size:0.85em; font-weight:bold;">Por Vencer</span>';
                } else {
                    vigenciaBadge = '<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#10b981; margin-right:4px; vertical-align:middle;"></span><span style="color:#047857; font-size:0.85em; font-weight:bold;">Vigente</span>';
                }`;

const newLogic = `                // Semáforo de vigencia (15 días)
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
                } catch(e) { console.error('Error calculando vigencia', e); }
                
                let vigenciaBadge = '';
                if (diffDays >= 15) {
                    vigenciaBadge = '<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#ef4444; margin-right:4px; vertical-align:middle;"></span><span style="color:#ef4444; font-size:0.85em; font-weight:bold;">Vencida</span>';
                } else if (diffDays > 7) {
                    vigenciaBadge = '<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#f59e0b; margin-right:4px; vertical-align:middle;"></span><span style="color:#b45309; font-size:0.85em; font-weight:bold;">Por Vencer</span>';
                } else {
                    vigenciaBadge = '<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#10b981; margin-right:4px; vertical-align:middle;"></span><span style="color:#047857; font-size:0.85em; font-weight:bold;">Vigente</span>';
                }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/cotizaciones.html', content, 'utf8');
console.log('Logica de vigencia reparada');
