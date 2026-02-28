'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteNav() {
  const pathname = usePathname();
  const isInterview = pathname.startsWith('/interview');

  return (
    <nav
      className="px-6 flex items-center justify-between border-b"
      style={{
        height: '48px',
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg)',
      }}
    >
      {/* Left: brand lockup */}
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold text-sm tracking-tight"
        style={{ color: 'var(--color-text)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logomark.svg" alt="" aria-hidden="true" width={20} height={20} className="mark-logo" />
        SpecifyThat
      </Link>

      {/* Right: contextual links + theme toggle */}
      {!isInterview && (
        <div className="flex items-center gap-4">
          <Link
            href="/how-it-works"
            className="text-sm transition-colors hidden sm:inline"
            style={{ color: 'var(--color-text-muted)' }}
          >
            How it works
          </Link>
          <Link
            href="/specs"
            className="text-sm transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            My files
          </Link>
          <Link
            href="/interview"
            className="text-sm px-3 py-1.5 rounded-md font-medium"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            Start building
          </Link>
          <ThemeToggle />
        </div>
      )}

      {/* Interview: theme toggle only, minimal chrome */}
      {isInterview && (
        <ThemeToggle />
      )}
    </nav>
  );
}
