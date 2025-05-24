import React from 'react';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  title = 'Error', 
  showRetry = true,
  variant = 'danger' 
}) => {
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  };

  return (
    <div className={`alert alert-${variant} d-flex align-items-center`} role="alert">
      <div className="flex-grow-1">
        <h6 className="alert-heading mb-2">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {title}
        </h6>
        <p className="mb-0">{getErrorMessage(error)}</p>
      </div>
      {showRetry && onRetry && (
        <button 
          className="btn btn-outline-danger btn-sm ms-3"
          onClick={onRetry}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
