import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.playerData = {
      username: data.username || 'Pilot',
      ship: data.ship || 'Phantom X',
      difficulty: data.difficulty || 'Easy'
    };
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#050816');

    // --------------------------------
    // 1. ANIMATED STARFIELD
    // --------------------------------

    for (let i = 0; i < 150; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Math.random()
      );

      this.tweens.add({
        targets: star,
        y: height + 5,
        duration: Phaser.Math.Between(2500, 7000),
        repeat: -1,
        onRepeat: () => {
          star.y = -5;
        }
      });
    }

    // --------------------------------
    // 2. SHIP CONFIGURATION
    // --------------------------------

    const shipConfigs = {
      'Phantom X': {
        color: 0x00eaff,
        speed: 420,
        fireRate: 250
      },

      'Titan Defender': {
        color: 0x8dff87,
        speed: 280,
        fireRate: 350
      },

      'Nova Striker': {
        color: 0xff73d0,
        speed: 340,
        fireRate: 140
      }
    };

    this.shipConfig =
      shipConfigs[this.playerData.ship] ||
      shipConfigs['Phantom X'];

    // --------------------------------
    // 3. DIFFICULTY CONFIGURATION
    // --------------------------------

    const difficultyConfigs = {
      Easy: {
        enemySpeed: 110,
        spawnDelay: 1700,
        scoreMultiplier: 1
      },

      Medium: {
        enemySpeed: 170,
        spawnDelay: 1100,
        scoreMultiplier: 1.5
      },

      Hard: {
        enemySpeed: 250,
        spawnDelay: 650,
        scoreMultiplier: 2
      }
    };

    this.difficultyConfig =
      difficultyConfigs[this.playerData.difficulty] ||
      difficultyConfigs.Easy;

    // --------------------------------
    // 4. PLAYER SPACESHIP
    // --------------------------------

    this.player = this.add.container(
      width / 2,
      height - 100
    );

    const wings = this.add.triangle(
      0,
      12,
      -40,
      25,
      0,
      -40,
      40,
      25,
      this.shipConfig.color
    );

    const cockpit = this.add.circle(
      0,
      -5,
      9,
      0xffffff
    );

    const engine = this.add.rectangle(
      0,
      30,
      14,
      20,
      0xff8c00
    );

    this.player.add([wings, engine, cockpit]);

    this.tweens.add({
      targets: engine,
      scaleY: 1.4,
      alpha: 0.6,
      duration: 150,
      yoyo: true,
      repeat: -1
    });

    // --------------------------------
    // 5. KEYBOARD CONTROLS
    // --------------------------------

    this.cursors = this.input.keyboard.createCursorKeys();

    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      shoot: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    ]);

    // --------------------------------
    // 6. LASERS + ENEMIES
    // --------------------------------

    this.lasers = [];
    this.enemies = [];

    this.lastFired = 0;
    this.laserSpeed = 700;

    this.score = 0;

    // --------------------------------
    // 7. HUD
    // --------------------------------

    this.add.text(
      25,
      20,
      `PILOT: ${this.playerData.username}`,
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff'
      }
    );

    this.add.text(
      25,
      50,
      `SHIP: ${this.playerData.ship}`,
      {
        fontFamily: 'Arial',
        fontSize: '17px',
        color: '#00eaff'
      }
    );

    this.add.text(
      25,
      80,
      `DIFFICULTY: ${this.playerData.difficulty.toUpperCase()}`,
      {
        fontFamily: 'Arial',
        fontSize: '17px',
        color: '#b388ff'
      }
    );

    this.scoreText = this.add.text(
      width - 25,
      25,
      'SCORE: 0',
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffff66'
      }
    ).setOrigin(1, 0);

    this.add.text(
      width / 2,
      30,
      'A / D or ← / → MOVE  |  SPACE SHOOT',
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#151934',
        padding: { x: 12, y: 8 }
      }
    ).setOrigin(0.5);

    // --------------------------------
    // 8. ENEMY SPAWNING
    // --------------------------------

    this.spawnTimer = this.time.addEvent({
      delay: this.difficultyConfig.spawnDelay,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  // --------------------------------
  // 9. GAME LOOP
  // --------------------------------

  update(time, delta) {
    const { width, height } = this.scale;

    const dt = delta / 1000;

    // PLAYER MOVEMENT
    if (this.cursors.left.isDown || this.keys.left.isDown) {
      this.player.x -= this.shipConfig.speed * dt;
    }

    if (this.cursors.right.isDown || this.keys.right.isDown) {
      this.player.x += this.shipConfig.speed * dt;
    }

    this.player.x = Phaser.Math.Clamp(
      this.player.x,
      45,
      width - 45
    );

    // SHOOTING
    if (
      this.keys.shoot.isDown &&
      time > this.lastFired + this.shipConfig.fireRate
    ) {
      this.fireLaser();
      this.lastFired = time;
    }

    // MOVE LASERS
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];

      laser.y -= this.laserSpeed * dt;

      if (laser.y < -30) {
        laser.destroy();
        this.lasers.splice(i, 1);
      }
    }

    // MOVE ENEMIES
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      enemy.y += enemy.speed * dt;

      // Remove enemies that leave the screen
      if (enemy.y > height + 50) {
        enemy.destroy();
        this.enemies.splice(i, 1);
        continue;
      }

      // LASER COLLISIONS
      for (let j = this.lasers.length - 1; j >= 0; j--) {
        const laser = this.lasers[j];

        const distance = Phaser.Math.Distance.Between(
          laser.x,
          laser.y,
          enemy.x,
          enemy.y
        );

        if (distance < 30) {
          this.createExplosion(enemy.x, enemy.y);

          enemy.destroy();
          laser.destroy();

          this.enemies.splice(i, 1);
          this.lasers.splice(j, 1);

          this.score += Math.round(
            10 * this.difficultyConfig.scoreMultiplier
          );

          this.scoreText.setText(`SCORE: ${this.score}`);

          break;
        }
      }
    }
  }

  // --------------------------------
  // 10. FIRE LASER
  // --------------------------------

  fireLaser() {
    const laser = this.add.rectangle(
      this.player.x,
      this.player.y - 45,
      6,
      26,
      this.shipConfig.color
    );

    this.lasers.push(laser);
  }

  // --------------------------------
  // 11. SPAWN ENEMY
  // --------------------------------

  spawnEnemy() {
    const { width } = this.scale;

    const x = Phaser.Math.Between(50, width - 50);

    const enemyColors = [
      0xff4444,
      0xff9900,
      0xaa55ff
    ];

    const color = Phaser.Utils.Array.GetRandom(enemyColors);

    const enemy = this.add.container(x, -40);

    // Enemy spaceship body
    const body = this.add.triangle(
      0,
      0,
      -28,
      -20,
      0,
      25,
      28,
      -20,
      color
    );

    const cockpit = this.add.circle(
      0,
      0,
      7,
      0xffffff
    );

    enemy.add([body, cockpit]);

    enemy.speed = this.difficultyConfig.enemySpeed +
      Phaser.Math.Between(-20, 30);

    this.enemies.push(enemy);
  }

  // --------------------------------
  // 12. EXPLOSION EFFECT
  // --------------------------------

  createExplosion(x, y) {
    const colors = [
      0xff4444,
      0xffaa00,
      0xffff66
    ];

    for (let i = 0; i < 12; i++) {
      const particle = this.add.circle(
        x,
        y,
        Phaser.Math.Between(2, 5),
        Phaser.Utils.Array.GetRandom(colors)
      );

      const angle = Phaser.Math.FloatBetween(
        0,
        Math.PI * 2
      );

      const distance = Phaser.Math.Between(25, 65);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0,
        duration: 350,
        onComplete: () => particle.destroy()
      });
    }
  }
}