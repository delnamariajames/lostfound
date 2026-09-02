import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, RotateCcw } from 'lucide-react';
import { safeStorage } from '../utils/safeStorage.ts';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error in Campus Lost & Found:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAll = () => {
    try {
      safeStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-md text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Campus Lost &amp; Found Portal</h2>
              <p className="text-xs text-slate-500">
                A temporary rendering issue occurred. You can easily reload or reset to sample data.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-100 rounded-lg text-left text-[11px] font-mono text-slate-700 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <RefreshCw size={14} />
                Reload Portal
              </button>

              <button
                onClick={this.handleResetAll}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} />
                Reset Data Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
