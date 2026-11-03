const fs = require('fs');
const path = require('path');

const fileOp = path.join(__dirname, '..', 'views', 'orden_produccion.html');
let content = fs.readFileSync(fileOp, 'utf8');

// 1. Add Firebase SDK and Tracking UI
if (!content.includes('firebase-app-compat.js')) {
    const headInjection = `
    <!-- Firebase SDK Compat v10 -->
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>
    <script src="../js/firebase-config.js"></script>
    `;
    content = content.replace('</head>', headInjection + '\n</head>');
}

// 2. Add custom CSS for the kanban/board
const cssInjection = `
        /* Kanban / Dashboard Styles */
        .dashboard-container {
            max-width: 1100px;
            margin: 0 auto 20px auto;
            background: rgba(255, 255, 255, 0.98);
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border-top: 5px solid #0f172a;
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }

        .dashboard-header h3 {
            margin: 0;
            color: #0f172a;
            font-size: 1.3em;
        }

        .orders-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            max-height: 400px;
            overflow-y: auto;
            padding-right: 5px;
        }

        .order-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }

        .order-card:hover {
            border-color: #0ea5e9;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
            transform: translateY(-2px);
        }

        .order-card.active {
            border-color: #2563eb;
            background: #eff6ff;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .order-title {
            font-weight: bold;
            font-size: 1em;
            color: #1e293b;
            margin-bottom: 5px;
        }

        .order-meta {
            font-size: 0.85em;
            color: #64748b;
            margin-bottom: 10px;
        }

        .order-status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        /* Status Colors */
        .status-cotizada { background: #fef08a; color: #854d0e; }
        .status-ingresada { background: #e0f2fe; color: #0369a1; }
        .status-preprensa { background: #dbeafe; color: #1e40af; }
        .status-impresion { background: #fce7f3; color: #be185d; }
        .status-encuadernacion { background: #ffedd5; color: #c2410c; }
        .status-entregada { background: #dcfce7; color: #166534; }

        .tracking-panel {
            margin-top: 20px;
            background: #fff;
            padding: 20px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
        }
        .tracking-steps {
            display: flex;
            justify-content: space-between;
            position: relative;
            margin-bottom: 20px;
        }
        .tracking-steps::before {
            content: "";
            position: absolute;
            top: 15px;
            left: 10%;
            right: 10%;
            height: 3px;
            background: #e2e8f0;
            z-index: 1;
        }
        .step {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            flex: 1;
        }
        .step-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #fff;
            border: 3px solid #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #cbd5e1;
            transition: all 0.3s;
        }
        .step.active .step-circle {
            border-color: #3b82f6;
            background: #3b82f6;
            color: white;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }
        .step.completed .step-circle {
            border-color: #10b981;
            background: #10b981;
            color: white;
        }
        .step-label {
            font-size: 0.8em;
            font-weight: 600;
            color: #64748b;
            text-align: center;
        }
        .step.active .step-label { color: #2563eb; }
        .step.completed .step-label { color: #059669; }

        .btn-advance {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            font-size: 1em;
            transition: all 0.3s;
        }
        .btn-advance:hover { background-color: #2563eb; }
        .btn-advance:disabled { background-color: #94a3b8; cursor: not-allowed; }
`;

content = content.replace('</style>', cssInjection + '\n    </style>');

// 3. Add Dashboard HTML before <div class="container">
const dashboardHtml = `
    <div class="dashboard-container">
        <div class="dashboard-header">
            <h3>📋 Órdenes Pendientes (Aprobadas por Cliente)</h3>
            <button class="btn-generate" onclick="cargarOrdenes()" style="margin-left:0; background-color:#64748b; padding:8px 15px; font-size:0.85em;">🔄 Actualizar</button>
        </div>
        <div class="orders-grid" id="ordersGrid">
            <div style="color: #64748b; padding: 20px; text-align: center; grid-column: 1 / -1;">Cargando órdenes desde el sistema...</div>
        </div>

        <div class="tracking-panel" id="trackingPanel" style="display: none;">
            <h4 style="margin-top:0; color:#0f172a; border-bottom:1px solid #eee; padding-bottom:10px;">Gestión de Estado (Tracking)</h4>
            <div class="tracking-steps" id="trackingSteps">
                <div class="step" data-phase="Ingresada">
                    <div class="step-circle">1</div>
                    <div class="step-label">Ingresada</div>
                </div>
                <div class="step" data-phase="Pre-Prensa">
                    <div class="step-circle">2</div>
                    <div class="step-label">Pre-Prensa</div>
                </div>
                <div class="step" data-phase="Impresión">
                    <div class="step-circle">3</div>
                    <div class="step-label">Impresión</div>
                </div>
                <div class="step" data-phase="Encuadernación">
                    <div class="step-circle">4</div>
                    <div class="step-label">Encuadernación</div>
                </div>
                <div class="step" data-phase="Entregada">
                    <div class="step-circle">✓</div>
                    <div class="step-label">Entregada</div>
                </div>
            </div>
            <button id="btnAdvancePhase" class="btn-advance" onclick="avanzarFase()">Avanzar al siguiente departamento</button>
        </div>
    </div>
`;
content = content.replace('<div class="container">', dashboardHtml + '\n    <div class="container">');

// 4. Add Javascript logic
const scriptInjection = `
        let ordenesGlobal = [];
        let ordenSeleccionadaId = null;

        const fases = ['Ingresada', 'Pre-Prensa', 'Impresión', 'Encuadernación', 'Entregada'];

        async function cargarOrdenes() {
            if (typeof dbFirestore === 'undefined') return;
            const grid = document.getElementById('ordersGrid');
            grid.innerHTML = '<div style="color: #64748b; padding: 20px; text-align: center; grid-column: 1 / -1;">Cargando...</div>';
            
            try {
                // Obtener cotizaciones aprobadas
                const snapshot = await dbFirestore.collection('cotizaciones').where('estado', '==', 'Aprobada').get();
                ordenesGlobal = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if(!data.faseProduccion) data.faseProduccion = 'Ingresada'; // Default
                    ordenesGlobal.push({ id: doc.id, ...data });
                });

                // Ordenar por numero
                ordenesGlobal.sort((a,b) => b.numero - a.numero);

                dibujarGrid();
            } catch (e) {
                console.error("Error al cargar ordenes", e);
                grid.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center; grid-column: 1 / -1;">Error al cargar las órdenes de producción.</div>';
            }
        }

        function dibujarGrid() {
            const grid = document.getElementById('ordersGrid');
            grid.innerHTML = '';
            
            if(ordenesGlobal.length === 0) {
                grid.innerHTML = '<div style="color: #64748b; padding: 20px; text-align: center; grid-column: 1 / -1;">No hay órdenes aprobadas pendientes.</div>';
                return;
            }

            ordenesGlobal.forEach(orden => {
                const card = document.createElement('div');
                card.className = \`order-card \${ordenSeleccionadaId === orden.id ? 'active' : ''}\`;
                card.onclick = () => seleccionarOrden(orden.id);
                
                const claseEstado = 'status-' + orden.faseProduccion.toLowerCase().replace(/[^a-z0-9]/g, '');

                card.innerHTML = \`
                    <div class="order-title">Orden #\${orden.numero}</div>
                    <div class="order-meta">\${orden.cliente?.nombre || 'Sin cliente'}</div>
                    <div class="order-status \${claseEstado}">\${orden.faseProduccion}</div>
                \`;
                grid.appendChild(card);
            });
        }

        function seleccionarOrden(id) {
            ordenSeleccionadaId = id;
            dibujarGrid(); // Update active class
            
            const orden = ordenesGlobal.find(o => o.id === id);
            if(!orden) return;

            // Fill form
            document.getElementById('noOrden').value = orden.numero || '';
            document.getElementById('cliente').value = orden.cliente?.nombre || '';
            
            if(orden.fecha) {
                const d = new Date(orden.fecha);
                const dia = String(d.getDate()).padStart(2, '0');
                const mes = String(d.getMonth() + 1).padStart(2, '0');
                const anio = d.getFullYear();
                document.getElementById('fechaIngreso').value = \`\${dia}/\${mes}/\${anio}\`;
            }

            // Fill table (Trabajo)
            const tbodyTrabajo = document.getElementById('tbodyTrabajo');
            tbodyTrabajo.innerHTML = '';
            if(orden.items && orden.items.length > 0) {
                orden.items.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = \`
                        <td><input type="text" class="t_cant" value="\${item.cantidad || ''}"></td>
                        <td><input type="text" class="t_desc" value="\${item.producto || ''} \${item.detalle ? '- ' + item.detalle : ''}"></td>
                        <td><input type="text" class="t_tam"></td>
                        <td><input type="text" class="t_copias"></td>
                        <td><input type="text" class="t_juegos"></td>
                        <td><input type="text" class="t_color"></td>
                        <td><button type="button" class="btn-delete-row" onclick="this.closest('tr').remove()">X</button></td>
                    \`;
                    tbodyTrabajo.appendChild(tr);
                });
            } else {
                agregarFilaTrabajo();
            }

            // Show tracking
            actualizarTrackingUI(orden.faseProduccion);
        }

        function actualizarTrackingUI(faseActual) {
            document.getElementById('trackingPanel').style.display = 'block';
            
            let idxActual = fases.indexOf(faseActual);
            if(idxActual === -1) idxActual = 0;

            const steps = document.querySelectorAll('.tracking-steps .step');
            steps.forEach((step, index) => {
                step.classList.remove('active', 'completed');
                if (index < idxActual) {
                    step.classList.add('completed');
                } else if (index === idxActual) {
                    step.classList.add('active');
                }
            });

            const btn = document.getElementById('btnAdvancePhase');
            if (idxActual >= fases.length - 1) {
                btn.disabled = true;
                btn.innerText = "Orden completada y entregada";
            } else {
                btn.disabled = false;
                btn.innerText = "Marcar salida e ingresar a " + fases[idxActual + 1];
            }
        }

        async function avanzarFase() {
            if(!ordenSeleccionadaId) return;
            const orden = ordenesGlobal.find(o => o.id === ordenSeleccionadaId);
            let idxActual = fases.indexOf(orden.faseProduccion);
            if(idxActual === -1) idxActual = 0;

            if(idxActual >= fases.length - 1) return; // Ya terminó

            const nuevaFase = fases[idxActual + 1];
            
            try {
                // Update Firestore
                await dbFirestore.collection('cotizaciones').doc(ordenSeleccionadaId).update({
                    faseProduccion: nuevaFase,
                    ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Registrar en Bitacora
                if (window.registrarBitacora) {
                    let msj = \`La Orden #\${orden.numero} avanzó a "\${nuevaFase}"\`;
                    await window.registrarBitacora('Producción', 'Cambio de Estado', msj);
                }

                // Update Local
                orden.faseProduccion = nuevaFase;
                actualizarTrackingUI(nuevaFase);
                dibujarGrid();
                alert(\`✅ La orden ha avanzado exitosamente al departamento: \${nuevaFase}\`);

            } catch(e) {
                console.error("Error al avanzar fase", e);
                alert("Hubo un error al guardar el cambio. Revisa tu conexión.");
            }
        }

        // Init load
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if(typeof dbFirestore !== 'undefined') {
                    cargarOrdenes();
                } else {
                    // Try waiting a bit more for firebase to load
                    setTimeout(cargarOrdenes, 1500);
                }
            }, 500);
        });
`;

content = content.replace('window.onload = function () {', scriptInjection + '\n        window.onload = function () {');

fs.writeFileSync(fileOp, content, 'utf8');
console.log('orden_produccion.html actualizado con exito.');
