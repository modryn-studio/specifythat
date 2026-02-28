import type { Metadata } from 'next';
import Link from 'next/link';
import { Zap, FileText, Brain, FolderOpen, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'Why AI coding tools drift without context, what a context file does, and how SpecifyThat generates one in under 60 seconds — for Cursor, Claude Code, Copilot, Windsurf, and more.',
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Hero */}
      <section className="px-6 pt-24 pb-16 max-w-3xl mx-auto text-center animate-fade-up">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4"
          style={{ color: 'var(--color-text)' }}
        >
          Your AI coding tool has no idea what you&apos;re building
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
          Unless you tell it. That&apos;s the problem — and the fix takes 60 seconds.
        </p>
      </section>

      {/* Section 1: The problem */}
      <Section
        icon={<Brain size={20} />}
        heading="Two reasons AI drifts off course"
      >
        <p>
          <strong style={{ color: 'var(--color-text)' }}>First: no project context.</strong>{' '}
          Copilot, Cursor, Claude Code, Windsurf — they all start every session knowing nothing
          about <em>your</em> project. Without your stack, conventions, and architecture, they
          guess. Wrong frameworks. Inconsistent patterns. Code that looks right but isn&apos;t.
        </p>
        <p>
          <strong style={{ color: 'var(--color-text)' }}>Second: knowledge cutoff.</strong>{' '}
          Every AI model has a training cutoff date. That means it might suggest a library that
          has since changed its API, recommend a pattern the community has moved away from, or not
          know about a tool you&apos;re actively using. The model doesn&apos;t know what it doesn&apos;t know.
        </p>
        <p>
          Both problems have the same fix: a context file that tells your AI exactly what
          you&apos;re using, how your project is structured, and what matters before it writes
          a single line of code.
        </p>
      </Section>

      {/* Section 2: The file */}
      <Section
        icon={<FileText size={20} />}
        heading="What a context file does"
      >
        <p>
          Every major AI coding tool can read a context file at the start of every session.
          The file contains your tech stack, architecture decisions, coding conventions, project
          structure, and anything else that keeps the AI aligned with what you&apos;re actually building.
        </p>
        <p>
          Think of it as onboarding for your AI — the briefing a new developer would need on day
          one: what&apos;s this built with, how is it structured, what are the rules. Except your
          AI reads it every single time.
        </p>
        <p>
          SpecifyThat doesn&apos;t generate a spec or a PRD. It generates that file — the context
          your tool needs <em>before</em> you start prompting.
        </p>
      </Section>

      {/* Section 3: The process */}
      <Section
        icon={<Zap size={20} />}
        heading="How SpecifyThat works"
      >
        <div className="space-y-4">
          <Step number={1} title="Describe your project">
            A sentence or two is enough. Paste a doc if you have one. AI uses this to
            understand the shape of what you&apos;re building.
          </Step>
          <Step number={2} title="AI figures out the rest">
            Behind the scenes, AI works through 13 strategic questions — stack, architecture,
            users, constraints, non-goals. You get a review screen with everything pre-filled.
            Adjust anything that&apos;s off. Most people change nothing.
          </Step>
          <Step number={3} title="Get your file">
            SpecifyThat compiles the answers into a structured context file. Copy it, download
            it, drop it into your project. Your AI tool is now briefed.
          </Step>
        </div>
      </Section>

      {/* Section 4: Where to put it */}
      <Section
        id="where-to-put-the-file"
        icon={<FolderOpen size={20} />}
        heading="Where to put the file"
      >
        <p>
          The content SpecifyThat generates works for any AI coding tool. The only difference
          is the filename and where it lives. Here&apos;s where each tool looks:
        </p>
        <div
          className="mt-4 rounded-lg border divide-y text-sm font-mono overflow-hidden"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        >
          {[
            { tool: 'GitHub Copilot',    path: '.github/copilot-instructions.md',  note: 'auto-loaded' },
            { tool: 'Cursor',            path: '.cursor/rules/context.mdc',         note: 'auto-loaded (AGENTS.md also works)' },
            { tool: 'Claude Code',       path: 'CLAUDE.md',                         note: 'project root, auto-loaded' },
            { tool: 'Windsurf',          path: '.windsurfrules',                    note: 'auto-loaded' },
            { tool: 'Bolt / Lovable / v0', path: 'Project context field',           note: 'paste on project creation' },
            { tool: 'Any other tool',    path: 'Attach or paste',                   note: 'include at the start of your session' },
          ].map(({ tool, path, note }) => (
            <div key={tool} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 py-3">
              <span className="shrink-0 w-40 text-xs" style={{ color: 'var(--color-text-muted)' }}>{tool}</span>
              <span className="font-semibold flex-1" style={{ color: 'var(--color-accent)' }}>{path}</span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{note}</span>
            </div>
          ))}
        </div>
        <p className="mt-4">
          For auto-loaded files, your tool picks it up without any configuration. For tools
          like Bolt and Lovable, paste the content into the project context field when you
          start a new project.
        </p>
      </Section>

      {/* Section 5: Under the hood */}
      <Section
        icon={<Eye size={20} />}
        heading="Under the hood"
      >
        <p>
          SpecifyThat runs entirely in your browser. Your answers are sent to our server
          only to generate AI responses — we never store, log, or inspect your content.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>API routes are thin proxies: validate rate limits → forward to AI → return response</li>
          <li>Your generated files save to <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>localStorage</code> — never our servers</li>
          <li>No accounts, no cookies, no tracking pixels beyond basic analytics</li>
          <li>Free to use — rate limits apply to keep the service available for everyone</li>
        </ul>
      </Section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <p className="text-lg font-medium mb-6" style={{ color: 'var(--color-text)' }}>
          Ready to try it?
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
          Free · No signup · Under 60 seconds
        </p>
      </section>
    </main>
  );
}

/* ── Reusable section wrapper ─────────────────────── */
function Section({
  id,
  icon,
  heading,
  children,
}: {
  id?: string;
  icon: React.ReactNode;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="px-6 pb-20 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div style={{ color: 'var(--color-accent)' }}>{icon}</div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
          {heading}
        </h2>
      </div>
      <div
        className="space-y-3 text-sm leading-relaxed"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {children}
      </div>
    </section>
  );
}

/* ── Numbered step ────────────────────────────────── */
function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
      >
        {number}
      </div>
      <div>
        <p className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>{title}</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{children}</p>
      </div>
    </div>
  );
}
