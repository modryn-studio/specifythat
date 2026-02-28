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
 * v2 flow: project_input → analyzing → (unit_picker?) → auto_filling → review → generating → done
 *
 * Components read from useSessionStore directly; this hook exposes actions.
 */
export function useInterviewSession() {
  const session = useSessionStore();
  const { addSpec } = useSpecsStore();

  // Prevent duplicate in-flight AI requests
  const aiInFlight = useRef(false);

  const [rateLimited, setRateLimited] = useState(false);
  const [autoFillError, setAutoFillError] = useState(false);

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
          aiInFlight.current = false;
        } else {
          // Single unit — batch-generate all answers
          aiInFlight.current = false;
          await generateAllAnswers(description, result.summary);
        }
      } catch {
        const fallback: AnalysisResult = { type: 'single', summary: description.trim() };
        session.setAnalysisResult(fallback);
        aiInFlight.current = false;
        await generateAllAnswers(description, description.trim());
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session]
  );

  // ─── Phase: unit_picker → auto_filling ──────────────────────

  const selectUnit = useCallback(
    async (unitId: number) => {
      session.setSelectedUnitId(unitId);
      const desc = session.projectDescription;
      const units =
        session.analysisResult?.type === 'multiple' ? session.analysisResult.units : [];
      const unit = units.find((u) => u.id === unitId);
      await generateAllAnswers(desc, unit?.description ?? desc);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session]
  );

  // ─── Phase: auto_filling ──────────────────────────────────────

  const generateAllAnswers = useCallback(
    async (description: string, summary: string): Promise<void> => {
      session.setPhase('auto_filling');
      setAutoFillError(false);

      try {
        const res = await fetch('/api/generate-all-answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectDescription: description, projectSummary: summary }),
        });

        const data = await res.json();

        if (res.status === 429) {
          analytics.rateLimitHit({ route: 'generate-all-answers' });
          setRateLimited(true);
          session.setPhase('project_input');
          return;
        }

        if (!res.ok) throw new Error(data.error || 'Auto-fill failed');

        const answers: Answer[] = data.answers;
        session.setAllAnswers(answers);
        session.setPhase('review');
      } catch {
        setAutoFillError(true);
        session.setPhase('project_input');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session]
  );

  // ─── Phase: review — edit individual answers ──────────────────

  const updateReviewAnswer = useCallback(
    (questionText: string, newAnswer: string) => {
      session.updateAllAnswer(questionText, newAnswer);
    },
    [session]
  );

  const submitReview = useCallback(async () => {
    // generateSpec reads allAnswers when answers array is empty (review flow)
    await generateSpec();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

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

    // Use allAnswers if we came from the review flow, else per-question answers
    const answersToUse =
      session.allAnswers.length > 0 && session.answers.length === 0
        ? session.allAnswers
        : session.answers;

    try {
      const res = await fetch('/api/generate-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersToUse }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Spec generation failed');

      const spec: string = data.spec;

      const projectNameAnswer = answersToUse.find(
        (a) => a.question === questions[0].text
      );
      const projectName = projectNameAnswer?.answer || 'Untitled Project';

      addSpec(projectName, spec, answersToUse);
      session.setGeneratedSpec(spec);

      analytics.specGenerated();
    } catch {
      session.setPhase('review');
    }
  }, [session, addSpec]);

  // ─── Computed helpers ──────────────────────────────────────────

  const currentQuestion = questions[session.currentQuestionIndex] ?? null;
  const progress =
    totalQuestions > 0 ? Math.round((session.currentQuestionIndex / totalQuestions) * 100) : 0;
  const isLastQuestion = session.currentQuestionIndex === totalQuestions - 1;

  return {
    isRateLimited: rateLimited,
    autoFillError,
    phase: session.phase,
    answers: session.answers,
    allAnswers: session.allAnswers,
    currentQuestionIndex: session.currentQuestionIndex,
    currentQuestion,
    analysisResult: session.analysisResult,
    generatedSpec: session.generatedSpec,
    progress,
    isLastQuestion,

    startSession,
    analyzeProject,
    selectUnit,
    generateAllAnswers,
    updateReviewAnswer,
    submitReview,
    submitAnswer,
    acceptAIAnswer,
    generateAnswer,
    generateSpec,
    clearSession: session.clear,
  };
}
