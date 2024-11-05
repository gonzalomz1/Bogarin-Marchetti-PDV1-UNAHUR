class EnemigoVolador extends Enemigo {
    constructor(world, app, x, y) {
        super(world, app, x, y);
        this.sprite.clear();
        this.sprite.beginFill(0xFFA500);
        this.sprite.drawRect(-16, -16, 32, 32);
        this.sprite.endFill();
        // Anular la gravedad del cuerpo fisico
        Matter.Body.set(this.body, {gravityScale: 0});
        this.amplitud = 60;
        this.velocidadOrbita = 0.001;
        this.tiempoDisparo = 2000;
        this.distanciaMinimaAlPlayer = 600;
        this.ultimaVezDisparo = Date.now();
    }

    orbitarJugador() {
        const jugador = detectarJugador();
        const tiempo = this.app.ticker.lastTime;
        const distanciaX = Math.cos(tiempo * this.velocidadOrbita) * this.amplitud;
        const distanciaY = Math.sin(tiempo * this.velocidadOrbita) * this.amplitud;

        Matter.Body.setPosition(this.body, {
            x: jugador.sprite.x + distanciaX,
            y: jugador.sprite.y + distanciaY
        });
    }

    lanzarProyectil(){
        const jugador = detectarJugador();
        if (Date.now() - this.ultimaVezDisparo > this.tiempoDisparo) {
            const proyectil = new Proyectil(this.app, this.sprite.x, this.sprite.y, jugador.sprite.x, jugador.sprite.y);
            this.app.stage.addChild(proyectil.sprite);
            this.ultimaVezDisparo = Date.now();
        }
    }

    // Sobreescribir update para emular movimiento flotante
    update(){
       this.orbitarJugador();
       this.lanzarProyectil();
       super.update();
    }
}