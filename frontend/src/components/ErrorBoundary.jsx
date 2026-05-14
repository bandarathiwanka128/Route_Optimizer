import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error: error.message || 'Unknown error' };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="map-placeholder error">
          <strong>Map failed to load</strong>
          <p>{this.state.error}</p>
          <p style={{ fontSize: '0.8rem', marginTop: 8 }}>
            Refresh the page after restarting the frontend dev server.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
