'use client';

import { useState } from 'react';
import { usePipeline } from '@/hooks/usePipeline';
import { PipelineTracker } from '@/components/PipelineTracker';
import { DocumentViewer } from '@/components/DocumentViewer';
import { EditorFeedbackPanel } from '@/components/EditorFeedback';
import { BuyerPanel } from '@/components/BuyerPanel';
import { DiffViewer } from '@/components/DiffViewer';

export default function Home() {
  const {
    state,
    startPipeline,
    runEditors,
    updateFeedback,
    acceptAllFeedback,
    runRevisionStep,
    startNewRound,
    letItCook,
    viewRound,
    getCurrentRound,
  } = usePipeline();

  const [documentInput, setDocumentInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [highlightedSections, setHighlightedSections] = useState<string[]>([]);
  const [letItCookRounds, setLetItCookRounds] = useState(3);
  const [showLetItCookModal, setShowLetItCookModal] = useState(false);

  const currentRound = getCurrentRound();

  const handleStartPipeline = async () => {
    if (!documentInput.trim()) return;
    await startPipeline(documentInput, goalInput || undefined);
  };

  const handleRunEditors = async () => {
    await runEditors();
  };

  const handleContinueToRevision = async () => {
    await runRevisionStep();
  };

  const handleStartNewRound = () => {
    startNewRound();
  };

  const handleLetItCook = async () => {
    setShowLetItCookModal(false);
    await letItCook(letItCookRounds);
  };

  // Render different content based on current stage
  const renderStageContent = () => {
    // Draft stage - input form
    if (state.currentStage === 'draft') {
      if (!currentRound) {
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Paste Your Document
                </h2>
                <textarea
                  value={documentInput}
                  onChange={(e) => setDocumentInput(e.target.value)}
                  placeholder="Paste your document here..."
                  className="w-full h-64 p-4 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Document Goal (optional)
                  </label>
                  <input
                    type="text"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="e.g., Convince the leadership team to adopt this framework"
                    className="w-full p-3 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleStartPipeline}
                  disabled={!documentInput.trim()}
                  className="mt-4 w-full px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Start Refinement Pipeline
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Round started, show document and option to run editors
      return (
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1">
            <DocumentViewer
              document={currentRound.inputDocument}
              label={`Round ${state.currentRound} - Input Document`}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRunEditors}
              disabled={state.isProcessing}
              className="flex-1 px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {state.isProcessing ? 'Running Editors...' : 'Run Editors'}
            </button>
            <button
              onClick={() => setShowLetItCookModal(true)}
              className="px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Let it Cook
            </button>
          </div>
        </div>
      );
    }

    // Editors running
    if (state.currentStage === 'editors') {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-700">Running Editors</h2>
            <p className="text-sm text-gray-500 mt-2">
              Skeptic, BeSci, and Clarity are reviewing your document...
            </p>
          </div>
        </div>
      );
    }

    // Review stage - split view
    if (state.currentStage === 'review' && currentRound) {
      return (
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          <div className="min-h-0 overflow-hidden">
            <EditorFeedbackPanel
              feedback={currentRound.editorFeedback}
              onFeedbackUpdate={updateFeedback}
              onAcceptAll={acceptAllFeedback}
              onContinue={handleContinueToRevision}
              isProcessing={state.isProcessing}
              onHighlight={setHighlightedSections}
            />
          </div>
          <div className="min-h-0 overflow-hidden">
            <DocumentViewer
              document={currentRound.inputDocument}
              highlightedSections={highlightedSections}
              label="Document"
            />
          </div>
        </div>
      );
    }

    // Revision stage - loading
    if (state.currentStage === 'revision') {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-700">Revising Document</h2>
            <p className="text-sm text-gray-500 mt-2">
              Applying feedback and voice pass...
            </p>
          </div>
        </div>
      );
    }

    // Buyers stage - loading
    if (state.currentStage === 'buyers') {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-700">Getting Buyer Reactions</h2>
            <p className="text-sm text-gray-500 mt-2">
              CEO, CPO, CRO, and Head of CX are reading...
            </p>
          </div>
        </div>
      );
    }

    // Synthesis stage - show buyers and diff view
    if (state.currentStage === 'synthesis' && currentRound) {
      const finalDocument = currentRound.voicePassedDocument || currentRound.revisedDocument || '';
      const originalDocument = currentRound.inputDocument;

      return (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
            <div className="min-h-0 overflow-auto">
              <DiffViewer
                original={originalDocument}
                revised={finalDocument}
                originalLabel="Original (this round)"
                revisedLabel="After revision + voice pass"
              />
            </div>
            <div className="min-h-0 overflow-auto">
              <BuyerPanel
                reactions={currentRound.buyerReactions}
                isLoading={state.isProcessing}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleStartNewRound}
              className="flex-1 px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Another Round
            </button>
            <button
              onClick={() => setShowLetItCookModal(true)}
              className="px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Let it Cook
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Document Refinement</h1>
                <p className="text-xs text-gray-500">AI-powered editing pipeline</p>
              </div>
            </div>
            {state.letItCookMode && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                Cooking... Round {state.currentRound} of {state.letItCookRounds}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col min-h-0">
        {currentRound && (
          <PipelineTracker
            currentStage={state.currentStage}
            currentRound={state.currentRound}
            totalRounds={state.rounds.length}
            onRoundChange={viewRound}
          />
        )}

        {state.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.error}
          </div>
        )}

        {renderStageContent()}
      </main>

      {/* Let it Cook Modal */}
      {showLetItCookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Let it Cook</h2>
            <p className="text-sm text-gray-500 mb-4">
              Run multiple rounds autonomously. The system will auto-accept all editor feedback each round.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Number of rounds
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={letItCookRounds}
                onChange={(e) => setLetItCookRounds(Number(e.target.value))}
                className="w-full p-3 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLetItCookModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLetItCook}
                className="flex-1 px-4 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                Start Cooking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
