// ===== GLOBAL VARIABLES =====
let eventsData = [];
let filteredEvents = [];
let currentView = 'calendar';
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// ===== GOOGLE SHEETS CONFIGURATION =====
// You'll need to replace this with your actual Google Sheets API configuration
const GOOGLE_SHEETS_CONFIG = {
    // Spreadsheet ID from the URL
    spreadsheetId: '1l93_mXMRDoxswpn-05rCZUvU3eVWQ_EByOVCH8bOak0',
    // Sheet name or tab name
    sheetName: 'Sheet1',
    // Column mapping - adjust these indices based on your sheet structure
    columns: {
        titulo: 0,
        descripcion: 1,
        fecha: 2,
        hora: 3,
        duracion: 4,
        area: 5,
        tipo: 6,
        dirigido_a: 7,
        imagen: 8,
        enlace: 9,
        estado: 10,
        responsable: 11
    }
};

// Sample data for testing (remove when connecting to real Google Sheets)
const sampleEvents = [
    {
        titulo: "Taller de Metodología de Investigación Cualitativa",
        descripcion: "Metodologías avanzadas para investigación cualitativa en ciencias sociales",
        fecha: "2024-12-15",
        hora: "09:00",
        duracion: "4 horas",
        area: "gestion_investigacion",
        tipo: "taller",
        dirigido_a: "Investigadores senior y estudiantes de posgrado",
        imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
        enlace: "https://ejemplo.com/inscripcion",
        estado: "disponible",
        responsable: "Luz Piedad"
    },
    {
        titulo: "Curso de Transferencia de Tecnología",
        descripcion: "Estrategias efectivas para la transferencia de resultados de investigación al sector productivo",
        fecha: "2024-12-20",
        hora: "14:00",
        duracion: "8 horas",
        area: "transferencia_resultados",
        tipo: "curso",
        dirigido_a: "Investigadores y docentes",
        imagen: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
        enlace: "https://ejemplo.com/inscripcion",
        estado: "disponible",
        responsable: "Antonio Ramírez"
    },
    {
        titulo: "Diplomado en Gestión de Proyectos de I+D",
        descripcion: "Programa integral de formación en gestión, formulación y evaluación de proyectos de investigación y desarrollo",
        fecha: "2025-01-10",
        hora: "08:00",
        duracion: "40 horas",
        area: "gestion_investigacion",
        tipo: "diplomado",
        dirigido_a: "Coordinadores de investigación y académicos",
        imagen: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop",
        enlace: "https://ejemplo.com/inscripcion",
        estado: "disponible",
        responsable: "Cristina y Ana Jaramillo"
    },
    {
        titulo: "Conferencia: Tendencias Globales en Investigación",
        descripcion: "Presentación de las últimas tendencias y avances en investigación científica a nivel internacional",
        fecha: "2025-01-25",
        hora: "10:00",
        duracion: "2 horas",
        area: "gestion_investigacion",
        tipo: "conferencia",
        dirigido_a: "Comunidad académica y estudiantes",
        imagen: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop",
        enlace: "https://ejemplo.com/inscripcion",
        estado: "disponible",
        responsable: "Sonia Jiménez"
    },
    {
        titulo: "Socialización de Resultados de Investigación",
        descripcion: "Presentación de resultados de proyectos de investigación culminados en el año",
        fecha: "2025-02-05",
        hora: "15:00",
        duracion: "3 horas",
        area: "apropiacion_social",
        tipo: "socializacion",
        dirigido_a: "Investigadores, estudiantes y comunidad académica",
        imagen: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=225&fit=crop",
        enlace: "https://ejemplo.com/inscripcion",
        estado: "disponible",
        responsable: "Luz Piedad"
    },
    {
        titulo: "Evento Sin Imagen (Prueba)",
        descripcion: "Este evento no tiene imagen para probar la imagen por defecto",
        fecha: "2025-02-10",
        hora: "11:00",
        duracion: "2 horas",
        area: "gestion_investigacion",
        tipo: "taller",
        dirigido_a: "Personal de prueba",
        imagen: "",
        enlace: "https://ejemplo.com/inscripcion",
        estado: "disponible",
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
    currentMonth: document.getElementById('currentMonth'),
    eventsGrid: document.getElementById('eventsGrid'),
    eventsCount: document.getElementById('eventsCount'),
    eventsTitle: document.getElementById('eventsTitle'),
    monthFilter: document.getElementById('monthFilter'),
    areaFilters: document.getElementById('areaFilters'),
    typeFilters: document.getElementById('typeFilters'),
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    noEvents: document.getElementById('noEvents'),
    retryBtn: document.getElementById('retryBtn'),
    eventModal: document.getElementById('eventModal'),
    closeModal: document.getElementById('closeModal')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, iniciando app...');
    try {
        initializeApp();
    } catch (error) {
        console.error('❌ Error fatal al iniciar:', error);
    }
});

async function initializeApp() {
    try {
        console.log('🔍 Verificando elementos DOM...');
        console.log('📋 eventsGrid:', !!elements.eventsGrid);
        console.log('📅 calendarGrid:', !!elements.calendarGrid);
        console.log('📊 eventsSection:', !!elements.eventsSection);
        console.log('📆 calendarSection:', !!elements.calendarSection);
        console.log('🎯 currentMonth:', !!elements.currentMonth);
        
        showLoading();
        await loadEventsData();
        setupEventListeners();
        setupFilters();
        console.log('🔄 Inicializando app, vista actual:', currentView);
        // Mostrar valores de área y tipo para debug
        console.log('📊 Áreas disponibles:', [...new Set(eventsData.map(e => e.area))]);
        console.log('📊 Tipos disponibles:', [...new Set(eventsData.map(e => e.tipo))]);
        // Usar switchView para cambiar a lista
        switchView('list');
        console.log('🔄 Después de switchView');
    } catch (error) {
        console.error('Error initializing app:', error);
        showError();
    }
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
                console.log(`   - Empieza con http: ${event.imagen ? event.imagen.startsWith('http') : 'N/A'}`);
            });
        } else {
            console.warn('⚠️ No se encontraron datos en Google Sheets, usando datos de ejemplo');
            console.log('💡 Asegúrate de que tu Google Sheet tenga datos en las columnas correctas');
            console.log('ℹ️ Error:', result.error || 'Error desconocido');
            eventsData = sampleEvents;
        }
        
        filteredEvents = [...eventsData];
        console.log('🔍 Eventos filtrados:', filteredEvents.length);
        populateMonthFilter();
    } catch (error) {
        console.error('❌ Error loading events:', error);
        console.log('🔄 Cargando datos de ejemplo como respaldo...');
        
        // Mostrar mensaje de error en la UI
        const errorMsg = `Error al conectar con Google Sheets: ${error.message}`;
        console.error('Error detallado:', errorMsg);
        
        // En caso de error, usar datos de ejemplo
        eventsData = sampleEvents;
        filteredEvents = [...eventsData];
        populateMonthFilter();
    }
}

// ===== GOOGLE SHEETS INTEGRATION =====
// Las funciones de conectividad con Google Sheets están en google-sheets-config.js
// que se carga automáticamente antes que este archivo

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // View toggle
    elements.calendarView.addEventListener('click', () => switchView('calendar'));
    elements.listView.addEventListener('click', () => switchView('list'));
    
    // Calendar navigation
    elements.prevMonth.addEventListener('click', () => navigateMonth(-1));
    elements.nextMonth.addEventListener('click', () => navigateMonth(1));
    
    // Filters
    elements.monthFilter.addEventListener('change', applyFilters);
    elements.areaFilters.addEventListener('click', handleAreaFilter);
    elements.typeFilters.addEventListener('click', handleTypeFilter);
    
    // Retry button
    elements.retryBtn.addEventListener('click', () => {
        hideError();
        initializeApp();
    });
    
    // Modal
    elements.closeModal.addEventListener('click', closeModal);
    elements.eventModal.addEventListener('click', (e) => {
        if (e.target === elements.eventModal) {
            closeModal();
        }
    });
}

// ===== VIEW MANAGEMENT =====
function switchView(view) {
    console.log('🔄 Cambiando a vista:', view);
    currentView = view;
    
    // Update button states
    elements.calendarView.classList.toggle('active', view === 'calendar');
    elements.listView.classList.toggle('active', view === 'list');
    
    // Show/hide sections
    if (view === 'calendar') {
        elements.calendarSection.style.display = 'block';
        elements.calendarSection.classList.add('active');
        elements.eventsSection.style.display = 'none';
        elements.eventsSection.classList.remove('active');
    } else {
        elements.eventsSection.style.display = 'block';
        elements.eventsSection.classList.add('active');
        elements.calendarSection.style.display = 'none';
        elements.calendarSection.classList.remove('active');
    }
    
    console.log('📊 Secciones actualizadas:', {
        view: view,
        calendarDisplay: elements.calendarSection.style.display,
        calendarClass: elements.calendarSection.className,
        eventsDisplay: elements.eventsSection.style.display,
        eventsClass: elements.eventsSection.className
    });
    
    renderCurrentView();
}

function renderCurrentView() {
    console.log('🎨 Renderizando vista actual:', currentView);
    if (currentView === 'calendar') {
        console.log('📅 Renderizando calendario');
        renderCalendar();
    } else {
        console.log('📋 Renderizando lista de eventos');
        renderEventList();
    }
}

// ===== CALENDAR RENDERING =====
function renderCalendar() {
    console.log(' Iniciando renderizado de calendario...');
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    elements.currentMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    console.log(' Mes y año configurados:', elements.currentMonth.textContent);
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    
    console.log(' Datos del calendario:', { firstDay, daysInMonth, currentMonth, currentYear });
    
    let calendarHTML = '';
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = filteredEvents.filter(event => event.fecha === dateStr);
        const isToday = day === today.getDate() && 
                       currentMonth === today.getMonth() && 
                       currentYear === today.getFullYear();
        
        calendarHTML += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">`;
        calendarHTML += `<div class="day-number ${isToday ? 'today' : ''}">${day}</div>`;
        
        dayEvents.forEach(event => {
            calendarHTML += `<div class="event-marker ${event.estado === 'cupos_llenos' ? 'high-priority' : ''}"></div>`;
        });
        
        calendarHTML += '</div>';
    }
    
    elements.calendarGrid.innerHTML = calendarHTML;
    console.log(' Calendario renderizado con', elements.calendarGrid.children.length, 'elementos');
    
    // Ocultar el mensaje de carga después de renderizar
    hideLoading();
    
    // Add click listeners to calendar days with events
    document.querySelectorAll('.calendar-day[data-date]').forEach(day => {
        const dateStr = day.dataset.date;
        const hasEvents = filteredEvents.some(event => event.fecha === dateStr);
        
        if (hasEvents) {
            day.addEventListener('click', () => {
                filterEventsByDate(dateStr);
            });
            day.style.cursor = 'pointer';
        }
    });
    
    console.log(' Event listeners agregados al calendario');
}

function navigateMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    renderCalendar();
}

// ===== EVENT LIST RENDERING =====
function renderEventList() {
    console.log('🔄 Iniciando renderEventList');
    console.log('📊 Total de eventos en eventsData:', eventsData.length);
    
    // Debug específico para imágenes
    eventsData.forEach((event, index) => {
        const hasValidImage = event.imagen && event.imagen.trim() !== "";
        console.log(`🖼️ Evento ${index}: ${event.titulo}`);
        console.log(`   - Campo imagen: "${event.imagen}"`);
        console.log(`   - Tipo de dato: ${typeof event.imagen}`);
        console.log(`   - Es null/undefined: ${event.imagen == null}`);
        console.log(`   - Está vacío: ${!hasValidImage}`);
        console.log(`   - Longitud: ${event.imagen ? event.imagen.length : 'N/A'}`);
    });
    
    // Usar los eventos ya filtrados y ordenados por applyFilters
    console.log('🔍 Eventos filtrados existentes:', filteredEvents.length);
    
    // Los eventos ya vienen filtrados y ordenados de applyFilters
    const sortedEvents = filteredEvents;
    console.log('📋 Eventos para mostrar:', sortedEvents.length);
    
    elements.eventsCount.textContent = `${filteredEvents.length} eventos`;
    elements.eventsTitle.textContent = getViewTitle();
    
    if (sortedEvents.length === 0) {
        console.log('❌ No hay eventos para mostrar');
        elements.eventsGrid.innerHTML = '';
        showNoEvents();
        return;
    }
    
    console.log('✅ Hay eventos para mostrar');
    hideNoEvents();
    
    const eventsHTML = sortedEvents.map(event => createEventCard(event)).join('');
    elements.eventsGrid.innerHTML = eventsHTML;
    
    console.log('🎴 Eventos renderizados en el grid');
    
    // Ocultar el mensaje de carga después de renderizar
    hideLoading();
    
    // Add click listeners to event cards
    document.querySelectorAll('.event-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            showEventModal(sortedEvents[index]);
        });
    });
}

function createEventCard(event) {
    const areaNames = {
        'gestion_investigacion': 'Gestión de la Investigación',
        'transferencia_resultados': 'Transferencia de Resultados',
        'laboratorios': 'Laboratorios',
        'editorial': 'Programa Editorial',
        'relaciones_internacionales': 'Relaciones Internacionales',
        'apropiacion_social': 'Apropiación Social del Conocimiento'
    };
    
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
    
    console.log('🖼️ Imagen del evento:', event.titulo, 'URL:', imageUrl, 'Tiene imagen original:', !!(event.imagen && event.imagen.trim() !== ""));
    
    const cardHTML = `
        <div class="event-card">
            <div class="event-image-container">
                <img src="${imageUrl}" alt="${event.titulo}" class="event-image" 
                     onerror="this.onerror=null; this.src='${defaultImage}'; console.error('❌ Error cargando imagen:', '${imageUrl}');">
            </div>`;
    
    console.log('🎴 HTML generado para tarjeta:', cardHTML.substring(0, 200));
    
    return cardHTML + `
            <div class="event-content">
                <span class="event-category ${isHighPriority ? 'high-priority' : ''}">
                    ${tipoNames[event.tipo] || event.tipo}
                </span>
                <h3 class="event-title">${event.titulo}</h3>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <svg><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                        ${formatEventDate(event.fecha)} ${event.hora ? `• ${event.hora}` : ''}
                    </div>
                    <div class="event-meta-item">
                        <svg><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        ${event.dirigido_a}
                    </div>
                    <div class="event-meta-item">
                        <svg><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        ${areaNames[event.area] || event.area}
                    </div>
                </div>
                <p class="event-description">${event.descripcion}</p>
                <button class="event-cta ${event.estado === 'cupos_llenos' || event.estado === 'cancelado' ? 'disabled' : ''}" 
                        ${event.estado === 'cupos_llenos' || event.estado === 'cancelado' ? 'disabled' : ''}>
                    ${getCTAButtonText(event.estado)}
                </button>
            </div>
        </div>
    `;
}

function getCTAButtonText(estado) {
    switch (estado) {
        case 'cupos_llenos':
            return 'Cupos Llenos';
        case 'cancelado':
            return 'Cancelado';
        case 'cerrado':
            return 'Inscripciones Cerradas';
        default:
            return 'Ver Detalles e Inscribirse';
    }
}

function formatEventDate(dateStr) {
    if (!dateStr) return '';
    
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateStr;
    }
}

// ===== FILTERS =====
function setupFilters() {
    populateMonthFilter();
    populateAreaFilters();
    populateTypeFilters();
}

function populateAreaFilters() {
    const areas = [...new Set(eventsData.map(event => event.area))].sort();
    
    elements.areaFilters.innerHTML = `
        <button class="pill-btn active" data-filter="todos">Todos</button>
    `;
    
    areas.forEach(area => {
        const btn = document.createElement('button');
        btn.className = 'pill-btn';
        btn.dataset.filter = area;
        btn.textContent = getAreaDisplayName(area);
        elements.areaFilters.appendChild(btn);
    });
    
    console.log('🏷️ Filtros de área creados:', areas);
}

function populateTypeFilters() {
    const types = [...new Set(eventsData.map(event => event.tipo))].sort();
    
    elements.typeFilters.innerHTML = `
        <button class="pill-btn active" data-filter="todos">Todos</button>
    `;
    
    types.forEach(type => {
        const btn = document.createElement('button');
        btn.className = 'pill-btn';
        btn.dataset.filter = type;
        btn.textContent = getTypeDisplayName(type);
        elements.typeFilters.appendChild(btn);
    });
    
    console.log('🏷️ Filtros de tipo creados:', types);
}

function getAreaDisplayName(area) {
    const areaNames = {
        'etica_investigacion': 'Ética de Investigación',
        'permisos_ambientales': 'Permisos Ambientales',
        'apropiaci_n_social_del_conocimiento': 'Apropiación Social del Conocimiento',
        'propiedad_intelectual': 'Propiedad Intelectual',
        'gestion_proyectos': 'Gestión de Proyectos',
        'gesti_n_de_proyectos___ciclo_de_conferencias__hablemos_de__tica_de_la_investigaci_n_': 'Gestión de Proyectos - Ética',
        'divulgaci_n_cient_fica': 'Divulgación Científica',
        'emprendimiento_de_base_tecnol_gica': 'Emprendimiento Tecnológico',
        'apr_piate___apropiaci_n_social_del_conocimiento': 'APRPIATE - Apropiación Social',
        'visibilidad': 'Visibilidad',
        'ciencia_abierta': 'Ciencia Abierta',
        'gesti_n_de_laboratorios': 'Gestión de Laboratorios'
    };
    return areaNames[area] || area;
}

function getTypeDisplayName(type) {
    const typeNames = {
        'curso': 'Curso',
        'capacitacion': 'Capacitación',
        'conferencia': 'Conferencia',
        'taller': 'Taller',
        'socializacion': 'Socialización'
    };
    return typeNames[type] || type;
}

function populateMonthFilter() {
    const months = [...new Set(eventsData.map(event => {
        if (!event.fecha || event.fecha.trim() === '') return null;
        const date = new Date(event.fecha);
        if (isNaN(date.getTime())) return null; // Fecha inválida
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))];
    
    // Filtrar valores null y ordenar
    const validMonths = months.filter(month => month !== null).sort();
    
    elements.monthFilter.innerHTML = '<option value="todos">Todos los meses</option>';
    
    validMonths.forEach(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1);
        const option = document.createElement('option');
        option.value = month;
        option.textContent = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
        elements.monthFilter.appendChild(option);
    });
}

function handleAreaFilter(event) {
    if (!event.target.classList.contains('pill-btn')) return;
    
    // Update active state
    elements.areaFilters.querySelectorAll('.pill-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    applyFilters();
}

function handleTypeFilter(event) {
    if (!event.target.classList.contains('pill-btn')) return;
    
    // Update active state
    elements.typeFilters.querySelectorAll('.pill-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    applyFilters();
}

function applyFilters() {
    console.log('🔍 Aplicando filtros...');
    const selectedArea = elements.areaFilters.querySelector('.pill-btn.active')?.dataset.filter || 'todos';
    const selectedType = elements.typeFilters.querySelector('.pill-btn.active')?.dataset.filter || 'todos';
    const selectedMonth = elements.monthFilter.value;
    
    console.log('📊 Filtros seleccionados:', {
        area: selectedArea,
        type: selectedType,
        month: selectedMonth
    });
    
    console.log('📊 Eventos disponibles antes de filtrar:', eventsData.length);
    
    filteredEvents = eventsData.filter(event => {
        // Area filter
        if (selectedArea !== 'todos' && event.area !== selectedArea) {
            console.log('❌ Evento filtrado por área:', event.titulo, 'área:', event.area, 'esperado:', selectedArea);
            return false;
        }
        
        // Type filter
        if (selectedType !== 'todos' && event.tipo !== selectedType) {
            console.log('❌ Evento filtrado por tipo:', event.titulo, 'tipo:', event.tipo, 'esperado:', selectedType);
            return false;
        }
        
        // Month filter - manejar eventos sin fecha
        if (selectedMonth !== 'todos') {
            if (!event.fecha || event.fecha.trim() === '') {
                console.log('❌ Evento filtrado por falta de fecha:', event.titulo);
                return false; // Eventos sin fecha no se incluyen en filtros de mes específicos
            }
            const eventDate = new Date(event.fecha);
            if (isNaN(eventDate.getTime())) {
                console.log('❌ Evento filtrado por fecha inválida:', event.titulo, 'fecha:', event.fecha);
                return false; // Fecha inválida
            }
            const eventMonthStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
            if (eventMonthStr !== selectedMonth) {
                console.log('❌ Evento filtrado por mes:', event.titulo, 'mes:', eventMonthStr, 'esperado:', selectedMonth);
                return false;
            }
        }
        
        console.log('✅ Evento pasa filtros:', event.titulo);
        return true;
    });
    
    // Ordenar eventos: los que tienen fecha primero, luego por fecha, luego los sin fecha por título
    filteredEvents.sort((a, b) => {
        // Si ambos tienen fecha, ordenar por fecha
        if (a.fecha && b.fecha && a.fecha.trim() !== '' && b.fecha.trim() !== '') {
            return new Date(a.fecha) - new Date(b.fecha);
        }
        // Si solo uno tiene fecha, va primero
        if (a.fecha && a.fecha.trim() !== '') return -1;
        if (b.fecha && b.fecha.trim() !== '') return 1;
        // Si ninguno tiene fecha, ordenar por título
        return a.titulo.localeCompare(b.titulo);
    });
    
    console.log('🔍 Filtros aplicados:', {
        area: selectedArea,
        type: selectedType,
        month: selectedMonth,
        result: filteredEvents.length
    });
    
    renderCurrentView();
}

function filterEventsByDate(dateStr) {
    filteredEvents = eventsData.filter(event => event.fecha === dateStr);
    switchView('list');
}

function getViewTitle() {
    const activeArea = elements.areaFilters.querySelector('.pill-btn.active')?.dataset.filter || 'todos';
    const activeType = elements.typeFilters.querySelector('.pill-btn.active')?.dataset.filter || 'todos';
    const selectedMonth = elements.monthFilter.value;
    
    const areaNames = {
        'gestion_investigacion': 'Gestión de la Investigación',
        'transferencia_resultados': 'Transferencia de Resultados',
        'laboratorios': 'Laboratorios',
        'editorial': 'Programa Editorial',
        'relaciones_internacionales': 'Relaciones Internacionales',
        'apropiacion_social': 'Apropiación Social del Conocimiento'
    };
    
    const tipoNames = {
        'curso': 'Cursos',
        'taller': 'Talleres',
        'diplomado': 'Diplomados',
        'conferencia': 'Conferencias',
        'socializacion': 'Socializaciones'
    };
    
    let title = 'Eventos';
    
    if (activeArea !== 'todos') {
        title += ` - ${areaNames[activeArea] || activeArea}`;
    }
    
    if (activeType !== 'todos') {
        title += ` - ${tipoNames[activeType] || activeType}`;
    }
    
    if (selectedMonth !== 'todos') {
        const [year, monthNum] = selectedMonth.split('-');
        const date = new Date(year, monthNum - 1);
        title += ` - ${date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
        })}`;
    }
    
    return title;
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
    
    console.log('🖼️ Imagen del modal:', event.titulo, 'URL:', imageUrl, 'Tiene imagen original:', !!(event.imagen && event.imagen.trim() !== ""));
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <img src="${imageUrl}" alt="${event.titulo}" class="modal-image"
                 onerror="this.onerror=null; this.src='${defaultImage}'; console.error('❌ Error cargando imagen modal:', '${imageUrl}');">
        </div>
        <div class="modal-body">
            <div class="modal-meta">
                <span class="event-category ${event.estado === 'cupos_llenos' || event.estado === 'cancelado' ? 'high-priority' : ''}">
                    ${event.tipo} - ${areaNames[event.area] || event.area}
                </span>
            </div>
            <h2 class="modal-title">${event.titulo}</h2>
            <div class="modal-details">
                <div class="detail-item">
                    <strong>Fecha y Hora:</strong> ${formatEventDate(event.fecha)} ${event.hora ? `a las ${event.hora}` : ''}
                </div>
                <div class="detail-item">
                    <strong>Duración:</strong> ${event.duracion}
                </div>
                <div class="detail-item">
                    <strong>Dirigido a:</strong> ${event.dirigido_a}
                </div>
                <div class="detail-item">
                    <strong>Responsable:</strong> ${event.responsable}
                </div>
                <div class="detail-item">
                    <strong>Estado:</strong> <span class="status-${event.estado}">${getStatusText(event.estado)}</span>
                </div>
            </div>
            <div class="modal-description">
                <h3>Descripción</h3>
                <p>${event.descripcion}</p>
            </div>
            ${event.enlace && event.estado !== 'cancelado' && event.estado !== 'cupos_llenos' ? 
                `<div class="modal-actions">
                    <a href="${event.enlace}" target="_blank" class="event-cta">
                        ${event.estado === 'cerrado' ? 'Ver Más Información' : 'Inscribirse'}
                    </a>
                </div>` : ''
            }
        </div>
    `;
    
    elements.eventModal.style.display = 'flex';
}

function closeModal() {
    elements.eventModal.style.display = 'none';
}

function getStatusText(estado) {
    switch (estado) {
        case 'disponible':
            return 'Inscripciones Abiertas';
        case 'cerrado':
            return 'Inscripciones Cerradas';
        case 'cupos_llenos':
            return 'Cupos Llenos';
        case 'cancelado':
            return 'Cancelado';
        default:
            return estado;
    }
}

// ===== UI STATE MANAGEMENT =====
function showLoading() {
    elements.loading.style.display = 'block';
    elements.calendarSection.style.display = 'none';
    elements.eventsSection.style.display = 'none';
    elements.error.style.display = 'none';
    elements.noEvents.style.display = 'none';
}

function hideLoading() {
    console.log('🙈 Ocultando loading...');
    elements.loading.style.display = 'none';
}

function showError() {
    elements.loading.style.display = 'none';
    elements.error.style.display = 'block';
    elements.calendarSection.style.display = 'none';
    elements.eventsSection.style.display = 'none';
}

function hideError() {
    elements.error.style.display = 'none';
}

function showNoEvents() {
    elements.noEvents.style.display = 'block';
}

function hideNoEvents() {
    elements.noEvents.style.display = 'none';
}