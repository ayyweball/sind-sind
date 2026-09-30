import React from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an analytical rendering exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleNavigate = (targetPath = '/app') => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = targetPath;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fcfbf8] text-[#141310] flex flex-col justify-between font-sans selection:bg-[#c5301a] selection:text-white">
          <header className="border-b border-[#ded8cb] bg-[#fcfbf8] px-6 sm:px-10 h-16 flex items-center justify-between">
            <button
              onClick={() => this.handleNavigate('/')}
              className="font-serif text-xl font-semibold tracking-tight text-[#141310] hover:text-[#c5301a] text-left"
            >
              SIND &amp; SIND
            </button>
            <div className="font-mono text-xs text-[#c5301a] uppercase tracking-wider">
              Diagnostic Recovery
            </div>
          </header>

          <main className="max-w-3xl mx-auto px-6 py-16 w-full space-y-8">
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
                Runtime Execution Notice
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
                An analytical rendering exception occurred.
              </h1>
              <p className="text-sm text-[#45423b] leading-relaxed">
                The operating console encountered an unexpected data evaluation or state condition on this route.
                You may return to the command overview or inspect the Data Hub to verify connection telemetry.
              </p>
            </div>

            {this.state.error && (
              <div className="border border-[#ded8cb] bg-[#f4f0e6]/40 p-4 font-mono text-xs text-[#6e6a60] space-y-2 overflow-x-auto">
                <div className="font-semibold text-[#c5301a]">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[11px] text-[#8e8a80] whitespace-pre-wrap overflow-x-auto max-h-48">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => this.handleNavigate('/app')}
                className="px-5 py-2.5 bg-[#141310] text-[#fcfbf8] text-xs font-mono tracking-wider uppercase hover:bg-[#c5301a] transition-colors"
              >
                Return to Overview &amp; Reload
              </button>
              <button
                type="button"
                onClick={() => this.handleNavigate('/app/data')}
                className="px-5 py-2.5 border border-[#ded8cb] text-[#141310] text-xs font-mono tracking-wider uppercase hover:border-[#141310] hover:text-[#c5301a] transition-colors cursor-pointer"
              >
                Inspect Data Hub →
              </button>
            </div>
          </main>

          <footer className="border-t border-[#ded8cb] bg-[#fcfbf8] px-6 sm:px-10 py-6 text-xs font-mono text-[#6e6a60]">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
              <span>SIND &amp; SIND OPERATING INTELLIGENCE</span>
              <span>ISOLATED ERROR BOUNDARY</span>
            </div>
          </footer>
        </div>
      );
    }

    return this.props.children;
  }
}
