// proyectil.js
class Proyectil {
    constructor(app, xInicial, yInicial, xObjetivo, yObjetivo){
        this.app = app;
        this.sprite = new PIXI.Graphics();
        this.sprite.beginFill(0xFF0000); // Color rojo para el proyectil
        this.sprite.drawCircle(0, 0, 5);
        this.sprite.endFill();

        this.sprite.x = xInicial;
        this.sprite.y = yInicial;

        // Calcular direccion y velocidad hacia el objetivo
        const direccion = normalizar({x: xObjetivo - xInicial, y: yObjetivo - yInicial});
        this.velocidad = 3;
        this.velocidadX = direccion.x * this.velocidad;
        this.velocidadY = direccion.y * this.velocidad;
    }

    // Actualizar posicion del proyectil
    update(){
        this.sprite.x += this.velocidadX;
        this.sprite.y += this.velocidadY;
        
        if (this.sprite.x < 0 || this.sprite.x > this.app.screen.width || this.sprite.y < 0 || this.sprite.y > this.app.screen.height){
            this.destruir();
        }
    }

    destruir(){
        this.app.stage.removeChild(this.sprite);
        this.sprite.destroy();
    }
}

// fin proyectil.js