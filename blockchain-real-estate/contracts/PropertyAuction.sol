// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PropertyRegistry.sol";

/**
 * @title PropertyAuction
 * @dev Smart contract for conducting property auctions
 */
contract PropertyAuction is ReentrancyGuard, Ownable, Pausable {
    PropertyRegistry public propertyRegistry;
    
    struct Auction {
        uint256 propertyId;
        address seller;
        uint256 startingPrice;
        uint256 reservePrice;
        uint256 currentBid;
        address currentBidder;
        uint256 startTime;
        uint256 endTime;
        uint256 bidIncrement;
        bool ended;
        bool cancelled;
        mapping(address => uint256) bids;
        address[] bidders;
    }
    
    struct AuctionInfo {
        uint256 propertyId;
        address seller;
        uint256 startingPrice;
        uint256 reservePrice;
        uint256 currentBid;
        address currentBidder;
        uint256 startTime;
        uint256 endTime;
        uint256 bidIncrement;
        bool ended;
        bool cancelled;
        uint256 totalBidders;
    }
    
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => uint256) public propertyToAuction; // propertyId => auctionId
    mapping(address => uint256[]) public userAuctions;
    
    uint256 public nextAuctionId = 1;
    uint256 public platformFeePercent = 250; // 2.5%
    uint256 public constant MAX_AUCTION_DURATION = 30 days;
    uint256 public constant MIN_AUCTION_DURATION = 1 hours;
    uint256 public constant MIN_BID_INCREMENT = 0.01 ether;
    
    event AuctionCreated(
        uint256 indexed auctionId,
        uint256 indexed propertyId,
        address indexed seller,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 startTime,
        uint256 endTime
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );
    
    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );
    
    event AuctionCancelled(uint256 indexed auctionId);
    
    event BidWithdrawn(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    
    modifier validAuction(uint256 auctionId) {
        require(auctionId > 0 && auctionId < nextAuctionId, "Invalid auction ID");
        _;
    }
    
    modifier auctionExists(uint256 auctionId) {
        require(auctions[auctionId].seller != address(0), "Auction does not exist");
        _;
    }
    
    modifier onlyPropertyOwner(uint256 propertyId) {
        (,,,, address owner,,,,) = propertyRegistry.getProperty(propertyId);
        require(owner == msg.sender, "Not the property owner");
        _;
    }
    
    constructor(address _propertyRegistry) {
        propertyRegistry = PropertyRegistry(_propertyRegistry);
    }
    
    /**
     * @dev Create a new auction for a property
     */
    function createAuction(
        uint256 propertyId,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 duration,
        uint256 bidIncrement
    ) external onlyPropertyOwner(propertyId) whenNotPaused nonReentrant {
        require(startingPrice > 0, "Starting price must be greater than 0");
        require(reservePrice >= startingPrice, "Reserve price must be >= starting price");
        require(duration >= MIN_AUCTION_DURATION && duration <= MAX_AUCTION_DURATION, "Invalid duration");
        require(bidIncrement >= MIN_BID_INCREMENT, "Bid increment too low");
        require(propertyToAuction[propertyId] == 0, "Property already has an active auction");
        
        // Verify property exists and is verified
        (,,,, address owner, bool verified, bool forSale,,) = propertyRegistry.getProperty(propertyId);
        require(verified, "Property must be verified");
        require(forSale, "Property must be listed for sale");
        require(owner == msg.sender, "Not the property owner");
        
        uint256 auctionId = nextAuctionId++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;
        
        Auction storage auction = auctions[auctionId];
        auction.propertyId = propertyId;
        auction.seller = msg.sender;
        auction.startingPrice = startingPrice;
        auction.reservePrice = reservePrice;
        auction.startTime = startTime;
        auction.endTime = endTime;
        auction.bidIncrement = bidIncrement;
        
        propertyToAuction[propertyId] = auctionId;
        userAuctions[msg.sender].push(auctionId);
        
        emit AuctionCreated(
            auctionId,
            propertyId,
            msg.sender,
            startingPrice,
            reservePrice,
            startTime,
            endTime
        );
    }
    
    /**
     * @dev Place a bid on an auction
     */
    function placeBid(uint256 auctionId) 
        external 
        payable 
        validAuction(auctionId) 
        auctionExists(auctionId) 
        whenNotPaused 
        nonReentrant 
    {
        Auction storage auction = auctions[auctionId];
        
        require(block.timestamp >= auction.startTime, "Auction has not started");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(!auction.ended, "Auction already ended");
        require(!auction.cancelled, "Auction cancelled");
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(msg.value > 0, "Bid must be greater than 0");
        
        uint256 minBid = auction.currentBid == 0 ? 
            auction.startingPrice : 
            auction.currentBid + auction.bidIncrement;
            
        require(msg.value >= minBid, "Bid too low");
        
        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            auction.bids[auction.currentBidder] += auction.currentBid;
        }
        
        // Record new bid
        auction.currentBid = msg.value;
        auction.currentBidder = msg.sender;
        
        // Add to bidders list if first time
        if (auction.bids[msg.sender] == 0) {
            auction.bidders.push(msg.sender);
        }
        
        // Extend auction if bid placed in last 10 minutes
        if (auction.endTime - block.timestamp < 10 minutes) {
            auction.endTime = block.timestamp + 10 minutes;
        }
        
        emit BidPlaced(auctionId, msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev End an auction
     */
    function endAuction(uint256 auctionId) 
        external 
        validAuction(auctionId) 
        auctionExists(auctionId) 
        nonReentrant 
    {
        Auction storage auction = auctions[auctionId];
        
        require(block.timestamp >= auction.endTime, "Auction still active");
        require(!auction.ended, "Auction already ended");
        require(!auction.cancelled, "Auction cancelled");
        
        auction.ended = true;
        
        if (auction.currentBidder != address(0) && auction.currentBid >= auction.reservePrice) {
            // Successful auction
            uint256 platformFee = (auction.currentBid * platformFeePercent) / 10000;
            uint256 sellerAmount = auction.currentBid - platformFee;
            
            // Transfer payment to seller
            payable(auction.seller).transfer(sellerAmount);
            
            // Transfer property ownership (this would need to be implemented in PropertyRegistry)
            // propertyRegistry.transferProperty(auction.propertyId, auction.currentBidder);
            
            emit AuctionEnded(auctionId, auction.currentBidder, auction.currentBid);
        } else {
            // Auction failed - refund highest bidder
            if (auction.currentBidder != address(0)) {
                auction.bids[auction.currentBidder] += auction.currentBid;
                auction.currentBid = 0;
                auction.currentBidder = address(0);
            }
            
            emit AuctionEnded(auctionId, address(0), 0);
        }
        
        // Clear property auction mapping
        propertyToAuction[auction.propertyId] = 0;
    }
    
    /**
     * @dev Cancel an auction (only by seller before first bid)
     */
    function cancelAuction(uint256 auctionId) 
        external 
        validAuction(auctionId) 
        auctionExists(auctionId) 
        nonReentrant 
    {
        Auction storage auction = auctions[auctionId];
        
        require(msg.sender == auction.seller, "Only seller can cancel");
        require(auction.currentBidder == address(0), "Cannot cancel auction with bids");
        require(!auction.ended, "Auction already ended");
        require(!auction.cancelled, "Auction already cancelled");
        
        auction.cancelled = true;
        propertyToAuction[auction.propertyId] = 0;
        
        emit AuctionCancelled(auctionId);
    }
    
    /**
     * @dev Withdraw failed bids
     */
    function withdrawBid(uint256 auctionId) 
        external 
        validAuction(auctionId) 
        auctionExists(auctionId) 
        nonReentrant 
    {
        Auction storage auction = auctions[auctionId];
        uint256 amount = auction.bids[msg.sender];
        
        require(amount > 0, "No bid to withdraw");
        require(msg.sender != auction.currentBidder || auction.ended || auction.cancelled, 
                "Cannot withdraw current winning bid");
        
        auction.bids[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        
        emit BidWithdrawn(auctionId, msg.sender, amount);
    }
    
    /**
     * @dev Get auction information
     */
    function getAuction(uint256 auctionId) 
        external 
        view 
        validAuction(auctionId) 
        returns (AuctionInfo memory) 
    {
        Auction storage auction = auctions[auctionId];
        
        return AuctionInfo({
            propertyId: auction.propertyId,
            seller: auction.seller,
            startingPrice: auction.startingPrice,
            reservePrice: auction.reservePrice,
            currentBid: auction.currentBid,
            currentBidder: auction.currentBidder,
            startTime: auction.startTime,
            endTime: auction.endTime,
            bidIncrement: auction.bidIncrement,
            ended: auction.ended,
            cancelled: auction.cancelled,
            totalBidders: auction.bidders.length
        });
    }
    
    /**
     * @dev Get user's bid amount for an auction
     */
    function getUserBid(uint256 auctionId, address user) 
        external 
        view 
        validAuction(auctionId) 
        returns (uint256) 
    {
        return auctions[auctionId].bids[user];
    }
    
    /**
     * @dev Get all bidders for an auction
     */
    function getAuctionBidders(uint256 auctionId) 
        external 
        view 
        validAuction(auctionId) 
        returns (address[] memory) 
    {
        return auctions[auctionId].bidders;
    }
    
    /**
     * @dev Get auctions created by a user
     */
    function getUserAuctions(address user) external view returns (uint256[] memory) {
        return userAuctions[user];
    }
    
    /**
     * @dev Check if auction is active
     */
    function isAuctionActive(uint256 auctionId) 
        external 
        view 
        validAuction(auctionId) 
        returns (bool) 
    {
        Auction storage auction = auctions[auctionId];
        return !auction.ended && 
               !auction.cancelled && 
               block.timestamp >= auction.startTime && 
               block.timestamp < auction.endTime;
    }
    
    /**
     * @dev Set platform fee (only owner)
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
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
     * @dev Emergency function to end auction (only owner)
     */
    function emergencyEndAuction(uint256 auctionId) external onlyOwner {
        Auction storage auction = auctions[auctionId];
        require(!auction.ended, "Auction already ended");
        
        auction.ended = true;
        auction.cancelled = true;
        
        // Refund current bidder
        if (auction.currentBidder != address(0)) {
            auction.bids[auction.currentBidder] += auction.currentBid;
            auction.currentBid = 0;
            auction.currentBidder = address(0);
        }
        
        propertyToAuction[auction.propertyId] = 0;
        emit AuctionCancelled(auctionId);
    }
}
