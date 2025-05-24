const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyToken", function () {
  let propertyRegistry;
  let propertyToken;
  let owner;
  let verifier;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, verifier, user1, user2] = await ethers.getSigners();

    // Deploy PropertyRegistry first
    const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
    propertyRegistry = await PropertyRegistry.deploy();
    await propertyRegistry.deployed();

    // Deploy PropertyToken
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    propertyToken = await PropertyToken.deploy(propertyRegistry.address);
    await propertyToken.deployed();

    // Add verifier to registry
    await propertyRegistry.addVerifier(verifier.address);

    // Register a test property
    await propertyRegistry.connect(user1).registerProperty(
      "123 Test St, Test City",
      200,
      "Residential",
      ["ipfs://test1", "ipfs://test2"],
      ethers.utils.parseEther("100"),
      false
    );

    // Verify the property
    await propertyRegistry.connect(verifier).verifyProperty(1);
  });

  describe("Deployment", function () {
    it("Should set the correct property registry address", async function () {
      expect(await propertyToken.propertyRegistry()).to.equal(propertyRegistry.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await propertyToken.name()).to.equal("PropertyToken");
      expect(await propertyToken.symbol()).to.equal("PROP");
    });
  });

  describe("Property Tokenization", function () {
    it("Should tokenize a verified property", async function () {
      const metadataURI = "ipfs://metadata123";
      
      const tx = await propertyToken.connect(user1).tokenizeProperty(1, metadataURI);
      const receipt = await tx.wait();
      
      const event = receipt.events.find(e => e.event === "PropertyTokenized");
      expect(event.args.propertyId).to.equal(1);
      expect(event.args.owner).to.equal(user1.address);
      
      const tokenId = event.args.tokenId;
      expect(await propertyToken.ownerOf(tokenId)).to.equal(user1.address);
      expect(await propertyToken.tokenURI(tokenId)).to.equal(metadataURI);
    });

    it("Should not allow tokenizing unverified property", async function () {
      // Register an unverified property
      await propertyRegistry.connect(user2).registerProperty(
        "456 Test Ave, Test City",
        150,
        "Commercial",
        ["ipfs://test3"],
        ethers.utils.parseEther("75"),
        false
      );

      await expect(
        propertyToken.connect(user2).tokenizeProperty(2, "ipfs://metadata456")
      ).to.be.revertedWith("Property must be verified");
    });

    it("Should not allow non-owner to tokenize property", async function () {
      await expect(
        propertyToken.connect(user2).tokenizeProperty(1, "ipfs://metadata123")
      ).to.be.revertedWith("Not the property owner");
    });

    it("Should not allow tokenizing already tokenized property", async function () {
      await propertyToken.connect(user1).tokenizeProperty(1, "ipfs://metadata123");
      
      await expect(
        propertyToken.connect(user1).tokenizeProperty(1, "ipfs://metadata456")
      ).to.be.revertedWith("Property already tokenized");
    });

    it("Should not allow tokenizing non-existent property", async function () {
      await expect(
        propertyToken.connect(user1).tokenizeProperty(999, "ipfs://metadata123")
      ).to.be.revertedWith("Property does not exist");
    });
  });

  describe("Token Management", function () {
    let tokenId;

    beforeEach(async function () {
      const tx = await propertyToken.connect(user1).tokenizeProperty(1, "ipfs://metadata123");
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "PropertyTokenized");
      tokenId = event.args.tokenId;
    });

    it("Should return correct token details", async function () {
      const details = await propertyToken.getTokenDetails(tokenId);
      expect(details.propertyId).to.equal(1);
      expect(details.owner).to.equal(user1.address);
      expect(details.metadataURI).to.equal("ipfs://metadata123");
    });

    it("Should check if property is tokenized", async function () {
      expect(await propertyToken.isPropertyTokenized(1)).to.equal(true);
      expect(await propertyToken.isPropertyTokenized(999)).to.equal(false);
    });

    it("Should get property ID from token ID", async function () {
      expect(await propertyToken.getPropertyIdFromToken(tokenId)).to.equal(1);
    });

    it("Should get token ID from property ID", async function () {
      expect(await propertyToken.getTokenIdFromProperty(1)).to.equal(tokenId);
    });

    it("Should revert when getting token ID for non-tokenized property", async function () {
      await expect(
        propertyToken.getTokenIdFromProperty(999)
      ).to.be.revertedWith("Property not tokenized");
    });
  });

  describe("Token Transfers", function () {
    let tokenId;

    beforeEach(async function () {
      const tx = await propertyToken.connect(user1).tokenizeProperty(1, "ipfs://metadata123");
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "PropertyTokenized");
      tokenId = event.args.tokenId;
    });

    it("Should transfer token ownership", async function () {
      await propertyToken.connect(user1).transferFrom(user1.address, user2.address, tokenId);
      
      expect(await propertyToken.ownerOf(tokenId)).to.equal(user2.address);
      expect(await propertyToken.balanceOf(user1.address)).to.equal(0);
      expect(await propertyToken.balanceOf(user2.address)).to.equal(1);
    });

    it("Should approve and transfer token", async function () {
      await propertyToken.connect(user1).approve(user2.address, tokenId);
      expect(await propertyToken.getApproved(tokenId)).to.equal(user2.address);
      
      await propertyToken.connect(user2).transferFrom(user1.address, user2.address, tokenId);
      expect(await propertyToken.ownerOf(tokenId)).to.equal(user2.address);
    });

    it("Should set approval for all", async function () {
      await propertyToken.connect(user1).setApprovalForAll(user2.address, true);
      expect(await propertyToken.isApprovedForAll(user1.address, user2.address)).to.equal(true);
      
      await propertyToken.connect(user2).transferFrom(user1.address, user2.address, tokenId);
      expect(await propertyToken.ownerOf(tokenId)).to.equal(user2.address);
    });

    it("Should not allow unauthorized transfer", async function () {
      await expect(
        propertyToken.connect(user2).transferFrom(user1.address, user2.address, tokenId)
      ).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });
  });

  describe("Metadata Management", function () {
    let tokenId;

    beforeEach(async function () {
      const tx = await propertyToken.connect(user1).tokenizeProperty(1, "ipfs://metadata123");
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "PropertyTokenized");
      tokenId = event.args.tokenId;
    });

    it("Should update token metadata by owner", async function () {
      const newMetadataURI = "ipfs://newmetadata456";
      
      await propertyToken.connect(user1).updateTokenMetadata(tokenId, newMetadataURI);
      expect(await propertyToken.tokenURI(tokenId)).to.equal(newMetadataURI);
    });

    it("Should not allow non-owner to update metadata", async function () {
      await expect(
        propertyToken.connect(user2).updateTokenMetadata(tokenId, "ipfs://newmetadata456")
      ).to.be.revertedWith("Not the token owner");
    });

    it("Should not allow empty metadata URI", async function () {
      await expect(
        propertyToken.connect(user1).updateTokenMetadata(tokenId, "")
      ).to.be.revertedWith("Metadata URI cannot be empty");
    });
  });

  describe("Token Enumeration", function () {
    it("Should track total supply", async function () {
      expect(await propertyToken.totalSupply()).to.equal(0);
      
      await propertyToken.connect(user1).tokenizeProperty(1, "ipfs://metadata123");
      expect(await propertyToken.totalSupply()).to.equal(1);
    });

    it("Should enumerate tokens by owner", async function () {
      // Register and tokenize multiple properties
      await propertyRegistry.connect(user1).registerProperty(
        "456 Test Ave", 150, "Commercial", ["ipfs://test3"], ethers.utils.parseEther("75"), false
      );
      await propertyRegistry.connect(verifier).verifyProperty(2);

      await propertyToken.connect(user1).tokenizeProperty(1, "ipfs://metadata123");
      await propertyToken.connect(user1).tokenizeProperty(2, "ipfs://metadata456");

      expect(await propertyToken.balanceOf(user1.address)).to.equal(2);
      expect(await propertyToken.tokenOfOwnerByIndex(user1.address, 0)).to.equal(1);
      expect(await propertyToken.tokenOfOwnerByIndex(user1.address, 1)).to.equal(2);
    });

    it("Should enumerate all tokens", async function () {
      await propertyToken.connect(user1).tokenizeProperty(1, "ipfs://metadata123");
      
      expect(await propertyToken.tokenByIndex(0)).to.equal(1);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to pause contract", async function () {
      await propertyToken.pause();
      expect(await propertyToken.paused()).to.equal(true);
    });

    it("Should not allow non-owner to pause contract", async function () {
      await expect(
        propertyToken.connect(user1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow tokenization when paused", async function () {
      await propertyToken.pause();
      
      await expect(
        propertyToken.connect(user1).tokenizeProperty(1, "ipfs://metadata123")
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to unpause contract", async function () {
      await propertyToken.pause();
      await propertyToken.unpause();
      expect(await propertyToken.paused()).to.equal(false);
    });
  });

  describe("Events", function () {
    it("Should emit PropertyTokenized event", async function () {
      await expect(
        propertyToken.connect(user1).tokenizeProperty(1, "ipfs://metadata123")
      ).to.emit(propertyToken, "PropertyTokenized");
    });

    it("Should emit standard ERC721 events", async function () {
      const tx = await propertyToken.connect(user1).tokenizeProperty(1, "ipfs://metadata123");
      const receipt = await tx.wait();
      
      const transferEvent = receipt.events.find(e => e.event === "Transfer");
      expect(transferEvent.args.from).to.equal(ethers.constants.AddressZero);
      expect(transferEvent.args.to).to.equal(user1.address);
    });
  });
});
