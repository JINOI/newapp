"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function GlobalHeader() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let isActive = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (isActive) setIsLoggedIn(Boolean(data.session));
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      syncSession();
    });

    syncSession();

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--ink)]/10 bg-[var(--paper)]/80 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Decision Helper
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full border border-[var(--ink)]/15 px-4 py-2"
              >
                대시보드
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ink rounded-full bg-[var(--ink)] px-4 py-2 text-white"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[var(--ink)]/15 px-4 py-2"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
