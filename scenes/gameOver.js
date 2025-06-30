export default class gameOver extends Phaser.Scene {
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
    this.nubesA = this.add.image(0, -20, "nubes").setOrigin(0);
    this.nubesB = this.add.image(this.nubesA.width, -20, "nubes").setOrigin(0);

    this.nubes2A = this.add.image(0, -5, "nubes2").setOrigin(0);
    this.nubes2B = this.add.image(this.nubes2A.width, -5, "nubes2").setOrigin(0);

    this.add.text(80, 100, '¡PERDISTE!', {
      fontFamily: 'Courier',
      fontSize: '16px',
      color: '#ff0000',
    });

    this.add.text(50, 120, `Tiempo: ${this.tiempoFinal}s`, {
      fontFamily: 'Courier',
      fontSize: '8px',
      color: '#ffffff',
    });

    this.add.text(50, 135, `Alfajores: x${this.alfajoresRecolectados}`, {
      fontFamily: 'Courier',
      fontSize: '8px',
      color: '#ffffff',
    });

    this.add.text(50, 155, 'R: reiniciar  ESC: menú', {
      fontFamily: 'Courier',
      fontSize: '8px',
      color: '#ffffff',
    });

    this.input.keyboard.once('keydown-R', () => {
      this.scene.start('game');
    });

    this.input.keyboard.once('keydown-ESC', () => {
    this.scene.start('mainMenu'); 
    });
  }

  update() {
    const speed1 = 0.2;
    const speed2 = 0.5;

    this.nubesA.x -= speed1;
    this.nubesB.x -= speed1;
    if (this.nubesA.x <= -this.nubesA.width) {
      this.nubesA.x = this.nubesB.x + this.nubesB.width;
    }
    if (this.nubesB.x <= -this.nubesB.width) {
      this.nubesB.x = this.nubesA.x + this.nubesA.width;
    }

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
