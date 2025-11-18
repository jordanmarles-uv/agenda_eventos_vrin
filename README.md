# Sistema de Agenda - Vicerrectoría de Investigaciones

## 📋 Descripción

Sistema de agenda digital para mostrar eventos de formación, talleres y diplomados de la Vicerrectoría de Investigaciones. Conectividad automática con Google Sheets para actualización en tiempo real.

## 🎨 Características

### Funcionalidades Principales
- **Vista de Calendario**: Navegación mensual con eventos marcados
- **Vista de Lista**: Tarjetas de eventos con información detallada
- **Filtros Avanzados**: Por área, tipo de actividad y mes
- **Conectividad Google Sheets**: Actualización automática de datos
- **Diseño Responsivo**: Optimizado para móvil, tablet y escritorio
- **Colores de Marca**: Usa los colores específicos (#E81C25, #808285, #224e95)

### Áreas de Gestión
- **Gestión de la Investigación** (Luz Piedad, Cristina y Ana Jaramillo)
- **Transferencia de Resultados de Investigación** (Antonio Ramírez)
- **Sistema Institucional Integrado de Laboratorios** (Sin eventos aún)
- **Programa Editorial** (Sin eventos aún)
- **Dirección de Relaciones Internacionales** (Sonia Jiménez)

### Tipos de Actividades
- Cursos
- Talleres
- Diplomados
- Conferencias
- Socializaciones

## 🚀 Instalación y Configuración

### Prerequisitos
- Un Google Sheet con los datos de eventos
- Google Cloud Project con Sheets API habilitada

### 1. Configurar Google Sheets API

#### Paso 1: Crear Proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la "Google Sheets API"

#### Paso 2: Crear Credenciales

**Opción A: API Key (Más Simple)**
1. Ve a "Credenciales" en el menú lateral
2. Clic en "Crear credenciales" → "Clave de API"
3. Copia la API key generada
4. Ve a "Restricciones de API" y selecciona "Google Sheets API"

**Opción B: Service Account (Más Seguro)**
1. Ve a "Credenciales" en el menú lateral
2. Clic en "Crear credenciales" → "Cuenta de servicio"
3. Completa los datos y descarga el archivo JSON
4. Ve al Google Sheet y comparte con el email del service account

#### Paso 3: Configurar Permisos del Sheet
1. Abre tu Google Sheet
2. Clic en "Compartir" (esquina superior derecha)
3. Si usas API Key: Selecciona "Cualquier persona con el enlace puede ver"
4. Si usas Service Account: Agrega el email del service account con permisos de "Lectura"

### 2. Estructura del Google Sheet

Crea un Google Sheet con las siguientes columnas (A a L):

| Columna | Campo | Descripción | Ejemplo |
|---------|-------|-------------|---------|
| A | titulo | Título del evento | "Taller de Metodología" |
| B | descripcion | Descripción detallada | "Metodologías avanzadas..." |
| C | fecha | Fecha (YYYY-MM-DD) | "2024-12-15" |
| D | hora | Hora (HH:MM) | "09:00" |
| E | duracion | Duración | "4 horas" |
| F | area | Área responsable | "gestion_investigacion" |
| G | tipo | Tipo de actividad | "taller" |
| H | dirigido_a | Público objetivo | "Investigadores senior" |
| I | imagen | URL de imagen | "https://..." |
| J | enlace | URL de inscripción | "https://..." |
| K | estado | Estado del evento | "disponible" |
| L | responsable | Persona responsable | "Luz Piedad" |

#### Valores Permitidos

**Área (columna F):**
- `gestion_investigacion`
- `transferencia_resultados`
- `laboratorios`
- `editorial`
- `relaciones_internacionales`
- `apropiacion_social`

**Tipo (columna G):**
- `curso`
- `taller`
- `diplomado`
- `conferencia`
- `socializacion`

**Estado (columna K):**
- `disponible` - Inscripciones abiertas
- `cerrado` - Inscripciones cerradas
- `cupos_llenos` - Cupos llenos
- `cancelado` - Evento cancelado

### 3. Configurar el Código

#### Editar `google-sheets-config.js`

```javascript
const SHEETS_CONFIG = {
    spreadsheetId: 'TU_SPREADSHEET_ID_AQUI',  // Reemplaza con tu ID
    sheetName: 'Formación',                    // Nombre de tu hoja
    options: {
        useSampleData: false,                  // Cambiar a false para usar datos reales
        // Si usas API Key:
        apiKey: 'TU_API_KEY_AQUI',
        // O si usas Service Account:
        serviceAccount: {
            client_email: 'tu-service@proyecto.iam.gserviceaccount.com',
            private_key: '-----BEGIN PRIVATE KEY-----\\nTU_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n'
        }
    }
};
```

#### Obtener el Spreadsheet ID
De la URL de tu Google Sheet:
```
https://docs.google.com/spreadsheets/d/TU_SPREADSHEET_ID/edit
```

### 4. Instalar y Usar

1. **Subir archivos al servidor**: Copia todos los archivos a tu servidor web
2. **Configurar credenciales**: Edita `google-sheets-config.js` con tus datos
3. **Cambiar a datos reales**: Cambia `useSampleData` a `false`
4. **Probar**: Visita tu sitio web

## 📊 Datos de Ejemplo

El sistema incluye datos de ejemplo para pruebas. Para desactivarlos:

1. Edita `google-sheets-config.js`
2. Cambia `useSampleData: false`
3. Configura tus credenciales de Google Sheets

## 🎨 Personalización

### Colores de Marca
El sistema usa exclusivamente estos tres colores:
- **Primario**: `#224e95` - Para botones, enlaces y elementos activos
- **Secundario**: `#808285` - Para texto secundario y elementos neutros  
- **Acento**: `#E81C25` - Para estados de alta prioridad (cupos llenos, cancelado)

### Añadir Nuevas Áreas
Para añadir nuevas áreas de gestión:

1. **Actualizar HTML** (`index.html`):
   ```html
   <button class="pill-btn" data-filter="nueva_area">Nueva Área</button>
   ```

2. **Actualizar JavaScript** (`app.js`):
   ```javascript
   const areaNames = {
       'nueva_area': 'Nombre de la Nueva Área'
   };
   ```

3. **Actualizar configuración** (`google-sheets-config.js`):
   ```javascript
   'nueva_area': 'nueva_area'
   ```

## 🔧 Mantenimiento

### Responsabilidades de Actualización

- **Monitor Vicerrectoría**: Gestión de proyectos y ética
- **Áreas respectivas**: Sus actividades de formación
- **Comunicaciones**: Integración visual y presentación

### Proceso de Actualización

1. **Agregar/Editar eventos** en el Google Sheet
2. **Los cambios se reflejan automáticamente** en el sitio web
3. **No requiere reinicio del servidor**

## 🚨 Solución de Problemas

### Error de Conexión
- Verificar permisos del Google Sheet
- Confirmar que la API Key es correcta
- Verificar que la Sheets API está habilitada

### Datos No Se Cargan
- Verificar estructura de columnas en el sheet
- Confirmar que hay datos en las filas (no solo headers)
- Revisar formato de fechas (YYYY-MM-DD)

### Imágenes No Aparecen
- Verificar que las URLs de imágenes sean válidas
- Confirmar que las imágenes sean públicamente accesibles
- Las imágenes de Google Drive necesitan configuración especial

### Diseño No Se Ve Correcto
- Verificar que los archivos CSS y JS se cargan
- Confirmar la conexión a internet para Google Fonts
- Revisar que no hay errores en la consola del navegador

## 📱 Compatibilidad

- **Navegadores**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Dispositivos**: Móvil, tablet, escritorio
- **Resoluciones**: Desde 320px hasta pantallas grandes

## 📝 Licencia

Sistema desarrollado para la Vicerrectoría de Investigaciones.
Configuración y uso libre según necesidades institucionales.

## 🆘 Soporte

Para soporte técnico o preguntas de configuración:
- Revisar esta documentación
- Verificar logs de consola del navegador
- Confirmar configuración de Google Sheets API

---

**Nota**: Este sistema está diseñado para ser escalable y fácil de mantener. La conectividad con Google Sheets permite actualizaciones sin necesidad de modificar código.