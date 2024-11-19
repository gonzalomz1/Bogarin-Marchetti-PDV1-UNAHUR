// sistemaBoids.js
class SistemaBoids {
    constructor(cantidad, ancho, alto) {
        this.boids = [];
        this.ancho = ancho;
        this.alto = alto;

        // Crear Boids iniciales en posiciones aleatorias
        for (let i = 0; i < cantidad; i++) {
            const x = Math.random() * ancho;
            const y = Math.random() * alto;
            this.boids.push(new Boid(x, y));
        }
    }


    // Aplicar todas las reglas de Boids a cada entidad
    aplicarReglas(jugador) {
        this.boids.forEach((boid) => {
            const separacion = this.separacion(boid);
            const alineacion = this.alineacion(boid);
            const cohesion = this.cohesion(boid);
            const atraccion = this.atraccion(jugador, boid);

            // Aplicar las fuerzas calculadas al Boid
            boid.aplicarFuerza(separacion);
            boid.aplicarFuerza(alineacion);
            boid.aplicarFuerza(cohesion);
            boid.aplicarFuerza(atraccion);

            // Actualizar la posicion del Boid
            boid.update();
        });
    }

    // Regla de Separacion: Evitar que los Boids se amontonen
    separacion(boid) {
        let fuerza = { x: 0, y: 0 };
        let conteo = 0;

        this.boids.forEach((otro) => {
            const distancia = this.distancia(boid, otro);
            if (distancia > 0 && distancia < 25) { // Distancia minima
                fuerza.x += boid.posicion.x - otro.posicion.x;
                fuerza.y += boid.posicion.y - otro.posicion.y;
                conteo++;
            }
        });

        if (conteo > 0) {
            fuerza.x /= conteo;
            fuerza.y /= conteo;
        }

        return this.normalizar(fuerza, boid.fuerzaMax);
    }

    // Regla de Alineacion: Moverse en la misma direccion que los vecinos
    alineacion(boid) {
        let velocidadPromedio = { x: 0, y: 0 };
        let conteo = 0;

        this.boids.forEach((otro) => {
            const distancia = this.distancia(boid, otro);
            if (distancia > 0 && distancia < 50) { // Radio de influencia
                velocidadPromedio.x += otro.velocidad.x;
                velocidadPromedio.y += otro.velocidad.y;
                conteo++;
            }
        });

        if (conteo > 0) {
            velocidadPromedio.x /= conteo;
            velocidadPromedio.y /= conteo;
        }

        return this.normalizar(velocidadPromedio, boid.fuerzaMax);
    }

    // Regla de Cohesion: Mantener cerca del grupo
    cohesion(boid) {
        let centro = { x: 0, y: 0 };
        let conteo = 0;

        this.boids.forEach((otro) => {
            const distancia = this.distancia(boid, otro);
            if (distancia > 0 && distancia < 50) { // Radio de cohesion
                centro.x += otro.posicion.x;
                centro.y += otro.posicion.y;
                conteo++;
            }
        });

        if (conteo > 0) {
            centro.x /= conteo;
            centro.y /= conteo;

            // Calcular vector hacia el centro
            centro.x -= boid.posicion.x;
            centro.y -= boid.posicion.y;
        }

        return this.normalizar(centro, boid.fuerzaMax);
    }

    // Atraccion hacia el objetivo
    atraccion(objetivo, boid) {
        const fuerza = {
            x: objetivo.sprite.x - boid.posicion.x,
            y: objetivo.sprite.y - boid.posicion.y
        };
        return fuerza; //this.normalizar(fuerza, boid.fuerzaMax);
    }

    // Calcular la distancia entre dos puntos
    distancia(a, b) {
        return Math.sqrt((a.posicion.x - b.posicion.x) ** 2 + (a.posicion.y - b.posicion.y) ** 2);
    }

    // Normalizar un vector a una magnitud especifica
    normalizar(vector, magnitudMax) {
        const mag = Math.sqrt(vector.x ** 2 + vector.y ** 2);
        if (mag > 0) {
            const nuevaMagnitud = Math.max(mag, 0.5);
            vector.x = (vector.x / nuevaMagnitud) * magnitudMax;
            vector.y = (vector.y / nuevaMagnitud) * magnitudMax;
        }

        return vector;
    }

}

// fin sistemaBoids.js