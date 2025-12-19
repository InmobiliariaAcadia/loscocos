
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary class component to catch runtime errors and display a fallback UI.
 */
// Fix: Use React.Component specifically to ensure that inheritance of 'props' and 'state' is correctly resolved by the TypeScript compiler.
export class ErrorBoundary extends React.Component<Props, State> {
  // Fix: Standard constructor ensures that super(props) is called and state is initialized with correct types.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error details to the console for debugging and reporting
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    // Access properties from the current class instance using 'this'. 
    // Fix: Destructure this.state and this.props after ensuring correct inheritance.
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      // Fallback UI to be displayed when a child component throws a runtime error
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">System Error</h1>
            <p className="text-slate-500 text-sm mb-6">
              The application encountered an unexpected error and could not continue.
            </p>
            <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono text-left text-slate-600 overflow-auto max-h-32 mb-6 border border-slate-200">
              {error?.message || "Unknown Error"}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
