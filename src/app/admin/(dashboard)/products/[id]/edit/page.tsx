import { notFound } from "next/navigation";
import ProductForm from "../../ProductForm";
import {
  getProductById,
  updateProduct,
  addProductImage,
  deleteProductImage,
  addProductSpec,
  deleteProductSpec,
} from "@/lib/actions/products.actions";
import { getCategories } from "@/lib/actions/categories.actions";
import ImageUpload from "@/components/admin/ImageUpload";
import SubmitButton from "@/components/SubmitButton";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-6 text-2xl font-semibold">Edit Product</h1>
        <ProductForm product={product} categories={categories} action={updateProduct.bind(null, id)} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Images</h2>
        <div className="mb-4 flex flex-wrap gap-3">
          {product.images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <div key={img.id} className="relative h-24 w-24 overflow-hidden rounded border">
              <img src={img.url} alt={img.altText ?? ""} className="h-full w-full object-cover" />
              <form action={deleteProductImage.bind(null, product.id, img.id)}>
                <SubmitButton
                  pendingLabel=""
                  ariaLabel="Delete image"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white disabled:opacity-60"
                >
                  ×
                </SubmitButton>
              </form>
            </div>
          ))}
        </div>
        <form action={addProductImage.bind(null, product.id)} className="flex items-end gap-3">
          <ImageUpload name="url" />
          <SubmitButton pendingLabel="Adding…" className="border px-3 py-2 disabled:opacity-60">
            Add Image
          </SubmitButton>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Specs</h2>
        <ul className="mb-3 flex flex-col gap-2">
          {product.specs.map((spec) => (
            <li key={spec.id} className="flex items-center gap-3 text-sm">
              {spec.label}: {spec.value}
              <form action={deleteProductSpec.bind(null, product.id, spec.id)}>
                <SubmitButton pendingLabel="Deleting…" className="text-red-600 disabled:opacity-60">
                  Delete
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
        <form action={addProductSpec.bind(null, product.id)} className="flex gap-2">
          <input name="label" placeholder="Label" required className="border p-2" />
          <input name="value" placeholder="Value" required className="border p-2" />
          <SubmitButton pendingLabel="Adding…" className="border px-3 disabled:opacity-60">
            Add Spec
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
