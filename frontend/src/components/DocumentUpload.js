import React, { useState, useCallback } from 'react';
import { uploadToIPFS, isValidIPFSHash } from '../utils/ipfs';
import { APP_CONFIG } from '../utils/constants';
import { isSupportedFileType } from '../utils/helpers';

const DocumentUpload = ({ onDocumentsChange, initialDocuments = [] }) => {
  const [documents, setDocuments] = useState(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});

  // Mock API keys for demo (in production, these should come from environment or user settings)
  const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY || 'demo_key';
  const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY || 'demo_secret';

  const handleFileSelect = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    
    if (documents.length + files.length > APP_CONFIG.MAX_DOCUMENTS_PER_PROPERTY) {
      setErrors({
        general: `Maximum ${APP_CONFIG.MAX_DOCUMENTS_PER_PROPERTY} documents allowed`
      });
      return;
    }

    setUploading(true);
    setErrors({});

    for (const file of files) {
      try {
        // Validate file
        if (!isSupportedFileType(file.name, APP_CONFIG.SUPPORTED_FILE_TYPES)) {
          throw new Error(`Unsupported file type: ${file.name}`);
        }

        if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
          throw new Error(`File too large: ${file.name}`);
        }

        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { status: 'uploading', progress: 0 }
        }));

        // For demo purposes, we'll simulate IPFS upload
        // In production, uncomment the line below and remove the simulation
        // const ipfsHash = await uploadToIPFS(file, PINATA_API_KEY, PINATA_SECRET_KEY);
        
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 20) {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: { status: 'uploading', progress: i }
          }));
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Generate mock IPFS hash for demo
        const ipfsHash = `Qm${Math.random().toString(36).substr(2, 44)}`;

        const newDocument = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          ipfsHash,
          url: `ipfs://${ipfsHash}`,
          uploadedAt: new Date().toISOString()
        };

        setDocuments(prev => {
          const updated = [...prev, newDocument];
          onDocumentsChange(updated);
          return updated;
        });

        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { status: 'completed', progress: 100 }
        }));

      } catch (error) {
        console.error('Upload error:', error);
        setErrors(prev => ({
          ...prev,
          [file.name]: error.message
        }));
        
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { status: 'error', progress: 0 }
        }));
      }
    }

    setUploading(false);
    
    // Clear progress after a delay
    setTimeout(() => {
      setUploadProgress({});
    }, 3000);

    // Clear file input
    event.target.value = '';
  }, [documents, onDocumentsChange]);

  const handleRemoveDocument = (documentId) => {
    const updated = documents.filter(doc => doc.id !== documentId);
    setDocuments(updated);
    onDocumentsChange(updated);
  };

  const handleAddManualUrl = () => {
    const url = prompt('Enter IPFS URL or hash:');
    if (!url) return;

    let ipfsHash;
    if (url.startsWith('ipfs://')) {
      ipfsHash = url.replace('ipfs://', '');
    } else if (url.includes('/ipfs/')) {
      ipfsHash = url.split('/ipfs/')[1];
    } else {
      ipfsHash = url;
    }

    if (!isValidIPFSHash(ipfsHash)) {
      alert('Invalid IPFS hash or URL');
      return;
    }

    const newDocument = {
      id: Date.now(),
      name: `Document ${documents.length + 1}`,
      type: 'application/octet-stream',
      size: 0,
      ipfsHash,
      url: `ipfs://${ipfsHash}`,
      uploadedAt: new Date().toISOString(),
      manual: true
    };

    const updated = [...documents, newDocument];
    setDocuments(updated);
    onDocumentsChange(updated);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="bi bi-file-earmark-arrow-up me-2"></i>
          Property Documents
        </h6>
      </div>
      <div className="card-body">
        {/* Upload Area */}
        <div className="mb-3">
          <label htmlFor="documentUpload" className="form-label">
            Upload Documents
          </label>
          <input
            type="file"
            className="form-control"
            id="documentUpload"
            multiple
            accept={APP_CONFIG.SUPPORTED_FILE_TYPES.join(',')}
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <div className="form-text">
            Supported formats: {APP_CONFIG.SUPPORTED_FILE_TYPES.join(', ')}. 
            Max size: {APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB per file.
            Max {APP_CONFIG.MAX_DOCUMENTS_PER_PROPERTY} documents total.
          </div>
        </div>

        {/* Manual URL Input */}
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleAddManualUrl}
            disabled={uploading || documents.length >= APP_CONFIG.MAX_DOCUMENTS_PER_PROPERTY}
          >
            <i className="bi bi-link-45deg me-1"></i>
            Add IPFS URL
          </button>
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mb-3">
            <h6>Upload Progress</h6>
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="mb-2">
                <div className="d-flex justify-content-between">
                  <small>{fileName}</small>
                  <small>{progress.progress}%</small>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className={`progress-bar ${
                      progress.status === 'error' ? 'bg-danger' :
                      progress.status === 'completed' ? 'bg-success' : ''
                    }`}
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="alert alert-danger">
            {Object.entries(errors).map(([key, error]) => (
              <div key={key}>
                <strong>{key}:</strong> {error}
              </div>
            ))}
          </div>
        )}

        {/* Document List */}
        {documents.length > 0 && (
          <div>
            <h6>Uploaded Documents ({documents.length})</h6>
            <div className="list-group">
              {documents.map(doc => (
                <div key={doc.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">
                        <i className="bi bi-file-earmark me-2"></i>
                        {doc.name}
                        {doc.manual && (
                          <span className="badge bg-secondary ms-2">Manual</span>
                        )}
                      </h6>
                      <p className="mb-1">
                        <small className="text-muted">
                          Size: {formatFileSize(doc.size)} | 
                          Type: {doc.type} | 
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </small>
                      </p>
                      <p className="mb-0">
                        <small>
                          <strong>IPFS:</strong> 
                          <code className="ms-1">{doc.ipfsHash}</code>
                          <button
                            className="btn btn-link btn-sm p-0 ms-2"
                            onClick={() => navigator.clipboard.writeText(doc.url)}
                            title="Copy IPFS URL"
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        </small>
                      </p>
                    </div>
                    <div className="ms-3">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleRemoveDocument(doc.id)}
                        title="Remove document"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {documents.length === 0 && (
          <div className="text-center text-muted py-4">
            <i className="bi bi-file-earmark display-4"></i>
            <p className="mt-2">No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
