// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class mainMenu extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  preload() {
    this.load.image("cielo", "public/assets/cielo.png");
    this.load.image("nubes", "public/assets/nubes.png");
    this.load.image("nubes2", "public/assets/nubes2.png");
    this.load.image("titulo", "public/assets/titulo.png");
  }

  create() {
    // Fondo cielo como tileSprite (parallax suave)
    this.fondoCielo = this.add.image(0, 0, "cielo").setOrigin(0, 0);


    // Nubes con tileSprite (parallax rápido)
    this.fondoNubes = this.add.tileSprite(0, 0, 320, 240, "nubes").setOrigin(0, 0);
    this.fondoNubes2 = this.add.tileSprite(0, 0, 320, 240, "nubes2").setOrigin(0, 0);

    // Título del juego
    this.titulo = this.add.image(160, 120, "titulo").setOrigin(0.5, 0.5);

    // Texto "Presione ENTER para jugar" con tipografía pixelart nítida
    this.textoStart = this.add.text(100, 170, "> Presione ENTER para jugar", {
      fontFamily: "PressStart2P",
      fontSize: "12px",
      color: "#ffffff",
      resolution: 2,
      align: "center",
      padding: { x: 0, y: 0 }
    }).setOrigin(0.5);
    this.textoStart.setResolution(2);

    // Texto de récord en la esquina inferior izquierda
    const recordGuardado = localStorage.getItem("recordTiempo") || "0.00";
    this.textoRecord = this.add.text(5, 225, "Record: " + recordGuardado, {
      fontFamily: "PressStart2P",
      fontSize: "8px",
      color: "#ffffff",
      resolution: 2
    }).setOrigin(0, 0);
    this.textoRecord.setResolution(2);

    // Timer para titilar texto
    this.timerTitilar = 0;

    // Tecla ENTER para iniciar el juego
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on("down", () => {
      this.scene.start("game");
    });
  }

  update() {
    // Parallax del cielo (más lento)
    //this.fondoCielo.tilePositionX += 0.10;

    // Parallax de las nubes
    this.fondoNubes.tilePositionX += 0.10;
    this.fondoNubes2.tilePositionX += 0.5;

    // Efecto parpadeo del texto "Presione ENTER"
    this.timerTitilar += this.game.loop.delta;
    if (this.timerTitilar > 500) {
      this.textoStart.visible = !this.textoStart.visible;
      this.timerTitilar = 0;
    }
  }
}
