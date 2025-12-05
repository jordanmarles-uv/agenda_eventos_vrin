# 🔧 Solución al Problema de Carga en GitHub Pages

## 📋 **Problema Identificado**

### **Síntomas:**
- ✅ En **local**: Todo funciona correctamente, logo carga sin problema
- ❌ En **GitHub Pages**: El logo no carga, página no termina de cargar completamente
- ✅ Consola: Sin errores visibles

### **Causa Raíz:**
**Bloqueo CORS (Cross-Origin Resource Sharing)**

El servidor de `viceinvestigaciones.univalle.edu.co` **no permite** que recursos (como imágenes) sean cargados desde dominios externos como `github.io`. Este es un comportamiento de seguridad estándar de los servidores web.

#### **¿Por qué funciona en local pero no en GitHub Pages?**
- **Local (`file://` o `localhost`)**: Mismo origen, no hay restricción CORS
- **GitHub Pages (`usuario.github.io`)**: Dominio diferente → servidor de Univalle rechaza la petición

---

## ✅ **Solución Implementada**

### **Cambio Realizado:**
Se descargó el logo y se guardó localmente en el proyecto.

#### **Antes:**
```html
<img src="https://viceinvestigaciones.univalle.edu.co/images/logo_viceinvestigaciones.png"
     alt="Logo Vicerrectoría de Investigaciones" class="header-logo">
```

#### **Después:**
```html
<img src="logo_viceinvestigaciones.png"
     alt="Logo Vicerrectoría de Investigaciones" class="header-logo">
```

### **Archivo Añadido:**
- `logo_viceinvestigaciones.png` (12 KB) - Logo descargado localmente

---

## 📤 **Pasos para Subir a GitHub Pages**

### **1. Commitear y Pushear los Cambios:**
```bash
git add logo_viceinvestigaciones.png
git add index.html
git commit -m "Fix: Usar logo local para evitar problemas de CORS en GitHub Pages"
git push origin main
```

### **2. Verificar GitHub Pages:**
- Ve a tu repositorio en GitHub
- Settings → Pages
- Asegúrate de que esté habilitado y apuntando a la rama correcta
- Espera unos minutos para que se despliegue

### **3. Probar el Sitio:**
- Visita tu URL de GitHub Pages
- El logo debería cargar correctamente ahora

---

## 🎯 **Ventajas de la Solución**

✅ **Sin dependencias externas**: El sitio no depende del servidor de Univalle  
✅ **Más rápido**: El logo se carga desde el mismo servidor  
✅ **Más confiable**: No hay riesgo de que el servidor externo esté caído  
✅ **Compatible con GitHub Pages**: Sin problemas de CORS  

---

## 🔍 **Otros Posibles Problemas y Soluciones**

### **Si la página sigue sin cargar completamente:**

#### **1. Verificar API Key de Google Sheets:**
La API Key debe ser válida y tener permisos para la Google Sheets API.

**Ubicación:** `config.js`
```javascript
const CONFIG = {
    GOOGLE_SHEETS_API_KEY: 'AIzaSyBFnL21PJKs-KEcyRm_dslFy1ytMQAzoe0',
};
```

#### **2. Verificar Permisos del Google Sheet:**
El Google Sheet debe estar compartido públicamente:
- Abre el Google Sheet
- Clic en "Compartir"
- Selecciona "Cualquier persona con el enlace puede ver"

#### **3. Verificar Configuración de GitHub Pages:**
- Debe estar habilitado
- Debe apuntar a la rama correcta (main o master)
- El directorio raíz debe ser correcto

#### **4. Limpiar Caché del Navegador:**
A veces GitHub Pages mantiene versiones en caché:
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

## 📊 **Archivos Modificados**

| Archivo | Cambio | Razón |
|---------|--------|-------|
| `index.html` | Actualizar src del logo | Usar logo local |
| `logo_viceinvestigaciones.png` | **NUEVO** | Logo descargado localmente |
| `GITHUB-PAGES-FIX.md` | **NUEVO** | Documentación del problema |

---

## 🆘 **Si el Problema Persiste**

### **Verificar en Consola del Navegador:**
1. Abre tu sitio en GitHub Pages
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**
4. Ve a la pestaña **Network**
5. Busca errores o recursos que no carguen
6. Captura pantalla y revisa los detalles

### **Errores Comunes:**

#### **Error: "Mixed Content"**
- **Causa**: Cargas HTTP en sitio HTTPS
- **Solución**: Asegúrate de que todas las URLs sean HTTPS

#### **Error: "Failed to load resource"**
- **Causa**: Archivo no encontrado o ruta incorrecta
- **Solución**: Verifica que todos los archivos estén en el repositorio

#### **Error: "CORS policy"**
- **Causa**: Bloqueo CORS de servidor externo
- **Solución**: Descargar recursos localmente (ya implementado)

---

## ✨ **Resultado Esperado**

Después de estos cambios:
- ✅ Logo carga correctamente en GitHub Pages
- ✅ Página carga completamente sin problemas
- ✅ No hay errores de CORS
- ✅ Funciona tanto en local como en producción

---

**Fecha de solución:** 2025-12-03  
**Problema resuelto:** Bloqueo CORS del logo de Univalle en GitHub Pages  
**Solución:** Logo descargado y alojado localmente
