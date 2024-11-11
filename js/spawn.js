// spawn.js
class SpawnPoint {
    constructor(world, app, x, y, ancho = 20, alto = 20){
       this.world = world;
       this.app = app;
       this.x = x;
       this.y = y;
       this.ancho = ancho;
       this.alto = alto;

       this.rectangulo = new PIXI.Graphics();
       this.rectangulo.beginFill(0xFF69B4); // Color rosado
       this.rectangulo.drawRect(0, 0, this.ancho, this.alto);
       this.rectangulo.endFill();
       this.rectangulo.x = this.x;
       this.rectangulo.y = this.y;
       this.app.stage.addChild(this.rectangulo);
    }

    spawnEnemigoMelee() {
        const enemigoMelee = new EnemigoMelee(this.world, this.app, this.x, this.y);
        return enemigoMelee;
    }

    spawnEnemigoVolador() {
        const enemigoVolador = new EnemigoVolador(this.world, this.app, this.x, this.y);
        return enemigoVolador;
    }
}

// fin spawn.js