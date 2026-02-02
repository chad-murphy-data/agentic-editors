'use client';

import { useState } from 'react';
import * as Diff from 'diff';

interface DiffViewerProps {
  original: string;
  revised: string;
  originalLabel?: string;
  revisedLabel?: string;
}

type ViewMode = 'diff' | 'side-by-side' | 'final';

export function DiffViewer({
  original,
  revised,
  originalLabel = 'Original',
  revisedLabel = 'Revised',
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('diff');

  // Generate word-level diff
  const diffParts = Diff.diffWords(original, revised);

  // Count changes
  const additions = diffParts.filter((p) => p.added).length;
  const removals = diffParts.filter((p) => p.removed).length;

  const renderDiffView = () => (
    <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap">
      {diffParts.map((part, index) => {
        if (part.added) {
          return (
            <span
              key={index}
              className="bg-green-100 text-green-800 px-0.5 rounded"
            >
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span
              key={index}
              className="bg-red-100 text-red-800 line-through px-0.5 rounded"
            >
              {part.value}
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </div>
  );

  const renderSideBySide = () => (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
          {originalLabel}
        </h4>
        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap p-3 bg-gray-50 rounded-lg border border-gray-200">
          {original}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
          {revisedLabel}
        </h4>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap p-3 bg-white rounded-lg border border-gray-200">
          {revised}
        </div>
      </div>
    </div>
  );

  const renderFinalView = () => (
    <div className="p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
      {revised}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-gray-700">Document Changes</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
              +{additions} additions
            </span>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">
              -{removals} removals
            </span>
          </div>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('diff')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'diff'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Diff
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Side by Side
          </button>
          <button
            onClick={() => setViewMode('final')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'final'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Final Only
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {viewMode === 'diff' && renderDiffView()}
        {viewMode === 'side-by-side' && renderSideBySide()}
        {viewMode === 'final' && renderFinalView()}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
        <span>Original: {original.split(/\s+/).length} words</span>
        <span>Revised: {revised.split(/\s+/).length} words</span>
      </div>
    </div>
  );
}
