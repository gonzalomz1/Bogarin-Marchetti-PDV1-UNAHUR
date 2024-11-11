// enemigoMelee.js
class EnemigoMelee extends Enemigo {
    constructor(world, app, x, y) {
        super(world, app, x, y);
        this.sprite.beginFill(0xff0000);
        this.sprite.drawRect(-16, -16, 32, 32);
        this.sprite.endFill();
    }

    update() {
        super.update();
    }
}

// fin enemigoMelee.js