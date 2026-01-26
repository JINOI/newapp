"use client";

import type { Criterion, Option, Scores } from "../lib/types";

type DecisionTableProps = {
  mode: "editable" | "readonly";
  options: Option[];
  criteria: Criterion[];
  scores: Scores;
  onScoreChange?: (optionId: string, criterionId: string, value: number) => void;
};

export default function DecisionTable({
  mode,
  options,
  criteria,
  scores,
  onScoreChange,
}: DecisionTableProps) {
  const enabledCriteria = criteria.filter((criterion) => criterion.enabled);

  return (
    <div className="table-surface overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-[var(--ink)]/5 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3">기준</th>
            <th className="px-4 py-3">Weight</th>
            {options.map((option) => (
              <th key={option.id} className="px-4 py-3">
                {option.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {enabledCriteria.map((criterion) => (
            <tr key={criterion.id} className="border-t border-[var(--ink)]/10">
              <td className="px-4 py-4">
                <div className="font-semibold">{criterion.label}</div>
                {criterion.description && (
                  <div className="text-xs text-[var(--muted)]">
                    {criterion.description}
                  </div>
                )}
              </td>
              <td className="px-4 py-4 text-sm font-semibold">
                {criterion.weight}
              </td>
              {options.map((option) => {
                const value = scores[option.id]?.[criterion.id] ?? 3;
                return (
                  <td key={`${option.id}-${criterion.id}`} className="px-4 py-4">
                    {mode === "readonly" ? (
                      <span className="rounded-full border border-[var(--ink)]/20 px-3 py-1 text-sm">
                        {value}
                      </span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={1}
                          max={5}
                          step={1}
                          value={value}
                          onChange={(event) =>
                            onScoreChange?.(
                              option.id,
                              criterion.id,
                              Number(event.target.value)
                            )
                          }
                          className="w-24 accent-[var(--accent)]"
                        />
                        <span className="w-6 text-center text-sm font-semibold">
                          {value}
                        </span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
