// enemigo.js
class Enemigo extends Entidad {
    constructor(juego, world, app, x, y) {
        super(juego, world, app, x, y);
        this.juego = juego;
        this.world = world;
        this.app = juego.app;
        this.x = x;
        this.y = y;
        this.container = new PIXI.Container();
        this.tipo = 'test';
        this.puedePerseguir = false;
        this.recibiendoDanio = false;
        this.velocidad = 0.75; // Velocidad de movimiento del enemigo
        this.vida = 3;
        this.danio = 1;
        this.setCuerpoMatter();
        this.estadoActual = 'noPersigue';
    }

    actualizarEstado() {
        switch (this.estadoActual) {
            case 'noPersigue':
                this.noPersigue();
                break;
            case 'Persigue':
                this.Persigue();
                break;
            case 'recibeDanio':
                this.recibeDanio();
                break;
            case 'muriendo':
                this.muriendo();
                break;
        }
    }

    noPersigue() {
        if (!this.puedePerseguir) {
            this.estadoActual = 'noPersigue';
        } else {
            this.cambiarEstado('Persigue');
        }
    }

    Persigue() {
        if (this.puedePerseguir) {
            this.estadoActual = 'Persigue';
            this.perseguirJugador();
        } else {
            this.cambiarEstado('noPersigue');
        }
    }

    recibeDanio() {
        if (this.recibiendoDanio) {
            this.estadoActual = 'recibeDanio';
        } else {
            this.cambiarEstado('Persigue');
        }
    }

    muriendo() {
        if (this.vida <= 0) {
            this.estadoActual = 'muriendo';
        }
    }

    cambiarEstado(nuevoEstado) {
        this.estadoActual = nuevoEstado;
    }

    // Logica de persecucion hacia el jugador
    perseguirJugador() {
        const jugador = encontrarCuerpoJugador(this.world);

        if (!jugador.entidad.recibiendoDanio) {
            const direccion = {
                x: jugador.position.x - this.body.position.x,
                y: jugador.position.y - this.body.position.y
            };
            const direccionNormalizada = normalizar(direccion);
            // Aplicar movimiento en direccion al jugador
            Matter.Body.setVelocity(this.body, {
                x: direccionNormalizada.x * this.velocidad,
                y: direccionNormalizada.y * this.velocidad
            });
        }
    }


    setCuerpoMatter() {
        Matter.Body.set(this.body, {
            label: 'enemigo',
            tipo: this.tipo,
            entidad: this
        });
    }

    chequearColisionesDelEnemigo() {
        const contactos = Matter.Query.collides(this.body, world.bodies);
        const colisionesValidas = contactos.filter(contacto => contacto.bodyA.id !== contacto.bodyB.id);
        colisionesValidas.forEach((colision) => {
            const { bodyA, bodyB } = colision;
            const otroCuerpo = bodyA === this.body ? bodyB : bodyA;
            if (otroCuerpo.label === 'suelo') {
                this.puedePerseguir = true; // Solo activar si es una plataforma
            } else {
                this.puedePerseguir = false;
            }
        });
        if (colisionesValidas.length < 1) {
            this.puedePerseguir = false;
        }
    }

    esEnemigo() {
        return true;
    }

    recibirDanio(cantidad, direccionImpacto) {
        if (!this.puedeRecibirDanio) return; // Salir si no puede recibir daño
        this.cambiarEstado('recibeDanio');
        this.recibiendoDanio = true;
        this.vida -= cantidad;
        this.puedeRecibirDanio = false;
        this.puedePerseguir = false;
        this.aplicarKnockbackYVerificarVida(direccionImpacto, cantidad);
    }

    aplicarKnockbackYVerificarVida(direccionNormalizada, cantidad) {
        const fuerzaBase = 0.03;
        const multiplicador = (this.vida <= 0) ? 4 : 1;
        const fuerzaKnockback = cantidad * fuerzaBase * multiplicador;
        this.aplicarKnockback(fuerzaKnockback, direccionNormalizada);
        setTimeout(() => {
            if (this.vida <= 0) {
                console.log('Enemigo destruido')
                this.cambiarEstado('muriendo');
                this.generarParticulasXP();
                this.destruir();
            } else {
                this.puedeRecibirDanio = true;
                this.cambiarEstado('Persigue');
            }
        }, this.tiempoEsperaDanio);
    }

    generarParticulasXP() {
        const sistemaXP = new SistemaParticulasXP(this.app, 10, this.sprite.x, this.sprite.y);
        const nivelActual = detectarNivelActual();
        nivelActual.sistemasXP.push(sistemaXP); // Almacenar sistemas activos
    }

    destruir() {
        super.destruir();
        const nivelActual = detectarNivelActual();
        nivelActual.enemigos = nivelActual.enemigos.filter(enemigo => enemigo !== this);
    }

    update() {
        this.actualizarEstado();
        this.chequearColisionesDelEnemigo()
        super.update();
        this.rectBounds = this.sprite.getBounds();
    }
}
// fin enemigo.js