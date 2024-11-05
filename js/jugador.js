class Jugador extends Entidad {
    constructor(world, app, alto, ancho) {
        super(world, app, ancho / 2, alto / 2);

        // Seteamos el color del rectangulo verde
        this.sprite.clear();
        this.sprite.beginFill(0x00ff00);
        this.sprite.drawRect(-16, -16, 32, 32);
        this.sprite.endFill();

        // Atributos del jugador
        this.vida = 3;
        this.danio = 1;
        this.experiencia = 0;
        this.expParaSubirDeNivel = 10;
        this.nivel = 1;
        this.velocidadMovimientoBase = 2;
        this.velocidadMovimiento = 2;
        this.cooldownRecibiendoDanio = 1000;
        this.fuerzaSalto = -0.04;
        this.jugadorEnElSuelo

        // Dash y cooldown
        this.cooldownDash = false;
        this.dashActivo = false;
        this.tiempoCooldownDash = 3000; // 3 segundos
        this.tiempoDash = 200; // Duracion del dash en milisegundos
        this.tiempoUltimoDash = 0; // Cuando se hizo el ultimo dash
        this.distanciaBaseDash = 100;

        // Crear barra de cooldown para el dash
        this.barraCooldownDash = new PIXI.Graphics();
        this.barraCooldownDash.beginFill(0xff0000);
        this.barraCooldownDash.drawRect(20, 20, 100, 10); // Barra vacia
        this.barraCooldownDash.endFill();
        this.barraCooldownDash.maxWidth = 100; // Tamaño maximo de la barra
        this.app.stage.addChild(this.barraCooldownDash);

        // Velocidades y apuntado
        this.velocidadHorizontal = 0;
        this.direccion = { x: 0, y: 0 };
        this.mouseMoviendose = false;
        this.anguloApuntado = 0;
        this.ultimaPosMouse = { x: 0, y: 0 };
        this.colisionConEnemigo = false;
        this.recibiendoDanio = false;
        this.cooldownRecibiendoDanio = 1000;

        this.teclasPresionadas = {
            a: false,
            d: false,
            w: false,
            Shift: false
        };

        this.setupListeners();

        this.velocidadAtaque = 200;
        this.distanciaAtaque = 40;
        this.altoAtaque = 10;
        this.anchoAtaque = 40;
        this.crearAreaAtaque();
        this.puedeVerificarColision = true;
        console.log('vida del jugador: ', this.vida);
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => this.manejarMovimiento(e, true));
        window.addEventListener('keyup', (e) => this.manejarMovimiento(e, false));
        this.app.view.addEventListener('mousemove', (e) => {
            this.mouseMoviendose = true;
            this.apuntar(e);
        });
        this.app.view.addEventListener('mouseout', (e) => {
            this.mouseMoviendose = false;
            this.apuntar(e);
        });

        this.app.view.addEventListener('mousedown', (e) => this.atacar(e));
    }

    crearAreaAtaque() {
        this.areaAtaque = new PIXI.Graphics();
        this.areaAtaque.beginFill(0x0000FF);
        this.areaAtaque.drawRect(0, 0, this.altoAtaque, this.anchoAtaque); // Centramos el rectangulo
        this.areaAtaque.endFill();
        this.areaAtaque.visible = false; // Oculto por defecto
        this.app.stage.addChild(this.areaAtaque);
    }

    sincronizarAreaAtaque() {
        const distancia = this.distanciaAtaque;

        // Calcular la posicion del area de ataque respecto al puntero.
        const nuevaX = this.sprite.x + Math.cos(this.anguloApuntado) * distancia;
        const nuevaY = this.sprite.y + Math.sin(this.anguloApuntado) * distancia;

        // Interpolacion suave entre vertical y horizontal
        const anguloGrados = (this.anguloApuntado * 180) / Math.PI;
        const anguloNormalizado = (anguloGrados + 360) % 360;

        // Determinar la orientacion del area de ataque segun el angulo
        if ((anguloNormalizado >= 45 && anguloNormalizado <= 135) || (anguloNormalizado >= 225 && anguloNormalizado <= 315)) {
            // Orientacion horizontal (arriba o abajo)
            this.areaAtaque.width = this.anchoAtaque;
            this.areaAtaque.height = this.altoAtaque;
        } else {
            // Orientacion vertical (izquierda o derecha)
            this.areaAtaque.width = this.altoAtaque;
            this.areaAtaque.height = this.anchoAtaque;
        }

        // Actualizar la posicion del area de ataque.
        this.areaAtaque.x = nuevaX - this.areaAtaque.width / 2;
        this.areaAtaque.y = nuevaY - this.areaAtaque.height / 2;
    }

    manejarMovimiento(e, presionada) {
        // Movimiento con A/D y salto con W/Espacio, bajar con s
        switch (e.key) {
            case 'a':
            case 'A':
                this.teclasPresionadas.a = presionada;
                break;
            case 'd':
            case 'D':
                this.teclasPresionadas.d = presionada;
                break;
            case 'w':
            case 'W':
            case ' ':
                this.teclasPresionadas.w = presionada;
                break;
            case 's':
            case 'S':
                break;
            case 'Shift':
                if (presionada && !this.cooldownDash) this.iniciarDash();
                break;
        }
        this.actualizarVelocidad();
    }

    actualizarVelocidad() {
        // Si ambas teclas estan presionadas (A y D), no se mueve en el eje X
        if (this.teclasPresionadas.a && this.teclasPresionadas.d) {
            this.velocidadHorizontal = 0;
        } else if (this.teclasPresionadas.a) {
            this.velocidadHorizontal = -this.velocidadMovimiento;
        } else if (this.teclasPresionadas.d) {
            this.velocidadHorizontal = this.velocidadMovimiento;
        } else {
            this.velocidadHorizontal = 0;
        }

        // Solo saltar si W o espacio esta presionado y el jugador esta en el suelo
        if (this.teclasPresionadas.w) {
            this.saltar();
        }
    };

    saltar() {
        if (this.jugadorEnElSuelo && !this.colisionConEnemigo) {
            Matter.Body.applyForce(this.body, this.body.position, { x: 0, y: this.fuerzaSalto });
        } else {
            console.log('No puede saltar en este momento')
        }
    }

    iniciarDash() {
        if (this.velocidadHorizontal === 0) {
            console.log('No hay direccion para el dash');
            return;
        } else {
            if (Date.now() - this.tiempoUltimoDash > this.tiempoCooldownDash) {
                this.dashActivo = true;
                this.cooldownDash = true;
                this.tiempoUltimoDash = Date.now();

                let distanciaDash = this.velocidadHorizontal > 0 ? this.distanciaBaseDash : -this.distanciaBaseDash;

                Matter.Body.setPosition(this.body, {
                    x: this.body.position.x + distanciaDash,
                    y: this.body.position.y
                });

                // Desactivamos inmediatamente el dash
                this.dashActivo = false;
            }
        }
    }

    actualizarBarraCooldown() {
        const elapsed = Date.now() - this.tiempoUltimoDash;
        if (elapsed < this.tiempoCooldownDash) {
            const percentage = (elapsed / this.tiempoCooldownDash) * 100;
            this.barraCooldownDash.width = (percentage / 100) * this.barraCooldownDash.maxWidth;
        } else {
            this.cooldownDash = false; // Dash habilitado
            this.barraCooldownDash.width = this.barraCooldownDash.maxWidth;
        }
    }

    bajar() {
        console.log("Bajar plataforma");
        // Logica para bajar de la plataforma
    }

    apuntar(e) {
        // Calcular posicion del mouse en coordenadas del canvas
        const rect = this.app.view.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        // Calcular el angulo desde el jugador hacia el mouse
        const dx = mouseX - this.sprite.x;
        const dy = mouseY - this.sprite.y;
        this.anguloApuntado = Math.atan2(dy, dx); // Guardamos el angulo
        this.ultimaPosMouse = { x: mouseX, y: mouseY }; // Guardamos la ultima posicion del mouse
    }

    apuntarConUltimaPosicion() {
        const dx = this.ultimaPosMouse.x - this.sprite.x;
        const dy = this.ultimaPosMouse.y - this.sprite.y;

        this.anguloApuntado = Math.atan2(dy, dx); // Reutilizamos la ultima posicion conocida
    }

    atacar(e) {
        this.areaAtaque.visible = true;
        console.log('Ataque activado');
        setTimeout(() => {
            this.areaAtaque.visible = false;
        }, this.velocidadAtaque);
    }

    gameOver() {
        console.log('Game Over');
    }

    esSueloOEnemigo(body) {
        return body.label.startsWith('suelo') || body.label.startsWith('enemigo');
    }

    recibirDanio(bodyEnemigo) {
        if (this.recibiendoDanio) return;
        console.log('dentro de funcion recibir danio');
        this.recibiendoDanio = true;
        const tipoEnemigo = bodyEnemigo.tipo;
        let cantidad = buscarEnemigoEnDic(tipoEnemigo);
        this.vida -= cantidad;
        this.animacionRecibiendoDanio();
        this.aplicarKnockbackEnemigos();
        if (this.vida <= 0) {
            this.gameOver();
        };
    }

    animacionRecibiendoDanio() {
        let parpardeoActivo = true;
        const intervaloParpadeo = setInterval(() => {
            this.sprite.visible = parpardeoActivo;
            parpardeoActivo = !parpardeoActivo;
        }, 100); // Cambia cada 100ms
        setTimeout(() => {
            clearInterval(intervaloParpadeo);
            this.sprite.visible = true;
            this.recibiendoDanio = false;
            this.colisionConEnemigo = false;
        }, this.cooldownRecibiendoDanio);
    }

    aplicarKnockbackEnemigos() {
        const radioImpacto = 50;
        const nivelActual = detectarNivelActual();
        nivelActual.enemigos.forEach((enemigo) => {
            const distancia = calcularDistancia(this, enemigo);
            if (distancia < radioImpacto) {
                //console.log('El enemigo esta al alcance: ', enemigo);
                const fuerzaKnockback = 0.018;
                const direccion = {
                    x: enemigo.sprite.x - this.sprite.x,
                    y: enemigo.sprite.y - this.sprite.y
                };
                const direccionNormalizada = normalizar(direccion);
                enemigo.aplicarKnockback(fuerzaKnockback, direccionNormalizada);
            }
        });
    }

    detectarColisionAtaque() {
        if (!this.puedeVerificarColision) return; // Salir si el flag esta false
        this.puedeVerificarColision = false; // Desactivar temporalmente

        const rectAtaque = this.areaAtaque.getBounds();
        const nivelActual = detectarNivelActual();
        nivelActual.enemigos.forEach((enemigo) => {
            const rectEnemigo = enemigo.rectBounds;
            if (intersectarRectangulo(rectAtaque, rectEnemigo)) {
                //console.log('Enemigo golpeado');
                const direccionImpacto = {
                    x: enemigo.sprite.x - this.sprite.x,
                    y: enemigo.sprite.y - this.sprite.y
                };
                const direccionNormalizada = normalizar(direccionImpacto)
                enemigo.recibirDanio(this.danio, direccionNormalizada);
            }
        });
        // Reactivar deteccion de colisiones despues de 100 ms
        setTimeout(() => {
            this.puedeVerificarColision = true;
        }, 100);
    }

    detectarColisiones(pairs) {
        pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;
            // Verificar si el jugador colisiona con un objeto relevante
            const colisionConJugador = bodyA === this.body || bodyB === this.body;
            if (!colisionConJugador) return;
            // Identificar si el otro cuerpo es suelo o enemigo
            const otroCuerpo = bodyA === this.body ? bodyB : bodyA;
            if (body.label.startsWith('suelo')){
                this.jugadorEnElSuelo = true; // Solo activar si es una plataforma
            } else if (otroCuerpo.label.startsWith('enemigo')) {
                console.log('otro cuerpo es enemigo')
                const enemigo = otroCuerpo;
                this.recibirDanio(enemigo);
                this.colisionConEnemigo = true; // Flag para colision con enemigo
            }
        });
    }

    detectarFinColision(pairs) {
        pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;
            const colisionConJugador = bodyA === this.body || bodyB === this.body;
            if (!colisionConJugador) return;
            const otroCuerpo = bodyA === this.body ? bodyB : bodyA;
            if (otroCuerpo.label.startsWith('suelo')) {
                this.jugadorEnElSuelo = false;
            } else if (otroCuerpo.label.startsWith('enemigo')) {
                this.colisionConEnemigo = false;
            }
        });
    }

    update() {
        if (this.areaAtaque.visible) this.detectarColisionAtaque();
        if (!this.mouseMoviendose) this.apuntarConUltimaPosicion();
        this.sincronizarAreaAtaque();
        // Sincronizamos el sprite con el cuerpo de matter.js
        this.sprite.x = this.body.position.x;
        this.sprite.y = this.body.position.y;
        // Setear la velocidad 
        Matter.Body.setVelocity(this.body, { x: this.velocidadHorizontal, y: this.body.velocity.y });
        // Actualizar la barra de cooldown
        this.actualizarBarraCooldown();
        this.mouseMoviendose = false;
    }
}
