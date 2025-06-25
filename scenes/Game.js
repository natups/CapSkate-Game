// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  preload() {
    this.load.image("cielo", "public/assets/cielo.png");
    this.load.image("nubes", "public/assets/nubes.png");
    this.load.image("titulo", "public/assets/titulo.png");
  }

  create() {
    // Fondo más lejano (cielo)
    this.fondoCielo = this.add.tileSprite(0, 0, 320, 240, "cielo").setOrigin(0, 0);

    // Nubes (más cercanas)
    this.fondoNubes = this.add.tileSprite(0, 0, 320, 240, "nubes").setOrigin(0, 0);

    // Título centrado
    this.titulo = this.add.image(160, 100, "titulo").setOrigin(0.5, 0.5);
  }

  update() {
    // Movimiento parallax: cuanto más al fondo, más lento
    this.fondoCielo.tilePositionX += 0.05; // cielo se mueve más lento
    this.fondoNubes.tilePositionX += 0.2;  // nubes más rápido
  }
}

