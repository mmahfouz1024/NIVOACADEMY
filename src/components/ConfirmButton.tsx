"use client";

import { useRef } from "react";

/** Submit button that asks for confirmation first (works with server actions). */
export function ConfirmButton({
  children,
  message,
  className = "btn-danger btn-sm",
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
