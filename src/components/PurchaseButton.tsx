"use client";

import { useActionState } from "react";
import { purchaseAction } from "@/app/actions/student";
import { initialState } from "@/lib/form-state";
import { SubmitButton } from "./SubmitButton";
import { FormMessage } from "./FormMessage";

export function PurchaseButton({ courseId, price }: { courseId: string; price: number }) {
  const [state, action] = useActionState(purchaseAction, initialState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="courseId" value={courseId} />
      <FormMessage state={state} />
      <SubmitButton className="btn-gold btn-lg w-full" pendingText="جارٍ الشراء...">
        {price > 0 ? "اشترِ الآن من محفظتي" : "ابدأ الكورس مجانًا"}
      </SubmitButton>
    </form>
  );
}
