import React, { useState, useEffect } from 'react';
import { formatAddress, formatEther, saveToStorage, loadFromStorage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

const UserProfile = ({ userAddress, signer, onProfileUpdate }) => {
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
    isVerifier: false,
    isPublic: true,
    notifications: {
      email: true,
      browser: true,
      transactions: true,
      properties: true,
      verifications: true
    },
    preferences: {
      currency: 'ETH',
      language: 'en',
      theme: 'light',
      dateFormat: 'MM/DD/YYYY',
      timezone: 'UTC'
    }
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    propertiesOwned: 0,
    propertiesVerified: 0,
    transactionsCompleted: 0,
    totalVolume: 0,
    memberSince: null
  });

  useEffect(() => {
    if (userAddress) {
      loadUserProfile();
      loadUserStats();
    }
  }, [userAddress]);

  const loadUserProfile = () => {
    // Load profile from local storage
    const savedProfile = loadFromStorage(`${STORAGE_KEYS.USER_PREFERENCES}_${userAddress}`);
    if (savedProfile) {
      setProfile(prev => ({ ...prev, ...savedProfile }));
    }
  };

  const loadUserStats = async () => {
    try {
      // In a real implementation, this would fetch from blockchain/backend
      // For demo purposes, we'll use mock data
      const mockStats = {
        propertiesOwned: Math.floor(Math.random() * 10) + 1,
        propertiesVerified: Math.floor(Math.random() * 50) + 5,
        transactionsCompleted: Math.floor(Math.random() * 20) + 2,
        totalVolume: (Math.random() * 1000 + 100).toFixed(2),
        memberSince: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, key] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Save to local storage
      saveToStorage(`${STORAGE_KEYS.USER_PREFERENCES}_${userAddress}`, profile);
      
      // In a real implementation, you might also save to IPFS or a backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save delay
      
      setEditing(false);
      
      if (onProfileUpdate) {
        onProfileUpdate(profile);
      }
      
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile(prev => ({
          ...prev,
          avatar: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <div className="col-md-3 mb-3">
      <div className="card text-center">
        <div className="card-body">
          <i className={`bi ${icon} text-${color} fs-1`}></i>
          <h4 className="mt-2">{value}</h4>
          <p className="text-muted mb-0">{title}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Profile Header */}
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-2 text-center">
                  <div className="position-relative">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Avatar"
                        className="rounded-circle"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                        style={{ width: '100px', height: '100px' }}
                      >
                        <i className="bi bi-person-fill text-white fs-1"></i>
                      </div>
                    )}
                    {editing && (
                      <div className="position-absolute bottom-0 end-0">
                        <label htmlFor="avatarUpload" className="btn btn-sm btn-primary rounded-circle">
                          <i className="bi bi-camera"></i>
                        </label>
                        <input
                          type="file"
                          id="avatarUpload"
                          className="d-none"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-8">
                  <h2>
                    {profile.displayName || 'Anonymous User'}
                    {profile.isVerifier && (
                      <span className="badge bg-success ms-2">Verified</span>
                    )}
                  </h2>
                  <p className="text-muted mb-2">
                    <i className="bi bi-wallet2 me-2"></i>
                    {formatAddress(userAddress)}
                  </p>
                  {profile.bio && (
                    <p className="mb-2">{profile.bio}</p>
                  )}
                  <p className="text-muted mb-0">
                    <i className="bi bi-calendar me-2"></i>
                    Member since {stats.memberSince?.toLocaleDateString()}
                  </p>
                </div>
                <div className="col-md-2 text-end">
                  {!editing ? (
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setEditing(true)}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Edit Profile
                    </button>
                  ) : (
                    <div>
                      <button
                        className="btn btn-success me-2"
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check me-2"></i>
                            Save
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setEditing(false)}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="col-12 mb-4">
          <h4>Statistics</h4>
          <div className="row">
            <StatCard
              title="Properties Owned"
              value={stats.propertiesOwned}
              icon="bi-house"
              color="primary"
            />
            <StatCard
              title="Properties Verified"
              value={stats.propertiesVerified}
              icon="bi-shield-check"
              color="success"
            />
            <StatCard
              title="Transactions"
              value={stats.transactionsCompleted}
              icon="bi-arrow-left-right"
              color="info"
            />
            <StatCard
              title="Total Volume"
              value={formatEther(stats.totalVolume)}
              icon="bi-currency-dollar"
              color="warning"
            />
          </div>
        </div>

        {/* Profile Information */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Profile Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="displayName" className="form-label">Display Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="displayName"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="location" className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={profile.location}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="bio" className="form-label">Bio</label>
                <textarea
                  className="form-control"
                  id="bio"
                  name="bio"
                  rows="3"
                  value={profile.bio}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={profile.isPublic}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
                <label className="form-check-label" htmlFor="isPublic">
                  Make profile public
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Settings & Preferences</h5>
            </div>
            <div className="card-body">
              <h6>Notifications</h6>
              <div className="mb-3">
                {Object.entries(profile.notifications).map(([key, value]) => (
                  <div key={key} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`notifications.${key}`}
                      name={`notifications.${key}`}
                      checked={value}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                    <label className="form-check-label" htmlFor={`notifications.${key}`}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} notifications
                    </label>
                  </div>
                ))}
              </div>

              <h6>Preferences</h6>
              <div className="mb-3">
                <label htmlFor="preferences.currency" className="form-label">Currency</label>
                <select
                  className="form-select"
                  id="preferences.currency"
                  name="preferences.currency"
                  value={profile.preferences.currency}
                  onChange={handleInputChange}
                  disabled={!editing}
                >
                  <option value="ETH">ETH</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="preferences.theme" className="form-label">Theme</label>
                <select
                  className="form-select"
                  id="preferences.theme"
                  name="preferences.theme"
                  value={profile.preferences.theme}
                  onChange={handleInputChange}
                  disabled={!editing}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="preferences.language" className="form-label">Language</label>
                <select
                  className="form-select"
                  id="preferences.language"
                  name="preferences.language"
                  value={profile.preferences.language}
                  onChange={handleInputChange}
                  disabled={!editing}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
