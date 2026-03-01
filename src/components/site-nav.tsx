'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteNav() {
  const pathname = usePathname();
  const isInterview = pathname.startsWith('/interview');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg)',
        // Slight backdrop blur so content scrolling under looks intentional
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Main nav bar */}
      <div className="mx-auto px-4 sm:px-6 flex items-center justify-between" style={{ maxWidth: '1200px', height: '56px' }}>

        {/* Left: brand lockup */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-sm tracking-tight"
          style={{ color: 'var(--color-text)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-dark.png" alt="" aria-hidden="true" width={20} height={20} className="mark-on-dark" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-light.png" alt="" aria-hidden="true" width={20} height={20} className="mark-on-light" />
          <span className="hidden sm:inline">SpecifyThat</span>
        </Link>

        {/* Right: desktop links + theme toggle */}
        {!isInterview && (
          <div className="flex items-center gap-1">
            {/* Desktop links */}
            <nav className="hidden sm:flex items-center gap-1 mr-2" aria-label="Main navigation">
              <Link
                href="/how-it-works"
                className="text-sm px-3 py-1.5 rounded-md transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                How it works
              </Link>
              <Link
                href="/specs"
                className="text-sm px-3 py-1.5 rounded-md transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                My files
              </Link>
            </nav>

            <div className="mr-1">
              <ThemeToggle />
            </div>

            <Link
              href="/interview"
              className="hidden sm:inline-flex text-sm px-3 py-1.5 rounded-md font-medium"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              Start building
            </Link>

            {/* Mobile: hamburger trigger */}
            <button
              className="sm:hidden ml-1 p-1.5 rounded-md transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              onClick={() => setMobileOpen(prev => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        )}

        {/* Interview: theme toggle only */}
        {isInterview && <ThemeToggle />}
      </div>

      {/* Mobile dropdown */}
      {!isInterview && mobileOpen && (
        <div
          id="mobile-menu"
          className="sm:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Link
            href="/how-it-works"
            className="text-sm px-3 py-2 rounded-md transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onClick={() => setMobileOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/specs"
            className="text-sm px-3 py-2 rounded-md transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onClick={() => setMobileOpen(false)}
          >
            My files
          </Link>
          <Link
            href="/interview"
            className="text-sm px-3 py-2 rounded-md font-medium mt-1"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
            onClick={() => setMobileOpen(false)}
          >
            Start building
          </Link>
          <button
            className="text-sm px-3 py-2 rounded-md text-left transition-colors mt-1"
            style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
            onClick={() => { setMobileOpen(false); window.dispatchEvent(new CustomEvent('open-email-modal')); }}
          >
            Get updates
          </button>
        </div>
      )}
    </header>
  );
}
