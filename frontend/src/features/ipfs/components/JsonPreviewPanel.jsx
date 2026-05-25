import { Copy, Download, ExternalLink } from "lucide-react";
import Button from "../../../components/common/Button";
import { copyText, downloadJson } from "../utils/downloadJson";

export default function JsonPreviewPanel({ lastUpload, retrievedJson }) {
  return (
    <>
      {lastUpload ? (
        <section className="mt-5 rounded-3xl border border-[var(--primary-border)] bg-[var(--primary-soft)] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="dex-chip">Last Upload</div>
              <p className="mt-3 text-lg font-black text-[var(--text)]">
                {lastUpload.type}
              </p>
              <p className="mt-1 break-all text-sm text-[var(--muted)]">
                CID: {lastUpload.cid}
              </p>
              <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                Mode: {lastUpload.mode}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => copyText(lastUpload.cid)}>
                <Copy size={15} />
                Copy CID
              </Button>

              <Button
                variant="ghost"
                onClick={() =>
                  downloadJson(
                    lastUpload.content,
                    `${lastUpload.type.toLowerCase().replaceAll(" ", "-")}.json`
                  )
                }
              >
                <Download size={15} />
                Download JSON
              </Button>

              {lastUpload.url ? (
                <a
                  href={lastUpload.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm font-black text-[var(--text)] transition hover:-translate-y-0.5"
                >
                  <ExternalLink size={15} />
                  Open Gateway
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {retrievedJson ? (
        <section className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-[var(--text)]">
              Retrieved JSON
            </h3>

            <Button
              variant="ghost"
              onClick={() =>
                downloadJson(retrievedJson, "retrieved-ipfs-json.json")
              }
            >
              <Download size={15} />
              Download
            </Button>
          </div>

          <pre className="scroll-panel max-h-[360px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {JSON.stringify(retrievedJson, null, 2)}
          </pre>
        </section>
      ) : null}
    </>
  );
}