'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { analytics } from '@/lib/analytics';

type WidgetState = 'idle' | 'open' | 'submitting' | 'done';

/**
 * Feedback widget — desktop: filing-cabinet side tab that slides out from the
 * right edge. Mobile: slide-up bottom sheet triggered by FeedbackTrigger.
 *
 * Wire into layout.tsx:
 *   import FeedbackWidget from '@/components/feedback-widget';
 *   <FeedbackWidget /> as last child inside <body>
 *
 * Wire FeedbackTrigger into the footer for mobile open access:
 *   import { FeedbackTrigger } from '@/components/feedback-trigger';
 *   <FeedbackTrigger />
 */
export default function FeedbackWidget() {
  const [state, setState] = useState<WidgetState>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state === 'open') textareaRef.current?.focus();
  }, [state]);

  // Open via custom event — used by the mobile footer trigger
  useEffect(() => {
    const handler = () => setState('open');
    window.addEventListener('open-feedback', handler);
    return () => window.removeEventListener('open-feedback', handler);
  }, []);

  // Auto-collapse 3s after success
  useEffect(() => {
    if (state === 'done') {
      collapseTimer.current = setTimeout(() => {
        setState('idle');
        setMessage('');
        setEmail('');
      }, 3000);
    }
    return () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, [state]);

  const close = () => setState('idle');

  const handleSubmit = async () => {
    if (!message.trim() || state === 'submitting') return;
    setState('submitting');
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback',
          message: message.trim(),
          email: email.trim() || undefined,
          page: window.location.pathname,
        }),
      });

      if (!res.ok) throw new Error('Server error');
      setState('done');
      analytics.feedbackSubmit();
    } catch {
      setError('Something went wrong. Try again.');
      setState('open');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
    if (e.key === 'Escape') close();
  };

  const isOpen = state === 'open' || state === 'submitting' || state === 'done';

  // Shared form body used in both mobile and desktop panels
  const formBody = (
    <div className="p-4">
      {state === 'done' ? (
        <p className="font-mono text-sm">Thanks. Noted. 👊</p>
      ) : (
        <>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's broken? What's missing? What do you need?"
            disabled={state === 'submitting'}
            rows={4}
            className="w-full resize-none border border-(--color-border) bg-transparent p-3 font-mono text-sm transition-colors outline-none placeholder:text-(--color-muted) focus:border-(--color-accent) disabled:opacity-50"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Email (optional — for a reply)"
            disabled={state === 'submitting'}
            className="mt-2 w-full border border-(--color-border) bg-transparent p-3 font-mono text-xs transition-colors outline-none placeholder:text-(--color-muted) focus:border-(--color-accent) disabled:opacity-50"
          />
          {error && <p className="mt-2 font-mono text-xs text-red-500">{error}</p>}
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || state === 'submitting'}
              className="flex items-center gap-2 bg-(--color-accent) px-4 py-2 font-mono text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={12} />
              {state === 'submitting' ? 'Sending...' : 'Send'}
            </button>
          </div>
        </>
      )}
    </div>
  );

  const panelHeader = (
    <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
      <span className="font-mono text-xs font-bold tracking-widest uppercase">Feedback</span>
      <button
        onClick={close}
        className="-mr-1 p-1 text-(--color-muted) transition-colors hover:text-(--color-text)"
        aria-label="Close"
      >
        <X size={14} />
      </button>
    </div>
  );

  return (
    <>
      {/* ── Mobile: slide-up sheet from bottom ── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Tap-outside backdrop */}
        {isOpen && <div className="fixed inset-0 -z-10 bg-black/20" onClick={close} />}
        <div className="border-t-2 border-(--color-border) bg-(--color-surface) shadow-2xl">
          {panelHeader}
          {formBody}
        </div>
      </div>

      {/* ── Desktop: filing-cabinet drawer ── */}
      {/* Whole assembly translates together. Closed = shifted right by panel width (w-72 = 288px),
          leaving only the tab visible at the viewport edge. Open = translate-x-0. */}
      <div
        className={`fixed top-1/2 right-0 z-50 hidden -translate-y-1/2 items-start transition-transform duration-300 ease-out md:flex ${
          isOpen ? 'translate-x-0' : 'translate-x-72'
        }`}
      >
        {/* Tab — leftmost, always the visible "handle" */}
        <button
          onClick={() => setState(isOpen ? 'idle' : 'open')}
          className="flex shrink-0 items-center border-y-2 border-l-2 border-(--color-border) bg-(--color-surface) px-1.5 py-3 font-mono text-[0.6rem] font-bold tracking-widest uppercase text-(--color-accent) shadow-md transition-colors hover:bg-(--color-border)"
          aria-label={isOpen ? 'Close feedback' : 'Open feedback'}
        >
          <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Feedback</span>
        </button>
        {/* Panel — slides in with the tab */}
        <div className="w-72 border-2 border-(--color-border) bg-(--color-surface) shadow-xl">
          {panelHeader}
          {formBody}
        </div>
      </div>
    </>
  );
}
