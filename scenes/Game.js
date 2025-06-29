export default class game extends Phaser.Scene {
  constructor() {
    super("game");
    this.alfajoresRecolectados = 0; // contador
  }

  preload() {
    this.load.image('jugador', 'public/assets/jugador1.png');

    this.load.image('cielo', 'public/assets/fondos/cielo.png');
    this.load.image('nubes', 'public/assets/fondos/nubes.png');
    this.load.image('nubes2', 'public/assets/fondos/nubes2.png');

    this.load.image('plataformas', 'public/assets/tilemap/plataformas.png');
    this.load.tilemapTiledJSON('plataformas', 'public/assets/tilemap/plataformas.json');

    this.load.image('alfajor', 'public/assets/alfajor.png');

    this.load.spritesheet('trampolin', 'public/assets/trampolin.png', {
      frameWidth: 32,
      frameHeight: 32
    });
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
    this.jugador.setVelocityX(120);
    this.teclaEspacio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.jugador.setCollideWorldBounds(true);
    this.physics.add.collider(this.jugador, layer);
    this.cameras.main.startFollow(this.jugador, true, 1, 1);

    // animación del trampolín
    this.anims.create({
      key: 'trampolin_salto',
      frames: this.anims.generateFrameNumbers('trampolin', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0
    });

    // grupo de trampolines
    this.trampolines = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    const objetosTrampolines = map.getObjectLayer("trampolines").objects;
    objetosTrampolines.forEach(obj => {
    const trampolin = this.trampolines.create(obj.x, obj.y, 'trampolin');
    trampolin.setOrigin(0, 1); 

    // ajustar el área de colisión, solo la parte rosa del trampolin
    trampolin.body.setSize(32, 8);  // ancho 32px, alto 8px 
    trampolin.body.setOffset(0, 24); // mueve el hitbox 24px hacia abajo 
    });

    // cambio de collider por overlap controlar mejor el rebote
    this.physics.add.overlap(this.jugador, this.trampolines, (jugador, trampolin) => {
      if (jugador.body.velocity.y > 0) {
        trampolin.play('trampolin_salto', true);
        jugador.setVelocityY(-450); // fuerza del rebote
      }
    });


    // grupo de alfajores / items
    this.alfajores = this.physics.add.group({
      allowGravity: false
    });

    const objetosItems = map.getObjectLayer("items").objects;
    objetosItems.forEach(obj => {
      const alfajor = this.alfajores.create(obj.x, obj.y, 'alfajor').setOrigin(0.5, 1);
      // efecto item flotante
      this.tweens.add({
        targets: alfajor,
        y: alfajor.y - 5,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // recoger alfajores
    this.physics.add.overlap(this.jugador, this.alfajores, (jugador, alfajor) => {
      alfajor.destroy();
      this.alfajoresRecolectados++;
      this.textoAlfajores.setText(`x${this.alfajoresRecolectados}`);
    });

    // texto contador alfajores
    this.textoAlfajores = this.add.text(8, 8, 'x0', {
      fontFamily: 'PressStart2P',
      fontSize: '8px',
      color: '#ffffff',
      resolution: 2
    }).setScrollFactor(0).setOrigin(0);
  }

  update() {
    const scrollX = Math.floor(this.cameras.main.scrollX);

    this.nubesA.tilePositionX = scrollX * 0.5;
    this.nubes2A.tilePositionX = scrollX * 0.3;
    this.cielo.tilePositionX = scrollX * 0.2;

    if (this.jugador.body.blocked.down) {
      this.saltos = 0;
    }

    if (Phaser.Input.Keyboard.JustDown(this.teclaEspacio) && this.saltos < 2) {
      this.jugador.setVelocityY(-300);
      this.saltos++;
    }
  }
}
