"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, X } from "lucide-react";
import { AUDIENCES, AUDIENCE_LABELS } from "@/lib/audience";

type SearchResult = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
};

export default function SecondaryNav() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => setResults(data.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  const trimmedQuery = query.trim();
  const showDropdown = open && trimmedQuery.length >= 2;

  return (
    <div className="border-b border-clay-100 bg-sand-50">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2.5">
        <nav className="flex shrink-0 items-center gap-5">
          {AUDIENCES.map((a) => (
            <Link
              key={a}
              href={`/shop?audience=${a.toLowerCase()}`}
              className="text-xs font-semibold uppercase tracking-wider text-clay-700 transition-colors hover:text-brand-600"
            >
              {AUDIENCE_LABELS[a]}
            </Link>
          ))}
        </nav>

        <div ref={containerRef} className="relative ml-auto w-full max-w-xs">
          <div className="flex items-center gap-2 rounded-full border border-clay-200 bg-white px-3 py-1.5 focus-within:border-brand-400">
            <Search size={15} className="shrink-0 text-clay-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && trimmedQuery) {
                  window.location.href = `/shop?search=${encodeURIComponent(trimmedQuery)}`;
                }
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Search products…"
              aria-label="Search products"
              className="w-full bg-transparent text-sm text-clay-800 placeholder:text-clay-400 focus:outline-none"
            />
            {loading && <Loader2 size={14} className="shrink-0 animate-spin text-clay-400" />}
            {!loading && query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                <X size={14} className="text-clay-400" />
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-sm border border-clay-100 bg-white shadow-lg">
              {loading ? (
                <p className="p-4 text-center text-sm text-clay-400">Searching…</p>
              ) : results.length === 0 ? (
                <p className="p-4 text-center text-sm text-clay-400">
                  No products found for &quot;{trimmedQuery}&quot;.
                </p>
              ) : (
                <>
                  {results.map((r) => (
                    <Link
                      key={r.id}
                      href={`/product/${r.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 border-b border-clay-50 p-3 last:border-0 hover:bg-sand-50"
                    >
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-clay-50">
                        {r.image && (
                          <Image src={r.image} alt={r.name} fill sizes="40px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-clay-800">{r.name}</p>
                        <p className="text-xs text-clay-400">
                          {r.category} · ₹{r.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/shop?search=${encodeURIComponent(trimmedQuery)}`}
                    onClick={() => setOpen(false)}
                    className="block p-3 text-center text-xs font-medium uppercase tracking-wider text-brand-600 hover:bg-sand-50"
                  >
                    View all results
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
