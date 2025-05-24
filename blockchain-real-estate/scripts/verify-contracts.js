// Script to verify contracts on Etherscan
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Verifying contracts on ${network.name}...`);

  // Check if Etherscan API key is provided
  if (!process.env.ETHERSCAN_API_KEY) {
    console.error("ETHERSCAN_API_KEY not found in environment variables");
    process.exit(1);
  }

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network.name}-${network.chainId}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`Deployment file not found: ${deploymentFile}`);
    console.log("Please run deployment script first");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contracts = deploymentInfo.contracts;

  console.log("Contract addresses:");
  console.log(`PropertyRegistry: ${contracts.PropertyRegistry.address}`);
  console.log(`PropertyToken: ${contracts.PropertyToken.address}`);
  console.log(`PropertyTransactions: ${contracts.PropertyTransactions.address}`);

  // Verify PropertyRegistry
  console.log("\nVerifying PropertyRegistry...");
  try {
    await hre.run("verify:verify", {
      address: contracts.PropertyRegistry.address,
      constructorArguments: []
    });
    console.log("✅ PropertyRegistry verified successfully");
  } catch (error) {
    console.log("❌ PropertyRegistry verification failed:", error.message);
  }

  // Verify PropertyToken
  console.log("\nVerifying PropertyToken...");
  try {
    await hre.run("verify:verify", {
      address: contracts.PropertyToken.address,
      constructorArguments: [contracts.PropertyRegistry.address]
    });
    console.log("✅ PropertyToken verified successfully");
  } catch (error) {
    console.log("❌ PropertyToken verification failed:", error.message);
  }

  // Verify PropertyTransactions
  console.log("\nVerifying PropertyTransactions...");
  try {
    await hre.run("verify:verify", {
      address: contracts.PropertyTransactions.address,
      constructorArguments: [
        contracts.PropertyRegistry.address,
        contracts.PropertyToken.address
      ]
    });
    console.log("✅ PropertyTransactions verified successfully");
  } catch (error) {
    console.log("❌ PropertyTransactions verification failed:", error.message);
  }

  console.log("\nVerification process completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
