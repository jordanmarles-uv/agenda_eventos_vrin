// ===== FIREBASE CONFIG — Agenda VRIN =====
// Las credenciales son públicas por diseño del SDK web de Firebase.
// La seguridad real está en las reglas de Firestore y Storage.

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDW0y4iX2U2MbPFcp3p9C3rNWwFnTzbtVU",
    authDomain: "agenda-1-478218.firebaseapp.com",
    projectId: "agenda-1-478218",
    storageBucket: "agenda-1-478218.firebasestorage.app",
    messagingSenderId: "502263757142",
    appId: "1:502263757142:web:0bd0399468fecea445fef7"
};

// Inicializar Firebase
firebase.initializeApp(FIREBASE_CONFIG);

// Servicios globales disponibles en todos los archivos
const db = firebase.firestore();
const auth = firebase.auth();
// Storage no se usa (imágenes en Cloudinary)

// Roles y restricciones
const SUPERADMIN_EMAIL = 'jordan.marles@correounivalle.edu.co';
const ALLOWED_DOMAIN = 'correounivalle.edu.co';

// ===== CLOUDINARY CONFIG (almacenamiento de imágenes gratuito) =====
// Reemplaza estos valores con los tuyos de cloudinary.com
// Cloud Name: aparece en el dashboard principal de Cloudinary
// Upload Preset: Settings → Upload → Add upload preset → Unsigned
const CLOUDINARY_CLOUD_NAME = 'dzpotrbsp';
const CLOUDINARY_UPLOAD_PRESET = 'agenda_vrin';
