import { useMemo, useState } from "react";
import SurfaceCard from "../../components/common/SurfaceCard";
import TokenAmountInput from "../../components/common/TokenAmountInput";
import Button from "../../components/common/Button";
import { SYMBOLS } from "../../config/contracts";
import { quoteLiquidity } from "../../lib/liquidityMath";

export default function AddLiquidityCard({
  ammData,
  liquidity,
  connected,
  onConnect,
  disabled = false,
  lpPolicy,
}) {
  const [amountA, setAmountA] = useState("100");
  const [amountB, setAmountB] = useState("100");

  const quote = useMemo(() => {
    return quoteLiquidity({
      amountA,
      amountB,
      reserveARaw: ammData.reserveARaw,
      reserveBRaw: ammData.reserveBRaw,
      totalLiquidityRaw: ammData.totalLiquidityRaw,
    });
  }, [
    amountA,
    amountB,
    ammData.reserveARaw,
    ammData.reserveBRaw,
    ammData.totalLiquidityRaw,
  ]);

  async function handleAddLiquidity() {
    if (!connected) {
      await onConnect?.();
      return;
    }

    if (disabled) return;

    await liquidity.addLiquidity(amountA, amountB, quote.minLiquidity);
  }

  return (
    <SurfaceCard className="p-5">
      <div className="mb-5">
        <h2 className="text-lg font-black text-[var(--text)]">
          Add Liquidity
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Provide both assets to receive LP tokens. In production policy mode,
          adding liquidity can require verified LP approval.
        </p>
      </div>

      {disabled ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          Adding liquidity is restricted by the current DEX policy. Your wallet
          status is <b>{lpPolicy?.participantLabel}</b>. Submit LP evidence and
          wait for admin approval before providing liquidity.
        </div>
      ) : null}

      <div className="grid gap-4">
        <TokenAmountInput
          label={`Amount ${SYMBOLS.tokenA}`}
          value={amountA}
          onChange={setAmountA}
          symbol={SYMBOLS.tokenA}
        />

        <TokenAmountInput
          label={`Amount ${SYMBOLS.tokenB}`}
          value={amountB}
          onChange={setAmountB}
          symbol={SYMBOLS.tokenB}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-[var(--muted)]">Estimated LP minted</span>
          <span className="font-bold text-[var(--text)]">
            {quote.liquidityLabel} ALP
          </span>
        </div>
      </div>

      <Button
        className="mt-5 w-full"
        size="lg"
        disabled={liquidity.pending || disabled}
        onClick={handleAddLiquidity}
      >
        {!connected
          ? "Connect Wallet"
          : disabled
          ? "Verified LP Required"
          : liquidity.pending
          ? "Processing..."
          : "Add Liquidity"}
      </Button>
    </SurfaceCard>
  );
}