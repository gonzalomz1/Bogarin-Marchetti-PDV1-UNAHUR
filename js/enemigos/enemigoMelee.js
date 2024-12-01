// enemigoMelee.js
class EnemigoMelee extends Enemigo {
    constructor(juego, world, app, x, y) {
        super(juego, world, app, x, y);
        this.lista_enemigos = ["JSON_ENEM_HAMBUR"];
        this.sprite = this.cargarSpriteParaPixi();

        this.areaColision = new PIXI.Graphics();
        this.areaColision.beginFill(0xff0000, 0); // Invisible
        this.areaColision.drawRect(
            -this.sprite.width / 2,
            -this.sprite.height / 2,
            this.sprite.width,
            this.sprite.height
        );
        this.areaColision.endFill();
        
        // Crear un contenedor para el enemigo
        this.container = new PIXI.Container();
        this.container.addChild(this.areaColision);
        this.container.addChild(this.sprite);
        this.juego.gameContainer.addChild(this.sprite);

        // Establecer la posición inicial
        this.container.x = x;
        this.container.y = y;
        this.rectBounds = this.areaColision.getBounds();
    }


    cargarSpriteParaPixi() {
        const index = this.lista_enemigos[Math.floor(Math.random() * this.lista_enemigos.length)];
        const json = this.juego.cargadorRecursos.obtenerRecurso(index);
        this.sprite = new PIXI.AnimatedSprite(json.animations[index]);
        this.sprite.alpha = 1;
        this.sprite.anchor.set(0.5);
        this.sprite.animationSpeed = 0.1;
        this.sprite.loop = true;
        this.sprite.play();
        return this.sprite;
    }
    update() {
        super.update();
    }
}

// fin enemigoMelee.js