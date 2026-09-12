"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Asset {
  id: string;
  type: string;
  title: string;
  storage_path: string | null;
  meta: { mime?: string; size?: number; original_name?: string } | null;
  is_public: boolean;
  created_at: string;
  url: string | null;
}

/**
 * The signed-in user's uploaded files (Phase 4).
 *
 * Uploads go to a private Storage bucket under the user's own folder, and are
 * read back through short-lived signed URLs — so a file is not reachable just
 * because someone guessed its path.
 *
 * Drag-and-drop is offered on top of a real `<input type="file">` rather than
 * replacing it: the input is what keyboard and screen-reader users operate, and
 * what works if the drop handlers never run.
 */
export function AssetsPanel() {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/assets").catch(() => null);
    if (!res || !res.ok) {
      setAssets([]);
      return;
    }
    const data = await res.json();
    setAssets(data.assets ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      setBusy(true);
      setError(null);
      setNotice(null);

      let uploaded = 0;
      for (const file of list) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/assets", { method: "POST", body: form }).catch(
          () => null,
        );

        if (!res || !res.ok) {
          const detail = res ? ((await res.json().catch(() => null))?.message ?? "") : "";
          setError(`${file.name}: ${detail || "upload failed"}`);
          break;
        }
        uploaded++;
      }

      setBusy(false);
      if (uploaded > 0) {
        setNotice(`Uploaded ${uploaded} file${uploaded === 1 ? "" : "s"}.`);
        await load();
      }
    },
    [load],
  );

  async function remove(asset: Asset) {
    setError(null);
    const res = await fetch(`/api/assets?id=${encodeURIComponent(asset.id)}`, {
      method: "DELETE",
    }).catch(() => null);

    if (!res || !res.ok) {
      setError(`Could not delete ${asset.title}.`);
      return;
    }
    setAssets((current) => (current ?? []).filter((a) => a.id !== asset.id));
    setNotice(`Deleted ${asset.title}.`);
  }

  return (
    <section className="acct__card" aria-labelledby="acct-assets">
      <h2 className="acct__card-title" id="acct-assets">
        Files
      </h2>
      <p className="acct__card-lede">
        Images, tokens and archives, stored privately and served through
        expiring links. 10&nbsp;MB per file.
      </p>

      <div
        className={`assets__drop${dragging ? " is-dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
      >
        <label className="assets__label" htmlFor="assets-input">
          {busy ? "Uploading…" : "Drop files here, or choose them"}
        </label>
        <input
          id="assets-input"
          ref={inputRef}
          type="file"
          multiple
          className="assets__input"
          disabled={busy}
          onChange={(e) => {
            if (e.target.files) void upload(e.target.files);
            // Clear it so re-picking the same file still fires a change event.
            e.target.value = "";
          }}
        />
      </div>

      <div aria-live="polite" className="acct__messages">
        {error && (
          <p className="acct__msg acct__msg--error" role="alert">
            {error}
          </p>
        )}
        {notice && <p className="acct__msg acct__msg--notice">{notice}</p>}
      </div>

      {assets === null ? (
        <p className="acct__collection-empty">Loading…</p>
      ) : assets.length === 0 ? (
        <p className="acct__empty">No files yet.</p>
      ) : (
        <ul className="assets__list">
          {assets.map((asset) => (
            <li key={asset.id} className="assets__item">
              {asset.url && asset.meta?.mime?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.url}
                  alt=""
                  className="assets__thumb"
                  width={40}
                  height={40}
                />
              ) : (
                <span className="assets__thumb assets__thumb--file" aria-hidden="true">
                  {asset.type.charAt(0).toUpperCase()}
                </span>
              )}

              <span className="assets__meta">
                {asset.url ? (
                  <a href={asset.url} target="_blank" rel="noreferrer noopener">
                    {asset.title}
                  </a>
                ) : (
                  <span>{asset.title}</span>
                )}
                <span className="assets__sub">
                  {asset.type}
                  {asset.meta?.size ? ` · ${formatBytes(asset.meta.size)}` : ""}
                </span>
              </span>

              <button
                type="button"
                className="acct__x"
                onClick={() => remove(asset)}
                aria-label={`Delete ${asset.title}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
