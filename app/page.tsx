import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen px-6 py-10 text-[15px] text-[var(--ink)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-semibold text-white">
              DH
            </span>
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Decision Helper
              </p>
              <p className="text-lg font-semibold">투명한 결정 도우미</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm font-medium">
            <Link
              href="/dashboard"
              className="rounded-full border border-[var(--ink)]/20 px-4 py-2 transition hover:border-[var(--ink)]"
            >
              내 목록
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[var(--ink)]/20 px-4 py-2 transition hover:border-[var(--ink)]"
            >
              로그인
            </Link>
          </nav>
        </header>

        <main className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col gap-6">
            <h1 className="text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              빠르게 결정하고
              <span className="block font-[family:var(--font-display)] text-5xl md:text-6xl">
                계산은 투명하게
              </span>
              <span className="block text-3xl font-semibold md:text-4xl">
                비교표로 정리
              </span>
            </h1>
            <p className="max-w-xl text-lg text-[var(--muted)]">
              상황과 선택지를 입력하면 가중합 점수가 즉시 계산됩니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/new?fresh=1"
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(245,109,75,0.35)] transition hover:translate-y-[-2px]"
              >
                새 결정 시작
              </Link>
            </div>
            <div className="card grid gap-4 p-6">
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="rounded-full bg-[var(--accent-2)] px-3 py-1 text-white">
                  비교표 중심
                </span>
                <span className="text-[var(--muted)]">
                  3단계 플로우로 빠른 결정
                </span>
              </div>
              <div className="grid gap-3 text-sm text-[var(--muted)]">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                  <p>기준과 가중치 설정 후 투명한 계산식 공개</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                  <p>가중합 점수와 기여도 상위 2개 기준까지 확인</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                  <p>로그인 후 저장, 링크 공유로 읽기 전용 열람</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card relative p-6">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--accent)]/20 blur-2xl" />
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                <span>DEMO SNAPSHOT</span>
                <span className="rounded-full border border-[var(--ink)]/10 px-2 py-1">
                  결과 미리보기
                </span>
              </div>
              <h2 className="text-2xl font-semibold">오늘 저녁 뭐할까?</h2>
              <div className="grid gap-3 text-sm text-[var(--muted)]">
                <p>피곤한데 뒤처진 느낌도 있어.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "공부",
                    "운동",
                    "친구 만나기",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--ink)]/15 bg-white/80 px-3 py-1"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-2 rounded-2xl border border-[var(--ink)]/10 bg-white/80 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">추천 결과</span>
                  <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">
                    운동
                  </span>
                </div>
                <p className="text-[var(--muted)]">
                  비용, 노력/피로, 만족도가 큰 영향을 미쳤어요.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
