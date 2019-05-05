// @flow
import React, { Component } from 'react';
import startGame, { changeVolume } from './game';
import cover from './assets/cover.png';

const VolumeName = 'jumpcoins_volume';

type State = {
  activated: boolean,
  volume: number,
  scale: ?number,
};

export default class Engine extends Component<any, State> {
  gameContainerRef = null;

  moveTimeout: ?TimeoutID = null;

  resizeHandler = null;

  moveHandler = null;

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
      scale: null,
    };
  }

  render() {
    const { activated, scale } = this.state;

    if (activated) {
      return (
        <div id="engine-container">
          <div
            id="engine"
            style={scale ? { transform: `scale(${scale})` } : {}}
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
            <div className="fullscreen">
              {scale ? (
                <div className="button" onClick={() => this.exitFullscreen()}>
                  <div className="label exit">x</div>
                </div>
              ) : (
                <div className="button" onClick={() => this.enterFullscreen()}>
                  <div className="label enter">⇆</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ backgroundImage: `url(${cover})` }} className="activate natural" id="engine-container" onClick={() => this.activate()} />
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

  enterFullscreen() {
    const body = document.querySelector('body');
    const engine = document.querySelector('#engine');
    if (body && engine) {
      body.classList.add('scaled');
      body.classList.remove('natural');

      engine.style.overflow = '';

      this.resizeHandler = () => {
        const scale = 0.95 * Math.min(window.innerWidth / 800, window.innerHeight / 600);
        this.setState({ scale });
      };
      this.resizeHandler();

      this.moveHandler = () => {
        if (this.moveTimeout) {
          clearTimeout(this.moveTimeout);
        } else {
          body.classList.add('mouseMoved');
        }

        this.moveTimeout = setTimeout(() => {
          body.classList.remove('mouseMoved');
          this.moveTimeout = null;
        }, 3000);
      };

      this.moveHandler();

      window.addEventListener('resize', this.resizeHandler);
      window.addEventListener('mousemove', this.moveHandler);
    }
  }

  exitFullscreen() {
    const body = document.querySelector('body');
    const engine = document.querySelector('#engine');
    if (body && engine) {
      body.classList.add('natural');
      body.classList.remove('scaled');
      body.classList.remove('mouseMoved');

      engine.style.overflow = 'hidden';

      this.setState({ scale: null });

      if (this.moveTimeout) {
        clearTimeout(this.moveTimeout);
        this.moveTimeout = null;
      }

      window.removeEventListener('resize', this.resizeHandler);
      window.removeEventListener('mousemove', this.moveHandler);
    }
  }
}
