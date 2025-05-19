import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import PropertyCard from './components/PropertyCard';
import PropertyForm from './components/PropertyForm';
import TransactionCard from './components/TransactionCard';
import {
  getPropertiesForSale,
  getMyProperties,
  registerProperty,
  tokenizeProperty,
  createTransaction,
  getMyTransactionsAsBuyer,
  getMyTransactionsAsSeller,
  getTransaction
} from './utils/blockchain';

function App() {
  const [walletInfo, setWalletInfo] = useState({});
  const [properties, setProperties] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('properties');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (walletInfo.signer) {
      loadData();
    }
  }, [walletInfo, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'properties') {
        const propertiesData = await getPropertiesForSale(walletInfo.signer);
        setProperties(propertiesData);
      } else if (activeTab === 'my-properties') {
        const myPropertiesData = await getMyProperties(walletInfo.signer);
        setMyProperties(myPropertiesData);
      } else if (activeTab === 'transactions') {
        const buyerTransactions = await getMyTransactionsAsBuyer(walletInfo.signer);
        const sellerTransactions = await getMyTransactionsAsSeller(walletInfo.signer);

        // Combine and sort by timestamp (newest first)
        const allTransactions = [...buyerTransactions, ...sellerTransactions]
          .sort((a, b) => b.timestamp - a.timestamp);

        setTransactions(allTransactions);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterProperty = async (propertyData) => {
    setLoading(true);
    setError('');
    try {
      await registerProperty(walletInfo.signer, propertyData);
      setActiveTab('my-properties');
    } catch (error) {
      console.error('Error registering property:', error);
      setError('Failed to register property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyProperty = async (propertyId, price) => {
    setLoading(true);
    setError('');
    try {
      await createTransaction(walletInfo.signer, propertyId, price);
      setActiveTab('transactions');
    } catch (error) {
      console.error('Error buying property:', error);
      setError('Failed to create transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenizeProperty = async (propertyId) => {
    setLoading(true);
    setError('');
    try {
      // For simplicity, we're using a placeholder metadata URI
      const metadataURI = `ipfs://property-metadata-${propertyId}`;
      await tokenizeProperty(walletInfo.signer, propertyId, metadataURI);
      await loadData();
    } catch (error) {
      console.error('Error tokenizing property:', error);
      setError('Failed to tokenize property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransactionStatus = async (transactionId, status) => {
    setLoading(true);
    setError('');
    try {
      // This would call the updateTransactionStatus function
      // For now, we'll just reload the data
      await loadData();
    } catch (error) {
      console.error('Error updating transaction status:', error);
      setError('Failed to update transaction status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTransaction = async (transactionId) => {
    setLoading(true);
    setError('');
    try {
      // This would call the completeTransaction function
      // For now, we'll just reload the data
      await loadData();
    } catch (error) {
      console.error('Error completing transaction:', error);
      setError('Failed to complete transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTransaction = async (transactionId) => {
    setLoading(true);
    setError('');
    try {
      // This would call the cancelTransaction function
      // For now, we'll just reload the data
      await loadData();
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      setError('Failed to cancel transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!walletInfo.signer) {
      return (
        <div className="text-center mt-5">
          <h2>Welcome to Blockchain Real Estate</h2>
          <p>Connect your wallet to get started</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      );
    }

    switch (activeTab) {
      case 'properties':
        return (
          <div>
            <h2>Properties For Sale</h2>
            <div className="row">
              {properties.length > 0 ? (
                properties.map(property => (
                  <div className="col-md-4" key={property.id}>
                    <PropertyCard
                      property={property}
                      onBuy={handleBuyProperty}
                      isOwner={property.owner === walletInfo.address}
                    />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center mt-3">
                  <p>No properties for sale</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'my-properties':
        return (
          <div>
            <h2>My Properties</h2>
            <div className="row mb-4">
              <div className="col-md-6">
                <PropertyForm onSubmit={handleRegisterProperty} />
              </div>
            </div>
            <div className="row">
              {myProperties.length > 0 ? (
                myProperties.map(property => (
                  <div className="col-md-4" key={property.id}>
                    <PropertyCard
                      property={property}
                      onTokenize={handleTokenizeProperty}
                      isOwner={true}
                    />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center mt-3">
                  <p>You don't own any properties yet</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div>
            <h2>My Transactions</h2>
            <div className="row">
              {transactions.length > 0 ? (
                transactions.map(transaction => (
                  <div className="col-md-6" key={transaction.id}>
                    <TransactionCard
                      transaction={transaction}
                      onUpdateStatus={handleUpdateTransactionStatus}
                      onComplete={handleCompleteTransaction}
                      onCancel={handleCancelTransaction}
                      isAdmin={walletInfo.address === transaction.seller}
                    />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center mt-3">
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Navbar setWalletInfo={setWalletInfo} />
      <div className="container mt-4">
        {walletInfo.signer && (
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'properties' ? 'active' : ''}`}
                onClick={() => setActiveTab('properties')}
              >
                Properties For Sale
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'my-properties' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-properties')}
              >
                My Properties
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </button>
            </li>
          </ul>
        )}
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
