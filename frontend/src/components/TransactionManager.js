import React, { useState, useEffect } from 'react';
import { TRANSACTION_STATUS, TRANSACTION_STATUS_LABELS } from '../utils/constants';
import { formatEther, formatAddress, timeAgo } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const TransactionManager = ({ 
  signer, 
  userAddress,
  onTransactionUpdate 
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (signer && userAddress) {
      loadTransactions();
    }
  }, [signer, userAddress]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      // In a real implementation, this would fetch from the blockchain
      // For demo purposes, we'll use mock data
      const mockTransactions = [
        {
          id: '1',
          propertyId: '1',
          seller: '0x1234567890123456789012345678901234567890',
          buyer: userAddress,
          price: '100',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          status: TRANSACTION_STATUS.CREATED,
          completed: false,
          type: 'purchase'
        },
        {
          id: '2',
          propertyId: '2',
          seller: userAddress,
          buyer: '0x0987654321098765432109876543210987654321',
          price: '75',
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          status: TRANSACTION_STATUS.COMPLETED,
          completed: true,
          type: 'sale'
        }
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;

    // Apply filter
    switch (filter) {
      case 'purchases':
        filtered = filtered.filter(tx => tx.buyer === userAddress);
        break;
      case 'sales':
        filtered = filtered.filter(tx => tx.seller === userAddress);
        break;
      case 'pending':
        filtered = filtered.filter(tx => !tx.completed);
        break;
      case 'completed':
        filtered = filtered.filter(tx => tx.completed);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
    }

    return filtered;
  };

  const handleUpdateStatus = async (transactionId, newStatus) => {
    try {
      setUpdating(true);
      setError('');

      // In a real implementation, this would call the smart contract
      console.log(`Updating transaction ${transactionId} to status ${newStatus}`);
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local state
      setTransactions(prev => prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, status: newStatus }
          : tx
      ));

      if (onTransactionUpdate) {
        onTransactionUpdate(transactionId, newStatus);
      }

    } catch (error) {
      console.error('Error updating transaction:', error);
      setError('Failed to update transaction status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteTransaction = async (transactionId) => {
    const confirmed = window.confirm(
      'Are you sure you want to complete this transaction? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      setUpdating(true);
      setError('');

      // In a real implementation, this would call the smart contract
      console.log(`Completing transaction ${transactionId}`);
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state
      setTransactions(prev => prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, status: TRANSACTION_STATUS.COMPLETED, completed: true }
          : tx
      ));

      if (onTransactionUpdate) {
        onTransactionUpdate(transactionId, TRANSACTION_STATUS.COMPLETED);
      }

      alert('Transaction completed successfully!');

    } catch (error) {
      console.error('Error completing transaction:', error);
      setError('Failed to complete transaction');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelTransaction = async (transactionId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      setUpdating(true);
      setError('');

      // In a real implementation, this would call the smart contract
      console.log(`Cancelling transaction ${transactionId} with reason: ${reason}`);
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local state
      setTransactions(prev => prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, status: TRANSACTION_STATUS.CANCELLED, completed: false }
          : tx
      ));

      if (onTransactionUpdate) {
        onTransactionUpdate(transactionId, TRANSACTION_STATUS.CANCELLED);
      }

      alert('Transaction cancelled successfully!');

    } catch (error) {
      console.error('Error cancelling transaction:', error);
      setError('Failed to cancel transaction');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case TRANSACTION_STATUS.COMPLETED:
        return 'bg-success';
      case TRANSACTION_STATUS.CANCELLED:
        return 'bg-danger';
      case TRANSACTION_STATUS.PAYMENT_RECEIVED:
        return 'bg-info';
      case TRANSACTION_STATUS.INSPECTION_PASSED:
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const canUpdateStatus = (transaction) => {
    return !transaction.completed && 
           transaction.status !== TRANSACTION_STATUS.CANCELLED &&
           (transaction.buyer === userAddress || transaction.seller === userAddress);
  };

  const canCompleteTransaction = (transaction) => {
    return !transaction.completed && 
           transaction.status === TRANSACTION_STATUS.PAYMENT_RECEIVED &&
           transaction.seller === userAddress;
  };

  if (loading) {
    return <LoadingSpinner message="Loading transactions..." />;
  }

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h2>
            <i className="bi bi-arrow-left-right me-2"></i>
            Transaction Manager
          </h2>
          <p className="text-muted">Manage your property transactions</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <label htmlFor="filter" className="form-label me-2 mb-0">Filter:</label>
            <select
              id="filter"
              className="form-select form-select-sm me-3"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Transactions</option>
              <option value="purchases">My Purchases</option>
              <option value="sales">My Sales</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            
            <label htmlFor="sortBy" className="form-label me-2 mb-0">Sort:</label>
            <select
              id="sortBy"
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>
          </div>
        </div>
        <div className="col-md-6 text-end">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={loadTransactions}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage error={error} onRetry={loadTransactions} />
      )}

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="row">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="col-12 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      <h6 className="mb-1">
                        <i className="bi bi-hash"></i>
                        {transaction.id}
                      </h6>
                      <small className="text-muted">
                        Property #{transaction.propertyId}
                      </small>
                    </div>
                    
                    <div className="col-md-2">
                      <strong>{formatEther(transaction.price)}</strong>
                      <br />
                      <small className="text-muted">
                        {timeAgo(transaction.timestamp)}
                      </small>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="small">
                        <strong>Seller:</strong> {formatAddress(transaction.seller)}
                        <br />
                        <strong>Buyer:</strong> {formatAddress(transaction.buyer)}
                      </div>
                    </div>
                    
                    <div className="col-md-2">
                      <span className={`badge ${getStatusBadgeClass(transaction.status)}`}>
                        {TRANSACTION_STATUS_LABELS[transaction.status]}
                      </span>
                      <br />
                      <small className="text-muted">
                        {transaction.type === 'purchase' ? 'Purchase' : 'Sale'}
                      </small>
                    </div>
                    
                    <div className="col-md-3 text-end">
                      {canUpdateStatus(transaction) && (
                        <div className="btn-group btn-group-sm me-2">
                          {transaction.status === TRANSACTION_STATUS.CREATED && (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleUpdateStatus(transaction.id, TRANSACTION_STATUS.INSPECTION_PASSED)}
                              disabled={updating}
                            >
                              Approve Inspection
                            </button>
                          )}
                          {transaction.status === TRANSACTION_STATUS.INSPECTION_PASSED && (
                            <button
                              className="btn btn-outline-info"
                              onClick={() => handleUpdateStatus(transaction.id, TRANSACTION_STATUS.PAYMENT_RECEIVED)}
                              disabled={updating}
                            >
                              Confirm Payment
                            </button>
                          )}
                        </div>
                      )}
                      
                      {canCompleteTransaction(transaction) && (
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleCompleteTransaction(transaction.id)}
                          disabled={updating}
                        >
                          Complete
                        </button>
                      )}
                      
                      {canUpdateStatus(transaction) && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleCancelTransaction(transaction.id)}
                          disabled={updating}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-inbox display-1 text-muted"></i>
          <h3 className="mt-3">No Transactions Found</h3>
          <p className="text-muted">
            {filter === 'all' 
              ? 'You have no transactions yet.' 
              : `No transactions match the selected filter: ${filter}`}
          </p>
        </div>
      )}

      {/* Loading Overlay */}
      {updating && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="bg-white p-4 rounded">
            <LoadingSpinner message="Updating transaction..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;
