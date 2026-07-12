import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: (error && error.message) || 'Something went wrong' };
  }

  componentDidCatch(error, info) {
    if (typeof window !== 'undefined' && window.console) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-boundary__inner">
            <p className="error-boundary__eyebrow">Something broke</p>
            <h1 className="error-boundary__title">A component crashed.</h1>
            <p className="error-boundary__lede">
              Refresh to try again, or head back to the portfolio.
            </p>
            <div className="error-boundary__actions">
              <button type="button" className="project-detail__cta project-detail__cta--primary" onClick={() => window.location.reload()}>
                Reload
              </button>
              <a href="#/" className="project-detail__cta project-detail__cta--ghost" onClick={this.handleReset}>
                Portfolio home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
