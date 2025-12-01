// ===== STATE =====
let eventsData = [];
let filteredEvents = [];
let calendarInstance = null;
let datePickerInstance = null;
let activePopover = null;
let currentView = 'calendar';
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// ===== GOOGLE SHEETS CONFIGURATION =====
// NOTE: The actual configuration is handled in google-sheets-config.js
// This file (app.js) uses the functions exported by that file.

// Sample data for testing (remove when connecting to real Google Sheets)
const sampleEvents = [
    {
        titulo: "Taller de Metodología de Investigación Cualitativa",
        descripcion: "Metodologías avanzadas para investigación cualitativa en ciencias sociales",
        fecha: "2024-11-01",
        fecha_fin: "2024-11-15", // PASADO - should be CERRADA
        hora: "09:00",
        duracion: "4 horas",
        area: "gestion_investigacion",
        tipo: "taller",
        dirigido_a: "Investigadores senior y estudiantes de posgrado",
        imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
        enlace: "https://ejemplo.com/inscripcion",
        modalidad: "presencial",
        responsable: "Luz Piedad"
    },
    {
        titulo: "Curso de Transferencia de Tecnología",
        descripcion: "Estrategias efectivas para la transferencia de resultados de investigación al sector productivo",
        fecha: "2024-11-20",
        fecha_fin: "2024-12-20", // PASADO - should be CERRADA
        hora: "14:00",
        duracion: "8 horas",
        area: "transferencia_resultados",
        tipo: "curso",
        dirigido_a: "Investigadores y docentes",
        imagen: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
        enlace: "https://ejemplo.com/inscripcion",
        modalidad: "virtual",
        responsable: "Antonio Ramírez"
    },
    {
        titulo: "Diplomado en Gestión de Proyectos de I+D",
        descripcion: "Programa integral de formación en gestión, formulación y evaluación de proyectos de investigación y desarrollo",
        fecha: "2025-01-10",
        fecha_fin: "2025-03-10", // FUTURO - should be ABIERTA
        hora: "08:00",
        duracion: "40 horas",
        area: "gestion_investigacion",
        tipo: "diplomado",
        dirigido_a: "Coordinadores de investigación y académicos",
        imagen: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop",
        enlace: "https://ejemplo.com/inscripcion",
        modalidad: "hibrido",
        responsable: "Cristina y Ana Jaramillo"
    },
    {
        titulo: "Conferencia: Tendencias Globales en Investigación",
        descripcion: "Presentación de las últimas tendencias y avances en investigación científica a nivel internacional",
        fecha: "2025-01-25",
        fecha_fin: "2025-01-25", // FUTURO - should be ABIERTA
        hora: "10:00",
        duracion: "2 horas",
        area: "gestion_investigacion",
        tipo: "conferencia",
        dirigido_a: "Comunidad académica y estudiantes",
        imagen: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop",
        enlace: "https://ejemplo.com/inscripcion",
        modalidad: "presencial",
        responsable: "Sonia Jiménez"
    },
    {
        titulo: "Socialización de Resultados de Investigación",
        descripcion: "Presentación de resultados de proyectos de investigación culminados en el año",
        fecha: "2025-02-05",
        fecha_fin: "2025-02-05", // FUTURO - should be ABIERTA
        hora: "15:00",
        duracion: "3 horas",
        area: "apropiacion_social",
        tipo: "socializacion",
        dirigido_a: "Investigadores, estudiantes y comunidad académica",
        imagen: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=225&fit=crop",
        enlace: "https://ejemplo.com/inscripcion",
        modalidad: "virtual",
        responsable: "Luz Piedad"
    },
    {
        titulo: "Evento Sin Imagen (Prueba)",
        descripcion: "Este evento no tiene imagen para probar la imagen por defecto",
        fecha: "2025-02-10",
        fecha_fin: "2025-02-10", // FUTURO - should be ABIERTA
        hora: "11:00",
        duracion: "2 horas",
        area: "gestion_investigacion",
        tipo: "taller",
        dirigido_a: "Personal de prueba",
        imagen: "",
        enlace: "https://ejemplo.com/inscripcion",
        modalidad: "asincronico",
        responsable: "Test User"
    }
];

// ===== DOM ELEMENTS =====
const elements = {
    calendarSection: document.getElementById('calendarSection'),
    eventsSection: document.getElementById('eventsSection'),
    calendarView: document.getElementById('calendarView'),
    listView: document.getElementById('listView'),
    calendarGrid: document.getElementById('calendarGrid'),
    eventsGrid: document.getElementById('eventsGrid'),
    eventsCount: document.getElementById('eventsCount'),
    eventsTitle: document.getElementById('eventsTitle'),
    // Filter elements (simple selects)
    typeFilter: document.getElementById('typeFilter'),
    dateFilter: document.getElementById('dateFilter'),
    modalidadFilter: document.getElementById('modalidadFilter'),
    tematicaFilter: document.getElementById('tematicaFilter'),
    unidadFilter: document.getElementById('unidadFilter'),
    estadoFilter: document.getElementById('estadoFilter'),
    toggleMoreFilters: document.getElementById('toggleMoreFilters'),
    moreFiltersSection: document.getElementById('moreFiltersSection'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),
    // Estado
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    noEvents: document.getElementById('noEvents'),
    retryBtn: document.getElementById('retryBtn'),
    eventModal: document.getElementById('eventModal'),
    closeModal: document.getElementById('closeModal'),
    modalContent: document.getElementById('modalContent')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM cargado, iniciando app...');
    try {
        initializeApp();
    } catch (error) {
        console.error('❌ Error fatal al iniciar:', error);
    }
});

async function initializeApp() {
    try {
        console.log('📋 Step 1: showLoading');
        showLoading();

        console.log('📋 Step 2: initializeDatePickers');
        initializeDatePickers();

        console.log('📋 Step 3: initializeCalendar');
        initializeCalendar();

        console.log('📋 Step 4: loadEventsData');
        const loadedEvents = await loadEventsData();

        // Enrich events with calculated status
        eventsData = loadedEvents.map(event => {
            // Add calculated status to each event
            const calculatedStatus = getEventStatus(event);
            return {
                ...event,
                _calculatedStatus: calculatedStatus // Store for filtering
            };
        });

        console.log('✅ Loaded events:', eventsData.length);

        // Apply initial filter (Estado = Abierta por defecto)
        console.log('📋 Step 5: Applying initial filter (Abierta only)');
        filteredEvents = eventsData.filter(event => {
            const status = event._calculatedStatus || 'abierta';
            return status === 'abierta';
        });
        console.log('✅ Filtered to open events:', filteredEvents.length);

        console.log('📋 Step 6: updateCalendarEvents');
        updateCalendarEvents();

        console.log('📋 Step 6: renderEventList');
        renderEventList();

        console.log('📋 Step 7: setupEventListeners');
        setupEventListeners();

        console.log('📋 Step 8: switchView to list');
        switchView('list');

        console.log('📋 Step 9: hideLoading');
        hideLoading();

        console.log('✅ App initialized successfully!');
    } catch (err) {
        console.error('❌ Error initializing app:', err);
        console.error('Stack:', err.stack);
        showError();
    }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Convert Google Drive share URL to direct image URL
 * @param {string} url - Google Drive share URL
 * @returns {string} Direct image URL
 */
function convertDriveUrl(url) {
    if (!url) return '';

    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
        // Extract file ID from different URL formats
        let fileId = null;

        // Format: https://drive.google.com/file/d/FILE_ID/view
        const match1 = url.match(/\/d\/([^/]+)/);
        if (match1) fileId = match1[1];

        // Format: https://drive.google.com/open?id=FILE_ID
        const match2 = url.match(/[?&]id=([^&]+)/);
        if (match2) fileId = match2[1];

        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
    }

    return url;
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format date for display in Spanish
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Get event status from sheet data
 * Normalizes estado field to 'abierta' or 'cerrada'
 * @param {Object} event - Event object
 * @returns {string} 'abierta' or 'cerrada'
 */
function getEventStatus(event) {
    if (!event.estado) return 'abierta'; // Default if empty

    const estado = event.estado.toLowerCase().trim();

    // Normalize to abierta/cerrada
    if (estado.includes('cerrad')) return 'cerrada';
    if (estado.includes('abierta')) return 'abierta';

    // Default to abierta for unknown values
    return 'abierta';
}

function initializeDatePickers() {
    if (!elements.dateRange) return;
    datePickerInstance = flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        locale: "es",
        onChange: function (selectedDates, dateStr, instance) {
            updateFilterButtonText('btnDate', dateStr || 'Fecha');
            applyFilters();
        }
    });
}

function initializeCalendar() {
    const calendarEl = document.getElementById('calendarGrid');
    if (!calendarEl) return;

    calendarInstance = new FullCalendar.Calendar(calendarEl, {
        // Start with list view to show upcoming events clearly
        initialView: 'listMonth',
        locale: 'es',

        // Modern toolbar with multiple view options
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'listMonth,dayGridMonth,listWeek'
        },

        // Custom button text in Spanish
        views: {
            listMonth: {
                buttonText: 'Lista',
                noEventsContent: 'No hay eventos programados para este mes'
            },
            dayGridMonth: {
                buttonText: 'Calendario'
            },
            listWeek: {
                buttonText: 'Próximos 7 días'
            }
        },

        // Event display settings
        events: [],
        eventDisplay: 'block',
        displayEventTime: true,
        displayEventEnd: true,

        // Modern features
        nowIndicator: true,  // Show "now" indicator
        dayMaxEvents: 3,     // Limit events shown per day (prevents collapse)
        moreLinkClick: 'popover',  // Show popover for "+more"

        // Custom event rendering for list views
        eventContent: function (arg) {
            const event = arg.event.extendedProps.originalEvent;
            if (!event) return { html: arg.event.title };

            // Only customize list view
            if (arg.view.type.includes('list')) {
                // Use fecha (start date) or fecha_fin (end date) for display
                const dateToDisplay = event.fecha || event.fecha_fin;
                let day, month;

                if (dateToDisplay) {
                    const eventDate = new Date(dateToDisplay);
                    day = eventDate.getDate();
                    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    month = monthNames[eventDate.getMonth()];
                } else {
                    // No date available
                    day = '?';
                    month = 'Confirmar';
                }

                // Convert Drive URLs to direct image URLs
                const imageUrl = convertDriveUrl(event.imagen) || 'https://via.placeholder.com/100x100/E81C25/ffffff?text=Evento';

                // Get event status (auto-calculated if not provided)
                const eventStatus = getEventStatus(event);
                const isClosed = eventStatus === 'cerrada';

                return {
                    html: `
                        <div class="custom-event-card ${isClosed ? 'event-closed' : ''}">
                            ${isClosed ? '<div class="closed-ribbon">Cerrada</div>' : ''}
                            <div class="event-date-badge">
                                <div class="event-day">${day}</div>
                                <div class="event-month">${month}</div>
                            </div>
                            <div class="event-thumbnail">
                                ${isClosed ? '<div class="closed-badge-overlay">CERRADA</div>' : ''}
                                <img src="${imageUrl}" alt="${event.titulo}" onerror="this.src='https://via.placeholder.com/100x100/E81C25/ffffff?text=Evento'">
                            </div>
                            <div class="event-details">
                                <h3 class="event-card-title">${event.titulo}</h3>
                                <div class="event-meta">
                                    <span class="event-type">${capitalize(event.tipo || 'Evento')}</span>
                                    ${event.modalidad ? `<span class="event-mode">• ${capitalize(event.modalidad)}</span>` : ''}
                                </div>
                                ${event.dirigido_a ? `<div class="event-audience"><i class="ph ph-users"></i> ${event.dirigido_a}</div>` : ''}
                                ${event.fecha || event.fecha_fin ? `
                                    <div class="event-dates">
                                        <i class="ph ph-calendar"></i> 
                                        ${event.fecha ? formatDateDisplay(event.fecha) : ''}
                                        ${event.fecha && event.fecha_fin && event.fecha !== event.fecha_fin ? ` - ${formatDateDisplay(event.fecha_fin)}` : ''}
                                        ${!event.fecha && event.fecha_fin ? formatDateDisplay(event.fecha_fin) : ''}
                                    </div>
                                ` : ''}
                                ${event.horario || event.hora ? `<div class="event-time"><i class="ph ph-clock"></i> ${event.horario || event.hora}</div>` : ''}
                            </div>
                            <div class="event-action">
                                <i class="ph ph-caret-right"></i>
                            </div>
                        </div>
                    `
                };
            }

            // Default rendering for month view
            return { html: arg.event.title };
        },

        // Event interaction
        eventClick: function (info) {
            showEventModal(info.event.extendedProps.originalEvent);
        },

        // Styling
        eventColor: '#E81C25',
        eventTextColor: '#ffffff',

        // Responsive
        height: 'auto',
        contentHeight: 'auto',

        // List view specific settings
        listDayFormat: { weekday: 'long', day: 'numeric', month: 'long' },
        listDaySideFormat: false,

        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },

        // Event click handler
        eventClick: function (info) {
            info.jsEvent.preventDefault();
            const event = info.event.extendedProps.originalEvent;
            if (event) {
                showEventModal(event);
            }
        }
    });

    calendarInstance.render();
}

/**
 * Show event detail modal
 * @param {Object} event - Event data
 */
function showEventModal(event) {
    const modal = elements.eventModal;
    const modalContent = elements.modalContent;

    if (!modal || !modalContent) return;

    // Get event status for closed badge
    const eventStatus = getEventStatus(event);
    const isClosed = eventStatus === 'cerrada';

    // Convert Drive URL if needed
    const imageUrl = convertDriveUrl(event.imagen) || 'https://via.placeholder.com/600x300/E81C25/ffffff?text=Evento';

    // Build modal HTML
    modalContent.innerHTML = `
        <div class="modal-event-detail">
            ${isClosed ? '<div class="modal-closed-banner">CERRADA</div>' : ''}
            
            <div class="modal-image-container">
                <img src="${imageUrl}" alt="${event.titulo}" class="modal-image" 
                     onerror="this.src='https://via.placeholder.com/600x300/E81C25/ffffff?text=Evento'">
            </div>
            
            <div class="modal-body">
                <h2 class="modal-title">${event.titulo}</h2>
                
                ${event.tipo ? `<span class="modal-badge">${capitalize(event.tipo)}</span>` : ''}
                
                ${event.descripcion ? `
                    <div class="modal-section">
                        <h3><i class="ph ph-text-align-left"></i> Descripción</h3>
                        <p>${event.descripcion}</p>
                    </div>
                ` : ''}
                
                <div class="modal-info-grid">
                    ${event.fecha || event.fecha_fin ? `
                        <div class="modal-info-item">
                            <i class="ph ph-calendar"></i>
                            <div>
                                <strong>Fechas</strong>
                                <p>
                                    ${event.fecha ? `Inicio: ${formatDateDisplay(event.fecha)}` : ''}
                                    ${event.fecha && event.fecha_fin ? '<br>' : ''}
                                    ${event.fecha_fin ? `Fin: ${formatDateDisplay(event.fecha_fin)}` : ''}
                                </p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.horario || event.hora ? `
                        <div class="modal-info-item">
                            <i class="ph ph-clock"></i>
                            <div>
                                <strong>Horario</strong>
                                <p>${event.horario || event.hora}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.modalidad ? `
                        <div class="modal-info-item">
                            <i class="ph ph-device-mobile"></i>
                            <div>
                                <strong>Modalidad</strong>
                                <p>${capitalize(event.modalidad)}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.dirigido_a ? `
                        <div class="modal-info-item">
                            <i class="ph ph-users"></i>
                            <div>
                                <strong>Público objetivo</strong>
                                <p>${event.dirigido_a}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.unidad_gestion ? `
                        <div class="modal-info-item">
                            <i class="ph ph-building"></i>
                            <div>
                                <strong>Unidad de gestión</strong>
                                <p>${event.unidad_gestion}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.tematica ? `
                        <div class="modal-info-item">
                            <i class="ph ph-tag"></i>
                            <div>
                                <strong>Temática</strong>
                                <p>${event.tematica}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.duracion ? `
                        <div class="modal-info-item">
                            <i class="ph ph-timer"></i>
                            <div>
                                <strong>Duración</strong>
                                <p>${event.duracion}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.cupos ? `
                        <div class="modal-info-item">
                            <i class="ph ph-users-three"></i>
                            <div>
                                <strong>Cupos</strong>
                                <p>${event.cupos}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                ${event.enlace ? `
                    <div class="modal-actions">
                        <a href="${event.enlace}" target="_blank" rel="noopener noreferrer" class="modal-btn-primary">
                            <i class="ph ph-link"></i> Más información
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Close event modal
 */
function closeEventModal() {
    const modal = elements.eventModal;
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Setup modal close handlers
if (elements.closeModal) {
    elements.closeModal.addEventListener('click', closeEventModal);
}

if (elements.eventModal) {
    elements.eventModal.addEventListener('click', function (e) {
        if (e.target === elements.eventModal) {
            closeEventModal();
        }
    });
}

// ===== DATA LOADING =====
async function loadEventsData() {
    try {
        console.log('🔄 Cargando datos desde Google Sheets...');

        // Intentar cargar desde Google Sheets
        const result = await loadFromGoogleSheets();

        // Procesar el resultado
        if (result.success && result.data && result.data.length > 0) {
            eventsData = result.data;
            console.log('✅ Datos cargados exitosamente desde Google Sheets:', eventsData.length, 'eventos');
            console.log('📊 Primer evento:', eventsData[0]);
            console.log('📅 Fechas de eventos:', eventsData.map(e => e.fecha).slice(0, 5));

            // Debug específico para imágenes desde Google Sheets
            console.log('🔍 DEBUG DE IMÁGENES DESDE GOOGLE SHEETS:');
            eventsData.forEach((event, index) => {
                const hasValidImage = event.imagen && event.imagen.trim() !== "";
                console.log(`🖼️ Evento ${index}: ${event.titulo}`);
                console.log(`   - Campo imagen: "${event.imagen}"`);
                console.log(`   - Tipo de dato: ${typeof event.imagen}`);
                console.log(`   - Es null/undefined: ${event.imagen == null}`);
                console.log(`   - Está vacío: ${!hasValidImage}`);
                console.log(`   - Longitud: ${event.imagen ? event.imagen.length : 'N/A'}`);
            });
            return result.data;
        } else {
            console.warn('⚠️ No se encontraron datos en Google Sheets, usando datos de ejemplo');
            console.log('💡 Asegúrate de que tu Google Sheet tenga datos en las columnas correctas');
            console.log('ℹ️ Error:', result.error || 'Error desconocido');
            return sampleEvents;
        }
    } catch (error) {
        console.error('❌ Error loading events:', error);
        console.log('🔄 Cargando datos de ejemplo como respaldo...');

        // Mostrar mensaje de error en la UI
        const errorMsg = `Error al conectar con Google Sheets: ${error.message}`;
        console.error('Error detallado:', error);
        console.error('Stack trace:', error.stack);

        // En caso de error, usar datos de ejemplo
        return sampleEvents;
    }
}

// ===== GOOGLE SHEETS INTEGRATION =====
// Las funciones de conectividad con Google Sheets están en google-sheets-config.js
// que se carga automáticamente antes que este archivo

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // View toggle
    if (elements.calendarView) elements.calendarView.addEventListener('click', () => switchView('calendar'));
    if (elements.listView) elements.listView.addEventListener('click', () => switchView('list'));

    // Filter selects - trigger filtering on change
    if (elements.typeFilter) elements.typeFilter.addEventListener('change', applyFilters);
    if (elements.modalidadFilter) elements.modalidadFilter.addEventListener('change', applyFilters);
    if (elements.tematicaFilter) elements.tematicaFilter.addEventListener('change', applyFilters);
    if (elements.unidadFilter) elements.unidadFilter.addEventListener('change', applyFilters);
    if (elements.estadoFilter) elements.estadoFilter.addEventListener('change', applyFilters);

    // Date filter with Flatpickr
    if (elements.dateFilter) {
        datePickerInstance = flatpickr("#dateFilter", {
            mode: "range",
            dateFormat: "Y-m-d",
            locale: "es",
            onChange: function () {
                applyFilters();
            }
        });
    }

    // Toggle More Filters section
    if (elements.toggleMoreFilters && elements.moreFiltersSection) {
        elements.toggleMoreFilters.addEventListener('click', () => {
            const isExpanded = elements.moreFiltersSection.style.display !== 'none';
            elements.moreFiltersSection.style.display = isExpanded ? 'none' : 'block';
            elements.toggleMoreFilters.classList.toggle('expanded', !isExpanded);
        });
    }

    // Clear Filters
    if (elements.clearFiltersBtn) elements.clearFiltersBtn.addEventListener('click', clearFilters);

    // Retry & Modal
    if (elements.retryBtn) elements.retryBtn.addEventListener('click', () => { hideError(); initializeApp(); });
    if (elements.closeModal) elements.closeModal.addEventListener('click', closeModal);
    if (elements.eventModal) elements.eventModal.addEventListener('click', (e) => { if (e.target === elements.eventModal) closeModal(); });
}

function clearFilters() {
    // Reset all selects to 'todos'
    if (elements.typeFilter) elements.typeFilter.value = 'todos';
    if (elements.modalidadFilter) elements.modalidadFilter.value = 'todos';
    if (elements.estadoFilter) elements.estadoFilter.value = 'todos';
    if (elements.tematicaFilter) elements.tematicaFilter.value = 'todos';
    if (elements.unidadFilter) elements.unidadFilter.value = 'todos';

    // Clear date picker
    if (datePickerInstance) datePickerInstance.clear();

    applyFilters();
}

function applyFilters() {
    console.log('🔍 Applying filters...');

    // Get values from select elements
    const typeValue = elements.typeFilter ? elements.typeFilter.value : 'todos';
    const modalidadValue = elements.modalidadFilter ? elements.modalidadFilter.value : 'todos';
    const estadoValue = elements.estadoFilter ? elements.estadoFilter.value : 'todos';
    const tematicaValue = elements.tematicaFilter ? elements.tematicaFilter.value : 'todos';
    const unidadValue = elements.unidadFilter ? elements.unidadFilter.value : 'todos';

    // Date
    let startDate = null, endDate = null;
    if (datePickerInstance && datePickerInstance.selectedDates) {
        const selectedDates = datePickerInstance.selectedDates;
        if (selectedDates.length > 0) startDate = selectedDates[0];
        if (selectedDates.length > 1) endDate = selectedDates[1];
    }

    filteredEvents = eventsData.filter(event => {
        // 1. Tipo
        if (typeValue !== 'todos' && normalizeType(event.tipo) !== normalizeType(typeValue)) return false;

        // 2. Fecha
        if (startDate) {
            if (!event.fecha) return false;
            const eventDate = new Date(event.fecha);
            eventDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            if (eventDate < startDate) return false;
            if (endDate) {
                endDate.setHours(0, 0, 0, 0);
                if (eventDate > endDate) return false;
            }
        }

        // 3. Modalidad
        if (modalidadValue !== 'todos') {
            if (!event.modalidad) return false;
            const eventMod = normalizeString(event.modalidad);
            if (!eventMod.includes(modalidadValue)) return false;
        }

        // 4. More Filters (Temática y Unidad)
        if (tematicaValue !== 'todos' && normalizeString(event.area) !== normalizeString(tematicaValue)) return false;
        if (unidadValue !== 'todos' && normalizeString(event.dirigido_a) !== normalizeString(unidadValue)) return false;

        // 5. Estado
        if (estadoValue !== 'todos') {
            const eventStatus = normalizeStatus(event.estado);
            if (estadoValue === 'disponible' && eventStatus !== 'disponible') return false;
            if (estadoValue === 'cerrado' && eventStatus === 'disponible') return false;
            if (estadoValue === 'cupos_llenos' && event.estado !== 'cupos_llenos') return false;
            if (estadoValue === 'cancelado' && event.estado !== 'cancelado') return false;
        }

        return true;
    });

    updateCalendarEvents();
    renderEventList();
}

function getActiveBubbleValue(container) {
    if (!container) return 'todos';
    const active = container.querySelector('.bubble.active');
    return active ? active.dataset.value : 'todos';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function normalizeType(str) {
    return str ? str.toLowerCase().trim().replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u') : '';
}

function normalizeString(str) {
    return str ? str.toLowerCase().trim() : '';
}

function normalizeStatus(status) {
    return status ? status.toLowerCase().trim() : 'disponible';
}

function updateCalendarEvents() {
    if (!calendarInstance) return;

    // Map filtered events to FullCalendar format
    const fcEvents = filteredEvents.map(event => {
        if (!event.fecha) return null;
        return {
            title: event.titulo,
            start: event.fecha,
            extendedProps: {
                originalEvent: event
            },
            // Color coding by type (optional)
            backgroundColor: getTypeColor(event.tipo)
        };
    }).filter(e => e !== null);

    calendarInstance.removeAllEvents();
    calendarInstance.addEventSource(fcEvents);
}

function getTypeColor(type) {
    const t = normalizeType(type);
    if (t === 'curso') return '#E81C25'; // Red
    if (t === 'taller') return '#D97706'; // Amber
    if (t === 'diplomado') return '#4F46E5'; // Indigo
    return '#58595B'; // Gray default
}

// ===== VIEW MANAGEMENT =====
function switchView(viewName) {
    console.log('🔄 Switching to view:', viewName);

    // Update buttons
    if (elements.calendarView) elements.calendarView.classList.toggle('active', viewName === 'calendar');
    if (elements.listView) elements.listView.classList.toggle('active', viewName === 'list');

    // Update sections
    if (viewName === 'calendar') {
        if (elements.calendarSection) elements.calendarSection.style.display = 'block';
        if (elements.eventsSection) elements.eventsSection.style.display = 'none';
        // Re-render calendar to fix size issues when unhiding
        if (calendarInstance) calendarInstance.render();
    } else {
        if (elements.calendarSection) elements.calendarSection.style.display = 'none';
        if (elements.eventsSection) elements.eventsSection.style.display = 'block';
    }

    console.log('✅ View switched to:', viewName);
}

function navigateMonth(direction) {
    // This function is no longer needed with FullCalendar
    // FullCalendar handles its own navigation
    console.log('navigateMonth called but not needed with FullCalendar');
}

// ===== EVENT LIST RENDERING =====
function renderEventList() {
    console.log('🔄 Iniciando renderEventList');
    console.log('📊 filteredEvents:', filteredEvents.length);

    const sortedEvents = filteredEvents;

    console.log('📝 Setting eventsCount');
    if (elements.eventsCount) {
        elements.eventsCount.textContent = `${filteredEvents.length} eventos`;
    }

    console.log('📝 Setting eventsTitle');
    if (elements.eventsTitle) {
        elements.eventsTitle.textContent = getViewTitle();
    }

    if (sortedEvents.length === 0) {
        console.log('❌ No events to show');
        elements.eventsGrid.innerHTML = '';
        showNoEvents();
        return;
    }

    console.log('✅ Hiding noEvents');
    hideNoEvents();

    console.log('🎨 Creating event cards HTML');
    const eventsHTML = sortedEvents.map(event => createEventCard(event)).join('');

    console.log('📝 Setting eventsGrid innerHTML');
    elements.eventsGrid.innerHTML = eventsHTML;

    console.log('🖱️ Adding click listeners');
    // Add click listeners to event cards
    document.querySelectorAll('.event-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            showEventModal(sortedEvents[index]);
        });
    });

    console.log('✅ renderEventList completed');
}

function createEventCard(event) {
    const tipoNames = {
        'curso': 'Curso',
        'taller': 'Taller',
        'diplomado': 'Diplomado',
        'conferencia': 'Conferencia',
        'socializacion': 'Socialización'
    };

    const isHighPriority = event.estado === 'cupos_llenos' || event.estado === 'cancelado';
    const defaultImage = "https://picsum.photos/seed/agenda-minimax/400/300.jpg";
    const imageUrl = event.imagen && event.imagen.trim() !== "" ? event.imagen : defaultImage;

    return `
        <div class="event-card">
            <div class="event-image-container">
                <img src="${imageUrl}" alt="${event.titulo}" class="event-image" 
                     onerror="this.onerror=null; this.src='${defaultImage}';">
            </div>
            <div class="event-content">
                <span class="event-category ${isHighPriority ? 'high-priority' : ''}">
                    ${tipoNames[event.tipo] || event.tipo}
                </span>
                <h3 class="event-title">${event.titulo}</h3>
                <div class="event-meta-compact">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
                    ${formatEventDate(event.fecha)}
                </div>
            </div>
            <div class="card-hover-hint">Ver detalles</div>
        </div>
    `;
}

function getCTAButtonText(estado) {
    switch (estado) {
        case 'cupos_llenos': return 'Cupos Llenos';
        case 'cancelado': return 'Cancelado';
        case 'cerrado': return 'Inscripciones Cerradas';
        default: return 'Inscribirse';
    }
}

// ===== MODAL =====
function showEventModal(event) {
    const modalContent = document.getElementById('modalContent');
    const areaNames = {
        'gestion_investigacion': 'Gestión de la Investigación',
        'transferencia_resultados': 'Transferencia de Resultados',
        'laboratorios': 'Laboratorios',
        'editorial': 'Programa Editorial',
        'relaciones_internacionales': 'Relaciones Internacionales',
        'apropiacion_social': 'Apropiación Social del Conocimiento'
    };

    const defaultImage = "https://picsum.photos/seed/agenda-minimax/400/300.jpg";
    const imageUrl = event.imagen && event.imagen.trim() !== "" ? event.imagen : defaultImage;

    modalContent.innerHTML = `
        <div class="modal-header-image-container" style="position: relative;">
            <img src="${imageUrl}" alt="${event.titulo}" class="modal-header-image"
                 onerror="this.onerror=null; this.src='${defaultImage}';">
            <button class="modal-close" id="closeModalBtn" style="position: absolute; top: 1rem; right: 1rem;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="modal-body">
            <span class="modal-category">${event.tipo}</span>
            <h2 class="modal-title">${event.titulo}</h2>
            
            <div class="modal-grid">
                <div class="modal-info-item">
                    <span class="modal-label">Fecha</span>
                    <span class="modal-value">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:5px"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>
                        ${formatEventDate(event.fecha)}
                    </span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">Hora</span>
                    <span class="modal-value">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:5px"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                        ${event.hora || 'Por definir'}
                    </span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">Duración</span>
                    <span class="modal-value">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:5px"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7 7 7z"/></svg>
                        ${event.duracion || 'N/A'}
                    </span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">Modalidad</span>
                    <span class="modal-value">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:5px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5-2.5 2.5z"/></svg>
                        ${event.modalidad || 'Presencial'}
                    </span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">Área</span>
                    <span class="modal-value">${areaNames[event.area] || event.area}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">Dirigido a</span>
                    <span class="modal-value">${event.dirigido_a}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">Responsable</span>
                    <span class="modal-value">${event.responsable || 'Vicerrectoría de Investigaciones'}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-label">Estado</span>
                    <span class="modal-value" style="text-transform: capitalize;">${event.estado || 'Abierta'}</span>
                </div>
            </div>

            <div class="modal-description">
                <h3>Descripción</h3>
                <p>${event.descripcion}</p>
            </div>

            <div class="modal-footer">
                ${event.enlace && event.estado !== 'cancelado' && event.estado !== 'cupos_llenos' ?
            `<a href="${event.enlace}" target="_blank" class="modal-cta">
                    ${getCTAButtonText(event.estado)}
                </a>` :
            `<button class="modal-cta disabled">${getCTAButtonText(event.estado)}</button>`
        }
            </div>
        </div>
    `;

    elements.eventModal.style.display = 'flex';
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
}

function closeModal() {
    elements.eventModal.style.display = 'none';
}

function getStatusText(estado) {
    switch (estado) {
        case 'disponible': return 'Inscripciones Abiertas';
        case 'cerrado': return 'Inscripciones Cerradas';
        case 'cupos_llenos': return 'Cupos Llenos';
        case 'cancelado': return 'Cancelado';
        default: return estado;
    }
}

// ===== UI STATE MANAGEMENT =====
function showLoading() {
    if (elements.loading) elements.loading.style.display = 'block';
    if (elements.calendarSection) elements.calendarSection.style.display = 'none';
    if (elements.eventsSection) elements.eventsSection.style.display = 'none';
    if (elements.error) elements.error.style.display = 'none';
    if (elements.noEvents) elements.noEvents.style.display = 'none';
}

function hideLoading() {
    if (elements.loading) elements.loading.style.display = 'none';
}

function showError() {
    if (elements.loading) elements.loading.style.display = 'none';
    if (elements.error) elements.error.style.display = 'block';
    if (elements.calendarSection) elements.calendarSection.style.display = 'none';
    if (elements.eventsSection) elements.eventsSection.style.display = 'none';
}

function hideError() {
    if (elements.error) elements.error.style.display = 'none';
}

function showNoEvents() {
    if (elements.noEvents) elements.noEvents.style.display = 'block';
}

function hideNoEvents() {
    if (elements.noEvents) elements.noEvents.style.display = 'none';
}

function formatEventDate(dateStr) {
    if (!dateStr) return 'Fecha por confirmar';
    if (dateStr.toLowerCase() === 'siempre') return 'Permanente';
    try {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (isNaN(date.getTime())) return dateStr;
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    } catch (e) {
        return dateStr;
    }
}

function getViewTitle() {
    // Simplified version - just return a basic title
    return 'Eventos Disponibles';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeApp);