import ProductForm from "../ProductForm";
import { createProduct, getProductStyles } from "@/lib/actions/products.actions";
import { getCategories } from "@/lib/actions/categories.actions";

export default async function NewProductPage() {
  const [categories, styles] = await Promise.all([getCategories(), getProductStyles()]);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Product</h1>
      <ProductForm categories={categories} styles={styles} action={createProduct} />
    </div>
  );
}
