// IPFS integration utilities for document storage

import { IPFS_CONFIG, APP_CONFIG } from './constants';

/**
 * Upload file to IPFS using Pinata service
 * @param {File} file - File to upload
 * @param {string} apiKey - Pinata API key
 * @param {string} secretKey - Pinata secret key
 * @returns {Promise<string>} IPFS hash
 */
export const uploadToIPFS = async (file, apiKey, secretKey) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        fileSize: file.size
      }
    });
    formData.append('pinataMetadata', metadata);

    // Add options
    const options = JSON.stringify({
      cidVersion: 0
    });
    formData.append('pinataOptions', options);

    const response = await fetch(`${IPFS_CONFIG.API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};

/**
 * Upload JSON metadata to IPFS
 * @param {object} metadata - Metadata object
 * @param {string} apiKey - Pinata API key
 * @param {string} secretKey - Pinata secret key
 * @returns {Promise<string>} IPFS hash
 */
export const uploadJSONToIPFS = async (metadata, apiKey, secretKey) => {
  try {
    const response = await fetch(`${IPFS_CONFIG.API_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `metadata-${Date.now()}.json`,
          keyvalues: {
            uploadedAt: new Date().toISOString(),
            type: 'metadata'
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`JSON upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('IPFS JSON upload error:', error);
    throw error;
  }
};

/**
 * Get file from IPFS
 * @param {string} hash - IPFS hash
 * @returns {Promise<Response>} Fetch response
 */
export const getFromIPFS = async (hash) => {
  try {
    const response = await fetch(`${IPFS_CONFIG.GATEWAY}${hash}`, {
      timeout: IPFS_CONFIG.DEFAULT_TIMEOUT
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('IPFS fetch error:', error);
    throw error;
  }
};

/**
 * Get JSON data from IPFS
 * @param {string} hash - IPFS hash
 * @returns {Promise<object>} JSON data
 */
export const getJSONFromIPFS = async (hash) => {
  try {
    const response = await getFromIPFS(hash);
    return await response.json();
  } catch (error) {
    console.error('IPFS JSON fetch error:', error);
    throw error;
  }
};

/**
 * Validate IPFS hash format
 * @param {string} hash - IPFS hash to validate
 * @returns {boolean} True if valid
 */
export const isValidIPFSHash = (hash) => {
  // Basic validation for IPFS hash (CIDv0 and CIDv1)
  const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidv1Regex = /^[a-z2-7]{59}$/;
  
  return cidv0Regex.test(hash) || cidv1Regex.test(hash);
};

/**
 * Create IPFS URL from hash
 * @param {string} hash - IPFS hash
 * @param {string} gateway - IPFS gateway URL (optional)
 * @returns {string} Full IPFS URL
 */
export const createIPFSUrl = (hash, gateway = IPFS_CONFIG.GATEWAY) => {
  if (!isValidIPFSHash(hash)) {
    throw new Error('Invalid IPFS hash');
  }
  return `${gateway}${hash}`;
};

/**
 * Extract IPFS hash from URL
 * @param {string} url - IPFS URL
 * @returns {string|null} IPFS hash or null if invalid
 */
export const extractIPFSHash = (url) => {
  try {
    // Handle different IPFS URL formats
    const patterns = [
      /ipfs:\/\/([a-zA-Z0-9]+)/,
      /\/ipfs\/([a-zA-Z0-9]+)/,
      /^([a-zA-Z0-9]+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && isValidIPFSHash(match[1])) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting IPFS hash:', error);
    return null;
  }
};

/**
 * Pin existing content to IPFS
 * @param {string} hash - IPFS hash to pin
 * @param {string} apiKey - Pinata API key
 * @param {string} secretKey - Pinata secret key
 * @returns {Promise<boolean>} Success status
 */
export const pinToIPFS = async (hash, apiKey, secretKey) => {
  try {
    const response = await fetch(`${IPFS_CONFIG.API_URL}/pinning/pinByHash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey
      },
      body: JSON.stringify({
        hashToPin: hash,
        pinataMetadata: {
          name: `pinned-${hash}`,
          keyvalues: {
            pinnedAt: new Date().toISOString()
          }
        }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('IPFS pin error:', error);
    return false;
  }
};

/**
 * Unpin content from IPFS
 * @param {string} hash - IPFS hash to unpin
 * @param {string} apiKey - Pinata API key
 * @param {string} secretKey - Pinata secret key
 * @returns {Promise<boolean>} Success status
 */
export const unpinFromIPFS = async (hash, apiKey, secretKey) => {
  try {
    const response = await fetch(`${IPFS_CONFIG.API_URL}/pinning/unpin/${hash}`, {
      method: 'DELETE',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey
      }
    });

    return response.ok;
  } catch (error) {
    console.error('IPFS unpin error:', error);
    return false;
  }
};

/**
 * Get pinned files list
 * @param {string} apiKey - Pinata API key
 * @param {string} secretKey - Pinata secret key
 * @returns {Promise<Array>} List of pinned files
 */
export const getPinnedFiles = async (apiKey, secretKey) => {
  try {
    const response = await fetch(`${IPFS_CONFIG.API_URL}/data/pinList`, {
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get pinned files: ${response.statusText}`);
    }

    const result = await response.json();
    return result.rows || [];
  } catch (error) {
    console.error('Error getting pinned files:', error);
    return [];
  }
};

/**
 * Create property metadata for IPFS storage
 * @param {object} propertyData - Property data
 * @param {Array} documentHashes - Array of document IPFS hashes
 * @returns {object} Metadata object
 */
export const createPropertyMetadata = (propertyData, documentHashes = []) => {
  return {
    name: `Property at ${propertyData.location}`,
    description: `${propertyData.propertyType} property with ${propertyData.area} sq meters`,
    image: documentHashes.find(hash => hash.type === 'image') || '',
    attributes: [
      {
        trait_type: 'Location',
        value: propertyData.location
      },
      {
        trait_type: 'Area',
        value: propertyData.area,
        display_type: 'number'
      },
      {
        trait_type: 'Property Type',
        value: propertyData.propertyType
      },
      {
        trait_type: 'Price',
        value: propertyData.price,
        display_type: 'number'
      },
      {
        trait_type: 'Verified',
        value: propertyData.verified || false
      }
    ],
    documents: documentHashes,
    created_at: new Date().toISOString(),
    version: '1.0'
  };
};
