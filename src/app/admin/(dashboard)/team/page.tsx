import { getAdmins, createAdmin, deleteAdmin } from "@/lib/actions/admins.actions";
import { auth } from "@/auth";
import SubmitButton from "@/components/SubmitButton";

export default async function AdminTeamPage() {
  const [admins, session] = await Promise.all([getAdmins(), auth()]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Admin Team</h1>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id} className="border-b">
              <td className="py-2">{a.name}</td>
              <td>{a.email}</td>
              <td>{new Date(a.createdAt).toLocaleDateString()}</td>
              <td>
                {session?.user.id !== a.id && (
                  <form action={deleteAdmin.bind(null, a.id)}>
                    <SubmitButton pendingLabel="Deleting…" className="text-red-600 disabled:opacity-60">
                      Delete
                    </SubmitButton>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Add Admin</h2>
        <form action={createAdmin} className="flex max-w-md flex-col gap-3">
          <input name="name" placeholder="Name" required className="border p-2" />
          <input name="email" type="email" placeholder="Email" required className="border p-2" />
          <input name="password" type="password" placeholder="Password (min 8 chars)" required minLength={8} className="border p-2" />
          <SubmitButton pendingLabel="Creating…" className="bg-black py-2 text-white disabled:opacity-60">
            Create Admin
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
