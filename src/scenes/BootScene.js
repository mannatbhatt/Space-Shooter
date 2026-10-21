import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {

  constructor() {
    super({
      key: 'BootScene'
    });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#050816');

    // Animated galaxy background
    for (let i = 0; i < 120; i++) {

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
        duration: Phaser.Math.Between(600, 1800),
        yoyo: true,
        repeat: -1
      });
    }

    // Game title
    this.add.text(
      width / 2,
      height / 2 - 100,
      'SPACE SHOOTER',
      {
        fontFamily: 'Arial',
        fontSize: '52px',
        fontStyle: 'bold',
        color: '#00eaff'
      }
    ).setOrigin(0.5);

    // Loading message
    this.add.text(
      width / 2,
      height / 2 - 30,
      'PREPARING YOUR MISSION...',
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    // Loading bar background
    this.add.rectangle(
      width / 2,
      height / 2 + 40,
      320,
      18,
      0x202040
    );

    // Loading bar fill
    const progressBar = this.add.rectangle(
      width / 2 - 155,
      height / 2 + 40,
      0,
      12,
      0x00eaff
    ).setOrigin(0, 0.5);

    // Loading animation
    this.tweens.add({
      targets: progressBar,
      width: 310,
      duration: 2500,
      ease: 'Linear',

      onComplete: () => {
        this.scene.start('MenuScene');
      }
    });
  }
}