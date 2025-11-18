# 🔧 Solución: Google Sheets API no aparece en restricciones

## 🚨 Problema
"No aparece Google Sheets API en las restricciones de API"

## ✅ **Solución Paso a Paso**

### **Opción 1: Configuración Correcta (Más Común)**

1. **Habilita la API primero** (MUY IMPORTANTE):
   - Ve a "APIs y servicios" → "Biblioteca"
   - Busca "Google Sheets API"
   - Clic en "Habilitar" (si no está habilitado)

2. **Espera unos minutos** y luego:
   - Ve a "APIs y servicios" → "Credenciales"
   - Edita tu API key existente
   - Ahora debería aparecer "Google Sheets API" en la lista

### **Opción 2: Sin Restricciones (Temporal)**

Si aún no aparece, configura sin restricciones por ahora:

1. **Crear API Key sin restricciones**:
   - "Crear credenciales" → "Clave de API"
   - **NO** configurar restricciones inmediatamente
   - Copia la API key

2. **Probar la conexión primero**:
   - Usa la API key sin restricciones
   - Si funciona, luego agregamos restricciones

### **Opción 3: Verificación Manual**

Para confirmar que la API está habilitada:

1. Ve a "APIs y servicios" → "APIs habilitadas"
2. Busca "Google Sheets API" en la lista
3. Si no está ahí, clic en "+ HABILITAR API"

## 🔑 **Configuración de la API Key**

### **Sin Restricciones (Para Pruebas):**
```javascript
const SHEETS_CONFIG = {
    spreadsheetId: 'TU_SPREADSHEET_ID',
    sheetName: 'Formación',
    options: {
        useSampleData: false,
        apiKey: 'TU_API_KEY_SIN_RESTRICCIONES'  // Funciona inmediatamente
    }
};
```

### **Con Restricciones (Después):**
```javascript
const SHEETS_CONFIG = {
    spreadsheetId: 'TU_SPREADSHEET_ID',
    sheetName: 'Formación',
    options: {
        useSampleData: false,
        apiKey: 'TU_API_KEY_CON_RESTRICCIONES',
        restrictions: {
            // Solo Google Sheets API
            allowedApis: ['Google Sheets API'],
            // Solo ciertos dominios (opcional)
            allowedDomains: ['tu-dominio.com']
        }
    }
};
```

## 📋 **Verificación Rápida**

Para probar si tu API key funciona:

1. **Abre tu navegador**
2. **Ve a esta URL** (reemplaza con tus datos):
   ```
   https://sheets.googleapis.com/v4/spreadsheets/TU_SPREADSHEET_ID/values/Formación?key=TU_API_KEY
   ```

3. **Si funciona**: Verás un JSON con datos o error claro
4. **Si no funciona**: Te dará error 403, 404, etc.

## 🚀 **Configuración Inmediata**

**Mientras resuelves las restricciones, configura así:**

1. **Crear API Key sin restricciones**:
   - Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
   - NO configures restricciones
   - Copia la API key

2. **Editar google-sheets-config.js**:
```javascript
const SHEETS_CONFIG = {
    spreadsheetId: 'TU_SPREADSHEET_ID_AQUI',
    sheetName: 'Formación',
    options: {
        useSampleData: false,
        apiKey: 'COPIAR_API_KEY_AQUI'  // Sin restricciones por ahora
    }
};
```

3. **Probar inmediatamente**:
   - Sube archivos
   - Visita tu sitio
   - Debería cargar datos

## ⚠️ **Importante: Configuración de Permisos del Sheet**

**Independiente del problema de API, asegúrate de esto:**

1. **Abre tu Google Sheet**
2. **Clic en "Compartir"**
3. **Selecciona "Cualquier persona con el enlace puede ver"**
4. **Clic en "Cambiar a cualquier persona con el enlace"**

## 🆘 **Si Aún No Funciona**

### **Verificación de Estado:**

1. **API habilitada**: ✅ Debe estar en "APIs habilitadas"
2. **Sheet compartido**: ✅ "Cualquier persona puede ver"
3. **Spreadsheet ID correcto**: ✅ En la URL del sheet
4. **API key sin restricciones**: ✅ Para pruebas

### **Error Comunes:**

- **Error 403**: Sheet no compartido o API no habilitada
- **Error 404**: Spreadsheet ID incorrecto
- **Error 400**: Formato de URL incorrecto

## 🎯 **Siguiente Paso**

1. **Crea API key sin restricciones**
2. **Prueba la conexión**
3. **Si funciona, configura las restricciones después**

¿Te ayuda esta solución? ¿Qué paso específico necesitas que amplíe?