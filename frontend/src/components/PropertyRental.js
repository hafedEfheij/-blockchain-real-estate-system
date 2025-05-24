import React, { useState, useEffect } from 'react';
import { formatEther, formatAddress, timeAgo } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const PropertyRental = ({ signer, userAddress }) => {
  const [rentals, setRentals] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newRental, setNewRental] = useState({
    propertyId: '',
    monthlyRent: '',
    securityDeposit: '',
    leaseDuration: '12',
    availableFrom: '',
    description: '',
    amenities: [],
    petPolicy: 'no-pets',
    smokingPolicy: 'no-smoking'
  });

  useEffect(() => {
    loadRentalData();
  }, [signer, userAddress]);

  const loadRentalData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock rental data
      const mockRentals = [
        {
          id: '1',
          propertyId: '1',
          landlord: '0x1234567890123456789012345678901234567890',
          tenant: null,
          monthlyRent: '2.5',
          securityDeposit: '5.0',
          leaseDuration: 12,
          availableFrom: new Date(Date.now() + 86400000 * 7),
          leaseStart: null,
          leaseEnd: null,
          status: 'available',
          description: 'Beautiful downtown apartment with city views',
          amenities: ['WiFi', 'Parking', 'Gym', 'Pool'],
          petPolicy: 'cats-allowed',
          smokingPolicy: 'no-smoking',
          location: 'Downtown Manhattan, NY',
          propertyType: 'Residential',
          area: 85,
          images: ['ipfs://image1', 'ipfs://image2']
        },
        {
          id: '2',
          propertyId: '2',
          landlord: userAddress,
          tenant: '0x9876543210987654321098765432109876543210',
          monthlyRent: '3.2',
          securityDeposit: '6.4',
          leaseDuration: 24,
          availableFrom: new Date(Date.now() - 86400000 * 30),
          leaseStart: new Date(Date.now() - 86400000 * 30),
          leaseEnd: new Date(Date.now() + 86400000 * 700),
          status: 'occupied',
          description: 'Luxury condo with modern amenities',
          amenities: ['WiFi', 'Parking', 'Concierge', 'Rooftop'],
          petPolicy: 'no-pets',
          smokingPolicy: 'no-smoking',
          location: 'Beverly Hills, CA',
          propertyType: 'Residential',
          area: 120,
          images: ['ipfs://image3']
        },
        {
          id: '3',
          propertyId: '3',
          landlord: '0x5555666677778888999900001111222233334444',
          tenant: userAddress,
          monthlyRent: '1.8',
          securityDeposit: '3.6',
          leaseDuration: 6,
          availableFrom: new Date(Date.now() - 86400000 * 60),
          leaseStart: new Date(Date.now() - 86400000 * 60),
          leaseEnd: new Date(Date.now() + 86400000 * 120),
          status: 'occupied',
          description: 'Cozy studio apartment near beach',
          amenities: ['WiFi', 'Beach Access'],
          petPolicy: 'pets-allowed',
          smokingPolicy: 'smoking-allowed',
          location: 'Miami Beach, FL',
          propertyType: 'Residential',
          area: 45,
          images: ['ipfs://image4']
        }
      ];

      setRentals(mockRentals);
      setMyRentals(mockRentals.filter(r => r.landlord === userAddress || r.tenant === userAddress));
      
    } catch (error) {
      console.error('Error loading rental data:', error);
      setError('Failed to load rental data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRental = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError('');

      // Validate form
      if (!newRental.propertyId || !newRental.monthlyRent || !newRental.securityDeposit) {
        throw new Error('Please fill in all required fields');
      }

      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      const rental = {
        id: Date.now().toString(),
        propertyId: newRental.propertyId,
        landlord: userAddress,
        tenant: null,
        monthlyRent: newRental.monthlyRent,
        securityDeposit: newRental.securityDeposit,
        leaseDuration: parseInt(newRental.leaseDuration),
        availableFrom: new Date(newRental.availableFrom),
        leaseStart: null,
        leaseEnd: null,
        status: 'available',
        description: newRental.description,
        amenities: newRental.amenities,
        petPolicy: newRental.petPolicy,
        smokingPolicy: newRental.smokingPolicy,
        location: 'Your Property Location',
        propertyType: 'Residential',
        area: 100,
        images: []
      };

      setRentals(prev => [rental, ...prev]);
      setMyRentals(prev => [rental, ...prev]);
      setShowCreateForm(false);
      setNewRental({
        propertyId: '',
        monthlyRent: '',
        securityDeposit: '',
        leaseDuration: '12',
        availableFrom: '',
        description: '',
        amenities: [],
        petPolicy: 'no-pets',
        smokingPolicy: 'no-smoking'
      });

      alert('Rental listing created successfully!');
      
    } catch (error) {
      console.error('Error creating rental:', error);
      setError(error.message || 'Failed to create rental listing');
    } finally {
      setCreating(false);
    }
  };

  const handleRentProperty = async (rentalId) => {
    try {
      setError('');
      const rental = rentals.find(r => r.id === rentalId);
      
      const confirmed = window.confirm(
        `Rent this property for ${rental.monthlyRent} ETH/month?\n` +
        `Security deposit: ${rental.securityDeposit} ETH\n` +
        `Lease duration: ${rental.leaseDuration} months`
      );

      if (!confirmed) return;

      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Update rental status
      setRentals(prev => prev.map(r => 
        r.id === rentalId 
          ? { 
              ...r, 
              tenant: userAddress, 
              status: 'occupied',
              leaseStart: new Date(),
              leaseEnd: new Date(Date.now() + r.leaseDuration * 30 * 24 * 60 * 60 * 1000)
            }
          : r
      ));

      setMyRentals(prev => prev.map(r => 
        r.id === rentalId 
          ? { 
              ...r, 
              tenant: userAddress, 
              status: 'occupied',
              leaseStart: new Date(),
              leaseEnd: new Date(Date.now() + r.leaseDuration * 30 * 24 * 60 * 60 * 1000)
            }
          : r
      ));

      alert('Property rented successfully!');
      
    } catch (error) {
      console.error('Error renting property:', error);
      setError('Failed to rent property');
    }
  };

  const handleAmenityChange = (amenity, checked) => {
    setNewRental(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const RentalCard = ({ rental, showActions = true }) => {
    const isLandlord = rental.landlord === userAddress;
    const isTenant = rental.tenant === userAddress;
    const canRent = !isLandlord && !isTenant && rental.status === 'available';
    const daysUntilAvailable = rental.availableFrom ? 
      Math.ceil((rental.availableFrom - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <span className={`badge ${
              rental.status === 'available' ? 'bg-success' : 
              rental.status === 'occupied' ? 'bg-primary' : 'bg-secondary'
            }`}>
              {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
            </span>
            {isLandlord && <span className="badge bg-info ms-2">Your Property</span>}
            {isTenant && <span className="badge bg-warning ms-2">Your Rental</span>}
          </div>
          <small className="text-muted">Property #{rental.propertyId}</small>
        </div>
        
        <div className="card-body">
          <h6 className="card-title">{rental.location}</h6>
          <p className="card-text">
            <small className="text-muted">
              {rental.propertyType} • {rental.area} sq m
            </small>
          </p>
          
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <span>Monthly Rent:</span>
              <strong>{formatEther(rental.monthlyRent)}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>Security Deposit:</span>
              <span>{formatEther(rental.securityDeposit)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Lease Duration:</span>
              <span>{rental.leaseDuration} months</span>
            </div>
            {rental.status === 'available' && (
              <div className="d-flex justify-content-between">
                <span>Available From:</span>
                <span>
                  {daysUntilAvailable > 0 ? 
                    `In ${daysUntilAvailable} days` : 
                    'Now'
                  }
                </span>
              </div>
            )}
            {rental.leaseEnd && (
              <div className="d-flex justify-content-between">
                <span>Lease Ends:</span>
                <span>{rental.leaseEnd.toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {rental.description && (
            <p className="card-text">
              <small>{rental.description}</small>
            </p>
          )}

          {rental.amenities.length > 0 && (
            <div className="mb-3">
              <h6>Amenities:</h6>
              <div className="d-flex flex-wrap gap-1">
                {rental.amenities.map(amenity => (
                  <span key={amenity} className="badge bg-light text-dark">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3">
            <small className="text-muted">
              <div>Pets: {rental.petPolicy.replace('-', ' ')}</div>
              <div>Smoking: {rental.smokingPolicy.replace('-', ' ')}</div>
            </small>
          </div>

          <div className="mb-3">
            <small className="text-muted">
              Landlord: {formatAddress(rental.landlord)}
              {rental.tenant && (
                <>
                  <br />
                  Tenant: {formatAddress(rental.tenant)}
                </>
              )}
            </small>
          </div>

          {showActions && canRent && daysUntilAvailable <= 0 && (
            <button
              className="btn btn-primary w-100"
              onClick={() => handleRentProperty(rental.id)}
            >
              <i className="bi bi-house-door me-2"></i>
              Rent Property
            </button>
          )}

          {showActions && canRent && daysUntilAvailable > 0 && (
            <button className="btn btn-outline-secondary w-100" disabled>
              Available in {daysUntilAvailable} days
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading rental properties..." />;
  }

  const availableRentals = rentals.filter(r => r.status === 'available');
  const occupiedRentals = rentals.filter(r => r.status === 'occupied');

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-house-heart me-2"></i>
                Property Rentals
              </h2>
              <p className="text-muted">Rent properties or list your property for rent</p>
            </div>
            <button
              className="btn btn-success"
              onClick={() => setShowCreateForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              List Property for Rent
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available Rentals ({availableRentals.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'occupied' ? 'active' : ''}`}
            onClick={() => setActiveTab('occupied')}
          >
            Occupied Properties ({occupiedRentals.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'my-rentals' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-rentals')}
          >
            My Rentals ({myRentals.length})
          </button>
        </li>
      </ul>

      {/* Error Display */}
      {error && (
        <ErrorMessage error={error} onRetry={loadRentalData} />
      )}

      {/* Create Rental Form Modal */}
      {showCreateForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">List Property for Rent</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateForm(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateRental}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="propertyId" className="form-label">Property ID *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="propertyId"
                          value={newRental.propertyId}
                          onChange={(e) => setNewRental(prev => ({ ...prev, propertyId: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="monthlyRent" className="form-label">Monthly Rent (ETH) *</label>
                        <input
                          type="number"
                          className="form-control"
                          id="monthlyRent"
                          step="0.01"
                          value={newRental.monthlyRent}
                          onChange={(e) => setNewRental(prev => ({ ...prev, monthlyRent: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="securityDeposit" className="form-label">Security Deposit (ETH) *</label>
                        <input
                          type="number"
                          className="form-control"
                          id="securityDeposit"
                          step="0.01"
                          value={newRental.securityDeposit}
                          onChange={(e) => setNewRental(prev => ({ ...prev, securityDeposit: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="leaseDuration" className="form-label">Lease Duration (months)</label>
                        <select
                          className="form-select"
                          id="leaseDuration"
                          value={newRental.leaseDuration}
                          onChange={(e) => setNewRental(prev => ({ ...prev, leaseDuration: e.target.value }))}
                        >
                          <option value="3">3 months</option>
                          <option value="6">6 months</option>
                          <option value="12">12 months</option>
                          <option value="24">24 months</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="availableFrom" className="form-label">Available From</label>
                        <input
                          type="date"
                          className="form-control"
                          id="availableFrom"
                          value={newRental.availableFrom}
                          onChange={(e) => setNewRental(prev => ({ ...prev, availableFrom: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="petPolicy" className="form-label">Pet Policy</label>
                        <select
                          className="form-select"
                          id="petPolicy"
                          value={newRental.petPolicy}
                          onChange={(e) => setNewRental(prev => ({ ...prev, petPolicy: e.target.value }))}
                        >
                          <option value="no-pets">No Pets</option>
                          <option value="cats-allowed">Cats Allowed</option>
                          <option value="dogs-allowed">Dogs Allowed</option>
                          <option value="pets-allowed">All Pets Allowed</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          id="description"
                          rows="3"
                          value={newRental.description}
                          onChange={(e) => setNewRental(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label">Amenities</label>
                        <div className="row">
                          {['WiFi', 'Parking', 'Gym', 'Pool', 'Concierge', 'Rooftop', 'Beach Access'].map(amenity => (
                            <div key={amenity} className="col-md-4">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`amenity-${amenity}`}
                                  checked={newRental.amenities.includes(amenity)}
                                  onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor={`amenity-${amenity}`}>
                                  {amenity}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateForm(false)}
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Listing'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rental Listings */}
      <div className="tab-content">
        {activeTab === 'available' && (
          <div className="row">
            {availableRentals.length > 0 ? (
              availableRentals.map(rental => (
                <div key={rental.id} className="col-lg-4 col-md-6 mb-4">
                  <RentalCard rental={rental} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <i className="bi bi-house display-1 text-muted"></i>
                <h3 className="mt-3">No Available Rentals</h3>
                <p className="text-muted">No properties are currently available for rent.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'occupied' && (
          <div className="row">
            {occupiedRentals.length > 0 ? (
              occupiedRentals.map(rental => (
                <div key={rental.id} className="col-lg-4 col-md-6 mb-4">
                  <RentalCard rental={rental} showActions={false} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <i className="bi bi-house-check display-1 text-muted"></i>
                <h3 className="mt-3">No Occupied Properties</h3>
                <p className="text-muted">No properties are currently occupied.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-rentals' && (
          <div className="row">
            {myRentals.length > 0 ? (
              myRentals.map(rental => (
                <div key={rental.id} className="col-lg-4 col-md-6 mb-4">
                  <RentalCard rental={rental} showActions={false} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <i className="bi bi-house-heart display-1 text-muted"></i>
                <h3 className="mt-3">No Rental Properties</h3>
                <p className="text-muted">You don't have any rental properties yet.</p>
                <button
                  className="btn btn-primary mt-3"
                  onClick={() => setShowCreateForm(true)}
                >
                  List Your First Property
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyRental;
