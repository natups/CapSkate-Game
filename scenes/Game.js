export default class game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init(data) {
    this.alfajoresRecolectados = 0; // contador
    this.tiempoJugado = 0; // tiempo en segundos
  }

  preload() {
    this.load.spritesheet('jugador', 'public/assets/jugador.png', {
      frameWidth: 32,
      frameHeight: 32
    });

    this.load.image('cielo', 'public/assets/cielo.png');
    this.load.image('nubes', 'public/assets/nubes.png');
    this.load.image('nubes2', 'public/assets/nubes2.png');

    this.load.image('plataformas', 'public/assets/tilemap/plataformas.png');
    this.load.tilemapTiledJSON('plataformas', 'public/assets/tilemap/plataformas.json');

    this.load.spritesheet('trampolin', 'public/assets/trampolin.png', {
      frameWidth: 32,
      frameHeight: 32
    });

    // sprite sheet animado del alfajor
    this.load.spritesheet('alfajor_animado', 'public/assets/alfajorSpriteSheet.png', {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  create() {
    // cielo y nubes con parallax
    this.cielo = this.add.tileSprite(0, 0, 320, 240, 'cielo').setOrigin(0).setScrollFactor(0);
    this.nubesA = this.add.tileSprite(0, -15, 320, 240, 'nubes').setOrigin(0).setScrollFactor(0);
    this.nubes2A = this.add.tileSprite(0, -10, 320, 240, 'nubes2').setOrigin(0).setScrollFactor(0);

    ['cielo', 'nubes', 'nubes2'].forEach(key =>
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
    );

    // cargar mapa y capa
    this.map = this.make.tilemap({ key: 'plataformas' });
    const tileset = this.map.addTilesetImage('plataformas', 'plataformas');
    const layer = this.map.createLayer('plataformas', tileset, 0, 0);

    // agregar colisión a los tiles
    layer.setCollisionByProperty({ colision: true });

    // ajustar el tamaño del mundo al tamaño del mapa
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 200);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // animación del trampolín
    this.anims.create({
      key: 'trampolin_salto',
      frames: this.anims.generateFrameNumbers('trampolin', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0
    });

    // animación del alfajor (brillo)
    this.anims.create({
      key: 'alfajor_brillo',
      frames: this.anims.generateFrameNumbers('alfajor_animado', { start: 0, end: 4 }),
      frameRate: 6,
      repeat: -1
    });

    // animaciones del personaje
    this.anims.create({
      key: 'carpincho_avanza',
      frames: this.anims.generateFrameNumbers('jugador', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'carpincho_salta',
      frames: this.anims.generateFrameNumbers('jugador', { start: 1, end: 3 }),
      frameRate: 12,
      repeat: 0
    });

    // crear jugador
    const objetoJugador = this.map.getObjectLayer("jugador").objects[0];
    this.jugador = this.physics.add.sprite(objetoJugador.x, objetoJugador.y, 'jugador');
    this.jugador.setOrigin(0.5, 1);
    this.jugador.setVelocityX(120);
    this.teclaEspacio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.jugador.setCollideWorldBounds(true);
    this.jugador.setDepth(2); // el jugador pasa por delante del trampolín
    this.physics.add.collider(this.jugador, layer);
    this.cameras.main.startFollow(this.jugador, true, 1, 1);
    this.cameras.main.setFollowOffset(-100, 0);
    this.jugador.play('carpincho_avanza');

    // grupo de trampolines
    this.trampolines = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    const objetosTrampolines = this.map.getObjectLayer("trampolines").objects;
    objetosTrampolines.forEach(obj => {
      const trampolin = this.trampolines.create(obj.x, obj.y, 'trampolin');
      trampolin.setOrigin(0, 1);
      trampolin.setDepth(1); // el trampolín está detrás del jugador

      // ajustar el área de colisión, solo la parte rosa del trampolin
      trampolin.body.setSize(32, 8);  // ancho 32px, alto 8px 
      trampolin.body.setOffset(0, 24); // mueve el hitbox 24px hacia abajo 
    });

    // cambio de collider por overlap controlar mejor el rebote
    this.physics.add.overlap(this.jugador, this.trampolines, (jugador, trampolin) => {
      if (jugador.body.velocity.y > 0) {
        trampolin.play('trampolin_salto', true);
        jugador.setVelocityY(-450); // fuerza del rebote
        jugador.play('carpincho_salta', true);
      }
    });

    // grupo de alfajores / items
    this.alfajores = this.physics.add.group({
      allowGravity: false
    });

    const objetosItems = this.map.getObjectLayer("items").objects;
    objetosItems.forEach(obj => {
      const alfajor = this.alfajores.create(obj.x, obj.y, 'alfajor_animado').setOrigin(0.5, 1);
      alfajor.play('alfajor_brillo'); // animación de brillo

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
    this.alfajorIcono = this.add.sprite(4, 12, 'alfajor_animado')
      .setOrigin(0, 0.5)
      .setScale(1)
      .setScrollFactor(0);
    this.alfajorIcono.play('alfajor_brillo');

    this.textoAlfajores = this.add.text(20, 8, 'x0', {
      fontFamily: 'PressStart2P',
      fontSize: '8px',
      color: '#ffffff',
      resolution: 2
    }).setScrollFactor(0).setOrigin(0);

    // texto del tiempo jugado
    this.textoTiempo = this.add.text(220, 8, 'Time: 0s', {
      fontFamily: 'PressStart2P',
      fontSize: '8px',
      color: '#ffffff',
      resolution: 2
    }).setScrollFactor(0).setOrigin(0);

    // temporizador de juego (suma 1 segundo por segundo)
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.tiempoJugado++;
        this.textoTiempo.setText(`Time: ${this.tiempoJugado}s`);
      }
    });
  }

  update() {
    const scrollX = Math.floor(this.cameras.main.scrollX);

    this.nubesA.tilePositionX = scrollX * 0.5;
    this.nubes2A.tilePositionX = scrollX * 0.3;
    this.cielo.tilePositionX = scrollX * 0.2;

    if (this.jugador.body.blocked.down) {
      if (this.jugador.anims.currentAnim && this.jugador.anims.currentAnim.key !== 'carpincho_avanza') {
        this.jugador.setFrame(5); // aterriza
        this.time.delayedCall(100, () => {
          this.jugador.play('carpincho_avanza');
        });
      }
      this.saltos = 0;
    }

    if (Phaser.Input.Keyboard.JustDown(this.teclaEspacio) && this.saltos < 2) {
      this.jugador.setVelocityY(-300);
      this.saltos++;
      this.jugador.play('carpincho_salta', true);
    }

    if (!this.jugador.body.blocked.down && this.jugador.body.velocity.y > 0) {
      this.jugador.setFrame(4); // caída
    }

    // si el jugador se cae de la plataforma
    if (this.jugador.y > this.map.heightInPixels + 100) {
      this.scene.start('gameOver', {
      tiempoFinal: this.tiempoJugado,
      alfajores: this.alfajoresRecolectados
      });
    }
  }
}
