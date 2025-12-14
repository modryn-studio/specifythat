'use client';

import { Question } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
          {question.section}
        </span>
        <span>•</span>
        <span>Question {questionNumber} of {totalQuestions}</span>
      </div>
      
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
        {question.text}
      </h2>
    </div>
  );
}
