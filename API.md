# Smart Contract API Documentation

This document describes the API for the smart contracts in the Blockchain Real Estate System.

## PropertyRegistry Contract

### Functions

#### `registerProperty(location, area, propertyType, documents, price, forSale)`
Registers a new property on the blockchain.

**Parameters:**
- `location` (string): Physical location of the property
- `area` (uint256): Area of the property in square meters
- `propertyType` (string): Type of property (e.g., "Residential", "Commercial")
- `documents` (string[]): Array of document URIs (IPFS links)
- `price` (uint256): Price in wei
- `forSale` (bool): Whether the property is listed for sale

**Returns:** `uint256` - Property ID

#### `verifyProperty(propertyId)`
Verifies a property (only authorized verifiers can call this).

**Parameters:**
- `propertyId` (uint256): ID of the property to verify

#### `getProperty(propertyId)`
Gets details of a specific property.

**Parameters:**
- `propertyId` (uint256): ID of the property

**Returns:** Property struct with all details

#### `getPropertiesForSale()`
Gets all properties currently listed for sale.

**Returns:** `uint256[]` - Array of property IDs

#### `getPropertiesByOwner(owner)`
Gets all properties owned by a specific address.

**Parameters:**
- `owner` (address): Address of the property owner

**Returns:** `uint256[]` - Array of property IDs

### Events

#### `PropertyRegistered(propertyId, owner, location)`
Emitted when a new property is registered.

#### `PropertyVerified(propertyId, verifier)`
Emitted when a property is verified.

#### `PropertyListed(propertyId, price)`
Emitted when a property is listed for sale.

## PropertyToken Contract

### Functions

#### `tokenizeProperty(propertyId, metadataURI)`
Creates an NFT token for a property.

**Parameters:**
- `propertyId` (uint256): ID of the property to tokenize
- `metadataURI` (string): URI for token metadata

**Returns:** `uint256` - Token ID

#### `getTokenDetails(tokenId)`
Gets details of a property token.

**Parameters:**
- `tokenId` (uint256): ID of the token

**Returns:** Property ID, owner address, and metadata URI

#### `isPropertyTokenized(propertyId)`
Checks if a property has been tokenized.

**Parameters:**
- `propertyId` (uint256): ID of the property

**Returns:** `bool` - Whether the property is tokenized

### Events

#### `PropertyTokenized(tokenId, propertyId, owner)`
Emitted when a property is tokenized.

## PropertyTransactions Contract

### Functions

#### `createTransaction(propertyId)`
Creates a new transaction to buy a property.

**Parameters:**
- `propertyId` (uint256): ID of the property to buy

**Payable:** Must send ETH equal to or greater than the property price

**Returns:** `uint256` - Transaction ID

#### `updateTransactionStatus(transactionId, status)`
Updates the status of a transaction.

**Parameters:**
- `transactionId` (uint256): ID of the transaction
- `status` (TransactionStatus): New status

#### `completeTransaction(transactionId)`
Completes a transaction and transfers ownership.

**Parameters:**
- `transactionId` (uint256): ID of the transaction

#### `getTransaction(transactionId)`
Gets details of a transaction.

**Parameters:**
- `transactionId` (uint256): ID of the transaction

**Returns:** Transaction struct with all details

### Transaction Status Enum

- `0` - Created
- `1` - InspectionPassed
- `2` - PaymentReceived
- `3` - Completed
- `4` - Cancelled

### Events

#### `TransactionCreated(transactionId, propertyId, buyer, seller, price)`
Emitted when a new transaction is created.

#### `TransactionCompleted(transactionId, propertyId, buyer, seller, price)`
Emitted when a transaction is completed.

## Frontend API Functions

### Wallet Connection

#### `connectWallet()`
Connects to the user's MetaMask wallet.

**Returns:** Object with provider, signer, and address

### Property Management

#### `registerProperty(signer, propertyData)`
Registers a new property.

#### `getPropertiesForSale(signer)`
Gets all properties for sale.

#### `getMyProperties(signer)`
Gets properties owned by the connected wallet.

### Transactions

#### `createTransaction(signer, propertyId, price)`
Creates a transaction to buy a property.

#### `getMyTransactionsAsBuyer(signer)`
Gets transactions where the user is the buyer.

#### `getMyTransactionsAsSeller(signer)`
Gets transactions where the user is the seller.

## Error Handling

All functions include comprehensive error handling with descriptive error messages. Common errors include:

- Insufficient permissions
- Invalid property IDs
- Insufficient funds
- Network connection issues
- Wallet connection problems
