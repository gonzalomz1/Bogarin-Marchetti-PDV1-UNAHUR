// jugador.js
class Jugador extends Entidad {
    constructor(juego, world, app, alto, ancho, inputManager) {
        super(juego, world, app, ancho / 2, alto / 2);
        this.juego = juego;
        this.cargadorRecursos = juego.cargadorRecursos;

        this.inputManager = inputManager;
        this.registrarContextoYCambiar();

        // Colisiones del jugador
        this.agregarEventosDeMatter()
        this.body.label = 'jugador';

        // Container y sprites
        this.container = new PIXI.Container();
        this.entidad = this;
        this.spritesAnimaciones = {};
        this.spriteActual = null;
        this.iniciarSprites();

        // Atributos del jugador
        this.estadoActual = 'Jump';
        this.vida = 3;
        this.danio = 1;
        this.experiencia = 0;
        this.expParaSubirDeNivel = 10;
        this.nivel = 1;
        this.velocidadMovimientoBase = 2;
        this.velocidadMovimiento = 2;
        this.cooldownRecibiendoDanio = 1000;
        this.fuerzaSalto = -0.01;
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
        this.juego.gameContainer.addChild(this.barraCooldownDash);

        // Velocidades y apuntado
        this.velocidadHorizontal = 0;
        this.direccion = { x: 0, y: 0 };
        this.mouseMoviendose = false;
        this.anguloApuntado = 0;
        this.ultimaPosMouse = { x: 0, y: 0 };
        this.colisionConEnemigo = false;
        this.recibiendoDanio = false;
        this.cooldownRecibiendoDanio = 1000;

        this.velocidadAtaque = 200;
        this.distanciaAtaque = 40;
        this.altoAtaque = 10;
        this.anchoAtaque = 40;
        this.puedeVerificarColision = true;
        console.log('vida del jugador: ', this.vida);

        this.areaAtaque = this.crearAreaAtaque();
    }

    iniciarSprites() {
        const nombresSprites = [
            { nom: "Idle", recurso: "JSON_JUGADOR_FLACO_IDLE" },
            { nom: "Move", recurso: "JSON_JUGADOR_FLACO_CORRIENDO" },
            { nom: "Attack", recurso: "JSON_JUGADOR_FLACO_ATACANDO" },
            { nom: "Jump", recurso: "JSON_JUGADOR_FLACO_SALTANDO" }
        ];
        nombresSprites.forEach(({ nom, recurso }) => {
            const sprite = this.cargadorRecursos.obtenerRecurso(recurso);
            const anim = new PIXI.AnimatedSprite(sprite.animations[recurso]);

            anim.anchor.set(0.5);
            anim.animationSpeed = 0.1;
            anim.loop = nom !== 'Attack'; // Ataque puede no ser loop
            anim.visible = false; // Ocultamos todos por defecto

            this.spritesAnimaciones[nom] = anim;
            this.container.addChild(anim);
            console.log('player container', this.container);
            console.log('sprite animaciones', this.spritesAnimaciones);
        });

        // Agregar al contenedor principal
        this.juego.gameContainer.addChild(this.container);

        // Mostrar el sprite inicial
        console.log('antes de cambiar sprites asi esta this.spriteanimaciones', this.spriteAnimaciones);
        this.cambiarSprite("Idle");
    }

    cambiarSprite(nombre) {
        if (!this.spritesAnimaciones[nombre]) {
            console.error(`Error: El sprite "${nombre}" no existe en spritesAnimaciones.`);
            return;
        }

        Object.keys(this.spritesAnimaciones).forEach(key => {
            this.spritesAnimaciones[key].visible = false; // Oculta todos
        });

        const sprite = this.spritesAnimaciones[nombre];
        sprite.visible = true; // Muestra el sprite solicitado
        sprite.play();
    }

    cambiarEstado(nuevoEstado) {
        if (this.estadoActual !== nuevoEstado) {
            this.estadoActual = nuevoEstado;
            this.cambiarSprite(nuevoEstado);
        }
    }


    actualizarEstado() {
        switch (this.estadoActual) {
            case 'Idle':
                this.idle();
                break;
            case 'Move':
                this.move();
                break;
            case 'Attack':
                this.cambiarEstado('Attack');
                setTimeout(() => {
                    this.idle(); // Volver a Idle tras ataque
                }, this.velocidadAtaque);
                break;
        }
    }

    idle() {
        this.cambiarEstado('Idle');
    }

    move() {
        this.cambiarEstado('Move');
    }

    registrarContextoYCambiar() {
        this.inputManager.registrarContexto('jugador', {
            manejarTecla: (e, presionada) => this.manejarMovimiento(e, presionada),
            manejarMouse: (e) => this.apuntar(e),
            manejarClick: (e) => this.attack()
        });
        this.inputManager.cambiarContexto('jugador');
    }

    agregarEventosDeMatter() {
        this.juego.eventosMatterJugador();
        Matter.Body.set(this.body, {
            label: 'jugador',
            entidad: this
        });
    }

    crearAreaAtaque() {
        const json = this.cargadorRecursos.obtenerRecurso("JSON_GOLPE");
        const sprite = new PIXI.AnimatedSprite(
            json.animations["JSON_GOLPE"]
        );
        sprite.animationSpeed = this.velocidadAtaque / 100;
        sprite.loop = false;
        sprite.anchor.set(0.5);

        this.juego.gameContainer.addChild(sprite);
        return sprite;
    }



    manejarMovimiento(e, presionada) {
        if (this.jugadorEnElSuelo) {
            this.cambiarEstado('Move');
        } else {
            this.cambiarEstado('Jump');
        }

        // Movimiento con A/D y salto con W/Espacio, bajar con s
        switch (e.key) {
            case 'Shift':
                if (presionada && !this.cooldownDash) this.iniciarDash();
                break;
        }
        this.actualizarVelocidad();
    }

    actualizarVelocidad() {
        // Si ambas teclas estan presionadas (A y D), no se mueve en el eje X
        if (this.inputManager.teclasPresionadas.a && this.inputManager.teclasPresionadas.d) {
            this.velocidadHorizontal = 0;
        } else if (this.inputManager.teclasPresionadas.a) {
            this.invertirSprite(true)
            this.velocidadHorizontal = -this.velocidadMovimiento;
        } else if (this.inputManager.teclasPresionadas.d) {
            this.invertirSprite(false)
            this.velocidadHorizontal = this.velocidadMovimiento;
        } else {
            this.velocidadHorizontal = 0;
        }

        // Solo saltar si W esta presionado y el jugador esta en el suelo
        if (this.inputManager.teclasPresionadas.w) {
            this.saltar();
        }
    };

    invertirSprite(izquierda) {
        const direccion = izquierda ? -1 : 1; // -1 para izquierda, 1 para derecha
        Object.values(this.spritesAnimaciones).forEach(sprite => {
            sprite.scale.x = Math.abs(sprite.scale.x) * direccion;
        });
    }

    saltar() {
        this.cambiarEstado('Jump');
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
    
    apuntar(e) {
        // Calcular posicion del mouse en coordenadas del canvas
        const rect = this.juego.app.view.getBoundingClientRect();
        const mouseX = e.clientX - rect.left; 
        const mouseY = e.clientY - rect.top; 
    
        // Ajustar la posiión del mouse según la posición del gameContainer
        const escalaX = this.juego.gameContainer.scale.x; 
        const escalaY = this.juego.gameContainer.scale.y; 
        const adjustedMouseX = (mouseX - this.juego.gameContainer.x) / escalaX; 
        const adjustedMouseY = (mouseY - this.juego.gameContainer.y) / escalaY; 
    
        // Calcular el ángulo desde el jugador hacia el mouse ajustado 
        const dx = adjustedMouseX - this.container.x; 
        const dy = adjustedMouseY - this.container.y; 
        this.anguloApuntado = Math.atan2(dy, dx); 
        // Guardamos el ángulo 
        this.ultimaPosMouse = { x: adjustedMouseX, y: adjustedMouseY }; 
    
        // Cambiar la orientación del sprite dependiendo de la dirección del apuntado
        if (dx < 0) {
            this.invertirSprite(true);
        } else {
            this.invertirSprite(false);
        }
        this.actualizarAreaAtaque();
        this.sincronizarAreaAtaque();
    }

    actualizarAreaAtaque() {
        if (this.areaAtaque) {
            // Actualizar la posición del área de ataque a la posición del jugador
            this.areaAtaque.x = this.container.x;
            this.areaAtaque.y = this.container.y;
    
            // Ajustar la rotación según el ángulo apuntado
            this.areaAtaque.rotation = this.anguloApuntado;
    
            // Ajustar la escala basada en la dirección del ángulo de apuntado
            const angulo = this.anguloApuntado;
            if (angulo > Math.PI / 4 && angulo < 3 * Math.PI / 4) {
                // Apuntando hacia abajo, no invertir verticalmente
                this.areaAtaque.scale.y = 1;
            } else if (angulo < -Math.PI / 4 && angulo > -3 * Math.PI / 4) {
                // Apuntando hacia arriba, no invertir verticalmente
                this.areaAtaque.scale.y = 1;
            } else {
                // Apuntando a los lados, invertir según la dirección
                if (angulo > Math.PI / 2 || angulo < -Math.PI / 2) {
                    this.areaAtaque.scale.y = -1; // Reflejar verticalmente
                } else {
                    this.areaAtaque.scale.y = 1;  // Mantener sin reflejar
                }
            }
        }
    }
    
    sincronizarAreaAtaque() {
        const distancia = this.distanciaAtaque;
    
        // Calcular la posicion del area de ataque respecto al puntero.
        const nuevaX = this.container.x + Math.cos(this.anguloApuntado) * distancia;
        const nuevaY = this.container.y + Math.sin(this.anguloApuntado) * distancia;
    
        // Determinar la escala del sprite del area de ataque para mantener las proporciones
        this.areaAtaque.scale.set(1, 1); // Mantener las proporciones originales
    
        // Actualizar la posición del área de ataque
        this.areaAtaque.x = nuevaX;
        this.areaAtaque.y = nuevaY;
    }

    attack() {
        this.cambiarEstado('Attack');
        this.areaAtaque.visible = true;
        this.areaAtaque.gotoAndPlay(0);
        console.log('Ataque activado');
        setTimeout(() => {
            this.areaAtaque.visible = false;
            this.cambiarEstado("Idle");
        }, this.velocidadAtaque);
    }

    apuntarConUltimaPosicion() {
        const dx = this.ultimaPosMouse.x - this.container.x;
        const dy = this.ultimaPosMouse.y - this.container.y;
        // Reutilizamos la ultima posicion conocida
        this.anguloApuntado = Math.atan2(dy, dx); 
        // Actualizar la posicion y rotacion del area de ataque
        this.actualizarAreaAtaque();
        this.sincronizarAreaAtaque();
    }

    gameOver() {
        console.log('Game Over');
    }

    recibirDanio(bodyEnemigo) {
        if (this.recibiendoDanio) return;
        console.log('dentro de funcion recibir danio');
        this.recibiendoDanio = true;
        const tipoEnemigo = bodyEnemigo.tipo;
        let cantidad = buscarEnemigoEnDic(tipoEnemigo);
        this.vida -= cantidad;
        this.aplicarKnockbackEnemigos();
        if (this.vida <= 0) {
            this.gameOver();
        };
    }

    parpadeoRecibiendoDanio() {
        let parpardeoActivo = true;
        const intervaloParpadeo = setInterval(() => {
            this.container.visible = parpardeoActivo;
            parpardeoActivo = !parpardeoActivo;
        }, 100); // Cambia cada 100ms
        setTimeout(() => {
            clearInterval(intervaloParpadeo);
            this.container.visible = true;
            this.recibiendoDanio = false;
            this.colisionConEnemigo = false;
        }, this.cooldownRecibiendoDanio);
    }

    aplicarKnockbackEnemigos() {
        const radioImpacto = 50;
        const nivelActual = detectarNivelActual();
        nivelActual.enemigos.forEach((enemigo) => {
            const distancia = calcularDistancia(this, enemigo);
            console.log('calcular distancia en jugador', distancia);
            if (distancia < radioImpacto) {
                console.log('El enemigo esta al alcance: ', enemigo);
                const fuerzaKnockback = 0.018;
                const direccion = {
                    x: enemigo.container.x - this.container.x,
                    y: enemigo.container.y - this.container.y
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
                if (this.spriteActual !== null) {
                    const direccionImpacto = {
                        x: enemigo.sprite.x - this.spriteActual.x,
                        y: enemigo.sprite.y - this.spriteActual.y
                    };
                    const direccionNormalizada = normalizar(direccionImpacto)
                    enemigo.recibirDanio(this.danio, direccionNormalizada);
                }
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
            if (otroCuerpo.label.startsWith('sueloFlo')) {
                this.jugadorEnElSuelo = true;
                otroCuerpo.entidad.cambiarEstado('Destruyendo');
            } else if (otroCuerpo.label.startsWith('enemigo')) {
                const enemigo = otroCuerpo;
                this.recibirDanio(enemigo);
                this.colisionConEnemigo = true; // Flag para colision con enemigo
            } else if (otroCuerpo.label.startsWith('suelo')) {
                this.jugadorEnElSuelo = true; // Solo activar si es una plataforma

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
        if (this.container != null) {
            if (this.puedeEstarIdle()) {
                this.cambiarEstado('Idle');
            }
            this.actualizarEstado();
            if (this.areaAtaque.visible) this.detectarColisionAtaque();
            if (!this.mouseMoviendose) this.apuntarConUltimaPosicion();
            this.sincronizarAreaAtaque();
            // Sincronizamos el sprite con el cuerpo de matter.js
            this.container.x = this.body.position.x;
            this.container.y = this.body.position.y;
            // Setear la velocidad 
            Matter.Body.setVelocity(this.body, { x: this.velocidadHorizontal, y: this.body.velocity.y });
            // Actualizar la barra de cooldown
            this.actualizarBarraCooldown();
            this.mouseMoviendose = false;
        }
    }

    puedeEstarIdle() {
        return (this.velocidadHorizontal === 0 && this.jugadorEnElSuelo && !this.areaAtaque.visible);
    }
}

// fin jugador.js