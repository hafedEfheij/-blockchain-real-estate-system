import React, { useState } from 'react';
import PropertyCard from './PropertyCard';
import LoadingSpinner from './LoadingSpinner';

const PropertyGrid = ({ 
  properties = [], 
  loading = false, 
  onBuy, 
  onTokenize, 
  currentUserAddress,
  itemsPerPage = 9 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  // Sort properties
  const sortedProperties = [...properties].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'area-low':
        return parseInt(a.area) - parseInt(b.area);
      case 'area-high':
        return parseInt(b.area) - parseInt(a.area);
      case 'location':
        return a.location.localeCompare(b.location);
      case 'newest':
      default:
        return parseInt(b.id) - parseInt(a.id);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = sortedProperties.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingSpinner message="Loading properties..." />;
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-house-x display-1 text-muted"></i>
        <h3 className="mt-3">No Properties Found</h3>
        <p className="text-muted">Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with sort and count */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-0">
            {properties.length} Properties Found
          </h5>
          <small className="text-muted">
            Showing {startIndex + 1}-{Math.min(endIndex, properties.length)} of {properties.length}
          </small>
        </div>
        <div className="d-flex align-items-center">
          <label htmlFor="sortBy" className="form-label me-2 mb-0">Sort by:</label>
          <select
            id="sortBy"
            className="form-select form-select-sm"
            value={sortBy}
            onChange={handleSortChange}
            style={{ width: 'auto' }}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="area-low">Area: Small to Large</option>
            <option value="area-high">Area: Large to Small</option>
            <option value="location">Location A-Z</option>
          </select>
        </div>
      </div>

      {/* Property Grid */}
      <div className="row">
        {currentProperties.map(property => (
          <div className="col-lg-4 col-md-6 mb-4" key={property.id}>
            <PropertyCard
              property={property}
              onBuy={onBuy}
              onTokenize={onTokenize}
              isOwner={property.owner === currentUserAddress}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Property pagination">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i>
                Previous
              </button>
            </li>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;
              const showPage = page === 1 || page === totalPages || 
                             (page >= currentPage - 2 && page <= currentPage + 2);
              
              if (!showPage) {
                if (page === currentPage - 3 || page === currentPage + 3) {
                  return (
                    <li key={page} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                }
                return null;
              }
              
              return (
                <li key={page} className={`page-item ${isCurrentPage ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              );
            })}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <i className="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default PropertyGrid;
