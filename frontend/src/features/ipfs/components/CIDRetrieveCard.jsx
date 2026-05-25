import { Search } from "lucide-react";
import Button from "../../../components/common/Button";

export default function CIDRetrieveCard({ cid, setCid, onRetrieve }) {
  return (
    <section className="dex-panel p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--blue-soft)] text-[var(--blue)]">
          <Search size={18} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-[var(--text)]">Retrieve by CID</h3>
            <span className="dex-chip">Lookup</span>
          </div>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Paste an IPFS or local CID to retrieve the original JSON document.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={cid}
          onChange={(event) => setCid(event.target.value)}
          className="input-shell px-4 py-3 text-sm font-bold text-[var(--text)] outline-none"
          placeholder="Paste CID here"
        />

        <Button onClick={onRetrieve}>
          <Search size={16} />
          Retrieve
        </Button>
      </div>
    </section>
  );
}