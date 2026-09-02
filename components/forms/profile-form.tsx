"use client";

import { useActionState } from "react";
import { updateProfileAction, type FormState } from "@/lib/actions/auth";
import type { User } from "@/lib/models";
import { Field, TextArea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/forms/submit";

const initial: FormState = {};

export function ProfileForm({ user }: { user: User }) {
  const [state, action] = useActionState(updateProfileAction, initial);
  return (
    <form action={action} className="space-y-5">
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state.ok ? <Notice tone="success">{state.ok}</Notice> : null}

      <Field label="Name" name="name" defaultValue={user.name} required />
      <Field
        label="Headline"
        name="headline"
        defaultValue={user.headline ?? ""}
        placeholder="Brand designer · Student · Cook"
      />
      <TextArea
        label="Bio"
        name="bio"
        defaultValue={user.bio ?? ""}
        placeholder="A line about what you like to give."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" name="city" defaultValue={user.city ?? ""} />
        <Field label="Country" name="country" defaultValue={user.country ?? ""} />
      </div>
      <Field
        label="What I can give"
        name="giveTags"
        hint="comma separated"
        defaultValue={user.giveTags.join(", ")}
        placeholder="Design, Books, 1 hour of mentorship"
      />
      <Field
        label="What I'm looking for"
        name="needTags"
        hint="comma separated"
        defaultValue={user.needTags.join(", ")}
        placeholder="Photography help, Career advice"
      />
      <SubmitButton pendingLabel="Saving…">Save profile</SubmitButton>
    </form>
  );
}
