import React from 'react';
import { 
  FaExclamationTriangle, 
  FaRefresh, 
  FaHome, 
  FaBug,
  FaEnvelope
} from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and any error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In a real app, you would send this to your error reporting service
    console.log('Error Report:', errorReport);
    
    // For now, we'll just copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error details copied to clipboard. Please send this to support.');
      })
      .catch(() => {
        alert('Failed to copy error details. Please take a screenshot and contact support.');
      });
  };

  toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <FaExclamationTriangle className="h-8 w-8 text-red-600" />
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>

              {/* Error Message */}
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaRefresh className="mr-2" />
                  Try Again
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <FaHome className="mr-2" />
                  Go to Homepage
                </button>

                <button
                  onClick={this.handleReportError}
                  className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaEnvelope className="mr-2" />
                  Report Error
                </button>
              </div>

              {/* Error Details Toggle */}
              {this.state.error && (
                <div className="mt-6">
                  <button
                    onClick={this.toggleDetails}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center w-full"
                  >
                    <FaBug className="mr-2" />
                    {this.state.showDetails ? 'Hide' : 'Show'} Technical Details
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                      <h3 className="font-medium text-gray-900 mb-2">Error Details:</h3>
                      <div className="text-xs text-gray-600 space-y-2">
                        <div>
                          <strong>Message:</strong>
                          <p className="break-words">{this.state.error.message}</p>
                        </div>
                        {this.state.error.stack && (
                          <div>
                            <strong>Stack Trace:</strong>
                            <pre className="whitespace-pre-wrap break-words mt-1">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                        {this.state.errorInfo?.componentStack && (
                          <div>
                            <strong>Component Stack:</strong>
                            <pre className="whitespace-pre-wrap break-words mt-1">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Help Text */}
              <div className="mt-6 text-xs text-gray-500">
                <p>If this problem persists, please contact our support team.</p>
                <p className="mt-1">Error ID: {Date.now()}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for functional components
export const withErrorBoundary = (Component) => {
  return class extends ErrorBoundary {
    render() {
      if (this.state.hasError) {
        return super.render();
      }
      return <Component {...this.props} />;
    }
  };
};

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  return (error) => {
    console.error('Error triggered by useErrorHandler:', error);
    throw error;
  };
};

export default ErrorBoundary;
