/**
 * Módulo de Barra de Navegación Superior Unificada — Sistema ENAG
 * Inyecta estilos responsivos, renderiza la fecha oficial en español y muestra
 * en tiempo real el usuario conectado con indicador de estado activo.
 */

(function () {
    // 1. Inyectar estilos globales de la barra superior si no existen
    if (!document.getElementById('enag-top-navbar-styles')) {
        const style = document.createElement('style');
        style.id = 'enag-top-navbar-styles';
        style.textContent = `
            @media print {
                .top-navbar, .portal-badge, .portal-user-badge, .portal-date-badge, .nav-container {
                    display: none !important;
                }
            }
            .top-navbar {
                max-width: 1350px;
                margin: 0 auto 20px auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 15px;
                padding: 0 4px;
            }
            .nav-left-group {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
            }
            .nav-right-group {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
            }
            .btn-nav {
                text-decoration: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 0.88em;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                border: none;
                transition: all 0.25s ease;
                font-family: inherit;
            }
            .btn-nav-back {
                background-color: #475569;
                color: white !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
            }
            .btn-nav-back:hover {
                background-color: #334155;
                transform: translateY(-1px);
                color: white !important;
            }
            .portal-badge {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                color: white !important;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 0.84em;
                font-weight: 600;
                letter-spacing: 0.5px;
                border: 1px solid rgba(255, 255, 255, 0.25);
                display: inline-flex;
                align-items: center;
                gap: 7px;
                white-space: nowrap;
            }
            .portal-user-badge {
                background: rgba(255, 255, 255, 0.12);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                color: white !important;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 0.84em;
                font-weight: 600;
                border: 1px solid rgba(255, 255, 255, 0.22);
                display: inline-flex;
                align-items: center;
                gap: 8px;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
            .user-status-dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                background-color: #10b981;
                border-radius: 50%;
                box-shadow: 0 0 6px #10b981;
                animation: pulseStatusEnag 2s infinite ease-in-out;
            }
            @keyframes pulseStatusEnag {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.9); }
            }
            .portal-date-badge {
                color: rgba(255, 255, 255, 0.9);
                font-size: 0.88em;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                white-space: nowrap;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
            }
            @media (max-width: 768px) {
                .top-navbar {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 10px;
                }
                .nav-left-group, .nav-right-group {
                    justify-content: space-between;
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Renderizar Fecha en Español de Honduras
    function renderizarFechaPortal() {
        const el = document.getElementById('badgeCurrentDate');
        if (el) {
            const hoy = new Date();
            const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            let texto = hoy.toLocaleDateString('es-HN', opciones);
            if (texto) {
                texto = texto.charAt(0).toUpperCase() + texto.slice(1);
            }
            el.textContent = '📅 ' + texto;
        }
    }

    // 3. Renderizar Usuario Conectado
    function renderizarUsuarioPortal() {
        const nameEl = document.getElementById('navUserName');
        if (!nameEl) return;

        // Carga inmediata desde almacenamiento local si existe
        const localNombre = localStorage.getItem('enag_user_nombre');
        const localUsuario = localStorage.getItem('enag_username');
        const localDepto = localStorage.getItem('enag_user_depto');

        if (localNombre && localNombre.trim()) {
            nameEl.textContent = '👤 ' + localNombre.trim();
            if (nameEl.parentElement) {
                nameEl.parentElement.title = (localUsuario || localNombre) + (localDepto ? ' • ' + localDepto : '');
            }
        } else if (localUsuario && localUsuario.trim()) {
            nameEl.textContent = '👤 ' + localUsuario.trim();
        }

        // Sincronización en tiempo real con Firebase Auth y Firestore
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    let displayName = user.displayName;
                    let userDepto = '';

                    // Consultar el documento de usuario para sincronizar rol y permisos de navegación
                    if (typeof dbFirestore !== 'undefined' && dbFirestore) {
                        try {
                            const uDoc = await dbFirestore.collection('usuarios').doc(user.uid).get();
                            if (uDoc.exists) {
                                const data = uDoc.data();
                                displayName = data.nombre || data.usuario || displayName || user.email;
                                userDepto = (data.departamento || '').toLowerCase().trim();
                                const uname = (data.usuario || '').toLowerCase().trim();
                                const email = (user.email || data.correo || '').toLowerCase().trim();

                                if (data.nombre) localStorage.setItem('enag_user_nombre', data.nombre);
                                if (data.usuario) localStorage.setItem('enag_username', data.usuario);
                                if (data.departamento) localStorage.setItem('enag_user_depto', data.departamento);

                                const esSuperAdminTI = (
                                    email === 'maygonza.cs@gmail.com' ||
                                    uname === 'steven.gonzales' ||
                                    user.uid === 'GQKNVr7eh2R2AdoyKwgp8q7Mkhx2'
                                );
                                const esPersonalTI = esSuperAdminTI || userDepto === 'ti';

                                // Si NO es personal de TI, ocultar enlaces a Mesa de Ayuda y Reportes Técnicos TI
                                if (!esPersonalTI) {
                                    document.querySelectorAll('a[href*="mesa_ayuda.html"], a[href*="reporte_tecnico.html"]').forEach(el => {
                                        el.style.display = 'none';
                                    });
                                }

                                // Si es técnico de TI regular (no Super Admin), ocultar enlaces a otros departamentos (ej. Bienes Nacionales, Bitácora, Parámetros)
                                if (esPersonalTI && !esSuperAdminTI) {
                                    document.querySelectorAll('a[href*="bienes_nacionales.html"], a[href*="bitacora.html"], a[href*="parametros.html"]').forEach(el => {
                                        el.style.display = 'none';
                                    });
                                }
                            }
                        } catch (e) {
                            console.warn("Error leyendo perfil de usuario:", e);
                        }
                    }

                    if (!displayName) {
                        displayName = user.email ? user.email.split('@')[0] : 'Usuario Conectado';
                    }

                    nameEl.textContent = '👤 ' + displayName;
                    if (nameEl.parentElement) {
                        nameEl.parentElement.title = `${displayName} (${user.email || ''})${userDepto ? ' • ' + userDepto : ''}`;
                    }
                } else {
                    const publicPages = ['login.html', 'registro.html', 'consulta_bien.html', 'estado_solicitud.html', 'solicitud_personal.html'];
                    const isPublic = publicPages.some(p => window.location.pathname.includes(p));
                    if (!isPublic && (!localNombre && !localUsuario)) {
                        nameEl.textContent = '👤 Invitado';
                    }
                }
            });
        }
    }

    // Inicializar al cargar el DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderizarFechaPortal();
            renderizarUsuarioPortal();
        });
    } else {
        renderizarFechaPortal();
        renderizarUsuarioPortal();
    }

    // Exportar función por si se llama explícitamente tras login
    window.actualizarNavUsuario = renderizarUsuarioPortal;
})();

