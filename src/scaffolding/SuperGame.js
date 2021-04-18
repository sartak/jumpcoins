import Phaser from 'phaser';
import BootScene from './boot-scene';
import prop, {commands, shaderCoordFragments, shaderColorFragments} from '../props';
import {updatePropsFromStep} from './lib/manage-gui';
import {shaderTypeMeta} from './lib/shaders';
import {name as project} from '../../package.json';
import analytics from './lib/analytics';
import CommandManager from './CommandManager';

const baseConfig = {
  type: Phaser.AUTO,
  parent: 'engine',
  width: 800,
  height: 600,
  tileWidth: 24,
  tileHeight: 24,
};

export default class SuperGame extends Phaser.Game {
  constructor(subConfig, preloadScenes) {
    const config = {
      ...baseConfig,
      ...subConfig,
    };

    super(config);

    Object.entries(config).forEach(([key, value]) => {
      if (!(key in this.config)) {
        this.config[key] = value;
      }
    });

    this.debug = config.debug;

    this.scene.add('BootScene', BootScene, true, {seed: Date.now(), sceneId: String(Math.random())});

    this.preloadScenes = preloadScenes;

    // hack to stop phaser from rejecting our fullscreen
    // eslint-disable-next-line no-proto
    this.scale.__proto__.onFullScreenChange = function() {};

    this.prop = prop;

    this._replayPreflight = 0;

    this._onDisableDebugUI = [];

    this._sceneInitCallbacks = {};

    this.assets = {};

    this.command = new CommandManager(commands);

    this._shaderSource = {};
    this._shaderCoordFragments = shaderCoordFragments;
    this._shaderColorFragments = shaderColorFragments;
    this.shaderFragments = [...(shaderCoordFragments || []), ...(shaderColorFragments || [])];

    this.focused = true;

    this._sceneConstructors = {};
    [
      BootScene,
      ...preloadScenes,
    ].forEach((sceneClass) => {
      this._sceneConstructors[sceneClass.name] = sceneClass;
    });

    if (config.debug) {
      const game = this;
      window.scene = new Proxy({}, {
        get(target, key) {
          return game.topScene()[key];
        },
      });
      window.prop = prop;
    }

    this.events.on('step', () => {
      const topScene = this.topScene();

      this.readRawInput();

      if (config.debug) {
        if (this._replayPreflight > 0) {
          return;
        }

        if (!this.disableDebug && (!topScene._replay || !topScene._replay.timeSight)) {
          updatePropsFromStep(false);
        }

        if (prop('engine.throttle')) {
          const begin = new Date().getTime();
          // eslint-disable-next-line no-empty
          while ((new Date()).getTime() - begin < 50) {
          }
        }
      }
    });
  }

  changeVolume(newVolume) {
    this.volume = newVolume;

    if (this.currentMusicPlayer) {
      this.currentMusicPlayer.setVolume(newVolume * prop('scene.musicVolume'));
    }

    this.scene.scenes.forEach((scene) => {
      scene.changeVolume(newVolume);
    });
  }

  setFocused(isFocused) {
    if (this.focused === isFocused) {
      return;
    }

    this.focused = isFocused;
  }

  topScene() {
    const {scenes} = this.scene;
    return scenes[scenes.length - 1];
  }

  preloadComplete() {
    const spinner = document.getElementById('spinner');
    if (spinner && spinner.parentNode) {
      spinner.parentNode.removeChild(spinner);
    }

    this._preloadedAssets = true;
    this.tryLaunch();
  }

  activateGame(callback) {
    if (!this._activatedGame) {
      this._activatedGame = [];
    }

    if (callback) {
      this._activatedGame.push(callback);
    }

    this.tryLaunch();
  }

  tryLaunch() {
    if (!this._preloadedAssets || !this._activatedGame) {
      return;
    }

    if (this._launchedGame) {
      if (this._activatedGame) {
        this._activatedGame.forEach((callback) => {
          callback();
        });
        delete this._activatedGame;
      }
      return;
    }

    if (this._launchingGame) {
      return;
    }

    this._launchingGame = true;

    analytics('00 started game');

    // eslint-disable-next-line no-console
    console.warn(`Welcome to ${project}!`);

    // if clicking comes first, removing the scene immediately after
    // preloading finishes causes a crash
    setTimeout(() => {
      if (this.renderer.type === Phaser.CANVAS) {
        // eslint-disable-next-line no-alert
        alert('It looks like this browser will offer a degraded experience. For best results, please use Chrome!');
      }

      const cover = document.getElementById('cover');
      if (cover && cover.parentNode) {
        cover.parentNode.removeChild(cover);
      }

      this.scene.remove(BootScene.key());
      this.launch();

      const scene = this.topScene();
      if (scene) {
        scene.willTransitionFrom();
        scene.timer(() => scene.didTransitionFrom()).ignoresScenePause = true;
      }

      this._activatedGame.forEach((callback) => {
        callback();
      });
      delete this._activatedGame;
      this._launchedGame = true;
    });
  }

  onDisableDebugUI(callback) {
    if (this.disableDebug) {
      callback();
    } else {
      this._onDisableDebugUI.push(callback);
    }
  }

  disableDebugUI() {
    if (this.disableDebug) {
      return;
    }

    this.disableDebug = true;

    this._onDisableDebugUI.forEach((callback) => callback());

    const manage = document.querySelector('.development .Manage');
    if (manage) {
      manage.remove();
    }

    const replay = document.querySelector('.development .Replay');
    if (replay) {
      replay.remove();
    }

    const log = document.querySelector('.development .Logging');
    if (log) {
      log.remove();
    }
  }

  forceQuit() {
    this.stopRecording();
    this.stopReplay();

    this.destroy(true, true);

    const engine = document.querySelector('#engine-container');
    if (engine) {
      engine.remove();
    }

    this.disableDebugUI();

    const isInFullScreen = document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement;

    if (isInFullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  zeroPrefix(number, zeros) {
    let n = number;
    let o = '';
    for (let i = 1; i < zeros; i += 1) {
      if (n < 10) {
        o += '0';
      } else {
        n /= 10;
      }
    }

    return `${o}${number}`;
  }

  renderDateTime(date) {
    const zero = (n) => this.zeroPrefix(n, 2);
    return [
      [date.getFullYear(), zero(date.getMonth() + 1), zero(date.getDate())].join('-'),
      [date.getHours(), zero(date.getMinutes()), zero(date.getSeconds())].join(':'),
    ].join(' ');
  }

  renderMillisecondDuration(duration) {
    const m = Math.floor(duration / 1000 / 60);
    if (m > 99) return '99:99.99+';
    const s = duration / 1000 - m * 60;
    return `${m}:${this.zeroPrefix(s.toFixed(3), 2)}`;
  }

  beginRecording(options = {}) {
    const scene = this.topScene();

    const now = new Date();

    this._recording = {
      timestamp: now.getTime(),
      initData: scene.scene.settings.data,
      sceneName: scene.constructor.name,
      name: this.renderDateTime(now),
      commandState: this.command.freezeCommandState(),
      ...options,
    };

    scene.beginRecording(this._recording);

    if (this._recording.snapshot) {
      this.stopRecording();
    } else if (this.onRecordBegin) {
      this.onRecordBegin(this._recording);
    }
  }

  stopRecording() {
    const recording = this._recording;
    if (!recording) {
      return;
    }

    this.topScene().stopRecording();
    delete this._recording;

    if (this.onRecordStop) {
      this.onRecordStop(recording);
    }

    return recording;
  }

  beginReplay(replay, options = {}) {
    this._replay = replay;

    let {startFromTransition} = options;
    const {sceneTransitions} = replay;
    if (!startFromTransition && sceneTransitions) {
      for (let i = 0; i < sceneTransitions.length; i += 1) {
        if (sceneTransitions[i].tickCount <= replay.preflightCutoff) {
          startFromTransition = sceneTransitions[i];
        }
      }
    }

    const preflightCutoff = Math.max(
      replay.preflightCutoff,
      startFromTransition ? (startFromTransition.tickCount || 0) : 0,
    );

    this.transitionToSceneToBeginReplay(replay, startFromTransition).then((newScene) => {
      newScene.beginReplay(replay, {
        ...options,
        startFromTransition,
        preflightCutoff,
        onEnd: () => {
          this.endedReplay();
        },
        onStop: () => {
          this.stopReplay(true);
        },
      });

      if (this.onReplayBegin) {
        this.onReplayBegin(replay);
      }
    });
  }

  transitionToSceneToBeginReplay(replay, startFromTransition) {
    const oldScene = this.topScene();
    const sceneKey = `scene-${Math.random() * Date.now()}`;

    const {
      sceneSaveState, sceneName, initData, commandState,
    } = startFromTransition || replay;
    const save = JSON.parse(JSON.stringify(sceneSaveState));
    const {seed} = (startFromTransition || replay).initData;

    const returnPromise = new Promise((resolve, reject) => {
      this.onSceneInit(sceneKey, (newScene) => {
        this.command.thawCommandState(commandState);
        newScene.willTransitionFrom(null, null);
        oldScene._sceneTransition(oldScene, newScene, null);
        resolve(newScene, null);
      });
    });

    oldScene.scene.add(
      sceneKey,
      this._sceneConstructors[sceneName],
      true,
      {
        ...initData,
        save,
        seed,
        transition: null,
      },
    );

    return returnPromise;
  }

  endedReplay() {
    if (!this._replay) {
      return;
    }

    const replay = this._replay;
    delete this._replay;

    if (this.onReplayEnd) {
      this.onReplayEnd(replay);
    }
  }

  stopReplay(skipDownward) {
    if (!this._replay) {
      return;
    }

    const replay = this._replay;
    delete this._replay;

    if (!skipDownward) {
      this.topScene().stopReplay();
    }

    if (this.onReplayStop) {
      this.onReplayStop(replay);
    }
  }

  playMusic(name, forceRestart) {
    if (forceRestart || this.currentMusicName !== name) {
      if (this.currentMusicPlayer && this.currentMusicPlayer.key) {
        this.currentMusicPlayer.destroy();
      }

      if (name) {
        try {
          const music = this.sound.add(name);
          if (!music || !music.key) {
            // eslint-disable-next-line no-console
            console.warn(`Could not load music ${name}`);
            return;
          }

          music.play('', {loop: true});
          music.setVolume(this.volume * prop('scene.musicVolume'));
          this.currentMusicPlayer = music;
          this.currentMusicName = name;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(`Could not play music ${name}: ${e}`);
        }
      } else {
        this.currentMusicName = name;
      }
    }
  }

  readRawInput() {
    const scenes = this.scene.scenes.filter((scene) => scene.input.gamepad);
    if (scenes) {
      this.command.readRawGamepad(scenes);
    }
  }

  cutoffTimeSightEnter() {
    const scene = this.topScene();
    if (scene) {
      scene.cutoffTimeSightEnter();
    }
  }

  cutoffTimeSightChanged(start, end) {
    const scene = this.topScene();
    if (scene) {
      scene.cutoffTimeSightChanged(start, end);
    }
  }

  cutoffTimeSightLeave() {
    const scene = this.topScene();
    if (scene) {
      scene.cutoffTimeSightLeave();
    }
  }

  shaderInstance(shaderName) {
    if (this.renderer.type !== Phaser.WEBGL) {
      return null;
    }

    return this.renderer.getPipeline(shaderName);
  }

  initializeShader(shaderName, replace) {
    if (this.renderer.type !== Phaser.WEBGL) {
      return;
    }

    if (!replace && this.renderer.hasPipeline(shaderName)) {
      return;
    }

    const source = this.generateShaderSource(shaderName);

    if (source) {
      const shaderClass = this.shaderInstantiation(source);
      const shader = new shaderClass(this);

      // undefined `active` indicates the shader didn't completely load,
      // probably due to a compile error
      if (!shader || shader.active === undefined) {
        return;
      }

      if (replace) {
        this.renderer.removePipeline(shaderName);
      }

      this.renderer.addPipeline(shaderName, shader);

      shader.setFloat2('resolution', this.config.width, this.config.height);
    } else {
      this.renderer.removePipeline(shaderName);
    }

    this._shaderSource[shaderName] = source;
  }

  initializeMainShaders() {
    this.initializeShader('main');
  }

  updateShaderFragments(nextCoord, nextColor) {
    this._shaderCoordFragments = nextCoord;
    this._shaderColorFragments = nextColor;
    this.shaderFragments = [...(nextCoord || []), ...(nextColor || [])];

    this.recompileMainShaders();
  }

  generateShaderSourceInternal(shaderName) {
    if (shaderName !== 'main') {
      throw new Error('Multi-shader support not yet available');
    }

    const [shaderCoordSource, shaderColorSource] = [this._shaderCoordFragments, this._shaderColorFragments].map((fragments) => {
      if (!fragments) {
        return '';
      }

      return fragments.filter(([name]) => prop(`shader.${name}.enabled`)).map(([, , source]) => source).join('\n');
    });

    if (!shaderCoordSource && !shaderColorSource) {
      return;
    }

    return `
      void main( void ) {
        vec2 uv = outTexCoord;

        ${shaderCoordSource}

        vec4 c = texture2D(u_texture, uv);

        ${shaderColorSource}

        c.r *= c.a;
        c.g *= c.a;
        c.b *= c.a;

        gl_FragColor = vec4(c.r, c.g, c.b, 1.0);
      }
    `;
  }

  generateShaderSource(shaderName) {
    if (shaderName !== 'main') {
      throw new Error('Multi-shader support not yet available');
    }

    const builtinDeclarations = `
      precision mediump float;
    `;

    const builtinUniforms = `
      uniform sampler2D u_texture;
      varying vec2      outTexCoord;

      uniform vec2 resolution;
      uniform vec2 camera_scroll;
      uniform float scene_time;
    `;

    const uniformNames = [];
    const uniformDeclarations = [];

    this.shaderFragments.forEach(([fragmentName, uniforms]) => {
      if (!prop(`shader.${fragmentName}.enabled`)) {
        return;
      }

      Object.entries(uniforms).forEach(([uniformName, [type]]) => {
        const name = `${fragmentName}_${uniformName}`;
        uniformNames.push(name);
        const [, uniformType] = shaderTypeMeta[type];
        uniformDeclarations.push(`uniform ${uniformType} ${name};\n`);
      });
    });

    const userShaderMain = this.generateShaderSourceInternal(shaderName);
    if (!userShaderMain) {
      return userShaderMain;
    }

    uniformNames.forEach((name) => {
      const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);

      if (!userShaderMain.match(regex)) {
        // eslint-disable-next-line no-console, max-len
        console.error(`Shader program doesn't appear use uniform '${name}'. (If this is a false positive, try adding this to your program: // ${name}`);
      }
    });

    return `
      ${builtinDeclarations}
      ${builtinUniforms}
      ${uniformDeclarations.join('')}
      ${userShaderMain}
    `;
  }

  recompileShader(shaderName) {
    if (this.renderer.type !== Phaser.WEBGL) {
      return;
    }

    const oldSource = this._shaderSource[shaderName];
    const newSource = this.generateShaderSource(shaderName);

    if (oldSource === newSource) {
      return;
    }

    // eslint-disable-next-line no-console
    console.info(`Hot-loading shader ${shaderName}`);

    this._shaderSource[shaderName] = newSource;

    if (newSource) {
      this.initializeShader(shaderName, true);
    } else {
      this.renderer.removePipeline(shaderName);
    }

    const shader = this.shaderInstance(shaderName);

    this.scene.scenes.forEach((scene) => {
      if (scene.shaderName !== shaderName) {
        return;
      }

      scene.shader = shader;
      if (newSource) {
        scene._shaderInitialize();
        scene._shaderUpdate();
        scene.camera.setPipeline(shader);
      } else {
        scene.camera.clearRenderToTexture();
      }
    });
  }

  recompileMainShaders() {
    this.recompileShader('main');
  }

  disableShader(shaderName) {
    if (this.renderer.type !== Phaser.WEBGL) {
      return;
    }

    this._shaderSource[shaderName] = null;

    this.renderer.removePipeline(shaderName);

    const shader = this.shaderInstance(shaderName);

    this.scene.scenes.forEach((scene) => {
      if (scene.shaderName !== shaderName) {
        return;
      }

      scene.shader = shader;
      scene.camera.clearRenderToTexture();
    });
  }

  disableMainShaders() {
    this.disableShader('main');
  }

  shaderInstantiation(fragShader) {
    try {
      return new Phaser.Class({
        Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,
        initialize: function Shader(game) {
          try {
            Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
              game,
              renderer: game.renderer,
              fragShader,
            });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
          }
        },
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  onSceneInit(key, cb) {
    if (!this._sceneInitCallbacks[key]) {
      this._sceneInitCallbacks[key] = [];
    }

    this._sceneInitCallbacks[key].push(cb);
  }

  sceneDidInit(scene) {
    const {key} = scene.scene;
    if (!this._sceneInitCallbacks[key]) {
      return;
    }

    this._sceneInitCallbacks[key].forEach((cb) => {
      cb(scene);
    });

    delete this._sceneInitCallbacks[key];
  }
}
