import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'spinner-border-sm',
    medium: '',
    large: 'spinner-border-lg'
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && (
        <p className="mt-3 text-muted">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
