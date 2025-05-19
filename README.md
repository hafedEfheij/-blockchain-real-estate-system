# Blockchain-Based Real Estate System

A decentralized application for property registration, tokenization, and transactions using blockchain technology.

## Features

- Property registration and verification
- Property tokenization using NFTs
- Secure property transactions
- Ownership tracking and verification
- Smart contract-based escrow system

## Technology Stack

- **Blockchain**: Ethereum
- **Smart Contract Development**: Solidity, Hardhat
- **Frontend**: React.js
- **Web3 Integration**: ethers.js, Web3Modal

## Project Structure

- `/blockchain-real-estate`: Smart contracts and blockchain logic
- `/frontend`: React-based user interface

## Smart Contracts

1. **PropertyRegistry**: Manages property registration, verification, and ownership
2. **PropertyToken**: Handles property tokenization using ERC-721 standard
3. **PropertyTransactions**: Manages property transactions and escrow

## Getting Started

### Prerequisites

- Node.js and npm
- MetaMask or another Ethereum wallet
- Hardhat for local blockchain development

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/hafedEfheij/-blockchain-real-estate-system.git
   cd -blockchain-real-estate-system
   ```

2. Install dependencies for smart contracts:
   ```
   cd blockchain-real-estate
   npm install
   ```

3. Install dependencies for frontend:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start a local blockchain:
   ```
   cd blockchain-real-estate
   npx hardhat node
   ```

2. Deploy smart contracts:
   ```
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. Update contract addresses in `frontend/src/utils/blockchain.js`

4. Start the frontend:
   ```
   cd ../frontend
   npm start
   ```

## Usage

1. Connect your wallet (MetaMask) to the application
2. Register a property by providing details
3. Properties can be verified by authorized verifiers
4. Tokenize your property to create an NFT representation
5. List properties for sale
6. Buy properties using the transaction system

## License

This project is licensed under the MIT License - see the LICENSE file for details.
