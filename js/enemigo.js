class Enemigo extends Entidad {
    constructor(world, app, x, y) {
        super(world, app, x, y);
        this.tipo = 'test';
        this.rectBounds = this.sprite.getBounds(); // Cachear bounds
        this.puedePerseguir = false;
        this.recibiendoDanio = false;
        this.velocidad = 0.75; // Velocidad de movimiento del enemigo
        this.vida = 3;
        this.danio = 1;
        this.setCuerpoMatter();
        this.estadoActual = 'noPersigue';
    }

    noPersigue() {
        if (!this.puedePerseguir) {
            this.estadoActual = 'noPersigue';
            console.log('Estado: ', this.estadoActual);
        } else {
            this.cambiarEstado('Persigue');
        }
    }

    Persigue() {
        if (this.puedePerseguir) {
            this.estadoActual = 'Persigue';
            this.perseguirJugador();
            console.log('Estado: ', this.estadoActual);
        } else {
            this.cambiarEstado('noPersigue');
        }
    }

    recibeDanio() {
        if (this.recibiendoDanio) {
            this.estadoActual = 'recibeDanio';
            console.log('Estado: ', this.estadoActual);
        } else {
            this.cambiarEstado('Persigue');
        }
    }

    muriendo() {
        if (this.vida <= 0) {
            this.estadoActual = 'muriendo';
            console.log('Estado: ', this.estadoActual);
        }
    }

    cambiarEstado(nuevoEstado) {
        this.estadoActual = nuevoEstado;
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

    // Logica de persecucion hacia el jugador
    perseguirJugador() {
        const jugador = detectarJugador();
        if (!jugador.recibiendoDanio) {
            const direccion = {
                x: jugador.sprite.x - this.sprite.x,
                y: jugador.sprite.y - this.sprite.y
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
        // Necesitamos saber si el enemigo esta colisionando con el suelo o con otro enemigo
        const contactos = Matter.Query.collides(this.body, world.bodies);
        if (contactos.some(contacto => contacto.bodyA.label === 'suelo' || contacto.bodyB.label === 'suelo')) {
            this.puedePerseguir = true;
        } else {
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