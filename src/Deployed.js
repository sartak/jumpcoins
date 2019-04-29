// @flow
import React, { Component } from 'react';
import Engine from './Engine';
import twitchLogo from './assets/public/twitchLogo.png';
import twitterLogo from './assets/public/twitterLogo.png';

export default class Deployed extends Component<{}> {
  render() {
    return (
      <div className="deployed">
        <Engine />
        <div className="game-info">
          <GameMetadata />
        </div>
      </div>
    );
  }
}

class GameMetadata extends Component<{}> {
  render() {
    return (
      <div className="game-metadata">
        <h1>Jumpcoins</h1>
        <h3>
          by
          <br />
          <a href="https://sartak.org">@sartak</a>
          <br />
          <a href="https://twitter.com/sartak">
            <img src={twitterLogo} alt="@sartak on Twitter" />
          </a>
          <a href="https://twitch.tv/sartak">
            <img src={twitchLogo} alt="sartak on Twitch" />
          </a>
        </h3>
        <p>
          created solo in 48 hours as part of
          <br />
          the <strong>Ludum Dare 44</strong> compo
        </p>
        <p>
          <a href="https://ldjam.com/events/ludum-dare/44/jumpcoins">
            ldjam.com/events/ludum-dare/44/jumpcoins
          </a>
        </p>
        <p>
          for the theme
          <br />
          <em>"Your life is currency"</em>
        </p>
        <p>
          code at
          <br />
          <a className="url" href="https://github.com/sartak/ld44">
            github.com/sartak/ld44
          </a>
        </p>
      </div>
    );
  }
}
