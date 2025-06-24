import Game from "./scenes/Game.js";

// Crear configuración de Phaser
const config = {
  type: Phaser.AUTO,
  width: 320, // Resolución base tipo Sega Genesis
  height: 240,
  pixelArt: true, // Para mantener los píxeles nítidos
  roundPixels: true, // Redondear los píxeles para evitar desenfoque
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 320,
    height: 240,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 980 }, // Gravedad tipo terrestre en píxeles por segundo cuadrado
      debug: false,
    },
  },
  scene: [Game],
};

window.game = new Phaser.Game(config);
