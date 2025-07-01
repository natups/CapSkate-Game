export default class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  init(data) {
    this.tiempoFinal = data.tiempoFinal;
    this.alfajoresRecolectados = data.alfajores;
  }

  preload() {
    this.load.image("cielo", "public/assets/cielo.png");
    this.load.image("nubes", "public/assets/nubes.png");
    this.load.image("nubes2", "public/assets/nubes2.png");

    this.load.bitmapFont(
      "PublicPixel",
      "public/assets/fonts/PublicPixel.png",
      "public/assets/fonts/PublicPixel.fnt"
    );

    this.load.audio('musicaGameOver', 'public/assets/audio/Komiku-Skate.mp3');
  }

  create() {
    // musica
    this.musica = this.sound.add('musicaGameOver', { loop: true, volume: 0.5 });
    this.musica.play();


    // Filtro pixel perfect para las imágenes cargadas
    ['cielo', 'nubes', 'nubes2'].forEach(key =>
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
    );

    // Fondo
    this.fondoCielo = this.add.image(0, 0, "cielo").setOrigin(0);

    // Nubes para scroll
    this.nubesA = this.add.image(0, -20, "nubes").setOrigin(0);
    this.nubesB = this.add.image(this.nubesA.width, -20, "nubes").setOrigin(0);

    this.nubes2A = this.add.image(0, -5, "nubes2").setOrigin(0);
    this.nubes2B = this.add.image(this.nubes2A.width, -5, "nubes2").setOrigin(0);

    // Título
    this.add.bitmapText(155, 90, "PublicPixel", 'PERDISTE', 16)
      .setTint(0xff99ff)
      .setOrigin(0.5);

    // Tiempo final
    this.add.bitmapText(155, 120, "PublicPixel", `Tiempo: ${this.tiempoFinal}s`, 8)
      .setOrigin(0.5);

    // Ícono del alfajor recolectado
    this.alfajorIcono = this.add.sprite(135, 140, 'alfajor_animado')
      .setOrigin(0, 0.5)
      .setScale(1.2);

    this.alfajorIcono.play('alfajor_brillo');

    // Cantidad de alfajores
    this.textoAlfajores = this.add.bitmapText(160, 140, "PublicPixel", `x${this.alfajoresRecolectados}`, 8)
      .setOrigin(0, 0.5);

    this.add.bitmapText(120, 170, "PublicPixel", 'R:', 8)
    .setOrigin(0.5)
    .setTint(0xa000a0);
    
    this.add.bitmapText(170, 170, "PublicPixel", 'reiniciar', 8)
    .setOrigin(0.5);

    this.add.bitmapText(127, 190, "PublicPixel", 'ESC:', 8)
    .setOrigin(0.5)
    .setTint(0xa000a0);

    this.add.bitmapText(165, 190, "PublicPixel", 'menu', 8)
    .setOrigin(0.5);

    // Reiniciar juego
    this.input.keyboard.once('keydown-R', () => {
      this.guardarRecord();
      this.scene.start('Game');
      this.musica.stop();
    });

    // Volver al menú
    this.input.keyboard.once('keydown-ESC', () => {
      this.guardarRecord();
      this.scene.start('MainMenu');
      this.musica.stop();
    });
  }

  guardarRecord() {
    const recordGuardado = JSON.parse(localStorage.getItem("record")) || { alfajores: 0, tiempo: 0 };

    const superaRecord = this.alfajoresRecolectados > recordGuardado.alfajores ||
      (this.alfajoresRecolectados === recordGuardado.alfajores && this.tiempoFinal > recordGuardado.tiempo);

    if (superaRecord) {
      localStorage.setItem("record", JSON.stringify({
        alfajores: this.alfajoresRecolectados,
        tiempo: this.tiempoFinal
      }));
    }
  }

  update() {
    const speed1 = 0.2;
    const speed2 = 0.5;

    // Scroll infinito para nubes
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
