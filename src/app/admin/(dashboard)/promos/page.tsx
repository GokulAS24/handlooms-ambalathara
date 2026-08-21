import Link from "next/link";
import { getPromoBlocks, deletePromoBlock } from "@/lib/actions/promos.actions";
import SubmitButton from "@/components/SubmitButton";

export default async function AdminPromosPage() {
  const promos = await getPromoBlocks();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Promo Blocks</h1>
        <Link href="/admin/promos/new" className="bg-black px-4 py-2 text-sm text-white">New Promo</Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Title</th>
            <th>Link</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {promos.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.title}</td>
              <td>{p.linkHref}</td>
              <td>{p.isActive ? "Yes" : "No"}</td>
              <td className="flex gap-3 py-2">
                <Link href={`/admin/promos/${p.id}/edit`} className="underline">Edit</Link>
                <form action={deletePromoBlock.bind(null, p.id)}>
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
