import React, { useState, useEffect } from 'react';
import { formatEther, formatNumber } from '../utils/helpers';

const PropertyAnalytics = ({ properties = [], transactions = [] }) => {
  const [analytics, setAnalytics] = useState({
    totalProperties: 0,
    totalValue: 0,
    averagePrice: 0,
    verifiedProperties: 0,
    propertiesForSale: 0,
    totalTransactions: 0,
    totalVolume: 0,
    propertyTypeDistribution: {},
    priceRanges: {},
    recentActivity: []
  });

  useEffect(() => {
    calculateAnalytics();
  }, [properties, transactions]);

  const calculateAnalytics = () => {
    if (!properties.length) {
      setAnalytics({
        totalProperties: 0,
        totalValue: 0,
        averagePrice: 0,
        verifiedProperties: 0,
        propertiesForSale: 0,
        totalTransactions: 0,
        totalVolume: 0,
        propertyTypeDistribution: {},
        priceRanges: {},
        recentActivity: []
      });
      return;
    }

    // Basic metrics
    const totalProperties = properties.length;
    const totalValue = properties.reduce((sum, prop) => sum + parseFloat(prop.price || 0), 0);
    const averagePrice = totalValue / totalProperties;
    const verifiedProperties = properties.filter(prop => prop.verified).length;
    const propertiesForSale = properties.filter(prop => prop.forSale).length;

    // Transaction metrics
    const totalTransactions = transactions.length;
    const totalVolume = transactions
      .filter(tx => tx.completed)
      .reduce((sum, tx) => sum + parseFloat(tx.price || 0), 0);

    // Property type distribution
    const propertyTypeDistribution = properties.reduce((acc, prop) => {
      acc[prop.propertyType] = (acc[prop.propertyType] || 0) + 1;
      return acc;
    }, {});

    // Price ranges
    const priceRanges = properties.reduce((acc, prop) => {
      const price = parseFloat(prop.price || 0);
      let range;
      if (price < 10) range = '< 10 ETH';
      else if (price < 50) range = '10-50 ETH';
      else if (price < 100) range = '50-100 ETH';
      else if (price < 500) range = '100-500 ETH';
      else range = '500+ ETH';
      
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    // Recent activity (last 10 transactions)
    const recentActivity = transactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    setAnalytics({
      totalProperties,
      totalValue,
      averagePrice,
      verifiedProperties,
      propertiesForSale,
      totalTransactions,
      totalVolume,
      propertyTypeDistribution,
      priceRanges,
      recentActivity
    });
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <div className="col-md-3 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className={`bg-${color} text-white rounded-circle p-3 me-3`}>
              <i className={`bi ${icon} fs-4`}></i>
            </div>
            <div>
              <h6 className="card-title mb-0">{title}</h6>
              <h4 className="mb-0">{value}</h4>
              {subtitle && <small className="text-muted">{subtitle}</small>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DistributionChart = ({ title, data, icon }) => (
    <div className="card h-100">
      <div className="card-header">
        <h6 className="mb-0">
          <i className={`bi ${icon} me-2`}></i>
          {title}
        </h6>
      </div>
      <div className="card-body">
        {Object.keys(data).length > 0 ? (
          Object.entries(data).map(([key, value]) => {
            const percentage = (value / analytics.totalProperties * 100).toFixed(1);
            return (
              <div key={key} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">{key}</span>
                  <span className="small">{value} ({percentage}%)</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-muted text-center">No data available</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h2>
            <i className="bi bi-graph-up me-2"></i>
            Property Analytics Dashboard
          </h2>
          <p className="text-muted">Overview of property market statistics and trends</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row">
        <StatCard
          title="Total Properties"
          value={formatNumber(analytics.totalProperties)}
          icon="bi-house"
          color="primary"
          subtitle={`${analytics.verifiedProperties} verified`}
        />
        <StatCard
          title="Total Value"
          value={formatEther(analytics.totalValue)}
          icon="bi-currency-dollar"
          color="success"
          subtitle={`Avg: ${formatEther(analytics.averagePrice)}`}
        />
        <StatCard
          title="For Sale"
          value={formatNumber(analytics.propertiesForSale)}
          icon="bi-tag"
          color="warning"
          subtitle={`${((analytics.propertiesForSale / analytics.totalProperties) * 100).toFixed(1)}% of total`}
        />
        <StatCard
          title="Transactions"
          value={formatNumber(analytics.totalTransactions)}
          icon="bi-arrow-left-right"
          color="info"
          subtitle={`Volume: ${formatEther(analytics.totalVolume)}`}
        />
      </div>

      {/* Distribution Charts */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <DistributionChart
            title="Property Types"
            data={analytics.propertyTypeDistribution}
            icon="bi-pie-chart"
          />
        </div>
        <div className="col-md-6 mb-4">
          <DistributionChart
            title="Price Ranges"
            data={analytics.priceRanges}
            icon="bi-bar-chart"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Recent Transaction Activity
              </h6>
            </div>
            <div className="card-body">
              {analytics.recentActivity.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Property ID</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentActivity.map(tx => (
                        <tr key={tx.id}>
                          <td>
                            <code>#{tx.id}</code>
                          </td>
                          <td>
                            <span className="badge bg-secondary">#{tx.propertyId}</span>
                          </td>
                          <td>
                            <strong>{formatEther(tx.price)}</strong>
                          </td>
                          <td>
                            <span className={`badge ${
                              tx.completed ? 'bg-success' : 
                              tx.status === 4 ? 'bg-danger' : 'bg-warning'
                            }`}>
                              {tx.completed ? 'Completed' : 
                               tx.status === 4 ? 'Cancelled' : 'In Progress'}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center">No recent transactions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalytics;
