// Utility helper functions

import { ethers } from 'ethers';
import { NETWORKS, ERROR_MESSAGES, STORAGE_KEYS } from './constants';

/**
 * Format Ethereum address for display
 * @param {string} address - Full Ethereum address
 * @param {number} startChars - Number of characters to show at start
 * @param {number} endChars - Number of characters to show at end
 * @returns {string} Formatted address
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Format ETH amount for display
 * @param {string|number} amount - Amount in ETH
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted amount
 */
export const formatEther = (amount, decimals = 4) => {
  if (!amount) return '0';
  const formatted = parseFloat(amount).toFixed(decimals);
  return `${formatted} ETH`;
};

/**
 * Format large numbers with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid
 */
export const isValidAddress = (address) => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Get network information by chain ID
 * @param {number} chainId - Chain ID
 * @returns {object|null} Network information
 */
export const getNetworkByChainId = (chainId) => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId) || null;
};

/**
 * Check if user is on correct network
 * @param {number} currentChainId - Current chain ID
 * @param {number} expectedChainId - Expected chain ID
 * @returns {boolean} True if on correct network
 */
export const isCorrectNetwork = (currentChainId, expectedChainId = NETWORKS.LOCALHOST.chainId) => {
  return currentChainId === expectedChainId;
};

/**
 * Format date for display
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
};

/**
 * Calculate time ago from timestamp
 * @param {Date|string|number} timestamp - Timestamp
 * @returns {string} Time ago string
 */
export const timeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

/**
 * Validate property data
 * @param {object} propertyData - Property data to validate
 * @returns {object} Validation result with isValid and errors
 */
export const validatePropertyData = (propertyData) => {
  const errors = [];

  if (!propertyData.location || propertyData.location.trim().length < 5) {
    errors.push('Location must be at least 5 characters long');
  }

  if (!propertyData.area || propertyData.area <= 0) {
    errors.push('Area must be greater than 0');
  }

  if (!propertyData.propertyType) {
    errors.push('Property type is required');
  }

  if (!propertyData.price || propertyData.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (!propertyData.documents || propertyData.documents.length === 0) {
    errors.push('At least one document is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Handle transaction errors
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const handleTransactionError = (error) => {
  if (error.code === 4001) {
    return ERROR_MESSAGES.TRANSACTION_REJECTED;
  }
  
  if (error.message.includes('insufficient funds')) {
    return ERROR_MESSAGES.INSUFFICIENT_FUNDS;
  }
  
  if (error.message.includes('user rejected')) {
    return ERROR_MESSAGES.TRANSACTION_REJECTED;
  }
  
  return error.message || 'An unknown error occurred';
};

/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 */
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Load data from local storage
 * @param {string} key - Storage key
 * @returns {any} Loaded data or null
 */
export const loadFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

/**
 * Remove data from local storage
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Generate a random ID
 * @returns {string} Random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Check if file type is supported
 * @param {string} fileName - File name
 * @param {string[]} supportedTypes - Array of supported file extensions
 * @returns {boolean} True if supported
 */
export const isSupportedFileType = (fileName, supportedTypes) => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return supportedTypes.includes(extension);
};
