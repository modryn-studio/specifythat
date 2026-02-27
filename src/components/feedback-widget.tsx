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
          // Silently include the page — useful for routing feedback without extra UI
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
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
      {/* Card */}
      {isOpen && (
        <div className="border-border bg-background w-72 border-2 shadow-xl">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <span className="font-mono text-xs font-bold tracking-widest uppercase">
              Feedback
            </span>
            <button
              onClick={close}
              className="text-muted-foreground hover:text-foreground -mr-1 p-1 transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
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
                  placeholder="What are you building? What's broken? What's missing?"
                  disabled={state === 'submitting'}
                  rows={4}
                  className="border-border placeholder:text-muted-foreground focus:border-amber w-full resize-none border bg-transparent p-3 font-mono text-sm outline-none transition-colors disabled:opacity-50"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Email (optional — for a reply)"
                  disabled={state === 'submitting'}
                  className="border-border placeholder:text-muted-foreground focus:border-amber mt-2 w-full border bg-transparent p-3 font-mono text-xs outline-none transition-colors disabled:opacity-50"
                />
                {error && <p className="text-destructive mt-2 font-mono text-xs">{error}</p>}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || state === 'submitting'}
                    className="bg-amber hover:bg-amber/90 disabled:bg-muted flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold text-white transition-colors disabled:cursor-not-allowed disabled:text-white/50"
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
        className="bg-amber hover:bg-amber/90 flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-bold text-white shadow-lg transition-colors"
        aria-label={isOpen ? 'Close feedback' : 'Open feedback'}
      >
        <MessageSquare size={14} />
        Feedback
      </button>
    </div>
  );
}
