/**
 * main.jsx — Application entry point.
 *
 * Mounts the React 19 application into the DOM using createRoot.
 * Wraps the entire app in StrictMode for development warnings
 * about unsafe lifecycle methods, legacy APIs, and side effects.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css';

// Get the root DOM element (defined in index.html)
const rootElement = document.getElementById('root');

// Create the React 19 root and render the application
// StrictMode enables additional development-only checks:
// - Warns about deprecated lifecycle methods
// - Detects unexpected side effects (double-invokes renders in dev)
// - Validates legacy API usage
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
