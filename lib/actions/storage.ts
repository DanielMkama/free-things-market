"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";

export type { FormState };

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function extFor(type: string): string {
  return (
    { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" }[
      type
    ] ?? "png"
  );
}

export async function updateAvatarAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0)
    return { error: "Choose an image first." };
  if (file.size > MAX_BYTES) return { error: "Keep it under 4 MB." };
  if (!ALLOWED.includes(file.type))
    return { error: "Use a PNG, JPG, WebP or GIF." };

  const supabase = await createClient();
  const path = `${user.id}/avatar-${Date.now()}.${extFor(file.type)}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  revalidatePath(`/u/${user.handle}`);
  return { ok: "New photo saved." };
}
