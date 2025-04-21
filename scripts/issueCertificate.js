const { ethers } = require("hardhat");

async function main() {
    // Get the contract instance at the deployed address
    const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Add this after deployment
    const Contract = await ethers.getContractFactory("EducationalIdentityManagement");
    const contract = Contract.attach(contractAddress);

    // Get signers
    const [college] = await ethers.getSigners();

    // Register college DID
    const collegeDID = "did:example:college123";
    await contract.registerDID(collegeDID, 2); // 2 represents Role.College
    console.log("College DID registered:", collegeDID);

    // Register student DID
    const studentDID = "did:example:student123";
    await contract.registerDID(studentDID, 1); // 1 represents Role.Student
    console.log("Student DID registered:", studentDID);

    console.log("DIDs registered successfully");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });