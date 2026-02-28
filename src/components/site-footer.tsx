'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { EmailModal } from '@/components/email-modal';

export function SiteFooter() {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  // Hide footer during interview — zero distraction
  if (pathname.startsWith('/interview')) return null;

  return (
    <>
      <footer
        className="px-6 py-8 border-t"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: brand + tagline */}
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              SpecifyThat
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Context files for AI coding tools.
            </p>
          </div>

          {/* Center: links */}
          <nav className="flex items-center gap-5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Link href="/how-it-works" className="hover:underline">How it works</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </nav>

          {/* Right: get updates + copyright */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--color-accent)' }}
            >
              <Bell size={12} />
              Get updates
            </button>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              © {new Date().getFullYear()} SpecifyThat
            </span>
          </div>
        </div>
      </footer>

      <EmailModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
