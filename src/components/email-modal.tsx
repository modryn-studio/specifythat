'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
}

export function EmailModal({ open, onClose }: EmailModalProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setState('idle');
      setEmail('');
      // Small delay so the DOM is painted before focus
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setState('submitting');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'newsletter', email: trimmed }),
      });
      if (!res.ok) throw new Error();
      setState('done');
      analytics.newsletterSignup();
    } catch (_err) {
      setState('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Get updates"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-xl border p-6 animate-fade-up"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {state === 'done' ? (
          <div className="text-center py-4">
            <p className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              You&apos;re in.
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              We&apos;ll email you when there&apos;s something worth sharing.
            </p>
          </div>
        ) : (
          <>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Get notified about new features
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              No spam. Only updates when we ship something worth talking about.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none transition-colors"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
              <button
                type="submit"
                disabled={state === 'submitting'}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: 'var(--color-accent)',
                  color: '#fff',
                  cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
                  opacity: state === 'submitting' ? 0.7 : 1,
                }}
              >
                {state === 'submitting' ? 'Joining...' : 'Get updates'}
              </button>
              {state === 'error' && (
                <p className="text-xs text-center" style={{ color: 'var(--color-error)' }}>
                  Something went wrong. Try again.
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
