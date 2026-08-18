"use client";

import { useState, ChangeEvent } from "react";
import { Loader2 } from "lucide-react";

type RowResult =
  | { row: number; name: string; status: "created" }
  | { row: number; name: string; status: "updated" }
  | { row: number; name: string; status: "error"; message: string };

export default function BulkImportForm() {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<RowResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/products-import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  const created = results?.filter((r) => r.status === "created").length ?? 0;
  const updated = results?.filter((r) => r.status === "updated").length ?? 0;
  const errors = results?.filter((r) => r.status === "error") ?? [];

  return (
    <div className="mb-6 flex flex-col gap-3 border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <a href="/api/admin/products-export" className="border px-3 py-2 text-sm">
          Download Excel Template
        </a>

        <label className="flex cursor-pointer items-center gap-2 border px-3 py-2 text-sm">
          {importing && <Loader2 size={14} className="animate-spin" />}
          {importing ? "Importing…" : "Import Excel Sheet"}
          <input type="file" accept=".xlsx" className="hidden" disabled={importing} onChange={handleFileChange} />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {results && (
        <div className="text-sm">
          <p className="font-medium">
            {created} created, {updated} updated{errors.length > 0 ? `, ${errors.length} failed` : ""}
          </p>
          {errors.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 text-red-600">
              {errors.map((e) => (
                <li key={e.row}>
                  Row {e.row} ({e.name || "unnamed"}): {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
