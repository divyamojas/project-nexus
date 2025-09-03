// src/components/providers/ErrorBoundary.jsx

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { logError } from '@/utilities/logger';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logError('React render error boundary caught error', error, { errorInfo });
  }

  handleReload = () => {
    try {
      window.location.reload();
    } catch (_) {}
  };

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (!hasError) return children;
    return (
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: 520, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            An unexpected error occurred. The event has been logged.
          </Typography>
        </Box>
        <Button onClick={this.handleReload} variant="contained">
          Reload page
        </Button>
      </Box>
    );
  }
}

export default ErrorBoundary;
