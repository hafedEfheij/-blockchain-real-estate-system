# Deployment Guide

This guide provides detailed instructions for deploying the Blockchain Real Estate System to various networks.

## Prerequisites

Before deploying, ensure you have:

1. **Node.js** (v14 or higher) installed
2. **npm** or **yarn** package manager
3. **Hardhat** development environment set up
4. **Private keys** for deployment accounts
5. **RPC URLs** for target networks
6. **API keys** for contract verification (optional)

## Environment Setup

1. **Copy environment file:**
   ```bash
   cd blockchain-real-estate
   cp .env.example .env
   ```

2. **Configure environment variables:**
   ```bash
   # Network Configuration
   PRIVATE_KEY=your_private_key_here
   INFURA_PROJECT_ID=your_infura_project_id
   
   # API Keys for Contract Verification
   ETHERSCAN_API_KEY=your_etherscan_api_key
   POLYGONSCAN_API_KEY=your_polygonscan_api_key
   BSCSCAN_API_KEY=your_bscscan_api_key
   
   # Gas Configuration
   GAS_PRICE=20000000000
   GAS_LIMIT=6000000
   ```

## Supported Networks

### Ethereum Networks
- **Mainnet** - Production Ethereum network
- **Goerli** - Ethereum testnet
- **Sepolia** - Ethereum testnet

### Layer 2 Networks
- **Polygon** - Polygon mainnet
- **Mumbai** - Polygon testnet
- **Arbitrum** - Arbitrum One
- **Optimism** - Optimism mainnet

### Other Networks
- **BSC** - Binance Smart Chain
- **BSC Testnet** - Binance Smart Chain testnet

## Deployment Commands

### Local Development
```bash
# Start local Hardhat node
npm run node

# Deploy to local network
npm run deploy:local
```

### Testnet Deployment
```bash
# Deploy to Goerli testnet
npm run deploy:testnet -- --network goerli

# Deploy to Sepolia testnet
npm run deploy:testnet -- --network sepolia

# Deploy to Mumbai testnet
npm run deploy:testnet -- --network mumbai
```

### Mainnet Deployment
```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy-testnet.js --network mainnet

# Deploy to Polygon mainnet
npx hardhat run scripts/deploy-testnet.js --network polygon

# Deploy to BSC mainnet
npx hardhat run scripts/deploy-testnet.js --network bsc
```

## Step-by-Step Deployment

### 1. Compile Contracts
```bash
cd blockchain-real-estate
npm run compile
```

### 2. Run Tests
```bash
npm run test
npm run test:coverage
```

### 3. Deploy Contracts
```bash
# For testnet
npm run deploy:testnet -- --network goerli

# For mainnet (be careful!)
npx hardhat run scripts/deploy-testnet.js --network mainnet
```

### 4. Verify Contracts
```bash
npm run verify -- --network goerli
```

### 5. Update Frontend Configuration
After deployment, update the contract addresses in:
- `frontend/src/utils/blockchain.js`
- `frontend/.env`

## Network-Specific Instructions

### Ethereum Mainnet
- **Gas Price:** 20-50 gwei (check current rates)
- **Deployment Cost:** ~0.05-0.1 ETH
- **Verification:** Automatic via Etherscan

### Polygon
- **Gas Price:** 30-100 gwei
- **Deployment Cost:** ~0.1-0.5 MATIC
- **Verification:** Via Polygonscan

### BSC
- **Gas Price:** 5-20 gwei
- **Deployment Cost:** ~0.01-0.05 BNB
- **Verification:** Via BscScan

## Post-Deployment Steps

### 1. Verify Deployment
```bash
# Check contract addresses
npx hardhat run scripts/verify-deployment.js --network <network>
```

### 2. Initialize Contracts
```bash
# Add initial verifiers
npx hardhat run scripts/initialize.js --network <network>
```

### 3. Update Frontend
```bash
cd frontend
# Update contract addresses in .env
REACT_APP_PROPERTY_REGISTRY_ADDRESS=0x...
REACT_APP_PROPERTY_TOKEN_ADDRESS=0x...
REACT_APP_PROPERTY_TRANSACTIONS_ADDRESS=0x...

# Build and deploy frontend
npm run build
```

## Security Considerations

### Private Key Management
- **Never commit private keys** to version control
- Use **hardware wallets** for mainnet deployments
- Consider **multi-signature wallets** for contract ownership

### Contract Security
- **Audit contracts** before mainnet deployment
- Use **timelock contracts** for critical functions
- Implement **emergency pause** mechanisms

### Access Control
- Set up **proper admin roles**
- Use **multi-signature** for admin functions
- **Transfer ownership** to secure addresses

## Troubleshooting

### Common Issues

#### Gas Estimation Failed
```bash
# Solution: Increase gas limit
npx hardhat run scripts/deploy.js --network <network> --gas-limit 8000000
```

#### Insufficient Funds
```bash
# Check account balance
npx hardhat run scripts/check-balance.js --network <network>
```

#### Network Connection Issues
```bash
# Test network connection
npx hardhat run scripts/test-connection.js --network <network>
```

### Error Messages

#### "Transaction underpriced"
- Increase gas price in hardhat.config.js
- Check current network gas prices

#### "Contract creation code storage out of gas"
- Enable optimizer in Solidity settings
- Reduce contract size

#### "Nonce too high"
- Reset MetaMask account
- Check for pending transactions

## Monitoring and Maintenance

### Contract Monitoring
- Set up **event monitoring**
- Monitor **gas usage**
- Track **transaction volumes**

### Upgrades
- Plan for **contract upgrades**
- Use **proxy patterns** if needed
- Maintain **backward compatibility**

### Backup and Recovery
- **Backup deployment artifacts**
- Store **contract ABIs** securely
- Document **admin procedures**

## Cost Estimation

### Deployment Costs (Approximate)

| Network | PropertyRegistry | PropertyToken | PropertyTransactions | Total |
|---------|------------------|---------------|---------------------|-------|
| Ethereum Mainnet | 0.02 ETH | 0.015 ETH | 0.02 ETH | 0.055 ETH |
| Polygon | 0.1 MATIC | 0.08 MATIC | 0.1 MATIC | 0.28 MATIC |
| BSC | 0.005 BNB | 0.004 BNB | 0.005 BNB | 0.014 BNB |

*Costs vary based on network congestion and gas prices*

## Support

For deployment support:
- Check the [troubleshooting section](#troubleshooting)
- Review [Hardhat documentation](https://hardhat.org/docs/)
- Contact the development team

## Next Steps

After successful deployment:
1. **Test all functionality** on testnet
2. **Perform security audit**
3. **Deploy to mainnet**
4. **Monitor contract performance**
5. **Plan for future upgrades**
