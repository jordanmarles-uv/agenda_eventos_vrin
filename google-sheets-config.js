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
    // Spreadsheet ID
    spreadsheetId: '1l93_mXMRDoxswpn-05rCZUvU3eVWQ_EByOVCH8bOak0',
    
    // Nombre de la hoja/tab
    sheetName: 'Sheet1',
    
    // Configuración de columnas (índices base 0)
    columns: {
        titulo: 0,           // A
        descripcion: 1,      // B
        fecha: 2,           // C
        hora: 3,            // D
        duracion: 4,        // E
        area: 5,            // F
        tipo: 6,            // G
        dirigido_a: 7,      // H
        imagen: 8,          // I
        enlace: 9,          // J
        estado: 10,         // K
        responsable: 11     // L
    },
    
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

// Función para cargar desde Google Sheets con manejo de errores y reintentos
async function loadFromGoogleSheets() {
    const config = SHEETS_CONFIG;
    let lastError = null;
    
    // Verificar API Key
    if (!config.options.apiKey) {
        console.error('❌ Error: No se ha configurado la API Key de Google Sheets');
        return { success: false, error: 'API Key no configurada', data: SAMPLE_DATA };
    }

    // Intentar la conexión hasta el número máximo de reintentos
    for (let attempt = 1; attempt <= config.options.maxRetries; attempt++) {
        try {
            console.log(`🔄 Intento ${attempt} de ${config.options.maxRetries}`);
            
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.sheetName}?key=${config.options.apiKey}`;
            console.log('🔗 Conectando a Google Sheets...');
            
            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }, 10000); // 10 segundos de timeout
            
            console.log(`📡 Respuesta HTTP: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error completo:', errorText);
            
            }
            
            const data = await response.json();
            console.log('✅ Datos recibidos correctamente');
            return { 
                success: true, 
                data: processSheetData(data.values),
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
function fetchWithTimeout(url, options = {}, timeout = 10000) {
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
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue; // Skip empty rows
        
        // Verificar que el primer campo (título) no esté vacío
        if (!row[0] || row[0].trim() === '') continue;
        
        const event = {
            titulo: getColumnValue(row, columnMapping.titulo) || '',
            descripcion: getColumnValue(row, columnMapping.descripcion) || '',
            fecha: formatDate(getColumnValue(row, columnMapping.fecha)) || '',
            hora: getColumnValue(row, columnMapping.hora) || '',
            duracion: getColumnValue(row, columnMapping.duracion) || '',
            area: normalizeArea(getColumnValue(row, columnMapping.area)) || '',
            tipo: normalizeType(getColumnValue(row, columnMapping.tipo)) || '',
            dirigido_a: getColumnValue(row, columnMapping.dirigido_a) || '',
            imagen: getColumnValue(row, columnMapping.imagen) || '',
            enlace: getColumnValue(row, columnMapping.enlace) || '',
            estado: normalizeStatus(getColumnValue(row, columnMapping.estado)) || 'disponible',
            responsable: getColumnValue(row, columnMapping.responsable) || ''
        };
        
        // Solo agregar si tiene título
        if (event.titulo.trim()) {
            events.push(event);
            console.log('✅ Evento procesado:', event.titulo);
        }
    }
    
    console.log(`📊 Total de eventos procesados: ${events.length}`);
    return events;
}

// Función para mapear columnas automáticamente
function detectColumnMapping(headers) {
    const mapping = {
        titulo: 6,        // "Actividad"
        descripcion: 9,   // "Propósito de la actividad"
        fecha: 19,        // "Inicio"
        hora: 15,         // "Hora"
        duracion: 16,     // "N° total de horas"
        area: 4,          // "AREA DE FORMACIÓN"
        tipo: 11,         // "Tipo de Actividad"
        dirigido_a: 8,    // "Público objetivo"
        imagen: 23,       // "URL de imagen"
        enlace: 22,       // "Presentación"
        estado: 2,        // "Estado ded la actividad"
        responsable: 5    // "Responsable"
    };
    
    if (!headers) return mapping;
    
    const headerMap = {};
    headers.forEach((header, index) => {
        if (!header) return;
        
        const normalizedHeader = header.toLowerCase().trim();
        
        // Mapear headers específicos de tu estructura
        if (normalizedHeader.includes('actividad')) {
            mapping.titulo = index;
            headerMap[index] = 'titulo';
        } else if (normalizedHeader.includes('propósito') || normalizedHeader.includes('proposito')) {
            mapping.descripcion = index;
            headerMap[index] = 'descripcion';
        } else if (normalizedHeader.includes('inicio')) {
            mapping.fecha = index;
            headerMap[index] = 'fecha';
        } else if (normalizedHeader.includes('hora') && !normalizedHeader.includes('total')) {
            mapping.hora = index;
            headerMap[index] = 'hora';
        } else if (normalizedHeader.includes('total') && normalizedHeader.includes('horas')) {
            mapping.duracion = index;
            headerMap[index] = 'duracion';
        } else if (normalizedHeader.includes('formación') || normalizedHeader.includes('formacion')) {
            mapping.area = index;
            headerMap[index] = 'area';
        } else if (normalizedHeader.includes('tipo')) {
            mapping.tipo = index;
            headerMap[index] = 'tipo';
        } else if (normalizedHeader.includes('público') || normalizedHeader.includes('publico')) {
            mapping.dirigido_a = index;
            headerMap[index] = 'dirigido_a';
        } else if (normalizedHeader.includes('imagen') || normalizedHeader.includes('url')) {
            mapping.imagen = index;
            headerMap[index] = 'imagen';
        } else if (normalizedHeader.includes('presentación') || normalizedHeader.includes('presentacion')) {
            mapping.enlace = index;
            headerMap[index] = 'enlace';
        } else if (normalizedHeader.includes('estado')) {
            mapping.estado = index;
            headerMap[index] = 'estado';
        } else if (normalizedHeader.includes('responsable')) {
            mapping.responsable = index;
            headerMap[index] = 'responsable';
        }
    });
    
    console.log('🗺️ Header mapping:', headerMap);
    return mapping;
}

// Función auxiliar para obtener valor de columna de forma segura
function getColumnValue(row, columnIndex) {
    if (!row || !columnIndex || columnIndex >= row.length) return '';
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
    
    if (!estado) return 'disponible';
    
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