export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  preload() {
    // Fondos
    this.load.image("cielo", "public/assets/cielo.png");
    this.load.image("nubes", "public/assets/nubes.png");
    this.load.image("nubes2", "public/assets/nubes2.png");

    // Título
    this.load.image("titulo", "public/assets/titulo.png");

    // Fuente
    this.load.bitmapFont(
      "PublicPixel",
      "public/assets/fonts/PublicPixel.png",
      "public/assets/fonts/PublicPixel.fnt"
    );

    // SpriteSheet Alfajor
    this.load.spritesheet('alfajor_animado', 'public/assets/alfajorSpriteSheet.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.audio('musicaMainMenu', 'public/assets/audio/Rolemusic-TheWhiteKitty.mp3');
  }

  create() {
    // Reproducir música de fondo
    this.musica = this.sound.add('musicaMainMenu', { loop: true, volume: 0.4 });
    this.musica.play();

    // pixel-art (sin suavizado)
    ['cielo', 'nubes', 'nubes2'].forEach(key =>
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
    );

    // fondo y título
    this.fondoCielo = this.add.image(0, 0, "cielo").setOrigin(0);
    this.nubesA = this.add.image(0, 40, "nubes").setOrigin(0);
    this.nubesB = this.add.image(this.nubesA.width, 40, "nubes").setOrigin(0);
    this.nubes2A = this.add.image(0, 5, "nubes2").setOrigin(0);
    this.nubes2B = this.add.image(this.nubes2A.width, 5, "nubes2").setOrigin(0);
    this.titulo = this.add.image(160, 115, "titulo").setOrigin(0.5);

    /*this.add.bitmapText(30, 140, "PublicPixel", "© 2025 Natasha", 8)
    .setOrigin(0, 1)
    .setTint(0xffffff);*/

    this.textoStart = this.add.bitmapText(105, 160, "PublicPixel", "> ENTER para jugar", 8)
      .setOrigin(0.5)
      .setTint(0xffffff);
    this.timerTitilar = 0;

    // Crear animación alfajor si no existe
    if (!this.anims.exists('alfajor_brillo')) {
      this.anims.create({
        key: 'alfajor_brillo',
        frames: this.anims.generateFrameNumbers('alfajor_animado', { start: 0, end: 4 }),
        frameRate: 6,
        repeat: -1
      });
    }

    // Obtener récord guardado en localStorage
    const record = JSON.parse(localStorage.getItem("record")) || { alfajores: 0, tiempo: 0 };

    // Texto "RECORD" centrado arriba
    this.textoRecordTitulo = this.add.bitmapText(50, 200, "PublicPixel", "Record:", 8)
      .setOrigin(0.5, 0)
      .setTint(0x620075);

    // Ícono animado del alfajor
    this.alfajorIcono = this.add.sprite(20, 220, 'alfajor_animado')
      .setOrigin(0, 0.5)
      .setScale(1)
      .play('alfajor_brillo');

    // Cantidad de alfajores (xN)
    this.textoRecord = this.add.bitmapText(40, 221, "PublicPixel", `x${record.alfajores}`, 8)
      .setOrigin(0, 0.5)
      .setTint(0xffffff);

    // Tiempo récord debajo, centrado
    this.textoTiempoRecord = this.add.bitmapText(90, 200, "PublicPixel", `${record.tiempo}s`, 8)
      .setOrigin(0.5, 0)
      .setTint(0xffffff);

    // iniciar juego al presionar ENTER
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on("down", () => {
      this.scene.start("Game");
      this.musica.stop();
    });
  }

  update() {
    // Movimiento de nubes fondo
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

    // Parpadeo texto
    this.timerTitilar += this.game.loop.delta;
    if (this.timerTitilar > 500) {
      this.textoStart.visible = !this.textoStart.visible;
      this.timerTitilar = 0;
    }
  }
}
