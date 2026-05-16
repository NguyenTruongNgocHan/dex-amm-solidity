import { useState } from "react";
import { ethers } from "ethers";
import { getAMM, getLPToken, getStakingRewards } from "../lib/contracts";
import { SYMBOLS } from "../config/contracts";

function getErrorMessage(error, fallback) {
  return error?.reason || error?.shortMessage || error?.message || fallback;
}

function validateAmount(amount) {
  if (!amount || Number(amount) <= 0) {
    throw new Error("Please enter an amount greater than 0.");
  }
}

async function approveIfNeeded(token, owner, spender, amount, label, setStatus) {
  const allowance = await token.allowance(owner, spender);

  if (allowance >= amount) return;

  setStatus?.(`Approving ${label}...`);
  const approveTx = await token.approve(spender, amount);
  await approveTx.wait();
}

export default function useStakingActions(signer, refresh, setStatus) {
  const [pending, setPending] = useState(false);

  async function stake(amount) {
    if (!signer) {
      setStatus?.("Please connect wallet first.");
      return;
    }

    try {
      validateAmount(amount);
      setPending(true);

      const userAddress = await signer.getAddress();
      const parsedAmount = ethers.parseUnits(amount, 18);

      const amm = getAMM(signer);
      const lpTokenAddress = await amm.lpToken();
      const lpToken = getLPToken(signer, lpTokenAddress);
      const stakingRewards = getStakingRewards(signer);
      const stakingAddress = await stakingRewards.getAddress();

      const lpBalance = await lpToken.balanceOf(userAddress);

      if (lpBalance < parsedAmount) {
        throw new Error(`Insufficient ${SYMBOLS.lpToken} balance.`);
      }

      await approveIfNeeded(
        lpToken,
        userAddress,
        stakingAddress,
        parsedAmount,
        SYMBOLS.lpToken,
        setStatus
      );

      setStatus?.(`Staking ${SYMBOLS.lpToken}...`);
      const stakeTx = await stakingRewards.stake(parsedAmount);
      await stakeTx.wait();

      setStatus?.("Stake successful.");
      await refresh?.();
    } catch (error) {
      console.error(error);
      setStatus?.(getErrorMessage(error, "Stake failed."));
    } finally {
      setPending(false);
    }
  }

  async function withdraw(amount) {
    if (!signer) {
      setStatus?.("Please connect wallet first.");
      return;
    }

    try {
      validateAmount(amount);
      setPending(true);

      const userAddress = await signer.getAddress();
      const parsedAmount = ethers.parseUnits(amount, 18);
      const stakingRewards = getStakingRewards(signer);

      const stakedBalance = await stakingRewards.balanceOf(userAddress);

      if (stakedBalance < parsedAmount) {
        throw new Error(`Insufficient staked ${SYMBOLS.lpToken} balance.`);
      }

      setStatus?.(`Withdrawing ${SYMBOLS.lpToken}...`);
      const tx = await stakingRewards.withdraw(parsedAmount);
      await tx.wait();

      setStatus?.("Withdraw successful.");
      await refresh?.();
    } catch (error) {
      console.error(error);
      setStatus?.(getErrorMessage(error, "Withdraw failed."));
    } finally {
      setPending(false);
    }
  }

  async function claimReward() {
    if (!signer) {
      setStatus?.("Please connect wallet first.");
      return;
    }

    try {
      setPending(true);

      const userAddress = await signer.getAddress();
      const stakingRewards = getStakingRewards(signer);
      const earned = await stakingRewards.earned(userAddress);

      if (earned <= 0n) {
        throw new Error("No reward available to claim.");
      }

      setStatus?.(`Claiming ${SYMBOLS.rewardToken} reward...`);
      const tx = await stakingRewards.claimReward();
      await tx.wait();

      setStatus?.("Claim reward successful.");
      await refresh?.();
    } catch (error) {
      console.error(error);
      setStatus?.(getErrorMessage(error, "Claim reward failed."));
    } finally {
      setPending(false);
    }
  }

  async function exit() {
    if (!signer) {
      setStatus?.("Please connect wallet first.");
      return;
    }

    try {
      setPending(true);

      const userAddress = await signer.getAddress();
      const stakingRewards = getStakingRewards(signer);

      const [stakedBalance, earned] = await Promise.all([
        stakingRewards.balanceOf(userAddress),
        stakingRewards.earned(userAddress),
      ]);

      if (stakedBalance <= 0n) {
        throw new Error("No staked LP token to exit.");
      }

      setStatus?.("Exiting farm...");

      const tx =
        earned > 0n
          ? await stakingRewards.exit()
          : await stakingRewards.withdraw(stakedBalance);

      await tx.wait();

      setStatus?.("Exit farm successful.");
      await refresh?.();
    } catch (error) {
      console.error(error);
      setStatus?.(getErrorMessage(error, "Exit farm failed."));
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