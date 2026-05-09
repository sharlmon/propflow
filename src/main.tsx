import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      {/* <div className="p-10 bg-blue-50 text-blue-800 font-bold text-2xl">
        React is working! The crashing issue is inside App.tsx or its imports.
      </div> */}
    </ErrorBoundary>
  </React.StrictMode>,
);
