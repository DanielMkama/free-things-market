"use client";

import { useActionState, useState } from "react";
import {
  createGiveForwardAction,
  completeGiveForwardAction,
  type FormState,
} from "@/lib/actions/connections";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/forms/submit";
import { Button } from "@/components/ui/button";
import { GIVE_FORWARD_TYPES } from "@/lib/taxonomy";

const initial: FormState = {};

export function CreateGiveForwardForm({
  triggerActId,
}: {
  triggerActId?: string;
}) {
  const [state, action] = useActionState(createGiveForwardAction, initial);
  const [type, setType] = useState<string>("");

  return (
    <form action={action} className="space-y-4 border border-ink bg-accent p-6">
      <p className="font-display text-3xl uppercase leading-none tracking-tight">
        Keep it moving.
      </p>
      <p className="text-sm font-semibold">
        You just received generosity. What will you give forward?
      </p>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {triggerActId ? (
        <input type="hidden" name="triggerActId" value={triggerActId} />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {GIVE_FORWARD_TYPES.map((t) => (
          <label
            key={t}
            className={`cursor-pointer border px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition ${
              type === t
                ? "border-ink bg-ink text-paper"
                : "border-ink bg-white/50 hover:bg-white"
            }`}
          >
            <input
              type="radio"
              name="type"
              value={t}
              className="sr-only"
              onChange={() => setType(t)}
              required
            />
            {t}
          </label>
        ))}
      </div>

      <div>
        <label className="u-eyebrow" htmlFor="gf-text">
          What will you do?
        </label>
        <textarea
          id="gf-text"
          name="commitmentText"
          required
          className="u-field mt-2 min-h-20"
          placeholder="I'll review someone's CV next week."
        />
      </div>

      <div>
        <label className="u-eyebrow" htmlFor="gf-days">
          By when?
        </label>
        <select id="gf-days" name="days" defaultValue="7" className="u-field mt-2">
          <option value="3">In 3 days</option>
          <option value="7">In 7 days</option>
          <option value="14">In 2 weeks</option>
          <option value="30">In a month</option>
        </select>
      </div>

      <SubmitButton pendingLabel="Committing…">
        I&apos;ll give it forward
      </SubmitButton>
    </form>
  );
}

export function CompleteGiveForwardForm({
  commitmentId,
}: {
  commitmentId: string;
}) {
  const [state, action] = useActionState(completeGiveForwardAction, initial);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="accent" size="md" onClick={() => setOpen(true)}>
        I did it
      </Button>
    );
  }

  return (
    <form action={action} className="mt-3 space-y-3 border border-ink bg-white/60 p-4">
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <input type="hidden" name="commitmentId" value={commitmentId} />
      <div>
        <label className="u-eyebrow text-muted" htmlFor="gfc-desc">
          What did you do?
        </label>
        <textarea
          id="gfc-desc"
          name="description"
          required
          className="u-field mt-2 min-h-20"
          placeholder="Reviewed a student's CV over a call."
        />
      </div>
      <div>
        <label className="u-eyebrow text-muted" htmlFor="gfc-hours">
          Hours given (optional)
        </label>
        <input
          id="gfc-hours"
          name="hours"
          type="number"
          min="0"
          step="0.5"
          className="u-field mt-2"
        />
      </div>
      <div className="flex gap-2">
        <SubmitButton full={false} size="md" pendingLabel="Recording…">
          That&apos;s another ripple
        </SubmitButton>
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
