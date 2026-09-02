"use client";

import { respondConnectionAction } from "@/lib/actions/connections";
import { SubmitButton } from "@/components/forms/submit";

export function ConnectionRespond({ connectionId }: { connectionId: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <form action={respondConnectionAction}>
        <input type="hidden" name="connectionId" value={connectionId} />
        <input type="hidden" name="decision" value="accept" />
        <SubmitButton full={false} variant="accent" pendingLabel="…">
          Accept
        </SubmitButton>
      </form>
      <form action={respondConnectionAction}>
        <input type="hidden" name="connectionId" value={connectionId} />
        <input type="hidden" name="decision" value="decline" />
        <SubmitButton full={false} variant="outline" pendingLabel="…">
          Decline
        </SubmitButton>
      </form>
    </div>
  );
}
