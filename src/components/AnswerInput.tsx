'use client';

import { useState, useRef, useEffect } from 'react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  onIDontKnow: () => void;
  onBack?: () => void;
  isLoading: boolean;
  canGoBack: boolean;
  aiGeneratedAnswer?: string | null;
  onAcceptAI?: (answer: string) => void;
}

export function AnswerInput({ 
  onSubmit, 
  onIDontKnow, 
  onBack,
  isLoading, 
  canGoBack,
  aiGeneratedAnswer,
  onAcceptAI,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // If AI generated an answer, pre-fill it for editing
  useEffect(() => {
    if (aiGeneratedAnswer) {
      setAnswer(aiGeneratedAnswer);
    }
  }, [aiGeneratedAnswer]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !isLoading) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (answer.trim() && !isLoading) {
        onSubmit(answer.trim());
        setAnswer('');
      }
    }
  };

  const handleAcceptAI = () => {
    if (aiGeneratedAnswer && onAcceptAI) {
      onAcceptAI(answer || aiGeneratedAnswer);
      setAnswer('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer here..."
          disabled={isLoading}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-500 text-gray-900 placeholder-gray-400"
        />
        {aiGeneratedAnswer && (
          <div className="absolute top-2 right-2">
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
              ✨ AI Suggested
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            ← Back
          </button>
        )}
        
        <div className="flex-1" />
        
        {aiGeneratedAnswer ? (
          <button
            type="button"
            onClick={handleAcceptAI}
            disabled={isLoading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
          >
            Accept & Continue
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onIDontKnow}
              disabled={isLoading || answer.trim().length > 0}
              className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingDots />
                  Thinking...
                </span>
              ) : (
                "I don't know"
              )}
            </button>
            
            <button
              type="submit"
              disabled={isLoading || !answer.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next →
            </button>
          </>
        )}
      </div>

      <p className="text-sm text-gray-500 text-center">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to submit
      </p>
    </form>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}
