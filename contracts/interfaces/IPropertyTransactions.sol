// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPropertyTransactions
 * @dev Interface for property transactions
 */
interface IPropertyTransactions {
    /**
     * @dev Struct to store transaction details
     */
    struct Transaction {
        uint256 id;
        uint256 propertyId;
        address seller;
        address buyer;
        uint256 price;
        uint256 timestamp;
        bool completed;
    }

    /**
     * @dev Enum for transaction status
     */
    enum TransactionStatus {
        Created,
        InspectionPassed,
        PaymentReceived,
        Completed,
        Cancelled
    }

    /**
     * @dev Event emitted when a new transaction is created
     */
    event TransactionCreated(
        uint256 indexed transactionId,
        uint256 indexed propertyId,
        address indexed buyer,
        address seller,
        uint256 price
    );

    /**
     * @dev Event emitted when a transaction status is updated
     */
    event TransactionStatusUpdated(
        uint256 indexed transactionId,
        TransactionStatus status
    );

    /**
     * @dev Event emitted when a transaction is completed
     */
    event TransactionCompleted(
        uint256 indexed transactionId,
        uint256 indexed propertyId,
        address indexed buyer,
        address seller,
        uint256 price
    );

    /**
     * @dev Event emitted when a transaction is cancelled
     */
    event TransactionCancelled(
        uint256 indexed transactionId,
        string reason
    );

    /**
     * @dev Create a new transaction for buying a property
     * @param _propertyId ID of the property to buy
     * @return transactionId The ID of the newly created transaction
     */
    function createTransaction(uint256 _propertyId) external payable returns (uint256 transactionId);

    /**
     * @dev Update transaction status (only authorized parties)
     * @param _transactionId ID of the transaction
     * @param _status New status of the transaction
     */
    function updateTransactionStatus(uint256 _transactionId, TransactionStatus _status) external;

    /**
     * @dev Complete a transaction (transfer ownership and funds)
     * @param _transactionId ID of the transaction
     */
    function completeTransaction(uint256 _transactionId) external;

    /**
     * @dev Cancel a transaction
     * @param _transactionId ID of the transaction
     * @param _reason Reason for cancellation
     */
    function cancelTransaction(uint256 _transactionId, string memory _reason) external;

    /**
     * @dev Get transaction details
     * @param _transactionId ID of the transaction
     * @return Transaction details
     */
    function getTransaction(uint256 _transactionId) external view returns (Transaction memory);

    /**
     * @dev Get all transactions for a property
     * @param _propertyId ID of the property
     * @return Array of transaction IDs
     */
    function getTransactionsByProperty(uint256 _propertyId) external view returns (uint256[] memory);

    /**
     * @dev Get all transactions for a buyer
     * @param _buyer Address of the buyer
     * @return Array of transaction IDs
     */
    function getTransactionsByBuyer(address _buyer) external view returns (uint256[] memory);

    /**
     * @dev Get all transactions for a seller
     * @param _seller Address of the seller
     * @return Array of transaction IDs
     */
    function getTransactionsBySeller(address _seller) external view returns (uint256[] memory);
}
