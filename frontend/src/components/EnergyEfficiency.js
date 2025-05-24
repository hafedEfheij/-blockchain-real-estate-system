import React, { useState, useEffect } from 'react';
import { formatNumber } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

const EnergyEfficiency = ({ userAddress, properties = [] }) => {
  const [energyData, setEnergyData] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadEnergyData();
  }, [userAddress]);

  const loadEnergyData = async () => {
    try {
      setLoading(true);
      
      // Mock energy efficiency data
      const mockEnergyData = [
        {
          id: '1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          energyRating: 'B',
          energyScore: 78,
          annualConsumption: 45000, // kWh
          carbonFootprint: 18.5, // tons CO2
          monthlyUtilityCost: 380,
          lastAudit: new Date(Date.now() - 86400000 * 120),
          nextAudit: new Date(Date.now() + 86400000 * 245),
          improvements: [
            { item: 'LED Lighting Upgrade', status: 'completed', savings: 15, cost: 2500 },
            { item: 'Smart Thermostat', status: 'completed', savings: 12, cost: 800 },
            { item: 'Window Insulation', status: 'planned', savings: 20, cost: 5000 }
          ],
          metrics: {
            heating: 35,
            cooling: 25,
            lighting: 20,
            appliances: 15,
            other: 5
          }
        },
        {
          id: '2',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          energyRating: 'A',
          energyScore: 92,
          annualConsumption: 28000,
          carbonFootprint: 8.2,
          monthlyUtilityCost: 220,
          lastAudit: new Date(Date.now() - 86400000 * 60),
          nextAudit: new Date(Date.now() + 86400000 * 305),
          improvements: [
            { item: 'Solar Panel Installation', status: 'completed', savings: 45, cost: 15000 },
            { item: 'Energy-Efficient HVAC', status: 'completed', savings: 30, cost: 8000 },
            { item: 'Smart Home System', status: 'completed', savings: 18, cost: 3500 }
          ],
          metrics: {
            heating: 20,
            cooling: 30,
            lighting: 15,
            appliances: 25,
            other: 10
          }
        }
      ];

      // Mock certifications
      const mockCertifications = [
        {
          id: 'cert1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          type: 'ENERGY STAR',
          level: 'Certified',
          score: 78,
          issueDate: new Date(Date.now() - 86400000 * 365),
          expiryDate: new Date(Date.now() + 86400000 * 730),
          status: 'active',
          benefits: ['Tax Credits', 'Insurance Discounts', 'Market Value Increase']
        },
        {
          id: 'cert2',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          type: 'LEED',
          level: 'Gold',
          score: 92,
          issueDate: new Date(Date.now() - 86400000 * 180),
          expiryDate: new Date(Date.now() + 86400000 * 1825),
          status: 'active',
          benefits: ['Premium Rent', 'Tax Incentives', 'Carbon Credits', 'Brand Recognition']
        }
      ];

      // Mock recommendations
      const mockRecommendations = [
        {
          id: 'rec1',
          propertyId: '1',
          category: 'lighting',
          title: 'Upgrade to Smart LED System',
          description: 'Replace remaining fluorescent lights with smart LED system',
          estimatedSavings: 25,
          implementationCost: 3500,
          paybackPeriod: 2.1,
          priority: 'high',
          carbonReduction: 2.8,
          difficulty: 'medium'
        },
        {
          id: 'rec2',
          propertyId: '1',
          category: 'insulation',
          title: 'Improve Building Envelope',
          description: 'Add insulation to walls and roof to reduce heating/cooling costs',
          estimatedSavings: 35,
          implementationCost: 8000,
          paybackPeriod: 3.2,
          priority: 'medium',
          carbonReduction: 4.5,
          difficulty: 'high'
        },
        {
          id: 'rec3',
          propertyId: '2',
          category: 'renewable',
          title: 'Battery Storage System',
          description: 'Add battery storage to existing solar panel system',
          estimatedSavings: 15,
          implementationCost: 12000,
          paybackPeriod: 4.8,
          priority: 'low',
          carbonReduction: 1.2,
          difficulty: 'high'
        }
      ];

      setEnergyData(mockEnergyData);
      setCertifications(mockCertifications);
      setRecommendations(mockRecommendations);
      
    } catch (error) {
      console.error('Error loading energy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEnergyRatingColor = (rating) => {
    const colors = {
      'A+': 'success',
      'A': 'success',
      'B': 'info',
      'C': 'warning',
      'D': 'warning',
      'E': 'danger',
      'F': 'danger',
      'G': 'danger'
    };
    return colors[rating] || 'secondary';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const EnergyOverviewCard = ({ energy }) => (
    <div className="card mb-4">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{energy.propertyLocation}</h6>
          <span className={`badge bg-${getEnergyRatingColor(energy.energyRating)} fs-6`}>
            {energy.energyRating} Rating
          </span>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <h4 className="text-primary">{energy.energyScore}/100</h4>
              <small className="text-muted">Energy Efficiency Score</small>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Annual Consumption:</span>
                <span>{formatNumber(energy.annualConsumption)} kWh</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Carbon Footprint:</span>
                <span>{energy.carbonFootprint} tons CO₂</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Monthly Utility Cost:</span>
                <span>${formatNumber(energy.monthlyUtilityCost)}</span>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <h6>Energy Usage Breakdown</h6>
            <div className="mb-2">
              {Object.entries(energy.metrics).map(([category, percentage]) => (
                <div key={category} className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-capitalize">{category}</small>
                    <small>{percentage}%</small>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-12">
            <h6>Energy Improvements</h6>
            <div className="row">
              {energy.improvements.map((improvement, index) => (
                <div key={index} className="col-md-4 mb-2">
                  <div className="card border-0 bg-light">
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="fw-bold">{improvement.item}</small>
                        <span className={`badge bg-${improvement.status === 'completed' ? 'success' : 'warning'}`}>
                          {improvement.status}
                        </span>
                      </div>
                      <small className="text-muted">
                        {improvement.savings}% savings • ${formatNumber(improvement.cost)}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <small className="text-muted">
            Last Audit: {energy.lastAudit.toLocaleDateString()} • 
            Next Audit: {energy.nextAudit.toLocaleDateString()}
          </small>
        </div>
      </div>
    </div>
  );

  const CertificationCard = ({ cert }) => {
    const daysUntilExpiry = Math.ceil((cert.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry <= 90;

    return (
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="card-title">
                {cert.type} - {cert.level}
                <span className="badge bg-success ms-2">{cert.status}</span>
              </h6>
              <p className="card-text">
                <small className="text-muted">{cert.propertyLocation}</small>
              </p>
              <div className="mb-3">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <div className="badge bg-primary fs-6">{cert.score}</div>
                  </div>
                  <div>
                    <small className="text-muted">Certification Score</small>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <h6>Benefits:</h6>
                <div className="d-flex flex-wrap gap-1">
                  {cert.benefits.map(benefit => (
                    <span key={benefit} className="badge bg-light text-dark">{benefit}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-end">
              <small className={`text-${isExpiringSoon ? 'warning' : 'muted'}`}>
                Expires: {cert.expiryDate.toLocaleDateString()}
                {isExpiringSoon && (
                  <>
                    <br />
                    <span className="text-warning">
                      <i className="bi bi-exclamation-triangle"></i> Expires in {daysUntilExpiry} days
                    </span>
                  </>
                )}
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RecommendationCard = ({ rec }) => (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <h6 className="card-title">
              {rec.title}
              <span className={`badge bg-${getPriorityColor(rec.priority)} ms-2`}>
                {rec.priority} priority
              </span>
            </h6>
            <p className="card-text">{rec.description}</p>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-2">
                  <small className="text-muted">
                    <strong>Estimated Savings:</strong> {rec.estimatedSavings}% annually
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-muted">
                    <strong>Implementation Cost:</strong> ${formatNumber(rec.implementationCost)}
                  </small>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-2">
                  <small className="text-muted">
                    <strong>Payback Period:</strong> {rec.paybackPeriod} years
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-muted">
                    <strong>Carbon Reduction:</strong> {rec.carbonReduction} tons CO₂/year
                  </small>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <span className="badge bg-secondary me-2">
                {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}
              </span>
              <span className={`badge bg-${rec.difficulty === 'high' ? 'danger' : rec.difficulty === 'medium' ? 'warning' : 'success'}`}>
                {rec.difficulty} difficulty
              </span>
            </div>
          </div>
          <div className="ms-3">
            <button className="btn btn-primary btn-sm">
              <i className="bi bi-plus-circle me-1"></i>
              Implement
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner message="Loading energy efficiency data..." />;
  }

  const totalConsumption = energyData.reduce((sum, energy) => sum + energy.annualConsumption, 0);
  const totalCarbonFootprint = energyData.reduce((sum, energy) => sum + energy.carbonFootprint, 0);
  const averageScore = energyData.length > 0 ? 
    energyData.reduce((sum, energy) => sum + energy.energyScore, 0) / energyData.length : 0;

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h2>
            <i className="bi bi-lightning-charge me-2"></i>
            Energy Efficiency Tracking
          </h2>
          <p className="text-muted">Monitor and improve your properties' energy performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-primary">{averageScore.toFixed(0)}</h4>
              <small className="text-muted">Average Energy Score</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-warning">{formatNumber(totalConsumption)}</h4>
              <small className="text-muted">Total kWh/Year</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-danger">{totalCarbonFootprint.toFixed(1)}</h4>
              <small className="text-muted">Tons CO₂/Year</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-success">{certifications.length}</h4>
              <small className="text-muted">Active Certifications</small>
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
            Energy Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'certifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('certifications')}
          >
            Certifications ({certifications.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            Recommendations ({recommendations.length})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div>
            {energyData.length > 0 ? (
              energyData.map(energy => (
                <EnergyOverviewCard key={energy.id} energy={energy} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-lightning display-1 text-muted"></i>
                <h3 className="mt-3">No Energy Data</h3>
                <p className="text-muted">No energy efficiency data available for your properties.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'certifications' && (
          <div>
            {certifications.length > 0 ? (
              certifications.map(cert => (
                <CertificationCard key={cert.id} cert={cert} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-award display-1 text-muted"></i>
                <h3 className="mt-3">No Certifications</h3>
                <p className="text-muted">No energy certifications found for your properties.</p>
                <button className="btn btn-primary">
                  Apply for Certification
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            {recommendations.length > 0 ? (
              recommendations.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-lightbulb display-1 text-muted"></i>
                <h3 className="mt-3">No Recommendations</h3>
                <p className="text-muted">No energy efficiency recommendations available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnergyEfficiency;
