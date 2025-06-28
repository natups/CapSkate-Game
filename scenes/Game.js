export default class game extends Phaser.Scene {
  constructor() {
    super("game");
  }


preload() {
  this.load.image('plataformas', 'public/assets/tilemap/plataformas.png');
  this.load.tilemapTiledJSON('plataformas', 'public/assets/tilemap/plataformas.json');
}

create() {
  // Crear el mapa desde el archivo JSON
  const map = this.make.tilemap({ key: 'plataformas' });
  const tileset = map.addTilesetImage('plataformas', 'plataformas');
  const layer = map.createLayer('plataformas', tileset, 0, 0);
}


update() {

}
}
