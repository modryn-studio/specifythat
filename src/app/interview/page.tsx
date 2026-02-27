'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Copy, Download, RotateCcw, Sparkles } from 'lucide-react';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { useSessionStore } from '@/stores/session';
import { analytics } from '@/lib/analytics';
import { totalQuestions } from '@/lib/questions';

export default function InterviewPage() {
  const router = useRouter();
  const session = useSessionStore();
  const interview = useInterviewSession();

  const [inputValue, setInputValue] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input on phase change
  useEffect(() => {
    if (
      session.phase === 'project_input' ||
      session.phase === 'interview'
    ) {
      setInputValue('');
      setAiAnswer('');
      setError('');
      setTimeout(() => textareaRef.current?.focus(), 60);
    }
  }, [session.phase, session.currentQuestionIndex]);

  // ─── Handlers ──────────────────────────────────────────────────

  async function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    const desc = inputValue.trim();
    if (!desc || desc.length < 5) {
      setError('Please describe your project (at least a few words).');
      return;
    }
    setError('');
    await interview.analyzeProject(desc);
  }

  async function handleAIGenerate() {
    setIsGeneratingAnswer(true);
    setError('');
    try {
      const answer = await interview.generateAnswer(inputValue.trim() || 'Generate a best answer');
      setAiAnswer(answer);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setIsGeneratingAnswer(false);
    }
  }

  function handleAcceptAI() {
    if (!aiAnswer) return;
    interview.acceptAIAnswer(aiAnswer);
    setAiAnswer('');
    setInputValue('');
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = inputValue.trim() || aiAnswer.trim();
    if (!val) {
      setError('Please enter an answer or let AI generate one.');
      return;
    }
    setError('');
    if (val === aiAnswer) {
      interview.acceptAIAnswer(val);
    } else {
      interview.submitAnswer(val);
    }
    setAiAnswer('');
    setInputValue('');
  }

  function handleCopySpec() {
    if (!session.generatedSpec) return;
    navigator.clipboard.writeText(session.generatedSpec);
    setCopied(true);
    analytics.specCopied();
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadSpec() {
    if (!session.generatedSpec) return;
    const projectName =
      session.answers.find((a) => a.question.includes('name'))?.answer || 'spec';
    const blob = new Blob([session.generatedSpec], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-spec.md`;
    a.click();
    URL.revokeObjectURL(url);
    analytics.specDownloaded();
  }

  // ─── Phases ────────────────────────────────────────────────────

  if (session.phase === 'project_input') {
    return (
      <Shell>
        <div className="animate-fade-up max-w-xl w-full mx-auto">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            What are you building?
          </h1>
          <p className="mb-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Describe your project in a few sentences. We'll handle the rest.
          </p>

          {/* Rate limit banner */}
          {interview.isRateLimited && (
            <div
              className="mb-6 p-4 rounded-lg border text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'var(--color-error)' }}
            >
              <p style={{ color: 'var(--color-text)' }}>
                You've used your free specs today. Come back tomorrow —{' '}
                <a
                  href="#"
                  className="underline"
                  style={{ color: 'var(--color-accent)' }}
                  onClick={(e) => e.preventDefault()}
                >
                  or get credits to keep going
                </a>
                .
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Credits coming soon.
              </p>
            </div>
          )}

          {/* Resume banner */}
          {!interview.isRateLimited && session.id && session.answers.length > 0 && (
            <div
              className="mb-6 p-4 rounded-lg border flex items-center justify-between gap-4 text-sm"
              style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent)' }}
            >
              <span style={{ color: 'var(--color-text)' }}>
                You have an interview in progress ({session.answers.length}/{totalQuestions} answered).
              </span>
              <button
                onClick={() => session.setPhase('interview')}
                className="font-medium underline shrink-0"
                style={{ color: 'var(--color-accent)' }}
              >
                Resume
              </button>
            </div>
          )}

          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. A tool that converts Figma screenshots into Tailwind code. For frontend devs who hate copying layouts manually."
              rows={5}
              className="w-full rounded-xl p-4 text-sm resize-none border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              Analyze project
              <ChevronRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
            Not sure what to build?{' '}
            <button
              onClick={() => interview.analyzeProject("I'm not sure yet")}
              className="underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Let's figure it out
            </button>
          </p>
        </div>
      </Shell>
    );
  }

  if (session.phase === 'analyzing') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-6 animate-fade-up">
          <div className="dot-pulse flex gap-2">
            <span /><span /><span />
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Analyzing your project…</p>
        </div>
      </Shell>
    );
  }

  if (session.phase === 'unit_picker') {
    const units =
      session.analysisResult?.type === 'multiple' ? session.analysisResult.units : [];

    return (
      <Shell>
        <div className="animate-fade-up max-w-xl w-full mx-auto">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Your project has multiple parts.
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
            Pick one to spec first. You can always come back for the others.
          </p>
          <div className="space-y-3">
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => interview.selectUnit(unit.id)}
                className="w-full text-left p-5 rounded-xl border transition-colors hover:border-indigo-500"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                  {unit.name}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {unit.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (session.phase === 'interview') {
    const q = interview.currentQuestion;
    if (!q) return null;

    return (
      <Shell>
        {/* Progress */}
        <div className="w-full max-w-xl mx-auto mb-8">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            <span>Question {session.currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>{interview.progress}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${interview.progress}%`, background: 'var(--color-accent)' }}
            />
          </div>
        </div>

        <div className="animate-fade-up max-w-xl w-full mx-auto">
          {/* Section label */}
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>
            {q.section}
          </p>

          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            {q.text}
          </h2>

          {q.helpText && (
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              {q.helpText}
            </p>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4 mt-6">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setAiAnswer(''); // clear AI answer if user types
              }}
              placeholder="Your answer (or leave blank and let AI generate)…"
              rows={4}
              className="w-full rounded-xl p-4 text-sm resize-none border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />

            {/* AI generated answer preview */}
            {aiAnswer && (
              <div
                className="p-4 rounded-xl border text-sm animate-fade-down"
                style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent)', color: 'var(--color-text)' }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-accent)' }}>
                  AI suggestion
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{aiAnswer}</p>
                <button
                  type="button"
                  onClick={handleAcceptAI}
                  className="mt-3 text-xs font-medium underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Use this →
                </button>
              </div>
            )}

            {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={isGeneratingAnswer}
                className="flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                {isGeneratingAnswer ? (
                  <span className="dot-pulse flex gap-1.5"><span /><span /><span /></span>
                ) : (
                  <>
                    <Sparkles size={15} />
                    AI suggest
                  </>
                )}
              </button>

              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                {interview.isLastQuestion ? 'Finish' : 'Next'}
                <ChevronRight size={15} />
              </button>
            </div>
          </form>
        </div>
      </Shell>
    );
  }

  if (session.phase === 'generating') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-6 animate-fade-up">
          <div className="dot-pulse flex gap-2">
            <span /><span /><span />
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Assembling your spec…</p>
        </div>
      </Shell>
    );
  }

  if (session.phase === 'done' && session.generatedSpec) {
    return (
      <Shell>
        <div className="animate-fade-up max-w-2xl w-full mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              Your spec is ready.
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopySpec}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={{
                  background: copied ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                  borderColor: copied ? 'var(--color-accent)' : 'var(--color-border)',
                  color: copied ? 'var(--color-accent)' : 'var(--color-text)',
                }}
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownloadSpec}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>

          <div
            className="rounded-xl border p-6 text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[60vh] leading-relaxed"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            {session.generatedSpec}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => {
                interview.clearSession();
                setInputValue('');
              }}
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <RotateCcw size={14} />
              Start over
            </button>
            <a
              href="/specs"
              className="text-sm underline"
              style={{ color: 'var(--color-accent)' }}
            >
              View all specs →
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  return null;
}

// ─── Shared shell ────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'var(--color-bg)' }}
    >
      <a
        href="/"
        className="fixed top-5 left-6 text-sm font-semibold"
        style={{ color: 'var(--color-text-muted)' }}
      >
        SpecifyThat
      </a>
      {children}
    </div>
  );
}
