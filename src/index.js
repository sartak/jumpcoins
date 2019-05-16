import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import Development from './Development';
import Deployed from './Deployed';

const Layout =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? Development
    : Deployed;

ReactDOM.render(<Layout />, document.getElementById('root'));
