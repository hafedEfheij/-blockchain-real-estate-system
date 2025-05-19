import React from 'react';

const PropertyCard = ({ property, onBuy, onTokenize, isOwner }) => {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">{property.location}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{property.propertyType}</h6>
        <div className="card-text">
          <p><strong>Area:</strong> {property.area} sq meters</p>
          <p><strong>Price:</strong> {property.price} ETH</p>
          <p><strong>Status:</strong> {property.forSale ? 'For Sale' : 'Not For Sale'}</p>
          <p><strong>Verified:</strong> {property.verified ? 'Yes' : 'No'}</p>
          <p><strong>Owner:</strong> {property.owner.substring(0, 6)}...{property.owner.substring(property.owner.length - 4)}</p>
        </div>
        <div className="mt-3">
          {property.forSale && !isOwner && (
            <button 
              className="btn btn-primary me-2" 
              onClick={() => onBuy(property.id, property.price)}
              disabled={!property.verified}
            >
              Buy Property
            </button>
          )}
          {isOwner && !property.forSale && (
            <button 
              className="btn btn-success me-2" 
              onClick={() => onTokenize(property.id)}
              disabled={!property.verified}
            >
              Tokenize Property
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
