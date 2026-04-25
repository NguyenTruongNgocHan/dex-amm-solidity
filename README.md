# DEX AMM Solidity

## Overview
Full-stack constant-product AMM demo built with Solidity, Hardhat, and React.
The project includes smart contracts, deployment scripts, tests, and a frontend that interacts with the AMM using Ethers.

## Features
- Token swap: `swapExactTokenAForTokenB` and `swapExactTokenBForTokenA`
- Liquidity management: add/remove liquidity with LP token mint/burn
- Wallet integration: connect wallet and execute on-chain actions from the frontend

## Tech Stack
- Solidity `0.8.24`
- Hardhat `3`
- Ethers `6`
- OpenZeppelin ERC20
- React + Vite

## Quick Setup
1. Install backend dependencies:
   ```bash
   npm install
   ```
2. Compile contracts:
   ```bash
   npx hardhat compile
   ```
3. Run tests:
   ```bash
   npx hardhat test
   ```
4. Deploy locally:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
5. Run frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
