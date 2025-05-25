import React, { useState, useEffect } from 'react';
import { formatAddress, timeAgo } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const PropertySecurity = ({ userAddress, properties = [] }) => {
  const [securityData, setSecurityData] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddDevice, setShowAddDevice] = useState(false);

  const [newDevice, setNewDevice] = useState({
    propertyId: '',
    deviceType: 'camera',
    name: '',
    location: '',
    accessLevel: 'owner'
  });

  useEffect(() => {
    loadSecurityData();
  }, [userAddress]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock security data
      const mockSecurityData = [
        {
          id: '1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          securityLevel: 'High',
          lastUpdate: new Date(Date.now() - 86400000 * 1),
          activeDevices: 8,
          alerts: 2,
          accessPoints: 4,
          status: 'armed',
          features: ['24/7 Monitoring', 'Motion Detection', 'Smart Locks', 'Video Surveillance']
        },
        {
          id: '2',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          securityLevel: 'Premium',
          lastUpdate: new Date(Date.now() - 86400000 * 0.5),
          activeDevices: 12,
          alerts: 0,
          accessPoints: 6,
          status: 'armed',
          features: ['AI-Powered Analytics', 'Facial Recognition', 'Smart Home Integration', 'Professional Monitoring']
        }
      ];

      // Mock access logs
      const mockAccessLogs = [
        {
          id: 'log1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          timestamp: new Date(Date.now() - 86400000 * 0.1),
          accessType: 'entry',
          method: 'smart-lock',
          user: userAddress,
          location: 'Front Door',
          status: 'granted',
          deviceId: 'lock_001'
        },
        {
          id: 'log2',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          timestamp: new Date(Date.now() - 86400000 * 0.5),
          accessType: 'motion',
          method: 'camera',
          user: 'Unknown',
          location: 'Backyard',
          status: 'detected',
          deviceId: 'cam_003'
        },
        {
          id: 'log3',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          timestamp: new Date(Date.now() - 86400000 * 1),
          accessType: 'entry',
          method: 'keypad',
          user: 'Service Provider',
          location: 'Side Entrance',
          status: 'granted',
          deviceId: 'keypad_002'
        }
      ];

      // Mock alerts
      const mockAlerts = [
        {
          id: 'alert1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          type: 'motion',
          severity: 'medium',
          title: 'Unusual Motion Detected',
          description: 'Motion detected in backyard area outside normal hours',
          timestamp: new Date(Date.now() - 86400000 * 0.2),
          status: 'active',
          deviceId: 'cam_003',
          actions: ['View Recording', 'Dismiss', 'Contact Security']
        },
        {
          id: 'alert2',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          type: 'access',
          severity: 'low',
          title: 'Failed Access Attempt',
          description: 'Invalid code entered at front door keypad',
          timestamp: new Date(Date.now() - 86400000 * 2),
          status: 'resolved',
          deviceId: 'keypad_001',
          actions: ['View Details', 'Archive']
        }
      ];

      // Mock devices
      const mockDevices = [
        {
          id: 'cam_001',
          propertyId: '1',
          type: 'camera',
          name: 'Front Door Camera',
          location: 'Main Entrance',
          status: 'online',
          lastSeen: new Date(Date.now() - 300000),
          batteryLevel: 85,
          features: ['HD Video', 'Night Vision', 'Motion Detection'],
          accessLevel: 'owner'
        },
        {
          id: 'lock_001',
          propertyId: '1',
          type: 'smart-lock',
          name: 'Front Door Lock',
          location: 'Main Entrance',
          status: 'online',
          lastSeen: new Date(Date.now() - 60000),
          batteryLevel: 92,
          features: ['Keypad', 'Bluetooth', 'Auto-Lock'],
          accessLevel: 'owner'
        },
        {
          id: 'sensor_001',
          propertyId: '1',
          type: 'motion-sensor',
          name: 'Living Room Sensor',
          location: 'Living Room',
          status: 'online',
          lastSeen: new Date(Date.now() - 120000),
          batteryLevel: 78,
          features: ['PIR Detection', 'Pet Immune', 'Wireless'],
          accessLevel: 'owner'
        },
        {
          id: 'cam_002',
          propertyId: '2',
          type: 'camera',
          name: 'Driveway Camera',
          location: 'Driveway',
          status: 'online',
          lastSeen: new Date(Date.now() - 180000),
          batteryLevel: 95,
          features: ['4K Video', 'AI Analytics', 'License Plate Recognition'],
          accessLevel: 'owner'
        }
      ];

      setSecurityData(mockSecurityData);
      setAccessLogs(mockAccessLogs);
      setAlerts(mockAlerts);
      setDevices(mockDevices);
      
    } catch (error) {
      console.error('Error loading security data:', error);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      setError('');

      // Validate form
      if (!newDevice.propertyId || !newDevice.name || !newDevice.location) {
        throw new Error('Please fill in all required fields');
      }

      // Simulate device registration
      await new Promise(resolve => setTimeout(resolve, 1500));

      const device = {
        id: `${newDevice.deviceType}_${Date.now()}`,
        propertyId: newDevice.propertyId,
        type: newDevice.deviceType,
        name: newDevice.name,
        location: newDevice.location,
        status: 'online',
        lastSeen: new Date(),
        batteryLevel: Math.floor(Math.random() * 20) + 80,
        features: getDeviceFeatures(newDevice.deviceType),
        accessLevel: newDevice.accessLevel
      };

      setDevices(prev => [device, ...prev]);
      setShowAddDevice(false);
      setNewDevice({
        propertyId: '',
        deviceType: 'camera',
        name: '',
        location: '',
        accessLevel: 'owner'
      });

      alert('Device added successfully!');
      
    } catch (error) {
      console.error('Error adding device:', error);
      setError(error.message || 'Failed to add device');
    }
  };

  const handleDismissAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' }
        : alert
    ));
  };

  const getDeviceFeatures = (deviceType) => {
    const features = {
      'camera': ['HD Video', 'Motion Detection', 'Night Vision'],
      'smart-lock': ['Keypad', 'Bluetooth', 'Auto-Lock'],
      'motion-sensor': ['PIR Detection', 'Wireless', 'Pet Immune'],
      'door-sensor': ['Magnetic Contact', 'Tamper Detection', 'Wireless'],
      'alarm': ['Siren', 'Strobe Light', 'Remote Control']
    };
    return features[deviceType] || ['Basic Features'];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'danger';
      case 'armed': return 'primary';
      case 'disarmed': return 'warning';
      case 'active': return 'warning';
      case 'resolved': return 'success';
      case 'granted': return 'success';
      case 'denied': return 'danger';
      case 'detected': return 'info';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const SecurityOverviewCard = ({ security }) => (
    <div className="card mb-4">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{security.propertyLocation}</h6>
          <span className={`badge bg-${getStatusColor(security.status)}`}>
            {security.status.charAt(0).toUpperCase() + security.status.slice(1)}
          </span>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <h5 className="text-primary">{security.securityLevel}</h5>
              <small className="text-muted">Security Level</small>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Active Devices:</span>
                <span className="text-success">{security.activeDevices}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Access Points:</span>
                <span>{security.accessPoints}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Active Alerts:</span>
                <span className={security.alerts > 0 ? 'text-warning' : 'text-success'}>
                  {security.alerts}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <h6>Security Features</h6>
            <div className="d-flex flex-wrap gap-1">
              {security.features.map(feature => (
                <span key={feature} className="badge bg-light text-dark">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <small className="text-muted">
            Last Update: {timeAgo(security.lastUpdate)}
          </small>
        </div>
      </div>
    </div>
  );

  const AccessLogRow = ({ log }) => (
    <tr>
      <td>{log.propertyLocation}</td>
      <td>
        <span className="text-capitalize">{log.accessType}</span>
        <br />
        <small className="text-muted">{log.method}</small>
      </td>
      <td>{log.location}</td>
      <td>
        {log.user === userAddress ? 'You' : 
         log.user.startsWith('0x') ? formatAddress(log.user) : log.user}
      </td>
      <td>
        <span className={`badge bg-${getStatusColor(log.status)}`}>
          {log.status}
        </span>
      </td>
      <td>{timeAgo(log.timestamp)}</td>
    </tr>
  );

  const AlertCard = ({ alert }) => (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <span className={`badge bg-${getSeverityColor(alert.severity)} me-2`}>
                {alert.severity.toUpperCase()}
              </span>
              <h6 className="mb-0">{alert.title}</h6>
            </div>
            <p className="card-text">{alert.description}</p>
            <small className="text-muted">
              {alert.propertyLocation} • {timeAgo(alert.timestamp)}
            </small>
          </div>
          <div className="ms-3">
            <span className={`badge bg-${getStatusColor(alert.status)}`}>
              {alert.status}
            </span>
          </div>
        </div>
        {alert.status === 'active' && (
          <div className="mt-3">
            <div className="btn-group btn-group-sm">
              {alert.actions.map(action => (
                <button
                  key={action}
                  className="btn btn-outline-primary"
                  onClick={() => action === 'Dismiss' ? handleDismissAlert(alert.id) : null}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const DeviceCard = ({ device }) => (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <i className={`bi ${getDeviceIcon(device.type)} me-2 text-primary`}></i>
              <h6 className="mb-0">{device.name}</h6>
              <span className={`badge bg-${getStatusColor(device.status)} ms-2`}>
                {device.status}
              </span>
            </div>
            <p className="card-text">
              <small className="text-muted">{device.location}</small>
            </p>
            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <span>Battery Level:</span>
                <div className="d-flex align-items-center">
                  <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                    <div
                      className={`progress-bar ${device.batteryLevel > 20 ? 'bg-success' : 'bg-danger'}`}
                      style={{ width: `${device.batteryLevel}%` }}
                    ></div>
                  </div>
                  <small>{device.batteryLevel}%</small>
                </div>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-1">
              {device.features.map(feature => (
                <span key={feature} className="badge bg-light text-dark">
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <div className="ms-3">
            <button className="btn btn-outline-primary btn-sm">
              <i className="bi bi-gear"></i>
            </button>
          </div>
        </div>
        <div className="mt-2">
          <small className="text-muted">
            Last seen: {timeAgo(device.lastSeen)}
          </small>
        </div>
      </div>
    </div>
  );

  const getDeviceIcon = (type) => {
    const icons = {
      'camera': 'bi-camera-video',
      'smart-lock': 'bi-lock',
      'motion-sensor': 'bi-radar',
      'door-sensor': 'bi-door-open',
      'alarm': 'bi-exclamation-triangle'
    };
    return icons[type] || 'bi-device-hdd';
  };

  if (loading) {
    return <LoadingSpinner message="Loading security data..." />;
  }

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(device => device.status === 'online').length;

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-shield-lock me-2"></i>
                Property Security
              </h2>
              <p className="text-muted">Monitor and manage property security systems</p>
            </div>
            <button
              className="btn btn-success"
              onClick={() => setShowAddDevice(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add Device
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-warning">{activeAlerts.length}</h4>
              <small className="text-muted">Active Alerts</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-success">{onlineDevices}</h4>
              <small className="text-muted">Online Devices</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-info">{totalDevices}</h4>
              <small className="text-muted">Total Devices</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-primary">{securityData.length}</h4>
              <small className="text-muted">Protected Properties</small>
            </div>
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
            Security Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts ({alerts.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveTab('devices')}
          >
            Devices ({devices.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'access-logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('access-logs')}
          >
            Access Logs ({accessLogs.length})
          </button>
        </li>
      </ul>

      {/* Error Display */}
      {error && (
        <ErrorMessage error={error} onRetry={loadSecurityData} />
      )}

      {/* Add Device Modal */}
      {showAddDevice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Security Device</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddDevice(false)}
                ></button>
              </div>
              <form onSubmit={handleAddDevice}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="propertyId" className="form-label">Property *</label>
                    <select
                      className="form-select"
                      id="propertyId"
                      value={newDevice.propertyId}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, propertyId: e.target.value }))}
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
                    <label htmlFor="deviceType" className="form-label">Device Type</label>
                    <select
                      className="form-select"
                      id="deviceType"
                      value={newDevice.deviceType}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, deviceType: e.target.value }))}
                    >
                      <option value="camera">Security Camera</option>
                      <option value="smart-lock">Smart Lock</option>
                      <option value="motion-sensor">Motion Sensor</option>
                      <option value="door-sensor">Door Sensor</option>
                      <option value="alarm">Alarm System</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Device Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={newDevice.name}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      value={newDevice.location}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Front Door, Living Room, Backyard"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="accessLevel" className="form-label">Access Level</label>
                    <select
                      className="form-select"
                      id="accessLevel"
                      value={newDevice.accessLevel}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, accessLevel: e.target.value }))}
                    >
                      <option value="owner">Owner Only</option>
                      <option value="tenant">Owner & Tenant</option>
                      <option value="service">Service Providers</option>
                      <option value="guest">Guest Access</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddDevice(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                  >
                    Add Device
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
            {securityData.length > 0 ? (
              securityData.map(security => (
                <SecurityOverviewCard key={security.id} security={security} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-shield-exclamation display-1 text-muted"></i>
                <h3 className="mt-3">No Security Systems</h3>
                <p className="text-muted">No security systems configured for your properties.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div>
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-shield-check display-1 text-muted"></i>
                <h3 className="mt-3">No Security Alerts</h3>
                <p className="text-muted">All security systems are functioning normally.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'devices' && (
          <div>
            {devices.length > 0 ? (
              <div className="row">
                {devices.map(device => (
                  <div key={device.id} className="col-lg-6">
                    <DeviceCard device={device} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-device-hdd display-1 text-muted"></i>
                <h3 className="mt-3">No Security Devices</h3>
                <p className="text-muted">Add your first security device to get started.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddDevice(true)}
                >
                  Add Device
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'access-logs' && (
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Access Logs</h6>
            </div>
            <div className="card-body">
              {accessLogs.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Access Type</th>
                        <th>Location</th>
                        <th>User</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessLogs.map(log => (
                        <AccessLogRow key={log.id} log={log} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-list-ul display-1 text-muted"></i>
                  <h4 className="mt-3">No Access Logs</h4>
                  <p className="text-muted">No access activity recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertySecurity;
