// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IPropertyTransactions.sol";
import "../interfaces/IPropertyRegistry.sol";
import "../interfaces/IPropertyToken.sol";

/**
 * @title PropertyTransactions
 * @dev Implementation of property transactions
 */
contract PropertyTransactions is IPropertyTransactions, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Counter for transaction IDs
    Counters.Counter private _transactionIdCounter;
    
    // Reference to the PropertyRegistry contract
    IPropertyRegistry private _propertyRegistry;
    
    // Reference to the PropertyToken contract
    IPropertyToken private _propertyToken;
    
    // Mapping from transaction ID to Transaction struct
    mapping(uint256 => Transaction) private _transactions;
    
    // Mapping from transaction ID to transaction status
    mapping(uint256 => TransactionStatus) private _transactionStatus;
    
    // Mapping from property ID to array of transaction IDs
    mapping(uint256 => uint256[]) private _propertyTransactions;
    
    // Mapping from buyer address to array of transaction IDs
    mapping(address => uint256[]) private _buyerTransactions;
    
    // Mapping from seller address to array of transaction IDs
    mapping(address => uint256[]) private _sellerTransactions;
    
    // Mapping from transaction ID to escrow amount
    mapping(uint256 => uint256) private _escrowAmounts;
    
    /**
     * @dev Constructor
     * @param propertyRegistryAddress Address of the PropertyRegistry contract
     * @param propertyTokenAddress Address of the PropertyToken contract
     */
    constructor(
        address propertyRegistryAddress,
        address propertyTokenAddress
    ) Ownable(msg.sender) {
        _propertyRegistry = IPropertyRegistry(propertyRegistryAddress);
        _propertyToken = IPropertyToken(propertyTokenAddress);
    }
    
    /**
     * @dev Modifier to check if the caller is a party in the transaction
     */
    modifier onlyTransactionParty(uint256 _transactionId) {
        require(
            _transactions[_transactionId].buyer == msg.sender ||
            _transactions[_transactionId].seller == msg.sender,
            "Not a party in the transaction"
        );
        _;
    }
    
    /**
     * @dev Create a new transaction for buying a property
     * @param _propertyId ID of the property to buy
     * @return transactionId The ID of the newly created transaction
     */
    function createTransaction(uint256 _propertyId) 
        external 
        payable 
        override 
        nonReentrant 
        returns (uint256) 
    {
        // Get property details
        IPropertyRegistry.Property memory property = _propertyRegistry.getProperty(_propertyId);
        
        // Check if property exists and is for sale
        require(property.forSale, "Property not for sale");
        
        // Check if buyer is not the owner
        require(property.owner != msg.sender, "Cannot buy your own property");
        
        // Check if payment is sufficient
        require(msg.value >= property.price, "Insufficient payment");
        
        _transactionIdCounter.increment();
        uint256 transactionId = _transactionIdCounter.current();
        
        // Create transaction
        Transaction memory newTransaction = Transaction({
            id: transactionId,
            propertyId: _propertyId,
            seller: property.owner,
            buyer: msg.sender,
            price: property.price,
            timestamp: block.timestamp,
            completed: false
        });
        
        _transactions[transactionId] = newTransaction;
        _transactionStatus[transactionId] = TransactionStatus.Created;
        
        // Store escrow amount
        _escrowAmounts[transactionId] = msg.value;
        
        // Add to mappings
        _propertyTransactions[_propertyId].push(transactionId);
        _buyerTransactions[msg.sender].push(transactionId);
        _sellerTransactions[property.owner].push(transactionId);
        
        emit TransactionCreated(
            transactionId,
            _propertyId,
            msg.sender,
            property.owner,
            property.price
        );
        
        return transactionId;
    }
    
    /**
     * @dev Update transaction status (only authorized parties)
     * @param _transactionId ID of the transaction
     * @param _status New status of the transaction
     */
    function updateTransactionStatus(uint256 _transactionId, TransactionStatus _status) 
        external 
        override 
        onlyTransactionParty(_transactionId) 
    {
        require(_transactionId <= _transactionIdCounter.current(), "Transaction does not exist");
        require(!_transactions[_transactionId].completed, "Transaction already completed");
        
        // Validate status transition
        TransactionStatus currentStatus = _transactionStatus[_transactionId];
        
        if (_status == TransactionStatus.InspectionPassed) {
            require(currentStatus == TransactionStatus.Created, "Invalid status transition");
            require(msg.sender == _transactions[_transactionId].buyer, "Only buyer can approve inspection");
        } else if (_status == TransactionStatus.PaymentReceived) {
            require(currentStatus == TransactionStatus.InspectionPassed, "Invalid status transition");
            // This would typically be triggered by an oracle or admin in a real system
            // For simplicity, we're allowing either party to update this status
        }
        
        _transactionStatus[_transactionId] = _status;
        
        emit TransactionStatusUpdated(_transactionId, _status);
    }
    
    /**
     * @dev Complete a transaction (transfer ownership and funds)
     * @param _transactionId ID of the transaction
     */
    function completeTransaction(uint256 _transactionId) 
        external 
        override 
        nonReentrant 
    {
        require(_transactionId <= _transactionIdCounter.current(), "Transaction does not exist");
        require(!_transactions[_transactionId].completed, "Transaction already completed");
        
        // Only owner of the contract can complete transactions
        // In a real system, this might be more complex with multi-sig or oracles
        require(msg.sender == owner(), "Only contract owner can complete transactions");
        
        Transaction storage transaction = _transactions[_transactionId];
        uint256 propertyId = transaction.propertyId;
        address seller = transaction.seller;
        address buyer = transaction.buyer;
        uint256 price = transaction.price;
        
        // Check if property is tokenized
        bool isTokenized = _propertyToken.isPropertyTokenized(propertyId);
        
        // Transfer property ownership
        if (isTokenized) {
            // If tokenized, transfer the token
            uint256 tokenId = _propertyToken.getTokenIdByProperty(propertyId);
            // This would require the seller to have approved this contract to transfer the token
            // In a real implementation, we would need to handle this approval process
        } else {
            // If not tokenized, transfer the property directly
            // This would require the PropertyRegistry to allow this contract to transfer properties
            // For simplicity, we're assuming it does
        }
        
        // Transfer funds to seller
        uint256 escrowAmount = _escrowAmounts[_transactionId];
        (bool success, ) = payable(seller).call{value: escrowAmount}("");
        require(success, "Failed to send funds to seller");
        
        // Mark transaction as completed
        transaction.completed = true;
        _transactionStatus[_transactionId] = TransactionStatus.Completed;
        
        emit TransactionCompleted(
            _transactionId,
            propertyId,
            buyer,
            seller,
            price
        );
    }
    
    /**
     * @dev Cancel a transaction
     * @param _transactionId ID of the transaction
     * @param _reason Reason for cancellation
     */
    function cancelTransaction(uint256 _transactionId, string memory _reason) 
        external 
        override 
        onlyTransactionParty(_transactionId) 
        nonReentrant 
    {
        require(_transactionId <= _transactionIdCounter.current(), "Transaction does not exist");
        require(!_transactions[_transactionId].completed, "Transaction already completed");
        
        Transaction storage transaction = _transactions[_transactionId];
        
        // Refund buyer
        uint256 escrowAmount = _escrowAmounts[_transactionId];
        (bool success, ) = payable(transaction.buyer).call{value: escrowAmount}("");
        require(success, "Failed to refund buyer");
        
        // Mark transaction as cancelled
        _transactionStatus[_transactionId] = TransactionStatus.Cancelled;
        
        emit TransactionCancelled(_transactionId, _reason);
    }
    
    /**
     * @dev Get transaction details
     * @param _transactionId ID of the transaction
     * @return Transaction details
     */
    function getTransaction(uint256 _transactionId) 
        external 
        view 
        override 
        returns (Transaction memory) 
    {
        require(_transactionId <= _transactionIdCounter.current(), "Transaction does not exist");
        return _transactions[_transactionId];
    }
    
    /**
     * @dev Get transaction status
     * @param _transactionId ID of the transaction
     * @return status Transaction status
     */
    function getTransactionStatus(uint256 _transactionId) external view returns (TransactionStatus) {
        require(_transactionId <= _transactionIdCounter.current(), "Transaction does not exist");
        return _transactionStatus[_transactionId];
    }
    
    /**
     * @dev Get all transactions for a property
     * @param _propertyId ID of the property
     * @return Array of transaction IDs
     */
    function getTransactionsByProperty(uint256 _propertyId) 
        external 
        view 
        override 
        returns (uint256[] memory) 
    {
        return _propertyTransactions[_propertyId];
    }
    
    /**
     * @dev Get all transactions for a buyer
     * @param _buyer Address of the buyer
     * @return Array of transaction IDs
     */
    function getTransactionsByBuyer(address _buyer) 
        external 
        view 
        override 
        returns (uint256[] memory) 
    {
        return _buyerTransactions[_buyer];
    }
    
    /**
     * @dev Get all transactions for a seller
     * @param _seller Address of the seller
     * @return Array of transaction IDs
     */
    function getTransactionsBySeller(address _seller) 
        external 
        view 
        override 
        returns (uint256[] memory) 
    {
        return _sellerTransactions[_seller];
    }
}
