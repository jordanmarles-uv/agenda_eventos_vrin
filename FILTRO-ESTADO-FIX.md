# 🔧 Fix Completo: Filtro de Estado

## 📋 **Problema Reportado**

Eventos sin estado en Google Sheets (como "Curso Escritura efectiva de artículos científicos") **NO se estaban filtrando como CERRADA** aunque la lógica indicaba que deberían serlo.

## 🔍 **Diagnóstico**

Se encontraron **DOS lugares** donde se asignaba `'disponible'` por defecto a eventos sin estado:

### **1. En `google-sheets-config.js` - Línea 168:**
```javascript
// ❌ ANTES (INCORRECTO)
estado: normalizeStatus(getColumnValue(row, columnMapping.estado)) || 'disponible',
```

### **2. En `google-sheets-config.js` - Función `normalizeStatus` - Línea 503:**
```javascript
// ❌ ANTES (INCORRECTO)
function normalizeStatus(estado) {
    if (!estado) return 'disponible';  // ← Problema aquí
    // ...
}
```

**Resultado:** Eventos sin estado en Google Sheets → se convertían en `'disponible'` → el filtro los mostraba como ABIERTA ❌

---

## ✅ **Solución Implementada**

### **Cambios Realizados:**

#### **1. `google-sheets-config.js` - Línea 168:**
```javascript
// ✅ DESPUÉS (CORRECTO)
estado: getColumnValue(row, columnMapping.estado) || '',
```
- **Cambio:** Ya no normaliza ni asigna `'disponible'` como fallback
- **Resultado:** Si el campo está vacío en el sheet → queda como cadena vacía `''`

#### **2. `google-sheets-config.js` - Función `normalizeStatus`:**
```javascript
// ✅ DESPUÉS (CORRECTO)
function normalizeStatus(estado) {
    // Si no hay estado, devolver vacío para que getEventStatus lo maneje como 'cerrada'
    if (!estado || estado.trim() === '') return '';
    
    const statusMap = {
        'disponible': 'disponible',
        'abierto': 'disponible',
        'abierta': 'disponible',
        // ... resto del mapeo
    };
    
    const normalized = estado.toLowerCase().trim();
    return statusMap[normalized] || normalized.replace(/\s+/g, '_');
}
```
- **Cambio:** Devuelve cadena vacía `''` en vez de `'disponible'`
- **Resultado:** Eventos sin estado → `''` (vacío)

#### **3. `app.js` - Función `getEventStatus` (ya corregida anteriormente):**
```javascript
// ✅ CORRECTO
function getEventStatus(event) {
    // Si no tiene estado, se considera CERRADA
    if (!event.estado || event.estado.trim() === '') return 'cerrada';
    
    const estado = event.estado.toLowerCase().trim();
    
    if (estado.includes('cerrad')) return 'cerrada';
    if (estado.includes('abierta') || estado.includes('disponible') || estado.includes('abierto')) return 'abierta';
    if (estado.includes('cupos') || estado.includes('lleno') || estado.includes('cancelad')) return 'cerrada';
    
    return 'cerrada';
}
```
- **Resultado:** Eventos con `estado = ''` → retorna `'cerrada'` ✅

---

## 🔄 **Flujo Completo (Ahora Correcto)**

### **Evento SIN estado en Google Sheets:**
```
Google Sheets
    ↓
    Estado: (vacío)
    ↓
google-sheets-config.js: processSheetData()
    ↓
    estado: '' (cadena vacía, no 'disponible')
    ↓
app.js: getEventStatus()
    ↓
    Evalúa: if (!event.estado || event.estado.trim() === '') return 'cerrada';
    ↓
    Retorna: 'cerrada' ✅
    ↓
app.js: applyFilters()
    ↓
    Filtro = 'abierta'
    ↓
    eventStatus ('cerrada') !== 'abierta' → EXCLUIDO ✅
```

### **Resultado:**
- ✅ Eventos sin estado → **NO se muestran** cuando el filtro está en "Abierta" (default)
- ✅ Eventos sin estado → **SÍ se muestran** cuando el filtro está en "Cerrada"
- ✅ Eventos sin estado → **SÍ se muestran** cuando el filtro está en "Todos"

---

## 📊 **Casos de Prueba**

| Evento en Google Sheets | Estado en Sheet | Estado procesado | getEventStatus() | Filtro "Abierta" | Filtro "Cerrada" |
|-------------------------|-----------------|------------------|------------------|------------------|------------------|
| Curso Escritura... | (vacío) | `''` | `'cerrada'` | ❌ OCULTO | ✅ VISIBLE |
| Taller Ética | "abierta" | `'abierta'` | `'abierta'` | ✅ VISIBLE | ❌ OCULTO |
| Conferencia ABC | "disponible" | `'disponible'` | `'abierta'` | ✅ VISIBLE | ❌ OCULTO |
| Diplomado XYZ | "cerrada" | `'cerrada'` | `'cerrada'` | ❌ OCULTO | ✅ VISIBLE |
| Seminario 123 | "cupos llenos" | `'cupos_llenos'` | `'cerrada'` | ❌ OCULTO | ✅ VISIBLE |

---

## 🎯 **Resumen de Archivos Modificados**

| Archivo | Líneas | Cambio |
|---------|--------|--------|
| `google-sheets-config.js` | 168 | Remover normalización y fallback `'disponible'` |
| `google-sheets-config.js` | 483-507 | `normalizeStatus()` devuelve `''` si no hay estado |
| `app.js` | 262-279 | `getEventStatus()` retorna `'cerrada'` si estado vacío |
| `app.js` | 764-771 | `applyFilters()` usa `getEventStatus()` consistentemente |

---

## 📤 **Para Subir a GitHub**

```bash
# Agregar cambios
git add google-sheets-config.js
git add app.js
git add test-filtro-estado.html
git add FILTRO-ESTADO-FIX.md

# Commit
git commit -m "Fix: Eventos sin estado ahora se filtran correctamente como CERRADA"

# Push
git push origin main
```

---

## ✅ **Verificación**

Para verificar que funciona:

1. **Abrir** `test-filtro-estado.html` en el navegador
2. **Verificar** que todos los tests pasen ✅
3. **Abrir** la aplicación principal
4. **Seleccionar** filtro "Abierta" (default)
5. **Confirmar** que eventos sin estado NO aparecen
6. **Cambiar** filtro a "Cerrada"
7. **Confirmar** que eventos sin estado SÍ aparecen

---

**Fecha:** 2025-12-03  
**Issue resuelto:** Eventos sin estado se filtraban incorrectamente como ABIERTA  
**Solución:** Remover asignación por defecto de 'disponible' en carga de datos
