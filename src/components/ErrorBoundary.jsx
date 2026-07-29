import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
          <p className="text-4xl">⚠️</p>
          <h1 className="mt-3 text-lg font-bold text-gray-900">Algo salió mal</h1>
          <p className="mt-2 text-sm text-gray-500">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Volver al inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
