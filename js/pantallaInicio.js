// Clase PantallaInicio que extiende de Objeto
class PantallaInicio {
    constructor(juego, inputManager) {
        this.juego = juego;
        this.cargadorRecursos = juego.cargadorRecursos;
        this.inputManager = inputManager; // Administrador de inputs
        this.sprite = null; // Inicializamos el sprite
        this.listo = false; // Indicador de que la pantalla está lista
    }

    activar() {
        const texturaAnimada =  this.cargadorRecursos.obtenerRecurso("PantallaInicio");
        this.sprite = new PIXI.AnimatedSprite(
            texturaAnimada.animations["PantallaInicio"]
        );
        this.sprite.animationSpeed = 0.1;
        this.sprite.loop = true;
        this.sprite.play();
        this.juego.app.stage.addChild(this.sprite);

        // Activa los controles de la pantalla de inicio
        this.inputManager.registrarContexto("pantallaInicio", {
            manejarTecla: (e, presionada) => {
                if (presionada) this.manejarInput(e.key);
            },
        });
        this.inputManager.cambiarContexto("pantallaInicio");
        console.log("Pantalla de inicio activada. Presiona Enter para iniciar.");
    }

    comenzar() {
        console.log('borrando pantalla de carga...');
        this.juego.app.stage.removeChild(this.sprite);
        this.juego.comenzarJuego();
    }

    manejarInput(tecla) {
        // Manejo del input del jugador
        if (tecla === "Enter") {
            console.log("Iniciando juego...");
            // Aquí podrías emitir un evento para cambiar de pantalla o estado del juego
            this.listo = false; // Desactivamos la pantalla de inicio
            this.comenzar(); // Eliminamos esta pantalla del escenario
        }
    }
}