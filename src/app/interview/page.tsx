'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Copy, Download, FileText, Layers, RotateCcw, Sparkles, Target, Upload } from 'lucide-react';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { useSessionStore } from '@/stores/session';
import { analytics } from '@/lib/analytics';
import { questions, totalQuestions } from '@/lib/questions';
import { AnswerCard } from '@/components/answer-card';

const AUTO_FILL_STAGES = [
  { threshold: 0,  text: 'Analyzing your project…',           icon: FileText },
  { threshold: 25, text: 'Answering strategic questions…',     icon: Target },
  { threshold: 55, text: 'Building specification structure…',  icon: Layers },
  { threshold: 80, text: 'Finalizing details…',                icon: Sparkles },
];

export default function InterviewPage() {
  const session = useSessionStore();
  const interview = useInterviewSession();

  const [inputValue, setInputValue] = useState('');
  const [docContent, setDocContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [aiAnswer, setAiAnswer] = useState('');
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoFillProgress, setAutoFillProgress] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [mounted, setMounted] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-focus on phase change
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-focus on phase change
  useEffect(() => {
    if (session.phase === 'project_input' || session.phase === 'interview') {
      setInputValue('');
      setAiAnswer('');
      setError('');
      setTimeout(() => textareaRef.current?.focus(), 60);
    }
  }, [session.phase, session.currentQuestionIndex]);

  // Animate progress bar during auto_filling phase
  useEffect(() => {
    if (session.phase === 'auto_filling') {
      setAutoFillProgress(0);
      progressIntervalRef.current = setInterval(() => {
        setAutoFillProgress((p) => {
          // Slow down as it approaches 90% — real API response completes it
          if (p >= 90) return p;
          const increment = p < 50 ? 1.5 : p < 75 ? 0.8 : 0.3;
          return Math.min(p + increment, 90);
        });
      }, 80);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (session.phase === 'review') setAutoFillProgress(100);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [session.phase]);

  // ─── File upload ───────────────────────────────────────────────

  const handleFileUpload = useCallback((file: File | null) => {
    if (!file) return;
    const validExtensions = ['.txt', '.md'];
    if (!validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setError('Please upload a .txt or .md file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string)?.slice(0, 10240) || '';
      setDocContent(text);
      setFileName(file.name);
    };
    reader.readAsText(file);
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────

  async function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    const desc = inputValue.trim();
    if (!desc || desc.length < 5) {
      setError('Please describe your project (at least a few words).');
      return;
    }
    setError('');
    await interview.analyzeProject(desc, docContent || undefined);
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

  async function handleGenerateSpec() {
    setIsSubmittingReview(true);
    await interview.submitReview();
    setIsSubmittingReview(false);
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
    const answers = session.allAnswers.length > 0 ? session.allAnswers : session.answers;
    const projectName = answers.find((a) => a.question.includes('name'))?.answer || 'spec';
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

  // ─── Phases ────────────────────────────────────────────────────

  // Suppress hydration mismatch: server always renders project_input,
  // but client restores phase from localStorage. Show nothing until mounted.
  if (!mounted) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-6">
          <div className="dot-pulse flex gap-2">
            <span /><span /><span />
          </div>
        </div>
      </Shell>
    );
  }

  if (session.phase === 'project_input') {
    return (
      <Shell>
        <div className="animate-fade-up max-w-xl w-full mx-auto">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            What are you building?
          </h1>
          <p className="mb-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Describe your project in a few sentences. We&apos;ll handle the rest.
          </p>

          {/* Rate limit banner */}
          {interview.isRateLimited && (
            <div
              className="mb-6 p-4 rounded-lg border text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'var(--color-error)' }}
            >
              <p style={{ color: 'var(--color-text)' }}>
                You&apos;ve used your free specs today. Come back tomorrow —{' '}
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
          {!interview.isRateLimited && session.id && session.allAnswers.length > 0 && (
            <div
              className="mb-6 p-4 rounded-lg border flex items-center justify-between gap-4 text-sm"
              style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent)' }}
            >
              <span style={{ color: 'var(--color-text)' }}>
                You have a spec ready to review.
              </span>
              <button
                onClick={() => session.setPhase('review')}
                className="font-medium underline shrink-0"
                style={{ color: 'var(--color-accent)' }}
              >
                Resume
              </button>
            </div>
          )}

          <form onSubmit={handleProjectSubmit} className="space-y-4">
            {/* Description textarea + drag-and-drop zone */}
            <div
              className="rounded-xl border transition-colors overflow-hidden"
              style={{
                borderColor: isDragging ? 'var(--color-accent)' : 'var(--color-border)',
                background: isDragging ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
              }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files[0]); }}
            >
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. A tool that converts Figma screenshots into Tailwind code. For frontend devs who hate copying layouts manually."
                rows={5}
                className="w-full p-4 text-sm resize-none focus:outline-none transition-colors"
                style={{
                  background: 'transparent',
                  color: 'var(--color-text)',
                }}
              />
              {/* File upload row */}
              <label
                className="flex items-center gap-2 px-4 py-3 border-t cursor-pointer transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Upload size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {fileName || 'Attach a .txt or .md file (optional, up to 10MB)'}
                </span>
                <input
                  type="file"
                  accept=".txt,.md"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>}

            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              <Sparkles size={15} />
              Generate my spec
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
              Let&apos;s figure it out
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

  if (session.phase === 'auto_filling') {
    const currentStage =
      [...AUTO_FILL_STAGES].reverse().find((s) => autoFillProgress >= s.threshold) ??
      AUTO_FILL_STAGES[0];
    const StageIcon = currentStage.icon;

    return (
      <Shell>
        <div className="animate-fade-up max-w-md w-full mx-auto text-center">
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-accent)' }}
          >
            <StageIcon size={28} style={{ color: 'var(--color-accent)' }} />
          </div>

          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text)' }}>
            {currentStage.text}
          </h2>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--color-surface-2)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${autoFillProgress}%`, background: 'var(--color-accent)' }}
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {Math.round(autoFillProgress)}% complete
          </p>

          {/* Stage dots */}
          <div className="flex justify-center gap-3 mt-6">
            {AUTO_FILL_STAGES.map((s, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{
                  background: autoFillProgress >= s.threshold
                    ? 'var(--color-accent)'
                    : 'var(--color-surface-2)',
                }}
              />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (session.phase === 'review') {
    const answersToReview = session.allAnswers.length > 0 ? session.allAnswers : session.answers;
    const editedCount = answersToReview.filter((a) =>
      session.allAnswers.find((b) => b.question === a.question && b.answer !== a.answer)
    ).length;

    return (
      <Shell wide>
        <div className="animate-fade-up max-w-2xl w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Review your spec
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              AI answered all {totalQuestions} questions based on your description. Edit any answer before generating.
            </p>
          </div>

          <div className="space-y-3 mb-24">
            {questions.map((q) => {
              const answer = answersToReview.find((a) => a.question === q.text);
              const original = session.allAnswers.find((a) => a.question === q.text);
              const isEdited = !!answer && !!original && answer.answer !== original.answer;

              return (
                <AnswerCard
                  key={q.id}
                  question={q}
                  answer={answer?.answer ?? ''}
                  isEdited={isEdited}
                  onSave={(questionText, newAnswer) =>
                    interview.updateReviewAnswer(questionText, newAnswer)
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Sticky footer */}
        <div
          className="fixed bottom-0 left-0 right-0 p-4 border-t"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {editedCount > 0 ? `${editedCount} answer${editedCount > 1 ? 's' : ''} edited` : 'All AI-generated — edit anything before building'}
            </p>
            <button
              onClick={handleGenerateSpec}
              disabled={isSubmittingReview}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              {isSubmittingReview ? (
                <span className="dot-pulse flex gap-1.5"><span /><span /><span /></span>
              ) : (
                <>
                  <Sparkles size={15} />
                  Generate spec
                </>
              )}
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ─── Legacy: per-question interview (fallback if batch fails) ────

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
                setAiAnswer('');
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

            {aiAnswer && (
              <div
                className="p-4 rounded-xl border text-sm animate-fade-down"
                style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent)', color: 'var(--color-text)' }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-accent)' }}>AI suggestion</p>
                <p className="whitespace-pre-wrap leading-relaxed">{aiAnswer}</p>
                <button type="button" onClick={handleAcceptAI} className="mt-3 text-xs font-medium underline" style={{ color: 'var(--color-accent)' }}>
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
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                {isGeneratingAnswer ? (
                  <span className="dot-pulse flex gap-1.5"><span /><span /><span /></span>
                ) : (
                  <><Sparkles size={15} />AI suggest</>
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
            className="rounded-xl border p-6 text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[60vh] leading-relaxed mb-6"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            {session.generatedSpec}
          </div>

          {/* Next step */}
          <div
            className="rounded-xl border p-4 mb-6"
            style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent)' }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Next step
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Paste this into your favorite AI creator —{' '}
              <span style={{ color: 'var(--color-text)' }}>Cursor, VS Code Copilot, Claude, ChatGPT, Bolt, v0,</span>{' '}or{' '}
              <span style={{ color: 'var(--color-text)' }}>Emergent</span> — and start building.
            </p>
          </div>

          <div className="flex items-center justify-between">
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

// ─── Shared shell ────────────────────────────────────

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'var(--color-bg)' }}
    >
      <Link
        href="/"
        className="fixed top-5 left-6 text-sm font-semibold"
        style={{ color: 'var(--color-text-muted)' }}
      >
        SpecifyThat
      </Link>
      <div className={wide ? 'w-full max-w-2xl' : undefined}>{children}</div>
    </div>
  );
}
