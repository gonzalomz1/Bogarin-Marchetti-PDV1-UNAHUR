class Tutorial {
    constructor(juego) {
        this.juego = juego;
        this.cargadorRecursos = this.juego.cargadorRecursos;
        this.inputManager = juego.inputManager;
        this.sprite = null;
        this.listo = false
        this.activar();
    }

    activar() {
        const imagenTuto = this.cargadorRecursos.obtenerRecurso("PNG_TUTORIAL");
        this.sprite = new PIXI.Sprite(imagenTuto);
        this.juego.gameContainer.addChild(this.sprite);
        console.log(this.sprite);
        this.inputManager.registrarContexto("tutorial", {
            manejarTecla: (e, presionada) => {
                if (presionada) this.manejarInput(e.key);
            },
        });
        this.inputManager.cambiarContexto("tutorial");
    }

    iniciarJuego() {
        console.log(this.juego.app.stage);
        this.juego.gameContainer.removeChildren();
        console.log(this.juego.app.stage);
        this.juego.comenzarJuego();
        this.listo = true;
    }

    manejarInput(tecla) {
        // Manejo del input del jugador
        if (tecla === "Enter") {
            console.log("Iniciando juego...");
            this.iniciarJuego();
        }
    }

}