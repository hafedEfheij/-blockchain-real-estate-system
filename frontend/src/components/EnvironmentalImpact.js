import React, { useState, useEffect } from 'react';
import { formatNumber } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

const EnvironmentalImpact = ({ userAddress, properties = [] }) => {
  const [environmentalData, setEnvironmentalData] = useState([]);
  const [carbonCredits, setCarbonCredits] = useState([]);
  const [sustainabilityGoals, setSustainabilityGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadEnvironmentalData();
  }, [userAddress]);

  const loadEnvironmentalData = async () => {
    try {
      setLoading(true);
      
      // Mock environmental data
      const mockEnvironmentalData = [
        {
          id: '1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          carbonFootprint: 18.5, // tons CO2/year
          energyConsumption: 45000, // kWh/year
          waterUsage: 120000, // gallons/year
          wasteGeneration: 2.4, // tons/year
          recyclingRate: 65, // percentage
          renewableEnergy: 25, // percentage
          greenScore: 72,
          lastAssessment: new Date(Date.now() - 86400000 * 90),
          improvements: [
            { item: 'Solar Panel Installation', impact: -8.2, status: 'planned', cost: 15000 },
            { item: 'LED Lighting Upgrade', impact: -2.1, status: 'completed', cost: 2500 },
            { item: 'Smart Water System', impact: -1.5, status: 'in-progress', cost: 3500 }
          ],
          certifications: ['ENERGY STAR', 'Green Building Certified']
        },
        {
          id: '2',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          carbonFootprint: 8.2,
          energyConsumption: 28000,
          waterUsage: 85000,
          wasteGeneration: 1.8,
          recyclingRate: 85,
          renewableEnergy: 75,
          greenScore: 92,
          lastAssessment: new Date(Date.now() - 86400000 * 45),
          improvements: [
            { item: 'Solar Panel System', impact: -12.5, status: 'completed', cost: 18000 },
            { item: 'Rainwater Harvesting', impact: -2.8, status: 'completed', cost: 5000 },
            { item: 'Green Roof Installation', impact: -3.2, status: 'completed', cost: 12000 }
          ],
          certifications: ['LEED Platinum', 'ENERGY STAR', 'Living Building Challenge']
        }
      ];

      // Mock carbon credits
      const mockCarbonCredits = [
        {
          id: 'credit1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          credits: 5.2,
          value: 156, // USD
          source: 'Solar Energy Generation',
          issueDate: new Date(Date.now() - 86400000 * 30),
          expiryDate: new Date(Date.now() + 86400000 * 335),
          status: 'active',
          verified: true
        },
        {
          id: 'credit2',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          credits: 12.8,
          value: 384,
          source: 'Renewable Energy & Efficiency',
          issueDate: new Date(Date.now() - 86400000 * 15),
          expiryDate: new Date(Date.now() + 86400000 * 350),
          status: 'active',
          verified: true
        }
      ];

      // Mock sustainability goals
      const mockGoals = [
        {
          id: 'goal1',
          propertyId: '1',
          title: 'Carbon Neutral by 2030',
          description: 'Achieve net-zero carbon emissions through renewable energy and efficiency improvements',
          targetDate: new Date('2030-12-31'),
          currentProgress: 35,
          targetReduction: 18.5,
          currentReduction: 6.5,
          milestones: [
            { title: 'Solar Installation', target: '2024-06-30', status: 'planned' },
            { title: '50% Emission Reduction', target: '2027-12-31', status: 'in-progress' },
            { title: 'Carbon Neutral', target: '2030-12-31', status: 'planned' }
          ]
        },
        {
          id: 'goal2',
          propertyId: '2',
          title: 'Zero Waste to Landfill',
          description: 'Achieve 100% waste diversion from landfills through recycling and composting',
          targetDate: new Date('2025-12-31'),
          currentProgress: 85,
          targetReduction: 1.8,
          currentReduction: 1.53,
          milestones: [
            { title: 'Composting Program', target: '2024-03-31', status: 'completed' },
            { title: '90% Waste Diversion', target: '2024-12-31', status: 'in-progress' },
            { title: 'Zero Waste Certification', target: '2025-12-31', status: 'planned' }
          ]
        }
      ];

      setEnvironmentalData(mockEnvironmentalData);
      setCarbonCredits(mockCarbonCredits);
      setSustainabilityGoals(mockGoals);
      
    } catch (error) {
      console.error('Error loading environmental data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreenScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'info';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const getImpactColor = (impact) => {
    if (impact < -5) return 'success';
    if (impact < 0) return 'info';
    if (impact === 0) return 'secondary';
    return 'warning';
  };

  const EnvironmentalOverviewCard = ({ data }) => (
    <div className="card mb-4">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{data.propertyLocation}</h6>
          <span className={`badge bg-${getGreenScoreColor(data.greenScore)} fs-6`}>
            {data.greenScore}/100 Green Score
          </span>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <h5 className="text-danger">{data.carbonFootprint} tons</h5>
              <small className="text-muted">Annual Carbon Footprint</small>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Energy Consumption:</span>
                <span>{formatNumber(data.energyConsumption)} kWh/year</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Water Usage:</span>
                <span>{formatNumber(data.waterUsage)} gal/year</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Waste Generation:</span>
                <span>{data.wasteGeneration} tons/year</span>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <h6>Sustainability Metrics</h6>
              <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <small>Renewable Energy</small>
                  <small>{data.renewableEnergy}%</small>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${data.renewableEnergy}%` }}
                  ></div>
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <small>Recycling Rate</small>
                  <small>{data.recyclingRate}%</small>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-info"
                    style={{ width: `${data.recyclingRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <h6>Environmental Improvements</h6>
            <div className="row">
              {data.improvements.map((improvement, index) => (
                <div key={index} className="col-md-4 mb-2">
                  <div className="card border-0 bg-light">
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="fw-bold">{improvement.item}</small>
                        <span className={`badge bg-${improvement.status === 'completed' ? 'success' : improvement.status === 'in-progress' ? 'warning' : 'secondary'}`}>
                          {improvement.status}
                        </span>
                      </div>
                      <small className="text-muted">
                        {improvement.impact > 0 ? '+' : ''}{improvement.impact} tons CO₂ • ${formatNumber(improvement.cost)}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {data.certifications.length > 0 && (
          <div className="mt-3">
            <h6>Environmental Certifications</h6>
            <div className="d-flex flex-wrap gap-1">
              {data.certifications.map(cert => (
                <span key={cert} className="badge bg-success">{cert}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3">
          <small className="text-muted">
            Last Assessment: {data.lastAssessment.toLocaleDateString()}
          </small>
        </div>
      </div>
    </div>
  );

  const CarbonCreditCard = ({ credit }) => {
    const daysUntilExpiry = Math.ceil((credit.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry <= 90;

    return (
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="card-title">
                {credit.credits} Carbon Credits
                {credit.verified && (
                  <i className="bi bi-patch-check-fill text-success ms-2"></i>
                )}
              </h6>
              <p className="card-text">
                <small className="text-muted">{credit.propertyLocation}</small>
              </p>
              <div className="mb-2">
                <strong>Source:</strong> {credit.source}
              </div>
              <div className="mb-2">
                <strong>Value:</strong> ${formatNumber(credit.value)}
              </div>
              <div className="mb-2">
                <small className={`text-${isExpiringSoon ? 'warning' : 'muted'}`}>
                  <strong>Expires:</strong> {credit.expiryDate.toLocaleDateString()}
                  {isExpiringSoon && (
                    <> <i className="bi bi-exclamation-triangle text-warning"></i> Expires in {daysUntilExpiry} days</>
                  )}
                </small>
              </div>
            </div>
            <div className="text-end">
              <span className="badge bg-success">{credit.status}</span>
              <br />
              <button className="btn btn-outline-primary btn-sm mt-2">
                <i className="bi bi-arrow-right-circle me-1"></i>
                Trade
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SustainabilityGoalCard = ({ goal }) => {
    const daysUntilTarget = Math.ceil((goal.targetDate - new Date()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilTarget < 0;

    return (
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <h6 className="card-title">{goal.title}</h6>
              <p className="card-text">{goal.description}</p>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Progress</span>
                  <span>{goal.currentProgress}%</span>
                </div>
                <div className="progress">
                  <div
                    className={`progress-bar ${goal.currentProgress >= 75 ? 'bg-success' : goal.currentProgress >= 50 ? 'bg-info' : 'bg-warning'}`}
                    style={{ width: `${goal.currentProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <small className="text-muted">
                    <strong>Target Reduction:</strong> {goal.targetReduction} tons CO₂
                  </small>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">
                    <strong>Current Reduction:</strong> {goal.currentReduction} tons CO₂
                  </small>
                </div>
              </div>

              <div className="mb-3">
                <h6>Milestones</h6>
                {goal.milestones.map((milestone, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                    <small>{milestone.title}</small>
                    <div>
                      <span className={`badge bg-${milestone.status === 'completed' ? 'success' : milestone.status === 'in-progress' ? 'warning' : 'secondary'} me-2`}>
                        {milestone.status}
                      </span>
                      <small className="text-muted">{milestone.target}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ms-3 text-end">
              <small className={`text-${isOverdue ? 'danger' : daysUntilTarget <= 365 ? 'warning' : 'muted'}`}>
                Target: {goal.targetDate.toLocaleDateString()}
                <br />
                {isOverdue ? 
                  `${Math.abs(daysUntilTarget)} days overdue` : 
                  `${daysUntilTarget} days remaining`
                }
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading environmental data..." />;
  }

  const totalCarbonFootprint = environmentalData.reduce((sum, data) => sum + data.carbonFootprint, 0);
  const totalCarbonCredits = carbonCredits.reduce((sum, credit) => sum + credit.credits, 0);
  const averageGreenScore = environmentalData.length > 0 ? 
    environmentalData.reduce((sum, data) => sum + data.greenScore, 0) / environmentalData.length : 0;
  const totalCreditValue = carbonCredits.reduce((sum, credit) => sum + credit.value, 0);

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h2>
            <i className="bi bi-tree me-2"></i>
            Environmental Impact Tracking
          </h2>
          <p className="text-muted">Monitor and improve your properties' environmental performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-danger">{totalCarbonFootprint.toFixed(1)}</h4>
              <small className="text-muted">Total Carbon Footprint (tons/year)</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-success">{totalCarbonCredits.toFixed(1)}</h4>
              <small className="text-muted">Carbon Credits Earned</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-info">{averageGreenScore.toFixed(0)}</h4>
              <small className="text-muted">Average Green Score</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-warning">${formatNumber(totalCreditValue)}</h4>
              <small className="text-muted">Carbon Credit Value</small>
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
            Environmental Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'carbon-credits' ? 'active' : ''}`}
            onClick={() => setActiveTab('carbon-credits')}
          >
            Carbon Credits ({carbonCredits.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            Sustainability Goals ({sustainabilityGoals.length})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div>
            {environmentalData.length > 0 ? (
              environmentalData.map(data => (
                <EnvironmentalOverviewCard key={data.id} data={data} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-tree display-1 text-muted"></i>
                <h3 className="mt-3">No Environmental Data</h3>
                <p className="text-muted">No environmental impact data available for your properties.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'carbon-credits' && (
          <div>
            {carbonCredits.length > 0 ? (
              <div className="row">
                {carbonCredits.map(credit => (
                  <div key={credit.id} className="col-lg-6">
                    <CarbonCreditCard credit={credit} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-award display-1 text-muted"></i>
                <h3 className="mt-3">No Carbon Credits</h3>
                <p className="text-muted">No carbon credits have been earned yet.</p>
                <button className="btn btn-primary">
                  Learn About Carbon Credits
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div>
            {sustainabilityGoals.length > 0 ? (
              sustainabilityGoals.map(goal => (
                <SustainabilityGoalCard key={goal.id} goal={goal} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-bullseye display-1 text-muted"></i>
                <h3 className="mt-3">No Sustainability Goals</h3>
                <p className="text-muted">Set sustainability goals to track your environmental progress.</p>
                <button className="btn btn-primary">
                  Create Sustainability Goal
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentalImpact;
