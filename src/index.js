import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import Stream from './Stream';
import Deployed from './Deployed';

const Layout =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? Stream
    : Deployed;

ReactDOM.render(<Layout />, document.getElementById('root'));
