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
    "금액",
    "액수",
    "단가",
    "총액",
    "원가",
    "정가",
    "시세",
    "물가",
    "인상",
    "인하",
    "폭등",
    "폭락",
    "오른다",
    "내린다",
    "고가",
    "저가",
    "프리미엄",
    "지불",
    "카드값",
    "청구",
    "청구서",
    "영수증",
    "송금",
    "이체",
    "입금",
    "출금",
    "선결제",
    "후불",
    "할부",
    "무이자",
    "일시불",
    "자동이체",
    "구독",
    "정기결제",
    "결제일",
    "운영비",
    "관리비",
    "사용료",
    "이용료",
    "수수료",
    "인건비",
    "재료비",
    "교통비",
    "식비",
    "숙박비",
    "렌탈",
    "대여",
    "임대",
    "보증금",
    "월세",
    "연회비",
    "가입비",
    "세금",
    "부가세",
    "관세",
    "배송비",
    "배달비",
    "택배비",
    "추가요금",
    "옵션비",
    "숨은비용",
    "비용발생",
    "절약",
    "아끼다",
    "과소비",
    "돈나감",
    "돈깨짐",
    "쿠폰",
    "프로모션",
    "이벤트가",
    "특가",
    "캐시백",
    "적립",
    "포인트",
    "취소수수료",
    "위약금",
    "환불불가",
    "반환",
    "반품",
    "교환",
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
    "긴급",
    "급히",
    "급하게",
    "즉시",
    "당일",
    "오늘내",
    "내일까지",
    "서둘러",
    "재촉",
    "코앞",
    "코앞임",
    "기한",
    "기한내",
    "제출",
    "제출기한",
    "마감일",
    "D-day",
    "기한지남",
    "늦을듯",
    "일정잡기",
    "조율",
    "약속",
    "미팅",
    "회의",
    "면접",
    "수업",
    "출근",
    "통학",
    "겹침",
    "겹쳐",
    "충돌",
    "시간없다",
    "시간없음",
    "시간 없",
    "여유없다",
    "여유없음",
    "틈이없다",
    "짬이없다",
    "딜레이",
    "지연",
    "늦어짐",
    "밀림",
    "대기",
    "기다림",
    "소요",
    "소요시간",
    "걸리는시간",
    "단시간",
    "반나절",
    "하루종일",
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
    "컨디션",
    "지치다",
    "지쳐",
    "기운없",
    "무기력",
    "번아웃",
    "멘붕",
    "졸림",
    "잠와",
    "수면부족",
    "번거로움",
    "손이많이감",
    "손이",
    "절차가많다",
    "단계가많다",
    "복잡",
    "번잡",
    "난이도",
    "노가다",
    "반복작업",
    "작업량",
    "할일많다",
    "공수",
    "리소스",
    "투입",
    "품",
    "품이듦",
    "손품",
    "발품",
    "집중안됨",
    "머리아픔",
    "신경쓰임",
    "압박",
    "부담감",
    "버겁",
    "힘빠짐",
    "지긋지긋",
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
    "터짐",
    "터졌다",
    "오류",
    "에러",
    "버그",
    "문제생김",
    "장애",
    "다운",
    "먹통",
    "꼬임",
    "망가짐",
    "손상",
    "유실",
    "데이터날림",
    "애매",
    "확신없",
    "찜찜",
    "꺼림칙",
    "규정",
    "정책",
    "약관",
    "위반",
    "제재",
    "밴",
    "신고",
    "저작권",
    "법적",
    "평판",
    "이미지",
    "신뢰하락",
    "보안",
    "해킹",
    "유출",
    "개인정보",
    "계정",
    "도용",
    "피싱",
    "스팸",
    "돌이킬수없",
    "치명적",
    "큰일",
    "돌발",
    "폭탄",
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
    "신남",
    "설렘",
    "기대",
    "뿌듯",
    "만족감",
    "재밌다",
    "재밌을듯",
    "끌린다",
    "땡긴다",
    "하고싶어",
    "휴식",
    "힐링",
    "리프레시",
    "기분전환",
    "스트레스풀",
    "놀고싶",
    "여행가고싶",
    "취향",
    "내스타일",
    "마음에듦",
    "맘에들",
    "만족스럽",
    "노잼",
    "재미없",
    "하기싫",
    "별로",
    "지겹",
    "질림",
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
    "배우다",
    "학습",
    "공부",
    "익히다",
    "숙련",
    "실력늘",
    "실력향상",
    "훈련",
    "인사이트",
    "깨달음",
    "이해",
    "성과",
    "효율",
    "생산성",
    "시간절약",
    "자동화",
    "최적화",
    "유용",
    "이득",
    "이점",
    "메리트",
    "스펙",
    "포트폴리오",
    "이력서",
    "경력",
    "어필",
    "취업",
    "이직",
    "승진",
    "네트워킹",
    "인맥",
    "레퍼런스",
    "남는거",
    "얻는다",
    "발전",
    "수익",
    "돈된다",
    "ROI",
    "투자대비",
    "효과좋",
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
    "롤백",
    "복원",
    "리셋",
    "원복",
    "백업",
    "스냅샷",
    "체크포인트",
    "세이브",
    "시범",
    "파일럿",
    "트라이",
    "찍먹",
    "맛보기",
    "프로토타입",
    "PoC",
    "베타",
    "체험판",
    "안전장치",
    "보험",
    "플랜B",
    "대안",
    "예비",
    "대비",
    "철회",
    "중단",
    "그만두다",
    "접다",
    "빠져나오다",
    "무난",
    "안정",
    "안정적",
    "리스크적다",
    "부담적다",
    "가볍게",
    "가볍다",
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

export function applyKeywordWeights(
  criteria: Criterion[],
  context: string
): Criterion[] {
  const normalized = context.trim();
  const next = criteria.map((item) => ({ ...item }));
  if (!normalized) return next;

  Object.entries(keywordMap).forEach(([criterionId, keywords]) => {
    if (matchAnyKeyword(normalized, keywords)) {
      const target = next.find((criterion) => criterion.id === criterionId);
      if (target) target.weight = Math.max(target.weight, 4);
    }
  });

  return next;
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
