"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { AUDIENCES, AUDIENCE_LABELS, isAudience } from "@/lib/audience";
import type { Prisma } from "@prisma/client";

type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

const PRICE_BUCKETS = [
  { label: "Under ₹1,000", test: (price: number) => price < 1000 },
  { label: "₹1,000 – ₹2,500", test: (price: number) => price >= 1000 && price < 2500 },
  { label: "₹2,500 – ₹4,000", test: (price: number) => price >= 2500 && price < 4000 },
  { label: "Above ₹4,000", test: (price: number) => price >= 4000 },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
];

const gridVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { label: string; value?: string; count: number }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="border-b border-clay-100 py-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-clay-800">{title}</h3>
      <div className="mt-3 flex flex-col gap-2.5">
        {options.map((opt) => {
          const value = opt.value ?? opt.label;
          return (
            <label key={value} className="flex cursor-pointer items-center justify-between text-sm text-clay-600">
              <span className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selected.has(value)}
                  onChange={() => onToggle(value)}
                  className="h-4 w-4 rounded-sm border-clay-300 text-clay-800 accent-clay-800"
                />
                {opt.label}
              </span>
              <span className="text-xs text-clay-400">{opt.count}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function ShopContent({
  products,
  categories,
  whatsappNumber,
}: {
  products: ProductCardData[];
  categories: CategoryWithCount[];
  whatsappNumber: string;
}) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialCategoryName = initialCategory
    ? categories.find((c) => c.slug === initialCategory)?.name
    : undefined;
  const initialAudience = searchParams.get("audience")?.toUpperCase();
  const initialSearch = searchParams.get("search") ?? "";

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(initialCategoryName ? [initialCategoryName] : [])
  );
  const [selectedAudiences, setSelectedAudiences] = useState<Set<string>>(
    () => new Set(isAudience(initialAudience) ? [initialAudience] : [])
  );
  const [weaves, setWeaves] = useState<Set<string>>(new Set());
  const [priceBuckets, setPriceBuckets] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Re-sync from the URL on every navigation, not just the first mount —
  // clicking Men -> Women while already on /shop updates the query string
  // but Next.js reuses this component instance, so without this the state
  // set from the *first* render's searchParams would never change again.
  const searchParamsKey = searchParams.toString();
  useEffect(() => {
    const categorySlug = searchParams.get("category");
    const categoryName = categorySlug ? categories.find((c) => c.slug === categorySlug)?.name : undefined;
    setSelectedCategories(new Set(categoryName ? [categoryName] : []));

    const audience = searchParams.get("audience")?.toUpperCase();
    setSelectedAudiences(new Set(isAudience(audience) ? [audience] : []));

    setSearchQuery(searchParams.get("search") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsKey]);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, count: c._count.products })),
    [categories]
  );

  const audienceOptions = useMemo(
    () =>
      AUDIENCES.map((a) => ({
        label: AUDIENCE_LABELS[a],
        value: a,
        count: products.filter((p) => p.audience === a).length,
      })).filter((opt) => opt.count > 0),
    [products]
  );

  const weaveOptions = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      if (p.weaveType) counts.set(p.weaveType, (counts.get(p.weaveType) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
  }, [products]);

  const priceOptions = useMemo(
    () => PRICE_BUCKETS.map((bucket) => ({ label: bucket.label, count: products.filter((p) => bucket.test(p.price)).length })),
    [products]
  );

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, value: string) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  const filtered = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    let list = products.filter((p) => {
      const categoryMatch = selectedCategories.size === 0 || selectedCategories.has(p.category.name);
      const audienceMatch = selectedAudiences.size === 0 || (p.audience && selectedAudiences.has(p.audience));
      const weaveMatch = weaves.size === 0 || (p.weaveType && weaves.has(p.weaveType));
      const priceMatch = priceBuckets.size === 0 || PRICE_BUCKETS.some((b) => priceBuckets.has(b.label) && b.test(p.price));
      const searchMatch =
        !search ||
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search);
      return categoryMatch && audienceMatch && weaveMatch && priceMatch && searchMatch;
    });

    list = [...list];
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating-desc") list.sort((a, b) => b.avgRating - a.avgRating);

    return list;
  }, [products, selectedCategories, selectedAudiences, weaves, priceBuckets, searchQuery, sortBy]);

  const activeFilterCount = selectedCategories.size + selectedAudiences.size + weaves.size + priceBuckets.size;

  const activeAudienceLabel =
    selectedAudiences.size === 1 ? AUDIENCE_LABELS[[...selectedAudiences][0] as (typeof AUDIENCES)[number]] : null;

  function clearAll() {
    setSelectedCategories(new Set());
    setSelectedAudiences(new Set());
    setWeaves(new Set());
    setPriceBuckets(new Set());
    setSearchQuery("");
  }

  const enquiryHref = useMemo(() => {
    const [onlyCategory] = selectedCategories;
    const message = searchQuery.trim()
      ? `Hi! I searched for "${searchQuery.trim()}" on your website but couldn't find anything — do you have this available or expected soon?`
      : selectedCategories.size === 1
        ? `Hi! I'm looking for items in the "${onlyCategory}" collection but couldn't find any in stock on your website — do you have any available or expected soon?`
        : "Hi! I couldn't find any products matching what I'm looking for on your website — could you help me find something?";
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [selectedCategories, searchQuery, whatsappNumber]);

  const filtersPanel = (
    <>
      <FilterGroup title="Category" options={categoryOptions} selected={selectedCategories} onToggle={(v) => toggle(selectedCategories, setSelectedCategories, v)} />
      <FilterGroup title="Audience" options={audienceOptions} selected={selectedAudiences} onToggle={(v) => toggle(selectedAudiences, setSelectedAudiences, v)} />
      <FilterGroup title="Weave Type" options={weaveOptions} selected={weaves} onToggle={(v) => toggle(weaves, setWeaves, v)} />
      <FilterGroup title="Price" options={priceOptions} selected={priceBuckets} onToggle={(v) => toggle(priceBuckets, setPriceBuckets, v)} />
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brand-500">
          {searchQuery.trim() ? "Search Results" : activeAudienceLabel ? `${activeAudienceLabel}'s Collection` : "Shop All"}
        </p>
        <h1 className="mt-2 font-serif text-3xl text-clay-800 md:text-4xl">
          {searchQuery.trim()
            ? `“${searchQuery.trim()}”`
            : activeAudienceLabel
              ? `The Full Collection — ${activeAudienceLabel}`
              : "The Full Collection"}
        </h1>
        {searchQuery.trim() && (
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 text-xs font-medium uppercase tracking-wider text-brand-600 hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-clay-800">Filters</h2>
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="text-xs font-medium text-brand-600 hover:underline">Clear all</button>
            )}
          </div>
          {filtersPanel}
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between border-b border-clay-100 pb-4">
            <button onClick={() => setMobileFiltersOpen((v) => !v)} className="flex items-center gap-1.5 text-sm font-medium text-clay-700 lg:hidden">
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] text-sand-50">{activeFilterCount}</span>
              )}
            </button>

            <p className="text-sm text-clay-400">{filtered.length} {filtered.length === 1 ? "item" : "items"}</p>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-sm border border-clay-200 bg-sand-50 px-3 py-1.5 text-sm text-clay-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {mobileFiltersOpen && (
            <div className="mb-6 rounded-sm border border-clay-100 px-4 lg:hidden">
              <div className="flex items-center justify-between pt-4">
                <h2 className="text-sm font-semibold text-clay-800">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                  <X size={16} className="text-clay-500" />
                </button>
              </div>
              {filtersPanel}
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="mb-4 text-xs font-medium text-brand-600 hover:underline">Clear all</button>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="text-clay-500">No products match these filters.</p>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="text-sm font-medium text-brand-600 hover:underline">Clear filters</button>
              )}
              <a
                href={enquiryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 rounded-sm bg-[#25D366] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-sand-50 transition-colors hover:bg-[#1fb959]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Ask About Availability
              </a>
            </div>
          ) : (
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3"
            >
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
