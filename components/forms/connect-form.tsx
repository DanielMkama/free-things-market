"use client";

import { useActionState, useState } from "react";
import {
  requestConnectionAction,
  type FormState,
} from "@/lib/actions/connections";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/forms/submit";
import { Button } from "@/components/ui/button";

const initial: FormState = {};

export function ConnectForm({
  kind,
  offerId,
  requestId,
  disabled,
  disabledReason,
}: {
  kind: "offer" | "request";
  offerId?: string;
  requestId?: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [state, action] = useActionState(requestConnectionAction, initial);
  const [open, setOpen] = useState(false);

  const cta = kind === "offer" ? "I want this" : "I can help";

  if (disabled) {
    return (
      <div className="border border-line bg-white/40 px-4 py-3 text-sm font-semibold text-muted">
        {disabledReason ?? "Not available."}
      </div>
    );
  }

  if (!open) {
    return (
      <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
        {cta}
      </Button>
    );
  }

  return (
    <form action={action} className="space-y-3 border border-ink bg-white/60 p-4">
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {offerId ? <input type="hidden" name="offerId" value={offerId} /> : null}
      {requestId ? (
        <input type="hidden" name="requestId" value={requestId} />
      ) : null}
      <label className="u-eyebrow text-muted" htmlFor="connect-msg">
        Add a short note
      </label>
      <textarea
        id="connect-msg"
        name="message"
        className="u-field min-h-24"
        placeholder={
          kind === "offer"
            ? "Hi! I'd love this because…"
            : "Hi! I think I can help with…"
        }
      />
      <div className="flex gap-2">
        <SubmitButton full={false} pendingLabel="Sending…">
          Send request
        </SubmitButton>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
