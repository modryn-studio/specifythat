'use client';

import { BuildableUnit } from '@/lib/types';

interface UnitSelectionCardProps {
  unit: BuildableUnit;
  onSelect: () => void;
}

export function UnitSelectionCard({ unit, onSelect }: UnitSelectionCardProps) {
  return (
    <button
      onClick={onSelect}
      className="w-full p-6 bg-dark-800/50 border border-dark-700/50 rounded-2xl text-left hover:border-accent-500/50 hover:bg-dark-700/50 hover:shadow-lg hover:shadow-accent-500/10 transition-all duration-200 group card-hover"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
          {unit.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg text-white group-hover:text-accent-400 transition-colors">
            {unit.name}
          </div>
          <div className="text-dark-300 mt-1 leading-relaxed">
            {unit.description}
          </div>
        </div>
        <div className="flex-shrink-0 text-dark-400 group-hover:text-accent-400 group-hover:translate-x-1 transition-all duration-200">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
