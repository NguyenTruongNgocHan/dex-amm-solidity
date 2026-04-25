# Contracts

## AMM Logic
The pool uses a constant-product model:

$$x \cdot y = k$$

Swaps apply a `0.3%` fee (`997/1000` input factor), and output is computed against current reserves.

## Main Responsibilities
- `SimpleAMM.sol`
  - Tracks `reserveA`, `reserveB`, and `totalLiquidity`
  - Handles add/remove liquidity
  - Executes Token A <-> Token B swaps with slippage checks
- `LPToken.sol`
  - ERC20 LP token minted/burned only by the AMM contract
- `MockERC20.sol`
  - Test token used for local deployment and test scenarios

## Compile and Deploy
From project root:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```
