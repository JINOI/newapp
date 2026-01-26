"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) router.push("/");
    };
    sync();
    const { data: subscription } = supabase.auth.onAuthStateChange(sync);
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || password.length < 6) {
      setError("이메일과 6자 이상의 비밀번호를 입력해주세요.");
      setLoading(false);
      return;
    }

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          })
        : await supabase.auth.signUp({
            email: trimmedEmail,
            password,
          });

    if (result.error) {
      setError(result.error.message || "로그인/회원가입에 실패했습니다.");
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      setLoading(false);
      return;
    }

    const next =
      mode === "login" ? "/" : searchParams.get("next") ?? "/dashboard";
    router.push(next);
    router.refresh();
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              계정
            </p>
            <h1 className="text-3xl font-semibold">로그인 / 회원가입</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[var(--ink)]/15 px-4 py-2 text-sm font-semibold transition hover:border-[var(--ink)]"
          >
            홈
          </Link>
        </header>

        <section className="card p-6">
          <div className="mb-5 flex gap-2 rounded-full border border-[var(--ink)]/10 bg-white/70 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-3 py-2 transition ${
                mode === "login"
                  ? "btn-ink bg-[var(--ink)] text-white"
                  : "text-[var(--muted)]"
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-3 py-2 transition ${
                mode === "signup"
                  ? "btn-ink bg-[var(--ink)] text-white"
                  : "text-[var(--muted)]"
              }`}
            >
              회원가입
            </button>
          </div>

          <div className="grid gap-3">
            <label className="grid gap-2 text-sm font-semibold">
              이메일
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-[var(--ink)]"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="6자 이상"
                className="w-full rounded-2xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-[var(--ink)]"
              />
            </label>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-ink rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(27,27,26,0.28)] disabled:opacity-60"
            >
              {mode === "login" ? "로그인" : "회원가입"}
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
