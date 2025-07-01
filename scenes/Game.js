export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  init(data) {
    this.alfajoresRecolectados = 0; // contador de ítems recolectados
    this.tiempoJugado = 0; // tiempo total en segundos
    this.velocidadBase = 120; // velocidad inicial del jugador
    this.incrementoVelocidad = 10; // cuánto se incrementa cada 10 segundos

    this.replicas = 1; // cuenta cuántas veces se ha replicado el mapa

    this.replicandoMapa = false; // bandera para evitar múltiples clonaciones simultáneas
  }

  preload() {
    // Carga de sprites y assets
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
    // Fondo y nubes con parallax
    this.cielo = this.add.tileSprite(0, 0, 320, 240, 'cielo').setOrigin(0).setScrollFactor(0);
    this.nubesA = this.add.tileSprite(0, -15, 320, 240, 'nubes').setOrigin(0).setScrollFactor(0);
    this.nubes2A = this.add.tileSprite(0, -10, 320, 240, 'nubes2').setOrigin(0).setScrollFactor(0);

    // Filtro pixelado para mantener estilo retro
    ['cielo', 'nubes', 'nubes2'].forEach(key =>
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
    );

    // Crear mapa y capas de colisión
    this.map = this.make.tilemap({ key: 'plataformas' });
    const tilesetPlataforma = this.map.addTilesetImage('plataformaTierra', 'plataformaTierra');
    const tilesetObstaculos = this.map.addTilesetImage('obstaculos', 'obstaculos');

    const layer = this.map.createLayer('plataformas', tilesetPlataforma, 0, 0);
    layer.setCollisionByProperty({ colision: true });

    const capaObstaculos = this.map.createLayer('obstaculos', tilesetObstaculos, 0, 0);
    capaObstaculos.setCollisionByProperty({ colision: true });

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 200);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // Animaciones
    this.anims.create({
      key: 'trampolin_salto',
      frames: this.anims.generateFrameNumbers('trampolin', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'alfajor_brillo',
      frames: this.anims.generateFrameNumbers('alfajor_animado', { start: 0, end: 4 }),
      frameRate: 6,
      repeat: -1
    });

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

    this.anims.create({
      key: 'spacebar_anim',
      frames: this.anims.generateFrameNumbers('spacebar', { start: 0, end: 1 }),
      frameRate: 2,
      repeat: -1
    });

    // Crear jugador desde la capa de objetos
    const objetoJugador = this.map.getObjectLayer("jugador").objects[0];
    this.jugador = this.physics.add.sprite(objetoJugador.x, objetoJugador.y, 'jugador');
    this.jugador.setOrigin(0.5, 1);
    this.jugador.setVelocityX(this.velocidadBase);
    this.jugador.setCollideWorldBounds(true);
    this.jugador.setDepth(2);
    this.jugador.play('carpincho_avanza');

    this.teclaEspacio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.saltos = 0;

    this.physics.add.collider(this.jugador, layer);

    this.cameras.main.startFollow(this.jugador, true, 1, 1);
    this.cameras.main.setFollowOffset(-80, 0);

    // Tutorial visible solo una vez
    if (!this.registry.get('tutorialVisto')) {
      this.indicacionSalto = this.add.sprite(80, 100, 'spacebar')
        .setScrollFactor(0)
        .setDepth(10)
        .setAlpha(0.8)
        .play('spacebar_anim');

      this.tutorialActivo = true;
      this.registry.set('tutorialVisto', true);
    } else {
      this.tutorialActivo = false;
    }

    // Trampolines
    this.trampolines = this.physics.add.group({ allowGravity: false, immovable: true });
    this.map.getObjectLayer("trampolines").objects.forEach(obj => {
      const trampolin = this.trampolines.create(obj.x, obj.y, 'trampolin');
      trampolin.setOrigin(0, 1).setDepth(1);
      trampolin.body.setSize(32, 8);
      trampolin.body.setOffset(0, 16);
    });

    this.physics.add.overlap(this.jugador, this.trampolines, (jugador, trampolin) => {
      if (jugador.body.velocity.y > 0) {
        trampolin.play('trampolin_salto', true);
        jugador.setVelocityY(-450);
        jugador.play('carpincho_salta', true);
      }
    });

    // Alfajores
    this.alfajores = this.physics.add.group({ allowGravity: false });
    this.map.getObjectLayer("items").objects.forEach(obj => {
      const alfajor = this.alfajores.create(obj.x, obj.y, 'alfajor_animado').setOrigin(0.5, 1);
      alfajor.play('alfajor_brillo');
      this.tweens.add({ targets: alfajor, y: alfajor.y - 5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    this.physics.add.overlap(this.jugador, this.alfajores, (jugador, alfajor) => {
      alfajor.destroy();
      this.alfajoresRecolectados++;
      this.textoAlfajores.setText(`x${this.alfajoresRecolectados}`);
    });

    // HUD
    this.alfajorIcono = this.add.sprite(20, 18, 'alfajor_animado').setOrigin(0, 0.5).setScrollFactor(0);
    this.alfajorIcono.play('alfajor_brillo');

    this.textoAlfajores = this.add.bitmapText(40, 15, "PublicPixel", 'x0', 8).setScrollFactor(0);
    this.textoTiempo = this.add.bitmapText(230, 15, "PublicPixel", 'Time: 0s', 8).setScrollFactor(0);

    // Temporizador de tiempo jugado
    this.time.addEvent({
      delay: 1000, loop: true,
      callback: () => {
        this.tiempoJugado++;
        this.textoTiempo.setText(`Time: ${this.tiempoJugado}s`);
      }
    });

    // Aumentar velocidad cada 10 segundos
    this.time.addEvent({
      delay: 10000, loop: true,
      callback: () => {
        this.velocidadBase += this.incrementoVelocidad;
        this.jugador.setVelocityX(this.velocidadBase);
      }
    });

    // Colisión con obstáculos termina el juego
    this.physics.add.collider(this.jugador, capaObstaculos, () => {
      this.scene.start('GameOver', { tiempoFinal: this.tiempoJugado, alfajores: this.alfajoresRecolectados });
    });

    // Obstáculos invisibles de precisión
    this.obstaculosHitbox = this.physics.add.staticGroup();
    const objetosColision = this.map.getObjectLayer("colisionObj")?.objects;
    if (objetosColision) {
      objetosColision.forEach(obj => {
        const hitbox = this.obstaculosHitbox.create(obj.x, obj.y, null).setOrigin(0)
          .setSize(obj.width, obj.height).setVisible(false);
      });

      this.physics.add.overlap(this.jugador, this.obstaculosHitbox, () => {
        this.scene.start('GameOver', { tiempoFinal: this.tiempoJugado, alfajores: this.alfajoresRecolectados });
      });
    }
  }

  update() {
    // Parallax del fondo
    const scrollX = Math.floor(this.cameras.main.scrollX);
    this.nubesA.tilePositionX = scrollX * 0.5;
    this.nubes2A.tilePositionX = scrollX * 0.3;
    this.cielo.tilePositionX = scrollX * 0.2;

    // Si el jugador está en el suelo, vuelve a caminar
    if (this.jugador.body.blocked.down) {
      if (this.jugador.anims.currentAnim && this.jugador.anims.currentAnim.key !== 'carpincho_avanza') {
        this.jugador.setFrame(5);
        this.time.delayedCall(100, () => this.jugador.play('carpincho_avanza'));
      }
      this.saltos = 0;
    }

    // Salto doble con tecla espacio
    if (Phaser.Input.Keyboard.JustDown(this.teclaEspacio) && this.saltos < 2) {
      this.jugador.setVelocityY(-300);
      this.saltos++;
      this.jugador.play('carpincho_salta', true);

      // Elimina la indicación de salto si estaba activa
      if (this.tutorialActivo) {
        this.tutorialActivo = false;
        if (this.indicacionSalto) this.indicacionSalto.destroy();
        if (this.indicacionTexto) this.indicacionTexto.destroy();
      }
    }

    // Si está cayendo, muestra frame de caída
    if (!this.jugador.body.blocked.down && this.jugador.body.velocity.y > 0) {
      this.jugador.setFrame(4);
    }

    // Si choca lateralmente y no está en el suelo, termina el juego
    if ((this.jugador.body.blocked.left || this.jugador.body.blocked.right) && !this.jugador.body.blocked.down) {
      this.scene.start('GameOver', {
        tiempoFinal: this.tiempoJugado,
        alfajores: this.alfajoresRecolectados
      });
    }

    // Si cae fuera del mapa, termina el juego
    if (this.jugador.y > this.map.heightInPixels + 100) {
      this.scene.start('GameOver', { tiempoFinal: this.tiempoJugado, alfajores: this.alfajoresRecolectados });
    }

    // 🧠 MAPA INFINITO: verifica si hay que clonar el mapa antes de que el jugador llegue al final
    const mapaAncho = this.map.widthInPixels;
    const margenAnticipacion = 320; // cuando falta este margen, ya clona

    if (!this.replicandoMapa && this.jugador.x > mapaAncho * (this.replicas - 1) + mapaAncho - margenAnticipacion) {
      this.replicandoMapa = true;
      this.replicarMapa();

      // Resetea la bandera luego de un breve tiempo para evitar múltiples llamadas
      this.time.delayedCall(100, () => { this.replicandoMapa = false; });
    }
  }

  // Método para clonar el mapa y objetos al final, haciendo el endless runner fluido
  replicarMapa() {
    const offsetX = this.map.widthInPixels * this.replicas;

    // Crea un nuevo tilemap desde el JSON original
    const nuevoTilemap = this.make.tilemap({ key: 'plataformas' });

    // Agrega los tilesets necesarios
    const nuevoTilesetPlataforma = nuevoTilemap.addTilesetImage('plataformaTierra', 'plataformaTierra');
    const nuevoTilesetObstaculos = nuevoTilemap.addTilesetImage('obstaculos', 'obstaculos');

    // Crea las capas del nuevo tilemap en la posición offsetX para que queden pegadas al final del mapa anterior
    const plataformasClonadas = nuevoTilemap.createLayer('plataformas', nuevoTilesetPlataforma, offsetX, 0);
    plataformasClonadas.setCollisionByProperty({ colision: true });
    this.physics.add.collider(this.jugador, plataformasClonadas);

    const obstaculosClonados = nuevoTilemap.createLayer('obstaculos', nuevoTilesetObstaculos, offsetX, 0);
    obstaculosClonados.setCollisionByProperty({ colision: true });
    this.physics.add.collider(this.jugador, obstaculosClonados);

    // Clona trampolines con offsetX
    nuevoTilemap.getObjectLayer("trampolines")?.objects.forEach(obj => {
      const trampolin = this.trampolines.create(obj.x + offsetX, obj.y, 'trampolin');
      trampolin.setOrigin(0, 1).setDepth(1);
      trampolin.body.setSize(32, 8);
      trampolin.body.setOffset(0, 24);
    });

    // Clona alfajores con offsetX y su animación
    nuevoTilemap.getObjectLayer("items")?.objects.forEach(obj => {
      const alfajor = this.alfajores.create(obj.x + offsetX, obj.y, 'alfajor_animado').setOrigin(0.5, 1);
      alfajor.play('alfajor_brillo');
      this.tweens.add({ targets: alfajor, y: alfajor.y - 5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    // Clona hitboxes invisibles de obstáculos con offsetX
    nuevoTilemap.getObjectLayer("colisionObj")?.objects.forEach(obj => {
      const hitbox = this.obstaculosHitbox.create(obj.x + offsetX, obj.y, null)
        .setOrigin(0).setSize(obj.width, obj.height).setVisible(false);
    });

    // Actualiza los límites del mundo y de la cámara para incluir el nuevo fragmento del mapa
    this.replicas++;
    const nuevoAncho = this.map.widthInPixels * this.replicas;
    this.physics.world.setBounds(0, 0, nuevoAncho, this.map.heightInPixels + 200);
    this.cameras.main.setBounds(0, 0, nuevoAncho, this.map.heightInPixels);
  }
}
