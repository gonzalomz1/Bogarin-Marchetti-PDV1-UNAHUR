// particulasXP.js
class ParticulaXP extends Boid {
    constructor (x, y, app) {
        super(x, y); // Reutilizamos la logica del Boid para la particula
        this.app = app;
        this.puedeSerAbsorbida = true;
        
        // Crear el sprite 4x4 con PixiJS
        this.sprite = new PIXI.Graphics();
        this.sprite.beginFill(0xFFFF00); // Color amarillo para XP
        this.sprite.drawRect(0, 0, 4, 4); // Tamaño 4x4
        this.sprite.endFill();
        this.sprite.x = x;
        this.sprite.y = y;
        this.app.stage.addChild(this.sprite);
    }

    // Actualizamos la posicion del sprite en cada ciclo
    update(){
        super.update(); // Reutilizamos el movimiento del Boid
        this.sprite.x = this.posicion.x;
        this.sprite.y = this.posicion.y;
    }

    // Eliminar la particula del escenario
    destruir(app) {
        app.stage.removeChild(this.sprite);
    }
}

// fin particulasXP.js