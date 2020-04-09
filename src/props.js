import {
  builtinPropSpecs, ManageableProps, PropLoader, makePropsWithPrefix,
  preprocessPropSpecs,
} from './scaffolding/lib/props';

const particleImages = [
  'effectImageSpark',
  'effectImageFloodlight',
  'effectImagePuff',
];

export const commands = {
  up: {
    input: ['keyboard.UP', 'gamepad.UP', 'keyboard.W', 'keyboard.NUMPAD_EIGHT', 'gamepad.LSTICK.UP', 'gamepad.RSTICK.UP'],
  },
  left: {
    input: ['keyboard.LEFT', 'gamepad.LEFT', 'keyboard.A', 'keyboard.NUMPAD_FOUR', 'gamepad.LSTICK.LEFT', 'gamepad.RSTICK.LEFT'],
  },
  right: {
    input: ['keyboard.RIGHT', 'gamepad.RIGHT', 'keyboard.D', 'keyboard.NUMPAD_SIX', 'gamepad.LSTICK.RIGHT', 'gamepad.RSTICK.RIGHT'],
  },
  down: {
    input: ['keyboard.DOWN', 'gamepad.DOWN', 'gamepad.LSTICK.DOWN', 'gamepad.RSTICK.DOWN'],
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

export const shaderCoordFragments = [
  ['shockwave', {
    time: ['float', 1000000.0, null],
    center: ['vec2', [0.5, 0.5], null],
    scale: ['float', 10.0, 0, 500],
    range: ['float', 0.8, 0, 10],
    thickness: ['float', 0.1, 0, 10],
    speed: ['float', 3.0, 0, 50],
    inner: ['float', 0.09, 0, 1],
    dropoff: ['float', 40.0, 0, 500],
  }, `
      if (shockwave_time < 10.0) {
        float dist = distance(uv, shockwave_center - camera_scroll);
        float t = shockwave_time * shockwave_speed;

        if (dist <= t + shockwave_thickness && dist >= t - shockwave_thickness && dist >= shockwave_inner) {
          float diff = dist - t;
          float scaleDiff = 1.0 - pow(abs(diff * shockwave_scale), shockwave_range);
          float diffTime = diff * scaleDiff;

          vec2 diffTexCoord = normalize(uv - (shockwave_center - camera_scroll));
          uv += (diffTexCoord * diffTime) / (t * dist * shockwave_dropoff);
        }
      }
  `],
];

export const shaderColorFragments = [
  ['blur', {
    amount: ['float', 0, null],
  }, `
      if (blur_amount > 0.0) {
        float b = blur_amount / resolution.x;
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
  `],

  ['tint', {
    color: ['rgba', [1, 1, 1, 1]],
  }, `
      c.r *= tint_color.r * tint_color.a;
      c.g *= tint_color.g * tint_color.a;
      c.b *= tint_color.b * tint_color.a;
  `],
];

export const propSpecs = {
  ...builtinPropSpecs(commands, shaderUniforms),

  'command.ignore_all.intro': [false, null, (scene) => scene.command.ignoreAll(scene, 'intro')],
  'command.ignore_all.spawn': [false, null, (scene) => scene.command.ignoreAll(scene, 'spawn')],
  'command.ignore_all.knockback': [false, null, (scene) => scene.command.ignoreAll(scene, 'knockback')],
  'command.ignore_all.outro': [false, null, (scene) => scene.command.ignoreAll(scene, 'outro')],

  'config.tile_width': [24, null, () => 24],
  'config.tile_height': [24, null, () => 24],
  'config.xBorder': [0, null, (scene) => scene.xBorder],
  'config.yBorder': [0, null, (scene) => scene.yBorder],
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
  'rules.jump.terminal_velocity_enabled': [true],
  'rules.jump.terminal_velocity': [500, 0, 1000],
  'rules.jump.coyote_grace_period_ms': [60, 0, 1000],
  'rules.jump.early_release': [true],

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
  'rules.walljump.drag_terminal_velocity_enabled': [true],
  'rules.walljump.drag_terminal_velocity': [50, 0, 1000],
  'rules.walljump.detach_grace_period_ms': [100, 0, 1000],
  'rules.walljump.forbid': [false],

  'rules.hyperjump.velocity_x': [600, 0, 1000],
  'rules.hyperjump.velocity_y': [175, 0, 1000],
  'rules.hyperjump.landed_grace_period_ms': [100, 0, 1000],
  'rules.hyperjump.forbid': [false],

  'rules.enemy.walk_velocity': [30, 0, 1000],

  'level.name': ['', null],
  'level.index': [-1, null],
  'level.filename': ['', null],
  'level.startedAt': [0, null],
  'level.skip_intro': [false],
  'level.skip_outro': [false],
  'level.skip_hints': [false],
  'level.eye_tracking': [true],
  'level.playerDie': [(scene) => scene.playerDie()],
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
  'player.respectsPhysics': [true, null, 'player.body.enable'],
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
  'player.canHyperJump': [false, null],
  'player.isHyperJumping': [false, null],
  'player.touching_up': [false, null, 'player.body.touching.up'],
  'player.touching_down': [false, null, 'player.body.touching.down'],
  'player.touching_left': [false, null, 'player.body.touching.left'],
  'player.touching_right': [false, null, 'player.body.touching.right'],
  'player.animation': ['', null, 'player.previousAnimation'],
  'player.spritesheet': ['', null, 'player.previousStatus'],

  'enemies.animationVisible': [true],
  'enemies.count': [0, null, 'level.enemies.length'],

  'enemies.1.type': ['', null, 'level.enemyList[0].config.glyph'],
  'enemies.1.x': [0, null, 'level.enemyList[0].x'],
  'enemies.1.y': [0, null, 'level.enemyList[0].y'],
  'enemies.1.velocity_x': [0, null, 'level.enemyList[0].body.velocity.x'],
  'enemies.1.animation': ['', null, 'level.enemyList[0].anims.currentAnim.key'],
  'enemies.1.identify': [(scene) => scene.identifyEnemy(0)],

  'enemies.2.type': ['', null, 'level.enemyList[1].config.glyph'],
  'enemies.2.x': [0, null, 'level.enemyList[1].x'],
  'enemies.2.y': [0, null, 'level.enemyList[1].y'],
  'enemies.2.velocity_x': [0, null, 'level.enemyList[1].body.velocity.x'],
  'enemies.2.animation': ['', null, 'level.enemyList[1].anims.currentAnim.key'],
  'enemies.2.identify': [(scene) => scene.identifyEnemy(1)],

  'enemies.3.type': ['', null, 'level.enemyList[2].config.glyph'],
  'enemies.3.x': [0, null, 'level.enemyList[2].x'],
  'enemies.3.y': [0, null, 'level.enemyList[2].y'],
  'enemies.3.velocity_x': [0, null, 'level.enemyList[2].body.velocity.x'],
  'enemies.3.animation': ['', null, 'level.enemyList[2].anims.currentAnim.key'],
  'enemies.3.identify': [(scene) => scene.identifyEnemy(2)],

  'enemies.4.type': ['', null, 'level.enemyList[3].config.glyph'],
  'enemies.4.x': [0, null, 'level.enemyList[3].x'],
  'enemies.4.y': [0, null, 'level.enemyList[3].y'],
  'enemies.4.velocity_x': [0, null, 'level.enemyList[3].body.velocity.x'],
  'enemies.4.animation': ['', null, 'level.enemyList[3].anims.currentAnim.key'],
  'enemies.4.identify': [(scene) => scene.identifyEnemy(3)],

  'enemies.5.type': ['', null, 'level.enemyList[4].config.glyph'],
  'enemies.5.x': [0, null, 'level.enemyList[4].x'],
  'enemies.5.y': [0, null, 'level.enemyList[4].y'],
  'enemies.5.velocity_x': [0, null, 'level.enemyList[4].body.velocity.x'],
  'enemies.5.animation': ['', null, 'level.enemyList[4].anims.currentAnim.key'],
  'enemies.5.identify': [(scene) => scene.identifyEnemy(4)],

  'effects.damageBlur.amount': [2.5, 0, 50],
  'effects.damageBlur.in_ms': [100, 0, 2000],
  'effects.damageBlur.out_ms': [200, 0, 2000],
  'effects.damageBlur.visible': [true],
  'effects.damageBlur.execute': [(scene) => scene.damageBlur()],

  'effects.shockwave.visible': [true],
  'effects.shockwave.execute': [(scene) => scene.shockwave()],

  'effects.jumpShake.amount': [0.01, 0, 0.1],
  'effects.jumpShake.duration_ms': [75, 0, 1000],
  'effects.jumpShake.visible': [true],
  'effects.jumpShake.execute': [(scene) => scene.jumpShake()],

  'effects.backgroundFloodlights.particles': [{
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

  'effects.spikeJitter.tween': [{
    duration: 500,
    dx: 4,
    dy: 4,
    yoyo: true,
    loop: -1,
    ease: 'Cubic.easeInOut',
  }],

  'effects.jumpcoinBob.tween': [{
    duration: 1000,
    ease: 'Cubic.easeInOut',
    dy: 8,
    yoyo: true,
    loop: -1,
    refreshPhysics: true,
  }],

  'effects.jumpcoinRespawn.tween': [{
    duration: 1000,
    ease: 'Cubic.easeOut',
    alpha: 1,
  }],

  'effects.enemyKill.1.tween': [{
    duration: 1000,
    ease: 'Back.easeIn',
    dy: 800,
    destroyOnComplete: true,
  }],

  'effects.enemyKill.2.tween': [{
    duration: 1000,
    ease: 'Quad.easeIn',
    dx: 24 * 3,
    rotation: 115,
    alpha: 0.0,
    scaleX: 1.5,
    scaleY: 1.5,
  }],

  'effects.spendCoin.up1.tween': [{
    duration: 300,
    dy: -12,
    ease: 'Quad.easeOut',
  }],

  'effects.spendCoin.up2.tween': [{
    delay: 300,
    duration: 500,
    dy: 6,
    ease: 'Quad.easeIn',
  }],

  'effects.spendCoin.side1.tween': [{
    duration: 1000,
    dx: 100,
    ease: 'Cubic.easeOut',
  }],

  'effects.spendCoin.side2.tween': [{
    duration: 1000,
    dy: 50,
    ease: 'Quad.easeIn',
  }],

  'effects.spendCoin.fade.tween': [{
    duration: 1000,
    alpha: 0,
    destroyOnComplete: true,
  }],

  'effects.spawnPlayer.tween': [{
    duration: 500,
    alpha: 1,
  }],

  'effects.jumpcoinCollect.tween': [{
    duration: 1000,
    dy: 8,
    ease: 'Cubic.easeOut',
    alpha: 0.4,
  }],

  'effects.jumpcoinToHud.tween': [{
    duration: 800,
    ease: 'Cubic.easeInOut',
  }],

  'effects.hint.show.tween': [{
    delay: 500,
    duration: 500,
    alpha: 1,
    dy: -20,
    ease: 'Cubic.easeOut',
  }],

  'effects.hint.attract.tween': [{
    duration: 2000,
    dy: 8,
    ease: 'Quad.easeInOut',
    yoyo: true,
    loop: -1,
  }],

  'effects.hint.remove.tween': [{
    delay: 300,
    duration: 500,
    alpha: 0,
    dy: 20,
    ease: 'Cubic.easeIn',
    destroyOnComplete: true,
  }],

  'effects.banner.introBannerIn.tween': [{
    ease: 'Cubic.easeIn',
    duration: 500,
  }],

  'effects.banner.titleIn.tween': [{
    alpha: 1,
    dy: -20,
    ease: 'Cubic.easeOut',
    duration: 500,
  }],

  'effects.banner.badgeIn.tween': [{
    delay: 50,
    dy: 20,
    ease: 'Cubic.easeOut',
    duration: 500,
  }],

  'effects.banner.speedrunIn.tween': [{
    alpha: 1,
    delay: 500,
    dy: 20,
    ease: 'Cubic.easeOut',
    duration: 500,
  }],

  'effects.banner.contentsOut.tween': [{
    duration: 500,
    alpha: 0,
  }],

  'effects.banner.introBannerOut.tween': [{
    delay: 2250,
    duration: 500,
    scaleY: 0,
  }],

  'effects.banner.outroBannerIn.tween': [{
    ease: 'Cubic.easeIn',
    duration: 500,
  }],

  'effects.banner.outroBannerOut.tween': [{
    delay: 4250,
    duration: 500,
    scaleY: 0,
  }],

  'effects.banner.earnedBadge.fadeBlankOut.tween': [{
    delay: 500,
    alpha: 0,
    duration: 500,
  }],

  'effects.banner.earnedBadge.fadeRealIn.tween': [{
    delay: 500,
    alpha: 1,
    duration: 500,
  }],

  'effects.banner.earnedBadge.bounce.tween': [{
    ease: 'Cubic.easeOut',
    duration: 300,
    delay: 500,
    dy: -6,
    yoyo: true,
  }],

  'effects.exitTractor.primaryAxis.tween': [{
    delay: 200,
    duration: 1000,
    ease: 'Cubic.easeIn',
    dx: 96,
    alpha: 0.7,
  }],

  'effects.exitTractor.secondaryAxis.tween': [{
    duration: 1500,
    ease: 'Cubic.easeOut',
  }],

  'effects.invincible.initial.tween': [{
    alpha: 0.5,
    duration: 300,
    yoyo: true,
    loop: -1,
  }],

  'effects.invincible.end.tween': [{
    alpha: 0.5,
    duration: 100,
    yoyo: true,
    loop: -1,
  }],

  'effects.identifyEnemy.tween': [{
    duration: 200,
    alpha: 0.1,
    loop: 1,
    yoyo: true,
  }],

  'effects.debugTeleport.enabled': [true],

  'effects.debugTeleport.intro.tween': [{
    duration: 200,
    alpha: 0.5,
    scaleX: 1.1,
    scaleY: 1.1,
    rotation: 10,
    ease: 'Cubic.easeInOut',
  }],

  'effects.debugTeleport.travel.tween': [{
    duration: 500,
    ease: 'Cubic.easeInOut',
  }],

  'effects.debugTeleport.outro.tween': [{
    duration: 200,
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    ease: 'Cubic.easeInOut',
  }],
};

propSpecs['scene.camera.lerp'][0] = 0.05;
propSpecs['scene.camera.deadzoneX'][0] = 200;
propSpecs['scene.camera.deadzoneY'][0] = 200;

export const tileDefinitions = {
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
    neutralAnimation: 'spriteEnemyANeutral',
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
    neutralAnimation: 'spriteEnemyBNeutral',
    walkAnimation: 'spriteEnemyBWalk',
    killAnimation: 'spriteEnemyBDie',
  },
  b: {
    _inherit: 'B',
    startsMovingLeft: true,
  },
};

preprocessPropSpecs(propSpecs, particleImages);

export const manageableProps = new ManageableProps(propSpecs);
export const propsWithPrefix = makePropsWithPrefix(propSpecs, manageableProps);
export default PropLoader(propSpecs, manageableProps);
