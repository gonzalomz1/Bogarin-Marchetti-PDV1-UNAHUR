// juego.js
class Juego{
    constructor(){
        // Inicializar la aplicacion PixiJS
        this.contadorDeFrame = 0;
        this.ancho =  1280;
        this.alto = 720;
        this.app = new PIXI.Application();
        
        let promesa = this.app.init({width: this.ancho, height: this.alto});

        promesa.then((e) => {        
            document.body.appendChild(this.app.view);

            this.precargarRecursos(this.app);

            this.engine = Matter.Engine.create();
            asignarEngineActual(this.engine);
            this.world = this.engine.world;
            asignarWorldActual(this.world);
            this.inicializarRenderDeMatter();

            this.inputManager = new InputManager;
            this.inputManager.iniciar();

            // Bucle del juego. Se agrega al ticker (bucle) de PixiJS.
            this.app.ticker.add(() => {
                this.gameLoop();
            });
        });
    }

    inicializarRenderDeMatter(){
        let render = Matter.Render.create({
            element: document.body,
            engine: this.engine,
            options: {
                wireframes: true
            }
        });
        Matter.Render.run(render);
    }

    gameLoop(){
        this.contadorDeFrame++;
        Matter.Engine.update(this.engine, 1000 / 60); // Actualizar el motor de fisica
        this.jugador.update(); // Actualizar el jugador
        this.nivel.update(); // Actualizar el nivel
    };

    precargarRecursos(app){
        // precargar recursos
        app.loader.add("pantallaInicioTextura", "./assets/pantallaInicio.png")
        .add("pantallaInicioData", "./assets/pantallaInicio.json")

        app.loader.onProgress.add(this.mostrarProgreso());
        app.loader.onComplete.add(this.reportarError());
        app.loader.onError.add(this.terminoCarga());

        app.loader.load();
    }

    mostrarProgreso(e){
        console.log(e.progress);
    }

    reportarError(e){
        console.log("ERROR: " + e.message);
    }

    terminoCarga(e){
        console.log("TERMINO DE CARGAR!");
    }


}

// fin juego.js