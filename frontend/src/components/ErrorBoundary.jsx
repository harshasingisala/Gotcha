import React from "react";
import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-page p-6">
          <div className="max-w-md rounded-xl border border-surface-strong bg-white p-6 shadow-soft">
            <h1 className="text-xl font-black text-navy">Something went wrong</h1>
            <p className="mt-2 text-sm leading-6 text-muted">{this.state.error.message}</p>
            <button className="mt-4 min-h-12 rounded-lg bg-navy px-5 font-black text-white" onClick={() => location.reload()}>Retry</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
