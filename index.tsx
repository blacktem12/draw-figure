import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/styles/default.scss';
import App from './src/App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);