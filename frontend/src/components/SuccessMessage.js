import React, { useState, useEffect } from 'react';

const SuccessMessage = ({ 
  message, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 5000,
  title = 'Success'
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div className="alert alert-success alert-dismissible d-flex align-items-center" role="alert">
      <div className="flex-grow-1">
        <h6 className="alert-heading mb-2">
          <i className="bi bi-check-circle-fill me-2"></i>
          {title}
        </h6>
        <p className="mb-0">{message}</p>
      </div>
      <button 
        type="button" 
        className="btn-close" 
        onClick={handleClose}
        aria-label="Close"
      ></button>
    </div>
  );
};

export default SuccessMessage;
