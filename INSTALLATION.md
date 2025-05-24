# Installation Guide

This guide will help you set up and run the Blockchain Real Estate System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Git
- MetaMask browser extension

## Step 1: Clone the Repository

```bash
git clone https://github.com/hafedEfheij/-blockchain-real-estate-system.git
cd -blockchain-real-estate-system
```

## Step 2: Install Dependencies

### Install Smart Contract Dependencies
```bash
cd blockchain-real-estate
npm install
```

### Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Step 3: Set Up Local Blockchain

1. Start a local Hardhat blockchain network:
```bash
cd ../blockchain-real-estate
npx hardhat node
```

2. In a new terminal, compile and deploy the smart contracts:
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

## Step 4: Configure Frontend

1. Update the contract addresses in `frontend/src/utils/blockchain.js` with the deployed contract addresses from step 3.

2. Make sure MetaMask is configured to connect to your local network:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

## Step 5: Start the Frontend

```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`.

## Step 6: Connect Your Wallet

1. Open the application in your browser
2. Click "Connect Wallet" in the top-right corner
3. Select MetaMask and approve the connection
4. Make sure you're connected to the Localhost 8545 network

## Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed and unlocked
- Check that you're on the correct network (Localhost 8545)
- Try refreshing the page and reconnecting

### Smart Contract Deployment Issues
- Make sure the local Hardhat network is running
- Check that all dependencies are installed correctly
- Verify that the contract compilation was successful

### Frontend Issues
- Clear your browser cache
- Check the browser console for error messages
- Ensure all npm dependencies are installed

## Getting Test ETH

For the local network, you can use the test accounts provided by Hardhat. These accounts come pre-funded with test ETH.

## Next Steps

Once everything is set up, you can:
1. Register properties
2. List properties for sale
3. Buy and sell properties
4. Tokenize properties as NFTs
5. Manage transactions

For more information, see the main README.md file.
