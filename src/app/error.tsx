'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in the future
    console.error(error);
  }, [error]);

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--color-bg)' }}
    >
      <h1
        className="text-2xl font-bold tracking-tight mb-3"
        style={{ color: 'var(--color-text)' }}
      >
        Something went wrong
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        An unexpected error occurred. You can try again or go back home.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="text-sm px-4 py-2 rounded-md font-medium"
          style={{ background: 'var(--color-accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm px-4 py-2 rounded-md"
          style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
