# Scripts

## Purpose
- `deploy.js`: deploys `MockERC20` TokenA, `MockERC20` TokenB, and `SimpleAMM`, then prints addresses
- `interact.js`: approves tokens, adds liquidity, performs a swap, and prints reserve changes

## Run Scripts
From project root:

```bash
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/interact.js --network localhost
```

## Notes
- Keep a local Hardhat node running when using `localhost`
- Update contract addresses in `interact.js` after each fresh deployment
