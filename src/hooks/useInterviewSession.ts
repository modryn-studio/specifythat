'use client';

import { useState, useCallback } from 'react';
import { InterviewSession, Answer, AnalysisResult, BuildableUnit, GeneratedAnswer } from '@/lib/types';
import { questions, totalQuestions } from '@/lib/questions';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Interview modes
export type InterviewMode = 'interview' | 'ideation';

// Flow phases for the new streamlined experience
export type FlowPhase = 
  | 'description'      // Q2 - project description input
  | 'analyzing'        // Analyzing Q2 for buildable units
  | 'unit-selection'   // If multiple units detected
  | 'auto-generating'  // Auto-generating Q3-Q13 answers
  | 'review'           // Review all answers in accordion
  | 'generating-spec'  // Generating final spec
  | 'complete';        // Show final spec

interface ExtendedSession extends InterviewSession {
  projectSummary: string;
  wasMultiUnit: boolean;
  selectedUnitId: number | null;
  allUnits?: BuildableUnit[];
  projectName: string; // Auto-generated project name
  generatedAnswers: GeneratedAnswer[]; // All auto-generated answers
}

export function useInterviewSession() {
  const [session, setSession] = useState<ExtendedSession>({
    id: generateUUID(),
    currentQuestionIndex: 0,
    answers: [],
    status: 'in_progress',
    createdAt: new Date(),
    projectSummary: '',
    wasMultiUnit: false,
    selectedUnitId: null,
    allUnits: undefined,
    projectName: '',
    generatedAnswers: [],
  });
  
  const [phase, setPhase] = useState<FlowPhase>('description');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Q2 analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Ideation mode state
  const [mode, setMode] = useState<InterviewMode>('interview');

  // Get questions for auto-generation (Q3-Q13)
  const questionsForAutoGeneration = questions.filter(q => q.id >= 3);
  
  // Get Q2 for description phase
  const descriptionQuestion = questions.find(q => q.id === 2);

  const reset = useCallback(() => {
    setSession({
      id: generateUUID(),
      currentQuestionIndex: 0,
      answers: [],
      status: 'in_progress',
      createdAt: new Date(),
      projectSummary: '',
      wasMultiUnit: false,
      selectedUnitId: null,
      allUnits: undefined,
      projectName: '',
      generatedAnswers: [],
    });
    setPhase('description');
    setError(null);
    setIsLoading(false);
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setMode('interview');
  }, []);

  // Enter ideation mode (for Q2 "I don't know")
  const enterIdeationMode = useCallback(() => {
    setMode('ideation');
  }, []);

  // Exit ideation mode and use generated description
  const exitIdeationMode = useCallback(() => {
    setMode('interview');
  }, []);

  // Cancel ideation mode and return to Q2 input
  const cancelIdeationMode = useCallback(() => {
    setMode('interview');
  }, []);

  // Analyze project description (Q2)
  const analyzeProject = useCallback(async (
    projectDescription: string,
    attachedDocContent?: string
  ): Promise<AnalysisResult> => {
    setIsAnalyzing(true);
    setPhase('analyzing');
    setError(null);

    try {
      const response = await fetch('/api/analyze-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectDescription,
          attachedDocContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze project');
      }

      const data = await response.json();
      const result: AnalysisResult = data.result;
      
      setAnalysisResult(result);

      if (result.type === 'single') {
        // Single unit: save summary and move to auto-generation
        setSession(prev => ({
          ...prev,
          projectSummary: result.summary,
          wasMultiUnit: false,
          selectedUnitId: null,
        }));
        setPhase('auto-generating');
      } else {
        // Multiple units: show unit selection UI
        setSession(prev => ({
          ...prev,
          allUnits: result.units,
          wasMultiUnit: true,
        }));
        setPhase('unit-selection');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      setPhase('description'); // Go back to description on error
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Select a unit from multi-unit analysis
  const selectUnit = useCallback((unit: BuildableUnit) => {
    setSession(prev => ({
      ...prev,
      projectSummary: unit.description,
      selectedUnitId: unit.id,
    }));
    setPhase('auto-generating');
  }, []);

  // Handle auto-generation completion
  const onAutoGenerationComplete = useCallback(async (answers: GeneratedAnswer[], projectSummary: string) => {
    setSession(prev => ({
      ...prev,
      generatedAnswers: answers.map(a => ({
        ...a,
        section: questions.find(q => q.id === a.questionId)?.section || '',
        isAIGenerated: true,
      })),
    }));
    
    // Generate project name based on summary
    try {
      const response = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: "What's the name of your project?",
          conversationContext: [
            {
              question: "Describe your project. What does it do and who is it for?",
              answer: projectSummary,
              isAIGenerated: true,
            }
          ],
          userInput: "I don't know - please suggest a name based on the project description",
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate project name');
      }

      const data = await response.json();
      setSession(prev => ({
        ...prev,
        projectName: data.answer,
      }));
    } catch {
      setSession(prev => ({
        ...prev,
        projectName: 'Untitled Project',
      }));
    }
    
    setPhase('review');
  }, []);

  // Update an answer during review
  const updateAnswer = useCallback((questionId: number | string, newAnswer: string) => {
    setSession(prev => ({
      ...prev,
      generatedAnswers: prev.generatedAnswers.map(a => 
        a.questionId === questionId 
          ? { ...a, answer: newAnswer, isAIGenerated: false }
          : a
      ),
    }));
  }, []);

  // Update project name during review
  const updateProjectName = useCallback((name: string) => {
    setSession(prev => ({
      ...prev,
      projectName: name,
    }));
  }, []);

  // Build final answers array for spec generation
  const buildFinalAnswers = useCallback((): Answer[] => {
    const answers: Answer[] = [];
    
    // Q1: Project name
    answers.push({
      question: questions[0].text,
      answer: session.projectName,
      isAIGenerated: true,
    });
    
    // Q2: Project description
    answers.push({
      question: questions[1].text,
      answer: session.projectSummary,
      isAIGenerated: true,
    });
    
    // Q3-Q13: Generated answers
    for (const ga of session.generatedAnswers) {
      answers.push({
        question: ga.questionText,
        answer: ga.answer,
        isAIGenerated: ga.isAIGenerated ?? true,
      });
    }
    
    return answers;
  }, [session.projectName, session.projectSummary, session.generatedAnswers]);

  // Go back during unit selection
  const goBackFromUnitSelection = useCallback(() => {
    setAnalysisResult(null);
    setSession(prev => ({
      ...prev,
      allUnits: undefined,
      wasMultiUnit: false,
    }));
    setPhase('description');
  }, []);

  return {
    session,
    phase,
    isLoading,
    error,
    reset,
    
    // Description phase
    descriptionQuestion,
    
    // Q2 analysis
    isAnalyzing,
    analysisResult,
    analyzeProject,
    selectUnit,
    goBackFromUnitSelection,
    
    // Auto-generation
    questionsForAutoGeneration,
    onAutoGenerationComplete,
    
    // Review phase
    updateAnswer,
    updateProjectName,
    buildFinalAnswers,
    
    // Phase control
    setPhase,
    
    // Ideation mode
    mode,
    enterIdeationMode,
    exitIdeationMode,
    cancelIdeationMode,
    
    // Legacy exports for compatibility
    totalQuestions,
  };
}
