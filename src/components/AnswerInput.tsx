'use client';

import { useState, useRef, useEffect } from 'react';
import { QuestionValidation } from '@/lib/types';
import { validateAnswer, applySanitization, validateMeaningfulInput } from '@/lib/sanitize';
import { Sparkles } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  onIDontKnow: () => void;
  onBack?: () => void;
  isLoading: boolean;
  canGoBack: boolean;
  aiGeneratedAnswer?: string | null;
  onAcceptAI?: (answer: string) => void;
  // File upload props (for Q2)
  allowFileUpload?: boolean;
  fileTypes?: string[];
  helpText?: string;
  attachedFile?: File | null;
  onFileChange?: (file: File | null) => void;
  // Validation props
  validation?: QuestionValidation;
  questionId?: number;
  // Initial value (from ideation mode)
  initialValue?: string | null;
}

export function AnswerInput({ 
  onSubmit, 
  onIDontKnow, 
  onBack,
  isLoading, 
  canGoBack,
  aiGeneratedAnswer,
  onAcceptAI,
  allowFileUpload,
  fileTypes,
  helpText,
  attachedFile,
  onFileChange,
  validation,
  questionId,
  initialValue,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If AI generated an answer, pre-fill it for editing
  useEffect(() => {
    if (aiGeneratedAnswer) {
      setAnswer(aiGeneratedAnswer);
      setValidationError(null);
    }
  }, [aiGeneratedAnswer]);

  // Pre-fill from initialValue (ideation mode)
  useEffect(() => {
    if (initialValue) {
      setAnswer(initialValue);
      setValidationError(null);
    }
  }, [initialValue]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Clear validation error when answer changes
  useEffect(() => {
    if (validationError) {
      const trimmed = answer.trim();
      // Clear error if field is empty OR if input becomes valid
      if (!trimmed) {
        setValidationError(null);
      } else {
        // Check both gibberish and question-specific validation
        const gibberishError = validateMeaningfulInput(answer);
        const questionError = validateAnswer(answer, validation);
        if (!gibberishError && !questionError) {
          setValidationError(null);
        }
      }
    }
  }, [answer, validation, validationError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Skip all text validation if a file is attached (file content will be validated separately)
    if (!attachedFile) {
      // Validate for gibberish first (if there's text input)
      if (answer.trim()) {
        const gibberishError = validateMeaningfulInput(answer);
        if (gibberishError) {
          setValidationError(gibberishError);
          return;
        }
      }
      
      // Validate against question-specific rules
      const error = validateAnswer(answer, validation);
      if (error) {
        setValidationError(error);
        return;
      }
    }
    
    // Allow submit if we have text OR a file (for Q2)
    if ((answer.trim() || attachedFile) && !isLoading) {
      // Apply sanitization if needed
      const sanitized = applySanitization(answer.trim(), validation, questionId);
      onSubmit(sanitized);
      setAnswer('');
      setValidationError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      
      // Skip all text validation if a file is attached (file content will be validated separately)
      if (!attachedFile) {
        // Validate for gibberish first (if there's text input)
        if (answer.trim()) {
          const gibberishError = validateMeaningfulInput(answer);
          if (gibberishError) {
            setValidationError(gibberishError);
            return;
          }
        }
        
        // Validate against question-specific rules
        const error = validateAnswer(answer, validation);
        if (error) {
          setValidationError(error);
          return;
        }
      }
      
      if ((answer.trim() || attachedFile) && !isLoading) {
        const sanitized = applySanitization(answer.trim(), validation, questionId);
        onSubmit(sanitized);
        setAnswer('');
        setValidationError(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Please upload a file under 10MB.');
        e.target.value = '';
        return;
      }
      
      setFileName(file.name);
      onFileChange?.(file);
    } else {
      setFileName('');
      onFileChange?.(null);
    }
  };

  const handleRemoveFile = () => {
    setFileName('');
    onFileChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleIDontKnowClick = () => {
    setValidationError(null);
    setAnswer('');
    onIDontKnow();
  };

  const handleAcceptAI = () => {
    if (aiGeneratedAnswer && onAcceptAI) {
      const sanitized = applySanitization(answer || aiGeneratedAnswer, validation, questionId);
      onAcceptAI(sanitized);
      setAnswer('');
      setValidationError(null);
    }
  };

  // Calculate character count for validation feedback
  const charCount = answer.trim().length;
  const showCharCount = validation?.maxLength || validation?.minLength;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && allowFileUpload) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Please upload a file under 10MB.');
        return;
      }
      onFileChange?.(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Unified input box - textarea + file upload in ONE container */}
      <div
        className={`relative rounded-2xl border-2 transition-all duration-300 outline-none focus-within:outline-none ${
          isDragging 
            ? 'border-accent-500 bg-accent-500/5' 
            : validationError
            ? 'border-red-500/50 bg-dark-800/50 hover:border-red-500'
            : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
        }`}
        onDragOver={(e) => { e.preventDefault(); if (allowFileUpload) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {aiGeneratedAnswer && (
          <div className="absolute -top-3 right-3 z-10">
            <span className="bg-accent-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Suggested
            </span>
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., A task management app for remote teams that helps them coordinate work and track progress without constant meetings..."
          disabled={isLoading}
          maxLength={validation?.maxLength ? validation.maxLength + 10 : undefined}
          className="w-full h-40 md:h-48 p-6 bg-transparent text-white placeholder-dark-500 resize-none focus:outline-none text-lg"
        />
        
        {/* File upload zone inside the same box */}
        {allowFileUpload && (
          <div className="p-4 border-t border-dark-700/50">
            {attachedFile ? (
              <div className="flex items-center gap-3 p-3 bg-accent-500/10 border border-accent-500/20 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{attachedFile.name}</p>
                  <p className="text-xs text-dark-400">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 p-1.5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-dark-600 hover:border-accent-500/50 cursor-pointer transition-colors group">
                <svg className="w-5 h-5 text-dark-500 group-hover:text-accent-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-dark-400 group-hover:text-dark-300 transition-colors text-sm">
                  {fileName || `Drop or click to upload ${fileTypes?.join(' or ')} (up to 10MB)`}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={fileTypes?.join(',')}
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>

      {/* Validation feedback */}
      {(validationError || showCharCount) && (
        <div className="flex items-center justify-between text-sm -mt-2">
          {validationError ? (
            <p className="text-red-400 font-medium">{validationError}</p>
          ) : (
            <div />
          )}
          {showCharCount && (
            <p className={`font-medium ${
              validation?.maxLength && charCount > validation.maxLength
                ? 'text-red-400'
                : validation?.minLength && charCount < validation.minLength
                ? 'text-amber-400'
                : 'text-dark-500'
            }`}>
              {charCount}{validation?.maxLength ? ` / ${validation.maxLength}` : ''} characters
            </p>
          )}
        </div>
      )}

      {/* Back button if needed */}
      {canGoBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="px-5 py-3 text-dark-400 hover:text-white hover:bg-dark-700 rounded-xl transition-all duration-200 disabled:opacity-50 font-medium"
        >
          ← Back
        </button>
      )}

      {/* Buttons - two side by side */}
      {aiGeneratedAnswer ? (
        <button
          type="button"
          onClick={handleAcceptAI}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-accent-600 hover:bg-accent-500 text-white rounded-xl shadow-lg shadow-accent-600/25 hover:shadow-accent-500/40 transition-all duration-200 disabled:opacity-50 font-semibold"
        >
          <Sparkles className="w-5 h-5" />
          Accept & Continue
          <span className="ml-1">→</span>
        </button>
      ) : (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleIDontKnowClick}
            disabled={isLoading}
            className="flex-1 px-6 py-4 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingDots />
                Thinking...
              </span>
            ) : (
              "I don't know"
            )}
          </button>
          
          <button
            type="submit"
            disabled={isLoading || (!answer.trim() && !attachedFile)}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-accent-600 hover:bg-accent-500 disabled:bg-dark-700 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-accent-600/25 hover:shadow-accent-500/40 disabled:shadow-none transition-all duration-300 font-semibold"
          >
            Next
            <span className="ml-1">→</span>
          </button>
        </div>
      )}

      <p className="text-xs text-dark-500 text-center">
        Press <kbd className="px-1.5 py-0.5 bg-dark-700 border border-dark-600 rounded text-xs text-dark-400">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-dark-700 border border-dark-600 rounded text-xs text-dark-400">Enter</kbd> to submit
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
