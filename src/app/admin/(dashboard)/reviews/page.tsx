import { getReviews, deleteReview } from "@/lib/actions/reviews.actions";
import SubmitButton from "@/components/SubmitButton";

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Reviews</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Product</th>
            <th>Author</th>
            <th>Rating</th>
            <th>Comment</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className="border-b align-top">
              <td className="py-2">{r.product.name}</td>
              <td>{r.author}</td>
              <td>{r.rating}★</td>
              <td className="max-w-sm">{r.comment}</td>
              <td>
                <form action={deleteReview.bind(null, r.id, r.productId)}>
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
