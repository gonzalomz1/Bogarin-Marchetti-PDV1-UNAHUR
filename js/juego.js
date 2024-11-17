// juego.js
class Juego {
    constructor() {
        // Inicializar la aplicacion PixiJS
        this.contadorDeFrame = 0;
        this.ancho = 1280;
        this.alto = 720;
        this.cargadorRecursos = new CargadorRecursos;
        this.app = new PIXI.Application();
        let promesa = this.app.init({ width: this.ancho, height: this.alto });
        this.inputManager = new InputManager;
        this.inputManager.iniciar();
        this.nivel = null;
        this.jugador = null;

        promesa.then((e) => {
            document.body.appendChild(this.app.view);
            this.engine = Matter.Engine.create();
            asignarEngineActual(this.engine);
            this.world = this.engine.world;
            asignarWorldActual(this.world);
            this.inicializarRenderDeMatter();
            this.iniciarJuego();
        });
    }

    async iniciarJuego() {
        // Precargar todos los recursos
        console.log("Cargando recursos ", LISTA_RECURSOS);
        await this.cargadorRecursos.precargarRecursos(LISTA_RECURSOS);
        // Una vez precargados, inicializar el juego
        console.log("Recursos cargados. Iniciando el juego...");
        this.iniciarPantallaInicio();
    }

    inicializarRenderDeMatter() {
        let render = Matter.Render.create({
            element: document.body,
            engine: this.engine,
            options: {
                wireframes: true
            }
        });
        Matter.Render.run(render);
    }

    iniciarPantallaInicio() {
        this.pantallaInicio = new PantallaInicio(this, this.inputManager)
        this.pantallaInicio.activar();
    }

    comenzarJuego() {
        console.log('comenzando el juego ....');
        this.app.ticker.add(() => {
            this.gameLoop();
        });
        this.nivel = new Nivel(this, this.world, this.app, this.alto, this.ancho);
        this.jugador = new Jugador(this, this.world, this.app, this.alto, this.ancho, this.inputManager);
        hacerJugadorVariableGlobal(this.jugador);
        modificarNivelActual(this.nivel);
    }

    gameLoop() {
        this.contadorDeFrame++;
        Matter.Engine.update(this.engine, 1000 / 60); // Actualizar el motor de fisica
        if (this.jugador != null) this.jugador.update(); // Actualizar el jugador
        if (this.nivel != null) this.nivel.update(); // Actualizar el nivel

    };

    mostrarProgreso(e) {
        console.log(e.progress);
    }

    reportarError(e) {
        console.log("ERROR: " + e.message);
    }

    terminoCarga(e) {
        console.log("TERMINO DE CARGAR!");
    }

    eventosMatterJugador() {
        Matter.Events.on(engine, 'collisionStart', (e) => {
            jugador.detectarColisiones(e.pairs);
        });
        Matter.Events.on(engine, 'collisionEnd', (e) => {
            jugador.detectarFinColision(e.pairs);
        });
    }
}

// fin juego.js