import React, { useState, useEffect } from 'react';
import { formatEther, formatNumber } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

const InvestmentDashboard = ({ userAddress, properties = [], transactions = [] }) => {
  const [portfolio, setPortfolio] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalReturn: 0,
    returnPercentage: 0,
    monthlyIncome: 0,
    yearlyIncome: 0,
    properties: [],
    performance: []
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1Y');

  useEffect(() => {
    calculatePortfolio();
  }, [properties, transactions, userAddress]);

  const calculatePortfolio = async () => {
    try {
      setLoading(true);
      
      // Filter user's properties
      const userProperties = properties.filter(p => p.owner === userAddress);
      
      // Calculate portfolio metrics
      const totalValue = userProperties.reduce((sum, prop) => sum + parseFloat(prop.price || 0), 0);
      const totalInvested = userProperties.reduce((sum, prop) => sum + parseFloat(prop.purchasePrice || prop.price || 0), 0);
      const totalReturn = totalValue - totalInvested;
      const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
      
      // Calculate rental income (mock data)
      const monthlyIncome = userProperties.reduce((sum, prop) => {
        const rentMultiplier = prop.propertyType === 'Commercial' ? 0.008 : 0.005; // 0.8% or 0.5% monthly
        return sum + (parseFloat(prop.price || 0) * rentMultiplier);
      }, 0);
      const yearlyIncome = monthlyIncome * 12;
      
      // Generate performance data
      const performance = generatePerformanceData(totalValue, timeframe);
      
      // Calculate property-specific metrics
      const enhancedProperties = userProperties.map(prop => {
        const currentValue = parseFloat(prop.price || 0);
        const purchasePrice = parseFloat(prop.purchasePrice || prop.price || 0);
        const appreciation = currentValue - purchasePrice;
        const appreciationPercent = purchasePrice > 0 ? (appreciation / purchasePrice) * 100 : 0;
        const monthlyRent = currentValue * (prop.propertyType === 'Commercial' ? 0.008 : 0.005);
        const yearlyRent = monthlyRent * 12;
        const yieldPercent = purchasePrice > 0 ? (yearlyRent / purchasePrice) * 100 : 0;
        
        return {
          ...prop,
          currentValue,
          purchasePrice,
          appreciation,
          appreciationPercent,
          monthlyRent,
          yearlyRent,
          yieldPercent,
          roi: appreciationPercent + yieldPercent
        };
      });
      
      setPortfolio({
        totalValue,
        totalInvested,
        totalReturn,
        returnPercentage,
        monthlyIncome,
        yearlyIncome,
        properties: enhancedProperties,
        performance
      });
      
    } catch (error) {
      console.error('Error calculating portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePerformanceData = (currentValue, timeframe) => {
    const periods = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '6M' ? 180 : 365;
    const data = [];
    
    for (let i = periods; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate portfolio growth with some volatility
      const baseGrowth = (periods - i) / periods * 0.15; // 15% annual growth
      const volatility = (Math.random() - 0.5) * 0.05; // ±2.5% volatility
      const value = currentValue * (0.85 + baseGrowth + volatility);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, value)
      });
    }
    
    return data;
  };

  const MetricCard = ({ title, value, subtitle, icon, color = 'primary', trend }) => (
    <div className="col-md-3 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className={`bg-${color} text-white rounded-circle p-3 me-3`}>
              <i className={`bi ${icon} fs-4`}></i>
            </div>
            <div className="flex-grow-1">
              <h6 className="card-title mb-0">{title}</h6>
              <h4 className="mb-0">{value}</h4>
              {subtitle && <small className="text-muted">{subtitle}</small>}
              {trend && (
                <div className={`small text-${trend > 0 ? 'success' : 'danger'}`}>
                  <i className={`bi bi-arrow-${trend > 0 ? 'up' : 'down'}`}></i>
                  {Math.abs(trend).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PropertyRow = ({ property }) => (
    <tr>
      <td>
        <div>
          <strong>{property.location}</strong>
          <br />
          <small className="text-muted">{property.propertyType}</small>
        </div>
      </td>
      <td>{formatEther(property.purchasePrice.toFixed(2))}</td>
      <td>{formatEther(property.currentValue.toFixed(2))}</td>
      <td>
        <span className={`text-${property.appreciation >= 0 ? 'success' : 'danger'}`}>
          {property.appreciation >= 0 ? '+' : ''}{formatEther(property.appreciation.toFixed(2))}
          <br />
          <small>({property.appreciationPercent >= 0 ? '+' : ''}{property.appreciationPercent.toFixed(1)}%)</small>
        </span>
      </td>
      <td>
        {formatEther(property.yearlyRent.toFixed(2))}
        <br />
        <small className="text-muted">{property.yieldPercent.toFixed(1)}% yield</small>
      </td>
      <td>
        <span className={`text-${property.roi >= 0 ? 'success' : 'danger'}`}>
          {property.roi >= 0 ? '+' : ''}{property.roi.toFixed(1)}%
        </span>
      </td>
    </tr>
  );

  if (loading) {
    return <LoadingSpinner message="Calculating portfolio performance..." />;
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-graph-up me-2"></i>
                Investment Dashboard
              </h2>
              <p className="text-muted">Track your real estate investment performance</p>
            </div>
            <div className="btn-group" role="group">
              {['1M', '3M', '6M', '1Y'].map(period => (
                <button
                  key={period}
                  type="button"
                  className={`btn btn-outline-primary ${timeframe === period ? 'active' : ''}`}
                  onClick={() => setTimeframe(period)}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row">
        <MetricCard
          title="Total Portfolio Value"
          value={formatEther(portfolio.totalValue.toFixed(2))}
          subtitle={`${portfolio.properties.length} properties`}
          icon="bi-wallet2"
          color="primary"
        />
        <MetricCard
          title="Total Return"
          value={formatEther(portfolio.totalReturn.toFixed(2))}
          subtitle={`${portfolio.returnPercentage >= 0 ? '+' : ''}${portfolio.returnPercentage.toFixed(1)}%`}
          icon="bi-graph-up-arrow"
          color={portfolio.totalReturn >= 0 ? 'success' : 'danger'}
          trend={portfolio.returnPercentage}
        />
        <MetricCard
          title="Monthly Income"
          value={formatEther(portfolio.monthlyIncome.toFixed(2))}
          subtitle={`${formatEther(portfolio.yearlyIncome.toFixed(2))} annually`}
          icon="bi-cash-coin"
          color="info"
        />
        <MetricCard
          title="Average Yield"
          value={`${portfolio.properties.length > 0 ? 
            (portfolio.properties.reduce((sum, p) => sum + p.yieldPercent, 0) / portfolio.properties.length).toFixed(1) : 0}%`}
          subtitle="Annual rental yield"
          icon="bi-percent"
          color="warning"
        />
      </div>

      {/* Portfolio Performance Chart */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Portfolio Performance ({timeframe})</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Portfolio Value</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.performance.slice(-10).map((entry, index, arr) => {
                      const prevValue = index > 0 ? arr[index - 1].value : entry.value;
                      const change = ((entry.value - prevValue) / prevValue) * 100;
                      
                      return (
                        <tr key={entry.date}>
                          <td>{entry.date}</td>
                          <td>{formatEther(entry.value.toFixed(2))}</td>
                          <td>
                            <span className={`text-${change >= 0 ? 'success' : 'danger'}`}>
                              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Breakdown */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Property Portfolio Breakdown</h5>
            </div>
            <div className="card-body">
              {portfolio.properties.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Purchase Price</th>
                        <th>Current Value</th>
                        <th>Appreciation</th>
                        <th>Annual Rental Income</th>
                        <th>Total ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.properties.map(property => (
                        <PropertyRow key={property.id} property={property} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-house display-1 text-muted"></i>
                  <h4 className="mt-3">No Properties in Portfolio</h4>
                  <p className="text-muted">Start building your real estate portfolio by purchasing properties.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Investment Insights */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Property Type Distribution</h6>
            </div>
            <div className="card-body">
              {portfolio.properties.length > 0 ? (
                (() => {
                  const typeDistribution = portfolio.properties.reduce((acc, prop) => {
                    acc[prop.propertyType] = (acc[prop.propertyType] || 0) + 1;
                    return acc;
                  }, {});
                  
                  return Object.entries(typeDistribution).map(([type, count]) => {
                    const percentage = (count / portfolio.properties.length * 100).toFixed(1);
                    return (
                      <div key={type} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>{type}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  });
                })()
              ) : (
                <p className="text-muted text-center">No data available</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Investment Recommendations</h6>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item border-0 px-0">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-lightbulb text-warning me-3"></i>
                    <div>
                      <h6 className="mb-1">Diversify Property Types</h6>
                      <small className="text-muted">Consider adding commercial properties for higher yields</small>
                    </div>
                  </div>
                </div>
                <div className="list-group-item border-0 px-0">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-geo-alt text-info me-3"></i>
                    <div>
                      <h6 className="mb-1">Geographic Diversification</h6>
                      <small className="text-muted">Spread investments across different markets</small>
                    </div>
                  </div>
                </div>
                <div className="list-group-item border-0 px-0">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-graph-up text-success me-3"></i>
                    <div>
                      <h6 className="mb-1">Market Timing</h6>
                      <small className="text-muted">Current market conditions favor buyers</small>
                    </div>
                  </div>
                </div>
                <div className="list-group-item border-0 px-0">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shield-check text-primary me-3"></i>
                    <div>
                      <h6 className="mb-1">Insurance Coverage</h6>
                      <small className="text-muted">Ensure all properties have adequate insurance</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDashboard;
