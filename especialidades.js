// =========================================================
// MEDLIFE VIRTUAL HEALTHCARE — lógica de la SPA
// =========================================================

/**
 * Muestra la vista de detalle de una especialidad y oculta el resto.
 * @param {string} id - id de la sección de detalle a mostrar
 */
function showDetail(id) {
    document.querySelectorAll('.view-section').forEach(function (section) {
        section.classList.remove('active');
    });

    var target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
    }

    updateNavActive('especialidades');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Regresa a la vista principal (hero + grid de especialidades).
 */
function goBack() {
    document.querySelectorAll('.view-section').forEach(function (section) {
        section.classList.remove('active');
    });

    document.getElementById('home-view').classList.add('active');
    updateNavActive('inicio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Lleva al usuario directamente a la cuadrícula de especialidades
 * dentro de la vista principal (usado por el hero y el menú).
 */
function scrollToSpecialties() {
    goBack();
    setTimeout(function () {
        var grid = document.getElementById('specialties');
        if (grid) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 60);
    updateNavActive('especialidades');
}

/**
 * Actualiza el estado visual "active" del menú superior.
 * @param {'inicio'|'especialidades'} key
 */
function updateNavActive(key) {
    var inicio = document.getElementById('nav-inicio');
    var especialidades = document.getElementById('nav-especialidades');
    if (!inicio || !especialidades) return;

    inicio.classList.toggle('active', key === 'inicio');
    especialidades.classList.toggle('active', key === 'especialidades');
}

// Insignia flotante de asistente: mensaje informativo simple y no intrusivo
document.addEventListener('DOMContentLoaded', function () {
    var badge = document.getElementById('ai-badge');
    if (badge) {
        badge.addEventListener('click', function () {
            alert('Asistente virtual Medlife: próximamente disponible.');
        });
    }
});