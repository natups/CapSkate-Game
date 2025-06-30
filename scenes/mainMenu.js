export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  preload() {
    this.load.image("cielo", "public/assets/cielo.png");
    this.load.image("nubes", "public/assets/nubes.png");
    this.load.image("nubes2", "public/assets/nubes2.png");
    this.load.image("titulo", "public/assets/titulo.png");

    this.load.bitmapFont(
      "PublicPixel",
      "public/assets/fonts/PublicPixel.png",
      "public/assets/fonts/PublicPixel.fnt"
    );

  }

  create() {
    ['cielo', 'nubes', 'nubes2'].forEach(key =>
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
    );

    this.fondoCielo = this.add.image(0, 0, "cielo").setOrigin(0);
    this.nubesA = this.add.image(0, 40, "nubes").setOrigin(0);
    this.nubesB = this.add.image(this.nubesA.width, 40, "nubes").setOrigin(0);
    this.nubes2A = this.add.image(0, 5, "nubes2").setOrigin(0);
    this.nubes2B = this.add.image(this.nubes2A.width, 5, "nubes2").setOrigin(0);
    this.titulo = this.add.image(160, 115, "titulo").setOrigin(0.5, 0.5);

    // Cambiar a bitmapText para la fuente bitmap
    this.textoStart = this.add.bitmapText(105, 160, "PublicPixel", "> ENTER para jugar", 8)
      .setOrigin(0.5)
      .setTint(0xffffff); // Color blanco para el texto

    const recordGuardado = localStorage.getItem("recordTiempo") || "0.00";
    this.textoRecord = this.add.bitmapText(25, 200, "PublicPixel", "Record: " + recordGuardado, 8)
      .setOrigin(0, 0)
      .setTint(0xffffff); // Color blanco para el texto
    
    this.timerTitilar = 0;

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on("down", () => {
      this.scene.start("Game");
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

    this.timerTitilar += this.game.loop.delta;
    if (this.timerTitilar > 500) {
      this.textoStart.visible = !this.textoStart.visible;
      this.timerTitilar = 0;
    }
  }
}
