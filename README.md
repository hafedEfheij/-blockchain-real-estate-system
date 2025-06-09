#  Blockchain Real Estate System

[![CI/CD Pipeline](https://github.com/hafedEfheij/-blockchain-real-estate-system/actions/workflows/ci.yml/badge.svg)](https://github.com/hafedEfheij/-blockchain-real-estate-system/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue.svg)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)


.
## ✨ Features

### 🏘️ Property Management
- **Property Registration**: Register properties with detailed information and documents
- **Property Verification**: Authorized verifiers can verify property authenticity
- **Property Search & Filtering**: Advanced search with multiple filters and sorting options
- **Property Analytics**: Comprehensive dashboard with market statistics and trends

### 🎨 NFT Tokenization
- **Property Tokenization**: Convert properties into ERC-721 NFTs
- **Metadata Management**: IPFS-based metadata storage
- **Token Transfers**: Secure ownership transfers
- **Token Enumeration**: Track all tokenized properties

### 💰 Transaction System
- **Secure Transactions**: Smart contract-based escrow system
- **Multi-step Process**: Inspection, payment, and completion phases
- **Transaction Tracking**: Real-time status updates
- **Transaction History**: Complete audit trail

### 🔐 Security & Verification
- **Access Control**: Role-based permissions system
- **Property Verification**: Multi-step verification process
- **Document Storage**: Decentralized document storage via IPFS
- **Audit Trail**: Complete transaction history

### 👤 User Experience
- **User Profiles**: Comprehensive user management
- **Wallet Integration**: MetaMask and Web3Modal support
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live transaction and property updates

## 🛠️ Technology Stack

### Blockchain & Smart Contracts
- **Blockchain**: Ethereum, Polygon, BSC, Arbitrum, Optimism
- **Smart Contracts**: Solidity 0.8.28
- **Development Framework**: Hardhat
- **Testing**: Chai, Mocha
- **Security**: OpenZeppelin contracts

### Frontend
- **Framework**: React 18+
- **Styling**: Bootstrap 5
- **Web3 Integration**: ethers.js v5, Web3Modal
- **State Management**: React Hooks
- **Build Tool**: Create React App

### Infrastructure
- **Storage**: IPFS (Pinata)
- **CI/CD**: GitHub Actions
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint, Prettier

## 📁 Project Structure

```
blockchain-real-estate-system/
├── 📁 blockchain-real-estate/     # Smart contracts and blockchain logic
│   ├── 📁 contracts/             # Solidity smart contracts
│   ├── 📁 scripts/               # Deployment and utility scripts
│   ├── 📁 test/                  # Smart contract tests
│   └── 📄 hardhat.config.js      # Hardhat configuration
├── 📁 frontend/                  # React frontend application
│   ├── 📁 src/                   # Source code
│   │   ├── 📁 components/        # React components
│   │   ├── 📁 utils/             # Utility functions
│   │   └── 📄 App.js             # Main application component
│   └── 📄 package.json           # Frontend dependencies
├── 📁 .github/                   # GitHub Actions workflows
├── 📄 INSTALLATION.md            # Installation guide
├── 📄 API.md                     # API documentation
├── 📄 SECURITY.md                # Security guidelines
├── 📄 CONTRIBUTING.md            # Contributing guidelines
├── 📄 DEPLOYMENT.md              # Deployment guide
└── 📄 LICENSE                    # MIT license
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hafedEfheij/-blockchain-real-estate-system.git
   cd -blockchain-real-estate-system
   ```

2. **Install smart contract dependencies**
   ```bash
   cd blockchain-real-estate
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Development Setup

1. **Start local blockchain**
   ```bash
   cd blockchain-real-estate
   npm run node
   ```

2. **Deploy contracts**
   ```bash
   npm run deploy:local
   ```

3. **Start frontend**
   ```bash
   cd ../frontend
   npm start
   ```

4. **Open application**
   - Navigate to `http://localhost:3000`
   - Connect your MetaMask wallet
   - Switch to Localhost 8545 network

## 📚 Documentation

- **[Installation Guide](INSTALLATION.md)** - Detailed setup instructions
- **[API Documentation](API.md)** - Smart contract API reference
- **[Security Guidelines](SECURITY.md)** - Security best practices
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute
- **[Deployment Guide](DEPLOYMENT.md)** - Multi-network deployment

## 🧪 Testing

### Smart Contract Tests
```bash
cd blockchain-real-estate
npm run test                    # Run all tests
npm run test:coverage          # Run with coverage
npm run gas-report             # Generate gas report
```

### Frontend Tests
```bash
cd frontend
npm run test                   # Run all tests
npm run test:coverage         # Run with coverage
npm run lint                  # Run linting
```

## 🌐 Supported Networks

- **Ethereum Mainnet** - Production deployment
- **Goerli Testnet** - Ethereum testing
- **Sepolia Testnet** - Ethereum testing
- **Polygon Mainnet** - Low-cost transactions
- **Mumbai Testnet** - Polygon testing
- **BSC Mainnet** - Binance Smart Chain
- **Arbitrum One** - Layer 2 scaling
- **Optimism** - Layer 2 scaling

## 🔧 Available Scripts

### Smart Contracts
```bash
npm run compile               # Compile contracts
npm run test                 # Run tests
npm run deploy:local         # Deploy to localhost
npm run deploy:testnet       # Deploy to testnet
npm run verify              # Verify contracts
npm run clean               # Clean artifacts
```

### Frontend
```bash
npm start                   # Start development server
npm run build              # Build for production
npm run test               # Run tests
npm run lint               # Run linting
npm run format             # Format code
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 🔒 Security

Security is our top priority. Please see our [Security Guidelines](SECURITY.md) for:
- Smart contract security practices
- Frontend security measures
- Reporting vulnerabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin** - Smart contract security standards
- **Hardhat** - Ethereum development environment
- **React** - Frontend framework
- **IPFS** - Decentralized storage
- **MetaMask** - Web3 wallet integration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/hafedEfheij/-blockchain-real-estate-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hafedEfheij/-blockchain-real-estate-system/discussions)
- **Documentation**: [Project Wiki](https://github.com/hafedEfheij/-blockchain-real-estate-system/wiki)

---

**Built with ❤️ for the decentralized future of real estate**
