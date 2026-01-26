"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

type GlobalHeaderProps = {
  userEmail?: string | null;
};

export default function GlobalHeader({ userEmail }: GlobalHeaderProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState<string | null>(userEmail ?? null);

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      setEmail(session?.user?.email ?? null);
    };

    syncSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      () => syncSession()
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmail(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--ink)]/10 bg-[var(--paper)]/80 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Decision Helper
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold">
          {email ? (
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
