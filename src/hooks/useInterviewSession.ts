'use client';

import { useCallback, useRef, useState } from 'react';
import { useSessionStore } from '@/stores/session';
import { useSpecsStore } from '@/stores/specs';
import { questions, totalQuestions } from '@/lib/questions';
import { Answer, AnalysisResult } from '@/lib/types';
import { analytics } from '@/lib/analytics';

/**
 * useInterviewSession — state machine for the interview flow.
 *
 * Drives all phase transitions. Components read from useSessionStore directly;
 * this hook exposes actions that advance the machine.
 */
export function useInterviewSession() {
  const session = useSessionStore();
  const { addSpec } = useSpecsStore();

  // Prevent duplicate in-flight AI requests
  const aiInFlight = useRef(false);

  // Exposed so the UI can show the right message instead of a generic error
  const [rateLimited, setRateLimited] = useState(false);

  // ─── Phase: project_input ──────────────────────────────────────

  const startSession = useCallback(() => {
    session.startNew();
    analytics.interviewStarted();
  }, [session]);

  // ─── Phase: analyzing → unit_picker | interview ────────────────

  const analyzeProject = useCallback(
    async (description: string, docContent?: string): Promise<void> => {
      if (aiInFlight.current) return;
      aiInFlight.current = true;

      session.setProjectDescription(description);
      session.setPhase('analyzing');

      try {
        const res = await fetch('/api/analyze-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectDescription: description,
            attachedDocContent: docContent,
          }),
        });

        const data = await res.json();

        if (res.status === 429) {
          // Rate limit hit — surface to UI, do not fall back silently
          analytics.rateLimitHit({ route: 'analyze-project' });
          setRateLimited(true);
          session.setPhase('project_input');
          aiInFlight.current = false;
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || 'Analysis failed');
        }

        const result: AnalysisResult = data.result;
        session.setAnalysisResult(result);

        if (result.type === 'multiple') {
          session.setPhase('unit_picker');
        } else {
          // Single unit — jump straight into interview
          session.setPhase('interview');
        }
      } catch (err) {
        // Fall back: treat description as-is (single unit)
        const fallback: AnalysisResult = {
          type: 'single',
          summary: description.trim(),
        };
        session.setAnalysisResult(fallback);
        session.setPhase('interview');
      } finally {
        aiInFlight.current = false;
      }
    },
    [session]
  );

  // ─── Phase: unit_picker → interview ───────────────────────────

  const selectUnit = useCallback(
    (unitId: number) => {
      session.setSelectedUnitId(unitId);
      session.setPhase('interview');
    },
    [session]
  );

  // ─── Phase: interview — per-question actions ───────────────────

  /** User typed their own answer — save and advance. */
  const submitAnswer = useCallback(
    (answer: string) => {
      const q = questions[session.currentQuestionIndex];
      if (!q) return;

      const entry: Answer = {
        question: q.text,
        answer: answer.trim(),
        isAIGenerated: false,
      };

      session.addAnswer(entry);
      advanceOrFinish();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session]
  );

  /** AI generated an answer — save and advance. */
  const acceptAIAnswer = useCallback(
    (answer: string) => {
      const q = questions[session.currentQuestionIndex];
      if (!q) return;

      const entry: Answer = {
        question: q.text,
        answer: answer.trim(),
        isAIGenerated: true,
      };

      session.addAnswer(entry);
      advanceOrFinish();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session]
  );

  /** Ask AI to generate an answer for the current question. */
  const generateAnswer = useCallback(
    async (userInput: string): Promise<string> => {
      if (aiInFlight.current) return '';
      aiInFlight.current = true;

      const q = questions[session.currentQuestionIndex];
      if (!q) {
        aiInFlight.current = false;
        return '';
      }

      try {
        const res = await fetch('/api/generate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q.text,
            conversationContext: session.answers,
            userInput,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Generation failed');

        return data.answer as string;
      } finally {
        aiInFlight.current = false;
      }
    },
    [session]
  );

  // ─── Phase: interview → generating → done ─────────────────────

  function advanceOrFinish() {
    const nextIndex = session.currentQuestionIndex + 1;
    if (nextIndex >= totalQuestions) {
      generateSpec();
    } else {
      session.nextQuestion();
    }
  }

  const generateSpec = useCallback(async () => {
    session.setPhase('generating');

    try {
      const res = await fetch('/api/generate-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: session.answers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Spec generation failed');

      const spec: string = data.spec;

      // Save to spec history
      const projectNameAnswer = session.answers.find(
        (a) => a.question === questions[0].text
      );
      const projectName = projectNameAnswer?.answer || 'Untitled Project';

      addSpec(projectName, spec, session.answers);
      session.setGeneratedSpec(spec); // also sets phase to 'done'

      analytics.specGenerated();
    } catch (err) {
      // Don't leave user stuck in 'generating' — fall back to interview phase
      session.setPhase('interview');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, addSpec]);

  // ─── Computed helpers ──────────────────────────────────────────

  const currentQuestion = questions[session.currentQuestionIndex] ?? null;
  const progress =
    totalQuestions > 0 ? Math.round((session.currentQuestionIndex / totalQuestions) * 100) : 0;
  const isLastQuestion = session.currentQuestionIndex === totalQuestions - 1;

  return {
    // State
    isRateLimited: rateLimited,
    // State (read from store directly for reactivity)
    phase: session.phase,
    answers: session.answers,
    currentQuestionIndex: session.currentQuestionIndex,
    currentQuestion,
    analysisResult: session.analysisResult,
    generatedSpec: session.generatedSpec,
    progress,
    isLastQuestion,

    // Actions
    startSession,
    analyzeProject,
    selectUnit,
    submitAnswer,
    acceptAIAnswer,
    generateAnswer,
    generateSpec,
    clearSession: session.clear,
  };
}
