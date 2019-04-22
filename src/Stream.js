// @flow
import React, { Component } from 'react';
import * as dat from 'dat.gui';
import Engine from './Engine';
import twitchLogo from './assets/public/twitchLogo.png';
import twitterLogo from './assets/public/twitterLogo.png';

function Debug() {
}

export default class Stream extends Component<any> {
  debugger = new Debug();

  gui = new dat.GUI({ autoPlace: false });

  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="stream">
        <Engine debugger={this.debugger} />
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
          <li><a target="_blank" rel="noopener noreferrer" href="https://photonstorm.github.io/phaser3-docs/">docs</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://sfbgames.com/chiptone/">chiptone</a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://pernyblom.github.io/abundant-music/index.html">abundant</a></li>
          <li><div ref={this.debugRef} id="debug-container" /></li>
        </ul>
      </div>
    );
  }
}

