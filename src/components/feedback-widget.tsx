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
    <div style={{ padding: '16px' }}>
      {state === 'done' ? (
        <p style={{ fontSize: '13px', color: 'var(--color-text)' }}>Thanks. Noted. 👊</p>
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
            style={{
              width: '100%',
              resize: 'none',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              padding: '12px',
              fontSize: '13px',
              color: 'var(--color-text)',
              outline: 'none',
              opacity: state === 'submitting' ? 0.5 : 1,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Email (optional — for a reply)"
            disabled={state === 'submitting'}
            style={{
              width: '100%',
              marginTop: '8px',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              padding: '10px 12px',
              fontSize: '12px',
              color: 'var(--color-text)',
              outline: 'none',
              opacity: state === 'submitting' ? 0.5 : 1,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          />
          {error && <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-error, #ef4444)' }}>{error}</p>}
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || state === 'submitting'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#fff',
                background: !message.trim() || state === 'submitting' ? 'var(--color-text-muted)' : 'var(--color-accent)',
                border: 'none',
                cursor: !message.trim() || state === 'submitting' ? 'not-allowed' : 'pointer',
              }}
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text)' }}>Feedback</span>
      <button
        onClick={close}
        aria-label="Close"
        style={{ padding: '4px', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
      >
        <X size={14} />
      </button>
    </div>
  );

  return (
    <>
      {/* ── Mobile: slide-up sheet from bottom, hidden on md+ ── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {isOpen && <div className="fixed inset-0 -z-10 bg-black/20" onClick={close} />}
        <div style={{ borderTop: '2px solid var(--color-border)', background: 'var(--color-bg)', boxShadow: '0 -8px 30px rgba(0,0,0,0.2)' }}>
          {panelHeader}
          {formBody}
        </div>
      </div>

      {/* ── Desktop: filing-cabinet drawer from right edge, hidden on mobile ── */}
      {/* Whole assembly translates together. Closed = shifted right by panel width (288px),
          leaving only the tab visible at the viewport edge. Open = translate-x-0. */}
      <div
        className={`fixed top-1/2 right-0 z-50 hidden -translate-y-1/2 items-start transition-transform duration-300 ease-out md:flex ${
          isOpen ? 'translate-x-0' : 'translate-x-72'
        }`}
      >
        {/* Tab — leftmost, always the visible "handle" */}
        <button
          onClick={() => setState(isOpen ? 'idle' : 'open')}
          aria-label={isOpen ? 'Close feedback' : 'Open feedback'}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 6px',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            background: 'var(--color-bg)',
            border: '2px solid var(--color-border)',
            borderRight: 'none',
            cursor: 'pointer',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Feedback</span>
        </button>
        {/* Panel — slides in with the tab */}
        <div style={{ width: '288px', border: '2px solid var(--color-border)', background: 'var(--color-bg)', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
          {panelHeader}
          {formBody}
        </div>
      </div>
    </>
  );
}
