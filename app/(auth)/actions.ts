"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://flaash.ch").replace(/\/$/, "");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email    = normalizeEmail(formData.get("email"));
  const password = formData.get("password") as string;
  const next     = (formData.get("next") as string) || "/dashboard";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg =
      error.message === "Invalid login credentials"
        ? "Email ou mot de passe incorrect."
        : error.message;
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email    = normalizeEmail(formData.get("email"));
  const password = formData.get("password") as string;

  if (!isValidEmail(email)) {
    redirect("/register?error=Veuillez saisir une adresse e-mail valide.");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/register?success=account-created");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = normalizeEmail(formData.get("email"));

  if (!isValidEmail(email)) {
    redirect("/forgot-password?error=Veuillez saisir une adresse e-mail valide.");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?success=reset-sent");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  if (!password || password.length < 8) {
    redirect("/reset-password?error=Le mot de passe doit contenir au moins 8 caractères.");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?success=password-updated");
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function isValidEmail(value: string) {
  return emailPattern.test(value);
}
