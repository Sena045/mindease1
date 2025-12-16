import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Immediate execution
console.log("ReliefAnchor: Main script running");

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    // Render immediately. ErrorBoundary inside App will catch downstream issues.
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("ReliefAnchor: React mounted");
  } catch (err) {
    console.error("ReliefAnchor: Fatal Mount Error", err);
    rootElement.innerText = "Application failed to start. Please reload.";
  }
} else {
  console.error("ReliefAnchor: No root element found");
}