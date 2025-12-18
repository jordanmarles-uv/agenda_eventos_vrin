// ===== GOOGLE SHEETS CONFIGURATION =====
// Configuración para conectar con Google Sheets API

// Datos de ejemplo para cuando falle la conexión
const SAMPLE_DATA = {
    range: 'Formación!A1:L4',
    majorDimension: 'ROWS',
    values: [
        ['Título', 'Descripción', 'Fecha', 'Hora', 'Duración', 'Área', 'Tipo', 'Dirigido a', 'Imagen', 'Enlace', 'Estado', 'Responsable'],
        ['Taller de Investigación', 'Aprende métodos de investigación', '2025-12-01', '14:00', '2 horas', 'gestion_investigacion', 'taller', 'Estudiantes', '', 'https://ejemplo.com/inscripcion', 'disponible', 'Ana Pérez'],
        ['Conferencia Internacional', 'Conferencia sobre innovación', '2025-12-05', '10:00', '3 horas', 'relaciones_internacionales', 'conferencia', 'Público general', '', 'https://ejemplo.com/conferencia', 'disponible', 'Carlos López']
    ]
};

const SHEETS_CONFIG = {
    // Spreadsheet ID - Nuevo Sheet "Agenda 2025"
    spreadsheetId: '1B3HoE6B1h20iErFHUrvPzEaXXliq89VXPlTxUB2bBH4',

    // Nombre de la hoja/tab
    sheetName: 'Eventos2025',

    // Configuración de columnas - YA NO SE USA (mapeo automático)
    // Las columnas se detectan automáticamente basadas en los nombres de headers
    columns: {},
    // Campos obligatorios MÍNIMOS - Solo lo esencial para mostrar un evento
    // Los demás campos son opcionales y simplemente no se mostrarán si están vacíos
    requiredFields: [
        'titulo',         // Título del evento (esencial)
        'tipo'            // Tipo de actividad (para categorizar)
        // 'fecha' removido para permitir eventos permanentes o sin fecha definida
    ],

    // Opciones de configuración
    options: {
        // API Key desde variables de entorno
        get apiKey() {
            return window.APP_CONFIG?.GOOGLE_SHEETS_API_KEY || window.CONFIG?.GOOGLE_SHEETS_API_KEY || '';
        },

        // Rango de datos
        range: 'A1:Z1000',

        // Número máximo de reintentos
        maxRetries: 3,

        // Tiempo de espera entre reintentos (ms)
        retryDelay: 1000
    }
};

// ===== CACHE SYSTEM =====
const CACHE_KEY = 'agenda_events_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function getCachedData() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                console.log('✅ Usando datos en caché');
                return data;
            } else {
                console.log('⏰ Caché expirado');
            }
        }
    } catch (error) {
        console.error('❌ Error leyendo caché:', error);
    }
    return null;
}

function setCachedData(data) {
    try {
        const cacheObject = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
        console.log('💾 Datos guardados en caché');
    } catch (error) {
        console.error('❌ Error guardando caché:', error);
    }
}

function clearCache() {
    try {
        localStorage.removeItem(CACHE_KEY);
        console.log('🗑️ Caché limpiado');
    } catch (error) {
        console.error('❌ Error limpiando caché:', error);
    }
}

// Función para cargar desde Google Sheets con manejo de errores y reintentos
async function loadFromGoogleSheets() {
    const config = SHEETS_CONFIG;
    let lastError = null;

    // Verificar caché primero
    const cachedData = getCachedData();
    if (cachedData) {
        return {
            success: true,
            data: cachedData,
            isSampleData: false,
            fromCache: true
        };
    }

    // Verificar API Key
    if (!config.options.apiKey) {
        console.error('❌ Error: No se ha configurado la API Key de Google Sheets');
        return { success: false, error: 'API Key no configurada', data: SAMPLE_DATA };
    }

    // Intentar la conexión hasta el número máximo de reintentos
    for (let attempt = 1; attempt <= config.options.maxRetries; attempt++) {
        try {
            console.log(`🔄 Intento ${attempt} de ${config.options.maxRetries}`);

            // IMPORTANTE: Codificar el nombre del sheet correctamente para manejar espacios
            const encodedSheetName = encodeURIComponent(config.sheetName);
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodedSheetName}?key=${config.options.apiKey}`;
            console.log('🔗 Conectando a Google Sheets...');
            console.log('📍 Sheet:', config.sheetName, '→ Encoded:', encodedSheetName);

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }, 15000); // 15 segundos de timeout

            console.log(`📡 Respuesta HTTP: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error completo:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Datos recibidos correctamente');
            const processedData = processSheetData(data.values);

            // Guardar en caché
            setCachedData(processedData);

            return {
                success: true,
                data: processedData,
                isSampleData: false
            };

        } catch (error) {
            console.error(`❌ Error en la conexión (intento ${attempt}):`, error.message);
            lastError = error;

            // Esperar antes de reintentar (backoff exponencial)
            if (attempt < config.options.maxRetries) {
                const delay = config.options.retryDelay * Math.pow(2, attempt - 1);
                console.log(`⏳ Reintentando en ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.error('❌ Todos los intentos de conexión fallaron. Usando datos de muestra.');
    console.log('ℹ️ Último error:', lastError?.message);

    return {
        success: false,
        error: 'No se pudo conectar a Google Sheets',
        data: SAMPLE_DATA,
        isSampleData: true
    };
}

// Función auxiliar para fetch con timeout
function fetchWithTimeout(url, options = {}, timeout = 15000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Tiempo de espera agotado')), timeout)
        )
    ]);
}

// Función para procesar los datos del sheet
function processSheetData(rows) {
    console.log('🔍 Analizando estructura de datos:', {
        totalRows: rows.length,
        firstRow: rows[0] || [],
        sampleRows: rows.slice(0, 3)
    });

    if (!rows || rows.length === 0) {
        console.warn('⚠️ No hay datos en el sheet');
        return [];
    }

    // Si solo hay headers, retornar vacío
    if (rows.length < 2) {
        console.warn('⚠️ Solo headers, no hay datos de eventos');
        return [];
    }

    const headers = rows[0];
    const events = [];

    // Mapeo flexible de columnas basado en headers
    const columnMapping = detectColumnMapping(headers);
    console.log('🗺️ Mapeo de columnas detectado:', columnMapping);

    // Verificar que se detectaron campos obligatorios
    const requiredFields = SHEETS_CONFIG.requiredFields || [];
    console.log('✅ Campos obligatorios a verificar:', requiredFields);

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue; // Skip empty rows

        // Construir el evento
        const event = {
            tipo: getColumnValue(row, columnMapping.tipo) || '',
            titulo: getColumnValue(row, columnMapping.titulo) || '',
            descripcion: getColumnValue(row, columnMapping.descripcion) || '',
            estado: getColumnValue(row, columnMapping.estado) || '',
            dirigido_a: getColumnValue(row, columnMapping.dirigido_a) || '',
            modalidad: getColumnValue(row, columnMapping.modalidad) || '',
            unidad_gestion: getColumnValue(row, columnMapping.unidad_gestion) || '',
            tematica: getColumnValue(row, columnMapping.tematica) || '',
            area: normalizeArea(getColumnValue(row, columnMapping.area)) || '',
            responsable: getColumnValue(row, columnMapping.responsable) || '',
            diligencia: getColumnValue(row, columnMapping.diligencia) || '',
            cupos: getColumnValue(row, columnMapping.cupos) || '',
            expositor: getColumnValue(row, columnMapping.expositor) || '',
            horario: getColumnValue(row, columnMapping.horario) || '',
            hora: getColumnValue(row, columnMapping.horario) || '', // Alias para compatibilidad
            duracion: getColumnValue(row, columnMapping.duracion) || '',
            fecha: formatDate(getColumnValue(row, columnMapping.fecha)) || '',
            fecha_fin: formatDate(getColumnValue(row, columnMapping.fecha_fin)) || '',
            duracion_semanas: getColumnValue(row, columnMapping.duracion_semanas) || '',
            mes: getColumnValue(row, columnMapping.mes) || '',
            imagen: getColumnValue(row, columnMapping.imagen) || '',
            enlace: getColumnValue(row, columnMapping.enlace) || '',
            presentacion: getColumnValue(row, columnMapping.presentacion) || '',
            video: getColumnValue(row, columnMapping.video) || ''
        };

        // VALIDACIÓN DE CAMPOS OBLIGATORIOS
        // Solo agregar el evento si tiene TODOS los campos obligatorios
        let isValid = true;
        const missingFields = [];

        for (const field of requiredFields) {
            if (!event[field] || (typeof event[field] === 'string' && event[field].trim() === '')) {
                isValid = false;
                missingFields.push(field);
            }
        }

        if (!isValid) {
            console.warn(`⚠️ Evento en fila ${i + 1} omitido por falta de campos obligatorios:`, {
                titulo: event.titulo || '(sin título)',
                camposFaltantes: missingFields,
                datosFila: row
            });
            continue; // Saltar este evento
        }

        // Solo agregar si pasó la validación
        events.push(event);
        console.log(`✅ Evento procesado (fila ${i + 1}):`, event.titulo);
    }

    console.log(`📊 Total de eventos procesados: ${events.length}`);
    console.log(`⚠️ Eventos omitidos por falta de datos: ${rows.length - 1 - events.length}`);
    return events;
}

// Función para mapear columnas automáticamente - NUEVA ESTRUCTURA AGENDA 2025
function detectColumnMapping(headers) {
    // Inicializar mapping vacío - TODO se detecta automáticamente
    const mapping = {};

    if (!headers || headers.length === 0) {
        console.warn('⚠️ No hay headers para mapear');
        return mapping;
    }

    const headerMap = {};

    headers.forEach((header, index) => {
        if (!header) return;

        const normalizedHeader = header.toLowerCase().trim();

        // Mapear headers de la nueva estructura "Agenda 2025"

        // Tipo de Actividad*
        if (normalizedHeader.includes('tipo') && normalizedHeader.includes('actividad')) {
            mapping.tipo = index;
            headerMap[index] = 'tipo';
        }
        // Actividad* (Título)
        else if (normalizedHeader.includes('actividad') && normalizedHeader.includes('título')) {
            mapping.titulo = index;
            headerMap[index] = 'titulo';
        }
        // Propósito* (Descripción)
        else if (normalizedHeader.includes('propósito') || normalizedHeader.includes('proposito')) {
            mapping.descripcion = index;
            headerMap[index] = 'descripcion';
        }
        // Estado de la actividad*
        else if (normalizedHeader.includes('estado')) {
            mapping.estado = index;
            headerMap[index] = 'estado';
        }
        // Público objetivo*
        else if (normalizedHeader.includes('público') || normalizedHeader.includes('publico')) {
            mapping.dirigido_a = index;
            headerMap[index] = 'dirigido_a';
        }
        // Modalidad*
        else if (normalizedHeader.includes('modalidad')) {
            mapping.modalidad = index;
            headerMap[index] = 'modalidad';
        }
        // Unidad de gestión*
        else if (normalizedHeader.includes('unidad') && normalizedHeader.includes('gestión')) {
            mapping.unidad_gestion = index;
            headerMap[index] = 'unidad_gestion';
        }
        // Temática*
        else if (normalizedHeader.includes('temática') || normalizedHeader.includes('tematica')) {
            mapping.tematica = index;
            headerMap[index] = 'tematica';
        }
        // Área de formación (no obligatorio)
        else if ((normalizedHeader.includes('área') || normalizedHeader.includes('aréa')) && normalizedHeader.includes('formación')) {
            mapping.area = index;
            headerMap[index] = 'area';
        }
        // Responsable
        else if (normalizedHeader.includes('responsable')) {
            mapping.responsable = index;
            headerMap[index] = 'responsable';
        }
        // Quien diligencia la propuesta
        else if (normalizedHeader.includes('diligencia')) {
            mapping.diligencia = index;
            headerMap[index] = 'diligencia';
        }
        // Cupos*
        else if (normalizedHeader.includes('cupos')) {
            mapping.cupos = index;
            headerMap[index] = 'cupos';
        }
        // Expositor sugerido(a)s
        else if (normalizedHeader.includes('expositor')) {
            mapping.expositor = index;
            headerMap[index] = 'expositor';
        }
        // Horario* (Horas Inicio - Fin)
        else if (normalizedHeader.includes('horario')) {
            mapping.horario = index;
            headerMap[index] = 'horario';
        }
        // Cantidad de horas
        else if (normalizedHeader.includes('cantidad') && normalizedHeader.includes('horas')) {
            mapping.duracion = index;
            headerMap[index] = 'duracion';
        }
        // Fecha Inicio*
        else if (normalizedHeader.includes('fecha') && normalizedHeader.includes('inicio')) {
            mapping.fecha = index;
            headerMap[index] = 'fecha';
        }
        // Fecha Fin*
        else if (normalizedHeader.includes('fecha') && normalizedHeader.includes('fin')) {
            mapping.fecha_fin = index;
            headerMap[index] = 'fecha_fin';
        }
        // Duración (en semanas)
        else if (normalizedHeader.includes('duración') && normalizedHeader.includes('semanas')) {
            mapping.duracion_semanas = index;
            headerMap[index] = 'duracion_semanas';
        }
        // Mes*
        else if (normalizedHeader === 'mes' || normalizedHeader.includes('mes*')) {
            mapping.mes = index;
            headerMap[index] = 'mes';
        }
        // Imagen / URL (si existe en el sheet)
        else if (normalizedHeader.includes('imagen') || normalizedHeader.includes('url')) {
            mapping.imagen = index;
            headerMap[index] = 'imagen';
        }
        // Enlace / Link (si existe)
        else if (normalizedHeader.includes('enlace') || normalizedHeader.includes('link')) {
            mapping.enlace = index;
            headerMap[index] = 'enlace';
        }
        // Presentación
        else if (normalizedHeader.includes('presentación') || normalizedHeader.includes('presentacion')) {
            mapping.presentacion = index;
            headerMap[index] = 'presentacion';
        }
        // Video
        else if (normalizedHeader.includes('video')) {
            mapping.video = index;
            headerMap[index] = 'video';
        }
    });

    console.log('🗺️ Header mapping detectado:', headerMap);
    console.log('📋 Columnas encontradas:', Object.keys(mapping));
    return mapping;
}

// Función auxiliar para obtener valor de columna de forma segura
function getColumnValue(row, columnIndex) {
    // Arreglado bug: columnIndex puede ser 0 (válido), solo verificar si es undefined/null
    if (!row || columnIndex === undefined || columnIndex === null || columnIndex >= row.length) return '';
    return row[columnIndex] || '';
}

// Funciones de normalización
function formatDate(dateValue) {
    if (!dateValue) return '';

    try {
        // Manejar diferentes formatos de fecha
        let date;

        if (typeof dateValue === 'string') {
            // Si ya es string, intentar parsear
            date = new Date(dateValue);
        } else if (dateValue instanceof Date) {
            date = dateValue;
        } else {
            // Asumir que es un número de día de Excel o similar
            date = new Date(dateValue);
        }

        if (isNaN(date.getTime())) {
            return '';
        }

        return date.toISOString().split('T')[0]; // YYYY-MM-DD

    } catch (error) {
        console.warn('Error formateando fecha:', dateValue, error);
        return '';
    }
}

function normalizeArea(area) {
    if (!area) return '';

    const areaMap = {
        'ciclo de conferencias "hablemos de ética de la investigación"': 'etica_investigacion',
        'ciclo de conferencias hablemos de ética de la investigación': 'etica_investigacion',
        'etica investigacion': 'etica_investigacion',
        'ética investigación': 'etica_investigacion',

        'gestión de proyectos': 'gestion_proyectos',
        'gestion de proyectos': 'gestion_proyectos',
        'gestión proyectos': 'gestion_proyectos',
        'gestion proyectos': 'gestion_proyectos',

        'permisos ambientales': 'permisos_ambientales',
        'permiso ambiental': 'permisos_ambientales',

        'comité central de ética': 'comite_etica',
        'comité central de ética ': 'comite_etica',
        'comite etica': 'comite_etica',

        'vicedecanaturas-equipo vrin': 'vicedecanaturas_vrin',
        'vicedecanaturas equipo vrin': 'vicedecanaturas_vrin',
        'vrin': 'vicedecanaturas_vrin',

        // Mapeos por defecto para compatibilidad
        'gestión de la investigación': 'gestion_investigacion',
        'gestion de la investigacion': 'gestion_investigacion',
        'gi': 'gestion_investigacion',

        'transferencia de resultados': 'transferencia_resultados',
        'tri': 'transferencia_resultados',

        'laboratorios': 'laboratorios',
        'sistema institucional': 'laboratorios',

        'programa editorial': 'editorial',
        'editorial': 'editorial',

        'relaciones internacionales': 'relaciones_internacionales',
        'dri': 'relaciones_internacionales',

        'proyectos especiales': 'proyectos_especiales',
        'proyectos': 'proyectos_especiales'
    };

    const normalized = area.toLowerCase().trim();
    return areaMap[normalized] || normalized.replace(/[^a-z0-9]/g, '_');
}

function normalizeType(tipo) {
    const typeMap = {
        'curso': 'curso',
        'cursos': 'curso',

        'capacitación': 'capacitacion',
        'capacitacion': 'capacitacion',
        'capacitaciones': 'capacitacion',

        'conferencia': 'conferencia',
        'conferencias': 'conferencia',
        'charla': 'conferencia',
        'presentación': 'conferencia',
        'presentacion': 'conferencia',

        'taller': 'taller',
        'talleres': 'taller',

        'diplomado': 'diplomado',
        'diplomados': 'diplomado',
        'diploma': 'diplomado',

        'socialización': 'socializacion',
        'socializacion': 'socializacion',
        'socializaciones': 'socializacion',

        'seminario': 'seminario',
        'seminarios': 'seminario',

        'workshop': 'workshop',
        'workshops': 'workshop',

        'webinar': 'webinar',
        'webinars': 'webinar',

        'evento': 'evento',
        'eventos': 'evento'
    };

    if (!tipo) return '';

    const normalized = tipo.toLowerCase().trim();
    return typeMap[normalized] || normalized.replace(/[^a-z0-9]/g, '_');
}

function normalizeStatus(estado) {
    // Si no hay estado, devolver vacío para que getEventStatus lo maneje como 'cerrada'
    if (!estado || estado.trim() === '') return '';

    const statusMap = {
        'disponible': 'disponible',
        'abierto': 'disponible',
        'abierta': 'disponible',
        'inscripciones abiertas': 'disponible',

        'cerrado': 'cerrado',
        'cerrada': 'cerrado',
        'inscripciones cerradas': 'cerrado',

        'cupos llenos': 'cupos_llenos',
        'cupos lleno': 'cupos_llenos',
        'lleno': 'cupos_llenos',
        'completo': 'cupos_llenos',

        'cancelado': 'cancelado',
        'cancelada': 'cancelado'
    };

    const normalized = estado.toLowerCase().trim();
    return statusMap[normalized] || normalized.replace(/\s+/g, '_');
}

// Exportar configuración para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SHEETS_CONFIG,
        loadFromGoogleSheets,
        processSheetData,
        formatDate,
        normalizeArea,
        normalizeType,
        normalizeStatus
    };
}