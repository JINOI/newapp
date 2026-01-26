export type Option = {
  id: string;
  label: string;
};

export type Criterion = {
  id: string;
  label: string;
  description?: string;
  weight: number;
  enabled: boolean;
};

export type Scores = Record<string, Record<string, number>>;

export type DecisionDraft = {
  title: string;
  context: string;
  options: Option[];
  criteria: Criterion[];
  scores: Scores;
};

export type StoredDecision = DecisionDraft & {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalScores: Record<string, number>;
  recommendedOptionId: string;
  shareSlug: string;
  isPublic: boolean;
};
