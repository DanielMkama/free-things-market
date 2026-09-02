// Shared return shape for server actions driven by `useActionState`.
// Kept in its own module so "use server" files never export non-functions.

export type FormState = {
  error?: string;
  ok?: string;
};
