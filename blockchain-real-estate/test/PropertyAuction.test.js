const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PropertyAuction", function () {
  let PropertyRegistry, PropertyAuction;
  let propertyRegistry, propertyAuction;
  let owner, seller, bidder1, bidder2, verifier;
  let propertyId;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2, verifier] = await ethers.getSigners();

    // Deploy PropertyRegistry
    PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
    propertyRegistry = await PropertyRegistry.deploy();
    await propertyRegistry.waitForDeployment();

    // Deploy PropertyAuction
    PropertyAuction = await ethers.getContractFactory("PropertyAuction");
    propertyAuction = await PropertyAuction.deploy(await propertyRegistry.getAddress());
    await propertyAuction.waitForDeployment();

    // Add verifier
    await propertyRegistry.addVerifier(verifier.address);

    // Register a property
    await propertyRegistry.connect(seller).registerProperty(
      "Test Location",
      "Residential",
      100,
      ethers.parseEther("10"),
      "ipfs://test"
    );
    propertyId = 1;

    // Verify the property
    await propertyRegistry.connect(verifier).verifyProperty(propertyId);

    // List property for sale
    await propertyRegistry.connect(seller).listForSale(propertyId);
  });

  describe("Deployment", function () {
    it("Should set the correct property registry address", async function () {
      expect(await propertyAuction.propertyRegistry()).to.equal(await propertyRegistry.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await propertyAuction.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct default values", async function () {
      expect(await propertyAuction.nextAuctionId()).to.equal(1);
      expect(await propertyAuction.platformFeePercent()).to.equal(250); // 2.5%
    });
  });

  describe("Create Auction", function () {
    it("Should create an auction successfully", async function () {
      const startingPrice = ethers.parseEther("5");
      const reservePrice = ethers.parseEther("8");
      const duration = 86400; // 1 day
      const bidIncrement = ethers.parseEther("0.1");

      await expect(
        propertyAuction.connect(seller).createAuction(
          propertyId,
          startingPrice,
          reservePrice,
          duration,
          bidIncrement
        )
      ).to.emit(propertyAuction, "AuctionCreated");

      const auction = await propertyAuction.getAuction(1);
      expect(auction.propertyId).to.equal(propertyId);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.startingPrice).to.equal(startingPrice);
      expect(auction.reservePrice).to.equal(reservePrice);
    });

    it("Should fail if not property owner", async function () {
      await expect(
        propertyAuction.connect(bidder1).createAuction(
          propertyId,
          ethers.parseEther("5"),
          ethers.parseEther("8"),
          86400,
          ethers.parseEther("0.1")
        )
      ).to.be.revertedWith("Not the property owner");
    });

    it("Should fail with invalid parameters", async function () {
      // Starting price is 0
      await expect(
        propertyAuction.connect(seller).createAuction(
          propertyId,
          0,
          ethers.parseEther("8"),
          86400,
          ethers.parseEther("0.1")
        )
      ).to.be.revertedWith("Starting price must be greater than 0");

      // Reserve price less than starting price
      await expect(
        propertyAuction.connect(seller).createAuction(
          propertyId,
          ethers.parseEther("10"),
          ethers.parseEther("5"),
          86400,
          ethers.parseEther("0.1")
        )
      ).to.be.revertedWith("Reserve price must be >= starting price");

      // Duration too short
      await expect(
        propertyAuction.connect(seller).createAuction(
          propertyId,
          ethers.parseEther("5"),
          ethers.parseEther("8"),
          1800, // 30 minutes
          ethers.parseEther("0.1")
        )
      ).to.be.revertedWith("Invalid duration");
    });
  });

  describe("Place Bid", function () {
    let auctionId;

    beforeEach(async function () {
      await propertyAuction.connect(seller).createAuction(
        propertyId,
        ethers.parseEther("5"),
        ethers.parseEther("8"),
        86400,
        ethers.parseEther("0.1")
      );
      auctionId = 1;
    });

    it("Should place a bid successfully", async function () {
      const bidAmount = ethers.parseEther("5.5");

      await expect(
        propertyAuction.connect(bidder1).placeBid(auctionId, { value: bidAmount })
      ).to.emit(propertyAuction, "BidPlaced");

      const auction = await propertyAuction.getAuction(auctionId);
      expect(auction.currentBid).to.equal(bidAmount);
      expect(auction.currentBidder).to.equal(bidder1.address);
    });

    it("Should handle multiple bids correctly", async function () {
      // First bid
      await propertyAuction.connect(bidder1).placeBid(auctionId, { 
        value: ethers.parseEther("5.5") 
      });

      // Second bid (higher)
      await propertyAuction.connect(bidder2).placeBid(auctionId, { 
        value: ethers.parseEther("6.0") 
      });

      const auction = await propertyAuction.getAuction(auctionId);
      expect(auction.currentBid).to.equal(ethers.parseEther("6.0"));
      expect(auction.currentBidder).to.equal(bidder2.address);

      // Check that first bidder can withdraw
      const bidder1Balance = await propertyAuction.getUserBid(auctionId, bidder1.address);
      expect(bidder1Balance).to.equal(ethers.parseEther("5.5"));
    });

    it("Should fail with insufficient bid amount", async function () {
      await expect(
        propertyAuction.connect(bidder1).placeBid(auctionId, { 
          value: ethers.parseEther("4") 
        })
      ).to.be.revertedWith("Bid too low");
    });

    it("Should fail if seller tries to bid", async function () {
      await expect(
        propertyAuction.connect(seller).placeBid(auctionId, { 
          value: ethers.parseEther("6") 
        })
      ).to.be.revertedWith("Seller cannot bid");
    });

    it("Should extend auction if bid placed in last 10 minutes", async function () {
      // Fast forward to near end of auction
      await time.increase(86400 - 300); // 5 minutes before end

      const auctionBefore = await propertyAuction.getAuction(auctionId);
      const endTimeBefore = auctionBefore.endTime;

      await propertyAuction.connect(bidder1).placeBid(auctionId, { 
        value: ethers.parseEther("5.5") 
      });

      const auctionAfter = await propertyAuction.getAuction(auctionId);
      expect(auctionAfter.endTime).to.be.greaterThan(endTimeBefore);
    });
  });

  describe("End Auction", function () {
    let auctionId;

    beforeEach(async function () {
      await propertyAuction.connect(seller).createAuction(
        propertyId,
        ethers.parseEther("5"),
        ethers.parseEther("8"),
        86400,
        ethers.parseEther("0.1")
      );
      auctionId = 1;
    });

    it("Should end auction successfully with winning bid", async function () {
      // Place winning bid
      await propertyAuction.connect(bidder1).placeBid(auctionId, { 
        value: ethers.parseEther("8.5") 
      });

      // Fast forward past auction end
      await time.increase(86401);

      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await expect(
        propertyAuction.endAuction(auctionId)
      ).to.emit(propertyAuction, "AuctionEnded");

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      const expectedAmount = ethers.parseEther("8.5") * 9750n / 10000n; // Minus 2.5% fee

      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedAmount);
    });

    it("Should fail auction if reserve not met", async function () {
      // Place bid below reserve
      await propertyAuction.connect(bidder1).placeBid(auctionId, { 
        value: ethers.parseEther("7") 
      });

      // Fast forward past auction end
      await time.increase(86401);

      await propertyAuction.endAuction(auctionId);

      const auction = await propertyAuction.getAuction(auctionId);
      expect(auction.ended).to.be.true;
      expect(auction.currentBidder).to.equal(ethers.ZeroAddress);

      // Bidder should be able to withdraw
      const bidAmount = await propertyAuction.getUserBid(auctionId, bidder1.address);
      expect(bidAmount).to.equal(ethers.parseEther("7"));
    });

    it("Should fail if auction still active", async function () {
      await expect(
        propertyAuction.endAuction(auctionId)
      ).to.be.revertedWith("Auction still active");
    });
  });

  describe("Cancel Auction", function () {
    let auctionId;

    beforeEach(async function () {
      await propertyAuction.connect(seller).createAuction(
        propertyId,
        ethers.parseEther("5"),
        ethers.parseEther("8"),
        86400,
        ethers.parseEther("0.1")
      );
      auctionId = 1;
    });

    it("Should cancel auction successfully", async function () {
      await expect(
        propertyAuction.connect(seller).cancelAuction(auctionId)
      ).to.emit(propertyAuction, "AuctionCancelled");

      const auction = await propertyAuction.getAuction(auctionId);
      expect(auction.cancelled).to.be.true;
    });

    it("Should fail if not seller", async function () {
      await expect(
        propertyAuction.connect(bidder1).cancelAuction(auctionId)
      ).to.be.revertedWith("Only seller can cancel");
    });

    it("Should fail if auction has bids", async function () {
      await propertyAuction.connect(bidder1).placeBid(auctionId, { 
        value: ethers.parseEther("5.5") 
      });

      await expect(
        propertyAuction.connect(seller).cancelAuction(auctionId)
      ).to.be.revertedWith("Cannot cancel auction with bids");
    });
  });

  describe("Withdraw Bid", function () {
    let auctionId;

    beforeEach(async function () {
      await propertyAuction.connect(seller).createAuction(
        propertyId,
        ethers.parseEther("5"),
        ethers.parseEther("8"),
        86400,
        ethers.parseEther("0.1")
      );
      auctionId = 1;

      // Place bids
      await propertyAuction.connect(bidder1).placeBid(auctionId, { 
        value: ethers.parseEther("5.5") 
      });
      await propertyAuction.connect(bidder2).placeBid(auctionId, { 
        value: ethers.parseEther("6.0") 
      });
    });

    it("Should allow outbid bidder to withdraw", async function () {
      const balanceBefore = await ethers.provider.getBalance(bidder1.address);

      const tx = await propertyAuction.connect(bidder1).withdrawBid(auctionId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(bidder1.address);
      const expectedBalance = balanceBefore + ethers.parseEther("5.5") - gasUsed;

      expect(balanceAfter).to.equal(expectedBalance);
    });

    it("Should fail if current winning bidder tries to withdraw", async function () {
      await expect(
        propertyAuction.connect(bidder2).withdrawBid(auctionId)
      ).to.be.revertedWith("Cannot withdraw current winning bid");
    });

    it("Should fail if no bid to withdraw", async function () {
      await expect(
        propertyAuction.connect(seller).withdrawBid(auctionId)
      ).to.be.revertedWith("No bid to withdraw");
    });
  });

  describe("Platform Management", function () {
    it("Should allow owner to set platform fee", async function () {
      await propertyAuction.setPlatformFee(500); // 5%
      expect(await propertyAuction.platformFeePercent()).to.equal(500);
    });

    it("Should fail to set fee above 10%", async function () {
      await expect(
        propertyAuction.setPlatformFee(1100)
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });

    it("Should allow owner to withdraw fees", async function () {
      // Create and complete an auction to generate fees
      await propertyAuction.connect(seller).createAuction(
        propertyId,
        ethers.parseEther("5"),
        ethers.parseEther("8"),
        86400,
        ethers.parseEther("0.1")
      );

      await propertyAuction.connect(bidder1).placeBid(1, { 
        value: ethers.parseEther("8.5") 
      });

      await time.increase(86401);
      await propertyAuction.endAuction(1);

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await propertyAuction.withdrawFees();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore);
    });

    it("Should allow owner to pause and unpause", async function () {
      await propertyAuction.pause();
      
      await expect(
        propertyAuction.connect(seller).createAuction(
          propertyId,
          ethers.parseEther("5"),
          ethers.parseEther("8"),
          86400,
          ethers.parseEther("0.1")
        )
      ).to.be.revertedWith("Pausable: paused");

      await propertyAuction.unpause();

      await expect(
        propertyAuction.connect(seller).createAuction(
          propertyId,
          ethers.parseEther("5"),
          ethers.parseEther("8"),
          86400,
          ethers.parseEther("0.1")
        )
      ).to.not.be.reverted;
    });
  });

  describe("View Functions", function () {
    let auctionId;

    beforeEach(async function () {
      await propertyAuction.connect(seller).createAuction(
        propertyId,
        ethers.parseEther("5"),
        ethers.parseEther("8"),
        86400,
        ethers.parseEther("0.1")
      );
      auctionId = 1;

      await propertyAuction.connect(bidder1).placeBid(auctionId, { 
        value: ethers.parseEther("5.5") 
      });
    });

    it("Should return correct auction information", async function () {
      const auction = await propertyAuction.getAuction(auctionId);
      expect(auction.propertyId).to.equal(propertyId);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.currentBid).to.equal(ethers.parseEther("5.5"));
      expect(auction.currentBidder).to.equal(bidder1.address);
    });

    it("Should return user bid amount", async function () {
      const bidAmount = await propertyAuction.getUserBid(auctionId, bidder1.address);
      expect(bidAmount).to.equal(0); // Current bidder has 0 withdrawable amount
    });

    it("Should return auction bidders", async function () {
      await propertyAuction.connect(bidder2).placeBid(auctionId, { 
        value: ethers.parseEther("6.0") 
      });

      const bidders = await propertyAuction.getAuctionBidders(auctionId);
      expect(bidders).to.include(bidder1.address);
      expect(bidders).to.include(bidder2.address);
    });

    it("Should check if auction is active", async function () {
      expect(await propertyAuction.isAuctionActive(auctionId)).to.be.true;

      await time.increase(86401);
      expect(await propertyAuction.isAuctionActive(auctionId)).to.be.false;
    });
  });
});
