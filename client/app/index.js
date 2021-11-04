import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

// ---------- Style Import ---------- //
import './style.css';

render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById("app")
);

if (module && module.hot && module.hot.accept) {
  module.hot.accept()
}