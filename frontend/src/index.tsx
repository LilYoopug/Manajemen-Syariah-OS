import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';

// Ekspos React ke global agar library UMD (seperti Recharts) bisa menemukannya
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
