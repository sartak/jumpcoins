// @flow
import React, { Component } from 'react';
import Engine from './Engine';

export default class Deployed extends Component<{}> {
  render() {
    return (
      <div className="deployed">
        <Engine />
      </div>
    );
  }
}

