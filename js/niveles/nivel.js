// nivel.js
class Nivel {
    constructor(juego, world, app, alto, ancho) {
        this.juego = juego;
        this.world = world;
        this.app = app;
        this.alto = alto;
        this.ancho = ancho;
        this.spriteFondo = null;
        this.spritePlataformaBase = null;
        this.enemigos = [];
        this.sistemasXP = [];

        this.limiteIzquierdo = 0;
        this.limiteDerecho = 2700 ;
        
        this.levelActual = new PIXI.Container();
        this.indicarNivelActual(this);
        this.cargarFondo();

        this.plataformas = [];
        this.crearPlataformaBase();
        this.testPlataformaFlotante = this.crearPlataformaFlotante();
        this.pushearLevelActualAGameContainer();
        this.arrayDeSpawn = this.crearSpawnDeEnemigos();
        this.agregarEnemigos(1);
    }

    cargarFondo() {
        const texturaFondo = this.juego.cargadorRecursos.obtenerRecurso("PNG_NIVEL_UNO_FONDO");
        this.sprite = new PIXI.Sprite(texturaFondo);
        this.levelActual.addChild(this.sprite);
    }

    crearPlataformaBase() {
        // Plataforma en Matter
        const plataformaMatter = this.crearPlataformaEnMatter(this.ancho / 2, this.alto, 2500, 10, "suelo");
        // Plataforma en Pixi
        const plataformaSprite = this.cargarTexturaEnPixi(this.ancho / 2, this.alto);
        this.pushAListaDePlataformas(plataformaMatter, plataformaSprite);
    }

    crearPlataformaEnMatter(x, y, width, height, label_p) {
        const plataforma = Matter.Bodies.rectangle(x, y, width, height, {
            isStatic: true,
            label: label_p
        });
        Matter.World.add(this.world, plataforma);
        return plataforma;
    }

    cargarTexturaEnPixi(x, y) {
        const texturaPlataformaBase = this.juego.cargadorRecursos.obtenerRecurso("PNG_NIVEL_UNO_PLATAFORMA_BASE");
        this.sprite = new PIXI.Sprite(texturaPlataformaBase);
        this.sprite.anchor.set(0.5, 0.05);
        this.sprite.x = x;
        this.sprite.y = y;
        this.levelActual.addChild(this.sprite);
        return this.sprite;
    }

    pushAListaDePlataformas(plataformaMatter, plataformaSprite) {
        // Almacenar la referencia a la plataforma
        this.plataformas.push({ cuerpo: plataformaMatter, sprite: plataformaSprite });
    }

    pushearLevelActualAGameContainer() {
        this.juego.gameContainer.addChild(this.levelActual);
    }

    crearPlataformaFlotante() {
        let plataforma = new PlataformaFlotante(this.juego, this.world, this.app, this, this.ancho / 2, this.alto - 200, 1280, 100);
        plataforma.agregarANivelActual()
    }

    crearSpawnDeEnemigos() {
        let spawns = [];
        const spawn1 = new SpawnPoint(this.juego, this.world, this.app, this.ancho / 2 - 200, this.alto / 2 - 100);
        spawns.push(spawn1);
        const spawn2 = new SpawnPoint(this.juego, this.world, this.app, this.ancho / 2 + 200, this.alto / 2 - 100);
        spawns.push(spawn2);
        const spawn3 = new SpawnPoint(this.juego, this.world, this.app, this.ancho / 2 + 400, this.alto / 2 - 300);
        spawns.push(spawn3);
        const spawn4 = new SpawnPoint(this.juego, this.world, this.app, this.ancho / 2 - 400, this.alto / 2 - 300);
        return spawns;
    }

    agregarEnemigos(cantidad) {
        while (cantidad > 0) {
            const spawn = this.arrayDeSpawn[Math.floor(Math.random() * this.arrayDeSpawn.length)];
            const enemigo = spawn.spawnEnemigoMelee();
            this.enemigos.push(enemigo);
            cantidad--;
        }
    }

    indicarNivelActual(nivel) {
        modificarNivelActual(nivel);
    }

    verificarTeleport() {
        const jugadorX = this.juego.jugador.container.x;
        const escalaX = this.juego.gameContainer.scale.x;

        let limiteIzquierdo = this.limiteIzquierdo / escalaX;
        let limiteDerecho = this.limiteDerecho / escalaX;

        const jugador = encontrarCuerpoJugador(this.world)
        if (jugadorX < limiteIzquierdo) {
            console.log('teletransportando jugador a la derecha');
            Matter.Body.setPosition(jugador, { x: limiteDerecho, y: jugador.position.y});
        } else if (jugadorX > limiteDerecho) {
            console.log('teletransportando jugador a la izquierda');
            Matter.Body.setPosition(jugador, { x: limiteIzquierdo, y: jugador.position.y});
        }
    }

    update() {
        this.enemigos.forEach(enemigo => enemigo.update());
        this.sistemasXP.forEach(sistema => sistema.update(detectarJugador()));
        this.verificarTeleport();
    }


}

// fin nivel.js