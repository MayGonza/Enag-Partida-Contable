/**
 * Configuración central de Firebase — Sistema de Gestión ENAG
 */
const firebaseConfig = {
  apiKey: "AIzaSyCzDQbGHBoykkfSDmKqNCtpoirE4rQQ5t8",
  authDomain: "sistemagestionenag.firebaseapp.com",
  projectId: "sistemagestionenag",
  storageBucket: "sistemagestionenag.firebasestorage.app",
  messagingSenderId: "804075465369",
  appId: "1:804075465369:web:17bee170c2550e363ce608",
  measurementId: "G-QM1XTBPWHP"
};

// Inicializar Firebase
let firebaseApp = null;
let dbFirestore = null;

if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps || !firebase.apps.length) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.app();
    }
    dbFirestore = firebase.firestore();
    console.log("🔥 Firebase Firestore conectado a:", firebaseConfig.projectId);
  } catch (e) {
    console.warn("⚠️ No se pudo inicializar Firebase:", e);
  }
}


// Función global para la Bitácora de Auditoría
window.registrarBitacora = async function(modulo, accion, detalles) {
    if (typeof firebase === 'undefined' || !dbFirestore) return;
    try {
        const currentUser = firebase.auth().currentUser;
        let usuarioSino = "Sistema / Desconocido";
        if (currentUser) {
            try {
                const uDoc = await dbFirestore.collection('usuarios').doc(currentUser.uid).get();
                if(uDoc.exists) { usuarioSino = uDoc.data().usuario || currentUser.email; } else { usuarioSino = currentUser.email || 'Desconocido'; }
            } catch(e) { usuarioSino = currentUser.email; }
        }
        await dbFirestore.collection('bitacora_global').add({
            modulo: modulo,
            accion: accion,
            detalles: detalles,
            usuario: usuarioSino,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch(e) { console.error("Error al registrar en bitácora", e); }
};


// Variables para control de sesión única
let sessionUnsubscribe = null;

// Sincronizar nombre de usuario globalmente y controlar sesión única
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user && dbFirestore) {
            // Control de Sesión Única
            if (sessionUnsubscribe) sessionUnsubscribe();
            
            sessionUnsubscribe = dbFirestore.collection('usuarios').doc(user.uid)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const dbSessionId = doc.data().session_id;
                        const currentLocalSessionId = localStorage.getItem('enag_session_id');
                        // Si hay un session_id en Firestore y no coincide con el local
                        if (dbSessionId && currentLocalSessionId && dbSessionId !== currentLocalSessionId) {
                            if (window.enag_session_prompt_active) return;
                            window.enag_session_prompt_active = true;
                            
                            const mantener = confirm("Se ha iniciado sesión con tu cuenta en otro lugar.\n\n¿Deseas mantener tu sesión iniciada en ESTE dispositivo?\n\n- [Aceptar]: Mantener sesión aquí (cerrará la del otro lado).\n- [Cancelar]: Cerrar sesión en este dispositivo.");
                            
                            if (mantener) {
                                // Recuperar la sesión para este dispositivo
                                dbFirestore.collection('usuarios').doc(user.uid).set({
                                    session_id: localSessionId,
                                    ultimoAcceso: firebase.firestore.FieldValue.serverTimestamp()
                                }, { merge: true }).then(() => {
                                    window.enag_session_prompt_active = false;
                                }).catch(() => {
                                    window.enag_session_prompt_active = false;
                                });
                            } else {
                                // Ceder la sesión al otro dispositivo
                                firebase.auth().signOut().then(() => {
                                    window.enag_session_prompt_active = false;
                                    localStorage.removeItem('enag_session_id');
                                    const path = window.location.pathname;
                                    if (path.includes('/views/')) {
                                        window.location.href = 'login.html';
                                    } else {
                                        window.location.href = 'views/login.html';
                                    }
                                });
                            }
                        }
                    }
                });

            // Guardar nombre de usuario local
            try {
                const uDoc = await dbFirestore.collection('usuarios').doc(user.uid).get();
                if (uDoc.exists) {
                    localStorage.setItem('enag_username', uDoc.data().usuario || user.email);
                } else {
                    localStorage.setItem('enag_username', user.email);
                }
            } catch(e) {
                localStorage.setItem('enag_username', user.email);
            }
        } else if (!user) {
            localStorage.removeItem('enag_username');
            localStorage.removeItem('enag_session_id');
            if (sessionUnsubscribe) {
                sessionUnsubscribe();
                sessionUnsubscribe = null;
            }
        }
    });
}

// =========================================================
// Control de Inactividad (5 minutos)
// =========================================================
let inactividadTimer;
const TIEMPO_INACTIVIDAD = 5 * 60 * 1000; // 5 minutos en milisegundos

function resetInactividad() {
    clearTimeout(inactividadTimer);
    inactividadTimer = setTimeout(() => {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            alert("Tu sesión ha expirado por inactividad prolongada (5 minutos). Por favor, vuelve a iniciar sesión.");
            firebase.auth().signOut().then(() => {
                localStorage.removeItem('enag_session_id');
                const path = window.location.pathname;
                if (path.includes('/views/')) {
                    window.location.href = 'login.html';
                } else {
                    window.location.href = 'views/login.html';
                }
            });
        }
    }, TIEMPO_INACTIVIDAD);
}

// Escuchar eventos para resetear el temporizador si el usuario interactúa con la pantalla
window.addEventListener('mousemove', resetInactividad);
window.addEventListener('keydown', resetInactividad);
window.addEventListener('click', resetInactividad);
window.addEventListener('scroll', resetInactividad);

// Iniciar temporizador al cargar la página
resetInactividad();

