// Deployment script for testnets (Goerli, Sepolia, etc.)
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying to testnet...");
  
  // Get the network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);
  
  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log(`Account balance: ${hre.ethers.utils.formatEther(balance)} ETH`);

  if (balance.lt(hre.ethers.utils.parseEther("0.1"))) {
    console.warn("Warning: Low balance. Make sure you have enough ETH for deployment.");
  }

  // Deploy PropertyRegistry
  console.log("\nDeploying PropertyRegistry...");
  const PropertyRegistry = await hre.ethers.getContractFactory("PropertyRegistry");
  const propertyRegistry = await PropertyRegistry.deploy();
  await propertyRegistry.deployed();
  console.log(`PropertyRegistry deployed to: ${propertyRegistry.address}`);

  // Deploy PropertyToken
  console.log("\nDeploying PropertyToken...");
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(propertyRegistry.address);
  await propertyToken.deployed();
  console.log(`PropertyToken deployed to: ${propertyToken.address}`);

  // Deploy PropertyTransactions
  console.log("\nDeploying PropertyTransactions...");
  const PropertyTransactions = await hre.ethers.getContractFactory("PropertyTransactions");
  const propertyTransactions = await PropertyTransactions.deploy(
    propertyRegistry.address,
    propertyToken.address
  );
  await propertyTransactions.deployed();
  console.log(`PropertyTransactions deployed to: ${propertyTransactions.address}`);

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PropertyRegistry: {
        address: propertyRegistry.address,
        transactionHash: propertyRegistry.deployTransaction.hash
      },
      PropertyToken: {
        address: propertyToken.address,
        transactionHash: propertyToken.deployTransaction.hash
      },
      PropertyTransactions: {
        address: propertyTransactions.address,
        transactionHash: propertyTransactions.deployTransaction.hash
      }
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}-${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment information saved to: ${deploymentFile}`);

  // Verify contracts on Etherscan (if API key is provided)
  if (process.env.ETHERSCAN_API_KEY && network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nVerifying contracts on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: propertyRegistry.address,
        constructorArguments: []
      });
      console.log("PropertyRegistry verified");
    } catch (error) {
      console.log("PropertyRegistry verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: propertyToken.address,
        constructorArguments: [propertyRegistry.address]
      });
      console.log("PropertyToken verified");
    } catch (error) {
      console.log("PropertyToken verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: propertyTransactions.address,
        constructorArguments: [propertyRegistry.address, propertyToken.address]
      });
      console.log("PropertyTransactions verified");
    } catch (error) {
      console.log("PropertyTransactions verification failed:", error.message);
    }
  }

  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${network.name}`);
  console.log(`PropertyRegistry: ${propertyRegistry.address}`);
  console.log(`PropertyToken: ${propertyToken.address}`);
  console.log(`PropertyTransactions: ${propertyTransactions.address}`);
  console.log("\nUpdate your frontend configuration with these addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
