import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated for React 18
import './index.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container); // Updated for React 18
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);