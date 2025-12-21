'use client';

interface ProgressBarProps {
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
}

export function ProgressBar({ progress, currentQuestion, totalQuestions }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-white">
          Progress
        </span>
        <span className="text-sm font-medium text-dark-300">
          {currentQuestion} / {totalQuestions} questions
        </span>
      </div>
      
      <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-accent-600 to-accent-500 h-3 rounded-full transition-all duration-500 ease-out shadow-md"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
