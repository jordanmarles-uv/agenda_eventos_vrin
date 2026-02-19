// ===== ADMIN.JS — Agenda VRIN =====

// =============================================
// GLOBALS
// =============================================
let currentUser = null;
let currentUserData = null;
let isSuperAdmin = false;
let eventsCache = [];
let calendarInstance = null;
let datePicker = null;
let startTimePicker = null;
let endTimePicker = null;
let editingEventId = null;

// =============================================
// UTILS
// =============================================
function $(id) { return document.getElementById(id); }

function showEl(id, show = true) {
    const el = $(id);
    if (el) el.style.display = show ? '' : 'none';
}

function setHtml(id, html) {
    const el = $(id);
    if (el) el.innerHTML = html;
}

function showFormError(id, msg) {
    const el = $(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function parseDateDMY(str) {
    // Convert DD/MM/YYYY to YYYY-MM-DD
    if (!str) return '';
    const parts = str.split('/');
    if (parts.length !== 3) return str;
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

function togglePwd(inputId, btn) {
    const input = $(inputId);
    if (!input) return;
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.querySelector('i').className = isText ? 'ph ph-eye' : 'ph ph-eye-slash';
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const main = $('main-content');
    if (!sidebar) return;
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
    } else {
        sidebar.classList.toggle('collapsed');
        if (main) main.classList.toggle('full');
    }
}

// =============================================
// AUTH VIEWS
// =============================================
function switchAuth(view) {
    showEl('login-view', view === 'login');
    showEl('register-view', view === 'register');
    showEl('pending-view', view === 'pending');
    showEl('blocked-view', view === 'blocked');
}

function showAppOrAuth(state) {
    showEl('auth-container', state === 'auth');
    $('app-container').style.display = state === 'app' ? 'flex' : 'none';
}

// =============================================
// FIREBASE AUTH STATE
// =============================================
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        showAppOrAuth('auth');
        switchAuth('login');
        currentUser = null;
        currentUserData = null;
        return;
    }

    currentUser = user;

    // Check Firestore user doc
    try {
        const doc = await db.collection('usuarios').doc(user.uid).get();

        if (!doc.exists) {
            // New user — create pending record
            const isSA = user.email === SUPERADMIN_EMAIL;
            await db.collection('usuarios').doc(user.uid).set({
                nombre: user.displayName || user.email.split('@')[0],
                email: user.email,
                estado: isSA ? 'editor' : 'pendiente',
                es_superadmin: isSA,
                fecha_registro: firebase.firestore.FieldValue.serverTimestamp()
            });
            if (isSA) {
                currentUserData = { estado: 'editor', es_superadmin: true };
                bootDashboard(user);
            } else {
                showAppOrAuth('auth');
                switchAuth('pending');
            }
            return;
        }

        currentUserData = doc.data();
        isSuperAdmin = (user.email === SUPERADMIN_EMAIL);

        if (currentUserData.estado === 'bloqueado') {
            await auth.signOut();
            showAppOrAuth('auth');
            switchAuth('blocked');
            return;
        }

        if (currentUserData.estado === 'pendiente') {
            showAppOrAuth('auth');
            switchAuth('pending');
            return;
        }

        // editor or superadmin
        bootDashboard(user);

    } catch (err) {
        console.error('Error checking user doc:', err);
        showAppOrAuth('auth');
        switchAuth('login');
    }
});

// =============================================
// BOOT DASHBOARD
// =============================================
function bootDashboard(user) {
    showAppOrAuth('app');

    // Sidebar user info
    const initials = (currentUserData.nombre || user.email).charAt(0).toUpperCase();
    $('sidebar-avatar').textContent = initials;
    $('sidebar-name').textContent = currentUserData.nombre || user.email.split('@')[0];
    $('sidebar-role').textContent = isSuperAdmin ? '⭐ Superadmin' : 'Editor';

    // Show superadmin-only elements
    if (isSuperAdmin) {
        document.querySelectorAll('.superadmin-only').forEach(el => el.style.display = '');
    }

    // Load dashboard
    showView('dashboard');
    loadDashboardStats();
    loadRecentEvents();
    if (isSuperAdmin) loadPendingUsersDash();
    initDatePicker();
    initTimePickers();
}

// =============================================
// VIEW ROUTING
// =============================================
function showView(viewName) {
    const views = ['dashboard', 'events', 'event-form', 'users'];
    views.forEach(v => {
        const el = $(`${v}-view`);
        if (el) el.style.display = 'none';
    });

    const target = $(`${viewName}-view`);
    if (target) target.style.display = 'block';

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Page titles
    const titles = { dashboard: 'Dashboard', events: 'Eventos', 'event-form': 'Evento', users: 'Usuarios' };
    $('page-title').textContent = titles[viewName] || viewName;

    // Load data per view
    if (viewName === 'events') loadEventsTable();
    if (viewName === 'users' && isSuperAdmin) loadUsersAll();
}

// =============================================
// DATE PICKER INIT
// =============================================
function initDatePicker() {
    const input = $('f-fechas-display');
    if (!input || datePicker) return;
    datePicker = flatpickr(input, {
        mode: 'range',
        dateFormat: 'Y-m-d',
        locale: 'es',
        allowInput: false,
        onChange(selectedDates) {
            let start = '', end = '';
            if (selectedDates.length >= 1) {
                start = flatpickr.formatDate(selectedDates[0], 'Y-m-d');
                $('f-fecha-inicio').value = start;
                $('f-mes').value = calculateMonthsInRange(start, start);
            }
            if (selectedDates.length >= 2) {
                end = flatpickr.formatDate(selectedDates[1], 'Y-m-d');
                $('f-fecha-fin').value = end;
                $('f-mes').value = calculateMonthsInRange(start, end);
            }
        }
    });
}

function initTimePickers() {
    const startInput = $('f-hora-inicio');
    const endInput = $('f-hora-fin');

    if (startInput && !startTimePicker) {
        startTimePicker = flatpickr(startInput, {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            locale: 'es'
        });
    }

    if (endInput && !endTimePicker) {
        endTimePicker = flatpickr(endInput, {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            locale: 'es'
        });
    }
}

function calculateMonthsInRange(start, end) {
    if (!start) return '';
    const dateStart = new Date(start + 'T00:00:00');
    const dateEnd = end ? new Date(end + 'T00:00:00') : dateStart;

    const months = [];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    let current = new Date(dateStart.getFullYear(), dateStart.getMonth(), 1);
    const last = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), 1);

    while (current <= last) {
        months.push(monthNames[current.getMonth()]);
        current.setMonth(current.getMonth() + 1);
    }

    return months.join(', ');
}

// =============================================
// DASHBOARD STATS
// =============================================
async function loadDashboardStats() {
    try {
        const snap = await db.collection('eventos').get();
        let abiertos = 0, cerrados = 0;
        snap.forEach(doc => {
            const e = doc.data();
            const estado = (e.estado || '').toLowerCase();
            if (estado.includes('abierto')) abiertos++;
            else cerrados++;
        });
        $('stat-abiertos').textContent = abiertos;
        $('stat-cerrados').textContent = cerrados;
        $('stat-total').textContent = snap.size;

        if (isSuperAdmin) {
            const userSnap = await db.collection('usuarios').where('estado', '==', 'pendiente').get();
            $('stat-pendientes').textContent = userSnap.size;
            if (userSnap.size > 0) {
                showEl('pending-badge', true);
                $('pending-badge').textContent = userSnap.size;
            }
        }
    } catch (err) { console.error('Stats error:', err); }
}

async function loadRecentEvents() {
    try {
        const snap = await db.collection('eventos')
            .orderBy('fecha_creacion', 'desc')
            .limit(5)
            .get();

        if (snap.empty) {
            setHtml('recent-events-list', '<p class="empty-text">No hay eventos aún. ¡Crea el primero!</p>');
            return;
        }

        let html = '';
        snap.forEach(doc => {
            const e = doc.data();
            const badge = (e.estado || '').toLowerCase().includes('abierto')
                ? '<span class="badge-abierto">Abierto</span>'
                : '<span class="badge-cerrado">Cerrado</span>';
            html += `
                <div class="recent-item">
                    <div class="recent-item-title">${e.titulo || 'Sin título'}</div>
                    <span class="recent-item-meta">${capitalize(e.tipo || '')}</span>
                    ${badge}
                </div>`;
        });
        setHtml('recent-events-list', html);
    } catch (err) {
        setHtml('recent-events-list', '<p class="empty-text">Error cargando eventos.</p>');
    }
}

async function loadPendingUsersDash() {
    try {
        const snap = await db.collection('usuarios').where('estado', '==', 'pendiente').get();
        if (snap.empty) {
            setHtml('pending-users-list', '<p class="empty-text">No hay solicitudes pendientes.</p>');
            return;
        }
        let html = '';
        snap.forEach(doc => {
            const u = doc.data();
            html += `
                <div class="recent-item">
                    <div class="recent-item-title">${u.nombre || u.email}</div>
                    <span class="recent-item-meta">${u.email}</span>
                    <span class="badge-pendiente">Pendiente</span>
                </div>`;
        });
        setHtml('pending-users-list', html);
        showEl('dash-pending-users', true);
    } catch (err) { console.error(err); }
}

// =============================================
// EVENTS TABLE
// =============================================
let allEventsRows = [];

async function loadEventsTable() {
    setHtml('events-tbody', '<tr><td colspan="6" class="loading-td">Cargando...</td></tr>');
    try {
        let query = db.collection('eventos').orderBy('fecha_creacion', 'desc');
        if (!isSuperAdmin) {
            query = query.where('creado_por', '==', currentUser.uid);
        }
        const snap = await query.get();
        eventsCache = [];
        snap.forEach(doc => eventsCache.push({ id: doc.id, ...doc.data() }));
        renderEventsTable(eventsCache);
    } catch (err) {
        setHtml('events-tbody', `<tr><td colspan="6" class="loading-td">Error: ${err.message}</td></tr>`);
    }
}

function renderEventsTable(events) {
    if (!events.length) {
        setHtml('events-tbody', '<tr><td colspan="6" class="loading-td">No hay eventos.</td></tr>');
        return;
    }
    const rows = events.map(e => {
        const estado = (e.estado || '').toLowerCase().includes('abierto')
            ? '<span class="badge-abierto">Abierto</span>'
            : '<span class="badge-cerrado">Cerrado</span>';
        const inicio = e.fechas?.inicio ? formatDateDisplay(e.fechas.inicio) : '—';
        const fin = e.fechas?.fin ? formatDateDisplay(e.fechas.fin) : '—';
        const canEdit = isSuperAdmin || e.creado_por === currentUser?.uid;
        return `
            <tr>
                <td><strong>${e.titulo || 'Sin título'}</strong></td>
                <td>${capitalize(e.tipo || '—')}</td>
                <td>${estado}</td>
                <td style="font-size:0.8rem">${inicio} → ${fin}</td>
                <td style="font-size:0.8rem;color:var(--text-muted)">${e.email_creador || '—'}</td>
                <td>
                    ${canEdit ? `
                        <button class="btn-edit" onclick="editEvent('${e.id}')" title="Editar"><i class="ph ph-pencil"></i></button>
                        <button class="btn-delete" onclick="deleteEvent('${e.id}','${(e.titulo || '').replace(/'/g, "\\'")}');" title="Eliminar"><i class="ph ph-trash"></i></button>
                    ` : '—'}
                </td>
            </tr>`;
    });
    setHtml('events-tbody', rows.join(''));
}

function filterTable() {
    const q = ($('events-search')?.value || '').toLowerCase();
    if (!q) { renderEventsTable(eventsCache); return; }
    renderEventsTable(eventsCache.filter(e =>
        (e.titulo || '').toLowerCase().includes(q) ||
        (e.tipo || '').toLowerCase().includes(q)
    ));
}

// =============================================
// EVENT FORM
// =============================================
function openEventForm(eventData = null) {
    editingEventId = eventData ? eventData.id : null;
    $('form-view-title').textContent = eventData ? 'Editar evento' : 'Nuevo evento';
    $('event-id').value = editingEventId || '';

    // Reset form
    $('event-form').reset();
    showFormError('form-error', '');
    $('f-imagen-url').value = '';
    $('img-preview').style.display = 'none';
    $('upload-placeholder').style.display = '';
    showEl('img-current-hint', false);
    if (datePicker) datePicker.clear();
    if (startTimePicker) startTimePicker.clear();
    if (endTimePicker) endTimePicker.clear();
    document.querySelectorAll('input[name="dirigido"]').forEach(cb => cb.checked = false);
    $('f-fecha-inicio').value = '';
    $('f-fecha-fin').value = '';

    // Fill form if editing
    if (eventData) {
        $('f-tipo').value = eventData.tipo || '';
        $('f-estado').value = eventData.estado || 'ABIERTO';
        $('f-titulo').value = eventData.titulo || '';
        $('f-descripcion').value = eventData.descripcion || '';
        $('f-modalidad').value = eventData.modalidad || '';
        $('f-unidad').value = eventData.unidad_gestion || '';
        $('f-tematica').value = eventData.tematica || '';
        $('f-dirigido').value = eventData.dirigido_a || '';
        $('f-mes').value = eventData.mes || '';
        $('f-horario').value = eventData.horario || '';
        $('f-duracion').value = eventData.duracion || '';
        $('f-cupos').value = eventData.cupos || '';
        $('f-expositor').value = eventData.expositor || '';
        $('f-enlace').value = eventData.enlace || '';
        $('f-masinfo').value = eventData.mas_info || '';
        $('f-presentacion').value = eventData.presentacion || '';
        $('f-video').value = eventData.video || '';

        // Horario split
        if (eventData.horario && eventData.horario.includes(' - ')) {
            const [hIni, hFin] = eventData.horario.split(' - ');
            if (startTimePicker) startTimePicker.setDate(hIni);
            if (endTimePicker) endTimePicker.setDate(hFin);
        }

        // Dirigido checkboxes
        if (eventData.dirigido_a) {
            const targets = eventData.dirigido_a.split(', ').map(t => t.trim());
            document.querySelectorAll('input[name="dirigido"]').forEach(cb => {
                cb.checked = targets.includes(cb.value);
            });
        }

        // Dates
        if (eventData.fechas?.inicio) {
            $('f-fecha-inicio').value = eventData.fechas.inicio;
            $('f-fecha-fin').value = eventData.fechas.fin || eventData.fechas.inicio;
            if (datePicker) {
                datePicker.setDate([eventData.fechas.inicio, eventData.fechas.fin || eventData.fechas.inicio]);
            }
        }

        // Image
        if (eventData.imagen) {
            $('f-imagen-url').value = eventData.imagen;
            $('img-preview').src = eventData.imagen;
            $('img-preview').style.display = 'block';
            $('upload-placeholder').style.display = 'none';
            showEl('img-current-hint', true);
        }
    }

    showView('event-form');
}

function editEvent(id) {
    const eventData = eventsCache.find(e => e.id === id);
    if (eventData) openEventForm(eventData);
}

async function deleteEvent(id, titulo) {
    if (!confirm(`¿Eliminar el evento "${titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
        await db.collection('eventos').doc(id).delete();
        loadEventsTable();
        loadDashboardStats();
    } catch (err) {
        alert('Error al eliminar: ' + err.message);
    }
}

async function saveEvent(e) {
    e.preventDefault();
    const btn = $('save-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner"></i> Guardando...';
    showFormError('form-error', '');

    try {
        // Upload image if new file selected
        let imageUrl = $('f-imagen-url').value || '';
        const fileInput = $('f-imagen-file');
        if (fileInput.files.length > 0) {
            imageUrl = await uploadImage(fileInput.files[0]);
        }

        const fechaInicio = $('f-fecha-inicio').value;
        const fechaFin = $('f-fecha-fin').value;

        const eventData = {
            tipo: $('f-tipo').value,
            estado: $('f-estado').value,
            titulo: $('f-titulo').value.trim(),
            descripcion: $('f-descripcion').value.trim(),
            modalidad: $('f-modalidad').value,
            unidad_gestion: $('f-unidad').value,
            tematica: $('f-tematica').value,
            dirigido_a: $('f-dirigido').value.trim(),
            fechas: {
                inicio: fechaInicio,
                fin: fechaFin || fechaInicio
            },
            mes: $('f-mes').value.trim(),
            horario: $('f-horario').value.trim(),
            duracion: $('f-duracion').value.trim(),
            cupos: $('f-cupos').value.trim(),
            expositor: $('f-expositor').value.trim(),
            enlace: $('f-enlace').value.trim(),
            mas_info: $('f-masinfo').value.trim(),
            presentacion: $('f-presentacion').value.trim(),
            video: $('f-video').value.trim(),
            imagen: imageUrl
        };

        // Collect dirigido checkboxes
        const selectedDirigido = Array.from(document.querySelectorAll('input[name="dirigido"]:checked'))
            .map(cb => cb.value)
            .join(', ');
        eventData.dirigido_a = selectedDirigido;

        // Collect horario from pickers
        const hIni = $('f-hora-inicio').value;
        const hFin = $('f-hora-fin').value;
        if (hIni && hFin) {
            eventData.horario = `${hIni} - ${hFin}`;
        }

        if (editingEventId) {
            // Update existing
            await db.collection('eventos').doc(editingEventId).update({
                ...eventData,
                fecha_actualizacion: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Create new
            await db.collection('eventos').add({
                ...eventData,
                creado_por: currentUser.uid,
                email_creador: currentUser.email,
                fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        showView('events');
        loadEventsTable();
        loadDashboardStats();
        loadRecentEvents();

    } catch (err) {
        showFormError('form-error', 'Error al guardar: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Guardar evento';
    }
}

// =============================================
// IMAGE UPLOAD
// =============================================
function previewImage(input) {
    if (!input.files.length) return;
    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no puede pesar más de 2 MB.');
        input.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
        $('img-preview').src = ev.target.result;
        $('img-preview').style.display = 'block';
        $('upload-placeholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Error al subir imagen a Cloudinary');
    }

    const data = await res.json();
    return data.secure_url;
}

// =============================================
// USERS MANAGEMENT (superadmin)
// =============================================
async function loadUsersAll() {
    const snap = await db.collection('usuarios').get();
    const pendientes = [], editores = [], bloqueados = [];

    snap.forEach(doc => {
        const u = { id: doc.id, ...doc.data() };
        if (u.email === SUPERADMIN_EMAIL) return; // skip superadmin
        if (u.estado === 'pendiente') pendientes.push(u);
        else if (u.estado === 'editor') editores.push(u);
        else if (u.estado === 'bloqueado') bloqueados.push(u);
    });

    $('badge-pend').textContent = pendientes.length;

    renderUserList('list-pendientes', pendientes, 'pendiente');
    renderUserList('list-editores', editores, 'editor');
    renderUserList('list-bloqueados', bloqueados, 'bloqueado');
}

function renderUserList(containerId, users, estado) {
    if (!users.length) {
        setHtml(containerId, '<p class="empty-text">No hay usuarios en este estado.</p>');
        return;
    }
    const html = users.map(u => `
        <div class="user-row">
            <div class="user-avatar">${(u.nombre || u.email).charAt(0).toUpperCase()}</div>
            <div class="user-row-info">
                <div class="user-row-name">${u.nombre || '—'}</div>
                <div class="user-row-email">${u.email}</div>
            </div>
            <span class="badge-${estado}">${capitalize(estado)}</span>
            <div class="user-row-actions">
                ${estado !== 'editor' ? `<button class="btn-approve" onclick="setUserStatus('${u.id}','editor')">Aprobar</button>` : ''}
                ${estado !== 'bloqueado' ? `<button class="btn-reject"  onclick="setUserStatus('${u.id}','bloqueado')">Rechazar</button>` : ''}
                ${estado === 'bloqueado' ? `<button class="btn-approve" onclick="setUserStatus('${u.id}','editor')">Restaurar</button>` : ''}
            </div>
        </div>`).join('');
    setHtml(containerId, html);
}

async function setUserStatus(uid, newStatus) {
    try {
        await db.collection('usuarios').doc(uid).update({ estado: newStatus });
        // Refresh counts
        loadUsersAll();
        loadDashboardStats();
        loadPendingUsersDash();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function showUsersTab(tab, btn) {
    ['pendientes', 'editores', 'bloqueados'].forEach(t => {
        showEl(`tab-${t}`, t === tab);
    });
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

// =============================================
// AUTH ACTIONS
// =============================================
async function doLogin(email, password) {
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        throw new Error(`Solo se permiten correos @${ALLOWED_DOMAIN}`);
    }
    return auth.signInWithEmailAndPassword(email, password);
}

async function doRegister(nombre, email, password) {
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        throw new Error(`Solo se permiten correos @${ALLOWED_DOMAIN}`);
    }
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    // Update display name
    await cred.user.updateProfile({ displayName: nombre });
    return cred;
}

async function doLogout() {
    await auth.signOut();
}

// =============================================
// FORM LISTENERS
// =============================================
$('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('login-btn');
    btn.disabled = true;
    showFormError('login-error', '');
    try {
        await doLogin($('login-email').value.trim(), $('login-password').value);
    } catch (err) {
        showFormError('login-error', mapAuthError(err.code) || err.message);
    } finally {
        btn.disabled = false;
    }
});

$('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('register-btn');
    btn.disabled = true;
    showFormError('register-error', '');
    try {
        const nombre = $('reg-nombre').value.trim();
        const email = $('reg-email').value.trim();
        const pwd = $('reg-password').value;
        await doRegister(nombre, email, pwd);
        // onAuthStateChanged will handle showing pending view
    } catch (err) {
        showFormError('register-error', mapAuthError(err.code) || err.message);
        btn.disabled = false;
    }
});

function mapAuthError(code) {
    const map = {
        'auth/user-not-found': 'No existe una cuenta con este correo.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/email-already-in-use': 'Este correo ya tiene una cuenta registrada.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-email': 'Correo electrónico inválido.',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
        'auth/invalid-credential': 'Correo o contraseña incorrectos.'
    };
    return map[code] || null;
}
