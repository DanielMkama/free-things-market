"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, logInAction, type FormState } from "@/lib/actions/auth";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/forms/submit";

const initial: FormState = {};

export function SignupForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, action] = useActionState(signUpAction, initial);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Your name" name="name" autoComplete="name" required />
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={defaultEmail}
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="8+ characters"
        required
      />
      <SubmitButton pendingLabel="Creating your account…">
        Create account
      </SubmitButton>
      <p className="text-sm text-muted">
        Already part of the market?{" "}
        <Link href="/login" className="font-bold u-link">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(logInAction, initial);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <SubmitButton pendingLabel="Logging you in…">Log in</SubmitButton>
      <p className="text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-bold u-link">
          Join the market
        </Link>
      </p>
    </form>
  );
}
