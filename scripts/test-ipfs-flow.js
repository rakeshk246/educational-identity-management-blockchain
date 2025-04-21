const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const PINATA_API_KEY = 'a6df7220569b987b9d39';
const PINATA_SECRET_KEY = 'Y433b68046fab5f5ab64204eed5cadda6c4ed38ff75bffe326656c1261880614f';

async function uploadToPinata(filePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY,
                ...formData.getHeaders()
            }
        }
    );

    return response.data.IpfsHash;
}

async function main() {
    const [owner, student, college, company] = await ethers.getSigners();

    console.log("Deploying contract...");
    const Contract = await ethers.getContractFactory("EducationalIdentityManagement");
    const contract = await Contract.deploy();
    console.log("Contract deployed to:", await contract.getAddress());

    try {
        // 1. Create test certificate
        const certificateData = {
            studentName: "John Doe",
            studentId: "CS2023001",
            courseName: "Data Structures",
            grade: "A",
            date: new Date().toISOString()
        };

        const tempFilePath = path.join(__dirname, 'temp-certificate.json');
        fs.writeFileSync(tempFilePath, JSON.stringify(certificateData, null, 2));

        // 2. Upload to IPFS
        console.log("\nUploading to IPFS...");
        const ipfsHash = await uploadToPinata(tempFilePath);
        console.log("IPFS Hash:", ipfsHash);
        console.log("View at:", `https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

        // 3. Register DIDs
        console.log("\nRegistering DIDs...");
        await contract.connect(student).registerDID("did:student:123", 1);
        await contract.connect(college).registerDID("did:college:123", 2);

        // 4. Upload certificate to blockchain
        const certificateId = "CERT_" + Date.now();
        console.log("\nUploading certificate to blockchain...");
        await contract.connect(student).uploadDocument(
            certificateId,
            "did:college:123",
            ipfsHash,
            certificateData.studentId,
            certificateData.courseName
        );

        // 5. Verify upload
        const cert = await contract.certificates(certificateId);
        console.log("\nCertificate details:");
        console.log("- ID:", cert.id);
        console.log("- IPFS Hash:", cert.ipfsCID);
        console.log("- Status:", cert.status);

        // 6. College authentication
        console.log("\nAuthenticating certificate...");
        await contract.connect(college).authenticateCertificate(
            certificateId,
            true,
            ""
        );

        // 7. Final verification
        const finalCert = await contract.certificates(certificateId);
        console.log("\nFinal certificate status:", finalCert.status);

        // Clean up
        fs.unlinkSync(tempFilePath);

    } catch (error) {
        console.error("Error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });