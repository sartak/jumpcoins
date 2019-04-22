/* @flow */
import Phaser from 'phaser';
import _ from 'lodash';

const DEBUG = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');

const props = {
};

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
    default: 'matter',
    matter: {
      debug: DEBUG,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const state : any = {
  game: null,
  physics: null,
  cursors: null,
  keys: {},
  debug: null,
};

function prop(name: string) {
  if (DEBUG && name in window.props) {
    return window.props[name];
  }
  return props[name];
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
}

function create() {
  const { game } = state;

  state.physics = game.matter;

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

  state.shader = game.game.renderer.addPipeline('Shader', new Shader(game.game));
  state.shader.setFloat2('resolution', config.width, config.height);
  game.cameras.main.setRenderToTexture(state.shader);
}

function update(dt) {
  const { game, keys, cursors, debug } = state;

  if (game.input.gamepad.total) {
    const pads = this.input.gamepad.gamepads;
    pads.filter(pad => pad).forEach((pad) => {
    });
  }
}

