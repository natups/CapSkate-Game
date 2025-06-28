import mainMenu from "./scenes/MainMenu.js";
import game from "./scenes/Game.js";

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
  render:{
    pixelArt: true,
    antialias: false,
    roundPixels: true
  },
  scene: [mainMenu, game],
};

window.game = new Phaser.Game(config);

