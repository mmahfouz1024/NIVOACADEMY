import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  size = 44,
  withText = true,
  light = false,
  className,
}: {
  size?: number;
  withText?: boolean;
  light?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)} aria-label="نيفو للتدريب">
      <Image
        src="/logo.png"
        alt="شعار نيفو للتدريب"
        width={size}
        height={size}
        priority
        className="rounded-full"
        style={{ width: size, height: size }}
      />
      {withText && (
        <span className="leading-tight">
          <span className={cn("block text-lg font-black", light ? "text-white" : "text-navy-900")}>نيفو</span>
          <span className={cn("block text-[11px] font-bold tracking-[.2em]", light ? "text-gold-300" : "text-gold-600")}>
            FOR TRAINING
          </span>
        </span>
      )}
    </Link>
  );
}
