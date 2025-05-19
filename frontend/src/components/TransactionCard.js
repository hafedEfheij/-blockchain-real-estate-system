import React from 'react';

const TransactionCard = ({ transaction, onUpdateStatus, onComplete, onCancel, isAdmin }) => {
  // Transaction status mapping
  const statusMap = [
    'Created',
    'Inspection Passed',
    'Payment Received',
    'Completed',
    'Cancelled'
  ];

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Transaction #{transaction.id}</h5>
        <div className="card-text">
          <p><strong>Property ID:</strong> {transaction.propertyId}</p>
          <p><strong>Seller:</strong> {transaction.seller.substring(0, 6)}...{transaction.seller.substring(transaction.seller.length - 4)}</p>
          <p><strong>Buyer:</strong> {transaction.buyer.substring(0, 6)}...{transaction.buyer.substring(transaction.buyer.length - 4)}</p>
          <p><strong>Price:</strong> {transaction.price} ETH</p>
          <p><strong>Date:</strong> {transaction.timestamp.toLocaleString()}</p>
          <p><strong>Status:</strong> <span className={`badge ${transaction.status === 3 ? 'bg-success' : transaction.status === 4 ? 'bg-danger' : 'bg-primary'}`}>{statusMap[transaction.status]}</span></p>
        </div>
        <div className="mt-3">
          {!transaction.completed && transaction.status !== 4 && (
            <>
              {transaction.status === 0 && (
                <button 
                  className="btn btn-outline-primary me-2" 
                  onClick={() => onUpdateStatus(transaction.id, 1)}
                >
                  Approve Inspection
                </button>
              )}
              {transaction.status === 1 && (
                <button 
                  className="btn btn-outline-primary me-2" 
                  onClick={() => onUpdateStatus(transaction.id, 2)}
                >
                  Confirm Payment
                </button>
              )}
              {transaction.status === 2 && isAdmin && (
                <button 
                  className="btn btn-success me-2" 
                  onClick={() => onComplete(transaction.id)}
                >
                  Complete Transaction
                </button>
              )}
              <button 
                className="btn btn-danger" 
                onClick={() => onCancel(transaction.id)}
              >
                Cancel Transaction
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
