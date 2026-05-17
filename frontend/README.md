# Frontend

## Overview

React + Vite user interface for the DEX AMM project.  
The frontend provides trading, liquidity management, LP staking, reward claiming, dashboard analytics, on-chain activity tracking, and an IPFS Evidence Center.

## Tech Stack

- React 19
- Vite 8
- ethers.js 6
- TailwindCSS 4
- Lucide React icons

## Frontend Structure

| Path | Purpose |
|---|---|
| src/pages | Top-level pages: Home, Dashboard, Trade, Liquidity, Farm |
| src/features | Page-level feature layouts and UI modules |
| src/hooks | Wallet, AMM data, trade/liquidity/farm actions, on-chain activity |
| src/lib | Web3 utilities, contract factories, formatters, math helpers, IPFS helpers |
| src/abi | ABI JSON synced from Hardhat artifacts |
| src/contracts | Synced deployment addresses JSON |
| src/config | Runtime config from deployment data |
| src/components | Reusable common/layout/chart/form UI components |
| src/styles | Global style setup |

## Main Pages

- Home: project intro and navigation
- Dashboard: reserves, prices, wallet balances, LP position, activity analytics, IPFS Evidence Center
- Trade: token swap with quote, slippage guard, deadline, and trade receipt generation
- Liquidity: add/remove liquidity with LP position and safety checks
- Farm: stake ALP, withdraw, claim DRX, and exit position

## Hooks

| Hook | Responsibility |
|---|---|
| src/hooks/useWallet.js | MetaMask connect, account state, and network enforcement |
| src/hooks/useAMMData.js | Reads reserves, balances, prices, LP share, and claimable amounts |
| src/hooks/useTradeActions.js | Swap flows, token approvals, deadline, trade receipt + IPFS upload |
| src/hooks/useLiquidityActions.js | Add/remove liquidity, approvals, min output/liquidity, deadline |
| src/hooks/useStakingData.js | Farm stats and user staking state |
| src/hooks/useStakingActions.js | Stake, withdraw, claim reward, and exit actions |
| src/hooks/useSystemEvents.js | On-chain activity timeline from AMM and staking events |

## ABI and Address Sync

The frontend depends on two synced sources:

- ABI files in src/abi
- Deployment addresses in src/contracts/addresses.json

Sync is handled from project root by:

```bash
npm run sync:frontend
```

What this does:

- Copies ABIs from artifacts/contracts/... to frontend/src/abi
- Copies deployments/localhost.json to frontend/src/contracts/addresses.json

When to sync again:

- After every contract change and recompile
- After each redeploy to localhost

## Vite Commands

From frontend folder:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

From root folder:

```bash
npm run frontend:dev
npm run frontend:build
```

## Environment Variables

Create frontend/.env (optional):

```bash
VITE_PINATA_JWT=your_pinata_jwt_here
```

Notes:

- VITE_PINATA_JWT is optional.
- If omitted, IPFS upload features switch to local fallback mode and generate local-* pseudo-CIDs stored in localStorage.

## Common Frontend Troubleshooting

| Problem | Likely reason | Fix |
|---|---|---|
| MetaMask connect fails | Wallet missing or account access denied | Install MetaMask, unlock wallet, reconnect |
| Wrong chain/network | MetaMask not on Hardhat Local | Switch to chain ID 31337 and reconnect |
| Invalid address errors | Stale deployment file | Redeploy and run npm run sync:frontend |
| Contract method mismatch | ABI not updated | Recompile and run npm run sync:frontend |
| Empty pool data after deploy | Node not running or wrong deployment | Ensure npm run node is running and deploy to localhost |
| IPFS upload not reaching Pinata | Missing or invalid VITE_PINATA_JWT | Set valid JWT, or continue in local fallback mode |
| CORS/gateway fetch issue | Remote IPFS gateway unavailable | Retry later or use local-* CID data in demo mode |

## Screenshot Placeholders

Store frontend screenshots under:

- ../docs/screenshots/02-dashboard.png
- ../docs/screenshots/03-trade-swap.png
- ../docs/screenshots/04-liquidity-add.png
- ../docs/screenshots/06-farm-stake.png
- ../docs/screenshots/08-ipfs-center.png
