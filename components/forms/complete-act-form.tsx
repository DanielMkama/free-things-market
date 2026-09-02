"use client";

import { useActionState, useState } from "react";
import {
  completeConnectionAction,
  type FormState,
} from "@/lib/actions/connections";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/forms/submit";
import { Button } from "@/components/ui/button";
import { OFFER_TYPES } from "@/lib/taxonomy";

const initial: FormState = {};

export function CompleteActForm({
  connectionId,
  defaultType,
}: {
  connectionId: string;
  defaultType?: string | null;
}) {
  const [state, action] = useActionState(completeConnectionAction, initial);
  const [phase, setPhase] = useState<"ask" | "form">("ask");

  if (phase === "ask") {
    return (
      <div className="border border-ink bg-white/50 p-6">
        <p className="font-display text-3xl uppercase tracking-tight">
          Did it happen?
        </p>
        <p className="mt-2 text-sm text-muted">
          When you&apos;ve met, exchanged, or helped — mark it done so it counts.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="accent" onClick={() => setPhase("form")}>
            Yes — we did it
          </Button>
          <span className="inline-flex items-center text-sm text-muted">
            Not yet? Come back when it&apos;s done.
          </span>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 border border-ink bg-white/60 p-6">
      <p className="font-display text-2xl uppercase tracking-tight">
        What happened?
      </p>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <input type="hidden" name="connectionId" value={connectionId} />

      <div>
        <label className="u-eyebrow text-muted" htmlFor="act-desc">
          Short description
        </label>
        <textarea
          id="act-desc"
          name="description"
          required
          className="u-field mt-2 min-h-24"
          placeholder="Helped Amina redesign her CV and prepare for two job applications."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="u-eyebrow text-muted" htmlFor="act-type">
            What was given?
          </label>
          <select
            id="act-type"
            name="type"
            defaultValue={defaultType ?? ""}
            className="u-field mt-2"
          >
            <option value="">Not sure</option>
            {OFFER_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="u-eyebrow text-muted" htmlFor="act-hours">
            Hours given
          </label>
          <input
            id="act-hours"
            name="hours"
            type="number"
            min="0"
            step="0.5"
            className="u-field mt-2"
            placeholder="e.g. 1"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          name="isPublic"
          defaultChecked
          className="size-4 accent-[var(--color-accent-ink)]"
        />
        Show this act on the public impact page
      </label>

      <SubmitButton pendingLabel="Recording…">
        We did it — record the act
      </SubmitButton>
    </form>
  );
}
