'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught rendering error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-8 text-center">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl max-w-md w-full">
            <span className="text-5xl block mb-4">⚠️</span>
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Something Went Wrong</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              A runtime rendering error occurred in the browser. Please reload the page or click below to return home.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#2D5016] hover:bg-[#203a10] text-white py-2.5 rounded-lg font-bold text-sm shadow transition cursor-pointer"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold text-sm border border-gray-300 transition text-center block"
              >
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
