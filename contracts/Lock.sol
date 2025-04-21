// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lock {
    address public owner;
    uint public unlockTime;
    bool public locked;

    constructor(uint _unlockTime) payable {
        require(_unlockTime > block.timestamp, "Unlock time should be in the future");
        unlockTime = _unlockTime;
        owner = msg.sender;
        locked = true;
    }

    function withdraw() public {
        require(msg.sender == owner, "You aren't the owner");
        require(block.timestamp >= unlockTime, "The lock hasn't expired yet");
        require(locked, "The lock has already been withdrawn");

        locked = false;
        payable(msg.sender).transfer(address(this).balance);
    }
}