import React, { useState, useEffect } from 'react';
import { PROPERTY_TYPES } from '../utils/constants';
import { debounce } from '../utils/helpers';

const PropertySearch = ({ onSearch, onFilter, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    verified: '',
    forSale: true
  });

  // Debounced search function
  const debouncedSearch = debounce((term) => {
    onSearch(term);
  }, 500);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      verified: '',
      forSale: true
    });
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-search me-2"></i>
          Search & Filter Properties
        </h5>
      </div>
      <div className="card-body">
        {/* Search Bar */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by location, property type, or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={loading}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row">
          {/* Property Type */}
          <div className="col-md-3 mb-3">
            <label htmlFor="propertyType" className="form-label">Property Type</label>
            <select
              className="form-select"
              id="propertyType"
              name="propertyType"
              value={filters.propertyType}
              onChange={handleFilterChange}
              disabled={loading}
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="col-md-3 mb-3">
            <label className="form-label">Price Range (ETH)</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                placeholder="Min"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                disabled={loading}
                step="0.01"
                min="0"
              />
              <span className="input-group-text">-</span>
              <input
                type="number"
                className="form-control"
                placeholder="Max"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                disabled={loading}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Area Range */}
          <div className="col-md-3 mb-3">
            <label className="form-label">Area Range (sq m)</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                placeholder="Min"
                name="minArea"
                value={filters.minArea}
                onChange={handleFilterChange}
                disabled={loading}
                min="0"
              />
              <span className="input-group-text">-</span>
              <input
                type="number"
                className="form-control"
                placeholder="Max"
                name="maxArea"
                value={filters.maxArea}
                onChange={handleFilterChange}
                disabled={loading}
                min="0"
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="col-md-3 mb-3">
            <label className="form-label">Status</label>
            <div>
              <select
                className="form-select mb-2"
                name="verified"
                value={filters.verified}
                onChange={handleFilterChange}
                disabled={loading}
              >
                <option value="">All Properties</option>
                <option value="true">Verified Only</option>
                <option value="false">Unverified Only</option>
              </select>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="forSale"
                  name="forSale"
                  checked={filters.forSale}
                  onChange={handleFilterChange}
                  disabled={loading}
                />
                <label className="form-check-label" htmlFor="forSale">
                  For Sale Only
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="row">
          <div className="col-12">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={clearFilters}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Clear Filters
            </button>
            <small className="text-muted">
              {loading && (
                <>
                  <i className="bi bi-hourglass-split me-1"></i>
                  Searching...
                </>
              )}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;
