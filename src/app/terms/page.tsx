import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for SpecifyThat.',
};

export default function TermsPage() {
  return (
    <main
      className="min-h-dvh px-6 py-24 max-w-3xl mx-auto"
      style={{ background: 'var(--color-bg)' }}
    >
      <h1
        className="text-3xl font-bold tracking-tight mb-8"
        style={{ color: 'var(--color-text)' }}
      >
        Terms of Use
      </h1>

      <div
        className="space-y-6 text-sm leading-relaxed"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <p>
          <strong style={{ color: 'var(--color-text)' }}>Last updated:</strong>{' '}
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <Section heading="The basics">
          <p>
            SpecifyThat is a free tool that generates context files for AI coding tools.
            By using it, you agree to these terms.
          </p>
        </Section>

        <Section heading="What you get">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Free access to the context file generator</li>
            <li>Files generated are yours — use them however you want</li>
            <li>No account required, no commitments</li>
          </ul>
        </Section>

        <Section heading="Fair use">
          <p>
            We apply rate limits to keep the service available for everyone. If you hit a
            rate limit, wait and try again later. Don&apos;t attempt to circumvent limits
            or abuse the service.
          </p>
        </Section>

        <Section heading="Your content">
          <p>
            You own everything you create with SpecifyThat. Your project descriptions,
            answers, and generated files belong to you. We don&apos;t claim any rights to
            your content.
          </p>
          <p>
            We don&apos;t store your content on our servers. See our{' '}
            <a
              href="/privacy"
              className="underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Privacy Policy
            </a>{' '}
            for details.
          </p>
        </Section>

        <Section heading="AI-generated output">
          <p>
            Context files are generated using AI. While we design prompts to produce
            accurate, useful output, we can&apos;t guarantee the generated content is
            error-free. Review your context file before using it.
          </p>
        </Section>

        <Section heading="Service availability">
          <p>
            SpecifyThat is provided &quot;as is&quot;. We aim for high availability but
            don&apos;t guarantee uptime. The service may change, pause, or end at any time.
          </p>
        </Section>

        <Section heading="Liability">
          <p>
            SpecifyThat is a free tool provided without warranty. We&apos;re not liable for
            any damages arising from your use of the service or the generated files.
          </p>
        </Section>

        <Section heading="Changes">
          <p>
            We may update these terms. Continued use after changes means you accept the
            updated terms.
          </p>
        </Section>

        <Section heading="Contact">
          <p>
            Questions? Use the feedback widget in the app.
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
        {heading}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
