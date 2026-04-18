import { cookies } from "next/headers";
import { ShieldPlus } from "lucide-react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { AUTH_COOKIE_NAME, AUTH_ROLE_COOKIE_NAME, isSessionRole } from "@/lib/supabase/client";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const roleValue = cookieStore.get(AUTH_ROLE_COOKIE_NAME)?.value;

  if (cookieStore.get(AUTH_COOKIE_NAME)?.value && isSessionRole(roleValue)) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center rounded-[2rem] border border-white/60 bg-white/65 p-8 shadow-panel backdrop-blur lg:p-12">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-teal-100 p-3 text-teal-800">
              <ShieldPlus className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-800">
              Trusted Medical Platform
            </p>
          </div>
          <h1 className="mt-8 max-w-xl font-serif text-5xl leading-tight text-slate-900">
            Protected medical access for patients and doctors.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
            Patient sessions redact internal clinical details, while doctor
            sessions unlock the full platform after licence verification.
          </p>
        </section>

        <section className="flex items-center justify-center">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
