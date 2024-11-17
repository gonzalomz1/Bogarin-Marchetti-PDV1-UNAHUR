// Utils.js
let nivelActual
let jugador
let engine
let world
let enemigosDelNivelActual = {};

const dicEnem = {
    'test': 1
}

function generarID(longitud = 8) {
    const caracteres =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < longitud; i++) {
      id += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return id;
  }

function buscarEnemigoEnDic(tipoEnemigo) {
    console.log(dicEnem[tipoEnemigo]);
    return dicEnem[tipoEnemigo];
}

function intersectarRectangulo(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function calcularDistancia(a, b) {
    const dx = a.sprite.x - b.sprite.x;
    const dy = a.sprite.y - b.sprite.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function normalizar(vector) {
    const mag = Math.sqrt(vector.x ** 2 + vector.y ** 2);
    return mag > 0 ? { x: vector.x / mag, y: vector.y / mag } : { x: 0, y: 0 };
}


function modificarNivelActual(nivel) {
    nivelActual = nivel;
    return nivelActual;
}

function detectarNivelActual() {
    return nivelActual;
}

function hacerJugadorVariableGlobal(objetoJugador) {
    jugador = objetoJugador;
    return jugador;
}

function detectarJugador() {
    return jugador;
}

function asignarEngineActual(engineActual) {
    engine = engineActual;
    return engine;
}

function detectarEngine() {
    return engine;
}

function asignarWorldActual(worldActual) {
    world = worldActual;
    return world;
}

function detectarWorld() {
    return world;
}

function setearColisionesDelJugador() {
    Matter.Events.on(engine, 'collisionStart', (e) => {
        jugador.detectarColisiones(e.pairs);
    });
    Matter.Events.on(engine, 'collisionEnd', (e) => {
        jugador.detectarFinColision(e.pairs);
    });
}
// Fin utils.js