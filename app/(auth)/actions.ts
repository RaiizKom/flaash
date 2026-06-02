"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email    = formData.get("email") as string;
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

  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/register?success=check-email");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
