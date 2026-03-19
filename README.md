# Sistema de Agenda - Vicerrectoría de Investigaciones (VRIN)

## 📋 Descripción
Plataforma digital para la gestión y visualización de eventos académicos de la Vicerrectoría de Investigaciones de la Universidad del Valle. El sistema utiliza **Firebase** como motor principal.

---

## 🎨 Características Principales

### Para el Usuario (Vista Pública)
- **Calendario Interactivo**: Visualización mensual de eventos con FullCalendar 6.
- **Filtros Avanzados**: Búsqueda por Tipo, Modalidad, Temática y Unidad de Gestión.
- **Diseño Responsivo**: Totalmente compatible con móviles y tablets.

### Para Administradores (Panel Admin)
- **Portal Dedicado (`admin.html`)**: Gestión completa de eventos sin código.
- **Roles de Usuario**: Superadmin, Publicador y Editor con diferentes niveles de acceso.
- **Cloudinary Integration**: Subida de imágenes optimizada y gestión de assets.
- **Estados de Gestión**: Control de borradores (Estructuración), eventos publicados y archivados.

---

## 🛠️ Configuración Técnica

### 1. Firebase (Firestore + Auth)
Configura tus credenciales en `firebase-config.js`. Es necesario habilitar:
- **Email/Password Auth** en la consola de Firebase.
- **Cloud Firestore** para la base de datos de eventos.

### 2. Cloudinary
Configura el almacenamiento de imágenes en `firebase-config.js`:
```javascript
const CLOUDINARY_CLOUD_NAME = 'tu_cloud_name';
const CLOUDINARY_UPLOAD_PRESET = 'tu_preset';
```

---

## 🚀 Ejecución y Mantenimiento
- **Local**: Puedes usar `iniciar-servidor.bat` para pruebas locales.
- **Actualización**: Todos los cambios en el panel de administración se reflejan en tiempo real en la agenda pública.

---

## 📝 Soporte
Sistema desarrollado para la **Vicerrectoría de Investigaciones - Universidad del Valle**.