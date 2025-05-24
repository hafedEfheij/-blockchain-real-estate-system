import React, { useState, useEffect } from 'react';
import { formatAddress, timeAgo } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const PropertyMaintenance = ({ userAddress, properties = [] }) => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('requests');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newRequest, setNewRequest] = useState({
    propertyId: '',
    category: 'plumbing',
    priority: 'medium',
    title: '',
    description: '',
    preferredDate: '',
    budget: '',
    images: []
  });

  useEffect(() => {
    loadMaintenanceData();
  }, [userAddress]);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock service requests data
      const mockRequests = [
        {
          id: '1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          category: 'plumbing',
          priority: 'high',
          title: 'Leaking Kitchen Faucet',
          description: 'Kitchen faucet has been leaking for 2 days. Water pressure also seems low.',
          status: 'open',
          requestedBy: userAddress,
          assignedTo: null,
          createdAt: new Date(Date.now() - 86400000 * 2),
          scheduledDate: null,
          completedAt: null,
          estimatedCost: '0.15',
          actualCost: null,
          images: ['ipfs://maintenance1'],
          notes: []
        },
        {
          id: '2',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          category: 'electrical',
          priority: 'medium',
          title: 'Bedroom Light Switch Not Working',
          description: 'Light switch in master bedroom stopped working yesterday.',
          status: 'assigned',
          requestedBy: userAddress,
          assignedTo: '0x1234567890123456789012345678901234567890',
          createdAt: new Date(Date.now() - 86400000 * 1),
          scheduledDate: new Date(Date.now() + 86400000 * 2),
          completedAt: null,
          estimatedCost: '0.08',
          actualCost: null,
          images: [],
          notes: [
            { author: 'Service Provider', text: 'Will check the wiring tomorrow', timestamp: new Date() }
          ]
        },
        {
          id: '3',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          category: 'hvac',
          priority: 'low',
          title: 'Annual HVAC Maintenance',
          description: 'Routine annual maintenance and filter replacement for HVAC system.',
          status: 'completed',
          requestedBy: userAddress,
          assignedTo: '0x9876543210987654321098765432109876543210',
          createdAt: new Date(Date.now() - 86400000 * 10),
          scheduledDate: new Date(Date.now() - 86400000 * 3),
          completedAt: new Date(Date.now() - 86400000 * 2),
          estimatedCost: '0.25',
          actualCost: '0.22',
          images: ['ipfs://maintenance2', 'ipfs://maintenance3'],
          notes: [
            { author: 'Service Provider', text: 'Replaced filters and cleaned ducts', timestamp: new Date(Date.now() - 86400000 * 2) }
          ]
        }
      ];

      // Mock maintenance schedule
      const mockSchedule = [
        {
          id: 'sched1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          category: 'hvac',
          title: 'HVAC Filter Replacement',
          frequency: 'quarterly',
          nextDue: new Date(Date.now() + 86400000 * 30),
          lastCompleted: new Date(Date.now() - 86400000 * 60),
          estimatedCost: '0.05',
          priority: 'medium'
        },
        {
          id: 'sched2',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          category: 'cleaning',
          title: 'Deep Cleaning Service',
          frequency: 'monthly',
          nextDue: new Date(Date.now() + 86400000 * 15),
          lastCompleted: new Date(Date.now() - 86400000 * 15),
          estimatedCost: '0.12',
          priority: 'low'
        }
      ];

      // Mock service providers
      const mockProviders = [
        {
          id: 'provider1',
          name: 'QuickFix Plumbing',
          category: 'plumbing',
          rating: 4.8,
          completedJobs: 156,
          averageResponse: '2 hours',
          hourlyRate: '0.02',
          address: '0x1111222233334444555566667777888899990000',
          verified: true,
          specialties: ['Emergency Repairs', 'Pipe Installation', 'Drain Cleaning']
        },
        {
          id: 'provider2',
          name: 'ElectroMax Services',
          category: 'electrical',
          rating: 4.9,
          completedJobs: 203,
          averageResponse: '4 hours',
          hourlyRate: '0.025',
          address: '0x2222333344445555666677778888999900001111',
          verified: true,
          specialties: ['Wiring', 'Panel Upgrades', 'Smart Home Installation']
        },
        {
          id: 'provider3',
          name: 'CoolAir HVAC',
          category: 'hvac',
          rating: 4.7,
          completedJobs: 89,
          averageResponse: '6 hours',
          hourlyRate: '0.03',
          address: '0x3333444455556666777788889999000011112222',
          verified: true,
          specialties: ['AC Repair', 'Heating Systems', 'Duct Cleaning']
        }
      ];

      setServiceRequests(mockRequests);
      setMaintenanceSchedule(mockSchedule);
      setServiceProviders(mockProviders);
      
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      setError('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError('');

      // Validate form
      if (!newRequest.propertyId || !newRequest.title || !newRequest.description) {
        throw new Error('Please fill in all required fields');
      }

      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      const request = {
        id: Date.now().toString(),
        propertyId: newRequest.propertyId,
        propertyLocation: properties.find(p => p.id === newRequest.propertyId)?.location || 'Unknown Location',
        category: newRequest.category,
        priority: newRequest.priority,
        title: newRequest.title,
        description: newRequest.description,
        status: 'open',
        requestedBy: userAddress,
        assignedTo: null,
        createdAt: new Date(),
        scheduledDate: newRequest.preferredDate ? new Date(newRequest.preferredDate) : null,
        completedAt: null,
        estimatedCost: newRequest.budget || '0',
        actualCost: null,
        images: newRequest.images,
        notes: []
      };

      setServiceRequests(prev => [request, ...prev]);
      setShowCreateForm(false);
      setNewRequest({
        propertyId: '',
        category: 'plumbing',
        priority: 'medium',
        title: '',
        description: '',
        preferredDate: '',
        budget: '',
        images: []
      });

      alert('Service request created successfully!');
      
    } catch (error) {
      console.error('Error creating request:', error);
      setError(error.message || 'Failed to create service request');
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'open': return 'bg-warning';
      case 'assigned': return 'bg-info';
      case 'in-progress': return 'bg-primary';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const ServiceRequestCard = ({ request }) => (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-0">{request.title}</h6>
          <small className="text-muted">{request.propertyLocation}</small>
        </div>
        <div>
          <span className={`badge ${getStatusBadgeClass(request.status)} me-2`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
          <span className={`badge ${getPriorityBadgeClass(request.priority)}`}>
            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
          </span>
        </div>
      </div>
      <div className="card-body">
        <p className="card-text">{request.description}</p>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <small className="text-muted">
              <strong>Category:</strong> {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
            </small>
          </div>
          <div className="col-md-6">
            <small className="text-muted">
              <strong>Created:</strong> {timeAgo(request.createdAt)}
            </small>
          </div>
          <div className="col-md-6">
            <small className="text-muted">
              <strong>Estimated Cost:</strong> {request.estimatedCost} ETH
            </small>
          </div>
          {request.scheduledDate && (
            <div className="col-md-6">
              <small className="text-muted">
                <strong>Scheduled:</strong> {request.scheduledDate.toLocaleDateString()}
              </small>
            </div>
          )}
        </div>

        {request.assignedTo && (
          <div className="mb-3">
            <small className="text-muted">
              <strong>Assigned to:</strong> {formatAddress(request.assignedTo)}
            </small>
          </div>
        )}

        {request.notes.length > 0 && (
          <div className="mb-3">
            <h6>Notes:</h6>
            {request.notes.map((note, index) => (
              <div key={index} className="border-start border-3 border-info ps-3 mb-2">
                <small>
                  <strong>{note.author}:</strong> {note.text}
                  <br />
                  <span className="text-muted">{timeAgo(note.timestamp)}</span>
                </small>
              </div>
            ))}
          </div>
        )}

        {request.status === 'open' && (
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm">
              <i className="bi bi-person-plus me-1"></i>
              Assign Provider
            </button>
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-pencil me-1"></i>
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const ScheduleItem = ({ item }) => {
    const daysUntilDue = Math.ceil((item.nextDue - new Date()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0;
    const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

    return (
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="card-title">{item.title}</h6>
              <p className="card-text">
                <small className="text-muted">{item.propertyLocation}</small>
              </p>
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">
                    <strong>Frequency:</strong> {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
                  </small>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">
                    <strong>Estimated Cost:</strong> {item.estimatedCost} ETH
                  </small>
                </div>
              </div>
            </div>
            <div className="text-end">
              <div className={`badge ${isOverdue ? 'bg-danger' : isDueSoon ? 'bg-warning' : 'bg-success'} mb-2`}>
                {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` :
                 isDueSoon ? `Due in ${daysUntilDue} days` :
                 `Due in ${daysUntilDue} days`}
              </div>
              <br />
              <small className="text-muted">
                Last: {item.lastCompleted.toLocaleDateString()}
              </small>
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-primary btn-sm me-2">
              <i className="bi bi-calendar-plus me-1"></i>
              Schedule Now
            </button>
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-gear me-1"></i>
              Configure
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ProviderCard = ({ provider }) => (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="card-title">
              {provider.name}
              {provider.verified && (
                <i className="bi bi-patch-check-fill text-primary ms-2"></i>
              )}
            </h6>
            <p className="card-text">
              <span className="badge bg-secondary me-2">
                {provider.category.charAt(0).toUpperCase() + provider.category.slice(1)}
              </span>
              <small className="text-muted">
                ⭐ {provider.rating} ({provider.completedJobs} jobs)
              </small>
            </p>
            <div className="mb-2">
              <small className="text-muted">
                <strong>Response Time:</strong> {provider.averageResponse} • 
                <strong> Rate:</strong> {provider.hourlyRate} ETH/hour
              </small>
            </div>
            <div className="d-flex flex-wrap gap-1">
              {provider.specialties.map(specialty => (
                <span key={specialty} className="badge bg-light text-dark">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
          <div>
            <button className="btn btn-primary btn-sm">
              <i className="bi bi-person-plus me-1"></i>
              Hire
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner message="Loading maintenance data..." />;
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-tools me-2"></i>
                Property Maintenance
              </h2>
              <p className="text-muted">Manage service requests and maintenance schedules</p>
            </div>
            <button
              className="btn btn-success"
              onClick={() => setShowCreateForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              New Service Request
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Service Requests ({serviceRequests.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Maintenance Schedule ({maintenanceSchedule.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'providers' ? 'active' : ''}`}
            onClick={() => setActiveTab('providers')}
          >
            Service Providers ({serviceProviders.length})
          </button>
        </li>
      </ul>

      {/* Error Display */}
      {error && (
        <ErrorMessage error={error} onRetry={loadMaintenanceData} />
      )}

      {/* Create Request Modal */}
      {showCreateForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Service Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateForm(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateRequest}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="propertyId" className="form-label">Property *</label>
                        <select
                          className="form-select"
                          id="propertyId"
                          value={newRequest.propertyId}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, propertyId: e.target.value }))}
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
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="category" className="form-label">Category</label>
                        <select
                          className="form-select"
                          id="category"
                          value={newRequest.category}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, category: e.target.value }))}
                        >
                          <option value="plumbing">Plumbing</option>
                          <option value="electrical">Electrical</option>
                          <option value="hvac">HVAC</option>
                          <option value="cleaning">Cleaning</option>
                          <option value="landscaping">Landscaping</option>
                          <option value="security">Security</option>
                          <option value="general">General Maintenance</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="priority" className="form-label">Priority</label>
                        <select
                          className="form-select"
                          id="priority"
                          value={newRequest.priority}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value }))}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="emergency">Emergency</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="budget" className="form-label">Budget (ETH)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="budget"
                          step="0.01"
                          value={newRequest.budget}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, budget: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">Title *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="title"
                          value={newRequest.title}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description *</label>
                        <textarea
                          className="form-control"
                          id="description"
                          rows="4"
                          value={newRequest.description}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="preferredDate" className="form-label">Preferred Date</label>
                        <input
                          type="date"
                          className="form-control"
                          id="preferredDate"
                          value={newRequest.preferredDate}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, preferredDate: e.target.value }))}
                        />
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
                      'Create Request'
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
        {activeTab === 'requests' && (
          <div>
            {serviceRequests.length > 0 ? (
              serviceRequests.map(request => (
                <ServiceRequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-tools display-1 text-muted"></i>
                <h3 className="mt-3">No Service Requests</h3>
                <p className="text-muted">Create your first service request to get started.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Service Request
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            {maintenanceSchedule.length > 0 ? (
              maintenanceSchedule.map(item => (
                <ScheduleItem key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-calendar-check display-1 text-muted"></i>
                <h3 className="mt-3">No Scheduled Maintenance</h3>
                <p className="text-muted">Set up maintenance schedules for your properties.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'providers' && (
          <div>
            {serviceProviders.length > 0 ? (
              serviceProviders.map(provider => (
                <ProviderCard key={provider.id} provider={provider} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-people display-1 text-muted"></i>
                <h3 className="mt-3">No Service Providers</h3>
                <p className="text-muted">No service providers available in your area.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyMaintenance;
