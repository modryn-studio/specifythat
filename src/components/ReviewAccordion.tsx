'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Check, X, Sparkles } from 'lucide-react';

interface ReviewItem {
  id: number | string;
  questionText: string;
  answer: string;
  isAIGenerated?: boolean;
  section?: string;
}

interface ReviewAccordionProps {
  items: ReviewItem[];
  projectName: string;
  onUpdateAnswer: (id: number | string, newAnswer: string) => void;
  onUpdateProjectName: (name: string) => void;
  onGenerateSpec: () => void;
  isGenerating: boolean;
}

export function ReviewAccordion({
  items,
  projectName,
  onUpdateAnswer,
  onUpdateProjectName,
  onGenerateSpec,
  isGenerating,
}: ReviewAccordionProps) {
  const [expandedId, setExpandedId] = useState<number | string | null>(null);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(projectName);

  const toggleExpand = (id: number | string) => {
    if (editingId === id) return; // Don't collapse while editing
    setExpandedId(expandedId === id ? null : id);
  };

  const startEditing = (item: ReviewItem) => {
    setEditingId(item.id);
    setEditValue(item.answer);
    setExpandedId(item.id);
  };

  const saveEdit = (id: number | string) => {
    onUpdateAnswer(id, editValue);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const startEditingName = () => {
    setIsEditingName(true);
    setNameValue(projectName);
  };

  const saveNameEdit = () => {
    onUpdateProjectName(nameValue);
    setIsEditingName(false);
  };

  const cancelNameEdit = () => {
    setIsEditingName(false);
    setNameValue(projectName);
  };

  // Group items by section
  const groupedItems = items.reduce((acc, item) => {
    const section = item.section || 'Other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, ReviewItem[]>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-full text-sm font-medium">
          <Check className="w-4 h-4" />
          Review & Edit
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Review Your Project Plan
        </h2>
        <p className="text-dark-400">
          Click any question to expand and edit. When you&apos;re satisfied, generate your spec.
        </p>
      </div>

      {/* Project Name Card */}
      <div className="rounded-xl border border-dark-700 overflow-hidden">
        <div className="p-5 bg-dark-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-dark-400">
                Project Name
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-accent-400 bg-accent-500/20 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> AI Generated
              </span>
            </div>
            {!isEditingName && (
              <button
                onClick={startEditingName}
                className="p-2 text-dark-400 hover:text-accent-400 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {isEditingName ? (
            <div className="mt-3 space-y-3">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent text-lg font-semibold text-white"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={saveNameEdit}
                  className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={cancelNameEdit}
                  className="flex items-center gap-1 px-4 py-2 text-dark-300 hover:bg-dark-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xl font-bold text-white">{projectName}</p>
          )}
        </div>
      </div>

      {/* Accordion Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const isExpanded = expandedId === item.id;
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className={`
                rounded-xl border transition-all duration-200
                ${isExpanded ? 'border-accent-500/50 bg-dark-800/80' : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'}
              `}
            >
              {/* Header */}
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full p-4 flex items-center justify-between text-left"
                disabled={isEditing}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    {item.section && (
                      <span className="text-xs font-medium text-dark-500 uppercase tracking-wider">
                        {item.section}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-white">{item.questionText}</p>
                  {!isExpanded && (
                    <p className="mt-1 text-sm text-dark-400 line-clamp-1">{item.answer}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.isAIGenerated && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-accent-300 bg-accent-500/10 border border-accent-500/20 px-2 py-1 rounded-full">
                      <Sparkles className="w-3 h-3" /> AI
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-dark-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-dark-400" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-dark-700">
                  {isEditing ? (
                    <div className="pt-4 space-y-3">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none text-white"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          <Check className="w-4 h-4" /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1 px-4 py-2 text-dark-300 hover:bg-dark-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4">
                      <p className="text-dark-300 whitespace-pre-wrap">{item.answer}</p>
                      <button
                        onClick={() => startEditing(item)}
                        className="mt-3 flex items-center gap-1 px-3 py-1.5 text-sm text-accent-400 hover:bg-accent-500/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" /> Edit answer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Generate Spec Button */}
      <div className="pt-6 flex flex-col items-center gap-4">
        <button
          onClick={onGenerateSpec}
          disabled={isGenerating || editingId !== null}
          className="group inline-flex items-center justify-center px-10 py-5 bg-accent-600 hover:bg-accent-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-accent-600/25 hover:shadow-accent-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none btn-pulse"
        >
          {isGenerating ? (
            <>
              Generating...
              <span className="ml-2 animate-spin">⏳</span>
            </>
          ) : (
            <>
              Generate My Spec
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
            </>
          )}
        </button>
        {editingId !== null && (
          <p className="text-sm text-dark-400">Save your edits before generating the spec</p>
        )}
      </div>
    </div>
  );
}
