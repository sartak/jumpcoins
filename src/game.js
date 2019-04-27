/* @flow */
import Phaser from 'phaser';
import _ from 'lodash';
import props from './props';

import levelHello from './assets/maps/hello.map';

import levelDoubleJump from './assets/maps/doublejump.map';
import levelDoubleJumpA from './assets/maps/doublejump-a.map';
import levelDoubleJumpB from './assets/maps/doublejump-b.map';
import levelDoubleJumpBB from './assets/maps/doublejump-bb.map';
import levelDoubleJumpC from './assets/maps/doublejump-c.map';
import levelDoubleJumpD from './assets/maps/doublejump-d.map';

import levelWallJump from './assets/maps/walljump.map';
import levelWallJumpA from './assets/maps/walljump-a.map';
import levelWallJumpB from './assets/maps/walljump-b.map';

import levelBye from './assets/maps/bye.map';

import tileWall from './assets/tiles/wall.png';
import tileExit from './assets/tiles/exit.png';
import tileSpikesUp from './assets/tiles/spikes-up.png';
import tileSpikesDown from './assets/tiles/spikes-down.png';
import tileSpikesLeft from './assets/tiles/spikes-left.png';
import tileSpikesRight from './assets/tiles/spikes-right.png';
import tileEye from './assets/tiles/eye.png';

import spritePlayerDefault from './assets/sprites/player-default.png';

import spriteHeart from './assets/sprites/heart.png';

// YOUR LIFE IS CURRENCY

const DEBUG = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');

const config = {
  debug: DEBUG,
  type: Phaser.AUTO,
  parent: 'engine',
  width: 800,
  height: 600,
  input: {
    gamepad: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false, // will be populated based on dat.gui just in time
    },
  },
  scene: {
    preload,
    create,
    update,
  },
  levels: [
    levelHello,

    levelDoubleJump,
    levelDoubleJumpA,
    levelDoubleJumpB,
    levelDoubleJumpC,
    levelDoubleJumpBB,
    levelDoubleJumpD,

    levelWallJump,
    levelWallJumpA,
    levelWallJumpB,

    levelBye,
  ],
  mapWidth: 30,
  mapHeight: 22,
  tileWidth: 24,
  tileHeight: 24,
  tileDefinitions: {
    '.': null, // background
    '#': {
      image: 'tileWall',
      group: 'ground',
      combineVertical: true,
    },
    '+': {
      image: 'tileExit',
      group: 'exit',
    },
    '^': {
      image: 'tileSpikesUp',
      group: 'spikes',
      knockback: true,
    },
    v: {
      image: 'tileSpikesDown',
      group: 'spikes',
      knockback: true,
    },
    '<': {
      image: 'tileSpikesLeft',
      group: 'spikes',
      knockback: 'right',
    },
    '>': {
      image: 'tileSpikesRight',
      group: 'spikes',
      knockback: 'left',
    },
    '0': {
      image: 'tileEye',
      group: 'ground',
    },
    '@': null, // player
  },

  // filled in next
  xBorder: 0,
  yBorder: 0,
};

{
  const { width, height, mapWidth, mapHeight, tileWidth, tileHeight } = config;
  config.xBorder = (width - (mapWidth * tileWidth)) / 2;
  config.yBorder = (height - (mapHeight * tileHeight)) / 2;
}

const state : any = {
  game: null,
  physics: null,
  cursors: null,
  keys: {},
  debug: null,
  level: {},
  commands: {},
};

function prop(name: string): any {
  if (DEBUG && name in window.props) {
    return window.props[name];
  }

  if (name.match(/^cheat\./)) {
    return false;
  }

  return props[name];
}

function listenProp(name: string, value: any) {
  if (!DEBUG) {
    return;
  }

  window.props[name] = value;
}

const Shader = new Phaser.Class({
  Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,
  initialize: function Shader(game) {
    Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
      game,
      renderer: game.renderer,
      fragShader: `
        precision mediump float;
        uniform vec2      resolution;
        uniform sampler2D uMainSampler;
        varying vec2      outTexCoord;

        void main( void ) {
          vec2 uv = outTexCoord;
          vec4 c = texture2D(uMainSampler, uv);
          gl_FragColor = vec4(c.r*c.a, c.g*c.a, c.b*c.a, 1.0);
        }`,
    });
  },
});

if (DEBUG) {
  window.state = state;
  window.config = config;
  window._ = _;
}

export default function startGame(debug: any) {
  if (DEBUG) {
    window.props = debug;
  }

  config.physics.arcade.debug = prop('physics.debug');

  const game = new Phaser.Game(config);

  if (DEBUG) {
    window.game = game;

    window.state.commands.winLevel = winLevel;
    window.state.commands.restartLevel = restartLevel;
    window.state.commands.previousLevel = previousLevel;

    Object.keys(props).forEach((key) => {
      debug[key] = props[key];
    });
  }

  return game;
}

function preload() {
  const game = state.game = this;

  if (DEBUG) {
    state.debug = window.props;
  }

  config.levels.forEach((levelFile, i) => {
    game.load.text(`level-${i}`, levelFile);
  });

  game.load.image('tileWall', tileWall);
  game.load.image('tileExit', tileExit);
  game.load.image('tileSpikesUp', tileSpikesUp);
  game.load.image('tileSpikesDown', tileSpikesDown);
  game.load.image('tileSpikesLeft', tileSpikesLeft);
  game.load.image('tileSpikesRight', tileSpikesRight);
  game.load.image('tileEye', tileEye);

  game.load.image('spritePlayerDefault', spritePlayerDefault);
  game.load.image('spriteHeart', spriteHeart);
}

function parseMap(lines, level) {
  const map = _.range(config.mapHeight).map(() => _.range(config.mapWidth).map(() => null));

  if (lines.length !== config.mapHeight) {
    err(`Wrong map height: got ${lines.length} expected ${config.mapHeight} in ${level.name}`);
  }

  const locationForTile = {};

  lines.forEach((line, y) => {
    if (line.length !== config.mapWidth) {
      err(`Wrong map width: got ${line.length} expected ${config.mapWidth} in ${level.name}`);
    }

    line.split('').forEach((tileCharacter, x) => {
      const tile = config.tileDefinitions[tileCharacter];
      if (tile === undefined) {
        err(`Invalid tile character '${tileCharacter}' in ${level.name}`);
      }

      locationForTile[tileCharacter] = [x, y];

      // background tile
      if (tile === null) {
        return;
      }

      map[y][x] = { ...tile, x, y };
    });
  });

  const playerLocation = locationForTile['@'];
  if (!playerLocation) {
    err(`Missing @ for player location in ${level.name}`);
  }

  return {
    map,
    playerLocation,
  };
}

function parseLevel(levelDefinition) {
  const { mapHeight } = config;
  const allLines = levelDefinition.split('\n');
  const mapLines = allLines.slice(0, mapHeight);
  const levelJSON = allLines.slice(mapHeight).join('\n');

  let level = JSON.parse(levelJSON);
  level = {
    ...level,
    ...parseMap(mapLines, level),
  };

  return level;
}

function createLevel(index) {
  const { game, debug } = state;

  const level = parseLevel(game.cache.text.get(`level-${index}`));

  if (DEBUG) {
    window.level = level;
  }

  state.level = level;

  listenProp('level.name', level.name);
  listenProp('level.index', index);

  const filename = config.levels[index];
  const match = filename.match(/\/([^/]+)\.\w+\.map$/);
  if (match) {
    listenProp('level.file', `${match[1]}.map`);
  } else {
    listenProp('level.file', filename);
  }

  level.hud = {};

  renderMap();

  createPlayer();

  return level;
}

function positionToScreenCoordinate(x, y) {
  const { tileWidth, tileHeight, xBorder, yBorder } = config;
  return [x * tileWidth + xBorder, y * tileHeight + yBorder];
}

function renderMap() {
  const { game, level, physics } = state;
  const { map } = level;
  const { tileWidth, tileHeight } = config;

  const halfWidth = tileWidth / 2;
  const halfHeight = tileHeight / 2;

  const images = [];
  const tiles = {};
  const toCombine = _.range(config.mapWidth).map(() => []);

  map.forEach((row, r) => {
    row.forEach((tile, c) => {
      if (!tile) {
        return;
      }

      let [x, y] = positionToScreenCoordinate(c, r);
      x += halfWidth;
      y += halfHeight;

      if (tile.combineVertical) {
        toCombine[c].push(tile);
        const image = game.add.image(x, y, tile.image);
        images.push(image);
      } else {
        if (!tiles[tile.group]) {
          tiles[tile.group] = physics.add.staticGroup();
        }

        const body = tiles[tile.group].create(x, y, tile.image);
        body.config = tile;
      }
    });
  });

  toCombine.forEach((column) => {
    if (!column.length) {
      return;
    }

    column.sort((a, b) => a.y - b.y);

    const processGroup = (members) => {
      const [tile] = members;
      if (!tiles[tile.group]) {
        tiles[tile.group] = physics.add.staticGroup();
      }

      let [x, y] = positionToScreenCoordinate(tile.x, tile.y);
      x += halfWidth;
      y += halfHeight;
      const body = tiles[tile.group].create(x, y, tile.image);
      body.setSize(tileWidth, tileHeight * members.length);
      body.config = tile;
    };

    let group = [column.shift()];
    while (column.length) {
      const tile = column.shift();
      const prevTile = group[group.length-1];
      if (tile.y === prevTile.y + 1 && tile.group === prevTile.group) {
        group.push(tile);
      } else {
        processGroup(group);
        group = [tile];
      }
    }
    processGroup(group);
  });

  level.tiles = tiles;
  level.images = images;
}

function createPlayer() {
  const { game, physics, level } = state;

  const location = level.playerLocation;
  const [x, y] = positionToScreenCoordinate(location[0], location[1]);
  const player = physics.add.sprite(x, y, 'spritePlayerDefault');

  player.x += player.width / 2;
  player.y += player.height / 2;

  player.life = level.baseLife;

  player.setSize(player.width * 0.8, player.height * 0.8, true);

  level.player = player;
  return player;
}

function destroyGroup(group) {
  const children = [];
  group.children.iterate(child => children.push(child));
  children.forEach(child => child.destroy());
  group.destroy(true);
}

function removePhysics() {
  const { physics } = state;
  physics.world.colliders.destroy();
}

function destroyLevel(playerOnly) {
  const { level } = state;
  const { tiles, images, player, hud } = level;
  const { hearts, hints } = hud;

  if (!playerOnly) {
    Object.keys(level.tiles).forEach((name) => {
      const group = level.tiles[name];
      destroyGroup(group);
    });

    images.forEach((image) => {
      image.destroy();
    });
  }

  hearts.forEach((heart) => {
    heart.destroy();
  });

  hints.forEach((hint) => {
    hint.destroy();
  });

  player.destroy();
}

function winLevel() {
  const { game, level } = state;

  if (level.isWinning) {
    return;
  }

  level.isWinning = true;

  removePhysics();

  // defer this to avoid crashes while removing during collider callback
  game.time.addEvent({
    callback: () => {
      destroyLevel(false);

      state.levelIndex++;
      if (state.levelIndex === config.levels.length) {
        state.levelIndex = 0;
      }

      setupLevel();
    },
  });
}

function restartLevel() {
  state.levelIndex--;
  winLevel();
}

function previousLevel() {
  state.levelIndex -= 2;
  winLevel();
}

function setPlayerInvincible() {
  const { game, level } = state;
  const { player } = level;

  player.invincible = true;
  player.fastInvincible = false;
  player.alpha = 1;

  player.invincibleTween = game.tweens.add({
    targets: player,
    alpha: 0.5,
    duration: 300,
    ease: t => (t < 0.8 ? 0 : 1),
    yoyo: true,
    loop: -1,
    onUpdate: () => {
      if (player.fastInvincible && player.alpha >= 1) {
        player.invincibleTween.stop();
        player.invincibleTween = game.tweens.add({
          targets: player,
          alpha: 0.5,
          duration: 100,
          ease: t => (t < 0.8 ? 0 : 1),
          yoyo: true,
          loop: -1,
        });
      }
    },
  });

  game.time.addEvent({
    delay: prop('invincibility_ms') * 0.5,
    callback: () => {
      player.fastInvincible = true;
    },
  });

  game.time.addEvent({
    delay: prop('invincibility_ms'),
    callback: () => {
      player.invincible = false;
      player.invincibleTween.stop();
      player.alpha = 1;
    },
  });
}

function spendLife(isVoluntary) {
  const { level } = state;
  const { player } = level;

  if (prop('cheat.hearty')) {
    return;
  }

  player.life--;

  const heart = level.hud.hearts.pop();

  // this should never happen, but better to not crash…
  if (heart) {
    heart.destroy();
  }

  if (player.life <= 0) {
    respawn();
  }
}


function takeSpikeDamage(object1, object2) {
  const { game, level } = state;
  const { player } = level;

  if (player.invincible) {
    return;
  }

  const spikes = object1.config && object1.config.group === 'spikes' ? object1 : object2;
  const { knockback } = spikes.config;

  spendLife(false);

  setPlayerInvincible();

  if (knockback === 'left' || (knockback === true && player.facingLeft)) {
    player.setVelocityX(prop('spike_knockback.x'));
  } else if (knockback === 'right' || (knockback === true && !player.facingLeft)) {
    player.setVelocityX(-prop('spike_knockback.x'));
  }

  if (knockback) {
    player.setVelocityY(-prop('spike_knockback.y'));

    player.ignoreInput = true;
    player.canCancelIgnoreInput = false;

    game.time.addEvent({
      delay: prop('min_ignore_input_ms'),
      callback: () => {
        player.canCancelIgnoreInput = true;
      },
    });
  }
}

function setupLevelPhysics(isInitial) {
  const { game, level, physics } = state;
  const { player, tiles } = level;

  physics.add.collider(player, tiles.ground);
  physics.add.overlap(player, tiles.exit, winLevel);
  physics.add.collider(player, tiles.spikes, takeSpikeDamage);
}

function renderHud() {
  const { game, level } = state;
  const { player, hud, hint } = level;

  hud.hearts = _.range(player.life).map((i) => {
    const x = 2 * config.tileWidth;
    const y = 0;
    const heart = game.add.image(x, y, 'spriteHeart');
    heart.x += heart.width / 2 + heart.width * i;
    heart.y += config.yBorder / 2;
    return heart;
  });

  hud.hints = [];
  if (hint) {
    const label = game.add.text(
      config.width / 2,
      config.height * 0.25,
      hint,
      {
        fontFamily: '"Avenir Next", "Avenir", "Helvetica Neue", "Helvetica", "Arial"',
        fontSize: '20px',
        color: 'rgb(246, 196, 86)',
      },
    );
    label.setStroke('#000000', 6);
    label.x -= label.width / 2;
    label.y -= label.height / 2;
    hud.hints.push(label);
  }
}

function respawn() {
  const { game, level } = state;
  const { player } = level;

  if (player.isRespawning) {
    return;
  }

  player.isRespawning = true;

  game.time.addEvent({
    callback: () => {
      destroyLevel(true);
      createPlayer();
      renderHud();
      setupLevelPhysics(false);
    },
  });
}

function setupLevel() {
  const { levelIndex } = state;
  createLevel(levelIndex);
  renderHud();
  setupLevelPhysics(true);
}

function create() {
  const { game } = state;

  state.physics = game.physics;

  state.cursors = game.input.keyboard.createCursorKeys();

  ['Z', 'X', 'C'].forEach((code) => {
    state.keys[code] = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[code]);
  });

  if (config.debug) {
    game.input.keyboard.on('keydown_Q', () => {
      game.scene.stop();
      const engine = document.querySelector('#engine canvas');
      if (engine) {
        engine.remove();
      }
    });

    game.input.keyboard.on('keydown_W', () => {
      winLevel();
    });

    game.input.keyboard.on('keydown_R', () => {
      restartLevel();
    });

    game.input.keyboard.on('keydown_P', () => {
      previousLevel();
    });
  }

  state.levelIndex = 0;
  setupLevel();

  if (game.game.renderer.type === Phaser.WEBGL) {
    state.shader = game.game.renderer.addPipeline('Shader', new Shader(game.game));
    state.shader.setFloat2('resolution', config.width, config.height);
    game.cameras.main.setRenderToTexture(state.shader);
  }
}

function readInput() {
  const { game, keys, cursors, debug } = state;

  state.upButtonDown = cursors.up.isDown;
  state.leftButtonDown = cursors.left.isDown;
  state.rightButtonDown = cursors.right.isDown;
  state.downButtonDown = cursors.down.isDown;

  state.jumpButtonDown = keys.Z.isDown;

  listenProp('keyboard.Z', keys.Z.isDown);
  listenProp('keyboard.X', keys.X.isDown);
  listenProp('keyboard.C', keys.C.isDown);
  listenProp('keyboard.up', cursors.up.isDown);
  listenProp('keyboard.down', cursors.down.isDown);
  listenProp('keyboard.left', cursors.left.isDown);
  listenProp('keyboard.right', cursors.right.isDown);

  if (game.input.gamepad.total) {
    const pads = game.input.gamepad.gamepads;
    pads.filter(pad => pad).forEach((pad) => {
      const { A, B, X, Y, L1, L2, R1, R2, up, down, left, right, leftStick, rightStick } = pad;

      state.upButtonDown = state.upButtonDown || up;
      state.leftButtonDown = state.leftButtonDown || left;
      state.rightButtonDown = state.rightButtonDown || right;
      state.downButtonDown = state.downButtonDown || down;

      state.jumpButtonDown = state.jumpButtonDown || A;

      listenProp('gamepad.A', A);
      listenProp('gamepad.B', B);
      listenProp('gamepad.X', X);
      listenProp('gamepad.Y', Y);
      listenProp('gamepad.L1', L1 > 0);
      listenProp('gamepad.L2', L2 > 0);
      listenProp('gamepad.R1', R1 > 0);
      listenProp('gamepad.R2', R2 > 0);
      listenProp('gamepad.up', up);
      listenProp('gamepad.down', down);
      listenProp('gamepad.left', left);
      listenProp('gamepad.right', right);
      listenProp('gamepad.l_stick.x', leftStick.x);
      listenProp('gamepad.l_stick.y', leftStick.y);
      listenProp('gamepad.r_stick.x', rightStick.x);
      listenProp('gamepad.r_stick.y', rightStick.y);
    });
  }

  if (state.jumpButtonDown) {
    state.jumpButtonFrames = (state.jumpButtonFrames || 0) + 1;
    state.jumpButtonStarted = state.jumpButtonFrames === 1;
  } else {
    state.jumpButtonFrames = 0;
    state.jumpButtonStarted = false;
  }

  listenProp('input.upButtonDown', state.upButtonDown);
  listenProp('input.downButtonDown', state.downButtonDown);
  listenProp('input.leftButtonDown', state.leftButtonDown);
  listenProp('input.rightButtonDown', state.rightButtonDown);
  listenProp('input.jumpButtonDown', state.jumpButtonDown);
}

function processInput() {
  const { game, level, upButtonDown, downButtonDown, leftButtonDown, rightButtonDown, jumpButtonStarted } = state;
  const { player } = level;

  if (player.ignoreInput) {
    return;
  }

  const isStanding = player.body.touching.down;

  if (jumpButtonStarted) {
    if (isStanding) {
      player.setVelocityY(-prop('velocityY.jump'));
    } else if (player.canWallJump && ((player.body.touching.left && leftButtonDown) || (player.body.touching.right && rightButtonDown))) {
      player.setVelocityY(-prop('velocityY.wall_jump'));
      if (player.body.touching.right) {
        player.facingLeft = true;
        player.wallJumpDirectionLeft = true;
      } else {
        player.facingLeft = false;
        player.wallJumpDirectionLeft = false;
      }

      player.isWallJumping = true;
      player.wallJumpIgnoreDirection = true;
      player.wallJumpContinuing = false;
      spendLife(true);

      game.time.addEvent({
        delay: prop('wall_jump_ignore_direction_ms'),
        callback: () => {
          player.wallJumpIgnoreDirection = false;
          player.wallJumpContinuing = true;
        },
      });

      player.isDoubleJumping = false;
    } else if (player.canDoubleJump && upButtonDown) {
      player.setVelocityY(-prop('velocityY.double_jump'));
      player.isDoubleJumping = true;

      player.isWallJumpingFalse = false;
      player.wallJumpIgnoreDirection = false;
      player.wallJumpContinuing = false;

      spendLife(true);
    }
  }

  if (player.wallJumpContinuing) {
    if ((player.wallJumpDirectionLeft && !leftButtonDown) || (!player.wallJumpDirectionLeft && !rightButtonDown)) {
      player.wallJumpContinuing = false;
    }
  }

  if (player.wallJumpIgnoreDirection || player.wallJumpContinuing) {
    const x = prop('velocityX.wall_jump');
    if (player.facingLeft) {
      player.setVelocityX(-x);
    } else {
      player.setVelocityX(x);
    }
  } else {
    let x = prop('velocityX.walk');
    if (!isStanding) {
      if (player.isWallJumping && ((player.wallJumpDirectionLeft && rightButtonDown) || (!player.wallJumpDirectionLeft && leftButtonDown))) {
        x = prop('velocityX.reversed_wall_jump');
      } else if (player.isDoubleJumping) {
        x = prop('velocityX.double_jump');
      } else {
        x = prop('velocityX.jump');
      }
    }

    if (leftButtonDown) {
      player.setVelocityX(-x);
      player.facingLeft = true;
    } else if (rightButtonDown) {
      player.setVelocityX(x);
      player.facingLeft = false;
    } else {
      player.setVelocityX(0);
    }
  }
}

function renderDebug() {
  const { level } = state;
  const { player } = level;

  listenProp('player.life', player.life);
  listenProp('player.x', player.x);
  listenProp('player.y', player.y);
  listenProp('player.velocity.x', player.body.velocity.x);
  listenProp('player.velocity.y', player.body.velocity.y);
  listenProp('player.invincible', player.invincible);
  listenProp('player.ignoreInput', player.ignoreInput);
  listenProp('player.canCancelIgnoreInput', player.canCancelIgnoreInput);
  listenProp('player.canDoubleJump', player.canDoubleJump);
  listenProp('player.isDoubleJumping', player.isDoubleJumping);
  listenProp('player.canWallJump', player.canWallJump);
  listenProp('player.isWallJumping', player.isWallJumping);
  listenProp('player.wallJumpIgnoreDirection', player.wallJumpIgnoreDirection);
  listenProp('player.wallJumpContinuing', player.wallJumpContinuing);
  listenProp('player.wallJumpDirectionLeft', player.wallJumpDirectionLeft);
  listenProp('player.touching.up', player.body.touching.up);
  listenProp('player.touching.down', player.body.touching.down);
  listenProp('player.touching.left', player.body.touching.left);
  listenProp('player.touching.right', player.body.touching.right);
}

function frameUpdates() {
  const { level } = state;
  const { player } = level;

  if (player.ignoreInput && player.canCancelIgnoreInput) {
    if (player.body.touching.down || player.body.touching.left || player.body.touching.right || player.body.touching.up) {
      player.ignoreInput = false;
      player.canCancelIgnoreInput = false;
    }
  }

  if (player.body.touching.down) {
    player.canDoubleJump = true;
    player.isDoubleJumping = false;

    if (prop('cheat.forbidDoubleJump')) {
      player.canDoubleJump = false;
    }

    player.canWallJump = true;
    player.isWallJumping = false;
    player.wallJumpIgnoreDirection = false;
    player.wallJumpContinuing = false;

    if (prop('cheat.forbidWallJump')) {
      player.canWallJump = false;
    }
  }
}

function update(time, dt) {
  const { game, keys, cursors, debug } = state;

  listenProp('time', time);
  listenProp('frameTime', dt);

  frameUpdates();

  readInput();
  processInput();

  if (DEBUG) {
    renderDebug();
  }
}

let didAlert = false;
function err(msg) {
  if (!didAlert) {
    // eslint-disable-next-line no-alert
    alert(msg);
    didAlert = true;
  }

  throw new Error(msg);
}

