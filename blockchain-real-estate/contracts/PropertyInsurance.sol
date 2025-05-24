// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PropertyRegistry.sol";

/**
 * @title PropertyInsurance
 * @dev Smart contract for property insurance management
 */
contract PropertyInsurance is ReentrancyGuard, Ownable, Pausable {
    PropertyRegistry public propertyRegistry;
    
    enum ClaimStatus {
        Pending,
        UnderReview,
        Approved,
        Rejected,
        Paid
    }
    
    enum PolicyStatus {
        Active,
        Expired,
        Cancelled,
        Suspended
    }
    
    struct Policy {
        uint256 propertyId;
        address policyholder;
        uint256 coverageAmount;
        uint256 premium;
        uint256 startDate;
        uint256 endDate;
        PolicyStatus status;
        string[] coveredRisks;
        uint256 deductible;
        bool autoRenewal;
    }
    
    struct Claim {
        uint256 policyId;
        address claimant;
        uint256 claimAmount;
        string description;
        string riskType;
        uint256 dateOfLoss;
        uint256 dateReported;
        ClaimStatus status;
        string[] evidence;
        uint256 approvedAmount;
        string rejectionReason;
    }
    
    struct RiskAssessment {
        uint256 propertyId;
        uint256 riskScore; // 1-100 (higher = riskier)
        string[] identifiedRisks;
        uint256 assessmentDate;
        address assessor;
        string reportHash; // IPFS hash of detailed report
    }
    
    mapping(uint256 => Policy) public policies;
    mapping(uint256 => Claim) public claims;
    mapping(uint256 => RiskAssessment) public riskAssessments;
    mapping(uint256 => uint256) public propertyToPolicy; // propertyId => policyId
    mapping(address => uint256[]) public userPolicies;
    mapping(address => uint256[]) public userClaims;
    mapping(address => bool) public authorizedAssessors;
    
    uint256 public nextPolicyId = 1;
    uint256 public nextClaimId = 1;
    uint256 public basePremiumRate = 100; // 1% annually (in basis points)
    uint256 public maxCoverageMultiplier = 150; // 150% of property value
    uint256 public minDeductible = 0.1 ether;
    uint256 public claimProcessingFee = 0.01 ether;
    
    // Risk multipliers (in basis points)
    mapping(string => uint256) public riskMultipliers;
    
    event PolicyCreated(
        uint256 indexed policyId,
        uint256 indexed propertyId,
        address indexed policyholder,
        uint256 coverageAmount,
        uint256 premium
    );
    
    event PolicyRenewed(uint256 indexed policyId, uint256 newEndDate);
    event PolicyCancelled(uint256 indexed policyId);
    
    event ClaimFiled(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed claimant,
        uint256 claimAmount
    );
    
    event ClaimStatusUpdated(
        uint256 indexed claimId,
        ClaimStatus oldStatus,
        ClaimStatus newStatus
    );
    
    event ClaimPaid(
        uint256 indexed claimId,
        address indexed claimant,
        uint256 amount
    );
    
    event RiskAssessmentCompleted(
        uint256 indexed propertyId,
        uint256 riskScore,
        address assessor
    );
    
    modifier validPolicy(uint256 policyId) {
        require(policyId > 0 && policyId < nextPolicyId, "Invalid policy ID");
        _;
    }
    
    modifier validClaim(uint256 claimId) {
        require(claimId > 0 && claimId < nextClaimId, "Invalid claim ID");
        _;
    }
    
    modifier onlyPolicyholder(uint256 policyId) {
        require(policies[policyId].policyholder == msg.sender, "Not the policyholder");
        _;
    }
    
    modifier onlyAuthorizedAssessor() {
        require(authorizedAssessors[msg.sender], "Not an authorized assessor");
        _;
    }
    
    constructor(address _propertyRegistry) {
        propertyRegistry = PropertyRegistry(_propertyRegistry);
        
        // Initialize default risk multipliers
        riskMultipliers["flood"] = 200; // 2x multiplier
        riskMultipliers["earthquake"] = 300; // 3x multiplier
        riskMultipliers["fire"] = 150; // 1.5x multiplier
        riskMultipliers["theft"] = 120; // 1.2x multiplier
        riskMultipliers["vandalism"] = 110; // 1.1x multiplier
    }
    
    /**
     * @dev Create a new insurance policy
     */
    function createPolicy(
        uint256 propertyId,
        uint256 coverageAmount,
        string[] memory coveredRisks,
        uint256 deductible,
        bool autoRenewal
    ) external payable whenNotPaused nonReentrant {
        require(coverageAmount > 0, "Coverage amount must be greater than 0");
        require(deductible >= minDeductible, "Deductible too low");
        require(propertyToPolicy[propertyId] == 0, "Property already insured");
        
        // Verify property ownership
        (,,,, address owner, bool verified,,,) = propertyRegistry.getProperty(propertyId);
        require(owner == msg.sender, "Not the property owner");
        require(verified, "Property must be verified");
        
        // Calculate premium based on risk assessment
        uint256 premium = calculatePremium(propertyId, coverageAmount, coveredRisks);
        require(msg.value >= premium, "Insufficient premium payment");
        
        uint256 policyId = nextPolicyId++;
        uint256 startDate = block.timestamp;
        uint256 endDate = startDate + 365 days; // 1 year policy
        
        Policy storage policy = policies[policyId];
        policy.propertyId = propertyId;
        policy.policyholder = msg.sender;
        policy.coverageAmount = coverageAmount;
        policy.premium = premium;
        policy.startDate = startDate;
        policy.endDate = endDate;
        policy.status = PolicyStatus.Active;
        policy.coveredRisks = coveredRisks;
        policy.deductible = deductible;
        policy.autoRenewal = autoRenewal;
        
        propertyToPolicy[propertyId] = policyId;
        userPolicies[msg.sender].push(policyId);
        
        // Refund excess payment
        if (msg.value > premium) {
            payable(msg.sender).transfer(msg.value - premium);
        }
        
        emit PolicyCreated(policyId, propertyId, msg.sender, coverageAmount, premium);
    }
    
    /**
     * @dev File an insurance claim
     */
    function fileClaim(
        uint256 policyId,
        uint256 claimAmount,
        string memory description,
        string memory riskType,
        uint256 dateOfLoss,
        string[] memory evidence
    ) external payable validPolicy(policyId) onlyPolicyholder(policyId) whenNotPaused nonReentrant {
        require(msg.value >= claimProcessingFee, "Insufficient processing fee");
        require(claimAmount > 0, "Claim amount must be greater than 0");
        require(dateOfLoss <= block.timestamp, "Date of loss cannot be in the future");
        
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.Active, "Policy not active");
        require(claimAmount <= policy.coverageAmount, "Claim exceeds coverage");
        require(dateOfLoss >= policy.startDate && dateOfLoss <= policy.endDate, "Loss not covered by policy period");
        
        // Check if risk type is covered
        bool riskCovered = false;
        for (uint i = 0; i < policy.coveredRisks.length; i++) {
            if (keccak256(bytes(policy.coveredRisks[i])) == keccak256(bytes(riskType))) {
                riskCovered = true;
                break;
            }
        }
        require(riskCovered, "Risk type not covered by policy");
        
        uint256 claimId = nextClaimId++;
        
        Claim storage claim = claims[claimId];
        claim.policyId = policyId;
        claim.claimant = msg.sender;
        claim.claimAmount = claimAmount;
        claim.description = description;
        claim.riskType = riskType;
        claim.dateOfLoss = dateOfLoss;
        claim.dateReported = block.timestamp;
        claim.status = ClaimStatus.Pending;
        claim.evidence = evidence;
        
        userClaims[msg.sender].push(claimId);
        
        // Refund excess processing fee
        if (msg.value > claimProcessingFee) {
            payable(msg.sender).transfer(msg.value - claimProcessingFee);
        }
        
        emit ClaimFiled(claimId, policyId, msg.sender, claimAmount);
    }
    
    /**
     * @dev Process a claim (only owner or authorized assessor)
     */
    function processClaim(
        uint256 claimId,
        ClaimStatus newStatus,
        uint256 approvedAmount,
        string memory rejectionReason
    ) external validClaim(claimId) nonReentrant {
        require(msg.sender == owner() || authorizedAssessors[msg.sender], "Not authorized");
        
        Claim storage claim = claims[claimId];
        require(claim.status == ClaimStatus.Pending || claim.status == ClaimStatus.UnderReview, "Claim cannot be processed");
        
        ClaimStatus oldStatus = claim.status;
        claim.status = newStatus;
        
        if (newStatus == ClaimStatus.Approved) {
            require(approvedAmount > 0 && approvedAmount <= claim.claimAmount, "Invalid approved amount");
            claim.approvedAmount = approvedAmount;
        } else if (newStatus == ClaimStatus.Rejected) {
            require(bytes(rejectionReason).length > 0, "Rejection reason required");
            claim.rejectionReason = rejectionReason;
        }
        
        emit ClaimStatusUpdated(claimId, oldStatus, newStatus);
    }
    
    /**
     * @dev Pay an approved claim
     */
    function payClaim(uint256 claimId) external validClaim(claimId) onlyOwner nonReentrant {
        Claim storage claim = claims[claimId];
        require(claim.status == ClaimStatus.Approved, "Claim not approved");
        
        Policy storage policy = policies[claim.policyId];
        uint256 payoutAmount = claim.approvedAmount > policy.deductible ? 
            claim.approvedAmount - policy.deductible : 0;
        
        require(payoutAmount > 0, "Payout amount too low");
        require(address(this).balance >= payoutAmount, "Insufficient contract balance");
        
        claim.status = ClaimStatus.Paid;
        payable(claim.claimant).transfer(payoutAmount);
        
        emit ClaimPaid(claimId, claim.claimant, payoutAmount);
    }
    
    /**
     * @dev Conduct risk assessment for a property
     */
    function conductRiskAssessment(
        uint256 propertyId,
        uint256 riskScore,
        string[] memory identifiedRisks,
        string memory reportHash
    ) external onlyAuthorizedAssessor whenNotPaused {
        require(riskScore >= 1 && riskScore <= 100, "Risk score must be between 1-100");
        
        RiskAssessment storage assessment = riskAssessments[propertyId];
        assessment.propertyId = propertyId;
        assessment.riskScore = riskScore;
        assessment.identifiedRisks = identifiedRisks;
        assessment.assessmentDate = block.timestamp;
        assessment.assessor = msg.sender;
        assessment.reportHash = reportHash;
        
        emit RiskAssessmentCompleted(propertyId, riskScore, msg.sender);
    }
    
    /**
     * @dev Calculate premium for a property
     */
    function calculatePremium(
        uint256 propertyId,
        uint256 coverageAmount,
        string[] memory coveredRisks
    ) public view returns (uint256) {
        // Get property value for base calculation
        (,,, uint256 propertyPrice,,,,,) = propertyRegistry.getProperty(propertyId);
        
        // Base premium calculation
        uint256 basePremium = (coverageAmount * basePremiumRate) / 10000;
        
        // Apply risk multipliers
        uint256 riskMultiplier = 10000; // 100% base
        for (uint i = 0; i < coveredRisks.length; i++) {
            uint256 multiplier = riskMultipliers[coveredRisks[i]];
            if (multiplier > 0) {
                riskMultiplier = (riskMultiplier * multiplier) / 10000;
            }
        }
        
        // Apply risk assessment if available
        RiskAssessment storage assessment = riskAssessments[propertyId];
        if (assessment.riskScore > 0) {
            uint256 riskAdjustment = 5000 + (assessment.riskScore * 50); // 50% to 100% based on risk score
            riskMultiplier = (riskMultiplier * riskAdjustment) / 10000;
        }
        
        return (basePremium * riskMultiplier) / 10000;
    }
    
    /**
     * @dev Renew a policy
     */
    function renewPolicy(uint256 policyId) external payable validPolicy(policyId) onlyPolicyholder(policyId) nonReentrant {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.Active || policy.status == PolicyStatus.Expired, "Cannot renew policy");
        
        uint256 newPremium = calculatePremium(policy.propertyId, policy.coverageAmount, policy.coveredRisks);
        require(msg.value >= newPremium, "Insufficient premium payment");
        
        policy.premium = newPremium;
        policy.startDate = block.timestamp;
        policy.endDate = block.timestamp + 365 days;
        policy.status = PolicyStatus.Active;
        
        // Refund excess payment
        if (msg.value > newPremium) {
            payable(msg.sender).transfer(msg.value - newPremium);
        }
        
        emit PolicyRenewed(policyId, policy.endDate);
    }
    
    /**
     * @dev Cancel a policy
     */
    function cancelPolicy(uint256 policyId) external validPolicy(policyId) onlyPolicyholder(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.status == PolicyStatus.Active, "Policy not active");
        
        policy.status = PolicyStatus.Cancelled;
        propertyToPolicy[policy.propertyId] = 0;
        
        emit PolicyCancelled(policyId);
    }
    
    /**
     * @dev Get policy details
     */
    function getPolicy(uint256 policyId) external view validPolicy(policyId) returns (
        uint256 propertyId,
        address policyholder,
        uint256 coverageAmount,
        uint256 premium,
        uint256 startDate,
        uint256 endDate,
        PolicyStatus status,
        string[] memory coveredRisks,
        uint256 deductible,
        bool autoRenewal
    ) {
        Policy storage policy = policies[policyId];
        return (
            policy.propertyId,
            policy.policyholder,
            policy.coverageAmount,
            policy.premium,
            policy.startDate,
            policy.endDate,
            policy.status,
            policy.coveredRisks,
            policy.deductible,
            policy.autoRenewal
        );
    }
    
    /**
     * @dev Get claim details
     */
    function getClaim(uint256 claimId) external view validClaim(claimId) returns (
        uint256 policyId,
        address claimant,
        uint256 claimAmount,
        string memory description,
        string memory riskType,
        uint256 dateOfLoss,
        uint256 dateReported,
        ClaimStatus status,
        string[] memory evidence,
        uint256 approvedAmount,
        string memory rejectionReason
    ) {
        Claim storage claim = claims[claimId];
        return (
            claim.policyId,
            claim.claimant,
            claim.claimAmount,
            claim.description,
            claim.riskType,
            claim.dateOfLoss,
            claim.dateReported,
            claim.status,
            claim.evidence,
            claim.approvedAmount,
            claim.rejectionReason
        );
    }
    
    /**
     * @dev Add authorized assessor (only owner)
     */
    function addAuthorizedAssessor(address assessor) external onlyOwner {
        authorizedAssessors[assessor] = true;
    }
    
    /**
     * @dev Remove authorized assessor (only owner)
     */
    function removeAuthorizedAssessor(address assessor) external onlyOwner {
        authorizedAssessors[assessor] = false;
    }
    
    /**
     * @dev Set risk multiplier (only owner)
     */
    function setRiskMultiplier(string memory riskType, uint256 multiplier) external onlyOwner {
        riskMultipliers[riskType] = multiplier;
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
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
