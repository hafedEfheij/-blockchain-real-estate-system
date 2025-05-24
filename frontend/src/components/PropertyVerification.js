import React, { useState, useEffect } from 'react';
import { getProperty } from '../utils/blockchain';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const PropertyVerification = ({ 
  signer, 
  propertyId, 
  onVerificationComplete,
  isVerifier = false 
}) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [verificationData, setVerificationData] = useState({
    inspectionDate: '',
    inspectorName: '',
    inspectorLicense: '',
    verificationNotes: '',
    documentsChecked: [],
    complianceChecks: {
      titleDeed: false,
      surveyReport: false,
      buildingPermits: false,
      taxClearance: false,
      environmentalClearance: false,
      utilityConnections: false
    }
  });

  useEffect(() => {
    if (propertyId && signer) {
      loadPropertyData();
    }
  }, [propertyId, signer]);

  const loadPropertyData = async () => {
    try {
      setLoading(true);
      setError('');
      const propertyData = await getProperty(signer, propertyId);
      setProperty(propertyData);
    } catch (error) {
      console.error('Error loading property:', error);
      setError('Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleComplianceChange = (e) => {
    const { name, checked } = e.target;
    setVerificationData(prev => ({
      ...prev,
      complianceChecks: {
        ...prev.complianceChecks,
        [name]: checked
      }
    }));
  };

  const handleDocumentCheck = (documentHash, checked) => {
    setVerificationData(prev => ({
      ...prev,
      documentsChecked: checked 
        ? [...prev.documentsChecked, documentHash]
        : prev.documentsChecked.filter(hash => hash !== documentHash)
    }));
  };

  const handleVerifyProperty = async () => {
    try {
      setVerifying(true);
      setError('');

      // Validate verification data
      if (!verificationData.inspectorName.trim()) {
        throw new Error('Inspector name is required');
      }

      if (!verificationData.inspectorLicense.trim()) {
        throw new Error('Inspector license is required');
      }

      // Check if all compliance checks are completed
      const allChecksCompleted = Object.values(verificationData.complianceChecks)
        .every(check => check === true);

      if (!allChecksCompleted) {
        const confirmed = window.confirm(
          'Not all compliance checks are marked as complete. Are you sure you want to proceed with verification?'
        );
        if (!confirmed) {
          setVerifying(false);
          return;
        }
      }

      // In a real implementation, this would call the smart contract
      // For demo purposes, we'll simulate the verification process
      console.log('Verifying property with data:', verificationData);
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (onVerificationComplete) {
        onVerificationComplete(propertyId, verificationData);
      }

      alert('Property verified successfully!');
      
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.message || 'Failed to verify property');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading property data..." />;
  }

  if (error && !property) {
    return <ErrorMessage error={error} onRetry={loadPropertyData} />;
  }

  if (!property) {
    return (
      <div className="alert alert-warning">
        Property not found or invalid property ID.
      </div>
    );
  }

  if (property.verified) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <i className="bi bi-check-circle-fill text-success display-4"></i>
          <h4 className="mt-3">Property Already Verified</h4>
          <p className="text-muted">
            This property has already been verified and approved.
          </p>
        </div>
      </div>
    );
  }

  if (!isVerifier) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <i className="bi bi-shield-exclamation text-warning display-4"></i>
          <h4 className="mt-3">Verification Required</h4>
          <p className="text-muted">
            This property requires verification by an authorized verifier.
          </p>
          <div className="alert alert-info mt-3">
            <strong>Note:</strong> Only authorized verifiers can verify properties.
            Contact the system administrator to become a verifier.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-shield-check me-2"></i>
          Property Verification
        </h5>
      </div>
      <div className="card-body">
        {/* Property Information */}
        <div className="row mb-4">
          <div className="col-12">
            <h6>Property Information</h6>
            <div className="bg-light p-3 rounded">
              <div className="row">
                <div className="col-md-6">
                  <strong>Location:</strong> {property.location}
                </div>
                <div className="col-md-6">
                  <strong>Type:</strong> {property.propertyType}
                </div>
                <div className="col-md-6">
                  <strong>Area:</strong> {property.area} sq meters
                </div>
                <div className="col-md-6">
                  <strong>Price:</strong> {property.price} ETH
                </div>
                <div className="col-md-6">
                  <strong>Owner:</strong> {property.owner}
                </div>
                <div className="col-md-6">
                  <strong>Status:</strong> 
                  <span className={`badge ms-2 ${property.verified ? 'bg-success' : 'bg-warning'}`}>
                    {property.verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inspector Information */}
        <div className="row mb-4">
          <div className="col-12">
            <h6>Inspector Information</h6>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="inspectorName" className="form-label">Inspector Name *</label>
              <input
                type="text"
                className="form-control"
                id="inspectorName"
                name="inspectorName"
                value={verificationData.inspectorName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="inspectorLicense" className="form-label">License Number *</label>
              <input
                type="text"
                className="form-control"
                id="inspectorLicense"
                name="inspectorLicense"
                value={verificationData.inspectorLicense}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="inspectionDate" className="form-label">Inspection Date</label>
              <input
                type="date"
                className="form-control"
                id="inspectionDate"
                name="inspectionDate"
                value={verificationData.inspectionDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Compliance Checks */}
        <div className="row mb-4">
          <div className="col-12">
            <h6>Compliance Checks</h6>
            <div className="row">
              {Object.entries(verificationData.complianceChecks).map(([key, checked]) => (
                <div key={key} className="col-md-6 mb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={key}
                      name={key}
                      checked={checked}
                      onChange={handleComplianceChange}
                    />
                    <label className="form-check-label" htmlFor={key}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Verification */}
        {property.documents && property.documents.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <h6>Document Verification</h6>
              <div className="list-group">
                {property.documents.map((doc, index) => (
                  <div key={index} className="list-group-item">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`doc-${index}`}
                        checked={verificationData.documentsChecked.includes(doc)}
                        onChange={(e) => handleDocumentCheck(doc, e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor={`doc-${index}`}>
                        <strong>Document {index + 1}</strong>
                        <br />
                        <small className="text-muted">
                          <code>{doc}</code>
                        </small>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verification Notes */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="mb-3">
              <label htmlFor="verificationNotes" className="form-label">Verification Notes</label>
              <textarea
                className="form-control"
                id="verificationNotes"
                name="verificationNotes"
                rows="4"
                value={verificationData.verificationNotes}
                onChange={handleInputChange}
                placeholder="Add any additional notes about the verification process..."
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage error={error} />
        )}

        {/* Action Buttons */}
        <div className="row">
          <div className="col-12">
            <button
              className="btn btn-success me-2"
              onClick={handleVerifyProperty}
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check me-2"></i>
                  Verify Property
                </>
              )}
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => window.history.back()}
              disabled={verifying}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyVerification;
