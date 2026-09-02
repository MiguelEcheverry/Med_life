// =========================================================
// MEDLIFE VIRTUAL HEALTHCARE
// Lógica compartida por las páginas individuales de especialidad
// =========================================================

/**
 * Regresa a la página principal de especialidades.
 */
function volverAEspecialidades() {
    window.location.href = '../especialidades.html';
}

/**
 * Inicia el flujo de consulta para la especialidad indicada.
 * (Placeholder: aquí se puede enlazar el formulario/agenda real de consulta)
 * @param {string} especialidad
 */
function iniciarConsulta(especialidad) {
    window.location.href = '../consultas.html?especialidad=' + encodeURIComponent(especialidad);
}

document.addEventListener('DOMContentLoaded', function () {
    var badge = document.getElementById('ai-badge');
    if (badge) {
        badge.addEventListener('click', function () {
            alert('Asistente virtual Medlife: próximamente disponible.');
        });
    }
});

//editar los difreentes botones de las especialidades y enlaces