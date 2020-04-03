import SuperGame from './scaffolding/SuperGame';
import proxyClass from './scaffolding/lib/proxy';

import PlayScene from './play-scene';

const baseConfig = {
};

export default class Game extends SuperGame {
  constructor(options) {
    const config = {
      ...baseConfig,
      ...options,
    };
    super(
      config,
      [PlayScene],
    );
  }

  launch() {
    this.scene.add('play', PlayScene, true, {seed: Date.now()});
  }
}

if (module.hot) {
  if (!window.PlaySceneProxy) {
    window.PlaySceneProxy = proxyClass(PlayScene);
  }
  const proxy = window.PlaySceneProxy;

  module.hot.accept('./play-scene', () => {
    try {
      const Next = require('./play-scene').default;
      window.game.scene.scenes.forEach((scene) => {
        if (scene.constructor.name === Next.name) {
          proxyClass(Next, scene, proxy);
        }
      });
    } catch (e) {
    // eslint-disable-next-line no-console
      console.error(e);
    }
  });
}
