"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DecisionTable from "../../components/DecisionTable";
import { computeTotals, topContributions, recommendOption } from "../../lib/logic";
import { saveDraft } from "../../lib/storage";
import type { StoredDecision } from "../../lib/types";
import { createClient } from "../../lib/supabase/client";
import { mapDecisionRow } from "../../lib/decisions";

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const [decision, setDecision] = useState<StoredDecision | null>(null);
  const slug = params.shareSlug as string;

  useEffect(() => {
    if (!slug) return;
    const supabase = createClient();
    let isActive = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("decisions")
        .select("*")
        .eq("share_slug", slug)
        .single();

      if (error || !data) {
        if (isActive) setDecision(null);
        return;
      }

      if (isActive) setDecision(mapDecisionRow(data));
    };

    load();

    return () => {
      isActive = false;
    };
  }, [slug]);

  if (!decision) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <h1 className="text-2xl font-semibold">공개된 결정이 없습니다.</h1>
          <p className="text-sm text-[var(--muted)]">
            링크가 유효하지 않거나 아직 공개되지 않았습니다.
          </p>
          <Link
            href="/new"
            className="btn-ink w-fit rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
          >
            나도 만들기
          </Link>
        </div>
      </div>
    );
  }

  const totals = computeTotals(
    decision.options,
    decision.criteria,
    decision.scores
  );
  const recommendedId = recommendOption(
    decision.options,
    decision.criteria,
    decision.scores,
    totals
  );

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              공유된 결정
            </p>
            <h1 className="text-3xl font-semibold">{decision.title}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                saveDraft({
                  title: decision.title,
                  context: decision.context,
                  options: decision.options,
                  criteria: decision.criteria,
                  scores: decision.scores,
                });
                router.push("/new");
              }}
              className="rounded-full border border-[var(--ink)]/20 px-5 py-2 text-sm font-semibold"
            >
              이 결정을 복사해서 새로 만들기
            </button>
            <Link
              href="/new?fresh=1"
              className="btn-ink rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-white"
            >
              나도 만들기
            </Link>
          </div>
        </header>

        {decision.context && (
          <div className="card p-6 text-sm text-[var(--muted)]">
            {decision.context}
          </div>
        )}

        <section className="card grid gap-4 p-6">
          <h2 className="text-xl font-semibold">비교표 (읽기 전용)</h2>
          <DecisionTable
            mode="readonly"
            options={decision.options}
            criteria={decision.criteria}
            scores={decision.scores}
          />
        </section>

        <section className="card grid gap-4 p-6">
          <h2 className="text-xl font-semibold">총점 & 기여도</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {decision.options.map((option) => {
              const contributions = topContributions(
                option.id,
                decision.criteria,
                decision.scores
              );
              const isRecommended = option.id === recommendedId;
              return (
                <div
                  key={option.id}
                  className={`rounded-2xl border px-4 py-4 ${
                    isRecommended
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--ink)]/10 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{option.label}</p>
                    {isRecommended && (
                      <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">
                        추천
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-3xl font-semibold">
                    {totals[option.id] ?? 0}
                  </p>
                  <div className="mt-4 space-y-1 text-xs text-[var(--muted)]">
                    {contributions.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.label}</span>
                        <span>
                          {item.weight}×{item.score} = {item.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
