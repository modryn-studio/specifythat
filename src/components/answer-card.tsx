'use client';

import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Question } from '@/lib/types';

interface AnswerCardProps {
  question: Question;
  answer: string;
  isEdited?: boolean;
  onSave: (questionText: string, newAnswer: string) => void;
}

export function AnswerCard({ question, answer, isEdited, onSave }: AnswerCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(answer);

  function handleEdit() {
    setDraft(answer);
    setEditing(true);
  }

  function handleSave() {
    if (draft.trim()) {
      onSave(question.text, draft.trim());
    }
    setEditing(false);
  }

  function handleCancel() {
    setDraft(answer);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') handleCancel();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
  }

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{
        background: 'var(--color-surface)',
        borderColor: isEdited ? 'var(--color-accent)' : 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-0.5"
            style={{ color: 'var(--color-accent)' }}
          >
            {question.section}
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {question.text}
          </p>
        </div>
        {!editing && (
          <button
            onClick={handleEdit}
            className="shrink-0 p-1.5 rounded-lg transition-colors hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Edit answer"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {/* Answer / Edit */}
      {editing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={4}
            className="w-full rounded-lg p-3 text-sm resize-none border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
                background: 'var(--color-surface)',
              }}
            >
              <X size={12} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!draft.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              <Check size={12} />
              Save
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            ⌘↵ to save · Esc to cancel
          </p>
        </div>
      ) : (
        <p
          className="text-sm mt-1 whitespace-pre-wrap leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {answer || <span className="italic opacity-50">No answer</span>}
        </p>
      )}
    </div>
  );
}
