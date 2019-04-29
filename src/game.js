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
import levelDoubleJumpE from './assets/maps/doublejump-e.map';
import levelDoubleJumpF from './assets/maps/doublejump-f.map';
import levelDoubleJumpG from './assets/maps/doublejump-g.map';

import levelWallJump from './assets/maps/walljump.map';
import levelWallJumpA from './assets/maps/walljump-a.map';
import levelWallJumpB from './assets/maps/walljump-b.map';
import levelWallJumpC from './assets/maps/walljump-c.map';
import levelWallJumpD from './assets/maps/walljump-d.map';
import levelWallJumpE from './assets/maps/walljump-e.map';
import levelWallJumpF from './assets/maps/walljump-f.map';
import levelWallJumpG from './assets/maps/walljump-g.map';
import levelWallJumpH from './assets/maps/walljump-h.map';

import levelStairs from './assets/maps/stairs.map';
import levelBye from './assets/maps/bye.map';

import tileWall from './assets/tiles/wall.png';
import tileSpikesUp from './assets/tiles/spikes-up.png';
import tileSpikesDown from './assets/tiles/spikes-down.png';
import tileSpikesLeft from './assets/tiles/spikes-left.png';
import tileSpikesRight from './assets/tiles/spikes-right.png';
import tileEye from './assets/tiles/eye.png';
import tileSemiground from './assets/tiles/semiground.png';
import tileTransparent from './assets/tiles/transparent.png';

import spritePlayerDefault from './assets/sprites/player-default.png';
import spritePlayerShielded from './assets/sprites/player-shielded.png';
import spriteFreebie from './assets/sprites/freebie.png';
import spriteHeart from './assets/sprites/heart.png';
import spriteEnemyA from './assets/sprites/enemy-a.png';
import spriteEnemyB from './assets/sprites/enemy-b.png';

import effectImagePuff from './assets/effects/puff.png';
import effectImageSpark from './assets/effects/spark.png';
import effectImageFloodlight from './assets/effects/floodlight.png';
import effectBackgroundScreen from './assets/effects/background-screen.png';
import effectPupil from './assets/effects/pupil.png';
import effectBlack from './assets/effects/black.png';

import badgeCompleted from './assets/badges/completed.png';
import badgeDamageless from './assets/badges/damageless.png';
import badgeDeathless from './assets/badges/deathless.png';
import badgeRich from './assets/badges/rich.png';
import badgeBirdie from './assets/badges/birdie.png';
import badgeKiller from './assets/badges/killer.png';
import badgeEmpty from './assets/badges/empty.png';

import musicWorld1 from './assets/music/world1.mp3';
import musicWorld2 from './assets/music/world2.mp3';
import musicWorld3 from './assets/music/world3.mp3';
import musicBye from './assets/music/bye.mp3';

import soundCoin from './assets/sounds/coin.wav';
import soundJump1 from './assets/sounds/jump1.wav';
import soundJump2 from './assets/sounds/jump2.wav';
import soundJump3 from './assets/sounds/jump3.wav';
import soundDoubleJump from './assets/sounds/doublejump.wav';
import soundWalljump from './assets/sounds/walljump.wav';
import soundKill from './assets/sounds/kill.wav';
import soundWin from './assets/sounds/win.wav';
import soundDie from './assets/sounds/die.wav';
import soundBadge from './assets/sounds/badge.wav';

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
      gravity: { y: 400 },
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
    levelDoubleJumpF,
    levelDoubleJumpA,
    levelDoubleJumpB,
    levelDoubleJumpC,
    levelDoubleJumpG,
    levelDoubleJumpD,
    levelDoubleJumpE,
    levelDoubleJumpBB,

    levelWallJump,
    levelWallJumpB,
    levelWallJumpC,
    levelWallJumpD,
    levelWallJumpE,
    levelWallJumpF,
    levelWallJumpH,
    levelWallJumpG,
    levelWallJumpA,

    levelStairs,
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
      image: 'tileTransparent',
      group: 'exits',
      object: true,
    },
    '^': {
      image: 'tileSpikesUp',
      group: 'spikes',
      knockback: true,
      animate: [0, 1],
    },
    'v': {
      image: 'tileSpikesDown',
      group: 'spikes',
      knockback: true,
      animate: [0, -1],
    },
    '<': {
      image: 'tileSpikesLeft',
      group: 'spikes',
      knockback: 'right',
      animate: [1, 0],
    },
    '>': {
      image: 'tileSpikesRight',
      group: 'spikes',
      knockback: 'left',
      animate: [-1, 0],
    },
    '0': {
      image: 'tileEye',
      group: 'eyes',
      object: true,
    },
    '_': {
      image: 'tileSemiground',
      group: 'semiground',
    },
    '[': {
      image: 'tileWall',
      group: 'movers',
      object: true,
      dynamic: true,
      speed: 40,
      distance: 3,
      movingLeft: true,
    },
    ']': {
      image: 'tileWall',
      group: 'movers',
      object: true,
      dynamic: true,
      speed: 40,
      distance: 3,
    },
    '@': null, // player
    '*': {
      image: 'spriteFreebie',
      group: 'freebies',
      object: true,
    },
    '?': {
      image: 'tileTransparent',
      group: 'removeHints',
      object: true,
    },
    'A': {
      image: 'spriteEnemyA',
      group: 'enemies',
      object: true,
      dynamic: true,
      speed: 30,
      walkAnimation: 'spriteEnemyAWalk',
      killAnimation: 'spriteEnemyADie',
    },
    'a': {
      image: 'spriteEnemyA',
      group: 'enemies',
      object: true,
      dynamic: true,
      startsMovingLeft: true,
      speed: 30,
      walkAnimation: 'spriteEnemyAWalk',
      killAnimation: 'spriteEnemyADie',
    },
    'B': {
      image: 'spriteEnemyB',
      group: 'enemies',
      object: true,
      dynamic: true,
      edgeCareful: true,
      speed: 30,
      walkAnimation: 'spriteEnemyBWalk',
      killAnimation: 'spriteEnemyBDie',
    },
    'b': {
      image: 'spriteEnemyB',
      group: 'enemies',
      object: true,
      dynamic: true,
      edgeCareful: true,
      startsMovingLeft: true,
      speed: 30,
      walkAnimation: 'spriteEnemyBWalk',
      killAnimation: 'spriteEnemyBDie',
    },
  },

  // filled in next
  xBorder: 0,
  yBorder: 0,
};

const SaveStateName = 'jumpcoins_save';
let save = {
  created_at: Date.now(),
  current_level: 0,
  levels: config.levels.map(levelFile => ({
    temp_time_ms: 0,
    total_time_ms: 0,
    best_time_ms: undefined,
    damage_taken: 0,
    jumps: 0,
    doublejumps: 0,
    walljumps: 0,
    deaths: 0,
    badgeCompleted: false,
    badgeDeathless: false,
    badgeDamageless: false,
    badgeRich: false,
    badgeBirdie: false,
    badgeKiller: false,
  })),
};

try {
  const storedSave = localStorage.getItem(SaveStateName);
  if (storedSave) {
    save = JSON.parse(storedSave);
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.log(e);
}

function saveState() {
  save.levels[state.level.index].temp_time_ms = (new Date()).getTime() - state.level.startedAt.getTime();

  try {
    localStorage.setItem(SaveStateName, JSON.stringify(save));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

const JUMP_NORMAL = 1;
const JUMP_DOUBLE = 2;
const JUMP_WALL = 3;

{
  const { width, height, mapWidth, mapHeight, tileWidth, tileHeight } = config;
  config.xBorder = (width - (mapWidth * tileWidth)) / 2;
  config.yBorder = (height - (mapHeight * tileHeight)) / 2;

  Object.keys(config.tileDefinitions).forEach((glyph) => {
    if (config.tileDefinitions[glyph]) {
      config.tileDefinitions.glyph = glyph;
    }
  });
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
        uniform sampler2D u_texture;
        varying vec2      outTexCoord;

        uniform float shockwaveTime;
        uniform vec2  shockwaveCenter;

        uniform float blurEffect;

        void main( void ) {
          vec2 uv = outTexCoord;

          if (shockwaveTime < 10.0) {
            float shockwaveScale = 10.0;
            float shockwaveRange = 0.8;
            float shockwaveThickness = 0.1;
            float shockwaveSpeed = 3.0;
            float shockwaveInner = 0.09;
            float shockwaveDropoff = 40.0;

            float dist = distance(uv, shockwaveCenter);
            float t = shockwaveTime * shockwaveSpeed;

            if (dist <= t + shockwaveThickness && dist >= t - shockwaveThickness && dist >= shockwaveInner) {
              float diff = dist - t;
              float scaleDiff = 1.0 - pow(abs(diff * shockwaveScale), shockwaveRange);
              float diffTime = diff * scaleDiff;

              vec2 diffTexCoord = normalize(uv - shockwaveCenter);
              uv += (diffTexCoord * diffTime) / (t * dist * shockwaveDropoff);
            }
          }

          vec4 c = texture2D(u_texture, uv);

          if (blurEffect > 0.0) {
            float b = blurEffect / resolution.x;
            c *= 0.2270270270;

            c += texture2D(u_texture, vec2(uv.x - 4.0*b, uv.y - 4.0*b)) * 0.0162162162;
            c += texture2D(u_texture, vec2(uv.x - 3.0*b, uv.y - 3.0*b)) * 0.0540540541;
            c += texture2D(u_texture, vec2(uv.x - 2.0*b, uv.y - 2.0*b)) * 0.1216216216;
            c += texture2D(u_texture, vec2(uv.x - 1.0*b, uv.y - 1.0*b)) * 0.1945945946;

            c += texture2D(u_texture, vec2(uv.x + 1.0*b, uv.y + 1.0*b)) * 0.1945945946;
            c += texture2D(u_texture, vec2(uv.x + 2.0*b, uv.y + 2.0*b)) * 0.1216216216;
            c += texture2D(u_texture, vec2(uv.x + 3.0*b, uv.y + 3.0*b)) * 0.0540540541;
            c += texture2D(u_texture, vec2(uv.x + 4.0*b, uv.y + 4.0*b)) * 0.0162162162;
          }

          gl_FragColor = vec4(c.r*c.a, c.g*c.a, c.b*c.a, 1.0);
        }`,
    });
  },
});

if (DEBUG) {
  window.state = state;
  window.config = config;
  window.save = save;
  window._ = _;
}

function analytics(identifier, progress) {
  try {
    if (identifier < 10) {
      identifier = `0${identifier}`;
    }

    window.ga('send', 'event', 'progress', `${identifier} ${progress}`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
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
    window.state.commands.damageBlur = damageBlur;
    window.state.commands.deathShockwave = deathShockwave;
    window.state.commands.jumpShake = jumpShake;

    Object.keys(props).forEach((key) => {
      debug[key] = props[key];
    });
  }

  analytics(0, 'started game');

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
  game.load.image('tileSpikesUp', tileSpikesUp);
  game.load.image('tileSpikesDown', tileSpikesDown);
  game.load.image('tileSpikesLeft', tileSpikesLeft);
  game.load.image('tileSpikesRight', tileSpikesRight);
  game.load.image('tileEye', tileEye);
  game.load.image('tileSemiground', tileSemiground);
  game.load.image('tileTransparent', tileTransparent);

  game.load.spritesheet('spritePlayerDefault', spritePlayerDefault, { frameWidth: config.tileWidth, frameHeight: config.tileHeight });
  game.load.spritesheet('spritePlayerShielded', spritePlayerShielded, { frameWidth: config.tileWidth, frameHeight: config.tileHeight });
  game.load.spritesheet('spriteEnemyA', spriteEnemyA, { frameWidth: config.tileWidth, frameHeight: config.tileHeight });
  game.load.spritesheet('spriteEnemyB', spriteEnemyB, { frameWidth: config.tileWidth, frameHeight: config.tileHeight });
  game.load.image('spriteHeart', spriteHeart);
  game.load.spritesheet('spriteFreebie', spriteFreebie, { frameWidth: config.tileWidth, frameHeight: config.tileHeight });

  game.load.image('effectImagePuff', effectImagePuff);
  game.load.image('effectImageSpark', effectImageSpark);
  game.load.image('effectImageFloodlight', effectImageFloodlight);
  game.load.image('effectBackgroundScreen', effectBackgroundScreen);
  game.load.image('effectPupil', effectPupil);
  game.load.image('effectBlack', effectBlack);

  game.load.image('badgeCompleted', badgeCompleted);
  game.load.image('badgeDamageless', badgeDamageless);
  game.load.image('badgeDeathless', badgeDeathless);
  game.load.image('badgeRich', badgeRich);
  game.load.image('badgeBirdie', badgeBirdie);
  game.load.image('badgeKiller', badgeKiller);
  game.load.image('badgeEmpty', badgeEmpty);

  game.load.audio('musicWorld1', musicWorld1);
  game.load.audio('musicWorld2', musicWorld2);
  game.load.audio('musicWorld3', musicWorld3);
  game.load.audio('musicBye', musicBye);

  game.load.audio('soundCoin', soundCoin);
  game.load.audio('soundJump1', soundJump1);
  game.load.audio('soundJump2', soundJump2);
  game.load.audio('soundJump3', soundJump3);
  game.load.audio('soundDoubleJump', soundDoubleJump);
  game.load.audio('soundWalljump', soundWalljump);
  game.load.audio('soundKill', soundKill);
  game.load.audio('soundWin', soundWin);
  game.load.audio('soundDie', soundDie);
  game.load.audio('soundBadge', soundBadge);
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
  const { game, debug, physics } = state;

  const level = parseLevel(game.cache.text.get(`level-${index}`));
  level.index = index;

  if (DEBUG) {
    window.level = level;
  }

  if (state.level && state.level.index) {
    save.levels[state.level.index].total_time_ms += (new Date()).getTime() - state.level.startedAt.getTime();
    save.levels[state.level.index].temp_time_ms = 0;
  }

  state.level = level;

  level.startedAt = new Date();

  if (save.levels[level.index].temp_time_ms) {
    save.levels[level.index].total_time_ms += save.levels[level.index].temp_time_ms;
    save.levels[level.index].temp_time_ms = 0;
  }

  save.current_level = level.index;
  saveState();

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
  level.timers = [];
  level.particles = [];
  level.deaths = 0;
  level.damageTaken = 0;
  level.earnedBadges = {};

  initializeMap();

  createLevelObjects(false);

  createPlayer();

  level.objects.exits.forEach(exit => setupExit(exit));

  if (state.currentMusicName !== level.music) {
    state.currentMusicName = level.music;
    if (state.currentMusicPlayer) {
      state.currentMusicPlayer.destroy();
    }

    const music = game.sound.add(level.music);
    music.play('', { loop: true });
    music.setVolume(0.25);
    state.currentMusicPlayer = music;
  }

  return level;
}

function positionToScreenCoordinate(x, y) {
  const { tileWidth, tileHeight, xBorder, yBorder } = config;
  return [x * tileWidth + xBorder, y * tileHeight + yBorder];
}

function initializeMap() {
  const { game, level, physics } = state;
  const { map } = level;
  const { tileWidth, tileHeight } = config;

  const halfWidth = tileWidth / 2;
  const halfHeight = tileHeight / 2;

  const images = [];
  const objectDescriptions = [];
  const statics = {};
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
        image.setDepth(2);
      } else if (tile.object) {
        objectDescriptions.push({
          x,
          y,
          tile,
        });
      } else {
        if (!statics[tile.group]) {
          statics[tile.group] = physics.add.staticGroup();
        }

        const body = statics[tile.group].create(x, y, tile.image);
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
      if (!statics[tile.group]) {
        statics[tile.group] = physics.add.staticGroup();
      }

      let [x, y] = positionToScreenCoordinate(tile.x, tile.y);
      x += halfWidth;
      y += halfHeight;
      const body = statics[tile.group].create(x, y, tile.image);
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

  level.statics = statics;
  level.images = images;
  level.objectDescriptions = objectDescriptions;

  if (statics.spikes) {
    statics.ground.setDepth(2);
    statics.spikes.children.iterate((child) => {
      const { animate } = child.config;
      const offset = (child.config.x + child.config.y) % 2;

      game.tweens.add({
        targets: child,
        x: child.x + animate[0] * 4,
        y: child.y + animate[1] * 4,
        duration: 500,
        delay: offset ? 500 : 0,
        yoyo: true,
        loop: -1,
      });
    });
  }
}

function scheduleMover(mover, isFirst) {
  const { game, level } = state;

  const speed = mover.config.speed;
  const distance = config.tileWidth * mover.config.distance * (isFirst ? 0.5 : 1);
  const duration = distance / speed;

  let timer;
  // eslint-disable-next-line prefer-const
  timer = game.time.addEvent({
    delay: duration * 1000,
    callback: () => {
      level.timers = level.timers.filter(t => t !== timer);
      mover.movingLeft = !mover.movingLeft;
      if (mover.movingLeft) {
        mover.setVelocityX(-speed);
      } else {
        mover.setVelocityX(speed);
      }

      scheduleMover(mover, false);
    },
  });

  level.timers.push(timer);
}

function setupMover(mover) {
  mover.setImmovable(true);
  mover.body.allowGravity = false;

  mover.initialPosition = [mover.x, mover.y];

  if (mover.config.movingLeft) {
    mover.setVelocityX(-mover.config.speed);
    mover.movingLeft = true;
  } else {
    mover.setVelocityX(mover.config.speed);
    mover.movingLeft = false;
  }

  scheduleMover(mover, true);
}

function setupExit(exit) {
  const { game, level } = state;

  const speed = {};
  if (exit.config.x >= config.mapWidth - 2) {
    speed.speedX = { min: -60, max: -40 };
    speed.x = exit.x + config.tileWidth / 2;
    speed.y = { min: exit.y - config.tileHeight / 2, max: exit.y + config.tileHeight / 2 };
  } else if (exit.config.x <= 1) {
    speed.speedX = { min: 40, max: 60 };
    speed.x = exit.x - config.tileWidth / 2;
    speed.y = { min: exit.y - config.tileHeight / 2, max: exit.y + config.tileHeight / 2 };
  } else if (exit.config.y >= config.mapHeight - 2) {
    speed.speedY = { min: -60, max: -40 };
    speed.x = { min: exit.x - config.tileWidth / 2, max: exit.x + config.tileWidth / 2 };
    speed.y = exit.y + config.tileHeight / 2;
  } else if (exit.config.y <= 1) {
    speed.speedY = { min: 40, max: 60 };
    speed.x = { min: exit.x - config.tileWidth / 2, max: exit.x + config.tileWidth / 2 };
    speed.y = exit.y - config.tileHeight / 2;
  }

  const particles = game.add.particles('effectImageSpark');
  particles.setDepth(5);
  const emitter = particles.createEmitter({
    ...speed,
    tint: [0xF6C456, 0xEC5B55, 0x8EEA83, 0x4397F7, 0xCC4BE4],
    alpha: { start: 0, end: 1, ease: t => (t < 0.1 ? 10 * t : 1 - (t - 0.1)) },
    scale: 0.3,
    blendMode: 'SCREEN',
    particleBringToTop: true,
    quantity: 5,
    frequency: 150,
    lifespan: 2000,
  });

  for (let i = 1; i <= 5; i++) {
    const particle = emitter.emitParticle();
    const delta = i * 150;
    particle.update(delta, delta / 1000, []);
  }

  if (!level.exitParticles) {
    level.exitParticles = [];
  }
  level.exitParticles.push(particles);
}

function reactFloodlightsToDie() {
  const { game, floodlightEmitter, level } = state;
  const { player } = level;

  const x = player.x;
  const y = player.y;

  floodlightEmitter.forEachAlive((particle) => {
    const dx = particle.x - x;
    const dy = particle.y - y;

    const distance = Math.sqrt(dx*dx + dy*dy);

    if (particle.jumpTween) {
      particle.jumpTween.stop();
    } else {
      particle.originalVelocityX = particle.velocityX;
      particle.originalVelocityY = particle.velocityY;
    }

    const theta = Math.atan2(dy, dx);
    const vx = 200 * Math.cos(theta);
    const vy = 200 * Math.sin(theta);

    game.time.addEvent({
      delay: 500 * distance / config.width,
      callback: () => {
        particle.velocityX = vx + particle.originalVelocityX;
        particle.velocityY = vy + particle.originalVelocityY;

        particle.jumpTween = game.tweens.addCounter({
          from: 100,
          to: -30,
          delay: 100,
          duration: 1000,
          ease: 'Quad.easeOut',
          onUpdate: () => {
            const v = particle.jumpTween.getValue() / 100;
            particle.velocityX = v * vx + particle.originalVelocityX;
            particle.velocityY = v * vy + particle.originalVelocityY;
          },
          onComplete: () => {
            particle.velocityX = particle.originalVelocityX;
            particle.velocityY = particle.originalVelocityY;
          },
        });
      },
    });
  });
}

function reactFloodlightsToJump() {
  const { game, floodlightEmitter, level } = state;
  const { player } = level;

  const x = player.x;
  const y = player.y;

  floodlightEmitter.forEachAlive((particle) => {
    const dx = particle.x - x;
    const dy = particle.y - y;

    const distance = Math.sqrt(dx*dx + dy*dy);

    if (particle.jumpTween) {
      particle.jumpTween.stop();
    } else {
      particle.originalVelocityX = particle.velocityX;
      particle.originalVelocityY = particle.velocityY;
    }

    /*
    if (particle.moveIn) {
      dx *= -1;
      dy *= -1;
    }
    particle.moveIn = !particle.moveIn;
    */

    let distanceMod;
    if (distance < 10 * config.tileWidth) {
      distanceMod = 1 - distance / (10 * config.tileWidth);
    } else {
      distanceMod = -distance / (100 * config.tileWidth);
    }

    const theta = Math.atan2(dy, dx);
    const vx = distanceMod * 100 * Math.cos(theta);
    const vy = distanceMod * 100 * Math.sin(theta);
    particle.velocityX = vx + particle.originalVelocityX;
    particle.velocityY = vy + particle.originalVelocityY;

    particle.jumpTween = game.tweens.addCounter({
      from: 100,
      to: 0,
      duration: 2000,
      onUpdate: () => {
        const v = particle.jumpTween.getValue() / 100;
        particle.velocityX = v * vx + particle.originalVelocityX;
        particle.velocityY = v * vy + particle.originalVelocityY;
      },
      onComplete: () => {
        particle.velocityX = particle.originalVelocityX;
        particle.velocityY = particle.originalVelocityY;
      },
    });
  });
}

function setupFloodlights() {
  const { game, level } = state;

  const particles = game.add.particles('effectImageFloodlight');
  const emitter = particles.createEmitter({
    speed: { min: 10, max: 20 },
    x: { min: 0, max: config.width },
    y: { min: 0, max: config.height },
    tint: [0xF6C456, 0xEC5B55, 0x8EEA83, 0x4397F7, 0xCC4BE4],
    alpha: { start: 0, end: 0.5, ease: t => (t < 0.2 ? 5 * t : 1 - (t - 0.2)) },
    scale: { min: 0.5, max: 2.0 },
    blendMode: 'SCREEN',
    particleBringToTop: true,
    quantity: 3,
    frequency: 1500,
    lifespan: 50000,
  });

  for (let i = 1; i < 30; i += 3) {
    const particle = emitter.emitParticle();
    const delta = 10000 + i * 1000;
    particle.update(delta, delta / 1000, []);
  }

  state.floodlightParticles = particles;
  state.floodlightEmitter = emitter;
}

function freebieGlow(freebie) {
  const { game, level } = state;

  {
    const particles = game.add.particles('effectImageFloodlight');
    const emitter = particles.createEmitter({
      tint: 0x4397F7,
      alpha: { start: 0, end: 0.4, ease: t => (t < 0.2 ? 5 * t : 1 - (t - 0.2)) },
      scale: { start: 0.4, end: 0.8 },
      blendMode: 'SCREEN',
      particleBringToTop: true,
      quantity: 1,
      frequency: 3000,
      lifespan: 10000,
    });
    emitter.startFollow(freebie);
    level.particles.push(particles);
    particles.setDepth(4);

    freebie.glowParticles = particles;
    freebie.glowEmitter = emitter;
  }

  {
    const particles = game.add.particles('effectImageSpark');
    particles.setDepth(5);
    const emitter = particles.createEmitter({
      speed: 5,
      tint: 0x4397F7,
      alpha: { start: 0, end: 1, ease: t => (t < 0.1 ? 10 * t : 1 - (t - 0.1)) },
      scale: 0.1,
      blendMode: 'SCREEN',
      particleBringToTop: true,
      quantity: 1,
      maxParticles: 6,
      frequency: 150,
      lifespan: 5000,
    });

    freebie.sparkParticles = particles;
    freebie.sparkEmitter = emitter;
    emitter.startFollow(freebie);
    level.particles.push(particles);
    particles.setDepth(5);
  }
}

function setupEnemy(enemy) {
  enemy.anims.play(enemy.config.walkAnimation, true);
}

function setupFreebie(freebie) {
  const { game } = state;

  freebie.bobTween = game.tweens.add({
    targets: freebie,
    duration: 1000,
    delay: Phaser.Math.Between(0, 500),
    y: freebie.y + 8,
    ease: 'Cubic.easeInOut',
    yoyo: true,
    loop: -1,
    onUpdate: () => {
      if (freebie.body) {
        freebie.refreshBody();
      }
    },
  });
  freebieGlow(freebie);
}

function setupEye(eye) {
  const { level, physics } = state;
  const { statics, objects } = level;

  if (!statics.pupils) {
    statics.pupils = physics.add.staticGroup();
  }

  const x = eye.x;
  const y = eye.y;
  const pupil = statics.pupils.create(x, y, 'effectPupil');

  pupil.pupilOriginX = x;
  pupil.pupilOriginY = y;
  pupil.setDepth(2);

  objects.pupils.push(pupil);
}

function createLevelObjects(isRespawn) {
  const { level, physics } = state;
  const { objectDescriptions, statics } = level;

  const objects = {
    freebies: [],
    enemies: [],
    movers: [],
    removeHints: [],
    exits: [],
    eyes: [],
    pupils: [],
  };

  objectDescriptions.forEach(({ x, y, tile }) => {
    const { group, dynamic, glyph, image } = tile;
    if (isRespawn && (group === 'exits' || group === 'pupils')) {
      return;
    }

    let body;

    if (dynamic) {
      body = physics.add.sprite(x, y, image);
    } else {
      if (!statics[group]) {
        statics[group] = physics.add.staticGroup();
      }

      body = statics[group].create(x, y, image);
    }

    body.config = tile;
    objects[group].push(body);
  });

  if (isRespawn) {
    objects.exits = level.objects.exits;
    objects.pupils = level.objects.pupils;
  }

  level.enemies = objects.enemies;
  level.livingEnemies = level.enemies.length;
  level.objects = objects;

  objects.movers.forEach(mover => setupMover(mover));
  objects.enemies.forEach(enemy => setupEnemy(enemy));
  objects.freebies.forEach(freebie => setupFreebie(freebie));

  if (!isRespawn) {
    objects.eyes.forEach(eye => setupEye(eye));
  }
}

function createPlayer() {
  const { game, physics, level } = state;

  const location = level.playerLocation;
  const [x, y] = positionToScreenCoordinate(location[0], location[1]);
  const player = physics.add.sprite(x, y, 'spritePlayerDefault');

  player.x += player.width / 2;
  player.y += player.height / 2;

  player.life = level.baseLife;
  player.freebies = 0;

  player.setSize(player.width * 0.8, player.height * 0.8, true);

  player.framesSinceTouchingDown = 0;

  player.setDepth(4);

  level.player = player;

  level.spawnedAt = new Date();

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

function destroyLevel(keepStatics) {
  const { level } = state;
  const { statics, images, player, hud } = level;

  level.timers.forEach((timer) => {
    timer.destroy();
  });

  level.particles.forEach((particle) => {
    particle.destroy();
  });

  if (!keepStatics) {
    Object.keys(level.statics).forEach((name) => {
      const group = level.statics[name];
      destroyGroup(group);
    });
    images.forEach((image) => {
      image.destroy();
    });
    level.exitParticles.forEach((particle) => {
      particle.destroy();
    });

    state.earnedBadgeKiller = false;
    state.earnedBadgeRich = false;
  }

  Object.keys(level.objects).forEach((type) => {
    if (keepStatics && (type === 'exits' || type === 'pupils')) {
      return;
    }

    level.objects[type].forEach((object) => {
      object.destroy();
    });
  });

  hud.hearts.forEach((heart) => {
    heart.destroy();
  });

  hud.freebies.forEach((freebie) => {
    freebie.destroy();
  });

  hud.hints.forEach((hint) => {
    hint.destroy();
  });

  Object.keys(hud.intro).forEach((key) => {
    if (key !== 'badges') {
      hud.intro[key].destroy();
    } else {
      hud.intro.badges.forEach((badge) => {
        badge.destroy();
      });
    }
  });

  if (hud.outro) {
    Object.keys(hud.outro).forEach((key) => {
      if (key !== 'badges') {
        hud.outro[key].destroy();
      } else {
        hud.outro.badges.forEach((badge) => {
          badge.destroy();
        });
      }
    });
  }

  player.destroy();
}

function winLevelProperly() {
  winLevel(true);
}

function winLevel(isProper) {
  const { game, level } = state;
  const { player } = level;

  if (level.isWinning) {
    return;
  }

  level.isWinning = true;

  analytics(1 + level.index, `finished level ${level.name}`);

  const time_ms = (new Date()).getTime() - level.spawnedAt.getTime();
  level.duration_ms = time_ms;

  if (time_ms < (save.levels[level.index].best_time_ms || Number.MAX_VALUE)) {
    level.beatBestTime = save.levels[level.index].best_time_ms;
    save.levels[level.index].best_time_ms = time_ms;
  }

  level.earnedBadges.badgeCompleted = !save.levels[level.index].badgeCompleted;
  save.levels[level.index].badgeCompleted = true;

  if (level.deaths === 0) {
    level.earnedBadges.badgeDeathless = !save.levels[level.index].badgeDeathless;
    save.levels[level.index].badgeDeathless = true;
  }

  if (level.damageTaken === 0) {
    level.earnedBadges.badgeDamageless = !save.levels[level.index].badgeDamageless;
    save.levels[level.index].badgeDamageless = true;
  }

  if (level.player.freebies > 0) {
    level.earnedBadges.badgeBirdie = !save.levels[level.index].badgeBirdie;
    save.levels[level.index].badgeBirdie = true;
  }

  if (state.earnedBadgeKiller) {
    state.earnedBadgeKiller = false;
    level.earnedBadges.badgeKiller = true;
  }

  if (state.earnedBadgeRich) {
    state.earnedBadgeRich = false;
    level.earnedBadges.badgeRich = true;
  }

  saveState();

  playSound('soundWin');

  player.ignoreInput = true;
  player.disableBody(true, false);

  game.tweens.add({
    targets: player,
    alpha: 0,
    duration: 2000,
  });

  // start animation
  renderLevelOutro(() => {
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
  });
}

function restartLevel() {
  state.levelIndex--;
  winLevel(false);
}

function previousLevel() {
  state.levelIndex -= 2;
  if (state.levelIndex < 0) {
    state.levelIndex += config.levels.length;
  }
  winLevel(false);
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

function damageBlur() {
  const { game, level } = state;
  const { player } = level;

  if (!state.shader) {
    return;
  }

  if (player.blurTween) {
    player.blurTween.stop();
  }

  player.blurTween = game.tweens.addCounter({
    from: 0,
    to: 100,
    duration: prop('effect.damageBlur.in_ms'),
    onUpdate: () => {
      state.shader.setFloat1('blurEffect', prop('effect.damageBlur.amount') * (player.blurTween.getValue() / 100.0));
    },
    onComplete: () => {
      player.blurTween = game.tweens.addCounter({
        from: 100,
        to: 0,
        duration: prop('effect.damageBlur.out_ms'),
        onUpdate: () => {
          state.shader.setFloat1('blurEffect', prop('effect.damageBlur.amount') * (player.blurTween.getValue() / 100.0));
        },
      });
    },
  });
}

function deathShockwave() {
  const { game, level } = state;
  const { player } = level;

  reactFloodlightsToDie();

  if (!state.shader) {
    return;
  }

  state.shockwaveTime = 0;
  state.shader.setFloat2('shockwaveCenter', player.x / config.width, player.y / config.height);
}

function spendLife(isVoluntary): bool {
  const { game, level } = state;
  const { player, hud } = level;

  const spendFreebie = player.freebies > 0;

  if (!isVoluntary) {
    level.damageTaken++;
    save.levels[level.index].damage_taken++;
    damageBlur();
  }

  let image;

  if (spendFreebie) {
    player.freebies--;
    image = hud.freebies.pop();

    if (player.freebies <= 0) {
      setPlayerAnimation();
    }
  } else if (!prop('cheat.hearty')) {
    player.life--;
    image = hud.hearts.pop();
  }

  if (image) {
    image.setDepth(3);

    if (image.hudTween) {
      image.hudTween.stop();
    }

    image.x = player.x;
    image.y = player.y;

    game.tweens.add({
      targets: image,
      duration: 500,
      y: image.y - config.tileHeight,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        game.tweens.add({
          targets: image,
          duration: 500,
          y: image.y + config.tileHeight / 2,
          alpha: 0,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            // this should never happen, but better to not crash…
            if (image) {
              image.destroy();
            }
          },
        });
      },
    });
  }

  if (player.life <= 0) {
    level.deaths++;
    save.levels[level.index].deaths++;
    deathShockwave();
    respawn();

    playSound('soundDie', null, 0.75);

    saveState();
    return true;
  }

  saveState();
  return false;
}

function takeSpikeDamage(object1, object2) {
  const { game, level } = state;
  const { player } = level;

  if (player.invincible) {
    return;
  }

  const spikes = object1.config && object1.config.group === 'spikes' ? object1 : object2;
  const { knockback } = spikes.config;

  const ignore = spendLife(false);

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

function destroyEnemy(enemy) {
  const { game, level } = state;
  const { player } = level;

  level.livingEnemies--;
  if (level.livingEnemies === 0) {
    level.earnedBadges.badgeKiller = !save.levels[level.index].badgeKiller;
    if (level.earnedBadges.badgeKiller) {
      state.earnedBadgeKiller = true;
    }

    save.levels[level.index].badgeKiller = true;
    saveState();
  }

  playSound('soundKill');
  enemy.anims.play(enemy.config.killAnimation, true);
  enemy.disableBody(true, false);
  level.enemies = level.enemies.filter(e => e !== enemy);

  game.tweens.add({
    targets: enemy,
    duration: 1000,
    y: enemy.y + config.height,
    ease: 'Back.easeIn',
    onComplete: () => {
      enemy.destroy();
    },
  });

  game.tweens.add({
    targets: enemy,
    duration: 1000,
    alpha: 0,
    ease: 'Quad.easeIn',
    x: player.x < enemy.x ? (enemy.x + config.tileWidth * 3) : (enemy.x - config.tileWidth * 3),
    rotation: player.x < enemy.x ? 2 : -2,
  });

  game.tweens.add({
    targets: enemy,
    duration: 1000,
    scale: 1.5,
    ease: 'Quad.easeIn',
  });
}

function takeEnemyDamage(object1, object2) {
  const { game, level } = state;
  const { player } = level;

  const enemy = object1.config && object1.config.group === 'enemies' ? object1 : object2;

  if (player.invincible) {
    destroyEnemy(enemy);
    return;
  }

  const suppressEnemySound = spendLife(false);
  destroyEnemy(enemy, suppressEnemySound);

  setPlayerInvincible();
}

function playSound(name, variants, volume) {
  const { game } = state;

  if (variants) {
    name += Phaser.Math.Between(1, variants);
  }

  const sound = game.sound.add(name);

  if (volume === undefined) {
    volume = 0.5;
  }
  sound.setVolume(volume);
  sound.play();
}

function acquireFreebie(object1, object2) {
  const { game, level } = state;
  const { player, hud } = level;

  const freebie = object1.config && object1.config.group === 'freebie' ? object1 : object2;
  if (freebie.spent) {
    return false;
  }

  freebie.spent = true;
  freebie.bobTween.stop();
  freebie.glowEmitter.stop();
  freebie.glowEmitter.stopFollow();
  freebie.sparkEmitter.stop();
  freebie.sparkEmitter.stopFollow();

  game.tweens.add({
    targets: freebie,
    duration: 1000,
    y: freebie.y - 8,
    ease: 'Cubic.easeOut',
    alpha: 0.4,
  });

  playSound('soundCoin');

  player.freebies++;
  if (player.freebies === 1) {
    setPlayerAnimation();
  }

  if (level.objects.freebies.filter(f => !f.spent).length === 0) {
    level.earnedBadges.badgeRich = !save.levels[level.index].badgeRich;
    if (level.earnedBadges.badgeRich) {
      state.earnedBadgeRich = true;
    }
    save.levels[level.index].badgeRich = true;
    saveState();
  }

  const img = game.add.image(freebie.x, freebie.y, 'spriteFreebie');
  hud.freebies.push(img);
  const x = 2 * config.tileWidth + img.width * (player.freebies + player.life - 1) + state.lifeIsText.width;
  const y = config.yBorder / 2;
  img.setDepth(6);

  img.hudTween = game.tweens.add({
    targets: img,
    duration: 800,
    x,
    y,
    ease: 'Cubic.easeInOut',
  });

  return false;
}

function checkSemiground(object1, object2) {
  const { game, level } = state;
  const { player, hud } = level;

  const semiground = object1.config && object1.config.group === 'semiground' ? object1 : object2;
  if (player.body.velocity.y < 0 || player.y + player.height / 2 >= semiground.y) {
    return false;
  }
  return true;
}

function removeHints() {
  const { game, level } = state;
  const { hud } = level;

  if (level.removedHints) {
    return false;
  }
  level.removedHints = true;

  hud.hints.forEach((hint, i) => {
    game.tweens.add({
      targets: hint,
      delay: 300 * i,
      duration: 500,
      alpha: 0,
      y: hint.y + 20,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        hint.destroy();
      },
    });
  });

  game.time.addEvent({
    callback: () => {
      level.objects.removeHints.forEach((removeHint) => {
        removeHint.destroy();
      });
      level.objects.removeHints = [];
    },
  });

  return false;
}

function setupLevelPhysics(isInitial) {
  const { game, level, physics } = state;
  const { player, statics, enemies, objects } = level;

  physics.add.collider(player, statics.ground);
  physics.add.collider(enemies, statics.ground);

  physics.add.collider(player, statics.semiground, null, checkSemiground);
  physics.add.collider(enemies, statics.semiground);

  physics.add.collider(player, objects.movers);
  physics.add.collider(enemies, objects.movers);

  physics.add.overlap(player, statics.exits, winLevelProperly);
  physics.add.collider(enemies, statics.exits);

  physics.add.collider(player, statics.spikes, takeSpikeDamage);
  physics.add.collider(enemies, statics.spikes);

  physics.add.overlap(player, statics.freebies, null, acquireFreebie);
  physics.add.overlap(player, statics.removeHints, null, removeHints);

  physics.add.collider(player, enemies, takeEnemyDamage);
  physics.add.collider(enemies, enemies);
}

function renderHud() {
  const { game, level } = state;
  const { player, hud } = level;

  hud.hearts = _.range(player.life).map((i) => {
    const x = 2 * config.tileWidth;
    const y = 0;
    const heart = game.add.image(x, y, 'spriteHeart');
    heart.x += state.lifeIsText.width + heart.width * i;
    heart.y += config.yBorder / 2;
    return heart;
  });

  hud.freebies = [];

  hud.hints = [];

  const hintTexts = [];
  if (level.hint) {
    hintTexts.push(level.hint);
  }
  if (level.hint2) {
    hintTexts.push(level.hint2);
  }
  if (level.hint3) {
    hintTexts.push(level.hint3);
  }

  hintTexts.forEach((text, i) => {
    let x = config.width / 2 + (level.hintXMod || 0);
    let y = config.height * 0.25 + (level.hintYMod || 0);


    // micromanage end scene
    y += config.height * 0.05 * i;
    if (hintTexts.length > 1 && i === 1) {
      y += config.height * 0.015;
    }

    if (level.hintXPosition) {
      x = config.width * level.hintXPosition;
    }
    if (level.hintYPosition) {
      y = config.height * level.hintYPosition;
    }

    const label = game.add.text(
      x,
      y,
      text,
      {
        fontFamily: '"Avenir Next", "Avenir", "Helvetica Neue", "Helvetica", "Arial"',
        fontSize: i === 0 ? '20px' : '16px',
        color: 'rgb(246, 196, 86)',
      },
    );
    label.setStroke('#000000', 6);
    label.x -= label.width / 2;
    label.y -= label.height / 2;
    label.setDepth(7);
    hud.hints.push(label);

    label.alpha = 0;
    label.y += 20;
    game.tweens.add({
      targets: label,
      delay: 4000 + 500 * i,
      duration: 500,
      alpha: 1,
      y: label.y - 20,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        game.tweens.add({
          targets: label,
          delay: 500,
          duration: 2000,
          y: label.y + 8,
          ease: 'Quad.easeInOut',
          yoyo: true,
          loop: -1,
        });
      },
    });
  });
}

function spawnPlayer(delay) {
  const { game, level } = state;
  const { player } = level;

  player.alpha = 0;
  player.ignoreInput = true;

  game.tweens.add({
    targets: player,
    alpha: 1,
    delay,
    duration: 500,
    onComplete: () => {
      player.ignoreInput = false;
    },
  });
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
      createLevelObjects(true);
      createPlayer();
      renderHud();
      setupLevelPhysics(false);
      spawnPlayer(500);
    },
  });
}

function setupLevel() {
  const { levelIndex } = state;
  createLevel(levelIndex);
  renderHud();
  setupLevelPhysics(true);
  renderLevelIntro();
  spawnPlayer(3000);
}

function renderLevelIntro() {
  const { game, level } = state;
  const { player, hud } = level;

  hud.intro = {};

  player.ignoreInput = true;

  const background = game.add.image(config.width * 0.5, config.height * 0.55, 'effectBlack');
  background.setDepth(8);
  const scaleY = config.height / background.height * 0.20;
  background.setScale(config.width / background.width, scaleY / 5);
  background.x = config.width * 1.5;
  hud.intro.background = background;

  game.tweens.add({
    targets: background,
    scaleY,
    x: config.width * 0.5,
    ease: 'Cubic.easeIn',
    duration: 500,
    onComplete: () => {
      const levelName = game.add.text(
        config.width / 2,
        config.height / 2,
        level.name,
        {
          fontFamily: '"Avenir Next", "Avenir", "Helvetica Neue", "Helvetica", "Arial"',
          fontSize: '20px',
          color: 'rgb(246, 196, 86)',
        },
      );
      levelName.setStroke('#000000', 6);
      levelName.x -= levelName.width / 2;
      levelName.y -= levelName.height / 2;
      levelName.setDepth(8);

      levelName.alpha = 0;
      levelName.y += 20;

      game.tweens.add({
        targets: levelName,
        alpha: 1,
        y: levelName.y - 20,
        ease: 'Cubic.easeOut',
        duration: 500,
      });
      hud.intro.levelName = levelName;

      if (save.levels[level.index].best_time_ms) {
        const best_time = save.levels[level.index].best_time_ms;
        const best_duration = renderMillisecondDuration(best_time);

        const bestTime = game.add.text(
          config.width / 2,
          config.height / 2 + 60,
          `Your personal best: ${best_duration}`,
          {
            fontFamily: '"Avenir Next", "Avenir", "Helvetica Neue", "Helvetica", "Arial"',
            fontSize: '16px',
            color: 'rgb(142, 234, 131)',
          },
        );
        bestTime.setStroke('#000000', 6);
        bestTime.x -= bestTime.width / 2;
        bestTime.y -= bestTime.height / 2;
        bestTime.setDepth(8);

        bestTime.alpha = 0;
        bestTime.y -= 20;

        game.tweens.add({
          targets: bestTime,
          alpha: 1,
          delay: 500,
          y: bestTime.y + 20,
          ease: 'Cubic.easeOut',
          duration: 500,
        });

        hud.intro.bestTime = bestTime;
      }

      const badgesToRender = [];
      ['badgeCompleted', 'badgeDeathless', 'badgeDamageless', 'badgeRich', 'badgeBirdie', 'badgeKiller'].forEach((badgeName) => {
        if ((badgeName === 'badgeBirdie' || badgeName === 'badgeKiller') && !level[badgeName]) {
          return;
        }

        let imageName = 'badgeEmpty';
        if (save.levels[level.index][badgeName]) {
          imageName = badgeName;
        }
        badgesToRender.unshift(imageName);
      });

      const badges = [];
      badgesToRender.forEach((badgeName, i) => {
        const badge = game.add.image(config.width * 0.5, config.height * 0.5 + 30, badgeName);
        badge.x -= (i + 0.5) * (config.tileWidth + 20);
        badge.x += (badgesToRender.length / 2) * (config.tileWidth + 20);
        badge.setDepth(8);
        badges.push(badge);

        const x = badge.x;
        badge.x = config.width * 0.5;
        badge.alpha = 0;
        badge.y -= 20;

        game.tweens.add({
          targets: badge,
          delay: i * 50,
          alpha: badgeName === 'badgeEmpty' ? 0.3 : 1,
          x,
          y: badge.y + 20,
          ease: 'Cubic.easeOut',
          duration: 500,
        });
      });

      hud.intro.badges = badges;

      const faders = [...badges, levelName];
      if (hud.intro.bestTime) {
        faders.push(hud.intro.bestTime);
      }

      faders.forEach((fader) => {
        game.tweens.add({
          targets: fader,
          delay: 2000,
          duration: 500,
          alpha: 0,
        });
      });

      game.tweens.add({
        targets: hud.intro.background,
        delay: 2250,
        duration: 500,
        scaleY: 0,
      });

      game.time.addEvent({
        delay: 2750,
        callback: () => {
          if (!hud.intro) {
            return;
          }

          player.ignoreInput = false;

          hud.intro.badges.forEach((badge) => {
            badge.destroy();
          });
          delete hud.intro.badges;

          Object.keys(hud.intro).forEach((key) => {
            if (key !== 'badges') {
              hud.intro[key].destroy();
            }
          });
        },
      });
    },
  });
}

function renderMillisecondDuration(duration) {
  let m = Math.floor(duration / 1000 / 60);
  let s = duration / 1000 - m * 60;
  if (s < 10) {
    s = `0${s.toFixed(3)}`;
  } else {
    s = s.toFixed(3);
  }
  if (m > 99) m = '99+';
  return `${m}:${s}`;
}

function renderLevelOutro(callback) {
  const { game, level } = state;
  const { player, hud } = level;

  hud.outro = {};

  player.ignoreInput = true;

  const background = game.add.image(config.width * 0.5, config.height * 0.55, 'effectBlack');
  background.setDepth(8);
  const scaleX = config.width / background.width;
  const scaleY = config.height / background.height * 0.20;
  background.setScale(0, scaleY);
  hud.outro.background = background;

  const encouragements = ['Great job!!', 'Wowee!', 'Holy toledo!', 'My hero!', 'Whoa!!', "You're on fire!!", 'Level clear!!', 'Piece of cake!'];
  let encouragement = encouragements[Phaser.Math.Between(0, encouragements.length - 1)];

  if (level.beatBestTime) {
    encouragement = 'You set a new personal best!!';
  }

  game.tweens.add({
    targets: background,
    scaleX,
    ease: 'Cubic.easeIn',
    duration: 500,
    onComplete: () => {
      const levelName = game.add.text(
        config.width / 2,
        config.height / 2,
        encouragement,
        {
          fontFamily: '"Avenir Next", "Avenir", "Helvetica Neue", "Helvetica", "Arial"',
          fontSize: '20px',
          color: 'rgb(246, 196, 86)',
        },
      );
      levelName.setStroke('#000000', 6);
      levelName.x -= levelName.width / 2;
      levelName.y -= levelName.height / 2;
      levelName.setDepth(8);

      levelName.alpha = 0;
      levelName.y += 20;

      game.tweens.add({
        targets: levelName,
        alpha: 1,
        y: levelName.y - 20,
        ease: 'Cubic.easeOut',
        duration: 500,
      });
      hud.outro.levelName = levelName;

      if (save.levels[level.index].best_time_ms) {
        const best_time = renderMillisecondDuration(save.levels[level.index].best_time_ms);
        const level_time = renderMillisecondDuration(level.duration_ms);
        let timeDescription;
        if (level.earnedBadges.badgeCompleted) {
          timeDescription = `Completed in: ${best_time}`;
        } else if (level.beatBestTime) {
          timeDescription = `Your new time: ${best_time}`;
        } else {
          timeDescription = `Completed in: ${level_time} (personal best: ${best_time})`;
        }

        const bestTime = game.add.text(
          config.width / 2,
          config.height / 2 + 60,
          timeDescription,
          {
            fontFamily: '"Avenir Next", "Avenir", "Helvetica Neue", "Helvetica", "Arial"',
            fontSize: '16px',
            color: level.beatBestTime ? 'rgb(246, 196, 86)' : 'rgb(142, 234, 131)',
          },
        );
        bestTime.setStroke('#000000', 6);
        bestTime.x -= bestTime.width / 2;
        bestTime.y -= bestTime.height / 2;
        bestTime.setDepth(8);

        bestTime.alpha = 0;
        bestTime.y -= 20;

        game.tweens.add({
          targets: bestTime,
          alpha: 1,
          delay: 500,
          y: bestTime.y + 20,
          ease: 'Cubic.easeOut',
          duration: 500,
        });

        hud.outro.bestTime = bestTime;
      }

      const badgesToRender = [];
      ['badgeCompleted', 'badgeDeathless', 'badgeDamageless', 'badgeRich', 'badgeBirdie', 'badgeKiller'].forEach((badgeName) => {
        if ((badgeName === 'badgeBirdie' || badgeName === 'badgeKiller') && !level[badgeName]) {
          return;
        }

        let imageName = 'badgeEmpty';
        if (save.levels[level.index][badgeName]) {
          imageName = badgeName;
        }
        badgesToRender.unshift(imageName);
      });

      let earnedBadges = 0;
      const badges = [];
      badgesToRender.forEach((badgeName, i) => {
        const badge = game.add.image(config.width * 0.5, config.height * 0.5 + 30, badgeName);
        badge.x -= (i + 0.5) * (config.tileWidth + 20);
        badge.x += (badgesToRender.length / 2) * (config.tileWidth + 20);
        badge.setDepth(8);
        badges.push(badge);

        const x = badge.x;
        badge.x = config.width * 0.5;
        badge.alpha = 0;
        badge.y -= 20;

        let alpha = 1;
        if (level.earnedBadges[badgeName]) {
          alpha = 0;
        } else if (badgeName === 'badgeEmpty') {
          alpha = 0.3;
        }

        game.tweens.add({
          targets: badge,
          delay: i * 50,
          alpha,
          x,
          y: badge.y + 20,
          ease: 'Cubic.easeOut',
          duration: 500,
        });

        if (level.earnedBadges[badgeName]) {
          earnedBadges++;
          const empty = game.add.image(config.width * 0.5, config.height * 0.5 + 30, 'badgeEmpty');
          empty.x = badge.x;
          empty.y = badge.y;
          empty.setDepth(8);
          badges.push(empty);

          empty.x = config.width * 0.5;
          empty.alpha = 0;

          const thisEarnedBadge = earnedBadges;

          game.tweens.add({
            targets: empty,
            delay: i * 50,
            alpha: 0.3,
            x,
            y: badge.y + 20,
            ease: 'Cubic.easeOut',
            duration: 500,
            onComplete: () => {
              game.time.addEvent({
                delay: 250 + (earnedBadges - thisEarnedBadge) * 500,
                callback: () => {
                  playSound('soundBadge');
                },
              });

              game.tweens.add({
                targets: empty,
                delay: (earnedBadges - thisEarnedBadge) * 500,
                alpha: 0,
                duration: 500,
              });
              game.tweens.add({
                targets: badge,
                delay: (earnedBadges - thisEarnedBadge) * 500,
                alpha: 1,
                duration: 500,
                onComplete: () => {
                },
              });
              game.tweens.add({
                targets: [empty, badge],
                ease: 'Cubic.easeOut',
                duration: 300,
                delay: 250 + (earnedBadges - thisEarnedBadge) * 500,
                y: badge.y - 6,
                onComplete: () => {
                  game.tweens.add({
                    targets: [empty, badge],
                    ease: 'Cubic.easeOut',
                    duration: 300,
                    y: badge.y + 6,
                  });
                },
              });
            },
          });
        }
      });

      hud.outro.badges = badges;

      const faders = [...badges, levelName];
      if (hud.outro.bestTime) {
        faders.push(hud.outro.bestTime);
      }

      faders.forEach((fader) => {
        game.tweens.add({
          targets: fader,
          delay: 4000,
          duration: 500,
          alpha: 0,
        });
      });

      game.tweens.add({
        targets: hud.outro.background,
        delay: 4250,
        duration: 500,
        scaleY: 0,
      });

      game.time.addEvent({
        delay: 4750,
        callback: () => {
          if (!hud.outro) {
            return;
          }

          player.ignoreInput = false;

          hud.outro.badges.forEach((badge) => {
            badge.destroy();
          });
          delete hud.outro.badges;

          Object.keys(hud.outro).forEach((key) => {
            if (key !== 'badges') {
              hud.outro[key].destroy();
            }
          });

          callback();
        },
      });
    },
  });
}

function create() {
  const { game } = state;

  state.physics = game.physics;

  state.cursors = game.input.keyboard.createCursorKeys();

  game.anims.create({
    key: 'spriteEnemyAWalk',
    frames: [
      {
        key: 'spriteEnemyA',
        frame: 2,
      },
      {
        key: 'spriteEnemyA',
        frame: 0,
      },
      {
        key: 'spriteEnemyA',
        frame: 2,
      },
      {
        key: 'spriteEnemyA',
        frame: 1,
      },
    ],
    frameRate: 6,
    repeat: -1,
  });

  game.anims.create({
    key: 'spriteEnemyADie',
    frames: [
      {
        key: 'spriteEnemyA',
        frame: 3,
      },
    ],
  });

  game.anims.create({
    key: 'spriteEnemyBWalk',
    frames: [
      {
        key: 'spriteEnemyB',
        frame: 2,
      },
      {
        key: 'spriteEnemyB',
        frame: 0,
      },
      {
        key: 'spriteEnemyB',
        frame: 2,
      },
      {
        key: 'spriteEnemyB',
        frame: 1,
      },
    ],
    frameRate: 6,
    repeat: -1,
  });

  game.anims.create({
    key: 'spriteEnemyBDie',
    frames: [
      {
        key: 'spriteEnemyB',
        frame: 3,
      },
    ],
  });

  game.anims.create({
    key: 'spritePlayerDefaultWalk',
    frames: [
      {
        key: 'spritePlayerDefault',
        frame: 2,
      },
      {
        key: 'spritePlayerDefault',
        frame: 0,
      },
      {
        key: 'spritePlayerDefault',
        frame: 2,
      },
      {
        key: 'spritePlayerDefault',
        frame: 1,
      },
    ],
    frameRate: 6,
    repeat: -1,
  });

  game.anims.create({
    key: 'spritePlayerDefaultNeutral',
    frames: [
      {
        key: 'spritePlayerDefault',
        frame: 2,
      },
    ],
  });

  game.anims.create({
    key: 'spritePlayerDefaultJumpUp',
    frames: [
      {
        key: 'spritePlayerDefault',
        frame: 3,
      },
    ],
  });

  game.anims.create({
    key: 'spritePlayerDefaultJumpDown',
    frames: [
      {
        key: 'spritePlayerDefault',
        frame: 4,
      },
    ],
  });

  game.anims.create({
    key: 'spritePlayerDefaultDrag',
    frames: [
      {
        key: 'spritePlayerDefault',
        frame: 5,
      },
    ],
  });

  game.anims.create({
    key: 'spritePlayerShieldedWalk',
    frames: [
      {
        key: 'spritePlayerShielded',
        frame: 2,
      },
      {
        key: 'spritePlayerShielded',
        frame: 0,
      },
      {
        key: 'spritePlayerShielded',
        frame: 2,
      },
      {
        key: 'spritePlayerShielded',
        frame: 1,
      },
    ],
    frameRate: 6,
    repeat: -1,
  });

  game.anims.create({
    key: 'spritePlayerShieldedNeutral',
    frames: [
      {
        key: 'spritePlayerShielded',
        frame: 2,
      },
    ],
  });

  game.anims.create({
    key: 'spritePlayerShieldedJumpUp',
    frames: [
      {
        key: 'spritePlayerShielded',
        frame: 3,
      },
    ],
  });

  game.anims.create({
    key: 'spritePlayerShieldedJumpDown',
    frames: [
      {
        key: 'spritePlayerShielded',
        frame: 4,
      },
    ],
  });

  game.anims.create({
    key: 'spritePlayerShieldedDrag',
    frames: [
      {
        key: 'spritePlayerShielded',
        frame: 5,
      },
    ],
  });

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
      winLevel(false);
    });

    game.input.keyboard.on('keydown_R', () => {
      restartLevel();
    });

    game.input.keyboard.on('keydown_P', () => {
      previousLevel();
    });
  }

  setupFloodlights();

  setupBackgroundScreen();

  state.levelIndex = save.current_level;
  setupLevel();

  if (game.game.renderer.type === Phaser.WEBGL) {
    state.shader = game.game.renderer.addPipeline('Shader', new Shader(game.game));

    state.shader.setFloat2('resolution', config.width, config.height);

    state.shockwaveTime = 1000000;
    state.shockwaveIncrement = 0.005;
    state.shader.setFloat1('shockwaveTime', state.shockwaveTime);

    state.shader.setFloat1('blurEffect', 0.0);

    game.cameras.main.setRenderToTexture(state.shader);
  }

  if (game.game.renderer.type === Phaser.CANVAS) {
    // eslint-disable-next-line no-alert
    alert('It looks like this browser will offer a degraded experience, like background colors being grayscale. For best results, please use Chrome!');
  }
}

function setupBackgroundScreen() {
  const { game } = state;
  const backgroundScreen = game.add.image(config.width / 2, config.height / 2, 'effectBackgroundScreen');
  state.backgroundScreen = backgroundScreen;

  const text = game.add.text(
    config.xBorder * 2,
    config.yBorder / 2,
    'Your life is ',
    {
      fontFamily: '"Avenir Next", "Avenir", "Helvetica Neue", "Helvetica", "Arial"',
      fontSize: '16px',
      color: 'rgb(200, 200, 200)',
    },
  );
  state.lifeIsText = text;

  text.setStroke('#000000', 6);
  text.x -= text.width / 2;
  text.y -= text.height / 2;
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

  const rumble = state.rumble;
  state.rumble = null;

  if (game.input.gamepad.total) {
    const pads = game.input.gamepad.gamepads;
    pads.filter(pad => pad).forEach((pad) => {
      /*
      if (rumble) {
        if (pad.vibration && pad.vibration.playEffect) {
          pad.vibration.playEffect('dual-rumble', {
            duration: 1000,
            strongMagnitude: 1.0,
            weakMagnitude: 1.0,
          });
        } else if (pad.vibration && pad.vibration.pulse) {
          pad.vibration.pulse(1.0, 1000);
        }
      }
      */

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

function jumpShake(type) {
  reactFloodlightsToJump();
  if (type !== JUMP_NORMAL) {
    state.rumble = true;
    state.game.cameras.main.shake(
      prop('effect.jumpshake.duration_ms'),
      prop('effect.jumpshake.amount'),
    );
  }
}

function processInput() {
  const { game, level, upButtonDown, downButtonDown, leftButtonDown, rightButtonDown, jumpButtonStarted, jumpButtonDown, jumpButtonHeld } = state;
  const { player } = level;

  if (player.ignoreInput) {
    return;
  }

  const canJump = player.body.touching.down || (!player.isJumping && player.framesSinceTouchingDown < 3);

  if (jumpButtonHeld && !jumpButtonDown) {
    state.jumpButtonHeld = false;
  }

  if (jumpButtonStarted) {
    player.isJumping = true;
    state.jumpButtonHeld = true;
    player.body.setGravityY(0);
    if (canJump) {
      jumpShake(JUMP_NORMAL);
      jumpPuff(false);
      jumpPuff(true);
      level.jumps++;
      save.levels[level.index].jumps++;
      player.setVelocityY(-prop('velocityY.jump'));
      playSound('soundJump', 3);
    } else if (player.canWallJump && ((player.body.touching.left && leftButtonDown) || (player.body.touching.right && rightButtonDown))) {
      jumpShake(JUMP_WALL);
      level.walljumps++;
      save.levels[level.index].walljumps++;
      player.body.setGravityY(-100);
      player.setVelocityY(-prop('velocityY.wall_jump'));
      if (player.body.touching.right) {
        player.facingLeft = true;
        player.wallJumpDirectionLeft = true;
        jumpPuff(true);
        player.setFlipX(false);
      } else {
        player.facingLeft = false;
        player.wallJumpDirectionLeft = false;
        jumpPuff(false);
        player.setFlipX(true);
      }

      player.isWallJumping = true;
      player.wallJumpIgnoreDirection = true;
      player.wallJumpContinuing = true;
      player.wallJumpHeld = true;
      player.wallJumpContra = false;
      const suppressSound = spendLife(true);
      if (!suppressSound) {
        playSound('soundWalljump');
      }

      game.time.addEvent({
        delay: prop('wall_jump_ignore_direction_ms'),
        callback: () => {
          player.wallJumpIgnoreDirection = false;
        },
      });

      player.isDoubleJumping = false;
    } else if (player.canDoubleJump && upButtonDown) {
      jumpShake(JUMP_DOUBLE);
      level.doublejumps++;
      save.levels[level.index].doublejumps++;
      player.setVelocityY(-prop('velocityY.double_jump'));
      player.isDoubleJumping = true;

      player.isWallJumping = false;
      player.wallJumpIgnoreDirection = false;
      player.wallJumpContinuing = false;
      player.wallJumpHeld = false;
      player.wallJumpContra = false;

      jumpPuff(true, true);
      jumpPuff(false, true);

      const suppressSound = spendLife(true);
      if (!suppressSound) {
        playSound('soundDoubleJump');
      }
    }
  }

  if (player.isWallJumping && ((player.wallJumpDirectionLeft && player.body.touching.left) || (!player.wallJumpDirectionLeft && player.body.touching.right))) {
    player.setVelocityX(0);
    player.setAccelerationX(0);
    player.isWallJumping = false;
    player.wallJumpIgnoreDirection = false;
    player.wallJumpContinuing = false;
    player.wallJumpHeld = false;
    player.wallJumpContra = false;
  }

  if (player.isWallJumping && !player.wallJumpIgnoreDirection && ((player.wallJumpDirectionLeft && rightButtonDown) || (!player.wallJumpDirectionLeft && leftButtonDown))) {
    player.wallJumpContra = true;
  }

  if (player.wallJumpContra) {
    player.wallJumpContinuing = false;
    player.wallJumpHeld = false;
  }

  if (!player.wallJumpIgnoreDirection && ((player.wallJumpDirectionLeft && !leftButtonDown) || (!player.wallJumpDirectionLeft && !rightButtonDown))) {
    player.wallJumpHeld = false;
  }

  if (player.wallJumpIgnoreDirection || player.wallJumpHeld) {
    const x = prop('velocityX.wall_jump');
    if (player.facingLeft) {
      player.setVelocityX(-x);
    } else {
      player.setVelocityX(x);
    }
  } else if (player.wallJumpContinuing) {
    // lerp down to the slower speed
    let x = prop('velocityX.walk');
    if (player.wallJumpDirectionLeft) {
      x *= -1;
    }
    const vx = player.body.velocity.x + 0.5 * (x - player.body.velocity.x);
    player.setVelocityX(vx);
  } else if (player.wallJumpContra) {
    // lerp down to the reverse speed
    let x = prop('velocityX.reversed_wall_jump');
    if (leftButtonDown) {
      x *= -1;
    }
    const vx = player.body.velocity.x + 0.3 * (x - player.body.velocity.x);
    player.setVelocityX(vx);
  } else {
    let x = prop('velocityX.walk');
    if (player.isJumping) {
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

  listenProp('level.timers', level.timers.length);

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
  listenProp('player.wallJumpHeld', player.wallJumpHeld);
  listenProp('player.wallJumpContra', player.wallJumpContra);
  listenProp('player.touching.up', player.body.touching.up);
  listenProp('player.touching.down', player.body.touching.down);
  listenProp('player.touching.left', player.body.touching.left);
  listenProp('player.touching.right', player.body.touching.right);

  listenProp('player.freebies', player.freebies);

  if (state.shader) {
    state.shader.setFloat1('shockwaveScale', prop('effect.shockwave.scale'));
    state.shader.setFloat1('shockwaveRange', prop('effect.shockwave.range'));
    state.shader.setFloat1('shockwaveThickness', prop('effect.shockwave.thickness'));
    state.shader.setFloat1('shockwaveSpeed', prop('effect.shockwave.speed'));
    state.shader.setFloat1('shockwaveInner', prop('effect.shockwave.inner'));
    state.shader.setFloat1('shockwaveDropoff', prop('effect.shockwave.dropoff'));
  }
}

function manageWallDragPuff(isEnabled, isLeft) {
  const { game, level } = state;
  const { player } = level;

  if (isEnabled && !player.wallDragPuff) {
    const particles = game.add.particles('effectImagePuff');
    particles.setDepth(5);
    const emitter = particles.createEmitter({
      speed: 50,
      x: (player.width * 0.4) * (isLeft ? -1 : 1),
      y: { min: -player.height * 0.4, max: player.height * 0.5 },
      scale: { start: 0.25, end: 0.5 },
      blendMode: 'ADD',
      quantity: 1,
      alpha: 0.5,
      rotate: { min: 0, max: 360 },
      maxParticles: 12,
      angle: isLeft ? { min: 280, max: 310 } : { min: 230, max: 260 },
      lifespan: 200,
    });
    emitter.startFollow(player);

    level.particles.push(particles);
    player.wallDragPuff = { particles, emitter };
  } else if (isEnabled) {
    // update
  } else if (player.wallDragPuff) {
    const { particles, emitter } = player.wallDragPuff;
    emitter.stopFollow();
    emitter.stop();
    game.time.addEvent({
      delay: 1000,
      callback: () => {
        level.particles = level.particles.filter(p => p !== particles);
        particles.destroy();
      },
    });
    delete player.wallDragPuff;
  }
}

function jumpPuff(isLeft, downward) {
  const { game, level } = state;
  const { player } = level;

  const particles = game.add.particles('effectImagePuff');
  particles.setDepth(5);
  const emitter = particles.createEmitter({
    speed: 50,
    x: player.x + player.width * (isLeft ? -0.2 : 0.2),
    y: player.y + player.height * 0.4,
    scale: { start: 0.7, end: 1 },
    quantity: 1,
    alpha: { start: 0.4, end: 0 },
    rotate: { start: 0, end: isLeft ? 90 : -90 },
    maxParticles: 2,
    angle: isLeft ? { min: 180, max: 180 } : { min: 0, max: 0 },
    lifespan: 500,
    gravityY: downward ? 200 : -200,
  });

  level.particles.push(particles);

  game.time.addEvent({
    delay: 500,
    callback: () => {
      emitter.stop();
      game.time.addEvent({
        delay: 1000,
        callback: () => {
          level.particles = level.particles.filter(p => p !== particles);
          particles.destroy();
        },
      });
    },
  });
}

function setPlayerAnimation(type) {
  const { level } = state;
  const { player } = level;

  if (type === undefined) {
    type = player.previousAnimation;
  }
  const status = player.freebies > 0 ? 'Shielded' : 'Default';
  const animation = `spritePlayer${status}${type}`;
  player.anims.play(animation, type === player.previousAnimation && status === player.previousStatus);
  player.previousAnimation = type;
  player.previousStatus = status;
}

function frameUpdates(dt) {
  const { level, leftButtonDown, rightButtonDown } = state;
  const { player, hud } = level;

  if (player.body.velocity.y > 500) {
    player.setVelocityY(500);
  }

  if (player.body.touching.down) {
    if (leftButtonDown) {
      setPlayerAnimation('Walk');
    } else if (rightButtonDown) {
      setPlayerAnimation('Walk');
    } else {
      setPlayerAnimation('Neutral');
    }
  } else if (player.body.velocity.y <= 0) {
    setPlayerAnimation('JumpUp');
  } else {
    setPlayerAnimation('JumpDown');
  }

  if (!player.wallJumpIgnoreDirection && leftButtonDown) {
    player.setFlipX(false);
  } else if (!player.wallJumpIgnoreDirection && rightButtonDown) {
    player.setFlipX(true);
  }

  level.objects.pupils.forEach((pupil) => {
    let x = pupil.pupilOriginX;
    let y = pupil.pupilOriginY;

    const dx = player.x - x;
    const dy = player.y - y;

    const theta = Math.atan2(dy, dx);
    x += config.tileWidth / 5 * Math.cos(theta);
    y += config.tileHeight / 5 * Math.sin(theta);

    pupil.x += 0.05 * (x - pupil.x);
    pupil.y += 0.05 * (y - pupil.y);
  });

  if (player.body.touching.down) {
    player.framesSinceTouchingDown = 0;
  } else {
    player.framesSinceTouchingDown++;
  }

  if (player.ignoreInput && player.canCancelIgnoreInput) {
    if (player.body.touching.down || player.body.touching.left || player.body.touching.right || player.body.touching.up) {
      player.ignoreInput = false;
      player.canCancelIgnoreInput = false;
    }
  }

  if (!player.body.touching.down && !state.isWallJumping && (player.body.velocity.y > -40 || !state.jumpButtonHeld)) {
    player.body.setGravityY(config.physics.arcade.gravity.y * 4);
  }

  if (player.body.touching.down) {
    player.body.setGravityY(0);
    player.isJumping = false;

    player.canDoubleJump = true;
    player.isDoubleJumping = false;

    if (prop('cheat.forbidDoubleJump')) {
      player.canDoubleJump = false;
    }

    player.canWallJump = true;
    player.isWallJumping = false;
    player.wallJumpIgnoreDirection = false;
    player.wallJumpContinuing = false;
    player.wallJumpHeld = false;
    player.wallJumpContra = false;
    player.jumpButtonHeld = false;

    if (prop('cheat.forbidWallJump')) {
      player.canWallJump = false;
    }

    /*
    level.objects.freebies.forEach((freebie) => {
      if (freebie.spent) {
        freebie.spent = false;
        freebie.setFrame(0);
      }
    });

    if (player.freebies) {
      player.freebies = 0;
      hud.freebies.forEach((freebie) => {
        freebie.destroy();
      });
      hud.freebies = [];
    }
    */
  }

  // make sure movers never get out of hand
  level.objects.movers.forEach((mover) => {
    const distance = mover.config.distance * config.tileWidth / 2;
    if (mover.x < mover.initialPosition[0] - distance) {
      mover.x = mover.initialPosition[0] - distance;
    }
    if (mover.x > mover.initialPosition[0] + distance) {
      mover.x = mover.initialPosition[0] + distance;
    }
  });

  // squish and stretch
  let vx = Math.abs(player.body.velocity.x) / (config.tileWidth * config.tileWidth);
  let vy = Math.abs(player.body.velocity.y) / (config.tileHeight * config.tileHeight);
  /*
  if (vx > vy) {
    vy = -vx;
  } else if (vy > vx) {
    vx = -vy;
  }
  */
  if (vx + vy > 0) {
    [vx, vy] = [
      (vx - vy) / (vx + vy),
      (vy - vx) / (vx + vy),
    ];
  }

  const puffLeft = player.body.touching.left && state.leftButtonDown;
  let puffEnabled = false;
  if ((player.body.touching.left && state.leftButtonDown) || (player.body.touching.right && state.rightButtonDown)) {
    vx = 0.7;
    vy = -0.7;
    const max = prop('player.grab.max_y');
    // we intentionally don't do this for the other direction because of
    // jumping against walls being a common case
    if (player.body.velocity.y > max) {
      player.setVelocityY(max);
      puffEnabled = true;
      setPlayerAnimation('Drag');
      if (leftButtonDown) {
        player.setFlipX(true);
      } else if (rightButtonDown) {
        player.setFlipX(false);
      }
    }
  }

  manageWallDragPuff(puffEnabled, puffLeft);

  if (player.isDoubleJumping) {
    vy += 0.7;
    vx -= 0.7;
  } else if (player.isWallJumping) {
    vx += 0.7;
    vy -= 0.7;
  }

  vx *= prop('player.squish.max');
  vy *= prop('player.squish.max');
  vy += 1;
  vx += 1;

  // intentionally flipped for vx, vy
  const scaleX = player.scaleX + prop('player.squish.speed') * (vy - player.scaleX) * dt / 16.667;
  const scaleY = player.scaleY + prop('player.squish.speed') * (vx - player.scaleY) * dt / 16.667;

  player.setScale(scaleX, scaleY); // intentionally flipped

  if (state.shader) {
    state.shockwaveTime += state.shockwaveIncrement;
    state.shader.setFloat1('shockwaveTime', state.shockwaveTime);
  }
}

function updateEnemies() {
  const { level, physics } = state;
  const { enemies } = level;

  enemies.forEach((enemy) => {
    // hasn't ever touched the floor yet…
    if (!enemy.body.touching.down && enemy.movingLeft === undefined) {
      enemy.setVelocityX(0);
    } else {
      if (enemy.movingLeft === undefined) {
        enemy.movingLeft = !!enemy.config.startsMovingLeft;
      } else if (enemy.movingLeft && enemy.body.touching.left) {
        enemy.movingLeft = false;
      } else if (!enemy.movingLeft && enemy.body.touching.right) {
        enemy.movingLeft = true;
      }

      enemy.setFlipX(!enemy.movingLeft);

      if (enemy.config.edgeCareful) {
        if (enemy.body.velocity.y > 0) {
          enemy.movingLeft = !enemy.movingLeft;
          enemy.setAccelerationY(0);
          enemy.setVelocityY(0);
          enemy.x = enemy.oldX;
          enemy.y = enemy.oldY;
        }

        enemy.oldX = enemy.x;
        enemy.oldY = enemy.y;
      }

      if (enemy.movingLeft) {
        enemy.setVelocityX(-enemy.config.speed);
      } else {
        enemy.setVelocityX(enemy.config.speed);
      }
    }
  });
}

function update(time, dt) {
  const { game, keys, cursors, debug } = state;

  listenProp('time', time);
  listenProp('frameTime', dt);

  readInput();
  processInput();
  frameUpdates(dt);
  updateEnemies();

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

