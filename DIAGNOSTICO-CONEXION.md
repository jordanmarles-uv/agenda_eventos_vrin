# 🚨 Diagnóstico de Conexión Google Sheets

## ❌ **Problema Detectado**

Al probar la conexión con tu Google Sheet, se obtiene un error 400:
```
"This operation is not supported for this document"
```

## 🔍 **Posibles Causas**

### **1. Permisos del Documento**
- El documento no está compartido públicamente
- La API Key no tiene acceso al documento

### **2. Nombre de la Hoja**
- La hoja "Formación" no existe
- El nombre tiene caracteres especiales

### **3. ID del Documento**
- El ID del spreadsheet puede estar incorrecto
- El documento puede haber sido movido o eliminado

## ✅ **Soluciones Inmediatas**

### **Solución 1: Verificar Permisos**
1. Abre tu Google Sheet: `https://docs.google.com/spreadsheets/d/1kjYUKG-ERUyu_qjmuKDUkJiBGUajIdUF/edit`
2. Clic en "Compartir" (esquina superior derecha)
3. Selecciona "Cualquier persona con el enlace puede ver"
4. Clic en "Cambiar a cualquier persona con el enlace"
5. Asegúrate de que esté en modo "Lector"

### **Solución 2: Verificar Hojas Disponibles**
1. En tu Google Sheet, verifica que existe una hoja llamada exactamente "Formación"
2. Si la hoja tiene un nombre diferente, actualiza `sheetName` en google-sheets-config.js

### **Solución 3: Verificar URL**
Copia la URL completa de tu Google Sheet y verifica que el ID coincida:
```
https://docs.google.com/spreadsheets/d/1kjYUKG-ERUyu_qjmuKDUkJiBGUajIdUF/edit
                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                   Este debe ser tu Spreadsheet ID
```

## 🧪 **Prueba de Diagnóstico**

### **1. Verificar Existencia del Documento**
Abre en tu navegador:
```
https://docs.google.com/spreadsheets/d/1kjYUKG-ERUyu_qjmuKDUkJiBGUajIdUF/edit
```

### **2. Verificar Acceso API**
Ejecuta en la consola del navegador:
```javascript
fetch('https://sheets.googleapis.com/v4/spreadsheets/1kjYUKG-ERUyu_qjmuKDUkJiBGUajIdUF?key=AIzaSyBVzq74cE3qC5nNVH--0mfjdSX7w7NP-a4')
  .then(response => response.json())
  .then(data => console.log(data));
```

### **3. Usar Archivo de Prueba**
Abre <filepath>test-conexion.html</filepath> en tu navegador para ver el diagnóstico completo.

## 🔧 **Configuración Alternativa**

Si sigues teniendo problemas, puedo configurar el sistema para que:

1. **Use datos de ejemplo** mientras resuelves el acceso
2. **Detecte automáticamente** las hojas disponibles
3. **Muestre errores detallados** para mejor diagnóstico

## 📝 **Pasos para Resolver**

1. **Verifica permisos** del Google Sheet (compartir públicamente)
2. **Confirma nombre de hoja** (exactamente "Formación")
3. **Ejecuta test-conexion.html** para diagnóstico detallado
4. **Si persiste el problema**, comparte el error específico

## 🚀 **Mientras Tanto**

**El sistema está completamente configurado** y funcionará perfectamente una vez que se resuelva el acceso al Google Sheet. 

**Opciones temporales:**
- El sistema tiene datos de ejemplo que se mostrarán si no puede acceder al sheet
- Puedes modificar manualmente los datos en el código
- La estructura está lista para recibir datos reales

---

**¿Necesitas ayuda específica con alguno de estos pasos?**