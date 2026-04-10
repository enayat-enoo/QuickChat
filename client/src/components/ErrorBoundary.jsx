import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-6">⚠️</div>
            <h1 className="text-white text-xl font-semibold mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              An unexpected error occurred. Try refreshing the page — if it
              keeps happening, please reach out.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-black px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
            >
              Refresh page
            </button>
            {process.env.NODE_ENV === "development" && (
              <pre className="mt-6 text-left text-xs text-red-400 bg-[#1a1f29] p-4 rounded-lg overflow-auto max-h-40">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}