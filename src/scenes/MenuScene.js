import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {

  constructor() {
    super({
      key: 'MenuScene'
    });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#050816');

    // Galaxy background
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
        alpha: 0.2,
        duration: Phaser.Math.Between(700, 1800),
        yoyo: true,
        repeat: -1
      });
    }

    // Game title
    const title = this.add.text(
      width / 2,
      150,
      '🚀 SPACE SHOOTER',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#00eaff'
      }
    ).setOrigin(0.5);

    // Title animation
    this.tweens.add({
      targets: title,
      scale: 1.05,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    // Subtitle
    this.add.text(
      width / 2,
      230,
      'SURVIVE THE GALAXY',
      {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#b388ff'
      }
    ).setOrigin(0.5);

    // START GAME
    this.createButton(
      width / 2,
      350,
      '🚀 START GAME',
      () => {
        this.scene.start('SetupScene');
      }
    );

    // HOW TO PLAY
    this.createButton(
      width / 2,
      430,
      '🎮 HOW TO PLAY',
      () => {
        this.showControls();
      }
    );
  }

  createButton(x, y, text, callback) {

    const button = this.add.text(
      x,
      y,
      text,
      {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: '#252550',
        padding: {
          x: 30,
          y: 15
        }
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover effects
    button.on('pointerover', () => {
      button.setStyle({
        backgroundColor: '#673ab7'
      });

      button.setScale(1.05);
    });

    button.on('pointerout', () => {
      button.setStyle({
        backgroundColor: '#252550'
      });

      button.setScale(1);
    });

    button.on('pointerdown', callback);
  }

  showControls() {

    const { width, height } = this.scale;

    // Dark overlay
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.9
    ).setInteractive();

    // Controls information
    const controls = this.add.text(
      width / 2,
      height / 2,
      `🎮 GAME CONTROLS

A / ←       MOVE LEFT

D / →       MOVE RIGHT

SPACE       SHOOT LASERS

P           PAUSE / RESUME

ESC         PAUSE MENU


CLICK ANYWHERE TO CLOSE`,
      {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#00eaff',
        align: 'center',
        lineSpacing: 12
      }
    ).setOrigin(0.5);

    // Close overlay
    overlay.on('pointerdown', () => {
      overlay.destroy();
      controls.destroy();
    });
  }
}