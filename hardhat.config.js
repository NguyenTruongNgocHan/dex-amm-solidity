const { defineConfig } = require("hardhat/config");
const hardhatEthers = require("@nomicfoundation/hardhat-ethers");

module.exports = defineConfig({
  solidity: "0.8.24",
  plugins: [hardhatEthers],
});