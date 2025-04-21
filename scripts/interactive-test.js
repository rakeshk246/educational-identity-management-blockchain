const { ethers } = require("hardhat");
const prompt = require('prompt-sync')();

async function main() {
    // Deploy contract
    const Contract = await ethers.getContractFactory("EducationalIdentityManagement");
    const contract = await Contract.deploy();
    console.log("Contract deployed to:", await contract.getAddress());

    // Get accounts
    const [owner, student, college, company] = await ethers.getSigners();
    console.log("\nAvailable Accounts:");
    console.log("Student Account:", student.address);
    console.log("College Account:", college.address);
    console.log("Company Account:", company.address);

    while (true) {
        console.log("\n=== Educational Identity Management System ===");
        console.log("1. Register DID");
        console.log("2. Upload Certificate");
        console.log("3. Authenticate Certificate");
        console.log("4. Verify Certificate");
        console.log("5. Exit");

        const choice = prompt("Enter your choice (1-5): ");

        switch (choice) {
            case "1":
                await registerDID(contract, student, college, company);
                break;
            case "2":
                await uploadCertificate(contract, student);
                break;
            case "3":
                await authenticateCertificate(contract, college);
                break;
            case "4":
                await verifyCertificate(contract, company);
                break;
            case "5":
                console.log("Exiting...");
                return;
            default:
                console.log("Invalid choice!");
        }
    }
}

async function registerDID(contract, student, college, company) {
    console.log("\n=== Register DID ===");
    console.log("1. Register as Student");
    console.log("2. Register as College");
    console.log("3. Register as Company");

    const roleChoice = prompt("Choose role (1-3): ");
    const did = prompt("Enter DID (e.g., did:example:123): ");

    try {
        switch (roleChoice) {
            case "1":
                await contract.connect(student).registerDID(did, 1);
                console.log("Student DID registered successfully!");
                break;
            case "2":
                await contract.connect(college).registerDID(did, 2);
                console.log("College DID registered successfully!");
                break;
            case "3":
                await contract.connect(company).registerDID(did, 3);
                console.log("Company DID registered successfully!");
                break;
            default:
                console.log("Invalid role choice!");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

async function uploadCertificate(contract, student) {
    console.log("\n=== Upload Certificate ===");
    const certificateId = prompt("Enter Certificate ID: ");
    const collegeDID = prompt("Enter College DID: ");
    const studentId = prompt("Enter Student ID: ");
    const courseName = prompt("Enter Course Name: ");
    const ipfsCID = prompt("Enter IPFS CID: ");

    try {
        await contract.connect(student).uploadDocument(
            certificateId,
            collegeDID,
            ipfsCID,
            studentId,
            courseName
        );
        console.log("Certificate uploaded successfully!");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

async function authenticateCertificate(contract, college) {
    console.log("\n=== Authenticate Certificate ===");
    const certificateId = prompt("Enter Certificate ID: ");
    const isAuthentic = prompt("Authenticate? (yes/no): ").toLowerCase() === 'yes';
    const reason = !isAuthentic ? prompt("Enter rejection reason: ") : "";

    try {
        await contract.connect(college).authenticateCertificate(
            certificateId,
            isAuthentic,
            reason
        );
        console.log(isAuthentic ? "Certificate authenticated!" : "Certificate rejected!");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

async function verifyCertificate(contract, company) {
    console.log("\n=== Verify Certificate ===");
    const certificateId = prompt("Enter Certificate ID: ");

    try {
        const [isAuthenticated, studentId, courseName, issueDate, status] = 
            await contract.connect(company).verifyCertificate(certificateId);

        console.log("\nCertificate Details:");
        console.log("Authenticated:", isAuthenticated);
        console.log("Student ID:", studentId);
        console.log("Course:", courseName);
        console.log("Issue Date:", new Date(Number(issueDate) * 1000).toLocaleString());
        console.log("Status:", status);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });