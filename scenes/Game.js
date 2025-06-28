export default class game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  preload() {
    this.load.image('jugador', 'public/assets/jugador1.png');

    this.load.image('cielo', 'public/assets/fondos/cielo.png');
    this.load.image('nubes', 'public/assets/fondos/nubes.png');
    this.load.image('nubes2', 'public/assets/fondos/nubes2.png');

    this.load.image('plataformas', 'public/assets/tilemap/plataformas.png');
    this.load.tilemapTiledJSON('plataformas', 'public/assets/tilemap/plataformas.json');
  }

create() {
  // cielo y nubes con parallax
  this.cielo = this.add.image(0, 0, 'cielo').setOrigin(0);
  this.nubesA = this.add.image(0, 5, 'nubes').setOrigin(0);
  this.nubesB = this.add.image(this.nubesA.width, 5, 'nubes').setOrigin(0);
  this.nubes2A = this.add.image(0, 5, 'nubes2').setOrigin(0);
  this.nubes2B = this.add.image(this.nubes2A.width, 5, 'nubes2').setOrigin(0);

  ['cielo', 'nubes', 'nubes2'].forEach(key =>
    this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
  );

  // cargar mapa y capa
  const map = this.make.tilemap({ key: 'plataformas' });
  const tileset = map.addTilesetImage('plataformas', 'plataformas');
  const layer = map.createLayer('plataformas', tileset, 0, 0);

  // agregar colisión a los tiles
  layer.setCollisionByProperty({ colision: true });

  // ajustar el tamaño del mundo al tamaño del mapa
  this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  // crear jugador
  const objetoJugador = map.getObjectLayer("jugador").objects[0];
  this.jugador = this.physics.add.sprite(objetoJugador.x, objetoJugador.y, 'jugador');
  this.jugador.setOrigin(0.5, 1);

  // limita al jugador dentro del mundo
  this.jugador.setCollideWorldBounds(true);

  // colision con las plataformas
  this.physics.add.collider(this.jugador, layer);
}


  update() {
    const speed1 = 0.3;
    const speed2 = 0.15;

    // Mover nubes 1
    this.nubesA.x -= speed1;
    this.nubesB.x -= speed1;

    // Si se va completamente una nube, la reposicionamos a la derecha de la otra
    if (this.nubesA.x <= -this.nubesA.width) {
      this.nubesA.x = this.nubesB.x + this.nubesB.width;
    }
    if (this.nubesB.x <= -this.nubesB.width) {
      this.nubesB.x = this.nubesA.x + this.nubesA.width;
    }

    // Nubes 2 (más lentas)
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
