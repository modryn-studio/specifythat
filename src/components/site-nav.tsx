'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteNav() {
  const pathname = usePathname();
  const isInterview = pathname.startsWith('/interview');
  const isHome = pathname === '/';

  return (
    <nav
      className="px-6 flex items-center justify-between border-b"
      style={{
        height: '48px',
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg)',
      }}
    >
      {/* Left: brand */}
      <Link
        href="/"
        className="font-semibold text-sm tracking-tight"
        style={{ color: 'var(--color-text)' }}
      >
        SpecifyThat
      </Link>

      {/* Right: contextual links + theme toggle */}
      {!isInterview && (
        <div className="flex items-center gap-4">
          <Link
            href="/specs"
            className="text-sm transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            My files
          </Link>
          {isHome && (
            <Link
              href="/interview"
              className="text-sm px-3 py-1.5 rounded-md font-medium"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              Start a spec
            </Link>
          )}
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
