import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Initialize the React application and render it into the root DOM node
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);