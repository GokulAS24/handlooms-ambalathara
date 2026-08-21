"use client";

import { Category, HeroBanner } from "@prisma/client";
import ImageUpload from "@/components/admin/ImageUpload";
import SubmitButton from "@/components/SubmitButton";

export default function BannerForm({
  banner,
  categories,
  action,
}: {
  banner?: HeroBanner & { category?: Category | null };
  categories: Category[];
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-3">
      <p className="text-sm text-gray-600">
        Each promo card is just an image — bake any headline, price, or call-to-action text
        directly into the image itself, the way a Flipkart-style deal banner works. Recommended
        size: a compact wide image, roughly 700×300px.
      </p>

      <div className="flex flex-wrap gap-6">
        <ImageUpload
          name="desktopImageUrl"
          defaultValue={banner?.desktopImageUrl}
          label="Desktop Image (required)"
        />
        <ImageUpload
          name="mobileImageUrl"
          defaultValue={banner?.mobileImageUrl ?? undefined}
          label="Mobile Image (optional — falls back to desktop)"
        />
      </div>

      <label className="text-sm">Links to Category</label>
      <select name="categoryId" defaultValue={banner?.categoryId ?? ""} className="border p-2">
        <option value="">None — no link</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        Clicking the card takes shoppers to this category&apos;s shop page. Leave as &quot;None&quot;
        for a purely decorative card.
      </p>

      <label className="text-sm">Order</label>
      <input name="order" type="number" defaultValue={banner?.order ?? 0} className="border p-2" />

      <label className="flex items-center gap-2 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={banner?.isActive ?? true} />
        Active
      </label>

      <SubmitButton pendingLabel="Saving…" className="mt-2 bg-black py-2 text-white disabled:opacity-60">
        Save Promo Card
      </SubmitButton>
    </form>
  );
}
