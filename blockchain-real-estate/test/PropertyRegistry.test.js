const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyRegistry", function () {
  let propertyRegistry;
  let owner;
  let verifier;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, verifier, user1, user2] = await ethers.getSigners();

    const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
    propertyRegistry = await PropertyRegistry.deploy();
    await propertyRegistry.deployed();

    // Add verifier
    await propertyRegistry.addVerifier(verifier.address);
  });

  describe("Property Registration", function () {
    it("Should register a new property", async function () {
      const tx = await propertyRegistry.connect(user1).registerProperty(
        "123 Main St, City, Country",
        200,
        "Residential",
        ["ipfs://document1", "ipfs://document2"],
        ethers.utils.parseEther("100"),
        true
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "PropertyRegistered");
      
      expect(event.args.owner).to.equal(user1.address);
      expect(event.args.location).to.equal("123 Main St, City, Country");
    });

    it("Should set correct property details", async function () {
      await propertyRegistry.connect(user1).registerProperty(
        "123 Main St, City, Country",
        200,
        "Residential",
        ["ipfs://document1"],
        ethers.utils.parseEther("100"),
        true
      );

      const property = await propertyRegistry.getProperty(1);
      expect(property.location).to.equal("123 Main St, City, Country");
      expect(property.area).to.equal(200);
      expect(property.propertyType).to.equal("Residential");
      expect(property.owner).to.equal(user1.address);
      expect(property.price).to.equal(ethers.utils.parseEther("100"));
      expect(property.forSale).to.equal(true);
      expect(property.verified).to.equal(false);
    });

    it("Should increment property ID", async function () {
      await propertyRegistry.connect(user1).registerProperty(
        "Property 1", 100, "Residential", ["doc1"], ethers.utils.parseEther("50"), false
      );
      await propertyRegistry.connect(user2).registerProperty(
        "Property 2", 150, "Commercial", ["doc2"], ethers.utils.parseEther("75"), true
      );

      const property1 = await propertyRegistry.getProperty(1);
      const property2 = await propertyRegistry.getProperty(2);

      expect(property1.id).to.equal(1);
      expect(property2.id).to.equal(2);
    });
  });

  describe("Property Verification", function () {
    beforeEach(async function () {
      await propertyRegistry.connect(user1).registerProperty(
        "Test Property", 100, "Residential", ["doc1"], ethers.utils.parseEther("50"), false
      );
    });

    it("Should allow verifier to verify property", async function () {
      await propertyRegistry.connect(verifier).verifyProperty(1);
      
      const property = await propertyRegistry.getProperty(1);
      expect(property.verified).to.equal(true);
    });

    it("Should emit PropertyVerified event", async function () {
      await expect(propertyRegistry.connect(verifier).verifyProperty(1))
        .to.emit(propertyRegistry, "PropertyVerified")
        .withArgs(1, verifier.address);
    });

    it("Should not allow non-verifier to verify property", async function () {
      await expect(propertyRegistry.connect(user1).verifyProperty(1))
        .to.be.revertedWith("Not an authorized verifier");
    });

    it("Should not allow verifying non-existent property", async function () {
      await expect(propertyRegistry.connect(verifier).verifyProperty(999))
        .to.be.revertedWith("Property does not exist");
    });

    it("Should not allow verifying already verified property", async function () {
      await propertyRegistry.connect(verifier).verifyProperty(1);
      
      await expect(propertyRegistry.connect(verifier).verifyProperty(1))
        .to.be.revertedWith("Property already verified");
    });
  });

  describe("Property Listing", function () {
    beforeEach(async function () {
      await propertyRegistry.connect(user1).registerProperty(
        "Test Property", 100, "Residential", ["doc1"], ethers.utils.parseEther("50"), false
      );
    });

    it("Should allow owner to list property for sale", async function () {
      await propertyRegistry.connect(user1).listPropertyForSale(1, ethers.utils.parseEther("75"));
      
      const property = await propertyRegistry.getProperty(1);
      expect(property.forSale).to.equal(true);
      expect(property.price).to.equal(ethers.utils.parseEther("75"));
    });

    it("Should emit PropertyListed event", async function () {
      await expect(propertyRegistry.connect(user1).listPropertyForSale(1, ethers.utils.parseEther("75")))
        .to.emit(propertyRegistry, "PropertyListed")
        .withArgs(1, ethers.utils.parseEther("75"));
    });

    it("Should not allow non-owner to list property", async function () {
      await expect(propertyRegistry.connect(user2).listPropertyForSale(1, ethers.utils.parseEther("75")))
        .to.be.revertedWith("Not the property owner");
    });

    it("Should allow owner to unlist property", async function () {
      await propertyRegistry.connect(user1).listPropertyForSale(1, ethers.utils.parseEther("75"));
      await propertyRegistry.connect(user1).unlistProperty(1);
      
      const property = await propertyRegistry.getProperty(1);
      expect(property.forSale).to.equal(false);
    });
  });

  describe("Property Queries", function () {
    beforeEach(async function () {
      // Register multiple properties
      await propertyRegistry.connect(user1).registerProperty(
        "Property 1", 100, "Residential", ["doc1"], ethers.utils.parseEther("50"), true
      );
      await propertyRegistry.connect(user1).registerProperty(
        "Property 2", 150, "Commercial", ["doc2"], ethers.utils.parseEther("75"), false
      );
      await propertyRegistry.connect(user2).registerProperty(
        "Property 3", 200, "Residential", ["doc3"], ethers.utils.parseEther("100"), true
      );
    });

    it("Should return properties by owner", async function () {
      const user1Properties = await propertyRegistry.getPropertiesByOwner(user1.address);
      const user2Properties = await propertyRegistry.getPropertiesByOwner(user2.address);

      expect(user1Properties.length).to.equal(2);
      expect(user2Properties.length).to.equal(1);
      expect(user1Properties[0]).to.equal(1);
      expect(user1Properties[1]).to.equal(2);
      expect(user2Properties[0]).to.equal(3);
    });

    it("Should return properties for sale", async function () {
      const propertiesForSale = await propertyRegistry.getPropertiesForSale();

      expect(propertiesForSale.length).to.equal(2);
      expect(propertiesForSale[0]).to.equal(1);
      expect(propertiesForSale[1]).to.equal(3);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to add verifier", async function () {
      await propertyRegistry.addVerifier(user1.address);
      expect(await propertyRegistry.isVerifier(user1.address)).to.equal(true);
    });

    it("Should allow owner to remove verifier", async function () {
      await propertyRegistry.addVerifier(user1.address);
      await propertyRegistry.removeVerifier(user1.address);
      expect(await propertyRegistry.isVerifier(user1.address)).to.equal(false);
    });

    it("Should not allow non-owner to add verifier", async function () {
      await expect(propertyRegistry.connect(user1).addVerifier(user2.address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
