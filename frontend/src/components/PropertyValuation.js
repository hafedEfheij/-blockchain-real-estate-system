import React, { useState, useEffect } from 'react';
import { formatEther, formatNumber } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

const PropertyValuation = ({ property, onValuationComplete }) => {
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [factors, setFactors] = useState({
    location: 0,
    area: 0,
    propertyType: 0,
    marketTrends: 0,
    amenities: 0,
    condition: 0
  });
  const [comparableProperties, setComparableProperties] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);

  useEffect(() => {
    if (property) {
      calculateValuation();
    }
  }, [property]);

  const calculateValuation = async () => {
    try {
      setLoading(true);
      
      // Simulate AI-based valuation calculation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock valuation factors
      const locationScore = getLocationScore(property.location);
      const areaScore = getAreaScore(property.area);
      const typeScore = getPropertyTypeScore(property.propertyType);
      const marketScore = getMarketTrendScore();
      const amenitiesScore = getAmenitiesScore(property);
      const conditionScore = getConditionScore(property);

      const factorScores = {
        location: locationScore,
        area: areaScore,
        propertyType: typeScore,
        marketTrends: marketScore,
        amenities: amenitiesScore,
        condition: conditionScore
      };

      setFactors(factorScores);

      // Calculate base valuation
      const basePrice = parseFloat(property.price || 100);
      const adjustmentFactor = Object.values(factorScores).reduce((sum, score) => sum + score, 0) / 600; // Average of all factors
      
      const estimatedValue = basePrice * (1 + adjustmentFactor);
      const confidence = calculateConfidence(factorScores);
      const priceRange = {
        low: estimatedValue * 0.85,
        high: estimatedValue * 1.15
      };

      const valuationResult = {
        estimatedValue,
        confidence,
        priceRange,
        factors: factorScores,
        lastUpdated: new Date(),
        methodology: 'AI-Enhanced Comparative Market Analysis'
      };

      setValuation(valuationResult);
      
      // Generate comparable properties
      generateComparableProperties(property);
      
      // Generate price history
      generatePriceHistory(estimatedValue);
      
      if (onValuationComplete) {
        onValuationComplete(valuationResult);
      }
      
    } catch (error) {
      console.error('Error calculating valuation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationScore = (location) => {
    // Mock location scoring based on keywords
    const premiumLocations = ['manhattan', 'beverly hills', 'miami beach', 'downtown'];
    const goodLocations = ['brooklyn', 'queens', 'hollywood', 'santa monica'];
    
    const locationLower = location.toLowerCase();
    
    if (premiumLocations.some(loc => locationLower.includes(loc))) {
      return 85 + Math.random() * 15; // 85-100
    } else if (goodLocations.some(loc => locationLower.includes(loc))) {
      return 70 + Math.random() * 15; // 70-85
    } else {
      return 50 + Math.random() * 20; // 50-70
    }
  };

  const getAreaScore = (area) => {
    // Score based on area size
    if (area > 1000) return 90 + Math.random() * 10;
    if (area > 500) return 75 + Math.random() * 15;
    if (area > 200) return 60 + Math.random() * 15;
    return 40 + Math.random() * 20;
  };

  const getPropertyTypeScore = (type) => {
    const typeScores = {
      'Commercial': 85 + Math.random() * 15,
      'Residential': 75 + Math.random() * 15,
      'Industrial': 65 + Math.random() * 15,
      'Land': 55 + Math.random() * 15,
      'Mixed-Use': 80 + Math.random() * 15
    };
    return typeScores[type] || 60 + Math.random() * 20;
  };

  const getMarketTrendScore = () => {
    // Mock market trend analysis
    return 70 + Math.random() * 30;
  };

  const getAmenitiesScore = (property) => {
    // Mock amenities scoring
    return 60 + Math.random() * 40;
  };

  const getConditionScore = (property) => {
    // Mock condition scoring
    return property.verified ? 80 + Math.random() * 20 : 60 + Math.random() * 20;
  };

  const calculateConfidence = (factors) => {
    const avgScore = Object.values(factors).reduce((sum, score) => sum + score, 0) / Object.keys(factors).length;
    return Math.min(95, Math.max(60, avgScore));
  };

  const generateComparableProperties = (property) => {
    const comparables = [
      {
        id: 'comp1',
        location: 'Similar Location A',
        area: property.area * (0.9 + Math.random() * 0.2),
        propertyType: property.propertyType,
        price: parseFloat(property.price || 100) * (0.85 + Math.random() * 0.3),
        soldDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        similarity: 85 + Math.random() * 15
      },
      {
        id: 'comp2',
        location: 'Similar Location B',
        area: property.area * (0.8 + Math.random() * 0.4),
        propertyType: property.propertyType,
        price: parseFloat(property.price || 100) * (0.9 + Math.random() * 0.2),
        soldDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        similarity: 80 + Math.random() * 15
      },
      {
        id: 'comp3',
        location: 'Similar Location C',
        area: property.area * (0.95 + Math.random() * 0.1),
        propertyType: property.propertyType,
        price: parseFloat(property.price || 100) * (0.95 + Math.random() * 0.1),
        soldDate: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000),
        similarity: 90 + Math.random() * 10
      }
    ];
    
    setComparableProperties(comparables);
  };

  const generatePriceHistory = (currentValue) => {
    const history = [];
    const months = 12;
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const trendFactor = (months - i) * 0.005; // Slight upward trend
      const value = currentValue * (0.9 + variation + trendFactor);
      
      history.push({
        date: date.toISOString().slice(0, 7), // YYYY-MM format
        value: value
      });
    }
    
    setPriceHistory(history);
  };

  const getFactorColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return 'success';
    if (confidence >= 70) return 'warning';
    return 'danger';
  };

  if (loading) {
    return <LoadingSpinner message="Calculating property valuation..." />;
  }

  if (!valuation) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <i className="bi bi-calculator display-4 text-muted"></i>
          <h4 className="mt-3">Property Valuation</h4>
          <p className="text-muted">Click calculate to get an AI-powered property valuation</p>
          <button className="btn btn-primary" onClick={calculateValuation}>
            <i className="bi bi-calculator me-2"></i>
            Calculate Valuation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Main Valuation */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-graph-up-arrow me-2"></i>
                Property Valuation Report
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h2 className="text-primary">{formatEther(valuation.estimatedValue.toFixed(2))}</h2>
                  <p className="text-muted mb-3">Estimated Market Value</p>
                  
                  <div className="mb-3">
                    <strong>Price Range:</strong>
                    <div className="d-flex justify-content-between">
                      <span>Low: {formatEther(valuation.priceRange.low.toFixed(2))}</span>
                      <span>High: {formatEther(valuation.priceRange.high.toFixed(2))}</span>
                    </div>
                    <div className="progress mt-2">
                      <div className="progress-bar bg-success" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="text-center">
                    <div className={`badge bg-${getConfidenceColor(valuation.confidence)} fs-6 mb-2`}>
                      {valuation.confidence.toFixed(1)}% Confidence
                    </div>
                    <p className="small text-muted">
                      Methodology: {valuation.methodology}
                    </p>
                    <p className="small text-muted">
                      Last Updated: {valuation.lastUpdated.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Valuation Factors */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">Valuation Factors</h6>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(factors).map(([factor, score]) => (
                  <div key={factor} className="col-md-6 mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`badge bg-${getFactorColor(score)}`}>
                        {score.toFixed(0)}/100
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar bg-${getFactorColor(score)}`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price History Chart */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">Price History Trend</h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Estimated Value</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistory.slice(-6).map((entry, index, arr) => {
                      const prevValue = index > 0 ? arr[index - 1].value : entry.value;
                      const change = ((entry.value - prevValue) / prevValue) * 100;
                      
                      return (
                        <tr key={entry.date}>
                          <td>{entry.date}</td>
                          <td>{formatEther(entry.value.toFixed(2))}</td>
                          <td>
                            <span className={`text-${change >= 0 ? 'success' : 'danger'}`}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
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

        {/* Comparable Properties */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Comparable Properties</h6>
            </div>
            <div className="card-body">
              {comparableProperties.map(comp => (
                <div key={comp.id} className="border-bottom pb-3 mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{comp.location}</h6>
                      <small className="text-muted">
                        {comp.propertyType} • {formatNumber(comp.area)} sq m
                      </small>
                    </div>
                    <span className="badge bg-info">{comp.similarity.toFixed(0)}% match</span>
                  </div>
                  <div className="mt-2">
                    <strong>{formatEther(comp.price.toFixed(2))}</strong>
                    <br />
                    <small className="text-muted">
                      Sold {comp.soldDate.toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Insights */}
          <div className="card mt-4">
            <div className="card-header">
              <h6 className="mb-0">Market Insights</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Market Trend</span>
                  <span className="text-success">
                    <i className="bi bi-arrow-up"></i> Bullish
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Avg. Days on Market</span>
                  <span>45 days</span>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Price per sq m</span>
                  <span>{formatEther((valuation.estimatedValue / property.area).toFixed(2))}</span>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Market Activity</span>
                  <span className="text-warning">Moderate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyValuation;
