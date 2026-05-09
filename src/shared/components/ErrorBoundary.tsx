import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PropFlow render failure', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <section className="max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-amber-300">System Recovery</p>
            <h1 className="mt-3 text-3xl font-black">PropFlow hit an unexpected state.</h1>
            <p className="mt-4 text-sm leading-6 text-slate-200">
              The app shell is protected, so this failure is contained. Refresh the page and report the action
              that caused it so we can trace the module cleanly.
            </p>
            <pre className="mt-6 max-h-40 overflow-auto rounded-2xl bg-black/30 p-4 text-xs text-slate-300">
              {this.state.error?.message}
            </pre>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
