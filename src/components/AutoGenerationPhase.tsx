'use client';

import { useState, useEffect, useCallback } from 'react';
import { Question, GeneratedAnswer } from '@/lib/types';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';

interface AutoGenerationPhaseProps {
  questions: Question[];
  conversationContext: { question: string; answer: string; isAIGenerated: boolean }[];
  onComplete: (answers: GeneratedAnswer[], projectSummary: string) => void;
  projectDescription: string;
}

export function AutoGenerationPhase({
  questions,
  conversationContext,
  onComplete,
  projectDescription,
}: AutoGenerationPhaseProps) {
  const [generatedAnswers, setGeneratedAnswers] = useState<GeneratedAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnswer = useCallback(async (
    question: Question,
    context: { question: string; answer: string; isAIGenerated: boolean }[]
  ): Promise<string> => {
    const response = await fetch('/api/generate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question.text,
        conversationContext: context,
        userInput: "I don't know",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate answer');
    }

    const data = await response.json();
    return data.answer;
  }, []);

  useEffect(() => {
    const generateNextAnswer = async () => {
      if (currentIndex >= questions.length) {
        // All done - trigger completion with projectDescription
        onComplete(generatedAnswers, projectDescription);
        return;
      }

      if (isGenerating) return;

      setIsGenerating(true);
      setError(null);

      const question = questions[currentIndex];

      try {
        // Build context: initial conversation context + all previously generated answers
        const fullContext = [
          ...conversationContext,
          ...generatedAnswers.map(ga => ({
            question: ga.questionText,
            answer: ga.answer,
            isAIGenerated: true,
          })),
        ];

        const answer = await generateAnswer(question, fullContext);

        const newAnswer: GeneratedAnswer = {
          questionId: question.id,
          questionText: question.text,
          answer,
          isComplete: true,
          isAIGenerated: true,
        };

        setGeneratedAnswers(prev => [...prev, newAnswer]);
        setCurrentIndex(prev => prev + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsGenerating(false);
      }
    };

    generateNextAnswer();
  }, [currentIndex, questions, conversationContext, generatedAnswers, isGenerating, generateAnswer, onComplete, projectDescription]);

  const progress = Math.round((generatedAnswers.length / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-accent-500/20 text-accent-400 px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          AI Auto-Generation
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Building Your Project Spec
        </h2>
        <p className="text-dark-300">
          Generating expert answers for each planning question...
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-dark-200">
            Question {Math.min(generatedAnswers.length + 1, questions.length)} of {questions.length}
          </span>
          <span className="text-dark-400">{progress}%</span>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-accent-500 to-accent-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsGenerating(false);
            }}
            className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-3">
        {questions.map((question, index) => {
          const generated = generatedAnswers.find(ga => ga.questionId === question.id);
          const isCurrentlyGenerating = index === currentIndex && isGenerating;
          const isPending = index > currentIndex;

          return (
            <div
              key={question.id}
              className={`
                rounded-xl border transition-all duration-300
                ${generated ? 'bg-dark-800/50 border-green-500/30 shadow-sm' : ''}
                ${isCurrentlyGenerating ? 'bg-accent-500/20 border-accent-500/30 shadow-md' : ''}
                ${isPending ? 'bg-dark-800/30 border-dark-700/30 opacity-50' : ''}
              `}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Status icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {generated && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {isCurrentlyGenerating && (
                      <Loader2 className="w-5 h-5 text-accent-400 animate-spin" />
                    )}
                    {isPending && (
                      <div className="w-5 h-5 rounded-full border-2 border-dark-500" />
                    )}
                  </div>

                  {/* Question content */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${generated ? 'text-white' : 'text-dark-300'}`}>
                      {question.text}
                    </p>

                    {/* Generated answer preview */}
                    {generated && (
                      <p className="mt-2 text-sm text-dark-400 line-clamp-2">
                        {generated.answer}
                      </p>
                    )}

                    {/* Currently generating indicator */}
                    {isCurrentlyGenerating && (
                      <p className="mt-2 text-sm text-accent-400 animate-pulse">
                        Generating answer...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
