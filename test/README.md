# Tests

## What Is Tested
`SimpleAMM.js` validates core AMM behavior:
- Adding liquidity and LP token minting
- Swapping Token A for Token B with reserve updates
- Removing liquidity and LP token burning
- Revert conditions (insufficient LP, empty pool swap)

## Run Tests
From project root:

```bash
npx hardhat test
```

Optional compile step:

```bash
npx hardhat compile
```
