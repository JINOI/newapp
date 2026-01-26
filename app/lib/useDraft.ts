"use client";

import { useCallback, useEffect, useState } from "react";
import type { DecisionDraft } from "./types";
import { loadDraft, saveDraft } from "./storage";

export function useDraft(initial?: DecisionDraft | null) {
  const [draft, setDraft] = useState<DecisionDraft | null>(initial ?? null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadDraft();
    if (stored) {
      setDraft(stored);
    }
    setHydrated(true);
  }, []);

  const updateDraft = useCallback((next: DecisionDraft) => {
    setDraft(next);
    saveDraft(next);
  }, []);

  return { draft, setDraft: updateDraft, hydrated };
}
