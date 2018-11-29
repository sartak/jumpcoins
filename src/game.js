/* @flow */
import Phaser from "phaser";

var config = {
  type: Phaser.AUTO,
  parent: "engine",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 }
    }
  }
};

export var game;

export default function startGame() {
  game = new Phaser.Game(config);
}
