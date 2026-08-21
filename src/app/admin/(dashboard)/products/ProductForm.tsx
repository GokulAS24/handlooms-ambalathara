"use client";

import { Category, Product } from "@prisma/client";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import SubmitButton from "@/components/SubmitButton";
import { AUDIENCES, AUDIENCE_LABELS } from "@/lib/audience";

export default function ProductForm({
  product,
  categories,
  styles,
  action,
}: {
  product?: Product;
  categories: Category[];
  styles: string[];
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="flex max-w-2xl flex-col gap-3">
      <label className="text-sm">Name</label>
      <input name="name" defaultValue={product?.name} required className="border p-2" />

      <label className="text-sm">Description</label>
      <textarea name="description" defaultValue={product?.description} required className="border p-2" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Price (₹)</label>
          <input name="price" type="number" step="0.01" defaultValue={product?.price} required className="w-full border p-2" />
        </div>
        <div>
          <label className="text-sm">Compare-at Price (₹)</label>
          <input name="compareAtPrice" type="number" step="0.01" defaultValue={product?.compareAtPrice ?? ""} className="w-full border p-2" />
        </div>
      </div>

      <label className="text-sm">Stock</label>
      <input name="stock" type="number" defaultValue={product?.stock ?? 0} required className="border p-2" />

      <label className="text-sm">Category</label>
      <select name="categoryId" defaultValue={product?.categoryId} required className="border p-2">
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label className="text-sm">Audience</label>
      <select name="audience" defaultValue={product?.audience ?? ""} className="border p-2">
        <option value="">Not set</option>
        {AUDIENCES.map((a) => (
          <option key={a} value={a}>{AUDIENCE_LABELS[a]}</option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        Controls which of the Men / Women / Kids links on the site show this product.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Style</label>
          <input
            name="style"
            list="product-styles"
            defaultValue={product?.style ?? ""}
            placeholder="e.g. Mayura Setsaree"
            className="w-full border p-2"
          />
          <datalist id="product-styles">
            {styles.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="text-sm">Color</label>
          <input
            name="color"
            defaultValue={product?.color ?? ""}
            placeholder="e.g. Crimson"
            className="w-full border p-2"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-gray-500">
        Products that share the exact same Style are grouped as color variants on the product page. Reuse an
        existing style from the list to group this with it.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Weave Type</label>
          <input name="weaveType" defaultValue={product?.weaveType ?? ""} className="w-full border p-2" />
        </div>
        <div>
          <label className="text-sm">Fabric</label>
          <input name="fabric" defaultValue={product?.fabric ?? ""} className="w-full border p-2" />
        </div>
        <div>
          <label className="text-sm">Pattern</label>
          <input name="pattern" defaultValue={product?.pattern ?? ""} className="w-full border p-2" />
        </div>
        <div>
          <label className="text-sm">Wash Care</label>
          <input name="washCare" defaultValue={product?.washCare ?? ""} className="w-full border p-2" />
        </div>
      </div>

      {!product && <MultiImageUpload name="imageUrls" label="Product Images" />}

      <label className="flex items-center gap-2 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} />
        Active
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured ?? false} />
        Featured
      </label>

      <SubmitButton pendingLabel="Saving…" className="mt-2 bg-black py-2 text-white disabled:opacity-60">
        Save Product
      </SubmitButton>
    </form>
  );
}
