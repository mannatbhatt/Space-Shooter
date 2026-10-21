import Phaser from 'phaser';

import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import SetupScene from './scenes/SetupScene.js';

import './style.css';

// Phaser game configuration
const config = {
  type: Phaser.AUTO,

  parent: 'app',

  width: 1000,
  height: 600,

  backgroundColor: '#050816',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  scene: [
    BootScene,
    MenuScene,
    SetupScene
  ]
};

// Initialize the game
const game = new Phaser.Game(config);

export default game;