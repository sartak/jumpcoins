/* @flow */
import Phaser from 'phaser';
import _ from 'lodash';

import boardSprite from './assets/board.png';
import block1Sprite from './assets/block-1.png';
import block2Sprite from './assets/block-2.png';
import block3Sprite from './assets/block-3.png';
import block4Sprite from './assets/block-4.png';
import block5Sprite from './assets/block-5.png';

const DEBUG = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');

const props = {
};

const config = {
  debug: DEBUG,
  type: Phaser.AUTO,
  parent: 'engine',
  width: 700,
  height: 700,
  input: {
    gamepad: true,
  },
  physics: {
    default: 'arcade',
  },
  scene: {
    preload,
    create,
    update,
  },
  gameWidth: 10,
  gameHeight: 20,
  boxSize: 30,
};

const state : any = {
  game: null,
  physics: null,
  cursors: null,
  keys: {},
  debug: null,
  time: 0,
  prevTime: 0,
  speed: 800,
  board: _.range(config.gameHeight).map(() => _.range(config.gameWidth).map(() => null)),
  active: true,
  lines: 0,
};

const pieces = [
  // #
  // #
  // #
  // #
  [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[3, 0], [3, 1], [3, 2], [3, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
  ],

  // ##
  // #
  // #
  [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[0, 2], [1, 0], [1, 1], [1, 2]],
  ],

  // #
  // #
  // ##
  [
    [[0, 1], [1, 1], [2, 0], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [0, 2], [1, 1], [2, 1]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
  ],

  // ##
  // ##
  [
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
  ],

  //  ##
  // ##
  [
    [[0, 1], [1, 0], [2, 0], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[0, 2], [1, 2], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
  ],

  // ###
  //  #
  [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 1]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 0], [1, 1], [1, 2]],
  ],

  // ##
  //  ##
  [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[1, 1], [1, 2], [2, 1], [2, 0]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [0, 2], [1, 1], [1, 0]],
  ],
];

function prop(name: string) {
  if (DEBUG && name in window.props) {
    return window.props[name];
  }
  return props[name];
}

if (DEBUG) {
  window.state = state;
  window._ = _;
}

export default function startGame(debug: any) {
  const game = new Phaser.Game(config);

  if (DEBUG) {
    window.game = game;
    window.props = debug;
  }

  return game;
}

function preload() {
  const game = state.game = this;

  if (DEBUG) {
    state.debug = window.props;
  }

  game.load.image('board', boardSprite);
  game.load.image('block-1', block1Sprite);
  game.load.image('block-2', block2Sprite);
  game.load.image('block-3', block3Sprite);
  game.load.image('block-4', block4Sprite);
  game.load.image('block-5', block5Sprite);
}

function create() {
  const { game } = state;

  const physics = state.physics = game.physics;

  state.cursors = game.input.keyboard.createCursorKeys();

  if (config.debug) {
    game.input.keyboard.on('keydown_Q', () => {
      game.scene.stop();
      const engine = document.querySelector('#engine canvas');
      if (engine) {
        engine.remove();
      }
    });
  }

  state.keys.SPACE = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  state.background = physics.add.image(config.width / 2, config.height / 2, 'board');
  state.origin = { x: config.width / 2 - state.background.width / 2, y: config.height / 2 + state.background.height / 2 };
}

function fallControlledPiece() {
  const { controlledPiece, board } = state;

  if (controlledPiece) {
    let comesToRest = false;
    controlledPiecePositions().forEach(({ x, y }) => {
      if (y === 0) {
        comesToRest = true;
      } else if (board[y - 1][x]) {
        comesToRest = true;
      }
    });

    if (comesToRest) {
      controlledPiecePositions().forEach(({ x, y }) => {
        board[y][x] = controlledPiece.color;
      });

      state.controlledPiece = null;
    } else {
      controlledPiece.origin.y--;
    }

    return true;
  }

  return false;
}

function clearLines() {
  const { board } = state;

  let clearedLine = false;

  board.forEach((line, y) => {
    let hasEmpty = false;
    line.forEach((block, x) => {
      if (!block) {
        hasEmpty = true;
      }
    });

    if (hasEmpty) {
      return;
    }

    clearedLine = true;
    state.lines++;
    state.speed -= 20;
    if (state.debug) {
      state.debug.lines = state.lines;
      state.debug.speed = state.speed;
    }

    line.forEach((block, x) => {
      line[x] = null;
    });
  });

  return clearedLine;
}

function fallUncontrolled() {
  const { board } = state;

  let fellLine = false;

  board.forEach((line, y) => {
    if (y === 0) {
      return;
    }

    let hasBlock = false;
    let hasBlocker = false;
    line.forEach((block, x) => {
      if (board[y][x]) {
        hasBlock = true;
      }
      if (board[y-1][x]) {
        hasBlocker = true;
      }
    });

    if (hasBlocker || !hasBlock) {
      return;
    }

    line.forEach((block, x) => {
      board[y-1][x] = board[y][x];
      board[y][x] = null;
    });
    fellLine = true;
  });

  return fellLine;
}

function rotate(piece) {
  return [...piece];
}

function controlledPiecePositions(dr = 0) {
  const { controlledPiece } = state;
  const positions = [];

  if (controlledPiece) {
    controlledPiece.piece[(controlledPiece.rotation + dr) % 4].forEach(([ox, oy]) => {
      const x = controlledPiece.origin.x + ox;
      const y = controlledPiece.origin.y - oy;
      positions.push({ x, y });
    });
  }

  return positions;
}

function addNewPiece() {
  const { board } = state;
  const piece = pieces[_.random(pieces.length-1)];
  const rotation = _.random(0, 3);
  const color = _.random(1, 5);

  const origin = { x: Math.floor(config.gameWidth / 2) - 1, y: config.gameHeight - 1 };

  state.controlledPiece = { origin, piece, rotation, color };
  let hasCollision = false;
  controlledPiecePositions().forEach(({ x, y }) => {
    if (board[y][x]) {
      hasCollision = true;
    }
  });

  return !hasCollision;
}

function loseGame() {
  state.active = false;
}

function renderBoard() {
  const { physics, origin, board } = state;
  const { boxSize } = config;

  if (state.boxes) {
    state.boxes.forEach(box => box.destroy());
  }

  const renderBox = (column, row, color) => {
    const x = origin.x + boxSize / 2 + column * boxSize;
    const y = origin.y - boxSize / 2 - row * boxSize;
    return physics.add.image(x, y, `block-${color}`);
  };

  state.boxes = [];
  board.forEach((line, row) => {
    line.forEach((color, column) => {
      if (!color) {
        return;
      }

      state.boxes.push(renderBox(column, row, color));
    });
  });

  controlledPiecePositions().forEach(({ x, y }) => {
    state.boxes.push(renderBox(x, y, state.controlledPiece.color));
  });

  return false;
}

function handleStrafe(dx) {
  const { controlledPiece, board } = state;

  if (controlledPiece) {
    let canStrafe = true;
    controlledPiecePositions().forEach(({ x, y }) => {
      if (x + dx < 0 || x + dx >= config.gameWidth) {
        canStrafe = false;
      }

      if (board[y][x + dx]) {
        canStrafe = false;
      }
    });

    if (!canStrafe) {
      return true;
    }

    controlledPiece.origin.x += dx;
    return false;
  }

  return true;
}

function handleRotate(dr) {
  const { controlledPiece, board } = state;

  if (controlledPiece) {
    let canRotate = true;

    controlledPiecePositions(dr).forEach(({ x, y }) => {
      if (board[y][x]) {
        canRotate = false;
      }
    });

    if (!canRotate) {
      return true;
    }

    controlledPiece.rotation = (controlledPiece.rotation + dr) % 4;

    return false;
  }

  return true;
}

function update(time) {
  const { game, keys, cursors, debug, speed, active, prevTime } = state;

  const dt = time - prevTime;
  state.prevTime = time;

  if (!active) {
    return;
  }

  if (game.input.gamepad.total) {
    const pads = this.input.gamepad.gamepads;
    pads.filter(pad => pad).forEach((pad) => {
    });
  }

  if (keys.SPACE.isDown) {
    if (!state.spaceDown) {
      state.spaceDown = true;
      if (state.controlledPiece) {
        while (1) {
          if (!fallControlledPiece()) {
            break;
          }
        }
        renderBoard();
        state.time = 0;
        return;
      }
    }
  } else {
    state.spaceDown = false;
  }

  state.time += dt;
  let effectiveSpeed = speed;
  if (state.controlledPiece && cursors.down.isDown) {
    effectiveSpeed /= 10;
  }

  if (cursors.left.isDown) {
    if (!state.leftDown) {
      state.leftDown = true;
      handleStrafe(-1) || renderBoard();
    }
  } else {
    state.leftDown = false;
  }

  if (cursors.right.isDown) {
    if (!state.rightDown) {
      state.rightDown = true;
      handleStrafe(1) || renderBoard();
    }
  } else {
    state.rightDown = false;
  }

  if (cursors.up.isDown) {
    if (!state.upDown) {
      state.upDown = true;
      handleRotate(1) || renderBoard();
    }
  } else {
    state.upDown = false;
  }

  let skipWait = cursors.down.isDown && !state.downDown;
  state.downDown = cursors.down.isDown;

  if (!state.controlledPiece) {
    skipWait = false;
  }

  if (!skipWait && state.time < effectiveSpeed) {
    return;
  }

  state.time = 0;
  fallControlledPiece() || clearLines() || fallUncontrolled() || addNewPiece() || loseGame();
  renderBoard();
}

