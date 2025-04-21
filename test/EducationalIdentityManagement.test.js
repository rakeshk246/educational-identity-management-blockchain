const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EducationalIdentityManagement", function () {
    let contract;
    let owner;
    let student;
    let college;
    let company;

    beforeEach(async function () {
        [owner, student, college, company] = await ethers.getSigners();
        const Contract = await ethers.getContractFactory("EducationalIdentityManagement");
        contract = await Contract.deploy();
    });

    it("Should register and retrieve a DID", async function () {
        await contract.connect(student).registerDID("did:student:123", 1);
        const retrievedDID = await contract.dids(student.address);
        expect(retrievedDID).to.equal("did:student:123");
        
        const role = await contract.roles(student.address);
        expect(role).to.equal(1); // Student role
    });

    it("Should issue, authenticate, and verify a certificate", async function () {
        // Register DIDs for all parties
        await contract.connect(student).registerDID("did:student:123", 1);
        await contract.connect(college).registerDID("did:college:123", 2);
        await contract.connect(company).registerDID("did:company:123", 3);

        // Student uploads certificate
        const certificateId = "CERT_001";
        await contract.connect(student).uploadDocument(
            certificateId,
            "did:college:123",
            "QmTest123",
            "CS2023001",
            "Data Structures"
        );

        // College authenticates certificate
        await contract.connect(college).authenticateCertificate(
            certificateId,
            true,
            ""
        );

        // Company verifies certificate
        const [isAuthenticated, studentId, courseName, issueDate, status] = 
            await contract.connect(company).verifyCertificate(certificateId);

        expect(isAuthenticated).to.be.true;
        expect(studentId).to.equal("CS2023001");
        expect(courseName).to.equal("Data Structures");
        expect(status).to.equal("AUTHENTICATED");
    });

    it("Should reject invalid certificate", async function () {
        // Register DIDs for all parties
        await contract.connect(student).registerDID("did:student:123", 1);
        await contract.connect(college).registerDID("did:college:123", 2);
        await contract.connect(company).registerDID("did:company:123", 3);

        // Student uploads certificate
        const certificateId = "CERT_002";
        await contract.connect(student).uploadDocument(
            certificateId,
            "did:college:123",
            "QmTest456",
            "CS2023001",
            "Data Structures"
        );

        // College rejects certificate
        const rejectionReason = "Invalid course completion";
        await contract.connect(college).authenticateCertificate(
            certificateId,
            false,
            rejectionReason
        );

        // Company verifies certificate
        const [isAuthenticated, , , , status] = 
            await contract.connect(company).verifyCertificate(certificateId);

        expect(isAuthenticated).to.be.false;
        expect(status).to.equal("REJECTED");

        // Get certificate details to check rejection reason
        const cert = await contract.certificates(certificateId);
        expect(cert.rejectionReason).to.equal(rejectionReason);
    });

    it("Should get pending certificates", async function () {
        // Register DIDs
        await contract.connect(student).registerDID("did:student:123", 1);
        await contract.connect(college).registerDID("did:college:123", 2);

        // Upload two certificates
        await contract.connect(student).uploadDocument(
            "CERT_001",
            "did:college:123",
            "QmTest123",
            "CS2023001",
            "Data Structures"
        );

        await contract.connect(student).uploadDocument(
            "CERT_002",
            "did:college:123",
            "QmTest456",
            "CS2023001",
            "Algorithms"
        );

        // Authenticate one certificate
        await contract.connect(college).authenticateCertificate(
            "CERT_001",
            true,
            ""
        );

        // Get pending certificates
        const pendingCerts = await contract.getPendingCertificates();
        expect(pendingCerts.length).to.equal(1);
        expect(pendingCerts[0]).to.equal("CERT_002");
    });

    it("Should not allow duplicate DID registration", async function () {
        await contract.connect(student).registerDID("did:student:123", 1);
        
        await expect(
            contract.connect(student).registerDID("did:student:456", 1)
        ).to.be.revertedWith("DID already registered for this address");
    });

    it("Should not allow non-students to upload certificates", async function () {
        await contract.connect(college).registerDID("did:college:123", 2);
        
        await expect(
            contract.connect(college).uploadDocument(
                "CERT_001",
                "did:college:123",
                "QmTest123",
                "CS2023001",
                "Data Structures"
            )
        ).to.be.revertedWith("Unauthorized: Incorrect role");
    });

    it("Should require proper roles for operations", async function () {
        // Try to verify without registering DID
        await expect(
            contract.connect(company).verifyCertificate("CERT_001")
        ).to.be.revertedWith("Verifier must have a DID");

        // Register with wrong role
        await contract.connect(company).registerDID("did:company:123", 1);

        // Try to authenticate with wrong role
        await expect(
            contract.connect(company).authenticateCertificate("CERT_001", true, "")
        ).to.be.revertedWith("Unauthorized: Incorrect role");
    });

    it("Should emit proper events", async function () {
        // Register DIDs
        await contract.connect(student).registerDID("did:student:123", 1);
        await contract.connect(college).registerDID("did:college:123", 2);

        // Upload certificate
        const certificateId = "CERT_001";
        await expect(
            contract.connect(student).uploadDocument(
                certificateId,
                "did:college:123",
                "QmTest123",
                "CS2023001",
                "Data Structures"
            )
        ).to.emit(contract, "CertificateIssued")
         .withArgs(certificateId, "CS2023001", "Data Structures", "QmTest123");

        // Authenticate certificate
        await expect(
            contract.connect(college).authenticateCertificate(certificateId, true, "")
        ).to.emit(contract, "CertificateAuthenticated")
         .withArgs(certificateId, "did:college:123");
    });
});