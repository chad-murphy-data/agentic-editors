'use client';

import { useState, useCallback } from 'react';
import {
  PipelineState,
  PipelineStage,
  EditorFeedback,
  RoundState,
  BuyerReaction,
} from '@/types/pipeline';
import {
  runSkeptic,
  runBeSci,
  runClarity,
  runRevision,
  runVoicePass,
  runCEO,
  runCPO,
  runCRO,
  runHeadCX,
} from '@/agents';

const initialState: PipelineState = {
  currentStage: 'draft',
  currentRound: 1,
  rounds: [],
  isProcessing: false,
  letItCookMode: false,
};

export function usePipeline() {
  const [state, setState] = useState<PipelineState>(initialState);

  const setStage = useCallback((stage: PipelineStage) => {
    setState((prev) => ({ ...prev, currentStage: stage }));
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    setState((prev) => ({ ...prev, isProcessing }));
  }, []);

  const setError = useCallback((error?: string) => {
    setState((prev) => ({ ...prev, error, isProcessing: false }));
  }, []);

  // Start a new document through the pipeline
  const startPipeline = useCallback(
    async (document: string, goal?: string) => {
      setState((prev) => ({
        ...prev,
        currentStage: 'draft',
        currentRound: 1,
        documentGoal: goal,
        rounds: [
          {
            roundNumber: 1,
            inputDocument: document,
            editorFeedback: [],
            acceptedFeedback: [],
            buyerReactions: [],
            timestamp: new Date(),
          },
        ],
        isProcessing: false,
        error: undefined,
      }));
    },
    []
  );

  // Run editors in parallel
  const runEditors = useCallback(async () => {
    setProcessing(true);
    setStage('editors');

    try {
      const currentRound = state.rounds[state.currentRound - 1];
      const document = currentRound.inputDocument;
      const goal = state.documentGoal;

      // Run all three editors in parallel
      const [skepticResult, besciResult, clarityResult] = await Promise.all([
        runSkeptic(document, goal),
        runBeSci(document, goal),
        runClarity(document, goal),
      ]);

      // Combine and ID all feedback
      const allFeedback: EditorFeedback[] = [
        ...skepticResult.feedback.map((f, i) => ({
          ...f,
          id: `skeptic-${i}`,
          editor: 'skeptic' as const,
          status: 'pending' as const,
        })),
        ...besciResult.feedback.map((f, i) => ({
          ...f,
          id: `besci-${i}`,
          editor: 'besci' as const,
          status: 'pending' as const,
        })),
        ...clarityResult.feedback.map((f, i) => ({
          ...f,
          id: `clarity-${i}`,
          editor: 'clarity' as const,
          status: 'pending' as const,
        })),
      ];

      setState((prev) => {
        const updatedRounds = [...prev.rounds];
        updatedRounds[prev.currentRound - 1] = {
          ...updatedRounds[prev.currentRound - 1],
          editorFeedback: allFeedback,
        };
        return {
          ...prev,
          rounds: updatedRounds,
          currentStage: 'review',
          isProcessing: false,
        };
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Editor run failed');
    }
  }, [state.rounds, state.currentRound, state.documentGoal, setProcessing, setStage, setError]);

  // Update feedback decisions
  const updateFeedback = useCallback((feedback: EditorFeedback[]) => {
    setState((prev) => {
      const updatedRounds = [...prev.rounds];
      updatedRounds[prev.currentRound - 1] = {
        ...updatedRounds[prev.currentRound - 1],
        editorFeedback: feedback,
      };
      return { ...prev, rounds: updatedRounds };
    });
  }, []);

  // Accept all pending feedback
  const acceptAllFeedback = useCallback(() => {
    setState((prev) => {
      const updatedRounds = [...prev.rounds];
      const currentRoundData = updatedRounds[prev.currentRound - 1];
      updatedRounds[prev.currentRound - 1] = {
        ...currentRoundData,
        editorFeedback: currentRoundData.editorFeedback.map((f) =>
          f.status === 'pending' ? { ...f, status: 'accepted' } : f
        ),
      };
      return { ...prev, rounds: updatedRounds };
    });
  }, []);

  // Run revision with accepted feedback
  const runRevisionStep = useCallback(async () => {
    setProcessing(true);
    setStage('revision');

    try {
      const currentRound = state.rounds[state.currentRound - 1];
      const acceptedFeedback = currentRound.editorFeedback.filter(
        (f) => f.status === 'accepted' || f.status === 'edited' || f.status === 'responded'
      );

      // Run revision
      const revisionResult = await runRevision(
        currentRound.inputDocument,
        acceptedFeedback,
        state.documentGoal
      );

      // Run voice pass
      const voiceResult = await runVoicePass(revisionResult.revisedDocument);

      setState((prev) => {
        const updatedRounds = [...prev.rounds];
        updatedRounds[prev.currentRound - 1] = {
          ...updatedRounds[prev.currentRound - 1],
          acceptedFeedback,
          revisedDocument: revisionResult.revisedDocument,
          voicePassedDocument: voiceResult.document,
        };
        return {
          ...prev,
          rounds: updatedRounds,
          isProcessing: false,
        };
      });

      // Automatically run buyers after revision
      await runBuyersStep();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Revision failed');
    }
  }, [state.rounds, state.currentRound, state.documentGoal, setProcessing, setStage, setError]);

  // Run buyers in parallel
  const runBuyersStep = useCallback(async () => {
    setProcessing(true);
    setStage('buyers');

    try {
      const currentRound = state.rounds[state.currentRound - 1];
      const document = currentRound.voicePassedDocument || currentRound.revisedDocument || currentRound.inputDocument;

      // Run all four buyers in parallel
      const [ceoResult, cpoResult, croResult, headCxResult] = await Promise.all([
        runCEO(document),
        runCPO(document),
        runCRO(document),
        runHeadCX(document),
      ]);

      const buyerReactions: BuyerReaction[] = [
        { buyer: 'ceo', ...ceoResult },
        { buyer: 'cpo', ...cpoResult },
        { buyer: 'cro', ...croResult },
        { buyer: 'head-cx', ...headCxResult },
      ];

      setState((prev) => {
        const updatedRounds = [...prev.rounds];
        updatedRounds[prev.currentRound - 1] = {
          ...updatedRounds[prev.currentRound - 1],
          buyerReactions,
        };
        return {
          ...prev,
          rounds: updatedRounds,
          currentStage: 'synthesis',
          isProcessing: false,
        };
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Buyer reactions failed');
    }
  }, [state.rounds, state.currentRound, setProcessing, setStage, setError]);

  // Start a new round
  const startNewRound = useCallback(() => {
    const prevRound = state.rounds[state.currentRound - 1];
    const newRoundNumber = state.currentRound + 1;

    setState((prev) => ({
      ...prev,
      currentRound: newRoundNumber,
      currentStage: 'draft',
      rounds: [
        ...prev.rounds,
        {
          roundNumber: newRoundNumber,
          inputDocument: prevRound.voicePassedDocument || prevRound.revisedDocument || prevRound.inputDocument,
          editorFeedback: [],
          acceptedFeedback: [],
          buyerReactions: [],
          timestamp: new Date(),
        },
      ],
    }));
  }, [state.rounds, state.currentRound]);

  // Let it cook mode - run multiple rounds autonomously
  const letItCook = useCallback(
    async (numRounds: number) => {
      setState((prev) => ({
        ...prev,
        letItCookMode: true,
        letItCookRounds: numRounds,
      }));

      for (let i = 0; i < numRounds; i++) {
        // Run editors
        await runEditors();

        // Auto-accept all feedback
        acceptAllFeedback();

        // Run revision and buyers
        await runRevisionStep();

        // Start new round if not last
        if (i < numRounds - 1) {
          startNewRound();
        }
      }

      setState((prev) => ({
        ...prev,
        letItCookMode: false,
      }));
    },
    [runEditors, acceptAllFeedback, runRevisionStep, startNewRound]
  );

  // View a specific round
  const viewRound = useCallback((roundNumber: number) => {
    setState((prev) => ({
      ...prev,
      currentRound: roundNumber,
    }));
  }, []);

  // Get current round data
  const getCurrentRound = useCallback((): RoundState | undefined => {
    return state.rounds[state.currentRound - 1];
  }, [state.rounds, state.currentRound]);

  // Reset pipeline
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    startPipeline,
    runEditors,
    updateFeedback,
    acceptAllFeedback,
    runRevisionStep,
    runBuyersStep,
    startNewRound,
    letItCook,
    viewRound,
    getCurrentRound,
    reset,
  };
}
