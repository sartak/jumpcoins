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

import levelStairs from './assets/maps/stairs.map';
import levelBye from './assets/maps/bye.map';

import tileWall from './assets/tiles/wall.png';
import tileExit from './assets/tiles/exit.png';
import tileSpikesUp from './assets/tiles/spikes-up.png';
import tileSpikesDown from './assets/tiles/spikes-down.png';
import tileSpikesLeft from './assets/tiles/spikes-left.png';
import tileSpikesRight from './assets/tiles/spikes-right.png';
import tileEye from './assets/tiles/eye.png';
import tileSemiground from './assets/tiles/semiground.png';
import tileTransparent from './assets/tiles/transparent.png';

import spritePlayer from './assets/sprites/player.png';
import spriteFreebie from './assets/sprites/freebie.png';
import spriteHeart from './assets/sprites/heart.png';
import spriteEnemyA from './assets/sprites/enemy-a.png';

import effectImagePuff from './assets/effects/puff.png';

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
    levelDoubleJumpD,
    levelDoubleJumpBB,

    levelWallJump,
    levelWallJumpA,
    levelWallJumpB,

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
      image: 'tileExit',
      group: 'exit',
    },
    '^': {
      image: 'tileSpikesUp',
      group: 'spikes',
      knockback: true,
    },
    'v': {
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
    '_': {
      image: 'tileSemiground',
      group: 'semiground',
    },
    '[': {
      image: 'tileWall',
      group: 'movers',
      object: true,
      dynamic: true,
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
    },
    'a': {
      image: 'spriteEnemyA',
      group: 'enemies',
      object: true,
      dynamic: true,
      startsMovingLeft: true,
      speed: 30,
    },
    'B': {
      image: 'spriteEnemyA',
      group: 'enemies',
      object: true,
      dynamic: true,
      edgeCareful: true,
      speed: 30,
    },
    'b': {
      image: 'spriteEnemyA',
      group: 'enemies',
      object: true,
      dynamic: true,
      edgeCareful: true,
      startsMovingLeft: true,
      speed: 30,
    },
  },

  // filled in next
  xBorder: 0,
  yBorder: 0,
};

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
        uniform float shockwaveScale;
        uniform float shockwaveRange;
        uniform float shockwaveThickness;
        uniform float shockwaveSpeed;
        uniform float shockwaveInner;
        uniform float shockwaveDropoff;

        uniform float blurEffect;

        void main( void ) {
          vec2 uv = outTexCoord;

          if (shockwaveTime < 10.0) {
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
    window.state.commands.damageBlur = damageBlur;
    window.state.commands.deathShockwave = deathShockwave;
    window.state.commands.jumpShake = jumpShake;

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
  game.load.image('tileSemiground', tileSemiground);
  game.load.image('tileTransparent', tileTransparent);

  game.load.image('spritePlayer', spritePlayer);
  game.load.image('spriteEnemyA', spriteEnemyA);
  game.load.image('spriteHeart', spriteHeart);
  game.load.spritesheet('spriteFreebie', spriteFreebie, { frameWidth: config.tileWidth, frameHeight: config.tileHeight });

  game.load.image('effectImagePuff', effectImagePuff);
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
  level.timers = [];
  level.particles = [];

  initializeMap();

  createLevelObjects();

  createPlayer();

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
}

function scheduleMover(mover, isFirst) {
  const { game, level } = state;

  const speed = prop('mover.speed');
  const distance = config.tileWidth * prop('mover.distance') * (isFirst ? 0.5 : 1);
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

  const speed = prop('mover.speed');

  mover.initialPosition = [mover.x, mover.y];
  mover.setVelocityX(-speed);
  mover.movingLeft = true;

  scheduleMover(mover, true);
}

function setupEnemy(enemy) {
}

function createLevelObjects() {
  const { level, physics } = state;
  const { objectDescriptions, statics } = level;

  const objects = {
    freebies: [],
    enemies: [],
    movers: [],
    removeHints: [],
  };

  objectDescriptions.forEach(({ x, y, tile }) => {
    const { group, dynamic, glyph, image } = tile;

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

  level.enemies = objects.enemies;
  level.objects = objects;

  level.objects.movers.forEach(mover => setupMover(mover));
  level.enemies.forEach(enemy => setupEnemy(enemy));
}

function createPlayer() {
  const { game, physics, level } = state;

  const location = level.playerLocation;
  const [x, y] = positionToScreenCoordinate(location[0], location[1]);
  const player = physics.add.sprite(x, y, 'spritePlayer');

  player.x += player.width / 2;
  player.y += player.height / 2;

  player.life = level.baseLife;
  player.freebies = 0;

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
  }

  Object.keys(level.objects).forEach((type) => {
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
    hud.intro[key].destroy();
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
  if (state.levelIndex < 0) {
    state.levelIndex += config.levels.length;
  }
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

  if (!state.shader) {
    return;
  }

  state.shockwaveTime = 0;
  state.shader.setFloat2('shockwaveCenter', player.x / config.width, player.y / config.height);
}

function spendLife(isVoluntary) {
  const { level } = state;
  const { player, hud } = level;

  let spendFreebie = false;

  if (isVoluntary) {
    if (player.freebies > 0) {
      spendFreebie = true;
    }
  } else {
    damageBlur();
  }

  if (spendFreebie) {
    player.freebies--;

    const freebie = hud.freebies.pop();
    // this should never happen, but better to not crash…
    if (freebie) {
      freebie.destroy();
    }
  } else if (!prop('cheat.hearty')) {
    player.life--;

    const heart = hud.hearts.pop();
    // this should never happen, but better to not crash…
    if (heart) {
      heart.destroy();
    }
  }

  if (player.life <= 0) {
    deathShockwave();
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

function destroyEnemy(enemy) {
  enemy.disableBody(true, true);
}

function takeEnemyDamage(object1, object2) {
  const { game, level } = state;
  const { player } = level;

  if (player.invincible) {
    return;
  }

  const enemy = object1.config && object1.config.group === 'enemies' ? object1 : object2;

  spendLife(false);

  setPlayerInvincible();

  destroyEnemy(enemy);
}

function acquireFreebie(object1, object2) {
  const { game, level } = state;
  const { player, hud } = level;

  const freebie = object1.config && object1.config.group === 'freebie' ? object1 : object2;

  freebie.spent = true;
  freebie.setFrame(1);

  player.freebies++;

  const x = 2 * config.tileWidth;
  const y = 0;
  const img = game.add.image(x, y, 'spriteFreebie');
  hud.freebies.push(img);
  img.x += img.width / 2 + img.width * (player.freebies + player.life);
  img.y += config.yBorder / 2;
}

function checkFreebieSpent(object1, object2) {
  const { game, level } = state;
  const { player, hud } = level;

  const freebie = object1.config && object1.config.group === 'freebie' ? object1 : object2;
  return !freebie.spent;
}

function checkSemiground(object1, object2) {
  const { game, level } = state;
  const { player, hud } = level;

  const semiground = object1.config && object1.config.group === 'semiground' ? object1 : object2;
  if (player.body.velocity.y < 0 || player.body.y >= semiground.y) {
    return false;
  }
  return true;
}

function removeHints() {
  const { game, level } = state;
  const { hud } = level;

  hud.hints.forEach((hint) => {
    hint.destroy();
  });

  game.time.addEvent({
    callback: () => {
      level.objects.removeHints.forEach((removeHint) => {
        removeHint.destroy();
      });
      level.objects.removeHints = [];
    },
  });
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

  physics.add.overlap(player, statics.exit, winLevel);
  physics.add.collider(enemies, statics.exit);

  physics.add.collider(player, statics.spikes, takeSpikeDamage);
  physics.add.collider(enemies, statics.spikes);

  physics.add.overlap(player, statics.freebies, acquireFreebie, checkFreebieSpent);
  physics.add.overlap(player, statics.removeHints, removeHints);

  physics.add.collider(player, enemies, takeEnemyDamage);
  physics.add.collider(enemies, enemies);
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

  hud.freebies = [];

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
      createLevelObjects();
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
  renderLevelIntro();
}

function renderLevelIntro() {
  const { game, level } = state;
  const { hud } = level;

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
  hud.intro = {
    levelName,
  };

  game.time.addEvent({
    delay: 2000,
    callback: () => {
      Object.keys(hud.intro).forEach((key) => {
        hud.intro[key].destroy();
      });
    },
  });
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

    state.shockwaveTime = 1000000;
    state.shockwaveIncrement = 0.005;
    state.shader.setFloat1('shockwaveTime', state.shockwaveTime);
    state.shader.setFloat1('shockwaveScale', prop('effect.shockwave.scale'));
    state.shader.setFloat1('shockwaveRange', prop('effect.shockwave.range'));
    state.shader.setFloat1('shockwaveThickness', prop('effect.shockwave.thickness'));
    state.shader.setFloat1('shockwaveSpeed', prop('effect.shockwave.speed'));
    state.shader.setFloat1('shockwaveInner', prop('effect.shockwave.inner'));
    state.shader.setFloat1('shockwaveDropoff', prop('effect.shockwave.dropoff'));

    state.shader.setFloat1('blurEffect', 0.0);

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
  if (type !== JUMP_NORMAL) {
    state.rumble = true;
    state.game.cameras.main.shake(
      prop('effect.jumpshake.duration_ms'),
      prop('effect.jumpshake.amount'),
    );
  }
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
      jumpShake(JUMP_NORMAL);
      player.setVelocityY(-prop('velocityY.jump'));
    } else if (player.canWallJump && ((player.body.touching.left && leftButtonDown) || (player.body.touching.right && rightButtonDown))) {
      jumpShake(JUMP_WALL);
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
      jumpShake(JUMP_DOUBLE);
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

function frameUpdates(dt) {
  const { level } = state;
  const { player, hud } = level;

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
  }

  // make sure movers never get out of hand
  const distance = prop('mover.distance') * config.tileWidth / 2;
  level.objects.movers.forEach((mover) => {
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
    }
    if (player.body.velocity.y > 0) {
      puffEnabled = true;
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
      if (enemy.movingLeft === undefined && enemy.config.startsMovingLeft) {
        enemy.movingLeft = true;
      } else if (enemy.movingLeft && enemy.body.touching.left) {
        enemy.movingLeft = false;
      } else if (!enemy.movingLeft && enemy.body.touching.right) {
        enemy.movingLeft = true;
      }

      if (enemy.config.edgeCareful) {
        if (enemy.body.velocity.y > 0) {
          enemy.movingLeft = !enemy.movingLeft;
          enemy.setVelocityY(0);
          enemy.X = enemy.oldX;
          enemy.Y = enemy.oldY;
        }
        enemy.oldX = enemy.X;
        enemy.oldY = enemy.Y;
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

  frameUpdates(dt);
  updateEnemies();

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

