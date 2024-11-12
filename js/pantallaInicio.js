class PantallaInicio {
    constructor(app, inputManager){
        this.app = app;
        this.inputManager = inputManager;
        this.sprite = null;
        this.crearPantalla();
    }

    crearPantalla(){
        const texturaInicio = obtenerRecurso('pantallaInicio');
        if (texturaInicio){
            this.sprite = new PIXI.Sprite(texturaInicio);
            this.sprite.anchor.set(0.5);
            this.sprite.x = this.app.view.width / 2;
            this.sprite.y = this.app.view.height / 2;
            this.app.stage.addChild(this.sprite);
        } else{
            console.error("La textura de la pantalla de inicio no se cargo correctamente")
        }
    }

    activar(){
        this.inputManager.registrarContexto('pantallaInicio', {
            manejarTecla: (e, presionada) => {
                if (presionada) {
                    this.manejarInput(e.key);
                }
            }
        });
        this.inputManager.cambiarContexto('pantallaInicio');
    }
}