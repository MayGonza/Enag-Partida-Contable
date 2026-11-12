/**
 * Módulo de Soporte Técnico - Sistema ENAG
 * Inyecta un botón flotante y un modal dinámico para solicitar soporte técnico.
 */

(function () {
    // 1. Cargar CSS de soporte dinámicamente si no está presente
    if (!document.getElementById('soporte-css')) {
        const link = document.createElement('link');
        link.id = 'soporte-css';
        link.rel = 'stylesheet';
        // Determinar ruta relativa al stylesheet
        const isSubdir = window.location.pathname.includes('/views/');
        link.href = isSubdir ? '../css/soporte.css' : 'css/soporte.css';
        document.head.appendChild(link);
    }

    // 2. Inyectar HTML del Botón y del Modal
    document.addEventListener("DOMContentLoaded", initSoporteWidget);
    if (document.readyState === "interactive" || document.readyState === "complete") {
        initSoporteWidget();
    }

    // Función para obtener la fecha y hora en formato oficial de Honduras (DD/MM/YYYY hh:mm AM/PM - 12 Horas No Militar)
    function obtenerFechaHoraHonduras() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // La hora 0 se convierte en 12
        const hoursStr = String(hours).padStart(2, '0');
        return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
    }

    let soporteTicketsCache = [];
    let soporteUnsubscribe = null;

    function obtenerNombreUsuarioActivo() {
        return (
            localStorage.getItem('enag_user_nombre') ||
            localStorage.getItem('soporte_nombre_solicitante') ||
            localStorage.getItem('enag_username') ||
            localStorage.getItem('usuario') ||
            sessionStorage.getItem('usuario') ||
            ''
        ).trim();
    }

    function initSoporteWidget() {
        if (document.getElementById('btnSoporteFlotante')) return; // Evitar duplicación

        const defaultFechaHora = obtenerFechaHoraHonduras();

        // Crear el botón flotante
        const btnFloating = document.createElement('button');
        btnFloating.id = 'btnSoporteFlotante';
        btnFloating.className = 'btn-soporte-flotante';
        btnFloating.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 1a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h3a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9z"/>
            </svg>
            <span>Soporte Técnico</span>
            <span id="badgeSoportePorValidar" style="display:none; background:#f97316; color:white; font-size:0.75em; font-weight:800; padding:2px 7px; border-radius:12px; margin-left:4px; box-shadow:0 0 8px rgba(249,115,22,0.7);">⏳ 0</span>
        `;
        btnFloating.addEventListener('click', abrirModalSoporte);
        document.body.appendChild(btnFloating);

        // Crear el Modal con Pestañas (Nueva Solicitud vs Validar / Mis Tickets)
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'modalSoporteOverlay';
        modalOverlay.className = 'modal-soporte-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-soporte-card" style="max-width: 600px;">
                <div class="modal-soporte-header">
                    <h3>
                        <svg style="width:20px;height:20px;fill:currentColor" viewBox="0 0 24 24">
                            <path d="M12 1a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h3a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9z"/>
                        </svg>
                        Mesa de Ayuda — Soporte Técnico TI
                    </h3>
                    <button type="button" class="modal-soporte-cerrar" id="btnCerrarSoporte">&times;</button>
                </div>

                <!-- Barra de Pestañas del Widget -->
                <div style="display:flex; background:#f1f5f9; border-bottom:1px solid #cbd5e1;">
                    <button type="button" id="tabSoporteNuevoBtn" style="flex:1; padding:11px 14px; border:none; background:white; color:#002147; font-weight:700; font-size:0.88em; cursor:pointer; border-bottom:3px solid #002147;">
                        📝 Solicitar Soporte
                    </button>
                    <button type="button" id="tabSoporteMisTicketsBtn" style="flex:1; padding:11px 14px; border:none; background:transparent; color:#64748b; font-weight:700; font-size:0.88em; cursor:pointer; border-bottom:3px solid transparent; display:flex; align-items:center; justify-content:center; gap:6px;">
                        <span>✅ Mis Tickets / Validar Visita</span>
                        <span id="badgeTabPorValidar" style="display:none; background:#f97316; color:white; font-size:0.78em; padding:1px 7px; border-radius:10px;">0</span>
                    </button>
                </div>

                <div class="modal-soporte-body" id="soporteBodyContent" style="max-height: 75vh; overflow-y: auto;">
                    <!-- Pestaña 1: Crear Solicitud -->
                    <div id="vistaSoporteFormulario">
                        <form id="formSoporteTecnico">
                            <div class="form-group-soporte">
                                <label for="soporteNombre">Nombre Completo *</label>
                                <input type="text" id="soporteNombre" required placeholder="Ej. Carlos Mendoza">
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group-soporte">
                                    <label for="soporteFecha">Fecha y Hora</label>
                                    <input type="text" id="soporteFecha" value="${defaultFechaHora}" required>
                                </div>
                                <div class="form-group-soporte">
                                    <label for="soporteDepto">Departamento *</label>
                                    <select id="soporteDepto" required>
                                        <option value="">-- Seleccionar --</option>
                                        <option value="Contabilidad">Contabilidad</option>
                                        <option value="TI">TI</option>
                                        <option value="Bienes Nacionales">Bienes Nacionales</option>
                                        <option value="Recursos Humanos">Recursos Humanos</option>
                                        <option value="Producción">Producción</option>
                                        <option value="Comercialización">Comercialización</option>
                                        <option value="Administración">Administración</option>
                                        <option value="Dirección General">Dirección General</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group-soporte">
                                <label for="soporteDescripcion">Detalle del Problema o Cambio Solicitado *</label>
                                <textarea id="soporteDescripcion" required placeholder="Describa aquí con el mayor detalle posible la situación o cambio requerido..."></textarea>
                            </div>

                            <div class="modal-soporte-footer">
                                <button type="button" class="btn-soporte-cancelar" id="btnCancelarSoporte">Cancelar</button>
                                <button type="submit" class="btn-soporte-enviar" id="btnEnviarSoporte">
                                    <span>Enviar Solicitud</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Pestaña 2: Consultar y Validar Mis Tickets después de la visita -->
                    <div id="vistaSoporteMisTickets" style="display:none;">
                        <div style="margin-bottom: 12px;">
                            <p style="margin:0 0 8px; font-size:0.84em; color:#475569; line-height:1.4;">
                                Revise el estado de sus solicitudes. Cuando el técnico de TI finalice la visita, confirme aquí que el problema fue solucionado para que el ticket pase a <strong>Resuelto</strong>:
                            </p>
                            <input type="text" id="inputBuscarTicketWidget" placeholder="🔍 Filtrar por código (TICK-...) o su nombre..." style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.86em;">
                        </div>
                        <div id="contenedorMisTicketsWidget" style="display:flex; flex-direction:column; gap:10px;">
                            <div style="text-align:center; padding:20px; color:#64748b; font-size:0.88em;">Cargando sus solicitudes...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);

        // Event listeners del Modal
        document.getElementById('btnCerrarSoporte').addEventListener('click', cerrarModalSoporte);
        document.getElementById('btnCancelarSoporte').addEventListener('click', cerrarModalSoporte);
        document.getElementById('tabSoporteNuevoBtn').addEventListener('click', () => cambiarTabWidgetSoporte('nuevo'));
        document.getElementById('tabSoporteMisTicketsBtn').addEventListener('click', () => cambiarTabWidgetSoporte('mistickets'));
        document.getElementById('inputBuscarTicketWidget').addEventListener('input', renderizarMisTicketsEnWidget);

        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) cerrarModalSoporte();
        });

        // Enviar Formulario
        document.getElementById('formSoporteTecnico').addEventListener('submit', enviarTicketSoporte);

        // Iniciar escucha en tiempo real de tickets para notificaciones de validación
        iniciarEscuchaTicketsUsuarioWidget();
    }

    function cambiarTabWidgetSoporte(tab) {
        const btnNuevo = document.getElementById('tabSoporteNuevoBtn');
        const btnMis = document.getElementById('tabSoporteMisTicketsBtn');
        const vistaForm = document.getElementById('vistaSoporteFormulario');
        const vistaMis = document.getElementById('vistaSoporteMisTickets');

        if (!vistaForm || !vistaMis) {
            resetearFormularioSoporte();
            return;
        }

        if (tab === 'mistickets') {
            btnNuevo.style.background = 'transparent';
            btnNuevo.style.color = '#64748b';
            btnNuevo.style.borderBottomColor = 'transparent';

            btnMis.style.background = 'white';
            btnMis.style.color = '#002147';
            btnMis.style.borderBottomColor = '#002147';

            vistaForm.style.display = 'none';
            vistaMis.style.display = 'block';
            renderizarMisTicketsEnWidget();
        } else {
            btnNuevo.style.background = 'white';
            btnNuevo.style.color = '#002147';
            btnNuevo.style.borderBottomColor = '#002147';

            btnMis.style.background = 'transparent';
            btnMis.style.color = '#64748b';
            btnMis.style.borderBottomColor = 'transparent';

            vistaForm.style.display = 'block';
            vistaMis.style.display = 'none';
        }
    }

    function esTicketDelUsuarioActivo(t) {
        const miNombre = obtenerNombreUsuarioActivo().toLowerCase();
        const miUsername = (localStorage.getItem('enag_username') || '').toLowerCase().trim();
        const currentUid = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) ? firebase.auth().currentUser.uid : '';

        if (currentUid && t.solicitanteUid && t.solicitanteUid === currentUid) return true;
        const sol = (t.solicitante || '').toLowerCase().trim();
        if (miNombre && sol && (sol === miNombre || sol.includes(miNombre) || miNombre.includes(sol))) return true;
        if (miUsername && sol && sol === miUsername) return true;
        return false;
    }

    function iniciarEscuchaTicketsUsuarioWidget() {
        const intentarConexion = () => {
            if (typeof dbFirestore === 'undefined' || !dbFirestore) return;
            if (soporteUnsubscribe) return;

            try {
                soporteUnsubscribe = dbFirestore.collection('tickets_soporte')
                    .orderBy('fechaCreacion', 'desc')
                    .limit(60)
                    .onSnapshot((snapshot) => {
                        const arr = [];
                        snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
                        soporteTicketsCache = arr;
                        actualizarBadgePorValidarWidget();
                        renderizarMisTicketsEnWidget();
                    }, (err) => {
                        console.warn('Error escuchando tickets en widget:', err);
                    });
            } catch (e) { }
        };

        intentarConexion();
        setTimeout(intentarConexion, 2000);
    }

    function actualizarBadgePorValidarWidget() {
        const misPendientesValidar = soporteTicketsCache.filter(t => esTicketDelUsuarioActivo(t) && t.estado === 'Por Validar');
        const count = misPendientesValidar.length;

        const badgeBtn = document.getElementById('badgeSoportePorValidar');
        const badgeTab = document.getElementById('badgeTabPorValidar');

        if (badgeBtn) {
            if (count > 0) {
                badgeBtn.style.display = 'inline-block';
                badgeBtn.textContent = `⏳ ${count} por validar`;
            } else {
                badgeBtn.style.display = 'none';
            }
        }
        if (badgeTab) {
            if (count > 0) {
                badgeTab.style.display = 'inline-block';
                badgeTab.textContent = count;
            } else {
                badgeTab.style.display = 'none';
            }
        }
    }

    function renderizarMisTicketsEnWidget() {
        const cont = document.getElementById('contenedorMisTicketsWidget');
        if (!cont) return;

        const q = (document.getElementById('inputBuscarTicketWidget') ? document.getElementById('inputBuscarTicketWidget').value.toLowerCase().trim() : '');

        let lista = soporteTicketsCache.filter(t => {
            if (q) {
                return `${t.codigo || ''} ${t.solicitante || ''} ${t.asunto || ''}`.toLowerCase().includes(q);
            }
            return esTicketDelUsuarioActivo(t);
        });

        if (!q && lista.length === 0) {
            lista = soporteTicketsCache.slice(0, 6);
        }

        cont.innerHTML = '';
        if (lista.length === 0) {
            cont.innerHTML = `<div style="text-align:center; padding:24px; color:#64748b; font-size:0.86em;">No se encontraron tickets asociados. Escriba su código de ticket o su nombre arriba para buscarlo.</div>`;
            return;
        }

        lista.forEach(t => {
            const key = t.id || t.codigo;
            const requiereValidacion = (t.estado === 'Por Validar') || ((t.estado === 'En Proceso' || t.estado === 'Asignado') && (t.solucion || t.diagnostico));

            let bloqueAccion = '';
            if (requiereValidacion) {
                bloqueAccion = `
                    <div style="margin-top:10px; background:#fff7ed; border:1.5px solid #fb923c; border-radius:8px; padding:10px 12px;">
                        <div style="font-weight:800; color:#9a3412; font-size:0.85em; margin-bottom:4px;">
                            ⏳ Visita Técnica Realizada — ¿Quedó resuelto su problema?
                        </div>
                        <input type="text" id="inpValWidget_${key}" placeholder="Comentario de conformidad o detalle (opcional)..." style="width:100%; padding:7px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.82em; margin-bottom:8px; background:white;">
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <button type="button" data-ticket-id="${key}" data-accion="validar" class="btn-validar-widget" style="background:#10b981; color:white; border:none; padding:7px 12px; border-radius:6px; font-weight:700; font-size:0.8em; cursor:pointer;">
                                ✅ Sí, Confirmar y Pasar a Resuelto
                            </button>
                            <button type="button" data-ticket-id="${key}" data-accion="rechazar" class="btn-validar-widget" style="background:#ef4444; color:white; border:none; padding:7px 12px; border-radius:6px; font-weight:700; font-size:0.8em; cursor:pointer;">
                                ❌ No, el Problema Persiste
                            </button>
                        </div>
                    </div>
                `;
            } else if (t.validadoPorUsuario || t.estado === 'Resuelto' || t.estado === 'Cerrado') {
                bloqueAccion = `
                    <div style="margin-top:8px; background:#dcfce7; border:1px solid #86efac; border-radius:6px; padding:7px 10px; font-size:0.8em; color:#166534;">
                        ✅ <strong>Validado conforme por ${t.validadoPorNombre || t.solicitante}</strong> ${t.fechaValidacion ? '(' + t.fechaValidacion + ')' : ''}
                    </div>
                `;
            }

            const card = document.createElement('div');
            card.style.cssText = `background:white; border:1.5px solid ${t.estado === 'Por Validar' ? '#fb923c' : '#cbd5e1'}; border-radius:10px; padding:12px 14px; font-size:0.86em;`;
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <strong style="font-family:monospace; color:#002147; font-size:1.05em;">${t.codigo}</strong>
                    <span style="padding:3px 9px; border-radius:12px; font-size:0.76em; font-weight:700; background:${t.estado === 'Resuelto' ? '#dcfce7' : (t.estado === 'Por Validar' ? '#ffedd5' : '#e0f2fe')}; color:${t.estado === 'Resuelto' ? '#166534' : (t.estado === 'Por Validar' ? '#c2410c' : '#0369a1')};">${t.estado}</span>
                </div>
                <div style="font-weight:700; color:#1e293b; margin-bottom:3px;">${t.asunto || t.descripcion}</div>
                <div style="font-size:0.82em; color:#64748b;">Solicitante: <strong>${t.solicitante}</strong> (${t.departamento}) • Técnico: <strong>${t.tecnicoAsignado || 'Por asignar'}</strong></div>
                ${t.diagnostico ? `<div style="margin-top:5px; font-size:0.84em; color:#334155;"><strong>🔍 Diagnóstico TI:</strong> ${t.diagnostico}</div>` : ''}
                ${t.solucion ? `<div style="margin-top:4px; font-size:0.84em; color:#166534;"><strong>🛠️ Solución:</strong> ${t.solucion}</div>` : ''}
                ${bloqueAccion}
            `;
            cont.appendChild(card);
        });

        cont.querySelectorAll('.btn-validar-widget').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-ticket-id');
                const esValido = this.getAttribute('data-accion') === 'validar';
                procesarValidacionDesdeWidget(id, esValido);
            });
        });
    }

    async function procesarValidacionDesdeWidget(idOrCodigo, fueResuelto) {
        const ticket = soporteTicketsCache.find(t => (t.id && t.id === idOrCodigo) || t.codigo === idOrCodigo);
        if (!ticket) return;

        const inp = document.getElementById('inpValWidget_' + idOrCodigo);
        const comentario = inp ? inp.value.trim() : '';
        const ahoraStr = obtenerFechaHoraHonduras();
        const nombreValidador = obtenerNombreUsuarioActivo() || ticket.solicitante;

        if (!fueResuelto && !comentario) {
            alert('⚠️ Por favor indique en el cuadro de comentario qué inconveniente continúa para que el técnico de TI lo revise.');
            if (inp) inp.focus();
            return;
        }

        if (!ticket.bitacora) ticket.bitacora = [];

        if (fueResuelto) {
            ticket.estado = 'Resuelto';
            ticket.validadoPorUsuario = true;
            ticket.validadoPorNombre = nombreValidador;
            ticket.fechaValidacion = ahoraStr;
            ticket.comentarioValidacion = comentario || 'El usuario comprobó tras la visita técnica que el problema fue resuelto.';
            ticket.rechazadoValidacion = false;

            ticket.bitacora.push({
                fecha: ahoraStr,
                autor: `${nombreValidador} (Solicitante)`,
                accion: 'Validación y Cierre por Usuario',
                nota: `✅ VALIDADO POR EL SOLICITANTE: "${ticket.comentarioValidacion}" — Ticket pasado a estado Resuelto.`
            });
        } else {
            ticket.estado = 'En Proceso';
            ticket.validadoPorUsuario = false;
            ticket.rechazadoValidacion = true;
            ticket.fechaRechazoValidacion = ahoraStr;
            ticket.motivoRechazoValidacion = comentario;

            ticket.bitacora.push({
                fecha: ahoraStr,
                autor: `${nombreValidador} (Solicitante)`,
                accion: 'Reapertura por Solicitante',
                nota: `⚠️ EL PROBLEMA PERSISTE: El solicitante indicó tras la visita: "${comentario}". Ticket devuelto a En Proceso.`
            });
        }

        if (typeof dbFirestore !== 'undefined' && dbFirestore && ticket.id) {
            try {
                await dbFirestore.collection('tickets_soporte').doc(ticket.id).set(ticket, { merge: true });
            } catch (err) {
                console.warn('Error actualizando validación en Firestore:', err);
            }
        }

        renderizarMisTicketsEnWidget();
        actualizarBadgePorValidarWidget();
    }

    function abrirModalSoporte() {
        const overlay = document.getElementById('modalSoporteOverlay');
        if (!overlay) return;

        // Si estaba en pantalla de éxito, restaurar la estructura de pestañas
        if (!document.getElementById('vistaSoporteFormulario')) {
            resetearFormularioSoporte();
        }

        const fechaInput = document.getElementById('soporteFecha');
        if (fechaInput) fechaInput.value = obtenerFechaHoraHonduras();

        const nombreInput = document.getElementById('soporteNombre');
        const nombreGuardado = obtenerNombreUsuarioActivo();
        if (nombreInput && nombreGuardado && !nombreInput.value) {
            nombreInput.value = nombreGuardado;
        }

        overlay.classList.add('active');

        // Si el usuario tiene tickets pendientes de validar ("Por Validar"), abrir directamente la pestaña de validación
        const pendientes = soporteTicketsCache.filter(t => esTicketDelUsuarioActivo(t) && t.estado === 'Por Validar');
        if (pendientes.length > 0) {
            cambiarTabWidgetSoporte('mistickets');
        } else {
            cambiarTabWidgetSoporte('nuevo');
            if (nombreInput && nombreInput.value) {
                const desc = document.getElementById('soporteDescripcion');
                if (desc) desc.focus();
            } else if (nombreInput) {
                nombreInput.focus();
            }
        }
    }

    function cerrarModalSoporte() {
        const overlay = document.getElementById('modalSoporteOverlay');
        if (overlay) overlay.classList.remove('active');

        // Resetear vista del body si estaba en pantalla de éxito
        setTimeout(() => {
            resetearFormularioSoporte();
        }, 300);
    }

    function resetearFormularioSoporte() {
        const bodyContent = document.getElementById('soporteBodyContent');
        if (!bodyContent) return;

        const defaultFechaHora = obtenerFechaHoraHonduras();

        bodyContent.innerHTML = `
            <div id="vistaSoporteFormulario">
                <form id="formSoporteTecnico">
                    <div class="form-group-soporte">
                        <label for="soporteNombre">Nombre Completo *</label>
                        <input type="text" id="soporteNombre" required placeholder="Ej. Carlos Mendoza" value="${obtenerNombreUsuarioActivo()}">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-group-soporte">
                            <label for="soporteFecha">Fecha y Hora</label>
                            <input type="text" id="soporteFecha" value="${defaultFechaHora}" required>
                        </div>
                        <div class="form-group-soporte">
                            <label for="soporteDepto">Departamento *</label>
                            <select id="soporteDepto" required>
                                <option value="">-- Seleccionar --</option>
                                <option value="Contabilidad">Contabilidad</option>
                                <option value="TI">TI</option>
                                <option value="Bienes Nacionales">Bienes Nacionales</option>
                                <option value="Recursos Humanos">Recursos Humanos</option>
                                <option value="Producción">Producción</option>
                                <option value="Comercialización">Comercialización</option>
                                <option value="Administración">Administración</option>
                                <option value="Dirección General">Dirección General</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group-soporte">
                        <label for="soporteDescripcion">Detalle del Problema o Cambio Solicitado *</label>
                        <textarea id="soporteDescripcion" required placeholder="Describa aquí con el mayor detalle posible la situación o cambio requerido..."></textarea>
                    </div>

                    <div class="modal-soporte-footer">
                        <button type="button" class="btn-soporte-cancelar" id="btnCancelarSoporte">Cancelar</button>
                        <button type="submit" class="btn-soporte-enviar" id="btnEnviarSoporte">
                            <span>Enviar Solicitud</span>
                        </button>
                    </div>
                </form>
            </div>

            <div id="vistaSoporteMisTickets" style="display:none;">
                <div style="margin-bottom: 12px;">
                    <p style="margin:0 0 8px; font-size:0.84em; color:#475569; line-height:1.4;">
                        Revise el estado de sus solicitudes. Cuando el técnico de TI finalice la visita, confirme aquí que el problema fue solucionado para que el ticket pase a <strong>Resuelto</strong>:
                    </p>
                    <input type="text" id="inputBuscarTicketWidget" placeholder="🔍 Filtrar por código (TICK-...) o su nombre..." style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.86em;">
                </div>
                <div id="contenedorMisTicketsWidget" style="display:flex; flex-direction:column; gap:10px;"></div>
            </div>
        `;

        document.getElementById('btnCancelarSoporte').addEventListener('click', cerrarModalSoporte);
        document.getElementById('formSoporteTecnico').addEventListener('submit', enviarTicketSoporte);
        const inpBuscar = document.getElementById('inputBuscarTicketWidget');
        if (inpBuscar) inpBuscar.addEventListener('input', renderizarMisTicketsEnWidget);
    }

    async function enviarTicketSoporte(e) {
        e.preventDefault();

        const btnSubmit = document.getElementById('btnEnviarSoporte');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span>Procesando...</span>`;

        const datos = {
            nombre: document.getElementById('soporteNombre').value.trim(),
            fechaHora: document.getElementById('soporteFecha').value.trim(),
            departamento: document.getElementById('soporteDepto').value,
            descripcion: document.getElementById('soporteDescripcion').value.trim()
        };

        // Recordar el nombre ingresado para futuros tickets
        if (datos.nombre) {
            localStorage.setItem('soporte_nombre_solicitante', datos.nombre);
        }

        // Clave gratuita de Web3Forms para enviar directo a maygonza.cs@gmail.com desde GitHub Pages
        const WEB3FORMS_KEY = '5a8c9b20-1a2b-4c3d-8e5f-6a7b8c9d0e1f'; // Se puede reemplazar por la clave gratuita de web3forms.com

        const isLocalServer = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '3000';
        const isElectronOrFile = window.location.protocol === 'file:';

        // 1. Si está ejecutándose localmente con el servidor Node o en Electron, usar el backend local
        if (isLocalServer || isElectronOrFile) {
            try {
                const response = await fetch('http://localhost:3000/api/soporte/ticket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        mostrarExitoSoporte(result);
                        return;
                    }
                }
            } catch (e) {
                console.warn("Backend local no disponible, procediendo con envío web...", e);
            }
        }

        // 2. Si está en GitHub Pages o el backend local no está activo: Generar ticket acumulable localmente
        let localTickets = JSON.parse(localStorage.getItem('soporte_tickets_local') || '[]');
        let maxNum = 1000;
        localTickets.forEach(t => { if (t.numeroTicket > maxNum) maxNum = t.numeroTicket; });
        const numeroTicket = maxNum + 1;

        const fallbackTicket = {
            numeroTicket,
            ...datos,
            creadoEn: new Date().toISOString()
        };
        localTickets.push(fallbackTicket);
        localStorage.setItem('soporte_tickets_local', JSON.stringify(localTickets));

        // Sincronizar también en Firestore (tickets_soporte) para que aparezca en la Mesa de Ayuda TI
        if (typeof dbFirestore !== 'undefined' && dbFirestore) {
            try {
                const ahora = new Date();
                const anioActual = ahora.getFullYear();
                const codigoMesa = `TICK-${anioActual}-${numeroTicket}`;
                const asuntoResumen = datos.descripcion.length > 65 ? datos.descripcion.slice(0, 62) + '...' : datos.descripcion;
                const currentUid = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) ? firebase.auth().currentUser.uid : '';
                await dbFirestore.collection('tickets_soporte').add({
                    codigo: codigoMesa,
                    fechaCreacion: ahora.toISOString(),
                    fechaCreacionTexto: datos.fechaHora || ahora.toLocaleString('es-HN'),
                    solicitante: datos.nombre,
                    solicitanteUid: currentUid,
                    departamento: datos.departamento,
                    ubicacion: 'Reportado desde widget del sistema',
                    categoria: 'Asistencia General',
                    prioridad: 'Media',
                    equipoReferencia: 'No especificado',
                    asunto: asuntoResumen,
                    descripcion: datos.descripcion,
                    estado: 'Nuevo',
                    tecnicoAsignado: 'Sin asignar',
                    diagnostico: '',
                    solucion: '',
                    bitacora: [{
                        fecha: datos.fechaHora || ahora.toLocaleString('es-HN'),
                        autor: datos.nombre,
                        accion: 'Ticket Creado (Widget Soporte)',
                        nota: 'Solicitud registrada desde el botón de Soporte Técnico del sistema.'
                    }]
                });
            } catch (errFs) {
                console.warn("No se pudo sincronizar el ticket en Firestore:", errFs);
            }
        }

        const mailtoSubject = encodeURIComponent(`[TICKET #${numeroTicket}] Solicitud de Soporte - ${datos.departamento}`);
        const mailtoBody = encodeURIComponent(
            `Número de Ticket: #${numeroTicket}\n` +
            `Solicitante: ${datos.nombre}\n` +
            `Fecha y Hora: ${datos.fechaHora}\n` +
            `Departamento: ${datos.departamento}\n\n` +
            `Detalle del Inconveniente / Solicitud:\n${datos.descripcion}`
        );
        const mailtoUrl = `mailto:maygonza.cs@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

        // Configuración de EmailJS
        const EMAILJS_SERVICE_ID = 'service_m4nwa33';
        const EMAILJS_TEMPLATE_ID = 'template_abz297u';
        const EMAILJS_PUBLIC_KEY = 'L9psQ9g3wbdxheABd';

        // Intentar envío web mediante EmailJS con plantilla HTML totalmente personalizada
        let emailWebEnviado = false;
        try {
            const emailJsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: EMAILJS_SERVICE_ID,
                    template_id: EMAILJS_TEMPLATE_ID,
                    user_id: EMAILJS_PUBLIC_KEY,
                    template_params: {
                        numero_ticket: `#TICK-${numeroTicket}`,
                        solicitante: datos.nombre,
                        fecha_hora: datos.fechaHora,
                        departamento: datos.departamento,
                        descripcion: datos.descripcion,
                        to_email: 'maygonza.cs@gmail.com'
                    }
                })
            });

            if (emailJsRes.ok) {
                emailWebEnviado = true;
            }
        } catch (errWeb) {
            console.warn("Envío por EmailJS no disponible.", errWeb);
        }

        mostrarExitoSoporte({
            numeroTicket,
            emailEnviado: emailWebEnviado,
            destino: 'maygonza.cs@gmail.com'
        });
    }

    function mostrarExitoSoporte(res) {
        const bodyContent = document.getElementById('soporteBodyContent');

        bodyContent.innerHTML = `
            <div class="ticket-exito-box">
                <div style="font-size: 40px; margin-bottom: 5px;">✅</div>
                <h3 style="color: #002147; margin: 5px 0;">¡Solicitud Generada Exitosamente!</h3>
                <p style="color: #64748b; font-size: 14px; margin: 5px 0;">Su número de ticket asignado es:</p>
                <div class="ticket-badge">#TICK-${res.numeroTicket}</div>
                <p style="font-size: 13.5px; color: #334155; line-height: 1.5; margin: 15px 0;">
                    La solicitud ha sido registrada y enviada al correo: <br>
                    <strong style="color: #002147;">${res.destino || 'maygonza.cs@gmail.com'}</strong>
                </p>
                <div style="display: flex; justify-content: center; margin-top: 20px;">
                    <button type="button" class="btn-soporte-enviar" style="padding: 10px 24px; font-size: 14px;" onclick="document.getElementById('modalSoporteOverlay').classList.remove('active')">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
    }
})();

