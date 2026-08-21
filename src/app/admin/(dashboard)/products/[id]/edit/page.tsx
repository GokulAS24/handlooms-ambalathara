import { notFound } from "next/navigation";
import ProductForm from "../../ProductForm";
import {
  getProductById,
  updateProduct,
  addProductSpec,
  deleteProductSpec,
  getProductStyles,
} from "@/lib/actions/products.actions";
import { getCategories } from "@/lib/actions/categories.actions";
import ProductImageTile from "@/components/admin/ProductImageTile";
import AddProductImage from "@/components/admin/AddProductImage";
import SubmitButton from "@/components/SubmitButton";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, styles] = await Promise.all([
    getProductById(id),
    getCategories(),
    getProductStyles(),
  ]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-6 text-2xl font-semibold">Edit Product</h1>
        <ProductForm product={product} categories={categories} styles={styles} action={updateProduct.bind(null, id)} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Images</h2>
        <p className="mb-3 text-xs text-gray-500">
          Hover a photo and click the pencil to replace it in place, or the × to remove it. Adding a new photo
          saves immediately — no extra button to click.
        </p>
        <div className="flex flex-wrap gap-3">
          {product.images.map((img) => (
            <ProductImageTile
              key={img.id}
              productId={product.id}
              imageId={img.id}
              url={img.url}
              altText={img.altText}
            />
          ))}
          <AddProductImage productId={product.id} />
        </div>
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
