/*const { ethers } = require("hardhat");

async function main() {
  const EducationalIdentityManagement = await ethers.getContractFactory("EducationalIdentityManagement");
  const educationalIdentityManagement = await EducationalIdentityManagement.deploy();
  await educationalIdentityManagement.deployTransaction.wait(); // Wait for transaction to be mined

  console.log("EducationalIdentityManagement deployed to:", educationalIdentityManagement.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });*/

  const { ethers } = require("hardhat");

  async function main() {
      // Step 1: Get the Contract Factory
      const ContractFactory = await ethers.getContractFactory("EducationalIdentityManagement");
  
      // Step 2: Deploy the Contract
      const contract = await ContractFactory.deploy();
      await contract.waitForDeployment(); // Wait for deployment to complete
  
      // Step 3: Log the Contract Address
      console.log("Contract deployed to:", await contract.getAddress());
  }
  
  // Run the deployment
  main()
      .then(() => process.exit(0))
      .catch((error) => {
          console.error(error);
          process.exit(1);
      });