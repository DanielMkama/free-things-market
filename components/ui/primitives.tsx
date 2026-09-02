import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("u-eyebrow text-muted", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="u-headline">{title}</h2>
      {children ? (
        <div className="max-w-2xl u-lead text-muted">{children}</div>
      ) : null}
    </div>
  );
}

export function Stat({
  value,
  label,
  accent = false,
}: {
  value: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "border border-line p-5",
        accent ? "bg-accent" : "bg-white/40",
      )}
    >
      <div className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.8]">
        {value}
      </div>
      <div className="mt-3 text-xs font-bold tracking-widest text-muted">
        {label}
      </div>
    </div>
  );
}

export function Avatar({
  name,
  color,
  url,
  size = 40,
  className,
}: {
  name: string;
  color: string;
  url?: string | null;
  size?: number;
  className?: string;
}) {
  const shared = cn(
    "inline-flex shrink-0 items-center justify-center overflow-hidden border border-ink font-display leading-none",
    className,
  );

  if (url) {
    return (
      <img
        src={url}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={cn(shared, "object-cover")}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={shared}
      style={{
        background: color,
        width: size,
        height: size,
        fontSize: size * 0.42,
      }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

export function Tag({
  children,
  tone = "line",
}: {
  children: React.ReactNode;
  tone?: "line" | "ink" | "accent";
}) {
  const tones = {
    line: "border-line text-muted",
    ink: "border-ink text-ink",
    accent: "border-ink bg-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-1 text-[0.65rem] font-bold tracking-widest",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="border border-dashed border-line bg-white/30 px-6 py-16 text-center">
      <p className="font-display text-3xl tracking-tight md:text-4xl">
        {title}
      </p>
      {children ? (
        <p className="mx-auto mt-4 max-w-md text-muted">{children}</p>
      ) : null}
      {action ? (
        <div className="mt-8 flex justify-center">
          <ShimmerButton href={action.href}>{action.label}</ShimmerButton>
        </div>
      ) : null}
    </div>
  );
}

export function Flow({
  steps,
  className,
}: {
  steps: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-lg tracking-tight md:text-2xl",
        className,
      )}
    >
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <span>{s}</span>
          {i < steps.length - 1 ? (
            <span className="text-accent-ink">→</span>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
}
