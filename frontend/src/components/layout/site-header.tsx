"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearAuthToken, getAuthToken } from "@/lib/auth/auth-store";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const loggedIn = Boolean(getAuthToken());

  const handleLogout = () => {
    clearAuthToken();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-black backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between px-4 md:px-6">
        <Link
          href="/cars"
          className="text-lg font-semibold tracking-wide text-white"
        >
          Carfinder
        </Link>
        <div className="flex items-center gap-2">
          {loggedIn && pathname !== "/login" ? (
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
