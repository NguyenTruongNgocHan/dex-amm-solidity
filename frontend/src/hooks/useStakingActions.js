import { useState } from "react";
import { ethers } from "ethers";
import { getAMM, getLPToken, getStakingRewards } from "../lib/contracts";

function getErrorMessage(error, fallback) {
  return (
    error?.reason ||
    error?.shortMessage ||
    error?.message ||
    fallback
  );
}

function validateAmount(amount) {
  if (!amount || Number(amount) <= 0) {
    throw new Error("Please enter an amount greater than 0.");
  }
}

export default function useStakingActions(signer, refresh, setStatus) {
  const [pending, setPending] = useState(false);

  async function stake(amount) {
    if (!signer) throw new Error("Wallet not connected.");

    try {
      validateAmount(amount);
      setPending(true);

      const parsedAmount = ethers.parseUnits(amount, 18);

      const amm = getAMM(signer);
      const lpTokenAddress = await amm.lpToken();

      const lpToken = getLPToken(lpTokenAddress, signer);
      const stakingRewards = getStakingRewards(signer);
      const stakingAddress = await stakingRewards.getAddress();

      setStatus?.("Approving LP Token...");
      const approveTx = await lpToken.approve(stakingAddress, parsedAmount);
      await approveTx.wait();

      setStatus?.("Staking LP Token...");
      const stakeTx = await stakingRewards.stake(parsedAmount);
      await stakeTx.wait();

      setStatus?.("Stake successful.");
      await refresh?.();
    } catch (error) {
      console.error(error);
      const message = getErrorMessage(error, "Stake failed.");
      setStatus?.(message);
      alert(message);
    } finally {
      setPending(false);
    }
  }

  async function withdraw(amount) {
    if (!signer) throw new Error("Wallet not connected.");

    try {
      validateAmount(amount);
      setPending(true);

      const parsedAmount = ethers.parseUnits(amount, 18);
      const stakingRewards = getStakingRewards(signer);

      setStatus?.("Withdrawing LP Token...");
      const tx = await stakingRewards.withdraw(parsedAmount);
      await tx.wait();

      setStatus?.("Withdraw successful.");
      await refresh?.();
    } catch (error) {
      console.error(error);
      const message = getErrorMessage(error, "Withdraw failed.");
      setStatus?.(message);
      alert(message);
    } finally {
      setPending(false);
    }
  }

  async function claimReward() {
    if (!signer) throw new Error("Wallet not connected.");

    try {
      setPending(true);

      const stakingRewards = getStakingRewards(signer);

      setStatus?.("Claiming DRX reward...");
      const tx = await stakingRewards.claimReward();
      await tx.wait();

      setStatus?.("Claim reward successful.");
      await refresh?.();
    } catch (error) {
      console.error(error);
      const message = getErrorMessage(error, "Claim reward failed.");
      setStatus?.(message);
      alert(message);
    } finally {
      setPending(false);
    }
  }

  async function exit() {
    if (!signer) throw new Error("Wallet not connected.");

    try {
      setPending(true);

      const stakingRewards = getStakingRewards(signer);

      setStatus?.("Exiting farm...");
      const tx = await stakingRewards.exit();
      await tx.wait();

      setStatus?.("Exit farm successful.");
      await refresh?.();
    } catch (error) {
      console.error(error);
      const message = getErrorMessage(error, "Exit farm failed.");
      setStatus?.(message);
      alert(message);
    } finally {
      setPending(false);
    }
  }

  return {
    pending,
    stake,
    withdraw,
    claimReward,
    exit,
  };
}