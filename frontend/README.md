# Frontend

## Overview
React + Vite interface for the AMM.
It supports wallet connection, pool analytics, liquidity management, and token swaps against deployed contracts.

## Tech Stack
- React `19`
- Vite `8`
- Ethers `6`
- Tailwind CSS `4`

## Run Locally
From this folder:

```bash
npm install
npm run dev
```

Other commands:

```bash
npm run build
npm run preview
npm run lint
```

## Contract Connection
- Contract addresses are defined in `src/config/contracts.js`
- Contract instances are created in `src/lib/contracts.js` using ABIs in `src/abi`
- Update addresses in `src/config/contracts.js` after redeploying contracts
