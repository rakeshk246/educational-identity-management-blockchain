const { ethers } = require("hardhat");

async function main() {
    // Get the contract instance at the deployed address
    const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Add this after deployment
    const Contract = await ethers.getContractFactory("EducationalIdentityManagement");
    const contract = Contract.attach(contractAddress);

    // Upload document parameters
    const certificateId = "CERT001";
    const collegeDID = "did:example:college123";
    const ipfsCID = "QmZtNdPmxW64urZMRH5YTz98DrGNUvVHkSjWuE6yeVocvY"; // Replace with actual IPFS hash from Pinata

    // Upload document
    await contract.uploadDocument(certificateId, collegeDID, ipfsCID);
    console.log("Document uploaded successfully");

    // Authenticate certificate (as college)
    await contract.authenticateCertificate(certificateId);
    console.log("Certificate authenticated successfully");

    // Verify certificate
    const isVerified = await contract.verifyCertificate(certificateId);
    console.log("Certificate verification status:", isVerified);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });