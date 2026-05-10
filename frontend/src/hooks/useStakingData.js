import { useEffect, useState } from "react";
import {
  getAMM,
  getLPToken,
  getRewardToken,
  getStakingRewards,
} from "../lib/contracts";
import { formatToken } from "../lib/format";

const emptyData = {
  lpBalance: "0",
  stakedBalance: "0",
  earnedReward: "0",
  rewardBalance: "0",
  totalStaked: "0",
  lpTokenAddress: "",
  loading: false,
};

export default function useStakingData(walletAddress, provider, refreshKey = 0) {
  const [data, setData] = useState(emptyData);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!provider || !walletAddress) {
        setData(emptyData);
        return;
      }

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

        if (!mounted) return;

        setData({
          lpBalance: formatToken(lpBalance, 18, 4),
          stakedBalance: formatToken(stakedBalance, 18, 4),
          earnedReward: formatToken(earnedReward, 18, 6),
          rewardBalance: formatToken(rewardBalance, 18, 4),
          totalStaked: formatToken(totalStaked, 18, 4),
          lpTokenAddress,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to load staking data:", error);

        if (!mounted) return;

        setData((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [walletAddress, provider, refreshKey]);

  return data;
}