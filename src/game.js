/* @flow */
import Phaser from 'phaser';
import _ from 'lodash';
import props from './props';

import levelHello from './assets/maps/hello.map';

import tileWall from './assets/tiles/wall.png';

import spritePlayerDefault from './assets/sprites/player-default.png';

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
      // debug: DEBUG,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
  levels: [
    levelHello,
  ],
  mapWidth: 30,
  mapHeight: 22,
  tileWidth: 24,
  tileHeight: 24,
  tileDefinitions: {
    '.': null, // background
    '#': {
      image: 'tileWall',
    },
    '@': null, // player
  },
};

const state : any = {
  game: null,
  physics: null,
  cursors: null,
  keys: {},
  debug: null,
  level: {},
};

function prop(name: string) {
  if (DEBUG && name in window.props) {
    return window.props[name];
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
  const game = new Phaser.Game(config);

  if (DEBUG) {
    window.game = game;
    window.props = debug;

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
  game.load.image('spritePlayerDefault', spritePlayerDefault);
}

function parseMap(lines, level) {
  const map = _.range(config.mapHeight).map(() => _.range(config.mapWidth).map(() => null));

  if (lines.length !== config.mapHeight) {
    throw new Error(`Wrong map height: got ${lines.length} expected ${config.mapHeight} in ${level.name}`);
  }

  const locationForTile = {};

  lines.forEach((line, y) => {
    if (line.length !== config.mapWidth) {
      throw new Error(`Wrong map width: got ${line.length} expected ${config.mapWidth} in ${level.name}`);
    }

    line.split('').forEach((tileCharacter, x) => {
      const tile = config.tileDefinitions[tileCharacter];
      if (tile === undefined) {
        throw new Error(`Invalid tile character '${tileCharacter}' in ${level.name}`);
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
    throw new Error(`Missing @ for player location in ${level.name}`);
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
    debug.levelName = level.name;
    debug.levelIndex = index;
  }

  state.level = level;

  createPlayer();

  return level;
}

function positionToScreenCoordinate(x, y) {
  const { width, height, mapWidth, mapHeight, tileWidth, tileHeight } = config;
  const xBorder = (width - (mapWidth * tileWidth)) / 2;
  const yBorder = (height - (mapHeight * tileHeight)) / 2;
  return [x * tileWidth + xBorder, y * tileHeight + yBorder];
}

function renderInitialLevel() {
  const { game, level, physics } = state;
  const { map } = level;
  const { tileWidth, tileHeight } = config;

  const halfWidth = tileWidth / 2;
  const halfHeight = tileHeight / 2;

  const tiles = physics.add.staticGroup();

  map.forEach((row, r) => {
    row.forEach((tile, c) => {
      if (tile) {
        const [x, y] = positionToScreenCoordinate(c, r);
        tiles.create(x + halfWidth, y + halfHeight, tile.image);
      }
    });
  });

  level.tiles = tiles;
}

function createPlayer() {
  const { physics, level } = state;

  const location = level.playerLocation;
  const [x, y] = positionToScreenCoordinate(location[0], location[1]);
  const player = physics.add.sprite(x, y, 'spritePlayerDefault');

  player.x += player.width / 2;
  player.y += player.height / 2;

  level.player = player;
  return player;
}

function setupPhysics() {
  const { level, physics } = state;
  const { player, tiles } = level;

  physics.add.collider(player, tiles);
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
  }

  createLevel(0);
  renderInitialLevel();
  setupPhysics();

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

  listenProp('input.upButtonDown', state.upButtonDown);
  listenProp('input.downButtonDown', state.downButtonDown);
  listenProp('input.leftButtonDown', state.leftButtonDown);
  listenProp('input.rightButtonDown', state.rightButtonDown);
  listenProp('input.jumpButtonDown', state.jumpButtonDown);
}

function update(time, dt) {
  const { game, keys, cursors, debug } = state;

  listenProp('time', time);
  listenProp('frameTime', dt);

  readInput();
}

