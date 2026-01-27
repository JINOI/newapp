"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StoredDecision } from "../lib/types";
import { createClient } from "../lib/supabase/client";
import { mapDecisionRow } from "../lib/decisions";

export default function DashboardClient() {
  const router = useRouter();
  const [decisions, setDecisions] = useState<StoredDecision[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isActive = true;

    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      if (isActive) setUserEmail(userData.user.email ?? null);

      const { data, error } = await supabase
        .from("decisions")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        if (isActive) setNotice("결정 목록을 불러오지 못했습니다.");
        return;
      }

      if (isActive) {
        setDecisions((data ?? []).map(mapDecisionRow));
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [router]);

  const handleCopy = async (slug: string) => {
    const url = `${window.location.origin}/d/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice("공유 링크를 복사했습니다.");
    } catch {
      setNotice(url);
    }
  };

  const handleCopyIfPublic = async (decision: StoredDecision) => {
    if (!decision.isPublic) {
      setNotice("공개 상태로 전환해야 공유 링크가 활성화됩니다.");
      return;
    }
    await handleCopy(decision.shareSlug);
  };

  const handleDelete = (id: string) => {
    const supabase = createClient();
    supabase
      .from("decisions")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          setNotice("삭제에 실패했습니다.");
          return;
        }
        setDecisions((prev) => prev.filter((item) => item.id !== id));
      });
  };

  const handleTogglePublic = (id: string, nextValue: boolean) => {
    const supabase = createClient();
    supabase
      .from("decisions")
      .update({ is_public: nextValue })
      .eq("id", id)
      .select()
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotice("공개 상태 변경에 실패했습니다.");
          return;
        }
        const updated = mapDecisionRow(data);
        setDecisions((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
        setNotice(
          nextValue
            ? "공개 상태로 전환되었습니다. 공유 링크가 활성화됩니다."
            : "비공개 처리되었습니다. 공유 링크 접근이 차단됩니다."
        );
      });
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold">내 결정 목록</h1>
            {userEmail && (
              <p className="text-sm text-[var(--muted)]">{userEmail}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/new?fresh=1"
              className="btn-ink rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-white"
            >
              새 결정
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[var(--ink)]/15 px-4 py-2 text-sm font-semibold"
            >
              홈
            </Link>
          </div>
        </header>

        {notice && (
          <p className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--ink)]">
            {notice}
          </p>
        )}

        <section className="grid gap-4">
          {decisions.length === 0 ? (
            <div className="card p-6 text-sm text-[var(--muted)]">
              아직 저장된 결정이 없습니다. 새로운 결정을 시작해보세요.
            </div>
          ) : (
            decisions.map((decision) => (
              <div
                key={decision.id}
                className="card grid gap-3 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{decision.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(decision.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--ink)]/10 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    추천: {decision.options.find((opt) => opt.id === decision.recommendedOptionId)?.label ?? "-"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => router.push(`/d/${decision.shareSlug}`)}
                    className="rounded-full border border-[var(--ink)]/20 px-4 py-2"
                  >
                    열기
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleTogglePublic(decision.id, !decision.isPublic)
                    }
                    className="rounded-full border border-[var(--ink)]/20 px-4 py-2"
                  >
                    {decision.isPublic ? "비공개로 전환" : "공개로 전환"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyIfPublic(decision)}
                    className="rounded-full border border-[var(--ink)]/20 px-4 py-2"
                  >
                    공유 링크 복사
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(decision.id)}
                    className="rounded-full border border-red-200 px-4 py-2 text-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
