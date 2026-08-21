"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import SubmitButton from "@/components/SubmitButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    if (res?.error) setError("Invalid email or password");
    else router.push("/admin");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-6 text-2xl font-semibold">Admin Login</h1>
      <form action={handleSubmit} className="flex flex-col gap-4">
        <input name="email" type="email" placeholder="Email" required className="border p-2" defaultValue="admin@ambalatharahandlooms.in" />
        <input name="password" type="password" placeholder="Password" required className="border p-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <SubmitButton pendingLabel="Signing in…" className="bg-black py-2 text-white disabled:opacity-60">
          Sign In
        </SubmitButton>
      </form>
    </div>
  );
}
