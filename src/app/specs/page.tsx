'use client';

import { useState } from 'react';
import { Download, Search, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import { useSpecsStore } from '@/stores/specs';
import { SpecEntry } from '@/lib/types';
import { analytics } from '@/lib/analytics';

export default function SpecsPage() {
  const { specs, removeSpec, clearAll } = useSpecsStore();
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = specs.filter(
    (s) =>
      !query ||
      s.projectName.toLowerCase().includes(query.toLowerCase()) ||
      s.spec.toLowerCase().includes(query.toLowerCase())
  );

  function handleDownload(entry: SpecEntry) {
    const blob = new Blob([entry.spec], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.projectName.toLowerCase().replace(/\s+/g, '-')}-spec.md`;
    a.click();
    URL.revokeObjectURL(url);
    analytics.specDownloaded();
  }

  function handleExportAll() {
    const data = JSON.stringify(specs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'specifythat-specs.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: SpecEntry[] = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) throw new Error('Invalid format');
        // Merge: add any IDs not already present
        const existingIds = new Set(specs.map((s) => s.id));
        const toImport = parsed.filter((s) => !existingIds.has(s.id));
        toImport.forEach((s) => {
          useSpecsStore.getState().addSpec(s.projectName, s.spec, s.answers);
        });
      } catch {
        alert('Invalid file. Export your specs from SpecifyThat to get a valid import file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <main
      className="min-h-dvh px-4 py-16 max-w-3xl mx-auto"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            My specs
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {specs.length === 0
              ? 'No specs yet'
              : `${specs.length} spec${specs.length === 1 ? '' : 's'} saved locally`}
          </p>
        </div>

        {specs.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              className="text-sm px-3 py-1.5 rounded-lg border transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
                background: 'var(--color-surface)',
              }}
            >
              Export all
            </button>
            <label
              className="text-sm px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
                background: 'var(--color-surface)',
              }}
            >
              Import
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
        )}
      </div>

      {/* Empty state */}
      {specs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
          <FileText size={40} className="mb-4" style={{ color: 'var(--color-border)' }} />
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            No specs yet
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Complete an interview and your spec will appear here.
          </p>
          <Link
            href="/interview"
            className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            Start a spec
          </Link>
        </div>
      )}

      {/* Search */}
      {specs.length > 0 && (
        <>
          <div className="relative mb-6">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search specs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
              No specs match &quot;{query}&quot;
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((entry) => (
                <SpecCard
                  key={entry.id}
                  entry={entry}
                  isExpanded={expandedId === entry.id}
                  onToggleExpand={() =>
                    setExpandedId((prev) => (prev === entry.id ? null : entry.id))
                  }
                  onDownload={() => handleDownload(entry)}
                  onDelete={() => removeSpec(entry.id)}
                />
              ))}
            </div>
          )}

          {/* Danger zone */}
          <div className="mt-12 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {confirmClear ? (
              <div className="flex items-center gap-3">
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Delete all {specs.length} spec{specs.length === 1 ? '' : 's'}? This can&apos;t be undone.
                </p>
                <button
                  onClick={() => {
                    clearAll();
                    setConfirmClear(false);
                  }}
                  className="text-sm font-medium px-3 py-1 rounded"
                  style={{ color: 'var(--color-error)' }}
                >
                  Yes, delete all
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-sm transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Clear all specs
              </button>
            )}
          </div>
        </>
      )}
    </main>
  );
}

// ─── Spec card ────────────────────────────────────────────────────

function SpecCard({
  entry,
  isExpanded,
  onToggleExpand,
  onDownload,
  onDelete,
}: {
  entry: SpecEntry;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className="rounded-xl border overflow-hidden transition-colors"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
        onClick={onToggleExpand}
      >
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
            {entry.projectName}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {date} · {entry.answers.length} answered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="p-2 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            title="Download .md"
          >
            <Download size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded spec preview */}
      {isExpanded && (
        <div
          className="px-5 pb-5 border-t pt-4 animate-fade-down"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <pre
            className="text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-auto"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {entry.spec}
          </pre>
        </div>
      )}
    </div>
  );
}
