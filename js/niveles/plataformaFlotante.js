class PlataformaFlotante {
    constructor(juego, world, app, nivel, x, y, ancho, alto) {
        this.juego = juego;
        this.world = world;
        this.app = app;
        this.nivel = nivel;
        this.x = x + 100;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
        this.cargadorRecursos = this.juego.cargadorRecursos;



        this.plataformaMatter = this.crearCuerpoEnMatter();
        this.plataformaPixi = this.cargarTexturaEnPixi();
        this.agregarANivelActual();

        this.estadoActual = 'Activo';
    }

    cambiarEstado(nuevoEstado) {
        this.estadoActual = nuevoEstado;
        this.actualizarEstado();
    }

    actualizarEstado() {
        switch (this.estadoActual) {
            case 'Activo':
                break;
            case 'Destruyendo':
                this.iniciarAnimacion();
                break;
            case 'Destruido':
                this.eliminar();
                break;
        }
    }

    crearCuerpoEnMatter() {
        const plataforma = Matter.Bodies.rectangle(this.x, this.y, 96, 32, {
            isStatic: true,
            entidad: this,
            label: 'sueloFlotante'
        });
        Matter.World.add(this.world, plataforma);
        return plataforma;
    }

    cargarTexturaEnPixi() {
        const json = this.cargadorRecursos.obtenerRecurso("JSON_NIVEL_UNO_PLATAFORMA_FLOTANTE");
        const sprite = new PIXI.AnimatedSprite(
            json.animations["plataformaFlotante"]
        );
        sprite.anchor.set(0.5);
        sprite.x = this.x;
        sprite.y = this.y;
        return sprite;
    }

    agregarANivelActual() {
        this.nivel.levelActual.addChild(this.plataformaPixi);
        this.nivel.plataformas.push({ cuerpo: this.plataformaMatter, sprite: this.plataformaPixi });
    }

    iniciarAnimacion() {
        this.plataformaPixi.animationSpeed = 0.07;
        this.plataformaPixi.loop = false;
        this.plataformaPixi.play(); // Inicia la animación

        this.plataformaPixi.onComplete = () => {
            this.cambiarEstado("Destruido");
        };
    }

    eliminar() {
        // Eliminar el sprite de Pixi
        this.nivel.levelActual.removeChild(this.plataformaPixi);
        this.plataformaPixi.destroy();
        // Eliminar el cuerpo de Matter
        Matter.World.remove(this.world, this.plataformaMatter);
        // Eliminar la referencia de la lista de plataformas del nivel
        this.nivel.plataformas = this.nivel.plataformas.filter(
            (p) => p.cuerpo !== this.plataformaMatter
        );
        this.estadoActual = null; // Limpiar el estado
    }

}