"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Oops! Quelque chose s&apos;est mal passé
          </h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
