/* @flow */
import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  parent: 'engine',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 200,
      },
    },
  },
};

export default function startGame() {
  return new Phaser.Game(config);
}
