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
        <div
          id="engine"
          ref={(container) => {
            this.gameContainerRef = container;
            startGame(this.props.debugger, this.state.volume);
          }}
        />
      );
    }

    return (
      <div style={{ backgroundImage: `url(${cover})` }} className="activate" id="engine" onClick={() => this.activate()} />
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
