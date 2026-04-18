"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  AUTH_COOKIE_NAME,
  AUTH_LICENSE_COOKIE_NAME,
  AUTH_LICENSE_VERIFIED_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  createBrowserSupabaseClient
} from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();

    if (supabase) {
      await supabase.auth.signOut();
    }

    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    document.cookie = `${AUTH_ROLE_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    document.cookie = `${AUTH_LICENSE_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    document.cookie = `${AUTH_LICENSE_VERIFIED_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    router.push("/login");
    router.refresh();
  };

  return (
    <Button className="w-full justify-start" variant="ghost" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
