// juego.js
class Juego {
    constructor() {
        this.contadorDeFrame = 0;
        this.ancho = 640;
        this.alto = 360;

        this.canvasAncho = ancho * 4;
        this.canvasAlto = alto * 4;

        this.cargadorRecursos = new CargadorRecursos;

        this.app = new PIXI.Application();
        let promesa = this.app.init({
            width: this.ancho,
            height: this.alto,
            resizeTo: window
        });
        this.inputManager = new InputManager;
        this.inputManager.iniciar();

        this.gameContainer = new PIXI.Container();
        this.app.stage.addChild(this.gameContainer);
        this.gameContainer.sortableChildren = true;

        this.hud = new PIXI.Container();
        this.hud.width = this.ancho;
        this.hud.height = this.alto;

        this.camara = null;
        this.nivel = null;
        this.jugador = null;
        this.zoomLevel = null;

        promesa.then((e) => {
            document.body.appendChild(this.app.view);
            window.addEventListener('resize', this.onResize.bind(this));
            //this.onResize(); // Llamar al resize al inicio
            this.app.stage.sortableChildren = true;
            this.engine = Matter.Engine.create();
            asignarEngineActual(this.engine);
            this.world = this.engine.world;
            asignarWorldActual(this.world);
            //this.inicializarRenderDeMatter();
            this.iniciarJuego();
        });
    }

    actualizarEscalas(nuevoAncho, nuevoAlto) {
        let escalaX
        let escalaY
        if (this.zoomLevel !== null) {
            escalaX = nuevoAncho / this.ancho * this.zoomLevel;
            escalaY = nuevoAlto / this.alto * this.zoomLevel;
        } else {
            escalaX = nuevoAncho / this.ancho;
            escalaY = nuevoAlto / this.alto;
        }

        this.gameContainer.scale.set(escalaX, escalaY);
        this.hud.scale.set(escalaX, escalaY);
    }

    onResize() {
        let nuevoAncho = window.innerWidth;
        let nuevoAlto = window.innerHeight;

        // Limitar el tamaño mínimo y máximo del canvas
        if (nuevoAncho > 1920) nuevoAncho = 1920;
        if (nuevoAlto > 1080) nuevoAlto = 1080;
        if (nuevoAncho < 1280) nuevoAncho = 1280;
        if (nuevoAlto < 720) nuevoAlto = 720;

        // Ajustar el tamaño del renderer de PIXI
        this.app.renderer.resize(nuevoAncho, nuevoAlto);

        // Calcular escalas para PIXI
        const escalaX = nuevoAncho / this.ancho;
        const escalaY = nuevoAlto / this.alto;

        this.actualizarEscalas(nuevoAncho, nuevoAlto);

        // Verificar que el mundo de Matter existe
        if (this.world) {
            // Escalar los límites del mundo de Matter.js
            this.world.bounds = {
                min: { x: 0, y: 0 },
                max: { x: nuevoAncho, y: nuevoAlto }
            };

            // Obtener los cuerpos del mundo
            const cuerpos = Matter.Composite.allBodies(this.world);

            // Verificar que existan cuerpos antes de escalarlos
            if (cuerpos.length > 0) {
                cuerpos.forEach(body => {
                    // Escalar el tamaño de los cuerpos
                    Matter.Body.scale(body, escalaX, escalaY);
                    // Ajustar las posiciones para que coincidan con la escala
                    Matter.Body.setPosition(body, {
                        x: body.position.x * escalaX,
                        y: body.position.y * escalaY
                    });
                });
            }
        }
        // Actualizar las dimensiones internas
        this.ancho = nuevoAncho;
        this.alto = nuevoAlto;
    }

    async iniciarJuego() {
        // Precargar todos los recursos
        console.log("Cargando recursos ", LISTA_RECURSOS);
        await this.cargadorRecursos.precargarRecursos(LISTA_RECURSOS);
        // Una vez precargados, inicializar el juego
        console.log("Recursos cargados. Iniciando el juego...");
        this.app.stage.addChild(this.gameContainer);
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

    // En cada etapa del juego, se le hace reSize()
    iniciarPantallaInicio() {
        PIXI.sound.add('musicaFondo', './assets/sonidos/musicaFondo/test01.wav');
        PIXI.sound.play('musicaFondo', {
            loop: true,
            volume: 0.05 // Volumen debe usar punto decimal
        });

        this.pantallaInicio = new PantallaInicio(this, this.inputManager)
        this.pantallaInicio.activar();
        //this.onResize();
    }

    iniciarTutorial() {
        this.tutorial = new Tutorial(this);
        this.tutorial.activar();
        //this.onResize();
    }

    comenzarJuego() {
        console.log('comenzando el juego ....');
        //this.zoomLevel = 1.4;
        this.nivel = new Nivel(this, this.world, this.app, this.alto, this.ancho);
        this.jugador = new Jugador(this, this.world, this.app, this.alto / 2, this.ancho / 2, this.inputManager);
        //this.onResize();
        modificarNivelActual(this.nivel);
        this.app.ticker.add(() => {
            this.gameLoop();
        });
    }

    gameLoop() {
        this.contadorDeFrame++;
        Matter.Engine.update(this.engine, 1000 / 60); // Actualizar el motor de fisica
        if (this.jugador != null) {
            this.jugador.update();
            this.moverCamara();
        } // Actualizar el jugador
        if (this.nivel != null) this.nivel.update(); // Actualizar el nivel
    };

    moverCamara() {
        let lerpFactor = 0.05;
        // Obtener la posición del protagonista
        const playerX = this.jugador.container.x;
        const playerY = this.jugador.container.y;
        // Calcular la posición objetivo del stage para centrar al protagonista
        const halfScreenWidth = this.app.screen.width / 2;
        const halfScreenHeight = this.app.screen.height / 2;

        const targetX = halfScreenWidth - playerX * this.gameContainer.scale.x;
        const targetY = halfScreenHeight - playerY * this.gameContainer.scale.y;

        // Aplicar el límite de 0,0 y el tamaño del nivel
        const maxOffsetX = -(this.ancho * this.gameContainer.scale.x - this.app.screen.width);
        const maxOffsetY = -(this.alto * this.gameContainer.scale.y - this.app.screen.height);

        // Aplicar el límite de 0,0 y canvasWidth, canvasHeight
        const clampedX = Math.min(Math.max(targetX, maxOffsetX), 0);
        const clampedY = Math.min(Math.max(targetY, maxOffsetY), 0);

        // Movemos el game container.
        this.gameContainer.x = lerp(
            this.gameContainer.x,
            clampedX,
            lerpFactor
        );
        this.gameContainer.y = lerp(
            this.gameContainer.y,
            clampedY,
            lerpFactor
        );
    }

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
            this.jugador.detectarColisiones(e.pairs);
        });
        Matter.Events.on(engine, 'collisionEnd', (e) => {
            this.jugador.detectarFinColision(e.pairs);
        });
    }
}
// fin juego.js