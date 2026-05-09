import { ethers } from "ethers";
import { getAMM, getLPToken, getStakingRewards } from "../lib/contracts";

export default function useStakingActions(signer, refresh) {
  async function stake(amount) {
    if (!signer) throw new Error("Wallet not connected");

    const parsedAmount = ethers.parseUnits(amount, 18);

    const amm = getAMM(signer);
    const lpTokenAddress = await amm.lpToken();

    const lpToken = getLPToken(lpTokenAddress, signer);
    const stakingRewards = getStakingRewards(signer);

    const stakingAddress = await stakingRewards.getAddress();

    const approveTx = await lpToken.approve(stakingAddress, parsedAmount);
    await approveTx.wait();

    const stakeTx = await stakingRewards.stake(parsedAmount);
    await stakeTx.wait();

    refresh?.();
  }

  async function withdraw(amount) {
    if (!signer) throw new Error("Wallet not connected");

    const parsedAmount = ethers.parseUnits(amount, 18);
    const stakingRewards = getStakingRewards(signer);

    const tx = await stakingRewards.withdraw(parsedAmount);
    await tx.wait();

    refresh?.();
  }

  async function claimReward() {
    if (!signer) throw new Error("Wallet not connected");

    const stakingRewards = getStakingRewards(signer);

    const tx = await stakingRewards.claimReward();
    await tx.wait();

    refresh?.();
  }

  async function exit() {
    if (!signer) throw new Error("Wallet not connected");

    const stakingRewards = getStakingRewards(signer);

    const tx = await stakingRewards.exit();
    await tx.wait();

    refresh?.();
  }

  return {
    stake,
    withdraw,
    claimReward,
    exit,
  };
}