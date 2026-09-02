"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import * as React from "react";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "solid",
  size = "lg",
  className,
  full = true,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "solid" | "outline" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  full?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      className={`${full ? "w-full" : ""} ${className ?? ""}`}
    >
      {pending ? (pendingLabel ?? "Working…") : children}
    </Button>
  );
}
