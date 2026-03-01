'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Github, Twitter } from 'lucide-react';
import { EmailModal } from '@/components/email-modal';
import { FeedbackTrigger } from '@/components/feedback-trigger';
import { site } from '@/config/site';

export function SiteFooter() {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  // Allow the mobile nav's 'Get updates' button to open the modal via event
  useEffect(() => {
    const handler = () => setShowModal(true);
    window.addEventListener('open-email-modal', handler);
    return () => window.removeEventListener('open-email-modal', handler);
  }, []);

  // Hide footer during interview — zero distraction
  if (pathname.startsWith('/interview')) return null;

  return (
    <>
      <footer
        className="px-4 sm:px-6 py-8 border-t"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
      >
        <div className="mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ maxWidth: '1200px' }}>
          {/* Left: brand lockup + tagline */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-dark.png" alt="" aria-hidden="true" width={22} height={22} className="mark-on-dark" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-light.png" alt="" aria-hidden="true" width={22} height={22} className="mark-on-light" />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                SpecifyThat
              </p>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Context files for AI coding tools.
            </p>
          </div>

          {/* Center: links + social */}
          <div className="flex flex-col gap-3">
            <nav className="flex items-center gap-5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <Link href="/how-it-works" className="hover:underline">How it works</Link>
              <Link href="/privacy" className="hover:underline">Privacy</Link>
              <Link href="/terms" className="hover:underline">Terms</Link>
              <FeedbackTrigger />
            </nav>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <a href={site.social.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                <Twitter size={12} />X
              </a>
              <a href={site.social.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                <Github size={12} />GitHub
              </a>
              <a href={site.social.devto} target="_blank" rel="noopener noreferrer" className="hover:underline">Dev.to</a>
              <a href={site.social.shipordie} target="_blank" rel="noopener noreferrer" className="hover:underline">Ship or Die</a>
            </div>
          </div>

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
              © {new Date().getFullYear()} SpecifyThat ·{' '}
              <a
                href="https://modrynstudio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Modryn Studio
              </a>
            </span>
          </div>
        </div>
      </footer>

      <EmailModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
