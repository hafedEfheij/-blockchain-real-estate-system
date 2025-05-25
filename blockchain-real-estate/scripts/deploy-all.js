const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting comprehensive deployment of Blockchain Real Estate System...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const deployedContracts = {};
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  try {
    // 1. Deploy PropertyRegistry
    console.log("📋 Deploying PropertyRegistry...");
    const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
    const propertyRegistry = await PropertyRegistry.deploy();
    await propertyRegistry.waitForDeployment();
    const propertyRegistryAddress = await propertyRegistry.getAddress();
    
    deployedContracts.PropertyRegistry = propertyRegistry;
    deploymentInfo.contracts.PropertyRegistry = {
      address: propertyRegistryAddress,
      deployer: deployer.address
    };
    console.log("✅ PropertyRegistry deployed to:", propertyRegistryAddress);

    // 2. Deploy PropertyToken
    console.log("\n🎨 Deploying PropertyToken...");
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = await PropertyToken.deploy(propertyRegistryAddress);
    await propertyToken.waitForDeployment();
    const propertyTokenAddress = await propertyToken.getAddress();
    
    deployedContracts.PropertyToken = propertyToken;
    deploymentInfo.contracts.PropertyToken = {
      address: propertyTokenAddress,
      deployer: deployer.address
    };
    console.log("✅ PropertyToken deployed to:", propertyTokenAddress);

    // 3. Deploy PropertyTransactions
    console.log("\n💰 Deploying PropertyTransactions...");
    const PropertyTransactions = await ethers.getContractFactory("PropertyTransactions");
    const propertyTransactions = await PropertyTransactions.deploy(
      propertyRegistryAddress,
      propertyTokenAddress
    );
    await propertyTransactions.waitForDeployment();
    const propertyTransactionsAddress = await propertyTransactions.getAddress();
    
    deployedContracts.PropertyTransactions = propertyTransactions;
    deploymentInfo.contracts.PropertyTransactions = {
      address: propertyTransactionsAddress,
      deployer: deployer.address
    };
    console.log("✅ PropertyTransactions deployed to:", propertyTransactionsAddress);

    // 4. Deploy PropertyAuction
    console.log("\n🔨 Deploying PropertyAuction...");
    const PropertyAuction = await ethers.getContractFactory("PropertyAuction");
    const propertyAuction = await PropertyAuction.deploy(propertyRegistryAddress);
    await propertyAuction.waitForDeployment();
    const propertyAuctionAddress = await propertyAuction.getAddress();
    
    deployedContracts.PropertyAuction = propertyAuction;
    deploymentInfo.contracts.PropertyAuction = {
      address: propertyAuctionAddress,
      deployer: deployer.address
    };
    console.log("✅ PropertyAuction deployed to:", propertyAuctionAddress);

    // 5. Deploy PropertyInsurance
    console.log("\n🛡️ Deploying PropertyInsurance...");
    const PropertyInsurance = await ethers.getContractFactory("PropertyInsurance");
    const propertyInsurance = await PropertyInsurance.deploy(propertyRegistryAddress);
    await propertyInsurance.waitForDeployment();
    const propertyInsuranceAddress = await propertyInsurance.getAddress();
    
    deployedContracts.PropertyInsurance = propertyInsurance;
    deploymentInfo.contracts.PropertyInsurance = {
      address: propertyInsuranceAddress,
      deployer: deployer.address
    };
    console.log("✅ PropertyInsurance deployed to:", propertyInsuranceAddress);

    // 6. Deploy FractionalOwnership
    console.log("\n🔗 Deploying FractionalOwnership...");
    const FractionalOwnership = await ethers.getContractFactory("FractionalOwnership");
    const fractionalOwnership = await FractionalOwnership.deploy(propertyRegistryAddress);
    await fractionalOwnership.waitForDeployment();
    const fractionalOwnershipAddress = await fractionalOwnership.getAddress();
    
    deployedContracts.FractionalOwnership = fractionalOwnership;
    deploymentInfo.contracts.FractionalOwnership = {
      address: fractionalOwnershipAddress,
      deployer: deployer.address
    };
    console.log("✅ FractionalOwnership deployed to:", fractionalOwnershipAddress);

    // 7. Configure contracts
    console.log("\n⚙️ Configuring contract relationships...");
    
    // Set PropertyToken contract in PropertyRegistry
    await propertyRegistry.setPropertyTokenContract(propertyTokenAddress);
    console.log("✅ PropertyToken contract set in PropertyRegistry");

    // Set PropertyTransactions contract in PropertyRegistry
    await propertyRegistry.setPropertyTransactionsContract(propertyTransactionsAddress);
    console.log("✅ PropertyTransactions contract set in PropertyRegistry");

    // Add deployer as initial verifier
    await propertyRegistry.addVerifier(deployer.address);
    console.log("✅ Deployer added as initial verifier");

    // 8. Save deployment information
    console.log("\n💾 Saving deployment information...");
    
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const networkName = deploymentInfo.network.name;
    const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Deployment info saved to:", deploymentFile);

    // 9. Generate frontend configuration
    console.log("\n🌐 Generating frontend configuration...");
    const frontendConfig = {
      networkId: Number(deploymentInfo.network.chainId),
      networkName: networkName,
      contracts: {
        PropertyRegistry: {
          address: propertyRegistryAddress,
          abi: "PropertyRegistry.json"
        },
        PropertyToken: {
          address: propertyTokenAddress,
          abi: "PropertyToken.json"
        },
        PropertyTransactions: {
          address: propertyTransactionsAddress,
          abi: "PropertyTransactions.json"
        },
        PropertyAuction: {
          address: propertyAuctionAddress,
          abi: "PropertyAuction.json"
        },
        PropertyInsurance: {
          address: propertyInsuranceAddress,
          abi: "PropertyInsurance.json"
        },
        FractionalOwnership: {
          address: fractionalOwnershipAddress,
          abi: "FractionalOwnership.json"
        }
      }
    };

    const frontendConfigDir = path.join(__dirname, "../../frontend/src/contracts");
    if (!fs.existsSync(frontendConfigDir)) {
      fs.mkdirSync(frontendConfigDir, { recursive: true });
    }

    const frontendConfigFile = path.join(frontendConfigDir, `${networkName}.json`);
    fs.writeFileSync(frontendConfigFile, JSON.stringify(frontendConfig, null, 2));
    console.log("✅ Frontend config saved to:", frontendConfigFile);

    // 10. Copy ABIs to frontend
    console.log("\n📋 Copying contract ABIs to frontend...");
    const artifactsDir = path.join(__dirname, "../artifacts/contracts");
    const frontendAbiDir = path.join(frontendConfigDir, "abis");
    
    if (!fs.existsSync(frontendAbiDir)) {
      fs.mkdirSync(frontendAbiDir, { recursive: true });
    }

    const contractNames = [
      "PropertyRegistry",
      "PropertyToken", 
      "PropertyTransactions",
      "PropertyAuction",
      "PropertyInsurance",
      "FractionalOwnership"
    ];

    for (const contractName of contractNames) {
      const artifactPath = path.join(artifactsDir, `${contractName}.sol`, `${contractName}.json`);
      const abiPath = path.join(frontendAbiDir, `${contractName}.json`);
      
      if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
        console.log(`✅ ${contractName} ABI copied`);
      }
    }

    // 11. Verify contracts (if on supported network)
    if (process.env.ETHERSCAN_API_KEY && networkName !== "hardhat" && networkName !== "localhost") {
      console.log("\n🔍 Verifying contracts on Etherscan...");
      
      try {
        await hre.run("verify:verify", {
          address: propertyRegistryAddress,
          constructorArguments: []
        });
        console.log("✅ PropertyRegistry verified");

        await hre.run("verify:verify", {
          address: propertyTokenAddress,
          constructorArguments: [propertyRegistryAddress]
        });
        console.log("✅ PropertyToken verified");

        await hre.run("verify:verify", {
          address: propertyTransactionsAddress,
          constructorArguments: [propertyRegistryAddress, propertyTokenAddress]
        });
        console.log("✅ PropertyTransactions verified");

        await hre.run("verify:verify", {
          address: propertyAuctionAddress,
          constructorArguments: [propertyRegistryAddress]
        });
        console.log("✅ PropertyAuction verified");

        await hre.run("verify:verify", {
          address: propertyInsuranceAddress,
          constructorArguments: [propertyRegistryAddress]
        });
        console.log("✅ PropertyInsurance verified");

        await hre.run("verify:verify", {
          address: fractionalOwnershipAddress,
          constructorArguments: [propertyRegistryAddress]
        });
        console.log("✅ FractionalOwnership verified");

      } catch (error) {
        console.log("⚠️ Contract verification failed:", error.message);
      }
    }

    // 12. Display deployment summary
    console.log("\n" + "=".repeat(80));
    console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(80));
    console.log(`Network: ${networkName} (Chain ID: ${deploymentInfo.network.chainId})`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Timestamp: ${deploymentInfo.timestamp}`);
    console.log("\n📋 Deployed Contracts:");
    console.log("-".repeat(50));
    
    Object.entries(deploymentInfo.contracts).forEach(([name, info]) => {
      console.log(`${name.padEnd(25)} ${info.address}`);
    });

    console.log("\n🔧 Next Steps:");
    console.log("-".repeat(50));
    console.log("1. Update frontend environment variables with contract addresses");
    console.log("2. Configure IPFS settings for metadata storage");
    console.log("3. Set up property verifiers using addVerifier() function");
    console.log("4. Configure platform fees and parameters as needed");
    console.log("5. Test the system with sample property registrations");
    console.log("\n💡 Frontend Configuration:");
    console.log(`   Config file: ${frontendConfigFile}`);
    console.log(`   ABI directory: ${frontendAbiDir}`);
    
    console.log("\n🚀 System is ready for use!");
    console.log("=".repeat(80));

    return deployedContracts;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    throw error;
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
