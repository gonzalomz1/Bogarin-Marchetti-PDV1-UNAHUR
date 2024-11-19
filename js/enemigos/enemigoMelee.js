// enemigoMelee.js
class EnemigoMelee extends Enemigo {
    constructor(juego, world, app, x, y) {
        super(juego, world, app, x, y);
        this.lista_enemigos = ["JSON_ENEM_HAMBUR"];
        this.sprite = this.cargarSpriteParaPixi();
        this.rectBounds = this.sprite.getBounds();
    }

    cargarSpriteParaPixi(){
        const index = this.lista_enemigos[Math.floor(Math.random() * this.lista_enemigos.length)];
        const json = this.juego.cargadorRecursos.obtenerRecurso(index);
        this.sprite = new PIXI.AnimatedSprite(json.animations[index]);
        this.sprite.anchor.set(0.5);
        this.sprite.animationSpeed = 0.1;
        this.sprite.loop = true;
        this.sprite.play();
        this.container.addChild(this.sprite);
        this.juego.gameContainer.addChild(this.container);
        return this.sprite;
    }
    update() {
        super.update();
    }
}

// fin enemigoMelee.js