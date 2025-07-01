import MainMenu from "./scenes/MainMenu.js";
import Game from "./scenes/Game.js";
import GameOver from "./scenes/gameOver.js";

const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 240,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 980 },
      debug: false,
    },
  },
  scene: [MainMenu, Game, GameOver],
};

window.game = new Phaser.Game(config);
