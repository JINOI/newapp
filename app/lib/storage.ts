import type { DecisionDraft, StoredDecision } from "./types";

const DRAFT_KEY = "decision-helper:draft:v1";
const DECISIONS_KEY = "decision-helper:decisions:v1";
const SESSION_KEY = "decision-helper:session:v1";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadDraft(): DecisionDraft | null {
  if (typeof window === "undefined") return null;
  return safeParse<DecisionDraft | null>(
    window.localStorage.getItem(DRAFT_KEY),
    null
  );
}

export function saveDraft(draft: DecisionDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function loadDecisions(): StoredDecision[] {
  if (typeof window === "undefined") return [];
  return safeParse<StoredDecision[]>(
    window.localStorage.getItem(DECISIONS_KEY),
    []
  );
}

export function saveDecisions(decisions: StoredDecision[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions));
}

export function upsertDecision(decision: StoredDecision) {
  const existing = loadDecisions();
  const idx = existing.findIndex((item) => item.id === decision.id);
  if (idx >= 0) {
    existing[idx] = decision;
  } else {
    existing.unshift(decision);
  }
  saveDecisions(existing);
}

export function updateDecision(id: string, updates: Partial<StoredDecision>) {
  const existing = loadDecisions();
  const idx = existing.findIndex((item) => item.id === id);
  if (idx < 0) return null;
  const updated = {
    ...existing[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  } as StoredDecision;
  existing[idx] = updated;
  saveDecisions(existing);
  return updated;
}

export function removeDecision(id: string) {
  const next = loadDecisions().filter((item) => item.id !== id);
  saveDecisions(next);
}

export function findDecisionBySlug(slug: string): StoredDecision | null {
  const decisions = loadDecisions();
  return decisions.find((item) => item.shareSlug === slug) ?? null;
}

export function loadSession(): { email: string } | null {
  if (typeof window === "undefined") return null;
  return safeParse<{ email: string } | null>(
    window.localStorage.getItem(SESSION_KEY),
    null
  );
}

export function saveSession(email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
