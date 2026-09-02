"use client";

import { useActionState } from "react";
import { updateAvatarAction } from "@/lib/actions/storage";
import type { FormState } from "@/lib/form-state";
import { Avatar } from "@/components/ui/primitives";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/forms/submit";

const initial: FormState = {};

export function AvatarForm({
  name,
  color,
  url,
}: {
  name: string;
  color: string;
  url: string | null;
}) {
  const [state, action] = useActionState(updateAvatarAction, initial);

  return (
    <form
      action={action}
      className="space-y-4 border border-line bg-white/40 p-5"
    >
      <div className="flex items-center gap-4">
        <Avatar name={name} color={color} url={url} size={56} />
        <div>
          <p className="u-eyebrow">Profile photo</p>
          <p className="text-sm text-muted">
            PNG, JPG, WebP or GIF · up to 4 MB
          </p>
        </div>
      </div>

      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state.ok ? <Notice tone="success">{state.ok}</Notice> : null}

      <input
        type="file"
        name="avatar"
        accept="image/png,image/jpeg,image/webp,image/gif"
        required
        className="block w-full text-sm text-muted file:mr-4 file:border file:border-ink file:bg-white file:px-4 file:py-2 file:text-xs file:font-bold file:tracking-widest file:text-ink"
      />
      <SubmitButton full={false} size="md" pendingLabel="Uploading…">
        Save photo
      </SubmitButton>
    </form>
  );
}
