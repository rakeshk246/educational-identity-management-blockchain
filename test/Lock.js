const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lock", function () {
  it("Should deploy the Lock contract", async function () {
    const Lock = await ethers.getContractFactory("Lock");
    const unlockTime = Date.now() + 1000 * 60 * 60 * 24 * 7; // One week from now
    const lock = await Lock.deploy(unlockTime, { value: ethers.parseUnits("1", "ether") });
    await lock.waitForDeployment();

    const lockAddress = await lock.getAddress();
    expect(lockAddress).to.be.properAddress;
  });

  // Add more test cases as needed
});