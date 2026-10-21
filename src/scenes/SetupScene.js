import Phaser from 'phaser';

export default class SetupScene extends Phaser.Scene {
  constructor() {
    super('SetupScene');

    this.selectedShip = 'Phantom X';
    this.selectedDifficulty = 'Easy';
    this.usernameInput = null;
  }

  create() {
    const { width, height } = this.scale;

    this.selectedShip = 'Phantom X';
    this.selectedDifficulty = 'Easy';

    this.cameras.main.setBackgroundColor('#050816');

    // Galaxy background
    for (let i = 0; i < 110; i++) {
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

    // Title
    this.add.text(width / 2, 48, 'MISSION SETUP', {
      fontFamily: 'Arial',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#00eaff'
    }).setOrigin(0.5);

    // Username label
    this.add.text(width / 2, 105, 'ENTER YOUR PILOT NAME', {
      fontFamily: 'Arial',
      fontSize: '17px',
      color: '#b388ff'
    }).setOrigin(0.5);

    // Phaser DOM input is not required: create a native input.
    this.usernameInput = document.createElement('input');

    this.usernameInput.type = 'text';
    this.usernameInput.placeholder = 'Your username';
    this.usernameInput.maxLength = 20;
    this.usernameInput.value =
      localStorage.getItem('spaceShooterUsername') || '';

    Object.assign(this.usernameInput.style, {
      position: 'absolute',
      width: '240px',
      height: '34px',
      boxSizing: 'border-box',
      border: '2px solid #00eaff',
      borderRadius: '8px',
      background: '#11132d',
      color: '#ffffff',
      textAlign: 'center',
      fontSize: '16px',
      fontFamily: 'Arial',
      outline: 'none',
      zIndex: '10'
    });

    const canvas = this.game.canvas;
    const parent = canvas.parentElement;

    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    parent.appendChild(this.usernameInput);

    const positionInput = () => {
      if (!this.usernameInput) return;

      const canvasRect = canvas.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();

      const scaleX = canvasRect.width / width;
      const scaleY = canvasRect.height / height;

      const inputWidth = 240 * scaleX;
      const inputHeight = 34 * scaleY;

      Object.assign(this.usernameInput.style, {
        width: `${inputWidth}px`,
        height: `${inputHeight}px`,
        left: `${
          canvasRect.left - parentRect.left +
          canvasRect.width / 2 - inputWidth / 2
        }px`,
        top: `${
          canvasRect.top - parentRect.top + 132 * scaleY
        }px`
      });
    };

    positionInput();

    window.addEventListener('resize', positionInput);

    // Ship selection
    this.add.text(width / 2, 205, 'CHOOSE YOUR SPACESHIP', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const ships = [
      {
        name: 'Phantom X',
        immunity: 80,
        ability: 'Speed',
        color: 0x00eaff
      },
      {
        name: 'Titan Defender',
        immunity: 100,
        ability: 'Defense',
        color: 0x8dff87
      },
      {
        name: 'Nova Striker',
        immunity: 90,
        ability: 'Lasers',
        color: 0xff73d0
      }
    ];

    const shipCards = [];

    ships.forEach((ship, index) => {
      const x = 210 + index * 290;
      const y = 295;

      const card = this.add.rectangle(
        x,
        y,
        255,
        135,
        0x171b3e
      )
        .setStrokeStyle(2, 0x505579)
        .setInteractive({ useHandCursor: true });

      this.add.text(x, y - 42, ship.name, {
        fontFamily: 'Arial',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);

      this.add.text(
        x,
        y - 6,
        `Immunity: ${ship.immunity}%`,
        {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#00eaff'
        }
      ).setOrigin(0.5);

      this.add.text(x, y + 28, `Specialty: ${ship.ability}`, {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#c4b5fd'
      }).setOrigin(0.5);

      shipCards.push({ card, ship });

      card.on('pointerdown', () => {
        this.selectedShip = ship.name;
        updateShipSelection();
      });
    });

    const updateShipSelection = () => {
      shipCards.forEach(({ card, ship }) => {
        const selected = ship.name === this.selectedShip;

        card.setStrokeStyle(
          selected ? 4 : 2,
          selected ? ship.color : 0x505579
        );
      });
    };

    updateShipSelection();

    // Difficulty selection
    this.add.text(width / 2, 405, 'SELECT DIFFICULTY', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const difficultyButtons = [];

    ['Easy', 'Medium', 'Hard'].forEach((difficulty, index) => {
      const x = 330 + index * 170;

      const button = this.add.text(
        x,
        452,
        difficulty.toUpperCase(),
        {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#ffffff',
          backgroundColor: '#252550',
          padding: { x: 20, y: 12 }
        }
      )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      difficultyButtons.push({ button, difficulty });

      button.on('pointerdown', () => {
        this.selectedDifficulty = difficulty;
        updateDifficultySelection();
      });
    });

    const updateDifficultySelection = () => {
      difficultyButtons.forEach(({ button, difficulty }) => {
        button.setStyle({
          backgroundColor:
            difficulty === this.selectedDifficulty
              ? '#673ab7'
              : '#252550'
        });
      });
    };

    updateDifficultySelection();

    // Feedback message
    const feedback = this.add.text(
      width / 2,
      508,
      '',
      {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#ff7777'
      }
    ).setOrigin(0.5);

    // Start Mission
    const startButton = this.add.text(
      width / 2,
      550,
      '🚀 START MISSION',
      {
        fontFamily: 'Arial',
        fontSize: '23px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#673ab7',
        padding: { x: 26, y: 12 }
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startButton.on('pointerover', () => {
      startButton.setScale(1.05);
    });

    startButton.on('pointerout', () => {
      startButton.setScale(1);
    });

    startButton.on('pointerdown', () => {
      const username = this.usernameInput.value.trim();

      if (!username) {
        feedback.setText('Please enter your pilot name!');
        return;
      }

      const playerData = {
        username,
        ship: this.selectedShip,
        difficulty: this.selectedDifficulty
      };

      localStorage.setItem('spaceShooterUsername', username);

      this.scene.start('GameScene', playerData);
    });

    // Clean up the HTML input when leaving the scene
    this.events.once('shutdown', () => {
      window.removeEventListener('resize', positionInput);

      if (this.usernameInput) {
        this.usernameInput.remove();
        this.usernameInput = null;
      }
    });
  }
}