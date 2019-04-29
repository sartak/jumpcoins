// @flow
import React, { Component } from 'react';
import startGame from './game';
import cover from './assets/cover.png';

type State = {
  activated: boolean
};

export default class Engine extends Component<any, State> {
  gameContainerRef = null;

  constructor(props: {}) {
    super(props);
    this.state = { activated: false };
  }

  render() {
    const { activated } = this.state;
    if (activated) {
      return (
        <div
          id="engine"
          ref={(container) => {
            this.gameContainerRef = container;
            startGame(this.props.debugger);
          }}
        />
      );
    }
    return (
      <div style={{ backgroundImage: `url(${cover})` }} className="activate" id="engine" onClick={() => this.activate()}>
        <div className="teaser">
          click to play
          <br />
          Jumpcoins
        </div>
      </div>
    );
  }

  activate() {
    this.setState({ activated: true });
  }
}
