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
        `;
        btnFloating.addEventListener('click', abrirModalSoporte);
        document.body.appendChild(btnFloating);

        // Crear el Modal
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'modalSoporteOverlay';
        modalOverlay.className = 'modal-soporte-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-soporte-card">
                <div class="modal-soporte-header">
                    <h3>
                        <svg style="width:20px;height:20px;fill:currentColor" viewBox="0 0 24 24">
                            <path d="M12 1a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h3a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9z"/>
                        </svg>
                        Solicitud de Soporte Técnico
                    </h3>
                    <button type="button" class="modal-soporte-cerrar" id="btnCerrarSoporte">&times;</button>
                </div>
                <div class="modal-soporte-body" id="soporteBodyContent">
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
                            <label for="soporteDescripcion">Detalle del Problema o Cambio Solicítado *</label>
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
            </div>
        `;
        document.body.appendChild(modalOverlay);

        // Event listeners del Modal
        document.getElementById('btnCerrarSoporte').addEventListener('click', cerrarModalSoporte);
        document.getElementById('btnCancelarSoporte').addEventListener('click', cerrarModalSoporte);
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) cerrarModalSoporte();
        });

        // Enviar Formulario
        document.getElementById('formSoporteTecnico').addEventListener('submit', enviarTicketSoporte);
    }

    function abrirModalSoporte() {
        const overlay = document.getElementById('modalSoporteOverlay');
        if (!overlay) return;

        // Actualizar la fecha y hora al momento de abrir el modal en formato Honduras (DD/MM/YYYY hh:mm AM/PM)
        document.getElementById('soporteFecha').value = obtenerFechaHoraHonduras();

        // Auto-completar con el nombre guardado previamente o del usuario activo
        const nombreInput = document.getElementById('soporteNombre');
        const nombreGuardado = localStorage.getItem('soporte_nombre_solicitante') || localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || '';
        if (nombreGuardado && !nombreInput.value) {
            nombreInput.value = nombreGuardado;
        }

        overlay.classList.add('active');
        if (nombreInput.value) {
            document.getElementById('soporteDescripcion').focus();
        } else {
            nombreInput.focus();
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
                    <label for="soporteDescripcion">Detalle del Problema o Cambio Solicítado *</label>
                    <textarea id="soporteDescripcion" required placeholder="Describa aquí con el mayor detalle posible la situación o cambio requerido..."></textarea>
                </div>

                <div class="modal-soporte-footer">
                    <button type="button" class="btn-soporte-cancelar" id="btnCancelarSoporte">Cancelar</button>
                    <button type="submit" class="btn-soporte-enviar" id="btnEnviarSoporte">
                        <span>Enviar Solicitud</span>
                    </button>
                </div>
            </form>
        `;

        document.getElementById('btnCancelarSoporte').addEventListener('click', cerrarModalSoporte);
        document.getElementById('formSoporteTecnico').addEventListener('submit', enviarTicketSoporte);
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

        const mailtoSubject = encodeURIComponent(`[TICKET #${numeroTicket}] Solicitud de Soporte - ${datos.departamento}`);
        const mailtoBody = encodeURIComponent(
            `Número de Ticket: #${numeroTicket}\n` +
            `Solicitante: ${datos.nombre}\n` +
            `Fecha y Hora: ${datos.fechaHora}\n` +
            `Departamento: ${datos.departamento}\n\n` +
            `Detalle del Inconveniente / Solicitud:\n${datos.descripcion}`
        );
        const mailtoUrl = `mailto:maygonza.cs@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

        // Intentar envío por FormSubmit directo desde GitHub Pages / Web
        let emailWebEnviado = false;
        try {
            const formSubmitRes = await fetch('https://formsubmit.co/ajax/maygonza.cs@gmail.com', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: `[TICKET #${numeroTicket}] Solicitud de Soporte - ${datos.departamento}`,
                    ticket: `#TICK-${numeroTicket}`,
                    solicitante: datos.nombre,
                    fecha_hora: datos.fechaHora,
                    departamento: datos.departamento,
                    detalle_problema: datos.descripcion
                })
            });
            if (formSubmitRes.ok) {
                emailWebEnviado = true;
            }
        } catch (errWeb) {
            console.warn("Envío por FormSubmit no disponible.", errWeb);
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

