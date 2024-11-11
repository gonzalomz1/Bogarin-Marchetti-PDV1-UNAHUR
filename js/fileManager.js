// fileManager.js

// Diccionario para almacenar los recursos cargados
const recursos = {};

// Rutas de recursos

const RUTAS = {
    imagenes: {
        jugador: '',
        enemigo: '',
        fondo: ''
    },
    json: {
        configuracion: '',
        niveles: ''
    },
};

// Funcion para cargar todos los recursos de una vez
async function cargarRecursos() {
    const promesas = [];

    // Cargar imagenes
    for (const [nombre, ruta] of Object.entries(rutas.imagenes)) {
        const promesaImagen = PIXI.Assets.load(ruta).then((imagen) => {
            recursos[nombre] = imagen;
        });
        promesas.push(promesaImagen);
    }

    // Cargar JSON
    for (const [nombre, ruta] of Object.entries(RUTAS.json)) {
        const promesaJSON = fetch(ruta).then((response) => response.json()).then((data) => {
            recursos[nombre] = data;
        }); 
        promesas.push(promesaJSON);
    }
}

// Funcion para obtener un recurso especifico por nombre
function obtenerRecurso(nombre){
    return recursos[nombre] || null;
}

export { cargarRecursos, obtenerRecurso, RUTAS };
// fin fileManager.js