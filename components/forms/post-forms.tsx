"use client";

import { useActionState } from "react";
import {
  createOfferAction,
  createRequestAction,
  type FormState,
} from "@/lib/actions/posts";
import { Field, TextArea, Select, CheckboxRow } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/forms/submit";
import { OFFER_TYPES, CATEGORIES, AVAILABILITY, URGENCY } from "@/lib/taxonomy";

const initial: FormState = {};

export function OfferForm() {
  const [state, action] = useActionState(createOfferAction, initial);
  return (
    <form action={action} className="space-y-5">
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}

      <Select label="Type" name="type" defaultValue="" required>
        <option value="" disabled>
          What kind of gift is this?
        </option>
        {OFFER_TYPES.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </Select>

      <Field
        label="Title"
        name="title"
        placeholder="I can help you improve your CV"
        required
      />

      <TextArea
        label="Description"
        name="description"
        placeholder="Explain what you're offering. Include anything useful — what's included, what to expect."
        required
      />

      <Select label="Category" name="category" defaultValue="" required>
        <option value="" disabled>
          Choose a category
        </option>
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" name="city" placeholder="Arusha" />
        <Field label="Country" name="country" placeholder="Tanzania" />
      </div>

      <CheckboxRow label="I can do this online" name="onlineAvailable" />

      <Select label="Availability" name="availability" defaultValue="Flexible">
        {AVAILABILITY.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </Select>

      <Field
        label="Quantity / capacity"
        name="capacity"
        hint="optional"
        placeholder="I can help 3 people"
      />

      <SubmitButton pendingLabel="Posting…">Post this gift</SubmitButton>
      <p className="text-xs text-muted">
        No prices. No selling. Just what you can share.
      </p>
    </form>
  );
}

export function RequestForm() {
  const [state, action] = useActionState(createRequestAction, initial);
  return (
    <form action={action} className="space-y-5">
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}

      <Select label="Type" name="type" defaultValue="" required>
        <option value="" disabled>
          What kind of thing do you need?
        </option>
        {OFFER_TYPES.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </Select>

      <Field
        label="Title"
        name="title"
        placeholder="I need someone to teach me Photoshop"
        required
      />

      <TextArea
        label="Description"
        name="description"
        placeholder="Explain what you need and what would help. Be specific — someone may already have it."
        required
      />

      <Select label="Category" name="category" defaultValue="" required>
        <option value="" disabled>
          Choose a category
        </option>
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" name="city" placeholder="Arusha" />
        <Field label="Country" name="country" placeholder="Tanzania" />
      </div>

      <CheckboxRow label="Online is fine" name="onlineAvailable" />

      <Select label="Urgency" name="urgency" defaultValue="Whenever">
        {URGENCY.map((u) => (
          <option key={u}>{u}</option>
        ))}
      </Select>

      <SubmitButton pendingLabel="Posting…">Post what I need</SubmitButton>
      <p className="text-xs text-muted">
        Asking isn&apos;t charity. Everyone here both gives and receives.
      </p>
    </form>
  );
}
