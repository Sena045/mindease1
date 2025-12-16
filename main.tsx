import React, { Suspense, lazy, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

console.log("Starting ReliefAnchor Application...");

// Lazy load App to ensure main.tsx renders immediately
const App = lazy(() => import('./App'));

// Fallback Loading Screen
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-brand-50 text-brand-700 font-sans">
    <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
    <p className="font-bold animate-pulse">Initializing ReliefAnchor...</p>
  </div>
);

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

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
        <div className="flex items-center justify-center min-h-screen bg-red-50 p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
            <h2 className="text-2xl font-bold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We couldn't load the application.</p>
            <pre className="bg-gray-100 p-3 rounded text-xs text-left overflow-auto text-red-800 mb-6 max-h-32">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors w-full"
            >
              Reload
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
          <Suspense fallback={<LoadingScreen />}>
            <App />
          </Suspense>
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("React Root Rendered.");
  } catch (e) {
    console.error("Failed to mount React application:", e);
    rootElement.innerHTML = '<div style="padding:20px;text-align:center;color:red">Failed to initialize application. Check console for details.</div>';
  }
} else {
  console.error("CRITICAL: #root element not found in DOM");
}