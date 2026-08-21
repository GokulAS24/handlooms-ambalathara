"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export default function SubmitButton({
  children,
  pendingLabel,
  className,
  formAction,
  ariaLabel,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  formAction?: (formData: FormData) => void;
  ariaLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      className={className}
      aria-busy={pending}
      aria-label={ariaLabel}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 size={15} className="animate-spin" />
          {pendingLabel ?? "Submitting…"}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
