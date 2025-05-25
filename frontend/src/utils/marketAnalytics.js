// Market Analytics and Trends API utilities

import { STORAGE_KEYS } from './constants';
import { saveToStorage, loadFromStorage } from './helpers';

/**
 * Market Analytics API for property trends and insights
 */
export class MarketAnalytics {
  constructor() {
    this.baseUrl = process.env.REACT_APP_ANALYTICS_API_URL || 'https://api.realestate-analytics.com';
    this.apiKey = process.env.REACT_APP_ANALYTICS_API_KEY || 'demo_key';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get market trends for a specific location
   * @param {string} location - Location to analyze
   * @param {string} timeframe - Time period (1M, 3M, 6M, 1Y, 2Y)
   * @returns {Promise<Object>} Market trends data
   */
  async getMarketTrends(location, timeframe = '1Y') {
    const cacheKey = `trends_${location}_${timeframe}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // For demo purposes, generate mock data
      const mockData = this.generateMockTrends(location, timeframe);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: mockData,
        timestamp: Date.now()
      });

      return mockData;
    } catch (error) {
      console.error('Error fetching market trends:', error);
      throw new Error('Failed to fetch market trends');
    }
  }

  /**
   * Get property price predictions
   * @param {Object} propertyData - Property information
   * @param {number} months - Prediction period in months
   * @returns {Promise<Object>} Price predictions
   */
  async getPricePredictions(propertyData, months = 12) {
    try {
      // Mock AI-based price prediction
      const currentPrice = parseFloat(propertyData.price || 100);
      const predictions = this.generatePricePredictions(currentPrice, months, propertyData);
      
      return {
        currentPrice,
        predictions,
        confidence: this.calculatePredictionConfidence(propertyData),
        factors: this.analyzePriceFactors(propertyData),
        methodology: 'Machine Learning with Comparative Market Analysis'
      };
    } catch (error) {
      console.error('Error generating price predictions:', error);
      throw new Error('Failed to generate price predictions');
    }
  }

  /**
   * Get market comparables for a property
   * @param {Object} propertyData - Property to compare
   * @param {number} radius - Search radius in miles
   * @param {number} limit - Maximum number of comparables
   * @returns {Promise<Array>} Comparable properties
   */
  async getComparables(propertyData, radius = 5, limit = 10) {
    try {
      // Generate mock comparable properties
      const comparables = this.generateMockComparables(propertyData, limit);
      
      return {
        comparables,
        averagePrice: comparables.reduce((sum, comp) => sum + comp.price, 0) / comparables.length,
        priceRange: {
          min: Math.min(...comparables.map(comp => comp.price)),
          max: Math.max(...comparables.map(comp => comp.price))
        },
        searchRadius: radius,
        totalFound: comparables.length
      };
    } catch (error) {
      console.error('Error fetching comparables:', error);
      throw new Error('Failed to fetch comparable properties');
    }
  }

  /**
   * Get neighborhood analytics
   * @param {string} location - Neighborhood location
   * @returns {Promise<Object>} Neighborhood data
   */
  async getNeighborhoodAnalytics(location) {
    try {
      const analytics = this.generateNeighborhoodAnalytics(location);
      return analytics;
    } catch (error) {
      console.error('Error fetching neighborhood analytics:', error);
      throw new Error('Failed to fetch neighborhood analytics');
    }
  }

  /**
   * Get investment opportunities
   * @param {Object} criteria - Investment criteria
   * @returns {Promise<Array>} Investment opportunities
   */
  async getInvestmentOpportunities(criteria = {}) {
    try {
      const opportunities = this.generateInvestmentOpportunities(criteria);
      return opportunities;
    } catch (error) {
      console.error('Error fetching investment opportunities:', error);
      throw new Error('Failed to fetch investment opportunities');
    }
  }

  /**
   * Generate mock market trends data
   */
  generateMockTrends(location, timeframe) {
    const periods = this.getPeriodsForTimeframe(timeframe);
    const basePrice = this.getBasePriceForLocation(location);
    
    const trends = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < periods; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (periods - i));
      
      // Add some realistic volatility
      const volatility = (Math.random() - 0.5) * 0.1; // ±5%
      const seasonality = Math.sin((i / periods) * 2 * Math.PI) * 0.05; // ±2.5%
      const trend = 0.005; // 0.5% monthly growth
      
      currentPrice *= (1 + trend + volatility + seasonality);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        averagePrice: Math.round(currentPrice),
        medianPrice: Math.round(currentPrice * 0.95),
        volume: Math.floor(Math.random() * 50) + 20,
        daysOnMarket: Math.floor(Math.random() * 30) + 15,
        pricePerSqFt: Math.round(currentPrice / 1000)
      });
    }

    return {
      location,
      timeframe,
      trends,
      summary: {
        currentPrice: Math.round(currentPrice),
        priceChange: ((currentPrice - basePrice) / basePrice * 100).toFixed(2),
        averageVolume: Math.floor(trends.reduce((sum, t) => sum + t.volume, 0) / trends.length),
        averageDaysOnMarket: Math.floor(trends.reduce((sum, t) => sum + t.daysOnMarket, 0) / trends.length)
      }
    };
  }

  /**
   * Generate price predictions
   */
  generatePricePredictions(currentPrice, months, propertyData) {
    const predictions = [];
    let price = currentPrice;
    
    // Base growth rate based on property type and location
    const baseGrowthRate = this.getBaseGrowthRate(propertyData);
    
    for (let i = 1; i <= months; i++) {
      // Add market factors
      const marketFactor = this.getMarketFactor(i);
      const seasonalFactor = this.getSeasonalFactor(i);
      const locationFactor = this.getLocationFactor(propertyData.location);
      
      const monthlyGrowth = baseGrowthRate + marketFactor + seasonalFactor + locationFactor;
      price *= (1 + monthlyGrowth);
      
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      predictions.push({
        month: i,
        date: date.toISOString().split('T')[0],
        predictedPrice: Math.round(price),
        confidence: Math.max(0.6, 0.95 - (i * 0.02)), // Decreasing confidence over time
        priceChange: ((price - currentPrice) / currentPrice * 100).toFixed(2)
      });
    }
    
    return predictions;
  }

  /**
   * Generate mock comparable properties
   */
  generateMockComparables(propertyData, limit) {
    const comparables = [];
    const basePrice = parseFloat(propertyData.price || 100);
    
    for (let i = 0; i < limit; i++) {
      const priceVariation = (Math.random() - 0.5) * 0.4; // ±20%
      const areaVariation = (Math.random() - 0.5) * 0.3; // ±15%
      
      comparables.push({
        id: `comp_${i + 1}`,
        address: `${Math.floor(Math.random() * 9999)} ${this.getRandomStreetName()}`,
        price: Math.round(basePrice * (1 + priceVariation)),
        area: Math.round((propertyData.area || 100) * (1 + areaVariation)),
        propertyType: propertyData.propertyType,
        bedrooms: Math.floor(Math.random() * 4) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        yearBuilt: 2000 + Math.floor(Math.random() * 24),
        soldDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        daysOnMarket: Math.floor(Math.random() * 60) + 10,
        pricePerSqFt: Math.round((basePrice * (1 + priceVariation)) / ((propertyData.area || 100) * (1 + areaVariation))),
        similarity: Math.round((1 - Math.abs(priceVariation)) * 100)
      });
    }
    
    return comparables.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Generate neighborhood analytics
   */
  generateNeighborhoodAnalytics(location) {
    return {
      location,
      demographics: {
        population: Math.floor(Math.random() * 50000) + 10000,
        medianAge: Math.floor(Math.random() * 20) + 30,
        medianIncome: Math.floor(Math.random() * 50000) + 50000,
        educationLevel: ['High School', 'Bachelor\'s', 'Master\'s', 'PhD'][Math.floor(Math.random() * 4)]
      },
      amenities: {
        schools: Math.floor(Math.random() * 10) + 5,
        restaurants: Math.floor(Math.random() * 50) + 20,
        parks: Math.floor(Math.random() * 8) + 2,
        shoppingCenters: Math.floor(Math.random() * 5) + 1,
        publicTransport: Math.random() > 0.5
      },
      safety: {
        crimeRate: (Math.random() * 5 + 1).toFixed(1),
        safetyScore: Math.floor(Math.random() * 30) + 70,
        policeStations: Math.floor(Math.random() * 3) + 1
      },
      marketMetrics: {
        averagePrice: Math.floor(Math.random() * 200000) + 300000,
        priceGrowth: (Math.random() * 10 - 2).toFixed(2),
        inventory: Math.floor(Math.random() * 100) + 50,
        absorption: Math.floor(Math.random() * 6) + 2
      },
      walkScore: Math.floor(Math.random() * 40) + 60,
      transitScore: Math.floor(Math.random() * 50) + 30,
      bikeScore: Math.floor(Math.random() * 60) + 20
    };
  }

  /**
   * Generate investment opportunities
   */
  generateInvestmentOpportunities(criteria) {
    const opportunities = [];
    const types = ['Undervalued', 'High Growth Potential', 'Cash Flow', 'Appreciation', 'Fixer Upper'];
    
    for (let i = 0; i < 10; i++) {
      opportunities.push({
        id: `opp_${i + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        location: this.getRandomLocation(),
        price: Math.floor(Math.random() * 500000) + 200000,
        expectedReturn: (Math.random() * 15 + 5).toFixed(2),
        riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        timeHorizon: ['Short', 'Medium', 'Long'][Math.floor(Math.random() * 3)],
        description: this.getRandomDescription(),
        score: Math.floor(Math.random() * 30) + 70,
        factors: this.getRandomFactors()
      });
    }
    
    return opportunities.sort((a, b) => b.score - a.score);
  }

  // Helper methods
  getPeriodsForTimeframe(timeframe) {
    const periods = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '2Y': 730
    };
    return Math.floor((periods[timeframe] || 365) / 30);
  }

  getBasePriceForLocation(location) {
    const locationPrices = {
      'manhattan': 800000,
      'beverly hills': 1200000,
      'miami': 450000,
      'chicago': 350000,
      'austin': 400000
    };
    
    const key = location.toLowerCase();
    for (const [loc, price] of Object.entries(locationPrices)) {
      if (key.includes(loc)) {
        return price;
      }
    }
    return 300000; // Default
  }

  getBaseGrowthRate(propertyData) {
    const typeRates = {
      'Commercial': 0.008,
      'Residential': 0.006,
      'Industrial': 0.005,
      'Mixed-Use': 0.007
    };
    return typeRates[propertyData.propertyType] || 0.006;
  }

  getMarketFactor(month) {
    // Simulate market cycles
    return Math.sin(month / 12 * Math.PI) * 0.002;
  }

  getSeasonalFactor(month) {
    // Real estate seasonal patterns
    const seasonalPattern = [0.002, 0.003, 0.005, 0.008, 0.010, 0.008, 0.005, 0.003, 0.001, -0.001, -0.002, 0.000];
    return seasonalPattern[month % 12];
  }

  getLocationFactor(location) {
    const locationFactors = {
      'manhattan': 0.003,
      'beverly hills': 0.004,
      'miami': 0.002,
      'chicago': 0.001,
      'austin': 0.005
    };
    
    const key = location.toLowerCase();
    for (const [loc, factor] of Object.entries(locationFactors)) {
      if (key.includes(loc)) {
        return factor;
      }
    }
    return 0.002; // Default
  }

  calculatePredictionConfidence(propertyData) {
    let confidence = 0.8; // Base confidence
    
    if (propertyData.verified) confidence += 0.1;
    if (propertyData.propertyType === 'Residential') confidence += 0.05;
    if (propertyData.area > 100) confidence += 0.05;
    
    return Math.min(0.95, confidence);
  }

  analyzePriceFactors(propertyData) {
    return {
      location: Math.random() * 30 + 70,
      propertyType: Math.random() * 20 + 75,
      size: Math.random() * 25 + 70,
      condition: Math.random() * 20 + 80,
      marketTrends: Math.random() * 15 + 75,
      amenities: Math.random() * 20 + 70
    };
  }

  getRandomStreetName() {
    const streets = ['Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Second Ave', 'Elm St', 'Maple Dr', 'Pine Rd'];
    return streets[Math.floor(Math.random() * streets.length)];
  }

  getRandomLocation() {
    const locations = ['Downtown', 'Midtown', 'Uptown', 'Westside', 'Eastside', 'Northside', 'Southside'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
    return `${locations[Math.floor(Math.random() * locations.length)]} ${cities[Math.floor(Math.random() * cities.length)]}`;
  }

  getRandomDescription() {
    const descriptions = [
      'Prime location with high appreciation potential',
      'Undervalued property in growing neighborhood',
      'Strong rental demand and cash flow opportunity',
      'Recent infrastructure improvements driving growth',
      'Emerging area with development plans'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  getRandomFactors() {
    const allFactors = ['Location', 'Schools', 'Transportation', 'Development', 'Demographics', 'Economy'];
    const count = Math.floor(Math.random() * 3) + 2;
    return allFactors.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  /**
   * Save analytics data to local storage
   */
  saveAnalyticsData(key, data) {
    saveToStorage(`${STORAGE_KEYS.ANALYTICS}_${key}`, data);
  }

  /**
   * Load analytics data from local storage
   */
  loadAnalyticsData(key) {
    return loadFromStorage(`${STORAGE_KEYS.ANALYTICS}_${key}`);
  }

  /**
   * Clear analytics cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const marketAnalytics = new MarketAnalytics();

// Export utility functions
export const formatTrendData = (trends) => {
  return trends.map(trend => ({
    ...trend,
    formattedPrice: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(trend.averagePrice)
  }));
};

export const calculateROI = (currentPrice, futurePrice, timeMonths) => {
  const totalReturn = ((futurePrice - currentPrice) / currentPrice) * 100;
  const annualizedReturn = (totalReturn / timeMonths) * 12;
  return {
    totalReturn: totalReturn.toFixed(2),
    annualizedReturn: annualizedReturn.toFixed(2)
  };
};

export const getMarketSentiment = (priceChange) => {
  if (priceChange > 5) return { sentiment: 'Bullish', color: 'success' };
  if (priceChange > 0) return { sentiment: 'Positive', color: 'info' };
  if (priceChange > -5) return { sentiment: 'Neutral', color: 'warning' };
  return { sentiment: 'Bearish', color: 'danger' };
};
