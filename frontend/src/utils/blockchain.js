import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import PropertyRegistryABI from '../contracts/PropertyRegistry.json';
import PropertyTokenABI from '../contracts/PropertyToken.json';
import PropertyTransactionsABI from '../contracts/PropertyTransactions.json';

// Contract addresses - these would be updated after deployment
const PROPERTY_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000000";
const PROPERTY_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
const PROPERTY_TRANSACTIONS_ADDRESS = "0x0000000000000000000000000000000000000000";

// Initialize Web3Modal
const providerOptions = {};
const web3Modal = new Web3Modal({
  network: "localhost", // Change to the appropriate network
  cacheProvider: true,
  providerOptions
});

// Connect to wallet
export const connectWallet = async () => {
  try {
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    return {
      provider,
      signer,
      address
    };
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
};

// Get contract instances
export const getContracts = async (signer) => {
  try {
    const propertyRegistry = new ethers.Contract(
      PROPERTY_REGISTRY_ADDRESS,
      PropertyRegistryABI.abi,
      signer
    );
    
    const propertyToken = new ethers.Contract(
      PROPERTY_TOKEN_ADDRESS,
      PropertyTokenABI.abi,
      signer
    );
    
    const propertyTransactions = new ethers.Contract(
      PROPERTY_TRANSACTIONS_ADDRESS,
      PropertyTransactionsABI.abi,
      signer
    );
    
    return {
      propertyRegistry,
      propertyToken,
      propertyTransactions
    };
  } catch (error) {
    console.error("Error getting contracts:", error);
    throw error;
  }
};

// Register a new property
export const registerProperty = async (signer, propertyData) => {
  try {
    const { propertyRegistry } = await getContracts(signer);
    
    const tx = await propertyRegistry.registerProperty(
      propertyData.location,
      propertyData.area,
      propertyData.propertyType,
      propertyData.documents,
      ethers.utils.parseEther(propertyData.price.toString()),
      propertyData.forSale
    );
    
    const receipt = await tx.wait();
    
    // Find the PropertyRegistered event
    const event = receipt.events.find(event => event.event === 'PropertyRegistered');
    const propertyId = event.args.propertyId;
    
    return propertyId;
  } catch (error) {
    console.error("Error registering property:", error);
    throw error;
  }
};

// Get property details
export const getProperty = async (signer, propertyId) => {
  try {
    const { propertyRegistry } = await getContracts(signer);
    const property = await propertyRegistry.getProperty(propertyId);
    
    return {
      id: property.id.toString(),
      location: property.location,
      area: property.area.toString(),
      propertyType: property.propertyType,
      documents: property.documents,
      owner: property.owner,
      price: ethers.utils.formatEther(property.price),
      forSale: property.forSale,
      verified: property.verified
    };
  } catch (error) {
    console.error("Error getting property:", error);
    throw error;
  }
};

// Get properties for sale
export const getPropertiesForSale = async (signer) => {
  try {
    const { propertyRegistry } = await getContracts(signer);
    const propertyIds = await propertyRegistry.getPropertiesForSale();
    
    const properties = await Promise.all(
      propertyIds.map(id => getProperty(signer, id))
    );
    
    return properties;
  } catch (error) {
    console.error("Error getting properties for sale:", error);
    throw error;
  }
};

// Get properties owned by user
export const getMyProperties = async (signer) => {
  try {
    const { propertyRegistry } = await getContracts(signer);
    const address = await signer.getAddress();
    const propertyIds = await propertyRegistry.getPropertiesByOwner(address);
    
    const properties = await Promise.all(
      propertyIds.map(id => getProperty(signer, id))
    );
    
    return properties;
  } catch (error) {
    console.error("Error getting my properties:", error);
    throw error;
  }
};

// Tokenize a property
export const tokenizeProperty = async (signer, propertyId, metadataURI) => {
  try {
    const { propertyToken } = await getContracts(signer);
    
    const tx = await propertyToken.tokenizeProperty(propertyId, metadataURI);
    const receipt = await tx.wait();
    
    // Find the PropertyTokenized event
    const event = receipt.events.find(event => event.event === 'PropertyTokenized');
    const tokenId = event.args.tokenId;
    
    return tokenId;
  } catch (error) {
    console.error("Error tokenizing property:", error);
    throw error;
  }
};

// Create a transaction to buy a property
export const createTransaction = async (signer, propertyId, price) => {
  try {
    const { propertyTransactions } = await getContracts(signer);
    
    const tx = await propertyTransactions.createTransaction(
      propertyId,
      { value: ethers.utils.parseEther(price.toString()) }
    );
    
    const receipt = await tx.wait();
    
    // Find the TransactionCreated event
    const event = receipt.events.find(event => event.event === 'TransactionCreated');
    const transactionId = event.args.transactionId;
    
    return transactionId;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

// Get transaction details
export const getTransaction = async (signer, transactionId) => {
  try {
    const { propertyTransactions } = await getContracts(signer);
    const transaction = await propertyTransactions.getTransaction(transactionId);
    const status = await propertyTransactions.getTransactionStatus(transactionId);
    
    return {
      id: transaction.id.toString(),
      propertyId: transaction.propertyId.toString(),
      seller: transaction.seller,
      buyer: transaction.buyer,
      price: ethers.utils.formatEther(transaction.price),
      timestamp: new Date(transaction.timestamp.toNumber() * 1000),
      completed: transaction.completed,
      status
    };
  } catch (error) {
    console.error("Error getting transaction:", error);
    throw error;
  }
};

// Get my transactions (as buyer)
export const getMyTransactionsAsBuyer = async (signer) => {
  try {
    const { propertyTransactions } = await getContracts(signer);
    const address = await signer.getAddress();
    const transactionIds = await propertyTransactions.getTransactionsByBuyer(address);
    
    const transactions = await Promise.all(
      transactionIds.map(id => getTransaction(signer, id))
    );
    
    return transactions;
  } catch (error) {
    console.error("Error getting my transactions as buyer:", error);
    throw error;
  }
};

// Get my transactions (as seller)
export const getMyTransactionsAsSeller = async (signer) => {
  try {
    const { propertyTransactions } = await getContracts(signer);
    const address = await signer.getAddress();
    const transactionIds = await propertyTransactions.getTransactionsBySeller(address);
    
    const transactions = await Promise.all(
      transactionIds.map(id => getTransaction(signer, id))
    );
    
    return transactions;
  } catch (error) {
    console.error("Error getting my transactions as seller:", error);
    throw error;
  }
};
