// Selecciona todos los botones del menú
const botonesMenu = document.querySelectorAll('.botonMenu');
const imagenDinamica = document.getElementById('imagen-dinamica');
const contenedorImagen = document.querySelector('.imagen-central');

// Agrega eventos a cada botón
botonesMenu.forEach(boton => {
    boton.addEventListener('mouseover', () => {
        // Obtiene la imagen desde el atributo data-img
        const imgSrc = boton.getAttribute('data-img');
        imagenDinamica.src = imgSrc; // Cambia la imagen
        contenedorImagen.classList.add('active'); // Muestra el contenedor
    });

    boton.addEventListener('mouseout', () => {
        // Oculta la imagen al salir del botón
        imagenDinamica.src = ''; // Limpia la imagen
        contenedorImagen.classList.remove('active'); // Oculta el contenedor
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.menu-toggle');
    const menuNav = document.querySelector('.menunav');

    toggleButton.addEventListener('click', () => {
        menuNav.classList.toggle('menu-visible'); // Alterna la clase "menu-visible"
    });
});

// A partir de aqui esta todo lo implementado en la tercera etapa

document.addEventListener('DOMContentLoaded', () => {
    const mapaContenedor = document.querySelector('.mapa-contenedor');
    const mapaInteractivo = document.querySelector('.mapa-interactivo');
    const puntos = document.querySelectorAll('.punto');
    const modal = document.getElementById('modal');
    const modalImagen = document.getElementById('modal-imagen');
    const modalTexto = document.getElementById('modal-texto');
    const cerrarModal = document.querySelector('.cerrar');
    const zoomInButton = document.querySelector('.zoom-in');
    const zoomOutButton = document.querySelector('.zoom-out');

    let escala = 1;
    let posicionX = 0;
    let posicionY = 0;
    let arrastrando = false;
    let inicioX, inicioY;
    let distanciaInicial = null;

    // Función para aplicar el zoom y el desplazamiento
    function aplicarTransformacion() {
        mapaInteractivo.style.transform = `translate(${posicionX}px, ${posicionY}px) scale(${escala})`;
    }

    // Función para limitar el movimiento de la imagen
    function limitarMovimiento() {
        const anchoContenedor = mapaContenedor.clientWidth;
        const altoContenedor = mapaContenedor.clientHeight;
        const anchoImagen = mapaInteractivo.clientWidth * escala;
        const altoImagen = mapaInteractivo.clientHeight * escala;

        // Limitar el movimiento en el eje X
        if (anchoImagen > anchoContenedor) {
            posicionX = Math.min(Math.max(posicionX, anchoContenedor - anchoImagen), 0);
        } else {
            posicionX = 0;
        }

        // Limitar el movimiento en el eje Y
        if (altoImagen > altoContenedor) {
            posicionY = Math.min(Math.max(posicionY, altoContenedor - altoImagen), 0);
        } else {
            posicionY = 0;
        }

        aplicarTransformacion();
    }

    // Función para hacer zoom
    function hacerZoom(factor, centroX, centroY) {
        const rect = mapaContenedor.getBoundingClientRect();
        const mouseX = centroX - rect.left;
        const mouseY = centroY - rect.top;

        // Calcular la posición relativa del centro antes del zoom
        const offsetX = (mouseX - posicionX) / escala;
        const offsetY = (mouseY - posicionY) / escala;

        // Aplicar el factor de zoom
        escala += factor;

        // Limitar el zoom mínimo y máximo
        escala = Math.min(Math.max(1, escala), 3);

        // Calcular la nueva posición para mantener el zoom centrado
        posicionX = mouseX - offsetX * escala;
        posicionY = mouseY - offsetY * escala;

        // Limitar el movimiento de la imagen
        limitarMovimiento();

        // Habilitar barras de desplazamiento si el contenido es más grande que el contenedor
        if (escala > 1) {
            mapaContenedor.style.overflow = 'auto';
        } else {
            mapaContenedor.style.overflow = 'hidden';
            posicionX = 0;
            posicionY = 0;
            aplicarTransformacion();
        }
    }

    // Evento para el botón de zoom in
    zoomInButton.addEventListener('click', () => {
        hacerZoom(0.1, mapaContenedor.clientWidth / 2, mapaContenedor.clientHeight / 2);
    });

    // Evento para el botón de zoom out
    zoomOutButton.addEventListener('click', () => {
        hacerZoom(-0.1, mapaContenedor.clientWidth / 2, mapaContenedor.clientHeight / 2);
    });

    // Zoom con la rueda del mouse
    mapaContenedor.addEventListener('wheel', (event) => {
        event.preventDefault();

        const factor = 0.1;
        const delta = event.deltaY;

        if (delta < 0) {
            hacerZoom(factor, event.clientX, event.clientY); // Zoom in
        } else {
            hacerZoom(-factor, event.clientX, event.clientY); // Zoom out
        }
    });

    // Arrastre con clic sostenido
    mapaContenedor.addEventListener('mousedown', (event) => {
        if (escala > 1) { // Solo permitir arrastre si hay zoom
            event.preventDefault(); // Evita comportamiento no deseado
            arrastrando = true;
            inicioX = event.clientX - posicionX;
            inicioY = event.clientY - posicionY;
            mapaInteractivo.style.cursor = 'grabbing'; // Cursor de agarre activo
        }
    });

    mapaContenedor.addEventListener('mousemove', (event) => {
        if (arrastrando) {
            posicionX = event.clientX - inicioX;
            posicionY = event.clientY - inicioY;
            limitarMovimiento();
        }
    });

    // Usar document para asegurar que el evento siempre se captura
    document.addEventListener('mouseup', () => {
        if (arrastrando) {
            arrastrando = false;
            mapaInteractivo.style.cursor = 'grab'; // Restaurar cursor a estado inactivo
        }
    });

    // Restaurar cursor al salir del contenedor
    mapaContenedor.addEventListener('mouseleave', () => {
        if (!arrastrando) {
            mapaInteractivo.style.cursor = 'auto';
        }
    });

    // Cambiar cursor a manito de agarre cuando se pasa sobre el mapa con zoom
    mapaContenedor.addEventListener('mouseenter', () => {
        if (escala > 1 && !arrastrando) {
            mapaInteractivo.style.cursor = 'grab';
        }
    });

    // Gestos táctiles para zoom y arrastre
    mapaContenedor.addEventListener('touchstart', (event) => {
        if (event.touches.length === 2) { // Dos dedos para hacer zoom
            event.preventDefault();
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            distanciaInicial = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        } else if (event.touches.length === 1 && escala > 1) { // Un dedo para arrastrar
            event.preventDefault();
            arrastrando = true;
            const touch = event.touches[0];
            inicioX = touch.clientX - posicionX;
            inicioY = touch.clientY - posicionY;
        }
    });

    mapaContenedor.addEventListener('touchmove', (event) => {
        if (event.touches.length === 2) { // Zoom con dos dedos
            event.preventDefault();
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const distanciaActual = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (distanciaInicial !== null) {
                const factor = (distanciaActual - distanciaInicial) * 0.01;
                const centroX = (touch1.clientX + touch2.clientX) / 2;
                const centroY = (touch1.clientY + touch2.clientY) / 2;
                hacerZoom(factor, centroX, centroY);
                distanciaInicial = distanciaActual;
            }
        } else if (event.touches.length === 1 && arrastrando) { // Arrastre con un dedo
            event.preventDefault();
            const touch = event.touches[0];
            posicionX = touch.clientX - inicioX;
            posicionY = touch.clientY - inicioY;
            limitarMovimiento();
        }
    });

    mapaContenedor.addEventListener('touchend', (event) => {
        distanciaInicial = null;
        arrastrando = false;

        // Detectar toques en los puntos de interés
        if (event.changedTouches.length === 1) {
            const touch = event.changedTouches[0];
            const elemento = document.elementFromPoint(touch.clientX, touch.clientY);
            if (elemento && elemento.classList.contains('punto')) {
                elemento.click(); // Simular clic en el punto de interés
            }
        }
    });


    // Mostrar el modal con la información del punto
    puntos.forEach(punto => {
        punto.addEventListener('click', () => {
            modalImagen.src = punto.getAttribute('data-imagen'); // Cargar la imagen
            modalTexto.textContent = punto.getAttribute('data-texto'); // Cargar el texto
            modal.style.display = 'block'; // Mostrar el modal
        });
    });

    // Ocultar el modal al hacer clic en el botón de cerrar
    cerrarModal.addEventListener('click', () => {
        modal.style.display = 'none'; // Ocultar el modal
    });

    // Ocultar el modal al hacer clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none'; // Ocultar el modal
        }
    });
});