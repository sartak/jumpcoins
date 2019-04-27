// @flow
import React, { Component } from 'react';
import * as dat from 'dat.gui';
import Engine from './Engine';
import twitchLogo from './assets/public/twitchLogo.png';
import twitterLogo from './assets/public/twitterLogo.png';
import defaultProps from './props';

function Debug() {
  Object.keys(defaultProps).forEach((key) => {
    this[key] = defaultProps[key];
  });
}

export default class Stream extends Component<any> {
  debug = new Debug();

  gui = new dat.GUI({ autoPlace: false });

  constructor(props: any) {
    super(props);

    const { gui, debug } = this;

    const engine = gui.addFolder('Engine');
    engine.add(debug, 'time').listen();
    engine.add(debug, 'frameTime').listen();
    engine.add(debug, 'physics.debug');

    const input = gui.addFolder('Input');
    input.add(debug, 'input.upButtonDown').listen();
    input.add(debug, 'input.downButtonDown').listen();
    input.add(debug, 'input.leftButtonDown').listen();
    input.add(debug, 'input.rightButtonDown').listen();
    input.add(debug, 'input.jumpButtonDown').listen();

    input.add(debug, 'keyboard.Z').listen();
    input.add(debug, 'keyboard.X').listen();
    input.add(debug, 'keyboard.C').listen();
    input.add(debug, 'keyboard.up').listen();
    input.add(debug, 'keyboard.down').listen();
    input.add(debug, 'keyboard.left').listen();
    input.add(debug, 'keyboard.right').listen();

    input.add(debug, 'gamepad.A').listen();
    input.add(debug, 'gamepad.B').listen();
    input.add(debug, 'gamepad.X').listen();
    input.add(debug, 'gamepad.Y').listen();
    input.add(debug, 'gamepad.L1').listen();
    input.add(debug, 'gamepad.L2').listen();
    input.add(debug, 'gamepad.R1').listen();
    input.add(debug, 'gamepad.R2').listen();
    input.add(debug, 'gamepad.up').listen();
    input.add(debug, 'gamepad.down').listen();
    input.add(debug, 'gamepad.left').listen();
    input.add(debug, 'gamepad.right').listen();
    input.add(debug, 'gamepad.l_stick.x').listen();
    input.add(debug, 'gamepad.l_stick.y').listen();
    input.add(debug, 'gamepad.r_stick.x').listen();
    input.add(debug, 'gamepad.r_stick.y').listen();

    const rules = gui.addFolder('Rules');
    rules.add(debug, 'invincibility_ms', 0, 10000);
    rules.add(debug, 'min_ignore_input_ms', 0, 500);
    rules.add(debug, 'spike_knockback.x', 0, 500);
    rules.add(debug, 'spike_knockback.y', 0, 500);
    rules.add(debug, 'velocityX.walk', 0, 1000);
    rules.add(debug, 'velocityX.jump', 0, 1000);
    rules.add(debug, 'velocityX.double_jump', 0, 1000);
    rules.add(debug, 'velocityX.wall_jump', 0, 1000);
    rules.add(debug, 'velocityX.reversed_wall_jump', 0, 1000);
    rules.add(debug, 'velocityY.jump', 0, 1000);
    rules.add(debug, 'velocityY.double_jump', 0, 1000);
    rules.add(debug, 'velocityY.wall_jump', 0, 1000);
    rules.add(debug, 'wall_jump_ignore_direction_ms', 0, 2000);

    const cheats = gui.addFolder('Cheats');
    cheats.add(debug, 'cheat.hearty');
    cheats.add(debug, 'cheat.forbidDoubleJump');
    cheats.add(debug, 'cheat.forbidWallJump');
    cheats.add(debug, 'winLevel');
    cheats.add(debug, 'restartLevel');
    cheats.add(debug, 'previousLevel');

    const level = gui.addFolder('Level');
    level.add(debug, 'level.name').listen();
    level.add(debug, 'level.index').listen();
    level.add(debug, 'level.file').listen();

    const player = gui.addFolder('Player');
    player.add(debug, 'player.life').listen();
    player.add(debug, 'player.x').listen();
    player.add(debug, 'player.y').listen();
    player.add(debug, 'player.velocity.x').listen();
    player.add(debug, 'player.velocity.y').listen();
    player.add(debug, 'player.invincible').listen();
    player.add(debug, 'player.ignoreInput').listen();
    player.add(debug, 'player.canCancelIgnoreInput').listen();
    player.add(debug, 'player.canDoubleJump').listen();
    player.add(debug, 'player.isDoubleJumping').listen();
    player.add(debug, 'player.canWallJump').listen();
    player.add(debug, 'player.isWallJumping').listen();
    player.add(debug, 'player.wallJumpIgnoreDirection').listen();
    player.add(debug, 'player.wallJumpContinuing').listen();
    player.add(debug, 'player.wallJumpDirectionLeft').listen();
    player.add(debug, 'player.touching.up').listen();
    player.add(debug, 'player.touching.down').listen();
    player.add(debug, 'player.touching.left').listen();
    player.add(debug, 'player.touching.right').listen();

    const vfx = gui.addFolder('Visual Effects');
    vfx.add(debug, 'effect.damageBlur.amount', 0, 50.0);
    vfx.add(debug, 'effect.damageBlur.in_ms', 0, 2000);
    vfx.add(debug, 'effect.damageBlur.out_ms', 0, 2000);
    vfx.add(debug, 'damageBlur');

    Object.keys(defaultProps).forEach((key) => {
      // eslint-disable-next-line no-underscore-dangle
      if (gui.__controllers.filter(controller => controller.property === key).length) {
        return;
      }

      let foundController = false;
      // eslint-disable-next-line no-underscore-dangle
      Object.keys(gui.__folders).forEach((folderName) => {
        // eslint-disable-next-line no-underscore-dangle
        if (gui.__folders[folderName].__controllers.filter(controller => controller.property === key).length) {
          foundController = true;
        }
      });

      if (foundController) {
        return;
      }

      gui.add(debug, key);
    });
  }

  render() {
    return (
      <div className="stream">
        <Engine debugger={this.debug} />
        <Debugger gui={this.gui} />
      </div>
    );
  }
}

class Debugger extends Component<any> {
  debugRef = null;

  constructor(props: any) {
    super(props);
    this.debugRef = React.createRef();
  }

  componentDidMount() {
    if (this.debugRef && this.debugRef.current) {
      this.debugRef.current.append(this.props.gui.domElement);
    }
  }

  render() {
    return (
      <div className="debugger">
        <ul>
          <li><a target="_blank" rel="noopener noreferrer" href="https://labs.phaser.io/">labs</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://photonstorm.github.io/phaser3-docs/">phaser docs</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://lodash.com/docs/4.17.11">lodash</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://sfbgames.com/chiptone/">chiptone</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://pernyblom.github.io/abundant-music/index.html">abundant</a></li>
          <li><div ref={this.debugRef} id="debug-container" /></li>
        </ul>
      </div>
    );
  }
}

