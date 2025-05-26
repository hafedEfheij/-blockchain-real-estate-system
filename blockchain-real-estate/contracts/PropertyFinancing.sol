// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PropertyRegistry.sol";

/**
 * @title PropertyFinancing
 * @dev Smart contract for property financing and mortgage management
 */
contract PropertyFinancing is ReentrancyGuard, Ownable, Pausable {
    PropertyRegistry public propertyRegistry;
    
    struct LoanApplication {
        uint256 id;
        uint256 propertyId;
        address borrower;
        uint256 loanAmount;
        uint256 downPayment;
        uint256 interestRate; // Annual rate in basis points (e.g., 500 = 5%)
        uint256 termMonths;
        uint256 monthlyPayment;
        LoanStatus status;
        uint256 applicationDate;
        uint256 approvalDate;
        address lender;
        string creditScore;
        string employmentInfo;
        string incomeVerification;
    }
    
    struct Mortgage {
        uint256 loanId;
        uint256 propertyId;
        address borrower;
        address lender;
        uint256 principalAmount;
        uint256 remainingBalance;
        uint256 interestRate;
        uint256 monthlyPayment;
        uint256 termMonths;
        uint256 remainingTerms;
        uint256 startDate;
        uint256 nextPaymentDue;
        uint256 totalPaid;
        uint256 totalInterestPaid;
        MortgageStatus status;
        bool autoPayEnabled;
    }
    
    struct LenderProfile {
        address lender;
        string name;
        uint256 availableFunds;
        uint256 minLoanAmount;
        uint256 maxLoanAmount;
        uint256 minInterestRate;
        uint256 maxLoanToValue; // Percentage in basis points
        bool isActive;
        uint256 totalLoansIssued;
        uint256 totalDefaulted;
        string[] supportedRegions;
    }
    
    struct PaymentRecord {
        uint256 mortgageId;
        uint256 paymentDate;
        uint256 principalPaid;
        uint256 interestPaid;
        uint256 remainingBalance;
        bool isLate;
        uint256 lateFee;
    }
    
    enum LoanStatus {
        Pending,
        UnderReview,
        Approved,
        Rejected,
        Funded,
        Cancelled
    }
    
    enum MortgageStatus {
        Active,
        PaidOff,
        Defaulted,
        InForeclosure,
        Refinanced
    }
    
    mapping(uint256 => LoanApplication) public loanApplications;
    mapping(uint256 => Mortgage) public mortgages;
    mapping(address => LenderProfile) public lenderProfiles;
    mapping(uint256 => PaymentRecord[]) public paymentHistory;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderLoans;
    
    uint256 public nextLoanId = 1;
    uint256 public nextMortgageId = 1;
    uint256 public platformFeePercent = 100; // 1%
    uint256 public lateFeePercent = 500; // 5%
    uint256 public maxLoanToValue = 8000; // 80%
    uint256 public minCreditScore = 600;
    uint256 public gracePeriodDays = 15;
    
    event LoanApplicationSubmitted(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 indexed propertyId,
        uint256 loanAmount
    );
    
    event LoanApproved(
        uint256 indexed loanId,
        address indexed lender,
        uint256 interestRate
    );
    
    event LoanFunded(
        uint256 indexed loanId,
        uint256 indexed mortgageId,
        uint256 amount
    );
    
    event MortgagePaymentMade(
        uint256 indexed mortgageId,
        uint256 principalPaid,
        uint256 interestPaid,
        uint256 remainingBalance
    );
    
    event MortgagePaidOff(
        uint256 indexed mortgageId,
        address indexed borrower,
        uint256 totalPaid
    );
    
    event LenderRegistered(
        address indexed lender,
        string name,
        uint256 availableFunds
    );
    
    event DefaultNotice(
        uint256 indexed mortgageId,
        address indexed borrower,
        uint256 missedPayments
    );
    
    modifier validLoan(uint256 loanId) {
        require(loanId > 0 && loanId < nextLoanId, "Invalid loan ID");
        _;
    }
    
    modifier validMortgage(uint256 mortgageId) {
        require(mortgageId > 0 && mortgageId < nextMortgageId, "Invalid mortgage ID");
        _;
    }
    
    modifier onlyBorrower(uint256 mortgageId) {
        require(mortgages[mortgageId].borrower == msg.sender, "Not the borrower");
        _;
    }
    
    modifier onlyLender(uint256 mortgageId) {
        require(mortgages[mortgageId].lender == msg.sender, "Not the lender");
        _;
    }
    
    constructor(address _propertyRegistry) {
        propertyRegistry = PropertyRegistry(_propertyRegistry);
    }
    
    /**
     * @dev Register as a lender
     */
    function registerLender(
        string memory name,
        uint256 minLoanAmount,
        uint256 maxLoanAmount,
        uint256 minInterestRate,
        uint256 maxLoanToValue,
        string[] memory supportedRegions
    ) external payable whenNotPaused {
        require(msg.value > 0, "Must deposit funds");
        require(maxLoanToValue <= 9500, "Max LTV cannot exceed 95%");
        
        LenderProfile storage profile = lenderProfiles[msg.sender];
        profile.lender = msg.sender;
        profile.name = name;
        profile.availableFunds = msg.value;
        profile.minLoanAmount = minLoanAmount;
        profile.maxLoanAmount = maxLoanAmount;
        profile.minInterestRate = minInterestRate;
        profile.maxLoanToValue = maxLoanToValue;
        profile.isActive = true;
        profile.supportedRegions = supportedRegions;
        
        emit LenderRegistered(msg.sender, name, msg.value);
    }
    
    /**
     * @dev Submit loan application
     */
    function submitLoanApplication(
        uint256 propertyId,
        uint256 loanAmount,
        uint256 downPayment,
        uint256 termMonths,
        string memory creditScore,
        string memory employmentInfo,
        string memory incomeVerification
    ) external whenNotPaused returns (uint256) {
        // Verify property ownership
        (,,,, address owner, bool verified,,,) = propertyRegistry.getProperty(propertyId);
        require(owner == msg.sender, "Not the property owner");
        require(verified, "Property must be verified");
        
        // Validate loan parameters
        require(loanAmount > 0, "Loan amount must be greater than 0");
        require(downPayment > 0, "Down payment required");
        require(termMonths >= 12 && termMonths <= 360, "Invalid term length");
        
        uint256 loanId = nextLoanId++;
        
        LoanApplication storage application = loanApplications[loanId];
        application.id = loanId;
        application.propertyId = propertyId;
        application.borrower = msg.sender;
        application.loanAmount = loanAmount;
        application.downPayment = downPayment;
        application.termMonths = termMonths;
        application.status = LoanStatus.Pending;
        application.applicationDate = block.timestamp;
        application.creditScore = creditScore;
        application.employmentInfo = employmentInfo;
        application.incomeVerification = incomeVerification;
        
        borrowerLoans[msg.sender].push(loanId);
        
        emit LoanApplicationSubmitted(loanId, msg.sender, propertyId, loanAmount);
        return loanId;
    }
    
    /**
     * @dev Approve and fund loan application
     */
    function approveLoan(
        uint256 loanId,
        uint256 interestRate
    ) external validLoan(loanId) whenNotPaused nonReentrant {
        LoanApplication storage application = loanApplications[loanId];
        require(application.status == LoanStatus.Pending, "Loan not pending");
        require(lenderProfiles[msg.sender].isActive, "Not an active lender");
        
        LenderProfile storage lender = lenderProfiles[msg.sender];
        require(lender.availableFunds >= application.loanAmount, "Insufficient lender funds");
        require(application.loanAmount >= lender.minLoanAmount, "Below minimum loan amount");
        require(application.loanAmount <= lender.maxLoanAmount, "Above maximum loan amount");
        require(interestRate >= lender.minInterestRate, "Interest rate too low");
        
        // Calculate monthly payment
        uint256 monthlyRate = interestRate / 12 / 10000; // Convert to monthly decimal
        uint256 monthlyPayment = calculateMonthlyPayment(
            application.loanAmount,
            monthlyRate,
            application.termMonths
        );
        
        application.interestRate = interestRate;
        application.monthlyPayment = monthlyPayment;
        application.status = LoanStatus.Approved;
        application.approvalDate = block.timestamp;
        application.lender = msg.sender;
        
        // Create mortgage
        uint256 mortgageId = nextMortgageId++;
        Mortgage storage mortgage = mortgages[mortgageId];
        mortgage.loanId = loanId;
        mortgage.propertyId = application.propertyId;
        mortgage.borrower = application.borrower;
        mortgage.lender = msg.sender;
        mortgage.principalAmount = application.loanAmount;
        mortgage.remainingBalance = application.loanAmount;
        mortgage.interestRate = interestRate;
        mortgage.monthlyPayment = monthlyPayment;
        mortgage.termMonths = application.termMonths;
        mortgage.remainingTerms = application.termMonths;
        mortgage.startDate = block.timestamp;
        mortgage.nextPaymentDue = block.timestamp + 30 days;
        mortgage.status = MortgageStatus.Active;
        
        // Transfer funds
        lender.availableFunds -= application.loanAmount;
        uint256 platformFee = (application.loanAmount * platformFeePercent) / 10000;
        uint256 borrowerAmount = application.loanAmount - platformFee;
        
        payable(application.borrower).transfer(borrowerAmount);
        
        lenderLoans[msg.sender].push(loanId);
        application.status = LoanStatus.Funded;
        
        emit LoanApproved(loanId, msg.sender, interestRate);
        emit LoanFunded(loanId, mortgageId, application.loanAmount);
    }
    
    /**
     * @dev Make mortgage payment
     */
    function makePayment(uint256 mortgageId) 
        external 
        payable 
        validMortgage(mortgageId) 
        onlyBorrower(mortgageId) 
        whenNotPaused 
        nonReentrant 
    {
        Mortgage storage mortgage = mortgages[mortgageId];
        require(mortgage.status == MortgageStatus.Active, "Mortgage not active");
        require(msg.value >= mortgage.monthlyPayment, "Insufficient payment amount");
        
        // Calculate interest and principal portions
        uint256 monthlyInterestRate = mortgage.interestRate / 12 / 10000;
        uint256 interestPayment = (mortgage.remainingBalance * monthlyInterestRate) / 10000;
        uint256 principalPayment = mortgage.monthlyPayment - interestPayment;
        
        // Handle overpayment
        if (principalPayment > mortgage.remainingBalance) {
            principalPayment = mortgage.remainingBalance;
        }
        
        // Update mortgage
        mortgage.remainingBalance -= principalPayment;
        mortgage.totalPaid += mortgage.monthlyPayment;
        mortgage.totalInterestPaid += interestPayment;
        mortgage.remainingTerms--;
        mortgage.nextPaymentDue += 30 days;
        
        // Check if paid off
        if (mortgage.remainingBalance == 0 || mortgage.remainingTerms == 0) {
            mortgage.status = MortgageStatus.PaidOff;
            emit MortgagePaidOff(mortgageId, msg.sender, mortgage.totalPaid);
        }
        
        // Record payment
        PaymentRecord memory payment = PaymentRecord({
            mortgageId: mortgageId,
            paymentDate: block.timestamp,
            principalPaid: principalPayment,
            interestPaid: interestPayment,
            remainingBalance: mortgage.remainingBalance,
            isLate: block.timestamp > mortgage.nextPaymentDue + (gracePeriodDays * 1 days),
            lateFee: 0
        });
        
        paymentHistory[mortgageId].push(payment);
        
        // Transfer payment to lender
        payable(mortgage.lender).transfer(mortgage.monthlyPayment);
        
        // Refund excess payment
        if (msg.value > mortgage.monthlyPayment) {
            payable(msg.sender).transfer(msg.value - mortgage.monthlyPayment);
        }
        
        emit MortgagePaymentMade(mortgageId, principalPayment, interestPayment, mortgage.remainingBalance);
    }
    
    /**
     * @dev Calculate monthly payment using amortization formula
     */
    function calculateMonthlyPayment(
        uint256 principal,
        uint256 monthlyRate,
        uint256 termMonths
    ) public pure returns (uint256) {
        if (monthlyRate == 0) {
            return principal / termMonths;
        }
        
        uint256 numerator = principal * monthlyRate * (1 + monthlyRate) ** termMonths;
        uint256 denominator = (1 + monthlyRate) ** termMonths - 1;
        
        return numerator / denominator;
    }
    
    /**
     * @dev Get loan application details
     */
    function getLoanApplication(uint256 loanId) 
        external 
        view 
        validLoan(loanId) 
        returns (LoanApplication memory) 
    {
        return loanApplications[loanId];
    }
    
    /**
     * @dev Get mortgage details
     */
    function getMortgage(uint256 mortgageId) 
        external 
        view 
        validMortgage(mortgageId) 
        returns (Mortgage memory) 
    {
        return mortgages[mortgageId];
    }
    
    /**
     * @dev Get borrower's loans
     */
    function getBorrowerLoans(address borrower) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return borrowerLoans[borrower];
    }
    
    /**
     * @dev Get lender's loans
     */
    function getLenderLoans(address lender) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return lenderLoans[lender];
    }
    
    /**
     * @dev Get payment history for mortgage
     */
    function getPaymentHistory(uint256 mortgageId) 
        external 
        view 
        validMortgage(mortgageId) 
        returns (PaymentRecord[] memory) 
    {
        return paymentHistory[mortgageId];
    }
    
    /**
     * @dev Add funds to lender profile
     */
    function addLenderFunds() external payable {
        require(lenderProfiles[msg.sender].isActive, "Not an active lender");
        lenderProfiles[msg.sender].availableFunds += msg.value;
    }
    
    /**
     * @dev Withdraw lender funds
     */
    function withdrawLenderFunds(uint256 amount) external nonReentrant {
        LenderProfile storage profile = lenderProfiles[msg.sender];
        require(profile.isActive, "Not an active lender");
        require(profile.availableFunds >= amount, "Insufficient funds");
        
        profile.availableFunds -= amount;
        payable(msg.sender).transfer(amount);
    }
    
    /**
     * @dev Set platform fee (only owner)
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 500, "Fee cannot exceed 5%");
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
