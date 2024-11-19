// cargadorRecursos.js
class CargadorRecursos {
    constructor() {
      this.recursos = {}; // Aquí almacenaremos los recursos cargados
    }
  
    /**
     * Precarga una lista de recursos y los almacena.
     * @param {Array} listaRecursos - Array de objetos con { nombre, url }.
     * @returns {Promise<void>}
     */
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
  
    /**
     * Obtiene un recurso ya cargado.
     * @param {string} nombre - Nombre del recurso.
     * @returns {*} - El recurso solicitado.
     */
    obtenerRecurso(nombre) {
      const recurso = this.recursos[nombre];
      if (!recurso) {
        console.warn(`Recurso no encontrado: ${nombre}`);
      }
      return recurso;
    }
}
