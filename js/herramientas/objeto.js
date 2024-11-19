// Clase base Objeto
class Objeto {
  constructor(x, y, juego) {

    this.app = juego.app;
    this.juego = juego;
    this.listo = false;
    this.container.x = x;
    this.container.y = y;
    this.spritesAnimados = {};
  }

  cambiarSprite(cual, numero = 0, loop = true, cb) {
    if (this.spriteActual == cual) return; // No cambia si el sprite actual es el mismo.
    this.spriteActual = cual;

    let sprite = this.spritesAnimados[cual];
    if (!sprite) return null;

    sprite.name = "spriteActivo";
    if (numero != undefined) sprite.gotoAndPlay(numero);
    sprite.loop = loop;

    let spriteAnterior = this.container.children.find(
      (child) => child.name === "spriteActivo"
    );
    if (spriteAnterior) this.container.removeChild(spriteAnterior);

    this.container.addChild(sprite);

    if (cb instanceof Function) {
      sprite.onComplete = () => {
        cb();
      };
    }

    return sprite;
  }

  cargarTexturasDeJSON(url, cb) {
    console.log("#cargarTexturasDeJSON", url);

    PIXI.Assets.load(url).then((datos) => {
      console.log('url cargada: ', datos);
      // Cargamos las texturas desde el JSON
      const frames = datos.data.frames;
      const animations = datos.data.animations;
      const meta = datos.data.meta;

      const texturaBase = PIXI.BaseTexture.from(meta.image);

      // Crear las texturas a partir de los frames
      Object.keys(animations).forEach((anim) => {
        const framesArray = animations[anim].map((frameName) => {
          const frameData = frames[frameName].frame; // Extraer la información del frame
          return new PIXI.Texture(
            baseTexture,
            new PIXI.Rectangle(frameData.x, frameData.y, frameData.w, frameData.h)
          );
        });

        // Crear el sprite animado
        const animatedSprite = new PIXI.AnimatedSprite(framesArray);
        animatedSprite.loop = true; // Configurar si se repite la animación
        animatedSprite.anchor.set(0.5, 1); // Ajustar el anclaje
        animatedSprite.play(); // Iniciar la animación

        // Guardar el sprite en el objeto spritesAnimados
        this.spritesAnimados[anim] = animatedSprite;
      });

      console.log("Sprites animados cargados:", this.spritesAnimados);

      // Ejecutar el callback si se proporciona
      if (cb instanceof Function) cb(this.spritesAnimados);
    });
  }

  borrar() {
    this.juego.app.stage.removeChild(this.container);
  }

  update() {
    this.container.x += this.velocidad?.x || 0;
    this.container.y += this.velocidad?.y || 0;
  }

  hacerQueLaVelocidadDeLaAnimacionCoincidaConLaVelocidad() {
    this.spritesAnimados[this.spriteActual].animationSpeed =
      0.07 *
      calculoDeDistanciaRapido(0, 0, this.velocidad?.x || 0, this.velocidad?.y || 0) +
      0.1;
  }
}