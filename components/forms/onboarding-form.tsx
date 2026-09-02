"use client";

import { useActionState, useState } from "react";
import { completeOnboardingAction, type FormState } from "@/lib/actions/auth";
import { Field, TextArea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/forms/submit";
import { Button } from "@/components/ui/button";
import { SHOWCASE } from "@/lib/taxonomy";

const STEPS = [
  "Your name",
  "Where are you?",
  "What can you give?",
  "What do you need?",
];
const initial: FormState = {};

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [state, action] = useActionState(completeOnboardingAction, initial);
  const [step, setStep] = useState(0);
  const [give, setGive] = useState<string[]>([]);
  const [need, setNeed] = useState<string[]>([]);

  const toggle = (
    list: string[],
    set: (v: string[]) => void,
    value: string,
  ) => {
    set(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  };

  const last = step === STEPS.length - 1;
  const giveChoices = [
    ...SHOWCASE.Skills,
    ...SHOWCASE.Things,
    ...SHOWCASE.Knowledge,
  ];
  const needChoices = [
    ...SHOWCASE.Skills,
    ...SHOWCASE.Knowledge,
    ...SHOWCASE.Things,
  ];

  return (
    <form action={action} className="space-y-8">
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1 flex-1 ${i <= step ? "bg-ink" : "bg-line"}`}
          />
        ))}
      </div>

      <p className="u-eyebrow text-muted">
        Step {step + 1} / {STEPS.length}
      </p>

      {state.error ? <Notice tone="error">{state.error}</Notice> : null}

      {/* Step 1 */}
      <div className={step === 0 ? "space-y-4" : "hidden"}>
        <h2 className="font-display text-4xl tracking-tight">
          What&apos;s your name?
        </h2>
        <Field label="Name" name="name" defaultValue={defaultName} required />
        <Field
          label="One-line headline"
          name="headline"
          hint="optional"
          placeholder="Brand designer · Student · Cook"
        />
      </div>

      {/* Step 2 */}
      <div className={step === 1 ? "space-y-4" : "hidden"}>
        <h2 className="font-display text-4xl tracking-tight">Where are you?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" name="city" placeholder="Arusha" />
          <Field label="Country" name="country" placeholder="Tanzania" />
        </div>
        <p className="text-sm text-muted">
          This helps match you with people nearby. You can still give and
          receive online.
        </p>
      </div>

      {/* Step 3 */}
      <div className={step === 2 ? "space-y-4" : "hidden"}>
        <h2 className="font-display text-4xl tracking-tight">
          What can you give?
        </h2>
        <p className="text-sm text-muted">
          Pick anything that fits. You probably have more to give than you
          think.
        </p>
        <ChipGroup
          options={giveChoices}
          selected={give}
          onToggle={(v) => toggle(give, setGive, v)}
        />
        <input type="hidden" name="giveTags" value={give.join(",")} />
      </div>

      {/* Step 4 */}
      <div className={step === 3 ? "space-y-4" : "hidden"}>
        <h2 className="font-display text-4xl tracking-tight">
          What are you looking for?
        </h2>
        <p className="text-sm text-muted">
          No pressure — you can ask for anything later too.
        </p>
        <ChipGroup
          options={needChoices}
          selected={need}
          onToggle={(v) => toggle(need, setNeed, v)}
        />
        <input type="hidden" name="needTags" value={need.join(",")} />
      </div>

      <div className="flex items-center gap-3">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
        ) : null}
        {!last ? (
          <Button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="ml-auto"
          >
            Continue
          </Button>
        ) : (
          <div className="ml-auto w-full sm:w-auto">
            <SubmitButton full={false} pendingLabel="Setting things up…">
              Enter the market
            </SubmitButton>
          </div>
        )}
      </div>
    </form>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from(new Set(options)).map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            aria-pressed={on}
            className={`border px-3 py-1.5 text-sm font-semibold transition ${
              on
                ? "border-ink bg-accent"
                : "border-line text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
