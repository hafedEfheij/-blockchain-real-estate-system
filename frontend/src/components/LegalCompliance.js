import React, { useState, useEffect } from 'react';
import { formatAddress, timeAgo } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const LegalCompliance = ({ userAddress, properties = [] }) => {
  const [complianceData, setComplianceData] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newDocument, setNewDocument] = useState({
    propertyId: '',
    documentType: 'deed',
    title: '',
    description: '',
    expiryDate: '',
    file: null
  });

  useEffect(() => {
    loadComplianceData();
  }, [userAddress]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock compliance data
      const mockCompliance = [
        {
          id: '1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          complianceScore: 85,
          lastAudit: new Date(Date.now() - 86400000 * 30),
          nextAudit: new Date(Date.now() + 86400000 * 335),
          issues: [
            { type: 'warning', description: 'Fire safety certificate expires in 60 days', severity: 'medium' },
            { type: 'info', description: 'Annual building inspection due in 90 days', severity: 'low' }
          ],
          certificates: ['Fire Safety', 'Building Permit', 'Occupancy Certificate'],
          missingDocuments: ['Environmental Impact Assessment']
        },
        {
          id: '2',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          complianceScore: 92,
          lastAudit: new Date(Date.now() - 86400000 * 15),
          nextAudit: new Date(Date.now() + 86400000 * 350),
          issues: [],
          certificates: ['Fire Safety', 'Building Permit', 'Occupancy Certificate', 'Environmental Clearance'],
          missingDocuments: []
        }
      ];

      // Mock legal documents
      const mockDocuments = [
        {
          id: 'doc1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          type: 'deed',
          title: 'Property Deed',
          description: 'Official property ownership deed',
          uploadedAt: new Date(Date.now() - 86400000 * 100),
          expiryDate: null,
          status: 'valid',
          ipfsHash: 'QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          uploadedBy: userAddress,
          verified: true
        },
        {
          id: 'doc2',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          type: 'fire-safety',
          title: 'Fire Safety Certificate',
          description: 'Annual fire safety inspection certificate',
          uploadedAt: new Date(Date.now() - 86400000 * 300),
          expiryDate: new Date(Date.now() + 86400000 * 60),
          status: 'expiring-soon',
          ipfsHash: 'QmYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
          uploadedBy: userAddress,
          verified: true
        },
        {
          id: 'doc3',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          type: 'building-permit',
          title: 'Building Permit',
          description: 'Construction and renovation permit',
          uploadedAt: new Date(Date.now() - 86400000 * 50),
          expiryDate: new Date(Date.now() + 86400000 * 1095),
          status: 'valid',
          ipfsHash: 'QmZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
          uploadedBy: userAddress,
          verified: false
        }
      ];

      // Mock regulations
      const mockRegulations = [
        {
          id: 'reg1',
          jurisdiction: 'New York City',
          category: 'Building Safety',
          title: 'Fire Safety Compliance',
          description: 'All commercial buildings must maintain valid fire safety certificates',
          requirements: [
            'Annual fire safety inspection',
            'Working smoke detectors on all floors',
            'Clear emergency exits',
            'Fire extinguisher maintenance'
          ],
          penalties: 'Fines up to $10,000 for non-compliance',
          lastUpdated: new Date(Date.now() - 86400000 * 180),
          effectiveDate: new Date(Date.now() - 86400000 * 365),
          applicableProperties: ['1']
        },
        {
          id: 'reg2',
          jurisdiction: 'California',
          category: 'Environmental',
          title: 'Environmental Impact Assessment',
          description: 'Properties in certain zones require environmental impact assessments',
          requirements: [
            'Soil contamination testing',
            'Air quality assessment',
            'Water quality testing',
            'Noise level evaluation'
          ],
          penalties: 'Project suspension and fines up to $50,000',
          lastUpdated: new Date(Date.now() - 86400000 * 90),
          effectiveDate: new Date(Date.now() - 86400000 * 730),
          applicableProperties: ['2']
        }
      ];

      setComplianceData(mockCompliance);
      setDocuments(mockDocuments);
      setRegulations(mockRegulations);
      
    } catch (error) {
      console.error('Error loading compliance data:', error);
      setError('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      setError('');

      // Validate form
      if (!newDocument.propertyId || !newDocument.title || !newDocument.file) {
        throw new Error('Please fill in all required fields and select a file');
      }

      // Simulate IPFS upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const document = {
        id: Date.now().toString(),
        propertyId: newDocument.propertyId,
        propertyLocation: properties.find(p => p.id === newDocument.propertyId)?.location || 'Unknown Location',
        type: newDocument.documentType,
        title: newDocument.title,
        description: newDocument.description,
        uploadedAt: new Date(),
        expiryDate: newDocument.expiryDate ? new Date(newDocument.expiryDate) : null,
        status: 'valid',
        ipfsHash: `Qm${Math.random().toString(36).substr(2, 44)}`,
        uploadedBy: userAddress,
        verified: false
      };

      setDocuments(prev => [document, ...prev]);
      setShowUploadForm(false);
      setNewDocument({
        propertyId: '',
        documentType: 'deed',
        title: '',
        description: '',
        expiryDate: '',
        file: null
      });

      alert('Document uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getComplianceScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  const getDocumentStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'success';
      case 'expiring-soon': return 'warning';
      case 'expired': return 'danger';
      case 'pending': return 'info';
      default: return 'secondary';
    }
  };

  const ComplianceOverviewCard = ({ compliance }) => (
    <div className="card mb-4">
      <div className="card-header">
        <h6 className="mb-0">{compliance.propertyLocation}</h6>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="d-flex align-items-center mb-3">
              <div className="me-3">
                <div className={`badge bg-${getComplianceScoreColor(compliance.complianceScore)} fs-6`}>
                  {compliance.complianceScore}%
                </div>
              </div>
              <div>
                <h6 className="mb-0">Compliance Score</h6>
                <small className="text-muted">Last audit: {timeAgo(compliance.lastAudit)}</small>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <h6 className="mb-1">Next Audit</h6>
              <small className="text-muted">{compliance.nextAudit.toLocaleDateString()}</small>
            </div>
          </div>
        </div>

        {compliance.issues.length > 0 && (
          <div className="mb-3">
            <h6>Active Issues ({compliance.issues.length})</h6>
            {compliance.issues.map((issue, index) => (
              <div key={index} className={`alert alert-${issue.severity === 'high' ? 'danger' : issue.severity === 'medium' ? 'warning' : 'info'} py-2`}>
                <small>
                  <i className={`bi bi-${issue.type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2`}></i>
                  {issue.description}
                </small>
              </div>
            ))}
          </div>
        )}

        <div className="row">
          <div className="col-md-6">
            <h6>Valid Certificates ({compliance.certificates.length})</h6>
            <div className="d-flex flex-wrap gap-1">
              {compliance.certificates.map(cert => (
                <span key={cert} className="badge bg-success">{cert}</span>
              ))}
            </div>
          </div>
          <div className="col-md-6">
            {compliance.missingDocuments.length > 0 && (
              <>
                <h6>Missing Documents ({compliance.missingDocuments.length})</h6>
                <div className="d-flex flex-wrap gap-1">
                  {compliance.missingDocuments.map(doc => (
                    <span key={doc} className="badge bg-danger">{doc}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const DocumentCard = ({ document }) => {
    const daysUntilExpiry = document.expiryDate ? 
      Math.ceil((document.expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return (
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="card-title">
                {document.title}
                {document.verified && (
                  <i className="bi bi-patch-check-fill text-primary ms-2"></i>
                )}
              </h6>
              <p className="card-text">
                <small className="text-muted">{document.propertyLocation}</small>
              </p>
              <div className="mb-2">
                <span className="badge bg-secondary me-2">
                  {document.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className={`badge bg-${getDocumentStatusColor(document.status)}`}>
                  {document.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">
                    <strong>Uploaded:</strong> {timeAgo(document.uploadedAt)}
                  </small>
                </div>
                {document.expiryDate && (
                  <div className="col-md-6">
                    <small className={`text-${daysUntilExpiry < 30 ? 'danger' : daysUntilExpiry < 90 ? 'warning' : 'muted'}`}>
                      <strong>Expires:</strong> {document.expiryDate.toLocaleDateString()}
                      {daysUntilExpiry !== null && (
                        <> ({daysUntilExpiry > 0 ? `in ${daysUntilExpiry} days` : `${Math.abs(daysUntilExpiry)} days ago`})</>
                      )}
                    </small>
                  </div>
                )}
              </div>
              {document.description && (
                <p className="card-text mt-2">
                  <small>{document.description}</small>
                </p>
              )}
            </div>
            <div className="text-end">
              <button className="btn btn-outline-primary btn-sm me-2">
                <i className="bi bi-eye me-1"></i>
                View
              </button>
              <button className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-download me-1"></i>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RegulationCard = ({ regulation }) => (
    <div className="card mb-3">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{regulation.title}</h6>
          <span className="badge bg-info">{regulation.jurisdiction}</span>
        </div>
      </div>
      <div className="card-body">
        <p className="card-text">{regulation.description}</p>
        
        <div className="mb-3">
          <h6>Requirements:</h6>
          <ul className="list-unstyled">
            {regulation.requirements.map((req, index) => (
              <li key={index} className="mb-1">
                <i className="bi bi-check-circle text-success me-2"></i>
                <small>{req}</small>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <h6>Penalties for Non-Compliance:</h6>
          <p className="text-danger">
            <small><i className="bi bi-exclamation-triangle me-2"></i>{regulation.penalties}</small>
          </p>
        </div>

        <div className="row">
          <div className="col-md-6">
            <small className="text-muted">
              <strong>Category:</strong> {regulation.category}
            </small>
          </div>
          <div className="col-md-6">
            <small className="text-muted">
              <strong>Last Updated:</strong> {regulation.lastUpdated.toLocaleDateString()}
            </small>
          </div>
          <div className="col-md-6">
            <small className="text-muted">
              <strong>Effective Date:</strong> {regulation.effectiveDate.toLocaleDateString()}
            </small>
          </div>
          <div className="col-md-6">
            <small className="text-muted">
              <strong>Applicable Properties:</strong> {regulation.applicableProperties.length}
            </small>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner message="Loading compliance data..." />;
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-shield-check me-2"></i>
                Legal Compliance
              </h2>
              <p className="text-muted">Manage legal documents and regulatory compliance</p>
            </div>
            <button
              className="btn btn-success"
              onClick={() => setShowUploadForm(true)}
            >
              <i className="bi bi-upload me-2"></i>
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Compliance Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Legal Documents ({documents.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'regulations' ? 'active' : ''}`}
            onClick={() => setActiveTab('regulations')}
          >
            Regulations ({regulations.length})
          </button>
        </li>
      </ul>

      {/* Error Display */}
      {error && (
        <ErrorMessage error={error} onRetry={loadComplianceData} />
      )}

      {/* Upload Document Modal */}
      {showUploadForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Legal Document</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUploadForm(false)}
                ></button>
              </div>
              <form onSubmit={handleUploadDocument}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="propertyId" className="form-label">Property *</label>
                    <select
                      className="form-select"
                      id="propertyId"
                      value={newDocument.propertyId}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, propertyId: e.target.value }))}
                      required
                    >
                      <option value="">Select Property</option>
                      {properties.filter(p => p.owner === userAddress).map(property => (
                        <option key={property.id} value={property.id}>
                          {property.location}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="documentType" className="form-label">Document Type</label>
                    <select
                      className="form-select"
                      id="documentType"
                      value={newDocument.documentType}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, documentType: e.target.value }))}
                    >
                      <option value="deed">Property Deed</option>
                      <option value="building-permit">Building Permit</option>
                      <option value="fire-safety">Fire Safety Certificate</option>
                      <option value="occupancy">Occupancy Certificate</option>
                      <option value="environmental">Environmental Clearance</option>
                      <option value="tax">Tax Documents</option>
                      <option value="insurance">Insurance Policy</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={newDocument.title}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows="3"
                      value={newDocument.description}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="expiryDate" className="form-label">Expiry Date (if applicable)</label>
                    <input
                      type="date"
                      className="form-control"
                      id="expiryDate"
                      value={newDocument.expiryDate}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="file" className="form-label">Document File *</label>
                    <input
                      type="file"
                      className="form-control"
                      id="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setNewDocument(prev => ({ ...prev, file: e.target.files[0] }))}
                      required
                    />
                    <div className="form-text">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUploadForm(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Uploading...
                      </>
                    ) : (
                      'Upload Document'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div>
            {complianceData.length > 0 ? (
              complianceData.map(compliance => (
                <ComplianceOverviewCard key={compliance.id} compliance={compliance} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-shield-exclamation display-1 text-muted"></i>
                <h3 className="mt-3">No Compliance Data</h3>
                <p className="text-muted">No compliance information available for your properties.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            {documents.length > 0 ? (
              documents.map(document => (
                <DocumentCard key={document.id} document={document} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-file-earmark-text display-1 text-muted"></i>
                <h3 className="mt-3">No Legal Documents</h3>
                <p className="text-muted">Upload your first legal document to get started.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowUploadForm(true)}
                >
                  Upload Document
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'regulations' && (
          <div>
            {regulations.length > 0 ? (
              regulations.map(regulation => (
                <RegulationCard key={regulation.id} regulation={regulation} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-book display-1 text-muted"></i>
                <h3 className="mt-3">No Regulations</h3>
                <p className="text-muted">No applicable regulations found for your properties.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalCompliance;
