import { Coins } from "lucide-react";
import PageHero from "../../components/common/PageHero";
import { SYMBOLS } from "../../config/contracts";

export default function FarmHeader({ stakingData }) {
  return (
    <PageHero
      badge="Yield Farming"
      icon={<Coins size={14} />}
      title="Stake LP tokens and"
      highlight={`earn ${SYMBOLS.rewardToken} rewards`}
      description={`Deposit your ${SYMBOLS.lpToken} liquidity provider tokens into the farming contract to earn ${SYMBOLS.rewardToken} rewards over time.`}
      stats={[
        {
          label: `Available ${SYMBOLS.lpToken}`,
          value: `${stakingData.lpBalance} ${SYMBOLS.lpToken}`,
        },
        {
          label: `Staked ${SYMBOLS.lpToken}`,
          value: `${stakingData.stakedBalance} ${SYMBOLS.lpToken}`,
        },
        {
          label: `Pending ${SYMBOLS.rewardToken}`,
          value: `${stakingData.earnedReward} ${SYMBOLS.rewardToken}`,
        },
      ]}
    />
  );
}