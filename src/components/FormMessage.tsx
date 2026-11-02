import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { FormState } from "@/lib/form-state";

export function FormMessage({ state }: { state: FormState }) {
  if (state.error)
    return (
      <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        {state.error}
      </div>
    );
  if (state.ok && state.message)
    return (
      <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        {state.message}
      </div>
    );
  return null;
}
