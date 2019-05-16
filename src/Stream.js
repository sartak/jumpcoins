// @flow
import React, { Component } from 'react';
import * as dat from 'dat.gui';
import Engine from './Engine';
import twitchLogo from './assets/public/twitchLogo.png';
import twitterLogo from './assets/public/twitterLogo.png';
import { props as defaultProps } from './game';

function Debug() {
  Object.keys(defaultProps).forEach((key) => {
    this[key] = defaultProps[key][0];
  });
}

const sentenceCase = name => name.split(/[-_ ]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

export default class Stream extends Component<any> {
  debug = new Debug();

  gui = new dat.GUI({ autoPlace: false, width: 400 });

  constructor(props: any) {
    super(props);

    const { gui, debug } = this;

    const folders = {};

    Object.keys(defaultProps).forEach((key) => {
      const sections = key.split('.');
      const [value, ...options] = defaultProps[key];

      let folderKey = '';
      let folder = gui;
      while (sections.length > 1) {
        const section = sections.shift();
        folderKey += `.${section}`;

        if (!folders[folderKey]) {
          folders[folderKey] = folder.addFolder(sentenceCase(section));
        }

        folder = folders[folderKey];
      }

      const propName = sections[0];

      let controller;
      if (options.length >= 1 && options[0] === null) {
        controller = folder.add(debug, key).listen();
      } else {
        let callback;
        if (options.length >= 1 && typeof options[options.length-1] === 'function') {
          callback = options.pop();
        }

        if (key.match(/color/i)) {
          controller = folder.addColor(debug, key, ...options);
        } else {
          controller = folder.add(debug, key, ...options);
        }

        if (callback) {
          controller.onChange(callback);
        }
      }
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
          <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/photonstorm/phaser/tree/v3.15.1">phaser code</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://lodash.com/docs/4.17.11">lodash</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://sfbgames.com/chiptone/">chiptone</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://pernyblom.github.io/abundant-music/index.html">abundant</a></li>
        </ul>
        <div ref={this.debugRef} id="debug-container" />
      </div>
    );
  }
}

