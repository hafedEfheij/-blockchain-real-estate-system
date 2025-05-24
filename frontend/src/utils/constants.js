// Application constants and configuration

// Network configurations
export const NETWORKS = {
  LOCALHOST: {
    chainId: 1337,
    name: "Localhost",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: null
  },
  GOERLI: {
    chainId: 5,
    name: "Goerli",
    rpcUrl: "https://goerli.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://goerli.etherscan.io"
  },
  SEPOLIA: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://sepolia.etherscan.io"
  },
  MAINNET: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://etherscan.io"
  }
};

// Property types
export const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Land",
  "Mixed-Use",
  "Agricultural"
];

// Transaction statuses
export const TRANSACTION_STATUS = {
  CREATED: 0,
  INSPECTION_PASSED: 1,
  PAYMENT_RECEIVED: 2,
  COMPLETED: 3,
  CANCELLED: 4
};

export const TRANSACTION_STATUS_LABELS = {
  [TRANSACTION_STATUS.CREATED]: "Created",
  [TRANSACTION_STATUS.INSPECTION_PASSED]: "Inspection Passed",
  [TRANSACTION_STATUS.PAYMENT_RECEIVED]: "Payment Received",
  [TRANSACTION_STATUS.COMPLETED]: "Completed",
  [TRANSACTION_STATUS.CANCELLED]: "Cancelled"
};

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: "Please connect your wallet first",
  METAMASK_NOT_INSTALLED: "Please install MetaMask to use this application",
  WRONG_NETWORK: "Please switch to the correct network",
  INSUFFICIENT_FUNDS: "Insufficient funds for this transaction",
  TRANSACTION_REJECTED: "Transaction was rejected by user",
  PROPERTY_NOT_FOUND: "Property not found",
  UNAUTHORIZED: "You are not authorized to perform this action",
  PROPERTY_NOT_VERIFIED: "Property must be verified before this action",
  PROPERTY_NOT_FOR_SALE: "Property is not listed for sale"
};

// Success messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: "Wallet connected successfully",
  PROPERTY_REGISTERED: "Property registered successfully",
  PROPERTY_LISTED: "Property listed for sale successfully",
  PROPERTY_UNLISTED: "Property unlisted successfully",
  PROPERTY_TOKENIZED: "Property tokenized successfully",
  TRANSACTION_CREATED: "Transaction created successfully",
  TRANSACTION_COMPLETED: "Transaction completed successfully"
};

// Application settings
export const APP_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  MAX_DOCUMENTS_PER_PROPERTY: 10,
  MIN_PROPERTY_PRICE: 0.001, // ETH
  MAX_PROPERTY_PRICE: 10000, // ETH
  PAGINATION_SIZE: 10,
  REFRESH_INTERVAL: 30000 // 30 seconds
};

// IPFS configuration
export const IPFS_CONFIG = {
  GATEWAY: "https://ipfs.io/ipfs/",
  API_URL: "https://api.pinata.cloud",
  DEFAULT_TIMEOUT: 30000
};

// Contract addresses (to be updated after deployment)
export const CONTRACT_ADDRESSES = {
  PROPERTY_REGISTRY: process.env.REACT_APP_PROPERTY_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000",
  PROPERTY_TOKEN: process.env.REACT_APP_PROPERTY_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  PROPERTY_TRANSACTIONS: process.env.REACT_APP_PROPERTY_TRANSACTIONS_ADDRESS || "0x0000000000000000000000000000000000000000"
};

// Gas limits for different operations
export const GAS_LIMITS = {
  REGISTER_PROPERTY: 300000,
  VERIFY_PROPERTY: 100000,
  LIST_PROPERTY: 100000,
  TOKENIZE_PROPERTY: 200000,
  CREATE_TRANSACTION: 200000,
  COMPLETE_TRANSACTION: 300000
};

// Local storage keys
export const STORAGE_KEYS = {
  WALLET_ADDRESS: "wallet_address",
  NETWORK_ID: "network_id",
  USER_PREFERENCES: "user_preferences",
  CACHED_PROPERTIES: "cached_properties"
};

// API endpoints (if using backend services)
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3001",
  PROPERTIES: "/api/properties",
  TRANSACTIONS: "/api/transactions",
  USERS: "/api/users",
  UPLOAD: "/api/upload"
};
