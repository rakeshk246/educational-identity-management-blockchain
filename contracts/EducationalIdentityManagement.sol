// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EducationalIdentityManagement {
    // Existing mappings
    mapping(address => string) public dids;
    mapping(address => Role) public roles;
    mapping(string => Certificate) public certificates;

    // Add array to track certificate IDs
    string[] public certificateIds;
    
    // Enum to define roles
    enum Role { None, Student, College, Company }

    // Struct to represent a certificate
    struct Certificate {
        string id;
        string studentId;
        string courseName;
        string issuerDID;
        string holderDID;
        string ipfsCID;
        uint256 issueDate;
        bool authenticated;
        string status;
        string rejectionReason;
    }

    // Events
    event CertificateIssued(string certificateId, string studentId, string courseName, string ipfsCID);
    event CertificateAuthenticated(string certificateId, string issuerDID);
    event CertificateRejected(string certificateId, string reason);

    // Modifier to restrict access based on role
    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Unauthorized: Incorrect role");
        _;
    }

    // Function to register a DID
    function registerDID(string memory _did, Role _role) public {
        require(bytes(dids[msg.sender]).length == 0, "DID already registered for this address");
        require(bytes(_did).length > 0, "DID must not be empty");
        require(_role != Role.None, "Invalid role");

        dids[msg.sender] = _did;
        roles[msg.sender] = _role;
    }

    // Function for a student to upload a document
    function uploadDocument(
        string memory _certificateId,
        string memory _collegeDID,
        string memory _ipfsCID,
        string memory _studentId,
        string memory _courseName
    ) public onlyRole(Role.Student) {
        require(bytes(dids[msg.sender]).length > 0, "Student must have a registered DID");
        require(bytes(_collegeDID).length > 0, "College DID must not be empty");
        require(bytes(_ipfsCID).length > 0, "IPFS CID must not be empty");

        certificates[_certificateId] = Certificate({
            id: _certificateId,
            studentId: _studentId,
            courseName: _courseName,
            issuerDID: _collegeDID,
            holderDID: dids[msg.sender],
            ipfsCID: _ipfsCID,
            issueDate: block.timestamp,
            authenticated: false,
            status: "PENDING",
            rejectionReason: ""
        });

        // Add to certificate IDs array
        certificateIds.push(_certificateId);

        emit CertificateIssued(_certificateId, _studentId, _courseName, _ipfsCID);
    }

    // Function for a college to authenticate a certificate
    function authenticateCertificate(
        string memory _certificateId,
        bool _isAuthenticated,
        string memory _reason
    ) public onlyRole(Role.College) {
        require(bytes(dids[msg.sender]).length > 0, "College must have a DID");
        require(bytes(certificates[_certificateId].id).length > 0, "Certificate does not exist");
        require(
            keccak256(abi.encodePacked(certificates[_certificateId].issuerDID)) == 
            keccak256(abi.encodePacked(dids[msg.sender])),
            "Only the issuer college can authenticate"
        );

        Certificate storage cert = certificates[_certificateId];
        
        if (_isAuthenticated) {
            cert.authenticated = true;
            cert.status = "AUTHENTICATED";
            emit CertificateAuthenticated(_certificateId, dids[msg.sender]);
        } else {
            cert.status = "REJECTED";
            cert.rejectionReason = _reason;
            emit CertificateRejected(_certificateId, _reason);
        }
    }

    // Function to get pending certificates
    function getPendingCertificates() public view returns (string[] memory) {
        uint256 pendingCount = 0;
        
        // First count pending certificates
        for (uint256 i = 0; i < certificateIds.length; i++) {
            if (keccak256(abi.encodePacked(certificates[certificateIds[i]].status)) == 
                keccak256(abi.encodePacked("PENDING"))) {
                pendingCount++;
            }
        }

        // Create array for pending certificate IDs
        string[] memory pendingCerts = new string[](pendingCount);
        uint256 index = 0;

        // Fill array with pending certificate IDs
        for (uint256 i = 0; i < certificateIds.length; i++) {
            if (keccak256(abi.encodePacked(certificates[certificateIds[i]].status)) == 
                keccak256(abi.encodePacked("PENDING"))) {
                pendingCerts[index] = certificateIds[i];
                index++;
            }
        }

        return pendingCerts;
    }

    // Function for a company to verify a certificate
    function verifyCertificate(string memory _certificateId) public view returns (
        bool isAuthenticated,
        string memory studentId,
        string memory courseName,
        uint256 issueDate,
        string memory status
    ) {
        require(bytes(dids[msg.sender]).length > 0, "Verifier must have a DID");
        require(bytes(certificates[_certificateId].id).length > 0, "Certificate does not exist");

        Certificate memory cert = certificates[_certificateId];
        return (
            cert.authenticated,
            cert.studentId,
            cert.courseName,
            cert.issueDate,
            cert.status
        );
    }
}
