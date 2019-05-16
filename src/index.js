import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import Development from './Development';
import Production from './Production';

const Layout =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? Development
    : Production;

ReactDOM.render(<Layout />, document.getElementById('root'));
