import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
    <SurfaceCard
      variant="action"
      fill
      className="flex min-h-[650px] flex-1 flex-col p-5"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="dex-chip dex-chip-success">Mint LP</div>

          <h2 className="mt-3 text-2xl font-black text-[var(--text)]">
            Add Liquidity
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Deposit both pool assets and receive {SYMBOLS.lpToken} ownership
            tokens.
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)]">
          <Plus size={22} />
        </div>
      </div>

      {disabled ? (
        <div className="mb-5 rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--warning)]">
          Verified LP required. Current wallet:{" "}
          <b>{lpPolicy?.participantLabel || "Public Trader"}</b>.
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

      <div className="mt-5 rounded-[22px] border border-[var(--success-border)] bg-[var(--success-soft)] p-5">
        <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
          Estimated LP Minted
        </p>

        <p className="mt-2 text-3xl font-black market-up">
          {quote.liquidityLabel}
          <span className="ml-2 text-base">{SYMBOLS.lpToken}</span>
        </p>
      </div>

      <div className="mt-4 surface-card-soft p-4 text-xs leading-5 text-[var(--muted)]">
        LP minting follows the current pool ratio. If production policy is
        enabled, only approved liquidity providers can add liquidity.
      </div>

      <Button
        className="mt-auto w-full"
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