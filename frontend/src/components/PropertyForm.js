import React, { useState } from 'react';

const PropertyForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    location: '',
    area: '',
    propertyType: 'Residential',
    documents: [''],
    price: '',
    forSale: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDocumentChange = (index, value) => {
    const updatedDocuments = [...formData.documents];
    updatedDocuments[index] = value;
    setFormData({
      ...formData,
      documents: updatedDocuments
    });
  };

  const addDocument = () => {
    setFormData({
      ...formData,
      documents: [...formData.documents, '']
    });
  };

  const removeDocument = (index) => {
    const updatedDocuments = [...formData.documents];
    updatedDocuments.splice(index, 1);
    setFormData({
      ...formData,
      documents: updatedDocuments
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Register New Property</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="area" className="form-label">Area (sq meters)</label>
            <input
              type="number"
              className="form-control"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="propertyType" className="form-label">Property Type</label>
            <select
              className="form-select"
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              required
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Land">Land</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Documents (URLs)</label>
            {formData.documents.map((doc, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  value={doc}
                  onChange={(e) => handleDocumentChange(index, e.target.value)}
                  placeholder="Document URL (e.g., IPFS link)"
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeDocument(index)}
                  disabled={formData.documents.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={addDocument}
            >
              Add Document
            </button>
          </div>
          <div className="mb-3">
            <label htmlFor="price" className="form-label">Price (ETH)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="forSale"
              name="forSale"
              checked={formData.forSale}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="forSale">List for Sale</label>
          </div>
          <button type="submit" className="btn btn-primary">Register Property</button>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
