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
