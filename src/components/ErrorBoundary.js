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

  // A soft reset would re-render the same tree that just crashed, so go home
  // and reload — that always lands on a working page.
  handleGoHome = () => {
    window.location.hash = '#/';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Widget-level boundaries keep one broken canvas from taking the whole
      // portfolio down with it.
      if (this.props.inline) {
        return (
          <div className="widget-error" role="alert">
            <p className="widget-error__title">{this.props.label || 'This one stopped working.'}</p>
            <p className="widget-error__hint">Pick another from the list above &mdash; the rest still work.</p>
          </div>
        );
      }
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
              <button type="button" className="project-detail__cta project-detail__cta--ghost" onClick={this.handleGoHome}>
                Portfolio home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
