import { AlertTriangle } from "lucide-react";

export default function RiskRuleExplainer() {
  return (
    <div className="rounded-2xl border border-amber-300/40 bg-amber-500/10 p-4 text-sm text-amber-600">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />

        <div>
          <div className="font-black">Rule-based detection, not accusation</div>
          <div className="mt-1 text-xs font-semibold leading-5">
            The monitor flags risky patterns for auditor review: large swaps,
            large liquidity withdrawals, failed attempts, and incomplete
            evidence. It does not automatically conclude fraud.
          </div>
        </div>
      </div>
    </div>
  );
}