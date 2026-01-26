"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DecisionTable from "../../components/DecisionTable";
import {
  computeTotals,
  recommendOption,
  topContributions,
} from "../../lib/logic";
import type { StoredDecision } from "../../lib/types";
import {
  clearDraft,
  findDecisionBySlug,
  saveDraft,
  upsertDecision,
} from "../../lib/storage";
import { useDraft } from "../../lib/useDraft";
import { createUniqueShareSlug } from "../../lib/shareSlug";

export default function ScorePage() {
  const router = useRouter();
  const { draft, setDraft, hydrated } = useDraft();
  const [savedDecisionId, setSavedDecisionId] = useState<string | null>(null);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");

  const totals = useMemo(
    () =>
      draft ? computeTotals(draft.options, draft.criteria, draft.scores) : {},
    [draft]
  );
  const recommendedId = useMemo(
    () =>
      draft
        ? recommendOption(draft.options, draft.criteria, draft.scores, totals)
        : "",
    [draft, totals]
  );
  const enabledCriteria = draft
    ? draft.criteria.filter((criterion) => criterion.enabled)
    : [];

  useEffect(() => {
    if (!draft) return;
    setSelectedOptionId((prev) => prev || recommendedId || draft.options[0]?.id);
  }, [draft, recommendedId]);

  if (!hydrated) return null;
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

  const updateScore = (optionId: string, criterionId: string, value: number) => {
    const nextScores = {
      ...draft.scores,
      [optionId]: {
        ...draft.scores[optionId],
        [criterionId]: value,
      },
    };
    setDraft({ ...draft, scores: nextScores });
  };

  const fillAllThrees = () => {
    const nextScores = { ...draft.scores };
    draft.options.forEach((option) => {
      nextScores[option.id] = {
        ...nextScores[option.id],
      };
      enabledCriteria.forEach((criterion) => {
        nextScores[option.id][criterion.id] = 3;
      });
    });
    setDraft({ ...draft, scores: nextScores });
  };

  const persistDecision = async (isPublic: boolean) => {
    const now = new Date().toISOString();
    const decisionId = savedDecisionId ?? crypto.randomUUID();
    const slug =
      shareSlug ??
      (await createUniqueShareSlug({
        exists: (candidate) => Boolean(findDecisionBySlug(candidate)),
      }));
    const stored: StoredDecision = {
      ...draft,
      id: decisionId,
      createdAt: now,
      updatedAt: now,
      totalScores: totals,
      recommendedOptionId: recommendedId,
      shareSlug: slug,
      isPublic,
    };

    upsertDecision(stored);
    setSavedDecisionId(decisionId);
    setShareSlug(slug);

    return stored;
  };

  const requireLogin = async () => true;

  const handleSave = async () => {
    if (!(await requireLogin())) return;
    await persistDecision(false);
    setNotice("저장되었습니다. 대시보드에서 확인할 수 있어요.");
    clearDraft();
    router.push("/dashboard");
  };

  const handleShare = async () => {
    if (!(await requireLogin())) return;
    const stored = await persistDecision(true);
    setNotice("공유 링크가 생성되었습니다.");
    clearDraft();
    router.push(`/d/${stored.shareSlug}`);
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Step 3 of 3
            </p>
            <h1 className="text-3xl font-semibold">점수 & 결과</h1>
          </div>
        </header>

        <section className="card grid gap-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">비교표</h2>
              <p className="text-sm text-[var(--muted)]">
                각 셀은 1~5점입니다. Total = Σ (W × S). W는 중요도(1~5), S는
                점수(1~5)입니다.
              </p>
            </div>
            <button
              type="button"
              onClick={fillAllThrees}
              className="rounded-full border border-[var(--ink)]/20 px-4 py-2 text-xs font-semibold text-[var(--muted)]"
            >
              전체 3으로
            </button>
          </div>

          <DecisionTable
            mode="editable"
            options={draft.options}
            criteria={draft.criteria}
            scores={draft.scores}
            onScoreChange={updateScore}
          />
        </section>

        <section className="card grid gap-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">총점 & 추천</h2>
            <span className="text-xs text-[var(--muted)]">
              동점 시 높은 weight 기준의 점수로 우선순위를 결정합니다.
            </span>
          </div>
          {(() => {
            const maxTotal = draft.criteria
              .filter((criterion) => criterion.enabled)
              .reduce((sum, criterion) => sum + criterion.weight * 5, 0);
            return (
              <p className="text-xs text-[var(--muted)]">
                만점 계산식: Σ(W × 5) = {maxTotal}
              </p>
            );
          })()}
          <div className="grid gap-4 md:grid-cols-3">
            {draft.options.map((option) => {
              const contributions = topContributions(
                option.id,
                draft.criteria,
                draft.scores
              );
              const isRecommended = option.id === recommendedId;
              const isSelected = option.id === selectedOptionId;
              return (
                <button
                  type="button"
                  onClick={() => setSelectedOptionId(option.id)}
                  key={option.id}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    isSelected
                      ? "border-[var(--ink)] bg-[var(--card)] shadow-[0_16px_40px_rgba(30,26,23,0.12)]"
                      : isRecommended
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
                    <span className="ml-2 text-base font-semibold text-[var(--muted)]">
                      /
                      {draft.criteria
                        .filter((criterion) => criterion.enabled)
                        .reduce(
                          (sum, criterion) => sum + criterion.weight * 5,
                          0
                        )}
                    </span>
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
                </button>
              );
            })}
          </div>
          {selectedOptionId && (
            <div className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--card)] px-6 py-5 text-base shadow-[0_20px_50px_rgba(30,26,23,0.1)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                선택 결과
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                <span className="mr-2">✨</span>
                {draft.title}
                <span className="text-[var(--muted)]">에서 </span>
                <span className="text-[var(--ink)]">
                  {draft.options.find((option) => option.id === selectedOptionId)
                    ?.label ?? ""}
                </span>
                <span className="text-[var(--muted)]">이 선택되었습니다.</span>
              </p>
            </div>
          )}
        </section>

        {notice && (
          <p className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--ink)]">
            {notice}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[var(--muted)]">
            저장/공유는 로그인 후 가능합니다.
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/new/criteria"
              className="btn-ink rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
              style={{ color: "#fff" }}
            >
              이전
            </Link>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full border border-[var(--ink)]/20 px-6 py-3 text-sm font-semibold"
            >
              저장
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white"
            >
              공유 링크 생성
            </button>
            <Link
              href="/new?fresh=1"
              className="rounded-full border border-[var(--ink)]/20 px-6 py-3 text-sm font-semibold"
            >
              새 결정
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
