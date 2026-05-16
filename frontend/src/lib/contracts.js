import { ethers } from "ethers";
import { CONTRACTS } from "../config/contracts";

import SimpleAMMArtifact from "../abi/SimpleAMM.json";
import MockERC20Artifact from "../abi/MockERC20.json";
import LPTokenArtifact from "../abi/LPToken.json";
import DEXRewardTokenArtifact from "../abi/DEXRewardToken.json";
import StakingRewardsArtifact from "../abi/StakingRewards.json";

function getAbi(artifactOrAbi) {
  return artifactOrAbi.abi ?? artifactOrAbi;
}

function assertAddress(address, label) {
  if (!address || !ethers.isAddress(address)) {
    throw new Error(`Invalid ${label} address. Please redeploy and sync frontend.`);
  }
}

export function getAMM(signerOrProvider) {
  assertAddress(CONTRACTS.amm, "AMM");
  return new ethers.Contract(CONTRACTS.amm, getAbi(SimpleAMMArtifact), signerOrProvider);
}

export function getTokenA(signerOrProvider) {
  assertAddress(CONTRACTS.tokenA, "TokenA");
  return new ethers.Contract(CONTRACTS.tokenA, getAbi(MockERC20Artifact), signerOrProvider);
}

export function getTokenB(signerOrProvider) {
  assertAddress(CONTRACTS.tokenB, "TokenB");
  return new ethers.Contract(CONTRACTS.tokenB, getAbi(MockERC20Artifact), signerOrProvider);
}

export function getLPToken(signerOrProvider, overrideAddress = CONTRACTS.lpToken) {
  assertAddress(overrideAddress, "LPToken");
  return new ethers.Contract(overrideAddress, getAbi(LPTokenArtifact), signerOrProvider);
}

export function getRewardToken(signerOrProvider) {
  assertAddress(CONTRACTS.rewardToken, "RewardToken");
  return new ethers.Contract(CONTRACTS.rewardToken, getAbi(DEXRewardTokenArtifact), signerOrProvider);
}

export function getStakingRewards(signerOrProvider) {
  assertAddress(CONTRACTS.stakingRewards, "StakingRewards");
  return new ethers.Contract(
    CONTRACTS.stakingRewards,
    getAbi(StakingRewardsArtifact),
    signerOrProvider
  );
}