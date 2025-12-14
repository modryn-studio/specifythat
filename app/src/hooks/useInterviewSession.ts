'use client';

import { useState, useCallback } from 'react';
import { InterviewSession, Answer } from '@/lib/types';
import { questions, totalQuestions } from '@/lib/questions';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function useInterviewSession() {
  const [session, setSession] = useState<InterviewSession>({
    id: generateUUID(),
    currentQuestionIndex: 0,
    answers: [],
    status: 'in_progress',
    createdAt: new Date(),
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[session.currentQuestionIndex];
  const isComplete = session.currentQuestionIndex >= totalQuestions;
  const progress = Math.round((session.currentQuestionIndex / totalQuestions) * 100);

  const saveAnswer = useCallback((answer: string, isAIGenerated: boolean = false) => {
    if (!currentQuestion) return;

    const newAnswer: Answer = {
      question: currentQuestion.text,
      answer: answer,
      isAIGenerated,
    };

    setSession(prev => ({
      ...prev,
      answers: [...prev.answers, newAnswer],
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      status: prev.currentQuestionIndex + 1 >= totalQuestions ? 'completed' : 'in_progress',
    }));
    
    setError(null);
  }, [currentQuestion]);

  const generateAIAnswer = useCallback(async (userInput: string = "I don't know"): Promise<string> => {
    if (!currentQuestion) return '';
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion.text,
          conversationContext: session.answers,
          userInput,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate answer');
      }
      
      const data = await response.json();
      return data.answer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, session.answers]);

  const reset = useCallback(() => {
    setSession({
      id: generateUUID(),
      currentQuestionIndex: 0,
      answers: [],
      status: 'in_progress',
      createdAt: new Date(),
    });
    setError(null);
    setIsLoading(false);
  }, []);

  const goBack = useCallback(() => {
    if (session.currentQuestionIndex > 0) {
      setSession(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
        answers: prev.answers.slice(0, -1),
        status: 'in_progress',
      }));
    }
  }, [session.currentQuestionIndex]);

  return {
    session,
    currentQuestion,
    isComplete,
    progress,
    isLoading,
    error,
    saveAnswer,
    generateAIAnswer,
    reset,
    goBack,
    totalQuestions,
  };
}
