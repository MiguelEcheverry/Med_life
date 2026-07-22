// Función para mostrar la sección de detalle
function showDetail(sectionId) {
    // 1. Ocultar todas las vistas (tanto la principal como las de detalle)
    const allViews = document.querySelectorAll('.view-section');
    allViews.forEach(view => {
        view.classList.remove('active');
    });

    // 2. Mostrar la sección específica que se clickeó
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        // Hacer scroll suave hacia arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Función para el botón regresar
function goBack() {
    // 1. Ocultar todas las vistas
    const allViews = document.querySelectorAll('.view-section');
    allViews.forEach(view => {
        view.classList.remove('active');
    });

    // 2. Mostrar la vista principal (grid de especialidades)
    document.getElementById('main-view').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}