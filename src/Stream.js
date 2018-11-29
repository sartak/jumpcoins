// @flow
import React, { Component } from "react";
import Engine from "./Engine";
import twitchLogo from "./assets/public/twitchLogo.png";
import twitterLogo from "./assets/public/twitterLogo.png";

export default class Stream extends Component<{}> {
  render() {
    return (
      <div className="stream">
        <StreamMetadata />
        <Engine />
      </div>
    );
  }
}

class StreamMetadata extends Component<{}> {
  render() {
    return (
      <div className="stream-metadata">
        <p>
          play now at:
          <br />
          <span className="url">LD43.sartak.org</span>
        </p>
        <p>
          @sartak
          <img src={twitterLogo} alt="@sartak on Twitter" />
          <img src={twitchLogo} alt="sartak on Twitch" />
        </p>
        <p>
          code at:
          <br />
          <span className="url">github.com/sartak/LD43</span>
        </p>
      </div>
    );
  }
}
