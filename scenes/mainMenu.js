export default class mainMenu extends Phaser.Scene {
  constructor() {
    super("mainMenu");
  }

  preload() {
    this.load.image("cielo", "public/assets/cielo.png");
    this.load.image("nubes", "public/assets/nubes.png");
    this.load.image("nubes2", "public/assets/nubes2.png");
    this.load.image("titulo", "public/assets/titulo.png");
  }

  create() {

    console.log("Creando mainMenu");
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

    // Título del juego
    this.titulo = this.add.image(160, 120, "titulo").setOrigin(0.5, 0.5);

    // Texto "Presione ENTER para jugar"
    this.textoStart = this.add.text(160, 180, "> Presione ENTER para jugar", {
      fontFamily: "Courier",
      fontSize: "10px",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5);

    // Texto de récord
    const recordGuardado = localStorage.getItem("recordTiempo") || "0.00";
    this.textoRecord = this.add.text(5, 225, "HI-Score: " + recordGuardado, {
      fontFamily: "Courier",
      fontSize: "8px",
      color: "#ffffff"
    }).setOrigin(0, 0);

    // Timer titilar
    this.timerTitilar = 0;

    // Tecla ENTER
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on("down", () => {
      this.scene.start("game");
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

    // Titilar texto
    this.timerTitilar += this.game.loop.delta;
    if (this.timerTitilar > 500) {
      this.textoStart.visible = !this.textoStart.visible;
      this.timerTitilar = 0;
    }
  }
}
