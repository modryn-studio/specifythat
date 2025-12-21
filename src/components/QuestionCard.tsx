'use client';

import { Question } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
  return (
    <div className="rounded-2xl bg-dark-800/50 border border-dark-700/50 p-8 md:p-10 animate-slide-up">
      <div className="flex items-center gap-3 text-sm mb-6">
        <span className="bg-accent-500/10 text-accent-300 border border-accent-500/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
          {question.section}
        </span>
        <span className="text-dark-500">•</span>
        <span className="text-dark-400 font-medium">Question {questionNumber} of {totalQuestions}</span>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug">
        {question.text}
      </h2>
    </div>
  );
}
