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
    // 2. PLAYER INFORMATION
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

    // --------------------------------
    // 3. SPACESHIP CONFIGURATION
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
    // 4. CREATE PLAYER SPACESHIP
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

    this.player.add([
      wings,
      engine,
      cockpit
    ]);

    // Engine animation
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

    // Prevent Space and arrows from scrolling the browser
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    ]);

    // --------------------------------
    // 6. LASER SYSTEM
    // --------------------------------

    this.lasers = [];

    this.lastFired = 0;

    this.laserSpeed = 700;

    // --------------------------------
    // 7. INSTRUCTIONS
    // --------------------------------

    this.add.text(
      width / 2,
      45,
      'A / D or ← / → to MOVE   |   SPACE to SHOOT',
      {
        fontFamily: 'Arial',
        fontSize: '17px',
        color: '#ffffff',
        backgroundColor: '#151934',
        padding: {
          x: 15,
          y: 10
        }
      }
    ).setOrigin(0.5);

    this.add.text(
      width / 2,
      85,
      'DESTROY THE ENEMIES!',
      {
        fontFamily: 'Arial',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#00eaff'
      }
    ).setOrigin(0.5);
  }

  // --------------------------------
  // 8. GAME LOOP
  // --------------------------------

  update(time, delta) {
    if (!this.player) return;

    const { width } = this.scale;

    // Convert milliseconds to seconds
    const deltaSeconds = delta / 1000;

    // LEFT MOVEMENT
    if (
      this.cursors.left.isDown ||
      this.keys.left.isDown
    ) {
      this.player.x -=
        this.shipConfig.speed * deltaSeconds;
    }

    // RIGHT MOVEMENT
    if (
      this.cursors.right.isDown ||
      this.keys.right.isDown
    ) {
      this.player.x +=
        this.shipConfig.speed * deltaSeconds;
    }

    // Keep spaceship inside screen
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

    // UPDATE LASERS
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];

      laser.y -= this.laserSpeed * deltaSeconds;

      // Remove laser when it leaves the screen
      if (laser.y < -30) {
        laser.destroy();
        this.lasers.splice(i, 1);
      }
    }
  }

  // --------------------------------
  // 9. FIRE LASER
  // --------------------------------

  fireLaser() {
    const laserColor = this.shipConfig.color;

    const laser = this.add.rectangle(
      this.player.x,
      this.player.y - 45,
      6,
      26,
      laserColor
    );

    // Glow effect using a second rectangle
    const glow = this.add.rectangle(
      0,
      0,
      12,
      32,
      laserColor,
      0.25
    );

    const laserContainer = this.add.container(
      laser.x,
      laser.y,
      [glow]
    );

    // Keep the actual laser as the moving projectile
    this.lasers.push(laser);

    // Remove glow with the projectile
    this.tweens.add({
      targets: laserContainer,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        laserContainer.destroy();
      }
    });
  }
}