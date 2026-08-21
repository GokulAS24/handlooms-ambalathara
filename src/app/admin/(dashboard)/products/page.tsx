import Link from "next/link";
import { getProducts, deleteProduct } from "@/lib/actions/products.actions";
import BulkImportForm from "@/components/admin/BulkImportForm";
import SubmitButton from "@/components/SubmitButton";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="bg-black px-4 py-2 text-sm text-white">New Product</Link>
      </div>

      <BulkImportForm />

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.name}</td>
              <td>{p.category.name}</td>
              <td>₹{p.price.toLocaleString("en-IN")}</td>
              <td>{p.stock}</td>
              <td>{p.isActive ? "Yes" : "No"}</td>
              <td className="flex gap-3 py-2">
                <Link href={`/admin/products/${p.id}/edit`} className="underline">Edit</Link>
                <form action={deleteProduct.bind(null, p.id)}>
                  <SubmitButton pendingLabel="Deleting…" className="text-red-600 disabled:opacity-60">
                    Delete
                  </SubmitButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
