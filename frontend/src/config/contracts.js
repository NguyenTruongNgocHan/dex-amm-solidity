import deployment from "../contracts/addresses.json";

export const HARDHAT_CHAIN_ID = deployment.chainId || 31337;

export const CONTRACTS = {
  tokenA: deployment.contracts.tokenA,
  tokenB: deployment.contracts.tokenB,
  amm: deployment.contracts.amm,
  lpToken: deployment.contracts.lpToken,
  rewardToken: deployment.contracts.rewardToken,
  stakingRewards: deployment.contracts.stakingRewards,
};

export const SYMBOLS = {
  tokenA: deployment.symbols?.tokenA || "DTA",
  tokenB: deployment.symbols?.tokenB || "DTB",
  lpToken: deployment.symbols?.lpToken || "LP-AMM",
  rewardToken: deployment.symbols?.rewardToken || "DRX",
};

export const DEPLOYMENT_INFO = deployment;