import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "accent" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-bold tracking-wide transition disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-paper hover:-translate-y-0.5 hover:brightness-95",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  accent: "bg-accent hover:-translate-y-0.5 hover:brightness-105",
  ghost: "text-ink hover:bg-paper-deep",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-sm md:text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "solid",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  className,
  children,
  href,
  ...rest
}: CommonProps &
  Omit<React.ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
