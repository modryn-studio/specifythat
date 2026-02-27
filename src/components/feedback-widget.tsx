'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { analytics } from '@/lib/analytics';

type WidgetState = 'idle' | 'open' | 'submitting' | 'done';

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

  return (
    <div style={{ position: 'fixed', right: '24px', bottom: '24px', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
      {/* Card */}
      {isOpen && (
        <div
          style={{
            width: '288px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: 'var(--color-text)' }}>
              Feedback
            </span>
            <button
              onClick={close}
              aria-label="Close"
              style={{ padding: '4px', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
          <div style={{ padding: '16px' }}>
            {state === 'done' ? (
              <p style={{ fontSize: '14px', color: 'var(--color-text)' }}>Thanks. Noted. 👊</p>
            ) : (
              <>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What's broken? What's missing? What do you want?"
                  disabled={state === 'submitting'}
                  rows={4}
                  style={{
                    width: '100%',
                    resize: 'none',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
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
                    borderRadius: '8px',
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
                {error && (
                  <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-error)' }}>{error}</p>
                )}
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
                      borderRadius: '8px',
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
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setState(isOpen ? 'idle' : 'open')}
        aria-label={isOpen ? 'Close feedback' : 'Open feedback'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#fff',
          background: 'var(--color-accent)',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <MessageSquare size={14} />
        Feedback
      </button>
    </div>
  );
}
