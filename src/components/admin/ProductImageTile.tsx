"use client";

import { useRef, useState, ChangeEvent } from "react";
import { Loader2, Pencil } from "lucide-react";
import { replaceProductImage, deleteProductImage } from "@/lib/actions/products.actions";

export default function ProductImageTile({
  productId,
  imageId,
  url,
  altText,
}: {
  productId: string;
  imageId: string;
  url: string;
  altText?: string | null;
}) {
  const [preview, setPreview] = useState(url);
  const [replacing, setReplacing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const previousPreview = preview;
    setPreview(URL.createObjectURL(file));
    setReplacing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      await replaceProductImage(productId, imageId, data.url);
      setPreview(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Replace failed");
      setPreview(previousPreview);
    } finally {
      setReplacing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteProductImage(productId, imageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  const busy = replacing || deleting;

  return (
    <div className="flex flex-col gap-1">
      <div className="group relative h-24 w-24 overflow-hidden rounded border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt={altText ?? ""} className="h-full w-full object-cover" />

        <button
          type="button"
          aria-label="Replace image"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white disabled:cursor-not-allowed"
        >
          {replacing ? <Loader2 size={18} className="animate-spin text-white" /> : <Pencil size={16} />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={handleFileChange}
        />

        <button
          type="button"
          aria-label="Delete image"
          disabled={busy}
          onClick={handleDelete}
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white disabled:opacity-60"
        >
          {deleting ? <Loader2 size={11} className="animate-spin" /> : "×"}
        </button>
      </div>
      {error && <p className="max-w-24 text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
