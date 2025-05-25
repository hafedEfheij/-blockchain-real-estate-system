// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PropertyRegistry.sol";

/**
 * @title FractionalOwnership
 * @dev Smart contract for fractional property ownership using ERC20 tokens
 */
contract FractionalOwnership is ReentrancyGuard, Ownable, Pausable {
    PropertyRegistry public propertyRegistry;
    
    struct FractionalProperty {
        uint256 propertyId;
        address tokenContract;
        uint256 totalShares;
        uint256 sharePrice;
        uint256 sharesIssued;
        uint256 sharesSold;
        address originalOwner;
        bool isActive;
        uint256 createdAt;
        uint256 dividendPool;
        uint256 lastDividendDistribution;
        mapping(address => uint256) shareholderVotes;
        mapping(bytes32 => uint256) proposalVotes;
    }
    
    struct ShareholderInfo {
        uint256 shares;
        uint256 lastDividendClaim;
        bool isActive;
    }
    
    struct Proposal {
        bytes32 id;
        uint256 propertyId;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        address proposer;
        ProposalType proposalType;
    }
    
    enum ProposalType {
        Maintenance,
        Renovation,
        Sale,
        RentIncrease,
        Other
    }
    
    mapping(uint256 => FractionalProperty) public fractionalProperties;
    mapping(uint256 => address[]) public propertyShareholders;
    mapping(address => mapping(uint256 => ShareholderInfo)) public shareholderInfo;
    mapping(bytes32 => Proposal) public proposals;
    mapping(uint256 => bytes32[]) public propertyProposals;
    
    uint256 public nextPropertyId = 1;
    uint256 public platformFeePercent = 250; // 2.5%
    uint256 public minSharePrice = 0.01 ether;
    uint256 public maxSharesPerProperty = 10000;
    uint256 public votingPeriod = 7 days;
    
    event PropertyFractionalized(
        uint256 indexed propertyId,
        address indexed tokenContract,
        uint256 totalShares,
        uint256 sharePrice
    );
    
    event SharesPurchased(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 shares,
        uint256 amount
    );
    
    event SharesTransferred(
        uint256 indexed propertyId,
        address indexed from,
        address indexed to,
        uint256 shares
    );
    
    event DividendsDistributed(
        uint256 indexed propertyId,
        uint256 totalAmount,
        uint256 perShare
    );
    
    event DividendsClaimed(
        uint256 indexed propertyId,
        address indexed shareholder,
        uint256 amount
    );
    
    event ProposalCreated(
        bytes32 indexed proposalId,
        uint256 indexed propertyId,
        address indexed proposer,
        ProposalType proposalType
    );
    
    event VoteCast(
        bytes32 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votes
    );
    
    modifier validProperty(uint256 propertyId) {
        require(fractionalProperties[propertyId].isActive, "Property not fractionalized");
        _;
    }
    
    modifier onlyShareholder(uint256 propertyId) {
        require(shareholderInfo[msg.sender][propertyId].shares > 0, "Not a shareholder");
        _;
    }
    
    constructor(address _propertyRegistry) {
        propertyRegistry = PropertyRegistry(_propertyRegistry);
    }
    
    /**
     * @dev Fractionalize a property into shares
     */
    function fractionalizeProperty(
        uint256 propertyId,
        uint256 totalShares,
        uint256 sharePrice,
        string memory tokenName,
        string memory tokenSymbol
    ) external whenNotPaused nonReentrant {
        require(totalShares > 0 && totalShares <= maxSharesPerProperty, "Invalid total shares");
        require(sharePrice >= minSharePrice, "Share price too low");
        require(!fractionalProperties[propertyId].isActive, "Property already fractionalized");
        
        // Verify property ownership
        (,,,, address owner, bool verified,,,) = propertyRegistry.getProperty(propertyId);
        require(owner == msg.sender, "Not the property owner");
        require(verified, "Property must be verified");
        
        // Deploy new ERC20 token for this property
        PropertyShareToken shareToken = new PropertyShareToken(
            tokenName,
            tokenSymbol,
            totalShares,
            address(this)
        );
        
        FractionalProperty storage fracProp = fractionalProperties[propertyId];
        fracProp.propertyId = propertyId;
        fracProp.tokenContract = address(shareToken);
        fracProp.totalShares = totalShares;
        fracProp.sharePrice = sharePrice;
        fracProp.sharesIssued = totalShares;
        fracProp.sharesSold = 0;
        fracProp.originalOwner = msg.sender;
        fracProp.isActive = true;
        fracProp.createdAt = block.timestamp;
        fracProp.dividendPool = 0;
        fracProp.lastDividendDistribution = block.timestamp;
        
        emit PropertyFractionalized(propertyId, address(shareToken), totalShares, sharePrice);
    }
    
    /**
     * @dev Purchase shares of a fractionalized property
     */
    function purchaseShares(uint256 propertyId, uint256 shares) 
        external 
        payable 
        validProperty(propertyId) 
        whenNotPaused 
        nonReentrant 
    {
        FractionalProperty storage fracProp = fractionalProperties[propertyId];
        require(shares > 0, "Must purchase at least 1 share");
        require(fracProp.sharesSold + shares <= fracProp.totalShares, "Not enough shares available");
        
        uint256 totalCost = shares * fracProp.sharePrice;
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Update shareholder info
        if (shareholderInfo[msg.sender][propertyId].shares == 0) {
            propertyShareholders[propertyId].push(msg.sender);
            shareholderInfo[msg.sender][propertyId].isActive = true;
            shareholderInfo[msg.sender][propertyId].lastDividendClaim = block.timestamp;
        }
        
        shareholderInfo[msg.sender][propertyId].shares += shares;
        fracProp.sharesSold += shares;
        
        // Mint tokens to buyer
        PropertyShareToken(fracProp.tokenContract).mint(msg.sender, shares);
        
        // Transfer payment to original owner (minus platform fee)
        uint256 platformFee = (totalCost * platformFeePercent) / 10000;
        uint256 ownerPayment = totalCost - platformFee;
        
        payable(fracProp.originalOwner).transfer(ownerPayment);
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit SharesPurchased(propertyId, msg.sender, shares, totalCost);
    }
    
    /**
     * @dev Transfer shares between shareholders
     */
    function transferShares(
        uint256 propertyId,
        address to,
        uint256 shares
    ) external validProperty(propertyId) onlyShareholder(propertyId) {
        require(to != address(0), "Invalid recipient");
        require(shares > 0, "Must transfer at least 1 share");
        require(shareholderInfo[msg.sender][propertyId].shares >= shares, "Insufficient shares");
        
        // Update sender's shares
        shareholderInfo[msg.sender][propertyId].shares -= shares;
        if (shareholderInfo[msg.sender][propertyId].shares == 0) {
            shareholderInfo[msg.sender][propertyId].isActive = false;
        }
        
        // Update recipient's shares
        if (shareholderInfo[to][propertyId].shares == 0) {
            propertyShareholders[propertyId].push(to);
            shareholderInfo[to][propertyId].isActive = true;
            shareholderInfo[to][propertyId].lastDividendClaim = block.timestamp;
        }
        shareholderInfo[to][propertyId].shares += shares;
        
        // Transfer tokens
        FractionalProperty storage fracProp = fractionalProperties[propertyId];
        PropertyShareToken(fracProp.tokenContract).transferFrom(msg.sender, to, shares);
        
        emit SharesTransferred(propertyId, msg.sender, to, shares);
    }
    
    /**
     * @dev Distribute dividends to shareholders
     */
    function distributeDividends(uint256 propertyId) 
        external 
        payable 
        validProperty(propertyId) 
        nonReentrant 
    {
        require(msg.value > 0, "Must send dividends");
        
        FractionalProperty storage fracProp = fractionalProperties[propertyId];
        fracProp.dividendPool += msg.value;
        fracProp.lastDividendDistribution = block.timestamp;
        
        uint256 dividendPerShare = msg.value / fracProp.sharesSold;
        
        emit DividendsDistributed(propertyId, msg.value, dividendPerShare);
    }
    
    /**
     * @dev Claim dividends for a shareholder
     */
    function claimDividends(uint256 propertyId) 
        external 
        validProperty(propertyId) 
        onlyShareholder(propertyId) 
        nonReentrant 
    {
        FractionalProperty storage fracProp = fractionalProperties[propertyId];
        ShareholderInfo storage shareholder = shareholderInfo[msg.sender][propertyId];
        
        require(shareholder.lastDividendClaim < fracProp.lastDividendDistribution, "No dividends to claim");
        
        uint256 dividendPerShare = fracProp.dividendPool / fracProp.sharesSold;
        uint256 dividendAmount = shareholder.shares * dividendPerShare;
        
        require(dividendAmount > 0, "No dividends available");
        require(address(this).balance >= dividendAmount, "Insufficient contract balance");
        
        shareholder.lastDividendClaim = block.timestamp;
        payable(msg.sender).transfer(dividendAmount);
        
        emit DividendsClaimed(propertyId, msg.sender, dividendAmount);
    }
    
    /**
     * @dev Create a proposal for property management
     */
    function createProposal(
        uint256 propertyId,
        string memory description,
        ProposalType proposalType
    ) external validProperty(propertyId) onlyShareholder(propertyId) returns (bytes32) {
        bytes32 proposalId = keccak256(abi.encodePacked(propertyId, description, block.timestamp));
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.propertyId = propertyId;
        proposal.description = description;
        proposal.deadline = block.timestamp + votingPeriod;
        proposal.proposer = msg.sender;
        proposal.proposalType = proposalType;
        
        propertyProposals[propertyId].push(proposalId);
        
        emit ProposalCreated(proposalId, propertyId, msg.sender, proposalType);
        return proposalId;
    }
    
    /**
     * @dev Vote on a proposal
     */
    function vote(bytes32 proposalId, bool support) 
        external 
        whenNotPaused 
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.deadline > block.timestamp, "Voting period ended");
        require(!proposal.executed, "Proposal already executed");
        
        uint256 propertyId = proposal.propertyId;
        require(shareholderInfo[msg.sender][propertyId].shares > 0, "Not a shareholder");
        
        FractionalProperty storage fracProp = fractionalProperties[propertyId];
        require(fracProp.shareholderVotes[msg.sender] == 0, "Already voted");
        
        uint256 votes = shareholderInfo[msg.sender][propertyId].shares;
        fracProp.shareholderVotes[msg.sender] = votes;
        
        if (support) {
            proposal.votesFor += votes;
        } else {
            proposal.votesAgainst += votes;
        }
        
        emit VoteCast(proposalId, msg.sender, support, votes);
    }
    
    /**
     * @dev Execute a proposal if it passes
     */
    function executeProposal(bytes32 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.deadline <= block.timestamp, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        uint256 propertyId = proposal.propertyId;
        FractionalProperty storage fracProp = fractionalProperties[propertyId];
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 requiredQuorum = fracProp.sharesSold / 2; // 50% quorum
        
        require(totalVotes >= requiredQuorum, "Quorum not reached");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal rejected");
        
        proposal.executed = true;
        
        // Reset votes for next proposal
        address[] memory shareholders = propertyShareholders[propertyId];
        for (uint i = 0; i < shareholders.length; i++) {
            fracProp.shareholderVotes[shareholders[i]] = 0;
        }
    }
    
    /**
     * @dev Get property information
     */
    function getPropertyInfo(uint256 propertyId) 
        external 
        view 
        validProperty(propertyId) 
        returns (
            address tokenContract,
            uint256 totalShares,
            uint256 sharePrice,
            uint256 sharesSold,
            address originalOwner,
            uint256 dividendPool
        ) 
    {
        FractionalProperty storage fracProp = fractionalProperties[propertyId];
        return (
            fracProp.tokenContract,
            fracProp.totalShares,
            fracProp.sharePrice,
            fracProp.sharesSold,
            fracProp.originalOwner,
            fracProp.dividendPool
        );
    }
    
    /**
     * @dev Get shareholder information
     */
    function getShareholderInfo(address shareholder, uint256 propertyId) 
        external 
        view 
        returns (uint256 shares, uint256 lastDividendClaim, bool isActive) 
    {
        ShareholderInfo storage info = shareholderInfo[shareholder][propertyId];
        return (info.shares, info.lastDividendClaim, info.isActive);
    }
    
    /**
     * @dev Get property shareholders
     */
    function getPropertyShareholders(uint256 propertyId) 
        external 
        view 
        validProperty(propertyId) 
        returns (address[] memory) 
    {
        return propertyShareholders[propertyId];
    }
    
    /**
     * @dev Get property proposals
     */
    function getPropertyProposals(uint256 propertyId) 
        external 
        view 
        validProperty(propertyId) 
        returns (bytes32[] memory) 
    {
        return propertyProposals[propertyId];
    }
    
    /**
     * @dev Set platform fee (only owner)
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = _feePercent;
    }
    
    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}

/**
 * @title PropertyShareToken
 * @dev ERC20 token representing shares in a fractionalized property
 */
contract PropertyShareToken is ERC20 {
    address public fractionalOwnershipContract;
    uint256 public maxSupply;
    
    modifier onlyFractionalContract() {
        require(msg.sender == fractionalOwnershipContract, "Only fractional contract can mint");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        address _fractionalContract
    ) ERC20(name, symbol) {
        maxSupply = _maxSupply;
        fractionalOwnershipContract = _fractionalContract;
    }
    
    function mint(address to, uint256 amount) external onlyFractionalContract {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
