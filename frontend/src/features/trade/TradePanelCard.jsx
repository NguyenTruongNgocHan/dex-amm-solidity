import { useMemo, useState } from "react";
import SurfaceCard from "../../components/common/SurfaceCard";

export default function TradePanelCard({ wallet, ammData, trade }) {
  const [amount, setAmount] = useState("100");

  const estimatedOut = useMemo(() => {
    const amountNum = Number(amount || "0");
    const price = Number(ammData?.priceAinB || "0");

    if (!amountNum || !price) return "0";

    const afterFee = amountNum * 0.997;
    return (afterFee * price).toFixed(4);
  }, [amount, ammData?.priceAinB]);

  async function handleSwap() {
    if (!wallet.address) {
      await wallet.connect();
      return;
    }

    await trade.swapTokenAForTokenB(amount, "0");
  }

  return (
    <SurfaceCard className="p-5">
      <div className="grid grid-cols-2 gap-3">
        <button className="rounded-xl bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white">
          Buy
        </button>
        <button className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-base font-semibold text-[var(--text)]">
          Sell
        </button>
      </div>

      <div className="mt-5">
        <h3 className="text-[16px] font-bold text-[var(--text)]">
          Trade TokenA → TokenB
        </h3>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
          Amount to Spend
        </label>

        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-[42px] font-extrabold leading-none text-[var(--text)] outline-none"
            />
            <div className="rounded-xl bg-[var(--surface-soft)] px-4 py-3 text-base font-bold text-[var(--text)]">
              TKA
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-teal-200 bg-teal-50 p-5 dark:border-teal-500/20 dark:bg-teal-500/10">
        <div className="text-sm text-[var(--muted)]">You will receive</div>
        <div className="mt-2 text-[40px] font-extrabold leading-none text-teal-600 dark:text-teal-300">
          {estimatedOut}
          <span className="block">TKB</span>
        </div>

        <InfoRow label="Pool price" value={`${ammData?.priceAinB ?? "0"} TKB`} />
        <InfoRow label="Trading fee (0.3%)" value="included" />
        <InfoRow label="Min received" value="0 TKB" tone="success" />
      </div>

      <button
        onClick={handleSwap}
        disabled={trade.pending}
        className="mt-6 w-full rounded-[18px] bg-[var(--primary)] px-5 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {trade.pending
          ? "Processing..."
          : wallet.address
          ? "Swap TokenA"
          : "Connect Wallet"}
      </button>
    </SurfaceCard>
  );
}

function InfoRow({ label, value, tone = "neutral" }) {
  const toneClass = {
    neutral: "text-[var(--text)]",
    warning: "text-amber-500",
    success: "text-emerald-500",
  }[tone];

  return (
    <div className="mt-3 flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}