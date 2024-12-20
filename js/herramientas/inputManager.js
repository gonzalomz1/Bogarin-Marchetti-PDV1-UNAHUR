// inputManager.js
class InputManager {
    constructor() {
        this.teclasPresionadas = {
            a: false,
            d: false,
            w: false,
            s: false,
            Shift: false
        };
        this.mouseMoviendose = false;
        this.mousePosicion = { x: 0, y: 0 };
        this.listeners = {};
        this.contextoActual

        this.teclasEspeciales = new Set(["Shift", "Enter", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
    }

    iniciar() {
        // Eventos de teclado
        window.addEventListener('keydown', (e) => this.manejarTecla(e, true));
        window.addEventListener('keyup', (e) => this.manejarTecla(e, false));
        // Eventos de mouse
        window.addEventListener('mousemove', (e) => this.manejarMouse(e));
        window.addEventListener('mousedown', (e) => this.manejarClick(e));
        console.log('inicializado input manager');
    }

    // Registra funciones de entrada para un contexto especifico (ejemplo: "juego" o "menu")
    registrarContexto(nombreContexto, funciones) {
        this.listeners[nombreContexto] = funciones;
        console.log('nuevo diccionario listeners: ', this.listeners);
    }

    // Cambia el contexto deseado
    cambiarContexto(nombreContexto) {
        this.contextoActual = this.listeners[nombreContexto];
    }

    manejarTecla(e, presionada) {
        // Normalizar la tecla a minúscula, salvo excepciones
        const teclaNormalizada = this.teclasEspeciales.has(e.key) ? e.key : e.key.toLowerCase();
        // Actualizar estado de teclas presionadas
        this.teclasPresionadas[teclaNormalizada] = presionada;
        // Llamar al manejador de contexto actual
        if (this.contextoActual && this.contextoActual.manejarTecla) {
            this.contextoActual.manejarTecla({ ...e, key: teclaNormalizada }, presionada);
        }
    }

    manejarMouse(e) {
        this.mouseMoviendose = true;
        this.mousePosicion = { x: e.clientX, y: e.clientY };
        if (this.contextoActual && this.contextoActual.manejarMouse) {
            this.contextoActual.manejarMouse(e);
        }
    }

    manejarClick(e) {
        if (this.contextoActual && this.contextoActual.manejarClick) {
            this.contextoActual.manejarClick(e);
        }
    }
}

// fin inputManager.js
