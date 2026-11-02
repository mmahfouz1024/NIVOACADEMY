"use client";

import { useActionState } from "react";
import { initialState, type FormState } from "@/lib/form-state";
import { FormMessage } from "./FormMessage";

/** Wraps a server action with pending/error/success handling. */
export function ActionForm({
  action,
  children,
  className = "space-y-4",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  return (
    <form action={formAction} className={className}>
      <FormMessage state={state} />
      {children}
    </form>
  );
}
