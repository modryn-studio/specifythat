'use client';

import { useState } from 'react';
import { analytics } from '@/lib/analytics';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

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
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <p style={{ fontSize: '13px', color: 'var(--color-accent)' }}>
        You&apos;re in. We&apos;ll email you when there&apos;s something worth sharing.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2" style={{ maxWidth: '320px' }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        style={{
          flex: 1,
          padding: '8px 12px',
          fontSize: '13px',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          background: 'transparent',
          color: 'var(--color-text)',
          outline: 'none',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
      />
      <button
        type="submit"
        disabled={state === 'submitting'}
        style={{
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#fff',
          background: 'var(--color-accent)',
          border: 'none',
          borderRadius: '6px',
          cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
          opacity: state === 'submitting' ? 0.7 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {state === 'submitting' ? 'Joining...' : 'Get updates'}
      </button>
      {state === 'error' && (
        <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>
          Something went wrong. Try again.
        </p>
      )}
    </form>
  );
}
