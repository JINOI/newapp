"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCriterion, normalizeScores } from "../../lib/logic";
import type { Criterion } from "../../lib/types";
import { useDraft } from "../../lib/useDraft";

export default function CriteriaPage() {
  const router = useRouter();
  const { draft, setDraft, hydrated } = useDraft();
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const criteria = draft?.criteria ?? [];

  const enabledCount = useMemo(
    () => criteria.filter((item) => item.enabled).length,
    [criteria]
  );

  if (!hydrated) {
    return null;
  }

  if (!draft) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <p className="text-sm text-[var(--muted)]">
            입력된 결정이 없습니다. Step 1부터 시작해주세요.
          </p>
          <Link
            href="/new"
            className="btn-ink w-fit rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
          >
            Step 1으로 이동
          </Link>
        </div>
      </div>
    );
  }

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    const nextCriteria = criteria.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setDraft({ ...draft, criteria: nextCriteria });
  };

  const toggleCriterion = (id: string) => {
    updateCriterion(id, {
      enabled: !criteria.find((item) => item.id === id)?.enabled,
    });
  };

  const addCustomCriterion = () => {
    const trimmedLabel = newLabel.trim();
    if (!trimmedLabel) return;
    const custom = createCriterion(trimmedLabel, newDesc);
    const nextCriteria = [...criteria, custom];
    const scores = normalizeScores(draft.options, nextCriteria, draft.scores);
    setDraft({ ...draft, criteria: nextCriteria, scores });
    setNewLabel("");
    setNewDesc("");
  };

  const handleNext = () => {
    if (enabledCount < 2) {
      setError("기준은 최소 2개 이상 선택해야 합니다.");
      return;
    }
    const scores = normalizeScores(draft.options, criteria, draft.scores);
    setDraft({ ...draft, scores });
    router.push("/new/score");
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Step 2 of 3
            </p>
            <h1 className="text-3xl font-semibold">기준 & 가중치</h1>
          </div>
        </header>

        <section className="card grid gap-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">기본 기준</h2>
              <p className="text-sm text-[var(--muted)]">
                체크한 기준만 비교표에 반영됩니다.
              </p>
            </div>
            <span className="rounded-full border border-[var(--ink)]/10 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
              {enabledCount}개 선택됨
            </span>
          </div>

          <div className="grid gap-4">
            {criteria.map((criterion) => (
              <div
                key={criterion.id}
                className="grid gap-3 rounded-2xl border border-[var(--ink)]/10 bg-white/80 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-3 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={criterion.enabled}
                      onChange={() => toggleCriterion(criterion.id)}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    <span>{criterion.label}</span>
                    {criterion.description && (
                      <span className="text-xs text-[var(--muted)]">
                        {criterion.description}
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[var(--muted)]">
                      중요도 {criterion.weight}
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={criterion.weight}
                      onChange={(event) =>
                        updateCriterion(criterion.id, {
                          weight: Number(event.target.value),
                        })
                      }
                      className="w-28 accent-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card grid gap-4 p-6">
          <div>
            <h2 className="text-xl font-semibold">커스텀 기준 추가</h2>
            <p className="text-sm text-[var(--muted)]">
              라벨과 설명을 추가하면 기본 가중치 3으로 시작합니다.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-[1.1fr_1.2fr_auto]">
            <input
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder="예: 집중도"
              className="rounded-2xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--ink)]"
            />
            <input
              value={newDesc}
              onChange={(event) => setNewDesc(event.target.value)}
              placeholder="설명 (선택)"
              className="rounded-2xl border border-[var(--ink)]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--ink)]"
            />
            <button
              type="button"
              onClick={addCustomCriterion}
              className="btn-ink rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold text-white"
            >
              추가
            </button>
          </div>
        </section>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[var(--muted)]">
            선택지 기준의 중요도를 조절하면 Step 3에서 즉시 반영됩니다.
          </p>
          <div className="flex gap-3">
            <Link
              href="/new"
              className="btn-ink rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(27,27,26,0.28)]"
              style={{ color: "#fff" }}
            >
              이전
            </Link>
            <button
              type="button"
              onClick={handleNext}
              className="btn-ink rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
