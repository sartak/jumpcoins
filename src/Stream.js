// @flow
import React, { Component } from 'react';
import * as dat from 'dat.gui';
import Engine from './Engine';
import twitchLogo from './assets/public/twitchLogo.png';
import twitterLogo from './assets/public/twitterLogo.png';
import defaultProps from './props';

function Debug() {
  Object.keys(defaultProps).forEach((key) => {
    this[key] = defaultProps[key];
  });
}

export default class Stream extends Component<any> {
  debug = new Debug();

  gui = new dat.GUI({ autoPlace: false });

  constructor(props: any) {
    super(props);

    const { gui, debug } = this;

    const engine = gui.addFolder('Engine');

    engine.add(debug, 'time').listen();
    engine.add(debug, 'frameTime').listen();

    gui.add(debug, 'temp', 0, 100);

    Object.keys(defaultProps).forEach((key) => {
      // eslint-disable-next-line no-underscore-dangle
      if (gui.__controllers.filter(controller => controller.property === key).length) {
        return;
      }

      let foundController = false;
      // eslint-disable-next-line no-underscore-dangle
      Object.keys(gui.__folders).forEach((folderName) => {
        // eslint-disable-next-line no-underscore-dangle
        if (gui.__folders[folderName].__controllers.filter(controller => controller.property === key).length) {
          foundController = true;
        }
      });

      if (foundController) {
        return;
      }

      gui.add(debug, key);
    });
  }

  render() {
    return (
      <div className="stream">
        <Engine debugger={this.debug} />
        <Debugger gui={this.gui} />
      </div>
    );
  }
}

class Debugger extends Component<any> {
  debugRef = null;

  constructor(props: any) {
    super(props);
    this.debugRef = React.createRef();
  }

  componentDidMount() {
    if (this.debugRef && this.debugRef.current) {
      this.debugRef.current.append(this.props.gui.domElement);
    }
  }

  render() {
    return (
      <div className="debugger">
        <ul>
          <li><a target="_blank" rel="noopener noreferrer" href="https://labs.phaser.io/">labs</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://photonstorm.github.io/phaser3-docs/">phaser docs</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://lodash.com/docs/4.17.11">lodash</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://sfbgames.com/chiptone/">chiptone</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://pernyblom.github.io/abundant-music/index.html">abundant</a></li>
          <li><div ref={this.debugRef} id="debug-container" /></li>
        </ul>
      </div>
    );
  }
}

