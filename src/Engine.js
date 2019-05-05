// @flow
import React, { Component } from 'react';
import startGame, { changeVolume } from './game';
import cover from './assets/cover.png';

const VolumeName = 'jumpcoins_volume';

type State = {
  activated: boolean,
  volume: number,
};

export default class Engine extends Component<any, State> {
  gameContainerRef = null;

  constructor(props: {}) {
    super(props);

    let volume = 0.75;
    try {
      const storedVolume = localStorage.getItem(VolumeName);
      if (storedVolume !== null && storedVolume !== undefined) {
        volume = Number(storedVolume);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }

    this.state = {
      activated: false,
      volume,
    };
  }

  render() {
    const { activated } = this.state;
    if (activated) {
      return (
        <div id="engine-container">
          <div
            id="engine"
            ref={(container) => {
              if (this.gameContainerRef) {
                return;
              }

              this.gameContainerRef = container;
              startGame(this.props.debugger, this.state.volume);
            }}
          />
          <div id="controls">
            <div className="volume">
              <span style={{ fontSize: 20, transform: `scale(${0.5 + this.state.volume / 2})` }}>♫</span>
              &nbsp;&nbsp;
              <input type="range" min="0" max="100" value={this.state.volume * 100} onChange={e => this.setVolume(e.target.value / 100)} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ backgroundImage: `url(${cover})` }} className="activate" id="engine-container" onClick={() => this.activate()} />
    );
  }

  activate() {
    this.setState({ activated: true });
  }

  setVolume(volume: number) {
    this.setState({ volume });

    changeVolume(volume);

    try {
      localStorage.setItem(VolumeName, String(volume));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}
