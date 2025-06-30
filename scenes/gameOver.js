export default class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  init(data) {
    this.alfajoresRecolectados = 0;
    this.tiempoJugado = 0;
  }

  preload() {
    this.load.spritesheet('jugador', 'public/assets/jugador.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('cielo', 'public/assets/cielo.png');
    this.load.image('nubes', 'public/assets/nubes.png');
    this.load.image('nubes2', 'public/assets/nubes2.png');
    this.load.image('plataformaTierra', 'public/assets/tilemap/plataformaTierra.png');
    this.load.image('obstaculos', 'public/assets/tilemap/obstaculos.png');
    this.load.tilemapTiledJSON('plataformas', 'public/assets/tilemap/plataformas.json');
    this.load.spritesheet('trampolin', 'public/assets/trampolin.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('alfajor_animado', 'public/assets/alfajorSpriteSheet.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('spacebar', 'public/assets/spaceBar.png', { frameWidth: 96, frameHeight: 32 });
  }

  create() {
    this.cielo = this.add.tileSprite(0, 0, 320, 240, 'cielo').setOrigin(0).setScrollFactor(0);
    this.nubesA = this.add.tileSprite(0, -15, 320, 240, 'nubes').setOrigin(0).setScrollFactor(0);
    this.nubes2A = this.add.tileSprite(0, -10, 320, 240, 'nubes2').setOrigin(0).setScrollFactor(0);
    ['cielo', 'nubes', 'nubes2'].forEach(key => this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST));

    this.map = this.make.tilemap({ key: 'plataformas' });
    const tilesetPlataforma = this.map.addTilesetImage('plataformaTierra', 'plataformaTierra');
    const tilesetObstaculos = this.map.addTilesetImage('obstaculos', 'obstaculos');

    const layer = this.map.createLayer('plataformas', tilesetPlataforma, 0, 0);
    layer.setCollisionByProperty({ colision: true });

    this.map.createLayer('obstaculos', tilesetObstaculos, 0, 0); // solo visual, sin colisión

    this.obstaculos = this.physics.add.staticGroup();
    const objetosObstaculos = this.map.getObjectLayer("colisionObs").objects;
    objetosObstaculos.forEach(obj => {
      const obstaculo = this.obstaculos.create(obj.x, obj.y, null).setOrigin(0);
      obstaculo.body.setSize(obj.width, obj.height);
    });

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 200);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    this.anims.create({ key: 'trampolin_salto', frames: this.anims.generateFrameNumbers('trampolin', { start: 0, end: 5 }), frameRate: 10, repeat: 0 });
    this.anims.create({ key: 'alfajor_brillo', frames: this.anims.generateFrameNumbers('alfajor_animado', { start: 0, end: 4 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'carpincho_avanza', frames: this.anims.generateFrameNumbers('jugador', { start: 0, end: 1 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'carpincho_salta', frames: this.anims.generateFrameNumbers('jugador', { start: 1, end: 3 }), frameRate: 12, repeat: 0 });
    this.anims.create({ key: 'spacebar_anim', frames: this.anims.generateFrameNumbers('spacebar', { start: 0, end: 1 }), frameRate: 2, repeat: -1 });

    const objetoJugador = this.map.getObjectLayer("jugador").objects[0];
    this.jugador = this.physics.add.sprite(objetoJugador.x, objetoJugador.y, 'jugador');
    this.jugador.setOrigin(0.5, 1);
    this.jugador.setVelocityX(120);
    this.teclaEspacio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.jugador.setCollideWorldBounds(true);
    this.jugador.setDepth(2);
    this.physics.add.collider(this.jugador, layer);
    this.physics.add.collider(this.jugador, this.obstaculos, () => {
      this.scene.start('GameOver', { tiempoFinal: this.tiempoJugado, alfajores: this.alfajoresRecolectados });
    });

    this.cameras.main.startFollow(this.jugador, true, 1, 1);
    this.cameras.main.setFollowOffset(-80, 0);
    this.jugador.play('carpincho_avanza');
    this.saltos = 0;

    if (!this.registry.get('tutorialVisto')) {
      this.indicacionSalto = this.add.sprite(this.jugador.x - 90, this.jugador.y - 40, 'spacebar').setScrollFactor(0).setDepth(1).setAlpha(0.8).play('spacebar_anim');
      this.tutorialActivo = true;
      this.registry.set('tutorialVisto', true);
    } else {
      this.tutorialActivo = false;
    }

    this.trampolines = this.physics.add.group({ allowGravity: false, immovable: true });
    const objetosTrampolines = this.map.getObjectLayer("trampolines").objects;
    objetosTrampolines.forEach(obj => {
      const trampolin = this.trampolines.create(obj.x, obj.y, 'trampolin');
      trampolin.setOrigin(0, 1);
      trampolin.setDepth(1);
      trampolin.body.setSize(32, 8);
      trampolin.body.setOffset(0, 24);
    });

    this.physics.add.overlap(this.jugador, this.trampolines, (jugador, trampolin) => {
      if (jugador.body.velocity.y > 0) {
        trampolin.play('trampolin_salto', true);
        jugador.setVelocityY(-450);
        jugador.play('carpincho_salta', true);
      }
    });

    this.alfajores = this.physics.add.group({ allowGravity: false });
    const objetosItems = this.map.getObjectLayer("items").objects;
    objetosItems.forEach(obj => {
      const alfajor = this.alfajores.create(obj.x, obj.y, 'alfajor_animado').setOrigin(0.5, 1);
      alfajor.play('alfajor_brillo');
      this.tweens.add({ targets: alfajor, y: alfajor.y - 5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    this.physics.add.overlap(this.jugador, this.alfajores, (jugador, alfajor) => {
      alfajor.destroy();
      this.alfajoresRecolectados++;
      this.textoAlfajores.setText(`x${this.alfajoresRecolectados}`);
    });

    this.alfajorIcono = this.add.sprite(20, 18, 'alfajor_animado').setOrigin(0, 0.5).setScale(1).setScrollFactor(0);
    this.alfajorIcono.play('alfajor_brillo');
    this.textoAlfajores = this.add.bitmapText(40, 15, "PublicPixel", 'x0', 8).setScrollFactor(0).setOrigin(0).setTint(0xf80eae);
    this.textoTiempo = this.add.bitmapText(230, 15, "PublicPixel", 'Time: 0s', 8).setScrollFactor(0).setOrigin(0);

    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      this.tiempoJugado++;
      this.textoTiempo.setText(`Time: ${this.tiempoJugado}s`);
    }});
  }

  update() {
    const scrollX = Math.floor(this.cameras.main.scrollX);
    this.nubesA.tilePositionX = scrollX * 0.5;
    this.nubes2A.tilePositionX = scrollX * 0.3;
    this.cielo.tilePositionX = scrollX * 0.2;

    if (this.jugador.body.blocked.down) {
      if (this.jugador.anims.currentAnim && this.jugador.anims.currentAnim.key !== 'carpincho_avanza') {
        this.jugador.setFrame(5);
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

      if (this.tutorialActivo) {
        this.tutorialActivo = false;
        this.indicacionSalto.destroy();
      }
    }

    if (!this.jugador.body.blocked.down && this.jugador.body.velocity.y > 0) {
      this.jugador.setFrame(4);
    }

    if (this.jugador.y > this.map.heightInPixels + 100) {
      this.scene.start('GameOver', {
        tiempoFinal: this.tiempoJugado,
        alfajores: this.alfajoresRecolectados
      });
    }
  }
}