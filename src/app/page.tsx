import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Zap, Lock, RefreshCw, ArrowRight } from 'lucide-react';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: site.ogTitle,
  description: site.ogDescription,
};

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center animate-fade-up">
        <p className="text-xs font-medium uppercase tracking-widest mb-6" style={{ color: 'var(--color-accent)' }}>
          Free · No signup · Runs in 60 seconds
        </p>

        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 max-w-3xl"
          style={{ color: 'var(--color-text)' }}
        >
          Get the context file your AI coding tool needs
        </h1>

        <p className="text-lg sm:text-xl mb-10 max-w-xl" style={{ color: 'var(--color-text-muted)' }}>
          Your AI coding tool drifts off course without context. Describe your idea — get the file that fixes that in 60 seconds.
        </p>

        <Link
          href="/interview"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-base transition-colors"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          <Zap size={18} />
          Start building
        </Link>

        <p className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Your prompts never leave your device.
        </p>
      </section>

      {/* Feature cards */}
      <section className="px-6 pb-24 max-w-4xl mx-auto w-full">
        <div className="grid sm:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Zap size={20} />}
            title="60 seconds"
            body="Describe your idea. AI handles all 13 questions. Your file is ready before you'd have started an outline."
          />
          <FeatureCard
            icon={<FileText size={20} />}
            title="Paste-ready output"
            body="A context file your AI tool actually reads. Works with Copilot, Cursor, Claude Code, Windsurf, and more."
          />
          <FeatureCard
            icon={<Lock size={20} />}
            title="Private by design"
            body="Nothing stored on our servers. Your descriptions, answers, and generated files never leave your browser."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-24 max-w-3xl mx-auto w-full">
        <h2 className="text-xl font-semibold mb-8 text-center" style={{ color: 'var(--color-text)' }}>
          How it works
        </h2>
        <div className="space-y-6">
          {[
            ['Describe your project', 'A sentence or two is enough. Or attach a doc if you have one.'],
            ['AI fills in the answers', 'We run through 13 structured questions. AI auto-fills almost all of them based on your description. You review before generating.'],
            ['Get your file', 'Download or copy the finished context file. Drop it in your project and start building.'],
          ].map(([title, desc], i) => (
            <div key={i} className="flex gap-4">
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
              >
                {i + 1}
              </div>
              <div>
                <p className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>{title}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/how-it-works"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: 'var(--color-accent)' }}
        >
          Want the full picture? See how it works
          <ArrowRight size={14} />
        </Link>
      </section>

      {/* CTA bottom */}
      <section className="pb-24 flex flex-col items-center gap-4 animate-fade-up animate-delay-200">
        <Link
          href="/interview"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-base transition-colors"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          Start building
        </Link>
        <Link
          href="/specs"
          className="inline-flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <RefreshCw size={14} />
          View saved files
        </Link>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div
      className="p-6 rounded-xl border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="mb-3" style={{ color: 'var(--color-accent)' }}>{icon}</div>
      <p className="font-semibold mb-2 text-sm" style={{ color: 'var(--color-text)' }}>{title}</p>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{body}</p>
    </div>
  );
}
