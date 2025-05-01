import { cn } from "@/lib/utils";
import NextImage from "next/image";
import Link from "next/link";
import { buttonVariants } from "../../ui/button";
import { UserAuthForm } from "./user-auth-form-login";
import { login } from "./actions";
import { createSupabaseClient } from "@/lib/supabase/client";
// Remove unused imports if they are only used by the removed useEffect
// import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react"; // Remove useEffect import
import { useToast } from "@/hooks/use-toast"; // Import useToast

export interface LoginWithEmailInput {
  email: string;
  password: string;
}

export function Login() {
  // Remove isError state and related useEffect
  const { toast } = useToast(); // Get toast function

  const onLoginWithEmail = async (
    input: LoginWithEmailInput
  ): Promise<void> => {
    // setIsError(false); // Remove this
    const result = await login(input); // Await the result

    // Check if the action returned an error object
    if (result && !result.success) {
      toast({
        variant: "destructive",
        description: result.message,
        duration: 3000, // 3 seconds
      });
    }
    // No need for an else block, successful login is handled by redirect in the action
  };

  const onLoginWithOauth = async (
    provider: "google" | "github"
  ): Promise<void> => {
    const client = createSupabaseClient();
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : "";
    await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${currentOrigin}/auth/callback`,
      },
    });
  };

  return (
    <div className="container relative h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/auth/signup"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute md:flex hidden right-4 top-4 md:right-8 md:top-8"
        )}
      >
        Signup
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 dark:border-r lg:flex">
        <div className="absolute inset-0 bg-slate-100" />
        <div className="relative z-20 flex gap-1 items-center text-lg font-medium">
          <NextImage
            src="/safe-it-logo.png"
            width={144}
            height={36}
            alt="Safe-IT Logo"
            className="rounded-full"
          />
          JournalHelper
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
            <Link
              href="/auth/signup"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "md:hidden flex"
              )}
            >
              Signup
            </Link>
          </div>
          <UserAuthForm
            onLoginWithEmail={onLoginWithEmail}
            onLoginWithOauth={onLoginWithOauth}
          />
          {/* Remove the old error message paragraph */}
        </div>
      </div>
    </div>
  );
}
