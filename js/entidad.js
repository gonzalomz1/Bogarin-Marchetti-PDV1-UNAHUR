// entidad.js
class Entidad {
    constructor(juego, world, app, x, y) {
        this.juego = juego;
        this.world = world;
        this.app = app;
        this.x = x;
        this.y = y;
        this.id = generarID();
        //this.container = new PIXI.Container();
        //this.app.stage.addChild(this.container);
        this.puedeRecibirDanio = true;
        this.tiempoEsperaDanio = 500;

        // Crear sprite para PixiJS y cuerpo fisico en Matter.js
        this.sprite = null;
        this.setearCuerpoEnMatter();
    }

    setearCuerpoEnMatter() {
        this.body = Matter.Bodies.rectangle(this.x, this.y, 32, 32);
        Matter.Body.setInertia(this.body, Infinity);
        Matter.World.add(this.world, this.body);
    }

    aplicarKnockback(fuerzaKnockback, direccionNormalizada) {
        setTimeout(() => {
            Matter.Body.applyForce(
                this.body,
                this.body.position,
                {
                    x: direccionNormalizada.x * fuerzaKnockback,
                    y: direccionNormalizada.y * fuerzaKnockback
                }
            );
        }, 10);
    }

    destruir() {
        Matter.World.remove(this.world, this.body);
        this.sprite.destroy({ children: true, texture: true, baseTexture: true });
    }

    update() {
        if (this.sprite != null) {
            this.sprite.x = this.body.position.x;
            this.sprite.y = this.body.position.y;
        }
    }
}

// fin entidad.js