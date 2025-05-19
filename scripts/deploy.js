// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  console.log("Deploying blockchain-based real estate system contracts...");

  // Deploy PropertyRegistry
  const PropertyRegistry = await hre.ethers.getContractFactory("PropertyRegistry");
  const propertyRegistry = await PropertyRegistry.deploy();
  await propertyRegistry.waitForDeployment();
  const propertyRegistryAddress = await propertyRegistry.getAddress();
  console.log(`PropertyRegistry deployed to: ${propertyRegistryAddress}`);

  // Deploy PropertyToken
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(propertyRegistryAddress);
  await propertyToken.waitForDeployment();
  const propertyTokenAddress = await propertyToken.getAddress();
  console.log(`PropertyToken deployed to: ${propertyTokenAddress}`);

  // Deploy PropertyTransactions
  const PropertyTransactions = await hre.ethers.getContractFactory("PropertyTransactions");
  const propertyTransactions = await PropertyTransactions.deploy(
    propertyRegistryAddress,
    propertyTokenAddress
  );
  await propertyTransactions.waitForDeployment();
  const propertyTransactionsAddress = await propertyTransactions.getAddress();
  console.log(`PropertyTransactions deployed to: ${propertyTransactionsAddress}`);

  console.log("Deployment completed successfully!");
  
  // Return the contract addresses for testing
  return {
    propertyRegistryAddress,
    propertyTokenAddress,
    propertyTransactionsAddress
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
