// pinata.js
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK('a6df7220569b987b9d39', '433b68046fab5f5ab64204eed5cadda6c4ed38ff75bffe326656c1261880614f');

// Function to upload a file to IPFS
const uploadFileToIPFS = async (filePath) => {
    const fs = require('fs');
    const readableStreamForFile = fs.createReadStream(filePath);

    const options = {
        pinataMetadata: {
            name: 'Certificate PDF', // Customize metadata
        },
        pinataOptions: {
            cidVersion: 0 // Use CID v0 for compatibility
        }
    };

    try {
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        console.log("File pinned to IPFS:", result);
        return result.IpfsHash; // Return the CID
    } catch (err) {
        console.error("Error uploading to IPFS:", err);
        throw err;
    }
};

module.exports = { uploadFileToIPFS };