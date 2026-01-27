import type { Criterion, DecisionDraft, Option, Scores, StoredDecision } from "./types";

export type DecisionRow = {
  id: string;
  user_id: string;
  title: string;
  context: string;
  options: Option[];
  criteria: Criterion[];
  scores: Scores;
  total_scores: Record<string, number>;
  recommended_option_id: string;
  share_slug: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type DecisionPayload = {
  id: string;
  user_id: string;
  title: string;
  context: string;
  options: Option[];
  criteria: Criterion[];
  scores: Scores;
  total_scores: Record<string, number>;
  recommended_option_id: string;
  is_public: boolean;
  share_slug?: string;
};

export function mapDecisionRow(row: DecisionRow): StoredDecision {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    title: row.title,
    context: row.context ?? "",
    options: row.options ?? [],
    criteria: row.criteria ?? [],
    scores: row.scores ?? {},
    totalScores: row.total_scores ?? {},
    recommendedOptionId: row.recommended_option_id ?? "",
    shareSlug: row.share_slug ?? "",
    isPublic: Boolean(row.is_public),
  };
}

export function buildDecisionPayload(args: {
  draft: DecisionDraft;
  userId: string;
  decisionId: string;
  totals: Record<string, number>;
  recommendedOptionId: string;
  isPublic: boolean;
  shareSlug?: string;
}): DecisionPayload {
  const {
    draft,
    userId,
    decisionId,
    totals,
    recommendedOptionId,
    isPublic,
    shareSlug,
  } = args;
  return {
    id: decisionId,
    user_id: userId,
    title: draft.title,
    context: draft.context,
    options: draft.options,
    criteria: draft.criteria,
    scores: draft.scores,
    total_scores: totals,
    recommended_option_id: recommendedOptionId,
    is_public: isPublic,
    ...(shareSlug ? { share_slug: shareSlug } : {}),
  };
}
