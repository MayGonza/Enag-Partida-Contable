// Script de Selector de Fecha Automático con Formato de Honduras (DD/MM/YYYY)
document.addEventListener('DOMContentLoaded', () => {
    // Cargar CSS de Flatpickr dinámicamente si no existe
    if (!document.getElementById('flatpickr-css')) {
        const link = document.createElement('link');
        link.id = 'flatpickr-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
        document.head.appendChild(link);
    }

    // Cargar Script de Flatpickr con idioma español dinámicamente
    const cargarFlatpickr = () => {
        if (window.flatpickr) {
            inicializarCalendarios();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
            script.onload = () => {
                const scriptEs = document.createElement('script');
                scriptEs.src = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js';
                scriptEs.onload = () => {
                    inicializarCalendarios();
                };
                document.head.appendChild(scriptEs);
            };
            document.head.appendChild(script);
        }
    };

    const inicializarCalendarios = () => {
        const selectorCampos = "input[placeholder='DD/MM/YYYY'], input[id*='fecha'], input[id*='Fecha']";
        const elementos = document.querySelectorAll(selectorCampos);

        elementos.forEach(input => {
            if (input.type === 'hidden' || input.dataset.flatpickrInit) return;
            input.dataset.flatpickrInit = "true";

            // Si está vacío, asignar fecha de hoy en formato Honduras
            if (!input.value && !input.getAttribute('value')) {
                const hoy = new Date();
                const d = String(hoy.getDate()).padStart(2, '0');
                const m = String(hoy.getMonth() + 1).padStart(2, '0');
                const y = hoy.getFullYear();
                input.value = `${d}/${m}/${y}`;
            }

            // Inicializar calendario emergente en español con formato DD/MM/YYYY
            window.flatpickr(input, {
                locale: "es",
                dateFormat: "d/m/Y",
                allowInput: true,
                disableMobile: false
            });
        });
    };

    cargarFlatpickr();
});
