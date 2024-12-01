// cargadorRecursos.js
class CargadorRecursos {
  constructor() {
    this.recursos = {}; // Aquí almacenaremos los recursos cargados
  }

  async precargarRecursos(listaRecursos) {
    console.log("Iniciando precarga de recursos...");
    const promesas = listaRecursos.map(async ({ nombre, url }) => {
      const recurso = await PIXI.Assets.load(url);
      this.recursos[nombre] = recurso;
      console.log(`Recurso cargado: ${nombre}`);
    });
    // Esperar a que todas las promesas se completen
    await Promise.all(promesas);
    console.log("Todos los recursos han sido precargados.");
    console.log("recursos: ", this.recursos);
  }

  obtenerRecurso(nombre) {
    const recurso = this.recursos[nombre];
    if (!recurso) {
      console.warn(`Recurso no encontrado: ${nombre}`);
    }
    return recurso;
  }
}
