import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block">
      <span className="u-eyebrow">{children}</span>
      {hint ? (
        <span className="ml-2 text-xs normal-case tracking-normal text-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function Field({
  label,
  hint,
  id,
  className,
  ...rest
}: {
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const fid = id ?? rest.name;
  return (
    <div className={className}>
      <Label htmlFor={fid} hint={hint}>
        {label}
      </Label>
      <input id={fid} className="u-field" {...rest} />
    </div>
  );
}

export function TextArea({
  label,
  hint,
  id,
  className,
  ...rest
}: {
  label: string;
  hint?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fid = id ?? rest.name;
  return (
    <div className={className}>
      <Label htmlFor={fid} hint={hint}>
        {label}
      </Label>
      <textarea id={fid} className={cn("u-field min-h-36")} {...rest} />
    </div>
  );
}

export function Select({
  label,
  hint,
  id,
  className,
  children,
  ...rest
}: {
  label: string;
  hint?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const fid = id ?? rest.name;
  return (
    <div className={className}>
      <Label htmlFor={fid} hint={hint}>
        {label}
      </Label>
      <select id={fid} className="u-field appearance-none pr-10" {...rest}>
        {children}
      </select>
    </div>
  );
}

export function CheckboxRow({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-center gap-3 border border-line bg-white p-4">
      <input
        type="checkbox"
        className="size-4 accent-[var(--color-accent-ink)]"
        {...rest}
      />
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );
}
