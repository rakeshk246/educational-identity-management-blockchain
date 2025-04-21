
//require("@nomicfoundations/hardhat-toolbox");
//require("@nomicfoundation/hardhat-toolbox");

//require("dotenv").config();

//const { API_URL, PRIVATE_KEY } = process.env;

/*module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts: ["0x3225dc348de2f8a8a28088d931519dc35820ae1288f634d3eb53e5d5a537fbf7"]
    }
  }
};*/

//require("@nomicfoundation/hardhat-toolbox");

/*module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Hardhat Network runs on this by default
    },
  },
};*/
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};