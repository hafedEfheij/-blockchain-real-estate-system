const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blockchain Real Estate System", function () {
  let propertyRegistry;
  let propertyToken;
  let propertyTransactions;
  let owner;
  let verifier;
  let seller;
  let buyer;
  let propertyId;
  let tokenId;
  let transactionId;

  beforeEach(async function () {
    // Get signers
    [owner, verifier, seller, buyer] = await ethers.getSigners();

    // Deploy PropertyRegistry
    const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
    propertyRegistry = await PropertyRegistry.deploy();

    // Deploy PropertyToken
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    propertyToken = await PropertyToken.deploy(await propertyRegistry.getAddress());

    // Deploy PropertyTransactions
    const PropertyTransactions = await ethers.getContractFactory("PropertyTransactions");
    propertyTransactions = await PropertyTransactions.deploy(
      await propertyRegistry.getAddress(),
      await propertyToken.getAddress()
    );

    // Add verifier
    await propertyRegistry.addVerifier(verifier.address);
  });

  describe("Property Registry", function () {
    it("Should register a new property", async function () {
      // Register a property as seller
      const tx = await propertyRegistry.connect(seller).registerProperty(
        "123 Main St, City, Country",
        200, // 200 sq meters
        "Residential",
        ["ipfs://document1", "ipfs://document2"],
        ethers.parseEther("100"), // 100 ETH
        true // for sale
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = propertyRegistry.interface.parseLog(log);
          return parsedLog.name === "PropertyRegistered";
        } catch (e) {
          return false;
        }
      });

      const parsedEvent = propertyRegistry.interface.parseLog(event);
      propertyId = parsedEvent.args.propertyId;

      // Get property details
      const property = await propertyRegistry.getProperty(propertyId);
      expect(property.owner).to.equal(seller.address);
      expect(property.location).to.equal("123 Main St, City, Country");
      expect(property.area).to.equal(200);
      expect(property.propertyType).to.equal("Residential");
      expect(property.price).to.equal(ethers.parseEther("100"));
      expect(property.forSale).to.equal(true);
      expect(property.verified).to.equal(false);
    });

    it("Should verify a property", async function () {
      // Register a property
      const tx = await propertyRegistry.connect(seller).registerProperty(
        "123 Main St, City, Country",
        200,
        "Residential",
        ["ipfs://document1", "ipfs://document2"],
        ethers.parseEther("100"),
        true
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = propertyRegistry.interface.parseLog(log);
          return parsedLog.name === "PropertyRegistered";
        } catch (e) {
          return false;
        }
      });
      const parsedEvent = propertyRegistry.interface.parseLog(event);
      propertyId = parsedEvent.args.propertyId;

      // Verify the property
      await propertyRegistry.connect(verifier).verifyProperty(propertyId);

      // Check if property is verified
      const property = await propertyRegistry.getProperty(propertyId);
      expect(property.verified).to.equal(true);
    });
  });

  describe("Property Token", function () {
    beforeEach(async function () {
      // Register a property
      const tx = await propertyRegistry.connect(seller).registerProperty(
        "123 Main St, City, Country",
        200,
        "Residential",
        ["ipfs://document1", "ipfs://document2"],
        ethers.parseEther("100"),
        true
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = propertyRegistry.interface.parseLog(log);
          return parsedLog.name === "PropertyRegistered";
        } catch (e) {
          return false;
        }
      });
      const parsedEvent = propertyRegistry.interface.parseLog(event);
      propertyId = parsedEvent.args.propertyId;

      // Verify the property
      await propertyRegistry.connect(verifier).verifyProperty(propertyId);
    });

    it("Should tokenize a property", async function () {
      // Tokenize the property
      const tx = await propertyToken.connect(seller).tokenizeProperty(
        propertyId,
        "ipfs://metadata"
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = propertyToken.interface.parseLog(log);
          return parsedLog.name === "PropertyTokenized";
        } catch (e) {
          return false;
        }
      });
      const parsedEvent = propertyToken.interface.parseLog(event);
      tokenId = parsedEvent.args.tokenId;

      // Check if property is tokenized
      const isTokenized = await propertyToken.isPropertyTokenized(propertyId);
      expect(isTokenized).to.equal(true);

      // Get token details
      const tokenDetails = await propertyToken.getTokenDetails(tokenId);
      expect(tokenDetails[0]).to.equal(propertyId);
      expect(tokenDetails[1]).to.equal(seller.address);
      expect(tokenDetails[2]).to.equal("ipfs://metadata");
    });
  });

  describe("Property Transactions", function () {
    beforeEach(async function () {
      // Register a property
      const tx = await propertyRegistry.connect(seller).registerProperty(
        "123 Main St, City, Country",
        200,
        "Residential",
        ["ipfs://document1", "ipfs://document2"],
        ethers.parseEther("100"),
        true
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = propertyRegistry.interface.parseLog(log);
          return parsedLog.name === "PropertyRegistered";
        } catch (e) {
          return false;
        }
      });
      const parsedEvent = propertyRegistry.interface.parseLog(event);
      propertyId = parsedEvent.args.propertyId;

      // Verify the property
      await propertyRegistry.connect(verifier).verifyProperty(propertyId);
    });

    it("Should create a transaction", async function () {
      // Create a transaction
      const tx = await propertyTransactions.connect(buyer).createTransaction(
        propertyId,
        { value: ethers.parseEther("100") }
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = propertyTransactions.interface.parseLog(log);
          return parsedLog.name === "TransactionCreated";
        } catch (e) {
          return false;
        }
      });
      const parsedEvent = propertyTransactions.interface.parseLog(event);
      transactionId = parsedEvent.args.transactionId;

      // Get transaction details
      const transaction = await propertyTransactions.getTransaction(transactionId);
      expect(transaction.propertyId).to.equal(propertyId);
      expect(transaction.seller).to.equal(seller.address);
      expect(transaction.buyer).to.equal(buyer.address);
      expect(transaction.price).to.equal(ethers.parseEther("100"));
      expect(transaction.completed).to.equal(false);
    });

    it("Should update transaction status", async function () {
      // Create a transaction
      const tx = await propertyTransactions.connect(buyer).createTransaction(
        propertyId,
        { value: ethers.parseEther("100") }
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = propertyTransactions.interface.parseLog(log);
          return parsedLog.name === "TransactionCreated";
        } catch (e) {
          return false;
        }
      });
      const parsedEvent = propertyTransactions.interface.parseLog(event);
      transactionId = parsedEvent.args.transactionId;

      // Update transaction status
      await propertyTransactions.connect(buyer).updateTransactionStatus(
        transactionId,
        1 // InspectionPassed
      );

      // Get transaction status
      const status = await propertyTransactions.getTransactionStatus(transactionId);
      expect(status).to.equal(1); // InspectionPassed
    });
  });
});
