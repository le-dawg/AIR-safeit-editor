"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthApiError } from "@supabase/supabase-js"; // Import AuthApiError

import { createClient } from "@/lib/supabase/server";
import { LoginWithEmailInput } from "./Login";

// Define a return type for the action
type LoginResult = { success: true } | { success: false; message: string };

export async function login(input: LoginWithEmailInput): Promise<LoginResult | void> { // Update return type
  const supabase = createClient();

  const data = {
    email: input.email,
    password: input.password,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error(error);
    // Check for specific invalid credentials error
    if (error instanceof AuthApiError && error.message === 'Invalid login credentials') {
        return { success: false, message: "Invalid login credentials." };
    }
    // For other errors, redirect as before (or handle differently if needed)
    redirect("/auth/login?error=true");
  }

  // On success, revalidate and redirect
  revalidatePath("/", "layout");
  redirect("/");

  // Note: The successful redirect means this function effectively won't return
  // anything on success path due to the redirect interrupting execution.
  // The return type includes 'void' to satisfy TypeScript for the success path,
  // even though the { success: true } part of LoginResult isn't explicitly returned here.
}
