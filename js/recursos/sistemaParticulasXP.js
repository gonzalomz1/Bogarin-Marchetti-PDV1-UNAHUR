// sistemaParticulasXP.js
class SistemaParticulasXP extends SistemaBoids {
    constructor(app, cantidad, x, y) {
        super(cantidad, app.view.width, app.view.height); // Inicializamos el sistema Boids
        this.particulas = []; // Almacenar las particulas creadas
        this.app = app;
        // Crear las particulas alrededor del punto (x, y)
        for (let i = 0; i < cantidad; i++) {
            const offsetX = Math.random() * 20 - 10;
            const offsetY = Math.random() * 20 - 10;
            const particula = new ParticulaXP(x + offsetX, y + offsetY, app);
            this.particulas.push(particula);
            this.boids.push(particula); // Añadir al sistema Boids
        }

    }

    // Aplicar la logica Boids y actualizar todas las particulas
    update() {
        this.aplicarReglas(detectarJugador()); // Aplicar las reglas del sistema Boids
        // Actualizar cada particula individualmente
        this.particulas.forEach((particula) => {
            const distancia = this.calcularDistancia(detectarJugador(), particula);
            if (distancia < 8 && particula.puedeSerAbsorbida) {
                // Absorber particula cuando esta muy cerca del jugador
                this.absorberParticula(particula);
            } else if (distancia < 60) {
                // Orbitar si esta en el rango de orbita
                this.orbitarConAtraccion(particula, detectarJugador(), distancia);
            }
            particula.update(); // Actualizar posicion
        });
    }

    calcularDistancia(jugador, particula) {
        const dx = jugador.sprite.x - particula.posicion.x;
        const dy = jugador.sprite.y - particula.posicion.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    orbitarConAtraccion(particula, jugador, distancia) {
        // Aplicar fuerza de atraccion hacia el jugador con una orbita
        const fuerza = this.atraccion(detectarJugador(), particula);

        // Incrementar la fuerza si estan cerca del jugador
        const factor = Math.max(0.5, 1 - distancia / 60);
        fuerza.x *= factor;
        fuerza.y *= factor;

        particula.aplicarFuerza(fuerza);
    }

    absorberParticula(particula) {
        particula.puedeSerAbsorbida = false;
        console.log('Particula Absorbida')
        setTimeout(() => {
            particula.destruir(this.app);
        }, 1000);
    }

    // Eliminar todas las particulas una vez absorbidas
    destruirParticulas(app) {
        this.particulas.forEach((particula) => particula.destruir(app));
        this.particulas = [];
        this.boids = [];
    }
}

// fin sistemaParticulasXP.js