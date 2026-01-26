"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { buildCriteriaFromContext, normalizeScores } from "../lib/logic";
import type { Option } from "../lib/types";
import { useDraft } from "../lib/useDraft";

const optionLimit = { min: 2, max: 5 };

const demoOptions = ["공부", "운동", "친구 만나기"];
const demoTitle = "오늘 저녁 뭐할까?";
const demoContext = "피곤한데 뒤처진 느낌도 있어.";

function createOption(label: string): Option {
  return { id: crypto.randomUUID(), label };
}

export default function NewDecisionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { draft, setDraft, hydrated } = useDraft();
  const resetApplied = useRef(false);
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [options, setOptions] = useState<Option[]>([
    createOption(""),
    createOption(""),
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!resetApplied.current && searchParams.get("fresh") === "1") {
      const nextOptions = [createOption(""), createOption("")];
      const nextCriteria = buildCriteriaFromContext("");
      const nextDraft = {
        title: "",
        context: "",
        options: nextOptions,
        criteria: nextCriteria,
        scores: normalizeScores(nextOptions, nextCriteria, {}),
      };
      setDraft(nextDraft);
      setTitle("");
      setContext("");
      setOptions(nextOptions);
      resetApplied.current = true;
      return;
    }
    if (!draft) return;
    setTitle(draft.title);
    setContext(draft.context);
    setOptions(
      draft.options.length
        ? draft.options
        : [createOption(""), createOption("")]
    );
  }, [draft, hydrated, searchParams, setDraft]);

  const updateOptionLabel = (id: string, value: string) => {
    setOptions((prev) =>
      prev.map((option) =>
        option.id === id ? { ...option, label: value } : option
      )
    );
  };

  const addOption = () => {
    setOptions((prev) => {
      if (prev.length >= optionLimit.max) return prev;
      return [...prev, createOption("")];
    });
  };

  const removeOption = (id: string) => {
    setOptions((prev) => prev.filter((option) => option.id !== id));
  };

  const handleDemo = () => {
    setTitle(demoTitle);
    setContext(demoContext);
    setOptions(demoOptions.map((label) => createOption(label)));
  };

  const handleNext = () => {
    const trimmedTitle = title.trim();
    const trimmedOptions = options
      .map((option) => ({ ...option, label: option.label.trim() }))
      .filter((option) => option.label.length > 0);

    if (!trimmedTitle) {
      setError("제목을 입력해주세요.");
      return;
    }

    if (trimmedOptions.length < optionLimit.min) {
      setError("선택지는 최소 2개가 필요합니다.");
      return;
    }

    if (trimmedOptions.length > optionLimit.max) {
      setError("선택지는 최대 5개까지 가능합니다.");
      return;
    }

    const criteria = draft?.criteria?.length
      ? draft.criteria
      : buildCriteriaFromContext(context);

    const scores = normalizeScores(trimmedOptions, criteria, draft?.scores ?? {});

    setDraft({
      title: trimmedTitle,
      context,
      options: trimmedOptions,
      criteria,
      scores,
    });

    router.push("/new/criteria");
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Step 1 of 3
            </p>
            <h1 className="text-3xl font-semibold">결정 입력</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[var(--ink)]/15 px-4 py-2 text-sm font-semibold transition hover:border-[var(--ink)]"
          >
            홈으로
          </Link>
        </header>

        <section className="card grid gap-6 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">기본 정보</h2>
            <button
              type="button"
              onClick={handleDemo}
              className="rounded-full border border-[var(--ink)]/20 px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--ink)]"
            >
              예시로 채우기
            </button>
          </div>

          <label className="grid gap-2 text-sm font-semibold">
            제목
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={60}
              placeholder="예: 오늘 저녁 뭐할까?"
              className="w-full rounded-2xl border border-[var(--ink)]/15 bg-white/80 px-4 py-3 text-base font-normal outline-none transition focus:border-[var(--ink)]"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            상황 (선택)
            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="결정에 영향을 주는 상황을 적어주세요."
              className="w-full resize-none rounded-2xl border border-[var(--ink)]/15 bg-white/80 px-4 py-3 text-base font-normal outline-none transition focus:border-[var(--ink)]"
            />
            <span className="text-xs text-[var(--muted)]">
              키워드에 따라 기본 기준의 가중치가 자동 조정됩니다.
            </span>
          </label>
        </section>

        <section className="card grid gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">선택지 (2~5개)</h2>
            <button
              type="button"
              onClick={addOption}
              className="rounded-full border border-[var(--ink)]/20 px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--ink)]"
            >
              선택지 추가
            </button>
          </div>
          <div className="grid gap-3">
            {options.map((option, index) => (
              <div
                key={option.id}
                className="flex items-center gap-3 rounded-2xl border border-[var(--ink)]/10 bg-white px-4 py-3"
              >
                <span className="text-sm font-semibold text-[var(--muted)]">
                  {index + 1}
                </span>
                <input
                  value={option.label}
                  onChange={(event) =>
                    updateOptionLabel(option.id, event.target.value)
                  }
                  maxLength={40}
                  placeholder={`선택지 ${index + 1}`}
                  className="flex-1 bg-transparent text-base outline-none"
                />
                {options.length > optionLimit.min && (
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    className="text-xs font-semibold text-[var(--muted)]"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[var(--muted)]">
            다음 단계에서 기준과 가중치를 설정합니다.
          </p>
          <button
            type="button"
            onClick={handleNext}
            className="btn-ink rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(27,27,26,0.28)]"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
