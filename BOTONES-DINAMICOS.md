# Implementación de Botones Dinámicos en Modal

## Descripción
Se ha actualizado el sistema para mostrar botones de acción dinámicos en la ventana modal de detalles del evento. Ahora, además del botón de "Inscripción / Más info", se pueden mostrar botones para "Ver Presentación" y "Ver Video" si la información está disponible en el Google Sheet.

## Cambios Realizados

### 1. `google-sheets-config.js`
- Se actualizó la función `detectColumnMapping` para detectar automáticamente las columnas:
  - `Presentación` (o similar) -> mapeado a `presentacion`
  - `Video` (o similar) -> mapeado a `video`
- Se actualizó `processSheetData` para extraer estos datos y agregarlos al objeto del evento.

### 2. `app.js`
- Se modificó la función `showEventModal` para renderizar condicionalmente una sección de acciones.
- Lógica implementada:
  - Si existe `enlace`, `presentacion` o `video`, se crea un contenedor `.modal-actions`.
  - Se generan los botones correspondientes solo para los campos que tienen contenido.
  - Se usan iconos de Phosphor Icons (`ph-link`, `ph-presentation`, `ph-video`).

### 3. `styles.css`
- Se agregaron estilos para `.modal-cta.secondary` (color gris oscuro) para diferenciar las acciones secundarias de la acción principal (rojo institucional).
- Se mejoró el espaciado y la disposición de los botones en el modal.

## Cómo Probar

1. **En Google Sheets:**
   - Asegúrese de tener columnas con encabezados que contengan "Presentación" y "Video".
   - Agregue URLs en estas columnas para algunos eventos de prueba.

2. **En la Aplicación:**
   - Recargue la página.
   - Abra un evento que tenga datos en estas columnas.
   - Verifique que aparezcan los botones correspondientes.
   - Abra un evento que NO tenga estos datos y verifique que los botones no aparezcan.

## Notas Técnicas
- Los botones se abren en una nueva pestaña (`target="_blank"`).
- Si un campo está vacío en el Sheet, el botón simplemente no se renderiza.
