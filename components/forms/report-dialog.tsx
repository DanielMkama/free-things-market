"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import {
  reportContentAction,
  type FormState,
} from "@/lib/actions/moderation";
import { REPORT_REASONS } from "@/lib/taxonomy";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/forms/submit";
import { Button } from "@/components/ui/button";

const initial: FormState = {};

export function ReportDialog({
  contentType,
  contentId,
}: {
  contentType: "offer" | "request" | "user";
  contentId: string;
}) {
  const [state, action] = useActionState(reportContentAction, initial);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted u-link"
      >
        <Flag size={13} /> Report
      </button>

      {open && (
        <form
          action={action}
          className="mt-3 space-y-3 border border-ink bg-white/70 p-4"
        >
          {state.error ? <Notice tone="error">{state.error}</Notice> : null}
          {state.ok ? <Notice tone="success">{state.ok}</Notice> : null}
          {!state.ok && (
            <>
              <input type="hidden" name="contentType" value={contentType} />
              <input type="hidden" name="contentId" value={contentId} />
              <label className="u-eyebrow text-muted" htmlFor="report-reason">
                Why are you reporting this?
              </label>
              <select
                id="report-reason"
                name="reason"
                defaultValue=""
                required
                className="u-field"
              >
                <option value="" disabled>
                  Choose a reason
                </option>
                {REPORT_REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <textarea
                name="detail"
                placeholder="Anything else the team should know? (optional)"
                className="u-field min-h-20"
              />
              <div className="flex gap-2">
                <SubmitButton full={false} size="md" pendingLabel="Sending…">
                  Send report
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
            </>
          )}
        </form>
      )}
    </div>
  );
}
