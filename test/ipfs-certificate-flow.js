const { expect } = require("chai");
const { ethers } = require("hardhat");
const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Pinata credentials
const PINATA_API_KEY = 'a6df7220569b987b9d39';
const PINATA_SECRET_KEY = '433b68046fab5f5ab64204eed5cadda6c4ed38ff75bffe326656c1261880614f';

async function uploadToPinata(filePath) {
    try {
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
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
        throw error;
    }
}

describe("Certificate Flow with IPFS", function() {
    let contract;
    let student;
    let college;
    let company;
    let certificateIPFSHash;

    // Test certificate data
    const certificateId = "CERT_" + Date.now();
    const studentId = "CS2023001";
    const courseName = "Data Structures";

    before(async function() {
        // Deploy contract
        const Contract = await ethers.getContractFactory("EducationalIdentityManagement");
        contract = await Contract.deploy();
        [owner, student, college, company] = await ethers.getSigners();

        // Register DIDs
        await contract.connect(student).registerDID("did:student:123", 1);
        await contract.connect(college).registerDID("did:college:123", 2);
        await contract.connect(company).registerDID("did:company:123", 3);

        // Create and upload test certificate
        const certificateData = {
            studentName: "John Doe",
            studentId: studentId,
            courseName: courseName,
            grade: "A",
            date: new Date().toISOString()
        };

        // Create temporary certificate file
        const tempFilePath = path.join(__dirname, 'temp-certificate.json');
        fs.writeFileSync(tempFilePath, JSON.stringify(certificateData, null, 2));

        // Upload to IPFS
        console.log("Uploading certificate to IPFS...");
        certificateIPFSHash = await uploadToPinata(tempFilePath);
        console.log("Certificate uploaded to IPFS with hash:", certificateIPFSHash);

        // Clean up temp file
        fs.unlinkSync(tempFilePath);
    });

    it("Should upload certificate with IPFS hash", async function() {
        await contract.connect(student).uploadDocument(
            certificateId,
            "did:college:123",
            certificateIPFSHash,
            studentId,
            courseName
        );

        const cert = await contract.certificates(certificateId);
        expect(cert.ipfsCID).to.equal(certificateIPFSHash);
    });

    it("Should verify certificate content on IPFS", async function() {
        // Fetch certificate from IPFS
        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${certificateIPFSHash}`);
        const certificateContent = response.data;

        expect(certificateContent.studentId).to.equal(studentId);
        expect(certificateContent.courseName).to.equal(courseName);
    });

    it("Should authenticate certificate after verification", async function() {
        await contract.connect(college).authenticateCertificate(
            certificateId,
            true,
            ""
        );

        const cert = await contract.certificates(certificateId);
        expect(cert.authenticated).to.be.true;
    });
});