class Boid {
    constructor(x, y, velocidadMax = 2, fuerzaMax = 0.03) {
        this.posicion = {x, y}; // Posicion actual del Boid
        this.velocidad = {
            x: Math.random() * 2 - 1, 
            y: Math.random() * 2 - 1
             // Direccion inicial aleatoria
        };
        this.aceleracion = { x: 0, y: 0}; // Aceleracion acumulativa
        this.velocidadMax = velocidadMax; // Maxima velocidad
        this.fuerzaMax = fuerzaMax; // Maxima fuerza de aceleracion
    }

    // Metodo para actualizar la posicion del boid en cada ciclo del juego
    update() {
        this.velocidad.x += this.aceleracion.x;
        this.velocidad.y += this.aceleracion.y;

        // Limitar la velocidad maxima
        const mag = Math.sqrt(this.velocidad.x ** 2 + this.velocidad.y ** 2);
        if (mag > this.velocidadMax) {
            this.velocidad.x = (this.velocidad.x / mag ) * this.velocidadMax;
            this.velocidad.y = (this.velocidad.y / mag ) * this.velocidadMax;
        }

        // Actualizar posicion
        this.posicion.x += this.velocidad.x;
        this.posicion.y += this.velocidad.y;

        // Resetear aceleracion para el proximo ciclo
        this.aceleracion.x = 0;
        this.aceleracion.y = 0;
    }

    // Metodo para aplicar una fuerza al Boid
    aplicarFuerza(fuerza) {
        this.aceleracion.x += fuerza.x;
        this.aceleracion.y += fuerza.y;
    }
}