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

    // Starfield background
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

    // HUD
    this.add.text(25, 20, `PILOT: ${this.playerData.username}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    });

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

    // Select spaceship color
    const shipColors = {
      'Phantom X': 0x00eaff,
      'Titan Defender': 0x8dff87,
      'Nova Striker': 0xff73d0
    };

    const shipColor =
      shipColors[this.playerData.ship] || 0x00eaff;

    // Draw player spaceship
    this.player = this.add.container(width / 2, height - 100);

    const wings = this.add.triangle(
      0,
      12,
      -40,
      25,
      0,
      -40,
      40,
      25,
      shipColor
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

    // Spaceship idle animation
    this.tweens.add({
      targets: this.player,
      y: height - 108,
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    // Mission ready message
    const message = this.add.text(
      width / 2,
      height / 2 - 30,
      'MISSION READY',
      {
        fontFamily: 'Arial',
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#00eaff'
      }
    ).setOrigin(0.5);

    this.add.text(
      width / 2,
      height / 2 + 20,
      'Movement and shooting are coming in Step 4.2!',
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: message,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1
    });
  }
}