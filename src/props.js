export default {
  invincibility_ms: 5000,
  min_ignore_input_ms: 50,
  'spike_knockback.x': 40,
  'spike_knockback.y': 100,
  'velocityX.walk': 200,
  'velocityX.jump': 200,
  'velocityX.double_jump': 50,
  'velocityY.jump': 200,
  'velocityY.double_jump': 300,

  time: 0,
  frameTime: 0,

  'level.name': '',
  'level.index': -1,

  'input.upButtonDown': false,
  'input.downButtonDown': false,
  'input.leftButtonDown': false,
  'input.rightButtonDown': false,
  'input.jumpButtonDown': false,

  'keyboard.Z': false,
  'keyboard.X': false,
  'keyboard.C': false,
  'keyboard.up': false,
  'keyboard.down': false,
  'keyboard.left': false,
  'keyboard.right': false,

  'gamepad.A': false,
  'gamepad.B': false,
  'gamepad.X': false,
  'gamepad.Y': false,
  'gamepad.L1': false,
  'gamepad.L2': false,
  'gamepad.R1': false,
  'gamepad.R2': false,
  'gamepad.up': false,
  'gamepad.down': false,
  'gamepad.left': false,
  'gamepad.right': false,
  'gamepad.l_stick.x': 0.01,
  'gamepad.l_stick.y': 0.01,
  'gamepad.r_stick.x': 0.01,
  'gamepad.r_stick.y': 0.01,

  'player.life': 0,
  'player.x': 0.01,
  'player.y': 0.01,
  'player.velocity.x': 0.01,
  'player.velocity.y': 0.01,
  'player.invincible': false,
  'player.ignoreInput': false,
  'player.canCancelIgnoreInput': false,
  'player.canDoubleJump': false,
  'player.isDoubleJumping': false,
  'player.touching.up': false,
  'player.touching.down': false,
  'player.touching.left': false,
  'player.touching.right': false,

  'cheat.hearty': true,

  winLevel: () => window.state.commands.winLevel(),
  restartLevel: () => window.state.commands.restartLevel(),
};
