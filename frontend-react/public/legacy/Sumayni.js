// Cambiar entre Modo Normal y Modo Emergencia
function toggleEmergencyMode(enable) {
    const normalView = document.getElementById('normalView');
    const emergencyView = document.getElementById('emergencyView');
    const mobileFrame = document.getElementById('mobileFrame');
    const sosTrigger = document.getElementById('sosTrigger');

    if (enable) {
        normalView.classList.add('hidden');
        emergencyView.classList.remove('hidden');
        mobileFrame.classList.add('emergency-mode');
        sosTrigger.setAttribute('aria-pressed', 'true');

        showToast(" MODO EMERGENCIA ACTIVADO. Interfaz de respuesta rápida.");
    } else {
        emergencyView.classList.add('hidden');
        normalView.classList.remove('hidden');
        mobileFrame.classList.remove('emergency-mode');
        sosTrigger.setAttribute('aria-pressed', 'false');

        showToast("Retornando al modo normal sumayni.");
    }
}

// Simulación de envío de estado en emergencia
function sendEmergencyStatus(status) {
    showToast(`Estado enviado: "${status}". Notificando a tus guardianes del barrio.`);
}

// Toggle Modo Accesibilidad (Tipografía Grande)
let isLargeText = false;
function toggleAccessibility() {
    const frame = document.getElementById('mobileFrame');
    const button = document.getElementById('accessibilityBtn');
    isLargeText = !isLargeText;
    button.setAttribute('aria-pressed', String(isLargeText));
    button.setAttribute('aria-label', isLargeText ? 'Desactivar texto grande' : 'Activar texto grande');
    if (isLargeText) {
        frame.classList.add('large-text');
        showToast("Modo Accesibilidad: Texto amplificado activado.");
    } else {
        frame.classList.remove('large-text');
        showToast("Texto en tamaño normal.");
    }
}

// Lectura de voz (Accesibilidad / Audio)
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-PE';
        window.speechSynthesis.speak(utterance);
        showToast("Reproduciendo audio...");
    } else {
        showToast("Lectura de voz no compatible en este navegador.");
    }
}

// Modal Publicación Rápida
function openPublishModal() {
    document.getElementById('publishModal').classList.remove('hidden');
}

function closePublishModal() {
    document.getElementById('publishModal').classList.add('hidden');
}

function selectType(btn) {
    document.querySelectorAll('.type-btn').forEach(button => {
        button.classList.remove('is-selected');
    });
    btn.classList.add('is-selected');
}

function submitPublication() {
    const text = document.getElementById('publishText').value;
    if (!text.trim()) {
        showToast("Por favor escribe un mensaje corto.");
        return;
    }
    closePublishModal();
    document.getElementById('publishText').value = '';
    showToast("¡Publicación realizada con éxito en tu barrio!");
}

// Selector de Zona
function openZoneModal() {
    document.getElementById('zoneModal').classList.remove('hidden');
}

function closeZoneModal() {
    document.getElementById('zoneModal').classList.add('hidden');
}

function setZone(zoneName) {
    document.getElementById('currentZoneText').innerText = zoneName;
    document.getElementById('newsZoneText').innerText = zoneName;
    closeZoneModal();
    showToast(`Barrio cambiado a: ${zoneName}`);
}

function filterNeighborhoodNews(category) {
    const filterButtons = document.querySelectorAll('.news-filter-chip');
    const newsCards = document.querySelectorAll('.neighborhood-news-card');
    let visibleCount = 0;

    filterButtons.forEach(button => {
        const isActive = button.dataset.newsFilter === category;
        button.setAttribute('aria-pressed', String(isActive));
    });

    newsCards.forEach(card => {
        const isVisible = category === 'all' || card.dataset.newsCategory === category;
        card.classList.toggle('hidden', !isVisible);
        if (isVisible) visibleCount++;
    });

    document.getElementById('neighborhoodNewsEmpty').classList.toggle('hidden', visibleCount > 0);
}

// Navegación Tab Bar
function switchTab(btn) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('font-bold');
        item.removeAttribute('aria-current');
    });
    btn.classList.add('font-bold');
    btn.setAttribute('aria-current', 'page');
}

// Mostrar Notificación Flotante (Toast)
function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');
    toastText.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function navegarConToast() {
    showToast('Abriendo Directorio de Servicios de Proximidad...');
    setTimeout(() => {
        window.history.pushState({}, '', '/servicios');
        window.dispatchEvent(new PopStateEvent('popstate'));
    }, 400);
}

// Menú Hamburguesa
function toggleMenu() {
    const menu = document.getElementById('appMenu');
    const isOpening = menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !isOpening);
    document.getElementById('appMenuTrigger').setAttribute('aria-expanded', String(isOpening));
}

function closeMenu() {
    document.getElementById('appMenu').classList.add('hidden');
    document.getElementById('appMenuTrigger').setAttribute('aria-expanded', 'false');
}

function selectMenuOption(option) {
    const messages = {
        perfil: 'Perfil: próximamente.',
        configuracion: 'Configuración: próximamente.',
        'banco-tiempo': 'Banco de Tiempo sumayni: próximamente.'
    };
    closeMenu();
    if (option === 'perfil') {
        openProfileModal();
        return;
    }
    showToast(messages[option]);
}

function openProfileModal() {
    document.getElementById('profileZoneText').textContent = document.getElementById('currentZoneText').textContent.trim();
    document.getElementById('profileModal').classList.remove('hidden');
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.add('hidden');
}
