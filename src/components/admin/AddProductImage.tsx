"use client";

import { useRef, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import { addProductImage } from "@/lib/actions/products.actions";

export default function AddProductImage({ productId }: { productId: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const addData = new FormData();
      addData.append("url", data.url);
      await addProductImage(productId, addData);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add image failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500">
        {uploading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <>
            <UploadCloud size={20} />
            <span className="text-[10px]">Add image</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />
      </label>
      {error && <p className="max-w-24 text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
