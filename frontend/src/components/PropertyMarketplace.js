import React, { useState, useEffect } from 'react';
import { formatEther, formatAddress, timeAgo } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const PropertyMarketplace = ({ signer, userAddress }) => {
  const [properties, setProperties] = useState([]);
  const [bids, setBids] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidding, setBidding] = useState({});
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    loadMarketplaceData();
  }, [signer]);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock marketplace data
      const mockProperties = [
        {
          id: '1',
          location: 'Downtown Manhattan, NY',
          propertyType: 'Commercial',
          area: 500,
          currentPrice: '150',
          startingPrice: '120',
          highestBid: '145',
          bidCount: 8,
          timeLeft: new Date(Date.now() + 86400000 * 2), // 2 days
          seller: '0x1234567890123456789012345678901234567890',
          verified: true,
          images: ['ipfs://image1', 'ipfs://image2'],
          auctionType: 'auction'
        },
        {
          id: '2',
          location: 'Beverly Hills, CA',
          propertyType: 'Residential',
          area: 800,
          currentPrice: '300',
          startingPrice: '300',
          highestBid: null,
          bidCount: 0,
          timeLeft: null,
          seller: '0x0987654321098765432109876543210987654321',
          verified: true,
          images: ['ipfs://image3'],
          auctionType: 'fixed'
        },
        {
          id: '3',
          location: 'Miami Beach, FL',
          propertyType: 'Residential',
          area: 600,
          currentPrice: '200',
          startingPrice: '180',
          highestBid: '195',
          bidCount: 12,
          timeLeft: new Date(Date.now() + 86400000 * 5), // 5 days
          seller: '0x5555666677778888999900001111222233334444',
          verified: true,
          images: ['ipfs://image4', 'ipfs://image5'],
          auctionType: 'auction'
        }
      ];

      setProperties(mockProperties);
      
      // Load existing bids
      const mockBids = {
        '1': [
          { bidder: '0xaaa', amount: '145', timestamp: new Date(Date.now() - 3600000) },
          { bidder: '0xbbb', amount: '140', timestamp: new Date(Date.now() - 7200000) }
        ],
        '3': [
          { bidder: '0xccc', amount: '195', timestamp: new Date(Date.now() - 1800000) },
          { bidder: '0xddd', amount: '190', timestamp: new Date(Date.now() - 3600000) }
        ]
      };
      setBids(mockBids);
      
    } catch (error) {
      console.error('Error loading marketplace:', error);
      setError('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (propertyId, bidAmount) => {
    try {
      setBidding(prev => ({ ...prev, [propertyId]: true }));
      setError('');

      const property = properties.find(p => p.id === propertyId);
      const minBid = property.highestBid ? 
        parseFloat(property.highestBid) + 0.1 : 
        parseFloat(property.startingPrice);

      if (parseFloat(bidAmount) < minBid) {
        throw new Error(`Bid must be at least ${minBid} ETH`);
      }

      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state
      const newBid = {
        bidder: userAddress,
        amount: bidAmount,
        timestamp: new Date()
      };

      setBids(prev => ({
        ...prev,
        [propertyId]: [newBid, ...(prev[propertyId] || [])]
      }));

      setProperties(prev => prev.map(p => 
        p.id === propertyId 
          ? { ...p, highestBid: bidAmount, bidCount: p.bidCount + 1 }
          : p
      ));

      alert('Bid placed successfully!');
      
    } catch (error) {
      console.error('Error placing bid:', error);
      setError(error.message || 'Failed to place bid');
    } finally {
      setBidding(prev => ({ ...prev, [propertyId]: false }));
    }
  };

  const handleBuyNow = async (propertyId) => {
    try {
      setBidding(prev => ({ ...prev, [propertyId]: true }));
      setError('');

      const property = properties.find(p => p.id === propertyId);
      const confirmed = window.confirm(
        `Buy property for ${property.currentPrice} ETH?`
      );

      if (!confirmed) {
        setBidding(prev => ({ ...prev, [propertyId]: false }));
        return;
      }

      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      alert('Property purchased successfully!');
      
      // Remove from marketplace
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      
    } catch (error) {
      console.error('Error buying property:', error);
      setError('Failed to purchase property');
    } finally {
      setBidding(prev => ({ ...prev, [propertyId]: false }));
    }
  };

  const getFilteredProperties = () => {
    let filtered = properties;

    // Apply filters
    switch (filterBy) {
      case 'auction':
        filtered = filtered.filter(p => p.auctionType === 'auction');
        break;
      case 'fixed':
        filtered = filtered.filter(p => p.auctionType === 'fixed');
        break;
      case 'ending-soon':
        filtered = filtered.filter(p => 
          p.timeLeft && (p.timeLeft - new Date()) < 86400000 // Less than 24 hours
        );
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.currentPrice) - parseFloat(b.currentPrice));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.currentPrice) - parseFloat(a.currentPrice));
        break;
      case 'ending-soon':
        filtered.sort((a, b) => {
          if (!a.timeLeft) return 1;
          if (!b.timeLeft) return -1;
          return a.timeLeft - b.timeLeft;
        });
        break;
      case 'most-bids':
        filtered.sort((a, b) => b.bidCount - a.bidCount);
        break;
      default:
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
    }

    return filtered;
  };

  const PropertyCard = ({ property }) => {
    const [bidAmount, setBidAmount] = useState('');
    const propertyBids = bids[property.id] || [];
    const isAuction = property.auctionType === 'auction';
    const timeRemaining = property.timeLeft ? property.timeLeft - new Date() : null;
    const isExpired = timeRemaining && timeRemaining <= 0;

    const formatTimeRemaining = (ms) => {
      if (ms <= 0) return 'Expired';
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };

    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <span className={`badge ${isAuction ? 'bg-warning' : 'bg-success'}`}>
              {isAuction ? 'Auction' : 'Fixed Price'}
            </span>
            {property.verified && (
              <span className="badge bg-primary ms-2">Verified</span>
            )}
          </div>
          {isAuction && timeRemaining && (
            <small className={`text-${isExpired ? 'danger' : 'muted'}`}>
              {formatTimeRemaining(timeRemaining)}
            </small>
          )}
        </div>
        
        <div className="card-body">
          <h6 className="card-title">{property.location}</h6>
          <p className="card-text">
            <small className="text-muted">
              {property.propertyType} • {property.area} sq m
            </small>
          </p>
          
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <span>Current Price:</span>
              <strong>{formatEther(property.currentPrice)}</strong>
            </div>
            {isAuction && (
              <>
                <div className="d-flex justify-content-between">
                  <span>Starting Price:</span>
                  <span>{formatEther(property.startingPrice)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Highest Bid:</span>
                  <span>{property.highestBid ? formatEther(property.highestBid) : 'No bids'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Total Bids:</span>
                  <span>{property.bidCount}</span>
                </div>
              </>
            )}
          </div>

          {isAuction && !isExpired && (
            <div className="mb-3">
              <label htmlFor={`bid-${property.id}`} className="form-label">
                Place Bid (ETH)
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  id={`bid-${property.id}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min: ${property.highestBid ? 
                    (parseFloat(property.highestBid) + 0.1).toFixed(1) : 
                    property.startingPrice}`}
                  step="0.1"
                  disabled={bidding[property.id]}
                />
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handlePlaceBid(property.id, bidAmount)}
                  disabled={!bidAmount || bidding[property.id]}
                >
                  {bidding[property.id] ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    'Bid'
                  )}
                </button>
              </div>
            </div>
          )}

          {!isAuction && (
            <button
              className="btn btn-success w-100"
              onClick={() => handleBuyNow(property.id)}
              disabled={bidding[property.id]}
            >
              {bidding[property.id] ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-cart-plus me-2"></i>
                  Buy Now
                </>
              )}
            </button>
          )}

          <div className="mt-3">
            <small className="text-muted">
              Seller: {formatAddress(property.seller)}
            </small>
          </div>
        </div>

        {propertyBids.length > 0 && (
          <div className="card-footer">
            <h6>Recent Bids</h6>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {propertyBids.slice(0, 5).map((bid, index) => (
                <div key={index} className="d-flex justify-content-between small">
                  <span>{formatAddress(bid.bidder)}</span>
                  <span>{formatEther(bid.amount)}</span>
                  <span>{timeAgo(bid.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading marketplace..." />;
  }

  const filteredProperties = getFilteredProperties();

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h2>
            <i className="bi bi-shop me-2"></i>
            Property Marketplace
          </h2>
          <p className="text-muted">Buy properties through auctions or fixed prices</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <label htmlFor="filterBy" className="form-label me-2 mb-0">Filter:</label>
            <select
              id="filterBy"
              className="form-select form-select-sm me-3"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Properties</option>
              <option value="auction">Auctions Only</option>
              <option value="fixed">Fixed Price Only</option>
              <option value="ending-soon">Ending Soon</option>
            </select>
            
            <label htmlFor="sortBy" className="form-label me-2 mb-0">Sort:</label>
            <select
              id="sortBy"
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="ending-soon">Ending Soon</option>
              <option value="most-bids">Most Bids</option>
            </select>
          </div>
        </div>
        <div className="col-md-6 text-end">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={loadMarketplaceData}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage error={error} onRetry={loadMarketplaceData} />
      )}

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="row">
          {filteredProperties.map(property => (
            <div key={property.id} className="col-lg-4 col-md-6 mb-4">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-shop display-1 text-muted"></i>
          <h3 className="mt-3">No Properties Available</h3>
          <p className="text-muted">
            {filterBy === 'all' 
              ? 'No properties are currently listed in the marketplace.' 
              : `No properties match the selected filter: ${filterBy}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default PropertyMarketplace;
