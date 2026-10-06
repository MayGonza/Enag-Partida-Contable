const fs = require('fs');
let content = fs.readFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/orden_produccion.html', 'utf8');

// fix typo
content = content.replace('15pxYA', '15px');

// fix fallback
const oldCatch = `            } catch (e) {
                console.error("Error al cargar ordenes", e);
                grid.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center; grid-column: 1 / -1;">Error al cargar las órdenes de producción.</div>';
            }`;
const newCatch = `            } catch (e) {
                console.error("Error al cargar ordenes", e);
                
                try {
                    const localData = localStorage.getItem('enag_cotizaciones');
                    if (localData) {
                        const localCotizaciones = JSON.parse(localData);
                        ordenesGlobal = localCotizaciones.filter(c => c.estado === 'Aprobada');
                        ordenesGlobal.forEach(c => {
                            if (!c.faseProduccion) c.faseProduccion = 'Ingresada';
                            c.id = String(c.numero);
                        });
                        dibujarGrid();
                        return;
                    } else {
                        grid.innerHTML = '<div style="color: #64748b; padding: 20px; text-align: center; grid-column: 1 / -1;">No hay órdenes pendientes. (Consejo: Asegúrate de guardar la cotización y cambiar su estado a "Aprobada" en el historial de cotizaciones).</div>';
                        return;
                    }
                } catch(err){
                    console.error("Error fallback local", err);
                }

                grid.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center; grid-column: 1 / -1;">Error de conexión. Intente iniciar sesión.</div>';
            }`;

content = content.replace(oldCatch, newCatch);

const oldAvanzarCatch = `            } catch (e) {
                console.error("Error al avanzar fase", e);
                alert("Hubo un error al guardar el cambio. Revisa tu conexión.");
            }`;
const newAvanzarCatch = `            } catch (e) {
                console.error("Error al avanzar fase", e);
                
                // Fallback: guardar en localStorage si falló la nube
                try {
                    const localData = localStorage.getItem('enag_cotizaciones');
                    if (localData) {
                        const localCotizaciones = JSON.parse(localData);
                        const index = localCotizaciones.findIndex(c => String(c.numero) === ordenSeleccionadaId);
                        if (index !== -1) {
                            localCotizaciones[index].faseProduccion = nuevaFase;
                            localStorage.setItem('enag_cotizaciones', JSON.stringify(localCotizaciones));
                            
                            orden.faseProduccion = nuevaFase;
                            actualizarTrackingUI(nuevaFase);
                            dibujarGrid();
                            alert(\`✅ [MODO LOCAL] La orden ha avanzado exitosamente al departamento: \${nuevaFase}\`);
                            return;
                        }
                    }
                } catch(err){}
                
                alert("Hubo un error al guardar el cambio. Revisa tu conexión.");
            }`;
content = content.replace(oldAvanzarCatch, newAvanzarCatch);

fs.writeFileSync('c:/Users/DELL/OneDrive/Desktop/Enag-Partida-Contable/Enag-Partida-Contable/views/orden_produccion.html', content, 'utf8');
console.log('Fallbacks restored');
