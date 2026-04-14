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
          className="inline-flex items-center gap-3 rounded-md px-1 py-1 text-white transition-opacity hover:opacity-90"
          aria-label="Go to cars catalog"
        >
          <span className="relative grid h-8 w-8 grid-cols-3 grid-rows-3 place-items-center">
            <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#d4bb6e]" />
            <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#b89a48]" />
            <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#d4bb6e]" />
            <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#b89a48]" />
            <span className="h-1.5 w-1.5 rotate-45 rounded-[2px] bg-[#9a803c]" />
            <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#d4bb6e]" />
            <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#d4bb6e]" />
            <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#b89a48]" />
            <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#d4bb6e]" />
          </span>
          <span className="text-base font-extrabold text-white uppercase tracking-[0.12em]">
            Car Finder
          </span>
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
