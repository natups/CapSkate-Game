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
    this.cielo = this.add.tileSprite(0, 0, 320, 240, 'cielo').setOrigin(0).setScrollFactor(0);
    this.nubesA = this.add.tileSprite(0, 5, 320, 240, 'nubes').setOrigin(0).setScrollFactor(0);
    this.nubes2A = this.add.tileSprite(0, 5, 320, 240, 'nubes2').setOrigin(0).setScrollFactor(0);

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
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // crear jugador
    const objetoJugador = map.getObjectLayer("jugador").objects[0];
    this.jugador = this.physics.add.sprite(objetoJugador.x, objetoJugador.y, 'jugador');
    this.jugador.setOrigin(0.5, 1);

    // movimiento jugador (velocidad constante hacia la derecha)
    this.jugador.setVelocityX(120);

    // entrada del teclado para salto
    this.saltos = 0; // para permitir doble salto
    this.teclaEspacio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // limita al jugador dentro del mundo
    this.jugador.setCollideWorldBounds(true);

    // colision con las plataformas
    this.physics.add.collider(this.jugador, layer);

    // la cámara sigue al jugador
    this.cameras.main.startFollow(this.jugador, true, 1, 1);

    // guardamos el tilemap para usar scrollX en update
    this.layer = layer;
  }

  update() {
    const scrollX = this.cameras.main.scrollX;

    // Parallax del fondo
    this.nubesA.tilePositionX = scrollX * 0.5;
    this.nubes2A.tilePositionX = scrollX * 0.3;
    this.cielo.tilePositionX = scrollX * 0.2;

    // saltos !! --> resetear saltos si el jugador toca el suelo
    if (this.jugador.body.blocked.down) {
      this.saltos = 0;
    }

    // salto o doble salto
    if (Phaser.Input.Keyboard.JustDown(this.teclaEspacio) && this.saltos < 2) {
      this.jugador.setVelocityY(-300);
      this.saltos++;
    }

  }
}
