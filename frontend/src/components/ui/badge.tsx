import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "accent" | "default" | "success";

const variantClass: Record<BadgeVariant, string> = {
  accent: "bg-accent-soft text-accent",
  default: "bg-surface-alt text-text-secondary",
  success: "bg-success/15 text-success",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold",
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}
