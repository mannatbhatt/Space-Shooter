import Phaser from 'phaser';

import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';

import './style.css';

const config = {
  type: Phaser.AUTO,

  width: 1000,
  height: 600,

  parent: 'app',

  backgroundColor: '#050816',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  scene: [
    BootScene,
    MenuScene
  ]
};

new Phaser.Game(config);