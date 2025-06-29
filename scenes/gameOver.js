export default class GameOver extends Phaser.Scene {
  constructor() {
    super("gameOver");
  }

init(data) {
  this.tiempoFinal = data.tiempoFinal;
  this.alfajoresRecolectados = data.alfajores;
}

  preload() {
    this.load.image("cielo", "public/assets/cielo.png");
    this.load.image("nubes", "public/assets/nubes.png");
    this.load.image("nubes2", "public/assets/nubes2.png");
  }

  create() {
    // Filtro para pixel perfect
    ['cielo', 'nubes', 'nubes2'].forEach(key =>
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
    );

    // Fondo cielo (estático)
    this.fondoCielo = this.add.image(0, 0, "cielo").setOrigin(0);

    // Nubes duplicadas para scroll infinito
    this.nubesA = this.add.image(0, 40, "nubes").setOrigin(0);
    this.nubesB = this.add.image(this.nubesA.width, 40, "nubes").setOrigin(0);

    this.nubes2A = this.add.image(0, 5, "nubes2").setOrigin(0);
    this.nubes2B = this.add.image(this.nubes2A.width, 5, "nubes2").setOrigin(0);

    this.add.text(80, 100, '¡PERDISTE!', {
      fontFamily: 'PressStart2P',
      fontSize: '16px',
      color: '#ff0000',
      resolution: 2
    });

    this.add.text(50, 150, 'Presiona ENTER para reiniciar', {
      fontFamily: 'PressStart2P',
      fontSize: '8px',
      color: '#ffffff',
      resolution: 2
    });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('game'); // volver a la escena de juego
    });
  }

  update() {
    const speed1 = 0.2;
    const speed2 = 0.5;

    // Nubes 1
    this.nubesA.x -= speed1;
    this.nubesB.x -= speed1;
    if (this.nubesA.x <= -this.nubesA.width) {
      this.nubesA.x = this.nubesB.x + this.nubesB.width;
    }
    if (this.nubesB.x <= -this.nubesB.width) {
      this.nubesB.x = this.nubesA.x + this.nubesA.width;
    }

    // Nubes 2
    this.nubes2A.x -= speed2;
    this.nubes2B.x -= speed2;
    if (this.nubes2A.x <= -this.nubes2A.width) {
      this.nubes2A.x = this.nubes2B.x + this.nubes2B.width;
    }
    if (this.nubes2B.x <= -this.nubes2B.width) {
      this.nubes2B.x = this.nubes2A.x + this.nubes2A.width;
    }
  }
}
