import {
  builtinPropSpecs, ManageableProps, PropLoader, makePropsWithPrefix,
  preprocessTileDefinitions,
} from './scaffolding/lib/props';

const particleImages = [
  'effectImageSpark',
  'effectImageFloodlight',
  'effectImagePuff',
];

const commands = {
  up: {
    input: ['keyboard.UP', 'gamepad.UP', 'keyboard.W', 'keyboard.NUMPAD_EIGHT', 'gamepad.LSTICK.UP', 'gamepad.RSTICK.UP'],
  },
  down: {
    input: ['keyboard.DOWN', 'gamepad.DOWN', 'keyboard.S', 'keyboard.NUMPAD_TWO', 'gamepad.LSTICK.DOWN', 'gamepad.RSTICK.DOWN'],
  },
  left: {
    input: ['keyboard.LEFT', 'gamepad.LEFT', 'keyboard.A', 'keyboard.NUMPAD_FOUR', 'gamepad.LSTICK.LEFT', 'gamepad.RSTICK.LEFT'],
  },
  right: {
    input: ['keyboard.RIGHT', 'gamepad.RIGHT', 'keyboard.D', 'keyboard.NUMPAD_SIX', 'gamepad.LSTICK.RIGHT', 'gamepad.RSTICK.RIGHT'],
  },
  jump: {
    input: ['keyboard.Z', 'keyboard.SPACE', 'gamepad.A', 'gamepad.B', 'gamepad.X', 'gamepad.Y'],
  },
  quit: {
    input: ['keyboard.Q'],
    execute: 'forceQuit',
    debug: true,
    unsuppressable: true,
    unreplayable: true,
  },
  next: {
    input: ['keyboard.N', 'gamepad.R2'],
    execute: 'skipToNextLevel',
    debug: true,
    unsuppressable: true,
  },
  restart: {
    input: ['keyboard.R', 'gamepad.L1'],
    execute: 'restartCurrentLevel',
    debug: true,
    unsuppressable: true,
  },
  previous: {
    input: ['keyboard.P', 'gamepad.L2'],
    execute: 'skipToPreviousLevel',
    debug: true,
    unsuppressable: true,
  },
  recordCycle: {
    input: ['gamepad.R1', 'keyboard.T'],
    unreplayable: true,
    debug: true,
    unsuppressable: true,
    execute: (scene, game) => {
      const {_replay, _recording} = game;
      if (_replay && _replay.timeSight) {
        game.stopReplay();
      } else if (_replay) {
        setTimeout(() => {
          game.stopReplay();
          game.beginReplay({..._replay, timeSight: true});
        });
      } else if (_recording) {
        game.stopRecording();
      } else {
        game.beginRecording();
      }
    },
  },
};

export {commands};

export const propSpecs = {
  ...builtinPropSpecs(commands),

  'command.ignore_all.intro': [false, null, (scene) => scene.command.ignoreAll(scene, 'intro')],
  'command.ignore_all.spawn': [false, null, (scene) => scene.command.ignoreAll(scene, 'spawn')],
  'command.ignore_all.knockback': [false, null, (scene) => scene.command.ignoreAll(scene, 'knockback')],
  'command.ignore_all.outro': [false, null, (scene) => scene.command.ignoreAll(scene, 'outro')],

  'config.map_width': [30, 30, 30],
  'config.map_height': [22, 22, 22],
  'config.tile_width': [24, 24, 24],
  'config.tile_height': [24, 24, 24],
  'config.timesight_jumpcoins': [false],
  'config.timesight_player': [true],

  'rules.base_gravity': [400, 0, 1000],
  'rules.damage.invincibility_ms': [1000, 0, 10000],
  'rules.damage.knockback_ignore_input_ms': [50, 0, 500],
  'rules.damage.spike_knockback_x': [40, 0, 500],
  'rules.damage.spike_knockback_y': [100, 0, 500],
  'rules.damage.infinite_coins': [false],

  'rules.walk.velocity_x': [200, 0, 1000],

  'rules.jump.velocity_x': [200, 0, 1000],
  'rules.jump.velocity_y': [260, 0, 1000],
  'rules.jump.down_gravity': [4, 0, 20],
  'rules.jump.terminal_velocity': [500, 0, 1000],
  'rules.jump.coyote_grace_period_ms': [60, 0, 1000],

  'rules.double_jump.velocity_x': [75, 0, 1000],
  'rules.double_jump.velocity_y': [350, 0, 1000],
  'rules.double_jump.forbid': [false],

  'rules.walljump.velocity_x': [600, 0, 1000],
  'rules.walljump.reverse_velocity_x': [100, 0, 1000],
  'rules.walljump.continue_lerp_x': [0.5, 0, 1],
  'rules.walljump.reverse_lerp_x': [0.3, 0, 1],
  'rules.walljump.velocity_y': [175, 0, 1000],
  'rules.walljump.gravity_y': [-100, -1000, 1000],
  'rules.walljump.ignore_direction_ms': [400, 0, 1000],
  'rules.walljump.drag_terminal_velocity': [50, 0, 1000],
  'rules.walljump.detach_grace_period_ms': [100, 0, 1000],
  'rules.walljump.forbid': [false],

  'level.name': ['', null],
  'level.index': [-1, null],
  'level.filename': ['', null],
  'level.startedAt': [0, null],
  'level.skip_intro': [false],
  'level.skip_outro': [false],
  'level.respawn': [(scene) => scene.respawn()],
  'level.previous': [(scene) => scene.skipToPreviousLevel()],
  'level.restart': [(scene) => scene.restartCurrentLevel()],
  'level.next': [(scene) => scene.skipToNextLevel()],
  'level.win': [(scene) => scene.winLevel()],
  'level.earnedBadges.badgeCompleted': [false, null],
  'level.earnedBadges.badgeDeathless': [false, null],
  'level.earnedBadges.badgeDamageless': [false, null],
  'level.earnedBadges.badgeRich': [false, null],
  'level.earnedBadges.badgeBirdie': [false, null],
  'level.earnedBadges.badgeKiller': [false, null],

  'player.animationVisible': [true],
  'player.statusVisible': [true],
  'player.squish_max_enabled': [true],
  'player.squish_max': [0.10, 0, 1],
  'player.squish_speed': [0.2, 0, 1],
  'player.jumpcoins': [0, null],
  'player.x': [0.01, null],
  'player.y': [0.01, null],
  'player.velocity_x': [0.01, null, 'player.body.velocity.x'],
  'player.velocity_y': [0.01, null, 'player.body.velocity.y'],
  'player.invincible': [false, null],
  'player.canCancelKnockbackIgnore': [false, null],
  'player.isJumping': [false, null],
  'player.hasLiftedOff': [false, null],
  'player.canDoubleJump': [false, null],
  'player.isDoubleJumping': [false, null],
  'player.canWallJump': [false, null],
  'player.isWallJumping': [false, null],
  'player.wallJumpIgnoreDirection': [false, null],
  'player.wallJumpContinuing': [false, null],
  'player.wallJumpDirectionLeft': [false, null],
  'player.wallJumpHeld': [false, null],
  'player.wallJumpContra': [false, null],
  'player.touching_up': [false, null, 'player.body.touching.up'],
  'player.touching_down': [false, null, 'player.body.touching.down'],
  'player.touching_left': [false, null, 'player.body.touching.left'],
  'player.touching_right': [false, null, 'player.body.touching.right'],
  'player.animation': ['', null, 'player.previousAnimation'],
  'player.spritesheet': ['', null, 'player.previousStatus'],

  'effects.damageBlur.amount': [2.5, 0, 50],
  'effects.damageBlur.in_ms': [100, 0, 2000],
  'effects.damageBlur.out_ms': [200, 0, 2000],
  'effects.damageBlur.visible': [true],
  'effects.damageBlur.execute': [(scene) => scene.damageBlur()],
  'effects.damageBlur.executeRepeatedly': [false],

  'effects.shockwave.scale': [10.0, 0, 500, (value, scene) => scene.shader && scene.shader.setFloat1('shockwaveScale', value)],
  'effects.shockwave.range': [0.8, 0, 10, (value, scene) => scene.shader && scene.shader.setFloat1('shockwaveRange', value)],
  'effects.shockwave.thickness': [0.1, 0, 10, (value, scene) => scene.shader && scene.shader.setFloat1('shockwaveThickness', value)],
  'effects.shockwave.speed': [3.0, 0, 50, (value, scene) => scene.shader && scene.shader.setFloat1('shockwaveSpeed', value)],
  'effects.shockwave.inner': [0.09, 0, 1, (value, scene) => scene.shader && scene.shader.setFloat1('shockwaveInner', value)],
  'effects.shockwave.dropoff': [40.0, 0, 500, (value, scene) => scene.shader && scene.shader.setFloat1('shockwaveDropoff', value)],
  'effects.shockwave.visible': [true],
  'effects.shockwave.execute': [(scene) => scene.shockwave()],
  'effects.shockwave.executeRepeatedly': [false],

  'effects.jumpShake.amount': [0.01, 0, 0.1],
  'effects.jumpShake.duration_ms': [75, 0, 1000],
  'effects.jumpShake.visible': [true],
  'effects.jumpShake.execute': [(scene) => scene.jumpShake()],
  'effects.jumpShake.executeRepeatedly': [false],

  'effects.floodlights.particles': [{
    image: 'effectImageFloodlight',
    blendMode: 'SCREEN',
    quantity: 3,
    frequency: 1500,
    lifespan: 50000,
    preemit: true,
  }],

  'effects.exitSpark.particles': [{
    image: 'effectImageSpark',
    scaleX: 0.1,
    scaleY: 0.1,
    blendMode: 'SCREEN',
    quantity: 2,
    frequency: 70,
    lifespan: 3000,
    preemit: true,
  }],
  'effects.exitGlow.particles': [{
    image: 'effectImageFloodlight',
    quantity: 1,
    frequency: 3000,
    lifespan: 10000,
    blendMode: 'SCREEN',
    preemit: true,
  }],

  'effects.jumpcoinGlow.particles': [{
    image: 'effectImageFloodlight',
    quantity: 1,
    frequency: 3000,
    lifespan: 10000,
    blendMode: 'SCREEN',
    tint: 0x4397F7,
    preemit: true,
  }],

  'effects.jumpcoinSpark.particles': [{
    image: 'effectImageSpark',
    speed: 5,
    tint: 0x4397F7,
    scaleX: 0.1,
    scaleY: 0.1,
    blendMode: 'SCREEN',
    quantity: 6,
    frequency: 3000,
    lifespan: 5000,
    preemit: true,
  }],

  'effects.jumpPuff.particles': [{
    image: 'effectImagePuff',
    speed: 50,
    quantity: 1,
    lifespan: 500,
    frequency: 1000,
    accelerationY: -200,
    x: 5,
    y: 10,
  }],

  'effects.wallDragPuff.particles': [{
    image: 'effectImagePuff',
    speed: 50,
    blendMode: 'ADD',
    quantity: 1,
    alpha: 0.5,
    lifespan: 200,
    x: 10,
  }],
};

export const tileDefinitions = preprocessTileDefinitions({
  '.': null, // background
  '#': {
    image: 'tileWall',
    group: 'ground',
    combineVertical: true,
  },
  '{': {
    _inherit: '#',
    leftEdge: true,
  },
  '}': {
    _inherit: '#',
    rightEdge: true,
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
  v: {
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
  0: {
    image: 'tileEye',
    group: 'eyes',
    object: true,
  },
  _: {
    image: 'tileSemiground',
    group: 'semiground',
  },
  ']': {
    image: 'tileWall',
    group: 'movers',
    object: true,
    dynamic: true,
    speed: 40,
    distance: 3,
  },
  '[': {
    _inherit: ']',
    movingLeft: true,
  },
  '(': {
    _inherit: ']',
    leftEdge: true,
  },
  ')': {
    _inherit: ']',
    rightEdge: true,
  },
  '@': null, // player
  '*': {
    image: 'spriteJumpcoin',
    group: 'jumpcoins',
    object: true,
  },
  '?': {
    image: 'tileTransparent',
    group: 'removeHints',
    object: true,
  },
  A: {
    image: 'spriteEnemyA',
    group: 'enemies',
    object: true,
    dynamic: true,
    speed: 30,
    walkAnimation: 'spriteEnemyAWalk',
    killAnimation: 'spriteEnemyADie',
  },
  a: {
    _inherit: 'A',
    startsMovingLeft: true,
  },
  B: {
    _inherit: 'A',
    image: 'spriteEnemyB',
    edgeCareful: true,
    walkAnimation: 'spriteEnemyBWalk',
    killAnimation: 'spriteEnemyBDie',
  },
  b: {
    _inherit: 'B',
    startsMovingLeft: true,
  },
});

export const manageableProps = new ManageableProps(propSpecs, particleImages);
export const propsWithPrefix = makePropsWithPrefix(propSpecs, manageableProps);
export default PropLoader(propSpecs, manageableProps);
