# Contributing to Blockchain Real Estate System

We welcome contributions to the Blockchain Real Estate System! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a professional environment

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/-blockchain-real-estate-system.git
   cd -blockchain-real-estate-system
   ```
3. **Set up the development environment** following the [Installation Guide](INSTALLATION.md)
4. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### Smart Contract Development

1. **Write contracts** in the `blockchain-real-estate/contracts/` directory
2. **Follow Solidity best practices**:
   - Use latest stable Solidity version
   - Include comprehensive documentation
   - Implement proper access controls
   - Use OpenZeppelin libraries when possible

3. **Test your contracts**:
   ```bash
   cd blockchain-real-estate
   npm run test
   npm run test:coverage
   ```

4. **Check gas usage**:
   ```bash
   npm run gas-report
   ```

### Frontend Development

1. **Write components** in the `frontend/src/components/` directory
2. **Follow React best practices**:
   - Use functional components with hooks
   - Implement proper error handling
   - Write reusable components
   - Follow the existing code structure

3. **Test your components**:
   ```bash
   cd frontend
   npm run test
   npm run test:coverage
   ```

4. **Lint and format code**:
   ```bash
   npm run lint:fix
   npm run format
   ```

## Coding Standards

### Solidity

- Use 4 spaces for indentation
- Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Include NatSpec documentation for all public functions
- Use descriptive variable and function names
- Implement proper error messages

Example:
```solidity
/**
 * @notice Registers a new property on the blockchain
 * @param _location Physical location of the property
 * @param _area Area in square meters
 * @return propertyId The unique identifier for the property
 */
function registerProperty(
    string memory _location,
    uint256 _area
) external returns (uint256 propertyId) {
    require(bytes(_location).length > 0, "Location cannot be empty");
    // Implementation
}
```

### JavaScript/React

- Use 2 spaces for indentation
- Use ES6+ features
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable and function names
- Include JSDoc comments for complex functions

Example:
```javascript
/**
 * Formats an Ethereum address for display
 * @param {string} address - The full Ethereum address
 * @param {number} startChars - Characters to show at start
 * @param {number} endChars - Characters to show at end
 * @returns {string} Formatted address
 */
const formatAddress = (address, startChars = 6, endChars = 4) => {
  // Implementation
};
```

## Testing

### Smart Contract Tests

- Write comprehensive unit tests for all functions
- Test both success and failure cases
- Use descriptive test names
- Achieve at least 80% code coverage

Example:
```javascript
describe("PropertyRegistry", function () {
  it("Should register a new property with valid data", async function () {
    // Test implementation
  });

  it("Should revert when registering property with empty location", async function () {
    // Test implementation
  });
});
```

### Frontend Tests

- Write unit tests for components
- Test user interactions
- Mock blockchain interactions
- Test error handling

Example:
```javascript
describe("PropertyCard", () => {
  it("should display property information correctly", () => {
    // Test implementation
  });

  it("should handle buy button click", () => {
    // Test implementation
  });
});
```

## Pull Request Process

1. **Ensure your code follows** the coding standards
2. **Run all tests** and ensure they pass
3. **Update documentation** if necessary
4. **Create a detailed pull request** with:
   - Clear title and description
   - List of changes made
   - Screenshots (for UI changes)
   - Testing instructions

5. **Link related issues** using keywords like "Fixes #123"
6. **Request review** from maintainers
7. **Address feedback** promptly

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
```

## Issue Reporting

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, versions)
- Screenshots or error messages

### Feature Requests

Include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Potential impact on existing functionality

### Security Issues

For security vulnerabilities:
- **Do not** create public issues
- Email the maintainers directly
- Provide detailed information
- Allow time for responsible disclosure

## Development Environment

### Required Tools

- Node.js (v14+)
- npm or yarn
- Git
- MetaMask browser extension
- Code editor (VS Code recommended)

### Recommended VS Code Extensions

- Solidity
- Prettier
- ESLint
- GitLens
- Hardhat for Visual Studio Code

## Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [React Documentation](https://reactjs.org/docs/)
- [Hardhat Documentation](https://hardhat.org/docs/)
- [OpenZeppelin Documentation](https://docs.openzeppelin.com/)
- [Ethers.js Documentation](https://docs.ethers.io/)

## Questions?

If you have questions about contributing:
- Check existing issues and discussions
- Create a new issue with the "question" label
- Join our community discussions

Thank you for contributing to the Blockchain Real Estate System!
