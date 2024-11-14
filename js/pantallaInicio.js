class PantallaInicio {
    constructor(app, inputManager){
        this.app = app;
        this.inputManager = inputManager;
        this.sprite = null;
        this.crearPantalla();
    }

    crearPantalla(){
        PIXI.Loader.shared
        .add('pantallaInicio', './assets/PantallaInicio/pantallaInicio.png')
        .add('pantallaInicioData', './assets/PantallaInicio/PantallaInicio.json')
        .load((loader, resources) => {
            const texturaInicio = resources.pantallaInicio.texture;
            if (texturaInicio) {
                this.sprite = new PIXI.Sprite(texturaInicio);
                this.sprite.anchor.set(0.5);
                this.sprite.x = this.app.view.width / 2;
                this.sprite.y = this.app.view.height / 2;
                this.app.stage.addChild(this.sprite);
              } else {
                console.error('La textura de la pantalla de inicio no se cargo correctamente')
              }
        });
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

    manejarInput(tecla) {
        if (tecla === 'Enter') {
            console.log('Iniciando juegoooooo')
        }
    }
}