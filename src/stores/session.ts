import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Answer, AnalysisResult, InterviewPhase } from '@/lib/types';
import { storageGet, storageSet, storageRemove } from '@/lib/storage';

interface SessionState {
  // Identity
  id: string | null;

  // Phase drives all UI rendering
  phase: InterviewPhase;

  // Project input
  projectDescription: string;

  // Q2 analysis
  analysisResult: AnalysisResult | null;
  selectedUnitId: number | null; // null = N/A (single unit)

  // Interview progress
  answers: Answer[];
  currentQuestionIndex: number;

  // Output
  generatedSpec: string | null;

  // All answers generated at once (auto_filling phase → review phase)
  allAnswers: Answer[];

  // Timestamps (ISO strings)
  startedAt: string | null;
  completedAt: string | null;

  // Actions
  startNew: () => void;
  setPhase: (phase: InterviewPhase) => void;
  setProjectDescription: (desc: string) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setSelectedUnitId: (id: number | null) => void;
  setAllAnswers: (answers: Answer[]) => void;
  updateAllAnswer: (questionText: string, newAnswer: string) => void;
  addAnswer: (answer: Answer) => void;
  updateAnswer: (questionText: string, patch: Partial<Answer>) => void;
  nextQuestion: () => void;
  setGeneratedSpec: (spec: string) => void;
  clear: () => void;
}

// Separate type for the action methods — keeps INITIAL clean
type Actions = Pick<
  SessionState,
  | 'startNew'
  | 'setPhase'
  | 'setProjectDescription'
  | 'setAnalysisResult'
  | 'setSelectedUnitId'
  | 'setAllAnswers'
  | 'updateAllAnswer'
  | 'addAnswer'
  | 'updateAnswer'
  | 'nextQuestion'
  | 'setGeneratedSpec'
  | 'clear'
>;

const INITIAL: Omit<SessionState, keyof Actions> = {
  id: null,
  phase: 'project_input',
  projectDescription: '',
  analysisResult: null,
  selectedUnitId: null,
  answers: [],
  currentQuestionIndex: 0,
  generatedSpec: null,
  allAnswers: [],
  startedAt: null,
  completedAt: null,
};

function persist(state: Omit<SessionState, keyof Actions>) {
  storageSet('session', state);
}

export const useSessionStore = create<SessionState>((set) => {
  // Hydrate from localStorage on first access
  const saved = storageGet<Omit<SessionState, keyof Actions>>('session');
  const initial = saved ?? { ...INITIAL };

  return {
    ...initial,

    startNew: () => {
      const next = { ...INITIAL, id: nanoid(10), startedAt: new Date().toISOString() };
      persist(next);
      set(next);
    },

    setPhase: (phase) =>
      set((s) => {
        const next = { ...s, phase };
        persist(next);
        return next;
      }),

    setProjectDescription: (projectDescription) =>
      set((s) => {
        const next = { ...s, projectDescription };
        persist(next);
        return next;
      }),

    setAnalysisResult: (analysisResult) =>
      set((s) => {
        const next = { ...s, analysisResult };
        persist(next);
        return next;
      }),

    setSelectedUnitId: (selectedUnitId) =>
      set((s) => {
        const next = { ...s, selectedUnitId };
        persist(next);
        return next;
      }),

    setAllAnswers: (allAnswers) =>
      set((s) => {
        const next = { ...s, allAnswers };
        persist(next);
        return next;
      }),

    updateAllAnswer: (questionText, newAnswer) =>
      set((s) => {
        const allAnswers = s.allAnswers.map((a) =>
          a.question === questionText ? { ...a, answer: newAnswer } : a
        );
        const next = { ...s, allAnswers };
        persist(next);
        return next;
      }),

    addAnswer: (answer) =>
      set((s) => {
        const answers = [...s.answers, answer];
        const next = { ...s, answers };
        persist(next);
        return next;
      }),

    updateAnswer: (questionText, patch) =>
      set((s) => {
        const answers = s.answers.map((a) =>
          a.question === questionText ? { ...a, ...patch } : a
        );
        const next = { ...s, answers };
        persist(next);
        return next;
      }),

    nextQuestion: () =>
      set((s) => {
        const next = { ...s, currentQuestionIndex: s.currentQuestionIndex + 1 };
        persist(next);
        return next;
      }),

    setGeneratedSpec: (generatedSpec) =>
      set((s) => {
        const next = {
          ...s,
          generatedSpec,
          phase: 'done' as InterviewPhase,
          completedAt: new Date().toISOString(),
        };
        persist(next);
        return next;
      }),

    clear: () => {
      storageRemove('session');
      set({ ...INITIAL });
    },
  };
});
