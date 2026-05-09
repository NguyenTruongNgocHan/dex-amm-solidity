import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getAMM, getLPToken, getRewardToken, getStakingRewards } from "../lib/contracts";

export default function useStakingData(walletAddress, provider, refreshKey = 0) {
  const [data, setData] = useState({
    lpBalance: "0",
    stakedBalance: "0",
    earnedReward: "0",
    rewardBalance: "0",
    totalStaked: "0",
    lpTokenAddress: "",
    loading: false,
  });

  useEffect(() => {
    async function load() {
      if (!provider || !walletAddress) return;

      try {
        setData((prev) => ({ ...prev, loading: true }));

        const amm = getAMM(provider);
        const lpTokenAddress = await amm.lpToken();

        const lpToken = getLPToken(lpTokenAddress, provider);
        const rewardToken = getRewardToken(provider);
        const stakingRewards = getStakingRewards(provider);

        const [
          lpBalance,
          stakedBalance,
          earnedReward,
          rewardBalance,
          totalStaked,
        ] = await Promise.all([
          lpToken.balanceOf(walletAddress),
          stakingRewards.balanceOf(walletAddress),
          stakingRewards.earned(walletAddress),
          rewardToken.balanceOf(walletAddress),
          stakingRewards.totalSupply(),
        ]);

        setData({
          lpBalance: ethers.formatUnits(lpBalance, 18),
          stakedBalance: ethers.formatUnits(stakedBalance, 18),
          earnedReward: ethers.formatUnits(earnedReward, 18),
          rewardBalance: ethers.formatUnits(rewardBalance, 18),
          totalStaked: ethers.formatUnits(totalStaked, 18),
          lpTokenAddress,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to load staking data:", error);
        setData((prev) => ({ ...prev, loading: false }));
      }
    }

    load();
  }, [walletAddress, provider, refreshKey]);

  return data;
}