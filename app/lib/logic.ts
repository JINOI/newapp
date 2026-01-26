import type { Criterion, DecisionDraft, Option, Scores } from "./types";

export const baseCriteria: Criterion[] = [
  {
    id: "cost",
    label: "비용",
    description: "지출/기회비용",
    weight: 3,
    enabled: true,
  },
  {
    id: "time",
    label: "시간",
    description: "소요 시간",
    weight: 3,
    enabled: true,
  },
  {
    id: "effort",
    label: "노력/피로",
    description: "난이도/체력 소모",
    weight: 3,
    enabled: true,
  },
  {
    id: "risk",
    label: "리스크",
    description: "실패 시 손해",
    weight: 3,
    enabled: true,
  },
  {
    id: "benefit",
    label: "효용/이득",
    description: "기대 이득",
    weight: 3,
    enabled: true,
  },
  {
    id: "enjoyment",
    label: "만족도",
    description: "주관적 만족",
    weight: 3,
    enabled: true,
  },
  {
    id: "convenience",
    label: "편의성",
    description: "실행/준비의 번거로움",
    weight: 3,
    enabled: true,
  },
  {
    id: "reversibility",
    label: "되돌리기 쉬움",
    description: "취소/변경 가능성",
    weight: 3,
    enabled: true,
  },
];

const keywordMap: Record<string, string[]> = {
  cost: [
    "돈",
    "가격",
    "비용",
    "비싸",
    "비쌈",
    "비싸다",
    "저렴",
    "싸다",
    "쌈",
    "예산",
    "지출",
    "부담",
    "가성비",
    "월급",
    "생활비",
    "결제",
    "할인",
    "환불",
    "유지비",
    "고정비",
    "변동비",
  ],
  time: [
    "시간",
    "바쁨",
    "마감",
    "급함",
    "촉박",
    "늦음",
    "늦다",
    "빨리",
    "asap",
    "일정",
    "스케줄",
    "데드라인",
    "여유 없음",
    "쫓김",
    "당장",
    "지금",
    "이번 주",
    "오늘",
  ],
  effort: [
    "피곤",
    "체력",
    "힘듦",
    "귀찮",
    "번거롭",
    "힘들다",
    "지침",
    "피로",
    "부담됨",
    "벅참",
    "오래 걸림",
    "빡셈",
    "에너지",
    "집중력",
    "체력 소모",
    "녹초",
    "탈진",
  ],
  risk: [
    "리스크",
    "불안",
    "망할",
    "실패",
    "위험",
    "손해",
    "후회",
    "불확실",
    "걱정",
    "문제",
    "트러블",
    "깨짐",
    "안 될까",
    "틀릴까",
    "무서움",
    "리턴 없음",
    "복구 불가",
  ],
  enjoyment: [
    "재밌",
    "즐거움",
    "만족",
    "하고 싶다",
    "끌림",
    "흥미",
    "재미",
    "기분",
    "행복",
    "스트레스 해소",
    "쉬고 싶다",
  ],
  benefit: [
    "성장",
    "도움이",
    "배움",
    "실력",
    "경험",
    "커리어",
    "의미",
    "가치",
    "남는 게",
    "얻는 것",
    "장점",
  ],
  reversibility: [
    "취소",
    "되돌리기",
    "복구",
    "다시",
    "실험",
    "테스트",
    "한 번",
    "잠깐",
    "임시",
  ],
};

function matchAnyKeyword(context: string, keywords: string[]) {
  const lowered = context.toLowerCase();
  const noSpace = lowered.replace(/\s+/g, "");
  return keywords.some((keyword) => {
    const loweredKeyword = keyword.toLowerCase();
    const keywordNoSpace = loweredKeyword.replace(/\s+/g, "");
    return (
      lowered.includes(loweredKeyword) || noSpace.includes(keywordNoSpace)
    );
  });
}

export function buildCriteriaFromContext(context: string): Criterion[] {
  const criteria = baseCriteria.map((item) => ({ ...item }));
  const normalized = context.trim();
  if (!normalized) return criteria;

  Object.entries(keywordMap).forEach(([criterionId, keywords]) => {
    if (matchAnyKeyword(normalized, keywords)) {
      const target = criteria.find((criterion) => criterion.id === criterionId);
      if (target) target.weight = 4;
    }
  });

  return criteria;
}

export function createOption(label: string): Option {
  return {
    id: crypto.randomUUID(),
    label: label.trim(),
  };
}

export function createCriterion(label: string, description = ""): Criterion {
  return {
    id: crypto.randomUUID(),
    label: label.trim(),
    description: description.trim(),
    weight: 3,
    enabled: true,
  };
}

export function normalizeScores(
  options: Option[],
  criteria: Criterion[],
  existing: Scores = {}
): Scores {
  const next: Scores = {};
  options.forEach((option) => {
    next[option.id] = { ...existing[option.id] };
    criteria.forEach((criterion) => {
      const current = next[option.id]?.[criterion.id];
      next[option.id][criterion.id] = current ?? 3;
    });
  });
  return next;
}

export function computeTotals(options: Option[], criteria: Criterion[], scores: Scores) {
  const totals: Record<string, number> = {};
  const enabledCriteria = criteria.filter((criterion) => criterion.enabled);

  options.forEach((option) => {
    totals[option.id] = enabledCriteria.reduce((sum, criterion) => {
      const score = scores[option.id]?.[criterion.id] ?? 0;
      return sum + criterion.weight * score;
    }, 0);
  });

  return totals;
}

export function recommendOption(
  options: Option[],
  criteria: Criterion[],
  scores: Scores,
  totals: Record<string, number>
) {
  const enabledCriteria = criteria.filter((criterion) => criterion.enabled);
  const sortedOptions = [...options].sort((a, b) => {
    const totalDiff = (totals[b.id] ?? 0) - (totals[a.id] ?? 0);
    if (totalDiff !== 0) return totalDiff;

    const sortedCriteria = [...enabledCriteria].sort(
      (x, y) => y.weight - x.weight
    );
    for (const criterion of sortedCriteria) {
      const scoreDiff =
        (scores[b.id]?.[criterion.id] ?? 0) -
        (scores[a.id]?.[criterion.id] ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
    }
    return 0;
  });

  return sortedOptions[0]?.id ?? "";
}

export function topContributions(
  optionId: string,
  criteria: Criterion[],
  scores: Scores
) {
  return criteria
    .filter((criterion) => criterion.enabled)
    .map((criterion) => ({
      id: criterion.id,
      label: criterion.label,
      weight: criterion.weight,
      score: scores[optionId]?.[criterion.id] ?? 0,
    }))
    .map((entry) => ({
      ...entry,
      total: entry.weight * entry.score,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 2);
}

export function buildDraft(options: Option[], context: string): DecisionDraft {
  const criteria = buildCriteriaFromContext(context);
  return {
    title: "",
    context,
    options,
    criteria,
    scores: normalizeScores(options, criteria),
  };
}
