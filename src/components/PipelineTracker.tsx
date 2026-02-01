'use client';

import { PipelineStage } from '@/types/pipeline';

interface PipelineTrackerProps {
  currentStage: PipelineStage;
  currentRound: number;
  totalRounds: number;
  onRoundChange: (round: number) => void;
}

const stages: { key: PipelineStage; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'editors', label: 'Editors' },
  { key: 'review', label: 'Review' },
  { key: 'revision', label: 'Revision' },
  { key: 'buyers', label: 'Buyers' },
  { key: 'synthesis', label: 'Synthesis' },
];

export function PipelineTracker({
  currentStage,
  currentRound,
  totalRounds,
  onRoundChange,
}: PipelineTrackerProps) {
  const currentIndex = stages.findIndex((s) => s.key === currentStage);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-600">Pipeline Progress</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="round-select" className="text-sm text-gray-500">
            Round:
          </label>
          <select
            id="round-select"
            value={currentRound}
            onChange={(e) => onRoundChange(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: totalRounds }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Round {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={stage.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-200
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-100' : ''}
                    ${isPending ? 'bg-gray-100 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : isCurrent ? (
                    <span className="w-2 h-2 bg-white rounded-full" />
                  ) : (
                    <span className="w-2 h-2 bg-gray-300 rounded-full" />
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium
                    ${isCompleted ? 'text-green-600' : ''}
                    ${isCurrent ? 'text-blue-600' : ''}
                    ${isPending ? 'text-gray-400' : ''}
                  `}
                >
                  {stage.label}
                </span>
              </div>

              {index < stages.length - 1 && (
                <div
                  className={`
                    h-0.5 flex-1 mx-2 mt-[-1.5rem]
                    ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
