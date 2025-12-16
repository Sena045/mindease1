import React, { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
// STATIC IMPORT: Ensures Vite bundles this immediately. 
// Never use lazy() for the root App component in this setup.
import App from './App';
import './index.css';

console.log("Starting ReliefAnchor Application...");

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// 6. Bonus: Professional Error Boundary
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-rose-50 p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-rose-100">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-6 text-sm">
              We couldn't load the application. This is likely a temporary connection issue.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors w-full shadow-lg shadow-rose-200"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("Application mounted successfully.");
  } catch (e) {
    console.error("Failed to mount React application:", e);
    // Absolute fallback if React fails completely
    rootElement.innerHTML = `
      <div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#fff1f2;color:#be123c;font-family:sans-serif;flex-direction:column;padding:20px;text-align:center;">
        <h2 style="margin-bottom:10px;">Startup Error</h2>
        <p>Please check the console.</p>
        <button onclick="window.location.reload()" style="background:#be123c;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;margin-top:20px;font-weight:bold;">Try Again</button>
      </div>
    `;
  }
} else {
  console.error("CRITICAL: #root element not found in DOM");
}